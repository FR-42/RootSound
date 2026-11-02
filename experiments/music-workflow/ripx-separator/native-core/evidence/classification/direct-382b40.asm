
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140382b40 <.text+0x381b40>:
   140382b40:	0f b6 c2             	movzx  eax,dl
   140382b43:	4c 8b c1             	mov    r8,rcx
   140382b46:	83 c0 fe             	add    eax,0xfffffffe
   140382b49:	83 f8 7e             	cmp    eax,0x7e
   140382b4c:	77 76                	ja     0x140382bc4
   140382b4e:	48 8d 0d ab d4 c7 ff 	lea    rcx,[rip+0xffffffffffc7d4ab]        # 0x140000000
   140382b55:	48 98                	cdqe
   140382b57:	0f b6 84 01 ec 2b 38 	movzx  eax,BYTE PTR [rcx+rax*1+0x382bec]
   140382b5e:	00 
   140382b5f:	8b 94 81 c8 2b 38 00 	mov    edx,DWORD PTR [rcx+rax*4+0x382bc8]
   140382b66:	48 03 d1             	add    rdx,rcx
   140382b69:	ff e2                	jmp    rdx
   140382b6b:	b8 22 00 00 00       	mov    eax,0x22
   140382b70:	c3                   	ret
   140382b71:	b8 1f 00 00 00       	mov    eax,0x1f
   140382b76:	c3                   	ret
   140382b77:	b8 20 00 00 00       	mov    eax,0x20
   140382b7c:	c3                   	ret
   140382b7d:	b8 21 00 00 00       	mov    eax,0x21
   140382b82:	c3                   	ret
   140382b83:	b8 01 00 00 00       	mov    eax,0x1
   140382b88:	c3                   	ret
   140382b89:	66 41 83 78 14 00    	cmp    WORD PTR [r8+0x14],0x0
   140382b8f:	b8 14 00 00 00       	mov    eax,0x14
   140382b94:	b9 21 00 00 00       	mov    ecx,0x21
   140382b99:	66 0f 44 c1          	cmove  ax,cx
   140382b9d:	c3                   	ret
   140382b9e:	66 41 83 78 14 00    	cmp    WORD PTR [r8+0x14],0x0
   140382ba4:	b8 13 00 00 00       	mov    eax,0x13
   140382ba9:	b9 21 00 00 00       	mov    ecx,0x21
   140382bae:	66 0f 44 c1          	cmove  ax,cx
   140382bb2:	c3                   	ret
   140382bb3:	33 c0                	xor    eax,eax
   140382bb5:	b9 21 00 00 00       	mov    ecx,0x21
   140382bba:	66 41 39 40 14       	cmp    WORD PTR [r8+0x14],ax
   140382bbf:	66 0f 44 c1          	cmove  ax,cx
   140382bc3:	c3                   	ret
   140382bc4:	33 c0                	xor    eax,eax
   140382bc6:	c3                   	ret
   140382bc7:	90                   	nop
   140382bc8:	6b 2b 38             	imul   ebp,DWORD PTR [rbx],0x38
   140382bcb:	00 71 2b             	add    BYTE PTR [rcx+0x2b],dh
   140382bce:	38 00                	cmp    BYTE PTR [rax],al
   140382bd0:	77 2b                	ja     0x140382bfd
   140382bd2:	38 00                	cmp    BYTE PTR [rax],al
   140382bd4:	7d 2b                	jge    0x140382c01
   140382bd6:	38 00                	cmp    BYTE PTR [rax],al
   140382bd8:	83 2b 38             	sub    DWORD PTR [rbx],0x38
   140382bdb:	00 b3 2b 38 00 89    	add    BYTE PTR [rbx-0x76ffc7d5],dh
   140382be1:	2b 38                	sub    edi,DWORD PTR [rax]
   140382be3:	00 9e 2b 38 00 c4    	add    BYTE PTR [rsi-0x3bffc7d5],bl
   140382be9:	2b 38                	sub    edi,DWORD PTR [rax]
   140382beb:	00 00                	add    BYTE PTR [rax],al
   140382bed:	00 08                	add    BYTE PTR [rax],cl
   140382bef:	08 08                	or     BYTE PTR [rax],cl
   140382bf1:	08 08                	or     BYTE PTR [rax],cl
   140382bf3:	08 08                	or     BYTE PTR [rax],cl
   140382bf5:	08 08                	or     BYTE PTR [rax],cl
   140382bf7:	08 08                	or     BYTE PTR [rax],cl
   140382bf9:	08 01                	or     BYTE PTR [rcx],al
   140382bfb:	02 03                	add    al,BYTE PTR [rbx]
   140382bfd:	08 08                	or     BYTE PTR [rax],cl
   140382bff:	08 08                	or     BYTE PTR [rax],cl
   140382c01:	08 08                	or     BYTE PTR [rax],cl
   140382c03:	08 08                	or     BYTE PTR [rax],cl
   140382c05:	08 08                	or     BYTE PTR [rax],cl
   140382c07:	08 08                	or     BYTE PTR [rax],cl
   140382c09:	08 08                	or     BYTE PTR [rax],cl
   140382c0b:	08 08                	or     BYTE PTR [rax],cl
   140382c0d:	08 08                	or     BYTE PTR [rax],cl
   140382c0f:	08 08                	or     BYTE PTR [rax],cl
   140382c11:	08 08                	or     BYTE PTR [rax],cl
   140382c13:	08 08                	or     BYTE PTR [rax],cl
   140382c15:	08 08                	or     BYTE PTR [rax],cl
   140382c17:	08 08                	or     BYTE PTR [rax],cl
   140382c19:	08 08                	or     BYTE PTR [rax],cl
   140382c1b:	08 08                	or     BYTE PTR [rax],cl
   140382c1d:	08 08                	or     BYTE PTR [rax],cl
   140382c1f:	08 08                	or     BYTE PTR [rax],cl
   140382c21:	08 08                	or     BYTE PTR [rax],cl
   140382c23:	08 08                	or     BYTE PTR [rax],cl
   140382c25:	08 08                	or     BYTE PTR [rax],cl
   140382c27:	08 08                	or     BYTE PTR [rax],cl
   140382c29:	08 04 08             	or     BYTE PTR [rax+rcx*1],al
   140382c2c:	08 08                	or     BYTE PTR [rax],cl
   140382c2e:	08 08                	or     BYTE PTR [rax],cl
   140382c30:	08 08                	or     BYTE PTR [rax],cl
   140382c32:	08 08                	or     BYTE PTR [rax],cl
   140382c34:	08 08                	or     BYTE PTR [rax],cl
   140382c36:	08 08                	or     BYTE PTR [rax],cl
   140382c38:	08 08                	or     BYTE PTR [rax],cl
   140382c3a:	08 08                	or     BYTE PTR [rax],cl
   140382c3c:	08 08                	or     BYTE PTR [rax],cl
   140382c3e:	08 08                	or     BYTE PTR [rax],cl
   140382c40:	08 08                	or     BYTE PTR [rax],cl
   140382c42:	08 08                	or     BYTE PTR [rax],cl
   140382c44:	08 08                	or     BYTE PTR [rax],cl
   140382c46:	08 08                	or     BYTE PTR [rax],cl
   140382c48:	08 08                	or     BYTE PTR [rax],cl
   140382c4a:	08 08                	or     BYTE PTR [rax],cl
   140382c4c:	08 08                	or     BYTE PTR [rax],cl
   140382c4e:	08 08                	or     BYTE PTR [rax],cl
   140382c50:	08 08                	or     BYTE PTR [rax],cl
   140382c52:	08 08                	or     BYTE PTR [rax],cl
   140382c54:	08 08                	or     BYTE PTR [rax],cl
   140382c56:	08 08                	or     BYTE PTR [rax],cl
   140382c58:	08 08                	or     BYTE PTR [rax],cl
   140382c5a:	08 08                	or     BYTE PTR [rax],cl
   140382c5c:	08 08                	or     BYTE PTR [rax],cl
   140382c5e:	08 08                	or     BYTE PTR [rax],cl
   140382c60:	08 08                	or     BYTE PTR [rax],cl
   140382c62:	08 08                	or     BYTE PTR [rax],cl
   140382c64:	08 08                	or     BYTE PTR [rax],cl
   140382c66:	08 08                	or     BYTE PTR [rax],cl
   140382c68:	05 06 07 cc cc       	add    eax,0xcccc0706
   140382c6d:	cc                   	int3
   140382c6e:	cc                   	int3
   140382c6f:	cc                   	int3
   140382c70:	cc                   	int3
   140382c71:	cc                   	int3
   140382c72:	cc                   	int3
   140382c73:	cc                   	int3
   140382c74:	cc                   	int3
   140382c75:	cc                   	int3
   140382c76:	cc                   	int3
   140382c77:	cc                   	int3
   140382c78:	cc                   	int3
   140382c79:	cc                   	int3
   140382c7a:	cc                   	int3
   140382c7b:	cc                   	int3
   140382c7c:	cc                   	int3
   140382c7d:	cc                   	int3
   140382c7e:	cc                   	int3
   140382c7f:	cc                   	int3
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
