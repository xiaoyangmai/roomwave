// Isolated whole-glove geometry study. The source bitmap is not modified.
import sharp from '../../spine_runtime/node_modules/sharp/lib/index.js';

export async function addWholeGloveCurl(project, controls, jpeg) {
  const { data, info } = await sharp(jpeg).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const png = await sharp(jpeg).png().toBuffer();
  project.entries.set('images/derived/dorsal_curl_whole.png', new Uint8Array(png));
  const cols = 36, rows = 40, uvs = [], weights = [], triangles = [], inside = [];
  const map = (px, py) => {
    const dx = px * 1186 / info.width - 800, dy = 1160 - py * 1326 / info.height;
    return [(-700 * dx + 1030 * dy) / 1245 * .12, (-1030 * dx - 700 * dy) / 1245 * .12];
  };
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
    const u = col / cols, v = row / rows;
    const px = Math.min(info.width - 1, Math.round(u * (info.width - 1)));
    const py = Math.min(info.height - 1, Math.round(v * (info.height - 1)));
    const pixel = (py * info.width + px) * info.channels;
    inside.push(Math.max(data[pixel], data[pixel + 1], data[pixel + 2]) > 13);
    uvs.push(u, v);
    const [x, y] = map(px, py);
    weights.push([{ bone: controls.handBone, x, y, weight: 1 }]);
  }
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const a = row * (cols + 1) + col, b = a + cols + 1, c = a + 1, d = b + 1;
    if (inside[a] && inside[b] && inside[c]) triangles.push(a, b, c);
    if (inside[c] && inside[b] && inside[d]) triangles.push(c, b, d);
  }
  const attachment = { name: 'dorsal_curl_whole', type: 'mesh', image: 'derived/dorsal_curl_whole', width: info.width, height: info.height, uvs, triangles, weights, hull: 0, edges: [], color: [1, 1, 1, 1] };
  for (const skin of project.doc.skins) project.doc.skinAttachments(controls.handSlot, skin.name).push(structuredClone(attachment));
}
