import AuditLog from '../modules/communications/AuditLog.js';
export async function audit(actor, action, entity, entityId, before = null, after = null) {
  try { await AuditLog.create({ actor: actor?._id, actorRole: actor?.role, action, entity, entityId: String(entityId || ''), before, after }); }
  catch (e) { console.error('Audit write failed:', e.message); }
}
