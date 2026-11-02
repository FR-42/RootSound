
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140378220 <.text+0x377220>:
   140378220:	4c 8b dc             	mov    r11,rsp
   140378223:	53                   	push   rbx
   140378224:	41 55                	push   r13
   140378226:	48 81 ec 28 07 00 00 	sub    rsp,0x728
   14037822d:	48 8b 05 34 9f 5f 00 	mov    rax,QWORD PTR [rip+0x5f9f34]        # 0x140972168
   140378234:	48 33 c4             	xor    rax,rsp
   140378237:	48 89 84 24 70 06 00 	mov    QWORD PTR [rsp+0x670],rax
   14037823e:	00 
   14037823f:	41 0f 29 73 c8       	movaps XMMWORD PTR [r11-0x38],xmm6
   140378244:	48 8d 05 25 e1 b8 14 	lea    rax,[rip+0x14b8e125]        # 0x154f06370
   14037824b:	41 0f 29 7b b8       	movaps XMMWORD PTR [r11-0x48],xmm7
   140378250:	45 33 ed             	xor    r13d,r13d
   140378253:	45 0f 29 43 a8       	movaps XMMWORD PTR [r11-0x58],xmm8
   140378258:	48 8b d9             	mov    rbx,rcx
   14037825b:	45 0f 29 4b 98       	movaps XMMWORD PTR [r11-0x68],xmm9
   140378260:	45 0f 29 53 88       	movaps XMMWORD PTR [r11-0x78],xmm10
   140378265:	45 0f 29 9b 78 ff ff 	movaps XMMWORD PTR [r11-0x88],xmm11
   14037826c:	ff 
   14037826d:	41 8d 4d 10          	lea    ecx,[r13+0x10]
   140378271:	45 0f 29 a3 68 ff ff 	movaps XMMWORD PTR [r11-0x98],xmm12
   140378278:	ff 
   140378279:	45 0f 29 ab 58 ff ff 	movaps XMMWORD PTR [r11-0xa8],xmm13
   140378280:	ff 
   140378281:	45 0f 29 b3 48 ff ff 	movaps XMMWORD PTR [r11-0xb8],xmm14
   140378288:	ff 
   140378289:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140378290:	4c 89 28             	mov    QWORD PTR [rax],r13
   140378293:	4c 89 68 08          	mov    QWORD PTR [rax+0x8],r13
   140378297:	4c 89 68 10          	mov    QWORD PTR [rax+0x10],r13
   14037829b:	48 8d 40 40          	lea    rax,[rax+0x40]
   14037829f:	4c 89 68 d8          	mov    QWORD PTR [rax-0x28],r13
   1403782a3:	4c 89 68 e0          	mov    QWORD PTR [rax-0x20],r13
   1403782a7:	4c 89 68 e8          	mov    QWORD PTR [rax-0x18],r13
   1403782ab:	4c 89 68 f0          	mov    QWORD PTR [rax-0x10],r13
   1403782af:	4c 89 68 f8          	mov    QWORD PTR [rax-0x8],r13
   1403782b3:	48 83 e9 01          	sub    rcx,0x1
   1403782b7:	75 d7                	jne    0x140378290
   1403782b9:	b9 38 00 00 00       	mov    ecx,0x38
   1403782be:	e8 8d 33 2a 00       	call   0x14061b650
   1403782c3:	33 c9                	xor    ecx,ecx
   1403782c5:	48 89 05 a4 e0 b8 14 	mov    QWORD PTR [rip+0x14b8e0a4],rax        # 0x154f06370
   1403782cc:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403782cf:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403782d3:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403782d7:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403782db:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403782df:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403782e3:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403782e7:	b9 0c 00 00 00       	mov    ecx,0xc
   1403782ec:	e8 6f 32 2a 00       	call   0x14061b560
   1403782f1:	48 8b 0d 78 e0 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8e078]        # 0x154f06370
   1403782f8:	4c 8d 05 e9 72 33 00 	lea    r8,[rip+0x3372e9]        # 0x1406af5e8
   1403782ff:	ba 06 00 00 00       	mov    edx,0x6
   140378304:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378307:	48 8b c8             	mov    rcx,rax
   14037830a:	e8 41 fd 1b 00       	call   0x140538050
   14037830f:	48 8b 05 5a e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e05a]        # 0x154f06370
   140378316:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037831a:	48 8b 05 4f e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e04f]        # 0x154f06370
   140378321:	c6 40 09 7f          	mov    BYTE PTR [rax+0x9],0x7f
   140378325:	48 8b 05 44 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e044]        # 0x154f06370
   14037832c:	c6 40 0a 7f          	mov    BYTE PTR [rax+0xa],0x7f
   140378330:	48 8b 05 39 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e039]        # 0x154f06370
   140378337:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037833b:	48 8b 05 2e e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e02e]        # 0x154f06370
   140378342:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   140378349:	48 8b 05 20 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e020]        # 0x154f06370
   140378350:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378354:	48 8b 05 15 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e015]        # 0x154f06370
   14037835b:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037835f:	48 8b 05 0a e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e00a]        # 0x154f06370
   140378366:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037836a:	48 8b 05 ff df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfff]        # 0x154f06370
   140378371:	c7 40 1c 00 00 40 40 	mov    DWORD PTR [rax+0x1c],0x40400000
   140378378:	48 8b 05 f1 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dff1]        # 0x154f06370
   14037837f:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140378386:	48 8b 05 e3 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfe3]        # 0x154f06370
   14037838d:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   140378394:	48 8b 05 d5 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfd5]        # 0x154f06370
   14037839b:	c7 40 24 00 00 80 3f 	mov    DWORD PTR [rax+0x24],0x3f800000
   1403783a2:	48 8b 05 c7 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfc7]        # 0x154f06370
   1403783a9:	44 89 68 28          	mov    DWORD PTR [rax+0x28],r13d
   1403783ad:	48 8b 0d cc df b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dfcc]        # 0x154f06380
   1403783b4:	48 85 c9             	test   rcx,rcx
   1403783b7:	74 28                	je     0x1403783e1
   1403783b9:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403783bc:	48 85 c0             	test   rax,rax
   1403783bf:	74 0f                	je     0x1403783d0
   1403783c1:	48 8b c8             	mov    rcx,rax
   1403783c4:	e8 8f 31 2a 00       	call   0x14061b558
   1403783c9:	48 8b 0d b0 df b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dfb0]        # 0x154f06380
   1403783d0:	ba 38 00 00 00       	mov    edx,0x38
   1403783d5:	e8 7e 31 2a 00       	call   0x14061b558
   1403783da:	4c 89 2d 9f df b8 14 	mov    QWORD PTR [rip+0x14b8df9f],r13        # 0x154f06380
   1403783e1:	b9 38 00 00 00       	mov    ecx,0x38
   1403783e6:	e8 65 32 2a 00       	call   0x14061b650
   1403783eb:	33 c9                	xor    ecx,ecx
   1403783ed:	48 89 05 8c df b8 14 	mov    QWORD PTR [rip+0x14b8df8c],rax        # 0x154f06380
   1403783f4:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403783f7:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403783fb:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403783ff:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378403:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378407:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037840b:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037840f:	b9 12 00 00 00       	mov    ecx,0x12
   140378414:	e8 47 31 2a 00       	call   0x14061b560
   140378419:	48 8b 0d 60 df b8 14 	mov    rcx,QWORD PTR [rip+0x14b8df60]        # 0x154f06380
   140378420:	4c 8d 05 d1 71 33 00 	lea    r8,[rip+0x3371d1]        # 0x1406af5f8
   140378427:	ba 09 00 00 00       	mov    edx,0x9
   14037842c:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037842f:	48 8b c8             	mov    rcx,rax
   140378432:	e8 19 fc 1b 00       	call   0x140538050
   140378437:	48 8b 05 42 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8df42]        # 0x154f06380
   14037843e:	c6 40 08 35          	mov    BYTE PTR [rax+0x8],0x35
   140378442:	48 8b 05 37 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8df37]        # 0x154f06380
   140378449:	c6 40 09 5b          	mov    BYTE PTR [rax+0x9],0x5b
   14037844d:	48 8b 05 2c df b8 14 	mov    rax,QWORD PTR [rip+0x14b8df2c]        # 0x154f06380
   140378454:	c6 40 0a 5b          	mov    BYTE PTR [rax+0xa],0x5b
   140378458:	48 8b 05 21 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8df21]        # 0x154f06380
   14037845f:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   140378463:	48 8b 05 16 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8df16]        # 0x154f06380
   14037846a:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   140378471:	48 8b 05 08 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8df08]        # 0x154f06380
   140378478:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037847c:	48 8b 05 fd de b8 14 	mov    rax,QWORD PTR [rip+0x14b8defd]        # 0x154f06380
   140378483:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140378487:	48 8b 05 f2 de b8 14 	mov    rax,QWORD PTR [rip+0x14b8def2]        # 0x154f06380
   14037848e:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378492:	48 8b 05 e7 de b8 14 	mov    rax,QWORD PTR [rip+0x14b8dee7]        # 0x154f06380
   140378499:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   1403784a0:	48 8b 05 d9 de b8 14 	mov    rax,QWORD PTR [rip+0x14b8ded9]        # 0x154f06380
   1403784a7:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   1403784ae:	48 8b 05 cb de b8 14 	mov    rax,QWORD PTR [rip+0x14b8decb]        # 0x154f06380
   1403784b5:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   1403784bc:	48 8b 05 bd de b8 14 	mov    rax,QWORD PTR [rip+0x14b8debd]        # 0x154f06380
   1403784c3:	c7 40 24 00 00 80 3f 	mov    DWORD PTR [rax+0x24],0x3f800000
   1403784ca:	48 8b 05 af de b8 14 	mov    rax,QWORD PTR [rip+0x14b8deaf]        # 0x154f06380
   1403784d1:	c7 40 28 a3 00 00 00 	mov    DWORD PTR [rax+0x28],0xa3
   1403784d8:	48 8b 0d 99 de b8 14 	mov    rcx,QWORD PTR [rip+0x14b8de99]        # 0x154f06378
   1403784df:	48 85 c9             	test   rcx,rcx
   1403784e2:	74 28                	je     0x14037850c
   1403784e4:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403784e7:	48 85 c0             	test   rax,rax
   1403784ea:	74 0f                	je     0x1403784fb
   1403784ec:	48 8b c8             	mov    rcx,rax
   1403784ef:	e8 64 30 2a 00       	call   0x14061b558
   1403784f4:	48 8b 0d 7d de b8 14 	mov    rcx,QWORD PTR [rip+0x14b8de7d]        # 0x154f06378
   1403784fb:	ba 38 00 00 00       	mov    edx,0x38
   140378500:	e8 53 30 2a 00       	call   0x14061b558
   140378505:	4c 89 2d 6c de b8 14 	mov    QWORD PTR [rip+0x14b8de6c],r13        # 0x154f06378
   14037850c:	b9 38 00 00 00       	mov    ecx,0x38
   140378511:	e8 3a 31 2a 00       	call   0x14061b650
   140378516:	33 c9                	xor    ecx,ecx
   140378518:	48 89 05 59 de b8 14 	mov    QWORD PTR [rip+0x14b8de59],rax        # 0x154f06378
   14037851f:	48 89 08             	mov    QWORD PTR [rax],rcx
   140378522:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140378526:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037852a:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037852e:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378532:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140378536:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037853a:	b9 0c 00 00 00       	mov    ecx,0xc
   14037853f:	e8 1c 30 2a 00       	call   0x14061b560
   140378544:	48 8b 0d 2d de b8 14 	mov    rcx,QWORD PTR [rip+0x14b8de2d]        # 0x154f06378
   14037854b:	4c 8d 05 be 70 33 00 	lea    r8,[rip+0x3370be]        # 0x1406af610
   140378552:	ba 06 00 00 00       	mov    edx,0x6
   140378557:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037855a:	48 8b c8             	mov    rcx,rax
   14037855d:	e8 ee fa 1b 00       	call   0x140538050
   140378562:	48 8b 05 0f de b8 14 	mov    rax,QWORD PTR [rip+0x14b8de0f]        # 0x154f06378
   140378569:	c6 40 08 29          	mov    BYTE PTR [rax+0x8],0x29
   14037856d:	48 8b 05 04 de b8 14 	mov    rax,QWORD PTR [rip+0x14b8de04]        # 0x154f06378
   140378574:	c6 40 09 5b          	mov    BYTE PTR [rax+0x9],0x5b
   140378578:	48 8b 05 f9 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddf9]        # 0x154f06378
   14037857f:	c6 40 0a 5b          	mov    BYTE PTR [rax+0xa],0x5b
   140378583:	48 8b 05 ee dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddee]        # 0x154f06378
   14037858a:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037858e:	48 8b 05 e3 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dde3]        # 0x154f06378
   140378595:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   14037859c:	48 8b 05 d5 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddd5]        # 0x154f06378
   1403785a3:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   1403785a7:	48 8b 05 ca dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddca]        # 0x154f06378
   1403785ae:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   1403785b2:	48 8b 05 bf dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddbf]        # 0x154f06378
   1403785b9:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   1403785bd:	48 8b 05 b4 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddb4]        # 0x154f06378
   1403785c4:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   1403785cb:	48 8b 05 a6 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dda6]        # 0x154f06378
   1403785d2:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   1403785d9:	48 8b 05 98 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dd98]        # 0x154f06378
   1403785e0:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   1403785e7:	48 8b 05 8a dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dd8a]        # 0x154f06378
   1403785ee:	c7 40 24 00 00 80 3f 	mov    DWORD PTR [rax+0x24],0x3f800000
   1403785f5:	48 8b 05 7c dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dd7c]        # 0x154f06378
   1403785fc:	c7 40 28 a3 00 00 00 	mov    DWORD PTR [rax+0x28],0xa3
   140378603:	48 8b 0d 9e de b8 14 	mov    rcx,QWORD PTR [rip+0x14b8de9e]        # 0x154f064a8
   14037860a:	48 85 c9             	test   rcx,rcx
   14037860d:	74 28                	je     0x140378637
   14037860f:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378612:	48 85 c0             	test   rax,rax
   140378615:	74 0f                	je     0x140378626
   140378617:	48 8b c8             	mov    rcx,rax
   14037861a:	e8 39 2f 2a 00       	call   0x14061b558
   14037861f:	48 8b 0d 82 de b8 14 	mov    rcx,QWORD PTR [rip+0x14b8de82]        # 0x154f064a8
   140378626:	ba 38 00 00 00       	mov    edx,0x38
   14037862b:	e8 28 2f 2a 00       	call   0x14061b558
   140378630:	4c 89 2d 71 de b8 14 	mov    QWORD PTR [rip+0x14b8de71],r13        # 0x154f064a8
   140378637:	b9 38 00 00 00       	mov    ecx,0x38
   14037863c:	e8 0f 30 2a 00       	call   0x14061b650
   140378641:	33 c9                	xor    ecx,ecx
   140378643:	48 89 05 5e de b8 14 	mov    QWORD PTR [rip+0x14b8de5e],rax        # 0x154f064a8
   14037864a:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037864d:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140378651:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140378655:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378659:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037865d:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140378661:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140378665:	b9 1c 00 00 00       	mov    ecx,0x1c
   14037866a:	e8 f1 2e 2a 00       	call   0x14061b560
   14037866f:	48 8b 0d 32 de b8 14 	mov    rcx,QWORD PTR [rip+0x14b8de32]        # 0x154f064a8
   140378676:	4c 8d 05 a3 6f 33 00 	lea    r8,[rip+0x336fa3]        # 0x1406af620
   14037867d:	ba 0e 00 00 00       	mov    edx,0xe
   140378682:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378685:	48 8b c8             	mov    rcx,rax
   140378688:	e8 c3 f9 1b 00       	call   0x140538050
   14037868d:	48 8b 05 14 de b8 14 	mov    rax,QWORD PTR [rip+0x14b8de14]        # 0x154f064a8
   140378694:	c6 40 08 29          	mov    BYTE PTR [rax+0x8],0x29
   140378698:	48 8b 05 09 de b8 14 	mov    rax,QWORD PTR [rip+0x14b8de09]        # 0x154f064a8
   14037869f:	c6 40 09 5b          	mov    BYTE PTR [rax+0x9],0x5b
   1403786a3:	48 8b 05 fe dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddfe]        # 0x154f064a8
   1403786aa:	c6 40 0a 5b          	mov    BYTE PTR [rax+0xa],0x5b
   1403786ae:	48 8b 05 f3 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddf3]        # 0x154f064a8
   1403786b5:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   1403786b9:	48 8b 05 e8 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dde8]        # 0x154f064a8
   1403786c0:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   1403786c7:	48 8b 05 da dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddda]        # 0x154f064a8
   1403786ce:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   1403786d2:	48 8b 05 cf dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddcf]        # 0x154f064a8
   1403786d9:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   1403786dd:	48 8b 05 c4 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddc4]        # 0x154f064a8
   1403786e4:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   1403786e8:	48 8b 05 b9 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddb9]        # 0x154f064a8
   1403786ef:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   1403786f6:	48 8b 05 ab dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8ddab]        # 0x154f064a8
   1403786fd:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140378704:	48 8b 05 9d dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dd9d]        # 0x154f064a8
   14037870b:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   140378712:	48 8b 05 8f dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dd8f]        # 0x154f064a8
   140378719:	c7 40 24 00 00 80 3f 	mov    DWORD PTR [rax+0x24],0x3f800000
   140378720:	48 8b 05 81 dd b8 14 	mov    rax,QWORD PTR [rip+0x14b8dd81]        # 0x154f064a8
   140378727:	c7 40 28 a3 00 00 00 	mov    DWORD PTR [rax+0x28],0xa3
   14037872e:	48 8b 0d 53 dc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dc53]        # 0x154f06388
   140378735:	48 85 c9             	test   rcx,rcx
   140378738:	74 28                	je     0x140378762
   14037873a:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037873d:	48 85 c0             	test   rax,rax
   140378740:	74 0f                	je     0x140378751
   140378742:	48 8b c8             	mov    rcx,rax
   140378745:	e8 0e 2e 2a 00       	call   0x14061b558
   14037874a:	48 8b 0d 37 dc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dc37]        # 0x154f06388
   140378751:	ba 38 00 00 00       	mov    edx,0x38
   140378756:	e8 fd 2d 2a 00       	call   0x14061b558
   14037875b:	4c 89 2d 26 dc b8 14 	mov    QWORD PTR [rip+0x14b8dc26],r13        # 0x154f06388
   140378762:	b9 38 00 00 00       	mov    ecx,0x38
   140378767:	e8 e4 2e 2a 00       	call   0x14061b650
   14037876c:	33 c9                	xor    ecx,ecx
   14037876e:	48 89 05 13 dc b8 14 	mov    QWORD PTR [rip+0x14b8dc13],rax        # 0x154f06388
   140378775:	48 89 08             	mov    QWORD PTR [rax],rcx
   140378778:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037877c:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140378780:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378784:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378788:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037878c:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140378790:	b9 0c 00 00 00       	mov    ecx,0xc
   140378795:	e8 c6 2d 2a 00       	call   0x14061b560
   14037879a:	48 8b 0d e7 db b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dbe7]        # 0x154f06388
   1403787a1:	4c 8d 05 98 6e 33 00 	lea    r8,[rip+0x336e98]        # 0x1406af640
   1403787a8:	ba 06 00 00 00       	mov    edx,0x6
   1403787ad:	48 89 01             	mov    QWORD PTR [rcx],rax
   1403787b0:	48 8b c8             	mov    rcx,rax
   1403787b3:	e8 98 f8 1b 00       	call   0x140538050
   1403787b8:	48 8b 05 c9 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dbc9]        # 0x154f06388
   1403787bf:	c6 40 08 15          	mov    BYTE PTR [rax+0x8],0x15
   1403787c3:	48 8b 05 be db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dbbe]        # 0x154f06388
   1403787ca:	c6 40 09 6c          	mov    BYTE PTR [rax+0x9],0x6c
   1403787ce:	48 8b 05 b3 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dbb3]        # 0x154f06388
   1403787d5:	c6 40 0a 6c          	mov    BYTE PTR [rax+0xa],0x6c
   1403787d9:	48 8b 05 a8 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dba8]        # 0x154f06388
   1403787e0:	c7 40 2c 9a 99 19 3e 	mov    DWORD PTR [rax+0x2c],0x3e19999a
   1403787e7:	48 8b 05 9a db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db9a]        # 0x154f06388
   1403787ee:	c7 40 0c 00 00 00 41 	mov    DWORD PTR [rax+0xc],0x41000000
   1403787f5:	48 8b 05 8c db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db8c]        # 0x154f06388
   1403787fc:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378800:	48 8b 05 81 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db81]        # 0x154f06388
   140378807:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037880b:	48 8b 05 76 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db76]        # 0x154f06388
   140378812:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378816:	48 8b 05 6b db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db6b]        # 0x154f06388
   14037881d:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140378821:	48 8b 05 60 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db60]        # 0x154f06388
   140378828:	c7 40 20 cd cc cc 3d 	mov    DWORD PTR [rax+0x20],0x3dcccccd
   14037882f:	48 8b 05 52 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db52]        # 0x154f06388
   140378836:	c7 40 30 00 00 80 3f 	mov    DWORD PTR [rax+0x30],0x3f800000
   14037883d:	48 8b 05 44 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db44]        # 0x154f06388
   140378844:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   14037884b:	48 8b 05 36 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db36]        # 0x154f06388
   140378852:	c7 40 28 80 00 00 00 	mov    DWORD PTR [rax+0x28],0x80
   140378859:	48 8b 0d 50 dc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dc50]        # 0x154f064b0
   140378860:	48 85 c9             	test   rcx,rcx
   140378863:	74 28                	je     0x14037888d
   140378865:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378868:	48 85 c0             	test   rax,rax
   14037886b:	74 0f                	je     0x14037887c
   14037886d:	48 8b c8             	mov    rcx,rax
   140378870:	e8 e3 2c 2a 00       	call   0x14061b558
   140378875:	48 8b 0d 34 dc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dc34]        # 0x154f064b0
   14037887c:	ba 38 00 00 00       	mov    edx,0x38
   140378881:	e8 d2 2c 2a 00       	call   0x14061b558
   140378886:	4c 89 2d 23 dc b8 14 	mov    QWORD PTR [rip+0x14b8dc23],r13        # 0x154f064b0
   14037888d:	b9 38 00 00 00       	mov    ecx,0x38
   140378892:	e8 b9 2d 2a 00       	call   0x14061b650
   140378897:	33 c9                	xor    ecx,ecx
   140378899:	48 89 05 10 dc b8 14 	mov    QWORD PTR [rip+0x14b8dc10],rax        # 0x154f064b0
   1403788a0:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403788a3:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403788a7:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403788ab:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403788af:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403788b3:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403788b7:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403788bb:	b9 16 00 00 00       	mov    ecx,0x16
   1403788c0:	e8 9b 2c 2a 00       	call   0x14061b560
   1403788c5:	48 8b 0d e4 db b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dbe4]        # 0x154f064b0
   1403788cc:	4c 8d 05 7d 6d 33 00 	lea    r8,[rip+0x336d7d]        # 0x1406af650
   1403788d3:	ba 0b 00 00 00       	mov    edx,0xb
   1403788d8:	48 89 01             	mov    QWORD PTR [rcx],rax
   1403788db:	48 8b c8             	mov    rcx,rax
   1403788de:	e8 6d f7 1b 00       	call   0x140538050
   1403788e3:	48 8b 05 c6 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dbc6]        # 0x154f064b0
   1403788ea:	c6 40 08 15          	mov    BYTE PTR [rax+0x8],0x15
   1403788ee:	48 8b 05 bb db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dbbb]        # 0x154f064b0
   1403788f5:	c6 40 09 6c          	mov    BYTE PTR [rax+0x9],0x6c
   1403788f9:	48 8b 05 b0 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dbb0]        # 0x154f064b0
   140378900:	c6 40 0a 6c          	mov    BYTE PTR [rax+0xa],0x6c
   140378904:	48 8b 05 a5 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8dba5]        # 0x154f064b0
   14037890b:	c7 40 2c 9a 99 19 3e 	mov    DWORD PTR [rax+0x2c],0x3e19999a
   140378912:	48 8b 05 97 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db97]        # 0x154f064b0
   140378919:	c7 40 0c 00 00 00 41 	mov    DWORD PTR [rax+0xc],0x41000000
   140378920:	48 8b 05 89 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db89]        # 0x154f064b0
   140378927:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037892b:	48 8b 05 7e db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db7e]        # 0x154f064b0
   140378932:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140378936:	48 8b 05 73 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db73]        # 0x154f064b0
   14037893d:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378941:	48 8b 05 68 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db68]        # 0x154f064b0
   140378948:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037894c:	48 8b 05 5d db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db5d]        # 0x154f064b0
   140378953:	c7 40 20 cd cc cc 3d 	mov    DWORD PTR [rax+0x20],0x3dcccccd
   14037895a:	48 8b 05 4f db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db4f]        # 0x154f064b0
   140378961:	c7 40 30 00 00 80 3f 	mov    DWORD PTR [rax+0x30],0x3f800000
   140378968:	48 8b 05 41 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db41]        # 0x154f064b0
   14037896f:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   140378976:	48 8b 05 33 db b8 14 	mov    rax,QWORD PTR [rip+0x14b8db33]        # 0x154f064b0
   14037897d:	c7 40 28 80 00 00 00 	mov    DWORD PTR [rax+0x28],0x80
   140378984:	48 8b 0d 75 db b8 14 	mov    rcx,QWORD PTR [rip+0x14b8db75]        # 0x154f06500
   14037898b:	48 85 c9             	test   rcx,rcx
   14037898e:	74 28                	je     0x1403789b8
   140378990:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378993:	48 85 c0             	test   rax,rax
   140378996:	74 0f                	je     0x1403789a7
   140378998:	48 8b c8             	mov    rcx,rax
   14037899b:	e8 b8 2b 2a 00       	call   0x14061b558
   1403789a0:	48 8b 0d 59 db b8 14 	mov    rcx,QWORD PTR [rip+0x14b8db59]        # 0x154f06500
   1403789a7:	ba 38 00 00 00       	mov    edx,0x38
   1403789ac:	e8 a7 2b 2a 00       	call   0x14061b558
   1403789b1:	4c 89 2d 48 db b8 14 	mov    QWORD PTR [rip+0x14b8db48],r13        # 0x154f06500
   1403789b8:	b9 38 00 00 00       	mov    ecx,0x38
   1403789bd:	e8 8e 2c 2a 00       	call   0x14061b650
   1403789c2:	33 c9                	xor    ecx,ecx
   1403789c4:	48 89 05 35 db b8 14 	mov    QWORD PTR [rip+0x14b8db35],rax        # 0x154f06500
   1403789cb:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403789ce:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403789d2:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403789d6:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403789da:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403789de:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403789e2:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403789e6:	b9 14 00 00 00       	mov    ecx,0x14
   1403789eb:	e8 70 2b 2a 00       	call   0x14061b560
   1403789f0:	48 8b 0d 09 db b8 14 	mov    rcx,QWORD PTR [rip+0x14b8db09]        # 0x154f06500
   1403789f7:	4c 8d 05 6a 6c 33 00 	lea    r8,[rip+0x336c6a]        # 0x1406af668
   1403789fe:	ba 0a 00 00 00       	mov    edx,0xa
   140378a03:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378a06:	48 8b c8             	mov    rcx,rax
   140378a09:	e8 42 f6 1b 00       	call   0x140538050
   140378a0e:	48 8b 05 eb da b8 14 	mov    rax,QWORD PTR [rip+0x14b8daeb]        # 0x154f06500
   140378a15:	c6 40 08 15          	mov    BYTE PTR [rax+0x8],0x15
   140378a19:	48 8b 05 e0 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8dae0]        # 0x154f06500
   140378a20:	c6 40 09 6c          	mov    BYTE PTR [rax+0x9],0x6c
   140378a24:	48 8b 05 d5 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8dad5]        # 0x154f06500
   140378a2b:	c6 40 0a 6c          	mov    BYTE PTR [rax+0xa],0x6c
   140378a2f:	48 8b 05 ca da b8 14 	mov    rax,QWORD PTR [rip+0x14b8daca]        # 0x154f06500
   140378a36:	c7 40 2c 9a 99 19 3e 	mov    DWORD PTR [rax+0x2c],0x3e19999a
   140378a3d:	48 8b 05 bc da b8 14 	mov    rax,QWORD PTR [rip+0x14b8dabc]        # 0x154f06500
   140378a44:	c7 40 0c 00 00 00 41 	mov    DWORD PTR [rax+0xc],0x41000000
   140378a4b:	48 8b 05 ae da b8 14 	mov    rax,QWORD PTR [rip+0x14b8daae]        # 0x154f06500
   140378a52:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378a56:	48 8b 05 a3 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8daa3]        # 0x154f06500
   140378a5d:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140378a61:	48 8b 05 98 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8da98]        # 0x154f06500
   140378a68:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378a6c:	48 8b 05 8d da b8 14 	mov    rax,QWORD PTR [rip+0x14b8da8d]        # 0x154f06500
   140378a73:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140378a77:	48 8b 05 82 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8da82]        # 0x154f06500
   140378a7e:	c7 40 20 cd cc cc 3d 	mov    DWORD PTR [rax+0x20],0x3dcccccd
   140378a85:	48 8b 05 74 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8da74]        # 0x154f06500
   140378a8c:	c7 40 30 00 00 80 3f 	mov    DWORD PTR [rax+0x30],0x3f800000
   140378a93:	48 8b 05 66 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8da66]        # 0x154f06500
   140378a9a:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   140378aa1:	48 8b 05 58 da b8 14 	mov    rax,QWORD PTR [rip+0x14b8da58]        # 0x154f06500
   140378aa8:	c7 40 28 80 00 00 00 	mov    DWORD PTR [rax+0x28],0x80
   140378aaf:	48 8b 0d 02 da b8 14 	mov    rcx,QWORD PTR [rip+0x14b8da02]        # 0x154f064b8
   140378ab6:	48 85 c9             	test   rcx,rcx
   140378ab9:	74 28                	je     0x140378ae3
   140378abb:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378abe:	48 85 c0             	test   rax,rax
   140378ac1:	74 0f                	je     0x140378ad2
   140378ac3:	48 8b c8             	mov    rcx,rax
   140378ac6:	e8 8d 2a 2a 00       	call   0x14061b558
   140378acb:	48 8b 0d e6 d9 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d9e6]        # 0x154f064b8
   140378ad2:	ba 38 00 00 00       	mov    edx,0x38
   140378ad7:	e8 7c 2a 2a 00       	call   0x14061b558
   140378adc:	4c 89 2d d5 d9 b8 14 	mov    QWORD PTR [rip+0x14b8d9d5],r13        # 0x154f064b8
   140378ae3:	b9 38 00 00 00       	mov    ecx,0x38
   140378ae8:	e8 63 2b 2a 00       	call   0x14061b650
   140378aed:	33 c9                	xor    ecx,ecx
   140378aef:	48 89 05 c2 d9 b8 14 	mov    QWORD PTR [rip+0x14b8d9c2],rax        # 0x154f064b8
   140378af6:	48 89 08             	mov    QWORD PTR [rax],rcx
   140378af9:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140378afd:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140378b01:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378b05:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378b09:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140378b0d:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140378b11:	b9 12 00 00 00       	mov    ecx,0x12
   140378b16:	e8 45 2a 2a 00       	call   0x14061b560
   140378b1b:	48 8b 0d 96 d9 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d996]        # 0x154f064b8
   140378b22:	4c 8d 05 57 6b 33 00 	lea    r8,[rip+0x336b57]        # 0x1406af680
   140378b29:	ba 09 00 00 00       	mov    edx,0x9
   140378b2e:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378b31:	48 8b c8             	mov    rcx,rax
   140378b34:	e8 17 f5 1b 00       	call   0x140538050
   140378b39:	48 8b 05 78 d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d978]        # 0x154f064b8
   140378b40:	c6 40 08 15          	mov    BYTE PTR [rax+0x8],0x15
   140378b44:	48 8b 05 6d d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d96d]        # 0x154f064b8
   140378b4b:	c6 40 09 6c          	mov    BYTE PTR [rax+0x9],0x6c
   140378b4f:	48 8b 05 62 d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d962]        # 0x154f064b8
   140378b56:	c6 40 0a 6c          	mov    BYTE PTR [rax+0xa],0x6c
   140378b5a:	48 8b 05 57 d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d957]        # 0x154f064b8
   140378b61:	c7 40 2c 9a 99 19 3e 	mov    DWORD PTR [rax+0x2c],0x3e19999a
   140378b68:	48 8b 05 49 d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d949]        # 0x154f064b8
   140378b6f:	c7 40 0c 00 00 00 41 	mov    DWORD PTR [rax+0xc],0x41000000
   140378b76:	48 8b 05 3b d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d93b]        # 0x154f064b8
   140378b7d:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378b81:	48 8b 05 30 d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d930]        # 0x154f064b8
   140378b88:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140378b8c:	48 8b 05 25 d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d925]        # 0x154f064b8
   140378b93:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378b97:	48 8b 05 1a d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d91a]        # 0x154f064b8
   140378b9e:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140378ba2:	48 8b 05 0f d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d90f]        # 0x154f064b8
   140378ba9:	c7 40 20 cd cc cc 3d 	mov    DWORD PTR [rax+0x20],0x3dcccccd
   140378bb0:	48 8b 05 01 d9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d901]        # 0x154f064b8
   140378bb7:	c7 40 30 00 00 80 3f 	mov    DWORD PTR [rax+0x30],0x3f800000
   140378bbe:	48 8b 05 f3 d8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d8f3]        # 0x154f064b8
   140378bc5:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   140378bcc:	48 8b 05 e5 d8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d8e5]        # 0x154f064b8
   140378bd3:	c7 40 28 80 00 00 00 	mov    DWORD PTR [rax+0x28],0x80
   140378bda:	48 8b 0d af d7 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d7af]        # 0x154f06390
   140378be1:	48 85 c9             	test   rcx,rcx
   140378be4:	74 28                	je     0x140378c0e
   140378be6:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378be9:	48 85 c0             	test   rax,rax
   140378bec:	74 0f                	je     0x140378bfd
   140378bee:	48 8b c8             	mov    rcx,rax
   140378bf1:	e8 62 29 2a 00       	call   0x14061b558
   140378bf6:	48 8b 0d 93 d7 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d793]        # 0x154f06390
   140378bfd:	ba 38 00 00 00       	mov    edx,0x38
   140378c02:	e8 51 29 2a 00       	call   0x14061b558
   140378c07:	4c 89 2d 82 d7 b8 14 	mov    QWORD PTR [rip+0x14b8d782],r13        # 0x154f06390
   140378c0e:	b9 38 00 00 00       	mov    ecx,0x38
   140378c13:	e8 38 2a 2a 00       	call   0x14061b650
   140378c18:	33 c9                	xor    ecx,ecx
   140378c1a:	48 89 05 6f d7 b8 14 	mov    QWORD PTR [rip+0x14b8d76f],rax        # 0x154f06390
   140378c21:	48 89 08             	mov    QWORD PTR [rax],rcx
   140378c24:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140378c28:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140378c2c:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378c30:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378c34:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140378c38:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140378c3c:	b9 14 00 00 00       	mov    ecx,0x14
   140378c41:	e8 1a 29 2a 00       	call   0x14061b560
   140378c46:	48 8b 0d 43 d7 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d743]        # 0x154f06390
   140378c4d:	4c 8d 05 44 6a 33 00 	lea    r8,[rip+0x336a44]        # 0x1406af698
   140378c54:	ba 0a 00 00 00       	mov    edx,0xa
   140378c59:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378c5c:	48 8b c8             	mov    rcx,rax
   140378c5f:	e8 ec f3 1b 00       	call   0x140538050
   140378c64:	48 8b 05 25 d7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d725]        # 0x154f06390
   140378c6b:	c6 40 08 28          	mov    BYTE PTR [rax+0x8],0x28
   140378c6f:	48 8b 05 1a d7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d71a]        # 0x154f06390
   140378c76:	c6 40 09 58          	mov    BYTE PTR [rax+0x9],0x58
   140378c7a:	48 8b 05 0f d7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d70f]        # 0x154f06390
   140378c81:	c6 40 0a 5a          	mov    BYTE PTR [rax+0xa],0x5a
   140378c85:	48 8b 05 04 d7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d704]        # 0x154f06390
   140378c8c:	c7 40 2c cd cc cc 3d 	mov    DWORD PTR [rax+0x2c],0x3dcccccd
   140378c93:	48 8b 05 f6 d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d6f6]        # 0x154f06390
   140378c9a:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   140378ca1:	48 8b 05 e8 d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d6e8]        # 0x154f06390
   140378ca8:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378cac:	48 8b 05 dd d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d6dd]        # 0x154f06390
   140378cb3:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140378cb7:	48 8b 05 d2 d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d6d2]        # 0x154f06390
   140378cbe:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378cc2:	48 8b 05 c7 d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d6c7]        # 0x154f06390
   140378cc9:	c7 40 1c cd cc cc 3e 	mov    DWORD PTR [rax+0x1c],0x3ecccccd
   140378cd0:	48 8b 05 b9 d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d6b9]        # 0x154f06390
   140378cd7:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140378cde:	48 8b 05 ab d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d6ab]        # 0x154f06390
   140378ce5:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   140378cec:	48 8b 05 9d d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d69d]        # 0x154f06390
   140378cf3:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   140378cf7:	48 8b 05 92 d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d692]        # 0x154f06390
   140378cfe:	c7 40 28 28 00 00 00 	mov    DWORD PTR [rax+0x28],0x28
   140378d05:	48 8b 0d 8c d6 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d68c]        # 0x154f06398
   140378d0c:	48 85 c9             	test   rcx,rcx
   140378d0f:	74 28                	je     0x140378d39
   140378d11:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378d14:	48 85 c0             	test   rax,rax
   140378d17:	74 0f                	je     0x140378d28
   140378d19:	48 8b c8             	mov    rcx,rax
   140378d1c:	e8 37 28 2a 00       	call   0x14061b558
   140378d21:	48 8b 0d 70 d6 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d670]        # 0x154f06398
   140378d28:	ba 38 00 00 00       	mov    edx,0x38
   140378d2d:	e8 26 28 2a 00       	call   0x14061b558
   140378d32:	4c 89 2d 5f d6 b8 14 	mov    QWORD PTR [rip+0x14b8d65f],r13        # 0x154f06398
   140378d39:	b9 38 00 00 00       	mov    ecx,0x38
   140378d3e:	e8 0d 29 2a 00       	call   0x14061b650
   140378d43:	33 c9                	xor    ecx,ecx
   140378d45:	48 89 05 4c d6 b8 14 	mov    QWORD PTR [rip+0x14b8d64c],rax        # 0x154f06398
   140378d4c:	48 89 08             	mov    QWORD PTR [rax],rcx
   140378d4f:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140378d53:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140378d57:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378d5b:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378d5f:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140378d63:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140378d67:	b9 14 00 00 00       	mov    ecx,0x14
   140378d6c:	e8 ef 27 2a 00       	call   0x14061b560
   140378d71:	48 8b 0d 20 d6 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d620]        # 0x154f06398
   140378d78:	4c 8d 05 31 69 33 00 	lea    r8,[rip+0x336931]        # 0x1406af6b0
   140378d7f:	ba 0a 00 00 00       	mov    edx,0xa
   140378d84:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378d87:	48 8b c8             	mov    rcx,rax
   140378d8a:	e8 c1 f2 1b 00       	call   0x140538050
   140378d8f:	48 8b 05 02 d6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d602]        # 0x154f06398
   140378d96:	c6 40 08 28          	mov    BYTE PTR [rax+0x8],0x28
   140378d9a:	48 8b 05 f7 d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5f7]        # 0x154f06398
   140378da1:	c6 40 09 58          	mov    BYTE PTR [rax+0x9],0x58
   140378da5:	48 8b 05 ec d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5ec]        # 0x154f06398
   140378dac:	c6 40 0a 5a          	mov    BYTE PTR [rax+0xa],0x5a
   140378db0:	48 8b 05 e1 d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5e1]        # 0x154f06398
   140378db7:	c7 40 2c cd cc cc 3d 	mov    DWORD PTR [rax+0x2c],0x3dcccccd
   140378dbe:	48 8b 05 d3 d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5d3]        # 0x154f06398
   140378dc5:	c7 40 0c 00 00 00 40 	mov    DWORD PTR [rax+0xc],0x40000000
   140378dcc:	48 8b 05 c5 d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5c5]        # 0x154f06398
   140378dd3:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378dd7:	48 8b 05 ba d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5ba]        # 0x154f06398
   140378dde:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140378de2:	48 8b 05 af d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5af]        # 0x154f06398
   140378de9:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378ded:	48 8b 05 a4 d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d5a4]        # 0x154f06398
   140378df4:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140378df8:	48 8b 05 99 d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d599]        # 0x154f06398
   140378dff:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140378e06:	48 8b 05 8b d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d58b]        # 0x154f06398
   140378e0d:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   140378e14:	48 8b 05 7d d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d57d]        # 0x154f06398
   140378e1b:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   140378e1f:	48 8b 05 72 d5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d572]        # 0x154f06398
   140378e26:	c7 40 28 28 00 00 00 	mov    DWORD PTR [rax+0x28],0x28
   140378e2d:	48 8b 0d 5c d5 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d55c]        # 0x154f06390
   140378e34:	48 85 c9             	test   rcx,rcx
   140378e37:	74 28                	je     0x140378e61
   140378e39:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378e3c:	48 85 c0             	test   rax,rax
   140378e3f:	74 0f                	je     0x140378e50
   140378e41:	48 8b c8             	mov    rcx,rax
   140378e44:	e8 0f 27 2a 00       	call   0x14061b558
   140378e49:	48 8b 0d 40 d5 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d540]        # 0x154f06390
   140378e50:	ba 38 00 00 00       	mov    edx,0x38
   140378e55:	e8 fe 26 2a 00       	call   0x14061b558
   140378e5a:	4c 89 2d 2f d5 b8 14 	mov    QWORD PTR [rip+0x14b8d52f],r13        # 0x154f06390
   140378e61:	b9 38 00 00 00       	mov    ecx,0x38
   140378e66:	e8 e5 27 2a 00       	call   0x14061b650
   140378e6b:	33 c9                	xor    ecx,ecx
   140378e6d:	48 89 05 1c d5 b8 14 	mov    QWORD PTR [rip+0x14b8d51c],rax        # 0x154f06390
   140378e74:	48 89 08             	mov    QWORD PTR [rax],rcx
   140378e77:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140378e7b:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140378e7f:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378e83:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378e87:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140378e8b:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140378e8f:	b9 0e 00 00 00       	mov    ecx,0xe
   140378e94:	e8 c7 26 2a 00       	call   0x14061b560
   140378e99:	48 8b 0d f0 d4 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d4f0]        # 0x154f06390
   140378ea0:	4c 8d 05 21 68 33 00 	lea    r8,[rip+0x336821]        # 0x1406af6c8
   140378ea7:	ba 07 00 00 00       	mov    edx,0x7
   140378eac:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378eaf:	48 8b c8             	mov    rcx,rax
   140378eb2:	e8 99 f1 1b 00       	call   0x140538050
   140378eb7:	48 8b 05 d2 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d4d2]        # 0x154f06390
   140378ebe:	c6 40 08 28          	mov    BYTE PTR [rax+0x8],0x28
   140378ec2:	48 8b 05 c7 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d4c7]        # 0x154f06390
   140378ec9:	c6 40 09 58          	mov    BYTE PTR [rax+0x9],0x58
   140378ecd:	48 8b 05 bc d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d4bc]        # 0x154f06390
   140378ed4:	c6 40 0a 5a          	mov    BYTE PTR [rax+0xa],0x5a
   140378ed8:	48 8b 05 b1 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d4b1]        # 0x154f06390
   140378edf:	c7 40 2c cd cc cc 3d 	mov    DWORD PTR [rax+0x2c],0x3dcccccd
   140378ee6:	48 8b 05 a3 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d4a3]        # 0x154f06390
   140378eed:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   140378ef4:	48 8b 05 95 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d495]        # 0x154f06390
   140378efb:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378eff:	48 8b 05 8a d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d48a]        # 0x154f06390
   140378f06:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140378f0a:	48 8b 05 7f d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d47f]        # 0x154f06390
   140378f11:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140378f15:	48 8b 05 74 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d474]        # 0x154f06390
   140378f1c:	c7 40 1c cd cc cc 3e 	mov    DWORD PTR [rax+0x1c],0x3ecccccd
   140378f23:	48 8b 05 66 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d466]        # 0x154f06390
   140378f2a:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140378f31:	48 8b 05 58 d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d458]        # 0x154f06390
   140378f38:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   140378f3f:	48 8b 05 4a d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d44a]        # 0x154f06390
   140378f46:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   140378f4a:	48 8b 05 3f d4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d43f]        # 0x154f06390
   140378f51:	c7 40 28 28 00 00 00 	mov    DWORD PTR [rax+0x28],0x28
   140378f58:	48 8b 0d 41 d4 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d441]        # 0x154f063a0
   140378f5f:	48 85 c9             	test   rcx,rcx
   140378f62:	74 28                	je     0x140378f8c
   140378f64:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140378f67:	48 85 c0             	test   rax,rax
   140378f6a:	74 0f                	je     0x140378f7b
   140378f6c:	48 8b c8             	mov    rcx,rax
   140378f6f:	e8 e4 25 2a 00       	call   0x14061b558
   140378f74:	48 8b 0d 25 d4 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d425]        # 0x154f063a0
   140378f7b:	ba 38 00 00 00       	mov    edx,0x38
   140378f80:	e8 d3 25 2a 00       	call   0x14061b558
   140378f85:	4c 89 2d 14 d4 b8 14 	mov    QWORD PTR [rip+0x14b8d414],r13        # 0x154f063a0
   140378f8c:	b9 38 00 00 00       	mov    ecx,0x38
   140378f91:	e8 ba 26 2a 00       	call   0x14061b650
   140378f96:	33 c9                	xor    ecx,ecx
   140378f98:	48 89 05 01 d4 b8 14 	mov    QWORD PTR [rip+0x14b8d401],rax        # 0x154f063a0
   140378f9f:	48 89 08             	mov    QWORD PTR [rax],rcx
   140378fa2:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140378fa6:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140378faa:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140378fae:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140378fb2:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140378fb6:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140378fba:	b9 1a 00 00 00       	mov    ecx,0x1a
   140378fbf:	e8 9c 25 2a 00       	call   0x14061b560
   140378fc4:	48 8b 0d d5 d3 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d3d5]        # 0x154f063a0
   140378fcb:	4c 8d 05 06 67 33 00 	lea    r8,[rip+0x336706]        # 0x1406af6d8
   140378fd2:	ba 0d 00 00 00       	mov    edx,0xd
   140378fd7:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378fda:	48 8b c8             	mov    rcx,rax
   140378fdd:	e8 6e f0 1b 00       	call   0x140538050
   140378fe2:	48 8b 05 b7 d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d3b7]        # 0x154f063a0
   140378fe9:	c6 40 08 28          	mov    BYTE PTR [rax+0x8],0x28
   140378fed:	48 8b 05 ac d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d3ac]        # 0x154f063a0
   140378ff4:	c6 40 09 58          	mov    BYTE PTR [rax+0x9],0x58
   140378ff8:	48 8b 05 a1 d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d3a1]        # 0x154f063a0
   140378fff:	c6 40 0a 5a          	mov    BYTE PTR [rax+0xa],0x5a
   140379003:	48 8b 05 96 d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d396]        # 0x154f063a0
   14037900a:	c7 40 2c cd cc cc 3d 	mov    DWORD PTR [rax+0x2c],0x3dcccccd
   140379011:	48 8b 05 88 d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d388]        # 0x154f063a0
   140379018:	c7 40 0c 00 00 00 40 	mov    DWORD PTR [rax+0xc],0x40000000
   14037901f:	48 8b 05 7a d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d37a]        # 0x154f063a0
   140379026:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037902a:	48 8b 05 6f d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d36f]        # 0x154f063a0
   140379031:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379035:	48 8b 05 64 d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d364]        # 0x154f063a0
   14037903c:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379040:	48 8b 05 59 d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d359]        # 0x154f063a0
   140379047:	c7 40 1c cd cc cc 3e 	mov    DWORD PTR [rax+0x1c],0x3ecccccd
   14037904e:	48 8b 05 4b d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d34b]        # 0x154f063a0
   140379055:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   14037905c:	48 8b 05 3d d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d33d]        # 0x154f063a0
   140379063:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   14037906a:	48 8b 05 2f d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d32f]        # 0x154f063a0
   140379071:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   140379075:	48 8b 05 24 d3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d324]        # 0x154f063a0
   14037907c:	c7 40 28 20 00 00 00 	mov    DWORD PTR [rax+0x28],0x20
   140379083:	48 8b 0d 1e d3 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d31e]        # 0x154f063a8
   14037908a:	48 85 c9             	test   rcx,rcx
   14037908d:	74 28                	je     0x1403790b7
   14037908f:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379092:	48 85 c0             	test   rax,rax
   140379095:	74 0f                	je     0x1403790a6
   140379097:	48 8b c8             	mov    rcx,rax
   14037909a:	e8 b9 24 2a 00       	call   0x14061b558
   14037909f:	48 8b 0d 02 d3 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d302]        # 0x154f063a8
   1403790a6:	ba 38 00 00 00       	mov    edx,0x38
   1403790ab:	e8 a8 24 2a 00       	call   0x14061b558
   1403790b0:	4c 89 2d f1 d2 b8 14 	mov    QWORD PTR [rip+0x14b8d2f1],r13        # 0x154f063a8
   1403790b7:	b9 38 00 00 00       	mov    ecx,0x38
   1403790bc:	e8 8f 25 2a 00       	call   0x14061b650
   1403790c1:	33 c9                	xor    ecx,ecx
   1403790c3:	48 89 05 de d2 b8 14 	mov    QWORD PTR [rip+0x14b8d2de],rax        # 0x154f063a8
   1403790ca:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403790cd:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403790d1:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403790d5:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403790d9:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403790dd:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403790e1:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403790e5:	b9 0a 00 00 00       	mov    ecx,0xa
   1403790ea:	e8 71 24 2a 00       	call   0x14061b560
   1403790ef:	48 8b 0d b2 d2 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d2b2]        # 0x154f063a8
   1403790f6:	4c 8d 05 fb 65 33 00 	lea    r8,[rip+0x3365fb]        # 0x1406af6f8
   1403790fd:	ba 05 00 00 00       	mov    edx,0x5
   140379102:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379105:	48 8b c8             	mov    rcx,rax
   140379108:	e8 43 ef 1b 00       	call   0x140538050
   14037910d:	48 8b 05 94 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d294]        # 0x154f063a8
   140379114:	c6 40 08 1c          	mov    BYTE PTR [rax+0x8],0x1c
   140379118:	48 8b 05 89 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d289]        # 0x154f063a8
   14037911f:	c6 40 09 43          	mov    BYTE PTR [rax+0x9],0x43
   140379123:	48 8b 05 7e d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d27e]        # 0x154f063a8
   14037912a:	c6 40 0a 43          	mov    BYTE PTR [rax+0xa],0x43
   14037912e:	48 8b 05 73 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d273]        # 0x154f063a8
   140379135:	c7 40 2c 00 00 80 3e 	mov    DWORD PTR [rax+0x2c],0x3e800000
   14037913c:	48 8b 05 65 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d265]        # 0x154f063a8
   140379143:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   14037914a:	48 8b 05 57 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d257]        # 0x154f063a8
   140379151:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379155:	48 8b 05 4c d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d24c]        # 0x154f063a8
   14037915c:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379160:	48 8b 05 41 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d241]        # 0x154f063a8
   140379167:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037916b:	48 8b 05 36 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d236]        # 0x154f063a8
   140379172:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140379176:	48 8b 05 2b d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d22b]        # 0x154f063a8
   14037917d:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140379184:	48 8b 05 1d d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d21d]        # 0x154f063a8
   14037918b:	c7 40 30 00 00 80 40 	mov    DWORD PTR [rax+0x30],0x40800000
   140379192:	48 8b 05 0f d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d20f]        # 0x154f063a8
   140379199:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   1403791a0:	48 8b 05 01 d2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d201]        # 0x154f063a8
   1403791a7:	44 89 68 28          	mov    DWORD PTR [rax+0x28],r13d
   1403791ab:	48 8b 0d fe d1 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d1fe]        # 0x154f063b0
   1403791b2:	48 85 c9             	test   rcx,rcx
   1403791b5:	74 28                	je     0x1403791df
   1403791b7:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403791ba:	48 85 c0             	test   rax,rax
   1403791bd:	74 0f                	je     0x1403791ce
   1403791bf:	48 8b c8             	mov    rcx,rax
   1403791c2:	e8 91 23 2a 00       	call   0x14061b558
   1403791c7:	48 8b 0d e2 d1 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d1e2]        # 0x154f063b0
   1403791ce:	ba 38 00 00 00       	mov    edx,0x38
   1403791d3:	e8 80 23 2a 00       	call   0x14061b558
   1403791d8:	4c 89 2d d1 d1 b8 14 	mov    QWORD PTR [rip+0x14b8d1d1],r13        # 0x154f063b0
   1403791df:	b9 38 00 00 00       	mov    ecx,0x38
   1403791e4:	e8 67 24 2a 00       	call   0x14061b650
   1403791e9:	33 c9                	xor    ecx,ecx
   1403791eb:	48 89 05 be d1 b8 14 	mov    QWORD PTR [rip+0x14b8d1be],rax        # 0x154f063b0
   1403791f2:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403791f5:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403791f9:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403791fd:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379201:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379205:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379209:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037920d:	b9 12 00 00 00       	mov    ecx,0x12
   140379212:	e8 49 23 2a 00       	call   0x14061b560
   140379217:	48 8b 0d 92 d1 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d192]        # 0x154f063b0
   14037921e:	4c 8d 05 e3 64 33 00 	lea    r8,[rip+0x3364e3]        # 0x1406af708
   140379225:	ba 09 00 00 00       	mov    edx,0x9
   14037922a:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037922d:	48 8b c8             	mov    rcx,rax
   140379230:	e8 1b ee 1b 00       	call   0x140538050
   140379235:	48 8b 05 74 d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d174]        # 0x154f063b0
   14037923c:	c6 40 08 1c          	mov    BYTE PTR [rax+0x8],0x1c
   140379240:	48 8b 05 69 d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d169]        # 0x154f063b0
   140379247:	c6 40 09 43          	mov    BYTE PTR [rax+0x9],0x43
   14037924b:	48 8b 05 5e d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d15e]        # 0x154f063b0
   140379252:	c6 40 0a 43          	mov    BYTE PTR [rax+0xa],0x43
   140379256:	48 8b 05 53 d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d153]        # 0x154f063b0
   14037925d:	c7 40 2c 00 00 80 3e 	mov    DWORD PTR [rax+0x2c],0x3e800000
   140379264:	48 8b 05 45 d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d145]        # 0x154f063b0
   14037926b:	c7 40 0c 00 00 00 40 	mov    DWORD PTR [rax+0xc],0x40000000
   140379272:	48 8b 05 37 d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d137]        # 0x154f063b0
   140379279:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037927d:	48 8b 05 2c d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d12c]        # 0x154f063b0
   140379284:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379288:	48 8b 05 21 d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d121]        # 0x154f063b0
   14037928f:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379293:	48 8b 05 16 d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d116]        # 0x154f063b0
   14037929a:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037929e:	48 8b 05 0b d1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d10b]        # 0x154f063b0
   1403792a5:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   1403792ac:	48 8b 05 fd d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d0fd]        # 0x154f063b0
   1403792b3:	c7 40 30 00 00 80 40 	mov    DWORD PTR [rax+0x30],0x40800000
   1403792ba:	48 8b 05 ef d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d0ef]        # 0x154f063b0
   1403792c1:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   1403792c8:	48 8b 05 e1 d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d0e1]        # 0x154f063b0
   1403792cf:	44 89 68 28          	mov    DWORD PTR [rax+0x28],r13d
   1403792d3:	48 8b 0d de d0 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d0de]        # 0x154f063b8
   1403792da:	48 85 c9             	test   rcx,rcx
   1403792dd:	74 28                	je     0x140379307
   1403792df:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403792e2:	48 85 c0             	test   rax,rax
   1403792e5:	74 0f                	je     0x1403792f6
   1403792e7:	48 8b c8             	mov    rcx,rax
   1403792ea:	e8 69 22 2a 00       	call   0x14061b558
   1403792ef:	48 8b 0d c2 d0 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d0c2]        # 0x154f063b8
   1403792f6:	ba 38 00 00 00       	mov    edx,0x38
   1403792fb:	e8 58 22 2a 00       	call   0x14061b558
   140379300:	4c 89 2d b1 d0 b8 14 	mov    QWORD PTR [rip+0x14b8d0b1],r13        # 0x154f063b8
   140379307:	b9 38 00 00 00       	mov    ecx,0x38
   14037930c:	e8 3f 23 2a 00       	call   0x14061b650
   140379311:	33 c9                	xor    ecx,ecx
   140379313:	48 89 05 9e d0 b8 14 	mov    QWORD PTR [rip+0x14b8d09e],rax        # 0x154f063b8
   14037931a:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037931d:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379321:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379325:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379329:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037932d:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379331:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379335:	b9 0c 00 00 00       	mov    ecx,0xc
   14037933a:	e8 21 22 2a 00       	call   0x14061b560
   14037933f:	48 8b 0d 72 d0 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8d072]        # 0x154f063b8
   140379346:	4c 8d 05 d3 63 33 00 	lea    r8,[rip+0x3363d3]        # 0x1406af720
   14037934d:	ba 06 00 00 00       	mov    edx,0x6
   140379352:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379355:	48 8b c8             	mov    rcx,rax
   140379358:	e8 f3 ec 1b 00       	call   0x140538050
   14037935d:	48 8b 05 54 d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d054]        # 0x154f063b8
   140379364:	c6 40 08 3c          	mov    BYTE PTR [rax+0x8],0x3c
   140379368:	48 8b 05 49 d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d049]        # 0x154f063b8
   14037936f:	c6 40 09 67          	mov    BYTE PTR [rax+0x9],0x67
   140379373:	48 8b 05 3e d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d03e]        # 0x154f063b8
   14037937a:	c6 40 0a 67          	mov    BYTE PTR [rax+0xa],0x67
   14037937e:	48 8b 05 33 d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d033]        # 0x154f063b8
   140379385:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   140379389:	48 8b 05 28 d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d028]        # 0x154f063b8
   140379390:	c7 40 0c 00 00 80 3f 	mov    DWORD PTR [rax+0xc],0x3f800000
   140379397:	48 8b 05 1a d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d01a]        # 0x154f063b8
   14037939e:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   1403793a2:	48 8b 05 0f d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d00f]        # 0x154f063b8
   1403793a9:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   1403793ad:	48 8b 05 04 d0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8d004]        # 0x154f063b8
   1403793b4:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   1403793b8:	48 8b 05 f9 cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cff9]        # 0x154f063b8
   1403793bf:	c7 40 1c 9a 99 19 3e 	mov    DWORD PTR [rax+0x1c],0x3e19999a
   1403793c6:	48 8b 05 eb cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cfeb]        # 0x154f063b8
   1403793cd:	c7 40 20 cd cc 4c 3f 	mov    DWORD PTR [rax+0x20],0x3f4ccccd
   1403793d4:	48 8b 05 dd cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cfdd]        # 0x154f063b8
   1403793db:	c7 40 30 00 00 00 40 	mov    DWORD PTR [rax+0x30],0x40000000
   1403793e2:	48 8b 05 cf cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cfcf]        # 0x154f063b8
   1403793e9:	c7 40 24 1f 85 6b 3e 	mov    DWORD PTR [rax+0x24],0x3e6b851f
   1403793f0:	48 8b 05 c1 cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cfc1]        # 0x154f063b8
   1403793f7:	c7 40 28 01 00 00 00 	mov    DWORD PTR [rax+0x28],0x1
   1403793fe:	48 8b 0d bb cf b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cfbb]        # 0x154f063c0
   140379405:	48 85 c9             	test   rcx,rcx
   140379408:	74 28                	je     0x140379432
   14037940a:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037940d:	48 85 c0             	test   rax,rax
   140379410:	74 0f                	je     0x140379421
   140379412:	48 8b c8             	mov    rcx,rax
   140379415:	e8 3e 21 2a 00       	call   0x14061b558
   14037941a:	48 8b 0d 9f cf b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cf9f]        # 0x154f063c0
   140379421:	ba 38 00 00 00       	mov    edx,0x38
   140379426:	e8 2d 21 2a 00       	call   0x14061b558
   14037942b:	4c 89 2d 8e cf b8 14 	mov    QWORD PTR [rip+0x14b8cf8e],r13        # 0x154f063c0
   140379432:	b9 38 00 00 00       	mov    ecx,0x38
   140379437:	e8 14 22 2a 00       	call   0x14061b650
   14037943c:	33 c9                	xor    ecx,ecx
   14037943e:	48 89 05 7b cf b8 14 	mov    QWORD PTR [rip+0x14b8cf7b],rax        # 0x154f063c0
   140379445:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379448:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037944c:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379450:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379454:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379458:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037945c:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379460:	b9 10 00 00 00       	mov    ecx,0x10
   140379465:	e8 f6 20 2a 00       	call   0x14061b560
   14037946a:	48 8b 0d 4f cf b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cf4f]        # 0x154f063c0
   140379471:	4c 8d 05 b8 62 33 00 	lea    r8,[rip+0x3362b8]        # 0x1406af730
   140379478:	ba 08 00 00 00       	mov    edx,0x8
   14037947d:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379480:	48 8b c8             	mov    rcx,rax
   140379483:	e8 c8 eb 1b 00       	call   0x140538050
   140379488:	48 8b 05 31 cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cf31]        # 0x154f063c0
   14037948f:	c6 40 08 36          	mov    BYTE PTR [rax+0x8],0x36
   140379493:	48 8b 05 26 cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cf26]        # 0x154f063c0
   14037949a:	c6 40 09 54          	mov    BYTE PTR [rax+0x9],0x54
   14037949e:	48 8b 05 1b cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cf1b]        # 0x154f063c0
   1403794a5:	c6 40 0a 54          	mov    BYTE PTR [rax+0xa],0x54
   1403794a9:	48 8b 05 10 cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cf10]        # 0x154f063c0
   1403794b0:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   1403794b4:	48 8b 05 05 cf b8 14 	mov    rax,QWORD PTR [rip+0x14b8cf05]        # 0x154f063c0
   1403794bb:	c7 40 0c 00 00 00 40 	mov    DWORD PTR [rax+0xc],0x40000000
   1403794c2:	48 8b 05 f7 ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8cef7]        # 0x154f063c0
   1403794c9:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   1403794cd:	48 8b 05 ec ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8ceec]        # 0x154f063c0
   1403794d4:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   1403794d8:	48 8b 05 e1 ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8cee1]        # 0x154f063c0
   1403794df:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   1403794e3:	48 8b 05 d6 ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8ced6]        # 0x154f063c0
   1403794ea:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   1403794ee:	48 8b 05 cb ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8cecb]        # 0x154f063c0
   1403794f5:	c7 40 20 cd cc 4c 3f 	mov    DWORD PTR [rax+0x20],0x3f4ccccd
   1403794fc:	48 8b 05 bd ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8cebd]        # 0x154f063c0
   140379503:	c7 40 30 00 00 80 3f 	mov    DWORD PTR [rax+0x30],0x3f800000
   14037950a:	48 8b 05 af ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8ceaf]        # 0x154f063c0
   140379511:	c7 40 24 00 00 80 3e 	mov    DWORD PTR [rax+0x24],0x3e800000
   140379518:	48 8b 05 a1 ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8cea1]        # 0x154f063c0
   14037951f:	c7 40 28 01 00 00 00 	mov    DWORD PTR [rax+0x28],0x1
   140379526:	48 8b 0d 9b ce b8 14 	mov    rcx,QWORD PTR [rip+0x14b8ce9b]        # 0x154f063c8
   14037952d:	48 85 c9             	test   rcx,rcx
   140379530:	74 28                	je     0x14037955a
   140379532:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379535:	48 85 c0             	test   rax,rax
   140379538:	74 0f                	je     0x140379549
   14037953a:	48 8b c8             	mov    rcx,rax
   14037953d:	e8 16 20 2a 00       	call   0x14061b558
   140379542:	48 8b 0d 7f ce b8 14 	mov    rcx,QWORD PTR [rip+0x14b8ce7f]        # 0x154f063c8
   140379549:	ba 38 00 00 00       	mov    edx,0x38
   14037954e:	e8 05 20 2a 00       	call   0x14061b558
   140379553:	4c 89 2d 6e ce b8 14 	mov    QWORD PTR [rip+0x14b8ce6e],r13        # 0x154f063c8
   14037955a:	b9 38 00 00 00       	mov    ecx,0x38
   14037955f:	e8 ec 20 2a 00       	call   0x14061b650
   140379564:	33 c9                	xor    ecx,ecx
   140379566:	48 89 05 5b ce b8 14 	mov    QWORD PTR [rip+0x14b8ce5b],rax        # 0x154f063c8
   14037956d:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379570:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379574:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379578:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037957c:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379580:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379584:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379588:	b9 12 00 00 00       	mov    ecx,0x12
   14037958d:	e8 ce 1f 2a 00       	call   0x14061b560
   140379592:	48 8b 0d 2f ce b8 14 	mov    rcx,QWORD PTR [rip+0x14b8ce2f]        # 0x154f063c8
   140379599:	4c 8d 05 a0 61 33 00 	lea    r8,[rip+0x3361a0]        # 0x1406af740
   1403795a0:	ba 09 00 00 00       	mov    edx,0x9
   1403795a5:	48 89 01             	mov    QWORD PTR [rcx],rax
   1403795a8:	48 8b c8             	mov    rcx,rax
   1403795ab:	e8 a0 ea 1b 00       	call   0x140538050
   1403795b0:	48 8b 05 11 ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8ce11]        # 0x154f063c8
   1403795b7:	c6 40 08 32          	mov    BYTE PTR [rax+0x8],0x32
   1403795bb:	48 8b 05 06 ce b8 14 	mov    rax,QWORD PTR [rip+0x14b8ce06]        # 0x154f063c8
   1403795c2:	c6 40 09 60          	mov    BYTE PTR [rax+0x9],0x60
   1403795c6:	48 8b 05 fb cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cdfb]        # 0x154f063c8
   1403795cd:	c6 40 0a 60          	mov    BYTE PTR [rax+0xa],0x60
   1403795d1:	48 8b 05 f0 cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cdf0]        # 0x154f063c8
   1403795d8:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   1403795dc:	48 8b 05 e5 cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cde5]        # 0x154f063c8
   1403795e3:	c7 40 0c cd cc 2c 40 	mov    DWORD PTR [rax+0xc],0x402ccccd
   1403795ea:	48 8b 05 d7 cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cdd7]        # 0x154f063c8
   1403795f1:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   1403795f5:	48 8b 05 cc cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cdcc]        # 0x154f063c8
   1403795fc:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379600:	48 8b 05 c1 cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cdc1]        # 0x154f063c8
   140379607:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037960b:	48 8b 05 b6 cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cdb6]        # 0x154f063c8
   140379612:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140379616:	48 8b 05 ab cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cdab]        # 0x154f063c8
   14037961d:	c7 40 20 cd cc cc 3d 	mov    DWORD PTR [rax+0x20],0x3dcccccd
   140379624:	48 8b 05 9d cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cd9d]        # 0x154f063c8
   14037962b:	c7 40 30 00 00 80 3f 	mov    DWORD PTR [rax+0x30],0x3f800000
   140379632:	48 8b 05 8f cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cd8f]        # 0x154f063c8
   140379639:	c7 40 24 9a 99 99 3e 	mov    DWORD PTR [rax+0x24],0x3e99999a
   140379640:	48 8b 05 81 cd b8 14 	mov    rax,QWORD PTR [rip+0x14b8cd81]        # 0x154f063c8
   140379647:	c7 40 28 41 00 00 00 	mov    DWORD PTR [rax+0x28],0x41
   14037964e:	48 8b 0d 7b cd b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cd7b]        # 0x154f063d0
   140379655:	48 85 c9             	test   rcx,rcx
   140379658:	74 28                	je     0x140379682
   14037965a:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037965d:	48 85 c0             	test   rax,rax
   140379660:	74 0f                	je     0x140379671
   140379662:	48 8b c8             	mov    rcx,rax
   140379665:	e8 ee 1e 2a 00       	call   0x14061b558
   14037966a:	48 8b 0d 5f cd b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cd5f]        # 0x154f063d0
   140379671:	ba 38 00 00 00       	mov    edx,0x38
   140379676:	e8 dd 1e 2a 00       	call   0x14061b558
   14037967b:	4c 89 2d 4e cd b8 14 	mov    QWORD PTR [rip+0x14b8cd4e],r13        # 0x154f063d0
   140379682:	b9 38 00 00 00       	mov    ecx,0x38
   140379687:	e8 c4 1f 2a 00       	call   0x14061b650
   14037968c:	33 c9                	xor    ecx,ecx
   14037968e:	48 89 05 3b cd b8 14 	mov    QWORD PTR [rip+0x14b8cd3b],rax        # 0x154f063d0
   140379695:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379698:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037969c:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403796a0:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403796a4:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403796a8:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403796ac:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403796b0:	b9 08 00 00 00       	mov    ecx,0x8
   1403796b5:	e8 a6 1e 2a 00       	call   0x14061b560
   1403796ba:	48 8b 0d 0f cd b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cd0f]        # 0x154f063d0
   1403796c1:	4c 8d 05 90 60 33 00 	lea    r8,[rip+0x336090]        # 0x1406af758
   1403796c8:	ba 04 00 00 00       	mov    edx,0x4
   1403796cd:	48 89 01             	mov    QWORD PTR [rcx],rax
   1403796d0:	48 8b c8             	mov    rcx,rax
   1403796d3:	e8 78 e9 1b 00       	call   0x140538050
   1403796d8:	48 8b 05 f1 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8ccf1]        # 0x154f063d0
   1403796df:	c6 40 08 2c          	mov    BYTE PTR [rax+0x8],0x2c
   1403796e3:	48 8b 05 e6 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8cce6]        # 0x154f063d0
   1403796ea:	c6 40 09 50          	mov    BYTE PTR [rax+0x9],0x50
   1403796ee:	48 8b 05 db cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8ccdb]        # 0x154f063d0
   1403796f5:	c6 40 0a 50          	mov    BYTE PTR [rax+0xa],0x50
   1403796f9:	48 8b 05 d0 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8ccd0]        # 0x154f063d0
   140379700:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   140379704:	48 8b 05 c5 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8ccc5]        # 0x154f063d0
   14037970b:	c7 40 0c 00 00 40 40 	mov    DWORD PTR [rax+0xc],0x40400000
   140379712:	48 8b 05 b7 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8ccb7]        # 0x154f063d0
   140379719:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037971d:	48 8b 05 ac cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8ccac]        # 0x154f063d0
   140379724:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379728:	48 8b 05 a1 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8cca1]        # 0x154f063d0
   14037972f:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379733:	48 8b 05 96 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8cc96]        # 0x154f063d0
   14037973a:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037973e:	48 8b 05 8b cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8cc8b]        # 0x154f063d0
   140379745:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   14037974c:	48 8b 05 7d cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8cc7d]        # 0x154f063d0
   140379753:	c7 40 30 00 00 00 40 	mov    DWORD PTR [rax+0x30],0x40000000
   14037975a:	48 8b 05 6f cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8cc6f]        # 0x154f063d0
   140379761:	c7 40 24 00 00 00 3f 	mov    DWORD PTR [rax+0x24],0x3f000000
   140379768:	48 8b 05 61 cc b8 14 	mov    rax,QWORD PTR [rip+0x14b8cc61]        # 0x154f063d0
   14037976f:	c7 40 28 09 00 00 00 	mov    DWORD PTR [rax+0x28],0x9
   140379776:	48 8b 0d 5b cc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cc5b]        # 0x154f063d8
   14037977d:	48 85 c9             	test   rcx,rcx
   140379780:	74 28                	je     0x1403797aa
   140379782:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379785:	48 85 c0             	test   rax,rax
   140379788:	74 0f                	je     0x140379799
   14037978a:	48 8b c8             	mov    rcx,rax
   14037978d:	e8 c6 1d 2a 00       	call   0x14061b558
   140379792:	48 8b 0d 3f cc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cc3f]        # 0x154f063d8
   140379799:	ba 38 00 00 00       	mov    edx,0x38
   14037979e:	e8 b5 1d 2a 00       	call   0x14061b558
   1403797a3:	4c 89 2d 2e cc b8 14 	mov    QWORD PTR [rip+0x14b8cc2e],r13        # 0x154f063d8
   1403797aa:	b9 38 00 00 00       	mov    ecx,0x38
   1403797af:	e8 9c 1e 2a 00       	call   0x14061b650
   1403797b4:	33 c9                	xor    ecx,ecx
   1403797b6:	48 89 05 1b cc b8 14 	mov    QWORD PTR [rip+0x14b8cc1b],rax        # 0x154f063d8
   1403797bd:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403797c0:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403797c4:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403797c8:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403797cc:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403797d0:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403797d4:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403797d8:	b9 0e 00 00 00       	mov    ecx,0xe
   1403797dd:	e8 7e 1d 2a 00       	call   0x14061b560
   1403797e2:	48 8b 0d ef cb b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cbef]        # 0x154f063d8
   1403797e9:	4c 8d 05 70 5f 33 00 	lea    r8,[rip+0x335f70]        # 0x1406af760
   1403797f0:	ba 07 00 00 00       	mov    edx,0x7
   1403797f5:	48 89 01             	mov    QWORD PTR [rcx],rax
   1403797f8:	48 8b c8             	mov    rcx,rax
   1403797fb:	e8 50 e8 1b 00       	call   0x140538050
   140379800:	48 8b 05 d1 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cbd1]        # 0x154f063d8
   140379807:	c6 40 08 37          	mov    BYTE PTR [rax+0x8],0x37
   14037980b:	48 8b 05 c6 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cbc6]        # 0x154f063d8
   140379812:	c6 40 09 6c          	mov    BYTE PTR [rax+0x9],0x6c
   140379816:	48 8b 05 bb cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cbbb]        # 0x154f063d8
   14037981d:	c6 40 0a 6c          	mov    BYTE PTR [rax+0xa],0x6c
   140379821:	48 8b 05 b0 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cbb0]        # 0x154f063d8
   140379828:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037982c:	48 8b 05 a5 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cba5]        # 0x154f063d8
   140379833:	c7 40 0c 00 00 40 40 	mov    DWORD PTR [rax+0xc],0x40400000
   14037983a:	48 8b 05 97 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb97]        # 0x154f063d8
   140379841:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379845:	48 8b 05 8c cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb8c]        # 0x154f063d8
   14037984c:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379850:	48 8b 05 81 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb81]        # 0x154f063d8
   140379857:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037985b:	48 8b 05 76 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb76]        # 0x154f063d8
   140379862:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   140379869:	48 8b 05 68 cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb68]        # 0x154f063d8
   140379870:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140379877:	48 8b 05 5a cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb5a]        # 0x154f063d8
   14037987e:	c7 40 30 00 00 00 40 	mov    DWORD PTR [rax+0x30],0x40000000
   140379885:	48 8b 05 4c cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb4c]        # 0x154f063d8
   14037988c:	c7 40 24 9a 99 99 3e 	mov    DWORD PTR [rax+0x24],0x3e99999a
   140379893:	48 8b 05 3e cb b8 14 	mov    rax,QWORD PTR [rip+0x14b8cb3e]        # 0x154f063d8
   14037989a:	c7 40 28 c5 00 00 00 	mov    DWORD PTR [rax+0x28],0xc5
   1403798a1:	48 8b 0d 38 cb b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cb38]        # 0x154f063e0
   1403798a8:	48 85 c9             	test   rcx,rcx
   1403798ab:	74 28                	je     0x1403798d5
   1403798ad:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403798b0:	48 85 c0             	test   rax,rax
   1403798b3:	74 0f                	je     0x1403798c4
   1403798b5:	48 8b c8             	mov    rcx,rax
   1403798b8:	e8 9b 1c 2a 00       	call   0x14061b558
   1403798bd:	48 8b 0d 1c cb b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cb1c]        # 0x154f063e0
   1403798c4:	ba 38 00 00 00       	mov    edx,0x38
   1403798c9:	e8 8a 1c 2a 00       	call   0x14061b558
   1403798ce:	4c 89 2d 0b cb b8 14 	mov    QWORD PTR [rip+0x14b8cb0b],r13        # 0x154f063e0
   1403798d5:	b9 38 00 00 00       	mov    ecx,0x38
   1403798da:	e8 71 1d 2a 00       	call   0x14061b650
   1403798df:	33 c9                	xor    ecx,ecx
   1403798e1:	48 89 05 f8 ca b8 14 	mov    QWORD PTR [rip+0x14b8caf8],rax        # 0x154f063e0
   1403798e8:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403798eb:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403798ef:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403798f3:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403798f7:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403798fb:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403798ff:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379903:	b9 0c 00 00 00       	mov    ecx,0xc
   140379908:	e8 53 1c 2a 00       	call   0x14061b560
   14037990d:	48 8b 0d cc ca b8 14 	mov    rcx,QWORD PTR [rip+0x14b8cacc]        # 0x154f063e0
   140379914:	4c 8d 05 55 5e 33 00 	lea    r8,[rip+0x335e55]        # 0x1406af770
   14037991b:	ba 06 00 00 00       	mov    edx,0x6
   140379920:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379923:	48 8b c8             	mov    rcx,rax
   140379926:	e8 25 e7 1b 00       	call   0x140538050
   14037992b:	48 8b 05 ae ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8caae]        # 0x154f063e0
   140379932:	c6 40 08 24          	mov    BYTE PTR [rax+0x8],0x24
   140379936:	48 8b 05 a3 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8caa3]        # 0x154f063e0
   14037993d:	c6 40 09 43          	mov    BYTE PTR [rax+0x9],0x43
   140379941:	48 8b 05 98 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca98]        # 0x154f063e0
   140379948:	c6 40 0a 51          	mov    BYTE PTR [rax+0xa],0x51
   14037994c:	48 8b 05 8d ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca8d]        # 0x154f063e0
   140379953:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   140379957:	48 8b 05 82 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca82]        # 0x154f063e0
   14037995e:	c7 40 0c 00 00 00 40 	mov    DWORD PTR [rax+0xc],0x40000000
   140379965:	48 8b 05 74 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca74]        # 0x154f063e0
   14037996c:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379970:	48 8b 05 69 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca69]        # 0x154f063e0
   140379977:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037997b:	48 8b 05 5e ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca5e]        # 0x154f063e0
   140379982:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379986:	48 8b 05 53 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca53]        # 0x154f063e0
   14037998d:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   140379994:	48 8b 05 45 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca45]        # 0x154f063e0
   14037999b:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   1403799a2:	48 8b 05 37 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca37]        # 0x154f063e0
   1403799a9:	c7 40 30 00 00 00 40 	mov    DWORD PTR [rax+0x30],0x40000000
   1403799b0:	48 8b 05 29 ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca29]        # 0x154f063e0
   1403799b7:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   1403799be:	48 8b 05 1b ca b8 14 	mov    rax,QWORD PTR [rip+0x14b8ca1b]        # 0x154f063e0
   1403799c5:	c7 40 28 47 00 00 00 	mov    DWORD PTR [rax+0x28],0x47
   1403799cc:	48 8b 0d 15 ca b8 14 	mov    rcx,QWORD PTR [rip+0x14b8ca15]        # 0x154f063e8
   1403799d3:	48 85 c9             	test   rcx,rcx
   1403799d6:	74 28                	je     0x140379a00
   1403799d8:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403799db:	48 85 c0             	test   rax,rax
   1403799de:	74 0f                	je     0x1403799ef
   1403799e0:	48 8b c8             	mov    rcx,rax
   1403799e3:	e8 70 1b 2a 00       	call   0x14061b558
   1403799e8:	48 8b 0d f9 c9 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c9f9]        # 0x154f063e8
   1403799ef:	ba 38 00 00 00       	mov    edx,0x38
   1403799f4:	e8 5f 1b 2a 00       	call   0x14061b558
   1403799f9:	4c 89 2d e8 c9 b8 14 	mov    QWORD PTR [rip+0x14b8c9e8],r13        # 0x154f063e8
   140379a00:	b9 38 00 00 00       	mov    ecx,0x38
   140379a05:	e8 46 1c 2a 00       	call   0x14061b650
   140379a0a:	33 c9                	xor    ecx,ecx
   140379a0c:	48 89 05 d5 c9 b8 14 	mov    QWORD PTR [rip+0x14b8c9d5],rax        # 0x154f063e8
   140379a13:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379a16:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379a1a:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379a1e:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379a22:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379a26:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379a2a:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379a2e:	b9 1a 00 00 00       	mov    ecx,0x1a
   140379a33:	e8 28 1b 2a 00       	call   0x14061b560
   140379a38:	48 8b 0d a9 c9 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c9a9]        # 0x154f063e8
   140379a3f:	4c 8d 05 3a 5d 33 00 	lea    r8,[rip+0x335d3a]        # 0x1406af780
   140379a46:	ba 0d 00 00 00       	mov    edx,0xd
   140379a4b:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379a4e:	48 8b c8             	mov    rcx,rax
   140379a51:	e8 fa e5 1b 00       	call   0x140538050
   140379a56:	48 8b 05 8b c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c98b]        # 0x154f063e8
   140379a5d:	c6 40 08 1c          	mov    BYTE PTR [rax+0x8],0x1c
   140379a61:	48 8b 05 80 c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c980]        # 0x154f063e8
   140379a68:	c6 40 09 43          	mov    BYTE PTR [rax+0x9],0x43
   140379a6c:	48 8b 05 75 c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c975]        # 0x154f063e8
   140379a73:	c6 40 0a 43          	mov    BYTE PTR [rax+0xa],0x43
   140379a77:	48 8b 05 6a c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c96a]        # 0x154f063e8
   140379a7e:	c7 40 2c 00 00 80 3e 	mov    DWORD PTR [rax+0x2c],0x3e800000
   140379a85:	48 8b 05 5c c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c95c]        # 0x154f063e8
   140379a8c:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   140379a93:	48 8b 05 4e c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c94e]        # 0x154f063e8
   140379a9a:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379a9e:	48 8b 05 43 c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c943]        # 0x154f063e8
   140379aa5:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379aa9:	48 8b 05 38 c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c938]        # 0x154f063e8
   140379ab0:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379ab4:	48 8b 05 2d c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c92d]        # 0x154f063e8
   140379abb:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140379abf:	48 8b 05 22 c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c922]        # 0x154f063e8
   140379ac6:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140379acd:	48 8b 05 14 c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c914]        # 0x154f063e8
   140379ad4:	c7 40 30 00 00 80 40 	mov    DWORD PTR [rax+0x30],0x40800000
   140379adb:	48 8b 05 06 c9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c906]        # 0x154f063e8
   140379ae2:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   140379ae9:	48 8b 05 f8 c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c8f8]        # 0x154f063e8
   140379af0:	44 89 68 28          	mov    DWORD PTR [rax+0x28],r13d
   140379af4:	48 8b 0d f5 c8 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c8f5]        # 0x154f063f0
   140379afb:	48 85 c9             	test   rcx,rcx
   140379afe:	74 28                	je     0x140379b28
   140379b00:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379b03:	48 85 c0             	test   rax,rax
   140379b06:	74 0f                	je     0x140379b17
   140379b08:	48 8b c8             	mov    rcx,rax
   140379b0b:	e8 48 1a 2a 00       	call   0x14061b558
   140379b10:	48 8b 0d d9 c8 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c8d9]        # 0x154f063f0
   140379b17:	ba 38 00 00 00       	mov    edx,0x38
   140379b1c:	e8 37 1a 2a 00       	call   0x14061b558
   140379b21:	4c 89 2d c8 c8 b8 14 	mov    QWORD PTR [rip+0x14b8c8c8],r13        # 0x154f063f0
   140379b28:	b9 38 00 00 00       	mov    ecx,0x38
   140379b2d:	e8 1e 1b 2a 00       	call   0x14061b650
   140379b32:	33 c9                	xor    ecx,ecx
   140379b34:	48 89 05 b5 c8 b8 14 	mov    QWORD PTR [rip+0x14b8c8b5],rax        # 0x154f063f0
   140379b3b:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379b3e:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379b42:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379b46:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379b4a:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379b4e:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379b52:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379b56:	b9 1e 00 00 00       	mov    ecx,0x1e
   140379b5b:	e8 00 1a 2a 00       	call   0x14061b560
   140379b60:	48 8b 0d 89 c8 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c889]        # 0x154f063f0
   140379b67:	4c 8d 05 32 5c 33 00 	lea    r8,[rip+0x335c32]        # 0x1406af7a0
   140379b6e:	ba 0f 00 00 00       	mov    edx,0xf
   140379b73:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379b76:	48 8b c8             	mov    rcx,rax
   140379b79:	e8 d2 e4 1b 00       	call   0x140538050
   140379b7e:	48 8b 05 6b c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c86b]        # 0x154f063f0
   140379b85:	c6 40 08 37          	mov    BYTE PTR [rax+0x8],0x37
   140379b89:	48 8b 05 60 c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c860]        # 0x154f063f0
   140379b90:	c6 40 09 6c          	mov    BYTE PTR [rax+0x9],0x6c
   140379b94:	48 8b 05 55 c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c855]        # 0x154f063f0
   140379b9b:	c6 40 0a 6c          	mov    BYTE PTR [rax+0xa],0x6c
   140379b9f:	48 8b 05 4a c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c84a]        # 0x154f063f0
   140379ba6:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   140379baa:	48 8b 05 3f c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c83f]        # 0x154f063f0
   140379bb1:	c7 40 0c 00 00 40 40 	mov    DWORD PTR [rax+0xc],0x40400000
   140379bb8:	48 8b 05 31 c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c831]        # 0x154f063f0
   140379bbf:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379bc3:	48 8b 05 26 c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c826]        # 0x154f063f0
   140379bca:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379bce:	48 8b 05 1b c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c81b]        # 0x154f063f0
   140379bd5:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379bd9:	48 8b 05 10 c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c810]        # 0x154f063f0
   140379be0:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   140379be7:	48 8b 05 02 c8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c802]        # 0x154f063f0
   140379bee:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140379bf5:	48 8b 05 f4 c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c7f4]        # 0x154f063f0
   140379bfc:	c7 40 30 00 00 00 40 	mov    DWORD PTR [rax+0x30],0x40000000
   140379c03:	48 8b 05 e6 c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c7e6]        # 0x154f063f0
   140379c0a:	c7 40 24 9a 99 99 3e 	mov    DWORD PTR [rax+0x24],0x3e99999a
   140379c11:	48 8b 05 d8 c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c7d8]        # 0x154f063f0
   140379c18:	c7 40 28 45 00 00 00 	mov    DWORD PTR [rax+0x28],0x45
   140379c1f:	48 8b 0d d2 c7 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c7d2]        # 0x154f063f8
   140379c26:	48 85 c9             	test   rcx,rcx
   140379c29:	74 28                	je     0x140379c53
   140379c2b:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379c2e:	48 85 c0             	test   rax,rax
   140379c31:	74 0f                	je     0x140379c42
   140379c33:	48 8b c8             	mov    rcx,rax
   140379c36:	e8 1d 19 2a 00       	call   0x14061b558
   140379c3b:	48 8b 0d b6 c7 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c7b6]        # 0x154f063f8
   140379c42:	ba 38 00 00 00       	mov    edx,0x38
   140379c47:	e8 0c 19 2a 00       	call   0x14061b558
   140379c4c:	4c 89 2d a5 c7 b8 14 	mov    QWORD PTR [rip+0x14b8c7a5],r13        # 0x154f063f8
   140379c53:	b9 38 00 00 00       	mov    ecx,0x38
   140379c58:	e8 f3 19 2a 00       	call   0x14061b650
   140379c5d:	33 c9                	xor    ecx,ecx
   140379c5f:	48 89 05 92 c7 b8 14 	mov    QWORD PTR [rip+0x14b8c792],rax        # 0x154f063f8
   140379c66:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379c69:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379c6d:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379c71:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379c75:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379c79:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379c7d:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379c81:	b9 1c 00 00 00       	mov    ecx,0x1c
   140379c86:	e8 d5 18 2a 00       	call   0x14061b560
   140379c8b:	48 8b 0d 66 c7 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c766]        # 0x154f063f8
   140379c92:	4c 8d 05 27 5b 33 00 	lea    r8,[rip+0x335b27]        # 0x1406af7c0
   140379c99:	ba 0e 00 00 00       	mov    edx,0xe
   140379c9e:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379ca1:	48 8b c8             	mov    rcx,rax
   140379ca4:	e8 a7 e3 1b 00       	call   0x140538050
   140379ca9:	48 8b 05 48 c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c748]        # 0x154f063f8
   140379cb0:	c6 40 08 24          	mov    BYTE PTR [rax+0x8],0x24
   140379cb4:	48 8b 05 3d c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c73d]        # 0x154f063f8
   140379cbb:	c6 40 09 51          	mov    BYTE PTR [rax+0x9],0x51
   140379cbf:	48 8b 05 32 c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c732]        # 0x154f063f8
   140379cc6:	c6 40 0a 51          	mov    BYTE PTR [rax+0xa],0x51
   140379cca:	48 8b 05 27 c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c727]        # 0x154f063f8
   140379cd1:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   140379cd5:	48 8b 05 1c c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c71c]        # 0x154f063f8
   140379cdc:	c7 40 0c 00 00 00 40 	mov    DWORD PTR [rax+0xc],0x40000000
   140379ce3:	48 8b 05 0e c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c70e]        # 0x154f063f8
   140379cea:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379cee:	48 8b 05 03 c7 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c703]        # 0x154f063f8
   140379cf5:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379cf9:	48 8b 05 f8 c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c6f8]        # 0x154f063f8
   140379d00:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379d04:	48 8b 05 ed c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c6ed]        # 0x154f063f8
   140379d0b:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   140379d12:	48 8b 05 df c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c6df]        # 0x154f063f8
   140379d19:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140379d20:	48 8b 05 d1 c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c6d1]        # 0x154f063f8
   140379d27:	c7 40 30 00 00 00 40 	mov    DWORD PTR [rax+0x30],0x40000000
   140379d2e:	48 8b 05 c3 c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c6c3]        # 0x154f063f8
   140379d35:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   140379d3c:	48 8b 05 b5 c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c6b5]        # 0x154f063f8
   140379d43:	c7 40 28 45 00 00 00 	mov    DWORD PTR [rax+0x28],0x45
   140379d4a:	48 8b 0d af c6 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c6af]        # 0x154f06400
   140379d51:	48 85 c9             	test   rcx,rcx
   140379d54:	74 28                	je     0x140379d7e
   140379d56:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379d59:	48 85 c0             	test   rax,rax
   140379d5c:	74 0f                	je     0x140379d6d
   140379d5e:	48 8b c8             	mov    rcx,rax
   140379d61:	e8 f2 17 2a 00       	call   0x14061b558
   140379d66:	48 8b 0d 93 c6 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c693]        # 0x154f06400
   140379d6d:	ba 38 00 00 00       	mov    edx,0x38
   140379d72:	e8 e1 17 2a 00       	call   0x14061b558
   140379d77:	4c 89 2d 82 c6 b8 14 	mov    QWORD PTR [rip+0x14b8c682],r13        # 0x154f06400
   140379d7e:	b9 38 00 00 00       	mov    ecx,0x38
   140379d83:	e8 c8 18 2a 00       	call   0x14061b650
   140379d88:	33 c9                	xor    ecx,ecx
   140379d8a:	48 89 05 6f c6 b8 14 	mov    QWORD PTR [rip+0x14b8c66f],rax        # 0x154f06400
   140379d91:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379d94:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379d98:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379d9c:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379da0:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379da4:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379da8:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379dac:	b9 0a 00 00 00       	mov    ecx,0xa
   140379db1:	e8 aa 17 2a 00       	call   0x14061b560
   140379db6:	48 8b 0d 43 c6 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c643]        # 0x154f06400
   140379dbd:	4c 8d 05 1c 5a 33 00 	lea    r8,[rip+0x335a1c]        # 0x1406af7e0
   140379dc4:	ba 05 00 00 00       	mov    edx,0x5
   140379dc9:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379dcc:	48 8b c8             	mov    rcx,rax
   140379dcf:	e8 7c e2 1b 00       	call   0x140538050
   140379dd4:	48 8b 05 25 c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c625]        # 0x154f06400
   140379ddb:	c6 40 08 45          	mov    BYTE PTR [rax+0x8],0x45
   140379ddf:	48 8b 05 1a c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c61a]        # 0x154f06400
   140379de6:	c6 40 09 53          	mov    BYTE PTR [rax+0x9],0x53
   140379dea:	48 8b 05 0f c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c60f]        # 0x154f06400
   140379df1:	c6 40 0a 53          	mov    BYTE PTR [rax+0xa],0x53
   140379df5:	48 8b 05 04 c6 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c604]        # 0x154f06400
   140379dfc:	c7 40 2c cd cc cc 3d 	mov    DWORD PTR [rax+0x2c],0x3dcccccd
   140379e03:	48 8b 05 f6 c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5f6]        # 0x154f06400
   140379e0a:	c7 40 0c 00 00 00 40 	mov    DWORD PTR [rax+0xc],0x40000000
   140379e11:	48 8b 05 e8 c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5e8]        # 0x154f06400
   140379e18:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379e1c:	48 8b 05 dd c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5dd]        # 0x154f06400
   140379e23:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379e27:	48 8b 05 d2 c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5d2]        # 0x154f06400
   140379e2e:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379e32:	48 8b 05 c7 c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5c7]        # 0x154f06400
   140379e39:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140379e3d:	48 8b 05 bc c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5bc]        # 0x154f06400
   140379e44:	c7 40 20 9a 99 99 3e 	mov    DWORD PTR [rax+0x20],0x3e99999a
   140379e4b:	48 8b 05 ae c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5ae]        # 0x154f06400
   140379e52:	c7 40 30 00 00 80 3f 	mov    DWORD PTR [rax+0x30],0x3f800000
   140379e59:	48 8b 05 a0 c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c5a0]        # 0x154f06400
   140379e60:	c7 40 24 cd cc 4c 3e 	mov    DWORD PTR [rax+0x24],0x3e4ccccd
   140379e67:	48 8b 05 92 c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c592]        # 0x154f06400
   140379e6e:	c7 40 28 01 00 00 00 	mov    DWORD PTR [rax+0x28],0x1
   140379e75:	48 8b 0d 8c c5 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c58c]        # 0x154f06408
   140379e7c:	48 85 c9             	test   rcx,rcx
   140379e7f:	74 28                	je     0x140379ea9
   140379e81:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379e84:	48 85 c0             	test   rax,rax
   140379e87:	74 0f                	je     0x140379e98
   140379e89:	48 8b c8             	mov    rcx,rax
   140379e8c:	e8 c7 16 2a 00       	call   0x14061b558
   140379e91:	48 8b 0d 70 c5 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c570]        # 0x154f06408
   140379e98:	ba 38 00 00 00       	mov    edx,0x38
   140379e9d:	e8 b6 16 2a 00       	call   0x14061b558
   140379ea2:	4c 89 2d 5f c5 b8 14 	mov    QWORD PTR [rip+0x14b8c55f],r13        # 0x154f06408
   140379ea9:	b9 38 00 00 00       	mov    ecx,0x38
   140379eae:	e8 9d 17 2a 00       	call   0x14061b650
   140379eb3:	33 c9                	xor    ecx,ecx
   140379eb5:	48 89 05 4c c5 b8 14 	mov    QWORD PTR [rip+0x14b8c54c],rax        # 0x154f06408
   140379ebc:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379ebf:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379ec3:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379ec7:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379ecb:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379ecf:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379ed3:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379ed7:	b9 20 00 00 00       	mov    ecx,0x20
   140379edc:	e8 7f 16 2a 00       	call   0x14061b560
   140379ee1:	48 8b 0d 20 c5 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c520]        # 0x154f06408
   140379ee8:	4c 8d 05 01 59 33 00 	lea    r8,[rip+0x335901]        # 0x1406af7f0
   140379eef:	ba 10 00 00 00       	mov    edx,0x10
   140379ef4:	48 89 01             	mov    QWORD PTR [rcx],rax
   140379ef7:	48 8b c8             	mov    rcx,rax
   140379efa:	e8 51 e1 1b 00       	call   0x140538050
   140379eff:	48 8b 05 02 c5 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c502]        # 0x154f06408
   140379f06:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   140379f0a:	48 8b 05 f7 c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4f7]        # 0x154f06408
   140379f11:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   140379f15:	48 8b 05 ec c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4ec]        # 0x154f06408
   140379f1c:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   140379f20:	48 8b 05 e1 c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4e1]        # 0x154f06408
   140379f27:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   140379f2b:	48 8b 05 d6 c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4d6]        # 0x154f06408
   140379f32:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   140379f36:	48 8b 05 cb c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4cb]        # 0x154f06408
   140379f3d:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140379f41:	48 8b 05 c0 c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4c0]        # 0x154f06408
   140379f48:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   140379f4c:	48 8b 05 b5 c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4b5]        # 0x154f06408
   140379f53:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   140379f57:	48 8b 05 aa c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c4aa]        # 0x154f06408
   140379f5e:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   140379f62:	48 8b 05 9f c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c49f]        # 0x154f06408
   140379f69:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   140379f6d:	48 8b 05 94 c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c494]        # 0x154f06408
   140379f74:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   140379f78:	48 8b 05 89 c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c489]        # 0x154f06408
   140379f7f:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   140379f83:	48 8b 05 7e c4 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c47e]        # 0x154f06408
   140379f8a:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   140379f91:	48 8b 0d 78 c4 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c478]        # 0x154f06410
   140379f98:	48 85 c9             	test   rcx,rcx
   140379f9b:	74 28                	je     0x140379fc5
   140379f9d:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   140379fa0:	48 85 c0             	test   rax,rax
   140379fa3:	74 0f                	je     0x140379fb4
   140379fa5:	48 8b c8             	mov    rcx,rax
   140379fa8:	e8 ab 15 2a 00       	call   0x14061b558
   140379fad:	48 8b 0d 5c c4 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c45c]        # 0x154f06410
   140379fb4:	ba 38 00 00 00       	mov    edx,0x38
   140379fb9:	e8 9a 15 2a 00       	call   0x14061b558
   140379fbe:	4c 89 2d 4b c4 b8 14 	mov    QWORD PTR [rip+0x14b8c44b],r13        # 0x154f06410
   140379fc5:	b9 38 00 00 00       	mov    ecx,0x38
   140379fca:	e8 81 16 2a 00       	call   0x14061b650
   140379fcf:	33 c9                	xor    ecx,ecx
   140379fd1:	48 89 05 38 c4 b8 14 	mov    QWORD PTR [rip+0x14b8c438],rax        # 0x154f06410
   140379fd8:	48 89 08             	mov    QWORD PTR [rax],rcx
   140379fdb:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   140379fdf:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   140379fe3:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   140379fe7:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   140379feb:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   140379fef:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   140379ff3:	b9 22 00 00 00       	mov    ecx,0x22
   140379ff8:	e8 63 15 2a 00       	call   0x14061b560
   140379ffd:	48 8b 0d 0c c4 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c40c]        # 0x154f06410
   14037a004:	4c 8d 05 05 58 33 00 	lea    r8,[rip+0x335805]        # 0x1406af810
   14037a00b:	ba 11 00 00 00       	mov    edx,0x11
   14037a010:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a013:	48 8b c8             	mov    rcx,rax
   14037a016:	e8 35 e0 1b 00       	call   0x140538050
   14037a01b:	48 8b 05 ee c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3ee]        # 0x154f06410
   14037a022:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a026:	48 8b 05 e3 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3e3]        # 0x154f06410
   14037a02d:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a031:	48 8b 05 d8 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3d8]        # 0x154f06410
   14037a038:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a03c:	48 8b 05 cd c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3cd]        # 0x154f06410
   14037a043:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a047:	48 8b 05 c2 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3c2]        # 0x154f06410
   14037a04e:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a052:	48 8b 05 b7 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3b7]        # 0x154f06410
   14037a059:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a05d:	48 8b 05 ac c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3ac]        # 0x154f06410
   14037a064:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a068:	48 8b 05 a1 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c3a1]        # 0x154f06410
   14037a06f:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a073:	48 8b 05 96 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c396]        # 0x154f06410
   14037a07a:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a07e:	48 8b 05 8b c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c38b]        # 0x154f06410
   14037a085:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a089:	48 8b 05 80 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c380]        # 0x154f06410
   14037a090:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a094:	48 8b 05 75 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c375]        # 0x154f06410
   14037a09b:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a09f:	48 8b 05 6a c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c36a]        # 0x154f06410
   14037a0a6:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a0ad:	48 8b 0d ac c3 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c3ac]        # 0x154f06460
   14037a0b4:	48 85 c9             	test   rcx,rcx
   14037a0b7:	74 28                	je     0x14037a0e1
   14037a0b9:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a0bc:	48 85 c0             	test   rax,rax
   14037a0bf:	74 0f                	je     0x14037a0d0
   14037a0c1:	48 8b c8             	mov    rcx,rax
   14037a0c4:	e8 8f 14 2a 00       	call   0x14061b558
   14037a0c9:	48 8b 0d 90 c3 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c390]        # 0x154f06460
   14037a0d0:	ba 38 00 00 00       	mov    edx,0x38
   14037a0d5:	e8 7e 14 2a 00       	call   0x14061b558
   14037a0da:	4c 89 2d 7f c3 b8 14 	mov    QWORD PTR [rip+0x14b8c37f],r13        # 0x154f06460
   14037a0e1:	b9 38 00 00 00       	mov    ecx,0x38
   14037a0e6:	e8 65 15 2a 00       	call   0x14061b650
   14037a0eb:	33 c9                	xor    ecx,ecx
   14037a0ed:	48 89 05 6c c3 b8 14 	mov    QWORD PTR [rip+0x14b8c36c],rax        # 0x154f06460
   14037a0f4:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a0f7:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a0fb:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a0ff:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a103:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a107:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a10b:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a10f:	b9 08 00 00 00       	mov    ecx,0x8
   14037a114:	e8 47 14 2a 00       	call   0x14061b560
   14037a119:	48 8b 0d 40 c3 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c340]        # 0x154f06460
   14037a120:	4c 8d 05 11 57 33 00 	lea    r8,[rip+0x335711]        # 0x1406af838
   14037a127:	ba 04 00 00 00       	mov    edx,0x4
   14037a12c:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a12f:	48 8b c8             	mov    rcx,rax
   14037a132:	e8 19 df 1b 00       	call   0x140538050
   14037a137:	48 8b 05 22 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c322]        # 0x154f06460
   14037a13e:	c6 40 08 29          	mov    BYTE PTR [rax+0x8],0x29
   14037a142:	48 8b 05 17 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c317]        # 0x154f06460
   14037a149:	c6 40 09 5b          	mov    BYTE PTR [rax+0x9],0x5b
   14037a14d:	48 8b 05 0c c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c30c]        # 0x154f06460
   14037a154:	c6 40 0a 5b          	mov    BYTE PTR [rax+0xa],0x5b
   14037a158:	48 8b 05 01 c3 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c301]        # 0x154f06460
   14037a15f:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a163:	48 8b 05 f6 c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c2f6]        # 0x154f06460
   14037a16a:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   14037a171:	48 8b 05 e8 c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c2e8]        # 0x154f06460
   14037a178:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a17c:	48 8b 05 dd c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c2dd]        # 0x154f06460
   14037a183:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a187:	48 8b 05 d2 c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c2d2]        # 0x154f06460
   14037a18e:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a192:	48 8b 05 c7 c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c2c7]        # 0x154f06460
   14037a199:	c7 40 1c 00 00 c0 3f 	mov    DWORD PTR [rax+0x1c],0x3fc00000
   14037a1a0:	48 8b 05 b9 c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c2b9]        # 0x154f06460
   14037a1a7:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   14037a1ae:	48 8b 05 ab c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c2ab]        # 0x154f06460
   14037a1b5:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   14037a1bc:	48 8b 05 9d c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c29d]        # 0x154f06460
   14037a1c3:	c7 40 24 00 00 80 3f 	mov    DWORD PTR [rax+0x24],0x3f800000
   14037a1ca:	48 8b 05 8f c2 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c28f]        # 0x154f06460
   14037a1d1:	c7 40 28 a3 00 00 00 	mov    DWORD PTR [rax+0x28],0xa3
   14037a1d8:	48 8b 0d 89 c2 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c289]        # 0x154f06468
   14037a1df:	48 85 c9             	test   rcx,rcx
   14037a1e2:	74 28                	je     0x14037a20c
   14037a1e4:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a1e7:	48 85 c0             	test   rax,rax
   14037a1ea:	74 0f                	je     0x14037a1fb
   14037a1ec:	48 8b c8             	mov    rcx,rax
   14037a1ef:	e8 64 13 2a 00       	call   0x14061b558
   14037a1f4:	48 8b 0d 6d c2 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c26d]        # 0x154f06468
   14037a1fb:	ba 38 00 00 00       	mov    edx,0x38
   14037a200:	e8 53 13 2a 00       	call   0x14061b558
   14037a205:	4c 89 2d 5c c2 b8 14 	mov    QWORD PTR [rip+0x14b8c25c],r13        # 0x154f06468
   14037a20c:	b9 38 00 00 00       	mov    ecx,0x38
   14037a211:	e8 3a 14 2a 00       	call   0x14061b650
   14037a216:	33 c9                	xor    ecx,ecx
   14037a218:	48 89 05 49 c2 b8 14 	mov    QWORD PTR [rip+0x14b8c249],rax        # 0x154f06468
   14037a21f:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a222:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a226:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a22a:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a22e:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a232:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a236:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a23a:	b9 0a 00 00 00       	mov    ecx,0xa
   14037a23f:	e8 1c 13 2a 00       	call   0x14061b560
   14037a244:	48 8b 0d 1d c2 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c21d]        # 0x154f06468
   14037a24b:	4c 8d 05 ee 55 33 00 	lea    r8,[rip+0x3355ee]        # 0x1406af840
   14037a252:	ba 05 00 00 00       	mov    edx,0x5
   14037a257:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a25a:	48 8b c8             	mov    rcx,rax
   14037a25d:	e8 ee dd 1b 00       	call   0x140538050
   14037a262:	48 8b 05 ff c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1ff]        # 0x154f06468
   14037a269:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a26d:	48 8b 05 f4 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1f4]        # 0x154f06468
   14037a274:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a278:	48 8b 05 e9 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1e9]        # 0x154f06468
   14037a27f:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a283:	48 8b 05 de c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1de]        # 0x154f06468
   14037a28a:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a28e:	48 8b 05 d3 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1d3]        # 0x154f06468
   14037a295:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a299:	48 8b 05 c8 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1c8]        # 0x154f06468
   14037a2a0:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a2a4:	48 8b 05 bd c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1bd]        # 0x154f06468
   14037a2ab:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a2af:	48 8b 05 b2 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1b2]        # 0x154f06468
   14037a2b6:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a2ba:	48 8b 05 a7 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c1a7]        # 0x154f06468
   14037a2c1:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a2c5:	48 8b 05 9c c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c19c]        # 0x154f06468
   14037a2cc:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a2d0:	48 8b 05 91 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c191]        # 0x154f06468
   14037a2d7:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a2db:	48 8b 05 86 c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c186]        # 0x154f06468
   14037a2e2:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a2e6:	48 8b 05 7b c1 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c17b]        # 0x154f06468
   14037a2ed:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a2f4:	48 8b 0d 75 c1 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c175]        # 0x154f06470
   14037a2fb:	48 85 c9             	test   rcx,rcx
   14037a2fe:	74 28                	je     0x14037a328
   14037a300:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a303:	48 85 c0             	test   rax,rax
   14037a306:	74 0f                	je     0x14037a317
   14037a308:	48 8b c8             	mov    rcx,rax
   14037a30b:	e8 48 12 2a 00       	call   0x14061b558
   14037a310:	48 8b 0d 59 c1 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c159]        # 0x154f06470
   14037a317:	ba 38 00 00 00       	mov    edx,0x38
   14037a31c:	e8 37 12 2a 00       	call   0x14061b558
   14037a321:	4c 89 2d 48 c1 b8 14 	mov    QWORD PTR [rip+0x14b8c148],r13        # 0x154f06470
   14037a328:	b9 38 00 00 00       	mov    ecx,0x38
   14037a32d:	e8 1e 13 2a 00       	call   0x14061b650
   14037a332:	33 c9                	xor    ecx,ecx
   14037a334:	48 89 05 35 c1 b8 14 	mov    QWORD PTR [rip+0x14b8c135],rax        # 0x154f06470
   14037a33b:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a33e:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a342:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a346:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a34a:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a34e:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a352:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a356:	b9 0c 00 00 00       	mov    ecx,0xc
   14037a35b:	e8 00 12 2a 00       	call   0x14061b560
   14037a360:	48 8b 0d 09 c1 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c109]        # 0x154f06470
   14037a367:	4c 8d 05 e2 54 33 00 	lea    r8,[rip+0x3354e2]        # 0x1406af850
   14037a36e:	ba 06 00 00 00       	mov    edx,0x6
   14037a373:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a376:	48 8b c8             	mov    rcx,rax
   14037a379:	e8 d2 dc 1b 00       	call   0x140538050
   14037a37e:	48 8b 05 eb c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c0eb]        # 0x154f06470
   14037a385:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a389:	48 8b 05 e0 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c0e0]        # 0x154f06470
   14037a390:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a394:	48 8b 05 d5 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c0d5]        # 0x154f06470
   14037a39b:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a39f:	48 8b 05 ca c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c0ca]        # 0x154f06470
   14037a3a6:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a3aa:	48 8b 05 bf c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c0bf]        # 0x154f06470
   14037a3b1:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a3b5:	48 8b 05 b4 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c0b4]        # 0x154f06470
   14037a3bc:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a3c0:	48 8b 05 a9 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c0a9]        # 0x154f06470
   14037a3c7:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a3cb:	48 8b 05 9e c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c09e]        # 0x154f06470
   14037a3d2:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a3d6:	48 8b 05 93 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c093]        # 0x154f06470
   14037a3dd:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a3e1:	48 8b 05 88 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c088]        # 0x154f06470
   14037a3e8:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a3ec:	48 8b 05 7d c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c07d]        # 0x154f06470
   14037a3f3:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a3f7:	48 8b 05 72 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c072]        # 0x154f06470
   14037a3fe:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a402:	48 8b 05 67 c0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8c067]        # 0x154f06470
   14037a409:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a410:	48 8b 0d 61 c0 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c061]        # 0x154f06478
   14037a417:	48 85 c9             	test   rcx,rcx
   14037a41a:	74 28                	je     0x14037a444
   14037a41c:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a41f:	48 85 c0             	test   rax,rax
   14037a422:	74 0f                	je     0x14037a433
   14037a424:	48 8b c8             	mov    rcx,rax
   14037a427:	e8 2c 11 2a 00       	call   0x14061b558
   14037a42c:	48 8b 0d 45 c0 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8c045]        # 0x154f06478
   14037a433:	ba 38 00 00 00       	mov    edx,0x38
   14037a438:	e8 1b 11 2a 00       	call   0x14061b558
   14037a43d:	4c 89 2d 34 c0 b8 14 	mov    QWORD PTR [rip+0x14b8c034],r13        # 0x154f06478
   14037a444:	b9 38 00 00 00       	mov    ecx,0x38
   14037a449:	e8 02 12 2a 00       	call   0x14061b650
   14037a44e:	33 c9                	xor    ecx,ecx
   14037a450:	48 89 05 21 c0 b8 14 	mov    QWORD PTR [rip+0x14b8c021],rax        # 0x154f06478
   14037a457:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a45a:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a45e:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a462:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a466:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a46a:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a46e:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a472:	b9 16 00 00 00       	mov    ecx,0x16
   14037a477:	e8 e4 10 2a 00       	call   0x14061b560
   14037a47c:	48 8b 0d f5 bf b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bff5]        # 0x154f06478
   14037a483:	4c 8d 05 d6 53 33 00 	lea    r8,[rip+0x3353d6]        # 0x1406af860
   14037a48a:	ba 0b 00 00 00       	mov    edx,0xb
   14037a48f:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a492:	48 8b c8             	mov    rcx,rax
   14037a495:	e8 b6 db 1b 00       	call   0x140538050
   14037a49a:	48 8b 05 d7 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bfd7]        # 0x154f06478
   14037a4a1:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a4a5:	48 8b 05 cc bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bfcc]        # 0x154f06478
   14037a4ac:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a4b0:	48 8b 05 c1 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bfc1]        # 0x154f06478
   14037a4b7:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a4bb:	48 8b 05 b6 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bfb6]        # 0x154f06478
   14037a4c2:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a4c6:	48 8b 05 ab bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bfab]        # 0x154f06478
   14037a4cd:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a4d1:	48 8b 05 a0 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bfa0]        # 0x154f06478
   14037a4d8:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a4dc:	48 8b 05 95 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf95]        # 0x154f06478
   14037a4e3:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a4e7:	48 8b 05 8a bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf8a]        # 0x154f06478
   14037a4ee:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a4f2:	48 8b 05 7f bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf7f]        # 0x154f06478
   14037a4f9:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a4fd:	48 8b 05 74 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf74]        # 0x154f06478
   14037a504:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a508:	48 8b 05 69 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf69]        # 0x154f06478
   14037a50f:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a513:	48 8b 05 5e bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf5e]        # 0x154f06478
   14037a51a:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a51e:	48 8b 05 53 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf53]        # 0x154f06478
   14037a525:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a52c:	48 8b 0d d5 bf b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bfd5]        # 0x154f06508
   14037a533:	48 85 c9             	test   rcx,rcx
   14037a536:	74 28                	je     0x14037a560
   14037a538:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a53b:	48 85 c0             	test   rax,rax
   14037a53e:	74 0f                	je     0x14037a54f
   14037a540:	48 8b c8             	mov    rcx,rax
   14037a543:	e8 10 10 2a 00       	call   0x14061b558
   14037a548:	48 8b 0d b9 bf b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bfb9]        # 0x154f06508
   14037a54f:	ba 38 00 00 00       	mov    edx,0x38
   14037a554:	e8 ff 0f 2a 00       	call   0x14061b558
   14037a559:	4c 89 2d a8 bf b8 14 	mov    QWORD PTR [rip+0x14b8bfa8],r13        # 0x154f06508
   14037a560:	b9 38 00 00 00       	mov    ecx,0x38
   14037a565:	e8 e6 10 2a 00       	call   0x14061b650
   14037a56a:	33 c9                	xor    ecx,ecx
   14037a56c:	48 89 05 95 bf b8 14 	mov    QWORD PTR [rip+0x14b8bf95],rax        # 0x154f06508
   14037a573:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a576:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a57a:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a57e:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a582:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a586:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a58a:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a58e:	b9 22 00 00 00       	mov    ecx,0x22
   14037a593:	e8 c8 0f 2a 00       	call   0x14061b560
   14037a598:	48 8b 0d 69 bf b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bf69]        # 0x154f06508
   14037a59f:	4c 8d 05 d2 52 33 00 	lea    r8,[rip+0x3352d2]        # 0x1406af878
   14037a5a6:	ba 11 00 00 00       	mov    edx,0x11
   14037a5ab:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a5ae:	48 8b c8             	mov    rcx,rax
   14037a5b1:	e8 9a da 1b 00       	call   0x140538050
   14037a5b6:	48 8b 05 4b bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf4b]        # 0x154f06508
   14037a5bd:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a5c1:	48 8b 05 40 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf40]        # 0x154f06508
   14037a5c8:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a5cc:	48 8b 05 35 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf35]        # 0x154f06508
   14037a5d3:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a5d7:	48 8b 05 2a bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf2a]        # 0x154f06508
   14037a5de:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a5e2:	48 8b 05 1f bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf1f]        # 0x154f06508
   14037a5e9:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a5ed:	48 8b 05 14 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf14]        # 0x154f06508
   14037a5f4:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a5f8:	48 8b 05 09 bf b8 14 	mov    rax,QWORD PTR [rip+0x14b8bf09]        # 0x154f06508
   14037a5ff:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a603:	48 8b 05 fe be b8 14 	mov    rax,QWORD PTR [rip+0x14b8befe]        # 0x154f06508
   14037a60a:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a60e:	48 8b 05 f3 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8bef3]        # 0x154f06508
   14037a615:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a619:	48 8b 05 e8 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8bee8]        # 0x154f06508
   14037a620:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a624:	48 8b 05 dd be b8 14 	mov    rax,QWORD PTR [rip+0x14b8bedd]        # 0x154f06508
   14037a62b:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a62f:	48 8b 05 d2 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8bed2]        # 0x154f06508
   14037a636:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a63a:	48 8b 05 c7 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8bec7]        # 0x154f06508
   14037a641:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a648:	48 8b 0d c1 be b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bec1]        # 0x154f06510
   14037a64f:	48 85 c9             	test   rcx,rcx
   14037a652:	74 28                	je     0x14037a67c
   14037a654:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a657:	48 85 c0             	test   rax,rax
   14037a65a:	74 0f                	je     0x14037a66b
   14037a65c:	48 8b c8             	mov    rcx,rax
   14037a65f:	e8 f4 0e 2a 00       	call   0x14061b558
   14037a664:	48 8b 0d a5 be b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bea5]        # 0x154f06510
   14037a66b:	ba 38 00 00 00       	mov    edx,0x38
   14037a670:	e8 e3 0e 2a 00       	call   0x14061b558
   14037a675:	4c 89 2d 94 be b8 14 	mov    QWORD PTR [rip+0x14b8be94],r13        # 0x154f06510
   14037a67c:	b9 38 00 00 00       	mov    ecx,0x38
   14037a681:	e8 ca 0f 2a 00       	call   0x14061b650
   14037a686:	33 c9                	xor    ecx,ecx
   14037a688:	48 89 05 81 be b8 14 	mov    QWORD PTR [rip+0x14b8be81],rax        # 0x154f06510
   14037a68f:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a692:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a696:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a69a:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a69e:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a6a2:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a6a6:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a6aa:	b9 10 00 00 00       	mov    ecx,0x10
   14037a6af:	e8 ac 0e 2a 00       	call   0x14061b560
   14037a6b4:	48 8b 0d 55 be b8 14 	mov    rcx,QWORD PTR [rip+0x14b8be55]        # 0x154f06510
   14037a6bb:	4c 8d 05 de 51 33 00 	lea    r8,[rip+0x3351de]        # 0x1406af8a0
   14037a6c2:	ba 08 00 00 00       	mov    edx,0x8
   14037a6c7:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a6ca:	48 8b c8             	mov    rcx,rax
   14037a6cd:	e8 7e d9 1b 00       	call   0x140538050
   14037a6d2:	48 8b 05 37 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8be37]        # 0x154f06510
   14037a6d9:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a6dd:	48 8b 05 2c be b8 14 	mov    rax,QWORD PTR [rip+0x14b8be2c]        # 0x154f06510
   14037a6e4:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a6e8:	48 8b 05 21 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8be21]        # 0x154f06510
   14037a6ef:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a6f3:	48 8b 05 16 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8be16]        # 0x154f06510
   14037a6fa:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a6fe:	48 8b 05 0b be b8 14 	mov    rax,QWORD PTR [rip+0x14b8be0b]        # 0x154f06510
   14037a705:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a709:	48 8b 05 00 be b8 14 	mov    rax,QWORD PTR [rip+0x14b8be00]        # 0x154f06510
   14037a710:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a714:	48 8b 05 f5 bd b8 14 	mov    rax,QWORD PTR [rip+0x14b8bdf5]        # 0x154f06510
   14037a71b:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a71f:	48 8b 05 ea bd b8 14 	mov    rax,QWORD PTR [rip+0x14b8bdea]        # 0x154f06510
   14037a726:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a72a:	48 8b 05 df bd b8 14 	mov    rax,QWORD PTR [rip+0x14b8bddf]        # 0x154f06510
   14037a731:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a735:	48 8b 05 d4 bd b8 14 	mov    rax,QWORD PTR [rip+0x14b8bdd4]        # 0x154f06510
   14037a73c:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a740:	48 8b 05 c9 bd b8 14 	mov    rax,QWORD PTR [rip+0x14b8bdc9]        # 0x154f06510
   14037a747:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a74b:	48 8b 05 be bd b8 14 	mov    rax,QWORD PTR [rip+0x14b8bdbe]        # 0x154f06510
   14037a752:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a756:	48 8b 05 b3 bd b8 14 	mov    rax,QWORD PTR [rip+0x14b8bdb3]        # 0x154f06510
   14037a75d:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a764:	48 8b 0d 15 bd b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bd15]        # 0x154f06480
   14037a76b:	48 85 c9             	test   rcx,rcx
   14037a76e:	74 28                	je     0x14037a798
   14037a770:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a773:	48 85 c0             	test   rax,rax
   14037a776:	74 0f                	je     0x14037a787
   14037a778:	48 8b c8             	mov    rcx,rax
   14037a77b:	e8 d8 0d 2a 00       	call   0x14061b558
   14037a780:	48 8b 0d f9 bc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bcf9]        # 0x154f06480
   14037a787:	ba 38 00 00 00       	mov    edx,0x38
   14037a78c:	e8 c7 0d 2a 00       	call   0x14061b558
   14037a791:	4c 89 2d e8 bc b8 14 	mov    QWORD PTR [rip+0x14b8bce8],r13        # 0x154f06480
   14037a798:	b9 38 00 00 00       	mov    ecx,0x38
   14037a79d:	e8 ae 0e 2a 00       	call   0x14061b650
   14037a7a2:	33 c9                	xor    ecx,ecx
   14037a7a4:	48 89 05 d5 bc b8 14 	mov    QWORD PTR [rip+0x14b8bcd5],rax        # 0x154f06480
   14037a7ab:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a7ae:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a7b2:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a7b6:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a7ba:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a7be:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a7c2:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a7c6:	b9 14 00 00 00       	mov    ecx,0x14
   14037a7cb:	e8 90 0d 2a 00       	call   0x14061b560
   14037a7d0:	48 8b 0d a9 bc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bca9]        # 0x154f06480
   14037a7d7:	4c 8d 05 d2 50 33 00 	lea    r8,[rip+0x3350d2]        # 0x1406af8b0
   14037a7de:	ba 0a 00 00 00       	mov    edx,0xa
   14037a7e3:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a7e6:	48 8b c8             	mov    rcx,rax
   14037a7e9:	e8 62 d8 1b 00       	call   0x140538050
   14037a7ee:	48 8b 05 8b bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc8b]        # 0x154f06480
   14037a7f5:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a7f9:	48 8b 05 80 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc80]        # 0x154f06480
   14037a800:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a804:	48 8b 05 75 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc75]        # 0x154f06480
   14037a80b:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a80f:	48 8b 05 6a bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc6a]        # 0x154f06480
   14037a816:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a81a:	48 8b 05 5f bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc5f]        # 0x154f06480
   14037a821:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a825:	48 8b 05 54 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc54]        # 0x154f06480
   14037a82c:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a830:	48 8b 05 49 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc49]        # 0x154f06480
   14037a837:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a83b:	48 8b 05 3e bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc3e]        # 0x154f06480
   14037a842:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a846:	48 8b 05 33 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc33]        # 0x154f06480
   14037a84d:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a851:	48 8b 05 28 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc28]        # 0x154f06480
   14037a858:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a85c:	48 8b 05 1d bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc1d]        # 0x154f06480
   14037a863:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a867:	48 8b 05 12 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc12]        # 0x154f06480
   14037a86e:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a872:	48 8b 05 07 bc b8 14 	mov    rax,QWORD PTR [rip+0x14b8bc07]        # 0x154f06480
   14037a879:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a880:	48 8b 0d 09 bc b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bc09]        # 0x154f06490
   14037a887:	48 85 c9             	test   rcx,rcx
   14037a88a:	74 28                	je     0x14037a8b4
   14037a88c:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a88f:	48 85 c0             	test   rax,rax
   14037a892:	74 0f                	je     0x14037a8a3
   14037a894:	48 8b c8             	mov    rcx,rax
   14037a897:	e8 bc 0c 2a 00       	call   0x14061b558
   14037a89c:	48 8b 0d ed bb b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bbed]        # 0x154f06490
   14037a8a3:	ba 38 00 00 00       	mov    edx,0x38
   14037a8a8:	e8 ab 0c 2a 00       	call   0x14061b558
   14037a8ad:	4c 89 2d dc bb b8 14 	mov    QWORD PTR [rip+0x14b8bbdc],r13        # 0x154f06490
   14037a8b4:	b9 38 00 00 00       	mov    ecx,0x38
   14037a8b9:	e8 92 0d 2a 00       	call   0x14061b650
   14037a8be:	33 c9                	xor    ecx,ecx
   14037a8c0:	48 89 05 c9 bb b8 14 	mov    QWORD PTR [rip+0x14b8bbc9],rax        # 0x154f06490
   14037a8c7:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a8ca:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a8ce:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a8d2:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a8d6:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a8da:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a8de:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a8e2:	b9 0c 00 00 00       	mov    ecx,0xc
   14037a8e7:	e8 74 0c 2a 00       	call   0x14061b560
   14037a8ec:	48 8b 0d 9d bb b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bb9d]        # 0x154f06490
   14037a8f3:	4c 8d 05 ce 4f 33 00 	lea    r8,[rip+0x334fce]        # 0x1406af8c8
   14037a8fa:	ba 06 00 00 00       	mov    edx,0x6
   14037a8ff:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037a902:	48 8b c8             	mov    rcx,rax
   14037a905:	e8 46 d7 1b 00       	call   0x140538050
   14037a90a:	48 8b 05 7f bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb7f]        # 0x154f06490
   14037a911:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037a915:	48 8b 05 74 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb74]        # 0x154f06490
   14037a91c:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037a920:	48 8b 05 69 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb69]        # 0x154f06490
   14037a927:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037a92b:	48 8b 05 5e bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb5e]        # 0x154f06490
   14037a932:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037a936:	48 8b 05 53 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb53]        # 0x154f06490
   14037a93d:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037a941:	48 8b 05 48 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb48]        # 0x154f06490
   14037a948:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037a94c:	48 8b 05 3d bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb3d]        # 0x154f06490
   14037a953:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037a957:	48 8b 05 32 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb32]        # 0x154f06490
   14037a95e:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037a962:	48 8b 05 27 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb27]        # 0x154f06490
   14037a969:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037a96d:	48 8b 05 1c bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb1c]        # 0x154f06490
   14037a974:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037a978:	48 8b 05 11 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb11]        # 0x154f06490
   14037a97f:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037a983:	48 8b 05 06 bb b8 14 	mov    rax,QWORD PTR [rip+0x14b8bb06]        # 0x154f06490
   14037a98a:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037a98e:	48 8b 05 fb ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8bafb]        # 0x154f06490
   14037a995:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037a99c:	48 8b 0d f5 ba b8 14 	mov    rcx,QWORD PTR [rip+0x14b8baf5]        # 0x154f06498
   14037a9a3:	48 85 c9             	test   rcx,rcx
   14037a9a6:	74 28                	je     0x14037a9d0
   14037a9a8:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037a9ab:	48 85 c0             	test   rax,rax
   14037a9ae:	74 0f                	je     0x14037a9bf
   14037a9b0:	48 8b c8             	mov    rcx,rax
   14037a9b3:	e8 a0 0b 2a 00       	call   0x14061b558
   14037a9b8:	48 8b 0d d9 ba b8 14 	mov    rcx,QWORD PTR [rip+0x14b8bad9]        # 0x154f06498
   14037a9bf:	ba 38 00 00 00       	mov    edx,0x38
   14037a9c4:	e8 8f 0b 2a 00       	call   0x14061b558
   14037a9c9:	4c 89 2d c8 ba b8 14 	mov    QWORD PTR [rip+0x14b8bac8],r13        # 0x154f06498
   14037a9d0:	b9 38 00 00 00       	mov    ecx,0x38
   14037a9d5:	e8 76 0c 2a 00       	call   0x14061b650
   14037a9da:	33 c9                	xor    ecx,ecx
   14037a9dc:	48 89 05 b5 ba b8 14 	mov    QWORD PTR [rip+0x14b8bab5],rax        # 0x154f06498
   14037a9e3:	48 89 08             	mov    QWORD PTR [rax],rcx
   14037a9e6:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14037a9ea:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   14037a9ee:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   14037a9f2:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   14037a9f6:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   14037a9fa:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   14037a9fe:	b9 08 00 00 00       	mov    ecx,0x8
   14037aa03:	e8 58 0b 2a 00       	call   0x14061b560
   14037aa08:	48 8b 0d 89 ba b8 14 	mov    rcx,QWORD PTR [rip+0x14b8ba89]        # 0x154f06498
   14037aa0f:	4c 8d 05 c2 4e 33 00 	lea    r8,[rip+0x334ec2]        # 0x1406af8d8
   14037aa16:	ba 04 00 00 00       	mov    edx,0x4
   14037aa1b:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037aa1e:	48 8b c8             	mov    rcx,rax
   14037aa21:	e8 2a d6 1b 00       	call   0x140538050
   14037aa26:	48 8b 05 6b ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba6b]        # 0x154f06498
   14037aa2d:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037aa31:	48 8b 05 60 ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba60]        # 0x154f06498
   14037aa38:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037aa3c:	48 8b 05 55 ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba55]        # 0x154f06498
   14037aa43:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037aa47:	48 8b 05 4a ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba4a]        # 0x154f06498
   14037aa4e:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037aa52:	48 8b 05 3f ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba3f]        # 0x154f06498
   14037aa59:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037aa5d:	48 8b 05 34 ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba34]        # 0x154f06498
   14037aa64:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037aa68:	48 8b 05 29 ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba29]        # 0x154f06498
   14037aa6f:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037aa73:	48 8b 05 1e ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba1e]        # 0x154f06498
   14037aa7a:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037aa7e:	48 8b 05 13 ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba13]        # 0x154f06498
   14037aa85:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037aa89:	48 8b 05 08 ba b8 14 	mov    rax,QWORD PTR [rip+0x14b8ba08]        # 0x154f06498
   14037aa90:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037aa94:	48 8b 05 fd b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b9fd]        # 0x154f06498
   14037aa9b:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037aa9f:	48 8b 05 f2 b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b9f2]        # 0x154f06498
   14037aaa6:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037aaaa:	48 8b 05 e7 b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b9e7]        # 0x154f06498
   14037aab1:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037aab8:	48 8b 0d 01 ba b8 14 	mov    rcx,QWORD PTR [rip+0x14b8ba01]        # 0x154f064c0
   14037aabf:	48 85 c9             	test   rcx,rcx
   14037aac2:	74 28                	je     0x14037aaec
   14037aac4:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14037aac7:	48 85 c0             	test   rax,rax
   14037aaca:	74 0f                	je     0x14037aadb
   14037aacc:	48 8b c8             	mov    rcx,rax
   14037aacf:	e8 84 0a 2a 00       	call   0x14061b558
   14037aad4:	48 8b 0d e5 b9 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8b9e5]        # 0x154f064c0
   14037aadb:	ba 38 00 00 00       	mov    edx,0x38
   14037aae0:	e8 73 0a 2a 00       	call   0x14061b558
   14037aae5:	4c 89 2d d4 b9 b8 14 	mov    QWORD PTR [rip+0x14b8b9d4],r13        # 0x154f064c0
   14037aaec:	b9 38 00 00 00       	mov    ecx,0x38
   14037aaf1:	e8 5a 0b 2a 00       	call   0x14061b650
   14037aaf6:	33 d2                	xor    edx,edx
   14037aaf8:	48 89 05 c1 b9 b8 14 	mov    QWORD PTR [rip+0x14b8b9c1],rax        # 0x154f064c0
   14037aaff:	48 89 10             	mov    QWORD PTR [rax],rdx
   14037ab02:	48 89 50 08          	mov    QWORD PTR [rax+0x8],rdx
   14037ab06:	8d 4a 0e             	lea    ecx,[rdx+0xe]
   14037ab09:	48 89 50 10          	mov    QWORD PTR [rax+0x10],rdx
   14037ab0d:	48 89 50 18          	mov    QWORD PTR [rax+0x18],rdx
   14037ab11:	48 89 50 20          	mov    QWORD PTR [rax+0x20],rdx
   14037ab15:	48 89 50 28          	mov    QWORD PTR [rax+0x28],rdx
   14037ab19:	48 89 50 30          	mov    QWORD PTR [rax+0x30],rdx
   14037ab1d:	e8 3e 0a 2a 00       	call   0x14061b560
   14037ab22:	48 8b 0d 97 b9 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8b997]        # 0x154f064c0
   14037ab29:	4c 8d 05 b0 4d 33 00 	lea    r8,[rip+0x334db0]        # 0x1406af8e0
   14037ab30:	ba 07 00 00 00       	mov    edx,0x7
   14037ab35:	48 89 01             	mov    QWORD PTR [rcx],rax
   14037ab38:	48 8b c8             	mov    rcx,rax
   14037ab3b:	e8 10 d5 1b 00       	call   0x140538050
   14037ab40:	48 8b 05 79 b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b979]        # 0x154f064c0
   14037ab47:	48 8d 15 a2 4d 33 00 	lea    rdx,[rip+0x334da2]        # 0x1406af8f0
   14037ab4e:	c7 44 24 58 10 00 00 	mov    DWORD PTR [rsp+0x58],0x10
   14037ab55:	00 
   14037ab56:	45 0f 57 f6          	xorps  xmm14,xmm14
   14037ab5a:	f3 44 0f 11 74 24 50 	movss  DWORD PTR [rsp+0x50],xmm14
   14037ab61:	b9 2b 00 00 00       	mov    ecx,0x2b
   14037ab66:	f3 44 0f 11 74 24 48 	movss  DWORD PTR [rsp+0x48],xmm14
   14037ab6d:	45 33 c9             	xor    r9d,r9d
   14037ab70:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037ab74:	45 33 c0             	xor    r8d,r8d
   14037ab77:	48 8b 05 42 b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b942]        # 0x154f064c0
   14037ab7e:	f3 44 0f 11 74 24 40 	movss  DWORD PTR [rsp+0x40],xmm14
   14037ab85:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037ab8c:	f3 44 0f 11 74 24 30 	movss  DWORD PTR [rsp+0x30],xmm14
   14037ab93:	44 88 68 09          	mov    BYTE PTR [rax+0x9],r13b
   14037ab97:	48 8b 05 22 b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b922]        # 0x154f064c0
   14037ab9e:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037aba5:	44 88 6c 24 20       	mov    BYTE PTR [rsp+0x20],r13b
   14037abaa:	44 88 68 0a          	mov    BYTE PTR [rax+0xa],r13b
   14037abae:	48 8b 05 0b b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b90b]        # 0x154f064c0
   14037abb5:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037abb9:	48 8b 05 00 b9 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b900]        # 0x154f064c0
   14037abc0:	44 89 68 0c          	mov    DWORD PTR [rax+0xc],r13d
   14037abc4:	48 8b 05 f5 b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8f5]        # 0x154f064c0
   14037abcb:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   14037abcf:	48 8b 05 ea b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8ea]        # 0x154f064c0
   14037abd6:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037abda:	48 8b 05 df b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8df]        # 0x154f064c0
   14037abe1:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037abe5:	48 8b 05 d4 b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8d4]        # 0x154f064c0
   14037abec:	44 89 68 1c          	mov    DWORD PTR [rax+0x1c],r13d
   14037abf0:	48 8b 05 c9 b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8c9]        # 0x154f064c0
   14037abf7:	44 89 68 20          	mov    DWORD PTR [rax+0x20],r13d
   14037abfb:	48 8b 05 be b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8be]        # 0x154f064c0
   14037ac02:	44 89 68 30          	mov    DWORD PTR [rax+0x30],r13d
   14037ac06:	48 8b 05 b3 b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8b3]        # 0x154f064c0
   14037ac0d:	44 89 68 24          	mov    DWORD PTR [rax+0x24],r13d
   14037ac11:	48 8b 05 a8 b8 b8 14 	mov    rax,QWORD PTR [rip+0x14b8b8a8]        # 0x154f064c0
   14037ac18:	c7 40 28 10 00 00 00 	mov    DWORD PTR [rax+0x28],0x10
   14037ac1f:	e8 0c cc 00 00       	call   0x140387830
   14037ac24:	c7 44 24 58 10 00 00 	mov    DWORD PTR [rsp+0x58],0x10
   14037ac2b:	00 
   14037ac2c:	48 8d 15 cd 4c 33 00 	lea    rdx,[rip+0x334ccd]        # 0x1406af900
   14037ac33:	f3 44 0f 11 74 24 50 	movss  DWORD PTR [rsp+0x50],xmm14
   14037ac3a:	b9 31 00 00 00       	mov    ecx,0x31
   14037ac3f:	f3 44 0f 11 74 24 48 	movss  DWORD PTR [rsp+0x48],xmm14
   14037ac46:	45 33 c9             	xor    r9d,r9d
   14037ac49:	f3 44 0f 11 74 24 40 	movss  DWORD PTR [rsp+0x40],xmm14
   14037ac50:	45 33 c0             	xor    r8d,r8d
   14037ac53:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037ac5a:	f3 44 0f 11 74 24 30 	movss  DWORD PTR [rsp+0x30],xmm14
   14037ac61:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037ac68:	44 88 6c 24 20       	mov    BYTE PTR [rsp+0x20],r13b
   14037ac6d:	e8 be cb 00 00       	call   0x140387830
   14037ac72:	44 89 6c 24 58       	mov    DWORD PTR [rsp+0x58],r13d
   14037ac77:	b9 26 00 00 00       	mov    ecx,0x26
   14037ac7c:	f3 44 0f 11 74 24 50 	movss  DWORD PTR [rsp+0x50],xmm14
   14037ac83:	f3 44 0f 11 74 24 48 	movss  DWORD PTR [rsp+0x48],xmm14
   14037ac8a:	f3 44 0f 11 74 24 40 	movss  DWORD PTR [rsp+0x40],xmm14
   14037ac91:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037ac98:	f3 44 0f 11 74 24 30 	movss  DWORD PTR [rsp+0x30],xmm14
   14037ac9f:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037aca6:	44 88 6c 24 20       	mov    BYTE PTR [rsp+0x20],r13b
   14037acab:	45 33 c9             	xor    r9d,r9d
   14037acae:	48 8d 15 5b 4c 33 00 	lea    rdx,[rip+0x334c5b]        # 0x1406af910
   14037acb5:	45 33 c0             	xor    r8d,r8d
   14037acb8:	e8 73 cb 00 00       	call   0x140387830
   14037acbd:	c7 44 24 58 10 00 00 	mov    DWORD PTR [rsp+0x58],0x10
   14037acc4:	00 
   14037acc5:	48 8d 15 4c 4c 33 00 	lea    rdx,[rip+0x334c4c]        # 0x1406af918
   14037accc:	f3 44 0f 11 74 24 50 	movss  DWORD PTR [rsp+0x50],xmm14
   14037acd3:	b9 2c 00 00 00       	mov    ecx,0x2c
   14037acd8:	f3 44 0f 11 74 24 48 	movss  DWORD PTR [rsp+0x48],xmm14
   14037acdf:	45 33 c9             	xor    r9d,r9d
   14037ace2:	f3 44 0f 11 74 24 40 	movss  DWORD PTR [rsp+0x40],xmm14
   14037ace9:	45 33 c0             	xor    r8d,r8d
   14037acec:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037acf3:	f3 44 0f 11 74 24 30 	movss  DWORD PTR [rsp+0x30],xmm14
   14037acfa:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037ad01:	44 88 6c 24 20       	mov    BYTE PTR [rsp+0x20],r13b
   14037ad06:	e8 25 cb 00 00       	call   0x140387830
   14037ad0b:	f3 0f 10 05 81 51 33 	movss  xmm0,DWORD PTR [rip+0x335181]        # 0x1406afe94
   14037ad12:	00 
   14037ad13:	48 8d 15 0e 4c 33 00 	lea    rdx,[rip+0x334c0e]        # 0x1406af928
   14037ad1a:	f3 44 0f 10 15 7d 54 	movss  xmm10,DWORD PTR [rip+0x4d547d]        # 0x1408501a0
   14037ad21:	4d 00 
   14037ad23:	b9 15 00 00 00       	mov    ecx,0x15
   14037ad28:	f3 0f 10 3d 20 c4 31 	movss  xmm7,DWORD PTR [rip+0x31c420]        # 0x140697150
   14037ad2f:	00 
   14037ad30:	41 b1 67             	mov    r9b,0x67
   14037ad33:	f3 44 0f 10 2d d4 c3 	movss  xmm13,DWORD PTR [rip+0x31c3d4]        # 0x140697110
   14037ad3a:	31 00 
   14037ad3c:	41 b0 3c             	mov    r8b,0x3c
   14037ad3f:	f3 44 0f 10 25 e8 52 	movss  xmm12,DWORD PTR [rip+0x4d52e8]        # 0x140850030
   14037ad46:	4d 00 
   14037ad48:	c7 44 24 58 01 00 00 	mov    DWORD PTR [rsp+0x58],0x1
   14037ad4f:	00 
   14037ad50:	f3 0f 11 44 24 50    	movss  DWORD PTR [rsp+0x50],xmm0
   14037ad56:	f3 44 0f 11 54 24 48 	movss  DWORD PTR [rsp+0x48],xmm10
   14037ad5d:	f3 0f 11 7c 24 40    	movss  DWORD PTR [rsp+0x40],xmm7
   14037ad63:	f3 44 0f 11 6c 24 38 	movss  DWORD PTR [rsp+0x38],xmm13
   14037ad6a:	f3 44 0f 11 64 24 30 	movss  DWORD PTR [rsp+0x30],xmm12
   14037ad71:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037ad78:	c6 44 24 20 67       	mov    BYTE PTR [rsp+0x20],0x67
   14037ad7d:	e8 ae ca 00 00       	call   0x140387830
   14037ad82:	f3 44 0f 10 0d 91 c3 	movss  xmm9,DWORD PTR [rip+0x31c391]        # 0x14069711c
   14037ad89:	31 00 
   14037ad8b:	48 8d 15 a6 4b 33 00 	lea    rdx,[rip+0x334ba6]        # 0x1406af938
   14037ad92:	f3 44 0f 10 1d 11 52 	movss  xmm11,DWORD PTR [rip+0x4d5211]        # 0x14084ffac
   14037ad99:	4d 00 
   14037ad9b:	b9 16 00 00 00       	mov    ecx,0x16
   14037ada0:	f3 0f 10 35 24 51 33 	movss  xmm6,DWORD PTR [rip+0x335124]        # 0x1406afecc
   14037ada7:	00 
   14037ada8:	41 b1 60             	mov    r9b,0x60
   14037adab:	c7 44 24 58 41 00 00 	mov    DWORD PTR [rsp+0x58],0x41
   14037adb2:	00 
   14037adb3:	41 b0 32             	mov    r8b,0x32
   14037adb6:	f3 44 0f 11 4c 24 50 	movss  DWORD PTR [rsp+0x50],xmm9
   14037adbd:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037adc4:	f3 44 0f 11 5c 24 40 	movss  DWORD PTR [rsp+0x40],xmm11
   14037adcb:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037add2:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037add8:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037addf:	c6 44 24 20 60       	mov    BYTE PTR [rsp+0x20],0x60
   14037ade4:	e8 47 ca 00 00       	call   0x140387830
   14037ade9:	c7 44 24 58 41 00 00 	mov    DWORD PTR [rsp+0x58],0x41
   14037adf0:	00 
   14037adf1:	48 8d 15 50 4b 33 00 	lea    rdx,[rip+0x334b50]        # 0x1406af948
   14037adf8:	f3 44 0f 11 4c 24 50 	movss  DWORD PTR [rsp+0x50],xmm9
   14037adff:	b9 17 00 00 00       	mov    ecx,0x17
   14037ae04:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037ae0b:	41 b1 60             	mov    r9b,0x60
   14037ae0e:	f3 44 0f 11 5c 24 40 	movss  DWORD PTR [rsp+0x40],xmm11
   14037ae15:	41 b0 32             	mov    r8b,0x32
   14037ae18:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037ae1f:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037ae25:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037ae2c:	c6 44 24 20 60       	mov    BYTE PTR [rsp+0x20],0x60
   14037ae31:	e8 fa c9 00 00       	call   0x140387830
   14037ae36:	f3 0f 10 35 92 51 4d 	movss  xmm6,DWORD PTR [rip+0x4d5192]        # 0x14084ffd0
   14037ae3d:	00 
   14037ae3e:	48 8d 15 13 4b 33 00 	lea    rdx,[rip+0x334b13]        # 0x1406af958
   14037ae45:	c7 44 24 58 01 00 00 	mov    DWORD PTR [rsp+0x58],0x1
   14037ae4c:	00 
   14037ae4d:	b9 18 00 00 00       	mov    ecx,0x18
   14037ae52:	f3 0f 11 74 24 50    	movss  DWORD PTR [rsp+0x50],xmm6
   14037ae58:	41 b1 54             	mov    r9b,0x54
   14037ae5b:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037ae62:	41 b0 36             	mov    r8b,0x36
   14037ae65:	f3 0f 11 7c 24 40    	movss  DWORD PTR [rsp+0x40],xmm7
   14037ae6b:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037ae72:	f3 44 0f 11 54 24 30 	movss  DWORD PTR [rsp+0x30],xmm10
   14037ae79:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037ae80:	c6 44 24 20 54       	mov    BYTE PTR [rsp+0x20],0x54
   14037ae85:	e8 a6 c9 00 00       	call   0x140387830
   14037ae8a:	c7 44 24 58 01 00 00 	mov    DWORD PTR [rsp+0x58],0x1
   14037ae91:	00 
   14037ae92:	b9 19 00 00 00       	mov    ecx,0x19
   14037ae97:	f3 0f 11 74 24 50    	movss  DWORD PTR [rsp+0x50],xmm6
   14037ae9d:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037aea4:	48 8d 15 c5 4a 33 00 	lea    rdx,[rip+0x334ac5]        # 0x1406af970
   14037aeab:	f3 0f 11 7c 24 40    	movss  DWORD PTR [rsp+0x40],xmm7
   14037aeb1:	41 b1 54             	mov    r9b,0x54
   14037aeb4:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037aebb:	41 b0 36             	mov    r8b,0x36
   14037aebe:	f3 44 0f 11 54 24 30 	movss  DWORD PTR [rsp+0x30],xmm10
   14037aec5:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037aecc:	c6 44 24 20 54       	mov    BYTE PTR [rsp+0x20],0x54
   14037aed1:	e8 5a c9 00 00       	call   0x140387830
   14037aed6:	c7 44 24 58 01 00 00 	mov    DWORD PTR [rsp+0x58],0x1
   14037aedd:	00 
   14037aede:	48 8d 15 a3 4a 33 00 	lea    rdx,[rip+0x334aa3]        # 0x1406af988
   14037aee5:	f3 0f 11 74 24 50    	movss  DWORD PTR [rsp+0x50],xmm6
   14037aeeb:	b9 1a 00 00 00       	mov    ecx,0x1a
   14037aef0:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037aef7:	41 b1 54             	mov    r9b,0x54
   14037aefa:	f3 0f 11 7c 24 40    	movss  DWORD PTR [rsp+0x40],xmm7
   14037af00:	41 b0 36             	mov    r8b,0x36
   14037af03:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037af0a:	f3 44 0f 11 54 24 30 	movss  DWORD PTR [rsp+0x30],xmm10
   14037af11:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037af18:	c6 44 24 20 54       	mov    BYTE PTR [rsp+0x20],0x54
   14037af1d:	e8 0e c9 00 00       	call   0x140387830
   14037af22:	f3 44 0f 10 05 3d 53 	movss  xmm8,DWORD PTR [rip+0x4d533d]        # 0x140850268
   14037af29:	4d 00 
   14037af2b:	48 8d 15 66 4a 33 00 	lea    rdx,[rip+0x334a66]        # 0x1406af998
   14037af32:	f3 0f 10 3d 32 c2 31 	movss  xmm7,DWORD PTR [rip+0x31c232]        # 0x14069716c
   14037af39:	00 
   14037af3a:	b9 1b 00 00 00       	mov    ecx,0x1b
   14037af3f:	f3 0f 10 35 55 c2 31 	movss  xmm6,DWORD PTR [rip+0x31c255]        # 0x14069719c
   14037af46:	00 
   14037af47:	41 b1 6c             	mov    r9b,0x6c
   14037af4a:	c7 44 24 58 c5 00 00 	mov    DWORD PTR [rsp+0x58],0xc5
   14037af51:	00 
   14037af52:	41 b0 37             	mov    r8b,0x37
   14037af55:	f3 44 0f 11 4c 24 50 	movss  DWORD PTR [rsp+0x50],xmm9
   14037af5c:	f3 44 0f 11 54 24 48 	movss  DWORD PTR [rsp+0x48],xmm10
   14037af63:	f3 44 0f 11 44 24 40 	movss  DWORD PTR [rsp+0x40],xmm8
   14037af6a:	f3 0f 11 7c 24 38    	movss  DWORD PTR [rsp+0x38],xmm7
   14037af70:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037af76:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037af7d:	c6 44 24 20 6c       	mov    BYTE PTR [rsp+0x20],0x6c
   14037af82:	e8 a9 c8 00 00       	call   0x140387830
   14037af87:	c7 44 24 58 c5 00 00 	mov    DWORD PTR [rsp+0x58],0xc5
   14037af8e:	00 
   14037af8f:	48 8d 15 1a 4a 33 00 	lea    rdx,[rip+0x334a1a]        # 0x1406af9b0
   14037af96:	f3 44 0f 11 4c 24 50 	movss  DWORD PTR [rsp+0x50],xmm9
   14037af9d:	b9 1c 00 00 00       	mov    ecx,0x1c
   14037afa2:	f3 44 0f 11 54 24 48 	movss  DWORD PTR [rsp+0x48],xmm10
   14037afa9:	41 b1 6c             	mov    r9b,0x6c
   14037afac:	f3 44 0f 11 44 24 40 	movss  DWORD PTR [rsp+0x40],xmm8
   14037afb3:	41 b0 37             	mov    r8b,0x37
   14037afb6:	f3 0f 11 7c 24 38    	movss  DWORD PTR [rsp+0x38],xmm7
   14037afbc:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037afc2:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037afc9:	c6 44 24 20 6c       	mov    BYTE PTR [rsp+0x20],0x6c
   14037afce:	e8 5d c8 00 00       	call   0x140387830
   14037afd3:	c7 44 24 58 c5 00 00 	mov    DWORD PTR [rsp+0x58],0xc5
   14037afda:	00 
   14037afdb:	48 8d 15 e6 49 33 00 	lea    rdx,[rip+0x3349e6]        # 0x1406af9c8
   14037afe2:	f3 44 0f 11 4c 24 50 	movss  DWORD PTR [rsp+0x50],xmm9
   14037afe9:	b9 1d 00 00 00       	mov    ecx,0x1d
   14037afee:	f3 44 0f 11 54 24 48 	movss  DWORD PTR [rsp+0x48],xmm10
   14037aff5:	41 b1 6c             	mov    r9b,0x6c
   14037aff8:	f3 44 0f 11 44 24 40 	movss  DWORD PTR [rsp+0x40],xmm8
   14037afff:	41 b0 37             	mov    r8b,0x37
   14037b002:	f3 0f 11 7c 24 38    	movss  DWORD PTR [rsp+0x38],xmm7
   14037b008:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037b00e:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037b015:	c6 44 24 20 6c       	mov    BYTE PTR [rsp+0x20],0x6c
   14037b01a:	e8 11 c8 00 00       	call   0x140387830
   14037b01f:	c7 44 24 58 c5 00 00 	mov    DWORD PTR [rsp+0x58],0xc5
   14037b026:	00 
   14037b027:	48 8d 15 aa 49 33 00 	lea    rdx,[rip+0x3349aa]        # 0x1406af9d8
   14037b02e:	f3 44 0f 11 4c 24 50 	movss  DWORD PTR [rsp+0x50],xmm9
   14037b035:	b9 2d 00 00 00       	mov    ecx,0x2d
   14037b03a:	f3 44 0f 11 54 24 48 	movss  DWORD PTR [rsp+0x48],xmm10
   14037b041:	41 b1 6c             	mov    r9b,0x6c
   14037b044:	f3 44 0f 11 44 24 40 	movss  DWORD PTR [rsp+0x40],xmm8
   14037b04b:	41 b0 37             	mov    r8b,0x37
   14037b04e:	f3 0f 11 7c 24 38    	movss  DWORD PTR [rsp+0x38],xmm7
   14037b054:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037b05a:	f3 44 0f 11 74 24 28 	movss  DWORD PTR [rsp+0x28],xmm14
   14037b061:	c6 44 24 20 6c       	mov    BYTE PTR [rsp+0x20],0x6c
   14037b066:	e8 c5 c7 00 00       	call   0x140387830
   14037b06b:	f3 0f 10 3d 4d 4f 4d 	movss  xmm7,DWORD PTR [rip+0x4d4f4d]        # 0x14084ffc0
   14037b072:	00 
   14037b073:	b9 2e 00 00 00       	mov    ecx,0x2e
   14037b078:	c7 44 24 58 80 00 00 	mov    DWORD PTR [rsp+0x58],0x80
   14037b07f:	00 
   14037b080:	f3 0f 10 35 fc 51 4d 	movss  xmm6,DWORD PTR [rip+0x4d51fc]        # 0x140850284
   14037b087:	00 
   14037b088:	48 8d 15 59 49 33 00 	lea    rdx,[rip+0x334959]        # 0x1406af9e8
   14037b08f:	f3 0f 11 7c 24 50    	movss  DWORD PTR [rsp+0x50],xmm7
   14037b095:	41 b1 6c             	mov    r9b,0x6c
   14037b098:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037b09f:	41 b0 15             	mov    r8b,0x15
   14037b0a2:	f3 44 0f 11 5c 24 40 	movss  DWORD PTR [rsp+0x40],xmm11
   14037b0a9:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037b0b0:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037b0b6:	f3 44 0f 11 6c 24 28 	movss  DWORD PTR [rsp+0x28],xmm13
   14037b0bd:	c6 44 24 20 6c       	mov    BYTE PTR [rsp+0x20],0x6c
   14037b0c2:	e8 69 c7 00 00       	call   0x140387830
   14037b0c7:	c7 44 24 58 80 00 00 	mov    DWORD PTR [rsp+0x58],0x80
   14037b0ce:	00 
   14037b0cf:	48 8d 15 22 49 33 00 	lea    rdx,[rip+0x334922]        # 0x1406af9f8
   14037b0d6:	f3 0f 11 7c 24 50    	movss  DWORD PTR [rsp+0x50],xmm7
   14037b0dc:	b9 2f 00 00 00       	mov    ecx,0x2f
   14037b0e1:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037b0e8:	41 b1 58             	mov    r9b,0x58
   14037b0eb:	f3 44 0f 11 5c 24 40 	movss  DWORD PTR [rsp+0x40],xmm11
   14037b0f2:	41 b0 38             	mov    r8b,0x38
   14037b0f5:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037b0fc:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037b102:	f3 44 0f 11 6c 24 28 	movss  DWORD PTR [rsp+0x28],xmm13
   14037b109:	c6 44 24 20 58       	mov    BYTE PTR [rsp+0x20],0x58
   14037b10e:	e8 1d c7 00 00       	call   0x140387830
   14037b113:	c7 44 24 58 80 00 00 	mov    DWORD PTR [rsp+0x58],0x80
   14037b11a:	00 
   14037b11b:	48 8d 15 ee 48 33 00 	lea    rdx,[rip+0x3348ee]        # 0x1406afa10
   14037b122:	f3 0f 11 7c 24 50    	movss  DWORD PTR [rsp+0x50],xmm7
   14037b128:	b9 30 00 00 00       	mov    ecx,0x30
   14037b12d:	f3 44 0f 11 64 24 48 	movss  DWORD PTR [rsp+0x48],xmm12
   14037b134:	41 b1 66             	mov    r9b,0x66
   14037b137:	f3 44 0f 11 5c 24 40 	movss  DWORD PTR [rsp+0x40],xmm11
   14037b13e:	41 b0 46             	mov    r8b,0x46
   14037b141:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14037b148:	f3 0f 11 74 24 30    	movss  DWORD PTR [rsp+0x30],xmm6
   14037b14e:	f3 44 0f 11 6c 24 28 	movss  DWORD PTR [rsp+0x28],xmm13
   14037b155:	c6 44 24 20 66       	mov    BYTE PTR [rsp+0x20],0x66
   14037b15a:	e8 d1 c6 00 00       	call   0x140387830
   14037b15f:	44 0f 28 b4 24 80 06 	movaps xmm14,XMMWORD PTR [rsp+0x680]
   14037b166:	00 00 
   14037b168:	48 8d 4c 24 60       	lea    rcx,[rsp+0x60]
   14037b16d:	44 0f 28 ac 24 90 06 	movaps xmm13,XMMWORD PTR [rsp+0x690]
   14037b174:	00 00 
   14037b176:	44 0f 28 a4 24 a0 06 	movaps xmm12,XMMWORD PTR [rsp+0x6a0]
   14037b17d:	00 00 
   14037b17f:	44 0f 28 9c 24 b0 06 	movaps xmm11,XMMWORD PTR [rsp+0x6b0]
   14037b186:	00 00 
   14037b188:	44 0f 28 94 24 c0 06 	movaps xmm10,XMMWORD PTR [rsp+0x6c0]
   14037b18f:	00 00 
   14037b191:	44 0f 28 8c 24 d0 06 	movaps xmm9,XMMWORD PTR [rsp+0x6d0]
   14037b198:	00 00 
   14037b19a:	44 0f 28 84 24 e0 06 	movaps xmm8,XMMWORD PTR [rsp+0x6e0]
   14037b1a1:	00 00 
   14037b1a3:	0f 28 bc 24 f0 06 00 	movaps xmm7,XMMWORD PTR [rsp+0x6f0]
   14037b1aa:	00 
   14037b1ab:	0f 28 b4 24 00 07 00 	movaps xmm6,XMMWORD PTR [rsp+0x700]
   14037b1b2:	00 
   14037b1b3:	44 89 2d ba f5 b8 14 	mov    DWORD PTR [rip+0x14b8f5ba],r13d        # 0x154f0a774
   14037b1ba:	48 85 db             	test   rbx,rbx
   14037b1bd:	74 16                	je     0x14037b1d5
   14037b1bf:	4c 8b cb             	mov    r9,rbx
   14037b1c2:	4c 8d 05 67 48 33 00 	lea    r8,[rip+0x334867]        # 0x1406afa30
   14037b1c9:	ba 04 01 00 00       	mov    edx,0x104
   14037b1ce:	e8 7d ce 1b 00       	call   0x140538050
   14037b1d3:	eb 0c                	jmp    0x14037b1e1
   14037b1d5:	48 8d 15 44 e8 5b 00 	lea    rdx,[rip+0x5be844]        # 0x140939a20
   14037b1dc:	e8 6f 6f 1b 00       	call   0x140532150
   14037b1e1:	45 33 c0             	xor    r8d,r8d
   14037b1e4:	48 8d 4c 24 60       	lea    rcx,[rsp+0x60]
   14037b1e9:	41 b9 00 00 00 02    	mov    r9d,0x2000000
   14037b1ef:	41 8d 50 40          	lea    edx,[r8+0x40]
   14037b1f3:	e8 78 66 1b 00       	call   0x140531870
   14037b1f8:	48 8b d8             	mov    rbx,rax
   14037b1fb:	48 85 c0             	test   rax,rax
   14037b1fe:	0f 84 f3 03 00 00    	je     0x14037b5f7
   14037b204:	48 8b c8             	mov    rcx,rax
   14037b207:	4c 89 b4 24 18 07 00 	mov    QWORD PTR [rsp+0x718],r14
   14037b20e:	00 
   14037b20f:	e8 8c 6b 1b 00       	call   0x140531da0
   14037b214:	3b 05 32 e8 5b 00    	cmp    eax,DWORD PTR [rip+0x5be832]        # 0x140939a4c
   14037b21a:	44 8b f0             	mov    r14d,eax
   14037b21d:	0f 87 c4 03 00 00    	ja     0x14037b5e7
   14037b223:	48 89 ac 24 48 07 00 	mov    QWORD PTR [rsp+0x748],rbp
   14037b22a:	00 
   14037b22b:	83 f8 07             	cmp    eax,0x7
   14037b22e:	48 89 b4 24 50 07 00 	mov    QWORD PTR [rsp+0x750],rsi
   14037b235:	00 
   14037b236:	be 00 02 00 00       	mov    esi,0x200
   14037b23b:	48 89 bc 24 58 07 00 	mov    QWORD PTR [rsp+0x758],rdi
   14037b242:	00 
   14037b243:	bf 80 00 00 00       	mov    edi,0x80
   14037b248:	4c 89 a4 24 20 07 00 	mov    QWORD PTR [rsp+0x720],r12
   14037b24f:	00 
   14037b250:	0f 46 fe             	cmovbe edi,esi
   14037b253:	4c 89 bc 24 10 07 00 	mov    QWORD PTR [rsp+0x710],r15
   14037b25a:	00 
   14037b25b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14037b260:	48 8b cb             	mov    rcx,rbx
   14037b263:	e8 98 9b f6 ff       	call   0x1402e4e00
   14037b268:	85 c0                	test   eax,eax
   14037b26a:	74 7f                	je     0x14037b2eb
   14037b26c:	44 8b c6             	mov    r8d,esi
   14037b26f:	48 8d 94 24 70 02 00 	lea    rdx,[rsp+0x270]
   14037b276:	00 
   14037b277:	48 8b cb             	mov    rcx,rbx
   14037b27a:	e8 51 81 1b 00       	call   0x1405333d0
   14037b27f:	48 8b cb             	mov    rcx,rbx
   14037b282:	e8 79 9b f6 ff       	call   0x1402e4e00
   14037b287:	48 8b cb             	mov    rcx,rbx
   14037b28a:	e8 71 9b f6 ff       	call   0x1402e4e00
   14037b28f:	48 8b cb             	mov    rcx,rbx
   14037b292:	e8 a9 72 1b 00       	call   0x140532540
   14037b297:	48 8b cb             	mov    rcx,rbx
   14037b29a:	e8 a1 72 1b 00       	call   0x140532540
   14037b29f:	48 8b cb             	mov    rcx,rbx
   14037b2a2:	e8 99 72 1b 00       	call   0x140532540
   14037b2a7:	48 8b cb             	mov    rcx,rbx
   14037b2aa:	e8 91 72 1b 00       	call   0x140532540
   14037b2af:	48 8b cb             	mov    rcx,rbx
   14037b2b2:	e8 89 72 1b 00       	call   0x140532540
   14037b2b7:	48 8b cb             	mov    rcx,rbx
   14037b2ba:	e8 81 72 1b 00       	call   0x140532540
   14037b2bf:	48 8b cb             	mov    rcx,rbx
   14037b2c2:	e8 79 72 1b 00       	call   0x140532540
   14037b2c7:	41 83 fe 02          	cmp    r14d,0x2
   14037b2cb:	72 08                	jb     0x14037b2d5
   14037b2cd:	48 8b cb             	mov    rcx,rbx
   14037b2d0:	e8 cb 6a 1b 00       	call   0x140531da0
   14037b2d5:	41 83 fe 03          	cmp    r14d,0x3
   14037b2d9:	72 10                	jb     0x14037b2eb
   14037b2db:	48 8b cb             	mov    rcx,rbx
   14037b2de:	e8 5d 72 1b 00       	call   0x140532540
   14037b2e3:	48 8b cb             	mov    rcx,rbx
   14037b2e6:	e8 55 72 1b 00       	call   0x140532540
   14037b2eb:	48 83 ef 01          	sub    rdi,0x1
   14037b2ef:	0f 85 6b ff ff ff    	jne    0x14037b260
   14037b2f5:	48 8b cb             	mov    rcx,rbx
   14037b2f8:	e8 a3 6a 1b 00       	call   0x140531da0
   14037b2fd:	48 8b cb             	mov    rcx,rbx
   14037b300:	44 8b f8             	mov    r15d,eax
   14037b303:	e8 98 6a 1b 00       	call   0x140531da0
   14037b308:	48 8b cb             	mov    rcx,rbx
   14037b30b:	44 8b e0             	mov    r12d,eax
   14037b30e:	e8 8d 6a 1b 00       	call   0x140531da0
   14037b313:	89 05 57 f4 b8 14    	mov    DWORD PTR [rip+0x14b8f457],eax        # 0x154f0a770
   14037b319:	41 8b ed             	mov    ebp,r13d
   14037b31c:	48 8d 35 dd 4c c8 ff 	lea    rsi,[rip+0xffffffffffc84cdd]        # 0x140000000
   14037b323:	85 c0                	test   eax,eax
   14037b325:	0f 84 8c 01 00 00    	je     0x14037b4b7
   14037b32b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14037b330:	b9 20 01 00 00       	mov    ecx,0x120
   14037b335:	8b fd                	mov    edi,ebp
   14037b337:	e8 14 03 2a 00       	call   0x14061b650
   14037b33c:	48 8b cb             	mov    rcx,rbx
   14037b33f:	48 89 84 fe 70 67 f0 	mov    QWORD PTR [rsi+rdi*8+0x14f06770],rax
   14037b346:	14 
   14037b347:	e8 b4 9a f6 ff       	call   0x1402e4e00
   14037b34c:	48 8b 8c fe 70 67 f0 	mov    rcx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b353:	14 
   14037b354:	88 01                	mov    BYTE PTR [rcx],al
   14037b356:	48 8b cb             	mov    rcx,rbx
   14037b359:	e8 32 75 1b 00       	call   0x140532890
   14037b35e:	48 8b 8c fe 70 67 f0 	mov    rcx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b365:	14 
   14037b366:	89 41 04             	mov    DWORD PTR [rcx+0x4],eax
   14037b369:	48 8b 8c fe 70 67 f0 	mov    rcx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b370:	14 
   14037b371:	8b 41 04             	mov    eax,DWORD PTR [rcx+0x4]
   14037b374:	ff c8                	dec    eax
   14037b376:	83 f8 01             	cmp    eax,0x1
   14037b379:	77 07                	ja     0x14037b382
   14037b37b:	c7 41 04 01 00 00 00 	mov    DWORD PTR [rcx+0x4],0x1
   14037b382:	48 8b 8c fe 70 67 f0 	mov    rcx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b389:	14 
   14037b38a:	8b 41 04             	mov    eax,DWORD PTR [rcx+0x4]
   14037b38d:	83 e8 04             	sub    eax,0x4
   14037b390:	83 f8 01             	cmp    eax,0x1
   14037b393:	77 07                	ja     0x14037b39c
   14037b395:	c7 41 04 04 00 00 00 	mov    DWORD PTR [rcx+0x4],0x4
   14037b39c:	48 8b 84 fe 70 67 f0 	mov    rax,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b3a3:	14 
   14037b3a4:	83 78 04 08          	cmp    DWORD PTR [rax+0x4],0x8
   14037b3a8:	75 07                	jne    0x14037b3b1
   14037b3aa:	c7 40 04 07 00 00 00 	mov    DWORD PTR [rax+0x4],0x7
   14037b3b1:	48 8b cb             	mov    rcx,rbx
   14037b3b4:	e8 47 9a f6 ff       	call   0x1402e4e00
   14037b3b9:	48 8b 8c fe 70 67 f0 	mov    rcx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b3c0:	14 
   14037b3c1:	41 b8 80 00 00 00    	mov    r8d,0x80
   14037b3c7:	88 41 08             	mov    BYTE PTR [rcx+0x8],al
   14037b3ca:	48 8b cb             	mov    rcx,rbx
   14037b3cd:	48 8b 94 fe 70 67 f0 	mov    rdx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b3d4:	14 
   14037b3d5:	48 83 c2 18          	add    rdx,0x18
   14037b3d9:	e8 f2 7f 1b 00       	call   0x1405333d0
   14037b3de:	48 8b cb             	mov    rcx,rbx
   14037b3e1:	e8 5a 71 1b 00       	call   0x140532540
   14037b3e6:	48 8b 84 fe 70 67 f0 	mov    rax,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b3ed:	14 
   14037b3ee:	f3 0f 11 80 18 01 00 	movss  DWORD PTR [rax+0x118],xmm0
   14037b3f5:	00 
   14037b3f6:	48 8b 84 fe 70 67 f0 	mov    rax,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b3fd:	14 
   14037b3fe:	4c 89 68 10          	mov    QWORD PTR [rax+0x10],r13
   14037b402:	41 83 fe 06          	cmp    r14d,0x6
   14037b406:	0f 83 9d 00 00 00    	jae    0x14037b4a9
   14037b40c:	b9 c0 02 00 00       	mov    ecx,0x2c0
   14037b411:	e8 3a 02 2a 00       	call   0x14061b650
   14037b416:	48 8b f0             	mov    rsi,rax
   14037b419:	48 85 c0             	test   rax,rax
   14037b41c:	74 12                	je     0x14037b430
   14037b41e:	33 d2                	xor    edx,edx
   14037b420:	41 b8 c0 02 00 00    	mov    r8d,0x2c0
   14037b426:	48 8b c8             	mov    rcx,rax
   14037b429:	e8 bc 58 2a 00       	call   0x140620cea
   14037b42e:	eb 03                	jmp    0x14037b433
   14037b430:	49 8b f5             	mov    rsi,r13
   14037b433:	48 8d 05 c6 4b c8 ff 	lea    rax,[rip+0xffffffffffc84bc6]        # 0x140000000
   14037b43a:	44 89 6c 24 28       	mov    DWORD PTR [rsp+0x28],r13d
   14037b43f:	48 8b 84 f8 70 67 f0 	mov    rax,QWORD PTR [rax+rdi*8+0x14f06770]
   14037b446:	14 
   14037b447:	45 8b cc             	mov    r9d,r12d
   14037b44a:	45 8b c7             	mov    r8d,r15d
   14037b44d:	44 88 6c 24 20       	mov    BYTE PTR [rsp+0x20],r13b
   14037b452:	48 8b cb             	mov    rcx,rbx
   14037b455:	48 89 70 10          	mov    QWORD PTR [rax+0x10],rsi
   14037b459:	48 8d 35 a0 4b c8 ff 	lea    rsi,[rip+0xffffffffffc84ba0]        # 0x140000000
   14037b460:	48 8b 94 fe 70 67 f0 	mov    rdx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b467:	14 
   14037b468:	48 8b 52 10          	mov    rdx,QWORD PTR [rdx+0x10]
   14037b46c:	e8 4f 91 21 00       	call   0x1405945c0
   14037b471:	84 c0                	test   al,al
   14037b473:	0f 84 46 01 00 00    	je     0x14037b5bf
   14037b479:	48 8b 8c fe 70 67 f0 	mov    rcx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b480:	14 
   14037b481:	48 8b 49 10          	mov    rcx,QWORD PTR [rcx+0x10]
   14037b485:	e8 06 cb ff ff       	call   0x140377f90
   14037b48a:	48 8b 8c fe 70 67 f0 	mov    rcx,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b491:	14 
   14037b492:	33 d2                	xor    edx,edx
   14037b494:	48 8b 49 10          	mov    rcx,QWORD PTR [rcx+0x10]
   14037b498:	e8 bb 00 2a 00       	call   0x14061b558
   14037b49d:	48 8b 84 fe 70 67 f0 	mov    rax,QWORD PTR [rsi+rdi*8+0x14f06770]
   14037b4a4:	14 
   14037b4a5:	4c 89 68 10          	mov    QWORD PTR [rax+0x10],r13
   14037b4a9:	ff c5                	inc    ebp
   14037b4ab:	3b 2d bf f2 b8 14    	cmp    ebp,DWORD PTR [rip+0x14b8f2bf]        # 0x154f0a770
   14037b4b1:	0f 82 79 fe ff ff    	jb     0x14037b330
   14037b4b7:	48 8b cb             	mov    rcx,rbx
   14037b4ba:	e8 e1 68 1b 00       	call   0x140531da0
   14037b4bf:	89 05 af f2 b8 14    	mov    DWORD PTR [rip+0x14b8f2af],eax        # 0x154f0a774
   14037b4c5:	45 8b fd             	mov    r15d,r13d
   14037b4c8:	85 c0                	test   eax,eax
   14037b4ca:	0f 84 ef 00 00 00    	je     0x14037b5bf
   14037b4d0:	4c 8d 25 29 4b c8 ff 	lea    r12,[rip+0xffffffffffc84b29]        # 0x140000000
   14037b4d7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14037b4de:	00 00 
   14037b4e0:	b9 8c 01 00 00       	mov    ecx,0x18c
   14037b4e5:	41 8b ff             	mov    edi,r15d
   14037b4e8:	e8 63 01 2a 00       	call   0x14061b650
   14037b4ed:	48 8b cb             	mov    rcx,rbx
   14037b4f0:	49 89 84 fc 80 a7 f0 	mov    QWORD PTR [r12+rdi*8+0x14f0a780],rax
   14037b4f7:	14 
   14037b4f8:	e8 03 99 f6 ff       	call   0x1402e4e00
   14037b4fd:	49 8b 8c fc 80 a7 f0 	mov    rcx,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b504:	14 
   14037b505:	40 32 f6             	xor    sil,sil
   14037b508:	88 01                	mov    BYTE PTR [rcx],al
   14037b50a:	49 8b 84 fc 80 a7 f0 	mov    rax,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b511:	14 
   14037b512:	40 38 30             	cmp    BYTE PTR [rax],sil
   14037b515:	76 5b                	jbe    0x14037b572
   14037b517:	48 8b cb             	mov    rcx,rbx
   14037b51a:	e8 21 70 1b 00       	call   0x140532540
   14037b51f:	49 8b 84 fc 80 a7 f0 	mov    rax,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b526:	14 
   14037b527:	40 0f b6 ee          	movzx  ebp,sil
   14037b52b:	f3 0f 11 44 a8 04    	movss  DWORD PTR [rax+rbp*4+0x4],xmm0
   14037b531:	41 83 fe 04          	cmp    r14d,0x4
   14037b535:	72 1b                	jb     0x14037b552
   14037b537:	48 8b cb             	mov    rcx,rbx
   14037b53a:	e8 01 70 1b 00       	call   0x140532540
   14037b53f:	49 8b 84 fc 80 a7 f0 	mov    rax,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b546:	14 
   14037b547:	f3 0f 11 84 a8 c4 00 	movss  DWORD PTR [rax+rbp*4+0xc4],xmm0
   14037b54e:	00 00 
   14037b550:	eb 10                	jmp    0x14037b562
   14037b552:	49 8b 84 fc 80 a7 f0 	mov    rax,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b559:	14 
   14037b55a:	44 89 ac a8 c4 00 00 	mov    DWORD PTR [rax+rbp*4+0xc4],r13d
   14037b561:	00 
   14037b562:	49 8b 84 fc 80 a7 f0 	mov    rax,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b569:	14 
   14037b56a:	40 fe c6             	inc    sil
   14037b56d:	40 3a 30             	cmp    sil,BYTE PTR [rax]
   14037b570:	72 a5                	jb     0x14037b517
   14037b572:	41 83 fe 05          	cmp    r14d,0x5
   14037b576:	72 1a                	jb     0x14037b592
   14037b578:	48 8b cb             	mov    rcx,rbx
   14037b57b:	e8 c0 6f 1b 00       	call   0x140532540
   14037b580:	49 8b 84 fc 80 a7 f0 	mov    rax,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b587:	14 
   14037b588:	f3 0f 11 80 84 01 00 	movss  DWORD PTR [rax+0x184],xmm0
   14037b58f:	00 
   14037b590:	eb 07                	jmp    0x14037b599
   14037b592:	44 89 a8 84 01 00 00 	mov    DWORD PTR [rax+0x184],r13d
   14037b599:	48 8b cb             	mov    rcx,rbx
   14037b59c:	e8 ff 67 1b 00       	call   0x140531da0
   14037b5a1:	49 8b 8c fc 80 a7 f0 	mov    rcx,QWORD PTR [r12+rdi*8+0x14f0a780]
   14037b5a8:	14 
   14037b5a9:	41 ff c7             	inc    r15d
   14037b5ac:	89 81 88 01 00 00    	mov    DWORD PTR [rcx+0x188],eax
   14037b5b2:	44 3b 3d bb f1 b8 14 	cmp    r15d,DWORD PTR [rip+0x14b8f1bb]        # 0x154f0a774
   14037b5b9:	0f 82 21 ff ff ff    	jb     0x14037b4e0
   14037b5bf:	4c 8b a4 24 20 07 00 	mov    r12,QWORD PTR [rsp+0x720]
   14037b5c6:	00 
   14037b5c7:	48 8b bc 24 58 07 00 	mov    rdi,QWORD PTR [rsp+0x758]
   14037b5ce:	00 
   14037b5cf:	48 8b b4 24 50 07 00 	mov    rsi,QWORD PTR [rsp+0x750]
   14037b5d6:	00 
   14037b5d7:	48 8b ac 24 48 07 00 	mov    rbp,QWORD PTR [rsp+0x748]
   14037b5de:	00 
   14037b5df:	4c 8b bc 24 10 07 00 	mov    r15,QWORD PTR [rsp+0x710]
   14037b5e6:	00 
   14037b5e7:	48 8b cb             	mov    rcx,rbx
   14037b5ea:	e8 01 64 1b 00       	call   0x1405319f0
   14037b5ef:	4c 8b b4 24 18 07 00 	mov    r14,QWORD PTR [rsp+0x718]
   14037b5f6:	00 
   14037b5f7:	48 8b 8c 24 70 06 00 	mov    rcx,QWORD PTR [rsp+0x670]
   14037b5fe:	00 
   14037b5ff:	48 33 cc             	xor    rcx,rsp
   14037b602:	e8 f9 ff 29 00       	call   0x14061b600
   14037b607:	48 81 c4 28 07 00 00 	add    rsp,0x728
   14037b60e:	41 5d                	pop    r13
   14037b610:	5b                   	pop    rbx
   14037b611:	c3                   	ret
