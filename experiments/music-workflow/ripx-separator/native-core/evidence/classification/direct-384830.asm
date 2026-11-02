
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140384830 <.text+0x383830>:
   140384830:	80 b9 96 00 00 00 00 	cmp    BYTE PTR [rcx+0x96],0x0
   140384837:	74 64                	je     0x14038489d
   140384839:	80 b9 93 00 00 00 00 	cmp    BYTE PTR [rcx+0x93],0x0
   140384840:	74 06                	je     0x140384848
   140384842:	b8 1e 00 00 00       	mov    eax,0x1e
   140384847:	c3                   	ret
   140384848:	80 b9 92 00 00 00 00 	cmp    BYTE PTR [rcx+0x92],0x0
   14038484f:	75 46                	jne    0x140384897
   140384851:	80 b9 91 00 00 00 00 	cmp    BYTE PTR [rcx+0x91],0x0
   140384858:	74 06                	je     0x140384860
   14038485a:	b8 07 00 00 00       	mov    eax,0x7
   14038485f:	c3                   	ret
   140384860:	80 b9 94 00 00 00 00 	cmp    BYTE PTR [rcx+0x94],0x0
   140384867:	74 06                	je     0x14038486f
   140384869:	b8 03 00 00 00       	mov    eax,0x3
   14038486e:	c3                   	ret
   14038486f:	80 b9 99 00 00 00 00 	cmp    BYTE PTR [rcx+0x99],0x0
   140384876:	74 06                	je     0x14038487e
   140384878:	b8 2e 00 00 00       	mov    eax,0x2e
   14038487d:	c3                   	ret
   14038487e:	80 b9 95 00 00 00 00 	cmp    BYTE PTR [rcx+0x95],0x0
   140384885:	74 06                	je     0x14038488d
   140384887:	b8 04 00 00 00       	mov    eax,0x4
   14038488c:	c3                   	ret
   14038488d:	66 83 3d 63 51 5b 00 	cmp    WORD PTR [rip+0x5b5163],0x2        # 0x1409399f8
   140384894:	02 
   140384895:	75 06                	jne    0x14038489d
   140384897:	b8 01 00 00 00       	mov    eax,0x1
   14038489c:	c3                   	ret
   14038489d:	33 c0                	xor    eax,eax
   14038489f:	c3                   	ret
   1403848a0:	cc                   	int3
   1403848a1:	cc                   	int3
   1403848a2:	cc                   	int3
   1403848a3:	cc                   	int3
   1403848a4:	cc                   	int3
   1403848a5:	cc                   	int3
   1403848a6:	cc                   	int3
   1403848a7:	cc                   	int3
   1403848a8:	cc                   	int3
   1403848a9:	cc                   	int3
   1403848aa:	cc                   	int3
   1403848ab:	cc                   	int3
   1403848ac:	cc                   	int3
   1403848ad:	cc                   	int3
   1403848ae:	cc                   	int3
   1403848af:	cc                   	int3
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
