
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031f500 <.text+0x31e500>:
   14031f500:	64 ab                	fs stos DWORD PTR [rdi],eax
   14031f502:	66 00 48 85          	data16 add BYTE PTR [rax-0x7b],cl
   14031f506:	c0 74 1e 48 83       	shl    BYTE PTR [rsi+rbx*1+0x48],0x83
   14031f50b:	3d 5f ab 66 00       	cmp    eax,0x66ab5f
   14031f510:	00 74 14 33          	add    BYTE PTR [rsp+rdx*1+0x33],dh
   14031f514:	d2 48 8b             	ror    BYTE PTR [rax-0x75],cl
   14031f517:	cd e8                	int    0xe8
   14031f519:	e3 25                	jrcxz  0x14031f540
   14031f51b:	21 00                	and    DWORD PTR [rax],eax
   14031f51d:	41 83 ee 01          	sub    r14d,0x1
   14031f521:	0f 89 89 fe ff ff    	jns    0x14031f3b0
   14031f527:	48 8b cd             	mov    rcx,rbp
   14031f52a:	e8 c1 24 21 00       	call   0x1405319f0
   14031f52f:	44 0f 28 4c 24 70    	movaps xmm9,XMMWORD PTR [rsp+0x70]
   14031f535:	44 0f 28 84 24 80 00 	movaps xmm8,XMMWORD PTR [rsp+0x80]
   14031f53c:	00 00 
   14031f53e:	0f 28 b4 24 a0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xa0]
   14031f545:	00 
   14031f546:	4c 8b bc 24 b0 00 00 	mov    r15,QWORD PTR [rsp+0xb0]
   14031f54d:	00 
   14031f54e:	4c 8b b4 24 b8 00 00 	mov    r14,QWORD PTR [rsp+0xb8]
   14031f555:	00 
   14031f556:	4c 8b ac 24 c0 00 00 	mov    r13,QWORD PTR [rsp+0xc0]
   14031f55d:	00 
   14031f55e:	4c 8b a4 24 c8 00 00 	mov    r12,QWORD PTR [rsp+0xc8]
   14031f565:	00 
   14031f566:	48 8b ac 24 00 01 00 	mov    rbp,QWORD PTR [rsp+0x100]
   14031f56d:	00 
   14031f56e:	0f 28 bc 24 90 00 00 	movaps xmm7,XMMWORD PTR [rsp+0x90]
   14031f575:	00 
   14031f576:	48 8b 4c 24 60       	mov    rcx,QWORD PTR [rsp+0x60]
   14031f57b:	48 33 cc             	xor    rcx,rsp
   14031f57e:	e8 7d c0 2f 00       	call   0x14061b600
   14031f583:	48 81 c4 d0 00 00 00 	add    rsp,0xd0
   14031f58a:	5f                   	pop    rdi
   14031f58b:	5e                   	pop    rsi
   14031f58c:	5b                   	pop    rbx
   14031f58d:	c3                   	ret
   14031f58e:	cc                   	int3
   14031f58f:	cc                   	int3
   14031f590:	cc                   	int3
   14031f591:	cc                   	int3
   14031f592:	cc                   	int3
   14031f593:	cc                   	int3
   14031f594:	cc                   	int3
   14031f595:	cc                   	int3
   14031f596:	cc                   	int3
   14031f597:	cc                   	int3
   14031f598:	cc                   	int3
   14031f599:	cc                   	int3
   14031f59a:	cc                   	int3
   14031f59b:	cc                   	int3
   14031f59c:	cc                   	int3
   14031f59d:	cc                   	int3
   14031f59e:	cc                   	int3
   14031f59f:	cc                   	int3
   14031f5a0:	48 8b c4             	mov    rax,rsp
   14031f5a3:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   14031f5a7:	48 89 68 10          	mov    QWORD PTR [rax+0x10],rbp
   14031f5ab:	48 89 70 18          	mov    QWORD PTR [rax+0x18],rsi
   14031f5af:	57                   	push   rdi
   14031f5b0:	48 81 ec a0 00 00 00 	sub    rsp,0xa0
   14031f5b7:	f3 0f 10 05 b9 84 38 	movss  xmm0,DWORD PTR [rip+0x3884b9]        # 0x1406a7a78
   14031f5be:	00 
   14031f5bf:	0f 57 c9             	xorps  xmm1,xmm1
   14031f5c2:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6
   14031f5c6:	0f b6 f1             	movzx  esi,cl
   14031f5c9:	f3 0f 10 35 0b 0a 53 	movss  xmm6,DWORD PTR [rip+0x530a0b]        # 0x14084ffdc
   14031f5d0:	00 
   14031f5d1:	48 8b 0d 18 aa 66 00 	mov    rcx,QWORD PTR [rip+0x66aa18]        # 0x140989ff0
   14031f5d8:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7
   14031f5dc:	44 0f 29 40 c8       	movaps XMMWORD PTR [rax-0x38],xmm8
   14031f5e1:	44 0f 29 48 b8       	movaps XMMWORD PTR [rax-0x48],xmm9
   14031f5e6:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   14031f5eb:	44 0f 29 58 98       	movaps XMMWORD PTR [rax-0x68],xmm11
   14031f5f0:	44 0f 29 60 88       	movaps XMMWORD PTR [rax-0x78],xmm12
   14031f5f5:	8b 05 59 ab 66 00    	mov    eax,DWORD PTR [rip+0x66ab59]        # 0x14098a154
   14031f5fb:	f3 0f 11 05 a1 1a 69 	movss  DWORD PTR [rip+0x14691aa1],xmm0        # 0x1549b10a4
   14031f602:	14 
   14031f603:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   14031f608:	f3 0f 59 ce          	mulss  xmm1,xmm6
   14031f60c:	f3 0f 5d 0d e4 84 38 	minss  xmm1,DWORD PTR [rip+0x3884e4]        # 0x1406a7af8
   14031f613:	00 
   14031f614:	f3 0f 11 0d 8c 1a 69 	movss  DWORD PTR [rip+0x14691a8c],xmm1        # 0x1549b10a8
   14031f61b:	14 
   14031f61c:	48 85 c9             	test   rcx,rcx
   14031f61f:	74 05                	je     0x14031f626
   14031f621:	e8 3a 57 2f 00       	call   0x140614d60
   14031f626:	f3 0f 10 05 7e ab 66 	movss  xmm0,DWORD PTR [rip+0x66ab7e]        # 0x14098a1ac
   14031f62d:	00 
   14031f62e:	bf 01 00 00 00       	mov    edi,0x1
   14031f633:	f3 0f 59 05 9d 82 38 	mulss  xmm0,DWORD PTR [rip+0x38829d]        # 0x1406a78d8
   14031f63a:	00 
   14031f63b:	8b cf                	mov    ecx,edi
   14031f63d:	f3 0f 58 c6          	addss  xmm0,xmm6
   14031f641:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14031f645:	3b c1                	cmp    eax,ecx
   14031f647:	0f 4f c8             	cmovg  ecx,eax
   14031f64a:	0f af 0d 57 ab 66 00 	imul   ecx,DWORD PTR [rip+0x66ab57]        # 0x14098a1a8
   14031f651:	03 c9                	add    ecx,ecx
   14031f653:	89 0d 93 a9 66 00    	mov    DWORD PTR [rip+0x66a993],ecx        # 0x140989fec
   14031f659:	e8 e2 59 2f 00       	call   0x140615040
   14031f65e:	8b 15 88 a9 66 00    	mov    edx,DWORD PTR [rip+0x66a988]        # 0x140989fec
   14031f664:	48 8b c8             	mov    rcx,rax
   14031f667:	48 89 05 82 a9 66 00 	mov    QWORD PTR [rip+0x66a982],rax        # 0x140989ff0
   14031f66e:	e8 1d 55 2f 00       	call   0x140614b90
   14031f673:	8b 1d db aa 66 00    	mov    ebx,DWORD PTR [rip+0x66aadb]        # 0x14098a154
   14031f679:	0f 57 db             	xorps  xmm3,xmm3
   14031f67c:	41 b8 02 00 00 00    	mov    r8d,0x2
   14031f682:	b8 04 00 00 00       	mov    eax,0x4
   14031f687:	41 8b c8             	mov    ecx,r8d
   14031f68a:	f3 48 0f 2a db       	cvtsi2ss xmm3,rbx
   14031f68f:	0f 28 c3             	movaps xmm0,xmm3
   14031f692:	f3 0f 5e 05 0a 7b 37 	divss  xmm0,DWORD PTR [rip+0x377b0a]        # 0x1406971a4
   14031f699:	00 
   14031f69a:	f3 0f 58 05 66 82 38 	addss  xmm0,DWORD PTR [rip+0x388266]        # 0x1406a7908
   14031f6a1:	00 
   14031f6a2:	f3 48 0f 2c d0       	cvttss2si rdx,xmm0
   14031f6a7:	3b c2                	cmp    eax,edx
   14031f6a9:	77 0c                	ja     0x14031f6b7
   14031f6ab:	44 8b c0             	mov    r8d,eax
   14031f6ae:	ff c1                	inc    ecx
   14031f6b0:	d1 c0                	rol    eax,1
   14031f6b2:	83 f9 10             	cmp    ecx,0x10
   14031f6b5:	72 f0                	jb     0x14031f6a7
   14031f6b7:	44 8b 0d ea aa 66 00 	mov    r9d,DWORD PTR [rip+0x66aaea]        # 0x14098a1a8
   14031f6be:	0f 57 c0             	xorps  xmm0,xmm0
   14031f6c1:	44 0f b6 15 48 a8 66 	movzx  r10d,BYTE PTR [rip+0x66a848]        # 0x140989f11
   14031f6c8:	00 
   14031f6c9:	0f 28 cb             	movaps xmm1,xmm3
   14031f6cc:	f3 44 0f 10 25 83 96 	movss  xmm12,DWORD PTR [rip+0x379683]        # 0x140698d58
   14031f6d3:	37 00 
   14031f6d5:	f3 44 0f 10 1d 32 7b 	movss  xmm11,DWORD PTR [rip+0x377b32]        # 0x140697210
   14031f6dc:	37 00 
   14031f6de:	f3 0f 59 ce          	mulss  xmm1,xmm6
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
   14031f72f:	f3                   	repz
