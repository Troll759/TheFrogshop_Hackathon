export const LEGAL_STORAGE_KEY = "integreat:legal-profile";

export type LegalProfile = {
  country?: string;
  status?: string;
  legalStatus?: string;
  duration?: string;
  language?: string;
  age?: number;
};

export const LEGAL_STATUS_OPTIONS = [
  "Visa holder — work, study or family",
  "Asylum seeker",
  "Recognised refugee / subsidiary protection",
  "EU/EEA/Swiss citizen",
  "Undocumented",
  "Other / not sure",
];

export const DURATION_OPTIONS = [
  "Just arrived — under 3 months",
  "3–12 months",
  "1–3 years",
  "More than 3 years",
];

export function loadLegalProfile(): LegalProfile | null {
  try {
    const raw = localStorage.getItem(LEGAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LegalProfile) : null;
  } catch {
    return null;
  }
}

export function saveLegalProfile(profile: LegalProfile) {
  try {
    localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function getIneligibilityList(profile: LegalProfile): string[] {
  const list: string[] = [];

  const legalStatus = profile.legalStatus ?? profile.status;

  if (legalStatus === "Asylum seeker") {
    list.push("Permanent residency (Niederlassungserlaubnis)");
    list.push("Unrestricted work permit during the first 3 months");
    list.push("Bürgergeld — asylum seekers receive AsylbLG instead");
  }

  if (legalStatus === "Recognised refugee / subsidiary protection") {
    list.push("Asylum-seeker benefits (AsylbLG) — you now receive regular social benefits");
    list.push("National visa routes — you hold a refugee residence permit");
  }

  if (legalStatus === "EU/EEA/Swiss citizen") {
    list.push("Asylum or refugee status procedures");
    list.push("National visa / residence permit — you register under freedom of movement");
  }

  if (legalStatus === "Visa holder — work, study or family") {
    list.push("Asylum benefits");
    list.push("EU freedom-of-movement registration");
  }

  if (legalStatus === "Undocumented") {
    list.push("Legal employment");
    list.push("Public health insurance (GKV)");
    list.push("Social benefits (Bürgergeld / AsylbLG)");
    list.push("Residence permit (until status is regularised)");
  }

  if (profile.duration === "Just arrived — under 3 months") {
    list.push("Permanent residency");
    list.push("Naturalisation / German citizenship");
    if (legalStatus !== "EU/EEA/Swiss citizen" && legalStatus !== "Visa holder — work, study or family") {
      list.push("Unrestricted employment");
    }
  }

  return [...new Set(list)];
}

