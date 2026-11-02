
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140528d80 <.text+0x527d80>:
   140528d80:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   140528d85:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   140528d8a:	48 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],rdi
   140528d8f:	41 56                	push   r14
   140528d91:	48 81 ec 80 00 00 00 	sub    rsp,0x80
   140528d98:	4d 8b f1             	mov    r14,r9
   140528d9b:	49 8b d8             	mov    rbx,r8
   140528d9e:	8b ea                	mov    ebp,edx
   140528da0:	8b f9                	mov    edi,ecx
   140528da2:	f6 c1 01             	test   cl,0x1
   140528da5:	74 21                	je     0x140528dc8
   140528da7:	b9 02 00 00 00       	mov    ecx,0x2
   140528dac:	ff 15 86 0f 16 00    	call   QWORD PTR [rip+0x160f86]        # 0x140689d38
   140528db2:	48 8b c8             	mov    rcx,rax
   140528db5:	48 8d 15 3c 25 44 00 	lea    rdx,[rip+0x44253c]        # 0x14096b2f8
   140528dbc:	e8 6f 59 c0 ff       	call   0x14012e730
   140528dc1:	33 c0                	xor    eax,eax
   140528dc3:	e9 5d 01 00 00       	jmp    0x140528f25
   140528dc8:	d1 ff                	sar    edi,1
   140528dca:	4c 8d 4c 24 20       	lea    r9,[rsp+0x20]
   140528dcf:	8b cf                	mov    ecx,edi
   140528dd1:	48 89 b4 24 90 00 00 	mov    QWORD PTR [rsp+0x90],rsi
   140528dd8:	00 
   140528dd9:	45 33 c0             	xor    r8d,r8d
   140528ddc:	e8 1f 7b 0e 00       	call   0x140610900
   140528de1:	8d 04 7f             	lea    eax,[rdi+rdi*2]
   140528de4:	33 f6                	xor    esi,esi
   140528de6:	99                   	cdq
   140528de7:	2b c2                	sub    eax,edx
   140528de9:	48 8b 54 24 20       	mov    rdx,QWORD PTR [rsp+0x20]
   140528dee:	d1 f8                	sar    eax,1
   140528df0:	48 83 c2 18          	add    rdx,0x18
   140528df4:	48 63 c8             	movsxd rcx,eax
   140528df7:	48 c1 e1 04          	shl    rcx,0x4
   140528dfb:	48 03 d1             	add    rdx,rcx
   140528dfe:	4d 85 f6             	test   r14,r14
   140528e01:	75 0e                	jne    0x140528e11
   140528e03:	48 8b ca             	mov    rcx,rdx
   140528e06:	ff 15 f4 0b 16 00    	call   QWORD PTR [rip+0x160bf4]        # 0x140689a00
   140528e0c:	48 8b d8             	mov    rbx,rax
   140528e0f:	eb 0d                	jmp    0x140528e1e
   140528e11:	49 8b 06             	mov    rax,QWORD PTR [r14]
   140528e14:	48 3b c2             	cmp    rax,rdx
   140528e17:	49 89 16             	mov    QWORD PTR [r14],rdx
   140528e1a:	48 0f 42 de          	cmovb  rbx,rsi
   140528e1e:	48 85 db             	test   rbx,rbx
   140528e21:	75 07                	jne    0x140528e2a
   140528e23:	33 c0                	xor    eax,eax
   140528e25:	e9 f3 00 00 00       	jmp    0x140528f1d
   140528e2a:	4c 8d 43 18          	lea    r8,[rbx+0x18]
   140528e2e:	48 63 c7             	movsxd rax,edi
   140528e31:	4c 89 03             	mov    QWORD PTR [rbx],r8
   140528e34:	4c 8d 4c 24 20       	lea    r9,[rsp+0x20]
   140528e39:	48 8b 4c 24 20       	mov    rcx,QWORD PTR [rsp+0x20]
   140528e3e:	8b d5                	mov    edx,ebp
   140528e40:	49 03 c8             	add    rcx,r8
   140528e43:	48 c1 e0 04          	shl    rax,0x4
   140528e47:	48 03 c1             	add    rax,rcx
   140528e4a:	48 89 4b 08          	mov    QWORD PTR [rbx+0x8],rcx
   140528e4e:	8b cf                	mov    ecx,edi
   140528e50:	48 89 43 10          	mov    QWORD PTR [rbx+0x10],rax
   140528e54:	e8 a7 7a 0e 00       	call   0x140610900
   140528e59:	8b c7                	mov    eax,edi
   140528e5b:	99                   	cdq
   140528e5c:	2b c2                	sub    eax,edx
   140528e5e:	d1 f8                	sar    eax,1
   140528e60:	4c 63 f0             	movsxd r14,eax
   140528e63:	85 c0                	test   eax,eax
   140528e65:	0f 8e af 00 00 00    	jle    0x140528f1a
   140528e6b:	0f 29 74 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm6
   140528e70:	0f 29 7c 24 60       	movaps XMMWORD PTR [rsp+0x60],xmm7
   140528e75:	f2 0f 10 3d 83 74 32 	movsd  xmm7,QWORD PTR [rip+0x327483]        # 0x140850300
   140528e7c:	00 
   140528e7d:	44 0f 29 44 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm8
   140528e83:	44 0f 29 4c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm9
   140528e89:	f2 44 0f 10 0d 96 72 	movsd  xmm9,QWORD PTR [rip+0x327296]        # 0x140850128
   140528e90:	32 00 
   140528e92:	66 44 0f 6e c7       	movd   xmm8,edi
   140528e97:	bf 01 00 00 00       	mov    edi,0x1
   140528e9c:	44 0f 29 54 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm10
   140528ea2:	f2 44 0f 10 15 fd fe 	movsd  xmm10,QWORD PTR [rip+0x16fefd]        # 0x140698da8
   140528ea9:	16 00 
   140528eab:	f3 45 0f e6 c0       	cvtdq2pd xmm8,xmm8
   140528eb0:	66 0f 6e f7          	movd   xmm6,edi
   140528eb4:	f3 0f e6 f6          	cvtdq2pd xmm6,xmm6
   140528eb8:	f2 41 0f 5e f0       	divsd  xmm6,xmm8
   140528ebd:	f2 41 0f 58 f1       	addsd  xmm6,xmm9
   140528ec2:	f2 41 0f 59 f2       	mulsd  xmm6,xmm10
   140528ec7:	85 ed                	test   ebp,ebp
   140528ec9:	74 04                	je     0x140528ecf
   140528ecb:	f2 0f 59 f7          	mulsd  xmm6,xmm7
   140528ecf:	0f 28 c6             	movaps xmm0,xmm6
   140528ed2:	e8 fd 7e 0f 00       	call   0x140620dd4
   140528ed7:	48 8b 43 10          	mov    rax,QWORD PTR [rbx+0x10]
   140528edb:	f2 0f 11 04 06       	movsd  QWORD PTR [rsi+rax*1],xmm0
   140528ee0:	0f 28 c6             	movaps xmm0,xmm6
   140528ee3:	e8 9e 7e 0f 00       	call   0x140620d86
   140528ee8:	48 8b 43 10          	mov    rax,QWORD PTR [rbx+0x10]
   140528eec:	ff c7                	inc    edi
   140528eee:	f2 0f 11 44 30 08    	movsd  QWORD PTR [rax+rsi*1+0x8],xmm0
   140528ef4:	48 83 c6 10          	add    rsi,0x10
   140528ef8:	49 83 ee 01          	sub    r14,0x1
   140528efc:	75 b2                	jne    0x140528eb0
   140528efe:	44 0f 28 54 24 30    	movaps xmm10,XMMWORD PTR [rsp+0x30]
   140528f04:	44 0f 28 4c 24 40    	movaps xmm9,XMMWORD PTR [rsp+0x40]
   140528f0a:	44 0f 28 44 24 50    	movaps xmm8,XMMWORD PTR [rsp+0x50]
   140528f10:	0f 28 7c 24 60       	movaps xmm7,XMMWORD PTR [rsp+0x60]
   140528f15:	0f 28 74 24 70       	movaps xmm6,XMMWORD PTR [rsp+0x70]
   140528f1a:	48 8b c3             	mov    rax,rbx
   140528f1d:	48 8b b4 24 90 00 00 	mov    rsi,QWORD PTR [rsp+0x90]
   140528f24:	00 
   140528f25:	4c 8d 9c 24 80 00 00 	lea    r11,[rsp+0x80]
   140528f2c:	00 
   140528f2d:	49 8b 5b 18          	mov    rbx,QWORD PTR [r11+0x18]
   140528f31:	49 8b 6b 20          	mov    rbp,QWORD PTR [r11+0x20]
   140528f35:	49 8b 7b 28          	mov    rdi,QWORD PTR [r11+0x28]
   140528f39:	49 8b e3             	mov    rsp,r11
   140528f3c:	41 5e                	pop    r14
   140528f3e:	c3                   	ret
   140528f3f:	cc                   	int3
   140528f40:	cc                   	int3
   140528f41:	cc                   	int3
   140528f42:	cc                   	int3
   140528f43:	cc                   	int3
   140528f44:	cc                   	int3
   140528f45:	cc                   	int3
   140528f46:	cc                   	int3
   140528f47:	cc                   	int3
   140528f48:	cc                   	int3
   140528f49:	cc                   	int3
   140528f4a:	cc                   	int3
   140528f4b:	cc                   	int3
   140528f4c:	cc                   	int3
   140528f4d:	cc                   	int3
   140528f4e:	cc                   	int3
   140528f4f:	cc                   	int3
   140528f50:	40 53                	rex push rbx
   140528f52:	56                   	push   rsi
   140528f53:	57                   	push   rdi
   140528f54:	48 81 ec 90 00 00 00 	sub    rsp,0x90
   140528f5b:	48 8b f1             	mov    rsi,rcx
   140528f5e:	49 8b f8             	mov    rdi,r8
   140528f61:	48 8b 09             	mov    rcx,QWORD PTR [rcx]
   140528f64:	83 79 04 00          	cmp    DWORD PTR [rcx+0x4],0x0
   140528f68:	74 26                	je     0x140528f90
   140528f6a:	b9 02 00 00 00       	mov    ecx,0x2
   140528f6f:	ff 15 c3 0d 16 00    	call   QWORD PTR [rip+0x160dc3]        # 0x140689d38
   140528f75:	48 8b c8             	mov    rcx,rax
   140528f78:	48 8d 15 a1 23 44 00 	lea    rdx,[rip+0x4423a1]        # 0x14096b320
   140528f7f:	e8 ac 57 c0 ff       	call   0x14012e730
   140528f84:	b9 01 00 00 00       	mov    ecx,0x1
   140528f89:	ff 15 49 0c 16 00    	call   QWORD PTR [rip+0x160c49]        # 0x140689bd8
   140528f8f:	cc                   	int3
   140528f90:	4c 8b 46 08          	mov    r8,QWORD PTR [rsi+0x8]
   140528f94:	48 63 19             	movsxd rbx,DWORD PTR [rcx]
   140528f97:	0f 29 74 24 60       	movaps XMMWORD PTR [rsp+0x60],xmm6
   140528f9c:	0f 29 7c 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm7
   140528fa1:	44 0f 29 44 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm8
   140528fa7:	44 0f 29 4c 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm9
   140528fad:	e8 de 7a 0e 00       	call   0x140610a90
   140528fb2:	48 8b 46 08          	mov    rax,QWORD PTR [rsi+0x8]
   140528fb6:	48 8b cb             	mov    rcx,rbx
   140528fb9:	f2 44 0f 10 0d fe 77 	movsd  xmm9,QWORD PTR [rip+0x3277fe]        # 0x1408507c0
   140528fc0:	32 00 
   140528fc2:	48 03 c9             	add    rcx,rcx
   140528fc5:	f2 44 0f 10 05 5a 71 	movsd  xmm8,QWORD PTR [rip+0x32715a]        # 0x140850128
   140528fcc:	32 00 
   140528fce:	4c 8b d3             	mov    r10,rbx
   140528fd1:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx
   140528fd6:	f2 0f 10 48 08       	movsd  xmm1,QWORD PTR [rax+0x8]
   140528fdb:	f2 0f 10 10          	movsd  xmm2,QWORD PTR [rax]
   140528fdf:	0f 28 c1             	movaps xmm0,xmm1
   140528fe2:	33 c0                	xor    eax,eax
   140528fe4:	f2 0f 58 c2          	addsd  xmm0,xmm2
   140528fe8:	f2 0f 5c d1          	subsd  xmm2,xmm1
   140528fec:	f2 0f 11 07          	movsd  QWORD PTR [rdi],xmm0
   140528ff0:	f2 0f 11 14 cf       	movsd  QWORD PTR [rdi+rcx*8],xmm2
   140528ff5:	48 89 47 08          	mov    QWORD PTR [rdi+0x8],rax
   140528ff9:	48 89 44 cf 08       	mov    QWORD PTR [rdi+rcx*8+0x8],rax
   140528ffe:	8b c3                	mov    eax,ebx
   140529000:	99                   	cdq
   140529001:	bb 01 00 00 00       	mov    ebx,0x1
   140529006:	2b c2                	sub    eax,edx
   140529008:	d1 f8                	sar    eax,1
   14052900a:	4c 63 d8             	movsxd r11,eax
   14052900d:	4c 89 5c 24 28       	mov    QWORD PTR [rsp+0x28],r11
   140529012:	49 83 fb 04          	cmp    r11,0x4
   140529016:	0f 8c 6c 03 00 00    	jl     0x140529388
   14052901c:	48 89 ac 24 b8 00 00 	mov    QWORD PTR [rsp+0xb8],rbp
   140529023:	00 
   140529024:	48 c7 c0 f0 ff ff ff 	mov    rax,0xfffffffffffffff0
   14052902b:	4c 89 a4 24 88 00 00 	mov    QWORD PTR [rsp+0x88],r12
   140529032:	00 
   140529033:	49 8d 6a fe          	lea    rbp,[r10-0x2]
   140529037:	4c 89 ac 24 80 00 00 	mov    QWORD PTR [rsp+0x80],r13
   14052903e:	00 
   14052903f:	48 2b c7             	sub    rax,rdi
   140529042:	4c 89 74 24 78       	mov    QWORD PTR [rsp+0x78],r14
   140529047:	41 bd 20 00 00 00    	mov    r13d,0x20
   14052904d:	48 89 84 24 b0 00 00 	mov    QWORD PTR [rsp+0xb0],rax
   140529054:	00 
   140529055:	4d 8b f3             	mov    r14,r11
   140529058:	4c 8b 94 24 b0 00 00 	mov    r10,QWORD PTR [rsp+0xb0]
   14052905f:	00 
   140529060:	48 c7 c0 e0 ff ff ff 	mov    rax,0xffffffffffffffe0
   140529067:	48 c1 e5 04          	shl    rbp,0x4
   14052906b:	48 2b c7             	sub    rax,rdi
   14052906e:	4c 89 7c 24 70       	mov    QWORD PTR [rsp+0x70],r15
   140529073:	48 03 ef             	add    rbp,rdi
   140529076:	44 8d 7b 0f          	lea    r15d,[rbx+0xf]
   14052907a:	4c 2b ef             	sub    r13,rdi
   14052907d:	45 8b e7             	mov    r12d,r15d
   140529080:	4c 8b d8             	mov    r11,rax
   140529083:	4c 2b e7             	sub    r12,rdi
   140529086:	49 c1 ee 02          	shr    r14,0x2
   14052908a:	4a 8d 1c b5 01 00 00 	lea    rbx,[r14*4+0x1]
   140529091:	00 
   140529092:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140529096:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14052909d:	00 00 00 
   1405290a0:	48 8b 46 08          	mov    rax,QWORD PTR [rsi+0x8]
   1405290a4:	4d 8d 04 2c          	lea    r8,[r12+rbp*1]
   1405290a8:	4c 8d 4f 10          	lea    r9,[rdi+0x10]
   1405290ac:	4d 03 cf             	add    r9,r15
   1405290af:	f2 41 0f 10 1c 07    	movsd  xmm3,QWORD PTR [r15+rax*1]
   1405290b5:	f2 41 0f 10 64 07 08 	movsd  xmm4,QWORD PTR [r15+rax*1+0x8]
   1405290bc:	0f 28 fb             	movaps xmm7,xmm3
   1405290bf:	f2 42 0f 58 3c 00    	addsd  xmm7,QWORD PTR [rax+r8*1]
   1405290c5:	f2 42 0f 5c 1c 00    	subsd  xmm3,QWORD PTR [rax+r8*1]
   1405290cb:	f2 42 0f 10 4c 00 08 	movsd  xmm1,QWORD PTR [rax+r8*1+0x8]
   1405290d2:	4b 8d 14 21          	lea    rdx,[r9+r12*1]
   1405290d6:	48 8b 46 10          	mov    rax,QWORD PTR [rsi+0x10]
   1405290da:	41 0f 57 c9          	xorps  xmm1,xmm9
   1405290de:	0f 28 f4             	movaps xmm6,xmm4
   1405290e1:	f2 0f 5c e1          	subsd  xmm4,xmm1
   1405290e5:	f2 0f 58 f1          	addsd  xmm6,xmm1
   1405290e9:	f2 41 0f 10 6c 07 f8 	movsd  xmm5,QWORD PTR [r15+rax*1-0x8]
   1405290f0:	f2 41 0f 10 4c 07 f0 	movsd  xmm1,QWORD PTR [r15+rax*1-0x10]
   1405290f7:	0f 28 c5             	movaps xmm0,xmm5
   1405290fa:	0f 28 d1             	movaps xmm2,xmm1
   1405290fd:	f2 0f 59 c4          	mulsd  xmm0,xmm4
   140529101:	f2 0f 59 cc          	mulsd  xmm1,xmm4
   140529105:	f2 0f 59 eb          	mulsd  xmm5,xmm3
   140529109:	f2 0f 59 d3          	mulsd  xmm2,xmm3
   14052910d:	f2 0f 58 e9          	addsd  xmm5,xmm1
   140529111:	f2 0f 5c d0          	subsd  xmm2,xmm0
   140529115:	0f 28 cd             	movaps xmm1,xmm5
   140529118:	f2 0f 5c ee          	subsd  xmm5,xmm6
   14052911c:	f2 0f 58 ce          	addsd  xmm1,xmm6
   140529120:	0f 28 c2             	movaps xmm0,xmm2
   140529123:	f2 0f 58 c7          	addsd  xmm0,xmm7
   140529127:	f2 0f 5c fa          	subsd  xmm7,xmm2
   14052912b:	f2 41 0f 59 e8       	mulsd  xmm5,xmm8
   140529130:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   140529135:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14052913a:	f2 41 0f 59 f8       	mulsd  xmm7,xmm8
   14052913f:	f2 41 0f 11 49 f8    	movsd  QWORD PTR [r9-0x8],xmm1
   140529145:	f2 41 0f 11 41 f0    	movsd  QWORD PTR [r9-0x10],xmm0
   14052914b:	f2 0f 11 6d 18       	movsd  QWORD PTR [rbp+0x18],xmm5
   140529150:	f2 0f 11 7d 10       	movsd  QWORD PTR [rbp+0x10],xmm7
   140529155:	48 8b 46 08          	mov    rax,QWORD PTR [rsi+0x8]
   140529159:	f2 42 0f 10 4c 00 f8 	movsd  xmm1,QWORD PTR [rax+r8*1-0x8]
   140529160:	f2 41 0f 10 64 07 18 	movsd  xmm4,QWORD PTR [r15+rax*1+0x18]
   140529167:	41 0f 57 c9          	xorps  xmm1,xmm9
   14052916b:	f2 41 0f 10 5c 07 10 	movsd  xmm3,QWORD PTR [r15+rax*1+0x10]
   140529172:	0f 28 f1             	movaps xmm6,xmm1
   140529175:	f2 42 0f 10 7c 00 f0 	movsd  xmm7,QWORD PTR [rax+r8*1-0x10]
   14052917c:	f2 0f 58 f4          	addsd  xmm6,xmm4
   140529180:	f2 0f 5c e1          	subsd  xmm4,xmm1
   140529184:	f2 0f 58 fb          	addsd  xmm7,xmm3
   140529188:	f2 42 0f 5c 5c 00 f0 	subsd  xmm3,QWORD PTR [rax+r8*1-0x10]
   14052918f:	48 8b 46 10          	mov    rax,QWORD PTR [rsi+0x10]
   140529193:	f2 41 0f 10 0c 07    	movsd  xmm1,QWORD PTR [r15+rax*1]
   140529199:	f2 41 0f 10 6c 07 08 	movsd  xmm5,QWORD PTR [r15+rax*1+0x8]
   1405291a0:	0f 28 d1             	movaps xmm2,xmm1
   1405291a3:	0f 28 c5             	movaps xmm0,xmm5
   1405291a6:	f2 0f 59 cc          	mulsd  xmm1,xmm4
   1405291aa:	f2 0f 59 c4          	mulsd  xmm0,xmm4
   1405291ae:	f2 0f 59 eb          	mulsd  xmm5,xmm3
   1405291b2:	f2 0f 59 d3          	mulsd  xmm2,xmm3
   1405291b6:	f2 0f 58 e9          	addsd  xmm5,xmm1
   1405291ba:	0f 28 ce             	movaps xmm1,xmm6
   1405291bd:	f2 0f 5c d0          	subsd  xmm2,xmm0
   1405291c1:	f2 0f 58 cd          	addsd  xmm1,xmm5
   1405291c5:	f2 0f 5c ee          	subsd  xmm5,xmm6
   1405291c9:	0f 28 c2             	movaps xmm0,xmm2
   1405291cc:	f2 0f 58 c7          	addsd  xmm0,xmm7
   1405291d0:	f2 0f 5c fa          	subsd  xmm7,xmm2
   1405291d4:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   1405291d9:	f2 41 0f 59 e8       	mulsd  xmm5,xmm8
   1405291de:	f2 41 0f 59 f8       	mulsd  xmm7,xmm8
   1405291e3:	f2 41 0f 11 49 08    	movsd  QWORD PTR [r9+0x8],xmm1
   1405291e9:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   1405291ee:	f2 41 0f 11 01       	movsd  QWORD PTR [r9],xmm0
   1405291f3:	f2 0f 11 7d 00       	movsd  QWORD PTR [rbp+0x0],xmm7
   1405291f8:	f2 0f 11 6d 08       	movsd  QWORD PTR [rbp+0x8],xmm5
   1405291fd:	48 8b 4e 08          	mov    rcx,QWORD PTR [rsi+0x8]
   140529201:	f2 0f 10 3c 11       	movsd  xmm7,QWORD PTR [rcx+rdx*1]
   140529206:	4a 8d 04 11          	lea    rax,[rcx+r10*1]
   14052920a:	f2 0f 10 64 11 08    	movsd  xmm4,QWORD PTR [rcx+rdx*1+0x8]
   140529210:	f2 42 0f 10 4c 01 e8 	movsd  xmm1,QWORD PTR [rcx+r8*1-0x18]
   140529217:	f2 0f 10 34 28       	movsd  xmm6,QWORD PTR [rax+rbp*1]
   14052921c:	41 0f 57 c9          	xorps  xmm1,xmm9
   140529220:	f2 0f 58 f7          	addsd  xmm6,xmm7
   140529224:	0f 28 e9             	movaps xmm5,xmm1
   140529227:	f2 0f 5c 3c 28       	subsd  xmm7,QWORD PTR [rax+rbp*1]
   14052922c:	48 8b 46 10          	mov    rax,QWORD PTR [rsi+0x10]
   140529230:	f2 0f 58 ec          	addsd  xmm5,xmm4
   140529234:	f2 0f 5c e1          	subsd  xmm4,xmm1
   140529238:	0f 28 df             	movaps xmm3,xmm7
   14052923b:	f2 41 0f 59 7c 07 18 	mulsd  xmm7,QWORD PTR [r15+rax*1+0x18]
   140529242:	f2 41 0f 59 5c 07 10 	mulsd  xmm3,QWORD PTR [r15+rax*1+0x10]
   140529249:	0f 28 c4             	movaps xmm0,xmm4
   14052924c:	f2 41 0f 59 44 07 18 	mulsd  xmm0,QWORD PTR [r15+rax*1+0x18]
   140529253:	f2 41 0f 59 64 07 10 	mulsd  xmm4,QWORD PTR [r15+rax*1+0x10]
   14052925a:	f2 0f 5c d8          	subsd  xmm3,xmm0
   14052925e:	f2 0f 58 fc          	addsd  xmm7,xmm4
   140529262:	0f 28 c3             	movaps xmm0,xmm3
   140529265:	f2 0f 58 c6          	addsd  xmm0,xmm6
   140529269:	0f 28 cf             	movaps xmm1,xmm7
   14052926c:	f2 0f 5c f3          	subsd  xmm6,xmm3
   140529270:	f2 0f 5c fd          	subsd  xmm7,xmm5
   140529274:	f2 0f 58 cd          	addsd  xmm1,xmm5
   140529278:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14052927d:	f2 41 0f 59 f8       	mulsd  xmm7,xmm8
   140529282:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   140529287:	f2 41 0f 11 41 10    	movsd  QWORD PTR [r9+0x10],xmm0
   14052928d:	f2 41 0f 59 f0       	mulsd  xmm6,xmm8
   140529292:	f2 41 0f 11 49 18    	movsd  QWORD PTR [r9+0x18],xmm1
   140529298:	f2 0f 11 7d f8       	movsd  QWORD PTR [rbp-0x8],xmm7
   14052929d:	f2 0f 11 75 f0       	movsd  QWORD PTR [rbp-0x10],xmm6
   1405292a2:	48 8b 4e 08          	mov    rcx,QWORD PTR [rsi+0x8]
   1405292a6:	f2 42 0f 10 4c 01 d8 	movsd  xmm1,QWORD PTR [rcx+r8*1-0x28]
   1405292ad:	4a 8d 04 09          	lea    rax,[rcx+r9*1]
   1405292b1:	f2 42 0f 10 24 28    	movsd  xmm4,QWORD PTR [rax+r13*1]
   1405292b7:	41 0f 57 c9          	xorps  xmm1,xmm9
   1405292bb:	f2 42 0f 10 7c 28 08 	movsd  xmm7,QWORD PTR [rax+r13*1+0x8]
   1405292c2:	0f 28 e9             	movaps xmm5,xmm1
   1405292c5:	f2 0f 58 ef          	addsd  xmm5,xmm7
   1405292c9:	f2 0f 5c f9          	subsd  xmm7,xmm1
   1405292cd:	4a 8d 04 19          	lea    rax,[rcx+r11*1]
   1405292d1:	f2 0f 10 34 28       	movsd  xmm6,QWORD PTR [rax+rbp*1]
   1405292d6:	f2 0f 58 f4          	addsd  xmm6,xmm4
   1405292da:	f2 0f 5c 24 28       	subsd  xmm4,QWORD PTR [rax+rbp*1]
   1405292df:	48 8b 46 10          	mov    rax,QWORD PTR [rsi+0x10]
   1405292e3:	f2 41 0f 10 54 07 28 	movsd  xmm2,QWORD PTR [r15+rax*1+0x28]
   1405292ea:	0f 28 dc             	movaps xmm3,xmm4
   1405292ed:	f2 0f 59 1c 10       	mulsd  xmm3,QWORD PTR [rax+rdx*1]
   1405292f2:	0f 28 c2             	movaps xmm0,xmm2
   1405292f5:	49 83 c7 40          	add    r15,0x40
   1405292f9:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   1405292fd:	f2 0f 59 3c 10       	mulsd  xmm7,QWORD PTR [rax+rdx*1]
   140529302:	f2 0f 59 d4          	mulsd  xmm2,xmm4
   140529306:	f2 0f 5c d8          	subsd  xmm3,xmm0
   14052930a:	f2 0f 58 fa          	addsd  xmm7,xmm2
   14052930e:	0f 28 c3             	movaps xmm0,xmm3
   140529311:	f2 0f 58 c6          	addsd  xmm0,xmm6
   140529315:	f2 0f 5c f3          	subsd  xmm6,xmm3
   140529319:	0f 28 cf             	movaps xmm1,xmm7
   14052931c:	f2 0f 5c fd          	subsd  xmm7,xmm5
   140529320:	f2 0f 58 cd          	addsd  xmm1,xmm5
   140529324:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   140529329:	f2 41 0f 59 f0       	mulsd  xmm6,xmm8
   14052932e:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   140529333:	f2 41 0f 11 41 20    	movsd  QWORD PTR [r9+0x20],xmm0
   140529339:	f2 41 0f 59 f8       	mulsd  xmm7,xmm8
   14052933e:	f2 41 0f 11 49 28    	movsd  QWORD PTR [r9+0x28],xmm1
   140529344:	f2 0f 11 75 e0       	movsd  QWORD PTR [rbp-0x20],xmm6
   140529349:	f2 0f 11 7d e8       	movsd  QWORD PTR [rbp-0x18],xmm7
   14052934e:	48 83 ed 40          	sub    rbp,0x40
   140529352:	49 83 ee 01          	sub    r14,0x1
   140529356:	0f 85 44 fd ff ff    	jne    0x1405290a0
   14052935c:	4c 8b 54 24 20       	mov    r10,QWORD PTR [rsp+0x20]
   140529361:	4c 8b 5c 24 28       	mov    r11,QWORD PTR [rsp+0x28]
   140529366:	4c 8b 7c 24 70       	mov    r15,QWORD PTR [rsp+0x70]
   14052936b:	4c 8b 74 24 78       	mov    r14,QWORD PTR [rsp+0x78]
   140529370:	4c 8b ac 24 80 00 00 	mov    r13,QWORD PTR [rsp+0x80]
   140529377:	00 
   140529378:	4c 8b a4 24 88 00 00 	mov    r12,QWORD PTR [rsp+0x88]
   14052937f:	00 
   140529380:	48 8b ac 24 b8 00 00 	mov    rbp,QWORD PTR [rsp+0xb8]
   140529387:	00 
   140529388:	49 3b db             	cmp    rbx,r11
   14052938b:	0f 8f c7 00 00 00    	jg     0x140529458
   140529391:	4c 2b d3             	sub    r10,rbx
   140529394:	48 8b cb             	mov    rcx,rbx
   140529397:	48 c1 e1 04          	shl    rcx,0x4
   14052939b:	4c 2b db             	sub    r11,rbx
   14052939e:	49 c1 e2 04          	shl    r10,0x4
   1405293a2:	49 ff c3             	inc    r11
   1405293a5:	48 8b 46 08          	mov    rax,QWORD PTR [rsi+0x8]
   1405293a9:	f2 0f 10 7c 01 08    	movsd  xmm7,QWORD PTR [rcx+rax*1+0x8]
   1405293af:	f2 41 0f 10 4c 02 08 	movsd  xmm1,QWORD PTR [r10+rax*1+0x8]
   1405293b6:	f2 0f 10 24 01       	movsd  xmm4,QWORD PTR [rcx+rax*1]
   1405293bb:	41 0f 57 c9          	xorps  xmm1,xmm9
   1405293bf:	f2 41 0f 10 34 02    	movsd  xmm6,QWORD PTR [r10+rax*1]
   1405293c5:	0f 28 e9             	movaps xmm5,xmm1
   1405293c8:	f2 0f 58 ef          	addsd  xmm5,xmm7
   1405293cc:	f2 0f 5c f9          	subsd  xmm7,xmm1
   1405293d0:	f2 0f 58 f4          	addsd  xmm6,xmm4
   1405293d4:	f2 41 0f 5c 24 02    	subsd  xmm4,QWORD PTR [r10+rax*1]
   1405293da:	48 8b 46 10          	mov    rax,QWORD PTR [rsi+0x10]
   1405293de:	0f 28 c7             	movaps xmm0,xmm7
   1405293e1:	f2 0f 59 44 01 f8    	mulsd  xmm0,QWORD PTR [rcx+rax*1-0x8]
   1405293e7:	0f 28 dc             	movaps xmm3,xmm4
   1405293ea:	f2 0f 59 7c 01 f0    	mulsd  xmm7,QWORD PTR [rcx+rax*1-0x10]
   1405293f0:	f2 0f 59 5c 01 f0    	mulsd  xmm3,QWORD PTR [rcx+rax*1-0x10]
   1405293f6:	f2 0f 59 64 01 f8    	mulsd  xmm4,QWORD PTR [rcx+rax*1-0x8]
   1405293fc:	f2 0f 5c d8          	subsd  xmm3,xmm0
   140529400:	f2 0f 58 fc          	addsd  xmm7,xmm4
   140529404:	0f 28 c3             	movaps xmm0,xmm3
   140529407:	f2 0f 58 c6          	addsd  xmm0,xmm6
   14052940b:	0f 28 cf             	movaps xmm1,xmm7
   14052940e:	f2 0f 5c f3          	subsd  xmm6,xmm3
   140529412:	f2 0f 58 cd          	addsd  xmm1,xmm5
   140529416:	f2 0f 5c fd          	subsd  xmm7,xmm5
   14052941a:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14052941f:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   140529424:	f2 41 0f 59 f0       	mulsd  xmm6,xmm8
   140529429:	f2 0f 11 04 39       	movsd  QWORD PTR [rcx+rdi*1],xmm0
   14052942e:	f2 0f 11 4c 39 08    	movsd  QWORD PTR [rcx+rdi*1+0x8],xmm1
   140529434:	48 83 c1 10          	add    rcx,0x10
   140529438:	f2 41 0f 59 f8       	mulsd  xmm7,xmm8
   14052943d:	f2 41 0f 11 34 3a    	movsd  QWORD PTR [r10+rdi*1],xmm6
   140529443:	f2 41 0f 11 7c 3a 08 	movsd  QWORD PTR [r10+rdi*1+0x8],xmm7
   14052944a:	49 83 ea 10          	sub    r10,0x10
   14052944e:	49 83 eb 01          	sub    r11,0x1
   140529452:	0f 85 4d ff ff ff    	jne    0x1405293a5
   140529458:	44 0f 28 44 24 40    	movaps xmm8,XMMWORD PTR [rsp+0x40]
   14052945e:	0f 28 7c 24 50       	movaps xmm7,XMMWORD PTR [rsp+0x50]
   140529463:	0f 28 74 24 60       	movaps xmm6,XMMWORD PTR [rsp+0x60]
   140529468:	44 0f 28 4c 24 30    	movaps xmm9,XMMWORD PTR [rsp+0x30]
   14052946e:	48 81 c4 90 00 00 00 	add    rsp,0x90
   140529475:	5f                   	pop    rdi
   140529476:	5e                   	pop    rsi
   140529477:	5b                   	pop    rbx
   140529478:	c3                   	ret
   140529479:	cc                   	int3
   14052947a:	cc                   	int3
   14052947b:	cc                   	int3
   14052947c:	cc                   	int3
   14052947d:	cc                   	int3
   14052947e:	cc                   	int3
   14052947f:	cc                   	int3
