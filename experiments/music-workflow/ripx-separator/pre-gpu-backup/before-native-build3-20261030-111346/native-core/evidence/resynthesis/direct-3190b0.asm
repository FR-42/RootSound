
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403190b0 <.text+0x3180b0>:
   1403190b0:	40 53                	rex push rbx
   1403190b2:	56                   	push   rsi
   1403190b3:	57                   	push   rdi
   1403190b4:	41 55                	push   r13
   1403190b6:	41 56                	push   r14
   1403190b8:	48 83 ec 50          	sub    rsp,0x50
   1403190bc:	66 0f 6e 8c 24 a0 00 	movd   xmm1,DWORD PTR [rsp+0xa0]
   1403190c3:	00 00 
   1403190c5:	46 8d 2c 0a          	lea    r13d,[rdx+r9*1]
   1403190c9:	f3 0f 10 84 24 b0 00 	movss  xmm0,DWORD PTR [rsp+0xb0]
   1403190d0:	00 00 
   1403190d2:	44 8b f2             	mov    r14d,edx
   1403190d5:	0f 5a c0             	cvtps2pd xmm0,xmm0
   1403190d8:	41 8b c1             	mov    eax,r9d
   1403190db:	41 8b f6             	mov    esi,r14d
   1403190de:	99                   	cdq
   1403190df:	48 8b d9             	mov    rbx,rcx
   1403190e2:	2b c2                	sub    eax,edx
   1403190e4:	d1 f8                	sar    eax,1
   1403190e6:	41 3b c6             	cmp    eax,r14d
   1403190e9:	8b f8                	mov    edi,eax
   1403190eb:	0f 29 74 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm6
   1403190f0:	f2 0f 10 35 00 71 53 	movsd  xmm6,QWORD PTR [rip+0x537100]        # 0x1408501f8
   1403190f7:	00 
   1403190f8:	0f 4c f0             	cmovl  esi,eax
   1403190fb:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   1403190ff:	45 2b c5             	sub    r8d,r13d
   140319102:	41 3b c0             	cmp    eax,r8d
   140319105:	41 0f 4d f8          	cmovge edi,r8d
   140319109:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14031910d:	0f 29 7c 24 30       	movaps XMMWORD PTR [rsp+0x30],xmm7
   140319112:	44 0f 29 44 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm8
   140319118:	f2 0f 5e c1          	divsd  xmm0,xmm1
   14031911c:	0f 28 ce             	movaps xmm1,xmm6
   14031911f:	e8 44 7c 30 00       	call   0x140620d68
   140319124:	45 0f 57 c0          	xorps  xmm8,xmm8
   140319128:	66 44 0f 2f c0       	comisd xmm8,xmm0
   14031912d:	76 04                	jbe    0x140319133
   14031912f:	f2 0f 58 c6          	addsd  xmm0,xmm6
   140319133:	66 0f 6e ce          	movd   xmm1,esi
   140319137:	0f 57 ff             	xorps  xmm7,xmm7
   14031913a:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   14031913e:	f3 0f 10 84 24 b8 00 	movss  xmm0,DWORD PTR [rsp+0xb8]
   140319145:	00 00 
   140319147:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14031914a:	f3 0f 59 cf          	mulss  xmm1,xmm7
   14031914e:	f3 0f 5c c1          	subss  xmm0,xmm1
   140319152:	0f 28 ce             	movaps xmm1,xmm6
   140319155:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140319158:	e8 0b 7c 30 00       	call   0x140620d68
   14031915d:	66 44 0f 2f c0       	comisd xmm8,xmm0
   140319162:	44 0f 28 44 24 20    	movaps xmm8,XMMWORD PTR [rsp+0x20]
   140319168:	76 04                	jbe    0x14031916e
   14031916a:	f2 0f 58 c6          	addsd  xmm0,xmm6
   14031916e:	f2 0f 10 1d 9a e8 38 	movsd  xmm3,QWORD PTR [rip+0x38e89a]        # 0x1406a7a10
   140319175:	00 
   140319176:	33 c0                	xor    eax,eax
   140319178:	f2 0f 10 25 00 e9 38 	movsd  xmm4,QWORD PTR [rip+0x38e900]        # 0x1406a7a80
   14031917f:	00 
   140319180:	48 b9 00 00 00 00 00 	movabs rcx,0x8000000000000000
   140319187:	00 00 80 
   14031918a:	f2 0f 10 2d 96 6f 53 	movsd  xmm5,QWORD PTR [rip+0x536f96]        # 0x140850128
   140319191:	00 
   140319192:	f2 0f 10 15 16 71 53 	movsd  xmm2,QWORD PTR [rip+0x537116]        # 0x1408502b0
   140319199:	00 
   14031919a:	0f 28 74 24 40       	movaps xmm6,XMMWORD PTR [rsp+0x40]
   14031919f:	0f 5a cf             	cvtps2pd xmm1,xmm7
   1403191a2:	0f 28 7c 24 30       	movaps xmm7,XMMWORD PTR [rsp+0x30]
   1403191a7:	f2 0f 59 cb          	mulsd  xmm1,xmm3
   1403191ab:	f2 0f 59 cc          	mulsd  xmm1,xmm4
   1403191af:	f2 0f 58 cd          	addsd  xmm1,xmm5
   1403191b3:	66 0f 2f ca          	comisd xmm1,xmm2
   1403191b7:	72 0d                	jb     0x1403191c6
   1403191b9:	f2 0f 5c ca          	subsd  xmm1,xmm2
   1403191bd:	66 0f 2f ca          	comisd xmm1,xmm2
   1403191c1:	73 03                	jae    0x1403191c6
   1403191c3:	48 8b c1             	mov    rax,rcx
   1403191c6:	f2 0f 59 c3          	mulsd  xmm0,xmm3
   1403191ca:	f2 4c 0f 2c c9       	cvttsd2si r9,xmm1
   1403191cf:	f2 0f 59 c4          	mulsd  xmm0,xmm4
   1403191d3:	4c 03 c8             	add    r9,rax
   1403191d6:	33 c0                	xor    eax,eax
   1403191d8:	f2 0f 58 c5          	addsd  xmm0,xmm5
   1403191dc:	66 0f 2f c2          	comisd xmm0,xmm2
   1403191e0:	72 0d                	jb     0x1403191ef
   1403191e2:	f2 0f 5c c2          	subsd  xmm0,xmm2
   1403191e6:	66 0f 2f c2          	comisd xmm0,xmm2
   1403191ea:	73 03                	jae    0x1403191ef
   1403191ec:	48 8b c1             	mov    rax,rcx
   1403191ef:	f3 0f 10 94 24 a8 00 	movss  xmm2,DWORD PTR [rsp+0xa8]
   1403191f6:	00 00 
   1403191f8:	45 8b de             	mov    r11d,r14d
   1403191fb:	44 2b de             	sub    r11d,esi
   1403191fe:	48 89 ac 24 80 00 00 	mov    QWORD PTR [rsp+0x80],rbp
   140319205:	00 
   140319206:	41 ff c3             	inc    r11d
   140319209:	f2 48 0f 2c d0       	cvttsd2si rdx,xmm0
   14031920e:	4d 63 c3             	movsxd r8,r11d
   140319211:	48 03 d0             	add    rdx,rax
   140319214:	42 8d 04 36          	lea    eax,[rsi+r14*1]
   140319218:	4c 63 d0             	movsxd r10,eax
   14031921b:	4d 3b c2             	cmp    r8,r10
   14031921e:	0f 8d cd 01 00 00    	jge    0x1403193f1
   140319224:	49 8b c2             	mov    rax,r10
   140319227:	49 2b c0             	sub    rax,r8
   14031922a:	48 83 f8 04          	cmp    rax,0x4
   14031922e:	0f 8c 5b 01 00 00    	jl     0x14031938f
   140319234:	4c 89 a4 24 88 00 00 	mov    QWORD PTR [rsp+0x88],r12
   14031923b:	00 
   14031923c:	8d 04 36             	lea    eax,[rsi+rsi*1]
   14031923f:	66 0f 6e d8          	movd   xmm3,eax
   140319243:	48 8d 6b 08          	lea    rbp,[rbx+0x8]
   140319247:	4c 89 bc 24 90 00 00 	mov    QWORD PTR [rsp+0x90],r15
   14031924e:	00 
   14031924f:	4a 8d 6c 85 00       	lea    rbp,[rbp+r8*4+0x0]
   140319254:	45 8d 7b 02          	lea    r15d,[r11+0x2]
   140319258:	4d 8b e2             	mov    r12,r10
   14031925b:	4d 2b e0             	sub    r12,r8
   14031925e:	8b c6                	mov    eax,esi
   140319260:	41 2b c6             	sub    eax,r14d
   140319263:	49 83 ec 04          	sub    r12,0x4
   140319267:	44 03 f8             	add    r15d,eax
   14031926a:	49 c1 ec 02          	shr    r12,0x2
   14031926e:	49 ff c4             	inc    r12
   140319271:	0f 5b db             	cvtdq2ps xmm3,xmm3
   140319274:	47 8d 1c a3          	lea    r11d,[r11+r12*4]
   140319278:	4f 8d 04 a0          	lea    r8,[r8+r12*4]
   14031927c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140319280:	48 8b 05 b9 d0 be 14 	mov    rax,QWORD PTR [rip+0x14bed0b9]        # 0x154f06340
   140319287:	49 03 d1             	add    rdx,r9
   14031928a:	48 8b ca             	mov    rcx,rdx
   14031928d:	0f 28 ca             	movaps xmm1,xmm2
   140319290:	48 c1 e9 20          	shr    rcx,0x20
   140319294:	49 03 d1             	add    rdx,r9
   140319297:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   14031929d:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   1403192a2:	41 8d 47 fe          	lea    eax,[r15-0x2]
   1403192a6:	48 8b ca             	mov    rcx,rdx
   1403192a9:	49 03 d1             	add    rdx,r9
   1403192ac:	66 0f 6e c0          	movd   xmm0,eax
   1403192b0:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403192b3:	48 c1 e9 20          	shr    rcx,0x20
   1403192b7:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   1403192bd:	f3 0f 5e c3          	divss  xmm0,xmm3
   1403192c1:	f3 0f 59 c8          	mulss  xmm1,xmm0
   1403192c5:	f3 0f 58 4d f8       	addss  xmm1,DWORD PTR [rbp-0x8]
   1403192ca:	f3 0f 11 4d f8       	movss  DWORD PTR [rbp-0x8],xmm1
   1403192cf:	0f 28 ca             	movaps xmm1,xmm2
   1403192d2:	48 8b 05 67 d0 be 14 	mov    rax,QWORD PTR [rip+0x14bed067]        # 0x154f06340
   1403192d9:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   1403192de:	41 8d 47 ff          	lea    eax,[r15-0x1]
   1403192e2:	48 8b ca             	mov    rcx,rdx
   1403192e5:	49 03 d1             	add    rdx,r9
   1403192e8:	66 0f 6e c0          	movd   xmm0,eax
   1403192ec:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403192ef:	48 c1 e9 20          	shr    rcx,0x20
   1403192f3:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   1403192f9:	f3 0f 5e c3          	divss  xmm0,xmm3
   1403192fd:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140319301:	66 41 0f 6e c7       	movd   xmm0,r15d
   140319306:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140319309:	f3 0f 58 4d fc       	addss  xmm1,DWORD PTR [rbp-0x4]
   14031930e:	f3 0f 5e c3          	divss  xmm0,xmm3
   140319312:	f3 0f 11 4d fc       	movss  DWORD PTR [rbp-0x4],xmm1
   140319317:	0f 28 ca             	movaps xmm1,xmm2
   14031931a:	48 8b 05 1f d0 be 14 	mov    rax,QWORD PTR [rip+0x14bed01f]        # 0x154f06340
   140319321:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   140319326:	48 8b ca             	mov    rcx,rdx
   140319329:	48 c1 e9 20          	shr    rcx,0x20
   14031932d:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   140319333:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140319337:	f3 0f 58 4d 00       	addss  xmm1,DWORD PTR [rbp+0x0]
   14031933c:	f3 0f 11 4d 00       	movss  DWORD PTR [rbp+0x0],xmm1
   140319341:	0f 28 ca             	movaps xmm1,xmm2
   140319344:	48 8b 05 f5 cf be 14 	mov    rax,QWORD PTR [rip+0x14becff5]        # 0x154f06340
   14031934b:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   140319350:	41 8d 47 01          	lea    eax,[r15+0x1]
   140319354:	41 83 c7 04          	add    r15d,0x4
   140319358:	66 0f 6e c0          	movd   xmm0,eax
   14031935c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14031935f:	f3 0f 5e c3          	divss  xmm0,xmm3
   140319363:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140319367:	f3 0f 58 4d 04       	addss  xmm1,DWORD PTR [rbp+0x4]
   14031936c:	f3 0f 11 4d 04       	movss  DWORD PTR [rbp+0x4],xmm1
   140319371:	48 83 c5 10          	add    rbp,0x10
   140319375:	49 83 ec 01          	sub    r12,0x1
   140319379:	0f 85 01 ff ff ff    	jne    0x140319280
   14031937f:	4c 8b bc 24 90 00 00 	mov    r15,QWORD PTR [rsp+0x90]
   140319386:	00 
   140319387:	4c 8b a4 24 88 00 00 	mov    r12,QWORD PTR [rsp+0x88]
   14031938e:	00 
   14031938f:	4d 3b c2             	cmp    r8,r10
   140319392:	7d 5d                	jge    0x1403193f1
   140319394:	8d 04 36             	lea    eax,[rsi+rsi*1]
   140319397:	41 2b f6             	sub    esi,r14d
   14031939a:	66 0f 6e d8          	movd   xmm3,eax
   14031939e:	41 03 f3             	add    esi,r11d
   1403193a1:	41 8b c2             	mov    eax,r10d
   1403193a4:	41 2b c0             	sub    eax,r8d
   1403193a7:	44 03 d8             	add    r11d,eax
   1403193aa:	0f 5b db             	cvtdq2ps xmm3,xmm3
   1403193ad:	48 8b 05 8c cf be 14 	mov    rax,QWORD PTR [rip+0x14becf8c]        # 0x154f06340
   1403193b4:	49 03 d1             	add    rdx,r9
   1403193b7:	66 0f 6e c6          	movd   xmm0,esi
   1403193bb:	48 8b ca             	mov    rcx,rdx
   1403193be:	48 c1 e9 20          	shr    rcx,0x20
   1403193c2:	0f 28 ca             	movaps xmm1,xmm2
   1403193c5:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403193c8:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   1403193ce:	ff c6                	inc    esi
   1403193d0:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   1403193d5:	f3 0f 5e c3          	divss  xmm0,xmm3
   1403193d9:	f3 0f 59 c8          	mulss  xmm1,xmm0
   1403193dd:	f3 42 0f 58 0c 83    	addss  xmm1,DWORD PTR [rbx+r8*4]
   1403193e3:	f3 42 0f 11 0c 83    	movss  DWORD PTR [rbx+r8*4],xmm1
   1403193e9:	49 ff c0             	inc    r8
   1403193ec:	4d 3b c2             	cmp    r8,r10
   1403193ef:	7c bc                	jl     0x1403193ad
   1403193f1:	41 8b c5             	mov    eax,r13d
   1403193f4:	4d 63 c3             	movsxd r8,r11d
   1403193f7:	2b c7                	sub    eax,edi
   1403193f9:	48 63 f0             	movsxd rsi,eax
   1403193fc:	4c 3b c6             	cmp    r8,rsi
   1403193ff:	0f 8d 33 01 00 00    	jge    0x140319538
   140319405:	48 8b c6             	mov    rax,rsi
   140319408:	49 2b c0             	sub    rax,r8
   14031940b:	48 83 f8 04          	cmp    rax,0x4
   14031940f:	0f 8c e3 00 00 00    	jl     0x1403194f8
   140319415:	48 8b ee             	mov    rbp,rsi
   140319418:	4c 8d 53 08          	lea    r10,[rbx+0x8]
   14031941c:	49 2b e8             	sub    rbp,r8
   14031941f:	4f 8d 14 82          	lea    r10,[r10+r8*4]
   140319423:	48 83 ed 04          	sub    rbp,0x4
   140319427:	48 c1 ed 02          	shr    rbp,0x2
   14031942b:	48 ff c5             	inc    rbp
   14031942e:	45 8d 1c ab          	lea    r11d,[r11+rbp*4]
   140319432:	4d 8d 04 a8          	lea    r8,[r8+rbp*4]
   140319436:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14031943d:	00 00 00 
   140319440:	48 8b 05 f9 ce be 14 	mov    rax,QWORD PTR [rip+0x14becef9]        # 0x154f06340
   140319447:	49 03 d1             	add    rdx,r9
   14031944a:	48 8b ca             	mov    rcx,rdx
   14031944d:	0f 28 c2             	movaps xmm0,xmm2
   140319450:	48 c1 e9 20          	shr    rcx,0x20
   140319454:	49 03 d1             	add    rdx,r9
   140319457:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   14031945d:	f3 0f 59 04 88       	mulss  xmm0,DWORD PTR [rax+rcx*4]
   140319462:	48 8b ca             	mov    rcx,rdx
   140319465:	48 c1 e9 20          	shr    rcx,0x20
   140319469:	49 03 d1             	add    rdx,r9
   14031946c:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   140319472:	f3 41 0f 58 42 f8    	addss  xmm0,DWORD PTR [r10-0x8]
   140319478:	f3 41 0f 11 42 f8    	movss  DWORD PTR [r10-0x8],xmm0
   14031947e:	0f 28 c2             	movaps xmm0,xmm2
   140319481:	48 8b 05 b8 ce be 14 	mov    rax,QWORD PTR [rip+0x14beceb8]        # 0x154f06340
   140319488:	f3 0f 59 04 88       	mulss  xmm0,DWORD PTR [rax+rcx*4]
   14031948d:	48 8b ca             	mov    rcx,rdx
   140319490:	48 c1 e9 20          	shr    rcx,0x20
   140319494:	49 03 d1             	add    rdx,r9
   140319497:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   14031949d:	f3 41 0f 58 42 fc    	addss  xmm0,DWORD PTR [r10-0x4]
   1403194a3:	f3 41 0f 11 42 fc    	movss  DWORD PTR [r10-0x4],xmm0
   1403194a9:	0f 28 c2             	movaps xmm0,xmm2
   1403194ac:	48 8b 05 8d ce be 14 	mov    rax,QWORD PTR [rip+0x14bece8d]        # 0x154f06340
   1403194b3:	f3 0f 59 04 88       	mulss  xmm0,DWORD PTR [rax+rcx*4]
   1403194b8:	48 8b ca             	mov    rcx,rdx
   1403194bb:	48 c1 e9 20          	shr    rcx,0x20
   1403194bf:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   1403194c5:	f3 41 0f 58 02       	addss  xmm0,DWORD PTR [r10]
   1403194ca:	f3 41 0f 11 02       	movss  DWORD PTR [r10],xmm0
   1403194cf:	0f 28 c2             	movaps xmm0,xmm2
   1403194d2:	48 8b 05 67 ce be 14 	mov    rax,QWORD PTR [rip+0x14bece67]        # 0x154f06340
   1403194d9:	f3 0f 59 04 88       	mulss  xmm0,DWORD PTR [rax+rcx*4]
   1403194de:	f3 41 0f 58 42 04    	addss  xmm0,DWORD PTR [r10+0x4]
   1403194e4:	f3 41 0f 11 42 04    	movss  DWORD PTR [r10+0x4],xmm0
   1403194ea:	49 83 c2 10          	add    r10,0x10
   1403194ee:	48 83 ed 01          	sub    rbp,0x1
   1403194f2:	0f 85 48 ff ff ff    	jne    0x140319440
   1403194f8:	4c 3b c6             	cmp    r8,rsi
   1403194fb:	7d 3b                	jge    0x140319538
   1403194fd:	8b c6                	mov    eax,esi
   1403194ff:	41 2b c0             	sub    eax,r8d
   140319502:	44 03 d8             	add    r11d,eax
   140319505:	48 8b 05 34 ce be 14 	mov    rax,QWORD PTR [rip+0x14bece34]        # 0x154f06340
   14031950c:	49 03 d1             	add    rdx,r9
   14031950f:	48 8b ca             	mov    rcx,rdx
   140319512:	0f 28 c2             	movaps xmm0,xmm2
   140319515:	48 c1 e9 20          	shr    rcx,0x20
   140319519:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   14031951f:	f3 0f 59 04 88       	mulss  xmm0,DWORD PTR [rax+rcx*4]
   140319524:	f3 42 0f 58 04 83    	addss  xmm0,DWORD PTR [rbx+r8*4]
   14031952a:	f3 42 0f 11 04 83    	movss  DWORD PTR [rbx+r8*4],xmm0
   140319530:	49 ff c0             	inc    r8
   140319533:	4c 3b c6             	cmp    r8,rsi
   140319536:	7c cd                	jl     0x140319505
   140319538:	42 8d 04 2f          	lea    eax,[rdi+r13*1]
   14031953c:	4d 63 c3             	movsxd r8,r11d
   14031953f:	4c 63 d0             	movsxd r10,eax
   140319542:	4d 3b c2             	cmp    r8,r10
   140319545:	0f 8d a6 01 00 00    	jge    0x1403196f1
   14031954b:	49 8b c2             	mov    rax,r10
   14031954e:	49 2b c0             	sub    rax,r8
   140319551:	48 83 f8 04          	cmp    rax,0x4
   140319555:	0f 8c 3d 01 00 00    	jl     0x140319698
   14031955b:	8d 04 3f             	lea    eax,[rdi+rdi*1]
   14031955e:	4d 8b f2             	mov    r14,r10
   140319561:	4d 2b f0             	sub    r14,r8
   140319564:	66 0f 6e d8          	movd   xmm3,eax
   140319568:	49 83 ee 04          	sub    r14,0x4
   14031956c:	41 8d 6d fe          	lea    ebp,[r13-0x2]
   140319570:	8b c7                	mov    eax,edi
   140319572:	49 c1 ee 02          	shr    r14,0x2
   140319576:	41 2b c3             	sub    eax,r11d
   140319579:	48 8d 73 08          	lea    rsi,[rbx+0x8]
   14031957d:	03 e8                	add    ebp,eax
   14031957f:	4a 8d 34 86          	lea    rsi,[rsi+r8*4]
   140319583:	49 ff c6             	inc    r14
   140319586:	0f 5b db             	cvtdq2ps xmm3,xmm3
   140319589:	47 8d 1c b3          	lea    r11d,[r11+r14*4]
   14031958d:	4f 8d 04 b0          	lea    r8,[r8+r14*4]
   140319591:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140319595:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14031959c:	00 00 00 00 
   1403195a0:	48 8b 05 99 cd be 14 	mov    rax,QWORD PTR [rip+0x14becd99]        # 0x154f06340
   1403195a7:	49 03 d1             	add    rdx,r9
   1403195aa:	48 8b ca             	mov    rcx,rdx
   1403195ad:	0f 28 ca             	movaps xmm1,xmm2
   1403195b0:	48 c1 e9 20          	shr    rcx,0x20
   1403195b4:	49 03 d1             	add    rdx,r9
   1403195b7:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   1403195bd:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   1403195c2:	8d 45 02             	lea    eax,[rbp+0x2]
   1403195c5:	48 8b ca             	mov    rcx,rdx
   1403195c8:	49 03 d1             	add    rdx,r9
   1403195cb:	66 0f 6e c0          	movd   xmm0,eax
   1403195cf:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403195d2:	48 c1 e9 20          	shr    rcx,0x20
   1403195d6:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   1403195dc:	f3 0f 5e c3          	divss  xmm0,xmm3
   1403195e0:	f3 0f 59 c8          	mulss  xmm1,xmm0
   1403195e4:	f3 0f 58 4e f8       	addss  xmm1,DWORD PTR [rsi-0x8]
   1403195e9:	f3 0f 11 4e f8       	movss  DWORD PTR [rsi-0x8],xmm1
   1403195ee:	0f 28 ca             	movaps xmm1,xmm2
   1403195f1:	48 8b 05 48 cd be 14 	mov    rax,QWORD PTR [rip+0x14becd48]        # 0x154f06340
   1403195f8:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   1403195fd:	8d 45 01             	lea    eax,[rbp+0x1]
   140319600:	48 8b ca             	mov    rcx,rdx
   140319603:	49 03 d1             	add    rdx,r9
   140319606:	66 0f 6e c0          	movd   xmm0,eax
   14031960a:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14031960d:	48 c1 e9 20          	shr    rcx,0x20
   140319611:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   140319617:	f3 0f 5e c3          	divss  xmm0,xmm3
   14031961b:	f3 0f 59 c8          	mulss  xmm1,xmm0
   14031961f:	66 0f 6e c5          	movd   xmm0,ebp
   140319623:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140319626:	f3 0f 58 4e fc       	addss  xmm1,DWORD PTR [rsi-0x4]
   14031962b:	f3 0f 5e c3          	divss  xmm0,xmm3
   14031962f:	f3 0f 11 4e fc       	movss  DWORD PTR [rsi-0x4],xmm1
   140319634:	0f 28 ca             	movaps xmm1,xmm2
   140319637:	48 8b 05 02 cd be 14 	mov    rax,QWORD PTR [rip+0x14becd02]        # 0x154f06340
   14031963e:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   140319643:	48 8b ca             	mov    rcx,rdx
   140319646:	48 c1 e9 20          	shr    rcx,0x20
   14031964a:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   140319650:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140319654:	f3 0f 58 0e          	addss  xmm1,DWORD PTR [rsi]
   140319658:	f3 0f 11 0e          	movss  DWORD PTR [rsi],xmm1
   14031965c:	0f 28 ca             	movaps xmm1,xmm2
   14031965f:	48 8b 05 da cc be 14 	mov    rax,QWORD PTR [rip+0x14beccda]        # 0x154f06340
   140319666:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   14031966b:	8d 45 ff             	lea    eax,[rbp-0x1]
   14031966e:	83 ed 04             	sub    ebp,0x4
   140319671:	66 0f 6e c0          	movd   xmm0,eax
   140319675:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140319678:	f3 0f 5e c3          	divss  xmm0,xmm3
   14031967c:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140319680:	f3 0f 58 4e 04       	addss  xmm1,DWORD PTR [rsi+0x4]
   140319685:	f3 0f 11 4e 04       	movss  DWORD PTR [rsi+0x4],xmm1
   14031968a:	48 83 c6 10          	add    rsi,0x10
   14031968e:	49 83 ee 01          	sub    r14,0x1
   140319692:	0f 85 08 ff ff ff    	jne    0x1403195a0
   140319698:	4d 3b c2             	cmp    r8,r10
   14031969b:	7d 54                	jge    0x1403196f1
   14031969d:	8d 04 3f             	lea    eax,[rdi+rdi*1]
   1403196a0:	41 2b fb             	sub    edi,r11d
   1403196a3:	66 0f 6e d8          	movd   xmm3,eax
   1403196a7:	41 03 fd             	add    edi,r13d
   1403196aa:	0f 5b db             	cvtdq2ps xmm3,xmm3
   1403196ad:	48 8b 05 8c cc be 14 	mov    rax,QWORD PTR [rip+0x14becc8c]        # 0x154f06340
   1403196b4:	49 03 d1             	add    rdx,r9
   1403196b7:	66 0f 6e c7          	movd   xmm0,edi
   1403196bb:	48 8b ca             	mov    rcx,rdx
   1403196be:	48 c1 e9 20          	shr    rcx,0x20
   1403196c2:	0f 28 ca             	movaps xmm1,xmm2
   1403196c5:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403196c8:	81 e1 ff 7f 00 00    	and    ecx,0x7fff
   1403196ce:	ff cf                	dec    edi
   1403196d0:	f3 0f 59 0c 88       	mulss  xmm1,DWORD PTR [rax+rcx*4]
   1403196d5:	f3 0f 5e c3          	divss  xmm0,xmm3
   1403196d9:	f3 0f 59 c8          	mulss  xmm1,xmm0
   1403196dd:	f3 42 0f 58 0c 83    	addss  xmm1,DWORD PTR [rbx+r8*4]
   1403196e3:	f3 42 0f 11 0c 83    	movss  DWORD PTR [rbx+r8*4],xmm1
   1403196e9:	49 ff c0             	inc    r8
   1403196ec:	4d 3b c2             	cmp    r8,r10
   1403196ef:	7c bc                	jl     0x1403196ad
   1403196f1:	48 8b ac 24 80 00 00 	mov    rbp,QWORD PTR [rsp+0x80]
   1403196f8:	00 
   1403196f9:	48 83 c4 50          	add    rsp,0x50
   1403196fd:	41 5e                	pop    r14
   1403196ff:	41 5d                	pop    r13
   140319701:	5f                   	pop    rdi
   140319702:	5e                   	pop    rsi
   140319703:	5b                   	pop    rbx
   140319704:	c3                   	ret
   140319705:	cc                   	int3
   140319706:	cc                   	int3
   140319707:	cc                   	int3
   140319708:	cc                   	int3
   140319709:	cc                   	int3
   14031970a:	cc                   	int3
   14031970b:	cc                   	int3
   14031970c:	cc                   	int3
   14031970d:	cc                   	int3
   14031970e:	cc                   	int3
   14031970f:	cc                   	int3
   140319710:	48 83 ec 48          	sub    rsp,0x48
   140319714:	80 3d f6 07 67 00 00 	cmp    BYTE PTR [rip+0x6707f6],0x0        # 0x140989f11
   14031971b:	0f 57 e4             	xorps  xmm4,xmm4
   14031971e:	8b 05 30 0a 67 00    	mov    eax,DWORD PTR [rip+0x670a30]        # 0x14098a154
   140319724:	0f 57 c0             	xorps  xmm0,xmm0
   140319727:	0f 29 74 24 30       	movaps XMMWORD PTR [rsp+0x30],xmm6
   14031972c:	0f 29 7c 24 20       	movaps XMMWORD PTR [rsp+0x20],xmm7
   140319731:	44 0f 29 44 24 10    	movaps XMMWORD PTR [rsp+0x10],xmm8
   140319737:	f3 48 0f 2a e0       	cvtsi2ss xmm4,rax
   14031973c:	8b 05 66 0a 67 00    	mov    eax,DWORD PTR [rip+0x670a66]        # 0x14098a1a8
   140319742:	8d 0c 00             	lea    ecx,[rax+rax*1]
   140319745:	44 0f 29 0c 24       	movaps XMMWORD PTR [rsp],xmm9
   14031974a:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   14031974f:	f3 0f 5e e0          	divss  xmm4,xmm0
   140319753:	0f 57 c0             	xorps  xmm0,xmm0
   140319756:	0f 28 d4             	movaps xmm2,xmm4
   140319759:	f3 0f 11 25 7f 08 67 	movss  DWORD PTR [rip+0x67087f],xmm4        # 0x140989fe0
   140319760:	00 
   140319761:	f3 0f 59 15 73 68 53 	mulss  xmm2,DWORD PTR [rip+0x536873]        # 0x14084ffdc
   140319768:	00 
   140319769:	0f 28 cc             	movaps xmm1,xmm4
   14031976c:	f3 0f 59 0d 68 68 53 	mulss  xmm1,DWORD PTR [rip+0x536868]        # 0x14084ffdc
   140319773:	00 
   140319774:	f3 0f 58 d0          	addss  xmm2,xmm0
   140319778:	74 0a                	je     0x140319784
   14031977a:	f3 0f 10 1d 8e da 37 	movss  xmm3,DWORD PTR [rip+0x37da8e]        # 0x140697210
   140319781:	00 
   140319782:	eb 08                	jmp    0x14031978c
   140319784:	f3 0f 10 1d cc f5 37 	movss  xmm3,DWORD PTR [rip+0x37f5cc]        # 0x140698d58
   14031978b:	00 
   14031978c:	f3 0f 10 3d 4c a8 38 	movss  xmm7,DWORD PTR [rip+0x38a84c]        # 0x1406a3fe0
   140319793:	00 
   140319794:	f3 0f 5c d9          	subss  xmm3,xmm1
   140319798:	f3 0f 10 2d 44 e3 38 	movss  xmm5,DWORD PTR [rip+0x38e344]        # 0x1406a7ae4
   14031979f:	00 
   1403197a0:	4c 8d 05 79 07 67 00 	lea    r8,[rip+0x670779]        # 0x140989f20
   1403197a7:	f3 0f 10 35 25 f5 37 	movss  xmm6,DWORD PTR [rip+0x37f525]        # 0x140698cd4
   1403197ae:	00 
   1403197af:	45 33 c9             	xor    r9d,r9d
   1403197b2:	f2 44 0f 10 05 ed e1 	movsd  xmm8,QWORD PTR [rip+0x38e1ed]        # 0x1406a79a8
   1403197b9:	38 00 
   1403197bb:	41 8b d1             	mov    edx,r9d
   1403197be:	f3 44 0f 10 0d 11 49 	movss  xmm9,DWORD PTR [rip+0x374911]        # 0x14068e0d8
   1403197c5:	37 00 
   1403197c7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   1403197ce:	00 00 
   1403197d0:	33 c0                	xor    eax,eax
   1403197d2:	8b ca                	mov    ecx,edx
   1403197d4:	48 03 c9             	add    rcx,rcx
   1403197d7:	49 89 04 c8          	mov    QWORD PTR [r8+rcx*8],rax
   1403197db:	49 89 44 c8 08       	mov    QWORD PTR [r8+rcx*8+0x8],rax
   1403197e0:	8d 42 c0             	lea    eax,[rdx-0x40]
   1403197e3:	41 88 04 c8          	mov    BYTE PTR [r8+rcx*8],al
   1403197e7:	8b c2                	mov    eax,edx
   1403197e9:	f3 41 0f 11 54 c8 04 	movss  DWORD PTR [r8+rcx*8+0x4],xmm2
   1403197f0:	45 89 4c c8 0c       	mov    DWORD PTR [r8+rcx*8+0xc],r9d
   1403197f5:	85 d2                	test   edx,edx
   1403197f7:	74 1f                	je     0x140319818
   1403197f9:	83 f8 01             	cmp    eax,0x1
   1403197fc:	74 15                	je     0x140319813
   1403197fe:	0f 28 c4             	movaps xmm0,xmm4
   140319801:	f3 0f 59 c7          	mulss  xmm0,xmm7
   140319805:	f3 0f 58 c2          	addss  xmm0,xmm2
   140319809:	0f 2f d8             	comiss xmm3,xmm0
   14031980c:	77 0d                	ja     0x14031981b
   14031980e:	0f 28 c3             	movaps xmm0,xmm3
   140319811:	eb 08                	jmp    0x14031981b
   140319813:	0f 28 c5             	movaps xmm0,xmm5
   140319816:	eb 03                	jmp    0x14031981b
   140319818:	0f 28 c6             	movaps xmm0,xmm6
   14031981b:	f3 41 0f 11 44 c8 08 	movss  DWORD PTR [r8+rcx*8+0x8],xmm0
   140319822:	f3 0f 5c c2          	subss  xmm0,xmm2
   140319826:	f3 0f 5e c4          	divss  xmm0,xmm4
   14031982a:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14031982e:	f2 41 0f 58 c0       	addsd  xmm0,xmm8
   140319833:	f2 48 0f 2c c0       	cvttsd2si rax,xmm0
   140319838:	83 f8 30             	cmp    eax,0x30
   14031983b:	73 06                	jae    0x140319843
   14031983d:	85 c0                	test   eax,eax
   14031983f:	74 40                	je     0x140319881
   140319841:	eb 05                	jmp    0x140319848
   140319843:	b8 30 00 00 00       	mov    eax,0x30
   140319848:	0f 57 c9             	xorps  xmm1,xmm1
   14031984b:	8b c0                	mov    eax,eax
   14031984d:	ff c2                	inc    edx
   14031984f:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140319854:	0f 28 c1             	movaps xmm0,xmm1
   140319857:	f3 41 0f 11 4c c8 0c 	movss  DWORD PTR [r8+rcx*8+0xc],xmm1
   14031985e:	f3 0f 59 c4          	mulss  xmm0,xmm4
   140319862:	f3 0f 58 c2          	addss  xmm0,xmm2
   140319866:	0f 28 d0             	movaps xmm2,xmm0
   140319869:	0f 28 c3             	movaps xmm0,xmm3
   14031986c:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   140319871:	f3 41 0f 11 54 c8 08 	movss  DWORD PTR [r8+rcx*8+0x8],xmm2
   140319878:	0f 2f c2             	comiss xmm0,xmm2
   14031987b:	0f 87 4f ff ff ff    	ja     0x1403197d0
   140319881:	0f 28 74 24 30       	movaps xmm6,XMMWORD PTR [rsp+0x30]
   140319886:	0f 28 7c 24 20       	movaps xmm7,XMMWORD PTR [rsp+0x20]
   14031988b:	44 0f 28 44 24 10    	movaps xmm8,XMMWORD PTR [rsp+0x10]
   140319891:	44 0f 28 0c 24       	movaps xmm9,XMMWORD PTR [rsp]
   140319896:	8b c2                	mov    eax,edx
   140319898:	48 03 c0             	add    rax,rax
   14031989b:	33 c9                	xor    ecx,ecx
   14031989d:	49 89 0c c0          	mov    QWORD PTR [r8+rax*8],rcx
   1403198a1:	49 89 4c c0 08       	mov    QWORD PTR [r8+rax*8+0x8],rcx
   1403198a6:	48 83 c4 48          	add    rsp,0x48
   1403198aa:	c3                   	ret
   1403198ab:	cc                   	int3
   1403198ac:	cc                   	int3
   1403198ad:	cc                   	int3
   1403198ae:	cc                   	int3
   1403198af:	cc                   	int3
   1403198b0:	cc                   	int3
   1403198b1:	cc                   	int3
   1403198b2:	cc                   	int3
   1403198b3:	cc                   	int3
   1403198b4:	cc                   	int3
   1403198b5:	cc                   	int3
   1403198b6:	cc                   	int3
   1403198b7:	cc                   	int3
   1403198b8:	cc                   	int3
   1403198b9:	cc                   	int3
   1403198ba:	cc                   	int3
   1403198bb:	cc                   	int3
   1403198bc:	cc                   	int3
   1403198bd:	cc                   	int3
   1403198be:	cc                   	int3
   1403198bf:	cc                   	int3
   1403198c0:	80 f9 c0             	cmp    cl,0xc0
   1403198c3:	72 6e                	jb     0x140319933
   1403198c5:	0f b6 05 54 06 67 00 	movzx  eax,BYTE PTR [rip+0x670654]        # 0x140989f20
   1403198cc:	45 33 c0             	xor    r8d,r8d
   1403198cf:	84 c0                	test   al,al
   1403198d1:	74 60                	je     0x140319933
   1403198d3:	4c 8d 15 46 06 67 00 	lea    r10,[rip+0x670646]        # 0x140989f20
   1403198da:	4d 8b ca             	mov    r9,r10
   1403198dd:	0f 1f 00             	nop    DWORD PTR [rax]
   1403198e0:	3a c1                	cmp    al,cl
   1403198e2:	74 1b                	je     0x1403198ff
   1403198e4:	41 ff c0             	inc    r8d
   1403198e7:	41 8b c0             	mov    eax,r8d
   1403198ea:	48 c1 e0 04          	shl    rax,0x4
   1403198ee:	4e 8d 0c 10          	lea    r9,[rax+r10*1]
   1403198f2:	42 0f b6 04 10       	movzx  eax,BYTE PTR [rax+r10*1]
   1403198f7:	84 c0                	test   al,al
   1403198f9:	75 e5                	jne    0x1403198e0
   1403198fb:	0f 57 c0             	xorps  xmm0,xmm0
   1403198fe:	c3                   	ret
   1403198ff:	4d 85 c9             	test   r9,r9
   140319902:	74 2f                	je     0x140319933
   140319904:	f3 41 0f 10 59 08    	movss  xmm3,DWORD PTR [r9+0x8]
   14031990a:	8d 4a ff             	lea    ecx,[rdx-0x1]
   14031990d:	0f 28 c3             	movaps xmm0,xmm3
   140319910:	0f 57 c9             	xorps  xmm1,xmm1
   140319913:	f3 41 0f 5c 41 04    	subss  xmm0,DWORD PTR [r9+0x4]
   140319919:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   14031991e:	f3 41 0f 5e 41 0c    	divss  xmm0,DWORD PTR [r9+0xc]
   140319924:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140319928:	f3 41 0f 58 41 04    	addss  xmm0,DWORD PTR [r9+0x4]
   14031992e:	0f 2f d8             	comiss xmm3,xmm0
   140319931:	77 03                	ja     0x140319936
   140319933:	0f 57 c0             	xorps  xmm0,xmm0
   140319936:	c3                   	ret
   140319937:	cc                   	int3
   140319938:	cc                   	int3
   140319939:	cc                   	int3
   14031993a:	cc                   	int3
   14031993b:	cc                   	int3
   14031993c:	cc                   	int3
   14031993d:	cc                   	int3
   14031993e:	cc                   	int3
   14031993f:	cc                   	int3
