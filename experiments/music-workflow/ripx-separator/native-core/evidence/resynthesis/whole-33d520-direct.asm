
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014033d520 <.text+0x33c520>:
   14033d520:	4c 89 4c 24 20       	mov    QWORD PTR [rsp+0x20],r9
   14033d525:	53                   	push   rbx
   14033d526:	55                   	push   rbp
   14033d527:	56                   	push   rsi
   14033d528:	57                   	push   rdi
   14033d529:	41 55                	push   r13
   14033d52b:	48 81 ec d0 00 00 00 	sub    rsp,0xd0
   14033d532:	8b 2d 70 c4 5f 00    	mov    ebp,DWORD PTR [rip+0x5fc470]        # 0x1409399a8
   14033d538:	49 8b f9             	mov    rdi,r9
   14033d53b:	45 0f b6 e8          	movzx  r13d,r8b
   14033d53f:	48 8b f2             	mov    rsi,rdx
   14033d542:	44 0f 29 94 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm10
   14033d549:	00 00 
   14033d54b:	48 8b d9             	mov    rbx,rcx
   14033d54e:	4a 8d 04 6d 00 00 00 	lea    rax,[r13*2+0x0]
   14033d555:	00 
   14033d556:	49 03 c5             	add    rax,r13
   14033d559:	83 fd 01             	cmp    ebp,0x1
   14033d55c:	75 0b                	jne    0x14033d569
   14033d55e:	f3 0f 10 44 c2 08    	movss  xmm0,DWORD PTR [rdx+rax*8+0x8]
   14033d564:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033d567:	eb 17                	jmp    0x14033d580
   14033d569:	f3 0f 10 44 c2 0c    	movss  xmm0,DWORD PTR [rdx+rax*8+0xc]
   14033d56f:	f3 0f 58 44 c2 08    	addss  xmm0,DWORD PTR [rdx+rax*8+0x8]
   14033d575:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033d578:	f2 0f 59 05 a8 2b 51 	mulsd  xmm0,QWORD PTR [rip+0x512ba8]        # 0x140850128
   14033d57f:	00 
   14033d580:	f3 44 0f 10 94 24 40 	movss  xmm10,DWORD PTR [rsp+0x140]
   14033d587:	01 00 00 
   14033d58a:	4c 89 b4 24 08 01 00 	mov    QWORD PTR [rsp+0x108],r14
   14033d591:	00 
   14033d592:	0f 29 b4 24 c0 00 00 	movaps XMMWORD PTR [rsp+0xc0],xmm6
   14033d599:	00 
   14033d59a:	0f 29 bc 24 b0 00 00 	movaps XMMWORD PTR [rsp+0xb0],xmm7
   14033d5a1:	00 
   14033d5a2:	44 0f 29 84 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm8
   14033d5a9:	00 00 
   14033d5ab:	44 0f 29 8c 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm9
   14033d5b2:	00 00 
   14033d5b4:	44 0f 29 5c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm11
   14033d5ba:	44 0f 29 64 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm12
   14033d5c0:	44 0f 29 6c 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm13
   14033d5c6:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033d5ca:	44 0f 29 74 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm14
   14033d5d0:	44 0f 2f d0          	comiss xmm10,xmm0
   14033d5d4:	44 0f 29 7c 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm15
   14033d5da:	0f 87 40 04 00 00    	ja     0x14033da20
   14033d5e0:	f3 0f 10 15 48 2a 51 	movss  xmm2,DWORD PTR [rip+0x512a48]        # 0x140850030
   14033d5e7:	00 
   14033d5e8:	45 32 db             	xor    r11b,r11b
   14033d5eb:	44 0f b6 71 4b       	movzx  r14d,BYTE PTR [rcx+0x4b]
   14033d5f0:	0f 28 ea             	movaps xmm5,xmm2
   14033d5f3:	f2 44 0f 10 25 fc 2b 	movsd  xmm12,QWORD PTR [rip+0x512bfc]        # 0x1408501f8
   14033d5fa:	51 00 
   14033d5fc:	45 0f 57 c9          	xorps  xmm9,xmm9
   14033d600:	44 88 9c 24 40 01 00 	mov    BYTE PTR [rsp+0x140],r11b
   14033d607:	00 
   14033d608:	45 0f 57 db          	xorps  xmm11,xmm11
   14033d60c:	f3 0f 5e 2d 98 cb 64 	divss  xmm5,DWORD PTR [rip+0x64cb98]        # 0x14098a1ac
   14033d613:	00 
   14033d614:	f3 0f 11 6c 24 20    	movss  DWORD PTR [rsp+0x20],xmm5
   14033d61a:	45 84 f6             	test   r14b,r14b
   14033d61d:	0f 84 5c 01 00 00    	je     0x14033d77f
   14033d623:	f2 44 0f 10 05 94 31 	movsd  xmm8,QWORD PTR [rip+0x513194]        # 0x1408507c0
   14033d62a:	51 00 
   14033d62c:	44 8d 55 ff          	lea    r10d,[rbp-0x1]
   14033d630:	f2 44 0f 10 2d ff a2 	movsd  xmm13,QWORD PTR [rip+0x36a2ff]        # 0x1406a7938
   14033d637:	36 00 
   14033d639:	f2 44 0f 10 35 96 2b 	movsd  xmm14,QWORD PTR [rip+0x512b96]        # 0x1408501d8
   14033d640:	51 00 
   14033d642:	f2 44 0f 10 3d 7d 2b 	movsd  xmm15,QWORD PTR [rip+0x512b7d]        # 0x1408501c8
   14033d649:	51 00 
   14033d64b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14033d650:	45 32 c0             	xor    r8b,r8b
   14033d653:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033d657:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033d65e:	00 00 
   14033d660:	b9 01 00 00 00       	mov    ecx,0x1
   14033d665:	41 0f b6 c0          	movzx  eax,r8b
   14033d669:	44 3b d1             	cmp    r10d,ecx
   14033d66c:	41 0f 47 ca          	cmova  ecx,r10d
   14033d670:	3b c1                	cmp    eax,ecx
   14033d672:	0f 83 f7 00 00 00    	jae    0x14033d76f
   14033d678:	41 0f b6 c3          	movzx  eax,r11b
   14033d67c:	41 0f b6 d0          	movzx  edx,r8b
   14033d680:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033d684:	4c 8d 0c 4a          	lea    r9,[rdx+rcx*2]
   14033d688:	f3 42 0f 10 64 8b 08 	movss  xmm4,DWORD PTR [rbx+r9*4+0x8]
   14033d68f:	41 0f 2f e2          	comiss xmm4,xmm10
   14033d693:	0f 83 ca 00 00 00    	jae    0x14033d763
   14033d699:	f3 42 0f 10 7c 8b 10 	movss  xmm7,DWORD PTR [rbx+r9*4+0x10]
   14033d6a0:	41 0f 2e f9          	ucomiss xmm7,xmm9
   14033d6a4:	7a 06                	jp     0x14033d6ac
   14033d6a6:	0f 84 b7 00 00 00    	je     0x14033d763
   14033d6ac:	4a 8d 04 6d 00 00 00 	lea    rax,[r13*2+0x0]
   14033d6b3:	00 
   14033d6b4:	49 03 c5             	add    rax,r13
   14033d6b7:	48 8d 0c 42          	lea    rcx,[rdx+rax*2]
   14033d6bb:	f3 0f 10 54 8e 10    	movss  xmm2,DWORD PTR [rsi+rcx*4+0x10]
   14033d6c1:	41 0f 2e d1          	ucomiss xmm2,xmm9
   14033d6c5:	7a 06                	jp     0x14033d6cd
   14033d6c7:	0f 84 96 00 00 00    	je     0x14033d763
   14033d6cd:	f3 0f 10 0c 8e       	movss  xmm1,DWORD PTR [rsi+rcx*4]
   14033d6d2:	f3 42 0f 10 34 8b    	movss  xmm6,DWORD PTR [rbx+r9*4]
   14033d6d8:	0f 28 c1             	movaps xmm0,xmm1
   14033d6db:	f3 0f 5c c6          	subss  xmm0,xmm6
   14033d6df:	0f 5a d8             	cvtps2pd xmm3,xmm0
   14033d6e2:	66 44 0f 2f db       	comisd xmm11,xmm3
   14033d6e7:	76 04                	jbe    0x14033d6ed
   14033d6e9:	41 0f 57 d8          	xorps  xmm3,xmm8
   14033d6ed:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14033d6f0:	0f 5a d2             	cvtps2pd xmm2,xmm2
   14033d6f3:	f3 0f 5a ed          	cvtss2sd xmm5,xmm5
   14033d6f7:	f2 41 0f 59 d4       	mulsd  xmm2,xmm12
   14033d6fc:	0f 5a ff             	cvtps2pd xmm7,xmm7
   14033d6ff:	f2 0f 59 d5          	mulsd  xmm2,xmm5
   14033d703:	0f 28 cf             	movaps xmm1,xmm7
   14033d706:	f2 41 0f 59 cc       	mulsd  xmm1,xmm12
   14033d70b:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14033d70f:	0f 5a c6             	cvtps2pd xmm0,xmm6
   14033d712:	f2 0f 59 cd          	mulsd  xmm1,xmm5
   14033d716:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14033d71a:	f2 0f 5c d1          	subsd  xmm2,xmm1
   14033d71e:	66 44 0f 2f da       	comisd xmm11,xmm2
   14033d723:	76 04                	jbe    0x14033d729
   14033d725:	41 0f 57 d0          	xorps  xmm2,xmm8
   14033d729:	f3 0f 58 24 97       	addss  xmm4,DWORD PTR [rdi+rdx*4]
   14033d72e:	41 0f 28 c7          	movaps xmm0,xmm15
   14033d732:	f2 0f 58 d3          	addsd  xmm2,xmm3
   14033d736:	0f 5a cc             	cvtps2pd xmm1,xmm4
   14033d739:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14033d73d:	f2 41 0f 59 cd       	mulsd  xmm1,xmm13
   14033d742:	f2 0f 59 d5          	mulsd  xmm2,xmm5
   14033d746:	f3 0f 10 6c 24 20    	movss  xmm5,DWORD PTR [rsp+0x20]
   14033d74c:	f2 41 0f 5f ce       	maxsd  xmm1,xmm14
   14033d751:	f2 0f 5e c1          	divsd  xmm0,xmm1
   14033d755:	66 0f 2f c2          	comisd xmm0,xmm2
   14033d759:	76 08                	jbe    0x14033d763
   14033d75b:	41 fe c0             	inc    r8b
   14033d75e:	e9 fd fe ff ff       	jmp    0x14033d660
   14033d763:	41 fe c3             	inc    r11b
   14033d766:	45 3a de             	cmp    r11b,r14b
   14033d769:	0f 82 e1 fe ff ff    	jb     0x14033d650
   14033d76f:	f3 0f 10 15 b9 28 51 	movss  xmm2,DWORD PTR [rip+0x5128b9]        # 0x140850030
   14033d776:	00 
   14033d777:	44 88 9c 24 40 01 00 	mov    BYTE PTR [rsp+0x140],r11b
   14033d77e:	00 
   14033d77f:	0f b6 05 76 c2 5f 00 	movzx  eax,BYTE PTR [rip+0x5fc276]        # 0x1409399fc
   14033d786:	02 05 74 c2 5f 00    	add    al,BYTE PTR [rip+0x5fc274]        # 0x140939a00
   14033d78c:	44 3a d8             	cmp    r11b,al
   14033d78f:	0f 83 8b 02 00 00    	jae    0x14033da20
   14033d795:	80 bc 24 48 01 00 00 	cmp    BYTE PTR [rsp+0x148],0x0
   14033d79c:	00 
   14033d79d:	0f 85 77 02 00 00    	jne    0x14033da1a
   14033d7a3:	45 3a de             	cmp    r11b,r14b
   14033d7a6:	0f 84 74 02 00 00    	je     0x14033da20
   14033d7ac:	f3 0f 10 0d 54 a3 36 	movss  xmm1,DWORD PTR [rip+0x36a354]        # 0x1406a7b08
   14033d7b3:	00 
   14033d7b4:	f2 44 0f 10 2d c3 09 	movsd  xmm13,QWORD PTR [rip+0x3509c3]        # 0x14068e180
   14033d7bb:	35 00 
   14033d7bd:	f2 44 0f 10 3d 6a 09 	movsd  xmm15,QWORD PTR [rip+0x35096a]        # 0x14068e130
   14033d7c4:	35 00 
   14033d7c6:	f3 44 0f 10 35 e1 09 	movss  xmm14,DWORD PTR [rip+0x3509e1]        # 0x14068e1b0
   14033d7cd:	35 00 
   14033d7cf:	48 8b 94 24 18 01 00 	mov    rdx,QWORD PTR [rsp+0x118]
   14033d7d6:	00 
   14033d7d7:	4c 89 a4 24 00 01 00 	mov    QWORD PTR [rsp+0x100],r12
   14033d7de:	00 
   14033d7df:	45 32 e4             	xor    r12b,r12b
   14033d7e2:	4c 89 bc 24 10 01 00 	mov    QWORD PTR [rsp+0x110],r15
   14033d7e9:	00 
   14033d7ea:	45 0f b6 f3          	movzx  r14d,r11b
   14033d7ee:	66 90                	xchg   ax,ax
   14033d7f0:	8d 45 ff             	lea    eax,[rbp-0x1]
   14033d7f3:	b9 01 00 00 00       	mov    ecx,0x1
   14033d7f8:	3b c1                	cmp    eax,ecx
   14033d7fa:	0f 47 c8             	cmova  ecx,eax
   14033d7fd:	41 0f b6 c4          	movzx  eax,r12b
   14033d801:	3b c1                	cmp    eax,ecx
   14033d803:	0f 83 f8 01 00 00    	jae    0x14033da01
   14033d809:	41 0f b6 fc          	movzx  edi,r12b
   14033d80d:	4b 8d 04 76          	lea    rax,[r14+r14*2]
   14033d811:	48 8d 2c 47          	lea    rbp,[rdi+rax*2]
   14033d815:	f3 44 0f 10 1c ab    	movss  xmm11,DWORD PTR [rbx+rbp*4]
   14033d81b:	4a 8d 04 6d 00 00 00 	lea    rax,[r13*2+0x0]
   14033d822:	00 
   14033d823:	49 03 c5             	add    rax,r13
   14033d826:	44 0f 2e d9          	ucomiss xmm11,xmm1
   14033d82a:	4c 8d 3c 47          	lea    r15,[rdi+rax*2]
   14033d82e:	7a 32                	jp     0x14033d862
   14033d830:	75 30                	jne    0x14033d862
   14033d832:	42 8b 04 be          	mov    eax,DWORD PTR [rsi+r15*4]
   14033d836:	89 04 ab             	mov    DWORD PTR [rbx+rbp*4],eax
   14033d839:	4b 8d 04 76          	lea    rax,[r14+r14*2]
   14033d83d:	48 8d 0c 47          	lea    rcx,[rdi+rax*2]
   14033d841:	42 8b 44 be 10       	mov    eax,DWORD PTR [rsi+r15*4+0x10]
   14033d846:	89 44 8b 10          	mov    DWORD PTR [rbx+rcx*4+0x10],eax
   14033d84a:	f3 0f 10 04 ba       	movss  xmm0,DWORD PTR [rdx+rdi*4]
   14033d84f:	41 0f 2f c1          	comiss xmm0,xmm9
   14033d853:	0f 87 8c 01 00 00    	ja     0x14033d9e5
   14033d859:	41 0f 28 c1          	movaps xmm0,xmm9
   14033d85d:	e9 83 01 00 00       	jmp    0x14033d9e5
   14033d862:	f3 44 0f 10 64 ab 08 	movss  xmm12,DWORD PTR [rbx+rbp*4+0x8]
   14033d869:	0f 28 fa             	movaps xmm7,xmm2
   14033d86c:	f3 42 0f 10 34 be    	movss  xmm6,DWORD PTR [rsi+r15*4]
   14033d872:	41 0f 28 c4          	movaps xmm0,xmm12
   14033d876:	f3 0f 58 04 ba       	addss  xmm0,DWORD PTR [rdx+rdi*4]
   14033d87b:	45 0f 28 d4          	movaps xmm10,xmm12
   14033d87f:	f3 44 0f 5e d0       	divss  xmm10,xmm0
   14033d884:	0f 28 c6             	movaps xmm0,xmm6
   14033d887:	f3 41 0f 5c fa       	subss  xmm7,xmm10
   14033d88c:	e8 25 35 2e 00       	call   0x140620db6
   14033d891:	44 0f 28 c0          	movaps xmm8,xmm0
   14033d895:	41 0f 28 c3          	movaps xmm0,xmm11
   14033d899:	f3 44 0f 59 c7       	mulss  xmm8,xmm7
   14033d89e:	e8 13 35 2e 00       	call   0x140620db6
   14033d8a3:	f3 41 0f 59 c2       	mulss  xmm0,xmm10
   14033d8a8:	f3 44 0f 58 c0       	addss  xmm8,xmm0
   14033d8ad:	0f 28 c6             	movaps xmm0,xmm6
   14033d8b0:	e8 e9 34 2e 00       	call   0x140620d9e
   14033d8b5:	0f 28 f0             	movaps xmm6,xmm0
   14033d8b8:	41 0f 28 c3          	movaps xmm0,xmm11
   14033d8bc:	f3 0f 59 f7          	mulss  xmm6,xmm7
   14033d8c0:	e8 d9 34 2e 00       	call   0x140620d9e
   14033d8c5:	f3 41 0f 59 c2       	mulss  xmm0,xmm10
   14033d8ca:	f3 0f 58 f0          	addss  xmm6,xmm0
   14033d8ce:	41 0f 28 c0          	movaps xmm0,xmm8
   14033d8d2:	0f 28 ce             	movaps xmm1,xmm6
   14033d8d5:	e8 ee 34 2e 00       	call   0x140620dc8
   14033d8da:	f2 0f 10 35 16 29 51 	movsd  xmm6,QWORD PTR [rip+0x512916]        # 0x1408501f8
   14033d8e1:	00 
   14033d8e2:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14033d8e6:	0f 28 ce             	movaps xmm1,xmm6
   14033d8e9:	e8 7a 34 2e 00       	call   0x140620d68
   14033d8ee:	0f 57 c9             	xorps  xmm1,xmm1
   14033d8f1:	66 0f 2f c8          	comisd xmm1,xmm0
   14033d8f5:	76 04                	jbe    0x14033d8fb
   14033d8f7:	f2 0f 58 c6          	addsd  xmm0,xmm6
   14033d8fb:	f2 0f 10 0d 75 28 51 	movsd  xmm1,QWORD PTR [rip+0x512875]        # 0x140850178
   14033d902:	00 
   14033d903:	4b 8d 04 76          	lea    rax,[r14+r14*2]
   14033d907:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033d90b:	48 8d 0c 47          	lea    rcx,[rdi+rax*2]
   14033d90f:	48 8b 84 24 18 01 00 	mov    rax,QWORD PTR [rsp+0x118]
   14033d916:	00 
   14033d917:	f3 0f 11 04 ab       	movss  DWORD PTR [rbx+rbp*4],xmm0
   14033d91c:	f3 42 0f 10 54 be 10 	movss  xmm2,DWORD PTR [rsi+r15*4+0x10]
   14033d923:	41 0f 5a c2          	cvtps2pd xmm0,xmm10
   14033d927:	f3 44 0f 59 54 8b 10 	mulss  xmm10,DWORD PTR [rbx+rcx*4+0x10]
   14033d92e:	f2 0f 5c c8          	subsd  xmm1,xmm0
   14033d932:	0f 5a d2             	cvtps2pd xmm2,xmm2
   14033d935:	41 0f 5a c2          	cvtps2pd xmm0,xmm10
   14033d939:	f2 0f 59 d1          	mulsd  xmm2,xmm1
   14033d93d:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14033d941:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   14033d945:	f3 0f 11 44 8b 10    	movss  DWORD PTR [rbx+rcx*4+0x10],xmm0
   14033d94b:	f3 0f 10 0c b8       	movss  xmm1,DWORD PTR [rax+rdi*4]
   14033d950:	41 0f 2f c9          	comiss xmm1,xmm9
   14033d954:	76 25                	jbe    0x14033d97b
   14033d956:	44 0f 2f c9          	comiss xmm9,xmm1
   14033d95a:	73 1f                	jae    0x14033d97b
   14033d95c:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14033d95f:	41 0f 28 cf          	movaps xmm1,xmm15
   14033d963:	f2 41 0f 5e c5       	divsd  xmm0,xmm13
   14033d968:	e8 0d 34 2e 00       	call   0x140620d7a
   14033d96d:	0f 57 f6             	xorps  xmm6,xmm6
   14033d970:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033d974:	f3 41 0f 59 f6       	mulss  xmm6,xmm14
   14033d979:	eb 04                	jmp    0x14033d97f
   14033d97b:	41 0f 28 f1          	movaps xmm6,xmm9
   14033d97f:	45 0f 2f cc          	comiss xmm9,xmm12
   14033d983:	72 06                	jb     0x14033d98b
   14033d985:	41 0f 28 c1          	movaps xmm0,xmm9
   14033d989:	eb 1b                	jmp    0x14033d9a6
   14033d98b:	41 0f 5a c4          	cvtps2pd xmm0,xmm12
   14033d98f:	41 0f 28 cf          	movaps xmm1,xmm15
   14033d993:	f2 41 0f 5e c5       	divsd  xmm0,xmm13
   14033d998:	e8 dd 33 2e 00       	call   0x140620d7a
   14033d99d:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033d9a1:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   14033d9a6:	f3 0f 58 c6          	addss  xmm0,xmm6
   14033d9aa:	44 0f 2f c8          	comiss xmm9,xmm0
   14033d9ae:	72 06                	jb     0x14033d9b6
   14033d9b0:	41 0f 28 c1          	movaps xmm0,xmm9
   14033d9b4:	eb 1f                	jmp    0x14033d9d5
   14033d9b6:	f2 0f 10 0d 62 07 35 	movsd  xmm1,QWORD PTR [rip+0x350762]        # 0x14068e120
   14033d9bd:	00 
   14033d9be:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14033d9c2:	f2 41 0f 5e c5       	divsd  xmm0,xmm13
   14033d9c7:	e8 ae 33 2e 00       	call   0x140620d7a
   14033d9cc:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033d9d0:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   14033d9d5:	f3 0f 10 0d 2b a1 36 	movss  xmm1,DWORD PTR [rip+0x36a12b]        # 0x1406a7b08
   14033d9dc:	00 
   14033d9dd:	48 8b 94 24 18 01 00 	mov    rdx,QWORD PTR [rsp+0x118]
   14033d9e4:	00 
   14033d9e5:	f3 0f 11 44 ab 08    	movss  DWORD PTR [rbx+rbp*4+0x8],xmm0
   14033d9eb:	41 fe c4             	inc    r12b
   14033d9ee:	8b 2d b4 bf 5f 00    	mov    ebp,DWORD PTR [rip+0x5fbfb4]        # 0x1409399a8
   14033d9f4:	f3 0f 10 15 34 26 51 	movss  xmm2,DWORD PTR [rip+0x512634]        # 0x140850030
   14033d9fb:	00 
   14033d9fc:	e9 ef fd ff ff       	jmp    0x14033d7f0
   14033da01:	44 0f b6 9c 24 40 01 	movzx  r11d,BYTE PTR [rsp+0x140]
   14033da08:	00 00 
   14033da0a:	4c 8b bc 24 10 01 00 	mov    r15,QWORD PTR [rsp+0x110]
   14033da11:	00 
   14033da12:	4c 8b a4 24 00 01 00 	mov    r12,QWORD PTR [rsp+0x100]
   14033da19:	00 
   14033da1a:	41 0f b6 c3          	movzx  eax,r11b
   14033da1e:	eb 02                	jmp    0x14033da22
   14033da20:	b0 ff                	mov    al,0xff
   14033da22:	44 0f 28 7c 24 30    	movaps xmm15,XMMWORD PTR [rsp+0x30]
   14033da28:	44 0f 28 74 24 40    	movaps xmm14,XMMWORD PTR [rsp+0x40]
   14033da2e:	44 0f 28 6c 24 50    	movaps xmm13,XMMWORD PTR [rsp+0x50]
   14033da34:	44 0f 28 64 24 60    	movaps xmm12,XMMWORD PTR [rsp+0x60]
   14033da3a:	44 0f 28 5c 24 70    	movaps xmm11,XMMWORD PTR [rsp+0x70]
   14033da40:	44 0f 28 8c 24 90 00 	movaps xmm9,XMMWORD PTR [rsp+0x90]
   14033da47:	00 00 
   14033da49:	44 0f 28 84 24 a0 00 	movaps xmm8,XMMWORD PTR [rsp+0xa0]
   14033da50:	00 00 
   14033da52:	0f 28 bc 24 b0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xb0]
   14033da59:	00 
   14033da5a:	0f 28 b4 24 c0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xc0]
   14033da61:	00 
   14033da62:	4c 8b b4 24 08 01 00 	mov    r14,QWORD PTR [rsp+0x108]
   14033da69:	00 
   14033da6a:	44 0f 28 94 24 80 00 	movaps xmm10,XMMWORD PTR [rsp+0x80]
   14033da71:	00 00 
   14033da73:	48 81 c4 d0 00 00 00 	add    rsp,0xd0
   14033da7a:	41 5d                	pop    r13
   14033da7c:	5f                   	pop    rdi
   14033da7d:	5e                   	pop    rsi
   14033da7e:	5d                   	pop    rbp
   14033da7f:	5b                   	pop    rbx
   14033da80:	c3                   	ret
   14033da81:	cc                   	int3
   14033da82:	cc                   	int3
   14033da83:	cc                   	int3
   14033da84:	cc                   	int3
   14033da85:	cc                   	int3
   14033da86:	cc                   	int3
   14033da87:	cc                   	int3
   14033da88:	cc                   	int3
   14033da89:	cc                   	int3
   14033da8a:	cc                   	int3
   14033da8b:	cc                   	int3
   14033da8c:	cc                   	int3
   14033da8d:	cc                   	int3
   14033da8e:	cc                   	int3
   14033da8f:	cc                   	int3
   14033da90:	40 56                	rex push rsi
   14033da92:	83 3d 0f bf 5f 00 01 	cmp    DWORD PTR [rip+0x5fbf0f],0x1        # 0x1409399a8
   14033da99:	41 8b f0             	mov    esi,r8d
   14033da9c:	4c 63 da             	movsxd r11,edx
   14033da9f:	0f 84 bd 00 00 00    	je     0x14033db62
   14033daa5:	45 3b d8             	cmp    r11d,r8d
   14033daa8:	0f 8d b4 00 00 00    	jge    0x14033db62
   14033daae:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   14033dab3:	4e 8d 14 9d 00 00 00 	lea    r10,[r11*4+0x0]
   14033daba:	00 
   14033dabb:	48 8b 59 10          	mov    rbx,QWORD PTR [rcx+0x10]
   14033dabf:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   14033dac4:	33 ed                	xor    ebp,ebp
   14033dac6:	48 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],rdi
   14033dacb:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   14033dad0:	4c 8b 71 08          	mov    r14,QWORD PTR [rcx+0x8]
   14033dad4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033dad8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033dadf:	00 
   14033dae0:	41 69 c3 00 15 00 00 	imul   eax,r11d,0x1500
   14033dae7:	44 0f b7 cd          	movzx  r9d,bp
   14033daeb:	49 8d 3c c6          	lea    rdi,[r14+rax*8]
   14033daef:	41 39 2c 1a          	cmp    DWORD PTR [r10+rbx*1],ebp
   14033daf3:	76 4d                	jbe    0x14033db42
   14033daf5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14033dafc:	00 00 00 00 
   14033db00:	41 0f b7 c1          	movzx  eax,r9w
   14033db04:	8b d5                	mov    edx,ebp
   14033db06:	4c 8b 04 c7          	mov    r8,QWORD PTR [rdi+rax*8]
   14033db0a:	41 38 50 4b          	cmp    BYTE PTR [r8+0x4b],dl
   14033db0e:	76 24                	jbe    0x14033db34
   14033db10:	49 8d 48 14          	lea    rcx,[r8+0x14]
   14033db14:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033db18:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033db1f:	00 
   14033db20:	8b 41 fc             	mov    eax,DWORD PTR [rcx-0x4]
   14033db23:	ff c2                	inc    edx
   14033db25:	89 01                	mov    DWORD PTR [rcx],eax
   14033db27:	48 8d 49 18          	lea    rcx,[rcx+0x18]
   14033db2b:	41 0f b6 40 4b       	movzx  eax,BYTE PTR [r8+0x4b]
   14033db30:	3b d0                	cmp    edx,eax
   14033db32:	7c ec                	jl     0x14033db20
   14033db34:	66 41 ff c1          	inc    r9w
   14033db38:	41 0f b7 c1          	movzx  eax,r9w
   14033db3c:	41 3b 04 1a          	cmp    eax,DWORD PTR [r10+rbx*1]
   14033db40:	72 be                	jb     0x14033db00
   14033db42:	41 ff c3             	inc    r11d
   14033db45:	49 83 c2 04          	add    r10,0x4
   14033db49:	44 3b de             	cmp    r11d,esi
   14033db4c:	7c 92                	jl     0x14033dae0
   14033db4e:	4c 8b 74 24 28       	mov    r14,QWORD PTR [rsp+0x28]
   14033db53:	48 8b 7c 24 20       	mov    rdi,QWORD PTR [rsp+0x20]
   14033db58:	48 8b 6c 24 18       	mov    rbp,QWORD PTR [rsp+0x18]
   14033db5d:	48 8b 5c 24 10       	mov    rbx,QWORD PTR [rsp+0x10]
   14033db62:	5e                   	pop    rsi
   14033db63:	c3                   	ret
   14033db64:	cc                   	int3
   14033db65:	cc                   	int3
   14033db66:	cc                   	int3
   14033db67:	cc                   	int3
   14033db68:	cc                   	int3
   14033db69:	cc                   	int3
   14033db6a:	cc                   	int3
   14033db6b:	cc                   	int3
   14033db6c:	cc                   	int3
   14033db6d:	cc                   	int3
   14033db6e:	cc                   	int3
   14033db6f:	cc                   	int3
   14033db70:	40 57                	rex push rdi
   14033db72:	4c 63 da             	movsxd r11,edx
   14033db75:	41 8b f8             	mov    edi,r8d
   14033db78:	45 3b d8             	cmp    r11d,r8d
   14033db7b:	0f 8d ee 00 00 00    	jge    0x14033dc6f
   14033db81:	48 8b 41 10          	mov    rax,QWORD PTR [rcx+0x10]
   14033db85:	4d 8b cb             	mov    r9,r11
   14033db88:	f3 0f 10 1d a0 24 51 	movss  xmm3,DWORD PTR [rip+0x5124a0]        # 0x140850030
   14033db8f:	00 
   14033db90:	0f 57 d2             	xorps  xmm2,xmm2
   14033db93:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   14033db98:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   14033db9d:	33 ed                	xor    ebp,ebp
   14033db9f:	48 89 74 24 20       	mov    QWORD PTR [rsp+0x20],rsi
   14033dba4:	4e 8d 14 98          	lea    r10,[rax+r11*4]
   14033dba8:	48 8b 71 08          	mov    rsi,QWORD PTR [rcx+0x8]
   14033dbac:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033dbb0:	41 69 c3 00 15 00 00 	imul   eax,r11d,0x1500
   14033dbb7:	44 0f b7 cd          	movzx  r9d,bp
   14033dbbb:	48 8d 1c c6          	lea    rbx,[rsi+rax*8]
   14033dbbf:	41 39 2a             	cmp    DWORD PTR [r10],ebp
   14033dbc2:	0f 86 88 00 00 00    	jbe    0x14033dc50
   14033dbc8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033dbcf:	00 
   14033dbd0:	41 0f b7 c1          	movzx  eax,r9w
   14033dbd4:	44 8b c5             	mov    r8d,ebp
   14033dbd7:	48 8b 14 c3          	mov    rdx,QWORD PTR [rbx+rax*8]
   14033dbdb:	40 38 6a 4b          	cmp    BYTE PTR [rdx+0x4b],bpl
   14033dbdf:	76 62                	jbe    0x14033dc43
   14033dbe1:	48 8b cd             	mov    rcx,rbp
   14033dbe4:	83 3d bd bd 5f 00 01 	cmp    DWORD PTR [rip+0x5fbdbd],0x1        # 0x1409399a8
   14033dbeb:	76 37                	jbe    0x14033dc24
   14033dbed:	f3 0f 10 4c 11 08    	movss  xmm1,DWORD PTR [rcx+rdx*1+0x8]
   14033dbf3:	0f 28 c1             	movaps xmm0,xmm1
   14033dbf6:	f3 0f 58 44 11 0c    	addss  xmm0,DWORD PTR [rcx+rdx*1+0xc]
   14033dbfc:	0f 2f c2             	comiss xmm0,xmm2
   14033dbff:	76 32                	jbe    0x14033dc33
   14033dc01:	f3 0f 5e c8          	divss  xmm1,xmm0
   14033dc05:	0f 28 c3             	movaps xmm0,xmm3
   14033dc08:	f3 0f 5c c1          	subss  xmm0,xmm1
   14033dc0c:	f3 0f 59 4c 11 10    	mulss  xmm1,DWORD PTR [rcx+rdx*1+0x10]
   14033dc12:	f3 0f 59 44 11 14    	mulss  xmm0,DWORD PTR [rcx+rdx*1+0x14]
   14033dc18:	f3 0f 58 c1          	addss  xmm0,xmm1
   14033dc1c:	f3 0f 11 44 11 10    	movss  DWORD PTR [rcx+rdx*1+0x10],xmm0
   14033dc22:	eb 0f                	jmp    0x14033dc33
   14033dc24:	8b 44 11 08          	mov    eax,DWORD PTR [rcx+rdx*1+0x8]
   14033dc28:	89 44 11 0c          	mov    DWORD PTR [rcx+rdx*1+0xc],eax
   14033dc2c:	8b 04 11             	mov    eax,DWORD PTR [rcx+rdx*1]
   14033dc2f:	89 44 11 04          	mov    DWORD PTR [rcx+rdx*1+0x4],eax
   14033dc33:	0f b6 42 4b          	movzx  eax,BYTE PTR [rdx+0x4b]
   14033dc37:	41 ff c0             	inc    r8d
   14033dc3a:	48 83 c1 18          	add    rcx,0x18
   14033dc3e:	44 3b c0             	cmp    r8d,eax
   14033dc41:	7c a1                	jl     0x14033dbe4
   14033dc43:	66 41 ff c1          	inc    r9w
   14033dc47:	41 0f b7 c1          	movzx  eax,r9w
   14033dc4b:	41 3b 02             	cmp    eax,DWORD PTR [r10]
   14033dc4e:	72 80                	jb     0x14033dbd0
   14033dc50:	41 ff c3             	inc    r11d
   14033dc53:	49 83 c2 04          	add    r10,0x4
   14033dc57:	44 3b df             	cmp    r11d,edi
   14033dc5a:	0f 8c 50 ff ff ff    	jl     0x14033dbb0
   14033dc60:	48 8b 74 24 20       	mov    rsi,QWORD PTR [rsp+0x20]
   14033dc65:	48 8b 6c 24 18       	mov    rbp,QWORD PTR [rsp+0x18]
   14033dc6a:	48 8b 5c 24 10       	mov    rbx,QWORD PTR [rsp+0x10]
   14033dc6f:	5f                   	pop    rdi
   14033dc70:	c3                   	ret
   14033dc71:	cc                   	int3
   14033dc72:	cc                   	int3
   14033dc73:	cc                   	int3
   14033dc74:	cc                   	int3
   14033dc75:	cc                   	int3
   14033dc76:	cc                   	int3
   14033dc77:	cc                   	int3
   14033dc78:	cc                   	int3
   14033dc79:	cc                   	int3
   14033dc7a:	cc                   	int3
   14033dc7b:	cc                   	int3
   14033dc7c:	cc                   	int3
   14033dc7d:	cc                   	int3
   14033dc7e:	cc                   	int3
   14033dc7f:	cc                   	int3
