
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140370070 <.text+0x36f070>:
   140370070:	40 53                	rex push rbx
   140370072:	55                   	push   rbp
   140370073:	56                   	push   rsi
   140370074:	57                   	push   rdi
   140370075:	41 57                	push   r15
   140370077:	48 81 ec c0 00 00 00 	sub    rsp,0xc0
   14037007e:	48 8b 05 e3 20 60 00 	mov    rax,QWORD PTR [rip+0x6020e3]        # 0x140972168
   140370085:	48 33 c4             	xor    rax,rsp
   140370088:	48 89 84 24 98 00 00 	mov    QWORD PTR [rsp+0x98],rax
   14037008f:	00 
   140370090:	8b 02                	mov    eax,DWORD PTR [rdx]
   140370092:	41 0f b6 e9          	movzx  ebp,r9b
   140370096:	4d 8b f8             	mov    r15,r8
   140370099:	4c 89 44 24 48       	mov    QWORD PTR [rsp+0x48],r8
   14037009e:	48 8b da             	mov    rbx,rdx
   1403700a1:	48 8b f1             	mov    rsi,rcx
   1403700a4:	41 39 00             	cmp    DWORD PTR [r8],eax
   1403700a7:	7d 0e                	jge    0x1403700b7
   1403700a9:	48 8b c2             	mov    rax,rdx
   1403700ac:	48 89 54 24 48       	mov    QWORD PTR [rsp+0x48],rdx
   1403700b1:	49 8b d8             	mov    rbx,r8
   1403700b4:	4c 8b fa             	mov    r15,rdx
   1403700b7:	41 8b 7f 04          	mov    edi,DWORD PTR [r15+0x4]
   1403700bb:	3b 7b 04             	cmp    edi,DWORD PTR [rbx+0x4]
   1403700be:	7f 0f                	jg     0x1403700cf
   1403700c0:	49 8b cf             	mov    rcx,r15
   1403700c3:	e8 c8 7e 00 00       	call   0x140377f90
   1403700c8:	b0 01                	mov    al,0x1
   1403700ca:	e9 c0 00 00 00       	jmp    0x14037018f
   1403700cf:	4c 89 b4 24 b0 00 00 	mov    QWORD PTR [rsp+0xb0],r14
   1403700d6:	00 
   1403700d7:	45 33 f6             	xor    r14d,r14d
   1403700da:	45 8b ce             	mov    r9d,r14d
   1403700dd:	41 8b d6             	mov    edx,r14d
   1403700e0:	48 83 fa 30          	cmp    rdx,0x30
   1403700e4:	0f 83 97 08 00 00    	jae    0x140370981
   1403700ea:	44 0f b6 5b 60       	movzx  r11d,BYTE PTR [rbx+0x60]
   1403700ef:	45 32 c0             	xor    r8b,r8b
   1403700f2:	44 88 74 14 68       	mov    BYTE PTR [rsp+rdx*1+0x68],r14b
   1403700f7:	45 3b cb             	cmp    r9d,r11d
   1403700fa:	7d 12                	jge    0x14037010e
   1403700fc:	44 0f b6 44 1a 61    	movzx  r8d,BYTE PTR [rdx+rbx*1+0x61]
   140370102:	45 84 c0             	test   r8b,r8b
   140370105:	45 0f 44 c6          	cmove  r8d,r14d
   140370109:	44 88 44 14 68       	mov    BYTE PTR [rsp+rdx*1+0x68],r8b
   14037010e:	45 0f b6 57 60       	movzx  r10d,BYTE PTR [r15+0x60]
   140370113:	45 3b ca             	cmp    r9d,r10d
   140370116:	7d 14                	jge    0x14037012c
   140370118:	42 0f b6 4c 3a 61    	movzx  ecx,BYTE PTR [rdx+r15*1+0x61]
   14037011e:	44 3a c1             	cmp    r8b,cl
   140370121:	41 0f b6 c0          	movzx  eax,r8b
   140370125:	0f 43 c8             	cmovae ecx,eax
   140370128:	88 4c 14 68          	mov    BYTE PTR [rsp+rdx*1+0x68],cl
   14037012c:	41 ff c1             	inc    r9d
   14037012f:	48 ff c2             	inc    rdx
   140370132:	41 83 f9 30          	cmp    r9d,0x30
   140370136:	72 a8                	jb     0x1403700e0
   140370138:	2b 3b                	sub    edi,DWORD PTR [rbx]
   14037013a:	4c 8d 4c 24 68       	lea    r9,[rsp+0x68]
   14037013f:	45 3a da             	cmp    r11b,r10b
   140370142:	40 88 6c 24 30       	mov    BYTE PTR [rsp+0x30],bpl
   140370147:	45 8b c2             	mov    r8d,r10d
   14037014a:	0f 29 b4 24 a0 00 00 	movaps XMMWORD PTR [rsp+0xa0],xmm6
   140370151:	00 
   140370152:	0f 57 f6             	xorps  xmm6,xmm6
   140370155:	c7 44 24 28 ff ff ff 	mov    DWORD PTR [rsp+0x28],0xffffffff
   14037015c:	ff 
   14037015d:	45 0f 43 c3          	cmovae r8d,r11d
   140370161:	f3 0f 11 74 24 20    	movss  DWORD PTR [rsp+0x20],xmm6
   140370167:	8b d7                	mov    edx,edi
   140370169:	48 8b cb             	mov    rcx,rbx
   14037016c:	e8 3f 8d ff ff       	call   0x140368eb0
   140370171:	84 c0                	test   al,al
   140370173:	75 38                	jne    0x1403701ad
   140370175:	49 8b cf             	mov    rcx,r15
   140370178:	e8 13 7e 00 00       	call   0x140377f90
   14037017d:	32 c0                	xor    al,al
   14037017f:	0f 28 b4 24 a0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xa0]
   140370186:	00 
   140370187:	4c 8b b4 24 b0 00 00 	mov    r14,QWORD PTR [rsp+0xb0]
   14037018e:	00 
   14037018f:	48 8b 8c 24 98 00 00 	mov    rcx,QWORD PTR [rsp+0x98]
   140370196:	00 
   140370197:	48 33 cc             	xor    rcx,rsp
   14037019a:	e8 61 b4 2a 00       	call   0x14061b600
   14037019f:	48 81 c4 c0 00 00 00 	add    rsp,0xc0
   1403701a6:	41 5f                	pop    r15
   1403701a8:	5f                   	pop    rdi
   1403701a9:	5e                   	pop    rsi
   1403701aa:	5d                   	pop    rbp
   1403701ab:	5b                   	pop    rbx
   1403701ac:	c3                   	ret
   1403701ad:	41 8b 4f 04          	mov    ecx,DWORD PTR [r15+0x4]
   1403701b1:	41 b9 01 00 00 00    	mov    r9d,0x1
   1403701b7:	8b 56 24             	mov    edx,DWORD PTR [rsi+0x24]
   1403701ba:	44 8b f1             	mov    r14d,ecx
   1403701bd:	44 2b 33             	sub    r14d,DWORD PTR [rbx]
   1403701c0:	d1 ea                	shr    edx,1
   1403701c2:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   1403701c9:	00 
   1403701ca:	4c 89 ac 24 b8 00 00 	mov    QWORD PTR [rsp+0xb8],r13
   1403701d1:	00 
   1403701d2:	44 89 74 24 54       	mov    DWORD PTR [rsp+0x54],r14d
   1403701d7:	7d 0c                	jge    0x1403701e5
   1403701d9:	45 3b f1             	cmp    r14d,r9d
   1403701dc:	45 8b e9             	mov    r13d,r9d
   1403701df:	45 0f 4c ee          	cmovl  r13d,r14d
   1403701e3:	eb 03                	jmp    0x1403701e8
   1403701e5:	45 8b ee             	mov    r13d,r14d
   1403701e8:	45 8b 07             	mov    r8d,DWORD PTR [r15]
   1403701eb:	44 8b d9             	mov    r11d,ecx
   1403701ee:	45 2b d8             	sub    r11d,r8d
   1403701f1:	66 41 83 bf 1c 02 00 	cmp    WORD PTR [r15+0x21c],0x0
   1403701f8:	00 00 
   1403701fa:	44 89 5c 24 44       	mov    DWORD PTR [rsp+0x44],r11d
   1403701ff:	7d 0e                	jge    0x14037020f
   140370201:	45 3b d9             	cmp    r11d,r9d
   140370204:	45 0f 4c cb          	cmovl  r9d,r11d
   140370208:	44 89 4c 24 50       	mov    DWORD PTR [rsp+0x50],r9d
   14037020d:	eb 05                	jmp    0x140370214
   14037020f:	44 89 5c 24 50       	mov    DWORD PTR [rsp+0x50],r11d
   140370214:	8b 43 04             	mov    eax,DWORD PTR [rbx+0x4]
   140370217:	41 3b c0             	cmp    eax,r8d
   14037021a:	44 8b d0             	mov    r10d,eax
   14037021d:	45 0f 4d d0          	cmovge r10d,r8d
   140370221:	4c 8b 44 24 48       	mov    r8,QWORD PTR [rsp+0x48]
   140370226:	2b c2                	sub    eax,edx
   140370228:	41 3b c2             	cmp    eax,r10d
   14037022b:	44 0f 4d d0          	cmovge r10d,eax
   14037022f:	44 3b d1             	cmp    r10d,ecx
   140370232:	0f 8d c4 06 00 00    	jge    0x1403708fc
   140370238:	4c 89 a4 24 08 01 00 	mov    QWORD PTR [rsp+0x108],r12
   14037023f:	00 
   140370240:	41 8b 00             	mov    eax,DWORD PTR [r8]
   140370243:	44 3b d0             	cmp    r10d,eax
   140370246:	0f 8d 1d 04 00 00    	jge    0x140370669
   14037024c:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   14037024f:	44 3b d1             	cmp    r10d,ecx
   140370252:	0f 8c 87 06 00 00    	jl     0x1403708df
   140370258:	44 8b 03             	mov    r8d,DWORD PTR [rbx]
   14037025b:	ff c9                	dec    ecx
   14037025d:	41 3b c8             	cmp    ecx,r8d
   140370260:	7c 61                	jl     0x1403702c3
   140370262:	4c 8b 4b 08          	mov    r9,QWORD PTR [rbx+0x8]
   140370266:	8b d1                	mov    edx,ecx
   140370268:	44 0f b7 9b 1c 02 00 	movzx  r11d,WORD PTR [rbx+0x21c]
   14037026f:	00 
   140370270:	41 2b d0             	sub    edx,r8d
   140370273:	33 ed                	xor    ebp,ebp
   140370275:	66 45 85 db          	test   r11w,r11w
   140370279:	8b c5                	mov    eax,ebp
   14037027b:	0f 49 c2             	cmovns eax,edx
   14037027e:	48 98                	cdqe
   140370280:	f3 41 0f 10 04 81    	movss  xmm0,DWORD PTR [r9+rax*4]
   140370286:	0f 2e c6             	ucomiss xmm0,xmm6
   140370289:	7a 0d                	jp     0x140370298
   14037028b:	75 0b                	jne    0x140370298
   14037028d:	ff c9                	dec    ecx
   14037028f:	ff ca                	dec    edx
   140370291:	41 3b c8             	cmp    ecx,r8d
   140370294:	7d df                	jge    0x140370275
   140370296:	eb 2d                	jmp    0x1403702c5
   140370298:	41 2b c8             	sub    ecx,r8d
   14037029b:	8b c5                	mov    eax,ebp
   14037029d:	66 45 85 db          	test   r11w,r11w
   1403702a1:	0f 49 c1             	cmovns eax,ecx
   1403702a4:	41 8b ca             	mov    ecx,r10d
   1403702a7:	41 2b c8             	sub    ecx,r8d
   1403702aa:	48 63 d0             	movsxd rdx,eax
   1403702ad:	66 45 85 db          	test   r11w,r11w
   1403702b1:	8b c5                	mov    eax,ebp
   1403702b3:	0f 49 c1             	cmovns eax,ecx
   1403702b6:	48 63 c8             	movsxd rcx,eax
   1403702b9:	41 8b 04 91          	mov    eax,DWORD PTR [r9+rdx*4]
   1403702bd:	41 89 04 89          	mov    DWORD PTR [r9+rcx*4],eax
   1403702c1:	eb 02                	jmp    0x1403702c5
   1403702c3:	33 ed                	xor    ebp,ebp
   1403702c5:	48 8b 4b 10          	mov    rcx,QWORD PTR [rbx+0x10]
   1403702c9:	48 85 c9             	test   rcx,rcx
   1403702cc:	74 18                	je     0x1403702e6
   1403702ce:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   1403702d5:	00 
   1403702d6:	7d 04                	jge    0x1403702dc
   1403702d8:	8b c5                	mov    eax,ebp
   1403702da:	eb 05                	jmp    0x1403702e1
   1403702dc:	41 8b c2             	mov    eax,r10d
   1403702df:	2b 03                	sub    eax,DWORD PTR [rbx]
   1403702e1:	48 98                	cdqe
   1403702e3:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   1403702e6:	48 8d 7b 62          	lea    rdi,[rbx+0x62]
   1403702ea:	be 08 00 00 00       	mov    esi,0x8
   1403702ef:	4c 8d 83 a0 00 00 00 	lea    r8,[rbx+0xa0]
   1403702f6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   1403702fd:	00 00 00 
   140370300:	80 7f ff 00          	cmp    BYTE PTR [rdi-0x1],0x0
   140370304:	44 8b dd             	mov    r11d,ebp
   140370307:	0f 86 80 00 00 00    	jbe    0x14037038d
   14037030d:	0f 1f 00             	nop    DWORD PTR [rax]
   140370310:	49 8b 40 f8          	mov    rax,QWORD PTR [r8-0x8]
   140370314:	45 8b cb             	mov    r9d,r11d
   140370317:	45 0f af ce          	imul   r9d,r14d
   14037031b:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   14037031e:	41 8b d1             	mov    edx,r9d
   140370321:	2b 13                	sub    edx,DWORD PTR [rbx]
   140370323:	41 03 d2             	add    edx,r10d
   140370326:	66 89 2c 51          	mov    WORD PTR [rcx+rdx*2],bp
   14037032a:	49 8b 40 f8          	mov    rax,QWORD PTR [r8-0x8]
   14037032e:	48 8b 48 08          	mov    rcx,QWORD PTR [rax+0x8]
   140370332:	48 85 c9             	test   rcx,rcx
   140370335:	74 0f                	je     0x140370346
   140370337:	41 8b c1             	mov    eax,r9d
   14037033a:	2b 03                	sub    eax,DWORD PTR [rbx]
   14037033c:	41 03 c2             	add    eax,r10d
   14037033f:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   140370342:	49 8b 40 f8          	mov    rax,QWORD PTR [r8-0x8]
   140370346:	48 8b 50 10          	mov    rdx,QWORD PTR [rax+0x10]
   14037034a:	48 85 d2             	test   rdx,rdx
   14037034d:	74 1e                	je     0x14037036d
   14037034f:	41 8d 45 ff          	lea    eax,[r13-0x1]
   140370353:	41 8b ca             	mov    ecx,r10d
   140370356:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   140370358:	3b c8                	cmp    ecx,eax
   14037035a:	0f 4d c8             	cmovge ecx,eax
   14037035d:	41 8b c3             	mov    eax,r11d
   140370360:	41 0f af c5          	imul   eax,r13d
   140370364:	03 c8                	add    ecx,eax
   140370366:	89 2c 8a             	mov    DWORD PTR [rdx+rcx*4],ebp
   140370369:	49 8b 40 f8          	mov    rax,QWORD PTR [r8-0x8]
   14037036d:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   140370371:	48 85 c9             	test   rcx,rcx
   140370374:	74 0b                	je     0x140370381
   140370376:	44 2b 0b             	sub    r9d,DWORD PTR [rbx]
   140370379:	45 03 ca             	add    r9d,r10d
   14037037c:	66 42 89 2c 49       	mov    WORD PTR [rcx+r9*2],bp
   140370381:	0f b6 47 ff          	movzx  eax,BYTE PTR [rdi-0x1]
   140370385:	41 ff c3             	inc    r11d
   140370388:	44 3b d8             	cmp    r11d,eax
   14037038b:	72 83                	jb     0x140370310
   14037038d:	80 3f 00             	cmp    BYTE PTR [rdi],0x0
   140370390:	44 8b dd             	mov    r11d,ebp
   140370393:	0f 86 7f 00 00 00    	jbe    0x140370418
   140370399:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   1403703a0:	49 8b 00             	mov    rax,QWORD PTR [r8]
   1403703a3:	45 8b cb             	mov    r9d,r11d
   1403703a6:	45 0f af ce          	imul   r9d,r14d
   1403703aa:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1403703ad:	41 8b d1             	mov    edx,r9d
   1403703b0:	2b 13                	sub    edx,DWORD PTR [rbx]
   1403703b2:	41 03 d2             	add    edx,r10d
   1403703b5:	66 89 2c 51          	mov    WORD PTR [rcx+rdx*2],bp
   1403703b9:	49 8b 00             	mov    rax,QWORD PTR [r8]
   1403703bc:	48 8b 48 08          	mov    rcx,QWORD PTR [rax+0x8]
   1403703c0:	48 85 c9             	test   rcx,rcx
   1403703c3:	74 0e                	je     0x1403703d3
   1403703c5:	41 8b c1             	mov    eax,r9d
   1403703c8:	2b 03                	sub    eax,DWORD PTR [rbx]
   1403703ca:	41 03 c2             	add    eax,r10d
   1403703cd:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   1403703d0:	49 8b 00             	mov    rax,QWORD PTR [r8]
   1403703d3:	48 8b 50 10          	mov    rdx,QWORD PTR [rax+0x10]
   1403703d7:	48 85 d2             	test   rdx,rdx
   1403703da:	74 1d                	je     0x1403703f9
   1403703dc:	41 8d 45 ff          	lea    eax,[r13-0x1]
   1403703e0:	41 8b ca             	mov    ecx,r10d
   1403703e3:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   1403703e5:	3b c8                	cmp    ecx,eax
   1403703e7:	0f 4d c8             	cmovge ecx,eax
   1403703ea:	41 8b c3             	mov    eax,r11d
   1403703ed:	41 0f af c5          	imul   eax,r13d
   1403703f1:	03 c8                	add    ecx,eax
   1403703f3:	89 2c 8a             	mov    DWORD PTR [rdx+rcx*4],ebp
   1403703f6:	49 8b 00             	mov    rax,QWORD PTR [r8]
   1403703f9:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   1403703fd:	48 85 c9             	test   rcx,rcx
   140370400:	74 0b                	je     0x14037040d
   140370402:	44 2b 0b             	sub    r9d,DWORD PTR [rbx]
   140370405:	45 03 ca             	add    r9d,r10d
   140370408:	66 42 89 2c 49       	mov    WORD PTR [rcx+r9*2],bp
   14037040d:	0f b6 07             	movzx  eax,BYTE PTR [rdi]
   140370410:	41 ff c3             	inc    r11d
   140370413:	44 3b d8             	cmp    r11d,eax
   140370416:	72 88                	jb     0x1403703a0
   140370418:	80 7f 01 00          	cmp    BYTE PTR [rdi+0x1],0x0
   14037041c:	44 8b dd             	mov    r11d,ebp
   14037041f:	76 7d                	jbe    0x14037049e
   140370421:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   140370425:	45 8b cb             	mov    r9d,r11d
   140370428:	45 0f af ce          	imul   r9d,r14d
   14037042c:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   14037042f:	41 8b d1             	mov    edx,r9d
   140370432:	2b 13                	sub    edx,DWORD PTR [rbx]
   140370434:	41 03 d2             	add    edx,r10d
   140370437:	66 89 2c 51          	mov    WORD PTR [rcx+rdx*2],bp
   14037043b:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   14037043f:	48 8b 48 08          	mov    rcx,QWORD PTR [rax+0x8]
   140370443:	48 85 c9             	test   rcx,rcx
   140370446:	74 0f                	je     0x140370457
   140370448:	41 8b c1             	mov    eax,r9d
   14037044b:	2b 03                	sub    eax,DWORD PTR [rbx]
   14037044d:	41 03 c2             	add    eax,r10d
   140370450:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   140370453:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   140370457:	48 8b 50 10          	mov    rdx,QWORD PTR [rax+0x10]
   14037045b:	48 85 d2             	test   rdx,rdx
   14037045e:	74 1e                	je     0x14037047e
   140370460:	41 8d 45 ff          	lea    eax,[r13-0x1]
   140370464:	41 8b ca             	mov    ecx,r10d
   140370467:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   140370469:	3b c8                	cmp    ecx,eax
   14037046b:	0f 4d c8             	cmovge ecx,eax
   14037046e:	41 8b c3             	mov    eax,r11d
   140370471:	41 0f af c5          	imul   eax,r13d
   140370475:	03 c8                	add    ecx,eax
   140370477:	89 2c 8a             	mov    DWORD PTR [rdx+rcx*4],ebp
   14037047a:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   14037047e:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   140370482:	48 85 c9             	test   rcx,rcx
   140370485:	74 0b                	je     0x140370492
   140370487:	44 2b 0b             	sub    r9d,DWORD PTR [rbx]
   14037048a:	45 03 ca             	add    r9d,r10d
   14037048d:	66 42 89 2c 49       	mov    WORD PTR [rcx+r9*2],bp
   140370492:	0f b6 47 01          	movzx  eax,BYTE PTR [rdi+0x1]
   140370496:	41 ff c3             	inc    r11d
   140370499:	44 3b d8             	cmp    r11d,eax
   14037049c:	72 83                	jb     0x140370421
   14037049e:	80 7f 02 00          	cmp    BYTE PTR [rdi+0x2],0x0
   1403704a2:	44 8b dd             	mov    r11d,ebp
   1403704a5:	0f 86 82 00 00 00    	jbe    0x14037052d
   1403704ab:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   1403704b0:	49 8b 40 10          	mov    rax,QWORD PTR [r8+0x10]
   1403704b4:	45 8b cb             	mov    r9d,r11d
   1403704b7:	45 0f af ce          	imul   r9d,r14d
   1403704bb:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1403704be:	41 8b d1             	mov    edx,r9d
   1403704c1:	2b 13                	sub    edx,DWORD PTR [rbx]
   1403704c3:	41 03 d2             	add    edx,r10d
   1403704c6:	66 89 2c 51          	mov    WORD PTR [rcx+rdx*2],bp
   1403704ca:	49 8b 40 10          	mov    rax,QWORD PTR [r8+0x10]
   1403704ce:	48 8b 48 08          	mov    rcx,QWORD PTR [rax+0x8]
   1403704d2:	48 85 c9             	test   rcx,rcx
   1403704d5:	74 0f                	je     0x1403704e6
   1403704d7:	41 8b c1             	mov    eax,r9d
   1403704da:	2b 03                	sub    eax,DWORD PTR [rbx]
   1403704dc:	41 03 c2             	add    eax,r10d
   1403704df:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   1403704e2:	49 8b 40 10          	mov    rax,QWORD PTR [r8+0x10]
   1403704e6:	48 8b 50 10          	mov    rdx,QWORD PTR [rax+0x10]
   1403704ea:	48 85 d2             	test   rdx,rdx
   1403704ed:	74 1e                	je     0x14037050d
   1403704ef:	41 8d 45 ff          	lea    eax,[r13-0x1]
   1403704f3:	41 8b ca             	mov    ecx,r10d
   1403704f6:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   1403704f8:	3b c8                	cmp    ecx,eax
   1403704fa:	0f 4d c8             	cmovge ecx,eax
   1403704fd:	41 8b c3             	mov    eax,r11d
   140370500:	41 0f af c5          	imul   eax,r13d
   140370504:	03 c8                	add    ecx,eax
   140370506:	89 2c 8a             	mov    DWORD PTR [rdx+rcx*4],ebp
   140370509:	49 8b 40 10          	mov    rax,QWORD PTR [r8+0x10]
   14037050d:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   140370511:	48 85 c9             	test   rcx,rcx
   140370514:	74 0b                	je     0x140370521
   140370516:	44 2b 0b             	sub    r9d,DWORD PTR [rbx]
   140370519:	45 03 ca             	add    r9d,r10d
   14037051c:	66 42 89 2c 49       	mov    WORD PTR [rcx+r9*2],bp
   140370521:	0f b6 47 02          	movzx  eax,BYTE PTR [rdi+0x2]
   140370525:	41 ff c3             	inc    r11d
   140370528:	44 3b d8             	cmp    r11d,eax
   14037052b:	72 83                	jb     0x1403704b0
   14037052d:	80 7f 03 00          	cmp    BYTE PTR [rdi+0x3],0x0
   140370531:	44 8b dd             	mov    r11d,ebp
   140370534:	0f 86 83 00 00 00    	jbe    0x1403705bd
   14037053a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140370540:	49 8b 40 18          	mov    rax,QWORD PTR [r8+0x18]
   140370544:	45 8b cb             	mov    r9d,r11d
   140370547:	45 0f af ce          	imul   r9d,r14d
   14037054b:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   14037054e:	41 8b d1             	mov    edx,r9d
   140370551:	2b 13                	sub    edx,DWORD PTR [rbx]
   140370553:	41 03 d2             	add    edx,r10d
   140370556:	66 89 2c 51          	mov    WORD PTR [rcx+rdx*2],bp
   14037055a:	49 8b 40 18          	mov    rax,QWORD PTR [r8+0x18]
   14037055e:	48 8b 48 08          	mov    rcx,QWORD PTR [rax+0x8]
   140370562:	48 85 c9             	test   rcx,rcx
   140370565:	74 0f                	je     0x140370576
   140370567:	41 8b c1             	mov    eax,r9d
   14037056a:	2b 03                	sub    eax,DWORD PTR [rbx]
   14037056c:	41 03 c2             	add    eax,r10d
   14037056f:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   140370572:	49 8b 40 18          	mov    rax,QWORD PTR [r8+0x18]
   140370576:	48 8b 50 10          	mov    rdx,QWORD PTR [rax+0x10]
   14037057a:	48 85 d2             	test   rdx,rdx
   14037057d:	74 1e                	je     0x14037059d
   14037057f:	41 8d 45 ff          	lea    eax,[r13-0x1]
   140370583:	41 8b ca             	mov    ecx,r10d
   140370586:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   140370588:	3b c8                	cmp    ecx,eax
   14037058a:	0f 4d c8             	cmovge ecx,eax
   14037058d:	41 8b c3             	mov    eax,r11d
   140370590:	41 0f af c5          	imul   eax,r13d
   140370594:	03 c8                	add    ecx,eax
   140370596:	89 2c 8a             	mov    DWORD PTR [rdx+rcx*4],ebp
   140370599:	49 8b 40 18          	mov    rax,QWORD PTR [r8+0x18]
   14037059d:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   1403705a1:	48 85 c9             	test   rcx,rcx
   1403705a4:	74 0b                	je     0x1403705b1
   1403705a6:	44 2b 0b             	sub    r9d,DWORD PTR [rbx]
   1403705a9:	45 03 ca             	add    r9d,r10d
   1403705ac:	66 42 89 2c 49       	mov    WORD PTR [rcx+r9*2],bp
   1403705b1:	0f b6 47 03          	movzx  eax,BYTE PTR [rdi+0x3]
   1403705b5:	41 ff c3             	inc    r11d
   1403705b8:	44 3b d8             	cmp    r11d,eax
   1403705bb:	72 83                	jb     0x140370540
   1403705bd:	80 7f 04 00          	cmp    BYTE PTR [rdi+0x4],0x0
   1403705c1:	44 8b dd             	mov    r11d,ebp
   1403705c4:	0f 86 83 00 00 00    	jbe    0x14037064d
   1403705ca:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   1403705d0:	49 8b 40 20          	mov    rax,QWORD PTR [r8+0x20]
   1403705d4:	45 8b cb             	mov    r9d,r11d
   1403705d7:	45 0f af ce          	imul   r9d,r14d
   1403705db:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1403705de:	41 8b d1             	mov    edx,r9d
   1403705e1:	2b 13                	sub    edx,DWORD PTR [rbx]
   1403705e3:	41 03 d2             	add    edx,r10d
   1403705e6:	66 89 2c 51          	mov    WORD PTR [rcx+rdx*2],bp
   1403705ea:	49 8b 40 20          	mov    rax,QWORD PTR [r8+0x20]
   1403705ee:	48 8b 48 08          	mov    rcx,QWORD PTR [rax+0x8]
   1403705f2:	48 85 c9             	test   rcx,rcx
   1403705f5:	74 0f                	je     0x140370606
   1403705f7:	41 8b c1             	mov    eax,r9d
   1403705fa:	2b 03                	sub    eax,DWORD PTR [rbx]
   1403705fc:	41 03 c2             	add    eax,r10d
   1403705ff:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   140370602:	49 8b 40 20          	mov    rax,QWORD PTR [r8+0x20]
   140370606:	48 8b 50 10          	mov    rdx,QWORD PTR [rax+0x10]
   14037060a:	48 85 d2             	test   rdx,rdx
   14037060d:	74 1e                	je     0x14037062d
   14037060f:	41 8d 45 ff          	lea    eax,[r13-0x1]
   140370613:	41 8b ca             	mov    ecx,r10d
   140370616:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   140370618:	3b c8                	cmp    ecx,eax
   14037061a:	0f 4d c8             	cmovge ecx,eax
   14037061d:	41 8b c3             	mov    eax,r11d
   140370620:	41 0f af c5          	imul   eax,r13d
   140370624:	03 c8                	add    ecx,eax
   140370626:	89 2c 8a             	mov    DWORD PTR [rdx+rcx*4],ebp
   140370629:	49 8b 40 20          	mov    rax,QWORD PTR [r8+0x20]
   14037062d:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   140370631:	48 85 c9             	test   rcx,rcx
   140370634:	74 0b                	je     0x140370641
   140370636:	44 2b 0b             	sub    r9d,DWORD PTR [rbx]
   140370639:	45 03 ca             	add    r9d,r10d
   14037063c:	66 42 89 2c 49       	mov    WORD PTR [rcx+r9*2],bp
   140370641:	0f b6 47 04          	movzx  eax,BYTE PTR [rdi+0x4]
   140370645:	41 ff c3             	inc    r11d
   140370648:	44 3b d8             	cmp    r11d,eax
   14037064b:	72 83                	jb     0x1403705d0
   14037064d:	49 83 c0 30          	add    r8,0x30
   140370651:	48 83 c7 06          	add    rdi,0x6
   140370655:	48 83 ee 01          	sub    rsi,0x1
   140370659:	0f 85 a1 fc ff ff    	jne    0x140370300
   14037065f:	4c 8b 44 24 48       	mov    r8,QWORD PTR [rsp+0x48]
   140370664:	e9 76 02 00 00       	jmp    0x1403708df
   140370669:	33 ed                	xor    ebp,ebp
   14037066b:	41 8b ca             	mov    ecx,r10d
   14037066e:	2b c8                	sub    ecx,eax
   140370670:	8b c5                	mov    eax,ebp
   140370672:	66 41 39 80 1c 02 00 	cmp    WORD PTR [r8+0x21c],ax
   140370679:	00 
   14037067a:	0f 4d c1             	cmovge eax,ecx
   14037067d:	48 63 c8             	movsxd rcx,eax
   140370680:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   140370684:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   140370689:	48 8b 4b 08          	mov    rcx,QWORD PTR [rbx+0x8]
   14037068d:	66 39 ab 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],bp
   140370694:	7d 04                	jge    0x14037069a
   140370696:	8b c5                	mov    eax,ebp
   140370698:	eb 05                	jmp    0x14037069f
   14037069a:	41 8b c2             	mov    eax,r10d
   14037069d:	2b 03                	sub    eax,DWORD PTR [rbx]
   14037069f:	48 98                	cdqe
   1403706a1:	f3 0f 11 04 81       	movss  DWORD PTR [rcx+rax*4],xmm0
   1403706a6:	48 8b 4b 10          	mov    rcx,QWORD PTR [rbx+0x10]
   1403706aa:	48 85 c9             	test   rcx,rcx
   1403706ad:	74 5d                	je     0x14037070c
   1403706af:	49 8b 50 10          	mov    rdx,QWORD PTR [r8+0x10]
   1403706b3:	48 85 d2             	test   rdx,rdx
   1403706b6:	74 3d                	je     0x1403706f5
   1403706b8:	66 41 39 a8 1c 02 00 	cmp    WORD PTR [r8+0x21c],bp
   1403706bf:	00 
   1403706c0:	7d 04                	jge    0x1403706c6
   1403706c2:	8b c5                	mov    eax,ebp
   1403706c4:	eb 06                	jmp    0x1403706cc
   1403706c6:	41 8b c2             	mov    eax,r10d
   1403706c9:	41 2b 00             	sub    eax,DWORD PTR [r8]
   1403706cc:	48 98                	cdqe
   1403706ce:	f3 0f 10 04 82       	movss  xmm0,DWORD PTR [rdx+rax*4]
   1403706d3:	66 39 ab 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],bp
   1403706da:	7d 0b                	jge    0x1403706e7
   1403706dc:	8b c5                	mov    eax,ebp
   1403706de:	48 98                	cdqe
   1403706e0:	f3 0f 11 04 81       	movss  DWORD PTR [rcx+rax*4],xmm0
   1403706e5:	eb 25                	jmp    0x14037070c
   1403706e7:	41 8b c2             	mov    eax,r10d
   1403706ea:	2b 03                	sub    eax,DWORD PTR [rbx]
   1403706ec:	48 98                	cdqe
   1403706ee:	f3 0f 11 04 81       	movss  DWORD PTR [rcx+rax*4],xmm0
   1403706f3:	eb 17                	jmp    0x14037070c
   1403706f5:	66 39 ab 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],bp
   1403706fc:	7d 04                	jge    0x140370702
   1403706fe:	8b c5                	mov    eax,ebp
   140370700:	eb 05                	jmp    0x140370707
   140370702:	41 8b c2             	mov    eax,r10d
   140370705:	2b 03                	sub    eax,DWORD PTR [rbx]
   140370707:	48 98                	cdqe
   140370709:	89 2c 81             	mov    DWORD PTR [rcx+rax*4],ebp
   14037070c:	44 8b cd             	mov    r9d,ebp
   14037070f:	89 6c 24 40          	mov    DWORD PTR [rsp+0x40],ebp
   140370713:	40 38 6b 60          	cmp    BYTE PTR [rbx+0x60],bpl
   140370717:	0f 86 c2 01 00 00    	jbe    0x1403708df
   14037071d:	4d 8b e0             	mov    r12,r8
   140370720:	4c 8d 7b 61          	lea    r15,[rbx+0x61]
   140370724:	4c 2b e3             	sub    r12,rbx
   140370727:	4c 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],r15
   14037072c:	48 c7 c1 9f ff ff ff 	mov    rcx,0xffffffffffffff9f
   140370733:	48 8d bb 98 00 00 00 	lea    rdi,[rbx+0x98]
   14037073a:	48 2b cb             	sub    rcx,rbx
   14037073d:	48 89 4c 24 60       	mov    QWORD PTR [rsp+0x60],rcx
   140370742:	41 80 3f 00          	cmp    BYTE PTR [r15],0x0
   140370746:	8b f5                	mov    esi,ebp
   140370748:	0f 86 70 01 00 00    	jbe    0x1403708be
   14037074e:	66 90                	xchg   ax,ax
   140370750:	41 0f b6 40 60       	movzx  eax,BYTE PTR [r8+0x60]
   140370755:	44 3b c8             	cmp    r9d,eax
   140370758:	0f 8d c1 01 00 00    	jge    0x14037091f
   14037075e:	4a 8d 04 39          	lea    rax,[rcx+r15*1]
   140370762:	42 0f b6 4c 00 61    	movzx  ecx,BYTE PTR [rax+r8*1+0x61]
   140370768:	3b f1                	cmp    esi,ecx
   14037076a:	0f 83 af 01 00 00    	jae    0x14037091f
   140370770:	49 8b 04 3c          	mov    rax,QWORD PTR [r12+rdi*1]
   140370774:	8b ee                	mov    ebp,esi
   140370776:	41 0f af eb          	imul   ebp,r11d
   14037077a:	44 8b de             	mov    r11d,esi
   14037077d:	45 0f af de          	imul   r11d,r14d
   140370781:	44 8b cd             	mov    r9d,ebp
   140370784:	45 2b 08             	sub    r9d,DWORD PTR [r8]
   140370787:	41 8b d3             	mov    edx,r11d
   14037078a:	4c 8b 00             	mov    r8,QWORD PTR [rax]
   14037078d:	45 03 ca             	add    r9d,r10d
   140370790:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   140370793:	2b 13                	sub    edx,DWORD PTR [rbx]
   140370795:	41 03 d2             	add    edx,r10d
   140370798:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   14037079b:	43 0f b7 04 48       	movzx  eax,WORD PTR [r8+r9*2]
   1403707a0:	66 89 04 51          	mov    WORD PTR [rcx+rdx*2],ax
   1403707a4:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   1403707a7:	4c 8b 48 08          	mov    r9,QWORD PTR [rax+0x8]
   1403707ab:	4d 85 c9             	test   r9,r9
   1403707ae:	74 29                	je     0x1403707d9
   1403707b0:	49 8b 04 3c          	mov    rax,QWORD PTR [r12+rdi*1]
   1403707b4:	4c 8b 40 08          	mov    r8,QWORD PTR [rax+0x8]
   1403707b8:	4d 85 c0             	test   r8,r8
   1403707bb:	74 79                	je     0x140370836
   1403707bd:	48 8b 4c 24 48       	mov    rcx,QWORD PTR [rsp+0x48]
   1403707c2:	8b c5                	mov    eax,ebp
   1403707c4:	2b 01                	sub    eax,DWORD PTR [rcx]
   1403707c6:	41 8b cb             	mov    ecx,r11d
   1403707c9:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   1403707cb:	41 03 c2             	add    eax,r10d
   1403707ce:	41 03 ca             	add    ecx,r10d
   1403707d1:	41 8b 04 80          	mov    eax,DWORD PTR [r8+rax*4]
   1403707d5:	41 89 04 89          	mov    DWORD PTR [r9+rcx*4],eax
   1403707d9:	33 c9                	xor    ecx,ecx
   1403707db:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   1403707de:	4c 8b 70 10          	mov    r14,QWORD PTR [rax+0x10]
   1403707e2:	4d 85 f6             	test   r14,r14
   1403707e5:	74 77                	je     0x14037085e
   1403707e7:	49 8b 04 3c          	mov    rax,QWORD PTR [r12+rdi*1]
   1403707eb:	45 8d 4d ff          	lea    r9d,[r13-0x1]
   1403707ef:	44 8b c6             	mov    r8d,esi
   1403707f2:	45 0f af c5          	imul   r8d,r13d
   1403707f6:	4c 8b 78 10          	mov    r15,QWORD PTR [rax+0x10]
   1403707fa:	4d 85 ff             	test   r15,r15
   1403707fd:	74 47                	je     0x140370846
   1403707ff:	48 8b 44 24 48       	mov    rax,QWORD PTR [rsp+0x48]
   140370804:	41 8b ca             	mov    ecx,r10d
   140370807:	41 8b d2             	mov    edx,r10d
   14037080a:	2b 13                	sub    edx,DWORD PTR [rbx]
   14037080c:	2b 08                	sub    ecx,DWORD PTR [rax]
   14037080e:	8b 44 24 50          	mov    eax,DWORD PTR [rsp+0x50]
   140370812:	ff c8                	dec    eax
   140370814:	3b c8                	cmp    ecx,eax
   140370816:	0f 4d c8             	cmovge ecx,eax
   140370819:	8b c6                	mov    eax,esi
   14037081b:	0f af 44 24 50       	imul   eax,DWORD PTR [rsp+0x50]
   140370820:	03 c8                	add    ecx,eax
   140370822:	41 3b d1             	cmp    edx,r9d
   140370825:	41 0f 4d d1          	cmovge edx,r9d
   140370829:	41 8b 04 8f          	mov    eax,DWORD PTR [r15+rcx*4]
   14037082d:	41 03 d0             	add    edx,r8d
   140370830:	41 89 04 96          	mov    DWORD PTR [r14+rdx*4],eax
   140370834:	eb 23                	jmp    0x140370859
   140370836:	41 8b c3             	mov    eax,r11d
   140370839:	2b 03                	sub    eax,DWORD PTR [rbx]
   14037083b:	41 03 c2             	add    eax,r10d
   14037083e:	33 c9                	xor    ecx,ecx
   140370840:	41 89 0c 81          	mov    DWORD PTR [r9+rax*4],ecx
   140370844:	eb 95                	jmp    0x1403707db
   140370846:	41 8b c2             	mov    eax,r10d
   140370849:	2b 03                	sub    eax,DWORD PTR [rbx]
   14037084b:	41 3b c1             	cmp    eax,r9d
   14037084e:	41 0f 4d c1          	cmovge eax,r9d
   140370852:	41 03 c0             	add    eax,r8d
   140370855:	41 89 0c 86          	mov    DWORD PTR [r14+rax*4],ecx
   140370859:	4c 8b 7c 24 58       	mov    r15,QWORD PTR [rsp+0x58]
   14037085e:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   140370861:	44 8b 4c 24 40       	mov    r9d,DWORD PTR [rsp+0x40]
   140370866:	44 8b 74 24 54       	mov    r14d,DWORD PTR [rsp+0x54]
   14037086b:	48 8b 50 18          	mov    rdx,QWORD PTR [rax+0x18]
   14037086f:	48 85 d2             	test   rdx,rdx
   140370872:	74 2b                	je     0x14037089f
   140370874:	44 2b 1b             	sub    r11d,DWORD PTR [rbx]
   140370877:	49 8b 04 3c          	mov    rax,QWORD PTR [r12+rdi*1]
   14037087b:	45 03 da             	add    r11d,r10d
   14037087e:	4c 8b 40 18          	mov    r8,QWORD PTR [rax+0x18]
   140370882:	4d 85 c0             	test   r8,r8
   140370885:	0f 84 8b 00 00 00    	je     0x140370916
   14037088b:	48 8b 44 24 48       	mov    rax,QWORD PTR [rsp+0x48]
   140370890:	2b 28                	sub    ebp,DWORD PTR [rax]
   140370892:	41 03 ea             	add    ebp,r10d
   140370895:	41 0f b7 04 68       	movzx  eax,WORD PTR [r8+rbp*2]
   14037089a:	66 42 89 04 5a       	mov    WORD PTR [rdx+r11*2],ax
   14037089f:	33 ed                	xor    ebp,ebp
   1403708a1:	44 8b 5c 24 44       	mov    r11d,DWORD PTR [rsp+0x44]
   1403708a6:	41 0f b6 07          	movzx  eax,BYTE PTR [r15]
   1403708aa:	ff c6                	inc    esi
   1403708ac:	48 8b 4c 24 60       	mov    rcx,QWORD PTR [rsp+0x60]
   1403708b1:	4c 8b 44 24 48       	mov    r8,QWORD PTR [rsp+0x48]
   1403708b6:	3b f0                	cmp    esi,eax
   1403708b8:	0f 82 92 fe ff ff    	jb     0x140370750
   1403708be:	0f b6 43 60          	movzx  eax,BYTE PTR [rbx+0x60]
   1403708c2:	41 ff c1             	inc    r9d
   1403708c5:	49 ff c7             	inc    r15
   1403708c8:	44 89 4c 24 40       	mov    DWORD PTR [rsp+0x40],r9d
   1403708cd:	48 83 c7 08          	add    rdi,0x8
   1403708d1:	4c 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],r15
   1403708d6:	44 3b c8             	cmp    r9d,eax
   1403708d9:	0f 8c 63 fe ff ff    	jl     0x140370742
   1403708df:	41 8b 48 04          	mov    ecx,DWORD PTR [r8+0x4]
   1403708e3:	41 ff c2             	inc    r10d
   1403708e6:	44 8b 5c 24 44       	mov    r11d,DWORD PTR [rsp+0x44]
   1403708eb:	44 3b d1             	cmp    r10d,ecx
   1403708ee:	0f 8c 4c f9 ff ff    	jl     0x140370240
   1403708f4:	4c 8b a4 24 08 01 00 	mov    r12,QWORD PTR [rsp+0x108]
   1403708fb:	00 
   1403708fc:	89 4b 04             	mov    DWORD PTR [rbx+0x4],ecx
   1403708ff:	49 8b c8             	mov    rcx,r8
   140370902:	e8 89 76 00 00       	call   0x140377f90
   140370907:	4c 8b ac 24 b8 00 00 	mov    r13,QWORD PTR [rsp+0xb8]
   14037090e:	00 
   14037090f:	b0 01                	mov    al,0x1
   140370911:	e9 69 f8 ff ff       	jmp    0x14037017f
   140370916:	33 ed                	xor    ebp,ebp
   140370918:	66 42 89 2c 5a       	mov    WORD PTR [rdx+r11*2],bp
   14037091d:	eb 82                	jmp    0x1403708a1
   14037091f:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   140370922:	44 8b c6             	mov    r8d,esi
   140370925:	45 0f af c6          	imul   r8d,r14d
   140370929:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   14037092c:	41 8b d0             	mov    edx,r8d
   14037092f:	2b 13                	sub    edx,DWORD PTR [rbx]
   140370931:	41 03 d2             	add    edx,r10d
   140370934:	66 89 2c 51          	mov    WORD PTR [rcx+rdx*2],bp
   140370938:	41 8b d0             	mov    edx,r8d
   14037093b:	2b 13                	sub    edx,DWORD PTR [rbx]
   14037093d:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   140370940:	41 03 d2             	add    edx,r10d
   140370943:	48 8b 48 08          	mov    rcx,QWORD PTR [rax+0x8]
   140370947:	41 8d 45 ff          	lea    eax,[r13-0x1]
   14037094b:	89 2c 91             	mov    DWORD PTR [rcx+rdx*4],ebp
   14037094e:	41 8b ca             	mov    ecx,r10d
   140370951:	2b 0b                	sub    ecx,DWORD PTR [rbx]
   140370953:	8b d6                	mov    edx,esi
   140370955:	3b c8                	cmp    ecx,eax
   140370957:	0f 4d c8             	cmovge ecx,eax
   14037095a:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   14037095d:	41 0f af d5          	imul   edx,r13d
   140370961:	03 d1                	add    edx,ecx
   140370963:	48 8b 48 10          	mov    rcx,QWORD PTR [rax+0x10]
   140370967:	89 2c 91             	mov    DWORD PTR [rcx+rdx*4],ebp
   14037096a:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   14037096d:	44 2b 03             	sub    r8d,DWORD PTR [rbx]
   140370970:	45 03 c2             	add    r8d,r10d
   140370973:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   140370977:	66 42 89 2c 41       	mov    WORD PTR [rcx+r8*2],bp
   14037097c:	e9 25 ff ff ff       	jmp    0x1403708a6
   140370981:	e8 12 b2 2a 00       	call   0x14061bb98
   140370986:	cc                   	int3
   140370987:	cc                   	int3
   140370988:	cc                   	int3
   140370989:	cc                   	int3
   14037098a:	cc                   	int3
   14037098b:	cc                   	int3
   14037098c:	cc                   	int3
   14037098d:	cc                   	int3
   14037098e:	cc                   	int3
   14037098f:	cc                   	int3
   140370990:	8b 41 08             	mov    eax,DWORD PTR [rcx+0x8]
   140370993:	44 0f b7 da          	movzx  r11d,dx
   140370997:	2b 41 04             	sub    eax,DWORD PTR [rcx+0x4]
   14037099a:	4c 8b 41 38          	mov    r8,QWORD PTR [rcx+0x38]
   14037099e:	85 c0                	test   eax,eax
   1403709a0:	7e 50                	jle    0x1403709f2
   1403709a2:	49 81 c0 00 52 04 00 	add    r8,0x45200
   1403709a9:	44 8b d0             	mov    r10d,eax
   1403709ac:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403709b0:	33 d2                	xor    edx,edx
   1403709b2:	41 38 10             	cmp    BYTE PTR [r8],dl
   1403709b5:	76 2e                	jbe    0x1403709e5
   1403709b7:	45 0f b7 cb          	movzx  r9d,r11w
   1403709bb:	49 8d 80 04 ae fb ff 	lea    rax,[r8-0x451fc]
   1403709c2:	66 41 f7 d1          	not    r9w
   1403709c6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   1403709cd:	00 00 00 
   1403709d0:	66 44 21 08          	and    WORD PTR [rax],r9w
   1403709d4:	48 8d 80 e0 09 00 00 	lea    rax,[rax+0x9e0]
   1403709db:	41 0f b6 08          	movzx  ecx,BYTE PTR [r8]
   1403709df:	ff c2                	inc    edx
   1403709e1:	3b d1                	cmp    edx,ecx
   1403709e3:	7c eb                	jl     0x1403709d0
   1403709e5:	49 81 c0 08 52 04 00 	add    r8,0x45208
   1403709ec:	49 83 ea 01          	sub    r10,0x1
   1403709f0:	75 be                	jne    0x1403709b0
   1403709f2:	c3                   	ret
   1403709f3:	cc                   	int3
   1403709f4:	cc                   	int3
   1403709f5:	cc                   	int3
   1403709f6:	cc                   	int3
   1403709f7:	cc                   	int3
   1403709f8:	cc                   	int3
   1403709f9:	cc                   	int3
   1403709fa:	cc                   	int3
   1403709fb:	cc                   	int3
   1403709fc:	cc                   	int3
   1403709fd:	cc                   	int3
   1403709fe:	cc                   	int3
   1403709ff:	cc                   	int3
