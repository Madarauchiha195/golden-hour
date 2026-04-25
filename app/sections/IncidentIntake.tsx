'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FiUser, FiMapPin, FiChevronDown, FiAlertTriangle, FiClock, FiFileText } from 'react-icons/fi'

export interface IncidentFormData {
  patient_name: string
  patient_age: string
  patient_sex: string
  symptoms: string
  location: string
  time_of_incident: string
  notes: string
  vitals: {
    weight: string
    blood_sugar: string
    bp_systolic: string
    bp_diastolic: string
    heart_rate: string
    spo2: string
    medical_history: string
    allergies: string
    medications: string
  }
}

interface IncidentIntakeProps {
  formData: IncidentFormData
  onFormChange: (data: IncidentFormData) => void
  onSubmit: () => void
  isProcessing: boolean
  sampleMode: boolean
  recentIncidents: any[]
  onSelectIncident: (incident: any) => void
}

const SAMPLE_DATA: IncidentFormData = {
  patient_name: 'Rajesh Kumar',
  patient_age: '54',
  patient_sex: 'Male',
  symptoms: 'Severe chest pain radiating to left arm, shortness of breath, profuse sweating, onset 20 minutes ago',
  location: 'MG Road, Sector 14, Gurugram, Haryana',
  time_of_incident: '',
  notes: 'Patient has history of hypertension. Currently on Amlodipine 5mg.',
  vitals: {
    weight: '78',
    blood_sugar: '142',
    bp_systolic: '180',
    bp_diastolic: '110',
    heart_rate: '112',
    spo2: '93',
    medical_history: 'Hypertension (5 years), Type 2 Diabetes (3 years), Previous MI (2019)',
    allergies: 'Penicillin',
    medications: 'Amlodipine 5mg, Metformin 500mg BD'
  }
}

const EMPTY_DATA: IncidentFormData = {
  patient_name: '', patient_age: '', patient_sex: '', symptoms: '', location: '',
  time_of_incident: '', notes: '',
  vitals: { weight: '', blood_sugar: '', bp_systolic: '', bp_diastolic: '', heart_rate: '', spo2: '', medical_history: '', allergies: '', medications: '' }
}

export default function IncidentIntake({ formData, onFormChange, onSubmit, isProcessing, sampleMode, recentIncidents, onSelectIncident }: IncidentIntakeProps) {
  const [vitalsOpen, setVitalsOpen] = React.useState(false)

  React.useEffect(() => {
    if (sampleMode) {
      onFormChange(SAMPLE_DATA)
    } else {
      onFormChange(EMPTY_DATA)
    }
  }, [sampleMode])

  const updateField = (field: string, value: string) => {
    onFormChange({ ...formData, [field]: value })
  }

  const updateVital = (field: string, value: string) => {
    onFormChange({ ...formData, vitals: { ...formData.vitals, [field]: value } })
  }

  const safeIncidents = Array.isArray(recentIncidents) ? recentIncidents : []

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <FiAlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">New Incident</span>
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-[11px] text-muted-foreground">Patient Name *</Label>
              <Input className="h-7 text-xs bg-input border-border" placeholder="Full name" value={formData.patient_name} onChange={(e) => updateField('patient_name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] text-muted-foreground">Age</Label>
                <Input className="h-7 text-xs bg-input border-border" type="number" placeholder="Age" value={formData.patient_age} onChange={(e) => updateField('patient_age', e.target.value)} />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Sex</Label>
                <Select value={formData.patient_sex} onValueChange={(v) => updateField('patient_sex', v)}>
                  <SelectTrigger className="h-7 text-xs bg-input border-border">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Symptoms *</Label>
              <Textarea className="text-xs bg-input border-border min-h-[60px]" placeholder="Describe symptoms, onset, severity..." value={formData.symptoms} onChange={(e) => updateField('symptoms', e.target.value)} />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Location *</Label>
              <div className="relative">
                <FiMapPin className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
                <Input className="h-7 text-xs bg-input border-border pl-6" placeholder="Patient location" value={formData.location} onChange={(e) => updateField('location', e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Notes</Label>
              <Textarea className="text-xs bg-input border-border min-h-[40px]" placeholder="Additional notes..." value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} />
            </div>
          </div>

          <Collapsible open={vitalsOpen} onOpenChange={setVitalsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-muted-foreground justify-between">
                Vitals & History <FiChevronDown className={`w-3 h-3 transition-transform ${vitalsOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Weight (kg)</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.weight} onChange={(e) => updateVital('weight', e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Blood Sugar</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.blood_sugar} onChange={(e) => updateVital('blood_sugar', e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">SpO2 (%)</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.spo2} onChange={(e) => updateVital('spo2', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">BP Sys</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.bp_systolic} onChange={(e) => updateVital('bp_systolic', e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">BP Dia</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.bp_diastolic} onChange={(e) => updateVital('bp_diastolic', e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Heart Rate</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.heart_rate} onChange={(e) => updateVital('heart_rate', e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Medical History</Label>
                <Textarea className="text-[11px] bg-input border-border min-h-[32px]" value={formData.vitals.medical_history} onChange={(e) => updateVital('medical_history', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Allergies</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.allergies} onChange={(e) => updateVital('allergies', e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Medications</Label>
                  <Input className="h-6 text-[11px] bg-input border-border" value={formData.vitals.medications} onChange={(e) => updateVital('medications', e.target.value)} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button onClick={onSubmit} disabled={isProcessing || !formData.patient_name || !formData.symptoms || !formData.location} className="w-full h-9 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {isProcessing ? (
              <><FiClock className="w-3 h-3 mr-1 animate-spin" /> Coordinating...</>
            ) : (
              <><FiAlertTriangle className="w-3 h-3 mr-1" /> Launch Emergency Coordination</>
            )}
          </Button>

          {safeIncidents.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Recent Incidents</span>
              <div className="space-y-1 mt-1">
                {safeIncidents.slice(0, 5).map((inc: any, i: number) => (
                  <button key={inc?._id ?? i} onClick={() => onSelectIncident(inc)} className="w-full text-left p-2 rounded bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground">{inc?.patient_name ?? 'Unknown'}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">{inc?.status ?? 'pending'}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{inc?.symptoms ?? ''}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
