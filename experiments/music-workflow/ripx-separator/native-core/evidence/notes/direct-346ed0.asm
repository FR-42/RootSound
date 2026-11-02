
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140346ed0 <.text+0x345ed0>:
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
   140346f59:	f2 44 0f 10 0d 1e 72 	movsd  xmm9,QWORD PTR [rip+0x34721e]        # 0x14068e180
   140346f60:	34 00 
   140346f62:	45 0f 29 53 88       	movaps XMMWORD PTR [r11-0x78],xmm10
   140346f67:	f2 44 0f 10 15 b0 71 	movsd  xmm10,QWORD PTR [rip+0x3471b0]        # 0x14068e120
   140346f6e:	34 00 
   140346f70:	44 0f 29 5c 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm11
   140346f76:	f3 44 0f 10 1d 31 72 	movss  xmm11,DWORD PTR [rip+0x347231]        # 0x14068e1b0
   140346f7d:	34 00 
   140346f7f:	44 0f 29 64 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm12
   140346f85:	f2 44 0f 10 25 c2 13 	movsd  xmm12,QWORD PTR [rip+0x3613c2]        # 0x1406a8350
   140346f8c:	36 00 
   140346f8e:	44 0f 29 6c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm13
   140346f94:	f3 44 0f 10 2d 53 93 	movss  xmm13,DWORD PTR [rip+0x509353]        # 0x1408502f0
   140346f9b:	50 00 
   140346f9d:	0f 1f 00             	nop    DWORD PTR [rax]
   140346fa0:	40 0f b6 c7          	movzx  eax,dil
   140346fa4:	33 d2                	xor    edx,edx
   140346fa6:	48 69 d8 30 02 00 00 	imul   rbx,rax,0x230
   140346fad:	41 b8 30 02 00 00    	mov    r8d,0x230
   140346fb3:	49 03 df             	add    rbx,r15
   140346fb6:	48 8b cb             	mov    rcx,rbx
   140346fb9:	e8 2c 9d 2d 00       	call   0x140620cea
   140346fbe:	45 84 f6             	test   r14b,r14b
   140346fc1:	74 07                	je     0x140346fca
   140346fc3:	b8 ff ff ff ff       	mov    eax,0xffffffff
   140346fc8:	eb 0e                	jmp    0x140346fd8
   140346fca:	41 b0 01             	mov    r8b,0x1
   140346fcd:	0f 28 cf             	movaps xmm1,xmm7
   140346fd0:	48 8b ce             	mov    rcx,rsi
   140346fd3:	e8 c8 47 fd ff       	call   0x14031b7a0
   140346fd8:	89 83 28 02 00 00    	mov    DWORD PTR [rbx+0x228],eax
   140346fde:	0f 57 c0             	xorps  xmm0,xmm0
   140346fe1:	40 88 bb 2c 02 00 00 	mov    BYTE PTR [rbx+0x22c],dil
   140346fe8:	41 8b cc             	mov    ecx,r12d
   140346feb:	8b 05 b7 31 64 00    	mov    eax,DWORD PTR [rip+0x6431b7]        # 0x14098a1a8
   140346ff1:	0f af c8             	imul   ecx,eax
   140346ff4:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140346ff9:	99                   	cdq
   140346ffa:	2b c2                	sub    eax,edx
   140346ffc:	d1 f8                	sar    eax,1
   140346ffe:	03 c8                	add    ecx,eax
   140347000:	f2 0f 58 c0          	addsd  xmm0,xmm0
   140347004:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12
   140347009:	f2 44 0f 2c c0       	cvttsd2si r8d,xmm0
   14034700e:	41 8b c0             	mov    eax,r8d
   140347011:	99                   	cdq
   140347012:	2b c2                	sub    eax,edx
   140347014:	d1 f8                	sar    eax,1
   140347016:	2b c8                	sub    ecx,eax
   140347018:	b8 00 00 00 00       	mov    eax,0x0
   14034701d:	85 c9                	test   ecx,ecx
   14034701f:	0f 4e c8             	cmovle ecx,eax
   140347022:	89 8b 18 02 00 00    	mov    DWORD PTR [rbx+0x218],ecx
   140347028:	44 03 c1             	add    r8d,ecx
   14034702b:	8b 4e 28             	mov    ecx,DWORD PTR [rsi+0x28]
   14034702e:	8b 46 24             	mov    eax,DWORD PTR [rsi+0x24]
   140347031:	8d 14 48             	lea    edx,[rax+rcx*2]
   140347034:	0f af 15 6d 31 64 00 	imul   edx,DWORD PTR [rip+0x64316d]        # 0x14098a1a8
   14034703b:	48 8d 4b 18          	lea    rcx,[rbx+0x18]
   14034703f:	44 3b c2             	cmp    r8d,edx
   140347042:	44 0f 4d c2          	cmovge r8d,edx
   140347046:	33 d2                	xor    edx,edx
   140347048:	44 89 83 1c 02 00 00 	mov    DWORD PTR [rbx+0x21c],r8d
   14034704f:	41 b8 00 02 00 00    	mov    r8d,0x200
   140347055:	e8 90 9c 2d 00       	call   0x140620cea
   14034705a:	f3 44 0f 11 6c 24 38 	movss  DWORD PTR [rsp+0x38],xmm13
   140347061:	4c 8b cb             	mov    r9,rbx
   140347064:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0
   140347069:	45 8b c4             	mov    r8d,r12d
   14034706c:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   140347071:	49 8b d5             	mov    rdx,r13
   140347074:	48 8b ce             	mov    rcx,rsi
   140347077:	c6 44 24 20 00       	mov    BYTE PTR [rsp+0x20],0x0
   14034707c:	f3 0f 11 3b          	movss  DWORD PTR [rbx],xmm7
   140347080:	e8 ab 47 fd ff       	call   0x14031b830
   140347085:	f3 0f 10 43 10       	movss  xmm0,DWORD PTR [rbx+0x10]
   14034708a:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034708d:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12
   140347092:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   140347096:	f3 0f 11 4b 10       	movss  DWORD PTR [rbx+0x10],xmm1
   14034709b:	0f 28 c1             	movaps xmm0,xmm1
   14034709e:	80 3d 6c 2e 64 00 00 	cmp    BYTE PTR [rip+0x642e6c],0x0        # 0x140989f11
   1403470a5:	74 0e                	je     0x1403470b5
   1403470a7:	44 0f 2f c1          	comiss xmm8,xmm1
   1403470ab:	76 08                	jbe    0x1403470b5
   1403470ad:	33 c0                	xor    eax,eax
   1403470af:	0f 28 c6             	movaps xmm0,xmm6
   1403470b2:	89 43 10             	mov    DWORD PTR [rbx+0x10],eax
   1403470b5:	40 84 ed             	test   bpl,bpl
   1403470b8:	74 2a                	je     0x1403470e4
   1403470ba:	0f 2f f0             	comiss xmm6,xmm0
   1403470bd:	72 05                	jb     0x1403470c4
   1403470bf:	0f 28 c6             	movaps xmm0,xmm6
   1403470c2:	eb 1b                	jmp    0x1403470df
   1403470c4:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   1403470c8:	41 0f 28 ca          	movaps xmm1,xmm10
   1403470cc:	f2 41 0f 5e c1       	divsd  xmm0,xmm9
   1403470d1:	e8 a4 9c 2d 00       	call   0x140620d7a
   1403470d6:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   1403470da:	f3 41 0f 59 c3       	mulss  xmm0,xmm11
   1403470df:	f3 0f 11 43 10       	movss  DWORD PTR [rbx+0x10],xmm0
   1403470e4:	40 fe c7             	inc    dil
   1403470e7:	40 0f b6 c7          	movzx  eax,dil
   1403470eb:	3b 05 b7 28 5f 00    	cmp    eax,DWORD PTR [rip+0x5f28b7]        # 0x1409399a8
   1403470f1:	0f 82 a9 fe ff ff    	jb     0x140346fa0
   1403470f7:	44 0f 28 6c 24 40    	movaps xmm13,XMMWORD PTR [rsp+0x40]
   1403470fd:	44 0f 28 64 24 50    	movaps xmm12,XMMWORD PTR [rsp+0x50]
   140347103:	44 0f 28 5c 24 60    	movaps xmm11,XMMWORD PTR [rsp+0x60]
   140347109:	44 0f 28 54 24 70    	movaps xmm10,XMMWORD PTR [rsp+0x70]
   14034710f:	44 0f 28 8c 24 80 00 	movaps xmm9,XMMWORD PTR [rsp+0x80]
   140347116:	00 00 
   140347118:	44 0f 28 84 24 90 00 	movaps xmm8,XMMWORD PTR [rsp+0x90]
   14034711f:	00 00 
   140347121:	0f 28 bc 24 a0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xa0]
   140347128:	00 
   140347129:	0f 28 b4 24 b0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xb0]
   140347130:	00 
   140347131:	4c 8b bc 24 c0 00 00 	mov    r15,QWORD PTR [rsp+0xc0]
   140347138:	00 
   140347139:	4c 8b b4 24 00 01 00 	mov    r14,QWORD PTR [rsp+0x100]
   140347140:	00 
   140347141:	48 8b ac 24 f8 00 00 	mov    rbp,QWORD PTR [rsp+0xf8]
   140347148:	00 
   140347149:	48 8b 9c 24 f0 00 00 	mov    rbx,QWORD PTR [rsp+0xf0]
   140347150:	00 
   140347151:	48 81 c4 c8 00 00 00 	add    rsp,0xc8
   140347158:	41 5d                	pop    r13
   14034715a:	41 5c                	pop    r12
   14034715c:	5f                   	pop    rdi
   14034715d:	5e                   	pop    rsi
   14034715e:	c3                   	ret
   14034715f:	cc                   	int3
   140347160:	cc                   	int3
   140347161:	cc                   	int3
   140347162:	cc                   	int3
   140347163:	cc                   	int3
   140347164:	cc                   	int3
   140347165:	cc                   	int3
   140347166:	cc                   	int3
   140347167:	cc                   	int3
   140347168:	cc                   	int3
   140347169:	cc                   	int3
   14034716a:	cc                   	int3
   14034716b:	cc                   	int3
   14034716c:	cc                   	int3
   14034716d:	cc                   	int3
   14034716e:	cc                   	int3
   14034716f:	cc                   	int3
