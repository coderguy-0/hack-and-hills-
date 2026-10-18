from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TargetCreate(BaseModel):
    name: str
    type: str
    url: str
    description: Optional[str] = None
    meta: Optional[Dict[str, Any]] = {}

class TargetOut(BaseModel):
    id: str
    name: str
    type: str
    url: str
    description: Optional[str]
    status: str
    risk_score: float
    created_at: datetime
    meta: Dict[str, Any] = {}
    class Config:
        from_attributes = True

class CheckpointOut(BaseModel):
    id: str
    route: str
    name: str
    category: str
    status: str
    severity: str
    evidence: Dict[str, Any] = {}
    duration_ms: int
    order: int
    class Config:
        from_attributes = True

class FindingOut(BaseModel):
    id: str
    checkpoint_id: Optional[str]
    title: str
    severity: str
    status: str
    description: str
    evidence: Dict[str, Any] = {}
    remediation: Optional[str]
    cvss: float
    created_at: datetime
    class Config:
        from_attributes = True

class EvaluationCreate(BaseModel):
    target_id: str
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = {}

class EvaluationOut(BaseModel):
    id: str
    target_id: str
    name: Optional[str]
    status: str
    progress: int
    score: float
    red_score: float
    blue_score: float
    config: Dict[str, Any] = {}
    created_at: datetime
    completed_at: Optional[datetime]
    class Config:
        from_attributes = True

class EvaluationDetail(EvaluationOut):
    checkpoints: List[CheckpointOut] = []
    findings: List[FindingOut] = []
    target: Optional[TargetOut] = None

class TestCaseDef(BaseModel):
    id: str
    name: str
    route: str
    category: str
    severity: str
    description: str
    remediation: str

class StatsOut(BaseModel):
    total_targets: int
    total_evaluations: int
    completed_evaluations: int
    running_evaluations: int
    avg_score: float
    critical_findings: int
    red_pass_rate: float
    blue_pass_rate: float
    recent_evaluations: List[EvaluationOut] = []
    findings_by_severity: Dict[str, int] = {}
    trend: List[Dict[str, Any]] = []
