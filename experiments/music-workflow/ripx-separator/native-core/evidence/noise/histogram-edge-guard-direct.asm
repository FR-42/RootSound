
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014034b460 <.text+0x34a460>:
   14034b460:	40 53                	rex push rbx
   14034b462:	55                   	push   rbp
   14034b463:	56                   	push   rsi
   14034b464:	57                   	push   rdi
   14034b465:	41 54                	push   r12
   14034b467:	41 55                	push   r13
   14034b469:	41 56                	push   r14
   14034b46b:	41 57                	push   r15
   14034b46d:	48 81 ec 18 05 00 00 	sub    rsp,0x518
   14034b474:	48 8b 05 ed 6c 62 00 	mov    rax,QWORD PTR [rip+0x626ced]        # 0x140972168
   14034b47b:	48 33 c4             	xor    rax,rsp
   14034b47e:	48 89 84 24 70 04 00 	mov    QWORD PTR [rsp+0x470],rax
   14034b485:	00 
   14034b486:	48 8b 81 98 05 00 00 	mov    rax,QWORD PTR [rcx+0x598]
   14034b48d:	4c 8b e1             	mov    r12,rcx
   14034b490:	4c 8b 94 24 88 05 00 	mov    r10,QWORD PTR [rsp+0x588]
   14034b497:	00 
   14034b498:	41 0f b7 f8          	movzx  edi,r8w
   14034b49c:	44 8b bc 24 80 05 00 	mov    r15d,DWORD PTR [rsp+0x580]
   14034b4a3:	00 
   14034b4a4:	66 45 03 c0          	add    r8w,r8w
   14034b4a8:	48 89 44 24 58       	mov    QWORD PTR [rsp+0x58],rax
   14034b4ad:	66 41 ff c0          	inc    r8w
   14034b4b1:	0f b7 c2             	movzx  eax,dx
   14034b4b4:	41 8b f1             	mov    esi,r9d
   14034b4b7:	0f b7 ea             	movzx  ebp,dx
   14034b4ba:	48 89 4c 24 68       	mov    QWORD PTR [rsp+0x68],rcx
   14034b4bf:	45 0f b7 e8          	movzx  r13d,r8w
   14034b4c3:	44 0f af e8          	imul   r13d,eax
   14034b4c7:	48 63 05 16 eb 63 00 	movsxd rax,DWORD PTR [rip+0x63eb16]        # 0x140989fe4
   14034b4ce:	44 89 4c 24 40       	mov    DWORD PTR [rsp+0x40],r9d
   14034b4d3:	4c 8b 89 a0 05 00 00 	mov    r9,QWORD PTR [rcx+0x5a0]
   14034b4da:	4c 89 54 24 60       	mov    QWORD PTR [rsp+0x60],r10
   14034b4df:	4c 89 4c 24 48       	mov    QWORD PTR [rsp+0x48],r9
   14034b4e4:	44 89 6c 24 2c       	mov    DWORD PTR [rsp+0x2c],r13d
   14034b4e9:	41 0f b7 0c 41       	movzx  ecx,WORD PTR [r9+rax*2]
   14034b4ee:	8d 45 ff             	lea    eax,[rbp-0x1]
   14034b4f1:	03 c1                	add    eax,ecx
   14034b4f3:	89 6c 24 44          	mov    DWORD PTR [rsp+0x44],ebp
   14034b4f7:	99                   	cdq
   14034b4f8:	f7 fd                	idiv   ebp
   14034b4fa:	41 8d 57 01          	lea    edx,[r15+0x1]
   14034b4fe:	41 89 02             	mov    DWORD PTR [r10],eax
   14034b501:	8b 0d dd ea 63 00    	mov    ecx,DWORD PTR [rip+0x63eadd]        # 0x140989fe4
   14034b507:	2b ce                	sub    ecx,esi
   14034b509:	03 d1                	add    edx,ecx
   14034b50b:	0f af d0             	imul   edx,eax
   14034b50e:	b8 10 04 00 00       	mov    eax,0x410
   14034b513:	48 f7 e2             	mul    rdx
   14034b516:	48 8b d8             	mov    rbx,rax
   14034b519:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   14034b520:	48 0f 40 d8          	cmovo  rbx,rax
   14034b524:	48 8b cb             	mov    rcx,rbx
   14034b527:	e8 34 00 2d 00       	call   0x14061b560
   14034b52c:	4c 8b f0             	mov    r14,rax
   14034b52f:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   14034b534:	33 c0                	xor    eax,eax
   14034b536:	4d 85 f6             	test   r14,r14
   14034b539:	74 0f                	je     0x14034b54a
   14034b53b:	4c 8b c3             	mov    r8,rbx
   14034b53e:	33 d2                	xor    edx,edx
   14034b540:	49 8b ce             	mov    rcx,r14
   14034b543:	e8 a2 57 2d 00       	call   0x140620cea
   14034b548:	eb 08                	jmp    0x14034b552
   14034b54a:	4c 8b f0             	mov    r14,rax
   14034b54d:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   14034b552:	8b de                	mov    ebx,esi
   14034b554:	89 5c 24 20          	mov    DWORD PTR [rsp+0x20],ebx
   14034b558:	41 3b f7             	cmp    esi,r15d
   14034b55b:	0f 8f 68 04 00 00    	jg     0x14034b9c9
   14034b561:	4c 8b 54 24 48       	mov    r10,QWORD PTR [rsp+0x48]
   14034b566:	0f 29 b4 24 00 05 00 	movaps XMMWORD PTR [rsp+0x500],xmm6
   14034b56d:	00 
   14034b56e:	f3 0f 10 35 6a bc 34 	movss  xmm6,DWORD PTR [rip+0x34bc6a]        # 0x1406971e0
   14034b575:	00 
   14034b576:	0f 29 bc 24 f0 04 00 	movaps XMMWORD PTR [rsp+0x4f0],xmm7
   14034b57d:	00 
   14034b57e:	f2 0f 10 3d a2 4b 50 	movsd  xmm7,QWORD PTR [rip+0x504ba2]        # 0x140850128
   14034b585:	00 
   14034b586:	44 0f 29 84 24 e0 04 	movaps XMMWORD PTR [rsp+0x4e0],xmm8
   14034b58d:	00 00 
   14034b58f:	f3 44 0f 10 05 e4 cd 	movss  xmm8,DWORD PTR [rip+0x35cde4]        # 0x1406a837c
   14034b596:	35 00 
   14034b598:	44 0f 29 8c 24 d0 04 	movaps XMMWORD PTR [rsp+0x4d0],xmm9
   14034b59f:	00 00 
   14034b5a1:	f3 44 0f 10 0d ce cd 	movss  xmm9,DWORD PTR [rip+0x35cdce]        # 0x1406a8378
   14034b5a8:	35 00 
   14034b5aa:	44 0f 29 94 24 c0 04 	movaps XMMWORD PTR [rsp+0x4c0],xmm10
   14034b5b1:	00 00 
   14034b5b3:	45 0f 57 d2          	xorps  xmm10,xmm10
   14034b5b7:	44 0f 29 9c 24 b0 04 	movaps XMMWORD PTR [rsp+0x4b0],xmm11
   14034b5be:	00 00 
   14034b5c0:	f3 44 0f 10 1d 67 4a 	movss  xmm11,DWORD PTR [rip+0x504a67]        # 0x140850030
   14034b5c7:	50 00 
   14034b5c9:	44 0f 29 a4 24 a0 04 	movaps XMMWORD PTR [rsp+0x4a0],xmm12
   14034b5d0:	00 00 
   14034b5d2:	f3 44 0f 10 25 d5 c2 	movss  xmm12,DWORD PTR [rip+0x35c2d5]        # 0x1406a78b0
   14034b5d9:	35 00 
   14034b5db:	44 0f b7 c7          	movzx  r8d,di
   14034b5df:	8b 3d c3 e3 5e 00    	mov    edi,DWORD PTR [rip+0x5ee3c3]        # 0x1409399a8
   14034b5e5:	44 0f af c5          	imul   r8d,ebp
   14034b5e9:	44 0f 29 ac 24 90 04 	movaps XMMWORD PTR [rsp+0x490],xmm13
   14034b5f0:	00 00 
   14034b5f2:	f3 44 0f 10 2d 7d 4c 	movss  xmm13,DWORD PTR [rip+0x504c7d]        # 0x140850278
   14034b5f9:	50 00 
   14034b5fb:	44 0f 29 b4 24 80 04 	movaps XMMWORD PTR [rsp+0x480],xmm14
   14034b602:	00 00 
   14034b604:	f3 44 0f 10 35 cf 49 	movss  xmm14,DWORD PTR [rip+0x5049cf]        # 0x14084ffdc
   14034b60b:	50 00 
   14034b60d:	45 8b d8             	mov    r11d,r8d
   14034b610:	44 89 44 24 24       	mov    DWORD PTR [rsp+0x24],r8d
   14034b615:	41 f7 db             	neg    r11d
   14034b618:	44 89 5c 24 30       	mov    DWORD PTR [rsp+0x30],r11d
   14034b61d:	8b 74 24 30          	mov    esi,DWORD PTR [rsp+0x30]
   14034b621:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14034b625:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14034b62c:	00 00 00 00 
   14034b630:	8b 15 ae e9 63 00    	mov    edx,DWORD PTR [rip+0x63e9ae]        # 0x140989fe4
   14034b636:	8b cb                	mov    ecx,ebx
   14034b638:	41 2b 4c 24 0c       	sub    ecx,DWORD PTR [r12+0xc]
   14034b63d:	45 8b fb             	mov    r15d,r11d
   14034b640:	03 d1                	add    edx,ecx
   14034b642:	69 ca d0 01 00 00    	imul   ecx,edx,0x1d0
   14034b648:	4c 63 ca             	movsxd r9,edx
   14034b64b:	4c 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],r9
   14034b650:	43 0f b7 04 4a       	movzx  eax,WORD PTR [r10+r9*2]
   14034b655:	4c 69 e1 f8 00 00 00 	imul   r12,rcx,0xf8
   14034b65c:	4c 03 64 24 58       	add    r12,QWORD PTR [rsp+0x58]
   14034b661:	44 3b d8             	cmp    r11d,eax
   14034b664:	0f 8d f3 02 00 00    	jge    0x14034b95d
   14034b66a:	45 0f b7 dd          	movzx  r11d,r13w
   14034b66e:	45 2b d8             	sub    r11d,r8d
   14034b671:	44 89 5c 24 28       	mov    DWORD PTR [rsp+0x28],r11d
   14034b676:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14034b67d:	00 00 00 
   14034b680:	48 8b 44 24 60       	mov    rax,QWORD PTR [rsp+0x60]
   14034b685:	47 8d 2c 38          	lea    r13d,[r8+r15*1]
   14034b689:	8b 0d 55 e9 63 00    	mov    ecx,DWORD PTR [rip+0x63e955]        # 0x140989fe4
   14034b68f:	2b 4c 24 40          	sub    ecx,DWORD PTR [rsp+0x40]
   14034b693:	03 cb                	add    ecx,ebx
   14034b695:	0f af 08             	imul   ecx,DWORD PTR [rax]
   14034b698:	41 8b c5             	mov    eax,r13d
   14034b69b:	99                   	cdq
   14034b69c:	f7 fd                	idiv   ebp
   14034b69e:	03 c1                	add    eax,ecx
   14034b6a0:	48 69 e8 10 04 00 00 	imul   rbp,rax,0x410
   14034b6a7:	49 03 ee             	add    rbp,r14
   14034b6aa:	45 33 f6             	xor    r14d,r14d
   14034b6ad:	0f 1f 00             	nop    DWORD PTR [rax]
   14034b6b0:	41 8b ce             	mov    ecx,r14d
   14034b6b3:	45 85 f6             	test   r14d,r14d
   14034b6b6:	74 17                	je     0x14034b6cf
   14034b6b8:	83 e9 01             	sub    ecx,0x1
   14034b6bb:	74 0a                	je     0x14034b6c7
   14034b6bd:	83 f9 01             	cmp    ecx,0x1
   14034b6c0:	75 10                	jne    0x14034b6d2
   14034b6c2:	41 8b f5             	mov    esi,r13d
   14034b6c5:	eb 0b                	jmp    0x14034b6d2
   14034b6c7:	41 8b f7             	mov    esi,r15d
   14034b6ca:	41 2b f0             	sub    esi,r8d
   14034b6cd:	eb 03                	jmp    0x14034b6d2
   14034b6cf:	41 8b f7             	mov    esi,r15d
   14034b6d2:	43 0f b7 1c 4a       	movzx  ebx,WORD PTR [r10+r9*2]
   14034b6d7:	41 8d 04 33          	lea    eax,[r11+rsi*1]
   14034b6db:	3b c3                	cmp    eax,ebx
   14034b6dd:	0f 8f 54 02 00 00    	jg     0x14034b937
   14034b6e3:	33 d2                	xor    edx,edx
   14034b6e5:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   14034b6ea:	41 b8 00 04 00 00    	mov    r8d,0x400
   14034b6f0:	e8 f5 55 2d 00       	call   0x140620cea
   14034b6f5:	8b 4c 24 2c          	mov    ecx,DWORD PTR [rsp+0x2c]
   14034b6f9:	45 33 db             	xor    r11d,r11d
   14034b6fc:	0f b7 c1             	movzx  eax,cx
   14034b6ff:	41 0f 28 da          	movaps xmm3,xmm10
   14034b703:	03 c6                	add    eax,esi
   14034b705:	45 8b d3             	mov    r10d,r11d
   14034b708:	3b d8                	cmp    ebx,eax
   14034b70a:	41 b1 01             	mov    r9b,0x1
   14034b70d:	0f 4d d8             	cmovge ebx,eax
   14034b710:	85 f6                	test   esi,esi
   14034b712:	49 8d 54 24 14       	lea    rdx,[r12+0x14]
   14034b717:	45 8b c3             	mov    r8d,r11d
   14034b71a:	44 0f 4f c6          	cmovg  r8d,esi
   14034b71e:	49 63 c0             	movsxd rax,r8d
   14034b721:	48 69 c8 f8 00 00 00 	imul   rcx,rax,0xf8
   14034b728:	48 03 d1             	add    rdx,rcx
   14034b72b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14034b730:	44 3b c3             	cmp    r8d,ebx
   14034b733:	7d 6d                	jge    0x14034b7a2
   14034b735:	0f 2f 72 ec          	comiss xmm6,DWORD PTR [rdx-0x14]
   14034b739:	77 5b                	ja     0x14034b796
   14034b73b:	83 ff 01             	cmp    edi,0x1
   14034b73e:	75 09                	jne    0x14034b749
   14034b740:	f3 0f 10 02          	movss  xmm0,DWORD PTR [rdx]
   14034b744:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034b747:	eb 10                	jmp    0x14034b759
   14034b749:	f3 0f 10 42 04       	movss  xmm0,DWORD PTR [rdx+0x4]
   14034b74e:	f3 0f 58 02          	addss  xmm0,DWORD PTR [rdx]
   14034b752:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034b755:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   14034b759:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14034b75d:	41 80 f9 01          	cmp    r9b,0x1
   14034b761:	75 1b                	jne    0x14034b77e
   14034b763:	41 0f 28 c0          	movaps xmm0,xmm8
   14034b767:	41 ff c0             	inc    r8d
   14034b76a:	f3 0f 5f c1          	maxss  xmm0,xmm1
   14034b76e:	48 81 c2 f8 00 00 00 	add    rdx,0xf8
   14034b775:	f3 0f 5f c3          	maxss  xmm0,xmm3
   14034b779:	0f 28 d8             	movaps xmm3,xmm0
   14034b77c:	eb b2                	jmp    0x14034b730
   14034b77e:	f3 0f 5e cb          	divss  xmm1,xmm3
   14034b782:	f3 41 0f 59 c9       	mulss  xmm1,xmm9
   14034b787:	f3 0f 2c c1          	cvttss2si eax,xmm1
   14034b78b:	0f b7 c8             	movzx  ecx,ax
   14034b78e:	66 ff 44 4c 70       	inc    WORD PTR [rsp+rcx*2+0x70]
   14034b793:	41 ff c2             	inc    r10d
   14034b796:	41 ff c0             	inc    r8d
   14034b799:	48 81 c2 f8 00 00 00 	add    rdx,0xf8
   14034b7a0:	eb 8e                	jmp    0x14034b730
   14034b7a2:	41 80 f9 01          	cmp    r9b,0x1
   14034b7a6:	75 08                	jne    0x14034b7b0
   14034b7a8:	41 0f 2e da          	ucomiss xmm3,xmm10
   14034b7ac:	7a 02                	jp     0x14034b7b0
   14034b7ae:	74 0d                	je     0x14034b7bd
   14034b7b0:	41 fe c1             	inc    r9b
   14034b7b3:	41 80 f9 02          	cmp    r9b,0x2
   14034b7b7:	0f 86 53 ff ff ff    	jbe    0x14034b710
   14034b7bd:	0f 57 c0             	xorps  xmm0,xmm0
   14034b7c0:	41 8b c2             	mov    eax,r10d
   14034b7c3:	41 8b d3             	mov    edx,r11d
   14034b7c6:	41 0f b7 cb          	movzx  ecx,r11w
   14034b7ca:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14034b7cf:	f3 41 0f 5e c5       	divss  xmm0,xmm13
   14034b7d4:	f3 41 0f 58 c6       	addss  xmm0,xmm14
   14034b7d9:	f3 4c 0f 2c c8       	cvttss2si r9,xmm0
   14034b7de:	66 90                	xchg   ax,ax
   14034b7e0:	0f b7 c1             	movzx  eax,cx
   14034b7e3:	66 0f 6e c8          	movd   xmm1,eax
   14034b7e7:	0f b7 c1             	movzx  eax,cx
   14034b7ea:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14034b7ed:	44 0f b7 44 44 70    	movzx  r8d,WORD PTR [rsp+rax*2+0x70]
   14034b7f3:	42 8d 04 02          	lea    eax,[rdx+r8*1]
   14034b7f7:	41 3b c1             	cmp    eax,r9d
   14034b7fa:	73 13                	jae    0x14034b80f
   14034b7fc:	66 ff c1             	inc    cx
   14034b7ff:	41 b8 00 02 00 00    	mov    r8d,0x200
   14034b805:	8b d0                	mov    edx,eax
   14034b807:	66 41 3b c8          	cmp    cx,r8w
   14034b80b:	72 d3                	jb     0x14034b7e0
   14034b80d:	eb 39                	jmp    0x14034b848
   14034b80f:	66 45 85 c0          	test   r8w,r8w
   14034b813:	74 1d                	je     0x14034b832
   14034b815:	0f 57 d2             	xorps  xmm2,xmm2
   14034b818:	66 41 0f 6e c0       	movd   xmm0,r8d
   14034b81d:	41 2b d1             	sub    edx,r9d
   14034b820:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14034b823:	41 8d 04 10          	lea    eax,[r8+rdx*1]
   14034b827:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   14034b82c:	f3 0f 5e d0          	divss  xmm2,xmm0
   14034b830:	eb 04                	jmp    0x14034b836
   14034b832:	41 0f 28 d2          	movaps xmm2,xmm10
   14034b836:	41 0f 28 c3          	movaps xmm0,xmm11
   14034b83a:	41 b8 00 02 00 00    	mov    r8d,0x200
   14034b840:	f3 0f 5c c2          	subss  xmm0,xmm2
   14034b844:	f3 0f 58 c8          	addss  xmm1,xmm0
   14034b848:	f3 41 0f 59 cc       	mulss  xmm1,xmm12
   14034b84d:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14034b851:	0f 2f 4d 00          	comiss xmm1,DWORD PTR [rbp+0x0]
   14034b855:	0f 86 b6 00 00 00    	jbe    0x14034b911
   14034b85b:	f3 0f 11 4d 00       	movss  DWORD PTR [rbp+0x0],xmm1
   14034b860:	41 0f b7 cb          	movzx  ecx,r11w
   14034b864:	f3 0f 11 4d 04       	movss  DWORD PTR [rbp+0x4],xmm1
   14034b869:	41 8b d3             	mov    edx,r11d
   14034b86c:	f3 0f 11 5d 08       	movss  DWORD PTR [rbp+0x8],xmm3
   14034b871:	66 44 89 5d 0c       	mov    WORD PTR [rbp+0xc],r11w
   14034b876:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14034b87d:	00 00 00 
   14034b880:	0f b7 c1             	movzx  eax,cx
   14034b883:	66 ff c1             	inc    cx
   14034b886:	66 03 54 44 70       	add    dx,WORD PTR [rsp+rax*2+0x70]
   14034b88b:	66 41 3b c8          	cmp    cx,r8w
   14034b88f:	72 ef                	jb     0x14034b880
   14034b891:	66 89 55 0c          	mov    WORD PTR [rbp+0xc],dx
   14034b895:	48 8d 45 0e          	lea    rax,[rbp+0xe]
   14034b899:	ba 08 00 00 00       	mov    edx,0x8
   14034b89e:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   14034b8a3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14034b8a7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14034b8ae:	00 00 
   14034b8b0:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14034b8b7:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14034b8ba:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14034b8be:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14034b8c5:	0f 11 40 80          	movups XMMWORD PTR [rax-0x80],xmm0
   14034b8c9:	0f 10 41 a0          	movups xmm0,XMMWORD PTR [rcx-0x60]
   14034b8cd:	0f 11 48 90          	movups XMMWORD PTR [rax-0x70],xmm1
   14034b8d1:	0f 10 49 b0          	movups xmm1,XMMWORD PTR [rcx-0x50]
   14034b8d5:	0f 11 40 a0          	movups XMMWORD PTR [rax-0x60],xmm0
   14034b8d9:	0f 10 41 c0          	movups xmm0,XMMWORD PTR [rcx-0x40]
   14034b8dd:	0f 11 48 b0          	movups XMMWORD PTR [rax-0x50],xmm1
   14034b8e1:	0f 10 49 d0          	movups xmm1,XMMWORD PTR [rcx-0x30]
   14034b8e5:	0f 11 40 c0          	movups XMMWORD PTR [rax-0x40],xmm0
   14034b8e9:	0f 10 41 e0          	movups xmm0,XMMWORD PTR [rcx-0x20]
   14034b8ed:	0f 11 48 d0          	movups XMMWORD PTR [rax-0x30],xmm1
   14034b8f1:	0f 10 49 f0          	movups xmm1,XMMWORD PTR [rcx-0x10]
   14034b8f5:	0f 11 40 e0          	movups XMMWORD PTR [rax-0x20],xmm0
   14034b8f9:	0f 11 48 f0          	movups XMMWORD PTR [rax-0x10],xmm1
   14034b8fd:	48 83 ea 01          	sub    rdx,0x1
   14034b901:	75 ad                	jne    0x14034b8b0
   14034b903:	66 44 89 85 0e 04 00 	mov    WORD PTR [rbp+0x40e],r8w
   14034b90a:	00 
   14034b90b:	8b 3d 97 e0 5e 00    	mov    edi,DWORD PTR [rip+0x5ee097]        # 0x1409399a8
   14034b911:	44 8b 44 24 24       	mov    r8d,DWORD PTR [rsp+0x24]
   14034b916:	41 ff c6             	inc    r14d
   14034b919:	4c 8b 4c 24 50       	mov    r9,QWORD PTR [rsp+0x50]
   14034b91e:	4c 8b 54 24 48       	mov    r10,QWORD PTR [rsp+0x48]
   14034b923:	44 8b 5c 24 28       	mov    r11d,DWORD PTR [rsp+0x28]
   14034b928:	41 83 fe 02          	cmp    r14d,0x2
   14034b92c:	0f 8e 7e fd ff ff    	jle    0x14034b6b0
   14034b932:	43 0f b7 1c 4a       	movzx  ebx,WORD PTR [r10+r9*2]
   14034b937:	8b 6c 24 44          	mov    ebp,DWORD PTR [rsp+0x44]
   14034b93b:	44 03 fd             	add    r15d,ebp
   14034b93e:	4c 8b 74 24 38       	mov    r14,QWORD PTR [rsp+0x38]
   14034b943:	0f b7 cb             	movzx  ecx,bx
   14034b946:	8b 5c 24 20          	mov    ebx,DWORD PTR [rsp+0x20]
   14034b94a:	44 3b f9             	cmp    r15d,ecx
   14034b94d:	0f 8c 2d fd ff ff    	jl     0x14034b680
   14034b953:	44 8b 5c 24 30       	mov    r11d,DWORD PTR [rsp+0x30]
   14034b958:	44 8b 6c 24 2c       	mov    r13d,DWORD PTR [rsp+0x2c]
   14034b95d:	4c 8b 74 24 38       	mov    r14,QWORD PTR [rsp+0x38]
   14034b962:	ff c3                	inc    ebx
   14034b964:	4c 8b 64 24 68       	mov    r12,QWORD PTR [rsp+0x68]
   14034b969:	89 5c 24 20          	mov    DWORD PTR [rsp+0x20],ebx
   14034b96d:	3b 9c 24 80 05 00 00 	cmp    ebx,DWORD PTR [rsp+0x580]
   14034b974:	0f 8e b6 fc ff ff    	jle    0x14034b630
   14034b97a:	44 0f 28 b4 24 80 04 	movaps xmm14,XMMWORD PTR [rsp+0x480]
   14034b981:	00 00 
   14034b983:	44 0f 28 ac 24 90 04 	movaps xmm13,XMMWORD PTR [rsp+0x490]
   14034b98a:	00 00 
   14034b98c:	44 0f 28 a4 24 a0 04 	movaps xmm12,XMMWORD PTR [rsp+0x4a0]
   14034b993:	00 00 
   14034b995:	44 0f 28 9c 24 b0 04 	movaps xmm11,XMMWORD PTR [rsp+0x4b0]
   14034b99c:	00 00 
   14034b99e:	44 0f 28 94 24 c0 04 	movaps xmm10,XMMWORD PTR [rsp+0x4c0]
   14034b9a5:	00 00 
   14034b9a7:	44 0f 28 8c 24 d0 04 	movaps xmm9,XMMWORD PTR [rsp+0x4d0]
   14034b9ae:	00 00 
