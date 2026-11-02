
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403747f0 <.text+0x3737f0>:
   1403747f0:	41 8b c1             	mov    eax,r9d
   1403747f3:	41 8b d0             	mov    edx,r8d
   1403747f6:	4c 8b 4c 24 28       	mov    r9,QWORD PTR [rsp+0x28]
   1403747fb:	0f 57 c0             	xorps  xmm0,xmm0
   1403747fe:	44 8b c0             	mov    r8d,eax
   140374801:	f3 0f 11 44 24 28    	movss  DWORD PTR [rsp+0x28],xmm0
   140374807:	e9 d4 6c ff ff       	jmp    0x14036b4e0
   14037480c:	cc                   	int3
   14037480d:	cc                   	int3
   14037480e:	cc                   	int3
   14037480f:	cc                   	int3
   140374810:	cc                   	int3
   140374811:	cc                   	int3
   140374812:	cc                   	int3
   140374813:	cc                   	int3
   140374814:	cc                   	int3
   140374815:	cc                   	int3
   140374816:	cc                   	int3
   140374817:	cc                   	int3
   140374818:	cc                   	int3
   140374819:	cc                   	int3
   14037481a:	cc                   	int3
   14037481b:	cc                   	int3
   14037481c:	cc                   	int3
   14037481d:	cc                   	int3
   14037481e:	cc                   	int3
   14037481f:	cc                   	int3
   140374820:	48 8b c4             	mov    rax,rsp
   140374823:	44 88 40 18          	mov    BYTE PTR [rax+0x18],r8b
   140374827:	89 50 10             	mov    DWORD PTR [rax+0x10],edx
   14037482a:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037482e:	48 81 ec 18 01 00 00 	sub    rsp,0x118
   140374835:	48 89 58 f8          	mov    QWORD PTR [rax-0x8],rbx
   140374839:	48 8b d9             	mov    rbx,rcx
   14037483c:	48 89 68 f0          	mov    QWORD PTR [rax-0x10],rbp
   140374840:	48 89 70 e8          	mov    QWORD PTR [rax-0x18],rsi
   140374844:	48 89 78 e0          	mov    QWORD PTR [rax-0x20],rdi
   140374848:	4c 89 60 d8          	mov    QWORD PTR [rax-0x28],r12
   14037484c:	4c 89 70 c8          	mov    QWORD PTR [rax-0x38],r14
   140374850:	4c 89 78 c0          	mov    QWORD PTR [rax-0x40],r15
   140374854:	45 0f b6 f8          	movzx  r15d,r8b
   140374858:	4c 63 f2             	movsxd r14,edx
   14037485b:	e8 b0 67 ef ff       	call   0x14026b010
   140374860:	48 8b 0d e1 ac 45 17 	mov    rcx,QWORD PTR [rip+0x1745ace1]        # 0x1577cf548
   140374867:	ba ff ff ff ff       	mov    edx,0xffffffff
   14037486c:	ff 15 de 3d 31 00    	call   QWORD PTR [rip+0x313dde]        # 0x140688650
   140374872:	44 8b 0b             	mov    r9d,DWORD PTR [rbx]
   140374875:	4c 8d 25 54 5d 61 00 	lea    r12,[rip+0x615d54]        # 0x14098a5d0
   14037487c:	49 69 c1 78 ab 06 00 	imul   rax,r9,0x6ab78
   140374883:	33 ed                	xor    ebp,ebp
   140374885:	46 3b 74 20 08       	cmp    r14d,DWORD PTR [rax+r12*1+0x8]
   14037488a:	0f 8d 9b 06 00 00    	jge    0x140374f2b
   140374890:	4c 89 ac 24 e8 00 00 	mov    QWORD PTR [rsp+0xe8],r13
   140374897:	00 
   140374898:	4f 8d 1c f6          	lea    r11,[r14+r14*8]
   14037489c:	0f 29 b4 24 c0 00 00 	movaps XMMWORD PTR [rsp+0xc0],xmm6
   1403748a3:	00 
   1403748a4:	45 8d 56 01          	lea    r10d,[r14+0x1]
   1403748a8:	0f 29 bc 24 b0 00 00 	movaps XMMWORD PTR [rsp+0xb0],xmm7
   1403748af:	00 
   1403748b0:	41 be 20 08 00 00    	mov    r14d,0x820
   1403748b6:	44 0f 29 84 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm8
   1403748bd:	00 00 
   1403748bf:	f3 44 0f 10 05 10 98 	movss  xmm8,DWORD PTR [rip+0x319810]        # 0x14068e0d8
   1403748c6:	31 00 
   1403748c8:	44 0f 29 8c 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm9
   1403748cf:	00 00 
   1403748d1:	f2 44 0f 10 0d d6 be 	movsd  xmm9,QWORD PTR [rip+0x4dbed6]        # 0x1408507b0
   1403748d8:	4d 00 
   1403748da:	44 0f 29 94 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm10
   1403748e1:	00 00 
   1403748e3:	f3 44 0f 10 15 d0 9e 	movss  xmm10,DWORD PTR [rip+0x339ed0]        # 0x1406ae7bc
   1403748ea:	33 00 
   1403748ec:	49 c1 e3 04          	shl    r11,0x4
   1403748f0:	44 0f 29 5c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm11
   1403748f6:	f3 44 0f 10 1d 8d 98 	movss  xmm11,DWORD PTR [rip+0x31988d]        # 0x14068e18c
   1403748fd:	31 00 
   1403748ff:	44 89 54 24 2c       	mov    DWORD PTR [rsp+0x2c],r10d
   140374904:	4c 89 5c 24 58       	mov    QWORD PTR [rsp+0x58],r11
   140374909:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140374910:	41 8b c1             	mov    eax,r9d
   140374913:	41 8b d1             	mov    edx,r9d
   140374916:	4c 69 c0 78 ab 06 00 	imul   r8,rax,0x6ab78
   14037491d:	4b 8b 04 20          	mov    rax,QWORD PTR [r8+r12*1]
   140374921:	41 f7 44 03 44 00 40 	test   DWORD PTR [r11+rax*1+0x44],0x4000
   140374928:	00 00 
   14037492a:	49 8d 1c 03          	lea    rbx,[r11+rax*1]
   14037492e:	48 89 5c 24 50       	mov    QWORD PTR [rsp+0x50],rbx
   140374933:	0f 85 86 05 00 00    	jne    0x140374ebf
   140374939:	48 8b 73 30          	mov    rsi,QWORD PTR [rbx+0x30]
   14037493d:	48 89 74 24 48       	mov    QWORD PTR [rsp+0x48],rsi
   140374942:	48 85 f6             	test   rsi,rsi
   140374945:	0f 84 74 05 00 00    	je     0x140374ebf
   14037494b:	0f b7 8e 1c 02 00 00 	movzx  ecx,WORD PTR [rsi+0x21c]
   140374952:	66 85 c9             	test   cx,cx
   140374955:	0f 88 64 05 00 00    	js     0x140374ebf
   14037495b:	0f b7 c1             	movzx  eax,cx
   14037495e:	66 41 23 c6          	and    ax,r14w
   140374962:	66 83 f8 20          	cmp    ax,0x20
   140374966:	0f 85 53 05 00 00    	jne    0x140374ebf
   14037496c:	c0 e9 07             	shr    cl,0x7
   14037496f:	80 e1 01             	and    cl,0x1
   140374972:	41 3a cf             	cmp    cl,r15b
   140374975:	0f 85 44 05 00 00    	jne    0x140374ebf
   14037497b:	45 84 ff             	test   r15b,r15b
   14037497e:	74 1a                	je     0x14037499a
   140374980:	0f b7 46 20          	movzx  eax,WORD PTR [rsi+0x20]
   140374984:	66 83 f8 1f          	cmp    ax,0x1f
   140374988:	74 10                	je     0x14037499a
   14037498a:	66 83 f8 24          	cmp    ax,0x24
   14037498e:	74 0a                	je     0x14037499a
   140374990:	66 83 f8 20          	cmp    ax,0x20
   140374994:	0f 85 25 05 00 00    	jne    0x140374ebf
   14037499a:	41 8b d1             	mov    edx,r9d
   14037499d:	44 89 54 24 28       	mov    DWORD PTR [rsp+0x28],r10d
   1403749a2:	47 3b 54 20 08       	cmp    r10d,DWORD PTR [r8+r12*1+0x8]
   1403749a7:	0f 8d 12 05 00 00    	jge    0x140374ebf
   1403749ad:	4c 8d ae 98 00 00 00 	lea    r13,[rsi+0x98]
   1403749b4:	4d 8d 83 90 00 00 00 	lea    r8,[r11+0x90]
   1403749bb:	4c 89 6c 24 68       	mov    QWORD PTR [rsp+0x68],r13
   1403749c0:	4c 89 44 24 38       	mov    QWORD PTR [rsp+0x38],r8
   1403749c5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   1403749cc:	00 00 00 00 
   1403749d0:	f3 0f 10 4b 0c       	movss  xmm1,DWORD PTR [rbx+0xc]
   1403749d5:	41 8b d1             	mov    edx,r9d
   1403749d8:	41 8b c1             	mov    eax,r9d
   1403749db:	0f 28 c1             	movaps xmm0,xmm1
   1403749de:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403749e5:	f3 41 0f 58 c0       	addss  xmm0,xmm8
   1403749ea:	4a 8b 04 21          	mov    rax,QWORD PTR [rcx+r12*1]
   1403749ee:	48 89 44 24 60       	mov    QWORD PTR [rsp+0x60],rax
   1403749f3:	f3 42 0f 10 54 00 08 	movss  xmm2,DWORD PTR [rax+r8*1+0x8]
   1403749fa:	0f 2f d0             	comiss xmm2,xmm0
   1403749fd:	0f 87 b2 04 00 00    	ja     0x140374eb5
   140374a03:	f3 41 0f 5c c8       	subss  xmm1,xmm8
   140374a08:	0f 2f ca             	comiss xmm1,xmm2
   140374a0b:	0f 87 6f 04 00 00    	ja     0x140374e80
   140374a11:	42 f7 44 00 44 00 40 	test   DWORD PTR [rax+r8*1+0x44],0x4000
   140374a18:	00 00 
   140374a1a:	0f 85 60 04 00 00    	jne    0x140374e80
   140374a20:	4a 8b 7c 00 30       	mov    rdi,QWORD PTR [rax+r8*1+0x30]
   140374a25:	48 89 7c 24 40       	mov    QWORD PTR [rsp+0x40],rdi
   140374a2a:	48 85 ff             	test   rdi,rdi
   140374a2d:	0f 84 4d 04 00 00    	je     0x140374e80
   140374a33:	0f b7 8f 1c 02 00 00 	movzx  ecx,WORD PTR [rdi+0x21c]
   140374a3a:	66 85 c9             	test   cx,cx
   140374a3d:	0f 88 3d 04 00 00    	js     0x140374e80
   140374a43:	0f b7 c1             	movzx  eax,cx
   140374a46:	66 41 23 c6          	and    ax,r14w
   140374a4a:	66 83 f8 20          	cmp    ax,0x20
   140374a4e:	0f 85 2c 04 00 00    	jne    0x140374e80
   140374a54:	c0 e9 07             	shr    cl,0x7
   140374a57:	80 e1 01             	and    cl,0x1
   140374a5a:	41 3a cf             	cmp    cl,r15b
   140374a5d:	0f 85 1d 04 00 00    	jne    0x140374e80
   140374a63:	48 8b 47 08          	mov    rax,QWORD PTR [rdi+0x8]
   140374a67:	48 8b 4e 08          	mov    rcx,QWORD PTR [rsi+0x8]
   140374a6b:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   140374a6f:	0f 2e 01             	ucomiss xmm0,DWORD PTR [rcx]
   140374a72:	0f 8a 08 04 00 00    	jp     0x140374e80
   140374a78:	0f 85 02 04 00 00    	jne    0x140374e80
   140374a7e:	44 8b 26             	mov    r12d,DWORD PTR [rsi]
   140374a81:	b8 80 00 00 00       	mov    eax,0x80
   140374a86:	8b 4e 04             	mov    ecx,DWORD PTR [rsi+0x4]
   140374a89:	0f 57 e4             	xorps  xmm4,xmm4
   140374a8c:	44 0f b7 8e 1c 02 00 	movzx  r9d,WORD PTR [rsi+0x21c]
   140374a93:	00 
   140374a94:	44 8b d9             	mov    r11d,ecx
   140374a97:	44 0f b6 46 60       	movzx  r8d,BYTE PTR [rsi+0x60]
   140374a9c:	66 44 23 c8          	and    r9w,ax
   140374aa0:	41 0f b7 c1          	movzx  eax,r9w
   140374aa4:	66 44 89 8c 24 38 01 	mov    WORD PTR [rsp+0x138],r9w
   140374aab:	00 00 
   140374aad:	66 f7 d8             	neg    ax
   140374ab0:	44 89 64 24 30       	mov    DWORD PTR [rsp+0x30],r12d
   140374ab5:	8d 51 ff             	lea    edx,[rcx-0x1]
   140374ab8:	45 1b d2             	sbb    r10d,r10d
   140374abb:	8b c2                	mov    eax,edx
   140374abd:	41 3b d4             	cmp    edx,r12d
   140374ac0:	44 89 54 24 24       	mov    DWORD PTR [rsp+0x24],r10d
   140374ac5:	41 0f 4c c4          	cmovl  eax,r12d
   140374ac9:	45 2b dc             	sub    r11d,r12d
   140374acc:	66 45 85 c9          	test   r9w,r9w
   140374ad0:	44 89 5c 24 34       	mov    DWORD PTR [rsp+0x34],r11d
   140374ad5:	44 0f 45 d5          	cmovne r10d,ebp
   140374ad9:	3b c1                	cmp    eax,ecx
   140374adb:	44 89 54 24 20       	mov    DWORD PTR [rsp+0x20],r10d
   140374ae0:	0f 4c d0             	cmovl  edx,eax
   140374ae3:	41 8b c2             	mov    eax,r10d
   140374ae6:	41 0f af c3          	imul   eax,r11d
   140374aea:	03 d0                	add    edx,eax
   140374aec:	41 2b d4             	sub    edx,r12d
   140374aef:	45 85 c0             	test   r8d,r8d
   140374af2:	0f 84 24 01 00 00    	je     0x140374c1c
   140374af8:	44 8b 64 24 24       	mov    r12d,DWORD PTR [rsp+0x24]
   140374afd:	66 45 85 c9          	test   r9w,r9w
   140374b01:	45 8b fc             	mov    r15d,r12d
   140374b04:	4c 63 f2             	movsxd r14,edx
   140374b07:	44 0f 45 fd          	cmovne r15d,ebp
   140374b0b:	49 63 db             	movsxd rbx,r11d
   140374b0e:	48 83 c6 61          	add    rsi,0x61
   140374b12:	41 8b e8             	mov    ebp,r8d
   140374b15:	49 8b fd             	mov    rdi,r13
   140374b18:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140374b1f:	00 
   140374b20:	44 0f b6 06          	movzx  r8d,BYTE PTR [rsi]
   140374b24:	41 ff c8             	dec    r8d
   140374b27:	41 83 fc ff          	cmp    r12d,0xffffffff
   140374b2b:	74 07                	je     0x140374b34
   140374b2d:	45 3b e0             	cmp    r12d,r8d
   140374b30:	45 0f 4c c4          	cmovl  r8d,r12d
   140374b34:	4d 8b de             	mov    r11,r14
   140374b37:	45 8b d7             	mov    r10d,r15d
   140374b3a:	45 3b f8             	cmp    r15d,r8d
   140374b3d:	0f 8f b0 00 00 00    	jg     0x140374bf3
   140374b43:	41 8b c0             	mov    eax,r8d
   140374b46:	41 2b c7             	sub    eax,r15d
   140374b49:	ff c0                	inc    eax
   140374b4b:	83 f8 04             	cmp    eax,0x4
   140374b4e:	7c 70                	jl     0x140374bc0
