
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014034ca90 <.text+0x34ba90>:
   14034ca90:	33 c0                	xor    eax,eax
   14034ca92:	45 85 ed             	test   r13d,r13d
   14034ca95:	7e 08                	jle    0x14034ca9f
   14034ca97:	45 3b c6             	cmp    r8d,r14d
   14034ca9a:	0f 9e c0             	setle  al
   14034ca9d:	eb 06                	jmp    0x14034caa5
   14034ca9f:	45 3b c6             	cmp    r8d,r14d
   14034caa2:	0f 9d c0             	setge  al
   14034caa5:	85 c0                	test   eax,eax
   14034caa7:	0f 84 d0 00 00 00    	je     0x14034cb7d
   14034caad:	0f b7 8d b8 00 00 00 	movzx  ecx,WORD PTR [rbp+0xb8]
   14034cab4:	41 2b d7             	sub    edx,r15d
   14034cab7:	45 0f b7 d3          	movzx  r10d,r11w
   14034cabb:	8d 04 16             	lea    eax,[rsi+rdx*1]
   14034cabe:	0f af c1             	imul   eax,ecx
   14034cac1:	41 03 c2             	add    eax,r10d
   14034cac4:	48 98                	cdqe
   14034cac6:	48 69 d0 10 04 00 00 	imul   rdx,rax,0x410
   14034cacd:	48 03 95 b0 00 00 00 	add    rdx,QWORD PTR [rbp+0xb0]
   14034cad4:	f3 0f 10 12          	movss  xmm2,DWORD PTR [rdx]
   14034cad8:	83 ff ff             	cmp    edi,0xffffffff
   14034cadb:	74 4a                	je     0x14034cb27
   14034cadd:	45 85 ed             	test   r13d,r13d
   14034cae0:	7e 0c                	jle    0x14034caee
   14034cae2:	66 41 0f 6e c9       	movd   xmm1,r9d
   14034cae7:	41 8d 44 24 02       	lea    eax,[r12+0x2]
   14034caec:	eb 11                	jmp    0x14034caff
   14034caee:	8b 45 a8             	mov    eax,DWORD PTR [rbp-0x58]
   14034caf1:	41 03 c0             	add    eax,r8d
   14034caf4:	66 0f 6e c8          	movd   xmm1,eax
   14034caf8:	8b c6                	mov    eax,esi
   14034cafa:	2b c7                	sub    eax,edi
   14034cafc:	83 c0 02             	add    eax,0x2
   14034caff:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14034cb02:	66 0f 6e c0          	movd   xmm0,eax
   14034cb06:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14034cb09:	f3 0f 5e c8          	divss  xmm1,xmm0
   14034cb0d:	0f 28 c6             	movaps xmm0,xmm6
   14034cb10:	f3 0f 5c c1          	subss  xmm0,xmm1
   14034cb14:	f3 0f 59 cc          	mulss  xmm1,xmm4
   14034cb18:	f3 0f 59 c3          	mulss  xmm0,xmm3
   14034cb1c:	f3 0f 58 c1          	addss  xmm0,xmm1
   14034cb20:	f3 0f 5d c2          	minss  xmm0,xmm2
   14034cb24:	0f 28 d0             	movaps xmm2,xmm0
   14034cb27:	48 8b 5d b0          	mov    rbx,QWORD PTR [rbp-0x50]
   14034cb2b:	41 0f b7 c3          	movzx  eax,r11w
   14034cb2f:	f3 0f 5c 14 83       	subss  xmm2,DWORD PTR [rbx+rax*4]
   14034cb34:	48 8b 9d c0 00 00 00 	mov    rbx,QWORD PTR [rbp+0xc0]
   14034cb3b:	8b c6                	mov    eax,esi
   14034cb3d:	41 2b c7             	sub    eax,r15d
   14034cb40:	0f af c1             	imul   eax,ecx
   14034cb43:	f3 41 0f 5f d2       	maxss  xmm2,xmm10
   14034cb48:	41 03 c2             	add    eax,r10d
   14034cb4b:	48 63 c8             	movsxd rcx,eax
   14034cb4e:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034cb51:	f3 0f 11 14 88       	movss  DWORD PTR [rax+rcx*4],xmm2
   14034cb56:	f3 0f 10 02          	movss  xmm0,DWORD PTR [rdx]
   14034cb5a:	f3 0f 5c c2          	subss  xmm0,xmm2
   14034cb5e:	41 0f 2f c2          	comiss xmm0,xmm10
   14034cb62:	77 04                	ja     0x14034cb68
   14034cb64:	41 0f 28 c2          	movaps xmm0,xmm10
   14034cb68:	45 03 c5             	add    r8d,r13d
   14034cb6b:	f3 0f 11 02          	movss  DWORD PTR [rdx],xmm0
   14034cb6f:	8b 15 6f d4 63 00    	mov    edx,DWORD PTR [rip+0x63d46f]        # 0x140989fe4
   14034cb75:	45 2b cd             	sub    r9d,r13d
   14034cb78:	e9 13 ff ff ff       	jmp    0x14034ca90
   14034cb7d:	44 0f b7 55 80       	movzx  r10d,WORD PTR [rbp-0x80]
   14034cb82:	45 8d 4c 24 01       	lea    r9d,[r12+0x1]
   14034cb87:	66 41 ff c3          	inc    r11w
   14034cb8b:	66 45 3b da          	cmp    r11w,r10w
   14034cb8f:	0f 86 50 fe ff ff    	jbe    0x14034c9e5
   14034cb95:	44 0f b7 65 84       	movzx  r12d,WORD PTR [rbp-0x7c]
   14034cb9a:	4c                   	rex.WR
   14034cb9b:	8b                   	.byte 0x8b
   14034cb9c:	85                   	.byte 0x85
   14034cb9d:	a8 00                	test   al,0x0
	...
