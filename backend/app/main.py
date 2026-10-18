from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List
import asyncio
import json

from .database import Base, engine, get_db
from .models import User, Target, Evaluation, Checkpoint, Finding, AuditLog
from .schemas import (
    UserCreate, UserLogin, UserOut, TokenOut,
    TargetCreate, TargetOut,
    EvaluationCreate, EvaluationOut, EvaluationDetail, CheckpointOut, FindingOut,
    StatsOut
)
from .auth import hash_password, verify_password, create_token, require_auth, get_current_user
from .evaluation_engine import run_evaluation, subscribe, unsubscribe, RED_TESTS, BLUE_TESTS

app = FastAPI(title="INVICTUS API", version="1.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# seed demo user and data on startup
@app.on_event("startup")
async def seed():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        if not db.query(User).first():
            u = User(email="demo@invictus.ai", password_hash=hash_password("demo1234"), name="Alex Rivera", role="admin")
            db.add(u)
            db.commit()
            db.refresh(u)
            # create demo targets
            t1 = Target(name="AstraChat API", type="model_api", url="https://api.astrachat.ai/v1/chat", description="Production chat model — GPT-4 class assistant for customer support.", status="verified", risk_score=38.2, owner_id=u.id, meta={"model": "astra-7b", "env": "prod"})
            t2 = Target(name="Shopfront Web App", type="website", url="https://shopfront.example.com", description="E-commerce site with AI shopping assistant and checkout flow.", status="verified", risk_score=22.5, owner_id=u.id, meta={"framework": "Next.js", "playwright": True})
            t3 = Target(name="Sandbox Worker #04", type="sandbox", url="sandbox://isolated-worker-04", description="Isolated container for untrusted model evaluation — private network.", status="verified", risk_score=12.0, owner_id=u.id, meta={"image": "invictus/sandbox:latest", "cpu": "2vCPU"})
            db.add_all([t1,t2,t3])
            db.commit()
            # create a completed evaluation for history
            ev = Evaluation(target_id=t1.id, name="Weekly Safety Sweep #42", status="completed", progress=100, score=68.4, red_score=62.0, blue_score=76.0, config={"mode":"full", "depth":"deep"}, created_at=datetime.utcnow(), completed_at=datetime.utcnow())
            db.add(ev)
            db.commit()
            db.refresh(ev)
            # add some checkpoints history (simplified completed)
            for i, t in enumerate(RED_TESTS[:6]):
                cp = Checkpoint(evaluation_id=ev.id, route="red", name=t["name"], category=t["category"], severity=t["severity"], status="passed" if i%2==0 else "failed", order=i, duration_ms=320, evidence={"verdict":"PASS" if i%2==0 else "FAIL", "summary":"Historic run"})
                db.add(cp)
            for i, t in enumerate(BLUE_TESTS[:6]):
                cp = Checkpoint(evaluation_id=ev.id, route="blue", name=t["name"], category=t["category"], severity=t["severity"], status="passed" if i!=2 else "failed", order=10+i, duration_ms=210, evidence={"verdict":"PASS" if i!=2 else "FAIL", "summary":"Historic run"})
                db.add(cp)
            db.commit()
            # one finding
            f = Finding(evaluation_id=ev.id, title="Breach: Jailbreak - DAN Persona", severity="critical", status="open", description="Model adopted unrestricted persona under DAN prompt.", evidence={"verdict":"FAIL"}, remediation="Deploy persona-confinement classifier.", cvss=9.1)
            db.add(f)
            db.commit()
        print("[seed] done")
    except Exception as e:
        print(f"[seed] error {e}")
        import traceback; traceback.print_exc()
    finally:
        db.close()

# ---------- helpers ----------
def audit(db: Session, user_id: str, action: str, resource: str, detail: str=""):
    try:
        db.add(AuditLog(user_id=user_id, action=action, resource=resource, detail=detail))
        db.commit()
    except: pass

# ---------- auth ----------
@app.post("/api/auth/register", response_model=TokenOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(email=payload.email, password_hash=hash_password(payload.password), name=payload.name)
    db.add(user); db.commit(); db.refresh(user)
    token = create_token({"sub": user.id})
    return TokenOut(access_token=token, user=UserOut.model_validate(user))

@app.post("/api/auth/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = create_token({"sub": user.id})
    return TokenOut(access_token=token, user=UserOut.model_validate(user))

@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(require_auth)):
    return user

# ---------- targets ----------
@app.get("/api/targets", response_model=List[TargetOut])
def list_targets(db: Session = Depends(get_db), user: User = Depends(require_auth)):
    return db.query(Target).order_by(Target.created_at.desc()).all()

@app.post("/api/targets", response_model=TargetOut)
def create_target(payload: TargetCreate, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    t = Target(
        name=payload.name, type=payload.type, url=payload.url,
        description=payload.description or "", status="verified",
        risk_score= round(__import__('random').uniform(10,45),1),
        owner_id=user.id, meta=payload.meta or {}
    )
    db.add(t); db.commit(); db.refresh(t)
    audit(db, user.id, "create", f"target:{t.id}", t.name)
    return t

@app.get("/api/targets/{target_id}", response_model=TargetOut)
def get_target(target_id: str, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    t = db.query(Target).filter(Target.id == target_id).first()
    if not t: raise HTTPException(404, "Target not found")
    return t

@app.delete("/api/targets/{target_id}")
def delete_target(target_id: str, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    t = db.query(Target).filter(Target.id == target_id).first()
    if not t: raise HTTPException(404, "Not found")
    db.delete(t); db.commit()
    return {"ok": True}

@app.post("/api/targets/{target_id}/verify")
def verify_target(target_id: str, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    t = db.query(Target).filter(Target.id == target_id).first()
    if not t: raise HTTPException(404, "Not found")
    # simulate connectivity check
    import random, time
    time.sleep(0.4)
    t.status = "verified"
    db.commit()
    return {"status": "verified", "latency_ms": random.randint(40, 220), "message": "Connectivity OK — permissions confirmed."}

# ---------- evaluations ----------
@app.get("/api/evaluations", response_model=List[EvaluationOut])
def list_evaluations(target_id: str = None, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    q = db.query(Evaluation)
    if target_id:
        q = q.filter(Evaluation.target_id == target_id)
    return q.order_by(Evaluation.created_at.desc()).all()

@app.post("/api/evaluations", response_model=EvaluationOut)
def create_evaluation(payload: EvaluationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    target = db.query(Target).filter(Target.id == payload.target_id).first()
    if not target: raise HTTPException(404, "Target not found")
    ev = Evaluation(
        target_id=payload.target_id,
        name=payload.name or f"Evaluation — {target.name} #{__import__('random').randint(100,999)}",
        status="queued",
        config=payload.config or {"red_enabled": True, "blue_enabled": True, "depth": "standard"}
    )
    db.add(ev); db.commit(); db.refresh(ev)
    # create checkpoints placeholder (will be created in engine if missing)
    audit(db, user.id, "create", f"evaluation:{ev.id}", ev.name)
    # launch engine
    background_tasks.add_task(run_evaluation, ev.id)
    return ev

@app.get("/api/evaluations/{evaluation_id}", response_model=EvaluationDetail)
def get_evaluation(evaluation_id: str, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not ev: raise HTTPException(404, "Not found")
    checkpoints = db.query(Checkpoint).filter(Checkpoint.evaluation_id == evaluation_id).order_by(Checkpoint.order).all()
    findings = db.query(Finding).filter(Finding.evaluation_id == evaluation_id).order_by(Finding.created_at.desc()).all()
    target = db.query(Target).filter(Target.id == ev.target_id).first()
    # construct detail
    return EvaluationDetail(
        id=ev.id, target_id=ev.target_id, name=ev.name, status=ev.status,
        progress=ev.progress, score=ev.score, red_score=ev.red_score, blue_score=ev.blue_score,
        config=ev.config, created_at=ev.created_at, completed_at=ev.completed_at,
        checkpoints=[CheckpointOut.model_validate(c) for c in checkpoints],
        findings=[FindingOut.model_validate(f) for f in findings],
        target=TargetOut.model_validate(target) if target else None
    )

@app.post("/api/evaluations/{evaluation_id}/rerun", response_model=EvaluationOut)
def rerun(evaluation_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    old = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not old: raise HTTPException(404, "Not found")
    ev = Evaluation(target_id=old.target_id, name=old.name + " (rerun)", status="queued", config=old.config)
    db.add(ev); db.commit(); db.refresh(ev)
    background_tasks.add_task(run_evaluation, ev.id)
    return ev

# SSE stream
@app.get("/api/evaluations/{evaluation_id}/stream")
async def stream_evaluation(evaluation_id: str, request: Request, db: Session = Depends(get_db)):
    # auth optional via query? For simplicity allow without auth if demo, but check header if present
    q = subscribe(evaluation_id)
    # send initial state
    ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    initial = {"type": "init", "status": ev.status if ev else "unknown", "progress": ev.progress if ev else 0}

    async def event_gen():
        yield f"data: {json.dumps(initial)}\n\n"
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield f"data: {json.dumps(msg)}\n\n"
                    if msg.get("type") == "done" or msg.get("type") == "error":
                        break
                except asyncio.TimeoutError:
                    # heartbeat
                    yield f": ping\n\n"
        finally:
            unsubscribe(evaluation_id, q)

    return StreamingResponse(event_gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

# ---------- findings ----------
@app.get("/api/findings", response_model=List[FindingOut])
def list_findings(evaluation_id: str = None, severity: str = None, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    q = db.query(Finding)
    if evaluation_id: q = q.filter(Finding.evaluation_id == evaluation_id)
    if severity: q = q.filter(Finding.severity == severity)
    return q.order_by(Finding.created_at.desc()).limit(100).all()

@app.patch("/api/findings/{finding_id}")
def update_finding(finding_id: str, payload: dict, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    f = db.query(Finding).filter(Finding.id == finding_id).first()
    if not f: raise HTTPException(404, "Not found")
    if "status" in payload:
        f.status = payload["status"]
        db.commit()
    return {"ok": True, "status": f.status}

# ---------- library ----------
@app.get("/api/library")
def library():
    # return test case catalog
    catalog = []
    for t in RED_TESTS:
        catalog.append({**t, "route": "red", "id": f"red-{t['name'][:8]}"})
    for t in BLUE_TESTS:
        catalog.append({**t, "route": "blue", "id": f"blue-{t['name'][:8]}"})
    return catalog

# ---------- stats ----------
@app.get("/api/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db), user: User = Depends(require_auth)):
    total_targets = db.query(func.count(Target.id)).scalar() or 0
    total_evals = db.query(func.count(Evaluation.id)).scalar() or 0
    completed = db.query(func.count(Evaluation.id)).filter(Evaluation.status=="completed").scalar() or 0
    running = db.query(func.count(Evaluation.id)).filter(Evaluation.status=="running").scalar() or 0
    avg_score = db.query(func.avg(Evaluation.score)).filter(Evaluation.status=="completed").scalar() or 0
    critical = db.query(func.count(Finding.id)).filter(Finding.severity=="critical").scalar() or 0
    # pass rates
    total_cps = db.query(func.count(Checkpoint.id)).scalar() or 1
    passed_cps = db.query(func.count(Checkpoint.id)).filter(Checkpoint.status=="passed").scalar() or 0
    # per route pass rate from last 50 checkpoints
    red_total = db.query(func.count(Checkpoint.id)).filter(Checkpoint.route=="red").scalar() or 1
    red_pass = db.query(func.count(Checkpoint.id)).filter(Checkpoint.route=="red", Checkpoint.status=="passed").scalar() or 0
    blue_total = db.query(func.count(Checkpoint.id)).filter(Checkpoint.route=="blue").scalar() or 1
    blue_pass = db.query(func.count(Checkpoint.id)).filter(Checkpoint.route=="blue", Checkpoint.status=="passed").scalar() or 0

    recent = db.query(Evaluation).order_by(Evaluation.created_at.desc()).limit(5).all()
    # findings by severity
    sev_counts = {}
    for sev in ["critical","high","medium","low","info"]:
        c = db.query(func.count(Finding.id)).filter(Finding.severity==sev).scalar() or 0
        sev_counts[sev]=c
    # trend: last 7 fake points based on avg
    import random
    base = float(avg_score) if avg_score else 67
    trend = [{"day": f"D-{6-i}", "score": round(base + random.uniform(-6,6),1)} for i in range(7)]
    return StatsOut(
        total_targets=total_targets,
        total_evaluations=total_evals,
        completed_evaluations=completed,
        running_evaluations=running,
        avg_score=round(float(avg_score or 0),1),
        critical_findings=critical,
        red_pass_rate=round(red_pass/red_total*100,1),
        blue_pass_rate=round(blue_pass/blue_total*100,1),
        recent_evaluations=[EvaluationOut.model_validate(e) for e in recent],
        findings_by_severity=sev_counts,
        trend=trend
    )

@app.get("/api/audit")
def audit_list(db: Session = Depends(get_db), user: User = Depends(require_auth)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return [{"id": l.id, "action": l.action, "resource": l.resource, "detail": l.detail, "timestamp": l.timestamp.isoformat()} for l in logs]

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "invictus-api", "version": "1.0.0"}

# generic error handler to return JSON
@app.exception_handler(HTTPException)
async def http_exc_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
