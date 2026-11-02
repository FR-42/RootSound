
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140373790 <.text+0x372790>:
   140373790:	40 53                	rex push rbx
   140373792:	55                   	push   rbp
   140373793:	56                   	push   rsi
   140373794:	57                   	push   rdi
   140373795:	41 55                	push   r13
   140373797:	41 56                	push   r14
   140373799:	41 57                	push   r15
   14037379b:	b8 d0 40 00 00       	mov    eax,0x40d0
   1403737a0:	e8 9b 85 2a 00       	call   0x14061bd40
   1403737a5:	48 2b e0             	sub    rsp,rax
   1403737a8:	0f 29 bc 24 b0 40 00 	movaps XMMWORD PTR [rsp+0x40b0],xmm7
   1403737af:	00 
   1403737b0:	44 0f 29 84 24 a0 40 	movaps XMMWORD PTR [rsp+0x40a0],xmm8
   1403737b7:	00 00 
   1403737b9:	44 0f 29 8c 24 90 40 	movaps XMMWORD PTR [rsp+0x4090],xmm9
   1403737c0:	00 00 
   1403737c2:	48 8b 05 9f e9 5f 00 	mov    rax,QWORD PTR [rip+0x5fe99f]        # 0x140972168
   1403737c9:	48 33 c4             	xor    rax,rsp
   1403737cc:	48 89 84 24 40 40 00 	mov    QWORD PTR [rsp+0x4040],rax
   1403737d3:	00 
   1403737d4:	44 8b 19             	mov    r11d,DWORD PTR [rcx]
   1403737d7:	32 db                	xor    bl,bl
   1403737d9:	40 32 ff             	xor    dil,dil
   1403737dc:	48 89 54 24 28       	mov    QWORD PTR [rsp+0x28],rdx
   1403737e1:	33 f6                	xor    esi,esi
   1403737e3:	89 5c 24 0c          	mov    DWORD PTR [rsp+0xc],ebx
   1403737e7:	45 32 f6             	xor    r14b,r14b
   1403737ea:	89 7c 24 04          	mov    DWORD PTR [rsp+0x4],edi
   1403737ee:	45 8b e9             	mov    r13d,r9d
   1403737f1:	89 74 24 10          	mov    DWORD PTR [rsp+0x10],esi
   1403737f5:	45 33 c9             	xor    r9d,r9d
   1403737f8:	44 88 34 24          	mov    BYTE PTR [rsp],r14b
   1403737fc:	4c 8b d1             	mov    r10,rcx
   1403737ff:	44 89 4c 24 08       	mov    DWORD PTR [rsp+0x8],r9d
   140373804:	8b 49 04             	mov    ecx,DWORD PTR [rcx+0x4]
   140373807:	33 ed                	xor    ebp,ebp
   140373809:	44 89 5c 24 14       	mov    DWORD PTR [rsp+0x14],r11d
   14037380e:	4d 8b f8             	mov    r15,r8
   140373811:	0f 57 ed             	xorps  xmm5,xmm5
   140373814:	0f 57 ff             	xorps  xmm7,xmm7
   140373817:	45 0f 57 c9          	xorps  xmm9,xmm9
   14037381b:	45 0f 57 c0          	xorps  xmm8,xmm8
   14037381f:	44 3b d9             	cmp    r11d,ecx
   140373822:	0f 8d 89 05 00 00    	jge    0x140373db1
   140373828:	4c 89 a4 24 18 41 00 	mov    QWORD PTR [rsp+0x4118],r12
   14037382f:	00 
   140373830:	44 8b a4 24 30 41 00 	mov    r12d,DWORD PTR [rsp+0x4130]
   140373837:	00 
   140373838:	0f 29 b4 24 c0 40 00 	movaps XMMWORD PTR [rsp+0x40c0],xmm6
   14037383f:	00 
   140373840:	f3 0f 10 35 e8 c7 4d 	movss  xmm6,DWORD PTR [rip+0x4dc7e8]        # 0x140850030
   140373847:	00 
   140373848:	44 0f 29 94 24 80 40 	movaps XMMWORD PTR [rsp+0x4080],xmm10
   14037384f:	00 00 
   140373851:	f3 44 0f 10 15 e6 53 	movss  xmm10,DWORD PTR [rip+0x3253e6]        # 0x140698c40
   140373858:	32 00 
   14037385a:	44 0f 29 9c 24 70 40 	movaps XMMWORD PTR [rsp+0x4070],xmm11
   140373861:	00 00 
   140373863:	f3 44 0f 10 1d 54 c7 	movss  xmm11,DWORD PTR [rip+0x4dc754]        # 0x14084ffc0
   14037386a:	4d 00 
   14037386c:	44 0f 29 a4 24 60 40 	movaps XMMWORD PTR [rsp+0x4060],xmm12
   140373873:	00 00 
   140373875:	f3 44 0f 10 25 12 42 	movss  xmm12,DWORD PTR [rip+0x334212]        # 0x1406a7a90
   14037387c:	33 00 
   14037387e:	44 0f 29 ac 24 50 40 	movaps XMMWORD PTR [rsp+0x4050],xmm13
   140373885:	00 00 
   140373887:	f3 44 0f 10 2d 28 af 	movss  xmm13,DWORD PTR [rip+0x33af28]        # 0x1406ae7b8
   14037388e:	33 00 
   140373890:	41 8b 12             	mov    edx,DWORD PTR [r10]
   140373893:	45 32 c0             	xor    r8b,r8b
   140373896:	3b ca                	cmp    ecx,edx
   140373898:	0f 8e c2 04 00 00    	jle    0x140373d60
   14037389e:	66 41 83 ba 1c 02 00 	cmp    WORD PTR [r10+0x21c],0x0
   1403738a5:	00 00 
   1403738a7:	7d 04                	jge    0x1403738ad
   1403738a9:	8b c2                	mov    eax,edx
   1403738ab:	eb 10                	jmp    0x1403738bd
   1403738ad:	44 3b da             	cmp    r11d,edx
   1403738b0:	41 8b c3             	mov    eax,r11d
   1403738b3:	0f 4c c2             	cmovl  eax,edx
   1403738b6:	3b c1                	cmp    eax,ecx
   1403738b8:	7c 03                	jl     0x1403738bd
   1403738ba:	8d 41 ff             	lea    eax,[rcx-0x1]
   1403738bd:	2b c2                	sub    eax,edx
   1403738bf:	8b c8                	mov    ecx,eax
   1403738c1:	49 8b 42 08          	mov    rax,QWORD PTR [r10+0x8]
   1403738c5:	f3 0f 10 1c 88       	movss  xmm3,DWORD PTR [rax+rcx*4]
   1403738ca:	0f 2e dd             	ucomiss xmm3,xmm5
   1403738cd:	7a 06                	jp     0x1403738d5
   1403738cf:	0f 84 8b 04 00 00    	je     0x140373d60
   1403738d5:	0f 2e fd             	ucomiss xmm7,xmm5
   1403738d8:	7a 2c                	jp     0x140373906
   1403738da:	75 2a                	jne    0x140373906
   1403738dc:	40 32 ff             	xor    dil,dil
   1403738df:	32 c9                	xor    cl,cl
   1403738e1:	33 f6                	xor    esi,esi
   1403738e3:	89 7c 24 04          	mov    DWORD PTR [rsp+0x4],edi
   1403738e7:	33 ed                	xor    ebp,ebp
   1403738e9:	89 4c 24 0c          	mov    DWORD PTR [rsp+0xc],ecx
   1403738ed:	45 33 c9             	xor    r9d,r9d
   1403738f0:	89 74 24 10          	mov    DWORD PTR [rsp+0x10],esi
   1403738f4:	44 89 4c 24 08       	mov    DWORD PTR [rsp+0x8],r9d
   1403738f9:	45 0f 57 c9          	xorps  xmm9,xmm9
   1403738fd:	44 0f 28 c5          	movaps xmm8,xmm5
   140373901:	e9 d6 01 00 00       	jmp    0x140373adc
   140373906:	0f 57 c0             	xorps  xmm0,xmm0
   140373909:	8b c5                	mov    eax,ebp
   14037390b:	0f 57 e4             	xorps  xmm4,xmm4
   14037390e:	41 0f 28 c9          	movaps xmm1,xmm9
   140373912:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140373917:	f2 0f 5e c8          	divsd  xmm1,xmm0
   14037391b:	f2 0f 5a e1          	cvtsd2ss xmm4,xmm1
   14037391f:	0f 28 d4             	movaps xmm2,xmm4
   140373922:	0f 28 c4             	movaps xmm0,xmm4
   140373925:	f3 41 0f 5e d5       	divss  xmm2,xmm13
   14037392a:	f3 0f 5c c2          	subss  xmm0,xmm2
   14037392e:	0f 2f d8             	comiss xmm3,xmm0
   140373931:	0f 82 9b 01 00 00    	jb     0x140373ad2
   140373937:	f3 0f 58 d4          	addss  xmm2,xmm4
   14037393b:	0f 2f d3             	comiss xmm2,xmm3
   14037393e:	0f 82 8e 01 00 00    	jb     0x140373ad2
   140373944:	84 db                	test   bl,bl
   140373946:	75 44                	jne    0x14037398c
   140373948:	40 84 ff             	test   dil,dil
   14037394b:	75 27                	jne    0x140373974
   14037394d:	0f 2f df             	comiss xmm3,xmm7
   140373950:	0f b6 db             	movzx  ebx,bl
   140373953:	b8 01 00 00 00       	mov    eax,0x1
   140373958:	0f 47 d8             	cmova  ebx,eax
   14037395b:	0f 2f fb             	comiss xmm7,xmm3
   14037395e:	89 5c 24 0c          	mov    DWORD PTR [rsp+0xc],ebx
   140373962:	0f 86 74 01 00 00    	jbe    0x140373adc
   140373968:	0f b6 f8             	movzx  edi,al
   14037396b:	89 7c 24 04          	mov    DWORD PTR [rsp+0x4],edi
   14037396f:	e9 68 01 00 00       	jmp    0x140373adc
   140373974:	0f 2f fb             	comiss xmm7,xmm3
   140373977:	0f 83 5f 01 00 00    	jae    0x140373adc
   14037397d:	40 32 ff             	xor    dil,dil
   140373980:	b1 01                	mov    cl,0x1
   140373982:	89 7c 24 04          	mov    DWORD PTR [rsp+0x4],edi
   140373986:	89 4c 24 0c          	mov    DWORD PTR [rsp+0xc],ecx
   14037398a:	eb 2d                	jmp    0x1403739b9
   14037398c:	0f 2f df             	comiss xmm3,xmm7
   14037398f:	b8 01 00 00 00       	mov    eax,0x1
   140373994:	40 0f b6 ff          	movzx  edi,dil
   140373998:	0f 42 f8             	cmovb  edi,eax
   14037399b:	33 c9                	xor    ecx,ecx
   14037399d:	0f 2f df             	comiss xmm3,xmm7
   1403739a0:	0f b6 c3             	movzx  eax,bl
   1403739a3:	89 7c 24 04          	mov    DWORD PTR [rsp+0x4],edi
   1403739a7:	0f 43 c8             	cmovae ecx,eax
   1403739aa:	0f 92 c0             	setb   al
   1403739ad:	89 4c 24 0c          	mov    DWORD PTR [rsp+0xc],ecx
   1403739b1:	84 c0                	test   al,al
   1403739b3:	0f 84 23 01 00 00    	je     0x140373adc
   1403739b9:	85 f6                	test   esi,esi
   1403739bb:	0f 84 03 01 00 00    	je     0x140373ac4
   1403739c1:	41 8b c4             	mov    eax,r12d
   1403739c4:	45 85 e4             	test   r12d,r12d
   1403739c7:	79 0a                	jns    0x1403739d3
   1403739c9:	8b 05 e1 67 61 00    	mov    eax,DWORD PTR [rip+0x6167e1]        # 0x14098a1b0
   1403739cf:	85 c0                	test   eax,eax
   1403739d1:	78 35                	js     0x140373a08
   1403739d3:	3b 05 f7 d3 63 14    	cmp    eax,DWORD PTR [rip+0x1463d3f7]        # 0x1549b0dd0
   1403739d9:	7d 2d                	jge    0x140373a08
   1403739db:	48 98                	cdqe
   1403739dd:	0f 57 c0             	xorps  xmm0,xmm0
   1403739e0:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403739e7:	48 8d 05 32 fd 64 00 	lea    rax,[rip+0x64fd32]        # 0x1409c3720
   1403739ee:	f3 0f 10 0c 01       	movss  xmm1,DWORD PTR [rcx+rax*1]
   1403739f3:	41 8b c3             	mov    eax,r11d
   1403739f6:	2b c6                	sub    eax,esi
   1403739f8:	ff c8                	dec    eax
   1403739fa:	0f 5a c9             	cvtps2pd xmm1,xmm1
   1403739fd:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140373a02:	f2 0f 59 c8          	mulsd  xmm1,xmm0
   140373a06:	eb 03                	jmp    0x140373a0b
   140373a08:	0f 57 c9             	xorps  xmm1,xmm1
   140373a0b:	66 0f 5a c1          	cvtpd2ps xmm0,xmm1
   140373a0f:	44 0f 2f d8          	comiss xmm11,xmm0
   140373a13:	0f 82 a1 00 00 00    	jb     0x140373aba
   140373a19:	41 0f 28 c8          	movaps xmm1,xmm8
   140373a1d:	41 0f 28 c0          	movaps xmm0,xmm8
   140373a21:	f3 41 0f 5e cc       	divss  xmm1,xmm12
   140373a26:	f3 0f 5c c1          	subss  xmm0,xmm1
   140373a2a:	0f 2f c7             	comiss xmm0,xmm7
   140373a2d:	73 0e                	jae    0x140373a3d
   140373a2f:	f3 41 0f 58 c8       	addss  xmm1,xmm8
   140373a34:	0f 2f f9             	comiss xmm7,xmm1
   140373a37:	0f 82 7d 00 00 00    	jb     0x140373aba
   140373a3d:	41 81 f9 00 04 00 00 	cmp    r9d,0x400
   140373a44:	73 4e                	jae    0x140373a94
   140373a46:	44 0f 2f c7          	comiss xmm8,xmm7
   140373a4a:	76 07                	jbe    0x140373a53
   140373a4c:	f3 44 0f 5c c7       	subss  xmm8,xmm7
   140373a51:	eb 09                	jmp    0x140373a5c
   140373a53:	f3 41 0f 5c f8       	subss  xmm7,xmm8
   140373a58:	44 0f 28 c7          	movaps xmm8,xmm7
   140373a5c:	f3 45 0f 5e c2       	divss  xmm8,xmm10
   140373a61:	41 8b c9             	mov    ecx,r9d
   140373a64:	41 8d 43 ff          	lea    eax,[r11-0x1]
   140373a68:	48 03 c9             	add    rcx,rcx
   140373a6b:	41 ff c1             	inc    r9d
   140373a6e:	44 89 4c 24 08       	mov    DWORD PTR [rsp+0x8],r9d
   140373a73:	89 74 cc 40          	mov    DWORD PTR [rsp+rcx*8+0x40],esi
   140373a77:	89 44 cc 44          	mov    DWORD PTR [rsp+rcx*8+0x44],eax
   140373a7b:	c6 44 cc 4c 00       	mov    BYTE PTR [rsp+rcx*8+0x4c],0x0
   140373a80:	f3 41 0f 5c e0       	subss  xmm4,xmm8
   140373a85:	f3 0f 11 64 cc 48    	movss  DWORD PTR [rsp+rcx*8+0x48],xmm4
   140373a8b:	41 81 f9 00 04 00 00 	cmp    r9d,0x400
   140373a92:	72 07                	jb     0x140373a9b
   140373a94:	41 b6 01             	mov    r14b,0x1
   140373a97:	44 88 34 24          	mov    BYTE PTR [rsp],r14b
   140373a9b:	33 ed                	xor    ebp,ebp
   140373a9d:	41 8d 43 ff          	lea    eax,[r11-0x1]
   140373aa1:	41 81 f9 00 04 00 00 	cmp    r9d,0x400
   140373aa8:	89 44 24 10          	mov    DWORD PTR [rsp+0x10],eax
   140373aac:	45 0f 57 c9          	xorps  xmm9,xmm9
   140373ab0:	44 0f 28 c3          	movaps xmm8,xmm3
   140373ab4:	41 0f 93 c0          	setae  r8b
   140373ab8:	eb 22                	jmp    0x140373adc
   140373aba:	45 32 f6             	xor    r14b,r14b
   140373abd:	41 b0 01             	mov    r8b,0x1
   140373ac0:	44 88 34 24          	mov    BYTE PTR [rsp],r14b
   140373ac4:	41 8d 43 ff          	lea    eax,[r11-0x1]
   140373ac8:	44 0f 28 c3          	movaps xmm8,xmm3
   140373acc:	89 44 24 10          	mov    DWORD PTR [rsp+0x10],eax
   140373ad0:	eb 0a                	jmp    0x140373adc
   140373ad2:	45 32 f6             	xor    r14b,r14b
   140373ad5:	41 b0 01             	mov    r8b,0x1
   140373ad8:	44 88 34 24          	mov    BYTE PTR [rsp],r14b
   140373adc:	41 8b c3             	mov    eax,r11d
   140373adf:	0f 57 c9             	xorps  xmm1,xmm1
   140373ae2:	2b c2                	sub    eax,edx
   140373ae4:	0f 28 fb             	movaps xmm7,xmm3
   140373ae7:	33 d2                	xor    edx,edx
   140373ae9:	41 f7 f5             	div    r13d
   140373aec:	8b c8                	mov    ecx,eax
   140373aee:	48 8b 44 24 28       	mov    rax,QWORD PTR [rsp+0x28]
   140373af3:	f3 0f 10 14 88       	movss  xmm2,DWORD PTR [rax+rcx*4]
   140373af8:	8b c5                	mov    eax,ebp
   140373afa:	0f 28 c2             	movaps xmm0,xmm2
   140373afd:	f3 0f 59 c3          	mulss  xmm0,xmm3
   140373b01:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140373b06:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140373b09:	f3 0f 58 ca          	addss  xmm1,xmm2
   140373b0d:	f2 44 0f 58 c8       	addsd  xmm9,xmm0
   140373b12:	f3 48 0f 2c e9       	cvttss2si rbp,xmm1
   140373b17:	48 89 6c 24 30       	mov    QWORD PTR [rsp+0x30],rbp
   140373b1c:	45 84 c0             	test   r8b,r8b
   140373b1f:	0f 84 3b 02 00 00    	je     0x140373d60
   140373b25:	41 83 f9 03          	cmp    r9d,0x3
   140373b29:	0f 82 26 02 00 00    	jb     0x140373d55
   140373b2f:	45 85 c9             	test   r9d,r9d
   140373b32:	0f 84 d9 01 00 00    	je     0x140373d11
   140373b38:	4c 8d 74 24 44       	lea    r14,[rsp+0x44]
   140373b3d:	45 8b e1             	mov    r12d,r9d
   140373b40:	4c 89 74 24 18       	mov    QWORD PTR [rsp+0x18],r14
   140373b45:	4c 89 64 24 20       	mov    QWORD PTR [rsp+0x20],r12
   140373b4a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140373b50:	41 8b 76 fc          	mov    esi,DWORD PTR [r14-0x4]
   140373b54:	41 8b 2e             	mov    ebp,DWORD PTR [r14]
   140373b57:	3b f5                	cmp    esi,ebp
   140373b59:	0f 87 79 01 00 00    	ja     0x140373cd8
   140373b5f:	f3 41 0f 10 56 04    	movss  xmm2,DWORD PTR [r14+0x4]
   140373b65:	41 bc 80 00 00 00    	mov    r12d,0x80
   140373b6b:	45 8d 74 24 81       	lea    r14d,[r12-0x7f]
   140373b70:	41 8b 0a             	mov    ecx,DWORD PTR [r10]
   140373b73:	3b f1                	cmp    esi,ecx
   140373b75:	0f 8c 3e 01 00 00    	jl     0x140373cb9
   140373b7b:	41 3b 72 04          	cmp    esi,DWORD PTR [r10+0x4]
   140373b7f:	0f 8d 34 01 00 00    	jge    0x140373cb9
   140373b85:	41 0f b7 92 1c 02 00 	movzx  edx,WORD PTR [r10+0x21c]
   140373b8c:	00 
   140373b8d:	33 ff                	xor    edi,edi
   140373b8f:	8b c6                	mov    eax,esi
   140373b91:	2b c1                	sub    eax,ecx
   140373b93:	66 85 d2             	test   dx,dx
   140373b96:	0f 49 f8             	cmovns edi,eax
   140373b99:	66 41 23 d4          	and    dx,r12w
   140373b9d:	74 05                	je     0x140373ba4
   140373b9f:	0f 28 cd             	movaps xmm1,xmm5
   140373ba2:	eb 03                	jmp    0x140373ba7
   140373ba4:	0f 28 ce             	movaps xmm1,xmm6
   140373ba7:	0f 2f d5             	comiss xmm2,xmm5
   140373baa:	76 20                	jbe    0x140373bcc
   140373bac:	49 8b 42 08          	mov    rax,QWORD PTR [r10+0x8]
   140373bb0:	f3 0f 10 04 b8       	movss  xmm0,DWORD PTR [rax+rdi*4]
   140373bb5:	0f 2f c5             	comiss xmm0,xmm5
   140373bb8:	76 12                	jbe    0x140373bcc
   140373bba:	0f 28 ca             	movaps xmm1,xmm2
   140373bbd:	66 85 d2             	test   dx,dx
   140373bc0:	74 06                	je     0x140373bc8
   140373bc2:	f3 0f 5c c8          	subss  xmm1,xmm0
   140373bc6:	eb 04                	jmp    0x140373bcc
   140373bc8:	f3 0f 5e c8          	divss  xmm1,xmm0
   140373bcc:	49 8b 42 08          	mov    rax,QWORD PTR [r10+0x8]
   140373bd0:	8b cf                	mov    ecx,edi
   140373bd2:	f3 0f 11 14 b8       	movss  DWORD PTR [rax+rdi*4],xmm2
   140373bd7:	41 0f b7 82 1c 02 00 	movzx  eax,WORD PTR [r10+0x21c]
   140373bde:	00 
   140373bdf:	0f b7 c8             	movzx  ecx,ax
   140373be2:	66 41 23 cc          	and    cx,r12w
   140373be6:	74 05                	je     0x140373bed
   140373be8:	0f 28 c5             	movaps xmm0,xmm5
   140373beb:	eb 03                	jmp    0x140373bf0
   140373bed:	0f 28 c6             	movaps xmm0,xmm6
   140373bf0:	0f 2e c8             	ucomiss xmm1,xmm0
   140373bf3:	7a 06                	jp     0x140373bfb
   140373bf5:	0f 84 be 00 00 00    	je     0x140373cb9
   140373bfb:	66 85 c0             	test   ax,ax
   140373bfe:	79 05                	jns    0x140373c05
   140373c00:	41 8b de             	mov    ebx,r14d
   140373c03:	eb 07                	jmp    0x140373c0c
   140373c05:	41 8b 5a 04          	mov    ebx,DWORD PTR [r10+0x4]
   140373c09:	41 2b 1a             	sub    ebx,DWORD PTR [r10]
   140373c0c:	41 0f b6 42 60       	movzx  eax,BYTE PTR [r10+0x60]
   140373c11:	45 33 db             	xor    r11d,r11d
   140373c14:	66 85 c9             	test   cx,cx
   140373c17:	74 52                	je     0x140373c6b
   140373c19:	84 c0                	test   al,al
   140373c1b:	0f 84 98 00 00 00    	je     0x140373cb9
   140373c21:	45 32 c0             	xor    r8b,r8b
   140373c24:	47 38 44 1a 61       	cmp    BYTE PTR [r10+r11*1+0x61],r8b
   140373c29:	76 31                	jbe    0x140373c5c
   140373c2b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140373c30:	4b 8b 84 da 98 00 00 	mov    rax,QWORD PTR [r10+r11*8+0x98]
   140373c37:	00 
   140373c38:	0f 28 c1             	movaps xmm0,xmm1
   140373c3b:	41 0f b6 d0          	movzx  edx,r8b
   140373c3f:	41 fe c0             	inc    r8b
   140373c42:	0f af d3             	imul   edx,ebx
   140373c45:	48 8b 48 10          	mov    rcx,QWORD PTR [rax+0x10]
   140373c49:	03 d7                	add    edx,edi
   140373c4b:	f3 0f 58 04 91       	addss  xmm0,DWORD PTR [rcx+rdx*4]
   140373c50:	f3 0f 11 04 91       	movss  DWORD PTR [rcx+rdx*4],xmm0
   140373c55:	47 3a 44 13 61       	cmp    r8b,BYTE PTR [r11+r10*1+0x61]
   140373c5a:	72 d4                	jb     0x140373c30
   140373c5c:	41 0f b6 42 60       	movzx  eax,BYTE PTR [r10+0x60]
   140373c61:	41 ff c3             	inc    r11d
   140373c64:	44 3b d8             	cmp    r11d,eax
   140373c67:	72 b8                	jb     0x140373c21
   140373c69:	eb 4e                	jmp    0x140373cb9
   140373c6b:	84 c0                	test   al,al
   140373c6d:	74 4a                	je     0x140373cb9
   140373c6f:	90                   	nop
   140373c70:	45 32 c0             	xor    r8b,r8b
   140373c73:	47 38 44 13 61       	cmp    BYTE PTR [r11+r10*1+0x61],r8b
   140373c78:	76 32                	jbe    0x140373cac
   140373c7a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140373c80:	4b 8b 84 da 98 00 00 	mov    rax,QWORD PTR [r10+r11*8+0x98]
   140373c87:	00 
   140373c88:	0f 28 c1             	movaps xmm0,xmm1
   140373c8b:	41 0f b6 d0          	movzx  edx,r8b
   140373c8f:	41 fe c0             	inc    r8b
   140373c92:	0f af d3             	imul   edx,ebx
   140373c95:	48 8b 48 10          	mov    rcx,QWORD PTR [rax+0x10]
   140373c99:	03 d7                	add    edx,edi
   140373c9b:	f3 0f 59 04 91       	mulss  xmm0,DWORD PTR [rcx+rdx*4]
   140373ca0:	f3 0f 11 04 91       	movss  DWORD PTR [rcx+rdx*4],xmm0
   140373ca5:	47 3a 44 13 61       	cmp    r8b,BYTE PTR [r11+r10*1+0x61]
   140373caa:	72 d4                	jb     0x140373c80
   140373cac:	41 0f b6 42 60       	movzx  eax,BYTE PTR [r10+0x60]
   140373cb1:	41 ff c3             	inc    r11d
   140373cb4:	44 3b d8             	cmp    r11d,eax
   140373cb7:	72 b7                	jb     0x140373c70
   140373cb9:	8b c6                	mov    eax,esi
   140373cbb:	41 03 f5             	add    esi,r13d
   140373cbe:	41 2b 02             	sub    eax,DWORD PTR [r10]
   140373cc1:	42 80 0c 38 04       	or     BYTE PTR [rax+r15*1],0x4
   140373cc6:	3b f5                	cmp    esi,ebp
   140373cc8:	0f 86 a2 fe ff ff    	jbe    0x140373b70
   140373cce:	4c 8b 74 24 18       	mov    r14,QWORD PTR [rsp+0x18]
   140373cd3:	4c 8b 64 24 20       	mov    r12,QWORD PTR [rsp+0x20]
   140373cd8:	41 c6 46 08 01       	mov    BYTE PTR [r14+0x8],0x1
   140373cdd:	49 83 c6 10          	add    r14,0x10
   140373ce1:	49 83 ec 01          	sub    r12,0x1
   140373ce5:	4c 89 74 24 18       	mov    QWORD PTR [rsp+0x18],r14
   140373cea:	4c 89 64 24 20       	mov    QWORD PTR [rsp+0x20],r12
   140373cef:	0f 85 5b fe ff ff    	jne    0x140373b50
   140373cf5:	44 8b 4c 24 08       	mov    r9d,DWORD PTR [rsp+0x8]
   140373cfa:	44 8b 5c 24 14       	mov    r11d,DWORD PTR [rsp+0x14]
   140373cff:	48 8b 6c 24 30       	mov    rbp,QWORD PTR [rsp+0x30]
   140373d04:	44 0f b6 34 24       	movzx  r14d,BYTE PTR [rsp]
   140373d09:	44 8b a4 24 30 41 00 	mov    r12d,DWORD PTR [rsp+0x4130]
   140373d10:	00 
   140373d11:	8b 7c 24 04          	mov    edi,DWORD PTR [rsp+0x4]
   140373d15:	45 84 f6             	test   r14b,r14b
   140373d18:	74 3b                	je     0x140373d55
   140373d1a:	41 8d 49 fd          	lea    ecx,[r9-0x3]
   140373d1e:	48 03 c9             	add    rcx,rcx
   140373d21:	0f 10 44 cc 40       	movups xmm0,XMMWORD PTR [rsp+rcx*8+0x40]
   140373d26:	41 8d 49 fe          	lea    ecx,[r9-0x2]
   140373d2a:	48 03 c9             	add    rcx,rcx
   140373d2d:	0f 29 44 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm0
   140373d32:	0f 10 44 cc 40       	movups xmm0,XMMWORD PTR [rsp+rcx*8+0x40]
   140373d37:	41 8d 49 ff          	lea    ecx,[r9-0x1]
   140373d3b:	41 b9 03 00 00 00    	mov    r9d,0x3
   140373d41:	48 03 c9             	add    rcx,rcx
   140373d44:	0f 29 44 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm0
   140373d49:	0f 10 44 cc 40       	movups xmm0,XMMWORD PTR [rsp+rcx*8+0x40]
   140373d4e:	0f 29 44 24 60       	movaps XMMWORD PTR [rsp+0x60],xmm0
   140373d53:	eb 06                	jmp    0x140373d5b
   140373d55:	45 33 c9             	xor    r9d,r9d
   140373d58:	0f 28 fd             	movaps xmm7,xmm5
   140373d5b:	44 89 4c 24 08       	mov    DWORD PTR [rsp+0x8],r9d
   140373d60:	41 8b 4a 04          	mov    ecx,DWORD PTR [r10+0x4]
   140373d64:	45 03 dd             	add    r11d,r13d
   140373d67:	8b 5c 24 0c          	mov    ebx,DWORD PTR [rsp+0xc]
   140373d6b:	8b 74 24 10          	mov    esi,DWORD PTR [rsp+0x10]
   140373d6f:	44 89 5c 24 14       	mov    DWORD PTR [rsp+0x14],r11d
   140373d74:	44 3b d9             	cmp    r11d,ecx
   140373d77:	0f 8c 13 fb ff ff    	jl     0x140373890
   140373d7d:	44 0f 28 ac 24 50 40 	movaps xmm13,XMMWORD PTR [rsp+0x4050]
   140373d84:	00 00 
   140373d86:	44 0f 28 a4 24 60 40 	movaps xmm12,XMMWORD PTR [rsp+0x4060]
   140373d8d:	00 00 
   140373d8f:	44 0f 28 9c 24 70 40 	movaps xmm11,XMMWORD PTR [rsp+0x4070]
   140373d96:	00 00 
   140373d98:	44 0f 28 94 24 80 40 	movaps xmm10,XMMWORD PTR [rsp+0x4080]
   140373d9f:	00 00 
   140373da1:	0f 28 b4 24 c0 40 00 	movaps xmm6,XMMWORD PTR [rsp+0x40c0]
   140373da8:	00 
   140373da9:	4c 8b a4 24 18 41 00 	mov    r12,QWORD PTR [rsp+0x4118]
   140373db0:	00 
   140373db1:	48 8b 8c 24 40 40 00 	mov    rcx,QWORD PTR [rsp+0x4040]
   140373db8:	00 
   140373db9:	48 33 cc             	xor    rcx,rsp
   140373dbc:	e8 3f 78 2a 00       	call   0x14061b600
   140373dc1:	4c 8d 9c 24 d0 40 00 	lea    r11,[rsp+0x40d0]
   140373dc8:	00 
   140373dc9:	41 0f 28 7b e0       	movaps xmm7,XMMWORD PTR [r11-0x20]
   140373dce:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   140373dd3:	45 0f 28 4b c0       	movaps xmm9,XMMWORD PTR [r11-0x40]
   140373dd8:	49 8b e3             	mov    rsp,r11
   140373ddb:	41 5f                	pop    r15
   140373ddd:	41 5e                	pop    r14
   140373ddf:	41 5d                	pop    r13
   140373de1:	5f                   	pop    rdi
   140373de2:	5e                   	pop    rsi
   140373de3:	5d                   	pop    rbp
   140373de4:	5b                   	pop    rbx
   140373de5:	c3                   	ret
   140373de6:	cc                   	int3
   140373de7:	cc                   	int3
   140373de8:	cc                   	int3
   140373de9:	cc                   	int3
   140373dea:	cc                   	int3
   140373deb:	cc                   	int3
   140373dec:	cc                   	int3
   140373ded:	cc                   	int3
   140373dee:	cc                   	int3
   140373def:	cc                   	int3
   140373df0:	44 89 4c 24 20       	mov    DWORD PTR [rsp+0x20],r9d
   140373df5:	48 89 54 24 10       	mov    QWORD PTR [rsp+0x10],rdx
   140373dfa:	55                   	push   rbp
   140373dfb:	56                   	push   rsi
   140373dfc:	41 55                	push   r13
   140373dfe:	48 81 ec 00 01 00 00 	sub    rsp,0x100
   140373e05:	44 8b 94 24 40 01 00 	mov    r10d,DWORD PTR [rsp+0x140]
   140373e0c:	00 
   140373e0d:	45 8b e9             	mov    r13d,r9d
   140373e10:	44 8b 1d 99 63 61 00 	mov    r11d,DWORD PTR [rip+0x616399]        # 0x14098a1b0
   140373e17:	49 8b e8             	mov    rbp,r8
   140373e1a:	48 8b f1             	mov    rsi,rcx
   140373e1d:	45 85 d2             	test   r10d,r10d
   140373e20:	79 0c                	jns    0x140373e2e
   140373e22:	45 8b d3             	mov    r10d,r11d
   140373e25:	45 85 db             	test   r11d,r11d
   140373e28:	0f 88 99 05 00 00    	js     0x1403743c7
   140373e2e:	44 8b 05 9b cf 63 14 	mov    r8d,DWORD PTR [rip+0x1463cf9b]        # 0x1549b0dd0
   140373e35:	45 3b d0             	cmp    r10d,r8d
   140373e38:	0f 8d 89 05 00 00    	jge    0x1403743c7
   140373e3e:	48 89 bc 24 f8 00 00 	mov    QWORD PTR [rsp+0xf8],rdi
   140373e45:	00 
   140373e46:	48 8d 15 83 67 61 00 	lea    rdx,[rip+0x616783]        # 0x14098a5d0
   140373e4d:	4c 89 a4 24 f0 00 00 	mov    QWORD PTR [rsp+0xf0],r12
   140373e54:	00 
   140373e55:	4c 89 b4 24 e8 00 00 	mov    QWORD PTR [rsp+0xe8],r14
   140373e5c:	00 
   140373e5d:	4c 89 bc 24 e0 00 00 	mov    QWORD PTR [rsp+0xe0],r15
   140373e64:	00 
   140373e65:	44 0f 29 8c 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm9
   140373e6c:	00 00 
   140373e6e:	44 0f 29 94 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm10
   140373e75:	00 00 
   140373e77:	44 0f 29 64 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm12
   140373e7d:	44 0f 29 6c 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm13
   140373e83:	44 0f 29 74 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm14
   140373e89:	f3 44 0f 10 35 d2 3b 	movss  xmm14,DWORD PTR [rip+0x333bd2]        # 0x1406a7a64
   140373e90:	33 00 
   140373e92:	44 0f 29 7c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm15
   140373e98:	45 0f 28 ee          	movaps xmm13,xmm14
   140373e9c:	49 63 c2             	movsxd rax,r10d
   140373e9f:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140373ea6:	f3 44 0f 10 bc 11 50 	movss  xmm15,DWORD PTR [rcx+rdx*1+0x39150]
   140373ead:	91 03 00 
   140373eb0:	f3 44 0f 5e 3d f3 c0 	divss  xmm15,DWORD PTR [rip+0x4dc0f3]        # 0x14084ffac
   140373eb7:	4d 00 
   140373eb9:	f3 45 0f 5e ef       	divss  xmm13,xmm15
   140373ebe:	45 85 d2             	test   r10d,r10d
   140373ec1:	79 08                	jns    0x140373ecb
   140373ec3:	45 8b d3             	mov    r10d,r11d
   140373ec6:	45 85 db             	test   r11d,r11d
   140373ec9:	78 3e                	js     0x140373f09
   140373ecb:	45 3b d0             	cmp    r10d,r8d
   140373ece:	7d 39                	jge    0x140373f09
   140373ed0:	49 63 c2             	movsxd rax,r10d
   140373ed3:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140373eda:	f3 0f 10 84 11 50 91 	movss  xmm0,DWORD PTR [rcx+rdx*1+0x39150]
   140373ee1:	03 00 
   140373ee3:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140373ee6:	0f 28 c8             	movaps xmm1,xmm0
   140373ee9:	f2 0f 59 0d 37 c2 4d 	mulsd  xmm1,QWORD PTR [rip+0x4dc237]        # 0x140850128
   140373ef0:	00 
   140373ef1:	f2 0f 58 0d 87 c1 4d 	addsd  xmm1,QWORD PTR [rip+0x4dc187]        # 0x140850080
   140373ef8:	00 
   140373ef9:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140373efd:	f2 48 0f 2c c9       	cvttsd2si rcx,xmm1
   140373f02:	48 89 4c 24 30       	mov    QWORD PTR [rsp+0x30],rcx
   140373f07:	eb 08                	jmp    0x140373f11
   140373f09:	c7 44 24 30 00 00 00 	mov    DWORD PTR [rsp+0x30],0x0
   140373f10:	00 
   140373f11:	44 8b 06             	mov    r8d,DWORD PTR [rsi]
   140373f14:	33 d2                	xor    edx,edx
   140373f16:	8b 7e 04             	mov    edi,DWORD PTR [rsi+0x4]
   140373f19:	45 33 e4             	xor    r12d,r12d
   140373f1c:	ff cf                	dec    edi
   140373f1e:	44 89 a4 24 40 01 00 	mov    DWORD PTR [rsp+0x140],r12d
   140373f25:	00 
   140373f26:	8b c7                	mov    eax,edi
   140373f28:	45 33 ff             	xor    r15d,r15d
   140373f2b:	41 2b c0             	sub    eax,r8d
   140373f2e:	45 33 f6             	xor    r14d,r14d
   140373f31:	41 f7 f5             	div    r13d
   140373f34:	43 8d 04 08          	lea    eax,[r8+r9*1]
   140373f38:	45 0f 57 e4          	xorps  xmm12,xmm12
   140373f3c:	2b fa                	sub    edi,edx
   140373f3e:	0f 57 ed             	xorps  xmm5,xmm5
   140373f41:	45 0f 57 d2          	xorps  xmm10,xmm10
   140373f45:	45 0f 57 c9          	xorps  xmm9,xmm9
   140373f49:	3b f8                	cmp    edi,eax
   140373f4b:	0f 8c 2c 04 00 00    	jl     0x14037437d
   140373f51:	f3 0f 10 0d 0f c3 4d 	movss  xmm1,DWORD PTR [rip+0x4dc30f]        # 0x140850268
   140373f58:	00 
   140373f59:	48 89 9c 24 20 01 00 	mov    QWORD PTR [rsp+0x120],rbx
   140373f60:	00 
   140373f61:	0f b6 9c 24 40 01 00 	movzx  ebx,BYTE PTR [rsp+0x140]
   140373f68:	00 
   140373f69:	0f 29 b4 24 d0 00 00 	movaps XMMWORD PTR [rsp+0xd0],xmm6
   140373f70:	00 
   140373f71:	f3 0f 10 35 cb 31 32 	movss  xmm6,DWORD PTR [rip+0x3231cb]        # 0x140697144
   140373f78:	00 
   140373f79:	44 0f 29 9c 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm11
   140373f80:	00 00 
   140373f82:	f2 44 0f 10 1d bd 43 	movsd  xmm11,QWORD PTR [rip+0x3343bd]        # 0x1406a8348
   140373f89:	33 00 
   140373f8b:	0f 29 bc 24 c0 00 00 	movaps XMMWORD PTR [rsp+0xc0],xmm7
   140373f92:	00 
   140373f93:	44 0f 29 84 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm8
   140373f9a:	00 00 
   140373f9c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140373fa0:	44 8b 4e 04          	mov    r9d,DWORD PTR [rsi+0x4]
   140373fa4:	45 3b c8             	cmp    r9d,r8d
   140373fa7:	0f 8e 87 03 00 00    	jle    0x140374334
   140373fad:	44 0f b7 96 1c 02 00 	movzx  r10d,WORD PTR [rsi+0x21c]
   140373fb4:	00 
   140373fb5:	41 8b c0             	mov    eax,r8d
   140373fb8:	66 45 85 d2          	test   r10w,r10w
   140373fbc:	78 0f                	js     0x140373fcd
   140373fbe:	41 3b f8             	cmp    edi,r8d
   140373fc1:	0f 4d c7             	cmovge eax,edi
   140373fc4:	41 3b c1             	cmp    eax,r9d
   140373fc7:	7c 04                	jl     0x140373fcd
   140373fc9:	41 8d 41 ff          	lea    eax,[r9-0x1]
   140373fcd:	4c 8b 5e 08          	mov    r11,QWORD PTR [rsi+0x8]
   140373fd1:	41 2b c0             	sub    eax,r8d
   140373fd4:	f3 41 0f 10 3c 83    	movss  xmm7,DWORD PTR [r11+rax*4]
   140373fda:	41 0f 2e fc          	ucomiss xmm7,xmm12
   140373fde:	7a 06                	jp     0x140373fe6
   140373fe0:	0f 84 4e 03 00 00    	je     0x140374334
   140373fe6:	8b c7                	mov    eax,edi
   140373fe8:	33 d2                	xor    edx,edx
   140373fea:	41 2b c0             	sub    eax,r8d
   140373fed:	0f 28 c7             	movaps xmm0,xmm7
   140373ff0:	41 f7 f5             	div    r13d
   140373ff3:	f3 41 0f 5e c6       	divss  xmm0,xmm14
   140373ff8:	8b c8                	mov    ecx,eax
   140373ffa:	48 8b 84 24 28 01 00 	mov    rax,QWORD PTR [rsp+0x128]
   140374001:	00 
   140374002:	0f 28 e1             	movaps xmm4,xmm1
   140374005:	f3 44 0f 2c 2c 88    	cvttss2si r13d,DWORD PTR [rax+rcx*4]
   14037400b:	41 8d 40 01          	lea    eax,[r8+0x1]
   14037400f:	f3 0f 5d e0          	minss  xmm4,xmm0
   140374013:	44 89 6c 24 28       	mov    DWORD PTR [rsp+0x28],r13d
   140374018:	3b f8                	cmp    edi,eax
   14037401a:	0f 8e a4 01 00 00    	jle    0x1403741c4
   140374020:	8d 4f ff             	lea    ecx,[rdi-0x1]
   140374023:	45 3b c8             	cmp    r9d,r8d
   140374026:	0f 8e 08 03 00 00    	jle    0x140374334
   14037402c:	41 8b c0             	mov    eax,r8d
   14037402f:	66 45 85 d2          	test   r10w,r10w
   140374033:	78 0f                	js     0x140374044
   140374035:	41 3b c8             	cmp    ecx,r8d
   140374038:	0f 4d c1             	cmovge eax,ecx
   14037403b:	41 3b c1             	cmp    eax,r9d
   14037403e:	7c 04                	jl     0x140374044
   140374040:	41 8d 41 ff          	lea    eax,[r9-0x1]
   140374044:	41 2b c0             	sub    eax,r8d
   140374047:	f3 41 0f 10 14 83    	movss  xmm2,DWORD PTR [r11+rax*4]
   14037404d:	41 0f 2e d4          	ucomiss xmm2,xmm12
   140374051:	7a 06                	jp     0x140374059
   140374053:	0f 84 db 02 00 00    	je     0x140374334
   140374059:	0f 28 c2             	movaps xmm0,xmm2
   14037405c:	f3 0f 59 e6          	mulss  xmm4,xmm6
   140374060:	f3 41 0f 5e c6       	divss  xmm0,xmm14
   140374065:	0f 28 d9             	movaps xmm3,xmm1
   140374068:	0f 28 cc             	movaps xmm1,xmm4
   14037406b:	f3 0f 5d d8          	minss  xmm3,xmm0
   14037406f:	0f 28 c2             	movaps xmm0,xmm2
   140374072:	f3 0f 58 cf          	addss  xmm1,xmm7
   140374076:	f3 0f 59 de          	mulss  xmm3,xmm6
   14037407a:	f3 0f 5c c3          	subss  xmm0,xmm3
   14037407e:	0f 2f c8             	comiss xmm1,xmm0
   140374081:	0f 82 3d 01 00 00    	jb     0x1403741c4
   140374087:	0f 28 c7             	movaps xmm0,xmm7
   14037408a:	f3 0f 58 da          	addss  xmm3,xmm2
   14037408e:	f3 0f 5c c4          	subss  xmm0,xmm4
   140374092:	0f 2f d8             	comiss xmm3,xmm0
   140374095:	0f 82 29 01 00 00    	jb     0x1403741c4
   14037409b:	33 c0                	xor    eax,eax
   14037409d:	ba 01 00 00 00       	mov    edx,0x1
   1403740a2:	0f 2f d7             	comiss xmm2,xmm7
   1403740a5:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   1403740aa:	0f 47 c2             	cmova  eax,edx
   1403740ad:	0f 2f fa             	comiss xmm7,xmm2
   1403740b0:	0f 47 c1             	cmova  eax,ecx
   1403740b3:	45 85 ff             	test   r15d,r15d
   1403740b6:	0f 85 c7 00 00 00    	jne    0x140374183
   1403740bc:	41 0f 2e ec          	ucomiss xmm5,xmm12
   1403740c0:	7a 02                	jp     0x1403740c4
   1403740c2:	74 28                	je     0x1403740ec
   1403740c4:	0f 28 cf             	movaps xmm1,xmm7
   1403740c7:	f3 41 0f 5e cd       	divss  xmm1,xmm13
   1403740cc:	0f 28 c1             	movaps xmm0,xmm1
   1403740cf:	f3 0f 58 c7          	addss  xmm0,xmm7
   1403740d3:	0f 2f d0             	comiss xmm2,xmm0
   1403740d6:	0f 83 95 00 00 00    	jae    0x140374171
   1403740dc:	0f 28 c7             	movaps xmm0,xmm7
   1403740df:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403740e3:	0f 2f c2             	comiss xmm0,xmm2
   1403740e6:	0f 83 85 00 00 00    	jae    0x140374171
   1403740ec:	45 85 f6             	test   r14d,r14d
   1403740ef:	74 46                	je     0x140374137
   1403740f1:	41 8b c6             	mov    eax,r14d
   1403740f4:	0f 57 f6             	xorps  xmm6,xmm6
   1403740f7:	41 0f 28 c1          	movaps xmm0,xmm9
   1403740fb:	f2 48 0f 2a f0       	cvtsi2sd xmm6,rax
   140374100:	f2 0f 5e c6          	divsd  xmm0,xmm6
   140374104:	e8 01 cd 2a 00       	call   0x140620e0a
   140374109:	66 41 0f 2e f2       	ucomisd xmm6,xmm10
   14037410e:	7a 02                	jp     0x140374112
   140374110:	74 25                	je     0x140374137
   140374112:	0f 28 d0             	movaps xmm2,xmm0
   140374115:	0f 28 c8             	movaps xmm1,xmm0
   140374118:	f2 0f 5e 15 90 a6 33 	divsd  xmm2,QWORD PTR [rip+0x33a690]        # 0x1406ae7b0
   14037411f:	00 
   140374120:	0f 5a df             	cvtps2pd xmm3,xmm7
   140374123:	f2 0f 5c ca          	subsd  xmm1,xmm2
   140374127:	66 0f 2f cb          	comisd xmm1,xmm3
   14037412b:	77 0a                	ja     0x140374137
   14037412d:	f2 0f 58 d0          	addsd  xmm2,xmm0
   140374131:	66 0f 2f da          	comisd xmm3,xmm2
   140374135:	76 0b                	jbe    0x140374142
   140374137:	89 7c 24 20          	mov    DWORD PTR [rsp+0x20],edi
   14037413b:	45 33 f6             	xor    r14d,r14d
   14037413e:	45 0f 28 ca          	movaps xmm9,xmm10
   140374142:	0f 28 c7             	movaps xmm0,xmm7
   140374145:	41 0f b6 dd          	movzx  ebx,r13b
   140374149:	e8 62 cc 2a 00       	call   0x140620db0
   14037414e:	0f 28 c8             	movaps xmm1,xmm0
   140374151:	89 7c 24 24          	mov    DWORD PTR [rsp+0x24],edi
   140374155:	66 0f 6e c3          	movd   xmm0,ebx
   140374159:	44 03 f3             	add    r14d,ebx
   14037415c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037415f:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140374163:	f3 0f 5a c9          	cvtss2sd xmm1,xmm1
   140374167:	f2 44 0f 58 c9       	addsd  xmm9,xmm1
   14037416c:	e9 ac 01 00 00       	jmp    0x14037431d
   140374171:	44 8b f8             	mov    r15d,eax
   140374174:	89 94 24 40 01 00 00 	mov    DWORD PTR [rsp+0x140],edx
   14037417b:	44 8b e7             	mov    r12d,edi
   14037417e:	e9 a2 01 00 00       	jmp    0x140374325
   140374183:	41 3b c7             	cmp    eax,r15d
   140374186:	75 45                	jne    0x1403741cd
   140374188:	d0 eb                	shr    bl,1
   14037418a:	44 3a eb             	cmp    r13b,bl
   14037418d:	76 30                	jbe    0x1403741bf
   14037418f:	0f 28 cf             	movaps xmm1,xmm7
   140374192:	f3 41 0f 5e cd       	divss  xmm1,xmm13
   140374197:	0f 28 c1             	movaps xmm0,xmm1
   14037419a:	f3 0f 58 c7          	addss  xmm0,xmm7
   14037419e:	0f 2f d0             	comiss xmm2,xmm0
   1403741a1:	73 10                	jae    0x1403741b3
   1403741a3:	0f 28 c7             	movaps xmm0,xmm7
   1403741a6:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403741aa:	0f 2f c2             	comiss xmm0,xmm2
   1403741ad:	0f 82 72 01 00 00    	jb     0x140374325
   1403741b3:	ff 84 24 40 01 00 00 	inc    DWORD PTR [rsp+0x140]
   1403741ba:	e9 66 01 00 00       	jmp    0x140374325
   1403741bf:	8d 5f 01             	lea    ebx,[rdi+0x1]
   1403741c2:	eb 0b                	jmp    0x1403741cf
   1403741c4:	45 85 ff             	test   r15d,r15d
   1403741c7:	0f 84 58 01 00 00    	je     0x140374325
   1403741cd:	8b df                	mov    ebx,edi
   1403741cf:	45 85 f6             	test   r14d,r14d
   1403741d2:	0f 84 4d 01 00 00    	je     0x140374325
   1403741d8:	45 0f 57 c0          	xorps  xmm8,xmm8
   1403741dc:	45 8b fc             	mov    r15d,r12d
   1403741df:	0f 5a c7             	cvtps2pd xmm0,xmm7
   1403741e2:	44 2b fb             	sub    r15d,ebx
   1403741e5:	41 8d 47 01          	lea    eax,[r15+0x1]
   1403741e9:	f3 44 0f 2a c0       	cvtsi2ss xmm8,eax
   1403741ee:	f2 0f 59 05 5a 9f 31 	mulsd  xmm0,QWORD PTR [rip+0x319f5a]        # 0x14068e150
   1403741f5:	00 
   1403741f6:	f3 45 0f 59 c7       	mulss  xmm8,xmm15
   1403741fb:	f2 0f 5e 05 6d 9f 31 	divsd  xmm0,QWORD PTR [rip+0x319f6d]        # 0x14068e170
   140374202:	00 
   140374203:	f3 44 0f 5f 05 94 bf 	maxss  xmm8,DWORD PTR [rip+0x4dbf94]        # 0x1408501a0
   14037420a:	4d 00 
   14037420c:	e8 63 cb 2a 00       	call   0x140620d74
   140374211:	f2 0f 59 05 27 9f 31 	mulsd  xmm0,QWORD PTR [rip+0x319f27]        # 0x14068e140
   140374218:	00 
   140374219:	0f 57 c9             	xorps  xmm1,xmm1
   14037421c:	41 8b c6             	mov    eax,r14d
   14037421f:	0f 57 f6             	xorps  xmm6,xmm6
   140374222:	f2 0f 5e 05 ee 9e 31 	divsd  xmm0,QWORD PTR [rip+0x319eee]        # 0x14068e118
   140374229:	00 
   14037422a:	f2 48 0f 2a c8       	cvtsi2sd xmm1,rax
   14037422f:	f2 0f 58 05 01 9f 31 	addsd  xmm0,QWORD PTR [rip+0x319f01]        # 0x14068e138
   140374236:	00 
   140374237:	f2 44 0f 5e c9       	divsd  xmm9,xmm1
   14037423c:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   140374240:	41 0f 28 c1          	movaps xmm0,xmm9
   140374244:	e8 c1 cb 2a 00       	call   0x140620e0a
   140374249:	44 0f 28 c8          	movaps xmm9,xmm0
   14037424d:	f2 0f 59 05 fb 9e 31 	mulsd  xmm0,QWORD PTR [rip+0x319efb]        # 0x14068e150
   140374254:	00 
   140374255:	f2 0f 5e 05 13 9f 31 	divsd  xmm0,QWORD PTR [rip+0x319f13]        # 0x14068e170
   14037425c:	00 
   14037425d:	e8 12 cb 2a 00       	call   0x140620d74
   140374262:	f2 0f 59 05 d6 9e 31 	mulsd  xmm0,QWORD PTR [rip+0x319ed6]        # 0x14068e140
   140374269:	00 
   14037426a:	0f 57 c9             	xorps  xmm1,xmm1
   14037426d:	f2 0f 5e 05 a3 9e 31 	divsd  xmm0,QWORD PTR [rip+0x319ea3]        # 0x14068e118
   140374274:	00 
   140374275:	f2 0f 58 05 bb 9e 31 	addsd  xmm0,QWORD PTR [rip+0x319ebb]        # 0x14068e138
   14037427c:	00 
   14037427d:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140374281:	0f 2f f1             	comiss xmm6,xmm1
   140374284:	76 06                	jbe    0x14037428c
   140374286:	f3 0f 5c f1          	subss  xmm6,xmm1
   14037428a:	eb 07                	jmp    0x140374293
   14037428c:	f3 0f 5c ce          	subss  xmm1,xmm6
   140374290:	0f 28 f1             	movaps xmm6,xmm1
   140374293:	83 bc 24 40 01 00 00 	cmp    DWORD PTR [rsp+0x140],0x1
   14037429a:	01 
   14037429b:	72 76                	jb     0x140374313
   14037429d:	41 0f 2f f0          	comiss xmm6,xmm8
   1403742a1:	72 70                	jb     0x140374313
   1403742a3:	8b 44 24 20          	mov    eax,DWORD PTR [rsp+0x20]
   1403742a7:	2b 44 24 24          	sub    eax,DWORD PTR [rsp+0x24]
   1403742ab:	3b 44 24 30          	cmp    eax,DWORD PTR [rsp+0x30]
   1403742af:	76 62                	jbe    0x140374313
   1403742b1:	41 3b dc             	cmp    ebx,r12d
   1403742b4:	7f 5d                	jg     0x140374313
   1403742b6:	0f 57 f6             	xorps  xmm6,xmm6
   1403742b9:	41 bd ff ff ff ff    	mov    r13d,0xffffffff
   1403742bf:	f2 41 0f 5a f1       	cvtsd2ss xmm6,xmm9
   1403742c4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403742c8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1403742cf:	00 
   1403742d0:	41 b1 01             	mov    r9b,0x1
   1403742d3:	0f 28 d6             	movaps xmm2,xmm6
   1403742d6:	8b d3                	mov    edx,ebx
   1403742d8:	48 8b ce             	mov    rcx,rsi
   1403742db:	e8 a0 20 f0 ff       	call   0x140276380
   1403742e0:	8b c3                	mov    eax,ebx
   1403742e2:	41 8b d5             	mov    edx,r13d
   1403742e5:	2b 06                	sub    eax,DWORD PTR [rsi]
   1403742e7:	41 0f 28 c3          	movaps xmm0,xmm11
   1403742eb:	48 63 c8             	movsxd rcx,eax
   1403742ee:	80 0c 29 01          	or     BYTE PTR [rcx+rbp*1],0x1
   1403742f2:	e8 29 8f ff ff       	call   0x14036d220
   1403742f7:	44 3b f8             	cmp    r15d,eax
   1403742fa:	7e 0b                	jle    0x140374307
   1403742fc:	8b c3                	mov    eax,ebx
   1403742fe:	2b 06                	sub    eax,DWORD PTR [rsi]
   140374300:	48 63 c8             	movsxd rcx,eax
   140374303:	80 0c 29 02          	or     BYTE PTR [rcx+rbp*1],0x2
   140374307:	ff c3                	inc    ebx
   140374309:	41 3b dc             	cmp    ebx,r12d
   14037430c:	7e c2                	jle    0x1403742d0
   14037430e:	44 8b 6c 24 28       	mov    r13d,DWORD PTR [rsp+0x28]
   140374313:	45 33 ff             	xor    r15d,r15d
   140374316:	45 0f 28 ca          	movaps xmm9,xmm10
   14037431a:	45 33 f6             	xor    r14d,r14d
   14037431d:	f3 0f 10 35 1f 2e 32 	movss  xmm6,DWORD PTR [rip+0x322e1f]        # 0x140697144
   140374324:	00 
   140374325:	f3 0f 10 0d 3b bf 4d 	movss  xmm1,DWORD PTR [rip+0x4dbf3b]        # 0x140850268
   14037432c:	00 
   14037432d:	0f 28 ef             	movaps xmm5,xmm7
   140374330:	41 0f b6 dd          	movzx  ebx,r13b
   140374334:	8b 84 24 38 01 00 00 	mov    eax,DWORD PTR [rsp+0x138]
   14037433b:	2b f8                	sub    edi,eax
   14037433d:	44 8b 06             	mov    r8d,DWORD PTR [rsi]
   140374340:	41 03 c0             	add    eax,r8d
   140374343:	44 8b ac 24 38 01 00 	mov    r13d,DWORD PTR [rsp+0x138]
   14037434a:	00 
   14037434b:	3b f8                	cmp    edi,eax
   14037434d:	0f 8d 4d fc ff ff    	jge    0x140373fa0
   140374353:	44 0f 28 9c 24 80 00 	movaps xmm11,XMMWORD PTR [rsp+0x80]
   14037435a:	00 00 
   14037435c:	44 0f 28 84 24 b0 00 	movaps xmm8,XMMWORD PTR [rsp+0xb0]
   140374363:	00 00 
   140374365:	0f 28 bc 24 c0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xc0]
   14037436c:	00 
   14037436d:	0f 28 b4 24 d0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xd0]
   140374374:	00 
   140374375:	48 8b 9c 24 20 01 00 	mov    rbx,QWORD PTR [rsp+0x120]
   14037437c:	00 
   14037437d:	44 0f 28 74 24 50    	movaps xmm14,XMMWORD PTR [rsp+0x50]
   140374383:	44 0f 28 6c 24 60    	movaps xmm13,XMMWORD PTR [rsp+0x60]
   140374389:	44 0f 28 64 24 70    	movaps xmm12,XMMWORD PTR [rsp+0x70]
   14037438f:	44 0f 28 94 24 90 00 	movaps xmm10,XMMWORD PTR [rsp+0x90]
   140374396:	00 00 
   140374398:	44 0f 28 8c 24 a0 00 	movaps xmm9,XMMWORD PTR [rsp+0xa0]
   14037439f:	00 00 
   1403743a1:	4c 8b bc 24 e0 00 00 	mov    r15,QWORD PTR [rsp+0xe0]
   1403743a8:	00 
   1403743a9:	4c 8b b4 24 e8 00 00 	mov    r14,QWORD PTR [rsp+0xe8]
   1403743b0:	00 
   1403743b1:	4c 8b a4 24 f0 00 00 	mov    r12,QWORD PTR [rsp+0xf0]
   1403743b8:	00 
   1403743b9:	48 8b bc 24 f8 00 00 	mov    rdi,QWORD PTR [rsp+0xf8]
   1403743c0:	00 
   1403743c1:	44 0f 28 7c 24 40    	movaps xmm15,XMMWORD PTR [rsp+0x40]
   1403743c7:	48 81 c4 00 01 00 00 	add    rsp,0x100
   1403743ce:	41 5d                	pop    r13
   1403743d0:	5e                   	pop    rsi
   1403743d1:	5d                   	pop    rbp
   1403743d2:	c3                   	ret
   1403743d3:	cc                   	int3
   1403743d4:	cc                   	int3
   1403743d5:	cc                   	int3
   1403743d6:	cc                   	int3
   1403743d7:	cc                   	int3
   1403743d8:	cc                   	int3
   1403743d9:	cc                   	int3
   1403743da:	cc                   	int3
   1403743db:	cc                   	int3
   1403743dc:	cc                   	int3
   1403743dd:	cc                   	int3
   1403743de:	cc                   	int3
   1403743df:	cc                   	int3
   1403743e0:	4c 8b dc             	mov    r11,rsp
   1403743e3:	45 88 4b 20          	mov    BYTE PTR [r11+0x20],r9b
   1403743e7:	49 89 53 10          	mov    QWORD PTR [r11+0x10],rdx
   1403743eb:	53                   	push   rbx
   1403743ec:	41 54                	push   r12
   1403743ee:	41 55                	push   r13
   1403743f0:	41 56                	push   r14
   1403743f2:	48 81 ec f8 00 00 00 	sub    rsp,0xf8
   1403743f9:	f3 0f 10 84 24 40 01 	movss  xmm0,DWORD PTR [rsp+0x140]
   140374400:	00 00 
   140374402:	33 db                	xor    ebx,ebx
   140374404:	44 8b 71 04          	mov    r14d,DWORD PTR [rcx+0x4]
   140374408:	4c 8b d2             	mov    r10,rdx
   14037440b:	44 2b 31             	sub    r14d,DWORD PTR [rcx]
   14037440e:	4c 8b e1             	mov    r12,rcx
   140374411:	8b 42 04             	mov    eax,DWORD PTR [rdx+0x4]
   140374414:	2b 02                	sub    eax,DWORD PTR [rdx]
   140374416:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140374419:	4d 63 e8             	movsxd r13,r8d
   14037441c:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   140374421:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx
   140374426:	89 84 24 30 01 00 00 	mov    DWORD PTR [rsp+0x130],eax
   14037442d:	4e 8b ac ea 98 00 00 	mov    r13,QWORD PTR [rdx+r13*8+0x98]
   140374434:	00 
   140374435:	f2 0f 59 05 bb bd 4d 	mulsd  xmm0,QWORD PTR [rip+0x4dbdbb]        # 0x1408501f8
   14037443c:	00 
   14037443d:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   140374441:	f3 0f 11 8c 24 20 01 	movss  DWORD PTR [rsp+0x120],xmm1
   140374448:	00 00 
   14037444a:	0f 84 80 03 00 00    	je     0x1403747d0
   140374450:	49 89 6b d8          	mov    QWORD PTR [r11-0x28],rbp
   140374454:	41 8d 40 01          	lea    eax,[r8+0x1]
   140374458:	49 89 73 d0          	mov    QWORD PTR [r11-0x30],rsi
   14037445c:	48 81 c1 98 00 00 00 	add    rcx,0x98
   140374463:	49 89 7b c8          	mov    QWORD PTR [r11-0x38],rdi
   140374467:	8b d3                	mov    edx,ebx
   140374469:	4d 89 7b c0          	mov    QWORD PTR [r11-0x40],r15
   14037446d:	41 0f 29 73 a8       	movaps XMMWORD PTR [r11-0x58],xmm6
   140374472:	41 0f 29 7b 98       	movaps XMMWORD PTR [r11-0x68],xmm7
   140374477:	45 0f 29 43 88       	movaps XMMWORD PTR [r11-0x78],xmm8
   14037447c:	45 0f 29 8b 78 ff ff 	movaps XMMWORD PTR [r11-0x88],xmm9
   140374483:	ff 
   140374484:	45 0f 57 c9          	xorps  xmm9,xmm9
   140374488:	45 0f 29 93 68 ff ff 	movaps XMMWORD PTR [r11-0x98],xmm10
   14037448f:	ff 
   140374490:	f3 44 0f 10 15 e3 bd 	movss  xmm10,DWORD PTR [rip+0x4dbde3]        # 0x14085027c
   140374497:	4d 00 
   140374499:	44 0f 29 5c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm11
   14037449f:	f3 44 0f 10 5c 24 24 	movss  xmm11,DWORD PTR [rsp+0x24]
   1403744a6:	44 0f 29 64 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm12
   1403744ac:	f3 44 0f 10 64 24 20 	movss  xmm12,DWORD PTR [rsp+0x20]
   1403744b3:	44 0f 29 6c 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm13
   1403744b9:	44 0f 29 74 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm14
   1403744bf:	f3 44 0f 10 35 14 bb 	movss  xmm14,DWORD PTR [rip+0x4dbb14]        # 0x14084ffdc
   1403744c6:	4d 00 
   1403744c8:	66 44 0f 6e e8       	movd   xmm13,eax
   1403744cd:	44 0f 29 7c 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm15
   1403744d3:	f3 44 0f 10 3d 54 bb 	movss  xmm15,DWORD PTR [rip+0x4dbb54]        # 0x140850030
   1403744da:	4d 00 
   1403744dc:	45 0f 5b ed          	cvtdq2ps xmm13,xmm13
   1403744e0:	45 85 f6             	test   r14d,r14d
   1403744e3:	74 20                	je     0x140374505
   1403744e5:	49 8b 4c 24 08       	mov    rcx,QWORD PTR [r12+0x8]
   1403744ea:	41 8d 46 ff          	lea    eax,[r14-0x1]
   1403744ee:	3b d0                	cmp    edx,eax
   1403744f0:	0f 4d d0             	cmovge edx,eax
   1403744f3:	48 63 c2             	movsxd rax,edx
   1403744f6:	f3 0f 10 0c 81       	movss  xmm1,DWORD PTR [rcx+rax*4]
   1403744fb:	49 8d 8c 24 98 00 00 	lea    rcx,[r12+0x98]
   140374502:	00 
   140374503:	eb 04                	jmp    0x140374509
   140374505:	41 0f 28 c9          	movaps xmm1,xmm9
   140374509:	f3 41 0f 10 94 24 18 	movss  xmm2,DWORD PTR [r12+0x218]
   140374510:	02 00 00 
   140374513:	41 0f 28 c5          	movaps xmm0,xmm13
   140374517:	41 0f 2f d1          	comiss xmm2,xmm9
   14037451b:	f3 0f 59 c1          	mulss  xmm0,xmm1
   14037451f:	76 1d                	jbe    0x14037453e
   140374521:	41 0f 28 f5          	movaps xmm6,xmm13
   140374525:	f3 41 0f 59 f5       	mulss  xmm6,xmm13
   14037452a:	f3 41 0f 5c f7       	subss  xmm6,xmm15
   14037452f:	f3 0f 59 f2          	mulss  xmm6,xmm2
   140374533:	f3 41 0f 58 f7       	addss  xmm6,xmm15
   140374538:	f3 0f 59 f0          	mulss  xmm6,xmm0
   14037453c:	eb 03                	jmp    0x140374541
   14037453e:	0f 28 f0             	movaps xmm6,xmm0
   140374541:	41 0f 28 d1          	movaps xmm2,xmm9
   140374545:	41 0f 28 d9          	movaps xmm3,xmm9
   140374549:	45 85 f6             	test   r14d,r14d
   14037454c:	0f 84 b5 00 00 00    	je     0x140374607
   140374552:	41 0f b6 44 24 60    	movzx  eax,BYTE PTR [r12+0x60]
   140374558:	84 c0                	test   al,al
   14037455a:	0f 84 a7 00 00 00    	je     0x140374607
   140374560:	4d 8d 5c 24 61       	lea    r11,[r12+0x61]
   140374565:	44 0f b6 f8          	movzx  r15d,al
   140374569:	48 8b f9             	mov    rdi,rcx
   14037456c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140374570:	45 0f b6 13          	movzx  r10d,BYTE PTR [r11]
   140374574:	45 32 c9             	xor    r9b,r9b
   140374577:	45 84 d2             	test   r10b,r10b
   14037457a:	74 5d                	je     0x1403745d9
   14037457c:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   14037457f:	45 8d 46 ff          	lea    r8d,[r14-0x1]
   140374583:	48 8b 30             	mov    rsi,QWORD PTR [rax]
   140374586:	48 8b 68 18          	mov    rbp,QWORD PTR [rax+0x18]
   14037458a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140374590:	41 3b d8             	cmp    ebx,r8d
   140374593:	41 0f b6 d1          	movzx  edx,r9b
   140374597:	41 8b c0             	mov    eax,r8d
   14037459a:	0f 4c c3             	cmovl  eax,ebx
   14037459d:	41 0f af d6          	imul   edx,r14d
   1403745a1:	03 c2                	add    eax,edx
   1403745a3:	41 3b d8             	cmp    ebx,r8d
   1403745a6:	0f b7 04 46          	movzx  eax,WORD PTR [rsi+rax*2]
   1403745aa:	66 0f 6e c8          	movd   xmm1,eax
   1403745ae:	41 8b c0             	mov    eax,r8d
   1403745b1:	0f 4c c3             	cmovl  eax,ebx
   1403745b4:	41 fe c1             	inc    r9b
   1403745b7:	03 c2                	add    eax,edx
   1403745b9:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   1403745bc:	0f bf 44 45 00       	movsx  eax,WORD PTR [rbp+rax*2+0x0]
   1403745c1:	f3 0f 58 d9          	addss  xmm3,xmm1
   1403745c5:	66 0f 6e c0          	movd   xmm0,eax
   1403745c9:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403745cc:	f3 0f 59 c1          	mulss  xmm0,xmm1
   1403745d0:	f3 0f 58 d0          	addss  xmm2,xmm0
   1403745d4:	45 3a ca             	cmp    r9b,r10b
   1403745d7:	72 b7                	jb     0x140374590
   1403745d9:	49 ff c3             	inc    r11
   1403745dc:	48 83 c7 08          	add    rdi,0x8
   1403745e0:	49 83 ef 01          	sub    r15,0x1
   1403745e4:	75 8a                	jne    0x140374570
   1403745e6:	41 0f 2e d9          	ucomiss xmm3,xmm9
   1403745ea:	7a 02                	jp     0x1403745ee
   1403745ec:	74 04                	je     0x1403745f2
   1403745ee:	f3 0f 5e d3          	divss  xmm2,xmm3
   1403745f2:	41 0f 2f d1          	comiss xmm2,xmm9
   1403745f6:	73 0f                	jae    0x140374607
   1403745f8:	f3 41 0f 5c d6       	subss  xmm2,xmm14
   1403745fd:	f3 0f 5f 15 bb 9b 31 	maxss  xmm2,DWORD PTR [rip+0x319bbb]        # 0x14068e1c0
   140374604:	00 
   140374605:	eb 0d                	jmp    0x140374614
   140374607:	f3 41 0f 58 d6       	addss  xmm2,xmm14
   14037460c:	f3 0f 5d 15 9c 9b 31 	minss  xmm2,DWORD PTR [rip+0x319b9c]        # 0x14068e1b0
   140374613:	00 
   140374614:	48 8d 8c 24 40 01 00 	lea    rcx,[rsp+0x140]
   14037461b:	00 
   14037461c:	f3 44 0f 11 a4 24 40 	movss  DWORD PTR [rsp+0x140],xmm12
   140374623:	01 00 00 
   140374626:	f3 0f 2c fa          	cvttss2si edi,xmm2
   14037462a:	45 0f 28 c3          	movaps xmm8,xmm11
   14037462e:	41 0f 28 fc          	movaps xmm7,xmm12
   140374632:	ff 15 50 55 31 00    	call   QWORD PTR [rip+0x315550]        # 0x140689b88
   140374638:	66 85 c0             	test   ax,ax
   14037463b:	7e 04                	jle    0x140374641
   14037463d:	41 0f 28 f9          	movaps xmm7,xmm9
   140374641:	48 8d 8c 24 40 01 00 	lea    rcx,[rsp+0x140]
   140374648:	00 
   140374649:	f3 44 0f 11 9c 24 40 	movss  DWORD PTR [rsp+0x140],xmm11
   140374650:	01 00 00 
   140374653:	ff 15 2f 55 31 00    	call   QWORD PTR [rip+0x31552f]        # 0x140689b88
   140374659:	66 85 c0             	test   ax,ax
   14037465c:	7e 04                	jle    0x140374662
   14037465e:	45 0f 28 c1          	movaps xmm8,xmm9
   140374662:	41 0f 28 ca          	movaps xmm1,xmm10
   140374666:	0f 28 c7             	movaps xmm0,xmm7
   140374669:	e8 00 c7 2a 00       	call   0x140620d6e
   14037466e:	0f 28 f8             	movaps xmm7,xmm0
   140374671:	44 0f 2f cf          	comiss xmm9,xmm7
   140374675:	76 05                	jbe    0x14037467c
   140374677:	f3 41 0f 58 fa       	addss  xmm7,xmm10
   14037467c:	41 0f 28 ca          	movaps xmm1,xmm10
   140374680:	41 0f 28 c0          	movaps xmm0,xmm8
   140374684:	e8 e5 c6 2a 00       	call   0x140620d6e
   140374689:	44 0f 2f c8          	comiss xmm9,xmm0
   14037468d:	76 05                	jbe    0x140374694
   14037468f:	f3 41 0f 58 c2       	addss  xmm0,xmm10
   140374694:	f3 0f 59 05 34 bc 4d 	mulss  xmm0,DWORD PTR [rip+0x4dbc34]        # 0x1408502d0
   14037469b:	00 
   14037469c:	be 90 0a 00 00       	mov    esi,0xa90
   1403746a1:	44 0f b6 8c 24 38 01 	movzx  r9d,BYTE PTR [rsp+0x138]
   1403746a8:	00 00 
   1403746aa:	f3 0f 59 3d 1e bc 4d 	mulss  xmm7,DWORD PTR [rip+0x4dbc1e]        # 0x1408502d0
   1403746b1:	00 
   1403746b2:	4c 8b 94 24 28 01 00 	mov    r10,QWORD PTR [rsp+0x128]
   1403746b9:	00 
   1403746ba:	4c 8b 5c 24 28       	mov    r11,QWORD PTR [rsp+0x28]
   1403746bf:	f3 41 0f 58 c6       	addss  xmm0,xmm14
   1403746c4:	f3 41 0f 58 fe       	addss  xmm7,xmm14
   1403746c9:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0
   1403746ce:	f3 48 0f 2c d7       	cvttss2si rdx,xmm7
   1403746d3:	81 f9 70 f5 00 00    	cmp    ecx,0xf570
   1403746d9:	8d 04 0e             	lea    eax,[rsi+rcx*1]
   1403746dc:	66 0f 42 c1          	cmovb  ax,cx
   1403746e0:	44 0f b7 c0          	movzx  r8d,ax
   1403746e4:	41 c1 e0 10          	shl    r8d,0x10
   1403746e8:	81 fa 70 f5 00 00    	cmp    edx,0xf570
   1403746ee:	8d 04 16             	lea    eax,[rsi+rdx*1]
   1403746f1:	66 0f 42 c2          	cmovb  ax,dx
   1403746f5:	41 0f b6 d1          	movzx  edx,r9b
   1403746f9:	0f b7 c0             	movzx  eax,ax
   1403746fc:	44 0b c0             	or     r8d,eax
   1403746ff:	47 3a 4c 1a 61       	cmp    r9b,BYTE PTR [r10+r11*1+0x61]
   140374704:	73 35                	jae    0x14037473b
   140374706:	44 8b 8c 24 30 01 00 	mov    r9d,DWORD PTR [rsp+0x130]
   14037470d:	00 
   14037470e:	66 90                	xchg   ax,ax
   140374710:	49 8b 45 10          	mov    rax,QWORD PTR [r13+0x10]
   140374714:	0f b6 ca             	movzx  ecx,dl
   140374717:	fe c2                	inc    dl
   140374719:	41 0f af c9          	imul   ecx,r9d
   14037471d:	03 cb                	add    ecx,ebx
   14037471f:	f3 0f 11 34 88       	movss  DWORD PTR [rax+rcx*4],xmm6
   140374724:	49 8b 45 18          	mov    rax,QWORD PTR [r13+0x18]
   140374728:	66 89 3c 48          	mov    WORD PTR [rax+rcx*2],di
   14037472c:	49 8b 45 08          	mov    rax,QWORD PTR [r13+0x8]
   140374730:	44 89 04 88          	mov    DWORD PTR [rax+rcx*4],r8d
   140374734:	43 3a 54 13 61       	cmp    dl,BYTE PTR [r11+r10*1+0x61]
   140374739:	72 d5                	jb     0x140374710
   14037473b:	f3 0f 59 b4 24 20 01 	mulss  xmm6,DWORD PTR [rsp+0x120]
   140374742:	00 00 
   140374744:	49 8d 8c 24 98 00 00 	lea    rcx,[r12+0x98]
   14037474b:	00 
   14037474c:	ff c3                	inc    ebx
   14037474e:	8b d3                	mov    edx,ebx
   140374750:	f3 44 0f 58 e6       	addss  xmm12,xmm6
   140374755:	f3 44 0f 58 de       	addss  xmm11,xmm6
   14037475a:	3b 9c 24 30 01 00 00 	cmp    ebx,DWORD PTR [rsp+0x130]
   140374761:	0f 82 79 fd ff ff    	jb     0x1403744e0
   140374767:	44 0f 28 7c 24 30    	movaps xmm15,XMMWORD PTR [rsp+0x30]
   14037476d:	44 0f 28 74 24 40    	movaps xmm14,XMMWORD PTR [rsp+0x40]
   140374773:	44 0f 28 6c 24 50    	movaps xmm13,XMMWORD PTR [rsp+0x50]
   140374779:	44 0f 28 64 24 60    	movaps xmm12,XMMWORD PTR [rsp+0x60]
   14037477f:	44 0f 28 5c 24 70    	movaps xmm11,XMMWORD PTR [rsp+0x70]
   140374785:	44 0f 28 94 24 80 00 	movaps xmm10,XMMWORD PTR [rsp+0x80]
   14037478c:	00 00 
   14037478e:	44 0f 28 8c 24 90 00 	movaps xmm9,XMMWORD PTR [rsp+0x90]
   140374795:	00 00 
   140374797:	44 0f 28 84 24 a0 00 	movaps xmm8,XMMWORD PTR [rsp+0xa0]
   14037479e:	00 00 
   1403747a0:	0f 28 bc 24 b0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xb0]
   1403747a7:	00 
   1403747a8:	0f 28 b4 24 c0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xc0]
   1403747af:	00 
   1403747b0:	4c 8b bc 24 d8 00 00 	mov    r15,QWORD PTR [rsp+0xd8]
   1403747b7:	00 
   1403747b8:	48 8b bc 24 e0 00 00 	mov    rdi,QWORD PTR [rsp+0xe0]
   1403747bf:	00 
   1403747c0:	48 8b b4 24 e8 00 00 	mov    rsi,QWORD PTR [rsp+0xe8]
   1403747c7:	00 
   1403747c8:	48 8b ac 24 f0 00 00 	mov    rbp,QWORD PTR [rsp+0xf0]
   1403747cf:	00 
   1403747d0:	48 81 c4 f8 00 00 00 	add    rsp,0xf8
   1403747d7:	41 5e                	pop    r14
   1403747d9:	41 5d                	pop    r13
   1403747db:	41 5c                	pop    r12
   1403747dd:	5b                   	pop    rbx
   1403747de:	c3                   	ret
   1403747df:	cc                   	int3
   1403747e0:	cc                   	int3
   1403747e1:	cc                   	int3
   1403747e2:	cc                   	int3
   1403747e3:	cc                   	int3
   1403747e4:	cc                   	int3
   1403747e5:	cc                   	int3
   1403747e6:	cc                   	int3
   1403747e7:	cc                   	int3
   1403747e8:	cc                   	int3
   1403747e9:	cc                   	int3
   1403747ea:	cc                   	int3
   1403747eb:	cc                   	int3
   1403747ec:	cc                   	int3
   1403747ed:	cc                   	int3
   1403747ee:	cc                   	int3
   1403747ef:	cc                   	int3
