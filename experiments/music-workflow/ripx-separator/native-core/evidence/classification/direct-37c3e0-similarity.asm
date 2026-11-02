
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014037c3e0 <.text+0x37b3e0>:
   14037c3e0:	48 8b c4             	mov    rax,rsp
   14037c3e3:	48 89 58 20          	mov    QWORD PTR [rax+0x20],rbx
   14037c3e7:	f3 0f 11 50 18       	movss  DWORD PTR [rax+0x18],xmm2
   14037c3ec:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037c3f0:	55                   	push   rbp
   14037c3f1:	56                   	push   rsi
   14037c3f2:	57                   	push   rdi
   14037c3f3:	41 54                	push   r12
   14037c3f5:	41 55                	push   r13
   14037c3f7:	41 56                	push   r14
   14037c3f9:	41 57                	push   r15
   14037c3fb:	48 81 ec c0 00 00 00 	sub    rsp,0xc0
   14037c402:	44 0f b6 3a          	movzx  r15d,BYTE PTR [rdx]
   14037c406:	4c 8b f2             	mov    r14,rdx
   14037c409:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   14037c40d:	48 8b f1             	mov    rsi,rcx
   14037c410:	0f 29 78 a8          	movaps XMMWORD PTR [rax-0x58],xmm7
   14037c414:	44 0f 29 40 98       	movaps XMMWORD PTR [rax-0x68],xmm8
   14037c419:	45 0f 57 c0          	xorps  xmm8,xmm8
   14037c41d:	44 0f 29 48 88       	movaps XMMWORD PTR [rax-0x78],xmm9
   14037c422:	44 0f 29 54 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm10
   14037c428:	45 0f 57 d2          	xorps  xmm10,xmm10
   14037c42c:	44 0f 29 5c 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm11
   14037c432:	44 0f 29 64 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm12
   14037c438:	44 0f 29 6c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm13
   14037c43e:	44 0f 29 74 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm14
   14037c444:	44 0f 29 7c 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm15
   14037c44a:	45 84 ff             	test   r15b,r15b
   14037c44d:	74 2e                	je     0x14037c47d
   14037c44f:	0f 57 c0             	xorps  xmm0,xmm0
   14037c452:	45 0f b6 c7          	movzx  r8d,r15b
   14037c456:	48 8d 42 04          	lea    rax,[rdx+0x4]
   14037c45a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14037c460:	f3 44 0f 10 00       	movss  xmm8,DWORD PTR [rax]
   14037c465:	44 0f 2f c0          	comiss xmm8,xmm0
   14037c469:	77 04                	ja     0x14037c46f
   14037c46b:	44 0f 28 c0          	movaps xmm8,xmm0
   14037c46f:	48 83 c0 04          	add    rax,0x4
   14037c473:	41 0f 28 c0          	movaps xmm0,xmm8
   14037c477:	49 83 e8 01          	sub    r8,0x1
   14037c47b:	75 e3                	jne    0x14037c460
   14037c47d:	f3 44 0f 10 3d 6a 3e 	movss  xmm15,DWORD PTR [rip+0x4d3e6a]        # 0x1408502f0
   14037c484:	4d 00 
   14037c486:	48 8d 2d 23 4c 63 14 	lea    rbp,[rip+0x14634c23]        # 0x1549b10b0
   14037c48d:	44 0f b6 21          	movzx  r12d,BYTE PTR [rcx]
   14037c491:	45 0f 28 f7          	movaps xmm14,xmm15
   14037c495:	f3 44 0f 10 0d 12 1d 	movss  xmm9,DWORD PTR [rip+0x311d12]        # 0x14068e1b0
   14037c49c:	31 00 
   14037c49e:	45 32 ed             	xor    r13b,r13b
   14037c4a1:	f3 44 0f 10 2d 0e ad 	movss  xmm13,DWORD PTR [rip+0x31ad0e]        # 0x1406971b8
   14037c4a8:	31 00 
   14037c4aa:	f3 44 0f 10 25 7d 3b 	movss  xmm12,DWORD PTR [rip+0x4d3b7d]        # 0x140850030
   14037c4b1:	4d 00 
   14037c4b3:	b9 06 00 00 00       	mov    ecx,0x6
   14037c4b8:	41 0f b6 c4          	movzx  eax,r12b
   14037c4bc:	44 3a e1             	cmp    r12b,cl
   14037c4bf:	44 88 ac 24 08 01 00 	mov    BYTE PTR [rsp+0x108],r13b
   14037c4c6:	00 
   14037c4c7:	0f 42 c8             	cmovb  ecx,eax
   14037c4ca:	44 3a e9             	cmp    r13b,cl
   14037c4cd:	0f 83 ab 01 00 00    	jae    0x14037c67e
   14037c4d3:	41 0f b6 fd          	movzx  edi,r13b
   14037c4d7:	f3 44 0f 10 5c be 04 	movss  xmm11,DWORD PTR [rsi+rdi*4+0x4]
   14037c4de:	45 0f 2e da          	ucomiss xmm11,xmm10
   14037c4e2:	7a 3f                	jp     0x14037c523
   14037c4e4:	75 3d                	jne    0x14037c523
   14037c4e6:	f3 41 0f 10 44 be 04 	movss  xmm0,DWORD PTR [r14+rdi*4+0x4]
   14037c4ed:	44 0f 2f c8          	comiss xmm9,xmm0
   14037c4f1:	76 0c                	jbe    0x14037c4ff
   14037c4f3:	41 0f 2f c2          	comiss xmm0,xmm10
   14037c4f7:	77 0a                	ja     0x14037c503
   14037c4f9:	41 0f 28 c2          	movaps xmm0,xmm10
   14037c4fd:	eb 04                	jmp    0x14037c503
   14037c4ff:	41 0f 28 c1          	movaps xmm0,xmm9
   14037c503:	f3 48 0f 2c d8       	cvttss2si rbx,xmm0
   14037c508:	41 0f 28 c0          	movaps xmm0,xmm8
   14037c50c:	8b db                	mov    ebx,ebx
   14037c50e:	e8 9d be 00 00       	call   0x1403883b0
   14037c513:	f3 41 0f 5c c5       	subss  xmm0,xmm13
   14037c518:	0f 2f 44 9d 00       	comiss xmm0,DWORD PTR [rbp+rbx*4+0x0]
   14037c51d:	0f 87 53 01 00 00    	ja     0x14037c676
   14037c523:	45 3a ef             	cmp    r13b,r15b
   14037c526:	73 09                	jae    0x14037c531
   14037c528:	f3 41 0f 10 44 be 04 	movss  xmm0,DWORD PTR [r14+rdi*4+0x4]
   14037c52f:	eb 04                	jmp    0x14037c535
   14037c531:	41 0f 28 c2          	movaps xmm0,xmm10
   14037c535:	45 0f 2e da          	ucomiss xmm11,xmm10
   14037c539:	7a 06                	jp     0x14037c541
   14037c53b:	0f 84 35 01 00 00    	je     0x14037c676
   14037c541:	41 0f 2e c2          	ucomiss xmm0,xmm10
   14037c545:	7a 06                	jp     0x14037c54d
   14037c547:	0f 84 29 01 00 00    	je     0x14037c676
   14037c54d:	4c 8b ac 24 00 01 00 	mov    r13,QWORD PTR [rsp+0x100]
   14037c554:	00 
   14037c555:	40 32 ff             	xor    dil,dil
   14037c558:	45 3a e7             	cmp    r12b,r15b
   14037c55b:	49 8b c6             	mov    rax,r14
   14037c55e:	f3 44 0f 5e d8       	divss  xmm11,xmm0
   14037c563:	49 0f 43 c5          	cmovae rax,r13
   14037c567:	0f b6 28             	movzx  ebp,BYTE PTR [rax]
   14037c56a:	41 0f 28 fa          	movaps xmm7,xmm10
   14037c56e:	66 90                	xchg   ax,ax
   14037c570:	b9 10 00 00 00       	mov    ecx,0x10
   14037c575:	40 0f b6 c5          	movzx  eax,bpl
   14037c579:	40 3a e9             	cmp    bpl,cl
   14037c57c:	0f 42 c8             	cmovb  ecx,eax
   14037c57f:	40 3a f9             	cmp    dil,cl
   14037c582:	0f 83 c4 00 00 00    	jae    0x14037c64c
   14037c588:	40 0f b6 f7          	movzx  esi,dil
   14037c58c:	f3 41 0f 10 74 b5 04 	movss  xmm6,DWORD PTR [r13+rsi*4+0x4]
   14037c593:	41 0f 2e f2          	ucomiss xmm6,xmm10
   14037c597:	7a 41                	jp     0x14037c5da
   14037c599:	75 3f                	jne    0x14037c5da
   14037c59b:	f3 41 0f 10 44 b6 04 	movss  xmm0,DWORD PTR [r14+rsi*4+0x4]
   14037c5a2:	44 0f 2f c8          	comiss xmm9,xmm0
   14037c5a6:	76 0c                	jbe    0x14037c5b4
   14037c5a8:	41 0f 2f c2          	comiss xmm0,xmm10
   14037c5ac:	77 0a                	ja     0x14037c5b8
   14037c5ae:	41 0f 28 c2          	movaps xmm0,xmm10
   14037c5b2:	eb 04                	jmp    0x14037c5b8
   14037c5b4:	41 0f 28 c1          	movaps xmm0,xmm9
   14037c5b8:	f3 48 0f 2c d8       	cvttss2si rbx,xmm0
   14037c5bd:	41 0f 28 c0          	movaps xmm0,xmm8
   14037c5c1:	8b db                	mov    ebx,ebx
   14037c5c3:	e8 e8 bd 00 00       	call   0x1403883b0
   14037c5c8:	f3 41 0f 5c c5       	subss  xmm0,xmm13
   14037c5cd:	48 8d 05 dc 4a 63 14 	lea    rax,[rip+0x14634adc]        # 0x1549b10b0
   14037c5d4:	0f 2f 04 98          	comiss xmm0,DWORD PTR [rax+rbx*4]
   14037c5d8:	77 6a                	ja     0x14037c644
   14037c5da:	41 0f 28 cc          	movaps xmm1,xmm12
   14037c5de:	40 80 ff 08          	cmp    dil,0x8
   14037c5e2:	72 13                	jb     0x14037c5f7
   14037c5e4:	40 0f b6 c7          	movzx  eax,dil
   14037c5e8:	0f 57 c0             	xorps  xmm0,xmm0
   14037c5eb:	83 e8 06             	sub    eax,0x6
   14037c5ee:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14037c5f3:	f3 0f 5e c8          	divss  xmm1,xmm0
   14037c5f7:	41 3a ff             	cmp    dil,r15b
   14037c5fa:	73 40                	jae    0x14037c63c
   14037c5fc:	41 0f 28 c3          	movaps xmm0,xmm11
   14037c600:	f3 41 0f 59 44 b6 04 	mulss  xmm0,DWORD PTR [r14+rsi*4+0x4]
   14037c607:	41 3a fc             	cmp    dil,r12b
   14037c60a:	72 10                	jb     0x14037c61c
   14037c60c:	f3 0f 59 c1          	mulss  xmm0,xmm1
   14037c610:	40 fe c7             	inc    dil
   14037c613:	f3 0f 58 f8          	addss  xmm7,xmm0
   14037c617:	e9 54 ff ff ff       	jmp    0x14037c570
   14037c61c:	0f 2f f0             	comiss xmm6,xmm0
   14037c61f:	76 14                	jbe    0x14037c635
   14037c621:	f3 0f 5c f0          	subss  xmm6,xmm0
   14037c625:	40 fe c7             	inc    dil
   14037c628:	f3 0f 59 f1          	mulss  xmm6,xmm1
   14037c62c:	f3 0f 58 fe          	addss  xmm7,xmm6
   14037c630:	e9 3b ff ff ff       	jmp    0x14037c570
   14037c635:	f3 0f 5c c6          	subss  xmm0,xmm6
   14037c639:	0f 28 f0             	movaps xmm6,xmm0
   14037c63c:	f3 0f 59 f1          	mulss  xmm6,xmm1
   14037c640:	f3 0f 58 fe          	addss  xmm7,xmm6
   14037c644:	40 fe c7             	inc    dil
   14037c647:	e9 24 ff ff ff       	jmp    0x14037c570
   14037c64c:	45 0f 2e f7          	ucomiss xmm14,xmm15
   14037c650:	44 0f b6 ac 24 08 01 	movzx  r13d,BYTE PTR [rsp+0x108]
   14037c657:	00 00 
   14037c659:	7a 02                	jp     0x14037c65d
   14037c65b:	74 06                	je     0x14037c663
   14037c65d:	44 0f 2f f7          	comiss xmm14,xmm7
   14037c661:	76 04                	jbe    0x14037c667
   14037c663:	44 0f 28 f7          	movaps xmm14,xmm7
   14037c667:	48 8b b4 24 00 01 00 	mov    rsi,QWORD PTR [rsp+0x100]
   14037c66e:	00 
   14037c66f:	48 8d 2d 3a 4a 63 14 	lea    rbp,[rip+0x14634a3a]        # 0x1549b10b0
   14037c676:	41 fe c5             	inc    r13b
   14037c679:	e9 35 fe ff ff       	jmp    0x14037c4b3
   14037c67e:	f3 44 0f 10 05 49 41 	movss  xmm8,DWORD PTR [rip+0x4d4149]        # 0x1408507d0
   14037c685:	4d 00 
   14037c687:	32 c9                	xor    cl,cl
   14037c689:	f2 44 0f 10 1d 66 3b 	movsd  xmm11,QWORD PTR [rip+0x4d3b66]        # 0x1408501f8
   14037c690:	4d 00 
   14037c692:	45 3a fc             	cmp    r15b,r12b
   14037c695:	f2 44 0f 10 0d 8a 3a 	movsd  xmm9,QWORD PTR [rip+0x4d3a8a]        # 0x140850128
   14037c69c:	4d 00 
   14037c69e:	49 8b c6             	mov    rax,r14
   14037c6a1:	48 0f 43 c6          	cmovae rax,rsi
   14037c6a5:	41 0f 28 ea          	movaps xmm5,xmm10
   14037c6a9:	41 0f 28 fa          	movaps xmm7,xmm10
   14037c6ad:	44 0f b6 00          	movzx  r8d,BYTE PTR [rax]
   14037c6b1:	41 3a c8             	cmp    cl,r8b
   14037c6b4:	0f 83 af 00 00 00    	jae    0x14037c769
   14037c6ba:	0f b6 d1             	movzx  edx,cl
   14037c6bd:	f3 0f 10 44 96 04    	movss  xmm0,DWORD PTR [rsi+rdx*4+0x4]
   14037c6c3:	41 0f 2e c2          	ucomiss xmm0,xmm10
   14037c6c7:	f3 41 0f 10 64 96 04 	movss  xmm4,DWORD PTR [r14+rdx*4+0x4]
   14037c6ce:	7a 06                	jp     0x14037c6d6
   14037c6d0:	0f 84 8c 00 00 00    	je     0x14037c762
   14037c6d6:	41 0f 2e e2          	ucomiss xmm4,xmm10
   14037c6da:	7a 06                	jp     0x14037c6e2
   14037c6dc:	0f 84 80 00 00 00    	je     0x14037c762
   14037c6e2:	f3 0f 10 94 96 c4 00 	movss  xmm2,DWORD PTR [rsi+rdx*4+0xc4]
   14037c6e9:	00 00 
   14037c6eb:	f3 0f 5f e0          	maxss  xmm4,xmm0
   14037c6ef:	f3 41 0f 5c 94 96 c4 	subss  xmm2,DWORD PTR [r14+rdx*4+0xc4]
   14037c6f6:	00 00 00 
   14037c6f9:	0f 57 c0             	xorps  xmm0,xmm0
   14037c6fc:	0f b6 c1             	movzx  eax,cl
   14037c6ff:	ff c0                	inc    eax
   14037c701:	41 0f 28 cb          	movaps xmm1,xmm11
   14037c705:	0f 57 db             	xorps  xmm3,xmm3
   14037c708:	0f 5a f2             	cvtps2pd xmm6,xmm2
   14037c70b:	f2 0f 2a c0          	cvtsi2sd xmm0,eax
   14037c70f:	f2 0f 5e c8          	divsd  xmm1,xmm0
   14037c713:	f2 0f 5a d9          	cvtsd2ss xmm3,xmm1
   14037c717:	0f 5a c3             	cvtps2pd xmm0,xmm3
   14037c71a:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14037c71f:	66 0f 2f f0          	comisd xmm6,xmm0
   14037c723:	76 06                	jbe    0x14037c72b
   14037c725:	f3 0f 5c d3          	subss  xmm2,xmm3
   14037c729:	eb 1d                	jmp    0x14037c748
   14037c72b:	0f 57 c9             	xorps  xmm1,xmm1
   14037c72e:	0f 28 c3             	movaps xmm0,xmm3
   14037c731:	41 0f 57 c0          	xorps  xmm0,xmm8
   14037c735:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   14037c739:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   14037c73e:	66 0f 2f ce          	comisd xmm1,xmm6
   14037c742:	76 04                	jbe    0x14037c748
   14037c744:	f3 0f 58 d3          	addss  xmm2,xmm3
   14037c748:	44 0f 2f d2          	comiss xmm10,xmm2
   14037c74c:	76 04                	jbe    0x14037c752
   14037c74e:	41 0f 57 d0          	xorps  xmm2,xmm8
   14037c752:	f3 0f 5e d3          	divss  xmm2,xmm3
   14037c756:	f3 0f 58 fc          	addss  xmm7,xmm4
   14037c75a:	f3 0f 59 d4          	mulss  xmm2,xmm4
   14037c75e:	f3 0f 58 ea          	addss  xmm5,xmm2
   14037c762:	fe c1                	inc    cl
   14037c764:	e9 48 ff ff ff       	jmp    0x14037c6b1
   14037c769:	41 0f 2e fa          	ucomiss xmm7,xmm10
   14037c76d:	7a 02                	jp     0x14037c771
   14037c76f:	74 04                	je     0x14037c775
   14037c771:	f3 0f 5e ef          	divss  xmm5,xmm7
   14037c775:	0f b6 8e 88 01 00 00 	movzx  ecx,BYTE PTR [rsi+0x188]
   14037c77c:	f3 41 0f 58 ec       	addss  xmm5,xmm12
   14037c781:	41 0f b6 86 88 01 00 	movzx  eax,BYTE PTR [r14+0x188]
   14037c788:	00 
   14037c789:	f3 0f 10 b4 24 10 01 	movss  xmm6,DWORD PTR [rsp+0x110]
   14037c790:	00 00 
   14037c792:	f3 0f 59 35 12 c4 31 	mulss  xmm6,DWORD PTR [rip+0x31c412]        # 0x140698bac
   14037c799:	00 
   14037c79a:	66 0f 6e c1          	movd   xmm0,ecx
   14037c79e:	66 0f 6e c8          	movd   xmm1,eax
   14037c7a2:	f3 44 0f 59 f5       	mulss  xmm14,xmm5
   14037c7a7:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14037c7aa:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037c7ad:	3a c8                	cmp    cl,al
   14037c7af:	76 06                	jbe    0x14037c7b7
   14037c7b1:	f3 0f 5c c1          	subss  xmm0,xmm1
   14037c7b5:	eb 07                	jmp    0x14037c7be
   14037c7b7:	f3 0f 5c c8          	subss  xmm1,xmm0
   14037c7bb:	0f 28 c1             	movaps xmm0,xmm1
   14037c7be:	e8 3d b4 00 00       	call   0x140387c00
   14037c7c3:	44 0f 28 7c 24 20    	movaps xmm15,XMMWORD PTR [rsp+0x20]
   14037c7c9:	4c 8d 9c 24 c0 00 00 	lea    r11,[rsp+0xc0]
   14037c7d0:	00 
   14037c7d1:	49 8b 5b 58          	mov    rbx,QWORD PTR [r11+0x58]
   14037c7d5:	0f 28 ce             	movaps xmm1,xmm6
   14037c7d8:	41 0f 28 7b e0       	movaps xmm7,XMMWORD PTR [r11-0x20]
   14037c7dd:	f3 41 0f 5c ce       	subss  xmm1,xmm14
   14037c7e2:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   14037c7e7:	45 0f 28 4b c0       	movaps xmm9,XMMWORD PTR [r11-0x40]
   14037c7ec:	45 0f 28 53 b0       	movaps xmm10,XMMWORD PTR [r11-0x50]
   14037c7f1:	45 0f 28 5b a0       	movaps xmm11,XMMWORD PTR [r11-0x60]
   14037c7f6:	45 0f 28 63 90       	movaps xmm12,XMMWORD PTR [r11-0x70]
   14037c7fb:	45 0f 28 6b 80       	movaps xmm13,XMMWORD PTR [r11-0x80]
   14037c800:	44 0f 28 74 24 30    	movaps xmm14,XMMWORD PTR [rsp+0x30]
   14037c806:	f3 0f 5e ce          	divss  xmm1,xmm6
   14037c80a:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
   14037c80f:	f3 0f 59 c1          	mulss  xmm0,xmm1
   14037c813:	49 8b e3             	mov    rsp,r11
   14037c816:	41 5f                	pop    r15
   14037c818:	41 5e                	pop    r14
   14037c81a:	41 5d                	pop    r13
   14037c81c:	41 5c                	pop    r12
   14037c81e:	5f                   	pop    rdi
   14037c81f:	5e                   	pop    rsi
   14037c820:	5d                   	pop    rbp
   14037c821:	c3                   	ret
   14037c822:	cc                   	int3
   14037c823:	cc                   	int3
   14037c824:	cc                   	int3
   14037c825:	cc                   	int3
   14037c826:	cc                   	int3
   14037c827:	cc                   	int3
   14037c828:	cc                   	int3
   14037c829:	cc                   	int3
   14037c82a:	cc                   	int3
   14037c82b:	cc                   	int3
   14037c82c:	cc                   	int3
   14037c82d:	cc                   	int3
   14037c82e:	cc                   	int3
   14037c82f:	cc                   	int3
   14037c830:	0f b6 11             	movzx  edx,BYTE PTR [rcx]
   14037c833:	0f 57 c0             	xorps  xmm0,xmm0
   14037c836:	84 d2                	test   dl,dl
   14037c838:	74 15                	je     0x14037c84f
   14037c83a:	48 8d 41 04          	lea    rax,[rcx+0x4]
   14037c83e:	0f b6 ca             	movzx  ecx,dl
   14037c841:	f3 0f 58 00          	addss  xmm0,DWORD PTR [rax]
   14037c845:	48 83 c0 04          	add    rax,0x4
   14037c849:	48 83 e9 01          	sub    rcx,0x1
   14037c84d:	75 f2                	jne    0x14037c841
   14037c84f:	c3                   	ret
   14037c850:	cc                   	int3
   14037c851:	cc                   	int3
   14037c852:	cc                   	int3
   14037c853:	cc                   	int3
   14037c854:	cc                   	int3
   14037c855:	cc                   	int3
   14037c856:	cc                   	int3
   14037c857:	cc                   	int3
   14037c858:	cc                   	int3
   14037c859:	cc                   	int3
   14037c85a:	cc                   	int3
   14037c85b:	cc                   	int3
   14037c85c:	cc                   	int3
   14037c85d:	cc                   	int3
   14037c85e:	cc                   	int3
   14037c85f:	cc                   	int3
   14037c860:	40 53                	rex push rbx
   14037c862:	48 83 ec 20          	sub    rsp,0x20
   14037c866:	48 8b d9             	mov    rbx,rcx
   14037c869:	48 8b 49 10          	mov    rcx,QWORD PTR [rcx+0x10]
   14037c86d:	48 85 c9             	test   rcx,rcx
   14037c870:	74 0d                	je     0x14037c87f
   14037c872:	e8 19 b7 ff ff       	call   0x140377f90
   14037c877:	48 c7 43 10 00 00 00 	mov    QWORD PTR [rbx+0x10],0x0
   14037c87e:	00 
   14037c87f:	48 83 c4 20          	add    rsp,0x20
   14037c883:	5b                   	pop    rbx
   14037c884:	c3                   	ret
   14037c885:	cc                   	int3
   14037c886:	cc                   	int3
   14037c887:	cc                   	int3
   14037c888:	cc                   	int3
   14037c889:	cc                   	int3
   14037c88a:	cc                   	int3
   14037c88b:	cc                   	int3
   14037c88c:	cc                   	int3
   14037c88d:	cc                   	int3
   14037c88e:	cc                   	int3
   14037c88f:	cc                   	int3
   14037c890:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14037c895:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   14037c89a:	57                   	push   rdi
   14037c89b:	48 83 ec 20          	sub    rsp,0x20
   14037c89f:	48                   	rex.W
