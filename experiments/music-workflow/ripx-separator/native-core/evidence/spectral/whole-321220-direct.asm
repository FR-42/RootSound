
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140321220 <.text+0x320220>:
   140321220:	40 53                	rex push rbx
   140321222:	48 83 ec 20          	sub    rsp,0x20
   140321226:	80 ba 8c 0d 00 00 03 	cmp    BYTE PTR [rdx+0xd8c],0x3
   14032122d:	45 0f b7 d1          	movzx  r10d,r9w
   140321231:	44 0f 29 04 24       	movaps XMMWORD PTR [rsp],xmm8
   140321236:	49 8b d8             	mov    rbx,r8
   140321239:	45 0f 57 c0          	xorps  xmm8,xmm8
   14032123d:	4c 8b da             	mov    r11,rdx
   140321240:	72 13                	jb     0x140321255
   140321242:	f3 0f 10 05 6a 5f 37 	movss  xmm0,DWORD PTR [rip+0x375f6a]        # 0x1406971b4
   140321249:	00 
   14032124a:	44 0f 28 04 24       	movaps xmm8,XMMWORD PTR [rsp]
   14032124f:	48 83 c4 20          	add    rsp,0x20
   140321253:	5b                   	pop    rbx
   140321254:	c3                   	ret
   140321255:	f3 0f 10 1d 7f ed 52 	movss  xmm3,DWORD PTR [rip+0x52ed7f]        # 0x14084ffdc
   14032125c:	00 
   14032125d:	48 89 74 24 30       	mov    QWORD PTR [rsp+0x30],rsi
   140321262:	33 f6                	xor    esi,esi
   140321264:	48 89 7c 24 38       	mov    QWORD PTR [rsp+0x38],rdi
   140321269:	0f b6 b9 92 00 00 00 	movzx  edi,BYTE PTR [rcx+0x92]
   140321270:	40 84 ff             	test   dil,dil
   140321273:	75 0d                	jne    0x140321282
   140321275:	40 38 b1 93 00 00 00 	cmp    BYTE PTR [rcx+0x93],sil
   14032127c:	0f 84 4c 02 00 00    	je     0x1403214ce
   140321282:	66 41 3b f2          	cmp    si,r10w
   140321286:	0f 83 42 02 00 00    	jae    0x1403214ce
   14032128c:	f3 0f 10 62 18       	movss  xmm4,DWORD PTR [rdx+0x18]
   140321291:	49 83 c0 1c          	add    r8,0x1c
   140321295:	f3 0f 5c 25 9f 5e 37 	subss  xmm4,DWORD PTR [rip+0x375e9f]        # 0x14069713c
   14032129c:	00 
   14032129d:	f3 0f 10 2d 2b ed 52 	movss  xmm5,DWORD PTR [rip+0x52ed2b]        # 0x14084ffd0
   1403212a4:	00 
   1403212a5:	45 0f b7 ca          	movzx  r9d,r10w
   1403212a9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   1403212b0:	41 0f 2f a0 c0 00 00 	comiss xmm4,DWORD PTR [r8+0xc0]
   1403212b7:	00 
   1403212b8:	0f 86 ff 01 00 00    	jbe    0x1403214bd
   1403212be:	0f 57 c0             	xorps  xmm0,xmm0
   1403212c1:	49 8d 88 c4 02 00 00 	lea    rcx,[r8+0x2c4]
   1403212c8:	49 8b c0             	mov    rax,r8
   1403212cb:	ba 03 00 00 00       	mov    edx,0x3
   1403212d0:	f3 0f 10 48 fc       	movss  xmm1,DWORD PTR [rax-0x4]
   1403212d5:	f3 0f 10 91 c4 fe ff 	movss  xmm2,DWORD PTR [rcx-0x13c]
   1403212dc:	ff 
   1403212dd:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403212e1:	0f 2f d1             	comiss xmm2,xmm1
   1403212e4:	77 03                	ja     0x1403212e9
   1403212e6:	0f 28 d1             	movaps xmm2,xmm1
   1403212e9:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   1403212ed:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403212f1:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]
   1403212f5:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403212f9:	0f 2f d1             	comiss xmm2,xmm1
   1403212fc:	77 03                	ja     0x140321301
   1403212fe:	0f 28 d1             	movaps xmm2,xmm1
   140321301:	f3 0f 10 48 04       	movss  xmm1,DWORD PTR [rax+0x4]
   140321306:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032130a:	f3 0f 10 91 3c 01 00 	movss  xmm2,DWORD PTR [rcx+0x13c]
   140321311:	00 
   140321312:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321316:	0f 2f d1             	comiss xmm2,xmm1
   140321319:	77 03                	ja     0x14032131e
   14032131b:	0f 28 d1             	movaps xmm2,xmm1
   14032131e:	f3 0f 10 48 08       	movss  xmm1,DWORD PTR [rax+0x8]
   140321323:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321327:	f3 0f 10 91 78 02 00 	movss  xmm2,DWORD PTR [rcx+0x278]
   14032132e:	00 
   14032132f:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321333:	0f 2f d1             	comiss xmm2,xmm1
   140321336:	77 03                	ja     0x14032133b
   140321338:	0f 28 d1             	movaps xmm2,xmm1
   14032133b:	f3 0f 10 48 0c       	movss  xmm1,DWORD PTR [rax+0xc]
   140321340:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321344:	f3 0f 10 91 b4 03 00 	movss  xmm2,DWORD PTR [rcx+0x3b4]
   14032134b:	00 
   14032134c:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321350:	0f 2f d1             	comiss xmm2,xmm1
   140321353:	77 03                	ja     0x140321358
   140321355:	0f 28 d1             	movaps xmm2,xmm1
   140321358:	f3 0f 10 48 10       	movss  xmm1,DWORD PTR [rax+0x10]
   14032135d:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321361:	f3 0f 10 91 f0 04 00 	movss  xmm2,DWORD PTR [rcx+0x4f0]
   140321368:	00 
   140321369:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14032136d:	0f 2f d1             	comiss xmm2,xmm1
   140321370:	77 03                	ja     0x140321375
   140321372:	0f 28 d1             	movaps xmm2,xmm1
   140321375:	f3 0f 10 48 14       	movss  xmm1,DWORD PTR [rax+0x14]
   14032137a:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032137e:	f3 0f 10 91 2c 06 00 	movss  xmm2,DWORD PTR [rcx+0x62c]
   140321385:	00 
   140321386:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14032138a:	0f 2f d1             	comiss xmm2,xmm1
   14032138d:	77 03                	ja     0x140321392
   14032138f:	0f 28 d1             	movaps xmm2,xmm1
   140321392:	f3 0f 10 48 18       	movss  xmm1,DWORD PTR [rax+0x18]
   140321397:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032139b:	f3 0f 10 91 68 07 00 	movss  xmm2,DWORD PTR [rcx+0x768]
   1403213a2:	00 
   1403213a3:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403213a7:	0f 2f d1             	comiss xmm2,xmm1
   1403213aa:	77 03                	ja     0x1403213af
   1403213ac:	0f 28 d1             	movaps xmm2,xmm1
   1403213af:	f3 0f 10 48 1c       	movss  xmm1,DWORD PTR [rax+0x1c]
   1403213b4:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403213b8:	f3 0f 10 91 a4 08 00 	movss  xmm2,DWORD PTR [rcx+0x8a4]
   1403213bf:	00 
   1403213c0:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403213c4:	0f 2f d1             	comiss xmm2,xmm1
   1403213c7:	77 03                	ja     0x1403213cc
   1403213c9:	0f 28 d1             	movaps xmm2,xmm1
   1403213cc:	f3 0f 10 48 20       	movss  xmm1,DWORD PTR [rax+0x20]
   1403213d1:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403213d5:	f3 0f 10 91 e0 09 00 	movss  xmm2,DWORD PTR [rcx+0x9e0]
   1403213dc:	00 
   1403213dd:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403213e1:	0f 2f d1             	comiss xmm2,xmm1
   1403213e4:	77 03                	ja     0x1403213e9
   1403213e6:	0f 28 d1             	movaps xmm2,xmm1
   1403213e9:	f3 0f 10 48 24       	movss  xmm1,DWORD PTR [rax+0x24]
   1403213ee:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403213f2:	f3 0f 10 91 1c 0b 00 	movss  xmm2,DWORD PTR [rcx+0xb1c]
   1403213f9:	00 
   1403213fa:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403213fe:	0f 2f d1             	comiss xmm2,xmm1
   140321401:	77 03                	ja     0x140321406
   140321403:	0f 28 d1             	movaps xmm2,xmm1
   140321406:	f3 0f 10 48 28       	movss  xmm1,DWORD PTR [rax+0x28]
   14032140b:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032140f:	f3 0f 10 91 58 0c 00 	movss  xmm2,DWORD PTR [rcx+0xc58]
   140321416:	00 
   140321417:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14032141b:	0f 2f d1             	comiss xmm2,xmm1
   14032141e:	77 03                	ja     0x140321423
   140321420:	0f 28 d1             	movaps xmm2,xmm1
   140321423:	f3 0f 10 48 2c       	movss  xmm1,DWORD PTR [rax+0x2c]
   140321428:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032142c:	f3 0f 10 91 94 0d 00 	movss  xmm2,DWORD PTR [rcx+0xd94]
   140321433:	00 
   140321434:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321438:	0f 2f d1             	comiss xmm2,xmm1
   14032143b:	77 03                	ja     0x140321440
   14032143d:	0f 28 d1             	movaps xmm2,xmm1
   140321440:	f3 0f 10 48 30       	movss  xmm1,DWORD PTR [rax+0x30]
   140321445:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321449:	f3 0f 10 91 d0 0e 00 	movss  xmm2,DWORD PTR [rcx+0xed0]
   140321450:	00 
   140321451:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321455:	0f 2f d1             	comiss xmm2,xmm1
   140321458:	77 03                	ja     0x14032145d
   14032145a:	0f 28 d1             	movaps xmm2,xmm1
   14032145d:	f3 0f 10 48 34       	movss  xmm1,DWORD PTR [rax+0x34]
   140321462:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321466:	f3 0f 10 91 0c 10 00 	movss  xmm2,DWORD PTR [rcx+0x100c]
   14032146d:	00 
   14032146e:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321472:	0f 2f d1             	comiss xmm2,xmm1
   140321475:	77 03                	ja     0x14032147a
   140321477:	0f 28 d1             	movaps xmm2,xmm1
   14032147a:	f3 0f 10 48 38       	movss  xmm1,DWORD PTR [rax+0x38]
   14032147f:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321483:	f3 0f 10 91 48 11 00 	movss  xmm2,DWORD PTR [rcx+0x1148]
   14032148a:	00 
   14032148b:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14032148f:	0f 2f d1             	comiss xmm2,xmm1
   140321492:	77 03                	ja     0x140321497
   140321494:	0f 28 d1             	movaps xmm2,xmm1
   140321497:	48 83 c0 40          	add    rax,0x40
   14032149b:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032149f:	48 81 c1 c0 13 00 00 	add    rcx,0x13c0
   1403214a6:	48 83 ea 01          	sub    rdx,0x1
   1403214aa:	0f 85 20 fe ff ff    	jne    0x1403212d0
   1403214b0:	f3 0f 59 c5          	mulss  xmm0,xmm5
   1403214b4:	f3 41 0f 5f c0       	maxss  xmm0,xmm8
   1403214b9:	44 0f 28 c0          	movaps xmm8,xmm0
   1403214bd:	49 81 c0 18 3c 00 00 	add    r8,0x3c18
   1403214c4:	49 83 e9 01          	sub    r9,0x1
   1403214c8:	0f 85 e2 fd ff ff    	jne    0x1403212b0
   1403214ce:	66 41 3b f2          	cmp    si,r10w
   1403214d2:	0f 57 ed             	xorps  xmm5,xmm5
   1403214d5:	48 8b 74 24 30       	mov    rsi,QWORD PTR [rsp+0x30]
   1403214da:	0f 57 e4             	xorps  xmm4,xmm4
   1403214dd:	0f 83 38 02 00 00    	jae    0x14032171b
   1403214e3:	0f 29 74 24 10       	movaps XMMWORD PTR [rsp+0x10],xmm6
   1403214e8:	4c 8d 83 e0 02 00 00 	lea    r8,[rbx+0x2e0]
   1403214ef:	f3 41 0f 10 73 18    	movss  xmm6,DWORD PTR [r11+0x18]
   1403214f5:	f3 0f 5c 35 3f 5c 37 	subss  xmm6,DWORD PTR [rip+0x375c3f]        # 0x14069713c
   1403214fc:	00 
   1403214fd:	45 0f b7 ca          	movzx  r9d,r10w
   140321501:	0f 57 c0             	xorps  xmm0,xmm0
   140321504:	49 8d 80 3c fd ff ff 	lea    rax,[r8-0x2c4]
   14032150b:	49 8b c8             	mov    rcx,r8
   14032150e:	ba 03 00 00 00       	mov    edx,0x3
   140321513:	f3 0f 10 48 fc       	movss  xmm1,DWORD PTR [rax-0x4]
   140321518:	f3 0f 10 91 c4 fe ff 	movss  xmm2,DWORD PTR [rcx-0x13c]
   14032151f:	ff 
   140321520:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321524:	0f 2f d1             	comiss xmm2,xmm1
   140321527:	77 03                	ja     0x14032152c
   140321529:	0f 28 d1             	movaps xmm2,xmm1
   14032152c:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   140321530:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321534:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]
   140321538:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14032153c:	0f 2f d1             	comiss xmm2,xmm1
   14032153f:	77 03                	ja     0x140321544
   140321541:	0f 28 d1             	movaps xmm2,xmm1
   140321544:	f3 0f 10 48 04       	movss  xmm1,DWORD PTR [rax+0x4]
   140321549:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032154d:	f3 0f 10 91 3c 01 00 	movss  xmm2,DWORD PTR [rcx+0x13c]
   140321554:	00 
   140321555:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321559:	0f 2f d1             	comiss xmm2,xmm1
   14032155c:	77 03                	ja     0x140321561
   14032155e:	0f 28 d1             	movaps xmm2,xmm1
   140321561:	f3 0f 10 48 08       	movss  xmm1,DWORD PTR [rax+0x8]
   140321566:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032156a:	f3 0f 10 91 78 02 00 	movss  xmm2,DWORD PTR [rcx+0x278]
   140321571:	00 
   140321572:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321576:	0f 2f d1             	comiss xmm2,xmm1
   140321579:	77 03                	ja     0x14032157e
   14032157b:	0f 28 d1             	movaps xmm2,xmm1
   14032157e:	f3 0f 10 48 0c       	movss  xmm1,DWORD PTR [rax+0xc]
   140321583:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321587:	f3 0f 10 91 b4 03 00 	movss  xmm2,DWORD PTR [rcx+0x3b4]
   14032158e:	00 
   14032158f:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321593:	0f 2f d1             	comiss xmm2,xmm1
   140321596:	77 03                	ja     0x14032159b
   140321598:	0f 28 d1             	movaps xmm2,xmm1
   14032159b:	f3 0f 10 48 10       	movss  xmm1,DWORD PTR [rax+0x10]
   1403215a0:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403215a4:	f3 0f 10 91 f0 04 00 	movss  xmm2,DWORD PTR [rcx+0x4f0]
   1403215ab:	00 
   1403215ac:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403215b0:	0f 2f d1             	comiss xmm2,xmm1
   1403215b3:	77 03                	ja     0x1403215b8
   1403215b5:	0f 28 d1             	movaps xmm2,xmm1
   1403215b8:	f3 0f 10 48 14       	movss  xmm1,DWORD PTR [rax+0x14]
   1403215bd:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403215c1:	f3 0f 10 91 2c 06 00 	movss  xmm2,DWORD PTR [rcx+0x62c]
   1403215c8:	00 
   1403215c9:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403215cd:	0f 2f d1             	comiss xmm2,xmm1
   1403215d0:	77 03                	ja     0x1403215d5
   1403215d2:	0f 28 d1             	movaps xmm2,xmm1
   1403215d5:	f3 0f 10 48 18       	movss  xmm1,DWORD PTR [rax+0x18]
   1403215da:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403215de:	f3 0f 10 91 68 07 00 	movss  xmm2,DWORD PTR [rcx+0x768]
   1403215e5:	00 
   1403215e6:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403215ea:	0f 2f d1             	comiss xmm2,xmm1
   1403215ed:	77 03                	ja     0x1403215f2
   1403215ef:	0f 28 d1             	movaps xmm2,xmm1
   1403215f2:	f3 0f 10 48 1c       	movss  xmm1,DWORD PTR [rax+0x1c]
   1403215f7:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403215fb:	f3 0f 10 91 a4 08 00 	movss  xmm2,DWORD PTR [rcx+0x8a4]
   140321602:	00 
   140321603:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321607:	0f 2f d1             	comiss xmm2,xmm1
   14032160a:	77 03                	ja     0x14032160f
   14032160c:	0f 28 d1             	movaps xmm2,xmm1
   14032160f:	f3 0f 10 48 20       	movss  xmm1,DWORD PTR [rax+0x20]
   140321614:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321618:	f3 0f 10 91 e0 09 00 	movss  xmm2,DWORD PTR [rcx+0x9e0]
   14032161f:	00 
   140321620:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321624:	0f 2f d1             	comiss xmm2,xmm1
   140321627:	77 03                	ja     0x14032162c
   140321629:	0f 28 d1             	movaps xmm2,xmm1
   14032162c:	f3 0f 10 48 24       	movss  xmm1,DWORD PTR [rax+0x24]
   140321631:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321635:	f3 0f 10 91 1c 0b 00 	movss  xmm2,DWORD PTR [rcx+0xb1c]
   14032163c:	00 
   14032163d:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321641:	0f 2f d1             	comiss xmm2,xmm1
   140321644:	77 03                	ja     0x140321649
   140321646:	0f 28 d1             	movaps xmm2,xmm1
   140321649:	f3 0f 10 48 28       	movss  xmm1,DWORD PTR [rax+0x28]
   14032164e:	f3 0f 58 c2          	addss  xmm0,xmm2
   140321652:	f3 0f 10 91 58 0c 00 	movss  xmm2,DWORD PTR [rcx+0xc58]
   140321659:	00 
   14032165a:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14032165e:	0f 2f d1             	comiss xmm2,xmm1
   140321661:	77 03                	ja     0x140321666
   140321663:	0f 28 d1             	movaps xmm2,xmm1
   140321666:	f3 0f 10 48 2c       	movss  xmm1,DWORD PTR [rax+0x2c]
   14032166b:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032166f:	f3 0f 10 91 94 0d 00 	movss  xmm2,DWORD PTR [rcx+0xd94]
   140321676:	00 
   140321677:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14032167b:	0f 2f d1             	comiss xmm2,xmm1
   14032167e:	77 03                	ja     0x140321683
   140321680:	0f 28 d1             	movaps xmm2,xmm1
   140321683:	f3 0f 10 48 30       	movss  xmm1,DWORD PTR [rax+0x30]
   140321688:	f3 0f 58 c2          	addss  xmm0,xmm2
   14032168c:	f3 0f 10 91 d0 0e 00 	movss  xmm2,DWORD PTR [rcx+0xed0]
   140321693:	00 
   140321694:	f3 0f 59 cb          	mulss  xmm1,xmm3
   140321698:	0f 2f d1             	comiss xmm2,xmm1
   14032169b:	77 03                	ja     0x1403216a0
   14032169d:	0f 28 d1             	movaps xmm2,xmm1
   1403216a0:	f3 0f 10 48 34       	movss  xmm1,DWORD PTR [rax+0x34]
   1403216a5:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403216a9:	f3 0f 10 91 0c 10 00 	movss  xmm2,DWORD PTR [rcx+0x100c]
   1403216b0:	00 
   1403216b1:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403216b5:	0f 2f d1             	comiss xmm2,xmm1
   1403216b8:	77 03                	ja     0x1403216bd
   1403216ba:	0f 28 d1             	movaps xmm2,xmm1
   1403216bd:	f3 0f 10 48 38       	movss  xmm1,DWORD PTR [rax+0x38]
   1403216c2:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403216c6:	f3 0f 10 91 48 11 00 	movss  xmm2,DWORD PTR [rcx+0x1148]
   1403216cd:	00 
   1403216ce:	f3 0f 59 cb          	mulss  xmm1,xmm3
   1403216d2:	0f 2f d1             	comiss xmm2,xmm1
   1403216d5:	77 03                	ja     0x1403216da
   1403216d7:	0f 28 d1             	movaps xmm2,xmm1
   1403216da:	48 83 c0 40          	add    rax,0x40
   1403216de:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403216e2:	48 81 c1 c0 13 00 00 	add    rcx,0x13c0
   1403216e9:	48 83 ea 01          	sub    rdx,0x1
   1403216ed:	0f 85 20 fe ff ff    	jne    0x140321513
   1403216f3:	41 0f 2f b0 fc fd ff 	comiss xmm6,DWORD PTR [r8-0x204]
   1403216fa:	ff 
   1403216fb:	76 04                	jbe    0x140321701
   1403216fd:	f3 0f 58 e0          	addss  xmm4,xmm0
   140321701:	49 81 c0 18 3c 00 00 	add    r8,0x3c18
   140321708:	f3 0f 58 e8          	addss  xmm5,xmm0
   14032170c:	49 83 e9 01          	sub    r9,0x1
   140321710:	0f 85 eb fd ff ff    	jne    0x140321501
   140321716:	0f 28 74 24 10       	movaps xmm6,XMMWORD PTR [rsp+0x10]
   14032171b:	f3 0f 59 25 11 74 37 	mulss  xmm4,DWORD PTR [rip+0x377411]        # 0x140698b34
   140321722:	00 
   140321723:	40 84 ff             	test   dil,dil
   140321726:	48 8b 7c 24 38       	mov    rdi,QWORD PTR [rsp+0x38]
   14032172b:	f3 41 0f 5f e0       	maxss  xmm4,xmm8
   140321730:	74 0a                	je     0x14032173c
   140321732:	f2 0f 10 05 16 62 38 	movsd  xmm0,QWORD PTR [rip+0x386216]        # 0x1406a7950
   140321739:	00 
   14032173a:	eb 08                	jmp    0x140321744
   14032173c:	f2 0f 10 05 14 62 38 	movsd  xmm0,QWORD PTR [rip+0x386214]        # 0x1406a7958
   140321743:	00 
   140321744:	44 0f 28 04 24       	movaps xmm8,XMMWORD PTR [rsp]
   140321749:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032174d:	f3 0f 10 05 4b eb 52 	movss  xmm0,DWORD PTR [rip+0x52eb4b]        # 0x1408502a0
   140321754:	00 
   140321755:	f3 0f 59 cd          	mulss  xmm1,xmm5
   140321759:	f3 0f 5f cc          	maxss  xmm1,xmm4
   14032175d:	f3 0f 5f c1          	maxss  xmm0,xmm1
   140321761:	48 83 c4 20          	add    rsp,0x20
   140321765:	5b                   	pop    rbx
   140321766:	c3                   	ret
   140321767:	cc                   	int3
   140321768:	cc                   	int3
   140321769:	cc                   	int3
   14032176a:	cc                   	int3
   14032176b:	cc                   	int3
   14032176c:	cc                   	int3
   14032176d:	cc                   	int3
   14032176e:	cc                   	int3
   14032176f:	cc                   	int3
