import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getIncidentModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Incident', {
      patient_name: { type: String, required: true },
      patient_age: Number,
      patient_sex: String,
      symptoms: { type: String, required: true },
      location: { type: String, required: true },
      time_of_incident: String,
      vitals: Object,
      notes: String,
      triage_category: String,
      severity: String,
      survival_probability: Number,
      urgency_score: Number,
      risk_level: String,
      selected_hospital: String,
      hospital_eta: String,
      ambulance_id: String,
      ambulance_eta: String,
      handoff_status: String,
      doctor_prep_status: String,
      sbar_report: Object,
      family_message: String,
      doctor_prep_instructions: String,
      case_summary: String,
      qa_result: Object,
      full_response: Object,
      status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
      workflow_step: String
    });
  }
  return _model;
}
