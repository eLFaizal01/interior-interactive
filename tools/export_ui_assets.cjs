// Requires sharp. Set NODE_PATH to the directory containing installed packages.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
async function main() {
  const file = path.join(root, 'config/ui-assets.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const asset of Object.values(manifest.assets)) {
    if (!asset.pngPath) continue;
    const [w,h] = asset.logicalSize;
    await sharp(path.join(root, asset.path), {density: 144})
      .resize(w * 2, h * 2).png().toFile(path.join(root, asset.pngPath));
    const info = await sharp(path.join(root, asset.pngPath)).metadata();
    if (info.width !== w * 2 || info.height !== h * 2 || !info.hasAlpha) {
      throw new Error(`Invalid PNG: ${asset.pngPath}`);
    }
  }
  const background = 'assets/images/ui/backgrounds/menu-room.png';
  if (fs.existsSync(path.join(root, background))) {
    const meta = await sharp(path.join(root, background)).metadata();
    manifest.assets['ui.backgrounds.menu-room'] = {
      type: 'image', path: background, pixelSize: [meta.width, meta.height],
      usage: 'Menu background; keep right-side furniture visible and overlay text on left.'
    };
  }
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
  const registryFile = path.join(root, 'config/assets.json');
  const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8').replace(/^\uFEFF/, ''));
  Object.assign(registry.assets, manifest.assets);
  for (const asset of Object.values(manifest.assets)) {
    if (!fs.existsSync(path.join(root, asset.path))) throw new Error(`Missing ${asset.path}`);
  }
  fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2) + '\n');
  await sharp(path.join(root, 'docs/ui/asset-overview.svg'))
    .png().toFile(path.join(root, 'docs/ui/asset-overview.png'));
  console.log(`Exported and verified ${Object.keys(manifest.assets).length} UI entries; main asset registry updated.`);
}
main().catch(error => { console.error(error); process.exit(1); });
