const fs=require('node:fs');
const path=require('node:path');
const roomwaveRoot=path.resolve(__dirname, '..', '..', '..', '..');
const auditRoot=path.join(roomwaveRoot, 'src', 'spine-audit', 'c010');
const audit=JSON.parse(fs.readFileSync(path.join(auditRoot, 'audit-report.json'),'utf8'));
const main=audit.audits.find(a=>a.file==='c010_00.skel');
const binding=JSON.parse(fs.readFileSync(path.join(auditRoot, 'semantic-binding.json'),'utf8'));
const checks={
  mainVersion:main?.skeleton?.version,
  mainCounts:main?.counts,
  allRolesResolved:Object.values(binding.semantics.roles).filter(r=>r.status==='available').length,
  missingRoles:Object.entries(binding.semantics.roles).filter(([,r])=>r.status!=='available').map(([k])=>k),
  baseAnimation:main?.animations?.some(a=>a.name==='idle'),
  handTarget:binding.semantics.roles.handTarget.resolved,
  faceTarget:binding.semantics.roles.faceTarget.resolved,
  prototype:binding.prototype.generatedAction
};
console.log(JSON.stringify(checks,null,2));
if(!checks.baseAnimation || checks.missingRoles.length) process.exit(1);
