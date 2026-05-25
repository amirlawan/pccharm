import zipfile
import xml.etree.ElementTree as ET
import sys

docx = zipfile.ZipFile(sys.argv[1])
tree = ET.XML(docx.read('word/document.xml'))
WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
PARA = WORD_NAMESPACE + 'p'
TEXT = WORD_NAMESPACE + 't'

texts = []
for p in tree.iter(PARA):
    texts.append(''.join([node.text for node in p.iter(TEXT) if node.text]))

with open('scratch_docx.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(texts))
