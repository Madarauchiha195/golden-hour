'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { FiCheck, FiClock, FiAlertTriangle, FiLoader, FiChevronDown, FiTarget, FiHeart, FiMapPin, FiTruck, FiMessageSquare, FiUsers, FiShield, FiFileText, FiActivity, FiPhone } from 'react-icons/fi'

export interface CoordinationResult {
  triage?: any
  risk_prediction?: any
  traffic_eta?: any
  routing?: any
  ambulance_dispatch?: any
  handoff_notification?: any
  family_notification?: any
  doctor_prep?: any
  case_summary?: any
  qa_result?: any
  coordination_status?: string
  coordination_notes?: string
}

export type StepStatus = 'pending' | 'running' | 'complete' | 'error'

export interface WorkflowStep {
  id: string
  name: string
  agent: string
  status: StepStatus
  icon: React.ReactNode
}

interface WorkflowProgressProps {
  steps: WorkflowStep[]
  isProcessing: boolean
}

export function WorkflowProgress({ steps, isProcessing }: WorkflowProgressProps) {
  const completedCount = steps.filter(s => s.status === 'complete').length
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0

  return (
    <Card className="h-full bg-card border-border flex flex-col">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-foreground">Workflow Pipeline</CardTitle>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">{completedCount}/{steps.length}</Badge>
        </div>
        <Progress value={progress} className="h-1 mt-1" />
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-3 pb-3 space-y-0.5">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-2 py-1.5">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-[11px] ${step.status === 'complete' ? 'bg-accent/20 text-accent' : step.status === 'running' ? 'bg-primary/20 text-primary animate-pulse' : step.status === 'error' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                    {step.status === 'complete' ? <FiCheck className="w-3 h-3" /> : step.status === 'running' ? <FiLoader className="w-3 h-3 animate-spin" /> : step.status === 'error' ? <FiAlertTriangle className="w-3 h-3" /> : <FiClock className="w-3 h-3" />}
                  </div>
                  {idx < steps.length - 1 && <div className={`w-px h-4 mt-0.5 ${step.status === 'complete' ? 'bg-accent/40' : 'bg-border'}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${step.status === 'complete' ? 'text-foreground' : step.status === 'running' ? 'text-primary' : 'text-muted-foreground'}`}>{step.name}</span>
                    <Badge variant="outline" className={`text-[8px] px-1 py-0 ${step.status === 'complete' ? 'border-accent/40 text-accent' : step.status === 'running' ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'}`}>
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{step.agent}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function severityColor(severity: string): string {
  const s = (severity ?? '').toLowerCase()
  if (s.includes('critical') || s.includes('emergent')) return 'bg-destructive text-destructive-foreground'
  if (s.includes('high') || s.includes('urgent')) return 'bg-orange-600 text-white'
  if (s.includes('medium') || s.includes('moderate')) return 'bg-amber-600 text-white'
  return 'bg-accent text-accent-foreground'
}

interface FinalDecisionProps {
  result: CoordinationResult | null
  onViewCaseSummary: () => void
}

export function FinalDecision({ result, onViewCaseSummary }: FinalDecisionProps) {
  const triage = result?.triage ?? {}
  const risk = result?.risk_prediction ?? {}
  const routing = result?.routing ?? {}
  const dispatch = result?.ambulance_dispatch ?? {}
  const handoff = result?.handoff_notification ?? {}
  const family = result?.family_notification ?? {}
  const doctorPrep = result?.doctor_prep ?? {}
  const summary = result?.case_summary ?? {}
  const qa = result?.qa_result ?? {}

  const survivalPct = typeof risk?.survival_probability === 'number' ? risk.survival_probability : null
  const urgencyScore = typeof risk?.urgency_score === 'number' ? risk.urgency_score : null
  const qaScore = typeof qa?.overall_score === 'number' ? qa.overall_score : null

  if (!result) {
    return (
      <Card className="h-full bg-card border-border flex items-center justify-center">
        <div className="text-center p-6">
          <FiTarget className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No active coordination</p>
          <p className="text-[10px] text-muted-foreground mt-1">Submit an incident to begin</p>
        </div>
      </Card>
    )
  }

  const keyValues: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: 'Category', value: triage?.category ?? '--', icon: <FiTarget className="w-3 h-3" /> },
    { label: 'Hospital', value: routing?.selected_hospital ?? routing?.hospital_details?.name ?? '--', icon: <FiMapPin className="w-3 h-3" /> },
    { label: 'ETA', value: routing?.hospital_details?.eta_minutes ? `${routing.hospital_details.eta_minutes} min` : '--', icon: <FiClock className="w-3 h-3" /> },
    { label: 'Ambulance', value: dispatch?.ambulance_id ?? '--', icon: <FiTruck className="w-3 h-3" /> },
    { label: 'Amb. ETA', value: dispatch?.eta_to_patient ?? '--', icon: <FiClock className="w-3 h-3" /> },
    { label: 'Dispatch', value: dispatch?.dispatch_status ?? '--', icon: <FiCheck className="w-3 h-3" /> },
    { label: 'Risk Level', value: risk?.risk_level ?? '--', icon: <FiAlertTriangle className="w-3 h-3" /> },
    { label: 'Time Sens.', value: risk?.time_sensitivity ?? '--', icon: <FiClock className="w-3 h-3" /> },
  ]

  return (
    <Card className="h-full bg-card border-border flex flex-col">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs font-semibold text-foreground">Decision Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-3 pb-3 space-y-3">
            {/* Severity + Scores */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-[10px] ${severityColor(triage?.severity ?? '')}`}>{triage?.severity ?? 'Unknown'}</Badge>
              {survivalPct !== null && (
                <div className="flex items-center gap-1">
                  <FiHeart className="w-3 h-3 text-accent" />
                  <span className="text-[11px] font-semibold text-accent">{survivalPct}%</span>
                  <span className="text-[9px] text-muted-foreground">survival</span>
                </div>
              )}
              {urgencyScore !== null && (
                <Badge variant="outline" className="text-[9px] px-1 py-0">Urgency: {urgencyScore}/10</Badge>
              )}
              {qaScore !== null && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-accent/40 text-accent">QA: {qaScore}%</Badge>
              )}
            </div>

            {/* Survival bar */}
            {survivalPct !== null && (
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-muted-foreground">Survival Probability</span>
                  <span className="text-[10px] font-semibold text-accent">{survivalPct}%</span>
                </div>
                <Progress value={survivalPct} className="h-1.5" />
              </div>
            )}

            {/* Key Values Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {keyValues.map((kv, i) => (
                <div key={i} className="bg-secondary/50 rounded p-1.5">
                  <div className="flex items-center gap-1 text-muted-foreground">{kv.icon}<span className="text-[9px]">{kv.label}</span></div>
                  <p className="text-[11px] font-medium text-foreground mt-0.5 truncate">{kv.value}</p>
                </div>
              ))}
            </div>

            {/* Symptoms */}
            {Array.isArray(triage?.key_symptoms) && triage.key_symptoms.length > 0 && (
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold">Key Symptoms</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {triage.key_symptoms.map((s: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[9px] px-1 py-0">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {Array.isArray(risk?.risk_factors) && risk.risk_factors.length > 0 && (
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold">Risk Factors</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {risk.risk_factors.map((f: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[9px] px-1 py-0 border-destructive/40 text-destructive">{f}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-border" />

            {/* SBAR Handoff */}
            <CollapsibleSection title="SBAR Handoff" icon={<FiMessageSquare className="w-3 h-3" />}>
              <div className="space-y-1.5">
                {['situation', 'background', 'assessment', 'recommendation'].map(k => (
                  <div key={k}>
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">{k}</span>
                    <p className="text-[11px] text-foreground">{handoff?.[k] ?? '--'}</p>
                  </div>
                ))}
                <div className="flex gap-2 text-[10px]">
                  <span className="text-muted-foreground">Priority: <span className="text-foreground">{handoff?.priority_level ?? '--'}</span></span>
                  <span className="text-muted-foreground">Arrival: <span className="text-foreground">{handoff?.estimated_arrival ?? '--'}</span></span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Family Notification */}
            <CollapsibleSection title="Family Notification" icon={<FiUsers className="w-3 h-3" />}>
              <p className="text-[11px] text-foreground">{family?.family_message ?? '--'}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Hospital: {family?.hospital_name ?? '--'}</p>
              <p className="text-[10px] text-muted-foreground">Contact: {family?.contact_information ?? '--'}</p>
              {Array.isArray(family?.recommended_actions_for_family) && family.recommended_actions_for_family.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {family.recommended_actions_for_family.map((a: string, i: number) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1"><FiCheck className="w-2.5 h-2.5 mt-0.5 text-accent flex-shrink-0" />{a}</li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>

            {/* Doctor Prep */}
            <CollapsibleSection title="Doctor Preparation" icon={<FiShield className="w-3 h-3" />}>
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground">Est. Prep: <span className="text-foreground">{doctorPrep?.estimated_prep_time ?? '--'}</span></p>
                {renderList('Instructions', doctorPrep?.preparation_instructions)}
                {renderList('Equipment', doctorPrep?.required_equipment)}
                {renderList('Specialists', doctorPrep?.specialist_team)}
                {renderList('Medications', doctorPrep?.medications_to_prepare)}
                {renderList('Lab Tests', doctorPrep?.lab_tests)}
              </div>
            </CollapsibleSection>

            {/* Routing Details */}
            <CollapsibleSection title="Routing Details" icon={<FiMapPin className="w-3 h-3" />}>
              <p className="text-[11px] text-foreground">{routing?.routing_reasoning ?? '--'}</p>
              <div className="mt-1 text-[10px] text-muted-foreground space-y-0.5">
                <p>Beds: {routing?.hospital_details?.available_beds ?? '--'} | ICU: {routing?.hospital_details?.icu_available ? 'Yes' : 'No'}</p>
                <p>Distance: {routing?.hospital_details?.distance_km ?? '--'} km | Specialty: {routing?.hospital_details?.specialty ?? '--'}</p>
                {routing?.fallback_applied && <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-500 text-amber-500">Fallback Applied</Badge>}
                {Array.isArray(routing?.alternative_hospitals) && routing.alternative_hospitals.length > 0 && (
                  <p>Alternatives: {routing.alternative_hospitals.join(', ')}</p>
                )}
              </div>
            </CollapsibleSection>

            {/* Dispatch Notes */}
            {dispatch?.dispatch_notes && (
              <div className="bg-secondary/50 rounded p-2">
                <span className="text-[10px] text-muted-foreground font-semibold">Dispatch Notes</span>
                <p className="text-[11px] text-foreground mt-0.5">{dispatch.dispatch_notes}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Crew: {dispatch?.crew_name ?? '--'} | Equipment: {dispatch?.equipment_level ?? '--'} | Match: {dispatch?.equipment_match ? 'Yes' : 'No'}</p>
              </div>
            )}

            {/* Coordination Notes */}
            {result?.coordination_notes && (
              <div className="bg-secondary/50 rounded p-2">
                <span className="text-[10px] text-muted-foreground font-semibold">Coordination Notes</span>
                <p className="text-[11px] text-foreground mt-0.5">{result.coordination_notes}</p>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={onViewCaseSummary}>
              <FiFileText className="w-3 h-3 mr-1" />View Full Case Summary
            </Button>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function CollapsibleSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full py-1 text-[11px] font-semibold text-foreground hover:text-primary transition-colors">
          <span className="flex items-center gap-1">{icon}{title}</span>
          <FiChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 pb-1">{children}</CollapsibleContent>
    </Collapsible>
  )
}

function renderList(label: string, items: any) {
  const arr = Array.isArray(items) ? items : []
  if (arr.length === 0) return null
  return (
    <div>
      <span className="text-[9px] text-muted-foreground uppercase font-semibold">{label}</span>
      <ul className="space-y-0.5 mt-0.5">
        {arr.map((item: string, i: number) => (
          <li key={i} className="text-[10px] text-foreground flex items-start gap-1"><FiCheck className="w-2.5 h-2.5 mt-0.5 text-accent flex-shrink-0" />{item}</li>
        ))}
      </ul>
    </div>
  )
}
