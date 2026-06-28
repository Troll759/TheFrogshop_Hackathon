import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Compass, Home, Stethoscope, Briefcase, FileText, Accessibility, Baby, BadgeEuro, Languages, CalendarClock, Shield, MapPin, Pencil, Check, CornerDownLeftIcon, type LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GERMAN_CITIES } from "@/lib/german-cities";
import { getChatSession } from "@/lib/chat-session";
import {
  loadLegalProfile,
  saveLegalProfile,
  LEGAL_STATUS_OPTIONS,
  type LegalProfile,
} from "@/lib/legal-status";

const CITY_STORAGE_KEY = "integreat:city";
const REGION_STORAGE_KEY = "integreat:region";
const FROGMAN_API_URL =
  import.meta.env.VITE_FROGMAN_API_URL ?? "http://localhost:3000";
const FROGMAN_CHAT_URL =
  `${FROGMAN_API_URL.replace(/\/$/, "")}/api/chat`;

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "German", value: "de" },
];

type ChatStatus = "ready" | "submitted" | "streaming" | "error";

type UserChatMessage = {
  id: string;
  role: "user";
  text: string;
};

type AssistantChatMessage = {
  id: string;
  role: "assistant";
  response: FrogmanResponse;
};

type ChatMessage = UserChatMessage | AssistantChatMessage;

type ChatProfile = LegalProfile;

type RegionState = Record<string, unknown> & {
  city?: string;
};

type FrogmanSource =
  | string
  | {
      title?: string;
      url?: string;
      link?: string;
      source?: string;
    };

type FrogmanResponse = {
  mode?: "clarification" | "answer";
  answer?: string;
  questions?: string[];
  sources?: FrogmanSource[];
  suggestedQuestions?: string[];
};

type FrogmanData = FrogmanResponse & {
  profile?: Partial<ChatProfile> | null;
  region?: unknown;
};

type FrogmanEnvelope = {
  ok?: boolean;
  data?: FrogmanData;
  error?: string;
  message?: string;
};

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    city: typeof search.city === "string" ? search.city : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Integreat — Help for migrants in Germany" },
      { name: "description", content: "Ask anything about visas, housing, healthcare and jobs in Germany. Friendly answers in your language." },
    ],
  }),
  component: Index,
});



function Index() {
  const { q, city: cityParam } = Route.useSearch();
  return <Chat initialQuery={q} initialCity={cityParam} />;
}

function Chat({ initialQuery, initialCity }: { initialQuery?: string; initialCity?: string }) {
  const [city, setCity] = useState<string | null>(initialCity ?? null);
  const cityRef = useRef(city);
  useEffect(() => { cityRef.current = city; }, [city]);

  const [region, setRegion] = useState<RegionState>(() => initialCity ? { city: initialCity } : loadRegionState());
  const regionRef = useRef<RegionState>(region);
  useEffect(() => { regionRef.current = region; }, [region]);

  const [legalProfile, setLegalProfile] = useState<ChatProfile | null>(null);
  const [legalProfileReady, setLegalProfileReady] = useState(false);
  const legalProfileRef = useRef(legalProfile);
  useEffect(() => { legalProfileRef.current = legalProfile; }, [legalProfile]);

  useEffect(() => {
    const storedRegion = loadRegionState();
    if (!initialCity) {
      try {
        const storedCity = regionToCity(storedRegion) ?? localStorage.getItem(CITY_STORAGE_KEY);
        setCity(storedCity);
        const nextRegion = storedCity ? { ...storedRegion, city: storedCity } : storedRegion;
        setRegion(nextRegion);
        regionRef.current = nextRegion;
        saveRegionState(nextRegion);
      } catch { /* ignore */ }
    } else {
      const nextRegion = { ...storedRegion, city: initialCity };
      setRegion(nextRegion);
      regionRef.current = nextRegion;
      saveRegionState(nextRegion);
    }
    const storedProfile = mergeLegalProfile(null, loadLegalProfile() ?? {});
    setLegalProfile(storedProfile);
    legalProfileRef.current = storedProfile;
    if (storedProfile) saveLegalProfile(storedProfile);
    setLegalProfileReady(true);
  }, [initialCity]);

  useEffect(() => {
    try {
      if (city) localStorage.setItem(CITY_STORAGE_KEY, city);
      else localStorage.removeItem(CITY_STORAGE_KEY);
    } catch { /* ignore */ }
  }, [city]);

  const updateCity = (nextCity: string | null) => {
    setCity(nextCity);
    cityRef.current = nextCity;
    setRegion((current) => {
      const next = { ...current };
      if (nextCity) next.city = nextCity;
      else delete next.city;
      regionRef.current = next;
      saveRegionState(next);
      return next;
    });
  };

  const sessionId = useRef(getChatSession()).current;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const navigate = Route.useNavigate();

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const mergeBackendState = (data: FrogmanData) => {
    if (data.profile && typeof data.profile === "object") {
      const nextProfile = mergeLegalProfile(legalProfileRef.current, data.profile);
      if (nextProfile) {
        saveLegalProfile(nextProfile);
        setLegalProfile(nextProfile);
        legalProfileRef.current = nextProfile;
      }
    }

    const nextRegion = mergeRegion(regionRef.current, data.region);
    if (nextRegion) {
      setRegion(nextRegion);
      regionRef.current = nextRegion;
      saveRegionState(nextRegion);
      const nextCity = regionToCity(nextRegion);
      if (nextCity) {
        setCity(nextCity);
        cityRef.current = nextCity;
      }
    }
  };

  const sendMessage = async (text: string) => {
    const message = text.trim();
    if (!message) return;

    const userMessage: ChatMessage = {
      id: `${sessionId}:user:${Date.now()}`,
      role: "user",
      text: message,
    };
    const inferredState = inferClarificationState(message, legalProfileRef.current, regionRef.current);
    if (inferredState.profile !== legalProfileRef.current) {
      setLegalProfile(inferredState.profile);
      legalProfileRef.current = inferredState.profile;
      if (inferredState.profile) saveLegalProfile(inferredState.profile);
    }
    if (inferredState.region !== regionRef.current) {
      setRegion(inferredState.region);
      regionRef.current = inferredState.region;
      saveRegionState(inferredState.region);
      const inferredCity = regionToCity(inferredState.region);
      if (inferredCity) {
        setCity(inferredCity);
        cityRef.current = inferredCity;
      }
    }

    const nextMessages = [...messagesRef.current, userMessage];
    messagesRef.current = nextMessages;

    const conversation = nextMessages.map((message) => ({
      role: message.role,
      content: messageContent(message),
    }));
    const requestBody = {
      message,
      conversation,
      profile: toBackendProfile(inferredState.profile),
      region: inferredState.region,
    };

    setMessages(nextMessages);
    setStatus("submitted");

    try {
      console.log("Frogman URL", FROGMAN_CHAT_URL);
      const response = await fetch(FROGMAN_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Frogman request failed with ${response.status}`);
      }

      const json = (await response.json()) as FrogmanEnvelope | FrogmanData;
      const result = unwrapFrogmanPayload(json);
      if (!result.ok) {
        throw new Error(result.error);
      }

      mergeBackendState(result.data);
      const assistantMessage: ChatMessage = {
        id: `${sessionId}:assistant:${Date.now()}`,
        role: "assistant",
        response: normalizeFrogmanResponse(result.data),
      };
      const nextMessagesWithAssistant = [...messagesRef.current, assistantMessage];
      messagesRef.current = nextMessagesWithAssistant;
      setMessages(nextMessagesWithAssistant);
      setStatus("ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const errorMessage: ChatMessage = {
        id: `${sessionId}:assistant:${Date.now()}`,
        role: "assistant",
        response: {
          mode: "answer",
          answer: `Sorry, I could not reach Frogman right now.\n\n${message}`,
        },
      };
      const nextMessagesWithError = [...messagesRef.current, errorMessage];
      messagesRef.current = nextMessagesWithError;
      setMessages(nextMessagesWithError);
      setStatus("error");
    }
  };

  const autoSent = useRef(false);
  useEffect(() => {
    if (!legalProfileReady) return;
    if (autoSent.current) return;
    if (initialCity) updateCity(initialCity);
    if (initialQuery && initialQuery.trim()) {
      autoSent.current = true;
      const trimmed = initialQuery.trim();
      if (!hasRequiredOnboarding(cityRef.current, legalProfileRef.current)) {
        setPendingQuestion(trimmed);
        setProfileEditorOpen(true);
      } else {
        void sendMessage(trimmed);
      }
      navigate({ search: {}, replace: true });
    } else if (initialCity) {
      navigate({ search: {}, replace: true });
    }
  }, [initialQuery, initialCity, legalProfileReady, navigate]);

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  // Focus textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, [status]);

  const isLoading = status === "submitted" || status === "streaming";
  const onboardingComplete = hasRequiredOnboarding(cityRef.current, legalProfile);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    if (!onboardingComplete && !profileEditorOpen) {
      setPendingQuestion(trimmed);
      setProfileEditorOpen(true);
      setInput("");
      return;
    }
    void sendMessage(trimmed);
    setInput("");
  };

  const handleOnboardingComplete = (next: { city: string; language: string; legalStatus: string; age: number }) => {
    updateCity(next.city);
    const profile = mergeLegalProfile(legalProfileRef.current, {
      language: next.language,
      legalStatus: next.legalStatus,
      age: next.age,
    });
    if (profile) {
      saveLegalProfile(profile);
      setLegalProfile(profile);
      legalProfileRef.current = profile;
    }
    const q = pendingQuestion;
    setPendingQuestion(null);
    setProfileEditorOpen(false);
    if (q) void sendMessage(q);
  };


  const handleSubmit = () => {
    submit(input);
  };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sunshine text-sunshine-foreground">
              <Compass className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">Integreat</h1>
              <p className="text-xs text-muted-foreground">Help for life in Germany</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setProfileEditorOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-sunshine hover:text-sunshine-foreground"
            >
              <Pencil className="h-3 w-3" strokeWidth={2.5} />
              Edit Profile
            </button>
            <ProfileChips profile={legalProfile} city={city} />
          </div>
        </div>
      </header>


      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
        {profileEditorOpen ? (
          <Conversation className="flex-1">
            <ConversationContent className="space-y-4 py-6">
              {pendingQuestion && (
                <Message from="user">
                  <MessageContent className="group-[.is-user]:bg-sky group-[.is-user]:text-sky-foreground group-[.is-user]:rounded-2xl group-[.is-user]:rounded-tr-sm group-[.is-user]:px-4 group-[.is-user]:py-2.5">
                    {pendingQuestion}
                  </MessageContent>
                </Message>
              )}
              <OnboardingQuiz
                city={city}
                profile={legalProfile}
                onComplete={handleOnboardingComplete}
                onCancel={() => {
                  setPendingQuestion(null);
                  setProfileEditorOpen(false);
                }}
              />
            </ConversationContent>
          </Conversation>
        ) : messages.length === 0 && !pendingQuestion ? (
          <EmptyState />
        ) : (
          <Conversation className="flex-1">
            <ConversationContent className="space-y-4 py-6">
              {messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <Message key={m.id} from="user">
                      <MessageContent className="group-[.is-user]:bg-sky group-[.is-user]:text-sky-foreground group-[.is-user]:rounded-2xl group-[.is-user]:rounded-tr-sm group-[.is-user]:px-4 group-[.is-user]:py-2.5">
                        <MessageMarkdown text={m.text} />
                      </MessageContent>
                    </Message>
                  );
                }
                return <AssistantResponse key={m.id} response={m.response} onPrompt={submit} />;
              })}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3 text-foreground">
                    <Shimmer>Thinking…</Shimmer>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-4 pt-3">
          <InputGroup className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
            <InputGroupTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
                e.preventDefault();
                handleSubmit();
              }}
              placeholder="Ask anything — visas, Anmeldung, Krankenkasse, jobs…"
              className="field-sizing-content max-h-48 min-h-16"
            />
            <InputGroupAddon align="block-end" className="justify-between">
              <span className="px-1 text-xs text-muted-foreground">
                Reply in any language. General info, not legal advice.
              </span>
              <InputGroupButton
                type="button"
                variant="default"
                size="icon-sm"
                aria-label="Submit"
                disabled={!input.trim() || isLoading}
                onClick={handleSubmit}
              >
                {status === "submitted" ? (
                  <Spinner />
                ) : (
                  <CornerDownLeftIcon className="size-4" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </main>
    </div>
  );
}

function unwrapFrogmanPayload(
  json: FrogmanEnvelope | FrogmanData
): { ok: true; data: FrogmanData } | { ok: false; error: string } {
  if ("ok" in json) {
    if (json.ok === true) {
      return { ok: true, data: json.data ?? {} };
    }
    return {
      ok: false,
      error: json.error || json.message || "Frogman returned an unsuccessful response.",
    };
  }

  return { ok: true, data: json };
}

function loadRegionState(): RegionState {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(REGION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as RegionState : {};
  } catch {
    return {};
  }
}

function saveRegionState(region: RegionState) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(region));
    const city = regionToCity(region);
    if (city) localStorage.setItem(CITY_STORAGE_KEY, city);
    else localStorage.removeItem(CITY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function hasRequiredOnboarding(city: string | null, profile: ChatProfile | null): boolean {
  return Boolean(city?.trim() && profile?.language && profile?.legalStatus && profile?.age);
}

function mergeLegalProfile(
  current: ChatProfile | null,
  incoming: Partial<ChatProfile>
): ChatProfile | null {
  const next = {
    country: incoming.country ?? current?.country ?? "",
    legalStatus: incoming.legalStatus ?? incoming.status ?? current?.legalStatus ?? current?.status ?? "",
    duration: incoming.duration ?? current?.duration ?? "",
    language: incoming.language ?? current?.language,
    age: incoming.age ?? current?.age,
  };

  return next.country || next.legalStatus || next.duration || next.language || next.age ? next : null;
}

function toBackendProfile(profile: ChatProfile | null): ChatProfile | null {
  if (!profile) return null;
  const normalized = mergeLegalProfile(null, profile);
  if (!normalized) return null;
  const { country, duration, language, legalStatus, age } = normalized;
  return { country, duration, language, legalStatus, age };
}

function mergeRegion(current: RegionState, incoming: unknown): RegionState | null {
  if (typeof incoming === "string") {
    const city = incoming.trim();
    return city ? { ...current, city } : null;
  }
  if (!incoming || typeof incoming !== "object") return null;

  const merged = { ...current, ...(incoming as Record<string, unknown>) };
  const city = regionToCity(merged);
  if (city) merged.city = city;
  return merged;
}

function inferClarificationState(
  answer: string,
  currentProfile: ChatProfile | null,
  currentRegion: RegionState
): { profile: ChatProfile | null; region: RegionState } {
  const language = inferLanguage(answer);
  const age = inferAge(answer);
  const city = inferCity(answer);
  const profile = language || age
    ? mergeLegalProfile(currentProfile, { ...(language ? { language } : {}), ...(age ? { age } : {}) }) ?? currentProfile
    : currentProfile;
  const region = city ? { ...currentRegion, city } : currentRegion;

  return { profile, region };
}

function inferLanguage(answer: string): string | null {
  const normalized = answer.trim().toLowerCase();
  if (/^(english|en)$/i.test(normalized) || /\benglish\b/i.test(normalized)) return "en";
  if (/^(german|de|deutsch)$/i.test(normalized) || /\b(german|deutsch)\b/i.test(normalized)) return "de";
  return null;
}

function inferAge(answer: string): number | null {
  const normalized = answer.trim().toLowerCase();
  const direct = normalized.match(/^(?:age\s*)?(\d{1,3})$/);
  const sentence = normalized.match(/\b(?:i am|i'm|age is|my age is)\s+(\d{1,3})\b/);
  const value = Number(direct?.[1] ?? sentence?.[1]);
  return value >= 1 && value <= 120 ? value : null;
}

function inferCity(answer: string): string | null {
  const normalized = answer.trim().toLowerCase();
  const aliases: Record<string, string> = {
    munich: "Munich",
    münchen: "Munich",
  };
  if (aliases[normalized]) return aliases[normalized];

  const cityPatterns = [
    /\bi am in\s+([a-zA-ZÀ-ž .'-]+)$/i,
    /\bi'm in\s+([a-zA-ZÀ-ž .'-]+)$/i,
    /\bin\s+([a-zA-ZÀ-ž .'-]+)$/i,
  ];

  for (const pattern of cityPatterns) {
    const match = answer.match(pattern);
    const value = match?.[1]?.trim();
    if (value) return aliases[value.toLowerCase()] ?? titleCaseCity(value);
  }

  const matchedCity = GERMAN_CITIES.find((city) => city.toLowerCase() === normalized);
  return matchedCity ?? null;
}

function titleCaseCity(value: string): string {
  return value
    .replace(/[.!?]+$/, "")
    .trim()
    .split(/\s+/)
    .map((part) => part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part)
    .join(" ");
}

function regionToCity(region: unknown): string | null {
  if (typeof region === "string") {
    const value = region.trim();
    return value || null;
  }
  if (!region || typeof region !== "object") return null;

  const candidate = ["city", "name", "region", "municipality"]
    .map((key) => (region as Record<string, unknown>)[key])
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);

  return candidate?.trim() ?? null;
}

function normalizeFrogmanResponse(data: FrogmanResponse): FrogmanResponse {
  const mode = data.mode === "clarification" ? "clarification" : "answer";
  const questions = mode === "clarification"
    ? uniquePrompts(data.questions)
    : [];
  const suggestedQuestions =
    mode === "answer"
      ? uniquePrompts(data.suggestedQuestions)
      : [];

  return {
    mode,
    answer: data.answer?.trim() || "I did not receive an answer from Frogman.",
    questions,
    sources: mode === "answer" && Array.isArray(data.sources) ? data.sources.filter(Boolean) : [],
    suggestedQuestions,
  };
}

function messageContent(message: ChatMessage): string {
  if (message.role === "user") return message.text;
  const response = message.response;
  const prompts = response.mode === "clarification" ? response.questions : response.suggestedQuestions;
  return [response.answer, ...(prompts ?? [])].filter(Boolean).join("\n");
}

function uniquePrompts(prompts?: string[], previousPrompts?: string[]): string[] {
  if (!Array.isArray(prompts)) return [];
  const previous = new Set((previousPrompts ?? []).map(normalizePrompt));
  const seen = new Set<string>();
  return prompts.filter((prompt) => {
    if (typeof prompt !== "string") return false;
    const normalized = normalizePrompt(prompt);
    if (!normalized || seen.has(normalized) || previous.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function normalizePrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ").toLowerCase();
}

function AssistantResponse({
  response,
  onPrompt,
}: {
  response: FrogmanResponse;
  onPrompt: (prompt: string) => void;
}) {
  if (response.mode === "clarification") {
    return (
      <Message from="assistant">
        <MessageContent className="rounded-2xl rounded-tl-sm bg-sunshine px-4 py-3 text-sm text-sunshine-foreground">
          <MessageMarkdown text={assistantDisplayText(response)} />
        </MessageContent>
      </Message>
    );
  }

  const followUps = uniquePrompts(response.suggestedQuestions);

  return (
    <div className="space-y-2.5">
      <Message from="assistant">
        <MessageContent className="rounded-2xl rounded-tl-sm bg-sunshine px-4 py-3 text-sm text-sunshine-foreground">
          <MessageMarkdown text={response.answer ?? ""} />
        </MessageContent>
      </Message>

      {response.sources?.length ? (
        <Message from="assistant">
          <MessageContent className="rounded-2xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Sources</p>
              <ul className="space-y-1.5">
                {response.sources.map((source, index) => (
                  <li key={sourceKey(source, index)}>
                    <SourceLink source={source} />
                  </li>
                ))}
              </ul>
            </div>
          </MessageContent>
        </Message>
      ) : null}

      {followUps?.length ? (
        <div className="flex flex-wrap gap-2 pl-2">
          {followUps.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPrompt(prompt)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-sunshine hover:text-sunshine-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function assistantDisplayText(response: FrogmanResponse): string {
  if (response.mode !== "clarification") return response.answer ?? "";

  const answer = response.answer ?? "";
  const questions = uniquePrompts(response.questions).filter(
    (question) => !textContainsPrompt(answer, question)
  );
  if (!questions.length) return answer;

  const questionText =
    questions.length === 1
      ? questions[0]
      : questions.map((question) => `- ${question}`).join("\n");

  return [answer, questionText].filter(Boolean).join("\n\n");
}

function textContainsPrompt(text: string, prompt: string): boolean {
  const normalizedText = normalizePrompt(text).replace(/[?!.]+/g, "");
  const normalizedPrompt = normalizePrompt(prompt).replace(/[?!.]+/g, "");
  return Boolean(normalizedPrompt && normalizedText.includes(normalizedPrompt));
}

function sourceKey(source: FrogmanSource, index: number): string {
  if (typeof source === "string") return `${source}:${index}`;
  return `${source.url || source.link || source.title || source.source || "source"}:${index}`;
}

function SourceLink({ source }: { source: FrogmanSource }) {
  if (typeof source === "string") return <span>{source}</span>;
  const href = source.url || source.link;
  const label = source.title || source.source || href || "Source";
  if (!href) return <span>{label}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline underline-offset-2 hover:opacity-80"
    >
      {label}
    </a>
  );
}

function formatFrogmanResponse(data: FrogmanResponse): string {
  const sections = [data.answer?.trim()].filter(Boolean) as string[];

  if (data.mode === "clarification" && data.questions?.length) {
    sections.push(
      ["**Questions**", ...data.questions.map((question) => `- ${question}`)].join("\n")
    );
  }

  if (data.mode === "answer") {
    if (data.sources?.length) {
      sections.push(`**Sources:** ${formatSources(data.sources)}`);
    }
    if (data.suggestedQuestions?.length) {
      sections.push(
        ["**Suggested questions**", ...data.suggestedQuestions.map((question) => `- ${question}`)].join("\n")
      );
    }
  }

  return sections.length ? sections.join("\n\n---\n\n") : "I did not receive an answer from Frogman.";
}

function formatSources(sources: FrogmanSource[]): string {
  return sources
    .map((source) => {
      if (typeof source === "string") return source;
      const href = source.url || source.link;
      const label = source.title || source.source || href || "Source";
      return href ? `[${label}](${href})` : label;
    })
    .join(", ");
}

function splitSections(text: string): string[] {
  return text
    .split(/\n\s*---+\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Place = {
  name: string;
  description?: string;
  address?: string;
  website?: string;
  phone?: string;
  features?: string[];
};

function extractPlaces(text: string): { places: Place[] | null; rest: string } {
  const re = /```places\s*\n([\s\S]*?)```/i;
  const m = text.match(re);
  if (!m) return { places: null, rest: text };
  try {
    const parsed = JSON.parse(m[1].trim()) as Place[];
    if (!Array.isArray(parsed)) return { places: null, rest: text };
    return { places: parsed, rest: text.replace(re, "").trim() };
  } catch {
    return { places: null, rest: text };
  }
}

function sectionKind(text: string): "places" | "checklist" | "sources" | "steps" | "intro" {
  if (/```places/i.test(text)) return "places";
  if (/^\s*-\s*\[[ xX]\]/m.test(text) || /📄/.test(text)) return "checklist";
  if (/^\*\*Sources:?\*\*/im.test(text) || /^Sources:/im.test(text)) return "sources";
  if (/^\s*\d+\.\s/m.test(text)) return "steps";
  return "intro";
}

function AssistantSections({ text }: { text: string }) {
  const sections = splitSections(text);
  if (sections.length === 0) return null;
  return (
    <div className="space-y-2.5">
      {sections.map((section, i) => {
        const kind = sectionKind(section);
        if (kind === "places") {
          const { places, rest } = extractPlaces(section);
          return (
            <div key={i} className="space-y-2.5">
              {rest && (
                <Message from="assistant">
                  <MessageContent className="rounded-2xl bg-card text-card-foreground border border-border px-4 py-3 text-sm">
                    <MessageMarkdown text={rest} />
                  </MessageContent>
                </Message>
              )}
              {places && <PlacesTiles places={places} />}
            </div>
          );
        }
        const base = "rounded-2xl px-4 py-3 text-sm";
        const styles: Record<string, string> = {
          intro: `${base} ${i === 0 ? "rounded-tl-sm " : ""}bg-sunshine text-sunshine-foreground`,
          steps: `${base} bg-card text-card-foreground border border-border`,
          checklist: `${base} bg-sky/10 text-foreground border border-sky/30`,
          sources: `${base} bg-muted/60 text-muted-foreground text-xs`,
        };
        return (
          <Message key={i} from="assistant">
            <MessageContent className={styles[kind]}>
              <MessageMarkdown text={section} />
            </MessageContent>
          </Message>
        );
      })}
    </div>
  );
}

const FEATURE_META: Record<string, { icon: LucideIcon; label: string }> = {
  barrier_free: { icon: Accessibility, label: "Barrier-free" },
  children: { icon: Baby, label: "Children welcome" },
  free: { icon: BadgeEuro, label: "Free of charge" },
  confidential: { icon: Shield, label: "Confidential" },
  multilingual: { icon: Languages, label: "Multilingual support" },
  appointment: { icon: CalendarClock, label: "By appointment" },
};

function PlacesTiles({ places }: { places: Place[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);
  const open = openIdx !== null ? places[openIdx] : null;

  const top3 = places.slice(0, 3);
  const rest = places.slice(3);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {top3.map((p, i) => (
          <PlaceTile
            key={i}
            place={p}
            index={i}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
        {showMore && rest.map((p, i) => (
          <PlaceTile
            key={i + 3}
            place={p}
            index={i + 3}
            isOpen={openIdx === i + 3}
            onToggle={() => setOpenIdx(openIdx === i + 3 ? null : i + 3)}
          />
        ))}
      </div>
      {rest.length > 0 && !showMore && (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60"
        >
          See more options
        </button>
      )}
      {open && <PlaceDetail place={open} />}
    </div>
  );
}

function PlaceTile({ place, index, isOpen, onToggle }: { place: Place; index: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex flex-col gap-2 rounded-2xl px-4 py-3 text-left transition-all ${
        isOpen
          ? "bg-sunshine text-sunshine-foreground shadow-md ring-2 ring-sunshine-foreground/20"
          : "bg-sunshine/90 text-sunshine-foreground hover:bg-sunshine hover:shadow-sm"
      }`}
    >
      <span className="pr-6 text-sm font-semibold leading-snug text-[#5b3a1f]">{place.name}</span>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(place.features ?? []).slice(0, 4).map((f) => {
            const meta = FEATURE_META[f];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span key={f} title={meta.label} aria-label={meta.label} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#5b3a1f]/10 text-[#5b3a1f]">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
            );
          })}
        </div>
        <span className="text-[#5b3a1f]/60 text-sm">
          {isOpen ? "✕" : "›"}
        </span>
      </div>
    </button>
  );
}

function PlaceDetail({ place }: { place: Place }) {
  const mapSrc = place.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}&z=15&output=embed`
    : null;
  const contactHref = place.website || (place.phone ? `tel:${place.phone.replace(/\s/g, "")}` : null);
  return (
    <div className="rounded-2xl bg-sunshine p-4 text-sunshine-foreground shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-bold leading-tight">{place.name}</h3>
          {place.description && (
            <p className="text-sm leading-relaxed">{place.description}</p>
          )}
          {place.features && place.features.length > 0 && (
            <ul className="space-y-1.5 pt-1">
              {place.features.map((f) => {
                const meta = FEATURE_META[f];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#5b3a1f]">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span>{meta.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="space-y-3">
          {mapSrc && (
            <div className="overflow-hidden rounded-xl border border-sunshine-foreground/10 bg-background">
              <iframe
                title={`Map: ${place.name}`}
                src={mapSrc}
                className="h-44 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          {place.address && (
            <div className="flex items-start gap-2 text-sm">
              <span className="mt-0.5">📍</span>
              <span>{place.address}</span>
            </div>
          )}
          {place.phone && (
            <div className="flex items-start gap-2 text-sm">
              <span className="mt-0.5">☎️</span>
              <a href={`tel:${place.phone.replace(/\s/g, "")}`} className="underline underline-offset-2">
                {place.phone}
              </a>
            </div>
          )}
          {contactHref && (
            <a
              href={contactHref}
              target={place.website ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-xl bg-sky px-4 py-2.5 text-sm font-semibold text-sky-foreground transition-opacity hover:opacity-90"
            >
              Book the appointment
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageMarkdown({ text }: { text: string }) {

  return (
    <TooltipProvider delayDuration={150}>
      <div className="prose prose-sm max-w-none text-current prose-p:my-2 prose-ul:my-2 prose-ol:my-3 prose-li:my-1 prose-strong:text-current prose-strong:font-semibold prose-headings:text-current prose-a:text-current prose-a:underline prose-a:underline-offset-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Render GFM task-list items as our own checklist with info tooltips
            li: ({ node, children, className, ...props }) => {
              const isTask = className?.includes("task-list-item");
              if (!isTask) {
                return <li {...props}>{children}</li>;
              }

              // children = [checkbox input, " ", ...rest]
              // Flatten to a raw string to detect the ⓘ marker
              const raw = extractText(children);
              const stripped = raw.replace(/^\s*/, "");
              const [labelPart, ...infoParts] = stripped.split("ⓘ");
              const info = infoParts.join("ⓘ").trim();
              const label = labelPart.trim();

              return (
                <li
                  className="not-prose flex items-start gap-2.5 rounded-xl bg-background/40 px-3 py-2 list-none"
                  {...props}
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-current opacity-70" />
                  <span className="flex-1 text-sm leading-snug">{label}</span>
                  {info && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 rounded-full p-0.5 text-current opacity-60 transition-opacity hover:opacity-100"
                          aria-label={`More info: ${label}`}
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        {info}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </li>
              );
            },
            a: ({ children, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-current underline underline-offset-2 hover:opacity-80"
              >
                {children}
              </a>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </TooltipProvider>
  );
}

function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    // @ts-expect-error - react element
    return extractText(node.props?.children);
  }
  return "";
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        Ask Frogman a question to start.
      </div>
    </div>
  );
}

function CityChip({ city, onChange }: { city: string | null; onChange: (c: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(city ?? "");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(city ?? "");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, city]);

  const suggestions = (() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return GERMAN_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 6);
  })();

  const commit = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
        aria-label={city ? `Change city (currently ${city})` : "Set city"}
      >
        <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span>{city ?? "Set city"}</span>
        <Pencil className="ml-0.5 h-3 w-3 opacity-70" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-sm font-medium text-ink-foreground">
        <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setActiveIdx(0); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(suggestions[activeIdx] ?? value);
            } else if (e.key === "Escape") {
              setEditing(false);
            } else if (e.key === "ArrowDown" && suggestions.length) {
              e.preventDefault();
              setActiveIdx((i) => (i + 1) % suggestions.length);
            } else if (e.key === "ArrowUp" && suggestions.length) {
              e.preventDefault();
              setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
            }
          }}
          onBlur={() => setTimeout(() => setEditing(false), 150)}
          placeholder="Type a city…"
          className="w-32 bg-transparent text-sm text-ink-foreground placeholder:text-ink-foreground/60 focus:outline-none"
          autoComplete="off"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commit(suggestions[activeIdx] ?? value)}
          aria-label="Save city"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-ink-foreground/15"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(s)}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                  i === activeIdx ? "bg-sunshine text-sunshine-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProfileChips({ profile, city }: { profile: LegalProfile | null; city: string | null }) {
  const legalStatus = profile?.legalStatus ?? profile?.status;
  const chips = [
    { icon: MapPin, label: city ?? "City" },
    { icon: Languages, label: languageLabel(profile?.language) },
    { icon: Shield, label: legalStatus ?? "Legal status" },
    { icon: CalendarClock, label: profile?.age ? `${profile.age}` : "Age" },
  ];

  return (
    <div className="flex max-w-[46vw] flex-wrap items-center justify-end gap-1.5">
      {chips.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex max-w-[140px] items-center gap-1 rounded-full bg-sunshine px-2.5 py-1.5 text-xs font-medium text-sunshine-foreground"
          title={label}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
          <span className="truncate">{label}</span>
        </span>
      ))}
    </div>
  );
}

function languageLabel(language?: string): string {
  return LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? "Not set";
}

function OnboardingQuiz({
  city,
  profile,
  onComplete,
  onCancel,
}: {
  city: string | null;
  profile: ChatProfile | null;
  onComplete: (profile: { city: string; language: string; legalStatus: string; age: number }) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [nextCity, setNextCity] = useState(city ?? "");
  const [language, setLanguage] = useState(profile?.language ?? "");
  const [legalStatus, setLegalStatus] = useState(profile?.legalStatus ?? profile?.status ?? "");
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "");
  const totalSteps = 4;

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    const trimmedCity = nextCity.trim();
    const numericAge = Number(age);
    if (!trimmedCity || !language || !legalStatus || !Number.isInteger(numericAge) || numericAge < 1 || numericAge > 120) return;
    onComplete({ city: trimmedCity, language, legalStatus, age: numericAge });
  };

  return (
    <>
      <Message from="assistant">
        <MessageContent className="rounded-2xl rounded-tl-sm bg-sunshine px-4 py-3 text-sm text-sunshine-foreground">
            <p>Quick 4-step setup so I can answer for your city and situation. Stored only in your browser.</p>
        </MessageContent>
      </Message>
      <div className="space-y-4 rounded-2xl bg-ink p-4 text-ink-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-foreground/70">
            Question {step + 1} of {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= step ? "bg-sunshine" : "bg-ink-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <CityStep
            value={nextCity}
            onChange={setNextCity}
            onNext={() => nextCity.trim() && next()}
          />
        )}

        {step === 1 && (
          <div>
            <label className="mb-2 block text-sm font-semibold">Preferred language</label>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setLanguage(opt.value); setTimeout(next, 120); }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    language === opt.value
                      ? "bg-sunshine text-sunshine-foreground"
                      : "bg-ink-foreground/10 text-ink-foreground hover:bg-ink-foreground/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="mb-2 block text-sm font-semibold">Your current legal status</label>
            <div className="flex flex-wrap gap-1.5">
              {LEGAL_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setLegalStatus(opt); setTimeout(next, 120); }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    legalStatus === opt
                      ? "bg-sunshine text-sunshine-foreground"
                      : "bg-ink-foreground/10 text-ink-foreground hover:bg-ink-foreground/20"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="mb-2 block text-sm font-semibold">Your age</label>
            <div className="flex items-center gap-2 rounded-full bg-sky px-4 py-2.5">
              <input
                autoFocus
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    finish();
                  }
                }}
                inputMode="numeric"
                placeholder="Type your age *"
                className="flex-1 bg-transparent text-sm text-sky-foreground placeholder:text-sky-foreground/70 focus:outline-none"
              />
              <button
                type="button"
                disabled={!age || Number(age) < 1 || Number(age) > 120}
                onClick={finish}
                className="rounded-full bg-sunshine px-4 py-1.5 text-sm font-semibold text-sunshine-foreground transition-opacity disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={step === 0 ? onCancel : back}
            className="text-xs text-ink-foreground/70 underline-offset-2 hover:underline"
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step === 0 && (
            <button
              type="button"
              disabled={!nextCity.trim()}
              onClick={next}
              className="rounded-full bg-sunshine px-4 py-2 text-sm font-semibold text-sunshine-foreground transition-opacity disabled:opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function CityStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const suggestions = (() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return GERMAN_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  })();

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">Which city are you in?</label>
      <div className="relative">
        <div className="flex items-center gap-2 rounded-full bg-sky px-4 py-2.5">
          <input
            autoFocus
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); setActiveIdx(0); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (suggestions[activeIdx]) { onChange(suggestions[activeIdx]); setOpen(false); onNext(); }
                else if (value.trim()) onNext();
              } else if (e.key === "ArrowDown" && suggestions.length) {
                e.preventDefault(); setActiveIdx((i) => (i + 1) % suggestions.length);
              } else if (e.key === "ArrowUp" && suggestions.length) {
                e.preventDefault(); setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Type your city *"
            className="flex-1 bg-transparent text-sm text-sky-foreground placeholder:text-sky-foreground/70 focus:outline-none"
            autoComplete="off"
          />
          <MapPin className="h-4 w-4 text-sky-foreground/80" strokeWidth={2.5} />
        </div>
        {open && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-2xl border border-border bg-card shadow-lg">
            {suggestions.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(s); setOpen(false); onNext(); }}
                  className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                    i === activeIdx ? "bg-sunshine text-sunshine-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

