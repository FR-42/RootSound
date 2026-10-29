
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032a1b0 <.text+0x3291b0>:
   14032a1b0:	48 8b c4             	mov    rax,rsp
   14032a1b3:	48 89 58 18          	mov    QWORD PTR [rax+0x18],rbx
   14032a1b7:	55                   	push   rbp
   14032a1b8:	56                   	push   rsi
   14032a1b9:	57                   	push   rdi
   14032a1ba:	41 54                	push   r12
   14032a1bc:	41 55                	push   r13
   14032a1be:	41 56                	push   r14
   14032a1c0:	41 57                	push   r15
   14032a1c2:	48 81 ec f0 01 00 00 	sub    rsp,0x1f0
   14032a1c9:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   14032a1cd:	0f 29 78 a8          	movaps XMMWORD PTR [rax-0x58],xmm7
   14032a1d1:	44 0f 29 40 98       	movaps XMMWORD PTR [rax-0x68],xmm8
   14032a1d6:	48 8b 05 8b 7f 64 00 	mov    rax,QWORD PTR [rip+0x647f8b]        # 0x140972168
   14032a1dd:	48 33 c4             	xor    rax,rsp
   14032a1e0:	48 89 84 24 90 01 00 	mov    QWORD PTR [rsp+0x190],rax
   14032a1e7:	00 
   14032a1e8:	48 8b 84 24 70 02 00 	mov    rax,QWORD PTR [rsp+0x270]
   14032a1ef:	00 
   14032a1f0:	4c 8b e2             	mov    r12,rdx
   14032a1f3:	8b 3d af ff 65 00    	mov    edi,DWORD PTR [rip+0x65ffaf]        # 0x14098a1a8
   14032a1f9:	41 8b f0             	mov    esi,r8d
   14032a1fc:	4c 8b 94 24 68 02 00 	mov    r10,QWORD PTR [rsp+0x268]
   14032a203:	00 
   14032a204:	32 db                	xor    bl,bl
   14032a206:	4c 8b ac 24 50 02 00 	mov    r13,QWORD PTR [rsp+0x250]
   14032a20d:	00 
   14032a20e:	41 8b e9             	mov    ebp,r9d
   14032a211:	48 89 84 24 88 00 00 	mov    QWORD PTR [rsp+0x88],rax
   14032a218:	00 
   14032a219:	4c 8d 8c 24 94 00 00 	lea    r9,[rsp+0x94]
   14032a220:	00 
   14032a221:	41 8b c0             	mov    eax,r8d
   14032a224:	4c 8b f1             	mov    r14,rcx
   14032a227:	99                   	cdq
   14032a228:	45 33 c0             	xor    r8d,r8d
   14032a22b:	f7 ff                	idiv   edi
   14032a22d:	49 83 c2 10          	add    r10,0x10
   14032a231:	0f 57 ff             	xorps  xmm7,xmm7
   14032a234:	8b c7                	mov    eax,edi
   14032a236:	8b cf                	mov    ecx,edi
   14032a238:	45 85 c0             	test   r8d,r8d
   14032a23b:	75 06                	jne    0x14032a243
   14032a23d:	85 d2                	test   edx,edx
   14032a23f:	7e 02                	jle    0x14032a243
   14032a241:	2b c2                	sub    eax,edx
   14032a243:	f2 41 0f 10 52 f0    	movsd  xmm2,QWORD PTR [r10-0x10]
   14032a249:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a24d:	66 0f 6e c0          	movd   xmm0,eax
   14032a251:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a254:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a257:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a25b:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a25f:	f3 41 0f 11 49 fc    	movss  DWORD PTR [r9-0x4],xmm1
   14032a265:	7a 02                	jp     0x14032a269
   14032a267:	74 02                	je     0x14032a26b
   14032a269:	b3 01                	mov    bl,0x1
   14032a26b:	41 8d 40 01          	lea    eax,[r8+0x1]
   14032a26f:	44 8b d9             	mov    r11d,ecx
   14032a272:	85 c0                	test   eax,eax
   14032a274:	75 07                	jne    0x14032a27d
   14032a276:	85 d2                	test   edx,edx
   14032a278:	7e 03                	jle    0x14032a27d
   14032a27a:	44 2b da             	sub    r11d,edx
   14032a27d:	f2 41 0f 10 52 f8    	movsd  xmm2,QWORD PTR [r10-0x8]
   14032a283:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a287:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a28c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a28f:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a292:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a296:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a29a:	f3 41 0f 11 09       	movss  DWORD PTR [r9],xmm1
   14032a29f:	7a 02                	jp     0x14032a2a3
   14032a2a1:	74 02                	je     0x14032a2a5
   14032a2a3:	b3 01                	mov    bl,0x1
   14032a2a5:	41 8d 40 02          	lea    eax,[r8+0x2]
   14032a2a9:	44 8b d9             	mov    r11d,ecx
   14032a2ac:	85 c0                	test   eax,eax
   14032a2ae:	75 07                	jne    0x14032a2b7
   14032a2b0:	85 d2                	test   edx,edx
   14032a2b2:	7e 03                	jle    0x14032a2b7
   14032a2b4:	44 2b da             	sub    r11d,edx
   14032a2b7:	f2 41 0f 10 12       	movsd  xmm2,QWORD PTR [r10]
   14032a2bc:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a2c0:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a2c5:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a2c8:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a2cb:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a2cf:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a2d3:	f3 41 0f 11 49 04    	movss  DWORD PTR [r9+0x4],xmm1
   14032a2d9:	7a 02                	jp     0x14032a2dd
   14032a2db:	74 02                	je     0x14032a2df
   14032a2dd:	b3 01                	mov    bl,0x1
   14032a2df:	41 8d 40 03          	lea    eax,[r8+0x3]
   14032a2e3:	44 8b d9             	mov    r11d,ecx
   14032a2e6:	85 c0                	test   eax,eax
   14032a2e8:	75 07                	jne    0x14032a2f1
   14032a2ea:	85 d2                	test   edx,edx
   14032a2ec:	7e 03                	jle    0x14032a2f1
   14032a2ee:	44 2b da             	sub    r11d,edx
   14032a2f1:	f2 41 0f 10 52 08    	movsd  xmm2,QWORD PTR [r10+0x8]
   14032a2f7:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a2fb:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a300:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a303:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a306:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a30a:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a30e:	f3 41 0f 11 49 08    	movss  DWORD PTR [r9+0x8],xmm1
   14032a314:	7a 02                	jp     0x14032a318
   14032a316:	74 02                	je     0x14032a31a
   14032a318:	b3 01                	mov    bl,0x1
   14032a31a:	41 8d 40 04          	lea    eax,[r8+0x4]
   14032a31e:	44 8b d9             	mov    r11d,ecx
   14032a321:	85 c0                	test   eax,eax
   14032a323:	75 07                	jne    0x14032a32c
   14032a325:	85 d2                	test   edx,edx
   14032a327:	7e 03                	jle    0x14032a32c
   14032a329:	44 2b da             	sub    r11d,edx
   14032a32c:	f2 41 0f 10 52 10    	movsd  xmm2,QWORD PTR [r10+0x10]
   14032a332:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a336:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a33b:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a33e:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a341:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a345:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a349:	f3 41 0f 11 49 0c    	movss  DWORD PTR [r9+0xc],xmm1
   14032a34f:	7a 02                	jp     0x14032a353
   14032a351:	74 02                	je     0x14032a355
   14032a353:	b3 01                	mov    bl,0x1
   14032a355:	41 8d 40 05          	lea    eax,[r8+0x5]
   14032a359:	44 8b d9             	mov    r11d,ecx
   14032a35c:	85 c0                	test   eax,eax
   14032a35e:	75 07                	jne    0x14032a367
   14032a360:	85 d2                	test   edx,edx
   14032a362:	7e 03                	jle    0x14032a367
   14032a364:	44 2b da             	sub    r11d,edx
   14032a367:	f2 41 0f 10 52 18    	movsd  xmm2,QWORD PTR [r10+0x18]
   14032a36d:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a371:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a376:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a379:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a37c:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a380:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a384:	f3 41 0f 11 49 10    	movss  DWORD PTR [r9+0x10],xmm1
   14032a38a:	7a 02                	jp     0x14032a38e
   14032a38c:	74 02                	je     0x14032a390
   14032a38e:	b3 01                	mov    bl,0x1
   14032a390:	41 8d 40 06          	lea    eax,[r8+0x6]
   14032a394:	44 8b d9             	mov    r11d,ecx
   14032a397:	85 c0                	test   eax,eax
   14032a399:	75 07                	jne    0x14032a3a2
   14032a39b:	85 d2                	test   edx,edx
   14032a39d:	7e 03                	jle    0x14032a3a2
   14032a39f:	44 2b da             	sub    r11d,edx
   14032a3a2:	f2 41 0f 10 52 20    	movsd  xmm2,QWORD PTR [r10+0x20]
   14032a3a8:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a3ac:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a3b1:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a3b4:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a3b7:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a3bb:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a3bf:	f3 41 0f 11 49 14    	movss  DWORD PTR [r9+0x14],xmm1
   14032a3c5:	7a 02                	jp     0x14032a3c9
   14032a3c7:	74 02                	je     0x14032a3cb
   14032a3c9:	b3 01                	mov    bl,0x1
   14032a3cb:	41 8d 40 07          	lea    eax,[r8+0x7]
   14032a3cf:	44 8b d9             	mov    r11d,ecx
   14032a3d2:	85 c0                	test   eax,eax
   14032a3d4:	75 07                	jne    0x14032a3dd
   14032a3d6:	85 d2                	test   edx,edx
   14032a3d8:	7e 03                	jle    0x14032a3dd
   14032a3da:	44 2b da             	sub    r11d,edx
   14032a3dd:	f2 41 0f 10 52 28    	movsd  xmm2,QWORD PTR [r10+0x28]
   14032a3e3:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a3e7:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a3ec:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a3ef:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a3f2:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a3f6:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a3fa:	f3 41 0f 11 49 18    	movss  DWORD PTR [r9+0x18],xmm1
   14032a400:	7a 02                	jp     0x14032a404
   14032a402:	74 02                	je     0x14032a406
   14032a404:	b3 01                	mov    bl,0x1
   14032a406:	41 8d 40 08          	lea    eax,[r8+0x8]
   14032a40a:	44 8b d9             	mov    r11d,ecx
   14032a40d:	85 c0                	test   eax,eax
   14032a40f:	75 07                	jne    0x14032a418
   14032a411:	85 d2                	test   edx,edx
   14032a413:	7e 03                	jle    0x14032a418
   14032a415:	44 2b da             	sub    r11d,edx
   14032a418:	f2 41 0f 10 52 30    	movsd  xmm2,QWORD PTR [r10+0x30]
   14032a41e:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a422:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a427:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a42a:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a42d:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a431:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a435:	f3 41 0f 11 49 1c    	movss  DWORD PTR [r9+0x1c],xmm1
   14032a43b:	7a 02                	jp     0x14032a43f
   14032a43d:	74 02                	je     0x14032a441
   14032a43f:	b3 01                	mov    bl,0x1
   14032a441:	41 8d 40 09          	lea    eax,[r8+0x9]
   14032a445:	44 8b d9             	mov    r11d,ecx
   14032a448:	85 c0                	test   eax,eax
   14032a44a:	75 07                	jne    0x14032a453
   14032a44c:	85 d2                	test   edx,edx
   14032a44e:	7e 03                	jle    0x14032a453
   14032a450:	44 2b da             	sub    r11d,edx
   14032a453:	f2 41 0f 10 52 38    	movsd  xmm2,QWORD PTR [r10+0x38]
   14032a459:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a45d:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a462:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a465:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a468:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a46c:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a470:	f3 41 0f 11 49 20    	movss  DWORD PTR [r9+0x20],xmm1
   14032a476:	7a 02                	jp     0x14032a47a
   14032a478:	74 02                	je     0x14032a47c
   14032a47a:	b3 01                	mov    bl,0x1
   14032a47c:	41 8d 40 0a          	lea    eax,[r8+0xa]
   14032a480:	44 8b d9             	mov    r11d,ecx
   14032a483:	85 c0                	test   eax,eax
   14032a485:	75 07                	jne    0x14032a48e
   14032a487:	85 d2                	test   edx,edx
   14032a489:	7e 03                	jle    0x14032a48e
   14032a48b:	44 2b da             	sub    r11d,edx
   14032a48e:	f2 41 0f 10 52 40    	movsd  xmm2,QWORD PTR [r10+0x40]
   14032a494:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a498:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a49d:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a4a0:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a4a3:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a4a7:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a4ab:	f3 41 0f 11 49 24    	movss  DWORD PTR [r9+0x24],xmm1
   14032a4b1:	7a 02                	jp     0x14032a4b5
   14032a4b3:	74 02                	je     0x14032a4b7
   14032a4b5:	b3 01                	mov    bl,0x1
   14032a4b7:	41 8d 40 0b          	lea    eax,[r8+0xb]
   14032a4bb:	44 8b d9             	mov    r11d,ecx
   14032a4be:	85 c0                	test   eax,eax
   14032a4c0:	75 07                	jne    0x14032a4c9
   14032a4c2:	85 d2                	test   edx,edx
   14032a4c4:	7e 03                	jle    0x14032a4c9
   14032a4c6:	44 2b da             	sub    r11d,edx
   14032a4c9:	f2 41 0f 10 52 48    	movsd  xmm2,QWORD PTR [r10+0x48]
   14032a4cf:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a4d3:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a4d8:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a4db:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a4de:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a4e2:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a4e6:	f3 41 0f 11 49 28    	movss  DWORD PTR [r9+0x28],xmm1
   14032a4ec:	7a 02                	jp     0x14032a4f0
   14032a4ee:	74 02                	je     0x14032a4f2
   14032a4f0:	b3 01                	mov    bl,0x1
   14032a4f2:	41 8d 40 0c          	lea    eax,[r8+0xc]
   14032a4f6:	44 8b d9             	mov    r11d,ecx
   14032a4f9:	85 c0                	test   eax,eax
   14032a4fb:	75 07                	jne    0x14032a504
   14032a4fd:	85 d2                	test   edx,edx
   14032a4ff:	7e 03                	jle    0x14032a504
   14032a501:	44 2b da             	sub    r11d,edx
   14032a504:	f2 41 0f 10 52 50    	movsd  xmm2,QWORD PTR [r10+0x50]
   14032a50a:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a50e:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a513:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a516:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a519:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a51d:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a521:	f3 41 0f 11 49 2c    	movss  DWORD PTR [r9+0x2c],xmm1
   14032a527:	7a 02                	jp     0x14032a52b
   14032a529:	74 02                	je     0x14032a52d
   14032a52b:	b3 01                	mov    bl,0x1
   14032a52d:	41 8d 40 0d          	lea    eax,[r8+0xd]
   14032a531:	44 8b d9             	mov    r11d,ecx
   14032a534:	85 c0                	test   eax,eax
   14032a536:	75 07                	jne    0x14032a53f
   14032a538:	85 d2                	test   edx,edx
   14032a53a:	7e 03                	jle    0x14032a53f
   14032a53c:	44 2b da             	sub    r11d,edx
   14032a53f:	f2 41 0f 10 52 58    	movsd  xmm2,QWORD PTR [r10+0x58]
   14032a545:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a549:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a54e:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a551:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a554:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a558:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a55c:	f3 41 0f 11 49 30    	movss  DWORD PTR [r9+0x30],xmm1
   14032a562:	7a 02                	jp     0x14032a566
   14032a564:	74 02                	je     0x14032a568
   14032a566:	b3 01                	mov    bl,0x1
   14032a568:	41 8d 40 0e          	lea    eax,[r8+0xe]
   14032a56c:	44 8b d9             	mov    r11d,ecx
   14032a56f:	85 c0                	test   eax,eax
   14032a571:	75 07                	jne    0x14032a57a
   14032a573:	85 d2                	test   edx,edx
   14032a575:	7e 03                	jle    0x14032a57a
   14032a577:	44 2b da             	sub    r11d,edx
   14032a57a:	f2 41 0f 10 52 60    	movsd  xmm2,QWORD PTR [r10+0x60]
   14032a580:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a584:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a589:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a58c:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a58f:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a593:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a597:	f3 41 0f 11 49 34    	movss  DWORD PTR [r9+0x34],xmm1
   14032a59d:	7a 02                	jp     0x14032a5a1
   14032a59f:	74 02                	je     0x14032a5a3
   14032a5a1:	b3 01                	mov    bl,0x1
   14032a5a3:	41 8d 40 0f          	lea    eax,[r8+0xf]
   14032a5a7:	44 8b d9             	mov    r11d,ecx
   14032a5aa:	85 c0                	test   eax,eax
   14032a5ac:	75 07                	jne    0x14032a5b5
   14032a5ae:	85 d2                	test   edx,edx
   14032a5b0:	7e 03                	jle    0x14032a5b5
   14032a5b2:	44 2b da             	sub    r11d,edx
   14032a5b5:	f2 41 0f 10 52 68    	movsd  xmm2,QWORD PTR [r10+0x68]
   14032a5bb:	66 0f 2e d7          	ucomisd xmm2,xmm7
   14032a5bf:	66 41 0f 6e c3       	movd   xmm0,r11d
   14032a5c4:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032a5c7:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032a5ca:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032a5ce:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032a5d2:	f3 41 0f 11 49 38    	movss  DWORD PTR [r9+0x38],xmm1
   14032a5d8:	7a 02                	jp     0x14032a5dc
   14032a5da:	74 02                	je     0x14032a5de
   14032a5dc:	b3 01                	mov    bl,0x1
   14032a5de:	41 83 c0 10          	add    r8d,0x10
   14032a5e2:	49 83 ea 80          	sub    r10,0xffffffffffffff80
   14032a5e6:	49 83 c1 40          	add    r9,0x40
   14032a5ea:	41 83 f8 40          	cmp    r8d,0x40
   14032a5ee:	0f 82 40 fc ff ff    	jb     0x14032a234
   14032a5f4:	8b 84 24 80 02 00 00 	mov    eax,DWORD PTR [rsp+0x280]
   14032a5fb:	4c 8d 44 24 50       	lea    r8,[rsp+0x50]
   14032a600:	44 0f b6 bc 24 88 02 	movzx  r15d,BYTE PTR [rsp+0x288]
   14032a607:	00 00 
   14032a609:	49 8b d4             	mov    rdx,r12
   14032a60c:	f3 0f 10 b4 24 58 02 	movss  xmm6,DWORD PTR [rsp+0x258]
   14032a613:	00 00 
   14032a615:	49 8b ce             	mov    rcx,r14
   14032a618:	44 88 7c 24 48       	mov    BYTE PTR [rsp+0x48],r15b
   14032a61d:	0f 28 de             	movaps xmm3,xmm6
   14032a620:	89 44 24 40          	mov    DWORD PTR [rsp+0x40],eax
   14032a624:	41 0f b6 85 2c 02 00 	movzx  eax,BYTE PTR [r13+0x22c]
   14032a62b:	00 
   14032a62c:	88 44 24 38          	mov    BYTE PTR [rsp+0x38],al
   14032a630:	8b 84 24 78 02 00 00 	mov    eax,DWORD PTR [rsp+0x278]
   14032a637:	89 44 24 30          	mov    DWORD PTR [rsp+0x30],eax
   14032a63b:	89 6c 24 28          	mov    DWORD PTR [rsp+0x28],ebp
   14032a63f:	89 74 24 20          	mov    DWORD PTR [rsp+0x20],esi
   14032a643:	e8 a8 ed ff ff       	call   0x1403293f0
   14032a648:	f3 0f 10 4c 24 58    	movss  xmm1,DWORD PTR [rsp+0x58]
   14032a64e:	f2 44 0f 10 05 a1 5b 	movsd  xmm8,QWORD PTR [rip+0x525ba1]        # 0x1408501f8
   14032a655:	52 00 
   14032a657:	0f 5a c9             	cvtps2pd xmm1,xmm1
   14032a65a:	41 0f 28 c0          	movaps xmm0,xmm8
   14032a65e:	f2 0f 5e c1          	divsd  xmm0,xmm1
   14032a662:	0f 5a ce             	cvtps2pd xmm1,xmm6
   14032a665:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14032a669:	41 0f 28 c8          	movaps xmm1,xmm8
   14032a66d:	e8 f6 66 2f 00       	call   0x140620d68
   14032a672:	66 0f 2f f8          	comisd xmm7,xmm0
   14032a676:	0f 28 e8             	movaps xmm5,xmm0
   14032a679:	76 05                	jbe    0x14032a680
   14032a67b:	f2 41 0f 58 e8       	addsd  xmm5,xmm8
   14032a680:	f3 0f 10 8c 24 60 02 	movss  xmm1,DWORD PTR [rsp+0x260]
   14032a687:	00 00 
   14032a689:	0f 57 db             	xorps  xmm3,xmm3
   14032a68c:	0f 57 e4             	xorps  xmm4,xmm4
   14032a68f:	0f 5a c9             	cvtps2pd xmm1,xmm1
   14032a692:	84 db                	test   bl,bl
   14032a694:	0f 84 01 03 00 00    	je     0x14032a99b
   14032a69a:	44 8b 74 24 64       	mov    r14d,DWORD PTR [rsp+0x64]
   14032a69f:	48 63 54 24 60       	movsxd rdx,DWORD PTR [rsp+0x60]
   14032a6a4:	44 0f 29 94 24 a0 01 	movaps XMMWORD PTR [rsp+0x1a0],xmm10
   14032a6ab:	00 00 
   14032a6ad:	f2 44 0f 10 54 24 70 	movsd  xmm10,QWORD PTR [rsp+0x70]
   14032a6b4:	66 44 0f 2e d7       	ucomisd xmm10,xmm7
   14032a6b9:	7a 06                	jp     0x14032a6c1
   14032a6bb:	0f 84 98 02 00 00    	je     0x14032a959
   14032a6c1:	f2 0f 58 0d 37 d3 37 	addsd  xmm1,QWORD PTR [rip+0x37d337]        # 0x1406a7a00
   14032a6c8:	00 
   14032a6c9:	f2 44 0f 10 05 3e d3 	movsd  xmm8,QWORD PTR [rip+0x37d33e]        # 0x1406a7a10
   14032a6d0:	37 00 
   14032a6d2:	0f 28 c5             	movaps xmm0,xmm5
   14032a6d5:	f2 0f 10 35 4b 5a 52 	movsd  xmm6,QWORD PTR [rip+0x525a4b]        # 0x140850128
   14032a6dc:	00 
   14032a6dd:	33 c9                	xor    ecx,ecx
   14032a6df:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14032a6e4:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   14032a6e9:	44 0f 29 8c 24 b0 01 	movaps XMMWORD PTR [rsp+0x1b0],xmm9
   14032a6f0:	00 00 
   14032a6f2:	f2 44 0f 10 0d 85 d3 	movsd  xmm9,QWORD PTR [rip+0x37d385]        # 0x1406a7a80
   14032a6f9:	37 00 
   14032a6fb:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14032a700:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   14032a705:	f2 0f 58 c6          	addsd  xmm0,xmm6
   14032a709:	f2 0f 58 ce          	addsd  xmm1,xmm6
   14032a70d:	f2 4c 0f 2c d8       	cvttsd2si r11,xmm0
   14032a712:	f2 0f 10 05 96 5b 52 	movsd  xmm0,QWORD PTR [rip+0x525b96]        # 0x1408502b0
   14032a719:	00 
   14032a71a:	66 0f 2f c8          	comisd xmm1,xmm0
   14032a71e:	72 17                	jb     0x14032a737
   14032a720:	f2 0f 5c c8          	subsd  xmm1,xmm0
   14032a724:	66 0f 2f c8          	comisd xmm1,xmm0
   14032a728:	73 0d                	jae    0x14032a737
   14032a72a:	48 b8 00 00 00 00 00 	movabs rax,0x8000000000000000
   14032a731:	00 00 80 
   14032a734:	48 8b c8             	mov    rcx,rax
   14032a737:	f2 4c 0f 2c c1       	cvttsd2si r8,xmm1
   14032a73c:	48 8b da             	mov    rbx,rdx
   14032a73f:	4c 03 c1             	add    r8,rcx
   14032a742:	4d 2b c3             	sub    r8,r11
   14032a745:	41 3b d6             	cmp    edx,r14d
   14032a748:	0f 8d 02 02 00 00    	jge    0x14032a950
   14032a74e:	44 8b 6c 24 68       	mov    r13d,DWORD PTR [rsp+0x68]
   14032a753:	45 33 ff             	xor    r15d,r15d
   14032a756:	48 8b 6c 24 50       	mov    rbp,QWORD PTR [rsp+0x50]
   14032a75b:	4c 8b 0d de bb bd 14 	mov    r9,QWORD PTR [rip+0x14bdbbde]        # 0x154f06340
   14032a762:	45 8d 65 ff          	lea    r12d,[r13-0x1]
   14032a766:	41 f7 d4             	not    r12d
   14032a769:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14032a770:	41 8b cc             	mov    ecx,r12d
   14032a773:	41 8b c6             	mov    eax,r14d
   14032a776:	23 cb                	and    ecx,ebx
   14032a778:	41 03 cd             	add    ecx,r13d
   14032a77b:	41 3b ce             	cmp    ecx,r14d
   14032a77e:	0f 4c c1             	cmovl  eax,ecx
   14032a781:	4c 63 d0             	movsxd r10,eax
   14032a784:	49 3b d2             	cmp    rdx,r10
   14032a787:	0f 8d 77 01 00 00    	jge    0x14032a904
   14032a78d:	49 8b c2             	mov    rax,r10
   14032a790:	48 2b c2             	sub    rax,rdx
   14032a793:	48 83 f8 04          	cmp    rax,0x4
   14032a797:	0f 8c 18 01 00 00    	jl     0x14032a8b5
   14032a79d:	49 8b f2             	mov    rsi,r10
   14032a7a0:	48 8d 7d 08          	lea    rdi,[rbp+0x8]
   14032a7a4:	48 2b f2             	sub    rsi,rdx
   14032a7a7:	48 8d 3c 97          	lea    rdi,[rdi+rdx*4]
   14032a7ab:	48 83 ee 04          	sub    rsi,0x4
   14032a7af:	48 c1 ee 02          	shr    rsi,0x2
   14032a7b3:	48 ff c6             	inc    rsi
   14032a7b6:	8d 1c b3             	lea    ebx,[rbx+rsi*4]
   14032a7b9:	48 8d 14 b2          	lea    rdx,[rdx+rsi*4]
   14032a7bd:	0f 1f 00             	nop    DWORD PTR [rax]
   14032a7c0:	f3 0f 10 4f f8       	movss  xmm1,DWORD PTR [rdi-0x8]
   14032a7c5:	4d 03 c3             	add    r8,r11
   14032a7c8:	f3 0f 10 57 fc       	movss  xmm2,DWORD PTR [rdi-0x4]
   14032a7cd:	0f 28 c1             	movaps xmm0,xmm1
   14032a7d0:	49 8b c8             	mov    rcx,r8
   14032a7d3:	4d 03 c3             	add    r8,r11
   14032a7d6:	48 c1 e9 20          	shr    rcx,0x20
   14032a7da:	48 8b c1             	mov    rax,rcx
   14032a7dd:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a7e2:	f3 41 0f 59 04 81    	mulss  xmm0,DWORD PTR [r9+rax*4]
   14032a7e8:	48 8d 81 00 20 00 00 	lea    rax,[rcx+0x2000]
   14032a7ef:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a7f4:	49 8b c8             	mov    rcx,r8
   14032a7f7:	48 c1 e9 20          	shr    rcx,0x20
   14032a7fb:	4d 03 c3             	add    r8,r11
   14032a7fe:	f3 0f 58 d8          	addss  xmm3,xmm0
   14032a802:	0f 28 c2             	movaps xmm0,xmm2
   14032a805:	f3 41 0f 59 0c 81    	mulss  xmm1,DWORD PTR [r9+rax*4]
   14032a80b:	48 8b c1             	mov    rax,rcx
   14032a80e:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a813:	f3 0f 58 e1          	addss  xmm4,xmm1
   14032a817:	f3 0f 10 0f          	movss  xmm1,DWORD PTR [rdi]
   14032a81b:	f3 41 0f 59 04 81    	mulss  xmm0,DWORD PTR [r9+rax*4]
   14032a821:	48 8d 81 00 20 00 00 	lea    rax,[rcx+0x2000]
   14032a828:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a82d:	49 8b c8             	mov    rcx,r8
   14032a830:	48 c1 e9 20          	shr    rcx,0x20
   14032a834:	4d 03 c3             	add    r8,r11
   14032a837:	f3 0f 58 d8          	addss  xmm3,xmm0
   14032a83b:	0f 28 c1             	movaps xmm0,xmm1
   14032a83e:	f3 41 0f 59 14 81    	mulss  xmm2,DWORD PTR [r9+rax*4]
   14032a844:	48 8b c1             	mov    rax,rcx
   14032a847:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a84c:	f3 0f 58 e2          	addss  xmm4,xmm2
   14032a850:	f3 0f 10 57 04       	movss  xmm2,DWORD PTR [rdi+0x4]
   14032a855:	f3 41 0f 59 04 81    	mulss  xmm0,DWORD PTR [r9+rax*4]
   14032a85b:	48 83 c7 10          	add    rdi,0x10
   14032a85f:	48 8d 81 00 20 00 00 	lea    rax,[rcx+0x2000]
   14032a866:	49 8b c8             	mov    rcx,r8
   14032a869:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a86e:	48 c1 e9 20          	shr    rcx,0x20
   14032a872:	f3 0f 58 d8          	addss  xmm3,xmm0
   14032a876:	0f 28 c2             	movaps xmm0,xmm2
   14032a879:	f3 41 0f 59 0c 81    	mulss  xmm1,DWORD PTR [r9+rax*4]
   14032a87f:	48 8b c1             	mov    rax,rcx
   14032a882:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a887:	f3 0f 58 e1          	addss  xmm4,xmm1
   14032a88b:	f3 41 0f 59 04 81    	mulss  xmm0,DWORD PTR [r9+rax*4]
   14032a891:	48 8d 81 00 20 00 00 	lea    rax,[rcx+0x2000]
   14032a898:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a89d:	f3 0f 58 d8          	addss  xmm3,xmm0
   14032a8a1:	f3 41 0f 59 14 81    	mulss  xmm2,DWORD PTR [r9+rax*4]
   14032a8a7:	f3 0f 58 e2          	addss  xmm4,xmm2
   14032a8ab:	48 83 ee 01          	sub    rsi,0x1
   14032a8af:	0f 85 0b ff ff ff    	jne    0x14032a7c0
   14032a8b5:	49 3b d2             	cmp    rdx,r10
   14032a8b8:	7d 4a                	jge    0x14032a904
   14032a8ba:	41 8b c2             	mov    eax,r10d
   14032a8bd:	2b c2                	sub    eax,edx
   14032a8bf:	03 d8                	add    ebx,eax
   14032a8c1:	f3 0f 10 4c 95 00    	movss  xmm1,DWORD PTR [rbp+rdx*4+0x0]
   14032a8c7:	4d 03 c3             	add    r8,r11
   14032a8ca:	0f 28 c1             	movaps xmm0,xmm1
   14032a8cd:	49 8b c8             	mov    rcx,r8
   14032a8d0:	48 c1 e9 20          	shr    rcx,0x20
   14032a8d4:	48 ff c2             	inc    rdx
   14032a8d7:	48 8b c1             	mov    rax,rcx
   14032a8da:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a8df:	f3 41 0f 59 04 81    	mulss  xmm0,DWORD PTR [r9+rax*4]
   14032a8e5:	48 8d 81 00 20 00 00 	lea    rax,[rcx+0x2000]
   14032a8ec:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a8f1:	f3 0f 58 d8          	addss  xmm3,xmm0
   14032a8f5:	f3 41 0f 59 0c 81    	mulss  xmm1,DWORD PTR [r9+rax*4]
   14032a8fb:	f3 0f 58 e1          	addss  xmm4,xmm1
   14032a8ff:	49 3b d2             	cmp    rdx,r10
   14032a902:	7c bd                	jl     0x14032a8c1
   14032a904:	f3 42 0f 10 84 bc 90 	movss  xmm0,DWORD PTR [rsp+r15*4+0x90]
   14032a90b:	00 00 00 
   14032a90e:	41 ff c7             	inc    r15d
   14032a911:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032a914:	f2 0f 58 e8          	addsd  xmm5,xmm0
   14032a918:	66 0f 2f ef          	comisd xmm5,xmm7
   14032a91c:	0f 28 cd             	movaps xmm1,xmm5
   14032a91f:	f2 41 0f 59 c8       	mulsd  xmm1,xmm8
   14032a924:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   14032a929:	72 06                	jb     0x14032a931
   14032a92b:	f2 0f 58 ce          	addsd  xmm1,xmm6
   14032a92f:	eb 04                	jmp    0x14032a935
   14032a931:	f2 0f 5c ce          	subsd  xmm1,xmm6
   14032a935:	f2 4c 0f 2c d9       	cvttsd2si r11,xmm1
   14032a93a:	41 3b de             	cmp    ebx,r14d
   14032a93d:	0f 8c 2d fe ff ff    	jl     0x14032a770
   14032a943:	44 0f b6 bc 24 88 02 	movzx  r15d,BYTE PTR [rsp+0x288]
   14032a94a:	00 00 
   14032a94c:	8b 54 24 60          	mov    edx,DWORD PTR [rsp+0x60]
   14032a950:	44 0f 28 8c 24 b0 01 	movaps xmm9,XMMWORD PTR [rsp+0x1b0]
   14032a957:	00 00 
   14032a959:	45 84 ff             	test   r15b,r15b
   14032a95c:	74 0b                	je     0x14032a969
   14032a95e:	f3 0f 10 44 24 78    	movss  xmm0,DWORD PTR [rsp+0x78]
   14032a964:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032a967:	eb 08                	jmp    0x14032a971
   14032a969:	f2 0f 10 05 07 58 52 	movsd  xmm0,QWORD PTR [rip+0x525807]        # 0x140850178
   14032a970:	00 
   14032a971:	0f 57 ed             	xorps  xmm5,xmm5
   14032a974:	44 2b f2             	sub    r14d,edx
   14032a977:	f2 41 0f 2a ee       	cvtsi2sd xmm5,r14d
   14032a97c:	f2 0f 59 2d 1c d0 37 	mulsd  xmm5,QWORD PTR [rip+0x37d01c]        # 0x1406a79a0
   14032a983:	00 
   14032a984:	f2 0f 59 e8          	mulsd  xmm5,xmm0
   14032a988:	f2 41 0f 58 ea       	addsd  xmm5,xmm10
   14032a98d:	44 0f 28 94 24 a0 01 	movaps xmm10,XMMWORD PTR [rsp+0x1a0]
   14032a994:	00 00 
   14032a996:	e9 4b 01 00 00       	jmp    0x14032aae6
   14032a99b:	f2 44 0f 10 44 24 70 	movsd  xmm8,QWORD PTR [rsp+0x70]
   14032a9a2:	66 44 0f 2e c7       	ucomisd xmm8,xmm7
   14032a9a7:	8b 6c 24 64          	mov    ebp,DWORD PTR [rsp+0x64]
   14032a9ab:	4c 63 74 24 60       	movsxd r14,DWORD PTR [rsp+0x60]
   14032a9b0:	7a 06                	jp     0x14032a9b8
   14032a9b2:	0f 84 fb 00 00 00    	je     0x14032aab3
   14032a9b8:	f2 0f 10 15 50 d0 37 	movsd  xmm2,QWORD PTR [rip+0x37d050]        # 0x1406a7a10
   14032a9bf:	00 
   14032a9c0:	33 c9                	xor    ecx,ecx
   14032a9c2:	f2 0f 10 35 b6 d0 37 	movsd  xmm6,QWORD PTR [rip+0x37d0b6]        # 0x1406a7a80
   14032a9c9:	00 
   14032a9ca:	48 b8 00 00 00 00 00 	movabs rax,0x8000000000000000
   14032a9d1:	00 00 80 
   14032a9d4:	f2 0f 10 3d 4c 57 52 	movsd  xmm7,QWORD PTR [rip+0x52574c]        # 0x140850128
   14032a9db:	00 
   14032a9dc:	f2 0f 10 05 cc 58 52 	movsd  xmm0,QWORD PTR [rip+0x5258cc]        # 0x1408502b0
   14032a9e3:	00 
   14032a9e4:	f2 0f 59 ea          	mulsd  xmm5,xmm2
   14032a9e8:	f2 0f 59 ee          	mulsd  xmm5,xmm6
   14032a9ec:	f2 0f 58 ef          	addsd  xmm5,xmm7
   14032a9f0:	66 0f 2f e8          	comisd xmm5,xmm0
   14032a9f4:	72 0d                	jb     0x14032aa03
   14032a9f6:	f2 0f 5c e8          	subsd  xmm5,xmm0
   14032a9fa:	66 0f 2f e8          	comisd xmm5,xmm0
   14032a9fe:	73 03                	jae    0x14032aa03
   14032aa00:	48 8b c8             	mov    rcx,rax
   14032aa03:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032aa07:	f2 4c 0f 2c dd       	cvttsd2si r11,xmm5
   14032aa0c:	f2 0f 59 ce          	mulsd  xmm1,xmm6
   14032aa10:	4c 03 d9             	add    r11,rcx
   14032aa13:	33 c9                	xor    ecx,ecx
   14032aa15:	f2 0f 58 cf          	addsd  xmm1,xmm7
   14032aa19:	66 0f 2f c8          	comisd xmm1,xmm0
   14032aa1d:	72 0d                	jb     0x14032aa2c
   14032aa1f:	f2 0f 5c c8          	subsd  xmm1,xmm0
   14032aa23:	66 0f 2f c8          	comisd xmm1,xmm0
   14032aa27:	73 03                	jae    0x14032aa2c
   14032aa29:	48 8b c8             	mov    rcx,rax
   14032aa2c:	f2 4c 0f 2c c1       	cvttsd2si r8,xmm1
   14032aa31:	4c 03 c1             	add    r8,rcx
   14032aa34:	4d 2b c3             	sub    r8,r11
   14032aa37:	44 3b f5             	cmp    r14d,ebp
   14032aa3a:	7d 77                	jge    0x14032aab3
   14032aa3c:	48 8b b4 24 80 00 00 	mov    rsi,QWORD PTR [rsp+0x80]
   14032aa43:	00 
   14032aa44:	8b c5                	mov    eax,ebp
   14032aa46:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   14032aa4b:	41 2b c6             	sub    eax,r14d
   14032aa4e:	4c 8b 15 eb b8 bd 14 	mov    r10,QWORD PTR [rip+0x14bdb8eb]        # 0x154f06340
   14032aa55:	49 8b d6             	mov    rdx,r14
   14032aa58:	4c 63 c8             	movsxd r9,eax
   14032aa5b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14032aa60:	f3 0f 10 0c 93       	movss  xmm1,DWORD PTR [rbx+rdx*4]
   14032aa65:	45 84 ff             	test   r15b,r15b
   14032aa68:	75 0b                	jne    0x14032aa75
   14032aa6a:	48 8b c2             	mov    rax,rdx
   14032aa6d:	49 2b c6             	sub    rax,r14
   14032aa70:	f3 0f 59 0c 86       	mulss  xmm1,DWORD PTR [rsi+rax*4]
   14032aa75:	4d 03 c3             	add    r8,r11
   14032aa78:	0f 28 c1             	movaps xmm0,xmm1
   14032aa7b:	49 8b c8             	mov    rcx,r8
   14032aa7e:	48 ff c2             	inc    rdx
   14032aa81:	48 c1 e9 20          	shr    rcx,0x20
   14032aa85:	48 8b c1             	mov    rax,rcx
   14032aa88:	25 ff 7f 00 00       	and    eax,0x7fff
   14032aa8d:	f3 41 0f 59 04 82    	mulss  xmm0,DWORD PTR [r10+rax*4]
   14032aa93:	48 8d 81 00 20 00 00 	lea    rax,[rcx+0x2000]
   14032aa9a:	25 ff 7f 00 00       	and    eax,0x7fff
   14032aa9f:	f3 0f 58 d8          	addss  xmm3,xmm0
   14032aaa3:	f3 41 0f 59 0c 82    	mulss  xmm1,DWORD PTR [r10+rax*4]
   14032aaa9:	f3 0f 58 e1          	addss  xmm4,xmm1
   14032aaad:	49 83 e9 01          	sub    r9,0x1
   14032aab1:	75 ad                	jne    0x14032aa60
   14032aab3:	45 84 ff             	test   r15b,r15b
   14032aab6:	74 0b                	je     0x14032aac3
   14032aab8:	f3 0f 10 44 24 78    	movss  xmm0,DWORD PTR [rsp+0x78]
   14032aabe:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032aac1:	eb 08                	jmp    0x14032aacb
   14032aac3:	f2 0f 10 05 ad 56 52 	movsd  xmm0,QWORD PTR [rip+0x5256ad]        # 0x140850178
   14032aaca:	00 
   14032aacb:	0f 57 ed             	xorps  xmm5,xmm5
   14032aace:	41 2b ee             	sub    ebp,r14d
   14032aad1:	f2 0f 2a ed          	cvtsi2sd xmm5,ebp
   14032aad5:	f2 0f 59 2d c3 ce 37 	mulsd  xmm5,QWORD PTR [rip+0x37cec3]        # 0x1406a79a0
   14032aadc:	00 
   14032aadd:	f2 0f 59 e8          	mulsd  xmm5,xmm0
   14032aae1:	f2 41 0f 58 e8       	addsd  xmm5,xmm8
   14032aae6:	48 8b 84 24 88 00 00 	mov    rax,QWORD PTR [rsp+0x88]
   14032aaed:	00 
   14032aaee:	0f 57 c0             	xorps  xmm0,xmm0
   14032aaf1:	f3 0f 5a c3          	cvtss2sd xmm0,xmm3
   14032aaf5:	0f 57 c9             	xorps  xmm1,xmm1
   14032aaf8:	0f 28 f5             	movaps xmm6,xmm5
   14032aafb:	f3 0f 5a cc          	cvtss2sd xmm1,xmm4
   14032aaff:	f2 0f 58 c0          	addsd  xmm0,xmm0
   14032ab03:	0f 28 e5             	movaps xmm4,xmm5
   14032ab06:	f2 0f 58 c9          	addsd  xmm1,xmm1
   14032ab0a:	0f 28 fd             	movaps xmm7,xmm5
   14032ab0d:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14032ab11:	0f 5a d8             	cvtps2pd xmm3,xmm0
   14032ab14:	66 0f 5a c1          	cvtpd2ps xmm0,xmm1
   14032ab18:	f2 0f 5c e3          	subsd  xmm4,xmm3
   14032ab1c:	0f 5a d0             	cvtps2pd xmm2,xmm0
   14032ab1f:	66 0f 5a c4          	cvtpd2ps xmm0,xmm4
   14032ab23:	f2 0f 58 ea          	addsd  xmm5,xmm2
   14032ab27:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032ab2a:	f2 0f 5c f2          	subsd  xmm6,xmm2
   14032ab2e:	f2 0f 11 08          	movsd  QWORD PTR [rax],xmm1
   14032ab32:	f2 0f 58 fb          	addsd  xmm7,xmm3
   14032ab36:	66 0f 5a d6          	cvtpd2ps xmm2,xmm6
   14032ab3a:	66 0f 5a cf          	cvtpd2ps xmm1,xmm7
   14032ab3e:	0f 5a c2             	cvtps2pd xmm0,xmm2
   14032ab41:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032ab44:	f2 0f 11 40 08       	movsd  QWORD PTR [rax+0x8],xmm0
   14032ab49:	66 0f 5a c5          	cvtpd2ps xmm0,xmm5
   14032ab4d:	f2 0f 11 50 10       	movsd  QWORD PTR [rax+0x10],xmm2
   14032ab52:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032ab55:	f2 0f 11 48 18       	movsd  QWORD PTR [rax+0x18],xmm1
   14032ab5a:	48 8b 8c 24 90 01 00 	mov    rcx,QWORD PTR [rsp+0x190]
   14032ab61:	00 
   14032ab62:	48 33 cc             	xor    rcx,rsp
   14032ab65:	e8 96 0a 2f 00       	call   0x14061b600
   14032ab6a:	4c 8d 9c 24 f0 01 00 	lea    r11,[rsp+0x1f0]
   14032ab71:	00 
   14032ab72:	49 8b 5b 50          	mov    rbx,QWORD PTR [r11+0x50]
   14032ab76:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
   14032ab7b:	41 0f 28 7b e0       	movaps xmm7,XMMWORD PTR [r11-0x20]
   14032ab80:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   14032ab85:	49 8b e3             	mov    rsp,r11
   14032ab88:	41 5f                	pop    r15
   14032ab8a:	41 5e                	pop    r14
   14032ab8c:	41 5d                	pop    r13
   14032ab8e:	41 5c                	pop    r12
   14032ab90:	5f                   	pop    rdi
   14032ab91:	5e                   	pop    rsi
   14032ab92:	5d                   	pop    rbp
   14032ab93:	c3                   	ret
   14032ab94:	cc                   	int3
   14032ab95:	cc                   	int3
   14032ab96:	cc                   	int3
   14032ab97:	cc                   	int3
   14032ab98:	cc                   	int3
   14032ab99:	cc                   	int3
   14032ab9a:	cc                   	int3
   14032ab9b:	cc                   	int3
   14032ab9c:	cc                   	int3
   14032ab9d:	cc                   	int3
   14032ab9e:	cc                   	int3
   14032ab9f:	cc                   	int3
   14032aba0:	4c 8b dc             	mov    r11,rsp
   14032aba3:	48 81 ec a8 00 00 00 	sub    rsp,0xa8
   14032abaa:	0f b6 84 24 f8 00 00 	movzx  eax,BYTE PTR [rsp+0xf8]
   14032abb1:	00 
   14032abb2:	45 8b d1             	mov    r10d,r9d
   14032abb5:	f3 0f 10 8c 24 e0 00 	movss  xmm1,DWORD PTR [rsp+0xe0]
   14032abbc:	00 00 
   14032abbe:	0f 57 c0             	xorps  xmm0,xmm0
   14032abc1:	44 8b 8c 24 d0 00 00 	mov    r9d,DWORD PTR [rsp+0xd0]
   14032abc8:	00 
   14032abc9:	88 44 24 58          	mov    BYTE PTR [rsp+0x58],al
   14032abcd:	8b 84 24 f0 00 00 00 	mov    eax,DWORD PTR [rsp+0xf0]
   14032abd4:	89 44 24 50          	mov    DWORD PTR [rsp+0x50],eax
   14032abd8:	49 8d 43 b8          	lea    rax,[r11-0x48]
   14032abdc:	45 89 43 a0          	mov    DWORD PTR [r11-0x60],r8d
   14032abe0:	45 8b c2             	mov    r8d,r10d
   14032abe3:	49 89 43 98          	mov    QWORD PTR [r11-0x68],rax
   14032abe7:	48 8b 84 24 e8 00 00 	mov    rax,QWORD PTR [rsp+0xe8]
   14032abee:	00 
   14032abef:	49 89 43 90          	mov    QWORD PTR [r11-0x70],rax
   14032abf3:	48 8b 84 24 d8 00 00 	mov    rax,QWORD PTR [rsp+0xd8]
   14032abfa:	00 
   14032abfb:	f3 0f 11 44 24 30    	movss  DWORD PTR [rsp+0x30],xmm0
   14032ac01:	f3 0f 11 4c 24 28    	movss  DWORD PTR [rsp+0x28],xmm1
   14032ac07:	41 0f 29 73 e8       	movaps XMMWORD PTR [r11-0x18],xmm6
   14032ac0c:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14032ac11:	41 0f 29 7b d8       	movaps XMMWORD PTR [r11-0x28],xmm7
   14032ac16:	e8 95 f5 ff ff       	call   0x14032a1b0
   14032ac1b:	f2 0f 10 4c 24 60    	movsd  xmm1,QWORD PTR [rsp+0x60]
   14032ac21:	f2 0f 10 54 24 68    	movsd  xmm2,QWORD PTR [rsp+0x68]
   14032ac27:	0f 28 e1             	movaps xmm4,xmm1
   14032ac2a:	f2 0f 10 5c 24 70    	movsd  xmm3,QWORD PTR [rsp+0x70]
   14032ac30:	f2 0f 10 74 24 78    	movsd  xmm6,QWORD PTR [rsp+0x78]
   14032ac36:	0f 28 c3             	movaps xmm0,xmm3
   14032ac39:	0f 28 fb             	movaps xmm7,xmm3
   14032ac3c:	0f 28 ee             	movaps xmm5,xmm6
   14032ac3f:	f2 0f 58 f9          	addsd  xmm7,xmm1
   14032ac43:	f2 0f 58 ea          	addsd  xmm5,xmm2
   14032ac47:	f2 0f 59 3d d9 54 52 	mulsd  xmm7,QWORD PTR [rip+0x5254d9]        # 0x140850128
   14032ac4e:	00 
   14032ac4f:	f2 0f 59 2d d1 54 52 	mulsd  xmm5,QWORD PTR [rip+0x5254d1]        # 0x140850128
   14032ac56:	00 
   14032ac57:	f2 0f 5c cf          	subsd  xmm1,xmm7
   14032ac5b:	f2 0f 5c c7          	subsd  xmm0,xmm7
   14032ac5f:	f2 0f 5c e5          	subsd  xmm4,xmm5
   14032ac63:	f2 0f 5c dd          	subsd  xmm3,xmm5
   14032ac67:	f2 0f 58 e1          	addsd  xmm4,xmm1
   14032ac6b:	0f 28 ca             	movaps xmm1,xmm2
   14032ac6e:	f2 0f 5c cd          	subsd  xmm1,xmm5
   14032ac72:	f2 0f 5c d7          	subsd  xmm2,xmm7
   14032ac76:	f2 0f 5c e0          	subsd  xmm4,xmm0
   14032ac7a:	f2 0f 58 ca          	addsd  xmm1,xmm2
   14032ac7e:	0f 28 d6             	movaps xmm2,xmm6
   14032ac81:	f2 0f 5c d7          	subsd  xmm2,xmm7
   14032ac85:	f2 0f 5c f5          	subsd  xmm6,xmm5
   14032ac89:	f2 0f 5c e3          	subsd  xmm4,xmm3
   14032ac8d:	f2 0f 5c ca          	subsd  xmm1,xmm2
   14032ac91:	f2 0f 59 25 1f 54 52 	mulsd  xmm4,QWORD PTR [rip+0x52541f]        # 0x1408500b8
   14032ac98:	00 
   14032ac99:	f2 0f 5c ce          	subsd  xmm1,xmm6
   14032ac9d:	0f 28 c4             	movaps xmm0,xmm4
   14032aca0:	f2 0f 59 0d 10 54 52 	mulsd  xmm1,QWORD PTR [rip+0x525410]        # 0x1408500b8
   14032aca7:	00 
   14032aca8:	e8 57 61 2f 00       	call   0x140620e04
   14032acad:	f2 0f 10 3d 43 55 52 	movsd  xmm7,QWORD PTR [rip+0x525543]        # 0x1408501f8
   14032acb4:	00 
   14032acb5:	0f 57 d2             	xorps  xmm2,xmm2
   14032acb8:	f2 0f 5c d0          	subsd  xmm2,xmm0
   14032acbc:	0f 28 cf             	movaps xmm1,xmm7
   14032acbf:	0f 57 f6             	xorps  xmm6,xmm6
   14032acc2:	f2 0f 58 15 1e cd 37 	addsd  xmm2,QWORD PTR [rip+0x37cd1e]        # 0x1406a79e8
   14032acc9:	00 
   14032acca:	0f 28 c2             	movaps xmm0,xmm2
   14032accd:	e8 96 60 2f 00       	call   0x140620d68
   14032acd2:	66 0f 2f f0          	comisd xmm6,xmm0
   14032acd6:	76 04                	jbe    0x14032acdc
   14032acd8:	f2 0f 58 c7          	addsd  xmm0,xmm7
   14032acdc:	0f 28 b4 24 90 00 00 	movaps xmm6,XMMWORD PTR [rsp+0x90]
   14032ace3:	00 
   14032ace4:	0f 28 bc 24 80 00 00 	movaps xmm7,XMMWORD PTR [rsp+0x80]
   14032aceb:	00 
   14032acec:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14032acf0:	48 81 c4 a8 00 00 00 	add    rsp,0xa8
   14032acf7:	c3                   	ret
   14032acf8:	cc                   	int3
   14032acf9:	cc                   	int3
   14032acfa:	cc                   	int3
   14032acfb:	cc                   	int3
   14032acfc:	cc                   	int3
   14032acfd:	cc                   	int3
   14032acfe:	cc                   	int3
   14032acff:	cc                   	int3
   14032ad00:	48 8b c4             	mov    rax,rsp
   14032ad03:	48 89 58 10          	mov    QWORD PTR [rax+0x10],rbx
   14032ad07:	57                   	push   rdi
   14032ad08:	48 81 ec 80 00 00 00 	sub    rsp,0x80
   14032ad0f:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6
   14032ad13:	48 8b da             	mov    rbx,rdx
   14032ad16:	44 0f 29 40 c8       	movaps XMMWORD PTR [rax-0x38],xmm8
   14032ad1b:	48 8b f9             	mov    rdi,rcx
   14032ad1e:	44 0f 29 48 b8       	movaps XMMWORD PTR [rax-0x48],xmm9
   14032ad23:	45 0f 57 c9          	xorps  xmm9,xmm9
   14032ad27:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   14032ad2c:	45 0f 57 d2          	xorps  xmm10,xmm10
   14032ad30:	44 0f 29 58 98       	movaps XMMWORD PTR [rax-0x68],xmm11
   14032ad35:	45 0f 57 db          	xorps  xmm11,xmm11
   14032ad39:	45 0f 57 c0          	xorps  xmm8,xmm8
   14032ad3d:	45 85 c0             	test   r8d,r8d
   14032ad40:	0f 84 9b 00 00 00    	je     0x14032ade1
   14032ad46:	48 89 70 08          	mov    QWORD PTR [rax+0x8],rsi
   14032ad4a:	48 2b fa             	sub    rdi,rdx
   14032ad4d:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7
   14032ad51:	41 8b f0             	mov    esi,r8d
   14032ad54:	f3 0f 10 34 1f       	movss  xmm6,DWORD PTR [rdi+rbx*1]
   14032ad59:	f3 0f 10 3b          	movss  xmm7,DWORD PTR [rbx]
   14032ad5d:	0f 28 c6             	movaps xmm0,xmm6
   14032ad60:	e8 51 60 2f 00       	call   0x140620db6
   14032ad65:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14032ad69:	f3 44 0f 58 c8       	addss  xmm9,xmm0
   14032ad6e:	0f 28 c6             	movaps xmm0,xmm6
   14032ad71:	e8 28 60 2f 00       	call   0x140620d9e
   14032ad76:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14032ad7a:	f3 44 0f 58 c7       	addss  xmm8,xmm7
   14032ad7f:	48 83 c3 04          	add    rbx,0x4
   14032ad83:	f3 44 0f 58 d0       	addss  xmm10,xmm0
   14032ad88:	48 83 ee 01          	sub    rsi,0x1
   14032ad8c:	75 c6                	jne    0x14032ad54
   14032ad8e:	45 0f 2e c3          	ucomiss xmm8,xmm11
   14032ad92:	48 8b b4 24 90 00 00 	mov    rsi,QWORD PTR [rsp+0x90]
   14032ad99:	00 
   14032ad9a:	0f 28 7c 24 60       	movaps xmm7,XMMWORD PTR [rsp+0x60]
   14032ad9f:	7a 02                	jp     0x14032ada3
   14032ada1:	74 3e                	je     0x14032ade1
   14032ada3:	f3 45 0f 5e c8       	divss  xmm9,xmm8
   14032ada8:	f3 45 0f 5e d0       	divss  xmm10,xmm8
   14032adad:	41 0f 28 c1          	movaps xmm0,xmm9
   14032adb1:	41 0f 28 ca          	movaps xmm1,xmm10
   14032adb5:	e8 0e 60 2f 00       	call   0x140620dc8
   14032adba:	f2 0f 10 35 36 54 52 	movsd  xmm6,QWORD PTR [rip+0x525436]        # 0x1408501f8
   14032adc1:	00 
   14032adc2:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14032adc6:	0f 28 ce             	movaps xmm1,xmm6
   14032adc9:	e8 9a 5f 2f 00       	call   0x140620d68
   14032adce:	0f 57 c9             	xorps  xmm1,xmm1
   14032add1:	66 0f 2f c8          	comisd xmm1,xmm0
   14032add5:	76 04                	jbe    0x14032addb
   14032add7:	f2 0f 58 c6          	addsd  xmm0,xmm6
   14032addb:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14032addf:	eb 08                	jmp    0x14032ade9
   14032ade1:	f3 0f 10 05 07 55 52 	movss  xmm0,DWORD PTR [rip+0x525507]        # 0x1408502f0
   14032ade8:	00 
   14032ade9:	0f 28 74 24 70       	movaps xmm6,XMMWORD PTR [rsp+0x70]
   14032adee:	4c 8d 9c 24 80 00 00 	lea    r11,[rsp+0x80]
   14032adf5:	00 
   14032adf6:	49 8b 5b 18          	mov    rbx,QWORD PTR [r11+0x18]
   14032adfa:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   14032adff:	45 0f 28 4b c0       	movaps xmm9,XMMWORD PTR [r11-0x40]
   14032ae04:	45 0f 28 53 b0       	movaps xmm10,XMMWORD PTR [r11-0x50]
   14032ae09:	45 0f 28 5b a0       	movaps xmm11,XMMWORD PTR [r11-0x60]
   14032ae0e:	49 8b e3             	mov    rsp,r11
   14032ae11:	5f                   	pop    rdi
   14032ae12:	c3                   	ret
   14032ae13:	cc                   	int3
   14032ae14:	cc                   	int3
   14032ae15:	cc                   	int3
   14032ae16:	cc                   	int3
   14032ae17:	cc                   	int3
   14032ae18:	cc                   	int3
   14032ae19:	cc                   	int3
   14032ae1a:	cc                   	int3
   14032ae1b:	cc                   	int3
   14032ae1c:	cc                   	int3
   14032ae1d:	cc                   	int3
   14032ae1e:	cc                   	int3
   14032ae1f:	cc                   	int3
   14032ae20:	48 83 ec 68          	sub    rsp,0x68
   14032ae24:	0f 29 74 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm6
   14032ae29:	0f 29 7c 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm7
   14032ae2e:	f2 0f 10 3d c2 53 52 	movsd  xmm7,QWORD PTR [rip+0x5253c2]        # 0x1408501f8
   14032ae35:	00 
   14032ae36:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14032ae3a:	44 0f 29 44 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm8
   14032ae40:	44 0f 29 4c 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm9
   14032ae46:	44 0f 28 c9          	movaps xmm9,xmm1
   14032ae4a:	0f 28 cf             	movaps xmm1,xmm7
   14032ae4d:	e8 16 5f 2f 00       	call   0x140620d68
   14032ae52:	45 0f 57 c0          	xorps  xmm8,xmm8
   14032ae56:	0f 28 f0             	movaps xmm6,xmm0
   14032ae59:	66 44 0f 2f c0       	comisd xmm8,xmm0
   14032ae5e:	76 04                	jbe    0x14032ae64
   14032ae60:	f2 0f 58 f7          	addsd  xmm6,xmm7
   14032ae64:	0f 57 c0             	xorps  xmm0,xmm0
   14032ae67:	0f 28 cf             	movaps xmm1,xmm7
   14032ae6a:	f3 41 0f 5a c1       	cvtss2sd xmm0,xmm9
   14032ae6f:	e8 f4 5e 2f 00       	call   0x140620d68
   14032ae74:	66 44 0f 2f c0       	comisd xmm8,xmm0
   14032ae79:	76 04                	jbe    0x14032ae7f
   14032ae7b:	f2 0f 58 c7          	addsd  xmm0,xmm7
   14032ae7f:	0f 57 d2             	xorps  xmm2,xmm2
   14032ae82:	f2 0f 5c f0          	subsd  xmm6,xmm0
   14032ae86:	f2 0f 5a d6          	cvtsd2ss xmm2,xmm6
   14032ae8a:	0f 5a ca             	cvtps2pd xmm1,xmm2
   14032ae8d:	66 0f 2f 0d 33 53 52 	comisd xmm1,QWORD PTR [rip+0x525333]        # 0x1408501c8
   14032ae94:	00 
   14032ae95:	76 06                	jbe    0x14032ae9d
   14032ae97:	f2 0f 5c cf          	subsd  xmm1,xmm7
   14032ae9b:	eb 12                	jmp    0x14032aeaf
   14032ae9d:	f2 0f 10 05 03 df 36 	movsd  xmm0,QWORD PTR [rip+0x36df03]        # 0x140698da8
   14032aea4:	00 
   14032aea5:	66 0f 2f c1          	comisd xmm0,xmm1
   14032aea9:	76 08                	jbe    0x14032aeb3
   14032aeab:	f2 0f 58 cf          	addsd  xmm1,xmm7
   14032aeaf:	66 0f 5a d1          	cvtpd2ps xmm2,xmm1
   14032aeb3:	0f 57 c9             	xorps  xmm1,xmm1
   14032aeb6:	0f 2f ca             	comiss xmm1,xmm2
   14032aeb9:	76 07                	jbe    0x14032aec2
   14032aebb:	0f 57 15 0e 59 52 00 	xorps  xmm2,XMMWORD PTR [rip+0x52590e]        # 0x1408507d0
   14032aec2:	0f 28 74 24 50       	movaps xmm6,XMMWORD PTR [rsp+0x50]
   14032aec7:	0f 28 c2             	movaps xmm0,xmm2
   14032aeca:	0f 28 7c 24 40       	movaps xmm7,XMMWORD PTR [rsp+0x40]
   14032aecf:	44 0f 28 44 24 30    	movaps xmm8,XMMWORD PTR [rsp+0x30]
   14032aed5:	44 0f 28 4c 24 20    	movaps xmm9,XMMWORD PTR [rsp+0x20]
   14032aedb:	48 83 c4 68          	add    rsp,0x68
   14032aedf:	c3                   	ret
   14032aee0:	cc                   	int3
   14032aee1:	cc                   	int3
   14032aee2:	cc                   	int3
   14032aee3:	cc                   	int3
   14032aee4:	cc                   	int3
   14032aee5:	cc                   	int3
   14032aee6:	cc                   	int3
   14032aee7:	cc                   	int3
   14032aee8:	cc                   	int3
   14032aee9:	cc                   	int3
   14032aeea:	cc                   	int3
   14032aeeb:	cc                   	int3
   14032aeec:	cc                   	int3
   14032aeed:	cc                   	int3
   14032aeee:	cc                   	int3
   14032aeef:	cc                   	int3
