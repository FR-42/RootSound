
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140614560 <.text+0x613560>:
   140614560:	f2 0f 10 09          	movsd  xmm1,QWORD PTR [rcx]
   140614564:	f2 0f 10 41 08       	movsd  xmm0,QWORD PTR [rcx+0x8]
   140614569:	e9 96 c8 00 00       	jmp    0x140620e04
   14061456e:	cc                   	int3
   14061456f:	cc                   	int3
   140614570:	cc                   	int3
   140614571:	cc                   	int3
   140614572:	cc                   	int3
   140614573:	cc                   	int3
   140614574:	cc                   	int3
   140614575:	cc                   	int3
   140614576:	cc                   	int3
   140614577:	cc                   	int3
   140614578:	cc                   	int3
   140614579:	cc                   	int3
   14061457a:	cc                   	int3
   14061457b:	cc                   	int3
   14061457c:	cc                   	int3
   14061457d:	cc                   	int3
   14061457e:	cc                   	int3
   14061457f:	cc                   	int3
   140614580:	f2 0f 10 49 08       	movsd  xmm1,QWORD PTR [rcx+0x8]
   140614585:	f2 0f 10 01          	movsd  xmm0,QWORD PTR [rcx]
   140614589:	f2 0f 59 c0          	mulsd  xmm0,xmm0
   14061458d:	f2 0f 59 c9          	mulsd  xmm1,xmm1
   140614591:	f2 0f 58 c1          	addsd  xmm0,xmm1
   140614595:	e9 22 c8 00 00       	jmp    0x140620dbc
   14061459a:	cc                   	int3
   14061459b:	cc                   	int3
   14061459c:	cc                   	int3
   14061459d:	cc                   	int3
   14061459e:	cc                   	int3
   14061459f:	cc                   	int3
   1406145a0:	85 d2                	test   edx,edx
   1406145a2:	0f 84 a0 01 00 00    	je     0x140614748
   1406145a8:	48 8b c4             	mov    rax,rsp
   1406145ab:	48 89 70 18          	mov    QWORD PTR [rax+0x18],rsi
   1406145af:	48 89 78 20          	mov    QWORD PTR [rax+0x20],rdi
   1406145b3:	41 56                	push   r14
   1406145b5:	48 81 ec 90 00 00 00 	sub    rsp,0x90
   1406145bc:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   1406145c0:	33 ff                	xor    edi,edi
   1406145c2:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6
   1406145c6:	8b f2                	mov    esi,edx
   1406145c8:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7
   1406145cc:	4c 8b f1             	mov    r14,rcx
   1406145cf:	44 0f 29 40 c8       	movaps XMMWORD PTR [rax-0x38],xmm8
   1406145d4:	44 0f 29 48 b8       	movaps XMMWORD PTR [rax-0x48],xmm9
   1406145d9:	83 fa 02             	cmp    edx,0x2
   1406145dc:	0f 82 c5 00 00 00    	jb     0x1406146a7
   1406145e2:	66 0f 6f 3d 36 be 23 	movdqa xmm7,XMMWORD PTR [rip+0x23be36]        # 0x140850420
   1406145e9:	00 
   1406145ea:	ff ca                	dec    edx
   1406145ec:	44 0f 28 05 ec c0 23 	movaps xmm8,XMMWORD PTR [rip+0x23c0ec]        # 0x1408506e0
   1406145f3:	00 
   1406145f4:	0f 57 c0             	xorps  xmm0,xmm0
   1406145f7:	48 89 68 10          	mov    QWORD PTR [rax+0x10],rbp
   1406145fb:	45 0f 57 c9          	xorps  xmm9,xmm9
   1406145ff:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   140614604:	8b ee                	mov    ebp,esi
   140614606:	44 0f 28 15 b2 35 09 	movaps xmm10,XMMWORD PTR [rip+0x935b2]        # 0x1406a7bc0
   14061460d:	00 
   14061460e:	83 e5 fe             	and    ebp,0xfffffffe
   140614611:	44 0f 29 58 98       	movaps XMMWORD PTR [rax-0x68],xmm11
   140614616:	44 0f 28 1d 02 c1 23 	movaps xmm11,XMMWORD PTR [rip+0x23c102]        # 0x140850720
   14061461d:	00 
   14061461e:	f2 48 0f 2a c2       	cvtsi2sd xmm0,rdx
   140614623:	44 0f 29 60 88       	movaps XMMWORD PTR [rax-0x78],xmm12
   140614628:	44 0f 28 25 80 c0 23 	movaps xmm12,XMMWORD PTR [rip+0x23c080]        # 0x1408506b0
   14061462f:	00 
   140614630:	0f 28 f0             	movaps xmm6,xmm0
   140614633:	66 0f 14 f6          	unpcklpd xmm6,xmm6
   140614637:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14061463e:	00 00 
   140614640:	66 0f 6e cf          	movd   xmm1,edi
   140614644:	f3 0f 7e c7          	movq   xmm0,xmm7
   140614648:	66 0f 70 c9 00       	pshufd xmm1,xmm1,0x0
   14061464d:	66 0f fe c8          	paddd  xmm1,xmm0
   140614651:	f3 0f e6 d1          	cvtdq2pd xmm2,xmm1
   140614655:	0f 28 c2             	movaps xmm0,xmm2
   140614658:	66 41 0f c2 c1 01    	cmpltpd xmm0,xmm9
   14061465e:	41 0f 54 c2          	andps  xmm0,xmm10
   140614662:	66 0f 58 c2          	addpd  xmm0,xmm2
   140614666:	66 41 0f 59 c3       	mulpd  xmm0,xmm11
   14061466b:	66 0f 5e c6          	divpd  xmm0,xmm6
   14061466f:	e8 ec 7b 00 00       	call   0x14061c260
   140614674:	41 0f 28 c8          	movaps xmm1,xmm8
   140614678:	66 0f 5c c8          	subpd  xmm1,xmm0
   14061467c:	66 41 0f 59 cc       	mulpd  xmm1,xmm12
   140614681:	41 0f 11 0c fe       	movups XMMWORD PTR [r14+rdi*8],xmm1
   140614686:	83 c7 02             	add    edi,0x2
   140614689:	3b fd                	cmp    edi,ebp
   14061468b:	72 b3                	jb     0x140614640
   14061468d:	44 0f 28 64 24 20    	movaps xmm12,XMMWORD PTR [rsp+0x20]
   140614693:	44 0f 28 5c 24 30    	movaps xmm11,XMMWORD PTR [rsp+0x30]
   140614699:	44 0f 28 54 24 40    	movaps xmm10,XMMWORD PTR [rsp+0x40]
   14061469f:	48 8b ac 24 a8 00 00 	mov    rbp,QWORD PTR [rsp+0xa8]
   1406146a6:	00 
   1406146a7:	3b fe                	cmp    edi,esi
   1406146a9:	73 67                	jae    0x140614712
   1406146ab:	f2 0f 10 3d 45 bb 23 	movsd  xmm7,QWORD PTR [rip+0x23bb45]        # 0x1408501f8
   1406146b2:	00 
   1406146b3:	8d 4e ff             	lea    ecx,[rsi-0x1]
   1406146b6:	f2 44 0f 10 05 b9 ba 	movsd  xmm8,QWORD PTR [rip+0x23bab9]        # 0x140850178
   1406146bd:	23 00 
   1406146bf:	49 8d 1c fe          	lea    rbx,[r14+rdi*8]
   1406146c3:	f2 44 0f 10 0d 5c ba 	movsd  xmm9,QWORD PTR [rip+0x23ba5c]        # 0x140850128
   1406146ca:	23 00 
   1406146cc:	0f 57 f6             	xorps  xmm6,xmm6
   1406146cf:	f2 48 0f 2a f1       	cvtsi2sd xmm6,rcx
   1406146d4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1406146d8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1406146df:	00 
   1406146e0:	0f 57 c0             	xorps  xmm0,xmm0
   1406146e3:	8b c7                	mov    eax,edi
   1406146e5:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   1406146ea:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   1406146ee:	f2 0f 5e c6          	divsd  xmm0,xmm6
   1406146f2:	e8 dd c6 00 00       	call   0x140620dd4
   1406146f7:	41 0f 28 c8          	movaps xmm1,xmm8
   1406146fb:	ff c7                	inc    edi
   1406146fd:	f2 0f 5c c8          	subsd  xmm1,xmm0
   140614701:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   140614706:	f2 0f 11 0b          	movsd  QWORD PTR [rbx],xmm1
   14061470a:	48 83 c3 08          	add    rbx,0x8
   14061470e:	3b fe                	cmp    edi,esi
   140614710:	72 ce                	jb     0x1406146e0
   140614712:	44 0f 28 44 24 60    	movaps xmm8,XMMWORD PTR [rsp+0x60]
   140614718:	4c 8d 9c 24 90 00 00 	lea    r11,[rsp+0x90]
   14061471f:	00 
   140614720:	49 8b 73 20          	mov    rsi,QWORD PTR [r11+0x20]
   140614724:	49 8b 7b 28          	mov    rdi,QWORD PTR [r11+0x28]
   140614728:	0f 28 7c 24 70       	movaps xmm7,XMMWORD PTR [rsp+0x70]
   14061472d:	0f 28 b4 24 80 00 00 	movaps xmm6,XMMWORD PTR [rsp+0x80]
   140614734:	00 
   140614735:	48 8b 9c 24 a0 00 00 	mov    rbx,QWORD PTR [rsp+0xa0]
   14061473c:	00 
   14061473d:	44 0f 28 4c 24 50    	movaps xmm9,XMMWORD PTR [rsp+0x50]
   140614743:	49 8b e3             	mov    rsp,r11
   140614746:	41 5e                	pop    r14
   140614748:	c3                   	ret
   140614749:	cc                   	int3
   14061474a:	cc                   	int3
   14061474b:	cc                   	int3
   14061474c:	cc                   	int3
   14061474d:	cc                   	int3
   14061474e:	cc                   	int3
   14061474f:	cc                   	int3
   140614750:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   140614755:	57                   	push   rdi
   140614756:	33 ff                	xor    edi,edi
   140614758:	4c 8b da             	mov    r11,rdx
   14061475b:	48 8b f1             	mov    rsi,rcx
   14061475e:	41 83 f9 04          	cmp    r9d,0x4
   140614762:	0f 82 cf 00 00 00    	jb     0x140614837
   140614768:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   14061476d:	41 8d 41 fc          	lea    eax,[r9-0x4]
   140614771:	49 8b db             	mov    rbx,r11
   140614774:	c1 e8 02             	shr    eax,0x2
   140614777:	48 2b d9             	sub    rbx,rcx
   14061477a:	4c 8d 51 08          	lea    r10,[rcx+0x8]
   14061477e:	ff c0                	inc    eax
   140614780:	49 8d 50 10          	lea    rdx,[r8+0x10]
   140614784:	8b c8                	mov    ecx,eax
   140614786:	8d 3c 85 00 00 00 00 	lea    edi,[rax*4+0x0]
   14061478d:	0f 1f 00             	nop    DWORD PTR [rax]
   140614790:	f2 41 0f 10 44 1a f8 	movsd  xmm0,QWORD PTR [r10+rbx*1-0x8]
   140614797:	4d 8d 52 40          	lea    r10,[r10+0x40]
   14061479b:	f2 0f 59 42 f0       	mulsd  xmm0,QWORD PTR [rdx-0x10]
   1406147a0:	48 8d 52 20          	lea    rdx,[rdx+0x20]
   1406147a4:	f2 41 0f 11 42 b8    	movsd  QWORD PTR [r10-0x48],xmm0
   1406147aa:	f2 42 0f 10 4c 13 c0 	movsd  xmm1,QWORD PTR [rbx+r10*1-0x40]
   1406147b1:	f2 0f 59 4a d0       	mulsd  xmm1,QWORD PTR [rdx-0x30]
   1406147b6:	f2 41 0f 11 4a c0    	movsd  QWORD PTR [r10-0x40],xmm1
   1406147bc:	f2                   	repnz
   1406147bd:	42                   	rex.X
   1406147be:	0f                   	.byte 0xf
   1406147bf:	10                   	.byte 0x10
