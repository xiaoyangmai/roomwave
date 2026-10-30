from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parents[1]
base = 'https://roomwave-live.sagan1122.chatgpt.site/assets'
poses = ['idle','idle-cheer','idle-pout','water','recover','fan-hold-a','fan-hold-b','fan-hold-c','fan-catch','fan-missed-shorts','fan-missed-shorts-alt','fan-missed-shorts-gamer','foam-brush','foam-wipe']
assets = {'background', 'chair'}
for pose in poses:
    assets.add(pose)
    assets.add(f'{pose}-damp')
    assets.add(f'{pose}-damp' if pose == 'fan-missed-shorts-gamer' else f'{pose}-wet')
next_assets = {'fan-missed-shorts-gamer'} | {f'{p}-damp' for p in poses if p != 'idle'} | {f'{p}-wet' for p in poses if p != 'idle' and p != 'fan-missed-shorts-gamer'}

def fetch(name):
    folder = 'gaming-seated-v3' if name in next_assets else 'gaming-seated-v2'
    url = f'{base}/{folder}/{name}.webp'
    out = root / 'assets' / folder / f'{name}.webp'
    out.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urlopen(Request(url, headers={'User-Agent': 'Roomwave-public-assets-mirror/1.0'}), timeout=20) as response:
            data = response.read()
        out.write_bytes(data)
        return name, True, len(data), url
    except Exception as exc:
        return name, False, 0, f'{url} :: {exc}'

ok = []
failed = []
with ThreadPoolExecutor(max_workers=12) as pool:
    for future in as_completed([pool.submit(fetch, name) for name in sorted(assets)]):
        name, success, size, detail = future.result()
        (ok if success else failed).append((name, size, detail))
print(f'downloaded={len(ok)} failed={len(failed)}')
for item in sorted(failed):
    print('FAILED', item[2])
