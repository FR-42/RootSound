
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001406119b0 <.text+0x6109b0>:
   1406119b0:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   1406119b5:	44 89 4c 24 20       	mov    DWORD PTR [rsp+0x20],r9d
   1406119ba:	4c 89 44 24 18       	mov    QWORD PTR [rsp+0x18],r8
   1406119bf:	55                   	push   rbp
   1406119c0:	56                   	push   rsi
   1406119c1:	57                   	push   rdi
   1406119c2:	41 54                	push   r12
   1406119c4:	41 55                	push   r13
   1406119c6:	41 56                	push   r14
   1406119c8:	41 57                	push   r15
   1406119ca:	48 83 ec 50          	sub    rsp,0x50
   1406119ce:	4c 8b ac 24 b0 00 00 	mov    r13,QWORD PTR [rsp+0xb0]
   1406119d5:	00 
   1406119d6:	4d 8b e0             	mov    r12,r8
   1406119d9:	4c 8b bc 24 b8 00 00 	mov    r15,QWORD PTR [rsp+0xb8]
   1406119e0:	00 
   1406119e1:	48 8b fa             	mov    rdi,rdx
   1406119e4:	49 63 e9             	movsxd rbp,r9d
   1406119e7:	48 8b d9             	mov    rbx,rcx
   1406119ea:	49 0f af ec          	imul   rbp,r12
   1406119ee:	4d 63 75 04          	movsxd r14,DWORD PTR [r13+0x4]
   1406119f2:	4d 63 45 00          	movsxd r8,DWORD PTR [r13+0x0]
   1406119f6:	41 8b c6             	mov    eax,r14d
   1406119f9:	41 0f af c0          	imul   eax,r8d
   1406119fd:	49 83 c5 08          	add    r13,0x8
   140611a01:	48 c1 e5 04          	shl    rbp,0x4
   140611a05:	48 89 4c 24 40       	mov    QWORD PTR [rsp+0x40],rcx
   140611a0a:	44 89 84 24 90 00 00 	mov    DWORD PTR [rsp+0x90],r8d
   140611a11:	00 
   140611a12:	44 89 b4 24 b0 00 00 	mov    DWORD PTR [rsp+0xb0],r14d
   140611a19:	00 
   140611a1a:	48 63 f0             	movsxd rsi,eax
   140611a1d:	48 c1 e6 04          	shl    rsi,0x4
   140611a21:	48 03 f1             	add    rsi,rcx
   140611a24:	41 83 fe 01          	cmp    r14d,0x1
   140611a28:	75 1a                	jne    0x140611a44
   140611a2a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140611a30:	0f 10 07             	movups xmm0,XMMWORD PTR [rdi]
   140611a33:	48 03 fd             	add    rdi,rbp
   140611a36:	0f 11 03             	movups XMMWORD PTR [rbx],xmm0
   140611a39:	48 83 c3 10          	add    rbx,0x10
   140611a3d:	48 3b de             	cmp    rbx,rsi
   140611a40:	75 ee                	jne    0x140611a30
   140611a42:	eb 64                	jmp    0x140611aa8
   140611a44:	49 8b c0             	mov    rax,r8
   140611a47:	49 0f af c4          	imul   rax,r12
   140611a4b:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   140611a50:	49 8b c6             	mov    rax,r14
   140611a53:	4c 8b 64 24 30       	mov    r12,QWORD PTR [rsp+0x30]
   140611a58:	48 c1 e0 04          	shl    rax,0x4
   140611a5c:	4c 8b f0             	mov    r14,rax
   140611a5f:	90                   	nop
   140611a60:	4c 89 7c 24 28       	mov    QWORD PTR [rsp+0x28],r15
   140611a65:	4d 8b c4             	mov    r8,r12
   140611a68:	48 8b d7             	mov    rdx,rdi
   140611a6b:	4c 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],r13
   140611a70:	48 8b cb             	mov    rcx,rbx
   140611a73:	e8 38 ff ff ff       	call   0x1406119b0
   140611a78:	44 8b 8c 24 a8 00 00 	mov    r9d,DWORD PTR [rsp+0xa8]
   140611a7f:	00 
   140611a80:	48 03 fd             	add    rdi,rbp
   140611a83:	49 03 de             	add    rbx,r14
   140611a86:	48 3b de             	cmp    rbx,rsi
   140611a89:	75 d5                	jne    0x140611a60
   140611a8b:	44 8b b4 24 b0 00 00 	mov    r14d,DWORD PTR [rsp+0xb0]
   140611a92:	00 
   140611a93:	4c 8b a4 24 a0 00 00 	mov    r12,QWORD PTR [rsp+0xa0]
   140611a9a:	00 
   140611a9b:	48 8b 4c 24 40       	mov    rcx,QWORD PTR [rsp+0x40]
   140611aa0:	44 8b 84 24 90 00 00 	mov    r8d,DWORD PTR [rsp+0x90]
   140611aa7:	00 
   140611aa8:	41 8b d0             	mov    edx,r8d
   140611aab:	83 ea 02             	sub    edx,0x2
   140611aae:	74 5a                	je     0x140611b0a
   140611ab0:	83 ea 01             	sub    edx,0x1
   140611ab3:	74 42                	je     0x140611af7
   140611ab5:	83 ea 01             	sub    edx,0x1
   140611ab8:	74 2a                	je     0x140611ae4
   140611aba:	83 fa 01             	cmp    edx,0x1
   140611abd:	45 8b ce             	mov    r9d,r14d
   140611ac0:	49 8b d4             	mov    rdx,r12
   140611ac3:	74 12                	je     0x140611ad7
   140611ac5:	44 89 44 24 20       	mov    DWORD PTR [rsp+0x20],r8d
   140611aca:	4d 8b c7             	mov    r8,r15
   140611acd:	e8 be fa ff ff       	call   0x140611590
   140611ad2:	e9 c6 00 00 00       	jmp    0x140611b9d
   140611ad7:	4d 8b c7             	mov    r8,r15
   140611ada:	e8 c1 f5 ff ff       	call   0x1406110a0
   140611adf:	e9 b9 00 00 00       	jmp    0x140611b9d
   140611ae4:	4d 63 ce             	movsxd r9,r14d
   140611ae7:	4d 8b c7             	mov    r8,r15
   140611aea:	49 8b d4             	mov    rdx,r12
   140611aed:	e8 6e f3 ff ff       	call   0x140610e60
   140611af2:	e9 a6 00 00 00       	jmp    0x140611b9d
   140611af7:	4d 63 ce             	movsxd r9,r14d
   140611afa:	4d 8b c7             	mov    r8,r15
   140611afd:	49 8b d4             	mov    rdx,r12
   140611b00:	e8 ab f1 ff ff       	call   0x140610cb0
   140611b05:	e9 93 00 00 00       	jmp    0x140611b9d
   140611b0a:	49 63 d6             	movsxd rdx,r14d
   140611b0d:	41 b8 08 00 00 00    	mov    r8d,0x8
   140611b13:	48 8b c2             	mov    rax,rdx
   140611b16:	49 c1 e4 04          	shl    r12,0x4
   140611b1a:	48 c1 e0 04          	shl    rax,0x4
   140611b1e:	49 81 c7 08 01 00 00 	add    r15,0x108
   140611b25:	48 03 c8             	add    rcx,rax
   140611b28:	4c 2b c0             	sub    r8,rax
   140611b2b:	48 f7 da             	neg    rdx
   140611b2e:	48 03 d2             	add    rdx,rdx
   140611b31:	f2 0f 10 19          	movsd  xmm3,QWORD PTR [rcx]
   140611b35:	f2 0f 10 69 08       	movsd  xmm5,QWORD PTR [rcx+0x8]
   140611b3a:	0f 28 e3             	movaps xmm4,xmm3
   140611b3d:	f2 41 0f 59 27       	mulsd  xmm4,QWORD PTR [r15]
   140611b42:	0f 28 c5             	movaps xmm0,xmm5
   140611b45:	f2 41 0f 59 47 08    	mulsd  xmm0,QWORD PTR [r15+0x8]
   140611b4b:	f2 41 0f 59 2f       	mulsd  xmm5,QWORD PTR [r15]
   140611b50:	f2 41 0f 59 5f 08    	mulsd  xmm3,QWORD PTR [r15+0x8]
   140611b56:	4d 03 fc             	add    r15,r12
   140611b59:	f2 0f 5c e0          	subsd  xmm4,xmm0
   140611b5d:	f2 0f 10 04 d1       	movsd  xmm0,QWORD PTR [rcx+rdx*8]
   140611b62:	f2 0f 58 eb          	addsd  xmm5,xmm3
   140611b66:	f2 0f 5c c4          	subsd  xmm0,xmm4
   140611b6a:	f2 0f 11 01          	movsd  QWORD PTR [rcx],xmm0
   140611b6e:	f2 41 0f 10 0c 08    	movsd  xmm1,QWORD PTR [r8+rcx*1]
   140611b74:	f2 0f 5c cd          	subsd  xmm1,xmm5
   140611b78:	f2 0f 11 49 08       	movsd  QWORD PTR [rcx+0x8],xmm1
   140611b7d:	f2 0f 58 24 d1       	addsd  xmm4,QWORD PTR [rcx+rdx*8]
   140611b82:	f2 41 0f 58 2c 08    	addsd  xmm5,QWORD PTR [r8+rcx*1]
   140611b88:	f2 0f 11 24 d1       	movsd  QWORD PTR [rcx+rdx*8],xmm4
   140611b8d:	f2 41 0f 11 2c 08    	movsd  QWORD PTR [r8+rcx*1],xmm5
   140611b93:	48 83 c1 10          	add    rcx,0x10
   140611b97:	41 83 ee 01          	sub    r14d,0x1
   140611b9b:	75 94                	jne    0x140611b31
   140611b9d:	48 8b 9c 24 98 00 00 	mov    rbx,QWORD PTR [rsp+0x98]
   140611ba4:	00 
   140611ba5:	48 83 c4 50          	add    rsp,0x50
   140611ba9:	41 5f                	pop    r15
   140611bab:	41 5e                	pop    r14
   140611bad:	41 5d                	pop    r13
   140611baf:	41 5c                	pop    r12
   140611bb1:	5f                   	pop    rdi
   140611bb2:	5e                   	pop    rsi
   140611bb3:	5d                   	pop    rbp
   140611bb4:	c3                   	ret
   140611bb5:	cc                   	int3
   140611bb6:	cc                   	int3
   140611bb7:	cc                   	int3
   140611bb8:	cc                   	int3
   140611bb9:	cc                   	int3
   140611bba:	cc                   	int3
   140611bbb:	cc                   	int3
   140611bbc:	cc                   	int3
   140611bbd:	cc                   	int3
   140611bbe:	cc                   	int3
   140611bbf:	cc                   	int3
   140611bc0:	0f 10 09             	movups xmm1,XMMWORD PTR [rcx]
   140611bc3:	48 8d 0d e6 da 35 00 	lea    rcx,[rip+0x35dae6]        # 0x14096f6b0
   140611bca:	66 0f 6f c1          	movdqa xmm0,xmm1
   140611bce:	66 48 0f 7e ca       	movq   rdx,xmm1
   140611bd3:	66 0f 73 d8 08       	psrldq xmm0,0x8
   140611bd8:	66 49 0f 7e c0       	movq   r8,xmm0
   140611bdd:	e9 ba 82 b3 ff       	jmp    0x140149e9c
   140611be2:	cc                   	int3
   140611be3:	cc                   	int3
   140611be4:	cc                   	int3
   140611be5:	cc                   	int3
   140611be6:	cc                   	int3
   140611be7:	cc                   	int3
   140611be8:	cc                   	int3
   140611be9:	cc                   	int3
   140611bea:	cc                   	int3
   140611beb:	cc                   	int3
   140611bec:	cc                   	int3
   140611bed:	cc                   	int3
   140611bee:	cc                   	int3
   140611bef:	cc                   	int3
   140611bf0:	48 89 0d b9 54 2a 17 	mov    QWORD PTR [rip+0x172a54b9],rcx        # 0x1578b70b0
   140611bf7:	c3                   	ret
   140611bf8:	cc                   	int3
   140611bf9:	cc                   	int3
   140611bfa:	cc                   	int3
   140611bfb:	cc                   	int3
   140611bfc:	cc                   	int3
   140611bfd:	cc                   	int3
   140611bfe:	cc                   	int3
   140611bff:	cc                   	int3
   140611c00:	48 8b c4             	mov    rax,rsp
   140611c03:	55                   	push   rbp
   140611c04:	41 54                	push   r12
   140611c06:	41 55                	push   r13
   140611c08:	41 56                	push   r14
   140611c0a:	41 57                	push   r15
   140611c0c:	48 8d a8 28 ff ff ff 	lea    rbp,[rax-0xd8]
   140611c13:	48 81 ec b0 01 00 00 	sub    rsp,0x1b0
   140611c1a:	48 c7 44 24 68 fe ff 	mov    QWORD PTR [rsp+0x68],0xfffffffffffffffe
   140611c21:	ff ff 
   140611c23:	48 89 58 10          	mov    QWORD PTR [rax+0x10],rbx
   140611c27:	48 89 70 18          	mov    QWORD PTR [rax+0x18],rsi
   140611c2b:	48 89 78 20          	mov    QWORD PTR [rax+0x20],rdi
   140611c2f:	48 8b 05 32 05 36 00 	mov    rax,QWORD PTR [rip+0x360532]        # 0x140972168
   140611c36:	48 33 c4             	xor    rax,rsp
   140611c39:	48 89 85 a0 00 00 00 	mov    QWORD PTR [rbp+0xa0],rax
   140611c40:	48 8b d9             	mov    rbx,rcx
   140611c43:	48 89 4c 24 38       	mov    QWORD PTR [rsp+0x38],rcx
   140611c48:	45 33 e4             	xor    r12d,r12d
   140611c4b:	45 8b f4             	mov    r14d,r12d
   140611c4e:	44 89 64 24 34       	mov    DWORD PTR [rsp+0x34],r12d
   140611c53:	48 8d 15 76 da 35 00 	lea    rdx,[rip+0x35da76]        # 0x14096f6d0
   140611c5a:	48 83 3d 86 da 35 00 	cmp    QWORD PTR [rip+0x35da86],0x10        # 0x14096f6e8
   140611c61:	10 
   140611c62:	48 0f 43 15 66 da 35 	cmovae rdx,QWORD PTR [rip+0x35da66]        # 0x14096f6d0
   140611c69:	00 
   140611c6a:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   140611c6d:	0f 29 44 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm0
   140611c72:	66 0f 73 d8 08       	psrldq xmm0,0x8
   140611c77:	66 49 0f 7e c0       	movq   r8,xmm0
   140611c7c:	4c 3b 05 5d da 35 00 	cmp    r8,QWORD PTR [rip+0x35da5d]        # 0x14096f6e0
   140611c83:	75 24                	jne    0x140611ca9
   140611c85:	48 8b 4c 24 40       	mov    rcx,QWORD PTR [rsp+0x40]
   140611c8a:	e8 79 f0 00 00       	call   0x140620d08
   140611c8f:	85 c0                	test   eax,eax
   140611c91:	75 16                	jne    0x140611ca9
   140611c93:	48 8b 05 26 54 2a 17 	mov    rax,QWORD PTR [rip+0x172a5426]        # 0x1578b70c0
   140611c9a:	48 39 05 17 54 2a 17 	cmp    QWORD PTR [rip+0x172a5417],rax        # 0x1578b70b8
   140611ca1:	0f 95 c0             	setne  al
   140611ca4:	e9 d3 09 00 00       	jmp    0x14061267c
   140611ca9:	0f 10 03             	movups xmm0,XMMWORD PTR [rbx]
   140611cac:	0f 11 45 d0          	movups XMMWORD PTR [rbp-0x30],xmm0
   140611cb0:	4c 8d 05 19 54 2a 17 	lea    r8,[rip+0x172a5419]        # 0x1578b70d0
   140611cb7:	48 8b 15 1a 54 2a 17 	mov    rdx,QWORD PTR [rip+0x172a541a]        # 0x1578b70d8
   140611cbe:	48 8b 0d 0b 54 2a 17 	mov    rcx,QWORD PTR [rip+0x172a540b]        # 0x1578b70d0
   140611cc5:	e8 a2 2b b6 ff       	call   0x14017486c
   140611cca:	48 8b 05 ff 53 2a 17 	mov    rax,QWORD PTR [rip+0x172a53ff]        # 0x1578b70d0
   140611cd1:	48 89 05 00 54 2a 17 	mov    QWORD PTR [rip+0x172a5400],rax        # 0x1578b70d8
   140611cd8:	48 8b 3d e1 53 2a 17 	mov    rdi,QWORD PTR [rip+0x172a53e1]        # 0x1578b70c0
   140611cdf:	48 8b 1d d2 53 2a 17 	mov    rbx,QWORD PTR [rip+0x172a53d2]        # 0x1578b70b8
   140611ce6:	48 3b df             	cmp    rbx,rdi
   140611ce9:	74 1d                	je     0x140611d08
   140611ceb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140611cf0:	48 8b cb             	mov    rcx,rbx
   140611cf3:	e8 08 12 00 00       	call   0x140612f00
   140611cf8:	48 83 c3 40          	add    rbx,0x40
   140611cfc:	48 3b df             	cmp    rbx,rdi
   140611cff:	75 ef                	jne    0x140611cf0
   140611d01:	48 8b 1d b0 53 2a 17 	mov    rbx,QWORD PTR [rip+0x172a53b0]        # 0x1578b70b8
   140611d08:	48 89 1d b1 53 2a 17 	mov    QWORD PTR [rip+0x172a53b1],rbx        # 0x1578b70c0
   140611d0f:	49 c7 c5 ff ff ff ff 	mov    r13,0xffffffffffffffff
   140611d16:	4c 8b 7d d8          	mov    r15,QWORD PTR [rbp-0x28]
   140611d1a:	4d 85 ff             	test   r15,r15
   140611d1d:	0f 84 4c 07 00 00    	je     0x14061246f
   140611d23:	48 8b 7d d0          	mov    rdi,QWORD PTR [rbp-0x30]
   140611d27:	4d 85 ff             	test   r15,r15
   140611d2a:	74 1d                	je     0x140611d49
   140611d2c:	4d 8b c7             	mov    r8,r15
   140611d2f:	ba 3b 00 00 00       	mov    edx,0x3b
   140611d34:	48 8b cf             	mov    rcx,rdi
   140611d37:	e8 e4 ef 00 00       	call   0x140620d20
   140611d3c:	48 8b d8             	mov    rbx,rax
   140611d3f:	48 85 c0             	test   rax,rax
   140611d42:	74 05                	je     0x140611d49
   140611d44:	48 2b df             	sub    rbx,rdi
   140611d47:	eb 03                	jmp    0x140611d4c
   140611d49:	49 8b dd             	mov    rbx,r13
   140611d4c:	4c 8b c3             	mov    r8,rbx
   140611d4f:	4c 3b fb             	cmp    r15,rbx
   140611d52:	4d 0f 42 c7          	cmovb  r8,r15
   140611d56:	4c 89 65 c0          	mov    QWORD PTR [rbp-0x40],r12
   140611d5a:	48 c7 45 c8 0f 00 00 	mov    QWORD PTR [rbp-0x38],0xf
   140611d61:	00 
   140611d62:	c6 45 b0 00          	mov    BYTE PTR [rbp-0x50],0x0
   140611d66:	48 8b d7             	mov    rdx,rdi
   140611d69:	48 8d 4d b0          	lea    rcx,[rbp-0x50]
   140611d6d:	e8 2a 81 b3 ff       	call   0x140149e9c
   140611d72:	90                   	nop
   140611d73:	48 83 fb ff          	cmp    rbx,0xffffffffffffffff
   140611d77:	75 0d                	jne    0x140611d86
   140611d79:	49 03 ff             	add    rdi,r15
   140611d7c:	4d 8b fc             	mov    r15,r12
   140611d7f:	4c 89 64 24 50       	mov    QWORD PTR [rsp+0x50],r12
   140611d84:	eb 0f                	jmp    0x140611d95
   140611d86:	48 8d 43 01          	lea    rax,[rbx+0x1]
   140611d8a:	48 03 f8             	add    rdi,rax
   140611d8d:	4c 2b f8             	sub    r15,rax
   140611d90:	4c 89 7c 24 50       	mov    QWORD PTR [rsp+0x50],r15
   140611d95:	48 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],rdi
   140611d9a:	48 8d 45 b0          	lea    rax,[rbp-0x50]
   140611d9e:	4c 8b 45 c8          	mov    r8,QWORD PTR [rbp-0x38]
   140611da2:	49 83 f8 10          	cmp    r8,0x10
   140611da6:	48 0f 43 45 b0       	cmovae rax,QWORD PTR [rbp-0x50]
   140611dab:	48 83 7d c0 01       	cmp    QWORD PTR [rbp-0x40],0x1
   140611db0:	0f 85 2c 01 00 00    	jne    0x140611ee2
   140611db6:	0f b6 00             	movzx  eax,BYTE PTR [rax]
   140611db9:	3a 05 89 c9 18 00    	cmp    al,BYTE PTR [rip+0x18c989]        # 0x14079e748
   140611dbf:	75 05                	jne    0x140611dc6
   140611dc1:	41 8b c4             	mov    eax,r12d
   140611dc4:	eb 05                	jmp    0x140611dcb
   140611dc6:	1b c0                	sbb    eax,eax
   140611dc8:	83 c8 01             	or     eax,0x1
   140611dcb:	85 c0                	test   eax,eax
   140611dcd:	0f 85 0f 01 00 00    	jne    0x140611ee2
   140611dd3:	4c 8b 05 e6 d8 35 00 	mov    r8,QWORD PTR [rip+0x35d8e6]        # 0x14096f6c0
   140611dda:	48 8d 4d b0          	lea    rcx,[rbp-0x50]
   140611dde:	4d 85 c0             	test   r8,r8
   140611de1:	75 11                	jne    0x140611df4
   140611de3:	48 8d 15 60 c9 18 00 	lea    rdx,[rip+0x18c960]        # 0x14079e74a
   140611dea:	e8 ad 80 b3 ff       	call   0x140149e9c
   140611def:	e9 83 00 00 00       	jmp    0x140611e77
   140611df4:	48 8d 15 b5 d8 35 00 	lea    rdx,[rip+0x35d8b5]        # 0x14096f6b0
   140611dfb:	48 83 3d c5 d8 35 00 	cmp    QWORD PTR [rip+0x35d8c5],0x10        # 0x14096f6c8
   140611e02:	10 
   140611e03:	48 0f 43 15 a5 d8 35 	cmovae rdx,QWORD PTR [rip+0x35d8a5]        # 0x14096f6b0
   140611e0a:	00 
   140611e0b:	e8 8c 80 b3 ff       	call   0x140149e9c
   140611e10:	48 8b 4d c0          	mov    rcx,QWORD PTR [rbp-0x40]
   140611e14:	48 8b 55 c8          	mov    rdx,QWORD PTR [rbp-0x38]
   140611e18:	48 8b c2             	mov    rax,rdx
   140611e1b:	48 2b c1             	sub    rax,rcx
   140611e1e:	48 83 f8 01          	cmp    rax,0x1
   140611e22:	72 33                	jb     0x140611e57
   140611e24:	48 8d 41 01          	lea    rax,[rcx+0x1]
   140611e28:	48 89 45 c0          	mov    QWORD PTR [rbp-0x40],rax
   140611e2c:	48 8d 5d b0          	lea    rbx,[rbp-0x50]
   140611e30:	48 83 fa 10          	cmp    rdx,0x10
   140611e34:	48 0f 43 5d b0       	cmovae rbx,QWORD PTR [rbp-0x50]
   140611e39:	48 03 d9             	add    rbx,rcx
   140611e3c:	41 b8 01 00 00 00    	mov    r8d,0x1
   140611e42:	48 8d 15 03 c9 18 00 	lea    rdx,[rip+0x18c903]        # 0x14079e74c
   140611e49:	48 8b cb             	mov    rcx,rbx
   140611e4c:	e8 bd ee 00 00       	call   0x140620d0e
   140611e51:	c6 43 01 00          	mov    BYTE PTR [rbx+0x1],0x0
   140611e55:	eb 20                	jmp    0x140611e77
   140611e57:	48 c7 44 24 20 01 00 	mov    QWORD PTR [rsp+0x20],0x1
   140611e5e:	00 00 
   140611e60:	4c 8d 0d e5 c8 18 00 	lea    r9,[rip+0x18c8e5]        # 0x14079e74c
   140611e67:	45 33 c0             	xor    r8d,r8d
   140611e6a:	41 8d 50 01          	lea    edx,[r8+0x1]
   140611e6e:	48 8d 4d b0          	lea    rcx,[rbp-0x50]
   140611e72:	e8 f9 84 b3 ff       	call   0x14014a370
   140611e77:	48 8b 4d c0          	mov    rcx,QWORD PTR [rbp-0x40]
   140611e7b:	48 8b 55 c8          	mov    rdx,QWORD PTR [rbp-0x38]
   140611e7f:	48 8b c2             	mov    rax,rdx
   140611e82:	48 2b c1             	sub    rax,rcx
   140611e85:	48 83 f8 07          	cmp    rax,0x7
   140611e89:	72 33                	jb     0x140611ebe
   140611e8b:	48 8d 41 07          	lea    rax,[rcx+0x7]
   140611e8f:	48                   	rex.W
