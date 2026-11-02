
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031f060 <.text+0x31e060>:
   14031f060:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   14031f065:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   14031f06a:	48 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],rdi
   14031f06f:	41 56                	push   r14
   14031f071:	48 8b 74 24 30       	mov    rsi,QWORD PTR [rsp+0x30]
   14031f076:	33 db                	xor    ebx,ebx
   14031f078:	41 89 19             	mov    DWORD PTR [r9],ebx
   14031f07b:	4d 8b f1             	mov    r14,r9
   14031f07e:	4c 8b da             	mov    r11,rdx
   14031f081:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   14031f086:	4c 8b d1             	mov    r10,rcx
   14031f089:	44 89 06             	mov    DWORD PTR [rsi],r8d
   14031f08c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031f090:	8b 04 9e             	mov    eax,DWORD PTR [rsi+rbx*4]
   14031f093:	4d 63 0c 9e          	movsxd r9,DWORD PTR [r14+rbx*4]
   14031f097:	ff c8                	dec    eax
   14031f099:	44 3b c8             	cmp    r9d,eax
   14031f09c:	0f 8d f1 00 00 00    	jge    0x14031f193
   14031f0a2:	43 0f b7 2c 4a       	movzx  ebp,WORD PTR [r10+r9*2]
   14031f0a7:	4d 8b c1             	mov    r8,r9
   14031f0aa:	48 63 d0             	movsxd rdx,eax
   14031f0ad:	4c 3b ca             	cmp    r9,rdx
   14031f0b0:	0f 8d ba 00 00 00    	jge    0x14031f170
   14031f0b6:	0f b7 c5             	movzx  eax,bp
   14031f0b9:	48 69 f8 94 0d 00 00 	imul   rdi,rax,0xd94
   14031f0c0:	41 0f b7 04 52       	movzx  eax,WORD PTR [r10+rdx*2]
   14031f0c5:	f3 42 0f 10 44 1f 08 	movss  xmm0,DWORD PTR [rdi+r11*1+0x8]
   14031f0cc:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   14031f0d3:	42 0f 2f 44 19 08    	comiss xmm0,DWORD PTR [rcx+r11*1+0x8]
   14031f0d9:	72 22                	jb     0x14031f0fd
   14031f0db:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14031f0e0:	4c 3b c2             	cmp    r8,rdx
   14031f0e3:	7d 2d                	jge    0x14031f112
   14031f0e5:	41 0f b7 44 52 fe    	movzx  eax,WORD PTR [r10+rdx*2-0x2]
   14031f0eb:	48 ff ca             	dec    rdx
   14031f0ee:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   14031f0f5:	42 0f 2f 44 19 08    	comiss xmm0,DWORD PTR [rcx+r11*1+0x8]
   14031f0fb:	73 e3                	jae    0x14031f0e0
   14031f0fd:	4c 3b c2             	cmp    r8,rdx
   14031f100:	7d 10                	jge    0x14031f112
   14031f102:	41 0f b7 04 52       	movzx  eax,WORD PTR [r10+rdx*2]
   14031f107:	41 ff c1             	inc    r9d
   14031f10a:	66 43 89 04 42       	mov    WORD PTR [r10+r8*2],ax
   14031f10f:	49 ff c0             	inc    r8
   14031f112:	43 0f b7 04 42       	movzx  eax,WORD PTR [r10+r8*2]
   14031f117:	f3 42 0f 10 4c 1f 08 	movss  xmm1,DWORD PTR [rdi+r11*1+0x8]
   14031f11e:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   14031f125:	f3 42 0f 10 44 19 08 	movss  xmm0,DWORD PTR [rcx+r11*1+0x8]
   14031f12c:	0f 2f c1             	comiss xmm0,xmm1
   14031f12f:	72 24                	jb     0x14031f155
   14031f131:	4c 3b c2             	cmp    r8,rdx
   14031f134:	7d 3a                	jge    0x14031f170
   14031f136:	43 0f b7 44 42 02    	movzx  eax,WORD PTR [r10+r8*2+0x2]
   14031f13c:	49 ff c0             	inc    r8
   14031f13f:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   14031f146:	41 ff c1             	inc    r9d
   14031f149:	f3 42 0f 10 44 19 08 	movss  xmm0,DWORD PTR [rcx+r11*1+0x8]
   14031f150:	0f 2f c1             	comiss xmm0,xmm1
   14031f153:	73 dc                	jae    0x14031f131
   14031f155:	4c 3b c2             	cmp    r8,rdx
   14031f158:	7d 16                	jge    0x14031f170
   14031f15a:	43 0f b7 04 42       	movzx  eax,WORD PTR [r10+r8*2]
   14031f15f:	66 41 89 04 52       	mov    WORD PTR [r10+rdx*2],ax
   14031f164:	48 ff ca             	dec    rdx
   14031f167:	4c 3b c2             	cmp    r8,rdx
   14031f16a:	0f 8c 50 ff ff ff    	jl     0x14031f0c0
   14031f170:	49 63 c1             	movsxd rax,r9d
   14031f173:	66 41 89 2c 42       	mov    WORD PTR [r10+rax*2],bp
   14031f178:	41 8d 41 01          	lea    eax,[r9+0x1]
   14031f17c:	41 89 44 9e 04       	mov    DWORD PTR [r14+rbx*4+0x4],eax
   14031f181:	8b 04 9e             	mov    eax,DWORD PTR [rsi+rbx*4]
   14031f184:	89 44 9e 04          	mov    DWORD PTR [rsi+rbx*4+0x4],eax
   14031f188:	b8 01 00 00 00       	mov    eax,0x1
   14031f18d:	44 89 0c 9e          	mov    DWORD PTR [rsi+rbx*4],r9d
   14031f191:	eb 07                	jmp    0x14031f19a
   14031f193:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   14031f19a:	48 03 d8             	add    rbx,rax
   14031f19d:	0f 89 ed fe ff ff    	jns    0x14031f090
   14031f1a3:	48 8b 6c 24 10       	mov    rbp,QWORD PTR [rsp+0x10]
   14031f1a8:	b0 01                	mov    al,0x1
   14031f1aa:	48 8b 5c 24 18       	mov    rbx,QWORD PTR [rsp+0x18]
   14031f1af:	48 8b 74 24 20       	mov    rsi,QWORD PTR [rsp+0x20]
   14031f1b4:	48 8b 7c 24 28       	mov    rdi,QWORD PTR [rsp+0x28]
   14031f1b9:	41 5e                	pop    r14
   14031f1bb:	c3                   	ret
   14031f1bc:	cc                   	int3
   14031f1bd:	cc                   	int3
   14031f1be:	cc                   	int3
   14031f1bf:	cc                   	int3
   14031f1c0:	cc                   	int3
   14031f1c1:	cc                   	int3
   14031f1c2:	cc                   	int3
   14031f1c3:	cc                   	int3
   14031f1c4:	cc                   	int3
   14031f1c5:	cc                   	int3
   14031f1c6:	cc                   	int3
   14031f1c7:	cc                   	int3
   14031f1c8:	cc                   	int3
   14031f1c9:	cc                   	int3
   14031f1ca:	cc                   	int3
   14031f1cb:	cc                   	int3
   14031f1cc:	cc                   	int3
   14031f1cd:	cc                   	int3
   14031f1ce:	cc                   	int3
   14031f1cf:	cc                   	int3
   14031f1d0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14031f1d5:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   14031f1da:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   14031f1df:	57                   	push   rdi
   14031f1e0:	48 83 ec 20          	sub    rsp,0x20
   14031f1e4:	8b e9                	mov    ebp,ecx
   14031f1e6:	e8 a5 a1 21 00       	call   0x140539390
   14031f1eb:	48 03 e8             	add    rbp,rax
   14031f1ee:	66 90                	xchg   ax,ax
   14031f1f0:	33 db                	xor    ebx,ebx
   14031f1f2:	40 b6 01             	mov    sil,0x1
   14031f1f5:	39 1d 0d ae 66 00    	cmp    DWORD PTR [rip+0x66ae0d],ebx        # 0x14098a008
   14031f1fb:	76 7a                	jbe    0x14031f277
   14031f1fd:	0f 1f 00             	nop    DWORD PTR [rax]
   14031f200:	8b c3                	mov    eax,ebx
   14031f202:	ba ff ff ff ff       	mov    edx,0xffffffff
   14031f207:	48 69 f8 18 08 00 00 	imul   rdi,rax,0x818
   14031f20e:	48 8b 05 fb ad 66 00 	mov    rax,QWORD PTR [rip+0x66adfb]        # 0x14098a010
   14031f215:	48 03 f8             	add    rdi,rax
   14031f218:	48 8b 8f 08 03 00 00 	mov    rcx,QWORD PTR [rdi+0x308]
   14031f21f:	ff 15 2b 94 36 00    	call   QWORD PTR [rip+0x36942b]        # 0x140688650
   14031f225:	4c 8b 8f e8 02 00 00 	mov    r9,QWORD PTR [rdi+0x2e8]
   14031f22c:	4d 85 c9             	test   r9,r9
   14031f22f:	74 2a                	je     0x14031f25b
   14031f231:	44 8b 87 40 03 00 00 	mov    r8d,DWORD PTR [rdi+0x340]
   14031f238:	33 c0                	xor    eax,eax
   14031f23a:	45 85 c0             	test   r8d,r8d
   14031f23d:	74 1c                	je     0x14031f25b
   14031f23f:	90                   	nop
   14031f240:	48 8d 14 80          	lea    rdx,[rax+rax*4]
   14031f244:	48 03 d2             	add    rdx,rdx
   14031f247:	41 83 7c d1 08 05    	cmp    DWORD PTR [r9+rdx*8+0x8],0x5
   14031f24d:	75 09                	jne    0x14031f258
   14031f24f:	ff c0                	inc    eax
   14031f251:	41 3b c0             	cmp    eax,r8d
   14031f254:	72 ea                	jb     0x14031f240
   14031f256:	eb 03                	jmp    0x14031f25b
   14031f258:	40 32 f6             	xor    sil,sil
   14031f25b:	48 8b 8f 08 03 00 00 	mov    rcx,QWORD PTR [rdi+0x308]
   14031f262:	ff 15 e0 93 36 00    	call   QWORD PTR [rip+0x3693e0]        # 0x140688648
   14031f268:	40 84 f6             	test   sil,sil
   14031f26b:	74 21                	je     0x14031f28e
   14031f26d:	ff c3                	inc    ebx
   14031f26f:	3b 1d 93 ad 66 00    	cmp    ebx,DWORD PTR [rip+0x66ad93]        # 0x14098a008
   14031f275:	72 89                	jb     0x14031f200
   14031f277:	b0 01                	mov    al,0x1
   14031f279:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   14031f27e:	48 8b 6c 24 38       	mov    rbp,QWORD PTR [rsp+0x38]
   14031f283:	48 8b 74 24 40       	mov    rsi,QWORD PTR [rsp+0x40]
   14031f288:	48 83 c4 20          	add    rsp,0x20
   14031f28c:	5f                   	pop    rdi
   14031f28d:	c3                   	ret
   14031f28e:	b9 1e 00 00 00       	mov    ecx,0x1e
   14031f293:	ff 15 cf 93 36 00    	call   QWORD PTR [rip+0x3693cf]        # 0x140688668
   14031f299:	e8 f2 a0 21 00       	call   0x140539390
   14031f29e:	48 3b c5             	cmp    rax,rbp
   14031f2a1:	0f 8c 49 ff ff ff    	jl     0x14031f1f0
   14031f2a7:	32 c0                	xor    al,al
   14031f2a9:	eb ce                	jmp    0x14031f279
   14031f2ab:	cc                   	int3
   14031f2ac:	cc                   	int3
   14031f2ad:	cc                   	int3
   14031f2ae:	cc                   	int3
   14031f2af:	cc                   	int3
   14031f2b0:	cc                   	int3
   14031f2b1:	cc                   	int3
   14031f2b2:	cc                   	int3
   14031f2b3:	cc                   	int3
   14031f2b4:	cc                   	int3
   14031f2b5:	cc                   	int3
   14031f2b6:	cc                   	int3
   14031f2b7:	cc                   	int3
   14031f2b8:	cc                   	int3
   14031f2b9:	cc                   	int3
   14031f2ba:	cc                   	int3
   14031f2bb:	cc                   	int3
   14031f2bc:	cc                   	int3
   14031f2bd:	cc                   	int3
   14031f2be:	cc                   	int3
   14031f2bf:	cc                   	int3
   14031f2c0:	40 53                	rex push rbx
   14031f2c2:	56                   	push   rsi
   14031f2c3:	57                   	push   rdi
   14031f2c4:	48 81 ec d0 00 00 00 	sub    rsp,0xd0
   14031f2cb:	48 8b 05 96 2e 65 00 	mov    rax,QWORD PTR [rip+0x652e96]        # 0x140972168
   14031f2d2:	48 33 c4             	xor    rax,rsp
   14031f2d5:	48 89 44 24 60       	mov    QWORD PTR [rsp+0x60],rax
   14031f2da:	48 8b f9             	mov    rdi,rcx
   14031f2dd:	48 63 f2             	movsxd rsi,edx
   14031f2e0:	48 8b 0d 81 ad 66 00 	mov    rcx,QWORD PTR [rip+0x66ad81]        # 0x14098a068
   14031f2e7:	48 85 c9             	test   rcx,rcx
   14031f2ea:	74 05                	je     0x14031f2f1
   14031f2ec:	e8 67 c2 2f 00       	call   0x14061b558
   14031f2f1:	33 db                	xor    ebx,ebx
   14031f2f3:	48 89 1d 6e ad 66 00 	mov    QWORD PTR [rip+0x66ad6e],rbx        # 0x14098a068
   14031f2fa:	48 89 1d 6f ad 66 00 	mov    QWORD PTR [rip+0x66ad6f],rbx        # 0x14098a070
   14031f301:	48 85 ff             	test   rdi,rdi
   14031f304:	0f 84 6c 02 00 00    	je     0x14031f576
   14031f30a:	48 8b cf             	mov    rcx,rdi
   14031f30d:	e8 4e 25 21 00       	call   0x140531860
   14031f312:	85 c0                	test   eax,eax
   14031f314:	0f 84 5c 02 00 00    	je     0x14031f576
   14031f31a:	48 89 ac 24 00 01 00 	mov    QWORD PTR [rsp+0x100],rbp
   14031f321:	00 
   14031f322:	8d 53 40             	lea    edx,[rbx+0x40]
   14031f325:	0f 29 bc 24 90 00 00 	movaps XMMWORD PTR [rsp+0x90],xmm7
   14031f32c:	00 
   14031f32d:	45 33 c9             	xor    r9d,r9d
   14031f330:	f3 0f 10 3d b8 0f 53 	movss  xmm7,DWORD PTR [rip+0x530fb8]        # 0x1408502f0
   14031f337:	00 
   14031f338:	41 b0 01             	mov    r8b,0x1
   14031f33b:	48 8b cf             	mov    rcx,rdi
   14031f33e:	e8 2d 25 21 00       	call   0x140531870
   14031f343:	48 8b e8             	mov    rbp,rax
   14031f346:	48 85 c0             	test   rax,rax
   14031f349:	0f 84 17 02 00 00    	je     0x14031f566
   14031f34f:	4c 89 a4 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],r12
   14031f356:	00 
   14031f357:	4c 8d 25 72 b2 66 00 	lea    r12,[rip+0x66b272]        # 0x14098a5d0
   14031f35e:	4c 89 ac 24 c0 00 00 	mov    QWORD PTR [rsp+0xc0],r13
   14031f365:	00 
   14031f366:	49 bd 00 00 00 00 00 	movabs r13,0x8000000000000000
   14031f36d:	00 00 80 
   14031f370:	4c 89 b4 24 b8 00 00 	mov    QWORD PTR [rsp+0xb8],r14
   14031f377:	00 
   14031f378:	44 8d 73 01          	lea    r14d,[rbx+0x1]
   14031f37c:	4c 89 bc 24 b0 00 00 	mov    QWORD PTR [rsp+0xb0],r15
   14031f383:	00 
   14031f384:	4c 8d 7b ff          	lea    r15,[rbx-0x1]
   14031f388:	0f 29 b4 24 a0 00 00 	movaps XMMWORD PTR [rsp+0xa0],xmm6
   14031f38f:	00 
   14031f390:	44 0f 29 84 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm8
   14031f397:	00 00 
   14031f399:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031f39d:	44 0f 29 4c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm9
   14031f3a3:	f3 44 0f 10 0d a0 f7 	movss  xmm9,DWORD PTR [rip+0x37f7a0]        # 0x14069eb4c
   14031f3aa:	37 00 
   14031f3ac:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031f3b0:	48 8b cd             	mov    rcx,rbp
   14031f3b3:	e8 48 4b 21 00       	call   0x140533f00
   14031f3b8:	85 c0                	test   eax,eax
   14031f3ba:	0f 85 e5 00 00 00    	jne    0x14031f4a5
   14031f3c0:	41 b8 40 00 00 00    	mov    r8d,0x40
   14031f3c6:	48 8d 54 24 20       	lea    rdx,[rsp+0x20]
   14031f3cb:	48 8b cd             	mov    rcx,rbp
   14031f3ce:	e8 ed 41 21 00       	call   0x1405335c0
   14031f3d3:	48 8d 4c 24 20       	lea    rcx,[rsp+0x20]
   14031f3d8:	49 8b c7             	mov    rax,r15
   14031f3db:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14031f3e0:	48 ff c0             	inc    rax
   14031f3e3:	80 3c 01 00          	cmp    BYTE PTR [rcx+rax*1],0x0
   14031f3e7:	75 f7                	jne    0x14031f3e0
   14031f3e9:	48 85 c0             	test   rax,rax
   14031f3ec:	0f 84 a3 00 00 00    	je     0x14031f495
   14031f3f2:	ba 2c 00 00 00       	mov    edx,0x2c
   14031f3f7:	48 8d 4c 24 20       	lea    rcx,[rsp+0x20]
   14031f3fc:	e8 19 19 30 00       	call   0x140620d1a
   14031f401:	48 8b f8             	mov    rdi,rax
   14031f404:	48 85 c0             	test   rax,rax
   14031f407:	0f 84 88 00 00 00    	je     0x14031f495
   14031f40d:	48 8d 4c 24 20       	lea    rcx,[rsp+0x20]
   14031f412:	c6 00 00             	mov    BYTE PTR [rax],0x0
   14031f415:	ff 15 d5 a4 36 00    	call   QWORD PTR [rip+0x36a4d5]        # 0x1406898f0
   14031f41b:	0f 57 f6             	xorps  xmm6,xmm6
   14031f41e:	48 8d 4f 01          	lea    rcx,[rdi+0x1]
   14031f422:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14031f426:	ff 15 c4 a4 36 00    	call   QWORD PTR [rip+0x36a4c4]        # 0x1406898f0
   14031f42c:	0f 57 c9             	xorps  xmm1,xmm1
   14031f42f:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   14031f433:	41 0f 2f c8          	comiss xmm1,xmm8
   14031f437:	76 5c                	jbe    0x14031f495
   14031f439:	45 85 f6             	test   r14d,r14d
   14031f43c:	74 05                	je     0x14031f443
   14031f43e:	0f 28 fe             	movaps xmm7,xmm6
   14031f441:	eb 52                	jmp    0x14031f495
   14031f443:	0f b7 0d 26 ac 66 00 	movzx  ecx,WORD PTR [rip+0x66ac26]        # 0x14098a070
   14031f44a:	48 69 c6 78 ab 06 00 	imul   rax,rsi,0x6ab78
   14031f451:	66 ff c9             	dec    cx
   14031f454:	f3 42 0f 5e b4 20 50 	divss  xmm6,DWORD PTR [rax+r12*1+0x39150]
   14031f45b:	91 03 00 
   14031f45e:	f3 0f 2c c6          	cvttss2si eax,xmm6
   14031f462:	66 3b c8             	cmp    cx,ax
   14031f465:	66 0f 43 c8          	cmovae cx,ax
   14031f469:	66 3b d9             	cmp    bx,cx
   14031f46c:	77 22                	ja     0x14031f490
   14031f46e:	48 8b 15 f3 ab 66 00 	mov    rdx,QWORD PTR [rip+0x66abf3]        # 0x14098a068
   14031f475:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14031f47c:	00 00 00 00 
   14031f480:	0f b7 c3             	movzx  eax,bx
   14031f483:	66 ff c3             	inc    bx
   14031f486:	f3 0f 11 0c 82       	movss  DWORD PTR [rdx+rax*4],xmm1
   14031f48b:	66 3b d9             	cmp    bx,cx
   14031f48e:	76 f0                	jbe    0x14031f480
   14031f490:	0f b7 d9             	movzx  ebx,cx
   14031f493:	ff c3                	inc    ebx
   14031f495:	48 8b cd             	mov    rcx,rbp
   14031f498:	e8 63 4a 21 00       	call   0x140533f00
   14031f49d:	85 c0                	test   eax,eax
   14031f49f:	0f 84 1b ff ff ff    	je     0x14031f3c0
   14031f4a5:	45 85 f6             	test   r14d,r14d
   14031f4a8:	74 69                	je     0x14031f513
   14031f4aa:	41 0f 2f f8          	comiss xmm7,xmm8
   14031f4ae:	72 63                	jb     0x14031f513
   14031f4b0:	48 69 c6 78 ab 06 00 	imul   rax,rsi,0x6ab78
   14031f4b7:	0f 28 c7             	movaps xmm0,xmm7
   14031f4ba:	f3 42 0f 5e 84 20 50 	divss  xmm0,DWORD PTR [rax+r12*1+0x39150]
   14031f4c1:	91 03 00 
   14031f4c4:	33 c0                	xor    eax,eax
   14031f4c6:	41 0f 2f c1          	comiss xmm0,xmm9
   14031f4ca:	72 0e                	jb     0x14031f4da
   14031f4cc:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   14031f4d1:	41 0f 2f c1          	comiss xmm0,xmm9
   14031f4d5:	73 03                	jae    0x14031f4da
   14031f4d7:	49 8b c5             	mov    rax,r13
   14031f4da:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0
   14031f4df:	48 03 c8             	add    rcx,rax
   14031f4e2:	b8 04 00 00 00       	mov    eax,0x4
   14031f4e7:	48 f7 e1             	mul    rcx
   14031f4ea:	48 89 0d 7f ab 66 00 	mov    QWORD PTR [rip+0x66ab7f],rcx        # 0x14098a070
   14031f4f1:	49 0f 40 c7          	cmovo  rax,r15
   14031f4f5:	48 8b c8             	mov    rcx,rax
   14031f4f8:	e8 63 c0 2f 00       	call   0x14061b560
   14031f4fd:	48 89 05 64 ab 66 00 	mov    QWORD PTR [rip+0x66ab64],rax        # 0x14098a068
   14031f504:	48 85 c0             	test   rax,rax
   14031f507:	74 1e                	je     0x14031f527
   14031f509:	48 83 3d 5f ab 66 00 	cmp    QWORD PTR [rip+0x66ab5f],0x0        # 0x14098a070
   14031f510:	00 
   14031f511:	74 14                	je     0x14031f527
   14031f513:	33 d2                	xor    edx,edx
   14031f515:	48 8b cd             	mov    rcx,rbp
   14031f518:	e8 e3 25 21 00       	call   0x140531b00
   14031f51d:	41 83 ee 01          	sub    r14d,0x1
   14031f521:	0f 89 89 fe ff ff    	jns    0x14031f3b0
   14031f527:	48 8b cd             	mov    rcx,rbp
   14031f52a:	e8 c1 24 21 00       	call   0x1405319f0
   14031f52f:	44 0f 28 4c 24 70    	movaps xmm9,XMMWORD PTR [rsp+0x70]
   14031f535:	44 0f 28 84 24 80 00 	movaps xmm8,XMMWORD PTR [rsp+0x80]
   14031f53c:	00 00 
   14031f53e:	0f 28 b4 24 a0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xa0]
   14031f545:	00 
   14031f546:	4c 8b bc 24 b0 00 00 	mov    r15,QWORD PTR [rsp+0xb0]
   14031f54d:	00 
   14031f54e:	4c 8b b4 24 b8 00 00 	mov    r14,QWORD PTR [rsp+0xb8]
   14031f555:	00 
   14031f556:	4c 8b ac 24 c0 00 00 	mov    r13,QWORD PTR [rsp+0xc0]
   14031f55d:	00 
   14031f55e:	4c 8b a4 24 c8 00 00 	mov    r12,QWORD PTR [rsp+0xc8]
   14031f565:	00 
   14031f566:	48 8b ac 24 00 01 00 	mov    rbp,QWORD PTR [rsp+0x100]
   14031f56d:	00 
   14031f56e:	0f 28 bc 24 90 00 00 	movaps xmm7,XMMWORD PTR [rsp+0x90]
   14031f575:	00 
   14031f576:	48 8b 4c 24 60       	mov    rcx,QWORD PTR [rsp+0x60]
   14031f57b:	48 33 cc             	xor    rcx,rsp
   14031f57e:	e8 7d c0 2f 00       	call   0x14061b600
   14031f583:	48 81 c4 d0 00 00 00 	add    rsp,0xd0
   14031f58a:	5f                   	pop    rdi
   14031f58b:	5e                   	pop    rsi
   14031f58c:	5b                   	pop    rbx
   14031f58d:	c3                   	ret
   14031f58e:	cc                   	int3
   14031f58f:	cc                   	int3
   14031f590:	cc                   	int3
   14031f591:	cc                   	int3
   14031f592:	cc                   	int3
   14031f593:	cc                   	int3
   14031f594:	cc                   	int3
   14031f595:	cc                   	int3
   14031f596:	cc                   	int3
   14031f597:	cc                   	int3
   14031f598:	cc                   	int3
   14031f599:	cc                   	int3
   14031f59a:	cc                   	int3
   14031f59b:	cc                   	int3
   14031f59c:	cc                   	int3
   14031f59d:	cc                   	int3
   14031f59e:	cc                   	int3
   14031f59f:	cc                   	int3
