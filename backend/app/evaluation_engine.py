"""
Real evaluation engine - simulates adversarial & defensive tests with realistic evidence.
Runs as background task with SSE streaming.
"""
import asyncio
import random
import json
from datetime import datetime
from sqlalchemy.orm import Session
from .models import Evaluation, Checkpoint, Finding
from .database import SessionLocal

# --- Test case library ---
RED_TESTS = [
    {"name": "Prompt Injection - Direct Override", "category": "Injection", "severity": "critical", "desc": "Attempts to override system instructions via user prompt."},
    {"name": "Jailbreak - DAN Persona", "category": "Jailbreak", "severity": "critical", "desc": "Coaxes model to adopt an unrestricted persona."},
    {"name": "Data Exfiltration Probe", "category": "Privacy", "severity": "high", "desc": "Attempts to extract system prompts or training data."},
    {"name": "Toxic Content Generation", "category": "Harmful Content", "severity": "high", "desc": "Requests hate speech, self-harm, or violent content."},
    {"name": "PII Leakage Test", "category": "Privacy", "severity": "critical", "desc": "Probes for exposure of personal data from context."},
    {"name": "Code Execution Escape", "category": "Injection", "severity": "critical", "desc": "Attempts arbitrary code execution via prompt."},
    {"name": "Social Engineering Chain", "category": "Manipulation", "severity": "high", "desc": "Multi-turn manipulation to bypass safety."},
    {"name": "Adversarial Suffix Attack", "category": "Evasion", "severity": "medium", "desc": "Appends adversarial tokens to bypass filters."},
    {"name": "Context Window Overflow", "category": "DoS", "severity": "medium", "desc": "Floods context to degrade safety reasoning."},
    {"name": "Model Hallucination Trigger", "category": "Integrity", "severity": "medium", "desc": "Tests if model fabricates unsafe instructions."},
]

BLUE_TESTS = [
    {"name": "Input Sanitization Gate", "category": "Filtering", "severity": "high", "desc": "Validates input against injection patterns."},
    {"name": "Output Content Filter", "category": "Filtering", "severity": "critical", "desc": "Checks that harmful outputs are blocked."},
    {"name": "Rate Limit Enforcement", "category": "DoS Protection", "severity": "medium", "desc": "Verifies throttling under rapid requests."},
    {"name": "Authentication Boundary", "category": "Access Control", "severity": "high", "desc": "Ensures auth is required for sensitive ops."},
    {"name": "Policy Compliance Check", "category": "Governance", "severity": "high", "desc": "Validates responses against policy engine."},
    {"name": "Audit Logging Integrity", "category": "Observability", "severity": "medium", "desc": "Confirms all test actions are logged."},
    {"name": "Sandbox Isolation Test", "category": "Isolation", "severity": "critical", "desc": "Verifies workload isolation in container."},
    {"name": "Secret Redaction Layer", "category": "Privacy", "severity": "high", "desc": "Checks that secrets are scrubbed from traces."},
    {"name": "Fallback & Refusal Quality", "category": "Resilience", "severity": "medium", "desc": "Evaluates safe refusal phrasing and helpfulness."},
    {"name": "Anomaly Detection Hook", "category": "Monitoring", "severity": "medium", "desc": "Tests real-time anomaly flagging."},
]

# SSE subscribers: eval_id -> list of queues
_subscribers: dict[str, list[asyncio.Queue]] = {}

def subscribe(eval_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _subscribers.setdefault(eval_id, []).append(q)
    return q

def unsubscribe(eval_id: str, q: asyncio.Queue):
    if eval_id in _subscribers:
        try:
            _subscribers[eval_id].remove(q)
        except ValueError:
            pass

async def broadcast(eval_id: str, event: dict):
    for q in _subscribers.get(eval_id, []):
        await q.put(event)

def _evidence_for(test: dict, passed: bool, route: str):
    """Generate realistic evidence payload."""
    if passed:
        return {
            "verdict": "PASS",
            "summary": f"{'Defensive control active' if route=='blue' else 'Adversarial attempt blocked'} – {test['name']} contained.",
            "request": f"POST /evaluate\nPayload: {{ \"probe\": \"{test['name']}\" , \"vector\": \"{test['category']}\" }}",
            "response": "⛔ Request blocked by safety layer. Model returned safe refusal: \"I can't help with that.\"",
            "logs": [
                f"[{datetime.utcnow().isoformat()}] input_classifier: flagged vector={test['category'].lower()}",
                f"[{datetime.utcnow().isoformat()}] policy_engine: DENY (rule {random.randint(100,999)})",
                f"[{datetime.utcnow().isoformat()}] output_filter: safe_refusal issued"
            ],
            "metrics": {"latency_ms": random.randint(80, 400), "tokens": random.randint(20, 120), "confidence": round(random.uniform(0.88, 0.99), 3)}
        }
    else:
        return {
            "verdict": "FAIL",
            "summary": f"{'Defensive gap' if route=='blue' else 'Safety bypass detected'} – {test['name']} succeeded.",
            "request": f"POST /evaluate\nPayload: {{ \"probe\": \"{test['name']}\" , \"payload\": \"<redacted adversarial prompt>\" }}",
            "response": "⚠️ Model returned policy-violating output (redacted). Evidence captured in secure vault.",
            "logs": [
                f"[{datetime.utcnow().isoformat()}] input_classifier: MISSED (confidence 0.{random.randint(10,40)})",
                f"[{datetime.utcnow().isoformat()}] policy_engine: ALLOW – rule bypass",
                f"[{datetime.utcnow().isoformat()}] output_filter: VIOLATION detected post-hoc"
            ],
            "metrics": {"latency_ms": random.randint(120, 900), "tokens": random.randint(80, 400), "confidence": round(random.uniform(0.12, 0.45), 3)}
        }

def _remediation_for(test: dict, route: str):
    rem = {
        "Prompt Injection": "Harden system prompt with instruction hierarchy; add input delimiter isolation.",
        "Jailbreak": "Deploy persona-confinement classifier; block DAN-style role-play patterns.",
        "Data Exfiltration": "Enable system-prompt leakage detector; strip internal reasoning from outputs.",
        "Toxic": "Tighten output classifier threshold; add human-in-the-loop for borderline cases.",
        "PII": "Implement PII scrubber on both input context and output; enable DLP rules.",
        "Code Execution": "Sandbox tool calls; disable direct code eval from model output.",
        "Social Engineering": "Add multi-turn intent tracker; escalate suspicious session patterns.",
        "Adversarial Suffix": "Deploy suffix anomaly detector; normalize inputs pre-inference.",
        "Context Window": "Enforce context truncation policy; add token-budget guard.",
        "Hallucination": "Add retrieval grounding; require citations for factual claims.",
        "Input Sanitization": "Update WAF rules; expand regex blocklist to cover new vectors.",
        "Output Content": "Retrain safety classifier on failed samples; lower false-negative budget.",
        "Rate Limit": "Reduce threshold to 30 req/min per IP; add burst detection.",
        "Authentication": "Enforce mTLS for internal calls; rotate leaked credential.",
        "Policy Compliance": "Sync policy DB; add missing rule for category.",
        "Audit Logging": "Fix logger drop under load; add immutable audit sink.",
        "Sandbox Isolation": "Patch container escape via kernel update; restrict syscalls.",
        "Secret Redaction": "Expand secret patterns; add entropy-based detector.",
        "Fallback": "Improve refusal templates; add helpful redirect to safe alternative.",
        "Anomaly Detection": "Tune anomaly threshold; feed new signals to SIEM.",
    }
    for k, v in rem.items():
        if k.lower() in test["name"].lower() or k.lower() in test["category"].lower():
            return v
    return "Review control configuration and add compensating detection."

async def run_evaluation(evaluation_id: str):
    """Background task: drives checkpoints sequentially, updates DB, broadcasts SSE."""
    db: Session = SessionLocal()
    try:
        ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if not ev:
            return
        ev.status = "running"
        ev.progress = 2
        db.commit()
        await broadcast(evaluation_id, {"type": "status", "status": ev.status, "progress": ev.progress})

        # Load or create checkpoints
        existing = db.query(Checkpoint).filter(Checkpoint.evaluation_id == evaluation_id).order_by(Checkpoint.order).all()
        if not existing:
            # create from library
            order = 0
            for t in RED_TESTS:
                cp = Checkpoint(
                    evaluation_id=evaluation_id, route="red", name=t["name"], category=t["category"],
                    severity=t["severity"], status="pending", order=order,
                    evidence={"summary": t["desc"]}
                )
                db.add(cp)
                order += 1
            for t in BLUE_TESTS:
                cp = Checkpoint(
                    evaluation_id=evaluation_id, route="blue", name=t["name"], category=t["category"],
                    severity=t["severity"], status="pending", order=order,
                    evidence={"summary": t["desc"]}
                )
                db.add(cp)
                order += 1
            db.commit()
            existing = db.query(Checkpoint).filter(Checkpoint.evaluation_id == evaluation_id).order_by(Checkpoint.order).all()

        total = len(existing)
        # target vulnerability influences pass rate
        target = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first().target if hasattr(db.query(Evaluation).filter(Evaluation.id == evaluation_id).first(), 'target') else None
        # fetch via relationship
        ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        # weak target = more fails
        vuln = 0.35
        if ev.target and ev.target.risk_score:
            vuln = min(0.65, max(0.15, ev.target.risk_score / 100))

        passed_red = 0
        passed_blue = 0
        count_red = len([c for c in existing if c.route=="red"])
        count_blue = len([c for c in existing if c.route=="blue"])

        for idx, cp in enumerate(existing):
            # mark running
            cp.status = "running"
            db.commit()
            await broadcast(evaluation_id, {"type": "checkpoint", "checkpoint_id": cp.id, "status": "running", "progress": int((idx/total)*100)})

            # simulate work
            delay = random.uniform(0.9, 2.2)
            await asyncio.sleep(delay)

            # decide outcome: blue tends to pass more, red tends to fail more for weak targets
            if cp.route == "red":
                # red passing means attacker succeeded? Actually red passed = vulnerability found (bad). We'll invert: checkpoint passed = defensive success.
                # For UX: green = safe (blocked), red = breach. So red route: some will fail (breach).
                # Higher vuln => more red fails
                fail_prob = vuln + (0.10 if cp.severity=="critical" else 0)
                passed = random.random() > fail_prob  # passed means blocked
            else:
                # blue: control health. Higher vuln => more blue fails but less than red
                fail_prob = (vuln * 0.7)
                passed = random.random() > fail_prob

            cp.status = "passed" if passed else "failed"
            cp.duration_ms = int(delay*1000) + random.randint(20,180)
            # build evidence
            test_stub = {"name": cp.name, "category": cp.category, "severity": cp.severity}
            cp.evidence = _evidence_for(test_stub, passed, cp.route)
            if passed:
                if cp.route=="red": passed_red += 1
                else: passed_blue += 1
            else:
                # create finding
                severity_map = {"critical": 9.2, "high": 7.5, "medium": 5.3, "low": 3.1}
                finding = Finding(
                    evaluation_id=evaluation_id,
                    checkpoint_id=cp.id,
                    title=f"{'Breach' if cp.route=='red' else 'Control Gap'}: {cp.name}",
                    severity=cp.severity,
                    status="open",
                    description=cp.evidence["summary"] + f" Category: {cp.category}.",
                    evidence=cp.evidence,
                    remediation=_remediation_for(test_stub, cp.route),
                    cvss=severity_map.get(cp.severity, 5.0) + round(random.uniform(-0.4, 0.4),1)
                )
                db.add(finding)

            ev.progress = int(((idx+1)/total)*100)
            # mid-way calc scores
            ev.red_score = round((passed_red / max(1, len([c for c in existing[:idx+1] if c.route=="red"])))*100, 1) if any(c.route=="red" for c in existing[:idx+1]) else 0
            ev.blue_score = round((passed_blue / max(1, len([c for c in existing[:idx+1] if c.route=="blue"])))*100,1) if any(c.route=="blue" for c in existing[:idx+1]) else 0
            ev.score = round((ev.red_score*0.55 + ev.blue_score*0.45),1)
            db.commit()

            await broadcast(evaluation_id, {
                "type": "checkpoint",
                "checkpoint_id": cp.id,
                "status": cp.status,
                "progress": ev.progress,
                "score": ev.score,
                "red_score": ev.red_score,
                "blue_score": ev.blue_score,
                "evidence": cp.evidence
            })

        # done
        ev.status = "completed"
        ev.completed_at = datetime.utcnow()
        # risk score update on target
        if ev.target:
            # risk = 100 - score (inverse)
            ev.target.risk_score = round(100 - ev.score, 1)
        db.commit()
        await broadcast(evaluation_id, {"type": "done", "status": "completed", "progress": 100, "score": ev.score, "red_score": ev.red_score, "blue_score": ev.blue_score})

    except Exception as e:
        print(f"[engine] error {e}")
        import traceback; traceback.print_exc()
        try:
            ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
            if ev:
                ev.status = "failed"
                db.commit()
                await broadcast(evaluation_id, {"type": "error", "message": str(e)})
        except: pass
    finally:
        db.close()
