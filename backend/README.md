# Frogman Backend

Express + TypeScript API for the Frogman hackathon demo. The backend retrieves live Integreat content, sends retrieved snippets to OpenAI, and returns frontend-friendly JSON.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `OPENAI_API_KEY` in `.env` before calling `/api/chat`.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm start
```

## Endpoints

### `GET /health`

```json
{
  "ok": true,
  "service": "frogman-api"
}
```

### `POST /api/chat`

Request:

```json
{
  "message": "Where can I find a German course in Augsburg?",
  "profile": {
    "language": "en",
    "audience": "refugee",
    "needs": ["language course"]
  },
  "region": {
    "city": "Augsburg"
  }
}
```

Clarification response:

```json
{
  "ok": true,
  "data": {
    "mode": "clarification",
    "answer": "I can help. I just need a bit more information.",
    "questions": [],
    "profile": {},
    "region": {}
  }
}
```

Answer response:

```json
{
  "ok": true,
  "data": {
    "mode": "answer",
    "answer": "string",
    "sources": [],
    "suggestedQuestions": [],
    "missingProfileFields": [],
    "context": {
      "profile": {},
      "intent": {},
      "region": {},
      "integreat": {
        "language": "en",
        "notes": [],
        "snippetCount": 3
      }
    }
  }
}
```

Error response:

```json
{
  "error": {
    "code": "validation_error",
    "message": "message is required.",
    "details": {}
  }
}
```

## Demo Tips

- Have the frontend send `message`, `profile.language`, and `region.city`.
- Render `data.sources` as clickable citations.
- Render `data.missingProfileFields` as follow-up prompts.
- Keep a known demo query ready: "Where can I find internet wifi in Augsburg in English?"
