
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140349600 <.text+0x348600>:
   140349600:	48 8b c4             	mov    rax,rsp
   140349603:	44 89 40 18          	mov    DWORD PTR [rax+0x18],r8d
   140349607:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14034960b:	53                   	push   rbx
   14034960c:	55                   	push   rbp
   14034960d:	56                   	push   rsi
   14034960e:	57                   	push   rdi
   14034960f:	41 54                	push   r12
   140349611:	41 55                	push   r13
   140349613:	41 56                	push   r14
   140349615:	41 57                	push   r15
   140349617:	48 81 ec f8 00 00 00 	sub    rsp,0xf8
   14034961e:	44 0f 29 74 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm14
   140349624:	be 01 00 00 00       	mov    esi,0x1
   140349629:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   14034962d:	44 8b f6             	mov    r14d,esi
   140349630:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   140349634:	8b ea                	mov    ebp,edx
   140349636:	44 0f 29 40 88       	movaps XMMWORD PTR [rax-0x78],xmm8
   14034963b:	48 8b f9             	mov    rdi,rcx
   14034963e:	44 0f 29 88 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm9
   140349645:	ff 
   140349646:	44 0f 29 90 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm10
   14034964d:	ff 
   14034964e:	44 0f 29 7c 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm15
   140349654:	89 50 20             	mov    DWORD PTR [rax+0x20],edx
   140349657:	4c 8b b9 a0 05 00 00 	mov    r15,QWORD PTR [rcx+0x5a0]
   14034965e:	f3 44 0f 10 0d 45 0b 	movss  xmm9,DWORD PTR [rip+0x640b45]        # 0x14098a1ac
   140349665:	64 00 
   140349667:	f2 0f 10 0d c1 4a 34 	movsd  xmm1,QWORD PTR [rip+0x344ac1]        # 0x14068e130
   14034966e:	00 
   14034966f:	41 0f 28 c1          	movaps xmm0,xmm9
   140349673:	f3 0f 59 05 95 da 34 	mulss  xmm0,DWORD PTR [rip+0x34da95]        # 0x140697110
   14034967a:	00 
   14034967b:	48 8b 99 98 05 00 00 	mov    rbx,QWORD PTR [rcx+0x598]
   140349682:	4c 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],r15
   140349687:	f3 0f 58 05 4d 69 50 	addss  xmm0,DWORD PTR [rip+0x50694d]        # 0x14084ffdc
   14034968e:	00 
   14034968f:	f3 0f 2c c0          	cvttss2si eax,xmm0
   140349693:	f2 0f 10 05 ad ec 35 	movsd  xmm0,QWORD PTR [rip+0x35ecad]        # 0x1406a8348
   14034969a:	00 
   14034969b:	3b c6                	cmp    eax,esi
   14034969d:	44 0f 4f f0          	cmovg  r14d,eax
   1403496a1:	44 89 74 24 48       	mov    DWORD PTR [rsp+0x48],r14d
   1403496a6:	e8 cf 76 2d 00       	call   0x140620d7a
   1403496ab:	f3 44 0f 59 0d 0c 69 	mulss  xmm9,DWORD PTR [rip+0x50690c]        # 0x14084ffc0
   1403496b2:	50 00 
   1403496b4:	45 0f 57 ff          	xorps  xmm15,xmm15
   1403496b8:	44 8b ee             	mov    r13d,esi
   1403496bb:	f2 0f 10 0d 6d 4a 34 	movsd  xmm1,QWORD PTR [rip+0x344a6d]        # 0x14068e130
   1403496c2:	00 
   1403496c3:	f2 44 0f 5a f8       	cvtsd2ss xmm15,xmm0
   1403496c8:	f3 44 0f 58 0d 0b 69 	addss  xmm9,DWORD PTR [rip+0x50690b]        # 0x14084ffdc
   1403496cf:	50 00 
   1403496d1:	f2 0f 10 05 67 ec 35 	movsd  xmm0,QWORD PTR [rip+0x35ec67]        # 0x1406a8340
   1403496d8:	00 
   1403496d9:	f3 44 0f 59 3d ce 4a 	mulss  xmm15,DWORD PTR [rip+0x344ace]        # 0x14068e1b0
   1403496e0:	34 00 
   1403496e2:	f3 41 0f 2c c1       	cvttss2si eax,xmm9
   1403496e7:	3b c6                	cmp    eax,esi
   1403496e9:	44 0f 4f e8          	cmovg  r13d,eax
   1403496ed:	44 89 6c 24 4c       	mov    DWORD PTR [rsp+0x4c],r13d
   1403496f2:	e8 83 76 2d 00       	call   0x140620d7a
   1403496f7:	48 63 35 e6 08 64 00 	movsxd rsi,DWORD PTR [rip+0x6408e6]        # 0x140989fe4
   1403496fe:	33 c9                	xor    ecx,ecx
   140349700:	f3 44 0f 10 35 d7 da 	movss  xmm14,DWORD PTR [rip+0x34dad7]        # 0x1406971e0
   140349707:	34 00 
   140349709:	45 0f 57 c0          	xorps  xmm8,xmm8
   14034970d:	f2 44 0f 10 0d 12 6a 	movsd  xmm9,QWORD PTR [rip+0x506a12]        # 0x140850128
   140349714:	50 00 
   140349716:	44 8b e1             	mov    r12d,ecx
   140349719:	f2 44 0f 5a c0       	cvtsd2ss xmm8,xmm0
   14034971e:	45 0f b7 0c 77       	movzx  r9d,WORD PTR [r15+rsi*2]
   140349723:	89 4c 24 2c          	mov    DWORD PTR [rsp+0x2c],ecx
   140349727:	66 44 89 8c 24 48 01 	mov    WORD PTR [rsp+0x148],r9w
   14034972e:	00 00 
   140349730:	45 0f 57 d2          	xorps  xmm10,xmm10
   140349734:	f3 44 0f 59 05 73 4a 	mulss  xmm8,DWORD PTR [rip+0x344a73]        # 0x14068e1b0
   14034973b:	34 00 
   14034973d:	f3 44 0f 11 44 24 40 	movss  DWORD PTR [rsp+0x40],xmm8
   140349744:	66 41 3b c9          	cmp    cx,r9w
   140349748:	0f 83 3d 07 00 00    	jae    0x140349e8b
   14034974e:	8b 94 24 50 01 00 00 	mov    edx,DWORD PTR [rsp+0x150]
   140349755:	44 8b f9             	mov    r15d,ecx
   140349758:	44 0f 29 9c 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm11
   14034975f:	00 00 
   140349761:	44 0f 29 a4 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm12
   140349768:	00 00 
   14034976a:	f3 44 0f 10 25 6d a8 	movss  xmm12,DWORD PTR [rip+0x35a86d]        # 0x1406a3fe0
   140349771:	35 00 
   140349773:	44 0f 29 6c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm13
   140349779:	f2                   	repnz
   14034977a:	44                   	rex.R
   14034977b:	0f                   	.byte 0xf
   14034977c:	10                   	.byte 0x10
   14034977d:	2d                   	.byte 0x2d
   14034977e:	a6                   	cmps   BYTE PTR [rsi],BYTE PTR [rdi]
   14034977f:	6a                   	.byte 0x6a
