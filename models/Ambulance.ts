import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getAmbulanceModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Ambulance', {
      ambulance_id: { type: String, required: true },
      latitude: Number,
      longitude: Number,
      status: { type: String, enum: ['available', 'dispatched', 'maintenance'], default: 'available' },
      crew_name: String,
      equipment_level: { type: String, enum: ['BLS', 'ALS', 'Critical'] },
      last_updated: { type: Date, default: Date.now }
    });
  }
  return _model;
}
