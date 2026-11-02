
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140333930 <.text+0x332930>:
   140333930:	40 53                	rex push rbx
   140333932:	57                   	push   rdi
   140333933:	41 55                	push   r13
   140333935:	41 57                	push   r15
   140333937:	48 81 ec 88 01 00 00 	sub    rsp,0x188
   14033393e:	44 0f 29 8c 24 20 01 	movaps XMMWORD PTR [rsp+0x120],xmm9
   140333945:	00 00 
   140333947:	44 0f 29 94 24 10 01 	movaps XMMWORD PTR [rsp+0x110],xmm10
   14033394e:	00 00 
   140333950:	48 8b 05 11 e8 63 00 	mov    rax,QWORD PTR [rip+0x63e811]        # 0x140972168
   140333957:	48 33 c4             	xor    rax,rsp
   14033395a:	48 89 84 24 b0 00 00 	mov    QWORD PTR [rsp+0xb0],rax
   140333961:	00 
   140333962:	4c 8b 15 ff 66 65 00 	mov    r10,QWORD PTR [rip+0x6566ff]        # 0x14098a068
   140333969:	49 8b d8             	mov    rbx,r8
   14033396c:	4c 89 4c 24 58       	mov    QWORD PTR [rsp+0x58],r9
   140333971:	4d 8b f9             	mov    r15,r9
   140333974:	48 89 5c 24 70       	mov    QWORD PTR [rsp+0x70],rbx
   140333979:	4c 8b e9             	mov    r13,rcx
   14033397c:	48 89 54 24 60       	mov    QWORD PTR [rsp+0x60],rdx
   140333981:	45 0f 57 d2          	xorps  xmm10,xmm10
   140333985:	45 0f 57 c9          	xorps  xmm9,xmm9
   140333989:	4d 85 d2             	test   r10,r10
   14033398c:	74 27                	je     0x1403339b5
   14033398e:	48 8b 0d db 66 65 00 	mov    rcx,QWORD PTR [rip+0x6566db]        # 0x14098a070
   140333995:	48 85 c9             	test   rcx,rcx
   140333998:	74 1b                	je     0x1403339b5
   14033399a:	8b 42 14             	mov    eax,DWORD PTR [rdx+0x14]
   14033399d:	2b 42 0c             	sub    eax,DWORD PTR [rdx+0xc]
   1403339a0:	03 84 24 d0 01 00 00 	add    eax,DWORD PTR [rsp+0x1d0]
   1403339a7:	48 63 d0             	movsxd rdx,eax
   1403339aa:	48 3b d1             	cmp    rdx,rcx
   1403339ad:	73 06                	jae    0x1403339b5
   1403339af:	f3 45 0f 10 0c 92    	movss  xmm9,DWORD PTR [r10+rdx*4]
   1403339b5:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   1403339ba:	33 c0                	xor    eax,eax
   1403339bc:	0f b7 f8             	movzx  edi,ax
   1403339bf:	66 89 44 24 52       	mov    WORD PTR [rsp+0x52],ax
   1403339c4:	66 41 89 82 70 06 00 	mov    WORD PTR [r10+0x670],ax
   1403339cb:	00 
   1403339cc:	41 0f b7 09          	movzx  ecx,WORD PTR [r9]
   1403339d0:	66 3b c1             	cmp    ax,cx
   1403339d3:	0f 83 20 08 00 00    	jae    0x1403341f9
   1403339d9:	f3 0f 10 05 c7 40 37 	movss  xmm0,DWORD PTR [rip+0x3740c7]        # 0x1406a7aa8
   1403339e0:	00 
   1403339e1:	48 89 ac 24 80 01 00 	mov    QWORD PTR [rsp+0x180],rbp
   1403339e8:	00 
   1403339e9:	48 89 b4 24 78 01 00 	mov    QWORD PTR [rsp+0x178],rsi
   1403339f0:	00 
   1403339f1:	8d 70 01             	lea    esi,[rax+0x1]
   1403339f4:	4c 89 a4 24 70 01 00 	mov    QWORD PTR [rsp+0x170],r12
   1403339fb:	00 
   1403339fc:	4c 89 b4 24 68 01 00 	mov    QWORD PTR [rsp+0x168],r14
   140333a03:	00 
   140333a04:	0f 29 b4 24 50 01 00 	movaps XMMWORD PTR [rsp+0x150],xmm6
   140333a0b:	00 
   140333a0c:	f3 0f 10 35 c8 c5 51 	movss  xmm6,DWORD PTR [rip+0x51c5c8]        # 0x14084ffdc
   140333a13:	00 
   140333a14:	0f 29 bc 24 40 01 00 	movaps XMMWORD PTR [rsp+0x140],xmm7
   140333a1b:	00 
   140333a1c:	f3 0f 10 3d 2c 40 37 	movss  xmm7,DWORD PTR [rip+0x37402c]        # 0x1406a7a50
   140333a23:	00 
   140333a24:	44 0f 29 84 24 30 01 	movaps XMMWORD PTR [rsp+0x130],xmm8
   140333a2b:	00 00 
   140333a2d:	44 0f 29 9c 24 00 01 	movaps XMMWORD PTR [rsp+0x100],xmm11
   140333a34:	00 00 
   140333a36:	f2 44 0f 10 1d 69 3f 	movsd  xmm11,QWORD PTR [rip+0x373f69]        # 0x1406a79a8
   140333a3d:	37 00 
   140333a3f:	44 0f 29 a4 24 f0 00 	movaps XMMWORD PTR [rsp+0xf0],xmm12
   140333a46:	00 00 
   140333a48:	45 0f 57 e4          	xorps  xmm12,xmm12
   140333a4c:	44 0f 29 ac 24 e0 00 	movaps XMMWORD PTR [rsp+0xe0],xmm13
   140333a53:	00 00 
   140333a55:	f2 44 0f 10 2d 52 cd 	movsd  xmm13,QWORD PTR [rip+0x51cd52]        # 0x1408507b0
   140333a5c:	51 00 
   140333a5e:	44 0f 29 b4 24 d0 00 	movaps XMMWORD PTR [rsp+0xd0],xmm14
   140333a65:	00 00 
   140333a67:	f3 44 0f 10 35 a4 52 	movss  xmm14,DWORD PTR [rip+0x3652a4]        # 0x140698d14
   140333a6e:	36 00 
   140333a70:	44 0f 29 bc 24 c0 00 	movaps XMMWORD PTR [rsp+0xc0],xmm15
   140333a77:	00 00 
   140333a79:	f3 44 0f 10 3d 0a a7 	movss  xmm15,DWORD PTR [rip+0x35a70a]        # 0x14068e18c
   140333a80:	35 00 
   140333a82:	0f b7 c7             	movzx  eax,di
   140333a85:	48 69 d0 3c 01 00 00 	imul   rdx,rax,0x13c
   140333a8c:	0f b7 c1             	movzx  eax,cx
   140333a8f:	48 89 94 24 80 00 00 	mov    QWORD PTR [rsp+0x80],rdx
   140333a96:	00 
   140333a97:	0f 2f 84 1a cc 00 00 	comiss xmm0,DWORD PTR [rdx+rbx*1+0xcc]
   140333a9e:	00 
   140333a9f:	0f 87 da 06 00 00    	ja     0x14033417f
   140333aa5:	66 89 7c 24 50       	mov    WORD PTR [rsp+0x50],di
   140333aaa:	44 0f b7 df          	movzx  r11d,di
   140333aae:	66 3b f9             	cmp    di,cx
   140333ab1:	0f 83 c8 06 00 00    	jae    0x14033417f
   140333ab7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140333abe:	00 00 
   140333ac0:	41 0f b7 c3          	movzx  eax,r11w
   140333ac4:	48 69 c8 3c 01 00 00 	imul   rcx,rax,0x13c
   140333acb:	0f 2f 84 19 cc 00 00 	comiss xmm0,DWORD PTR [rcx+rbx*1+0xcc]
   140333ad2:	00 
   140333ad3:	0f 87 8e 06 00 00    	ja     0x140334167
   140333ad9:	f3 0f 10 1c 1a       	movss  xmm3,DWORD PTR [rdx+rbx*1]
   140333ade:	f3 0f 10 14 19       	movss  xmm2,DWORD PTR [rcx+rbx*1]
   140333ae3:	0f 2f da             	comiss xmm3,xmm2
   140333ae6:	76 0b                	jbe    0x140333af3
   140333ae8:	44 0f 28 c3          	movaps xmm8,xmm3
   140333aec:	f3 44 0f 5c c2       	subss  xmm8,xmm2
   140333af1:	eb 09                	jmp    0x140333afc
   140333af3:	44 0f 28 c2          	movaps xmm8,xmm2
   140333af7:	f3 44 0f 5c c3       	subss  xmm8,xmm3
   140333afc:	66 44 3b df          	cmp    r11w,di
   140333b00:	74 12                	je     0x140333b14
   140333b02:	f3 0f 10 0d 9a 36 36 	movss  xmm1,DWORD PTR [rip+0x36369a]        # 0x1406971a4
   140333b09:	00 
   140333b0a:	41 0f 2f c8          	comiss xmm1,xmm8
   140333b0e:	0f 87 53 06 00 00    	ja     0x140334167
   140333b14:	83 3d 8d 5e 60 00 01 	cmp    DWORD PTR [rip+0x605e8d],0x1        # 0x1409399a8
   140333b1b:	74 22                	je     0x140333b3f
   140333b1d:	0f bf 84 1a f0 00 00 	movsx  eax,WORD PTR [rdx+rbx*1+0xf0]
   140333b24:	00 
   140333b25:	0f bf 8c 19 f0 00 00 	movsx  ecx,WORD PTR [rcx+rbx*1+0xf0]
   140333b2c:	00 
   140333b2d:	2b c1                	sub    eax,ecx
   140333b2f:	99                   	cdq
   140333b30:	33 c2                	xor    eax,edx
   140333b32:	2b c2                	sub    eax,edx
   140333b34:	3d 00 70 00 00       	cmp    eax,0x7000
   140333b39:	0f 8f 20 06 00 00    	jg     0x14033415f
   140333b3f:	66 41 3b fb          	cmp    di,r11w
   140333b43:	75 04                	jne    0x140333b49
   140333b45:	44 0f 28 c3          	movaps xmm8,xmm3
   140333b49:	45 0f b6 85 91 00 00 	movzx  r8d,BYTE PTR [r13+0x91]
   140333b50:	00 
   140333b51:	0f 28 c2             	movaps xmm0,xmm2
   140333b54:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333b59:	41 0f b7 c3          	movzx  eax,r11w
   140333b5d:	44 8b f6             	mov    r14d,esi
   140333b60:	44 0f b7 cf          	movzx  r9d,di
   140333b64:	44 8b e0             	mov    r12d,eax
   140333b67:	89 74 24 68          	mov    DWORD PTR [rsp+0x68],esi
   140333b6b:	0f 2f d3             	comiss xmm2,xmm3
   140333b6e:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333b71:	45 0f 46 e1          	cmovbe r12d,r9d
   140333b75:	44 0f 46 c8          	cmovbe r9d,eax
   140333b79:	44 89 4c 24 78       	mov    DWORD PTR [rsp+0x78],r9d
   140333b7e:	0f 28 c3             	movaps xmm0,xmm3
   140333b81:	41 0f 28 e0          	movaps xmm4,xmm8
   140333b85:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333b8a:	f3 0f 5e 25 ce 3e 37 	divss  xmm4,DWORD PTR [rip+0x373ece]        # 0x1406a7a60
   140333b91:	00 
   140333b92:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333b97:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333b9c:	f2 0f 2c d1          	cvttsd2si edx,xmm1
   140333ba0:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333ba3:	0f 28 c3             	movaps xmm0,xmm3
   140333ba6:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333bab:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333bb0:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140333bb4:	0f b7 c8             	movzx  ecx,ax
   140333bb7:	66 0f 6e c9          	movd   xmm1,ecx
   140333bbb:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   140333bbe:	f3 41 0f 59 c8       	mulss  xmm1,xmm8
   140333bc3:	f3 0f 5c c1          	subss  xmm0,xmm1
   140333bc7:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333bca:	41 0f 54 cd          	andps  xmm1,xmm13
   140333bce:	66 0f 5a e9          	cvtpd2ps xmm5,xmm1
   140333bd2:	45 84 c0             	test   r8b,r8b
   140333bd5:	74 06                	je     0x140333bdd
   140333bd7:	41 0f 28 cf          	movaps xmm1,xmm15
   140333bdb:	eb 03                	jmp    0x140333be0
   140333bdd:	0f 28 cf             	movaps xmm1,xmm7
   140333be0:	0f 28 c4             	movaps xmm0,xmm4
   140333be3:	f3 0f 5f c1          	maxss  xmm0,xmm1
   140333be7:	0f 2f e8             	comiss xmm5,xmm0
   140333bea:	77 55                	ja     0x140333c41
   140333bec:	0f b7 c2             	movzx  eax,dx
   140333bef:	0f 28 c2             	movaps xmm0,xmm2
   140333bf2:	66 0f 6e c8          	movd   xmm1,eax
   140333bf6:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   140333bf9:	f3 41 0f 59 c8       	mulss  xmm1,xmm8
   140333bfe:	f3 0f 5c c1          	subss  xmm0,xmm1
   140333c02:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333c05:	41 0f 54 cd          	andps  xmm1,xmm13
   140333c09:	66 0f 5a e9          	cvtpd2ps xmm5,xmm1
   140333c0d:	45 84 c0             	test   r8b,r8b
   140333c10:	74 06                	je     0x140333c18
   140333c12:	41 0f 28 c7          	movaps xmm0,xmm15
   140333c16:	eb 03                	jmp    0x140333c1b
   140333c18:	0f 28 c7             	movaps xmm0,xmm7
   140333c1b:	f3 0f 5f e0          	maxss  xmm4,xmm0
   140333c1f:	0f 2f ec             	comiss xmm5,xmm4
   140333c22:	77 1d                	ja     0x140333c41
   140333c24:	66 41 3b fb          	cmp    di,r11w
   140333c28:	0f 84 b6 01 00 00    	je     0x140333de4
   140333c2e:	ba 01 00 00 00       	mov    edx,0x1
   140333c33:	45 33 c0             	xor    r8d,r8d
   140333c36:	8b c2                	mov    eax,edx
   140333c38:	89 54 24 40          	mov    DWORD PTR [rsp+0x40],edx
   140333c3c:	e9 b1 01 00 00       	jmp    0x140333df2
   140333c41:	f3 44 0f 59 c6       	mulss  xmm8,xmm6
   140333c46:	0f 28 c2             	movaps xmm0,xmm2
   140333c49:	41 be 02 00 00 00    	mov    r14d,0x2
   140333c4f:	44 89 74 24 68       	mov    DWORD PTR [rsp+0x68],r14d
   140333c54:	41 0f 28 e0          	movaps xmm4,xmm8
   140333c58:	f3 0f 5e 25 00 3e 37 	divss  xmm4,DWORD PTR [rip+0x373e00]        # 0x1406a7a60
   140333c5f:	00 
   140333c60:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333c65:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333c68:	0f 28 c3             	movaps xmm0,xmm3
   140333c6b:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333c70:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333c75:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333c7a:	f2 0f 2c d1          	cvttsd2si edx,xmm1
   140333c7e:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333c81:	0f 28 c3             	movaps xmm0,xmm3
   140333c84:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333c89:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333c8e:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140333c92:	0f 57 c9             	xorps  xmm1,xmm1
   140333c95:	0f b7 c8             	movzx  ecx,ax
   140333c98:	f3 0f 2a c9          	cvtsi2ss xmm1,ecx
   140333c9c:	f3 41 0f 59 c8       	mulss  xmm1,xmm8
   140333ca1:	f3 0f 5c c1          	subss  xmm0,xmm1
   140333ca5:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333ca8:	41 0f 54 cd          	andps  xmm1,xmm13
   140333cac:	66 0f 5a e9          	cvtpd2ps xmm5,xmm1
   140333cb0:	45 84 c0             	test   r8b,r8b
   140333cb3:	74 06                	je     0x140333cbb
   140333cb5:	41 0f 28 cf          	movaps xmm1,xmm15
   140333cb9:	eb 03                	jmp    0x140333cbe
   140333cbb:	0f 28 cf             	movaps xmm1,xmm7
   140333cbe:	0f 28 c4             	movaps xmm0,xmm4
   140333cc1:	f3 0f 5f c1          	maxss  xmm0,xmm1
   140333cc5:	0f 2f e8             	comiss xmm5,xmm0
   140333cc8:	77 3c                	ja     0x140333d06
   140333cca:	0f b7 c2             	movzx  eax,dx
   140333ccd:	0f 28 c2             	movaps xmm0,xmm2
   140333cd0:	66 0f 6e c8          	movd   xmm1,eax
   140333cd4:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   140333cd7:	f3 41 0f 59 c8       	mulss  xmm1,xmm8
   140333cdc:	f3 0f 5c c1          	subss  xmm0,xmm1
   140333ce0:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333ce3:	41 0f 54 cd          	andps  xmm1,xmm13
   140333ce7:	66 0f 5a e9          	cvtpd2ps xmm5,xmm1
   140333ceb:	45 84 c0             	test   r8b,r8b
   140333cee:	74 06                	je     0x140333cf6
   140333cf0:	41 0f 28 c7          	movaps xmm0,xmm15
   140333cf4:	eb 03                	jmp    0x140333cf9
   140333cf6:	0f 28 c7             	movaps xmm0,xmm7
   140333cf9:	f3 0f 5f e0          	maxss  xmm4,xmm0
   140333cfd:	0f 2f ec             	comiss xmm5,xmm4
   140333d00:	0f 86 d6 00 00 00    	jbe    0x140333ddc
   140333d06:	f3 45 0f 58 c0       	addss  xmm8,xmm8
   140333d0b:	0f 28 c2             	movaps xmm0,xmm2
   140333d0e:	41 be 03 00 00 00    	mov    r14d,0x3
   140333d14:	44 89 74 24 68       	mov    DWORD PTR [rsp+0x68],r14d
   140333d19:	f3 44 0f 5e 05 7a 34 	divss  xmm8,DWORD PTR [rip+0x36347a]        # 0x14069719c
   140333d20:	36 00 
   140333d22:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333d27:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333d2a:	0f 28 c3             	movaps xmm0,xmm3
   140333d2d:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333d32:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333d37:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333d3c:	f2 0f 2c d1          	cvttsd2si edx,xmm1
   140333d40:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333d43:	0f 57 c0             	xorps  xmm0,xmm0
   140333d46:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333d4b:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333d50:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140333d54:	41 0f 28 c8          	movaps xmm1,xmm8
   140333d58:	0f b7 c8             	movzx  ecx,ax
   140333d5b:	f3 0f 5e 0d fd 3c 37 	divss  xmm1,DWORD PTR [rip+0x373cfd]        # 0x1406a7a60
   140333d62:	00 
   140333d63:	f3 0f 2a c1          	cvtsi2ss xmm0,ecx
   140333d67:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   140333d6c:	f3 0f 5c d8          	subss  xmm3,xmm0
   140333d70:	0f 5a c3             	cvtps2pd xmm0,xmm3
   140333d73:	41 0f 54 c5          	andps  xmm0,xmm13
   140333d77:	66 0f 5a e0          	cvtpd2ps xmm4,xmm0
   140333d7b:	45 84 c0             	test   r8b,r8b
   140333d7e:	74 06                	je     0x140333d86
   140333d80:	41 0f 28 df          	movaps xmm3,xmm15
   140333d84:	eb 03                	jmp    0x140333d89
   140333d86:	0f 28 df             	movaps xmm3,xmm7
   140333d89:	0f 28 c1             	movaps xmm0,xmm1
   140333d8c:	f3 0f 5f c3          	maxss  xmm0,xmm3
   140333d90:	0f 2f e0             	comiss xmm4,xmm0
   140333d93:	0f 87 b6 03 00 00    	ja     0x14033414f
   140333d99:	0f b7 c2             	movzx  eax,dx
   140333d9c:	66 0f 6e c0          	movd   xmm0,eax
   140333da0:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140333da3:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   140333da8:	f3 0f 5c d0          	subss  xmm2,xmm0
   140333dac:	0f 5a c2             	cvtps2pd xmm0,xmm2
   140333daf:	41 0f 54 c5          	andps  xmm0,xmm13
   140333db3:	66 0f 5a d8          	cvtpd2ps xmm3,xmm0
   140333db7:	45 84 c0             	test   r8b,r8b
   140333dba:	74 06                	je     0x140333dc2
   140333dbc:	41 0f 28 c7          	movaps xmm0,xmm15
   140333dc0:	eb 03                	jmp    0x140333dc5
   140333dc2:	0f 28 c7             	movaps xmm0,xmm7
   140333dc5:	f3 0f 10 35 0f c2 51 	movss  xmm6,DWORD PTR [rip+0x51c20f]        # 0x14084ffdc
   140333dcc:	00 
   140333dcd:	f3 0f 5f c8          	maxss  xmm1,xmm0
   140333dd1:	0f 2f d9             	comiss xmm3,xmm1
   140333dd4:	0f 87 7d 03 00 00    	ja     0x140334157
   140333dda:	eb 08                	jmp    0x140333de4
   140333ddc:	f3 0f 10 35 f8 c1 51 	movss  xmm6,DWORD PTR [rip+0x51c1f8]        # 0x14084ffdc
   140333de3:	00 
   140333de4:	45 33 c0             	xor    r8d,r8d
   140333de7:	41 8b c0             	mov    eax,r8d
   140333dea:	89 44 24 40          	mov    DWORD PTR [rsp+0x40],eax
   140333dee:	41 8d 50 01          	lea    edx,[r8+0x1]
   140333df2:	41 8b c9             	mov    ecx,r9d
   140333df5:	41 8b e8             	mov    ebp,r8d
   140333df8:	48 89 4c 24 48       	mov    QWORD PTR [rsp+0x48],rcx
   140333dfd:	41 8b f4             	mov    esi,r12d
   140333e00:	85 ed                	test   ebp,ebp
   140333e02:	74 05                	je     0x140333e09
   140333e04:	f3 44 0f 59 c6       	mulss  xmm8,xmm6
   140333e09:	f3 41 0f 10 82 28 87 	movss  xmm0,DWORD PTR [r10+0x48728]
   140333e10:	04 00 
   140333e12:	41 0f 2f c0          	comiss xmm0,xmm8
   140333e16:	0f 87 02 03 00 00    	ja     0x14033411e
   140333e1c:	45 0f 2f 82 2c 87 04 	comiss xmm8,DWORD PTR [r10+0x4872c]
   140333e23:	00 
   140333e24:	0f 87 f4 02 00 00    	ja     0x14033411e
   140333e2a:	45 0f 2e ca          	ucomiss xmm9,xmm10
   140333e2e:	7a 02                	jp     0x140333e32
   140333e30:	74 2d                	je     0x140333e5f
   140333e32:	0f 57 c9             	xorps  xmm1,xmm1
   140333e35:	41 0f 28 c1          	movaps xmm0,xmm9
   140333e39:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   140333e3e:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   140333e42:	41 0f 28 c1          	movaps xmm0,xmm9
   140333e46:	f3 0f 5e 05 42 3c 37 	divss  xmm0,DWORD PTR [rip+0x373c42]        # 0x1406a7a90
   140333e4d:	00 
   140333e4e:	41 0f 54 cd          	andps  xmm1,xmm13
   140333e52:	66 0f 5a d1          	cvtpd2ps xmm2,xmm1
   140333e56:	0f 2f d0             	comiss xmm2,xmm0
   140333e59:	0f 87 bf 02 00 00    	ja     0x14033411e
   140333e5f:	48 69 c9 3c 01 00 00 	imul   rcx,rcx,0x13c
   140333e66:	f3 0f 10 3c 19       	movss  xmm7,DWORD PTR [rcx+rbx*1]
   140333e6b:	0f 28 c7             	movaps xmm0,xmm7
   140333e6e:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333e73:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333e76:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333e7b:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333e80:	f2 0f 2c f9          	cvttsd2si edi,xmm1
   140333e84:	85 ed                	test   ebp,ebp
   140333e86:	74 0a                	je     0x140333e92
   140333e88:	66 83 ff 02          	cmp    di,0x2
   140333e8c:	0f 85 87 02 00 00    	jne    0x140334119
   140333e92:	8d 47 ff             	lea    eax,[rdi-0x1]
   140333e95:	66 83 f8 07          	cmp    ax,0x7
   140333e99:	0f 87 76 02 00 00    	ja     0x140334115
   140333e9f:	44 0f b7 ff          	movzx  r15d,di
   140333ea3:	44 89 bc 24 88 00 00 	mov    DWORD PTR [rsp+0x88],r15d
   140333eaa:	00 
   140333eab:	4a 8d 04 39          	lea    rax,[rcx+r15*1]
   140333eaf:	80 bc 18 f3 00 00 00 	cmp    BYTE PTR [rax+rbx*1+0xf3],0x3
   140333eb6:	03 
   140333eb7:	0f 83 53 02 00 00    	jae    0x140334110
   140333ebd:	41 0f 2f fe          	comiss xmm7,xmm14
   140333ec1:	76 13                	jbe    0x140333ed6
   140333ec3:	85 ed                	test   ebp,ebp
   140333ec5:	41 8b c0             	mov    eax,r8d
   140333ec8:	0f 95 c0             	setne  al
   140333ecb:	ff c0                	inc    eax
   140333ecd:	44 3b f8             	cmp    r15d,eax
   140333ed0:	0f 87 3a 02 00 00    	ja     0x140334110
   140333ed6:	41 83 fe 01          	cmp    r14d,0x1
   140333eda:	76 0a                	jbe    0x140333ee6
   140333edc:	40 f6 c7 01          	test   dil,0x1
   140333ee0:	0f 84 2a 02 00 00    	je     0x140334110
   140333ee6:	0f 28 f7             	movaps xmm6,xmm7
   140333ee9:	66 41 0f 6e c7       	movd   xmm0,r15d
   140333eee:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140333ef1:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   140333ef6:	f3 0f 5c f0          	subss  xmm6,xmm0
   140333efa:	44 0f 2f d6          	comiss xmm10,xmm6
   140333efe:	0f 28 ce             	movaps xmm1,xmm6
   140333f01:	76 07                	jbe    0x140333f0a
   140333f03:	0f 57 35 c6 c8 51 00 	xorps  xmm6,XMMWORD PTR [rip+0x51c8c6]        # 0x1408507d0
   140333f0a:	44 0f 2f d1          	comiss xmm10,xmm1
   140333f0e:	41 b8 ff ff ff ff    	mov    r8d,0xffffffff
   140333f14:	49 8b cd             	mov    rcx,r13
   140333f17:	41 0f 28 c8          	movaps xmm1,xmm8
   140333f1b:	44 0f 46 c2          	cmovbe r8d,edx
   140333f1f:	e8 ac 24 01 00       	call   0x1403463d0
   140333f24:	41 8b c6             	mov    eax,r14d
   140333f27:	0f 57 c9             	xorps  xmm1,xmm1
   140333f2a:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140333f2f:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140333f33:	0f 2f f0             	comiss xmm6,xmm0
   140333f36:	0f 87 cc 01 00 00    	ja     0x140334108
   140333f3c:	48 69 d6 3c 01 00 00 	imul   rdx,rsi,0x13c
   140333f43:	48 03 d3             	add    rdx,rbx
   140333f46:	f3 0f 10 02          	movss  xmm0,DWORD PTR [rdx]
   140333f4a:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   140333f4f:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140333f52:	f2 41 0f 58 cb       	addsd  xmm1,xmm11
   140333f57:	f2 41 0f 5f cc       	maxsd  xmm1,xmm12
   140333f5c:	f2 0f 2c d9          	cvttsd2si ebx,xmm1
   140333f60:	85 ed                	test   ebp,ebp
   140333f62:	74 0f                	je     0x140333f73
   140333f64:	41 8d 4f 02          	lea    ecx,[r15+0x2]
   140333f68:	0f b7 c3             	movzx  eax,bx
   140333f6b:	3b c1                	cmp    eax,ecx
   140333f6d:	0f 85 90 01 00 00    	jne    0x140334103
   140333f73:	45 33 c0             	xor    r8d,r8d
   140333f76:	44 0f b7 f3          	movzx  r14d,bx
   140333f7a:	66 83 fb 08          	cmp    bx,0x8
   140333f7e:	0f 87 78 01 00 00    	ja     0x1403340fc
   140333f84:	42 80 bc 32 f3 00 00 	cmp    BYTE PTR [rdx+r14*1+0xf3],0x3
   140333f8b:	00 03 
   140333f8d:	0f 83 5a 01 00 00    	jae    0x1403340ed
   140333f93:	41 0f 2f fe          	comiss xmm7,xmm14
   140333f97:	76 14                	jbe    0x140333fad
   140333f99:	85 ed                	test   ebp,ebp
   140333f9b:	41 8b c0             	mov    eax,r8d
   140333f9e:	0f 95 c0             	setne  al
   140333fa1:	83 c0 03             	add    eax,0x3
   140333fa4:	44 3b f0             	cmp    r14d,eax
   140333fa7:	0f 87 40 01 00 00    	ja     0x1403340ed
   140333fad:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   140333fb2:	45 0f b7 c8          	movzx  r9d,r8w
   140333fb6:	45 0f b7 9a 70 06 00 	movzx  r11d,WORD PTR [r10+0x670]
   140333fbd:	00 
   140333fbe:	66 45 3b c3          	cmp    r8w,r11w
   140333fc2:	0f 83 96 00 00 00    	jae    0x14033405e
   140333fc8:	4d 8b 82 60 06 00 00 	mov    r8,QWORD PTR [r10+0x660]
   140333fcf:	44 8b 7c 24 78       	mov    r15d,DWORD PTR [rsp+0x78]
   140333fd4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140333fd8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140333fdf:	00 
   140333fe0:	45 0f b7 d1          	movzx  r10d,r9w
   140333fe4:	49 69 d2 94 0d 00 00 	imul   rdx,r10,0xd94
   140333feb:	0f b7 cf             	movzx  ecx,di
   140333fee:	48 c1 e1 05          	shl    rcx,0x5
   140333ff2:	48 8d 04 0a          	lea    rax,[rdx+rcx*1]
   140333ff6:	46 39 7c 00 f0       	cmp    DWORD PTR [rax+r8*1-0x10],r15d
   140333ffb:	75 12                	jne    0x14033400f
   140333ffd:	49 8d 46 ff          	lea    rax,[r14-0x1]
   140334001:	48 c1 e0 05          	shl    rax,0x5
   140334005:	48 03 c2             	add    rax,rdx
   140334008:	46 39 64 00 10       	cmp    DWORD PTR [rax+r8*1+0x10],r12d
   14033400d:	74 3f                	je     0x14033404e
   14033400f:	66 41 83 7d 14 02    	cmp    WORD PTR [r13+0x14],0x2
   140334015:	76 2d                	jbe    0x140334044
   140334017:	41 80 bd 97 00 00 00 	cmp    BYTE PTR [r13+0x97],0x0
   14033401e:	00 
   14033401f:	74 23                	je     0x140334044
   140334021:	49 69 d2 94 0d 00 00 	imul   rdx,r10,0xd94
   140334028:	48 8d 04 0a          	lea    rax,[rdx+rcx*1]
   14033402c:	46 39 7c 00 ec       	cmp    DWORD PTR [rax+r8*1-0x14],r15d
   140334031:	75 11                	jne    0x140334044
   140334033:	0f b7 c3             	movzx  eax,bx
   140334036:	48 c1 e0 05          	shl    rax,0x5
   14033403a:	48 03 c2             	add    rax,rdx
   14033403d:	46 39 64 00 ec       	cmp    DWORD PTR [rax+r8*1-0x14],r12d
   140334042:	74 0a                	je     0x14033404e
   140334044:	66 41 ff c1          	inc    r9w
   140334048:	66 45 3b cb          	cmp    r9w,r11w
   14033404c:	72 92                	jb     0x140333fe0
   14033404e:	44 8b bc 24 88 00 00 	mov    r15d,DWORD PTR [rsp+0x88]
   140334055:	00 
   140334056:	45 33 c0             	xor    r8d,r8d
   140334059:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   14033405e:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]
   140334063:	66 45 3b cb          	cmp    r9w,r11w
   140334067:	0f 85 8a 00 00 00    	jne    0x1403340f7
   14033406d:	66 0f 6f 05 7b c7 51 	movdqa xmm0,XMMWORD PTR [rip+0x51c77b]        # 0x1408507f0
   140334074:	00 
   140334075:	4c 8b c3             	mov    r8,rbx
   140334078:	8b 44 24 78          	mov    eax,DWORD PTR [rsp+0x78]
   14033407c:	66 0f 6f c8          	movdqa xmm1,xmm0
   140334080:	8b 94 24 d0 01 00 00 	mov    edx,DWORD PTR [rsp+0x1d0]
   140334087:	89 54 24 38          	mov    DWORD PTR [rsp+0x38],edx
   14033408b:	48 8d 94 24 90 00 00 	lea    rdx,[rsp+0x90]
   140334092:	00 
   140334093:	49 63 cf             	movsxd rcx,r15d
   140334096:	48 89 54 24 30       	mov    QWORD PTR [rsp+0x30],rdx
   14033409b:	49 8b d2             	mov    rdx,r10
   14033409e:	f3 0f 7f 84 24 90 00 	movdqu XMMWORD PTR [rsp+0x90],xmm0
   1403340a5:	00 00 
   1403340a7:	f3 0f 7f 84 24 a0 00 	movdqu XMMWORD PTR [rsp+0xa0],xmm0
   1403340ae:	00 00 
   1403340b0:	89 84 8c 8c 00 00 00 	mov    DWORD PTR [rsp+rcx*4+0x8c],eax
   1403340b7:	41 8d 4f ff          	lea    ecx,[r15-0x1]
   1403340bb:	4c 8b 7c 24 58       	mov    r15,QWORD PTR [rsp+0x58]
   1403340c0:	41 8d 46 ff          	lea    eax,[r14-0x1]
   1403340c4:	89 44 24 28          	mov    DWORD PTR [rsp+0x28],eax
   1403340c8:	89 4c 24 20          	mov    DWORD PTR [rsp+0x20],ecx
   1403340cc:	49 8b cd             	mov    rcx,r13
   1403340cf:	46 89 a4 b4 8c 00 00 	mov    DWORD PTR [rsp+r14*4+0x8c],r12d
   1403340d6:	00 
   1403340d7:	45 0f b7 0f          	movzx  r9d,WORD PTR [r15]
   1403340db:	e8 f0 ee ff ff       	call   0x140332fd0
   1403340e0:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   1403340e5:	45 33 c0             	xor    r8d,r8d
   1403340e8:	41 8b f4             	mov    esi,r12d
   1403340eb:	eb 28                	jmp    0x140334115
   1403340ed:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]
   1403340f2:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   1403340f7:	41 8b f4             	mov    esi,r12d
   1403340fa:	eb 14                	jmp    0x140334110
   1403340fc:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]
   140334101:	eb 08                	jmp    0x14033410b
   140334103:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]
   140334108:	45 33 c0             	xor    r8d,r8d
   14033410b:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   140334110:	4c 8b 7c 24 58       	mov    r15,QWORD PTR [rsp+0x58]
   140334115:	8b 44 24 40          	mov    eax,DWORD PTR [rsp+0x40]
   140334119:	48 8b 4c 24 48       	mov    rcx,QWORD PTR [rsp+0x48]
   14033411e:	f3 0f 10 35 b6 be 51 	movss  xmm6,DWORD PTR [rip+0x51beb6]        # 0x14084ffdc
   140334125:	00 
   140334126:	ff c5                	inc    ebp
   140334128:	44 8b 74 24 68       	mov    r14d,DWORD PTR [rsp+0x68]
   14033412d:	ba 01 00 00 00       	mov    edx,0x1
   140334132:	3b e8                	cmp    ebp,eax
   140334134:	0f 86 c6 fc ff ff    	jbe    0x140333e00
   14033413a:	f3 0f 10 3d 0e 39 37 	movss  xmm7,DWORD PTR [rip+0x37390e]        # 0x1406a7a50
   140334141:	00 
   140334142:	8b f2                	mov    esi,edx
   140334144:	44 0f b7 5c 24 50    	movzx  r11d,WORD PTR [rsp+0x50]
   14033414a:	0f b7 7c 24 52       	movzx  edi,WORD PTR [rsp+0x52]
   14033414f:	f3 0f 10 35 85 be 51 	movss  xmm6,DWORD PTR [rip+0x51be85]        # 0x14084ffdc
   140334156:	00 
   140334157:	f3 0f 10 05 49 39 37 	movss  xmm0,DWORD PTR [rip+0x373949]        # 0x1406a7aa8
   14033415e:	00 
   14033415f:	48 8b 94 24 80 00 00 	mov    rdx,QWORD PTR [rsp+0x80]
   140334166:	00 
   140334167:	41 0f b7 07          	movzx  eax,WORD PTR [r15]
   14033416b:	66 41 ff c3          	inc    r11w
   14033416f:	66 44 89 5c 24 50    	mov    WORD PTR [rsp+0x50],r11w
   140334175:	66 44 3b d8          	cmp    r11w,ax
   140334179:	0f 82 41 f9 ff ff    	jb     0x140333ac0
   14033417f:	66 ff c7             	inc    di
   140334182:	0f b7 c8             	movzx  ecx,ax
   140334185:	66 89 7c 24 52       	mov    WORD PTR [rsp+0x52],di
   14033418a:	66 3b f8             	cmp    di,ax
   14033418d:	0f 82 ef f8 ff ff    	jb     0x140333a82
   140334193:	44 0f 28 bc 24 c0 00 	movaps xmm15,XMMWORD PTR [rsp+0xc0]
   14033419a:	00 00 
   14033419c:	44 0f 28 b4 24 d0 00 	movaps xmm14,XMMWORD PTR [rsp+0xd0]
   1403341a3:	00 00 
   1403341a5:	44 0f 28 ac 24 e0 00 	movaps xmm13,XMMWORD PTR [rsp+0xe0]
   1403341ac:	00 00 
   1403341ae:	44 0f 28 a4 24 f0 00 	movaps xmm12,XMMWORD PTR [rsp+0xf0]
   1403341b5:	00 00 
   1403341b7:	44 0f 28 9c 24 00 01 	movaps xmm11,XMMWORD PTR [rsp+0x100]
   1403341be:	00 00 
   1403341c0:	44 0f 28 84 24 30 01 	movaps xmm8,XMMWORD PTR [rsp+0x130]
   1403341c7:	00 00 
   1403341c9:	0f 28 bc 24 40 01 00 	movaps xmm7,XMMWORD PTR [rsp+0x140]
   1403341d0:	00 
   1403341d1:	0f 28 b4 24 50 01 00 	movaps xmm6,XMMWORD PTR [rsp+0x150]
   1403341d8:	00 
   1403341d9:	4c 8b b4 24 68 01 00 	mov    r14,QWORD PTR [rsp+0x168]
   1403341e0:	00 
   1403341e1:	4c 8b a4 24 70 01 00 	mov    r12,QWORD PTR [rsp+0x170]
   1403341e8:	00 
   1403341e9:	48 8b b4 24 78 01 00 	mov    rsi,QWORD PTR [rsp+0x178]
   1403341f0:	00 
   1403341f1:	48 8b ac 24 80 01 00 	mov    rbp,QWORD PTR [rsp+0x180]
   1403341f8:	00 
   1403341f9:	48 8b 8c 24 b0 00 00 	mov    rcx,QWORD PTR [rsp+0xb0]
   140334200:	00 
   140334201:	48 33 cc             	xor    rcx,rsp
   140334204:	e8 f7 73 2e 00       	call   0x14061b600
   140334209:	4c 8d 9c 24 88 01 00 	lea    r11,[rsp+0x188]
   140334210:	00 
   140334211:	45 0f 28 4b 98       	movaps xmm9,XMMWORD PTR [r11-0x68]
   140334216:	45 0f 28 53 88       	movaps xmm10,XMMWORD PTR [r11-0x78]
   14033421b:	49 8b e3             	mov    rsp,r11
   14033421e:	41 5f                	pop    r15
   140334220:	41 5d                	pop    r13
   140334222:	5f                   	pop    rdi
   140334223:	5b                   	pop    rbx
   140334224:	c3                   	ret
   140334225:	cc                   	int3
   140334226:	cc                   	int3
   140334227:	cc                   	int3
   140334228:	cc                   	int3
   140334229:	cc                   	int3
   14033422a:	cc                   	int3
   14033422b:	cc                   	int3
   14033422c:	cc                   	int3
   14033422d:	cc                   	int3
   14033422e:	cc                   	int3
   14033422f:	cc                   	int3
