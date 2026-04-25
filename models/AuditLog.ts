import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getAuditLogModel() {
  if (!_model) {
    await initDB();
    _model = createModel('AuditLog', {
      incident_id: { type: String, required: true },
      agent_name: { type: String, required: true },
      action: String,
      input_payload: Object,
      output_payload: Object
    });
  }
  return _model;
}
