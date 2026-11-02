
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140347170 <.text+0x346170>:
   140347170:	40 55                	rex push rbp
   140347172:	53                   	push   rbx
   140347173:	41 54                	push   r12
   140347175:	41 56                	push   r14
   140347177:	48 8d ac 24 88 dc ff 	lea    rbp,[rsp-0x2378]
   14034717e:	ff 
   14034717f:	b8 78 24 00 00       	mov    eax,0x2478
   140347184:	e8 b7 4b 2d 00       	call   0x14061bd40
   140347189:	48 2b e0             	sub    rsp,rax
   14034718c:	0f 29 b4 24 50 24 00 	movaps XMMWORD PTR [rsp+0x2450],xmm6
   140347193:	00 
   140347194:	44 0f 29 b4 24 d0 23 	movaps XMMWORD PTR [rsp+0x23d0],xmm14
   14034719b:	00 00 
   14034719d:	44 0f 29 bc 24 c0 23 	movaps XMMWORD PTR [rsp+0x23c0],xmm15
   1403471a4:	00 00 
   1403471a6:	48 8b 05 bb af 62 00 	mov    rax,QWORD PTR [rip+0x62afbb]        # 0x140972168
   1403471ad:	48 33 c4             	xor    rax,rsp
   1403471b0:	48 89 85 b0 22 00 00 	mov    QWORD PTR [rbp+0x22b0],rax
   1403471b7:	80 b9 92 00 00 00 00 	cmp    BYTE PTR [rcx+0x92],0x0
   1403471be:	45 0f b6 e1          	movzx  r12d,r9b
   1403471c2:	48 8b 85 c0 23 00 00 	mov    rax,QWORD PTR [rbp+0x23c0]
   1403471c9:	48 8b da             	mov    rbx,rdx
   1403471cc:	48 89 45 a8          	mov    QWORD PTR [rbp-0x58],rax
   1403471d0:	4c 8b f1             	mov    r14,rcx
   1403471d3:	48 8b 85 d0 23 00 00 	mov    rax,QWORD PTR [rbp+0x23d0]
   1403471da:	0f 57 f6             	xorps  xmm6,xmm6
   1403471dd:	48 89 45 a0          	mov    QWORD PTR [rbp-0x60],rax
   1403471e1:	48 8b 85 d8 23 00 00 	mov    rax,QWORD PTR [rbp+0x23d8]
   1403471e8:	48 89 45 98          	mov    QWORD PTR [rbp-0x68],rax
   1403471ec:	44 88 4c 24 51       	mov    BYTE PTR [rsp+0x51],r9b
   1403471f1:	44 89 44 24 6c       	mov    DWORD PTR [rsp+0x6c],r8d
   1403471f6:	48 89 54 24 78       	mov    QWORD PTR [rsp+0x78],rdx
   1403471fb:	48 89 4d 88          	mov    QWORD PTR [rbp-0x78],rcx
   1403471ff:	74 14                	je     0x140347215
   140347201:	f3 44 0f 10 3d 9a 9e 	movss  xmm15,DWORD PTR [rip+0x14669e9a]        # 0x1549b10a4
   140347208:	66 14 
   14034720a:	f3 44 0f 10 35 e5 08 	movss  xmm14,DWORD PTR [rip+0x3608e5]        # 0x1406a7af8
   140347211:	36 00 
   140347213:	eb 08                	jmp    0x14034721d
   140347215:	45 0f 57 f6          	xorps  xmm14,xmm14
   140347219:	45 0f 57 ff          	xorps  xmm15,xmm15
   14034721d:	45 84 e4             	test   r12b,r12b
   140347220:	74 10                	je     0x140347232
   140347222:	44 0f 2e f6          	ucomiss xmm14,xmm6
   140347226:	7a 0a                	jp     0x140347232
   140347228:	75 08                	jne    0x140347232
   14034722a:	8b 42 0c             	mov    eax,DWORD PTR [rdx+0xc]
   14034722d:	e9 1d 08 00 00       	jmp    0x140347a4f
   140347232:	4c 8b 9a 98 05 00 00 	mov    r11,QWORD PTR [rdx+0x598]
   140347239:	48 89 b4 24 b8 24 00 	mov    QWORD PTR [rsp+0x24b8],rsi
   140347240:	00 
   140347241:	33 f6                	xor    esi,esi
   140347243:	4c 89 ac 24 68 24 00 	mov    QWORD PTR [rsp+0x2468],r13
   14034724a:	00 
   14034724b:	4c 89 bc 24 60 24 00 	mov    QWORD PTR [rsp+0x2460],r15
   140347252:	00 
   140347253:	4c 8b ba a0 05 00 00 	mov    r15,QWORD PTR [rdx+0x5a0]
   14034725a:	89 b2 b8 05 00 00    	mov    DWORD PTR [rdx+0x5b8],esi
   140347260:	40 38 35 19 24 5f 00 	cmp    BYTE PTR [rip+0x5f2419],sil        # 0x140939680
   140347267:	0f 29 bc 24 40 24 00 	movaps XMMWORD PTR [rsp+0x2440],xmm7
   14034726e:	00 
   14034726f:	4c 89 5d 80          	mov    QWORD PTR [rbp-0x80],r11
   140347273:	74 1c                	je     0x140347291
   140347275:	40 38 b1 92 00 00 00 	cmp    BYTE PTR [rcx+0x92],sil
   14034727c:	75 06                	jne    0x140347284
   14034727e:	66 39 71 14          	cmp    WORD PTR [rcx+0x14],si
   140347282:	75 0d                	jne    0x140347291
   140347284:	8b 89 bc 00 00 00    	mov    ecx,DWORD PTR [rcx+0xbc]
   14034728a:	c6 44 24 50 01       	mov    BYTE PTR [rsp+0x50],0x1
   14034728f:	eb 07                	jmp    0x140347298
   140347291:	40 88 74 24 50       	mov    BYTE PTR [rsp+0x50],sil
   140347296:	8b ce                	mov    ecx,esi
   140347298:	8b 52 10             	mov    edx,DWORD PTR [rdx+0x10]
   14034729b:	f3 41 0f 10 46 10    	movss  xmm0,DWORD PTR [r14+0x10]
   1403472a1:	03 d1                	add    edx,ecx
   1403472a3:	0f 2e c6             	ucomiss xmm0,xmm6
   1403472a6:	44 8b 53 0c          	mov    r10d,DWORD PTR [rbx+0xc]
   1403472aa:	44 89 54 24 70       	mov    DWORD PTR [rsp+0x70],r10d
   1403472af:	44 8d 6a ff          	lea    r13d,[rdx-0x1]
   1403472b3:	44 89 6c 24 64       	mov    DWORD PTR [rsp+0x64],r13d
   1403472b8:	f3 0f 10 3d 1c 8d 50 	movss  xmm7,DWORD PTR [rip+0x508d1c]        # 0x14084ffdc
   1403472bf:	00 
   1403472c0:	7a 02                	jp     0x1403472c4
   1403472c2:	74 3d                	je     0x140347301
   1403472c4:	f3 0f 59 05 e0 2e 64 	mulss  xmm0,DWORD PTR [rip+0x642ee0]        # 0x14098a1ac
   1403472cb:	00 
   1403472cc:	b9 01 00 00 00       	mov    ecx,0x1
   1403472d1:	f3 0f 58 c7          	addss  xmm0,xmm7
   1403472d5:	f3 0f 2c c0          	cvttss2si eax,xmm0
   1403472d9:	3b c1                	cmp    eax,ecx
   1403472db:	0f 4f c8             	cmovg  ecx,eax
   1403472de:	8b 43 14             	mov    eax,DWORD PTR [rbx+0x14]
   1403472e1:	41 2b c2             	sub    eax,r10d
   1403472e4:	03 c2                	add    eax,edx
   1403472e6:	3b c1                	cmp    eax,ecx
   1403472e8:	7e 0a                	jle    0x1403472f4
   1403472ea:	2b c8                	sub    ecx,eax
   1403472ec:	44 03 e9             	add    r13d,ecx
   1403472ef:	44 89 6c 24 64       	mov    DWORD PTR [rsp+0x64],r13d
   1403472f4:	45 3b e8             	cmp    r13d,r8d
   1403472f7:	7d 08                	jge    0x140347301
   1403472f9:	41 8b c2             	mov    eax,r10d
   1403472fc:	e9 2e 07 00 00       	jmp    0x140347a2f
   140347301:	f3 0f 10 3d 0f ff 34 	movss  xmm7,DWORD PTR [rip+0x34ff0f]        # 0x140697218
   140347308:	00 
   140347309:	45 8b c8             	mov    r9d,r8d
   14034730c:	48 89 bc 24 70 24 00 	mov    QWORD PTR [rsp+0x2470],rdi
   140347313:	00 
   140347314:	44 0f 29 9c 24 00 24 	movaps XMMWORD PTR [rsp+0x2400],xmm11
   14034731b:	00 00 
   14034731d:	f3 44 0f 10 1d 8a 6e 	movss  xmm11,DWORD PTR [rip+0x346e8a]        # 0x14068e1b0
   140347324:	34 00 
   140347326:	44 89 44 24 60       	mov    DWORD PTR [rsp+0x60],r8d
   14034732b:	45 3b c5             	cmp    r8d,r13d
   14034732e:	0f 8f 5c 05 00 00    	jg     0x140347890
   140347334:	44 0f 29 84 24 30 24 	movaps XMMWORD PTR [rsp+0x2430],xmm8
   14034733b:	00 00 
   14034733d:	44 0f 29 8c 24 20 24 	movaps XMMWORD PTR [rsp+0x2420],xmm9
   140347344:	00 00 
   140347346:	f3 44 0f 10 0d 2d 8f 	movss  xmm9,DWORD PTR [rip+0x508f2d]        # 0x14085027c
   14034734d:	50 00 
   14034734f:	44 0f 29 94 24 10 24 	movaps XMMWORD PTR [rsp+0x2410],xmm10
   140347356:	00 00 
   140347358:	44 0f 29 a4 24 f0 23 	movaps XMMWORD PTR [rsp+0x23f0],xmm12
   14034735f:	00 00 
   140347361:	f3 44 0f 10 25 56 6e 	movss  xmm12,DWORD PTR [rip+0x346e56]        # 0x14068e1c0
   140347368:	34 00 
   14034736a:	44 0f 29 ac 24 e0 23 	movaps XMMWORD PTR [rsp+0x23e0],xmm13
   140347371:	00 00 
   140347373:	f3 44 0f 10 2d 8c 05 	movss  xmm13,DWORD PTR [rip+0x36058c]        # 0x1406a7908
   14034737a:	36 00 
   14034737c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140347380:	8b 15 5e 2c 64 00    	mov    edx,DWORD PTR [rip+0x642c5e]        # 0x140989fe4
   140347386:	0f 57 c0             	xorps  xmm0,xmm0
   140347389:	41 8b c9             	mov    ecx,r9d
   14034738c:	2b 4b 0c             	sub    ecx,DWORD PTR [rbx+0xc]
   14034738f:	03 d1                	add    edx,ecx
   140347391:	69 ca d0 01 00 00    	imul   ecx,edx,0x1d0
   140347397:	4c 63 e2             	movsxd r12,edx
   14034739a:	48 69 c1 f8 00 00 00 	imul   rax,rcx,0xf8
   1403473a1:	66 43 89 34 67       	mov    WORD PTR [r15+r12*2],si
   1403473a6:	44 8b 15 fb 2d 64 00 	mov    r10d,DWORD PTR [rip+0x642dfb]        # 0x14098a1a8
   1403473ad:	49 03 c3             	add    rax,r11
   1403473b0:	48 89 45 90          	mov    QWORD PTR [rbp-0x70],rax
   1403473b4:	41 8b ca             	mov    ecx,r10d
   1403473b7:	41 0f af c9          	imul   ecx,r9d
   1403473bb:	f2 49 0f 2a c2       	cvtsi2sd xmm0,r10
   1403473c0:	f2 0f 58 c0          	addsd  xmm0,xmm0
   1403473c4:	f2 0f 59 05 84 0f 36 	mulsd  xmm0,QWORD PTR [rip+0x360f84]        # 0x1406a8350
   1403473cb:	00 
   1403473cc:	f2 44 0f 2c c0       	cvttsd2si r8d,xmm0
   1403473d1:	41 8b c0             	mov    eax,r8d
   1403473d4:	99                   	cdq
   1403473d5:	2b c2                	sub    eax,edx
   1403473d7:	d1 f8                	sar    eax,1
   1403473d9:	2b c8                	sub    ecx,eax
   1403473db:	41 8b c2             	mov    eax,r10d
   1403473de:	45 85 d2             	test   r10d,r10d
   1403473e1:	79 04                	jns    0x1403473e7
   1403473e3:	41 8d 42 01          	lea    eax,[r10+0x1]
   1403473e7:	d1 f8                	sar    eax,1
   1403473e9:	8d 14 01             	lea    edx,[rcx+rax*1]
   1403473ec:	41 8b 4e 28          	mov    ecx,DWORD PTR [r14+0x28]
   1403473f0:	41 8b 46 24          	mov    eax,DWORD PTR [r14+0x24]
   1403473f4:	85 d2                	test   edx,edx
   1403473f6:	0f 4e d6             	cmovle edx,esi
   1403473f9:	44 03 c2             	add    r8d,edx
   1403473fc:	44 8d 0c 48          	lea    r9d,[rax+rcx*2]
   140347400:	48 8b cb             	mov    rcx,rbx
   140347403:	45 0f af ca          	imul   r9d,r10d
   140347407:	45 3b c1             	cmp    r8d,r9d
   14034740a:	45 0f 4d c1          	cmovge r8d,r9d
   14034740e:	e8 0d 72 fd ff       	call   0x14031e620
   140347413:	80 3d 06 2b 64 00 00 	cmp    BYTE PTR [rip+0x642b06],0x0        # 0x140989f20
   14034741a:	8b d6                	mov    edx,esi
   14034741c:	89 54 24 68          	mov    DWORD PTR [rsp+0x68],edx
   140347420:	0f b7 fe             	movzx  edi,si
   140347423:	0f 84 10 04 00 00    	je     0x140347839
   140347429:	4c 8d 05 f0 2a 64 00 	lea    r8,[rip+0x642af0]        # 0x140989f20
   140347430:	4c 8b f6             	mov    r14,rsi
   140347433:	4d 8b e8             	mov    r13,r8
   140347436:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14034743d:	00 00 00 
   140347440:	8b 83 b8 05 00 00    	mov    eax,DWORD PTR [rbx+0x5b8]
   140347446:	be 01 00 00 00       	mov    esi,0x1
   14034744b:	f3 4b 0f 2c 4c 06 0c 	cvttss2si rcx,DWORD PTR [r14+r8*1+0xc]
   140347452:	3b c1                	cmp    eax,ecx
   140347454:	0f 43 c8             	cmovae ecx,eax
   140347457:	89 8b b8 05 00 00    	mov    DWORD PTR [rbx+0x5b8],ecx
   14034745d:	f3 4b 0f 2c 44 06 0c 	cvttss2si rax,DWORD PTR [r14+r8*1+0xc]
   140347464:	3b c6                	cmp    eax,esi
   140347466:	0f 82 a6 03 00 00    	jb     0x140347812
   14034746c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140347470:	41 0f b6 4d 00       	movzx  ecx,BYTE PTR [r13+0x0]
   140347475:	8b d6                	mov    edx,esi
   140347477:	e8 44 24 fd ff       	call   0x1403198c0
   14034747c:	b8 d0 01 00 00       	mov    eax,0x1d0
   140347481:	44 0f 28 d0          	movaps xmm10,xmm0
   140347485:	66 3b f8             	cmp    di,ax
   140347488:	0f 83 74 03 00 00    	jae    0x140347802
   14034748e:	0f b7 c7             	movzx  eax,di
   140347491:	33 d2                	xor    edx,edx
   140347493:	48 69 d8 f8 00 00 00 	imul   rbx,rax,0xf8
   14034749a:	41 b8 f8 00 00 00    	mov    r8d,0xf8
   1403474a0:	48 03 5d 90          	add    rbx,QWORD PTR [rbp-0x70]
   1403474a4:	48 8b cb             	mov    rcx,rbx
   1403474a7:	e8 3e 98 2d 00       	call   0x140620cea
   1403474ac:	80 7c 24 51 00       	cmp    BYTE PTR [rsp+0x51],0x0
   1403474b1:	f3 44 0f 11 13       	movss  DWORD PTR [rbx],xmm10
   1403474b6:	c6 83 d0 00 00 00 7e 	mov    BYTE PTR [rbx+0xd0],0x7e
   1403474bd:	74 14                	je     0x1403474d3
   1403474bf:	45 0f 2f d7          	comiss xmm10,xmm15
   1403474c3:	0f 86 09 03 00 00    	jbe    0x1403477d2
   1403474c9:	45 0f 2f f2          	comiss xmm14,xmm10
   1403474cd:	0f 86 ff 02 00 00    	jbe    0x1403477d2
   1403474d3:	0f b6 44 24 50       	movzx  eax,BYTE PTR [rsp+0x50]
   1403474d8:	45 33 c9             	xor    r9d,r9d
   1403474db:	44 8b 44 24 60       	mov    r8d,DWORD PTR [rsp+0x60]
   1403474e0:	34 01                	xor    al,0x1
   1403474e2:	48 8b 54 24 78       	mov    rdx,QWORD PTR [rsp+0x78]
   1403474e7:	48 8b 4d 88          	mov    rcx,QWORD PTR [rbp-0x78]
   1403474eb:	88 44 24 38          	mov    BYTE PTR [rsp+0x38],al
   1403474ef:	48 8d 45 b0          	lea    rax,[rbp-0x50]
   1403474f3:	c6 44 24 30 01       	mov    BYTE PTR [rsp+0x30],0x1
   1403474f8:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   1403474fd:	f3 44 0f 11 54 24 20 	movss  DWORD PTR [rsp+0x20],xmm10
   140347504:	e8 c7 f9 ff ff       	call   0x140346ed0
   140347509:	83 3d 98 24 5f 00 03 	cmp    DWORD PTR [rip+0x5f2498],0x3        # 0x1409399a8
   140347510:	0f 82 9d 01 00 00    	jb     0x1403476b3
   140347516:	f3 0f 10 8d 20 04 00 	movss  xmm1,DWORD PTR [rbp+0x420]
   14034751d:	00 
   14034751e:	0f 2f ce             	comiss xmm1,xmm6
   140347521:	f3 0f 10 95 f0 01 00 	movss  xmm2,DWORD PTR [rbp+0x1f0]
   140347528:	00 
   140347529:	77 0f                	ja     0x14034753a
   14034752b:	0f 2f d6             	comiss xmm2,xmm6
   14034752e:	77 0a                	ja     0x14034753a
   140347530:	0f 28 ce             	movaps xmm1,xmm6
   140347533:	f3 41 0f 58 cd       	addss  xmm1,xmm13
   140347538:	eb 25                	jmp    0x14034755f
   14034753a:	0f 28 c1             	movaps xmm0,xmm1
   14034753d:	f3 0f 58 c2          	addss  xmm0,xmm2
   140347541:	f3 0f 5e c8          	divss  xmm1,xmm0
   140347545:	f3 0f 59 cf          	mulss  xmm1,xmm7
   140347549:	f3 41 0f 5c cb       	subss  xmm1,xmm11
   14034754e:	0f 2f ce             	comiss xmm1,xmm6
   140347551:	72 07                	jb     0x14034755a
   140347553:	f3 41 0f 58 cd       	addss  xmm1,xmm13
   140347558:	eb 05                	jmp    0x14034755f
   14034755a:	f3 41 0f 5c cd       	subss  xmm1,xmm13
   14034755f:	44 0f 2f d9          	comiss xmm11,xmm1
   140347563:	76 0c                	jbe    0x140347571
   140347565:	41 0f 2f cc          	comiss xmm1,xmm12
   140347569:	77 0a                	ja     0x140347575
   14034756b:	41 0f 28 cc          	movaps xmm1,xmm12
   14034756f:	eb 04                	jmp    0x140347575
   140347571:	41 0f 28 cb          	movaps xmm1,xmm11
   140347575:	f3 0f 2c c1          	cvttss2si eax,xmm1
   140347579:	48 8d 4c 24 58       	lea    rcx,[rsp+0x58]
   14034757e:	66 89 83 ce 00 00 00 	mov    WORD PTR [rbx+0xce],ax
   140347585:	f3 0f 10 85 20 04 00 	movss  xmm0,DWORD PTR [rbp+0x420]
   14034758c:	00 
   14034758d:	f3 0f 58 85 f0 01 00 	addss  xmm0,DWORD PTR [rbp+0x1f0]
   140347594:	00 
   140347595:	f3 0f 10 4b 08       	movss  xmm1,DWORD PTR [rbx+0x8]
   14034759a:	0f 5a c9             	cvtps2pd xmm1,xmm1
   14034759d:	0f 5a d0             	cvtps2pd xmm2,xmm0
   1403475a0:	f2 0f 59 15 80 8b 50 	mulsd  xmm2,QWORD PTR [rip+0x508b80]        # 0x140850128
   1403475a7:	00 
   1403475a8:	f2 0f 58 d1          	addsd  xmm2,xmm1
   1403475ac:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   1403475b0:	f3 0f 11 43 08       	movss  DWORD PTR [rbx+0x8],xmm0
   1403475b5:	f3 0f 10 bd e4 01 00 	movss  xmm7,DWORD PTR [rbp+0x1e4]
   1403475bc:	00 
   1403475bd:	f3 44 0f 10 85 14 04 	movss  xmm8,DWORD PTR [rbp+0x414]
   1403475c4:	00 00 
   1403475c6:	f3 0f 11 7c 24 58    	movss  DWORD PTR [rsp+0x58],xmm7
   1403475cc:	ff 15 b6 25 34 00    	call   QWORD PTR [rip+0x3425b6]        # 0x140689b88
   1403475d2:	66 85 c0             	test   ax,ax
   1403475d5:	7e 03                	jle    0x1403475da
   1403475d7:	0f 28 fe             	movaps xmm7,xmm6
   1403475da:	48 8d 4c 24 58       	lea    rcx,[rsp+0x58]
   1403475df:	f3 44 0f 11 44 24 58 	movss  DWORD PTR [rsp+0x58],xmm8
   1403475e6:	ff 15 9c 25 34 00    	call   QWORD PTR [rip+0x34259c]        # 0x140689b88
   1403475ec:	66 85 c0             	test   ax,ax
   1403475ef:	7e 04                	jle    0x1403475f5
   1403475f1:	44 0f 28 c6          	movaps xmm8,xmm6
   1403475f5:	41 0f 28 c9          	movaps xmm1,xmm9
   1403475f9:	0f 28 c7             	movaps xmm0,xmm7
   1403475fc:	e8 6d 97 2d 00       	call   0x140620d6e
   140347601:	0f 28 f8             	movaps xmm7,xmm0
   140347604:	0f 2f f7             	comiss xmm6,xmm7
   140347607:	76 05                	jbe    0x14034760e
   140347609:	f3 41 0f 58 f9       	addss  xmm7,xmm9
   14034760e:	41 0f 28 c9          	movaps xmm1,xmm9
   140347612:	41 0f 28 c0          	movaps xmm0,xmm8
   140347616:	e8 53 97 2d 00       	call   0x140620d6e
   14034761b:	0f 2f f0             	comiss xmm6,xmm0
   14034761e:	76 05                	jbe    0x140347625
   140347620:	f3 41 0f 58 c1       	addss  xmm0,xmm9
   140347625:	f3 0f 59 05 a3 8c 50 	mulss  xmm0,DWORD PTR [rip+0x508ca3]        # 0x1408502d0
   14034762c:	00 
   14034762d:	41 b9 90 0a 00 00    	mov    r9d,0xa90
   140347633:	f3 0f 59 3d 95 8c 50 	mulss  xmm7,DWORD PTR [rip+0x508c95]        # 0x1408502d0
   14034763a:	00 
   14034763b:	f3 0f 58 05 99 89 50 	addss  xmm0,DWORD PTR [rip+0x508999]        # 0x14084ffdc
   140347642:	00 
   140347643:	f3 0f 58 3d 91 89 50 	addss  xmm7,DWORD PTR [rip+0x508991]        # 0x14084ffdc
   14034764a:	00 
   14034764b:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0
   140347650:	f3 48 0f 2c d7       	cvttss2si rdx,xmm7
   140347655:	81 f9 70 f5 00 00    	cmp    ecx,0xf570
   14034765b:	41 8d 04 09          	lea    eax,[r9+rcx*1]
   14034765f:	66 0f 42 c1          	cmovb  ax,cx
   140347663:	0f b7 c8             	movzx  ecx,ax
   140347666:	c1 e1 10             	shl    ecx,0x10
   140347669:	81 fa 70 f5 00 00    	cmp    edx,0xf570
   14034766f:	41 8d 04 11          	lea    eax,[r9+rdx*1]
   140347673:	66 0f 42 c2          	cmovb  ax,dx
   140347677:	0f b7 c0             	movzx  eax,ax
   14034767a:	0b c8                	or     ecx,eax
   14034767c:	89 4b 04             	mov    DWORD PTR [rbx+0x4],ecx
   14034767f:	f3 0f 10 85 f0 01 00 	movss  xmm0,DWORD PTR [rbp+0x1f0]
   140347686:	00 
   140347687:	f3 0f 11 43 14       	movss  DWORD PTR [rbx+0x14],xmm0
   14034768c:	f3 0f 10 8d 20 04 00 	movss  xmm1,DWORD PTR [rbp+0x420]
   140347693:	00 
   140347694:	f3 0f 11 4b 18       	movss  DWORD PTR [rbx+0x18],xmm1
   140347699:	f3 0f 10 85 e4 01 00 	movss  xmm0,DWORD PTR [rbp+0x1e4]
   1403476a0:	00 
   1403476a1:	f3 0f 11 43 0c       	movss  DWORD PTR [rbx+0xc],xmm0
   1403476a6:	f3 0f 10 8d 14 04 00 	movss  xmm1,DWORD PTR [rbp+0x414]
   1403476ad:	00 
   1403476ae:	e9 05 01 00 00       	jmp    0x1403477b8
   1403476b3:	33 c0                	xor    eax,eax
   1403476b5:	48 8d 4c 24 58       	lea    rcx,[rsp+0x58]
   1403476ba:	66 89 83 ce 00 00 00 	mov    WORD PTR [rbx+0xce],ax
   1403476c1:	f3 0f 10 45 c0       	movss  xmm0,DWORD PTR [rbp-0x40]
   1403476c6:	f3 0f 58 43 08       	addss  xmm0,DWORD PTR [rbx+0x8]
   1403476cb:	f3 0f 11 43 08       	movss  DWORD PTR [rbx+0x8],xmm0
   1403476d0:	f3 0f 10 7d b4       	movss  xmm7,DWORD PTR [rbp-0x4c]
   1403476d5:	f3 0f 11 7c 24 58    	movss  DWORD PTR [rsp+0x58],xmm7
   1403476db:	44 0f 28 c7          	movaps xmm8,xmm7
   1403476df:	ff 15 a3 24 34 00    	call   QWORD PTR [rip+0x3424a3]        # 0x140689b88
   1403476e5:	66 85 c0             	test   ax,ax
   1403476e8:	7e 04                	jle    0x1403476ee
   1403476ea:	44 0f 28 c6          	movaps xmm8,xmm6
   1403476ee:	48 8d 4c 24 58       	lea    rcx,[rsp+0x58]
   1403476f3:	f3 0f 11 7c 24 58    	movss  DWORD PTR [rsp+0x58],xmm7
   1403476f9:	ff 15 89 24 34 00    	call   QWORD PTR [rip+0x342489]        # 0x140689b88
   1403476ff:	66 85 c0             	test   ax,ax
   140347702:	7e 03                	jle    0x140347707
   140347704:	0f 28 fe             	movaps xmm7,xmm6
   140347707:	41 0f 28 c9          	movaps xmm1,xmm9
   14034770b:	41 0f 28 c0          	movaps xmm0,xmm8
   14034770f:	e8 5a 96 2d 00       	call   0x140620d6e
   140347714:	44 0f 28 c0          	movaps xmm8,xmm0
   140347718:	41 0f 2f f0          	comiss xmm6,xmm8
   14034771c:	76 05                	jbe    0x140347723
   14034771e:	f3 45 0f 58 c1       	addss  xmm8,xmm9
   140347723:	41 0f 28 c9          	movaps xmm1,xmm9
   140347727:	0f 28 c7             	movaps xmm0,xmm7
   14034772a:	e8 3f 96 2d 00       	call   0x140620d6e
   14034772f:	0f 2f f0             	comiss xmm6,xmm0
   140347732:	76 05                	jbe    0x140347739
   140347734:	f3 41 0f 58 c1       	addss  xmm0,xmm9
   140347739:	f3 0f 59 05 8f 8b 50 	mulss  xmm0,DWORD PTR [rip+0x508b8f]        # 0x1408502d0
   140347740:	00 
   140347741:	41 b8 90 0a 00 00    	mov    r8d,0xa90
   140347747:	f3 44 0f 59 05 80 8b 	mulss  xmm8,DWORD PTR [rip+0x508b80]        # 0x1408502d0
   14034774e:	50 00 
   140347750:	f3 0f 58 05 84 88 50 	addss  xmm0,DWORD PTR [rip+0x508884]        # 0x14084ffdc
   140347757:	00 
   140347758:	f3 44 0f 58 05 7b 88 	addss  xmm8,DWORD PTR [rip+0x50887b]        # 0x14084ffdc
   14034775f:	50 00 
   140347761:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0
   140347766:	f3 49 0f 2c d0       	cvttss2si rdx,xmm8
   14034776b:	81 f9 70 f5 00 00    	cmp    ecx,0xf570
   140347771:	41 8d 04 08          	lea    eax,[r8+rcx*1]
   140347775:	66 0f 42 c1          	cmovb  ax,cx
   140347779:	0f b7 c8             	movzx  ecx,ax
   14034777c:	c1 e1 10             	shl    ecx,0x10
   14034777f:	81 fa 70 f5 00 00    	cmp    edx,0xf570
   140347785:	41 8d 04 10          	lea    eax,[r8+rdx*1]
   140347789:	66 0f 42 c2          	cmovb  ax,dx
   14034778d:	0f b7 c0             	movzx  eax,ax
   140347790:	0b c8                	or     ecx,eax
   140347792:	89 4b 04             	mov    DWORD PTR [rbx+0x4],ecx
   140347795:	f3 0f 10 45 c0       	movss  xmm0,DWORD PTR [rbp-0x40]
   14034779a:	f3 0f 11 43 14       	movss  DWORD PTR [rbx+0x14],xmm0
   14034779f:	f3 0f 10 4d c0       	movss  xmm1,DWORD PTR [rbp-0x40]
   1403477a4:	f3 0f 11 4b 18       	movss  DWORD PTR [rbx+0x18],xmm1
   1403477a9:	f3 0f 10 45 b4       	movss  xmm0,DWORD PTR [rbp-0x4c]
   1403477ae:	f3 0f 11 43 0c       	movss  DWORD PTR [rbx+0xc],xmm0
   1403477b3:	f3 0f 10 4d b4       	movss  xmm1,DWORD PTR [rbp-0x4c]
   1403477b8:	f3 0f 10 3d 58 fa 34 	movss  xmm7,DWORD PTR [rip+0x34fa58]        # 0x140697218
   1403477bf:	00 
   1403477c0:	f3 0f 11 4b 10       	movss  DWORD PTR [rbx+0x10],xmm1
   1403477c5:	f3 44 0f 11 53 1c    	movss  DWORD PTR [rbx+0x1c],xmm10
   1403477cb:	c6 83 cc 00 00 00 01 	mov    BYTE PTR [rbx+0xcc],0x1
   1403477d2:	66 ff c7             	inc    di
   1403477d5:	4c 8d 05 44 27 64 00 	lea    r8,[rip+0x642744]        # 0x140989f20
   1403477dc:	66 43 39 3c 67       	cmp    WORD PTR [r15+r12*2],di
   1403477e1:	0f b7 c7             	movzx  eax,di
   1403477e4:	66 43 0f 43 04 67    	cmovae ax,WORD PTR [r15+r12*2]
   1403477ea:	ff c6                	inc    esi
   1403477ec:	66 43 89 04 67       	mov    WORD PTR [r15+r12*2],ax
   1403477f1:	f3 4b 0f 2c 44 06 0c 	cvttss2si rax,DWORD PTR [r14+r8*1+0xc]
   1403477f8:	3b f0                	cmp    esi,eax
   1403477fa:	0f 86 70 fc ff ff    	jbe    0x140347470
   140347800:	eb 07                	jmp    0x140347809
   140347802:	4c 8d 05 17 27 64 00 	lea    r8,[rip+0x642717]        # 0x140989f20
   140347809:	48 8b 5c 24 78       	mov    rbx,QWORD PTR [rsp+0x78]
   14034780e:	8b 54 24 68          	mov    edx,DWORD PTR [rsp+0x68]
   140347812:	ff c2                	inc    edx
   140347814:	44 8b f2             	mov    r14d,edx
   140347817:	49 c1 e6 04          	shl    r14,0x4
   14034781b:	43 80 3c 06 00       	cmp    BYTE PTR [r14+r8*1],0x0
   140347820:	89 54 24 68          	mov    DWORD PTR [rsp+0x68],edx
   140347824:	4f 8d 2c 06          	lea    r13,[r14+r8*1]
   140347828:	0f 85 12 fc ff ff    	jne    0x140347440
   14034782e:	4c 8b 75 88          	mov    r14,QWORD PTR [rbp-0x78]
   140347832:	33 f6                	xor    esi,esi
   140347834:	44 8b 6c 24 64       	mov    r13d,DWORD PTR [rsp+0x64]
   140347839:	44 8b 4c 24 60       	mov    r9d,DWORD PTR [rsp+0x60]
   14034783e:	4c 8b 5d 80          	mov    r11,QWORD PTR [rbp-0x80]
   140347842:	41 ff c1             	inc    r9d
   140347845:	44 89 4c 24 60       	mov    DWORD PTR [rsp+0x60],r9d
   14034784a:	45 3b cd             	cmp    r9d,r13d
   14034784d:	0f 8e 2d fb ff ff    	jle    0x140347380
   140347853:	44 0f b6 64 24 51    	movzx  r12d,BYTE PTR [rsp+0x51]
   140347859:	44 8b 44 24 6c       	mov    r8d,DWORD PTR [rsp+0x6c]
   14034785e:	44 8b 54 24 70       	mov    r10d,DWORD PTR [rsp+0x70]
   140347863:	44 0f 28 ac 24 e0 23 	movaps xmm13,XMMWORD PTR [rsp+0x23e0]
   14034786a:	00 00 
   14034786c:	44 0f 28 a4 24 f0 23 	movaps xmm12,XMMWORD PTR [rsp+0x23f0]
   140347873:	00 00 
   140347875:	44 0f 28 94 24 10 24 	movaps xmm10,XMMWORD PTR [rsp+0x2410]
   14034787c:	00 00 
   14034787e:	44 0f 28 8c 24 20 24 	movaps xmm9,XMMWORD PTR [rsp+0x2420]
   140347885:	00 00 
   140347887:	44 0f 28 84 24 30 24 	movaps xmm8,XMMWORD PTR [rsp+0x2430]
   14034788e:	00 00 
   140347890:	80 7c 24 50 00       	cmp    BYTE PTR [rsp+0x50],0x0
   140347895:	0f 84 7f 01 00 00    	je     0x140347a1a
   14034789b:	41 8b f2             	mov    esi,r10d
   14034789e:	45 3b d0             	cmp    r10d,r8d
   1403478a1:	0f 8d 30 01 00 00    	jge    0x1403479d7
   1403478a7:	f3 0f 10 1d f1 88 50 	movss  xmm3,DWORD PTR [rip+0x5088f1]        # 0x1408501a0
   1403478ae:	00 
   1403478af:	45 33 ed             	xor    r13d,r13d
   1403478b2:	44 8b 74 24 6c       	mov    r14d,DWORD PTR [rsp+0x6c]
   1403478b7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   1403478be:	00 00 
   1403478c0:	8b 15 1e 27 64 00    	mov    edx,DWORD PTR [rip+0x64271e]        # 0x140989fe4
   1403478c6:	8b ce                	mov    ecx,esi
   1403478c8:	2b 4b 0c             	sub    ecx,DWORD PTR [rbx+0xc]
   1403478cb:	41 0f b7 dd          	movzx  ebx,r13w
   1403478cf:	03 d1                	add    edx,ecx
   1403478d1:	69 ca d0 01 00 00    	imul   ecx,edx,0x1d0
   1403478d7:	48 63 fa             	movsxd rdi,edx
   1403478da:	4c 69 c1 f8 00 00 00 	imul   r8,rcx,0xf8
   1403478e1:	4d 03 c3             	add    r8,r11
   1403478e4:	66 45 3b 2c 7f       	cmp    r13w,WORD PTR [r15+rdi*2]
   1403478e9:	0f 83 ca 00 00 00    	jae    0x1403479b9
   1403478ef:	90                   	nop
   1403478f0:	44 0f b7 db          	movzx  r11d,bx
   1403478f4:	4d 69 cb f8 00 00 00 	imul   r9,r11,0xf8
   1403478fb:	83 3d a6 20 5f 00 03 	cmp    DWORD PTR [rip+0x5f20a6],0x3        # 0x1409399a8
   140347902:	f3 43 0f 10 54 01 08 	movss  xmm2,DWORD PTR [r9+r8*1+0x8]
   140347909:	72 35                	jb     0x140347940
   14034790b:	43 0f bf 84 01 ce 00 	movsx  eax,WORD PTR [r9+r8*1+0xce]
   140347912:	00 00 
   140347914:	0f 28 c3             	movaps xmm0,xmm3
   140347917:	66 0f 6e c8          	movd   xmm1,eax
   14034791b:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14034791e:	f3 41 0f 58 cb       	addss  xmm1,xmm11
   140347923:	f3 0f 58 c9          	addss  xmm1,xmm1
   140347927:	f3 0f 5e cf          	divss  xmm1,xmm7
   14034792b:	f3 0f 5c c1          	subss  xmm0,xmm1
   14034792f:	f3 0f 59 ca          	mulss  xmm1,xmm2
   140347933:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140347937:	f3 43 0f 11 44 01 14 	movss  DWORD PTR [r9+r8*1+0x14],xmm0
   14034793e:	eb 0a                	jmp    0x14034794a
   140347940:	f3 43 0f 11 54 01 14 	movss  DWORD PTR [r9+r8*1+0x14],xmm2
   140347947:	0f 28 ca             	movaps xmm1,xmm2
   14034794a:	f3 43 0f 11 4c 08 18 	movss  DWORD PTR [r8+r9*1+0x18],xmm1
   140347951:	41 ba 01 00 00 00    	mov    r10d,0x1
   140347957:	41 83 fa 07          	cmp    r10d,0x7
   14034795b:	77 30                	ja     0x14034798d
   14034795d:	41 8b d2             	mov    edx,r10d
   140347960:	48 8d 04 52          	lea    rax,[rdx+rdx*2]
   140347964:	49 8d 0c c1          	lea    rcx,[r9+rax*8]
   140347968:	4a 8d 04 0a          	lea    rax,[rdx+r9*1]
   14034796c:	4e 89 6c 01 14       	mov    QWORD PTR [rcx+r8*1+0x14],r13
   140347971:	46 88 ac 00 d0 00 00 	mov    BYTE PTR [rax+r8*1+0xd0],r13b
   140347978:	00 
   140347979:	49 6b c3 3e          	imul   rax,r11,0x3e
   14034797d:	48 03 c2             	add    rax,rdx
   140347980:	41 ff c2             	inc    r10d
   140347983:	45 89 ac 80 d8 00 00 	mov    DWORD PTR [r8+rax*4+0xd8],r13d
   14034798a:	00 
   14034798b:	eb ca                	jmp    0x140347957
   14034798d:	43 c6 84 08 d0 00 00 	mov    BYTE PTR [r8+r9*1+0xd0],0x7e
   140347994:	00 7e 
   140347996:	66 ff c3             	inc    bx
   140347999:	47 89 ac 08 d8 00 00 	mov    DWORD PTR [r8+r9*1+0xd8],r13d
   1403479a0:	00 
   1403479a1:	43 c6 84 08 cc 00 00 	mov    BYTE PTR [r8+r9*1+0xcc],0x1
   1403479a8:	00 01 
   1403479aa:	66 41 3b 1c 7f       	cmp    bx,WORD PTR [r15+rdi*2]
   1403479af:	0f 82 3b ff ff ff    	jb     0x1403478f0
   1403479b5:	4c 8b 5d 80          	mov    r11,QWORD PTR [rbp-0x80]
   1403479b9:	48 8b 5c 24 78       	mov    rbx,QWORD PTR [rsp+0x78]
   1403479be:	ff c6                	inc    esi
   1403479c0:	41 3b f6             	cmp    esi,r14d
   1403479c3:	0f 8c f7 fe ff ff    	jl     0x1403478c0
   1403479c9:	4c 8b 75 88          	mov    r14,QWORD PTR [rbp-0x78]
   1403479cd:	44 8b 6c 24 64       	mov    r13d,DWORD PTR [rsp+0x64]
   1403479d2:	44 8b 54 24 70       	mov    r10d,DWORD PTR [rsp+0x70]
   1403479d7:	48 8b 45 98          	mov    rax,QWORD PTR [rbp-0x68]
   1403479db:	41 80 f4 01          	xor    r12b,0x1
   1403479df:	48 8b 54 24 78       	mov    rdx,QWORD PTR [rsp+0x78]
   1403479e4:	45 8b cd             	mov    r9d,r13d
   1403479e7:	44 88 64 24 40       	mov    BYTE PTR [rsp+0x40],r12b
   1403479ec:	45 8b c2             	mov    r8d,r10d
   1403479ef:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   1403479f4:	49 8b ce             	mov    rcx,r14
   1403479f7:	48 8b 45 a0          	mov    rax,QWORD PTR [rbp-0x60]
   1403479fb:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   140347a00:	0f b7 85 c8 23 00 00 	movzx  eax,WORD PTR [rbp+0x23c8]
   140347a07:	66 89 44 24 28       	mov    WORD PTR [rsp+0x28],ax
   140347a0c:	48 8b 45 a8          	mov    rax,QWORD PTR [rbp-0x58]
   140347a10:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140347a15:	e8 26 94 00 00       	call   0x140350e40
   140347a1a:	44 0f 28 9c 24 00 24 	movaps xmm11,XMMWORD PTR [rsp+0x2400]
   140347a21:	00 00 
   140347a23:	41 8d 45 01          	lea    eax,[r13+0x1]
   140347a27:	48 8b bc 24 70 24 00 	mov    rdi,QWORD PTR [rsp+0x2470]
   140347a2e:	00 
   140347a2f:	4c 8b bc 24 60 24 00 	mov    r15,QWORD PTR [rsp+0x2460]
   140347a36:	00 
   140347a37:	4c 8b ac 24 68 24 00 	mov    r13,QWORD PTR [rsp+0x2468]
   140347a3e:	00 
   140347a3f:	48 8b b4 24 b8 24 00 	mov    rsi,QWORD PTR [rsp+0x24b8]
   140347a46:	00 
   140347a47:	0f 28 bc 24 40 24 00 	movaps xmm7,XMMWORD PTR [rsp+0x2440]
   140347a4e:	00 
   140347a4f:	48 8b 8d b0 22 00 00 	mov    rcx,QWORD PTR [rbp+0x22b0]
   140347a56:	48 33 cc             	xor    rcx,rsp
   140347a59:	e8 a2 3b 2d 00       	call   0x14061b600
   140347a5e:	0f 28 b4 24 50 24 00 	movaps xmm6,XMMWORD PTR [rsp+0x2450]
   140347a65:	00 
   140347a66:	44 0f 28 b4 24 d0 23 	movaps xmm14,XMMWORD PTR [rsp+0x23d0]
   140347a6d:	00 00 
   140347a6f:	44 0f 28 bc 24 c0 23 	movaps xmm15,XMMWORD PTR [rsp+0x23c0]
   140347a76:	00 00 
   140347a78:	48 81 c4 78 24 00 00 	add    rsp,0x2478
   140347a7f:	41 5e                	pop    r14
   140347a81:	41 5c                	pop    r12
   140347a83:	5b                   	pop    rbx
   140347a84:	5d                   	pop    rbp
   140347a85:	c3                   	ret
   140347a86:	cc                   	int3
   140347a87:	cc                   	int3
   140347a88:	cc                   	int3
   140347a89:	cc                   	int3
   140347a8a:	cc                   	int3
   140347a8b:	cc                   	int3
   140347a8c:	cc                   	int3
   140347a8d:	cc                   	int3
   140347a8e:	cc                   	int3
   140347a8f:	cc                   	int3
   140347a90:	48 8b c4             	mov    rax,rsp
   140347a93:	53                   	push   rbx
   140347a94:	41 55                	push   r13
   140347a96:	41 56                	push   r14
   140347a98:	48 81 ec 90 00 00 00 	sub    rsp,0x90
   140347a9f:	33 db                	xor    ebx,ebx
   140347aa1:	4c 8b ea             	mov    r13,rdx
   140347aa4:	4c 8b f1             	mov    r14,rcx
   140347aa7:	89 9c 24 b8 00 00 00 	mov    DWORD PTR [rsp+0xb8],ebx
   140347aae:	48 8b 8a 40 05 00 00 	mov    rcx,QWORD PTR [rdx+0x540]
   140347ab5:	8b d3                	mov    edx,ebx
   140347ab7:	48 89 8c 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],rcx
   140347abe:	00 
   140347abf:	41 39 9d 48 05 00 00 	cmp    DWORD PTR [r13+0x548],ebx
   140347ac6:	0f 86 15 01 00 00    	jbe    0x140347be1
   140347acc:	48 89 68 e0          	mov    QWORD PTR [rax-0x20],rbp
   140347ad0:	48 89 70 d8          	mov    QWORD PTR [rax-0x28],rsi
   140347ad4:	48 89 78 d0          	mov    QWORD PTR [rax-0x30],rdi
   140347ad8:	4c 89 60 c8          	mov    QWORD PTR [rax-0x38],r12
   140347adc:	4c 89 78 c0          	mov    QWORD PTR [rax-0x40],r15
   140347ae0:	8b c2                	mov    eax,edx
   140347ae2:	4c 8d 04 80          	lea    r8,[rax+rax*4]
   140347ae6:	42 f6 44 c1 0c 01    	test   BYTE PTR [rcx+r8*8+0xc],0x1
   140347aec:	4a 8d 34 c1          	lea    rsi,[rcx+r8*8]
   140347af0:	0f 85 b6 00 00 00    	jne    0x140347bac
   140347af6:	80 7e 24 01          	cmp    BYTE PTR [rsi+0x24],0x1
   140347afa:	0f 85 ac 00 00 00    	jne    0x140347bac
   140347b00:	44 8b e3             	mov    r12d,ebx
   140347b03:	48 8b 2e             	mov    rbp,QWORD PTR [rsi]
   140347b06:	66 3b 5e 08          	cmp    bx,WORD PTR [rsi+0x8]
   140347b0a:	0f 83 9c 00 00 00    	jae    0x140347bac
   140347b10:	48 83 c5 4b          	add    rbp,0x4b
   140347b14:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140347b18:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140347b1f:	00 
   140347b20:	0f bf 7e 0a          	movsx  edi,WORD PTR [rsi+0xa]
   140347b24:	41 8b 45 0c          	mov    eax,DWORD PTR [r13+0xc]
   140347b28:	41 03 fc             	add    edi,r12d
   140347b2b:	41 8b 4e 28          	mov    ecx,DWORD PTR [r14+0x28]
   140347b2f:	2b c1                	sub    eax,ecx
   140347b31:	3b f8                	cmp    edi,eax
   140347b33:	7c 56                	jl     0x140347b8b
   140347b35:	41 03 4d 10          	add    ecx,DWORD PTR [r13+0x10]
   140347b39:	3b f9                	cmp    edi,ecx
   140347b3b:	7d 5e                	jge    0x140347b9b
   140347b3d:	32 db                	xor    bl,bl
   140347b3f:	38 5d 00             	cmp    BYTE PTR [rbp+0x0],bl
   140347b42:	76 47                	jbe    0x140347b8b
   140347b44:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140347b48:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140347b4f:	00 
   140347b50:	c6 44 24 50 00       	mov    BYTE PTR [rsp+0x50],0x0
   140347b55:	49 8d 55 18          	lea    rdx,[r13+0x18]
   140347b59:	c6 44 24 48 01       	mov    BYTE PTR [rsp+0x48],0x1
   140347b5e:	44 8b cf             	mov    r9d,edi
   140347b61:	c6 44 24 40 00       	mov    BYTE PTR [rsp+0x40],0x0
   140347b66:	4c 8b c6             	mov    r8,rsi
   140347b69:	c6 44 24 38 01       	mov    BYTE PTR [rsp+0x38],0x1
   140347b6e:	49 8b ce             	mov    rcx,r14
   140347b71:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0
   140347b76:	c6 44 24 28 01       	mov    BYTE PTR [rsp+0x28],0x1
   140347b7b:	88 5c 24 20          	mov    BYTE PTR [rsp+0x20],bl
   140347b7f:	e8 7c 49 fd ff       	call   0x14031c500
   140347b84:	fe c3                	inc    bl
   140347b86:	3a 5d 00             	cmp    bl,BYTE PTR [rbp+0x0]
   140347b89:	72 c5                	jb     0x140347b50
   140347b8b:	0f b7 46 08          	movzx  eax,WORD PTR [rsi+0x8]
   140347b8f:	41 ff c4             	inc    r12d
   140347b92:	48 83 c5 5c          	add    rbp,0x5c
   140347b96:	44 3b e0             	cmp    r12d,eax
   140347b99:	7c 85                	jl     0x140347b20
   140347b9b:	8b 94 24 b8 00 00 00 	mov    edx,DWORD PTR [rsp+0xb8]
   140347ba2:	33 db                	xor    ebx,ebx
   140347ba4:	48 8b 8c 24 c8 00 00 	mov    rcx,QWORD PTR [rsp+0xc8]
   140347bab:	00 
   140347bac:	ff c2                	inc    edx
   140347bae:	89 94 24 b8 00 00 00 	mov    DWORD PTR [rsp+0xb8],edx
   140347bb5:	41 3b 95 48 05 00 00 	cmp    edx,DWORD PTR [r13+0x548]
   140347bbc:	0f 82 1e ff ff ff    	jb     0x140347ae0
   140347bc2:	4c 8b 7c 24 68       	mov    r15,QWORD PTR [rsp+0x68]
   140347bc7:	4c 8b 64 24 70       	mov    r12,QWORD PTR [rsp+0x70]
   140347bcc:	48 8b 7c 24 78       	mov    rdi,QWORD PTR [rsp+0x78]
   140347bd1:	48 8b b4 24 80 00 00 	mov    rsi,QWORD PTR [rsp+0x80]
   140347bd8:	00 
   140347bd9:	48 8b ac 24 88 00 00 	mov    rbp,QWORD PTR [rsp+0x88]
   140347be0:	00 
   140347be1:	4c 8d 8c 24 b0 00 00 	lea    r9,[rsp+0xb0]
   140347be8:	00 
   140347be9:	48 89 9c 24 c0 00 00 	mov    QWORD PTR [rsp+0xc0],rbx
   140347bf0:	00 
   140347bf1:	4c 8d 84 24 c0 00 00 	lea    r8,[rsp+0xc0]
   140347bf8:	00 
   140347bf9:	66 89 9c 24 b0 00 00 	mov    WORD PTR [rsp+0xb0],bx
   140347c00:	00 
   140347c01:	49 8b d5             	mov    rdx,r13
   140347c04:	49 8b ce             	mov    rcx,r14
   140347c07:	e8 44 6a fe ff       	call   0x14032e650
   140347c0c:	45 8b 45 0c          	mov    r8d,DWORD PTR [r13+0xc]
   140347c10:	49 8b d5             	mov    rdx,r13
   140347c13:	44 3b c0             	cmp    r8d,eax
   140347c16:	48 89 9c 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],rbx
   140347c1d:	00 
   140347c1e:	49 8b ce             	mov    rcx,r14
   140347c21:	66 89 9c 24 b8 00 00 	mov    WORD PTR [rsp+0xb8],bx
   140347c28:	00 
   140347c29:	44 0f 4c c0          	cmovl  r8d,eax
   140347c2d:	48 8d 84 24 b8 00 00 	lea    rax,[rsp+0xb8]
   140347c34:	00 
   140347c35:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   140347c3a:	45 33 c9             	xor    r9d,r9d
   140347c3d:	48 8d 84 24 c8 00 00 	lea    rax,[rsp+0xc8]
   140347c44:	00 
   140347c45:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   140347c4a:	0f b7 84 24 b0 00 00 	movzx  eax,WORD PTR [rsp+0xb0]
   140347c51:	00 
   140347c52:	66 89 44 24 28       	mov    WORD PTR [rsp+0x28],ax
   140347c57:	48 8b 84 24 c0 00 00 	mov    rax,QWORD PTR [rsp+0xc0]
   140347c5e:	00 
   140347c5f:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140347c64:	e8 07 f5 ff ff       	call   0x140347170
   140347c69:	0f b7 84 24 b8 00 00 	movzx  eax,WORD PTR [rsp+0xb8]
   140347c70:	00 
   140347c71:	49 8b d5             	mov    rdx,r13
   140347c74:	4c 8b 8c 24 c8 00 00 	mov    r9,QWORD PTR [rsp+0xc8]
   140347c7b:	00 
   140347c7c:	49 8b ce             	mov    rcx,r14
   140347c7f:	45 8b 45 10          	mov    r8d,DWORD PTR [r13+0x10]
   140347c83:	66 89 44 24 20       	mov    WORD PTR [rsp+0x20],ax
   140347c88:	e8 23 68 fe ff       	call   0x14032e4b0
   140347c8d:	41 8b 55 0c          	mov    edx,DWORD PTR [r13+0xc]
   140347c91:	41 8b 8e bc 00 00 00 	mov    ecx,DWORD PTR [r14+0xbc]
   140347c98:	44 8b 05 45 23 64 00 	mov    r8d,DWORD PTR [rip+0x642345]        # 0x140989fe4
   140347c9f:	41 2b d0             	sub    edx,r8d
   140347ca2:	45 8b 4d 10          	mov    r9d,DWORD PTR [r13+0x10]
   140347ca6:	41 03 c9             	add    ecx,r9d
   140347ca9:	3b d1                	cmp    edx,ecx
   140347cab:	7d 42                	jge    0x140347cef
   140347cad:	0f 1f 00             	nop    DWORD PTR [rax]
   140347cb0:	41 8b 45 0c          	mov    eax,DWORD PTR [r13+0xc]
   140347cb4:	3b d0                	cmp    edx,eax
   140347cb6:	7c 08                	jl     0x140347cc0
   140347cb8:	41 8b c9             	mov    ecx,r9d
   140347cbb:	41 3b d1             	cmp    edx,r9d
   140347cbe:	7c 1f                	jl     0x140347cdf
   140347cc0:	44 2b c0             	sub    r8d,eax
   140347cc3:	49 8b 85 a0 05 00 00 	mov    rax,QWORD PTR [r13+0x5a0]
   140347cca:	44 03 c2             	add    r8d,edx
   140347ccd:	49 63 c8             	movsxd rcx,r8d
   140347cd0:	66 89 1c 48          	mov    WORD PTR [rax+rcx*2],bx
   140347cd4:	41 8b 4d 10          	mov    ecx,DWORD PTR [r13+0x10]
   140347cd8:	44 8b 05 05 23 64 00 	mov    r8d,DWORD PTR [rip+0x642305]        # 0x140989fe4
   140347cdf:	44 8b c9             	mov    r9d,ecx
   140347ce2:	ff c2                	inc    edx
   140347ce4:	41 03 8e bc 00 00 00 	add    ecx,DWORD PTR [r14+0xbc]
   140347ceb:	3b d1                	cmp    edx,ecx
   140347ced:	7c c1                	jl     0x140347cb0
   140347cef:	49 8b d5             	mov    rdx,r13
   140347cf2:	49 8b ce             	mov    rcx,r14
   140347cf5:	e8 66 5c fd ff       	call   0x14031d960
   140347cfa:	41 b0 01             	mov    r8b,0x1
   140347cfd:	49 8b d5             	mov    rdx,r13
   140347d00:	49 8b ce             	mov    rcx,r14
   140347d03:	e8 88 50 fd ff       	call   0x14031cd90
   140347d08:	45 8b 45 10          	mov    r8d,DWORD PTR [r13+0x10]
   140347d0c:	49 8b cd             	mov    rcx,r13
   140347d0f:	41 8b 55 0c          	mov    edx,DWORD PTR [r13+0xc]
   140347d13:	e8 68 52 fd ff       	call   0x14031cf80
   140347d18:	48 81 c4 90 00 00 00 	add    rsp,0x90
   140347d1f:	41 5e                	pop    r14
   140347d21:	41 5d                	pop    r13
   140347d23:	5b                   	pop    rbx
   140347d24:	c3                   	ret
   140347d25:	cc                   	int3
   140347d26:	cc                   	int3
   140347d27:	cc                   	int3
   140347d28:	cc                   	int3
   140347d29:	cc                   	int3
   140347d2a:	cc                   	int3
   140347d2b:	cc                   	int3
   140347d2c:	cc                   	int3
   140347d2d:	cc                   	int3
   140347d2e:	cc                   	int3
   140347d2f:	cc                   	int3
   140347d30:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140347d35:	8b 05 6d 24 64 00    	mov    eax,DWORD PTR [rip+0x64246d]        # 0x14098a1a8
   140347d3b:	44 8b da             	mov    r11d,edx
   140347d3e:	45 2b d8             	sub    r11d,r8d
   140347d41:	0f 57 c0             	xorps  xmm0,xmm0
   140347d44:	44 0f af d8          	imul   r11d,eax
   140347d48:	48 8b d9             	mov    rbx,rcx
   140347d4b:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140347d50:	99                   	cdq
   140347d51:	2b c2                	sub    eax,edx
   140347d53:	d1 f8                	sar    eax,1
   140347d55:	44 03 d8             	add    r11d,eax
   140347d58:	f2 0f 58 c0          	addsd  xmm0,xmm0
   140347d5c:	f2 0f 59 05 ec 05 36 	mulsd  xmm0,QWORD PTR [rip+0x3605ec]        # 0x1406a8350
   140347d63:	00 
   140347d64:	f2 44 0f 2c d0       	cvttsd2si r10d,xmm0
   140347d69:	41 8b c2             	mov    eax,r10d
   140347d6c:	99                   	cdq
   140347d6d:	2b c2                	sub    eax,edx
   140347d6f:	d1 f8                	sar    eax,1
   140347d71:	44 2b d8             	sub    r11d,eax
   140347d74:	33 c0                	xor    eax,eax
   140347d76:	45 85 db             	test   r11d,r11d
   140347d79:	44 0f 4e d8          	cmovle r11d,eax
   140347d7d:	45 89 19             	mov    DWORD PTR [r9],r11d
   140347d80:	8b 43 24             	mov    eax,DWORD PTR [rbx+0x24]
   140347d83:	8b 49 28             	mov    ecx,DWORD PTR [rcx+0x28]
   140347d86:	48 8b 5c 24 08       	mov    rbx,QWORD PTR [rsp+0x8]
   140347d8b:	47 8d 04 13          	lea    r8d,[r11+r10*1]
   140347d8f:	8d 14 48             	lea    edx,[rax+rcx*2]
   140347d92:	48 8b 44 24 28       	mov    rax,QWORD PTR [rsp+0x28]
   140347d97:	0f af 15 0a 24 64 00 	imul   edx,DWORD PTR [rip+0x64240a]        # 0x14098a1a8
   140347d9e:	44 3b c2             	cmp    r8d,edx
   140347da1:	44 0f 4d c2          	cmovge r8d,edx
   140347da5:	44 89 00             	mov    DWORD PTR [rax],r8d
   140347da8:	c3                   	ret
   140347da9:	cc                   	int3
   140347daa:	cc                   	int3
   140347dab:	cc                   	int3
   140347dac:	cc                   	int3
   140347dad:	cc                   	int3
   140347dae:	cc                   	int3
   140347daf:	cc                   	int3
