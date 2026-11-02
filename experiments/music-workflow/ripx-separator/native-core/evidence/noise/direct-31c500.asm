
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031c500 <.text+0x31b500>:
   14031c500:	48 8b c4             	mov    rax,rsp
   14031c503:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   14031c507:	44 89 48 20          	mov    DWORD PTR [rax+0x20],r9d
   14031c50b:	48 89 50 10          	mov    QWORD PTR [rax+0x10],rdx
   14031c50f:	55                   	push   rbp
   14031c510:	56                   	push   rsi
   14031c511:	57                   	push   rdi
   14031c512:	41 54                	push   r12
   14031c514:	41 55                	push   r13
   14031c516:	41 56                	push   r14
   14031c518:	41 57                	push   r15
   14031c51a:	48 81 ec 40 01 00 00 	sub    rsp,0x140
   14031c521:	44 0f b6 b4 24 b8 01 	movzx  r14d,BYTE PTR [rsp+0x1b8]
   14031c528:	00 00 
   14031c52a:	4c 8b e9             	mov    r13,rcx
   14031c52d:	4d 8b 18             	mov    r11,QWORD PTR [r8]
   14031c530:	41 8b f9             	mov    edi,r9d
   14031c533:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   14031c537:	41 8b f6             	mov    esi,r14d
   14031c53a:	0f 29 78 a8          	movaps XMMWORD PTR [rax-0x58],xmm7
   14031c53e:	48 8b da             	mov    rbx,rdx
   14031c541:	44 0f 29 40 98       	movaps XMMWORD PTR [rax-0x68],xmm8
   14031c546:	44 0f 29 48 88       	movaps XMMWORD PTR [rax-0x78],xmm9
   14031c54b:	44 0f 29 90 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm10
   14031c552:	ff 
   14031c553:	f3 44 0f 10 15 80 3a 	movss  xmm10,DWORD PTR [rip+0x533a80]        # 0x14084ffdc
   14031c55a:	53 00 
   14031c55c:	44 0f 29 98 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm11
   14031c563:	ff 
   14031c564:	44 0f 29 a0 58 ff ff 	movaps XMMWORD PTR [rax-0xa8],xmm12
   14031c56b:	ff 
   14031c56c:	45 0f 57 e4          	xorps  xmm12,xmm12
   14031c570:	44 0f 29 a8 48 ff ff 	movaps XMMWORD PTR [rax-0xb8],xmm13
   14031c577:	ff 
   14031c578:	f3 44 0f 10 2d af 3a 	movss  xmm13,DWORD PTR [rip+0x533aaf]        # 0x140850030
   14031c57f:	53 00 
   14031c581:	44 0f 29 b0 38 ff ff 	movaps XMMWORD PTR [rax-0xc8],xmm14
   14031c588:	ff 
   14031c589:	f3 44 0f 10 35 16 3d 	movss  xmm14,DWORD PTR [rip+0x533d16]        # 0x1408502a8
   14031c590:	53 00 
   14031c592:	44 0f 29 b8 28 ff ff 	movaps XMMWORD PTR [rax-0xd8],xmm15
   14031c599:	ff 
   14031c59a:	41 0f bf 40 0a       	movsx  eax,WORD PTR [r8+0xa]
   14031c59f:	f3 44 0f 10 3d 28 42 	movss  xmm15,DWORD PTR [rip+0x534228]        # 0x1408507d0
   14031c5a6:	53 00 
   14031c5a8:	44 2b c8             	sub    r9d,eax
   14031c5ab:	44 89 4c 24 5c       	mov    DWORD PTR [rsp+0x5c],r9d
   14031c5b0:	4c 89 5c 24 60       	mov    QWORD PTR [rsp+0x60],r11
   14031c5b5:	41 8d 49 ff          	lea    ecx,[r9-0x1]
   14031c5b9:	41 0f 44 c9          	cmove  ecx,r9d
   14031c5bd:	83 f6 01             	xor    esi,0x1
   14031c5c0:	45 33 e4             	xor    r12d,r12d
   14031c5c3:	89 4c 24 54          	mov    DWORD PTR [rsp+0x54],ecx
   14031c5c7:	41 8b c4             	mov    eax,r12d
   14031c5ca:	45 84 f6             	test   r14b,r14b
   14031c5cd:	75 07                	jne    0x14031c5d6
   14031c5cf:	41 8b 85 c0 00 00 00 	mov    eax,DWORD PTR [r13+0xc0]
   14031c5d6:	3b f0                	cmp    esi,eax
   14031c5d8:	0f 87 4f 07 00 00    	ja     0x14031cd2d
   14031c5de:	44 0f b6 94 24 b0 01 	movzx  r10d,BYTE PTR [rsp+0x1b0]
   14031c5e5:	00 00 
   14031c5e7:	41 80 f2 01          	xor    r10b,0x1
   14031c5eb:	44 88 54 24 50       	mov    BYTE PTR [rsp+0x50],r10b
   14031c5f0:	44 3a 94 24 a8 01 00 	cmp    r10b,BYTE PTR [rsp+0x1a8]
   14031c5f7:	00 
   14031c5f8:	0f 87 28 07 00 00    	ja     0x14031cd26
   14031c5fe:	83 fe 01             	cmp    esi,0x1
   14031c601:	0f 93 c0             	setae  al
   14031c604:	88 84 24 90 01 00 00 	mov    BYTE PTR [rsp+0x190],al
   14031c60b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14031c610:	88 44 24 51          	mov    BYTE PTR [rsp+0x51],al
   14031c614:	45 84 d2             	test   r10b,r10b
   14031c617:	75 15                	jne    0x14031c62e
   14031c619:	45 84 f6             	test   r14b,r14b
   14031c61c:	75 10                	jne    0x14031c62e
   14031c61e:	44 88 74 24 51       	mov    BYTE PTR [rsp+0x51],r14b
   14031c623:	83 fe 01             	cmp    esi,0x1
   14031c626:	0f 87 c5 06 00 00    	ja     0x14031ccf1
   14031c62c:	eb 77                	jmp    0x14031c6a5
   14031c62e:	83 fe 01             	cmp    esi,0x1
   14031c631:	0f 82 95 00 00 00    	jb     0x14031c6cc
   14031c637:	0f b6 84 24 a0 01 00 	movzx  eax,BYTE PTR [rsp+0x1a0]
   14031c63e:	00 
   14031c63f:	4c 8d 04 40          	lea    r8,[rax+rax*2]
   14031c643:	8b c1                	mov    eax,ecx
   14031c645:	48 6b d0 5c          	imul   rdx,rax,0x5c
   14031c649:	49 c1 e0 03          	shl    r8,0x3
   14031c64d:	49 03 d0             	add    rdx,r8
   14031c650:	41 8b c1             	mov    eax,r9d
   14031c653:	48 6b c8 5c          	imul   rcx,rax,0x5c
   14031c657:	f3 42 0f 10 4c 1a 10 	movss  xmm1,DWORD PTR [rdx+r11*1+0x10]
   14031c65e:	49 03 c8             	add    rcx,r8
   14031c661:	f3 42 0f 10 44 19 10 	movss  xmm0,DWORD PTR [rcx+r11*1+0x10]
   14031c668:	0f 2f c8             	comiss xmm1,xmm0
   14031c66b:	76 05                	jbe    0x14031c672
   14031c66d:	0f 28 d1             	movaps xmm2,xmm1
   14031c670:	eb 03                	jmp    0x14031c675
   14031c672:	0f 28 d0             	movaps xmm2,xmm0
   14031c675:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c67c:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c67f:	48 c1 e1 06          	shl    rcx,0x6
   14031c683:	0f 2f 54 01 0c       	comiss xmm2,DWORD PTR [rcx+rax*1+0xc]
   14031c688:	0f 87 94 06 00 00    	ja     0x14031cd22
   14031c68e:	0f 2f c1             	comiss xmm0,xmm1
   14031c691:	77 03                	ja     0x14031c696
   14031c693:	0f 28 c8             	movaps xmm1,xmm0
   14031c696:	f3 0f 10 44 01 08    	movss  xmm0,DWORD PTR [rcx+rax*1+0x8]
   14031c69c:	0f 2f c1             	comiss xmm0,xmm1
   14031c69f:	0f 87 40 06 00 00    	ja     0x14031cce5
   14031c6a5:	83 fe 01             	cmp    esi,0x1
   14031c6a8:	72 22                	jb     0x14031c6cc
   14031c6aa:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c6b1:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c6b4:	45 84 d2             	test   r10b,r10b
   14031c6b7:	49 8b d4             	mov    rdx,r12
   14031c6ba:	0f 94 c2             	sete   dl
   14031c6bd:	48 c1 e1 04          	shl    rcx,0x4
   14031c6c1:	48 03 ca             	add    rcx,rdx
   14031c6c4:	f3 0f 10 44 88 10    	movss  xmm0,DWORD PTR [rax+rcx*4+0x10]
   14031c6ca:	eb 17                	jmp    0x14031c6e3
   14031c6cc:	8b 05 82 da 66 00    	mov    eax,DWORD PTR [rip+0x66da82]        # 0x14098a154
   14031c6d2:	45 84 d2             	test   r10b,r10b
   14031c6d5:	0f 57 c0             	xorps  xmm0,xmm0
   14031c6d8:	49 8b d4             	mov    rdx,r12
   14031c6db:	0f 94 c2             	sete   dl
   14031c6de:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14031c6e3:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14031c6e7:	89 44 24 58          	mov    DWORD PTR [rsp+0x58],eax
   14031c6eb:	83 fe 01             	cmp    esi,0x1
   14031c6ee:	72 18                	jb     0x14031c708
   14031c6f0:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c6f7:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c6fa:	48 c1 e1 04          	shl    rcx,0x4
   14031c6fe:	48 03 ca             	add    rcx,rdx
   14031c701:	44 8b 64 88 20       	mov    r12d,DWORD PTR [rax+rcx*4+0x20]
   14031c706:	eb 07                	jmp    0x14031c70f
   14031c708:	44 8b 25 99 da 66 00 	mov    r12d,DWORD PTR [rip+0x66da99]        # 0x14098a1a8
   14031c70f:	41 8b 45 24          	mov    eax,DWORD PTR [r13+0x24]
   14031c713:	45 8b fc             	mov    r15d,r12d
   14031c716:	41 8b 4d 28          	mov    ecx,DWORD PTR [r13+0x28]
   14031c71a:	44 0f af ff          	imul   r15d,edi
   14031c71e:	8d 2c 48             	lea    ebp,[rax+rcx*2]
   14031c721:	8b 05 81 d2 61 00    	mov    eax,DWORD PTR [rip+0x61d281]        # 0x1409399a8
   14031c727:	41 0f af ec          	imul   ebp,r12d
   14031c72b:	83 f8 03             	cmp    eax,0x3
   14031c72e:	40 0f 93 c7          	setae  dil
   14031c732:	40 0f b6 d7          	movzx  edx,dil
   14031c736:	3b d0                	cmp    edx,eax
   14031c738:	0f 83 1a 03 00 00    	jae    0x14031ca58
   14031c73e:	44 0f b6 b4 24 a0 01 	movzx  r14d,BYTE PTR [rsp+0x1a0]
   14031c745:	00 00 
   14031c747:	f3 0f 10 0d 59 b3 38 	movss  xmm1,DWORD PTR [rip+0x38b359]        # 0x1406a7aa8
   14031c74e:	00 
   14031c74f:	45 8b c1             	mov    r8d,r9d
   14031c752:	49 6b c8 17          	imul   rcx,r8,0x17
   14031c756:	4b 8d 04 76          	lea    rax,[r14+r14*2]
   14031c75a:	4c 89 84 24 88 00 00 	mov    QWORD PTR [rsp+0x88],r8
   14031c761:	00 
   14031c762:	4c 8d 0c 41          	lea    r9,[rcx+rax*2]
   14031c766:	4c 89 8c 24 90 00 00 	mov    QWORD PTR [rsp+0x90],r9
   14031c76d:	00 
   14031c76e:	66 90                	xchg   ax,ax
   14031c770:	40 0f b6 c7          	movzx  eax,dil
   14031c774:	48 8d 0c c0          	lea    rcx,[rax+rax*8]
   14031c778:	8d 42 ff             	lea    eax,[rdx-0x1]
   14031c77b:	85 c0                	test   eax,eax
   14031c77d:	48 8d 1c cb          	lea    rbx,[rbx+rcx*8]
   14031c781:	b9 00 00 00 00       	mov    ecx,0x0
   14031c786:	48 89 9c 24 80 00 00 	mov    QWORD PTR [rsp+0x80],rbx
   14031c78d:	00 
   14031c78e:	0f 4e c1             	cmovle eax,ecx
   14031c791:	48 98                	cdqe
   14031c793:	4a 8d 0c 08          	lea    rcx,[rax+r9*1]
   14031c797:	f3 41 0f 10 44 8b 08 	movss  xmm0,DWORD PTR [r11+rcx*4+0x8]
   14031c79e:	0f 2f c8             	comiss xmm1,xmm0
   14031c7a1:	0f 87 87 02 00 00    	ja     0x14031ca2e
   14031c7a7:	f3 45 0f 10 1c 8b    	movss  xmm11,DWORD PTR [r11+rcx*4]
   14031c7ad:	4b 8d 0c 76          	lea    rcx,[r14+r14*2]
   14031c7b1:	49 6b c0 5c          	imul   rax,r8,0x5c
   14031c7b5:	49 03 c3             	add    rax,r11
   14031c7b8:	f3 44 0f 10 4c c8 10 	movss  xmm9,DWORD PTR [rax+rcx*8+0x10]
   14031c7bf:	45 0f 2e cc          	ucomiss xmm9,xmm12
   14031c7c3:	7a 06                	jp     0x14031c7cb
   14031c7c5:	0f 84 63 02 00 00    	je     0x14031ca2e
   14031c7cb:	44 0f 2f e0          	comiss xmm12,xmm0
   14031c7cf:	72 06                	jb     0x14031c7d7
   14031c7d1:	41 0f 28 fc          	movaps xmm7,xmm12
   14031c7d5:	eb 27                	jmp    0x14031c7fe
   14031c7d7:	f2 0f 10 0d 51 19 37 	movsd  xmm1,QWORD PTR [rip+0x371951]        # 0x14068e130
   14031c7de:	00 
   14031c7df:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c7e2:	f2 0f 5e 05 96 19 37 	divsd  xmm0,QWORD PTR [rip+0x371996]        # 0x14068e180
   14031c7e9:	00 
   14031c7ea:	e8 8b 45 30 00       	call   0x140620d7a
   14031c7ef:	0f 57 ff             	xorps  xmm7,xmm7
   14031c7f2:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   14031c7f6:	f3 0f 59 3d b2 19 37 	mulss  xmm7,DWORD PTR [rip+0x3719b2]        # 0x14068e1b0
   14031c7fd:	00 
   14031c7fe:	80 bc 24 c8 01 00 00 	cmp    BYTE PTR [rsp+0x1c8],0x0
   14031c805:	00 
   14031c806:	74 13                	je     0x14031c81b
   14031c808:	f3 41 0f 58 fa       	addss  xmm7,xmm10
   14031c80d:	f3 0f 2c c7          	cvttss2si eax,xmm7
   14031c811:	0f b7 c8             	movzx  ecx,ax
   14031c814:	66 0f 6e f9          	movd   xmm7,ecx
   14031c818:	0f 5b ff             	cvtdq2ps xmm7,xmm7
   14031c81b:	80 7c 24 51 00       	cmp    BYTE PTR [rsp+0x51],0x0
   14031c820:	0f 84 88 01 00 00    	je     0x14031c9ae
   14031c826:	8b 05 28 d9 66 00    	mov    eax,DWORD PTR [rip+0x66d928]        # 0x14098a154
   14031c82c:	0f 57 c0             	xorps  xmm0,xmm0
   14031c82f:	41 0f 28 f1          	movaps xmm6,xmm9
   14031c833:	f3 0f 59 35 a9 a9 37 	mulss  xmm6,DWORD PTR [rip+0x37a9a9]        # 0x1406971e4
   14031c83a:	00 
   14031c83b:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14031c840:	f3 0f 5e f0          	divss  xmm6,xmm0
   14031c844:	44 0f 2f f6          	comiss xmm14,xmm6
   14031c848:	76 0c                	jbe    0x14031c856
   14031c84a:	41 0f 2f f5          	comiss xmm6,xmm13
   14031c84e:	77 0a                	ja     0x14031c85a
   14031c850:	41 0f 28 f5          	movaps xmm6,xmm13
   14031c854:	eb 04                	jmp    0x14031c85a
   14031c856:	41 0f 28 f6          	movaps xmm6,xmm14
   14031c85a:	0f 28 c6             	movaps xmm0,xmm6
   14031c85d:	f3 0f 58 05 a3 b0 38 	addss  xmm0,DWORD PTR [rip+0x38b0a3]        # 0x1406a7908
   14031c864:	00 
   14031c865:	e8 f8 44 30 00       	call   0x140620d62
   14031c86a:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14031c86e:	48 63 d8             	movsxd rbx,eax
   14031c871:	66 0f 6e c8          	movd   xmm1,eax
   14031c875:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14031c878:	f3 0f 5c f1          	subss  xmm6,xmm1
   14031c87c:	41 0f 2f f4          	comiss xmm6,xmm12
   14031c880:	0f 82 81 00 00 00    	jb     0x14031c907
   14031c886:	f3 0f 5a f6          	cvtss2sd xmm6,xmm6
   14031c88a:	3d ff 00 00 00       	cmp    eax,0xff
   14031c88f:	7d 38                	jge    0x14031c8c9
   14031c891:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c898:	8d 56 ff             	lea    edx,[rsi-0x1]
   14031c89b:	48 c1 e2 06          	shl    rdx,0x6
   14031c89f:	48 8d 4b 01          	lea    rcx,[rbx+0x1]
   14031c8a3:	48 03 c9             	add    rcx,rcx
   14031c8a6:	48 8b 44 02 38       	mov    rax,QWORD PTR [rdx+rax*1+0x38]
   14031c8ab:	0f 10 04 c8          	movups xmm0,XMMWORD PTR [rax+rcx*8]
   14031c8af:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   14031c8b4:	0f 29 44 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm0
   14031c8b9:	e8 c2 7c 2f 00       	call   0x140614580
   14031c8be:	44 0f 28 c0          	movaps xmm8,xmm0
   14031c8c2:	f2 44 0f 59 c6       	mulsd  xmm8,xmm6
   14031c8c7:	eb 04                	jmp    0x14031c8cd
   14031c8c9:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031c8cd:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c8d4:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c8d7:	48 c1 e1 06          	shl    rcx,0x6
   14031c8db:	48 03 db             	add    rbx,rbx
   14031c8de:	48 8b 44 01 38       	mov    rax,QWORD PTR [rcx+rax*1+0x38]
   14031c8e3:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   14031c8e8:	0f 10 04 d8          	movups xmm0,XMMWORD PTR [rax+rbx*8]
   14031c8ec:	0f 29 44 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm0
   14031c8f1:	e8 8a 7c 2f 00       	call   0x140614580
   14031c8f6:	f2 0f 10 0d 7a 38 53 	movsd  xmm1,QWORD PTR [rip+0x53387a]        # 0x140850178
   14031c8fd:	00 
   14031c8fe:	f2 0f 5c ce          	subsd  xmm1,xmm6
   14031c902:	e9 84 00 00 00       	jmp    0x14031c98b
   14031c907:	83 f8 01             	cmp    eax,0x1
   14031c90a:	7e 43                	jle    0x14031c94f
   14031c90c:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c913:	8d 56 ff             	lea    edx,[rsi-0x1]
   14031c916:	48 c1 e2 06          	shl    rdx,0x6
   14031c91a:	48 8b cb             	mov    rcx,rbx
   14031c91d:	48 03 c9             	add    rcx,rcx
   14031c920:	48 8b 44 02 38       	mov    rax,QWORD PTR [rdx+rax*1+0x38]
   14031c925:	0f 10 44 c8 f0       	movups xmm0,XMMWORD PTR [rax+rcx*8-0x10]
   14031c92a:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   14031c92f:	0f 29 44 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm0
   14031c934:	e8 47 7c 2f 00       	call   0x140614580
   14031c939:	0f 28 ce             	movaps xmm1,xmm6
   14031c93c:	44 0f 28 c0          	movaps xmm8,xmm0
   14031c940:	41 0f 57 cf          	xorps  xmm1,xmm15
   14031c944:	f3 0f 5a c9          	cvtss2sd xmm1,xmm1
   14031c948:	f2 44 0f 59 c1       	mulsd  xmm8,xmm1
   14031c94d:	eb 04                	jmp    0x14031c953
   14031c94f:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031c953:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c95a:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c95d:	48 c1 e1 06          	shl    rcx,0x6
   14031c961:	48 03 db             	add    rbx,rbx
   14031c964:	48 8b 44 01 38       	mov    rax,QWORD PTR [rcx+rax*1+0x38]
   14031c969:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   14031c96e:	0f 10 04 d8          	movups xmm0,XMMWORD PTR [rax+rbx*8]
   14031c972:	0f 29 44 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm0
   14031c977:	e8 04 7c 2f 00       	call   0x140614580
   14031c97c:	0f 57 c9             	xorps  xmm1,xmm1
   14031c97f:	f3 0f 5a ce          	cvtss2sd xmm1,xmm6
   14031c983:	f2 0f 58 0d ed 37 53 	addsd  xmm1,QWORD PTR [rip+0x5337ed]        # 0x140850178
   14031c98a:	00 
   14031c98b:	48 8b 9c 24 80 00 00 	mov    rbx,QWORD PTR [rsp+0x80]
   14031c992:	00 
   14031c993:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14031c997:	0f 57 c9             	xorps  xmm1,xmm1
   14031c99a:	f3 0f 5a cf          	cvtss2sd xmm1,xmm7
   14031c99e:	f2 41 0f 58 c0       	addsd  xmm0,xmm8
   14031c9a3:	0f 57 ff             	xorps  xmm7,xmm7
   14031c9a6:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14031c9aa:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   14031c9ae:	44 0f 2f ef          	comiss xmm13,xmm7
   14031c9b2:	77 5d                	ja     0x14031ca11
   14031c9b4:	80 7c 24 50 00       	cmp    BYTE PTR [rsp+0x50],0x0
   14031c9b9:	75 13                	jne    0x14031c9ce
   14031c9bb:	80 bc 24 b8 01 00 00 	cmp    BYTE PTR [rsp+0x1b8],0x0
   14031c9c2:	00 
   14031c9c3:	75 09                	jne    0x14031c9ce
   14031c9c5:	41 8b 85 c0 00 00 00 	mov    eax,DWORD PTR [r13+0xc0]
   14031c9cc:	eb 02                	jmp    0x14031c9d0
   14031c9ce:	33 c0                	xor    eax,eax
   14031c9d0:	8d 0c 06             	lea    ecx,[rsi+rax*1]
   14031c9d3:	41 0f 57 ff          	xorps  xmm7,xmm15
   14031c9d7:	0f b6 84 24 c0 01 00 	movzx  eax,BYTE PTR [rsp+0x1c0]
   14031c9de:	00 
   14031c9df:	45 8b cc             	mov    r9d,r12d
   14031c9e2:	48 8b 0c cb          	mov    rcx,QWORD PTR [rbx+rcx*8]
   14031c9e6:	44 8b c5             	mov    r8d,ebp
   14031c9e9:	88 44 24 40          	mov    BYTE PTR [rsp+0x40],al
   14031c9ed:	41 8b d7             	mov    edx,r15d
   14031c9f0:	8b 44 24 58          	mov    eax,DWORD PTR [rsp+0x58]
   14031c9f4:	f3 44 0f 11 5c 24 38 	movss  DWORD PTR [rsp+0x38],xmm11
   14031c9fb:	f3 44 0f 11 4c 24 30 	movss  DWORD PTR [rsp+0x30],xmm9
   14031ca02:	f3 0f 11 7c 24 28    	movss  DWORD PTR [rsp+0x28],xmm7
   14031ca08:	89 44 24 20          	mov    DWORD PTR [rsp+0x20],eax
   14031ca0c:	e8 9f c6 ff ff       	call   0x1403190b0
   14031ca11:	4c 8b 5c 24 60       	mov    r11,QWORD PTR [rsp+0x60]
   14031ca16:	4c 8b 8c 24 90 00 00 	mov    r9,QWORD PTR [rsp+0x90]
   14031ca1d:	00 
   14031ca1e:	4c 8b 84 24 88 00 00 	mov    r8,QWORD PTR [rsp+0x88]
   14031ca25:	00 
   14031ca26:	f3 0f 10 0d 7a b0 38 	movss  xmm1,DWORD PTR [rip+0x38b07a]        # 0x1406a7aa8
   14031ca2d:	00 
   14031ca2e:	48 8b 9c 24 88 01 00 	mov    rbx,QWORD PTR [rsp+0x188]
   14031ca35:	00 
   14031ca36:	40 fe c7             	inc    dil
   14031ca39:	40 0f b6 d7          	movzx  edx,dil
   14031ca3d:	3b 15 65 cf 61 00    	cmp    edx,DWORD PTR [rip+0x61cf65]        # 0x1409399a8
   14031ca43:	0f 82 27 fd ff ff    	jb     0x14031c770
   14031ca49:	44 0f b6 54 24 50    	movzx  r10d,BYTE PTR [rsp+0x50]
   14031ca4f:	44 0f b6 b4 24 b8 01 	movzx  r14d,BYTE PTR [rsp+0x1b8]
   14031ca56:	00 00 
   14031ca58:	80 bc 24 d0 01 00 00 	cmp    BYTE PTR [rsp+0x1d0],0x0
   14031ca5f:	00 
   14031ca60:	0f 84 75 02 00 00    	je     0x14031ccdb
   14031ca66:	83 3d 3b cf 61 00 03 	cmp    DWORD PTR [rip+0x61cf3b],0x3        # 0x1409399a8
   14031ca6d:	0f 82 68 02 00 00    	jb     0x14031ccdb
   14031ca73:	41 8b c4             	mov    eax,r12d
   14031ca76:	47 8d 0c 27          	lea    r9d,[r15+r12*1]
   14031ca7a:	99                   	cdq
   14031ca7b:	45 8b c7             	mov    r8d,r15d
   14031ca7e:	2b c2                	sub    eax,edx
   14031ca80:	d1 f8                	sar    eax,1
   14031ca82:	41 3b c7             	cmp    eax,r15d
   14031ca85:	8b d0                	mov    edx,eax
   14031ca87:	44 0f 4c c0          	cmovl  r8d,eax
   14031ca8b:	41 2b e9             	sub    ebp,r9d
   14031ca8e:	3b c5                	cmp    eax,ebp
   14031ca90:	0f 4d d5             	cmovge edx,ebp
   14031ca93:	45 84 d2             	test   r10b,r10b
   14031ca96:	75 11                	jne    0x14031caa9
   14031ca98:	45 84 f6             	test   r14b,r14b
   14031ca9b:	75 0c                	jne    0x14031caa9
   14031ca9d:	41 8b 85 c0 00 00 00 	mov    eax,DWORD PTR [r13+0xc0]
   14031caa4:	45 33 e4             	xor    r12d,r12d
   14031caa7:	eb 06                	jmp    0x14031caaf
   14031caa9:	45 33 e4             	xor    r12d,r12d
   14031caac:	41 8b c4             	mov    eax,r12d
   14031caaf:	03 c6                	add    eax,esi
   14031cab1:	48 8b 7c c3 48       	mov    rdi,QWORD PTR [rbx+rax*8+0x48]
   14031cab6:	45 84 d2             	test   r10b,r10b
   14031cab9:	75 0e                	jne    0x14031cac9
   14031cabb:	45 84 f6             	test   r14b,r14b
   14031cabe:	75 09                	jne    0x14031cac9
   14031cac0:	41 8b 85 c0 00 00 00 	mov    eax,DWORD PTR [r13+0xc0]
   14031cac7:	eb 03                	jmp    0x14031cacc
   14031cac9:	41 8b c4             	mov    eax,r12d
   14031cacc:	03 c6                	add    eax,esi
   14031cace:	48 8b 9c c3 90 00 00 	mov    rbx,QWORD PTR [rbx+rax*8+0x90]
   14031cad5:	00 
   14031cad6:	45 84 d2             	test   r10b,r10b
   14031cad9:	75 0e                	jne    0x14031cae9
   14031cadb:	45 84 f6             	test   r14b,r14b
   14031cade:	75 09                	jne    0x14031cae9
   14031cae0:	41 8b 85 c0 00 00 00 	mov    eax,DWORD PTR [r13+0xc0]
   14031cae7:	eb 03                	jmp    0x14031caec
   14031cae9:	41 8b c4             	mov    eax,r12d
   14031caec:	4c 8b 9c 24 88 01 00 	mov    r11,QWORD PTR [rsp+0x188]
   14031caf3:	00 
   14031caf4:	45 2b f8             	sub    r15d,r8d
   14031caf7:	44 03 ca             	add    r9d,edx
   14031cafa:	03 c6                	add    eax,esi
   14031cafc:	41 8b c9             	mov    ecx,r9d
   14031caff:	45                   	rex.RB
