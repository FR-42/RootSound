
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140346e90 <.text+0x345e90>:
   140346e90:	48 83 ec 28          	sub    rsp,0x28
   140346e94:	0f 28 c8             	movaps xmm1,xmm0
   140346e97:	0f 57 c0             	xorps  xmm0,xmm0
   140346e9a:	0f 2f c1             	comiss xmm0,xmm1
   140346e9d:	73 28                	jae    0x140346ec7
   140346e9f:	0f 57 c0             	xorps  xmm0,xmm0
   140346ea2:	f3 0f 5a c1          	cvtss2sd xmm0,xmm1
   140346ea6:	f2 0f 10 0d 72 72 34 	movsd  xmm1,QWORD PTR [rip+0x347272]        # 0x14068e120
   140346ead:	00 
   140346eae:	f2 0f 5e 05 ca 72 34 	divsd  xmm0,QWORD PTR [rip+0x3472ca]        # 0x14068e180
   140346eb5:	00 
   140346eb6:	e8 bf 9e 2d 00       	call   0x140620d7a
   140346ebb:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140346ebf:	f3 0f 59 05 e9 72 34 	mulss  xmm0,DWORD PTR [rip+0x3472e9]        # 0x14068e1b0
   140346ec6:	00 
   140346ec7:	48 83 c4 28          	add    rsp,0x28
   140346ecb:	c3                   	ret
   140346ecc:	cc                   	int3
   140346ecd:	cc                   	int3
   140346ece:	cc                   	int3
   140346ecf:	cc                   	int3
   140346ed0:	4c 8b dc             	mov    r11,rsp
   140346ed3:	56                   	push   rsi
   140346ed4:	57                   	push   rdi
   140346ed5:	41 54                	push   r12
   140346ed7:	41 55                	push   r13
   140346ed9:	48 81 ec c8 00 00 00 	sub    rsp,0xc8
   140346ee0:	83 3d c1 2a 5f 00 03 	cmp    DWORD PTR [rip+0x5f2ac1],0x3        # 0x1409399a8
   140346ee7:	45 8b e0             	mov    r12d,r8d
   140346eea:	4c 8b ea             	mov    r13,rdx
   140346eed:	48 8b f1             	mov    rsi,rcx
   140346ef0:	40 0f 93 c7          	setae  dil
   140346ef4:	40 0f b6 c7          	movzx  eax,dil
   140346ef8:	3b 05 aa 2a 5f 00    	cmp    eax,DWORD PTR [rip+0x5f2aaa]        # 0x1409399a8
   140346efe:	0f 83 4d 02 00 00    	jae    0x140347151
   140346f04:	49 89 5b 08          	mov    QWORD PTR [r11+0x8],rbx
   140346f08:	45 2b e1             	sub    r12d,r9d
   140346f0b:	49 89 6b 10          	mov    QWORD PTR [r11+0x10],rbp
   140346f0f:	0f b6 ac 24 28 01 00 	movzx  ebp,BYTE PTR [rsp+0x128]
   140346f16:	00 
   140346f17:	4d 89 73 18          	mov    QWORD PTR [r11+0x18],r14
   140346f1b:	44 0f b6 b4 24 20 01 	movzx  r14d,BYTE PTR [rsp+0x120]
   140346f22:	00 00 
   140346f24:	4d 89 7b d8          	mov    QWORD PTR [r11-0x28],r15
   140346f28:	4c 8b bc 24 18 01 00 	mov    r15,QWORD PTR [rsp+0x118]
   140346f2f:	00 
   140346f30:	41 0f 29 73 c8       	movaps XMMWORD PTR [r11-0x38],xmm6
   140346f35:	0f 57 f6             	xorps  xmm6,xmm6
   140346f38:	41 0f 29 7b b8       	movaps XMMWORD PTR [r11-0x48],xmm7
   140346f3d:	f3 0f 10 bc 24 10 01 	movss  xmm7,DWORD PTR [rsp+0x110]
   140346f44:	00 00 
   140346f46:	45 0f 29 43 a8       	movaps XMMWORD PTR [r11-0x58],xmm8
   140346f4b:	f3 44 0f 10 05 30 93 	movss  xmm8,DWORD PTR [rip+0x509330]        # 0x140850284
   140346f52:	50 00 
   140346f54:	45 0f 29 4b 98       	movaps XMMWORD PTR [r11-0x68],xmm9
   140346f59:	f2                   	repnz
   140346f5a:	44                   	rex.R
   140346f5b:	0f                   	.byte 0xf
   140346f5c:	10                   	.byte 0x10
   140346f5d:	0d                   	.byte 0xd
   140346f5e:	1e                   	(bad)
   140346f5f:	72                   	.byte 0x72
