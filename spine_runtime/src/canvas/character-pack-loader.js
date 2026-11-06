/* Load and resolve a runtime Character Pack through the product registry. */
export async function loadCharacterPack(characterId, registryUrl = '/config/character-registry.json') {
  const registryResponse = await fetch(registryUrl);
  if (!registryResponse.ok) throw new Error(`Could not load character registry (${registryResponse.status})`);
  const registry = await registryResponse.json();
  const entry = (registry.characters || []).find((item) => item.id === characterId);
  if (!entry) throw new Error(`Character Pack is not registered: ${characterId}`);
  if (!entry.manifest) throw new Error(`Character registry entry has no manifest: ${characterId}`);

  const registryBase = new URL(registryUrl, window.location.href);
  const manifestUrl = new URL(entry.manifest, registryBase);
  const manifestResponse = await fetch(manifestUrl);
  if (!manifestResponse.ok) throw new Error(`Could not load Character Pack manifest (${manifestResponse.status})`);
  const pack = await manifestResponse.json();
  if (pack.characterId !== characterId) {
    throw new Error(`Character Pack identity mismatch: expected ${characterId}, got ${pack.characterId || 'unknown'}`);
  }

  const resolve = (value) => value ? new URL(value, manifestUrl).href : null;
  return {
    ...pack,
    skeleton: resolve(pack.skeleton),
    atlas: resolve(pack.atlas),
    texture: resolve(pack.texture || pack.textures?.[0]),
    textures: (pack.textures || []).map(resolve),
    binding: resolve(pack.binding),
    audit: resolve(pack.audit),
    patch: resolve(pack.patch),
    registry: {
      registryId: registry.registryId || null,
      registryVersion: registry.schemaVersion || null,
      entry,
      manifestUrl: manifestUrl.href,
    },
  };
}
