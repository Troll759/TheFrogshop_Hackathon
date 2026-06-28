import { IntegreatApiService } from "../services/integreatApiService.js";
import type { IntegreatContentItem, IntegreatRegion } from "../services/integreatApiService.js";
import { normalizeText, stripHtml, truncateText } from "../utils/text.js";
import type {
  Agent,
  IntegreatAgentInput,
  IntegreatResult,
  IntegreatSnippet,
  IntegreatSnippetType,
} from "./types.js";

const DEFAULT_LANGUAGE = "de";
const MAX_SNIPPETS = 8;
const MIN_QUERY_TOKEN_LENGTH = 3;

const LANGUAGE_CODES: Record<string, string> = {
  arabic: "ar",
  ar: "ar",
  deutsch: "de",
  german: "de",
  de: "de",
  english: "en",
  englisch: "en",
  en: "en",
  french: "fr",
  französisch: "fr",
  francais: "fr",
  fr: "fr",
  persian: "fa",
  farsi: "fa",
  fa: "fa",
  russian: "ru",
  russisch: "ru",
  ru: "ru",
  ukrainian: "uk",
  ukrainisch: "uk",
  uk: "uk",
  turkish: "tr",
  türkisch: "tr",
  turkisch: "tr",
  tr: "tr",
};

const STOP_WORDS = new Set([
  "about",
  "and",
  "are",
  "bei",
  "bitte",
  "can",
  "der",
  "die",
  "das",
  "for",
  "from",
  "how",
  "ich",
  "ist",
  "mit",
  "the",
  "und",
  "was",
  "wer",
  "wie",
  "where",
  "you",
]);

const SCHOOL_PREFERRED_TERMS = ["school", "education", "registration", "children 6 to 15", "schule", "bildung", "anmeldung"];
const SCHOOL_DRIFT_TERMS = ["daycare", "childcare", "kindergarten", "kita", "family", "familie"];
const ADDRESS_REGISTRATION_TERMS = [
  "anmeldung",
  "address registration",
  "register address",
  "residence registration",
  "bürgerbüro",
  "burgerburo",
  "registration office",
  "wohn",
  "melde",
];

const INTENT_RELEVANCE_TERMS: Record<string, string[]> = {
  school_registration: SCHOOL_PREFERRED_TERMS,
  residence_permit: ["residence", "permit", "visa", "aufenthalt", "aufenthaltstitel"],
  housing: ["housing", "apartment", "accommodation", "shelter", "wohnung", "unterkunft"],
  address_registration: ADDRESS_REGISTRATION_TERMS,
  event_search: ["event", "veranstaltung", "termin"],
  location_search: ["location", "address", "office", "amt", "behörde", "beratung"],
};

export class IntegreatAgent implements Agent<IntegreatAgentInput, IntegreatResult> {
  constructor(private readonly integreatApi = new IntegreatApiService()) {}

  async execute(input: IntegreatAgentInput): Promise<IntegreatResult> {
    const regions = await this.integreatApi.getRegions();
    const region = this.detectRegion(input, regions);
    const notes: string[] = [];

    if (!region) {
      return {
        language: this.detectRequestedLanguage(input) ?? DEFAULT_LANGUAGE,
        snippets: [],
        notes: ["No Integreat region could be detected from the request."],
      };
    }

    const requestedLanguage = this.detectRequestedLanguage(input);
    const language = this.resolveLanguage(region, requestedLanguage);

    if (language !== requestedLanguage && requestedLanguage) {
      notes.push(`Requested language is not available for ${region.name}; using ${language}.`);
    }

    const [pages, locations, events] = await Promise.all([
      this.integreatApi.getPages(region.path, language),
      this.integreatApi.getLocations(region.path, language),
      this.integreatApi.getEvents(region.path, language),
    ]);

    const allSnippets = [
      ...this.toSnippets("page", pages),
      ...this.toSnippets("location", locations),
      ...this.toSnippets("event", events),
    ];
    const rankedSnippets = this.rankSnippets(input, allSnippets);
    let snippets = this.validateSources(input, rankedSnippets, region.path, language);

    if (snippets.length === 0 && this.hasAddressRegistrationContext(input)) {
      const broadRankedSnippets = this.rankAddressRegistrationSnippets(allSnippets);
      snippets = this.validateSources(input, broadRankedSnippets, region.path, language);

      if (snippets.length > 0) {
        notes.push("Used broader address registration search terms for Integreat retrieval.");
      }
    }

    if (rankedSnippets.length > 0 && snippets.length === 0) {
      notes.push("Retrieved Integreat content was filtered out by the source accuracy guard.");
    }

    return {
      region: {
        id: region.id,
        name: region.name,
        path: region.path,
      },
      language,
      snippets,
      notes,
    };
  }

  private detectRegion(input: IntegreatAgentInput, regions: IntegreatRegion[]): IntegreatRegion | undefined {
    const regionHint = input.region.city ?? input.region.region ?? input.region.country;
    const searchText = normalizeText([input.request.message, regionHint].filter(Boolean).join(" "));

    return regions
      .filter((region) => region.live)
      .map((region) => ({
        region,
        score: this.scoreRegion(region, searchText),
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.region;
  }

  private scoreRegion(region: IntegreatRegion, searchText: string): number {
    const names = [
      region.name,
      region.path,
      region.prefix,
      region.name_without_prefix,
      ...Object.keys(region.aliases ?? {}),
    ].filter((value): value is string => Boolean(value));

    return names.reduce((score, name) => {
      const normalizedName = normalizeText(name);

      if (searchText.includes(normalizedName)) {
        return score + normalizedName.length;
      }

      return score;
    }, 0);
  }

  private detectRequestedLanguage(input: IntegreatAgentInput): string | undefined {
    const profileLanguage = input.profile.language;

    if (profileLanguage) {
      const normalizedLanguage = normalizeText(profileLanguage);

      return LANGUAGE_CODES[normalizedLanguage] ?? normalizedLanguage;
    }

    return undefined;
  }

  private resolveLanguage(region: IntegreatRegion, requestedLanguage: string | undefined): string {
    const availableLanguages = new Set(region.languages.map((language) => language.code));

    if (requestedLanguage && availableLanguages.has(requestedLanguage)) {
      return requestedLanguage;
    }

    if (availableLanguages.has(DEFAULT_LANGUAGE)) {
      return DEFAULT_LANGUAGE;
    }

    return region.languages[0]?.code ?? DEFAULT_LANGUAGE;
  }

  private toSnippets(type: IntegreatSnippetType, items: IntegreatContentItem[]): IntegreatSnippet[] {
    return items.map((item) => {
      const text = truncateText(stripHtml(item.excerpt || item.content || ""), 700);
      const metadata = this.buildMetadata(item);

      return {
        type,
        title: item.title,
        text,
        url: item.url,
        path: item.path,
        score: 0,
        ...(item.last_updated ? { lastUpdated: item.last_updated } : {}),
        ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
      };
    });
  }

  private buildMetadata(item: IntegreatContentItem): Record<string, string> {
    const metadata: Record<string, string> = {};

    if (item.category?.name) {
      metadata.category = item.category.name;
    }

    if (item.location?.name) {
      metadata.location = item.location.name;
    }

    if (item.location?.address) {
      metadata.address = item.location.address;
    }

    if (item.event?.start) {
      metadata.start = item.event.start;
    }

    if (item.event?.end) {
      metadata.end = item.event.end;
    }

    return metadata;
  }

  private rankSnippets(input: IntegreatAgentInput, snippets: IntegreatSnippet[]): IntegreatSnippet[] {
    const queryTokens = this.extractQueryTokens(this.buildSearchText(input));
    const schoolContext = this.hasSchoolContext(input);

    return snippets
      .map((snippet) => ({
        ...snippet,
        score: this.scoreSnippet(snippet, queryTokens, schoolContext),
      }))
      .filter((snippet) => snippet.score > 0 || queryTokens.length === 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_SNIPPETS);
  }

  private buildSearchText(input: IntegreatAgentInput): string {
    return [
      input.request.message,
      input.intent.intent,
      input.profile.topic,
      input.profile.needs.join(" "),
      input.profile.age !== undefined ? `user age ${input.profile.age}` : undefined,
      input.profile.childAge !== undefined ? `child age ${input.profile.childAge}` : undefined,
      input.profile.childAges?.length ? `child ages ${input.profile.childAges.join(" ")}` : undefined,
      input.profile.legalStatus ? `legal status ${input.profile.legalStatus}` : undefined,
      input.searchQueries?.join(" "),
      this.hasSchoolContext(input) ? "school registration education children 6 to 15" : undefined,
      this.hasAddressRegistrationContext(input)
        ? "Anmeldung address registration register address residence registration Bürgerbüro registration office"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  }

  private rankAddressRegistrationSnippets(snippets: IntegreatSnippet[]): IntegreatSnippet[] {
    return snippets
      .map((snippet) => ({
        ...snippet,
        score: this.scoreAddressRegistrationSnippet(snippet),
      }))
      .filter((snippet) => snippet.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_SNIPPETS);
  }

  private extractQueryTokens(message: string): string[] {
    return normalizeText(message)
      .split(/\W+/)
      .filter((token) => token.length >= MIN_QUERY_TOKEN_LENGTH)
      .filter((token) => !STOP_WORDS.has(token));
  }

  private scoreSnippet(snippet: IntegreatSnippet, queryTokens: string[], schoolContext: boolean): number {
    const normalizedTitle = normalizeText(snippet.title);
    const normalizedPath = normalizeText(snippet.path);
    const searchableText = normalizeText(`${snippet.title} ${snippet.path} ${snippet.text}`);

    const tokenScore = queryTokens.reduce((score, token) => {
      if (!searchableText.includes(token)) {
        return score;
      }

      return score + (normalizedTitle.includes(token) || normalizedPath.includes(token) ? 3 : 1);
    }, 0);

    if (!schoolContext) {
      return tokenScore;
    }

    const preferredBoost = SCHOOL_PREFERRED_TERMS.reduce((score, term) => {
      const normalizedTerm = normalizeText(term);
      return normalizedTitle.includes(normalizedTerm) || normalizedPath.includes(normalizedTerm) ? score + 8 : score;
    }, 0);
    const driftPenalty = SCHOOL_DRIFT_TERMS.reduce((score, term) => {
      const normalizedTerm = normalizeText(term);
      return normalizedTitle.includes(normalizedTerm) || normalizedPath.includes(normalizedTerm) ? score + 5 : score;
    }, 0);

    return tokenScore + preferredBoost - driftPenalty;
  }

  private hasSchoolContext(input: IntegreatAgentInput): boolean {
    const text = normalizeText([
      input.request.message,
      input.intent.intent,
      input.profile.topic,
      input.profile.needs.join(" "),
    ].filter(Boolean).join(" "));
    const childAge = input.profile.childAge;
    const childAges = input.profile.childAges ?? [];

    return (
      text.includes("school") ||
      text.includes("schule") ||
      text.includes("registration") ||
      text.includes("einschulung") ||
      text.includes("register my child") ||
      (typeof childAge === "number" && childAge >= 6 && childAge <= 15) ||
      childAges.some((age) => age >= 6 && age <= 15)
    );
  }

  private hasAddressRegistrationContext(input: IntegreatAgentInput): boolean {
    const text = normalizeText([
      input.request.message,
      input.intent.intent,
      input.profile.topic,
      input.profile.needs.join(" "),
    ].filter(Boolean).join(" "));

    return (
      text.includes("address_registration") ||
      text.includes("register my address") ||
      text.includes("address registration") ||
      text.includes("register address") ||
      text.includes("residence registration") ||
      text.includes("anmeldung")
    );
  }

  private scoreAddressRegistrationSnippet(snippet: IntegreatSnippet): number {
    const normalizedTitleAndPath = normalizeText(`${snippet.title} ${snippet.path}`);

    return ADDRESS_REGISTRATION_TERMS.reduce((score, term) => {
      const normalizedTerm = normalizeText(term);
      return normalizedTitleAndPath.includes(normalizedTerm) ? score + 10 : score;
    }, 0);
  }

  private validateSources(
    input: IntegreatAgentInput,
    snippets: IntegreatSnippet[],
    regionSlug: string,
    language: string,
  ): IntegreatSnippet[] {
    return snippets.filter((snippet) => {
      const sourcePath = this.getSourcePath(snippet);

      return (
        sourcePath.includes(`/${normalizeText(regionSlug)}/`) &&
        sourcePath.includes(`/${normalizeText(language)}/`) &&
        this.isRelevantToIntent(input, snippet)
      );
    });
  }

  private getSourcePath(snippet: IntegreatSnippet): string {
    try {
      return normalizeText(new URL(snippet.url).pathname);
    } catch {
      return normalizeText(snippet.path);
    }
  }

  private isRelevantToIntent(input: IntegreatAgentInput, snippet: IntegreatSnippet): boolean {
    const intentTerms = INTENT_RELEVANCE_TERMS[input.intent.intent] ?? this.extractQueryTokens(this.buildSearchText(input));
    const normalizedTitleAndPath = normalizeText(`${snippet.title} ${snippet.path}`);

    if (intentTerms.length === 0) {
      return snippet.score > 0;
    }

    return intentTerms.some((term) => normalizedTitleAndPath.includes(normalizeText(term)));
  }
}
