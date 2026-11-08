"""Validate a small generated score against W3C's published MusicXML 4.0 XSD."""
from pathlib import Path
from urllib.request import urlopen
from lxml import etree

root = Path(__file__).resolve().parents[1] / '.test-output' / 'music-formats'
schemas = root / 'xsd'
schemas.mkdir(parents=True, exist_ok=True)
for name in ('musicxml.xsd', 'xml.xsd', 'xlink.xsd'):
    target = schemas / name
    valid = False
    if target.exists():
        try:
            etree.parse(str(target))
            valid = True
        except etree.XMLSyntaxError:
            pass
    if not valid:
        url = f'https://raw.githubusercontent.com/w3c/musicxml/v4.0/schema/{name}'
        with urlopen(url, timeout=20) as response:
            source = response.read().decode('utf-8')
        for dependency in ('xml.xsd', 'xlink.xsd'):
            source = source.replace(f'http://www.musicxml.org/xsd/{dependency}', dependency)
        target.write_bytes(source.encode('utf-8'))
schema = etree.XMLSchema(etree.parse(str(schemas / 'musicxml.xsd')))
files = sorted(root.glob('schema-*.musicxml'))
assert files, 'Generate fixtures first'
for filename in files:
    schema.assertValid(etree.parse(str(filename)))
print(f'MusicXML 4.0 XSD: {len(files)} generated scores valid')
