# Production deployment checklist

AgriOptima AI uses Vercel for the Vite frontend, Render for the FastAPI backend, and Neon PostgreSQL for durable data.

## 1. Render backend

Set the Render service root directory to `backend`.

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Add these environment variables:

```text
DATABASE_URL=<Neon pooled connection string>
AUTH_SECRET=<a unique random value of at least 32 characters>
AUTH_REQUIRED=false
ALLOWED_ORIGINS=https://<your-vercel-domain>
PYTHON_VERSION=3.11.11
```

Keep `AUTH_REQUIRED=false` for the first deployment. Register and test farmer and buyer accounts, then change it to `true` and redeploy when protected mutations are ready for all users.

Optional production providers:

```text
S3_ENDPOINT_URL=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

The service creates missing database tables and imports the retained example listing on startup. Confirm both `/health` and `/readiness`; readiness reports which optional providers are not configured.

## 2. Vercel frontend

Set the project root directory to `frontend` and add:

```text
VITE_API_URL=https://<your-render-service>.onrender.com
```

Use the Render service root URL without `/health`, `/docs`, or a trailing `/api`. Redeploy Vercel after changing any `VITE_` variable because Vite embeds it during the build.

## 3. Safe rollout checks

1. Open the Render `/health` URL and confirm `status` is `online`.
2. Open `/readiness` and confirm the database check is ready.
3. Open the Vercel site in a private browser window.
4. Test sign-in, farmer switching, crop recommendations, marketplace listings, seller comparison, and order tracking.
5. Upload a soil card and confirm extracted values before saving them.
6. Test a payment only after Razorpay test credentials and webhook handling are configured.

## 4. Security notes

- Never commit `.env` files or paste live database passwords into issues or screenshots.
- Rotate any credential that has been shared publicly and update Render immediately.
- Restrict CORS to the deployed Vercel domain.
- Use HTTPS provider URLs only.
- Back up Neon before schema or seed changes.

## Known production dependencies

OCR needs Tesseract installed in the backend runtime. File storage falls back locally when S3-compatible storage is not configured, but free Render files are not durable. GPS locations require a driver device or logistics provider to submit coordinates. Payments require Razorpay credentials and production webhook/reconciliation work. These integrations show an explicit unavailable state instead of pretending to be live.
