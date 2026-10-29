"""Independent static PE code/constant extraction, not REA Evidence."""
from pathlib import Path
import struct, json, hashlib, subprocess
root=Path(__file__).parent
path=Path(r'D:\#Software\ripx\RipX.exe')
b=path.read_bytes(); pe=struct.unpack_from('<I',b,60)[0]
ns=struct.unpack_from('<H',b,pe+6)[0]; ol=struct.unpack_from('<H',b,pe+20)[0]; opt=pe+24
base=struct.unpack_from('<Q',b,opt+24)[0]
sections=[]
for i in range(ns):
    q=opt+ol+40*i; vs,va,sz,off=struct.unpack_from('<IIII',b,q+8)
    sections.append(dict(name=b[q:q+8].rstrip(b'\0').decode(),rva=va,size=sz,offset=off))
def offset(va):
    rva=va-base
    for s in sections:
        if s['rva']<=rva<s['rva']+s['size']: return s['offset']+rva-s['rva']
    raise ValueError(hex(va))
constants={}
for va in (0x1408501f8,0x1406a7a10,0x1406a7a80,0x140850128,0x1408502b0):
    raw=b[offset(va):offset(va)+8]
    constants[hex(va)]={'hex':raw.hex(),'double':struct.unpack('<d',raw)[0]}
text=next(s for s in sections if s['name']=='.text')
refs=[]
target=0x154f06340
# RIP-relative instruction candidates. These are independently verified with
# disassembly at the containing .pdata unwind range, not treated as typed REA xrefs.
data=b[text['offset']:text['offset']+text['size']]
for j in range(len(data)-7):
    if data[j:j+2] in (b'\x48\x8b', b'\x48\x89', b'\x48\x8d') and data[j+2]&0xc7==0x05:
        va=base+text['rva']+j
        if va+7+struct.unpack_from('<i',data,j+3)[0]==target:
            refs.append({'va':hex(va),'opcode':data[j:j+7].hex()})
pdata=next(s for s in sections if s['name']=='.pdata')
funcs=[]
for q in range(pdata['offset'],pdata['offset']+pdata['size']-11,12):
    a,z,_=struct.unpack_from('<III',b,q)
    if a and z: funcs.append((base+a,base+z))
for ref in refs:
    va=int(ref['va'],16)
    match=next(((a,z) for a,z in funcs if a<=va<z),None)
    ref['unwind_range']=list(map(hex,match)) if match else None
    if ref['opcode'].startswith('4889') and match:
        a,z=match
        dis=subprocess.check_output(['objdump','-d','-M','intel','--start-address='+hex(a),'--stop-address='+hex(z),str(path)],text=True)
        (root/f'direct-table-init-{a:x}.asm').write_text(dis,encoding='utf8')
result={'target':str(path),'sha256':hashlib.sha256(b).hexdigest(),'source':'independent PE bytes and objdump, not REA Evidence','constants':constants,'table_pointer_candidates':refs}
(root/'3190b0-static-evidence.json').write_text(json.dumps(result,indent=2),encoding='utf8')
if __name__ == '__main__':
    print(json.dumps(result,indent=2))
