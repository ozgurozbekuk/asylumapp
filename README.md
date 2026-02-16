# Asylum Assistant

UK asylum and immigration chat assistant.

- `frontend/`: React + Vite + Clerk
- `backend/`: Express + MongoDB + OpenAI API

## Current status
- OpenAI is the active LLM provider for both chat and embeddings.
- Ollama is not used in this build.

## Environment

### Backend (`backend/.env`)
Required:
- `MONGO_DB_URI`
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`

Recommended:
- `PORT=3000`
- `CORS_ORIGIN=http://localhost:5173`
- `LLM_PROVIDER=openai`
- `OPENAI_CHAT_MODEL=gpt-4.1-mini`
- `OPENAI_EMBED_MODEL=text-embedding-3-small`
- `RAG_MAX_CONTEXT_CHARS=6000`
- `RAG_MAX_TOP_K=5`
- `RAG_FINAL_TOP_K=3`
- `RAG_SUMMARY_MAX_TOKENS=220`
- `RAG_ANSWER_MAX_TOKENS=500`

Optional:
- `ADMIN_TOKEN`

Use `backend/.env.example` as your template.

### Frontend (`frontend/.env`)
Required:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL` (example: `http://localhost:3000` or `https://api.example.com`)

Optional:
- `VITE_API_TIMEOUT_MS=70000`

## Run locally

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Build and test

### Frontend build
```bash
cd frontend
npm run build
```

### Backend tests
```bash
cd backend
npm test
```

## Re-embed chunks after provider/model change
If chunk embeddings were generated with a different provider/model, regenerate them:

```bash
cd backend
npm run reembed:openai
```

This updates all chunk embeddings and clears retrieval cache records.

## Deploy notes
- Set `CORS_ORIGIN` to your frontend domain.
- Set `VITE_API_URL` to your backend public URL.
- Prefer reverse proxy (Nginx) and expose only `80/443`.

## Health check
```bash
curl http://127.0.0.1:<PORT>/health
```
