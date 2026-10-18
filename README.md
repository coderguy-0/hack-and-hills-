# 🏔️ INVICTUS — AI Safety Evaluator

> **Every AI safety test is a climb toward trust.**

Unified adversarial AI safety testing — controlled Red / Blue routes, evidence-backed findings, and a single view from **Base Camp → The Ascent → The Summit**.

---

### ✨ Live Demo

- **Frontend (Console):** `http://localhost:5173` — Mountain UI, live evaluations, evidence inspector
- **Backend API:** `http://localhost:8000/api/health` — FastAPI + SSE streaming
- **API Docs:** `http://localhost:8000/api/docs`

Demo credentials: `demo@invictus.ai` / `demo1234` (pre-seeded with targets & history)

---

### 🏗️ Architecture

```
User → Dashboard (Vite + React + Tailwind + Framer Motion + Recharts)
        ↕ (REST + SSE)
Backend API (FastAPI + SQLAlchemy + JWT + RBAC)
        ↕
Evaluation Queue → Evaluation Worker (Playwright adapters • Sandbox)
        ↕
Storage (SQLite/PostgreSQL: targets, evaluations, findings, audit)
        ↕
Scoring & Evidence → Dashboard & Final Report
```

Isolated environments: **Red-team machine** (adversarial), **Blue-team machine** (defensive), **Model environment** — private network, resource limits, audit integrity.

---

### 🚀 Quick Start

```bash
# backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# frontend (new terminal)
cd frontend
npm install
npm run dev   # proxy /api → localhost:8000
```

Or one-liner:

```bash
./start.sh
```

---

### 🧭 The Journey

| Phase | Route | What happens |
|-------|-------|--------------|
| **01 Base Camp** | Setup | Register authorized target (Website / Model API / Sandbox), configure evaluation, verify connectivity |
| **02 The Ascent** | Red & Blue | Controlled adversarial tests (Red) + defensive controls (Blue). Click checkpoints for request/response/logs/metrics. SSE live updates. |
| **03 The Summit** | Results | Findings, risk scores, remediation guidance, exportable audit-ready report |

---

### 🔒 Security

- JWT auth + RBAC (admin / analyst / viewer)
- Separation between Red, Blue, model workers
- Restricted network access, resource limits, credential protection
- Immutable audit trail

---

### 📚 Test Library (20 vectors)

**Red (adversarial):** Prompt Injection, Jailbreak DAN, Data Exfiltration, Toxic Content, PII Leakage, Code Execution Escape, Social Engineering Chain, Adversarial Suffix, Context Overflow, Hallucination Trigger

**Blue (defensive):** Input Sanitization, Output Filter, Rate Limit, Auth Boundary, Policy Compliance, Audit Logging, Sandbox Isolation, Secret Redaction, Fallback Quality, Anomaly Detection

---

### 🏔️ Team — INVICTUS

- **MD Rashid Hussain** — Frontend & Design
- **Arpit Kumar** — Backend & Logic

*Theme: Securing Adversarial AI Safety Testing Infrastructure — Hack & Hills 2025*

---

### 📄 License

MIT — For authorized safety testing only.
