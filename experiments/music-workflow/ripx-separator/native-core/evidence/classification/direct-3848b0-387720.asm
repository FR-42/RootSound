
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403848b0 <.text+0x3838b0>:
   1403848b0:	48 8b c4             	mov    rax,rsp
   1403848b3:	55                   	push   rbp
   1403848b4:	41 54                	push   r12
   1403848b6:	41 55                	push   r13
   1403848b8:	41 56                	push   r14
   1403848ba:	41 57                	push   r15
   1403848bc:	48 8d a8 e8 f2 ff ff 	lea    rbp,[rax-0xd18]
   1403848c3:	48 81 ec f0 0d 00 00 	sub    rsp,0xdf0
   1403848ca:	48 c7 44 24 78 fe ff 	mov    QWORD PTR [rsp+0x78],0xfffffffffffffffe
   1403848d1:	ff ff 
   1403848d3:	48 89 58 10          	mov    QWORD PTR [rax+0x10],rbx
   1403848d7:	48 89 70 18          	mov    QWORD PTR [rax+0x18],rsi
   1403848db:	48 89 78 20          	mov    QWORD PTR [rax+0x20],rdi
   1403848df:	0f 29 70 c8          	movaps XMMWORD PTR [rax-0x38],xmm6
   1403848e3:	0f 29 78 b8          	movaps XMMWORD PTR [rax-0x48],xmm7
   1403848e7:	44 0f 29 40 a8       	movaps XMMWORD PTR [rax-0x58],xmm8
   1403848ec:	44 0f 29 48 98       	movaps XMMWORD PTR [rax-0x68],xmm9
   1403848f1:	44 0f 29 50 88       	movaps XMMWORD PTR [rax-0x78],xmm10
   1403848f6:	44 0f 29 98 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm11
   1403848fd:	ff 
   1403848fe:	44 0f 29 a0 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm12
   140384905:	ff 
   140384906:	44 0f 29 a8 58 ff ff 	movaps XMMWORD PTR [rax-0xa8],xmm13
   14038490d:	ff 
   14038490e:	44 0f 29 b0 48 ff ff 	movaps XMMWORD PTR [rax-0xb8],xmm14
   140384915:	ff 
   140384916:	44 0f 29 b8 38 ff ff 	movaps XMMWORD PTR [rax-0xc8],xmm15
   14038491d:	ff 
   14038491e:	48 8b 05 43 d8 5e 00 	mov    rax,QWORD PTR [rip+0x5ed843]        # 0x140972168
   140384925:	48 33 c4             	xor    rax,rsp
   140384928:	48 89 85 40 0c 00 00 	mov    QWORD PTR [rbp+0xc40],rax
   14038492f:	44 88 44 24 4c       	mov    BYTE PTR [rsp+0x4c],r8b
   140384934:	44 0f b6 f2          	movzx  r14d,dl
   140384938:	88 54 24 44          	mov    BYTE PTR [rsp+0x44],dl
   14038493c:	4c 8b f9             	mov    r15,rcx
   14038493f:	48 89 4c 24 30       	mov    QWORD PTR [rsp+0x30],rcx
   140384944:	e8 37 2b 1b 00       	call   0x140537480
   140384949:	c6 05 d0 19 b8 14 00 	mov    BYTE PTR [rip+0x14b819d0],0x0        # 0x154f06320
   140384950:	45 33 c0             	xor    r8d,r8d
   140384953:	33 d2                	xor    edx,edx
   140384955:	33 c9                	xor    ecx,ecx
   140384957:	e8 44 af 00 00       	call   0x14038f8a0
   14038495c:	b8 08 00 00 00       	mov    eax,0x8
   140384961:	89 05 b5 19 b8 14    	mov    DWORD PTR [rip+0x14b819b5],eax        # 0x154f0631c
   140384967:	e8 24 4a 1b 00       	call   0x140539390
   14038496c:	45 33 ed             	xor    r13d,r13d
   14038496f:	4d 8d 65 ff          	lea    r12,[r13-0x1]
   140384973:	c7 44 24 48 fd ff 00 	mov    DWORD PTR [rsp+0x48],0xfffd
   14038497a:	00 
   14038497b:	45 84 f6             	test   r14b,r14b
   14038497e:	0f 84 09 02 00 00    	je     0x140384b8d
   140384984:	45 38 af 96 00 00 00 	cmp    BYTE PTR [r15+0x96],r13b
   14038498b:	0f 84 45 01 00 00    	je     0x140384ad6
   140384991:	41 0f b6 87 92 00 00 	movzx  eax,BYTE PTR [r15+0x92]
   140384998:	00 
   140384999:	0f b7 0d 58 50 5b 00 	movzx  ecx,WORD PTR [rip+0x5b5058]        # 0x1409399f8
   1403849a0:	84 c0                	test   al,al
   1403849a2:	75 37                	jne    0x1403849db
   1403849a4:	45 38 af 93 00 00 00 	cmp    BYTE PTR [r15+0x93],r13b
   1403849ab:	75 2e                	jne    0x1403849db
   1403849ad:	45 38 af 91 00 00 00 	cmp    BYTE PTR [r15+0x91],r13b
   1403849b4:	75 25                	jne    0x1403849db
   1403849b6:	45 38 af 94 00 00 00 	cmp    BYTE PTR [r15+0x94],r13b
   1403849bd:	75 1c                	jne    0x1403849db
   1403849bf:	45 38 af 99 00 00 00 	cmp    BYTE PTR [r15+0x99],r13b
   1403849c6:	75 13                	jne    0x1403849db
   1403849c8:	45 38 af 95 00 00 00 	cmp    BYTE PTR [r15+0x95],r13b
   1403849cf:	75 0a                	jne    0x1403849db
   1403849d1:	66 83 f9 02          	cmp    cx,0x2
   1403849d5:	0f 85 fb 00 00 00    	jne    0x140384ad6
   1403849db:	33 f6                	xor    esi,esi
   1403849dd:	41 38 b7 93 00 00 00 	cmp    BYTE PTR [r15+0x93],sil
   1403849e4:	74 05                	je     0x1403849eb
   1403849e6:	8d 7e 1e             	lea    edi,[rsi+0x1e]
   1403849e9:	eb 5b                	jmp    0x140384a46
   1403849eb:	84 c0                	test   al,al
   1403849ed:	74 07                	je     0x1403849f6
   1403849ef:	bf 01 00 00 00       	mov    edi,0x1
   1403849f4:	eb 50                	jmp    0x140384a46
   1403849f6:	41 38 b7 91 00 00 00 	cmp    BYTE PTR [r15+0x91],sil
   1403849fd:	74 07                	je     0x140384a06
   1403849ff:	bf 07 00 00 00       	mov    edi,0x7
   140384a04:	eb 40                	jmp    0x140384a46
   140384a06:	41 38 b7 94 00 00 00 	cmp    BYTE PTR [r15+0x94],sil
   140384a0d:	74 07                	je     0x140384a16
   140384a0f:	bf 03 00 00 00       	mov    edi,0x3
   140384a14:	eb 30                	jmp    0x140384a46
   140384a16:	41 38 b7 99 00 00 00 	cmp    BYTE PTR [r15+0x99],sil
   140384a1d:	74 07                	je     0x140384a26
   140384a1f:	bf 2e 00 00 00       	mov    edi,0x2e
   140384a24:	eb 20                	jmp    0x140384a46
   140384a26:	41 38 b7 95 00 00 00 	cmp    BYTE PTR [r15+0x95],sil
   140384a2d:	74 07                	je     0x140384a36
   140384a2f:	bf 04 00 00 00       	mov    edi,0x4
   140384a34:	eb 10                	jmp    0x140384a46
   140384a36:	ba 01 00 00 00       	mov    edx,0x1
   140384a3b:	0f b7 fe             	movzx  edi,si
   140384a3e:	66 83 f9 02          	cmp    cx,0x2
   140384a42:	66 0f 44 fa          	cmove  di,dx
   140384a46:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140384a49:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140384a50:	48 8d 1d a9 b5 c7 ff 	lea    rbx,[rip+0xffffffffffc7b5a9]        # 0x140000000
   140384a57:	66 89 b4 19 30 e7 9e 	mov    WORD PTR [rcx+rbx*1+0x9ee730],si
   140384a5e:	00 
   140384a5f:	0f b7 cf             	movzx  ecx,di
   140384a62:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   140384a67:	45 8b cc             	mov    r9d,r12d
   140384a6a:	45 8b 07             	mov    r8d,DWORD PTR [r15]
   140384a6d:	33 d2                	xor    edx,edx
   140384a6f:	e8 bc 6d ff ff       	call   0x14037b830
   140384a74:	41 8b 17             	mov    edx,DWORD PTR [r15]
   140384a77:	48 69 c2 78 ab 06 00 	imul   rax,rdx,0x6ab78
   140384a7e:	39 b4 18 d8 a5 98 00 	cmp    DWORD PTR [rax+rbx*1+0x98a5d8],esi
   140384a85:	0f 86 f8 2b 00 00    	jbe    0x140387683
   140384a8b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140384a90:	8b ce                	mov    ecx,esi
   140384a92:	8b c2                	mov    eax,edx
   140384a94:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140384a9b:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   140384a9f:	48 03 c9             	add    rcx,rcx
   140384aa2:	48 8b 84 18 d0 a5 98 	mov    rax,QWORD PTR [rax+rbx*1+0x98a5d0]
   140384aa9:	00 
   140384aaa:	48 8b 4c c8 30       	mov    rcx,QWORD PTR [rax+rcx*8+0x30]
   140384aaf:	8b c2                	mov    eax,edx
   140384ab1:	48 85 c9             	test   rcx,rcx
   140384ab4:	74 07                	je     0x140384abd
   140384ab6:	66 89 79 20          	mov    WORD PTR [rcx+0x20],di
   140384aba:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140384abd:	ff c6                	inc    esi
   140384abf:	8b d0                	mov    edx,eax
   140384ac1:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140384ac8:	3b b4 19 d8 a5 98 00 	cmp    esi,DWORD PTR [rcx+rbx*1+0x98a5d8]
   140384acf:	72 bf                	jb     0x140384a90
   140384ad1:	e9 ad 2b 00 00       	jmp    0x140387683
   140384ad6:	41 8b 1f             	mov    ebx,DWORD PTR [r15]
   140384ad9:	41 8b b7 50 03 00 00 	mov    esi,DWORD PTR [r15+0x350]
   140384ae0:	85 db                	test   ebx,ebx
   140384ae2:	79 0e                	jns    0x140384af2
   140384ae4:	8b 1d c6 56 60 00    	mov    ebx,DWORD PTR [rip+0x6056c6]        # 0x14098a1b0
   140384aea:	85 db                	test   ebx,ebx
   140384aec:	0f 88 9b 00 00 00    	js     0x140384b8d
   140384af2:	3b 1d d8 c2 62 14    	cmp    ebx,DWORD PTR [rip+0x1462c2d8]        # 0x1549b0dd0
   140384af8:	0f 8d 8f 00 00 00    	jge    0x140384b8d
   140384afe:	41 0f b7 fd          	movzx  edi,r13w
   140384b02:	41 bf fd ff 00 00    	mov    r15d,0xfffd
   140384b08:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140384b0f:	00 
   140384b10:	8d 47 ff             	lea    eax,[rdi-0x1]
   140384b13:	66 83 f8 01          	cmp    ax,0x1
   140384b17:	77 06                	ja     0x140384b1f
   140384b19:	40 f6 c6 02          	test   sil,0x2
   140384b1d:	75 3c                	jne    0x140384b5b
   140384b1f:	8d 47 fc             	lea    eax,[rdi-0x4]
   140384b22:	66 83 f8 02          	cmp    ax,0x2
   140384b26:	77 06                	ja     0x140384b2e
   140384b28:	40 f6 c6 04          	test   sil,0x4
   140384b2c:	75 2d                	jne    0x140384b5b
   140384b2e:	8d 47 f9             	lea    eax,[rdi-0x7]
   140384b31:	66 83 f8 01          	cmp    ax,0x1
   140384b35:	77 06                	ja     0x140384b3d
   140384b37:	40 f6 c6 08          	test   sil,0x8
   140384b3b:	75 1e                	jne    0x140384b5b
   140384b3d:	66 83 ff 03          	cmp    di,0x3
   140384b41:	75 06                	jne    0x140384b49
   140384b43:	40 f6 c6 10          	test   sil,0x10
   140384b47:	75 12                	jne    0x140384b5b
   140384b49:	44 38 2d c0 53 60 00 	cmp    BYTE PTR [rip+0x6053c0],r13b        # 0x140989f10
   140384b50:	75 18                	jne    0x140384b6a
   140384b52:	8d 47 f7             	lea    eax,[rdi-0x9]
   140384b55:	66 41 85 c7          	test   r15w,ax
   140384b59:	75 0f                	jne    0x140384b6a
   140384b5b:	0f b7 cf             	movzx  ecx,di
   140384b5e:	44 8b c3             	mov    r8d,ebx
   140384b61:	33 d2                	xor    edx,edx
   140384b63:	e8 38 70 ff ff       	call   0x14037bba0
   140384b68:	eb 15                	jmp    0x140384b7f
   140384b6a:	0f b7 cf             	movzx  ecx,di
   140384b6d:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   140384b72:	45 8b cc             	mov    r9d,r12d
   140384b75:	44 8b c3             	mov    r8d,ebx
   140384b78:	33 d2                	xor    edx,edx
   140384b7a:	e8 b1 6c ff ff       	call   0x14037b830
   140384b7f:	66 ff c7             	inc    di
   140384b82:	66 83 ff 7f          	cmp    di,0x7f
   140384b86:	76 88                	jbe    0x140384b10
   140384b88:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   140384b8d:	44 89 6c 24 38       	mov    DWORD PTR [rsp+0x38],r13d
   140384b92:	41 0f b6 c6          	movzx  eax,r14b
   140384b96:	83 c0 01             	add    eax,0x1
   140384b99:	89 44 24 50          	mov    DWORD PTR [rsp+0x50],eax
   140384b9d:	be 01 00 00 00       	mov    esi,0x1
   140384ba2:	4c 8d 35 57 b4 c7 ff 	lea    r14,[rip+0xffffffffffc7b457]        # 0x140000000
   140384ba9:	bb ff ff 00 00       	mov    ebx,0xffff
   140384bae:	45 0f 57 d2          	xorps  xmm10,xmm10
   140384bb2:	0f 84 e5 11 00 00    	je     0x140385d9d
   140384bb8:	49 8d bf d0 00 00 00 	lea    rdi,[r15+0xd0]
   140384bbf:	48 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],rdi
   140384bc4:	44 8d 66 06          	lea    r12d,[rsi+0x6]
   140384bc8:	f3 44 0f 10 0d 07 95 	movss  xmm9,DWORD PTR [rip+0x309507]        # 0x14068e0d8
   140384bcf:	30 00 
   140384bd1:	f2 0f 10 35 27 b7 4c 	movsd  xmm6,QWORD PTR [rip+0x4cb727]        # 0x140850300
   140384bd8:	00 
   140384bd9:	f2 0f 10 3d d7 b4 4c 	movsd  xmm7,QWORD PTR [rip+0x4cb4d7]        # 0x1408500b8
   140384be0:	00 
   140384be1:	f2 44 0f 10 05 96 b4 	movsd  xmm8,QWORD PTR [rip+0x4cb496]        # 0x140850080
   140384be8:	4c 00 
   140384bea:	eb 09                	jmp    0x140384bf5
   140384bec:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140384bf0:	be 01 00 00 00       	mov    esi,0x1
   140384bf5:	e8 96 47 1b 00       	call   0x140539390
   140384bfa:	8b 05 88 67 5e 00    	mov    eax,DWORD PTR [rip+0x5e6788]        # 0x14096b388
   140384c00:	03 c0                	add    eax,eax
   140384c02:	ba 10 00 00 00       	mov    edx,0x10
   140384c07:	3b c2                	cmp    eax,edx
   140384c09:	0f 42 d0             	cmovb  edx,eax
   140384c0c:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140384c0f:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140384c16:	42 8b 84 31 d8 a5 98 	mov    eax,DWORD PTR [rcx+r14*1+0x98a5d8]
   140384c1d:	00 
   140384c1e:	c1 e8 04             	shr    eax,0x4
   140384c21:	3b d0                	cmp    edx,eax
   140384c23:	0f 43 d0             	cmovae edx,eax
   140384c26:	44 8b ee             	mov    r13d,esi
   140384c29:	83 fa 01             	cmp    edx,0x1
   140384c2c:	44 0f 47 ea          	cmova  r13d,edx
   140384c30:	33 f6                	xor    esi,esi
   140384c32:	44 8b f6             	mov    r14d,esi
   140384c35:	33 d2                	xor    edx,edx
   140384c37:	41 b8 80 00 00 00    	mov    r8d,0x80
   140384c3d:	48 8b cf             	mov    rcx,rdi
   140384c40:	e8 a5 c0 29 00       	call   0x140620cea
   140384c45:	45 85 ed             	test   r13d,r13d
   140384c48:	0f 84 07 01 00 00    	je     0x140384d55
   140384c4e:	45 8d 65 ff          	lea    r12d,[r13-0x1]
   140384c52:	4c 8b ff             	mov    r15,rdi
   140384c55:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   140384c5a:	48 8d 98 d4 01 00 00 	lea    rbx,[rax+0x1d4]
   140384c61:	eb 12                	jmp    0x140384c75
   140384c63:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140384c67:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140384c6e:	00 00 
   140384c70:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   140384c75:	45 8b c6             	mov    r8d,r14d
   140384c78:	48 89 43 0c          	mov    QWORD PTR [rbx+0xc],rax
   140384c7c:	44 89 73 fc          	mov    DWORD PTR [rbx-0x4],r14d
   140384c80:	8b 00                	mov    eax,DWORD PTR [rax]
   140384c82:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140384c89:	48 8d 05 70 b3 c7 ff 	lea    rax,[rip+0xffffffffffc7b370]        # 0x140000000
   140384c90:	41 3b f4             	cmp    esi,r12d
   140384c93:	75 0b                	jne    0x140384ca0
   140384c95:	8b 84 01 d8 a5 98 00 	mov    eax,DWORD PTR [rcx+rax*1+0x98a5d8]
   140384c9c:	89 03                	mov    DWORD PTR [rbx],eax
   140384c9e:	eb 2c                	jmp    0x140384ccc
   140384ca0:	8b bc 01 d8 a5 98 00 	mov    edi,DWORD PTR [rcx+rax*1+0x98a5d8]
   140384ca7:	8d 46 01             	lea    eax,[rsi+0x1]
   140384caa:	0f af c7             	imul   eax,edi
   140384cad:	33 d2                	xor    edx,edx
   140384caf:	41 f7 f5             	div    r13d
   140384cb2:	41 8d 4e 01          	lea    ecx,[r14+0x1]
   140384cb6:	44 8b f0             	mov    r14d,eax
   140384cb9:	3b c8                	cmp    ecx,eax
   140384cbb:	44 0f 43 f1          	cmovae r14d,ecx
   140384cbf:	44 3b f7             	cmp    r14d,edi
   140384cc2:	44 0f 43 f7          	cmovae r14d,edi
   140384cc6:	44 89 33             	mov    DWORD PTR [rbx],r14d
   140384cc9:	41 8b c6             	mov    eax,r14d
   140384ccc:	41 2b c0             	sub    eax,r8d
   140384ccf:	83 f8 01             	cmp    eax,0x1
   140384cd2:	72 76                	jb     0x140384d4a
   140384cd4:	33 ff                	xor    edi,edi
   140384cd6:	89 7b 04             	mov    DWORD PTR [rbx+0x4],edi
   140384cd9:	89 73 08             	mov    DWORD PTR [rbx+0x8],esi
   140384cdc:	8d 4f 10             	lea    ecx,[rdi+0x10]
   140384cdf:	e8 6c 69 29 00       	call   0x14061b650
   140384ce4:	48 8b c8             	mov    rcx,rax
   140384ce7:	48 89 44 24 70       	mov    QWORD PTR [rsp+0x70],rax
   140384cec:	48 85 c0             	test   rax,rax
   140384cef:	74 38                	je     0x140384d29
   140384cf1:	8b c6                	mov    eax,esi
   140384cf3:	48 8b 54 24 30       	mov    rdx,QWORD PTR [rsp+0x30]
   140384cf8:	4c 8d 8a 50 01 00 00 	lea    r9,[rdx+0x150]
   140384cff:	4d 8d 0c c1          	lea    r9,[r9+rax*8]
   140384d03:	48 8d 04 40          	lea    rax,[rax+rax*2]
   140384d07:	48 8d 40 3a          	lea    rax,[rax+0x3a]
   140384d0b:	4c 8d 04 c2          	lea    r8,[rdx+rax*8]
   140384d0f:	89 7c 24 28          	mov    DWORD PTR [rsp+0x28],edi
   140384d13:	c7 44 24 20 01 00 00 	mov    DWORD PTR [rsp+0x20],0x1
   140384d1a:	00 
   140384d1b:	48 8d 15 6e ee ff ff 	lea    rdx,[rip+0xffffffffffffee6e]        # 0x140383b90
   140384d22:	e8 59 50 1a 00       	call   0x140529d80
   140384d27:	eb 03                	jmp    0x140384d2c
   140384d29:	48 8b c7             	mov    rax,rdi
   140384d2c:	49 89 07             	mov    QWORD PTR [r15],rax
   140384d2f:	48 8b c8             	mov    rcx,rax
   140384d32:	e8 89 51 1a 00       	call   0x140529ec0
   140384d37:	ff c6                	inc    esi
   140384d39:	49 83 c7 08          	add    r15,0x8
   140384d3d:	48 83 c3 18          	add    rbx,0x18
   140384d41:	41 3b f5             	cmp    esi,r13d
   140384d44:	0f 82 26 ff ff ff    	jb     0x140384c70
   140384d4a:	41 bc 07 00 00 00    	mov    r12d,0x7
   140384d50:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   140384d55:	45 33 ed             	xor    r13d,r13d
   140384d58:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140384d5f:	00 
   140384d60:	b9 14 00 00 00       	mov    ecx,0x14
   140384d65:	ff 15 fd 38 30 00    	call   QWORD PTR [rip+0x3038fd]        # 0x140688668
   140384d6b:	41 8b cd             	mov    ecx,r13d
   140384d6e:	85 f6                	test   esi,esi
   140384d70:	74 12                	je     0x140384d84
   140384d72:	48 8b c7             	mov    rax,rdi
   140384d75:	4c 39 28             	cmp    QWORD PTR [rax],r13
   140384d78:	75 e6                	jne    0x140384d60
   140384d7a:	ff c1                	inc    ecx
   140384d7c:	48 83 c0 08          	add    rax,0x8
   140384d80:	3b ce                	cmp    ecx,esi
   140384d82:	72 f1                	jb     0x140384d75
   140384d84:	41 8b dd             	mov    ebx,r13d
   140384d87:	45 8b f5             	mov    r14d,r13d
   140384d8a:	44 89 6c 24 40       	mov    DWORD PTR [rsp+0x40],r13d
   140384d8f:	45 8b fd             	mov    r15d,r13d
   140384d92:	44 89 6c 24 3c       	mov    DWORD PTR [rsp+0x3c],r13d
   140384d97:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   140384d9c:	8b 38                	mov    edi,DWORD PTR [rax]
   140384d9e:	48 69 c7 78 ab 06 00 	imul   rax,rdi,0x6ab78
   140384da5:	4c 8d 0d 54 b2 c7 ff 	lea    r9,[rip+0xffffffffffc7b254]        # 0x140000000
   140384dac:	46 39 ac 08 04 a6 98 	cmp    DWORD PTR [rax+r9*1+0x98a604],r13d
   140384db3:	00 
   140384db4:	0f 86 d6 04 00 00    	jbe    0x140385290
   140384dba:	4c 8b 64 24 30       	mov    r12,QWORD PTR [rsp+0x30]
   140384dbf:	90                   	nop
   140384dc0:	8b c7                	mov    eax,edi
   140384dc2:	48 69 f0 78 ab 06 00 	imul   rsi,rax,0x6ab78
   140384dc9:	42 8b 94 0e d8 a5 98 	mov    edx,DWORD PTR [rsi+r9*1+0x98a5d8]
   140384dd0:	00 
   140384dd1:	44 3b f2             	cmp    r14d,edx
   140384dd4:	73 4c                	jae    0x140384e22
   140384dd6:	4a 8b bc 0e d0 a5 98 	mov    rdi,QWORD PTR [rsi+r9*1+0x98a5d0]
   140384ddd:	00 
   140384dde:	41 8b c7             	mov    eax,r15d
   140384de1:	48 8d 0c 86          	lea    rcx,[rsi+rax*4]
   140384de5:	f3 42 0f 10 8c 09 08 	movss  xmm1,DWORD PTR [rcx+r9*1+0x98a608]
   140384dec:	a6 98 00 
   140384def:	f3 41 0f 5c c9       	subss  xmm1,xmm9
   140384df4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140384df8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140384dff:	00 
   140384e00:	41 8b c6             	mov    eax,r14d
   140384e03:	48 8d 0c c0          	lea    rcx,[rax+rax*8]
   140384e07:	48 03 c9             	add    rcx,rcx
   140384e0a:	f3 0f 10 44 cf 10    	movss  xmm0,DWORD PTR [rdi+rcx*8+0x10]
   140384e10:	0f 2f c1             	comiss xmm0,xmm1
   140384e13:	73 08                	jae    0x140384e1d
   140384e15:	41 ff c6             	inc    r14d
   140384e18:	44 3b f2             	cmp    r14d,edx
   140384e1b:	72 e3                	jb     0x140384e00
   140384e1d:	44 89 74 24 40       	mov    DWORD PTR [rsp+0x40],r14d
   140384e22:	33 d2                	xor    edx,edx
   140384e24:	41 b8 00 04 00 00    	mov    r8d,0x400
   140384e2a:	48 8d 8d c0 03 00 00 	lea    rcx,[rbp+0x3c0]
   140384e31:	e8 b4 be 29 00       	call   0x140620cea
   140384e36:	4c 8d 0d c3 b1 c7 ff 	lea    r9,[rip+0xffffffffffc7b1c3]        # 0x140000000
   140384e3d:	41 3b de             	cmp    ebx,r14d
   140384e40:	0f 83 b7 01 00 00    	jae    0x140384ffd
   140384e46:	8b c3                	mov    eax,ebx
   140384e48:	48 8d 3c c0          	lea    rdi,[rax+rax*8]
   140384e4c:	48 c1 e7 04          	shl    rdi,0x4
   140384e50:	48 83 c7 30          	add    rdi,0x30
   140384e54:	4a 03 bc 0e d0 a5 98 	add    rdi,QWORD PTR [rsi+r9*1+0x98a5d0]
   140384e5b:	00 
   140384e5c:	41 8b f6             	mov    esi,r14d
   140384e5f:	2b f3                	sub    esi,ebx
   140384e61:	41 bc fd ff 00 00    	mov    r12d,0xfffd
   140384e67:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140384e6e:	00 00 
   140384e70:	48 8b 0f             	mov    rcx,QWORD PTR [rdi]
   140384e73:	48 85 c9             	test   rcx,rcx
   140384e76:	0f 84 6b 01 00 00    	je     0x140384fe7
   140384e7c:	66 44 39 a9 1c 02 00 	cmp    WORD PTR [rcx+0x21c],r13w
   140384e83:	00 
   140384e84:	0f 8c 5d 01 00 00    	jl     0x140384fe7
   140384e8a:	0f b7 51 20          	movzx  edx,WORD PTR [rcx+0x20]
   140384e8e:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384e91:	66 41 3b c4          	cmp    ax,r12w
   140384e95:	0f 87 4c 01 00 00    	ja     0x140384fe7
   140384e9b:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384e9e:	66 83 f8 7e          	cmp    ax,0x7e
   140384ea2:	77 1d                	ja     0x140384ec1
   140384ea4:	0f b7 c2             	movzx  eax,dx
   140384ea7:	f3 0f 10 41 24       	movss  xmm0,DWORD PTR [rcx+0x24]
   140384eac:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384eaf:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384eb6:	00 00 
   140384eb8:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384ebf:	00 00 
   140384ec1:	0f b7 51 28          	movzx  edx,WORD PTR [rcx+0x28]
   140384ec5:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384ec8:	66 83 f8 7e          	cmp    ax,0x7e
   140384ecc:	77 1d                	ja     0x140384eeb
   140384ece:	0f b7 c2             	movzx  eax,dx
   140384ed1:	f3 0f 10 41 2c       	movss  xmm0,DWORD PTR [rcx+0x2c]
   140384ed6:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384ed9:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384ee0:	00 00 
   140384ee2:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384ee9:	00 00 
   140384eeb:	0f b7 51 30          	movzx  edx,WORD PTR [rcx+0x30]
   140384eef:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384ef2:	66 83 f8 7e          	cmp    ax,0x7e
   140384ef6:	77 1d                	ja     0x140384f15
   140384ef8:	0f b7 c2             	movzx  eax,dx
   140384efb:	f3 0f 10 41 34       	movss  xmm0,DWORD PTR [rcx+0x34]
   140384f00:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384f03:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384f0a:	00 00 
   140384f0c:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384f13:	00 00 
   140384f15:	0f b7 51 38          	movzx  edx,WORD PTR [rcx+0x38]
   140384f19:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384f1c:	66 83 f8 7e          	cmp    ax,0x7e
   140384f20:	77 1d                	ja     0x140384f3f
   140384f22:	0f b7 c2             	movzx  eax,dx
   140384f25:	f3 0f 10 41 3c       	movss  xmm0,DWORD PTR [rcx+0x3c]
   140384f2a:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384f2d:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384f34:	00 00 
   140384f36:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384f3d:	00 00 
   140384f3f:	0f b7 51 40          	movzx  edx,WORD PTR [rcx+0x40]
   140384f43:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384f46:	66 83 f8 7e          	cmp    ax,0x7e
   140384f4a:	77 1d                	ja     0x140384f69
   140384f4c:	0f b7 c2             	movzx  eax,dx
   140384f4f:	f3 0f 10 41 44       	movss  xmm0,DWORD PTR [rcx+0x44]
   140384f54:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384f57:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384f5e:	00 00 
   140384f60:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384f67:	00 00 
   140384f69:	0f b7 51 48          	movzx  edx,WORD PTR [rcx+0x48]
   140384f6d:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384f70:	66 83 f8 7e          	cmp    ax,0x7e
   140384f74:	77 1d                	ja     0x140384f93
   140384f76:	0f b7 c2             	movzx  eax,dx
   140384f79:	f3 0f 10 41 4c       	movss  xmm0,DWORD PTR [rcx+0x4c]
   140384f7e:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384f81:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384f88:	00 00 
   140384f8a:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384f91:	00 00 
   140384f93:	0f b7 51 50          	movzx  edx,WORD PTR [rcx+0x50]
   140384f97:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384f9a:	66 83 f8 7e          	cmp    ax,0x7e
   140384f9e:	77 1d                	ja     0x140384fbd
   140384fa0:	0f b7 c2             	movzx  eax,dx
   140384fa3:	f3 0f 10 41 54       	movss  xmm0,DWORD PTR [rcx+0x54]
   140384fa8:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384fab:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384fb2:	00 00 
   140384fb4:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384fbb:	00 00 
   140384fbd:	0f b7 51 58          	movzx  edx,WORD PTR [rcx+0x58]
   140384fc1:	8d 42 ff             	lea    eax,[rdx-0x1]
   140384fc4:	66 83 f8 7e          	cmp    ax,0x7e
   140384fc8:	77 1d                	ja     0x140384fe7
   140384fca:	0f b7 c2             	movzx  eax,dx
   140384fcd:	f3 0f 10 41 5c       	movss  xmm0,DWORD PTR [rcx+0x5c]
   140384fd2:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140384fd5:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140384fdc:	00 00 
   140384fde:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140384fe5:	00 00 
   140384fe7:	48 81 c7 90 00 00 00 	add    rdi,0x90
   140384fee:	48 83 ee 01          	sub    rsi,0x1
   140384ff2:	0f 85 78 fe ff ff    	jne    0x140384e70
   140384ff8:	4c 8b 64 24 30       	mov    r12,QWORD PTR [rsp+0x30]
   140384ffd:	f2 0f 10 8d f0 03 00 	movsd  xmm1,QWORD PTR [rbp+0x3f0]
   140385004:	00 
   140385005:	f2 0f 10 85 e8 03 00 	movsd  xmm0,QWORD PTR [rbp+0x3e8]
   14038500c:	00 
   14038500d:	66 0f 2f c8          	comisd xmm1,xmm0
   140385011:	77 03                	ja     0x140385016
   140385013:	0f 28 c8             	movaps xmm1,xmm0
   140385016:	f2 0f 10 85 e0 03 00 	movsd  xmm0,QWORD PTR [rbp+0x3e0]
   14038501d:	00 
   14038501e:	66 0f 2f c8          	comisd xmm1,xmm0
   140385022:	77 03                	ja     0x140385027
   140385024:	0f 28 c8             	movaps xmm1,xmm0
   140385027:	f2 0f 11 8d e0 03 00 	movsd  QWORD PTR [rbp+0x3e0],xmm1
   14038502e:	00 
   14038502f:	f2 0f 10 85 d8 03 00 	movsd  xmm0,QWORD PTR [rbp+0x3d8]
   140385036:	00 
   140385037:	66 0f 2f c1          	comisd xmm0,xmm1
   14038503b:	40 0f 97 c6          	seta   sil
   14038503f:	41 3b de             	cmp    ebx,r14d
   140385042:	0f 83 1c 02 00 00    	jae    0x140385264
   140385048:	8b c3                	mov    eax,ebx
   14038504a:	48 8d 3c c0          	lea    rdi,[rax+rax*8]
   14038504e:	48 c1 e7 04          	shl    rdi,0x4
   140385052:	45 8b c6             	mov    r8d,r14d
   140385055:	44 2b c3             	sub    r8d,ebx
   140385058:	48 8b 54 24 30       	mov    rdx,QWORD PTR [rsp+0x30]
   14038505d:	41 bf 03 00 00 00    	mov    r15d,0x3
   140385063:	45 8d 77 01          	lea    r14d,[r15+0x1]
   140385067:	8b 02                	mov    eax,DWORD PTR [rdx]
   140385069:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140385070:	4a 8b 84 08 d0 a5 98 	mov    rax,QWORD PTR [rax+r9*1+0x98a5d0]
   140385077:	00 
   140385078:	48 8b 4c 38 30       	mov    rcx,QWORD PTR [rax+rdi*1+0x30]
   14038507d:	48 85 c9             	test   rcx,rcx
   140385080:	0f 84 be 01 00 00    	je     0x140385244
   140385086:	44 38 aa 98 00 00 00 	cmp    BYTE PTR [rdx+0x98],r13b
   14038508d:	74 48                	je     0x1403850d7
   14038508f:	66 44 39 a9 1c 02 00 	cmp    WORD PTR [rcx+0x21c],r13w
   140385096:	00 
   140385097:	7d 3e                	jge    0x1403850d7
   140385099:	0f b7 41 20          	movzx  eax,WORD PTR [rcx+0x20]
   14038509d:	66 ff c0             	inc    ax
   1403850a0:	41 ba fe ff 00 00    	mov    r10d,0xfffe
   1403850a6:	66 41 85 c2          	test   r10w,ax
   1403850aa:	75 2b                	jne    0x1403850d7
   1403850ac:	40 84 f6             	test   sil,sil
   1403850af:	74 11                	je     0x1403850c2
   1403850b1:	66 41 0f 2f c2       	comisd xmm0,xmm10
   1403850b6:	76 0a                	jbe    0x1403850c2
   1403850b8:	66 44 89 79 20       	mov    WORD PTR [rcx+0x20],r15w
   1403850bd:	e9 82 01 00 00       	jmp    0x140385244
   1403850c2:	66 41 0f 2f ca       	comisd xmm1,xmm10
   1403850c7:	0f 86 77 01 00 00    	jbe    0x140385244
   1403850cd:	66 44 89 71 20       	mov    WORD PTR [rcx+0x20],r14w
   1403850d2:	e9 6d 01 00 00       	jmp    0x140385244
   1403850d7:	0f b7 51 20          	movzx  edx,WORD PTR [rcx+0x20]
   1403850db:	8d 42 ff             	lea    eax,[rdx-0x1]
   1403850de:	41 ba fd ff 00 00    	mov    r10d,0xfffd
   1403850e4:	66 41 3b c2          	cmp    ax,r10w
   1403850e8:	0f 87 51 01 00 00    	ja     0x14038523f
   1403850ee:	40 84 f6             	test   sil,sil
   1403850f1:	0f 84 c2 00 00 00    	je     0x1403851b9
   1403850f7:	66 41 2b d6          	sub    dx,r14w
   1403850fb:	66 83 fa 02          	cmp    dx,0x2
   1403850ff:	77 09                	ja     0x14038510a
   140385101:	44 89 69 24          	mov    DWORD PTR [rcx+0x24],r13d
   140385105:	66 44 89 79 20       	mov    WORD PTR [rcx+0x20],r15w
   14038510a:	0f b7 41 28          	movzx  eax,WORD PTR [rcx+0x28]
   14038510e:	66 41 2b c6          	sub    ax,r14w
   140385112:	66 83 f8 02          	cmp    ax,0x2
   140385116:	77 09                	ja     0x140385121
   140385118:	44 89 69 2c          	mov    DWORD PTR [rcx+0x2c],r13d
   14038511c:	66 44 89 79 28       	mov    WORD PTR [rcx+0x28],r15w
   140385121:	0f b7 41 30          	movzx  eax,WORD PTR [rcx+0x30]
   140385125:	66 41 2b c6          	sub    ax,r14w
   140385129:	66 83 f8 02          	cmp    ax,0x2
   14038512d:	77 09                	ja     0x140385138
   14038512f:	44 89 69 34          	mov    DWORD PTR [rcx+0x34],r13d
   140385133:	66 44 89 79 30       	mov    WORD PTR [rcx+0x30],r15w
   140385138:	0f b7 41 38          	movzx  eax,WORD PTR [rcx+0x38]
   14038513c:	66 41 2b c6          	sub    ax,r14w
   140385140:	66 83 f8 02          	cmp    ax,0x2
   140385144:	77 09                	ja     0x14038514f
   140385146:	44 89 69 3c          	mov    DWORD PTR [rcx+0x3c],r13d
   14038514a:	66 44 89 79 38       	mov    WORD PTR [rcx+0x38],r15w
   14038514f:	0f b7 41 40          	movzx  eax,WORD PTR [rcx+0x40]
   140385153:	66 41 2b c6          	sub    ax,r14w
   140385157:	66 83 f8 02          	cmp    ax,0x2
   14038515b:	77 09                	ja     0x140385166
   14038515d:	44 89 69 44          	mov    DWORD PTR [rcx+0x44],r13d
   140385161:	66 44 89 79 40       	mov    WORD PTR [rcx+0x40],r15w
   140385166:	0f b7 41 48          	movzx  eax,WORD PTR [rcx+0x48]
   14038516a:	66 41 2b c6          	sub    ax,r14w
   14038516e:	66 83 f8 02          	cmp    ax,0x2
   140385172:	77 09                	ja     0x14038517d
   140385174:	44 89 69 4c          	mov    DWORD PTR [rcx+0x4c],r13d
   140385178:	66 44 89 79 48       	mov    WORD PTR [rcx+0x48],r15w
   14038517d:	0f b7 41 50          	movzx  eax,WORD PTR [rcx+0x50]
   140385181:	66 41 2b c6          	sub    ax,r14w
   140385185:	66 83 f8 02          	cmp    ax,0x2
   140385189:	77 09                	ja     0x140385194
   14038518b:	44 89 69 54          	mov    DWORD PTR [rcx+0x54],r13d
   14038518f:	66 44 89 79 50       	mov    WORD PTR [rcx+0x50],r15w
   140385194:	0f b7 41 58          	movzx  eax,WORD PTR [rcx+0x58]
   140385198:	66 41 2b c6          	sub    ax,r14w
   14038519c:	48 8b 54 24 30       	mov    rdx,QWORD PTR [rsp+0x30]
   1403851a1:	66 83 f8 02          	cmp    ax,0x2
   1403851a5:	0f 87 99 00 00 00    	ja     0x140385244
   1403851ab:	44 89 69 5c          	mov    DWORD PTR [rcx+0x5c],r13d
   1403851af:	66 44 89 79 58       	mov    WORD PTR [rcx+0x58],r15w
   1403851b4:	e9 8b 00 00 00       	jmp    0x140385244
   1403851b9:	66 41 3b d7          	cmp    dx,r15w
   1403851bd:	75 09                	jne    0x1403851c8
   1403851bf:	44 89 69 24          	mov    DWORD PTR [rcx+0x24],r13d
   1403851c3:	66 44 89 71 20       	mov    WORD PTR [rcx+0x20],r14w
   1403851c8:	66 44 39 79 28       	cmp    WORD PTR [rcx+0x28],r15w
   1403851cd:	75 09                	jne    0x1403851d8
   1403851cf:	44 89 69 2c          	mov    DWORD PTR [rcx+0x2c],r13d
   1403851d3:	66 44 89 71 28       	mov    WORD PTR [rcx+0x28],r14w
   1403851d8:	66 44 39 79 30       	cmp    WORD PTR [rcx+0x30],r15w
   1403851dd:	75 09                	jne    0x1403851e8
   1403851df:	44 89 69 34          	mov    DWORD PTR [rcx+0x34],r13d
   1403851e3:	66 44 89 71 30       	mov    WORD PTR [rcx+0x30],r14w
   1403851e8:	66 44 39 79 38       	cmp    WORD PTR [rcx+0x38],r15w
   1403851ed:	75 09                	jne    0x1403851f8
   1403851ef:	44 89 69 3c          	mov    DWORD PTR [rcx+0x3c],r13d
   1403851f3:	66 44 89 71 38       	mov    WORD PTR [rcx+0x38],r14w
   1403851f8:	66 44 39 79 40       	cmp    WORD PTR [rcx+0x40],r15w
   1403851fd:	75 09                	jne    0x140385208
   1403851ff:	44 89 69 44          	mov    DWORD PTR [rcx+0x44],r13d
   140385203:	66 44 89 71 40       	mov    WORD PTR [rcx+0x40],r14w
   140385208:	66 44 39 79 48       	cmp    WORD PTR [rcx+0x48],r15w
   14038520d:	75 09                	jne    0x140385218
   14038520f:	44 89 69 4c          	mov    DWORD PTR [rcx+0x4c],r13d
   140385213:	66 44 89 71 48       	mov    WORD PTR [rcx+0x48],r14w
   140385218:	66 44 39 79 50       	cmp    WORD PTR [rcx+0x50],r15w
   14038521d:	75 09                	jne    0x140385228
   14038521f:	44 89 69 54          	mov    DWORD PTR [rcx+0x54],r13d
   140385223:	66 44 89 71 50       	mov    WORD PTR [rcx+0x50],r14w
   140385228:	48 8b 54 24 30       	mov    rdx,QWORD PTR [rsp+0x30]
   14038522d:	66 44 39 79 58       	cmp    WORD PTR [rcx+0x58],r15w
   140385232:	75 10                	jne    0x140385244
   140385234:	44 89 69 5c          	mov    DWORD PTR [rcx+0x5c],r13d
   140385238:	66 44 89 71 58       	mov    WORD PTR [rcx+0x58],r14w
   14038523d:	eb 05                	jmp    0x140385244
   14038523f:	48 8b 54 24 30       	mov    rdx,QWORD PTR [rsp+0x30]
   140385244:	48 81 c7 90 00 00 00 	add    rdi,0x90
   14038524b:	49 83 e8 01          	sub    r8,0x1
   14038524f:	0f 85 12 fe ff ff    	jne    0x140385067
   140385255:	44 8b 74 24 40       	mov    r14d,DWORD PTR [rsp+0x40]
   14038525a:	44 8b 7c 24 3c       	mov    r15d,DWORD PTR [rsp+0x3c]
   14038525f:	4c 8b 64 24 30       	mov    r12,QWORD PTR [rsp+0x30]
   140385264:	41 8b de             	mov    ebx,r14d
   140385267:	41 ff c7             	inc    r15d
   14038526a:	44 89 7c 24 3c       	mov    DWORD PTR [rsp+0x3c],r15d
   14038526f:	41 8b 0c 24          	mov    ecx,DWORD PTR [r12]
   140385273:	8b f9                	mov    edi,ecx
   140385275:	48 69 c1 78 ab 06 00 	imul   rax,rcx,0x6ab78
   14038527c:	46 3b bc 08 04 a6 98 	cmp    r15d,DWORD PTR [rax+r9*1+0x98a604]
   140385283:	00 
   140385284:	0f 82 36 fb ff ff    	jb     0x140384dc0
   14038528a:	41 bc 07 00 00 00    	mov    r12d,0x7
   140385290:	33 d2                	xor    edx,edx
   140385292:	41 b8 00 04 00 00    	mov    r8d,0x400
   140385298:	48 8d 8d c0 03 00 00 	lea    rcx,[rbp+0x3c0]
   14038529f:	e8 46 ba 29 00       	call   0x140620cea
   1403852a4:	8b c7                	mov    eax,edi
   1403852a6:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403852ad:	4c 8d 35 4c ad c7 ff 	lea    r14,[rip+0xffffffffffc7ad4c]        # 0x140000000
   1403852b4:	42 8b 84 31 d8 a5 98 	mov    eax,DWORD PTR [rcx+r14*1+0x98a5d8]
   1403852bb:	00 
   1403852bc:	85 c0                	test   eax,eax
   1403852be:	0f 84 b0 01 00 00    	je     0x140385474
   1403852c4:	4a 8b bc 31 d0 a5 98 	mov    rdi,QWORD PTR [rcx+r14*1+0x98a5d0]
   1403852cb:	00 
   1403852cc:	48 83 c7 30          	add    rdi,0x30
   1403852d0:	8b f0                	mov    esi,eax
   1403852d2:	41 bc fd ff 00 00    	mov    r12d,0xfffd
   1403852d8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1403852df:	00 
   1403852e0:	48 8b 0f             	mov    rcx,QWORD PTR [rdi]
   1403852e3:	48 85 c9             	test   rcx,rcx
   1403852e6:	0f 84 6b 01 00 00    	je     0x140385457
   1403852ec:	66 44 39 a9 1c 02 00 	cmp    WORD PTR [rcx+0x21c],r13w
   1403852f3:	00 
   1403852f4:	0f 8c 5d 01 00 00    	jl     0x140385457
   1403852fa:	0f b7 51 20          	movzx  edx,WORD PTR [rcx+0x20]
   1403852fe:	8d 42 ff             	lea    eax,[rdx-0x1]
   140385301:	66 41 3b c4          	cmp    ax,r12w
   140385305:	0f 87 4c 01 00 00    	ja     0x140385457
   14038530b:	8d 42 ff             	lea    eax,[rdx-0x1]
   14038530e:	66 83 f8 7e          	cmp    ax,0x7e
   140385312:	77 1d                	ja     0x140385331
   140385314:	0f b7 c2             	movzx  eax,dx
   140385317:	f3 0f 10 41 24       	movss  xmm0,DWORD PTR [rcx+0x24]
   14038531c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14038531f:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140385326:	00 00 
   140385328:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   14038532f:	00 00 
   140385331:	0f b7 51 28          	movzx  edx,WORD PTR [rcx+0x28]
   140385335:	8d 42 ff             	lea    eax,[rdx-0x1]
   140385338:	66 83 f8 7e          	cmp    ax,0x7e
   14038533c:	77 1d                	ja     0x14038535b
   14038533e:	0f b7 c2             	movzx  eax,dx
   140385341:	f3 0f 10 41 2c       	movss  xmm0,DWORD PTR [rcx+0x2c]
   140385346:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140385349:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140385350:	00 00 
   140385352:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140385359:	00 00 
   14038535b:	0f b7 51 30          	movzx  edx,WORD PTR [rcx+0x30]
   14038535f:	8d 42 ff             	lea    eax,[rdx-0x1]
   140385362:	66 83 f8 7e          	cmp    ax,0x7e
   140385366:	77 1d                	ja     0x140385385
   140385368:	0f b7 c2             	movzx  eax,dx
   14038536b:	f3 0f 10 41 34       	movss  xmm0,DWORD PTR [rcx+0x34]
   140385370:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140385373:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   14038537a:	00 00 
   14038537c:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140385383:	00 00 
   140385385:	0f b7 51 38          	movzx  edx,WORD PTR [rcx+0x38]
   140385389:	8d 42 ff             	lea    eax,[rdx-0x1]
   14038538c:	66 83 f8 7e          	cmp    ax,0x7e
   140385390:	77 1d                	ja     0x1403853af
   140385392:	0f b7 c2             	movzx  eax,dx
   140385395:	f3 0f 10 41 3c       	movss  xmm0,DWORD PTR [rcx+0x3c]
   14038539a:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14038539d:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   1403853a4:	00 00 
   1403853a6:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   1403853ad:	00 00 
   1403853af:	0f b7 51 40          	movzx  edx,WORD PTR [rcx+0x40]
   1403853b3:	8d 42 ff             	lea    eax,[rdx-0x1]
   1403853b6:	66 83 f8 7e          	cmp    ax,0x7e
   1403853ba:	77 1d                	ja     0x1403853d9
   1403853bc:	0f b7 c2             	movzx  eax,dx
   1403853bf:	f3 0f 10 41 44       	movss  xmm0,DWORD PTR [rcx+0x44]
   1403853c4:	0f 5a c0             	cvtps2pd xmm0,xmm0
   1403853c7:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   1403853ce:	00 00 
   1403853d0:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   1403853d7:	00 00 
   1403853d9:	0f b7 51 48          	movzx  edx,WORD PTR [rcx+0x48]
   1403853dd:	8d 42 ff             	lea    eax,[rdx-0x1]
   1403853e0:	66 83 f8 7e          	cmp    ax,0x7e
   1403853e4:	77 1d                	ja     0x140385403
   1403853e6:	0f b7 c2             	movzx  eax,dx
   1403853e9:	f3 0f 10 41 4c       	movss  xmm0,DWORD PTR [rcx+0x4c]
   1403853ee:	0f 5a c0             	cvtps2pd xmm0,xmm0
   1403853f1:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   1403853f8:	00 00 
   1403853fa:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140385401:	00 00 
   140385403:	0f b7 51 50          	movzx  edx,WORD PTR [rcx+0x50]
   140385407:	8d 42 ff             	lea    eax,[rdx-0x1]
   14038540a:	66 83 f8 7e          	cmp    ax,0x7e
   14038540e:	77 1d                	ja     0x14038542d
   140385410:	0f b7 c2             	movzx  eax,dx
   140385413:	f3 0f 10 41 54       	movss  xmm0,DWORD PTR [rcx+0x54]
   140385418:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14038541b:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140385422:	00 00 
   140385424:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   14038542b:	00 00 
   14038542d:	0f b7 51 58          	movzx  edx,WORD PTR [rcx+0x58]
   140385431:	8d 42 ff             	lea    eax,[rdx-0x1]
   140385434:	66 83 f8 7e          	cmp    ax,0x7e
   140385438:	77 1d                	ja     0x140385457
   14038543a:	0f b7 c2             	movzx  eax,dx
   14038543d:	f3 0f 10 41 5c       	movss  xmm0,DWORD PTR [rcx+0x5c]
   140385442:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140385445:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   14038544c:	00 00 
   14038544e:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140385455:	00 00 
   140385457:	48 81 c7 90 00 00 00 	add    rdi,0x90
   14038545e:	48 83 ee 01          	sub    rsi,0x1
   140385462:	0f 85 78 fe ff ff    	jne    0x1403852e0
   140385468:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   14038546d:	41 8b 3f             	mov    edi,DWORD PTR [r15]
   140385470:	44 8d 66 07          	lea    r12d,[rsi+0x7]
   140385474:	41 8b dd             	mov    ebx,r13d
   140385477:	89 5c 24 3c          	mov    DWORD PTR [rsp+0x3c],ebx
   14038547b:	8b c7                	mov    eax,edi
   14038547d:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140385484:	46 39 ac 31 d8 a5 98 	cmp    DWORD PTR [rcx+r14*1+0x98a5d8],r13d
   14038548b:	00 
   14038548c:	0f 86 79 01 00 00    	jbe    0x14038560b
   140385492:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140385496:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14038549d:	00 00 00 
   1403854a0:	8b cb                	mov    ecx,ebx
   1403854a2:	8b c7                	mov    eax,edi
   1403854a4:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   1403854ab:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   1403854af:	48 03 c9             	add    rcx,rcx
   1403854b2:	4a 8b 84 30 d0 a5 98 	mov    rax,QWORD PTR [rax+r14*1+0x98a5d0]
   1403854b9:	00 
   1403854ba:	4c 8b 54 c8 30       	mov    r10,QWORD PTR [rax+rcx*8+0x30]
   1403854bf:	8b d7                	mov    edx,edi
   1403854c1:	4d 85 d2             	test   r10,r10
   1403854c4:	0f 84 22 01 00 00    	je     0x1403855ec
   1403854ca:	66 45 39 aa 1c 02 00 	cmp    WORD PTR [r10+0x21c],r13w
   1403854d1:	00 
   1403854d2:	0f 8c 14 01 00 00    	jl     0x1403855ec
   1403854d8:	4d 8d 42 20          	lea    r8,[r10+0x20]
   1403854dc:	41 0f b7 00          	movzx  eax,WORD PTR [r8]
   1403854e0:	b9 ff ff 00 00       	mov    ecx,0xffff
   1403854e5:	66 3b c1             	cmp    ax,cx
   1403854e8:	0f 84 fe 00 00 00    	je     0x1403855ec
   1403854ee:	66 85 c0             	test   ax,ax
   1403854f1:	0f 84 f5 00 00 00    	je     0x1403855ec
   1403854f7:	bb 01 00 00 00       	mov    ebx,0x1
   1403854fc:	44 8b cb             	mov    r9d,ebx
   1403854ff:	bf 08 00 00 00       	mov    edi,0x8
   140385504:	44 8b df             	mov    r11d,edi
   140385507:	44 8d 7b 03          	lea    r15d,[rbx+0x3]
   14038550b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140385510:	41 0f b7 10          	movzx  edx,WORD PTR [r8]
   140385514:	8d 42 ff             	lea    eax,[rdx-0x1]
   140385517:	83 f8 0d             	cmp    eax,0xd
   14038551a:	0f 87 b0 00 00 00    	ja     0x1403855d0
   140385520:	48 98                	cdqe
   140385522:	41 8b 8c 86 ec 76 38 	mov    ecx,DWORD PTR [r14+rax*4+0x3876ec]
   140385529:	00 
   14038552a:	49 03 ce             	add    rcx,r14
   14038552d:	ff e1                	jmp    rcx
   14038552f:	bf 02 00 00 00       	mov    edi,0x2
   140385534:	eb 23                	jmp    0x140385559
   140385536:	8b fb                	mov    edi,ebx
   140385538:	eb 1f                	jmp    0x140385559
   14038553a:	bf 05 00 00 00       	mov    edi,0x5
   14038553f:	eb 18                	jmp    0x140385559
   140385541:	41 0f b7 ff          	movzx  edi,r15w
   140385545:	eb 12                	jmp    0x140385559
   140385547:	41 0f b7 fc          	movzx  edi,r12w
   14038554b:	eb 0c                	jmp    0x140385559
   14038554d:	bf 0e 00 00 00       	mov    edi,0xe
   140385552:	eb 05                	jmp    0x140385559
   140385554:	bf 0d 00 00 00       	mov    edi,0xd
   140385559:	0f b7 ca             	movzx  ecx,dx
   14038555c:	0f b7 c7             	movzx  eax,di
   14038555f:	f2 0f 10 84 c5 c0 03 	movsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140385566:	00 00 
   140385568:	66 0f 2f 84 cd c0 03 	comisd xmm0,QWORD PTR [rbp+rcx*8+0x3c0]
   14038556f:	00 00 
   140385571:	76 04                	jbe    0x140385577
   140385573:	66 41 89 38          	mov    WORD PTR [r8],di
   140385577:	41 8b d1             	mov    edx,r9d
   14038557a:	41 83 f9 08          	cmp    r9d,0x8
   14038557e:	73 4b                	jae    0x1403855cb
   140385580:	41 8b c9             	mov    ecx,r9d
   140385583:	49 03 cf             	add    rcx,r15
   140385586:	49 8d 0c ca          	lea    rcx,[r10+rcx*8]
   14038558a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140385590:	66 39 39             	cmp    WORD PTR [rcx],di
   140385593:	74 0d                	je     0x1403855a2
   140385595:	ff c2                	inc    edx
   140385597:	48 83 c1 08          	add    rcx,0x8
   14038559b:	83 fa 08             	cmp    edx,0x8
   14038559e:	72 f0                	jb     0x140385590
   1403855a0:	eb 29                	jmp    0x1403855cb
   1403855a2:	83 fa 07             	cmp    edx,0x7
   1403855a5:	73 1c                	jae    0x1403855c3
   1403855a7:	8b fa                	mov    edi,edx
   1403855a9:	49 03 ff             	add    rdi,r15
   1403855ac:	49 8d 3c fa          	lea    rdi,[r10+rdi*8]
   1403855b0:	8d 72 01             	lea    esi,[rdx+0x1]
   1403855b3:	48 8d 76 04          	lea    rsi,[rsi+0x4]
   1403855b7:	49 8d 34 f2          	lea    rsi,[r10+rsi*8]
   1403855bb:	41 8b cc             	mov    ecx,r12d
   1403855be:	2b ca                	sub    ecx,edx
   1403855c0:	f3 48 a5             	rep movs QWORD PTR [rdi],QWORD PTR [rsi]
   1403855c3:	49 c7 42 58 ff ff 00 	mov    QWORD PTR [r10+0x58],0xffff
   1403855ca:	00 
   1403855cb:	bf 08 00 00 00       	mov    edi,0x8
   1403855d0:	41 ff c1             	inc    r9d
   1403855d3:	49 83 c0 08          	add    r8,0x8
   1403855d7:	4c 2b db             	sub    r11,rbx
   1403855da:	0f 85 30 ff ff ff    	jne    0x140385510
   1403855e0:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   1403855e5:	41 8b 17             	mov    edx,DWORD PTR [r15]
   1403855e8:	8b 5c 24 3c          	mov    ebx,DWORD PTR [rsp+0x3c]
   1403855ec:	ff c3                	inc    ebx
   1403855ee:	89 5c 24 3c          	mov    DWORD PTR [rsp+0x3c],ebx
   1403855f2:	8b fa                	mov    edi,edx
   1403855f4:	8b c2                	mov    eax,edx
   1403855f6:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403855fd:	42 3b 9c 31 d8 a5 98 	cmp    ebx,DWORD PTR [rcx+r14*1+0x98a5d8]
   140385604:	00 
   140385605:	0f 82 95 fe ff ff    	jb     0x1403854a0
   14038560b:	44 8b 7c 24 38       	mov    r15d,DWORD PTR [rsp+0x38]
   140385610:	44 38 6c 24 44       	cmp    BYTE PTR [rsp+0x44],r13b
   140385615:	0f 84 3d 07 00 00    	je     0x140385d58
   14038561b:	45 85 ff             	test   r15d,r15d
   14038561e:	0f 85 34 07 00 00    	jne    0x140385d58
   140385624:	33 d2                	xor    edx,edx
   140385626:	41 b8 00 04 00 00    	mov    r8d,0x400
   14038562c:	48 8d 8d c0 07 00 00 	lea    rcx,[rbp+0x7c0]
   140385633:	e8 b2 b6 29 00       	call   0x140620cea
   140385638:	33 d2                	xor    edx,edx
   14038563a:	41 b8 80 00 00 00    	mov    r8d,0x80
   140385640:	48 8d 8d c0 0b 00 00 	lea    rcx,[rbp+0xbc0]
   140385647:	e8 9e b6 29 00       	call   0x140620cea
   14038564c:	45 8b f5             	mov    r14d,r13d
   14038564f:	8b c7                	mov    eax,edi
   140385651:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140385658:	4c 8d 1d a1 a9 c7 ff 	lea    r11,[rip+0xffffffffffc7a9a1]        # 0x140000000
   14038565f:	46 39 ac 19 d8 a5 98 	cmp    DWORD PTR [rcx+r11*1+0x98a5d8],r13d
   140385666:	00 
   140385667:	0f 86 fb 00 00 00    	jbe    0x140385768
   14038566d:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   140385672:	41 bc ff ff 00 00    	mov    r12d,0xffff
   140385678:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14038567f:	00 
   140385680:	41 8b ce             	mov    ecx,r14d
   140385683:	8b c7                	mov    eax,edi
   140385685:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   14038568c:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   140385690:	48 c1 e1 04          	shl    rcx,0x4
   140385694:	4a 8b 84 18 d0 a5 98 	mov    rax,QWORD PTR [rax+r11*1+0x98a5d0]
   14038569b:	00 
   14038569c:	48 8b 74 08 30       	mov    rsi,QWORD PTR [rax+rcx*1+0x30]
   1403856a1:	8b c7                	mov    eax,edi
   1403856a3:	48 85 f6             	test   rsi,rsi
   1403856a6:	0f 84 9c 00 00 00    	je     0x140385748
   1403856ac:	0f b7 4e 20          	movzx  ecx,WORD PTR [rsi+0x20]
   1403856b0:	8b c7                	mov    eax,edi
   1403856b2:	66 41 3b cc          	cmp    cx,r12w
   1403856b6:	0f 84 8c 00 00 00    	je     0x140385748
   1403856bc:	8b c7                	mov    eax,edi
   1403856be:	66 85 c9             	test   cx,cx
   1403856c1:	0f 84 81 00 00 00    	je     0x140385748
   1403856c7:	8b c7                	mov    eax,edi
   1403856c9:	66 83 f9 01          	cmp    cx,0x1
   1403856cd:	0f 82 75 00 00 00    	jb     0x140385748
   1403856d3:	8b c7                	mov    eax,edi
   1403856d5:	66 83 f9 7f          	cmp    cx,0x7f
   1403856d9:	77 6d                	ja     0x140385748
   1403856db:	66 44 39 ae 1c 02 00 	cmp    WORD PTR [rsi+0x21c],r13w
   1403856e2:	00 
   1403856e3:	7d 0f                	jge    0x1403856f4
   1403856e5:	0f b7 c1             	movzx  eax,cx
   1403856e8:	c6 84 05 c0 0b 00 00 	mov    BYTE PTR [rbp+rax*1+0xbc0],0x1
   1403856ef:	01 
   1403856f0:	8b c7                	mov    eax,edi
   1403856f2:	eb 54                	jmp    0x140385748
   1403856f4:	8b 1e                	mov    ebx,DWORD PTR [rsi]
   1403856f6:	8b c7                	mov    eax,edi
   1403856f8:	3b 5e 04             	cmp    ebx,DWORD PTR [rsi+0x4]
   1403856fb:	7d 4b                	jge    0x140385748
   1403856fd:	0f 1f 00             	nop    DWORD PTR [rax]
   140385700:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   140385705:	44 89 6c 24 20       	mov    DWORD PTR [rsp+0x20],r13d
   14038570a:	45 33 c9             	xor    r9d,r9d
   14038570d:	45 33 c0             	xor    r8d,r8d
   140385710:	8b d3                	mov    edx,ebx
   140385712:	48 8b ce             	mov    rcx,rsi
   140385715:	e8 d6 50 fe ff       	call   0x14036a7f0
   14038571a:	0f 57 c9             	xorps  xmm1,xmm1
   14038571d:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   140385721:	0f b7 46 20          	movzx  eax,WORD PTR [rsi+0x20]
   140385725:	f2 0f 58 8c c5 c0 07 	addsd  xmm1,QWORD PTR [rbp+rax*8+0x7c0]
   14038572c:	00 00 
   14038572e:	f2 0f 11 8c c5 c0 07 	movsd  QWORD PTR [rbp+rax*8+0x7c0],xmm1
   140385735:	00 00 
   140385737:	ff c3                	inc    ebx
   140385739:	3b 5e 04             	cmp    ebx,DWORD PTR [rsi+0x4]
   14038573c:	7c c2                	jl     0x140385700
   14038573e:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140385741:	4c 8d 1d b8 a8 c7 ff 	lea    r11,[rip+0xffffffffffc7a8b8]        # 0x140000000
   140385748:	41 ff c6             	inc    r14d
   14038574b:	8b f8                	mov    edi,eax
   14038574d:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140385754:	46 3b b4 19 d8 a5 98 	cmp    r14d,DWORD PTR [rcx+r11*1+0x98a5d8]
   14038575b:	00 
   14038575c:	0f 82 1e ff ff ff    	jb     0x140385680
   140385762:	41 bc 07 00 00 00    	mov    r12d,0x7
   140385768:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   14038576d:	bb 01 00 00 00       	mov    ebx,0x1
   140385772:	44 8d 53 02          	lea    r10d,[rbx+0x2]
   140385776:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14038577d:	00 00 00 
   140385780:	41 8b d5             	mov    edx,r13d
   140385783:	0f 28 c6             	movaps xmm0,xmm6
   140385786:	45 8b c5             	mov    r8d,r13d
   140385789:	44 8b cb             	mov    r9d,ebx
   14038578c:	41 8b f2             	mov    esi,r10d
   14038578f:	48 8d bd c3 0b 00 00 	lea    rdi,[rbp+0xbc3]
   140385796:	49 8b c5             	mov    rax,r13
   140385799:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   1403857a0:	4a 8b 8c 18 78 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f06378]
   1403857a7:	14 
   1403857a8:	48 85 c9             	test   rcx,rcx
   1403857ab:	74 32                	je     0x1403857df
   1403857ad:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   1403857b1:	75 2c                	jne    0x1403857df
   1403857b3:	f2 0f 10 8c 05 c8 07 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x7c8]
   1403857ba:	00 00 
   1403857bc:	66 41 0f 2f ca       	comisd xmm1,xmm10
   1403857c1:	76 1c                	jbe    0x1403857df
   1403857c3:	44 38 6f fe          	cmp    BYTE PTR [rdi-0x2],r13b
   1403857c7:	75 14                	jne    0x1403857dd
   1403857c9:	66 0f 2e c6          	ucomisd xmm0,xmm6
   1403857cd:	7a 02                	jp     0x1403857d1
   1403857cf:	74 06                	je     0x1403857d7
   1403857d1:	66 0f 2f c1          	comisd xmm0,xmm1
   1403857d5:	76 06                	jbe    0x1403857dd
   1403857d7:	0f 28 c1             	movaps xmm0,xmm1
   1403857da:	45 8b c1             	mov    r8d,r9d
   1403857dd:	ff c2                	inc    edx
   1403857df:	4a 8b 8c 18 80 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f06380]
   1403857e6:	14 
   1403857e7:	48 85 c9             	test   rcx,rcx
   1403857ea:	74 33                	je     0x14038581f
   1403857ec:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   1403857f0:	75 2d                	jne    0x14038581f
   1403857f2:	f2 0f 10 8c 05 d0 07 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x7d0]
   1403857f9:	00 00 
   1403857fb:	66 41 0f 2f ca       	comisd xmm1,xmm10
   140385800:	76 1d                	jbe    0x14038581f
   140385802:	44 38 6f ff          	cmp    BYTE PTR [rdi-0x1],r13b
   140385806:	75 15                	jne    0x14038581d
   140385808:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14038580c:	7a 02                	jp     0x140385810
   14038580e:	74 06                	je     0x140385816
   140385810:	66 0f 2f c1          	comisd xmm0,xmm1
   140385814:	76 07                	jbe    0x14038581d
   140385816:	0f 28 c1             	movaps xmm0,xmm1
   140385819:	44 8d 46 ff          	lea    r8d,[rsi-0x1]
   14038581d:	ff c2                	inc    edx
   14038581f:	4a 8b 8c 18 88 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f06388]
   140385826:	14 
   140385827:	48 85 c9             	test   rcx,rcx
   14038582a:	74 31                	je     0x14038585d
   14038582c:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   140385830:	75 2b                	jne    0x14038585d
   140385832:	f2 0f 10 8c 05 d8 07 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x7d8]
   140385839:	00 00 
   14038583b:	66 41 0f 2f ca       	comisd xmm1,xmm10
   140385840:	76 1b                	jbe    0x14038585d
   140385842:	44 38 2f             	cmp    BYTE PTR [rdi],r13b
   140385845:	75 14                	jne    0x14038585b
   140385847:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14038584b:	7a 02                	jp     0x14038584f
   14038584d:	74 06                	je     0x140385855
   14038584f:	66 0f 2f c1          	comisd xmm0,xmm1
   140385853:	76 06                	jbe    0x14038585b
   140385855:	0f 28 c1             	movaps xmm0,xmm1
   140385858:	44 8b c6             	mov    r8d,esi
   14038585b:	ff c2                	inc    edx
   14038585d:	4a 8b 8c 18 90 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f06390]
   140385864:	14 
   140385865:	48 85 c9             	test   rcx,rcx
   140385868:	74 33                	je     0x14038589d
   14038586a:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   14038586e:	75 2d                	jne    0x14038589d
   140385870:	f2 0f 10 8c 05 e0 07 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x7e0]
   140385877:	00 00 
   140385879:	66 41 0f 2f ca       	comisd xmm1,xmm10
   14038587e:	76 1d                	jbe    0x14038589d
   140385880:	44 38 6f 01          	cmp    BYTE PTR [rdi+0x1],r13b
   140385884:	75 15                	jne    0x14038589b
   140385886:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14038588a:	7a 02                	jp     0x14038588e
   14038588c:	74 06                	je     0x140385894
   14038588e:	66 0f 2f c1          	comisd xmm0,xmm1
   140385892:	76 07                	jbe    0x14038589b
   140385894:	0f 28 c1             	movaps xmm0,xmm1
   140385897:	44 8d 46 01          	lea    r8d,[rsi+0x1]
   14038589b:	ff c2                	inc    edx
   14038589d:	4a 8b 8c 18 98 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f06398]
   1403858a4:	14 
   1403858a5:	48 85 c9             	test   rcx,rcx
   1403858a8:	74 33                	je     0x1403858dd
   1403858aa:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   1403858ae:	75 2d                	jne    0x1403858dd
   1403858b0:	f2 0f 10 8c 05 e8 07 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x7e8]
   1403858b7:	00 00 
   1403858b9:	66 41 0f 2f ca       	comisd xmm1,xmm10
   1403858be:	76 1d                	jbe    0x1403858dd
   1403858c0:	44 38 6f 02          	cmp    BYTE PTR [rdi+0x2],r13b
   1403858c4:	75 15                	jne    0x1403858db
   1403858c6:	66 0f 2e c6          	ucomisd xmm0,xmm6
   1403858ca:	7a 02                	jp     0x1403858ce
   1403858cc:	74 06                	je     0x1403858d4
   1403858ce:	66 0f 2f c1          	comisd xmm0,xmm1
   1403858d2:	76 07                	jbe    0x1403858db
   1403858d4:	0f 28 c1             	movaps xmm0,xmm1
   1403858d7:	44 8d 46 02          	lea    r8d,[rsi+0x2]
   1403858db:	ff c2                	inc    edx
   1403858dd:	4a 8b 8c 18 a0 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f063a0]
   1403858e4:	14 
   1403858e5:	48 85 c9             	test   rcx,rcx
   1403858e8:	74 33                	je     0x14038591d
   1403858ea:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   1403858ee:	75 2d                	jne    0x14038591d
   1403858f0:	f2 0f 10 8c 05 f0 07 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x7f0]
   1403858f7:	00 00 
   1403858f9:	66 41 0f 2f ca       	comisd xmm1,xmm10
   1403858fe:	76 1d                	jbe    0x14038591d
   140385900:	44 38 6f 03          	cmp    BYTE PTR [rdi+0x3],r13b
   140385904:	75 15                	jne    0x14038591b
   140385906:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14038590a:	7a 02                	jp     0x14038590e
   14038590c:	74 06                	je     0x140385914
   14038590e:	66 0f 2f c1          	comisd xmm0,xmm1
   140385912:	76 07                	jbe    0x14038591b
   140385914:	0f 28 c1             	movaps xmm0,xmm1
   140385917:	44 8d 46 03          	lea    r8d,[rsi+0x3]
   14038591b:	ff c2                	inc    edx
   14038591d:	4a 8b 8c 18 a8 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f063a8]
   140385924:	14 
   140385925:	48 85 c9             	test   rcx,rcx
   140385928:	74 33                	je     0x14038595d
   14038592a:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   14038592e:	75 2d                	jne    0x14038595d
   140385930:	f2 0f 10 8c 05 f8 07 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x7f8]
   140385937:	00 00 
   140385939:	66 41 0f 2f ca       	comisd xmm1,xmm10
   14038593e:	76 1d                	jbe    0x14038595d
   140385940:	44 38 6f 04          	cmp    BYTE PTR [rdi+0x4],r13b
   140385944:	75 15                	jne    0x14038595b
   140385946:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14038594a:	7a 02                	jp     0x14038594e
   14038594c:	74 06                	je     0x140385954
   14038594e:	66 0f 2f c1          	comisd xmm0,xmm1
   140385952:	76 07                	jbe    0x14038595b
   140385954:	0f 28 c1             	movaps xmm0,xmm1
   140385957:	44 8d 46 04          	lea    r8d,[rsi+0x4]
   14038595b:	ff c2                	inc    edx
   14038595d:	4a 8b 8c 18 b0 63 f0 	mov    rcx,QWORD PTR [rax+r11*1+0x14f063b0]
   140385964:	14 
   140385965:	48 85 c9             	test   rcx,rcx
   140385968:	74 33                	je     0x14038599d
   14038596a:	f6 41 28 10          	test   BYTE PTR [rcx+0x28],0x10
   14038596e:	75 2d                	jne    0x14038599d
   140385970:	f2 0f 10 8c 05 00 08 	movsd  xmm1,QWORD PTR [rbp+rax*1+0x800]
   140385977:	00 00 
   140385979:	66 41 0f 2f ca       	comisd xmm1,xmm10
   14038597e:	76 1d                	jbe    0x14038599d
   140385980:	44 38 6f 05          	cmp    BYTE PTR [rdi+0x5],r13b
   140385984:	75 15                	jne    0x14038599b
   140385986:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14038598a:	7a 02                	jp     0x14038598e
   14038598c:	74 06                	je     0x140385994
   14038598e:	66 0f 2f c1          	comisd xmm0,xmm1
   140385992:	76 07                	jbe    0x14038599b
   140385994:	0f 28 c1             	movaps xmm0,xmm1
   140385997:	44 8d 46 05          	lea    r8d,[rsi+0x5]
   14038599b:	ff c2                	inc    edx
   14038599d:	41 83 c1 08          	add    r9d,0x8
   1403859a1:	48 83 c0 40          	add    rax,0x40
   1403859a5:	83 c6 08             	add    esi,0x8
   1403859a8:	48 83 c7 08          	add    rdi,0x8
   1403859ac:	83 fe 7a             	cmp    esi,0x7a
   1403859af:	0f 86 eb fd ff ff    	jbe    0x1403857a0
   1403859b5:	41 83 f9 7f          	cmp    r9d,0x7f
   1403859b9:	77 63                	ja     0x140385a1e
   1403859bb:	41 8b c1             	mov    eax,r9d
   1403859be:	48 8d bd c0 0b 00 00 	lea    rdi,[rbp+0xbc0]
   1403859c5:	48 03 f8             	add    rdi,rax
   1403859c8:	4a 8d 0c cd 00 00 00 	lea    rcx,[r9*8+0x0]
   1403859cf:	00 
   1403859d0:	4a 8b 84 19 70 63 f0 	mov    rax,QWORD PTR [rcx+r11*1+0x14f06370]
   1403859d7:	14 
   1403859d8:	48 85 c0             	test   rax,rax
   1403859db:	74 31                	je     0x140385a0e
   1403859dd:	f6 40 28 10          	test   BYTE PTR [rax+0x28],0x10
   1403859e1:	75 2b                	jne    0x140385a0e
   1403859e3:	f2 0f 10 8c 0d c0 07 	movsd  xmm1,QWORD PTR [rbp+rcx*1+0x7c0]
   1403859ea:	00 00 
   1403859ec:	66 41 0f 2f ca       	comisd xmm1,xmm10
   1403859f1:	76 1b                	jbe    0x140385a0e
   1403859f3:	44 38 2f             	cmp    BYTE PTR [rdi],r13b
   1403859f6:	75 14                	jne    0x140385a0c
   1403859f8:	66 0f 2e c6          	ucomisd xmm0,xmm6
   1403859fc:	7a 02                	jp     0x140385a00
   1403859fe:	74 06                	je     0x140385a06
   140385a00:	66 0f 2f c1          	comisd xmm0,xmm1
   140385a04:	76 06                	jbe    0x140385a0c
   140385a06:	0f 28 c1             	movaps xmm0,xmm1
   140385a09:	45 8b c1             	mov    r8d,r9d
   140385a0c:	ff c2                	inc    edx
   140385a0e:	41 ff c1             	inc    r9d
   140385a11:	48 83 c1 08          	add    rcx,0x8
   140385a15:	48 ff c7             	inc    rdi
   140385a18:	41 83 f9 7f          	cmp    r9d,0x7f
   140385a1c:	76 b2                	jbe    0x1403859d0
   140385a1e:	66 0f 2e c6          	ucomisd xmm0,xmm6
   140385a22:	7a 02                	jp     0x140385a26
   140385a24:	74 4a                	je     0x140385a70
   140385a26:	41 0f b7 4f 14       	movzx  ecx,WORD PTR [r15+0x14]
   140385a2b:	66 83 f9 08          	cmp    cx,0x8
   140385a2f:	77 10                	ja     0x140385a41
   140385a31:	45 38 af 98 00 00 00 	cmp    BYTE PTR [r15+0x98],r13b
   140385a38:	75 07                	jne    0x140385a41
   140385a3a:	8b c3                	mov    eax,ebx
   140385a3c:	0f b7 f9             	movzx  edi,cx
   140385a3f:	eb 05                	jmp    0x140385a46
   140385a41:	0f b7 c1             	movzx  eax,cx
   140385a44:	8b f8                	mov    edi,eax
   140385a46:	3b d0                	cmp    edx,eax
   140385a48:	76 0d                	jbe    0x140385a57
   140385a4a:	41 8b c0             	mov    eax,r8d
   140385a4d:	4c 89 ac c5 c0 07 00 	mov    QWORD PTR [rbp+rax*8+0x7c0],r13
   140385a54:	00 
   140385a55:	ff ca                	dec    edx
   140385a57:	66 83 f9 08          	cmp    cx,0x8
   140385a5b:	77 0b                	ja     0x140385a68
   140385a5d:	45 38 af 98 00 00 00 	cmp    BYTE PTR [r15+0x98],r13b
   140385a64:	75 02                	jne    0x140385a68
   140385a66:	8b fb                	mov    edi,ebx
   140385a68:	3b d7                	cmp    edx,edi
   140385a6a:	0f 87 10 fd ff ff    	ja     0x140385780
   140385a70:	8b d3                	mov    edx,ebx
   140385a72:	41 0f 28 c2          	movaps xmm0,xmm10
   140385a76:	41 8b fa             	mov    edi,r10d
   140385a79:	48 8d 8d d8 07 00 00 	lea    rcx,[rbp+0x7d8]
   140385a80:	8d 42 fd             	lea    eax,[rdx-0x3]
   140385a83:	f2 0f 10 49 f0       	movsd  xmm1,QWORD PTR [rcx-0x10]
   140385a88:	41 3b c2             	cmp    eax,r10d
   140385a8b:	77 0a                	ja     0x140385a97
   140385a8d:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   140385a91:	f2 0f 5f c8          	maxsd  xmm1,xmm0
   140385a95:	eb 09                	jmp    0x140385aa0
   140385a97:	66 0f 2f c8          	comisd xmm1,xmm0
   140385a9b:	77 03                	ja     0x140385aa0
   140385a9d:	0f 28 c8             	movaps xmm1,xmm0
   140385aa0:	8d 47 fb             	lea    eax,[rdi-0x5]
   140385aa3:	83 f8 02             	cmp    eax,0x2
   140385aa6:	76 15                	jbe    0x140385abd
   140385aa8:	83 fa 02             	cmp    edx,0x2
   140385aab:	74 10                	je     0x140385abd
   140385aad:	f2 0f 10 41 f8       	movsd  xmm0,QWORD PTR [rcx-0x8]
   140385ab2:	66 0f 2f c1          	comisd xmm0,xmm1
   140385ab6:	77 12                	ja     0x140385aca
   140385ab8:	0f 28 c1             	movaps xmm0,xmm1
   140385abb:	eb 0d                	jmp    0x140385aca
   140385abd:	f2 0f 10 41 f8       	movsd  xmm0,QWORD PTR [rcx-0x8]
   140385ac2:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140385ac6:	f2 0f 5f c1          	maxsd  xmm0,xmm1
   140385aca:	8d 47 fc             	lea    eax,[rdi-0x4]
   140385acd:	83 f8 02             	cmp    eax,0x2
   140385ad0:	76 13                	jbe    0x140385ae5
   140385ad2:	3b d3                	cmp    edx,ebx
   140385ad4:	74 0f                	je     0x140385ae5
   140385ad6:	f2 0f 10 09          	movsd  xmm1,QWORD PTR [rcx]
   140385ada:	66 0f 2f c8          	comisd xmm1,xmm0
   140385ade:	77 11                	ja     0x140385af1
   140385ae0:	0f 28 c8             	movaps xmm1,xmm0
   140385ae3:	eb 0c                	jmp    0x140385af1
   140385ae5:	f2 0f 10 09          	movsd  xmm1,QWORD PTR [rcx]
   140385ae9:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   140385aed:	f2 0f 5f c8          	maxsd  xmm1,xmm0
   140385af1:	8d 47 fd             	lea    eax,[rdi-0x3]
   140385af4:	83 f8 02             	cmp    eax,0x2
   140385af7:	76 14                	jbe    0x140385b0d
   140385af9:	85 d2                	test   edx,edx
   140385afb:	74 10                	je     0x140385b0d
   140385afd:	f2 0f 10 41 08       	movsd  xmm0,QWORD PTR [rcx+0x8]
   140385b02:	66 0f 2f c1          	comisd xmm0,xmm1
   140385b06:	77 12                	ja     0x140385b1a
   140385b08:	0f 28 c1             	movaps xmm0,xmm1
   140385b0b:	eb 0d                	jmp    0x140385b1a
   140385b0d:	f2 0f 10 41 08       	movsd  xmm0,QWORD PTR [rcx+0x8]
   140385b12:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140385b16:	f2 0f 5f c1          	maxsd  xmm0,xmm1
   140385b1a:	8d 47 fe             	lea    eax,[rdi-0x2]
   140385b1d:	83 f8 02             	cmp    eax,0x2
   140385b20:	76 15                	jbe    0x140385b37
   140385b22:	83 fa ff             	cmp    edx,0xffffffff
   140385b25:	74 10                	je     0x140385b37
   140385b27:	f2 0f 10 49 10       	movsd  xmm1,QWORD PTR [rcx+0x10]
   140385b2c:	66 0f 2f c8          	comisd xmm1,xmm0
   140385b30:	77 12                	ja     0x140385b44
   140385b32:	0f 28 c8             	movaps xmm1,xmm0
   140385b35:	eb 0d                	jmp    0x140385b44
   140385b37:	f2 0f 10 49 10       	movsd  xmm1,QWORD PTR [rcx+0x10]
   140385b3c:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   140385b40:	f2 0f 5f c8          	maxsd  xmm1,xmm0
   140385b44:	8d 47 ff             	lea    eax,[rdi-0x1]
   140385b47:	83 f8 02             	cmp    eax,0x2
   140385b4a:	76 15                	jbe    0x140385b61
   140385b4c:	83 fa fe             	cmp    edx,0xfffffffe
   140385b4f:	74 10                	je     0x140385b61
   140385b51:	f2 0f 10 41 18       	movsd  xmm0,QWORD PTR [rcx+0x18]
   140385b56:	66 0f 2f c1          	comisd xmm0,xmm1
   140385b5a:	77 12                	ja     0x140385b6e
   140385b5c:	0f 28 c1             	movaps xmm0,xmm1
   140385b5f:	eb 0d                	jmp    0x140385b6e
   140385b61:	f2 0f 10 41 18       	movsd  xmm0,QWORD PTR [rcx+0x18]
   140385b66:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140385b6a:	f2 0f 5f c1          	maxsd  xmm0,xmm1
   140385b6e:	83 ff 02             	cmp    edi,0x2
   140385b71:	76 15                	jbe    0x140385b88
   140385b73:	83 fa fd             	cmp    edx,0xfffffffd
   140385b76:	74 10                	je     0x140385b88
   140385b78:	f2 0f 10 49 20       	movsd  xmm1,QWORD PTR [rcx+0x20]
   140385b7d:	66 0f 2f c8          	comisd xmm1,xmm0
   140385b81:	77 12                	ja     0x140385b95
   140385b83:	0f 28 c8             	movaps xmm1,xmm0
   140385b86:	eb 0d                	jmp    0x140385b95
   140385b88:	f2 0f 10 49 20       	movsd  xmm1,QWORD PTR [rcx+0x20]
   140385b8d:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   140385b91:	f2 0f 5f c8          	maxsd  xmm1,xmm0
   140385b95:	8d 47 01             	lea    eax,[rdi+0x1]
   140385b98:	83 f8 02             	cmp    eax,0x2
   140385b9b:	76 15                	jbe    0x140385bb2
   140385b9d:	83 fa fc             	cmp    edx,0xfffffffc
   140385ba0:	74 10                	je     0x140385bb2
   140385ba2:	f2 0f 10 41 28       	movsd  xmm0,QWORD PTR [rcx+0x28]
   140385ba7:	66 0f 2f c1          	comisd xmm0,xmm1
   140385bab:	77 12                	ja     0x140385bbf
   140385bad:	0f 28 c1             	movaps xmm0,xmm1
   140385bb0:	eb 0d                	jmp    0x140385bbf
   140385bb2:	f2 0f 10 41 28       	movsd  xmm0,QWORD PTR [rcx+0x28]
   140385bb7:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140385bbb:	f2 0f 5f c1          	maxsd  xmm0,xmm1
   140385bbf:	0f 28 c8             	movaps xmm1,xmm0
   140385bc2:	83 c2 08             	add    edx,0x8
   140385bc5:	83 c7 08             	add    edi,0x8
   140385bc8:	48 83 c1 40          	add    rcx,0x40
   140385bcc:	83 ff 7a             	cmp    edi,0x7a
   140385bcf:	0f 86 ab fe ff ff    	jbe    0x140385a80
   140385bd5:	83 fa 7f             	cmp    edx,0x7f
   140385bd8:	77 3a                	ja     0x140385c14
   140385bda:	8d 42 fd             	lea    eax,[rdx-0x3]
   140385bdd:	41 3b c2             	cmp    eax,r10d
   140385be0:	77 16                	ja     0x140385bf8
   140385be2:	f2 0f 10 84 d5 c0 07 	movsd  xmm0,QWORD PTR [rbp+rdx*8+0x7c0]
   140385be9:	00 00 
   140385beb:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140385bef:	f2 0f 5f c1          	maxsd  xmm0,xmm1
   140385bf3:	0f 28 c8             	movaps xmm1,xmm0
   140385bf6:	eb 15                	jmp    0x140385c0d
   140385bf8:	f2 0f 10 8c d5 c0 07 	movsd  xmm1,QWORD PTR [rbp+rdx*8+0x7c0]
   140385bff:	00 00 
   140385c01:	66 0f 2f c8          	comisd xmm1,xmm0
   140385c05:	77 03                	ja     0x140385c0a
   140385c07:	0f 28 c8             	movaps xmm1,xmm0
   140385c0a:	0f 28 c1             	movaps xmm0,xmm1
   140385c0d:	ff c2                	inc    edx
   140385c0f:	83 fa 7f             	cmp    edx,0x7f
   140385c12:	76 c6                	jbe    0x140385bda
   140385c14:	44 8b d3             	mov    r10d,ebx
   140385c17:	4c 8d b5 c1 0b 00 00 	lea    r14,[rbp+0xbc1]
   140385c1e:	49 8b dd             	mov    rbx,r13
   140385c21:	41 8d 42 ed          	lea    eax,[r10-0x13]
   140385c25:	a9 ee ff ff ff       	test   eax,0xffffffee
   140385c2a:	75 0a                	jne    0x140385c36
   140385c2c:	41 83 fa 24          	cmp    r10d,0x24
   140385c30:	74 04                	je     0x140385c36
   140385c32:	b0 01                	mov    al,0x1
   140385c34:	eb 02                	jmp    0x140385c38
   140385c36:	32 c0                	xor    al,al
   140385c38:	45 38 2e             	cmp    BYTE PTR [r14],r13b
   140385c3b:	0f 85 f7 00 00 00    	jne    0x140385d38
   140385c41:	84 c0                	test   al,al
   140385c43:	75 21                	jne    0x140385c66
   140385c45:	4e 39 ac 1b 78 63 f0 	cmp    QWORD PTR [rbx+r11*1+0x14f06378],r13
   140385c4c:	14 
   140385c4d:	74 17                	je     0x140385c66
   140385c4f:	0f 28 c1             	movaps xmm0,xmm1
   140385c52:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   140385c57:	66 0f 2f 84 1d c8 07 	comisd xmm0,QWORD PTR [rbp+rbx*1+0x7c8]
   140385c5e:	00 00 
   140385c60:	0f 82 d2 00 00 00    	jb     0x140385d38
   140385c66:	45 8b dd             	mov    r11d,r13d
   140385c69:	41 8b 17             	mov    edx,DWORD PTR [r15]
   140385c6c:	48 69 c2 78 ab 06 00 	imul   rax,rdx,0x6ab78
   140385c73:	48 8d 3d 86 a3 c7 ff 	lea    rdi,[rip+0xffffffffffc7a386]        # 0x140000000
   140385c7a:	44 39 ac 38 d8 a5 98 	cmp    DWORD PTR [rax+rdi*1+0x98a5d8],r13d
   140385c81:	00 
   140385c82:	0f 86 a9 00 00 00    	jbe    0x140385d31
   140385c88:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140385c8f:	00 
   140385c90:	41 8b cb             	mov    ecx,r11d
   140385c93:	8b c2                	mov    eax,edx
   140385c95:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140385c9c:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   140385ca0:	48 03 c9             	add    rcx,rcx
   140385ca3:	48 8b 84 38 d0 a5 98 	mov    rax,QWORD PTR [rax+rdi*1+0x98a5d0]
   140385caa:	00 
   140385cab:	48 8b 74 c8 30       	mov    rsi,QWORD PTR [rax+rcx*8+0x30]
   140385cb0:	8b c2                	mov    eax,edx
   140385cb2:	48 85 f6             	test   rsi,rsi
   140385cb5:	74 60                	je     0x140385d17
   140385cb7:	45 8b c5             	mov    r8d,r13d
   140385cba:	4c 8d 4e 20          	lea    r9,[rsi+0x20]
   140385cbe:	66 90                	xchg   ax,ax
   140385cc0:	41 0f b7 01          	movzx  eax,WORD PTR [r9]
   140385cc4:	41 3b c2             	cmp    eax,r10d
   140385cc7:	75 32                	jne    0x140385cfb
   140385cc9:	41 8b d0             	mov    edx,r8d
   140385ccc:	41 83 f8 07          	cmp    r8d,0x7
   140385cd0:	73 21                	jae    0x140385cf3
   140385cd2:	41 8b f8             	mov    edi,r8d
   140385cd5:	48 83 c7 04          	add    rdi,0x4
   140385cd9:	48 8d 3c fe          	lea    rdi,[rsi+rdi*8]
   140385cdd:	0f 1f 00             	nop    DWORD PTR [rax]
   140385ce0:	ff c2                	inc    edx
   140385ce2:	48 8b 4c d6 20       	mov    rcx,QWORD PTR [rsi+rdx*8+0x20]
   140385ce7:	48 89 0f             	mov    QWORD PTR [rdi],rcx
   140385cea:	48 8d 7f 08          	lea    rdi,[rdi+0x8]
   140385cee:	83 fa 07             	cmp    edx,0x7
   140385cf1:	72 ed                	jb     0x140385ce0
   140385cf3:	48 c7 46 58 ff ff 00 	mov    QWORD PTR [rsi+0x58],0xffff
   140385cfa:	00 
   140385cfb:	41 ff c0             	inc    r8d
   140385cfe:	49 83 c1 08          	add    r9,0x8
   140385d02:	41 83 f8 08          	cmp    r8d,0x8
   140385d06:	72 b8                	jb     0x140385cc0
   140385d08:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   140385d0d:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140385d10:	48 8d 3d e9 a2 c7 ff 	lea    rdi,[rip+0xffffffffffc7a2e9]        # 0x140000000
   140385d17:	41 ff c3             	inc    r11d
   140385d1a:	8b d0                	mov    edx,eax
   140385d1c:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140385d23:	44 3b 9c 39 d8 a5 98 	cmp    r11d,DWORD PTR [rcx+rdi*1+0x98a5d8]
   140385d2a:	00 
   140385d2b:	0f 82 5f ff ff ff    	jb     0x140385c90
   140385d31:	4c 8d 1d c8 a2 c7 ff 	lea    r11,[rip+0xffffffffffc7a2c8]        # 0x140000000
   140385d38:	41 ff c2             	inc    r10d
   140385d3b:	49 ff c6             	inc    r14
   140385d3e:	48 83 c3 08          	add    rbx,0x8
   140385d42:	41 83 fa 7f          	cmp    r10d,0x7f
   140385d46:	0f 86 d5 fe ff ff    	jbe    0x140385c21
   140385d4c:	44 8b 7c 24 38       	mov    r15d,DWORD PTR [rsp+0x38]
   140385d51:	4c 8d 35 a8 a2 c7 ff 	lea    r14,[rip+0xffffffffffc7a2a8]        # 0x140000000
   140385d58:	0f b6 05 c1 05 b8 14 	movzx  eax,BYTE PTR [rip+0x14b805c1]        # 0x154f06320
   140385d5f:	04 1e                	add    al,0x1e
   140385d61:	88 05 b9 05 b8 14    	mov    BYTE PTR [rip+0x14b805b9],al        # 0x154f06320
   140385d67:	0f b6 c8             	movzx  ecx,al
   140385d6a:	45 33 c0             	xor    r8d,r8d
   140385d6d:	33 d2                	xor    edx,edx
   140385d6f:	e8 2c 9b 00 00       	call   0x14038f8a0
   140385d74:	41 ff c7             	inc    r15d
   140385d77:	44 89 7c 24 38       	mov    DWORD PTR [rsp+0x38],r15d
   140385d7c:	44 3b 7c 24 50       	cmp    r15d,DWORD PTR [rsp+0x50]
   140385d81:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   140385d86:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   140385d8b:	0f 82 5f ee ff ff    	jb     0x140384bf0
   140385d91:	bb ff ff 00 00       	mov    ebx,0xffff
   140385d96:	49 c7 c4 ff ff ff ff 	mov    r12,0xffffffffffffffff
   140385d9d:	e8 0e 17 1b 00       	call   0x1405374b0
   140385da2:	45 0f 57 e4          	xorps  xmm12,xmm12
   140385da6:	80 7c 24 4c 00       	cmp    BYTE PTR [rsp+0x4c],0x0
   140385dab:	0f 84 6e 17 00 00    	je     0x14038751f
   140385db1:	41 8b 0f             	mov    ecx,DWORD PTR [r15]
   140385db4:	48 69 d1 78 ab 06 00 	imul   rdx,rcx,0x6ab78
   140385dbb:	42 8b 94 32 d8 a5 98 	mov    edx,DWORD PTR [rdx+r14*1+0x98a5d8]
   140385dc2:	00 
   140385dc3:	c1 e2 03             	shl    edx,0x3
   140385dc6:	b8 08 00 00 00       	mov    eax,0x8
   140385dcb:	48 f7 e2             	mul    rdx
   140385dce:	49 0f 40 c4          	cmovo  rax,r12
   140385dd2:	48 8b c8             	mov    rcx,rax
   140385dd5:	e8 86 57 29 00       	call   0x14061b560
   140385dda:	4c 8b c0             	mov    r8,rax
   140385ddd:	48 89 44 24 58       	mov    QWORD PTR [rsp+0x58],rax
   140385de2:	48 85 c0             	test   rax,rax
   140385de5:	75 0a                	jne    0x140385df1
   140385de7:	e8 14 9c 00 00       	call   0x14038fa00
   140385dec:	e9 92 18 00 00       	jmp    0x140387683
   140385df1:	41 8b f5             	mov    esi,r13d
   140385df4:	41 8b 3f             	mov    edi,DWORD PTR [r15]
   140385df7:	48 69 c7 78 ab 06 00 	imul   rax,rdi,0x6ab78
   140385dfe:	42 83 bc 30 d8 a5 98 	cmp    DWORD PTR [rax+r14*1+0x98a5d8],0x0
   140385e05:	00 00 
   140385e07:	0f 86 92 00 00 00    	jbe    0x140385e9f
   140385e0d:	0f 1f 00             	nop    DWORD PTR [rax]
   140385e10:	8b ce                	mov    ecx,esi
   140385e12:	8b c7                	mov    eax,edi
   140385e14:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140385e1b:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   140385e1f:	48 c1 e1 04          	shl    rcx,0x4
   140385e23:	4a 8b 84 30 d0 a5 98 	mov    rax,QWORD PTR [rax+r14*1+0x98a5d0]
   140385e2a:	00 
   140385e2b:	48 8b 54 08 30       	mov    rdx,QWORD PTR [rax+rcx*1+0x30]
   140385e30:	8b c7                	mov    eax,edi
   140385e32:	48 85 d2             	test   rdx,rdx
   140385e35:	74 4f                	je     0x140385e86
   140385e37:	8b c7                	mov    eax,edi
   140385e39:	66 83 ba 1c 02 00 00 	cmp    WORD PTR [rdx+0x21c],0x0
   140385e40:	00 
   140385e41:	7c 43                	jl     0x140385e86
   140385e43:	0f b7 4a 20          	movzx  ecx,WORD PTR [rdx+0x20]
   140385e47:	8b c7                	mov    eax,edi
   140385e49:	66 3b cb             	cmp    cx,bx
   140385e4c:	74 38                	je     0x140385e86
   140385e4e:	8b c7                	mov    eax,edi
   140385e50:	66 85 c9             	test   cx,cx
   140385e53:	74 31                	je     0x140385e86
   140385e55:	8d 04 f5 00 00 00 00 	lea    eax,[rsi*8+0x0]
   140385e5c:	0f 10 42 20          	movups xmm0,XMMWORD PTR [rdx+0x20]
   140385e60:	41 0f 11 04 c0       	movups XMMWORD PTR [r8+rax*8],xmm0
   140385e65:	0f 10 4a 30          	movups xmm1,XMMWORD PTR [rdx+0x30]
   140385e69:	41 0f 11 4c c0 10    	movups XMMWORD PTR [r8+rax*8+0x10],xmm1
   140385e6f:	0f 10 42 40          	movups xmm0,XMMWORD PTR [rdx+0x40]
   140385e73:	41 0f 11 44 c0 20    	movups XMMWORD PTR [r8+rax*8+0x20],xmm0
   140385e79:	0f 10 4a 50          	movups xmm1,XMMWORD PTR [rdx+0x50]
   140385e7d:	41 0f 11 4c c0 30    	movups XMMWORD PTR [r8+rax*8+0x30],xmm1
   140385e83:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140385e86:	ff c6                	inc    esi
   140385e88:	8b f8                	mov    edi,eax
   140385e8a:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140385e91:	42 3b b4 31 d8 a5 98 	cmp    esi,DWORD PTR [rcx+r14*1+0x98a5d8]
   140385e98:	00 
   140385e99:	0f 82 71 ff ff ff    	jb     0x140385e10
   140385e9f:	41 8b dd             	mov    ebx,r13d
   140385ea2:	89 5c 24 40          	mov    DWORD PTR [rsp+0x40],ebx
   140385ea6:	f3 44 0f 10 3d 61 12 	movss  xmm15,DWORD PTR [rip+0x311261]        # 0x140697110
   140385ead:	31 00 
   140385eaf:	f3 0f 10 3d 25 a1 4c 	movss  xmm7,DWORD PTR [rip+0x4ca125]        # 0x14084ffdc
   140385eb6:	00 
   140385eb7:	f3 0f 10 35 95 12 31 	movss  xmm6,DWORD PTR [rip+0x311295]        # 0x140697154
   140385ebe:	00 
   140385ebf:	41 bc ff ff 00 00    	mov    r12d,0xffff
   140385ec5:	41 8b cd             	mov    ecx,r13d
   140385ec8:	89 4c 24 38          	mov    DWORD PTR [rsp+0x38],ecx
   140385ecc:	41 8b 17             	mov    edx,DWORD PTR [r15]
   140385ecf:	48 69 c2 78 ab 06 00 	imul   rax,rdx,0x6ab78
   140385ed6:	42 83 bc 30 d8 a5 98 	cmp    DWORD PTR [rax+r14*1+0x98a5d8],0x0
   140385edd:	00 00 
   140385edf:	0f 86 9f 0c 00 00    	jbe    0x140386b84
   140385ee5:	41 8b 3f             	mov    edi,DWORD PTR [r15]
   140385ee8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140385eef:	00 
   140385ef0:	8b c1                	mov    eax,ecx
   140385ef2:	4c 8d 24 c0          	lea    r12,[rax+rax*8]
   140385ef6:	49 c1 e4 04          	shl    r12,0x4
   140385efa:	4c 89 64 24 70       	mov    QWORD PTR [rsp+0x70],r12
   140385eff:	8b c2                	mov    eax,edx
   140385f01:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140385f08:	4a 8b 94 31 d0 a5 98 	mov    rdx,QWORD PTR [rcx+r14*1+0x98a5d0]
   140385f0f:	00 
   140385f10:	4a 8b 5c 22 30       	mov    rbx,QWORD PTR [rdx+r12*1+0x30]
   140385f15:	48 89 5c 24 68       	mov    QWORD PTR [rsp+0x68],rbx
   140385f1a:	8b cf                	mov    ecx,edi
   140385f1c:	48 85 db             	test   rbx,rbx
   140385f1f:	0f 84 2a 0c 00 00    	je     0x140386b4f
   140385f25:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   140385f2c:	00 
   140385f2d:	0f 8c 1c 0c 00 00    	jl     0x140386b4f
   140385f33:	0f b7 43 20          	movzx  eax,WORD PTR [rbx+0x20]
   140385f37:	be ff ff 00 00       	mov    esi,0xffff
   140385f3c:	66 3b c6             	cmp    ax,si
   140385f3f:	0f 84 0a 0c 00 00    	je     0x140386b4f
   140385f45:	66 85 c0             	test   ax,ax
   140385f48:	0f 84 01 0c 00 00    	je     0x140386b4f
   140385f4e:	4c 8d 6b 24          	lea    r13,[rbx+0x24]
   140385f52:	f3 41 0f 10 45 00    	movss  xmm0,DWORD PTR [r13+0x0]
   140385f58:	0f 2f c6             	comiss xmm0,xmm6
   140385f5b:	72 0f                	jb     0x140385f6c
   140385f5d:	f3 0f 5c 43 2c       	subss  xmm0,DWORD PTR [rbx+0x2c]
   140385f62:	41 0f 2f c7          	comiss xmm0,xmm15
   140385f66:	0f 87 e3 0b 00 00    	ja     0x140386b4f
   140385f6c:	f3 42 0f 10 44 22 24 	movss  xmm0,DWORD PTR [rdx+r12*1+0x24]
   140385f73:	f3 0f 58 c7          	addss  xmm0,xmm7
   140385f77:	f3 0f 2c c0          	cvttss2si eax,xmm0
   140385f7b:	0f b6 c8             	movzx  ecx,al
   140385f7e:	8d 41 f8             	lea    eax,[rcx-0x8]
   140385f81:	89 44 24 50          	mov    DWORD PTR [rsp+0x50],eax
   140385f85:	8d 41 08             	lea    eax,[rcx+0x8]
   140385f88:	89 44 24 60          	mov    DWORD PTR [rsp+0x60],eax
   140385f8c:	f3 46 0f 10 6c 22 14 	movss  xmm13,DWORD PTR [rdx+r12*1+0x14]
   140385f93:	f3 46 0f 10 74 22 10 	movss  xmm14,DWORD PTR [rdx+r12*1+0x10]
   140385f9a:	45 0f 28 dd          	movaps xmm11,xmm13
   140385f9e:	f3 45 0f 5c de       	subss  xmm11,xmm14
   140385fa3:	f3 0f 10 05 85 a0 4c 	movss  xmm0,DWORD PTR [rip+0x4ca085]        # 0x140850030
   140385faa:	00 
   140385fab:	44 0f 2f d8          	comiss xmm11,xmm0
   140385faf:	76 0e                	jbe    0x140385fbf
   140385fb1:	f3 0f 10 05 e7 a1 4c 	movss  xmm0,DWORD PTR [rip+0x4ca1e7]        # 0x1408501a0
   140385fb8:	00 
   140385fb9:	41 0f 2f c3          	comiss xmm0,xmm11
   140385fbd:	77 04                	ja     0x140385fc3
   140385fbf:	44 0f 28 d8          	movaps xmm11,xmm0
   140385fc3:	f3 45 0f 5c f3       	subss  xmm14,xmm11
   140385fc8:	f3 45 0f 58 eb       	addss  xmm13,xmm11
   140385fcd:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   140385fd4:	44 8b c0             	mov    r8d,eax
   140385fd7:	8b d0                	mov    edx,eax
   140385fd9:	48 8b cb             	mov    rcx,rbx
   140385fdc:	e8 ef 56 fe ff       	call   0x14036b6d0
   140385fe1:	66 89 44 24 4c       	mov    WORD PTR [rsp+0x4c],ax
   140385fe6:	33 d2                	xor    edx,edx
   140385fe8:	41 b8 00 02 00 00    	mov    r8d,0x200
   140385fee:	48 8d 4d c0          	lea    rcx,[rbp-0x40]
   140385ff2:	e8 f3 ac 29 00       	call   0x140620cea
   140385ff7:	33 d2                	xor    edx,edx
   140385ff9:	41 b8 00 02 00 00    	mov    r8d,0x200
   140385fff:	48 8d 8d c0 07 00 00 	lea    rcx,[rbp+0x7c0]
   140386006:	e8 df ac 29 00       	call   0x140620cea
   14038600b:	33 d2                	xor    edx,edx
   14038600d:	41 b8 00 02 00 00    	mov    r8d,0x200
   140386013:	48 8d 8d c0 01 00 00 	lea    rcx,[rbp+0x1c0]
   14038601a:	e8 cb ac 29 00       	call   0x140620cea
   14038601f:	40 32 f6             	xor    sil,sil
   140386022:	45 33 ff             	xor    r15d,r15d
   140386025:	44 89 7c 24 3c       	mov    DWORD PTR [rsp+0x3c],r15d
   14038602a:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   14038602f:	8b 08                	mov    ecx,DWORD PTR [rax]
   140386031:	48 69 c1 78 ab 06 00 	imul   rax,rcx,0x6ab78
   140386038:	46 39 bc 30 d8 a5 98 	cmp    DWORD PTR [rax+r14*1+0x98a5d8],r15d
   14038603f:	00 
   140386040:	0f 86 04 0b 00 00    	jbe    0x140386b4a
   140386046:	8b d1                	mov    edx,ecx
   140386048:	f3 44 0f 10 15 03 11 	movss  xmm10,DWORD PTR [rip+0x311103]        # 0x140697154
   14038604f:	31 00 
   140386051:	45 8b f7             	mov    r14d,r15d
   140386054:	4b 8d 3c ff          	lea    rdi,[r15+r15*8]
   140386058:	48 03 ff             	add    rdi,rdi
   14038605b:	8b c1                	mov    eax,ecx
   14038605d:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140386064:	48 8d 05 95 9f c7 ff 	lea    rax,[rip+0xffffffffffc79f95]        # 0x140000000
   14038606b:	48 8b 8c 01 d0 a5 98 	mov    rcx,QWORD PTR [rcx+rax*1+0x98a5d0]
   140386072:	00 
   140386073:	44 0f 2f 74 f9 14    	comiss xmm14,DWORD PTR [rcx+rdi*8+0x14]
   140386079:	0f 87 56 03 00 00    	ja     0x1403863d5
   14038607f:	f3 0f 10 44 f9 10    	movss  xmm0,DWORD PTR [rcx+rdi*8+0x10]
   140386085:	41 0f 2f c5          	comiss xmm0,xmm13
   140386089:	0f 87 75 03 00 00    	ja     0x140386404
   14038608f:	44 3b 7c 24 38       	cmp    r15d,DWORD PTR [rsp+0x38]
   140386094:	0f 84 3b 03 00 00    	je     0x1403863d5
   14038609a:	48 8b 5c f9 30       	mov    rbx,QWORD PTR [rcx+rdi*8+0x30]
   14038609f:	48 85 db             	test   rbx,rbx
   1403860a2:	0f 84 2d 03 00 00    	je     0x1403863d5
   1403860a8:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   1403860af:	00 
   1403860b0:	0f 8c 1f 03 00 00    	jl     0x1403863d5
   1403860b6:	0f b7 43 20          	movzx  eax,WORD PTR [rbx+0x20]
   1403860ba:	66 ff c8             	dec    ax
   1403860bd:	ba fd ff 00 00       	mov    edx,0xfffd
   1403860c2:	66 3b c2             	cmp    ax,dx
   1403860c5:	0f 87 0a 03 00 00    	ja     0x1403863d5
   1403860cb:	f3 0f 10 44 f9 24    	movss  xmm0,DWORD PTR [rcx+rdi*8+0x24]
   1403860d1:	f3 0f 58 c7          	addss  xmm0,xmm7
   1403860d5:	f3 0f 2c c0          	cvttss2si eax,xmm0
   1403860d9:	0f b6 c8             	movzx  ecx,al
   1403860dc:	3b 4c 24 50          	cmp    ecx,DWORD PTR [rsp+0x50]
   1403860e0:	0f 8c ef 02 00 00    	jl     0x1403863d5
   1403860e6:	3b 4c 24 60          	cmp    ecx,DWORD PTR [rsp+0x60]
   1403860ea:	0f 87 e5 02 00 00    	ja     0x1403863d5
   1403860f0:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   1403860f7:	44 8b c0             	mov    r8d,eax
   1403860fa:	8b d0                	mov    edx,eax
   1403860fc:	48 8b cb             	mov    rcx,rbx
   1403860ff:	e8 cc 55 fe ff       	call   0x14036b6d0
   140386104:	0f bf c8             	movsx  ecx,ax
   140386107:	0f bf 44 24 4c       	movsx  eax,WORD PTR [rsp+0x4c]
   14038610c:	2b c1                	sub    eax,ecx
   14038610e:	99                   	cdq
   14038610f:	33 c2                	xor    eax,edx
   140386111:	2b c2                	sub    eax,edx
   140386113:	3d 00 70 00 00       	cmp    eax,0x7000
   140386118:	0f 8f b7 02 00 00    	jg     0x1403863d5
   14038611e:	48 8b 44 24 68       	mov    rax,QWORD PTR [rsp+0x68]
   140386123:	0f b6 40 22          	movzx  eax,BYTE PTR [rax+0x22]
   140386127:	38 43 22             	cmp    BYTE PTR [rbx+0x22],al
   14038612a:	0f 82 a5 02 00 00    	jb     0x1403863d5
   140386130:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   140386135:	8b 00                	mov    eax,DWORD PTR [rax]
   140386137:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   14038613e:	4c 8d 15 bb 9e c7 ff 	lea    r10,[rip+0xffffffffffc79ebb]        # 0x140000000
   140386145:	4a 8b b4 11 d0 a5 98 	mov    rsi,QWORD PTR [rcx+r10*1+0x98a5d0]
   14038614c:	00 
   14038614d:	f3 42 0f 10 7c 26 14 	movss  xmm7,DWORD PTR [rsi+r12*1+0x14]
   140386154:	f3 44 0f 10 4c fe 10 	movss  xmm9,DWORD PTR [rsi+rdi*8+0x10]
   14038615b:	f3 0f 10 74 fe 14    	movss  xmm6,DWORD PTR [rsi+rdi*8+0x14]
   140386161:	f3 42 0f 10 5c 26 10 	movss  xmm3,DWORD PTR [rsi+r12*1+0x10]
   140386168:	44 0f 28 c7          	movaps xmm8,xmm7
   14038616c:	f3 44 0f 5c c3       	subss  xmm8,xmm3
   140386171:	0f 28 e6             	movaps xmm4,xmm6
   140386174:	f3 41 0f 5c e1       	subss  xmm4,xmm9
   140386179:	0f 28 d7             	movaps xmm2,xmm7
   14038617c:	f3 41 0f 5c d1       	subss  xmm2,xmm9
   140386181:	0f 28 c6             	movaps xmm0,xmm6
   140386184:	f3 0f 5c c3          	subss  xmm0,xmm3
   140386188:	f3 0f 5d d0          	minss  xmm2,xmm0
   14038618c:	41 0f 28 c8          	movaps xmm1,xmm8
   140386190:	f3 0f 59 0d b8 0f 31 	mulss  xmm1,DWORD PTR [rip+0x310fb8]        # 0x140697150
   140386197:	00 
   140386198:	0f 28 c4             	movaps xmm0,xmm4
   14038619b:	f3 0f 59 05 ad 0f 31 	mulss  xmm0,DWORD PTR [rip+0x310fad]        # 0x140697150
   1403861a2:	00 
   1403861a3:	f3 0f 5d c8          	minss  xmm1,xmm0
   1403861a7:	0f 2f d1             	comiss xmm2,xmm1
   1403861aa:	41 0f 97 c1          	seta   r9b
   1403861ae:	f3 0f 10 15 7a 9e 4c 	movss  xmm2,DWORD PTR [rip+0x4c9e7a]        # 0x140850030
   1403861b5:	00 
   1403861b6:	0f 28 ea             	movaps xmm5,xmm2
   1403861b9:	0f 28 c7             	movaps xmm0,xmm7
   1403861bc:	f3 0f 10 0d 18 9e 4c 	movss  xmm1,DWORD PTR [rip+0x4c9e18]        # 0x14084ffdc
   1403861c3:	00 
   1403861c4:	f3 0f 58 c1          	addss  xmm0,xmm1
   1403861c8:	44 0f 2f c8          	comiss xmm9,xmm0
   1403861cc:	76 1c                	jbe    0x1403861ea
   1403861ce:	41 0f 28 c1          	movaps xmm0,xmm9
   1403861d2:	f3 0f 5c c7          	subss  xmm0,xmm7
   1403861d6:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403861da:	f3 41 0f 5f c4       	maxss  xmm0,xmm12
   1403861df:	f3 41 0f 5e c3       	divss  xmm0,xmm11
   1403861e4:	f3 0f 5c e8          	subss  xmm5,xmm0
   1403861e8:	eb 25                	jmp    0x14038620f
   1403861ea:	0f 28 c3             	movaps xmm0,xmm3
   1403861ed:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403861f1:	0f 2f c6             	comiss xmm0,xmm6
   1403861f4:	76 19                	jbe    0x14038620f
   1403861f6:	f3 0f 5c de          	subss  xmm3,xmm6
   1403861fa:	f3 0f 5c d9          	subss  xmm3,xmm1
   1403861fe:	f3 41 0f 5f dc       	maxss  xmm3,xmm12
   140386203:	f3 41 0f 5e db       	divss  xmm3,xmm11
   140386208:	0f 28 ea             	movaps xmm5,xmm2
   14038620b:	f3 0f 5c eb          	subss  xmm5,xmm3
   14038620f:	f3 0f 10 44 fe 24    	movss  xmm0,DWORD PTR [rsi+rdi*8+0x24]
   140386215:	f3 42 0f 10 4c 26 24 	movss  xmm1,DWORD PTR [rsi+r12*1+0x24]
   14038621c:	0f 2f c1             	comiss xmm0,xmm1
   14038621f:	76 06                	jbe    0x140386227
   140386221:	f3 0f 5c c1          	subss  xmm0,xmm1
   140386225:	eb 07                	jmp    0x14038622e
   140386227:	f3 0f 5c c8          	subss  xmm1,xmm0
   14038622b:	0f 28 c1             	movaps xmm0,xmm1
   14038622e:	f3 0f 5c 05 9a 9c 32 	subss  xmm0,DWORD PTR [rip+0x329c9a]        # 0x1406afed0
   140386235:	00 
   140386236:	f3 41 0f 5f c4       	maxss  xmm0,xmm12
   14038623b:	f3 0f 59 05 c5 0e 31 	mulss  xmm0,DWORD PTR [rip+0x310ec5]        # 0x140697108
   140386242:	00 
   140386243:	0f 28 da             	movaps xmm3,xmm2
   140386246:	f3 0f 5c d8          	subss  xmm3,xmm0
   14038624a:	f3 0f 59 dd          	mulss  xmm3,xmm5
   14038624e:	f3 0f 10 2d c6 0e 31 	movss  xmm5,DWORD PTR [rip+0x310ec6]        # 0x14069711c
   140386255:	00 
   140386256:	44 0f 2f c5          	comiss xmm8,xmm5
   14038625a:	76 06                	jbe    0x140386262
   14038625c:	41 0f 28 c0          	movaps xmm0,xmm8
   140386260:	eb 03                	jmp    0x140386265
   140386262:	0f 28 c5             	movaps xmm0,xmm5
   140386265:	0f 2f c4             	comiss xmm0,xmm4
   140386268:	76 1d                	jbe    0x140386287
   14038626a:	f3 41 0f 5e e0       	divss  xmm4,xmm8
   14038626f:	0f 2f d4             	comiss xmm2,xmm4
   140386272:	76 0c                	jbe    0x140386280
   140386274:	41 0f 2f e4          	comiss xmm4,xmm12
   140386278:	77 09                	ja     0x140386283
   14038627a:	41 0f 28 e4          	movaps xmm4,xmm12
   14038627e:	eb 03                	jmp    0x140386283
   140386280:	0f 28 e2             	movaps xmm4,xmm2
   140386283:	f3 0f 59 dc          	mulss  xmm3,xmm4
   140386287:	8b 54 fe 28          	mov    edx,DWORD PTR [rsi+rdi*8+0x28]
   14038628b:	85 d2                	test   edx,edx
   14038628d:	75 07                	jne    0x140386296
   14038628f:	42 39 54 26 28       	cmp    DWORD PTR [rsi+r12*1+0x28],edx
   140386294:	74 51                	je     0x1403862e7
   140386296:	42 8b 4c 26 28       	mov    ecx,DWORD PTR [rsi+r12*1+0x28]
   14038629b:	8b 44 24 38          	mov    eax,DWORD PTR [rsp+0x38]
   14038629f:	3b ca                	cmp    ecx,edx
   1403862a1:	49 0f 43 c6          	cmovae rax,r14
   1403862a5:	48 8d 04 c0          	lea    rax,[rax+rax*8]
   1403862a9:	48 03 c0             	add    rax,rax
   1403862ac:	8b 44 c6 28          	mov    eax,DWORD PTR [rsi+rax*8+0x28]
   1403862b0:	0f 57 c9             	xorps  xmm1,xmm1
   1403862b3:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   1403862b8:	f3 0f 59 0d a8 9f 4c 	mulss  xmm1,DWORD PTR [rip+0x4c9fa8]        # 0x140850268
   1403862bf:	00 
   1403862c0:	3b d1                	cmp    edx,ecx
   1403862c2:	0f 43 ca             	cmovae ecx,edx
   1403862c5:	8b c1                	mov    eax,ecx
   1403862c7:	0f 57 c0             	xorps  xmm0,xmm0
   1403862ca:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1403862cf:	f3 0f 5e c8          	divss  xmm1,xmm0
   1403862d3:	f3 0f 5d ca          	minss  xmm1,xmm2
   1403862d7:	f3 0f 59 cd          	mulss  xmm1,xmm5
   1403862db:	f3 0f 58 0d 61 0e 31 	addss  xmm1,DWORD PTR [rip+0x310e61]        # 0x140697144
   1403862e2:	00 
   1403862e3:	f3 0f 59 d9          	mulss  xmm3,xmm1
   1403862e7:	0f 28 d6             	movaps xmm2,xmm6
   1403862ea:	f3 41 0f 5c d1       	subss  xmm2,xmm9
   1403862ef:	45 33 ff             	xor    r15d,r15d
   1403862f2:	45 8b c7             	mov    r8d,r15d
   1403862f5:	48 8d 73 24          	lea    rsi,[rbx+0x24]
   1403862f9:	44 8b 64 24 40       	mov    r12d,DWORD PTR [rsp+0x40]
   1403862fe:	66 90                	xchg   ax,ax
   140386300:	45 85 e4             	test   r12d,r12d
   140386303:	75 23                	jne    0x140386328
   140386305:	f3 0f 10 0e          	movss  xmm1,DWORD PTR [rsi]
   140386309:	44 0f 2f d1          	comiss xmm10,xmm1
   14038630d:	0f 87 ad 00 00 00    	ja     0x1403863c0
   140386313:	f3 0f 10 43 24       	movss  xmm0,DWORD PTR [rbx+0x24]
   140386318:	f3 0f 5c c1          	subss  xmm0,xmm1
   14038631c:	41 0f 2f c7          	comiss xmm0,xmm15
   140386320:	0f 87 9a 00 00 00    	ja     0x1403863c0
   140386326:	eb 0f                	jmp    0x140386337
   140386328:	41 83 fc 01          	cmp    r12d,0x1
   14038632c:	75 09                	jne    0x140386337
   14038632e:	45 85 c0             	test   r8d,r8d
   140386331:	0f 85 89 00 00 00    	jne    0x1403863c0
   140386337:	0f b7 56 fc          	movzx  edx,WORD PTR [rsi-0x4]
   14038633b:	8d 42 ff             	lea    eax,[rdx-0x1]
   14038633e:	66 83 f8 7e          	cmp    ax,0x7e
   140386342:	77 6b                	ja     0x1403863af
   140386344:	0f b7 fa             	movzx  edi,dx
   140386347:	49 8b 84 fa 70 63 f0 	mov    rax,QWORD PTR [r10+rdi*8+0x14f06370]
   14038634e:	14 
   14038634f:	f6 40 28 01          	test   BYTE PTR [rax+0x28],0x1
   140386353:	74 05                	je     0x14038635a
   140386355:	45 84 c9             	test   r9b,r9b
   140386358:	75 55                	jne    0x1403863af
   14038635a:	41 8b cf             	mov    ecx,r15d
   14038635d:	49 8b c5             	mov    rax,r13
   140386360:	66 39 50 fc          	cmp    WORD PTR [rax-0x4],dx
   140386364:	75 10                	jne    0x140386376
   140386366:	f3 41 0f 10 45 00    	movss  xmm0,DWORD PTR [r13+0x0]
   14038636c:	f3 0f 5c 00          	subss  xmm0,DWORD PTR [rax]
   140386370:	44 0f 2f f8          	comiss xmm15,xmm0
   140386374:	77 0d                	ja     0x140386383
   140386376:	ff c1                	inc    ecx
   140386378:	48 83 c0 08          	add    rax,0x8
   14038637c:	83 f9 08             	cmp    ecx,0x8
   14038637f:	73 2e                	jae    0x1403863af
   140386381:	eb dd                	jmp    0x140386360
   140386383:	0f 28 c3             	movaps xmm0,xmm3
   140386386:	f3 0f 59 06          	mulss  xmm0,DWORD PTR [rsi]
   14038638a:	f3 0f 59 c2          	mulss  xmm0,xmm2
   14038638e:	f3 0f 58 44 bd c0    	addss  xmm0,DWORD PTR [rbp+rdi*4-0x40]
   140386394:	f3 0f 11 44 bd c0    	movss  DWORD PTR [rbp+rdi*4-0x40],xmm0
   14038639a:	0f 28 c2             	movaps xmm0,xmm2
   14038639d:	f3 0f 58 84 bd c0 01 	addss  xmm0,DWORD PTR [rbp+rdi*4+0x1c0]
   1403863a4:	00 00 
   1403863a6:	f3 0f 11 84 bd c0 01 	movss  DWORD PTR [rbp+rdi*4+0x1c0],xmm0
   1403863ad:	00 00 
   1403863af:	41 ff c0             	inc    r8d
   1403863b2:	48 83 c6 08          	add    rsi,0x8
   1403863b6:	41 83 f8 08          	cmp    r8d,0x8
   1403863ba:	0f 82 40 ff ff ff    	jb     0x140386300
   1403863c0:	40 b6 01             	mov    sil,0x1
   1403863c3:	f3 0f 10 3d 11 9c 4c 	movss  xmm7,DWORD PTR [rip+0x4c9c11]        # 0x14084ffdc
   1403863ca:	00 
   1403863cb:	44 8b 7c 24 3c       	mov    r15d,DWORD PTR [rsp+0x3c]
   1403863d0:	4c 8b 64 24 70       	mov    r12,QWORD PTR [rsp+0x70]
   1403863d5:	41 ff c7             	inc    r15d
   1403863d8:	44 89 7c 24 3c       	mov    DWORD PTR [rsp+0x3c],r15d
   1403863dd:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   1403863e2:	8b 10                	mov    edx,DWORD PTR [rax]
   1403863e4:	8b ca                	mov    ecx,edx
   1403863e6:	48 69 c2 78 ab 06 00 	imul   rax,rdx,0x6ab78
   1403863ed:	4c 8d 35 0c 9c c7 ff 	lea    r14,[rip+0xffffffffffc79c0c]        # 0x140000000
   1403863f4:	46 3b bc 30 d8 a5 98 	cmp    r15d,DWORD PTR [rax+r14*1+0x98a5d8]
   1403863fb:	00 
   1403863fc:	0f 82 4f fc ff ff    	jb     0x140386051
   140386402:	eb 07                	jmp    0x14038640b
   140386404:	4c 8d 35 f5 9b c7 ff 	lea    r14,[rip+0xffffffffffc79bf5]        # 0x140000000
   14038640b:	8b ca                	mov    ecx,edx
   14038640d:	40 84 f6             	test   sil,sil
   140386410:	f3 44 0f 10 15 83 0d 	movss  xmm10,DWORD PTR [rip+0x310d83]        # 0x14069719c
   140386417:	31 00 
   140386419:	0f 84 23 07 00 00    	je     0x140386b42
   14038641f:	b9 02 00 00 00       	mov    ecx,0x2
   140386424:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140386428:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14038642f:	00 
   140386430:	8d 41 fe             	lea    eax,[rcx-0x2]
   140386433:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038643a:	00 00 
   14038643c:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386440:	7a 02                	jp     0x140386444
   140386442:	74 15                	je     0x140386459
   140386444:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386449:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   14038644f:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386453:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386459:	8d 41 ff             	lea    eax,[rcx-0x1]
   14038645c:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386463:	00 00 
   140386465:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386469:	7a 02                	jp     0x14038646d
   14038646b:	74 15                	je     0x140386482
   14038646d:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386472:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386478:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038647c:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386482:	8b c1                	mov    eax,ecx
   140386484:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038648b:	00 00 
   14038648d:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386491:	7a 02                	jp     0x140386495
   140386493:	74 15                	je     0x1403864aa
   140386495:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038649a:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403864a0:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403864a4:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403864aa:	8d 41 01             	lea    eax,[rcx+0x1]
   1403864ad:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403864b4:	00 00 
   1403864b6:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403864ba:	7a 02                	jp     0x1403864be
   1403864bc:	74 15                	je     0x1403864d3
   1403864be:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403864c3:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403864c9:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403864cd:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403864d3:	8d 41 02             	lea    eax,[rcx+0x2]
   1403864d6:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403864dd:	00 00 
   1403864df:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403864e3:	7a 02                	jp     0x1403864e7
   1403864e5:	74 15                	je     0x1403864fc
   1403864e7:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403864ec:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403864f2:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403864f6:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403864fc:	8d 41 03             	lea    eax,[rcx+0x3]
   1403864ff:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386506:	00 00 
   140386508:	41 0f 2e cc          	ucomiss xmm1,xmm12
   14038650c:	7a 02                	jp     0x140386510
   14038650e:	74 15                	je     0x140386525
   140386510:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386515:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   14038651b:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038651f:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386525:	8d 41 04             	lea    eax,[rcx+0x4]
   140386528:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038652f:	00 00 
   140386531:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386535:	7a 02                	jp     0x140386539
   140386537:	74 15                	je     0x14038654e
   140386539:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038653e:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386544:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386548:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   14038654e:	8d 41 05             	lea    eax,[rcx+0x5]
   140386551:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386558:	00 00 
   14038655a:	41 0f 2e cc          	ucomiss xmm1,xmm12
   14038655e:	7a 02                	jp     0x140386562
   140386560:	74 15                	je     0x140386577
   140386562:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386567:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   14038656d:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386571:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386577:	8d 41 06             	lea    eax,[rcx+0x6]
   14038657a:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386581:	00 00 
   140386583:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386587:	7a 02                	jp     0x14038658b
   140386589:	74 15                	je     0x1403865a0
   14038658b:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386590:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386596:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038659a:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403865a0:	8d 41 07             	lea    eax,[rcx+0x7]
   1403865a3:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403865aa:	00 00 
   1403865ac:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403865b0:	7a 02                	jp     0x1403865b4
   1403865b2:	74 15                	je     0x1403865c9
   1403865b4:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403865b9:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403865bf:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403865c3:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403865c9:	8d 41 08             	lea    eax,[rcx+0x8]
   1403865cc:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403865d3:	00 00 
   1403865d5:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403865d9:	7a 02                	jp     0x1403865dd
   1403865db:	74 15                	je     0x1403865f2
   1403865dd:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403865e2:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403865e8:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403865ec:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403865f2:	8d 41 09             	lea    eax,[rcx+0x9]
   1403865f5:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403865fc:	00 00 
   1403865fe:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386602:	7a 02                	jp     0x140386606
   140386604:	74 15                	je     0x14038661b
   140386606:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038660b:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386611:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386615:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   14038661b:	8d 41 0a             	lea    eax,[rcx+0xa]
   14038661e:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386625:	00 00 
   140386627:	41 0f 2e cc          	ucomiss xmm1,xmm12
   14038662b:	7a 02                	jp     0x14038662f
   14038662d:	74 15                	je     0x140386644
   14038662f:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386634:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   14038663a:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038663e:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386644:	8d 41 0b             	lea    eax,[rcx+0xb]
   140386647:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038664e:	00 00 
   140386650:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386654:	7a 02                	jp     0x140386658
   140386656:	74 15                	je     0x14038666d
   140386658:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038665d:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386663:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386667:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   14038666d:	8d 41 0c             	lea    eax,[rcx+0xc]
   140386670:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386677:	00 00 
   140386679:	41 0f 2e cc          	ucomiss xmm1,xmm12
   14038667d:	7a 02                	jp     0x140386681
   14038667f:	74 15                	je     0x140386696
   140386681:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386686:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   14038668c:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386690:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386696:	8d 41 0d             	lea    eax,[rcx+0xd]
   140386699:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403866a0:	00 00 
   1403866a2:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403866a6:	7a 02                	jp     0x1403866aa
   1403866a8:	74 15                	je     0x1403866bf
   1403866aa:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403866af:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403866b5:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403866b9:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403866bf:	8d 41 0e             	lea    eax,[rcx+0xe]
   1403866c2:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403866c9:	00 00 
   1403866cb:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403866cf:	7a 02                	jp     0x1403866d3
   1403866d1:	74 15                	je     0x1403866e8
   1403866d3:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403866d8:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403866de:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403866e2:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403866e8:	8d 41 0f             	lea    eax,[rcx+0xf]
   1403866eb:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403866f2:	00 00 
   1403866f4:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403866f8:	7a 02                	jp     0x1403866fc
   1403866fa:	74 15                	je     0x140386711
   1403866fc:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386701:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386707:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038670b:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386711:	8d 41 10             	lea    eax,[rcx+0x10]
   140386714:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038671b:	00 00 
   14038671d:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386721:	7a 02                	jp     0x140386725
   140386723:	74 15                	je     0x14038673a
   140386725:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038672a:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386730:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386734:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   14038673a:	8d 41 11             	lea    eax,[rcx+0x11]
   14038673d:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386744:	00 00 
   140386746:	41 0f 2e cc          	ucomiss xmm1,xmm12
   14038674a:	7a 02                	jp     0x14038674e
   14038674c:	74 15                	je     0x140386763
   14038674e:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386753:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386759:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038675d:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386763:	8d 41 12             	lea    eax,[rcx+0x12]
   140386766:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038676d:	00 00 
   14038676f:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386773:	7a 02                	jp     0x140386777
   140386775:	74 15                	je     0x14038678c
   140386777:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038677c:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386782:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386786:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   14038678c:	8d 41 13             	lea    eax,[rcx+0x13]
   14038678f:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386796:	00 00 
   140386798:	41 0f 2e cc          	ucomiss xmm1,xmm12
   14038679c:	7a 02                	jp     0x1403867a0
   14038679e:	74 15                	je     0x1403867b5
   1403867a0:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403867a5:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403867ab:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403867af:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403867b5:	8d 41 14             	lea    eax,[rcx+0x14]
   1403867b8:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403867bf:	00 00 
   1403867c1:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403867c5:	7a 02                	jp     0x1403867c9
   1403867c7:	74 15                	je     0x1403867de
   1403867c9:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403867ce:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403867d4:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403867d8:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403867de:	8d 41 15             	lea    eax,[rcx+0x15]
   1403867e1:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403867e8:	00 00 
   1403867ea:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403867ee:	7a 02                	jp     0x1403867f2
   1403867f0:	74 15                	je     0x140386807
   1403867f2:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403867f7:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403867fd:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386801:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386807:	8d 41 16             	lea    eax,[rcx+0x16]
   14038680a:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386811:	00 00 
   140386813:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386817:	7a 02                	jp     0x14038681b
   140386819:	74 15                	je     0x140386830
   14038681b:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386820:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386826:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038682a:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386830:	8d 41 17             	lea    eax,[rcx+0x17]
   140386833:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038683a:	00 00 
   14038683c:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386840:	7a 02                	jp     0x140386844
   140386842:	74 15                	je     0x140386859
   140386844:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386849:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   14038684f:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386853:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386859:	8d 41 18             	lea    eax,[rcx+0x18]
   14038685c:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386863:	00 00 
   140386865:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386869:	7a 02                	jp     0x14038686d
   14038686b:	74 15                	je     0x140386882
   14038686d:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386872:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386878:	f3 0f 5e c1          	divss  xmm0,xmm1
   14038687c:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386882:	8d 41 19             	lea    eax,[rcx+0x19]
   140386885:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   14038688c:	00 00 
   14038688e:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386892:	7a 02                	jp     0x140386896
   140386894:	74 15                	je     0x1403868ab
   140386896:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038689b:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403868a1:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403868a5:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403868ab:	8d 41 1a             	lea    eax,[rcx+0x1a]
   1403868ae:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403868b5:	00 00 
   1403868b7:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403868bb:	7a 02                	jp     0x1403868bf
   1403868bd:	74 15                	je     0x1403868d4
   1403868bf:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403868c4:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403868ca:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403868ce:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403868d4:	8d 41 1b             	lea    eax,[rcx+0x1b]
   1403868d7:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   1403868de:	00 00 
   1403868e0:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403868e4:	7a 02                	jp     0x1403868e8
   1403868e6:	74 15                	je     0x1403868fd
   1403868e8:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   1403868ed:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   1403868f3:	f3 0f 5e c1          	divss  xmm0,xmm1
   1403868f7:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   1403868fd:	8d 41 1c             	lea    eax,[rcx+0x1c]
   140386900:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386907:	00 00 
   140386909:	41 0f 2e cc          	ucomiss xmm1,xmm12
   14038690d:	7a 02                	jp     0x140386911
   14038690f:	74 15                	je     0x140386926
   140386911:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   140386916:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   14038691c:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386920:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   140386926:	8d 41 1d             	lea    eax,[rcx+0x1d]
   140386929:	f3 0f 10 8c 85 c0 01 	movss  xmm1,DWORD PTR [rbp+rax*4+0x1c0]
   140386930:	00 00 
   140386932:	41 0f 2e cc          	ucomiss xmm1,xmm12
   140386936:	7a 02                	jp     0x14038693a
   140386938:	74 15                	je     0x14038694f
   14038693a:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14038693f:	f3 0f 10 44 85 c0    	movss  xmm0,DWORD PTR [rbp+rax*4-0x40]
   140386945:	f3 0f 5e c1          	divss  xmm0,xmm1
   140386949:	f3 0f 11 44 85 c0    	movss  DWORD PTR [rbp+rax*4-0x40],xmm0
   14038694f:	83 c1 20             	add    ecx,0x20
   140386952:	8d 41 fe             	lea    eax,[rcx-0x2]
   140386955:	83 f8 7f             	cmp    eax,0x7f
   140386958:	0f 86 d2 fa ff ff    	jbe    0x140386430
   14038695e:	48 8b 5c 24 68       	mov    rbx,QWORD PTR [rsp+0x68]
   140386963:	0f b7 4b 20          	movzx  ecx,WORD PTR [rbx+0x20]
   140386967:	8d 41 ff             	lea    eax,[rcx-0x1]
   14038696a:	66 83 f8 7e          	cmp    ax,0x7e
   14038696e:	77 29                	ja     0x140386999
   140386970:	0f b7 c9             	movzx  ecx,cx
   140386973:	f3 41 0f 10 45 00    	movss  xmm0,DWORD PTR [r13+0x0]
   140386979:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   14038697f:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   140386985:	0f b6 43 22          	movzx  eax,BYTE PTR [rbx+0x22]
   140386989:	66 0f 6e c0          	movd   xmm0,eax
   14038698d:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140386990:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   140386997:	00 00 
   140386999:	0f b7 4b 28          	movzx  ecx,WORD PTR [rbx+0x28]
   14038699d:	8d 41 ff             	lea    eax,[rcx-0x1]
   1403869a0:	66 83 f8 7e          	cmp    ax,0x7e
   1403869a4:	77 28                	ja     0x1403869ce
   1403869a6:	0f b7 c9             	movzx  ecx,cx
   1403869a9:	f3 0f 10 43 2c       	movss  xmm0,DWORD PTR [rbx+0x2c]
   1403869ae:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   1403869b4:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   1403869ba:	0f b6 43 2a          	movzx  eax,BYTE PTR [rbx+0x2a]
   1403869be:	66 0f 6e c0          	movd   xmm0,eax
   1403869c2:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403869c5:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   1403869cc:	00 00 
   1403869ce:	0f b7 4b 30          	movzx  ecx,WORD PTR [rbx+0x30]
   1403869d2:	8d 41 ff             	lea    eax,[rcx-0x1]
   1403869d5:	66 83 f8 7e          	cmp    ax,0x7e
   1403869d9:	77 28                	ja     0x140386a03
   1403869db:	0f b7 c9             	movzx  ecx,cx
   1403869de:	f3 0f 10 43 34       	movss  xmm0,DWORD PTR [rbx+0x34]
   1403869e3:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   1403869e9:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   1403869ef:	0f b6 43 32          	movzx  eax,BYTE PTR [rbx+0x32]
   1403869f3:	66 0f 6e c0          	movd   xmm0,eax
   1403869f7:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403869fa:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   140386a01:	00 00 
   140386a03:	0f b7 4b 38          	movzx  ecx,WORD PTR [rbx+0x38]
   140386a07:	8d 41 ff             	lea    eax,[rcx-0x1]
   140386a0a:	66 83 f8 7e          	cmp    ax,0x7e
   140386a0e:	77 28                	ja     0x140386a38
   140386a10:	0f b7 c9             	movzx  ecx,cx
   140386a13:	f3 0f 10 43 3c       	movss  xmm0,DWORD PTR [rbx+0x3c]
   140386a18:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   140386a1e:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   140386a24:	0f b6 43 3a          	movzx  eax,BYTE PTR [rbx+0x3a]
   140386a28:	66 0f 6e c0          	movd   xmm0,eax
   140386a2c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140386a2f:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   140386a36:	00 00 
   140386a38:	0f b7 4b 40          	movzx  ecx,WORD PTR [rbx+0x40]
   140386a3c:	8d 41 ff             	lea    eax,[rcx-0x1]
   140386a3f:	66 83 f8 7e          	cmp    ax,0x7e
   140386a43:	77 28                	ja     0x140386a6d
   140386a45:	0f b7 c9             	movzx  ecx,cx
   140386a48:	f3 0f 10 43 44       	movss  xmm0,DWORD PTR [rbx+0x44]
   140386a4d:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   140386a53:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   140386a59:	0f b6 43 42          	movzx  eax,BYTE PTR [rbx+0x42]
   140386a5d:	66 0f 6e c0          	movd   xmm0,eax
   140386a61:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140386a64:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   140386a6b:	00 00 
   140386a6d:	0f b7 4b 48          	movzx  ecx,WORD PTR [rbx+0x48]
   140386a71:	8d 41 ff             	lea    eax,[rcx-0x1]
   140386a74:	66 83 f8 7e          	cmp    ax,0x7e
   140386a78:	77 28                	ja     0x140386aa2
   140386a7a:	0f b7 c9             	movzx  ecx,cx
   140386a7d:	f3 0f 10 43 4c       	movss  xmm0,DWORD PTR [rbx+0x4c]
   140386a82:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   140386a88:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   140386a8e:	0f b6 43 4a          	movzx  eax,BYTE PTR [rbx+0x4a]
   140386a92:	66 0f 6e c0          	movd   xmm0,eax
   140386a96:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140386a99:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   140386aa0:	00 00 
   140386aa2:	0f b7 4b 50          	movzx  ecx,WORD PTR [rbx+0x50]
   140386aa6:	8d 41 ff             	lea    eax,[rcx-0x1]
   140386aa9:	66 83 f8 7e          	cmp    ax,0x7e
   140386aad:	77 28                	ja     0x140386ad7
   140386aaf:	0f b7 c9             	movzx  ecx,cx
   140386ab2:	f3 0f 10 43 54       	movss  xmm0,DWORD PTR [rbx+0x54]
   140386ab7:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   140386abd:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   140386ac3:	0f b6 43 52          	movzx  eax,BYTE PTR [rbx+0x52]
   140386ac7:	66 0f 6e c0          	movd   xmm0,eax
   140386acb:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140386ace:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   140386ad5:	00 00 
   140386ad7:	0f b7 4b 58          	movzx  ecx,WORD PTR [rbx+0x58]
   140386adb:	8d 41 ff             	lea    eax,[rcx-0x1]
   140386ade:	66 83 f8 7e          	cmp    ax,0x7e
   140386ae2:	77 28                	ja     0x140386b0c
   140386ae4:	0f b7 c9             	movzx  ecx,cx
   140386ae7:	f3 0f 10 43 5c       	movss  xmm0,DWORD PTR [rbx+0x5c]
   140386aec:	f3 0f 58 44 8d c0    	addss  xmm0,DWORD PTR [rbp+rcx*4-0x40]
   140386af2:	f3 0f 11 44 8d c0    	movss  DWORD PTR [rbp+rcx*4-0x40],xmm0
   140386af8:	0f b6 43 5a          	movzx  eax,BYTE PTR [rbx+0x5a]
   140386afc:	66 0f 6e c0          	movd   xmm0,eax
   140386b00:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140386b03:	f3 0f 11 84 8d c0 07 	movss  DWORD PTR [rbp+rcx*4+0x7c0],xmm0
   140386b0a:	00 00 
   140386b0c:	8b 44 24 38          	mov    eax,DWORD PTR [rsp+0x38]
   140386b10:	8d 0c c5 00 00 00 00 	lea    ecx,[rax*8+0x0]
   140386b17:	48 8b 44 24 58       	mov    rax,QWORD PTR [rsp+0x58]
   140386b1c:	48 8d 0c c8          	lea    rcx,[rax+rcx*8]
   140386b20:	4c 8d 85 c0 07 00 00 	lea    r8,[rbp+0x7c0]
   140386b27:	48 8d 55 c0          	lea    rdx,[rbp-0x40]
   140386b2b:	e8 c0 b3 ff ff       	call   0x140381ef0
   140386b30:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   140386b35:	41 8b 0f             	mov    ecx,DWORD PTR [r15]
   140386b38:	f3 0f 10 35 14 06 31 	movss  xmm6,DWORD PTR [rip+0x310614]        # 0x140697154
   140386b3f:	00 
   140386b40:	eb 0d                	jmp    0x140386b4f
   140386b42:	f3 0f 10 35 0a 06 31 	movss  xmm6,DWORD PTR [rip+0x31060a]        # 0x140697154
   140386b49:	00 
   140386b4a:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   140386b4f:	8b f9                	mov    edi,ecx
   140386b51:	8b 4c 24 38          	mov    ecx,DWORD PTR [rsp+0x38]
   140386b55:	ff c1                	inc    ecx
   140386b57:	89 4c 24 38          	mov    DWORD PTR [rsp+0x38],ecx
   140386b5b:	8b d7                	mov    edx,edi
   140386b5d:	48 69 c7 78 ab 06 00 	imul   rax,rdi,0x6ab78
   140386b64:	42 3b 8c 30 d8 a5 98 	cmp    ecx,DWORD PTR [rax+r14*1+0x98a5d8]
   140386b6b:	00 
   140386b6c:	0f 82 7e f3 ff ff    	jb     0x140385ef0
   140386b72:	8b 5c 24 40          	mov    ebx,DWORD PTR [rsp+0x40]
   140386b76:	4c 8b 44 24 58       	mov    r8,QWORD PTR [rsp+0x58]
   140386b7b:	45 33 ed             	xor    r13d,r13d
   140386b7e:	41 bc ff ff 00 00    	mov    r12d,0xffff
   140386b84:	41 8b f5             	mov    esi,r13d
   140386b87:	8b c2                	mov    eax,edx
   140386b89:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140386b90:	42 83 bc 31 d8 a5 98 	cmp    DWORD PTR [rcx+r14*1+0x98a5d8],0x0
   140386b97:	00 00 
   140386b99:	0f 86 91 00 00 00    	jbe    0x140386c30
   140386b9f:	90                   	nop
   140386ba0:	8b ce                	mov    ecx,esi
   140386ba2:	8b c2                	mov    eax,edx
   140386ba4:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140386bab:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   140386baf:	48 c1 e1 04          	shl    rcx,0x4
   140386bb3:	4a 8b 84 30 d0 a5 98 	mov    rax,QWORD PTR [rax+r14*1+0x98a5d0]
   140386bba:	00 
   140386bbb:	48 8b 7c 08 30       	mov    rdi,QWORD PTR [rax+rcx*1+0x30]
   140386bc0:	8b c2                	mov    eax,edx
   140386bc2:	48 85 ff             	test   rdi,rdi
   140386bc5:	74 50                	je     0x140386c17
   140386bc7:	8b c2                	mov    eax,edx
   140386bc9:	66 83 bf 1c 02 00 00 	cmp    WORD PTR [rdi+0x21c],0x0
   140386bd0:	00 
   140386bd1:	7c 44                	jl     0x140386c17
   140386bd3:	0f b7 4f 20          	movzx  ecx,WORD PTR [rdi+0x20]
   140386bd7:	8b c2                	mov    eax,edx
   140386bd9:	66 41 3b cc          	cmp    cx,r12w
   140386bdd:	74 38                	je     0x140386c17
   140386bdf:	8b c2                	mov    eax,edx
   140386be1:	66 85 c9             	test   cx,cx
   140386be4:	74 31                	je     0x140386c17
   140386be6:	8d 04 f5 00 00 00 00 	lea    eax,[rsi*8+0x0]
   140386bed:	41 0f 10 04 c0       	movups xmm0,XMMWORD PTR [r8+rax*8]
   140386bf2:	0f 11 47 20          	movups XMMWORD PTR [rdi+0x20],xmm0
   140386bf6:	41 0f 10 4c c0 10    	movups xmm1,XMMWORD PTR [r8+rax*8+0x10]
   140386bfc:	0f 11 4f 30          	movups XMMWORD PTR [rdi+0x30],xmm1
   140386c00:	41 0f 10 44 c0 20    	movups xmm0,XMMWORD PTR [r8+rax*8+0x20]
   140386c06:	0f 11 47 40          	movups XMMWORD PTR [rdi+0x40],xmm0
   140386c0a:	41 0f 10 4c c0 30    	movups xmm1,XMMWORD PTR [r8+rax*8+0x30]
   140386c10:	0f 11 4f 50          	movups XMMWORD PTR [rdi+0x50],xmm1
   140386c14:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140386c17:	ff c6                	inc    esi
   140386c19:	8b d0                	mov    edx,eax
   140386c1b:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140386c22:	42 3b b4 31 d8 a5 98 	cmp    esi,DWORD PTR [rcx+r14*1+0x98a5d8]
   140386c29:	00 
   140386c2a:	0f 82 70 ff ff ff    	jb     0x140386ba0
   140386c30:	0f b6 05 e9 f6 b7 14 	movzx  eax,BYTE PTR [rip+0x14b7f6e9]        # 0x154f06320
   140386c37:	04 05                	add    al,0x5
   140386c39:	88 05 e1 f6 b7 14    	mov    BYTE PTR [rip+0x14b7f6e1],al        # 0x154f06320
   140386c3f:	0f b6 c8             	movzx  ecx,al
   140386c42:	45 33 c0             	xor    r8d,r8d
   140386c45:	33 d2                	xor    edx,edx
   140386c47:	e8 54 8c 00 00       	call   0x14038f8a0
   140386c4c:	ff c3                	inc    ebx
   140386c4e:	89 5c 24 40          	mov    DWORD PTR [rsp+0x40],ebx
   140386c52:	83 fb 02             	cmp    ebx,0x2
   140386c55:	4c 8b 44 24 58       	mov    r8,QWORD PTR [rsp+0x58]
   140386c5a:	0f 82 65 f2 ff ff    	jb     0x140385ec5
   140386c60:	41 8b 87 50 03 00 00 	mov    eax,DWORD PTR [r15+0x350]
   140386c67:	83 e0 1e             	and    eax,0x1e
   140386c6a:	3c 1e                	cmp    al,0x1e
   140386c6c:	0f 85 36 02 00 00    	jne    0x140386ea8
   140386c72:	33 d2                	xor    edx,edx
   140386c74:	41 b8 00 04 00 00    	mov    r8d,0x400
   140386c7a:	48 8d 8d c0 03 00 00 	lea    rcx,[rbp+0x3c0]
   140386c81:	e8 64 a0 29 00       	call   0x140620cea
   140386c86:	41 8b 37             	mov    esi,DWORD PTR [r15]
   140386c89:	4c 69 de 78 ab 06 00 	imul   r11,rsi,0x6ab78
   140386c90:	47 8b 8c 33 d8 a5 98 	mov    r9d,DWORD PTR [r11+r14*1+0x98a5d8]
   140386c97:	00 
   140386c98:	45 8b d5             	mov    r10d,r13d
   140386c9b:	41 83 f9 04          	cmp    r9d,0x4
   140386c9f:	0f 82 38 01 00 00    	jb     0x140386ddd
   140386ca5:	4b 8b 8c 33 d0 a5 98 	mov    rcx,QWORD PTR [r11+r14*1+0x98a5d0]
   140386cac:	00 
   140386cad:	48 81 c1 c0 00 00 00 	add    rcx,0xc0
   140386cb4:	41 8d 41 fc          	lea    eax,[r9-0x4]
   140386cb8:	c1 e8 02             	shr    eax,0x2
   140386cbb:	ff c0                	inc    eax
   140386cbd:	44 8b c0             	mov    r8d,eax
   140386cc0:	44 8d 14 85 00 00 00 	lea    r10d,[rax*4+0x0]
   140386cc7:	00 
   140386cc8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140386ccf:	00 
   140386cd0:	48 8b 91 70 ff ff ff 	mov    rdx,QWORD PTR [rcx-0x90]
   140386cd7:	48 85 d2             	test   rdx,rdx
   140386cda:	74 34                	je     0x140386d10
   140386cdc:	66 83 ba 1c 02 00 00 	cmp    WORD PTR [rdx+0x21c],0x0
   140386ce3:	00 
   140386ce4:	7c 2a                	jl     0x140386d10
   140386ce6:	0f b7 7a 20          	movzx  edi,WORD PTR [rdx+0x20]
   140386cea:	8d 47 ff             	lea    eax,[rdi-0x1]
   140386ced:	66 83 f8 7d          	cmp    ax,0x7d
   140386cf1:	77 1d                	ja     0x140386d10
   140386cf3:	0f b7 c7             	movzx  eax,di
   140386cf6:	f3 0f 10 42 24       	movss  xmm0,DWORD PTR [rdx+0x24]
   140386cfb:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140386cfe:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140386d05:	00 00 
   140386d07:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140386d0e:	00 00 
   140386d10:	48 8b 11             	mov    rdx,QWORD PTR [rcx]
   140386d13:	48 85 d2             	test   rdx,rdx
   140386d16:	74 34                	je     0x140386d4c
   140386d18:	66 83 ba 1c 02 00 00 	cmp    WORD PTR [rdx+0x21c],0x0
   140386d1f:	00 
   140386d20:	7c 2a                	jl     0x140386d4c
   140386d22:	0f b7 7a 20          	movzx  edi,WORD PTR [rdx+0x20]
   140386d26:	8d 47 ff             	lea    eax,[rdi-0x1]
   140386d29:	66 83 f8 7d          	cmp    ax,0x7d
   140386d2d:	77 1d                	ja     0x140386d4c
   140386d2f:	0f b7 c7             	movzx  eax,di
   140386d32:	f3 0f 10 42 24       	movss  xmm0,DWORD PTR [rdx+0x24]
   140386d37:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140386d3a:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140386d41:	00 00 
   140386d43:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140386d4a:	00 00 
   140386d4c:	48 8b 91 90 00 00 00 	mov    rdx,QWORD PTR [rcx+0x90]
   140386d53:	48 85 d2             	test   rdx,rdx
   140386d56:	74 34                	je     0x140386d8c
   140386d58:	66 83 ba 1c 02 00 00 	cmp    WORD PTR [rdx+0x21c],0x0
   140386d5f:	00 
   140386d60:	7c 2a                	jl     0x140386d8c
   140386d62:	0f b7 7a 20          	movzx  edi,WORD PTR [rdx+0x20]
   140386d66:	8d 47 ff             	lea    eax,[rdi-0x1]
   140386d69:	66 83 f8 7d          	cmp    ax,0x7d
   140386d6d:	77 1d                	ja     0x140386d8c
   140386d6f:	0f b7 c7             	movzx  eax,di
   140386d72:	f3 0f 10 42 24       	movss  xmm0,DWORD PTR [rdx+0x24]
   140386d77:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140386d7a:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140386d81:	00 00 
   140386d83:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140386d8a:	00 00 
   140386d8c:	48 8b 91 20 01 00 00 	mov    rdx,QWORD PTR [rcx+0x120]
   140386d93:	48 85 d2             	test   rdx,rdx
   140386d96:	74 34                	je     0x140386dcc
   140386d98:	66 83 ba 1c 02 00 00 	cmp    WORD PTR [rdx+0x21c],0x0
   140386d9f:	00 
   140386da0:	7c 2a                	jl     0x140386dcc
   140386da2:	0f b7 7a 20          	movzx  edi,WORD PTR [rdx+0x20]
   140386da6:	8d 47 ff             	lea    eax,[rdi-0x1]
   140386da9:	66 83 f8 7d          	cmp    ax,0x7d
   140386dad:	77 1d                	ja     0x140386dcc
   140386daf:	0f b7 c7             	movzx  eax,di
   140386db2:	f3 0f 10 42 24       	movss  xmm0,DWORD PTR [rdx+0x24]
   140386db7:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140386dba:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140386dc1:	00 00 
   140386dc3:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140386dca:	00 00 
   140386dcc:	48 81 c1 40 02 00 00 	add    rcx,0x240
   140386dd3:	49 83 e8 01          	sub    r8,0x1
   140386dd7:	0f 85 f3 fe ff ff    	jne    0x140386cd0
   140386ddd:	45 3b d1             	cmp    r10d,r9d
   140386de0:	73 66                	jae    0x140386e48
   140386de2:	41 8b c2             	mov    eax,r10d
   140386de5:	48 8d 14 c0          	lea    rdx,[rax+rax*8]
   140386de9:	48 c1 e2 04          	shl    rdx,0x4
   140386ded:	48 83 c2 30          	add    rdx,0x30
   140386df1:	4b 03 94 33 d0 a5 98 	add    rdx,QWORD PTR [r11+r14*1+0x98a5d0]
   140386df8:	00 
   140386df9:	45 8b c1             	mov    r8d,r9d
   140386dfc:	45 2b c2             	sub    r8d,r10d
   140386dff:	48 8b 0a             	mov    rcx,QWORD PTR [rdx]
   140386e02:	48 85 c9             	test   rcx,rcx
   140386e05:	74 34                	je     0x140386e3b
   140386e07:	66 83 b9 1c 02 00 00 	cmp    WORD PTR [rcx+0x21c],0x0
   140386e0e:	00 
   140386e0f:	7c 2a                	jl     0x140386e3b
   140386e11:	0f b7 79 20          	movzx  edi,WORD PTR [rcx+0x20]
   140386e15:	8d 47 ff             	lea    eax,[rdi-0x1]
   140386e18:	66 83 f8 7d          	cmp    ax,0x7d
   140386e1c:	77 1d                	ja     0x140386e3b
   140386e1e:	0f b7 c7             	movzx  eax,di
   140386e21:	f3 0f 10 41 24       	movss  xmm0,DWORD PTR [rcx+0x24]
   140386e26:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140386e29:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140386e30:	00 00 
   140386e32:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140386e39:	00 00 
   140386e3b:	48 81 c2 90 00 00 00 	add    rdx,0x90
   140386e42:	49 83 e8 01          	sub    r8,0x1
   140386e46:	75 b7                	jne    0x140386dff
   140386e48:	41 8b d5             	mov    edx,r13d
   140386e4b:	45 85 c9             	test   r9d,r9d
   140386e4e:	0f 84 b6 06 00 00    	je     0x14038750a
   140386e54:	41 b8 2d 00 00 00    	mov    r8d,0x2d
   140386e5a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140386e60:	8b ca                	mov    ecx,edx
   140386e62:	8b c6                	mov    eax,esi
   140386e64:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140386e6b:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   140386e6f:	48 03 c9             	add    rcx,rcx
   140386e72:	4a 8b 84 30 d0 a5 98 	mov    rax,QWORD PTR [rax+r14*1+0x98a5d0]
   140386e79:	00 
   140386e7a:	48 8b 4c c8 30       	mov    rcx,QWORD PTR [rax+rcx*8+0x30]
   140386e7f:	8b c6                	mov    eax,esi
   140386e81:	48 85 c9             	test   rcx,rcx
   140386e84:	74 08                	je     0x140386e8e
   140386e86:	66 44 89 41 20       	mov    WORD PTR [rcx+0x20],r8w
   140386e8b:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140386e8e:	ff c2                	inc    edx
   140386e90:	8b f0                	mov    esi,eax
   140386e92:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140386e99:	42 3b 94 31 d8 a5 98 	cmp    edx,DWORD PTR [rcx+r14*1+0x98a5d8]
   140386ea0:	00 
   140386ea1:	72 bd                	jb     0x140386e60
   140386ea3:	e9 62 06 00 00       	jmp    0x14038750a
   140386ea8:	45 8b dd             	mov    r11d,r13d
   140386eab:	41 8b 17             	mov    edx,DWORD PTR [r15]
   140386eae:	48 69 f2 78 ab 06 00 	imul   rsi,rdx,0x6ab78
   140386eb5:	42 83 bc 36 d8 a5 98 	cmp    DWORD PTR [rsi+r14*1+0x98a5d8],0x0
   140386ebc:	00 00 
   140386ebe:	0f 86 14 05 00 00    	jbe    0x1403873d8
   140386ec4:	f2 44 0f 10 1d f3 92 	movsd  xmm11,QWORD PTR [rip+0x4c92f3]        # 0x1408501c0
   140386ecb:	4c 00 
   140386ecd:	f3 44 0f 10 2d 5a 91 	movss  xmm13,DWORD PTR [rip+0x4c915a]        # 0x140850030
   140386ed4:	4c 00 
   140386ed6:	8b c2                	mov    eax,edx
   140386ed8:	4c 69 c0 78 ab 06 00 	imul   r8,rax,0x6ab78
   140386edf:	4f 8b 8c 30 d0 a5 98 	mov    r9,QWORD PTR [r8+r14*1+0x98a5d0]
   140386ee6:	00 
   140386ee7:	41 8b c3             	mov    eax,r11d
   140386eea:	48 8d 14 c0          	lea    rdx,[rax+rax*8]
   140386eee:	48 c1 e2 04          	shl    rdx,0x4
   140386ef2:	4a 8b 7c 0a 30       	mov    rdi,QWORD PTR [rdx+r9*1+0x30]
   140386ef7:	48 85 ff             	test   rdi,rdi
   140386efa:	0f 84 b3 04 00 00    	je     0x1403873b3
   140386f00:	66 83 bf 1c 02 00 00 	cmp    WORD PTR [rdi+0x21c],0x0
   140386f07:	00 
   140386f08:	0f 8c a5 04 00 00    	jl     0x1403873b3
   140386f0e:	0f b7 47 20          	movzx  eax,WORD PTR [rdi+0x20]
   140386f12:	66 ff c8             	dec    ax
   140386f15:	b9 fd ff 00 00       	mov    ecx,0xfffd
   140386f1a:	66 3b c1             	cmp    ax,cx
   140386f1d:	0f 87 90 04 00 00    	ja     0x1403873b3
   140386f23:	f3 0f 10 47 24       	movss  xmm0,DWORD PTR [rdi+0x24]
   140386f28:	f3 0f 5c 47 2c       	subss  xmm0,DWORD PTR [rdi+0x2c]
   140386f2d:	41 0f 2f c7          	comiss xmm0,xmm15
   140386f31:	0f 87 7c 04 00 00    	ja     0x1403873b3
   140386f37:	33 c0                	xor    eax,eax
   140386f39:	48 89 45 a0          	mov    QWORD PTR [rbp-0x60],rax
   140386f3d:	48 89 45 a8          	mov    QWORD PTR [rbp-0x58],rax
   140386f41:	48 89 45 b0          	mov    QWORD PTR [rbp-0x50],rax
   140386f45:	48 89 45 b8          	mov    QWORD PTR [rbp-0x48],rax
   140386f49:	48 89 45 80          	mov    QWORD PTR [rbp-0x80],rax
   140386f4d:	48 89 45 88          	mov    QWORD PTR [rbp-0x78],rax
   140386f51:	48 89 45 90          	mov    QWORD PTR [rbp-0x70],rax
   140386f55:	48 89 45 98          	mov    QWORD PTR [rbp-0x68],rax
   140386f59:	f3 42 0f 10 44 0a 24 	movss  xmm0,DWORD PTR [rdx+r9*1+0x24]
   140386f60:	f3 0f 58 c7          	addss  xmm0,xmm7
   140386f64:	f3 0f 2c c0          	cvttss2si eax,xmm0
   140386f68:	0f b6 c8             	movzx  ecx,al
   140386f6b:	8d 41 f8             	lea    eax,[rcx-0x8]
   140386f6e:	89 44 24 60          	mov    DWORD PTR [rsp+0x60],eax
   140386f72:	8d 41 08             	lea    eax,[rcx+0x8]
   140386f75:	89 44 24 50          	mov    DWORD PTR [rsp+0x50],eax
   140386f79:	f3 42 0f 10 44 0a 14 	movss  xmm0,DWORD PTR [rdx+r9*1+0x14]
   140386f80:	f3 46 0f 10 54 0a 10 	movss  xmm10,DWORD PTR [rdx+r9*1+0x10]
   140386f87:	0f 28 c8             	movaps xmm1,xmm0
   140386f8a:	f3 41 0f 5c ca       	subss  xmm1,xmm10
   140386f8f:	f3 41 0f 5f cd       	maxss  xmm1,xmm13
   140386f94:	f3 44 0f 5c d1       	subss  xmm10,xmm1
   140386f99:	f3 0f 58 c8          	addss  xmm1,xmm0
   140386f9d:	45 8b d5             	mov    r10d,r13d
   140386fa0:	43 8b 84 30 d8 a5 98 	mov    eax,DWORD PTR [r8+r14*1+0x98a5d8]
   140386fa7:	00 
   140386fa8:	89 44 24 4c          	mov    DWORD PTR [rsp+0x4c],eax
   140386fac:	8b 5d a0             	mov    ebx,DWORD PTR [rbp-0x60]
   140386faf:	f3 44 0f 10 45 9c    	movss  xmm8,DWORD PTR [rbp-0x64]
   140386fb5:	f3 44 0f 10 4d 98    	movss  xmm9,DWORD PTR [rbp-0x68]
   140386fbb:	f3 0f 10 7d 94       	movss  xmm7,DWORD PTR [rbp-0x6c]
   140386fc0:	f3 0f 10 75 90       	movss  xmm6,DWORD PTR [rbp-0x70]
   140386fc5:	f3 0f 10 6d 8c       	movss  xmm5,DWORD PTR [rbp-0x74]
   140386fca:	f3 0f 10 65 88       	movss  xmm4,DWORD PTR [rbp-0x78]
   140386fcf:	f3 0f 10 55 84       	movss  xmm2,DWORD PTR [rbp-0x7c]
   140386fd4:	f3 0f 10 5d 80       	movss  xmm3,DWORD PTR [rbp-0x80]
   140386fd9:	85 c0                	test   eax,eax
   140386fdb:	0f 84 83 02 00 00    	je     0x140387264
   140386fe1:	44 8b 75 bc          	mov    r14d,DWORD PTR [rbp-0x44]
   140386fe5:	44 8b 7d b8          	mov    r15d,DWORD PTR [rbp-0x48]
   140386fe9:	44 8b 65 b4          	mov    r12d,DWORD PTR [rbp-0x4c]
   140386fed:	44 8b 6d b0          	mov    r13d,DWORD PTR [rbp-0x50]
   140386ff1:	8b 45 ac             	mov    eax,DWORD PTR [rbp-0x54]
   140386ff4:	89 44 24 38          	mov    DWORD PTR [rsp+0x38],eax
   140386ff8:	8b 4d a8             	mov    ecx,DWORD PTR [rbp-0x58]
   140386ffb:	89 4c 24 40          	mov    DWORD PTR [rsp+0x40],ecx
   140386fff:	8b 45 a4             	mov    eax,DWORD PTR [rbp-0x5c]
   140387002:	89 44 24 3c          	mov    DWORD PTR [rsp+0x3c],eax
   140387006:	f3 44 0f 10 35 cd 8f 	movss  xmm14,DWORD PTR [rip+0x4c8fcd]        # 0x14084ffdc
   14038700d:	4c 00 
   14038700f:	90                   	nop
   140387010:	41 8b c2             	mov    eax,r10d
   140387013:	48 8d 0c c0          	lea    rcx,[rax+rax*8]
   140387017:	48 03 c9             	add    rcx,rcx
   14038701a:	45 0f 2f 54 c9 14    	comiss xmm10,DWORD PTR [r9+rcx*8+0x14]
   140387020:	0f 87 21 02 00 00    	ja     0x140387247
   140387026:	f3 41 0f 10 44 c9 10 	movss  xmm0,DWORD PTR [r9+rcx*8+0x10]
   14038702d:	0f 2f c1             	comiss xmm0,xmm1
   140387030:	0f 87 1f 02 00 00    	ja     0x140387255
   140387036:	49 8b 44 c9 30       	mov    rax,QWORD PTR [r9+rcx*8+0x30]
   14038703b:	48 85 c0             	test   rax,rax
   14038703e:	0f 84 03 02 00 00    	je     0x140387247
   140387044:	66 83 b8 1c 02 00 00 	cmp    WORD PTR [rax+0x21c],0x0
   14038704b:	00 
   14038704c:	0f 8c f5 01 00 00    	jl     0x140387247
   140387052:	0f b7 50 20          	movzx  edx,WORD PTR [rax+0x20]
   140387056:	8d 42 ff             	lea    eax,[rdx-0x1]
   140387059:	41 b8 fd ff 00 00    	mov    r8d,0xfffd
   14038705f:	66 41 3b c0          	cmp    ax,r8w
   140387063:	0f 87 de 01 00 00    	ja     0x140387247
   140387069:	f3 41 0f 10 44 c9 24 	movss  xmm0,DWORD PTR [r9+rcx*8+0x24]
   140387070:	f3 41 0f 58 c6       	addss  xmm0,xmm14
   140387075:	f3 0f 2c c0          	cvttss2si eax,xmm0
   140387079:	44 0f b6 c0          	movzx  r8d,al
   14038707d:	44 3b 44 24 60       	cmp    r8d,DWORD PTR [rsp+0x60]
   140387082:	0f 8c bf 01 00 00    	jl     0x140387247
   140387088:	44 3b 44 24 50       	cmp    r8d,DWORD PTR [rsp+0x50]
   14038708d:	0f 87 b4 01 00 00    	ja     0x140387247
   140387093:	66 3b 57 20          	cmp    dx,WORD PTR [rdi+0x20]
   140387097:	75 21                	jne    0x1403870ba
   140387099:	ff c3                	inc    ebx
   14038709b:	48 8d 05 5e 8f c7 ff 	lea    rax,[rip+0xffffffffffc78f5e]        # 0x140000000
   1403870a2:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   1403870a9:	00 
   1403870aa:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   1403870b0:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   1403870b6:	f3 0f 58 d8          	addss  xmm3,xmm0
   1403870ba:	44 0f b7 47 28       	movzx  r8d,WORD PTR [rdi+0x28]
   1403870bf:	41 8d 40 ff          	lea    eax,[r8-0x1]
   1403870c3:	66 3b 44 24 48       	cmp    ax,WORD PTR [rsp+0x48]
   1403870c8:	77 29                	ja     0x1403870f3
   1403870ca:	66 41 3b d0          	cmp    dx,r8w
   1403870ce:	75 23                	jne    0x1403870f3
   1403870d0:	ff 44 24 3c          	inc    DWORD PTR [rsp+0x3c]
   1403870d4:	48 8d 05 25 8f c7 ff 	lea    rax,[rip+0xffffffffffc78f25]        # 0x140000000
   1403870db:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   1403870e2:	00 
   1403870e3:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   1403870e9:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   1403870ef:	f3 0f 58 d0          	addss  xmm2,xmm0
   1403870f3:	44 0f b7 47 30       	movzx  r8d,WORD PTR [rdi+0x30]
   1403870f8:	41 8d 40 ff          	lea    eax,[r8-0x1]
   1403870fc:	66 3b 44 24 48       	cmp    ax,WORD PTR [rsp+0x48]
   140387101:	77 29                	ja     0x14038712c
   140387103:	66 41 3b d0          	cmp    dx,r8w
   140387107:	75 23                	jne    0x14038712c
   140387109:	ff 44 24 40          	inc    DWORD PTR [rsp+0x40]
   14038710d:	48 8d 05 ec 8e c7 ff 	lea    rax,[rip+0xffffffffffc78eec]        # 0x140000000
   140387114:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   14038711b:	00 
   14038711c:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   140387122:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   140387128:	f3 0f 58 e0          	addss  xmm4,xmm0
   14038712c:	44 0f b7 47 38       	movzx  r8d,WORD PTR [rdi+0x38]
   140387131:	41 8d 40 ff          	lea    eax,[r8-0x1]
   140387135:	66 3b 44 24 48       	cmp    ax,WORD PTR [rsp+0x48]
   14038713a:	77 29                	ja     0x140387165
   14038713c:	66 41 3b d0          	cmp    dx,r8w
   140387140:	75 23                	jne    0x140387165
   140387142:	ff 44 24 38          	inc    DWORD PTR [rsp+0x38]
   140387146:	48 8d 05 b3 8e c7 ff 	lea    rax,[rip+0xffffffffffc78eb3]        # 0x140000000
   14038714d:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   140387154:	00 
   140387155:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   14038715b:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   140387161:	f3 0f 58 e8          	addss  xmm5,xmm0
   140387165:	44 0f b7 47 40       	movzx  r8d,WORD PTR [rdi+0x40]
   14038716a:	41 8d 40 ff          	lea    eax,[r8-0x1]
   14038716e:	66 3b 44 24 48       	cmp    ax,WORD PTR [rsp+0x48]
   140387173:	77 28                	ja     0x14038719d
   140387175:	66 41 3b d0          	cmp    dx,r8w
   140387179:	75 22                	jne    0x14038719d
   14038717b:	41 ff c5             	inc    r13d
   14038717e:	48 8d 05 7b 8e c7 ff 	lea    rax,[rip+0xffffffffffc78e7b]        # 0x140000000
   140387185:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   14038718c:	00 
   14038718d:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   140387193:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   140387199:	f3 0f 58 f0          	addss  xmm6,xmm0
   14038719d:	44 0f b7 47 48       	movzx  r8d,WORD PTR [rdi+0x48]
   1403871a2:	41 8d 40 ff          	lea    eax,[r8-0x1]
   1403871a6:	66 3b 44 24 48       	cmp    ax,WORD PTR [rsp+0x48]
   1403871ab:	77 28                	ja     0x1403871d5
   1403871ad:	66 41 3b d0          	cmp    dx,r8w
   1403871b1:	75 22                	jne    0x1403871d5
   1403871b3:	41 ff c4             	inc    r12d
   1403871b6:	48 8d 05 43 8e c7 ff 	lea    rax,[rip+0xffffffffffc78e43]        # 0x140000000
   1403871bd:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   1403871c4:	00 
   1403871c5:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   1403871cb:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   1403871d1:	f3 0f 58 f8          	addss  xmm7,xmm0
   1403871d5:	44 0f b7 47 50       	movzx  r8d,WORD PTR [rdi+0x50]
   1403871da:	41 8d 40 ff          	lea    eax,[r8-0x1]
   1403871de:	66 3b 44 24 48       	cmp    ax,WORD PTR [rsp+0x48]
   1403871e3:	77 29                	ja     0x14038720e
   1403871e5:	66 41 3b d0          	cmp    dx,r8w
   1403871e9:	75 23                	jne    0x14038720e
   1403871eb:	41 ff c7             	inc    r15d
   1403871ee:	48 8d 05 0b 8e c7 ff 	lea    rax,[rip+0xffffffffffc78e0b]        # 0x140000000
   1403871f5:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   1403871fc:	00 
   1403871fd:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   140387203:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   140387209:	f3 44 0f 58 c8       	addss  xmm9,xmm0
   14038720e:	44 0f b7 47 58       	movzx  r8d,WORD PTR [rdi+0x58]
   140387213:	41 8d 40 ff          	lea    eax,[r8-0x1]
   140387217:	66 3b 44 24 48       	cmp    ax,WORD PTR [rsp+0x48]
   14038721c:	77 29                	ja     0x140387247
   14038721e:	66 41 3b d0          	cmp    dx,r8w
   140387222:	75 23                	jne    0x140387247
   140387224:	41 ff c6             	inc    r14d
   140387227:	48 8d 05 d2 8d c7 ff 	lea    rax,[rip+0xffffffffffc78dd2]        # 0x140000000
   14038722e:	48 8b 84 06 d0 a5 98 	mov    rax,QWORD PTR [rsi+rax*1+0x98a5d0]
   140387235:	00 
   140387236:	f3 0f 10 44 c8 14    	movss  xmm0,DWORD PTR [rax+rcx*8+0x14]
   14038723c:	f3 0f 5c 44 c8 10    	subss  xmm0,DWORD PTR [rax+rcx*8+0x10]
   140387242:	f3 44 0f 58 c0       	addss  xmm8,xmm0
   140387247:	41 ff c2             	inc    r10d
   14038724a:	44 3b 54 24 4c       	cmp    r10d,DWORD PTR [rsp+0x4c]
   14038724f:	0f 82 bb fd ff ff    	jb     0x140387010
   140387255:	4c 8b 7c 24 30       	mov    r15,QWORD PTR [rsp+0x30]
   14038725a:	4c 8d 35 9f 8d c7 ff 	lea    r14,[rip+0xffffffffffc78d9f]        # 0x140000000
   140387261:	45 33 ed             	xor    r13d,r13d
   140387264:	83 fb 02             	cmp    ebx,0x2
   140387267:	0f 87 46 01 00 00    	ja     0x1403873b3
   14038726d:	0f 57 c9             	xorps  xmm1,xmm1
   140387270:	f3 0f 5a cb          	cvtss2sd xmm1,xmm3
   140387274:	f2 41 0f 59 cb       	mulsd  xmm1,xmm11
   140387279:	0f 57 c0             	xorps  xmm0,xmm0
   14038727c:	f3 0f 5a c2          	cvtss2sd xmm0,xmm2
   140387280:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140387285:	66 0f 2f c1          	comisd xmm0,xmm1
   140387289:	72 1e                	jb     0x1403872a9
   14038728b:	42 8d 0c dd 00 00 00 	lea    ecx,[r11*8+0x0]
   140387292:	00 
   140387293:	8b f9                	mov    edi,ecx
   140387295:	48 8b 04 ce          	mov    rax,QWORD PTR [rsi+rcx*8]
   140387299:	ff c1                	inc    ecx
   14038729b:	8b d1                	mov    edx,ecx
   14038729d:	48 8b 0c ce          	mov    rcx,QWORD PTR [rsi+rcx*8]
   1403872a1:	48 89 0c fe          	mov    QWORD PTR [rsi+rdi*8],rcx
   1403872a5:	48 89 04 d6          	mov    QWORD PTR [rsi+rdx*8],rax
   1403872a9:	0f 57 c0             	xorps  xmm0,xmm0
   1403872ac:	f3 0f 5a c4          	cvtss2sd xmm0,xmm4
   1403872b0:	66 0f 2f c1          	comisd xmm0,xmm1
   1403872b4:	72 1f                	jb     0x1403872d5
   1403872b6:	42 8d 0c dd 00 00 00 	lea    ecx,[r11*8+0x0]
   1403872bd:	00 
   1403872be:	8b f9                	mov    edi,ecx
   1403872c0:	48 8b 04 ce          	mov    rax,QWORD PTR [rsi+rcx*8]
   1403872c4:	83 c1 02             	add    ecx,0x2
   1403872c7:	8b d1                	mov    edx,ecx
   1403872c9:	48 8b 0c ce          	mov    rcx,QWORD PTR [rsi+rcx*8]
   1403872cd:	48 89 0c fe          	mov    QWORD PTR [rsi+rdi*8],rcx
   1403872d1:	48 89 04 d6          	mov    QWORD PTR [rsi+rdx*8],rax
   1403872d5:	0f 57 c0             	xorps  xmm0,xmm0
   1403872d8:	f3 0f 5a c5          	cvtss2sd xmm0,xmm5
   1403872dc:	66 0f 2f c1          	comisd xmm0,xmm1
   1403872e0:	72 1f                	jb     0x140387301
   1403872e2:	42 8d 0c dd 00 00 00 	lea    ecx,[r11*8+0x0]
   1403872e9:	00 
   1403872ea:	8b f9                	mov    edi,ecx
   1403872ec:	48 8b 04 ce          	mov    rax,QWORD PTR [rsi+rcx*8]
   1403872f0:	83 c1 03             	add    ecx,0x3
   1403872f3:	8b d1                	mov    edx,ecx
   1403872f5:	48 8b 0c ce          	mov    rcx,QWORD PTR [rsi+rcx*8]
   1403872f9:	48 89 0c fe          	mov    QWORD PTR [rsi+rdi*8],rcx
   1403872fd:	48 89 04 d6          	mov    QWORD PTR [rsi+rdx*8],rax
   140387301:	0f 57 c0             	xorps  xmm0,xmm0
   140387304:	f3 0f 5a c6          	cvtss2sd xmm0,xmm6
   140387308:	66 0f 2f c1          	comisd xmm0,xmm1
   14038730c:	72 1f                	jb     0x14038732d
   14038730e:	42 8d 0c dd 00 00 00 	lea    ecx,[r11*8+0x0]
   140387315:	00 
   140387316:	8b f9                	mov    edi,ecx
   140387318:	48 8b 04 ce          	mov    rax,QWORD PTR [rsi+rcx*8]
   14038731c:	83 c1 04             	add    ecx,0x4
   14038731f:	8b d1                	mov    edx,ecx
   140387321:	48 8b 0c ce          	mov    rcx,QWORD PTR [rsi+rcx*8]
   140387325:	48 89 0c fe          	mov    QWORD PTR [rsi+rdi*8],rcx
   140387329:	48 89 04 d6          	mov    QWORD PTR [rsi+rdx*8],rax
   14038732d:	0f 57 c0             	xorps  xmm0,xmm0
   140387330:	f3 0f 5a c7          	cvtss2sd xmm0,xmm7
   140387334:	66 0f 2f c1          	comisd xmm0,xmm1
   140387338:	72 1f                	jb     0x140387359
   14038733a:	42 8d 0c dd 00 00 00 	lea    ecx,[r11*8+0x0]
   140387341:	00 
   140387342:	8b f9                	mov    edi,ecx
   140387344:	48 8b 04 ce          	mov    rax,QWORD PTR [rsi+rcx*8]
   140387348:	83 c1 05             	add    ecx,0x5
   14038734b:	8b d1                	mov    edx,ecx
   14038734d:	48 8b 0c ce          	mov    rcx,QWORD PTR [rsi+rcx*8]
   140387351:	48 89 0c fe          	mov    QWORD PTR [rsi+rdi*8],rcx
   140387355:	48 89 04 d6          	mov    QWORD PTR [rsi+rdx*8],rax
   140387359:	0f 57 c0             	xorps  xmm0,xmm0
   14038735c:	f3 41 0f 5a c1       	cvtss2sd xmm0,xmm9
   140387361:	66 0f 2f c1          	comisd xmm0,xmm1
   140387365:	72 1f                	jb     0x140387386
   140387367:	42 8d 0c dd 00 00 00 	lea    ecx,[r11*8+0x0]
   14038736e:	00 
   14038736f:	8b f9                	mov    edi,ecx
   140387371:	48 8b 04 ce          	mov    rax,QWORD PTR [rsi+rcx*8]
   140387375:	83 c1 06             	add    ecx,0x6
   140387378:	8b d1                	mov    edx,ecx
   14038737a:	48 8b 0c ce          	mov    rcx,QWORD PTR [rsi+rcx*8]
   14038737e:	48 89 0c fe          	mov    QWORD PTR [rsi+rdi*8],rcx
   140387382:	48 89 04 d6          	mov    QWORD PTR [rsi+rdx*8],rax
   140387386:	0f 57 c0             	xorps  xmm0,xmm0
   140387389:	f3 41 0f 5a c0       	cvtss2sd xmm0,xmm8
   14038738e:	66 0f 2f c1          	comisd xmm0,xmm1
   140387392:	72 1f                	jb     0x1403873b3
   140387394:	42 8d 0c dd 00 00 00 	lea    ecx,[r11*8+0x0]
   14038739b:	00 
   14038739c:	8b f9                	mov    edi,ecx
   14038739e:	48 8b 04 ce          	mov    rax,QWORD PTR [rsi+rcx*8]
   1403873a2:	83 c1 07             	add    ecx,0x7
   1403873a5:	8b d1                	mov    edx,ecx
   1403873a7:	48 8b 0c ce          	mov    rcx,QWORD PTR [rsi+rcx*8]
   1403873ab:	48 89 0c fe          	mov    QWORD PTR [rsi+rdi*8],rcx
   1403873af:	48 89 04 d6          	mov    QWORD PTR [rsi+rdx*8],rax
   1403873b3:	41 ff c3             	inc    r11d
   1403873b6:	41 8b 07             	mov    eax,DWORD PTR [r15]
   1403873b9:	48 69 f0 78 ab 06 00 	imul   rsi,rax,0x6ab78
   1403873c0:	8b d0                	mov    edx,eax
   1403873c2:	46 3b 9c 36 d8 a5 98 	cmp    r11d,DWORD PTR [rsi+r14*1+0x98a5d8]
   1403873c9:	00 
   1403873ca:	f3 0f 10 3d 0a 8c 4c 	movss  xmm7,DWORD PTR [rip+0x4c8c0a]        # 0x14084ffdc
   1403873d1:	00 
   1403873d2:	0f 82 fe fa ff ff    	jb     0x140386ed6
   1403873d8:	41 8b fd             	mov    edi,r13d
   1403873db:	8b c2                	mov    eax,edx
   1403873dd:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403873e4:	42 83 bc 31 d8 a5 98 	cmp    DWORD PTR [rcx+r14*1+0x98a5d8],0x0
   1403873eb:	00 00 
   1403873ed:	0f 86 17 01 00 00    	jbe    0x14038750a
   1403873f3:	41 b8 2d 00 00 00    	mov    r8d,0x2d
   1403873f9:	f2 0f 10 ad 28 05 00 	movsd  xmm5,QWORD PTR [rbp+0x528]
   140387400:	00 
   140387401:	f2 0f 10 b5 28 04 00 	movsd  xmm6,QWORD PTR [rbp+0x428]
   140387408:	00 
   140387409:	f2 0f 10 95 e0 03 00 	movsd  xmm2,QWORD PTR [rbp+0x3e0]
   140387410:	00 
   140387411:	f2 0f 10 9d d8 03 00 	movsd  xmm3,QWORD PTR [rbp+0x3d8]
   140387418:	00 
   140387419:	f2 0f 10 25 b7 8d 4c 	movsd  xmm4,QWORD PTR [rip+0x4c8db7]        # 0x1408501d8
   140387420:	00 
   140387421:	41 8d 70 d6          	lea    esi,[r8-0x2a]
   140387425:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14038742c:	00 00 00 00 
   140387430:	8b cf                	mov    ecx,edi
   140387432:	8b c2                	mov    eax,edx
   140387434:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   14038743b:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   14038743f:	48 03 c9             	add    rcx,rcx
   140387442:	4a 8b 84 30 d0 a5 98 	mov    rax,QWORD PTR [rax+r14*1+0x98a5d0]
   140387449:	00 
   14038744a:	48 8b 54 c8 30       	mov    rdx,QWORD PTR [rax+rcx*8+0x30]
   14038744f:	48 85 d2             	test   rdx,rdx
   140387452:	0f 84 96 00 00 00    	je     0x1403874ee
   140387458:	41 80 bf 98 00 00 00 	cmp    BYTE PTR [r15+0x98],0x0
   14038745f:	00 
   140387460:	74 53                	je     0x1403874b5
   140387462:	48 8d 85 28 05 00 00 	lea    rax,[rbp+0x528]
   140387469:	48 8d 8d 28 04 00 00 	lea    rcx,[rbp+0x428]
   140387470:	66 0f 2f f5          	comisd xmm6,xmm5
   140387474:	48 0f 47 c1          	cmova  rax,rcx
   140387478:	66 0f 2f d3          	comisd xmm2,xmm3
   14038747c:	76 05                	jbe    0x140387483
   14038747e:	0f 28 ca             	movaps xmm1,xmm2
   140387481:	eb 03                	jmp    0x140387486
   140387483:	0f 28 cb             	movaps xmm1,xmm3
   140387486:	f2 0f 10 00          	movsd  xmm0,QWORD PTR [rax]
   14038748a:	66 0f 2f c1          	comisd xmm0,xmm1
   14038748e:	76 07                	jbe    0x140387497
   140387490:	66 44 89 42 20       	mov    WORD PTR [rdx+0x20],r8w
   140387495:	eb 57                	jmp    0x1403874ee
   140387497:	0f 28 c3             	movaps xmm0,xmm3
   14038749a:	f2 0f 59 c4          	mulsd  xmm0,xmm4
   14038749e:	66 0f 2f d0          	comisd xmm2,xmm0
   1403874a2:	72 0b                	jb     0x1403874af
   1403874a4:	b8 04 00 00 00       	mov    eax,0x4
   1403874a9:	66 89 42 20          	mov    WORD PTR [rdx+0x20],ax
   1403874ad:	eb 3f                	jmp    0x1403874ee
   1403874af:	66 89 72 20          	mov    WORD PTR [rdx+0x20],si
   1403874b3:	eb 39                	jmp    0x1403874ee
   1403874b5:	66 83 ba 1c 02 00 00 	cmp    WORD PTR [rdx+0x21c],0x0
   1403874bc:	00 
   1403874bd:	7c 2f                	jl     0x1403874ee
   1403874bf:	8d 0c fd 00 00 00 00 	lea    ecx,[rdi*8+0x0]
   1403874c6:	48 8b 44 24 58       	mov    rax,QWORD PTR [rsp+0x58]
   1403874cb:	0f 10 04 c8          	movups xmm0,XMMWORD PTR [rax+rcx*8]
   1403874cf:	0f 11 42 20          	movups XMMWORD PTR [rdx+0x20],xmm0
   1403874d3:	0f 10 4c c8 10       	movups xmm1,XMMWORD PTR [rax+rcx*8+0x10]
   1403874d8:	0f 11 4a 30          	movups XMMWORD PTR [rdx+0x30],xmm1
   1403874dc:	0f 10 44 c8 20       	movups xmm0,XMMWORD PTR [rax+rcx*8+0x20]
   1403874e1:	0f 11 42 40          	movups XMMWORD PTR [rdx+0x40],xmm0
   1403874e5:	0f 10 4c c8 30       	movups xmm1,XMMWORD PTR [rax+rcx*8+0x30]
   1403874ea:	0f 11 4a 50          	movups XMMWORD PTR [rdx+0x50],xmm1
   1403874ee:	ff c7                	inc    edi
   1403874f0:	41 8b 07             	mov    eax,DWORD PTR [r15]
   1403874f3:	8b d0                	mov    edx,eax
   1403874f5:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403874fc:	42 3b bc 31 d8 a5 98 	cmp    edi,DWORD PTR [rcx+r14*1+0x98a5d8]
   140387503:	00 
   140387504:	0f 82 26 ff ff ff    	jb     0x140387430
   14038750a:	80 05 0f ee b7 14 05 	add    BYTE PTR [rip+0x14b7ee0f],0x5        # 0x154f06320
   140387511:	48 8b 4c 24 58       	mov    rcx,QWORD PTR [rsp+0x58]
   140387516:	e8 3d 40 29 00       	call   0x14061b558
   14038751b:	45 0f 57 d2          	xorps  xmm10,xmm10
   14038751f:	33 d2                	xor    edx,edx
   140387521:	41 b8 00 04 00 00    	mov    r8d,0x400
   140387527:	48 8d 8d c0 03 00 00 	lea    rcx,[rbp+0x3c0]
   14038752e:	e8 b7 97 29 00       	call   0x140620cea
   140387533:	45 8b c5             	mov    r8d,r13d
   140387536:	41 8b 17             	mov    edx,DWORD PTR [r15]
   140387539:	48 69 c2 78 ab 06 00 	imul   rax,rdx,0x6ab78
   140387540:	42 83 bc 30 d8 a5 98 	cmp    DWORD PTR [rax+r14*1+0x98a5d8],0x0
   140387547:	00 00 
   140387549:	0f 86 e2 00 00 00    	jbe    0x140387631
   14038754f:	f3 0f 10 15 8d fb 30 	movss  xmm2,DWORD PTR [rip+0x30fb8d]        # 0x1406970e4
   140387556:	00 
   140387557:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14038755e:	00 00 
   140387560:	41 8b c8             	mov    ecx,r8d
   140387563:	8b c2                	mov    eax,edx
   140387565:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   14038756c:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   140387570:	48 03 c9             	add    rcx,rcx
   140387573:	4a 8b 84 30 d0 a5 98 	mov    rax,QWORD PTR [rax+r14*1+0x98a5d0]
   14038757a:	00 
   14038757b:	48 8b 74 c8 30       	mov    rsi,QWORD PTR [rax+rcx*8+0x30]
   140387580:	48 85 f6             	test   rsi,rsi
   140387583:	0f 84 8b 00 00 00    	je     0x140387614
   140387589:	f3 0f 10 4e 24       	movss  xmm1,DWORD PTR [rsi+0x24]
   14038758e:	41 8b cd             	mov    ecx,r13d
   140387591:	ba ff ff 00 00       	mov    edx,0xffff
   140387596:	66 39 56 20          	cmp    WORD PTR [rsi+0x20],dx
   14038759a:	66 0f 45 4e 20       	cmovne cx,WORD PTR [rsi+0x20]
   14038759f:	41 0f 2e cc          	ucomiss xmm1,xmm12
   1403875a3:	7a 4d                	jp     0x1403875f2
   1403875a5:	75 4b                	jne    0x1403875f2
   1403875a7:	41 0f b7 cd          	movzx  ecx,r13w
   1403875ab:	ba 01 00 00 00       	mov    edx,0x1
   1403875b0:	48 8d bd c8 03 00 00 	lea    rdi,[rbp+0x3c8]
   1403875b7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   1403875be:	00 00 
   1403875c0:	0f b7 c1             	movzx  eax,cx
   1403875c3:	f2 0f 10 07          	movsd  xmm0,QWORD PTR [rdi]
   1403875c7:	66 0f 2f 84 c5 c0 03 	comisd xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   1403875ce:	00 00 
   1403875d0:	66 0f 47 ca          	cmova  cx,dx
   1403875d4:	66 ff c2             	inc    dx
   1403875d7:	48 8d 7f 08          	lea    rdi,[rdi+0x8]
   1403875db:	66 83 fa 7f          	cmp    dx,0x7f
   1403875df:	76 df                	jbe    0x1403875c0
   1403875e1:	66 89 4e 20          	mov    WORD PTR [rsi+0x20],cx
   1403875e5:	0f 2f d1             	comiss xmm2,xmm1
   1403875e8:	76 03                	jbe    0x1403875ed
   1403875ea:	0f 28 ca             	movaps xmm1,xmm2
   1403875ed:	f3 0f 11 4e 24       	movss  DWORD PTR [rsi+0x24],xmm1
   1403875f2:	66 83 f9 7f          	cmp    cx,0x7f
   1403875f6:	77 1c                	ja     0x140387614
   1403875f8:	0f b7 c1             	movzx  eax,cx
   1403875fb:	0f 57 c0             	xorps  xmm0,xmm0
   1403875fe:	f3 0f 5a c1          	cvtss2sd xmm0,xmm1
   140387602:	f2 0f 58 84 c5 c0 03 	addsd  xmm0,QWORD PTR [rbp+rax*8+0x3c0]
   140387609:	00 00 
   14038760b:	f2 0f 11 84 c5 c0 03 	movsd  QWORD PTR [rbp+rax*8+0x3c0],xmm0
   140387612:	00 00 
   140387614:	41 ff c0             	inc    r8d
   140387617:	41 8b 07             	mov    eax,DWORD PTR [r15]
   14038761a:	8b d0                	mov    edx,eax
   14038761c:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140387623:	46 3b 84 31 d8 a5 98 	cmp    r8d,DWORD PTR [rcx+r14*1+0x98a5d8]
   14038762a:	00 
   14038762b:	0f 82 2f ff ff ff    	jb     0x140387560
   140387631:	48 8d bd c0 03 00 00 	lea    rdi,[rbp+0x3c0]
   140387638:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14038763f:	00 
   140387640:	f2 0f 10 07          	movsd  xmm0,QWORD PTR [rdi]
   140387644:	66 41 0f 2e c2       	ucomisd xmm0,xmm10
   140387649:	7a 0f                	jp     0x14038765a
   14038764b:	75 0d                	jne    0x14038765a
   14038764d:	45 8b 07             	mov    r8d,DWORD PTR [r15]
   140387650:	33 d2                	xor    edx,edx
   140387652:	41 8b cd             	mov    ecx,r13d
   140387655:	e8 46 45 ff ff       	call   0x14037bba0
   14038765a:	41 ff c5             	inc    r13d
   14038765d:	48 83 c7 08          	add    rdi,0x8
   140387661:	41 83 fd 7f          	cmp    r13d,0x7f
   140387665:	76 d9                	jbe    0x140387640
   140387667:	e8 94 83 00 00       	call   0x14038fa00
   14038766c:	8b 05 3e 2b 60 00    	mov    eax,DWORD PTR [rip+0x602b3e]        # 0x14098a1b0
   140387672:	41 39 07             	cmp    DWORD PTR [r15],eax
   140387675:	75 0c                	jne    0x140387683
   140387677:	33 d2                	xor    edx,edx
   140387679:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   14038767e:	e8 ad a5 10 00       	call   0x140491c30
   140387683:	48 8b 8d 40 0c 00 00 	mov    rcx,QWORD PTR [rbp+0xc40]
   14038768a:	48 33 cc             	xor    rcx,rsp
   14038768d:	e8 6e 3f 29 00       	call   0x14061b600
   140387692:	4c 8d 9c 24 f0 0d 00 	lea    r11,[rsp+0xdf0]
   140387699:	00 
   14038769a:	49 8b 5b 38          	mov    rbx,QWORD PTR [r11+0x38]
   14038769e:	49 8b 73 40          	mov    rsi,QWORD PTR [r11+0x40]
   1403876a2:	49 8b 7b 48          	mov    rdi,QWORD PTR [r11+0x48]
   1403876a6:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
   1403876ab:	41 0f 28 7b e0       	movaps xmm7,XMMWORD PTR [r11-0x20]
   1403876b0:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   1403876b5:	45 0f 28 4b c0       	movaps xmm9,XMMWORD PTR [r11-0x40]
   1403876ba:	45 0f 28 53 b0       	movaps xmm10,XMMWORD PTR [r11-0x50]
   1403876bf:	45 0f 28 5b a0       	movaps xmm11,XMMWORD PTR [r11-0x60]
   1403876c4:	45 0f 28 63 90       	movaps xmm12,XMMWORD PTR [r11-0x70]
   1403876c9:	45 0f 28 6b 80       	movaps xmm13,XMMWORD PTR [r11-0x80]
   1403876ce:	45 0f 28 b3 70 ff ff 	movaps xmm14,XMMWORD PTR [r11-0x90]
   1403876d5:	ff 
   1403876d6:	45 0f 28 bb 60 ff ff 	movaps xmm15,XMMWORD PTR [r11-0xa0]
   1403876dd:	ff 
   1403876de:	49 8b e3             	mov    rsp,r11
   1403876e1:	41 5f                	pop    r15
   1403876e3:	41 5e                	pop    r14
   1403876e5:	41 5d                	pop    r13
   1403876e7:	41 5c                	pop    r12
   1403876e9:	5d                   	pop    rbp
   1403876ea:	c3                   	ret
   1403876eb:	90                   	nop
   1403876ec:	2f                   	(bad)
   1403876ed:	55                   	push   rbp
   1403876ee:	38 00                	cmp    BYTE PTR [rax],al
   1403876f0:	36 55                	ss push rbp
   1403876f2:	38 00                	cmp    BYTE PTR [rax],al
   1403876f4:	d0 55 38             	rcl    BYTE PTR [rbp+0x38],1
   1403876f7:	00 3a                	add    BYTE PTR [rdx],bh
   1403876f9:	55                   	push   rbp
   1403876fa:	38 00                	cmp    BYTE PTR [rax],al
   1403876fc:	41 55                	push   r13
   1403876fe:	38 00                	cmp    BYTE PTR [rax],al
   140387700:	d0 55 38             	rcl    BYTE PTR [rbp+0x38],1
   140387703:	00 59 55             	add    BYTE PTR [rcx+0x55],bl
   140387706:	38 00                	cmp    BYTE PTR [rax],al
   140387708:	47 55                	rex.RXB push r13
   14038770a:	38 00                	cmp    BYTE PTR [rax],al
   14038770c:	d0 55 38             	rcl    BYTE PTR [rbp+0x38],1
   14038770f:	00 d0                	add    al,dl
   140387711:	55                   	push   rbp
   140387712:	38 00                	cmp    BYTE PTR [rax],al
   140387714:	d0 55 38             	rcl    BYTE PTR [rbp+0x38],1
   140387717:	00 d0                	add    al,dl
   140387719:	55                   	push   rbp
   14038771a:	38 00                	cmp    BYTE PTR [rax],al
   14038771c:	4d 55                	rex.WRB push r13
   14038771e:	38 00                	cmp    BYTE PTR [rax],al
