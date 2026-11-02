
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001405aa200 <.text+0x5a9200>:
   1405aa200:	48 8b c4             	mov    rax,rsp
   1405aa203:	44 89 48 20          	mov    DWORD PTR [rax+0x20],r9d
   1405aa207:	44 89 40 18          	mov    DWORD PTR [rax+0x18],r8d
   1405aa20b:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1405aa20f:	53                   	push   rbx
   1405aa210:	55                   	push   rbp
   1405aa211:	56                   	push   rsi
   1405aa212:	57                   	push   rdi
   1405aa213:	48 81 ec 18 01 00 00 	sub    rsp,0x118
   1405aa21a:	4c 63 12             	movsxd r10,DWORD PTR [rdx]
   1405aa21d:	48 8b da             	mov    rbx,rdx
   1405aa220:	48 63 ac 24 a8 01 00 	movsxd rbp,DWORD PTR [rsp+0x1a8]
   1405aa227:	00 
   1405aa228:	8b bc 24 68 01 00 00 	mov    edi,DWORD PTR [rsp+0x168]
   1405aa22f:	48 8b d5             	mov    rdx,rbp
   1405aa232:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   1405aa236:	0f 57 f6             	xorps  xmm6,xmm6
   1405aa239:	44 0f 29 98 58 ff ff 	movaps XMMWORD PTR [rax-0xa8],xmm11
   1405aa240:	ff 
   1405aa241:	45 0f 57 db          	xorps  xmm11,xmm11
   1405aa245:	41 8b f0             	mov    esi,r8d
   1405aa248:	4c 3b d5             	cmp    r10,rbp
   1405aa24b:	0f 8d 95 00 00 00    	jge    0x1405aa2e6
   1405aa251:	48 8b c2             	mov    rax,rdx
   1405aa254:	49 2b c2             	sub    rax,r10
   1405aa257:	48 83 f8 04          	cmp    rax,0x4
   1405aa25b:	7c 5f                	jl     0x1405aa2bc
   1405aa25d:	4c 8b 43 18          	mov    r8,QWORD PTR [rbx+0x18]
   1405aa261:	49 8d 42 02          	lea    rax,[r10+0x2]
   1405aa265:	48 8b ca             	mov    rcx,rdx
   1405aa268:	49 2b ca             	sub    rcx,r10
   1405aa26b:	48 83 e9 04          	sub    rcx,0x4
   1405aa26f:	48 c1 e9 02          	shr    rcx,0x2
   1405aa273:	49 8d 04 80          	lea    rax,[r8+rax*4]
   1405aa277:	48 ff c1             	inc    rcx
   1405aa27a:	4d 8d 14 8a          	lea    r10,[r10+rcx*4]
   1405aa27e:	66 90                	xchg   ax,ax
   1405aa280:	4d 85 c0             	test   r8,r8
   1405aa283:	75 16                	jne    0x1405aa29b
   1405aa285:	f3 0f 10 83 7c 02 00 	movss  xmm0,DWORD PTR [rbx+0x27c]
   1405aa28c:	00 
   1405aa28d:	f3 0f 58 f0          	addss  xmm6,xmm0
   1405aa291:	f3 0f 58 f0          	addss  xmm6,xmm0
   1405aa295:	f3 0f 58 f0          	addss  xmm6,xmm0
   1405aa299:	eb 13                	jmp    0x1405aa2ae
   1405aa29b:	f3 0f 58 70 f8       	addss  xmm6,DWORD PTR [rax-0x8]
   1405aa2a0:	f3 0f 10 40 04       	movss  xmm0,DWORD PTR [rax+0x4]
   1405aa2a5:	f3 0f 58 70 fc       	addss  xmm6,DWORD PTR [rax-0x4]
   1405aa2aa:	f3 0f 58 30          	addss  xmm6,DWORD PTR [rax]
   1405aa2ae:	48 83 c0 10          	add    rax,0x10
   1405aa2b2:	f3 0f 58 f0          	addss  xmm6,xmm0
   1405aa2b6:	48 83 e9 01          	sub    rcx,0x1
   1405aa2ba:	75 c4                	jne    0x1405aa280
   1405aa2bc:	4c 3b d2             	cmp    r10,rdx
   1405aa2bf:	7d 25                	jge    0x1405aa2e6
   1405aa2c1:	48 8b 43 18          	mov    rax,QWORD PTR [rbx+0x18]
   1405aa2c5:	48 85 c0             	test   rax,rax
   1405aa2c8:	75 0a                	jne    0x1405aa2d4
   1405aa2ca:	f3 0f 10 83 7c 02 00 	movss  xmm0,DWORD PTR [rbx+0x27c]
   1405aa2d1:	00 
   1405aa2d2:	eb 06                	jmp    0x1405aa2da
   1405aa2d4:	f3 42 0f 10 04 90    	movss  xmm0,DWORD PTR [rax+r10*4]
   1405aa2da:	49 ff c2             	inc    r10
   1405aa2dd:	f3 0f 58 f0          	addss  xmm6,xmm0
   1405aa2e1:	4c 3b d2             	cmp    r10,rdx
   1405aa2e4:	7c df                	jl     0x1405aa2c5
   1405aa2e6:	3b ac 24 b0 01 00 00 	cmp    ebp,DWORD PTR [rsp+0x1b0]
   1405aa2ed:	0f 8d e1 04 00 00    	jge    0x1405aa7d4
   1405aa2f3:	4c 89 a4 24 10 01 00 	mov    QWORD PTR [rsp+0x110],r12
   1405aa2fa:	00 
   1405aa2fb:	4c 8d 24 ad 00 00 00 	lea    r12,[rbp*4+0x0]
   1405aa302:	00 
   1405aa303:	4c 89 ac 24 08 01 00 	mov    QWORD PTR [rsp+0x108],r13
   1405aa30a:	00 
   1405aa30b:	44 8b ac 24 98 01 00 	mov    r13d,DWORD PTR [rsp+0x198]
   1405aa312:	00 
   1405aa313:	4c 89 b4 24 00 01 00 	mov    QWORD PTR [rsp+0x100],r14
   1405aa31a:	00 
   1405aa31b:	4c 89 bc 24 f8 00 00 	mov    QWORD PTR [rsp+0xf8],r15
   1405aa322:	00 
   1405aa323:	44 0f 29 8c 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm9
   1405aa32a:	00 00 
   1405aa32c:	66 44 0f 6e 8c 24 b8 	movd   xmm9,DWORD PTR [rsp+0x1b8]
   1405aa333:	01 00 00 
   1405aa336:	44 0f 29 94 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm10
   1405aa33d:	00 00 
   1405aa33f:	66 44 0f 6e 94 24 c0 	movd   xmm10,DWORD PTR [rsp+0x1c0]
   1405aa346:	01 00 00 
   1405aa349:	44 0f 29 a4 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm12
   1405aa350:	00 00 
   1405aa352:	f3 44 0f 10 25 45 5c 	movss  xmm12,DWORD PTR [rip+0x2a5c45]        # 0x14084ffa0
   1405aa359:	2a 00 
   1405aa35b:	44 0f 29 6c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm13
   1405aa361:	f3 44 0f 10 2d 7a cd 	movss  xmm13,DWORD PTR [rip+0xecd7a]        # 0x1406970e4
   1405aa368:	0e 00 
   1405aa36a:	44 0f 29 74 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm14
   1405aa370:	f3 44 0f 10 35 63 5c 	movss  xmm14,DWORD PTR [rip+0x2a5c63]        # 0x14084ffdc
   1405aa377:	2a 00 
   1405aa379:	44 0f 29 7c 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm15
   1405aa37f:	45 0f 57 ff          	xorps  xmm15,xmm15
   1405aa383:	0f 29 bc 24 d0 00 00 	movaps XMMWORD PTR [rsp+0xd0],xmm7
   1405aa38a:	00 
   1405aa38b:	f2 4d 0f 2a fd       	cvtsi2sd xmm15,r13
   1405aa390:	c7 84 24 a8 01 00 00 	mov    DWORD PTR [rsp+0x1a8],0x0
   1405aa397:	00 00 00 00 
   1405aa39b:	45 0f 5b c9          	cvtdq2ps xmm9,xmm9
   1405aa39f:	45 0f 5b d2          	cvtdq2ps xmm10,xmm10
   1405aa3a3:	44 0f 29 84 24 c0 00 	movaps XMMWORD PTR [rsp+0xc0],xmm8
   1405aa3aa:	00 00 
   1405aa3ac:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1405aa3b0:	8b 05 ae 04 30 17    	mov    eax,DWORD PTR [rip+0x173004ae]        # 0x1578aa864
   1405aa3b6:	0f 57 c0             	xorps  xmm0,xmm0
   1405aa3b9:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1405aa3be:	f3 0f 59 c6          	mulss  xmm0,xmm6
   1405aa3c2:	ff 15 a8 f6 0d 00    	call   QWORD PTR [rip+0xdf6a8]        # 0x140689a70
   1405aa3c8:	48 8b 43 18          	mov    rax,QWORD PTR [rbx+0x18]
   1405aa3cc:	f3 41 0f 58 c1       	addss  xmm0,xmm9
   1405aa3d1:	f3 41 0f 58 c2       	addss  xmm0,xmm10
   1405aa3d6:	f3 44 0f 2c f8       	cvttss2si r15d,xmm0
   1405aa3db:	48 85 c0             	test   rax,rax
   1405aa3de:	75 0a                	jne    0x1405aa3ea
   1405aa3e0:	f3 0f 10 83 7c 02 00 	movss  xmm0,DWORD PTR [rbx+0x27c]
   1405aa3e7:	00 
   1405aa3e8:	eb 06                	jmp    0x1405aa3f0
   1405aa3ea:	f3 41 0f 10 04 04    	movss  xmm0,DWORD PTR [r12+rax*1]
   1405aa3f0:	8b 05 6e 04 30 17    	mov    eax,DWORD PTR [rip+0x1730046e]        # 0x1578aa864
   1405aa3f6:	f3 0f 58 f0          	addss  xmm6,xmm0
   1405aa3fa:	0f 57 c0             	xorps  xmm0,xmm0
   1405aa3fd:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1405aa402:	f3 0f 59 c6          	mulss  xmm0,xmm6
   1405aa406:	ff 15 64 f6 0d 00    	call   QWORD PTR [rip+0xdf664]        # 0x140689a70
   1405aa40c:	f3 41 0f 58 c1       	addss  xmm0,xmm9
   1405aa411:	f3 41 0f 58 c2       	addss  xmm0,xmm10
   1405aa416:	f3 44 0f 2c f0       	cvttss2si r14d,xmm0
   1405aa41b:	41 0f 28 c7          	movaps xmm0,xmm15
   1405aa41f:	ff 15 83 f6 0d 00    	call   QWORD PTR [rip+0xdf683]        # 0x140689aa8
   1405aa425:	8b 94 24 70 01 00 00 	mov    edx,DWORD PTR [rsp+0x170]
   1405aa42c:	f2 0f 2c c0          	cvttsd2si eax,xmm0
   1405aa430:	41 03 c6             	add    eax,r14d
   1405aa433:	3b c2                	cmp    eax,edx
   1405aa435:	0f 8c 28 03 00 00    	jl     0x1405aa763
   1405aa43b:	8b 84 24 78 01 00 00 	mov    eax,DWORD PTR [rsp+0x178]
   1405aa442:	41 8b cf             	mov    ecx,r15d
   1405aa445:	41 2b cd             	sub    ecx,r13d
   1405aa448:	03 c2                	add    eax,edx
   1405aa44a:	3b c8                	cmp    ecx,eax
   1405aa44c:	0f 8d 24 03 00 00    	jge    0x1405aa776
   1405aa452:	80 bc 24 90 01 00 00 	cmp    BYTE PTR [rsp+0x190],0x0
   1405aa459:	00 
   1405aa45a:	74 44                	je     0x1405aa4a0
   1405aa45c:	80 3d f6 06 30 17 00 	cmp    BYTE PTR [rip+0x173006f6],0x0        # 0x1578aab59
   1405aa463:	0f 57 c0             	xorps  xmm0,xmm0
   1405aa466:	8b 05 f8 03 30 17    	mov    eax,DWORD PTR [rip+0x173003f8]        # 0x1578aa864
   1405aa46c:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1405aa471:	f3 41 0f 59 c5       	mulss  xmm0,xmm13
   1405aa476:	f3 41 0f 58 c6       	addss  xmm0,xmm14
   1405aa47b:	f3 0f 2c c8          	cvttss2si ecx,xmm0
   1405aa47f:	74 09                	je     0x1405aa48a
   1405aa481:	44 3b f9             	cmp    r15d,ecx
   1405aa484:	0f 8c d9 02 00 00    	jl     0x1405aa763
   1405aa48a:	80 3d c9 06 30 17 00 	cmp    BYTE PTR [rip+0x173006c9],0x0        # 0x1578aab5a
   1405aa491:	74 0d                	je     0x1405aa4a0
   1405aa493:	8b c7                	mov    eax,edi
   1405aa495:	2b c1                	sub    eax,ecx
   1405aa497:	44 3b f0             	cmp    r14d,eax
   1405aa49a:	0f 8d d6 02 00 00    	jge    0x1405aa776
   1405aa4a0:	0f b6 43 60          	movzx  eax,BYTE PTR [rbx+0x60]
   1405aa4a4:	0f b6 bc 24 80 01 00 	movzx  edi,BYTE PTR [rsp+0x180]
   1405aa4ab:	00 
   1405aa4ac:	3b f0                	cmp    esi,eax
   1405aa4ae:	0f 83 a8 02 00 00    	jae    0x1405aa75c
   1405aa4b4:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   1405aa4b7:	44 8b 03             	mov    r8d,DWORD PTR [rbx]
   1405aa4ba:	41 3b d0             	cmp    edx,r8d
   1405aa4bd:	0f 8e 99 02 00 00    	jle    0x1405aa75c
   1405aa4c3:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   1405aa4ca:	00 
   1405aa4cb:	7d 0b                	jge    0x1405aa4d8
   1405aa4cd:	33 c0                	xor    eax,eax
   1405aa4cf:	44 8b c8             	mov    r9d,eax
   1405aa4d2:	44 8d 50 01          	lea    r10d,[rax+0x1]
   1405aa4d6:	eb 1c                	jmp    0x1405aa4f4
   1405aa4d8:	41 3b e8             	cmp    ebp,r8d
   1405aa4db:	44 8d 4a ff          	lea    r9d,[rdx-0x1]
   1405aa4df:	8b c5                	mov    eax,ebp
   1405aa4e1:	44 8b d2             	mov    r10d,edx
   1405aa4e4:	41 0f 4c c0          	cmovl  eax,r8d
   1405aa4e8:	3b c2                	cmp    eax,edx
   1405aa4ea:	44 0f 4c c8          	cmovl  r9d,eax
   1405aa4ee:	45 2b c8             	sub    r9d,r8d
   1405aa4f1:	45 2b d0             	sub    r10d,r8d
   1405aa4f4:	0f b6 44 33 61       	movzx  eax,BYTE PTR [rbx+rsi*1+0x61]
   1405aa4f9:	4c 8b 9c f3 98 00 00 	mov    r11,QWORD PTR [rbx+rsi*8+0x98]
   1405aa500:	00 
   1405aa501:	3b f8                	cmp    edi,eax
   1405aa503:	0f 83 4c 02 00 00    	jae    0x1405aa755
   1405aa509:	49 8b 4b 10          	mov    rcx,QWORD PTR [r11+0x10]
   1405aa50d:	85 ff                	test   edi,edi
   1405aa50f:	8b c7                	mov    eax,edi
   1405aa511:	0f 44 84 24 a8 01 00 	cmove  eax,DWORD PTR [rsp+0x1a8]
   1405aa518:	00 
   1405aa519:	41 0f af c2          	imul   eax,r10d
   1405aa51d:	41 03 c1             	add    eax,r9d
   1405aa520:	f3 44 0f 10 04 81    	movss  xmm8,DWORD PTR [rcx+rax*4]
   1405aa526:	45 0f 2e c3          	ucomiss xmm8,xmm11
   1405aa52a:	7a 06                	jp     0x1405aa532
   1405aa52c:	0f 84 23 02 00 00    	je     0x1405aa755
   1405aa532:	44 0f b6 4c 33 61    	movzx  r9d,BYTE PTR [rbx+rsi*1+0x61]
   1405aa538:	41 3b f9             	cmp    edi,r9d
   1405aa53b:	73 2e                	jae    0x1405aa56b
   1405aa53d:	41 3b e8             	cmp    ebp,r8d
   1405aa540:	8d 4a ff             	lea    ecx,[rdx-0x1]
   1405aa543:	8b c5                	mov    eax,ebp
   1405aa545:	41 0f 4c c0          	cmovl  eax,r8d
   1405aa549:	3b c2                	cmp    eax,edx
   1405aa54b:	0f 4c c8             	cmovl  ecx,eax
   1405aa54e:	8b c2                	mov    eax,edx
   1405aa550:	41 2b c0             	sub    eax,r8d
   1405aa553:	0f af c7             	imul   eax,edi
   1405aa556:	03 c8                	add    ecx,eax
   1405aa558:	49 8b 03             	mov    rax,QWORD PTR [r11]
   1405aa55b:	41 2b c8             	sub    ecx,r8d
   1405aa55e:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   1405aa562:	66 0f 6e c1          	movd   xmm0,ecx
   1405aa566:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1405aa569:	eb 04                	jmp    0x1405aa56f
   1405aa56b:	41 0f 28 c3          	movaps xmm0,xmm11
   1405aa56f:	49 8b 4b 08          	mov    rcx,QWORD PTR [r11+0x8]
   1405aa573:	0f 57 ff             	xorps  xmm7,xmm7
   1405aa576:	f3 0f 5a f8          	cvtss2sd xmm7,xmm0
   1405aa57a:	48 85 c9             	test   rcx,rcx
   1405aa57d:	74 1e                	je     0x1405aa59d
   1405aa57f:	41 3b e8             	cmp    ebp,r8d
   1405aa582:	7c 19                	jl     0x1405aa59d
   1405aa584:	3b ea                	cmp    ebp,edx
   1405aa586:	7d 15                	jge    0x1405aa59d
   1405aa588:	41 3b f9             	cmp    edi,r9d
   1405aa58b:	73 10                	jae    0x1405aa59d
   1405aa58d:	41 2b d0             	sub    edx,r8d
   1405aa590:	0f af d7             	imul   edx,edi
   1405aa593:	41 2b d0             	sub    edx,r8d
   1405aa596:	03 d5                	add    edx,ebp
   1405aa598:	8b 0c 91             	mov    ecx,DWORD PTR [rcx+rdx*4]
   1405aa59b:	eb 04                	jmp    0x1405aa5a1
   1405aa59d:	33 c0                	xor    eax,eax
   1405aa59f:	8b c8                	mov    ecx,eax
   1405aa5a1:	0f 57 c0             	xorps  xmm0,xmm0
   1405aa5a4:	0f b7 c1             	movzx  eax,cx
   1405aa5a7:	c1 e9 10             	shr    ecx,0x10
   1405aa5aa:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1405aa5af:	8b c1                	mov    eax,ecx
   1405aa5b1:	f3 41 0f 59 c4       	mulss  xmm0,xmm12
   1405aa5b6:	f3 0f 11 84 24 48 01 	movss  DWORD PTR [rsp+0x148],xmm0
   1405aa5bd:	00 00 
   1405aa5bf:	0f 57 c0             	xorps  xmm0,xmm0
   1405aa5c2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1405aa5c7:	8b 05 97 02 30 17    	mov    eax,DWORD PTR [rip+0x17300297]        # 0x1578aa864
   1405aa5cd:	f3 41 0f 59 c4       	mulss  xmm0,xmm12
   1405aa5d2:	f3 0f 11 84 24 4c 01 	movss  DWORD PTR [rsp+0x14c],xmm0
   1405aa5d9:	00 00 
   1405aa5db:	0f 57 c0             	xorps  xmm0,xmm0
   1405aa5de:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1405aa5e3:	f3 0f 59 c6          	mulss  xmm0,xmm6
   1405aa5e7:	ff 15 83 f4 0d 00    	call   QWORD PTR [rip+0xdf483]        # 0x140689a70
   1405aa5ed:	0f b6 43 60          	movzx  eax,BYTE PTR [rbx+0x60]
   1405aa5f1:	39 84 24 50 01 00 00 	cmp    DWORD PTR [rsp+0x150],eax
   1405aa5f8:	73 39                	jae    0x1405aa633
   1405aa5fa:	48 8b 84 f3 98 00 00 	mov    rax,QWORD PTR [rbx+rsi*8+0x98]
   1405aa601:	00 
   1405aa602:	4c 8b 40 18          	mov    r8,QWORD PTR [rax+0x18]
   1405aa606:	4d 85 c0             	test   r8,r8
   1405aa609:	74 28                	je     0x1405aa633
   1405aa60b:	8b 13                	mov    edx,DWORD PTR [rbx]
   1405aa60d:	3b ea                	cmp    ebp,edx
   1405aa60f:	7c 22                	jl     0x1405aa633
   1405aa611:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   1405aa614:	3b e9                	cmp    ebp,ecx
   1405aa616:	7d 1b                	jge    0x1405aa633
   1405aa618:	0f b6 44 33 61       	movzx  eax,BYTE PTR [rbx+rsi*1+0x61]
   1405aa61d:	3b f8                	cmp    edi,eax
   1405aa61f:	73 12                	jae    0x1405aa633
   1405aa621:	2b ca                	sub    ecx,edx
   1405aa623:	0f af cf             	imul   ecx,edi
   1405aa626:	2b ca                	sub    ecx,edx
   1405aa628:	03 cd                	add    ecx,ebp
   1405aa62a:	33 ff                	xor    edi,edi
   1405aa62c:	41 0f b7 34 48       	movzx  esi,WORD PTR [r8+rcx*2]
   1405aa631:	eb 04                	jmp    0x1405aa637
   1405aa633:	33 ff                	xor    edi,edi
   1405aa635:	8b f7                	mov    esi,edi
   1405aa637:	8b 94 24 58 01 00 00 	mov    edx,DWORD PTR [rsp+0x158]
   1405aa63e:	41 0f 28 d0          	movaps xmm2,xmm8
   1405aa642:	48 8b cb             	mov    rcx,rbx
   1405aa645:	e8 76 df ff ff       	call   0x1405a85c0
   1405aa64a:	0f b7 43 20          	movzx  eax,WORD PTR [rbx+0x20]
   1405aa64e:	0f 57 c9             	xorps  xmm1,xmm1
   1405aa651:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   1405aa655:	b9 fd ff 00 00       	mov    ecx,0xfffd
   1405aa65a:	f2 0f 59 f9          	mulsd  xmm7,xmm1
   1405aa65e:	66 3b c1             	cmp    ax,cx
   1405aa661:	75 05                	jne    0x1405aa668
   1405aa663:	0f b7 cf             	movzx  ecx,di
   1405aa666:	eb 6f                	jmp    0x1405aa6d7
   1405aa668:	8b 94 24 58 01 00 00 	mov    edx,DWORD PTR [rsp+0x158]
   1405aa66f:	b9 ff ff 00 00       	mov    ecx,0xffff
   1405aa674:	66 3b c1             	cmp    ax,cx
   1405aa677:	0f 45 f8             	cmovne edi,eax
   1405aa67a:	8b cf                	mov    ecx,edi
   1405aa67c:	e8 af 38 dd ff       	call   0x14037df30
   1405aa681:	48 8b d0             	mov    rdx,rax
   1405aa684:	48 85 c0             	test   rax,rax
   1405aa687:	74 4b                	je     0x1405aa6d4
   1405aa689:	b8 fd ff 00 00       	mov    eax,0xfffd
   1405aa68e:	3b f8                	cmp    edi,eax
   1405aa690:	75 06                	jne    0x1405aa698
   1405aa692:	33 c0                	xor    eax,eax
   1405aa694:	8b c8                	mov    ecx,eax
   1405aa696:	eb 1a                	jmp    0x1405aa6b2
   1405aa698:	48 63 84 24 58 01 00 	movsxd rax,DWORD PTR [rsp+0x158]
   1405aa69f:	00 
   1405aa6a0:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1405aa6a7:	48 8d 05 fc 45 44 00 	lea    rax,[rip+0x4445fc]        # 0x1409eecaa
   1405aa6ae:	0f bf 0c 01          	movsx  ecx,WORD PTR [rcx+rax*1]
   1405aa6b2:	0f bf 42 0a          	movsx  eax,WORD PTR [rdx+0xa]
   1405aa6b6:	03 c8                	add    ecx,eax
   1405aa6b8:	81 f9 ff 7f 00 00    	cmp    ecx,0x7fff
   1405aa6be:	7d 0d                	jge    0x1405aa6cd
   1405aa6c0:	b8 01 80 ff ff       	mov    eax,0xffff8001
   1405aa6c5:	3b c8                	cmp    ecx,eax
   1405aa6c7:	7f 0e                	jg     0x1405aa6d7
   1405aa6c9:	8b c8                	mov    ecx,eax
   1405aa6cb:	eb 0a                	jmp    0x1405aa6d7
   1405aa6cd:	b9 ff 7f 00 00       	mov    ecx,0x7fff
   1405aa6d2:	eb 03                	jmp    0x1405aa6d7
   1405aa6d4:	0f b7 c8             	movzx  ecx,ax
   1405aa6d7:	0f bf d1             	movsx  edx,cx
   1405aa6da:	0f bf c6             	movsx  eax,si
   1405aa6dd:	03 d0                	add    edx,eax
   1405aa6df:	81 fa ff 7f 00 00    	cmp    edx,0x7fff
   1405aa6e5:	7d 0e                	jge    0x1405aa6f5
   1405aa6e7:	b8 01 80 ff ff       	mov    eax,0xffff8001
   1405aa6ec:	3b d0                	cmp    edx,eax
   1405aa6ee:	7f 0a                	jg     0x1405aa6fa
   1405aa6f0:	0f b7 d0             	movzx  edx,ax
   1405aa6f3:	eb 05                	jmp    0x1405aa6fa
   1405aa6f5:	ba ff 7f 00 00       	mov    edx,0x7fff
   1405aa6fa:	8b 84 24 88 01 00 00 	mov    eax,DWORD PTR [rsp+0x188]
   1405aa701:	45 2b f7             	sub    r14d,r15d
   1405aa704:	8b bc 24 68 01 00 00 	mov    edi,DWORD PTR [rsp+0x168]
   1405aa70b:	45 8b ce             	mov    r9d,r14d
   1405aa70e:	48 8b 8c 24 40 01 00 	mov    rcx,QWORD PTR [rsp+0x140]
   1405aa715:	00 
   1405aa716:	45 8b c7             	mov    r8d,r15d
   1405aa719:	44 89 6c 24 48       	mov    DWORD PTR [rsp+0x48],r13d
   1405aa71e:	89 44 24 40          	mov    DWORD PTR [rsp+0x40],eax
   1405aa722:	48 8d 84 24 48 01 00 	lea    rax,[rsp+0x148]
   1405aa729:	00 
   1405aa72a:	66 89 54 24 38       	mov    WORD PTR [rsp+0x38],dx
   1405aa72f:	8b d7                	mov    edx,edi
   1405aa731:	66 0f 5a c7          	cvtpd2ps xmm0,xmm7
   1405aa735:	f3 0f 11 44 24 30    	movss  DWORD PTR [rsp+0x30],xmm0
   1405aa73b:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   1405aa740:	f3 44 0f 11 44 24 20 	movss  DWORD PTR [rsp+0x20],xmm8
   1405aa747:	e8 b4 55 00 00       	call   0x1405afd00
   1405aa74c:	8b b4 24 50 01 00 00 	mov    esi,DWORD PTR [rsp+0x150]
   1405aa753:	eb 0e                	jmp    0x1405aa763
   1405aa755:	8b b4 24 50 01 00 00 	mov    esi,DWORD PTR [rsp+0x150]
   1405aa75c:	8b bc 24 68 01 00 00 	mov    edi,DWORD PTR [rsp+0x168]
   1405aa763:	ff c5                	inc    ebp
   1405aa765:	49 83 c4 04          	add    r12,0x4
   1405aa769:	3b ac 24 b0 01 00 00 	cmp    ebp,DWORD PTR [rsp+0x1b0]
   1405aa770:	0f 8c 3a fc ff ff    	jl     0x1405aa3b0
   1405aa776:	44 0f 28 84 24 c0 00 	movaps xmm8,XMMWORD PTR [rsp+0xc0]
   1405aa77d:	00 00 
   1405aa77f:	0f                   	.byte 0xf
