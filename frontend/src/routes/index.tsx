import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { Search, CornerDownLeft, Shield } from "lucide-react";
import { GERMAN_CITIES } from "@/lib/german-cities";
import { resetChatSession } from "@/lib/chat-session";
import { loadLegalProfile, type LegalProfile } from "@/lib/legal-status";

const EXAMPLE_QUESTIONS = [
  "How do I register my address?",
  "What documents do I need for a residence permit?",
  "How do I apply for health insurance?",
  "Where can I learn German for free?",
  "How do I open a bank account?",
  "What do I need for family reunification?",
  "How do I find a job in Germany?",
];

const CITY_STORAGE_KEY = "integreat:city";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Integreat — Great Integration" },
      { name: "description", content: "Get all the information about being a migrant in Germany. One place." },
    ],
  }),
  component: Home,
});

function useTypingPlaceholder(questions: string[], speed = 50, pause = 2000) {
  const [text, setText] = useState("");
  const [qIdx, setQIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = questions[qIdx % questions.length];
    let timer: ReturnType<typeof setTimeout>;

    if (deleting) {
      timer = setTimeout(() => {
        setText((t) => t.slice(0, -1));
        if (text.length <= 1) {
          setDeleting(false);
          setQIdx((i) => i + 1);
        }
      }, speed / 2);
    } else {
      if (text.length < current.length) {
        timer = setTimeout(() => {
          setText(current.slice(0, text.length + 1));
        }, speed);
      } else {
        timer = setTimeout(() => setDeleting(true), pause);
      }
    }

    return () => clearTimeout(timer);
  }, [text, qIdx, deleting, questions, speed, pause]);

  return text;
}

function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [question, setQuestion] = useState("");
  const [openSuggest, setOpenSuggest] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [cityError, setCityError] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const animatedPlaceholder = useTypingPlaceholder(EXAMPLE_QUESTIONS, 45, 1800);
  const [legalProfile, setLegalProfile] = useState<LegalProfile | null>(() => loadLegalProfile());

  // Coming back to the home page wipes the in-memory chat history.
  useEffect(() => {
    resetChatSession();
  }, []);

  const suggestions = useMemo(() => {
    const q = city.trim().toLowerCase();
    if (!q) return [];
    return GERMAN_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 6);
  }, [city]);

  useEffect(() => {
    setActiveIdx(0);
    if (city.trim()) setCityError(false);
  }, [city]);

  const goToChat = (selectedCity: string, q?: string) => {
    const c = selectedCity.trim();
    if (c) {
      try {
        localStorage.setItem(CITY_STORAGE_KEY, c);
      } catch { /* ignore */ }
    }
    navigate({
      to: "/chat",
      search: {
        ...(q && q.trim() ? { q: q.trim() } : {}),
        ...(c ? { city: c } : {}),
      },
    });
  };

  const selectCity = (c: string) => {
    setCity(c);
    setOpenSuggest(false);
    setCityError(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-10 flex items-center justify-center gap-3">
          <LogoMark />
          <div className="leading-none">
            <div className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              INTEGREAT
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Great Integration.</div>
          </div>
        </div>

        <p className="mb-7 text-center text-base text-foreground sm:text-lg">
          Get all the information about being a migrant in Germany.
          <br />
          One place.
        </p>

        {/* City search with autocomplete */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (suggestions.length > 0 && openSuggest) {
              selectCity(suggestions[activeIdx]);
            } else if (city.trim()) {
              selectCity(city.trim());
            }
          }}
          className="relative mb-4"
        >
          <div className="flex items-center gap-3 rounded-full bg-sunshine px-6 py-4 shadow-sm">
            <input
              ref={cityInputRef}
              value={city}
              onChange={(e) => { setCity(e.target.value); setOpenSuggest(true); }}
              onFocus={() => setOpenSuggest(true)}
              onBlur={() => setTimeout(() => setOpenSuggest(false), 150)}
              onKeyDown={(e) => {
                if (!openSuggest || suggestions.length === 0) return;
                if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % suggestions.length); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length); }
                else if (e.key === "Escape") { setOpenSuggest(false); }
              }}
              placeholder="What city are you looking for? *"
              className="city-search flex-1 bg-transparent text-left text-sm text-sunshine-foreground placeholder:text-sunshine-foreground/60 focus:outline-none sm:text-base"
              autoComplete="off"
            />
            <button type="submit" aria-label="Search city" className="text-sunshine-foreground">
              <Search className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          {openSuggest && suggestions.length > 0 && (
            <ul className="absolute left-1/2 top-full z-20 mt-2 w-[92%] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              {suggestions.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectCity(s)}
                    className={`block w-full px-5 py-2.5 text-left text-sm transition-colors ${
                      i === activeIdx ? "bg-sunshine text-sunshine-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        <p className="my-5 text-center text-base text-muted-foreground sm:text-lg">All the answers.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!question.trim()) return;
            if (!city.trim()) {
              setCityError(true);
              cityInputRef.current?.focus();
              return;
            }
            goToChat(city.trim(), question);
          }}
        >
          <div className="flex items-center gap-3 rounded-full bg-sky px-6 py-4 shadow-sm">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={question ? "Ask your question…" : animatedPlaceholder}
              className="flex-1 bg-transparent text-sm text-sky-foreground placeholder:text-sky-foreground/70 focus:outline-none sm:text-base"
              required
            />
            <button type="submit" aria-label="Ask" className="text-sky-foreground">
              <CornerDownLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
          {cityError && (
            <p className="mt-2 text-center text-xs font-medium text-destructive">
              Please choose your city first.
            </p>
          )}
        </form>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" strokeWidth={2} />
          <span>
            Legal Situation:{" "}
            <span className={legalProfile?.status ? "font-medium text-foreground" : ""}>
              {legalProfile?.status ? "Defined" : "Not defined"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-sunshine shadow-sm sm:h-20 sm:w-20">
      <svg viewBox="0 0 64 64" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round">
        {/* Open ring (G) — gap on the right */}
        <path d="M48 22a18 18 0 1 0 4 16" />
        {/* Horizontal crossbar of the G */}
        <path d="M40 34h12" />
      </svg>
    </div>
  );
}

