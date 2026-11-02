
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140365f70 <.text+0x364f70>:
   140365f70:	8b c1                	mov    eax,ecx
   140365f72:	0f 57 c0             	xorps  xmm0,xmm0
   140365f75:	b9 04 00 00 00       	mov    ecx,0x4
   140365f7a:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140365f7f:	b8 02 00 00 00       	mov    eax,0x2
   140365f84:	8b d0                	mov    edx,eax
   140365f86:	f3 0f 59 05 2e 19 34 	mulss  xmm0,DWORD PTR [rip+0x34192e]        # 0x1406a78bc
   140365f8d:	00 
   140365f8e:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   140365f93:	41 ff c0             	inc    r8d
   140365f96:	41 3b c8             	cmp    ecx,r8d
   140365f99:	77 0b                	ja     0x140365fa6
   140365f9b:	8b c1                	mov    eax,ecx
   140365f9d:	ff c2                	inc    edx
   140365f9f:	d1 c1                	rol    ecx,1
   140365fa1:	83 fa 10             	cmp    edx,0x10
   140365fa4:	72 f0                	jb     0x140365f96
   140365fa6:	c3                   	ret
   140365fa7:	cc                   	int3
   140365fa8:	cc                   	int3
   140365fa9:	cc                   	int3
   140365faa:	cc                   	int3
   140365fab:	cc                   	int3
   140365fac:	cc                   	int3
   140365fad:	cc                   	int3
   140365fae:	cc                   	int3
   140365faf:	cc                   	int3
   140365fb0:	f3 0f 10 0d 24 a0 4e 	movss  xmm1,DWORD PTR [rip+0x4ea024]        # 0x14084ffdc
   140365fb7:	00 
   140365fb8:	0f 57 d2             	xorps  xmm2,xmm2
   140365fbb:	8b c2                	mov    eax,edx
   140365fbd:	0f 57 c0             	xorps  xmm0,xmm0
   140365fc0:	4d 8b d0             	mov    r10,r8
   140365fc3:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   140365fc8:	8b c1                	mov    eax,ecx
   140365fca:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140365fcf:	f3 0f 5e d0          	divss  xmm2,xmm0
   140365fd3:	0f 28 c1             	movaps xmm0,xmm1
   140365fd6:	41 81 f9 03 ff 00 00 	cmp    r9d,0xff03
   140365fdd:	7f 22                	jg     0x140366001
   140365fdf:	41 81 f9 01 ff 00 00 	cmp    r9d,0xff01
   140365fe6:	7d 25                	jge    0x14036600d
   140365fe8:	41 83 f9 01          	cmp    r9d,0x1
   140365fec:	76 09                	jbe    0x140365ff7
   140365fee:	41 81 f9 00 ff 00 00 	cmp    r9d,0xff00
   140365ff5:	75 19                	jne    0x140366010
   140365ff7:	f3 0f 10 05 29 f6 33 	movss  xmm0,DWORD PTR [rip+0x33f629]        # 0x1406a5628
   140365ffe:	00 
   140365fff:	eb 0f                	jmp    0x140366010
   140366001:	41 8d 81 fb 00 ff ff 	lea    eax,[r9-0xff05]
   140366008:	83 f8 02             	cmp    eax,0x2
   14036600b:	77 03                	ja     0x140366010
   14036600d:	0f 28 c1             	movaps xmm0,xmm1
