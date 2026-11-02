
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014034f665 <.text+0x34e665>:
   14034f665:	44 89 bc 24 90 01 00 	mov    DWORD PTR [rsp+0x190],r15d
   14034f66c:	00 
   14034f66d:	45 85 ff             	test   r15d,r15d
   14034f670:	0f 84 e8 02 00 00    	je     0x14034f95e
   14034f676:	f3 0f 10 1d 0a 0c 50 	movss  xmm3,DWORD PTR [rip+0x500c0a]        # 0x140850288
   14034f67d:	00 
   14034f67e:	48 8b f5             	mov    rsi,rbp
   14034f681:	69 05 59 a9 63 00 d0 	imul   eax,DWORD PTR [rip+0x63a959],0x1d0        # 0x140989fe4
   14034f688:	01 00 00 
   14034f68b:	41 03 c6             	add    eax,r14d
   14034f68e:	48 69 c8 f8 00 00 00 	imul   rcx,rax,0xf8
   14034f695:	f3 42 0f 10 04 29    	movss  xmm0,DWORD PTR [rcx+r13*1]
   14034f69b:	41 0f 2f c4          	comiss xmm0,xmm12
   14034f69f:	0f 87 b7 02 00 00    	ja     0x14034f95c
   14034f6a5:	48 8b 84 24 98 01 00 	mov    rax,QWORD PTR [rsp+0x198]
   14034f6ac:	00 
   14034f6ad:	40 b7 01             	mov    dil,0x1
   14034f6b0:	8b 68 0c             	mov    ebp,DWORD PTR [rax+0xc]
   14034f6b3:	3b 68 10             	cmp    ebp,DWORD PTR [rax+0x10]
   14034f6b6:	0f 8f 91 02 00 00    	jg     0x14034f94d
   14034f6bc:	4c 8b bc 24 88 00 00 	mov    r15,QWORD PTR [rsp+0x88]
   14034f6c3:	00 
   14034f6c4:	8b cd                	mov    ecx,ebp
   14034f6c6:	4c 69 d6 f8 00 00 00 	imul   r10,rsi,0xf8
   14034f6cd:	0f 1f 00             	nop    DWORD PTR [rax]
   14034f6d0:	2b 48 0c             	sub    ecx,DWORD PTR [rax+0xc]
   14034f6d3:	4c 8b de             	mov    r11,rsi
   14034f6d6:	8b 15 08 a9 63 00    	mov    edx,DWORD PTR [rip+0x63a908]        # 0x140989fe4
   14034f6dc:	03 d1                	add    edx,ecx
   14034f6de:	69 ca d0 01 00 00    	imul   ecx,edx,0x1d0
   14034f6e4:	8d 42 ff             	lea    eax,[rdx-0x1]
   14034f6e7:	69 c0 d0 01 00 00    	imul   eax,eax,0x1d0
   14034f6ed:	4c 69 c1 f8 00 00 00 	imul   r8,rcx,0xf8
   14034f6f4:	4c 69 c8 f8 00 00 00 	imul   r9,rax,0xf8
   14034f6fb:	48 63 c2             	movsxd rax,edx
   14034f6fe:	4d 03 c5             	add    r8,r13
   14034f701:	41 0f b7 14 47       	movzx  edx,WORD PTR [r15+rax*2]
   14034f706:	4d 03 cd             	add    r9,r13
   14034f709:	41 83 fc 01          	cmp    r12d,0x1
   14034f70d:	75 0c                	jne    0x14034f71b
   14034f70f:	f3 43 0f 10 44 11 2c 	movss  xmm0,DWORD PTR [r9+r10*1+0x2c]
   14034f716:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f719:	eb 16                	jmp    0x14034f731
   14034f71b:	f3 43 0f 10 44 11 30 	movss  xmm0,DWORD PTR [r9+r10*1+0x30]
   14034f722:	f3 43 0f 58 44 11 2c 	addss  xmm0,DWORD PTR [r9+r10*1+0x2c]
   14034f729:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f72c:	f2 41 0f 59 c2       	mulsd  xmm0,xmm10
   14034f731:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14034f735:	45 85 f6             	test   r14d,r14d
   14034f738:	7e 71                	jle    0x14034f7ab
   14034f73a:	41 83 fc 01          	cmp    r12d,0x1
   14034f73e:	75 0f                	jne    0x14034f74f
   14034f740:	f3 43 0f 10 84 11 34 	movss  xmm0,DWORD PTR [r9+r10*1-0xcc]
   14034f747:	ff ff ff 
   14034f74a:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f74d:	eb 1c                	jmp    0x14034f76b
   14034f74f:	f3 43 0f 10 84 11 38 	movss  xmm0,DWORD PTR [r9+r10*1-0xc8]
   14034f756:	ff ff ff 
   14034f759:	f3 43 0f 58 84 11 34 	addss  xmm0,DWORD PTR [r9+r10*1-0xcc]
   14034f760:	ff ff ff 
   14034f763:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f766:	f2 41 0f 59 c2       	mulsd  xmm0,xmm10
   14034f76b:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14034f76f:	0f 2f c1             	comiss xmm0,xmm1
   14034f772:	76 37                	jbe    0x14034f7ab
   14034f774:	4c 8d 5e ff          	lea    r11,[rsi-0x1]
   14034f778:	49 69 c3 f8 00 00 00 	imul   rax,r11,0xf8
   14034f77f:	41 83 fc 01          	cmp    r12d,0x1
   14034f783:	75 0c                	jne    0x14034f791
   14034f785:	f3 42 0f 10 44 08 2c 	movss  xmm0,DWORD PTR [rax+r9*1+0x2c]
   14034f78c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f78f:	eb 16                	jmp    0x14034f7a7
   14034f791:	f3 42 0f 10 44 08 30 	movss  xmm0,DWORD PTR [rax+r9*1+0x30]
   14034f798:	f3 42 0f 58 44 08 2c 	addss  xmm0,DWORD PTR [rax+r9*1+0x2c]
   14034f79f:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f7a2:	f2 41 0f 59 c2       	mulsd  xmm0,xmm10
   14034f7a7:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14034f7ab:	41 8d 4e 01          	lea    ecx,[r14+0x1]
   14034f7af:	0f b7 c2             	movzx  eax,dx
   14034f7b2:	3b c8                	cmp    ecx,eax
   14034f7b4:	7d 71                	jge    0x14034f827
   14034f7b6:	41 83 fc 01          	cmp    r12d,0x1
   14034f7ba:	75 0f                	jne    0x14034f7cb
   14034f7bc:	f3 43 0f 10 84 11 24 	movss  xmm0,DWORD PTR [r9+r10*1+0x124]
   14034f7c3:	01 00 00 
   14034f7c6:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f7c9:	eb 1c                	jmp    0x14034f7e7
   14034f7cb:	f3 43 0f 10 84 11 28 	movss  xmm0,DWORD PTR [r9+r10*1+0x128]
   14034f7d2:	01 00 00 
   14034f7d5:	f3 43 0f 58 84 11 24 	addss  xmm0,DWORD PTR [r9+r10*1+0x124]
   14034f7dc:	01 00 00 
   14034f7df:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f7e2:	f2 41 0f 59 c2       	mulsd  xmm0,xmm10
   14034f7e7:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14034f7eb:	0f 2f c1             	comiss xmm0,xmm1
   14034f7ee:	76 37                	jbe    0x14034f827
   14034f7f0:	4c 8d 5e 01          	lea    r11,[rsi+0x1]
   14034f7f4:	49 69 c3 f8 00 00 00 	imul   rax,r11,0xf8
   14034f7fb:	41 83 fc 01          	cmp    r12d,0x1
   14034f7ff:	75 0c                	jne    0x14034f80d
   14034f801:	f3 42 0f 10 44 08 2c 	movss  xmm0,DWORD PTR [rax+r9*1+0x2c]
   14034f808:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f80b:	eb 16                	jmp    0x14034f823
   14034f80d:	f3 42 0f 10 44 08 30 	movss  xmm0,DWORD PTR [rax+r9*1+0x30]
   14034f814:	f3 42 0f 58 44 08 2c 	addss  xmm0,DWORD PTR [rax+r9*1+0x2c]
   14034f81b:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f81e:	f2 41 0f 59 c2       	mulsd  xmm0,xmm10
   14034f823:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14034f827:	40 84 ff             	test   dil,dil
   14034f82a:	74 1f                	je     0x14034f84b
   14034f82c:	41 0f 2f cb          	comiss xmm1,xmm11
   14034f830:	0f 82 fa 00 00 00    	jb     0x14034f930
   14034f836:	40 32 ff             	xor    dil,dil
   14034f839:	f3 43 0f 10 4c 10 14 	movss  xmm1,DWORD PTR [r8+r10*1+0x14]
   14034f840:	41 83 fc 01          	cmp    r12d,0x1
   14034f844:	75 13                	jne    0x14034f859
   14034f846:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14034f849:	eb 20                	jmp    0x14034f86b
   14034f84b:	44 0f 2f d9          	comiss xmm11,xmm1
   14034f84f:	76 e8                	jbe    0x14034f839
   14034f851:	40 b7 01             	mov    dil,0x1
   14034f854:	e9 d7 00 00 00       	jmp    0x14034f930
   14034f859:	0f 28 c1             	movaps xmm0,xmm1
   14034f85c:	f3 43 0f 58 44 10 18 	addss  xmm0,DWORD PTR [r8+r10*1+0x18]
   14034f863:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14034f866:	f2 41 0f 59 c2       	mulsd  xmm0,xmm10
   14034f86b:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14034f86f:	0f                   	.byte 0xf
