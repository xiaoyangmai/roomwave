/* Painted parts share a fixed kitchen camera; cakes are assembled at runtime. */
(() => {
  const parts=['kitchen','baker-idle','baker-place','baker-spread-low','baker-spread-arm','baker-pipe','baker-present','sponge-vanilla','sponge-chocolate','sponge-strawberry','filling-cream','filling-chocolate','filling-strawberry','icing-white','icing-pink','icing-chocolate','candle'];
  const assets=Object.fromEntries(parts.map(key=>[key,`/assets/baking-room-v3/${key}.webp`]));
  for(const action of ['apron','spoon','strawberry'])assets[`baker-idle-${action}`]=`/assets/baking-room-v4/baker-idle-${action}.webp`;
  for(const key of ['strawberry','chocolate'])assets[key]=`/assets/baking-room-v1/${key}.webp`;
  for(const key of ['blueberry','cherry','kiwi','cream','macaron'])assets[key]=`/assets/baking-room-v2/${key}.webp`;
  globalThis.BakingArt=Object.freeze({width:1024,height:1536,assets:Object.freeze(assets)});
})();
