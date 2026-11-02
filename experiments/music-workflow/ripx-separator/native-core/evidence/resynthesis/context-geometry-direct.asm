
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140317800 <.text+0x316800>:
   140317800:	14 d5                	adc    al,0xd5
   140317802:	00 00                	add    BYTE PTR [rax],al
   140317804:	00 00                	add    BYTE PTR [rax],al
   140317806:	eb 12                	jmp    0x14031781a
   140317808:	48 b8 ff ff ff ff ff 	movabs rax,0xfffffffffffffff
   14031780f:	ff ff 0f 
   140317812:	48 3b d0             	cmp    rdx,rax
   140317815:	73 03                	jae    0x14031781a
   140317817:	48 03 d2             	add    rdx,rdx
   14031781a:	48 8b ce             	mov    rcx,rsi
   14031781d:	e8 ae 90 f8 ff       	call   0x1402a08d0
   140317822:	48 8b ce             	mov    rcx,rsi
   140317825:	e8 16 01 00 00       	call   0x140317940
   14031782a:	90                   	nop
   14031782b:	49 89 3e             	mov    QWORD PTR [r14],rdi
   14031782e:	41 c6 46 08 01       	mov    BYTE PTR [r14+0x8],0x1
   140317833:	49 8b c6             	mov    rax,r14
   140317836:	48 8b 5c 24 58       	mov    rbx,QWORD PTR [rsp+0x58]
   14031783b:	48 83 c4 30          	add    rsp,0x30
   14031783f:	41 5e                	pop    r14
   140317841:	5f                   	pop    rdi
   140317842:	5e                   	pop    rsi
   140317843:	c3                   	ret
   140317844:	cc                   	int3
   140317845:	cc                   	int3
   140317846:	cc                   	int3
   140317847:	cc                   	int3
   140317848:	cc                   	int3
   140317849:	cc                   	int3
   14031784a:	cc                   	int3
   14031784b:	cc                   	int3
   14031784c:	cc                   	int3
   14031784d:	cc                   	int3
   14031784e:	cc                   	int3
   14031784f:	cc                   	int3
   140317850:	40 53                	rex push rbx
   140317852:	48 83 ec 20          	sub    rsp,0x20
   140317856:	48 8b d9             	mov    rbx,rcx
   140317859:	48 8b 49 18          	mov    rcx,QWORD PTR [rcx+0x18]
   14031785d:	48 85 c9             	test   rcx,rcx
   140317860:	74 3f                	je     0x1403178a1
   140317862:	48 8b 53 28          	mov    rdx,QWORD PTR [rbx+0x28]
   140317866:	48 2b d1             	sub    rdx,rcx
   140317869:	48 83 e2 f8          	and    rdx,0xfffffffffffffff8
   14031786d:	48 81 fa 00 10 00 00 	cmp    rdx,0x1000
   140317874:	72 18                	jb     0x14031788e
   140317876:	4c 8b 41 f8          	mov    r8,QWORD PTR [rcx-0x8]
   14031787a:	48 83 c2 27          	add    rdx,0x27
   14031787e:	49 2b c8             	sub    rcx,r8
   140317881:	48 8d 41 f8          	lea    rax,[rcx-0x8]
   140317885:	48 83 f8 1f          	cmp    rax,0x1f
   140317889:	77 24                	ja     0x1403178af
   14031788b:	49 8b c8             	mov    rcx,r8
   14031788e:	e8 c5 3c 30 00       	call   0x14061b558
   140317893:	33 c0                	xor    eax,eax
   140317895:	48 89 43 18          	mov    QWORD PTR [rbx+0x18],rax
   140317899:	48 89 43 20          	mov    QWORD PTR [rbx+0x20],rax
   14031789d:	48 89 43 28          	mov    QWORD PTR [rbx+0x28],rax
   1403178a1:	48 8d 4b 08          	lea    rcx,[rbx+0x8]
   1403178a5:	48 83 c4 20          	add    rsp,0x20
   1403178a9:	5b                   	pop    rbx
   1403178aa:	e9 11 d4 fc ff       	jmp    0x1402e4cc0
   1403178af:	ff 15 33 23 37 00    	call   QWORD PTR [rip+0x372333]        # 0x140689be8
   1403178b5:	cc                   	int3
   1403178b6:	cc                   	int3
   1403178b7:	cc                   	int3
   1403178b8:	cc                   	int3
   1403178b9:	cc                   	int3
   1403178ba:	cc                   	int3
   1403178bb:	cc                   	int3
   1403178bc:	cc                   	int3
   1403178bd:	cc                   	int3
   1403178be:	cc                   	int3
   1403178bf:	cc                   	int3
   1403178c0:	e9 8b ff ff ff       	jmp    0x140317850
   1403178c5:	cc                   	int3
   1403178c6:	cc                   	int3
   1403178c7:	cc                   	int3
   1403178c8:	cc                   	int3
   1403178c9:	cc                   	int3
   1403178ca:	cc                   	int3
   1403178cb:	cc                   	int3
   1403178cc:	cc                   	int3
   1403178cd:	cc                   	int3
   1403178ce:	cc                   	int3
   1403178cf:	cc                   	int3
   1403178d0:	83 79 24 00          	cmp    DWORD PTR [rcx+0x24],0x0
   1403178d4:	8b 05 d6 28 67 00    	mov    eax,DWORD PTR [rip+0x6728d6]        # 0x14098a1b0
   1403178da:	74 04                	je     0x1403178e0
   1403178dc:	0f bf 41 20          	movsx  eax,WORD PTR [rcx+0x20]
   1403178e0:	c3                   	ret
   1403178e1:	cc                   	int3
   1403178e2:	cc                   	int3
   1403178e3:	cc                   	int3
   1403178e4:	cc                   	int3
   1403178e5:	cc                   	int3
   1403178e6:	cc                   	int3
   1403178e7:	cc                   	int3
   1403178e8:	cc                   	int3
   1403178e9:	cc                   	int3
   1403178ea:	cc                   	int3
   1403178eb:	cc                   	int3
   1403178ec:	cc                   	int3
   1403178ed:	cc                   	int3
   1403178ee:	cc                   	int3
   1403178ef:	cc                   	int3
   1403178f0:	44 8b 42 4c          	mov    r8d,DWORD PTR [rdx+0x4c]
   1403178f4:	45 85 c0             	test   r8d,r8d
   1403178f7:	74 2f                	je     0x140317928
   1403178f9:	48 83 7a 50 00       	cmp    QWORD PTR [rdx+0x50],0x0
   1403178fe:	75 2f                	jne    0x14031792f
   140317900:	48 8b 81 e8 46 06 00 	mov    rax,QWORD PTR [rcx+0x646e8]
   140317907:	48 85 c0             	test   rax,rax
   14031790a:	74 15                	je     0x140317921
   14031790c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140317910:	44 39 00             	cmp    DWORD PTR [rax],r8d
   140317913:	74 16                	je     0x14031792b
   140317915:	48 8b 80 48 01 00 00 	mov    rax,QWORD PTR [rax+0x148]
   14031791c:	48 85 c0             	test   rax,rax
   14031791f:	75 ef                	jne    0x140317910
   140317921:	c7 42 4c 00 00 00 00 	mov    DWORD PTR [rdx+0x4c],0x0
   140317928:	32 c0                	xor    al,al
   14031792a:	c3                   	ret
   14031792b:	48 89 42 50          	mov    QWORD PTR [rdx+0x50],rax
   14031792f:	b0 01                	mov    al,0x1
   140317931:	c3                   	ret
   140317932:	cc                   	int3
   140317933:	cc                   	int3
   140317934:	cc                   	int3
   140317935:	cc                   	int3
   140317936:	cc                   	int3
   140317937:	cc                   	int3
   140317938:	cc                   	int3
   140317939:	cc                   	int3
   14031793a:	cc                   	int3
   14031793b:	cc                   	int3
   14031793c:	cc                   	int3
   14031793d:	cc                   	int3
   14031793e:	cc                   	int3
   14031793f:	cc                   	int3
   140317940:	40 56                	rex push rsi
   140317942:	48 83 ec 30          	sub    rsp,0x30
   140317946:	48 8b 41 08          	mov    rax,QWORD PTR [rcx+0x8]
   14031794a:	48 8b f1             	mov    rsi,rcx
   14031794d:	48 39 00             	cmp    QWORD PTR [rax],rax
   140317950:	74 38                	je     0x14031798a
   140317952:	48 89 5c 24 40       	mov    QWORD PTR [rsp+0x40],rbx
   140317957:	48 89 7c 24 48       	mov    QWORD PTR [rsp+0x48],rdi
   14031795c:	48 8b 78 08          	mov    rdi,QWORD PTR [rax+0x8]
   140317960:	48 8b 5e 08          	mov    rbx,QWORD PTR [rsi+0x8]
   140317964:	48 8d 54 24 20       	lea    rdx,[rsp+0x20]
   140317969:	48 8b ce             	mov    rcx,rsi
   14031796c:	48 8b 1b             	mov    rbx,QWORD PTR [rbx]
   14031796f:	4c 8b cb             	mov    r9,rbx
   140317972:	4c 8d 43 10          	lea    r8,[rbx+0x10]
   140317976:	e8 f5 fc ff ff       	call   0x140317670
   14031797b:	48 3b df             	cmp    rbx,rdi
   14031797e:	75 e0                	jne    0x140317960
   140317980:	48 8b 7c 24 48       	mov    rdi,QWORD PTR [rsp+0x48]
   140317985:	48 8b 5c 24 40       	mov    rbx,QWORD PTR [rsp+0x40]
   14031798a:	48 83 c4 30          	add    rsp,0x30
   14031798e:	5e                   	pop    rsi
   14031798f:	c3                   	ret
   140317990:	48 8b c4             	mov    rax,rsp
   140317993:	53                   	push   rbx
   140317994:	41 56                	push   r14
   140317996:	41 57                	push   r15
   140317998:	48 81 ec a0 00 00 00 	sub    rsp,0xa0
   14031799f:	48 8b 5a 30          	mov    rbx,QWORD PTR [rdx+0x30]
   1403179a3:	4c 8b f2             	mov    r14,rdx
   1403179a6:	4c 8b f9             	mov    r15,rcx
   1403179a9:	48 85 db             	test   rbx,rbx
   1403179ac:	0f 84 41 02 00 00    	je     0x140317bf3
   1403179b2:	44 8b 1b             	mov    r11d,DWORD PTR [rbx]
   1403179b5:	41 b9 01 00 00 00    	mov    r9d,0x1
   1403179bb:	f3 0f 10 05 e9 27 67 	movss  xmm0,DWORD PTR [rip+0x6727e9]        # 0x14098a1ac
   1403179c2:	00 
   1403179c3:	45 8b c1             	mov    r8d,r9d
   1403179c6:	f3 0f 59 05 da 85 53 	mulss  xmm0,DWORD PTR [rip+0x5385da]        # 0x14084ffa8
   1403179cd:	00 
   1403179ce:	44 8b 53 04          	mov    r10d,DWORD PTR [rbx+0x4]
   1403179d2:	48 89 68 08          	mov    QWORD PTR [rax+0x8],rbp
   1403179d6:	45 2b d3             	sub    r10d,r11d
   1403179d9:	48 89 70 10          	mov    QWORD PTR [rax+0x10],rsi
   1403179dd:	f3 0f 58 05 f7 85 53 	addss  xmm0,DWORD PTR [rip+0x5385f7]        # 0x14084ffdc
   1403179e4:	00 
   1403179e5:	48 89 78 18          	mov    QWORD PTR [rax+0x18],rdi
   1403179e9:	4c 89 60 20          	mov    QWORD PTR [rax+0x20],r12
   1403179ed:	0f 29 78 c8          	movaps XMMWORD PTR [rax-0x38],xmm7
   1403179f1:	0f 57 ff             	xorps  xmm7,xmm7
   1403179f4:	44 0f 29 40 b8       	movaps XMMWORD PTR [rax-0x48],xmm8
   1403179f9:	44 0f 29 48 a8       	movaps XMMWORD PTR [rax-0x58],xmm9
   1403179fe:	44 0f 29 50 98       	movaps XMMWORD PTR [rax-0x68],xmm10
   140317a03:	44 0f 29 58 88       	movaps XMMWORD PTR [rax-0x78],xmm11
   140317a08:	41 8b c2             	mov    eax,r10d
   140317a0b:	f3 0f 2c c8          	cvttss2si ecx,xmm0
   140317a0f:	99                   	cdq
   140317a10:	44 0f 29 64 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm12
   140317a16:	45 0f 57 e4          	xorps  xmm12,xmm12
   140317a1a:	41 3b c9             	cmp    ecx,r9d
   140317a1d:	44 0f 4f c1          	cmovg  r8d,ecx
   140317a21:	2b c2                	sub    eax,edx
   140317a23:	d1 f8                	sar    eax,1
   140317a25:	44 3b c0             	cmp    r8d,eax
   140317a28:	44 0f 4d c0          	cmovge r8d,eax
   140317a2c:	41 3b c9             	cmp    ecx,r9d
   140317a2f:	44 0f 4f c9          	cmovg  r9d,ecx
   140317a33:	45 2b d0             	sub    r10d,r8d
   140317a36:	45 3b ca             	cmp    r9d,r10d
   140317a39:	43 8d 3c 03          	lea    edi,[r11+r8*1]
   140317a3d:	45 0f 4d ca          	cmovge r9d,r10d
   140317a41:	45 33 e4             	xor    r12d,r12d
   140317a44:	43 8d 34 01          	lea    esi,[r9+r8*1]
   140317a48:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140317a4f:	00 
   140317a50:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   140317a53:	8b 13                	mov    edx,DWORD PTR [rbx]
   140317a55:	8d 04 16             	lea    eax,[rsi+rdx*1]
   140317a58:	3b c1                	cmp    eax,ecx
   140317a5a:	0f 4d c1             	cmovge eax,ecx
   140317a5d:	3b f8                	cmp    edi,eax
   140317a5f:	7d 26                	jge    0x140317a87
   140317a61:	45 33 c9             	xor    r9d,r9d
   140317a64:	4c 89 64 24 28       	mov    QWORD PTR [rsp+0x28],r12
   140317a69:	8b d7                	mov    edx,edi
   140317a6b:	44 89 64 24 20       	mov    DWORD PTR [rsp+0x20],r12d
   140317a70:	48 8b cb             	mov    rcx,rbx
   140317a73:	45 8d 41 ff          	lea    r8d,[r9-0x1]
   140317a77:	e8 74 2d 05 00       	call   0x14036a7f0
   140317a7c:	f3 0f 5f c7          	maxss  xmm0,xmm7
   140317a80:	ff c7                	inc    edi
   140317a82:	0f 28 f8             	movaps xmm7,xmm0
   140317a85:	eb c9                	jmp    0x140317a50
   140317a87:	3b ca                	cmp    ecx,edx
   140317a89:	7e 22                	jle    0x140317aad
   140317a8b:	8b c2                	mov    eax,edx
   140317a8d:	66 44 39 a3 1c 02 00 	cmp    WORD PTR [rbx+0x21c],r12w
   140317a94:	00 
   140317a95:	7c 07                	jl     0x140317a9e
   140317a97:	3b d1                	cmp    edx,ecx
   140317a99:	7c 03                	jl     0x140317a9e
   140317a9b:	8d 41 ff             	lea    eax,[rcx-0x1]
   140317a9e:	2b c2                	sub    eax,edx
   140317aa0:	8b c8                	mov    ecx,eax
   140317aa2:	48 8b 43 08          	mov    rax,QWORD PTR [rbx+0x8]
   140317aa6:	f3 0f 10 14 88       	movss  xmm2,DWORD PTR [rax+rcx*4]
   140317aab:	eb 04                	jmp    0x140317ab1
   140317aad:	41 0f 28 d4          	movaps xmm2,xmm12
   140317ab1:	b2 01                	mov    dl,0x1
   140317ab3:	49 8b cf             	mov    rcx,r15
   140317ab6:	e8 65 0d 00 00       	call   0x140318820
   140317abb:	8b 7b 04             	mov    edi,DWORD PTR [rbx+0x4]
   140317abe:	8b e8                	mov    ebp,eax
   140317ac0:	f3 44 0f 10 05 7f f7 	movss  xmm8,DWORD PTR [rip+0x37f77f]        # 0x140697248
   140317ac7:	37 00 
   140317ac9:	f2 44 0f 10 15 ae 66 	movsd  xmm10,QWORD PTR [rip+0x3766ae]        # 0x14068e180
   140317ad0:	37 00 
   140317ad2:	f2 44 0f 10 1d 6d 66 	movsd  xmm11,QWORD PTR [rip+0x37666d]        # 0x14068e148
   140317ad9:	37 00 
   140317adb:	f3 44 0f 10 0d 94 66 	movss  xmm9,DWORD PTR [rip+0x376694]        # 0x14068e178
   140317ae2:	37 00 
   140317ae4:	0f 29 b4 24 90 00 00 	movaps XMMWORD PTR [rsp+0x90],xmm6
   140317aeb:	00 
   140317aec:	ff cf                	dec    edi
   140317aee:	8b cd                	mov    ecx,ebp
   140317af0:	3b ee                	cmp    ebp,esi
   140317af2:	0f 4c ce             	cmovl  ecx,esi
   140317af5:	03 0b                	add    ecx,DWORD PTR [rbx]
   140317af7:	3b f9                	cmp    edi,ecx
   140317af9:	7c 53                	jl     0x140317b4e
   140317afb:	45 33 c9             	xor    r9d,r9d
   140317afe:	4c 89 64 24 28       	mov    QWORD PTR [rsp+0x28],r12
   140317b03:	8b d7                	mov    edx,edi
   140317b05:	44 89 64 24 20       	mov    DWORD PTR [rsp+0x20],r12d
   140317b0a:	48 8b cb             	mov    rcx,rbx
   140317b0d:	45 8d 41 ff          	lea    r8d,[r9-0x1]
   140317b11:	e8 da 2c 05 00       	call   0x14036a7f0
   140317b16:	44 0f 2f e0          	comiss xmm12,xmm0
   140317b1a:	72 06                	jb     0x140317b22
   140317b1c:	41 0f 28 f0          	movaps xmm6,xmm8
   140317b20:	eb 1a                	jmp    0x140317b3c
   140317b22:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140317b26:	f2 41 0f 5e c2       	divsd  xmm0,xmm10
   140317b2b:	e8 44 92 30 00       	call   0x140620d74
   140317b30:	f2 41 0f 59 c3       	mulsd  xmm0,xmm11
   140317b35:	0f 57 f6             	xorps  xmm6,xmm6
   140317b38:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   140317b3c:	0f 28 c7             	movaps xmm0,xmm7
   140317b3f:	e8 5c 03 00 00       	call   0x140317ea0
   140317b44:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   140317b49:	0f 2f f0             	comiss xmm6,xmm0
   140317b4c:	72 9e                	jb     0x140317aec
   140317b4e:	44 8b 43 04          	mov    r8d,DWORD PTR [rbx+0x4]
   140317b52:	8d 77 01             	lea    esi,[rdi+0x1]
   140317b55:	44 0f 28 64 24 30    	movaps xmm12,XMMWORD PTR [rsp+0x30]
   140317b5b:	44 0f 28 5c 24 40    	movaps xmm11,XMMWORD PTR [rsp+0x40]
   140317b61:	44 0f 28 54 24 50    	movaps xmm10,XMMWORD PTR [rsp+0x50]
   140317b67:	44 0f 28 4c 24 60    	movaps xmm9,XMMWORD PTR [rsp+0x60]
   140317b6d:	44 0f 28 44 24 70    	movaps xmm8,XMMWORD PTR [rsp+0x70]
   140317b73:	0f 28 bc 24 80 00 00 	movaps xmm7,XMMWORD PTR [rsp+0x80]
   140317b7a:	00 
   140317b7b:	0f 28 b4 24 90 00 00 	movaps xmm6,XMMWORD PTR [rsp+0x90]
   140317b82:	00 
   140317b83:	4c 8b a4 24 d8 00 00 	mov    r12,QWORD PTR [rsp+0xd8]
   140317b8a:	00 
   140317b8b:	48 8b ac 24 c0 00 00 	mov    rbp,QWORD PTR [rsp+0xc0]
   140317b92:	00 
   140317b93:	41 3b f0             	cmp    esi,r8d
   140317b96:	7d 4b                	jge    0x140317be3
   140317b98:	44 2b c7             	sub    r8d,edi
   140317b9b:	8b d6                	mov    edx,esi
   140317b9d:	41 ff c8             	dec    r8d
   140317ba0:	48 8b cb             	mov    rcx,rbx
   140317ba3:	e8 c8 50 05 00       	call   0x14036cc70
   140317ba8:	41 8b 07             	mov    eax,DWORD PTR [r15]
   140317bab:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140317bb2:	66 0f 6e c6          	movd   xmm0,esi
   140317bb6:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140317bb9:	48 8d 05 60 bb 6a 00 	lea    rax,[rip+0x6abb60]        # 0x1409c3720
   140317bc0:	f3 0f 59 04 01       	mulss  xmm0,DWORD PTR [rcx+rax*1]
   140317bc5:	f3 41 0f 58 46 08    	addss  xmm0,DWORD PTR [r14+0x8]
   140317bcb:	f3 41 0f 11 46 1c    	movss  DWORD PTR [r14+0x1c],xmm0
   140317bd1:	f3 41 0f 11 46 04    	movss  DWORD PTR [r14+0x4],xmm0
   140317bd7:	f3 41 0f 11 46 14    	movss  DWORD PTR [r14+0x14],xmm0
   140317bdd:	f3 41 0f 11 46 0c    	movss  DWORD PTR [r14+0xc],xmm0
   140317be3:	48 8b b4 24 c8 00 00 	mov    rsi,QWORD PTR [rsp+0xc8]
   140317bea:	00 
   140317beb:	48 8b bc 24 d0 00 00 	mov    rdi,QWORD PTR [rsp+0xd0]
   140317bf2:	00 
   140317bf3:	48 81 c4 a0 00 00 00 	add    rsp,0xa0
   140317bfa:	41 5f                	pop    r15
   140317bfc:	41 5e                	pop    r14
   140317bfe:	5b                   	pop    rbx
   140317bff:	c3                   	ret
   140317c00:	cc                   	int3
   140317c01:	cc                   	int3
   140317c02:	cc                   	int3
   140317c03:	cc                   	int3
   140317c04:	cc                   	int3
   140317c05:	cc                   	int3
   140317c06:	cc                   	int3
   140317c07:	cc                   	int3
   140317c08:	cc                   	int3
   140317c09:	cc                   	int3
   140317c0a:	cc                   	int3
   140317c0b:	cc                   	int3
   140317c0c:	cc                   	int3
   140317c0d:	cc                   	int3
   140317c0e:	cc                   	int3
   140317c0f:	cc                   	int3
   140317c10:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   140317c15:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   140317c1a:	56                   	push   rsi
   140317c1b:	48 83 ec 20          	sub    rsp,0x20
   140317c1f:	48 8b f1             	mov    rsi,rcx
   140317c22:	ba ff ff ff ff       	mov    edx,0xffffffff
   140317c27:	48 8b 0d 1a 79 4b 17 	mov    rcx,QWORD PTR [rip+0x174b791a]        # 0x1577cf548
   140317c2e:	ff 15 1c 0a 37 00    	call   QWORD PTR [rip+0x370a1c]        # 0x140688650
   140317c34:	e8 d7 33 f5 ff       	call   0x14026b010
   140317c39:	44 8b 06             	mov    r8d,DWORD PTR [rsi]
   140317c3c:	48 8d 2d 8d 29 67 00 	lea    rbp,[rip+0x67298d]        # 0x14098a5d0
   140317c43:	49 69 c0 78 ab 06 00 	imul   rax,r8,0x6ab78
   140317c4a:	33 db                	xor    ebx,ebx
   140317c4c:	39 5c 28 08          	cmp    DWORD PTR [rax+rbp*1+0x8],ebx
   140317c50:	7e 6b                	jle    0x140317cbd
   140317c52:	48 89 7c 24 30       	mov    QWORD PTR [rsp+0x30],rdi
   140317c57:	8b fb                	mov    edi,ebx
   140317c59:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140317c60:	41 8b c0             	mov    eax,r8d
   140317c63:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140317c6a:	4c 8b 04 29          	mov    r8,QWORD PTR [rcx+rbp*1]
   140317c6e:	4a 8b 44 07 30       	mov    rax,QWORD PTR [rdi+r8*1+0x30]
   140317c73:	48 85 c0             	test   rax,rax
   140317c76:	74 0f                	je     0x140317c87
   140317c78:	0f b7 80 1c 02 00 00 	movzx  eax,WORD PTR [rax+0x21c]
   140317c7f:	66 c1 e8 0f          	shr    ax,0xf
   140317c83:	84 c0                	test   al,al
   140317c85:	75 16                	jne    0x140317c9d
   140317c87:	48 63 c3             	movsxd rax,ebx
   140317c8a:	48 8b ce             	mov    rcx,rsi
   140317c8d:	48 8d 14 c0          	lea    rdx,[rax+rax*8]
   140317c91:	48 c1 e2 04          	shl    rdx,0x4
   140317c95:	49 03 d0             	add    rdx,r8
   140317c98:	e8 f3 fc ff ff       	call   0x140317990
   140317c9d:	8b 06                	mov    eax,DWORD PTR [rsi]
   140317c9f:	ff c3                	inc    ebx
   140317ca1:	48 69 d0 78 ab 06 00 	imul   rdx,rax,0x6ab78
   140317ca8:	48 81 c7 90 00 00 00 	add    rdi,0x90
   140317caf:	44 8b c0             	mov    r8d,eax
   140317cb2:	3b 5c 2a 08          	cmp    ebx,DWORD PTR [rdx+rbp*1+0x8]
   140317cb6:	7c a8                	jl     0x140317c60
   140317cb8:	48 8b 7c 24 30       	mov    rdi,QWORD PTR [rsp+0x30]
   140317cbd:	e8 8e 33 f5 ff       	call   0x14026b050
   140317cc2:	48 8b 0d 7f 78 4b 17 	mov    rcx,QWORD PTR [rip+0x174b787f]        # 0x1577cf548
   140317cc9:	ff 15 79 09 37 00    	call   QWORD PTR [rip+0x370979]        # 0x140688648
   140317ccf:	33 d2                	xor    edx,edx
   140317cd1:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   140317cd6:	48 8b 5c 24 38       	mov    rbx,QWORD PTR [rsp+0x38]
   140317cdb:	48 8b 6c 24 40       	mov    rbp,QWORD PTR [rsp+0x40]
   140317ce0:	48 83 c4 20          	add    rsp,0x20
   140317ce4:	5e                   	pop    rsi
   140317ce5:	e9 46 9f 17 00       	jmp    0x140491c30
   140317cea:	cc                   	int3
   140317ceb:	cc                   	int3
   140317cec:	cc                   	int3
   140317ced:	cc                   	int3
   140317cee:	cc                   	int3
   140317cef:	cc                   	int3
   140317cf0:	40 53                	rex push rbx
   140317cf2:	57                   	push   rdi
   140317cf3:	41 57                	push   r15
   140317cf5:	48 83 ec 30          	sub    rsp,0x30
   140317cf9:	48 89 74 24 58       	mov    QWORD PTR [rsp+0x58],rsi
   140317cfe:	8b da                	mov    ebx,edx
   140317d00:	48 8b f9             	mov    rdi,rcx
   140317d03:	e8 08 33 f5 ff       	call   0x14026b010
   140317d08:	48 8b 0d 39 78 4b 17 	mov    rcx,QWORD PTR [rip+0x174b7839]        # 0x1577cf548
   140317d0f:	ba ff ff ff ff       	mov    edx,0xffffffff
   140317d14:	ff 15 36 09 37 00    	call   QWORD PTR [rip+0x370936]        # 0x140688650
   140317d1a:	8b 0f                	mov    ecx,DWORD PTR [rdi]
   140317d1c:	e8 3f b5 f4 ff       	call   0x140263260
   140317d21:	48 83 3d cf 22 67 00 	cmp    QWORD PTR [rip+0x6722cf],0x0        # 0x140989ff8
   140317d28:	00 
   140317d29:	48 8b cf             	mov    rcx,rdi
   140317d2c:	74 07                	je     0x140317d35
   140317d2e:	e8 8d f7 05 00       	call   0x1403774c0
   140317d33:	eb 0a                	jmp    0x140317d3f
   140317d35:	45 33 c0             	xor    r8d,r8d
   140317d38:	8b d3                	mov    edx,ebx
   140317d3a:	e8 91 d3 05 00       	call   0x1403750d0
   140317d3f:	45 33 c0             	xor    r8d,r8d
   140317d42:	8b d3                	mov    edx,ebx
   140317d44:	48 8b cf             	mov    rcx,rdi
   140317d47:	e8 b4 b1 05 00       	call   0x140372f00
   140317d4c:	8b 17                	mov    edx,DWORD PTR [rdi]
   140317d4e:	8b cb                	mov    ecx,ebx
   140317d50:	e8 0b 69 05 00       	call   0x14036e660
   140317d55:	8b 17                	mov    edx,DWORD PTR [rdi]
   140317d57:	4c 8d 3d 72 28 67 00 	lea    r15,[rip+0x672872]        # 0x14098a5d0
   140317d5e:	48 69 c2 78 ab 06 00 	imul   rax,rdx,0x6ab78
   140317d65:	8b f3                	mov    esi,ebx
   140317d67:	42 3b 5c 38 08       	cmp    ebx,DWORD PTR [rax+r15*1+0x8]
   140317d6c:	0f 83 a7 00 00 00    	jae    0x140317e19
   140317d72:	48 89 6c 24 50       	mov    QWORD PTR [rsp+0x50],rbp
   140317d77:	4c 89 64 24 60       	mov    QWORD PTR [rsp+0x60],r12
   140317d7c:	41 bc 00 08 00 00    	mov    r12d,0x800
   140317d82:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   140317d87:	41 bd df ff 00 00    	mov    r13d,0xffdf
   140317d8d:	4c 89 74 24 20       	mov    QWORD PTR [rsp+0x20],r14
   140317d92:	8b c6                	mov    eax,esi
   140317d94:	44 8b c2             	mov    r8d,edx
   140317d97:	4c 8d 34 c0          	lea    r14,[rax+rax*8]
   140317d9b:	8b c2                	mov    eax,edx
   140317d9d:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140317da4:	4d 03 f6             	add    r14,r14
   140317da7:	4a 8b 04 38          	mov    rax,QWORD PTR [rax+r15*1]
   140317dab:	4a 8b 6c f0 30       	mov    rbp,QWORD PTR [rax+r14*8+0x30]
   140317db0:	4a 8d 0c f0          	lea    rcx,[rax+r14*8]
   140317db4:	48 85 ed             	test   rbp,rbp
   140317db7:	74 36                	je     0x140317def
   140317db9:	0f b7 85 1c 02 00 00 	movzx  eax,WORD PTR [rbp+0x21c]
   140317dc0:	66 41 85 c4          	test   r12w,ax
   140317dc4:	75 29                	jne    0x140317def
   140317dc6:	a8 20                	test   al,0x20
   140317dc8:	74 25                	je     0x140317def
   140317dca:	33 d2                	xor    edx,edx
   140317dcc:	e8 af 7e f4 ff       	call   0x14025fc80
   140317dd1:	8b 07                	mov    eax,DWORD PTR [rdi]
   140317dd3:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140317dda:	4a 8b 04 38          	mov    rax,QWORD PTR [rax+r15*1]
   140317dde:	42 80 64 f0 43 fe    	and    BYTE PTR [rax+r14*8+0x43],0xfe
   140317de4:	66 44 21 ad 1c 02 00 	and    WORD PTR [rbp+0x21c],r13w
   140317deb:	00 
   140317dec:	44 8b 07             	mov    r8d,DWORD PTR [rdi]
   140317def:	41 8b c0             	mov    eax,r8d
   140317df2:	ff c6                	inc    esi
   140317df4:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140317dfb:	41 8b d0             	mov    edx,r8d
   140317dfe:	42 3b 74 39 08       	cmp    esi,DWORD PTR [rcx+r15*1+0x8]
   140317e03:	72 8d                	jb     0x140317d92
   140317e05:	4c 8b 74 24 20       	mov    r14,QWORD PTR [rsp+0x20]
   140317e0a:	4c 8b 6c 24 28       	mov    r13,QWORD PTR [rsp+0x28]
   140317e0f:	4c 8b 64 24 60       	mov    r12,QWORD PTR [rsp+0x60]
   140317e14:	48 8b 6c 24 50       	mov    rbp,QWORD PTR [rsp+0x50]
   140317e19:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140317e1e:	8b c2                	mov    eax,edx
   140317e20:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140317e27:	42 3b 5c 39 08       	cmp    ebx,DWORD PTR [rcx+r15*1+0x8]
   140317e2c:	73 47                	jae    0x140317e75
   140317e2e:	66 90                	xchg   ax,ax
   140317e30:	44 8b 05 fd 72 66 00 	mov    r8d,DWORD PTR [rip+0x6672fd]        # 0x14097f134
   140317e37:	41 8d 40 01          	lea    eax,[r8+0x1]
   140317e3b:	89 05 f3 72 66 00    	mov    DWORD PTR [rip+0x6672f3],eax        # 0x14097f134
   140317e41:	8b 07                	mov    eax,DWORD PTR [rdi]
   140317e43:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140317e4a:	8b c3                	mov    eax,ebx
   140317e4c:	ff c3                	inc    ebx
   140317e4e:	48 8d 14 c0          	lea    rdx,[rax+rax*8]
   140317e52:	4a 8b 04 39          	mov    rax,QWORD PTR [rcx+r15*1]
   140317e56:	48 03 d2             	add    rdx,rdx
   140317e59:	48 8b 54 d0 30       	mov    rdx,QWORD PTR [rax+rdx*8+0x30]
   140317e5e:	44 89 82 24 02 00 00 	mov    DWORD PTR [rdx+0x224],r8d
   140317e65:	8b 07                	mov    eax,DWORD PTR [rdi]
   140317e67:	48 69 d0 78 ab 06 00 	imul   rdx,rax,0x6ab78
   140317e6e:	42 3b 5c 3a 08       	cmp    ebx,DWORD PTR [rdx+r15*1+0x8]
   140317e73:	72 bb                	jb     0x140317e30
   140317e75:	48 8b 0d cc 76 4b 17 	mov    rcx,QWORD PTR [rip+0x174b76cc]        # 0x1577cf548
   140317e7c:	ff 15 c6 07 37 00    	call   QWORD PTR [rip+0x3707c6]        # 0x140688648
   140317e82:	33 d2                	xor    edx,edx
   140317e84:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   140317e89:	e8 a2 9d 17 00       	call   0x140491c30
   140317e8e:	e8 bd 31 f5 ff       	call   0x14026b050
   140317e93:	b0 01                	mov    al,0x1
   140317e95:	48 83 c4 30          	add    rsp,0x30
   140317e99:	41 5f                	pop    r15
   140317e9b:	5f                   	pop    rdi
   140317e9c:	5b                   	pop    rbx
   140317e9d:	c3                   	ret
   140317e9e:	cc                   	int3
   140317e9f:	cc                   	int3
   140317ea0:	48 83 ec 28          	sub    rsp,0x28
   140317ea4:	0f 57 c9             	xorps  xmm1,xmm1
   140317ea7:	0f 2f c8             	comiss xmm1,xmm0
   140317eaa:	72 0d                	jb     0x140317eb9
   140317eac:	f3 0f 10 05 94 f3 37 	movss  xmm0,DWORD PTR [rip+0x37f394]        # 0x140697248
   140317eb3:	00 
   140317eb4:	48 83 c4 28          	add    rsp,0x28
   140317eb8:	c3                   	ret
   140317eb9:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140317ebd:	f2 0f 5e 05 bb 62 37 	divsd  xmm0,QWORD PTR [rip+0x3762bb]        # 0x14068e180
   140317ec4:	00 
   140317ec5:	e8 aa 8e 30 00       	call   0x140620d74
   140317eca:	f2 0f 59 05 76 62 37 	mulsd  xmm0,QWORD PTR [rip+0x376276]        # 0x14068e148
   140317ed1:	00 
   140317ed2:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140317ed6:	48 83 c4 28          	add    rsp,0x28
   140317eda:	c3                   	ret
   140317edb:	cc                   	int3
   140317edc:	cc                   	int3
   140317edd:	cc                   	int3
   140317ede:	cc                   	int3
   140317edf:	cc                   	int3
   140317ee0:	40 53                	rex push rbx
   140317ee2:	55                   	push   rbp
   140317ee3:	56                   	push   rsi
   140317ee4:	57                   	push   rdi
   140317ee5:	41 54                	push   r12
   140317ee7:	41 55                	push   r13
   140317ee9:	48 83 ec 68          	sub    rsp,0x68
   140317eed:	48 8b 05 74 a2 65 00 	mov    rax,QWORD PTR [rip+0x65a274]        # 0x140972168
   140317ef4:	48 33 c4             	xor    rax,rsp
   140317ef7:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   140317efc:	8b 05 a6 1a 62 00    	mov    eax,DWORD PTR [rip+0x621aa6]        # 0x1409399a8
   140317f02:	33 f6                	xor    esi,esi
   140317f04:	44 89 4c 24 20       	mov    DWORD PTR [rsp+0x20],r9d
   140317f09:	45 8b e8             	mov    r13d,r8d
   140317f0c:	44 8b e2             	mov    r12d,edx
   140317f0f:	48 8b d9             	mov    rbx,rcx
   140317f12:	8b fe                	mov    edi,esi
   140317f14:	85 c0                	test   eax,eax
   140317f16:	74 4f                	je     0x140317f67
   140317f18:	48 c7 c5 ff ff ff ff 	mov    rbp,0xffffffffffffffff
   140317f1f:	90                   	nop
   140317f20:	8b 8b d8 02 00 00    	mov    ecx,DWORD PTR [rbx+0x2d8]
   140317f26:	b8 04 00 00 00       	mov    eax,0x4
   140317f2b:	48 f7 e1             	mul    rcx
   140317f2e:	48 0f 40 c5          	cmovo  rax,rbp
   140317f32:	48 8b c8             	mov    rcx,rax
   140317f35:	e8 26 36 30 00       	call   0x14061b560
   140317f3a:	8b cf                	mov    ecx,edi
   140317f3c:	48 89 44 cc 28       	mov    QWORD PTR [rsp+rcx*8+0x28],rax
   140317f41:	48 85 c0             	test   rax,rax
   140317f44:	74 7c                	je     0x140317fc2
   140317f46:	44 8b 83 d8 02 00 00 	mov    r8d,DWORD PTR [rbx+0x2d8]
   140317f4d:	33 d2                	xor    edx,edx
   140317f4f:	49 c1 e0 02          	shl    r8,0x2
   140317f53:	48 8b c8             	mov    rcx,rax
   140317f56:	e8 8f 8d 30 00       	call   0x140620cea
   140317f5b:	8b 05 47 1a 62 00    	mov    eax,DWORD PTR [rip+0x621a47]        # 0x1409399a8
   140317f61:	ff c7                	inc    edi
   140317f63:	3b f8                	cmp    edi,eax
   140317f65:	72 b9                	jb     0x140317f20
   140317f67:	4c 89 74 24 60       	mov    QWORD PTR [rsp+0x60],r14
   140317f6c:	44 8b d6             	mov    r10d,esi
   140317f6f:	4c 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],r15
   140317f74:	85 c0                	test   eax,eax
   140317f76:	0f 84 9b 00 00 00    	je     0x140318017
   140317f7c:	f3 0f 10 0d 38 fb 38 	movss  xmm1,DWORD PTR [rip+0x38fb38]        # 0x1406a7abc
   140317f83:	00 
   140317f84:	f3 0f 10 15 44 f2 37 	movss  xmm2,DWORD PTR [rip+0x37f244]        # 0x1406971d0
   140317f8b:	00 
   140317f8c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140317f90:	44 8b c6             	mov    r8d,esi
   140317f93:	39 b3 d8 02 00 00    	cmp    DWORD PTR [rbx+0x2d8],esi
   140317f99:	76 70                	jbe    0x14031800b
   140317f9b:	45 8b ca             	mov    r9d,r10d
   140317f9e:	66 90                	xchg   ax,ax
   140317fa0:	66 83 3d b6 21 67 00 	cmp    WORD PTR [rip+0x6721b6],0x10        # 0x14098a15e
   140317fa7:	10 
   140317fa8:	75 1d                	jne    0x140317fc7
   140317faa:	4a 8b 84 cb 58 02 00 	mov    rax,QWORD PTR [rbx+r9*8+0x258]
   140317fb1:	00 
   140317fb2:	41 8b d0             	mov    edx,r8d
   140317fb5:	0f bf 0c 50          	movsx  ecx,WORD PTR [rax+rdx*2]
   140317fb9:	66 0f 6e c1          	movd   xmm0,ecx
   140317fbd:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140317fc0:	eb 2d                	jmp    0x140317fef
   140317fc2:	e9 f0 01 00 00       	jmp    0x1403181b7
   140317fc7:	66 83 3d 8f 21 67 00 	cmp    WORD PTR [rip+0x67218f],0x8        # 0x14098a15e
   140317fce:	08 
   140317fcf:	75 28                	jne    0x140317ff9
   140317fd1:	4a 8b 84 cb 40 02 00 	mov    rax,QWORD PTR [rbx+r9*8+0x240]
   140317fd8:	00 
   140317fd9:	41 8b d0             	mov    edx,r8d
   140317fdc:	0f b6 0c 10          	movzx  ecx,BYTE PTR [rax+rdx*1]
   140317fe0:	66 0f 6e c1          	movd   xmm0,ecx
   140317fe4:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140317fe7:	f3 0f 5c c1          	subss  xmm0,xmm1
   140317feb:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140317fef:	4a 8b 44 cc 28       	mov    rax,QWORD PTR [rsp+r9*8+0x28]
   140317ff4:	f3 0f 11 04 90       	movss  DWORD PTR [rax+rdx*4],xmm0
   140317ff9:	41 ff c0             	inc    r8d
   140317ffc:	44 3b 83 d8 02 00 00 	cmp    r8d,DWORD PTR [rbx+0x2d8]
   140318003:	72 9b                	jb     0x140317fa0
   140318005:	8b 05 9d 19 62 00    	mov    eax,DWORD PTR [rip+0x62199d]        # 0x1409399a8
   14031800b:	41 ff c2             	inc    r10d
   14031800e:	44 3b d0             	cmp    r10d,eax
   140318011:	0f 82 79 ff ff ff    	jb     0x140317f90
   140318017:	44 8b b4 24 c8 00 00 	mov    r14d,DWORD PTR [rsp+0xc8]
   14031801e:	00 
   14031801f:	44 0f b6 bc 24 c0 00 	movzx  r15d,BYTE PTR [rsp+0xc0]
   140318026:	00 00 
   140318028:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14031802f:	00 
   140318030:	48 8b 8b 08 03 00 00 	mov    rcx,QWORD PTR [rbx+0x308]
   140318037:	ba ff ff ff ff       	mov    edx,0xffffffff
   14031803c:	ff 15 0e 06 37 00    	call   QWORD PTR [rip+0x37060e]        # 0x140688650
   140318042:	44 8b 83 40 03 00 00 	mov    r8d,DWORD PTR [rbx+0x340]
   140318049:	40 32 ed             	xor    bpl,bpl
   14031804c:	40 b7 01             	mov    dil,0x1
   14031804f:	8b ce                	mov    ecx,esi
   140318051:	45 85 c0             	test   r8d,r8d
   140318054:	0f 84 fd 00 00 00    	je     0x140318157
   14031805a:	48 8b 93 e8 02 00 00 	mov    rdx,QWORD PTR [rbx+0x2e8]
   140318061:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140318065:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14031806c:	00 00 00 00 
   140318070:	44 8b c9             	mov    r9d,ecx
   140318073:	4b 8d 04 89          	lea    rax,[r9+r9*4]
   140318077:	48 03 c0             	add    rax,rax
   14031807a:	48 39 34 c2          	cmp    QWORD PTR [rdx+rax*8],rsi
   14031807e:	74 07                	je     0x140318087
   140318080:	83 7c c2 08 01       	cmp    DWORD PTR [rdx+rax*8+0x8],0x1
   140318085:	74 1d                	je     0x1403180a4
   140318087:	8b 44 c2 08          	mov    eax,DWORD PTR [rdx+rax*8+0x8]
   14031808b:	83 e8 04             	sub    eax,0x4
   14031808e:	40 0f b6 ff          	movzx  edi,dil
   140318092:	83 f8 01             	cmp    eax,0x1
   140318095:	0f 47 fe             	cmova  edi,esi
   140318098:	ff c1                	inc    ecx
   14031809a:	41 3b c8             	cmp    ecx,r8d
   14031809d:	72 d1                	jb     0x140318070
   14031809f:	e9 b3 00 00 00       	jmp    0x140318157
   1403180a4:	39 35 fe 18 62 00    	cmp    DWORD PTR [rip+0x6218fe],esi        # 0x1409399a8
   1403180aa:	44 8b c6             	mov    r8d,esi
   1403180ad:	76 28                	jbe    0x1403180d7
   1403180af:	4f 8d 14 89          	lea    r10,[r9+r9*4]
   1403180b3:	48 8b 8b e8 02 00 00 	mov    rcx,QWORD PTR [rbx+0x2e8]
   1403180ba:	41 8b c0             	mov    eax,r8d
   1403180bd:	41 ff c0             	inc    r8d
   1403180c0:	4a 8d 14 50          	lea    rdx,[rax+r10*2]
   1403180c4:	48 8b 44 c4 28       	mov    rax,QWORD PTR [rsp+rax*8+0x28]
   1403180c9:	48 89 44 d1 10       	mov    QWORD PTR [rcx+rdx*8+0x10],rax
   1403180ce:	44 3b 05 d3 18 62 00 	cmp    r8d,DWORD PTR [rip+0x6218d3]        # 0x1409399a8
   1403180d5:	72 dc                	jb     0x1403180b3
   1403180d7:	48 8b 8b e8 02 00 00 	mov    rcx,QWORD PTR [rbx+0x2e8]
   1403180de:	4b 8d 14 89          	lea    rdx,[r9+r9*4]
   1403180e2:	8b 83 e0 02 00 00    	mov    eax,DWORD PTR [rbx+0x2e0]
   1403180e8:	48 03 d2             	add    rdx,rdx
   1403180eb:	40 b5 01             	mov    bpl,0x1
   1403180ee:	89 44 d1 2c          	mov    DWORD PTR [rcx+rdx*8+0x2c],eax
   1403180f2:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   1403180f9:	8b 8b dc 02 00 00    	mov    ecx,DWORD PTR [rbx+0x2dc]
   1403180ff:	03 8b e0 02 00 00    	add    ecx,DWORD PTR [rbx+0x2e0]
   140318105:	89 4c d0 30          	mov    DWORD PTR [rax+rdx*8+0x30],ecx
   140318109:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   140318110:	8b 4c 24 20          	mov    ecx,DWORD PTR [rsp+0x20]
   140318114:	44 89 64 d0 34       	mov    DWORD PTR [rax+rdx*8+0x34],r12d
   140318119:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   140318120:	89 4c d0 38          	mov    DWORD PTR [rax+rdx*8+0x38],ecx
   140318124:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   14031812b:	44 89 6c d0 3c       	mov    DWORD PTR [rax+rdx*8+0x3c],r13d
   140318130:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   140318137:	44 89 74 d0 40       	mov    DWORD PTR [rax+rdx*8+0x40],r14d
   14031813c:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   140318143:	44 88 7c d0 44       	mov    BYTE PTR [rax+rdx*8+0x44],r15b
   140318148:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   14031814f:	c7 44 d0 08 02 00 00 	mov    DWORD PTR [rax+rdx*8+0x8],0x2
   140318156:	00 
   140318157:	48 8b 8b 08 03 00 00 	mov    rcx,QWORD PTR [rbx+0x308]
   14031815e:	ff 15 e4 04 37 00    	call   QWORD PTR [rip+0x3704e4]        # 0x140688648
   140318164:	40 84 ed             	test   bpl,bpl
   140318167:	75 3b                	jne    0x1403181a4
   140318169:	40 84 ff             	test   dil,dil
   14031816c:	75 18                	jne    0x140318186
   14031816e:	b9 1e 00 00 00       	mov    ecx,0x1e
   140318173:	ff 15 ef 04 37 00    	call   QWORD PTR [rip+0x3704ef]        # 0x140688668
   140318179:	40 38 35 52 df be 14 	cmp    BYTE PTR [rip+0x14bedf52],sil        # 0x154f060d2
   140318180:	0f 84 aa fe ff ff    	je     0x140318030
   140318186:	39 35 1c 18 62 00    	cmp    DWORD PTR [rip+0x62181c],esi        # 0x1409399a8
   14031818c:	76 16                	jbe    0x1403181a4
   14031818e:	66 90                	xchg   ax,ax
   140318190:	48 8b 4c f4 28       	mov    rcx,QWORD PTR [rsp+rsi*8+0x28]
   140318195:	e8 be 33 30 00       	call   0x14061b558
   14031819a:	ff c6                	inc    esi
   14031819c:	3b 35 06 18 62 00    	cmp    esi,DWORD PTR [rip+0x621806]        # 0x1409399a8
   1403181a2:	72 ec                	jb     0x140318190
   1403181a4:	b1 01                	mov    cl,0x1
   1403181a6:	e8 35 4d 17 00       	call   0x14048cee0
   1403181ab:	4c 8b 7c 24 58       	mov    r15,QWORD PTR [rsp+0x58]
   1403181b0:	b0 01                	mov    al,0x1
   1403181b2:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   1403181b7:	48 8b 4c 24 40       	mov    rcx,QWORD PTR [rsp+0x40]
   1403181bc:	48 33 cc             	xor    rcx,rsp
   1403181bf:	e8 3c 34 30 00       	call   0x14061b600
   1403181c4:	48 83 c4 68          	add    rsp,0x68
   1403181c8:	41 5d                	pop    r13
   1403181ca:	41 5c                	pop    r12
   1403181cc:	5f                   	pop    rdi
   1403181cd:	5e                   	pop    rsi
   1403181ce:	5d                   	pop    rbp
   1403181cf:	5b                   	pop    rbx
   1403181d0:	c3                   	ret
   1403181d1:	cc                   	int3
   1403181d2:	cc                   	int3
   1403181d3:	cc                   	int3
   1403181d4:	cc                   	int3
   1403181d5:	cc                   	int3
   1403181d6:	cc                   	int3
   1403181d7:	cc                   	int3
   1403181d8:	cc                   	int3
   1403181d9:	cc                   	int3
   1403181da:	cc                   	int3
   1403181db:	cc                   	int3
   1403181dc:	cc                   	int3
   1403181dd:	cc                   	int3
   1403181de:	cc                   	int3
   1403181df:	cc                   	int3
   1403181e0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   1403181e5:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   1403181ea:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   1403181ef:	57                   	push   rdi
   1403181f0:	41 56                	push   r14
   1403181f2:	41 57                	push   r15
   1403181f4:	48 83 ec 30          	sub    rsp,0x30
   1403181f8:	44 8b f2             	mov    r14d,edx
   1403181fb:	48 8b f9             	mov    rdi,rcx
   1403181fe:	48 8b 89 38 03 00 00 	mov    rcx,QWORD PTR [rcx+0x338]
   140318205:	ba ff ff ff ff       	mov    edx,0xffffffff
   14031820a:	41 8b f0             	mov    esi,r8d
   14031820d:	ff 15 3d 04 37 00    	call   QWORD PTR [rip+0x37043d]        # 0x140688650
   140318213:	8b af dc 02 00 00    	mov    ebp,DWORD PTR [rdi+0x2dc]
   140318219:	48 8b 87 28 03 00 00 	mov    rax,QWORD PTR [rdi+0x328]
   140318220:	4d 6b ce 1c          	imul   r9,r14,0x1c
   140318224:	0f af ee             	imul   ebp,esi
   140318227:	80 3d a4 de be 14 00 	cmp    BYTE PTR [rip+0x14bedea4],0x0        # 0x154f060d2
   14031822e:	45 8b 3c 01          	mov    r15d,DWORD PTR [r9+rax*1]
   140318232:	75 0f                	jne    0x140318243
   140318234:	41 8b 44 01 04       	mov    eax,DWORD PTR [r9+rax*1+0x4]
   140318239:	ff c8                	dec    eax
   14031823b:	3b f0                	cmp    esi,eax
   14031823d:	74 04                	je     0x140318243
   14031823f:	32 db                	xor    bl,bl
   140318241:	eb 02                	jmp    0x140318245
   140318243:	b3 01                	mov    bl,0x1
   140318245:	48 8b 8f 38 03 00 00 	mov    rcx,QWORD PTR [rdi+0x338]
   14031824c:	ff 15 f6 03 37 00    	call   QWORD PTR [rip+0x3703f6]        # 0x140688648
   140318252:	44 8b ce             	mov    r9d,esi
   140318255:	44 89 74 24 28       	mov    DWORD PTR [rsp+0x28],r14d
   14031825a:	45 8b c7             	mov    r8d,r15d
   14031825d:	88 5c 24 20          	mov    BYTE PTR [rsp+0x20],bl
   140318261:	8b d5                	mov    edx,ebp
   140318263:	48 8b cf             	mov    rcx,rdi
   140318266:	e8 75 fc ff ff       	call   0x140317ee0
   14031826b:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   140318270:	48 8b 6c 24 58       	mov    rbp,QWORD PTR [rsp+0x58]
   140318275:	48 8b 74 24 60       	mov    rsi,QWORD PTR [rsp+0x60]
   14031827a:	48 83 c4 30          	add    rsp,0x30
   14031827e:	41 5f                	pop    r15
   140318280:	41 5e                	pop    r14
   140318282:	5f                   	pop    rdi
   140318283:	c3                   	ret
   140318284:	cc                   	int3
   140318285:	cc                   	int3
   140318286:	cc                   	int3
   140318287:	cc                   	int3
   140318288:	cc                   	int3
   140318289:	cc                   	int3
   14031828a:	cc                   	int3
   14031828b:	cc                   	int3
   14031828c:	cc                   	int3
   14031828d:	cc                   	int3
   14031828e:	cc                   	int3
   14031828f:	cc                   	int3
