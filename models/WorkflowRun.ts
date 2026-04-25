import { initDB, createModel } from 'lyzr-architect';
let _model: any = null;
export default async function getWorkflowRunModel() {
  if (!_model) {
    await initDB();
    _model = createModel('WorkflowRun', {
      incident_id: { type: String, required: true },
      status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
      current_step: String,
      started_at: { type: Date, default: Date.now },
      finished_at: Date
    });
  }
  return _model;
}
