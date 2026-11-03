"""Bounded Mach-O ad-hoc code-page checks; not Apple trust/notarization."""
import hashlib, math, pathlib, struct

def digest(kind, data, length):
    return hashlib.new({1:'sha1',2:'sha256',3:'sha256',4:'sha384'}[kind],data).digest()[:length]

def verify_macho(filename, info=None, resources=None):
    filename=pathlib.Path(filename)
    with filename.open('rb') as stream:
        header=stream.read(32)
        if header[:4]!=b'\xcf\xfa\xed\xfe': raise ValueError('Expected thin64 Mach-O: '+str(filename))
        cpu,=struct.unpack_from('<I',header,4)
        if cpu!=0x0100000c: raise ValueError('Expected Apple ARM64 executable')
        commands,=struct.unpack_from('<I',header,16); signature=None
        for _ in range(commands):
            position=stream.tell(); command,size=struct.unpack('<II',stream.read(8))
            if command==0x1d: signature=struct.unpack('<II',stream.read(8))
            stream.seek(position+size)
        if signature is None: raise ValueError('Missing embedded code signature')
        stream.seek(signature[0]); blob=stream.read(signature[1])
        magic,length,count=struct.unpack_from('>III',blob)
        if magic!=0xfade0cc0: raise ValueError('Missing signature superblob')
        directories=[]; slots={}
        for n in range(count):
            kind,offset=struct.unpack_from('>II',blob,12+n*8)
            _,size=struct.unpack_from('>II',blob,offset); entry=blob[offset:offset+size];slots[kind]=entry
            if kind==0 or 0x1000<=kind<0x1006: directories.append(entry)
        if not directories: raise ValueError('Missing code directory')
        hashes=[]
        for directory in directories:
            magic,length,version,flags,hash_offset,identifier,special,code_slots,limit=struct.unpack_from('>9I',directory)
            hash_size,hash_type,platform,page_log=struct.unpack_from('4B',directory,36)
            if magic!=0xfade0c02: raise ValueError('Invalid code directory')
            if limit==0xffffffff: limit=struct.unpack_from('>Q',directory,56)[0]
            page=2**page_log if page_log else limit
            if code_slots!=math.ceil(limit/page): raise ValueError('Incorrect code-page count')
            stream.seek(0)
            for n in range(code_slots):
                data=stream.read(min(page,limit-n*page)); expected=directory[hash_offset+n*hash_size:hash_offset+(n+1)*hash_size]
                if digest(hash_type,data,hash_size)!=expected: raise ValueError('Executable page hash mismatch: '+str(filename))
            for slot,file in [(1,info),(3,resources)]:
                if file is not None and special>=slot:
                    expected=directory[hash_offset-slot*hash_size:hash_offset-(slot-1)*hash_size]
                    if digest(hash_type,pathlib.Path(file).read_bytes(),hash_size)!=expected: raise ValueError('Bundle metadata hash mismatch')
            if special>=5 and 5 in slots:
                expected=directory[hash_offset-5*hash_size:hash_offset-4*hash_size]
                if digest(hash_type,slots[5],hash_size)!=expected: raise ValueError('Entitlements hash mismatch')
            hashes.append(hashlib.new({1:'sha1',2:'sha256',3:'sha256',4:'sha384'}[hash_type],directory).digest()[:20].hex())
    return {'arm64':True,'codePageDigestsVerified':True,'metadataDigestsVerified':info is not None,'cdhashes':hashes}
