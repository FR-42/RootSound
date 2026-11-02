
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140336700 <.text+0x335700>:
   140336700:	eb 04                	jmp    0x140336706
   140336702:	41 0f 28 c9          	movaps xmm1,xmm9
   140336706:	f3 0f 5c d3          	subss  xmm2,xmm3
   14033670a:	f3 0f 5e d1          	divss  xmm2,xmm1
   14033670e:	0f 2f d0             	comiss xmm2,xmm0
   140336711:	77 03                	ja     0x140336716
   140336713:	0f 28 c2             	movaps xmm0,xmm2
   140336716:	0f 2f f0             	comiss xmm6,xmm0
   140336719:	77 03                	ja     0x14033671e
   14033671b:	0f 28 c6             	movaps xmm0,xmm6
   14033671e:	0f 28 d6             	movaps xmm2,xmm6
   140336721:	f3 0f 5c d0          	subss  xmm2,xmm0
   140336725:	eb 65                	jmp    0x14033678c
   140336727:	f3 0f 5c c8          	subss  xmm1,xmm0
   14033672b:	84 c0                	test   al,al
   14033672d:	74 11                	je     0x140336740
   14033672f:	f3 0f 5c da          	subss  xmm3,xmm2
   140336733:	41 0f 28 c0          	movaps xmm0,xmm8
   140336737:	f3 0f 5e d8          	divss  xmm3,xmm0
   14033673b:	0f 2f d9             	comiss xmm3,xmm1
   14033673e:	eb 38                	jmp    0x140336778
   140336740:	f3 0f 5c da          	subss  xmm3,xmm2
   140336744:	41 0f 28 c1          	movaps xmm0,xmm9
   140336748:	f3 0f 5e d8          	divss  xmm3,xmm0
   14033674c:	0f 2f d9             	comiss xmm3,xmm1
   14033674f:	eb 27                	jmp    0x140336778
   140336751:	0f 2f c1             	comiss xmm0,xmm1
   140336754:	72 12                	jb     0x140336768
   140336756:	f3 0f 5c d3          	subss  xmm2,xmm3
   14033675a:	f3 0f 5c c1          	subss  xmm0,xmm1
   14033675e:	f3 41 0f 5e d2       	divss  xmm2,xmm10
   140336763:	0f 2f c2             	comiss xmm0,xmm2
   140336766:	eb a9                	jmp    0x140336711
   140336768:	f3 0f 5c da          	subss  xmm3,xmm2
   14033676c:	f3 0f 5c c8          	subss  xmm1,xmm0
   140336770:	f3 41 0f 5e da       	divss  xmm3,xmm10
   140336775:	0f 2f cb             	comiss xmm1,xmm3
   140336778:	77 03                	ja     0x14033677d
   14033677a:	0f 28 cb             	movaps xmm1,xmm3
   14033677d:	0f 2f f1             	comiss xmm6,xmm1
   140336780:	77 03                	ja     0x140336785
   140336782:	0f 28 ce             	movaps xmm1,xmm6
   140336785:	0f 28 d6             	movaps xmm2,xmm6
   140336788:	f3 0f 5c d1          	subss  xmm2,xmm1
   14033678c:	f3 41 0f 59 50 dc    	mulss  xmm2,DWORD PTR [r8-0x24]
   140336792:	0f 2f d5             	comiss xmm2,xmm5
   140336795:	76 0a                	jbe    0x1403367a1
   140336797:	49 8b d1             	mov    rdx,r9
   14033679a:	0f 28 ea             	movaps xmm5,xmm2
   14033679d:	48 89 55 b8          	mov    QWORD PTR [rbp-0x48],rdx
   1403367a1:	49 ff c1             	inc    r9
   1403367a4:	49 81 c0 3c 01 00 00 	add    r8,0x13c
   1403367ab:	49 83 ea 01          	sub    r10,0x1
   1403367af:	0f 85 cb fe ff ff    	jne    0x140336680
   1403367b5:	41 0f 2f ec          	comiss xmm5,xmm12
   1403367b9:	4c 8b 6d a0          	mov    r13,QWORD PTR [rbp-0x60]
   1403367bd:	0f 86 be 04 00 00    	jbe    0x140336c81
   1403367c3:	4c 8b 44 24 68       	mov    r8,QWORD PTR [rsp+0x68]
   1403367c8:	41 8b c3             	mov    eax,r11d
   1403367cb:	2b c3                	sub    eax,ebx
   1403367cd:	4c 8b f7             	mov    r14,rdi
   1403367d0:	c1 e0 09             	shl    eax,0x9
   1403367d3:	41 0f 28 fc          	movaps xmm7,xmm12
   1403367d7:	48 69 f0 3c 01 00 00 	imul   rsi,rax,0x13c
   1403367de:	48 63 c3             	movsxd rax,ebx
   1403367e1:	45 8b ca             	mov    r9d,r10d
   1403367e4:	48 03 74 24 78       	add    rsi,QWORD PTR [rsp+0x78]
   1403367e9:	4c 2b f0             	sub    r14,rax
   1403367ec:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   1403367f3:	4c 89 75 a0          	mov    QWORD PTR [rbp-0x60],r14
   1403367f7:	8b f8                	mov    edi,eax
   1403367f9:	47 0f b7 1c 70       	movzx  r11d,WORD PTR [r8+r14*2]
   1403367fe:	66 45 3b d3          	cmp    r10w,r11w
   140336802:	0f 83 49 02 00 00    	jae    0x140336a51
   140336808:	44 8b 25 99 31 60 00 	mov    r12d,DWORD PTR [rip+0x603199]        # 0x1409399a8
   14033680f:	4c 8d 46 04          	lea    r8,[rsi+0x4]
   140336813:	4c 8b 74 24 58       	mov    r14,QWORD PTR [rsp+0x58]
   140336818:	4c 69 d2 3c 01 00 00 	imul   r10,rdx,0x13c
   14033681f:	41 0f b7 db          	movzx  ebx,r11w
   140336823:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140336827:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033682e:	00 00 
   140336830:	41 f6 80 ef 00 00 00 	test   BYTE PTR [r8+0xef],0x2
   140336837:	02 
   140336838:	0f 85 e9 01 00 00    	jne    0x140336a27
   14033683e:	41 83 fc 01          	cmp    r12d,0x1
   140336842:	74 22                	je     0x140336866
   140336844:	41 0f bf 87 f0 00 00 	movsx  eax,WORD PTR [r15+0xf0]
   14033684b:	00 
   14033684c:	41 0f bf 88 ec 00 00 	movsx  ecx,WORD PTR [r8+0xec]
   140336853:	00 
   140336854:	2b c1                	sub    eax,ecx
   140336856:	99                   	cdq
   140336857:	33 c2                	xor    eax,edx
   140336859:	2b c2                	sub    eax,edx
   14033685b:	3d 00 70 00 00       	cmp    eax,0x7000
   140336860:	0f 8f c1 01 00 00    	jg     0x140336a27
   140336866:	41 0f b6 86 91 00 00 	movzx  eax,BYTE PTR [r14+0x91]
   14033686d:	00 
   14033686e:	f3 41 0f 10 68 fc    	movss  xmm5,DWORD PTR [r8-0x4]
   140336874:	f3 41 0f 10 0f       	movss  xmm1,DWORD PTR [r15]
   140336879:	f3 41 0f 10 10       	movss  xmm2,DWORD PTR [r8]
   14033687e:	f3 41 0f 10 47 04    	movss  xmm0,DWORD PTR [r15+0x4]
   140336884:	84 c0                	test   al,al
   140336886:	74 06                	je     0x14033688e
   140336888:	41 0f 28 d8          	movaps xmm3,xmm8
   14033688c:	eb 04                	jmp    0x140336892
   14033688e:	41 0f 28 d9          	movaps xmm3,xmm9
   140336892:	f3 41 0f 59 db       	mulss  xmm3,xmm11
   140336897:	0f 2f d9             	comiss xmm3,xmm1
   14033689a:	76 62                	jbe    0x1403368fe
   14033689c:	0f 2f c2             	comiss xmm0,xmm2
   14033689f:	72 33                	jb     0x1403368d4
   1403368a1:	f3 0f 5c c2          	subss  xmm0,xmm2
   1403368a5:	84 c0                	test   al,al
   1403368a7:	74 06                	je     0x1403368af
   1403368a9:	41 0f 28 d8          	movaps xmm3,xmm8
   1403368ad:	eb 04                	jmp    0x1403368b3
   1403368af:	41 0f 28 d9          	movaps xmm3,xmm9
   1403368b3:	f3 0f 5c cd          	subss  xmm1,xmm5
   1403368b7:	f3 0f 5e cb          	divss  xmm1,xmm3
   1403368bb:	0f 2f c8             	comiss xmm1,xmm0
   1403368be:	77 03                	ja     0x1403368c3
   1403368c0:	0f 28 c1             	movaps xmm0,xmm1
   1403368c3:	0f 2f f0             	comiss xmm6,xmm0
   1403368c6:	77 03                	ja     0x1403368cb
   1403368c8:	0f 28 c6             	movaps xmm0,xmm6
   1403368cb:	0f 28 e6             	movaps xmm4,xmm6
   1403368ce:	f3 0f 5c e0          	subss  xmm4,xmm0
   1403368d2:	eb 6b                	jmp    0x14033693f
   1403368d4:	0f 28 da             	movaps xmm3,xmm2
   1403368d7:	f3 0f 5c d8          	subss  xmm3,xmm0
   1403368db:	84 c0                	test   al,al
   1403368dd:	74 06                	je     0x1403368e5
   1403368df:	41 0f 28 e0          	movaps xmm4,xmm8
   1403368e3:	eb 04                	jmp    0x1403368e9
   1403368e5:	41 0f 28 e1          	movaps xmm4,xmm9
   1403368e9:	0f 28 c5             	movaps xmm0,xmm5
   1403368ec:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403368f0:	f3 0f 5e c4          	divss  xmm0,xmm4
   1403368f4:	0f 2f c3             	comiss xmm0,xmm3
   1403368f7:	77 37                	ja     0x140336930
   1403368f9:	0f 28 d8             	movaps xmm3,xmm0
   1403368fc:	eb 32                	jmp    0x140336930
   1403368fe:	0f 2f c2             	comiss xmm0,xmm2
   140336901:	72 12                	jb     0x140336915
   140336903:	f3 0f 5c cd          	subss  xmm1,xmm5
   140336907:	f3 0f 5c c2          	subss  xmm0,xmm2
   14033690b:	f3 41 0f 5e ca       	divss  xmm1,xmm10
   140336910:	0f 2f c1             	comiss xmm0,xmm1
   140336913:	eb a9                	jmp    0x1403368be
   140336915:	0f 28 e5             	movaps xmm4,xmm5
   140336918:	0f 28 da             	movaps xmm3,xmm2
   14033691b:	f3 0f 5c e1          	subss  xmm4,xmm1
   14033691f:	f3 0f 5c d8          	subss  xmm3,xmm0
   140336923:	f3 41 0f 5e e2       	divss  xmm4,xmm10
   140336928:	0f 2f dc             	comiss xmm3,xmm4
   14033692b:	77 03                	ja     0x140336930
   14033692d:	0f 28 dc             	movaps xmm3,xmm4
   140336930:	0f 2f f3             	comiss xmm6,xmm3
   140336933:	77 03                	ja     0x140336938
   140336935:	0f 28 de             	movaps xmm3,xmm6
   140336938:	0f 28 e6             	movaps xmm4,xmm6
   14033693b:	f3 0f 5c e3          	subss  xmm4,xmm3
   14033693f:	41 0f 2f e4          	comiss xmm4,xmm12
   140336943:	0f 86 de 00 00 00    	jbe    0x140336a27
   140336949:	f3 43 0f 10 04 2a    	movss  xmm0,DWORD PTR [r10+r13*1]
   14033694f:	f3 43 0f 10 4c 2a 04 	movss  xmm1,DWORD PTR [r10+r13*1+0x4]
   140336956:	84 c0                	test   al,al
   140336958:	74 06                	je     0x140336960
   14033695a:	41 0f 28 d8          	movaps xmm3,xmm8
   14033695e:	eb 04                	jmp    0x140336964
   140336960:	41 0f 28 d9          	movaps xmm3,xmm9
   140336964:	f3 41 0f 59 db       	mulss  xmm3,xmm11
   140336969:	0f 2f d8             	comiss xmm3,xmm0
   14033696c:	76 62                	jbe    0x1403369d0
   14033696e:	0f 2f ca             	comiss xmm1,xmm2
   140336971:	72 33                	jb     0x1403369a6
   140336973:	f3 0f 5c ca          	subss  xmm1,xmm2
   140336977:	84 c0                	test   al,al
   140336979:	74 06                	je     0x140336981
   14033697b:	41 0f 28 d0          	movaps xmm2,xmm8
   14033697f:	eb 04                	jmp    0x140336985
   140336981:	41 0f 28 d1          	movaps xmm2,xmm9
   140336985:	f3 0f 5c c5          	subss  xmm0,xmm5
   140336989:	f3 0f 5e c2          	divss  xmm0,xmm2
   14033698d:	0f 2f c1             	comiss xmm0,xmm1
   140336990:	77 03                	ja     0x140336995
   140336992:	0f 28 c8             	movaps xmm1,xmm0
   140336995:	0f 2f f1             	comiss xmm6,xmm1
   140336998:	77 03                	ja     0x14033699d
   14033699a:	0f 28 ce             	movaps xmm1,xmm6
   14033699d:	0f 28 c6             	movaps xmm0,xmm6
   1403369a0:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403369a4:	eb 65                	jmp    0x140336a0b
   1403369a6:	f3 0f 5c d1          	subss  xmm2,xmm1
   1403369aa:	84 c0                	test   al,al
   1403369ac:	74 11                	je     0x1403369bf
   1403369ae:	f3 0f 5c e8          	subss  xmm5,xmm0
   1403369b2:	41 0f 28 c8          	movaps xmm1,xmm8
   1403369b6:	f3 0f 5e e9          	divss  xmm5,xmm1
   1403369ba:	0f 2f ea             	comiss xmm5,xmm2
   1403369bd:	eb 38                	jmp    0x1403369f7
   1403369bf:	f3 0f 5c e8          	subss  xmm5,xmm0
   1403369c3:	41 0f 28 c9          	movaps xmm1,xmm9
   1403369c7:	f3 0f 5e e9          	divss  xmm5,xmm1
   1403369cb:	0f 2f ea             	comiss xmm5,xmm2
   1403369ce:	eb 27                	jmp    0x1403369f7
   1403369d0:	0f 2f ca             	comiss xmm1,xmm2
   1403369d3:	72 12                	jb     0x1403369e7
   1403369d5:	f3 0f 5c c5          	subss  xmm0,xmm5
   1403369d9:	f3 0f 5c ca          	subss  xmm1,xmm2
   1403369dd:	f3 41 0f 5e c2       	divss  xmm0,xmm10
   1403369e2:	0f 2f c8             	comiss xmm1,xmm0
   1403369e5:	eb a9                	jmp    0x140336990
   1403369e7:	f3 0f 5c e8          	subss  xmm5,xmm0
   1403369eb:	f3 0f 5c d1          	subss  xmm2,xmm1
   1403369ef:	f3 41 0f 5e ea       	divss  xmm5,xmm10
   1403369f4:	0f 2f d5             	comiss xmm2,xmm5
   1403369f7:	77 03                	ja     0x1403369fc
   1403369f9:	0f 28 d5             	movaps xmm2,xmm5
   1403369fc:	0f 2f f2             	comiss xmm6,xmm2
   1403369ff:	77 03                	ja     0x140336a04
   140336a01:	0f 28 d6             	movaps xmm2,xmm6
   140336a04:	0f 28 c6             	movaps xmm0,xmm6
   140336a07:	f3 0f 5c c2          	subss  xmm0,xmm2
   140336a0b:	0f 2f e0             	comiss xmm4,xmm0
   140336a0e:	77 03                	ja     0x140336a13
   140336a10:	0f 28 c4             	movaps xmm0,xmm4
   140336a13:	f3 41 0f 59 80 c8 00 	mulss  xmm0,DWORD PTR [r8+0xc8]
   140336a1a:	00 00 
   140336a1c:	0f 2f c7             	comiss xmm0,xmm7
   140336a1f:	76 06                	jbe    0x140336a27
   140336a21:	0f 28 f8             	movaps xmm7,xmm0
   140336a24:	41 8b f9             	mov    edi,r9d
   140336a27:	41 ff c1             	inc    r9d
   140336a2a:	49 81 c0 3c 01 00 00 	add    r8,0x13c
   140336a31:	44 3b cb             	cmp    r9d,ebx
   140336a34:	0f 8c f6 fd ff ff    	jl     0x140336830
   140336a3a:	4c 8b 75 a0          	mov    r14,QWORD PTR [rbp-0x60]
   140336a3e:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   140336a45:	4c 8b 65 a8          	mov    r12,QWORD PTR [rbp-0x58]
   140336a49:	45 33 d2             	xor    r10d,r10d
   140336a4c:	4c 8b 44 24 68       	mov    r8,QWORD PTR [rsp+0x68]
   140336a51:	85 ff                	test   edi,edi
   140336a53:	0f 89 ef 01 00 00    	jns    0x140336c48
   140336a59:	41 b9 00 02 00 00    	mov    r9d,0x200
   140336a5f:	66 45 3b d9          	cmp    r11w,r9w
   140336a63:	75 5d                	jne    0x140336ac2
   140336a65:	47 0f b7 1c 70       	movzx  r11d,WORD PTR [r8+r14*2]
   140336a6a:	8b d0                	mov    edx,eax
   140336a6c:	48 8d 86 cc 00 00 00 	lea    rax,[rsi+0xcc]
   140336a73:	41 0f 28 cc          	movaps xmm1,xmm12
   140336a77:	41 8b ca             	mov    ecx,r10d
   140336a7a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140336a80:	f6 40 27 02          	test   BYTE PTR [rax+0x27],0x2
   140336a84:	75 10                	jne    0x140336a96
   140336a86:	83 fa ff             	cmp    edx,0xffffffff
   140336a89:	74 05                	je     0x140336a90
   140336a8b:	0f 2f 08             	comiss xmm1,DWORD PTR [rax]
   140336a8e:	76 06                	jbe    0x140336a96
   140336a90:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   140336a94:	8b d1                	mov    edx,ecx
   140336a96:	ff c1                	inc    ecx
   140336a98:	48 05 3c 01 00 00    	add    rax,0x13c
   140336a9e:	41 3b c9             	cmp    ecx,r9d
   140336aa1:	7c dd                	jl     0x140336a80
   140336aa3:	85 d2                	test   edx,edx
   140336aa5:	78 17                	js     0x140336abe
   140336aa7:	f3 41 0f 10 87 cc 00 	movss  xmm0,DWORD PTR [r15+0xcc]
   140336aae:	00 00 
   140336ab0:	0f 2f c1             	comiss xmm0,xmm1
   140336ab3:	76 09                	jbe    0x140336abe
   140336ab5:	44 0f b7 da          	movzx  r11d,dx
   140336ab9:	66 43 89 14 70       	mov    WORD PTR [r8+r14*2],dx
   140336abe:	66 45 3b d9          	cmp    r11w,r9w
   140336ac2:	0f 83 7c 01 00 00    	jae    0x140336c44
   140336ac8:	41 0f b7 c3          	movzx  eax,r11w
   140336acc:	49 8b cf             	mov    rcx,r15
   140336acf:	48 69 d0 3c 01 00 00 	imul   rdx,rax,0x13c
   140336ad6:	b8 02 00 00 00       	mov    eax,0x2
   140336adb:	48 03 d6             	add    rdx,rsi
   140336ade:	66 90                	xchg   ax,ax
   140336ae0:	48 8d 92 80 00 00 00 	lea    rdx,[rdx+0x80]
   140336ae7:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   140336aea:	48 8d 89 80 00 00  	lea    rcx,[rcx+0x80]
