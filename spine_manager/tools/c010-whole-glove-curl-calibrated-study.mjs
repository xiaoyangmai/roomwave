// Manually placed sleeve/hand boundaries; the original JPEG pixels stay unchanged.
import sharp from '../../spine_runtime/node_modules/sharp/lib/index.js';

export async function addWholeGloveCurl(project, controls, jpeg) {
  const png = await sharp(jpeg).png().toBuffer();
  project.entries.set('images/derived/dorsal_curl_whole.png', new Uint8Array(png));
  // Rows are [image y, left edge, gap start, gap end, right edge]; identical
  // gap coordinates mean the hand is continuous at that row.
  const rows = [
    [195,307,321,321,335],[205,286,350,350,365],[215,264,355,355,447],
    [250,222,370,370,539],[285,201,385,385,574],[320,190,269,287,641],
    [355,196,245,275,673],[370,196,262,270,690],[375,196,270,270,693],
    [385,197,344,344,701],[390,197,341,347,704],[425,206,312,340,724],
    [460,210,303,339,728],[495,212,325,382,725],[530,225,353,387,724],
    [540,229,371,383,724],[545,232,383,383,725],[565,247,440,440,727],
    [600,266,450,450,733],[635,284,470,470,738],
    [670,311,490,490,741],[705,346,515,515,748],[740,378,540,540,764],
    [775,416,570,570,773],[810,456,600,600,792],[845,482,630,630,799],
    [880,498,655,655,813],[915,505,615,615,723],[950,515,570,570,623],
    [985,521,532,532,543],
  ];
  const uvs = [], weights = [], triangles = [], vertexRows = [];
  for (const [py, left, gapLeft, gapRight, right] of rows) {
    const ids = [];
    for (const px of [left, gapLeft, gapRight, right]) {
      if (ids.length === 2 && gapLeft === gapRight) { ids.push(ids[1]); continue; }
      ids.push(weights.length);
      const dx = px * 1186 / 960 - 800, dy = 1160 - py * 1326 / 1072;
      const x = (-700 * dx + 1030 * dy) / 1245 * .12;
      const y = (-1030 * dx - 700 * dy) / 1245 * .12;
      uvs.push(px / 960, py / 1072);
      weights.push([{ bone: controls.handBone, x, y, weight: 1 }]);
    }
    vertexRows.push(ids);
  }
  for (let row = 0; row < rows.length - 1; row++) {
    const a = vertexRows[row], b = vertexRows[row + 1];
    triangles.push(a[0], b[0], a[1], a[1], b[0], b[1],
      a[2], b[2], a[3], a[3], b[2], b[3]);
  }
  const attachment = { name: 'dorsal_curl_whole', type: 'mesh', image: 'derived/dorsal_curl_whole', width: 960, height: 1072, uvs, triangles, weights, hull: 0, edges: [], color: [1, 1, 1, 1] };
  for (const skin of project.doc.skins) project.doc.skinAttachments(controls.handSlot, skin.name).push(structuredClone(attachment));
}
