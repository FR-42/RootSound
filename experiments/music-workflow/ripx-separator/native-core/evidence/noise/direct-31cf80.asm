
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031cf80 <.text+0x31bf80>:
   14031cf80:	40 53                	rex push rbx
   14031cf82:	57                   	push   rdi
   14031cf83:	41 54                	push   r12
   14031cf85:	48 81 ec 70 03 00 00 	sub    rsp,0x370
   14031cf8c:	48 8b 05 d5 51 65 00 	mov    rax,QWORD PTR [rip+0x6551d5]        # 0x140972168
   14031cf93:	48 33 c4             	xor    rax,rsp
   14031cf96:	48 89 84 24 d0 02 00 	mov    QWORD PTR [rsp+0x2d0],rax
   14031cf9d:	00 
   14031cf9e:	4c 8b a1 40 05 00 00 	mov    r12,QWORD PTR [rcx+0x540]
   14031cfa5:	41 8b d8             	mov    ebx,r8d
   14031cfa8:	45 33 c0             	xor    r8d,r8d
   14031cfab:	89 54 24 20          	mov    DWORD PTR [rsp+0x20],edx
   14031cfaf:	44 8b da             	mov    r11d,edx
   14031cfb2:	48 8b 91 38 06 00 00 	mov    rdx,QWORD PTR [rcx+0x638]
   14031cfb9:	48 8b f9             	mov    rdi,rcx
   14031cfbc:	89 5c 24 40          	mov    DWORD PTR [rsp+0x40],ebx
   14031cfc0:	45 8b d0             	mov    r10d,r8d
   14031cfc3:	48 89 4c 24 48       	mov    QWORD PTR [rsp+0x48],rcx
   14031cfc8:	4c 89 64 24 50       	mov    QWORD PTR [rsp+0x50],r12
   14031cfcd:	48 89 54 24 28       	mov    QWORD PTR [rsp+0x28],rdx
   14031cfd2:	44 39 81 48 05 00 00 	cmp    DWORD PTR [rcx+0x548],r8d
   14031cfd9:	76 65                	jbe    0x14031d040
   14031cfdb:	33 db                	xor    ebx,ebx
   14031cfdd:	0f 1f 00             	nop    DWORD PTR [rax]
   14031cfe0:	41 8b c2             	mov    eax,r10d
   14031cfe3:	4c 8d 04 80          	lea    r8,[rax+rax*4]
   14031cfe7:	43 f6 44 c4 0c 01    	test   BYTE PTR [r12+r8*8+0xc],0x1
   14031cfed:	75 39                	jne    0x14031d028
   14031cfef:	43 80 7c c4 24 01    	cmp    BYTE PTR [r12+r8*8+0x24],0x1
   14031cff5:	74 31                	je     0x14031d028
   14031cff7:	8b d3                	mov    edx,ebx
   14031cff9:	4f 8b 0c c4          	mov    r9,QWORD PTR [r12+r8*8]
   14031cffd:	66 43 3b 5c c4 08    	cmp    bx,WORD PTR [r12+r8*8+0x8]
   14031d003:	73 23                	jae    0x14031d028
   14031d005:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14031d00c:	00 00 00 00 
   14031d010:	8b c2                	mov    eax,edx
   14031d012:	ff c2                	inc    edx
   14031d014:	48 6b c8 5c          	imul   rcx,rax,0x5c
   14031d018:	42 80 64 09 48 fe    	and    BYTE PTR [rcx+r9*1+0x48],0xfe
   14031d01e:	43 0f b7 44 c4 08    	movzx  eax,WORD PTR [r12+r8*8+0x8]
   14031d024:	3b d0                	cmp    edx,eax
   14031d026:	72 e8                	jb     0x14031d010
   14031d028:	41 ff c2             	inc    r10d
   14031d02b:	44 3b 97 48 05 00 00 	cmp    r10d,DWORD PTR [rdi+0x548]
   14031d032:	72 ac                	jb     0x14031cfe0
   14031d034:	48 8b 54 24 28       	mov    rdx,QWORD PTR [rsp+0x28]
   14031d039:	45 33 c0             	xor    r8d,r8d
   14031d03c:	8b 5c 24 40          	mov    ebx,DWORD PTR [rsp+0x40]
   14031d040:	44 3b db             	cmp    r11d,ebx
   14031d043:	0f 8d 23 06 00 00    	jge    0x14031d66c
   14031d049:	8b 1d 59 c9 61 00    	mov    ebx,DWORD PTR [rip+0x61c959]        # 0x1409399a8
   14031d04f:	48 89 ac 24 a0 03 00 	mov    QWORD PTR [rsp+0x3a0],rbp
   14031d056:	00 
   14031d057:	48 89 b4 24 68 03 00 	mov    QWORD PTR [rsp+0x368],rsi
   14031d05e:	00 
   14031d05f:	4c 89 ac 24 60 03 00 	mov    QWORD PTR [rsp+0x360],r13
   14031d066:	00 
   14031d067:	4c 89 b4 24 58 03 00 	mov    QWORD PTR [rsp+0x358],r14
   14031d06e:	00 
   14031d06f:	4c 89 bc 24 50 03 00 	mov    QWORD PTR [rsp+0x350],r15
   14031d076:	00 
   14031d077:	0f 29 b4 24 40 03 00 	movaps XMMWORD PTR [rsp+0x340],xmm6
   14031d07e:	00 
   14031d07f:	f2 0f 10 35 a1 30 53 	movsd  xmm6,QWORD PTR [rip+0x5330a1]        # 0x140850128
   14031d086:	00 
   14031d087:	0f 29 bc 24 30 03 00 	movaps XMMWORD PTR [rsp+0x330],xmm7
   14031d08e:	00 
   14031d08f:	f3 0f 10 3d 39 a1 37 	movss  xmm7,DWORD PTR [rip+0x37a139]        # 0x1406971d0
   14031d096:	00 
   14031d097:	44 0f 29 84 24 20 03 	movaps XMMWORD PTR [rsp+0x320],xmm8
   14031d09e:	00 00 
   14031d0a0:	f2 44 0f 10 05 17 a9 	movsd  xmm8,QWORD PTR [rip+0x38a917]        # 0x1406a79c0
   14031d0a7:	38 00 
   14031d0a9:	44 0f 29 8c 24 10 03 	movaps XMMWORD PTR [rsp+0x310],xmm9
   14031d0b0:	00 00 
   14031d0b2:	f3 44 0f 10 0d 35 a9 	movss  xmm9,DWORD PTR [rip+0x38a935]        # 0x1406a79f0
   14031d0b9:	38 00 
   14031d0bb:	44 0f 29 94 24 00 03 	movaps XMMWORD PTR [rsp+0x300],xmm10
   14031d0c2:	00 00 
   14031d0c4:	f3 44 0f 10 15 ff a9 	movss  xmm10,DWORD PTR [rip+0x38a9ff]        # 0x1406a7acc
   14031d0cb:	38 00 
   14031d0cd:	44 0f 29 9c 24 f0 02 	movaps XMMWORD PTR [rsp+0x2f0],xmm11
   14031d0d4:	00 00 
   14031d0d6:	f3 44 0f 10 1d c9 2e 	movss  xmm11,DWORD PTR [rip+0x532ec9]        # 0x14084ffa8
   14031d0dd:	53 00 
   14031d0df:	44 0f 29 a4 24 e0 02 	movaps XMMWORD PTR [rsp+0x2e0],xmm12
   14031d0e6:	00 00 
   14031d0e8:	f3 44 0f 10 25 eb 2e 	movss  xmm12,DWORD PTR [rip+0x532eeb]        # 0x14084ffdc
   14031d0ef:	53 00 
   14031d0f1:	49 63 c3             	movsxd rax,r11d
   14031d0f4:	45 8b e8             	mov    r13d,r8d
   14031d0f7:	44 89 44 24 34       	mov    DWORD PTR [rsp+0x34],r8d
   14031d0fc:	48 8d 0c 85 00 00 00 	lea    rcx,[rax*4+0x0]
   14031d103:	00 
   14031d104:	48 8b 42 10          	mov    rax,QWORD PTR [rdx+0x10]
   14031d108:	48 89 4c 24 60       	mov    QWORD PTR [rsp+0x60],rcx
   14031d10d:	44 8b 34 01          	mov    r14d,DWORD PTR [rcx+rax*1]
   14031d111:	48 8b 02             	mov    rax,QWORD PTR [rdx]
   14031d114:	41 69 cb 00 15 00 00 	imul   ecx,r11d,0x1500
   14031d11b:	44 89 74 24 30       	mov    DWORD PTR [rsp+0x30],r14d
   14031d120:	48 8d 34 c8          	lea    rsi,[rax+rcx*8]
   14031d124:	48 8b 42 08          	mov    rax,QWORD PTR [rdx+0x8]
   14031d128:	48 89 74 24 68       	mov    QWORD PTR [rsp+0x68],rsi
   14031d12d:	4c 8d 3c c8          	lea    r15,[rax+rcx*8]
   14031d131:	4c 89 7c 24 38       	mov    QWORD PTR [rsp+0x38],r15
   14031d136:	45 85 f6             	test   r14d,r14d
   14031d139:	0f 84 b5 04 00 00    	je     0x14031d5f4
   14031d13f:	49 8b e8             	mov    rbp,r8
   14031d142:	4c 89 44 24 58       	mov    QWORD PTR [rsp+0x58],r8
   14031d147:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14031d14e:	00 00 
   14031d150:	49 8b 04 ef          	mov    rax,QWORD PTR [r15+rbp*8]
   14031d154:	f6 40 48 01          	test   BYTE PTR [rax+0x48],0x1
   14031d158:	0f 85 78 04 00 00    	jne    0x14031d5d6
   14031d15e:	4c 8b 1c ee          	mov    r11,QWORD PTR [rsi+rbp*8]
   14031d162:	41 0f b6 4b 24       	movzx  ecx,BYTE PTR [r11+0x24]
   14031d167:	8d 41 f0             	lea    eax,[rcx-0x10]
   14031d16a:	3c 02                	cmp    al,0x2
   14031d16c:	0f 86 5f 04 00 00    	jbe    0x14031d5d1
   14031d172:	80 f9 40             	cmp    cl,0x40
   14031d175:	0f 84 56 04 00 00    	je     0x14031d5d1
   14031d17b:	0f 57 c9             	xorps  xmm1,xmm1
   14031d17e:	45 8b d5             	mov    r10d,r13d
   14031d181:	45 3b ee             	cmp    r13d,r14d
   14031d184:	0f 83 89 01 00 00    	jae    0x14031d313
   14031d18a:	41 8b c6             	mov    eax,r14d
   14031d18d:	41 2b c5             	sub    eax,r13d
   14031d190:	83 f8 04             	cmp    eax,0x4
   14031d193:	0f 82 1f 01 00 00    	jb     0x14031d2b8
   14031d199:	45 8b 43 10          	mov    r8d,DWORD PTR [r11+0x10]
   14031d19d:	41 8b c6             	mov    eax,r14d
   14031d1a0:	41 2b c5             	sub    eax,r13d
   14031d1a3:	41 8b cd             	mov    ecx,r13d
   14031d1a6:	83 e8 04             	sub    eax,0x4
   14031d1a9:	48 ff c1             	inc    rcx
   14031d1ac:	c1 e8 02             	shr    eax,0x2
   14031d1af:	48 8b d6             	mov    rdx,rsi
   14031d1b2:	ff c0                	inc    eax
   14031d1b4:	49 2b d7             	sub    rdx,r15
   14031d1b7:	44 8b c8             	mov    r9d,eax
   14031d1ba:	49 8d 0c cf          	lea    rcx,[r15+rcx*8]
   14031d1be:	44 8d 14 85 00 00 00 	lea    r10d,[rax*4+0x0]
   14031d1c5:	00 
   14031d1c6:	45 03 d5             	add    r10d,r13d
   14031d1c9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14031d1d0:	48 8b 44 0a f8       	mov    rax,QWORD PTR [rdx+rcx*1-0x8]
   14031d1d5:	44 39 40 10          	cmp    DWORD PTR [rax+0x10],r8d
   14031d1d9:	75 2c                	jne    0x14031d207
   14031d1db:	48 8b 41 f8          	mov    rax,QWORD PTR [rcx-0x8]
   14031d1df:	83 fb 01             	cmp    ebx,0x1
   14031d1e2:	75 0a                	jne    0x14031d1ee
   14031d1e4:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14031d1e9:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d1ec:	eb 11                	jmp    0x14031d1ff
   14031d1ee:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14031d1f3:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14031d1f8:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d1fb:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14031d1ff:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14031d203:	f3 0f 58 c8          	addss  xmm1,xmm0
   14031d207:	48 8b 04 0a          	mov    rax,QWORD PTR [rdx+rcx*1]
   14031d20b:	44 39 40 10          	cmp    DWORD PTR [rax+0x10],r8d
   14031d20f:	75 2b                	jne    0x14031d23c
   14031d211:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14031d214:	83 fb 01             	cmp    ebx,0x1
   14031d217:	75 0a                	jne    0x14031d223
   14031d219:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14031d21e:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d221:	eb 11                	jmp    0x14031d234
   14031d223:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14031d228:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14031d22d:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d230:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14031d234:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14031d238:	f3 0f 58 c8          	addss  xmm1,xmm0
   14031d23c:	48 8b 44 0a 08       	mov    rax,QWORD PTR [rdx+rcx*1+0x8]
   14031d241:	44 39 40 10          	cmp    DWORD PTR [rax+0x10],r8d
   14031d245:	75 2c                	jne    0x14031d273
   14031d247:	48 8b 41 08          	mov    rax,QWORD PTR [rcx+0x8]
   14031d24b:	83 fb 01             	cmp    ebx,0x1
   14031d24e:	75 0a                	jne    0x14031d25a
   14031d250:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14031d255:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d258:	eb 11                	jmp    0x14031d26b
   14031d25a:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14031d25f:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14031d264:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d267:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14031d26b:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14031d26f:	f3 0f 58 c8          	addss  xmm1,xmm0
   14031d273:	48 8b 44 0a 10       	mov    rax,QWORD PTR [rdx+rcx*1+0x10]
   14031d278:	44 39 40 10          	cmp    DWORD PTR [rax+0x10],r8d
   14031d27c:	75 2c                	jne    0x14031d2aa
   14031d27e:	48 8b 41 10          	mov    rax,QWORD PTR [rcx+0x10]
   14031d282:	83 fb 01             	cmp    ebx,0x1
   14031d285:	75 0a                	jne    0x14031d291
   14031d287:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14031d28c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d28f:	eb 11                	jmp    0x14031d2a2
   14031d291:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14031d296:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14031d29b:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d29e:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14031d2a2:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14031d2a6:	f3 0f 58 c8          	addss  xmm1,xmm0
   14031d2aa:	48 83 c1 20          	add    rcx,0x20
   14031d2ae:	49 83 e9 01          	sub    r9,0x1
   14031d2b2:	0f 85 18 ff ff ff    	jne    0x14031d1d0
   14031d2b8:	45 3b d6             	cmp    r10d,r14d
   14031d2bb:	73 56                	jae    0x14031d313
   14031d2bd:	45 8b 4b 10          	mov    r9d,DWORD PTR [r11+0x10]
   14031d2c1:	4c 8b c6             	mov    r8,rsi
   14031d2c4:	41 8b c2             	mov    eax,r10d
   14031d2c7:	4d 2b c7             	sub    r8,r15
   14031d2ca:	41 8b d6             	mov    edx,r14d
   14031d2cd:	41 2b d2             	sub    edx,r10d
   14031d2d0:	49 8d 0c c7          	lea    rcx,[r15+rax*8]
   14031d2d4:	4a 8b 04 01          	mov    rax,QWORD PTR [rcx+r8*1]
   14031d2d8:	44 39 48 10          	cmp    DWORD PTR [rax+0x10],r9d
   14031d2dc:	75 2b                	jne    0x14031d309
   14031d2de:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14031d2e1:	83 fb 01             	cmp    ebx,0x1
   14031d2e4:	75 0a                	jne    0x14031d2f0
   14031d2e6:	f3 0f 10 40 08       	movss  xmm0,DWORD PTR [rax+0x8]
   14031d2eb:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d2ee:	eb 11                	jmp    0x14031d301
   14031d2f0:	f3 0f 10 40 0c       	movss  xmm0,DWORD PTR [rax+0xc]
   14031d2f5:	f3 0f 58 40 08       	addss  xmm0,DWORD PTR [rax+0x8]
   14031d2fa:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d2fd:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14031d301:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14031d305:	f3 0f 58 c8          	addss  xmm1,xmm0
   14031d309:	48 83 c1 08          	add    rcx,0x8
   14031d30d:	48 83 ea 01          	sub    rdx,0x1
   14031d311:	75 c1                	jne    0x14031d2d4
   14031d313:	45 8b dd             	mov    r11d,r13d
   14031d316:	45 3b ee             	cmp    r13d,r14d
   14031d319:	0f 83 13 01 00 00    	jae    0x14031d432
   14031d31f:	41 8b c6             	mov    eax,r14d
   14031d322:	41 2b c5             	sub    eax,r13d
   14031d325:	83 f8 04             	cmp    eax,0x4
   14031d328:	0f 82 c0 00 00 00    	jb     0x14031d3ee
   14031d32e:	41 8b c6             	mov    eax,r14d
   14031d331:	41 8b d5             	mov    edx,r13d
   14031d334:	41 2b c5             	sub    eax,r13d
   14031d337:	48 ff c2             	inc    rdx
   14031d33a:	83 e8 04             	sub    eax,0x4
   14031d33d:	4c 8b ce             	mov    r9,rsi
   14031d340:	c1 e8 02             	shr    eax,0x2
   14031d343:	4d 2b cf             	sub    r9,r15
   14031d346:	ff c0                	inc    eax
   14031d348:	49 8d 14 d7          	lea    rdx,[r15+rdx*8]
   14031d34c:	44 8b d0             	mov    r10d,eax
   14031d34f:	44 8d 1c 85 00 00 00 	lea    r11d,[rax*4+0x0]
   14031d356:	00 
   14031d357:	45 03 dd             	add    r11d,r13d
   14031d35a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14031d360:	4c 8b 04 ee          	mov    r8,QWORD PTR [rsi+rbp*8]
   14031d364:	4a 8b 4c 0a f8       	mov    rcx,QWORD PTR [rdx+r9*1-0x8]
   14031d369:	41 8b 40 10          	mov    eax,DWORD PTR [r8+0x10]
   14031d36d:	39 41 10             	cmp    DWORD PTR [rcx+0x10],eax
   14031d370:	75 11                	jne    0x14031d383
   14031d372:	48 8b 42 f8          	mov    rax,QWORD PTR [rdx-0x8]
   14031d376:	f3 0f 11 48 54       	movss  DWORD PTR [rax+0x54],xmm1
   14031d37b:	80 48 48 01          	or     BYTE PTR [rax+0x48],0x1
   14031d37f:	4c 8b 04 ee          	mov    r8,QWORD PTR [rsi+rbp*8]
   14031d383:	4a 8b 0c 0a          	mov    rcx,QWORD PTR [rdx+r9*1]
   14031d387:	41 8b 40 10          	mov    eax,DWORD PTR [r8+0x10]
   14031d38b:	39 41 10             	cmp    DWORD PTR [rcx+0x10],eax
   14031d38e:	75 10                	jne    0x14031d3a0
   14031d390:	48 8b 02             	mov    rax,QWORD PTR [rdx]
   14031d393:	f3 0f 11 48 54       	movss  DWORD PTR [rax+0x54],xmm1
   14031d398:	80 48 48 01          	or     BYTE PTR [rax+0x48],0x1
   14031d39c:	4c 8b 04 ee          	mov    r8,QWORD PTR [rsi+rbp*8]
   14031d3a0:	4a 8b 4c 0a 08       	mov    rcx,QWORD PTR [rdx+r9*1+0x8]
   14031d3a5:	41 8b 40 10          	mov    eax,DWORD PTR [r8+0x10]
   14031d3a9:	39 41 10             	cmp    DWORD PTR [rcx+0x10],eax
   14031d3ac:	75 11                	jne    0x14031d3bf
   14031d3ae:	48 8b 42 08          	mov    rax,QWORD PTR [rdx+0x8]
   14031d3b2:	f3 0f 11 48 54       	movss  DWORD PTR [rax+0x54],xmm1
   14031d3b7:	80 48 48 01          	or     BYTE PTR [rax+0x48],0x1
   14031d3bb:	4c 8b 04 ee          	mov    r8,QWORD PTR [rsi+rbp*8]
   14031d3bf:	4a 8b 4c 0a 10       	mov    rcx,QWORD PTR [rdx+r9*1+0x10]
   14031d3c4:	41 8b 40 10          	mov    eax,DWORD PTR [r8+0x10]
   14031d3c8:	39 41 10             	cmp    DWORD PTR [rcx+0x10],eax
   14031d3cb:	75 0d                	jne    0x14031d3da
   14031d3cd:	48 8b 42 10          	mov    rax,QWORD PTR [rdx+0x10]
   14031d3d1:	f3 0f 11 48 54       	movss  DWORD PTR [rax+0x54],xmm1
   14031d3d6:	80 48 48 01          	or     BYTE PTR [rax+0x48],0x1
   14031d3da:	48 83 c2 20          	add    rdx,0x20
   14031d3de:	49 83 ea 01          	sub    r10,0x1
   14031d3e2:	0f 85 78 ff ff ff    	jne    0x14031d360
   14031d3e8:	8b 1d ba c5 61 00    	mov    ebx,DWORD PTR [rip+0x61c5ba]        # 0x1409399a8
   14031d3ee:	45 3b de             	cmp    r11d,r14d
   14031d3f1:	73 3f                	jae    0x14031d432
   14031d3f3:	41 8b c3             	mov    eax,r11d
   14031d3f6:	4c 8b d6             	mov    r10,rsi
   14031d3f9:	4d 2b d7             	sub    r10,r15
   14031d3fc:	45 8b ce             	mov    r9d,r14d
   14031d3ff:	45 2b cb             	sub    r9d,r11d
   14031d402:	4d 8d 04 c7          	lea    r8,[r15+rax*8]
   14031d406:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14031d40a:	4b 8b 14 10          	mov    rdx,QWORD PTR [r8+r10*1]
   14031d40e:	8b 48 10             	mov    ecx,DWORD PTR [rax+0x10]
   14031d411:	39 4a 10             	cmp    DWORD PTR [rdx+0x10],ecx
   14031d414:	75 0c                	jne    0x14031d422
   14031d416:	49 8b 00             	mov    rax,QWORD PTR [r8]
   14031d419:	f3 0f 11 48 54       	movss  DWORD PTR [rax+0x54],xmm1
   14031d41e:	80 48 48 01          	or     BYTE PTR [rax+0x48],0x1
   14031d422:	49 83 c0 08          	add    r8,0x8
   14031d426:	49 83 e9 01          	sub    r9,0x1
   14031d42a:	75 da                	jne    0x14031d406
   14031d42c:	8b 1d 76 c5 61 00    	mov    ebx,DWORD PTR [rip+0x61c576]        # 0x1409399a8
   14031d432:	f3 0f 10 05 72 cd 66 	movss  xmm0,DWORD PTR [rip+0x66cd72]        # 0x14098a1ac
   14031d439:	00 
   14031d43a:	4c 8b 04 ee          	mov    r8,QWORD PTR [rsi+rbp*8]
   14031d43e:	44 8b 5c 24 20       	mov    r11d,DWORD PTR [rsp+0x20]
   14031d443:	45 8b fb             	mov    r15d,r11d
   14031d446:	f3 41 0f 59 c3       	mulss  xmm0,xmm11
   14031d44b:	41 0f bf 40 0a       	movsx  eax,WORD PTR [r8+0xa]
   14031d450:	44 2b f8             	sub    r15d,eax
   14031d453:	b8 01 00 00 00       	mov    eax,0x1
   14031d458:	f3 41 0f 58 c4       	addss  xmm0,xmm12
   14031d45d:	f3 0f 2c d0          	cvttss2si edx,xmm0
   14031d461:	3b d0                	cmp    edx,eax
   14031d463:	0f 4f c2             	cmovg  eax,edx
   14031d466:	44 3b f8             	cmp    r15d,eax
   14031d469:	0f 8e d3 04 00 00    	jle    0x14031d942
   14031d46f:	41 0f b7 40 08       	movzx  eax,WORD PTR [r8+0x8]
   14031d474:	b9 01 00 00 00       	mov    ecx,0x1
   14031d479:	3b d1                	cmp    edx,ecx
   14031d47b:	0f 4f ca             	cmovg  ecx,edx
   14031d47e:	2b c1                	sub    eax,ecx
   14031d480:	44 3b f8             	cmp    r15d,eax
   14031d483:	0f 8f b9 04 00 00    	jg     0x14031d942
   14031d489:	49 8b 10             	mov    rdx,QWORD PTR [r8]
   14031d48c:	41 8d 4f ff          	lea    ecx,[r15-0x1]
   14031d490:	48 6b c1 5c          	imul   rax,rcx,0x5c
   14031d494:	f6 44 10 48 01       	test   BYTE PTR [rax+rdx*1+0x48],0x1
   14031d499:	74 0b                	je     0x14031d4a6
   14031d49b:	f3 0f 10 44 10 54    	movss  xmm0,DWORD PTR [rax+rdx*1+0x54]
   14031d4a1:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031d4a4:	eb 03                	jmp    0x14031d4a9
   14031d4a6:	0f 57 c0             	xorps  xmm0,xmm0
   14031d4a9:	66 0f 5a d0          	cvtpd2ps xmm2,xmm0
   14031d4ad:	0f 28 c2             	movaps xmm0,xmm2
   14031d4b0:	f3 41 0f 59 c1       	mulss  xmm0,xmm9
   14031d4b5:	f3 41 0f 5f c2       	maxss  xmm0,xmm10
   14031d4ba:	0f 2f c8             	comiss xmm1,xmm0
   14031d4bd:	77 1f                	ja     0x14031d4de
   14031d4bf:	0f 2f d7             	comiss xmm2,xmm7
   14031d4c2:	0f 86 7a 04 00 00    	jbe    0x14031d942
   14031d4c8:	0f 5a c2             	cvtps2pd xmm0,xmm2
   14031d4cb:	f3 0f 5a c9          	cvtss2sd xmm1,xmm1
   14031d4cf:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   14031d4d4:	66 0f 2f c1          	comisd xmm0,xmm1
   14031d4d8:	0f 86 64 04 00 00    	jbe    0x14031d942
   14031d4de:	ba 30 00 00 00       	mov    edx,0x30
   14031d4e3:	48 8b cf             	mov    rcx,rdi
   14031d4e6:	e8 f5 84 02 00       	call   0x1403459e0
   14031d4eb:	84 c0                	test   al,al
   14031d4ed:	0f 84 d1 00 00 00    	je     0x14031d5c4
   14031d4f3:	48 8d 84 24 90 00 00 	lea    rax,[rsp+0x90]
   14031d4fa:	00 
   14031d4fb:	b9 03 00 00 00       	mov    ecx,0x3
   14031d500:	48 c7 00 ff ff ff ff 	mov    QWORD PTR [rax],0xffffffffffffffff
   14031d507:	48 c7 40 08 ff ff ff 	mov    QWORD PTR [rax+0x8],0xffffffffffffffff
   14031d50e:	ff 
   14031d50f:	48 c7 40 10 ff ff ff 	mov    QWORD PTR [rax+0x10],0xffffffffffffffff
   14031d516:	ff 
   14031d517:	48 8d 40 40          	lea    rax,[rax+0x40]
   14031d51b:	48 c7 40 d8 ff ff ff 	mov    QWORD PTR [rax-0x28],0xffffffffffffffff
   14031d522:	ff 
   14031d523:	48 c7 40 e0 ff ff ff 	mov    QWORD PTR [rax-0x20],0xffffffffffffffff
   14031d52a:	ff 
   14031d52b:	48 c7 40 e8 ff ff ff 	mov    QWORD PTR [rax-0x18],0xffffffffffffffff
   14031d532:	ff 
   14031d533:	48 c7 40 f0 ff ff ff 	mov    QWORD PTR [rax-0x10],0xffffffffffffffff
   14031d53a:	ff 
   14031d53b:	48 c7 40 f8 ff ff ff 	mov    QWORD PTR [rax-0x8],0xffffffffffffffff
   14031d542:	ff 
   14031d543:	48 83 e9 01          	sub    rcx,0x1
   14031d547:	75 b7                	jne    0x14031d500
   14031d549:	44 8b 87 48 05 00 00 	mov    r8d,DWORD PTR [rdi+0x548]
   14031d550:	8d 51 01             	lea    edx,[rcx+0x1]
   14031d553:	45 33 c9             	xor    r9d,r9d
   14031d556:	45 85 c0             	test   r8d,r8d
   14031d559:	74 3a                	je     0x14031d595
   14031d55b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14031d560:	4b 8d 0c 89          	lea    rcx,[r9+r9*4]
   14031d564:	41 f6 44 cc 0c 01    	test   BYTE PTR [r12+rcx*8+0xc],0x1
   14031d56a:	74 18                	je     0x14031d584
   14031d56c:	8d 42 ff             	lea    eax,[rdx-0x1]
   14031d56f:	ff c2                	inc    edx
   14031d571:	8b c8                	mov    ecx,eax
   14031d573:	44 89 8c 84 90 00 00 	mov    DWORD PTR [rsp+rax*4+0x90],r9d
   14031d57a:	00 
   14031d57b:	83 fa 30             	cmp    edx,0x30
   14031d57e:	0f 87 04 01 00 00    	ja     0x14031d688
   14031d584:	41 ff c1             	inc    r9d
   14031d587:	45 3b c8             	cmp    r9d,r8d
   14031d58a:	72 d4                	jb     0x14031d560
   14031d58c:	83 fa 30             	cmp    edx,0x30
   14031d58f:	0f 87 f3 00 00 00    	ja     0x14031d688
   14031d595:	41 81 f8 00 3c 00 00 	cmp    r8d,0x3c00
   14031d59c:	73 26                	jae    0x14031d5c4
   14031d59e:	66 90                	xchg   ax,ax
   14031d5a0:	8d 42 ff             	lea    eax,[rdx-0x1]
   14031d5a3:	ff c2                	inc    edx
   14031d5a5:	8b c8                	mov    ecx,eax
   14031d5a7:	44 89 84 84 90 00 00 	mov    DWORD PTR [rsp+rax*4+0x90],r8d
   14031d5ae:	00 
   14031d5af:	83 fa 30             	cmp    edx,0x30
   14031d5b2:	0f 87 d0 00 00 00    	ja     0x14031d688
   14031d5b8:	41 ff c0             	inc    r8d
   14031d5bb:	41 81 f8 00 3c 00 00 	cmp    r8d,0x3c00
   14031d5c2:	72 dc                	jb     0x14031d5a0
   14031d5c4:	48 8b 54 24 28       	mov    rdx,QWORD PTR [rsp+0x28]
   14031d5c9:	45 33 c0             	xor    r8d,r8d
   14031d5cc:	4c 8b 7c 24 38       	mov    r15,QWORD PTR [rsp+0x38]
   14031d5d1:	44 8b 5c 24 20       	mov    r11d,DWORD PTR [rsp+0x20]
   14031d5d6:	48 8b 74 24 68       	mov    rsi,QWORD PTR [rsp+0x68]
   14031d5db:	41 ff c5             	inc    r13d
   14031d5de:	48 ff c5             	inc    rbp
   14031d5e1:	44 89 6c 24 34       	mov    DWORD PTR [rsp+0x34],r13d
   14031d5e6:	48 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],rbp
   14031d5eb:	45 3b ee             	cmp    r13d,r14d
   14031d5ee:	0f 82 5c fb ff ff    	jb     0x14031d150
   14031d5f4:	41 ff c3             	inc    r11d
   14031d5f7:	44 89 5c 24 20       	mov    DWORD PTR [rsp+0x20],r11d
   14031d5fc:	44 3b 5c 24 40       	cmp    r11d,DWORD PTR [rsp+0x40]
   14031d601:	0f 8c ea fa ff ff    	jl     0x14031d0f1
   14031d607:	44 0f 28 a4 24 e0 02 	movaps xmm12,XMMWORD PTR [rsp+0x2e0]
   14031d60e:	00 00 
   14031d610:	44 0f 28 9c 24 f0 02 	movaps xmm11,XMMWORD PTR [rsp+0x2f0]
   14031d617:	00 00 
   14031d619:	44 0f 28 94 24 00 03 	movaps xmm10,XMMWORD PTR [rsp+0x300]
   14031d620:	00 00 
   14031d622:	44 0f 28 8c 24 10 03 	movaps xmm9,XMMWORD PTR [rsp+0x310]
   14031d629:	00 00 
   14031d62b:	44 0f 28 84 24 20 03 	movaps xmm8,XMMWORD PTR [rsp+0x320]
   14031d632:	00 00 
   14031d634:	0f 28 bc 24 30 03 00 	movaps xmm7,XMMWORD PTR [rsp+0x330]
   14031d63b:	00 
   14031d63c:	0f 28 b4 24 40 03 00 	movaps xmm6,XMMWORD PTR [rsp+0x340]
   14031d643:	00 
   14031d644:	4c 8b bc 24 50 03 00 	mov    r15,QWORD PTR [rsp+0x350]
   14031d64b:	00 
   14031d64c:	4c 8b b4 24 58 03 00 	mov    r14,QWORD PTR [rsp+0x358]
   14031d653:	00 
   14031d654:	4c 8b ac 24 60 03 00 	mov    r13,QWORD PTR [rsp+0x360]
   14031d65b:	00 
   14031d65c:	48 8b b4 24 68 03 00 	mov    rsi,QWORD PTR [rsp+0x368]
   14031d663:	00 
   14031d664:	48 8b ac 24 a0 03 00 	mov    rbp,QWORD PTR [rsp+0x3a0]
   14031d66b:	00 
   14031d66c:	48 8b 8c 24 d0 02 00 	mov    rcx,QWORD PTR [rsp+0x2d0]
   14031d673:	00 
   14031d674:	48 33 cc             	xor    rcx,rsp
   14031d677:	e8 84 df 2f 00       	call   0x14061b600
   14031d67c:	48 81 c4 70 03 00 00 	add    rsp,0x370
   14031d683:	41 5c                	pop    r12
   14031d685:	5f                   	pop    rdi
   14031d686:	5b                   	pop    rbx
   14031d687:	c3                   	ret
   14031d688:	48 8b 0d 79 c8 66 00 	mov    rcx,QWORD PTR [rip+0x66c879]        # 0x140989f08
   14031d68f:	ba ff ff ff ff       	mov    edx,0xffffffff
   14031d694:	ff 15 b6 af 36 00    	call   QWORD PTR [rip+0x36afb6]        # 0x140688650
   14031d69a:	44 8b 35 47 c9 66 00 	mov    r14d,DWORD PTR [rip+0x66c947]        # 0x140989fe8
   14031d6a1:	48 8b 0d 60 c8 66 00 	mov    rcx,QWORD PTR [rip+0x66c860]        # 0x140989f08
   14031d6a8:	41 8d 46 01          	lea    eax,[r14+0x1]
   14031d6ac:	89                   	.byte 0x89
   14031d6ad:	05                   	.byte 0x5
   14031d6ae:	36 c9                	ss leave
