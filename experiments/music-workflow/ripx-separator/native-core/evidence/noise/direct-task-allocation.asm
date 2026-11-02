
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140343000 <.text+0x342000>:
   140343000:	cb                   	retf
   140343001:	48 89 74 24 78       	mov    QWORD PTR [rsp+0x78],rsi
   140343006:	41 8b 85 48 05 00 00 	mov    eax,DWORD PTR [r13+0x548]
   14034300d:	8b d0                	mov    edx,eax
   14034300f:	3b d8                	cmp    ebx,eax
   140343011:	0f 8c 29 fb ff ff    	jl     0x140342b40
   140343017:	f3 44 0f 10 75 f4    	movss  xmm14,DWORD PTR [rbp-0xc]
   14034301d:	f3 44 0f 10 3d 46 41 	movss  xmm15,DWORD PTR [rip+0x354146]        # 0x14069716c
   140343024:	35 00 
   140343026:	49 8b cf             	mov    rcx,r15
   140343029:	e8 2a 85 2d 00       	call   0x14061b558
   14034302e:	44 8b 4d 84          	mov    r9d,DWORD PTR [rbp-0x7c]
   140343032:	48 8d 1d e7 6e 64 00 	lea    rbx,[rip+0x646ee7]        # 0x140989f20
   140343039:	41 8b 45 10          	mov    eax,DWORD PTR [r13+0x10]
   14034303d:	41 ff c1             	inc    r9d
   140343040:	03 87 bc 00 00 00    	add    eax,DWORD PTR [rdi+0xbc]
   140343046:	4c 8b 7d 10          	mov    r15,QWORD PTR [rbp+0x10]
   14034304a:	44 89 4d 84          	mov    DWORD PTR [rbp-0x7c],r9d
   14034304e:	44 3b c8             	cmp    r9d,eax
   140343051:	0f 8c a9 d9 ff ff    	jl     0x140340a00
   140343057:	44 0f 28 bc 24 20 40 	movaps xmm15,XMMWORD PTR [rsp+0x4020]
   14034305e:	00 00 
   140343060:	44 0f 28 b4 24 30 40 	movaps xmm14,XMMWORD PTR [rsp+0x4030]
   140343067:	00 00 
   140343069:	44 0f 28 ac 24 40 40 	movaps xmm13,XMMWORD PTR [rsp+0x4040]
   140343070:	00 00 
   140343072:	44 0f 28 a4 24 50 40 	movaps xmm12,XMMWORD PTR [rsp+0x4050]
   140343079:	00 00 
   14034307b:	44 0f 28 9c 24 60 40 	movaps xmm11,XMMWORD PTR [rsp+0x4060]
   140343082:	00 00 
   140343084:	44 0f 28 94 24 70 40 	movaps xmm10,XMMWORD PTR [rsp+0x4070]
   14034308b:	00 00 
   14034308d:	44 0f 28 8c 24 80 40 	movaps xmm9,XMMWORD PTR [rsp+0x4080]
   140343094:	00 00 
   140343096:	0f 28 bc 24 a0 40 00 	movaps xmm7,XMMWORD PTR [rsp+0x40a0]
   14034309d:	00 
   14034309e:	48 8b 5d 10          	mov    rbx,QWORD PTR [rbp+0x10]
   1403430a2:	44 0f 28 84 24 90 40 	movaps xmm8,XMMWORD PTR [rsp+0x4090]
   1403430a9:	00 00 
   1403430ab:	0f 28 b4 24 b0 40 00 	movaps xmm6,XMMWORD PTR [rsp+0x40b0]
   1403430b2:	00 
   1403430b3:	4c 8b a4 24 c0 40 00 	mov    r12,QWORD PTR [rsp+0x40c0]
   1403430ba:	00 
   1403430bb:	48 85 db             	test   rbx,rbx
   1403430be:	74 28                	je     0x1403430e8
   1403430c0:	80 7c 24 68 00       	cmp    BYTE PTR [rsp+0x68],0x0
   1403430c5:	74 12                	je     0x1403430d9
   1403430c7:	44 8b 4d e0          	mov    r9d,DWORD PTR [rbp-0x20]
   1403430cb:	4c 8b c3             	mov    r8,rbx
   1403430ce:	49 8b d5             	mov    rdx,r13
   1403430d1:	48 8b cf             	mov    rcx,rdi
   1403430d4:	e8 67 ab fe ff       	call   0x14032dc40
   1403430d9:	80 7c 24 69 00       	cmp    BYTE PTR [rsp+0x69],0x0
   1403430de:	74 08                	je     0x1403430e8
   1403430e0:	48 8b cb             	mov    rcx,rbx
   1403430e3:	e8 70 84 2d 00       	call   0x14061b558
   1403430e8:	41 8b 85 48 05 00 00 	mov    eax,DWORD PTR [r13+0x548]
   1403430ef:	45 33 ff             	xor    r15d,r15d
   1403430f2:	41 8b d7             	mov    edx,r15d
   1403430f5:	85 c0                	test   eax,eax
   1403430f7:	7e 29                	jle    0x140343122
   1403430f9:	49 8d 4e 0c          	lea    rcx,[r14+0xc]
   1403430fd:	0f 1f 00             	nop    DWORD PTR [rax]
   140343100:	0f b6 01             	movzx  eax,BYTE PTR [rcx]
   140343103:	a8 01                	test   al,0x1
   140343105:	75 0a                	jne    0x140343111
   140343107:	80 79 18 01          	cmp    BYTE PTR [rcx+0x18],0x1
   14034310b:	75 04                	jne    0x140343111
   14034310d:	24 fd                	and    al,0xfd
   14034310f:	88 01                	mov    BYTE PTR [rcx],al
   140343111:	41 8b 85 48 05 00 00 	mov    eax,DWORD PTR [r13+0x548]
   140343118:	ff c2                	inc    edx
   14034311a:	48 83 c1 28          	add    rcx,0x28
   14034311e:	3b d0                	cmp    edx,eax
   140343120:	7c de                	jl     0x140343100
   140343122:	41 8b f7             	mov    esi,r15d
   140343125:	85 c0                	test   eax,eax
   140343127:	0f 8e 4a 01 00 00    	jle    0x140343277
   14034312d:	49 8d 7e 24          	lea    rdi,[r14+0x24]
   140343131:	0f b6 4f e8          	movzx  ecx,BYTE PTR [rdi-0x18]
   140343135:	8b d0                	mov    edx,eax
   140343137:	f6 c1 01             	test   cl,0x1
   14034313a:	0f 85 27 01 00 00    	jne    0x140343267
   140343140:	80 3f 01             	cmp    BYTE PTR [rdi],0x1
   140343143:	0f 85 1e 01 00 00    	jne    0x140343267
   140343149:	f6 c1 02             	test   cl,0x2
   14034314c:	0f 85 15 01 00 00    	jne    0x140343267
   140343152:	45 8b df             	mov    r11d,r15d
   140343155:	85 c0                	test   eax,eax
   140343157:	7e 33                	jle    0x14034318c
   140343159:	41 8b 95 48 05 00 00 	mov    edx,DWORD PTR [r13+0x548]
   140343160:	49 8d 4e 10          	lea    rcx,[r14+0x10]
   140343164:	44 8b c2             	mov    r8d,edx
   140343167:	f6 41 fc 01          	test   BYTE PTR [rcx-0x4],0x1
   14034316b:	75 15                	jne    0x140343182
   14034316d:	8b 47 ec             	mov    eax,DWORD PTR [rdi-0x14]
   140343170:	39 01                	cmp    DWORD PTR [rcx],eax
   140343172:	75 0e                	jne    0x140343182
   140343174:	0f b7 41 f8          	movzx  eax,WORD PTR [rcx-0x8]
   140343178:	44 3b d8             	cmp    r11d,eax
   14034317b:	41 0f 43 c3          	cmovae eax,r11d
   14034317f:	44 8b d8             	mov    r11d,eax
   140343182:	48 83 c1 28          	add    rcx,0x28
   140343186:	49 83 e8 01          	sub    r8,0x1
   14034318a:	75 db                	jne    0x140343167
   14034318c:	41 8b df             	mov    ebx,r15d
   14034318f:	85 d2                	test   edx,edx
   140343191:	0f 8e d0 00 00 00    	jle    0x140343267
   140343197:	4d 8d 4e 08          	lea    r9,[r14+0x8]
   14034319b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   1403431a0:	41 0f b6 49 04       	movzx  ecx,BYTE PTR [r9+0x4]
   1403431a5:	f6 c1 01             	test   cl,0x1
   1403431a8:	0f 85 a4 00 00 00    	jne    0x140343252
   1403431ae:	8b 47 ec             	mov    eax,DWORD PTR [rdi-0x14]
   1403431b1:	41 39 41 08          	cmp    DWORD PTR [r9+0x8],eax
   1403431b5:	0f 85 97 00 00 00    	jne    0x140343252
   1403431bb:	45 0f b7 11          	movzx  r10d,WORD PTR [r9]
   1403431bf:	45 3b d3             	cmp    r10d,r11d
   1403431c2:	0f 83 83 00 00 00    	jae    0x14034324b
   1403431c8:	4d 8b 41 f8          	mov    r8,QWORD PTR [r9-0x8]
   1403431cc:	7d 79                	jge    0x140343247
   1403431ce:	49 6b ca 5c          	imul   rcx,r10,0x5c
   1403431d2:	49 8d 50 0c          	lea    rdx,[r8+0xc]
   1403431d6:	41 8b c3             	mov    eax,r11d
   1403431d9:	48 03 d1             	add    rdx,rcx
   1403431dc:	41 2b c2             	sub    eax,r10d
   1403431df:	44 8b d0             	mov    r10d,eax
   1403431e2:	41 0f b7 01          	movzx  eax,WORD PTR [r9]
   1403431e6:	48 8d 52 5c          	lea    rdx,[rdx+0x5c]
   1403431ea:	48 6b c8 5c          	imul   rcx,rax,0x5c
   1403431ee:	42 0f 10 44 01 a4    	movups xmm0,XMMWORD PTR [rcx+r8*1-0x5c]
   1403431f4:	0f 11 42 98          	movups XMMWORD PTR [rdx-0x68],xmm0
   1403431f8:	42 0f 10 4c 01 b4    	movups xmm1,XMMWORD PTR [rcx+r8*1-0x4c]
   1403431fe:	0f 11 4a a8          	movups XMMWORD PTR [rdx-0x58],xmm1
   140343202:	42 0f 10 44 01 c4    	movups xmm0,XMMWORD PTR [rcx+r8*1-0x3c]
   140343208:	0f 11 42 b8          	movups XMMWORD PTR [rdx-0x48],xmm0
   14034320c:	42 0f 10 4c 01 d4    	movups xmm1,XMMWORD PTR [rcx+r8*1-0x2c]
   140343212:	0f 11 4a c8          	movups XMMWORD PTR [rdx-0x38],xmm1
   140343216:	42 0f 10 44 01 e4    	movups xmm0,XMMWORD PTR [rcx+r8*1-0x1c]
   14034321c:	0f 11 42 d8          	movups XMMWORD PTR [rdx-0x28],xmm0
   140343220:	f2 42 0f 10 4c 01 f4 	movsd  xmm1,QWORD PTR [rcx+r8*1-0xc]
   140343227:	f2 0f 11 4a e8       	movsd  QWORD PTR [rdx-0x18],xmm1
   14034322c:	42 8b 44 01 fc       	mov    eax,DWORD PTR [rcx+r8*1-0x4]
   140343231:	89 42 f0             	mov    DWORD PTR [rdx-0x10],eax
   140343234:	4c 89 7a a0          	mov    QWORD PTR [rdx-0x60],r15
   140343238:	44 88 7a e0          	mov    BYTE PTR [rdx-0x20],r15b
   14034323c:	49 83 ea 01          	sub    r10,0x1
   140343240:	75 a0                	jne    0x1403431e2
   140343242:	41 0f b6 49 04       	movzx  ecx,BYTE PTR [r9+0x4]
   140343247:	66 45 89 19          	mov    WORD PTR [r9],r11w
   14034324b:	80 c9 02             	or     cl,0x2
   14034324e:	41 88 49 04          	mov    BYTE PTR [r9+0x4],cl
   140343252:	41 8b 95 48 05 00 00 	mov    edx,DWORD PTR [r13+0x548]
   140343259:	ff c3                	inc    ebx
   14034325b:	49 83 c1 28          	add    r9,0x28
   14034325f:	3b da                	cmp    ebx,edx
   140343261:	0f 8c 39 ff ff ff    	jl     0x1403431a0
   140343267:	ff c6                	inc    esi
   140343269:	48 83 c7 28          	add    rdi,0x28
   14034326d:	8b c2                	mov    eax,edx
   14034326f:	3b f2                	cmp    esi,edx
   140343271:	0f 8c ba fe ff ff    	jl     0x140343131
   140343277:	48 8b bc 24 c8 40 00 	mov    rdi,QWORD PTR [rsp+0x40c8]
   14034327e:	00 
   14034327f:	45 8b df             	mov    r11d,r15d
   140343282:	48 8b b4 24 d0 40 00 	mov    rsi,QWORD PTR [rsp+0x40d0]
   140343289:	00 
   14034328a:	48 8b 9c 24 10 41 00 	mov    rbx,QWORD PTR [rsp+0x4110]
   140343291:	00 
   140343292:	85 c0                	test   eax,eax
   140343294:	0f 8e ff 00 00 00    	jle    0x140343399
   14034329a:	4d 8d 56 0c          	lea    r10,[r14+0xc]
   14034329e:	66 90                	xchg   ax,ax
   1403432a0:	41 0f b6 0a          	movzx  ecx,BYTE PTR [r10]
   1403432a4:	f6 c1 01             	test   cl,0x1
   1403432a7:	0f 85 d8 00 00 00    	jne    0x140343385
   1403432ad:	41 0f bf 42 fe       	movsx  eax,WORD PTR [r10-0x2]
   1403432b2:	41 3b 45 10          	cmp    eax,DWORD PTR [r13+0x10]
   1403432b6:	0f 8c c9 00 00 00    	jl     0x140343385
   1403432bc:	4d 8b 4a f4          	mov    r9,QWORD PTR [r10-0xc]
   1403432c0:	80 c9 01             	or     cl,0x1
   1403432c3:	41 88 0a             	mov    BYTE PTR [r10],cl
   1403432c6:	4d 85 c9             	test   r9,r9
   1403432c9:	0f 84 b2 00 00 00    	je     0x140343381
   1403432cf:	49 8b 8d 50 05 00 00 	mov    rcx,QWORD PTR [r13+0x550]
   1403432d6:	4c 3b c9             	cmp    r9,rcx
   1403432d9:	7c 4d                	jl     0x140343328
   1403432db:	41 8b 95 64 05 00 00 	mov    edx,DWORD PTR [r13+0x564]
   1403432e2:	41 8b 85 60 05 00 00 	mov    eax,DWORD PTR [r13+0x560]
   1403432e9:	48 0f af c2          	imul   rax,rdx
   1403432ed:	48 6b c0 5c          	imul   rax,rax,0x5c
   1403432f1:	48 03 c1             	add    rax,rcx
   1403432f4:	4c 3b c8             	cmp    r9,rax
   1403432f7:	7d 2f                	jge    0x140343328
   1403432f9:	44 6b c2 5c          	imul   r8d,edx,0x5c
   1403432fd:	49 8b c1             	mov    rax,r9
   140343300:	48 2b c1             	sub    rax,rcx
   140343303:	49 8b 8d 58 05 00 00 	mov    rcx,QWORD PTR [r13+0x558]
   14034330a:	48 99                	cqo
   14034330c:	49 f7 f8             	idiv   r8
   14034330f:	8b d0                	mov    edx,eax
   140343311:	44 88 3c 0a          	mov    BYTE PTR [rdx+rcx*1],r15b
   140343315:	41 8b 8d 80 05 00 00 	mov    ecx,DWORD PTR [r13+0x580]
   14034331c:	3b c1                	cmp    eax,ecx
   14034331e:	0f 43 c1             	cmovae eax,ecx
   140343321:	41 89 85 80 05 00 00 	mov    DWORD PTR [r13+0x580],eax
   140343328:	49 8b 85 68 05 00 00 	mov    rax,QWORD PTR [r13+0x568]
   14034332f:	4c 3b c8             	cmp    r9,rax
   140343332:	7c 4d                	jl     0x140343381
   140343334:	41 8b 95 7c 05 00 00 	mov    edx,DWORD PTR [r13+0x57c]
   14034333b:	41 8b 8d 78 05 00 00 	mov    ecx,DWORD PTR [r13+0x578]
   140343342:	48 0f af ca          	imul   rcx,rdx
   140343346:	48 6b c9 5c          	imul   rcx,rcx,0x5c
   14034334a:	48 03 c8             	add    rcx,rax
   14034334d:	4c 3b c9             	cmp    r9,rcx
   140343350:	7d 2f                	jge    0x140343381
   140343352:	49 8b 8d 70 05 00 00 	mov    rcx,QWORD PTR [r13+0x570]
   140343359:	4c 2b c8             	sub    r9,rax
   14034335c:	44 6b c2 5c          	imul   r8d,edx,0x5c
   140343360:	49 8b c1             	mov    rax,r9
   140343363:	48 99                	cqo
   140343365:	49 f7 f8             	idiv   r8
   140343368:	8b d0                	mov    edx,eax
   14034336a:	44 88 3c 0a          	mov    BYTE PTR [rdx+rcx*1],r15b
   14034336e:	41 8b 8d 84 05 00 00 	mov    ecx,DWORD PTR [r13+0x584]
   140343375:	3b c1                	cmp    eax,ecx
   140343377:	0f 43 c1             	cmovae eax,ecx
   14034337a:	41 89 85 84 05 00 00 	mov    DWORD PTR [r13+0x584],eax
   140343381:	4d 89 7a f4          	mov    QWORD PTR [r10-0xc],r15
   140343385:	41 ff c3             	inc    r11d
   140343388:	49 83 c2 28          	add    r10,0x28
   14034338c:	45 3b 9d 48 05 00 00 	cmp    r11d,DWORD PTR [r13+0x548]
   140343393:	0f 8c 07 ff ff ff    	jl     0x1403432a0
   140343399:	48 8b 8d 10 3f 00 00 	mov    rcx,QWORD PTR [rbp+0x3f10]
   1403433a0:	48 33 cc             	xor    rcx,rsp
   1403433a3:	e8 58 82 2d 00       	call   0x14061b600
   1403433a8:	48 81 c4 d8 40 00 00 	add    rsp,0x40d8
   1403433af:	41 5f                	pop    r15
   1403433b1:	41 5e                	pop    r14
   1403433b3:	41 5d                	pop    r13
   1403433b5:	5d                   	pop    rbp
   1403433b6:	c3                   	ret
   1403433b7:	44 8b 64 24 54       	mov    r12d,DWORD PTR [rsp+0x54]
   1403433bc:	e9 79 fb ff ff       	jmp    0x140342f3a
   1403433c1:	44 8b 64 24 54       	mov    r12d,DWORD PTR [rsp+0x54]
   1403433c6:	48 8b 44 24 78       	mov    rax,QWORD PTR [rsp+0x78]
   1403433cb:	48 3b c6             	cmp    rax,rsi
   1403433ce:	0f 8f 0a 01 00 00    	jg     0x1403434de
   1403433d4:	4c 8b 55 c8          	mov    r10,QWORD PTR [rbp-0x38]
   1403433d8:	48 2b f0             	sub    rsi,rax
   1403433db:	4c 8b 7c 24 70       	mov    r15,QWORD PTR [rsp+0x70]
   1403433e0:	48 ff c6             	inc    rsi
   1403433e3:	41 0f b6 02          	movzx  eax,BYTE PTR [r10]
   1403433e7:	a8 01                	test   al,0x1
   1403433e9:	0f 85 d4 00 00 00    	jne    0x1403434c3
   1403433ef:	45 39 62 04          	cmp    DWORD PTR [r10+0x4],r12d
   1403433f3:	0f 85 ca 00 00 00    	jne    0x1403434c3
   1403433f9:	4d 8b 4a f4          	mov    r9,QWORD PTR [r10-0xc]
   1403433fd:	0c 01                	or     al,0x1
   1403433ff:	41 88 02             	mov    BYTE PTR [r10],al
   140343402:	4d 85 c9             	test   r9,r9
   140343405:	0f 84 b2 00 00 00    	je     0x1403434bd
   14034340b:	49 8b 8f 50 05 00 00 	mov    rcx,QWORD PTR [r15+0x550]
   140343412:	4c 3b c9             	cmp    r9,rcx
   140343415:	7c 4d                	jl     0x140343464
   140343417:	41 8b 97 64 05 00 00 	mov    edx,DWORD PTR [r15+0x564]
   14034341e:	41 8b 87 60 05 00 00 	mov    eax,DWORD PTR [r15+0x560]
   140343425:	48 0f af c2          	imul   rax,rdx
   140343429:	48 6b c0 5c          	imul   rax,rax,0x5c
   14034342d:	48 03 c1             	add    rax,rcx
   140343430:	4c 3b c8             	cmp    r9,rax
   140343433:	7d 2f                	jge    0x140343464
   140343435:	44 6b c2 5c          	imul   r8d,edx,0x5c
   140343439:	49 8b c1             	mov    rax,r9
   14034343c:	48 2b c1             	sub    rax,rcx
   14034343f:	49 8b 8f 58 05 00 00 	mov    rcx,QWORD PTR [r15+0x558]
   140343446:	48 99                	cqo
   140343448:	49 f7 f8             	idiv   r8
   14034344b:	8b d0                	mov    edx,eax
   14034344d:	c6 04 0a 00          	mov    BYTE PTR [rdx+rcx*1],0x0
   140343451:	41 8b 8f 80 05 00 00 	mov    ecx,DWORD PTR [r15+0x580]
   140343458:	3b c1                	cmp    eax,ecx
   14034345a:	0f 43 c1             	cmovae eax,ecx
   14034345d:	41 89 87 80 05 00 00 	mov    DWORD PTR [r15+0x580],eax
   140343464:	49 8b 87 68 05 00 00 	mov    rax,QWORD PTR [r15+0x568]
   14034346b:	4c 3b c8             	cmp    r9,rax
   14034346e:	7c 4d                	jl     0x1403434bd
   140343470:	41 8b 97 7c 05 00 00 	mov    edx,DWORD PTR [r15+0x57c]
   140343477:	41 8b 8f 78 05 00 00 	mov    ecx,DWORD PTR [r15+0x578]
   14034347e:	48 0f af ca          	imul   rcx,rdx
   140343482:	48 6b c9 5c          	imul   rcx,rcx,0x5c
   140343486:	48 03 c8             	add    rcx,rax
   140343489:	4c 3b c9             	cmp    r9,rcx
   14034348c:	7d 2f                	jge    0x1403434bd
   14034348e:	49 8b 8f 70 05 00 00 	mov    rcx,QWORD PTR [r15+0x570]
   140343495:	4c 2b c8             	sub    r9,rax
   140343498:	44 6b c2 5c          	imul   r8d,edx,0x5c
   14034349c:	49 8b c1             	mov    rax,r9
   14034349f:	48 99                	cqo
   1403434a1:	49 f7 f8             	idiv   r8
   1403434a4:	8b d0                	mov    edx,eax
   1403434a6:	c6 04 0a 00          	mov    BYTE PTR [rdx+rcx*1],0x0
   1403434aa:	41 8b 8f 84 05 00 00 	mov    ecx,DWORD PTR [r15+0x584]
   1403434b1:	3b c1                	cmp    eax,ecx
   1403434b3:	0f 43 c1             	cmovae eax,ecx
   1403434b6:	41 89 87 84 05 00 00 	mov    DWORD PTR [r15+0x584],eax
   1403434bd:	33 c0                	xor    eax,eax
   1403434bf:	49 89 42 f4          	mov    QWORD PTR [r10-0xc],rax
   1403434c3:	49 83 c2 28          	add    r10,0x28
   1403434c7:	48 83 ee 01          	sub    rsi,0x1
   1403434cb:	0f 85 12 ff ff ff    	jne    0x1403433e3
   1403434d1:	4c 8b 7d b8          	mov    r15,QWORD PTR [rbp-0x48]
   1403434d5:	48 8b 7d 88          	mov    rdi,QWORD PTR [rbp-0x78]
   1403434d9:	e9 02 fb ff ff       	jmp    0x140342fe0
   1403434de:	48 8b f0             	mov    rsi,rax
   1403434e1:	48 8b 7d 88          	mov    rdi,QWORD PTR [rbp-0x78]
   1403434e5:	e9 fb fa ff ff       	jmp    0x140342fe5
   1403434ea:	48 8b f0             	mov    rsi,rax
   1403434ed:	e9 f3 fa ff ff       	jmp    0x140342fe5
   1403434f2:	cc                   	int3
   1403434f3:	cc                   	int3
   1403434f4:	cc                   	int3
   1403434f5:	cc                   	int3
   1403434f6:	cc                   	int3
   1403434f7:	cc                   	int3
   1403434f8:	cc                   	int3
   1403434f9:	cc                   	int3
   1403434fa:	cc                   	int3
   1403434fb:	cc                   	int3
   1403434fc:	cc                   	int3
   1403434fd:	cc                   	int3
   1403434fe:	cc                   	int3
   1403434ff:	cc                   	int3
   140343500:	83 f9 20             	cmp    ecx,0x20
   140343503:	73 0a                	jae    0x14034350f
   140343505:	33 d2                	xor    edx,edx
   140343507:	b8 20 00 00 00       	mov    eax,0x20
   14034350c:	f7 f1                	div    ecx
   14034350e:	c3                   	ret
   14034350f:	b8 01 00 00 00       	mov    eax,0x1
   140343514:	c3                   	ret
   140343515:	cc                   	int3
   140343516:	cc                   	int3
   140343517:	cc                   	int3
   140343518:	cc                   	int3
   140343519:	cc                   	int3
   14034351a:	cc                   	int3
   14034351b:	cc                   	int3
   14034351c:	cc                   	int3
   14034351d:	cc                   	int3
   14034351e:	cc                   	int3
   14034351f:	cc                   	int3
   140343520:	f3 0f 10 15 84 6c 64 	movss  xmm2,DWORD PTR [rip+0x646c84]        # 0x14098a1ac
   140343527:	00 
   140343528:	ba 01 00 00 00       	mov    edx,0x1
   14034352d:	0f 28 c2             	movaps xmm0,xmm2
   140343530:	c7 05 2a 6b 64 00 3f 	mov    DWORD PTR [rip+0x646b2a],0x13f        # 0x14098a064
   140343537:	01 00 00 
   14034353a:	f3 0f 59 05 a6 ab 34 	mulss  xmm0,DWORD PTR [rip+0x34aba6]        # 0x14068e0e8
   140343541:	00 
   140343542:	8b c2                	mov    eax,edx
   140343544:	f3 0f 59 15 74 ca 50 	mulss  xmm2,DWORD PTR [rip+0x50ca74]        # 0x14084ffc0
   14034354b:	00 
   14034354c:	f3 0f 58 05 88 ca 50 	addss  xmm0,DWORD PTR [rip+0x50ca88]        # 0x14084ffdc
   140343553:	00 
   140343554:	f3 0f 58 15 80 ca 50 	addss  xmm2,DWORD PTR [rip+0x50ca80]        # 0x14084ffdc
   14034355b:	00 
   14034355c:	f3 0f 2c c8          	cvttss2si ecx,xmm0
   140343560:	3b ca                	cmp    ecx,edx
   140343562:	0f 4f c1             	cmovg  eax,ecx
   140343565:	89 05 f1 6a 64 00    	mov    DWORD PTR [rip+0x646af1],eax        # 0x14098a05c
   14034356b:	8b c2                	mov    eax,edx
   14034356d:	0f 4f c1             	cmovg  eax,ecx
   140343570:	89 05 ea 6a 64 00    	mov    DWORD PTR [rip+0x646aea],eax        # 0x14098a060
   140343576:	f3 0f 2c c2          	cvttss2si eax,xmm2
   14034357a:	3b c2                	cmp    eax,edx
   14034357c:	0f 4f d0             	cmovg  edx,eax
   14034357f:	89 15 5f 6a 64 00    	mov    DWORD PTR [rip+0x646a5f],edx        # 0x140989fe4
   140343585:	c3                   	ret
   140343586:	cc                   	int3
   140343587:	cc                   	int3
   140343588:	cc                   	int3
   140343589:	cc                   	int3
   14034358a:	cc                   	int3
   14034358b:	cc                   	int3
   14034358c:	cc                   	int3
   14034358d:	cc                   	int3
   14034358e:	cc                   	int3
   14034358f:	cc                   	int3
   140343590:	48 89 54 24 10       	mov    QWORD PTR [rsp+0x10],rdx
   140343595:	55                   	push   rbp
   140343596:	56                   	push   rsi
   140343597:	41 55                	push   r13
   140343599:	41 56                	push   r14
   14034359b:	41 57                	push   r15
   14034359d:	48 83 ec 20          	sub    rsp,0x20
   1403435a1:	44 8b 05 00 6c 64 00 	mov    r8d,DWORD PTR [rip+0x646c00]        # 0x14098a1a8
   1403435a8:	0f 57 c0             	xorps  xmm0,xmm0
   1403435ab:	f3 0f 10 15 f1 da 66 	movss  xmm2,DWORD PTR [rip+0x1466daf1]        # 0x1549b10a4
   1403435b2:	14 
   1403435b3:	45 8b c8             	mov    r9d,r8d
   1403435b6:	41 c1 e1 06          	shl    r9d,0x6
   1403435ba:	45 33 ff             	xor    r15d,r15d
   1403435bd:	0f 2e d0             	ucomiss xmm2,xmm0
   1403435c0:	4c 8b f2             	mov    r14,rdx
   1403435c3:	48 8b f1             	mov    rsi,rcx
   1403435c6:	7a 0a                	jp     0x1403435d2
   1403435c8:	75 08                	jne    0x1403435d2
   1403435ca:	41 8b d7             	mov    edx,r15d
   1403435cd:	e9 8f 00 00 00       	jmp    0x140343661
   1403435d2:	8b 05 7c 6b 64 00    	mov    eax,DWORD PTR [rip+0x646b7c]        # 0x14098a154
   1403435d8:	0f 57 c9             	xorps  xmm1,xmm1
   1403435db:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   1403435e0:	0f 28 c1             	movaps xmm0,xmm1
   1403435e3:	f3 0f 59 05 0d 2b 36 	mulss  xmm0,DWORD PTR [rip+0x362b0d]        # 0x1406a60f8
   1403435ea:	00 
   1403435eb:	f3 0f 5e c2          	divss  xmm0,xmm2
   1403435ef:	f3 0f 10 15 11 43 36 	movss  xmm2,DWORD PTR [rip+0x364311]        # 0x1406a7908
   1403435f6:	00 
   1403435f7:	f3 0f 58 c2          	addss  xmm0,xmm2
   1403435fb:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140343600:	0f 28 c1             	movaps xmm0,xmm1
   140343603:	f3 0f 59 05 dd aa 34 	mulss  xmm0,DWORD PTR [rip+0x34aadd]        # 0x14068e0e8
   14034360a:	00 
   14034360b:	f3 0f 58 c2          	addss  xmm0,xmm2
   14034360f:	f3 48 0f 2c d0       	cvttss2si rdx,xmm0
   140343614:	3b c2                	cmp    eax,edx
   140343616:	0f 43 d0             	cmovae edx,eax
   140343619:	44 38 b9 91 00 00 00 	cmp    BYTE PTR [rcx+0x91],r15b
   140343620:	74 0a                	je     0x14034362c
   140343622:	f3 0f 10 05 76 cb 50 	movss  xmm0,DWORD PTR [rip+0x50cb76]        # 0x1408501a0
   140343629:	00 
   14034362a:	eb 08                	jmp    0x140343634
   14034362c:	f3 0f 10 05 fc c9 50 	movss  xmm0,DWORD PTR [rip+0x50c9fc]        # 0x140850030
   140343633:	00 
   140343634:	f3 0f 59 05 d4 3a 35 	mulss  xmm0,DWORD PTR [rip+0x353ad4]        # 0x140697110
   14034363b:	00 
   14034363c:	8b 46 28             	mov    eax,DWORD PTR [rsi+0x28]
   14034363f:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140343643:	8d 04 45 01 00 00 00 	lea    eax,[rax*2+0x1]
   14034364a:	41 0f af c0          	imul   eax,r8d
   14034364e:	f3 0f 58 c2          	addss  xmm0,xmm2
   140343652:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0
   140343657:	3b c1                	cmp    eax,ecx
   140343659:	0f 43 c1             	cmovae eax,ecx
   14034365c:	3b c2                	cmp    eax,edx
   14034365e:	0f 42 d0             	cmovb  edx,eax
   140343661:	44 0f b7 56 14       	movzx  r10d,WORD PTR [rsi+0x14]
   140343666:	8b c2                	mov    eax,edx
   140343668:	99                   	cdq
   140343669:	2b c2                	sub    eax,edx
   14034366b:	d1 f8                	sar    eax,1
   14034366d:	8b c8                	mov    ecx,eax
   14034366f:	41 8b c0             	mov    eax,r8d
   140343672:	99                   	cdq
   140343673:	2b c2                	sub    eax,edx
   140343675:	d1 f8                	sar    eax,1
   140343677:	2b c1                	sub    eax,ecx
   140343679:	41 03 c1             	add    eax,r9d
   14034367c:	85 c0                	test   eax,eax
   14034367e:	41 0f 4e c7          	cmovle eax,r15d
   140343682:	99                   	cdq
   140343683:	41 f7 f8             	idiv   r8d
   140343686:	41 b8 01 00 00 00    	mov    r8d,0x1
   14034368c:	44 8b d8             	mov    r11d,eax
   14034368f:	66 45 85 d2          	test   r10w,r10w
   140343693:	75 1c                	jne    0x1403436b1
   140343695:	8b 4e 28             	mov    ecx,DWORD PTR [rsi+0x28]
   140343698:	39 0d 46 69 64 00    	cmp    DWORD PTR [rip+0x646946],ecx        # 0x140989fe4
   14034369e:	0f 4c 0d 3f 69 64 00 	cmovl  ecx,DWORD PTR [rip+0x64693f]        # 0x140989fe4
   1403436a5:	41 3b c8             	cmp    ecx,r8d
   1403436a8:	44 0f 4f c1          	cmovg  r8d,ecx
   1403436ac:	e9 80 00 00 00       	jmp    0x140343731
   1403436b1:	f3 0f 10 05 f3 6a 64 	movss  xmm0,DWORD PTR [rip+0x646af3]        # 0x14098a1ac
   1403436b8:	00 
   1403436b9:	f3 0f 59 05 43 3a 35 	mulss  xmm0,DWORD PTR [rip+0x353a43]        # 0x140697104
   1403436c0:	00 
   1403436c1:	8b 4e 24             	mov    ecx,DWORD PTR [rsi+0x24]
   1403436c4:	f3 0f 58 05 10 c9 50 	addss  xmm0,DWORD PTR [rip+0x50c910]        # 0x14084ffdc
   1403436cb:	00 
   1403436cc:	f3 44 0f 2c c8       	cvttss2si r9d,xmm0
   1403436d1:	83 f9 20             	cmp    ecx,0x20
   1403436d4:	73 0d                	jae    0x1403436e3
   1403436d6:	33 d2                	xor    edx,edx
   1403436d8:	b8 20 00 00 00       	mov    eax,0x20
   1403436dd:	f7 f1                	div    ecx
   1403436df:	8b c8                	mov    ecx,eax
   1403436e1:	eb 04                	jmp    0x1403436e7
   1403436e3:	41 0f b7 c8          	movzx  ecx,r8w
   1403436e7:	41 8b c0             	mov    eax,r8d
   1403436ea:	0f b7 c9             	movzx  ecx,cx
   1403436ed:	44 3b c8             	cmp    r9d,eax
   1403436f0:	41 0f 4f c1          	cmovg  eax,r9d
   1403436f4:	41 2b c3             	sub    eax,r11d
   1403436f7:	83 c0 40             	add    eax,0x40
   1403436fa:	99                   	cdq
   1403436fb:	f7 f9                	idiv   ecx
   1403436fd:	44 8b c8             	mov    r9d,eax
   140343700:	66 45 85 d2          	test   r10w,r10w
   140343704:	74 15                	je     0x14034371b
   140343706:	8b 15 50 69 64 00    	mov    edx,DWORD PTR [rip+0x646950]        # 0x14098a05c
   14034370c:	3b 15 4e 69 64 00    	cmp    edx,DWORD PTR [rip+0x64694e]        # 0x14098a060
   140343712:	0f 42 15 47 69 64 00 	cmovb  edx,DWORD PTR [rip+0x646947]        # 0x14098a060
   140343719:	eb 03                	jmp    0x14034371e
   14034371b:	41 8b d7             	mov    edx,r15d
   14034371e:	8b 46 28             	mov    eax,DWORD PTR [rsi+0x28]
   140343721:	2b c2                	sub    eax,edx
   140343723:	44 3b c8             	cmp    r9d,eax
   140343726:	44 0f 4d c8          	cmovge r9d,eax
   14034372a:	45 3b c8             	cmp    r9d,r8d
   14034372d:	45 0f 4f c1          	cmovg  r8d,r9d
   140343731:	48 89 5c 24 50       	mov    QWORD PTR [rsp+0x50],rbx
   140343736:	45 8b ef             	mov    r13d,r15d
   140343739:	48 89 7c 24 60       	mov    QWORD PTR [rsp+0x60],rdi
   14034373e:	48 c7 c5 ff ff ff ff 	mov    rbp,0xffffffffffffffff
   140343745:	4c 89 64 24 68       	mov    QWORD PTR [rsp+0x68],r12
   14034374a:	44 89 86 b8 00 00 00 	mov    DWORD PTR [rsi+0xb8],r8d
   140343751:	44 39 3d 50 62 5f 00 	cmp    DWORD PTR [rip+0x5f6250],r15d        # 0x1409399a8
   140343758:	0f 86 4a 01 00 00    	jbe    0x1403438a8
   14034375e:	66 90                	xchg   ax,ax
   140343760:	8b 4e 20             	mov    ecx,DWORD PTR [rsi+0x20]
   140343763:	b8 04 00 00 00       	mov    eax,0x4
   140343768:	48 f7 e1             	mul    rcx
   14034376b:	45 8b fd             	mov    r15d,r13d
   14034376e:	48 0f 40 c5          	cmovo  rax,rbp
   140343772:	48 8b c8             	mov    rcx,rax
   140343775:	4b 8d 1c ff          	lea    rbx,[r15+r15*8]
   140343779:	e8 e2 7d 2d 00       	call   0x14061b560
   14034377e:	49 89 44 de 18       	mov    QWORD PTR [r14+rbx*8+0x18],rax
   140343783:	b8 04 00 00 00       	mov    eax,0x4
   140343788:	8b 4e 20             	mov    ecx,DWORD PTR [rsi+0x20]
   14034378b:	48 f7 e1             	mul    rcx
   14034378e:	48 0f 40 c5          	cmovo  rax,rbp
   140343792:	48 8b c8             	mov    rcx,rax
   140343795:	e8 c6 7d 2d 00       	call   0x14061b560
   14034379a:	49 89 84 de f0 00 00 	mov    QWORD PTR [r14+rbx*8+0xf0],rax
   1403437a1:	00 
   1403437a2:	33 db                	xor    ebx,ebx
   1403437a4:	39 9e c0 00 00 00    	cmp    DWORD PTR [rsi+0xc0],ebx
   1403437aa:	0f 86 90 00 00 00    	jbe    0x140343840
   1403437b0:	4f 8d 24 ff          	lea    r12,[r15+r15*8]
   1403437b4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403437b8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1403437bf:	00 
   1403437c0:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   1403437c7:	8b fb                	mov    edi,ebx
   1403437c9:	48 c1 e7 06          	shl    rdi,0x6
   1403437cd:	8b 4c 07 30          	mov    ecx,DWORD PTR [rdi+rax*1+0x30]
   1403437d1:	b8 04 00 00 00       	mov    eax,0x4
   1403437d6:	48 f7 e1             	mul    rcx
   1403437d9:	48 0f 40 c5          	cmovo  rax,rbp
   1403437dd:	48 8b c8             	mov    rcx,rax
   1403437e0:	e8 7b 7d 2d 00       	call   0x14061b560
   1403437e5:	ff c3                	inc    ebx
   1403437e7:	8b eb                	mov    ebp,ebx
   1403437e9:	49 03 ec             	add    rbp,r12
   1403437ec:	49 89 44 ee 18       	mov    QWORD PTR [r14+rbp*8+0x18],rax
   1403437f1:	48 85 c0             	test   rax,rax
   1403437f4:	0f 84 db 00 00 00    	je     0x1403438d5
   1403437fa:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   140343801:	8b 4c 07 30          	mov    ecx,DWORD PTR [rdi+rax*1+0x30]
   140343805:	b8 04 00 00 00       	mov    eax,0x4
   14034380a:	48 f7 e1             	mul    rcx
   14034380d:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   140343814:	48 0f 40 c1          	cmovo  rax,rcx
   140343818:	48 8b c8             	mov    rcx,rax
   14034381b:	e8 40 7d 2d 00       	call   0x14061b560
   140343820:	49 89 84 ee f0 00 00 	mov    QWORD PTR [r14+rbp*8+0xf0],rax
   140343827:	00 
   140343828:	48 85 c0             	test   rax,rax
   14034382b:	0f 84 a4 00 00 00    	je     0x1403438d5
   140343831:	48 c7 c5 ff ff ff ff 	mov    rbp,0xffffffffffffffff
   140343838:	3b 9e c0 00 00 00    	cmp    ebx,DWORD PTR [rsi+0xc0]
   14034383e:	72 80                	jb     0x1403437c0
   140343840:	8b 4e 20             	mov    ecx,DWORD PTR [rsi+0x20]
   140343843:	b8 04 00 00 00       	mov    eax,0x4
   140343848:	48 f7 e1             	mul    rcx
   14034384b:	48 0f 40 c5          	cmovo  rax,rbp
   14034384f:	48 8b c8             	mov    rcx,rax
   140343852:	e8 09 7d 2d 00       	call   0x14061b560
   140343857:	8b 96 c0 00 00 00    	mov    edx,DWORD PTR [rsi+0xc0]
   14034385d:	4b 8d 1c ff          	lea    rbx,[r15+r15*8]
   140343861:	ff c2                	inc    edx
   140343863:	48 03 d3             	add    rdx,rbx
   140343866:	49 89 44 d6 18       	mov    QWORD PTR [r14+rdx*8+0x18],rax
   14034386b:	b8 04 00 00 00       	mov    eax,0x4
   140343870:	8b 4e 20             	mov    ecx,DWORD PTR [rsi+0x20]
   140343873:	48 f7 e1             	mul    rcx
   140343876:	48 0f 40 c5          	cmovo  rax,rbp
   14034387a:	48 8b c8             	mov    rcx,rax
   14034387d:	e8 de 7c 2d 00       	call   0x14061b560
   140343882:	8b 96 c0 00 00 00    	mov    edx,DWORD PTR [rsi+0xc0]
   140343888:	41 ff c5             	inc    r13d
   14034388b:	ff c2                	inc    edx
   14034388d:	48 03 d3             	add    rdx,rbx
   140343890:	49 89 84 d6 f0 00 00 	mov    QWORD PTR [r14+rdx*8+0xf0],rax
   140343897:	00 
   140343898:	44 3b 2d 09 61 5f 00 	cmp    r13d,DWORD PTR [rip+0x5f6109]        # 0x1409399a8
   14034389f:	0f 82 bb fe ff ff    	jb     0x140343760
   1403438a5:	45 33 ff             	xor    r15d,r15d
   1403438a8:	b9 00 60 09 00       	mov    ecx,0x96000
   1403438ad:	e8 ae 7c 2d 00       	call   0x14061b560
   1403438b2:	49 89 86 40 05 00 00 	mov    QWORD PTR [r14+0x540],rax
   1403438b9:	66 83 7e 14 00       	cmp    WORD PTR [rsi+0x14],0x0
   1403438be:	76 21                	jbe    0x1403438e1
   1403438c0:	8b 0d 96 67 64 00    	mov    ecx,DWORD PTR [rip+0x646796]        # 0x14098a05c
   1403438c6:	3b 0d 94 67 64 00    	cmp    ecx,DWORD PTR [rip+0x646794]        # 0x14098a060
   1403438cc:	0f 42 0d 8d 67 64 00 	cmovb  ecx,DWORD PTR [rip+0x64678d]        # 0x14098a060
   1403438d3:	eb 0f                	jmp    0x1403438e4
   1403438d5:	49 8d 8e 90 04 00 00 	lea    rcx,[r14+0x490]
   1403438dc:	e9 8b 04 00 00       	jmp    0x140343d6c
   1403438e1:	41 8b cf             	mov    ecx,r15d
   1403438e4:	03 8e b8 00 00 00    	add    ecx,DWORD PTR [rsi+0xb8]
   1403438ea:	4d 8d a6 90 04 00 00 	lea    r12,[r14+0x490]
   1403438f1:	3b 4e 28             	cmp    ecx,DWORD PTR [rsi+0x28]
   1403438f4:	45 8b ef             	mov    r13d,r15d
   1403438f7:	0f 43 4e 28          	cmovae ecx,DWORD PTR [rsi+0x28]
   1403438fb:	89 8e bc 00 00 00    	mov    DWORD PTR [rsi+0xbc],ecx
   140343901:	83 3d a0 60 5f 00 00 	cmp    DWORD PTR [rip+0x5f60a0],0x0        # 0x1409399a8
   140343908:	0f 86 28 01 00 00    	jbe    0x140343a36
   14034390e:	8b 7c 24 58          	mov    edi,DWORD PTR [rsp+0x58]
   140343912:	41 8b c5             	mov    eax,r13d
   140343915:	48 6b d8 38          	imul   rbx,rax,0x38
   140343919:	33 c0                	xor    eax,eax
   14034391b:	4a 89 04 23          	mov    QWORD PTR [rbx+r12*1],rax
   14034391f:	4a 89 44 23 08       	mov    QWORD PTR [rbx+r12*1+0x8],rax
   140343924:	4a 89 44 23 10       	mov    QWORD PTR [rbx+r12*1+0x10],rax
   140343929:	4a 89 44 23 18       	mov    QWORD PTR [rbx+r12*1+0x18],rax
   14034392e:	4a 89 44 23 20       	mov    QWORD PTR [rbx+r12*1+0x20],rax
   140343933:	4a 89 44 23 28       	mov    QWORD PTR [rbx+r12*1+0x28],rax
   140343938:	4a 89 44 23 30       	mov    QWORD PTR [rbx+r12*1+0x30],rax
   14034393d:	b8 10 00 00 00       	mov    eax,0x10
   140343942:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   140343948:	03 4e 24             	add    ecx,DWORD PTR [rsi+0x24]
   14034394b:	0f af 0d 02 67 64 00 	imul   ecx,DWORD PTR [rip+0x646702]        # 0x14098a054
   140343952:	48 f7 e1             	mul    rcx
   140343955:	48 0f 40 c5          	cmovo  rax,rbp
   140343959:	48 8b c8             	mov    rcx,rax
   14034395c:	e8 ff 7b 2d 00       	call   0x14061b560
   140343961:	4a 89 04 23          	mov    QWORD PTR [rbx+r12*1],rax
   140343965:	41 bf 03 00 00 00    	mov    r15d,0x3
   14034396b:	8b 05 e3 66 64 00    	mov    eax,DWORD PTR [rip+0x6466e3]        # 0x14098a054
   140343971:	48 83 c3 20          	add    rbx,0x20
   140343975:	49 03 dc             	add    rbx,r12
   140343978:	49 c7 c6 ff ff ff ff 	mov    r14,0xffffffffffffffff
   14034397f:	8d 2c 85 00 00 00 00 	lea    ebp,[rax*4+0x0]
   140343986:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14034398d:	00 00 00 
   140343990:	b8 08 00 00 00       	mov    eax,0x8
   140343995:	48 f7 e5             	mul    rbp
   140343998:	49 0f 40 c6          	cmovo  rax,r14
   14034399c:	48 8b c8             	mov    rcx,rax
   14034399f:	e8 bc 7b 2d 00       	call   0x14061b560
   1403439a4:	48 89 43 e8          	mov    QWORD PTR [rbx-0x18],rax
   1403439a8:	b8 10 00 00 00       	mov    eax,0x10
   1403439ad:	48 f7 e5             	mul    rbp
   1403439b0:	49 0f 40 c6          	cmovo  rax,r14
   1403439b4:	48 8b c8             	mov    rcx,rax
   1403439b7:	e8 a4 7b 2d 00       	call   0x14061b560
   1403439bc:	48 89 03             	mov    QWORD PTR [rbx],rax
   1403439bf:	48 8d 5b 08          	lea    rbx,[rbx+0x8]
   1403439c3:	49 83 ef 01          	sub    r15,0x1
   1403439c7:	75 c7                	jne    0x140343990
   1403439c9:	44 8b 05 d8 67 64 00 	mov    r8d,DWORD PTR [rip+0x6467d8]        # 0x14098a1a8
   1403439d0:	41 8b cf             	mov    ecx,r15d
   1403439d3:	8b 15 7b 66 64 00    	mov    edx,DWORD PTR [rip+0x64667b]        # 0x14098a054
   1403439d9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   1403439e0:	83 f9 03             	cmp    ecx,0x3
   1403439e3:	73 22                	jae    0x140343a07
   1403439e5:	8b c1                	mov    eax,ecx
   1403439e7:	85 c9                	test   ecx,ecx
   1403439e9:	74 0a                	je     0x1403439f5
   1403439eb:	83 e8 01             	sub    eax,0x1
   1403439ee:	74 05                	je     0x1403439f5
   1403439f0:	83 f8 01             	cmp    eax,0x1
   1403439f3:	75 05                	jne    0x1403439fa
   1403439f5:	8b fa                	mov    edi,edx
   1403439f7:	c1 ef 02             	shr    edi,0x2
   1403439fa:	44 3b c7             	cmp    r8d,edi
   1403439fd:	41 8b c0             	mov    eax,r8d
   140343a00:	0f 42 c7             	cmovb  eax,edi
   140343a03:	8b f8                	mov    edi,eax
   140343a05:	eb 0e                	jmp    0x140343a15
   140343a07:	8b c2                	mov    eax,edx
   140343a09:	41 8b f8             	mov    edi,r8d
   140343a0c:	c1 e8 02             	shr    eax,0x2
   140343a0f:	44 3b c0             	cmp    r8d,eax
   140343a12:	0f 42 f8             	cmovb  edi,eax
   140343a15:	ff c1                	inc    ecx
   140343a17:	83 f9 04             	cmp    ecx,0x4
   140343a1a:	72 c4                	jb     0x1403439e0
   140343a1c:	41 ff c5             	inc    r13d
   140343a1f:	49 8b ee             	mov    rbp,r14
   140343a22:	44 3b 2d 7f 5f 5f 00 	cmp    r13d,DWORD PTR [rip+0x5f5f7f]        # 0x1409399a8
   140343a29:	0f 82 e3 fe ff ff    	jb     0x140343912
   140343a2f:	4c 8b 74 24 58       	mov    r14,QWORD PTR [rsp+0x58]
   140343a34:	eb 06                	jmp    0x140343a3c
   140343a36:	8b 15 18 66 64 00    	mov    edx,DWORD PTR [rip+0x646618]        # 0x14098a054
   140343a3c:	8b ca                	mov    ecx,edx
   140343a3e:	b8 04 00 00 00       	mov    eax,0x4
   140343a43:	48 f7 e1             	mul    rcx
   140343a46:	48 0f 40 c5          	cmovo  rax,rbp
   140343a4a:	48 8b c8             	mov    rcx,rax
   140343a4d:	e8 0e 7b 2d 00       	call   0x14061b560
   140343a52:	49 89 86 38 05 00 00 	mov    QWORD PTR [r14+0x538],rax
   140343a59:	b8 5c 00 00 00       	mov    eax,0x5c
   140343a5e:	8b 96 bc 00 00 00    	mov    edx,DWORD PTR [rsi+0xbc]
   140343a64:	03 56 28             	add    edx,DWORD PTR [rsi+0x28]
   140343a67:	03 56 24             	add    edx,DWORD PTR [rsi+0x24]
   140343a6a:	69 ca 00 1e 00 00    	imul   ecx,edx,0x1e00
   140343a70:	41 89 96 64 05 00 00 	mov    DWORD PTR [r14+0x564],edx
   140343a77:	41 c7 86 60 05 00 00 	mov    DWORD PTR [r14+0x560],0x1e00
   140343a7e:	00 1e 00 00 
   140343a82:	48 f7 e1             	mul    rcx
   140343a85:	48 0f 40 c5          	cmovo  rax,rbp
   140343a89:	48 8b c8             	mov    rcx,rax
   140343a8c:	e8 cf 7a 2d 00       	call   0x14061b560
   140343a91:	41 8b 8e 60 05 00 00 	mov    ecx,DWORD PTR [r14+0x560]
   140343a98:	49 89 86 50 05 00 00 	mov    QWORD PTR [r14+0x550],rax
   140343a9f:	e8 bc 7a 2d 00       	call   0x14061b560
   140343aa4:	b9 00 00 59 01       	mov    ecx,0x1590000
   140343aa9:	49 89 86 58 05 00 00 	mov    QWORD PTR [r14+0x558],rax
   140343ab0:	41 c7 86 7c 05 00 00 	mov    DWORD PTR [r14+0x57c],0x20
   140343ab7:	20 00 00 00 
   140343abb:	41 c7 86 78 05 00 00 	mov    DWORD PTR [r14+0x578],0x1e00
   140343ac2:	00 1e 00 00 
   140343ac6:	e8 95 7a 2d 00       	call   0x14061b560
   140343acb:	41 8b 8e 78 05 00 00 	mov    ecx,DWORD PTR [r14+0x578]
   140343ad2:	49 89 86 68 05 00 00 	mov    QWORD PTR [r14+0x568],rax
   140343ad9:	e8 82 7a 2d 00       	call   0x14061b560
   140343ade:	49 8b d6             	mov    rdx,r14
   140343ae1:	49 89 86 70 05 00 00 	mov    QWORD PTR [r14+0x570],rax
   140343ae8:	48 8b ce             	mov    rcx,rsi
   140343aeb:	e8 e0 39 fe ff       	call   0x1403274d0
   140343af0:	84 c0                	test   al,al
   140343af2:	0f 84 71 02 00 00    	je     0x140343d69
   140343af8:	b9 00 20 00 00       	mov    ecx,0x2000
   140343afd:	e8 5e 7a 2d 00       	call   0x14061b560
   140343b02:	49 89 86 08 06 00 00 	mov    QWORD PTR [r14+0x608],rax
   140343b09:	48 85 c0             	test   rax,rax
   140343b0c:	0f 84 4c 02 00 00    	je     0x140343d5e
   140343b12:	b9 00 10 00 00       	mov    ecx,0x1000
   140343b17:	e8 44 7a 2d 00       	call   0x14061b560
   140343b1c:	49 89 86 10 06 00 00 	mov    QWORD PTR [r14+0x610],rax
   140343b23:	48 85 c0             	test   rax,rax
   140343b26:	0f 84 32 02 00 00    	je     0x140343d5e
   140343b2c:	b9 00 20 00 00       	mov    ecx,0x2000
   140343b31:	e8 2a 7a 2d 00       	call   0x14061b560
   140343b36:	49 89 86 18 06 00 00 	mov    QWORD PTR [r14+0x618],rax
   140343b3d:	48 85 c0             	test   rax,rax
   140343b40:	0f 84 18 02 00 00    	je     0x140343d5e
   140343b46:	8b 86 bc 00 00 00    	mov    eax,DWORD PTR [rsi+0xbc]
   140343b4c:	03 05 92 64 64 00    	add    eax,DWORD PTR [rip+0x646492]        # 0x140989fe4
   140343b52:	03 46 24             	add    eax,DWORD PTR [rsi+0x24]
   140343b55:	69 c8 d0 01 00 00    	imul   ecx,eax,0x1d0
   140343b5b:	b8 f8 00 00 00       	mov    eax,0xf8
   140343b60:	48 f7 e1             	mul    rcx
   140343b63:	48 0f 40 c5          	cmovo  rax,rbp
   140343b67:	48 8b c8             	mov    rcx,rax
   140343b6a:	e8 f1 79 2d 00       	call   0x14061b560
   140343b6f:	49 89 86 98 05 00 00 	mov    QWORD PTR [r14+0x598],rax
   140343b76:	b8 02 00 00 00       	mov    eax,0x2
   140343b7b:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   140343b81:	03 0d 5d 64 64 00    	add    ecx,DWORD PTR [rip+0x64645d]        # 0x140989fe4
   140343b87:	03 4e 24             	add    ecx,DWORD PTR [rsi+0x24]
   140343b8a:	48 f7 e1             	mul    rcx
   140343b8d:	48 8b f8             	mov    rdi,rax
   140343b90:	48 0f 40 fd          	cmovo  rdi,rbp
   140343b94:	48 8b cf             	mov    rcx,rdi
   140343b97:	e8 c4 79 2d 00       	call   0x14061b560
   140343b9c:	48 8b d8             	mov    rbx,rax
   140343b9f:	48 85 c0             	test   rax,rax
   140343ba2:	74 0f                	je     0x140343bb3
   140343ba4:	4c 8b c7             	mov    r8,rdi
   140343ba7:	33 d2                	xor    edx,edx
   140343ba9:	48 8b c8             	mov    rcx,rax
   140343bac:	e8 39 d1 2d 00       	call   0x140620cea
   140343bb1:	eb 03                	jmp    0x140343bb6
   140343bb3:	49 8b df             	mov    rbx,r15
   140343bb6:	49 89 9e a0 05 00 00 	mov    QWORD PTR [r14+0x5a0],rbx
   140343bbd:	b8 04 00 00 00       	mov    eax,0x4
   140343bc2:	8b 4e 28             	mov    ecx,DWORD PTR [rsi+0x28]
   140343bc5:	03 4e 24             	add    ecx,DWORD PTR [rsi+0x24]
   140343bc8:	48 f7 e1             	mul    rcx
   140343bcb:	48 0f 40 c5          	cmovo  rax,rbp
   140343bcf:	48 8b c8             	mov    rcx,rax
   140343bd2:	e8 89 79 2d 00       	call   0x14061b560
   140343bd7:	49 89 86 20 06 00 00 	mov    QWORD PTR [r14+0x620],rax
   140343bde:	b8 08 00 00 00       	mov    eax,0x8
   140343be3:	8b 4e 28             	mov    ecx,DWORD PTR [rsi+0x28]
   140343be6:	03 4e 24             	add    ecx,DWORD PTR [rsi+0x24]
   140343be9:	48 f7 e1             	mul    rcx
   140343bec:	48 0f 40 c5          	cmovo  rax,rbp
   140343bf0:	48 8b c8             	mov    rcx,rax
   140343bf3:	e8 68 79 2d 00       	call   0x14061b560
   140343bf8:	49 89 86 28 06 00 00 	mov    QWORD PTR [r14+0x628],rax
   140343bff:	41 8b ff             	mov    edi,r15d
   140343c02:	8b 46 28             	mov    eax,DWORD PTR [rsi+0x28]
   140343c05:	03 46 24             	add    eax,DWORD PTR [rsi+0x24]
   140343c08:	74 54                	je     0x140343c5e
   140343c0a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140343c10:	b9 00 d0 11 00       	mov    ecx,0x11d000
   140343c15:	e8 46 79 2d 00       	call   0x14061b560
   140343c1a:	48 8b d8             	mov    rbx,rax
   140343c1d:	48 85 c0             	test   rax,rax
   140343c20:	74 12                	je     0x140343c34
   140343c22:	33 d2                	xor    edx,edx
   140343c24:	41 b8 00 d0 11 00    	mov    r8d,0x11d000
   140343c2a:	48 8b c8             	mov    rcx,rax
   140343c2d:	e8 b8 d0 2d 00       	call   0x140620cea
   140343c32:	eb 03                	jmp    0x140343c37
   140343c34:	49 8b df             	mov    rbx,r15
   140343c37:	49 8b 86 28 06 00 00 	mov    rax,QWORD PTR [r14+0x628]
   140343c3e:	8b cf                	mov    ecx,edi
   140343c40:	48 89 1c c8          	mov    QWORD PTR [rax+rcx*8],rbx
   140343c44:	49 8b 86 28 06 00 00 	mov    rax,QWORD PTR [r14+0x628]
   140343c4b:	48 83 3c c8 00       	cmp    QWORD PTR [rax+rcx*8],0x0
   140343c50:	74 0c                	je     0x140343c5e
   140343c52:	8b 46 28             	mov    eax,DWORD PTR [rsi+0x28]
   140343c55:	ff c7                	inc    edi
   140343c57:	03 46 24             	add    eax,DWORD PTR [rsi+0x24]
   140343c5a:	3b f8                	cmp    edi,eax
   140343c5c:	72 b2                	jb     0x140343c10
   140343c5e:	b9 18 00 00 00       	mov    ecx,0x18
   140343c63:	e8 e8 79 2d 00       	call   0x14061b650
   140343c68:	49 89 86 38 06 00 00 	mov    QWORD PTR [r14+0x638],rax
   140343c6f:	8b 86 bc 00 00 00    	mov    eax,DWORD PTR [rsi+0xbc]
   140343c75:	03 46 24             	add    eax,DWORD PTR [rsi+0x24]
   140343c78:	03 46 28             	add    eax,DWORD PTR [rsi+0x28]
   140343c7b:	69 c8 00 15 00 00    	imul   ecx,eax,0x1500
   140343c81:	b8 08 00 00 00       	mov    eax,0x8
   140343c86:	48 f7 e1             	mul    rcx
   140343c89:	48 0f 40 c5          	cmovo  rax,rbp
   140343c8d:	48 8b c8             	mov    rcx,rax
   140343c90:	e8 cb 78 2d 00       	call   0x14061b560
   140343c95:	49 8b 8e 38 06 00 00 	mov    rcx,QWORD PTR [r14+0x638]
   140343c9c:	48 89 01             	mov    QWORD PTR [rcx],rax
   140343c9f:	b8 08 00 00 00       	mov    eax,0x8
   140343ca4:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   140343caa:	03 4e 24             	add    ecx,DWORD PTR [rsi+0x24]
   140343cad:	03 4e 28             	add    ecx,DWORD PTR [rsi+0x28]
   140343cb0:	69 d1 00 15 00 00    	imul   edx,ecx,0x1500
   140343cb6:	48 f7 e2             	mul    rdx
   140343cb9:	48 0f 40 c5          	cmovo  rax,rbp
   140343cbd:	48 8b c8             	mov    rcx,rax
   140343cc0:	e8 9b 78 2d 00       	call   0x14061b560
   140343cc5:	49 8b 8e 38 06 00 00 	mov    rcx,QWORD PTR [r14+0x638]
   140343ccc:	48 89 41 08          	mov    QWORD PTR [rcx+0x8],rax
   140343cd0:	b8 04 00 00 00       	mov    eax,0x4
   140343cd5:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   140343cdb:	03 4e 28             	add    ecx,DWORD PTR [rsi+0x28]
   140343cde:	03 4e 24             	add    ecx,DWORD PTR [rsi+0x24]
   140343ce1:	48 f7 e1             	mul    rcx
   140343ce4:	48 0f 40 c5          	cmovo  rax,rbp
   140343ce8:	48 8b c8             	mov    rcx,rax
   140343ceb:	e8 70 78 2d 00       	call   0x14061b560
   140343cf0:	49 8b 8e 38 06 00 00 	mov    rcx,QWORD PTR [r14+0x638]
   140343cf7:	48 89 41 10          	mov    QWORD PTR [rcx+0x10],rax
   140343cfb:	8b 86 bc 00 00 00    	mov    eax,DWORD PTR [rsi+0xbc]
   140343d01:	03 46 24             	add    eax,DWORD PTR [rsi+0x24]
   140343d04:	69 d0 00 15 00 00    	imul   edx,eax,0x1500
   140343d0a:	b8 04 00 00 00       	mov    eax,0x4
   140343d0f:	48 f7 e2             	mul    rdx
   140343d12:	48 0f 40 c5          	cmovo  rax,rbp
   140343d16:	48 8b c8             	mov    rcx,rax
   140343d19:	e8 42 78 2d 00       	call   0x14061b560
   140343d1e:	49 89 86 50 06 00 00 	mov    QWORD PTR [r14+0x650],rax
   140343d25:	b8 04 00 00 00       	mov    eax,0x4
   140343d2a:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   140343d30:	03 4e 24             	add    ecx,DWORD PTR [rsi+0x24]
   140343d33:	69 d1 00 15 00 00    	imul   edx,ecx,0x1500
   140343d39:	48 f7 e2             	mul    rdx
   140343d3c:	48 0f 40 c5          	cmovo  rax,rbp
   140343d40:	48 8b c8             	mov    rcx,rax
   140343d43:	e8 18 78 2d 00       	call   0x14061b560
   140343d48:	49 8b d6             	mov    rdx,r14
   140343d4b:	49 89 86 58 06 00 00 	mov    QWORD PTR [r14+0x658],rax
   140343d52:	48 8b ce             	mov    rcx,rsi
   140343d55:	e8 56 b0 fd ff       	call   0x14031edb0
   140343d5a:	b0 01                	mov    al,0x1
   140343d5c:	eb 15                	jmp    0x140343d73
   140343d5e:	49 8b d6             	mov    rdx,r14
   140343d61:	48 8b ce             	mov    rcx,rsi
   140343d64:	e8 47 35 fe ff       	call   0x1403272b0
   140343d69:	49 8b cc             	mov    rcx,r12
   140343d6c:	e8 5f 26 fe ff       	call   0x1403263d0
   140343d71:	32 c0                	xor    al,al
   140343d73:	4c 8b 64 24 68       	mov    r12,QWORD PTR [rsp+0x68]
   140343d78:	48 8b 7c 24 60       	mov    rdi,QWORD PTR [rsp+0x60]
   140343d7d:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   140343d82:	48 83 c4 20          	add    rsp,0x20
   140343d86:	41 5f                	pop    r15
   140343d88:	41 5e                	pop    r14
   140343d8a:	41 5d                	pop    r13
   140343d8c:	5e                   	pop    rsi
   140343d8d:	5d                   	pop    rbp
   140343d8e:	c3                   	ret
   140343d8f:	cc                   	int3
   140343d90:	cc                   	int3
   140343d91:	cc                   	int3
   140343d92:	cc                   	int3
   140343d93:	cc                   	int3
   140343d94:	cc                   	int3
   140343d95:	cc                   	int3
   140343d96:	cc                   	int3
   140343d97:	cc                   	int3
   140343d98:	cc                   	int3
   140343d99:	cc                   	int3
   140343d9a:	cc                   	int3
   140343d9b:	cc                   	int3
   140343d9c:	cc                   	int3
   140343d9d:	cc                   	int3
   140343d9e:	cc                   	int3
   140343d9f:	cc                   	int3
