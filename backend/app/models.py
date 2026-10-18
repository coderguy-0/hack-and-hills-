from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import uuid

def gen_id():
    return str(uuid.uuid4())[:8]

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    role = Column(String, default="analyst")  # admin, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)

class Target(Base):
    __tablename__ = "targets"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String)
    type = Column(String)  # website, model_api, sandbox
    url = Column(String)
    description = Column(Text)
    status = Column(String, default="verified")  # verified, pending, offline
    risk_score = Column(Float, default=0.0)
    owner_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    meta = Column(JSON, default={})
    evaluations = relationship("Evaluation", back_populates="target")

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(String, primary_key=True, default=gen_id)
    target_id = Column(String, ForeignKey("targets.id"))
    name = Column(String)
    status = Column(String, default="queued")  # queued, running, completed, failed
    progress = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    red_score = Column(Float, default=0.0)
    blue_score = Column(Float, default=0.0)
    config = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    target = relationship("Target", back_populates="evaluations")
    checkpoints = relationship("Checkpoint", back_populates="evaluation", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="evaluation", cascade="all, delete-orphan")

class Checkpoint(Base):
    __tablename__ = "checkpoints"
    id = Column(String, primary_key=True, default=gen_id)
    evaluation_id = Column(String, ForeignKey("evaluations.id"))
    route = Column(String)  # red, blue
    name = Column(String)
    category = Column(String)
    status = Column(String, default="pending")  # pending, running, passed, failed, blocked
    severity = Column(String, default="medium")
    evidence = Column(JSON, default={})
    duration_ms = Column(Integer, default=0)
    order = Column(Integer, default=0)
    evaluation = relationship("Evaluation", back_populates="checkpoints")

class Finding(Base):
    __tablename__ = "findings"
    id = Column(String, primary_key=True, default=gen_id)
    evaluation_id = Column(String, ForeignKey("evaluations.id"))
    checkpoint_id = Column(String, ForeignKey("checkpoints.id"), nullable=True)
    title = Column(String)
    severity = Column(String)  # critical, high, medium, low, info
    status = Column(String, default="open")  # open, acknowledged, fixed
    description = Column(Text)
    evidence = Column(JSON, default={})
    remediation = Column(Text)
    cvss = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    evaluation = relationship("Evaluation", back_populates="findings")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String)
    action = Column(String)
    resource = Column(String)
    detail = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
