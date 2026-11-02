
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032c560 <.text+0x32b560>:
   14032c560:	40 55                	rex push rbp
   14032c562:	53                   	push   rbx
   14032c563:	56                   	push   rsi
   14032c564:	57                   	push   rdi
   14032c565:	41 55                	push   r13
   14032c567:	41 56                	push   r14
   14032c569:	41 57                	push   r15
   14032c56b:	48 8d ac 24 90 f9 ff 	lea    rbp,[rsp-0x670]
   14032c572:	ff 
   14032c573:	48 81 ec 70 07 00 00 	sub    rsp,0x770
   14032c57a:	0f 29 b4 24 50 07 00 	movaps XMMWORD PTR [rsp+0x750],xmm6
   14032c581:	00 
   14032c582:	44 0f 29 8c 24 20 07 	movaps XMMWORD PTR [rsp+0x720],xmm9
   14032c589:	00 00 
   14032c58b:	48 8b 05 d6 5b 64 00 	mov    rax,QWORD PTR [rip+0x645bd6]        # 0x140972168
   14032c592:	48 33 c4             	xor    rax,rsp
   14032c595:	48 89 85 e0 05 00 00 	mov    QWORD PTR [rbp+0x5e0],rax
   14032c59c:	48 8b 9d e0 06 00 00 	mov    rbx,QWORD PTR [rbp+0x6e0]
   14032c5a3:	45 8b f8             	mov    r15d,r8d
   14032c5a6:	44 89 44 24 54       	mov    DWORD PTR [rsp+0x54],r8d
   14032c5ab:	48 8b f2             	mov    rsi,rdx
   14032c5ae:	4c 8b f1             	mov    r14,rcx
   14032c5b1:	48 89 4c 24 60       	mov    QWORD PTR [rsp+0x60],rcx
   14032c5b6:	33 d2                	xor    edx,edx
   14032c5b8:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032c5be:	49 8b c9             	mov    rcx,r9
   14032c5c1:	49 8b f9             	mov    rdi,r9
   14032c5c4:	e8 21 47 2f 00       	call   0x140620cea
   14032c5c9:	48 63 0b             	movsxd rcx,DWORD PTR [rbx]
   14032c5cc:	41 8b d7             	mov    edx,r15d
   14032c5cf:	2b 56 0c             	sub    edx,DWORD PTR [rsi+0xc]
   14032c5d2:	0f af 15 7b da 65 00 	imul   edx,DWORD PTR [rip+0x65da7b]        # 0x14098a054
   14032c5d9:	4c 8b be 90 04 00 00 	mov    r15,QWORD PTR [rsi+0x490]
   14032c5e0:	8d 41 01             	lea    eax,[rcx+0x1]
   14032c5e3:	3b 05 6f da 65 00    	cmp    eax,DWORD PTR [rip+0x65da6f]        # 0x14098a058
   14032c5e9:	89 03                	mov    DWORD PTR [rbx],eax
   14032c5eb:	48 89 54 24 70       	mov    QWORD PTR [rsp+0x70],rdx
   14032c5f0:	0f 8d df 05 00 00    	jge    0x14032cbd5
   14032c5f6:	48 8b 86 38 05 00 00 	mov    rax,QWORD PTR [rsi+0x538]
   14032c5fd:	45 0f 57 c9          	xorps  xmm9,xmm9
   14032c601:	48 63 44 88 04       	movsxd rax,DWORD PTR [rax+rcx*4+0x4]
   14032c606:	48 89 44 24 68       	mov    QWORD PTR [rsp+0x68],rax
   14032c60b:	4c 8d 2c 10          	lea    r13,[rax+rdx*1]
   14032c60f:	49 8b cd             	mov    rcx,r13
   14032c612:	48 03 c9             	add    rcx,rcx
   14032c615:	f3 41 0f 10 74 cf 04 	movss  xmm6,DWORD PTR [r15+rcx*8+0x4]
   14032c61c:	41 0f 2e f1          	ucomiss xmm6,xmm9
   14032c620:	7a 06                	jp     0x14032c628
   14032c622:	0f 84 ad 05 00 00    	je     0x14032cbd5
   14032c628:	f3 41 0f 10 0c cf    	movss  xmm1,DWORD PTR [r15+rcx*8]
   14032c62e:	41 0f 2e c9          	ucomiss xmm1,xmm9
   14032c632:	7a 06                	jp     0x14032c63a
   14032c634:	0f 84 9b 05 00 00    	je     0x14032cbd5
   14032c63a:	8b 05 14 da 65 00    	mov    eax,DWORD PTR [rip+0x65da14]        # 0x14098a054
   14032c640:	0f 57 c0             	xorps  xmm0,xmm0
   14032c643:	0f 5a c9             	cvtps2pd xmm1,xmm1
   14032c646:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   14032c64b:	f2 0f 58 c0          	addsd  xmm0,xmm0
   14032c64f:	f2 0f 5e c8          	divsd  xmm1,xmm0
   14032c653:	f2 0f 10 05 1d 3b 52 	movsd  xmm0,QWORD PTR [rip+0x523b1d]        # 0x140850178
   14032c65a:	00 
   14032c65b:	f2 0f 5e 0d 55 b3 37 	divsd  xmm1,QWORD PTR [rip+0x37b355]        # 0x1406a79b8
   14032c662:	00 
   14032c663:	66 0f 2f c1          	comisd xmm0,xmm1
   14032c667:	0f 87 68 05 00 00    	ja     0x14032cbd5
   14032c66d:	41 0f b7 4c cf 08    	movzx  ecx,WORD PTR [r15+rcx*8+0x8]
   14032c673:	4c 89 a4 24 68 07 00 	mov    QWORD PTR [rsp+0x768],r12
   14032c67a:	00 
   14032c67b:	0f 29 bc 24 40 07 00 	movaps XMMWORD PTR [rsp+0x740],xmm7
   14032c682:	00 
   14032c683:	44 0f 29 84 24 30 07 	movaps XMMWORD PTR [rsp+0x730],xmm8
   14032c68a:	00 00 
   14032c68c:	44 0f 29 94 24 10 07 	movaps XMMWORD PTR [rsp+0x710],xmm10
   14032c693:	00 00 
   14032c695:	44 0f 29 9c 24 00 07 	movaps XMMWORD PTR [rsp+0x700],xmm11
   14032c69c:	00 00 
   14032c69e:	44 0f 29 a4 24 f0 06 	movaps XMMWORD PTR [rsp+0x6f0],xmm12
   14032c6a5:	00 00 
   14032c6a7:	e8 f4 92 01 00       	call   0x1403459a0
   14032c6ac:	33 d2                	xor    edx,edx
   14032c6ae:	88 44 24 50          	mov    BYTE PTR [rsp+0x50],al
   14032c6b2:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032c6b8:	48 8d 8d b0 01 00 00 	lea    rcx,[rbp+0x1b0]
   14032c6bf:	e8 26 46 2f 00       	call   0x140620cea
   14032c6c4:	f3 0f 10 0d c8 b3 37 	movss  xmm1,DWORD PTR [rip+0x37b3c8]        # 0x1406a7a94
   14032c6cb:	00 
   14032c6cc:	0f 28 c6             	movaps xmm0,xmm6
   14032c6cf:	f3 0f 5e 05 8d b3 37 	divss  xmm0,DWORD PTR [rip+0x37b38d]        # 0x1406a7a64
   14032c6d6:	00 
   14032c6d7:	0f 2f c8             	comiss xmm1,xmm0
   14032c6da:	77 03                	ja     0x14032c6df
   14032c6dc:	0f 28 c1             	movaps xmm0,xmm1
   14032c6df:	f3 44 0f 10 1d b8 aa 	movss  xmm11,DWORD PTR [rip+0x36aab8]        # 0x1406971a0
   14032c6e6:	36 00 
   14032c6e8:	41 bc 01 00 00 00    	mov    r12d,0x1
   14032c6ee:	f3 44 0f 10 15 ad 49 	movss  xmm10,DWORD PTR [rip+0x146849ad]        # 0x1549b10a4
   14032c6f5:	68 14 
   14032c6f7:	0f 28 fe             	movaps xmm7,xmm6
   14032c6fa:	f3 41 0f 5e c3       	divss  xmm0,xmm11
   14032c6ff:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14032c704:	0f 57 c0             	xorps  xmm0,xmm0
   14032c707:	41 3b c4             	cmp    eax,r12d
   14032c70a:	44 0f 47 e0          	cmova  r12d,eax
   14032c70e:	41 8b c4             	mov    eax,r12d
   14032c711:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14032c716:	f3 41 0f 59 c3       	mulss  xmm0,xmm11
   14032c71b:	f3 0f 5c f8          	subss  xmm7,xmm0
   14032c71f:	41 0f 2f fa          	comiss xmm7,xmm10
   14032c723:	77 04                	ja     0x14032c729
   14032c725:	41 0f 28 fa          	movaps xmm7,xmm10
   14032c729:	44 0f 28 c7          	movaps xmm8,xmm7
   14032c72d:	f3 44 0f 5e 05 be b3 	divss  xmm8,DWORD PTR [rip+0x37b3be]        # 0x1406a7af4
   14032c734:	37 00 
   14032c736:	45 0f 2f c1          	comiss xmm8,xmm9
   14032c73a:	77 04                	ja     0x14032c740
   14032c73c:	45 0f 57 c0          	xorps  xmm8,xmm8
   14032c740:	33 d2                	xor    edx,edx
   14032c742:	48 8d 8d e0 03 00 00 	lea    rcx,[rbp+0x3e0]
   14032c749:	41 b8 00 02 00 00    	mov    r8d,0x200
   14032c74f:	f3 45 0f 58 c0       	addss  xmm8,xmm8
   14032c754:	e8 91 45 2f 00       	call   0x140620cea
   14032c759:	8b 5c 24 54          	mov    ebx,DWORD PTR [rsp+0x54]
   14032c75d:	33 c0                	xor    eax,eax
   14032c75f:	44 8b 15 42 da 65 00 	mov    r10d,DWORD PTR [rip+0x65da42]        # 0x14098a1a8
   14032c766:	44 8b db             	mov    r11d,ebx
   14032c769:	f3 44 0f 10 25 be 38 	movss  xmm12,DWORD PTR [rip+0x5238be]        # 0x140850030
   14032c770:	52 00 
   14032c772:	45 0f af da          	imul   r11d,r10d
   14032c776:	41 0f 2e f9          	ucomiss xmm7,xmm9
   14032c77a:	7a 0e                	jp     0x14032c78a
   14032c77c:	75 0c                	jne    0x14032c78a
   14032c77e:	45 8b 4e 28          	mov    r9d,DWORD PTR [r14+0x28]
   14032c782:	44 8b c0             	mov    r8d,eax
   14032c785:	e9 92 00 00 00       	jmp    0x14032c81c
   14032c78a:	8b 05 c4 d9 65 00    	mov    eax,DWORD PTR [rip+0x65d9c4]        # 0x14098a154
   14032c790:	0f 57 c9             	xorps  xmm1,xmm1
   14032c793:	f3 0f 10 15 6d b1 37 	movss  xmm2,DWORD PTR [rip+0x37b16d]        # 0x1406a7908
   14032c79a:	00 
   14032c79b:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   14032c7a0:	0f 28 c1             	movaps xmm0,xmm1
   14032c7a3:	f3 0f 59 05 4d 99 37 	mulss  xmm0,DWORD PTR [rip+0x37994d]        # 0x1406a60f8
   14032c7aa:	00 
   14032c7ab:	f3 0f 5e c7          	divss  xmm0,xmm7
   14032c7af:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032c7b3:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14032c7b8:	0f 28 c1             	movaps xmm0,xmm1
   14032c7bb:	f3 0f 59 05 25 19 36 	mulss  xmm0,DWORD PTR [rip+0x361925]        # 0x14068e0e8
   14032c7c2:	00 
   14032c7c3:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032c7c7:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   14032c7cc:	41 3b c0             	cmp    eax,r8d
   14032c7cf:	44 0f 43 c0          	cmovae r8d,eax
   14032c7d3:	41 80 be 91 00 00 00 	cmp    BYTE PTR [r14+0x91],0x0
   14032c7da:	00 
   14032c7db:	74 0a                	je     0x14032c7e7
   14032c7dd:	f3 0f 10 05 bb 39 52 	movss  xmm0,DWORD PTR [rip+0x5239bb]        # 0x1408501a0
   14032c7e4:	00 
   14032c7e5:	eb 04                	jmp    0x14032c7eb
   14032c7e7:	41 0f 28 c4          	movaps xmm0,xmm12
   14032c7eb:	f3 0f 59 05 1d a9 36 	mulss  xmm0,DWORD PTR [rip+0x36a91d]        # 0x140697110
   14032c7f2:	00 
   14032c7f3:	45 8b 4e 28          	mov    r9d,DWORD PTR [r14+0x28]
   14032c7f7:	f3 0f 59 c8          	mulss  xmm1,xmm0
   14032c7fb:	42 8d 0c 4d 01 00 00 	lea    ecx,[r9*2+0x1]
   14032c802:	00 
   14032c803:	41 0f af ca          	imul   ecx,r10d
   14032c807:	f3 0f 58 ca          	addss  xmm1,xmm2
   14032c80b:	f3 48 0f 2c c1       	cvttss2si rax,xmm1
   14032c810:	3b c8                	cmp    ecx,eax
   14032c812:	0f 43 c8             	cmovae ecx,eax
   14032c815:	41 3b c8             	cmp    ecx,r8d
   14032c818:	44 0f 42 c1          	cmovb  r8d,ecx
   14032c81c:	41 8b c0             	mov    eax,r8d
   14032c81f:	0f 28 ce             	movaps xmm1,xmm6
   14032c822:	99                   	cdq
   14032c823:	2b c2                	sub    eax,edx
   14032c825:	d1 f8                	sar    eax,1
   14032c827:	8b c8                	mov    ecx,eax
   14032c829:	41 8b c2             	mov    eax,r10d
   14032c82c:	99                   	cdq
   14032c82d:	2b c2                	sub    eax,edx
   14032c82f:	d1 f8                	sar    eax,1
   14032c831:	2b c1                	sub    eax,ecx
   14032c833:	0f 5a c6             	cvtps2pd xmm0,xmm6
   14032c836:	42 8d 0c 18          	lea    ecx,[rax+r11*1]
   14032c83a:	4c 8b 5c 24 60       	mov    r11,QWORD PTR [rsp+0x60]
   14032c83f:	85 c9                	test   ecx,ecx
   14032c841:	b8 00 00 00 00       	mov    eax,0x0
   14032c846:	0f 4e c8             	cmovle ecx,eax
   14032c849:	41 8b 43 24          	mov    eax,DWORD PTR [r11+0x24]
   14032c84d:	89 4c 24 58          	mov    DWORD PTR [rsp+0x58],ecx
   14032c851:	45 8d 34 08          	lea    r14d,[r8+rcx*1]
   14032c855:	41 b0 01             	mov    r8b,0x1
   14032c858:	42 8d 04 48          	lea    eax,[rax+r9*2]
   14032c85c:	41 0f af c2          	imul   eax,r10d
   14032c860:	89 44 24 5c          	mov    DWORD PTR [rsp+0x5c],eax
   14032c864:	8b c1                	mov    eax,ecx
   14032c866:	99                   	cdq
   14032c867:	8b cb                	mov    ecx,ebx
   14032c869:	41 f7 fa             	idiv   r10d
   14032c86c:	2b c8                	sub    ecx,eax
   14032c86e:	48 63 c1             	movsxd rax,ecx
   14032c871:	49 8b cb             	mov    rcx,r11
   14032c874:	f2 0f 11 84 c5 e0 03 	movsd  QWORD PTR [rbp+rax*8+0x3e0],xmm0
   14032c87b:	00 00 
   14032c87d:	33 c0                	xor    eax,eax
   14032c87f:	48 89 45 80          	mov    QWORD PTR [rbp-0x80],rax
   14032c883:	48 89 45 88          	mov    QWORD PTR [rbp-0x78],rax
   14032c887:	48 89 45 90          	mov    QWORD PTR [rbp-0x70],rax
   14032c88b:	48 89 85 9c 01 00 00 	mov    QWORD PTR [rbp+0x19c],rax
   14032c892:	89 85 a4 01 00 00    	mov    DWORD PTR [rbp+0x1a4],eax
   14032c898:	66 89 85 ad 01 00 00 	mov    WORD PTR [rbp+0x1ad],ax
   14032c89f:	88 85 af 01 00 00    	mov    BYTE PTR [rbp+0x1af],al
   14032c8a5:	e8 f6 ee fe ff       	call   0x14031b7a0
   14032c8aa:	0f 28 bc 24 40 07 00 	movaps xmm7,XMMWORD PTR [rsp+0x740]
   14032c8b1:	00 
   14032c8b2:	48 8d 8d e0 03 00 00 	lea    rcx,[rbp+0x3e0]
   14032c8b9:	bb 04 00 00 00       	mov    ebx,0x4
   14032c8be:	89 85 a8 01 00 00    	mov    DWORD PTR [rbp+0x1a8],eax
   14032c8c4:	48 8d 45 98          	lea    rax,[rbp-0x68]
   14032c8c8:	8b d3                	mov    edx,ebx
   14032c8ca:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14032c8d0:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14032c8d7:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032c8da:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032c8de:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14032c8e5:	0f 11 40 80          	movups XMMWORD PTR [rax-0x80],xmm0
   14032c8e9:	0f 10 41 a0          	movups xmm0,XMMWORD PTR [rcx-0x60]
   14032c8ed:	0f 11 48 90          	movups XMMWORD PTR [rax-0x70],xmm1
   14032c8f1:	0f 10 49 b0          	movups xmm1,XMMWORD PTR [rcx-0x50]
   14032c8f5:	0f 11 40 a0          	movups XMMWORD PTR [rax-0x60],xmm0
   14032c8f9:	0f 10 41 c0          	movups xmm0,XMMWORD PTR [rcx-0x40]
   14032c8fd:	0f 11 48 b0          	movups XMMWORD PTR [rax-0x50],xmm1
   14032c901:	0f 10 49 d0          	movups xmm1,XMMWORD PTR [rcx-0x30]
   14032c905:	0f 11 40 c0          	movups XMMWORD PTR [rax-0x40],xmm0
   14032c909:	0f 10 41 e0          	movups xmm0,XMMWORD PTR [rcx-0x20]
   14032c90d:	0f 11 48 d0          	movups XMMWORD PTR [rax-0x30],xmm1
   14032c911:	0f 10 49 f0          	movups xmm1,XMMWORD PTR [rcx-0x10]
   14032c915:	0f 11 40 e0          	movups XMMWORD PTR [rax-0x20],xmm0
   14032c919:	0f 11 48 f0          	movups XMMWORD PTR [rax-0x10],xmm1
   14032c91d:	48 83 ea 01          	sub    rdx,0x1
   14032c921:	75 ad                	jne    0x14032c8d0
   14032c923:	44 3b 74 24 5c       	cmp    r14d,DWORD PTR [rsp+0x5c]
   14032c928:	0f 28 c6             	movaps xmm0,xmm6
   14032c92b:	0f b6 44 24 50       	movzx  eax,BYTE PTR [rsp+0x50]
   14032c930:	f3 41 0f 5c c3       	subss  xmm0,xmm11
   14032c935:	44 0f 4d 74 24 5c    	cmovge r14d,DWORD PTR [rsp+0x5c]
   14032c93b:	8b 4c 24 58          	mov    ecx,DWORD PTR [rsp+0x58]
   14032c93f:	89 8d 98 01 00 00    	mov    DWORD PTR [rbp+0x198],ecx
   14032c945:	44 89 b5 9c 01 00 00 	mov    DWORD PTR [rbp+0x19c],r14d
   14032c94c:	41 0f 2f c2          	comiss xmm0,xmm10
   14032c950:	88 85 ac 01 00 00    	mov    BYTE PTR [rbp+0x1ac],al
   14032c956:	77 04                	ja     0x14032c95c
   14032c958:	41 0f 28 c2          	movaps xmm0,xmm10
   14032c95c:	f3 0f 10 0d 44 47 68 	movss  xmm1,DWORD PTR [rip+0x14684744]        # 0x1549b10a8
   14032c963:	14 
   14032c964:	f3 41 0f 58 f3       	addss  xmm6,xmm11
   14032c969:	44 0f 28 9c 24 00 07 	movaps xmm11,XMMWORD PTR [rsp+0x700]
   14032c970:	00 00 
   14032c972:	44 0f 28 94 24 10 07 	movaps xmm10,XMMWORD PTR [rsp+0x710]
   14032c979:	00 00 
   14032c97b:	0f 2f ce             	comiss xmm1,xmm6
   14032c97e:	77 03                	ja     0x14032c983
   14032c980:	0f 28 f1             	movaps xmm6,xmm1
   14032c983:	44 8b 44 24 54       	mov    r8d,DWORD PTR [rsp+0x54]
   14032c988:	4c 8d 4d 80          	lea    r9,[rbp-0x80]
   14032c98c:	33 c0                	xor    eax,eax
   14032c98e:	f3 44 0f 11 4c 24 40 	movss  DWORD PTR [rsp+0x40],xmm9
   14032c995:	48 89 86 e4 03 00 00 	mov    QWORD PTR [rsi+0x3e4],rax
   14032c99c:	48 8b d6             	mov    rdx,rsi
   14032c99f:	48 89 86 ec 03 00 00 	mov    QWORD PTR [rsi+0x3ec],rax
   14032c9a6:	48 89 86 f4 03 00 00 	mov    QWORD PTR [rsi+0x3f4],rax
   14032c9ad:	48 89 86 fc 03 00 00 	mov    QWORD PTR [rsi+0x3fc],rax
   14032c9b4:	48 89 86 04 04 00 00 	mov    QWORD PTR [rsi+0x404],rax
   14032c9bb:	48 89 86 0c 04 00 00 	mov    QWORD PTR [rsi+0x40c],rax
   14032c9c2:	89 86 14 04 00 00    	mov    DWORD PTR [rsi+0x414],eax
   14032c9c8:	66 89 86 18 04 00 00 	mov    WORD PTR [rsi+0x418],ax
   14032c9cf:	44 89 64 24 38       	mov    DWORD PTR [rsp+0x38],r12d
   14032c9d4:	89 8e 88 04 00 00    	mov    DWORD PTR [rsi+0x488],ecx
   14032c9da:	48 8b 4c 24 60       	mov    rcx,QWORD PTR [rsp+0x60]
   14032c9df:	f3 44 0f 11 44 24 30 	movss  DWORD PTR [rsp+0x30],xmm8
   14032c9e6:	f3 0f 11 74 24 28    	movss  DWORD PTR [rsp+0x28],xmm6
   14032c9ec:	f3 0f 11 44 24 20    	movss  DWORD PTR [rsp+0x20],xmm0
   14032c9f2:	44 89 b6 8c 04 00 00 	mov    DWORD PTR [rsi+0x48c],r14d
   14032c9f9:	e8 f2 e4 ff ff       	call   0x14032aef0
   14032c9fe:	44 0f 28 84 24 30 07 	movaps xmm8,XMMWORD PTR [rsp+0x730]
   14032ca05:	00 00 
   14032ca07:	4c 8b a4 24 68 07 00 	mov    r12,QWORD PTR [rsp+0x768]
   14032ca0e:	00 
   14032ca0f:	85 c0                	test   eax,eax
   14032ca11:	0f 85 92 00 00 00    	jne    0x14032caa9
   14032ca17:	f2 0f 10 45 88       	movsd  xmm0,QWORD PTR [rbp-0x78]
   14032ca1c:	0f 57 c9             	xorps  xmm1,xmm1
   14032ca1f:	66 0f 2f c1          	comisd xmm0,xmm1
   14032ca23:	0f 86 80 00 00 00    	jbe    0x14032caa9
   14032ca29:	48 8d 85 b0 01 00 00 	lea    rax,[rbp+0x1b0]
   14032ca30:	48 8b d3             	mov    rdx,rbx
   14032ca33:	48 8d 4d 80          	lea    rcx,[rbp-0x80]
   14032ca37:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14032ca3e:	00 00 
   14032ca40:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14032ca47:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032ca4a:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032ca4e:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14032ca55:	0f 11 40 80          	movups XMMWORD PTR [rax-0x80],xmm0
   14032ca59:	0f 10 41 a0          	movups xmm0,XMMWORD PTR [rcx-0x60]
   14032ca5d:	0f 11 48 90          	movups XMMWORD PTR [rax-0x70],xmm1
   14032ca61:	0f 10 49 b0          	movups xmm1,XMMWORD PTR [rcx-0x50]
   14032ca65:	0f 11 40 a0          	movups XMMWORD PTR [rax-0x60],xmm0
   14032ca69:	0f 10 41 c0          	movups xmm0,XMMWORD PTR [rcx-0x40]
   14032ca6d:	0f 11 48 b0          	movups XMMWORD PTR [rax-0x50],xmm1
   14032ca71:	0f 10 49 d0          	movups xmm1,XMMWORD PTR [rcx-0x30]
   14032ca75:	0f 11 40 c0          	movups XMMWORD PTR [rax-0x40],xmm0
   14032ca79:	0f 10 41 e0          	movups xmm0,XMMWORD PTR [rcx-0x20]
   14032ca7d:	0f 11 48 d0          	movups XMMWORD PTR [rax-0x30],xmm1
   14032ca81:	0f 10 49 f0          	movups xmm1,XMMWORD PTR [rcx-0x10]
   14032ca85:	0f 11 40 e0          	movups XMMWORD PTR [rax-0x20],xmm0
   14032ca89:	0f 11 48 f0          	movups XMMWORD PTR [rax-0x10],xmm1
   14032ca8d:	48 83 ea 01          	sub    rdx,0x1
   14032ca91:	75 ad                	jne    0x14032ca40
   14032ca93:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032ca96:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032ca9a:	0f 11 00             	movups XMMWORD PTR [rax],xmm0
   14032ca9d:	0f 10 41 20          	movups xmm0,XMMWORD PTR [rcx+0x20]
   14032caa1:	0f 11 48 10          	movups XMMWORD PTR [rax+0x10],xmm1
   14032caa5:	0f 11 40 20          	movups XMMWORD PTR [rax+0x20],xmm0
   14032caa9:	48 8b 44 24 68       	mov    rax,QWORD PTR [rsp+0x68]
   14032caae:	4d 03 ed             	add    r13,r13
   14032cab1:	48 03 44 24 70       	add    rax,QWORD PTR [rsp+0x70]
   14032cab6:	33 f6                	xor    esi,esi
   14032cab8:	48 c1 e0 04          	shl    rax,0x4
   14032cabc:	43 89 34 ef          	mov    DWORD PTR [r15+r13*8],esi
   14032cac0:	f3 42 0f 10 44 38 04 	movss  xmm0,DWORD PTR [rax+r15*1+0x4]
   14032cac7:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032caca:	f2 0f 11 85 b8 01 00 	movsd  QWORD PTR [rbp+0x1b8],xmm0
   14032cad1:	00 
   14032cad2:	f3 0f 10 85 b0 01 00 	movss  xmm0,DWORD PTR [rbp+0x1b0]
   14032cad9:	00 
   14032cada:	41 0f 2e c1          	ucomiss xmm0,xmm9
   14032cade:	7a 06                	jp     0x14032cae6
   14032cae0:	0f 84 dd 00 00 00    	je     0x14032cbc3
   14032cae6:	f3 0f 10 85 c0 01 00 	movss  xmm0,DWORD PTR [rbp+0x1c0]
   14032caed:	00 
   14032caee:	44 0f 2f e0          	comiss xmm12,xmm0
   14032caf2:	0f 87 cb 00 00 00    	ja     0x14032cbc3
   14032caf8:	e8 93 a3 01 00       	call   0x140346e90
   14032cafd:	f3 0f 11 85 c0 01 00 	movss  DWORD PTR [rbp+0x1c0],xmm0
   14032cb04:	00 
   14032cb05:	48 8d 85 b0 01 00 00 	lea    rax,[rbp+0x1b0]
   14032cb0c:	66 89 b5 c4 01 00 00 	mov    WORD PTR [rbp+0x1c4],si
   14032cb13:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032cb17:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14032cb1e:	00 00 
   14032cb20:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   14032cb23:	48 8d bf 80 00 00 00 	lea    rdi,[rdi+0x80]
   14032cb2a:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   14032cb2e:	0f 11 47 80          	movups XMMWORD PTR [rdi-0x80],xmm0
   14032cb32:	0f 10 40 20          	movups xmm0,XMMWORD PTR [rax+0x20]
   14032cb36:	0f 11 4f 90          	movups XMMWORD PTR [rdi-0x70],xmm1
   14032cb3a:	0f 10 48 30          	movups xmm1,XMMWORD PTR [rax+0x30]
   14032cb3e:	0f 11 47 a0          	movups XMMWORD PTR [rdi-0x60],xmm0
   14032cb42:	0f 10 40 40          	movups xmm0,XMMWORD PTR [rax+0x40]
   14032cb46:	0f 11 4f b0          	movups XMMWORD PTR [rdi-0x50],xmm1
   14032cb4a:	0f 10 48 50          	movups xmm1,XMMWORD PTR [rax+0x50]
   14032cb4e:	0f 11 47 c0          	movups XMMWORD PTR [rdi-0x40],xmm0
   14032cb52:	0f 10 40 60          	movups xmm0,XMMWORD PTR [rax+0x60]
   14032cb56:	0f 11 4f d0          	movups XMMWORD PTR [rdi-0x30],xmm1
   14032cb5a:	0f 10 48 70          	movups xmm1,XMMWORD PTR [rax+0x70]
   14032cb5e:	48 83 e8 80          	sub    rax,0xffffffffffffff80
   14032cb62:	0f 11 47 e0          	movups XMMWORD PTR [rdi-0x20],xmm0
   14032cb66:	0f 11 4f f0          	movups XMMWORD PTR [rdi-0x10],xmm1
   14032cb6a:	48 83 eb 01          	sub    rbx,0x1
   14032cb6e:	75 b0                	jne    0x14032cb20
   14032cb70:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   14032cb73:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   14032cb77:	0f 11 07             	movups XMMWORD PTR [rdi],xmm0
   14032cb7a:	0f 10 40 20          	movups xmm0,XMMWORD PTR [rax+0x20]
   14032cb7e:	0f 11 4f 10          	movups XMMWORD PTR [rdi+0x10],xmm1
   14032cb82:	0f 11 47 20          	movups XMMWORD PTR [rdi+0x20],xmm0
   14032cb86:	44 0f 28 a4 24 f0 06 	movaps xmm12,XMMWORD PTR [rsp+0x6f0]
   14032cb8d:	00 00 
   14032cb8f:	b0 01                	mov    al,0x1
   14032cb91:	48 8b 8d e0 05 00 00 	mov    rcx,QWORD PTR [rbp+0x5e0]
   14032cb98:	48 33 cc             	xor    rcx,rsp
   14032cb9b:	e8 60 ea 2e 00       	call   0x14061b600
   14032cba0:	0f 28 b4 24 50 07 00 	movaps xmm6,XMMWORD PTR [rsp+0x750]
   14032cba7:	00 
   14032cba8:	44 0f 28 8c 24 20 07 	movaps xmm9,XMMWORD PTR [rsp+0x720]
   14032cbaf:	00 00 
   14032cbb1:	48 81 c4 70 07 00 00 	add    rsp,0x770
   14032cbb8:	41 5f                	pop    r15
   14032cbba:	41 5e                	pop    r14
   14032cbbc:	41 5d                	pop    r13
   14032cbbe:	5f                   	pop    rdi
   14032cbbf:	5e                   	pop    rsi
   14032cbc0:	5b                   	pop    rbx
   14032cbc1:	5d                   	pop    rbp
   14032cbc2:	c3                   	ret
   14032cbc3:	33 d2                	xor    edx,edx
   14032cbc5:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032cbcb:	48 8b cf             	mov    rcx,rdi
   14032cbce:	e8 17 41 2f 00       	call   0x140620cea
   14032cbd3:	eb b1                	jmp    0x14032cb86
   14032cbd5:	32 c0                	xor    al,al
   14032cbd7:	eb b8                	jmp    0x14032cb91
   14032cbd9:	cc                   	int3
   14032cbda:	cc                   	int3
   14032cbdb:	cc                   	int3
   14032cbdc:	cc                   	int3
   14032cbdd:	cc                   	int3
   14032cbde:	cc                   	int3
   14032cbdf:	cc                   	int3
   14032cbe0:	48 8b c4             	mov    rax,rsp
   14032cbe3:	53                   	push   rbx
   14032cbe4:	55                   	push   rbp
   14032cbe5:	56                   	push   rsi
   14032cbe6:	57                   	push   rdi
   14032cbe7:	41 54                	push   r12
   14032cbe9:	41 55                	push   r13
   14032cbeb:	41 56                	push   r14
   14032cbed:	41 57                	push   r15
   14032cbef:	48 81 ec 88 05 00 00 	sub    rsp,0x588
   14032cbf6:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   14032cbfa:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   14032cbfe:	44                   	rex.R
   14032cbff:	0f                   	.byte 0xf
