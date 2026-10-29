
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014036e5a0 <.text+0x36d5a0>:
   14036e5a0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14036e5a5:	57                   	push   rdi
   14036e5a6:	48 83 ec 50          	sub    rsp,0x50
   14036e5aa:	48 8b 0d 8f 7d b9 14 	mov    rcx,QWORD PTR [rip+0x14b97d8f]        # 0x154f06340
   14036e5b1:	0f 29 74 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm6
   14036e5b6:	0f 29 7c 24 30       	movaps XMMWORD PTR [rsp+0x30],xmm7
   14036e5bb:	44 0f 29 44 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm8
   14036e5c1:	48 85 c9             	test   rcx,rcx
   14036e5c4:	74 05                	je     0x14036e5cb
   14036e5c6:	e8 8d cf 2a 00       	call   0x14061b558
   14036e5cb:	b9 00 00 02 00       	mov    ecx,0x20000
   14036e5d0:	e8 8b cf 2a 00       	call   0x14061b560
   14036e5d5:	66 0f 6f 35 43 1e 4e 	movdqa xmm6,XMMWORD PTR [rip+0x4e1e43]        # 0x140850420
   14036e5dc:	00 
   14036e5dd:	48 8b f8             	mov    rdi,rax
   14036e5e0:	0f 28 3d c9 20 4e 00 	movaps xmm7,XMMWORD PTR [rip+0x4e20c9]        # 0x1408506b0
   14036e5e7:	33 db                	xor    ebx,ebx
   14036e5e9:	44 0f 28 05 ef 01 34 	movaps xmm8,XMMWORD PTR [rip+0x3401ef]        # 0x1406ae7e0
   14036e5f0:	00 
   14036e5f1:	48 89 05 48 7d b9 14 	mov    QWORD PTR [rip+0x14b97d48],rax        # 0x154f06340
   14036e5f8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14036e5ff:	00 
   14036e600:	66 0f 6e cb          	movd   xmm1,ebx
   14036e604:	f3 0f 7e c6          	movq   xmm0,xmm6
   14036e608:	66 0f 70 c9 00       	pshufd xmm1,xmm1,0x0
   14036e60d:	66 0f fe c8          	paddd  xmm1,xmm0
   14036e611:	f3 0f e6 c1          	cvtdq2pd xmm0,xmm1
   14036e615:	66 0f 58 c7          	addpd  xmm0,xmm7
   14036e619:	66 41 0f 5e c0       	divpd  xmm0,xmm8
   14036e61e:	e8 cd dc 2a 00       	call   0x14061c2f0
   14036e623:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14036e627:	83 c3 02             	add    ebx,0x2
   14036e62a:	f2 0f 11 0f          	movsd  QWORD PTR [rdi],xmm1
   14036e62e:	48 83 c7 08          	add    rdi,0x8
   14036e632:	81 fb 00 80 00 00    	cmp    ebx,0x8000
   14036e638:	72 c6                	jb     0x14036e600
   14036e63a:	48 8b 5c 24 60       	mov    rbx,QWORD PTR [rsp+0x60]
   14036e63f:	0f 28 74 24 40       	movaps xmm6,XMMWORD PTR [rsp+0x40]
   14036e644:	0f 28 7c 24 30       	movaps xmm7,XMMWORD PTR [rsp+0x30]
   14036e649:	44 0f 28 44 24 20    	movaps xmm8,XMMWORD PTR [rsp+0x20]
   14036e64f:	48 83 c4 50          	add    rsp,0x50
   14036e653:	5f                   	pop    rdi
   14036e654:	c3                   	ret
