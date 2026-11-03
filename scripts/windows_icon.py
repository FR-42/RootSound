"""Update only app-owned PE icon resources, preserving all other resources."""
import ctypes,os,struct
from pathlib import Path
from ctypes import wintypes

def embed_icon(executable, icon):
    if os.name!='nt':raise RuntimeError('PE icon embedding requires Windows')
    executable=Path(executable).resolve();raw=Path(icon).read_bytes()
    reserved,kind,count=struct.unpack_from('<HHH',raw);assert reserved==0 and kind==1
    kernel=ctypes.WinDLL('kernel32',use_last_error=True)
    kernel.LoadLibraryExW.argtypes=[wintypes.LPCWSTR,ctypes.c_void_p,wintypes.DWORD];kernel.LoadLibraryExW.restype=ctypes.c_void_p
    kernel.FreeLibrary.argtypes=[ctypes.c_void_p]
    callback_type=ctypes.WINFUNCTYPE(wintypes.BOOL,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p)
    kernel.EnumResourceNamesW.argtypes=[ctypes.c_void_p,ctypes.c_void_p,callback_type,ctypes.c_void_p]
    module=kernel.LoadLibraryExW(str(executable),None,0x22)
    if not module:raise ctypes.WinError(ctypes.get_last_error())
    groups=[]
    def collect(_module,_type,name,_parameter):
        groups.append(name if name<=65535 else ctypes.wstring_at(name));return True
    callback=callback_type(collect)
    try:kernel.EnumResourceNamesW(module,ctypes.c_void_p(14),callback,None)
    finally:kernel.FreeLibrary(module)
    kernel.BeginUpdateResourceW.argtypes=[wintypes.LPCWSTR,wintypes.BOOL];kernel.BeginUpdateResourceW.restype=ctypes.c_void_p
    kernel.UpdateResourceW.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,wintypes.WORD,ctypes.c_void_p,wintypes.DWORD]
    kernel.EndUpdateResourceW.argtypes=[ctypes.c_void_p,wintypes.BOOL]
    handle=kernel.BeginUpdateResourceW(str(executable),False)
    if not handle:raise ctypes.WinError(ctypes.get_last_error())
    complete=False
    try:
        table=bytearray(struct.pack('<HHH',0,1,count))
        for n in range(count):
            entry=raw[6+n*16:22+n*16];size,offset=struct.unpack_from('<II',entry,8);identifier=5000+n
            data=ctypes.create_string_buffer(raw[offset:offset+size])
            if not kernel.UpdateResourceW(handle,ctypes.c_void_p(3),ctypes.c_void_p(identifier),1033,data,size):raise ctypes.WinError(ctypes.get_last_error())
            table.extend(entry[:12]+struct.pack('<H',identifier))
        data=ctypes.create_string_buffer(bytes(table))
        for group in groups or [1]:
            name=ctypes.c_void_p(group) if isinstance(group,int) else ctypes.cast(ctypes.c_wchar_p(group),ctypes.c_void_p)
            if not kernel.UpdateResourceW(handle,ctypes.c_void_p(14),name,1033,data,len(table)):raise ctypes.WinError(ctypes.get_last_error())
        complete=True
    finally:
        if not kernel.EndUpdateResourceW(handle,not complete):raise ctypes.WinError(ctypes.get_last_error())
    return count
