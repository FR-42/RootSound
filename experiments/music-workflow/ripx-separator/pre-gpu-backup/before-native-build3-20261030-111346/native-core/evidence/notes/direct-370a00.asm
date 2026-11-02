
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140370a00 <.text+0x36fa00>:
   140370a00:	88 54 24 10          	mov    BYTE PTR [rsp+0x10],dl
   140370a04:	48 89 4c 24 08       	mov    QWORD PTR [rsp+0x8],rcx
   140370a09:	55                   	push   rbp
   140370a0a:	41 54                	push   r12
   140370a0c:	48 8d ac 24 48 ff ff 	lea    rbp,[rsp-0xb8]
   140370a13:	ff 
   140370a14:	48 81 ec b8 01 00 00 	sub    rsp,0x1b8
   140370a1b:	80 3d af 56 b9 14 00 	cmp    BYTE PTR [rip+0x14b956af],0x0        # 0x154f060d1
   140370a22:	4c 8b e1             	mov    r12,rcx
   140370a25:	75 16                	jne    0x140370a3d
   140370a27:	80 3d a2 56 b9 14 00 	cmp    BYTE PTR [rip+0x14b956a2],0x0        # 0x154f060d0
   140370a2e:	75 0d                	jne    0x140370a3d
   140370a30:	b0 01                	mov    al,0x1
   140370a32:	48 81 c4 b8 01 00 00 	add    rsp,0x1b8
   140370a39:	41 5c                	pop    r12
   140370a3b:	5d                   	pop    rbp
   140370a3c:	c3                   	ret
   140370a3d:	8b 01                	mov    eax,DWORD PTR [rcx]
   140370a3f:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
