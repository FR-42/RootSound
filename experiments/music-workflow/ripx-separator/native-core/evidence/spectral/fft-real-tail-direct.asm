
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140529388 <.text+0x528388>:
   140529388:	49 3b db             	cmp    rbx,r11
   14052938b:	0f 8f c7 00 00 00    	jg     0x140529458
   140529391:	4c 2b d3             	sub    r10,rbx
   140529394:	48 8b cb             	mov    rcx,rbx
   140529397:	48 c1 e1 04          	shl    rcx,0x4
   14052939b:	4c 2b db             	sub    r11,rbx
   14052939e:	49 c1 e2 04          	shl    r10,0x4
   1405293a2:	49 ff c3             	inc    r11
   1405293a5:	48 8b 46 08          	mov    rax,QWORD PTR [rsi+0x8]
   1405293a9:	f2 0f 10 7c 01 08    	movsd  xmm7,QWORD PTR [rcx+rax*1+0x8]
   1405293af:	f2 41 0f 10 4c 02 08 	movsd  xmm1,QWORD PTR [r10+rax*1+0x8]
   1405293b6:	f2 0f 10 24 01       	movsd  xmm4,QWORD PTR [rcx+rax*1]
   1405293bb:	41 0f 57 c9          	xorps  xmm1,xmm9
   1405293bf:	f2 41 0f 10 34 02    	movsd  xmm6,QWORD PTR [r10+rax*1]
   1405293c5:	0f 28 e9             	movaps xmm5,xmm1
   1405293c8:	f2 0f 58 ef          	addsd  xmm5,xmm7
   1405293cc:	f2 0f 5c f9          	subsd  xmm7,xmm1
   1405293d0:	f2 0f 58 f4          	addsd  xmm6,xmm4
   1405293d4:	f2 41 0f 5c 24 02    	subsd  xmm4,QWORD PTR [r10+rax*1]
   1405293da:	48 8b 46 10          	mov    rax,QWORD PTR [rsi+0x10]
   1405293de:	0f 28 c7             	movaps xmm0,xmm7
   1405293e1:	f2 0f 59 44 01 f8    	mulsd  xmm0,QWORD PTR [rcx+rax*1-0x8]
   1405293e7:	0f 28 dc             	movaps xmm3,xmm4
   1405293ea:	f2 0f 59 7c 01 f0    	mulsd  xmm7,QWORD PTR [rcx+rax*1-0x10]
   1405293f0:	f2 0f 59 5c 01 f0    	mulsd  xmm3,QWORD PTR [rcx+rax*1-0x10]
   1405293f6:	f2 0f 59 64 01 f8    	mulsd  xmm4,QWORD PTR [rcx+rax*1-0x8]
   1405293fc:	f2 0f 5c d8          	subsd  xmm3,xmm0
   140529400:	f2 0f 58 fc          	addsd  xmm7,xmm4
   140529404:	0f 28 c3             	movaps xmm0,xmm3
   140529407:	f2 0f 58 c6          	addsd  xmm0,xmm6
   14052940b:	0f 28 cf             	movaps xmm1,xmm7
   14052940e:	f2 0f 5c f3          	subsd  xmm6,xmm3
   140529412:	f2 0f 58 cd          	addsd  xmm1,xmm5
   140529416:	f2 0f 5c fd          	subsd  xmm7,xmm5
   14052941a:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14052941f:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   140529424:	f2 41 0f 59 f0       	mulsd  xmm6,xmm8
   140529429:	f2 0f 11 04 39       	movsd  QWORD PTR [rcx+rdi*1],xmm0
   14052942e:	f2 0f 11 4c 39 08    	movsd  QWORD PTR [rcx+rdi*1+0x8],xmm1
   140529434:	48 83 c1 10          	add    rcx,0x10
   140529438:	f2 41 0f 59 f8       	mulsd  xmm7,xmm8
   14052943d:	f2 41 0f 11 34 3a    	movsd  QWORD PTR [r10+rdi*1],xmm6
   140529443:	f2 41 0f 11 7c 3a 08 	movsd  QWORD PTR [r10+rdi*1+0x8],xmm7
   14052944a:	49 83 ea 10          	sub    r10,0x10
   14052944e:	49 83 eb 01          	sub    r11,0x1
   140529452:	0f 85 4d ff ff ff    	jne    0x1405293a5
   140529458:	44 0f 28 44 24 40    	movaps xmm8,XMMWORD PTR [rsp+0x40]
   14052945e:	0f 28 7c 24 50       	movaps xmm7,XMMWORD PTR [rsp+0x50]
   140529463:	0f 28 74 24 60       	movaps xmm6,XMMWORD PTR [rsp+0x60]
   140529468:	44 0f 28 4c 24 30    	movaps xmm9,XMMWORD PTR [rsp+0x30]
   14052946e:	48 81 c4 90 00 00 00 	add    rsp,0x90
   140529475:	5f                   	pop    rdi
   140529476:	5e                   	pop    rsi
   140529477:	5b                   	pop    rbx
   140529478:	c3                   	ret
   140529479:	cc                   	int3
   14052947a:	cc                   	int3
   14052947b:	cc                   	int3
   14052947c:	cc                   	int3
   14052947d:	cc                   	int3
   14052947e:	cc                   	int3
   14052947f:	cc                   	int3
   140529480:	4c 89 44 24 18       	mov    QWORD PTR [rsp+0x18],r8
   140529485:	53                   	push   rbx
   140529486:	56                   	push   rsi
   140529487:	48 81 ec 88 00 00 00 	sub    rsp,0x88
   14052948e:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140529491:	4d 8b c8             	mov    r9,r8
   140529494:	48 8b da             	mov    rbx,rdx
   140529497:	4c 8b d9             	mov    r11,rcx
   14052949a:	83 78 04 00          	cmp    DWORD PTR [rax+0x4],0x0
   14052949e:	75 26                	jne    0x1405294c6
   1405294a0:	b9 02 00 00 00       	mov    ecx,0x2
   1405294a5:	ff 15 8d 08 16 00    	call   QWORD PTR [rip+0x16088d]        # 0x140689d38
   1405294ab:	48 8b c8             	mov    rcx,rax
   1405294ae:	48 8d 15 93 1e 44 00 	lea    rdx,[rip+0x441e93]        # 0x14096b348
   1405294b5:	e8 76 52 c0 ff       	call   0x14012e730
   1405294ba:	b9 01 00 00 00       	mov    ecx,0x1
   1405294bf:	ff 15 13 07 16 00    	call   QWORD PTR [rip+0x160713]        # 0x140689bd8
   1405294c5:	cc                   	int3
   1405294c6:	48 63 00             	movsxd rax,DWORD PTR [rax]
   1405294c9:	be 01 00 00 00       	mov    esi,0x1
   1405294ce:	48 8b 49 08          	mov    rcx,QWORD PTR [rcx+0x8]
   1405294d2:	4c 8b c0             	mov    r8,rax
   1405294d5:	48 89 bc 24 80 00 00 	mov    QWORD PTR [rsp+0x80],rdi
   1405294dc:	00 
   1405294dd:	4c 8b d0             	mov    r10,rax
   1405294e0:	49 c1 e0 04          	shl    r8,0x4
   1405294e4:	48 89 84 24 a0 00 00 	mov    QWORD PTR [rsp+0xa0],rax
   1405294eb:	00 
   1405294ec:	0f 29 74 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm6
   1405294f1:	0f 29 7c 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm7
   1405294f6:	f2 41 0f 10 04 10    	movsd  xmm0,QWORD PTR [r8+rdx*1]
   1405294fc:	f2 0f 58 02          	addsd  xmm0,QWORD PTR [rdx]
   140529500:	44 0f 29 44 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm8
   140529506:	f2 44 0f 10 05 b1 72 	movsd  xmm8,QWORD PTR [rip+0x3272b1]        # 0x1408507c0
   14052950d:	32 00 
   14052950f:	44 0f 29 4c 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm9
   140529515:	f2 44 0f 10 0d e2 6d 	movsd  xmm9,QWORD PTR [rip+0x326de2]        # 0x140850300
   14052951c:	32 00 
   14052951e:	f2                   	repnz
   14052951f:	0f                   	.byte 0xf
