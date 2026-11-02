
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031f6e0 <.text+0x31e6e0>:
   14031f6e0:	59                   	pop    rcx
   14031f6e1:	ce                   	(bad)
   14031f6e2:	43 8d 0c 09          	lea    ecx,[r9+r9*1]
   14031f6e6:	41 8b c0             	mov    eax,r8d
   14031f6e9:	44 89 05 64 a9 66 00 	mov    DWORD PTR [rip+0x66a964],r8d        # 0x14098a054
   14031f6f0:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14031f6f5:	f3 0f 5e c8          	divss  xmm1,xmm0
   14031f6f9:	f3 0f 10 05 a7 19 69 	movss  xmm0,DWORD PTR [rip+0x146919a7]        # 0x1549b10a8
   14031f700:	14 
   14031f701:	f3 0f 5e c1          	divss  xmm0,xmm1
   14031f705:	f3 0f 11 0d 5b 9f 61 	movss  DWORD PTR [rip+0x619f5b],xmm1        # 0x140939668
   14031f70c:	00 
   14031f70d:	f3 0f 58 05 57 7a 37 	addss  xmm0,DWORD PTR [rip+0x377a57]        # 0x14069716c
   14031f714:	00 
   14031f715:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14031f71a:	0f 57 c0             	xorps  xmm0,xmm0
   14031f71d:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   14031f722:	41 3b c0             	cmp    eax,r8d
   14031f725:	41 0f 43 c0          	cmovae eax,r8d
   14031f729:	89 05 29 a9 66 00    	mov    DWORD PTR [rip+0x66a929],eax        # 0x14098a058
   14031f72f:	f3 0f 5e d8          	divss  xmm3,xmm0
   14031f733:	0f 57 c0             	xorps  xmm0,xmm0
   14031f736:	f3 0f 11 1d a2 a8 66 	movss  DWORD PTR [rip+0x66a8a2],xmm3        # 0x140989fe0
   14031f73d:	00 
   14031f73e:	0f 28 d3             	movaps xmm2,xmm3
   14031f741:	f3 0f 59 d6          	mulss  xmm2,xmm6
   14031f745:	0f 28 cb             	movaps xmm1,xmm3
   14031f748:	f3 0f 59 ce          	mulss  xmm1,xmm6
   14031f74c:	f3 0f 58 d0          	addss  xmm2,xmm0
   14031f750:	45 84 d2             	test   r10b,r10b
   14031f753:	74 06                	je     0x14031f75b
   14031f755:	41 0f 28 e3          	movaps xmm4,xmm11
   14031f759:	eb 04                	jmp    0x14031f75f
   14031f75b:	41 0f 28 e4          	movaps xmm4,xmm12
   14031f75f:	f3 44 0f 10 05 78 48 	movss  xmm8,DWORD PTR [rip+0x384878]        # 0x1406a3fe0
   14031f766:	38 00 
   14031f768:	f3 0f 5c e1          	subss  xmm4,xmm1
   14031f76c:	f3 0f 10 2d 70 83 38 	movss  xmm5,DWORD PTR [rip+0x388370]        # 0x1406a7ae4
   14031f773:	00 
   14031f774:	4c 8d 1d a5 a7 66 00 	lea    r11,[rip+0x66a7a5]        # 0x140989f20
   14031f77b:	f3 0f 10 3d 51 95 37 	movss  xmm7,DWORD PTR [rip+0x379551]        # 0x140698cd4
   14031f782:	00 
   14031f783:	33 ed                	xor    ebp,ebp
   14031f785:	f2 44 0f 10 0d 1a 82 	movsd  xmm9,QWORD PTR [rip+0x38821a]        # 0x1406a79a8
   14031f78c:	38 00 
   14031f78e:	8b d5                	mov    edx,ebp
   14031f790:	f3 44 0f 10 15 3f e9 	movss  xmm10,DWORD PTR [rip+0x36e93f]        # 0x14068e0d8
   14031f797:	36 00 
   14031f799:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14031f7a0:	33 c0                	xor    eax,eax
   14031f7a2:	8b ca                	mov    ecx,edx
   14031f7a4:	48 03 c9             	add    rcx,rcx
   14031f7a7:	49 89 04 cb          	mov    QWORD PTR [r11+rcx*8],rax
   14031f7ab:	49 89 44 cb 08       	mov    QWORD PTR [r11+rcx*8+0x8],rax
   14031f7b0:	8d 42 c0             	lea    eax,[rdx-0x40]
   14031f7b3:	41 88 04 cb          	mov    BYTE PTR [r11+rcx*8],al
   14031f7b7:	8b c2                	mov    eax,edx
   14031f7b9:	f3 41 0f 11 54 cb 04 	movss  DWORD PTR [r11+rcx*8+0x4],xmm2
   14031f7c0:	41 89 6c cb 0c       	mov    DWORD PTR [r11+rcx*8+0xc],ebp
   14031f7c5:	85 d2                	test   edx,edx
   14031f7c7:	74 1f                	je     0x14031f7e8
   14031f7c9:	3b d7                	cmp    edx,edi
   14031f7cb:	74 16                	je     0x14031f7e3
   14031f7cd:	0f 28 c3             	movaps xmm0,xmm3
   14031f7d0:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   14031f7d5:	f3 0f 58 c2          	addss  xmm0,xmm2
   14031f7d9:	0f 2f e0             	comiss xmm4,xmm0
   14031f7dc:	77 0d                	ja     0x14031f7eb
   14031f7de:	0f 28 c4             	movaps xmm0,xmm4
   14031f7e1:	eb 08                	jmp    0x14031f7eb
   14031f7e3:	0f 28 c5             	movaps xmm0,xmm5
   14031f7e6:	eb 03                	jmp    0x14031f7eb
   14031f7e8:	0f 28 c7             	movaps xmm0,xmm7
   14031f7eb:	f3 41 0f 11 44 cb 08 	movss  DWORD PTR [r11+rcx*8+0x8],xmm0
   14031f7f2:	f3 0f 5c c2          	subss  xmm0,xmm2
   14031f7f6:	f3 0f 5e c3          	divss  xmm0,xmm3
   14031f7fa:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14031f7fe:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   14031f803:	f2 48 0f 2c c0       	cvttsd2si rax,xmm0
   14031f808:	83 f8 30             	cmp    eax,0x30
   14031f80b:	73 06                	jae    0x14031f813
   14031f80d:	85 c0                	test   eax,eax
   14031f80f:	74 40                	je     0x14031f851
   14031f811:	eb 05                	jmp    0x14031f818
   14031f813:	b8 30 00 00 00       	mov    eax,0x30
   14031f818:	0f 57 c9             	xorps  xmm1,xmm1
   14031f81b:	8b c0                	mov    eax,eax
   14031f81d:	ff c2                	inc    edx
   14031f81f:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   14031f824:	0f 28 c1             	movaps xmm0,xmm1
   14031f827:	f3 41 0f 11 4c cb 0c 	movss  DWORD PTR [r11+rcx*8+0xc],xmm1
   14031f82e:	f3 0f 59 c3          	mulss  xmm0,xmm3
   14031f832:	f3 0f 58 c2          	addss  xmm0,xmm2
   14031f836:	0f 28 d0             	movaps xmm2,xmm0
   14031f839:	0f 28 c4             	movaps xmm0,xmm4
   14031f83c:	f3 41 0f 5c c2       	subss  xmm0,xmm10
   14031f841:	f3 41 0f 11 54 cb 08 	movss  DWORD PTR [r11+rcx*8+0x8],xmm2
   14031f848:	0f 2f c2             	comiss xmm0,xmm2
   14031f84b:	0f 87 4f ff ff ff    	ja     0x14031f7a0
   14031f851:	8b c2                	mov    eax,edx
   14031f853:	33 c9                	xor    ecx,ecx
   14031f855:	48 03 c0             	add    rax,rax
   14031f858:	41 c1 e8 02          	shr    r8d,0x2
   14031f85c:	45 3b c8             	cmp    r9d,r8d
   14031f85f:	49 89 0c c3          	mov    QWORD PTR [r11+rax*8],rcx
   14031f863:	49 89 4c c3 08       	mov    QWORD PTR [r11+rax*8+0x8],rcx
   14031f868:	41 8b c1             	mov    eax,r9d
   14031f86b:	41 0f 42 c0          	cmovb  eax,r8d
   14031f86f:	33 d2                	xor    edx,edx
   14031f871:	41 f7 f1             	div    r9d
   14031f874:	8b c8                	mov    ecx,eax
   14031f876:	89 05 d4 a7 66 00    	mov    DWORD PTR [rip+0x66a7d4],eax        # 0x14098a050
   14031f87c:	ff c8                	dec    eax
   14031f87e:	99                   	cdq
   14031f87f:	f7 f9                	idiv   ecx
   14031f881:	89 05 85 a7 66 00    	mov    DWORD PTR [rip+0x66a785],eax        # 0x14098a00c
   14031f887:	40 84 f6             	test   sil,sil
   14031f88a:	0f 85 a7 01 00 00    	jne    0x14031fa37
   14031f890:	44 8b c7             	mov    r8d,edi
   14031f893:	45 84 d2             	test   r10b,r10b
   14031f896:	75 04                	jne    0x14031f89c
   14031f898:	45 0f 28 dc          	movaps xmm11,xmm12
   14031f89c:	b8 cd cc cc cc       	mov    eax,0xcccccccd
   14031f8a1:	44 8b d3             	mov    r10d,ebx
   14031f8a4:	f7 e3                	mul    ebx
   14031f8a6:	f3 49 0f 2c cb       	cvttss2si rcx,xmm11
   14031f8ab:	41 d1 ea             	shr    r10d,1
   14031f8ae:	44 8b da             	mov    r11d,edx
   14031f8b1:	41 8b c2             	mov    eax,r10d
   14031f8b4:	41 c1 eb 05          	shr    r11d,0x5
   14031f8b8:	41 2b c3             	sub    eax,r11d
   14031f8bb:	03 c9                	add    ecx,ecx
   14031f8bd:	3b c1                	cmp    eax,ecx
   14031f8bf:	72 12                	jb     0x14031f8d3
   14031f8c1:	45 03 c0             	add    r8d,r8d
   14031f8c4:	33 d2                	xor    edx,edx
   14031f8c6:	41 8b c2             	mov    eax,r10d
   14031f8c9:	41 f7 f0             	div    r8d
   14031f8cc:	41 2b c3             	sub    eax,r11d
   14031f8cf:	3b c1                	cmp    eax,ecx
   14031f8d1:	73 ee                	jae    0x14031f8c1
   14031f8d3:	33 d2                	xor    edx,edx
   14031f8d5:	44 89 05 4c a7 66 00 	mov    DWORD PTR [rip+0x66a74c],r8d        # 0x14098a028
   14031f8dc:	0f 57 c0             	xorps  xmm0,xmm0
   14031f8df:	89 2d 5f a7 66 00    	mov    DWORD PTR [rip+0x66a75f],ebp        # 0x14098a044
   14031f8e5:	41 8b c2             	mov    eax,r10d
   14031f8e8:	48 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],rbp
   14031f8ed:	41 f7 f0             	div    r8d
   14031f8f0:	8b c8                	mov    ecx,eax
   14031f8f2:	8b c3                	mov    eax,ebx
   14031f8f4:	99                   	cdq
   14031f8f5:	83 e2 03             	and    edx,0x3
   14031f8f8:	03 c2                	add    eax,edx
   14031f8fa:	c1 f8 02             	sar    eax,0x2
   14031f8fd:	44 8b c8             	mov    r9d,eax
   14031f900:	99                   	cdq
   14031f901:	41 f7 f8             	idiv   r8d
   14031f904:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   14031f909:	41 2b c3             	sub    eax,r11d
   14031f90c:	85 c0                	test   eax,eax
   14031f90e:	0f 4e c5             	cmovle eax,ebp
   14031f911:	45 03 c0             	add    r8d,r8d
   14031f914:	33 d2                	xor    edx,edx
   14031f916:	44 89 05 17 a7 66 00 	mov    DWORD PTR [rip+0x66a717],r8d        # 0x14098a034
   14031f91d:	f3 0f 11 05 ff a6 66 	movss  DWORD PTR [rip+0x66a6ff],xmm0        # 0x14098a024
   14031f924:	00 
   14031f925:	66 0f 6e c0          	movd   xmm0,eax
   14031f929:	41 8b c2             	mov    eax,r10d
   14031f92c:	41 f7 f0             	div    r8d
   14031f92f:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14031f932:	8b c8                	mov    ecx,eax
   14031f934:	41 8b c1             	mov    eax,r9d
   14031f937:	99                   	cdq
   14031f938:	41 f7 f8             	idiv   r8d
   14031f93b:	f3 0f 11 05 dd a6 66 	movss  DWORD PTR [rip+0x66a6dd],xmm0        # 0x14098a020
   14031f942:	00 
   14031f943:	0f 57 c0             	xorps  xmm0,xmm0
   14031f946:	41 2b c3             	sub    eax,r11d
   14031f949:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   14031f94e:	85 c0                	test   eax,eax
   14031f950:	0f 4e c5             	cmovle eax,ebp
   14031f953:	45 03 c0             	add    r8d,r8d
   14031f956:	33 d2                	xor    edx,edx
   14031f958:	44 89 05 e1 a6 66 00 	mov    DWORD PTR [rip+0x66a6e1],r8d        # 0x14098a040
   14031f95f:	f3 0f 11 05 c9 a6 66 	movss  DWORD PTR [rip+0x66a6c9],xmm0        # 0x14098a030
   14031f966:	00 
   14031f967:	66 0f 6e c0          	movd   xmm0,eax
   14031f96b:	41 8b c2             	mov    eax,r10d
   14031f96e:	41 f7 f0             	div    r8d
   14031f971:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14031f974:	8b c8                	mov    ecx,eax
   14031f976:	41 8b c1             	mov    eax,r9d
   14031f979:	99                   	cdq
   14031f97a:	41 f7 f8             	idiv   r8d
   14031f97d:	f3                   	repz
   14031f97e:	0f                   	.byte 0xf
   14031f97f:	11                   	.byte 0x11
