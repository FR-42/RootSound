
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140380410 <.text+0x37f410>:
   140380410:	40 55                	rex push rbp
   140380412:	56                   	push   rsi
   140380413:	57                   	push   rdi
   140380414:	41 55                	push   r13
   140380416:	41 57                	push   r15
   140380418:	48 83 ec 70          	sub    rsp,0x70
   14038041c:	4c 63 e9             	movsxd r13,ecx
   14038041f:	48 8d 2d aa a1 60 00 	lea    rbp,[rip+0x60a1aa]        # 0x14098a5d0
   140380426:	45 33 ff             	xor    r15d,r15d
   140380429:	4c 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],r13
   14038042e:	49 69 f5 78 ab 06 00 	imul   rsi,r13,0x6ab78
   140380435:	41 8b ff             	mov    edi,r15d
   140380438:	44 39 7c 2e 08       	cmp    DWORD PTR [rsi+rbp*1+0x8],r15d
   14038043d:	0f 86 c7 03 00 00    	jbe    0x14038080a
   140380443:	48 89 5c 24 68       	mov    QWORD PTR [rsp+0x68],rbx
   140380448:	0f 29 74 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm6
   14038044d:	0f 57 f6             	xorps  xmm6,xmm6
   140380450:	0f 29 7c 24 30       	movaps XMMWORD PTR [rsp+0x30],xmm7
   140380455:	0f 57 ff             	xorps  xmm7,xmm7
   140380458:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14038045f:	00 
   140380460:	8b c7                	mov    eax,edi
   140380462:	48 8d 1c c0          	lea    rbx,[rax+rax*8]
   140380466:	48 c1 e3 04          	shl    rbx,0x4
   14038046a:	48 03 1c 2e          	add    rbx,QWORD PTR [rsi+rbp*1]
   14038046e:	f3 0f 10 43 0c       	movss  xmm0,DWORD PTR [rbx+0xc]
   140380473:	0f 2f c6             	comiss xmm0,xmm6
   140380476:	76 03                	jbe    0x14038047b
   140380478:	0f 28 f0             	movaps xmm6,xmm0
   14038047b:	ba ff ff ff ff       	mov    edx,0xffffffff
   140380480:	45 33 c9             	xor    r9d,r9d
   140380483:	44 8b c2             	mov    r8d,edx
   140380486:	48 8b cb             	mov    rcx,rbx
   140380489:	e8 a2 04 ee ff       	call   0x140260930
   14038048e:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140380493:	ff c7                	inc    edi
   140380495:	89 43 28             	mov    DWORD PTR [rbx+0x28],eax
   140380498:	3b 7c 2e 08          	cmp    edi,DWORD PTR [rsi+rbp*1+0x8]
   14038049c:	72 c2                	jb     0x140380460
   14038049e:	0f 2e f7             	ucomiss xmm6,xmm7
   1403804a1:	7a 06                	jp     0x1403804a9
   1403804a3:	0f 84 52 03 00 00    	je     0x1403807fb
   1403804a9:	f3 0f 10 15 ef fd 4c 	movss  xmm2,DWORD PTR [rip+0x4cfdef]        # 0x1408502a0
   1403804b0:	00 
   1403804b1:	45 0f b7 c7          	movzx  r8d,r15w
   1403804b5:	4c 89 64 24 60       	mov    QWORD PTR [rsp+0x60],r12
   1403804ba:	45 0f b7 cf          	movzx  r9d,r15w
   1403804be:	4c 89 74 24 58       	mov    QWORD PTR [rsp+0x58],r14
   1403804c3:	45 8b e7             	mov    r12d,r15d
   1403804c6:	66 44 89 bc 24 a0 00 	mov    WORD PTR [rsp+0xa0],r15w
   1403804cd:	00 00 
   1403804cf:	41 ba 01 00 00 00    	mov    r10d,0x1
   1403804d5:	66 44 89 bc 24 a8 00 	mov    WORD PTR [rsp+0xa8],r15w
   1403804dc:	00 00 
   1403804de:	44 89 bc 24 b8 00 00 	mov    DWORD PTR [rsp+0xb8],r15d
   1403804e5:	00 
   1403804e6:	44 89 bc 24 b0 00 00 	mov    DWORD PTR [rsp+0xb0],r15d
   1403804ed:	00 
   1403804ee:	66 90                	xchg   ax,ax
   1403804f0:	41 8b ff             	mov    edi,r15d
   1403804f3:	66 44 3b bc 2e 60 41 	cmp    r15w,WORD PTR [rsi+rbp*1+0x64160]
   1403804fa:	06 00 
   1403804fc:	0f 83 6e 02 00 00    	jae    0x140380770
   140380502:	4c 8d 2d c7 a0 60 00 	lea    r13,[rip+0x60a0c7]        # 0x14098a5d0
   140380509:	49 8d ad 60 91 03 00 	lea    rbp,[r13+0x39160]
   140380510:	48 03 ee             	add    rbp,rsi
   140380513:	4c 8b f5             	mov    r14,rbp
   140380516:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14038051d:	00 00 00 
   140380520:	42 8b 5c 2e 08       	mov    ebx,DWORD PTR [rsi+r13*1+0x8]
   140380525:	45 32 db             	xor    r11b,r11b
   140380528:	45 0f b7 0e          	movzx  r9d,WORD PTR [r14]
   14038052c:	0f 28 cf             	movaps xmm1,xmm7
   14038052f:	85 db                	test   ebx,ebx
   140380531:	74 42                	je     0x140380575
   140380533:	4a 8b 0c 2e          	mov    rcx,QWORD PTR [rsi+r13*1]
   140380537:	44 8b c3             	mov    r8d,ebx
   14038053a:	48 83 c1 28          	add    rcx,0x28
   14038053e:	66 90                	xchg   ax,ax
   140380540:	48 8b 51 08          	mov    rdx,QWORD PTR [rcx+0x8]
   140380544:	66 44 39 4a 20       	cmp    WORD PTR [rdx+0x20],r9w
   140380549:	75 1d                	jne    0x140380568
   14038054b:	8b 01                	mov    eax,DWORD PTR [rcx]
   14038054d:	0f 57 c0             	xorps  xmm0,xmm0
   140380550:	f6 82 1c 02 00 00 80 	test   BYTE PTR [rdx+0x21c],0x80
   140380557:	45 0f b6 db          	movzx  r11d,r11b
   14038055b:	45 0f 45 da          	cmovne r11d,r10d
   14038055f:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140380564:	f3 0f 58 c8          	addss  xmm1,xmm0
   140380568:	48 81 c1 90 00 00 00 	add    rcx,0x90
   14038056f:	49 83 e8 01          	sub    r8,0x1
   140380573:	75 cb                	jne    0x140380540
   140380575:	45 32 d2             	xor    r10b,r10b
   140380578:	f3 0f 5e ce          	divss  xmm1,xmm6
   14038057c:	66 41 83 f9 1f       	cmp    r9w,0x1f
   140380581:	72 11                	jb     0x140380594
   140380583:	66 41 83 f9 21       	cmp    r9w,0x21
   140380588:	76 07                	jbe    0x140380591
   14038058a:	66 41 83 f9 24       	cmp    r9w,0x24
   14038058f:	75 03                	jne    0x140380594
   140380591:	41 b2 01             	mov    r10b,0x1
   140380594:	45 84 d2             	test   r10b,r10b
   140380597:	48 8d 8c 24 b8 00 00 	lea    rcx,[rsp+0xb8]
   14038059e:	00 
   14038059f:	48 8d 84 24 b0 00 00 	lea    rax,[rsp+0xb0]
   1403805a6:	00 
   1403805a7:	48 0f 44 c1          	cmove  rax,rcx
   1403805ab:	48 8d 94 24 a0 00 00 	lea    rdx,[rsp+0xa0]
   1403805b2:	00 
   1403805b3:	48 8d 8c 24 a8 00 00 	lea    rcx,[rsp+0xa8]
   1403805ba:	00 
   1403805bb:	48 0f 44 ca          	cmove  rcx,rdx
   1403805bf:	45 85 e4             	test   r12d,r12d
   1403805c2:	75 21                	jne    0x1403805e5
   1403805c4:	0f 2f 08             	comiss xmm1,DWORD PTR [rax]
   1403805c7:	0f 86 5e 01 00 00    	jbe    0x14038072b
   1403805cd:	66 41 83 f9 02       	cmp    r9w,0x2
   1403805d2:	0f 82 53 01 00 00    	jb     0x14038072b
   1403805d8:	f3 0f 11 08          	movss  DWORD PTR [rax],xmm1
   1403805dc:	66 44 89 09          	mov    WORD PTR [rcx],r9w
   1403805e0:	e9 46 01 00 00       	jmp    0x14038072b
   1403805e5:	45 84 db             	test   r11b,r11b
   1403805e8:	0f 85 3d 01 00 00    	jne    0x14038072b
   1403805ee:	66 44 39 39          	cmp    WORD PTR [rcx],r15w
   1403805f2:	0f 84 33 01 00 00    	je     0x14038072b
   1403805f8:	0f 2f d1             	comiss xmm2,xmm1
   1403805fb:	77 0a                	ja     0x140380607
   1403805fd:	66 45 85 c9          	test   r9w,r9w
   140380601:	0f 85 24 01 00 00    	jne    0x14038072b
   140380607:	41 8b d7             	mov    edx,r15d
   14038060a:	85 db                	test   ebx,ebx
   14038060c:	74 32                	je     0x140380640
   14038060e:	66 90                	xchg   ax,ax
   140380610:	8b c2                	mov    eax,edx
   140380612:	48 8d 0c c0          	lea    rcx,[rax+rax*8]
   140380616:	4a 8b 04 2e          	mov    rax,QWORD PTR [rsi+r13*1]
   14038061a:	48 03 c9             	add    rcx,rcx
   14038061d:	4c 8b 44 c8 30       	mov    r8,QWORD PTR [rax+rcx*8+0x30]
   140380622:	66 45 39 48 20       	cmp    WORD PTR [r8+0x20],r9w
   140380627:	75 0e                	jne    0x140380637
   140380629:	41 0f b6 c2          	movzx  eax,r10b
   14038062d:	f6 d8                	neg    al
   14038062f:	66 1b c9             	sbb    cx,cx
   140380632:	66 41 89 48 20       	mov    WORD PTR [r8+0x20],cx
   140380637:	ff c2                	inc    edx
   140380639:	42 3b 54 2e 08       	cmp    edx,DWORD PTR [rsi+r13*1+0x8]
   14038063e:	72 d0                	jb     0x140380610
   140380640:	42 0f b7 8c 2e 60 41 	movzx  ecx,WORD PTR [rsi+r13*1+0x64160]
   140380647:	06 00 
   140380649:	44 8b cf             	mov    r9d,edi
   14038064c:	8d 41 ff             	lea    eax,[rcx-0x1]
   14038064f:	3b f8                	cmp    edi,eax
   140380651:	0f 8d b8 00 00 00    	jge    0x14038070f
   140380657:	48 8b cd             	mov    rcx,rbp
   14038065a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140380660:	4c 8d 81 58 01 00 00 	lea    r8,[rcx+0x158]
   140380667:	ba 02 00 00 00       	mov    edx,0x2
   14038066c:	49 8b c0             	mov    rax,r8
   14038066f:	90                   	nop
   140380670:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   140380677:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   14038067a:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   14038067e:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   140380685:	0f 11 41 80          	movups XMMWORD PTR [rcx-0x80],xmm0
   140380689:	0f 10 40 a0          	movups xmm0,XMMWORD PTR [rax-0x60]
   14038068d:	0f 11 49 90          	movups XMMWORD PTR [rcx-0x70],xmm1
   140380691:	0f 10 48 b0          	movups xmm1,XMMWORD PTR [rax-0x50]
   140380695:	0f 11 41 a0          	movups XMMWORD PTR [rcx-0x60],xmm0
   140380699:	0f 10 40 c0          	movups xmm0,XMMWORD PTR [rax-0x40]
   14038069d:	0f 11 49 b0          	movups XMMWORD PTR [rcx-0x50],xmm1
   1403806a1:	0f 10 48 d0          	movups xmm1,XMMWORD PTR [rax-0x30]
   1403806a5:	0f 11 41 c0          	movups XMMWORD PTR [rcx-0x40],xmm0
   1403806a9:	0f 10 40 e0          	movups xmm0,XMMWORD PTR [rax-0x20]
   1403806ad:	0f 11 49 d0          	movups XMMWORD PTR [rcx-0x30],xmm1
   1403806b1:	0f 10 48 f0          	movups xmm1,XMMWORD PTR [rax-0x10]
   1403806b5:	0f 11 41 e0          	movups XMMWORD PTR [rcx-0x20],xmm0
   1403806b9:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   1403806bd:	48 83 ea 01          	sub    rdx,0x1
   1403806c1:	75 ad                	jne    0x140380670
   1403806c3:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   1403806c6:	41 ff c1             	inc    r9d
   1403806c9:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   1403806cd:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   1403806d0:	0f 10 40 20          	movups xmm0,XMMWORD PTR [rax+0x20]
   1403806d4:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   1403806d8:	0f 10 48 30          	movups xmm1,XMMWORD PTR [rax+0x30]
   1403806dc:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   1403806e0:	0f 10 40 40          	movups xmm0,XMMWORD PTR [rax+0x40]
   1403806e4:	48 8b 40 50          	mov    rax,QWORD PTR [rax+0x50]
   1403806e8:	0f 11 49 30          	movups XMMWORD PTR [rcx+0x30],xmm1
   1403806ec:	0f 11 41 40          	movups XMMWORD PTR [rcx+0x40],xmm0
   1403806f0:	48 89 41 50          	mov    QWORD PTR [rcx+0x50],rax
   1403806f4:	49 8b c8             	mov    rcx,r8
   1403806f7:	42 0f b7 94 2e 60 41 	movzx  edx,WORD PTR [rsi+r13*1+0x64160]
   1403806fe:	06 00 
   140380700:	8d 42 ff             	lea    eax,[rdx-0x1]
   140380703:	44 3b c8             	cmp    r9d,eax
   140380706:	0f 8c 54 ff ff ff    	jl     0x140380660
   14038070c:	0f b7 ca             	movzx  ecx,dx
   14038070f:	66 ff c9             	dec    cx
   140380712:	ff cf                	dec    edi
   140380714:	49 81 ee 58 01 00 00 	sub    r14,0x158
   14038071b:	66 42 89 8c 2e 60 41 	mov    WORD PTR [rsi+r13*1+0x64160],cx
   140380722:	06 00 
   140380724:	48 81 ed 58 01 00 00 	sub    rbp,0x158
   14038072b:	42 0f b7 84 2e 60 41 	movzx  eax,WORD PTR [rsi+r13*1+0x64160]
   140380732:	06 00 
   140380734:	ff c7                	inc    edi
   140380736:	49 81 c6 58 01 00 00 	add    r14,0x158
   14038073d:	48 81 c5 58 01 00 00 	add    rbp,0x158
   140380744:	41 ba 01 00 00 00    	mov    r10d,0x1
   14038074a:	3b f8                	cmp    edi,eax
   14038074c:	0f 8c ce fd ff ff    	jl     0x140380520
   140380752:	4c 8b 6c 24 20       	mov    r13,QWORD PTR [rsp+0x20]
   140380757:	48 8d 2d 72 9e 60 00 	lea    rbp,[rip+0x609e72]        # 0x14098a5d0
   14038075e:	44 0f b7 84 24 a0 00 	movzx  r8d,WORD PTR [rsp+0xa0]
   140380765:	00 00 
   140380767:	44 0f b7 8c 24 a8 00 	movzx  r9d,WORD PTR [rsp+0xa8]
   14038076e:	00 00 
   140380770:	45 85 e4             	test   r12d,r12d
   140380773:	75 0c                	jne    0x140380781
   140380775:	66 45 85 c0          	test   r8w,r8w
   140380779:	75 06                	jne    0x140380781
   14038077b:	66 45 85 c9          	test   r9w,r9w
   14038077f:	74 70                	je     0x1403807f1
   140380781:	41 ff c4             	inc    r12d
   140380784:	41 83 fc 01          	cmp    r12d,0x1
   140380788:	0f 8e 62 fd ff ff    	jle    0x1403804f0
   14038078e:	66 45 85 c0          	test   r8w,r8w
   140380792:	75 06                	jne    0x14038079a
   140380794:	66 45 85 c9          	test   r9w,r9w
   140380798:	74 57                	je     0x1403807f1
   14038079a:	4d 69 d5 78 ab 06 00 	imul   r10,r13,0x6ab78
   1403807a1:	45 39 7c 2a 08       	cmp    DWORD PTR [r10+rbp*1+0x8],r15d
   1403807a6:	76 49                	jbe    0x1403807f1
   1403807a8:	41 bb ff ff 00 00    	mov    r11d,0xffff
   1403807ae:	66 90                	xchg   ax,ax
   1403807b0:	49 8b 04 2a          	mov    rax,QWORD PTR [r10+rbp*1]
   1403807b4:	4b 8d 0c ff          	lea    rcx,[r15+r15*8]
   1403807b8:	48 03 c9             	add    rcx,rcx
   1403807bb:	48 8b 54 c8 30       	mov    rdx,QWORD PTR [rax+rcx*8+0x30]
   1403807c0:	0f b7 42 20          	movzx  eax,WORD PTR [rdx+0x20]
   1403807c4:	66 85 c0             	test   ax,ax
   1403807c7:	75 0d                	jne    0x1403807d6
   1403807c9:	66 45 85 c0          	test   r8w,r8w
   1403807cd:	74 18                	je     0x1403807e7
   1403807cf:	66 44 89 42 20       	mov    WORD PTR [rdx+0x20],r8w
   1403807d4:	eb 11                	jmp    0x1403807e7
   1403807d6:	66 41 3b c3          	cmp    ax,r11w
   1403807da:	75 0b                	jne    0x1403807e7
   1403807dc:	66 45 85 c9          	test   r9w,r9w
   1403807e0:	74 05                	je     0x1403807e7
   1403807e2:	66 44 89 4a 20       	mov    WORD PTR [rdx+0x20],r9w
   1403807e7:	41 ff c7             	inc    r15d
   1403807ea:	45 3b 7c 2a 08       	cmp    r15d,DWORD PTR [r10+rbp*1+0x8]
   1403807ef:	72 bf                	jb     0x1403807b0
   1403807f1:	4c 8b 74 24 58       	mov    r14,QWORD PTR [rsp+0x58]
   1403807f6:	4c 8b 64 24 60       	mov    r12,QWORD PTR [rsp+0x60]
   1403807fb:	0f 28 74 24 40       	movaps xmm6,XMMWORD PTR [rsp+0x40]
   140380800:	48 8b 5c 24 68       	mov    rbx,QWORD PTR [rsp+0x68]
   140380805:	0f 28 7c 24 30       	movaps xmm7,XMMWORD PTR [rsp+0x30]
   14038080a:	48 83 c4 70          	add    rsp,0x70
   14038080e:	41 5f                	pop    r15
   140380810:	41 5d                	pop    r13
   140380812:	5f                   	pop    rdi
   140380813:	5e                   	pop    rsi
   140380814:	5d                   	pop    rbp
   140380815:	c3                   	ret
   140380816:	cc                   	int3
   140380817:	cc                   	int3
   140380818:	cc                   	int3
   140380819:	cc                   	int3
   14038081a:	cc                   	int3
   14038081b:	cc                   	int3
   14038081c:	cc                   	int3
   14038081d:	cc                   	int3
   14038081e:	cc                   	int3
   14038081f:	cc                   	int3
   140380820:	48 83 ec 28          	sub    rsp,0x28
   140380824:	4c 8b d1             	mov    r10,rcx
   140380827:	45 85 c0             	test   r8d,r8d
   14038082a:	79 10                	jns    0x14038083c
   14038082c:	44 8b 05 7d 99 60 00 	mov    r8d,DWORD PTR [rip+0x60997d]        # 0x14098a1b0
   140380833:	45 85 c0             	test   r8d,r8d
   140380836:	0f 88 f6 00 00 00    	js     0x140380932
   14038083c:	44 3b 05 8d 05 63 14 	cmp    r8d,DWORD PTR [rip+0x1463058d]        # 0x1549b0dd0
   140380843:	0f 8d e9 00 00 00    	jge    0x140380932
   140380849:	48 89 5c 24 30       	mov    QWORD PTR [rsp+0x30],rbx
   14038084e:	48 89 6c 24 38       	mov    QWORD PTR [rsp+0x38],rbp
   140380853:	33 ed                	xor    ebp,ebp
   140380855:	49 63 c0             	movsxd rax,r8d
   140380858:	44 8b cd             	mov    r9d,ebp
   14038085b:	48 69 d8 78 ab 06 00 	imul   rbx,rax,0x6ab78
   140380862:	48 89 74 24 40       	mov    QWORD PTR [rsp+0x40],rsi
   140380867:	48 8d 35 62 9d 60 00 	lea    rsi,[rip+0x609d62]        # 0x14098a5d0
   14038086e:	66 3b ac 33 60 41 06 	cmp    bp,WORD PTR [rbx+rsi*1+0x64160]
   140380875:	00 
   140380876:	73 69                	jae    0x1403808e1
   140380878:	48 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],rdi
   14038087d:	48 8d 3c 33          	lea    rdi,[rbx+rsi*1]
   140380881:	41 8b c1             	mov    eax,r9d
   140380884:	48 69 c8 58 01 00 00 	imul   rcx,rax,0x158
   14038088b:	48 8b c5             	mov    rax,rbp
   14038088e:	4c 8d 1c 19          	lea    r11,[rcx+rbx*1]
   140380892:	4c 03 de             	add    r11,rsi
   140380895:	41 81 a3 6c 91 03 00 	and    DWORD PTR [r11+0x3916c],0xfffffbff
   14038089c:	ff fb ff ff 
   1403808a0:	48 85 d2             	test   rdx,rdx
   1403808a3:	74 27                	je     0x1403808cc
   1403808a5:	0f b7 8c 39 60 91 03 	movzx  ecx,WORD PTR [rcx+rdi*1+0x39160]
   1403808ac:	00 
   1403808ad:	0f 1f 00             	nop    DWORD PTR [rax]
   1403808b0:	66 41 3b 0c 42       	cmp    cx,WORD PTR [r10+rax*2]
   1403808b5:	74 0a                	je     0x1403808c1
   1403808b7:	48 ff c0             	inc    rax
   1403808ba:	48 3b c2             	cmp    rax,rdx
   1403808bd:	72 f1                	jb     0x1403808b0
   1403808bf:	eb 0b                	jmp    0x1403808cc
   1403808c1:	41 81 8b 6c 91 03 00 	or     DWORD PTR [r11+0x3916c],0x400
   1403808c8:	00 04 00 00 
   1403808cc:	0f b7 84 33 60 41 06 	movzx  eax,WORD PTR [rbx+rsi*1+0x64160]
   1403808d3:	00 
   1403808d4:	41 ff c1             	inc    r9d
   1403808d7:	44 3b c8             	cmp    r9d,eax
   1403808da:	72 a5                	jb     0x140380881
   1403808dc:	48 8b 7c 24 20       	mov    rdi,QWORD PTR [rsp+0x20]
   1403808e1:	e8 fa 35 00 00       	call   0x140383ee0
   1403808e6:	33 d2                	xor    edx,edx
   1403808e8:	b1 ff                	mov    cl,0xff
   1403808ea:	e8 31 52 08 00       	call   0x140405b20
   1403808ef:	b2 01                	mov    dl,0x1
   1403808f1:	33 c9                	xor    ecx,ecx
   1403808f3:	e8 68 7d 09 00       	call   0x140418660
   1403808f8:	33 d2                	xor    edx,edx
   1403808fa:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   1403808ff:	e8 2c 13 11 00       	call   0x140491c30
   140380904:	e8 c7 f8 0b 00       	call   0x1404401d0
   140380909:	b1 01                	mov    cl,0x1
   14038090b:	e8 10 9c 0a 00       	call   0x14042a520
   140380910:	ba ff ff ff ff       	mov    edx,0xffffffff
   140380915:	c6 05 c4 88 5b 00 01 	mov    BYTE PTR [rip+0x5b88c4],0x1        # 0x1409391e0
   14038091c:	33 c9                	xor    ecx,ecx
   14038091e:	e8 0d 61 f6 ff       	call   0x1402e6a30
   140380923:	48 8b 74 24 40       	mov    rsi,QWORD PTR [rsp+0x40]
   140380928:	48 8b 6c 24 38       	mov    rbp,QWORD PTR [rsp+0x38]
   14038092d:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   140380932:	48 83 c4 28          	add    rsp,0x28
   140380936:	c3                   	ret
   140380937:	cc                   	int3
   140380938:	cc                   	int3
   140380939:	cc                   	int3
   14038093a:	cc                   	int3
   14038093b:	cc                   	int3
   14038093c:	cc                   	int3
   14038093d:	cc                   	int3
   14038093e:	cc                   	int3
   14038093f:	cc                   	int3
   140380940:	8b 05 d6 86 5b 00    	mov    eax,DWORD PTR [rip+0x5b86d6]        # 0x14093901c
   140380946:	83 f8 08             	cmp    eax,0x8
   140380949:	74 33                	je     0x14038097e
   14038094b:	83 f8 40             	cmp    eax,0x40
   14038094e:	74 2e                	je     0x14038097e
   140380950:	85 c9                	test   ecx,ecx
   140380952:	79 0a                	jns    0x14038095e
   140380954:	8b 0d 56 98 60 00    	mov    ecx,DWORD PTR [rip+0x609856]        # 0x14098a1b0
   14038095a:	85 c9                	test   ecx,ecx
   14038095c:	78 20                	js     0x14038097e
   14038095e:	3b 0d 6c 04 63 14    	cmp    ecx,DWORD PTR [rip+0x1463046c]        # 0x1549b0dd0
   140380964:	7d 18                	jge    0x14038097e
   140380966:	48 63 c1             	movsxd rax,ecx
   140380969:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140380970:	48 8d 05 a4 2d 64 00 	lea    rax,[rip+0x642da4]        # 0x1409c371b
   140380977:	0f b6 04 01          	movzx  eax,BYTE PTR [rcx+rax*1]
   14038097b:	24 01                	and    al,0x1
   14038097d:	c3                   	ret
   14038097e:	32 c0                	xor    al,al
   140380980:	c3                   	ret
   140380981:	cc                   	int3
   140380982:	cc                   	int3
   140380983:	cc                   	int3
   140380984:	cc                   	int3
   140380985:	cc                   	int3
   140380986:	cc                   	int3
   140380987:	cc                   	int3
   140380988:	cc                   	int3
   140380989:	cc                   	int3
   14038098a:	cc                   	int3
   14038098b:	cc                   	int3
   14038098c:	cc                   	int3
   14038098d:	cc                   	int3
   14038098e:	cc                   	int3
   14038098f:	cc                   	int3
   140380990:	48 83 ec 28          	sub    rsp,0x28
   140380994:	85 d2                	test   edx,edx
   140380996:	79 0a                	jns    0x1403809a2
   140380998:	8b 15 12 98 60 00    	mov    edx,DWORD PTR [rip+0x609812]        # 0x14098a1b0
   14038099e:	85 d2                	test   edx,edx
   1403809a0:	78 5a                	js     0x1403809fc
   1403809a2:	3b 15 28 04 63 14    	cmp    edx,DWORD PTR [rip+0x14630428]        # 0x1549b0dd0
   1403809a8:	7d 52                	jge    0x1403809fc
   1403809aa:	48 63 c2             	movsxd rax,edx
   1403809ad:	4c 8d 05 66 2d 64 00 	lea    r8,[rip+0x642d66]        # 0x1409c371a
   1403809b4:	48 69 d0 78 ab 06 00 	imul   rdx,rax,0x6ab78
   1403809bb:	41 b9 ff fe 00 00    	mov    r9d,0xfeff
   1403809c1:	42 0f b7 04 02       	movzx  eax,WORD PTR [rdx+r8*1]
   1403809c6:	66 41 23 c1          	and    ax,r9w
   1403809ca:	66 42 89 04 02       	mov    WORD PTR [rdx+r8*1],ax
   1403809cf:	84 c9                	test   cl,cl
   1403809d1:	74 0d                	je     0x1403809e0
   1403809d3:	b9 00 01 00 00       	mov    ecx,0x100
   1403809d8:	66 0b c1             	or     ax,cx
   1403809db:	66 42 89 04 02       	mov    WORD PTR [rdx+r8*1],ax
   1403809e0:	ba ff ff ff ff       	mov    edx,0xffffffff
   1403809e5:	c6 05 e1 c9 44 17 01 	mov    BYTE PTR [rip+0x1744c9e1],0x1        # 0x1577cd3cd
   1403809ec:	33 c9                	xor    ecx,ecx
   1403809ee:	e8 3d 60 f6 ff       	call   0x1402e6a30
   1403809f3:	48 83 c4 28          	add    rsp,0x28
   1403809f7:	e9 d4 f7 0b 00       	jmp    0x1404401d0
   1403809fc:	48 83 c4 28          	add    rsp,0x28
   140380a00:	c3                   	ret
   140380a01:	cc                   	int3
   140380a02:	cc                   	int3
   140380a03:	cc                   	int3
   140380a04:	cc                   	int3
   140380a05:	cc                   	int3
   140380a06:	cc                   	int3
   140380a07:	cc                   	int3
   140380a08:	cc                   	int3
   140380a09:	cc                   	int3
   140380a0a:	cc                   	int3
   140380a0b:	cc                   	int3
   140380a0c:	cc                   	int3
   140380a0d:	cc                   	int3
   140380a0e:	cc                   	int3
   140380a0f:	cc                   	int3
   140380a10:	85 c9                	test   ecx,ecx
   140380a12:	79 0a                	jns    0x140380a1e
   140380a14:	8b 0d 96 97 60 00    	mov    ecx,DWORD PTR [rip+0x609796]        # 0x14098a1b0
   140380a1a:	85 c9                	test   ecx,ecx
   140380a1c:	78 2c                	js     0x140380a4a
   140380a1e:	3b 0d ac 03 63 14    	cmp    ecx,DWORD PTR [rip+0x146303ac]        # 0x1549b0dd0
   140380a24:	7d 24                	jge    0x140380a4a
   140380a26:	33 d2                	xor    edx,edx
   140380a28:	48 63 c1             	movsxd rax,ecx
   140380a2b:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140380a32:	38 15 ad c9 44 17    	cmp    BYTE PTR [rip+0x1744c9ad],dl        # 0x1577cd3e5
   140380a38:	48 8d 05 f1 dc 66 00 	lea    rax,[rip+0x66dcf1]        # 0x1409ee730
   140380a3f:	0f 94 c2             	sete   dl
   140380a42:	0f b7 04 01          	movzx  eax,WORD PTR [rcx+rax*1]
   140380a46:	66 03 c2             	add    ax,dx
   140380a49:	c3                   	ret
   140380a4a:	33 d2                	xor    edx,edx
   140380a4c:	0f b7 c2             	movzx  eax,dx
   140380a4f:	c3                   	ret
   140380a50:	cc                   	int3
   140380a51:	cc                   	int3
   140380a52:	cc                   	int3
   140380a53:	cc                   	int3
   140380a54:	cc                   	int3
   140380a55:	cc                   	int3
   140380a56:	cc                   	int3
   140380a57:	cc                   	int3
   140380a58:	cc                   	int3
   140380a59:	cc                   	int3
   140380a5a:	cc                   	int3
   140380a5b:	cc                   	int3
   140380a5c:	cc                   	int3
   140380a5d:	cc                   	int3
   140380a5e:	cc                   	int3
   140380a5f:	cc                   	int3
   140380a60:	48 83 ec 68          	sub    rsp,0x68
   140380a64:	80 3d 7a c9 44 17 00 	cmp    BYTE PTR [rip+0x1744c97a],0x0        # 0x1577cd3e5
   140380a6b:	0f 29 74 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm6
   140380a70:	0f 28 f0             	movaps xmm6,xmm0
   140380a73:	0f 29 7c 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm7
   140380a78:	0f 28 f9             	movaps xmm7,xmm1
   140380a7b:	0f 85 e5 01 00 00    	jne    0x140380c66
   140380a81:	8b 0d 95 85 5b 00    	mov    ecx,DWORD PTR [rip+0x5b8595]        # 0x14093901c
   140380a87:	83 f9 40             	cmp    ecx,0x40
   140380a8a:	74 4f                	je     0x140380adb
   140380a8c:	48 63 05 1d 97 60 00 	movsxd rax,DWORD PTR [rip+0x60971d]        # 0x14098a1b0
   140380a93:	83 f9 08             	cmp    ecx,0x8
   140380a96:	74 43                	je     0x140380adb
   140380a98:	85 c0                	test   eax,eax
   140380a9a:	78 3f                	js     0x140380adb
   140380a9c:	3b 05 2e 03 63 14    	cmp    eax,DWORD PTR [rip+0x1463032e]        # 0x1549b0dd0
   140380aa2:	7d 37                	jge    0x140380adb
   140380aa4:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140380aab:	48 8d 15 1e 9b 60 00 	lea    rdx,[rip+0x609b1e]        # 0x14098a5d0
   140380ab2:	0f b6 84 11 4b 91 03 	movzx  eax,BYTE PTR [rcx+rdx*1+0x3914b]
   140380ab9:	00 
   140380aba:	24 01                	and    al,0x1
   140380abc:	74 1d                	je     0x140380adb
   140380abe:	66 83 bc 11 60 41 06 	cmp    WORD PTR [rcx+rdx*1+0x64160],0x0
   140380ac5:	00 00 
   140380ac7:	76 12                	jbe    0x140380adb
   140380ac9:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   140380ace:	e8 fd ec ff ff       	call   0x14037f7d0
   140380ad3:	85 c0                	test   eax,eax
   140380ad5:	0f 88 8b 01 00 00    	js     0x140380c66
   140380adb:	0f 57 c0             	xorps  xmm0,xmm0
   140380ade:	0f 2e f8             	ucomiss xmm7,xmm0
   140380ae1:	7a 05                	jp     0x140380ae8
   140380ae3:	75 03                	jne    0x140380ae8
   140380ae5:	0f 28 fe             	movaps xmm7,xmm6
   140380ae8:	f3 0f 58 35 00 f8 4c 	addss  xmm6,DWORD PTR [rip+0x4cf800]        # 0x1408502f0
   140380aef:	00 
   140380af0:	f3 0f 58 3d 38 f5 4c 	addss  xmm7,DWORD PTR [rip+0x4cf538]        # 0x140850030
   140380af7:	00 
   140380af8:	0f 2f 35 dd 8b 5b 00 	comiss xmm6,DWORD PTR [rip+0x5b8bdd]        # 0x1409396dc
   140380aff:	72                   	.byte 0x72
