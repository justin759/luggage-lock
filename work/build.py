from pathlib import Path

root = Path(__file__).resolve().parent
project_root = root.parent

html = (root / 'app/index.html').read_text()
html = html.replace('/*CSS*/', (root / 'app/style.css').read_text())
html = html.replace('/*THREE*/', '/*!\n' + (root / 'three-LICENSE.txt').read_text() + '\n*/\n' + (root / 'three.min.js').read_text())
html = html.replace('/*GESTURES*/', (root / 'app/gestures.js').read_text())
html = html.replace('/*APP*/', (root / 'app/app.js').read_text())

targets = [
    project_root / 'outputs/luggage-lock.html',
    project_root / 'index.html',
]
for target in targets:
    target.write_text(html)

print('Built standalone HTML:', len(html), 'bytes')
for target in targets:
    print('-', target.relative_to(project_root))
