import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getDoctorModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Doctor', {
      hospital_id: String,
      name: { type: String, required: true },
      specialty: String,
      available: { type: Boolean, default: true },
      on_call_status: { type: Boolean, default: false },
      contact: String
    });
  }
  return _model;
}
