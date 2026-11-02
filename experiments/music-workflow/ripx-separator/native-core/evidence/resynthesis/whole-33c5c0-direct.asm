
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014033c5c0 <.text+0x33b5c0>:
   14033c5c0:	48 8b c4             	mov    rax,rsp
   14033c5c3:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14033c5c7:	53                   	push   rbx
   14033c5c8:	56                   	push   rsi
   14033c5c9:	57                   	push   rdi
   14033c5ca:	41 55                	push   r13
   14033c5cc:	48 81 ec 38 01 00 00 	sub    rsp,0x138
   14033c5d3:	48 8b ba 38 06 00 00 	mov    rdi,QWORD PTR [rdx+0x638]
   14033c5da:	4c 8b ea             	mov    r13,rdx
   14033c5dd:	48 8b b2 50 06 00 00 	mov    rsi,QWORD PTR [rdx+0x650]
   14033c5e4:	41 b1 01             	mov    r9b,0x1
   14033c5e7:	44 8b 82 48 05 00 00 	mov    r8d,DWORD PTR [rdx+0x548]
   14033c5ee:	48 89 68 d8          	mov    QWORD PTR [rax-0x28],rbp
   14033c5f2:	48 8b e9             	mov    rbp,rcx
   14033c5f5:	4c 89 60 d0          	mov    QWORD PTR [rax-0x30],r12
   14033c5f9:	4c 8b a2 58 06 00 00 	mov    r12,QWORD PTR [rdx+0x658]
   14033c600:	4c 89 70 c8          	mov    QWORD PTR [rax-0x38],r14
   14033c604:	4c 89 78 c0          	mov    QWORD PTR [rax-0x40],r15
   14033c608:	4c 8b ba 40 05 00 00 	mov    r15,QWORD PTR [rdx+0x540]
   14033c60f:	49 8b d7             	mov    rdx,r15
   14033c612:	4c 89 7c 24 68       	mov    QWORD PTR [rsp+0x68],r15
   14033c617:	48 89 bc 24 68 01 00 	mov    QWORD PTR [rsp+0x168],rdi
   14033c61e:	00 
   14033c61f:	4c 89 a4 24 70 01 00 	mov    QWORD PTR [rsp+0x170],r12
   14033c626:	00 
   14033c627:	e8 94 d1 ff ff       	call   0x1403397c0
   14033c62c:	b2 01                	mov    dl,0x1
   14033c62e:	49 8b cd             	mov    rcx,r13
   14033c631:	e8 8a c8 ff ff       	call   0x140338ec0
   14033c636:	45 33 c0             	xor    r8d,r8d
   14033c639:	49 8b d5             	mov    rdx,r13
   14033c63c:	48 8b cd             	mov    rcx,rbp
   14033c63f:	e8 4c 07 fe ff       	call   0x14031cd90
   14033c644:	45 33 c9             	xor    r9d,r9d
   14033c647:	45 8b f1             	mov    r14d,r9d
   14033c64a:	45 39 8d 48 05 00 00 	cmp    DWORD PTR [r13+0x548],r9d
   14033c651:	0f 86 b9 02 00 00    	jbe    0x14033c910
   14033c657:	0f 29 b4 24 00 01 00 	movaps XMMWORD PTR [rsp+0x100],xmm6
   14033c65e:	00 
   14033c65f:	4c 8d 25 9a 39 cc ff 	lea    r12,[rip+0xffffffffffcc399a]        # 0x140000000
   14033c666:	0f 29 bc 24 f0 00 00 	movaps XMMWORD PTR [rsp+0xf0],xmm7
   14033c66d:	00 
   14033c66e:	f3 0f 10 3d 62 1a 35 	movss  xmm7,DWORD PTR [rip+0x351a62]        # 0x14068e0d8
   14033c675:	00 
   14033c676:	44 0f 29 84 24 e0 00 	movaps XMMWORD PTR [rsp+0xe0],xmm8
   14033c67d:	00 00 
   14033c67f:	f3 44 0f 10 05 50 aa 	movss  xmm8,DWORD PTR [rip+0x35aa50]        # 0x1406970d8
   14033c686:	35 00 
   14033c688:	44 0f 29 8c 24 d0 00 	movaps XMMWORD PTR [rsp+0xd0],xmm9
   14033c68f:	00 00 
   14033c691:	f2 44 0f 10 0d 8e 3a 	movsd  xmm9,QWORD PTR [rip+0x513a8e]        # 0x140850128
   14033c698:	51 00 
   14033c69a:	44 0f 29 94 24 c0 00 	movaps XMMWORD PTR [rsp+0xc0],xmm10
   14033c6a1:	00 00 
   14033c6a3:	f3 44 0f 10 15 30 39 	movss  xmm10,DWORD PTR [rip+0x513930]        # 0x14084ffdc
   14033c6aa:	51 00 
   14033c6ac:	44 0f 29 9c 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm11
   14033c6b3:	00 00 
   14033c6b5:	f3 44 0f 10 1d 0e aa 	movss  xmm11,DWORD PTR [rip+0x35aa0e]        # 0x1406970cc
   14033c6bc:	35 00 
   14033c6be:	44 0f 29 a4 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm12
   14033c6c5:	00 00 
   14033c6c7:	f3 44 0f 10 25 f8 a9 	movss  xmm12,DWORD PTR [rip+0x35a9f8]        # 0x1406970c8
   14033c6ce:	35 00 
   14033c6d0:	44 0f 29 ac 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm13
   14033c6d7:	00 00 
   14033c6d9:	f3 44 0f 10 2d 02 1a 	movss  xmm13,DWORD PTR [rip+0x351a02]        # 0x14068e0e4
   14033c6e0:	35 00 
   14033c6e2:	44 0f 29 b4 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm14
   14033c6e9:	00 00 
   14033c6eb:	f3 44 0f 10 35 f8 a9 	movss  xmm14,DWORD PTR [rip+0x35a9f8]        # 0x1406970ec
   14033c6f2:	35 00 
   14033c6f4:	44 0f 29 7c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm15
   14033c6fa:	f3 44 0f 10 3d 3d b2 	movss  xmm15,DWORD PTR [rip+0x36b23d]        # 0x1406a7940
   14033c701:	36 00 
   14033c703:	41 8b c6             	mov    eax,r14d
   14033c706:	48 8d 2c 80          	lea    rbp,[rax+rax*4]
   14033c70a:	41 f6 44 ef 0c 01    	test   BYTE PTR [r15+rbp*8+0xc],0x1
   14033c710:	0f 85 7d 01 00 00    	jne    0x14033c893
   14033c716:	41 80 7c ef 24 01    	cmp    BYTE PTR [r15+rbp*8+0x24],0x1
   14033c71c:	0f 85 71 01 00 00    	jne    0x14033c893
   14033c722:	41 8b f9             	mov    edi,r9d
   14033c725:	49 8b 1c ef          	mov    rbx,QWORD PTR [r15+rbp*8]
   14033c729:	44 89 8c 24 78 01 00 	mov    DWORD PTR [rsp+0x178],r9d
   14033c730:	00 
   14033c731:	66 45 3b 4c ef 08    	cmp    r9w,WORD PTR [r15+rbp*8+0x8]
   14033c737:	0f 83 56 01 00 00    	jae    0x14033c893
   14033c73d:	41 8b c9             	mov    ecx,r9d
   14033c740:	41 0f b6 54 ef 25    	movzx  edx,BYTE PTR [r15+rbp*8+0x25]
   14033c746:	8b c1                	mov    eax,ecx
   14033c748:	48 6b c8 5c          	imul   rcx,rax,0x5c
   14033c74c:	83 3d 55 d2 5f 00 01 	cmp    DWORD PTR [rip+0x5fd255],0x1        # 0x1409399a8
   14033c753:	75 0b                	jne    0x14033c760
   14033c755:	f3 0f 10 44 19 08    	movss  xmm0,DWORD PTR [rcx+rbx*1+0x8]
   14033c75b:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033c75e:	eb 14                	jmp    0x14033c774
   14033c760:	f3 0f 10 44 19 0c    	movss  xmm0,DWORD PTR [rcx+rbx*1+0xc]
   14033c766:	f3 0f 58 44 19 08    	addss  xmm0,DWORD PTR [rcx+rbx*1+0x8]
   14033c76c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033c76f:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14033c774:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033c778:	8d 42 ff             	lea    eax,[rdx-0x1]
   14033c77b:	41 0f 28 f2          	movaps xmm6,xmm10
   14033c77f:	f3 0f 5f f0          	maxss  xmm6,xmm0
   14033c783:	83 f8 16             	cmp    eax,0x16
   14033c786:	77 5d                	ja     0x14033c7e5
   14033c788:	48 98                	cdqe
   14033c78a:	41 8b 8c 84 1c ce 33 	mov    ecx,DWORD PTR [r12+rax*4+0x33ce1c]
   14033c791:	00 
   14033c792:	49 03 cc             	add    rcx,r12
   14033c795:	ff e1                	jmp    rcx
   14033c797:	f3 41 0f 59 f7       	mulss  xmm6,xmm15
   14033c79c:	eb 6b                	jmp    0x14033c809
   14033c79e:	f3 0f 59 35 56 19 35 	mulss  xmm6,DWORD PTR [rip+0x351956]        # 0x14068e0fc
   14033c7a5:	00 
   14033c7a6:	eb 61                	jmp    0x14033c809
   14033c7a8:	f3 0f 59 35 3c 19 35 	mulss  xmm6,DWORD PTR [rip+0x35193c]        # 0x14068e0ec
   14033c7af:	00 
   14033c7b0:	eb 57                	jmp    0x14033c809
   14033c7b2:	f3 0f 59 35 f2 37 51 	mulss  xmm6,DWORD PTR [rip+0x5137f2]        # 0x14084ffac
   14033c7b9:	00 
   14033c7ba:	eb 4d                	jmp    0x14033c809
   14033c7bc:	f3 41 0f 59 f5       	mulss  xmm6,xmm13
   14033c7c1:	eb 46                	jmp    0x14033c809
   14033c7c3:	f3 41 0f 59 f6       	mulss  xmm6,xmm14
   14033c7c8:	eb 3f                	jmp    0x14033c809
   14033c7ca:	f3 41 0f 59 f0       	mulss  xmm6,xmm8
   14033c7cf:	eb 38                	jmp    0x14033c809
   14033c7d1:	f3 41 0f 59 f3       	mulss  xmm6,xmm11
   14033c7d6:	eb 31                	jmp    0x14033c809
   14033c7d8:	f3 41 0f 59 f4       	mulss  xmm6,xmm12
   14033c7dd:	eb 2a                	jmp    0x14033c809
   14033c7df:	f3 0f 59 f7          	mulss  xmm6,xmm7
   14033c7e3:	eb 24                	jmp    0x14033c809
   14033c7e5:	8d 42 e9             	lea    eax,[rdx-0x17]
   14033c7e8:	b9 14 00 00 00       	mov    ecx,0x14
   14033c7ed:	3b c1                	cmp    eax,ecx
   14033c7ef:	0f 4e c8             	cmovle ecx,eax
   14033c7f2:	f7 d9                	neg    ecx
   14033c7f4:	03 c9                	add    ecx,ecx
   14033c7f6:	e8 65 a3 00 00       	call   0x140346b60
   14033c7fb:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14033c7ff:	45 33 c9             	xor    r9d,r9d
   14033c802:	f3 0f 59 c6          	mulss  xmm0,xmm6
   14033c806:	0f 28 f0             	movaps xmm6,xmm0
   14033c809:	8b c7                	mov    eax,edi
   14033c80b:	4c 6b c0 5c          	imul   r8,rax,0x5c
   14033c80f:	f3 41 0f 11 74 18 54 	movss  DWORD PTR [r8+rbx*1+0x54],xmm6
   14033c816:	83 3d df d1 5f 00 00 	cmp    DWORD PTR [rip+0x5fd1df],0x0        # 0x1409399fc
   14033c81d:	76 47                	jbe    0x14033c866
   14033c81f:	41 8b d1             	mov    edx,r9d
   14033c822:	8b ca                	mov    ecx,edx
   14033c824:	49 8d 04 08          	lea    rax,[r8+rcx*1]
   14033c828:	80 64 18 48 fe       	and    BYTE PTR [rax+rbx*1+0x48],0xfe
   14033c82d:	41 f6 44 18 48 40    	test   BYTE PTR [r8+rbx*1+0x48],0x40
   14033c833:	75 27                	jne    0x14033c85c
   14033c835:	83 fa 01             	cmp    edx,0x1
   14033c838:	72 22                	jb     0x14033c85c
   14033c83a:	48 8d 04 49          	lea    rax,[rcx+rcx*2]
   14033c83e:	49 8d 0c c0          	lea    rcx,[r8+rax*8]
   14033c842:	41 8b 44 18 10       	mov    eax,DWORD PTR [r8+rbx*1+0x10]
   14033c847:	89 44 19 10          	mov    DWORD PTR [rcx+rbx*1+0x10],eax
   14033c84b:	48 c7 04 19 00 00 00 	mov    QWORD PTR [rcx+rbx*1],0x0
   14033c852:	00 
   14033c853:	48 c7 44 19 08 00 00 	mov    QWORD PTR [rcx+rbx*1+0x8],0x0
   14033c85a:	00 00 
   14033c85c:	ff c2                	inc    edx
   14033c85e:	3b 15 98 d1 5f 00    	cmp    edx,DWORD PTR [rip+0x5fd198]        # 0x1409399fc
   14033c864:	72 bc                	jb     0x14033c822
   14033c866:	41 80 64 18 48 ef    	and    BYTE PTR [r8+rbx*1+0x48],0xef
   14033c86c:	41 f6 44 18 48 40    	test   BYTE PTR [r8+rbx*1+0x48],0x40
   14033c872:	75 06                	jne    0x14033c87a
   14033c874:	41 c6 44 18 4b 00    	mov    BYTE PTR [r8+rbx*1+0x4b],0x0
   14033c87a:	41 0f b7 44 ef 08    	movzx  eax,WORD PTR [r15+rbp*8+0x8]
   14033c880:	ff c7                	inc    edi
   14033c882:	8b cf                	mov    ecx,edi
   14033c884:	3b f8                	cmp    edi,eax
   14033c886:	0f 82 b4 fe ff ff    	jb     0x14033c740
   14033c88c:	89 bc 24 78 01 00 00 	mov    DWORD PTR [rsp+0x178],edi
   14033c893:	41 ff c6             	inc    r14d
   14033c896:	45 3b b5 48 05 00 00 	cmp    r14d,DWORD PTR [r13+0x548]
   14033c89d:	0f 82 60 fe ff ff    	jb     0x14033c703
   14033c8a3:	4c 8b a4 24 70 01 00 	mov    r12,QWORD PTR [rsp+0x170]
   14033c8aa:	00 
   14033c8ab:	48 8b bc 24 68 01 00 	mov    rdi,QWORD PTR [rsp+0x168]
   14033c8b2:	00 
   14033c8b3:	48 8b ac 24 60 01 00 	mov    rbp,QWORD PTR [rsp+0x160]
   14033c8ba:	00 
   14033c8bb:	44 0f 28 7c 24 70    	movaps xmm15,XMMWORD PTR [rsp+0x70]
   14033c8c1:	44 0f 28 b4 24 80 00 	movaps xmm14,XMMWORD PTR [rsp+0x80]
   14033c8c8:	00 00 
   14033c8ca:	44 0f 28 ac 24 90 00 	movaps xmm13,XMMWORD PTR [rsp+0x90]
   14033c8d1:	00 00 
   14033c8d3:	44 0f 28 a4 24 a0 00 	movaps xmm12,XMMWORD PTR [rsp+0xa0]
   14033c8da:	00 00 
   14033c8dc:	44 0f 28 9c 24 b0 00 	movaps xmm11,XMMWORD PTR [rsp+0xb0]
   14033c8e3:	00 00 
   14033c8e5:	44 0f 28 94 24 c0 00 	movaps xmm10,XMMWORD PTR [rsp+0xc0]
   14033c8ec:	00 00 
   14033c8ee:	44 0f 28 8c 24 d0 00 	movaps xmm9,XMMWORD PTR [rsp+0xd0]
   14033c8f5:	00 00 
   14033c8f7:	44 0f 28 84 24 e0 00 	movaps xmm8,XMMWORD PTR [rsp+0xe0]
   14033c8fe:	00 00 
   14033c900:	0f 28 bc 24 f0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xf0]
   14033c907:	00 
   14033c908:	0f 28 b4 24 00 01 00 	movaps xmm6,XMMWORD PTR [rsp+0x100]
   14033c90f:	00 
   14033c910:	49 8b cd             	mov    rcx,r13
   14033c913:	e8 d8 be ff ff       	call   0x1403387f0
   14033c918:	8b 85 bc 00 00 00    	mov    eax,DWORD PTR [rbp+0xbc]
   14033c91e:	45 33 f6             	xor    r14d,r14d
   14033c921:	41 03 45 10          	add    eax,DWORD PTR [r13+0x10]
   14033c925:	45 8b fe             	mov    r15d,r14d
   14033c928:	4d 63 5d 0c          	movsxd r11,DWORD PTR [r13+0xc]
   14033c92c:	44 3b d8             	cmp    r11d,eax
   14033c92f:	0f 8d 77 00 00 00    	jge    0x14033c9ac
   14033c935:	4a 8d 1c 9d 00 00 00 	lea    rbx,[r11*4+0x0]
   14033c93c:	00 
   14033c93d:	0f 1f 00             	nop    DWORD PTR [rax]
   14033c940:	48 8b 47 10          	mov    rax,QWORD PTR [rdi+0x10]
   14033c944:	41 8b d6             	mov    edx,r14d
   14033c947:	45 69 d3 00 15 00 00 	imul   r10d,r11d,0x1500
   14033c94e:	44 8b 0c 03          	mov    r9d,DWORD PTR [rbx+rax*1]
   14033c952:	48 8b 47 08          	mov    rax,QWORD PTR [rdi+0x8]
   14033c956:	4e 8d 04 d0          	lea    r8,[rax+r10*8]
   14033c95a:	45 85 c9             	test   r9d,r9d
   14033c95d:	74 37                	je     0x14033c996
   14033c95f:	90                   	nop
   14033c960:	49 8b 00             	mov    rax,QWORD PTR [r8]
   14033c963:	f6 40 48 40          	test   BYTE PTR [rax+0x48],0x40
   14033c967:	74 0f                	je     0x14033c978
   14033c969:	44 38 70 4b          	cmp    BYTE PTR [rax+0x4b],r14b
   14033c96d:	75 09                	jne    0x14033c978
   14033c96f:	4c 89 30             	mov    QWORD PTR [rax],r14
   14033c972:	4c 89 70 08          	mov    QWORD PTR [rax+0x8],r14
   14033c976:	eb 13                	jmp    0x14033c98b
   14033c978:	41 8b c7             	mov    eax,r15d
   14033c97b:	41 8d 0c 12          	lea    ecx,[r10+rdx*1]
   14033c97f:	81 e1 ff ff ff 00    	and    ecx,0xffffff
   14033c985:	41 ff c7             	inc    r15d
   14033c988:	89 0c 86             	mov    DWORD PTR [rsi+rax*4],ecx
   14033c98b:	ff c2                	inc    edx
   14033c98d:	49 83 c0 08          	add    r8,0x8
   14033c991:	41 3b d1             	cmp    edx,r9d
   14033c994:	72 ca                	jb     0x14033c960
   14033c996:	8b 85 bc 00 00 00    	mov    eax,DWORD PTR [rbp+0xbc]
   14033c99c:	41 ff c3             	inc    r11d
   14033c99f:	41 03 45 10          	add    eax,DWORD PTR [r13+0x10]
   14033c9a3:	48 83 c3 04          	add    rbx,0x4
   14033c9a7:	44 3b d8             	cmp    r11d,eax
   14033c9aa:	7c 94                	jl     0x14033c940
   14033c9ac:	49 8b 85 38 06 00 00 	mov    rax,QWORD PTR [r13+0x638]
   14033c9b3:	45 33 db             	xor    r11d,r11d
   14033c9b6:	4d 8b b5 40 06 00 00 	mov    r14,QWORD PTR [r13+0x640]
   14033c9bd:	49 8b bd 48 06 00 00 	mov    rdi,QWORD PTR [r13+0x648]
   14033c9c4:	4c 8b 48 08          	mov    r9,QWORD PTR [rax+0x8]
   14033c9c8:	41 c7 06 00 00 00 00 	mov    DWORD PTR [r14],0x0
   14033c9cf:	44 89 3f             	mov    DWORD PTR [rdi],r15d
   14033c9d2:	42 8b 04 9f          	mov    eax,DWORD PTR [rdi+r11*4]
   14033c9d6:	4f 63 14 9e          	movsxd r10,DWORD PTR [r14+r11*4]
   14033c9da:	ff c8                	dec    eax
   14033c9dc:	44 3b d0             	cmp    r10d,eax
   14033c9df:	0f 8d d4 00 00 00    	jge    0x14033cab9
   14033c9e5:	4a 63 2c 96          	movsxd rbp,DWORD PTR [rsi+r10*4]
   14033c9e9:	4d 8b c2             	mov    r8,r10
   14033c9ec:	48 63 d0             	movsxd rdx,eax
   14033c9ef:	4c 3b d2             	cmp    r10,rdx
   14033c9f2:	0f 8d 9e 00 00 00    	jge    0x14033ca96
   14033c9f8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033c9ff:	00 
   14033ca00:	49 8b 04 e9          	mov    rax,QWORD PTR [r9+rbp*8]
   14033ca04:	f3 0f 10 40 54       	movss  xmm0,DWORD PTR [rax+0x54]
   14033ca09:	8b 04 96             	mov    eax,DWORD PTR [rsi+rdx*4]
   14033ca0c:	49 8b 0c c1          	mov    rcx,QWORD PTR [r9+rax*8]
   14033ca10:	0f 2f 41 54          	comiss xmm0,DWORD PTR [rcx+0x54]
   14033ca14:	72 16                	jb     0x14033ca2c
   14033ca16:	4c 3b c2             	cmp    r8,rdx
   14033ca19:	7d 23                	jge    0x14033ca3e
   14033ca1b:	8b 44 96 fc          	mov    eax,DWORD PTR [rsi+rdx*4-0x4]
   14033ca1f:	48 ff ca             	dec    rdx
   14033ca22:	49 8b 0c c1          	mov    rcx,QWORD PTR [r9+rax*8]
   14033ca26:	0f 2f 41 54          	comiss xmm0,DWORD PTR [rcx+0x54]
   14033ca2a:	73 ea                	jae    0x14033ca16
   14033ca2c:	4c 3b c2             	cmp    r8,rdx
   14033ca2f:	7d 0d                	jge    0x14033ca3e
   14033ca31:	8b 04 96             	mov    eax,DWORD PTR [rsi+rdx*4]
   14033ca34:	41 ff c2             	inc    r10d
   14033ca37:	42 89 04 86          	mov    DWORD PTR [rsi+r8*4],eax
   14033ca3b:	49 ff c0             	inc    r8
   14033ca3e:	49 8b 04 e9          	mov    rax,QWORD PTR [r9+rbp*8]
   14033ca42:	f3 0f 10 48 54       	movss  xmm1,DWORD PTR [rax+0x54]
   14033ca47:	42 8b 04 86          	mov    eax,DWORD PTR [rsi+r8*4]
   14033ca4b:	49 8b 0c c1          	mov    rcx,QWORD PTR [r9+rax*8]
   14033ca4f:	f3 0f 10 41 54       	movss  xmm0,DWORD PTR [rcx+0x54]
   14033ca54:	0f 2f c1             	comiss xmm0,xmm1
   14033ca57:	72 25                	jb     0x14033ca7e
   14033ca59:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14033ca60:	4c 3b c2             	cmp    r8,rdx
   14033ca63:	7d 31                	jge    0x14033ca96
   14033ca65:	42 8b 44 86 04       	mov    eax,DWORD PTR [rsi+r8*4+0x4]
   14033ca6a:	49 ff c0             	inc    r8
   14033ca6d:	41 ff c2             	inc    r10d
   14033ca70:	49 8b 0c c1          	mov    rcx,QWORD PTR [r9+rax*8]
   14033ca74:	f3 0f 10 41 54       	movss  xmm0,DWORD PTR [rcx+0x54]
   14033ca79:	0f 2f c1             	comiss xmm0,xmm1
   14033ca7c:	73 e2                	jae    0x14033ca60
   14033ca7e:	4c 3b c2             	cmp    r8,rdx
   14033ca81:	7d 13                	jge    0x14033ca96
   14033ca83:	42 8b 04 86          	mov    eax,DWORD PTR [rsi+r8*4]
   14033ca87:	89 04 96             	mov    DWORD PTR [rsi+rdx*4],eax
   14033ca8a:	48 ff ca             	dec    rdx
   14033ca8d:	4c 3b c2             	cmp    r8,rdx
   14033ca90:	0f 8c 6a ff ff ff    	jl     0x14033ca00
   14033ca96:	49 63 c2             	movsxd rax,r10d
   14033ca99:	89 2c 86             	mov    DWORD PTR [rsi+rax*4],ebp
   14033ca9c:	41 8d 42 01          	lea    eax,[r10+0x1]
   14033caa0:	43 89 44 9e 04       	mov    DWORD PTR [r14+r11*4+0x4],eax
   14033caa5:	42 8b 04 9f          	mov    eax,DWORD PTR [rdi+r11*4]
   14033caa9:	42 89 44 9f 04       	mov    DWORD PTR [rdi+r11*4+0x4],eax
   14033caae:	b8 01 00 00 00       	mov    eax,0x1
   14033cab3:	46 89 14 9f          	mov    DWORD PTR [rdi+r11*4],r10d
   14033cab7:	eb 07                	jmp    0x14033cac0
   14033cab9:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   14033cac0:	4c 03 d8             	add    r11,rax
   14033cac3:	0f 89 09 ff ff ff    	jns    0x14033c9d2
   14033cac9:	45 33 db             	xor    r11d,r11d
   14033cacc:	41 8b d3             	mov    edx,r11d
   14033cacf:	41 8b eb             	mov    ebp,r11d
   14033cad2:	89 94 24 70 01 00 00 	mov    DWORD PTR [rsp+0x170],edx
   14033cad9:	45 39 5d 0c          	cmp    DWORD PTR [r13+0xc],r11d
   14033cadd:	0f 8e 9c 00 00 00    	jle    0x14033cb7f
   14033cae3:	4c 8b 84 24 68 01 00 	mov    r8,QWORD PTR [rsp+0x168]
   14033caea:	00 
   14033caeb:	45 8b f3             	mov    r14d,r11d
   14033caee:	66 90                	xchg   ax,ax
   14033caf0:	49 8b 40 10          	mov    rax,QWORD PTR [r8+0x10]
   14033caf4:	69 fd 00 15 00 00    	imul   edi,ebp,0x1500
   14033cafa:	41 8b 1c 06          	mov    ebx,DWORD PTR [r14+rax*1]
   14033cafe:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   14033cb02:	4c 8d 14 f8          	lea    r10,[rax+rdi*8]
   14033cb06:	85 db                	test   ebx,ebx
   14033cb08:	74 5f                	je     0x14033cb69
   14033cb0a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14033cb10:	49 8b 02             	mov    rax,QWORD PTR [r10]
   14033cb13:	45 33 c9             	xor    r9d,r9d
   14033cb16:	44 38 48 4b          	cmp    BYTE PTR [rax+0x4b],r9b
   14033cb1a:	76 39                	jbe    0x14033cb55
   14033cb1c:	46 8d 04 1f          	lea    r8d,[rdi+r11*1]
   14033cb20:	41 81 e0 ff ff ff 00 	and    r8d,0xffffff
   14033cb27:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033cb2e:	00 00 
   14033cb30:	8b c2                	mov    eax,edx
   14033cb32:	41 ff c1             	inc    r9d
   14033cb35:	ff c2                	inc    edx
   14033cb37:	45 89 04 84          	mov    DWORD PTR [r12+rax*4],r8d
   14033cb3b:	41 81 c0 00 00 00 01 	add    r8d,0x1000000
   14033cb42:	49 8b 02             	mov    rax,QWORD PTR [r10]
   14033cb45:	0f b6 48 4b          	movzx  ecx,BYTE PTR [rax+0x4b]
   14033cb49:	44 3b c9             	cmp    r9d,ecx
   14033cb4c:	72 e2                	jb     0x14033cb30
   14033cb4e:	89 94 24 70 01 00 00 	mov    DWORD PTR [rsp+0x170],edx
   14033cb55:	41 ff c3             	inc    r11d
   14033cb58:	49 83 c2 08          	add    r10,0x8
   14033cb5c:	44 3b db             	cmp    r11d,ebx
   14033cb5f:	72 af                	jb     0x14033cb10
   14033cb61:	4c 8b 84 24 68 01 00 	mov    r8,QWORD PTR [rsp+0x168]
   14033cb68:	00 
   14033cb69:	ff c5                	inc    ebp
   14033cb6b:	49 83 c6 04          	add    r14,0x4
   14033cb6f:	41 bb 00 00 00 00    	mov    r11d,0x0
   14033cb75:	41 3b 6d 0c          	cmp    ebp,DWORD PTR [r13+0xc]
   14033cb79:	0f 8c 71 ff ff ff    	jl     0x14033caf0
   14033cb7f:	83 3d 76 ce 5f 00 00 	cmp    DWORD PTR [rip+0x5fce76],0x0        # 0x1409399fc
   14033cb86:	44 89 9c 24 68 01 00 	mov    DWORD PTR [rsp+0x168],r11d
   14033cb8d:	00 
   14033cb8e:	0f 86 86 01 00 00    	jbe    0x14033cd1a
   14033cb94:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033cb98:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033cb9f:	00 
   14033cba0:	48 8d 84 24 68 01 00 	lea    rax,[rsp+0x168]
   14033cba7:	00 
   14033cba8:	c6 44 24 30 01       	mov    BYTE PTR [rsp+0x30],0x1
   14033cbad:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14033cbb2:	48 8d 54 24 60       	lea    rdx,[rsp+0x60]
   14033cbb7:	48 8d 84 24 78 01 00 	lea    rax,[rsp+0x178]
   14033cbbe:	00 
   14033cbbf:	44 89 5c 24 60       	mov    DWORD PTR [rsp+0x60],r11d
   14033cbc4:	45 8b cf             	mov    r9d,r15d
   14033cbc7:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14033cbcc:	4c 8b c6             	mov    r8,rsi
   14033cbcf:	49 8b cd             	mov    rcx,r13
   14033cbd2:	e8 d9 e1 ff ff       	call   0x14033adb0
   14033cbd7:	48 8b e8             	mov    rbp,rax
   14033cbda:	48 85 c0             	test   rax,rax
   14033cbdd:	0f 84 15 01 00 00    	je     0x14033ccf8
   14033cbe3:	4c 8b b4 24 60 01 00 	mov    r14,QWORD PTR [rsp+0x160]
   14033cbea:	00 
   14033cbeb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14033cbf0:	8b 9c 24 78 01 00 00 	mov    ebx,DWORD PTR [rsp+0x178]
   14033cbf7:	48 8d 84 24 70 01 00 	lea    rax,[rsp+0x170]
   14033cbfe:	00 
   14033cbff:	8b bc 24 68 01 00 00 	mov    edi,DWORD PTR [rsp+0x168]
   14033cc06:	44 8b cb             	mov    r9d,ebx
   14033cc09:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   14033cc0e:	4c 8b c5             	mov    r8,rbp
   14033cc11:	4c 89 64 24 28       	mov    QWORD PTR [rsp+0x28],r12
   14033cc16:	49 8b d5             	mov    rdx,r13
   14033cc19:	49 8b ce             	mov    rcx,r14
   14033cc1c:	89 7c 24 20          	mov    DWORD PTR [rsp+0x20],edi
   14033cc20:	e8 4b e6 ff ff       	call   0x14033b270
   14033cc25:	48 8d 44 24 64       	lea    rax,[rsp+0x64]
   14033cc2a:	48 c7 44 24 30 00 00 	mov    QWORD PTR [rsp+0x30],0x0
   14033cc31:	00 00 
   14033cc33:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14033cc38:	44 8b cb             	mov    r9d,ebx
   14033cc3b:	4c 8b c5             	mov    r8,rbp
   14033cc3e:	89 7c 24 20          	mov    DWORD PTR [rsp+0x20],edi
   14033cc42:	49 8b d5             	mov    rdx,r13
   14033cc45:	49 8b ce             	mov    rcx,r14
   14033cc48:	e8 13 e9 ff ff       	call   0x14033b560
   14033cc4d:	0f bf 4d 0a          	movsx  ecx,WORD PTR [rbp+0xa]
   14033cc51:	4c 8b ce             	mov    r9,rsi
   14033cc54:	8b 94 24 70 01 00 00 	mov    edx,DWORD PTR [rsp+0x170]
   14033cc5b:	03 cb                	add    ecx,ebx
   14033cc5d:	f3 0f 10 44 24 64    	movss  xmm0,DWORD PTR [rsp+0x64]
   14033cc63:	44 69 c1 00 15 00 00 	imul   r8d,ecx,0x1500
   14033cc6a:	8b cf                	mov    ecx,edi
   14033cc6c:	c6 44 24 50 01       	mov    BYTE PTR [rsp+0x50],0x1
   14033cc71:	f3 0f 11 44 24 48    	movss  DWORD PTR [rsp+0x48],xmm0
   14033cc77:	89 7c 24 40          	mov    DWORD PTR [rsp+0x40],edi
   14033cc7b:	c1 e1 18             	shl    ecx,0x18
   14033cc7e:	44 03 c0             	add    r8d,eax
   14033cc81:	89 5c 24 38          	mov    DWORD PTR [rsp+0x38],ebx
   14033cc85:	41 81 e0 ff ff ff 00 	and    r8d,0xffffff
   14033cc8c:	89 44 24 30          	mov    DWORD PTR [rsp+0x30],eax
   14033cc90:	44 03 c1             	add    r8d,ecx
   14033cc93:	48 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],rbp
   14033cc98:	45 89 04 94          	mov    DWORD PTR [r12+rdx*4],r8d
   14033cc9c:	49 8b ce             	mov    rcx,r14
   14033cc9f:	ff c2                	inc    edx
   14033cca1:	44 89 7c 24 20       	mov    DWORD PTR [rsp+0x20],r15d
   14033cca6:	89 94 24 70 01 00 00 	mov    DWORD PTR [rsp+0x170],edx
   14033ccad:	4c 8d 44 24 60       	lea    r8,[rsp+0x60]
   14033ccb2:	49 8b d5             	mov    rdx,r13
   14033ccb5:	e8 16 f3 ff ff       	call   0x14033bfd0
   14033ccba:	48 8d 84 24 68 01 00 	lea    rax,[rsp+0x168]
   14033ccc1:	00 
   14033ccc2:	c6 44 24 30 01       	mov    BYTE PTR [rsp+0x30],0x1
   14033ccc7:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14033cccc:	48 8d 54 24 60       	lea    rdx,[rsp+0x60]
   14033ccd1:	48 8d 84 24 78 01 00 	lea    rax,[rsp+0x178]
   14033ccd8:	00 
   14033ccd9:	45 8b cf             	mov    r9d,r15d
   14033ccdc:	4c 8b c6             	mov    r8,rsi
   14033ccdf:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14033cce4:	49 8b cd             	mov    rcx,r13
   14033cce7:	e8 c4 e0 ff ff       	call   0x14033adb0
   14033ccec:	48 8b e8             	mov    rbp,rax
   14033ccef:	48 85 c0             	test   rax,rax
   14033ccf2:	0f 85 f8 fe ff ff    	jne    0x14033cbf0
   14033ccf8:	8b 84 24 68 01 00 00 	mov    eax,DWORD PTR [rsp+0x168]
   14033ccff:	41 bb 00 00 00 00    	mov    r11d,0x0
   14033cd05:	ff c0                	inc    eax
   14033cd07:	3b 05 ef cc 5f 00    	cmp    eax,DWORD PTR [rip+0x5fccef]        # 0x1409399fc
   14033cd0d:	89 84 24 68 01 00 00 	mov    DWORD PTR [rsp+0x168],eax
   14033cd14:	0f 82 86 fe ff ff    	jb     0x14033cba0
   14033cd1a:	41 8b 85 48 05 00 00 	mov    eax,DWORD PTR [r13+0x548]
   14033cd21:	4c 8b bc 24 18 01 00 	mov    r15,QWORD PTR [rsp+0x118]
   14033cd28:	00 
   14033cd29:	4c 8b b4 24 20 01 00 	mov    r14,QWORD PTR [rsp+0x120]
   14033cd30:	00 
   14033cd31:	4c 8b a4 24 28 01 00 	mov    r12,QWORD PTR [rsp+0x128]
   14033cd38:	00 
   14033cd39:	48 8b ac 24 30 01 00 	mov    rbp,QWORD PTR [rsp+0x130]
   14033cd40:	00 
   14033cd41:	48 8b 7c 24 68       	mov    rdi,QWORD PTR [rsp+0x68]
   14033cd46:	48 8b b4 24 60 01 00 	mov    rsi,QWORD PTR [rsp+0x160]
   14033cd4d:	00 
   14033cd4e:	85 c0                	test   eax,eax
   14033cd50:	0f 84 a8 00 00 00    	je     0x14033cdfe
   14033cd56:	4c 8d 4f 0a          	lea    r9,[rdi+0xa]
   14033cd5a:	8b d8                	mov    ebx,eax
   14033cd5c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033cd60:	41 f6 41 02 01       	test   BYTE PTR [r9+0x2],0x1
   14033cd65:	0f 85 7e 00 00 00    	jne    0x14033cde9
   14033cd6b:	41 80 79 1a 01       	cmp    BYTE PTR [r9+0x1a],0x1
   14033cd70:	0f 85 73 00 00 00    	jne    0x14033cde9
   14033cd76:	45 0f bf 11          	movsx  r10d,WORD PTR [r9]
   14033cd7a:	45 0f b7 41 fe       	movzx  r8d,WORD PTR [r9-0x2]
   14033cd7f:	8b 96 b8 00 00 00    	mov    edx,DWORD PTR [rsi+0xb8]
   14033cd85:	45 8b 5d 10          	mov    r11d,DWORD PTR [r13+0x10]
   14033cd89:	43 8d 0c 10          	lea    ecx,[r8+r10*1]
   14033cd8d:	41 8d 04 13          	lea    eax,[r11+rdx*1]
   14033cd91:	3b c8                	cmp    ecx,eax
   14033cd93:	7e 11                	jle    0x14033cda6
   14033cd95:	66 41 2b d2          	sub    dx,r10w
   14033cd99:	66 41 03 d3          	add    dx,r11w
   14033cd9d:	66 41 89 51 fe       	mov    WORD PTR [r9-0x2],dx
   14033cda2:	44 0f b7 c2          	movzx  r8d,dx
   14033cda6:	4d 8b 51 f6          	mov    r10,QWORD PTR [r9-0xa]
   14033cdaa:	45 33 db             	xor    r11d,r11d
   14033cdad:	41 8b d3             	mov    edx,r11d
   14033cdb0:	66 45 3b d8          	cmp    r11w,r8w
   14033cdb4:	73 33                	jae    0x14033cde9
   14033cdb6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033cdbd:	00 00 00 
   14033cdc0:	41 0f bf 01          	movsx  eax,WORD PTR [r9]
   14033cdc4:	03 c2                	add    eax,edx
   14033cdc6:	41 3b 45 0c          	cmp    eax,DWORD PTR [r13+0xc]
   14033cdca:	72 12                	jb     0x14033cdde
   14033cdcc:	8b c2                	mov    eax,edx
   14033cdce:	48 6b c8 5c          	imul   rcx,rax,0x5c
   14033cdd2:	66 46 89 5c 11 4c    	mov    WORD PTR [rcx+r10*1+0x4c],r11w
   14033cdd8:	42 80 4c 11 48 40    	or     BYTE PTR [rcx+r10*1+0x48],0x40
   14033cdde:	41 0f b7 41 fe       	movzx  eax,WORD PTR [r9-0x2]
   14033cde3:	ff c2                	inc    edx
   14033cde5:	3b d0                	cmp    edx,eax
   14033cde7:	72 d7                	jb     0x14033cdc0
   14033cde9:	49 83 c1 28          	add    r9,0x28
   14033cded:	48 83 eb 01          	sub    rbx,0x1
   14033cdf1:	0f 85 69 ff ff ff    	jne    0x14033cd60
   14033cdf7:	41 8b 85 48 05 00 00 	mov    eax,DWORD PTR [r13+0x548]
   14033cdfe:	44 8b c8             	mov    r9d,eax
   14033ce01:	4c 8b c7             	mov    r8,rdi
   14033ce04:	49 8b d5             	mov    rdx,r13
   14033ce07:	48 8b ce             	mov    rcx,rsi
   14033ce0a:	48 81 c4 38 01 00 00 	add    rsp,0x138
   14033ce11:	41 5d                	pop    r13
   14033ce13:	5f                   	pop    rdi
   14033ce14:	5e                   	pop    rsi
   14033ce15:	5b                   	pop    rbx
   14033ce16:	e9 05 cf ff ff       	jmp    0x140339d20
   14033ce1b:	90                   	nop
   14033ce1c:	97                   	xchg   edi,eax
   14033ce1d:	c7                   	(bad)
   14033ce1e:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce20:	09 c8                	or     eax,ecx
   14033ce22:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce24:	9e                   	sahf
   14033ce25:	c7                   	(bad)
   14033ce26:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce28:	a8 c7                	test   al,0xc7
   14033ce2a:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce2c:	b2 c7                	mov    dl,0xc7
   14033ce2e:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce30:	bc c7 33 00 bc       	mov    esp,0xbc0033c7
   14033ce35:	c7                   	(bad)
   14033ce36:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce38:	c3                   	ret
   14033ce39:	c7                   	(bad)
   14033ce3a:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce3c:	c3                   	ret
   14033ce3d:	c7                   	(bad)
   14033ce3e:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce40:	ca c7 33             	retf   0x33c7
   14033ce43:	00 ca                	add    dl,cl
   14033ce45:	c7                   	(bad)
   14033ce46:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce48:	ca c7 33             	retf   0x33c7
   14033ce4b:	00 ca                	add    dl,cl
   14033ce4d:	c7                   	(bad)
   14033ce4e:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce50:	d1 c7                	rol    edi,1
   14033ce52:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce54:	d1 c7                	rol    edi,1
   14033ce56:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce58:	d1 c7                	rol    edi,1
   14033ce5a:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce5c:	d8 c7                	fadd   st,st(7)
   14033ce5e:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce60:	d8 c7                	fadd   st,st(7)
   14033ce62:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce64:	d8 c7                	fadd   st,st(7)
   14033ce66:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce68:	df c7                	ffreep st(7)
   14033ce6a:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce6c:	df c7                	ffreep st(7)
   14033ce6e:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce70:	df c7                	ffreep st(7)
   14033ce72:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce74:	df c7                	ffreep st(7)
   14033ce76:	33 00                	xor    eax,DWORD PTR [rax]
   14033ce78:	cc                   	int3
   14033ce79:	cc                   	int3
   14033ce7a:	cc                   	int3
   14033ce7b:	cc                   	int3
   14033ce7c:	cc                   	int3
   14033ce7d:	cc                   	int3
   14033ce7e:	cc                   	int3
   14033ce7f:	cc                   	int3
   14033ce80:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14033ce85:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   14033ce8a:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   14033ce8f:	48 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],rdi
   14033ce94:	41 56                	push   r14
   14033ce96:	48 83 ec 20          	sub    rsp,0x20
   14033ce9a:	f3 0f 10 05 0a d3 64 	movss  xmm0,DWORD PTR [rip+0x64d30a]        # 0x14098a1ac
   14033cea1:	00 
   14033cea2:	4c 8b f2             	mov    r14,rdx
   14033cea5:	f3 0f 59 05 63 a2 35 	mulss  xmm0,DWORD PTR [rip+0x35a263]        # 0x140697110
   14033ceac:	00 
   14033cead:	8b f9                	mov    edi,ecx
   14033ceaf:	bb 01 00 00 00       	mov    ebx,0x1
   14033ceb4:	49 8b f0             	mov    rsi,r8
   14033ceb7:	41 0f b6 4e 25       	movzx  ecx,BYTE PTR [r14+0x25]
   14033cebc:	f3 0f 58 05 18 31 51 	addss  xmm0,DWORD PTR [rip+0x513118]        # 0x14084ffdc
   14033cec3:	00 
   14033cec4:	f3 41 0f 10 56 1c    	movss  xmm2,DWORD PTR [r14+0x1c]
   14033ceca:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14033cece:	66 0f 6e c1          	movd   xmm0,ecx
   14033ced2:	3b c3                	cmp    eax,ebx
   14033ced4:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14033ced7:	0f 4f d8             	cmovg  ebx,eax
   14033ceda:	0f bf 42 0a          	movsx  eax,WORD PTR [rdx+0xa]
   14033cede:	2b f8                	sub    edi,eax
   14033cee0:	48 63 c7             	movsxd rax,edi
   14033cee3:	48 6b d0 5c          	imul   rdx,rax,0x5c
   14033cee7:	49 8b 06             	mov    rax,QWORD PTR [r14]
   14033ceea:	f3 0f 10 5c 02 50    	movss  xmm3,DWORD PTR [rdx+rax*1+0x50]
   14033cef0:	41 0f b6 56 24       	movzx  edx,BYTE PTR [r14+0x24]
   14033cef5:	e8 c6 93 00 00       	call   0x1403462c0
   14033cefa:	33 c0                	xor    eax,eax
   14033cefc:	f3 0f 11 46 0c       	movss  DWORD PTR [rsi+0xc],xmm0
   14033cf01:	8b ef                	mov    ebp,edi
   14033cf03:	2b eb                	sub    ebp,ebx
   14033cf05:	85 ed                	test   ebp,ebp
   14033cf07:	0f 4e e8             	cmovle ebp,eax
   14033cf0a:	03 fb                	add    edi,ebx
   14033cf0c:	48 63 c5             	movsxd rax,ebp
   14033cf0f:	48 6b d8 5c          	imul   rbx,rax,0x5c
   14033cf13:	f3 0f 11 46 04       	movss  DWORD PTR [rsi+0x4],xmm0
   14033cf18:	8b c7                	mov    eax,edi
   14033cf1a:	41 0f b7 4e 08       	movzx  ecx,WORD PTR [r14+0x8]
   14033cf1f:	ff c9                	dec    ecx
   14033cf21:	3b f9                	cmp    edi,ecx
   14033cf23:	0f 4d c1             	cmovge eax,ecx
   14033cf26:	3b e8                	cmp    ebp,eax
   14033cf28:	7f 4c                	jg     0x14033cf76
   14033cf2a:	41 0f b6 4e 25       	movzx  ecx,BYTE PTR [r14+0x25]
   14033cf2f:	49 8b 06             	mov    rax,QWORD PTR [r14]
   14033cf32:	f3 41 0f 10 56 1c    	movss  xmm2,DWORD PTR [r14+0x1c]
   14033cf38:	41 0f b6 56 24       	movzx  edx,BYTE PTR [r14+0x24]
   14033cf3d:	66 0f 6e c1          	movd   xmm0,ecx
   14033cf41:	f3 0f 10 5c 03 50    	movss  xmm3,DWORD PTR [rbx+rax*1+0x50]
   14033cf47:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14033cf4a:	e8 71 93 00 00       	call   0x1403462c0
   14033cf4f:	f3 0f 10 4e 0c       	movss  xmm1,DWORD PTR [rsi+0xc]
   14033cf54:	0f 2f c1             	comiss xmm0,xmm1
   14033cf57:	76 03                	jbe    0x14033cf5c
   14033cf59:	0f 28 c8             	movaps xmm1,xmm0
   14033cf5c:	f3 0f 11 4e 0c       	movss  DWORD PTR [rsi+0xc],xmm1
   14033cf61:	f3 0f 10 56 04       	movss  xmm2,DWORD PTR [rsi+0x4]
   14033cf66:	0f 2f d0             	comiss xmm2,xmm0
   14033cf69:	77 03                	ja     0x14033cf6e
   14033cf6b:	0f 28 c2             	movaps xmm0,xmm2
   14033cf6e:	ff c5                	inc    ebp
   14033cf70:	48 83 c3 5c          	add    rbx,0x5c
   14033cf74:	eb 9d                	jmp    0x14033cf13
   14033cf76:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14033cf7a:	f2 0f 59 05 ce 11 35 	mulsd  xmm0,QWORD PTR [rip+0x3511ce]        # 0x14068e150
   14033cf81:	00 
   14033cf82:	f2 0f 5e 05 e6 11 35 	divsd  xmm0,QWORD PTR [rip+0x3511e6]        # 0x14068e170
   14033cf89:	00 
   14033cf8a:	e8 e5 3d 2e 00       	call   0x140620d74
   14033cf8f:	f2 0f 59 05 a9 11 35 	mulsd  xmm0,QWORD PTR [rip+0x3511a9]        # 0x14068e140
   14033cf96:	00 
   14033cf97:	f2 0f 5e 05 79 11 35 	divsd  xmm0,QWORD PTR [rip+0x351179]        # 0x14068e118
   14033cf9e:	00 
   14033cf9f:	f2 0f 58 05 91 11 35 	addsd  xmm0,QWORD PTR [rip+0x351191]        # 0x14068e138
   14033cfa6:	00 
   14033cfa7:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033cfab:	f3 0f 11 06          	movss  DWORD PTR [rsi],xmm0
   14033cfaf:	f3 0f 10 46 0c       	movss  xmm0,DWORD PTR [rsi+0xc]
   14033cfb4:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033cfb7:	f2 0f 59 05 91 11 35 	mulsd  xmm0,QWORD PTR [rip+0x351191]        # 0x14068e150
   14033cfbe:	00 
   14033cfbf:	f2 0f 5e 05 a9 11 35 	divsd  xmm0,QWORD PTR [rip+0x3511a9]        # 0x14068e170
   14033cfc6:	00 
   14033cfc7:	e8 a8 3d 2e 00       	call   0x140620d74
   14033cfcc:	f2 0f 59 05 6c 11 35 	mulsd  xmm0,QWORD PTR [rip+0x35116c]        # 0x14068e140
   14033cfd3:	00 
   14033cfd4:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   14033cfd9:	48 8b 6c 24 38       	mov    rbp,QWORD PTR [rsp+0x38]
   14033cfde:	48 8b 7c 24 48       	mov    rdi,QWORD PTR [rsp+0x48]
   14033cfe3:	f2 0f 5e 05 2d 11 35 	divsd  xmm0,QWORD PTR [rip+0x35112d]        # 0x14068e118
   14033cfea:	00 
   14033cfeb:	f2 0f 58 05 45 11 35 	addsd  xmm0,QWORD PTR [rip+0x351145]        # 0x14068e138
   14033cff2:	00 
   14033cff3:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033cff7:	f3 0f 11 46 08       	movss  DWORD PTR [rsi+0x8],xmm0
   14033cffc:	48 8b 74 24 40       	mov    rsi,QWORD PTR [rsp+0x40]
   14033d001:	48 83 c4 20          	add    rsp,0x20
   14033d005:	41 5e                	pop    r14
   14033d007:	c3                   	ret
   14033d008:	cc                   	int3
   14033d009:	cc                   	int3
   14033d00a:	cc                   	int3
   14033d00b:	cc                   	int3
   14033d00c:	cc                   	int3
   14033d00d:	cc                   	int3
   14033d00e:	cc                   	int3
   14033d00f:	cc                   	int3
   14033d010:	48 8b c4             	mov    rax,rsp
   14033d013:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   14033d017:	48 89 68 18          	mov    QWORD PTR [rax+0x18],rbp
   14033d01b:	48 89 70 20          	mov    QWORD PTR [rax+0x20],rsi
   14033d01f:	57                   	push   rdi
   14033d020:	41 54                	push   r12
   14033d022:	41 55                	push   r13
   14033d024:	41 56                	push   r14
   14033d026:	41 57                	push   r15
   14033d028:	48 81 ec f0 00 00 00 	sub    rsp,0xf0
   14033d02f:	0f 29 70 c8          	movaps XMMWORD PTR [rax-0x38],xmm6
   14033d033:	0f 29 78 b8          	movaps XMMWORD PTR [rax-0x48],xmm7
   14033d037:	44 0f 29 40 a8       	movaps XMMWORD PTR [rax-0x58],xmm8
   14033d03c:	44 0f 29 48 98       	movaps XMMWORD PTR [rax-0x68],xmm9
   14033d041:	44 0f 29 50 88       	movaps XMMWORD PTR [rax-0x78],xmm10
   14033d046:	44 0f 29 98 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm11
   14033d04d:	ff 
   14033d04e:	44 0f 29 a0 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm12
   14033d055:	ff 
   14033d056:	44 0f 29 6c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm13
   14033d05c:	44 0f 29 74 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm14
   14033d062:	44 0f 29 7c 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm15
   14033d068:	48 8b 05 f9 50 63 00 	mov    rax,QWORD PTR [rip+0x6350f9]        # 0x140972168
   14033d06f:	48 33 c4             	xor    rax,rsp
   14033d072:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   14033d077:	4c 8b b4 24 50 01 00 	mov    r14,QWORD PTR [rsp+0x150]
   14033d07e:	00 
   14033d07f:	45 0f b7 f8          	movzx  r15d,r8w
   14033d083:	48 8b 84 24 58 01 00 	mov    rax,QWORD PTR [rsp+0x158]
   14033d08a:	00 
   14033d08b:	4c 8b e2             	mov    r12,rdx
   14033d08e:	44 89 4c 24 20       	mov    DWORD PTR [rsp+0x20],r9d
   14033d093:	48 89 4c 24 30       	mov    QWORD PTR [rsp+0x30],rcx
   14033d098:	45 0f b7 16          	movzx  r10d,WORD PTR [r14]
   14033d09c:	66 41 ff c2          	inc    r10w
   14033d0a0:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   14033d0a5:	66 45 89 16          	mov    WORD PTR [r14],r10w
   14033d0a9:	66 45 3b d0          	cmp    r10w,r8w
   14033d0ad:	0f 8d f0 03 00 00    	jge    0x14033d4a3
   14033d0b3:	4c 8b ac 24 48 01 00 	mov    r13,QWORD PTR [rsp+0x148]
   14033d0ba:	00 
   14033d0bb:	45 0f 57 ed          	xorps  xmm13,xmm13
   14033d0bf:	f3 44 0f 10 35 d4 a9 	movss  xmm14,DWORD PTR [rip+0x36a9d4]        # 0x1406a7a9c
   14033d0c6:	36 00 
   14033d0c8:	f3 0f 10 1d 40 a0 35 	movss  xmm3,DWORD PTR [rip+0x35a040]        # 0x140697110
   14033d0cf:	00 
   14033d0d0:	f3 0f 10 15 04 2f 51 	movss  xmm2,DWORD PTR [rip+0x512f04]        # 0x14084ffdc
   14033d0d7:	00 
   14033d0d8:	f2 0f 10 35 70 10 35 	movsd  xmm6,QWORD PTR [rip+0x351070]        # 0x14068e150
   14033d0df:	00 
   14033d0e0:	f3 44 0f 10 0d 47 2f 	movss  xmm9,DWORD PTR [rip+0x512f47]        # 0x140850030
   14033d0e7:	51 00 
   14033d0e9:	f3 44 0f 10 15 9a 10 	movss  xmm10,DWORD PTR [rip+0x35109a]        # 0x14068e18c
   14033d0f0:	35 00 
   14033d0f2:	f3 44 0f 10 1d 55 a9 	movss  xmm11,DWORD PTR [rip+0x36a955]        # 0x1406a7a50
   14033d0f9:	36 00 
   14033d0fb:	f3 44 0f 10 3d 60 a9 	movss  xmm15,DWORD PTR [rip+0x36a960]        # 0x1406a7a64
   14033d102:	36 00 
   14033d104:	f3 44 0f 10 25 7f bb 	movss  xmm12,DWORD PTR [rip+0x35bb7f]        # 0x140698c8c
   14033d10b:	35 00 
   14033d10d:	0f 1f 00             	nop    DWORD PTR [rax]
   14033d110:	49 0f bf c2          	movsx  rax,r10w
   14033d114:	49 8b 34 c4          	mov    rsi,QWORD PTR [r12+rax*8]
   14033d118:	44 8b 46 10          	mov    r8d,DWORD PTR [rsi+0x10]
   14033d11c:	45 3b 45 10          	cmp    r8d,DWORD PTR [r13+0x10]
   14033d120:	75 4b                	jne    0x14033d16d
   14033d122:	66 41 ff c2          	inc    r10w
   14033d126:	66 45 89 16          	mov    WORD PTR [r14],r10w
   14033d12a:	66 45 3b d7          	cmp    r10w,r15w
   14033d12e:	7d 30                	jge    0x14033d160
   14033d130:	41 0f b7 d2          	movzx  edx,r10w
   14033d134:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033d138:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033d13f:	00 
   14033d140:	48 0f bf c2          	movsx  rax,dx
   14033d144:	49 8b 0c c4          	mov    rcx,QWORD PTR [r12+rax*8]
   14033d148:	44 39 41 10          	cmp    DWORD PTR [rcx+0x10],r8d
   14033d14c:	75 12                	jne    0x14033d160
   14033d14e:	44 8d 52 01          	lea    r10d,[rdx+0x1]
   14033d152:	66 45 89 16          	mov    WORD PTR [r14],r10w
   14033d156:	41 0f b7 d2          	movzx  edx,r10w
   14033d15a:	66 45 3b d7          	cmp    r10w,r15w
   14033d15e:	7c e0                	jl     0x14033d140
   14033d160:	66 41 ff ca          	dec    r10w
   14033d164:	66 45 89 16          	mov    WORD PTR [r14],r10w
   14033d168:	e9 20 03 00 00       	jmp    0x14033d48d
   14033d16d:	0f b6 4e 25          	movzx  ecx,BYTE PTR [rsi+0x25]
   14033d171:	41 3a 4d 25          	cmp    cl,BYTE PTR [r13+0x25]
   14033d175:	0f 87 12 03 00 00    	ja     0x14033d48d
   14033d17b:	f3 0f 10 4e 18       	movss  xmm1,DWORD PTR [rsi+0x18]
   14033d180:	f3 41 0f 10 45 18    	movss  xmm0,DWORD PTR [r13+0x18]
   14033d186:	0f 2f c1             	comiss xmm0,xmm1
   14033d189:	0f 83 fe 02 00 00    	jae    0x14033d48d
   14033d18f:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   14033d194:	0f 2f c8             	comiss xmm1,xmm0
   14033d197:	0f 83 06 03 00 00    	jae    0x14033d4a3
   14033d19d:	f3 0f 10 05 07 d0 64 	movss  xmm0,DWORD PTR [rip+0x64d007]        # 0x14098a1ac
   14033d1a4:	00 
   14033d1a5:	bf 01 00 00 00       	mov    edi,0x1
   14033d1aa:	f3 0f 59 c3          	mulss  xmm0,xmm3
   14033d1ae:	41 8b d9             	mov    ebx,r9d
   14033d1b1:	0f b6 c9             	movzx  ecx,cl
   14033d1b4:	f3 0f 58 c2          	addss  xmm0,xmm2
   14033d1b8:	f3 0f 10 56 1c       	movss  xmm2,DWORD PTR [rsi+0x1c]
   14033d1bd:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14033d1c1:	66 0f 6e c1          	movd   xmm0,ecx
   14033d1c5:	3b c7                	cmp    eax,edi
   14033d1c7:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14033d1ca:	0f 4f f8             	cmovg  edi,eax
   14033d1cd:	0f bf 46 0a          	movsx  eax,WORD PTR [rsi+0xa]
   14033d1d1:	2b d8                	sub    ebx,eax
   14033d1d3:	48 63 c3             	movsxd rax,ebx
   14033d1d6:	48 6b d0 5c          	imul   rdx,rax,0x5c
   14033d1da:	48 8b 06             	mov    rax,QWORD PTR [rsi]
   14033d1dd:	f3 0f 10 5c 02 50    	movss  xmm3,DWORD PTR [rdx+rax*1+0x50]
   14033d1e3:	0f b6 56 24          	movzx  edx,BYTE PTR [rsi+0x24]
   14033d1e7:	e8 d4 90 00 00       	call   0x1403462c0
   14033d1ec:	8b eb                	mov    ebp,ebx
   14033d1ee:	b8 00 00 00 00       	mov    eax,0x0
   14033d1f3:	2b ef                	sub    ebp,edi
   14033d1f5:	44 0f 28 c0          	movaps xmm8,xmm0
   14033d1f9:	85 ed                	test   ebp,ebp
   14033d1fb:	0f 28 f8             	movaps xmm7,xmm0
   14033d1fe:	0f 4e e8             	cmovle ebp,eax
   14033d201:	03 fb                	add    edi,ebx
   14033d203:	48 63 c5             	movsxd rax,ebp
   14033d206:	48 6b d8 5c          	imul   rbx,rax,0x5c
   14033d20a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14033d210:	0f b7 4e 08          	movzx  ecx,WORD PTR [rsi+0x8]
   14033d214:	8b c7                	mov    eax,edi
   14033d216:	ff c9                	dec    ecx
   14033d218:	3b f9                	cmp    edi,ecx
   14033d21a:	0f 4d c1             	cmovge eax,ecx
   14033d21d:	3b e8                	cmp    ebp,eax
   14033d21f:	7f 3c                	jg     0x14033d25d
   14033d221:	0f b6 4e 25          	movzx  ecx,BYTE PTR [rsi+0x25]
   14033d225:	48 8b 06             	mov    rax,QWORD PTR [rsi]
   14033d228:	f3 0f 10 56 1c       	movss  xmm2,DWORD PTR [rsi+0x1c]
   14033d22d:	0f b6 56 24          	movzx  edx,BYTE PTR [rsi+0x24]
   14033d231:	66 0f 6e c1          	movd   xmm0,ecx
   14033d235:	f3 0f 10 5c 18 50    	movss  xmm3,DWORD PTR [rax+rbx*1+0x50]
   14033d23b:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14033d23e:	e8 7d 90 00 00       	call   0x1403462c0
   14033d243:	41 0f 2f c0          	comiss xmm0,xmm8
   14033d247:	76 04                	jbe    0x14033d24d
   14033d249:	44 0f 28 c0          	movaps xmm8,xmm0
   14033d24d:	0f 2f f8             	comiss xmm7,xmm0
   14033d250:	76 03                	jbe    0x14033d255
   14033d252:	0f 28 f8             	movaps xmm7,xmm0
   14033d255:	ff c5                	inc    ebp
   14033d257:	48 83 c3 5c          	add    rbx,0x5c
   14033d25b:	eb b3                	jmp    0x14033d210
   14033d25d:	0f 57 c0             	xorps  xmm0,xmm0
   14033d260:	f3 0f 5a c7          	cvtss2sd xmm0,xmm7
   14033d264:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14033d268:	f2 0f 5e 05 00 0f 35 	divsd  xmm0,QWORD PTR [rip+0x350f00]        # 0x14068e170
   14033d26f:	00 
   14033d270:	e8 ff 3a 2e 00       	call   0x140620d74
   14033d275:	f2 0f 59 05 c3 0e 35 	mulsd  xmm0,QWORD PTR [rip+0x350ec3]        # 0x14068e140
   14033d27c:	00 
   14033d27d:	0f 57 f6             	xorps  xmm6,xmm6
   14033d280:	f2 0f 5e 05 90 0e 35 	divsd  xmm0,QWORD PTR [rip+0x350e90]        # 0x14068e118
   14033d287:	00 
   14033d288:	f2 0f 58 05 a8 0e 35 	addsd  xmm0,QWORD PTR [rip+0x350ea8]        # 0x14068e138
   14033d28f:	00 
   14033d290:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033d294:	0f 57 c0             	xorps  xmm0,xmm0
   14033d297:	f3 41 0f 5a c0       	cvtss2sd xmm0,xmm8
   14033d29c:	f2 0f 59 05 ac 0e 35 	mulsd  xmm0,QWORD PTR [rip+0x350eac]        # 0x14068e150
   14033d2a3:	00 
   14033d2a4:	f2 0f 5e 05 c4 0e 35 	divsd  xmm0,QWORD PTR [rip+0x350ec4]        # 0x14068e170
   14033d2ab:	00 
   14033d2ac:	e8 c3 3a 2e 00       	call   0x140620d74
   14033d2b1:	f2 0f 59 05 87 0e 35 	mulsd  xmm0,QWORD PTR [rip+0x350e87]        # 0x14068e140
   14033d2b8:	00 
   14033d2b9:	0f 57 db             	xorps  xmm3,xmm3
   14033d2bc:	48 8b 8c 24 40 01 00 	mov    rcx,QWORD PTR [rsp+0x140]
   14033d2c3:	00 
   14033d2c4:	f3 0f 10 15 98 b9 35 	movss  xmm2,DWORD PTR [rip+0x35b998]        # 0x140698c64
   14033d2cb:	00 
   14033d2cc:	f2 0f 5e 05 44 0e 35 	divsd  xmm0,QWORD PTR [rip+0x350e44]        # 0x14068e118
   14033d2d3:	00 
   14033d2d4:	f3 0f 10 49 08       	movss  xmm1,DWORD PTR [rcx+0x8]
   14033d2d9:	f2 0f 58 05 57 0e 35 	addsd  xmm0,QWORD PTR [rip+0x350e57]        # 0x14068e138
   14033d2e0:	00 
   14033d2e1:	f3 0f 10 21          	movss  xmm4,DWORD PTR [rcx]
   14033d2e5:	f2 0f 5a d8          	cvtsd2ss xmm3,xmm0
   14033d2e9:	0f 28 c1             	movaps xmm0,xmm1
   14033d2ec:	f3 0f 58 c4          	addss  xmm0,xmm4
   14033d2f0:	f3 0f 59 05 e4 2c 51 	mulss  xmm0,DWORD PTR [rip+0x512ce4]        # 0x14084ffdc
   14033d2f7:	00 
   14033d2f8:	f3 0f 5c d0          	subss  xmm2,xmm0
   14033d2fc:	0f 28 c1             	movaps xmm0,xmm1
   14033d2ff:	f3 0f 5e 15 55 9e 35 	divss  xmm2,DWORD PTR [rip+0x359e55]        # 0x14069715c
   14033d306:	00 
   14033d307:	f3 41 0f 5f d5       	maxss  xmm2,xmm13
   14033d30c:	f3 0f 59 15 38 9e 35 	mulss  xmm2,DWORD PTR [rip+0x359e38]        # 0x14069714c
   14033d313:	00 
   14033d314:	f3 0f 58 15 50 9e 35 	addss  xmm2,DWORD PTR [rip+0x359e50]        # 0x14069716c
   14033d31b:	00 
   14033d31c:	f3 0f 58 c2          	addss  xmm0,xmm2
   14033d320:	0f 2f f0             	comiss xmm6,xmm0
   14033d323:	76 14                	jbe    0x14033d339
   14033d325:	45 0f b7 c7          	movzx  r8d,r15w
   14033d329:	49 8b d4             	mov    rdx,r12
   14033d32c:	49 8b ce             	mov    rcx,r14
   14033d32f:	e8 0c 90 00 00       	call   0x140346340
   14033d334:	e9 37 01 00 00       	jmp    0x14033d470
   14033d339:	0f 28 c4             	movaps xmm0,xmm4
   14033d33c:	f3 0f 5c c2          	subss  xmm0,xmm2
   14033d340:	0f 2f c3             	comiss xmm0,xmm3
   14033d343:	0f 87 27 01 00 00    	ja     0x14033d470
   14033d349:	0f 2f ce             	comiss xmm1,xmm6
   14033d34c:	72 0e                	jb     0x14033d35c
   14033d34e:	0f 2f dc             	comiss xmm3,xmm4
   14033d351:	72 09                	jb     0x14033d35c
   14033d353:	41 0f 28 c1          	movaps xmm0,xmm9
   14033d357:	e9 01 01 00 00       	jmp    0x14033d45d
   14033d35c:	0f 2f f1             	comiss xmm6,xmm1
   14033d35f:	76 07                	jbe    0x14033d368
   14033d361:	f3 0f 10 41 0c       	movss  xmm0,DWORD PTR [rcx+0xc]
   14033d366:	eb 1e                	jmp    0x14033d386
   14033d368:	f2 0f 10 09          	movsd  xmm1,QWORD PTR [rcx]
   14033d36c:	0f 28 f3             	movaps xmm6,xmm3
   14033d36f:	0f 28 c1             	movaps xmm0,xmm1
   14033d372:	f2 0f 11 4c 24 28    	movsd  QWORD PTR [rsp+0x28],xmm1
   14033d378:	f3 0f 10 4c 24 28    	movss  xmm1,DWORD PTR [rsp+0x28]
   14033d37e:	41 0f 28 f8          	movaps xmm7,xmm8
   14033d382:	0f c6 c0 55          	shufps xmm0,xmm0,0x55
   14033d386:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   14033d38b:	0f b6 80 91 00 00 00 	movzx  eax,BYTE PTR [rax+0x91]
   14033d392:	84 c0                	test   al,al
   14033d394:	74 06                	je     0x14033d39c
   14033d396:	41 0f 28 da          	movaps xmm3,xmm10
   14033d39a:	eb 04                	jmp    0x14033d3a0
   14033d39c:	41 0f 28 db          	movaps xmm3,xmm11
   14033d3a0:	f3 41 0f 59 df       	mulss  xmm3,xmm15
   14033d3a5:	0f 2f d8             	comiss xmm3,xmm0
   14033d3a8:	76 6d                	jbe    0x14033d417
   14033d3aa:	0f 2f ce             	comiss xmm1,xmm6
   14033d3ad:	72 3a                	jb     0x14033d3e9
   14033d3af:	f3 0f 5c ce          	subss  xmm1,xmm6
   14033d3b3:	f3 0f 5e ca          	divss  xmm1,xmm2
   14033d3b7:	84 c0                	test   al,al
   14033d3b9:	74 06                	je     0x14033d3c1
   14033d3bb:	41 0f 28 d2          	movaps xmm2,xmm10
   14033d3bf:	eb 04                	jmp    0x14033d3c5
   14033d3c1:	41 0f 28 d3          	movaps xmm2,xmm11
   14033d3c5:	f3 0f 5c c7          	subss  xmm0,xmm7
   14033d3c9:	f3 0f 5e c2          	divss  xmm0,xmm2
   14033d3cd:	0f 2f c1             	comiss xmm0,xmm1
   14033d3d0:	77 03                	ja     0x14033d3d5
   14033d3d2:	0f 28 c8             	movaps xmm1,xmm0
   14033d3d5:	44 0f 2f c9          	comiss xmm9,xmm1
   14033d3d9:	77 04                	ja     0x14033d3df
   14033d3db:	41 0f 28 c9          	movaps xmm1,xmm9
   14033d3df:	41 0f 28 c1          	movaps xmm0,xmm9
   14033d3e3:	f3 0f 5c c1          	subss  xmm0,xmm1
   14033d3e7:	eb 74                	jmp    0x14033d45d
   14033d3e9:	f3 0f 5c f1          	subss  xmm6,xmm1
   14033d3ed:	f3 0f 5e f2          	divss  xmm6,xmm2
   14033d3f1:	84 c0                	test   al,al
   14033d3f3:	74 11                	je     0x14033d406
   14033d3f5:	f3 0f 5c f8          	subss  xmm7,xmm0
   14033d3f9:	41 0f 28 ca          	movaps xmm1,xmm10
   14033d3fd:	f3 0f 5e f9          	divss  xmm7,xmm1
   14033d401:	0f 2f fe             	comiss xmm7,xmm6
   14033d404:	eb 40                	jmp    0x14033d446
   14033d406:	f3 0f 5c f8          	subss  xmm7,xmm0
   14033d40a:	41 0f 28 cb          	movaps xmm1,xmm11
   14033d40e:	f3 0f 5e f9          	divss  xmm7,xmm1
   14033d412:	0f 2f fe             	comiss xmm7,xmm6
   14033d415:	eb 2f                	jmp    0x14033d446
   14033d417:	0f 2f ce             	comiss xmm1,xmm6
   14033d41a:	72 16                	jb     0x14033d432
   14033d41c:	f3 0f 5c ce          	subss  xmm1,xmm6
   14033d420:	f3 0f 5c c7          	subss  xmm0,xmm7
   14033d424:	f3 0f 5e ca          	divss  xmm1,xmm2
   14033d428:	f3 41 0f 5e c4       	divss  xmm0,xmm12
   14033d42d:	0f 2f c8             	comiss xmm1,xmm0
   14033d430:	eb 9e                	jmp    0x14033d3d0
   14033d432:	f3 0f 5c f1          	subss  xmm6,xmm1
   14033d436:	f3 0f 5c f8          	subss  xmm7,xmm0
   14033d43a:	f3 0f 5e f2          	divss  xmm6,xmm2
   14033d43e:	f3 41 0f 5e fc       	divss  xmm7,xmm12
   14033d443:	0f 2f f7             	comiss xmm6,xmm7
   14033d446:	77 03                	ja     0x14033d44b
   14033d448:	0f 28 f7             	movaps xmm6,xmm7
   14033d44b:	44 0f 2f ce          	comiss xmm9,xmm6
   14033d44f:	77 04                	ja     0x14033d455
   14033d451:	41 0f 28 f1          	movaps xmm6,xmm9
   14033d455:	41 0f 28 c1          	movaps xmm0,xmm9
   14033d459:	f3 0f 5c c6          	subss  xmm0,xmm6
   14033d45d:	41 0f 2f c5          	comiss xmm0,xmm13
   14033d461:	48 8b 44 24 38       	mov    rax,QWORD PTR [rsp+0x38]
   14033d466:	f3 0f 11 00          	movss  DWORD PTR [rax],xmm0
   14033d46a:	0f 87 97 00 00 00    	ja     0x14033d507
   14033d470:	f3 0f 10 15 64 2b 51 	movss  xmm2,DWORD PTR [rip+0x512b64]        # 0x14084ffdc
   14033d477:	00 
   14033d478:	f2 0f 10 35 d0 0c 35 	movsd  xmm6,QWORD PTR [rip+0x350cd0]        # 0x14068e150
   14033d47f:	00 
   14033d480:	f3 0f 10 1d 88 9c 35 	movss  xmm3,DWORD PTR [rip+0x359c88]        # 0x140697110
   14033d487:	00 
   14033d488:	44 8b 4c 24 20       	mov    r9d,DWORD PTR [rsp+0x20]
   14033d48d:	45 0f b7 16          	movzx  r10d,WORD PTR [r14]
   14033d491:	66 41 ff c2          	inc    r10w
   14033d495:	66 45 89 16          	mov    WORD PTR [r14],r10w
   14033d499:	66 45 3b d7          	cmp    r10w,r15w
   14033d49d:	0f 8c 6d fc ff ff    	jl     0x14033d110
   14033d4a3:	32 c0                	xor    al,al
   14033d4a5:	48 8b 4c 24 40       	mov    rcx,QWORD PTR [rsp+0x40]
   14033d4aa:	48 33 cc             	xor    rcx,rsp
   14033d4ad:	e8 4e e1 2d 00       	call   0x14061b600
   14033d4b2:	4c 8d 9c 24 f0 00 00 	lea    r11,[rsp+0xf0]
   14033d4b9:	00 
   14033d4ba:	49 8b 5b 30          	mov    rbx,QWORD PTR [r11+0x30]
   14033d4be:	49 8b 6b 40          	mov    rbp,QWORD PTR [r11+0x40]
   14033d4c2:	49 8b 73 48          	mov    rsi,QWORD PTR [r11+0x48]
   14033d4c6:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
   14033d4cb:	41 0f 28 7b e0       	movaps xmm7,XMMWORD PTR [r11-0x20]
   14033d4d0:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   14033d4d5:	45 0f 28 4b c0       	movaps xmm9,XMMWORD PTR [r11-0x40]
   14033d4da:	45 0f 28 53 b0       	movaps xmm10,XMMWORD PTR [r11-0x50]
   14033d4df:	45 0f 28 5b a0       	movaps xmm11,XMMWORD PTR [r11-0x60]
   14033d4e4:	45 0f 28 63 90       	movaps xmm12,XMMWORD PTR [r11-0x70]
   14033d4e9:	45 0f 28 6b 80       	movaps xmm13,XMMWORD PTR [r11-0x80]
   14033d4ee:	44 0f 28 74 24 60    	movaps xmm14,XMMWORD PTR [rsp+0x60]
   14033d4f4:	44 0f 28 7c 24 50    	movaps xmm15,XMMWORD PTR [rsp+0x50]
   14033d4fa:	49 8b e3             	mov    rsp,r11
   14033d4fd:	41 5f                	pop    r15
   14033d4ff:	41 5e                	pop    r14
   14033d501:	41 5d                	pop    r13
   14033d503:	41 5c                	pop    r12
   14033d505:	5f                   	pop    rdi
   14033d506:	c3                   	ret
   14033d507:	b0 01                	mov    al,0x1
   14033d509:	eb 9a                	jmp    0x14033d4a5
   14033d50b:	cc                   	int3
   14033d50c:	cc                   	int3
   14033d50d:	cc                   	int3
   14033d50e:	cc                   	int3
   14033d50f:	cc                   	int3
   14033d510:	cc                   	int3
   14033d511:	cc                   	int3
   14033d512:	cc                   	int3
   14033d513:	cc                   	int3
   14033d514:	cc                   	int3
   14033d515:	cc                   	int3
   14033d516:	cc                   	int3
   14033d517:	cc                   	int3
   14033d518:	cc                   	int3
   14033d519:	cc                   	int3
   14033d51a:	cc                   	int3
   14033d51b:	cc                   	int3
   14033d51c:	cc                   	int3
   14033d51d:	cc                   	int3
   14033d51e:	cc                   	int3
   14033d51f:	cc                   	int3
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
