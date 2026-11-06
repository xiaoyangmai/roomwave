const assert = require('node:assert/strict');

module.exports = function foamPalmLineage(skeleton, expectedAncestor) {
  let bone = skeleton.bones.find(item => item.name === 'foam_palm_anchor');
  assert.ok(bone, 'foam_palm_anchor is missing from the tested skeleton.');
  const lineage = [];
  while (bone) {
    lineage.push(bone.name);
    bone = skeleton.bones.find(item => item.name === bone.parent);
  }
  if (expectedAncestor) assert.ok(lineage.includes(expectedAncestor),
    `foam_palm_anchor is not attached to ${expectedAncestor}: ${lineage.join(' -> ')}`);
  return lineage;
};
