
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140382c80 <.text+0x381c80>:
   140382c80:	40 55                	rex push rbp
   140382c82:	57                   	push   rdi
   140382c83:	41 54                	push   r12
   140382c85:	41 55                	push   r13
   140382c87:	48 8d ac 24 f8 f3 ff 	lea    rbp,[rsp-0xc08]
   140382c8e:	ff 
   140382c8f:	48 81 ec 08 0d 00 00 	sub    rsp,0xd08
   140382c96:	48 8b 05 cb f4 5e 00 	mov    rax,QWORD PTR [rip+0x5ef4cb]        # 0x140972168
   140382c9d:	48 33 c4             	xor    rax,rsp
   140382ca0:	48 89 85 40 0b 00 00 	mov    QWORD PTR [rbp+0xb40],rax
   140382ca7:	45 8b e0             	mov    r12d,r8d
   140382caa:	44 8b ea             	mov    r13d,edx
   140382cad:	48 8b f9             	mov    rdi,rcx
   140382cb0:	45 85 c0             	test   r8d,r8d
   140382cb3:	79 10                	jns    0x140382cc5
   140382cb5:	44 8b 25 f4 74 60 00 	mov    r12d,DWORD PTR [rip+0x6074f4]        # 0x14098a1b0
   140382cbc:	45 85 e4             	test   r12d,r12d
   140382cbf:	0f 88 a4 0e 00 00    	js     0x140383b69
   140382cc5:	66 83 b9 1c 02 00 00 	cmp    WORD PTR [rcx+0x21c],0x0
   140382ccc:	00 
   140382ccd:	4c 89 b4 24 f8 0c 00 	mov    QWORD PTR [rsp+0xcf8],r14
   140382cd4:	00 
   140382cd5:	7d 4a                	jge    0x140382d21
   140382cd7:	48 c7 41 28 ff ff 00 	mov    QWORD PTR [rcx+0x28],0xffff
   140382cde:	00 
   140382cdf:	48 c7 41 30 ff ff 00 	mov    QWORD PTR [rcx+0x30],0xffff
   140382ce6:	00 
   140382ce7:	48 c7 41 38 ff ff 00 	mov    QWORD PTR [rcx+0x38],0xffff
   140382cee:	00 
   140382cef:	48 c7 41 40 ff ff 00 	mov    QWORD PTR [rcx+0x40],0xffff
   140382cf6:	00 
   140382cf7:	48 c7 41 48 ff ff 00 	mov    QWORD PTR [rcx+0x48],0xffff
   140382cfe:	00 
   140382cff:	48 c7 41 50 ff ff 00 	mov    QWORD PTR [rcx+0x50],0xffff
   140382d06:	00 
   140382d07:	48 c7 41 58 ff ff 00 	mov    QWORD PTR [rcx+0x58],0xffff
   140382d0e:	00 
   140382d0f:	c7 41 24 00 00 80 3f 	mov    DWORD PTR [rcx+0x24],0x3f800000
   140382d16:	66 c7 41 22 05 00    	mov    WORD PTR [rcx+0x22],0x5
   140382d1c:	e9 40 0e 00 00       	jmp    0x140383b61
   140382d21:	f3 0f 10 05 b7 3b 32 	movss  xmm0,DWORD PTR [rip+0x323bb7]        # 0x1406a68e0
   140382d28:	00 
   140382d29:	45 33 f6             	xor    r14d,r14d
   140382d2c:	48 89 9c 24 38 0d 00 	mov    QWORD PTR [rsp+0xd38],rbx
   140382d33:	00 
   140382d34:	48 89 b4 24 00 0d 00 	mov    QWORD PTR [rsp+0xd00],rsi
   140382d3b:	00 
   140382d3c:	4c 89 bc 24 f0 0c 00 	mov    QWORD PTR [rsp+0xcf0],r15
   140382d43:	00 
   140382d44:	0f 29 b4 24 e0 0c 00 	movaps XMMWORD PTR [rsp+0xce0],xmm6
   140382d4b:	00 
   140382d4c:	66 44 89 71 20       	mov    WORD PTR [rcx+0x20],r14w
   140382d51:	48 8d 0d c8 09 64 00 	lea    rcx,[rip+0x6409c8]        # 0x1409c3720
   140382d58:	49 63 c4             	movsxd rax,r12d
   140382d5b:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140382d62:	0f 29 bc 24 d0 0c 00 	movaps XMMWORD PTR [rsp+0xcd0],xmm7
   140382d69:	00 
   140382d6a:	44 0f 29 84 24 c0 0c 	movaps XMMWORD PTR [rsp+0xcc0],xmm8
   140382d71:	00 00 
   140382d73:	44 0f 29 8c 24 b0 0c 	movaps XMMWORD PTR [rsp+0xcb0],xmm9
   140382d7a:	00 00 
   140382d7c:	44 0f 29 94 24 a0 0c 	movaps XMMWORD PTR [rsp+0xca0],xmm10
   140382d83:	00 00 
   140382d85:	48 89 44 24 70       	mov    QWORD PTR [rsp+0x70],rax
   140382d8a:	f3 0f 5e 04 08       	divss  xmm0,DWORD PTR [rax+rcx*1]
   140382d8f:	f3 0f 58 05 45 d2 4c 	addss  xmm0,DWORD PTR [rip+0x4cd245]        # 0x14084ffdc
   140382d96:	00 
   140382d97:	f3 44 0f 2c f8       	cvttss2si r15d,xmm0
   140382d9c:	44 89 7c 24 60       	mov    DWORD PTR [rsp+0x60],r15d
   140382da1:	41 83 ff 01          	cmp    r15d,0x1
   140382da5:	7e 06                	jle    0x140382dad
   140382da7:	41 83 ff 02          	cmp    r15d,0x2
   140382dab:	7f 0b                	jg     0x140382db8
   140382dad:	41 bf 02 00 00 00    	mov    r15d,0x2
   140382db3:	44 89 7c 24 60       	mov    DWORD PTR [rsp+0x60],r15d
   140382db8:	33 d2                	xor    edx,edx
   140382dba:	48 8d 8d c0 02 00 00 	lea    rcx,[rbp+0x2c0]
   140382dc1:	41 b8 00 02 00 00    	mov    r8d,0x200
   140382dc7:	e8 1e df 29 00       	call   0x140620cea
   140382dcc:	33 d2                	xor    edx,edx
   140382dce:	48 8d 8d c0 04 00 00 	lea    rcx,[rbp+0x4c0]
   140382dd5:	41 b8 00 02 00 00    	mov    r8d,0x200
   140382ddb:	e8 0a df 29 00       	call   0x140620cea
   140382de0:	8b 1f                	mov    ebx,DWORD PTR [rdi]
   140382de2:	45 0f 57 c0          	xorps  xmm8,xmm8
   140382de6:	0f 57 f6             	xorps  xmm6,xmm6
   140382de9:	f2 44 0f 10 15 86 d3 	movsd  xmm10,QWORD PTR [rip+0x4cd386]        # 0x140850178
   140382df0:	4c 00 
   140382df2:	45 0f 57 c9          	xorps  xmm9,xmm9
   140382df6:	0f 57 ff             	xorps  xmm7,xmm7
   140382df9:	3b 5f 04             	cmp    ebx,DWORD PTR [rdi+0x4]
   140382dfc:	7d 68                	jge    0x140382e66
   140382dfe:	66 90                	xchg   ax,ax
   140382e00:	45 33 c9             	xor    r9d,r9d
   140382e03:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   140382e08:	8b d3                	mov    edx,ebx
   140382e0a:	44 89 74 24 20       	mov    DWORD PTR [rsp+0x20],r14d
   140382e0f:	48 8b cf             	mov    rcx,rdi
   140382e12:	45 8d 41 ff          	lea    r8d,[r9-0x1]
   140382e16:	e8 d5 79 fe ff       	call   0x14036a7f0
   140382e1b:	0f 57 c9             	xorps  xmm1,xmm1
   140382e1e:	f2 41 0f 58 fa       	addsd  xmm7,xmm10
   140382e23:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   140382e27:	ff c3                	inc    ebx
   140382e29:	f2 0f 58 f1          	addsd  xmm6,xmm1
   140382e2d:	f2 0f 59 c9          	mulsd  xmm1,xmm1
   140382e31:	f2 44 0f 58 c9       	addsd  xmm9,xmm1
   140382e36:	3b 5f 04             	cmp    ebx,DWORD PTR [rdi+0x4]
   140382e39:	7c c5                	jl     0x140382e00
   140382e3b:	66 41 0f 2e f8       	ucomisd xmm7,xmm8
   140382e40:	7a 02                	jp     0x140382e44
   140382e42:	74 22                	je     0x140382e66
   140382e44:	f2 0f 5e f7          	divsd  xmm6,xmm7
   140382e48:	f2 44 0f 5e cf       	divsd  xmm9,xmm7
   140382e4d:	0f 28 c6             	movaps xmm0,xmm6
   140382e50:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   140382e54:	f2 44 0f 5c c8       	subsd  xmm9,xmm0
   140382e59:	41 0f 28 c1          	movaps xmm0,xmm9
   140382e5d:	e8 5a df 29 00       	call   0x140620dbc
   140382e62:	44 0f 28 c8          	movaps xmm9,xmm0
   140382e66:	83 7c 24 60 01       	cmp    DWORD PTR [rsp+0x60],0x1
   140382e6b:	41 0f 28 c9          	movaps xmm1,xmm9
   140382e6f:	f2 0f 59 0d b1 d2 4c 	mulsd  xmm1,QWORD PTR [rip+0x4cd2b1]        # 0x140850128
   140382e76:	00 
   140382e77:	44 0f 28 c6          	movaps xmm8,xmm6
   140382e7b:	41 8b df             	mov    ebx,r15d
   140382e7e:	41 8b f6             	mov    esi,r14d
   140382e81:	f2 44 0f 59 0d 36 d0 	mulsd  xmm9,QWORD PTR [rip+0x32d036]        # 0x1406afec0
   140382e88:	32 00 
   140382e8a:	45 0f 57 d2          	xorps  xmm10,xmm10
   140382e8e:	41 bf 80 00 00 00    	mov    r15d,0x80
   140382e94:	0f 57 ff             	xorps  xmm7,xmm7
   140382e97:	f2 44 0f 5c c1       	subsd  xmm8,xmm1
   140382e9c:	f2 44 0f 58 ce       	addsd  xmm9,xmm6
   140382ea1:	0f 8c d0 06 00 00    	jl     0x140383577
   140382ea7:	f3 0f 10 35 41 d4 4c 	movss  xmm6,DWORD PTR [rip+0x4cd441]        # 0x1408502f0
   140382eae:	00 
   140382eaf:	90                   	nop
   140382eb0:	8b 0f                	mov    ecx,DWORD PTR [rdi]
   140382eb2:	8b 47 04             	mov    eax,DWORD PTR [rdi+0x4]
   140382eb5:	2b c3                	sub    eax,ebx
   140382eb7:	89 4c 24 64          	mov    DWORD PTR [rsp+0x64],ecx
   140382ebb:	3b c8                	cmp    ecx,eax
   140382ebd:	0f 8f a0 06 00 00    	jg     0x140383563
   140382ec3:	44 89 64 24 30       	mov    DWORD PTR [rsp+0x30],r12d
   140382ec8:	4c 8d 44 24 64       	lea    r8,[rsp+0x64]
   140382ecd:	f2 44 0f 11 4c 24 28 	movsd  QWORD PTR [rsp+0x28],xmm9
   140382ed4:	48 8d 4d 80          	lea    rcx,[rbp-0x80]
   140382ed8:	44 8b cb             	mov    r9d,ebx
   140382edb:	f2 44 0f 11 44 24 20 	movsd  QWORD PTR [rsp+0x20],xmm8
   140382ee2:	48 8b d7             	mov    rdx,rdi
   140382ee5:	e8 a6 de ff ff       	call   0x140380d90
   140382eea:	84 c0                	test   al,al
   140382eec:	0f 84 56 06 00 00    	je     0x140383548
   140382ef2:	85 f6                	test   esi,esi
   140382ef4:	74 3c                	je     0x140382f32
   140382ef6:	0f b6 4d 80          	movzx  ecx,BYTE PTR [rbp-0x80]
   140382efa:	41 0f 28 d2          	movaps xmm2,xmm10
   140382efe:	84 c9                	test   cl,cl
   140382f00:	74 1c                	je     0x140382f1e
   140382f02:	48 8d 45 84          	lea    rax,[rbp-0x7c]
   140382f06:	0f b6 c9             	movzx  ecx,cl
   140382f09:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140382f10:	f3 0f 58 10          	addss  xmm2,DWORD PTR [rax]
   140382f14:	48 83 c0 04          	add    rax,0x4
   140382f18:	48 83 e9 01          	sub    rcx,0x1
   140382f1c:	75 f2                	jne    0x140382f10
   140382f1e:	48 8d 95 20 01 00 00 	lea    rdx,[rbp+0x120]
   140382f25:	48 8d 4d 80          	lea    rcx,[rbp-0x80]
   140382f29:	e8 b2 94 ff ff       	call   0x14037c3e0
   140382f2e:	f3 0f 58 f8          	addss  xmm7,xmm0
   140382f32:	48 8d 8d 20 01 00 00 	lea    rcx,[rbp+0x120]
   140382f39:	ba 03 00 00 00       	mov    edx,0x3
   140382f3e:	48 8d 45 80          	lea    rax,[rbp-0x80]
   140382f42:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   140382f45:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   140382f49:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   140382f4c:	0f 10 40 20          	movups xmm0,XMMWORD PTR [rax+0x20]
   140382f50:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   140382f54:	0f 10 48 30          	movups xmm1,XMMWORD PTR [rax+0x30]
   140382f58:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   140382f5c:	0f 10 40 40          	movups xmm0,XMMWORD PTR [rax+0x40]
   140382f60:	0f 11 49 30          	movups XMMWORD PTR [rcx+0x30],xmm1
   140382f64:	0f 10 48 50          	movups xmm1,XMMWORD PTR [rax+0x50]
   140382f68:	0f 11 41 40          	movups XMMWORD PTR [rcx+0x40],xmm0
   140382f6c:	0f 10 40 60          	movups xmm0,XMMWORD PTR [rax+0x60]
   140382f70:	0f 11 49 50          	movups XMMWORD PTR [rcx+0x50],xmm1
   140382f74:	0f 10 48 70          	movups xmm1,XMMWORD PTR [rax+0x70]
   140382f78:	49 03 c7             	add    rax,r15
   140382f7b:	0f 11 41 60          	movups XMMWORD PTR [rcx+0x60],xmm0
   140382f7f:	49 03 cf             	add    rcx,r15
   140382f82:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   140382f86:	48 83 ea 01          	sub    rdx,0x1
   140382f8a:	75 b6                	jne    0x140382f42
   140382f8c:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   140382f8f:	8b 40 10             	mov    eax,DWORD PTR [rax+0x10]
   140382f92:	44 8d 42 ff          	lea    r8d,[rdx-0x1]
   140382f96:	44 89 64 24 50       	mov    DWORD PTR [rsp+0x50],r12d
   140382f9b:	4c 8d 8d c0 06 00 00 	lea    r9,[rbp+0x6c0]
   140382fa2:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   140382fa5:	89 41 10             	mov    DWORD PTR [rcx+0x10],eax
   140382fa8:	48 8d 54 24 68       	lea    rdx,[rsp+0x68]
   140382fad:	41 8b c5             	mov    eax,r13d
   140382fb0:	c7 44 24 68 ff ff ff 	mov    DWORD PTR [rsp+0x68],0xffffffff
   140382fb7:	ff 
   140382fb8:	c1 e8 1f             	shr    eax,0x1f
   140382fbb:	48 8d 4d 80          	lea    rcx,[rbp-0x80]
   140382fbf:	34 01                	xor    al,0x1
   140382fc1:	88 44 24 48          	mov    BYTE PTR [rsp+0x48],al
   140382fc5:	48 8d 85 c0 0a 00 00 	lea    rax,[rbp+0xac0]
   140382fcc:	44 89 6c 24 40       	mov    DWORD PTR [rsp+0x40],r13d
   140382fd1:	4c 89 74 24 38       	mov    QWORD PTR [rsp+0x38],r14
   140382fd6:	44 88 74 24 30       	mov    BYTE PTR [rsp+0x30],r14b
   140382fdb:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   140382fe0:	48 8d 85 c0 08 00 00 	lea    rax,[rbp+0x8c0]
   140382fe7:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140382fec:	e8 3f 8e ff ff       	call   0x14037be30
   140382ff1:	0f 28 ce             	movaps xmm1,xmm6
   140382ff4:	ba 02 00 00 00       	mov    edx,0x2
   140382ff9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140383000:	0f 2e ce             	ucomiss xmm1,xmm6
   140383003:	8d 42 fe             	lea    eax,[rdx-0x2]
   140383006:	8b c8                	mov    ecx,eax
   140383008:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   14038300f:	00 00 
   140383011:	0f 28 c2             	movaps xmm0,xmm2
   140383014:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   14038301b:	00 00 
   14038301d:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   140383024:	00 00 
   140383026:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   14038302d:	00 
   14038302e:	66 0f 6e c0          	movd   xmm0,eax
   140383032:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140383035:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   14038303c:	00 00 
   14038303e:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   140383045:	00 00 
   140383047:	7a 02                	jp     0x14038304b
   140383049:	74 05                	je     0x140383050
   14038304b:	0f 2f d1             	comiss xmm2,xmm1
   14038304e:	76 03                	jbe    0x140383053
   140383050:	0f 28 ca             	movaps xmm1,xmm2
   140383053:	0f 2e ce             	ucomiss xmm1,xmm6
   140383056:	8d 42 ff             	lea    eax,[rdx-0x1]
   140383059:	8b c8                	mov    ecx,eax
   14038305b:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   140383062:	00 00 
   140383064:	0f 28 c2             	movaps xmm0,xmm2
   140383067:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   14038306e:	00 00 
   140383070:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   140383077:	00 00 
   140383079:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   140383080:	00 
   140383081:	66 0f 6e c0          	movd   xmm0,eax
   140383085:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140383088:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   14038308f:	00 00 
   140383091:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   140383098:	00 00 
   14038309a:	7a 02                	jp     0x14038309e
   14038309c:	74 05                	je     0x1403830a3
   14038309e:	0f 2f d1             	comiss xmm2,xmm1
   1403830a1:	76 03                	jbe    0x1403830a6
   1403830a3:	0f 28 ca             	movaps xmm1,xmm2
   1403830a6:	0f 2e ce             	ucomiss xmm1,xmm6
   1403830a9:	8b ca                	mov    ecx,edx
   1403830ab:	0f b6 84 0d c0 0a 00 	movzx  eax,BYTE PTR [rbp+rcx*1+0xac0]
   1403830b2:	00 
   1403830b3:	f3 0f 10 94 8d c0 06 	movss  xmm2,DWORD PTR [rbp+rcx*4+0x6c0]
   1403830ba:	00 00 
   1403830bc:	0f 28 c2             	movaps xmm0,xmm2
   1403830bf:	f3 0f 58 84 8d c0 02 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x2c0]
   1403830c6:	00 00 
   1403830c8:	f3 0f 11 84 8d c0 02 	movss  DWORD PTR [rbp+rcx*4+0x2c0],xmm0
   1403830cf:	00 00 
   1403830d1:	66 0f 6e c0          	movd   xmm0,eax
   1403830d5:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403830d8:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   1403830df:	00 00 
   1403830e1:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   1403830e8:	00 00 
   1403830ea:	7a 02                	jp     0x1403830ee
   1403830ec:	74 05                	je     0x1403830f3
   1403830ee:	0f 2f d1             	comiss xmm2,xmm1
   1403830f1:	76 03                	jbe    0x1403830f6
   1403830f3:	0f 28 ca             	movaps xmm1,xmm2
   1403830f6:	0f 2e ce             	ucomiss xmm1,xmm6
   1403830f9:	8d 42 01             	lea    eax,[rdx+0x1]
   1403830fc:	8b c8                	mov    ecx,eax
   1403830fe:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   140383105:	00 00 
   140383107:	0f 28 c2             	movaps xmm0,xmm2
   14038310a:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   140383111:	00 00 
   140383113:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   14038311a:	00 00 
   14038311c:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   140383123:	00 
   140383124:	66 0f 6e c0          	movd   xmm0,eax
   140383128:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14038312b:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   140383132:	00 00 
   140383134:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   14038313b:	00 00 
   14038313d:	7a 02                	jp     0x140383141
   14038313f:	74 05                	je     0x140383146
   140383141:	0f 2f d1             	comiss xmm2,xmm1
   140383144:	76 03                	jbe    0x140383149
   140383146:	0f 28 ca             	movaps xmm1,xmm2
   140383149:	0f 2e ce             	ucomiss xmm1,xmm6
   14038314c:	8d 42 02             	lea    eax,[rdx+0x2]
   14038314f:	8b c8                	mov    ecx,eax
   140383151:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   140383158:	00 00 
   14038315a:	0f 28 c2             	movaps xmm0,xmm2
   14038315d:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   140383164:	00 00 
   140383166:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   14038316d:	00 00 
   14038316f:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   140383176:	00 
   140383177:	66 0f 6e c0          	movd   xmm0,eax
   14038317b:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14038317e:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   140383185:	00 00 
   140383187:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   14038318e:	00 00 
   140383190:	7a 02                	jp     0x140383194
   140383192:	74 05                	je     0x140383199
   140383194:	0f 2f d1             	comiss xmm2,xmm1
   140383197:	76 03                	jbe    0x14038319c
   140383199:	0f 28 ca             	movaps xmm1,xmm2
   14038319c:	0f 2e ce             	ucomiss xmm1,xmm6
   14038319f:	8d 42 03             	lea    eax,[rdx+0x3]
   1403831a2:	8b c8                	mov    ecx,eax
   1403831a4:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   1403831ab:	00 00 
   1403831ad:	0f 28 c2             	movaps xmm0,xmm2
   1403831b0:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   1403831b7:	00 00 
   1403831b9:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   1403831c0:	00 00 
   1403831c2:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   1403831c9:	00 
   1403831ca:	66 0f 6e c0          	movd   xmm0,eax
   1403831ce:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403831d1:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   1403831d8:	00 00 
   1403831da:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   1403831e1:	00 00 
   1403831e3:	7a 02                	jp     0x1403831e7
   1403831e5:	74 05                	je     0x1403831ec
   1403831e7:	0f 2f d1             	comiss xmm2,xmm1
   1403831ea:	76 03                	jbe    0x1403831ef
   1403831ec:	0f 28 ca             	movaps xmm1,xmm2
   1403831ef:	0f 2e ce             	ucomiss xmm1,xmm6
   1403831f2:	8d 42 04             	lea    eax,[rdx+0x4]
   1403831f5:	8b c8                	mov    ecx,eax
   1403831f7:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   1403831fe:	00 00 
   140383200:	0f 28 c2             	movaps xmm0,xmm2
   140383203:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   14038320a:	00 00 
   14038320c:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   140383213:	00 00 
   140383215:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   14038321c:	00 
   14038321d:	66 0f 6e c0          	movd   xmm0,eax
   140383221:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140383224:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   14038322b:	00 00 
   14038322d:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   140383234:	00 00 
   140383236:	7a 02                	jp     0x14038323a
   140383238:	74 05                	je     0x14038323f
   14038323a:	0f 2f d1             	comiss xmm2,xmm1
   14038323d:	76 03                	jbe    0x140383242
   14038323f:	0f 28 ca             	movaps xmm1,xmm2
   140383242:	0f 2e ce             	ucomiss xmm1,xmm6
   140383245:	8d 42 05             	lea    eax,[rdx+0x5]
   140383248:	8b c8                	mov    ecx,eax
   14038324a:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   140383251:	00 00 
   140383253:	0f 28 c2             	movaps xmm0,xmm2
   140383256:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   14038325d:	00 00 
   14038325f:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   140383266:	00 00 
   140383268:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   14038326f:	00 
   140383270:	66 0f 6e c0          	movd   xmm0,eax
   140383274:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140383277:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   14038327e:	00 00 
   140383280:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   140383287:	00 00 
   140383289:	7a 02                	jp     0x14038328d
   14038328b:	74 05                	je     0x140383292
   14038328d:	0f 2f d1             	comiss xmm2,xmm1
   140383290:	76 03                	jbe    0x140383295
   140383292:	0f 28 ca             	movaps xmm1,xmm2
   140383295:	0f 2e ce             	ucomiss xmm1,xmm6
   140383298:	8d 42 06             	lea    eax,[rdx+0x6]
   14038329b:	8b c8                	mov    ecx,eax
   14038329d:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   1403832a4:	00 00 
   1403832a6:	0f 28 c2             	movaps xmm0,xmm2
   1403832a9:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   1403832b0:	00 00 
   1403832b2:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   1403832b9:	00 00 
   1403832bb:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   1403832c2:	00 
   1403832c3:	66 0f 6e c0          	movd   xmm0,eax
   1403832c7:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403832ca:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   1403832d1:	00 00 
   1403832d3:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   1403832da:	00 00 
   1403832dc:	7a 02                	jp     0x1403832e0
   1403832de:	74 05                	je     0x1403832e5
   1403832e0:	0f 2f d1             	comiss xmm2,xmm1
   1403832e3:	76 03                	jbe    0x1403832e8
   1403832e5:	0f 28 ca             	movaps xmm1,xmm2
   1403832e8:	0f 2e ce             	ucomiss xmm1,xmm6
   1403832eb:	8d 42 07             	lea    eax,[rdx+0x7]
   1403832ee:	8b c8                	mov    ecx,eax
   1403832f0:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   1403832f7:	00 00 
   1403832f9:	0f 28 c2             	movaps xmm0,xmm2
   1403832fc:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   140383303:	00 00 
   140383305:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   14038330c:	00 00 
   14038330e:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   140383315:	00 
   140383316:	66 0f 6e c0          	movd   xmm0,eax
   14038331a:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14038331d:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   140383324:	00 00 
   140383326:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   14038332d:	00 00 
   14038332f:	7a 02                	jp     0x140383333
   140383331:	74 05                	je     0x140383338
   140383333:	0f 2f d1             	comiss xmm2,xmm1
   140383336:	76 03                	jbe    0x14038333b
   140383338:	0f 28 ca             	movaps xmm1,xmm2
   14038333b:	0f 2e ce             	ucomiss xmm1,xmm6
   14038333e:	8d 42 08             	lea    eax,[rdx+0x8]
   140383341:	8b c8                	mov    ecx,eax
   140383343:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   14038334a:	00 00 
   14038334c:	0f 28 c2             	movaps xmm0,xmm2
   14038334f:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   140383356:	00 00 
   140383358:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   14038335f:	00 00 
   140383361:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   140383368:	00 
   140383369:	66 0f 6e c0          	movd   xmm0,eax
   14038336d:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140383370:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   140383377:	00 00 
   140383379:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   140383380:	00 00 
   140383382:	7a 02                	jp     0x140383386
   140383384:	74 05                	je     0x14038338b
   140383386:	0f 2f d1             	comiss xmm2,xmm1
   140383389:	76 03                	jbe    0x14038338e
   14038338b:	0f 28 ca             	movaps xmm1,xmm2
   14038338e:	0f 2e ce             	ucomiss xmm1,xmm6
   140383391:	8d 42 09             	lea    eax,[rdx+0x9]
   140383394:	8b c8                	mov    ecx,eax
   140383396:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   14038339d:	00 00 
   14038339f:	0f 28 c2             	movaps xmm0,xmm2
   1403833a2:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   1403833a9:	00 00 
   1403833ab:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   1403833b2:	00 00 
   1403833b4:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   1403833bb:	00 
   1403833bc:	66 0f 6e c0          	movd   xmm0,eax
   1403833c0:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403833c3:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   1403833ca:	00 00 
   1403833cc:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   1403833d3:	00 00 
   1403833d5:	7a 02                	jp     0x1403833d9
   1403833d7:	74 05                	je     0x1403833de
   1403833d9:	0f 2f d1             	comiss xmm2,xmm1
   1403833dc:	76 03                	jbe    0x1403833e1
   1403833de:	0f 28 ca             	movaps xmm1,xmm2
   1403833e1:	0f 2e ce             	ucomiss xmm1,xmm6
   1403833e4:	8d 42 0a             	lea    eax,[rdx+0xa]
   1403833e7:	8b c8                	mov    ecx,eax
   1403833e9:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   1403833f0:	00 00 
   1403833f2:	0f 28 c2             	movaps xmm0,xmm2
   1403833f5:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   1403833fc:	00 00 
   1403833fe:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   140383405:	00 00 
   140383407:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   14038340e:	00 
   14038340f:	66 0f 6e c0          	movd   xmm0,eax
   140383413:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140383416:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   14038341d:	00 00 
   14038341f:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   140383426:	00 00 
   140383428:	7a 02                	jp     0x14038342c
   14038342a:	74 05                	je     0x140383431
   14038342c:	0f 2f d1             	comiss xmm2,xmm1
   14038342f:	76 03                	jbe    0x140383434
   140383431:	0f 28 ca             	movaps xmm1,xmm2
   140383434:	0f 2e ce             	ucomiss xmm1,xmm6
   140383437:	8d 42 0b             	lea    eax,[rdx+0xb]
   14038343a:	8b c8                	mov    ecx,eax
   14038343c:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   140383443:	00 00 
   140383445:	0f 28 c2             	movaps xmm0,xmm2
   140383448:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   14038344f:	00 00 
   140383451:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   140383458:	00 00 
   14038345a:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   140383461:	00 
   140383462:	66 0f 6e c0          	movd   xmm0,eax
   140383466:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140383469:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   140383470:	00 00 
   140383472:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   140383479:	00 00 
   14038347b:	7a 02                	jp     0x14038347f
   14038347d:	74 05                	je     0x140383484
   14038347f:	0f 2f d1             	comiss xmm2,xmm1
   140383482:	76 03                	jbe    0x140383487
   140383484:	0f 28 ca             	movaps xmm1,xmm2
   140383487:	0f 2e ce             	ucomiss xmm1,xmm6
   14038348a:	8d 42 0c             	lea    eax,[rdx+0xc]
   14038348d:	8b c8                	mov    ecx,eax
   14038348f:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   140383496:	00 00 
   140383498:	0f 28 c2             	movaps xmm0,xmm2
   14038349b:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   1403834a2:	00 00 
   1403834a4:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   1403834ab:	00 00 
   1403834ad:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   1403834b4:	00 
   1403834b5:	66 0f 6e c0          	movd   xmm0,eax
   1403834b9:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403834bc:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   1403834c3:	00 00 
   1403834c5:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   1403834cc:	00 00 
   1403834ce:	7a 02                	jp     0x1403834d2
   1403834d0:	74 05                	je     0x1403834d7
   1403834d2:	0f 2f d1             	comiss xmm2,xmm1
   1403834d5:	76 03                	jbe    0x1403834da
   1403834d7:	0f 28 ca             	movaps xmm1,xmm2
   1403834da:	0f 2e ce             	ucomiss xmm1,xmm6
   1403834dd:	8d 42 0d             	lea    eax,[rdx+0xd]
   1403834e0:	8b c8                	mov    ecx,eax
   1403834e2:	f3 0f 10 94 85 c0 06 	movss  xmm2,DWORD PTR [rbp+rax*4+0x6c0]
   1403834e9:	00 00 
   1403834eb:	0f 28 c2             	movaps xmm0,xmm2
   1403834ee:	f3 0f 58 84 85 c0 02 	addss  xmm0,DWORD PTR [rbp+rax*4+0x2c0]
   1403834f5:	00 00 
   1403834f7:	f3 0f 11 84 85 c0 02 	movss  DWORD PTR [rbp+rax*4+0x2c0],xmm0
   1403834fe:	00 00 
   140383500:	0f b6 84 05 c0 0a 00 	movzx  eax,BYTE PTR [rbp+rax*1+0xac0]
   140383507:	00 
   140383508:	66 0f 6e c0          	movd   xmm0,eax
   14038350c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14038350f:	f3 0f 58 84 8d c0 04 	addss  xmm0,DWORD PTR [rbp+rcx*4+0x4c0]
   140383516:	00 00 
   140383518:	f3 0f 11 84 8d c0 04 	movss  DWORD PTR [rbp+rcx*4+0x4c0],xmm0
   14038351f:	00 00 
   140383521:	7a 02                	jp     0x140383525
   140383523:	74 05                	je     0x14038352a
   140383525:	0f 2f d1             	comiss xmm2,xmm1
   140383528:	76 03                	jbe    0x14038352d
   14038352a:	0f 28 ca             	movaps xmm1,xmm2
   14038352d:	83 c2 10             	add    edx,0x10
   140383530:	8d 42 fe             	lea    eax,[rdx-0x2]
   140383533:	83 f8 7f             	cmp    eax,0x7f
   140383536:	0f 86 c4 fa ff ff    	jbe    0x140383000
   14038353c:	8b 4c 24 64          	mov    ecx,DWORD PTR [rsp+0x64]
   140383540:	ff c6                	inc    esi
   140383542:	ff c9                	dec    ecx
   140383544:	03 cb                	add    ecx,ebx
   140383546:	eb 04                	jmp    0x14038354c
   140383548:	8b 4c 24 64          	mov    ecx,DWORD PTR [rsp+0x64]
   14038354c:	8b 47 04             	mov    eax,DWORD PTR [rdi+0x4]
   14038354f:	ff c1                	inc    ecx
   140383551:	2b c3                	sub    eax,ebx
   140383553:	89 4c 24 64          	mov    DWORD PTR [rsp+0x64],ecx
   140383557:	3b c8                	cmp    ecx,eax
   140383559:	0f 8e 64 f9 ff ff    	jle    0x140382ec3
   14038355f:	85 f6                	test   esi,esi
   140383561:	75 14                	jne    0x140383577
   140383563:	b8 01 00 00 00       	mov    eax,0x1
   140383568:	2b 44 24 60          	sub    eax,DWORD PTR [rsp+0x60]
   14038356c:	03 d8                	add    ebx,eax
   14038356e:	83 fb 01             	cmp    ebx,0x1
   140383571:	0f 8d 39 f9 ff ff    	jge    0x140382eb0
   140383577:	66 0f 6e c6          	movd   xmm0,esi
   14038357b:	66 0f 70 c0 00       	pshufd xmm0,xmm0,0x0
   140383580:	85 f6                	test   esi,esi
   140383582:	0f 84 96 05 00 00    	je     0x140383b1e
   140383588:	44 0f 29 9c 24 90 0c 	movaps XMMWORD PTR [rsp+0xc90],xmm11
   14038358f:	00 00 
   140383591:	b8 10 00 00 00       	mov    eax,0x10
   140383596:	0f 5b c8             	cvtdq2ps xmm1,xmm0
   140383599:	44 0f 29 a4 24 80 0c 	movaps XMMWORD PTR [rsp+0xc80],xmm12
   1403835a0:	00 00 
   1403835a2:	0f 57 c0             	xorps  xmm0,xmm0
   1403835a5:	44 0f 29 ac 24 70 0c 	movaps XMMWORD PTR [rsp+0xc70],xmm13
   1403835ac:	00 00 
   1403835ae:	0f 28 d1             	movaps xmm2,xmm1
   1403835b1:	0f c2 d0 01          	cmpltps xmm2,xmm0
   1403835b5:	44 0f 29 b4 24 60 0c 	movaps XMMWORD PTR [rsp+0xc60],xmm14
   1403835bc:	00 00 
   1403835be:	0f 54 15 fb c9 32 00 	andps  xmm2,XMMWORD PTR [rip+0x32c9fb]        # 0x1406affc0
   1403835c5:	0f 58 d1             	addps  xmm2,xmm1
   1403835c8:	44 0f 29 bc 24 50 0c 	movaps XMMWORD PTR [rsp+0xc50],xmm15
   1403835cf:	00 00 
   1403835d1:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403835d5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   1403835dc:	00 00 00 00 
   1403835e0:	42 0f 10 84 35 c0 02 	movups xmm0,XMMWORD PTR [rbp+r14*1+0x2c0]
   1403835e7:	00 00 
   1403835e9:	4d 8d 76 20          	lea    r14,[r14+0x20]
   1403835ed:	0f 5e c2             	divps  xmm0,xmm2
   1403835f0:	42 0f 11 84 35 a0 02 	movups XMMWORD PTR [rbp+r14*1+0x2a0],xmm0
   1403835f7:	00 00 
   1403835f9:	42 0f 10 84 35 a0 04 	movups xmm0,XMMWORD PTR [rbp+r14*1+0x4a0]
   140383600:	00 00 
   140383602:	0f 5e c2             	divps  xmm0,xmm2
   140383605:	42 0f 11 84 35 a0 04 	movups XMMWORD PTR [rbp+r14*1+0x4a0],xmm0
   14038360c:	00 00 
   14038360e:	42 0f 10 84 35 b0 02 	movups xmm0,XMMWORD PTR [rbp+r14*1+0x2b0]
   140383615:	00 00 
   140383617:	0f 5e c2             	divps  xmm0,xmm2
   14038361a:	42 0f 11 84 35 b0 02 	movups XMMWORD PTR [rbp+r14*1+0x2b0],xmm0
   140383621:	00 00 
   140383623:	42 0f 10 84 35 b0 04 	movups xmm0,XMMWORD PTR [rbp+r14*1+0x4b0]
   14038362a:	00 00 
   14038362c:	0f 5e c2             	divps  xmm0,xmm2
   14038362f:	42 0f 11 84 35 b0 04 	movups XMMWORD PTR [rbp+r14*1+0x4b0],xmm0
   140383636:	00 00 
   140383638:	48 83 e8 01          	sub    rax,0x1
   14038363c:	75 a2                	jne    0x1403835e0
   14038363e:	41 8b d4             	mov    edx,r12d
   140383641:	48 8b cf             	mov    rcx,rdi
   140383644:	e8 f7 ee ff ff       	call   0x140382540
   140383649:	41 8b d4             	mov    edx,r12d
   14038364c:	48 8b cf             	mov    rcx,rdi
   14038364f:	44 0f 28 f8          	movaps xmm15,xmm0
   140383653:	e8 28 e3 ff ff       	call   0x140381980
   140383658:	41 8b d4             	mov    edx,r12d
   14038365b:	48 8b cf             	mov    rcx,rdi
   14038365e:	44 0f 28 c8          	movaps xmm9,xmm0
   140383662:	e8 79 f1 ff ff       	call   0x1403827e0
   140383667:	f3 0f 10 35 c1 c9 4c 	movss  xmm6,DWORD PTR [rip+0x4cc9c1]        # 0x140850030
   14038366e:	00 
   14038366f:	44 0f 28 d0          	movaps xmm10,xmm0
   140383673:	83 fe 01             	cmp    esi,0x1
   140383676:	76 11                	jbe    0x140383689
   140383678:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14038367b:	0f 57 c9             	xorps  xmm1,xmm1
   14038367e:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   140383683:	f3 0f 5e f9          	divss  xmm7,xmm1
   140383687:	eb 03                	jmp    0x14038368c
   140383689:	0f 28 fe             	movaps xmm7,xmm6
   14038368c:	8b 47 04             	mov    eax,DWORD PTR [rdi+0x4]
   14038368f:	48 8d 0d 8a 00 64 00 	lea    rcx,[rip+0x64008a]        # 0x1409c3720
   140383696:	2b 07                	sub    eax,DWORD PTR [rdi]
   140383698:	0f 57 d2             	xorps  xmm2,xmm2
   14038369b:	f3 44 0f 10 af 18 02 	movss  xmm13,DWORD PTR [rdi+0x218]
   1403836a2:	00 00 
   1403836a4:	44 0f 28 de          	movaps xmm11,xmm6
   1403836a8:	44 0f 2f ea          	comiss xmm13,xmm2
   1403836ac:	66 44 0f 6e c0       	movd   xmm8,eax
   1403836b1:	45 0f 28 e2          	movaps xmm12,xmm10
   1403836b5:	48 8b 44 24 70       	mov    rax,QWORD PTR [rsp+0x70]
   1403836ba:	f3 44 0f 5c df       	subss  xmm11,xmm7
   1403836bf:	45 0f 5b c0          	cvtdq2ps xmm8,xmm8
   1403836c3:	f3 44 0f 59 04 08    	mulss  xmm8,DWORD PTR [rax+rcx*1]
   1403836c9:	f3 45 0f 5e e0       	divss  xmm12,xmm8
   1403836ce:	76 18                	jbe    0x1403836e8
   1403836d0:	48 8b 47 08          	mov    rax,QWORD PTR [rdi+0x8]
   1403836d4:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   1403836d8:	e8 c3 8b fe ff       	call   0x14036c2a0
   1403836dd:	f3 0f 11 44 24 60    	movss  DWORD PTR [rsp+0x60],xmm0
   1403836e3:	0f 57 d2             	xorps  xmm2,xmm2
   1403836e6:	eb 06                	jmp    0x1403836ee
   1403836e8:	f3 0f 11 54 24 60    	movss  DWORD PTR [rsp+0x60],xmm2
   1403836ee:	f3 0f 10 25 32 3a 31 	movss  xmm4,DWORD PTR [rip+0x313a32]        # 0x140697128
   1403836f5:	00 
   1403836f6:	48 8d 35 73 2c b8 14 	lea    rsi,[rip+0x14b82c73]        # 0x154f06370
   1403836fd:	f3 0f 10 2d bb c8 4c 	movss  xmm5,DWORD PTR [rip+0x4cc8bb]        # 0x14084ffc0
   140383704:	00 
   140383705:	48 8d 85 c0 02 00 00 	lea    rax,[rbp+0x2c0]
   14038370c:	f3 0f 10 3d 98 c8 4c 	movss  xmm7,DWORD PTR [rip+0x4cc898]        # 0x14084ffac
   140383713:	00 
   140383714:	4c 8b c6             	mov    r8,rsi
   140383717:	f3 44 0f 10 35 f0 39 	movss  xmm14,DWORD PTR [rip+0x3139f0]        # 0x140697110
   14038371e:	31 00 
   140383720:	f3 0f 10 18          	movss  xmm3,DWORD PTR [rax]
   140383724:	0f 2e da             	ucomiss xmm3,xmm2
   140383727:	7a 06                	jp     0x14038372f
   140383729:	0f 84 58 02 00 00    	je     0x140383987
   14038372f:	49 8b 08             	mov    rcx,QWORD PTR [r8]
   140383732:	48 85 c9             	test   rcx,rcx
   140383735:	0f 84 4c 02 00 00    	je     0x140383987
   14038373b:	8b 51 28             	mov    edx,DWORD PTR [rcx+0x28]
   14038373e:	f6 c2 10             	test   dl,0x10
   140383741:	0f 85 40 02 00 00    	jne    0x140383987
   140383747:	f6 c2 40             	test   dl,0x40
   14038374a:	74 42                	je     0x14038378e
   14038374c:	41 0f 28 ca          	movaps xmm1,xmm10
   140383750:	f3 0f 5c 0d c4 39 31 	subss  xmm1,DWORD PTR [rip+0x3139c4]        # 0x14069711c
   140383757:	00 
   140383758:	0f 2f ca             	comiss xmm1,xmm2
   14038375b:	77 03                	ja     0x140383760
   14038375d:	0f 28 ca             	movaps xmm1,xmm2
   140383760:	41 0f 28 c1          	movaps xmm0,xmm9
   140383764:	f3 0f 59 05 34 ca 4c 	mulss  xmm0,DWORD PTR [rip+0x4cca34]        # 0x1408501a0
   14038376b:	00 
   14038376c:	f3 0f 5c c8          	subss  xmm1,xmm0
   140383770:	f3 0f 5f ca          	maxss  xmm1,xmm2
   140383774:	0f 2f e1             	comiss xmm4,xmm1
   140383777:	77 03                	ja     0x14038377c
   140383779:	0f 28 cc             	movaps xmm1,xmm4
   14038377c:	0f 28 c6             	movaps xmm0,xmm6
   14038377f:	f3 0f 5c c1          	subss  xmm0,xmm1
   140383783:	f3 0f 59 c3          	mulss  xmm0,xmm3
   140383787:	f3 0f 11 00          	movss  DWORD PTR [rax],xmm0
   14038378b:	0f 28 d8             	movaps xmm3,xmm0
   14038378e:	f3 0f 10 41 0c       	movss  xmm0,DWORD PTR [rcx+0xc]
   140383793:	44 0f 2f f8          	comiss xmm15,xmm0
   140383797:	76 27                	jbe    0x1403837c0
   140383799:	41 0f 28 cf          	movaps xmm1,xmm15
   14038379d:	f3 0f 5c c8          	subss  xmm1,xmm0
   1403837a1:	f3 0f 5e 0d f3 39 31 	divss  xmm1,DWORD PTR [rip+0x3139f3]        # 0x14069719c
   1403837a8:	00 
   1403837a9:	0f 2f e1             	comiss xmm4,xmm1
   1403837ac:	77 03                	ja     0x1403837b1
   1403837ae:	0f 28 cc             	movaps xmm1,xmm4
   1403837b1:	0f 28 c6             	movaps xmm0,xmm6
   1403837b4:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403837b8:	f3 0f 59 d8          	mulss  xmm3,xmm0
   1403837bc:	f3 0f 11 18          	movss  DWORD PTR [rax],xmm3
   1403837c0:	f3 0f 10 41 1c       	movss  xmm0,DWORD PTR [rcx+0x1c]
   1403837c5:	44 0f 2f c8          	comiss xmm9,xmm0
   1403837c9:	76 2b                	jbe    0x1403837f6
   1403837cb:	41 0f 28 c9          	movaps xmm1,xmm9
   1403837cf:	f3 0f 5c c8          	subss  xmm1,xmm0
   1403837d3:	f3 0f 10 05 01 c8 4c 	movss  xmm0,DWORD PTR [rip+0x4cc801]        # 0x14084ffdc
   1403837da:	00 
   1403837db:	f3 0f 5e cd          	divss  xmm1,xmm5
   1403837df:	0f 2f c1             	comiss xmm0,xmm1
   1403837e2:	77 03                	ja     0x1403837e7
   1403837e4:	0f 28 c8             	movaps xmm1,xmm0
   1403837e7:	0f 28 c6             	movaps xmm0,xmm6
   1403837ea:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403837ee:	f3 0f 59 d8          	mulss  xmm3,xmm0
   1403837f2:	f3 0f 11 18          	movss  DWORD PTR [rax],xmm3
   1403837f6:	f6 c2 04             	test   dl,0x4
   1403837f9:	74 51                	je     0x14038384c
   1403837fb:	44 0f 2f c5          	comiss xmm8,xmm5
   1403837ff:	76 4b                	jbe    0x14038384c
   140383801:	41 0f 2f f9          	comiss xmm7,xmm9
   140383805:	76 45                	jbe    0x14038384c
   140383807:	f2 0f 10 15 69 c9 4c 	movsd  xmm2,QWORD PTR [rip+0x4cc969]        # 0x140850178
   14038380e:	00 
   14038380f:	0f 57 c9             	xorps  xmm1,xmm1
   140383812:	41 0f 28 c1          	movaps xmm0,xmm9
   140383816:	f3 0f 5e c7          	divss  xmm0,xmm7
   14038381a:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   14038381e:	0f 57 c0             	xorps  xmm0,xmm0
   140383821:	f2 0f 5c d1          	subsd  xmm2,xmm1
   140383825:	f2 0f 10 0d 4b c9 4c 	movsd  xmm1,QWORD PTR [rip+0x4cc94b]        # 0x140850178
   14038382c:	00 
   14038382d:	f3 0f 5a c3          	cvtss2sd xmm0,xmm3
   140383831:	f2 0f 59 15 47 c8 4c 	mulsd  xmm2,QWORD PTR [rip+0x4cc847]        # 0x140850080
   140383838:	00 
   140383839:	f2 0f 5c ca          	subsd  xmm1,xmm2
   14038383d:	0f 57 d2             	xorps  xmm2,xmm2
   140383840:	f2 0f 59 c8          	mulsd  xmm1,xmm0
   140383844:	66 0f 5a d9          	cvtpd2ps xmm3,xmm1
   140383848:	f3 0f 11 18          	movss  DWORD PTR [rax],xmm3
   14038384c:	f3 0f 10 41 20       	movss  xmm0,DWORD PTR [rcx+0x20]
   140383851:	44 0f 2f d0          	comiss xmm10,xmm0
   140383855:	76 1a                	jbe    0x140383871
   140383857:	41 0f 28 ca          	movaps xmm1,xmm10
   14038385b:	f3 0f 5c c8          	subss  xmm1,xmm0
   14038385f:	f3 0f 59 0d 69 c7 4c 	mulss  xmm1,DWORD PTR [rip+0x4cc769]        # 0x14084ffd0
   140383866:	00 
   140383867:	0f 2f f9             	comiss xmm7,xmm1
   14038386a:	77 24                	ja     0x140383890
   14038386c:	0f 28 cf             	movaps xmm1,xmm7
   14038386f:	eb 1f                	jmp    0x140383890
   140383871:	f6 c2 02             	test   dl,0x2
   140383874:	74 29                	je     0x14038389f
   140383876:	0f 28 cc             	movaps xmm1,xmm4
   140383879:	f3 41 0f 5c ca       	subss  xmm1,xmm10
   14038387e:	0f 2f ca             	comiss xmm1,xmm2
   140383881:	76 0a                	jbe    0x14038388d
   140383883:	0f 2f e1             	comiss xmm4,xmm1
   140383886:	77 08                	ja     0x140383890
   140383888:	0f 28 cc             	movaps xmm1,xmm4
   14038388b:	eb 03                	jmp    0x140383890
   14038388d:	0f 28 ca             	movaps xmm1,xmm2
   140383890:	0f 28 c6             	movaps xmm0,xmm6
   140383893:	f3 0f 5c c1          	subss  xmm0,xmm1
   140383897:	f3 0f 59 d8          	mulss  xmm3,xmm0
   14038389b:	f3 0f 11 18          	movss  DWORD PTR [rax],xmm3
   14038389f:	f3 0f 10 41 24       	movss  xmm0,DWORD PTR [rcx+0x24]
   1403838a4:	44 0f 2f d8          	comiss xmm11,xmm0
   1403838a8:	76 1c                	jbe    0x1403838c6
   1403838aa:	41 0f 28 cb          	movaps xmm1,xmm11
   1403838ae:	f3 0f 5c c8          	subss  xmm1,xmm0
   1403838b2:	f3 0f 59 0d 22 c7 4c 	mulss  xmm1,DWORD PTR [rip+0x4cc722]        # 0x14084ffdc
   1403838b9:	00 
   1403838ba:	44 0f 2f f1          	comiss xmm14,xmm1
   1403838be:	77 2c                	ja     0x1403838ec
   1403838c0:	41 0f 28 ce          	movaps xmm1,xmm14
   1403838c4:	eb 26                	jmp    0x1403838ec
   1403838c6:	f6 c2 02             	test   dl,0x2
   1403838c9:	74 30                	je     0x1403838fb
   1403838cb:	f3 0f 10 0d d5 c6 4c 	movss  xmm1,DWORD PTR [rip+0x4cc6d5]        # 0x14084ffa8
   1403838d2:	00 
   1403838d3:	f3 41 0f 5c cb       	subss  xmm1,xmm11
   1403838d8:	f3 0f 5f ca          	maxss  xmm1,xmm2
   1403838dc:	f3 0f 59 0d 84 c9 4c 	mulss  xmm1,DWORD PTR [rip+0x4cc984]        # 0x140850268
   1403838e3:	00 
   1403838e4:	0f 2f e9             	comiss xmm5,xmm1
   1403838e7:	77 03                	ja     0x1403838ec
   1403838e9:	0f 28 cd             	movaps xmm1,xmm5
   1403838ec:	0f 28 c6             	movaps xmm0,xmm6
   1403838ef:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403838f3:	f3 0f 59 d8          	mulss  xmm3,xmm0
   1403838f7:	f3 0f 11 18          	movss  DWORD PTR [rax],xmm3
   1403838fb:	f3 0f 10 49 2c       	movss  xmm1,DWORD PTR [rcx+0x2c]
   140383900:	41 0f 2f c8          	comiss xmm1,xmm8
   140383904:	76 1c                	jbe    0x140383922
   140383906:	f3 41 0f 5c c8       	subss  xmm1,xmm8
   14038390b:	0f 2f e1             	comiss xmm4,xmm1
   14038390e:	77 03                	ja     0x140383913
   140383910:	0f 28 cc             	movaps xmm1,xmm4
   140383913:	0f 28 c6             	movaps xmm0,xmm6
   140383916:	f3 0f 5c c1          	subss  xmm0,xmm1
   14038391a:	f3 0f 59 d8          	mulss  xmm3,xmm0
   14038391e:	f3 0f 11 18          	movss  DWORD PTR [rax],xmm3
   140383922:	f3 0f 10 41 30       	movss  xmm0,DWORD PTR [rcx+0x30]
   140383927:	44 0f 2f e0          	comiss xmm12,xmm0
   14038392b:	76 27                	jbe    0x140383954
   14038392d:	41 0f 28 cc          	movaps xmm1,xmm12
   140383931:	f3 0f 5c c8          	subss  xmm1,xmm0
   140383935:	f3 0f 5e 0d 2f 38 31 	divss  xmm1,DWORD PTR [rip+0x31382f]        # 0x14069716c
   14038393c:	00 
   14038393d:	0f 2f e1             	comiss xmm4,xmm1
   140383940:	77 03                	ja     0x140383945
   140383942:	0f 28 cc             	movaps xmm1,xmm4
   140383945:	0f 28 c6             	movaps xmm0,xmm6
   140383948:	f3 0f 5c c1          	subss  xmm0,xmm1
   14038394c:	f3 0f 59 d8          	mulss  xmm3,xmm0
   140383950:	f3 0f 11 18          	movss  DWORD PTR [rax],xmm3
   140383954:	84 d2                	test   dl,dl
   140383956:	78 2f                	js     0x140383987
   140383958:	44 0f 2f ea          	comiss xmm13,xmm2
   14038395c:	76 29                	jbe    0x140383987
   14038395e:	41 0f 28 cd          	movaps xmm1,xmm13
   140383962:	f3 0f 59 0d 1e c9 4c 	mulss  xmm1,DWORD PTR [rip+0x4cc91e]        # 0x140850288
   140383969:	00 
   14038396a:	f3 0f 5e 4c 24 60    	divss  xmm1,DWORD PTR [rsp+0x60]
   140383970:	0f 2f e9             	comiss xmm5,xmm1
   140383973:	77 03                	ja     0x140383978
   140383975:	0f 28 cd             	movaps xmm1,xmm5
   140383978:	0f 28 c6             	movaps xmm0,xmm6
   14038397b:	f3 0f 5c c1          	subss  xmm0,xmm1
   14038397f:	f3 0f 59 c3          	mulss  xmm0,xmm3
   140383983:	f3 0f 11 00          	movss  DWORD PTR [rax],xmm0
   140383987:	49 83 c0 08          	add    r8,0x8
   14038398b:	48 83 c0 04          	add    rax,0x4
   14038398f:	49 83 ef 01          	sub    r15,0x1
   140383993:	0f 85 87 fd ff ff    	jne    0x140383720
   140383999:	f3 0f 10 85 d4 02 00 	movss  xmm0,DWORD PTR [rbp+0x2d4]
   1403839a0:	00 
   1403839a1:	4c 8d 85 c0 04 00 00 	lea    r8,[rbp+0x4c0]
   1403839a8:	f3 0f 58 85 d8 02 00 	addss  xmm0,DWORD PTR [rbp+0x2d8]
   1403839af:	00 
   1403839b0:	f3 0f 10 8d d0 02 00 	movss  xmm1,DWORD PTR [rbp+0x2d0]
   1403839b7:	00 
   1403839b8:	48 8d 95 c0 02 00 00 	lea    rdx,[rbp+0x2c0]
   1403839bf:	48 8d 4f 20          	lea    rcx,[rdi+0x20]
   1403839c3:	4c 89 bd d4 02 00 00 	mov    QWORD PTR [rbp+0x2d4],r15
   1403839ca:	f3 0f 58 c8          	addss  xmm1,xmm0
   1403839ce:	f3 0f 10 85 dc 02 00 	movss  xmm0,DWORD PTR [rbp+0x2dc]
   1403839d5:	00 
   1403839d6:	f3 0f 58 85 e0 02 00 	addss  xmm0,DWORD PTR [rbp+0x2e0]
   1403839dd:	00 
   1403839de:	44 89 bd e0 02 00 00 	mov    DWORD PTR [rbp+0x2e0],r15d
   1403839e5:	f3 0f 11 8d d0 02 00 	movss  DWORD PTR [rbp+0x2d0],xmm1
   1403839ec:	00 
   1403839ed:	f3 0f 10 8d cc 02 00 	movss  xmm1,DWORD PTR [rbp+0x2cc]
   1403839f4:	00 
   1403839f5:	f3 0f 11 85 dc 02 00 	movss  DWORD PTR [rbp+0x2dc],xmm0
   1403839fc:	00 
   1403839fd:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140383a00:	0f 28 c1             	movaps xmm0,xmm1
   140383a03:	f2 0f 59 05 6d 37 31 	mulsd  xmm0,QWORD PTR [rip+0x31376d]        # 0x140697178
   140383a0a:	00 
   140383a0b:	f2 0f 58 c1          	addsd  xmm0,xmm1
   140383a0f:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   140383a13:	f3 0f 11 85 cc 02 00 	movss  DWORD PTR [rbp+0x2cc],xmm0
   140383a1a:	00 
   140383a1b:	e8 d0 e4 ff ff       	call   0x140381ef0
   140383a20:	0f b7 4f 20          	movzx  ecx,WORD PTR [rdi+0x20]
   140383a24:	44 0f 28 bc 24 50 0c 	movaps xmm15,XMMWORD PTR [rsp+0xc50]
   140383a2b:	00 00 
   140383a2d:	44 0f 28 b4 24 60 0c 	movaps xmm14,XMMWORD PTR [rsp+0xc60]
   140383a34:	00 00 
   140383a36:	44 0f 28 ac 24 70 0c 	movaps xmm13,XMMWORD PTR [rsp+0xc70]
   140383a3d:	00 00 
   140383a3f:	44 0f 28 a4 24 80 0c 	movaps xmm12,XMMWORD PTR [rsp+0xc80]
   140383a46:	00 00 
   140383a48:	8d 41 ff             	lea    eax,[rcx-0x1]
   140383a4b:	44 0f 28 9c 24 90 0c 	movaps xmm11,XMMWORD PTR [rsp+0xc90]
   140383a52:	00 00 
   140383a54:	66 83 f8 7e          	cmp    ax,0x7e
   140383a58:	77 74                	ja     0x140383ace
   140383a5a:	0f b7 c1             	movzx  eax,cx
   140383a5d:	48 8b 14 c6          	mov    rdx,QWORD PTR [rsi+rax*8]
   140383a61:	48 85 d2             	test   rdx,rdx
   140383a64:	74 68                	je     0x140383ace
   140383a66:	f6 42 28 08          	test   BYTE PTR [rdx+0x28],0x8
   140383a6a:	74 62                	je     0x140383ace
   140383a6c:	48 8d 4f 28          	lea    rcx,[rdi+0x28]
   140383a70:	ba 01 00 00 00       	mov    edx,0x1
   140383a75:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   140383a7c:	00 00 00 00 
   140383a80:	0f b7 01             	movzx  eax,WORD PTR [rcx]
   140383a83:	66 ff c8             	dec    ax
   140383a86:	66 83 f8 01          	cmp    ax,0x1
   140383a8a:	76 10                	jbe    0x140383a9c
   140383a8c:	ff c2                	inc    edx
   140383a8e:	48 83 c1 08          	add    rcx,0x8
   140383a92:	83 fa 08             	cmp    edx,0x8
   140383a95:	72 e9                	jb     0x140383a80
   140383a97:	e9 82 00 00 00       	jmp    0x140383b1e
   140383a9c:	f3 0f 10 47 24       	movss  xmm0,DWORD PTR [rdi+0x24]
   140383aa1:	f3 0f 10 4c d7 24    	movss  xmm1,DWORD PTR [rdi+rdx*8+0x24]
   140383aa7:	f3 0f 5c c7          	subss  xmm0,xmm7
   140383aab:	0f 2f c8             	comiss xmm1,xmm0
   140383aae:	76 6e                	jbe    0x140383b1e
   140383ab0:	f3 0f 58 cf          	addss  xmm1,xmm7
   140383ab4:	f3 0f 11 4c d7 24    	movss  DWORD PTR [rdi+rdx*8+0x24],xmm1
   140383aba:	48 8b 4c d7 20       	mov    rcx,QWORD PTR [rdi+rdx*8+0x20]
   140383abf:	48 8b 47 20          	mov    rax,QWORD PTR [rdi+0x20]
   140383ac3:	48 89 4f 20          	mov    QWORD PTR [rdi+0x20],rcx
   140383ac7:	48 89 44 d7 20       	mov    QWORD PTR [rdi+rdx*8+0x20],rax
   140383acc:	eb 50                	jmp    0x140383b1e
   140383ace:	66 ff c9             	dec    cx
   140383ad1:	66 83 f9 01          	cmp    cx,0x1
   140383ad5:	77 47                	ja     0x140383b1e
   140383ad7:	0f b7 4f 28          	movzx  ecx,WORD PTR [rdi+0x28]
   140383adb:	8d 41 ff             	lea    eax,[rcx-0x1]
   140383ade:	66 83 f8 7e          	cmp    ax,0x7e
   140383ae2:	77 3a                	ja     0x140383b1e
   140383ae4:	0f b7 c1             	movzx  eax,cx
   140383ae7:	48 8b 0c c6          	mov    rcx,QWORD PTR [rsi+rax*8]
   140383aeb:	48 85 c9             	test   rcx,rcx
   140383aee:	74 2e                	je     0x140383b1e
   140383af0:	f6 41 28 08          	test   BYTE PTR [rcx+0x28],0x8
   140383af4:	74 28                	je     0x140383b1e
   140383af6:	f3 0f 10 4f 24       	movss  xmm1,DWORD PTR [rdi+0x24]
   140383afb:	f3 0f 10 47 2c       	movss  xmm0,DWORD PTR [rdi+0x2c]
   140383b00:	f3 0f 5c cf          	subss  xmm1,xmm7
   140383b04:	0f 2f c1             	comiss xmm0,xmm1
   140383b07:	f3 0f 11 4f 24       	movss  DWORD PTR [rdi+0x24],xmm1
   140383b0c:	76 10                	jbe    0x140383b1e
   140383b0e:	48 8b 47 20          	mov    rax,QWORD PTR [rdi+0x20]
   140383b12:	48 8b 4f 28          	mov    rcx,QWORD PTR [rdi+0x28]
   140383b16:	48 89 4f 20          	mov    QWORD PTR [rdi+0x20],rcx
   140383b1a:	48 89 47 28          	mov    QWORD PTR [rdi+0x28],rax
   140383b1e:	44 0f 28 8c 24 b0 0c 	movaps xmm9,XMMWORD PTR [rsp+0xcb0]
   140383b25:	00 00 
   140383b27:	44 0f 28 84 24 c0 0c 	movaps xmm8,XMMWORD PTR [rsp+0xcc0]
   140383b2e:	00 00 
   140383b30:	0f 28 bc 24 d0 0c 00 	movaps xmm7,XMMWORD PTR [rsp+0xcd0]
   140383b37:	00 
   140383b38:	0f 28 b4 24 e0 0c 00 	movaps xmm6,XMMWORD PTR [rsp+0xce0]
   140383b3f:	00 
   140383b40:	4c 8b bc 24 f0 0c 00 	mov    r15,QWORD PTR [rsp+0xcf0]
   140383b47:	00 
   140383b48:	48 8b 9c 24 38 0d 00 	mov    rbx,QWORD PTR [rsp+0xd38]
   140383b4f:	00 
   140383b50:	48 8b b4 24 00 0d 00 	mov    rsi,QWORD PTR [rsp+0xd00]
   140383b57:	00 
   140383b58:	44 0f 28 94 24 a0 0c 	movaps xmm10,XMMWORD PTR [rsp+0xca0]
   140383b5f:	00 00 
   140383b61:	4c 8b b4 24 f8 0c 00 	mov    r14,QWORD PTR [rsp+0xcf8]
   140383b68:	00 
   140383b69:	48 8b 8d 40 0b 00 00 	mov    rcx,QWORD PTR [rbp+0xb40]
   140383b70:	48 33 cc             	xor    rcx,rsp
   140383b73:	e8 88 7a 29 00       	call   0x14061b600
   140383b78:	48 81 c4 08 0d 00 00 	add    rsp,0xd08
   140383b7f:	41 5d                	pop    r13
   140383b81:	41 5c                	pop    r12
   140383b83:	5f                   	pop    rdi
   140383b84:	5d                   	pop    rbp
   140383b85:	c3                   	ret
   140383b86:	cc                   	int3
   140383b87:	cc                   	int3
   140383b88:	cc                   	int3
   140383b89:	cc                   	int3
   140383b8a:	cc                   	int3
   140383b8b:	cc                   	int3
   140383b8c:	cc                   	int3
   140383b8d:	cc                   	int3
   140383b8e:	cc                   	int3
   140383b8f:	cc                   	int3
   140383b90:	40 53                	rex push rbx
   140383b92:	48 83 ec 40          	sub    rsp,0x40
   140383b96:	4c 89 64 24 38       	mov    QWORD PTR [rsp+0x38],r12
   140383b9b:	4c 8b e1             	mov    r12,rcx
   140383b9e:	b9 05 00 00 00       	mov    ecx,0x5
   140383ba3:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   140383ba8:	4c 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],r15
   140383bad:	ff 15 b5 4a 30 00    	call   QWORD PTR [rip+0x304ab5]        # 0x140688668
   140383bb3:	49 8b 4c 24 10       	mov    rcx,QWORD PTR [r12+0x10]
   140383bb8:	45 33 d2             	xor    r10d,r10d
   140383bbb:	45 8b 34 24          	mov    r14d,DWORD PTR [r12]
   140383bbf:	48 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],rcx
   140383bc4:	44 8b 39             	mov    r15d,DWORD PTR [rcx]
   140383bc7:	45 3b 74 24 04       	cmp    r14d,DWORD PTR [r12+0x4]
   140383bcc:	0f 83 7d 02 00 00    	jae    0x140383e4f
   140383bd2:	48 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],rbp
   140383bd7:	4c 8d 1d f2 69 60 00 	lea    r11,[rip+0x6069f2]        # 0x14098a5d0
   140383bde:	48 89 74 24 60       	mov    QWORD PTR [rsp+0x60],rsi
   140383be3:	ba ff ff 00 00       	mov    edx,0xffff
   140383be8:	8b 35 c2 65 60 00    	mov    esi,DWORD PTR [rip+0x6065c2]        # 0x14098a1b0
   140383bee:	41 b8 fe 03 00 00    	mov    r8d,0x3fe
   140383bf4:	48 89 7c 24 68       	mov    QWORD PTR [rsp+0x68],rdi
   140383bf9:	4c 89 6c 24 30       	mov    QWORD PTR [rsp+0x30],r13
   140383bfe:	4d 69 ef 78 ab 06 00 	imul   r13,r15,0x6ab78
   140383c05:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   140383c0c:	00 00 00 00 
   140383c10:	4b 8b 3c 2b          	mov    rdi,QWORD PTR [r11+r13*1]
   140383c14:	41 8b c6             	mov    eax,r14d
   140383c17:	48 8d 0c c0          	lea    rcx,[rax+rax*8]
   140383c1b:	48 03 c9             	add    rcx,rcx
   140383c1e:	48 8b 6c cf 30       	mov    rbp,QWORD PTR [rdi+rcx*8+0x30]
   140383c23:	48 85 ed             	test   rbp,rbp
   140383c26:	0f 84 fc 01 00 00    	je     0x140383e28
   140383c2c:	66 83 bd 1c 02 00 00 	cmp    WORD PTR [rbp+0x21c],0x0
   140383c33:	00 
   140383c34:	7c 4a                	jl     0x140383c80
   140383c36:	48 c7 45 20 00 00 00 	mov    QWORD PTR [rbp+0x20],0x0
   140383c3d:	00 
   140383c3e:	48 c7 45 28 ff ff 00 	mov    QWORD PTR [rbp+0x28],0xffff
   140383c45:	00 
   140383c46:	48 c7 45 30 ff ff 00 	mov    QWORD PTR [rbp+0x30],0xffff
   140383c4d:	00 
   140383c4e:	48 c7 45 38 ff ff 00 	mov    QWORD PTR [rbp+0x38],0xffff
   140383c55:	00 
   140383c56:	48 c7 45 40 ff ff 00 	mov    QWORD PTR [rbp+0x40],0xffff
   140383c5d:	00 
   140383c5e:	48 c7 45 48 ff ff 00 	mov    QWORD PTR [rbp+0x48],0xffff
   140383c65:	00 
   140383c66:	48 c7 45 50 ff ff 00 	mov    QWORD PTR [rbp+0x50],0xffff
   140383c6d:	00 
   140383c6e:	48 c7 45 58 ff ff 00 	mov    QWORD PTR [rbp+0x58],0xffff
   140383c75:	00 
   140383c76:	4b 8b 3c 2b          	mov    rdi,QWORD PTR [r11+r13*1]
   140383c7a:	8b 35 30 65 60 00    	mov    esi,DWORD PTR [rip+0x606530]        # 0x14098a1b0
   140383c80:	48 8b 7c cf 30       	mov    rdi,QWORD PTR [rdi+rcx*8+0x30]
   140383c85:	41 83 ff ff          	cmp    r15d,0xffffffff
   140383c89:	41 8b df             	mov    ebx,r15d
   140383c8c:	0f 44 de             	cmove  ebx,esi
   140383c8f:	48 85 ff             	test   rdi,rdi
   140383c92:	74 06                	je     0x140383c9a
   140383c94:	0f b7 47 20          	movzx  eax,WORD PTR [rdi+0x20]
   140383c98:	eb 03                	jmp    0x140383c9d
   140383c9a:	41 8b c2             	mov    eax,r10d
   140383c9d:	66 3b c2             	cmp    ax,dx
   140383ca0:	41 8b ca             	mov    ecx,r10d
   140383ca3:	66 0f 45 c8          	cmovne cx,ax
   140383ca7:	3b de                	cmp    ebx,esi
   140383ca9:	75 27                	jne    0x140383cd2
   140383cab:	8d 41 ff             	lea    eax,[rcx-0x1]
   140383cae:	66 41 3b c0          	cmp    ax,r8w
   140383cb2:	77 1e                	ja     0x140383cd2
   140383cb4:	48 8b 15 7d b4 5f 00 	mov    rdx,QWORD PTR [rip+0x5fb47d]        # 0x14097f138
   140383cbb:	48 85 d2             	test   rdx,rdx
   140383cbe:	74 12                	je     0x140383cd2
   140383cc0:	0f b7 c1             	movzx  eax,cx
   140383cc3:	80 3c 10 00          	cmp    BYTE PTR [rax+rdx*1],0x0
   140383cc7:	0f 84 56 01 00 00    	je     0x140383e23
   140383ccd:	e9 2b 01 00 00       	jmp    0x140383dfd
   140383cd2:	0f b7 c9             	movzx  ecx,cx
   140383cd5:	8b d3                	mov    edx,ebx
   140383cd7:	e8 b4 ac ed ff       	call   0x14025e990
   140383cdc:	4c 8b d0             	mov    r10,rax
   140383cdf:	48 85 c0             	test   rax,rax
   140383ce2:	0f 84 8b 00 00 00    	je     0x140383d73
   140383ce8:	3b de                	cmp    ebx,esi
   140383cea:	75 2b                	jne    0x140383d17
   140383cec:	80 3d 7a 26 b8 14 00 	cmp    BYTE PTR [rip+0x14b8267a],0x0        # 0x154f0636d
   140383cf3:	74 12                	je     0x140383d07
   140383cf5:	4c 8d 1d d4 68 60 00 	lea    r11,[rip+0x6068d4]        # 0x14098a5d0
   140383cfc:	41 f6 42 0c 08       	test   BYTE PTR [r10+0xc],0x8
   140383d01:	0f 84 13 01 00 00    	je     0x140383e1a
   140383d07:	41 f6 42 0c 02       	test   BYTE PTR [r10+0xc],0x2
   140383d0c:	0f 85 01 01 00 00    	jne    0x140383e13
   140383d12:	e9 e6 00 00 00       	jmp    0x140383dfd
   140383d17:	85 db                	test   ebx,ebx
   140383d19:	79 06                	jns    0x140383d21
   140383d1b:	8b de                	mov    ebx,esi
   140383d1d:	85 f6                	test   esi,esi
   140383d1f:	78 e6                	js     0x140383d07
   140383d21:	3b 1d a9 d0 62 14    	cmp    ebx,DWORD PTR [rip+0x1462d0a9]        # 0x1549b0dd0
   140383d27:	7d de                	jge    0x140383d07
   140383d29:	33 c9                	xor    ecx,ecx
   140383d2b:	48 63 c3             	movsxd rax,ebx
   140383d2e:	4c 69 c8 78 ab 06 00 	imul   r9,rax,0x6ab78
   140383d35:	4c 8d 1d 94 68 60 00 	lea    r11,[rip+0x606894]        # 0x14098a5d0
   140383d3c:	0f b7 d1             	movzx  edx,cx
   140383d3f:	47 0f b7 84 19 60 41 	movzx  r8d,WORD PTR [r9+r11*1+0x64160]
   140383d46:	06 00 
   140383d48:	66 41 3b c8          	cmp    cx,r8w
   140383d4c:	73 b9                	jae    0x140383d07
   140383d4e:	66 90                	xchg   ax,ax
   140383d50:	0f b7 c2             	movzx  eax,dx
   140383d53:	48 69 c8 58 01 00 00 	imul   rcx,rax,0x158
   140383d5a:	49 03 c9             	add    rcx,r9
   140383d5d:	42 f6 84 19 6c 91 03 	test   BYTE PTR [rcx+r11*1+0x3916c],0x8
   140383d64:	00 08 
   140383d66:	75 94                	jne    0x140383cfc
   140383d68:	66 ff c2             	inc    dx
   140383d6b:	66 41 3b d0          	cmp    dx,r8w
   140383d6f:	72 df                	jb     0x140383d50
   140383d71:	eb 94                	jmp    0x140383d07
   140383d73:	48 85 ff             	test   rdi,rdi
   140383d76:	0f 84 97 00 00 00    	je     0x140383e13
   140383d7c:	45 33 d2             	xor    r10d,r10d
   140383d7f:	4c 8d 1d 4a 68 60 00 	lea    r11,[rip+0x60684a]        # 0x14098a5d0
   140383d86:	44 38 15 43 23 b8 14 	cmp    BYTE PTR [rip+0x14b82343],r10b        # 0x154f060d0
   140383d8d:	0f 85 8a 00 00 00    	jne    0x140383e1d
   140383d93:	b8 ff ff 00 00       	mov    eax,0xffff
   140383d98:	41 0f b7 d2          	movzx  edx,r10w
   140383d9c:	66 89 47 20          	mov    WORD PTR [rdi+0x20],ax
   140383da0:	48 63 c3             	movsxd rax,ebx
   140383da3:	4c 69 c8 78 ab 06 00 	imul   r9,rax,0x6ab78
   140383daa:	47 0f b7 84 19 60 41 	movzx  r8d,WORD PTR [r9+r11*1+0x64160]
   140383db1:	06 00 
   140383db3:	66 45 3b d0          	cmp    r10w,r8w
   140383db7:	73 31                	jae    0x140383dea
   140383db9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140383dc0:	0f b7 c2             	movzx  eax,dx
   140383dc3:	49 8d bb 60 91 03 00 	lea    rdi,[r11+0x39160]
   140383dca:	48 69 c8 58 01 00 00 	imul   rcx,rax,0x158
   140383dd1:	49 03 c9             	add    rcx,r9
   140383dd4:	48 03 f9             	add    rdi,rcx
   140383dd7:	66 44 39 17          	cmp    WORD PTR [rdi],r10w
   140383ddb:	0f 84 b4 00 00 00    	je     0x140383e95
   140383de1:	66 ff c2             	inc    dx
   140383de4:	66 41 3b d0          	cmp    dx,r8w
   140383de8:	72 d6                	jb     0x140383dc0
   140383dea:	8b 35 c0 63 60 00    	mov    esi,DWORD PTR [rip+0x6063c0]        # 0x14098a1b0
   140383df0:	3b de                	cmp    ebx,esi
   140383df2:	75 09                	jne    0x140383dfd
   140383df4:	44 38 15 72 25 b8 14 	cmp    BYTE PTR [rip+0x14b82572],r10b        # 0x154f0636d
   140383dfb:	75 20                	jne    0x140383e1d
   140383dfd:	45 8b c7             	mov    r8d,r15d
   140383e00:	ba ff ff ff ff       	mov    edx,0xffffffff
   140383e05:	48 8b cd             	mov    rcx,rbp
   140383e08:	e8 73 ee ff ff       	call   0x140382c80
   140383e0d:	8b 35 9d 63 60 00    	mov    esi,DWORD PTR [rip+0x60639d]        # 0x14098a1b0
   140383e13:	4c 8d 1d b6 67 60 00 	lea    r11,[rip+0x6067b6]        # 0x14098a5d0
   140383e1a:	45 33 d2             	xor    r10d,r10d
   140383e1d:	41 b8 fe 03 00 00    	mov    r8d,0x3fe
   140383e23:	ba ff ff 00 00       	mov    edx,0xffff
   140383e28:	41 ff c6             	inc    r14d
   140383e2b:	45 3b 74 24 04       	cmp    r14d,DWORD PTR [r12+0x4]
   140383e30:	0f 82 da fd ff ff    	jb     0x140383c10
   140383e36:	48 8b 4c 24 50       	mov    rcx,QWORD PTR [rsp+0x50]
   140383e3b:	4c 8b 6c 24 30       	mov    r13,QWORD PTR [rsp+0x30]
   140383e40:	48 8b 7c 24 68       	mov    rdi,QWORD PTR [rsp+0x68]
   140383e45:	48 8b 74 24 60       	mov    rsi,QWORD PTR [rsp+0x60]
   140383e4a:	48 8b 6c 24 58       	mov    rbp,QWORD PTR [rsp+0x58]
   140383e4f:	41 8b 44 24 0c       	mov    eax,DWORD PTR [r12+0xc]
   140383e54:	4c 8b 7c 24 20       	mov    r15,QWORD PTR [rsp+0x20]
   140383e59:	4c 8b 74 24 28       	mov    r14,QWORD PTR [rsp+0x28]
   140383e5e:	4c 8b 64 24 38       	mov    r12,QWORD PTR [rsp+0x38]
   140383e63:	48 8b 9c c1 d0 00 00 	mov    rbx,QWORD PTR [rcx+rax*8+0xd0]
   140383e6a:	00 
   140383e6b:	4c 89 94 c1 d0 00 00 	mov    QWORD PTR [rcx+rax*8+0xd0],r10
   140383e72:	00 
   140383e73:	48 85 db             	test   rbx,rbx
   140383e76:	74 15                	je     0x140383e8d
   140383e78:	48 8b cb             	mov    rcx,rbx
   140383e7b:	e8 e0 5f 1a 00       	call   0x140529e60
   140383e80:	ba 10 00 00 00       	mov    edx,0x10
   140383e85:	48 8b cb             	mov    rcx,rbx
   140383e88:	e8 cb 76 29 00       	call   0x14061b558
   140383e8d:	33 c0                	xor    eax,eax
   140383e8f:	48 83 c4 40          	add    rsp,0x40
   140383e93:	5b                   	pop    rbx
   140383e94:	c3                   	ret
   140383e95:	48 85 ff             	test   rdi,rdi
   140383e98:	0f 84 4c ff ff ff    	je     0x140383dea
   140383e9e:	8b 35 0c 63 60 00    	mov    esi,DWORD PTR [rip+0x60630c]        # 0x14098a1b0
   140383ea4:	3b de                	cmp    ebx,esi
   140383ea6:	75 09                	jne    0x140383eb1
   140383ea8:	0f b6 05 be 24 b8 14 	movzx  eax,BYTE PTR [rip+0x14b824be]        # 0x154f0636d
   140383eaf:	eb 11                	jmp    0x140383ec2
   140383eb1:	8b cb                	mov    ecx,ebx
   140383eb3:	e8 78 8d ff ff       	call   0x14037cc30
   140383eb8:	4c 8d 1d 11 67 60 00 	lea    r11,[rip+0x606711]        # 0x14098a5d0
   140383ebf:	45 33 d2             	xor    r10d,r10d
   140383ec2:	84 c0                	test   al,al
   140383ec4:	74 0a                	je     0x140383ed0
   140383ec6:	f6 47 0c 08          	test   BYTE PTR [rdi+0xc],0x8
   140383eca:	0f 84 4d ff ff ff    	je     0x140383e1d
   140383ed0:	f6 47 0c 02          	test   BYTE PTR [rdi+0xc],0x2
   140383ed4:	e9 22 ff ff ff       	jmp    0x140383dfb
   140383ed9:	cc                   	int3
   140383eda:	cc                   	int3
   140383edb:	cc                   	int3
   140383edc:	cc                   	int3
   140383edd:	cc                   	int3
   140383ede:	cc                   	int3
   140383edf:	cc                   	int3
   140383ee0:	48 83 ec 38          	sub    rsp,0x38
   140383ee4:	8b 05 c6 62 60 00    	mov    eax,DWORD PTR [rip+0x6062c6]        # 0x14098a1b0
   140383eea:	85 c0                	test   eax,eax
   140383eec:	0f 88 96 01 00 00    	js     0x140384088
   140383ef2:	3b 05 d8 ce 62 14    	cmp    eax,DWORD PTR [rip+0x1462ced8]        # 0x1549b0dd0
   140383ef8:	0f 8d 8a 01 00 00    	jge    0x140384088
   140383efe:	b2 01                	mov    dl,0x1
   140383f00:	48 89 6c 24 48       	mov    QWORD PTR [rsp+0x48],rbp
   140383f05:	0f b6 ca             	movzx  ecx,dl
   140383f08:	48 89 74 24 50       	mov    QWORD PTR [rsp+0x50],rsi
   140383f0d:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   140383f12:	e8 79 53 27 00       	call   0x1405f9290
   140383f17:	b2 01                	mov    dl,0x1
   140383f19:	0f b6 ca             	movzx  ecx,dl
   140383f1c:	e8 ef 59 27 00       	call   0x1405f9910
   140383f21:	48 63 05 88 62 60 00 	movsxd rax,DWORD PTR [rip+0x606288]        # 0x14098a1b0
   140383f28:	4c 8d 35 a1 66 60 00 	lea    r14,[rip+0x6066a1]        # 0x14098a5d0
   140383f2f:	33 ed                	xor    ebp,ebp
   140383f31:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140383f38:	0f b7 f5             	movzx  esi,bp
   140383f3b:	66 42 3b ac 31 60 41 	cmp    bp,WORD PTR [rcx+r14*1+0x64160]
   140383f42:	06 00 
   140383f44:	0f 83 1e 01 00 00    	jae    0x140384068
   140383f4a:	4c 8b 0d 7f 5f 60 00 	mov    r9,QWORD PTR [rip+0x605f7f]        # 0x140989ed0
   140383f51:	48 89 5c 24 40       	mov    QWORD PTR [rsp+0x40],rbx
   140383f56:	48 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],rdi
   140383f5b:	4c 89 64 24 30       	mov    QWORD PTR [rsp+0x30],r12
   140383f60:	4c 8d 25 c9 f7 63 00 	lea    r12,[rip+0x63f7c9]        # 0x1409c3730
   140383f67:	4c 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],r15
   140383f6c:	41 bf ff ff 00 00    	mov    r15d,0xffff
   140383f72:	0f b7 c6             	movzx  eax,si
   140383f75:	48 69 f8 58 01 00 00 	imul   rdi,rax,0x158
   140383f7c:	48 03 f9             	add    rdi,rcx
   140383f7f:	42 f7 44 27 0c 00 04 	test   DWORD PTR [rdi+r12*1+0xc],0x400
   140383f86:	00 00 
   140383f88:	0f 85 a6 00 00 00    	jne    0x140384034
   140383f8e:	8b d5                	mov    edx,ebp
   140383f90:	44 8b c5             	mov    r8d,ebp
   140383f93:	41 39 51 08          	cmp    DWORD PTR [r9+0x8],edx
   140383f97:	76 69                	jbe    0x140384002
   140383f99:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140383fa0:	49 8b 19             	mov    rbx,QWORD PTR [r9]
   140383fa3:	41 8b c0             	mov    eax,r8d
   140383fa6:	44 8b 14 83          	mov    r10d,DWORD PTR [rbx+rax*4]
   140383faa:	48 63 05 ff 61 60 00 	movsxd rax,DWORD PTR [rip+0x6061ff]        # 0x14098a1b0
   140383fb1:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140383fb8:	4b 8d 0c d2          	lea    rcx,[r10+r10*8]
   140383fbc:	48 03 c9             	add    rcx,rcx
   140383fbf:	4a 8b 04 30          	mov    rax,QWORD PTR [rax+r14*1]
   140383fc3:	4c 8b 5c c8 30       	mov    r11,QWORD PTR [rax+rcx*8+0x30]
   140383fc8:	4d 85 db             	test   r11,r11
   140383fcb:	74 18                	je     0x140383fe5
   140383fcd:	66 45 39 7b 20       	cmp    WORD PTR [r11+0x20],r15w
   140383fd2:	8b c5                	mov    eax,ebp
   140383fd4:	66 41 0f 45 43 20    	cmovne ax,WORD PTR [r11+0x20]
   140383fda:	66 42 3b 04 27       	cmp    ax,WORD PTR [rdi+r12*1]
   140383fdf:	75 04                	jne    0x140383fe5
   140383fe1:	ff c2                	inc    edx
   140383fe3:	eb 14                	jmp    0x140383ff9
   140383fe5:	85 d2                	test   edx,edx
   140383fe7:	74 10                	je     0x140383ff9
   140383fe9:	41 8b c0             	mov    eax,r8d
   140383fec:	2b c2                	sub    eax,edx
   140383fee:	44 89 14 83          	mov    DWORD PTR [rbx+rax*4],r10d
   140383ff2:	4c 8b 0d d7 5e 60 00 	mov    r9,QWORD PTR [rip+0x605ed7]        # 0x140989ed0
   140383ff9:	41 ff c0             	inc    r8d
   140383ffc:	45 3b 41 08          	cmp    r8d,DWORD PTR [r9+0x8]
   140384000:	72 9e                	jb     0x140383fa0
   140384002:	41 29 51 08          	sub    DWORD PTR [r9+0x8],edx
   140384006:	4c 8b 0d c3 5e 60 00 	mov    r9,QWORD PTR [rip+0x605ec3]        # 0x140989ed0
   14038400d:	85 d2                	test   edx,edx
   14038400f:	74 23                	je     0x140384034
   140384011:	41 39 69 08          	cmp    DWORD PTR [r9+0x8],ebp
   140384015:	75 1d                	jne    0x140384034
   140384017:	41 c7 41 14 00 00 80 	mov    DWORD PTR [r9+0x14],0xbf800000
   14038401e:	bf 
   14038401f:	48 8b 05 aa 5e 60 00 	mov    rax,QWORD PTR [rip+0x605eaa]        # 0x140989ed0
   140384026:	c7 40 10 00 00 80 bf 	mov    DWORD PTR [rax+0x10],0xbf800000
   14038402d:	4c 8b 0d 9c 5e 60 00 	mov    r9,QWORD PTR [rip+0x605e9c]        # 0x140989ed0
   140384034:	48 63 05 75 61 60 00 	movsxd rax,DWORD PTR [rip+0x606175]        # 0x14098a1b0
   14038403b:	66 ff c6             	inc    si
   14038403e:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140384045:	66 42 3b b4 31 60 41 	cmp    si,WORD PTR [rcx+r14*1+0x64160]
   14038404c:	06 00 
   14038404e:	0f 82 1e ff ff ff    	jb     0x140383f72
   140384054:	4c 8b 7c 24 20       	mov    r15,QWORD PTR [rsp+0x20]
   140384059:	4c 8b 64 24 30       	mov    r12,QWORD PTR [rsp+0x30]
   14038405e:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   140384063:	48 8b 5c 24 40       	mov    rbx,QWORD PTR [rsp+0x40]
   140384068:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   14038406d:	e8 3e 63 fd ff       	call   0x14035a3b0
   140384072:	b1 01                	mov    cl,0x1
   140384074:	e8 a7 64 0a 00       	call   0x14042a520
   140384079:	4c 8b 74 24 28       	mov    r14,QWORD PTR [rsp+0x28]
   14038407e:	48 8b 74 24 50       	mov    rsi,QWORD PTR [rsp+0x50]
   140384083:	48 8b 6c 24 48       	mov    rbp,QWORD PTR [rsp+0x48]
   140384088:	48 83 c4 38          	add    rsp,0x38
   14038408c:	c3                   	ret
   14038408d:	cc                   	int3
   14038408e:	cc                   	int3
   14038408f:	cc                   	int3
   140384090:	cc                   	int3
   140384091:	cc                   	int3
   140384092:	cc                   	int3
   140384093:	cc                   	int3
   140384094:	cc                   	int3
   140384095:	cc                   	int3
   140384096:	cc                   	int3
   140384097:	cc                   	int3
   140384098:	cc                   	int3
   140384099:	cc                   	int3
   14038409a:	cc                   	int3
   14038409b:	cc                   	int3
   14038409c:	cc                   	int3
   14038409d:	cc                   	int3
   14038409e:	cc                   	int3
   14038409f:	cc                   	int3
   1403840a0:	48 8b c4             	mov    rax,rsp
   1403840a3:	55                   	push   rbp
   1403840a4:	53                   	push   rbx
   1403840a5:	56                   	push   rsi
   1403840a6:	57                   	push   rdi
   1403840a7:	41 54                	push   r12
   1403840a9:	41 55                	push   r13
   1403840ab:	41 56                	push   r14
   1403840ad:	41 57                	push   r15
   1403840af:	48 8d 68 a1          	lea    rbp,[rax-0x5f]
   1403840b3:	48 81 ec e8 00 00 00 	sub    rsp,0xe8
   1403840ba:	48 c7 45 d7 fe ff ff 	mov    QWORD PTR [rbp-0x29],0xfffffffffffffffe
   1403840c1:	ff 
   1403840c2:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   1403840c6:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   1403840ca:	44 0f 29 40 88       	movaps XMMWORD PTR [rax-0x78],xmm8
   1403840cf:	48 63 05 da 60 60 00 	movsxd rax,DWORD PTR [rip+0x6060da]        # 0x14098a1b0
   1403840d6:	85 c0                	test   eax,eax
   1403840d8:	0f 88 21 07 00 00    	js     0x1403847ff
   1403840de:	3b 05 ec cc 62 14    	cmp    eax,DWORD PTR [rip+0x1462ccec]        # 0x1549b0dd0
   1403840e4:	0f 8d 15 07 00 00    	jge    0x1403847ff
   1403840ea:	33 ff                	xor    edi,edi
   1403840ec:	8b cf                	mov    ecx,edi
   1403840ee:	4c 69 c0 78 ab 06 00 	imul   r8,rax,0x6ab78
   1403840f5:	48 8d 05 d4 64 60 00 	lea    rax,[rip+0x6064d4]        # 0x14098a5d0
   1403840fc:	41 0f b7 94 00 60 41 	movzx  edx,WORD PTR [r8+rax*1+0x64160]
   140384103:	06 00 
   140384105:	85 d2                	test   edx,edx
   140384107:	0f 84 f2 06 00 00    	je     0x1403847ff
   14038410d:	48 05 6c 91 03 00    	add    rax,0x3916c
   140384113:	49 03 c0             	add    rax,r8
   140384116:	f7 00 00 04 00 00    	test   DWORD PTR [rax],0x400
   14038411c:	75 11                	jne    0x14038412f
   14038411e:	ff c1                	inc    ecx
   140384120:	48 05 58 01 00 00    	add    rax,0x158
   140384126:	3b ca                	cmp    ecx,edx
   140384128:	72 ec                	jb     0x140384116
   14038412a:	e9 d0 06 00 00       	jmp    0x1403847ff
   14038412f:	85 c9                	test   ecx,ecx
   140384131:	0f 88 c8 06 00 00    	js     0x1403847ff
   140384137:	f3 0f 10 05 01 4f 5b 	movss  xmm0,DWORD PTR [rip+0x5b4f01]        # 0x140939040
   14038413e:	00 
   14038413f:	f3 0f 10 15 9d 2f 31 	movss  xmm2,DWORD PTR [rip+0x312f9d]        # 0x1406970e4
   140384146:	00 
   140384147:	f3 0f 58 c2          	addss  xmm0,xmm2
   14038414b:	0f 2f 05 8a 55 5b 00 	comiss xmm0,DWORD PTR [rip+0x5b558a]        # 0x1409396dc
   140384152:	72 1d                	jb     0x140384171
   140384154:	f3 0f 10 0d e8 4e 5b 	movss  xmm1,DWORD PTR [rip+0x5b4ee8]        # 0x140939044
   14038415b:	00 
   14038415c:	f3 0f 5c ca          	subss  xmm1,xmm2
   140384160:	f3 0f 10 05 78 55 5b 	movss  xmm0,DWORD PTR [rip+0x5b5578]        # 0x1409396e0
   140384167:	00 
   140384168:	0f 2f c1             	comiss xmm0,xmm1
   14038416b:	0f 83 8e 06 00 00    	jae    0x1403847ff
   140384171:	48 89 7d a7          	mov    QWORD PTR [rbp-0x59],rdi
   140384175:	48 89 7c 24 48       	mov    QWORD PTR [rsp+0x48],rdi
   14038417a:	48 89 7d 7f          	mov    QWORD PTR [rbp+0x7f],rdi
   14038417e:	48 89 7c 24 40       	mov    QWORD PTR [rsp+0x40],rdi
   140384183:	ba ff ff ff ff       	mov    edx,0xffffffff
   140384188:	48 8b 0d c1 af 5f 00 	mov    rcx,QWORD PTR [rip+0x5fafc1]        # 0x14097f150
   14038418f:	ff 15 bb 44 30 00    	call   QWORD PTR [rip+0x3044bb]        # 0x140688650
   140384195:	f3 0f 10 0d 2b 92 44 	movss  xmm1,DWORD PTR [rip+0x1744922b]        # 0x1577cd3c8
   14038419c:	17 
   14038419d:	0f 5a c9             	cvtps2pd xmm1,xmm1
   1403841a0:	f3 0f 10 05 1c 92 44 	movss  xmm0,DWORD PTR [rip+0x1744921c]        # 0x1577cd3c4
   1403841a7:	17 
   1403841a8:	0f 5a c0             	cvtps2pd xmm0,xmm0
   1403841ab:	c6 44 24 30 01       	mov    BYTE PTR [rsp+0x30],0x1
   1403841b0:	48 8d 44 24 40       	lea    rax,[rsp+0x40]
   1403841b5:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   1403841ba:	48 8d 44 24 48       	lea    rax,[rsp+0x48]
   1403841bf:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   1403841c4:	4c 8d 4d a7          	lea    r9,[rbp-0x59]
   1403841c8:	4c 8d 45 7f          	lea    r8,[rbp+0x7f]
   1403841cc:	e8 bf a9 11 00       	call   0x14049eb90
   1403841d1:	0f b7 d8             	movzx  ebx,ax
   1403841d4:	0f 57 ff             	xorps  xmm7,xmm7
   1403841d7:	45 0f 57 c0          	xorps  xmm8,xmm8
   1403841db:	0f 57 c0             	xorps  xmm0,xmm0
   1403841de:	f3 0f 7f 45 87       	movdqu XMMWORD PTR [rbp-0x79],xmm0
   1403841e3:	48 89 7d 97          	mov    QWORD PTR [rbp-0x69],rdi
   1403841e7:	ba 00 01 00 00       	mov    edx,0x100
   1403841ec:	48 8d 4d 87          	lea    rcx,[rbp-0x79]
   1403841f0:	e8 bb 3e 00 00       	call   0x1403880b0
   1403841f5:	89 5d 77             	mov    DWORD PTR [rbp+0x77],ebx
   1403841f8:	45 33 db             	xor    r11d,r11d
   1403841fb:	45 8b d3             	mov    r10d,r11d
   1403841fe:	44 89 5d 6f          	mov    DWORD PTR [rbp+0x6f],r11d
   140384202:	85 db                	test   ebx,ebx
   140384204:	0f 84 0c 02 00 00    	je     0x140384416
   14038420a:	45 8b fb             	mov    r15d,r11d
   14038420d:	41 8d 5b 01          	lea    ebx,[r11+0x1]
   140384211:	48 8b 4c 24 48       	mov    rcx,QWORD PTR [rsp+0x48]
   140384216:	8b 35 94 5f 60 00    	mov    esi,DWORD PTR [rip+0x605f94]        # 0x14098a1b0
   14038421c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140384220:	48 8b 45 a7          	mov    rax,QWORD PTR [rbp-0x59]
   140384224:	4e 63 2c b8          	movsxd r13,DWORD PTR [rax+r15*4]
   140384228:	46 3b 2c b9          	cmp    r13d,DWORD PTR [rcx+r15*4]
   14038422c:	0f 8f d0 01 00 00    	jg     0x140384402
   140384232:	49 8b fd             	mov    rdi,r13
   140384235:	4c 89 6d af          	mov    QWORD PTR [rbp-0x51],r13
   140384239:	4f 8d 24 7f          	lea    r12,[r15+r15*2]
   14038423d:	0f 1f 00             	nop    DWORD PTR [rax]
   140384240:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   140384245:	4e 8d 04 e0          	lea    r8,[rax+r12*8]
   140384249:	49 8b 00             	mov    rax,QWORD PTR [r8]
   14038424c:	48 85 c0             	test   rax,rax
   14038424f:	74 0a                	je     0x14038425b
   140384251:	48 8b 40 08          	mov    rax,QWORD PTR [rax+0x8]
   140384255:	44 8b 0c b8          	mov    r9d,DWORD PTR [rax+rdi*4]
   140384259:	eb 03                	jmp    0x14038425e
   14038425b:	45 8b cd             	mov    r9d,r13d
   14038425e:	45 85 c9             	test   r9d,r9d
   140384261:	0f 88 87 01 00 00    	js     0x1403843ee
   140384267:	48 8b 45 7f          	mov    rax,QWORD PTR [rbp+0x7f]
   14038426b:	4a 63 0c b8          	movsxd rcx,DWORD PTR [rax+r15*4]
   14038426f:	48 69 d1 78 ab 06 00 	imul   rdx,rcx,0x6ab78
   140384276:	49 63 c1             	movsxd rax,r9d
   140384279:	4c 8d 34 c0          	lea    r14,[rax+rax*8]
   14038427d:	49 c1 e6 04          	shl    r14,0x4
   140384281:	48 8d 05 48 63 60 00 	lea    rax,[rip+0x606348]        # 0x14098a5d0
   140384288:	4c 03 34 02          	add    r14,QWORD PTR [rdx+rax*1]
   14038428c:	33 c0                	xor    eax,eax
   14038428e:	48 89 45 b7          	mov    QWORD PTR [rbp-0x49],rax
   140384292:	48 89 45 bf          	mov    QWORD PTR [rbp-0x41],rax
   140384296:	48 89 45 c7          	mov    QWORD PTR [rbp-0x39],rax
   14038429a:	48 89 45 cf          	mov    QWORD PTR [rbp-0x31],rax
   14038429e:	66 89 5d d1          	mov    WORD PTR [rbp-0x2f],bx
   1403842a2:	32 db                	xor    bl,bl
   1403842a4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403842a8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1403842af:	00 
   1403842b0:	0f 28 cf             	movaps xmm1,xmm7
   1403842b3:	f3 0f 11 7d b7       	movss  DWORD PTR [rbp-0x49],xmm7
   1403842b8:	49 83 38 00          	cmp    QWORD PTR [r8],0x0
   1403842bc:	74 37                	je     0x1403842f5
   1403842be:	41 8b c2             	mov    eax,r10d
   1403842c1:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   1403842c5:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   1403842ca:	48 8d 14 c8          	lea    rdx,[rax+rcx*8]
   1403842ce:	48 8b 45 7f          	mov    rax,QWORD PTR [rbp+0x7f]
   1403842d2:	46 8b 04 b8          	mov    r8d,DWORD PTR [rax+r15*4]
   1403842d6:	48 8d 4d b7          	lea    rcx,[rbp-0x49]
   1403842da:	e8 a1 ee fd ff       	call   0x140363180
   1403842df:	8b 35 cb 5e 60 00    	mov    esi,DWORD PTR [rip+0x605ecb]        # 0x14098a1b0
   1403842e5:	84 c0                	test   al,al
   1403842e7:	0f 84 ed 00 00 00    	je     0x1403843da
   1403842ed:	f3 0f 10 4d b7       	movss  xmm1,DWORD PTR [rbp-0x49]
   1403842f2:	45 33 db             	xor    r11d,r11d
   1403842f5:	0f 28 d1             	movaps xmm2,xmm1
   1403842f8:	f3 41 0f 58 56 10    	addss  xmm2,DWORD PTR [r14+0x10]
   1403842fe:	f3 41 0f 58 4e 14    	addss  xmm1,DWORD PTR [r14+0x14]
   140384304:	f3 0f 10 05 b8 90 44 	movss  xmm0,DWORD PTR [rip+0x174490b8]        # 0x1577cd3c4
   14038430b:	17 
   14038430c:	0f 2f c1             	comiss xmm0,xmm1
   14038430f:	0f 83 c3 04 00 00    	jae    0x1403847d8
   140384315:	0f 2f 15 ac 90 44 17 	comiss xmm2,DWORD PTR [rip+0x174490ac]        # 0x1577cd3c8
   14038431c:	0f 87 b8 00 00 00    	ja     0x1403843da
   140384322:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   140384327:	4a 83 3c e0 00       	cmp    QWORD PTR [rax+r12*8],0x0
   14038432c:	74 17                	je     0x140384345
   14038432e:	f3 42 0f 10 44 e0 08 	movss  xmm0,DWORD PTR [rax+r12*8+0x8]
   140384335:	0f 2e c7             	ucomiss xmm0,xmm7
   140384338:	7a 02                	jp     0x14038433c
   14038433a:	74 09                	je     0x140384345
   14038433c:	0f 2f d0             	comiss xmm2,xmm0
   14038433f:	0f 87 95 00 00 00    	ja     0x1403843da
   140384345:	49 8b 7e 30          	mov    rdi,QWORD PTR [r14+0x30]
   140384349:	48 85 ff             	test   rdi,rdi
   14038434c:	0f 84 88 00 00 00    	je     0x1403843da
   140384352:	66 83 bf 1c 02 00 00 	cmp    WORD PTR [rdi+0x21c],0x0
   140384359:	00 
   14038435a:	7c 7e                	jl     0x1403843da
   14038435c:	84 db                	test   bl,bl
   14038435e:	0f 85 05 04 00 00    	jne    0x140384769
   140384364:	48 8b 45 7f          	mov    rax,QWORD PTR [rbp+0x7f]
   140384368:	42 8b 1c b8          	mov    ebx,DWORD PTR [rax+r15*4]
   14038436c:	80 3d 44 5e 60 00 00 	cmp    BYTE PTR [rip+0x605e44],0x0        # 0x14098a1b7
   140384373:	75 0a                	jne    0x14038437f
   140384375:	41 f7 46 44 00 01 00 	test   DWORD PTR [r14+0x44],0x100
   14038437c:	00 
   14038437d:	75 5b                	jne    0x1403843da
   14038437f:	83 fb ff             	cmp    ebx,0xffffffff
   140384382:	0f 44 de             	cmove  ebx,esi
   140384385:	48 85 ff             	test   rdi,rdi
   140384388:	74 06                	je     0x140384390
   14038438a:	0f b7 47 20          	movzx  eax,WORD PTR [rdi+0x20]
   14038438e:	eb 03                	jmp    0x140384393
   140384390:	41 8b c3             	mov    eax,r11d
   140384393:	41 8b cb             	mov    ecx,r11d
   140384396:	41 b8 ff ff 00 00    	mov    r8d,0xffff
   14038439c:	66 41 3b c0          	cmp    ax,r8w
   1403843a0:	66 0f 45 c8          	cmovne cx,ax
   1403843a4:	3b de                	cmp    ebx,esi
   1403843a6:	0f 85 8f 01 00 00    	jne    0x14038453b
   1403843ac:	8d 41 ff             	lea    eax,[rcx-0x1]
   1403843af:	ba fe 03 00 00       	mov    edx,0x3fe
   1403843b4:	66 3b c2             	cmp    ax,dx
   1403843b7:	0f 87 7e 01 00 00    	ja     0x14038453b
   1403843bd:	48 8b 15 74 ad 5f 00 	mov    rdx,QWORD PTR [rip+0x5fad74]        # 0x14097f138
   1403843c4:	48 85 d2             	test   rdx,rdx
   1403843c7:	0f 84 6e 01 00 00    	je     0x14038453b
   1403843cd:	0f b7 c1             	movzx  eax,cx
   1403843d0:	80 3c 10 00          	cmp    BYTE PTR [rax+rdx*1],0x0
   1403843d4:	0f 85 89 02 00 00    	jne    0x140384663
   1403843da:	48 8b 4c 24 48       	mov    rcx,QWORD PTR [rsp+0x48]
   1403843df:	44 8b 55 6f          	mov    r10d,DWORD PTR [rbp+0x6f]
   1403843e3:	48 8b 7d af          	mov    rdi,QWORD PTR [rbp-0x51]
   1403843e7:	45 33 db             	xor    r11d,r11d
   1403843ea:	41 8d 5b 01          	lea    ebx,[r11+0x1]
   1403843ee:	41 ff c5             	inc    r13d
   1403843f1:	48 ff c7             	inc    rdi
   1403843f4:	48 89 7d af          	mov    QWORD PTR [rbp-0x51],rdi
   1403843f8:	46 3b 2c b9          	cmp    r13d,DWORD PTR [rcx+r15*4]
   1403843fc:	0f 8e 3e fe ff ff    	jle    0x140384240
   140384402:	41 ff c2             	inc    r10d
   140384405:	44 89 55 6f          	mov    DWORD PTR [rbp+0x6f],r10d
   140384409:	49 ff c7             	inc    r15
   14038440c:	44 3b 55 77          	cmp    r10d,DWORD PTR [rbp+0x77]
   140384410:	0f 82 0a fe ff ff    	jb     0x140384220
   140384416:	4c 8d 4c 24 40       	lea    r9,[rsp+0x40]
   14038441b:	4c 8d 44 24 48       	lea    r8,[rsp+0x48]
   140384420:	48 8d 55 a7          	lea    rdx,[rbp-0x59]
   140384424:	48 8d 4d 7f          	lea    rcx,[rbp+0x7f]
   140384428:	e8 a3 87 fd ff       	call   0x14035cbd0
   14038442d:	48 8b 0d 1c ad 5f 00 	mov    rcx,QWORD PTR [rip+0x5fad1c]        # 0x14097f150
   140384434:	ff 15 0e 42 30 00    	call   QWORD PTR [rip+0x30420e]        # 0x140688648
   14038443a:	4c 8b 45 87          	mov    r8,QWORD PTR [rbp-0x79]
   14038443e:	48 8b 55 8f          	mov    rdx,QWORD PTR [rbp-0x71]
   140384442:	4c 3b c2             	cmp    r8,rdx
   140384445:	0f 84 ac 00 00 00    	je     0x1403844f7
   14038444b:	41 0f 28 d8          	movaps xmm3,xmm8
   14038444f:	f3 0f 59 1d 55 bb 4c 	mulss  xmm3,DWORD PTR [rip+0x4cbb55]        # 0x14084ffac
   140384456:	00 
   140384457:	f3 0f 10 25 49 be 4c 	movss  xmm4,DWORD PTR [rip+0x4cbe49]        # 0x1408502a8
   14038445e:	00 
   14038445f:	0f 28 d4             	movaps xmm2,xmm4
   140384462:	0f 28 cf             	movaps xmm1,xmm7
   140384465:	45 32 c9             	xor    r9b,r9b
   140384468:	49 8b c8             	mov    rcx,r8
   14038446b:	33 ff                	xor    edi,edi
   14038446d:	0f 1f 00             	nop    DWORD PTR [rax]
   140384470:	44 0f 2f c7          	comiss xmm8,xmm7
   140384474:	76 11                	jbe    0x140384487
   140384476:	8b c7                	mov    eax,edi
   140384478:	f3 0f 10 41 04       	movss  xmm0,DWORD PTR [rcx+0x4]
   14038447d:	0f 2f c3             	comiss xmm0,xmm3
   140384480:	0f 93 c0             	setae  al
   140384483:	85 c0                	test   eax,eax
   140384485:	74 17                	je     0x14038449e
   140384487:	41 b1 01             	mov    r9b,0x1
   14038448a:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   14038448e:	0f 2f d0             	comiss xmm2,xmm0
   140384491:	76 03                	jbe    0x140384496
   140384493:	0f 28 d0             	movaps xmm2,xmm0
   140384496:	0f 2f c1             	comiss xmm0,xmm1
   140384499:	76 03                	jbe    0x14038449e
   14038449b:	0f 28 c8             	movaps xmm1,xmm0
   14038449e:	48 83 c1 08          	add    rcx,0x8
   1403844a2:	48 3b ca             	cmp    rcx,rdx
   1403844a5:	75 c9                	jne    0x140384470
   1403844a7:	45 84 c9             	test   r9b,r9b
   1403844aa:	75 31                	jne    0x1403844dd
   1403844ac:	0f 28 d7             	movaps xmm2,xmm7
   1403844af:	f3 0f 10 1d 39 be 4c 	movss  xmm3,DWORD PTR [rip+0x4cbe39]        # 0x1408502f0
   1403844b6:	00 
   1403844b7:	49 8b c0             	mov    rax,r8
   1403844ba:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   1403844c0:	f3 0f 10 40 04       	movss  xmm0,DWORD PTR [rax+0x4]
   1403844c5:	0f 2f c3             	comiss xmm0,xmm3
   1403844c8:	76 07                	jbe    0x1403844d1
   1403844ca:	0f 28 d8             	movaps xmm3,xmm0
   1403844cd:	f3 0f 10 10          	movss  xmm2,DWORD PTR [rax]
   1403844d1:	48 83 c0 08          	add    rax,0x8
   1403844d5:	48 3b c2             	cmp    rax,rdx
   1403844d8:	75 e6                	jne    0x1403844c0
   1403844da:	0f 28 ca             	movaps xmm1,xmm2
   1403844dd:	0f 2e cf             	ucomiss xmm1,xmm7
   1403844e0:	7a 09                	jp     0x1403844eb
   1403844e2:	75 07                	jne    0x1403844eb
   1403844e4:	0f 2e d4             	ucomiss xmm2,xmm4
   1403844e7:	7a 02                	jp     0x1403844eb
   1403844e9:	74 0c                	je     0x1403844f7
   1403844eb:	0f 28 c2             	movaps xmm0,xmm2
   1403844ee:	e8 6d c5 ff ff       	call   0x140380a60
   1403844f3:	4c 8b 45 87          	mov    r8,QWORD PTR [rbp-0x79]
   1403844f7:	4d 85 c0             	test   r8,r8
   1403844fa:	0f 84 ff 02 00 00    	je     0x1403847ff
   140384500:	48 8b 55 97          	mov    rdx,QWORD PTR [rbp-0x69]
   140384504:	49 2b d0             	sub    rdx,r8
   140384507:	48 83 e2 f8          	and    rdx,0xfffffffffffffff8
   14038450b:	49 8b c0             	mov    rax,r8
   14038450e:	48 81 fa 00 10 00 00 	cmp    rdx,0x1000
   140384515:	0f 82 dc 02 00 00    	jb     0x1403847f7
   14038451b:	48 83 c2 27          	add    rdx,0x27
   14038451f:	4d 8b 40 f8          	mov    r8,QWORD PTR [r8-0x8]
   140384523:	49 2b c0             	sub    rax,r8
   140384526:	48 83 c0 f8          	add    rax,0xfffffffffffffff8
   14038452a:	48 83 f8 1f          	cmp    rax,0x1f
   14038452e:	0f 86 c3 02 00 00    	jbe    0x1403847f7
   140384534:	ff 15 ae 56 30 00    	call   QWORD PTR [rip+0x3056ae]        # 0x140689be8
   14038453a:	90                   	nop
   14038453b:	0f b7 c9             	movzx  ecx,cx
   14038453e:	8b d3                	mov    edx,ebx
   140384540:	e8 4b a4 ed ff       	call   0x14025e990
   140384545:	4c 8b d0             	mov    r10,rax
   140384548:	48 85 c0             	test   rax,rax
   14038454b:	0f 84 85 00 00 00    	je     0x1403845d6
   140384551:	3b de                	cmp    ebx,esi
   140384553:	75 27                	jne    0x14038457c
   140384555:	80 3d 11 1e b8 14 00 	cmp    BYTE PTR [rip+0x14b81e11],0x0        # 0x154f0636d
   14038455c:	74 0b                	je     0x140384569
   14038455e:	41 f6 42 0c 08       	test   BYTE PTR [r10+0xc],0x8
   140384563:	0f 84 71 fe ff ff    	je     0x1403843da
   140384569:	41 f6 42 0c 02       	test   BYTE PTR [r10+0xc],0x2
   14038456e:	0f 85 66 fe ff ff    	jne    0x1403843da
   140384574:	45 33 db             	xor    r11d,r11d
   140384577:	e9 e1 00 00 00       	jmp    0x14038465d
   14038457c:	85 db                	test   ebx,ebx
   14038457e:	79 06                	jns    0x140384586
   140384580:	8b de                	mov    ebx,esi
   140384582:	85 f6                	test   esi,esi
   140384584:	78 e3                	js     0x140384569
   140384586:	3b 1d 44 c8 62 14    	cmp    ebx,DWORD PTR [rip+0x1462c844]        # 0x1549b0dd0
   14038458c:	7d db                	jge    0x140384569
   14038458e:	33 ff                	xor    edi,edi
   140384590:	0f b7 d7             	movzx  edx,di
   140384593:	48 63 c3             	movsxd rax,ebx
   140384596:	4c 69 c8 78 ab 06 00 	imul   r9,rax,0x6ab78
   14038459d:	4c 8d 1d 2c 60 60 00 	lea    r11,[rip+0x60602c]        # 0x14098a5d0
   1403845a4:	47 0f b7 84 19 60 41 	movzx  r8d,WORD PTR [r9+r11*1+0x64160]
   1403845ab:	06 00 
   1403845ad:	66 41 3b f8          	cmp    di,r8w
   1403845b1:	73 b6                	jae    0x140384569
   1403845b3:	0f b7 c2             	movzx  eax,dx
   1403845b6:	48 69 c8 58 01 00 00 	imul   rcx,rax,0x158
   1403845bd:	49 03 c9             	add    rcx,r9
   1403845c0:	42 f6 84 19 6c 91 03 	test   BYTE PTR [rcx+r11*1+0x3916c],0x8
   1403845c7:	00 08 
   1403845c9:	75 93                	jne    0x14038455e
   1403845cb:	66 ff c2             	inc    dx
   1403845ce:	66 41 3b d0          	cmp    dx,r8w
   1403845d2:	72 df                	jb     0x1403845b3
   1403845d4:	eb 93                	jmp    0x140384569
   1403845d6:	48 85 ff             	test   rdi,rdi
   1403845d9:	0f 84 fb fd ff ff    	je     0x1403843da
   1403845df:	80 3d ea 1a b8 14 00 	cmp    BYTE PTR [rip+0x14b81aea],0x0        # 0x154f060d0
   1403845e6:	0f 85 ee fd ff ff    	jne    0x1403843da
   1403845ec:	b8 ff ff 00 00       	mov    eax,0xffff
   1403845f1:	66 89 47 20          	mov    WORD PTR [rdi+0x20],ax
   1403845f5:	45 33 db             	xor    r11d,r11d
   1403845f8:	41 0f b7 d3          	movzx  edx,r11w
   1403845fc:	48 63 c3             	movsxd rax,ebx
   1403845ff:	4c 69 c8 78 ab 06 00 	imul   r9,rax,0x6ab78
   140384606:	4c 8d 15 c3 5f 60 00 	lea    r10,[rip+0x605fc3]        # 0x14098a5d0
   14038460d:	47 0f b7 84 11 60 41 	movzx  r8d,WORD PTR [r9+r10*1+0x64160]
   140384614:	06 00 
   140384616:	66 45 3b d8          	cmp    r11w,r8w
   14038461a:	73 2a                	jae    0x140384646
   14038461c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140384620:	0f b7 c2             	movzx  eax,dx
   140384623:	48 69 c8 58 01 00 00 	imul   rcx,rax,0x158
   14038462a:	49 03 c9             	add    rcx,r9
   14038462d:	49 8d ba 60 91 03 00 	lea    rdi,[r10+0x39160]
   140384634:	48 03 f9             	add    rdi,rcx
   140384637:	66 44 39 1f          	cmp    WORD PTR [rdi],r11w
   14038463b:	74 5e                	je     0x14038469b
   14038463d:	66 ff c2             	inc    dx
   140384640:	66 41 3b d0          	cmp    dx,r8w
   140384644:	72 da                	jb     0x140384620
   140384646:	8b 35 64 5b 60 00    	mov    esi,DWORD PTR [rip+0x605b64]        # 0x14098a1b0
   14038464c:	3b de                	cmp    ebx,esi
   14038464e:	75 0d                	jne    0x14038465d
   140384650:	44 38 1d 16 1d b8 14 	cmp    BYTE PTR [rip+0x14b81d16],r11b        # 0x154f0636d
   140384657:	0f 85 7d fd ff ff    	jne    0x1403843da
   14038465d:	41 b8 ff ff 00 00    	mov    r8d,0xffff
   140384663:	48 8b 45 7f          	mov    rax,QWORD PTR [rbp+0x7f]
   140384667:	42 8b 14 b8          	mov    edx,DWORD PTR [rax+r15*4]
   14038466b:	41 f7 46 44 00 04 00 	test   DWORD PTR [r14+0x44],0x400
   140384672:	00 
   140384673:	0f 85 61 fd ff ff    	jne    0x1403843da
   140384679:	80 3d 65 8d 44 17 00 	cmp    BYTE PTR [rip+0x17448d65],0x0        # 0x1577cd3e5
   140384680:	0f 85 e3 00 00 00    	jne    0x140384769
   140384686:	83 fa ff             	cmp    edx,0xffffffff
   140384689:	0f 44 d6             	cmove  edx,esi
   14038468c:	49 8b 46 30          	mov    rax,QWORD PTR [r14+0x30]
   140384690:	48 85 c0             	test   rax,rax
   140384693:	74 3c                	je     0x1403846d1
   140384695:	0f b7 40 20          	movzx  eax,WORD PTR [rax+0x20]
   140384699:	eb 39                	jmp    0x1403846d4
   14038469b:	48 85 ff             	test   rdi,rdi
   14038469e:	74 a6                	je     0x140384646
   1403846a0:	8b 35 0a 5b 60 00    	mov    esi,DWORD PTR [rip+0x605b0a]        # 0x14098a1b0
   1403846a6:	3b de                	cmp    ebx,esi
   1403846a8:	75 09                	jne    0x1403846b3
   1403846aa:	0f b6 05 bc 1c b8 14 	movzx  eax,BYTE PTR [rip+0x14b81cbc]        # 0x154f0636d
   1403846b1:	eb 0a                	jmp    0x1403846bd
   1403846b3:	8b cb                	mov    ecx,ebx
   1403846b5:	e8 76 85 ff ff       	call   0x14037cc30
   1403846ba:	45 33 db             	xor    r11d,r11d
   1403846bd:	84 c0                	test   al,al
   1403846bf:	74 0a                	je     0x1403846cb
   1403846c1:	f6 47 0c 08          	test   BYTE PTR [rdi+0xc],0x8
   1403846c5:	0f 84 0f fd ff ff    	je     0x1403843da
   1403846cb:	f6 47 0c 02          	test   BYTE PTR [rdi+0xc],0x2
   1403846cf:	eb 86                	jmp    0x140384657
   1403846d1:	41 8b c3             	mov    eax,r11d
   1403846d4:	45 8b d3             	mov    r10d,r11d
   1403846d7:	66 41 3b c0          	cmp    ax,r8w
   1403846db:	66 44 0f 45 d0       	cmovne r10w,ax
   1403846e0:	85 d2                	test   edx,edx
   1403846e2:	79 06                	jns    0x1403846ea
   1403846e4:	8b d6                	mov    edx,esi
   1403846e6:	85 f6                	test   esi,esi
   1403846e8:	78 7f                	js     0x140384769
   1403846ea:	3b 15 e0 c6 62 14    	cmp    edx,DWORD PTR [rip+0x1462c6e0]        # 0x1549b0dd0
   1403846f0:	7d 77                	jge    0x140384769
   1403846f2:	8b c2                	mov    eax,edx
   1403846f4:	85 d2                	test   edx,edx
   1403846f6:	79 06                	jns    0x1403846fe
   1403846f8:	8b c6                	mov    eax,esi
   1403846fa:	85 f6                	test   esi,esi
   1403846fc:	78 6b                	js     0x140384769
   1403846fe:	3b 05 cc c6 62 14    	cmp    eax,DWORD PTR [rip+0x1462c6cc]        # 0x1549b0dd0
   140384704:	7d 63                	jge    0x140384769
   140384706:	41 8b cb             	mov    ecx,r11d
   140384709:	48 98                	cdqe
   14038470b:	4c 69 c8 78 ab 06 00 	imul   r9,rax,0x6ab78
   140384712:	48 8d 05 b7 5e 60 00 	lea    rax,[rip+0x605eb7]        # 0x14098a5d0
   140384719:	45 0f b7 84 01 60 41 	movzx  r8d,WORD PTR [r9+rax*1+0x64160]
   140384720:	06 00 
   140384722:	45 85 c0             	test   r8d,r8d
   140384725:	74 42                	je     0x140384769
   140384727:	48 05 6c 91 03 00    	add    rax,0x3916c
   14038472d:	49 03 c1             	add    rax,r9
   140384730:	f7 00 00 04 00 00    	test   DWORD PTR [rax],0x400
   140384736:	75 0f                	jne    0x140384747
   140384738:	ff c1                	inc    ecx
   14038473a:	48 05 58 01 00 00    	add    rax,0x158
   140384740:	41 3b c8             	cmp    ecx,r8d
   140384743:	72 eb                	jb     0x140384730
   140384745:	eb 22                	jmp    0x140384769
   140384747:	85 c9                	test   ecx,ecx
   140384749:	78 1e                	js     0x140384769
   14038474b:	41 0f b7 ca          	movzx  ecx,r10w
   14038474f:	e8 dc 97 ff ff       	call   0x14037df30
   140384754:	48 85 c0             	test   rax,rax
   140384757:	74 10                	je     0x140384769
   140384759:	8b 40 0c             	mov    eax,DWORD PTR [rax+0xc]
   14038475c:	c1 e8 0a             	shr    eax,0xa
   14038475f:	f6 d0                	not    al
   140384761:	24 01                	and    al,0x1
   140384763:	0f 85 71 fc ff ff    	jne    0x1403843da
   140384769:	b3 01                	mov    bl,0x1
   14038476b:	41 f6 46 44 02       	test   BYTE PTR [r14+0x44],0x2
   140384770:	74 10                	je     0x140384782
   140384772:	48 8b 45 7f          	mov    rax,QWORD PTR [rbp+0x7f]
   140384776:	42 8b 14 b8          	mov    edx,DWORD PTR [rax+r15*4]
   14038477a:	49 8b ce             	mov    rcx,r14
   14038477d:	e8 3e 93 ee ff       	call   0x14026dac0
   140384782:	f3 41 0f 10 46 24    	movss  xmm0,DWORD PTR [r14+0x24]
   140384788:	41 8b 46 28          	mov    eax,DWORD PTR [r14+0x28]
   14038478c:	0f 57 f6             	xorps  xmm6,xmm6
   14038478f:	f3 48 0f 2a f0       	cvtsi2ss xmm6,rax
   140384794:	f3 0f 11 45 9f       	movss  DWORD PTR [rbp-0x61],xmm0
   140384799:	f3 0f 11 75 a3       	movss  DWORD PTR [rbp-0x5d],xmm6
   14038479e:	48 8b 45 8f          	mov    rax,QWORD PTR [rbp-0x71]
   1403847a2:	48 39 45 97          	cmp    QWORD PTR [rbp-0x69],rax
   1403847a6:	74 10                	je     0x1403847b8
   1403847a8:	f2 0f 10 45 9f       	movsd  xmm0,QWORD PTR [rbp-0x61]
   1403847ad:	f2 0f 11 00          	movsd  QWORD PTR [rax],xmm0
   1403847b1:	48 83 45 8f 08       	add    QWORD PTR [rbp-0x71],0x8
   1403847b6:	eb 11                	jmp    0x1403847c9
   1403847b8:	4c 8d 45 9f          	lea    r8,[rbp-0x61]
   1403847bc:	48 8b 55 8f          	mov    rdx,QWORD PTR [rbp-0x71]
   1403847c0:	48 8d 4d 87          	lea    rcx,[rbp-0x79]
   1403847c4:	e8 97 32 00 00       	call   0x140387a60
   1403847c9:	f3 41 0f 5f f0       	maxss  xmm6,xmm8
   1403847ce:	44 0f 28 c6          	movaps xmm8,xmm6
   1403847d2:	8b 35 d8 59 60 00    	mov    esi,DWORD PTR [rip+0x6059d8]        # 0x14098a1b0
   1403847d8:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   1403847dd:	4e 8d 04 e0          	lea    r8,[rax+r12*8]
   1403847e1:	49 83 38 00          	cmp    QWORD PTR [r8],0x0
   1403847e5:	0f 84 ef fb ff ff    	je     0x1403843da
   1403847eb:	44 8b 55 6f          	mov    r10d,DWORD PTR [rbp+0x6f]
   1403847ef:	45 33 db             	xor    r11d,r11d
   1403847f2:	e9 b9 fa ff ff       	jmp    0x1403842b0
   1403847f7:	49 8b c8             	mov    rcx,r8
   1403847fa:	e8 59 6d 29 00       	call   0x14061b558
   1403847ff:	4c 8d 9c 24 e8 00 00 	lea    r11,[rsp+0xe8]
   140384806:	00 
   140384807:	41 0f 28 73 e8       	movaps xmm6,XMMWORD PTR [r11-0x18]
   14038480c:	41 0f 28 7b d8       	movaps xmm7,XMMWORD PTR [r11-0x28]
   140384811:	45 0f 28 43 c8       	movaps xmm8,XMMWORD PTR [r11-0x38]
   140384816:	49 8b e3             	mov    rsp,r11
   140384819:	41 5f                	pop    r15
   14038481b:	41 5e                	pop    r14
   14038481d:	41 5d                	pop    r13
   14038481f:	41 5c                	pop    r12
   140384821:	5f                   	pop    rdi
   140384822:	5e                   	pop    rsi
   140384823:	5b                   	pop    rbx
   140384824:	5d                   	pop    rbp
   140384825:	c3                   	ret
   140384826:	cc                   	int3
   140384827:	cc                   	int3
   140384828:	cc                   	int3
   140384829:	cc                   	int3
   14038482a:	cc                   	int3
   14038482b:	cc                   	int3
   14038482c:	cc                   	int3
   14038482d:	cc                   	int3
   14038482e:	cc                   	int3
   14038482f:	cc                   	int3
