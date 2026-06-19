'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DemoAuthProvider, useAuth } from './DemoAuthContext'
import { callAIAgent } from '@/lib/aiAgent'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

import { Header } from './AuthAndHeader'
import IncidentIntake from './IncidentIntake'
import type { IncidentFormData } from './IncidentIntake'
import { WorkflowProgress, FinalDecision } from './WorkflowAndResults'
import type { CoordinationResult, WorkflowStep, StepStatus } from './WorkflowAndResults'
import { DataTablesPanel, AdminPanel, CaseSummaryModal } from './DataAndAdmin'

const MANAGER_AGENT_ID = '69ec725b1f4eecc14353fa3c'

const THEME_VARS: React.CSSProperties & Record<string, string> = {
  '--background': '220 25% 7%',
  '--foreground': '220 15% 85%',
  '--card': '220 22% 10%',
  '--card-foreground': '220 15% 85%',
  '--primary': '220 80% 55%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '220 18% 16%',
  '--secondary-foreground': '220 15% 80%',
  '--accent': '160 70% 45%',
  '--accent-foreground': '0 0% 100%',
  '--destructive': '0 75% 55%',
  '--destructive-foreground': '0 0% 100%',
  '--muted': '220 15% 20%',
  '--muted-foreground': '220 12% 55%',
  '--border': '220 18% 18%',
  '--input': '220 15% 24%',
  '--ring': '220 80% 55%',
  '--radius': '0.125rem',
  '--chart-1': '220 80% 60%',
  '--chart-2': '160 70% 50%',
  '--chart-3': '280 60% 60%',
  '--chart-4': '35 85% 55%',
  '--chart-5': '0 75% 55%',
  '--sidebar-background': '220 24% 8%',
  '--sidebar-foreground': '220 15% 85%',
}

const INITIAL_STEPS: WorkflowStep[] = [
  { id: 'triage', name: 'Triage Assessment', agent: 'Triage Agent', status: 'pending', icon: null },
  { id: 'risk', name: 'Risk Prediction', agent: 'Risk Prediction Agent', status: 'pending', icon: null },
  { id: 'traffic', name: 'Traffic & ETA', agent: 'Traffic ETA Agent', status: 'pending', icon: null },
  { id: 'routing', name: 'Hospital Routing', agent: 'Routing Agent', status: 'pending', icon: null },
  { id: 'dispatch', name: 'Ambulance Dispatch', agent: 'Dispatch Agent', status: 'pending', icon: null },
  { id: 'handoff', name: 'Handoff Notification', agent: 'Handoff Agent', status: 'pending', icon: null },
  { id: 'family', name: 'Family Notification', agent: 'Family Notification Agent', status: 'pending', icon: null },
  { id: 'doctor', name: 'Doctor Preparation', agent: 'Doctor Prep Agent', status: 'pending', icon: null },
  { id: 'summary', name: 'Case Summary', agent: 'Summary Agent', status: 'pending', icon: null },
  { id: 'qa', name: 'Quality Assurance', agent: 'QA Agent', status: 'pending', icon: null },
]

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const EMPTY_FORM: IncidentFormData = {
  patient_name: '', patient_age: '', patient_sex: '', symptoms: '', location: '',
  time_of_incident: '', notes: '',
  vitals: { weight: '', blood_sugar: '', bp_systolic: '', bp_diastolic: '', heart_rate: '', spo2: '', medical_history: '', allergies: '', medications: '' }
}

function AppContent(props: any) {
  const { user, isLoading } = useAuth()
  const {
    activeView, setActiveView, sampleMode, setSampleMode, formData, setFormData,
    isProcessing, steps, coordinationResult, caseSummaryOpen, setCaseSummaryOpen,
    error, incidents, hospitals, ambulances, doctors, auditLogs, loadingData,
    handleSubmit, handleSelectIncident, fetchData,
    createHospital, deleteHospital, createAmbulance, deleteAmbulance, createDoctor, deleteDoctor,
  } = props

  if (isLoading) {
    return (
      <div style={THEME_VARS} className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  

  return (
    <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Header activeView={activeView} showAdmin={activeView === 'admin'} onToggleAdmin={() => setActiveView((v: string) => v === 'admin' ? 'dashboard' : 'admin')} />

      {activeView === 'admin' ? (
        <div className="flex-1 overflow-hidden">
          <AdminPanel hospitals={hospitals} ambulances={ambulances} doctors={doctors} incidents={incidents} onRefresh={fetchData} onCreateHospital={createHospital} onDeleteHospital={deleteHospital} onCreateAmbulance={createAmbulance} onDeleteAmbulance={deleteAmbulance} onCreateDoctor={createDoctor} onDeleteDoctor={deleteDoctor} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-end px-4 py-1.5 border-b border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] text-muted-foreground">Sample Data</Label>
              <Switch checked={sampleMode} onCheckedChange={setSampleMode} />
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-[11px] text-destructive">{error}</div>
          )}

          <div className="flex-1 flex overflow-hidden">
            <div className="w-[320px] border-r border-border bg-card flex-shrink-0 overflow-hidden">
              <IncidentIntake formData={formData} onFormChange={setFormData} onSubmit={handleSubmit} isProcessing={isProcessing} sampleMode={sampleMode} recentIncidents={incidents} onSelectIncident={handleSelectIncident} />
            </div>
            <div className="flex-1 min-w-0 p-2 overflow-hidden">
              <WorkflowProgress steps={steps} isProcessing={isProcessing} />
            </div>
            <div className="w-[360px] border-l border-border flex-shrink-0 p-2 overflow-hidden">
              <FinalDecision result={coordinationResult} onViewCaseSummary={() => setCaseSummaryOpen(true)} />
            </div>
          </div>

          <div className="h-[220px] border-t border-border flex-shrink-0">
            <DataTablesPanel hospitals={hospitals} ambulances={ambulances} auditLogs={auditLogs} loadingData={loadingData} />
          </div>

          <div className="border-t border-border bg-card/50 px-4 py-1.5 flex items-center gap-4 flex-shrink-0">
            <Activity className={`w-3 h-3 ${isProcessing ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-[10px] text-muted-foreground">Manager Agent: <span className="text-foreground font-medium">{MANAGER_AGENT_ID.slice(0, 8)}...</span></span>
            <Badge variant="outline" className={`text-[8px] px-1 py-0 ${isProcessing ? 'border-primary text-primary animate-pulse' : 'border-accent/40 text-accent'}`}>{isProcessing ? 'Coordinating' : 'Ready'}</Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">10 Sub-agents | Emergency Coordination Pipeline</span>
          </div>
        </div>
      )}

      <CaseSummaryModal open={caseSummaryOpen} onClose={() => setCaseSummaryOpen(false)} result={coordinationResult} />
    </div>
  )
}

export default function GoldenHourApp() {
  const [activeView, setActiveView] = useState<'dashboard' | 'admin'>('dashboard')
  const [sampleMode, setSampleMode] = useState(false)
  const [formData, setFormData] = useState<IncidentFormData>(EMPTY_FORM)
  const [isProcessing, setIsProcessing] = useState(false)
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS)
  const [coordinationResult, setCoordinationResult] = useState<CoordinationResult | null>(null)
  const [caseSummaryOpen, setCaseSummaryOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [incidents, setIncidents] = useState<any[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])
  const [ambulances, setAmbulances] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [incRes, hosRes, ambRes, docRes, logRes] = await Promise.allSettled([
        fetch('/api/incidents').then(r => r.json()),
        fetch('/api/hospitals').then(r => r.json()),
        fetch('/api/ambulances').then(r => r.json()),
        fetch('/api/doctors').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
      ])
      if (incRes.status === 'fulfilled' && incRes.value?.success) setIncidents(incRes.value.data)
      if (hosRes.status === 'fulfilled' && hosRes.value?.success) setHospitals(hosRes.value.data)
      if (ambRes.status === 'fulfilled' && ambRes.value?.success) setAmbulances(ambRes.value.data)
      if (docRes.status === 'fulfilled' && docRes.value?.success) setDoctors(docRes.value.data)
      if (logRes.status === 'fulfilled' && logRes.value?.success) setAuditLogs(logRes.value.data)
    } catch { /* silent */ }
    setLoadingData(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStepStatus = (stepIdx: number, status: StepStatus) => {
    setSteps(prev => prev.map((s, i) => i === stepIdx ? { ...s, status } : s))
  }

  const simulateProgress = async () => {
    for (let i = 0; i < INITIAL_STEPS.length; i++) {
      updateStepStatus(i, 'running')
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setIsProcessing(true)
    setCoordinationResult(null)
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' as StepStatus })))

    try {
      const incidentPayload = {
        patient_name: formData.patient_name,
        patient_age: formData.patient_age ? Number(formData.patient_age) : undefined,
        patient_sex: formData.patient_sex,
        symptoms: formData.symptoms,
        location: formData.location,
        time_of_incident: new Date().toISOString(),
        notes: formData.notes,
        vitals: {
          weight: formData.vitals.weight ? Number(formData.vitals.weight) : undefined,
          blood_sugar: formData.vitals.blood_sugar ? Number(formData.vitals.blood_sugar) : undefined,
          bp: formData.vitals.bp_systolic ? `${formData.vitals.bp_systolic}/${formData.vitals.bp_diastolic}` : undefined,
          heart_rate: formData.vitals.heart_rate ? Number(formData.vitals.heart_rate) : undefined,
          spo2: formData.vitals.spo2 ? Number(formData.vitals.spo2) : undefined,
          medical_history: formData.vitals.medical_history || undefined,
          allergies: formData.vitals.allergies || undefined,
          medications: formData.vitals.medications || undefined,
        },
      }

      const incRes = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incidentPayload, status: 'in_progress' }),
      }).then(r => r.json())

      const incidentId = incRes?.data?._id ?? 'unknown'

      fetch('/api/workflow-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: incidentId, status: 'running', current_step: 'triage' }),
      }).catch(() => {})

      const progressPromise = simulateProgress()
      const agentPromise = callAIAgent(JSON.stringify(incidentPayload), MANAGER_AGENT_ID)

      const result = await agentPromise
      await progressPromise

      if (result.success) {
        const data = result?.response?.result ?? {}
        setCoordinationResult(data)
        setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as StepStatus })))

        if (incidentId !== 'unknown') {
          fetch('/api/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'completed',
              triage_category: data?.triage?.category,
              severity: data?.triage?.severity,
              survival_probability: data?.risk_prediction?.survival_probability,
              selected_hospital: data?.routing?.selected_hospital,
              ambulance_id: data?.ambulance_dispatch?.ambulance_id,
              sbar_report: data?.handoff_notification,
              family_message: data?.family_notification?.family_message,
              case_summary: data?.case_summary?.case_overview,
              qa_result: data?.qa_result,
              full_response: data,
            }),
          }).catch(() => {})

          const agentNames = ['Triage', 'Risk Prediction', 'Traffic ETA', 'Routing', 'Ambulance Dispatch', 'Handoff', 'Family Notification', 'Doctor Prep', 'Summary', 'QA']
          for (const name of agentNames) {
            fetch('/api/audit-logs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ incident_id: incidentId, agent_name: name, action: 'completed' }),
            }).catch(() => {})
          }

          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              incident_id: incidentId,
              hospital_message: data?.handoff_notification?.situation ?? '',
              family_message: data?.family_notification?.family_message ?? '',
              doctor_message: JSON.stringify(data?.doctor_prep?.preparation_instructions ?? []),
              status: 'sent',
            }),
          }).catch(() => {})
        }

        fetchData()
      } else {
        setError(result?.error ?? 'Agent coordination failed')
        setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' as StepStatus } : s))
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unexpected error')
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' as StepStatus } : s))
    }

    setIsProcessing(false)
  }

  const handleSelectIncident = (inc: any) => {
    if (inc?.full_response) {
      setCoordinationResult(inc.full_response)
      setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as StepStatus })))
    }
  }

  const createHospital = async (data: any) => { await fetch('/api/hospitals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); fetchData() }
  const deleteHospital = async (id: string) => { await fetch(`/api/hospitals/${id}`, { method: 'DELETE' }); fetchData() }
  const createAmbulance = async (data: any) => { await fetch('/api/ambulances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); fetchData() }
  const deleteAmbulance = async (id: string) => { await fetch(`/api/ambulances/${id}`, { method: 'DELETE' }); fetchData() }
  const createDoctor = async (data: any) => { await fetch('/api/doctors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); fetchData() }
  const deleteDoctor = async (id: string) => { await fetch(`/api/doctors/${id}`, { method: 'DELETE' }); fetchData() }

  return (
    <ErrorBoundary>
      <DemoAuthProvider>
        <AppContent
          activeView={activeView}
          setActiveView={setActiveView}
          sampleMode={sampleMode}
          setSampleMode={setSampleMode}
          formData={formData}
          setFormData={setFormData}
          isProcessing={isProcessing}
          steps={steps}
          coordinationResult={coordinationResult}
          caseSummaryOpen={caseSummaryOpen}
          setCaseSummaryOpen={setCaseSummaryOpen}
          error={error}
          incidents={incidents}
          hospitals={hospitals}
          ambulances={ambulances}
          doctors={doctors}
          auditLogs={auditLogs}
          loadingData={loadingData}
          handleSubmit={handleSubmit}
          handleSelectIncident={handleSelectIncident}
          fetchData={fetchData}
          createHospital={createHospital}
          deleteHospital={deleteHospital}
          createAmbulance={createAmbulance}
          deleteAmbulance={deleteAmbulance}
          createDoctor={createDoctor}
          deleteDoctor={deleteDoctor}
        />
      </DemoAuthProvider>
    </ErrorBoundary>
  )
}
