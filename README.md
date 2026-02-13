# Asylum Assistant

## GOV.UK official source ingestion

### Configure sources
Edit the whitelist in `backend/src/sources/govuk.sources.json` to control which GOV.UK pages are ingested.

### Environment variables
Set these in your backend environment:

- `MONGO_DB_URI`
- `OPENAI_API_KEY`
- `ADMIN_TOKEN` (required for the admin ingestion endpoint)
- `GOVUK_CONTACT_EMAIL` (used in the GOV.UK User-Agent header)
- `STORAGE_DIR` (optional, defaults to `backend/data/uploads`)
- `MAX_UPLOAD_MB` (optional, defaults to 12)

### Run ingestion locally
From `backend/`:

```bash
npm run index:govuk
```

Optional sanity check for normalization:

```bash
npm run test:govuk-normalize
```

### Trigger ingestion via API
Send a POST request to the admin endpoint:

```bash
POST /api/admin/ingest/govuk
Authorization: Bearer <ADMIN_TOKEN>
```

You can also send `x-admin-token: <ADMIN_TOKEN>` if preferred.

## Document upload + insights

### Uploads
Users can upload PDF or TXT files. Files are stored per user under `STORAGE_DIR/<userId>/<docId>/`.

### Analyze a document
Use the UI "Document Insights" panel or call:

```bash
POST /api/documents/:id/analyze
```

The response contains:
- `explanation`
- `deadlines` (structured items)
- `nextSteps`
- citations for both user documents and GOV.UK guidance
