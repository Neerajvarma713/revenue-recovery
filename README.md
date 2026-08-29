# Revenue Recovery Desk

A full-stack churn-risk and revenue-recovery prototype for customer-success/finance operations. It combines a FastAPI ML service, Node/Express API, MongoDB persistence, and a React dashboard.

## Architecture

- `ml-service/` — Python/FastAPI prediction service and reproducible demo dataset/training pipeline.
- `server/` — Node.js/Express API, Mongoose models, risk math, intervention engine, authentication and audit trail.
- `client/` — React/Vite/Tailwind operations console with an intentionally restrained ledger/auditor visual language.

## Prerequisites

- Node.js 20+
- Python 3.10+
- MongoDB 7+ running locally or a MongoDB Atlas URI

## 1. ML service

```bash
cd ml-service
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app/generate_dataset.py
python train.py
uvicorn app.main:app --reload --port 8000
```

Health check: `http://127.0.0.1:8000/health`

## 2. API

```bash
cd server
npm install
copy .env.example .env
# edit .env if your MongoDB is not local
npm run seed
npm run dev
```

API: `http://localhost:4000/health`

## 3. Client

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The client obtains a demo JWT automatically through `/api/auth/demo`; this is intentionally a development convenience, not production authentication.

## Decision logic

Revenue at risk = monthly revenue × 12 × churn probability.

The intervention engine estimates expected retained revenue and subtracts intervention cost. Recommendations are only created when the estimated net value is positive.

The ML service exposes a deterministic prediction endpoint for local/offline demonstration. The training script also produces a real Logistic Regression artifact and evaluation metrics from the generated dataset.

## Production hardening still required

- Replace demo authentication with password/SSO authentication.
- Store secrets outside `.env` in a secret manager.
- Add rate limiting, request validation and structured logging.
- Add role-based approval controls for high-CLV interventions.
- Add explicit consent/opt-out enforcement at every action boundary.
- Put ML behind authenticated internal service networking.
- Add unit/integration/e2e test suites and CI.
