
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140387830 <.text+0x386830>:
   140387830:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   140387835:	57                   	push   rdi
   140387836:	41 54                	push   r12
   140387838:	41 55                	push   r13
   14038783a:	41 56                	push   r14
   14038783c:	41 57                	push   r15
   14038783e:	48 83 ec 20          	sub    rsp,0x20
   140387842:	45 33 ed             	xor    r13d,r13d
   140387845:	4c 8d 25 24 eb b7 14 	lea    r12,[rip+0x14b7eb24]        # 0x154f06370
   14038784c:	45 0f b6 f1          	movzx  r14d,r9b
   140387850:	45 0f b6 f8          	movzx  r15d,r8b
   140387854:	48 8b fa             	mov    rdi,rdx
   140387857:	0f b7 e9             	movzx  ebp,cx
   14038785a:	66 83 f9 7f          	cmp    cx,0x7f
   14038785e:	0f 87 d0 00 00 00    	ja     0x140387934
   140387864:	48 89 74 24 58       	mov    QWORD PTR [rsp+0x58],rsi
   140387869:	0f b7 f1             	movzx  esi,cx
   14038786c:	49 8b 0c f4          	mov    rcx,QWORD PTR [r12+rsi*8]
   140387870:	48 85 c9             	test   rcx,rcx
   140387873:	74 22                	je     0x140387897
   140387875:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140387878:	48 85 c0             	test   rax,rax
   14038787b:	74 0c                	je     0x140387889
   14038787d:	48 8b c8             	mov    rcx,rax
   140387880:	e8 d3 3c 29 00       	call   0x14061b558
   140387885:	49 8b 0c f4          	mov    rcx,QWORD PTR [r12+rsi*8]
   140387889:	ba 38 00 00 00       	mov    edx,0x38
   14038788e:	e8 c5 3c 29 00       	call   0x14061b558
   140387893:	4d 89 2c f4          	mov    QWORD PTR [r12+rsi*8],r13
   140387897:	b9 38 00 00 00       	mov    ecx,0x38
   14038789c:	e8 af 3d 29 00       	call   0x14061b650
   1403878a1:	33 c9                	xor    ecx,ecx
   1403878a3:	49 89 04 f4          	mov    QWORD PTR [r12+rsi*8],rax
   1403878a7:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403878aa:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403878ae:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403878b2:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403878b6:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403878ba:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403878be:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403878c2:	48 85 ff             	test   rdi,rdi
   1403878c5:	74 68                	je     0x14038792f
   1403878c7:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   1403878ce:	48 8b c1             	mov    rax,rcx
   1403878d1:	48 ff c0             	inc    rax
   1403878d4:	66 44 39 2c 47       	cmp    WORD PTR [rdi+rax*2],r13w
   1403878d9:	75 f6                	jne    0x1403878d1
   1403878db:	48 85 c0             	test   rax,rax
   1403878de:	74 4f                	je     0x14038792f
   1403878e0:	48 89 5c 24 50       	mov    QWORD PTR [rsp+0x50],rbx
   1403878e5:	48 8b d9             	mov    rbx,rcx
   1403878e8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1403878ef:	00 
   1403878f0:	48 ff c3             	inc    rbx
   1403878f3:	66 44 39 2c 5f       	cmp    WORD PTR [rdi+rbx*2],r13w
   1403878f8:	75 f6                	jne    0x1403878f0
   1403878fa:	48 ff c3             	inc    rbx
   1403878fd:	b8 02 00 00 00       	mov    eax,0x2
   140387902:	48 f7 e3             	mul    rbx
   140387905:	48 0f 40 c1          	cmovo  rax,rcx
   140387909:	48 8b c8             	mov    rcx,rax
   14038790c:	e8 4f 3c 29 00       	call   0x14061b560
   140387911:	49 8b 0c f4          	mov    rcx,QWORD PTR [r12+rsi*8]
   140387915:	4c 8b c7             	mov    r8,rdi
   140387918:	48 8b d3             	mov    rdx,rbx
   14038791b:	48 89 01             	mov    QWORD PTR [rcx],rax
   14038791e:	49 8b 0c f4          	mov    rcx,QWORD PTR [r12+rsi*8]
   140387922:	48 8b 09             	mov    rcx,QWORD PTR [rcx]
   140387925:	e8 26 07 1b 00       	call   0x140538050
   14038792a:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   14038792f:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140387934:	f3 0f 10 44 24 78    	movss  xmm0,DWORD PTR [rsp+0x78]
   14038793a:	f3 0f 10 8c 24 80 00 	movss  xmm1,DWORD PTR [rsp+0x80]
   140387941:	00 00 
   140387943:	0f b7 d5             	movzx  edx,bp
   140387946:	48 8b 6c 24 60       	mov    rbp,QWORD PTR [rsp+0x60]
   14038794b:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   14038794f:	44 88 78 08          	mov    BYTE PTR [rax+0x8],r15b
   140387953:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   140387957:	44 88 70 09          	mov    BYTE PTR [rax+0x9],r14b
   14038795b:	49 8b 0c d4          	mov    rcx,QWORD PTR [r12+rdx*8]
   14038795f:	0f b6 44 24 70       	movzx  eax,BYTE PTR [rsp+0x70]
   140387964:	88 41 0a             	mov    BYTE PTR [rcx+0xa],al
   140387967:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   14038796b:	f3 0f 11 40 2c       	movss  DWORD PTR [rax+0x2c],xmm0
   140387970:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   140387974:	f3 0f 10 84 24 88 00 	movss  xmm0,DWORD PTR [rsp+0x88]
   14038797b:	00 00 
   14038797d:	f3 0f 11 48 0c       	movss  DWORD PTR [rax+0xc],xmm1
   140387982:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   140387986:	f3 0f 10 8c 24 90 00 	movss  xmm1,DWORD PTR [rsp+0x90]
   14038798d:	00 00 
   14038798f:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140387993:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   140387997:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14038799b:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   14038799f:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   1403879a3:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   1403879a7:	f3 0f 11 40 1c       	movss  DWORD PTR [rax+0x1c],xmm0
   1403879ac:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   1403879b0:	f3 0f 10 84 24 98 00 	movss  xmm0,DWORD PTR [rsp+0x98]
   1403879b7:	00 00 
   1403879b9:	f3 0f 11 48 20       	movss  DWORD PTR [rax+0x20],xmm1
   1403879be:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   1403879c2:	f3 0f 10 8c 24 a0 00 	movss  xmm1,DWORD PTR [rsp+0xa0]
   1403879c9:	00 00 
   1403879cb:	f3 0f 11 40 30       	movss  DWORD PTR [rax+0x30],xmm0
   1403879d0:	49 8b 04 d4          	mov    rax,QWORD PTR [r12+rdx*8]
   1403879d4:	f3 0f 11 48 24       	movss  DWORD PTR [rax+0x24],xmm1
   1403879d9:	49 8b 0c d4          	mov    rcx,QWORD PTR [r12+rdx*8]
   1403879dd:	8b 84 24 a8 00 00 00 	mov    eax,DWORD PTR [rsp+0xa8]
   1403879e4:	89 41 28             	mov    DWORD PTR [rcx+0x28],eax
   1403879e7:	48 83 c4 20          	add    rsp,0x20
   1403879eb:	41 5f                	pop    r15
   1403879ed:	41 5e                	pop    r14
   1403879ef:	41 5d                	pop    r13
   1403879f1:	41 5c                	pop    r12
   1403879f3:	5f                   	pop    rdi
   1403879f4:	c3                   	ret
   1403879f5:	cc                   	int3
   1403879f6:	cc                   	int3
   1403879f7:	cc                   	int3
   1403879f8:	cc                   	int3
   1403879f9:	cc                   	int3
   1403879fa:	cc                   	int3
   1403879fb:	cc                   	int3
   1403879fc:	cc                   	int3
   1403879fd:	cc                   	int3
   1403879fe:	cc                   	int3
   1403879ff:	cc                   	int3
   140387a00:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140387a05:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   140387a0a:	57                   	push   rdi
   140387a0b:	48 83 ec 20          	sub    rsp,0x20
   140387a0f:	48 8b f9             	mov    rdi,rcx
   140387a12:	48 8d 35 57 e9 b7 14 	lea    rsi,[rip+0x14b7e957]        # 0x154f06370
   140387a19:	bb 01 00 00 00       	mov    ebx,0x1
   140387a1e:	66 90                	xchg   ax,ax
   140387a20:	8b c3                	mov    eax,ebx
   140387a22:	48 8b 14 c6          	mov    rdx,QWORD PTR [rsi+rax*8]
   140387a26:	48 85 d2             	test   rdx,rdx
   140387a29:	74 14                	je     0x140387a3f
   140387a2b:	48 8b 12             	mov    rdx,QWORD PTR [rdx]
   140387a2e:	48 85 d2             	test   rdx,rdx
   140387a31:	74 0c                	je     0x140387a3f
   140387a33:	48 8b cf             	mov    rcx,rdi
   140387a36:	e8 75 08 1b 00       	call   0x1405382b0
   140387a3b:	85 c0                	test   eax,eax
   140387a3d:	74 09                	je     0x140387a48
   140387a3f:	ff c3                	inc    ebx
   140387a41:	83 fb 7f             	cmp    ebx,0x7f
   140387a44:	76 da                	jbe    0x140387a20
   140387a46:	33 db                	xor    ebx,ebx
   140387a48:	8b cb                	mov    ecx,ebx
   140387a4a:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   140387a4f:	48 8b 74 24 38       	mov    rsi,QWORD PTR [rsp+0x38]
   140387a54:	48 83 c4 20          	add    rsp,0x20
   140387a58:	5f                   	pop    rdi
   140387a59:	e9 92 5d ff ff       	jmp    0x14037d7f0
   140387a5e:	cc                   	int3
   140387a5f:	cc                   	int3
