import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getNotificationModel() {
  if (!_model) {
    await initDB();
    _model = createModel('Notification', {
      incident_id: { type: String, required: true },
      hospital_message: String,
      family_message: String,
      doctor_message: String,
      status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
      sent_at: Date
    });
  }
  return _model;
}
