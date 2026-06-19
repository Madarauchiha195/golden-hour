'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Plus, Edit, Trash2, X, Check, AlertTriangle, FileText, MapPin, Truck, Users } from 'lucide-react'

interface DataTablesPanelProps {
  hospitals: any[]
  ambulances: any[]
  auditLogs: any[]
  loadingData: boolean
}

export function DataTablesPanel({ hospitals, ambulances, auditLogs, loadingData }: DataTablesPanelProps) {
  const safeHospitals = Array.isArray(hospitals) ? hospitals : []
  const safeAmbulances = Array.isArray(ambulances) ? ambulances : []
  const safeLogs = Array.isArray(auditLogs) ? auditLogs : []

  return (
    <Card className="h-full bg-card border-border flex flex-col">
      <Tabs defaultValue="hospitals" className="flex flex-col h-full">
        <div className="px-3 pt-2">
          <TabsList className="h-7 bg-secondary">
            <TabsTrigger value="hospitals" className="text-[10px] h-5 px-2"><MapPin className="w-2.5 h-2.5 mr-1" />Hospitals ({safeHospitals.length})</TabsTrigger>
            <TabsTrigger value="ambulances" className="text-[10px] h-5 px-2"><Truck className="w-2.5 h-2.5 mr-1" />Ambulances ({safeAmbulances.length})</TabsTrigger>
            <TabsTrigger value="audit" className="text-[10px] h-5 px-2"><FileText className="w-2.5 h-2.5 mr-1" />Audit ({safeLogs.length})</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="hospitals" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Name</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Location</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Beds</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">ICU</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeHospitals.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-[11px] text-muted-foreground py-4">No hospitals registered</TableCell></TableRow>
                ) : safeHospitals.map((h: any, i: number) => (
                  <TableRow key={h?._id ?? i} className={`border-border ${i % 2 === 0 ? 'bg-secondary/20' : ''}`}>
                    <TableCell className="text-[11px] py-1.5 font-medium">{h?.name ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1.5 text-muted-foreground">{h?.location ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1.5">{h?.available_beds ?? '--'}/{h?.total_beds ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1.5">{h?.icu_available ? <Check className="w-3 h-3 text-accent" /> : <X className="w-3 h-3 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-[11px] py-1.5"><Badge variant="outline" className="text-[8px] px-1 py-0">{h?.status ?? '--'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="ambulances" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-[10px] h-7 text-muted-foreground">ID</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Crew</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Equipment</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeAmbulances.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-[11px] text-muted-foreground py-4">No ambulances registered</TableCell></TableRow>
                ) : safeAmbulances.map((a: any, i: number) => (
                  <TableRow key={a?._id ?? i} className={`border-border ${i % 2 === 0 ? 'bg-secondary/20' : ''}`}>
                    <TableCell className="text-[11px] py-1.5 font-medium">{a?.ambulance_id ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1.5 text-muted-foreground">{a?.crew_name ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1.5"><Badge variant="outline" className="text-[8px] px-1 py-0">{a?.equipment_level ?? '--'}</Badge></TableCell>
                    <TableCell className="text-[11px] py-1.5"><Badge variant="outline" className={`text-[8px] px-1 py-0 ${a?.status === 'available' ? 'border-accent/40 text-accent' : a?.status === 'dispatched' ? 'border-amber-500 text-amber-500' : 'border-destructive/40 text-destructive'}`}>{a?.status ?? '--'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="audit" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Agent</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Action</TableHead>
                  <TableHead className="text-[10px] h-7 text-muted-foreground">Incident</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-[11px] text-muted-foreground py-4">No audit logs</TableCell></TableRow>
                ) : safeLogs.map((log: any, i: number) => (
                  <TableRow key={log?._id ?? i} className={`border-border ${i % 2 === 0 ? 'bg-secondary/20' : ''}`}>
                    <TableCell className="text-[11px] py-1.5 font-medium">{log?.agent_name ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1.5 text-muted-foreground">{log?.action ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1.5 text-muted-foreground truncate max-w-[100px]">{log?.incident_id ?? '--'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

interface AdminPanelProps {
  hospitals: any[]
  ambulances: any[]
  doctors: any[]
  incidents: any[]
  onRefresh: () => void
  onCreateHospital: (data: any) => Promise<void>
  onDeleteHospital: (id: string) => Promise<void>
  onCreateAmbulance: (data: any) => Promise<void>
  onDeleteAmbulance: (id: string) => Promise<void>
  onCreateDoctor: (data: any) => Promise<void>
  onDeleteDoctor: (id: string) => Promise<void>
}

export function AdminPanel({ hospitals, ambulances, doctors, incidents, onRefresh, onCreateHospital, onDeleteHospital, onCreateAmbulance, onDeleteAmbulance, onCreateDoctor, onDeleteDoctor }: AdminPanelProps) {
  const [addHospitalOpen, setAddHospitalOpen] = React.useState(false)
  const [addAmbOpen, setAddAmbOpen] = React.useState(false)
  const [addDocOpen, setAddDocOpen] = React.useState(false)
  const [hForm, setHForm] = React.useState({ name: '', location: '', total_beds: '', available_beds: '', icu_available: false, trauma_center_level: '', contact: '' })
  const [aForm, setAForm] = React.useState({ ambulance_id: '', crew_name: '', equipment_level: 'BLS', status: 'available' })
  const [dForm, setDForm] = React.useState({ name: '', specialty: '', contact: '', available: true })

  const safeHospitals = Array.isArray(hospitals) ? hospitals : []
  const safeAmbulances = Array.isArray(ambulances) ? ambulances : []
  const safeDoctors = Array.isArray(doctors) ? doctors : []
  const safeIncidents = Array.isArray(incidents) ? incidents : []

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Admin Panel</span>
        <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={onRefresh}>Refresh</Button>
      </div>
      <Tabs defaultValue="hospitals" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2">
          <TabsList className="h-7 bg-secondary">
            <TabsTrigger value="hospitals" className="text-[10px] h-5 px-2">Hospitals</TabsTrigger>
            <TabsTrigger value="ambulances" className="text-[10px] h-5 px-2">Ambulances</TabsTrigger>
            <TabsTrigger value="doctors" className="text-[10px] h-5 px-2">Doctors</TabsTrigger>
            <TabsTrigger value="incidents" className="text-[10px] h-5 px-2">Incidents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="hospitals" className="flex-1 overflow-hidden m-0 px-4 pb-2">
          <div className="flex justify-end mb-1">
            <Button size="sm" className="h-6 text-[10px]" onClick={() => setAddHospitalOpen(true)}><Plus className="w-3 h-3 mr-1" />Add Hospital</Button>
          </div>
          <ScrollArea className="h-[calc(100%-32px)]">
            <Table>
              <TableHeader><TableRow className="border-border">
                <TableHead className="text-[10px] h-7">Name</TableHead>
                <TableHead className="text-[10px] h-7">Location</TableHead>
                <TableHead className="text-[10px] h-7">Beds</TableHead>
                <TableHead className="text-[10px] h-7">ICU</TableHead>
                <TableHead className="text-[10px] h-7">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {safeHospitals.map((h: any, i: number) => (
                  <TableRow key={h?._id ?? i} className="border-border">
                    <TableCell className="text-[11px] py-1">{h?.name ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1 text-muted-foreground">{h?.location ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{h?.available_beds ?? 0}/{h?.total_beds ?? 0}</TableCell>
                    <TableCell className="text-[11px] py-1">{h?.icu_available ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-[11px] py-1"><Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => h?._id && onDeleteHospital(h._id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <Dialog open={addHospitalOpen} onOpenChange={setAddHospitalOpen}>
            <DialogContent className="bg-card border-border max-w-sm">
              <DialogHeader><DialogTitle className="text-sm">Add Hospital</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <div><Label className="text-[10px]">Name *</Label><Input className="h-7 text-xs bg-input border-border" value={hForm.name} onChange={(e) => setHForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label className="text-[10px]">Location</Label><Input className="h-7 text-xs bg-input border-border" value={hForm.location} onChange={(e) => setHForm(p => ({ ...p, location: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[10px]">Total Beds</Label><Input className="h-7 text-xs bg-input border-border" type="number" value={hForm.total_beds} onChange={(e) => setHForm(p => ({ ...p, total_beds: e.target.value }))} /></div>
                  <div><Label className="text-[10px]">Available Beds</Label><Input className="h-7 text-xs bg-input border-border" type="number" value={hForm.available_beds} onChange={(e) => setHForm(p => ({ ...p, available_beds: e.target.value }))} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={hForm.icu_available} onCheckedChange={(v) => setHForm(p => ({ ...p, icu_available: !!v }))} />
                  <Label className="text-[10px]">ICU Available</Label>
                </div>
                <div><Label className="text-[10px]">Contact</Label><Input className="h-7 text-xs bg-input border-border" value={hForm.contact} onChange={(e) => setHForm(p => ({ ...p, contact: e.target.value }))} /></div>
                <Button size="sm" className="w-full h-7 text-xs" disabled={!hForm.name} onClick={async () => { await onCreateHospital({ ...hForm, total_beds: Number(hForm.total_beds) || 0, available_beds: Number(hForm.available_beds) || 0 }); setAddHospitalOpen(false); setHForm({ name: '', location: '', total_beds: '', available_beds: '', icu_available: false, trauma_center_level: '', contact: '' }) }}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="ambulances" className="flex-1 overflow-hidden m-0 px-4 pb-2">
          <div className="flex justify-end mb-1">
            <Button size="sm" className="h-6 text-[10px]" onClick={() => setAddAmbOpen(true)}><Plus className="w-3 h-3 mr-1" />Add Ambulance</Button>
          </div>
          <ScrollArea className="h-[calc(100%-32px)]">
            <Table>
              <TableHeader><TableRow className="border-border">
                <TableHead className="text-[10px] h-7">ID</TableHead>
                <TableHead className="text-[10px] h-7">Crew</TableHead>
                <TableHead className="text-[10px] h-7">Equipment</TableHead>
                <TableHead className="text-[10px] h-7">Status</TableHead>
                <TableHead className="text-[10px] h-7">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {safeAmbulances.map((a: any, i: number) => (
                  <TableRow key={a?._id ?? i} className="border-border">
                    <TableCell className="text-[11px] py-1">{a?.ambulance_id ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{a?.crew_name ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{a?.equipment_level ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{a?.status ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1"><Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => a?._id && onDeleteAmbulance(a._id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <Dialog open={addAmbOpen} onOpenChange={setAddAmbOpen}>
            <DialogContent className="bg-card border-border max-w-sm">
              <DialogHeader><DialogTitle className="text-sm">Add Ambulance</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <div><Label className="text-[10px]">Ambulance ID *</Label><Input className="h-7 text-xs bg-input border-border" value={aForm.ambulance_id} onChange={(e) => setAForm(p => ({ ...p, ambulance_id: e.target.value }))} /></div>
                <div><Label className="text-[10px]">Crew Name</Label><Input className="h-7 text-xs bg-input border-border" value={aForm.crew_name} onChange={(e) => setAForm(p => ({ ...p, crew_name: e.target.value }))} /></div>
                <div><Label className="text-[10px]">Equipment Level</Label>
                  <Select value={aForm.equipment_level} onValueChange={(v) => setAForm(p => ({ ...p, equipment_level: v }))}>
                    <SelectTrigger className="h-7 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="BLS">BLS</SelectItem><SelectItem value="ALS">ALS</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent>
                  </Select>
                </div>
                <Button size="sm" className="w-full h-7 text-xs" disabled={!aForm.ambulance_id} onClick={async () => { await onCreateAmbulance(aForm); setAddAmbOpen(false); setAForm({ ambulance_id: '', crew_name: '', equipment_level: 'BLS', status: 'available' }) }}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="doctors" className="flex-1 overflow-hidden m-0 px-4 pb-2">
          <div className="flex justify-end mb-1">
            <Button size="sm" className="h-6 text-[10px]" onClick={() => setAddDocOpen(true)}><Plus className="w-3 h-3 mr-1" />Add Doctor</Button>
          </div>
          <ScrollArea className="h-[calc(100%-32px)]">
            <Table>
              <TableHeader><TableRow className="border-border">
                <TableHead className="text-[10px] h-7">Name</TableHead>
                <TableHead className="text-[10px] h-7">Specialty</TableHead>
                <TableHead className="text-[10px] h-7">Available</TableHead>
                <TableHead className="text-[10px] h-7">Contact</TableHead>
                <TableHead className="text-[10px] h-7">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {safeDoctors.map((d: any, i: number) => (
                  <TableRow key={d?._id ?? i} className="border-border">
                    <TableCell className="text-[11px] py-1">{d?.name ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{d?.specialty ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{d?.available ? <Check className="w-3 h-3 text-accent" /> : <X className="w-3 h-3 text-destructive" />}</TableCell>
                    <TableCell className="text-[11px] py-1">{d?.contact ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1"><Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => d?._id && onDeleteDoctor(d._id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <Dialog open={addDocOpen} onOpenChange={setAddDocOpen}>
            <DialogContent className="bg-card border-border max-w-sm">
              <DialogHeader><DialogTitle className="text-sm">Add Doctor</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <div><Label className="text-[10px]">Name *</Label><Input className="h-7 text-xs bg-input border-border" value={dForm.name} onChange={(e) => setDForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label className="text-[10px]">Specialty</Label><Input className="h-7 text-xs bg-input border-border" value={dForm.specialty} onChange={(e) => setDForm(p => ({ ...p, specialty: e.target.value }))} /></div>
                <div><Label className="text-[10px]">Contact</Label><Input className="h-7 text-xs bg-input border-border" value={dForm.contact} onChange={(e) => setDForm(p => ({ ...p, contact: e.target.value }))} /></div>
                <Button size="sm" className="w-full h-7 text-xs" disabled={!dForm.name} onClick={async () => { await onCreateDoctor(dForm); setAddDocOpen(false); setDForm({ name: '', specialty: '', contact: '', available: true }) }}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="incidents" className="flex-1 overflow-hidden m-0 px-4 pb-2">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader><TableRow className="border-border">
                <TableHead className="text-[10px] h-7">Patient</TableHead>
                <TableHead className="text-[10px] h-7">Severity</TableHead>
                <TableHead className="text-[10px] h-7">Hospital</TableHead>
                <TableHead className="text-[10px] h-7">Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {safeIncidents.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-[11px] text-muted-foreground py-4">No incidents</TableCell></TableRow>
                ) : safeIncidents.map((inc: any, i: number) => (
                  <TableRow key={inc?._id ?? i} className="border-border">
                    <TableCell className="text-[11px] py-1">{inc?.patient_name ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{inc?.severity ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1">{inc?.selected_hospital ?? '--'}</TableCell>
                    <TableCell className="text-[11px] py-1"><Badge variant="outline" className="text-[8px] px-1 py-0">{inc?.status ?? 'pending'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CaseSummaryModalProps {
  open: boolean
  onClose: () => void
  result: any
}

export function CaseSummaryModal({ open, onClose, result }: CaseSummaryModalProps) {
  const summary = result?.case_summary ?? {}
  const qa = result?.qa_result ?? {}
  const consistencyChecks = Array.isArray(qa?.consistency_checks) ? qa.consistency_checks : []
  const completenessChecks = Array.isArray(qa?.completeness_checks) ? qa.completeness_checks : []
  const warnings = Array.isArray(qa?.warnings) ? qa.warnings : []
  const auditEvents = Array.isArray(qa?.audit_events) ? qa.audit_events : []
  const traffic = result?.traffic_eta ?? {}
  const hospitalEtas = Array.isArray(traffic?.hospital_etas) ? traffic.hospital_etas : []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh]">
        <DialogHeader><DialogTitle className="text-sm">Full Case Summary & QA Report</DialogTitle></DialogHeader>
        <ScrollArea className="max-h-[65vh]">
          <div className="space-y-4 pr-4">
            {/* Case Summary */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Case Summary</span>
              {['case_overview', 'patient_summary', 'triage_result', 'risk_assessment', 'hospital_decision', 'transport_details', 'notification_status', 'timeline'].map(field => (
                <div key={field}>
                  <span className="text-[9px] text-muted-foreground uppercase">{field.replace(/_/g, ' ')}</span>
                  <p className="text-[11px] text-foreground">{summary?.[field] ?? '--'}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-border" />

            {/* Traffic ETAs */}
            {hospitalEtas.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Hospital ETAs</span>
                <p className="text-[10px] text-muted-foreground mb-1">Location: {traffic?.patient_location ?? '--'} | Traffic: {traffic?.estimated_traffic_level ?? '--'} | Fastest: {traffic?.fastest_hospital ?? '--'}</p>
                <Table>
                  <TableHeader><TableRow className="border-border">
                    <TableHead className="text-[10px] h-6">Hospital</TableHead>
                    <TableHead className="text-[10px] h-6">ETA (min)</TableHead>
                    <TableHead className="text-[10px] h-6">Distance (km)</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {hospitalEtas.map((eta: any, i: number) => (
                      <TableRow key={i} className="border-border">
                        <TableCell className="text-[11px] py-1">{eta?.hospital_name ?? '--'}</TableCell>
                        <TableCell className="text-[11px] py-1">{eta?.eta_minutes ?? '--'}</TableCell>
                        <TableCell className="text-[11px] py-1">{eta?.distance_km ?? '--'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Separator className="bg-border" />

            {/* QA Report */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">QA Report</span>
                <div className="flex items-center gap-2">
                  {typeof qa?.overall_score === 'number' && <Badge className="text-[9px] bg-accent text-accent-foreground">Score: {qa.overall_score}%</Badge>}
                  <Badge variant="outline" className="text-[9px]">{qa?.status ?? '--'}</Badge>
                </div>
              </div>

              {consistencyChecks.length > 0 && (
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Consistency Checks</span>
                  {consistencyChecks.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      {c?.result === 'pass' ? <Check className="w-3 h-3 text-accent mt-0.5" /> : <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5" />}
                      <div><span className="text-[10px] font-medium text-foreground">{c?.check_name ?? '--'}</span><p className="text-[10px] text-muted-foreground">{c?.details ?? ''}</p></div>
                    </div>
                  ))}
                </div>
              )}

              {completenessChecks.length > 0 && (
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Completeness</span>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {completenessChecks.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-1 text-[10px]">
                        {c?.present ? <Check className="w-2.5 h-2.5 text-accent" /> : <X className="w-2.5 h-2.5 text-destructive" />}
                        <span className="text-muted-foreground">{c?.field ?? '--'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Warnings</span>
                  {warnings.map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-1 text-[10px] text-amber-500"><AlertTriangle className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />{w}</div>
                  ))}
                </div>
              )}

              {auditEvents.length > 0 && (
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Audit Events</span>
                  {auditEvents.map((evt: any, i: number) => (
                    <div key={i} className="text-[10px] py-0.5 border-b border-border/50 last:border-0">
                      <span className="text-foreground">{evt?.event ?? '--'}</span>
                      <span className="text-muted-foreground ml-2">{evt?.timestamp ?? ''}</span>
                      {evt?.details && <p className="text-muted-foreground">{evt.details}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coordination Status */}
            {result?.coordination_status && (
              <div className="bg-secondary/50 rounded p-2">
                <span className="text-[10px] text-muted-foreground font-semibold">Coordination Status</span>
                <p className="text-[11px] text-foreground">{result.coordination_status}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
