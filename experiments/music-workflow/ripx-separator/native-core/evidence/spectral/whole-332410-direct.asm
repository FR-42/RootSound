
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140332410 <.text+0x331410>:
   140332410:	4c 8b dc             	mov    r11,rsp
   140332413:	49 89 6b 20          	mov    QWORD PTR [r11+0x20],rbp
   140332417:	57                   	push   rdi
   140332418:	41 54                	push   r12
   14033241a:	41 55                	push   r13
   14033241c:	41 56                	push   r14
   14033241e:	41 57                	push   r15
   140332420:	48 83 ec 60          	sub    rsp,0x60
   140332424:	48 8b 84 24 b0 00 00 	mov    rax,QWORD PTR [rsp+0xb0]
   14033242b:	00 
   14033242c:	4c 8b ea             	mov    r13,rdx
   14033242f:	33 d2                	xor    edx,edx
   140332431:	0f 29 74 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm6
   140332436:	45 0f b7 f9          	movzx  r15d,r9w
   14033243a:	48 89 94 24 98 00 00 	mov    QWORD PTR [rsp+0x98],rdx
   140332441:	00 
   140332442:	4d 8b f0             	mov    r14,r8
   140332445:	48 8b e9             	mov    rbp,rcx
   140332448:	c6 00 00             	mov    BYTE PTR [rax],0x0
   14033244b:	8b fa                	mov    edi,edx
   14033244d:	0f 57 f6             	xorps  xmm6,xmm6
   140332450:	44 0f b7 e2          	movzx  r12d,dx
   140332454:	66 41 3b 95 70 06 00 	cmp    dx,WORD PTR [r13+0x670]
   14033245b:	00 
   14033245c:	0f 83 25 02 00 00    	jae    0x140332687
   140332462:	49 89 5b 08          	mov    QWORD PTR [r11+0x8],rbx
   140332466:	49 89 73 18          	mov    QWORD PTR [r11+0x18],rsi
   14033246a:	0f 29 7c 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm7
   14033246f:	f2 0f 10 3d 39 e3 51 	movsd  xmm7,QWORD PTR [rip+0x51e339]        # 0x1408507b0
   140332476:	00 
   140332477:	45 0f 29 43 a8       	movaps XMMWORD PTR [r11-0x58],xmm8
   14033247c:	f3 44 0f 10 05 f7 55 	movss  xmm8,DWORD PTR [rip+0x3755f7]        # 0x1406a7a7c
   140332483:	37 00 
   140332485:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14033248c:	00 00 00 00 
   140332490:	49 8b 85 68 06 00 00 	mov    rax,QWORD PTR [r13+0x668]
   140332497:	41 0f b7 cc          	movzx  ecx,r12w
   14033249b:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   14033249f:	48 69 d9 94 0d 00 00 	imul   rbx,rcx,0xd94
   1403324a6:	49 03 9d 60 06 00 00 	add    rbx,QWORD PTR [r13+0x660]
   1403324ad:	f3 0f 10 03          	movss  xmm0,DWORD PTR [rbx]
   1403324b1:	41 0f 2f 85 30 87 04 	comiss xmm0,DWORD PTR [r13+0x48730]
   1403324b8:	00 
   1403324b9:	0f 87 4b 01 00 00    	ja     0x14033260a
   1403324bf:	80 bd 95 00 00 00 00 	cmp    BYTE PTR [rbp+0x95],0x0
   1403324c6:	75 28                	jne    0x1403324f0
   1403324c8:	80 bd 99 00 00 00 00 	cmp    BYTE PTR [rbp+0x99],0x0
   1403324cf:	75 1f                	jne    0x1403324f0
   1403324d1:	80 bd 91 00 00 00 00 	cmp    BYTE PTR [rbp+0x91],0x0
   1403324d8:	75 16                	jne    0x1403324f0
   1403324da:	80 bd 92 00 00 00 00 	cmp    BYTE PTR [rbp+0x92],0x0
   1403324e1:	75 0d                	jne    0x1403324f0
   1403324e3:	80 bd 98 00 00 00 00 	cmp    BYTE PTR [rbp+0x98],0x0
   1403324ea:	0f 84 02 01 00 00    	je     0x1403325f2
   1403324f0:	0f b7 f2             	movzx  esi,dx
   1403324f3:	66 41 3b d7          	cmp    dx,r15w
   1403324f7:	0f 83 f5 00 00 00    	jae    0x1403325f2
   1403324fd:	0f 1f 00             	nop    DWORD PTR [rax]
   140332500:	f3 0f 10 03          	movss  xmm0,DWORD PTR [rbx]
   140332504:	0f b7 c6             	movzx  eax,si
   140332507:	48 69 f8 18 3c 00 00 	imul   rdi,rax,0x3c18
   14033250e:	f3 42 0f 5e 04 37    	divss  xmm0,DWORD PTR [rdi+r14*1]
   140332514:	ff 15 56 75 35 00    	call   QWORD PTR [rip+0x357556]        # 0x140689a70
   14033251a:	0f b6 8d 99 00 00 00 	movzx  ecx,BYTE PTR [rbp+0x99]
   140332521:	f3 0f 2c d0          	cvttss2si edx,xmm0
   140332525:	84 c9                	test   cl,cl
   140332527:	75 0d                	jne    0x140332536
   140332529:	b8 03 00 00 00       	mov    eax,0x3
   14033252e:	38 8d 92 00 00 00    	cmp    BYTE PTR [rbp+0x92],cl
   140332534:	74 05                	je     0x14033253b
   140332536:	b8 02 00 00 00       	mov    eax,0x2
   14033253b:	3b d0                	cmp    edx,eax
   14033253d:	0f 8c 98 00 00 00    	jl     0x1403325db
   140332543:	f3 0f 10 03          	movss  xmm0,DWORD PTR [rbx]
   140332547:	66 0f 6e da          	movd   xmm3,edx
   14033254b:	0f 5b db             	cvtdq2ps xmm3,xmm3
   14033254e:	f3 42 0f 59 1c 37    	mulss  xmm3,DWORD PTR [rdi+r14*1]
   140332554:	f3 0f 5c c3          	subss  xmm0,xmm3
   140332558:	f3 41 0f 5e d8       	divss  xmm3,xmm8
   14033255d:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140332560:	0f 54 cf             	andps  xmm1,xmm7
   140332563:	66 0f 5a d1          	cvtpd2ps xmm2,xmm1
   140332567:	0f 2f da             	comiss xmm3,xmm2
   14033256a:	76 6f                	jbe    0x1403325db
   14033256c:	84 c9                	test   cl,cl
   14033256e:	75 08                	jne    0x140332578
   140332570:	38 8d 92 00 00 00    	cmp    BYTE PTR [rbp+0x92],cl
   140332576:	74 09                	je     0x140332581
   140332578:	80 bb 8c 0d 00 00 03 	cmp    BYTE PTR [rbx+0xd8c],0x3
   14033257f:	72 0d                	jb     0x14033258e
   140332581:	80 bb 8c 0d 00 00 01 	cmp    BYTE PTR [rbx+0xd8c],0x1
   140332588:	0f 83 ef 00 00 00    	jae    0x14033267d
   14033258e:	49 8d 8e a4 01 00 00 	lea    rcx,[r14+0x1a4]
   140332595:	48 03 cf             	add    rcx,rdi
   140332598:	f3 0f 10 09          	movss  xmm1,DWORD PTR [rcx]
   14033259c:	83 fa 04             	cmp    edx,0x4
   14033259f:	7c 2c                	jl     0x1403325cd
   1403325a1:	49 8d 86 e0 02 00 00 	lea    rax,[r14+0x2e0]
   1403325a8:	48 03 c7             	add    rax,rdi
   1403325ab:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   1403325af:	0f 2f c1             	comiss xmm0,xmm1
   1403325b2:	f3 0f 10 4b 14       	movss  xmm1,DWORD PTR [rbx+0x14]
   1403325b7:	f3 0f 10 43 34       	movss  xmm0,DWORD PTR [rbx+0x34]
   1403325bc:	48 0f 46 c1          	cmovbe rax,rcx
   1403325c0:	0f 2f c1             	comiss xmm0,xmm1
   1403325c3:	77 03                	ja     0x1403325c8
   1403325c5:	0f 28 c1             	movaps xmm0,xmm1
   1403325c8:	0f 2f 00             	comiss xmm0,DWORD PTR [rax]
   1403325cb:	eb 08                	jmp    0x1403325d5
   1403325cd:	f3 0f 10 43 14       	movss  xmm0,DWORD PTR [rbx+0x14]
   1403325d2:	0f 2f c1             	comiss xmm0,xmm1
   1403325d5:	0f 86 a2 00 00 00    	jbe    0x14033267d
   1403325db:	66 ff c6             	inc    si
   1403325de:	66 41 3b f7          	cmp    si,r15w
   1403325e2:	0f 82 18 ff ff ff    	jb     0x140332500
   1403325e8:	33 d2                	xor    edx,edx
   1403325ea:	48 8b bc 24 98 00 00 	mov    rdi,QWORD PTR [rsp+0x98]
   1403325f1:	00 
   1403325f2:	f3 0f 10 43 08       	movss  xmm0,DWORD PTR [rbx+0x8]
   1403325f7:	0f 2f c6             	comiss xmm0,xmm6
   1403325fa:	76 0e                	jbe    0x14033260a
   1403325fc:	48 8b fb             	mov    rdi,rbx
   1403325ff:	48 89 9c 24 98 00 00 	mov    QWORD PTR [rsp+0x98],rbx
   140332606:	00 
   140332607:	0f 28 f0             	movaps xmm6,xmm0
   14033260a:	66 41 ff c4          	inc    r12w
   14033260e:	66 45 3b a5 70 06 00 	cmp    r12w,WORD PTR [r13+0x670]
   140332615:	00 
   140332616:	0f 82 74 fe ff ff    	jb     0x140332490
   14033261c:	44 0f 28 44 24 30    	movaps xmm8,XMMWORD PTR [rsp+0x30]
   140332622:	0f 28 7c 24 40       	movaps xmm7,XMMWORD PTR [rsp+0x40]
   140332627:	48 8b b4 24 a0 00 00 	mov    rsi,QWORD PTR [rsp+0xa0]
   14033262e:	00 
   14033262f:	48 8b 9c 24 90 00 00 	mov    rbx,QWORD PTR [rsp+0x90]
   140332636:	00 
   140332637:	48 85 ff             	test   rdi,rdi
   14033263a:	74 4b                	je     0x140332687
   14033263c:	45 0f b7 cf          	movzx  r9d,r15w
   140332640:	4d 8b c6             	mov    r8,r14
   140332643:	48 8b d7             	mov    rdx,rdi
   140332646:	48 8b cd             	mov    rcx,rbp
   140332649:	e8 d2 eb fe ff       	call   0x140321220
   14033264e:	4d 8b ce             	mov    r9,r14
   140332651:	66 44 89 7c 24 20    	mov    WORD PTR [rsp+0x20],r15w
   140332657:	4c 8b c7             	mov    r8,rdi
   14033265a:	49 8b d5             	mov    rdx,r13
   14033265d:	48 8b cd             	mov    rcx,rbp
   140332660:	0f 28 f0             	movaps xmm6,xmm0
   140332663:	e8 58 de fe ff       	call   0x1403204c0
   140332668:	0f 2f c6             	comiss xmm0,xmm6
   14033266b:	76 0b                	jbe    0x140332678
   14033266d:	48 8b 84 24 b0 00 00 	mov    rax,QWORD PTR [rsp+0xb0]
   140332674:	00 
   140332675:	c6 00 02             	mov    BYTE PTR [rax],0x2
   140332678:	48 8b c7             	mov    rax,rdi
   14033267b:	eb 0c                	jmp    0x140332689
   14033267d:	33 d2                	xor    edx,edx
   14033267f:	89 53 08             	mov    DWORD PTR [rbx+0x8],edx
   140332682:	e9 63 ff ff ff       	jmp    0x1403325ea
   140332687:	33 c0                	xor    eax,eax
   140332689:	48 8b ac 24 a8 00 00 	mov    rbp,QWORD PTR [rsp+0xa8]
   140332690:	00 
   140332691:	0f 28 74 24 50       	movaps xmm6,XMMWORD PTR [rsp+0x50]
   140332696:	48 83 c4 60          	add    rsp,0x60
   14033269a:	41 5f                	pop    r15
   14033269c:	41 5e                	pop    r14
   14033269e:	41 5d                	pop    r13
   1403326a0:	41 5c                	pop    r12
   1403326a2:	5f                   	pop    rdi
   1403326a3:	c3                   	ret
   1403326a4:	cc                   	int3
   1403326a5:	cc                   	int3
   1403326a6:	cc                   	int3
   1403326a7:	cc                   	int3
   1403326a8:	cc                   	int3
   1403326a9:	cc                   	int3
   1403326aa:	cc                   	int3
   1403326ab:	cc                   	int3
   1403326ac:	cc                   	int3
   1403326ad:	cc                   	int3
   1403326ae:	cc                   	int3
   1403326af:	cc                   	int3
   1403326b0:	40 55                	rex push rbp
   1403326b2:	53                   	push   rbx
   1403326b3:	56                   	push   rsi
   1403326b4:	57                   	push   rdi
   1403326b5:	41 56                	push   r14
   1403326b7:	48 8d ac 24 a0 fd ff 	lea    rbp,[rsp-0x260]
   1403326be:	ff 
   1403326bf:	48 81 ec 60 03 00 00 	sub    rsp,0x360
   1403326c6:	48 8b 05 9b fa 63 00 	mov    rax,QWORD PTR [rip+0x63fa9b]        # 0x140972168
   1403326cd:	48 33 c4             	xor    rax,rsp
   1403326d0:	48 89 85 c0 01 00 00 	mov    QWORD PTR [rbp+0x1c0],rax
   1403326d7:	8b bd b8 02 00 00    	mov    edi,DWORD PTR [rbp+0x2b8]
   1403326dd:	48 8b d9             	mov    rbx,rcx
   1403326e0:	33 c9                	xor    ecx,ecx
   1403326e2:	4c 89 bc 24 58 03 00 	mov    QWORD PTR [rsp+0x358],r15
   1403326e9:	00 
   1403326ea:	45 33 d2             	xor    r10d,r10d
   1403326ed:	89 4c 24 70          	mov    DWORD PTR [rsp+0x70],ecx
   1403326f1:	4d 8b f9             	mov    r15,r9
   1403326f4:	4d 8b f0             	mov    r14,r8
   1403326f7:	48 8b f2             	mov    rsi,rdx
   1403326fa:	83 ff 04             	cmp    edi,0x4
   1403326fd:	0f 82 99 00 00 00    	jb     0x14033279c
   140332703:	8d 47 fc             	lea    eax,[rdi-0x4]
   140332706:	49 8d 50 0c          	lea    rdx,[r8+0xc]
   14033270a:	c1 e8 02             	shr    eax,0x2
   14033270d:	45 33 c0             	xor    r8d,r8d
   140332710:	44 8d 49 02          	lea    r9d,[rcx+0x2]
   140332714:	ff c0                	inc    eax
   140332716:	44 8b d8             	mov    r11d,eax
   140332719:	44 8d 14 85 00 00 00 	lea    r10d,[rax*4+0x0]
   140332720:	00 
   140332721:	8b 42 0c             	mov    eax,DWORD PTR [rdx+0xc]
   140332724:	42 89 44 05 80       	mov    DWORD PTR [rbp+r8*1-0x80],eax
   140332729:	8b 02                	mov    eax,DWORD PTR [rdx]
   14033272b:	42 89 44 05 40       	mov    DWORD PTR [rbp+r8*1+0x40],eax
   140332730:	85 c0                	test   eax,eax
   140332732:	78 04                	js     0x140332738
   140332734:	41 8d 49 ff          	lea    ecx,[r9-0x1]
   140332738:	8b 42 2c             	mov    eax,DWORD PTR [rdx+0x2c]
   14033273b:	42 89 44 05 84       	mov    DWORD PTR [rbp+r8*1-0x7c],eax
   140332740:	8b 42 20             	mov    eax,DWORD PTR [rdx+0x20]
   140332743:	85 c0                	test   eax,eax
   140332745:	42 89 44 05 44       	mov    DWORD PTR [rbp+r8*1+0x44],eax
   14033274a:	8b 42 4c             	mov    eax,DWORD PTR [rdx+0x4c]
   14033274d:	41 0f 49 c9          	cmovns ecx,r9d
   140332751:	42 89 44 05 88       	mov    DWORD PTR [rbp+r8*1-0x78],eax
   140332756:	8b 42 40             	mov    eax,DWORD PTR [rdx+0x40]
   140332759:	89 4c 24 70          	mov    DWORD PTR [rsp+0x70],ecx
   14033275d:	42 89 44 05 48       	mov    DWORD PTR [rbp+r8*1+0x48],eax
   140332762:	85 c0                	test   eax,eax
   140332764:	78 08                	js     0x14033276e
   140332766:	41 8d 49 01          	lea    ecx,[r9+0x1]
   14033276a:	89 4c 24 70          	mov    DWORD PTR [rsp+0x70],ecx
   14033276e:	8b 42 6c             	mov    eax,DWORD PTR [rdx+0x6c]
   140332771:	42 89 44 05 8c       	mov    DWORD PTR [rbp+r8*1-0x74],eax
   140332776:	8b 42 60             	mov    eax,DWORD PTR [rdx+0x60]
   140332779:	42 89 44 05 4c       	mov    DWORD PTR [rbp+r8*1+0x4c],eax
   14033277e:	85 c0                	test   eax,eax
   140332780:	78 08                	js     0x14033278a
   140332782:	41 8d 49 02          	lea    ecx,[r9+0x2]
   140332786:	89 4c 24 70          	mov    DWORD PTR [rsp+0x70],ecx
   14033278a:	48 83 ea 80          	sub    rdx,0xffffffffffffff80
   14033278e:	49 83 c0 10          	add    r8,0x10
   140332792:	41 83 c1 04          	add    r9d,0x4
   140332796:	49 83 eb 01          	sub    r11,0x1
   14033279a:	75 85                	jne    0x140332721
   14033279c:	44 3b d7             	cmp    r10d,edi
   14033279f:	73 3f                	jae    0x1403327e0
   1403327a1:	41 8b c2             	mov    eax,r10d
   1403327a4:	49 8d 56 0c          	lea    rdx,[r14+0xc]
   1403327a8:	48 c1 e0 05          	shl    rax,0x5
   1403327ac:	4a 8d 0c 95 00 00 00 	lea    rcx,[r10*4+0x0]
   1403327b3:	00 
   1403327b4:	48 03 d0             	add    rdx,rax
   1403327b7:	8b 42 0c             	mov    eax,DWORD PTR [rdx+0xc]
   1403327ba:	89 44 0d 80          	mov    DWORD PTR [rbp+rcx*1-0x80],eax
   1403327be:	8b 02                	mov    eax,DWORD PTR [rdx]
   1403327c0:	89 44 0d 40          	mov    DWORD PTR [rbp+rcx*1+0x40],eax
   1403327c4:	85 c0                	test   eax,eax
   1403327c6:	78 08                	js     0x1403327d0
   1403327c8:	41 8d 42 01          	lea    eax,[r10+0x1]
   1403327cc:	89 44 24 70          	mov    DWORD PTR [rsp+0x70],eax
   1403327d0:	48 83 c2 20          	add    rdx,0x20
   1403327d4:	48 83 c1 04          	add    rcx,0x4
   1403327d8:	41 ff c2             	inc    r10d
   1403327db:	44 3b d7             	cmp    r10d,edi
   1403327de:	72 d7                	jb     0x1403327b7
   1403327e0:	85 ff                	test   edi,edi
   1403327e2:	75 0b                	jne    0x1403327ef
   1403327e4:	f3 41 0f 10 46 18    	movss  xmm0,DWORD PTR [r14+0x18]
   1403327ea:	f3 0f 11 45 80       	movss  DWORD PTR [rbp-0x80],xmm0
   1403327ef:	f3 41 0f 10 46 04    	movss  xmm0,DWORD PTR [r14+0x4]
   1403327f5:	48 8d 44 24 70       	lea    rax,[rsp+0x70]
   1403327fa:	f3 41 0f 10 0e       	movss  xmm1,DWORD PTR [r14]
   1403327ff:	4d 8b c7             	mov    r8,r15
   140332802:	44 0f b7 8d b0 02 00 	movzx  r9d,WORD PTR [rbp+0x2b0]
   140332809:	00 
   14033280a:	48 8b d6             	mov    rdx,rsi
   14033280d:	48 89 44 24 68       	mov    QWORD PTR [rsp+0x68],rax
   140332812:	48 8b cb             	mov    rcx,rbx
   140332815:	41 0f b7 86 90 0d 00 	movzx  eax,WORD PTR [r14+0xd90]
   14033281c:	00 
   14033281d:	c7 44 24 60 30 00 00 	mov    DWORD PTR [rsp+0x60],0x30
   140332824:	00 
   140332825:	c7 44 24 58 00 00 00 	mov    DWORD PTR [rsp+0x58],0x0
   14033282c:	00 
   14033282d:	66 89 44 24 50       	mov    WORD PTR [rsp+0x50],ax
   140332832:	48 8d 85 00 01 00 00 	lea    rax,[rbp+0x100]
   140332839:	f3 0f 11 44 24 48    	movss  DWORD PTR [rsp+0x48],xmm0
   14033283f:	f3 0f 11 4c 24 40    	movss  DWORD PTR [rsp+0x40],xmm1
   140332845:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   14033284a:	48 8d 45 40          	lea    rax,[rbp+0x40]
   14033284e:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   140332853:	48 8d 45 80          	lea    rax,[rbp-0x80]
   140332857:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14033285c:	48 8d 85 00 01 00 00 	lea    rax,[rbp+0x100]
   140332863:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140332868:	e8 b3 31 01 00       	call   0x140345a20
   14033286d:	4c 8b bc 24 58 03 00 	mov    r15,QWORD PTR [rsp+0x358]
   140332874:	00 
   140332875:	83 ff 30             	cmp    edi,0x30
   140332878:	0f 83 a5 01 00 00    	jae    0x140332a23
   14033287e:	0f 29 b4 24 40 03 00 	movaps XMMWORD PTR [rsp+0x340],xmm6
   140332885:	00 
   140332886:	49 8d 5e 1c          	lea    rbx,[r14+0x1c]
   14033288a:	0f 29 bc 24 30 03 00 	movaps XMMWORD PTR [rsp+0x330],xmm7
   140332891:	00 
   140332892:	48 8d 34 bd 00 00 00 	lea    rsi,[rdi*4+0x0]
   140332899:	00 
   14033289a:	f3 0f 10 3d 06 da 51 	movss  xmm7,DWORD PTR [rip+0x51da06]        # 0x1408502a8
   1403328a1:	00 
   1403328a2:	48 8b c7             	mov    rax,rdi
   1403328a5:	44 0f 29 84 24 20 03 	movaps XMMWORD PTR [rsp+0x320],xmm8
   1403328ac:	00 00 
   1403328ae:	0f 57 f6             	xorps  xmm6,xmm6
   1403328b1:	f3 44 0f 10 05 76 d7 	movss  xmm8,DWORD PTR [rip+0x51d776]        # 0x140850030
   1403328b8:	51 00 
   1403328ba:	44 0f 29 8c 24 10 03 	movaps XMMWORD PTR [rsp+0x310],xmm9
   1403328c1:	00 00 
   1403328c3:	f2 44 0f 10 0d 84 b8 	movsd  xmm9,QWORD PTR [rip+0x35b884]        # 0x14068e150
   1403328ca:	35 00 
   1403328cc:	44 0f 29 94 24 00 03 	movaps XMMWORD PTR [rsp+0x300],xmm10
   1403328d3:	00 00 
   1403328d5:	f2 44 0f 10 15 92 b8 	movsd  xmm10,QWORD PTR [rip+0x35b892]        # 0x14068e170
   1403328dc:	35 00 
   1403328de:	44 0f 29 9c 24 f0 02 	movaps XMMWORD PTR [rsp+0x2f0],xmm11
   1403328e5:	00 00 
   1403328e7:	f2 44 0f 10 1d 50 b8 	movsd  xmm11,QWORD PTR [rip+0x35b850]        # 0x14068e140
   1403328ee:	35 00 
   1403328f0:	44 0f 29 a4 24 e0 02 	movaps XMMWORD PTR [rsp+0x2e0],xmm12
   1403328f7:	00 00 
   1403328f9:	f2 44 0f 10 25 16 b8 	movsd  xmm12,QWORD PTR [rip+0x35b816]        # 0x14068e118
   140332900:	35 00 
   140332902:	48 c1 e0 05          	shl    rax,0x5
   140332906:	44 0f 29 ac 24 d0 02 	movaps XMMWORD PTR [rsp+0x2d0],xmm13
   14033290d:	00 00 
   14033290f:	48 03 d8             	add    rbx,rax
   140332912:	f2 44 0f 10 2d 1d b8 	movsd  xmm13,QWORD PTR [rip+0x35b81d]        # 0x14068e138
   140332919:	35 00 
   14033291b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140332920:	f3 0f 10 84 35 00 01 	movss  xmm0,DWORD PTR [rbp+rsi*1+0x100]
   140332927:	00 00 
   140332929:	8b 44 35 40          	mov    eax,DWORD PTR [rbp+rsi*1+0x40]
   14033292d:	f3 0f 11 43 f8       	movss  DWORD PTR [rbx-0x8],xmm0
   140332932:	f3 0f 11 03          	movss  DWORD PTR [rbx],xmm0
   140332936:	f3 0f 10 44 35 80    	movss  xmm0,DWORD PTR [rbp+rsi*1-0x80]
   14033293c:	0f 2e c6             	ucomiss xmm0,xmm6
   14033293f:	89 43 f0             	mov    DWORD PTR [rbx-0x10],eax
   140332942:	c7 43 f4 ff ff ff ff 	mov    DWORD PTR [rbx-0xc],0xffffffff
   140332949:	f3 0f 11 43 fc       	movss  DWORD PTR [rbx-0x4],xmm0
   14033294e:	7a 7a                	jp     0x1403329ca
   140332950:	75 78                	jne    0x1403329ca
   140332952:	f3 41 0f 10 56 04    	movss  xmm2,DWORD PTR [r14+0x4]
   140332958:	8d 4f 01             	lea    ecx,[rdi+0x1]
   14033295b:	0f 2f d6             	comiss xmm2,xmm6
   14033295e:	0f 57 c9             	xorps  xmm1,xmm1
   140332961:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   140332966:	0f 28 c1             	movaps xmm0,xmm1
   140332969:	f3 41 0f 59 06       	mulss  xmm0,DWORD PTR [r14]
   14033296e:	76 18                	jbe    0x140332988
   140332970:	f3 0f 59 c9          	mulss  xmm1,xmm1
   140332974:	f3 41 0f 5c c8       	subss  xmm1,xmm8
   140332979:	f3 0f 59 ca          	mulss  xmm1,xmm2
   14033297d:	f3 41 0f 58 c8       	addss  xmm1,xmm8
   140332982:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140332986:	eb 03                	jmp    0x14033298b
   140332988:	0f 28 c8             	movaps xmm1,xmm0
   14033298b:	f3 0f 10 05 15 e7 67 	movss  xmm0,DWORD PTR [rip+0x1467e715]        # 0x1549b10a8
   140332992:	14 
   140332993:	0f 2f c1             	comiss xmm0,xmm1
   140332996:	76 2a                	jbe    0x1403329c2
   140332998:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14033299b:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   1403329a0:	f2 41 0f 5e c2       	divsd  xmm0,xmm10
   1403329a5:	e8 ca e3 2e 00       	call   0x140620d74
   1403329aa:	f2 41 0f 59 c3       	mulsd  xmm0,xmm11
   1403329af:	0f 57 c9             	xorps  xmm1,xmm1
   1403329b2:	f2 41 0f 5e c4       	divsd  xmm0,xmm12
   1403329b7:	f2 41 0f 58 c5       	addsd  xmm0,xmm13
   1403329bc:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   1403329c0:	eb 03                	jmp    0x1403329c5
   1403329c2:	0f 28 cf             	movaps xmm1,xmm7
   1403329c5:	f3 0f 11 4b fc       	movss  DWORD PTR [rbx-0x4],xmm1
   1403329ca:	ff c7                	inc    edi
   1403329cc:	48 83 c6 04          	add    rsi,0x4
   1403329d0:	48 83 c3 20          	add    rbx,0x20
   1403329d4:	83 ff 30             	cmp    edi,0x30
   1403329d7:	0f 82 43 ff ff ff    	jb     0x140332920
   1403329dd:	44 0f 28 ac 24 d0 02 	movaps xmm13,XMMWORD PTR [rsp+0x2d0]
   1403329e4:	00 00 
   1403329e6:	44 0f 28 a4 24 e0 02 	movaps xmm12,XMMWORD PTR [rsp+0x2e0]
   1403329ed:	00 00 
   1403329ef:	44 0f 28 9c 24 f0 02 	movaps xmm11,XMMWORD PTR [rsp+0x2f0]
   1403329f6:	00 00 
   1403329f8:	44 0f 28 94 24 00 03 	movaps xmm10,XMMWORD PTR [rsp+0x300]
   1403329ff:	00 00 
   140332a01:	44 0f 28 8c 24 10 03 	movaps xmm9,XMMWORD PTR [rsp+0x310]
   140332a08:	00 00 
   140332a0a:	44 0f 28 84 24 20 03 	movaps xmm8,XMMWORD PTR [rsp+0x320]
   140332a11:	00 00 
   140332a13:	0f 28 bc 24 30 03 00 	movaps xmm7,XMMWORD PTR [rsp+0x330]
   140332a1a:	00 
   140332a1b:	0f 28 b4 24 40 03 00 	movaps xmm6,XMMWORD PTR [rsp+0x340]
   140332a22:	00 
   140332a23:	0f b6 44 24 70       	movzx  eax,BYTE PTR [rsp+0x70]
   140332a28:	41 88 86 92 0d 00 00 	mov    BYTE PTR [r14+0xd92],al
   140332a2f:	48 8b 8d c0 01 00 00 	mov    rcx,QWORD PTR [rbp+0x1c0]
   140332a36:	48 33 cc             	xor    rcx,rsp
   140332a39:	e8 c2 8b 2e 00       	call   0x14061b600
   140332a3e:	48 81 c4 60 03 00 00 	add    rsp,0x360
   140332a45:	41 5e                	pop    r14
   140332a47:	5f                   	pop    rdi
   140332a48:	5e                   	pop    rsi
   140332a49:	5b                   	pop    rbx
   140332a4a:	5d                   	pop    rbp
   140332a4b:	c3                   	ret
   140332a4c:	cc                   	int3
   140332a4d:	cc                   	int3
   140332a4e:	cc                   	int3
   140332a4f:	cc                   	int3
   140332a50:	cc                   	int3
   140332a51:	cc                   	int3
   140332a52:	cc                   	int3
   140332a53:	cc                   	int3
   140332a54:	cc                   	int3
   140332a55:	cc                   	int3
   140332a56:	cc                   	int3
   140332a57:	cc                   	int3
   140332a58:	cc                   	int3
   140332a59:	cc                   	int3
   140332a5a:	cc                   	int3
   140332a5b:	cc                   	int3
   140332a5c:	cc                   	int3
   140332a5d:	cc                   	int3
   140332a5e:	cc                   	int3
   140332a5f:	cc                   	int3
   140332a60:	48 83 ec 68          	sub    rsp,0x68
   140332a64:	0f b7 91 70 06 00 00 	movzx  edx,WORD PTR [rcx+0x670]
   140332a6b:	b8 00 0c 00 00       	mov    eax,0xc00
   140332a70:	66 3b d0             	cmp    dx,ax
   140332a73:	72 07                	jb     0x140332a7c
   140332a75:	33 c0                	xor    eax,eax
   140332a77:	48 83 c4 68          	add    rsp,0x68
   140332a7b:	c3                   	ret
   140332a7c:	48 89 5c 24 70       	mov    QWORD PTR [rsp+0x70],rbx
   140332a81:	8d 42 01             	lea    eax,[rdx+0x1]
   140332a84:	48 89 6c 24 78       	mov    QWORD PTR [rsp+0x78],rbp
   140332a89:	66 89 81 70 06 00 00 	mov    WORD PTR [rcx+0x670],ax
   140332a90:	48 89 b4 24 80 00 00 	mov    QWORD PTR [rsp+0x80],rsi
   140332a97:	00 
   140332a98:	48 89 7c 24 60       	mov    QWORD PTR [rsp+0x60],rdi
   140332a9d:	0f 29 74 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm6
   140332aa2:	0f 57 f6             	xorps  xmm6,xmm6
   140332aa5:	0f 29 7c 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm7
   140332aaa:	f2 0f 10 3d 8e b6 35 	movsd  xmm7,QWORD PTR [rip+0x35b68e]        # 0x14068e140
   140332ab1:	00 
   140332ab2:	f3 0f 5a f1          	cvtss2sd xmm6,xmm1
   140332ab6:	0f b7 c2             	movzx  eax,dx
   140332ab9:	48 69 d8 94 0d 00 00 	imul   rbx,rax,0xd94
   140332ac0:	f2 0f 59 35 88 b6 35 	mulsd  xmm6,QWORD PTR [rip+0x35b688]        # 0x14068e150
   140332ac7:	00 
   140332ac8:	44 0f 29 44 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm8
   140332ace:	f2 44 0f 10 05 41 b6 	movsd  xmm8,QWORD PTR [rip+0x35b641]        # 0x14068e118
   140332ad5:	35 00 
   140332ad7:	44 0f 29 4c 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm9
   140332add:	48 03 99 60 06 00 00 	add    rbx,QWORD PTR [rcx+0x660]
   140332ae4:	f2 0f 5e 35 84 b6 35 	divsd  xmm6,QWORD PTR [rip+0x35b684]        # 0x14068e170
   140332aeb:	00 
   140332aec:	33 ed                	xor    ebp,ebp
   140332aee:	8b fd                	mov    edi,ebp
   140332af0:	89 6b 08             	mov    DWORD PTR [rbx+0x8],ebp
   140332af3:	66 44 89 8b 90 0d 00 	mov    WORD PTR [rbx+0xd90],r9w
   140332afa:	00 
   140332afb:	40 88 ab 92 0d 00 00 	mov    BYTE PTR [rbx+0xd92],bpl
   140332b02:	f2 44 0f 10 0d 2d b6 	movsd  xmm9,QWORD PTR [rip+0x35b62d]        # 0x14068e138
   140332b09:	35 00 
   140332b0b:	f3 0f 11 0b          	movss  DWORD PTR [rbx],xmm1
   140332b0f:	f3 0f 11 53 04       	movss  DWORD PTR [rbx+0x4],xmm2
   140332b14:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140332b18:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140332b1f:	00 
   140332b20:	8b f7                	mov    esi,edi
   140332b22:	48 c1 e6 05          	shl    rsi,0x5
   140332b26:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332b2a:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332b2e:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332b35:	ff ff 
   140332b37:	85 ff                	test   edi,edi
   140332b39:	75 1f                	jne    0x140332b5a
   140332b3b:	0f 28 c6             	movaps xmm0,xmm6
   140332b3e:	e8 31 e2 2e 00       	call   0x140620d74
   140332b43:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332b47:	0f 57 c9             	xorps  xmm1,xmm1
   140332b4a:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332b4f:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332b54:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332b58:	eb 03                	jmp    0x140332b5d
   140332b5a:	0f 57 c9             	xorps  xmm1,xmm1
   140332b5d:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332b63:	8d 47 01             	lea    eax,[rdi+0x1]
   140332b66:	8b f0                	mov    esi,eax
   140332b68:	48 c1 e6 05          	shl    rsi,0x5
   140332b6c:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332b70:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332b74:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332b7b:	ff ff 
   140332b7d:	85 c0                	test   eax,eax
   140332b7f:	75 1f                	jne    0x140332ba0
   140332b81:	0f 28 c6             	movaps xmm0,xmm6
   140332b84:	e8 eb e1 2e 00       	call   0x140620d74
   140332b89:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332b8d:	0f 57 c9             	xorps  xmm1,xmm1
   140332b90:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332b95:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332b9a:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332b9e:	eb 03                	jmp    0x140332ba3
   140332ba0:	0f 57 c9             	xorps  xmm1,xmm1
   140332ba3:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332ba9:	8d 47 02             	lea    eax,[rdi+0x2]
   140332bac:	8b f0                	mov    esi,eax
   140332bae:	48 c1 e6 05          	shl    rsi,0x5
   140332bb2:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332bb6:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332bba:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332bc1:	ff ff 
   140332bc3:	85 c0                	test   eax,eax
   140332bc5:	75 1f                	jne    0x140332be6
   140332bc7:	0f 28 c6             	movaps xmm0,xmm6
   140332bca:	e8 a5 e1 2e 00       	call   0x140620d74
   140332bcf:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332bd3:	0f 57 c9             	xorps  xmm1,xmm1
   140332bd6:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332bdb:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332be0:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332be4:	eb 03                	jmp    0x140332be9
   140332be6:	0f 57 c9             	xorps  xmm1,xmm1
   140332be9:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332bef:	8d 47 03             	lea    eax,[rdi+0x3]
   140332bf2:	8b f0                	mov    esi,eax
   140332bf4:	48 c1 e6 05          	shl    rsi,0x5
   140332bf8:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332bfc:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332c00:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332c07:	ff ff 
   140332c09:	85 c0                	test   eax,eax
   140332c0b:	75 1f                	jne    0x140332c2c
   140332c0d:	0f 28 c6             	movaps xmm0,xmm6
   140332c10:	e8 5f e1 2e 00       	call   0x140620d74
   140332c15:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332c19:	0f 57 c9             	xorps  xmm1,xmm1
   140332c1c:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332c21:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332c26:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332c2a:	eb 03                	jmp    0x140332c2f
   140332c2c:	0f 57 c9             	xorps  xmm1,xmm1
   140332c2f:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332c35:	8d 47 04             	lea    eax,[rdi+0x4]
   140332c38:	8b f0                	mov    esi,eax
   140332c3a:	48 c1 e6 05          	shl    rsi,0x5
   140332c3e:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332c42:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332c46:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332c4d:	ff ff 
   140332c4f:	85 c0                	test   eax,eax
   140332c51:	75 1f                	jne    0x140332c72
   140332c53:	0f 28 c6             	movaps xmm0,xmm6
   140332c56:	e8 19 e1 2e 00       	call   0x140620d74
   140332c5b:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332c5f:	0f 57 c9             	xorps  xmm1,xmm1
   140332c62:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332c67:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332c6c:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332c70:	eb 03                	jmp    0x140332c75
   140332c72:	0f 57 c9             	xorps  xmm1,xmm1
   140332c75:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332c7b:	8d 47 05             	lea    eax,[rdi+0x5]
   140332c7e:	8b f0                	mov    esi,eax
   140332c80:	48 c1 e6 05          	shl    rsi,0x5
   140332c84:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332c88:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332c8c:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332c93:	ff ff 
   140332c95:	85 c0                	test   eax,eax
   140332c97:	75 1f                	jne    0x140332cb8
   140332c99:	0f 28 c6             	movaps xmm0,xmm6
   140332c9c:	e8 d3 e0 2e 00       	call   0x140620d74
   140332ca1:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332ca5:	0f 57 c9             	xorps  xmm1,xmm1
   140332ca8:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332cad:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332cb2:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332cb6:	eb 03                	jmp    0x140332cbb
   140332cb8:	0f 57 c9             	xorps  xmm1,xmm1
   140332cbb:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332cc1:	8d 47 06             	lea    eax,[rdi+0x6]
   140332cc4:	8b f0                	mov    esi,eax
   140332cc6:	48 c1 e6 05          	shl    rsi,0x5
   140332cca:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332cce:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332cd2:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332cd9:	ff ff 
   140332cdb:	85 c0                	test   eax,eax
   140332cdd:	75 1f                	jne    0x140332cfe
   140332cdf:	0f 28 c6             	movaps xmm0,xmm6
   140332ce2:	e8 8d e0 2e 00       	call   0x140620d74
   140332ce7:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332ceb:	0f 57 c9             	xorps  xmm1,xmm1
   140332cee:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332cf3:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332cf8:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332cfc:	eb 03                	jmp    0x140332d01
   140332cfe:	0f 57 c9             	xorps  xmm1,xmm1
   140332d01:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332d07:	8d 47 07             	lea    eax,[rdi+0x7]
   140332d0a:	8b f0                	mov    esi,eax
   140332d0c:	48 c1 e6 05          	shl    rsi,0x5
   140332d10:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332d14:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332d18:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332d1f:	ff ff 
   140332d21:	85 c0                	test   eax,eax
   140332d23:	75 1f                	jne    0x140332d44
   140332d25:	0f 28 c6             	movaps xmm0,xmm6
   140332d28:	e8 47 e0 2e 00       	call   0x140620d74
   140332d2d:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332d31:	0f 57 c9             	xorps  xmm1,xmm1
   140332d34:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332d39:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332d3e:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332d42:	eb 03                	jmp    0x140332d47
   140332d44:	0f 57 c9             	xorps  xmm1,xmm1
   140332d47:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332d4d:	8d 47 08             	lea    eax,[rdi+0x8]
   140332d50:	8b f0                	mov    esi,eax
   140332d52:	48 c1 e6 05          	shl    rsi,0x5
   140332d56:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332d5a:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332d5e:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332d65:	ff ff 
   140332d67:	85 c0                	test   eax,eax
   140332d69:	75 1f                	jne    0x140332d8a
   140332d6b:	0f 28 c6             	movaps xmm0,xmm6
   140332d6e:	e8 01 e0 2e 00       	call   0x140620d74
   140332d73:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332d77:	0f 57 c9             	xorps  xmm1,xmm1
   140332d7a:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332d7f:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332d84:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332d88:	eb 03                	jmp    0x140332d8d
   140332d8a:	0f 57 c9             	xorps  xmm1,xmm1
   140332d8d:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332d93:	8d 47 09             	lea    eax,[rdi+0x9]
   140332d96:	8b f0                	mov    esi,eax
   140332d98:	48 c1 e6 05          	shl    rsi,0x5
   140332d9c:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332da0:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332da4:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332dab:	ff ff 
   140332dad:	85 c0                	test   eax,eax
   140332daf:	75 1f                	jne    0x140332dd0
   140332db1:	0f 28 c6             	movaps xmm0,xmm6
   140332db4:	e8 bb df 2e 00       	call   0x140620d74
   140332db9:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332dbd:	0f 57 c9             	xorps  xmm1,xmm1
   140332dc0:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332dc5:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332dca:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332dce:	eb 03                	jmp    0x140332dd3
   140332dd0:	0f 57 c9             	xorps  xmm1,xmm1
   140332dd3:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332dd9:	8d 47 0a             	lea    eax,[rdi+0xa]
   140332ddc:	8b f0                	mov    esi,eax
   140332dde:	48 c1 e6 05          	shl    rsi,0x5
   140332de2:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332de6:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332dea:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332df1:	ff ff 
   140332df3:	85 c0                	test   eax,eax
   140332df5:	75 1f                	jne    0x140332e16
   140332df7:	0f 28 c6             	movaps xmm0,xmm6
   140332dfa:	e8 75 df 2e 00       	call   0x140620d74
   140332dff:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332e03:	0f 57 c9             	xorps  xmm1,xmm1
   140332e06:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332e0b:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332e10:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332e14:	eb 03                	jmp    0x140332e19
   140332e16:	0f 57 c9             	xorps  xmm1,xmm1
   140332e19:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332e1f:	8d 47 0b             	lea    eax,[rdi+0xb]
   140332e22:	8b f0                	mov    esi,eax
   140332e24:	48 c1 e6 05          	shl    rsi,0x5
   140332e28:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332e2c:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332e30:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332e37:	ff ff 
   140332e39:	85 c0                	test   eax,eax
   140332e3b:	75 1f                	jne    0x140332e5c
   140332e3d:	0f 28 c6             	movaps xmm0,xmm6
   140332e40:	e8 2f df 2e 00       	call   0x140620d74
   140332e45:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332e49:	0f 57 c9             	xorps  xmm1,xmm1
   140332e4c:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332e51:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332e56:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332e5a:	eb 03                	jmp    0x140332e5f
   140332e5c:	0f 57 c9             	xorps  xmm1,xmm1
   140332e5f:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332e65:	8d 47 0c             	lea    eax,[rdi+0xc]
   140332e68:	8b f0                	mov    esi,eax
   140332e6a:	48 c1 e6 05          	shl    rsi,0x5
   140332e6e:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332e72:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332e76:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332e7d:	ff ff 
   140332e7f:	85 c0                	test   eax,eax
   140332e81:	75 1f                	jne    0x140332ea2
   140332e83:	0f 28 c6             	movaps xmm0,xmm6
   140332e86:	e8 e9 de 2e 00       	call   0x140620d74
   140332e8b:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332e8f:	0f 57 c9             	xorps  xmm1,xmm1
   140332e92:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332e97:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332e9c:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332ea0:	eb 03                	jmp    0x140332ea5
   140332ea2:	0f 57 c9             	xorps  xmm1,xmm1
   140332ea5:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332eab:	8d 47 0d             	lea    eax,[rdi+0xd]
   140332eae:	8b f0                	mov    esi,eax
   140332eb0:	48 c1 e6 05          	shl    rsi,0x5
   140332eb4:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332eb8:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332ebc:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332ec3:	ff ff 
   140332ec5:	85 c0                	test   eax,eax
   140332ec7:	75 1f                	jne    0x140332ee8
   140332ec9:	0f 28 c6             	movaps xmm0,xmm6
   140332ecc:	e8 a3 de 2e 00       	call   0x140620d74
   140332ed1:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332ed5:	0f 57 c9             	xorps  xmm1,xmm1
   140332ed8:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332edd:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332ee2:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332ee6:	eb 03                	jmp    0x140332eeb
   140332ee8:	0f 57 c9             	xorps  xmm1,xmm1
   140332eeb:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332ef1:	8d 47 0e             	lea    eax,[rdi+0xe]
   140332ef4:	8b f0                	mov    esi,eax
   140332ef6:	48 c1 e6 05          	shl    rsi,0x5
   140332efa:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332efe:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332f02:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332f09:	ff ff 
   140332f0b:	85 c0                	test   eax,eax
   140332f0d:	75 1f                	jne    0x140332f2e
   140332f0f:	0f 28 c6             	movaps xmm0,xmm6
   140332f12:	e8 5d de 2e 00       	call   0x140620d74
   140332f17:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332f1b:	0f 57 c9             	xorps  xmm1,xmm1
   140332f1e:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332f23:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332f28:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332f2c:	eb 03                	jmp    0x140332f31
   140332f2e:	0f 57 c9             	xorps  xmm1,xmm1
   140332f31:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332f37:	8d 47 0f             	lea    eax,[rdi+0xf]
   140332f3a:	8b f0                	mov    esi,eax
   140332f3c:	48 c1 e6 05          	shl    rsi,0x5
   140332f40:	89 6c 1e 14          	mov    DWORD PTR [rsi+rbx*1+0x14],ebp
   140332f44:	89 6c 1e 1c          	mov    DWORD PTR [rsi+rbx*1+0x1c],ebp
   140332f48:	48 c7 44 1e 0c ff ff 	mov    QWORD PTR [rsi+rbx*1+0xc],0xffffffffffffffff
   140332f4f:	ff ff 
   140332f51:	85 c0                	test   eax,eax
   140332f53:	75 1f                	jne    0x140332f74
   140332f55:	0f 28 c6             	movaps xmm0,xmm6
   140332f58:	e8 17 de 2e 00       	call   0x140620d74
   140332f5d:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   140332f61:	0f 57 c9             	xorps  xmm1,xmm1
   140332f64:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   140332f69:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   140332f6e:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140332f72:	eb 03                	jmp    0x140332f77
   140332f74:	0f 57 c9             	xorps  xmm1,xmm1
   140332f77:	83 c7 10             	add    edi,0x10
   140332f7a:	f3 0f 11 4c 1e 18    	movss  DWORD PTR [rsi+rbx*1+0x18],xmm1
   140332f80:	83 ff 30             	cmp    edi,0x30
   140332f83:	0f 82 97 fb ff ff    	jb     0x140332b20
   140332f89:	44 0f 28 4c 24 20    	movaps xmm9,XMMWORD PTR [rsp+0x20]
   140332f8f:	48 8b c3             	mov    rax,rbx
   140332f92:	44 0f 28 44 24 30    	movaps xmm8,XMMWORD PTR [rsp+0x30]
   140332f98:	0f 28 7c 24 40       	movaps xmm7,XMMWORD PTR [rsp+0x40]
   140332f9d:	0f 28 74 24 50       	movaps xmm6,XMMWORD PTR [rsp+0x50]
   140332fa2:	48 8b 7c 24 60       	mov    rdi,QWORD PTR [rsp+0x60]
   140332fa7:	48 8b b4 24 80 00 00 	mov    rsi,QWORD PTR [rsp+0x80]
   140332fae:	00 
   140332faf:	48 8b 6c 24 78       	mov    rbp,QWORD PTR [rsp+0x78]
   140332fb4:	c6 83 8c 0d 00 00 ff 	mov    BYTE PTR [rbx+0xd8c],0xff
   140332fbb:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]
   140332fc0:	48 83 c4 68          	add    rsp,0x68
   140332fc4:	c3                   	ret
   140332fc5:	cc                   	int3
   140332fc6:	cc                   	int3
   140332fc7:	cc                   	int3
   140332fc8:	cc                   	int3
   140332fc9:	cc                   	int3
   140332fca:	cc                   	int3
   140332fcb:	cc                   	int3
   140332fcc:	cc                   	int3
   140332fcd:	cc                   	int3
   140332fce:	cc                   	int3
   140332fcf:	cc                   	int3
