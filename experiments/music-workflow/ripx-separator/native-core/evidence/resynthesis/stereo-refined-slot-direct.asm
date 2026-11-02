
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014033b560 <.text+0x33a560>:
   14033b560:	40 53                	rex push rbx
   14033b562:	55                   	push   rbp
   14033b563:	56                   	push   rsi
   14033b564:	57                   	push   rdi
   14033b565:	41 54                	push   r12
   14033b567:	41 55                	push   r13
   14033b569:	41 56                	push   r14
   14033b56b:	41 57                	push   r15
   14033b56d:	b8 78 25 00 00       	mov    eax,0x2578
   14033b572:	e8 c9 07 2e 00       	call   0x14061bd40
   14033b577:	48 2b e0             	sub    rsp,rax
   14033b57a:	44 0f 29 9c 24 10 25 	movaps XMMWORD PTR [rsp+0x2510],xmm11
   14033b581:	00 00 
   14033b583:	44 0f 29 a4 24 00 25 	movaps XMMWORD PTR [rsp+0x2500],xmm12
   14033b58a:	00 00 
   14033b58c:	48 8b 05 d5 6b 63 00 	mov    rax,QWORD PTR [rip+0x636bd5]        # 0x140972168
   14033b593:	48 33 c4             	xor    rax,rsp
   14033b596:	48 89 84 24 f0 24 00 	mov    QWORD PTR [rsp+0x24f0],rax
   14033b59d:	00 
   14033b59e:	45 0f bf 78 0a       	movsx  r15d,WORD PTR [r8+0xa]
   14033b5a3:	f2 44 0f 10 1d 74 2b 	movsd  xmm11,QWORD PTR [rip+0x352b74]        # 0x14068e120
   14033b5aa:	35 00 
   14033b5ac:	45 03 f9             	add    r15d,r9d
   14033b5af:	44 8b b4 24 e0 25 00 	mov    r14d,DWORD PTR [rsp+0x25e0]
   14033b5b6:	00 
   14033b5b7:	41 0f 28 cb          	movaps xmm1,xmm11
   14033b5bb:	f2 0f 10 05 3d c3 36 	movsd  xmm0,QWORD PTR [rip+0x36c33d]        # 0x1406a7900
   14033b5c2:	00 
   14033b5c3:	4c 8b ac 24 e8 25 00 	mov    r13,QWORD PTR [rsp+0x25e8]
   14033b5ca:	00 
   14033b5cb:	48 8b 9a 38 06 00 00 	mov    rbx,QWORD PTR [rdx+0x638]
   14033b5d2:	49 8b 28             	mov    rbp,QWORD PTR [r8]
   14033b5d5:	44 89 bc 24 88 00 00 	mov    DWORD PTR [rsp+0x88],r15d
   14033b5dc:	00 
   14033b5dd:	41 8b f9             	mov    edi,r9d
   14033b5e0:	48 89 94 24 b8 00 00 	mov    QWORD PTR [rsp+0xb8],rdx
   14033b5e7:	00 
   14033b5e8:	48 89 8c 24 90 00 00 	mov    QWORD PTR [rsp+0x90],rcx
   14033b5ef:	00 
   14033b5f0:	44 89 b4 24 80 00 00 	mov    DWORD PTR [rsp+0x80],r14d
   14033b5f7:	00 
   14033b5f8:	e8 7d 57 2e 00       	call   0x140620d7a
   14033b5fd:	48 8b 43 10          	mov    rax,QWORD PTR [rbx+0x10]
   14033b601:	45 33 c9             	xor    r9d,r9d
   14033b604:	49 63 cf             	movsxd rcx,r15d
   14033b607:	45 0f 57 e4          	xorps  xmm12,xmm12
   14033b60b:	41 c7 45 00 00 00 20 	mov    DWORD PTR [r13+0x0],0x43200000
   14033b612:	43 
   14033b613:	45 8b e1             	mov    r12d,r9d
   14033b616:	48 89 8c 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],rcx
   14033b61d:	00 
   14033b61e:	f2 44 0f 5a e0       	cvtsd2ss xmm12,xmm0
   14033b623:	44 8b 04 88          	mov    r8d,DWORD PTR [rax+rcx*4]
   14033b627:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14033b62a:	44 89 8c 24 84 00 00 	mov    DWORD PTR [rsp+0x84],r9d
   14033b631:	00 
   14033b632:	41 69 cf 00 15 00 00 	imul   ecx,r15d,0x1500
   14033b639:	f3 44 0f 59 25 6e 2b 	mulss  xmm12,DWORD PTR [rip+0x352b6e]        # 0x14068e1b0
   14033b640:	35 00 
   14033b642:	48 8d 14 c8          	lea    rdx,[rax+rcx*8]
   14033b646:	48 8b 43 08          	mov    rax,QWORD PTR [rbx+0x8]
   14033b64a:	48 89 94 24 98 00 00 	mov    QWORD PTR [rsp+0x98],rdx
   14033b651:	00 
   14033b652:	48 8d 34 c8          	lea    rsi,[rax+rcx*8]
   14033b656:	48 89 b4 24 e0 00 00 	mov    QWORD PTR [rsp+0xe0],rsi
   14033b65d:	00 
   14033b65e:	45 85 c0             	test   r8d,r8d
   14033b661:	74 2e                	je     0x14033b691
   14033b663:	48 6b d7 5c          	imul   rdx,rdi,0x5c
   14033b667:	48 8b c6             	mov    rax,rsi
   14033b66a:	48 03 d5             	add    rdx,rbp
   14033b66d:	0f 1f 00             	nop    DWORD PTR [rax]
   14033b670:	48 39 10             	cmp    QWORD PTR [rax],rdx
   14033b673:	74 0c                	je     0x14033b681
   14033b675:	41 ff c4             	inc    r12d
   14033b678:	48 83 c0 08          	add    rax,0x8
   14033b67c:	45 3b e0             	cmp    r12d,r8d
   14033b67f:	72 ef                	jb     0x14033b670
   14033b681:	48 8b 94 24 98 00 00 	mov    rdx,QWORD PTR [rsp+0x98]
   14033b688:	00 
   14033b689:	44 89 a4 24 84 00 00 	mov    DWORD PTR [rsp+0x84],r12d
   14033b690:	00 
   14033b691:	45 3b e0             	cmp    r12d,r8d
   14033b694:	0f 84 b4 08 00 00    	je     0x14033bf4e
   14033b69a:	41 8b ec             	mov    ebp,r12d
   14033b69d:	4c 8b 1c ee          	mov    r11,QWORD PTR [rsi+rbp*8]
   14033b6a1:	41 0f b6 43 4b       	movzx  eax,BYTE PTR [r11+0x4b]
   14033b6a6:	41 3b c6             	cmp    eax,r14d
   14033b6a9:	0f 82 9f 08 00 00    	jb     0x14033bf4e
   14033b6af:	41 f6 43 48 40       	test   BYTE PTR [r11+0x48],0x40
   14033b6b4:	48 8b 84 24 f0 25 00 	mov    rax,QWORD PTR [rsp+0x25f0]
   14033b6bb:	00 
   14033b6bc:	44 0f 29 84 24 40 25 	movaps XMMWORD PTR [rsp+0x2540],xmm8
   14033b6c3:	00 00 
   14033b6c5:	74 09                	je     0x14033b6d0
   14033b6c7:	48 85 c0             	test   rax,rax
   14033b6ca:	0f 84 64 08 00 00    	je     0x14033bf34
   14033b6d0:	48 8b 04 ea          	mov    rax,QWORD PTR [rdx+rbp*8]
   14033b6d4:	41 8b df             	mov    ebx,r15d
   14033b6d7:	8b 15 cb e2 5f 00    	mov    edx,DWORD PTR [rip+0x5fe2cb]        # 0x1409399a8
   14033b6dd:	45 8b d1             	mov    r10d,r9d
   14033b6e0:	f2 44 0f 10 05 3f 4a 	movsd  xmm8,QWORD PTR [rip+0x514a3f]        # 0x140850128
   14033b6e7:	51 00 
   14033b6e9:	0f 29 b4 24 60 25 00 	movaps XMMWORD PTR [rsp+0x2560],xmm6
   14033b6f0:	00 
   14033b6f1:	0f 57 f6             	xorps  xmm6,xmm6
   14033b6f4:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   14033b6f7:	0f 29 bc 24 50 25 00 	movaps XMMWORD PTR [rsp+0x2550],xmm7
   14033b6fe:	00 
   14033b6ff:	48 89 8c 24 c0 00 00 	mov    QWORD PTR [rsp+0xc0],rcx
   14033b706:	00 
   14033b707:	0f bf 48 0a          	movsx  ecx,WORD PTR [rax+0xa]
   14033b70b:	2b d9                	sub    ebx,ecx
   14033b70d:	44 0f 29 8c 24 30 25 	movaps XMMWORD PTR [rsp+0x2530],xmm9
   14033b714:	00 00 
   14033b716:	44 0f 29 94 24 20 25 	movaps XMMWORD PTR [rsp+0x2520],xmm10
   14033b71d:	00 00 
   14033b71f:	45 0f 57 d2          	xorps  xmm10,xmm10
   14033b723:	41 83 f8 04          	cmp    r8d,0x4
   14033b727:	0f 82 fd 00 00 00    	jb     0x14033b82a
   14033b72d:	41 8d 40 fc          	lea    eax,[r8-0x4]
   14033b731:	c1 e8 02             	shr    eax,0x2
   14033b734:	48 8d 4e 10          	lea    rcx,[rsi+0x10]
   14033b738:	ff c0                	inc    eax
   14033b73a:	44 8b c8             	mov    r9d,eax
   14033b73d:	44 8d 14 85 00 00 00 	lea    r10d,[rax*4+0x0]
   14033b744:	00 
   14033b745:	48 8b 41 f0          	mov    rax,QWORD PTR [rcx-0x10]
   14033b749:	f6 40 48 01          	test   BYTE PTR [rax+0x48],0x1
   14033b74d:	74 2c                	je     0x14033b77b
   14033b74f:	83 fa 01             	cmp    edx,0x1
   14033b752:	75 0a                	jne    0x14033b75e
   14033b754:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14033b759:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b75c:	eb 12                	jmp    0x14033b770
   14033b75e:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14033b763:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14033b768:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b76b:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14033b770:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033b774:	f3 0f 5f c6          	maxss  xmm0,xmm6
   14033b778:	0f 28 f0             	movaps xmm6,xmm0
   14033b77b:	48 8b 41 f8          	mov    rax,QWORD PTR [rcx-0x8]
   14033b77f:	f6 40 48 01          	test   BYTE PTR [rax+0x48],0x1
   14033b783:	74 2c                	je     0x14033b7b1
   14033b785:	83 fa 01             	cmp    edx,0x1
   14033b788:	75 0a                	jne    0x14033b794
   14033b78a:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14033b78f:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b792:	eb 12                	jmp    0x14033b7a6
   14033b794:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14033b799:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14033b79e:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b7a1:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14033b7a6:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033b7aa:	f3 0f 5f c6          	maxss  xmm0,xmm6
   14033b7ae:	0f 28 f0             	movaps xmm6,xmm0
   14033b7b1:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14033b7b4:	f6 40 48 01          	test   BYTE PTR [rax+0x48],0x1
   14033b7b8:	74 2c                	je     0x14033b7e6
   14033b7ba:	83 fa 01             	cmp    edx,0x1
   14033b7bd:	75 0a                	jne    0x14033b7c9
   14033b7bf:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14033b7c4:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b7c7:	eb 12                	jmp    0x14033b7db
   14033b7c9:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14033b7ce:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14033b7d3:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b7d6:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14033b7db:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033b7df:	f3 0f 5f c6          	maxss  xmm0,xmm6
   14033b7e3:	0f 28 f0             	movaps xmm6,xmm0
   14033b7e6:	48 8b 41 08          	mov    rax,QWORD PTR [rcx+0x8]
   14033b7ea:	f6 40 48 01          	test   BYTE PTR [rax+0x48],0x1
   14033b7ee:	74 2c                	je     0x14033b81c
   14033b7f0:	83 fa 01             	cmp    edx,0x1
   14033b7f3:	75 0a                	jne    0x14033b7ff
   14033b7f5:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14033b7fa:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b7fd:	eb 12                	jmp    0x14033b811
   14033b7ff:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14033b804:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14033b809:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b80c:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14033b811:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033b815:	f3 0f 5f c6          	maxss  xmm0,xmm6
   14033b819:	0f 28 f0             	movaps xmm6,xmm0
   14033b81c:	48 83 c1 20          	add    rcx,0x20
   14033b820:	49 83 e9 01          	sub    r9,0x1
   14033b824:	0f 85 1b ff ff ff    	jne    0x14033b745
   14033b82a:	45 3b d0             	cmp    r10d,r8d
   14033b82d:	73 49                	jae    0x14033b878
   14033b82f:	41 8b c2             	mov    eax,r10d
   14033b832:	45 2b c2             	sub    r8d,r10d
   14033b835:	48 8d 0c c6          	lea    rcx,[rsi+rax*8]
   14033b839:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14033b83c:	f6 40 48 01          	test   BYTE PTR [rax+0x48],0x1
   14033b840:	74 2c                	je     0x14033b86e
   14033b842:	83 fa 01             	cmp    edx,0x1
   14033b845:	75 0a                	jne    0x14033b851
   14033b847:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14033b84c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b84f:	eb 12                	jmp    0x14033b863
   14033b851:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14033b856:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14033b85b:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033b85e:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14033b863:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033b867:	f3 0f 5f c6          	maxss  xmm0,xmm6
   14033b86b:	0f 28 f0             	movaps xmm6,xmm0
   14033b86e:	48 83 c1 08          	add    rcx,0x8
   14033b872:	49 83 e8 01          	sub    r8,0x1
   14033b876:	75 c1                	jne    0x14033b839
   14033b878:	4c 8b 8c 24 90 00 00 	mov    r9,QWORD PTR [rsp+0x90]
   14033b87f:	00 
   14033b880:	41 0f 28 fa          	movaps xmm7,xmm10
   14033b884:	b9 00 b8 ff ff       	mov    ecx,0xffffb800
   14033b889:	bf 00 48 00 00       	mov    edi,0x4800
   14033b88e:	41 ba 02 00 00 00    	mov    r10d,0x2
   14033b894:	41 80 b9 92 00 00 00 	cmp    BYTE PTR [r9+0x92],0x0
   14033b89b:	00 
   14033b89c:	74 52                	je     0x14033b8f0
   14033b89e:	45 32 c0             	xor    r8b,r8b
   14033b8a1:	83 fa 03             	cmp    edx,0x3
   14033b8a4:	72 1a                	jb     0x14033b8c0
   14033b8a6:	41 0f b7 43 4c       	movzx  eax,WORD PTR [r11+0x4c]
   14033b8ab:	66 3b c1             	cmp    ax,cx
   14033b8ae:	7d 05                	jge    0x14033b8b5
   14033b8b0:	41 b0 01             	mov    r8b,0x1
   14033b8b3:	eb 0b                	jmp    0x14033b8c0
   14033b8b5:	66 3b c7             	cmp    ax,di
   14033b8b8:	45 0f b6 c0          	movzx  r8d,r8b
   14033b8bc:	45 0f 4f c2          	cmovg  r8d,r10d
   14033b8c0:	48 8b 94 24 b8 00 00 	mov    rdx,QWORD PTR [rsp+0xb8]
   14033b8c7:	00 
   14033b8c8:	4b 8d 0c 76          	lea    rcx,[r14+r14*2]
   14033b8cc:	f3 41 0f 10 5c cb 10 	movss  xmm3,DWORD PTR [r11+rcx*8+0x10]
   14033b8d3:	49 8b c9             	mov    rcx,r9
   14033b8d6:	c6 44 24 30 40       	mov    BYTE PTR [rsp+0x30],0x40
   14033b8db:	c6 44 24 28 ff       	mov    BYTE PTR [rsp+0x28],0xff
   14033b8e0:	44 88 44 24 20       	mov    BYTE PTR [rsp+0x20],r8b
   14033b8e5:	45 8b c7             	mov    r8d,r15d
   14033b8e8:	e8 c3 c4 00 00       	call   0x140347db0
   14033b8ed:	0f 28 f8             	movaps xmm7,xmm0
   14033b8f0:	41 0f 2e fa          	ucomiss xmm7,xmm10
   14033b8f4:	f3 45 0f 10 4d 00    	movss  xmm9,DWORD PTR [r13+0x0]
   14033b8fa:	7a 16                	jp     0x14033b912
   14033b8fc:	75 14                	jne    0x14033b912
   14033b8fe:	f3 0f 59 35 da 27 35 	mulss  xmm6,DWORD PTR [rip+0x3527da]        # 0x14068e0e0
   14033b905:	00 
   14033b906:	41 0f 2f f1          	comiss xmm6,xmm9
   14033b90a:	77 72                	ja     0x14033b97e
   14033b90c:	41 0f 28 f1          	movaps xmm6,xmm9
   14033b910:	eb 6c                	jmp    0x14033b97e
   14033b912:	0f 28 cf             	movaps xmm1,xmm7
   14033b915:	0f 28 c6             	movaps xmm0,xmm6
   14033b918:	e8 53 b4 00 00       	call   0x140346d70
   14033b91d:	0f 28 f0             	movaps xmm6,xmm0
   14033b920:	f3 0f 59 35 b8 27 35 	mulss  xmm6,DWORD PTR [rip+0x3527b8]        # 0x14068e0e0
   14033b927:	00 
   14033b928:	41 0f 2f f1          	comiss xmm6,xmm9
   14033b92c:	77 04                	ja     0x14033b932
   14033b92e:	41 0f 28 f1          	movaps xmm6,xmm9
   14033b932:	44 0f 2f d6          	comiss xmm10,xmm6
   14033b936:	72 05                	jb     0x14033b93d
   14033b938:	0f 28 f7             	movaps xmm6,xmm7
   14033b93b:	eb 41                	jmp    0x14033b97e
   14033b93d:	44 0f 2f d7          	comiss xmm10,xmm7
   14033b941:	73 3b                	jae    0x14033b97e
   14033b943:	f2 0f 10 0d e5 27 35 	movsd  xmm1,QWORD PTR [rip+0x3527e5]        # 0x14068e130
   14033b94a:	00 
   14033b94b:	0f 57 c0             	xorps  xmm0,xmm0
   14033b94e:	f3 0f 5e fe          	divss  xmm7,xmm6
   14033b952:	f3 0f 5a c7          	cvtss2sd xmm0,xmm7
   14033b956:	e8 1f 54 2e 00       	call   0x140620d7a
   14033b95b:	f2 0f 58 05 15 48 51 	addsd  xmm0,QWORD PTR [rip+0x514815]        # 0x140850178
   14033b962:	00 
   14033b963:	41 0f 28 cb          	movaps xmm1,xmm11
   14033b967:	e8 0e 54 2e 00       	call   0x140620d7a
   14033b96c:	0f 57 c9             	xorps  xmm1,xmm1
   14033b96f:	f3 0f 5a ce          	cvtss2sd xmm1,xmm6
   14033b973:	0f 57 f6             	xorps  xmm6,xmm6
   14033b976:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14033b97a:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033b97e:	48 8b 84 24 98 00 00 	mov    rax,QWORD PTR [rsp+0x98]
   14033b985:	00 
   14033b986:	48 8d 8c 24 f0 00 00 	lea    rcx,[rsp+0xf0]
   14033b98d:	00 
   14033b98e:	f3 41 0f 11 75 00    	movss  DWORD PTR [r13+0x0],xmm6
   14033b994:	33 d2                	xor    edx,edx
   14033b996:	41 b8 00 01 00 00    	mov    r8d,0x100
   14033b99c:	4c 8b 2c e8          	mov    r13,QWORD PTR [rax+rbp*8]
   14033b9a0:	8b c3                	mov    eax,ebx
   14033b9a2:	48 6b f8 5c          	imul   rdi,rax,0x5c
   14033b9a6:	49 8b 5d 00          	mov    rbx,QWORD PTR [r13+0x0]
   14033b9aa:	48 89 bc 24 d8 00 00 	mov    QWORD PTR [rsp+0xd8],rdi
   14033b9b1:	00 
   14033b9b2:	48 89 9c 24 d0 00 00 	mov    QWORD PTR [rsp+0xd0],rbx
   14033b9b9:	00 
   14033b9ba:	e8 2b 53 2e 00       	call   0x140620cea
   14033b9bf:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033b9c3:	4b 8d 0c 76          	lea    rcx,[r14+r14*2]
   14033b9c7:	44 8b 0d da e7 64 00 	mov    r9d,DWORD PTR [rip+0x64e7da]        # 0x14098a1a8
   14033b9ce:	45 8b d1             	mov    r10d,r9d
   14033b9d1:	44 8b 1d 7c e7 64 00 	mov    r11d,DWORD PTR [rip+0x64e77c]        # 0x14098a154
   14033b9d8:	f3 0f 10 1d 28 bf 36 	movss  xmm3,DWORD PTR [rip+0x36bf28]        # 0x1406a7908
   14033b9df:	00 
   14033b9e0:	f3 0f 10 6c c8 10    	movss  xmm5,DWORD PTR [rax+rcx*8+0x10]
   14033b9e6:	f3 0f 10 15 b2 47 51 	movss  xmm2,DWORD PTR [rip+0x5147b2]        # 0x1408501a0
   14033b9ed:	00 
   14033b9ee:	f3 0f 10 35 3a 46 51 	movss  xmm6,DWORD PTR [rip+0x51463a]        # 0x140850030
   14033b9f5:	00 
   14033b9f6:	f3 0f 10 3d ea 26 35 	movss  xmm7,DWORD PTR [rip+0x3526ea]        # 0x14068e0e8
   14033b9fd:	00 
   14033b9fe:	44 0f 28 8c 24 30 25 	movaps xmm9,XMMWORD PTR [rsp+0x2530]
   14033ba05:	00 00 
   14033ba07:	45 0f af d7          	imul   r10d,r15d
   14033ba0b:	41 0f 2e ea          	ucomiss xmm5,xmm10
   14033ba0f:	48 89 8c 24 e8 00 00 	mov    QWORD PTR [rsp+0xe8],rcx
   14033ba16:	00 
   14033ba17:	7a 11                	jp     0x14033ba2a
   14033ba19:	75 0f                	jne    0x14033ba2a
   14033ba1b:	4c 8b b4 24 90 00 00 	mov    r14,QWORD PTR [rsp+0x90]
   14033ba22:	00 
   14033ba23:	33 c0                	xor    eax,eax
   14033ba25:	44 8b c0             	mov    r8d,eax
   14033ba28:	eb 79                	jmp    0x14033baa3
   14033ba2a:	4c 8b b4 24 90 00 00 	mov    r14,QWORD PTR [rsp+0x90]
   14033ba31:	00 
   14033ba32:	0f 57 e4             	xorps  xmm4,xmm4
   14033ba35:	f3 49 0f 2a e3       	cvtsi2ss xmm4,r11
   14033ba3a:	0f 28 c4             	movaps xmm0,xmm4
   14033ba3d:	0f 28 cc             	movaps xmm1,xmm4
   14033ba40:	f3 0f 59 0d ac b6 35 	mulss  xmm1,DWORD PTR [rip+0x35b6ac]        # 0x1406970f4
   14033ba47:	00 
   14033ba48:	f3 0f 5e c5          	divss  xmm0,xmm5
   14033ba4c:	f3 0f 58 cb          	addss  xmm1,xmm3
   14033ba50:	f3 0f 58 c3          	addss  xmm0,xmm3
   14033ba54:	f3 4c 0f 2c c1       	cvttss2si r8,xmm1
   14033ba59:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14033ba5e:	41 3b c0             	cmp    eax,r8d
   14033ba61:	44 0f 43 c0          	cmovae r8d,eax
   14033ba65:	41 80 be 91 00 00 00 	cmp    BYTE PTR [r14+0x91],0x0
   14033ba6c:	00 
   14033ba6d:	74 05                	je     0x14033ba74
   14033ba6f:	0f 28 c2             	movaps xmm0,xmm2
   14033ba72:	eb 03                	jmp    0x14033ba77
   14033ba74:	0f 28 c6             	movaps xmm0,xmm6
   14033ba77:	41 8b 46 28          	mov    eax,DWORD PTR [r14+0x28]
   14033ba7b:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14033ba7f:	8d 04 45 01 00 00 00 	lea    eax,[rax*2+0x1]
   14033ba86:	41 0f af c1          	imul   eax,r9d
   14033ba8a:	f3 0f 59 c4          	mulss  xmm0,xmm4
   14033ba8e:	f3 0f 58 c3          	addss  xmm0,xmm3
   14033ba92:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0
   14033ba97:	3b c1                	cmp    eax,ecx
   14033ba99:	0f 43 c1             	cmovae eax,ecx
   14033ba9c:	41 3b c0             	cmp    eax,r8d
   14033ba9f:	44 0f 42 c0          	cmovb  r8d,eax
   14033baa3:	41 8b c1             	mov    eax,r9d
   14033baa6:	99                   	cdq
   14033baa7:	2b c2                	sub    eax,edx
   14033baa9:	d1 f8                	sar    eax,1
   14033baab:	44 8b f8             	mov    r15d,eax
   14033baae:	41 8b c0             	mov    eax,r8d
   14033bab1:	99                   	cdq
   14033bab2:	41 8b cf             	mov    ecx,r15d
   14033bab5:	2b c2                	sub    eax,edx
   14033bab7:	d1 f8                	sar    eax,1
   14033bab9:	2b c8                	sub    ecx,eax
   14033babb:	42 8d 04 11          	lea    eax,[rcx+r10*1]
   14033babf:	b9 00 00 00 00       	mov    ecx,0x0
   14033bac4:	85 c0                	test   eax,eax
   14033bac6:	0f 4e c1             	cmovle eax,ecx
   14033bac9:	89 84 24 b0 00 00 00 	mov    DWORD PTR [rsp+0xb0],eax
   14033bad0:	41 8d 14 00          	lea    edx,[r8+rax*1]
   14033bad4:	41 8b 46 28          	mov    eax,DWORD PTR [r14+0x28]
   14033bad8:	8d 0c 00             	lea    ecx,[rax+rax*1]
   14033badb:	41 8b 46 24          	mov    eax,DWORD PTR [r14+0x24]
   14033badf:	03 c1                	add    eax,ecx
   14033bae1:	44 8b f0             	mov    r14d,eax
   14033bae4:	89 84 24 a0 00 00 00 	mov    DWORD PTR [rsp+0xa0],eax
   14033baeb:	45 0f af f1          	imul   r14d,r9d
   14033baef:	41 3b d6             	cmp    edx,r14d
   14033baf2:	41 0f 4d d6          	cmovge edx,r14d
   14033baf6:	41 0f 2e ea          	ucomiss xmm5,xmm10
   14033bafa:	89 94 24 ac 00 00 00 	mov    DWORD PTR [rsp+0xac],edx
   14033bb01:	7a 09                	jp     0x14033bb0c
   14033bb03:	75 07                	jne    0x14033bb0c
   14033bb05:	33 c0                	xor    eax,eax
   14033bb07:	44 8b c0             	mov    r8d,eax
   14033bb0a:	eb 72                	jmp    0x14033bb7e
   14033bb0c:	0f 57 c9             	xorps  xmm1,xmm1
   14033bb0f:	f3 49 0f 2a cb       	cvtsi2ss xmm1,r11
   14033bb14:	0f 28 c1             	movaps xmm0,xmm1
   14033bb17:	f3 0f 59 05 d9 a5 36 	mulss  xmm0,DWORD PTR [rip+0x36a5d9]        # 0x1406a60f8
   14033bb1e:	00 
   14033bb1f:	f3 0f 5e c5          	divss  xmm0,xmm5
   14033bb23:	f3 0f 58 c3          	addss  xmm0,xmm3
   14033bb27:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14033bb2c:	0f 28 c1             	movaps xmm0,xmm1
   14033bb2f:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14033bb33:	f3 0f 58 c3          	addss  xmm0,xmm3
   14033bb37:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   14033bb3c:	41 3b c0             	cmp    eax,r8d
   14033bb3f:	44 0f 43 c0          	cmovae r8d,eax
   14033bb43:	48 8b 84 24 90 00 00 	mov    rax,QWORD PTR [rsp+0x90]
   14033bb4a:	00 
   14033bb4b:	80 b8 91 00 00 00 00 	cmp    BYTE PTR [rax+0x91],0x0
   14033bb52:	75 03                	jne    0x14033bb57
   14033bb54:	0f 28 d6             	movaps xmm2,xmm6
   14033bb57:	f3 0f 59 15 b1 b5 35 	mulss  xmm2,DWORD PTR [rip+0x35b5b1]        # 0x140697110
   14033bb5e:	00 
   14033bb5f:	ff c1                	inc    ecx
   14033bb61:	41 0f af c9          	imul   ecx,r9d
   14033bb65:	f3 0f 59 d1          	mulss  xmm2,xmm1
   14033bb69:	f3 0f 58 d3          	addss  xmm2,xmm3
   14033bb6d:	f3 48 0f 2c c2       	cvttss2si rax,xmm2
   14033bb72:	3b c8                	cmp    ecx,eax
   14033bb74:	0f 43 c8             	cmovae ecx,eax
   14033bb77:	41 3b c8             	cmp    ecx,r8d
   14033bb7a:	44 0f 42 c1          	cmovb  r8d,ecx
   14033bb7e:	45 0f bf 6d 0a       	movsx  r13d,WORD PTR [r13+0xa]
   14033bb83:	41 8b c0             	mov    eax,r8d
   14033bb86:	0f 28 bc 24 50 25 00 	movaps xmm7,XMMWORD PTR [rsp+0x2550]
   14033bb8d:	00 
   14033bb8e:	99                   	cdq
   14033bb8f:	0f 28 b4 24 60 25 00 	movaps xmm6,XMMWORD PTR [rsp+0x2560]
   14033bb96:	00 
   14033bb97:	2b c2                	sub    eax,edx
   14033bb99:	d1 f8                	sar    eax,1
   14033bb9b:	44 2b d0             	sub    r10d,eax
   14033bb9e:	b8 00 00 00 00       	mov    eax,0x0
   14033bba3:	47 8d 1c 3a          	lea    r11d,[r10+r15*1]
   14033bba7:	45 8b fd             	mov    r15d,r13d
   14033bbaa:	45 85 db             	test   r11d,r11d
   14033bbad:	44 0f 4e d8          	cmovle r11d,eax
   14033bbb1:	41 8b c3             	mov    eax,r11d
   14033bbb4:	44 89 9c 24 a8 00 00 	mov    DWORD PTR [rsp+0xa8],r11d
   14033bbbb:	00 
   14033bbbc:	99                   	cdq
   14033bbbd:	43 8d 0c 18          	lea    ecx,[r8+r11*1]
   14033bbc1:	41 3b ce             	cmp    ecx,r14d
   14033bbc4:	41 0f 4d ce          	cmovge ecx,r14d
   14033bbc8:	41 f7 f9             	idiv   r9d
   14033bbcb:	89 8c 24 b4 00 00 00 	mov    DWORD PTR [rsp+0xb4],ecx
   14033bbd2:	4c 63 d0             	movsxd r10,eax
   14033bbd5:	41 8d 41 ff          	lea    eax,[r9-0x1]
   14033bbd9:	03 c1                	add    eax,ecx
   14033bbdb:	44 89 94 24 a4 00 00 	mov    DWORD PTR [rsp+0xa4],r10d
   14033bbe2:	00 
   14033bbe3:	99                   	cdq
   14033bbe4:	45 8b c2             	mov    r8d,r10d
   14033bbe7:	41 f7 f9             	idiv   r9d
   14033bbea:	48 8b 94 24 98 00 00 	mov    rdx,QWORD PTR [rsp+0x98]
   14033bbf1:	00 
   14033bbf2:	45 8d 72 40          	lea    r14d,[r10+0x40]
   14033bbf6:	8d 48 02             	lea    ecx,[rax+0x2]
   14033bbf9:	48 8b 04 ea          	mov    rax,QWORD PTR [rdx+rbp*8]
   14033bbfd:	0f b7 50 08          	movzx  edx,WORD PTR [rax+0x8]
   14033bc01:	8b 84 24 a0 00 00 00 	mov    eax,DWORD PTR [rsp+0xa0]
   14033bc08:	41 03 d5             	add    edx,r13d
   14033bc0b:	3b d1                	cmp    edx,ecx
   14033bc0d:	0f 4d d1             	cmovge edx,ecx
   14033bc10:	3b c2                	cmp    eax,edx
   14033bc12:	0f 4c d0             	cmovl  edx,eax
   14033bc15:	44 3b f2             	cmp    r14d,edx
   14033bc18:	44 0f 4d f2          	cmovge r14d,edx
   14033bc1c:	45 3b d6             	cmp    r10d,r14d
   14033bc1f:	0f 8d aa 00 00 00    	jge    0x14033bccf
   14033bc25:	8b ac 24 80 00 00 00 	mov    ebp,DWORD PTR [rsp+0x80]
   14033bc2c:	4d 8b ca             	mov    r9,r10
   14033bc2f:	8b bc 24 88 00 00 00 	mov    edi,DWORD PTR [rsp+0x88]
   14033bc36:	4c 8d 94 24 f0 00 00 	lea    r10,[rsp+0xf0]
   14033bc3d:	00 
   14033bc3e:	48 8b 9c 24 c0 00 00 	mov    rbx,QWORD PTR [rsp+0xc0]
   14033bc45:	00 
   14033bc46:	45 33 e4             	xor    r12d,r12d
   14033bc49:	48 8b b4 24 c8 00 00 	mov    rsi,QWORD PTR [rsp+0xc8]
   14033bc50:	00 
   14033bc51:	45 3b c7             	cmp    r8d,r15d
   14033bc54:	7c 37                	jl     0x14033bc8d
   14033bc56:	41 0f bf c5          	movsx  eax,r13w
   14033bc5a:	41 8b c8             	mov    ecx,r8d
   14033bc5d:	2b c8                	sub    ecx,eax
   14033bc5f:	44 8b d9             	mov    r11d,ecx
   14033bc62:	4c 3b ce             	cmp    r9,rsi
   14033bc65:	7e 0b                	jle    0x14033bc72
   14033bc67:	49 6b c3 5c          	imul   rax,r11,0x5c
   14033bc6b:	f6 44 18 48 04       	test   BYTE PTR [rax+rbx*1+0x48],0x4
   14033bc70:	75 2a                	jne    0x14033bc9c
   14033bc72:	44 3b c7             	cmp    r8d,edi
   14033bc75:	41 8b c4             	mov    eax,r12d
   14033bc78:	0f 4c c5             	cmovl  eax,ebp
   14033bc7b:	49 6b cb 5c          	imul   rcx,r11,0x5c
   14033bc7f:	48 8d 14 40          	lea    rdx,[rax+rax*2]
   14033bc83:	48 03 cb             	add    rcx,rbx
   14033bc86:	8b 44 d1 10          	mov    eax,DWORD PTR [rcx+rdx*8+0x10]
   14033bc8a:	41 89 02             	mov    DWORD PTR [r10],eax
   14033bc8d:	41 ff c0             	inc    r8d
   14033bc90:	49 ff c1             	inc    r9
   14033bc93:	49 83 c2 04          	add    r10,0x4
   14033bc97:	45 3b c6             	cmp    r8d,r14d
   14033bc9a:	7c b5                	jl     0x14033bc51
   14033bc9c:	44 8b a4 24 84 00 00 	mov    r12d,DWORD PTR [rsp+0x84]
   14033bca3:	00 
   14033bca4:	48 8b 9c 24 d0 00 00 	mov    rbx,QWORD PTR [rsp+0xd0]
   14033bcab:	00 
   14033bcac:	41 8b ec             	mov    ebp,r12d
   14033bcaf:	48 8b bc 24 d8 00 00 	mov    rdi,QWORD PTR [rsp+0xd8]
   14033bcb6:	00 
   14033bcb7:	48 8b b4 24 e0 00 00 	mov    rsi,QWORD PTR [rsp+0xe0]
   14033bcbe:	00 
   14033bcbf:	44 8b 94 24 a4 00 00 	mov    r10d,DWORD PTR [rsp+0xa4]
   14033bcc6:	00 
   14033bcc7:	44 8b 9c 24 a8 00 00 	mov    r11d,DWORD PTR [rsp+0xa8]
   14033bcce:	00 
   14033bccf:	4c 8b bc 24 f0 25 00 	mov    r15,QWORD PTR [rsp+0x25f0]
   14033bcd6:	00 
   14033bcd7:	44 8b 05 ca dc 5f 00 	mov    r8d,DWORD PTR [rip+0x5fdcca]        # 0x1409399a8
   14033bcde:	44 8b b4 24 80 00 00 	mov    r14d,DWORD PTR [rsp+0x80]
   14033bce5:	00 
   14033bce6:	4d 85 ff             	test   r15,r15
   14033bce9:	75 53                	jne    0x14033bd3e
   14033bceb:	83 3d 0a dd 5f 00 02 	cmp    DWORD PTR [rip+0x5fdd0a],0x2        # 0x1409399fc
   14033bcf2:	72 4a                	jb     0x14033bd3e
   14033bcf4:	4c 8b 0c ee          	mov    r9,QWORD PTR [rsi+rbp*8]
   14033bcf8:	45 85 f6             	test   r14d,r14d
   14033bcfb:	74 45                	je     0x14033bd42
   14033bcfd:	41 8d 46 ff          	lea    eax,[r14-0x1]
   14033bd01:	0f b6 c0             	movzx  eax,al
   14033bd04:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033bd08:	41 83 f8 01          	cmp    r8d,0x1
   14033bd0c:	75 0c                	jne    0x14033bd1a
   14033bd0e:	f3 41 0f 10 44 c9 08 	movss  xmm0,DWORD PTR [r9+rcx*8+0x8]
   14033bd15:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033bd18:	eb 16                	jmp    0x14033bd30
   14033bd1a:	f3 41 0f 10 44 c9 0c 	movss  xmm0,DWORD PTR [r9+rcx*8+0xc]
   14033bd21:	f3 41 0f 58 44 c9 08 	addss  xmm0,DWORD PTR [r9+rcx*8+0x8]
   14033bd28:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033bd2b:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14033bd30:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033bd34:	41 0f 2f c4          	comiss xmm0,xmm12
   14033bd38:	76 08                	jbe    0x14033bd42
   14033bd3a:	b2 01                	mov    dl,0x1
   14033bd3c:	eb 0b                	jmp    0x14033bd49
   14033bd3e:	4c 8b 0c ee          	mov    r9,QWORD PTR [rsi+rbp*8]
   14033bd42:	32 d2                	xor    dl,dl
   14033bd44:	4d 85 ff             	test   r15,r15
   14033bd47:	75 32                	jne    0x14033bd7b
   14033bd49:	48 8b 8c 24 98 00 00 	mov    rcx,QWORD PTR [rsp+0x98]
   14033bd50:	00 
   14033bd51:	48 8b 04 e9          	mov    rax,QWORD PTR [rcx+rbp*8]
   14033bd55:	0f b6 40 25          	movzx  eax,BYTE PTR [rax+0x25]
   14033bd59:	66 44 0f 6e d0       	movd   xmm10,eax
   14033bd5e:	45 0f 5b d2          	cvtdq2ps xmm10,xmm10
   14033bd62:	f3 44 0f 59 54 1f 50 	mulss  xmm10,DWORD PTR [rdi+rbx*1+0x50]
   14033bd69:	f3 44 0f 5e 15 f2 bc 	divss  xmm10,DWORD PTR [rip+0x36bcf2]        # 0x1406a7a64
   14033bd70:	36 00 
   14033bd72:	f3 44 0f 5d 15 19 bd 	minss  xmm10,DWORD PTR [rip+0x36bd19]        # 0x1406a7a94
   14033bd79:	36 00 
   14033bd7b:	32 c9                	xor    cl,cl
   14033bd7d:	41 83 f8 03          	cmp    r8d,0x3
   14033bd81:	72 2a                	jb     0x14033bdad
   14033bd83:	41 0f b7 41 4c       	movzx  eax,WORD PTR [r9+0x4c]
   14033bd88:	41 b8 00 b8 ff ff    	mov    r8d,0xffffb800
   14033bd8e:	66 41 3b c0          	cmp    ax,r8w
   14033bd92:	7d 04                	jge    0x14033bd98
   14033bd94:	b1 01                	mov    cl,0x1
   14033bd96:	eb 15                	jmp    0x14033bdad
   14033bd98:	41 b8 00 48 00 00    	mov    r8d,0x4800
   14033bd9e:	0f b6 c9             	movzx  ecx,cl
   14033bda1:	66 41 3b c0          	cmp    ax,r8w
   14033bda5:	b8 02 00 00 00       	mov    eax,0x2
   14033bdaa:	0f 4f c8             	cmovg  ecx,eax
   14033bdad:	44 8b 84 24 88 00 00 	mov    r8d,DWORD PTR [rsp+0x88]
   14033bdb4:	00 
   14033bdb5:	4c 8d 8c 24 f0 00 00 	lea    r9,[rsp+0xf0]
   14033bdbc:	00 
   14033bdbd:	4c 89 7c 24 70       	mov    QWORD PTR [rsp+0x70],r15
   14033bdc2:	4d 85 ff             	test   r15,r15
   14033bdc5:	f3 44 0f 11 54 24 68 	movss  DWORD PTR [rsp+0x68],xmm10
   14033bdcc:	0f 95 c0             	setne  al
   14033bdcf:	88 44 24 60          	mov    BYTE PTR [rsp+0x60],al
   14033bdd3:	48 8d 84 24 f0 01 00 	lea    rax,[rsp+0x1f0]
   14033bdda:	00 
   14033bddb:	88 54 24 58          	mov    BYTE PTR [rsp+0x58],dl
   14033bddf:	48 8b 94 24 b8 00 00 	mov    rdx,QWORD PTR [rsp+0xb8]
   14033bde6:	00 
   14033bde7:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax
   14033bdec:	8b 84 24 ac 00 00 00 	mov    eax,DWORD PTR [rsp+0xac]
   14033bdf3:	88 4c 24 48          	mov    BYTE PTR [rsp+0x48],cl
   14033bdf7:	48 8b 8c 24 90 00 00 	mov    rcx,QWORD PTR [rsp+0x90]
   14033bdfe:	00 
   14033bdff:	89 44 24 40          	mov    DWORD PTR [rsp+0x40],eax
   14033be03:	8b 84 24 b0 00 00 00 	mov    eax,DWORD PTR [rsp+0xb0]
   14033be0a:	89 44 24 38          	mov    DWORD PTR [rsp+0x38],eax
   14033be0e:	8b 84 24 b4 00 00 00 	mov    eax,DWORD PTR [rsp+0xb4]
   14033be15:	89 44 24 30          	mov    DWORD PTR [rsp+0x30],eax
   14033be19:	44 89 5c 24 28       	mov    DWORD PTR [rsp+0x28],r11d
   14033be1e:	44 89 54 24 20       	mov    DWORD PTR [rsp+0x20],r10d
   14033be23:	e8 18 db fd ff       	call   0x140319940
   14033be28:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033be2c:	48 8b 8c 24 e8 00 00 	mov    rcx,QWORD PTR [rsp+0xe8]
   14033be33:	00 
   14033be34:	44 0f 28 94 24 20 25 	movaps xmm10,XMMWORD PTR [rsp+0x2520]
   14033be3b:	00 00 
   14033be3d:	f3 0f 11 44 c8 10    	movss  DWORD PTR [rax+rcx*8+0x10],xmm0
   14033be43:	41 8b c6             	mov    eax,r14d
   14033be46:	48 8d 14 40          	lea    rdx,[rax+rax*2]
   14033be4a:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033be4e:	48 03 d2             	add    rdx,rdx
   14033be51:	83 3d 50 db 5f 00 03 	cmp    DWORD PTR [rip+0x5fdb50],0x3        # 0x1409399a8
   14033be58:	72 3f                	jb     0x14033be99
   14033be5a:	f3 0f 10 84 24 30 04 	movss  xmm0,DWORD PTR [rsp+0x430]
   14033be61:	00 00 
   14033be63:	f3 0f 10 8c 24 60 06 	movss  xmm1,DWORD PTR [rsp+0x660]
   14033be6a:	00 00 
   14033be6c:	f3 0f 11 44 90 08    	movss  DWORD PTR [rax+rdx*4+0x8],xmm0
   14033be72:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033be76:	f3 0f 10 84 24 24 04 	movss  xmm0,DWORD PTR [rsp+0x424]
   14033be7d:	00 00 
   14033be7f:	f3 0f 11 4c 90 0c    	movss  DWORD PTR [rax+rdx*4+0xc],xmm1
   14033be85:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033be89:	f3 0f 10 8c 24 54 06 	movss  xmm1,DWORD PTR [rsp+0x654]
   14033be90:	00 00 
   14033be92:	f3 0f 11 04 90       	movss  DWORD PTR [rax+rdx*4],xmm0
   14033be97:	eb 2b                	jmp    0x14033bec4
   14033be99:	f3 0f 10 84 24 00 02 	movss  xmm0,DWORD PTR [rsp+0x200]
   14033bea0:	00 00 
   14033bea2:	f3 0f 10 8c 24 f4 01 	movss  xmm1,DWORD PTR [rsp+0x1f4]
   14033bea9:	00 00 
   14033beab:	f3 0f 11 44 90 08    	movss  DWORD PTR [rax+rdx*4+0x8],xmm0
   14033beb1:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033beb5:	f3 0f 11 44 90 0c    	movss  DWORD PTR [rax+rdx*4+0xc],xmm0
   14033bebb:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033bebf:	f3 0f 11 0c 90       	movss  DWORD PTR [rax+rdx*4],xmm1
   14033bec4:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033bec8:	f3 0f 11 4c 90 04    	movss  DWORD PTR [rax+rdx*4+0x4],xmm1
   14033bece:	4d 85 ff             	test   r15,r15
   14033bed1:	75 6d                	jne    0x14033bf40
   14033bed3:	83 3d ce da 5f 00 01 	cmp    DWORD PTR [rip+0x5fdace],0x1        # 0x1409399a8
   14033beda:	48 8b 0c ee          	mov    rcx,QWORD PTR [rsi+rbp*8]
   14033bede:	41 0f b6 c6          	movzx  eax,r14b
   14033bee2:	4c 8d 04 40          	lea    r8,[rax+rax*2]
   14033bee6:	75 0c                	jne    0x14033bef4
   14033bee8:	f3 42 0f 10 44 c1 08 	movss  xmm0,DWORD PTR [rcx+r8*8+0x8]
   14033beef:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033bef2:	eb 16                	jmp    0x14033bf0a
   14033bef4:	f3 42 0f 10 44 c1 0c 	movss  xmm0,DWORD PTR [rcx+r8*8+0xc]
   14033befb:	f3 42 0f 58 44 c1 08 	addss  xmm0,DWORD PTR [rcx+r8*8+0x8]
   14033bf02:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033bf05:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14033bf0a:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033bf0e:	0f 2f 05 93 bb 36 00 	comiss xmm0,DWORD PTR [rip+0x36bb93]        # 0x1406a7aa8
   14033bf15:	72 07                	jb     0x14033bf1e
   14033bf17:	fe c0                	inc    al
   14033bf19:	88 41 4b             	mov    BYTE PTR [rcx+0x4b],al
   14033bf1c:	eb 16                	jmp    0x14033bf34
   14033bf1e:	33 c0                	xor    eax,eax
   14033bf20:	89 44 91 08          	mov    DWORD PTR [rcx+rdx*4+0x8],eax
   14033bf24:	48 8b 0c ee          	mov    rcx,QWORD PTR [rsi+rbp*8]
   14033bf28:	89 44 91 0c          	mov    DWORD PTR [rcx+rdx*4+0xc],eax
   14033bf2c:	48 8b 0c ee          	mov    rcx,QWORD PTR [rsi+rbp*8]
   14033bf30:	80 49 48 10          	or     BYTE PTR [rcx+0x48],0x10
   14033bf34:	48 8b 0c ee          	mov    rcx,QWORD PTR [rsi+rbp*8]
   14033bf38:	41 8b d6             	mov    edx,r14d
   14033bf3b:	80 4c 0a 48 01       	or     BYTE PTR [rdx+rcx*1+0x48],0x1
   14033bf40:	44 0f 28 84 24 40 25 	movaps xmm8,XMMWORD PTR [rsp+0x2540]
   14033bf47:	00 00 
   14033bf49:	41 8b c4             	mov    eax,r12d
   14033bf4c:	eb 05                	jmp    0x14033bf53
   14033bf4e:	b8 ff ff ff ff       	mov    eax,0xffffffff
   14033bf53:	48 8b 8c 24 f0 24 00 	mov    rcx,QWORD PTR [rsp+0x24f0]
   14033bf5a:	00 
   14033bf5b:	48 33 cc             	xor    rcx,rsp
   14033bf5e:	e8 9d f6 2d 00       	call   0x14061b600
   14033bf63:	4c 8d 9c 24 78 25 00 	lea    r11,[rsp+0x2578]
   14033bf6a:	00 
   14033bf6b:	45 0f 28 5b 98       	movaps xmm11,XMMWORD PTR [r11-0x68]
   14033bf70:	45 0f 28 63 88       	movaps xmm12,XMMWORD PTR [r11-0x78]
   14033bf75:	49 8b e3             	mov    rsp,r11
   14033bf78:	41 5f                	pop    r15
   14033bf7a:	41 5e                	pop    r14
   14033bf7c:	41 5d                	pop    r13
   14033bf7e:	41 5c                	pop    r12
   14033bf80:	5f                   	pop    rdi
   14033bf81:	5e                   	pop    rsi
   14033bf82:	5d                   	pop    rbp
   14033bf83:	5b                   	pop    rbx
   14033bf84:	c3                   	ret
   14033bf85:	cc                   	int3
   14033bf86:	cc                   	int3
   14033bf87:	cc                   	int3
   14033bf88:	cc                   	int3
   14033bf89:	cc                   	int3
   14033bf8a:	cc                   	int3
   14033bf8b:	cc                   	int3
   14033bf8c:	cc                   	int3
   14033bf8d:	cc                   	int3
   14033bf8e:	cc                   	int3
   14033bf8f:	cc                   	int3
   14033bf90:	8b 44 24 28          	mov    eax,DWORD PTR [rsp+0x28]
   14033bf94:	48 8b 54 24 40       	mov    rdx,QWORD PTR [rsp+0x40]
   14033bf99:	c1 e0 18             	shl    eax,0x18
   14033bf9c:	45 69 c8 00 15 00 00 	imul   r9d,r8d,0x1500
   14033bfa3:	8b 0a                	mov    ecx,DWORD PTR [rdx]
   14033bfa5:	44 03 4c 24 30       	add    r9d,DWORD PTR [rsp+0x30]
   14033bfaa:	41 81 e1 ff ff ff 00 	and    r9d,0xffffff
   14033bfb1:	44 03 c8             	add    r9d,eax
   14033bfb4:	48 8b 44 24 38       	mov    rax,QWORD PTR [rsp+0x38]
   14033bfb9:	44 89 0c 88          	mov    DWORD PTR [rax+rcx*4],r9d
   14033bfbd:	ff 02                	inc    DWORD PTR [rdx]
   14033bfbf:	c3                   	ret
   14033bfc0:	cc                   	int3
   14033bfc1:	cc                   	int3
   14033bfc2:	cc                   	int3
   14033bfc3:	cc                   	int3
   14033bfc4:	cc                   	int3
   14033bfc5:	cc                   	int3
   14033bfc6:	cc                   	int3
   14033bfc7:	cc                   	int3
   14033bfc8:	cc                   	int3
   14033bfc9:	cc                   	int3
   14033bfca:	cc                   	int3
   14033bfcb:	cc                   	int3
   14033bfcc:	cc                   	int3
   14033bfcd:	cc                   	int3
   14033bfce:	cc                   	int3
   14033bfcf:	cc                   	int3
