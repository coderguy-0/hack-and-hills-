import axios from 'axios'

export const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('invictus_token')
  if (token) (cfg.headers as any).Authorization = `Bearer ${token}`
  return cfg
})

export type Target = {
  id: string; name: string; type: string; url: string; description: string; status: string; risk_score: number; created_at: string; meta: any
}
export type Checkpoint = {
  id: string; route: string; name: string; category: string; status: string; severity: string; evidence: any; duration_ms: number; order: number
}
export type Finding = {
  id: string; checkpoint_id?: string; title: string; severity: string; status: string; description: string; evidence: any; remediation?: string; cvss: number; created_at: string
}
export type Evaluation = {
  id: string; target_id: string; name: string; status: string; progress: number; score: number; red_score: number; blue_score: number; config: any; created_at: string; completed_at?: string
}
export type EvaluationDetail = Evaluation & { checkpoints: Checkpoint[]; findings: Finding[]; target?: Target }
export type Stats = {
  total_targets: number; total_evaluations: number; completed_evaluations: number; running_evaluations: number
  avg_score: number; critical_findings: number; red_pass_rate: number; blue_pass_rate: number
  recent_evaluations: Evaluation[]; findings_by_severity: Record<string, number>; trend: {day:string; score:number}[]
}
