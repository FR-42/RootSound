
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140326510 <.text+0x325510>:
   140326510:	40 55                	rex push rbp
   140326512:	48 83 ec 30          	sub    rsp,0x30
   140326516:	48 89 5c 24 40       	mov    QWORD PTR [rsp+0x40],rbx
   14032651b:	48 8b d9             	mov    rbx,rcx
   14032651e:	48 89 74 24 48       	mov    QWORD PTR [rsp+0x48],rsi
   140326523:	49 8b f1             	mov    rsi,r9
   140326526:	48 89 7c 24 50       	mov    QWORD PTR [rsp+0x50],rdi
   14032652b:	41 8b f8             	mov    edi,r8d
   14032652e:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   140326533:	4c 8b f2             	mov    r14,rdx
   140326536:	4d 85 c9             	test   r9,r9
   140326539:	74 05                	je     0x140326540
   14032653b:	49 8b e9             	mov    rbp,r9
   14032653e:	eb 0f                	jmp    0x14032654f
   140326540:	45 33 c0             	xor    r8d,r8d
   140326543:	33 d2                	xor    edx,edx
   140326545:	8b cf                	mov    ecx,edi
   140326547:	e8 34 28 20 00       	call   0x140528d80
   14032654c:	48 8b e8             	mov    rbp,rax
   14032654f:	4c 8b c3             	mov    r8,rbx
   140326552:	49 8b d6             	mov    rdx,r14
   140326555:	48 8b cd             	mov    rcx,rbp
   140326558:	e8 f3 29 20 00       	call   0x140528f50
   14032655d:	f2 0f 10 0d 5b a2 52 	movsd  xmm1,QWORD PTR [rip+0x52a25b]        # 0x1408507c0
   140326564:	00 
   140326565:	45 33 d2             	xor    r10d,r10d
   140326568:	d1 ef                	shr    edi,1
   14032656a:	44 8d 5f ff          	lea    r11d,[rdi-0x1]
   14032656e:	41 83 fb 04          	cmp    r11d,0x4
   140326572:	0f 82 c7 00 00 00    	jb     0x14032663f
   140326578:	4c 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],r15
   14032657d:	45 8d 73 fd          	lea    r14d,[r11-0x3]
   140326581:	44 8d 7f 02          	lea    r15d,[rdi+0x2]
   140326585:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14032658c:	00 00 00 00 
   140326590:	47 8d 04 17          	lea    r8d,[r15+r10*1]
   140326594:	44 8b cf             	mov    r9d,edi
   140326597:	45 2b ca             	sub    r9d,r10d
   14032659a:	41 8d 48 ff          	lea    ecx,[r8-0x1]
   14032659e:	48 03 c9             	add    rcx,rcx
   1403265a1:	41 83 c2 04          	add    r10d,0x4
   1403265a5:	41 8d 51 ff          	lea    edx,[r9-0x1]
   1403265a9:	48 03 d2             	add    rdx,rdx
   1403265ac:	48 8b 04 d3          	mov    rax,QWORD PTR [rbx+rdx*8]
   1403265b0:	48 89 04 cb          	mov    QWORD PTR [rbx+rcx*8],rax
   1403265b4:	f2 0f 10 44 d3 08    	movsd  xmm0,QWORD PTR [rbx+rdx*8+0x8]
   1403265ba:	41 8d 51 fe          	lea    edx,[r9-0x2]
   1403265be:	0f 57 c1             	xorps  xmm0,xmm1
   1403265c1:	48 03 d2             	add    rdx,rdx
   1403265c4:	f2 0f 11 44 cb 08    	movsd  QWORD PTR [rbx+rcx*8+0x8],xmm0
   1403265ca:	41 8b c8             	mov    ecx,r8d
   1403265cd:	48 03 c9             	add    rcx,rcx
   1403265d0:	48 8b 04 d3          	mov    rax,QWORD PTR [rbx+rdx*8]
   1403265d4:	48 89 04 cb          	mov    QWORD PTR [rbx+rcx*8],rax
   1403265d8:	f2 0f 10 44 d3 08    	movsd  xmm0,QWORD PTR [rbx+rdx*8+0x8]
   1403265de:	41 8d 51 fd          	lea    edx,[r9-0x3]
   1403265e2:	0f 57 c1             	xorps  xmm0,xmm1
   1403265e5:	48 03 d2             	add    rdx,rdx
   1403265e8:	f2 0f 11 44 cb 08    	movsd  QWORD PTR [rbx+rcx*8+0x8],xmm0
   1403265ee:	41 8d 48 01          	lea    ecx,[r8+0x1]
   1403265f2:	48 03 c9             	add    rcx,rcx
   1403265f5:	48 8b 04 d3          	mov    rax,QWORD PTR [rbx+rdx*8]
   1403265f9:	48 89 04 cb          	mov    QWORD PTR [rbx+rcx*8],rax
   1403265fd:	f2 0f 10 44 d3 08    	movsd  xmm0,QWORD PTR [rbx+rdx*8+0x8]
   140326603:	41 8d 51 fc          	lea    edx,[r9-0x4]
   140326607:	0f 57 c1             	xorps  xmm0,xmm1
   14032660a:	48 03 d2             	add    rdx,rdx
   14032660d:	f2 0f 11 44 cb 08    	movsd  QWORD PTR [rbx+rcx*8+0x8],xmm0
   140326613:	41 8d 48 02          	lea    ecx,[r8+0x2]
   140326617:	48 03 c9             	add    rcx,rcx
   14032661a:	48 8b 04 d3          	mov    rax,QWORD PTR [rbx+rdx*8]
   14032661e:	48 89 04 cb          	mov    QWORD PTR [rbx+rcx*8],rax
   140326622:	f2 0f 10 44 d3 08    	movsd  xmm0,QWORD PTR [rbx+rdx*8+0x8]
   140326628:	0f 57 c1             	xorps  xmm0,xmm1
   14032662b:	f2 0f 11 44 cb 08    	movsd  QWORD PTR [rbx+rcx*8+0x8],xmm0
   140326631:	45 3b d6             	cmp    r10d,r14d
   140326634:	0f 82 56 ff ff ff    	jb     0x140326590
   14032663a:	4c 8b 7c 24 20       	mov    r15,QWORD PTR [rsp+0x20]
   14032663f:	4c 8b 74 24 28       	mov    r14,QWORD PTR [rsp+0x28]
   140326644:	45 3b d3             	cmp    r10d,r11d
   140326647:	73 39                	jae    0x140326682
   140326649:	44 8d 47 01          	lea    r8d,[rdi+0x1]
   14032664d:	45 03 c2             	add    r8d,r10d
   140326650:	8b d7                	mov    edx,edi
   140326652:	41 8b c8             	mov    ecx,r8d
   140326655:	41 2b d2             	sub    edx,r10d
   140326658:	48 03 c9             	add    rcx,rcx
   14032665b:	ff ca                	dec    edx
   14032665d:	41 ff c2             	inc    r10d
   140326660:	48 03 d2             	add    rdx,rdx
   140326663:	41 ff c0             	inc    r8d
   140326666:	48 8b 04 d3          	mov    rax,QWORD PTR [rbx+rdx*8]
   14032666a:	48 89 04 cb          	mov    QWORD PTR [rbx+rcx*8],rax
   14032666e:	f2 0f 10 44 d3 08    	movsd  xmm0,QWORD PTR [rbx+rdx*8+0x8]
   140326674:	0f 57 c1             	xorps  xmm0,xmm1
   140326677:	f2 0f 11 44 cb 08    	movsd  QWORD PTR [rbx+rcx*8+0x8],xmm0
   14032667d:	45 3b d3             	cmp    r10d,r11d
