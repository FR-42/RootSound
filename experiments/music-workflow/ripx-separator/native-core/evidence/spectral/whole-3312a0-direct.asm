
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403312a0 <.text+0x3302a0>:
   1403312a0:	48 8b c4             	mov    rax,rsp
   1403312a3:	55                   	push   rbp
   1403312a4:	56                   	push   rsi
   1403312a5:	57                   	push   rdi
   1403312a6:	41 54                	push   r12
   1403312a8:	41 55                	push   r13
   1403312aa:	41 56                	push   r14
   1403312ac:	41 57                	push   r15
   1403312ae:	48 8d a8 98 fc ff ff 	lea    rbp,[rax-0x368]
   1403312b5:	48 81 ec 30 04 00 00 	sub    rsp,0x430
   1403312bc:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   1403312c0:	44 0f 29 a8 48 ff ff 	movaps XMMWORD PTR [rax-0xb8],xmm13
   1403312c7:	ff 
   1403312c8:	44 0f 29 b0 38 ff ff 	movaps XMMWORD PTR [rax-0xc8],xmm14
   1403312cf:	ff 
   1403312d0:	48 8b 05 91 0e 64 00 	mov    rax,QWORD PTR [rip+0x640e91]        # 0x140972168
   1403312d7:	48 33 c4             	xor    rax,rsp
   1403312da:	48 89 85 80 02 00 00 	mov    QWORD PTR [rbp+0x280],rax
   1403312e1:	0f b7 82 70 06 00 00 	movzx  eax,WORD PTR [rdx+0x670]
   1403312e8:	45 33 f6             	xor    r14d,r14d
   1403312eb:	66 44 89 4c 24 44    	mov    WORD PTR [rsp+0x44],r9w
   1403312f1:	45 0f b7 e9          	movzx  r13d,r9w
   1403312f5:	4c 89 44 24 60       	mov    QWORD PTR [rsp+0x60],r8
   1403312fa:	4d 8b e0             	mov    r12,r8
   1403312fd:	48 89 54 24 58       	mov    QWORD PTR [rsp+0x58],rdx
   140331302:	48 8b f2             	mov    rsi,rdx
   140331305:	48 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],rcx
   14033130a:	45 8b d6             	mov    r10d,r14d
   14033130d:	45 0f b7 ce          	movzx  r9d,r14w
   140331311:	66 44 3b f0          	cmp    r14w,ax
   140331315:	0f 83 8e 00 00 00    	jae    0x1403313a9
   14033131b:	f3 0f 10 0d bd 5e 36 	movss  xmm1,DWORD PTR [rip+0x365ebd]        # 0x1406971e0
   140331322:	00 
   140331323:	f3 0f 10 15 a5 67 37 	movss  xmm2,DWORD PTR [rip+0x3767a5]        # 0x1406a7ad0
   14033132a:	00 
   14033132b:	f3 0f 10 05 a1 67 37 	movss  xmm0,DWORD PTR [rip+0x3767a1]        # 0x1406a7ad4
   140331332:	00 
   140331333:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140331337:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033133e:	00 00 
   140331340:	48 8b 96 68 06 00 00 	mov    rdx,QWORD PTR [rsi+0x668]
   140331347:	41 0f b7 c1          	movzx  eax,r9w
   14033134b:	44 0f b7 04 42       	movzx  r8d,WORD PTR [rdx+rax*2]
   140331350:	49 69 c8 94 0d 00 00 	imul   rcx,r8,0xd94
   140331357:	48 03 8e 60 06 00 00 	add    rcx,QWORD PTR [rsi+0x660]
   14033135e:	45 85 d2             	test   r10d,r10d
   140331361:	74 0e                	je     0x140331371
   140331363:	41 0f b7 c1          	movzx  eax,r9w
   140331367:	41 2b c2             	sub    eax,r10d
   14033136a:	48 98                	cdqe
   14033136c:	66 44 89 04 42       	mov    WORD PTR [rdx+rax*2],r8w
   140331371:	8b 86 74 06 00 00    	mov    eax,DWORD PTR [rsi+0x674]
   140331377:	83 f8 0c             	cmp    eax,0xc
   14033137a:	72 05                	jb     0x140331381
   14033137c:	0f 2f 09             	comiss xmm1,DWORD PTR [rcx]
   14033137f:	77 14                	ja     0x140331395
   140331381:	83 f8 10             	cmp    eax,0x10
   140331384:	72 05                	jb     0x14033138b
   140331386:	0f 2f 11             	comiss xmm2,DWORD PTR [rcx]
   140331389:	77 0a                	ja     0x140331395
   14033138b:	83 f8 14             	cmp    eax,0x14
   14033138e:	72 08                	jb     0x140331398
   140331390:	0f 2f 01             	comiss xmm0,DWORD PTR [rcx]
   140331393:	76 03                	jbe    0x140331398
   140331395:	41 ff c2             	inc    r10d
   140331398:	0f b7 86 70 06 00 00 	movzx  eax,WORD PTR [rsi+0x670]
   14033139f:	66 41 ff c1          	inc    r9w
   1403313a3:	66 44 3b c8          	cmp    r9w,ax
   1403313a7:	72 97                	jb     0x140331340
   1403313a9:	66 41 2b c2          	sub    ax,r10w
   1403313ad:	48 89 9c 24 80 04 00 	mov    QWORD PTR [rsp+0x480],rbx
   1403313b4:	00 
   1403313b5:	66 89 86 70 06 00 00 	mov    WORD PTR [rsi+0x670],ax
   1403313bc:	41 0f b7 fe          	movzx  edi,r14w
   1403313c0:	45 0f 57 ed          	xorps  xmm13,xmm13
   1403313c4:	66 44 3b f0          	cmp    r14w,ax
   1403313c8:	0f 83 8f 00 00 00    	jae    0x14033145d
   1403313ce:	66 90                	xchg   ax,ax
   1403313d0:	48 8b 86 68 06 00 00 	mov    rax,QWORD PTR [rsi+0x668]
   1403313d7:	0f b7 cf             	movzx  ecx,di
   1403313da:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   1403313de:	48 69 d9 94 0d 00 00 	imul   rbx,rcx,0xd94
   1403313e5:	48 03 9e 60 06 00 00 	add    rbx,QWORD PTR [rsi+0x660]
   1403313ec:	f6 83 93 0d 00 00 01 	test   BYTE PTR [rbx+0xd93],0x1
   1403313f3:	74 55                	je     0x14033144a
   1403313f5:	80 bb 8c 0d 00 00 ff 	cmp    BYTE PTR [rbx+0xd8c],0xff
   1403313fc:	48 8b 86 80 06 00 00 	mov    rax,QWORD PTR [rsi+0x680]
   140331403:	8b 08                	mov    ecx,DWORD PTR [rax]
   140331405:	75 43                	jne    0x14033144a
   140331407:	f3 44 0f 11 6c 24 28 	movss  DWORD PTR [rsp+0x28],xmm13
   14033140e:	45 33 c9             	xor    r9d,r9d
   140331411:	89 4c 24 20          	mov    DWORD PTR [rsp+0x20],ecx
   140331415:	45 33 c0             	xor    r8d,r8d
   140331418:	48 8b ce             	mov    rcx,rsi
   14033141b:	48 8b d3             	mov    rdx,rbx
   14033141e:	e8 cd e9 fe ff       	call   0x14031fdf0
   140331423:	4c 8d 83 cc 0c 00 00 	lea    r8,[rbx+0xccc]
   14033142a:	f3 44 0f 11 6c 24 28 	movss  DWORD PTR [rsp+0x28],xmm13
   140331431:	45 33 c9             	xor    r9d,r9d
   140331434:	88 83 8c 0d 00 00    	mov    BYTE PTR [rbx+0xd8c],al
   14033143a:	48 8b d3             	mov    rdx,rbx
   14033143d:	44 89 74 24 20       	mov    DWORD PTR [rsp+0x20],r14d
   140331442:	48 8b ce             	mov    rcx,rsi
   140331445:	e8 a6 e9 fe ff       	call   0x14031fdf0
   14033144a:	0f b7 86 70 06 00 00 	movzx  eax,WORD PTR [rsi+0x670]
   140331451:	66 ff c7             	inc    di
   140331454:	66 3b f8             	cmp    di,ax
   140331457:	0f 82 73 ff ff ff    	jb     0x1403313d0
   14033145d:	f3 0f 10 35 77 eb 51 	movss  xmm6,DWORD PTR [rip+0x51eb77]        # 0x14084ffdc
   140331464:	00 
   140331465:	45 0f b7 fe          	movzx  r15d,r14w
   140331469:	f3 44 0f 10 35 be eb 	movss  xmm14,DWORD PTR [rip+0x51ebbe]        # 0x140850030
   140331470:	51 00 
   140331472:	41 b9 02 00 00 00    	mov    r9d,0x2
   140331478:	0f 29 bc 24 10 04 00 	movaps XMMWORD PTR [rsp+0x410],xmm7
   14033147f:	00 
   140331480:	44 0f 29 84 24 00 04 	movaps XMMWORD PTR [rsp+0x400],xmm8
   140331487:	00 00 
   140331489:	44 0f 29 8c 24 f0 03 	movaps XMMWORD PTR [rsp+0x3f0],xmm9
   140331490:	00 00 
   140331492:	44 0f 29 94 24 e0 03 	movaps XMMWORD PTR [rsp+0x3e0],xmm10
   140331499:	00 00 
   14033149b:	44 0f 29 9c 24 d0 03 	movaps XMMWORD PTR [rsp+0x3d0],xmm11
   1403314a2:	00 00 
   1403314a4:	44 0f 29 a4 24 c0 03 	movaps XMMWORD PTR [rsp+0x3c0],xmm12
   1403314ab:	00 00 
   1403314ad:	f3 0f 11 74 24 40    	movss  DWORD PTR [rsp+0x40],xmm6
   1403314b3:	66 44 89 74 24 48    	mov    WORD PTR [rsp+0x48],r14w
   1403314b9:	66 44 3b f0          	cmp    r14w,ax
   1403314bd:	0f 83 f1 03 00 00    	jae    0x1403318b4
   1403314c3:	44 8b a5 90 03 00 00 	mov    r12d,DWORD PTR [rbp+0x390]
   1403314ca:	ba 00 b8 ff ff       	mov    edx,0xffffb800
   1403314cf:	f3 44 0f 10 15 68 77 	movss  xmm10,DWORD PTR [rip+0x367768]        # 0x140698c40
   1403314d6:	36 00 
   1403314d8:	41 b8 00 48 00 00    	mov    r8d,0x4800
   1403314de:	f3 44 0f 10 1d 81 ed 	movss  xmm11,DWORD PTR [rip+0x51ed81]        # 0x140850268
   1403314e5:	51 00 
   1403314e7:	f2 0f 10 3d 91 cc 35 	movsd  xmm7,QWORD PTR [rip+0x35cc91]        # 0x14068e180
   1403314ee:	00 
   1403314ef:	f2 44 0f 10 05 38 cc 	movsd  xmm8,QWORD PTR [rip+0x35cc38]        # 0x14068e130
   1403314f6:	35 00 
   1403314f8:	f3 44 0f 10 0d af cc 	movss  xmm9,DWORD PTR [rip+0x35ccaf]        # 0x14068e1b0
   1403314ff:	35 00 
   140331501:	4c 8b 6c 24 50       	mov    r13,QWORD PTR [rsp+0x50]
   140331506:	eb 0e                	jmp    0x140331516
   140331508:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033150f:	00 
   140331510:	41 b9 02 00 00 00    	mov    r9d,0x2
   140331516:	48 8b 86 68 06 00 00 	mov    rax,QWORD PTR [rsi+0x668]
   14033151d:	41 0f b7 cf          	movzx  ecx,r15w
   140331521:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   140331525:	33 c0                	xor    eax,eax
   140331527:	4c 69 f1 94 0d 00 00 	imul   r14,rcx,0xd94
   14033152e:	8b f8                	mov    edi,eax
   140331530:	4c 03 b6 60 06 00 00 	add    r14,QWORD PTR [rsi+0x660]
   140331537:	41 0f b6 86 92 0d 00 	movzx  eax,BYTE PTR [r14+0xd92]
   14033153e:	00 
   14033153f:	84 c0                	test   al,al
   140331541:	0f 84 00 01 00 00    	je     0x140331647
   140331547:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   14033154c:	48 8d 74 24 70       	lea    rsi,[rsp+0x70]
   140331551:	4c 8b 7c 24 50       	mov    r15,QWORD PTR [rsp+0x50]
   140331556:	49 8d 5e 1c          	lea    rbx,[r14+0x1c]
   14033155a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140331560:	41 80 bf 92 00 00 00 	cmp    BYTE PTR [r15+0x92],0x0
   140331567:	00 
   140331568:	0f 84 a6 00 00 00    	je     0x140331614
   14033156e:	f3 41 0f 10 4e 04    	movss  xmm1,DWORD PTR [r14+0x4]
   140331574:	8d 47 01             	lea    eax,[rdi+0x1]
   140331577:	41 0f 2f cd          	comiss xmm1,xmm13
   14033157b:	66 0f 6e d8          	movd   xmm3,eax
   14033157f:	0f 5b db             	cvtdq2ps xmm3,xmm3
   140331582:	0f 28 c3             	movaps xmm0,xmm3
   140331585:	f3 41 0f 59 06       	mulss  xmm0,DWORD PTR [r14]
   14033158a:	76 18                	jbe    0x1403315a4
   14033158c:	f3 0f 59 db          	mulss  xmm3,xmm3
   140331590:	f3 41 0f 5c de       	subss  xmm3,xmm14
   140331595:	f3 0f 59 d9          	mulss  xmm3,xmm1
   140331599:	f3 41 0f 58 de       	addss  xmm3,xmm14
   14033159e:	f3 0f 59 d8          	mulss  xmm3,xmm0
   1403315a2:	eb 03                	jmp    0x1403315a7
   1403315a4:	0f 28 d8             	movaps xmm3,xmm0
   1403315a7:	32 c0                	xor    al,al
   1403315a9:	83 3d f8 83 60 00 03 	cmp    DWORD PTR [rip+0x6083f8],0x3        # 0x1409399a8
   1403315b0:	72 1c                	jb     0x1403315ce
   1403315b2:	41 0f b7 8e 90 0d 00 	movzx  ecx,WORD PTR [r14+0xd90]
   1403315b9:	00 
   1403315ba:	66 3b ca             	cmp    cx,dx
   1403315bd:	7d 04                	jge    0x1403315c3
   1403315bf:	b0 01                	mov    al,0x1
   1403315c1:	eb 0b                	jmp    0x1403315ce
   1403315c3:	66 41 3b c8          	cmp    cx,r8w
   1403315c7:	0f b6 c0             	movzx  eax,al
   1403315ca:	41 0f 4f c1          	cmovg  eax,r9d
   1403315ce:	f3 0f 10 33          	movss  xmm6,DWORD PTR [rbx]
   1403315d2:	45 8b c4             	mov    r8d,r12d
   1403315d5:	c6 44 24 30 40       	mov    BYTE PTR [rsp+0x30],0x40
   1403315da:	49 8b d5             	mov    rdx,r13
   1403315dd:	c6 44 24 28 ff       	mov    BYTE PTR [rsp+0x28],0xff
   1403315e2:	49 8b cf             	mov    rcx,r15
   1403315e5:	88 44 24 20          	mov    BYTE PTR [rsp+0x20],al
   1403315e9:	e8 c2 67 01 00       	call   0x140347db0
   1403315ee:	f3 41 0f 59 c2       	mulss  xmm0,xmm10
   1403315f3:	f3 0f 5c f0          	subss  xmm6,xmm0
   1403315f7:	41 0f 2f f5          	comiss xmm6,xmm13
   1403315fb:	77 04                	ja     0x140331601
   1403315fd:	41 0f 28 f5          	movaps xmm6,xmm13
   140331601:	ba 00 b8 ff ff       	mov    edx,0xffffb800
   140331606:	41 b8 00 48 00 00    	mov    r8d,0x4800
   14033160c:	41 b9 02 00 00 00    	mov    r9d,0x2
   140331612:	eb 04                	jmp    0x140331618
   140331614:	f3 0f 10 33          	movss  xmm6,DWORD PTR [rbx]
   140331618:	f3 0f 11 36          	movss  DWORD PTR [rsi],xmm6
   14033161c:	ff c7                	inc    edi
   14033161e:	41 0f b6 86 92 0d 00 	movzx  eax,BYTE PTR [r14+0xd92]
   140331625:	00 
   140331626:	48 83 c6 04          	add    rsi,0x4
   14033162a:	48 83 c3 20          	add    rbx,0x20
   14033162e:	3b f8                	cmp    edi,eax
   140331630:	0f 8c 2a ff ff ff    	jl     0x140331560
   140331636:	f3 0f 10 74 24 40    	movss  xmm6,DWORD PTR [rsp+0x40]
   14033163c:	44 0f b7 7c 24 48    	movzx  r15d,WORD PTR [rsp+0x48]
   140331642:	4c 8b 6c 24 50       	mov    r13,QWORD PTR [rsp+0x50]
   140331647:	f3 41 0f 10 06       	movss  xmm0,DWORD PTR [r14]
   14033164c:	4c 8d 85 b0 01 00 00 	lea    r8,[rbp+0x1b0]
   140331653:	44 0f b6 c8          	movzx  r9d,al
   140331657:	48 8d 54 24 70       	lea    rdx,[rsp+0x70]
   14033165c:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   140331661:	49 8b cd             	mov    rcx,r13
   140331664:	f3 0f 11 44 24 20    	movss  DWORD PTR [rsp+0x20],xmm0
   14033166a:	e8 b1 93 fe ff       	call   0x14031aa20
   14033166f:	45 0f b6 86 92 0d 00 	movzx  r8d,BYTE PTR [r14+0xd92]
   140331676:	00 
   140331677:	f3 44 0f 10 64 24 70 	movss  xmm12,DWORD PTR [rsp+0x70]
   14033167e:	f3 44 0f 11 a5 f0 00 	movss  DWORD PTR [rbp+0xf0],xmm12
   140331685:	00 00 
   140331687:	41 83 f8 01          	cmp    r8d,0x1
   14033168b:	0f 86 13 01 00 00    	jbe    0x1403317a4
   140331691:	b9 02 00 00 00       	mov    ecx,0x2
   140331696:	44 3b c1             	cmp    r8d,ecx
   140331699:	0f 86 97 00 00 00    	jbe    0x140331736
   14033169f:	8d 51 02             	lea    edx,[rcx+0x2]
   1403316a2:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403316a6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   1403316ad:	00 00 00 
   1403316b0:	f3 0f 10 44 8c 68    	movss  xmm0,DWORD PTR [rsp+rcx*4+0x68]
   1403316b6:	f3 0f 10 4c 8c 6c    	movss  xmm1,DWORD PTR [rsp+rcx*4+0x6c]
   1403316bc:	0f 2f c8             	comiss xmm1,xmm0
   1403316bf:	77 03                	ja     0x1403316c4
   1403316c1:	0f 28 c8             	movaps xmm1,xmm0
   1403316c4:	8d 42 ff             	lea    eax,[rdx-0x1]
   1403316c7:	41 3b c0             	cmp    eax,r8d
   1403316ca:	7d 1b                	jge    0x1403316e7
   1403316cc:	f3 0f 10 44 8c 74    	movss  xmm0,DWORD PTR [rsp+rcx*4+0x74]
   1403316d2:	41 3b d0             	cmp    edx,r8d
   1403316d5:	7d 14                	jge    0x1403316eb
   1403316d7:	f3 0f 10 54 8c 78    	movss  xmm2,DWORD PTR [rsp+rcx*4+0x78]
   1403316dd:	0f 2f d0             	comiss xmm2,xmm0
   1403316e0:	76 09                	jbe    0x1403316eb
   1403316e2:	0f 28 c2             	movaps xmm0,xmm2
   1403316e5:	eb 04                	jmp    0x1403316eb
   1403316e7:	41 0f 28 c5          	movaps xmm0,xmm13
   1403316eb:	41 0f 2f cc          	comiss xmm1,xmm12
   1403316ef:	76 04                	jbe    0x1403316f5
   1403316f1:	41 0f 28 cc          	movaps xmm1,xmm12
   1403316f5:	41 0f 2f c4          	comiss xmm0,xmm12
   1403316f9:	76 04                	jbe    0x1403316ff
   1403316fb:	41 0f 28 c4          	movaps xmm0,xmm12
   1403316ff:	f3 0f 58 c1          	addss  xmm0,xmm1
   140331703:	f3 0f 59 c6          	mulss  xmm0,xmm6
   140331707:	0f 2f c1             	comiss xmm0,xmm1
   14033170a:	77 03                	ja     0x14033170f
   14033170c:	0f 28 c1             	movaps xmm0,xmm1
   14033170f:	f3 0f 10 4c 8c 70    	movss  xmm1,DWORD PTR [rsp+rcx*4+0x70]
   140331715:	0f 2f c8             	comiss xmm1,xmm0
   140331718:	77 03                	ja     0x14033171d
   14033171a:	0f 28 c1             	movaps xmm0,xmm1
   14033171d:	f3 0f 11 84 8d f0 00 	movss  DWORD PTR [rbp+rcx*4+0xf0],xmm0
   140331724:	00 00 
   140331726:	83 c2 02             	add    edx,0x2
   140331729:	48 83 c1 02          	add    rcx,0x2
   14033172d:	49 3b c8             	cmp    rcx,r8
   140331730:	0f 8c 7a ff ff ff    	jl     0x1403316b0
   140331736:	b8 01 00 00 00       	mov    eax,0x1
   14033173b:	44 3b c0             	cmp    r8d,eax
   14033173e:	76 64                	jbe    0x1403317a4
   140331740:	41 0f 28 dc          	movaps xmm3,xmm12
   140331744:	b9 02 00 00 00       	mov    ecx,0x2
   140331749:	f3 41 0f 59 db       	mulss  xmm3,xmm11
   14033174e:	66 90                	xchg   ax,ax
   140331750:	41 3b c8             	cmp    ecx,r8d
   140331753:	7d 08                	jge    0x14033175d
   140331755:	f3 0f 10 54 84 74    	movss  xmm2,DWORD PTR [rsp+rax*4+0x74]
   14033175b:	eb 04                	jmp    0x140331761
   14033175d:	41 0f 28 d5          	movaps xmm2,xmm13
   140331761:	0f 28 cb             	movaps xmm1,xmm3
   140331764:	0f 28 c3             	movaps xmm0,xmm3
   140331767:	f3 0f 5d 4c 84 6c    	minss  xmm1,DWORD PTR [rsp+rax*4+0x6c]
   14033176d:	f3 0f 5d c2          	minss  xmm0,xmm2
   140331771:	f3 0f 58 c1          	addss  xmm0,xmm1
   140331775:	f3 0f 59 c6          	mulss  xmm0,xmm6
   140331779:	0f 2f c1             	comiss xmm0,xmm1
   14033177c:	77 03                	ja     0x140331781
   14033177e:	0f 28 c1             	movaps xmm0,xmm1
   140331781:	f3 0f 10 4c 84 70    	movss  xmm1,DWORD PTR [rsp+rax*4+0x70]
   140331787:	0f 2f c8             	comiss xmm1,xmm0
   14033178a:	77 03                	ja     0x14033178f
   14033178c:	0f 28 c1             	movaps xmm0,xmm1
   14033178f:	f3 0f 11 84 85 f0 00 	movss  DWORD PTR [rbp+rax*4+0xf0],xmm0
   140331796:	00 00 
   140331798:	83 c1 02             	add    ecx,0x2
   14033179b:	48 83 c0 02          	add    rax,0x2
   14033179f:	49 3b c0             	cmp    rax,r8
   1403317a2:	7c ac                	jl     0x140331750
   1403317a4:	45 33 c9             	xor    r9d,r9d
   1403317a7:	41 8b f1             	mov    esi,r9d
   1403317aa:	45 84 c0             	test   r8b,r8b
   1403317ad:	74 75                	je     0x140331824
   1403317af:	49 8d 5e 24          	lea    rbx,[r14+0x24]
   1403317b3:	41 8b f9             	mov    edi,r9d
   1403317b6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   1403317bd:	00 00 00 
   1403317c0:	8b 84 3d b0 01 00 00 	mov    eax,DWORD PTR [rbp+rdi*1+0x1b0]
   1403317c7:	f3 0f 10 44 3c 70    	movss  xmm0,DWORD PTR [rsp+rdi*1+0x70]
   1403317cd:	44 0f 2f e8          	comiss xmm13,xmm0
   1403317d1:	89 43 f0             	mov    DWORD PTR [rbx-0x10],eax
   1403317d4:	8b 84 3d f0 00 00 00 	mov    eax,DWORD PTR [rbp+rdi*1+0xf0]
   1403317db:	89 03                	mov    DWORD PTR [rbx],eax
   1403317dd:	44 89 4b 04          	mov    DWORD PTR [rbx+0x4],r9d
   1403317e1:	72 06                	jb     0x1403317e9
   1403317e3:	41 0f 28 c5          	movaps xmm0,xmm13
   1403317e7:	eb 1c                	jmp    0x140331805
   1403317e9:	0f 5a c0             	cvtps2pd xmm0,xmm0
   1403317ec:	41 0f 28 c8          	movaps xmm1,xmm8
   1403317f0:	f2 0f 5e c7          	divsd  xmm0,xmm7
   1403317f4:	e8 81 f5 2e 00       	call   0x140620d7a
   1403317f9:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   1403317fd:	45 33 c9             	xor    r9d,r9d
   140331800:	f3 41 0f 59 c1       	mulss  xmm0,xmm9
   140331805:	f3 0f 11 43 fc       	movss  DWORD PTR [rbx-0x4],xmm0
   14033180a:	ff c6                	inc    esi
   14033180c:	41 0f b6 86 92 0d 00 	movzx  eax,BYTE PTR [r14+0xd92]
   140331813:	00 
   140331814:	48 83 c3 20          	add    rbx,0x20
   140331818:	48 83 c7 04          	add    rdi,0x4
   14033181c:	3b f0                	cmp    esi,eax
   14033181e:	7c a0                	jl     0x1403317c0
   140331820:	44 0f b6 c0          	movzx  r8d,al
   140331824:	41 0f b6 d0          	movzx  edx,r8b
   140331828:	83 fa 30             	cmp    edx,0x30
   14033182b:	73 38                	jae    0x140331865
   14033182d:	8b c2                	mov    eax,edx
   14033182f:	49 8d 4e 14          	lea    rcx,[r14+0x14]
   140331833:	48 c1 e0 05          	shl    rax,0x5
   140331837:	48 03 c8             	add    rcx,rax
   14033183a:	b8 30 00 00 00       	mov    eax,0x30
   14033183f:	2b c2                	sub    eax,edx
   140331841:	8b d0                	mov    edx,eax
   140331843:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140331847:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033184e:	00 00 
   140331850:	48 c7 41 10 00 00 00 	mov    QWORD PTR [rcx+0x10],0x0
   140331857:	00 
   140331858:	44 89 09             	mov    DWORD PTR [rcx],r9d
   14033185b:	48 8d 49 20          	lea    rcx,[rcx+0x20]
   14033185f:	48 83 ea 01          	sub    rdx,0x1
   140331863:	75 eb                	jne    0x140331850
   140331865:	49 8d 8e 0c 06 00 00 	lea    rcx,[r14+0x60c]
   14033186c:	33 d2                	xor    edx,edx
   14033186e:	41 b8 c0 00 00 00    	mov    r8d,0xc0
   140331874:	e8 71 f4 2e 00       	call   0x140620cea
   140331879:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   14033187e:	66 41 ff c7          	inc    r15w
   140331882:	66 44 89 7c 24 48    	mov    WORD PTR [rsp+0x48],r15w
   140331888:	ba 00 b8 ff ff       	mov    edx,0xffffb800
   14033188d:	41 b8 00 48 00 00    	mov    r8d,0x4800
   140331893:	0f b7 86 70 06 00 00 	movzx  eax,WORD PTR [rsi+0x670]
   14033189a:	66 44 3b f8          	cmp    r15w,ax
   14033189e:	0f 82 6c fc ff ff    	jb     0x140331510
   1403318a4:	44 0f b7 6c 24 44    	movzx  r13d,WORD PTR [rsp+0x44]
   1403318aa:	45 33 f6             	xor    r14d,r14d
   1403318ad:	4c 8b 64 24 60       	mov    r12,QWORD PTR [rsp+0x60]
   1403318b2:	eb 07                	jmp    0x1403318bb
   1403318b4:	f3 44 0f 10 64 24 70 	movss  xmm12,DWORD PTR [rsp+0x70]
   1403318bb:	45 0f b7 c6          	movzx  r8d,r14w
   1403318bf:	66 44 3b f0          	cmp    r14w,ax
   1403318c3:	73 5f                	jae    0x140331924
   1403318c5:	41 0f b7 c0          	movzx  eax,r8w
   1403318c9:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   1403318d0:	48 03 8e 60 06 00 00 	add    rcx,QWORD PTR [rsi+0x660]
   1403318d7:	f6 81 93 0d 00 00 01 	test   BYTE PTR [rcx+0xd93],0x1
   1403318de:	74 33                	je     0x140331913
   1403318e0:	0f b6 91 92 0d 00 00 	movzx  edx,BYTE PTR [rcx+0xd92]
   1403318e7:	44 89 71 08          	mov    DWORD PTR [rcx+0x8],r14d
   1403318eb:	84 d2                	test   dl,dl
   1403318ed:	74 24                	je     0x140331913
   1403318ef:	41 0f 28 c5          	movaps xmm0,xmm13
   1403318f3:	0f b6 d2             	movzx  edx,dl
   1403318f6:	48 8d 41 14          	lea    rax,[rcx+0x14]
   1403318fa:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140331900:	f3 0f 58 00          	addss  xmm0,DWORD PTR [rax]
   140331904:	48 83 c0 20          	add    rax,0x20
   140331908:	f3 0f 11 41 08       	movss  DWORD PTR [rcx+0x8],xmm0
   14033190d:	48 83 ea 01          	sub    rdx,0x1
   140331911:	75 ed                	jne    0x140331900
   140331913:	0f b7 86 70 06 00 00 	movzx  eax,WORD PTR [rsi+0x670]
   14033191a:	66 41 ff c0          	inc    r8w
   14033191e:	66 44 3b c0          	cmp    r8w,ax
   140331922:	72 a1                	jb     0x1403318c5
   140331924:	66 83 f8 01          	cmp    ax,0x1
   140331928:	76 2a                	jbe    0x140331954
   14033192a:	4c 8b 8e 40 06 00 00 	mov    r9,QWORD PTR [rsi+0x640]
   140331931:	48 8b 96 60 06 00 00 	mov    rdx,QWORD PTR [rsi+0x660]
   140331938:	48 8b 8e 68 06 00 00 	mov    rcx,QWORD PTR [rsi+0x668]
   14033193f:	44 0f b7 c0          	movzx  r8d,ax
   140331943:	48 8b 86 48 06 00 00 	mov    rax,QWORD PTR [rsi+0x648]
   14033194a:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14033194f:	e8 0c d7 fe ff       	call   0x14031f060
   140331954:	48 8b ce             	mov    rcx,rsi
   140331957:	e8 94 d2 ff ff       	call   0x14032ebf0
   14033195c:	0f b7 86 70 06 00 00 	movzx  eax,WORD PTR [rsi+0x670]
   140331963:	66 83 f8 01          	cmp    ax,0x1
   140331967:	0f 86 48 01 00 00    	jbe    0x140331ab5
   14033196d:	48 8b 4c 24 58       	mov    rcx,QWORD PTR [rsp+0x58]
   140331972:	49 8b de             	mov    rbx,r14
   140331975:	48 8b b6 48 06 00 00 	mov    rsi,QWORD PTR [rsi+0x648]
   14033197c:	0f b7 c0             	movzx  eax,ax
   14033197f:	4c 8b b9 40 06 00 00 	mov    r15,QWORD PTR [rcx+0x640]
   140331986:	4c 8b 91 60 06 00 00 	mov    r10,QWORD PTR [rcx+0x660]
   14033198d:	4c 8b 89 68 06 00 00 	mov    r9,QWORD PTR [rcx+0x668]
   140331994:	45 89 37             	mov    DWORD PTR [r15],r14d
   140331997:	89 06                	mov    DWORD PTR [rsi],eax
   140331999:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   1403319a0:	8b 04 9e             	mov    eax,DWORD PTR [rsi+rbx*4]
   1403319a3:	4d 63 1c 9f          	movsxd r11,DWORD PTR [r15+rbx*4]
   1403319a7:	ff c8                	dec    eax
   1403319a9:	44 3b d8             	cmp    r11d,eax
   1403319ac:	0f 8d eb 00 00 00    	jge    0x140331a9d
   1403319b2:	47 0f b7 34 59       	movzx  r14d,WORD PTR [r9+r11*2]
   1403319b7:	49 8b d3             	mov    rdx,r11
   1403319ba:	4c 63 c0             	movsxd r8,eax
   1403319bd:	4d 3b d8             	cmp    r11,r8
   1403319c0:	0f 8d b4 00 00 00    	jge    0x140331a7a
   1403319c6:	41 0f b7 c6          	movzx  eax,r14w
   1403319ca:	48 69 f8 94 0d 00 00 	imul   rdi,rax,0xd94
   1403319d1:	43 0f b7 04 41       	movzx  eax,WORD PTR [r9+r8*2]
   1403319d6:	f3 42 0f 10 0c 17    	movss  xmm1,DWORD PTR [rdi+r10*1]
   1403319dc:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   1403319e3:	f3 42 0f 10 04 11    	movss  xmm0,DWORD PTR [rcx+r10*1]
   1403319e9:	0f 2f c1             	comiss xmm0,xmm1
   1403319ec:	72 22                	jb     0x140331a10
   1403319ee:	66 90                	xchg   ax,ax
   1403319f0:	49 3b d0             	cmp    rdx,r8
   1403319f3:	7d 30                	jge    0x140331a25
   1403319f5:	43 0f b7 44 41 fe    	movzx  eax,WORD PTR [r9+r8*2-0x2]
   1403319fb:	49 ff c8             	dec    r8
   1403319fe:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   140331a05:	f3 42 0f 10 04 11    	movss  xmm0,DWORD PTR [rcx+r10*1]
   140331a0b:	0f 2f c1             	comiss xmm0,xmm1
   140331a0e:	73 e0                	jae    0x1403319f0
   140331a10:	49 3b d0             	cmp    rdx,r8
   140331a13:	7d 10                	jge    0x140331a25
   140331a15:	43 0f b7 04 41       	movzx  eax,WORD PTR [r9+r8*2]
   140331a1a:	41 ff c3             	inc    r11d
   140331a1d:	66 41 89 04 51       	mov    WORD PTR [r9+rdx*2],ax
   140331a22:	48 ff c2             	inc    rdx
   140331a25:	41 0f b7 04 51       	movzx  eax,WORD PTR [r9+rdx*2]
   140331a2a:	f3 42 0f 10 04 17    	movss  xmm0,DWORD PTR [rdi+r10*1]
   140331a30:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   140331a37:	42 0f 2f 04 11       	comiss xmm0,DWORD PTR [rcx+r10*1]
   140331a3c:	72 21                	jb     0x140331a5f
   140331a3e:	66 90                	xchg   ax,ax
   140331a40:	49 3b d0             	cmp    rdx,r8
   140331a43:	7d 35                	jge    0x140331a7a
   140331a45:	41 0f b7 44 51 02    	movzx  eax,WORD PTR [r9+rdx*2+0x2]
   140331a4b:	48 ff c2             	inc    rdx
   140331a4e:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   140331a55:	41 ff c3             	inc    r11d
   140331a58:	42 0f 2f 04 11       	comiss xmm0,DWORD PTR [rcx+r10*1]
   140331a5d:	73 e1                	jae    0x140331a40
   140331a5f:	49 3b d0             	cmp    rdx,r8
   140331a62:	7d 16                	jge    0x140331a7a
   140331a64:	41 0f b7 04 51       	movzx  eax,WORD PTR [r9+rdx*2]
   140331a69:	66 43 89 04 41       	mov    WORD PTR [r9+r8*2],ax
   140331a6e:	49 ff c8             	dec    r8
   140331a71:	49 3b d0             	cmp    rdx,r8
   140331a74:	0f 8c 57 ff ff ff    	jl     0x1403319d1
   140331a7a:	49 63 c3             	movsxd rax,r11d
   140331a7d:	66 45 89 34 41       	mov    WORD PTR [r9+rax*2],r14w
   140331a82:	41 8d 43 01          	lea    eax,[r11+0x1]
   140331a86:	41 89 44 9f 04       	mov    DWORD PTR [r15+rbx*4+0x4],eax
   140331a8b:	8b 04 9e             	mov    eax,DWORD PTR [rsi+rbx*4]
   140331a8e:	89 44 9e 04          	mov    DWORD PTR [rsi+rbx*4+0x4],eax
   140331a92:	b8 01 00 00 00       	mov    eax,0x1
   140331a97:	44 89 1c 9e          	mov    DWORD PTR [rsi+rbx*4],r11d
   140331a9b:	eb 07                	jmp    0x140331aa4
   140331a9d:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   140331aa4:	48 03 d8             	add    rbx,rax
   140331aa7:	0f 89 f3 fe ff ff    	jns    0x1403319a0
   140331aad:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140331ab2:	45 33 f6             	xor    r14d,r14d
   140331ab5:	45 0f b7 c5          	movzx  r8d,r13w
   140331ab9:	49 8b d4             	mov    rdx,r12
   140331abc:	48 8b ce             	mov    rcx,rsi
   140331abf:	e8 6c e4 ff ff       	call   0x14032ff30
   140331ac4:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   140331ac9:	80 b8 90 00 00 00 00 	cmp    BYTE PTR [rax+0x90],0x0
   140331ad0:	75 27                	jne    0x140331af9
   140331ad2:	80 b8 91 00 00 00 00 	cmp    BYTE PTR [rax+0x91],0x0
   140331ad9:	75 07                	jne    0x140331ae2
   140331adb:	66 41 83 fd 18       	cmp    r13w,0x18
   140331ae0:	76 17                	jbe    0x140331af9
   140331ae2:	45 0f b7 cd          	movzx  r9d,r13w
   140331ae6:	4d 8b c4             	mov    r8,r12
   140331ae9:	48 8b d6             	mov    rdx,rsi
   140331aec:	48 8b c8             	mov    rcx,rax
   140331aef:	4c 8b e8             	mov    r13,rax
   140331af2:	e8 b9 d2 ff ff       	call   0x14032edb0
   140331af7:	eb 03                	jmp    0x140331afc
   140331af9:	4c 8b e8             	mov    r13,rax
   140331afc:	41 8b 95 b0 00 00 00 	mov    edx,DWORD PTR [r13+0xb0]
   140331b03:	85 d2                	test   edx,edx
   140331b05:	74 51                	je     0x140331b58
   140331b07:	45 8b 85 b4 00 00 00 	mov    r8d,DWORD PTR [r13+0xb4]
   140331b0e:	48 8d 8d 70 02 00 00 	lea    rcx,[rbp+0x270]
   140331b15:	45 33 c9             	xor    r9d,r9d
   140331b18:	e8 53 19 fd ff       	call   0x140303470
   140331b1d:	41 80 bd 94 00 00 00 	cmp    BYTE PTR [r13+0x94],0x0
   140331b24:	00 
   140331b25:	75 0a                	jne    0x140331b31
   140331b27:	41 80 bd 99 00 00 00 	cmp    BYTE PTR [r13+0x99],0x0
   140331b2e:	00 
   140331b2f:	74 07                	je     0x140331b38
   140331b31:	f3 44 0f 11 6c 24 40 	movss  DWORD PTR [rsp+0x40],xmm13
   140331b38:	41 8b 85 b0 00 00 00 	mov    eax,DWORD PTR [r13+0xb0]
   140331b3f:	83 e8 0f             	sub    eax,0xf
   140331b42:	83 f8 01             	cmp    eax,0x1
   140331b45:	76 06                	jbe    0x140331b4d
   140331b47:	45 0f 28 ce          	movaps xmm9,xmm14
   140331b4b:	eb 1e                	jmp    0x140331b6b
   140331b4d:	f3 44 0f 10 0d 16 56 	movss  xmm9,DWORD PTR [rip+0x365616]        # 0x14069716c
   140331b54:	36 00 
   140331b56:	eb 13                	jmp    0x140331b6b
   140331b58:	f3 0f 10 44 24 40    	movss  xmm0,DWORD PTR [rsp+0x40]
   140331b5e:	f3 0f 11 44 24 40    	movss  DWORD PTR [rsp+0x40],xmm0
   140331b64:	f3 44 0f 10 4c 24 40 	movss  xmm9,DWORD PTR [rsp+0x40]
   140331b6b:	45 8b bd 50 03 00 00 	mov    r15d,DWORD PTR [r13+0x350]
   140331b72:	33 c0                	xor    eax,eax
   140331b74:	41 83 e7 1e          	and    r15d,0x1e
   140331b78:	f3 44 0f 11 4c 24 44 	movss  DWORD PTR [rsp+0x44],xmm9
   140331b7f:	44 89 7c 24 48       	mov    DWORD PTR [rsp+0x48],r15d
   140331b84:	66 3b 86 70 06 00 00 	cmp    ax,WORD PTR [rsi+0x670]
   140331b8b:	0f 83 b2 06 00 00    	jae    0x140332243
   140331b91:	f3 44 0f 10 05 be c5 	movss  xmm8,DWORD PTR [rip+0x35c5be]        # 0x14068e158
   140331b98:	35 00 
   140331b9a:	8d 78 f6             	lea    edi,[rax-0xa]
   140331b9d:	f3 44 0f 10 35 4e c5 	movss  xmm14,DWORD PTR [rip+0x35c54e]        # 0x14068e0f4
   140331ba4:	35 00 
   140331ba6:	4c 8d 25 53 e4 cc ff 	lea    r12,[rip+0xffffffffffcce453]        # 0x140000000
   140331bad:	f3 0f 10 3d 2f c5 35 	movss  xmm7,DWORD PTR [rip+0x35c52f]        # 0x14068e0e4
   140331bb4:	00 
   140331bb5:	f2 44 0f 10 15 8a c5 	movsd  xmm10,QWORD PTR [rip+0x35c58a]        # 0x14068e148
   140331bbc:	35 00 
   140331bbe:	f2 44 0f 10 1d 41 e6 	movsd  xmm11,QWORD PTR [rip+0x51e641]        # 0x140850208
   140331bc5:	51 00 
   140331bc7:	44 0f 29 bc 24 90 03 	movaps XMMWORD PTR [rsp+0x390],xmm15
   140331bce:	00 00 
   140331bd0:	f3 44 0f 10 3d d3 e3 	movss  xmm15,DWORD PTR [rip+0x51e3d3]        # 0x14084ffac
   140331bd7:	51 00 
   140331bd9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140331be0:	48 8b 86 68 06 00 00 	mov    rax,QWORD PTR [rsi+0x668]
   140331be7:	41 0f b7 ce          	movzx  ecx,r14w
   140331beb:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   140331bef:	48 8b 44 24 58       	mov    rax,QWORD PTR [rsp+0x58]
   140331bf4:	48 69 f1 94 0d 00 00 	imul   rsi,rcx,0xd94
   140331bfb:	48 03 b0 60 06 00 00 	add    rsi,QWORD PTR [rax+0x660]
   140331c02:	41 80 bd 92 00 00 00 	cmp    BYTE PTR [r13+0x92],0x0
   140331c09:	00 
   140331c0a:	75 7b                	jne    0x140331c87
   140331c0c:	41 80 bd 93 00 00 00 	cmp    BYTE PTR [r13+0x93],0x0
   140331c13:	00 
   140331c14:	75 71                	jne    0x140331c87
   140331c16:	ba 03 00 00 00       	mov    edx,0x3
   140331c1b:	38 96 92 0d 00 00    	cmp    BYTE PTR [rsi+0xd92],dl
   140331c21:	76 64                	jbe    0x140331c87
   140331c23:	48 8d 4e 7c          	lea    rcx,[rsi+0x7c]
   140331c27:	85 d2                	test   edx,edx
   140331c29:	7e 4b                	jle    0x140331c76
   140331c2b:	f3 0f 10 49 f8       	movss  xmm1,DWORD PTR [rcx-0x8]
   140331c30:	f3 0f 10 41 d8       	movss  xmm0,DWORD PTR [rcx-0x28]
   140331c35:	0f 2f c1             	comiss xmm0,xmm1
   140331c38:	77 03                	ja     0x140331c3d
   140331c3a:	0f 28 c1             	movaps xmm0,xmm1
   140331c3d:	f3 0f 10 09          	movss  xmm1,DWORD PTR [rcx]
   140331c41:	0f 2f c8             	comiss xmm1,xmm0
   140331c44:	77 03                	ja     0x140331c49
   140331c46:	0f 28 c1             	movaps xmm0,xmm1
   140331c49:	f3 0f 11 41 f8       	movss  DWORD PTR [rcx-0x8],xmm0
   140331c4e:	83 fa 02             	cmp    edx,0x2
   140331c51:	7e 23                	jle    0x140331c76
   140331c53:	f6 c2 01             	test   dl,0x1
   140331c56:	75 1e                	jne    0x140331c76
   140331c58:	f3 0f 10 49 b8       	movss  xmm1,DWORD PTR [rcx-0x48]
   140331c5d:	0f 2f c8             	comiss xmm1,xmm0
   140331c60:	77 03                	ja     0x140331c65
   140331c62:	0f 28 c8             	movaps xmm1,xmm0
   140331c65:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   140331c69:	0f 2f c1             	comiss xmm0,xmm1
   140331c6c:	77 03                	ja     0x140331c71
   140331c6e:	0f 28 c8             	movaps xmm1,xmm0
   140331c71:	f3 0f 11 49 f8       	movss  DWORD PTR [rcx-0x8],xmm1
   140331c76:	0f b6 86 92 0d 00 00 	movzx  eax,BYTE PTR [rsi+0xd92]
   140331c7d:	ff c2                	inc    edx
   140331c7f:	48 83 c1 20          	add    rcx,0x20
   140331c83:	3b d0                	cmp    edx,eax
   140331c85:	7c a0                	jl     0x140331c27
   140331c87:	44 0f b6 8e 92 0d 00 	movzx  r9d,BYTE PTR [rsi+0xd92]
   140331c8e:	00 
   140331c8f:	45 85 c9             	test   r9d,r9d
   140331c92:	74 25                	je     0x140331cb9
   140331c94:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   140331c99:	45 8b c1             	mov    r8d,r9d
   140331c9c:	48 8d 56 1c          	lea    rdx,[rsi+0x1c]
   140331ca0:	8b 02                	mov    eax,DWORD PTR [rdx]
   140331ca2:	48 83 c2 20          	add    rdx,0x20
   140331ca6:	89 01                	mov    DWORD PTR [rcx],eax
   140331ca8:	48 8d 49 04          	lea    rcx,[rcx+0x4]
   140331cac:	49 83 e8 01          	sub    r8,0x1
   140331cb0:	75 ee                	jne    0x140331ca0
   140331cb2:	f3 44 0f 10 64 24 70 	movss  xmm12,DWORD PTR [rsp+0x70]
   140331cb9:	41 80 bd 99 00 00 00 	cmp    BYTE PTR [r13+0x99],0x0
   140331cc0:	00 
   140331cc1:	75 49                	jne    0x140331d0c
   140331cc3:	41 80 bd 95 00 00 00 	cmp    BYTE PTR [r13+0x95],0x0
   140331cca:	00 
   140331ccb:	75 3f                	jne    0x140331d0c
   140331ccd:	41 80 bd 91 00 00 00 	cmp    BYTE PTR [r13+0x91],0x0
   140331cd4:	00 
   140331cd5:	75 35                	jne    0x140331d0c
   140331cd7:	41 80 bd 98 00 00 00 	cmp    BYTE PTR [r13+0x98],0x0
   140331cde:	00 
   140331cdf:	74 06                	je     0x140331ce7
   140331ce1:	41 83 ff 1e          	cmp    r15d,0x1e
   140331ce5:	75 25                	jne    0x140331d0c
   140331ce7:	f3 0f 10 06          	movss  xmm0,DWORD PTR [rsi]
   140331ceb:	4c 8d 45 30          	lea    r8,[rbp+0x30]
   140331cef:	c6 44 24 28 01       	mov    BYTE PTR [rsp+0x28],0x1
   140331cf4:	48 8d 54 24 70       	lea    rdx,[rsp+0x70]
   140331cf9:	49 8b cd             	mov    rcx,r13
   140331cfc:	f3 0f 11 44 24 20    	movss  DWORD PTR [rsp+0x20],xmm0
   140331d02:	e8 19 8d fe ff       	call   0x14031aa20
   140331d07:	e9 cc 00 00 00       	jmp    0x140331dd8
   140331d0c:	f3 44 0f 11 65 30    	movss  DWORD PTR [rbp+0x30],xmm12
   140331d12:	41 83 f9 01          	cmp    r9d,0x1
   140331d16:	0f 86 c3 00 00 00    	jbe    0x140331ddf
   140331d1c:	b9 02 00 00 00       	mov    ecx,0x2
   140331d21:	44 3b c9             	cmp    r9d,ecx
   140331d24:	76 64                	jbe    0x140331d8a
   140331d26:	ba 04 00 00 00       	mov    edx,0x4
   140331d2b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140331d30:	f3 0f 10 4c 8c 68    	movss  xmm1,DWORD PTR [rsp+rcx*4+0x68]
   140331d36:	8d 42 ff             	lea    eax,[rdx-0x1]
   140331d39:	f3 0f 5f 4c 8c 6c    	maxss  xmm1,DWORD PTR [rsp+rcx*4+0x6c]
   140331d3f:	41 3b c1             	cmp    eax,r9d
   140331d42:	7d 1f                	jge    0x140331d63
   140331d44:	f3 0f 10 44 8c 74    	movss  xmm0,DWORD PTR [rsp+rcx*4+0x74]
   140331d4a:	f3 0f 5f c1          	maxss  xmm0,xmm1
   140331d4e:	0f 28 c8             	movaps xmm1,xmm0
   140331d51:	41 3b d1             	cmp    edx,r9d
   140331d54:	7d 0d                	jge    0x140331d63
   140331d56:	f3 0f 10 44 8c 78    	movss  xmm0,DWORD PTR [rsp+rcx*4+0x78]
   140331d5c:	f3 0f 5f c1          	maxss  xmm0,xmm1
   140331d60:	0f 28 c8             	movaps xmm1,xmm0
   140331d63:	f3 0f 10 44 8c 70    	movss  xmm0,DWORD PTR [rsp+rcx*4+0x70]
   140331d69:	0f 2f c8             	comiss xmm1,xmm0
   140331d6c:	77 03                	ja     0x140331d71
   140331d6e:	0f 28 c1             	movaps xmm0,xmm1
   140331d71:	f3 0f 11 44 8d 30    	movss  DWORD PTR [rbp+rcx*4+0x30],xmm0
   140331d77:	83 c2 02             	add    edx,0x2
   140331d7a:	48 83 c1 02          	add    rcx,0x2
   140331d7e:	49 3b c9             	cmp    rcx,r9
   140331d81:	7c ad                	jl     0x140331d30
   140331d83:	f3 44 0f 10 64 24 70 	movss  xmm12,DWORD PTR [rsp+0x70]
   140331d8a:	b8 01 00 00 00       	mov    eax,0x1
   140331d8f:	44 3b c8             	cmp    r9d,eax
   140331d92:	76 4b                	jbe    0x140331ddf
   140331d94:	b9 02 00 00 00       	mov    ecx,0x2
   140331d99:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140331da0:	f3 0f 10 4c 84 6c    	movss  xmm1,DWORD PTR [rsp+rax*4+0x6c]
   140331da6:	41 3b c9             	cmp    ecx,r9d
   140331da9:	7d 0d                	jge    0x140331db8
   140331dab:	f3 0f 10 44 84 74    	movss  xmm0,DWORD PTR [rsp+rax*4+0x74]
   140331db1:	f3 0f 5f c1          	maxss  xmm0,xmm1
   140331db5:	0f 28 c8             	movaps xmm1,xmm0
   140331db8:	f3 0f 10 44 84 70    	movss  xmm0,DWORD PTR [rsp+rax*4+0x70]
   140331dbe:	0f 2f c8             	comiss xmm1,xmm0
   140331dc1:	77 03                	ja     0x140331dc6
   140331dc3:	0f 28 c1             	movaps xmm0,xmm1
   140331dc6:	f3 0f 11 44 85 30    	movss  DWORD PTR [rbp+rax*4+0x30],xmm0
   140331dcc:	83 c1 02             	add    ecx,0x2
   140331dcf:	48 83 c0 02          	add    rax,0x2
   140331dd3:	49 3b c1             	cmp    rax,r9
   140331dd6:	7c c8                	jl     0x140331da0
   140331dd8:	f3 44 0f 10 64 24 70 	movss  xmm12,DWORD PTR [rsp+0x70]
   140331ddf:	41 80 bd 99 00 00 00 	cmp    BYTE PTR [r13+0x99],0x0
   140331de6:	00 
   140331de7:	75 0a                	jne    0x140331df3
   140331de9:	41 80 bd 92 00 00 00 	cmp    BYTE PTR [r13+0x92],0x0
   140331df0:	00 
   140331df1:	74 7a                	je     0x140331e6d
   140331df3:	0f b6 86 92 0d 00 00 	movzx  eax,BYTE PTR [rsi+0xd92]
   140331dfa:	84 c0                	test   al,al
   140331dfc:	74 6f                	je     0x140331e6d
   140331dfe:	0f b6 c0             	movzx  eax,al
   140331e01:	41 0f 28 cd          	movaps xmm1,xmm13
   140331e05:	41 0f 28 f5          	movaps xmm6,xmm13
   140331e09:	83 f8 01             	cmp    eax,0x1
   140331e0c:	76 2f                	jbe    0x140331e3d
   140331e0e:	48 8d 4e 34          	lea    rcx,[rsi+0x34]
   140331e12:	8d 50 ff             	lea    edx,[rax-0x1]
   140331e15:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   140331e1c:	00 00 00 00 
   140331e20:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   140331e24:	48 8d 49 20          	lea    rcx,[rcx+0x20]
   140331e28:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   140331e2d:	f3 0f 5f c1          	maxss  xmm0,xmm1
   140331e31:	0f 28 c8             	movaps xmm1,xmm0
   140331e34:	48 83 ea 01          	sub    rdx,0x1
   140331e38:	75 e6                	jne    0x140331e20
   140331e3a:	0f 28 f0             	movaps xmm6,xmm0
   140331e3d:	f3 0f 10 7e 14       	movss  xmm7,DWORD PTR [rsi+0x14]
   140331e42:	0f 2f fe             	comiss xmm7,xmm6
   140331e45:	77 03                	ja     0x140331e4a
   140331e47:	0f 28 f7             	movaps xmm6,xmm7
   140331e4a:	b9 f1 ff ff ff       	mov    ecx,0xfffffff1
   140331e4f:	e8 ec ee f6 ff       	call   0x1402a0d40
   140331e54:	f3 0f 59 c7          	mulss  xmm0,xmm7
   140331e58:	0f 2f f0             	comiss xmm6,xmm0
   140331e5b:	77 03                	ja     0x140331e60
   140331e5d:	0f 28 f0             	movaps xmm6,xmm0
   140331e60:	f3 0f 10 3d 7c c2 35 	movss  xmm7,DWORD PTR [rip+0x35c27c]        # 0x14068e0e4
   140331e67:	00 
   140331e68:	f3 0f 11 76 14       	movss  DWORD PTR [rsi+0x14],xmm6
   140331e6d:	66 41 83 7d 14 01    	cmp    WORD PTR [r13+0x14],0x1
   140331e73:	74 39                	je     0x140331eae
   140331e75:	41 80 bd 99 00 00 00 	cmp    BYTE PTR [r13+0x99],0x0
   140331e7c:	00 
   140331e7d:	75 2f                	jne    0x140331eae
   140331e7f:	41 80 bd 94 00 00 00 	cmp    BYTE PTR [r13+0x94],0x0
   140331e86:	00 
   140331e87:	75 25                	jne    0x140331eae
   140331e89:	41 80 bd 95 00 00 00 	cmp    BYTE PTR [r13+0x95],0x0
   140331e90:	00 
   140331e91:	75 0e                	jne    0x140331ea1
   140331e93:	41 80 bd 98 00 00 00 	cmp    BYTE PTR [r13+0x98],0x0
   140331e9a:	00 
   140331e9b:	0f 84 97 02 00 00    	je     0x140332138
   140331ea1:	80 be 8c 0d 00 00 03 	cmp    BYTE PTR [rsi+0xd8c],0x3
   140331ea8:	0f 83 8a 02 00 00    	jae    0x140332138
   140331eae:	0f b6 9e 92 0d 00 00 	movzx  ebx,BYTE PTR [rsi+0xd92]
   140331eb5:	41 0f 28 f5          	movaps xmm6,xmm13
   140331eb9:	83 fb 01             	cmp    ebx,0x1
   140331ebc:	76 2b                	jbe    0x140331ee9
   140331ebe:	41 0f 28 c5          	movaps xmm0,xmm13
   140331ec2:	48 8d 4e 34          	lea    rcx,[rsi+0x34]
   140331ec6:	8d 53 ff             	lea    edx,[rbx-0x1]
   140331ec9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140331ed0:	f3 0f 10 31          	movss  xmm6,DWORD PTR [rcx]
   140331ed4:	0f 2f f0             	comiss xmm6,xmm0
   140331ed7:	77 03                	ja     0x140331edc
   140331ed9:	0f 28 f0             	movaps xmm6,xmm0
   140331edc:	48 83 c1 20          	add    rcx,0x20
   140331ee0:	0f 28 c6             	movaps xmm0,xmm6
   140331ee3:	48 83 ea 01          	sub    rdx,0x1
   140331ee7:	75 e7                	jne    0x140331ed0
   140331ee9:	41 80 bd 99 00 00 00 	cmp    BYTE PTR [r13+0x99],0x0
   140331ef0:	00 
   140331ef1:	74 04                	je     0x140331ef7
   140331ef3:	8b d7                	mov    edx,edi
   140331ef5:	eb 10                	jmp    0x140331f07
   140331ef7:	41 80 bd 94 00 00 00 	cmp    BYTE PTR [r13+0x94],0x0
   140331efe:	00 
   140331eff:	ba ba ff ff ff       	mov    edx,0xffffffba
   140331f04:	0f 45 d7             	cmovne edx,edi
   140331f07:	8d 42 78             	lea    eax,[rdx+0x78]
   140331f0a:	83 f8 78             	cmp    eax,0x78
   140331f0d:	0f 87 93 00 00 00    	ja     0x140331fa6
   140331f13:	48 98                	cdqe
   140331f15:	41 0f b6 84 04 f0 22 	movzx  eax,BYTE PTR [r12+rax*1+0x3322f0]
   140331f1c:	33 00 
   140331f1e:	41 8b 8c 84 b8 22 33 	mov    ecx,DWORD PTR [r12+rax*4+0x3322b8]
   140331f25:	00 
   140331f26:	49 03 cc             	add    rcx,r12
   140331f29:	ff e1                	jmp    rcx
   140331f2b:	f3 0f 10 0d fd e0 51 	movss  xmm1,DWORD PTR [rip+0x51e0fd]        # 0x140850030
   140331f32:	00 
   140331f33:	0f 28 c1             	movaps xmm0,xmm1
   140331f36:	e9 8d 00 00 00       	jmp    0x140331fc8
   140331f3b:	41 0f 28 c6          	movaps xmm0,xmm14
   140331f3f:	eb 7f                	jmp    0x140331fc0
   140331f41:	41 0f 28 c7          	movaps xmm0,xmm15
   140331f45:	eb 79                	jmp    0x140331fc0
   140331f47:	0f 28 c7             	movaps xmm0,xmm7
   140331f4a:	eb 74                	jmp    0x140331fc0
   140331f4c:	f3 0f 10 05 90 51 36 	movss  xmm0,DWORD PTR [rip+0x365190]        # 0x1406970e4
   140331f53:	00 
   140331f54:	eb 6a                	jmp    0x140331fc0
   140331f56:	f3 0f 10 05 6e 51 36 	movss  xmm0,DWORD PTR [rip+0x36516e]        # 0x1406970cc
   140331f5d:	00 
   140331f5e:	eb 60                	jmp    0x140331fc0
   140331f60:	f3 0f 10 05 70 c1 35 	movss  xmm0,DWORD PTR [rip+0x35c170]        # 0x14068e0d8
   140331f67:	00 
   140331f68:	eb 56                	jmp    0x140331fc0
   140331f6a:	f3 0f 10 05 9e 6b 36 	movss  xmm0,DWORD PTR [rip+0x366b9e]        # 0x140698b10
   140331f71:	00 
   140331f72:	eb 4c                	jmp    0x140331fc0
   140331f74:	f3 0f 10 05 24 e0 51 	movss  xmm0,DWORD PTR [rip+0x51e024]        # 0x14084ffa0
   140331f7b:	00 
   140331f7c:	eb 42                	jmp    0x140331fc0
   140331f7e:	f3 0f 10 05 82 6b 36 	movss  xmm0,DWORD PTR [rip+0x366b82]        # 0x140698b08
   140331f85:	00 
   140331f86:	eb 38                	jmp    0x140331fc0
   140331f88:	f3 0f 10 05 74 6b 36 	movss  xmm0,DWORD PTR [rip+0x366b74]        # 0x140698b04
   140331f8f:	00 
   140331f90:	eb 2e                	jmp    0x140331fc0
   140331f92:	f3 0f 10 05 66 6b 36 	movss  xmm0,DWORD PTR [rip+0x366b66]        # 0x140698b00
   140331f99:	00 
   140331f9a:	eb 24                	jmp    0x140331fc0
   140331f9c:	f3 0f 10 05 68 af 35 	movss  xmm0,DWORD PTR [rip+0x35af68]        # 0x14068cf0c
   140331fa3:	00 
   140331fa4:	eb 1a                	jmp    0x140331fc0
   140331fa6:	66 0f 6e ca          	movd   xmm1,edx
   140331faa:	41 0f 28 c3          	movaps xmm0,xmm11
   140331fae:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   140331fb2:	f2 41 0f 5e ca       	divsd  xmm1,xmm10
   140331fb7:	e8 be ed 2e 00       	call   0x140620d7a
   140331fbc:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140331fc0:	f3 0f 10 0d 68 e0 51 	movss  xmm1,DWORD PTR [rip+0x51e068]        # 0x140850030
   140331fc7:	00 
   140331fc8:	f3 0f 59 c6          	mulss  xmm0,xmm6
   140331fcc:	0f 2f 46 14          	comiss xmm0,DWORD PTR [rsi+0x14]
   140331fd0:	0f 82 62 01 00 00    	jb     0x140332138
   140331fd6:	bf 01 00 00 00       	mov    edi,0x1
   140331fdb:	40 3a df             	cmp    bl,dil
   140331fde:	0f 86 4f 01 00 00    	jbe    0x140332133
   140331fe4:	f3 44 0f 10 25 f7 50 	movss  xmm12,DWORD PTR [rip+0x3650f7]        # 0x1406970e4
   140331feb:	36 00 
   140331fed:	48 8d 5e 34          	lea    rbx,[rsi+0x34]
   140331ff1:	f3 44 0f 10 2d d2 50 	movss  xmm13,DWORD PTR [rip+0x3650d2]        # 0x1406970cc
   140331ff8:	36 00 
   140331ffa:	45 33 ff             	xor    r15d,r15d
   140331ffd:	f3 44 0f 10 0d d2 c0 	movss  xmm9,DWORD PTR [rip+0x35c0d2]        # 0x14068e0d8
   140332004:	35 00 
   140332006:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033200d:	00 00 00 
   140332010:	45 38 bd 99 00 00 00 	cmp    BYTE PTR [r13+0x99],r15b
   140332017:	ba 0a 00 00 00       	mov    edx,0xa
   14033201c:	41 0f 45 d7          	cmovne edx,r15d
   140332020:	8d 42 3c             	lea    eax,[rdx+0x3c]
   140332023:	48 63 c8             	movsxd rcx,eax
   140332026:	41 0f b6 84 0c b4 23 	movzx  eax,BYTE PTR [r12+rcx*1+0x3323b4]
   14033202d:	33 00 
   14033202f:	41 8b 8c 84 6c 23 33 	mov    ecx,DWORD PTR [r12+rax*4+0x33236c]
   140332036:	00 
   140332037:	49 03 cc             	add    rcx,r12
   14033203a:	ff e1                	jmp    rcx
   14033203c:	41 0f 28 c1          	movaps xmm0,xmm9
   140332040:	e9 a5 00 00 00       	jmp    0x1403320ea
   140332045:	f3 0f 10 05 7b 50 36 	movss  xmm0,DWORD PTR [rip+0x36507b]        # 0x1406970c8
   14033204c:	00 
   14033204d:	e9 98 00 00 00       	jmp    0x1403320ea
   140332052:	41 0f 28 c5          	movaps xmm0,xmm13
   140332056:	e9 8f 00 00 00       	jmp    0x1403320ea
   14033205b:	f3 0f 10 05 75 50 36 	movss  xmm0,DWORD PTR [rip+0x365075]        # 0x1406970d8
   140332062:	00 
   140332063:	e9 82 00 00 00       	jmp    0x1403320ea
   140332068:	41 0f 28 c4          	movaps xmm0,xmm12
   14033206c:	eb 7c                	jmp    0x1403320ea
   14033206e:	f3 0f 10 05 76 50 36 	movss  xmm0,DWORD PTR [rip+0x365076]        # 0x1406970ec
   140332075:	00 
   140332076:	eb 72                	jmp    0x1403320ea
   140332078:	0f 28 c7             	movaps xmm0,xmm7
   14033207b:	eb 6d                	jmp    0x1403320ea
   14033207d:	f3 0f 10 05 67 c0 35 	movss  xmm0,DWORD PTR [rip+0x35c067]        # 0x14068e0ec
   140332084:	00 
   140332085:	eb 63                	jmp    0x1403320ea
   140332087:	41 0f 28 c7          	movaps xmm0,xmm15
   14033208b:	eb 5d                	jmp    0x1403320ea
   14033208d:	f3 0f 10 05 5b c0 35 	movss  xmm0,DWORD PTR [rip+0x35c05b]        # 0x14068e0f0
   140332094:	00 
   140332095:	eb 53                	jmp    0x1403320ea
   140332097:	41 0f 28 c6          	movaps xmm0,xmm14
   14033209b:	eb 4d                	jmp    0x1403320ea
   14033209d:	f3 0f 10 05 57 c0 35 	movss  xmm0,DWORD PTR [rip+0x35c057]        # 0x14068e0fc
   1403320a4:	00 
   1403320a5:	eb 43                	jmp    0x1403320ea
   1403320a7:	0f 28 c1             	movaps xmm0,xmm1
   1403320aa:	eb 3e                	jmp    0x1403320ea
   1403320ac:	f3 0f 10 05 74 c0 35 	movss  xmm0,DWORD PTR [rip+0x35c074]        # 0x14068e128
   1403320b3:	00 
   1403320b4:	eb 34                	jmp    0x1403320ea
   1403320b6:	41 0f 28 c0          	movaps xmm0,xmm8
   1403320ba:	eb 2e                	jmp    0x1403320ea
   1403320bc:	f3 0f 10 05 b8 c0 35 	movss  xmm0,DWORD PTR [rip+0x35c0b8]        # 0x14068e17c
   1403320c3:	00 
   1403320c4:	eb 24                	jmp    0x1403320ea
   1403320c6:	f3 0f 10 05 be c0 35 	movss  xmm0,DWORD PTR [rip+0x35c0be]        # 0x14068e18c
   1403320cd:	00 
   1403320ce:	eb 1a                	jmp    0x1403320ea
   1403320d0:	66 0f 6e ca          	movd   xmm1,edx
   1403320d4:	41 0f 28 c3          	movaps xmm0,xmm11
   1403320d8:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   1403320dc:	f2 41 0f 5e ca       	divsd  xmm1,xmm10
   1403320e1:	e8 94 ec 2e 00       	call   0x140620d7a
   1403320e6:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   1403320ea:	f3 0f 59 46 14       	mulss  xmm0,DWORD PTR [rsi+0x14]
   1403320ef:	f3 0f 10 0b          	movss  xmm1,DWORD PTR [rbx]
   1403320f3:	0f 2f c8             	comiss xmm1,xmm0
   1403320f6:	77 03                	ja     0x1403320fb
   1403320f8:	0f 28 c1             	movaps xmm0,xmm1
   1403320fb:	f3 0f 10 0d 2d df 51 	movss  xmm1,DWORD PTR [rip+0x51df2d]        # 0x140850030
   140332102:	00 
   140332103:	ff c7                	inc    edi
   140332105:	f3 0f 11 03          	movss  DWORD PTR [rbx],xmm0
   140332109:	48 83 c3 20          	add    rbx,0x20
   14033210d:	0f b6 86 92 0d 00 00 	movzx  eax,BYTE PTR [rsi+0xd92]
   140332114:	3b f8                	cmp    edi,eax
   140332116:	0f 8c f4 fe ff ff    	jl     0x140332010
   14033211c:	f3 44 0f 10 64 24 70 	movss  xmm12,DWORD PTR [rsp+0x70]
   140332123:	45 0f 57 ed          	xorps  xmm13,xmm13
   140332127:	f3 44 0f 10 4c 24 44 	movss  xmm9,DWORD PTR [rsp+0x44]
   14033212e:	44 8b 7c 24 48       	mov    r15d,DWORD PTR [rsp+0x48]
   140332133:	bf f6 ff ff ff       	mov    edi,0xfffffff6
   140332138:	0f b6 96 92 0d 00 00 	movzx  edx,BYTE PTR [rsi+0xd92]
   14033213f:	33 c0                	xor    eax,eax
   140332141:	89 46 08             	mov    DWORD PTR [rsi+0x8],eax
   140332144:	84 d2                	test   dl,dl
   140332146:	74 3f                	je     0x140332187
   140332148:	41 0f 28 d5          	movaps xmm2,xmm13
   14033214c:	44 0f b6 c2          	movzx  r8d,dl
   140332150:	48 8d 45 30          	lea    rax,[rbp+0x30]
   140332154:	48 8d 4e 14          	lea    rcx,[rsi+0x14]
   140332158:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033215f:	00 
   140332160:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   140332164:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   140332168:	0f 2f c8             	comiss xmm1,xmm0
   14033216b:	77 03                	ja     0x140332170
   14033216d:	0f 28 c1             	movaps xmm0,xmm1
   140332170:	f3 0f 58 d0          	addss  xmm2,xmm0
   140332174:	48 83 c1 20          	add    rcx,0x20
   140332178:	48 83 c0 04          	add    rax,0x4
   14033217c:	f3 0f 11 56 08       	movss  DWORD PTR [rsi+0x8],xmm2
   140332181:	49 83 e8 01          	sub    r8,0x1
   140332185:	75 d9                	jne    0x140332160
   140332187:	41 83 bd b0 00 00 00 	cmp    DWORD PTR [r13+0xb0],0x0
   14033218e:	00 
   14033218f:	0f 84 8e 00 00 00    	je     0x140332223
   140332195:	f3 0f 10 06          	movss  xmm0,DWORD PTR [rsi]
   140332199:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033219c:	f2 0f 59 05 ac bf 35 	mulsd  xmm0,QWORD PTR [rip+0x35bfac]        # 0x14068e150
   1403321a3:	00 
   1403321a4:	f2 0f 5e 05 c4 bf 35 	divsd  xmm0,QWORD PTR [rip+0x35bfc4]        # 0x14068e170
   1403321ab:	00 
   1403321ac:	e8 c3 eb 2e 00       	call   0x140620d74
   1403321b1:	f2 0f 59 05 87 bf 35 	mulsd  xmm0,QWORD PTR [rip+0x35bf87]        # 0x14068e140
   1403321b8:	00 
   1403321b9:	48 8d 8d 70 02 00 00 	lea    rcx,[rbp+0x270]
   1403321c0:	0f 57 f6             	xorps  xmm6,xmm6
   1403321c3:	f2 0f 5e 05 4d bf 35 	divsd  xmm0,QWORD PTR [rip+0x35bf4d]        # 0x14068e118
   1403321ca:	00 
   1403321cb:	f2 0f 58 05 65 bf 35 	addsd  xmm0,QWORD PTR [rip+0x35bf65]        # 0x14068e138
   1403321d2:	00 
   1403321d3:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   1403321d7:	0f 28 ce             	movaps xmm1,xmm6
   1403321da:	e8 81 d1 fc ff       	call   0x1402ff360
   1403321df:	0f 57 c0             	xorps  xmm0,xmm0
   1403321e2:	f3 0f 2a c0          	cvtsi2ss xmm0,eax
   1403321e6:	f3 0f 5c f0          	subss  xmm6,xmm0
   1403321ea:	0f 5a ce             	cvtps2pd xmm1,xmm6
   1403321ed:	0f 54 0d bc e5 51 00 	andps  xmm1,XMMWORD PTR [rip+0x51e5bc]        # 0x1408507b0
   1403321f4:	66 0f 5a d1          	cvtpd2ps xmm2,xmm1
   1403321f8:	0f 2f 54 24 40       	comiss xmm2,DWORD PTR [rsp+0x40]
   1403321fd:	76 24                	jbe    0x140332223
   1403321ff:	41 0f 28 c1          	movaps xmm0,xmm9
   140332203:	f3 0f 58 05 bd 1d 37 	addss  xmm0,DWORD PTR [rip+0x371dbd]        # 0x1406a3fc8
   14033220a:	00 
   14033220b:	f3 0f 5c c2          	subss  xmm0,xmm2
   14033220f:	41 0f 2f c5          	comiss xmm0,xmm13
   140332213:	77 04                	ja     0x140332219
   140332215:	41 0f 28 c5          	movaps xmm0,xmm13
   140332219:	f3 0f 59 46 08       	mulss  xmm0,DWORD PTR [rsi+0x8]
   14033221e:	f3 0f 11 46 08       	movss  DWORD PTR [rsi+0x8],xmm0
   140332223:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140332228:	66 41 ff c6          	inc    r14w
   14033222c:	66 44 3b b6 70 06 00 	cmp    r14w,WORD PTR [rsi+0x670]
   140332233:	00 
   140332234:	0f 82 a6 f9 ff ff    	jb     0x140331be0
   14033223a:	44 0f 28 bc 24 90 03 	movaps xmm15,XMMWORD PTR [rsp+0x390]
   140332241:	00 00 
   140332243:	44 0f 28 a4 24 c0 03 	movaps xmm12,XMMWORD PTR [rsp+0x3c0]
   14033224a:	00 00 
   14033224c:	44 0f 28 9c 24 d0 03 	movaps xmm11,XMMWORD PTR [rsp+0x3d0]
   140332253:	00 00 
   140332255:	44 0f 28 94 24 e0 03 	movaps xmm10,XMMWORD PTR [rsp+0x3e0]
   14033225c:	00 00 
   14033225e:	44 0f 28 8c 24 f0 03 	movaps xmm9,XMMWORD PTR [rsp+0x3f0]
   140332265:	00 00 
   140332267:	44 0f 28 84 24 00 04 	movaps xmm8,XMMWORD PTR [rsp+0x400]
   14033226e:	00 00 
   140332270:	0f 28 bc 24 10 04 00 	movaps xmm7,XMMWORD PTR [rsp+0x410]
   140332277:	00 
   140332278:	48 8b 9c 24 80 04 00 	mov    rbx,QWORD PTR [rsp+0x480]
   14033227f:	00 
   140332280:	48 8b 8d 80 02 00 00 	mov    rcx,QWORD PTR [rbp+0x280]
   140332287:	48 33 cc             	xor    rcx,rsp
   14033228a:	e8 71 93 2e 00       	call   0x14061b600
   14033228f:	4c 8d 9c 24 30 04 00 	lea    r11,[rsp+0x430]
   140332296:	00 
   140332297:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
   14033229c:	45 0f 28 6b 80       	movaps xmm13,XMMWORD PTR [r11-0x80]
   1403322a1:	45 0f 28 b3 70 ff ff 	movaps xmm14,XMMWORD PTR [r11-0x90]
   1403322a8:	ff 
   1403322a9:	49 8b e3             	mov    rsp,r11
   1403322ac:	41 5f                	pop    r15
   1403322ae:	41 5e                	pop    r14
   1403322b0:	41 5d                	pop    r13
   1403322b2:	41 5c                	pop    r12
   1403322b4:	5f                   	pop    rdi
   1403322b5:	5e                   	pop    rsi
   1403322b6:	5d                   	pop    rbp
   1403322b7:	c3                   	ret
   1403322b8:	9c                   	pushf
   1403322b9:	1f                   	(bad)
   1403322ba:	33 00                	xor    eax,DWORD PTR [rax]
   1403322bc:	92                   	xchg   edx,eax
   1403322bd:	1f                   	(bad)
   1403322be:	33 00                	xor    eax,DWORD PTR [rax]
   1403322c0:	88 1f                	mov    BYTE PTR [rdi],bl
   1403322c2:	33 00                	xor    eax,DWORD PTR [rax]
   1403322c4:	7e 1f                	jle    0x1403322e5
   1403322c6:	33 00                	xor    eax,DWORD PTR [rax]
   1403322c8:	74 1f                	je     0x1403322e9
   1403322ca:	33 00                	xor    eax,DWORD PTR [rax]
   1403322cc:	6a 1f                	push   0x1f
   1403322ce:	33 00                	xor    eax,DWORD PTR [rax]
   1403322d0:	60                   	(bad)
   1403322d1:	1f                   	(bad)
   1403322d2:	33 00                	xor    eax,DWORD PTR [rax]
   1403322d4:	56                   	push   rsi
   1403322d5:	1f                   	(bad)
   1403322d6:	33 00                	xor    eax,DWORD PTR [rax]
   1403322d8:	4c 1f                	rex.WR (bad)
   1403322da:	33 00                	xor    eax,DWORD PTR [rax]
   1403322dc:	47 1f                	rex.RXB (bad)
   1403322de:	33 00                	xor    eax,DWORD PTR [rax]
   1403322e0:	41 1f                	rex.B (bad)
   1403322e2:	33 00                	xor    eax,DWORD PTR [rax]
   1403322e4:	3b 1f                	cmp    ebx,DWORD PTR [rdi]
   1403322e6:	33 00                	xor    eax,DWORD PTR [rax]
   1403322e8:	2b 1f                	sub    ebx,DWORD PTR [rdi]
   1403322ea:	33 00                	xor    eax,DWORD PTR [rax]
   1403322ec:	a6                   	cmps   BYTE PTR [rsi],BYTE PTR [rdi]
   1403322ed:	1f                   	(bad)
   1403322ee:	33 00                	xor    eax,DWORD PTR [rax]
   1403322f0:	00 0d 0d 0d 0d 0d    	add    BYTE PTR [rip+0xd0d0d0d],cl        # 0x14d403003
   1403322f6:	0d 0d 0d 0d 01       	or     eax,0x10d0d0d
   1403322fb:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   140332300:	0d 0d 0d 0d 02       	or     eax,0x20d0d0d
   140332305:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   14033230a:	0d 0d 0d 0d 03       	or     eax,0x30d0d0d
   14033230f:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   140332314:	0d 0d 0d 0d 04       	or     eax,0x40d0d0d
   140332319:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   14033231e:	0d 0d 0d 0d 05       	or     eax,0x50d0d0d
   140332323:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   140332328:	0d 0d 0d 0d 06       	or     eax,0x60d0d0d
   14033232d:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   140332332:	0d 0d 0d 0d 07       	or     eax,0x70d0d0d
   140332337:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   14033233c:	0d 0d 0d 0d 08       	or     eax,0x80d0d0d
   140332341:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   140332346:	0d 0d 0d 0d 09       	or     eax,0x90d0d0d
   14033234b:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   140332350:	0d 0d 0d 0d 0a       	or     eax,0xa0d0d0d
   140332355:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   14033235a:	0d 0d 0d 0d 0b       	or     eax,0xb0d0d0d
   14033235f:	0d 0d 0d 0d 0d       	or     eax,0xd0d0d0d
   140332364:	0d 0d 0d 0d 0c       	or     eax,0xc0d0d0d
   140332369:	0f 1f 00             	nop    DWORD PTR [rax]
   14033236c:	3c 20                	cmp    al,0x20
   14033236e:	33 00                	xor    eax,DWORD PTR [rax]
   140332370:	45 20 33             	and    BYTE PTR [r11],r14b
   140332373:	00 52 20             	add    BYTE PTR [rdx+0x20],dl
   140332376:	33 00                	xor    eax,DWORD PTR [rax]
   140332378:	5b                   	pop    rbx
   140332379:	20 33                	and    BYTE PTR [rbx],dh
   14033237b:	00 68 20             	add    BYTE PTR [rax+0x20],ch
   14033237e:	33 00                	xor    eax,DWORD PTR [rax]
   140332380:	6e                   	outs   dx,BYTE PTR [rsi]
   140332381:	20 33                	and    BYTE PTR [rbx],dh
   140332383:	00 78 20             	add    BYTE PTR [rax+0x20],bh
   140332386:	33 00                	xor    eax,DWORD PTR [rax]
   140332388:	7d 20                	jge    0x1403323aa
   14033238a:	33 00                	xor    eax,DWORD PTR [rax]
   14033238c:	87 20                	xchg   DWORD PTR [rax],esp
   14033238e:	33 00                	xor    eax,DWORD PTR [rax]
   140332390:	8d 20                	lea    esp,[rax]
   140332392:	33 00                	xor    eax,DWORD PTR [rax]
   140332394:	97                   	xchg   edi,eax
   140332395:	20 33                	and    BYTE PTR [rbx],dh
   140332397:	00 9d 20 33 00 a7    	add    BYTE PTR [rbp-0x58ffcce0],bl
   14033239d:	20 33                	and    BYTE PTR [rbx],dh
   14033239f:	00 ac 20 33 00 b6 20 	add    BYTE PTR [rax+riz*1+0x20b60033],ch
   1403323a6:	33 00                	xor    eax,DWORD PTR [rax]
   1403323a8:	bc 20 33 00 c6       	mov    esp,0xc6003320
   1403323ad:	20 33                	and    BYTE PTR [rbx],dh
   1403323af:	00 d0                	add    al,dl
   1403323b1:	20 33                	and    BYTE PTR [rbx],dh
   1403323b3:	00 00                	add    BYTE PTR [rax],al
   1403323b5:	11 11                	adc    DWORD PTR [rcx],edx
   1403323b7:	11 11                	adc    DWORD PTR [rcx],edx
   1403323b9:	01 11                	add    DWORD PTR [rcx],edx
   1403323bb:	11 11                	adc    DWORD PTR [rcx],edx
   1403323bd:	11 02                	adc    DWORD PTR [rdx],eax
   1403323bf:	11 11                	adc    DWORD PTR [rcx],edx
   1403323c1:	11 11                	adc    DWORD PTR [rcx],edx
   1403323c3:	03 11                	add    edx,DWORD PTR [rcx]
   1403323c5:	11 11                	adc    DWORD PTR [rcx],edx
   1403323c7:	11 04 11             	adc    DWORD PTR [rcx+rdx*1],eax
   1403323ca:	11 11                	adc    DWORD PTR [rcx],edx
   1403323cc:	11 05 11 11 11 11    	adc    DWORD PTR [rip+0x11111111],eax        # 0x1514434e3
   1403323d2:	06                   	(bad)
   1403323d3:	11 11                	adc    DWORD PTR [rcx],edx
   1403323d5:	11 11                	adc    DWORD PTR [rcx],edx
   1403323d7:	07                   	(bad)
   1403323d8:	11 11                	adc    DWORD PTR [rcx],edx
   1403323da:	11 11                	adc    DWORD PTR [rcx],edx
   1403323dc:	08 11                	or     BYTE PTR [rcx],dl
   1403323de:	11 11                	adc    DWORD PTR [rcx],edx
   1403323e0:	11 09                	adc    DWORD PTR [rcx],ecx
   1403323e2:	11 11                	adc    DWORD PTR [rcx],edx
   1403323e4:	11 11                	adc    DWORD PTR [rcx],edx
   1403323e6:	0a 11                	or     dl,BYTE PTR [rcx]
   1403323e8:	11 11                	adc    DWORD PTR [rcx],edx
   1403323ea:	11 0b                	adc    DWORD PTR [rbx],ecx
   1403323ec:	11 11                	adc    DWORD PTR [rcx],edx
   1403323ee:	11 11                	adc    DWORD PTR [rcx],edx
   1403323f0:	0c 11                	or     al,0x11
   1403323f2:	11 11                	adc    DWORD PTR [rcx],edx
   1403323f4:	11 0d 11 11 11 11    	adc    DWORD PTR [rip+0x11111111],ecx        # 0x15144350b
   1403323fa:	0e                   	(bad)
   1403323fb:	11 11                	adc    DWORD PTR [rcx],edx
   1403323fd:	11 11                	adc    DWORD PTR [rcx],edx
   1403323ff:	0f 11 11             	movups XMMWORD PTR [rcx],xmm2
   140332402:	11 11                	adc    DWORD PTR [rcx],edx
   140332404:	10 cc                	adc    ah,cl
   140332406:	cc                   	int3
   140332407:	cc                   	int3
   140332408:	cc                   	int3
   140332409:	cc                   	int3
   14033240a:	cc                   	int3
   14033240b:	cc                   	int3
   14033240c:	cc                   	int3
   14033240d:	cc                   	int3
   14033240e:	cc                   	int3
   14033240f:	cc                   	int3
