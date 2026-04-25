import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getHospitalModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Hospital', {
      name: { type: String, required: true },
      location: String,
      latitude: Number,
      longitude: Number,
      specialties: [String],
      total_beds: Number,
      available_beds: Number,
      icu_available: Boolean,
      trauma_center_level: String,
      contact: String,
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      on_call_doctor: String
    });
  }
  return _model;
}
