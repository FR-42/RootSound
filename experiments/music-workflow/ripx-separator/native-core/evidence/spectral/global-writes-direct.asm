   140318296:	55                   	push   rbp
   140318297:	56                   	push   rsi
   140318298:	57                   	push   rdi
   140318299:	41 54                	push   r12
   14031829b:	41 55                	push   r13
   14031829d:	41 56                	push   r14
   14031829f:	41 57                	push   r15
   1403182a1:	48 83 ec 50          	sub    rsp,0x50
   1403182a5:	48 c7 40 a8 fe ff ff 	mov    QWORD PTR [rax-0x58],0xfffffffffffffffe
   1403182ac:	ff 
   1403182ad:	48 89 58 18          	mov    QWORD PTR [rax+0x18],rbx
   1403182b1:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   1403182b5:	41 0f b6 f8          	movzx  edi,r8b
   1403182b9:	44 0f b6 e2          	movzx  r12d,dl
   1403182bd:	48 8b d9             	mov    rbx,rcx
   1403182c0:	45 33 c0             	xor    r8d,r8d
   1403182c3:	0f b7 51 14          	movzx  edx,WORD PTR [rcx+0x14]
   1403182c7:	e8 a4 63 00 00       	call   0x14031e670
   1403182cc:	45 33 ed             	xor    r13d,r13d
   1403182cf:	45 84 e4             	test   r12b,r12b
   1403182d2:	75 04                	jne    0x1403182d8
   1403182d4:	44 89 6b 1c          	mov    DWORD PTR [rbx+0x1c],r13d
   1403182d8:	8b 53 28             	mov    edx,DWORD PTR [rbx+0x28]
   1403182db:	8b 43 24             	mov    eax,DWORD PTR [rbx+0x24]
   1403182de:	8d 0c 50             	lea    ecx,[rax+rdx*2]
   1403182e1:	0f af 0d c0 1e 67 00 	imul   ecx,DWORD PTR [rip+0x671ec0]        # 0x14098a1a8

   1403182e8:	89 4b 20             	mov    DWORD PTR [rbx+0x20],ecx

   1403182eb:	40 84 ff             	test   dil,dil

   1403182ee:	0f 85 d3 02 00 00    	jne    0x1403185c7

   1403182f4:	b9 08 08 00 00       	mov    ecx,0x808

   1403182f9:	e8 62 32 30 00       	call   0x14061b560

   1403182fe:	48 8b e8             	mov    rbp,rax

   140318301:	b9 08 08 00 00       	mov    ecx,0x808

   140318306:	e8 55 32 30 00       	call   0x14061b560

   14031830b:	4c 8b f0             	mov    r14,rax

   14031830e:	b9 00 10 00 00       	mov    ecx,0x1000

   140318313:	e8 48 32 30 00       	call   0x14061b560

   140318318:	4c 8b f8             	mov    r15,rax

   14031831b:	c7 83 c0 00 00 00 04 	mov    DWORD PTR [rbx+0xc0],0x4

   140318322:	00 00 00 

   140318325:	b9 00 01 00 00       	mov    ecx,0x100

   14031832a:	e8 31 32 30 00       	call   0x14061b560

   14031837c:	48 89 51 18          	mov    QWORD PTR [rcx+0x18],rdx
   140318380:	48 89 51 20          	mov    QWORD PTR [rcx+0x20],rdx
   140318384:	48 89 51 28          	mov    QWORD PTR [rcx+0x28],rdx
   140318388:	48 89 51 30          	mov    QWORD PTR [rcx+0x30],rdx
   14031838c:	48 89 51 38          	mov    QWORD PTR [rcx+0x38],rdx
   140318390:	4c 8d 1c 40          	lea    r11,[rax+rax*2]
   140318394:	4c 8d 25 85 1c 67 00 	lea    r12,[rip+0x671c85]        # 0x14098a020
   14031839b:	f3 43 0f 10 04 9c    	movss  xmm0,DWORD PTR [r12+r11*4]
   1403183a1:	f3 0f 11 41 08       	movss  DWORD PTR [rcx+0x8],xmm0
   1403183a6:	f3 0f 11 01          	movss  DWORD PTR [rcx],xmm0
   1403183aa:	f3 43 0f 10 44 9c 04 	movss  xmm0,DWORD PTR [r12+r11*4+0x4]
   1403183b1:	f3 0f 11 41 0c       	movss  DWORD PTR [rcx+0xc],xmm0
   1403183b6:	f3 0f 11 41 04       	movss  DWORD PTR [rcx+0x4],xmm0
   1403183bb:	45 32 d2             	xor    r10b,r10b
   1403183be:	66 90                	xchg   ax,ax
   1403183c0:	45 84 d2             	test   r10b,r10b
   1403183c3:	75 0e                	jne    0x1403183d3
   1403183c5:	47 8b 4c 9c 08       	mov    r9d,DWORD PTR [r12+r11*4+0x8]
   1403183ca:	44 89 49 18          	mov    DWORD PTR [rcx+0x18],r9d
   1403183ce:	4d 8b c5             	mov    r8,r13
   1403183d1:	eb 0c                	jmp    0x1403183df
   1403183d3:	45 0f b6 c2          	movzx  r8d,r10b
   1403183d7:	44 8b cf             	mov    r9d,edi
   1403183da:	42 89 7c 81 18       	mov    DWORD PTR [rcx+r8*4+0x18],edi
   1403183df:	33 d2                	xor    edx,edx
   1403183e1:	8b 05 c1 1d 67 00    	mov    eax,DWORD PTR [rip+0x671dc1]        # 0x14098a1a8

   1403183e7:	41 f7 f1             	div    r9d

   1403183ea:	42 89 44 81 20       	mov    DWORD PTR [rcx+r8*4+0x20],eax

   1403183ef:	41 8b c1             	mov    eax,r9d

   1403183f2:	0f 57 d2             	xorps  xmm2,xmm2

   1403183f5:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax

   140318394:	4c 8d 25 85 1c 67 00 	lea    r12,[rip+0x671c85]        # 0x14098a020
   14031839b:	f3 43 0f 10 04 9c    	movss  xmm0,DWORD PTR [r12+r11*4]
   1403183a1:	f3 0f 11 41 08       	movss  DWORD PTR [rcx+0x8],xmm0
   1403183a6:	f3 0f 11 01          	movss  DWORD PTR [rcx],xmm0
   1403183aa:	f3 43 0f 10 44 9c 04 	movss  xmm0,DWORD PTR [r12+r11*4+0x4]
   1403183b1:	f3 0f 11 41 0c       	movss  DWORD PTR [rcx+0xc],xmm0
   1403183b6:	f3 0f 11 41 04       	movss  DWORD PTR [rcx+0x4],xmm0
   1403183bb:	45 32 d2             	xor    r10b,r10b
   1403183be:	66 90                	xchg   ax,ax
   1403183c0:	45 84 d2             	test   r10b,r10b
   1403183c3:	75 0e                	jne    0x1403183d3
   1403183c5:	47 8b 4c 9c 08       	mov    r9d,DWORD PTR [r12+r11*4+0x8]
   1403183ca:	44 89 49 18          	mov    DWORD PTR [rcx+0x18],r9d
   1403183ce:	4d 8b c5             	mov    r8,r13
   1403183d1:	eb 0c                	jmp    0x1403183df
   1403183d3:	45 0f b6 c2          	movzx  r8d,r10b
   1403183d7:	44 8b cf             	mov    r9d,edi
   1403183da:	42 89 7c 81 18       	mov    DWORD PTR [rcx+r8*4+0x18],edi
   1403183df:	33 d2                	xor    edx,edx
   1403183e1:	8b 05 c1 1d 67 00    	mov    eax,DWORD PTR [rip+0x671dc1]        # 0x14098a1a8
   1403183e7:	41 f7 f1             	div    r9d
   1403183ea:	42 89 44 81 20       	mov    DWORD PTR [rcx+r8*4+0x20],eax
   1403183ef:	41 8b c1             	mov    eax,r9d
   1403183f2:	0f 57 d2             	xorps  xmm2,xmm2
   1403183f5:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   1403183fa:	8b 05 54 1d 67 00    	mov    eax,DWORD PTR [rip+0x671d54]        # 0x14098a154

   140318400:	0f 57 c0             	xorps  xmm0,xmm0

   140318403:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140318408:	f3 0f 5e c2          	divss  xmm0,xmm2

   14031840c:	f3 42 0f 11 44 81 10 	movss  DWORD PTR [rcx+r8*4+0x10],xmm0

   140318413:	0f 28 ce             	movaps xmm1,xmm6

   140318416:	f3 0f 5e ca          	divss  xmm1,xmm2

   14031841a:	f3 48 0f 2c c1       	cvttss2si rax,xmm1

   14031841f:	42 89 44 81 28       	mov    DWORD PTR [rcx+r8*4+0x28],eax

   140318424:	33 d2                	xor    edx,edx

   140318426:	8b 43 20             	mov    eax,DWORD PTR [rbx+0x20]

   140318429:	41 f7 f1             	div    r9d

   14031842c:	42 89 44 81 30       	mov    DWORD PTR [rcx+r8*4+0x30],eax

   140318431:	41 fe c2             	inc    r10b

   140318434:	44 3a d7             	cmp    r10b,dil

   140318437:	76 87                	jbe    0x1403183c0

   140318439:	44 0f b6 a4 24 98 00 	movzx  r12d,BYTE PTR [rsp+0x98]

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

   14031997d:	41 8b c0             	mov    eax,r8d
   140319980:	4c 8b b4 24 c0 03 00 	mov    r14,QWORD PTR [rsp+0x3c0]
   140319987:	00 
   140319988:	4d 8b e1             	mov    r12,r9
   14031998b:	89 44 24 50          	mov    DWORD PTR [rsp+0x50],eax
   14031998f:	4c 8b fa             	mov    r15,rdx
   140319992:	2b c3                	sub    eax,ebx
   140319994:	4c 89 4c 24 60       	mov    QWORD PTR [rsp+0x60],r9
   140319999:	80 bc 24 c8 03 00 00 	cmp    BYTE PTR [rsp+0x3c8],0x0
   1403199a0:	00 
   1403199a1:	48 8b f9             	mov    rdi,rcx
   1403199a4:	48 63 e8             	movsxd rbp,eax
   1403199a7:	4c 8b eb             	mov    r13,rbx
   1403199aa:	48 89 4c 24 58       	mov    QWORD PTR [rsp+0x58],rcx
   1403199af:	0f 57 f6             	xorps  xmm6,xmm6
   1403199b2:	48 89 5c 24 68       	mov    QWORD PTR [rsp+0x68],rbx
   1403199b7:	f3 45 0f 10 04 a9    	movss  xmm8,DWORD PTR [r9+rbp*4]
   1403199bd:	0f 84 bd 03 00 00    	je     0x140319d80
   1403199c3:	48 83 bc 24 e0 03 00 	cmp    QWORD PTR [rsp+0x3e0],0x0
   1403199ca:	00 00 
   1403199cc:	0f 85 ae 03 00 00    	jne    0x140319d80
   1403199d2:	33 d2                	xor    edx,edx
   1403199d4:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   1403199d9:	41 b8 30 02 00 00    	mov    r8d,0x230
   1403199df:	e8 06 73 30 00       	call   0x140620cea
   1403199e4:	8b 0d be 07 67 00    	mov    ecx,DWORD PTR [rip+0x6707be]        # 0x14098a1a8

   1403199ea:	8b 84 24 98 03 00 00 	mov    eax,DWORD PTR [rsp+0x398]

   1403199f1:	8b b4 24 a0 03 00 00 	mov    esi,DWORD PTR [rsp+0x3a0]

   1403199f8:	99                   	cdq

   1403199f9:	f7 f9                	idiv   ecx

   1403199fb:	4c 63 c8             	movsxd r9,eax

   1403199fe:	8d 46 ff             	lea    eax,[rsi-0x1]

   140319a01:	03 c1                	add    eax,ecx

   140319a03:	4d 8b d9             	mov    r11,r9

   140319a06:	99                   	cdq

   140319a07:	f7 f9                	idiv   ecx

   140319a09:	4c 63 d0             	movsxd r10,eax

   140319a0c:	45 8b c2             	mov    r8d,r10d

   140319a0f:	45 2b c1             	sub    r8d,r9d

   140319a12:	45 3b ca             	cmp    r9d,r10d

   140319a15:	0f 8d d6 00 00 00    	jge    0x140319af1

   140319a1b:	41 83 f8 08          	cmp    r8d,0x8

   140319d00:	14 
   140319d01:	49 89 87 e4 03 00 00 	mov    QWORD PTR [r15+0x3e4],rax
   140319d08:	49 8b d7             	mov    rdx,r15
   140319d0b:	49 89 87 ec 03 00 00 	mov    QWORD PTR [r15+0x3ec],rax
   140319d12:	f3 0f 5f cf          	maxss  xmm1,xmm7
   140319d16:	49 89 87 f4 03 00 00 	mov    QWORD PTR [r15+0x3f4],rax
   140319d1d:	49 89 87 fc 03 00 00 	mov    QWORD PTR [r15+0x3fc],rax
   140319d24:	49 89 87 04 04 00 00 	mov    QWORD PTR [r15+0x404],rax
   140319d2b:	49 89 87 0c 04 00 00 	mov    QWORD PTR [r15+0x40c],rax
   140319d32:	41 89 87 14 04 00 00 	mov    DWORD PTR [r15+0x414],eax
   140319d39:	66 41 89 87 18 04 00 	mov    WORD PTR [r15+0x418],ax
   140319d40:	00 
   140319d41:	f3 0f 11 44 24 28    	movss  DWORD PTR [rsp+0x28],xmm0
   140319d47:	45 89 9f 88 04 00 00 	mov    DWORD PTR [r15+0x488],r11d
   140319d4e:	41 89 b7 8c 04 00 00 	mov    DWORD PTR [r15+0x48c],esi
   140319d55:	f3 0f 11 4c 24 20    	movss  DWORD PTR [rsp+0x20],xmm1
   140319d5b:	e8 90 11 01 00       	call   0x14032aef0
   140319d60:	85 c0                	test   eax,eax
   140319d62:	75 1c                	jne    0x140319d80
   140319d64:	f2 0f 10 44 24 78    	movsd  xmm0,QWORD PTR [rsp+0x78]
   140319d6a:	0f 57 c9             	xorps  xmm1,xmm1
   140319d6d:	66 0f 2f c1          	comisd xmm0,xmm1
   140319d71:	76 0d                	jbe    0x140319d80
   140319d73:	f3 44 0f 10 44 24 70 	movss  xmm8,DWORD PTR [rsp+0x70]
   140319d7a:	f3 45 0f 11 04 ac    	movss  DWORD PTR [r12+rbp*4],xmm8
   140319d80:	8b 0d 22 04 67 00    	mov    ecx,DWORD PTR [rip+0x670422]        # 0x14098a1a8

   140319d86:	0f 57 c0             	xorps  xmm0,xmm0

   140319d89:	8b 84 24 a8 03 00 00 	mov    eax,DWORD PTR [rsp+0x3a8]

   140319d90:	f2 0f 10 3d 60 64 53 	movsd  xmm7,QWORD PTR [rip+0x536460]        # 0x1408501f8

   140319d97:	00 

   140319d98:	99                   	cdq

   140319d99:	f7 f9                	idiv   ecx

   140319d9b:	4c 63 c0             	movsxd r8,eax

   140319d9e:	8b 84 24 b0 03 00 00 	mov    eax,DWORD PTR [rsp+0x3b0]

   140319da5:	ff c8                	dec    eax

   140319da7:	03 c1                	add    eax,ecx

   140319da9:	99                   	cdq

   140319daa:	f7 f9                	idiv   ecx

   140319dac:	83 3d f5 fb 61 00 03 	cmp    DWORD PTR [rip+0x61fbf5],0x3        # 0x1409399a8

   140319d4e:	41 89 b7 8c 04 00 00 	mov    DWORD PTR [r15+0x48c],esi
   140319d55:	f3 0f 11 4c 24 20    	movss  DWORD PTR [rsp+0x20],xmm1
   140319d5b:	e8 90 11 01 00       	call   0x14032aef0
   140319d60:	85 c0                	test   eax,eax
   140319d62:	75 1c                	jne    0x140319d80
   140319d64:	f2 0f 10 44 24 78    	movsd  xmm0,QWORD PTR [rsp+0x78]
   140319d6a:	0f 57 c9             	xorps  xmm1,xmm1
   140319d6d:	66 0f 2f c1          	comisd xmm0,xmm1
   140319d71:	76 0d                	jbe    0x140319d80
   140319d73:	f3 44 0f 10 44 24 70 	movss  xmm8,DWORD PTR [rsp+0x70]
   140319d7a:	f3 45 0f 11 04 ac    	movss  DWORD PTR [r12+rbp*4],xmm8
   140319d80:	8b 0d 22 04 67 00    	mov    ecx,DWORD PTR [rip+0x670422]        # 0x14098a1a8
   140319d86:	0f 57 c0             	xorps  xmm0,xmm0
   140319d89:	8b 84 24 a8 03 00 00 	mov    eax,DWORD PTR [rsp+0x3a8]
   140319d90:	f2 0f 10 3d 60 64 53 	movsd  xmm7,QWORD PTR [rip+0x536460]        # 0x1408501f8
   140319d97:	00 
   140319d98:	99                   	cdq
   140319d99:	f7 f9                	idiv   ecx
   140319d9b:	4c 63 c0             	movsxd r8,eax
   140319d9e:	8b 84 24 b0 03 00 00 	mov    eax,DWORD PTR [rsp+0x3b0]
   140319da5:	ff c8                	dec    eax
   140319da7:	03 c1                	add    eax,ecx
   140319da9:	99                   	cdq
   140319daa:	f7 f9                	idiv   ecx
   140319dac:	83 3d f5 fb 61 00 03 	cmp    DWORD PTR [rip+0x61fbf5],0x3        # 0x1409399a8
   140319db3:	8b 0d 9b 03 67 00    	mov    ecx,DWORD PTR [rip+0x67039b]        # 0x14098a154

   140319db9:	41 0f 93 c4          	setae  r12b

   140319dbd:	45 0f b6 ec          	movzx  r13d,r12b

   140319dc1:	44 3b 2d e0 fb 61 00 	cmp    r13d,DWORD PTR [rip+0x61fbe0]        # 0x1409399a8

   140319dc8:	f2 48 0f 2a c1       	cvtsi2sd xmm0,rcx

   140319dcd:	f2 0f 5e f8          	divsd  xmm7,xmm0

   140319dd1:	0f 83 f0 03 00 00    	jae    0x14031a1c7

   140319dd7:	44 0f 29 8c 24 e0 02 	movaps XMMWORD PTR [rsp+0x2e0],xmm9

   140319dde:	00 00 

   140319de0:	ff c8                	dec    eax

   140319de2:	f3 44 0f 10 0d 05 65 	movss  xmm9,DWORD PTR [rip+0x536505]        # 0x1408502f0

   140319de9:	53 00 

   140319deb:	49 8b f8             	mov    rdi,r8

   140319dee:	44 0f 29 94 24 d0 02 	movaps XMMWORD PTR [rsp+0x2d0],xmm10

   140319df5:	00 00 

   140319df7:	f2 44 0f 10 15 80 43 	movsd  xmm10,QWORD PTR [rip+0x374380]        # 0x14068e180

   140319dfe:	37 00 

   140319ea4:	8b 84 24 b0 03 00 00 	mov    eax,DWORD PTR [rsp+0x3b0]
   140319eab:	89 86 24 02 00 00    	mov    DWORD PTR [rsi+0x224],eax
   140319eb1:	44 88 a6 2c 02 00 00 	mov    BYTE PTR [rsi+0x22c],r12b
   140319eb8:	48 3b fd             	cmp    rdi,rbp
   140319ebb:	0f 8d e3 01 00 00    	jge    0x14031a0a4
   140319ec1:	4c 8b 54 24 68       	mov    r10,QWORD PTR [rsp+0x68]
   140319ec6:	48 8b c5             	mov    rax,rbp
   140319ec9:	4c 8b 4c 24 60       	mov    r9,QWORD PTR [rsp+0x60]
   140319ece:	48 2b c7             	sub    rax,rdi
   140319ed1:	48 83 f8 04          	cmp    rax,0x4
   140319ed5:	0f 8c 5c 01 00 00    	jl     0x14031a037
   140319edb:	48 8b cf             	mov    rcx,rdi
   140319ede:	4c 8d 45 fd          	lea    r8,[rbp-0x3]
   140319ee2:	49 2b ca             	sub    rcx,r10
   140319ee5:	48 83 c1 02          	add    rcx,0x2
   140319ee9:	49 8d 0c 89          	lea    rcx,[r9+rcx*4]
   140319eed:	0f 1f 00             	nop    DWORD PTR [rax]
   140319ef0:	f3 0f 10 51 f8       	movss  xmm2,DWORD PTR [rcx-0x8]
   140319ef5:	0f 2e d6             	ucomiss xmm2,xmm6
   140319ef8:	7a 02                	jp     0x140319efc
   140319efa:	74 42                	je     0x140319f3e
   140319efc:	f3 0f 10 41 fc       	movss  xmm0,DWORD PTR [rcx-0x4]
   140319f01:	0f 2e c6             	ucomiss xmm0,xmm6
   140319f04:	7a 02                	jp     0x140319f08
   140319f06:	74 36                	je     0x140319f3e
   140319f08:	8b 05 9a 02 67 00    	mov    eax,DWORD PTR [rip+0x67029a]        # 0x14098a1a8

   140319f0e:	f3 0f 5c c2          	subss  xmm0,xmm2

   140319f12:	0f 5a c8             	cvtps2pd xmm1,xmm0

   140319f15:	0f 57 c0             	xorps  xmm0,xmm0

   140319f18:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140319f1d:	f2 0f 59 cf          	mulsd  xmm1,xmm7

   140319f21:	48 6b c3 46          	imul   rax,rbx,0x46

   140319f25:	f2 0f 5e c8          	divsd  xmm1,xmm0

   140319f29:	48 2b c7             	sub    rax,rdi

   140319f2c:	48 03 c2             	add    rax,rdx

   140319f2f:	0f 2f f3             	comiss xmm6,xmm3

   140319f32:	f2 41 0f 11 4c c6 18 	movsd  QWORD PTR [r14+rax*8+0x18],xmm1

   140319f39:	76 03                	jbe    0x140319f3e

   140319f3b:	0f 28 da             	movaps xmm3,xmm2

   140319f3e:	f3 0f 10 51 fc       	movss  xmm2,DWORD PTR [rcx-0x4]

   140319f43:	0f 2e d6             	ucomiss xmm2,xmm6

   140319f46:	7a 02                	jp     0x140319f4a

   140319f01:	0f 2e c6             	ucomiss xmm0,xmm6
   140319f04:	7a 02                	jp     0x140319f08
   140319f06:	74 36                	je     0x140319f3e
   140319f08:	8b 05 9a 02 67 00    	mov    eax,DWORD PTR [rip+0x67029a]        # 0x14098a1a8
   140319f0e:	f3 0f 5c c2          	subss  xmm0,xmm2
   140319f12:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140319f15:	0f 57 c0             	xorps  xmm0,xmm0
   140319f18:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140319f1d:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   140319f21:	48 6b c3 46          	imul   rax,rbx,0x46
   140319f25:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140319f29:	48 2b c7             	sub    rax,rdi
   140319f2c:	48 03 c2             	add    rax,rdx
   140319f2f:	0f 2f f3             	comiss xmm6,xmm3
   140319f32:	f2 41 0f 11 4c c6 18 	movsd  QWORD PTR [r14+rax*8+0x18],xmm1
   140319f39:	76 03                	jbe    0x140319f3e
   140319f3b:	0f 28 da             	movaps xmm3,xmm2
   140319f3e:	f3 0f 10 51 fc       	movss  xmm2,DWORD PTR [rcx-0x4]
   140319f43:	0f 2e d6             	ucomiss xmm2,xmm6
   140319f46:	7a 02                	jp     0x140319f4a
   140319f48:	74 41                	je     0x140319f8b
   140319f4a:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   140319f4e:	0f 2e c6             	ucomiss xmm0,xmm6
   140319f51:	7a 02                	jp     0x140319f55
   140319f53:	74 36                	je     0x140319f8b
   140319f55:	8b 05 4d 02 67 00    	mov    eax,DWORD PTR [rip+0x67024d]        # 0x14098a1a8

   140319f5b:	f3 0f 5c c2          	subss  xmm0,xmm2

   140319f5f:	0f 5a c8             	cvtps2pd xmm1,xmm0

   140319f62:	0f 57 c0             	xorps  xmm0,xmm0

   140319f65:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140319f6a:	f2 0f 59 cf          	mulsd  xmm1,xmm7

   140319f6e:	48 6b c3 46          	imul   rax,rbx,0x46

   140319f72:	f2 0f 5e c8          	divsd  xmm1,xmm0

   140319f76:	48 2b c7             	sub    rax,rdi

   140319f79:	48 03 c2             	add    rax,rdx

   140319f7c:	0f 2f f3             	comiss xmm6,xmm3

   140319f7f:	f2 41 0f 11 4c c6 20 	movsd  QWORD PTR [r14+rax*8+0x20],xmm1

   140319f86:	76 03                	jbe    0x140319f8b

   140319f88:	0f 28 da             	movaps xmm3,xmm2

   140319f8b:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]

   140319f8f:	0f 2e d6             	ucomiss xmm2,xmm6

   140319f92:	7a 02                	jp     0x140319f96

   140319f4e:	0f 2e c6             	ucomiss xmm0,xmm6
   140319f51:	7a 02                	jp     0x140319f55
   140319f53:	74 36                	je     0x140319f8b
   140319f55:	8b 05 4d 02 67 00    	mov    eax,DWORD PTR [rip+0x67024d]        # 0x14098a1a8
   140319f5b:	f3 0f 5c c2          	subss  xmm0,xmm2
   140319f5f:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140319f62:	0f 57 c0             	xorps  xmm0,xmm0
   140319f65:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140319f6a:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   140319f6e:	48 6b c3 46          	imul   rax,rbx,0x46
   140319f72:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140319f76:	48 2b c7             	sub    rax,rdi
   140319f79:	48 03 c2             	add    rax,rdx
   140319f7c:	0f 2f f3             	comiss xmm6,xmm3
   140319f7f:	f2 41 0f 11 4c c6 20 	movsd  QWORD PTR [r14+rax*8+0x20],xmm1
   140319f86:	76 03                	jbe    0x140319f8b
   140319f88:	0f 28 da             	movaps xmm3,xmm2
   140319f8b:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]
   140319f8f:	0f 2e d6             	ucomiss xmm2,xmm6
   140319f92:	7a 02                	jp     0x140319f96
   140319f94:	74 42                	je     0x140319fd8
   140319f96:	f3 0f 10 41 04       	movss  xmm0,DWORD PTR [rcx+0x4]
   140319f9b:	0f 2e c6             	ucomiss xmm0,xmm6
   140319f9e:	7a 02                	jp     0x140319fa2
   140319fa0:	74 36                	je     0x140319fd8
   140319fa2:	8b 05 00 02 67 00    	mov    eax,DWORD PTR [rip+0x670200]        # 0x14098a1a8

   140319fa8:	f3 0f 5c c2          	subss  xmm0,xmm2

   140319fac:	0f 5a c8             	cvtps2pd xmm1,xmm0

   140319faf:	0f 57 c0             	xorps  xmm0,xmm0

   140319fb2:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140319fb7:	f2 0f 59 cf          	mulsd  xmm1,xmm7

   140319fbb:	48 6b c3 46          	imul   rax,rbx,0x46

   140319fbf:	f2 0f 5e c8          	divsd  xmm1,xmm0

   140319fc3:	48 2b c7             	sub    rax,rdi

   140319fc6:	48 03 c2             	add    rax,rdx

   140319fc9:	0f 2f f3             	comiss xmm6,xmm3

   140319fcc:	f2 41 0f 11 4c c6 28 	movsd  QWORD PTR [r14+rax*8+0x28],xmm1

   140319fd3:	76 03                	jbe    0x140319fd8

   140319fd5:	0f 28 da             	movaps xmm3,xmm2

   140319fd8:	f3 0f 10 51 04       	movss  xmm2,DWORD PTR [rcx+0x4]

   140319fdd:	0f 2e d6             	ucomiss xmm2,xmm6

   140319fe0:	7a 02                	jp     0x140319fe4

   140319f9b:	0f 2e c6             	ucomiss xmm0,xmm6
   140319f9e:	7a 02                	jp     0x140319fa2
   140319fa0:	74 36                	je     0x140319fd8
   140319fa2:	8b 05 00 02 67 00    	mov    eax,DWORD PTR [rip+0x670200]        # 0x14098a1a8
   140319fa8:	f3 0f 5c c2          	subss  xmm0,xmm2
   140319fac:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140319faf:	0f 57 c0             	xorps  xmm0,xmm0
   140319fb2:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140319fb7:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   140319fbb:	48 6b c3 46          	imul   rax,rbx,0x46
   140319fbf:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140319fc3:	48 2b c7             	sub    rax,rdi
   140319fc6:	48 03 c2             	add    rax,rdx
   140319fc9:	0f 2f f3             	comiss xmm6,xmm3
   140319fcc:	f2 41 0f 11 4c c6 28 	movsd  QWORD PTR [r14+rax*8+0x28],xmm1
   140319fd3:	76 03                	jbe    0x140319fd8
   140319fd5:	0f 28 da             	movaps xmm3,xmm2
   140319fd8:	f3 0f 10 51 04       	movss  xmm2,DWORD PTR [rcx+0x4]
   140319fdd:	0f 2e d6             	ucomiss xmm2,xmm6
   140319fe0:	7a 02                	jp     0x140319fe4
   140319fe2:	74 42                	je     0x14031a026
   140319fe4:	f3 0f 10 41 08       	movss  xmm0,DWORD PTR [rcx+0x8]
   140319fe9:	0f 2e c6             	ucomiss xmm0,xmm6
   140319fec:	7a 02                	jp     0x140319ff0
   140319fee:	74 36                	je     0x14031a026
   140319ff0:	8b 05 b2 01 67 00    	mov    eax,DWORD PTR [rip+0x6701b2]        # 0x14098a1a8

   140319ff6:	f3 0f 5c c2          	subss  xmm0,xmm2

   140319ffa:	0f 5a c8             	cvtps2pd xmm1,xmm0

   140319ffd:	0f 57 c0             	xorps  xmm0,xmm0

   14031a000:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   14031a005:	f2 0f 59 cf          	mulsd  xmm1,xmm7

   14031a009:	48 6b c3 46          	imul   rax,rbx,0x46

   14031a00d:	f2 0f 5e c8          	divsd  xmm1,xmm0

   14031a011:	48 2b c7             	sub    rax,rdi

   14031a014:	48 03 c2             	add    rax,rdx

   14031a017:	0f 2f f3             	comiss xmm6,xmm3

   14031a01a:	f2 41 0f 11 4c c6 30 	movsd  QWORD PTR [r14+rax*8+0x30],xmm1

   14031a021:	76 03                	jbe    0x14031a026

   14031a023:	0f 28 da             	movaps xmm3,xmm2

   14031a026:	48 83 c2 04          	add    rdx,0x4

   14031a02a:	48 83 c1 10          	add    rcx,0x10

   14031a02e:	49 3b d0             	cmp    rdx,r8

   14031a009:	48 6b c3 46          	imul   rax,rbx,0x46
   14031a00d:	f2 0f 5e c8          	divsd  xmm1,xmm0
   14031a011:	48 2b c7             	sub    rax,rdi
   14031a014:	48 03 c2             	add    rax,rdx
   14031a017:	0f 2f f3             	comiss xmm6,xmm3
   14031a01a:	f2 41 0f 11 4c c6 30 	movsd  QWORD PTR [r14+rax*8+0x30],xmm1
   14031a021:	76 03                	jbe    0x14031a026
   14031a023:	0f 28 da             	movaps xmm3,xmm2
   14031a026:	48 83 c2 04          	add    rdx,0x4
   14031a02a:	48 83 c1 10          	add    rcx,0x10
   14031a02e:	49 3b d0             	cmp    rdx,r8
   14031a031:	0f 8c b9 fe ff ff    	jl     0x140319ef0
   14031a037:	48 3b d5             	cmp    rdx,rbp
   14031a03a:	7d 63                	jge    0x14031a09f
   14031a03c:	48 8b c2             	mov    rax,rdx
   14031a03f:	49 2b c2             	sub    rax,r10
   14031a042:	49 8d 0c 81          	lea    rcx,[r9+rax*4]
   14031a046:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]
   14031a04a:	0f 2e d6             	ucomiss xmm2,xmm6
   14031a04d:	7a 02                	jp     0x14031a051
   14031a04f:	74 42                	je     0x14031a093
   14031a051:	f3 0f 10 41 04       	movss  xmm0,DWORD PTR [rcx+0x4]
   14031a056:	0f 2e c6             	ucomiss xmm0,xmm6
   14031a059:	7a 02                	jp     0x14031a05d
   14031a05b:	74 36                	je     0x14031a093
   14031a05d:	8b 05 45 01 67 00    	mov    eax,DWORD PTR [rip+0x670145]        # 0x14098a1a8

   14031a063:	f3 0f 5c c2          	subss  xmm0,xmm2

   14031a067:	0f 5a c8             	cvtps2pd xmm1,xmm0

   14031a06a:	0f 57 c0             	xorps  xmm0,xmm0

   14031a06d:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   14031a072:	f2 0f 59 cf          	mulsd  xmm1,xmm7

   14031a076:	48 6b c3 46          	imul   rax,rbx,0x46

   14031a07a:	f2 0f 5e c8          	divsd  xmm1,xmm0

   14031a07e:	48 2b c7             	sub    rax,rdi

   14031a081:	48 03 c2             	add    rax,rdx

   14031a084:	0f 2f f3             	comiss xmm6,xmm3

   14031a087:	f2 41 0f 11 4c c6 18 	movsd  QWORD PTR [r14+rax*8+0x18],xmm1

   14031a08e:	76 03                	jbe    0x14031a093

   14031a090:	0f 28 da             	movaps xmm3,xmm2

   14031a093:	48 ff c2             	inc    rdx

   14031a096:	48 83 c1 04          	add    rcx,0x4

   14031a09a:	48 3b d5             	cmp    rdx,rbp

   14031a1fe:	5e                   	pop    rsi
   14031a1ff:	5d                   	pop    rbp
   14031a200:	5b                   	pop    rbx
   14031a201:	c3                   	ret
   14031a202:	cc                   	int3
   14031a203:	cc                   	int3
   14031a204:	cc                   	int3
   14031a205:	cc                   	int3
   14031a206:	cc                   	int3
   14031a207:	cc                   	int3
   14031a208:	cc                   	int3
   14031a209:	cc                   	int3
   14031a20a:	cc                   	int3
   14031a20b:	cc                   	int3
   14031a20c:	cc                   	int3
   14031a20d:	cc                   	int3
   14031a20e:	cc                   	int3
   14031a20f:	cc                   	int3
   14031a210:	0f 57 c0             	xorps  xmm0,xmm0
   14031a213:	4c 8b c9             	mov    r9,rcx
   14031a216:	0f 2e c8             	ucomiss xmm1,xmm0
   14031a219:	7a 05                	jp     0x14031a220
   14031a21b:	75 03                	jne    0x14031a220
   14031a21d:	33 c0                	xor    eax,eax
   14031a21f:	c3                   	ret
   14031a220:	8b 05 2e ff 66 00    	mov    eax,DWORD PTR [rip+0x66ff2e]        # 0x14098a154

   14031a226:	0f 57 c0             	xorps  xmm0,xmm0

   14031a229:	f3 0f 10 25 d7 d6 38 	movss  xmm4,DWORD PTR [rip+0x38d6d7]        # 0x1406a7908

   14031a230:	00 

   14031a231:	b9 01 00 00 00       	mov    ecx,0x1

   14031a236:	f3 0f 10 1d aa 3e 37 	movss  xmm3,DWORD PTR [rip+0x373eaa]        # 0x14068e0e8

   14031a23d:	00 

   14031a23e:	0f 57 d2             	xorps  xmm2,xmm2

   14031a241:	45 84 c0             	test   r8b,r8b

   14031a244:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax

   14031a249:	b8 28 00 00 00       	mov    eax,0x28

   14031a24e:	0f 45 c1             	cmovne eax,ecx

   14031a251:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14031a256:	f3 0f 59 c2          	mulss  xmm0,xmm2

   14031a25a:	f3 0f 5e c1          	divss  xmm0,xmm1

   14031a25e:	f3 0f 58 c4          	addss  xmm0,xmm4

   14031a262:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0

   14031a292:	00 
   14031a293:	45 84 c0             	test   r8b,r8b
   14031a296:	74 20                	je     0x14031a2b8
   14031a298:	84 c9                	test   cl,cl
   14031a29a:	74 0e                	je     0x14031a2aa
   14031a29c:	f3 0f 10 05 fc 5e 53 	movss  xmm0,DWORD PTR [rip+0x535efc]        # 0x1408501a0
   14031a2a3:	00 
   14031a2a4:	f3 0f 59 c3          	mulss  xmm0,xmm3
   14031a2a8:	eb 2c                	jmp    0x14031a2d6
   14031a2aa:	f3 0f 10 05 7e 5d 53 	movss  xmm0,DWORD PTR [rip+0x535d7e]        # 0x140850030
   14031a2b1:	00 
   14031a2b2:	f3 0f 59 c3          	mulss  xmm0,xmm3
   14031a2b6:	eb 1e                	jmp    0x14031a2d6
   14031a2b8:	84 c9                	test   cl,cl
   14031a2ba:	74 0a                	je     0x14031a2c6
   14031a2bc:	f3 0f 10 05 dc 5e 53 	movss  xmm0,DWORD PTR [rip+0x535edc]        # 0x1408501a0
   14031a2c3:	00 
   14031a2c4:	eb 08                	jmp    0x14031a2ce
   14031a2c6:	f3 0f 10 05 62 5d 53 	movss  xmm0,DWORD PTR [rip+0x535d62]        # 0x140850030
   14031a2cd:	00 
   14031a2ce:	f3 0f 59 05 3a ce 37 	mulss  xmm0,DWORD PTR [rip+0x37ce3a]        # 0x140697110
   14031a2d5:	00 
   14031a2d6:	41 8b 49 28          	mov    ecx,DWORD PTR [r9+0x28]
   14031a2da:	f3 0f 59 d0          	mulss  xmm2,xmm0
   14031a2de:	8d 0c 4d 01 00 00 00 	lea    ecx,[rcx*2+0x1]
   14031a2e5:	0f af 0d bc fe 66 00 	imul   ecx,DWORD PTR [rip+0x66febc]        # 0x14098a1a8

   14031a2ec:	f3 0f 58 d4          	addss  xmm2,xmm4

   14031a2f0:	f3 48 0f 2c d2       	cvttss2si rdx,xmm2

   14031a2f5:	3b ca                	cmp    ecx,edx

   14031a2f7:	0f 43 ca             	cmovae ecx,edx

   14031a2fa:	3b c8                	cmp    ecx,eax

   14031a2fc:	0f 42 c1             	cmovb  eax,ecx

   14031a2ff:	c3                   	ret

   14031a300:	cc                   	int3

   14031a301:	cc                   	int3

   14031a302:	cc                   	int3

   14031a303:	cc                   	int3

   14031a304:	cc                   	int3

   14031a305:	cc                   	int3

   14031a306:	cc                   	int3

   14031a307:	cc                   	int3

   14031a308:	cc                   	int3

   14031a303:	cc                   	int3
   14031a304:	cc                   	int3
   14031a305:	cc                   	int3
   14031a306:	cc                   	int3
   14031a307:	cc                   	int3
   14031a308:	cc                   	int3
   14031a309:	cc                   	int3
   14031a30a:	cc                   	int3
   14031a30b:	cc                   	int3
   14031a30c:	cc                   	int3
   14031a30d:	cc                   	int3
   14031a30e:	cc                   	int3
   14031a30f:	cc                   	int3
   14031a310:	40 53                	rex push rbx
   14031a312:	48 83 ec 40          	sub    rsp,0x40
   14031a316:	0f b6 44 24 78       	movzx  eax,BYTE PTR [rsp+0x78]
   14031a31b:	49 8b d9             	mov    rbx,r9
   14031a31e:	88 44 24 28          	mov    BYTE PTR [rsp+0x28],al
   14031a322:	4c 8d 4c 24 68       	lea    r9,[rsp+0x68]
   14031a327:	48 8d 44 24 30       	lea    rax,[rsp+0x30]
   14031a32c:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14031a331:	e8 3a 00 00 00       	call   0x14031a370
   14031a336:	8b 44 24 68          	mov    eax,DWORD PTR [rsp+0x68]
   14031a33a:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]
   14031a33f:	99                   	cdq
   14031a340:	f7 3d 62 fe 66 00    	idiv   DWORD PTR [rip+0x66fe62]        # 0x14098a1a8

   14031a346:	89 03                	mov    DWORD PTR [rbx],eax

   14031a348:	8b 44 24 30          	mov    eax,DWORD PTR [rsp+0x30]

   14031a34c:	ff c8                	dec    eax

   14031a307:	cc                   	int3
   14031a308:	cc                   	int3
   14031a309:	cc                   	int3
   14031a30a:	cc                   	int3
   14031a30b:	cc                   	int3
   14031a30c:	cc                   	int3
   14031a30d:	cc                   	int3
   14031a30e:	cc                   	int3
   14031a30f:	cc                   	int3
   14031a310:	40 53                	rex push rbx
   14031a312:	48 83 ec 40          	sub    rsp,0x40
   14031a316:	0f b6 44 24 78       	movzx  eax,BYTE PTR [rsp+0x78]
   14031a31b:	49 8b d9             	mov    rbx,r9
   14031a31e:	88 44 24 28          	mov    BYTE PTR [rsp+0x28],al
   14031a322:	4c 8d 4c 24 68       	lea    r9,[rsp+0x68]
   14031a327:	48 8d 44 24 30       	lea    rax,[rsp+0x30]
   14031a32c:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14031a331:	e8 3a 00 00 00       	call   0x14031a370
   14031a336:	8b 44 24 68          	mov    eax,DWORD PTR [rsp+0x68]
   14031a33a:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]
   14031a33f:	99                   	cdq
   14031a340:	f7 3d 62 fe 66 00    	idiv   DWORD PTR [rip+0x66fe62]        # 0x14098a1a8
   14031a346:	89 03                	mov    DWORD PTR [rbx],eax
   14031a348:	8b 44 24 30          	mov    eax,DWORD PTR [rsp+0x30]
   14031a34c:	ff c8                	dec    eax
   14031a34e:	03 05 54 fe 66 00    	add    eax,DWORD PTR [rip+0x66fe54]        # 0x14098a1a8

   14031a354:	99                   	cdq

   14031a309:	cc                   	int3
   14031a30a:	cc                   	int3
   14031a30b:	cc                   	int3
   14031a30c:	cc                   	int3
   14031a30d:	cc                   	int3
   14031a30e:	cc                   	int3
   14031a30f:	cc                   	int3
   14031a310:	40 53                	rex push rbx
   14031a312:	48 83 ec 40          	sub    rsp,0x40
   14031a316:	0f b6 44 24 78       	movzx  eax,BYTE PTR [rsp+0x78]
   14031a31b:	49 8b d9             	mov    rbx,r9
   14031a31e:	88 44 24 28          	mov    BYTE PTR [rsp+0x28],al
   14031a322:	4c 8d 4c 24 68       	lea    r9,[rsp+0x68]
   14031a327:	48 8d 44 24 30       	lea    rax,[rsp+0x30]
   14031a32c:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14031a331:	e8 3a 00 00 00       	call   0x14031a370
   14031a336:	8b 44 24 68          	mov    eax,DWORD PTR [rsp+0x68]
   14031a33a:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]
   14031a33f:	99                   	cdq
   14031a340:	f7 3d 62 fe 66 00    	idiv   DWORD PTR [rip+0x66fe62]        # 0x14098a1a8
   14031a346:	89 03                	mov    DWORD PTR [rbx],eax
   14031a348:	8b 44 24 30          	mov    eax,DWORD PTR [rsp+0x30]
   14031a34c:	ff c8                	dec    eax
   14031a34e:	03 05 54 fe 66 00    	add    eax,DWORD PTR [rip+0x66fe54]        # 0x14098a1a8
   14031a354:	99                   	cdq
   14031a355:	f7 3d 4d fe 66 00    	idiv   DWORD PTR [rip+0x66fe4d]        # 0x14098a1a8

   14031a35b:	89 01                	mov    DWORD PTR [rcx],eax

   14031a35d:	48 83 c4 40          	add    rsp,0x40

   14031a361:	5b                   	pop    rbx

   14031a362:	c3                   	ret

   14031a363:	cc                   	int3

   14031a364:	cc                   	int3

   14031a365:	cc                   	int3

   14031a366:	cc                   	int3

   14031a367:	cc                   	int3

   14031a368:	cc                   	int3

   14031a369:	cc                   	int3

   14031a36a:	cc                   	int3

   14031a36b:	cc                   	int3

   14031a36c:	cc                   	int3

   14031a36d:	cc                   	int3

   14031a36e:	cc                   	int3

   14031a340:	f7 3d 62 fe 66 00    	idiv   DWORD PTR [rip+0x66fe62]        # 0x14098a1a8
   14031a346:	89 03                	mov    DWORD PTR [rbx],eax
   14031a348:	8b 44 24 30          	mov    eax,DWORD PTR [rsp+0x30]
   14031a34c:	ff c8                	dec    eax
   14031a34e:	03 05 54 fe 66 00    	add    eax,DWORD PTR [rip+0x66fe54]        # 0x14098a1a8
   14031a354:	99                   	cdq
   14031a355:	f7 3d 4d fe 66 00    	idiv   DWORD PTR [rip+0x66fe4d]        # 0x14098a1a8
   14031a35b:	89 01                	mov    DWORD PTR [rcx],eax
   14031a35d:	48 83 c4 40          	add    rsp,0x40
   14031a361:	5b                   	pop    rbx
   14031a362:	c3                   	ret
   14031a363:	cc                   	int3
   14031a364:	cc                   	int3
   14031a365:	cc                   	int3
   14031a366:	cc                   	int3
   14031a367:	cc                   	int3
   14031a368:	cc                   	int3
   14031a369:	cc                   	int3
   14031a36a:	cc                   	int3
   14031a36b:	cc                   	int3
   14031a36c:	cc                   	int3
   14031a36d:	cc                   	int3
   14031a36e:	cc                   	int3
   14031a36f:	cc                   	int3
   14031a370:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14031a375:	8b 15 2d fe 66 00    	mov    edx,DWORD PTR [rip+0x66fe2d]        # 0x14098a1a8

   14031a37b:	0f 28 d1             	movaps xmm2,xmm1

   14031a37e:	44 8b d2             	mov    r10d,edx

   14031a381:	0f 57 c0             	xorps  xmm0,xmm0

   14031a384:	45 0f af d0          	imul   r10d,r8d

   14031a388:	33 db                	xor    ebx,ebx

   14031a38a:	0f 2e d0             	ucomiss xmm2,xmm0

   14031a38d:	4c 8b d9             	mov    r11,rcx

   14031a390:	7a 0a                	jp     0x14031a39c

   14031a392:	75 08                	jne    0x14031a39c

   14031a394:	44 8b c3             	mov    r8d,ebx

   14031a397:	e9 e4 00 00 00       	jmp    0x14031a480

   14031a364:	cc                   	int3
   14031a365:	cc                   	int3
   14031a366:	cc                   	int3
   14031a367:	cc                   	int3
   14031a368:	cc                   	int3
   14031a369:	cc                   	int3
   14031a36a:	cc                   	int3
   14031a36b:	cc                   	int3
   14031a36c:	cc                   	int3
   14031a36d:	cc                   	int3
   14031a36e:	cc                   	int3
   14031a36f:	cc                   	int3
   14031a370:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14031a375:	8b 15 2d fe 66 00    	mov    edx,DWORD PTR [rip+0x66fe2d]        # 0x14098a1a8
   14031a37b:	0f 28 d1             	movaps xmm2,xmm1
   14031a37e:	44 8b d2             	mov    r10d,edx
   14031a381:	0f 57 c0             	xorps  xmm0,xmm0
   14031a384:	45 0f af d0          	imul   r10d,r8d
   14031a388:	33 db                	xor    ebx,ebx
   14031a38a:	0f 2e d0             	ucomiss xmm2,xmm0
   14031a38d:	4c 8b d9             	mov    r11,rcx
   14031a390:	7a 0a                	jp     0x14031a39c
   14031a392:	75 08                	jne    0x14031a39c
   14031a394:	44 8b c3             	mov    r8d,ebx
   14031a397:	e9 e4 00 00 00       	jmp    0x14031a480
   14031a39c:	8b 05 b2 fd 66 00    	mov    eax,DWORD PTR [rip+0x66fdb2]        # 0x14098a154

   14031a3a2:	0f 57 c0             	xorps  xmm0,xmm0

   14031a3a5:	0f b6 4c 24 30       	movzx  ecx,BYTE PTR [rsp+0x30]

   14031a3aa:	0f 57 c9             	xorps  xmm1,xmm1

   14031a3ad:	f3 0f 10 25 53 d5 38 	movss  xmm4,DWORD PTR [rip+0x38d553]        # 0x1406a7908

   14031a3b4:	00 

   14031a3b5:	84 c9                	test   cl,cl

   14031a3b7:	f3 0f 10 1d 29 3d 37 	movss  xmm3,DWORD PTR [rip+0x373d29]        # 0x14068e0e8

   14031a3be:	00 

   14031a3bf:	41 b8 01 00 00 00    	mov    r8d,0x1

   14031a3c5:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   14031a3ca:	b8 28 00 00 00       	mov    eax,0x28

   14031a3cf:	41 0f 45 c0          	cmovne eax,r8d

   14031a3d3:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14031a3d8:	f3 0f 59 c1          	mulss  xmm0,xmm1

   14031a3dc:	f3 0f 5e c2          	divss  xmm0,xmm2

   14031a3e0:	f3 0f 58 c4          	addss  xmm0,xmm4

   14031a46f:	f3 48 0f 2c c9       	cvttss2si rcx,xmm1
   14031a474:	3b c1                	cmp    eax,ecx
   14031a476:	0f 43 c1             	cmovae eax,ecx
   14031a479:	41 3b c0             	cmp    eax,r8d
   14031a47c:	44 0f 42 c0          	cmovb  r8d,eax
   14031a480:	8b c2                	mov    eax,edx
   14031a482:	99                   	cdq
   14031a483:	2b c2                	sub    eax,edx
   14031a485:	d1 f8                	sar    eax,1
   14031a487:	8b c8                	mov    ecx,eax
   14031a489:	41 8b c0             	mov    eax,r8d
   14031a48c:	99                   	cdq
   14031a48d:	2b c2                	sub    eax,edx
   14031a48f:	d1 f8                	sar    eax,1
   14031a491:	2b c8                	sub    ecx,eax
   14031a493:	42 8d 04 11          	lea    eax,[rcx+r10*1]
   14031a497:	85 c0                	test   eax,eax
   14031a499:	0f 4e c3             	cmovle eax,ebx
   14031a49c:	48 8b 5c 24 08       	mov    rbx,QWORD PTR [rsp+0x8]
   14031a4a1:	41 89 01             	mov    DWORD PTR [r9],eax
   14031a4a4:	44 03 c0             	add    r8d,eax
   14031a4a7:	41 8b 43 24          	mov    eax,DWORD PTR [r11+0x24]
   14031a4ab:	41 8b 4b 28          	mov    ecx,DWORD PTR [r11+0x28]
   14031a4af:	8d 14 48             	lea    edx,[rax+rcx*2]
   14031a4b2:	48 8b 44 24 28       	mov    rax,QWORD PTR [rsp+0x28]
   14031a4b7:	0f af 15 ea fc 66 00 	imul   edx,DWORD PTR [rip+0x66fcea]        # 0x14098a1a8

   14031a4be:	44 3b c2             	cmp    r8d,edx

   14031a4c1:	44 0f 4d c2          	cmovge r8d,edx

   14031a4c5:	44 89 00             	mov    DWORD PTR [rax],r8d

   14031a4c8:	c3                   	ret

   14031a4c9:	cc                   	int3

   14031a4ca:	cc                   	int3

   14031a4cb:	cc                   	int3

   14031a4cc:	cc                   	int3

   14031a4cd:	cc                   	int3

   14031a4ce:	cc                   	int3

   14031a4cf:	cc                   	int3

   14031a4d0:	48 8b c4             	mov    rax,rsp

   14031a4d3:	48 83 ec 68          	sub    rsp,0x68

   14031a4d7:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6

   14031a4db:	45 33 db             	xor    r11d,r11d

   14031a4de:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7

   14031a9b3:	cc                   	int3
   14031a9b4:	cc                   	int3
   14031a9b5:	cc                   	int3
   14031a9b6:	cc                   	int3
   14031a9b7:	cc                   	int3
   14031a9b8:	cc                   	int3
   14031a9b9:	cc                   	int3
   14031a9ba:	cc                   	int3
   14031a9bb:	cc                   	int3
   14031a9bc:	cc                   	int3
   14031a9bd:	cc                   	int3
   14031a9be:	cc                   	int3
   14031a9bf:	cc                   	int3
   14031a9c0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14031a9c5:	57                   	push   rdi
   14031a9c6:	48 83 ec 30          	sub    rsp,0x30
   14031a9ca:	0f b6 44 24 78       	movzx  eax,BYTE PTR [rsp+0x78]
   14031a9cf:	49 8b f9             	mov    rdi,r9
   14031a9d2:	48 8b 5c 24 60       	mov    rbx,QWORD PTR [rsp+0x60]
   14031a9d7:	88 44 24 28          	mov    BYTE PTR [rsp+0x28],al
   14031a9db:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx
   14031a9e0:	e8 8b f9 ff ff       	call   0x14031a370
   14031a9e5:	8b 07                	mov    eax,DWORD PTR [rdi]
   14031a9e7:	44 8b 03             	mov    r8d,DWORD PTR [rbx]
   14031a9ea:	99                   	cdq
   14031a9eb:	f7 3d b7 f7 66 00    	idiv   DWORD PTR [rip+0x66f7b7]        # 0x14098a1a8

   14031a9f1:	48 8b 4c 24 68       	mov    rcx,QWORD PTR [rsp+0x68]

   14031a9f6:	48 8b 5c 24 40       	mov    rbx,QWORD PTR [rsp+0x40]

   14031a9fb:	89 01                	mov    DWORD PTR [rcx],eax

   14031a9b7:	cc                   	int3
   14031a9b8:	cc                   	int3
   14031a9b9:	cc                   	int3
   14031a9ba:	cc                   	int3
   14031a9bb:	cc                   	int3
   14031a9bc:	cc                   	int3
   14031a9bd:	cc                   	int3
   14031a9be:	cc                   	int3
   14031a9bf:	cc                   	int3
   14031a9c0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14031a9c5:	57                   	push   rdi
   14031a9c6:	48 83 ec 30          	sub    rsp,0x30
   14031a9ca:	0f b6 44 24 78       	movzx  eax,BYTE PTR [rsp+0x78]
   14031a9cf:	49 8b f9             	mov    rdi,r9
   14031a9d2:	48 8b 5c 24 60       	mov    rbx,QWORD PTR [rsp+0x60]
   14031a9d7:	88 44 24 28          	mov    BYTE PTR [rsp+0x28],al
   14031a9db:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx
   14031a9e0:	e8 8b f9 ff ff       	call   0x14031a370
   14031a9e5:	8b 07                	mov    eax,DWORD PTR [rdi]
   14031a9e7:	44 8b 03             	mov    r8d,DWORD PTR [rbx]
   14031a9ea:	99                   	cdq
   14031a9eb:	f7 3d b7 f7 66 00    	idiv   DWORD PTR [rip+0x66f7b7]        # 0x14098a1a8
   14031a9f1:	48 8b 4c 24 68       	mov    rcx,QWORD PTR [rsp+0x68]
   14031a9f6:	48 8b 5c 24 40       	mov    rbx,QWORD PTR [rsp+0x40]
   14031a9fb:	89 01                	mov    DWORD PTR [rcx],eax
   14031a9fd:	8b 0d a5 f7 66 00    	mov    ecx,DWORD PTR [rip+0x66f7a5]        # 0x14098a1a8

   14031aa03:	8d 41 ff             	lea    eax,[rcx-0x1]

   14031aa06:	41 03 c0             	add    eax,r8d

   14031aa09:	99                   	cdq

   14031aa0a:	f7 f9                	idiv   ecx

   14031aa0c:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]

   14031aa11:	89 01                	mov    DWORD PTR [rcx],eax

   14031aa13:	48 83 c4 30          	add    rsp,0x30

   14031aa17:	5f                   	pop    rdi

   14031aa18:	c3                   	ret

   14031aa19:	cc                   	int3

   14031aa1a:	cc                   	int3

   14031aa1b:	cc                   	int3

   14031aa1c:	cc                   	int3

   14031aa1d:	cc                   	int3

   14031aa1e:	cc                   	int3

   14031aa1f:	cc                   	int3

   14031b845:	00 
   14031b846:	0f 57 c0             	xorps  xmm0,xmm0
   14031b849:	0f 29 70 c8          	movaps XMMWORD PTR [rax-0x38],xmm6
   14031b84d:	4c 8b d2             	mov    r10,rdx
   14031b850:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   14031b854:	49 8b d9             	mov    rbx,r9
   14031b857:	48 89 68 18          	mov    QWORD PTR [rax+0x18],rbp
   14031b85b:	48 89 70 20          	mov    QWORD PTR [rax+0x20],rsi
   14031b85f:	48 89 78 f8          	mov    QWORD PTR [rax-0x8],rdi
   14031b863:	4c 89 60 f0          	mov    QWORD PTR [rax-0x10],r12
   14031b867:	45 8b e0             	mov    r12d,r8d
   14031b86a:	4c 89 68 e8          	mov    QWORD PTR [rax-0x18],r13
   14031b86e:	4c 8b e9             	mov    r13,rcx
   14031b871:	4c 89 70 e0          	mov    QWORD PTR [rax-0x20],r14
   14031b875:	4c 89 78 d8          	mov    QWORD PTR [rax-0x28],r15
   14031b879:	44 0f 29 40 a8       	movaps XMMWORD PTR [rax-0x58],xmm8
   14031b87e:	44 0f 29 48 98       	movaps XMMWORD PTR [rax-0x68],xmm9
   14031b883:	44 0f 29 50 88       	movaps XMMWORD PTR [rax-0x78],xmm10
   14031b888:	f2 44 0f 10 15 67 49 	movsd  xmm10,QWORD PTR [rip+0x534967]        # 0x1408501f8
   14031b88f:	53 00 
   14031b891:	44 0f 29 98 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm11
   14031b898:	ff 
   14031b899:	41 0f 28 d2          	movaps xmm2,xmm10
   14031b89d:	44 0f 29 a0 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm12
   14031b8a4:	ff 
   14031b8a5:	8b 05 a9 e8 66 00    	mov    eax,DWORD PTR [rip+0x66e8a9]        # 0x14098a154

   14031b8ab:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   14031b8b0:	f2 0f 5e d0          	divsd  xmm2,xmm0

   14031b8b4:	75 1e                	jne    0x14031b8d4

   14031b8b6:	45 8b b1 18 02 00 00 	mov    r14d,DWORD PTR [r9+0x218]

   14031b8bd:	45 8b b9 1c 02 00 00 	mov    r15d,DWORD PTR [r9+0x21c]

   14031b8c4:	45 89 b1 20 02 00 00 	mov    DWORD PTR [r9+0x220],r14d

   14031b8cb:	45 89 b9 24 02 00 00 	mov    DWORD PTR [r9+0x224],r15d

   14031b8d2:	eb 0e                	jmp    0x14031b8e2

   14031b8d4:	45 8b b1 20 02 00 00 	mov    r14d,DWORD PTR [r9+0x220]

   14031b8db:	45 8b b9 24 02 00 00 	mov    r15d,DWORD PTR [r9+0x224]

   14031b8e2:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]

   14031b8e7:	49 8d 69 18          	lea    rbp,[r9+0x18]

   14031b8eb:	41 8b c6             	mov    eax,r14d

   14031b8ee:	45 0f 57 db          	xorps  xmm11,xmm11

   14031b8f2:	99                   	cdq

   14031b8f3:	45 0f 57 c0          	xorps  xmm8,xmm8

   14031b883:	44 0f 29 50 88       	movaps XMMWORD PTR [rax-0x78],xmm10
   14031b888:	f2 44 0f 10 15 67 49 	movsd  xmm10,QWORD PTR [rip+0x534967]        # 0x1408501f8
   14031b88f:	53 00 
   14031b891:	44 0f 29 98 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm11
   14031b898:	ff 
   14031b899:	41 0f 28 d2          	movaps xmm2,xmm10
   14031b89d:	44 0f 29 a0 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm12
   14031b8a4:	ff 
   14031b8a5:	8b 05 a9 e8 66 00    	mov    eax,DWORD PTR [rip+0x66e8a9]        # 0x14098a154
   14031b8ab:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   14031b8b0:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14031b8b4:	75 1e                	jne    0x14031b8d4
   14031b8b6:	45 8b b1 18 02 00 00 	mov    r14d,DWORD PTR [r9+0x218]
   14031b8bd:	45 8b b9 1c 02 00 00 	mov    r15d,DWORD PTR [r9+0x21c]
   14031b8c4:	45 89 b1 20 02 00 00 	mov    DWORD PTR [r9+0x220],r14d
   14031b8cb:	45 89 b9 24 02 00 00 	mov    DWORD PTR [r9+0x224],r15d
   14031b8d2:	eb 0e                	jmp    0x14031b8e2
   14031b8d4:	45 8b b1 20 02 00 00 	mov    r14d,DWORD PTR [r9+0x220]
   14031b8db:	45 8b b9 24 02 00 00 	mov    r15d,DWORD PTR [r9+0x224]
   14031b8e2:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   14031b8e7:	49 8d 69 18          	lea    rbp,[r9+0x18]
   14031b8eb:	41 8b c6             	mov    eax,r14d
   14031b8ee:	45 0f 57 db          	xorps  xmm11,xmm11
   14031b8f2:	99                   	cdq
   14031b8f3:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031b8f7:	f7 3d ab e8 66 00    	idiv   DWORD PTR [rip+0x66e8ab]        # 0x14098a1a8

   14031b8fd:	0f 5a c0             	cvtps2pd xmm0,xmm0

   14031b900:	41 8b c6             	mov    eax,r14d

   14031b903:	66 0f 6e ca          	movd   xmm1,edx

   14031b907:	99                   	cdq

   14031b908:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1

   14031b90c:	f2 0f 59 4d 00       	mulsd  xmm1,QWORD PTR [rbp+0x0]

   14031b911:	f2 0f 5e ca          	divsd  xmm1,xmm2

   14031b915:	f2 0f 58 c8          	addsd  xmm1,xmm0

   14031b919:	0f 57 c0             	xorps  xmm0,xmm0

   14031b91c:	66 44 0f 5a e1       	cvtpd2ps xmm12,xmm1

   14031b921:	41 0f 5a cc          	cvtps2pd xmm1,xmm12

   14031b925:	f3 45 0f 11 21       	movss  DWORD PTR [r9],xmm12

   14031b8bd:	45 8b b9 1c 02 00 00 	mov    r15d,DWORD PTR [r9+0x21c]
   14031b8c4:	45 89 b1 20 02 00 00 	mov    DWORD PTR [r9+0x220],r14d
   14031b8cb:	45 89 b9 24 02 00 00 	mov    DWORD PTR [r9+0x224],r15d
   14031b8d2:	eb 0e                	jmp    0x14031b8e2
   14031b8d4:	45 8b b1 20 02 00 00 	mov    r14d,DWORD PTR [r9+0x220]
   14031b8db:	45 8b b9 24 02 00 00 	mov    r15d,DWORD PTR [r9+0x224]
   14031b8e2:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   14031b8e7:	49 8d 69 18          	lea    rbp,[r9+0x18]
   14031b8eb:	41 8b c6             	mov    eax,r14d
   14031b8ee:	45 0f 57 db          	xorps  xmm11,xmm11
   14031b8f2:	99                   	cdq
   14031b8f3:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031b8f7:	f7 3d ab e8 66 00    	idiv   DWORD PTR [rip+0x66e8ab]        # 0x14098a1a8
   14031b8fd:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031b900:	41 8b c6             	mov    eax,r14d
   14031b903:	66 0f 6e ca          	movd   xmm1,edx
   14031b907:	99                   	cdq
   14031b908:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   14031b90c:	f2 0f 59 4d 00       	mulsd  xmm1,QWORD PTR [rbp+0x0]
   14031b911:	f2 0f 5e ca          	divsd  xmm1,xmm2
   14031b915:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031b919:	0f 57 c0             	xorps  xmm0,xmm0
   14031b91c:	66 44 0f 5a e1       	cvtpd2ps xmm12,xmm1
   14031b921:	41 0f 5a cc          	cvtps2pd xmm1,xmm12
   14031b925:	f3 45 0f 11 21       	movss  DWORD PTR [r9],xmm12
   14031b92a:	8b 0d 24 e8 66 00    	mov    ecx,DWORD PTR [rip+0x66e824]        # 0x14098a154

   14031b8c4:	45 89 b1 20 02 00 00 	mov    DWORD PTR [r9+0x220],r14d
   14031b8cb:	45 89 b9 24 02 00 00 	mov    DWORD PTR [r9+0x224],r15d
   14031b8d2:	eb 0e                	jmp    0x14031b8e2
   14031b8d4:	45 8b b1 20 02 00 00 	mov    r14d,DWORD PTR [r9+0x220]
   14031b8db:	45 8b b9 24 02 00 00 	mov    r15d,DWORD PTR [r9+0x224]
   14031b8e2:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   14031b8e7:	49 8d 69 18          	lea    rbp,[r9+0x18]
   14031b8eb:	41 8b c6             	mov    eax,r14d
   14031b8ee:	45 0f 57 db          	xorps  xmm11,xmm11
   14031b8f2:	99                   	cdq
   14031b8f3:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031b8f7:	f7 3d ab e8 66 00    	idiv   DWORD PTR [rip+0x66e8ab]        # 0x14098a1a8
   14031b8fd:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031b900:	41 8b c6             	mov    eax,r14d
   14031b903:	66 0f 6e ca          	movd   xmm1,edx
   14031b907:	99                   	cdq
   14031b908:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   14031b90c:	f2 0f 59 4d 00       	mulsd  xmm1,QWORD PTR [rbp+0x0]
   14031b911:	f2 0f 5e ca          	divsd  xmm1,xmm2
   14031b915:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031b919:	0f 57 c0             	xorps  xmm0,xmm0
   14031b91c:	66 44 0f 5a e1       	cvtpd2ps xmm12,xmm1
   14031b921:	41 0f 5a cc          	cvtps2pd xmm1,xmm12
   14031b925:	f3 45 0f 11 21       	movss  DWORD PTR [r9],xmm12
   14031b92a:	8b 0d 24 e8 66 00    	mov    ecx,DWORD PTR [rip+0x66e824]        # 0x14098a154
   14031b930:	8b 3d 72 e8 66 00    	mov    edi,DWORD PTR [rip+0x66e872]        # 0x14098a1a8

   14031b936:	f2 41 0f 59 ca       	mulsd  xmm1,xmm10

   14031b93b:	f2 48 0f 2a c1       	cvtsi2sd xmm0,rcx

   14031b940:	41 8b cc             	mov    ecx,r12d

   14031b943:	f7 ff                	idiv   edi

   14031b945:	f2 0f 5e c8          	divsd  xmm1,xmm0

   14031b949:	2b c8                	sub    ecx,eax

   14031b94b:	48 63 f1             	movsxd rsi,ecx

   14031b94e:	33 c9                	xor    ecx,ecx

   14031b950:	66 0f 5a d1          	cvtpd2ps xmm2,xmm1

   14031b954:	48 83 fe 04          	cmp    rsi,0x4

   14031b958:	0f 8c 10 01 00 00    	jl     0x14031ba6e

   14031b95e:	48 8d 6e fd          	lea    rbp,[rsi-0x3]

   14031b962:	8b c7                	mov    eax,edi

   14031b964:	48 85 c9             	test   rcx,rcx

   14031b967:	75 06                	jne    0x14031b96f

   14031b969:	85 d2                	test   edx,edx

   14031bdcc:	48 81 c4 18 01 00 00 	add    rsp,0x118
   14031bdd3:	c3                   	ret
   14031bdd4:	cc                   	int3
   14031bdd5:	cc                   	int3
   14031bdd6:	cc                   	int3
   14031bdd7:	cc                   	int3
   14031bdd8:	cc                   	int3
   14031bdd9:	cc                   	int3
   14031bdda:	cc                   	int3
   14031bddb:	cc                   	int3
   14031bddc:	cc                   	int3
   14031bddd:	cc                   	int3
   14031bdde:	cc                   	int3
   14031bddf:	cc                   	int3
   14031bde0:	40 53                	rex push rbx
   14031bde2:	55                   	push   rbp
   14031bde3:	56                   	push   rsi
   14031bde4:	57                   	push   rdi
   14031bde5:	41 54                	push   r12
   14031bde7:	41 55                	push   r13
   14031bde9:	41 56                	push   r14
   14031bdeb:	41 57                	push   r15
   14031bded:	48 81 ec 88 00 00 00 	sub    rsp,0x88
   14031bdf4:	44 8b 52 0c          	mov    r10d,DWORD PTR [rdx+0xc]
   14031bdf8:	45 33 e4             	xor    r12d,r12d
   14031bdfb:	44 8b 1d a6 e3 66 00 	mov    r11d,DWORD PTR [rip+0x66e3a6]        # 0x14098a1a8

   14031be02:	48 8b ea             	mov    rbp,rdx

   14031be05:	f3 0f 10 25 97 52 69 	movss  xmm4,DWORD PTR [rip+0x14695297]        # 0x1549b10a4

   14031be0c:	14 

   14031be0d:	48 8b f1             	mov    rsi,rcx

   14031bdd7:	cc                   	int3
   14031bdd8:	cc                   	int3
   14031bdd9:	cc                   	int3
   14031bdda:	cc                   	int3
   14031bddb:	cc                   	int3
   14031bddc:	cc                   	int3
   14031bddd:	cc                   	int3
   14031bdde:	cc                   	int3
   14031bddf:	cc                   	int3
   14031bde0:	40 53                	rex push rbx
   14031bde2:	55                   	push   rbp
   14031bde3:	56                   	push   rsi
   14031bde4:	57                   	push   rdi
   14031bde5:	41 54                	push   r12
   14031bde7:	41 55                	push   r13
   14031bde9:	41 56                	push   r14
   14031bdeb:	41 57                	push   r15
   14031bded:	48 81 ec 88 00 00 00 	sub    rsp,0x88
   14031bdf4:	44 8b 52 0c          	mov    r10d,DWORD PTR [rdx+0xc]
   14031bdf8:	45 33 e4             	xor    r12d,r12d
   14031bdfb:	44 8b 1d a6 e3 66 00 	mov    r11d,DWORD PTR [rip+0x66e3a6]        # 0x14098a1a8
   14031be02:	48 8b ea             	mov    rbp,rdx
   14031be05:	f3 0f 10 25 97 52 69 	movss  xmm4,DWORD PTR [rip+0x14695297]        # 0x1549b10a4
   14031be0c:	14 
   14031be0d:	48 8b f1             	mov    rsi,rcx
   14031be10:	8b 1d 3e e3 66 00    	mov    ebx,DWORD PTR [rip+0x66e33e]        # 0x14098a154

   14031be16:	f3 0f 10 2d da a2 38 	movss  xmm5,DWORD PTR [rip+0x38a2da]        # 0x1406a60f8

   14031be1d:	00 

   14031be1e:	f3 0f 10 15 e2 ba 38 	movss  xmm2,DWORD PTR [rip+0x38bae2]        # 0x1406a7908

   14031be25:	00 

   14031be26:	f3 0f 10 1d 72 43 53 	movss  xmm3,DWORD PTR [rip+0x534372]        # 0x1408501a0

   14031be2d:	00 

   14031be2e:	0f 29 74 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm6

   14031be33:	f3 0f 10 35 ad 22 37 	movss  xmm6,DWORD PTR [rip+0x3722ad]        # 0x14068e0e8

   14031be3a:	00 

   14031be3b:	0f 29 7c 24 60       	movaps XMMWORD PTR [rsp+0x60],xmm7

   14031be40:	f3 0f 10 3d c8 b2 37 	movss  xmm7,DWORD PTR [rip+0x37b2c8]        # 0x140697110

   14031be47:	00 

   14031be48:	44 0f 29 44 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm8

   14031be4e:	45 0f 57 c0          	xorps  xmm8,xmm8

   14031be52:	45 0f af d3          	imul   r10d,r11d

   14031be56:	41 0f 2e e0          	ucomiss xmm4,xmm8

   14031c315:	33 c9                	xor    ecx,ecx
   14031c317:	8b f9                	mov    edi,ecx
   14031c319:	39 8e c0 00 00 00    	cmp    DWORD PTR [rsi+0xc0],ecx
   14031c31f:	0f 86 39 01 00 00    	jbe    0x14031c45e
   14031c325:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   14031c32c:	85 ff                	test   edi,edi
   14031c32e:	75 15                	jne    0x14031c345
   14031c330:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   14031c334:	48 8b d9             	mov    rbx,rcx
   14031c337:	41 0f 2e c0          	ucomiss xmm0,xmm8
   14031c33b:	7a 0a                	jp     0x14031c347
   14031c33d:	0f 84 08 01 00 00    	je     0x14031c44b
   14031c343:	eb 02                	jmp    0x14031c347
   14031c345:	8b df                	mov    ebx,edi
   14031c347:	4c 8b 8d 18 06 00 00 	mov    r9,QWORD PTR [rbp+0x618]
   14031c34e:	4c 8b 85 10 06 00 00 	mov    r8,QWORD PTR [rbp+0x610]
   14031c355:	48 8b 8d 08 06 00 00 	mov    rcx,QWORD PTR [rbp+0x608]
   14031c35c:	48 c1 e3 06          	shl    rbx,0x6
   14031c360:	4c 89 74 24 20       	mov    QWORD PTR [rsp+0x20],r14
   14031c365:	48 8d 14 18          	lea    rdx,[rax+rbx*1]
   14031c369:	e8 a2 be 00 00       	call   0x140328210
   14031c36e:	4c 8b 86 c8 00 00 00 	mov    r8,QWORD PTR [rsi+0xc8]
   14031c375:	f3 42 0f 10 44 03 08 	movss  xmm0,DWORD PTR [rbx+r8*1+0x8]
   14031c37c:	41 0f 2f c0          	comiss xmm0,xmm8
   14031c380:	76 1f                	jbe    0x14031c3a1
   14031c382:	8b 05 cc dd 66 00    	mov    eax,DWORD PTR [rip+0x66ddcc]        # 0x14098a154

   14031c388:	0f 57 c0             	xorps  xmm0,xmm0

   14031c38b:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14031c390:	f3 0f 59 c7          	mulss  xmm0,xmm7

   14031c394:	42 0f 2f 44 03 0c    	comiss xmm0,DWORD PTR [rbx+r8*1+0xc]

   14031c39a:	76 05                	jbe    0x14031c3a1

   14031c39c:	0f 28 d6             	movaps xmm2,xmm6

   14031c39f:	eb 04                	jmp    0x14031c3a5

   14031c3a1:	41 0f 28 d1          	movaps xmm2,xmm9

   14031c3a5:	42 8b 4c 03 28       	mov    ecx,DWORD PTR [rbx+r8*1+0x28]

   14031c3aa:	41 8b c4             	mov    eax,r12d

   14031c3ad:	99                   	cdq

   14031c3ae:	42 f7 7c 03 18       	idiv   DWORD PTR [rbx+r8*1+0x18]

   14031c3b3:	44 8d 1c 09          	lea    r11d,[rcx+rcx*1]

   14031c3b7:	44 8b c8             	mov    r9d,eax

   14031c3ba:	8b c1                	mov    eax,ecx

   14031c3bc:	99                   	cdq

   14031c66d:	0f 28 d1             	movaps xmm2,xmm1
   14031c670:	eb 03                	jmp    0x14031c675
   14031c672:	0f 28 d0             	movaps xmm2,xmm0
   14031c675:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c67c:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c67f:	48 c1 e1 06          	shl    rcx,0x6
   14031c683:	0f 2f 54 01 0c       	comiss xmm2,DWORD PTR [rcx+rax*1+0xc]
   14031c688:	0f 87 94 06 00 00    	ja     0x14031cd22
   14031c68e:	0f 2f c1             	comiss xmm0,xmm1
   14031c691:	77 03                	ja     0x14031c696
   14031c693:	0f 28 c8             	movaps xmm1,xmm0
   14031c696:	f3 0f 10 44 01 08    	movss  xmm0,DWORD PTR [rcx+rax*1+0x8]
   14031c69c:	0f 2f c1             	comiss xmm0,xmm1
   14031c69f:	0f 87 40 06 00 00    	ja     0x14031cce5
   14031c6a5:	83 fe 01             	cmp    esi,0x1
   14031c6a8:	72 22                	jb     0x14031c6cc
   14031c6aa:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c6b1:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c6b4:	45 84 d2             	test   r10b,r10b
   14031c6b7:	49 8b d4             	mov    rdx,r12
   14031c6ba:	0f 94 c2             	sete   dl
   14031c6bd:	48 c1 e1 04          	shl    rcx,0x4
   14031c6c1:	48 03 ca             	add    rcx,rdx
   14031c6c4:	f3 0f 10 44 88 10    	movss  xmm0,DWORD PTR [rax+rcx*4+0x10]
   14031c6ca:	eb 17                	jmp    0x14031c6e3
   14031c6cc:	8b 05 82 da 66 00    	mov    eax,DWORD PTR [rip+0x66da82]        # 0x14098a154

   14031c6d2:	45 84 d2             	test   r10b,r10b

   14031c6d5:	0f 57 c0             	xorps  xmm0,xmm0

   14031c6d8:	49 8b d4             	mov    rdx,r12

   14031c6db:	0f 94 c2             	sete   dl

   14031c6de:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14031c6e3:	f3 0f 2c c0          	cvttss2si eax,xmm0

   14031c6e7:	89 44 24 58          	mov    DWORD PTR [rsp+0x58],eax

   14031c6eb:	83 fe 01             	cmp    esi,0x1

   14031c6ee:	72 18                	jb     0x14031c708

   14031c6f0:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]

   14031c6f7:	8d 4e ff             	lea    ecx,[rsi-0x1]

   14031c6fa:	48 c1 e1 04          	shl    rcx,0x4

   14031c6fe:	48 03 ca             	add    rcx,rdx

   14031c701:	44 8b 64 88 20       	mov    r12d,DWORD PTR [rax+rcx*4+0x20]

   14031c706:	eb 07                	jmp    0x14031c70f

   14031c6aa:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c6b1:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c6b4:	45 84 d2             	test   r10b,r10b
   14031c6b7:	49 8b d4             	mov    rdx,r12
   14031c6ba:	0f 94 c2             	sete   dl
   14031c6bd:	48 c1 e1 04          	shl    rcx,0x4
   14031c6c1:	48 03 ca             	add    rcx,rdx
   14031c6c4:	f3 0f 10 44 88 10    	movss  xmm0,DWORD PTR [rax+rcx*4+0x10]
   14031c6ca:	eb 17                	jmp    0x14031c6e3
   14031c6cc:	8b 05 82 da 66 00    	mov    eax,DWORD PTR [rip+0x66da82]        # 0x14098a154
   14031c6d2:	45 84 d2             	test   r10b,r10b
   14031c6d5:	0f 57 c0             	xorps  xmm0,xmm0
   14031c6d8:	49 8b d4             	mov    rdx,r12
   14031c6db:	0f 94 c2             	sete   dl
   14031c6de:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14031c6e3:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14031c6e7:	89 44 24 58          	mov    DWORD PTR [rsp+0x58],eax
   14031c6eb:	83 fe 01             	cmp    esi,0x1
   14031c6ee:	72 18                	jb     0x14031c708
   14031c6f0:	49 8b 85 c8 00 00 00 	mov    rax,QWORD PTR [r13+0xc8]
   14031c6f7:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14031c6fa:	48 c1 e1 04          	shl    rcx,0x4
   14031c6fe:	48 03 ca             	add    rcx,rdx
   14031c701:	44 8b 64 88 20       	mov    r12d,DWORD PTR [rax+rcx*4+0x20]
   14031c706:	eb 07                	jmp    0x14031c70f
   14031c708:	44 8b 25 99 da 66 00 	mov    r12d,DWORD PTR [rip+0x66da99]        # 0x14098a1a8

   14031c70f:	41 8b 45 24          	mov    eax,DWORD PTR [r13+0x24]

   14031c713:	45 8b fc             	mov    r15d,r12d

   14031c716:	41 8b 4d 28          	mov    ecx,DWORD PTR [r13+0x28]

   14031c71a:	44 0f af ff          	imul   r15d,edi

   14031c71e:	8d 2c 48             	lea    ebp,[rax+rcx*2]

   14031c721:	8b 05 81 d2 61 00    	mov    eax,DWORD PTR [rip+0x61d281]        # 0x1409399a8

   14031c727:	41 0f af ec          	imul   ebp,r12d

   14031c72b:	83 f8 03             	cmp    eax,0x3

   14031c72e:	40 0f 93 c7          	setae  dil

   14031c732:	40 0f b6 d7          	movzx  edx,dil

   14031c736:	3b d0                	cmp    edx,eax

   14031c738:	0f 83 1a 03 00 00    	jae    0x14031ca58

   14031c73e:	44 0f b6 b4 24 a0 01 	movzx  r14d,BYTE PTR [rsp+0x1a0]

   14031c745:	00 00 

   14031c747:	f3 0f 10 0d 59 b3 38 	movss  xmm1,DWORD PTR [rip+0x38b359]        # 0x1406a7aa8

   14031c74e:	00 

   14031c7c5:	0f 84 63 02 00 00    	je     0x14031ca2e
   14031c7cb:	44 0f 2f e0          	comiss xmm12,xmm0
   14031c7cf:	72 06                	jb     0x14031c7d7
   14031c7d1:	41 0f 28 fc          	movaps xmm7,xmm12
   14031c7d5:	eb 27                	jmp    0x14031c7fe
   14031c7d7:	f2 0f 10 0d 51 19 37 	movsd  xmm1,QWORD PTR [rip+0x371951]        # 0x14068e130
   14031c7de:	00 
   14031c7df:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c7e2:	f2 0f 5e 05 96 19 37 	divsd  xmm0,QWORD PTR [rip+0x371996]        # 0x14068e180
   14031c7e9:	00 
   14031c7ea:	e8 8b 45 30 00       	call   0x140620d7a
   14031c7ef:	0f 57 ff             	xorps  xmm7,xmm7
   14031c7f2:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   14031c7f6:	f3 0f 59 3d b2 19 37 	mulss  xmm7,DWORD PTR [rip+0x3719b2]        # 0x14068e1b0
   14031c7fd:	00 
   14031c7fe:	80 bc 24 c8 01 00 00 	cmp    BYTE PTR [rsp+0x1c8],0x0
   14031c805:	00 
   14031c806:	74 13                	je     0x14031c81b
   14031c808:	f3 41 0f 58 fa       	addss  xmm7,xmm10
   14031c80d:	f3 0f 2c c7          	cvttss2si eax,xmm7
   14031c811:	0f b7 c8             	movzx  ecx,ax
   14031c814:	66 0f 6e f9          	movd   xmm7,ecx
   14031c818:	0f 5b ff             	cvtdq2ps xmm7,xmm7
   14031c81b:	80 7c 24 51 00       	cmp    BYTE PTR [rsp+0x51],0x0
   14031c820:	0f 84 88 01 00 00    	je     0x14031c9ae
   14031c826:	8b 05 28 d9 66 00    	mov    eax,DWORD PTR [rip+0x66d928]        # 0x14098a154

   14031c82c:	0f 57 c0             	xorps  xmm0,xmm0

   14031c82f:	41 0f 28 f1          	movaps xmm6,xmm9

   14031c833:	f3 0f 59 35 a9 a9 37 	mulss  xmm6,DWORD PTR [rip+0x37a9a9]        # 0x1406971e4

   14031c83a:	00 

   14031c83b:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14031c840:	f3 0f 5e f0          	divss  xmm6,xmm0

   14031c844:	44 0f 2f f6          	comiss xmm14,xmm6

   14031c848:	76 0c                	jbe    0x14031c856

   14031c84a:	41 0f 2f f5          	comiss xmm6,xmm13

   14031c84e:	77 0a                	ja     0x14031c85a

   14031c850:	41 0f 28 f5          	movaps xmm6,xmm13

   14031c854:	eb 04                	jmp    0x14031c85a

   14031c856:	41 0f 28 f6          	movaps xmm6,xmm14

   14031c85a:	0f 28 c6             	movaps xmm0,xmm6

   14031c85d:	f3 0f 58 05 a3 b0 38 	addss  xmm0,DWORD PTR [rip+0x38b0a3]        # 0x1406a7908

   14031c864:	00 

   14031ee0b:	48 8b c8             	mov    rcx,rax
   14031ee0e:	e8 4d c7 2f 00       	call   0x14061b560
   14031ee13:	48 89 86 90 05 00 00 	mov    QWORD PTR [rsi+0x590],rax
   14031ee1a:	8b 43 24             	mov    eax,DWORD PTR [rbx+0x24]
   14031ee1d:	03 83 bc 00 00 00    	add    eax,DWORD PTR [rbx+0xbc]
   14031ee23:	8d 14 40             	lea    edx,[rax+rax*2]
   14031ee26:	b8 18 3c 00 00       	mov    eax,0x3c18
   14031ee2b:	c1 e2 05             	shl    edx,0x5
   14031ee2e:	48 f7 e2             	mul    rdx
   14031ee31:	48 0f 40 c7          	cmovo  rax,rdi
   14031ee35:	48 8b c8             	mov    rcx,rax
   14031ee38:	e8 23 c7 2f 00       	call   0x14061b560
   14031ee3d:	48 89 86 a8 05 00 00 	mov    QWORD PTR [rsi+0x5a8],rax
   14031ee44:	b8 02 00 00 00       	mov    eax,0x2
   14031ee49:	8b 53 24             	mov    edx,DWORD PTR [rbx+0x24]
   14031ee4c:	03 93 bc 00 00 00    	add    edx,DWORD PTR [rbx+0xbc]
   14031ee52:	48 f7 e2             	mul    rdx
   14031ee55:	48 0f 40 c7          	cmovo  rax,rdi
   14031ee59:	48 8b c8             	mov    rcx,rax
   14031ee5c:	e8 ff c6 2f 00       	call   0x14061b560
   14031ee61:	48 89 86 b0 05 00 00 	mov    QWORD PTR [rsi+0x5b0],rax
   14031ee68:	8b 43 24             	mov    eax,DWORD PTR [rbx+0x24]
   14031ee6b:	03 83 bc 00 00 00    	add    eax,DWORD PTR [rbx+0xbc]
   14031ee71:	69 c8 00 15 00 00    	imul   ecx,eax,0x1500
   14031ee77:	b8 00 0c 00 00       	mov    eax,0xc00
   14031ee7c:	3b 0d d2 b1 66 00    	cmp    ecx,DWORD PTR [rip+0x66b1d2]        # 0x14098a054

   14031ee0e:	e8 4d c7 2f 00       	call   0x14061b560
   14031ee13:	48 89 86 90 05 00 00 	mov    QWORD PTR [rsi+0x590],rax
   14031ee1a:	8b 43 24             	mov    eax,DWORD PTR [rbx+0x24]
   14031ee1d:	03 83 bc 00 00 00    	add    eax,DWORD PTR [rbx+0xbc]
   14031ee23:	8d 14 40             	lea    edx,[rax+rax*2]
   14031ee26:	b8 18 3c 00 00       	mov    eax,0x3c18
   14031ee2b:	c1 e2 05             	shl    edx,0x5
   14031ee2e:	48 f7 e2             	mul    rdx
   14031ee31:	48 0f 40 c7          	cmovo  rax,rdi
   14031ee35:	48 8b c8             	mov    rcx,rax
   14031ee38:	e8 23 c7 2f 00       	call   0x14061b560
   14031ee3d:	48 89 86 a8 05 00 00 	mov    QWORD PTR [rsi+0x5a8],rax
   14031ee44:	b8 02 00 00 00       	mov    eax,0x2
   14031ee49:	8b 53 24             	mov    edx,DWORD PTR [rbx+0x24]
   14031ee4c:	03 93 bc 00 00 00    	add    edx,DWORD PTR [rbx+0xbc]
   14031ee52:	48 f7 e2             	mul    rdx
   14031ee55:	48 0f 40 c7          	cmovo  rax,rdi
   14031ee59:	48 8b c8             	mov    rcx,rax
   14031ee5c:	e8 ff c6 2f 00       	call   0x14061b560
   14031ee61:	48 89 86 b0 05 00 00 	mov    QWORD PTR [rsi+0x5b0],rax
   14031ee68:	8b 43 24             	mov    eax,DWORD PTR [rbx+0x24]
   14031ee6b:	03 83 bc 00 00 00    	add    eax,DWORD PTR [rbx+0xbc]
   14031ee71:	69 c8 00 15 00 00    	imul   ecx,eax,0x1500
   14031ee77:	b8 00 0c 00 00       	mov    eax,0xc00
   14031ee7c:	3b 0d d2 b1 66 00    	cmp    ecx,DWORD PTR [rip+0x66b1d2]        # 0x14098a054
   14031ee82:	0f 42 0d cb b1 66 00 	cmovb  ecx,DWORD PTR [rip+0x66b1cb]        # 0x14098a054

   14031ee89:	3b c8                	cmp    ecx,eax

   14031ee8b:	72 0a                	jb     0x14031ee97

   14031ee8d:	8b c1                	mov    eax,ecx

   14031ee8f:	81 f9 00 02 00 00    	cmp    ecx,0x200

   14031ee95:	72 07                	jb     0x14031ee9e

   14031ee97:	3d 08 91 00 00       	cmp    eax,0x9108

   14031ee9c:	73 05                	jae    0x14031eea3

   14031ee9e:	b8 08 91 00 00       	mov    eax,0x9108

   14031eea3:	8b d8                	mov    ebx,eax

   14031eea5:	b8 04 00 00 00       	mov    eax,0x4

   14031eeaa:	48 f7 e3             	mul    rbx

   14031eead:	48 0f 40 c7          	cmovo  rax,rdi

   14031eeb1:	48 8b c8             	mov    rcx,rax

   14031eeb4:	e8 a7 c6 2f 00       	call   0x14061b560

   14031eeb9:	48 89 86 40 06 00 00 	mov    QWORD PTR [rsi+0x640],rax

   14031eec0:	b8 04 00 00 00       	mov    eax,0x4

   14031f59b:	cc                   	int3
   14031f59c:	cc                   	int3
   14031f59d:	cc                   	int3
   14031f59e:	cc                   	int3
   14031f59f:	cc                   	int3
   14031f5a0:	48 8b c4             	mov    rax,rsp
   14031f5a3:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   14031f5a7:	48 89 68 10          	mov    QWORD PTR [rax+0x10],rbp
   14031f5ab:	48 89 70 18          	mov    QWORD PTR [rax+0x18],rsi
   14031f5af:	57                   	push   rdi
   14031f5b0:	48 81 ec a0 00 00 00 	sub    rsp,0xa0
   14031f5b7:	f3 0f 10 05 b9 84 38 	movss  xmm0,DWORD PTR [rip+0x3884b9]        # 0x1406a7a78
   14031f5be:	00 
   14031f5bf:	0f 57 c9             	xorps  xmm1,xmm1
   14031f5c2:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6
   14031f5c6:	0f b6 f1             	movzx  esi,cl
   14031f5c9:	f3 0f 10 35 0b 0a 53 	movss  xmm6,DWORD PTR [rip+0x530a0b]        # 0x14084ffdc
   14031f5d0:	00 
   14031f5d1:	48 8b 0d 18 aa 66 00 	mov    rcx,QWORD PTR [rip+0x66aa18]        # 0x140989ff0
   14031f5d8:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7
   14031f5dc:	44 0f 29 40 c8       	movaps XMMWORD PTR [rax-0x38],xmm8
   14031f5e1:	44 0f 29 48 b8       	movaps XMMWORD PTR [rax-0x48],xmm9
   14031f5e6:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   14031f5eb:	44 0f 29 58 98       	movaps XMMWORD PTR [rax-0x68],xmm11
   14031f5f0:	44 0f 29 60 88       	movaps XMMWORD PTR [rax-0x78],xmm12
   14031f5f5:	8b 05 59 ab 66 00    	mov    eax,DWORD PTR [rip+0x66ab59]        # 0x14098a154

   14031f5fb:	f3 0f 11 05 a1 1a 69 	movss  DWORD PTR [rip+0x14691aa1],xmm0        # 0x1549b10a4

   14031f602:	14 

   14031f603:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   14031f608:	f3 0f 59 ce          	mulss  xmm1,xmm6

   14031f60c:	f3 0f 5d 0d e4 84 38 	minss  xmm1,DWORD PTR [rip+0x3884e4]        # 0x1406a7af8

   14031f613:	00 

   14031f614:	f3 0f 11 0d 8c 1a 69 	movss  DWORD PTR [rip+0x14691a8c],xmm1        # 0x1549b10a8

   14031f61b:	14 

   14031f61c:	48 85 c9             	test   rcx,rcx

   14031f61f:	74 05                	je     0x14031f626

   14031f621:	e8 3a 57 2f 00       	call   0x140614d60

   14031f626:	f3 0f 10 05 7e ab 66 	movss  xmm0,DWORD PTR [rip+0x66ab7e]        # 0x14098a1ac

   14031f62d:	00 

   14031f62e:	bf 01 00 00 00       	mov    edi,0x1

   14031f633:	f3 0f 59 05 9d 82 38 	mulss  xmm0,DWORD PTR [rip+0x38829d]        # 0x1406a78d8

   14031f63a:	00 

   14031f5e6:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   14031f5eb:	44 0f 29 58 98       	movaps XMMWORD PTR [rax-0x68],xmm11
   14031f5f0:	44 0f 29 60 88       	movaps XMMWORD PTR [rax-0x78],xmm12
   14031f5f5:	8b 05 59 ab 66 00    	mov    eax,DWORD PTR [rip+0x66ab59]        # 0x14098a154
   14031f5fb:	f3 0f 11 05 a1 1a 69 	movss  DWORD PTR [rip+0x14691aa1],xmm0        # 0x1549b10a4
   14031f602:	14 
   14031f603:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   14031f608:	f3 0f 59 ce          	mulss  xmm1,xmm6
   14031f60c:	f3 0f 5d 0d e4 84 38 	minss  xmm1,DWORD PTR [rip+0x3884e4]        # 0x1406a7af8
   14031f613:	00 
   14031f614:	f3 0f 11 0d 8c 1a 69 	movss  DWORD PTR [rip+0x14691a8c],xmm1        # 0x1549b10a8
   14031f61b:	14 
   14031f61c:	48 85 c9             	test   rcx,rcx
   14031f61f:	74 05                	je     0x14031f626
   14031f621:	e8 3a 57 2f 00       	call   0x140614d60
   14031f626:	f3 0f 10 05 7e ab 66 	movss  xmm0,DWORD PTR [rip+0x66ab7e]        # 0x14098a1ac
   14031f62d:	00 
   14031f62e:	bf 01 00 00 00       	mov    edi,0x1
   14031f633:	f3 0f 59 05 9d 82 38 	mulss  xmm0,DWORD PTR [rip+0x38829d]        # 0x1406a78d8
   14031f63a:	00 
   14031f63b:	8b cf                	mov    ecx,edi
   14031f63d:	f3 0f 58 c6          	addss  xmm0,xmm6
   14031f641:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14031f645:	3b c1                	cmp    eax,ecx
   14031f647:	0f 4f c8             	cmovg  ecx,eax
   14031f64a:	0f af 0d 57 ab 66 00 	imul   ecx,DWORD PTR [rip+0x66ab57]        # 0x14098a1a8

   14031f651:	03 c9                	add    ecx,ecx

   14031f653:	89 0d 93 a9 66 00    	mov    DWORD PTR [rip+0x66a993],ecx        # 0x140989fec

   14031f659:	e8 e2 59 2f 00       	call   0x140615040

   14031f65e:	8b 15 88 a9 66 00    	mov    edx,DWORD PTR [rip+0x66a988]        # 0x140989fec

   14031f664:	48 8b c8             	mov    rcx,rax

   14031f667:	48 89 05 82 a9 66 00 	mov    QWORD PTR [rip+0x66a982],rax        # 0x140989ff0

   14031f66e:	e8 1d 55 2f 00       	call   0x140614b90

   14031f60c:	f3 0f 5d 0d e4 84 38 	minss  xmm1,DWORD PTR [rip+0x3884e4]        # 0x1406a7af8
   14031f613:	00 
   14031f614:	f3 0f 11 0d 8c 1a 69 	movss  DWORD PTR [rip+0x14691a8c],xmm1        # 0x1549b10a8
   14031f61b:	14 
   14031f61c:	48 85 c9             	test   rcx,rcx
   14031f61f:	74 05                	je     0x14031f626
   14031f621:	e8 3a 57 2f 00       	call   0x140614d60
   14031f626:	f3 0f 10 05 7e ab 66 	movss  xmm0,DWORD PTR [rip+0x66ab7e]        # 0x14098a1ac
   14031f62d:	00 
   14031f62e:	bf 01 00 00 00       	mov    edi,0x1
   14031f633:	f3 0f 59 05 9d 82 38 	mulss  xmm0,DWORD PTR [rip+0x38829d]        # 0x1406a78d8
   14031f63a:	00 
   14031f63b:	8b cf                	mov    ecx,edi
   14031f63d:	f3 0f 58 c6          	addss  xmm0,xmm6
   14031f641:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14031f645:	3b c1                	cmp    eax,ecx
   14031f647:	0f 4f c8             	cmovg  ecx,eax
   14031f64a:	0f af 0d 57 ab 66 00 	imul   ecx,DWORD PTR [rip+0x66ab57]        # 0x14098a1a8
   14031f651:	03 c9                	add    ecx,ecx
   14031f653:	89 0d 93 a9 66 00    	mov    DWORD PTR [rip+0x66a993],ecx        # 0x140989fec
   14031f659:	e8 e2 59 2f 00       	call   0x140615040
   14031f65e:	8b 15 88 a9 66 00    	mov    edx,DWORD PTR [rip+0x66a988]        # 0x140989fec
   14031f664:	48 8b c8             	mov    rcx,rax
   14031f667:	48 89 05 82 a9 66 00 	mov    QWORD PTR [rip+0x66a982],rax        # 0x140989ff0
   14031f66e:	e8 1d 55 2f 00       	call   0x140614b90
   14031f673:	8b 1d db aa 66 00    	mov    ebx,DWORD PTR [rip+0x66aadb]        # 0x14098a154

   14031f679:	0f 57 db             	xorps  xmm3,xmm3

   14031f67c:	41 b8 02 00 00 00    	mov    r8d,0x2

   14031f682:	b8 04 00 00 00       	mov    eax,0x4

   14031f687:	41 8b c8             	mov    ecx,r8d

   14031f68a:	f3 48 0f 2a db       	cvtsi2ss xmm3,rbx

   14031f68f:	0f 28 c3             	movaps xmm0,xmm3

   14031f692:	f3 0f 5e 05 0a 7b 37 	divss  xmm0,DWORD PTR [rip+0x377b0a]        # 0x1406971a4

   14031f699:	00 

   14031f69a:	f3 0f 58 05 66 82 38 	addss  xmm0,DWORD PTR [rip+0x388266]        # 0x1406a7908

   14031f6a1:	00 

   14031f6a2:	f3 48 0f 2c d0       	cvttss2si rdx,xmm0

   14031f6a7:	3b c2                	cmp    eax,edx

   14031f6a9:	77 0c                	ja     0x14031f6b7

   14031f6ab:	44 8b c0             	mov    r8d,eax

   14031f6ae:	ff c1                	inc    ecx

   14031f6b0:	d1 c0                	rol    eax,1

   14031f653:	89 0d 93 a9 66 00    	mov    DWORD PTR [rip+0x66a993],ecx        # 0x140989fec
   14031f659:	e8 e2 59 2f 00       	call   0x140615040
   14031f65e:	8b 15 88 a9 66 00    	mov    edx,DWORD PTR [rip+0x66a988]        # 0x140989fec
   14031f664:	48 8b c8             	mov    rcx,rax
   14031f667:	48 89 05 82 a9 66 00 	mov    QWORD PTR [rip+0x66a982],rax        # 0x140989ff0
   14031f66e:	e8 1d 55 2f 00       	call   0x140614b90
   14031f673:	8b 1d db aa 66 00    	mov    ebx,DWORD PTR [rip+0x66aadb]        # 0x14098a154
   14031f679:	0f 57 db             	xorps  xmm3,xmm3
   14031f67c:	41 b8 02 00 00 00    	mov    r8d,0x2
   14031f682:	b8 04 00 00 00       	mov    eax,0x4
   14031f687:	41 8b c8             	mov    ecx,r8d
   14031f68a:	f3 48 0f 2a db       	cvtsi2ss xmm3,rbx
   14031f68f:	0f 28 c3             	movaps xmm0,xmm3
   14031f692:	f3 0f 5e 05 0a 7b 37 	divss  xmm0,DWORD PTR [rip+0x377b0a]        # 0x1406971a4
   14031f699:	00 
   14031f69a:	f3 0f 58 05 66 82 38 	addss  xmm0,DWORD PTR [rip+0x388266]        # 0x1406a7908
   14031f6a1:	00 
   14031f6a2:	f3 48 0f 2c d0       	cvttss2si rdx,xmm0
   14031f6a7:	3b c2                	cmp    eax,edx
   14031f6a9:	77 0c                	ja     0x14031f6b7
   14031f6ab:	44 8b c0             	mov    r8d,eax
   14031f6ae:	ff c1                	inc    ecx
   14031f6b0:	d1 c0                	rol    eax,1
   14031f6b2:	83 f9 10             	cmp    ecx,0x10
   14031f6b5:	72 f0                	jb     0x14031f6a7
   14031f6b7:	44 8b 0d ea aa 66 00 	mov    r9d,DWORD PTR [rip+0x66aaea]        # 0x14098a1a8

   14031f6be:	0f 57 c0             	xorps  xmm0,xmm0

   14031f6c1:	44 0f b6 15 48 a8 66 	movzx  r10d,BYTE PTR [rip+0x66a848]        # 0x140989f11

   14031f6c8:	00 

   14031f6c9:	0f 28 cb             	movaps xmm1,xmm3

   14031f6cc:	f3 44 0f 10 25 83 96 	movss  xmm12,DWORD PTR [rip+0x379683]        # 0x140698d58

   14031f6d3:	37 00 

   14031f6d5:	f3 44 0f 10 1d 32 7b 	movss  xmm11,DWORD PTR [rip+0x377b32]        # 0x140697210

   14031f6dc:	37 00 

   14031f6de:	f3 0f 59 ce          	mulss  xmm1,xmm6

   14031f6e2:	43 8d 0c 09          	lea    ecx,[r9+r9*1]

   14031f6e6:	41 8b c0             	mov    eax,r8d

   14031f68f:	0f 28 c3             	movaps xmm0,xmm3
   14031f692:	f3 0f 5e 05 0a 7b 37 	divss  xmm0,DWORD PTR [rip+0x377b0a]        # 0x1406971a4
   14031f699:	00 
   14031f69a:	f3 0f 58 05 66 82 38 	addss  xmm0,DWORD PTR [rip+0x388266]        # 0x1406a7908
   14031f6a1:	00 
   14031f6a2:	f3 48 0f 2c d0       	cvttss2si rdx,xmm0
   14031f6a7:	3b c2                	cmp    eax,edx
   14031f6a9:	77 0c                	ja     0x14031f6b7
   14031f6ab:	44 8b c0             	mov    r8d,eax
   14031f6ae:	ff c1                	inc    ecx
   14031f6b0:	d1 c0                	rol    eax,1
   14031f6b2:	83 f9 10             	cmp    ecx,0x10
   14031f6b5:	72 f0                	jb     0x14031f6a7
   14031f6b7:	44 8b 0d ea aa 66 00 	mov    r9d,DWORD PTR [rip+0x66aaea]        # 0x14098a1a8
   14031f6be:	0f 57 c0             	xorps  xmm0,xmm0
   14031f6c1:	44 0f b6 15 48 a8 66 	movzx  r10d,BYTE PTR [rip+0x66a848]        # 0x140989f11
   14031f6c8:	00 
   14031f6c9:	0f 28 cb             	movaps xmm1,xmm3
   14031f6cc:	f3 44 0f 10 25 83 96 	movss  xmm12,DWORD PTR [rip+0x379683]        # 0x140698d58
   14031f6d3:	37 00 
   14031f6d5:	f3 44 0f 10 1d 32 7b 	movss  xmm11,DWORD PTR [rip+0x377b32]        # 0x140697210
   14031f6dc:	37 00 
   14031f6de:	f3 0f 59 ce          	mulss  xmm1,xmm6
   14031f6e2:	43 8d 0c 09          	lea    ecx,[r9+r9*1]
   14031f6e6:	41 8b c0             	mov    eax,r8d
   14031f6e9:	44 89 05 64 a9 66 00 	mov    DWORD PTR [rip+0x66a964],r8d        # 0x14098a054

   14031f6f0:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14031f6f5:	f3 0f 5e c8          	divss  xmm1,xmm0

   14031f6f9:	f3 0f 10 05 a7 19 69 	movss  xmm0,DWORD PTR [rip+0x146919a7]        # 0x1549b10a8

   14031f700:	14 

   14031f701:	f3 0f 5e c1          	divss  xmm0,xmm1

   14031f705:	f3 0f 11 0d 5b 9f 61 	movss  DWORD PTR [rip+0x619f5b],xmm1        # 0x140939668

   14031f70c:	00 

   14031f70d:	f3 0f 58 05 57 7a 37 	addss  xmm0,DWORD PTR [rip+0x377a57]        # 0x14069716c

   14031f714:	00 

   14031f715:	f3 48 0f 2c c0       	cvttss2si rax,xmm0

   14031f71a:	0f 57 c0             	xorps  xmm0,xmm0

   14031f71d:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx

   14031f722:	41 3b c0             	cmp    eax,r8d

   14031f725:	41 0f 43 c0          	cmovae eax,r8d

   14031f729:	89 05 29 a9 66 00    	mov    DWORD PTR [rip+0x66a929],eax        # 0x14098a058

   14031f72f:	f3 0f 5e d8          	divss  xmm3,xmm0

   14031fa6e:	49 8b e3             	mov    rsp,r11
   14031fa71:	5f                   	pop    rdi
   14031fa72:	c3                   	ret
   14031fa73:	cc                   	int3
   14031fa74:	cc                   	int3
   14031fa75:	cc                   	int3
   14031fa76:	cc                   	int3
   14031fa77:	cc                   	int3
   14031fa78:	cc                   	int3
   14031fa79:	cc                   	int3
   14031fa7a:	cc                   	int3
   14031fa7b:	cc                   	int3
   14031fa7c:	cc                   	int3
   14031fa7d:	cc                   	int3
   14031fa7e:	cc                   	int3
   14031fa7f:	cc                   	int3
   14031fa80:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14031fa85:	80 3d 85 a4 66 00 00 	cmp    BYTE PTR [rip+0x66a485],0x0        # 0x140989f11
   14031fa8c:	41 b8 01 00 00 00    	mov    r8d,0x1
   14031fa92:	74 0a                	je     0x14031fa9e
   14031fa94:	f3 0f 10 05 74 77 37 	movss  xmm0,DWORD PTR [rip+0x377774]        # 0x140697210
   14031fa9b:	00 
   14031fa9c:	eb 08                	jmp    0x14031faa6
   14031fa9e:	f3 0f 10 05 b2 92 37 	movss  xmm0,DWORD PTR [rip+0x3792b2]        # 0x140698d58
   14031faa5:	00 
   14031faa6:	44 8b 0d a7 a6 66 00 	mov    r9d,DWORD PTR [rip+0x66a6a7]        # 0x14098a154

   14031faad:	b8 cd cc cc cc       	mov    eax,0xcccccccd

   14031fab2:	41 f7 e1             	mul    r9d

   14031fab5:	f3 48 0f 2c c8       	cvttss2si rcx,xmm0

   14031faba:	45 8b d1             	mov    r10d,r9d

   14031fabd:	41 d1 ea             	shr    r10d,1

   14031fac0:	44 8b da             	mov    r11d,edx

   14031fac3:	41 c1 eb 05          	shr    r11d,0x5

   14031fac7:	41 8b c2             	mov    eax,r10d

   14031faca:	41 2b c3             	sub    eax,r11d

   14031facd:	03 c9                	add    ecx,ecx

   14031facf:	3b c1                	cmp    eax,ecx

   14031fad1:	72 1f                	jb     0x14031faf2

   14031fad3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]

   14031fad7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]

   14031fade:	00 00 

   14031fae0:	45 03 c0             	add    r8d,r8d

   14031fbc1:	44 89 05 84 a4 66 00 	mov    DWORD PTR [rip+0x66a484],r8d        # 0x14098a04c
   14031fbc8:	f3 0f 11 05 6c a4 66 	movss  DWORD PTR [rip+0x66a46c],xmm0        # 0x14098a03c
   14031fbcf:	00 
   14031fbd0:	66 0f 6e c0          	movd   xmm0,eax
   14031fbd4:	41 8b c2             	mov    eax,r10d
   14031fbd7:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14031fbda:	41 f7 f0             	div    r8d
   14031fbdd:	f3 0f 11 05 53 a4 66 	movss  DWORD PTR [rip+0x66a453],xmm0        # 0x14098a038
   14031fbe4:	00 
   14031fbe5:	0f 57 c0             	xorps  xmm0,xmm0
   14031fbe8:	8b c8                	mov    ecx,eax
   14031fbea:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   14031fbef:	f3 0f 11 05 51 a4 66 	movss  DWORD PTR [rip+0x66a451],xmm0        # 0x14098a048
   14031fbf6:	00 
   14031fbf7:	c3                   	ret
   14031fbf8:	cc                   	int3
   14031fbf9:	cc                   	int3
   14031fbfa:	cc                   	int3
   14031fbfb:	cc                   	int3
   14031fbfc:	cc                   	int3
   14031fbfd:	cc                   	int3
   14031fbfe:	cc                   	int3
   14031fbff:	cc                   	int3
   14031fc00:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   14031fc03:	0f 57 c0             	xorps  xmm0,xmm0
   14031fc06:	0f af 05 9b a5 66 00 	imul   eax,DWORD PTR [rip+0x66a59b]        # 0x14098a1a8

   14031fc0d:	0f 57 c9             	xorps  xmm1,xmm1

   14031fc10:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14031fbd0:	66 0f 6e c0          	movd   xmm0,eax
   14031fbd4:	41 8b c2             	mov    eax,r10d
   14031fbd7:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14031fbda:	41 f7 f0             	div    r8d
   14031fbdd:	f3 0f 11 05 53 a4 66 	movss  DWORD PTR [rip+0x66a453],xmm0        # 0x14098a038
   14031fbe4:	00 
   14031fbe5:	0f 57 c0             	xorps  xmm0,xmm0
   14031fbe8:	8b c8                	mov    ecx,eax
   14031fbea:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   14031fbef:	f3 0f 11 05 51 a4 66 	movss  DWORD PTR [rip+0x66a451],xmm0        # 0x14098a048
   14031fbf6:	00 
   14031fbf7:	c3                   	ret
   14031fbf8:	cc                   	int3
   14031fbf9:	cc                   	int3
   14031fbfa:	cc                   	int3
   14031fbfb:	cc                   	int3
   14031fbfc:	cc                   	int3
   14031fbfd:	cc                   	int3
   14031fbfe:	cc                   	int3
   14031fbff:	cc                   	int3
   14031fc00:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   14031fc03:	0f 57 c0             	xorps  xmm0,xmm0
   14031fc06:	0f af 05 9b a5 66 00 	imul   eax,DWORD PTR [rip+0x66a59b]        # 0x14098a1a8
   14031fc0d:	0f 57 c9             	xorps  xmm1,xmm1
   14031fc10:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14031fc15:	8b 05 39 a5 66 00    	mov    eax,DWORD PTR [rip+0x66a539]        # 0x14098a154

   14031fc1b:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   14031fc20:	f3 0f 5e c1          	divss  xmm0,xmm1

   14031fc24:	c3                   	ret

   14031fc25:	cc                   	int3

   14031fc26:	cc                   	int3

   14031fc27:	cc                   	int3

   14031fc28:	cc                   	int3

   14031fc29:	cc                   	int3

   14031fc2a:	cc                   	int3

   14031fc2b:	cc                   	int3

   14031fc2c:	cc                   	int3

   14031fc2d:	cc                   	int3

   14031fc2e:	cc                   	int3

   14031fc2f:	cc                   	int3

   14031fc30:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]

   14031fbfc:	cc                   	int3
   14031fbfd:	cc                   	int3
   14031fbfe:	cc                   	int3
   14031fbff:	cc                   	int3
   14031fc00:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   14031fc03:	0f 57 c0             	xorps  xmm0,xmm0
   14031fc06:	0f af 05 9b a5 66 00 	imul   eax,DWORD PTR [rip+0x66a59b]        # 0x14098a1a8
   14031fc0d:	0f 57 c9             	xorps  xmm1,xmm1
   14031fc10:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14031fc15:	8b 05 39 a5 66 00    	mov    eax,DWORD PTR [rip+0x66a539]        # 0x14098a154
   14031fc1b:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   14031fc20:	f3 0f 5e c1          	divss  xmm0,xmm1
   14031fc24:	c3                   	ret
   14031fc25:	cc                   	int3
   14031fc26:	cc                   	int3
   14031fc27:	cc                   	int3
   14031fc28:	cc                   	int3
   14031fc29:	cc                   	int3
   14031fc2a:	cc                   	int3
   14031fc2b:	cc                   	int3
   14031fc2c:	cc                   	int3
   14031fc2d:	cc                   	int3
   14031fc2e:	cc                   	int3
   14031fc2f:	cc                   	int3
   14031fc30:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   14031fc33:	0f af 05 6e a5 66 00 	imul   eax,DWORD PTR [rip+0x66a56e]        # 0x14098a1a8

   14031fc3a:	c3                   	ret

   14031fc3b:	cc                   	int3

   14031fc3c:	cc                   	int3

   14031fc3d:	cc                   	int3

   14031fc3e:	cc                   	int3

   14031fc3f:	cc                   	int3

   14031fc40:	cc                   	int3

   14031fc41:	cc                   	int3

   14031fc42:	cc                   	int3

   14031fc43:	cc                   	int3

   14031fc44:	cc                   	int3

   14031fc45:	cc                   	int3

   14031fc46:	cc                   	int3

   14031fc47:	cc                   	int3

   14031fc48:	cc                   	int3

   14031fc49:	cc                   	int3

   14031fc3a:	c3                   	ret
   14031fc3b:	cc                   	int3
   14031fc3c:	cc                   	int3
   14031fc3d:	cc                   	int3
   14031fc3e:	cc                   	int3
   14031fc3f:	cc                   	int3
   14031fc40:	cc                   	int3
   14031fc41:	cc                   	int3
   14031fc42:	cc                   	int3
   14031fc43:	cc                   	int3
   14031fc44:	cc                   	int3
   14031fc45:	cc                   	int3
   14031fc46:	cc                   	int3
   14031fc47:	cc                   	int3
   14031fc48:	cc                   	int3
   14031fc49:	cc                   	int3
   14031fc4a:	cc                   	int3
   14031fc4b:	cc                   	int3
   14031fc4c:	cc                   	int3
   14031fc4d:	cc                   	int3
   14031fc4e:	cc                   	int3
   14031fc4f:	cc                   	int3
   14031fc50:	0f b7 15 07 a5 66 00 	movzx  edx,WORD PTR [rip+0x66a507]        # 0x14098a15e
   14031fc57:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   14031fc5a:	0f af c2             	imul   eax,edx
   14031fc5d:	0f af 05 44 a5 66 00 	imul   eax,DWORD PTR [rip+0x66a544]        # 0x14098a1a8

   14031fc64:	c1 e8 03             	shr    eax,0x3

   14031fc67:	c3                   	ret

   14031fc68:	cc                   	int3

   14031fc69:	cc                   	int3

   14031fc6a:	cc                   	int3

   14031fc6b:	cc                   	int3

   14031fc6c:	cc                   	int3

   14031fc6d:	cc                   	int3

   14031fc6e:	cc                   	int3

   14031fc6f:	cc                   	int3

   14031fc70:	8b 41 24             	mov    eax,DWORD PTR [rcx+0x24]

   14031fc46:	cc                   	int3
   14031fc47:	cc                   	int3
   14031fc48:	cc                   	int3
   14031fc49:	cc                   	int3
   14031fc4a:	cc                   	int3
   14031fc4b:	cc                   	int3
   14031fc4c:	cc                   	int3
   14031fc4d:	cc                   	int3
   14031fc4e:	cc                   	int3
   14031fc4f:	cc                   	int3
   14031fc50:	0f b7 15 07 a5 66 00 	movzx  edx,WORD PTR [rip+0x66a507]        # 0x14098a15e
   14031fc57:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   14031fc5a:	0f af c2             	imul   eax,edx
   14031fc5d:	0f af 05 44 a5 66 00 	imul   eax,DWORD PTR [rip+0x66a544]        # 0x14098a1a8
   14031fc64:	c1 e8 03             	shr    eax,0x3
   14031fc67:	c3                   	ret
   14031fc68:	cc                   	int3
   14031fc69:	cc                   	int3
   14031fc6a:	cc                   	int3
   14031fc6b:	cc                   	int3
   14031fc6c:	cc                   	int3
   14031fc6d:	cc                   	int3
   14031fc6e:	cc                   	int3
   14031fc6f:	cc                   	int3
   14031fc70:	8b 41 24             	mov    eax,DWORD PTR [rcx+0x24]
   14031fc73:	0f af 05 2e a5 66 00 	imul   eax,DWORD PTR [rip+0x66a52e]        # 0x14098a1a8

   14031fc7a:	c3                   	ret

   14031fc7b:	cc                   	int3

   14031fc7c:	cc                   	int3

   14031fc7d:	cc                   	int3

   14031fc7e:	cc                   	int3

   14031fc7f:	cc                   	int3

   14031fc80:	cc                   	int3

   14031fc81:	cc                   	int3

   14031fc82:	cc                   	int3

   14031fc83:	cc                   	int3

   14031fc84:	cc                   	int3

   14031fc85:	cc                   	int3

   14031fc86:	cc                   	int3

   14031fc87:	cc                   	int3

   14031fc88:	cc                   	int3

   14031fc89:	cc                   	int3

   14031fc7a:	c3                   	ret
   14031fc7b:	cc                   	int3
   14031fc7c:	cc                   	int3
   14031fc7d:	cc                   	int3
   14031fc7e:	cc                   	int3
   14031fc7f:	cc                   	int3
   14031fc80:	cc                   	int3
   14031fc81:	cc                   	int3
   14031fc82:	cc                   	int3
   14031fc83:	cc                   	int3
   14031fc84:	cc                   	int3
   14031fc85:	cc                   	int3
   14031fc86:	cc                   	int3
   14031fc87:	cc                   	int3
   14031fc88:	cc                   	int3
   14031fc89:	cc                   	int3
   14031fc8a:	cc                   	int3
   14031fc8b:	cc                   	int3
   14031fc8c:	cc                   	int3
   14031fc8d:	cc                   	int3
   14031fc8e:	cc                   	int3
   14031fc8f:	cc                   	int3
   14031fc90:	0f b7 15 c7 a4 66 00 	movzx  edx,WORD PTR [rip+0x66a4c7]        # 0x14098a15e
   14031fc97:	8b 41 24             	mov    eax,DWORD PTR [rcx+0x24]
   14031fc9a:	0f af c2             	imul   eax,edx
   14031fc9d:	0f af 05 04 a5 66 00 	imul   eax,DWORD PTR [rip+0x66a504]        # 0x14098a1a8

   14031fca4:	c1 e8 03             	shr    eax,0x3

   14031fca7:	c3                   	ret

   14031fca8:	cc                   	int3

   14031fca9:	cc                   	int3

   14031fcaa:	cc                   	int3

   14031fcab:	cc                   	int3

   14031fcac:	cc                   	int3

   14031fcad:	cc                   	int3

   14031fcae:	cc                   	int3

   14031fcaf:	cc                   	int3

   14031fcb0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx

   14031fcb5:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi

   14031fcba:	57                   	push   rdi

   14031fcbb:	48 83 ec 20          	sub    rsp,0x20

   14031fcbf:	33 f6                	xor    esi,esi

   14031fcc1:	48 8b f9             	mov    rdi,rcx

   14032626a:	45 33 f6             	xor    r14d,r14d
   14032626d:	4c 8b fa             	mov    r15,rdx
   140326270:	44 39 35 31 37 61 00 	cmp    DWORD PTR [rip+0x613731],r14d        # 0x1409399a8
   140326277:	4c 8b e9             	mov    r13,rcx
   14032627a:	0f 86 3d 01 00 00    	jbe    0x1403263bd
   140326280:	48 89 5c 24 50       	mov    QWORD PTR [rsp+0x50],rbx
   140326285:	48 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],rbp
   14032628a:	48 89 74 24 68       	mov    QWORD PTR [rsp+0x68],rsi
   14032628f:	48 89 7c 24 28       	mov    QWORD PTR [rsp+0x28],rdi
   140326294:	8b 7c 24 60          	mov    edi,DWORD PTR [rsp+0x60]
   140326298:	4c 89 64 24 20       	mov    QWORD PTR [rsp+0x20],r12
   14032629d:	4d 8d 66 ff          	lea    r12,[r14-0x1]
   1403262a1:	41 8b c6             	mov    eax,r14d
   1403262a4:	48 6b d8 38          	imul   rbx,rax,0x38
   1403262a8:	33 c0                	xor    eax,eax
   1403262aa:	4a 89 04 3b          	mov    QWORD PTR [rbx+r15*1],rax
   1403262ae:	4a 89 44 3b 08       	mov    QWORD PTR [rbx+r15*1+0x8],rax
   1403262b3:	4a 89 44 3b 10       	mov    QWORD PTR [rbx+r15*1+0x10],rax
   1403262b8:	4a 89 44 3b 18       	mov    QWORD PTR [rbx+r15*1+0x18],rax
   1403262bd:	4a 89 44 3b 20       	mov    QWORD PTR [rbx+r15*1+0x20],rax
   1403262c2:	4a 89 44 3b 28       	mov    QWORD PTR [rbx+r15*1+0x28],rax
   1403262c7:	4a 89 44 3b 30       	mov    QWORD PTR [rbx+r15*1+0x30],rax
   1403262cc:	b8 10 00 00 00       	mov    eax,0x10
   1403262d1:	41 8b 4d 24          	mov    ecx,DWORD PTR [r13+0x24]
   1403262d5:	41 03 8d bc 00 00 00 	add    ecx,DWORD PTR [r13+0xbc]
   1403262dc:	0f af 0d 71 3d 66 00 	imul   ecx,DWORD PTR [rip+0x663d71]        # 0x14098a054

   1403262e3:	48 f7 e1             	mul    rcx

   1403262e6:	49 0f 40 c4          	cmovo  rax,r12

   1403262ea:	48 8b c8             	mov    rcx,rax

   1403262ed:	e8 6e 52 2f 00       	call   0x14061b560

   1403262f2:	4a 89 04 3b          	mov    QWORD PTR [rbx+r15*1],rax

   1403262f6:	bd 03 00 00 00       	mov    ebp,0x3

   14032628a:	48 89 74 24 68       	mov    QWORD PTR [rsp+0x68],rsi
   14032628f:	48 89 7c 24 28       	mov    QWORD PTR [rsp+0x28],rdi
   140326294:	8b 7c 24 60          	mov    edi,DWORD PTR [rsp+0x60]
   140326298:	4c 89 64 24 20       	mov    QWORD PTR [rsp+0x20],r12
   14032629d:	4d 8d 66 ff          	lea    r12,[r14-0x1]
   1403262a1:	41 8b c6             	mov    eax,r14d
   1403262a4:	48 6b d8 38          	imul   rbx,rax,0x38
   1403262a8:	33 c0                	xor    eax,eax
   1403262aa:	4a 89 04 3b          	mov    QWORD PTR [rbx+r15*1],rax
   1403262ae:	4a 89 44 3b 08       	mov    QWORD PTR [rbx+r15*1+0x8],rax
   1403262b3:	4a 89 44 3b 10       	mov    QWORD PTR [rbx+r15*1+0x10],rax
   1403262b8:	4a 89 44 3b 18       	mov    QWORD PTR [rbx+r15*1+0x18],rax
   1403262bd:	4a 89 44 3b 20       	mov    QWORD PTR [rbx+r15*1+0x20],rax
   1403262c2:	4a 89 44 3b 28       	mov    QWORD PTR [rbx+r15*1+0x28],rax
   1403262c7:	4a 89 44 3b 30       	mov    QWORD PTR [rbx+r15*1+0x30],rax
   1403262cc:	b8 10 00 00 00       	mov    eax,0x10
   1403262d1:	41 8b 4d 24          	mov    ecx,DWORD PTR [r13+0x24]
   1403262d5:	41 03 8d bc 00 00 00 	add    ecx,DWORD PTR [r13+0xbc]
   1403262dc:	0f af 0d 71 3d 66 00 	imul   ecx,DWORD PTR [rip+0x663d71]        # 0x14098a054
   1403262e3:	48 f7 e1             	mul    rcx
   1403262e6:	49 0f 40 c4          	cmovo  rax,r12
   1403262ea:	48 8b c8             	mov    rcx,rax
   1403262ed:	e8 6e 52 2f 00       	call   0x14061b560
   1403262f2:	4a 89 04 3b          	mov    QWORD PTR [rbx+r15*1],rax
   1403262f6:	bd 03 00 00 00       	mov    ebp,0x3
   1403262fb:	8b 05 53 3d 66 00    	mov    eax,DWORD PTR [rip+0x663d53]        # 0x14098a054

   140326301:	48 83 c3 20          	add    rbx,0x20

   140326305:	49 03 df             	add    rbx,r15

   140326308:	8d 34 85 00 00 00 00 	lea    esi,[rax*4+0x0]

   14032630f:	90                   	nop

   140326310:	b8 08 00 00 00       	mov    eax,0x8

   140326315:	48 f7 e6             	mul    rsi

   140326318:	49 0f 40 c4          	cmovo  rax,r12

   14032631c:	48 8b c8             	mov    rcx,rax

   14032631f:	e8 3c 52 2f 00       	call   0x14061b560

   140326324:	48 89 43 e8          	mov    QWORD PTR [rbx-0x18],rax

   140326328:	b8 10 00 00 00       	mov    eax,0x10

   14032632d:	48 f7 e6             	mul    rsi

   140326330:	49 0f 40 c4          	cmovo  rax,r12

   140326334:	48 8b c8             	mov    rcx,rax

   140326337:	e8 24 52 2f 00       	call   0x14061b560

   14032633c:	48 89 03             	mov    QWORD PTR [rbx],rax

   1403262e6:	49 0f 40 c4          	cmovo  rax,r12
   1403262ea:	48 8b c8             	mov    rcx,rax
   1403262ed:	e8 6e 52 2f 00       	call   0x14061b560
   1403262f2:	4a 89 04 3b          	mov    QWORD PTR [rbx+r15*1],rax
   1403262f6:	bd 03 00 00 00       	mov    ebp,0x3
   1403262fb:	8b 05 53 3d 66 00    	mov    eax,DWORD PTR [rip+0x663d53]        # 0x14098a054
   140326301:	48 83 c3 20          	add    rbx,0x20
   140326305:	49 03 df             	add    rbx,r15
   140326308:	8d 34 85 00 00 00 00 	lea    esi,[rax*4+0x0]
   14032630f:	90                   	nop
   140326310:	b8 08 00 00 00       	mov    eax,0x8
   140326315:	48 f7 e6             	mul    rsi
   140326318:	49 0f 40 c4          	cmovo  rax,r12
   14032631c:	48 8b c8             	mov    rcx,rax
   14032631f:	e8 3c 52 2f 00       	call   0x14061b560
   140326324:	48 89 43 e8          	mov    QWORD PTR [rbx-0x18],rax
   140326328:	b8 10 00 00 00       	mov    eax,0x10
   14032632d:	48 f7 e6             	mul    rsi
   140326330:	49 0f 40 c4          	cmovo  rax,r12
   140326334:	48 8b c8             	mov    rcx,rax
   140326337:	e8 24 52 2f 00       	call   0x14061b560
   14032633c:	48 89 03             	mov    QWORD PTR [rbx],rax
   14032633f:	48 8d 5b 08          	lea    rbx,[rbx+0x8]
   140326343:	48 83 ed 01          	sub    rbp,0x1
   140326347:	75 c7                	jne    0x140326310
   140326349:	8b 15 05 3d 66 00    	mov    edx,DWORD PTR [rip+0x663d05]        # 0x14098a054

   14032634f:	33 c9                	xor    ecx,ecx

   1403262ed:	e8 6e 52 2f 00       	call   0x14061b560
   1403262f2:	4a 89 04 3b          	mov    QWORD PTR [rbx+r15*1],rax
   1403262f6:	bd 03 00 00 00       	mov    ebp,0x3
   1403262fb:	8b 05 53 3d 66 00    	mov    eax,DWORD PTR [rip+0x663d53]        # 0x14098a054
   140326301:	48 83 c3 20          	add    rbx,0x20
   140326305:	49 03 df             	add    rbx,r15
   140326308:	8d 34 85 00 00 00 00 	lea    esi,[rax*4+0x0]
   14032630f:	90                   	nop
   140326310:	b8 08 00 00 00       	mov    eax,0x8
   140326315:	48 f7 e6             	mul    rsi
   140326318:	49 0f 40 c4          	cmovo  rax,r12
   14032631c:	48 8b c8             	mov    rcx,rax
   14032631f:	e8 3c 52 2f 00       	call   0x14061b560
   140326324:	48 89 43 e8          	mov    QWORD PTR [rbx-0x18],rax
   140326328:	b8 10 00 00 00       	mov    eax,0x10
   14032632d:	48 f7 e6             	mul    rsi
   140326330:	49 0f 40 c4          	cmovo  rax,r12
   140326334:	48 8b c8             	mov    rcx,rax
   140326337:	e8 24 52 2f 00       	call   0x14061b560
   14032633c:	48 89 03             	mov    QWORD PTR [rbx],rax
   14032633f:	48 8d 5b 08          	lea    rbx,[rbx+0x8]
   140326343:	48 83 ed 01          	sub    rbp,0x1
   140326347:	75 c7                	jne    0x140326310
   140326349:	8b 15 05 3d 66 00    	mov    edx,DWORD PTR [rip+0x663d05]        # 0x14098a054
   14032634f:	33 c9                	xor    ecx,ecx
   140326351:	44 8b 05 50 3e 66 00 	mov    r8d,DWORD PTR [rip+0x663e50]        # 0x14098a1a8

   140326358:	83 f9 03             	cmp    ecx,0x3

   14032635b:	73 22                	jae    0x14032637f

   14032635d:	8b c1                	mov    eax,ecx

   14032635f:	85 c9                	test   ecx,ecx

   140326361:	74 0a                	je     0x14032636d

   140326363:	83 e8 01             	sub    eax,0x1

   140326366:	74 05                	je     0x14032636d

   140326368:	83 f8 01             	cmp    eax,0x1

   14032636b:	75 05                	jne    0x140326372

   14032636d:	8b fa                	mov    edi,edx

   14032636f:	c1 ef 02             	shr    edi,0x2

   140326372:	44 3b c7             	cmp    r8d,edi

   140326375:	41 8b c0             	mov    eax,r8d

   140326378:	0f 42 c7             	cmovb  eax,edi

   14032637b:	8b f8                	mov    edi,eax

   14032637d:	eb 0e                	jmp    0x14032638d

   1403268d0:	48 8d 04 cd 03 00 00 	lea    rax,[rcx*8+0x3]
   1403268d7:	00 
   1403268d8:	48 03 c1             	add    rax,rcx
   1403268db:	48 8d 34 c5 00 00 00 	lea    rsi,[rax*8+0x0]
   1403268e2:	00 
   1403268e3:	48 8d 41 5c          	lea    rax,[rcx+0x5c]
   1403268e7:	48 03 f2             	add    rsi,rdx
   1403268ea:	48 8d 04 41          	lea    rax,[rcx+rax*2]
   1403268ee:	48 8d 04 c5 00 00 00 	lea    rax,[rax*8+0x0]
   1403268f5:	00 
   1403268f6:	48 03 c2             	add    rax,rdx
   1403268f9:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax
   1403268fe:	33 c9                	xor    ecx,ecx
   140326900:	eb 0b                	jmp    0x14032690d
   140326902:	48 8b d9             	mov    rbx,rcx
   140326905:	48 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],rcx
   14032690a:	48 8b f1             	mov    rsi,rcx
   14032690d:	48 89 bc 24 40 01 00 	mov    QWORD PTR [rsp+0x140],rdi
   140326914:	00 
   140326915:	4c 89 bc 24 28 01 00 	mov    QWORD PTR [rsp+0x128],r15
   14032691c:	00 
   14032691d:	4d 85 ed             	test   r13,r13
   140326920:	0f 84 91 00 00 00    	je     0x1403269b7
   140326926:	44 8b 45 24          	mov    r8d,DWORD PTR [rbp+0x24]
   14032692a:	41 8b c1             	mov    eax,r9d
   14032692d:	44 8b 0d 74 38 66 00 	mov    r9d,DWORD PTR [rip+0x663874]        # 0x14098a1a8

   140326934:	99                   	cdq

   140326935:	41 f7 f9             	idiv   r9d

   140326938:	8b 55 28             	mov    edx,DWORD PTR [rbp+0x28]

   14032693b:	44 8b f8             	mov    r15d,eax

   14032693e:	44 2b fa             	sub    r15d,edx

   140326941:	45 85 ff             	test   r15d,r15d

   140326944:	44 0f 4e f9          	cmovle r15d,ecx

   140326948:	44 03 c2             	add    r8d,edx

   14032694b:	41 8d 48 ff          	lea    ecx,[r8-0x1]

   14032694f:	44 3b f9             	cmp    r15d,ecx

   140326952:	44 0f 4d f9          	cmovge r15d,ecx

   140326956:	41 2b 45 0c          	sub    eax,DWORD PTR [r13+0xc]

   140326900:	eb 0b                	jmp    0x14032690d
   140326902:	48 8b d9             	mov    rbx,rcx
   140326905:	48 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],rcx
   14032690a:	48 8b f1             	mov    rsi,rcx
   14032690d:	48 89 bc 24 40 01 00 	mov    QWORD PTR [rsp+0x140],rdi
   140326914:	00 
   140326915:	4c 89 bc 24 28 01 00 	mov    QWORD PTR [rsp+0x128],r15
   14032691c:	00 
   14032691d:	4d 85 ed             	test   r13,r13
   140326920:	0f 84 91 00 00 00    	je     0x1403269b7
   140326926:	44 8b 45 24          	mov    r8d,DWORD PTR [rbp+0x24]
   14032692a:	41 8b c1             	mov    eax,r9d
   14032692d:	44 8b 0d 74 38 66 00 	mov    r9d,DWORD PTR [rip+0x663874]        # 0x14098a1a8
   140326934:	99                   	cdq
   140326935:	41 f7 f9             	idiv   r9d
   140326938:	8b 55 28             	mov    edx,DWORD PTR [rbp+0x28]
   14032693b:	44 8b f8             	mov    r15d,eax
   14032693e:	44 2b fa             	sub    r15d,edx
   140326941:	45 85 ff             	test   r15d,r15d
   140326944:	44 0f 4e f9          	cmovle r15d,ecx
   140326948:	44 03 c2             	add    r8d,edx
   14032694b:	41 8d 48 ff          	lea    ecx,[r8-0x1]
   14032694f:	44 3b f9             	cmp    r15d,ecx
   140326952:	44 0f 4d f9          	cmovge r15d,ecx
   140326956:	41 2b 45 0c          	sub    eax,DWORD PTR [r13+0xc]
   14032695a:	8b 0d f4 36 66 00    	mov    ecx,DWORD PTR [rip+0x6636f4]        # 0x14098a054

   140326960:	0f af c1             	imul   eax,ecx

   140326963:	44 89 7c 24 20       	mov    DWORD PTR [rsp+0x20],r15d

   140326968:	8b f8                	mov    edi,eax

   14032696a:	48 c1 e7 04          	shl    rdi,0x4

   14032696e:	48 03 3b             	add    rdi,QWORD PTR [rbx]

   140326971:	48 89 7c 24 70       	mov    QWORD PTR [rsp+0x70],rdi

   140326976:	45 85 ff             	test   r15d,r15d

   140326979:	0f 88 f0 08 00 00    	js     0x14032726f

   14032697f:	45 3b f8             	cmp    r15d,r8d

   140326982:	0f 8d e7 08 00 00    	jge    0x14032726f

   140326988:	42 8d 04 3a          	lea    eax,[rdx+r15*1]

   14032698c:	44 8b c1             	mov    r8d,ecx

   14032698f:	41 0f af c1          	imul   eax,r9d

   140326993:	33 d2                	xor    edx,edx

   140326995:	49 c1 e0 04          	shl    r8,0x4

   140326999:	48 8b cf             	mov    rcx,rdi

   140326a41:	44 0f 29 ac 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm13
   140326a48:	00 00 
   140326a4a:	48 89 4c 24 28       	mov    QWORD PTR [rsp+0x28],rcx
   140326a4f:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   140326a54:	74 15                	je     0x140326a6b
   140326a56:	33 c0                	xor    eax,eax
   140326a58:	48 89 05 31 36 66 00 	mov    QWORD PTR [rip+0x663631],rax        # 0x14098a090
   140326a5f:	89 05 33 36 66 00    	mov    DWORD PTR [rip+0x663633],eax        # 0x14098a098
   140326a65:	88 05 05 2c 61 00    	mov    BYTE PTR [rip+0x612c05],al        # 0x140939670
   140326a6b:	f2 44 0f 10 25 44 0f 	movsd  xmm12,QWORD PTR [rip+0x380f44]        # 0x1406a79b8
   140326a72:	38 00 
   140326a74:	48 8d 0d 85 95 cd ff 	lea    rcx,[rip+0xffffffffffcd9585]        # 0x140000000
   140326a7b:	f2 44 0f 10 2d 7c 97 	movsd  xmm13,QWORD PTR [rip+0x52977c]        # 0x140850200
   140326a82:	52 00 
   140326a84:	be 01 00 00 00       	mov    esi,0x1
   140326a89:	f3 44 0f 10 15 4a 95 	movss  xmm10,DWORD PTR [rip+0x52954a]        # 0x14084ffdc
   140326a90:	52 00 
   140326a92:	45 0f 57 c0          	xorps  xmm8,xmm8
   140326a96:	f3 44 0f 10 1d 59 10 	movss  xmm11,DWORD PTR [rip+0x381059]        # 0x1406a7af8
   140326a9d:	38 00 
   140326a9f:	f3 44 0f 10 0d d8 21 	movss  xmm9,DWORD PTR [rip+0x3721d8]        # 0x140698c80
   140326aa6:	37 00 
   140326aa8:	44 8b 44 24 20       	mov    r8d,DWORD PTR [rsp+0x20]
   140326aad:	44 8b 64 24 20       	mov    r12d,DWORD PTR [rsp+0x20]
   140326ab2:	44 8b 74 24 20       	mov    r14d,DWORD PTR [rsp+0x20]
   140326ab7:	44 8b 0d 96 35 66 00 	mov    r9d,DWORD PTR [rip+0x663596]        # 0x14098a054

   140326abe:	89 74 24 30          	mov    DWORD PTR [rsp+0x30],esi

   140326ac2:	8b c6                	mov    eax,esi

   140326ac4:	85 f6                	test   esi,esi

   140326ac6:	74 3b                	je     0x140326b03

   140326ac8:	83 e8 01             	sub    eax,0x1

   140326acb:	74 1e                	je     0x140326aeb

   140326acd:	83 f8 01             	cmp    eax,0x1

   140326ad0:	75 39                	jne    0x140326b0b

   140326ad2:	47 8d 34 09          	lea    r14d,[r9+r9*1]

   140326ad6:	45 8b c1             	mov    r8d,r9d

   140326ad9:	47 8d 1c 36          	lea    r11d,[r14+r14*1]

   140326add:	41 c1 e8 02          	shr    r8d,0x2

   140326ae1:	45 8b e6             	mov    r12d,r14d

   140326ae4:	44 89 5c 24 24       	mov    DWORD PTR [rsp+0x24],r11d

   140326ae9:	eb 25                	jmp    0x140326b10

   140326aeb:	45 8b c1             	mov    r8d,r9d

   140326ac2:	8b c6                	mov    eax,esi
   140326ac4:	85 f6                	test   esi,esi
   140326ac6:	74 3b                	je     0x140326b03
   140326ac8:	83 e8 01             	sub    eax,0x1
   140326acb:	74 1e                	je     0x140326aeb
   140326acd:	83 f8 01             	cmp    eax,0x1
   140326ad0:	75 39                	jne    0x140326b0b
   140326ad2:	47 8d 34 09          	lea    r14d,[r9+r9*1]
   140326ad6:	45 8b c1             	mov    r8d,r9d
   140326ad9:	47 8d 1c 36          	lea    r11d,[r14+r14*1]
   140326add:	41 c1 e8 02          	shr    r8d,0x2
   140326ae1:	45 8b e6             	mov    r12d,r14d
   140326ae4:	44 89 5c 24 24       	mov    DWORD PTR [rsp+0x24],r11d
   140326ae9:	eb 25                	jmp    0x140326b10
   140326aeb:	45 8b c1             	mov    r8d,r9d
   140326aee:	47 8d 1c 09          	lea    r11d,[r9+r9*1]
   140326af2:	41 c1 e8 02          	shr    r8d,0x2
   140326af6:	45 8b f1             	mov    r14d,r9d
   140326af9:	44 89 5c 24 24       	mov    DWORD PTR [rsp+0x24],r11d
   140326afe:	45 8b e1             	mov    r12d,r9d
   140326b01:	eb 0d                	jmp    0x140326b10
   140326b03:	45 8b f1             	mov    r14d,r9d
   140326b06:	41 d1 ee             	shr    r14d,1
   140326b09:	eb cb                	jmp    0x140326ad6
   140326b0b:	44 8b 5c 24 24       	mov    r11d,DWORD PTR [rsp+0x24]
   140326b10:	8b 05 92 36 66 00    	mov    eax,DWORD PTR [rip+0x663692]        # 0x14098a1a8

   140326b16:	0f 57 ff             	xorps  xmm7,xmm7

   140326b19:	41 3b c0             	cmp    eax,r8d

   140326b1c:	0f 57 c0             	xorps  xmm0,xmm0

   140326b1f:	41 0f 42 c0          	cmovb  eax,r8d

   140326b23:	89 44 24 44          	mov    DWORD PTR [rsp+0x44],eax

   140326b27:	44 8b c0             	mov    r8d,eax

   140326ad2:	47 8d 34 09          	lea    r14d,[r9+r9*1]
   140326ad6:	45 8b c1             	mov    r8d,r9d
   140326ad9:	47 8d 1c 36          	lea    r11d,[r14+r14*1]
   140326add:	41 c1 e8 02          	shr    r8d,0x2
   140326ae1:	45 8b e6             	mov    r12d,r14d
   140326ae4:	44 89 5c 24 24       	mov    DWORD PTR [rsp+0x24],r11d
   140326ae9:	eb 25                	jmp    0x140326b10
   140326aeb:	45 8b c1             	mov    r8d,r9d
   140326aee:	47 8d 1c 09          	lea    r11d,[r9+r9*1]
   140326af2:	41 c1 e8 02          	shr    r8d,0x2
   140326af6:	45 8b f1             	mov    r14d,r9d
   140326af9:	44 89 5c 24 24       	mov    DWORD PTR [rsp+0x24],r11d
   140326afe:	45 8b e1             	mov    r12d,r9d
   140326b01:	eb 0d                	jmp    0x140326b10
   140326b03:	45 8b f1             	mov    r14d,r9d
   140326b06:	41 d1 ee             	shr    r14d,1
   140326b09:	eb cb                	jmp    0x140326ad6
   140326b0b:	44 8b 5c 24 24       	mov    r11d,DWORD PTR [rsp+0x24]
   140326b10:	8b 05 92 36 66 00    	mov    eax,DWORD PTR [rip+0x663692]        # 0x14098a1a8
   140326b16:	0f 57 ff             	xorps  xmm7,xmm7
   140326b19:	41 3b c0             	cmp    eax,r8d
   140326b1c:	0f 57 c0             	xorps  xmm0,xmm0
   140326b1f:	41 0f 42 c0          	cmovb  eax,r8d
   140326b23:	89 44 24 44          	mov    DWORD PTR [rsp+0x44],eax
   140326b27:	44 8b c0             	mov    r8d,eax
   140326b2a:	8b 05 24 36 66 00    	mov    eax,DWORD PTR [rip+0x663624]        # 0x14098a154

   140326b30:	f3 48 0f 2a f8       	cvtsi2ss xmm7,rax

   140326b35:	41 8b c3             	mov    eax,r11d

   140326b38:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140326b3d:	f3 0f 5e f8          	divss  xmm7,xmm0

   140326b41:	4d 85 ed             	test   r13,r13

   140326b44:	75 60                	jne    0x140326ba6

   140326b46:	8b de                	mov    ebx,esi

   140326b48:	44 3b 9c 99 90 a0 98 	cmp    r11d,DWORD PTR [rcx+rbx*4+0x98a090]

   140326b4f:	00 

   140326b50:	74 54                	je     0x140326ba6

   140326b52:	48 8b 8c d9 78 a0 98 	mov    rcx,QWORD PTR [rcx+rbx*8+0x98a078]

   140326b59:	00 

   140326b5a:	48 85 c9             	test   rcx,rcx

   140326b5d:	74 05                	je     0x140326b64

   140326b5f:	e8 fc e1 2e 00       	call   0x140614d60

   140326b64:	41 8b cc             	mov    ecx,r12d

   140326b30:	f3 48 0f 2a f8       	cvtsi2ss xmm7,rax
   140326b35:	41 8b c3             	mov    eax,r11d
   140326b38:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140326b3d:	f3 0f 5e f8          	divss  xmm7,xmm0
   140326b41:	4d 85 ed             	test   r13,r13
   140326b44:	75 60                	jne    0x140326ba6
   140326b46:	8b de                	mov    ebx,esi
   140326b48:	44 3b 9c 99 90 a0 98 	cmp    r11d,DWORD PTR [rcx+rbx*4+0x98a090]
   140326b4f:	00 
   140326b50:	74 54                	je     0x140326ba6
   140326b52:	48 8b 8c d9 78 a0 98 	mov    rcx,QWORD PTR [rcx+rbx*8+0x98a078]
   140326b59:	00 
   140326b5a:	48 85 c9             	test   rcx,rcx
   140326b5d:	74 05                	je     0x140326b64
   140326b5f:	e8 fc e1 2e 00       	call   0x140614d60
   140326b64:	41 8b cc             	mov    ecx,r12d
   140326b67:	e8 a4 e4 2e 00       	call   0x140615010
   140326b6c:	48 8d 0d 8d 94 cd ff 	lea    rcx,[rip+0xffffffffffcd948d]        # 0x140000000
   140326b73:	41 8b d4             	mov    edx,r12d
   140326b76:	48 89 84 d9 78 a0 98 	mov    QWORD PTR [rcx+rbx*8+0x98a078],rax
   140326b7d:	00 
   140326b7e:	48 8b c8             	mov    rcx,rax
   140326b81:	e8 1a da 2e 00       	call   0x1406145a0
   140326b86:	44 8b 5c 24 24       	mov    r11d,DWORD PTR [rsp+0x24]
   140326b8b:	48 8d 05 6e 94 cd ff 	lea    rax,[rip+0xffffffffffcd946e]        # 0x140000000
   140326b92:	44 8b 0d bb 34 66 00 	mov    r9d,DWORD PTR [rip+0x6634bb]        # 0x14098a054

   140326b99:	44 8b 44 24 44       	mov    r8d,DWORD PTR [rsp+0x44]

   140326b9e:	44 89 9c 98 90 a0 98 	mov    DWORD PTR [rax+rbx*4+0x98a090],r11d

   140326ba5:	00 

   140326ba6:	41 8b c1             	mov    eax,r9d

   140326ba9:	0f 57 c9             	xorps  xmm1,xmm1

   140326bac:	44 8b d6             	mov    r10d,esi

   140326baf:	0f 57 c0             	xorps  xmm0,xmm0

   140326bb2:	4c 89 54 24 60       	mov    QWORD PTR [rsp+0x60],r10

   140326bb7:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   140326bbc:	41 8b c6             	mov    eax,r14d

   140326bbf:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140326bc4:	f3 0f 5e c8          	divss  xmm1,xmm0

   140326bc8:	f3 0f 58 c9          	addss  xmm1,xmm1

   140326bcc:	f3 42 0f 11 8c 94 80 	movss  DWORD PTR [rsp+r10*4+0x80],xmm1

   140326bd3:	00 00 00 

   140326bd6:	4d 85 ed             	test   r13,r13

   140326b73:	41 8b d4             	mov    edx,r12d
   140326b76:	48 89 84 d9 78 a0 98 	mov    QWORD PTR [rcx+rbx*8+0x98a078],rax
   140326b7d:	00 
   140326b7e:	48 8b c8             	mov    rcx,rax
   140326b81:	e8 1a da 2e 00       	call   0x1406145a0
   140326b86:	44 8b 5c 24 24       	mov    r11d,DWORD PTR [rsp+0x24]
   140326b8b:	48 8d 05 6e 94 cd ff 	lea    rax,[rip+0xffffffffffcd946e]        # 0x140000000
   140326b92:	44 8b 0d bb 34 66 00 	mov    r9d,DWORD PTR [rip+0x6634bb]        # 0x14098a054
   140326b99:	44 8b 44 24 44       	mov    r8d,DWORD PTR [rsp+0x44]
   140326b9e:	44 89 9c 98 90 a0 98 	mov    DWORD PTR [rax+rbx*4+0x98a090],r11d
   140326ba5:	00 
   140326ba6:	41 8b c1             	mov    eax,r9d
   140326ba9:	0f 57 c9             	xorps  xmm1,xmm1
   140326bac:	44 8b d6             	mov    r10d,esi
   140326baf:	0f 57 c0             	xorps  xmm0,xmm0
   140326bb2:	4c 89 54 24 60       	mov    QWORD PTR [rsp+0x60],r10
   140326bb7:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140326bbc:	41 8b c6             	mov    eax,r14d
   140326bbf:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140326bc4:	f3 0f 5e c8          	divss  xmm1,xmm0
   140326bc8:	f3 0f 58 c9          	addss  xmm1,xmm1
   140326bcc:	f3 42 0f 11 8c 94 80 	movss  DWORD PTR [rsp+r10*4+0x80],xmm1
   140326bd3:	00 00 00 
   140326bd6:	4d 85 ed             	test   r13,r13
   140326bd9:	0f 84 1a 06 00 00    	je     0x1403271f9
   140326bdf:	8b 05 c3 35 66 00    	mov    eax,DWORD PTR [rip+0x6635c3]        # 0x14098a1a8

   140326be5:	41 8b c8             	mov    ecx,r8d

   140326be8:	99                   	cdq

   140326be9:	d1 e9                	shr    ecx,1

   140326beb:	2b c2                	sub    eax,edx

   140326bed:	d1 f8                	sar    eax,1

   140326bef:	8b d8                	mov    ebx,eax

   140326bf1:	8b 44 24 40          	mov    eax,DWORD PTR [rsp+0x40]

   140326bf5:	2b d9                	sub    ebx,ecx

   140326bf7:	99                   	cdq

   140326bf8:	41 f7 f8             	idiv   r8d

   140326bfb:	8b 45 28             	mov    eax,DWORD PTR [rbp+0x28]

   140326bfe:	41 8b cc             	mov    ecx,r12d

   140326c01:	03 45 24             	add    eax,DWORD PTR [rbp+0x24]

   140326c04:	2b da                	sub    ebx,edx

   140326c06:	d1 e9                	shr    ecx,1

   140326c08:	33 d2                	xor    edx,edx

   140326ff4:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   140326ff9:	4d 03 c9             	add    r9,r9
   140326ffc:	49 c1 e0 04          	shl    r8,0x4
   140327000:	4a 8b 0c e8          	mov    rcx,QWORD PTR [rax+r13*8]
   140327004:	4a 8b 0c c9          	mov    rcx,QWORD PTR [rcx+r9*8]
   140327008:	e8 d7 9c 2f 00       	call   0x140620ce4
   14032700d:	8b 05 f9 2f 66 00    	mov    eax,DWORD PTR [rip+0x662ff9]        # 0x14098a00c
   140327013:	48 8b 4c 24 50       	mov    rcx,QWORD PTR [rsp+0x50]
   140327018:	41 03 c7             	add    eax,r15d
   14032701b:	48 98                	cdqe
   14032701d:	48 03 c0             	add    rax,rax
   140327020:	4a 8b 0c e9          	mov    rcx,QWORD PTR [rcx+r13*8]
   140327024:	8b 54 c1 08          	mov    edx,DWORD PTR [rcx+rax*8+0x8]
   140327028:	83 fa 01             	cmp    edx,0x1
   14032702b:	75 0a                	jne    0x140327037
   14032702d:	c7 44 c1 08 03 00 00 	mov    DWORD PTR [rcx+rax*8+0x8],0x3
   140327034:	00 
   140327035:	eb 12                	jmp    0x140327049
   140327037:	83 fa 02             	cmp    edx,0x2
   14032703a:	75 0d                	jne    0x140327049
   14032703c:	c7 44 c1 08 00 00 00 	mov    DWORD PTR [rcx+rax*8+0x8],0x0
   140327043:	00 
   140327044:	eb 03                	jmp    0x140327049
   140327046:	44 8b ee             	mov    r13d,esi
   140327049:	4c 8b 7c 24 28       	mov    r15,QWORD PTR [rsp+0x28]
   14032704e:	44 8b 0d ff 2f 66 00 	mov    r9d,DWORD PTR [rip+0x662fff]        # 0x14098a054

   140327055:	41 8d 5e ff          	lea    ebx,[r14-0x1]

   140327059:	0f 57 c0             	xorps  xmm0,xmm0

   14032705c:	41 8b c6             	mov    eax,r14d

   14032705f:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140327064:	33 c0                	xor    eax,eax

   140327066:	8b c8                	mov    ecx,eax

   140327068:	f2 0f 58 c0          	addsd  xmm0,xmm0

   14032706c:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12

   140327071:	f2 41 0f 59 c5       	mulsd  xmm0,xmm13

   140327076:	66 0f 5a e0          	cvtpd2ps xmm4,xmm0

   14032707a:	85 db                	test   ebx,ebx

   14032707c:	0f 8e 72 01 00 00    	jle    0x1403271f4

   140327082:	4d 8d 57 20          	lea    r10,[r15+0x20]

   140327086:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]

   14032708d:	00 00 00 

   140327034:	00 
   140327035:	eb 12                	jmp    0x140327049
   140327037:	83 fa 02             	cmp    edx,0x2
   14032703a:	75 0d                	jne    0x140327049
   14032703c:	c7 44 c1 08 00 00 00 	mov    DWORD PTR [rcx+rax*8+0x8],0x0
   140327043:	00 
   140327044:	eb 03                	jmp    0x140327049
   140327046:	44 8b ee             	mov    r13d,esi
   140327049:	4c 8b 7c 24 28       	mov    r15,QWORD PTR [rsp+0x28]
   14032704e:	44 8b 0d ff 2f 66 00 	mov    r9d,DWORD PTR [rip+0x662fff]        # 0x14098a054
   140327055:	41 8d 5e ff          	lea    ebx,[r14-0x1]
   140327059:	0f 57 c0             	xorps  xmm0,xmm0
   14032705c:	41 8b c6             	mov    eax,r14d
   14032705f:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140327064:	33 c0                	xor    eax,eax
   140327066:	8b c8                	mov    ecx,eax
   140327068:	f2 0f 58 c0          	addsd  xmm0,xmm0
   14032706c:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12
   140327071:	f2 41 0f 59 c5       	mulsd  xmm0,xmm13
   140327076:	66 0f 5a e0          	cvtpd2ps xmm4,xmm0
   14032707a:	85 db                	test   ebx,ebx
   14032707c:	0f 8e 72 01 00 00    	jle    0x1403271f4
   140327082:	4d 8d 57 20          	lea    r10,[r15+0x20]
   140327086:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14032708d:	00 00 00 
   140327090:	8b 05 be 30 66 00    	mov    eax,DWORD PTR [rip+0x6630be]        # 0x14098a154

   140327096:	44 8d 59 01          	lea    r11d,[rcx+0x1]

   14032709a:	0f 57 c0             	xorps  xmm0,xmm0

   14032709d:	66 41 0f 6e cb       	movd   xmm1,r11d

   1403270a2:	0f 5b c9             	cvtdq2ps xmm1,xmm1

   1403270a5:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1403270aa:	f3 0f 59 cf          	mulss  xmm1,xmm7

   1403270ae:	f3 41 0f 59 c2       	mulss  xmm0,xmm10

   1403270b3:	f3 41 0f 5d c3       	minss  xmm0,xmm11

   1403270b8:	0f 2f c8             	comiss xmm1,xmm0

   1403270bb:	0f 87 33 01 00 00    	ja     0x1403271f4

   1403270c1:	83 fe 01             	cmp    esi,0x1

   1403270c4:	74 13                	je     0x1403270d9

   1403270c6:	83 fe 02             	cmp    esi,0x2

   1403270c9:	0f 85 15 01 00 00    	jne    0x1403271e4

   1403270cf:	44 0f 2f c9          	comiss xmm9,xmm1

   1403270d3:	0f 86 0b 01 00 00    	jbe    0x1403271e4

   140327181:	44 0f 4d c8          	cmovge r9d,eax
   140327185:	48 ff c1             	inc    rcx
   140327188:	48 c1 e1 04          	shl    rcx,0x4
   14032718c:	8d 42 01             	lea    eax,[rdx+0x1]
   14032718f:	49 03 cf             	add    rcx,r15
   140327192:	41 3b d1             	cmp    edx,r9d
   140327195:	7f 33                	jg     0x1403271ca
   140327197:	f2 0f 10 01          	movsd  xmm0,QWORD PTR [rcx]
   14032719b:	ff c2                	inc    edx
   14032719d:	66 0f 6e c8          	movd   xmm1,eax
   1403271a1:	ff c0                	inc    eax
   1403271a3:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   1403271a6:	48 83 c1 10          	add    rcx,0x10
   1403271aa:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   1403271ae:	f3 0f 59 cf          	mulss  xmm1,xmm7
   1403271b2:	f3 0f 58 d0          	addss  xmm2,xmm0
   1403271b6:	f3 0f 59 c8          	mulss  xmm1,xmm0
   1403271ba:	f3 42 0f 58 4c c7 04 	addss  xmm1,DWORD PTR [rdi+r8*8+0x4]
   1403271c1:	f3 42 0f 11 4c c7 04 	movss  DWORD PTR [rdi+r8*8+0x4],xmm1
   1403271c8:	eb c8                	jmp    0x140327192
   1403271ca:	41 0f 2e d0          	ucomiss xmm2,xmm8
   1403271ce:	7a 02                	jp     0x1403271d2
   1403271d0:	74 0b                	je     0x1403271dd
   1403271d2:	f3 0f 5e ca          	divss  xmm1,xmm2
   1403271d6:	f3 42 0f 11 4c c7 04 	movss  DWORD PTR [rdi+r8*8+0x4],xmm1
   1403271dd:	44 8b 0d 70 2e 66 00 	mov    r9d,DWORD PTR [rip+0x662e70]        # 0x14098a054

   1403271e4:	49 83 c2 10          	add    r10,0x10

   1403271e8:	41 8b cb             	mov    ecx,r11d

   1403271eb:	44 3b db             	cmp    r11d,ebx

   1403271ee:	0f 8c 9c fe ff ff    	jl     0x140327090

   1403271f4:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]

   1403271f9:	44 8b 44 24 44       	mov    r8d,DWORD PTR [rsp+0x44]

   1403271fe:	48 8d 0d fb 8d cd ff 	lea    rcx,[rip+0xffffffffffcd8dfb]        # 0x140000000

   140327205:	44 8b 7c 24 20       	mov    r15d,DWORD PTR [rsp+0x20]

   14032720a:	ff c6                	inc    esi

   14032720c:	89 74 24 30          	mov    DWORD PTR [rsp+0x30],esi

   140327210:	83 fe 02             	cmp    esi,0x2

   140327213:	0f 86 a9 f8 ff ff    	jbe    0x140326ac2

   140327219:	44 0f 28 ac 24 a0 00 	movaps xmm13,XMMWORD PTR [rsp+0xa0]

   140327220:	00 00 

   140327222:	44 0f 28 a4 24 b0 00 	movaps xmm12,XMMWORD PTR [rsp+0xb0]

   140327229:	00 00 

   1403273bb:	48 8b 74 24 40       	mov    rsi,QWORD PTR [rsp+0x40]
   1403273c0:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]
   1403273c5:	48 83 c4 48          	add    rsp,0x48
   1403273c9:	41 5d                	pop    r13
   1403273cb:	5d                   	pop    rbp
   1403273cc:	c3                   	ret
   1403273cd:	cc                   	int3
   1403273ce:	cc                   	int3
   1403273cf:	cc                   	int3
   1403273d0:	cc                   	int3
   1403273d1:	cc                   	int3
   1403273d2:	cc                   	int3
   1403273d3:	cc                   	int3
   1403273d4:	cc                   	int3
   1403273d5:	cc                   	int3
   1403273d6:	cc                   	int3
   1403273d7:	cc                   	int3
   1403273d8:	cc                   	int3
   1403273d9:	cc                   	int3
   1403273da:	cc                   	int3
   1403273db:	cc                   	int3
   1403273dc:	cc                   	int3
   1403273dd:	cc                   	int3
   1403273de:	cc                   	int3
   1403273df:	cc                   	int3
   1403273e0:	44 8b 05 c1 2d 66 00 	mov    r8d,DWORD PTR [rip+0x662dc1]        # 0x14098a1a8

   1403273e7:	41 8b c0             	mov    eax,r8d

   1403273c5:	48 83 c4 48          	add    rsp,0x48
   1403273c9:	41 5d                	pop    r13
   1403273cb:	5d                   	pop    rbp
   1403273cc:	c3                   	ret
   1403273cd:	cc                   	int3
   1403273ce:	cc                   	int3
   1403273cf:	cc                   	int3
   1403273d0:	cc                   	int3
   1403273d1:	cc                   	int3
   1403273d2:	cc                   	int3
   1403273d3:	cc                   	int3
   1403273d4:	cc                   	int3
   1403273d5:	cc                   	int3
   1403273d6:	cc                   	int3
   1403273d7:	cc                   	int3
   1403273d8:	cc                   	int3
   1403273d9:	cc                   	int3
   1403273da:	cc                   	int3
   1403273db:	cc                   	int3
   1403273dc:	cc                   	int3
   1403273dd:	cc                   	int3
   1403273de:	cc                   	int3
   1403273df:	cc                   	int3
   1403273e0:	44 8b 05 c1 2d 66 00 	mov    r8d,DWORD PTR [rip+0x662dc1]        # 0x14098a1a8
   1403273e7:	41 8b c0             	mov    eax,r8d
   1403273ea:	8b 0d 64 2c 66 00    	mov    ecx,DWORD PTR [rip+0x662c64]        # 0x14098a054

   1403273f0:	c1 e9 02             	shr    ecx,0x2

   1403273f3:	44 3b c1             	cmp    r8d,ecx

   1403273f6:	0f 42 c1             	cmovb  eax,ecx

   1403273f9:	33 d2                	xor    edx,edx

   1403273fb:	41 f7 f0             	div    r8d

   1403273fe:	8b c8                	mov    ecx,eax

   140327400:	89 05 4a 2c 66 00    	mov    DWORD PTR [rip+0x662c4a],eax        # 0x14098a050

   140327406:	ff c8                	dec    eax

   140327408:	99                   	cdq

   140327409:	f7 f9                	idiv   ecx

   14032740b:	89 05 fb 2b 66 00    	mov    DWORD PTR [rip+0x662bfb],eax        # 0x14098a00c

   140327411:	c3                   	ret

   140327412:	cc                   	int3

   140327413:	cc                   	int3

   140327414:	cc                   	int3

   140327415:	cc                   	int3

   1403274c6:	cc                   	int3
   1403274c7:	cc                   	int3
   1403274c8:	cc                   	int3
   1403274c9:	cc                   	int3
   1403274ca:	cc                   	int3
   1403274cb:	cc                   	int3
   1403274cc:	cc                   	int3
   1403274cd:	cc                   	int3
   1403274ce:	cc                   	int3
   1403274cf:	cc                   	int3
   1403274d0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   1403274d5:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   1403274da:	48 89 74 24 20       	mov    QWORD PTR [rsp+0x20],rsi
   1403274df:	48 89 54 24 10       	mov    QWORD PTR [rsp+0x10],rdx
   1403274e4:	57                   	push   rdi
   1403274e5:	41 54                	push   r12
   1403274e7:	41 55                	push   r13
   1403274e9:	41 56                	push   r14
   1403274eb:	41 57                	push   r15
   1403274ed:	48 83 ec 20          	sub    rsp,0x20
   1403274f1:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   1403274f4:	4c 8b d2             	mov    r10,rdx
   1403274f7:	03 41 24             	add    eax,DWORD PTR [rcx+0x24]
   1403274fa:	33 d2                	xor    edx,edx
   1403274fc:	f7 35 4e 2b 66 00    	div    DWORD PTR [rip+0x662b4e]        # 0x14098a050
   140327502:	44 8b 05 4b 2b 66 00 	mov    r8d,DWORD PTR [rip+0x662b4b]        # 0x14098a054

   140327509:	41 8b f0             	mov    esi,r8d

   1403274c8:	cc                   	int3
   1403274c9:	cc                   	int3
   1403274ca:	cc                   	int3
   1403274cb:	cc                   	int3
   1403274cc:	cc                   	int3
   1403274cd:	cc                   	int3
   1403274ce:	cc                   	int3
   1403274cf:	cc                   	int3
   1403274d0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   1403274d5:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   1403274da:	48 89 74 24 20       	mov    QWORD PTR [rsp+0x20],rsi
   1403274df:	48 89 54 24 10       	mov    QWORD PTR [rsp+0x10],rdx
   1403274e4:	57                   	push   rdi
   1403274e5:	41 54                	push   r12
   1403274e7:	41 55                	push   r13
   1403274e9:	41 56                	push   r14
   1403274eb:	41 57                	push   r15
   1403274ed:	48 83 ec 20          	sub    rsp,0x20
   1403274f1:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   1403274f4:	4c 8b d2             	mov    r10,rdx
   1403274f7:	03 41 24             	add    eax,DWORD PTR [rcx+0x24]
   1403274fa:	33 d2                	xor    edx,edx
   1403274fc:	f7 35 4e 2b 66 00    	div    DWORD PTR [rip+0x662b4e]        # 0x14098a050
   140327502:	44 8b 05 4b 2b 66 00 	mov    r8d,DWORD PTR [rip+0x662b4b]        # 0x14098a054
   140327509:	41 8b f0             	mov    esi,r8d
   14032750c:	8b 15 96 2c 66 00    	mov    edx,DWORD PTR [rip+0x662c96]        # 0x14098a1a8

   140327512:	41 8b c8             	mov    ecx,r8d

   140327515:	c1 e9 02             	shr    ecx,0x2

   140327518:	8b fa                	mov    edi,edx

   14032751a:	d1 ee                	shr    esi,1

   14032751c:	8b e8                	mov    ebp,eax

   14032751e:	3b d1                	cmp    edx,ecx

   140327520:	0f 42 f9             	cmovb  edi,ecx

   140327523:	45 33 ed             	xor    r13d,r13d

   140327526:	44 39 2d 7b 24 61 00 	cmp    DWORD PTR [rip+0x61247b],r13d        # 0x1409399a8

   14032752d:	0f 86 62 01 00 00    	jbe    0x140327695

   140327533:	44 8b 0d d2 2a 66 00 	mov    r9d,DWORD PTR [rip+0x662ad2]        # 0x14098a00c

   14032753a:	45 33 ff             	xor    r15d,r15d

   14032753d:	4e 8d 34 6d b8 00 00 	lea    r14,[r13*2+0xb8]

   140327544:	00 

   140327545:	4d 03 f5             	add    r14,r13

   140327548:	4f 8d 34 f2          	lea    r14,[r10+r14*8]

   140327605:	b8 10 00 00 00       	mov    eax,0x10
   14032760a:	49 f7 e4             	mul    r12
   14032760d:	48 0f 40 c1          	cmovo  rax,rcx
   140327611:	48 8b c8             	mov    rcx,rax
   140327614:	e8 47 3f 2f 00       	call   0x14061b560
   140327619:	8b 15 ed 29 66 00    	mov    edx,DWORD PTR [rip+0x6629ed]        # 0x14098a00c
   14032761f:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   140327622:	03 d3                	add    edx,ebx
   140327624:	4c 63 c2             	movsxd r8,edx
   140327627:	4d 03 c0             	add    r8,r8
   14032762a:	4a 89 04 c1          	mov    QWORD PTR [rcx+r8*8],rax
   14032762e:	44 8b 0d d7 29 66 00 	mov    r9d,DWORD PTR [rip+0x6629d7]        # 0x14098a00c
   140327635:	49 8b 16             	mov    rdx,QWORD PTR [r14]
   140327638:	41 8d 04 19          	lea    eax,[r9+rbx*1]
   14032763c:	48 63 c8             	movsxd rcx,eax
   14032763f:	48 03 c9             	add    rcx,rcx
   140327642:	48 83 3c ca 00       	cmp    QWORD PTR [rdx+rcx*8],0x0
   140327647:	74 48                	je     0x140327691
   140327649:	ff c3                	inc    ebx
   14032764b:	3b dd                	cmp    ebx,ebp
   14032764d:	7c 81                	jl     0x1403275d0
   14032764f:	41 ff c7             	inc    r15d
   140327652:	49 83 c6 08          	add    r14,0x8
   140327656:	41 83 ff 03          	cmp    r15d,0x3
   14032765a:	73 12                	jae    0x14032766e
   14032765c:	44 8b 05 f1 29 66 00 	mov    r8d,DWORD PTR [rip+0x6629f1]        # 0x14098a054

   14032760a:	49 f7 e4             	mul    r12
   14032760d:	48 0f 40 c1          	cmovo  rax,rcx
   140327611:	48 8b c8             	mov    rcx,rax
   140327614:	e8 47 3f 2f 00       	call   0x14061b560
   140327619:	8b 15 ed 29 66 00    	mov    edx,DWORD PTR [rip+0x6629ed]        # 0x14098a00c
   14032761f:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   140327622:	03 d3                	add    edx,ebx
   140327624:	4c 63 c2             	movsxd r8,edx
   140327627:	4d 03 c0             	add    r8,r8
   14032762a:	4a 89 04 c1          	mov    QWORD PTR [rcx+r8*8],rax
   14032762e:	44 8b 0d d7 29 66 00 	mov    r9d,DWORD PTR [rip+0x6629d7]        # 0x14098a00c
   140327635:	49 8b 16             	mov    rdx,QWORD PTR [r14]
   140327638:	41 8d 04 19          	lea    eax,[r9+rbx*1]
   14032763c:	48 63 c8             	movsxd rcx,eax
   14032763f:	48 03 c9             	add    rcx,rcx
   140327642:	48 83 3c ca 00       	cmp    QWORD PTR [rdx+rcx*8],0x0
   140327647:	74 48                	je     0x140327691
   140327649:	ff c3                	inc    ebx
   14032764b:	3b dd                	cmp    ebx,ebp
   14032764d:	7c 81                	jl     0x1403275d0
   14032764f:	41 ff c7             	inc    r15d
   140327652:	49 83 c6 08          	add    r14,0x8
   140327656:	41 83 ff 03          	cmp    r15d,0x3
   14032765a:	73 12                	jae    0x14032766e
   14032765c:	44 8b 05 f1 29 66 00 	mov    r8d,DWORD PTR [rip+0x6629f1]        # 0x14098a054
   140327663:	8b 15 3f 2b 66 00    	mov    edx,DWORD PTR [rip+0x662b3f]        # 0x14098a1a8

   140327669:	e9 de fe ff ff       	jmp    0x14032754c

   14032766e:	41 ff c5             	inc    r13d

   140327671:	44 3b 2d 30 23 61 00 	cmp    r13d,DWORD PTR [rip+0x612330]        # 0x1409399a8

   140327678:	73 1b                	jae    0x140327695

   14032761f:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   140327622:	03 d3                	add    edx,ebx
   140327624:	4c 63 c2             	movsxd r8,edx
   140327627:	4d 03 c0             	add    r8,r8
   14032762a:	4a 89 04 c1          	mov    QWORD PTR [rcx+r8*8],rax
   14032762e:	44 8b 0d d7 29 66 00 	mov    r9d,DWORD PTR [rip+0x6629d7]        # 0x14098a00c
   140327635:	49 8b 16             	mov    rdx,QWORD PTR [r14]
   140327638:	41 8d 04 19          	lea    eax,[r9+rbx*1]
   14032763c:	48 63 c8             	movsxd rcx,eax
   14032763f:	48 03 c9             	add    rcx,rcx
   140327642:	48 83 3c ca 00       	cmp    QWORD PTR [rdx+rcx*8],0x0
   140327647:	74 48                	je     0x140327691
   140327649:	ff c3                	inc    ebx
   14032764b:	3b dd                	cmp    ebx,ebp
   14032764d:	7c 81                	jl     0x1403275d0
   14032764f:	41 ff c7             	inc    r15d
   140327652:	49 83 c6 08          	add    r14,0x8
   140327656:	41 83 ff 03          	cmp    r15d,0x3
   14032765a:	73 12                	jae    0x14032766e
   14032765c:	44 8b 05 f1 29 66 00 	mov    r8d,DWORD PTR [rip+0x6629f1]        # 0x14098a054
   140327663:	8b 15 3f 2b 66 00    	mov    edx,DWORD PTR [rip+0x662b3f]        # 0x14098a1a8
   140327669:	e9 de fe ff ff       	jmp    0x14032754c
   14032766e:	41 ff c5             	inc    r13d
   140327671:	44 3b 2d 30 23 61 00 	cmp    r13d,DWORD PTR [rip+0x612330]        # 0x1409399a8
   140327678:	73 1b                	jae    0x140327695
   14032767a:	44 8b 05 d3 29 66 00 	mov    r8d,DWORD PTR [rip+0x6629d3]        # 0x14098a054

   140327622:	03 d3                	add    edx,ebx
   140327624:	4c 63 c2             	movsxd r8,edx
   140327627:	4d 03 c0             	add    r8,r8
   14032762a:	4a 89 04 c1          	mov    QWORD PTR [rcx+r8*8],rax
   14032762e:	44 8b 0d d7 29 66 00 	mov    r9d,DWORD PTR [rip+0x6629d7]        # 0x14098a00c
   140327635:	49 8b 16             	mov    rdx,QWORD PTR [r14]
   140327638:	41 8d 04 19          	lea    eax,[r9+rbx*1]
   14032763c:	48 63 c8             	movsxd rcx,eax
   14032763f:	48 03 c9             	add    rcx,rcx
   140327642:	48 83 3c ca 00       	cmp    QWORD PTR [rdx+rcx*8],0x0
   140327647:	74 48                	je     0x140327691
   140327649:	ff c3                	inc    ebx
   14032764b:	3b dd                	cmp    ebx,ebp
   14032764d:	7c 81                	jl     0x1403275d0
   14032764f:	41 ff c7             	inc    r15d
   140327652:	49 83 c6 08          	add    r14,0x8
   140327656:	41 83 ff 03          	cmp    r15d,0x3
   14032765a:	73 12                	jae    0x14032766e
   14032765c:	44 8b 05 f1 29 66 00 	mov    r8d,DWORD PTR [rip+0x6629f1]        # 0x14098a054
   140327663:	8b 15 3f 2b 66 00    	mov    edx,DWORD PTR [rip+0x662b3f]        # 0x14098a1a8
   140327669:	e9 de fe ff ff       	jmp    0x14032754c
   14032766e:	41 ff c5             	inc    r13d
   140327671:	44 3b 2d 30 23 61 00 	cmp    r13d,DWORD PTR [rip+0x612330]        # 0x1409399a8
   140327678:	73 1b                	jae    0x140327695
   14032767a:	44 8b 05 d3 29 66 00 	mov    r8d,DWORD PTR [rip+0x6629d3]        # 0x14098a054
   140327681:	8b 15 21 2b 66 00    	mov    edx,DWORD PTR [rip+0x662b21]        # 0x14098a1a8

   140327687:	4c 8b 54 24 58       	mov    r10,QWORD PTR [rsp+0x58]

   14032768c:	e9 a9 fe ff ff       	jmp    0x14032753a

   140327691:	32 c0                	xor    al,al

   140327693:	eb 02                	jmp    0x140327697

   140327695:	b0 01                	mov    al,0x1

   140327697:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]

   14032769c:	48 8b 6c 24 60       	mov    rbp,QWORD PTR [rsp+0x60]

   1403276a1:	48 8b 74 24 68       	mov    rsi,QWORD PTR [rsp+0x68]

   1403276a6:	48 83 c4 20          	add    rsp,0x20

   1403276aa:	41 5f                	pop    r15

   1403276ac:	41 5e                	pop    r14

   1403276ae:	41 5d                	pop    r13

   1403276b0:	41 5c                	pop    r12

   1403276b2:	5f                   	pop    rdi

   1403276b3:	c3                   	ret

   1403276b4:	cc                   	int3

   140327f57:	5e                   	pop    rsi
   140327f58:	5d                   	pop    rbp
   140327f59:	c3                   	ret
   140327f5a:	cc                   	int3
   140327f5b:	cc                   	int3
   140327f5c:	cc                   	int3
   140327f5d:	cc                   	int3
   140327f5e:	cc                   	int3
   140327f5f:	cc                   	int3
   140327f60:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140327f65:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   140327f6a:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   140327f6f:	57                   	push   rdi
   140327f70:	48 83 ec 60          	sub    rsp,0x60
   140327f74:	48 8b f9             	mov    rdi,rcx
   140327f77:	49 8b e9             	mov    rbp,r9
   140327f7a:	b9 00 20 00 00       	mov    ecx,0x2000
   140327f7f:	49 8b f0             	mov    rsi,r8
   140327f82:	48 8b da             	mov    rbx,rdx
   140327f85:	e8 d6 35 2f 00       	call   0x14061b560
   140327f8a:	48 89 47 38          	mov    QWORD PTR [rdi+0x38],rax
   140327f8e:	48 85 c0             	test   rax,rax
   140327f91:	0f 84 4d 02 00 00    	je     0x1403281e4
   140327f97:	f3 0f 10 07          	movss  xmm0,DWORD PTR [rdi]
   140327f9b:	0f 57 c9             	xorps  xmm1,xmm1
   140327f9e:	8b 05 b0 21 66 00    	mov    eax,DWORD PTR [rip+0x6621b0]        # 0x14098a154

   140327fa4:	b9 00 01 00 00       	mov    ecx,0x100

   140327fa9:	f3 0f 10 5f 04       	movss  xmm3,DWORD PTR [rdi+0x4]

   140327fae:	48 89 74 24 30       	mov    QWORD PTR [rsp+0x30],rsi

   140327fb3:	be 01 00 00 00       	mov    esi,0x1

   140327fb8:	0f 5a c0             	cvtps2pd xmm0,xmm0

   140327fbb:	44 8b c6             	mov    r8d,esi

   140327fbe:	0f 5a db             	cvtps2pd xmm3,xmm3

   140327fc1:	f2 0f 11 44 24 28    	movsd  QWORD PTR [rsp+0x28],xmm0

   140327fc7:	f2 48 0f 2a c8       	cvtsi2sd xmm1,rax

   140327fcc:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx

   140327fd1:	0f 29 74 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm6

   140327fd6:	e8 e5 f6 ff ff       	call   0x1403276c0

   140327fdb:	ba 02 00 00 00       	mov    edx,0x2

   140327fe0:	48 8d 4d 08          	lea    rcx,[rbp+0x8]

   140327fe4:	48 2b dd             	sub    rbx,rbp

   140327fe7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]

   1403280e1:	e8 2a e4 ff ff       	call   0x140326510
   1403280e6:	f3 0f 10 0f          	movss  xmm1,DWORD PTR [rdi]
   1403280ea:	0f 57 c0             	xorps  xmm0,xmm0
   1403280ed:	0f 2e c8             	ucomiss xmm1,xmm0
   1403280f0:	8b 47 04             	mov    eax,DWORD PTR [rdi+0x4]
   1403280f3:	89 47 0c             	mov    DWORD PTR [rdi+0xc],eax
   1403280f6:	f2 0f 10 35 d2 f8 37 	movsd  xmm6,QWORD PTR [rip+0x37f8d2]        # 0x1406a79d0
   1403280fd:	00 
   1403280fe:	f3 0f 11 4f 08       	movss  DWORD PTR [rdi+0x8],xmm1
   140328103:	7a 02                	jp     0x140328107
   140328105:	74 6c                	je     0x140328173
   140328107:	bb 10 00 00 00       	mov    ebx,0x10
   14032810c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140328110:	48 8b 47 38          	mov    rax,QWORD PTR [rdi+0x38]
   140328114:	48 8d 4c 24 40       	lea    rcx,[rsp+0x40]
   140328119:	0f 10 04 03          	movups xmm0,XMMWORD PTR [rbx+rax*1]
   14032811d:	0f 29 44 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm0
   140328122:	e8 59 c4 2e 00       	call   0x140614580
   140328127:	66 0f 2f c6          	comisd xmm0,xmm6
   14032812b:	73 10                	jae    0x14032813d
   14032812d:	ff c6                	inc    esi
   14032812f:	48 83 c3 10          	add    rbx,0x10
   140328133:	81 fe 00 01 00 00    	cmp    esi,0x100
   140328139:	72 d5                	jb     0x140328110
   14032813b:	eb 29                	jmp    0x140328166
   14032813d:	8b 05 11 20 66 00    	mov    eax,DWORD PTR [rip+0x662011]        # 0x14098a154

   140328143:	8d 4e ff             	lea    ecx,[rsi-0x1]

   140328146:	0f 57 c9             	xorps  xmm1,xmm1

   140328149:	0f 57 c0             	xorps  xmm0,xmm0

   14032814c:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx

   140328151:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140328156:	f3 0f 59 c8          	mulss  xmm1,xmm0

   14032815a:	f3 0f 59 0d 4e f7 37 	mulss  xmm1,DWORD PTR [rip+0x37f74e]        # 0x1406a78b0

   140328161:	00 

   140328162:	f3 0f 11 0f          	movss  DWORD PTR [rdi],xmm1

   140328166:	81 fe 00 01 00 00    	cmp    esi,0x100

   14032816c:	75 05                	jne    0x140328173

   14032816e:	8b 47 04             	mov    eax,DWORD PTR [rdi+0x4]

   140328171:	89 07                	mov    DWORD PTR [rdi],eax

   140328173:	bb ff 00 00 00       	mov    ebx,0xff

   140328178:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]

   14032817f:	00 

   140328151:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140328156:	f3 0f 59 c8          	mulss  xmm1,xmm0
   14032815a:	f3 0f 59 0d 4e f7 37 	mulss  xmm1,DWORD PTR [rip+0x37f74e]        # 0x1406a78b0
   140328161:	00 
   140328162:	f3 0f 11 0f          	movss  DWORD PTR [rdi],xmm1
   140328166:	81 fe 00 01 00 00    	cmp    esi,0x100
   14032816c:	75 05                	jne    0x140328173
   14032816e:	8b 47 04             	mov    eax,DWORD PTR [rdi+0x4]
   140328171:	89 07                	mov    DWORD PTR [rdi],eax
   140328173:	bb ff 00 00 00       	mov    ebx,0xff
   140328178:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14032817f:	00 
   140328180:	48 8b 47 38          	mov    rax,QWORD PTR [rdi+0x38]
   140328184:	8b cb                	mov    ecx,ebx
   140328186:	48 03 c9             	add    rcx,rcx
   140328189:	0f 10 04 c8          	movups xmm0,XMMWORD PTR [rax+rcx*8]
   14032818d:	48 8d 4c 24 40       	lea    rcx,[rsp+0x40]
   140328192:	0f 29 44 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm0
   140328197:	e8 e4 c3 2e 00       	call   0x140614580
   14032819c:	66 0f 2f c6          	comisd xmm0,xmm6
   1403281a0:	73 09                	jae    0x1403281ab
   1403281a2:	ff cb                	dec    ebx
   1403281a4:	83 fb 01             	cmp    ebx,0x1
   1403281a7:	73 d7                	jae    0x140328180
   1403281a9:	eb 29                	jmp    0x1403281d4
   1403281ab:	8b 05 a3 1f 66 00    	mov    eax,DWORD PTR [rip+0x661fa3]        # 0x14098a154

   1403281b1:	0f 57 c9             	xorps  xmm1,xmm1

   1403281b4:	0f 57 c0             	xorps  xmm0,xmm0

   1403281b7:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   1403281bc:	8b c3                	mov    eax,ebx

   1403281be:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1403281c3:	f3 0f 59 c8          	mulss  xmm1,xmm0

   1403281c7:	f3 0f 59 0d e1 f6 37 	mulss  xmm1,DWORD PTR [rip+0x37f6e1]        # 0x1406a78b0

   1403281ce:	00 

   1403281cf:	f3 0f 11 4f 04       	movss  DWORD PTR [rdi+0x4],xmm1

   1403281d4:	0f 28 74 24 50       	movaps xmm6,XMMWORD PTR [rsp+0x50]

   1403281d9:	85 db                	test   ebx,ebx

   1403281db:	75 05                	jne    0x1403281e2

   1403281dd:	8b 07                	mov    eax,DWORD PTR [rdi]

   1403281df:	89 47 04             	mov    DWORD PTR [rdi+0x4],eax

   1403281e2:	b0 01                	mov    al,0x1

   1403281e4:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]

   14032872f:	8b c7                	mov    eax,edi
   140328731:	45 32 c9             	xor    r9b,r9b
   140328734:	48 89 11             	mov    QWORD PTR [rcx],rdx
   140328737:	48 89 51 08          	mov    QWORD PTR [rcx+0x8],rdx
   14032873b:	4c 8d 1c 40          	lea    r11,[rax+rax*2]
   14032873f:	48 89 51 10          	mov    QWORD PTR [rcx+0x10],rdx
   140328743:	48 89 51 18          	mov    QWORD PTR [rcx+0x18],rdx
   140328747:	48 89 51 20          	mov    QWORD PTR [rcx+0x20],rdx
   14032874b:	48 89 51 28          	mov    QWORD PTR [rcx+0x28],rdx
   14032874f:	48 89 51 30          	mov    QWORD PTR [rcx+0x30],rdx
   140328753:	48 89 51 38          	mov    QWORD PTR [rcx+0x38],rdx
   140328757:	f3 43 0f 10 04 9f    	movss  xmm0,DWORD PTR [r15+r11*4]
   14032875d:	f3 0f 11 41 08       	movss  DWORD PTR [rcx+0x8],xmm0
   140328762:	f3 0f 11 01          	movss  DWORD PTR [rcx],xmm0
   140328766:	f3 43 0f 10 44 9f 04 	movss  xmm0,DWORD PTR [r15+r11*4+0x4]
   14032876d:	f3 0f 11 41 0c       	movss  DWORD PTR [rcx+0xc],xmm0
   140328772:	f3 0f 11 41 04       	movss  DWORD PTR [rcx+0x4],xmm0
   140328777:	45 0f b6 d1          	movzx  r10d,r9b
   14032877b:	45 84 c9             	test   r9b,r9b
   14032877e:	75 07                	jne    0x140328787
   140328780:	47 8b 44 9f 08       	mov    r8d,DWORD PTR [r15+r11*4+0x8]
   140328785:	eb 06                	jmp    0x14032878d
   140328787:	41 b8 01 00 00 00    	mov    r8d,0x1
   14032878d:	46 89 44 91 18       	mov    DWORD PTR [rcx+r10*4+0x18],r8d
   140328792:	33 d2                	xor    edx,edx
   140328794:	8b 05 0e 1a 66 00    	mov    eax,DWORD PTR [rip+0x661a0e]        # 0x14098a1a8

   14032879a:	0f 57 c0             	xorps  xmm0,xmm0

   14032879d:	41 f7 f0             	div    r8d

   1403287a0:	0f 57 d2             	xorps  xmm2,xmm2

   1403287a3:	0f 28 ce             	movaps xmm1,xmm6

   1403287a6:	42 89 44 91 20       	mov    DWORD PTR [rcx+r10*4+0x20],eax

   1403287ab:	33 d2                	xor    edx,edx

   1403287ad:	41 8b c0             	mov    eax,r8d

   1403287b0:	41 fe c1             	inc    r9b

   1403287b3:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax

   140328753:	48 89 51 38          	mov    QWORD PTR [rcx+0x38],rdx
   140328757:	f3 43 0f 10 04 9f    	movss  xmm0,DWORD PTR [r15+r11*4]
   14032875d:	f3 0f 11 41 08       	movss  DWORD PTR [rcx+0x8],xmm0
   140328762:	f3 0f 11 01          	movss  DWORD PTR [rcx],xmm0
   140328766:	f3 43 0f 10 44 9f 04 	movss  xmm0,DWORD PTR [r15+r11*4+0x4]
   14032876d:	f3 0f 11 41 0c       	movss  DWORD PTR [rcx+0xc],xmm0
   140328772:	f3 0f 11 41 04       	movss  DWORD PTR [rcx+0x4],xmm0
   140328777:	45 0f b6 d1          	movzx  r10d,r9b
   14032877b:	45 84 c9             	test   r9b,r9b
   14032877e:	75 07                	jne    0x140328787
   140328780:	47 8b 44 9f 08       	mov    r8d,DWORD PTR [r15+r11*4+0x8]
   140328785:	eb 06                	jmp    0x14032878d
   140328787:	41 b8 01 00 00 00    	mov    r8d,0x1
   14032878d:	46 89 44 91 18       	mov    DWORD PTR [rcx+r10*4+0x18],r8d
   140328792:	33 d2                	xor    edx,edx
   140328794:	8b 05 0e 1a 66 00    	mov    eax,DWORD PTR [rip+0x661a0e]        # 0x14098a1a8
   14032879a:	0f 57 c0             	xorps  xmm0,xmm0
   14032879d:	41 f7 f0             	div    r8d
   1403287a0:	0f 57 d2             	xorps  xmm2,xmm2
   1403287a3:	0f 28 ce             	movaps xmm1,xmm6
   1403287a6:	42 89 44 91 20       	mov    DWORD PTR [rcx+r10*4+0x20],eax
   1403287ab:	33 d2                	xor    edx,edx
   1403287ad:	41 8b c0             	mov    eax,r8d
   1403287b0:	41 fe c1             	inc    r9b
   1403287b3:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   1403287b8:	8b 05 96 19 66 00    	mov    eax,DWORD PTR [rip+0x661996]        # 0x14098a154

   1403287be:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1403287c3:	f3 0f 5e ca          	divss  xmm1,xmm2

   1403287c7:	f3 0f 5e c2          	divss  xmm0,xmm2

   1403287cb:	f3 48 0f 2c c1       	cvttss2si rax,xmm1

   1403287d0:	f3 42 0f 11 44 91 10 	movss  DWORD PTR [rcx+r10*4+0x10],xmm0

   1403287d7:	42 89 44 91 28       	mov    DWORD PTR [rcx+r10*4+0x28],eax

   1403287dc:	8b 43 20             	mov    eax,DWORD PTR [rbx+0x20]

   1403287df:	41 f7 f0             	div    r8d

   1403287e2:	42 89 44 91 30       	mov    DWORD PTR [rcx+r10*4+0x30],eax

   1403287e7:	41 80 f9 01          	cmp    r9b,0x1

   1403287eb:	76 8a                	jbe    0x140328777

   1403287ed:	4d 8b ce             	mov    r9,r14

   1403287f0:	4c 8b c5             	mov    r8,rbp

   1403287f3:	48 8b d6             	mov    rdx,rsi

   1403287f6:	e8 65 f7 ff ff       	call   0x140327f60

   1403287fb:	84 c0                	test   al,al

   140328943:	45 85 c9             	test   r9d,r9d
   140328946:	78 1f                	js     0x140328967
   140328948:	41 8b d2             	mov    edx,r10d
   14032894b:	41 8b c9             	mov    ecx,r9d
   14032894e:	0f af d6             	imul   edx,esi
   140328951:	2b ca                	sub    ecx,edx
   140328953:	8b d1                	mov    edx,ecx
   140328955:	48 8b 8f c8 00 00 00 	mov    rcx,QWORD PTR [rdi+0xc8]
   14032895c:	48 c1 e2 04          	shl    rdx,0x4
   140328960:	49 03 d0             	add    rdx,r8
   140328963:	8b 5c 91 18          	mov    ebx,DWORD PTR [rcx+rdx*4+0x18]
   140328967:	41 8b 83 8c 04 00 00 	mov    eax,DWORD PTR [r11+0x48c]
   14032896e:	33 d2                	xor    edx,edx
   140328970:	f7 f3                	div    ebx
   140328972:	48 63 d8             	movsxd rbx,eax
   140328975:	45 85 c9             	test   r9d,r9d
   140328978:	78 1e                	js     0x140328998
   14032897a:	48 8b 8f c8 00 00 00 	mov    rcx,QWORD PTR [rdi+0xc8]
   140328981:	44 0f af d6          	imul   r10d,esi
   140328985:	45 2b ca             	sub    r9d,r10d
   140328988:	41 8b d1             	mov    edx,r9d
   14032898b:	48 c1 e2 04          	shl    rdx,0x4
   14032898f:	49 03 d0             	add    rdx,r8
   140328992:	8b 44 91 20          	mov    eax,DWORD PTR [rcx+rdx*4+0x20]
   140328996:	eb 06                	jmp    0x14032899e
   140328998:	8b 05 0a 18 66 00    	mov    eax,DWORD PTR [rip+0x66180a]        # 0x14098a1a8

   14032899e:	8b f0                	mov    esi,eax

   1403289a0:	0f 57 f6             	xorps  xmm6,xmm6

   1403289a3:	0f af b4 24 90 00 00 	imul   esi,DWORD PTR [rsp+0x90]

   1403289aa:	00 

   1403289ab:	99                   	cdq

   1403289ac:	2b c2                	sub    eax,edx

   1403289ae:	0f 57 ff             	xorps  xmm7,xmm7

   1403289b1:	d1 f8                	sar    eax,1

   1403289b3:	48 8b fb             	mov    rdi,rbx

   1403289b6:	03 f0                	add    esi,eax

   1403289b8:	8b c3                	mov    eax,ebx

   1403289ba:	41 2b c4             	sub    eax,r12d

   1403289bd:	89 34 24             	mov    DWORD PTR [rsp],esi

   1403289c0:	89 44 24 04          	mov    DWORD PTR [rsp+0x4],eax

   1403289c4:	44 8b c6             	mov    r8d,esi

   1403289c7:	99                   	cdq

   14032944b:	45 89 68 28          	mov    DWORD PTR [r8+0x28],r13d
   14032944f:	48 8b 4c c2 18       	mov    rcx,QWORD PTR [rdx+rax*8+0x18]
   140329454:	eb 50                	jmp    0x1403294a6
   140329456:	48 8d 04 da          	lea    rax,[rdx+rbx*8]
   14032945a:	44 38 ac 03 ff 03 00 	cmp    BYTE PTR [rbx+rax*1+0x3ff],r13b
   140329461:	00 
   140329462:	75 25                	jne    0x140329489
   140329464:	c6 44 24 28 01       	mov    BYTE PTR [rsp+0x28],0x1
   140329469:	45 33 c9             	xor    r9d,r9d
   14032946c:	44 0f b6 c7          	movzx  r8d,dil
   140329470:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp
   140329474:	e8 e7 f3 ff ff       	call   0x140328860
   140329479:	4c 8b 94 24 80 00 00 	mov    r10,QWORD PTR [rsp+0x80]
   140329480:	00 
   140329481:	4c 8b 9c 24 88 00 00 	mov    r11,QWORD PTR [rsp+0x88]
   140329488:	00 
   140329489:	48 8d 04 db          	lea    rax,[rbx+rbx*8]
   14032948d:	41 8b 8c 83 78 03 00 	mov    ecx,DWORD PTR [r11+rax*4+0x378]
   140329494:	00 
   140329495:	48 8d 04 db          	lea    rax,[rbx+rbx*8]
   140329499:	41 89 4c 24 28       	mov    DWORD PTR [r12+0x28],ecx
   14032949e:	49 8b 8c c3 f0 00 00 	mov    rcx,QWORD PTR [r11+rax*8+0xf0]
   1403294a5:	00 
   1403294a6:	49 89 0c 24          	mov    QWORD PTR [r12],rcx
   1403294aa:	0f 57 c0             	xorps  xmm0,xmm0
   1403294ad:	8b 05 a1 0c 66 00    	mov    eax,DWORD PTR [rip+0x660ca1]        # 0x14098a154

   1403294b3:	45 33 c9             	xor    r9d,r9d

   1403294b6:	41 c7 44 24 0c 01 00 	mov    DWORD PTR [r12+0xc],0x1

   1403294bd:	00 00 

   1403294bf:	44 0f b6 c7          	movzx  r8d,dil

   1403294c3:	40 88 74 24 28       	mov    BYTE PTR [rsp+0x28],sil

   1403294c8:	49 8b d3             	mov    rdx,r11

   1403294cb:	49 8b ca             	mov    rcx,r10

   1403294ce:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp

   1403294d2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1403294d7:	8b 84 24 a0 00 00 00 	mov    eax,DWORD PTR [rsp+0xa0]

   1403294de:	41 89 44 24 10       	mov    DWORD PTR [r12+0x10],eax

   1403294e3:	8b 84 24 a8 00 00 00 	mov    eax,DWORD PTR [rsp+0xa8]

   1403294ea:	41 89 44 24 14       	mov    DWORD PTR [r12+0x14],eax

   1403294ef:	f3 41 0f 11 44 24 08 	movss  DWORD PTR [r12+0x8],xmm0

   140329488:	00 
   140329489:	48 8d 04 db          	lea    rax,[rbx+rbx*8]
   14032948d:	41 8b 8c 83 78 03 00 	mov    ecx,DWORD PTR [r11+rax*4+0x378]
   140329494:	00 
   140329495:	48 8d 04 db          	lea    rax,[rbx+rbx*8]
   140329499:	41 89 4c 24 28       	mov    DWORD PTR [r12+0x28],ecx
   14032949e:	49 8b 8c c3 f0 00 00 	mov    rcx,QWORD PTR [r11+rax*8+0xf0]
   1403294a5:	00 
   1403294a6:	49 89 0c 24          	mov    QWORD PTR [r12],rcx
   1403294aa:	0f 57 c0             	xorps  xmm0,xmm0
   1403294ad:	8b 05 a1 0c 66 00    	mov    eax,DWORD PTR [rip+0x660ca1]        # 0x14098a154
   1403294b3:	45 33 c9             	xor    r9d,r9d
   1403294b6:	41 c7 44 24 0c 01 00 	mov    DWORD PTR [r12+0xc],0x1
   1403294bd:	00 00 
   1403294bf:	44 0f b6 c7          	movzx  r8d,dil
   1403294c3:	40 88 74 24 28       	mov    BYTE PTR [rsp+0x28],sil
   1403294c8:	49 8b d3             	mov    rdx,r11
   1403294cb:	49 8b ca             	mov    rcx,r10
   1403294ce:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp
   1403294d2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1403294d7:	8b 84 24 a0 00 00 00 	mov    eax,DWORD PTR [rsp+0xa0]
   1403294de:	41 89 44 24 10       	mov    DWORD PTR [r12+0x10],eax
   1403294e3:	8b 84 24 a8 00 00 00 	mov    eax,DWORD PTR [rsp+0xa8]
   1403294ea:	41 89 44 24 14       	mov    DWORD PTR [r12+0x14],eax
   1403294ef:	f3 41 0f 11 44 24 08 	movss  DWORD PTR [r12+0x8],xmm0
   1403294f6:	8b 05 ac 0c 66 00    	mov    eax,DWORD PTR [rip+0x660cac]        # 0x14098a1a8

   1403294fc:	41 89 44 24 18       	mov    DWORD PTR [r12+0x18],eax

   140329501:	e8 5a f3 ff ff       	call   0x140328860

   140329506:	40 84 f6             	test   sil,sil

   140329509:	e9 f5 01 00 00       	jmp    0x140329703

   14032950e:	4c 89 b4 24 90 00 00 	mov    QWORD PTR [rsp+0x90],r14

   140329515:	00 

   140329516:	41 81 ff c1 bd f0 ff 	cmp    r15d,0xfff0bdc1

   14032951d:	75 6f                	jne    0x14032958e

   14032951f:	44 8b b9 c0 00 00 00 	mov    r15d,DWORD PTR [rcx+0xc0]

   140329526:	41 ff cf             	dec    r15d

   140329529:	41 83 ff 01          	cmp    r15d,0x1

   14032952d:	7c 5c                	jl     0x14032958b

   14032952f:	4d 8b 82 c8 00 00 00 	mov    r8,QWORD PTR [r10+0xc8]

   140329536:	f3 0f 10 15 a2 0a 66 	movss  xmm2,DWORD PTR [rip+0x660aa2]        # 0x140989fe0

   14032953d:	00 

   14032953e:	49 83 c0 04          	add    r8,0x4

   14032979c:	cc                   	int3
   14032979d:	cc                   	int3
   14032979e:	cc                   	int3
   14032979f:	cc                   	int3
   1403297a0:	48 8b c4             	mov    rax,rsp
   1403297a3:	48 89 58 18          	mov    QWORD PTR [rax+0x18],rbx
   1403297a7:	55                   	push   rbp
   1403297a8:	56                   	push   rsi
   1403297a9:	57                   	push   rdi
   1403297aa:	41 54                	push   r12
   1403297ac:	41 55                	push   r13
   1403297ae:	41 56                	push   r14
   1403297b0:	41 57                	push   r15
   1403297b2:	48 81 ec d0 01 00 00 	sub    rsp,0x1d0
   1403297b9:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   1403297bd:	0f 29 78 a8          	movaps XMMWORD PTR [rax-0x58],xmm7
   1403297c1:	44 0f 29 40 98       	movaps XMMWORD PTR [rax-0x68],xmm8
   1403297c6:	48 8b 05 9b 89 64 00 	mov    rax,QWORD PTR [rip+0x64899b]        # 0x140972168
   1403297cd:	48 33 c4             	xor    rax,rsp
   1403297d0:	48 89 84 24 90 01 00 	mov    QWORD PTR [rsp+0x190],rax
   1403297d7:	00 
   1403297d8:	48 8b 84 24 48 02 00 	mov    rax,QWORD PTR [rsp+0x248]
   1403297df:	00 
   1403297e0:	4c 8d 94 24 94 00 00 	lea    r10,[rsp+0x94]
   1403297e7:	00 
   1403297e8:	8b 3d ba 09 66 00    	mov    edi,DWORD PTR [rip+0x6609ba]        # 0x14098a1a8

   1403297ee:	4c 8b e2             	mov    r12,rdx

   1403297f1:	4c 8b 9c 24 40 02 00 	mov    r11,QWORD PTR [rsp+0x240]

   1403297f8:	00 

   1403297f9:	45 33 ed             	xor    r13d,r13d

   1403297fc:	48 8b b4 24 30 02 00 	mov    rsi,QWORD PTR [rsp+0x230]

   140329803:	00 

   140329804:	32 db                	xor    bl,bl

   140329806:	48 89 84 24 88 00 00 	mov    QWORD PTR [rsp+0x88],rax

   14032980d:	00 

   14032980e:	41 8b e8             	mov    ebp,r8d

   140329811:	41 8b c0             	mov    eax,r8d

   140329814:	45 8b f1             	mov    r14d,r9d

   140329817:	99                   	cdq

   140329818:	4c 8b f9             	mov    r15,rcx

   14032981b:	f7 ff                	idiv   edi

   14032981d:	49 83 c3 10          	add    r11,0x10

   14032a1ab:	cc                   	int3
   14032a1ac:	cc                   	int3
   14032a1ad:	cc                   	int3
   14032a1ae:	cc                   	int3
   14032a1af:	cc                   	int3
   14032a1b0:	48 8b c4             	mov    rax,rsp
   14032a1b3:	48 89 58 18          	mov    QWORD PTR [rax+0x18],rbx
   14032a1b7:	55                   	push   rbp
   14032a1b8:	56                   	push   rsi
   14032a1b9:	57                   	push   rdi
   14032a1ba:	41 54                	push   r12
   14032a1bc:	41 55                	push   r13
   14032a1be:	41 56                	push   r14
   14032a1c0:	41 57                	push   r15
   14032a1c2:	48 81 ec f0 01 00 00 	sub    rsp,0x1f0
   14032a1c9:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   14032a1cd:	0f 29 78 a8          	movaps XMMWORD PTR [rax-0x58],xmm7
   14032a1d1:	44 0f 29 40 98       	movaps XMMWORD PTR [rax-0x68],xmm8
   14032a1d6:	48 8b 05 8b 7f 64 00 	mov    rax,QWORD PTR [rip+0x647f8b]        # 0x140972168
   14032a1dd:	48 33 c4             	xor    rax,rsp
   14032a1e0:	48 89 84 24 90 01 00 	mov    QWORD PTR [rsp+0x190],rax
   14032a1e7:	00 
   14032a1e8:	48 8b 84 24 70 02 00 	mov    rax,QWORD PTR [rsp+0x270]
   14032a1ef:	00 
   14032a1f0:	4c 8b e2             	mov    r12,rdx
   14032a1f3:	8b 3d af ff 65 00    	mov    edi,DWORD PTR [rip+0x65ffaf]        # 0x14098a1a8

   14032a1f9:	41 8b f0             	mov    esi,r8d

   14032a1fc:	4c 8b 94 24 68 02 00 	mov    r10,QWORD PTR [rsp+0x268]

   14032a203:	00 

   14032a204:	32 db                	xor    bl,bl

   14032a206:	4c 8b ac 24 50 02 00 	mov    r13,QWORD PTR [rsp+0x250]

   14032a20d:	00 

   14032a20e:	41 8b e9             	mov    ebp,r9d

   14032a211:	48 89 84 24 88 00 00 	mov    QWORD PTR [rsp+0x88],rax

   14032a218:	00 

   14032a219:	4c 8d 8c 24 94 00 00 	lea    r9,[rsp+0x94]

   14032a220:	00 

   14032a221:	41 8b c0             	mov    eax,r8d

   14032a224:	4c 8b f1             	mov    r14,rcx

   14032a227:	99                   	cdq

   14032a228:	45 33 c0             	xor    r8d,r8d

   14032a22b:	f7 ff                	idiv   edi

   14032af22:	44 0f 29 90 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm10
   14032af29:	ff 
   14032af2a:	44 0f 29 98 58 ff ff 	movaps XMMWORD PTR [rax-0xa8],xmm11
   14032af31:	ff 
   14032af32:	44 0f 29 a0 48 ff ff 	movaps XMMWORD PTR [rax-0xb8],xmm12
   14032af39:	ff 
   14032af3a:	44 0f 29 a8 38 ff ff 	movaps XMMWORD PTR [rax-0xc8],xmm13
   14032af41:	ff 
   14032af42:	44 0f 29 b0 28 ff ff 	movaps XMMWORD PTR [rax-0xd8],xmm14
   14032af49:	ff 
   14032af4a:	44 0f 29 b8 18 ff ff 	movaps XMMWORD PTR [rax-0xe8],xmm15
   14032af51:	ff 
   14032af52:	48 8b 05 0f 72 64 00 	mov    rax,QWORD PTR [rip+0x64720f]        # 0x140972168
   14032af59:	48 33 c4             	xor    rax,rsp
   14032af5c:	48 89 85 40 0a 00 00 	mov    QWORD PTR [rbp+0xa40],rax
   14032af63:	f3 44 0f 10 9d 68 0b 	movss  xmm11,DWORD PTR [rbp+0xb68]
   14032af6a:	00 00 
   14032af6c:	4d 8b e9             	mov    r13,r9
   14032af6f:	f3 44 0f 10 95 60 0b 	movss  xmm10,DWORD PTR [rbp+0xb60]
   14032af76:	00 00 
   14032af78:	41 8b d8             	mov    ebx,r8d
   14032af7b:	48 89 55 80          	mov    QWORD PTR [rbp-0x80],rdx
   14032af7f:	41 bb 01 00 00 00    	mov    r11d,0x1
   14032af85:	48 89 4d 88          	mov    QWORD PTR [rbp-0x78],rcx
   14032af89:	45 0f 28 c3          	movaps xmm8,xmm11
   14032af8d:	8b 0d 15 f2 65 00    	mov    ecx,DWORD PTR [rip+0x65f215]        # 0x14098a1a8

   14032af93:	f3 45 0f 5c c2       	subss  xmm8,xmm10

   14032af98:	41 8b 85 18 02 00 00 	mov    eax,DWORD PTR [r13+0x218]

   14032af9f:	99                   	cdq

   14032afa0:	44 89 44 24 50       	mov    DWORD PTR [rsp+0x50],r8d

   14032afa5:	f7 f9                	idiv   ecx

   14032afa7:	4c 89 4c 24 70       	mov    QWORD PTR [rsp+0x70],r9

   14032afac:	45 8b c8             	mov    r9d,r8d

   14032afaf:	f3 44 0f 59 05 18 50 	mulss  xmm8,DWORD PTR [rip+0x525018]        # 0x14084ffd0

   14032afb6:	52 00 

   14032afb8:	2b d8                	sub    ebx,eax

   14032afba:	41 8b 85 1c 02 00 00 	mov    eax,DWORD PTR [r13+0x21c]

   14032afc1:	ff c8                	dec    eax

   14032afc3:	89 5c 24 68          	mov    DWORD PTR [rsp+0x68],ebx

   14032afc7:	03 c1                	add    eax,ecx

   14032afc9:	99                   	cdq

   14032afca:	44 8d 43 01          	lea    r8d,[rbx+0x1]

   14032afeb:	41 0f 4f c0          	cmovg  eax,r8d
   14032afef:	ff c0                	inc    eax
   14032aff1:	89 44 24 4c          	mov    DWORD PTR [rsp+0x4c],eax
   14032aff5:	49 8d 45 18          	lea    rax,[r13+0x18]
   14032aff9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14032b000:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14032b007:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   14032b00a:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   14032b00e:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14032b015:	0f 11 41 80          	movups XMMWORD PTR [rcx-0x80],xmm0
   14032b019:	0f 10 40 a0          	movups xmm0,XMMWORD PTR [rax-0x60]
   14032b01d:	0f 11 49 90          	movups XMMWORD PTR [rcx-0x70],xmm1
   14032b021:	0f 10 48 b0          	movups xmm1,XMMWORD PTR [rax-0x50]
   14032b025:	0f 11 41 a0          	movups XMMWORD PTR [rcx-0x60],xmm0
   14032b029:	0f 10 40 c0          	movups xmm0,XMMWORD PTR [rax-0x40]
   14032b02d:	0f 11 49 b0          	movups XMMWORD PTR [rcx-0x50],xmm1
   14032b031:	0f 10 48 d0          	movups xmm1,XMMWORD PTR [rax-0x30]
   14032b035:	0f 11 41 c0          	movups XMMWORD PTR [rcx-0x40],xmm0
   14032b039:	0f 10 40 e0          	movups xmm0,XMMWORD PTR [rax-0x20]
   14032b03d:	0f 11 49 d0          	movups XMMWORD PTR [rcx-0x30],xmm1
   14032b041:	0f 10 48 f0          	movups xmm1,XMMWORD PTR [rax-0x10]
   14032b045:	0f 11 41 e0          	movups XMMWORD PTR [rcx-0x20],xmm0
   14032b049:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   14032b04d:	49 2b d3             	sub    rdx,r11
   14032b050:	75 ae                	jne    0x14032b000
   14032b052:	8b 05 fc f0 65 00    	mov    eax,DWORD PTR [rip+0x65f0fc]        # 0x14098a154

   14032b058:	48 8d 8d 40 08 00 00 	lea    rcx,[rbp+0x840]

   14032b05f:	f2 0f 10 3d 91 51 52 	movsd  xmm7,QWORD PTR [rip+0x525191]        # 0x1408501f8

   14032b066:	00 

   14032b067:	0f 57 c0             	xorps  xmm0,xmm0

   14032b06a:	89 54 24 44          	mov    DWORD PTR [rsp+0x44],edx

   14032b06e:	0f 57 f6             	xorps  xmm6,xmm6

   14032b071:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   14032b076:	8b c2                	mov    eax,edx

   14032b078:	f2 0f 5e f8          	divsd  xmm7,xmm0

   14032b07c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]

   14032b080:	f2 0f 10 01          	movsd  xmm0,QWORD PTR [rcx]

   14032b084:	66 0f 2e c6          	ucomisd xmm0,xmm6

   14032b088:	7a 0f                	jp     0x14032b099

   14032b08a:	75 0d                	jne    0x14032b099

   14032b08c:	ff c0                	inc    eax

   14032b08e:	48 83 c1 08          	add    rcx,0x8

   14032b225:	f2 0f 2c c3          	cvttsd2si eax,xmm3
   14032b229:	85 c0                	test   eax,eax
   14032b22b:	0f 49 c8             	cmovns ecx,eax
   14032b22e:	41 3b ca             	cmp    ecx,r10d
   14032b231:	7c 04                	jl     0x14032b237
   14032b233:	41 8d 4a ff          	lea    ecx,[r10-0x1]
   14032b237:	0f 57 d2             	xorps  xmm2,xmm2
   14032b23a:	48 63 c1             	movsxd rax,ecx
   14032b23d:	41 0f 28 c1          	movaps xmm0,xmm9
   14032b241:	f3 41 0f 10 0c 83    	movss  xmm1,DWORD PTR [r11+rax*4]
   14032b247:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032b24b:	f3 0f 59 0e          	mulss  xmm1,DWORD PTR [rsi]
   14032b24f:	f3 0f 5a d0          	cvtss2sd xmm2,xmm0
   14032b253:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14032b256:	f2 0f 59 d4          	mulsd  xmm2,xmm4
   14032b25a:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14032b25e:	f2 42 0f 11 94 05 e0 	movsd  QWORD PTR [rbp+r8*1+0x1e0],xmm2
   14032b265:	01 00 00 
   14032b268:	41 ff c1             	inc    r9d
   14032b26b:	49 83 c0 08          	add    r8,0x8
   14032b26f:	41 83 f9 40          	cmp    r9d,0x40
   14032b273:	0f 82 47 ff ff ff    	jb     0x14032b1c0
   14032b279:	8b 4c 24 44          	mov    ecx,DWORD PTR [rsp+0x44]
   14032b27d:	33 d2                	xor    edx,edx
   14032b27f:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14032b284:	44 8b 05 1d ef 65 00 	mov    r8d,DWORD PTR [rip+0x65ef1d]        # 0x14098a1a8

   14032b28b:	f2 0f 10 84 cd e0 01 	movsd  xmm0,QWORD PTR [rbp+rcx*8+0x1e0]

   14032b292:	00 00 

   14032b294:	48 8d 8f 00 fe ff ff 	lea    rcx,[rdi-0x200]

   14032b29b:	41 8b 85 28 02 00 00 	mov    eax,DWORD PTR [r13+0x228]

   14032b2a2:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0

   14032b2a6:	89 07                	mov    DWORD PTR [rdi],eax

   14032b2a8:	41 0f b6 85 2c 02 00 	movzx  eax,BYTE PTR [r13+0x22c]

   14032b2af:	00 

   14032b2b0:	88 47 04             	mov    BYTE PTR [rdi+0x4],al

   14032b2b3:	f3 0f 11 87 d8 fd ff 	movss  DWORD PTR [rdi-0x228],xmm0

   14032b2ba:	ff 

   14032b2bb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

   14032b2c0:	f2 0f 10 54 0b f0    	movsd  xmm2,QWORD PTR [rbx+rcx*1-0x10]

   14032b2c6:	66 0f 2e d6          	ucomisd xmm2,xmm6

   14032b2ca:	7a 02                	jp     0x14032b2ce

   14032b2cc:	74 34                	je     0x14032b302

   14032b702:	41 8d 4a ff          	lea    ecx,[r10-0x1]
   14032b706:	0f 57 d2             	xorps  xmm2,xmm2
   14032b709:	48 63 c1             	movsxd rax,ecx
   14032b70c:	41 0f 28 c1          	movaps xmm0,xmm9
   14032b710:	f3 41 0f 10 0c 83    	movss  xmm1,DWORD PTR [r11+rax*4]
   14032b716:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032b71a:	f3 0f 59 cd          	mulss  xmm1,xmm5
   14032b71e:	f3 0f 5a d0          	cvtss2sd xmm2,xmm0
   14032b722:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14032b725:	f2 0f 59 d4          	mulsd  xmm2,xmm4
   14032b729:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14032b72d:	f2 42 0f 11 94 05 e0 	movsd  QWORD PTR [rbp+r8*1+0x1e0],xmm2
   14032b734:	01 00 00 
   14032b737:	41 ff c1             	inc    r9d
   14032b73a:	49 83 c0 08          	add    r8,0x8
   14032b73e:	41 83 f9 40          	cmp    r9d,0x40
   14032b742:	0f 82 48 ff ff ff    	jb     0x14032b690
   14032b748:	8b 5c 24 5c          	mov    ebx,DWORD PTR [rsp+0x5c]
   14032b74c:	48 8d 4d b0          	lea    rcx,[rbp-0x50]
   14032b750:	33 d2                	xor    edx,edx
   14032b752:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032b758:	e8 8d 55 2f 00       	call   0x140620cea
   14032b75d:	8b 4c 24 44          	mov    ecx,DWORD PTR [rsp+0x44]
   14032b761:	33 d2                	xor    edx,edx
   14032b763:	41 8b 85 28 02 00 00 	mov    eax,DWORD PTR [r13+0x228]
   14032b76a:	44 8b 05 37 ea 65 00 	mov    r8d,DWORD PTR [rip+0x65ea37]        # 0x14098a1a8

   14032b771:	89 85 d8 01 00 00    	mov    DWORD PTR [rbp+0x1d8],eax

   14032b777:	f2 0f 10 84 cd e0 01 	movsd  xmm0,QWORD PTR [rbp+rcx*8+0x1e0]

   14032b77e:	00 00 

   14032b780:	33 c9                	xor    ecx,ecx

   14032b782:	41 0f b6 85 2c 02 00 	movzx  eax,BYTE PTR [r13+0x22c]

   14032b789:	00 

   14032b78a:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0

   14032b78e:	88 85 dc 01 00 00    	mov    BYTE PTR [rbp+0x1dc],al

   14032b794:	f3 0f 11 45 b0       	movss  DWORD PTR [rbp-0x50],xmm0

   14032b799:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]

   14032b7a0:	f2 0f 10 94 0d e0 01 	movsd  xmm2,QWORD PTR [rbp+rcx*1+0x1e0]

   14032b7a7:	00 00 

   14032b7a9:	66 0f 2e d6          	ucomisd xmm2,xmm6

   14032b7ad:	7a 02                	jp     0x14032b7b1

   14032b7af:	74 37                	je     0x14032b7e8

   14032b7b1:	f2 0f 10 84 0d e8 01 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x1e8]

   14032bd47:	0f 57 d2             	xorps  xmm2,xmm2
   14032bd4a:	48 63 c1             	movsxd rax,ecx
   14032bd4d:	41 0f 28 c1          	movaps xmm0,xmm9
   14032bd51:	f3 0f 10 0c 83       	movss  xmm1,DWORD PTR [rbx+rax*4]
   14032bd56:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032bd5a:	f3 41 0f 59 0b       	mulss  xmm1,DWORD PTR [r11]
   14032bd5f:	f3 0f 5a d0          	cvtss2sd xmm2,xmm0
   14032bd63:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14032bd66:	f2 0f 59 d4          	mulsd  xmm2,xmm4
   14032bd6a:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14032bd6e:	f2 42 0f 11 94 05 e0 	movsd  QWORD PTR [rbp+r8*1+0x1e0],xmm2
   14032bd75:	01 00 00 
   14032bd78:	41 ff c1             	inc    r9d
   14032bd7b:	49 83 c0 08          	add    r8,0x8
   14032bd7f:	41 83 f9 40          	cmp    r9d,0x40
   14032bd83:	0f 82 47 ff ff ff    	jb     0x14032bcd0
   14032bd89:	48 8b 4c 24 78       	mov    rcx,QWORD PTR [rsp+0x78]
   14032bd8e:	33 d2                	xor    edx,edx
   14032bd90:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14032bd95:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032bd9b:	e8 4a 4f 2f 00       	call   0x140620cea
   14032bda0:	41 8b 85 28 02 00 00 	mov    eax,DWORD PTR [r13+0x228]
   14032bda7:	4c 8d 8d e8 01 00 00 	lea    r9,[rbp+0x1e8]
   14032bdae:	8b 4c 24 44          	mov    ecx,DWORD PTR [rsp+0x44]
   14032bdb2:	4c 8d 95 f0 01 00 00 	lea    r10,[rbp+0x1f0]
   14032bdb9:	44 8b 05 e8 e3 65 00 	mov    r8d,DWORD PTR [rip+0x65e3e8]        # 0x14098a1a8

   14032bdc0:	4c 8d 9d f8 01 00 00 	lea    r11,[rbp+0x1f8]

   14032bdc7:	41 89 06             	mov    DWORD PTR [r14],eax

   14032bdca:	48 8d 9d 00 02 00 00 	lea    rbx,[rbp+0x200]

   14032bdd1:	41 0f b6 85 2c 02 00 	movzx  eax,BYTE PTR [r13+0x22c]

   14032bdd8:	00 

   14032bdd9:	4c 8d b5 10 02 00 00 	lea    r14,[rbp+0x210]

   14032bde0:	f2 0f 10 84 cd e0 01 	movsd  xmm0,QWORD PTR [rbp+rcx*8+0x1e0]

   14032bde7:	00 00 

   14032bde9:	4c 8d ad 20 02 00 00 	lea    r13,[rbp+0x220]

   14032bdf0:	41 88 07             	mov    BYTE PTR [r15],al

   14032bdf3:	48 8d 8d 08 04 00 00 	lea    rcx,[rbp+0x408]

   14032bdfa:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]

   14032be01:	33 d2                	xor    edx,edx

   14032be03:	4c 2b c8             	sub    r9,rax

   14032be06:	4c 8d bd 18 02 00 00 	lea    r15,[rbp+0x218]

   14032be0d:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]

   14032c569:	41 57                	push   r15
   14032c56b:	48 8d ac 24 90 f9 ff 	lea    rbp,[rsp-0x670]
   14032c572:	ff 
   14032c573:	48 81 ec 70 07 00 00 	sub    rsp,0x770
   14032c57a:	0f 29 b4 24 50 07 00 	movaps XMMWORD PTR [rsp+0x750],xmm6
   14032c581:	00 
   14032c582:	44 0f 29 8c 24 20 07 	movaps XMMWORD PTR [rsp+0x720],xmm9
   14032c589:	00 00 
   14032c58b:	48 8b 05 d6 5b 64 00 	mov    rax,QWORD PTR [rip+0x645bd6]        # 0x140972168
   14032c592:	48 33 c4             	xor    rax,rsp
   14032c595:	48 89 85 e0 05 00 00 	mov    QWORD PTR [rbp+0x5e0],rax
   14032c59c:	48 8b 9d e0 06 00 00 	mov    rbx,QWORD PTR [rbp+0x6e0]
   14032c5a3:	45 8b f8             	mov    r15d,r8d
   14032c5a6:	44 89 44 24 54       	mov    DWORD PTR [rsp+0x54],r8d
   14032c5ab:	48 8b f2             	mov    rsi,rdx
   14032c5ae:	4c 8b f1             	mov    r14,rcx
   14032c5b1:	48 89 4c 24 60       	mov    QWORD PTR [rsp+0x60],rcx
   14032c5b6:	33 d2                	xor    edx,edx
   14032c5b8:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032c5be:	49 8b c9             	mov    rcx,r9
   14032c5c1:	49 8b f9             	mov    rdi,r9
   14032c5c4:	e8 21 47 2f 00       	call   0x140620cea
   14032c5c9:	48 63 0b             	movsxd rcx,DWORD PTR [rbx]
   14032c5cc:	41 8b d7             	mov    edx,r15d
   14032c5cf:	2b 56 0c             	sub    edx,DWORD PTR [rsi+0xc]
   14032c5d2:	0f af 15 7b da 65 00 	imul   edx,DWORD PTR [rip+0x65da7b]        # 0x14098a054

   14032c5d9:	4c 8b be 90 04 00 00 	mov    r15,QWORD PTR [rsi+0x490]

   14032c5e0:	8d 41 01             	lea    eax,[rcx+0x1]

   14032c5e3:	3b 05 6f da 65 00    	cmp    eax,DWORD PTR [rip+0x65da6f]        # 0x14098a058

   14032c5e9:	89 03                	mov    DWORD PTR [rbx],eax

   14032c5eb:	48 89 54 24 70       	mov    QWORD PTR [rsp+0x70],rdx

   14032c5f0:	0f 8d df 05 00 00    	jge    0x14032cbd5

   14032c5f6:	48 8b 86 38 05 00 00 	mov    rax,QWORD PTR [rsi+0x538]

   14032c5fd:	45 0f 57 c9          	xorps  xmm9,xmm9

   14032c601:	48 63 44 88 04       	movsxd rax,DWORD PTR [rax+rcx*4+0x4]

   14032c606:	48 89 44 24 68       	mov    QWORD PTR [rsp+0x68],rax

   14032c60b:	4c 8d 2c 10          	lea    r13,[rax+rdx*1]

   14032c60f:	49 8b cd             	mov    rcx,r13

   14032c612:	48 03 c9             	add    rcx,rcx

   14032c615:	f3 41 0f 10 74 cf 04 	movss  xmm6,DWORD PTR [r15+rcx*8+0x4]

   14032c61c:	41 0f 2e f1          	ucomiss xmm6,xmm9

   14032c620:	7a 06                	jp     0x14032c628

   14032c5c9:	48 63 0b             	movsxd rcx,DWORD PTR [rbx]
   14032c5cc:	41 8b d7             	mov    edx,r15d
   14032c5cf:	2b 56 0c             	sub    edx,DWORD PTR [rsi+0xc]
   14032c5d2:	0f af 15 7b da 65 00 	imul   edx,DWORD PTR [rip+0x65da7b]        # 0x14098a054
   14032c5d9:	4c 8b be 90 04 00 00 	mov    r15,QWORD PTR [rsi+0x490]
   14032c5e0:	8d 41 01             	lea    eax,[rcx+0x1]
   14032c5e3:	3b 05 6f da 65 00    	cmp    eax,DWORD PTR [rip+0x65da6f]        # 0x14098a058
   14032c5e9:	89 03                	mov    DWORD PTR [rbx],eax
   14032c5eb:	48 89 54 24 70       	mov    QWORD PTR [rsp+0x70],rdx
   14032c5f0:	0f 8d df 05 00 00    	jge    0x14032cbd5
   14032c5f6:	48 8b 86 38 05 00 00 	mov    rax,QWORD PTR [rsi+0x538]
   14032c5fd:	45 0f 57 c9          	xorps  xmm9,xmm9
   14032c601:	48 63 44 88 04       	movsxd rax,DWORD PTR [rax+rcx*4+0x4]
   14032c606:	48 89 44 24 68       	mov    QWORD PTR [rsp+0x68],rax
   14032c60b:	4c 8d 2c 10          	lea    r13,[rax+rdx*1]
   14032c60f:	49 8b cd             	mov    rcx,r13
   14032c612:	48 03 c9             	add    rcx,rcx
   14032c615:	f3 41 0f 10 74 cf 04 	movss  xmm6,DWORD PTR [r15+rcx*8+0x4]
   14032c61c:	41 0f 2e f1          	ucomiss xmm6,xmm9
   14032c620:	7a 06                	jp     0x14032c628
   14032c622:	0f 84 ad 05 00 00    	je     0x14032cbd5
   14032c628:	f3 41 0f 10 0c cf    	movss  xmm1,DWORD PTR [r15+rcx*8]
   14032c62e:	41 0f 2e c9          	ucomiss xmm1,xmm9
   14032c632:	7a 06                	jp     0x14032c63a
   14032c634:	0f 84 9b 05 00 00    	je     0x14032cbd5
   14032c63a:	8b 05 14 da 65 00    	mov    eax,DWORD PTR [rip+0x65da14]        # 0x14098a054

   14032c640:	0f 57 c0             	xorps  xmm0,xmm0

   14032c643:	0f 5a c9             	cvtps2pd xmm1,xmm1

   14032c646:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   14032c64b:	f2 0f 58 c0          	addsd  xmm0,xmm0

   14032c64f:	f2 0f 5e c8          	divsd  xmm1,xmm0

   14032c653:	f2 0f 10 05 1d 3b 52 	movsd  xmm0,QWORD PTR [rip+0x523b1d]        # 0x140850178

   14032c65a:	00 

   14032c65b:	f2 0f 5e 0d 55 b3 37 	divsd  xmm1,QWORD PTR [rip+0x37b355]        # 0x1406a79b8

   14032c662:	00 

   14032c663:	66 0f 2f c1          	comisd xmm0,xmm1

   14032c667:	0f 87 68 05 00 00    	ja     0x14032cbd5

   14032c66d:	41 0f b7 4c cf 08    	movzx  ecx,WORD PTR [r15+rcx*8+0x8]

   14032c673:	4c 89 a4 24 68 07 00 	mov    QWORD PTR [rsp+0x768],r12

   14032c67a:	00 

   14032c67b:	0f 29 bc 24 40 07 00 	movaps XMMWORD PTR [rsp+0x740],xmm7

   14032c682:	00 

   14032c6fa:	f3 41 0f 5e c3       	divss  xmm0,xmm11
   14032c6ff:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14032c704:	0f 57 c0             	xorps  xmm0,xmm0
   14032c707:	41 3b c4             	cmp    eax,r12d
   14032c70a:	44 0f 47 e0          	cmova  r12d,eax
   14032c70e:	41 8b c4             	mov    eax,r12d
   14032c711:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14032c716:	f3 41 0f 59 c3       	mulss  xmm0,xmm11
   14032c71b:	f3 0f 5c f8          	subss  xmm7,xmm0
   14032c71f:	41 0f 2f fa          	comiss xmm7,xmm10
   14032c723:	77 04                	ja     0x14032c729
   14032c725:	41 0f 28 fa          	movaps xmm7,xmm10
   14032c729:	44 0f 28 c7          	movaps xmm8,xmm7
   14032c72d:	f3 44 0f 5e 05 be b3 	divss  xmm8,DWORD PTR [rip+0x37b3be]        # 0x1406a7af4
   14032c734:	37 00 
   14032c736:	45 0f 2f c1          	comiss xmm8,xmm9
   14032c73a:	77 04                	ja     0x14032c740
   14032c73c:	45 0f 57 c0          	xorps  xmm8,xmm8
   14032c740:	33 d2                	xor    edx,edx
   14032c742:	48 8d 8d e0 03 00 00 	lea    rcx,[rbp+0x3e0]
   14032c749:	41 b8 00 02 00 00    	mov    r8d,0x200
   14032c74f:	f3 45 0f 58 c0       	addss  xmm8,xmm8
   14032c754:	e8 91 45 2f 00       	call   0x140620cea
   14032c759:	8b 5c 24 54          	mov    ebx,DWORD PTR [rsp+0x54]
   14032c75d:	33 c0                	xor    eax,eax
   14032c75f:	44 8b 15 42 da 65 00 	mov    r10d,DWORD PTR [rip+0x65da42]        # 0x14098a1a8

   14032c766:	44 8b db             	mov    r11d,ebx

   14032c769:	f3 44 0f 10 25 be 38 	movss  xmm12,DWORD PTR [rip+0x5238be]        # 0x140850030

   14032c770:	52 00 

   14032c772:	45 0f af da          	imul   r11d,r10d

   14032c776:	41 0f 2e f9          	ucomiss xmm7,xmm9

   14032c77a:	7a 0e                	jp     0x14032c78a

   14032c77c:	75 0c                	jne    0x14032c78a

   14032c77e:	45 8b 4e 28          	mov    r9d,DWORD PTR [r14+0x28]

   14032c782:	44 8b c0             	mov    r8d,eax

   14032c785:	e9 92 00 00 00       	jmp    0x14032c81c

   14032c725:	41 0f 28 fa          	movaps xmm7,xmm10
   14032c729:	44 0f 28 c7          	movaps xmm8,xmm7
   14032c72d:	f3 44 0f 5e 05 be b3 	divss  xmm8,DWORD PTR [rip+0x37b3be]        # 0x1406a7af4
   14032c734:	37 00 
   14032c736:	45 0f 2f c1          	comiss xmm8,xmm9
   14032c73a:	77 04                	ja     0x14032c740
   14032c73c:	45 0f 57 c0          	xorps  xmm8,xmm8
   14032c740:	33 d2                	xor    edx,edx
   14032c742:	48 8d 8d e0 03 00 00 	lea    rcx,[rbp+0x3e0]
   14032c749:	41 b8 00 02 00 00    	mov    r8d,0x200
   14032c74f:	f3 45 0f 58 c0       	addss  xmm8,xmm8
   14032c754:	e8 91 45 2f 00       	call   0x140620cea
   14032c759:	8b 5c 24 54          	mov    ebx,DWORD PTR [rsp+0x54]
   14032c75d:	33 c0                	xor    eax,eax
   14032c75f:	44 8b 15 42 da 65 00 	mov    r10d,DWORD PTR [rip+0x65da42]        # 0x14098a1a8
   14032c766:	44 8b db             	mov    r11d,ebx
   14032c769:	f3 44 0f 10 25 be 38 	movss  xmm12,DWORD PTR [rip+0x5238be]        # 0x140850030
   14032c770:	52 00 
   14032c772:	45 0f af da          	imul   r11d,r10d
   14032c776:	41 0f 2e f9          	ucomiss xmm7,xmm9
   14032c77a:	7a 0e                	jp     0x14032c78a
   14032c77c:	75 0c                	jne    0x14032c78a
   14032c77e:	45 8b 4e 28          	mov    r9d,DWORD PTR [r14+0x28]
   14032c782:	44 8b c0             	mov    r8d,eax
   14032c785:	e9 92 00 00 00       	jmp    0x14032c81c
   14032c78a:	8b 05 c4 d9 65 00    	mov    eax,DWORD PTR [rip+0x65d9c4]        # 0x14098a154

   14032c790:	0f 57 c9             	xorps  xmm1,xmm1

   14032c793:	f3 0f 10 15 6d b1 37 	movss  xmm2,DWORD PTR [rip+0x37b16d]        # 0x1406a7908

   14032c79a:	00 

   14032c79b:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   14032c7a0:	0f 28 c1             	movaps xmm0,xmm1

   14032c7a3:	f3 0f 59 05 4d 99 37 	mulss  xmm0,DWORD PTR [rip+0x37994d]        # 0x1406a60f8

   14032c7aa:	00 

   14032c7ab:	f3 0f 5e c7          	divss  xmm0,xmm7

   14032c7af:	f3 0f 58 c2          	addss  xmm0,xmm2

   14032c7b3:	f3 48 0f 2c c0       	cvttss2si rax,xmm0

   14032c7b8:	0f 28 c1             	movaps xmm0,xmm1

   14032c7bb:	f3 0f 59 05 25 19 36 	mulss  xmm0,DWORD PTR [rip+0x361925]        # 0x14068e0e8

   14032c7c2:	00 

   14032c7c3:	f3 0f 58 c2          	addss  xmm0,xmm2

   14032c7c7:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0

   14032c7cc:	41 3b c0             	cmp    eax,r8d

   14032cbe9:	41 55                	push   r13
   14032cbeb:	41 56                	push   r14
   14032cbed:	41 57                	push   r15
   14032cbef:	48 81 ec 88 05 00 00 	sub    rsp,0x588
   14032cbf6:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   14032cbfa:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   14032cbfe:	44 0f 29 40 88       	movaps XMMWORD PTR [rax-0x78],xmm8
   14032cc03:	44 0f 29 88 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm9
   14032cc0a:	ff 
   14032cc0b:	44 0f 29 90 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm10
   14032cc12:	ff 
   14032cc13:	44 0f 29 98 58 ff ff 	movaps XMMWORD PTR [rax-0xa8],xmm11
   14032cc1a:	ff 
   14032cc1b:	44 0f 29 a0 48 ff ff 	movaps XMMWORD PTR [rax-0xb8],xmm12
   14032cc22:	ff 
   14032cc23:	44 0f 29 a8 38 ff ff 	movaps XMMWORD PTR [rax-0xc8],xmm13
   14032cc2a:	ff 
   14032cc2b:	44 0f 29 b0 28 ff ff 	movaps XMMWORD PTR [rax-0xd8],xmm14
   14032cc32:	ff 
   14032cc33:	44 0f 29 b8 18 ff ff 	movaps XMMWORD PTR [rax-0xe8],xmm15
   14032cc3a:	ff 
   14032cc3b:	48 8b 05 26 55 64 00 	mov    rax,QWORD PTR [rip+0x645526]        # 0x140972168
   14032cc42:	48 33 c4             	xor    rax,rsp
   14032cc45:	48 89 84 24 d0 04 00 	mov    QWORD PTR [rsp+0x4d0],rax
   14032cc4c:	00 
   14032cc4d:	8b 05 01 d5 65 00    	mov    eax,DWORD PTR [rip+0x65d501]        # 0x14098a154

   14032cc53:	0f 57 f6             	xorps  xmm6,xmm6

   14032cc56:	40 32 ff             	xor    dil,dil

   14032cc59:	44 89 44 24 78       	mov    DWORD PTR [rsp+0x78],r8d

   14032cc5e:	83 3d 43 cd 60 00 03 	cmp    DWORD PTR [rip+0x60cd43],0x3        # 0x1409399a8

   14032cc65:	0f 57 c0             	xorps  xmm0,xmm0

   14032cc68:	49 8b d9             	mov    rbx,r9

   14032cc6b:	48 89 54 24 70       	mov    QWORD PTR [rsp+0x70],rdx

   14032cc70:	f3 48 0f 2a f0       	cvtsi2ss xmm6,rax

   14032cc0b:	44 0f 29 90 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm10
   14032cc12:	ff 
   14032cc13:	44 0f 29 98 58 ff ff 	movaps XMMWORD PTR [rax-0xa8],xmm11
   14032cc1a:	ff 
   14032cc1b:	44 0f 29 a0 48 ff ff 	movaps XMMWORD PTR [rax-0xb8],xmm12
   14032cc22:	ff 
   14032cc23:	44 0f 29 a8 38 ff ff 	movaps XMMWORD PTR [rax-0xc8],xmm13
   14032cc2a:	ff 
   14032cc2b:	44 0f 29 b0 28 ff ff 	movaps XMMWORD PTR [rax-0xd8],xmm14
   14032cc32:	ff 
   14032cc33:	44 0f 29 b8 18 ff ff 	movaps XMMWORD PTR [rax-0xe8],xmm15
   14032cc3a:	ff 
   14032cc3b:	48 8b 05 26 55 64 00 	mov    rax,QWORD PTR [rip+0x645526]        # 0x140972168
   14032cc42:	48 33 c4             	xor    rax,rsp
   14032cc45:	48 89 84 24 d0 04 00 	mov    QWORD PTR [rsp+0x4d0],rax
   14032cc4c:	00 
   14032cc4d:	8b 05 01 d5 65 00    	mov    eax,DWORD PTR [rip+0x65d501]        # 0x14098a154
   14032cc53:	0f 57 f6             	xorps  xmm6,xmm6
   14032cc56:	40 32 ff             	xor    dil,dil
   14032cc59:	44 89 44 24 78       	mov    DWORD PTR [rsp+0x78],r8d
   14032cc5e:	83 3d 43 cd 60 00 03 	cmp    DWORD PTR [rip+0x60cd43],0x3        # 0x1409399a8
   14032cc65:	0f 57 c0             	xorps  xmm0,xmm0
   14032cc68:	49 8b d9             	mov    rbx,r9
   14032cc6b:	48 89 54 24 70       	mov    QWORD PTR [rsp+0x70],rdx
   14032cc70:	f3 48 0f 2a f0       	cvtsi2ss xmm6,rax
   14032cc75:	8b 05 d9 d3 65 00    	mov    eax,DWORD PTR [rip+0x65d3d9]        # 0x14098a054

   14032cc7b:	45 8b e0             	mov    r12d,r8d

   14032cc7e:	48 89 9c 24 98 00 00 	mov    QWORD PTR [rsp+0x98],rbx

   14032cc85:	00 

   14032cc86:	4c 8b f9             	mov    r15,rcx

   14032cc89:	48 89 8c 24 90 00 00 	mov    QWORD PTR [rsp+0x90],rcx

   14032cc90:	00 

   14032cc91:	89 7c 24 60          	mov    DWORD PTR [rsp+0x60],edi

   14032cc95:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14032cc9a:	44 0f 28 ee          	movaps xmm13,xmm6

   14032cc9e:	f3 44 0f 59 2d 35 33 	mulss  xmm13,DWORD PTR [rip+0x523335]        # 0x14084ffdc

   14032cca5:	52 00 

   14032cca7:	f3 44 0f 5e e8       	divss  xmm13,xmm0

   14032ccac:	72 31                	jb     0x14032ccdf

   14032ccae:	41 0f b7 81 f0 00 00 	movzx  eax,WORD PTR [r9+0xf0]

   14032ccb5:	00 

   14032ccb6:	b9 00 b8 ff ff       	mov    ecx,0xffffb800

   14032cd0a:	00 
   14032cd0b:	f3 0f 5e 05 8d a4 36 	divss  xmm0,DWORD PTR [rip+0x36a48d]        # 0x1406971a0
   14032cd12:	00 
   14032cd13:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14032cd18:	0f 57 c0             	xorps  xmm0,xmm0
   14032cd1b:	3b c1                	cmp    eax,ecx
   14032cd1d:	0f 47 c8             	cmova  ecx,eax
   14032cd20:	33 d2                	xor    edx,edx
   14032cd22:	8b c1                	mov    eax,ecx
   14032cd24:	89 4c 24 7c          	mov    DWORD PTR [rsp+0x7c],ecx
   14032cd28:	48 8d 8c 24 d0 02 00 	lea    rcx,[rsp+0x2d0]
   14032cd2f:	00 
   14032cd30:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14032cd35:	f3 0f 59 05 63 a4 36 	mulss  xmm0,DWORD PTR [rip+0x36a463]        # 0x1406971a0
   14032cd3c:	00 
   14032cd3d:	f3 0f 5c f8          	subss  xmm7,xmm0
   14032cd41:	f3 0f 5f 3d 5b 43 68 	maxss  xmm7,DWORD PTR [rip+0x1468435b]        # 0x1549b10a4
   14032cd48:	14 
   14032cd49:	0f 28 c7             	movaps xmm0,xmm7
   14032cd4c:	f3 0f 5e 05 a0 ad 37 	divss  xmm0,DWORD PTR [rip+0x37ada0]        # 0x1406a7af4
   14032cd53:	00 
   14032cd54:	f3 41 0f 5f c3       	maxss  xmm0,xmm11
   14032cd59:	f3 0f 11 84 24 80 00 	movss  DWORD PTR [rsp+0x80],xmm0
   14032cd60:	00 00 
   14032cd62:	e8 83 3f 2f 00       	call   0x140620cea
   14032cd67:	44 8b 15 3a d4 65 00 	mov    r10d,DWORD PTR [rip+0x65d43a]        # 0x14098a1a8

   14032cd6e:	45 8b dc             	mov    r11d,r12d

   14032cd71:	f3 44 0f 10 25 b6 32 	movss  xmm12,DWORD PTR [rip+0x5232b6]        # 0x140850030

   14032cd78:	52 00 

   14032cd7a:	33 f6                	xor    esi,esi

   14032cd7c:	45 0f af da          	imul   r11d,r10d

   14032cd80:	41 0f 2e fb          	ucomiss xmm7,xmm11

   14032cd84:	7a 0e                	jp     0x14032cd94

   14032cd86:	75 0c                	jne    0x14032cd94

   14032cd88:	45 8b 4f 28          	mov    r9d,DWORD PTR [r15+0x28]

   14032cd8c:	44 8b c6             	mov    r8d,esi

   14032cd8f:	e9 83 00 00 00       	jmp    0x14032ce17

   14032cd94:	f3 0f 10 0d 6c ab 37 	movss  xmm1,DWORD PTR [rip+0x37ab6c]        # 0x1406a7908

   14032cd9b:	00 

   14032cd9c:	0f 28 c6             	movaps xmm0,xmm6

   14032cd9f:	f3 0f 59 05 51 93 37 	mulss  xmm0,DWORD PTR [rip+0x379351]        # 0x1406a60f8

   14032cda6:	00 

   1403302d2:	cc                   	int3
   1403302d3:	cc                   	int3
   1403302d4:	cc                   	int3
   1403302d5:	cc                   	int3
   1403302d6:	cc                   	int3
   1403302d7:	cc                   	int3
   1403302d8:	cc                   	int3
   1403302d9:	cc                   	int3
   1403302da:	cc                   	int3
   1403302db:	cc                   	int3
   1403302dc:	cc                   	int3
   1403302dd:	cc                   	int3
   1403302de:	cc                   	int3
   1403302df:	cc                   	int3
   1403302e0:	4c 8b dc             	mov    r11,rsp
   1403302e3:	55                   	push   rbp
   1403302e4:	57                   	push   rdi
   1403302e5:	41 54                	push   r12
   1403302e7:	41 56                	push   r14
   1403302e9:	49 8d ab 58 fc ff ff 	lea    rbp,[r11-0x3a8]
   1403302f0:	48 81 ec 88 04 00 00 	sub    rsp,0x488
   1403302f7:	45 0f 29 4b 88       	movaps XMMWORD PTR [r11-0x78],xmm9
   1403302fc:	48 8b 05 65 1e 64 00 	mov    rax,QWORD PTR [rip+0x641e65]        # 0x140972168
   140330303:	48 33 c4             	xor    rax,rsp
   140330306:	48 89 85 c0 02 00 00 	mov    QWORD PTR [rbp+0x2c0],rax
   14033030d:	8b 05 41 9e 65 00    	mov    eax,DWORD PTR [rip+0x659e41]        # 0x14098a154

   140330313:	45 33 c9             	xor    r9d,r9d

   140330316:	f2 44 0f 10 0d d9 fe 	movsd  xmm9,QWORD PTR [rip+0x51fed9]        # 0x1408501f8

   14033031d:	51 00 

   14033031f:	48 8b fa             	mov    rdi,rdx

   140330322:	0f 57 c0             	xorps  xmm0,xmm0

   140330325:	48 89 54 24 50       	mov    QWORD PTR [rsp+0x50],rdx

   14033032a:	41 0f b7 d1          	movzx  edx,r9w

   14033032e:	44 89 44 24 48       	mov    DWORD PTR [rsp+0x48],r8d

   140330333:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140330338:	45 8b f0             	mov    r14d,r8d

   14033033b:	4c 8b e1             	mov    r12,rcx

   14033033e:	48 89 4c 24 58       	mov    QWORD PTR [rsp+0x58],rcx

   140330343:	4c 89 8d b0 01 00 00 	mov    QWORD PTR [rbp+0x1b0],r9

   14033034a:	44 89 8d b8 01 00 00 	mov    DWORD PTR [rbp+0x1b8],r9d

   140330351:	66 89 54 24 44       	mov    WORD PTR [rsp+0x44],dx

   140330356:	f2 44 0f 5e c8       	divsd  xmm9,xmm0

   140330621:	f3 0f 10 15 b7 99 65 	movss  xmm2,DWORD PTR [rip+0x6599b7]        # 0x140989fe0
   140330628:	00 
   140330629:	49 83 c1 04          	add    r9,0x4
   14033062d:	4c 63 c2             	movsxd r8,edx
   140330630:	49 8b c8             	mov    rcx,r8
   140330633:	f3 41 0f 59 d5       	mulss  xmm2,xmm13
   140330638:	48 c1 e1 06          	shl    rcx,0x6
   14033063c:	4c 03 c9             	add    r9,rcx
   14033063f:	90                   	nop
   140330640:	44 0f 2f d2          	comiss xmm10,xmm2
   140330644:	76 06                	jbe    0x14033064c
   140330646:	41 0f 28 ca          	movaps xmm1,xmm10
   14033064a:	eb 03                	jmp    0x14033064f
   14033064c:	0f 28 ca             	movaps xmm1,xmm2
   14033064f:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   140330654:	f3 0f 5c c1          	subss  xmm0,xmm1
   140330658:	41 0f 2f c0          	comiss xmm0,xmm8
   14033065c:	77 43                	ja     0x1403306a1
   14033065e:	ff ca                	dec    edx
   140330660:	49 ff c8             	dec    r8
   140330663:	49 83 e9 40          	sub    r9,0x40
   140330667:	49 83 f8 01          	cmp    r8,0x1
   14033066b:	7d d3                	jge    0x140330640
   14033066d:	45 33 db             	xor    r11d,r11d
   140330670:	41 8b d3             	mov    edx,r11d
   140330673:	8b 35 2f 9b 65 00    	mov    esi,DWORD PTR [rip+0x659b2f]        # 0x14098a1a8

   140330679:	45 8b d6             	mov    r10d,r14d

   14033067c:	44 0f af d6          	imul   r10d,esi

   140330680:	44 0f 2e c6          	ucomiss xmm8,xmm6

   140330684:	89 95 a8 01 00 00    	mov    DWORD PTR [rbp+0x1a8],edx

   14033068a:	88 9d ac 01 00 00    	mov    BYTE PTR [rbp+0x1ac],bl

   140330690:	7a 14                	jp     0x1403306a6

   140330692:	75 12                	jne    0x1403306a6

   140330694:	45 8b 4c 24 28       	mov    r9d,DWORD PTR [r12+0x28]

   140330699:	45 8b c3             	mov    r8d,r11d

   14033069c:	e9 91 00 00 00       	jmp    0x140330732

   1403306a1:	45 33 db             	xor    r11d,r11d

   1403306a4:	eb cd                	jmp    0x140330673

   14033064c:	0f 28 ca             	movaps xmm1,xmm2
   14033064f:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   140330654:	f3 0f 5c c1          	subss  xmm0,xmm1
   140330658:	41 0f 2f c0          	comiss xmm0,xmm8
   14033065c:	77 43                	ja     0x1403306a1
   14033065e:	ff ca                	dec    edx
   140330660:	49 ff c8             	dec    r8
   140330663:	49 83 e9 40          	sub    r9,0x40
   140330667:	49 83 f8 01          	cmp    r8,0x1
   14033066b:	7d d3                	jge    0x140330640
   14033066d:	45 33 db             	xor    r11d,r11d
   140330670:	41 8b d3             	mov    edx,r11d
   140330673:	8b 35 2f 9b 65 00    	mov    esi,DWORD PTR [rip+0x659b2f]        # 0x14098a1a8
   140330679:	45 8b d6             	mov    r10d,r14d
   14033067c:	44 0f af d6          	imul   r10d,esi
   140330680:	44 0f 2e c6          	ucomiss xmm8,xmm6
   140330684:	89 95 a8 01 00 00    	mov    DWORD PTR [rbp+0x1a8],edx
   14033068a:	88 9d ac 01 00 00    	mov    BYTE PTR [rbp+0x1ac],bl
   140330690:	7a 14                	jp     0x1403306a6
   140330692:	75 12                	jne    0x1403306a6
   140330694:	45 8b 4c 24 28       	mov    r9d,DWORD PTR [r12+0x28]
   140330699:	45 8b c3             	mov    r8d,r11d
   14033069c:	e9 91 00 00 00       	jmp    0x140330732
   1403306a1:	45 33 db             	xor    r11d,r11d
   1403306a4:	eb cd                	jmp    0x140330673
   1403306a6:	8b 05 a8 9a 65 00    	mov    eax,DWORD PTR [rip+0x659aa8]        # 0x14098a154

   1403306ac:	0f 57 c9             	xorps  xmm1,xmm1

   1403306af:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   1403306b4:	0f 28 c1             	movaps xmm0,xmm1

   1403306b7:	f3 41 0f 59 c2       	mulss  xmm0,xmm10

   1403306bc:	f3 41 0f 5e c0       	divss  xmm0,xmm8

   1403306c1:	f3 41 0f 58 c4       	addss  xmm0,xmm12

   1403306c6:	f3 48 0f 2c c0       	cvttss2si rax,xmm0

   1403306cb:	0f 28 c1             	movaps xmm0,xmm1

   1403306ce:	f3 0f 59 05 12 da 35 	mulss  xmm0,DWORD PTR [rip+0x35da12]        # 0x14068e0e8

   1403306d5:	00 

   1403306d6:	f3 41 0f 58 c4       	addss  xmm0,xmm12

   1403306db:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0

   1403306e0:	41 3b c0             	cmp    eax,r8d

   1403306e3:	44 0f 43 c0          	cmovae r8d,eax

   1403306e7:	41 80 bc 24 91 00 00 	cmp    BYTE PTR [r12+0x91],0x0

   1403306ee:	00 00 

   140330870:	c1 e0 04             	shl    eax,0x4
   140330873:	41 03 c5             	add    eax,r13d
   140330876:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   14033087d:	00 
   14033087e:	41 89 48 04          	mov    DWORD PTR [r8+0x4],ecx
   140330882:	41 83 fa 08          	cmp    r10d,0x8
   140330886:	48 8d 0d df 68 37 00 	lea    rcx,[rip+0x3768df]        # 0x1406a716c
   14033088d:	8d 42 fe             	lea    eax,[rdx-0x2]
   140330890:	49 0f 46 c9          	cmovbe rcx,r9
   140330894:	3b 01                	cmp    eax,DWORD PTR [rcx]
   140330896:	7d 1c                	jge    0x1403308b4
   140330898:	8b c6                	mov    eax,esi
   14033089a:	2b c3                	sub    eax,ebx
   14033089c:	83 e8 04             	sub    eax,0x4
   14033089f:	8d 04 40             	lea    eax,[rax+rax*2]
   1403308a2:	c1 e0 04             	shl    eax,0x4
   1403308a5:	41 03 c5             	add    eax,r13d
   1403308a8:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   1403308af:	00 
   1403308b0:	41 89 48 08          	mov    DWORD PTR [r8+0x8],ecx
   1403308b4:	83 c3 04             	add    ebx,0x4
   1403308b7:	83 ea 04             	sub    edx,0x4
   1403308ba:	49 83 c0 10          	add    r8,0x10
   1403308be:	49 83 eb 01          	sub    r11,0x1
   1403308c2:	0f 85 29 ff ff ff    	jne    0x1403307f1
   1403308c8:	8b 35 da 98 65 00    	mov    esi,DWORD PTR [rip+0x6598da]        # 0x14098a1a8

   1403308ce:	49 3b fe             	cmp    rdi,r14

   1403308d1:	7d 71                	jge    0x140330944

   1403308d3:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]

   1403308d8:	4c 8d 85 c0 01 00 00 	lea    r8,[rbp+0x1c0]

   1403308df:	8b 74 24 48          	mov    esi,DWORD PTR [rsp+0x48]

   1403308e3:	4d 8b ce             	mov    r9,r14

   1403308e6:	8b d6                	mov    edx,esi

   1403308e8:	2b d3                	sub    edx,ebx

   1403308ea:	4c 8b 90 80 06 00 00 	mov    r10,QWORD PTR [rax+0x680]

   1403308f1:	ff ca                	dec    edx

   1403308f3:	48 8b c7             	mov    rax,rdi

   1403308f6:	49 2b c4             	sub    rax,r12

   1403308f9:	4c 2b cf             	sub    r9,rdi

   1403308fc:	45 8b 1a             	mov    r11d,DWORD PTR [r10]

   1403308ff:	4d 8d 04 80          	lea    r8,[r8+rax*4]

   140330903:	41 83 fb 08          	cmp    r11d,0x8

   1403308f1:	ff ca                	dec    edx
   1403308f3:	48 8b c7             	mov    rax,rdi
   1403308f6:	49 2b c4             	sub    rax,r12
   1403308f9:	4c 2b cf             	sub    r9,rdi
   1403308fc:	45 8b 1a             	mov    r11d,DWORD PTR [r10]
   1403308ff:	4d 8d 04 80          	lea    r8,[r8+rax*4]
   140330903:	41 83 fb 08          	cmp    r11d,0x8
   140330907:	48 8d 05 5e 68 37 00 	lea    rax,[rip+0x37685e]        # 0x1406a716c
   14033090e:	49 0f 46 c2          	cmovbe rax,r10
   140330912:	3b 10                	cmp    edx,DWORD PTR [rax]
   140330914:	7d 1a                	jge    0x140330930
   140330916:	8b c6                	mov    eax,esi
   140330918:	2b c3                	sub    eax,ebx
   14033091a:	ff c8                	dec    eax
   14033091c:	8d 04 40             	lea    eax,[rax+rax*2]
   14033091f:	c1 e0 04             	shl    eax,0x4
   140330922:	41 03 c5             	add    eax,r13d
   140330925:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   14033092c:	00 
   14033092d:	41 89 08             	mov    DWORD PTR [r8],ecx
   140330930:	ff c3                	inc    ebx
   140330932:	ff ca                	dec    edx
   140330934:	49 83 c0 04          	add    r8,0x4
   140330938:	49 83 e9 01          	sub    r9,0x1
   14033093c:	75 c5                	jne    0x140330903
   14033093e:	8b 35 64 98 65 00    	mov    esi,DWORD PTR [rip+0x659864]        # 0x14098a1a8

   140330944:	33 d2                	xor    edx,edx

   140330946:	48 8d 4d 98          	lea    rcx,[rbp-0x68]

   14033094a:	41 b8 00 02 00 00    	mov    r8d,0x200

   140330950:	41 0f 28 fe          	movaps xmm7,xmm14

   140330954:	e8 91 03 2f 00       	call   0x140620cea

   140330959:	4d 3b e6             	cmp    r12,r14

   14033095c:	0f 8d b5 01 00 00    	jge    0x140330b17

   140330962:	49 8b c6             	mov    rax,r14

   140330965:	4d 8b cc             	mov    r9,r12

   140330968:	49 2b c4             	sub    rax,r12

   14033096b:	48 83 f8 04          	cmp    rax,0x4

   14033096f:	0f 8c 31 01 00 00    	jl     0x140330aa6

   140330975:	4d 8b c6             	mov    r8,r14

   140330978:	48 8d 55 a0          	lea    rdx,[rbp-0x60]

   14033097c:	4d 2b c4             	sub    r8,r12

   14033097f:	48 8d 8d c4 01 00 00 	lea    rcx,[rbp+0x1c4]

   14033583f:	ff c0                	inc    eax
   140335841:	c1 e0 09             	shl    eax,0x9
   140335844:	48 69 d0 3c 01 00 00 	imul   rdx,rax,0x13c
   14033584b:	48 03 57 10          	add    rdx,QWORD PTR [rdi+0x10]
   14033584f:	e8 90 b4 2e 00       	call   0x140620ce4
   140335854:	41 8b 4c 24 0c       	mov    ecx,DWORD PTR [r12+0xc]
   140335859:	ff c3                	inc    ebx
   14033585b:	ff c9                	dec    ecx
   14033585d:	03 4f 0c             	add    ecx,DWORD PTR [rdi+0xc]
   140335860:	3b d9                	cmp    ebx,ecx
   140335862:	72 9e                	jb     0x140335802
   140335864:	49 8b 4f 58          	mov    rcx,QWORD PTR [r15+0x58]
   140335868:	ff 15 da 2d 35 00    	call   QWORD PTR [rip+0x352dda]        # 0x140688648
   14033586e:	8b 47 0c             	mov    eax,DWORD PTR [rdi+0xc]
   140335871:	ff c8                	dec    eax
   140335873:	41 03 44 24 0c       	add    eax,DWORD PTR [r12+0xc]
   140335878:	45 33 f6             	xor    r14d,r14d
   14033587b:	44 8b 6c 24 48       	mov    r13d,DWORD PTR [rsp+0x48]
   140335880:	ff c8                	dec    eax
   140335882:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   140335887:	44 3b e8             	cmp    r13d,eax
   14033588a:	8b 74 24 4c          	mov    esi,DWORD PTR [rsp+0x4c]
   14033588e:	0f 57 ff             	xorps  xmm7,xmm7
   140335891:	44 0f 4c e8          	cmovl  r13d,eax
   140335895:	0f 57 c0             	xorps  xmm0,xmm0
   140335898:	8b 05 b6 48 65 00    	mov    eax,DWORD PTR [rip+0x6548b6]        # 0x14098a154

   14033589e:	33 d2                	xor    edx,edx

   1403358a0:	8b 8f bc 00 00 00    	mov    ecx,DWORD PTR [rdi+0xbc]

   1403358a6:	8b da                	mov    ebx,edx

   1403358a8:	03 ce                	add    ecx,esi

   1403358aa:	44 89 6c 24 48       	mov    DWORD PTR [rsp+0x48],r13d

   1403358af:	48 89 55 80          	mov    QWORD PTR [rbp-0x80],rdx

   1403358b3:	48 89 55 88          	mov    QWORD PTR [rbp-0x78],rdx

   1403358b7:	f3 48 0f 2a f8       	cvtsi2ss xmm7,rax

   140335860:	3b d9                	cmp    ebx,ecx
   140335862:	72 9e                	jb     0x140335802
   140335864:	49 8b 4f 58          	mov    rcx,QWORD PTR [r15+0x58]
   140335868:	ff 15 da 2d 35 00    	call   QWORD PTR [rip+0x352dda]        # 0x140688648
   14033586e:	8b 47 0c             	mov    eax,DWORD PTR [rdi+0xc]
   140335871:	ff c8                	dec    eax
   140335873:	41 03 44 24 0c       	add    eax,DWORD PTR [r12+0xc]
   140335878:	45 33 f6             	xor    r14d,r14d
   14033587b:	44 8b 6c 24 48       	mov    r13d,DWORD PTR [rsp+0x48]
   140335880:	ff c8                	dec    eax
   140335882:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   140335887:	44 3b e8             	cmp    r13d,eax
   14033588a:	8b 74 24 4c          	mov    esi,DWORD PTR [rsp+0x4c]
   14033588e:	0f 57 ff             	xorps  xmm7,xmm7
   140335891:	44 0f 4c e8          	cmovl  r13d,eax
   140335895:	0f 57 c0             	xorps  xmm0,xmm0
   140335898:	8b 05 b6 48 65 00    	mov    eax,DWORD PTR [rip+0x6548b6]        # 0x14098a154
   14033589e:	33 d2                	xor    edx,edx
   1403358a0:	8b 8f bc 00 00 00    	mov    ecx,DWORD PTR [rdi+0xbc]
   1403358a6:	8b da                	mov    ebx,edx
   1403358a8:	03 ce                	add    ecx,esi
   1403358aa:	44 89 6c 24 48       	mov    DWORD PTR [rsp+0x48],r13d
   1403358af:	48 89 55 80          	mov    QWORD PTR [rbp-0x80],rdx
   1403358b3:	48 89 55 88          	mov    QWORD PTR [rbp-0x78],rdx
   1403358b7:	f3 48 0f 2a f8       	cvtsi2ss xmm7,rax
   1403358bc:	8b 05 92 47 65 00    	mov    eax,DWORD PTR [rip+0x654792]        # 0x14098a054

   1403358c2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1403358c7:	f3 0f 59 3d 0d a7 51 	mulss  xmm7,DWORD PTR [rip+0x51a70d]        # 0x14084ffdc

   1403358ce:	00 

   1403358cf:	f3 0f 5e f8          	divss  xmm7,xmm0

   1403358d3:	f3 0f 11 7c 24 60    	movss  DWORD PTR [rsp+0x60],xmm7

   1403358d9:	44 3b e9             	cmp    r13d,ecx

   1403358dc:	7d 7a                	jge    0x140335958

   1403358de:	41 8b dd             	mov    ebx,r13d

   1403358e1:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]

   1403358e5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]

   1403358ec:	00 00 00 00 

   1403358f0:	83 3d b1 40 60 00 03 	cmp    DWORD PTR [rip+0x6040b1],0x3        # 0x1409399a8

   14033588e:	0f 57 ff             	xorps  xmm7,xmm7
   140335891:	44 0f 4c e8          	cmovl  r13d,eax
   140335895:	0f 57 c0             	xorps  xmm0,xmm0
   140335898:	8b 05 b6 48 65 00    	mov    eax,DWORD PTR [rip+0x6548b6]        # 0x14098a154
   14033589e:	33 d2                	xor    edx,edx
   1403358a0:	8b 8f bc 00 00 00    	mov    ecx,DWORD PTR [rdi+0xbc]
   1403358a6:	8b da                	mov    ebx,edx
   1403358a8:	03 ce                	add    ecx,esi
   1403358aa:	44 89 6c 24 48       	mov    DWORD PTR [rsp+0x48],r13d
   1403358af:	48 89 55 80          	mov    QWORD PTR [rbp-0x80],rdx
   1403358b3:	48 89 55 88          	mov    QWORD PTR [rbp-0x78],rdx
   1403358b7:	f3 48 0f 2a f8       	cvtsi2ss xmm7,rax
   1403358bc:	8b 05 92 47 65 00    	mov    eax,DWORD PTR [rip+0x654792]        # 0x14098a054
   1403358c2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1403358c7:	f3 0f 59 3d 0d a7 51 	mulss  xmm7,DWORD PTR [rip+0x51a70d]        # 0x14084ffdc
   1403358ce:	00 
   1403358cf:	f3 0f 5e f8          	divss  xmm7,xmm0
   1403358d3:	f3 0f 11 7c 24 60    	movss  DWORD PTR [rsp+0x60],xmm7
   1403358d9:	44 3b e9             	cmp    r13d,ecx
   1403358dc:	7d 7a                	jge    0x140335958
   1403358de:	41 8b dd             	mov    ebx,r13d
   1403358e1:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403358e5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   1403358ec:	00 00 00 00 
   1403358f0:	83 3d b1 40 60 00 03 	cmp    DWORD PTR [rip+0x6040b1],0x3        # 0x1409399a8
   1403358f7:	44 8b 0d aa 48 65 00 	mov    r9d,DWORD PTR [rip+0x6548aa]        # 0x14098a1a8

   1403358fe:	73 05                	jae    0x140335905

   140335900:	45 32 c0             	xor    r8b,r8b

   140335903:	eb 25                	jmp    0x14033592a

   140335905:	48 8d 45 80          	lea    rax,[rbp-0x80]

   140335909:	44 0f af cb          	imul   r9d,ebx

   14033590d:	41 b0 01             	mov    r8b,0x1

   140335910:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax

   140335915:	49 8b d4             	mov    rdx,r12

   140335918:	48 8b cf             	mov    rcx,rdi

   14033591b:	e8 60 0f ff ff       	call   0x140326880

   1403358b7:	f3 48 0f 2a f8       	cvtsi2ss xmm7,rax
   1403358bc:	8b 05 92 47 65 00    	mov    eax,DWORD PTR [rip+0x654792]        # 0x14098a054
   1403358c2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1403358c7:	f3 0f 59 3d 0d a7 51 	mulss  xmm7,DWORD PTR [rip+0x51a70d]        # 0x14084ffdc
   1403358ce:	00 
   1403358cf:	f3 0f 5e f8          	divss  xmm7,xmm0
   1403358d3:	f3 0f 11 7c 24 60    	movss  DWORD PTR [rsp+0x60],xmm7
   1403358d9:	44 3b e9             	cmp    r13d,ecx
   1403358dc:	7d 7a                	jge    0x140335958
   1403358de:	41 8b dd             	mov    ebx,r13d
   1403358e1:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403358e5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   1403358ec:	00 00 00 00 
   1403358f0:	83 3d b1 40 60 00 03 	cmp    DWORD PTR [rip+0x6040b1],0x3        # 0x1409399a8
   1403358f7:	44 8b 0d aa 48 65 00 	mov    r9d,DWORD PTR [rip+0x6548aa]        # 0x14098a1a8
   1403358fe:	73 05                	jae    0x140335905
   140335900:	45 32 c0             	xor    r8b,r8b
   140335903:	eb 25                	jmp    0x14033592a
   140335905:	48 8d 45 80          	lea    rax,[rbp-0x80]
   140335909:	44 0f af cb          	imul   r9d,ebx
   14033590d:	41 b0 01             	mov    r8b,0x1
   140335910:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140335915:	49 8b d4             	mov    rdx,r12
   140335918:	48 8b cf             	mov    rcx,rdi
   14033591b:	e8 60 0f ff ff       	call   0x140326880
   140335920:	44 8b 0d 81 48 65 00 	mov    r9d,DWORD PTR [rip+0x654881]        # 0x14098a1a8

   140335927:	41 b0 02             	mov    r8b,0x2

   14033592a:	48 8d 45 80          	lea    rax,[rbp-0x80]

   14033592e:	44 0f af cb          	imul   r9d,ebx

   140335932:	49 8b d4             	mov    rdx,r12

   140335935:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax

   14033593a:	48 8b cf             	mov    rcx,rdi

   14033593d:	e8 3e 0f ff ff       	call   0x140326880

   140335942:	8b 8f bc 00 00 00    	mov    ecx,DWORD PTR [rdi+0xbc]

   140335948:	ff c3                	inc    ebx

   14033594a:	03 ce                	add    ecx,esi

   14033594c:	3b d9                	cmp    ebx,ecx

   14033594e:	7c a0                	jl     0x1403358f0

   140335950:	48 8b 5d 88          	mov    rbx,QWORD PTR [rbp-0x78]

   140335954:	48 8b 55 80          	mov    rdx,QWORD PTR [rbp-0x80]

   140335958:	48 8b ca             	mov    rcx,rdx

   14033595b:	ff 15 af 40 35 00    	call   QWORD PTR [rip+0x3540af]        # 0x140689a10

   140335973:	f3 0f 10 35 b5 a6 51 	movss  xmm6,DWORD PTR [rip+0x51a6b5]        # 0x140850030
   14033597a:	00 
   14033597b:	03 ce                	add    ecx,esi
   14033597d:	f3 44 0f 10 15 82 1f 	movss  xmm10,DWORD PTR [rip+0x371f82]        # 0x1406a7908
   140335984:	37 00 
   140335986:	44 3b e9             	cmp    r13d,ecx
   140335989:	0f 8d cd 03 00 00    	jge    0x140335d5c
   14033598f:	8b 3d c3 46 65 00    	mov    edi,DWORD PTR [rip+0x6546c3]        # 0x14098a058
   140335995:	49 81 c4 90 04 00 00 	add    r12,0x490
   14033599c:	f3 44 0f 10 0d 73 18 	movss  xmm9,DWORD PTR [rip+0x361873]        # 0x140697218
   1403359a3:	36 00 
   1403359a5:	f3 44 0f 10 05 12 88 	movss  xmm8,DWORD PTR [rip+0x358812]        # 0x14068e1c0
   1403359ac:	35 00 
   1403359ae:	44 8b 05 f3 3f 60 00 	mov    r8d,DWORD PTR [rip+0x603ff3]        # 0x1409399a8
   1403359b5:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   1403359ba:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   1403359bf:	4c 89 65 80          	mov    QWORD PTR [rbp-0x80],r12
   1403359c3:	eb 0e                	jmp    0x1403359d3
   1403359c5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   1403359cc:	00 00 00 00 
   1403359d0:	45 33 f6             	xor    r14d,r14d
   1403359d3:	45 8b df             	mov    r11d,r15d
   1403359d6:	48 8d 95 00 02 00 00 	lea    rdx,[rbp+0x200]
   1403359dd:	44 2b 5b 0c          	sub    r11d,DWORD PTR [rbx+0xc]
   1403359e1:	4d 8b cc             	mov    r9,r12
   1403359e4:	44 0f af 1d 68 46 65 	imul   r11d,DWORD PTR [rip+0x654668]        # 0x14098a054

   1403359eb:	00 

   1403359ec:	41 ba 03 00 00 00    	mov    r10d,0x3

   1403359f2:	49 c1 e3 04          	shl    r11,0x4

   1403359f6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]

   1403359fd:	00 00 00 

   140335a00:	49 8b 09             	mov    rcx,QWORD PTR [r9]

   140335a03:	48 8d 52 08          	lea    rdx,[rdx+0x8]

   140335a07:	49 03 cb             	add    rcx,r11

   140335a0a:	4d 8d 49 38          	lea    r9,[r9+0x38]

   140335a0e:	48 89 4a f8          	mov    QWORD PTR [rdx-0x8],rcx

   140335a12:	49 83 ea 01          	sub    r10,0x1

   140335a16:	75 e8                	jne    0x140335a00

   140335a18:	41 83 f8 03          	cmp    r8d,0x3

   140335a1c:	41 0f 93 c2          	setae  r10b

   140335a20:	41 0f b6 c2          	movzx  eax,r10b

   140335a24:	41 3b c0             	cmp    eax,r8d

   140335a84:	48 98                	cdqe
   140335a86:	48 03 c0             	add    rax,rax
   140335a89:	f3 41 0f 10 44 c1 04 	movss  xmm0,DWORD PTR [r9+rax*8+0x4]
   140335a90:	0f 2e c2             	ucomiss xmm0,xmm2
   140335a93:	7a 02                	jp     0x140335a97
   140335a95:	74 07                	je     0x140335a9e
   140335a97:	41 0f 2f 0c c1       	comiss xmm1,DWORD PTR [r9+rax*8]
   140335a9c:	76 11                	jbe    0x140335aaf
   140335a9e:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   140335aa1:	41 0f 11 04 c1       	movups XMMWORD PTR [r9+rax*8],xmm0
   140335aa6:	33 c0                	xor    eax,eax
   140335aa8:	49 89 00             	mov    QWORD PTR [r8],rax
   140335aab:	49 89 40 08          	mov    QWORD PTR [r8+0x8],rax
   140335aaf:	ff c2                	inc    edx
   140335ab1:	49 83 c0 10          	add    r8,0x10
   140335ab5:	48 83 c1 10          	add    rcx,0x10
   140335ab9:	3b d7                	cmp    edx,edi
   140335abb:	7c 93                	jl     0x140335a50
   140335abd:	44 8b 05 e4 3e 60 00 	mov    r8d,DWORD PTR [rip+0x603ee4]        # 0x1409399a8
   140335ac4:	41 fe c2             	inc    r10b
   140335ac7:	41 0f b6 c2          	movzx  eax,r10b
   140335acb:	41 3b c0             	cmp    eax,r8d
   140335ace:	0f 82 5c ff ff ff    	jb     0x140335a30
   140335ad4:	41 83 f8 03          	cmp    r8d,0x3
   140335ad8:	0f 82 5f 02 00 00    	jb     0x140335d3d
   140335ade:	8b 0d 70 45 65 00    	mov    ecx,DWORD PTR [rip+0x654570]        # 0x14098a054

   140335ae4:	41 8b c7             	mov    eax,r15d

   140335ae7:	2b 43 0c             	sub    eax,DWORD PTR [rbx+0xc]

   140335aea:	44 8b c1             	mov    r8d,ecx

   140335aed:	0f af c1             	imul   eax,ecx

   140335af0:	33 d2                	xor    edx,edx

   140335af2:	49 c1 e0 04          	shl    r8,0x4

   140335af6:	8b d8                	mov    ebx,eax

   140335af8:	48 c1 e3 04          	shl    rbx,0x4

   140335afc:	49 03 1c 24          	add    rbx,QWORD PTR [r12]

   140335b00:	48 8b cb             	mov    rcx,rbx

   140335b03:	e8 e2 b1 2e 00       	call   0x140620cea

   140335b08:	85 ff                	test   edi,edi

   140335b0a:	0f 8e 21 02 00 00    	jle    0x140335d31

   140335b10:	48 8b 85 10 02 00 00 	mov    rax,QWORD PTR [rbp+0x210]

   140335b17:	41 bd 08 00 00 00    	mov    r13d,0x8

   140335b1d:	48 8b b5 08 02 00 00 	mov    rsi,QWORD PTR [rbp+0x208]

   140335dc3:	f2 44 0f 10 35 ec 1b 	movsd  xmm14,QWORD PTR [rip+0x371bec]        # 0x1406a79b8
   140335dca:	37 00 
   140335dcc:	f3 44 0f 10 2d 0b 14 	movss  xmm13,DWORD PTR [rip+0x36140b]        # 0x1406971e0
   140335dd3:	36 00 
   140335dd5:	f2 44 0f 10 25 4a a3 	movsd  xmm12,QWORD PTR [rip+0x51a34a]        # 0x140850128
   140335ddc:	51 00 
   140335dde:	f2 44 0f 10 1d 91 a3 	movsd  xmm11,QWORD PTR [rip+0x51a391]        # 0x140850178
   140335de5:	51 00 
   140335de7:	f2 44 0f 10 3d 60 83 	movsd  xmm15,QWORD PTR [rip+0x358360]        # 0x14068e150
   140335dee:	35 00 
   140335df0:	44 8b 2d 61 42 65 00 	mov    r13d,DWORD PTR [rip+0x654261]        # 0x14098a058
   140335df7:	f3 0f 10 15 69 38 60 	movss  xmm2,DWORD PTR [rip+0x603869]        # 0x140939668
   140335dfe:	00 
   140335dff:	44 8b 7c 24 40       	mov    r15d,DWORD PTR [rsp+0x40]
   140335e04:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140335e08:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140335e0f:	00 
   140335e10:	48 8b 7c 24 50       	mov    rdi,QWORD PTR [rsp+0x50]
   140335e15:	8b ce                	mov    ecx,esi
   140335e17:	4c 8b 44 24 78       	mov    r8,QWORD PTR [rsp+0x78]
   140335e1c:	2b 4f 0c             	sub    ecx,DWORD PTR [rdi+0xc]
   140335e1f:	8b c1                	mov    eax,ecx
   140335e21:	4c 63 e1             	movsxd r12,ecx
   140335e24:	44 8b d1             	mov    r10d,ecx
   140335e27:	c1 e0 09             	shl    eax,0x9
   140335e2a:	44 0f af 15 22 42 65 	imul   r10d,DWORD PTR [rip+0x654222]        # 0x14098a054

   140335e31:	00 

   140335e32:	48 69 d0 3c 01 00 00 	imul   rdx,rax,0x13c

   140335e39:	49 c1 e2 04          	shl    r10,0x4

   140335e3d:	4c 03 97 90 04 00 00 	add    r10,QWORD PTR [rdi+0x490]

   140335e44:	49 03 d0             	add    rdx,r8

   140335e47:	83 e9 01             	sub    ecx,0x1

   140335e4a:	48 89 55 a8          	mov    QWORD PTR [rbp-0x58],rdx

   140335e4e:	4c 89 65 80          	mov    QWORD PTR [rbp-0x80],r12

   140335e52:	79 06                	jns    0x140335e5a

   140335e54:	48 8b 55 98          	mov    rdx,QWORD PTR [rbp-0x68]

   140335e58:	eb 0f                	jmp    0x140335e69

   140335e5a:	8b c1                	mov    eax,ecx

   140335e5c:	c1 e0 09             	shl    eax,0x9

   140335e5f:	48 69 d0 3c 01 00 00 	imul   rdx,rax,0x13c

   140335e66:	49 03 d0             	add    rdx,r8

   140335e69:	85 c9                	test   ecx,ecx

   140335ef5:	45 8d 7b ff          	lea    r15d,[r11-0x1]
   140335ef9:	44 89 7c 24 40       	mov    DWORD PTR [rsp+0x40],r15d
   140335efe:	49 8d 51 ff          	lea    rdx,[r9-0x1]
   140335f02:	eb 0b                	jmp    0x140335f0f
   140335f04:	45 8b fb             	mov    r15d,r11d
   140335f07:	44 89 5c 24 40       	mov    DWORD PTR [rsp+0x40],r11d
   140335f0c:	49 8b d1             	mov    rdx,r9
   140335f0f:	48 85 d2             	test   rdx,rdx
   140335f12:	78 19                	js     0x140335f2d
   140335f14:	45 3b fd             	cmp    r15d,r13d
   140335f17:	7d 14                	jge    0x140335f2d
   140335f19:	48 8b c2             	mov    rax,rdx
   140335f1c:	48 03 c0             	add    rax,rax
   140335f1f:	f3 41 0f 10 44 c2 04 	movss  xmm0,DWORD PTR [r10+rax*8+0x4]
   140335f26:	0f 2e c6             	ucomiss xmm0,xmm6
   140335f29:	7a 02                	jp     0x140335f2d
   140335f2b:	74 0b                	je     0x140335f38
   140335f2d:	41 ff c0             	inc    r8d
   140335f30:	41 83 f8 02          	cmp    r8d,0x2
   140335f34:	7e a0                	jle    0x140335ed6
   140335f36:	eb 43                	jmp    0x140335f7b
   140335f38:	0f 57 c0             	xorps  xmm0,xmm0
   140335f3b:	49 63 cf             	movsxd rcx,r15d
   140335f3e:	48 03 c9             	add    rcx,rcx
   140335f41:	f3 41 0f 11 4c ca 04 	movss  DWORD PTR [r10+rcx*8+0x4],xmm1
   140335f48:	8b 05 06 41 65 00    	mov    eax,DWORD PTR [rip+0x654106]        # 0x14098a054

   140335f4e:	f3 0f 10 4f dc       	movss  xmm1,DWORD PTR [rdi-0x24]

   140335f53:	0f 5a c9             	cvtps2pd xmm1,xmm1

   140335f56:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140335f5b:	f2 0f 58 c0          	addsd  xmm0,xmm0

   140335f5f:	f2 0f 59 c8          	mulsd  xmm1,xmm0

   140335f63:	f2 41 0f 59 ce       	mulsd  xmm1,xmm14

   140335f68:	66 0f 5a c1          	cvtpd2ps xmm0,xmm1

   140335f6c:	f3 41 0f 11 04 ca    	movss  DWORD PTR [r10+rcx*8],xmm0

   140335f72:	0f b7 07             	movzx  eax,WORD PTR [rdi]

   140335f75:	66 41 89 44 ca 08    	mov    WORD PTR [r10+rcx*8+0x8],ax

   140335f7b:	41 0f b7 06          	movzx  eax,WORD PTR [r14]

   140335f7f:	ff c6                	inc    esi

   140335f81:	48 81 c7 3c 01 00 00 	add    rdi,0x13c

   140335f88:	3b f0                	cmp    esi,eax

   140335f8a:	0f 8c 10 ff ff ff    	jl     0x140335ea0

   140335f90:	4c 8b 65 80          	mov    r12,QWORD PTR [rbp-0x80]

   14033b277:	57                   	push   rdi
   14033b278:	41 54                	push   r12
   14033b27a:	41 55                	push   r13
   14033b27c:	41 56                	push   r14
   14033b27e:	41 57                	push   r15
   14033b280:	48 81 ec 80 00 00 00 	sub    rsp,0x80
   14033b287:	44 8b bc 24 e0 00 00 	mov    r15d,DWORD PTR [rsp+0xe0]
   14033b28e:	00 
   14033b28f:	0f 57 c0             	xorps  xmm0,xmm0
   14033b292:	4c 8b b2 38 06 00 00 	mov    r14,QWORD PTR [rdx+0x638]
   14033b299:	33 db                	xor    ebx,ebx
   14033b29b:	41 8b c1             	mov    eax,r9d
   14033b29e:	4d 8b e0             	mov    r12,r8
   14033b2a1:	4c 6b d8 5c          	imul   r11,rax,0x5c
   14033b2a5:	0f 29 74 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm6
   14033b2aa:	49 8b 00             	mov    rax,QWORD PTR [r8]
   14033b2ad:	4f 8d 14 7f          	lea    r10,[r15+r15*2]
   14033b2b1:	4c 8b ea             	mov    r13,rdx
   14033b2b4:	4c 89 b4 24 c0 00 00 	mov    QWORD PTR [rsp+0xc0],r14
   14033b2bb:	00 
   14033b2bc:	48 8b e9             	mov    rbp,rcx
   14033b2bf:	4f 8d 1c d3          	lea    r11,[r11+r10*8]
   14033b2c3:	45 0f bf 50 0a       	movsx  r10d,WORD PTR [r8+0xa]
   14033b2c8:	f3 41 0f 10 74 03 10 	movss  xmm6,DWORD PTR [r11+rax*1+0x10]
   14033b2cf:	45 03 d1             	add    r10d,r9d
   14033b2d2:	44 8b 1d cf ee 64 00 	mov    r11d,DWORD PTR [rip+0x64eecf]        # 0x14098a1a8

   14033b2d9:	45 0f af d3          	imul   r10d,r11d

   14033b2dd:	0f 2e f0             	ucomiss xmm6,xmm0

   14033b2e0:	7a 0d                	jp     0x14033b2ef

   14033b2e2:	75 0b                	jne    0x14033b2ef

   14033b2e4:	8b 79 28             	mov    edi,DWORD PTR [rcx+0x28]

   14033b2e7:	44 8b c3             	mov    r8d,ebx

   14033b2ea:	e9 92 00 00 00       	jmp    0x14033b381

   14033b28f:	0f 57 c0             	xorps  xmm0,xmm0
   14033b292:	4c 8b b2 38 06 00 00 	mov    r14,QWORD PTR [rdx+0x638]
   14033b299:	33 db                	xor    ebx,ebx
   14033b29b:	41 8b c1             	mov    eax,r9d
   14033b29e:	4d 8b e0             	mov    r12,r8
   14033b2a1:	4c 6b d8 5c          	imul   r11,rax,0x5c
   14033b2a5:	0f 29 74 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm6
   14033b2aa:	49 8b 00             	mov    rax,QWORD PTR [r8]
   14033b2ad:	4f 8d 14 7f          	lea    r10,[r15+r15*2]
   14033b2b1:	4c 8b ea             	mov    r13,rdx
   14033b2b4:	4c 89 b4 24 c0 00 00 	mov    QWORD PTR [rsp+0xc0],r14
   14033b2bb:	00 
   14033b2bc:	48 8b e9             	mov    rbp,rcx
   14033b2bf:	4f 8d 1c d3          	lea    r11,[r11+r10*8]
   14033b2c3:	45 0f bf 50 0a       	movsx  r10d,WORD PTR [r8+0xa]
   14033b2c8:	f3 41 0f 10 74 03 10 	movss  xmm6,DWORD PTR [r11+rax*1+0x10]
   14033b2cf:	45 03 d1             	add    r10d,r9d
   14033b2d2:	44 8b 1d cf ee 64 00 	mov    r11d,DWORD PTR [rip+0x64eecf]        # 0x14098a1a8
   14033b2d9:	45 0f af d3          	imul   r10d,r11d
   14033b2dd:	0f 2e f0             	ucomiss xmm6,xmm0
   14033b2e0:	7a 0d                	jp     0x14033b2ef
   14033b2e2:	75 0b                	jne    0x14033b2ef
   14033b2e4:	8b 79 28             	mov    edi,DWORD PTR [rcx+0x28]
   14033b2e7:	44 8b c3             	mov    r8d,ebx
   14033b2ea:	e9 92 00 00 00       	jmp    0x14033b381
   14033b2ef:	8b 05 5f ee 64 00    	mov    eax,DWORD PTR [rip+0x64ee5f]        # 0x14098a154

   14033b2f5:	0f 57 c9             	xorps  xmm1,xmm1

   14033b2f8:	f3 0f 10 15 08 c6 36 	movss  xmm2,DWORD PTR [rip+0x36c608]        # 0x1406a7908

   14033b2ff:	00 

   14033b300:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   14033b305:	0f 28 c1             	movaps xmm0,xmm1

   14033b308:	f3 0f 59 05 e8 ad 36 	mulss  xmm0,DWORD PTR [rip+0x36ade8]        # 0x1406a60f8

   14033b30f:	00 

   14033b310:	f3 0f 5e c6          	divss  xmm0,xmm6

   14033b314:	f3 0f 58 c2          	addss  xmm0,xmm2

   14033b318:	f3 48 0f 2c c0       	cvttss2si rax,xmm0

   14033b31d:	0f 28 c1             	movaps xmm0,xmm1

   14033b320:	f3 0f 59 05 c0 2d 35 	mulss  xmm0,DWORD PTR [rip+0x352dc0]        # 0x14068e0e8

   14033b327:	00 

   14033b328:	f3 0f 58 c2          	addss  xmm0,xmm2

   14033b32c:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0

   14033b331:	41 3b c0             	cmp    eax,r8d

   14033b963:	41 0f 28 cb          	movaps xmm1,xmm11
   14033b967:	e8 0e 54 2e 00       	call   0x140620d7a
   14033b96c:	0f 57 c9             	xorps  xmm1,xmm1
   14033b96f:	f3 0f 5a ce          	cvtss2sd xmm1,xmm6
   14033b973:	0f 57 f6             	xorps  xmm6,xmm6
   14033b976:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14033b97a:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033b97e:	48 8b 84 24 98 00 00 	mov    rax,QWORD PTR [rsp+0x98]
   14033b985:	00 
   14033b986:	48 8d 8c 24 f0 00 00 	lea    rcx,[rsp+0xf0]
   14033b98d:	00 
   14033b98e:	f3 41 0f 11 75 00    	movss  DWORD PTR [r13+0x0],xmm6
   14033b994:	33 d2                	xor    edx,edx
   14033b996:	41 b8 00 01 00 00    	mov    r8d,0x100
   14033b99c:	4c 8b 2c e8          	mov    r13,QWORD PTR [rax+rbp*8]
   14033b9a0:	8b c3                	mov    eax,ebx
   14033b9a2:	48 6b f8 5c          	imul   rdi,rax,0x5c
   14033b9a6:	49 8b 5d 00          	mov    rbx,QWORD PTR [r13+0x0]
   14033b9aa:	48 89 bc 24 d8 00 00 	mov    QWORD PTR [rsp+0xd8],rdi
   14033b9b1:	00 
   14033b9b2:	48 89 9c 24 d0 00 00 	mov    QWORD PTR [rsp+0xd0],rbx
   14033b9b9:	00 
   14033b9ba:	e8 2b 53 2e 00       	call   0x140620cea
   14033b9bf:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033b9c3:	4b 8d 0c 76          	lea    rcx,[r14+r14*2]
   14033b9c7:	44 8b 0d da e7 64 00 	mov    r9d,DWORD PTR [rip+0x64e7da]        # 0x14098a1a8

   14033b9ce:	45 8b d1             	mov    r10d,r9d

   14033b96c:	0f 57 c9             	xorps  xmm1,xmm1
   14033b96f:	f3 0f 5a ce          	cvtss2sd xmm1,xmm6
   14033b973:	0f 57 f6             	xorps  xmm6,xmm6
   14033b976:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14033b97a:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033b97e:	48 8b 84 24 98 00 00 	mov    rax,QWORD PTR [rsp+0x98]
   14033b985:	00 
   14033b986:	48 8d 8c 24 f0 00 00 	lea    rcx,[rsp+0xf0]
   14033b98d:	00 
   14033b98e:	f3 41 0f 11 75 00    	movss  DWORD PTR [r13+0x0],xmm6
   14033b994:	33 d2                	xor    edx,edx
   14033b996:	41 b8 00 01 00 00    	mov    r8d,0x100
   14033b99c:	4c 8b 2c e8          	mov    r13,QWORD PTR [rax+rbp*8]
   14033b9a0:	8b c3                	mov    eax,ebx
   14033b9a2:	48 6b f8 5c          	imul   rdi,rax,0x5c
   14033b9a6:	49 8b 5d 00          	mov    rbx,QWORD PTR [r13+0x0]
   14033b9aa:	48 89 bc 24 d8 00 00 	mov    QWORD PTR [rsp+0xd8],rdi
   14033b9b1:	00 
   14033b9b2:	48 89 9c 24 d0 00 00 	mov    QWORD PTR [rsp+0xd0],rbx
   14033b9b9:	00 
   14033b9ba:	e8 2b 53 2e 00       	call   0x140620cea
   14033b9bf:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033b9c3:	4b 8d 0c 76          	lea    rcx,[r14+r14*2]
   14033b9c7:	44 8b 0d da e7 64 00 	mov    r9d,DWORD PTR [rip+0x64e7da]        # 0x14098a1a8
   14033b9ce:	45 8b d1             	mov    r10d,r9d
   14033b9d1:	44 8b 1d 7c e7 64 00 	mov    r11d,DWORD PTR [rip+0x64e77c]        # 0x14098a154

   14033b9d8:	f3 0f 10 1d 28 bf 36 	movss  xmm3,DWORD PTR [rip+0x36bf28]        # 0x1406a7908

   14033b9df:	00 

   14033b9e0:	f3 0f 10 6c c8 10    	movss  xmm5,DWORD PTR [rax+rcx*8+0x10]

   14033b9e6:	f3 0f 10 15 b2 47 51 	movss  xmm2,DWORD PTR [rip+0x5147b2]        # 0x1408501a0

   14033b9ed:	00 

   14033b9ee:	f3 0f 10 35 3a 46 51 	movss  xmm6,DWORD PTR [rip+0x51463a]        # 0x140850030

   14033b9f5:	00 

   14033b9f6:	f3 0f 10 3d ea 26 35 	movss  xmm7,DWORD PTR [rip+0x3526ea]        # 0x14068e0e8

   14033b9fd:	00 

   14033b9fe:	44 0f 28 8c 24 30 25 	movaps xmm9,XMMWORD PTR [rsp+0x2530]

   14033ba05:	00 00 

   14033ba07:	45 0f af d7          	imul   r10d,r15d

   14033ba0b:	41 0f 2e ea          	ucomiss xmm5,xmm10

   14033ba0f:	48 89 8c 24 e8 00 00 	mov    QWORD PTR [rsp+0xe8],rcx

   14033ba16:	00 

   14033ba17:	7a 11                	jp     0x14033ba2a

   140340130:	00 00 
   140340132:	44 0f 29 9c 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm11
   140340139:	00 00 
   14034013b:	f2 44 0f 10 1d b4 00 	movsd  xmm11,QWORD PTR [rip+0x5100b4]        # 0x1408501f8
   140340142:	51 00 
   140340144:	44 0f 29 a4 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm12
   14034014b:	00 00 
   14034014d:	f3 44 0f 10 25 da fe 	movss  xmm12,DWORD PTR [rip+0x50feda]        # 0x140850030
   140340154:	50 00 
   140340156:	44 0f 29 ac 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm13
   14034015d:	00 00 
   14034015f:	45 0f 57 ed          	xorps  xmm13,xmm13
   140340163:	0f b7 c2             	movzx  eax,dx
   140340166:	4c 8d 3c 80          	lea    r15,[rax+rax*4]
   14034016a:	43 f6 44 fd 0c 01    	test   BYTE PTR [r13+r15*8+0xc],0x1
   140340170:	0f 85 50 03 00 00    	jne    0x1403404c6
   140340176:	43 80 7c fd 24 01    	cmp    BYTE PTR [r13+r15*8+0x24],0x1
   14034017c:	0f 85 44 03 00 00    	jne    0x1403404c6
   140340182:	43 0f b7 4c fd 08    	movzx  ecx,WORD PTR [r13+r15*8+0x8]
   140340188:	49 8b c0             	mov    rax,r8
   14034018b:	4b 8b 74 fd 00       	mov    rsi,QWORD PTR [r13+r15*8+0x0]
   140340190:	48 f7 e1             	mul    rcx
   140340193:	48 0f 40 c7          	cmovo  rax,rdi
   140340197:	48 8b c8             	mov    rcx,rax
   14034019a:	e8 c1 b3 2d 00       	call   0x14061b560
   14034019f:	44 8b 2d 02 a0 64 00 	mov    r13d,DWORD PTR [rip+0x64a002]        # 0x14098a1a8

   1403401a6:	32 db                	xor    bl,bl

   140340139:	00 00 
   14034013b:	f2 44 0f 10 1d b4 00 	movsd  xmm11,QWORD PTR [rip+0x5100b4]        # 0x1408501f8
   140340142:	51 00 
   140340144:	44 0f 29 a4 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm12
   14034014b:	00 00 
   14034014d:	f3 44 0f 10 25 da fe 	movss  xmm12,DWORD PTR [rip+0x50feda]        # 0x140850030
   140340154:	50 00 
   140340156:	44 0f 29 ac 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm13
   14034015d:	00 00 
   14034015f:	45 0f 57 ed          	xorps  xmm13,xmm13
   140340163:	0f b7 c2             	movzx  eax,dx
   140340166:	4c 8d 3c 80          	lea    r15,[rax+rax*4]
   14034016a:	43 f6 44 fd 0c 01    	test   BYTE PTR [r13+r15*8+0xc],0x1
   140340170:	0f 85 50 03 00 00    	jne    0x1403404c6
   140340176:	43 80 7c fd 24 01    	cmp    BYTE PTR [r13+r15*8+0x24],0x1
   14034017c:	0f 85 44 03 00 00    	jne    0x1403404c6
   140340182:	43 0f b7 4c fd 08    	movzx  ecx,WORD PTR [r13+r15*8+0x8]
   140340188:	49 8b c0             	mov    rax,r8
   14034018b:	4b 8b 74 fd 00       	mov    rsi,QWORD PTR [r13+r15*8+0x0]
   140340190:	48 f7 e1             	mul    rcx
   140340193:	48 0f 40 c7          	cmovo  rax,rdi
   140340197:	48 8b c8             	mov    rcx,rax
   14034019a:	e8 c1 b3 2d 00       	call   0x14061b560
   14034019f:	44 8b 2d 02 a0 64 00 	mov    r13d,DWORD PTR [rip+0x64a002]        # 0x14098a1a8
   1403401a6:	32 db                	xor    bl,bl
   1403401a8:	44 8b 25 a5 9f 64 00 	mov    r12d,DWORD PTR [rip+0x649fa5]        # 0x14098a154

   1403401af:	4c 8b c8             	mov    r9,rax

   1403401b2:	88 9c 24 60 01 00 00 	mov    BYTE PTR [rsp+0x160],bl

   1403401b9:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax

   1403401be:	66 90                	xchg   ax,ax

   1403401c0:	83 3d 35 98 5f 00 00 	cmp    DWORD PTR [rip+0x5f9835],0x0        # 0x1409399fc

   1403401c7:	41 8b ee             	mov    ebp,r14d

   1403401ca:	0f 86 c4 02 00 00    	jbe    0x140340494

   1403401d0:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]

   1403401d5:	4d 8b d6             	mov    r10,r14

   1403401d8:	4c 89 74 24 40       	mov    QWORD PTR [rsp+0x40],r14

   1403401dd:	4d 8b de             	mov    r11,r14

   1403401e0:	4c 89 74 24 58       	mov    QWORD PTR [rsp+0x58],r14

   1403401e5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]

   1403401ec:	00 00 00 00 

   1403401f0:	46 0f b7 44 f9 08    	movzx  r8d,WORD PTR [rcx+r15*8+0x8]

   1403401f6:	66 45 3b f0          	cmp    r14w,r8w

   1403401e5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   1403401ec:	00 00 00 00 
   1403401f0:	46 0f b7 44 f9 08    	movzx  r8d,WORD PTR [rcx+r15*8+0x8]
   1403401f6:	66 45 3b f0          	cmp    r14w,r8w
   1403401fa:	73 57                	jae    0x140340253
   1403401fc:	45 8b c6             	mov    r8d,r14d
   1403401ff:	90                   	nop
   140340200:	49 63 d0             	movsxd rdx,r8d
   140340203:	48 6b c2 5c          	imul   rax,rdx,0x5c
   140340207:	0f b6 4c 30 4b       	movzx  ecx,BYTE PTR [rax+rsi*1+0x4b]
   14034020c:	3b e9                	cmp    ebp,ecx
   14034020e:	7d 14                	jge    0x140340224
   140340210:	48 6b c2 17          	imul   rax,rdx,0x17
   140340214:	0f b6 cb             	movzx  ecx,bl
   140340217:	49 03 c2             	add    rax,r10
   14034021a:	48 03 c8             	add    rcx,rax
   14034021d:	f3 0f 10 04 8e       	movss  xmm0,DWORD PTR [rsi+rcx*4]
   140340222:	eb 04                	jmp    0x140340228
   140340224:	41 0f 28 c6          	movaps xmm0,xmm14
   140340228:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]
   14034022d:	41 ff c0             	inc    r8d
   140340230:	f3 41 0f 11 04 91    	movss  DWORD PTR [r9+rdx*4],xmm0
   140340236:	42 0f b7 44 f9 08    	movzx  eax,WORD PTR [rcx+r15*8+0x8]
   14034023c:	44 3b c0             	cmp    r8d,eax
   14034023f:	7c bf                	jl     0x140340200
   140340241:	44 8b 2d 60 9f 64 00 	mov    r13d,DWORD PTR [rip+0x649f60]        # 0x14098a1a8

   140340248:	44 0f b7 c0          	movzx  r8d,ax

   1403401f0:	46 0f b7 44 f9 08    	movzx  r8d,WORD PTR [rcx+r15*8+0x8]
   1403401f6:	66 45 3b f0          	cmp    r14w,r8w
   1403401fa:	73 57                	jae    0x140340253
   1403401fc:	45 8b c6             	mov    r8d,r14d
   1403401ff:	90                   	nop
   140340200:	49 63 d0             	movsxd rdx,r8d
   140340203:	48 6b c2 5c          	imul   rax,rdx,0x5c
   140340207:	0f b6 4c 30 4b       	movzx  ecx,BYTE PTR [rax+rsi*1+0x4b]
   14034020c:	3b e9                	cmp    ebp,ecx
   14034020e:	7d 14                	jge    0x140340224
   140340210:	48 6b c2 17          	imul   rax,rdx,0x17
   140340214:	0f b6 cb             	movzx  ecx,bl
   140340217:	49 03 c2             	add    rax,r10
   14034021a:	48 03 c8             	add    rcx,rax
   14034021d:	f3 0f 10 04 8e       	movss  xmm0,DWORD PTR [rsi+rcx*4]
   140340222:	eb 04                	jmp    0x140340228
   140340224:	41 0f 28 c6          	movaps xmm0,xmm14
   140340228:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]
   14034022d:	41 ff c0             	inc    r8d
   140340230:	f3 41 0f 11 04 91    	movss  DWORD PTR [r9+rdx*4],xmm0
   140340236:	42 0f b7 44 f9 08    	movzx  eax,WORD PTR [rcx+r15*8+0x8]
   14034023c:	44 3b c0             	cmp    r8d,eax
   14034023f:	7c bf                	jl     0x140340200
   140340241:	44 8b 2d 60 9f 64 00 	mov    r13d,DWORD PTR [rip+0x649f60]        # 0x14098a1a8
   140340248:	44 0f b7 c0          	movzx  r8d,ax
   14034024c:	44 8b 25 01 9f 64 00 	mov    r12d,DWORD PTR [rip+0x649f01]        # 0x14098a154

   140340253:	41 8b fe             	mov    edi,r14d

   140340256:	66 45 3b f0          	cmp    r14w,r8w

   14034025a:	0f 83 14 02 00 00    	jae    0x140340474

   140340260:	41 8b de             	mov    ebx,r14d

   140340263:	48 63 c3             	movsxd rax,ebx

   140340266:	48 6b c8 5c          	imul   rcx,rax,0x5c

   14034026a:	0f b6 44 31 4b       	movzx  eax,BYTE PTR [rcx+rsi*1+0x4b]

   14034026f:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]

   140340274:	3b e8                	cmp    ebp,eax

   140340276:	0f 8d da 01 00 00    	jge    0x140340456

   14034027c:	42 0f bf 44 f9 0a    	movsx  eax,WORD PTR [rcx+r15*8+0xa]

   140340282:	03 c3                	add    eax,ebx

   140340284:	3b 84 24 70 01 00 00 	cmp    eax,DWORD PTR [rsp+0x170]

   14034028b:	0f 8c c5 01 00 00    	jl     0x140340456

   140340291:	3b 84 24 78 01 00 00 	cmp    eax,DWORD PTR [rsp+0x178]

   140340298:	0f 8d ce 01 00 00    	jge    0x14034046c

   1403403d4:	7a 06                	jp     0x1403403dc
   1403403d6:	0f 84 72 00 00 00    	je     0x14034044e
   1403403dc:	f3 45 0f 5e c8       	divss  xmm9,xmm8
   1403403e1:	f3 45 0f 5e d0       	divss  xmm10,xmm8
   1403403e6:	41 0f 28 c1          	movaps xmm0,xmm9
   1403403ea:	41 0f 28 ca          	movaps xmm1,xmm10
   1403403ee:	e8 d5 09 2e 00       	call   0x140620dc8
   1403403f3:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   1403403f7:	41 0f 28 cb          	movaps xmm1,xmm11
   1403403fb:	e8 68 09 2e 00       	call   0x140620d68
   140340400:	66 44 0f 2f e8       	comisd xmm13,xmm0
   140340405:	76 05                	jbe    0x14034040c
   140340407:	f2 41 0f 58 c3       	addsd  xmm0,xmm11
   14034040c:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   140340411:	0f b6 94 24 60 01 00 	movzx  edx,BYTE PTR [rsp+0x160]
   140340418:	00 
   140340419:	4c 8b 4c 24 50       	mov    r9,QWORD PTR [rsp+0x50]
   14034041e:	4c 8b 5c 24 58       	mov    r11,QWORD PTR [rsp+0x58]
   140340423:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]
   140340428:	48 63 c7             	movsxd rax,edi
   14034042b:	48 6b c0 17          	imul   rax,rax,0x17
   14034042f:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140340433:	49 03 c2             	add    rax,r10
   140340436:	48 03 d0             	add    rdx,rax
   140340439:	f3 0f 11 04 96       	movss  DWORD PTR [rsi+rdx*4],xmm0
   14034043e:	44 8b 2d 63 9d 64 00 	mov    r13d,DWORD PTR [rip+0x649d63]        # 0x14098a1a8

   1403403d6:	0f 84 72 00 00 00    	je     0x14034044e
   1403403dc:	f3 45 0f 5e c8       	divss  xmm9,xmm8
   1403403e1:	f3 45 0f 5e d0       	divss  xmm10,xmm8
   1403403e6:	41 0f 28 c1          	movaps xmm0,xmm9
   1403403ea:	41 0f 28 ca          	movaps xmm1,xmm10
   1403403ee:	e8 d5 09 2e 00       	call   0x140620dc8
   1403403f3:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   1403403f7:	41 0f 28 cb          	movaps xmm1,xmm11
   1403403fb:	e8 68 09 2e 00       	call   0x140620d68
   140340400:	66 44 0f 2f e8       	comisd xmm13,xmm0
   140340405:	76 05                	jbe    0x14034040c
   140340407:	f2 41 0f 58 c3       	addsd  xmm0,xmm11
   14034040c:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   140340411:	0f b6 94 24 60 01 00 	movzx  edx,BYTE PTR [rsp+0x160]
   140340418:	00 
   140340419:	4c 8b 4c 24 50       	mov    r9,QWORD PTR [rsp+0x50]
   14034041e:	4c 8b 5c 24 58       	mov    r11,QWORD PTR [rsp+0x58]
   140340423:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]
   140340428:	48 63 c7             	movsxd rax,edi
   14034042b:	48 6b c0 17          	imul   rax,rax,0x17
   14034042f:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140340433:	49 03 c2             	add    rax,r10
   140340436:	48 03 d0             	add    rdx,rax
   140340439:	f3 0f 11 04 96       	movss  DWORD PTR [rsi+rdx*4],xmm0
   14034043e:	44 8b 2d 63 9d 64 00 	mov    r13d,DWORD PTR [rip+0x649d63]        # 0x14098a1a8
   140340445:	44 8b 25 08 9d 64 00 	mov    r12d,DWORD PTR [rip+0x649d08]        # 0x14098a154

   14034044c:	eb 05                	jmp    0x140340453

   14034044e:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]

   140340453:	45 33 f6             	xor    r14d,r14d

   140340456:	42 0f b7 44 f9 08    	movzx  eax,WORD PTR [rcx+r15*8+0x8]

   14034045c:	ff c7                	inc    edi

   14034045e:	8b df                	mov    ebx,edi

   140340460:	44 0f b7 c0          	movzx  r8d,ax

   140340464:	3b f8                	cmp    edi,eax

   140340466:	0f 8c f7 fd ff ff    	jl     0x140340263

   14034046c:	0f b6 9c 24 60 01 00 	movzx  ebx,BYTE PTR [rsp+0x160]

   140340473:	00 

   140340474:	49 83 c3 18          	add    r11,0x18

   140340478:	49 83 c2 06          	add    r10,0x6

   14034047c:	ff c5                	inc    ebp

   14034047e:	4c 89 5c 24 58       	mov    QWORD PTR [rsp+0x58],r11

   140340483:	3b 2d 73 95 5f 00    	cmp    ebp,DWORD PTR [rip+0x5f9573]        # 0x1409399fc

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

   140345519:	48 8b 4f 50          	mov    rcx,QWORD PTR [rdi+0x50]
   14034551d:	ba ff ff ff ff       	mov    edx,0xffffffff
   140345522:	ff 15 28 31 34 00    	call   QWORD PTR [rip+0x343128]        # 0x140688650
   140345528:	c7 46 08 05 00 00 00 	mov    DWORD PTR [rsi+0x8],0x5
   14034552f:	48 8b 4f 50          	mov    rcx,QWORD PTR [rdi+0x50]
   140345533:	ff 15 0f 31 34 00    	call   QWORD PTR [rip+0x34310f]        # 0x140688648
   140345539:	4c 8b 74 24 38       	mov    r14,QWORD PTR [rsp+0x38]
   14034553e:	33 c0                	xor    eax,eax
   140345540:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   140345545:	48 8b 6c 24 40       	mov    rbp,QWORD PTR [rsp+0x40]
   14034554a:	48 8b 74 24 48       	mov    rsi,QWORD PTR [rsp+0x48]
   14034554f:	48 83 c4 20          	add    rsp,0x20
   140345553:	5f                   	pop    rdi
   140345554:	c3                   	ret
   140345555:	cc                   	int3
   140345556:	cc                   	int3
   140345557:	cc                   	int3
   140345558:	cc                   	int3
   140345559:	cc                   	int3
   14034555a:	cc                   	int3
   14034555b:	cc                   	int3
   14034555c:	cc                   	int3
   14034555d:	cc                   	int3
   14034555e:	cc                   	int3
   14034555f:	cc                   	int3
   140345560:	8b 05 ee 4b 64 00    	mov    eax,DWORD PTR [rip+0x644bee]        # 0x14098a154

   140345566:	0f 57 c0             	xorps  xmm0,xmm0

   140345569:	b9 04 00 00 00       	mov    ecx,0x4

   14034556e:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140345573:	b8 02 00 00 00       	mov    eax,0x2

   140345578:	8b d0                	mov    edx,eax

   14034557a:	f3 0f 5e 05 22 1c 35 	divss  xmm0,DWORD PTR [rip+0x351c22]        # 0x1406971a4

   140345581:	00 

   140345582:	f3 0f 58 05 7e 23 36 	addss  xmm0,DWORD PTR [rip+0x36237e]        # 0x1406a7908

   140345589:	00 

   14034558a:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0

   14034558f:	90                   	nop

   140345590:	41 3b c8             	cmp    ecx,r8d

   140345593:	77 0b                	ja     0x1403455a0

   140345595:	8b c1                	mov    eax,ecx

   140345597:	ff c2                	inc    edx

   140345599:	d1 c1                	rol    ecx,1

   140346f85:	f2 44 0f 10 25 c2 13 	movsd  xmm12,QWORD PTR [rip+0x3613c2]        # 0x1406a8350
   140346f8c:	36 00 
   140346f8e:	44 0f 29 6c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm13
   140346f94:	f3 44 0f 10 2d 53 93 	movss  xmm13,DWORD PTR [rip+0x509353]        # 0x1408502f0
   140346f9b:	50 00 
   140346f9d:	0f 1f 00             	nop    DWORD PTR [rax]
   140346fa0:	40 0f b6 c7          	movzx  eax,dil
   140346fa4:	33 d2                	xor    edx,edx
   140346fa6:	48 69 d8 30 02 00 00 	imul   rbx,rax,0x230
   140346fad:	41 b8 30 02 00 00    	mov    r8d,0x230
   140346fb3:	49 03 df             	add    rbx,r15
   140346fb6:	48 8b cb             	mov    rcx,rbx
   140346fb9:	e8 2c 9d 2d 00       	call   0x140620cea
   140346fbe:	45 84 f6             	test   r14b,r14b
   140346fc1:	74 07                	je     0x140346fca
   140346fc3:	b8 ff ff ff ff       	mov    eax,0xffffffff
   140346fc8:	eb 0e                	jmp    0x140346fd8
   140346fca:	41 b0 01             	mov    r8b,0x1
   140346fcd:	0f 28 cf             	movaps xmm1,xmm7
   140346fd0:	48 8b ce             	mov    rcx,rsi
   140346fd3:	e8 c8 47 fd ff       	call   0x14031b7a0
   140346fd8:	89 83 28 02 00 00    	mov    DWORD PTR [rbx+0x228],eax
   140346fde:	0f 57 c0             	xorps  xmm0,xmm0
   140346fe1:	40 88 bb 2c 02 00 00 	mov    BYTE PTR [rbx+0x22c],dil
   140346fe8:	41 8b cc             	mov    ecx,r12d
   140346feb:	8b 05 b7 31 64 00    	mov    eax,DWORD PTR [rip+0x6431b7]        # 0x14098a1a8

   140346ff1:	0f af c8             	imul   ecx,eax

   140346ff4:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140346ff9:	99                   	cdq

   140346ffa:	2b c2                	sub    eax,edx

   140346ffc:	d1 f8                	sar    eax,1

   140346ffe:	03 c8                	add    ecx,eax

   140347000:	f2 0f 58 c0          	addsd  xmm0,xmm0

   140347004:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12

   140347009:	f2 44 0f 2c c0       	cvttsd2si r8d,xmm0

   14034700e:	41 8b c0             	mov    eax,r8d

   140347011:	99                   	cdq

   140347012:	2b c2                	sub    eax,edx

   140347014:	d1 f8                	sar    eax,1

   140347016:	2b c8                	sub    ecx,eax

   140347018:	b8 00 00 00 00       	mov    eax,0x0

   14034701d:	85 c9                	test   ecx,ecx

   140346fe1:	40 88 bb 2c 02 00 00 	mov    BYTE PTR [rbx+0x22c],dil
   140346fe8:	41 8b cc             	mov    ecx,r12d
   140346feb:	8b 05 b7 31 64 00    	mov    eax,DWORD PTR [rip+0x6431b7]        # 0x14098a1a8
   140346ff1:	0f af c8             	imul   ecx,eax
   140346ff4:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140346ff9:	99                   	cdq
   140346ffa:	2b c2                	sub    eax,edx
   140346ffc:	d1 f8                	sar    eax,1
   140346ffe:	03 c8                	add    ecx,eax
   140347000:	f2 0f 58 c0          	addsd  xmm0,xmm0
   140347004:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12
   140347009:	f2 44 0f 2c c0       	cvttsd2si r8d,xmm0
   14034700e:	41 8b c0             	mov    eax,r8d
   140347011:	99                   	cdq
   140347012:	2b c2                	sub    eax,edx
   140347014:	d1 f8                	sar    eax,1
   140347016:	2b c8                	sub    ecx,eax
   140347018:	b8 00 00 00 00       	mov    eax,0x0
   14034701d:	85 c9                	test   ecx,ecx
   14034701f:	0f 4e c8             	cmovle ecx,eax
   140347022:	89 8b 18 02 00 00    	mov    DWORD PTR [rbx+0x218],ecx
   140347028:	44 03 c1             	add    r8d,ecx
   14034702b:	8b 4e 28             	mov    ecx,DWORD PTR [rsi+0x28]
   14034702e:	8b 46 24             	mov    eax,DWORD PTR [rsi+0x24]
   140347031:	8d 14 48             	lea    edx,[rax+rcx*2]
   140347034:	0f af 15 6d 31 64 00 	imul   edx,DWORD PTR [rip+0x64316d]        # 0x14098a1a8

   14034703b:	48 8d 4b 18          	lea    rcx,[rbx+0x18]

   14034703f:	44 3b c2             	cmp    r8d,edx

   140347042:	44 0f 4d c2          	cmovge r8d,edx

   140347046:	33 d2                	xor    edx,edx

   140347048:	44 89 83 1c 02 00 00 	mov    DWORD PTR [rbx+0x21c],r8d

   14034704f:	41 b8 00 02 00 00    	mov    r8d,0x200

   140347055:	e8 90 9c 2d 00       	call   0x140620cea

   14034705a:	f3 44 0f 11 6c 24 38 	movss  DWORD PTR [rsp+0x38],xmm13

   140347061:	4c 8b cb             	mov    r9,rbx

   140347064:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0

   140347069:	45 8b c4             	mov    r8d,r12d

   14034706c:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0

   140347071:	49 8b d5             	mov    rdx,r13

   140347074:	48 8b ce             	mov    rcx,rsi

   140347077:	c6 44 24 20 00       	mov    BYTE PTR [rsp+0x20],0x0

   14034707c:	f3 0f 11 3b          	movss  DWORD PTR [rbx],xmm7

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

   140347db0:	48 81 ec 18 01 00 00 	sub    rsp,0x118

   140347db7:	80 b9 92 00 00 00 00 	cmp    BYTE PTR [rcx+0x92],0x0

   140347dbe:	41 8b c0             	mov    eax,r8d

   140347dc1:	0f 29 bc 24 c0 00 00 	movaps XMMWORD PTR [rsp+0xc0],xmm7

   140347dc8:	00 

   140365cd1:	80 3d e7 44 62 00 00 	cmp    BYTE PTR [rip+0x6244e7],0x0        # 0x14098a1bf
   140365cd8:	74 51                	je     0x140365d2b
   140365cda:	8b c3                	mov    eax,ebx
   140365cdc:	85 db                	test   ebx,ebx
   140365cde:	79 06                	jns    0x140365ce6
   140365ce0:	8b c1                	mov    eax,ecx
   140365ce2:	85 c9                	test   ecx,ecx
   140365ce4:	78 1b                	js     0x140365d01
   140365ce6:	3b 05 e4 b0 64 14    	cmp    eax,DWORD PTR [rip+0x1464b0e4]        # 0x1549b0dd0
   140365cec:	7d 13                	jge    0x140365d01
   140365cee:	48 98                	cdqe
   140365cf0:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140365cf7:	83 bc 39 58 91 03 00 	cmp    DWORD PTR [rcx+rdi*1+0x39158],0x0
   140365cfe:	00 
   140365cff:	75 2a                	jne    0x140365d2b
   140365d01:	48 63 c3             	movsxd rax,ebx
   140365d04:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140365d0b:	b8 fb ff 00 00       	mov    eax,0xfffb
   140365d10:	66 21 84 39 4a 91 03 	and    WORD PTR [rcx+rdi*1+0x3914a],ax
   140365d17:	00 
   140365d18:	f6 05 f9 32 5d 00 02 	test   BYTE PTR [rip+0x5d32f9],0x2        # 0x140939018
   140365d1f:	74 0a                	je     0x140365d2b
   140365d21:	33 d2                	xor    edx,edx
   140365d23:	8d 4a 01             	lea    ecx,[rdx+0x1]
   140365d26:	e8 b5 0f 1f 00       	call   0x140556ce0
   140365d2b:	8b 05 77 44 62 00    	mov    eax,DWORD PTR [rip+0x624477]        # 0x14098a1a8

   140365d31:	0f 57 c9             	xorps  xmm1,xmm1

   140365d34:	0f 57 c0             	xorps  xmm0,xmm0

   140365d37:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   140365cde:	79 06                	jns    0x140365ce6
   140365ce0:	8b c1                	mov    eax,ecx
   140365ce2:	85 c9                	test   ecx,ecx
   140365ce4:	78 1b                	js     0x140365d01
   140365ce6:	3b 05 e4 b0 64 14    	cmp    eax,DWORD PTR [rip+0x1464b0e4]        # 0x1549b0dd0
   140365cec:	7d 13                	jge    0x140365d01
   140365cee:	48 98                	cdqe
   140365cf0:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140365cf7:	83 bc 39 58 91 03 00 	cmp    DWORD PTR [rcx+rdi*1+0x39158],0x0
   140365cfe:	00 
   140365cff:	75 2a                	jne    0x140365d2b
   140365d01:	48 63 c3             	movsxd rax,ebx
   140365d04:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140365d0b:	b8 fb ff 00 00       	mov    eax,0xfffb
   140365d10:	66 21 84 39 4a 91 03 	and    WORD PTR [rcx+rdi*1+0x3914a],ax
   140365d17:	00 
   140365d18:	f6 05 f9 32 5d 00 02 	test   BYTE PTR [rip+0x5d32f9],0x2        # 0x140939018
   140365d1f:	74 0a                	je     0x140365d2b
   140365d21:	33 d2                	xor    edx,edx
   140365d23:	8d 4a 01             	lea    ecx,[rdx+0x1]
   140365d26:	e8 b5 0f 1f 00       	call   0x140556ce0
   140365d2b:	8b 05 77 44 62 00    	mov    eax,DWORD PTR [rip+0x624477]        # 0x14098a1a8
   140365d31:	0f 57 c9             	xorps  xmm1,xmm1
   140365d34:	0f 57 c0             	xorps  xmm0,xmm0
   140365d37:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140365d3c:	8b 05 12 44 62 00    	mov    eax,DWORD PTR [rip+0x624412]        # 0x14098a154

   140365d42:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140365d47:	48 63 c3             	movsxd rax,ebx

   140365d4a:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78

   140365d51:	f3 0f 5e c8          	divss  xmm1,xmm0

   140365d55:	f3 0f 11 8c 39 50 91 	movss  DWORD PTR [rcx+rdi*1+0x39150],xmm1

   140365d5c:	03 00 

   140365d5e:	48 8b 7c 24 30       	mov    rdi,QWORD PTR [rsp+0x30]

   140365d63:	48 83 c4 20          	add    rsp,0x20

   140365d67:	5b                   	pop    rbx

   140365d68:	c3                   	ret

   140365d69:	cc                   	int3

   140365d6a:	cc                   	int3

   140365d6b:	cc                   	int3

   140365d6c:	cc                   	int3

   140365d6d:	cc                   	int3

   140365d6e:	cc                   	int3

   1403669a6:	cc                   	int3
   1403669a7:	cc                   	int3
   1403669a8:	cc                   	int3
   1403669a9:	cc                   	int3
   1403669aa:	cc                   	int3
   1403669ab:	cc                   	int3
   1403669ac:	cc                   	int3
   1403669ad:	cc                   	int3
   1403669ae:	cc                   	int3
   1403669af:	cc                   	int3
   1403669b0:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   1403669b5:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   1403669ba:	57                   	push   rdi
   1403669bb:	41 54                	push   r12
   1403669bd:	41 55                	push   r13
   1403669bf:	41 56                	push   r14
   1403669c1:	41 57                	push   r15
   1403669c3:	48 83 ec 20          	sub    rsp,0x20
   1403669c7:	44 8b b9 7c 02 00 00 	mov    r15d,DWORD PTR [rcx+0x27c]
   1403669ce:	40 32 ed             	xor    bpl,bpl
   1403669d1:	44 0f b7 25 85 37 62 	movzx  r12d,WORD PTR [rip+0x623785]        # 0x14098a15e
   1403669d8:	00 
   1403669d9:	48 8b d9             	mov    rbx,rcx
   1403669dc:	8b b9 dc 02 00 00    	mov    edi,DWORD PTR [rcx+0x2dc]
   1403669e2:	ba 01 00 00 00       	mov    edx,0x1
   1403669e7:	0f af 3d ba 37 62 00 	imul   edi,DWORD PTR [rip+0x6237ba]        # 0x14098a1a8

   1403669ee:	45 0f af e7          	imul   r12d,r15d

   1403669f2:	41 03 ff             	add    edi,r15d

   1403669f5:	41 c1 ec 03          	shr    r12d,0x3

   1403669f9:	40 38 2d d0 f6 b9 14 	cmp    BYTE PTR [rip+0x14b9f6d0],bpl        # 0x154f060d0

   140366a00:	74 15                	je     0x140366a17

   140366a02:	8b 81 80 02 00 00    	mov    eax,DWORD PTR [rcx+0x280]

   140366a08:	03 81 78 02 00 00    	add    eax,DWORD PTR [rcx+0x278]

   140366a0e:	3b f8                	cmp    edi,eax

   140366a10:	40 0f b6 ed          	movzx  ebp,bpl

   140366a14:	0f 43 ea             	cmovae ebp,edx

   140366a17:	80 3d b3 f6 b9 14 00 	cmp    BYTE PTR [rip+0x14b9f6b3],0x0        # 0x154f060d1

   140366a1e:	74 19                	je     0x140366a39

   140366a20:	8b 89 78 02 00 00    	mov    ecx,DWORD PTR [rcx+0x278]

   140366a26:	85 c9                	test   ecx,ecx

   140366a28:	74 0f                	je     0x140366a39

   140366a2a:	03 8b 80 02 00 00    	add    ecx,DWORD PTR [rbx+0x280]

   1403669d9:	48 8b d9             	mov    rbx,rcx
   1403669dc:	8b b9 dc 02 00 00    	mov    edi,DWORD PTR [rcx+0x2dc]
   1403669e2:	ba 01 00 00 00       	mov    edx,0x1
   1403669e7:	0f af 3d ba 37 62 00 	imul   edi,DWORD PTR [rip+0x6237ba]        # 0x14098a1a8
   1403669ee:	45 0f af e7          	imul   r12d,r15d
   1403669f2:	41 03 ff             	add    edi,r15d
   1403669f5:	41 c1 ec 03          	shr    r12d,0x3
   1403669f9:	40 38 2d d0 f6 b9 14 	cmp    BYTE PTR [rip+0x14b9f6d0],bpl        # 0x154f060d0
   140366a00:	74 15                	je     0x140366a17
   140366a02:	8b 81 80 02 00 00    	mov    eax,DWORD PTR [rcx+0x280]
   140366a08:	03 81 78 02 00 00    	add    eax,DWORD PTR [rcx+0x278]
   140366a0e:	3b f8                	cmp    edi,eax
   140366a10:	40 0f b6 ed          	movzx  ebp,bpl
   140366a14:	0f 43 ea             	cmovae ebp,edx
   140366a17:	80 3d b3 f6 b9 14 00 	cmp    BYTE PTR [rip+0x14b9f6b3],0x0        # 0x154f060d1
   140366a1e:	74 19                	je     0x140366a39
   140366a20:	8b 89 78 02 00 00    	mov    ecx,DWORD PTR [rcx+0x278]
   140366a26:	85 c9                	test   ecx,ecx
   140366a28:	74 0f                	je     0x140366a39
   140366a2a:	03 8b 80 02 00 00    	add    ecx,DWORD PTR [rbx+0x280]
   140366a30:	3b f9                	cmp    edi,ecx
   140366a32:	40 0f b6 ed          	movzx  ebp,bpl
   140366a36:	0f 43 ea             	cmovae ebp,edx
   140366a39:	8b 8b b8 02 00 00    	mov    ecx,DWORD PTR [rbx+0x2b8]
   140366a3f:	0f 57 c0             	xorps  xmm0,xmm0
   140366a42:	8b 05 0c 37 62 00    	mov    eax,DWORD PTR [rip+0x62370c]        # 0x14098a154

   140366a48:	85 c9                	test   ecx,ecx

   140366a4a:	66 41 0f 6e cf       	movd   xmm1,r15d

   140366a4f:	0f 48 0d 5a 37 62 00 	cmovs  ecx,DWORD PTR [rip+0x62375a]        # 0x14098a1b0

   140366a56:	45 33 f6             	xor    r14d,r14d

   140366a59:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1

   140366a5d:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax

   140366a62:	48 63 c1             	movsxd rax,ecx

   140366a65:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78

   140366a6c:	f2 0f 5e c8          	divsd  xmm1,xmm0

   140366a70:	48 8d 05 a9 cc 65 00 	lea    rax,[rip+0x65cca9]        # 0x1409c3720

   140366a77:	f3 0f 10 14 01       	movss  xmm2,DWORD PTR [rcx+rax*1]

   140366a7c:	0f 57 c0             	xorps  xmm0,xmm0

   140366a7f:	0f 2e d0             	ucomiss xmm2,xmm0

   140366a82:	7a 07                	jp     0x140366a8b

   140366a84:	75 05                	jne    0x140366a8b

   140366a86:	45 8b c6             	mov    r8d,r14d

   1403670da:	8b c0                	mov    eax,eax
   1403670dc:	0f 57 c0             	xorps  xmm0,xmm0
   1403670df:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   1403670e4:	8b 83 b8 02 00 00    	mov    eax,DWORD PTR [rbx+0x2b8]
   1403670ea:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403670f1:	48 8d 05 d8 34 62 00 	lea    rax,[rip+0x6234d8]        # 0x14098a5d0
   1403670f8:	f3 0f 10 8c 01 50 91 	movss  xmm1,DWORD PTR [rcx+rax*1+0x39150]
   1403670ff:	03 00 
   140367101:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140367104:	f2 0f 59 c8          	mulsd  xmm1,xmm0
   140367108:	f3 0f 10 05 a8 30 62 	movss  xmm0,DWORD PTR [rip+0x6230a8]        # 0x14098a1b8
   14036710f:	00 
   140367110:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140367113:	66 0f 2f c8          	comisd xmm1,xmm0
   140367117:	73 4c                	jae    0x140367165
   140367119:	80 3d b2 ef b9 14 00 	cmp    BYTE PTR [rip+0x14b9efb2],0x0        # 0x154f060d2
   140367120:	75 43                	jne    0x140367165
   140367122:	80 3d a8 ef b9 14 00 	cmp    BYTE PTR [rip+0x14b9efa8],0x0        # 0x154f060d1
   140367129:	74 32                	je     0x14036715d
   14036712b:	83 3d 7a 28 5d 00 00 	cmp    DWORD PTR [rip+0x5d287a],0x0        # 0x1409399ac
   140367132:	7c 29                	jl     0x14036715d
   140367134:	8b 8b 78 02 00 00    	mov    ecx,DWORD PTR [rbx+0x278]
   14036713a:	85 c9                	test   ecx,ecx
   14036713c:	74 1f                	je     0x14036715d
   14036713e:	8b 83 dc 02 00 00    	mov    eax,DWORD PTR [rbx+0x2dc]
   140367144:	0f af 05 5d 30 62 00 	imul   eax,DWORD PTR [rip+0x62305d]        # 0x14098a1a8

   14036714b:	2b 83 7c 02 00 00    	sub    eax,DWORD PTR [rbx+0x27c]

   140367151:	03 83 80 02 00 00    	add    eax,DWORD PTR [rbx+0x280]

   140367157:	03 c1                	add    eax,ecx

   140367159:	85 c0                	test   eax,eax

   14036715b:	7e 08                	jle    0x140367165

   14036715d:	b0 01                	mov    al,0x1

   14036715f:	48 83 c4 20          	add    rsp,0x20

   140367163:	5b                   	pop    rbx

   140367164:	c3                   	ret

   140367165:	32 c0                	xor    al,al

   140367167:	48 83 c4 20          	add    rsp,0x20

   14036716b:	5b                   	pop    rbx

   14036716c:	c3                   	ret

   14036716d:	cc                   	int3

   14036716e:	cc                   	int3

   14036716f:	cc                   	int3

   14036733d:	e9 20 ff ff ff       	jmp    0x140367262
   140367342:	80 3d 87 ed b9 14 00 	cmp    BYTE PTR [rip+0x14b9ed87],0x0        # 0x154f060d0
   140367349:	74 cb                	je     0x140367316
   14036734b:	0f b7 0d 0c 2e 62 00 	movzx  ecx,WORD PTR [rip+0x622e0c]        # 0x14098a15e
   140367352:	41 2b d0             	sub    edx,r8d
   140367355:	03 54 24 54          	add    edx,DWORD PTR [rsp+0x54]
   140367359:	44 8b f3             	mov    r14d,ebx
   14036735c:	0f af d1             	imul   edx,ecx
   14036735f:	8b c2                	mov    eax,edx
   140367361:	99                   	cdq
   140367362:	83 e2 07             	and    edx,0x7
   140367365:	03 c2                	add    eax,edx
   140367367:	c1 f8 03             	sar    eax,0x3
   14036736a:	85 c0                	test   eax,eax
   14036736c:	41 0f 4e c4          	cmovle eax,r12d
   140367370:	3b c3                	cmp    eax,ebx
   140367372:	44 0f 4c f0          	cmovl  r14d,eax
   140367376:	45 8b ce             	mov    r9d,r14d
   140367379:	44 89 b4 24 d8 00 00 	mov    DWORD PTR [rsp+0xd8],r14d
   140367380:	00 
   140367381:	42 8d 04 f5 00 00 00 	lea    eax,[r14*8+0x0]
   140367388:	00 
   140367389:	99                   	cdq
   14036738a:	f7 f9                	idiv   ecx
   14036738c:	33 d2                	xor    edx,edx
   14036738e:	f7 35 14 2e 62 00    	div    DWORD PTR [rip+0x622e14]        # 0x14098a1a8

   140367394:	0f af d1             	imul   edx,ecx

   140367397:	c1 ea 03             	shr    edx,0x3

   14036739a:	44 2b f2             	sub    r14d,edx

   14036739d:	e9 77 ff ff ff       	jmp    0x140367319

   1403673a2:	45 85 c9             	test   r9d,r9d

   1403673a5:	0f 8e 36 06 00 00    	jle    0x1403679e1

   1403673ab:	45 32 ff             	xor    r15b,r15b

   1403673ae:	44 88 bc 24 c0 00 00 	mov    BYTE PTR [rsp+0xc0],r15b

   1403673b5:	00 

   1403673b6:	e8 55 1f 1d 00       	call   0x140539310

   1403673bb:	48 8b 8e 90 02 00 00 	mov    rcx,QWORD PTR [rsi+0x290]

   1403673c2:	ba ff ff ff ff       	mov    edx,0xffffffff

   1403673c7:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax

   1403673cc:	ff 15 7e 12 32 00    	call   QWORD PTR [rip+0x32127e]        # 0x140688650

   1403673d2:	48 8b 8e 88 02 00 00 	mov    rcx,QWORD PTR [rsi+0x288]

   1403673d9:	ba ff ff ff ff       	mov    edx,0xffffffff

   140367ab8:	e8 13 72 1c 00       	call   0x14052ecd0
   140367abd:	32 c0                	xor    al,al
   140367abf:	48 8b 5c 24 60       	mov    rbx,QWORD PTR [rsp+0x60]
   140367ac4:	48 8b 74 24 68       	mov    rsi,QWORD PTR [rsp+0x68]
   140367ac9:	48 83 c4 50          	add    rsp,0x50
   140367acd:	5f                   	pop    rdi
   140367ace:	c3                   	ret
   140367acf:	33 d2                	xor    edx,edx
   140367ad1:	48 8d 4c 24 20       	lea    rcx,[rsp+0x20]
   140367ad6:	e8 05 bc 24 00       	call   0x1405b36e0
   140367adb:	48 8b 8b 88 02 00 00 	mov    rcx,QWORD PTR [rbx+0x288]
   140367ae2:	ff 15 60 0b 32 00    	call   QWORD PTR [rip+0x320b60]        # 0x140688648
   140367ae8:	8b 4c 24 34          	mov    ecx,DWORD PTR [rsp+0x34]
   140367aec:	85 c9                	test   ecx,ecx
   140367aee:	74 cd                	je     0x140367abd
   140367af0:	f3 0f 10 1d e4 84 4e 	movss  xmm3,DWORD PTR [rip+0x4e84e4]        # 0x14084ffdc
   140367af7:	00 
   140367af8:	45 33 c0             	xor    r8d,r8d
   140367afb:	44 89 07             	mov    DWORD PTR [rdi],r8d
   140367afe:	0f 57 c9             	xorps  xmm1,xmm1
   140367b01:	89 0e                	mov    DWORD PTR [rsi],ecx
   140367b03:	f3 0f 10 15 59 77 5f 	movss  xmm2,DWORD PTR [rip+0x5f7759]        # 0x14095f264
   140367b0a:	00 
   140367b0b:	0f 2f d1             	comiss xmm2,xmm1
   140367b0e:	76 1f                	jbe    0x140367b2f
   140367b10:	8b 05 3e 26 62 00    	mov    eax,DWORD PTR [rip+0x62263e]        # 0x14098a154

   140367b16:	0f 57 c0             	xorps  xmm0,xmm0

   140367b19:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140367b1e:	f3 0f 59 c2          	mulss  xmm0,xmm2

   140367b22:	f3 0f 58 c3          	addss  xmm0,xmm3

   140367b26:	f3 48 0f 2c d0       	cvttss2si rdx,xmm0

   140367b2b:	89 17                	mov    DWORD PTR [rdi],edx

   140367b2d:	eb 02                	jmp    0x140367b31

   140367b2f:	8b 17                	mov    edx,DWORD PTR [rdi]

   140367b31:	8b 07                	mov    eax,DWORD PTR [rdi]

   140367b33:	3b d1                	cmp    edx,ecx

   140367b35:	0f 43 c1             	cmovae eax,ecx

   140367b38:	89 07                	mov    DWORD PTR [rdi],eax

   140367b3a:	f3 0f 10 15 26 77 5f 	movss  xmm2,DWORD PTR [rip+0x5f7726]        # 0x14095f268

   140367b41:	00 

   140367b42:	0f 2f d1             	comiss xmm2,xmm1

   140367b45:	72 24                	jb     0x140367b6b

   140367af8:	45 33 c0             	xor    r8d,r8d
   140367afb:	44 89 07             	mov    DWORD PTR [rdi],r8d
   140367afe:	0f 57 c9             	xorps  xmm1,xmm1
   140367b01:	89 0e                	mov    DWORD PTR [rsi],ecx
   140367b03:	f3 0f 10 15 59 77 5f 	movss  xmm2,DWORD PTR [rip+0x5f7759]        # 0x14095f264
   140367b0a:	00 
   140367b0b:	0f 2f d1             	comiss xmm2,xmm1
   140367b0e:	76 1f                	jbe    0x140367b2f
   140367b10:	8b 05 3e 26 62 00    	mov    eax,DWORD PTR [rip+0x62263e]        # 0x14098a154
   140367b16:	0f 57 c0             	xorps  xmm0,xmm0
   140367b19:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140367b1e:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140367b22:	f3 0f 58 c3          	addss  xmm0,xmm3
   140367b26:	f3 48 0f 2c d0       	cvttss2si rdx,xmm0
   140367b2b:	89 17                	mov    DWORD PTR [rdi],edx
   140367b2d:	eb 02                	jmp    0x140367b31
   140367b2f:	8b 17                	mov    edx,DWORD PTR [rdi]
   140367b31:	8b 07                	mov    eax,DWORD PTR [rdi]
   140367b33:	3b d1                	cmp    edx,ecx
   140367b35:	0f 43 c1             	cmovae eax,ecx
   140367b38:	89 07                	mov    DWORD PTR [rdi],eax
   140367b3a:	f3 0f 10 15 26 77 5f 	movss  xmm2,DWORD PTR [rip+0x5f7726]        # 0x14095f268
   140367b41:	00 
   140367b42:	0f 2f d1             	comiss xmm2,xmm1
   140367b45:	72 24                	jb     0x140367b6b
   140367b47:	8b 05 07 26 62 00    	mov    eax,DWORD PTR [rip+0x622607]        # 0x14098a154

   140367b4d:	0f 57 c0             	xorps  xmm0,xmm0

   140367b50:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140367b55:	f3 0f 59 c2          	mulss  xmm0,xmm2

   140367b59:	f3 0f 58 c3          	addss  xmm0,xmm3

   140367b5d:	f3 48 0f 2c c0       	cvttss2si rax,xmm0

   140367b62:	3b c1                	cmp    eax,ecx

   140367b64:	0f 42 c8             	cmovb  ecx,eax

   140367b67:	89 0e                	mov    DWORD PTR [rsi],ecx

   140367b69:	eb 02                	jmp    0x140367b6d

   140367b6b:	8b 0e                	mov    ecx,DWORD PTR [rsi]

   140367b6d:	2b 0f                	sub    ecx,DWORD PTR [rdi]

   140367b6f:	89 8b 78 02 00 00    	mov    DWORD PTR [rbx+0x278],ecx

   140367b75:	75 0a                	jne    0x140367b81

   140367b77:	44 89 83 78 02 00 00 	mov    DWORD PTR [rbx+0x278],r8d

   140367b7e:	41 8b c8             	mov    ecx,r8d

   140367b81:	f3 0f 10 05 2f 26 62 	movss  xmm0,DWORD PTR [rip+0x62262f]        # 0x14098a1b8

   140367b3a:	f3 0f 10 15 26 77 5f 	movss  xmm2,DWORD PTR [rip+0x5f7726]        # 0x14095f268
   140367b41:	00 
   140367b42:	0f 2f d1             	comiss xmm2,xmm1
   140367b45:	72 24                	jb     0x140367b6b
   140367b47:	8b 05 07 26 62 00    	mov    eax,DWORD PTR [rip+0x622607]        # 0x14098a154
   140367b4d:	0f 57 c0             	xorps  xmm0,xmm0
   140367b50:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140367b55:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140367b59:	f3 0f 58 c3          	addss  xmm0,xmm3
   140367b5d:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140367b62:	3b c1                	cmp    eax,ecx
   140367b64:	0f 42 c8             	cmovb  ecx,eax
   140367b67:	89 0e                	mov    DWORD PTR [rsi],ecx
   140367b69:	eb 02                	jmp    0x140367b6d
   140367b6b:	8b 0e                	mov    ecx,DWORD PTR [rsi]
   140367b6d:	2b 0f                	sub    ecx,DWORD PTR [rdi]
   140367b6f:	89 8b 78 02 00 00    	mov    DWORD PTR [rbx+0x278],ecx
   140367b75:	75 0a                	jne    0x140367b81
   140367b77:	44 89 83 78 02 00 00 	mov    DWORD PTR [rbx+0x278],r8d
   140367b7e:	41 8b c8             	mov    ecx,r8d
   140367b81:	f3 0f 10 05 2f 26 62 	movss  xmm0,DWORD PTR [rip+0x62262f]        # 0x14098a1b8
   140367b88:	00 
   140367b89:	0f 2f c1             	comiss xmm0,xmm1
   140367b8c:	76 19                	jbe    0x140367ba7
   140367b8e:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140367b93:	0f af 05 ba 25 62 00 	imul   eax,DWORD PTR [rip+0x6225ba]        # 0x14098a154

   140367b9a:	3b c1                	cmp    eax,ecx

   140367b9c:	0f 43 c1             	cmovae eax,ecx

   140367b9f:	89 83 78 02 00 00    	mov    DWORD PTR [rbx+0x278],eax

   140367ba5:	eb 02                	jmp    0x140367ba9

   140367ba7:	8b c1                	mov    eax,ecx

   140367b50:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140367b55:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140367b59:	f3 0f 58 c3          	addss  xmm0,xmm3
   140367b5d:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140367b62:	3b c1                	cmp    eax,ecx
   140367b64:	0f 42 c8             	cmovb  ecx,eax
   140367b67:	89 0e                	mov    DWORD PTR [rsi],ecx
   140367b69:	eb 02                	jmp    0x140367b6d
   140367b6b:	8b 0e                	mov    ecx,DWORD PTR [rsi]
   140367b6d:	2b 0f                	sub    ecx,DWORD PTR [rdi]
   140367b6f:	89 8b 78 02 00 00    	mov    DWORD PTR [rbx+0x278],ecx
   140367b75:	75 0a                	jne    0x140367b81
   140367b77:	44 89 83 78 02 00 00 	mov    DWORD PTR [rbx+0x278],r8d
   140367b7e:	41 8b c8             	mov    ecx,r8d
   140367b81:	f3 0f 10 05 2f 26 62 	movss  xmm0,DWORD PTR [rip+0x62262f]        # 0x14098a1b8
   140367b88:	00 
   140367b89:	0f 2f c1             	comiss xmm0,xmm1
   140367b8c:	76 19                	jbe    0x140367ba7
   140367b8e:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140367b93:	0f af 05 ba 25 62 00 	imul   eax,DWORD PTR [rip+0x6225ba]        # 0x14098a154
   140367b9a:	3b c1                	cmp    eax,ecx
   140367b9c:	0f 43 c1             	cmovae eax,ecx
   140367b9f:	89 83 78 02 00 00    	mov    DWORD PTR [rbx+0x278],eax
   140367ba5:	eb 02                	jmp    0x140367ba9
   140367ba7:	8b c1                	mov    eax,ecx
   140367ba9:	44 8b 05 a4 25 62 00 	mov    r8d,DWORD PTR [rip+0x6225a4]        # 0x14098a154

   140367bb0:	48 8d 8b b8 02 00 00 	lea    rcx,[rbx+0x2b8]

   140367bb7:	8b d0                	mov    edx,eax

   140367bb9:	e8 72 0d fb ff       	call   0x140318930

   140367bbe:	48 8b 5c 24 60       	mov    rbx,QWORD PTR [rsp+0x60]

   140367bc3:	b0 01                	mov    al,0x1

   140367bc5:	48 8b 74 24 68       	mov    rsi,QWORD PTR [rsp+0x68]

   140367bca:	48 83 c4 50          	add    rsp,0x50

   140367bce:	5f                   	pop    rdi

   140367bcf:	c3                   	ret

   140367bd0:	cc                   	int3

   140367bd1:	cc                   	int3

   140367bd2:	cc                   	int3

   140367bd3:	cc                   	int3

   140367bd4:	cc                   	int3

   140367bd5:	cc                   	int3

   140367bd6:	cc                   	int3

   140367c38:	48 8d 15 f1 60 34 00 	lea    rdx,[rip+0x3460f1]        # 0x1406add30
   140367c3f:	33 c9                	xor    ecx,ecx
   140367c41:	e8 8a 70 1c 00       	call   0x14052ecd0
   140367c46:	32 c0                	xor    al,al
   140367c48:	48 81 c4 98 00 00 00 	add    rsp,0x98
   140367c4f:	41 5f                	pop    r15
   140367c51:	41 5e                	pop    r14
   140367c53:	41 5d                	pop    r13
   140367c55:	41 5c                	pop    r12
   140367c57:	5f                   	pop    rdi
   140367c58:	5e                   	pop    rsi
   140367c59:	5d                   	pop    rbp
   140367c5a:	5b                   	pop    rbx
   140367c5b:	c3                   	ret
   140367c5c:	33 d2                	xor    edx,edx
   140367c5e:	48 8d 4c 24 68       	lea    rcx,[rsp+0x68]
   140367c63:	e8 78 ba 24 00       	call   0x1405b36e0
   140367c68:	48 8b 8f 88 02 00 00 	mov    rcx,QWORD PTR [rdi+0x288]
   140367c6f:	ff 15 d3 09 32 00    	call   QWORD PTR [rip+0x3209d3]        # 0x140688648
   140367c75:	8b 6c 24 7c          	mov    ebp,DWORD PTR [rsp+0x7c]
   140367c79:	85 ed                	test   ebp,ebp
   140367c7b:	74 c9                	je     0x140367c46
   140367c7d:	f3 0f 10 15 df 75 5f 	movss  xmm2,DWORD PTR [rip+0x5f75df]        # 0x14095f264
   140367c84:	00 
   140367c85:	45 33 ed             	xor    r13d,r13d
   140367c88:	8b 0d c6 24 62 00    	mov    ecx,DWORD PTR [rip+0x6224c6]        # 0x14098a154

   140367c8e:	0f 57 c9             	xorps  xmm1,xmm1

   140367c91:	0f 2f d1             	comiss xmm2,xmm1

   140367c94:	41 8b c5             	mov    eax,r13d

   140367c97:	f3 0f 10 1d 3d 83 4e 	movss  xmm3,DWORD PTR [rip+0x4e833d]        # 0x14084ffdc

   140367c9e:	00 

   140367c9f:	76 15                	jbe    0x140367cb6

   140367ca1:	0f 57 c0             	xorps  xmm0,xmm0

   140367ca4:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx

   140367ca9:	f3 0f 59 c2          	mulss  xmm0,xmm2

   140367cad:	f3 0f 58 c3          	addss  xmm0,xmm3

   140367cb1:	f3 48 0f 2c c0       	cvttss2si rax,xmm0

   140367cb6:	f3 0f 10 15 aa 75 5f 	movss  xmm2,DWORD PTR [rip+0x5f75aa]        # 0x14095f268

   140367cbd:	00 

   140367cbe:	3b c5                	cmp    eax,ebp

   140367cc0:	8b dd                	mov    ebx,ebp

   140367cc2:	44 8b c5             	mov    r8d,ebp

   140367cc0:	8b dd                	mov    ebx,ebp
   140367cc2:	44 8b c5             	mov    r8d,ebp
   140367cc5:	0f 42 d8             	cmovb  ebx,eax
   140367cc8:	8b d5                	mov    edx,ebp
   140367cca:	0f 2f d1             	comiss xmm2,xmm1
   140367ccd:	89 9c 24 f8 00 00 00 	mov    DWORD PTR [rsp+0xf8],ebx
   140367cd4:	72 1a                	jb     0x140367cf0
   140367cd6:	0f 57 c0             	xorps  xmm0,xmm0
   140367cd9:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   140367cde:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140367ce2:	f3 0f 58 c3          	addss  xmm0,xmm3
   140367ce6:	f3 48 0f 2c e8       	cvttss2si rbp,xmm0
   140367ceb:	3b ea                	cmp    ebp,edx
   140367ced:	0f 43 ea             	cmovae ebp,edx
   140367cf0:	8b cd                	mov    ecx,ebp
   140367cf2:	2b cb                	sub    ecx,ebx
   140367cf4:	89 8f 78 02 00 00    	mov    DWORD PTR [rdi+0x278],ecx
   140367cfa:	75 0a                	jne    0x140367d06
   140367cfc:	44 89 af 78 02 00 00 	mov    DWORD PTR [rdi+0x278],r13d
   140367d03:	41 8b cd             	mov    ecx,r13d
   140367d06:	f3 0f 10 05 aa 24 62 	movss  xmm0,DWORD PTR [rip+0x6224aa]        # 0x14098a1b8
   140367d0d:	00 
   140367d0e:	0f 2f c1             	comiss xmm0,xmm1
   140367d11:	76 19                	jbe    0x140367d2c
   140367d13:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140367d18:	0f af 05 35 24 62 00 	imul   eax,DWORD PTR [rip+0x622435]        # 0x14098a154

   140367d1f:	3b c1                	cmp    eax,ecx

   140367d21:	0f 43 c1             	cmovae eax,ecx

   140367d24:	89 87 78 02 00 00    	mov    DWORD PTR [rdi+0x278],eax

   140367d2a:	eb 02                	jmp    0x140367d2e

   140367d2c:	8b c1                	mov    eax,ecx

   140367cd4:	72 1a                	jb     0x140367cf0
   140367cd6:	0f 57 c0             	xorps  xmm0,xmm0
   140367cd9:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   140367cde:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140367ce2:	f3 0f 58 c3          	addss  xmm0,xmm3
   140367ce6:	f3 48 0f 2c e8       	cvttss2si rbp,xmm0
   140367ceb:	3b ea                	cmp    ebp,edx
   140367ced:	0f 43 ea             	cmovae ebp,edx
   140367cf0:	8b cd                	mov    ecx,ebp
   140367cf2:	2b cb                	sub    ecx,ebx
   140367cf4:	89 8f 78 02 00 00    	mov    DWORD PTR [rdi+0x278],ecx
   140367cfa:	75 0a                	jne    0x140367d06
   140367cfc:	44 89 af 78 02 00 00 	mov    DWORD PTR [rdi+0x278],r13d
   140367d03:	41 8b cd             	mov    ecx,r13d
   140367d06:	f3 0f 10 05 aa 24 62 	movss  xmm0,DWORD PTR [rip+0x6224aa]        # 0x14098a1b8
   140367d0d:	00 
   140367d0e:	0f 2f c1             	comiss xmm0,xmm1
   140367d11:	76 19                	jbe    0x140367d2c
   140367d13:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   140367d18:	0f af 05 35 24 62 00 	imul   eax,DWORD PTR [rip+0x622435]        # 0x14098a154
   140367d1f:	3b c1                	cmp    eax,ecx
   140367d21:	0f 43 c1             	cmovae eax,ecx
   140367d24:	89 87 78 02 00 00    	mov    DWORD PTR [rdi+0x278],eax
   140367d2a:	eb 02                	jmp    0x140367d2e
   140367d2c:	8b c1                	mov    eax,ecx
   140367d2e:	44 8b 05 1f 24 62 00 	mov    r8d,DWORD PTR [rip+0x62241f]        # 0x14098a154

   140367d35:	8b d0                	mov    edx,eax

   140367d37:	49 8b cf             	mov    rcx,r15

   140367d3a:	e8 f1 0b fb ff       	call   0x140318930

   140367d3f:	45 33 c0             	xor    r8d,r8d

   140367d42:	b2 01                	mov    dl,0x1

   140367d44:	49 8b cf             	mov    rcx,r15

   140367d47:	e8 44 05 fb ff       	call   0x140318290

   140367d4c:	84 c0                	test   al,al

   140367d4e:	0f 84 f2 fe ff ff    	je     0x140367c46

   140367d54:	44 39 2d 4d 1c 5d 00 	cmp    DWORD PTR [rip+0x5d1c4d],r13d        # 0x1409399a8

   140367d5b:	41 8b f5             	mov    esi,r13d

   140367d5e:	0f 86 30 01 00 00    	jbe    0x140367e94

   140367d64:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]

   140367d68:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]

   140367d6f:	00 

   140367d70:	0f b7 05 e7 23 62 00 	movzx  eax,WORD PTR [rip+0x6223e7]        # 0x14098a15e

   140367e99:	48 8d 94 24 e0 00 00 	lea    rdx,[rsp+0xe0]
   140367ea0:	00 
   140367ea1:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   140367ea6:	49 8b cf             	mov    rcx,r15
   140367ea9:	e8 32 0d fb ff       	call   0x140318be0
   140367eae:	89 84 24 f0 00 00 00 	mov    DWORD PTR [rsp+0xf0],eax
   140367eb5:	85 c0                	test   eax,eax
   140367eb7:	0f 88 a6 02 00 00    	js     0x140368163
   140367ebd:	0f 1f 00             	nop    DWORD PTR [rax]
   140367ec0:	48 8b 8f 88 02 00 00 	mov    rcx,QWORD PTR [rdi+0x288]
   140367ec7:	ba ff ff ff ff       	mov    edx,0xffffffff
   140367ecc:	ff 15 7e 07 32 00    	call   QWORD PTR [rip+0x32077e]        # 0x140688650
   140367ed2:	45 33 c0             	xor    r8d,r8d
   140367ed5:	48 8d 4c 24 40       	lea    rcx,[rsp+0x40]
   140367eda:	49 8b d6             	mov    rdx,r14
   140367edd:	e8 6e b8 24 00       	call   0x1405b3750
   140367ee2:	85 c0                	test   eax,eax
   140367ee4:	0f 85 ab 02 00 00    	jne    0x140368195
   140367eea:	8b 8c 24 e0 00 00 00 	mov    ecx,DWORD PTR [rsp+0xe0]
   140367ef1:	45 8b f5             	mov    r14d,r13d
   140367ef4:	41 8b 47 24          	mov    eax,DWORD PTR [r15+0x24]
   140367ef8:	0f af c1             	imul   eax,ecx
   140367efb:	8d 71 01             	lea    esi,[rcx+0x1]
   140367efe:	41 0f af 77 24       	imul   esi,DWORD PTR [r15+0x24]
   140367f03:	41 2b 47 28          	sub    eax,DWORD PTR [r15+0x28]
   140367f07:	0f af 05 9a 22 62 00 	imul   eax,DWORD PTR [rip+0x62229a]        # 0x14098a1a8

   140367f0e:	41 03 77 28          	add    esi,DWORD PTR [r15+0x28]

   140367ea1:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   140367ea6:	49 8b cf             	mov    rcx,r15
   140367ea9:	e8 32 0d fb ff       	call   0x140318be0
   140367eae:	89 84 24 f0 00 00 00 	mov    DWORD PTR [rsp+0xf0],eax
   140367eb5:	85 c0                	test   eax,eax
   140367eb7:	0f 88 a6 02 00 00    	js     0x140368163
   140367ebd:	0f 1f 00             	nop    DWORD PTR [rax]
   140367ec0:	48 8b 8f 88 02 00 00 	mov    rcx,QWORD PTR [rdi+0x288]
   140367ec7:	ba ff ff ff ff       	mov    edx,0xffffffff
   140367ecc:	ff 15 7e 07 32 00    	call   QWORD PTR [rip+0x32077e]        # 0x140688650
   140367ed2:	45 33 c0             	xor    r8d,r8d
   140367ed5:	48 8d 4c 24 40       	lea    rcx,[rsp+0x40]
   140367eda:	49 8b d6             	mov    rdx,r14
   140367edd:	e8 6e b8 24 00       	call   0x1405b3750
   140367ee2:	85 c0                	test   eax,eax
   140367ee4:	0f 85 ab 02 00 00    	jne    0x140368195
   140367eea:	8b 8c 24 e0 00 00 00 	mov    ecx,DWORD PTR [rsp+0xe0]
   140367ef1:	45 8b f5             	mov    r14d,r13d
   140367ef4:	41 8b 47 24          	mov    eax,DWORD PTR [r15+0x24]
   140367ef8:	0f af c1             	imul   eax,ecx
   140367efb:	8d 71 01             	lea    esi,[rcx+0x1]
   140367efe:	41 0f af 77 24       	imul   esi,DWORD PTR [r15+0x24]
   140367f03:	41 2b 47 28          	sub    eax,DWORD PTR [r15+0x28]
   140367f07:	0f af 05 9a 22 62 00 	imul   eax,DWORD PTR [rip+0x62229a]        # 0x14098a1a8
   140367f0e:	41 03 77 28          	add    esi,DWORD PTR [r15+0x28]
   140367f12:	0f af 35 8f 22 62 00 	imul   esi,DWORD PTR [rip+0x62228f]        # 0x14098a1a8

   140367f19:	44 8d 24 18          	lea    r12d,[rax+rbx*1]

   140367f1d:	03 f3                	add    esi,ebx

   140367f1f:	66 83 3d 37 22 62 00 	cmp    WORD PTR [rip+0x622237],0x8        # 0x14098a15e

   140367f26:	08 

   140367f27:	44 89 a4 24 e8 00 00 	mov    DWORD PTR [rsp+0xe8],r12d

   140367f2e:	00 

   140367f2f:	41 0f 95 c6          	setne  r14b

   140367f33:	41 ff c6             	inc    r14d

   140367f36:	45 0f af f4          	imul   r14d,r12d

   140367f3a:	44 3b 64 24 54       	cmp    r12d,DWORD PTR [rsp+0x54]

   140367f3f:	0f 8d 35 02 00 00    	jge    0x14036817a

   140367f45:	83 3d 5c 1a 5d 00 00 	cmp    DWORD PTR [rip+0x5d1a5c],0x0        # 0x1409399a8

   140367f4c:	41 8b dd             	mov    ebx,r13d

   140367f4f:	0f 86 7b 01 00 00    	jbe    0x1403680d0

   140367f55:	41 8b c4             	mov    eax,r12d

   140367f58:	f7 d8                	neg    eax

   1403683f9:	49 83 f8 12          	cmp    r8,0x12
   1403683fd:	76 0e                	jbe    0x14036840d
   1403683ff:	41 b8 12 00 00 00    	mov    r8d,0x12
   140368405:	eb 06                	jmp    0x14036840d
   140368407:	41 b8 10 00 00 00    	mov    r8d,0x10
   14036840d:	48 8b d3             	mov    rdx,rbx
   140368410:	48 8d 0d 39 1d 62 00 	lea    rcx,[rip+0x621d39]        # 0x14098a150
   140368417:	e8 c8 88 2b 00       	call   0x140620ce4
   14036841c:	66 83 7b 02 10       	cmp    WORD PTR [rbx+0x2],0x10
   140368421:	76 16                	jbe    0x140368439
   140368423:	33 d2                	xor    edx,edx
   140368425:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]
   14036842a:	e8 b1 b2 24 00       	call   0x1405b36e0
   14036842f:	b8 af 61 00 00       	mov    eax,0x61af
   140368434:	e9 5e ff ff ff       	jmp    0x140368397
   140368439:	0f b7 03             	movzx  eax,WORD PTR [rbx]
   14036843c:	66 41 3b c4          	cmp    ax,r12w
   140368440:	74 1b                	je     0x14036845d
   140368442:	66 3b c7             	cmp    ax,di
   140368445:	74 16                	je     0x14036845d
   140368447:	33 d2                	xor    edx,edx
   140368449:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]
   14036844e:	e8 8d b2 24 00       	call   0x1405b36e0
   140368453:	b8 b0 61 00 00       	mov    eax,0x61b0
   140368458:	e9 3a ff ff ff       	jmp    0x140368397
   14036845d:	8b 0d f1 1c 62 00    	mov    ecx,DWORD PTR [rip+0x621cf1]        # 0x14098a154

   140368463:	e8 08 db ff ff       	call   0x140365f70

   1403683ff:	41 b8 12 00 00 00    	mov    r8d,0x12
   140368405:	eb 06                	jmp    0x14036840d
   140368407:	41 b8 10 00 00 00    	mov    r8d,0x10
   14036840d:	48 8b d3             	mov    rdx,rbx
   140368410:	48 8d 0d 39 1d 62 00 	lea    rcx,[rip+0x621d39]        # 0x14098a150
   140368417:	e8 c8 88 2b 00       	call   0x140620ce4
   14036841c:	66 83 7b 02 10       	cmp    WORD PTR [rbx+0x2],0x10
   140368421:	76 16                	jbe    0x140368439
   140368423:	33 d2                	xor    edx,edx
   140368425:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]
   14036842a:	e8 b1 b2 24 00       	call   0x1405b36e0
   14036842f:	b8 af 61 00 00       	mov    eax,0x61af
   140368434:	e9 5e ff ff ff       	jmp    0x140368397
   140368439:	0f b7 03             	movzx  eax,WORD PTR [rbx]
   14036843c:	66 41 3b c4          	cmp    ax,r12w
   140368440:	74 1b                	je     0x14036845d
   140368442:	66 3b c7             	cmp    ax,di
   140368445:	74 16                	je     0x14036845d
   140368447:	33 d2                	xor    edx,edx
   140368449:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]
   14036844e:	e8 8d b2 24 00       	call   0x1405b36e0
   140368453:	b8 b0 61 00 00       	mov    eax,0x61b0
   140368458:	e9 3a ff ff ff       	jmp    0x140368397
   14036845d:	8b 0d f1 1c 62 00    	mov    ecx,DWORD PTR [rip+0x621cf1]        # 0x14098a154
   140368463:	e8 08 db ff ff       	call   0x140365f70
   140368468:	89 05 3a 1d 62 00    	mov    DWORD PTR [rip+0x621d3a],eax        # 0x14098a1a8

   140368405:	eb 06                	jmp    0x14036840d
   140368407:	41 b8 10 00 00 00    	mov    r8d,0x10
   14036840d:	48 8b d3             	mov    rdx,rbx
   140368410:	48 8d 0d 39 1d 62 00 	lea    rcx,[rip+0x621d39]        # 0x14098a150
   140368417:	e8 c8 88 2b 00       	call   0x140620ce4
   14036841c:	66 83 7b 02 10       	cmp    WORD PTR [rbx+0x2],0x10
   140368421:	76 16                	jbe    0x140368439
   140368423:	33 d2                	xor    edx,edx
   140368425:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]
   14036842a:	e8 b1 b2 24 00       	call   0x1405b36e0
   14036842f:	b8 af 61 00 00       	mov    eax,0x61af
   140368434:	e9 5e ff ff ff       	jmp    0x140368397
   140368439:	0f b7 03             	movzx  eax,WORD PTR [rbx]
   14036843c:	66 41 3b c4          	cmp    ax,r12w
   140368440:	74 1b                	je     0x14036845d
   140368442:	66 3b c7             	cmp    ax,di
   140368445:	74 16                	je     0x14036845d
   140368447:	33 d2                	xor    edx,edx
   140368449:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]
   14036844e:	e8 8d b2 24 00       	call   0x1405b36e0
   140368453:	b8 b0 61 00 00       	mov    eax,0x61b0
   140368458:	e9 3a ff ff ff       	jmp    0x140368397
   14036845d:	8b 0d f1 1c 62 00    	mov    ecx,DWORD PTR [rip+0x621cf1]        # 0x14098a154
   140368463:	e8 08 db ff ff       	call   0x140365f70
   140368468:	89 05 3a 1d 62 00    	mov    DWORD PTR [rip+0x621d3a],eax        # 0x14098a1a8
   14036846e:	8b 0d e0 1c 62 00    	mov    ecx,DWORD PTR [rip+0x621ce0]        # 0x14098a154

   140368474:	0f 57 c9             	xorps  xmm1,xmm1

   140368477:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx

   14036847c:	8b c0                	mov    eax,eax

   14036847e:	0f 57 c0             	xorps  xmm0,xmm0

   140368481:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   140368486:	f3 0f 5e c8          	divss  xmm1,xmm0

   14036848a:	f3 0f 11 0d 1a 1d 62 	movss  DWORD PTR [rip+0x621d1a],xmm1        # 0x14098a1ac

   140368491:	00 

   140368492:	33 d2                	xor    edx,edx

   140368494:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]

   140368499:	e8 42 b2 24 00       	call   0x1405b36e0

   14036849e:	33 c9                	xor    ecx,ecx

   1403684a0:	e8 fb 70 fb ff       	call   0x14031f5a0

   1403684a5:	48 c7 c3 ff ff ff ff 	mov    rbx,0xffffffffffffffff

   1403684ac:	89 5c 24 30          	mov    DWORD PTR [rsp+0x30],ebx

   1403684b0:	89 5c 24 3c          	mov    DWORD PTR [rsp+0x3c],ebx

   140368886:	b9 fe ff 00 00       	mov    ecx,0xfffe
   14036888b:	66 3b c8             	cmp    cx,ax
   14036888e:	74 1f                	je     0x1403688af
   140368890:	b9 03 00 00 00       	mov    ecx,0x3
   140368895:	66 3b c8             	cmp    cx,ax
   140368898:	74 15                	je     0x1403688af
   14036889a:	44 0f b7 42 10       	movzx  r8d,WORD PTR [rdx+0x10]
   14036889f:	49 83 c0 12          	add    r8,0x12
   1403688a3:	49 83 f8 12          	cmp    r8,0x12
   1403688a7:	76 0c                	jbe    0x1403688b5
   1403688a9:	44 8d 41 0f          	lea    r8d,[rcx+0xf]
   1403688ad:	eb 06                	jmp    0x1403688b5
   1403688af:	41 b8 10 00 00 00    	mov    r8d,0x10
   1403688b5:	48 8d 0d 94 18 62 00 	lea    rcx,[rip+0x621894]        # 0x14098a150
   1403688bc:	e8 23 84 2b 00       	call   0x140620ce4
   1403688c1:	80 3d ec 18 62 00 00 	cmp    BYTE PTR [rip+0x6218ec],0x0        # 0x14098a1b4
   1403688c8:	0f b7 0d 83 18 62 00 	movzx  ecx,WORD PTR [rip+0x621883]        # 0x14098a152
   1403688cf:	75 03                	jne    0x1403688d4
   1403688d1:	41 8b cc             	mov    ecx,r12d
   1403688d4:	33 d2                	xor    edx,edx
   1403688d6:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   1403688da:	f7 f1                	div    ecx
   1403688dc:	8b c8                	mov    ecx,eax
   1403688de:	0f 57 c9             	xorps  xmm1,xmm1
   1403688e1:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   1403688e6:	8b 05 68 18 62 00    	mov    eax,DWORD PTR [rip+0x621868]        # 0x14098a154

   1403688ec:	0f 57 c0             	xorps  xmm0,xmm0

   1403688ef:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1403688f4:	f3 0f 5e c8          	divss  xmm1,xmm0

   1403688f8:	f3 0f 11 4f 10       	movss  DWORD PTR [rdi+0x10],xmm1

   1403688fd:	33 d2                	xor    edx,edx

   1403688ff:	48 8d 4c 24 50       	lea    rcx,[rsp+0x50]

   140368904:	e8 d7 ad 24 00       	call   0x1405b36e0

   140368909:	48 8d 4e 0c          	lea    rcx,[rsi+0xc]

   14036890d:	41 b8 04 01 00 00    	mov    r8d,0x104

   140368913:	66 83 7d b0 00       	cmp    WORD PTR [rbp-0x50],0x0

   140368918:	48 8d 55 b0          	lea    rdx,[rbp-0x50]

   14036891c:	75 03                	jne    0x140368921

   14036891e:	49 8b d7             	mov    rdx,r15

   140368921:	ff 15 09 15 32 00    	call   QWORD PTR [rip+0x321509]        # 0x140689e30

   140368927:	4c 8d 86 e0 02 00 00 	lea    r8,[rsi+0x2e0]

   14036892e:	48 c7 c3 ff ff ff ff 	mov    rbx,0xffffffffffffffff

   1403688d1:	41 8b cc             	mov    ecx,r12d
   1403688d4:	33 d2                	xor    edx,edx
   1403688d6:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   1403688da:	f7 f1                	div    ecx
   1403688dc:	8b c8                	mov    ecx,eax
   1403688de:	0f 57 c9             	xorps  xmm1,xmm1
   1403688e1:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   1403688e6:	8b 05 68 18 62 00    	mov    eax,DWORD PTR [rip+0x621868]        # 0x14098a154
   1403688ec:	0f 57 c0             	xorps  xmm0,xmm0
   1403688ef:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1403688f4:	f3 0f 5e c8          	divss  xmm1,xmm0
   1403688f8:	f3 0f 11 4f 10       	movss  DWORD PTR [rdi+0x10],xmm1
   1403688fd:	33 d2                	xor    edx,edx
   1403688ff:	48 8d 4c 24 50       	lea    rcx,[rsp+0x50]
   140368904:	e8 d7 ad 24 00       	call   0x1405b36e0
   140368909:	48 8d 4e 0c          	lea    rcx,[rsi+0xc]
   14036890d:	41 b8 04 01 00 00    	mov    r8d,0x104
   140368913:	66 83 7d b0 00       	cmp    WORD PTR [rbp-0x50],0x0
   140368918:	48 8d 55 b0          	lea    rdx,[rbp-0x50]
   14036891c:	75 03                	jne    0x140368921
   14036891e:	49 8b d7             	mov    rdx,r15
   140368921:	ff 15 09 15 32 00    	call   QWORD PTR [rip+0x321509]        # 0x140689e30
   140368927:	4c 8d 86 e0 02 00 00 	lea    r8,[rsi+0x2e0]
   14036892e:	48 c7 c3 ff ff ff ff 	mov    rbx,0xffffffffffffffff
   140368935:	44 8b cb             	mov    r9d,ebx
   140368938:	8b 15 6a 18 62 00    	mov    edx,DWORD PTR [rip+0x62186a]        # 0x14098a1a8

   1403688d4:	33 d2                	xor    edx,edx
   1403688d6:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   1403688da:	f7 f1                	div    ecx
   1403688dc:	8b c8                	mov    ecx,eax
   1403688de:	0f 57 c9             	xorps  xmm1,xmm1
   1403688e1:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   1403688e6:	8b 05 68 18 62 00    	mov    eax,DWORD PTR [rip+0x621868]        # 0x14098a154
   1403688ec:	0f 57 c0             	xorps  xmm0,xmm0
   1403688ef:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1403688f4:	f3 0f 5e c8          	divss  xmm1,xmm0
   1403688f8:	f3 0f 11 4f 10       	movss  DWORD PTR [rdi+0x10],xmm1
   1403688fd:	33 d2                	xor    edx,edx
   1403688ff:	48 8d 4c 24 50       	lea    rcx,[rsp+0x50]
   140368904:	e8 d7 ad 24 00       	call   0x1405b36e0
   140368909:	48 8d 4e 0c          	lea    rcx,[rsi+0xc]
   14036890d:	41 b8 04 01 00 00    	mov    r8d,0x104
   140368913:	66 83 7d b0 00       	cmp    WORD PTR [rbp-0x50],0x0
   140368918:	48 8d 55 b0          	lea    rdx,[rbp-0x50]
   14036891c:	75 03                	jne    0x140368921
   14036891e:	49 8b d7             	mov    rdx,r15
   140368921:	ff 15 09 15 32 00    	call   QWORD PTR [rip+0x321509]        # 0x140689e30
   140368927:	4c 8d 86 e0 02 00 00 	lea    r8,[rsi+0x2e0]
   14036892e:	48 c7 c3 ff ff ff ff 	mov    rbx,0xffffffffffffffff
   140368935:	44 8b cb             	mov    r9d,ebx
   140368938:	8b 15 6a 18 62 00    	mov    edx,DWORD PTR [rip+0x62186a]        # 0x14098a1a8
   14036893e:	8b 0d 10 18 62 00    	mov    ecx,DWORD PTR [rip+0x621810]        # 0x14098a154

   140368944:	e8 67 d6 ff ff       	call   0x140365fb0

   140368949:	89 86 dc 02 00 00    	mov    DWORD PTR [rsi+0x2dc],eax

   14036894f:	48 8b cf             	mov    rcx,rdi

   140368952:	e8 49 ad 00 00       	call   0x1403736a0

   140368957:	48 c7 86 7c 02 00 00 	mov    QWORD PTR [rsi+0x27c],0x0

   14036895e:	00 00 00 00 

   140368962:	44 89 b6 98 02 00 00 	mov    DWORD PTR [rsi+0x298],r14d

   140368969:	0f 57 c0             	xorps  xmm0,xmm0

   14036896c:	f3 0f 5a c7          	cvtss2sd xmm0,xmm7

   140368970:	8b 17                	mov    edx,DWORD PTR [rdi]

   140368972:	e8 e9 04 00 00       	call   0x140368e60

   140368977:	89 47 08             	mov    DWORD PTR [rdi+0x8],eax

   14036897a:	89 47 04             	mov    DWORD PTR [rdi+0x4],eax

   14036897d:	89 47 0c             	mov    DWORD PTR [rdi+0xc],eax

   140368980:	b8 ff ff 00 00       	mov    eax,0xffff

   140368985:	66 89 47 4c          	mov    WORD PTR [rdi+0x4c],ax

   1403725e1:	8b 05 8d f6 5c 00    	mov    eax,DWORD PTR [rip+0x5cf68d]        # 0x140941c74
   1403725e7:	41 3b c5             	cmp    eax,r13d
   1403725ea:	41 0f 4c c5          	cmovl  eax,r13d
   1403725ee:	4c 8d 2d 0b da c8 ff 	lea    r13,[rip+0xffffffffffc8da0b]        # 0x140000000
   1403725f5:	89 05 79 f6 5c 00    	mov    DWORD PTR [rip+0x5cf679],eax        # 0x140941c74
   1403725fb:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   1403725ff:	66 41 0f 6e 44 24 04 	movd   xmm0,DWORD PTR [r12+0x4]
   140372606:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   14037260d:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140372610:	f3 42 0f 59 84 29 20 	mulss  xmm0,DWORD PTR [rcx+r13*1+0x9c3720]
   140372617:	37 9c 00 
   14037261a:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   14037261f:	f3 0f 11 05 75 84 cd 	movss  DWORD PTR [rip+0x14cd8475],xmm0        # 0x15504aa9c
   140372626:	14 
   140372627:	45 84 c0             	test   r8b,r8b
   14037262a:	75 04                	jne    0x140372630
   14037262c:	85 d2                	test   edx,edx
   14037262e:	78 20                	js     0x140372650
   140372630:	33 c9                	xor    ecx,ecx
   140372632:	f3 44 0f 11 3d 0d f2 	movss  DWORD PTR [rip+0x5cf20d],xmm15        # 0x140941848
   140372639:	5c 00 
   14037263b:	c6 05 f8 f1 5c 00 01 	mov    BYTE PTR [rip+0x5cf1f8],0x1        # 0x14094183a
   140372642:	e8 49 c3 09 00       	call   0x14040e990
   140372647:	eb 07                	jmp    0x140372650
   140372649:	4c 8d 2d b0 d9 c8 ff 	lea    r13,[rip+0xffffffffffc8d9b0]        # 0x140000000
   140372650:	8b 05 52 7b 61 00    	mov    eax,DWORD PTR [rip+0x617b52]        # 0x14098a1a8

   140372656:	48 8d 0d 43 c0 33 00 	lea    rcx,[rip+0x33c043]        # 0x1406ae6a0

   14037265d:	66 41 0f 6e 44 24 04 	movd   xmm0,DWORD PTR [r12+0x4]

   140372664:	0f 57 c9             	xorps  xmm1,xmm1

   140372667:	0f 5b c0             	cvtdq2ps xmm0,xmm0

   14037266a:	0f 57 db             	xorps  xmm3,xmm3

   14037266d:	41 0f 28 d7          	movaps xmm2,xmm15

   140372671:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax

   14037260d:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140372610:	f3 42 0f 59 84 29 20 	mulss  xmm0,DWORD PTR [rcx+r13*1+0x9c3720]
   140372617:	37 9c 00 
   14037261a:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   14037261f:	f3 0f 11 05 75 84 cd 	movss  DWORD PTR [rip+0x14cd8475],xmm0        # 0x15504aa9c
   140372626:	14 
   140372627:	45 84 c0             	test   r8b,r8b
   14037262a:	75 04                	jne    0x140372630
   14037262c:	85 d2                	test   edx,edx
   14037262e:	78 20                	js     0x140372650
   140372630:	33 c9                	xor    ecx,ecx
   140372632:	f3 44 0f 11 3d 0d f2 	movss  DWORD PTR [rip+0x5cf20d],xmm15        # 0x140941848
   140372639:	5c 00 
   14037263b:	c6 05 f8 f1 5c 00 01 	mov    BYTE PTR [rip+0x5cf1f8],0x1        # 0x14094183a
   140372642:	e8 49 c3 09 00       	call   0x14040e990
   140372647:	eb 07                	jmp    0x140372650
   140372649:	4c 8d 2d b0 d9 c8 ff 	lea    r13,[rip+0xffffffffffc8d9b0]        # 0x140000000
   140372650:	8b 05 52 7b 61 00    	mov    eax,DWORD PTR [rip+0x617b52]        # 0x14098a1a8
   140372656:	48 8d 0d 43 c0 33 00 	lea    rcx,[rip+0x33c043]        # 0x1406ae6a0
   14037265d:	66 41 0f 6e 44 24 04 	movd   xmm0,DWORD PTR [r12+0x4]
   140372664:	0f 57 c9             	xorps  xmm1,xmm1
   140372667:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037266a:	0f 57 db             	xorps  xmm3,xmm3
   14037266d:	41 0f 28 d7          	movaps xmm2,xmm15
   140372671:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140372676:	8b 05 d8 7a 61 00    	mov    eax,DWORD PTR [rip+0x617ad8]        # 0x14098a154

   14037267c:	f3 48 0f 2a d8       	cvtsi2ss xmm3,rax

   140372681:	f3 0f 59 c8          	mulss  xmm1,xmm0

   140372685:	f3 0f 5e cb          	divss  xmm1,xmm3

   140372689:	e8 12 43 ff ff       	call   0x1403669a0

   14037268e:	49 8b ce             	mov    rcx,r14

   140372691:	e8 c2 8e 2a 00       	call   0x14061b558

   140372696:	48 8b 0d ab ce 45 17 	mov    rcx,QWORD PTR [rip+0x1745ceab]        # 0x1577cf548

   14037269d:	ba ff ff ff ff       	mov    edx,0xffffffff

   1403726a2:	ff 15 a8 5f 31 00    	call   QWORD PTR [rip+0x315fa8]        # 0x140688650

   1403726a8:	44 0f 28 bc 24 e0 00 	movaps xmm15,XMMWORD PTR [rsp+0xe0]

   1403726af:	00 00 

   1403726b1:	44 0f 28 8c 24 40 01 	movaps xmm9,XMMWORD PTR [rsp+0x140]

   1403726b8:	00 00 

   1403726ba:	4c 8b b4 24 90 01 00 	mov    r14,QWORD PTR [rsp+0x190]

   1403726c1:	00 

   1403726c2:	45 85 ff             	test   r15d,r15d

   14047b018:	eb 14                	jmp    0x14047b02e
   14047b01a:	0f 57 c0             	xorps  xmm0,xmm0
   14047b01d:	f3 41 0f 5a c0       	cvtss2sd xmm0,xmm8
   14047b022:	f2 0f 58 c3          	addsd  xmm0,xmm3
   14047b026:	f2 0f 5e c1          	divsd  xmm0,xmm1
   14047b02a:	f2 0f 2c f8          	cvttsd2si edi,xmm0
   14047b02e:	0f 2e d4             	ucomiss xmm2,xmm4
   14047b031:	7a 07                	jp     0x14047b03a
   14047b033:	75 05                	jne    0x14047b03a
   14047b035:	41 8b ed             	mov    ebp,r13d
   14047b038:	eb 13                	jmp    0x14047b04d
   14047b03a:	0f 57 c0             	xorps  xmm0,xmm0
   14047b03d:	f3 0f 5a c7          	cvtss2sd xmm0,xmm7
   14047b041:	f2 0f 58 c3          	addsd  xmm0,xmm3
   14047b045:	f2 0f 5e c1          	divsd  xmm0,xmm1
   14047b049:	f2 0f 2c e8          	cvttsd2si ebp,xmm0
   14047b04d:	89 3d 79 60 4d 00    	mov    DWORD PTR [rip+0x4d6079],edi        # 0x1409510cc
   14047b053:	89 2d 8f 60 4d 00    	mov    DWORD PTR [rip+0x4d608f],ebp        # 0x1409510e8
   14047b059:	40 84 f6             	test   sil,sil
   14047b05c:	74 38                	je     0x14047b096
   14047b05e:	f3 0f 10 0d 3e 60 53 	movss  xmm1,DWORD PTR [rip+0x1453603e]        # 0x1549b10a4
   14047b065:	14 
   14047b066:	45 33 c0             	xor    r8d,r8d
   14047b069:	49 8b ce             	mov    rcx,r14
   14047b06c:	e8 9f f1 e9 ff       	call   0x14031a210
   14047b071:	44 8b 05 30 f1 50 00 	mov    r8d,DWORD PTR [rip+0x50f130]        # 0x14098a1a8

   14047b078:	ff c8                	dec    eax

   14047b07a:	41 03 c0             	add    eax,r8d

   14047b07d:	33 d2                	xor    edx,edx

   14047b07f:	41 f7 f0             	div    r8d

   14047b082:	8d 48 ff             	lea    ecx,[rax-0x1]

   14047b085:	99                   	cdq

   14047b086:	2b c2                	sub    eax,edx

   14047b088:	d1 f8                	sar    eax,1

   14047b08a:	2b f8                	sub    edi,eax

   14047b08c:	85 ff                	test   edi,edi

   14047b08e:	41 0f 4e fd          	cmovle edi,r13d

   14047b092:	03 e9                	add    ebp,ecx

   14047b094:	eb 14                	jmp    0x14047b0aa

   14047b045:	f2 0f 5e c1          	divsd  xmm0,xmm1
   14047b049:	f2 0f 2c e8          	cvttsd2si ebp,xmm0
   14047b04d:	89 3d 79 60 4d 00    	mov    DWORD PTR [rip+0x4d6079],edi        # 0x1409510cc
   14047b053:	89 2d 8f 60 4d 00    	mov    DWORD PTR [rip+0x4d608f],ebp        # 0x1409510e8
   14047b059:	40 84 f6             	test   sil,sil
   14047b05c:	74 38                	je     0x14047b096
   14047b05e:	f3 0f 10 0d 3e 60 53 	movss  xmm1,DWORD PTR [rip+0x1453603e]        # 0x1549b10a4
   14047b065:	14 
   14047b066:	45 33 c0             	xor    r8d,r8d
   14047b069:	49 8b ce             	mov    rcx,r14
   14047b06c:	e8 9f f1 e9 ff       	call   0x14031a210
   14047b071:	44 8b 05 30 f1 50 00 	mov    r8d,DWORD PTR [rip+0x50f130]        # 0x14098a1a8
   14047b078:	ff c8                	dec    eax
   14047b07a:	41 03 c0             	add    eax,r8d
   14047b07d:	33 d2                	xor    edx,edx
   14047b07f:	41 f7 f0             	div    r8d
   14047b082:	8d 48 ff             	lea    ecx,[rax-0x1]
   14047b085:	99                   	cdq
   14047b086:	2b c2                	sub    eax,edx
   14047b088:	d1 f8                	sar    eax,1
   14047b08a:	2b f8                	sub    edi,eax
   14047b08c:	85 ff                	test   edi,edi
   14047b08e:	41 0f 4e fd          	cmovle edi,r13d
   14047b092:	03 e9                	add    ebp,ecx
   14047b094:	eb 14                	jmp    0x14047b0aa
   14047b096:	44 8b 05 0b f1 50 00 	mov    r8d,DWORD PTR [rip+0x50f10b]        # 0x14098a1a8

   14047b09d:	8d 47 ff             	lea    eax,[rdi-0x1]

   14047b0a0:	85 c0                	test   eax,eax

   14047b0a2:	8b f8                	mov    edi,eax

   14047b0a4:	41 0f 4e fd          	cmovle edi,r13d

   14047b0a8:	ff c5                	inc    ebp

   14047b0aa:	83 3d f7 e8 4b 00 03 	cmp    DWORD PTR [rip+0x4be8f7],0x3        # 0x1409399a8

   14047b0b1:	0f 93 c3             	setae  bl

   14047b0b4:	0f b6 c3             	movzx  eax,bl

   14047b0b7:	3b 05 eb e8 4b 00    	cmp    eax,DWORD PTR [rip+0x4be8eb]        # 0x1409399a8

   14047b0bd:	73 5c                	jae    0x14047b11b

   14047b0bf:	8b f5                	mov    esi,ebp

   14047b0c1:	2b f7                	sub    esi,edi

   14047b0c3:	41 0f af f0          	imul   esi,r8d

   14047b0c7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]

   14047b0ce:	00 00 

   14047b0d0:	b8 04 00 00 00       	mov    eax,0x4

   14058d9ff:	00 
   14058da00:	48 8b 0d 89 aa 2c 17 	mov    rcx,QWORD PTR [rip+0x172caa89]        # 0x157858490
   14058da07:	4c 69 e8 18 08 00 00 	imul   r13,rax,0x818
   14058da0e:	4c 03 2d fb c5 3f 00 	add    r13,QWORD PTR [rip+0x3fc5fb]        # 0x14098a010
   14058da15:	4c 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],r13
   14058da1a:	48 85 c9             	test   rcx,rcx
   14058da1d:	0f 84 3b 0a 00 00    	je     0x14058e45e
   14058da23:	80 3d a7 86 97 14 00 	cmp    BYTE PTR [rip+0x149786a7],0x0        # 0x154f060d1
   14058da2a:	0f 84 2e 0a 00 00    	je     0x14058e45e
   14058da30:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14058da33:	4c 8d 45 80          	lea    r8,[rbp-0x80]
   14058da37:	48 8d 54 24 7c       	lea    rdx,[rsp+0x7c]
   14058da3c:	ff 50 20             	call   QWORD PTR [rax+0x20]
   14058da3f:	85 c0                	test   eax,eax
   14058da41:	79 0a                	jns    0x14058da4d
   14058da43:	e8 38 27 00 00       	call   0x140590180
   14058da48:	e9 11 0a 00 00       	jmp    0x14058e45e
   14058da4d:	83 3d 70 ac 2c 17 00 	cmp    DWORD PTR [rip+0x172cac70],0x0        # 0x1578586c4
   14058da54:	0f 86 b1 00 00 00    	jbe    0x14058db0b
   14058da5a:	83 3d 67 ac 2c 17 ff 	cmp    DWORD PTR [rip+0x172cac67],0xffffffff        # 0x1578586c8
   14058da61:	0f 85 a4 00 00 00    	jne    0x14058db0b
   14058da67:	8b 44 24 7c          	mov    eax,DWORD PTR [rsp+0x7c]
   14058da6b:	0f 57 f6             	xorps  xmm6,xmm6
   14058da6e:	0f 57 c0             	xorps  xmm0,xmm0
   14058da71:	f3 48 0f 2a f0       	cvtsi2ss xmm6,rax
   14058da76:	8b 05 d8 c6 3f 00    	mov    eax,DWORD PTR [rip+0x3fc6d8]        # 0x14098a154

   14058da7c:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14058da81:	0f b7 05 d6 c6 3f 00 	movzx  eax,WORD PTR [rip+0x3fc6d6]        # 0x14098a15e

   14058da88:	f3 0f 5e f0          	divss  xmm6,xmm0

   14058da8c:	0f 57 c0             	xorps  xmm0,xmm0

   14058da8f:	f3 0f 2a c0          	cvtsi2ss xmm0,eax

   14058da93:	f3 41 0f 59 f3       	mulss  xmm6,xmm11

   14058da98:	f3 0f 5e f0          	divss  xmm6,xmm0

   14058da9c:	e8 6f b8 fa ff       	call   0x140539310

   14058daa1:	48 2b 05 d0 c0 2e 17 	sub    rax,QWORD PTR [rip+0x172ec0d0]        # 0x157879b78

   14058daa8:	8b 0d 16 ac 2c 17    	mov    ecx,DWORD PTR [rip+0x172cac16]        # 0x1578586c4

   14058daae:	0f 57 d2             	xorps  xmm2,xmm2

   14058dab1:	0f 57 c0             	xorps  xmm0,xmm0

   14058dab4:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax

   14058da41:	79 0a                	jns    0x14058da4d
   14058da43:	e8 38 27 00 00       	call   0x140590180
   14058da48:	e9 11 0a 00 00       	jmp    0x14058e45e
   14058da4d:	83 3d 70 ac 2c 17 00 	cmp    DWORD PTR [rip+0x172cac70],0x0        # 0x1578586c4
   14058da54:	0f 86 b1 00 00 00    	jbe    0x14058db0b
   14058da5a:	83 3d 67 ac 2c 17 ff 	cmp    DWORD PTR [rip+0x172cac67],0xffffffff        # 0x1578586c8
   14058da61:	0f 85 a4 00 00 00    	jne    0x14058db0b
   14058da67:	8b 44 24 7c          	mov    eax,DWORD PTR [rsp+0x7c]
   14058da6b:	0f 57 f6             	xorps  xmm6,xmm6
   14058da6e:	0f 57 c0             	xorps  xmm0,xmm0
   14058da71:	f3 48 0f 2a f0       	cvtsi2ss xmm6,rax
   14058da76:	8b 05 d8 c6 3f 00    	mov    eax,DWORD PTR [rip+0x3fc6d8]        # 0x14098a154
   14058da7c:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058da81:	0f b7 05 d6 c6 3f 00 	movzx  eax,WORD PTR [rip+0x3fc6d6]        # 0x14098a15e
   14058da88:	f3 0f 5e f0          	divss  xmm6,xmm0
   14058da8c:	0f 57 c0             	xorps  xmm0,xmm0
   14058da8f:	f3 0f 2a c0          	cvtsi2ss xmm0,eax
   14058da93:	f3 41 0f 59 f3       	mulss  xmm6,xmm11
   14058da98:	f3 0f 5e f0          	divss  xmm6,xmm0
   14058da9c:	e8 6f b8 fa ff       	call   0x140539310
   14058daa1:	48 2b 05 d0 c0 2e 17 	sub    rax,QWORD PTR [rip+0x172ec0d0]        # 0x157879b78
   14058daa8:	8b 0d 16 ac 2c 17    	mov    ecx,DWORD PTR [rip+0x172cac16]        # 0x1578586c4
   14058daae:	0f 57 d2             	xorps  xmm2,xmm2
   14058dab1:	0f 57 c0             	xorps  xmm0,xmm0
   14058dab4:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   14058dab9:	8b 05 95 c6 3f 00    	mov    eax,DWORD PTR [rip+0x3fc695]        # 0x14098a154

   14058dabf:	0f 57 c9             	xorps  xmm1,xmm1

   14058dac2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14058dac7:	0f b7 05 90 c6 3f 00 	movzx  eax,WORD PTR [rip+0x3fc690]        # 0x14098a15e

   14058dace:	f3 41 0f 5e d4       	divss  xmm2,xmm12

   14058dad3:	f3 0f 2a c8          	cvtsi2ss xmm1,eax

   14058dad7:	f3 0f 5c d6          	subss  xmm2,xmm6

   14058dadb:	f3 0f 59 d0          	mulss  xmm2,xmm0

   14058dadf:	f3 0f 59 d1          	mulss  xmm2,xmm1

   14058dae3:	f3 41 0f 59 d5       	mulss  xmm2,xmm13

   14058dae8:	f3 48 0f 2c c2       	cvttss2si rax,xmm2

   14058daed:	83 e0 fc             	and    eax,0xfffffffc

   14058daf0:	89 05 d2 ab 2c 17    	mov    DWORD PTR [rip+0x172cabd2],eax        # 0x1578586c8

   14058daf6:	3b c1                	cmp    eax,ecx

   14058daf8:	76 09                	jbe    0x14058db03

   14058dafa:	44 89 25 c3 ab 2c 17 	mov    DWORD PTR [rip+0x172cabc3],r12d        # 0x1578586c4

   14058db01:	eb 08                	jmp    0x14058db0b

   14058dda9:	e8 cc 2f 09 00       	call   0x140620d7a
   14058ddae:	0f 57 f6             	xorps  xmm6,xmm6
   14058ddb1:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14058ddb5:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   14058ddba:	48 8d 3d 5b 59 43 00 	lea    rdi,[rip+0x43595b]        # 0x1409c371c
   14058ddc1:	bb 00 00 40 01       	mov    ebx,0x1400000
   14058ddc6:	45 33 e4             	xor    r12d,r12d
   14058ddc9:	e8 42 d2 cd ff       	call   0x14026b010
   14058ddce:	83 3d d7 bb 3a 00 00 	cmp    DWORD PTR [rip+0x3abbd7],0x0        # 0x1409399ac
   14058ddd5:	7c 0c                	jl     0x14058dde3
   14058ddd7:	c7 05 df cc ab 14 00 	mov    DWORD PTR [rip+0x14abccdf],0x0        # 0x15504aac0
   14058ddde:	00 00 00 
   14058dde1:	eb 08                	jmp    0x14058ddeb
   14058dde3:	f3 0f 11 35 d5 cc ab 	movss  DWORD PTR [rip+0x14abccd5],xmm6        # 0x15504aac0
   14058ddea:	14 
   14058ddeb:	41 8b 85 dc 02 00 00 	mov    eax,DWORD PTR [r13+0x2dc]
   14058ddf2:	0f 57 c0             	xorps  xmm0,xmm0
   14058ddf5:	66 41 0f 6e 8d c4 02 	movd   xmm1,DWORD PTR [r13+0x2c4]
   14058ddfc:	00 00 
   14058ddfe:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14058de01:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058de06:	f3 0f 5c c8          	subss  xmm1,xmm0
   14058de0a:	0f 2f cf             	comiss xmm1,xmm7
   14058de0d:	77 03                	ja     0x14058de12
   14058de0f:	0f 28 cf             	movaps xmm1,xmm7
   14058de12:	8b 05 90 c3 3f 00    	mov    eax,DWORD PTR [rip+0x3fc390]        # 0x14098a1a8

   14058de18:	0f 57 c0             	xorps  xmm0,xmm0

   14058de1b:	0f b7 0d 3c c3 3f 00 	movzx  ecx,WORD PTR [rip+0x3fc33c]        # 0x14098a15e

   14058de22:	0f 57 d2             	xorps  xmm2,xmm2

   14058de25:	0f 57 db             	xorps  xmm3,xmm3

   14058de28:	33 d2                	xor    edx,edx

   14058de2a:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax

   14058ddc9:	e8 42 d2 cd ff       	call   0x14026b010
   14058ddce:	83 3d d7 bb 3a 00 00 	cmp    DWORD PTR [rip+0x3abbd7],0x0        # 0x1409399ac
   14058ddd5:	7c 0c                	jl     0x14058dde3
   14058ddd7:	c7 05 df cc ab 14 00 	mov    DWORD PTR [rip+0x14abccdf],0x0        # 0x15504aac0
   14058ddde:	00 00 00 
   14058dde1:	eb 08                	jmp    0x14058ddeb
   14058dde3:	f3 0f 11 35 d5 cc ab 	movss  DWORD PTR [rip+0x14abccd5],xmm6        # 0x15504aac0
   14058ddea:	14 
   14058ddeb:	41 8b 85 dc 02 00 00 	mov    eax,DWORD PTR [r13+0x2dc]
   14058ddf2:	0f 57 c0             	xorps  xmm0,xmm0
   14058ddf5:	66 41 0f 6e 8d c4 02 	movd   xmm1,DWORD PTR [r13+0x2c4]
   14058ddfc:	00 00 
   14058ddfe:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14058de01:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058de06:	f3 0f 5c c8          	subss  xmm1,xmm0
   14058de0a:	0f 2f cf             	comiss xmm1,xmm7
   14058de0d:	77 03                	ja     0x14058de12
   14058de0f:	0f 28 cf             	movaps xmm1,xmm7
   14058de12:	8b 05 90 c3 3f 00    	mov    eax,DWORD PTR [rip+0x3fc390]        # 0x14098a1a8
   14058de18:	0f 57 c0             	xorps  xmm0,xmm0
   14058de1b:	0f b7 0d 3c c3 3f 00 	movzx  ecx,WORD PTR [rip+0x3fc33c]        # 0x14098a15e
   14058de22:	0f 57 d2             	xorps  xmm2,xmm2
   14058de25:	0f 57 db             	xorps  xmm3,xmm3
   14058de28:	33 d2                	xor    edx,edx
   14058de2a:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   14058de2f:	8b 05 1f c3 3f 00    	mov    eax,DWORD PTR [rip+0x3fc31f]        # 0x14098a154

   14058de35:	f3 48 0f 2a d8       	cvtsi2ss xmm3,rax

   14058de3a:	41 8b 85 7c 02 00 00 	mov    eax,DWORD PTR [r13+0x27c]

   14058de41:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14058de46:	f3 0f 59 ca          	mulss  xmm1,xmm2

   14058de4a:	f3 0f 58 c8          	addss  xmm1,xmm0

   14058de4e:	f3 0f 5e cb          	divss  xmm1,xmm3

   14058de52:	f3 0f 11 0d 6e cc ab 	movss  DWORD PTR [rip+0x14abcc6e],xmm1        # 0x15504aac8

   14058de59:	14 

   14058de5a:	0f 57 c9             	xorps  xmm1,xmm1

   14058de5d:	41 8b 85 9c 02 00 00 	mov    eax,DWORD PTR [r13+0x29c]

   14058de64:	66 41 0f 6e 85 c4 02 	movd   xmm0,DWORD PTR [r13+0x2c4]

   14058de6b:	00 00 

   14058de6d:	c1 e0 03             	shl    eax,0x3

   14058de70:	f7 f1                	div    ecx

   14058de72:	0f 5b c0             	cvtdq2ps xmm0,xmm0

   14058de75:	8b c8                	mov    ecx,eax

   14058e2cd:	75 1a                	jne    0x14058e2e9
   14058e2cf:	48 8d 5d 88          	lea    rbx,[rbp-0x78]
   14058e2d3:	41 8d 7e 02          	lea    edi,[r14+0x2]
   14058e2d7:	48 8b 0b             	mov    rcx,QWORD PTR [rbx]
   14058e2da:	e8 79 d2 08 00       	call   0x14061b558
   14058e2df:	48 8d 5b 08          	lea    rbx,[rbx+0x8]
   14058e2e3:	48 83 ef 01          	sub    rdi,0x1
   14058e2e7:	75 ee                	jne    0x14058e2d7
   14058e2e9:	80 3d c4 be 3f 00 00 	cmp    BYTE PTR [rip+0x3fbec4],0x0        # 0x14098a1b4
   14058e2f0:	44 0f b7 05 5a be 3f 	movzx  r8d,WORD PTR [rip+0x3fbe5a]        # 0x14098a152
   14058e2f7:	00 
   14058e2f8:	75 06                	jne    0x14058e300
   14058e2fa:	41 b8 01 00 00 00    	mov    r8d,0x1
   14058e300:	41 8b 85 9c 02 00 00 	mov    eax,DWORD PTR [r13+0x29c]
   14058e307:	33 d2                	xor    edx,edx
   14058e309:	0f b7 0d 4e be 3f 00 	movzx  ecx,WORD PTR [rip+0x3fbe4e]        # 0x14098a15e
   14058e310:	0f 57 c9             	xorps  xmm1,xmm1
   14058e313:	c1 e0 03             	shl    eax,0x3
   14058e316:	0f 57 c0             	xorps  xmm0,xmm0
   14058e319:	f7 f1                	div    ecx
   14058e31b:	33 d2                	xor    edx,edx
   14058e31d:	41 f7 f0             	div    r8d
   14058e320:	8b 54 24 58          	mov    edx,DWORD PTR [rsp+0x58]
   14058e324:	03 54 24 5c          	add    edx,DWORD PTR [rsp+0x5c]
   14058e328:	8b c8                	mov    ecx,eax
   14058e32a:	8b 05 24 be 3f 00    	mov    eax,DWORD PTR [rip+0x3fbe24]        # 0x14098a154

   14058e330:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx

   14058e335:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14058e33a:	8b 45 a8             	mov    eax,DWORD PTR [rbp-0x58]

   14058e33d:	03 c2                	add    eax,edx

   14058e33f:	33 d2                	xor    edx,edx

   14058e341:	89 45 a8             	mov    DWORD PTR [rbp-0x58],eax

   14058e344:	8d 04 c5 00 00 00 00 	lea    eax,[rax*8+0x0]

   14058e34b:	f3 0f 5e c8          	divss  xmm1,xmm0

   14058e34f:	f3 41 0f 11 8d c8 02 	movss  DWORD PTR [r13+0x2c8],xmm1

   14058e356:	00 00 

   14058e358:	0f b7 0d ff bd 3f 00 	movzx  ecx,WORD PTR [rip+0x3fbdff]        # 0x14098a15e

   14058e35f:	f7 f1                	div    ecx

   14058e361:	ba 10 00 00 00       	mov    edx,0x10

   14058e366:	49 8b cf             	mov    rcx,r15

   14058e369:	89 45 ac             	mov    DWORD PTR [rbp-0x54],eax

   14058e36c:	ff 15 46 b4 0f 00    	call   QWORD PTR [rip+0xfb446]        # 0x1406897b8

   14058e6ff:	48 89 86 88 02 00 00 	mov    QWORD PTR [rsi+0x288],rax
   14058e706:	48 83 7f 50 00       	cmp    QWORD PTR [rdi+0x50],0x0
   14058e70b:	75 10                	jne    0x14058e71d
   14058e70d:	45 33 c0             	xor    r8d,r8d
   14058e710:	33 d2                	xor    edx,edx
   14058e712:	33 c9                	xor    ecx,ecx
   14058e714:	e8 e7 ee 03 00       	call   0x1405cd600
   14058e719:	48 89 47 50          	mov    QWORD PTR [rdi+0x50],rax
   14058e71d:	48 83 7f 58 00       	cmp    QWORD PTR [rdi+0x58],0x0
   14058e722:	75 10                	jne    0x14058e734
   14058e724:	45 33 c0             	xor    r8d,r8d
   14058e727:	33 d2                	xor    edx,edx
   14058e729:	33 c9                	xor    ecx,ecx
   14058e72b:	e8 d0 ee 03 00       	call   0x1405cd600
   14058e730:	48 89 47 58          	mov    QWORD PTR [rdi+0x58],rax
   14058e734:	48 83 bf 80 00 00 00 	cmp    QWORD PTR [rdi+0x80],0x0
   14058e73b:	00 
   14058e73c:	75 13                	jne    0x14058e751
   14058e73e:	45 33 c0             	xor    r8d,r8d
   14058e741:	33 d2                	xor    edx,edx
   14058e743:	33 c9                	xor    ecx,ecx
   14058e745:	e8 b6 ee 03 00       	call   0x1405cd600
   14058e74a:	48 89 87 80 00 00 00 	mov    QWORD PTR [rdi+0x80],rax
   14058e751:	4c 8d 47 28          	lea    r8,[rdi+0x28]
   14058e755:	45 8b ce             	mov    r9d,r14d
   14058e758:	8b 15 4a ba 3f 00    	mov    edx,DWORD PTR [rip+0x3fba4a]        # 0x14098a1a8

   14058e706:	48 83 7f 50 00       	cmp    QWORD PTR [rdi+0x50],0x0
   14058e70b:	75 10                	jne    0x14058e71d
   14058e70d:	45 33 c0             	xor    r8d,r8d
   14058e710:	33 d2                	xor    edx,edx
   14058e712:	33 c9                	xor    ecx,ecx
   14058e714:	e8 e7 ee 03 00       	call   0x1405cd600
   14058e719:	48 89 47 50          	mov    QWORD PTR [rdi+0x50],rax
   14058e71d:	48 83 7f 58 00       	cmp    QWORD PTR [rdi+0x58],0x0
   14058e722:	75 10                	jne    0x14058e734
   14058e724:	45 33 c0             	xor    r8d,r8d
   14058e727:	33 d2                	xor    edx,edx
   14058e729:	33 c9                	xor    ecx,ecx
   14058e72b:	e8 d0 ee 03 00       	call   0x1405cd600
   14058e730:	48 89 47 58          	mov    QWORD PTR [rdi+0x58],rax
   14058e734:	48 83 bf 80 00 00 00 	cmp    QWORD PTR [rdi+0x80],0x0
   14058e73b:	00 
   14058e73c:	75 13                	jne    0x14058e751
   14058e73e:	45 33 c0             	xor    r8d,r8d
   14058e741:	33 d2                	xor    edx,edx
   14058e743:	33 c9                	xor    ecx,ecx
   14058e745:	e8 b6 ee 03 00       	call   0x1405cd600
   14058e74a:	48 89 87 80 00 00 00 	mov    QWORD PTR [rdi+0x80],rax
   14058e751:	4c 8d 47 28          	lea    r8,[rdi+0x28]
   14058e755:	45 8b ce             	mov    r9d,r14d
   14058e758:	8b 15 4a ba 3f 00    	mov    edx,DWORD PTR [rip+0x3fba4a]        # 0x14098a1a8
   14058e75e:	8b 0d f0 b9 3f 00    	mov    ecx,DWORD PTR [rip+0x3fb9f0]        # 0x14098a154

   14058e764:	e8 47 78 dd ff       	call   0x140365fb0

   14058e769:	89 47 24             	mov    DWORD PTR [rdi+0x24],eax

   14058e76c:	0f b7 1d df b9 3f 00 	movzx  ebx,WORD PTR [rip+0x3fb9df]        # 0x14098a152

   14058e773:	66 83 fb 01          	cmp    bx,0x1

   14058e777:	75 35                	jne    0x14058e7ae

   14058e779:	b8 02 00 00 00       	mov    eax,0x2

   14058e77e:	66 89 05 cd b9 3f 00 	mov    WORD PTR [rip+0x3fb9cd],ax        # 0x14098a152

   14058e785:	0f b7 05 d2 b9 3f 00 	movzx  eax,WORD PTR [rip+0x3fb9d2]        # 0x14098a15e

   14058e78c:	03 c0                	add    eax,eax

   14058e78e:	99                   	cdq

   14058e78f:	83 e2 07             	and    edx,0x7

   14058e792:	03 c2                	add    eax,edx

   14058e794:	c1 f8 03             	sar    eax,0x3

   14058e797:	66 89 05 be b9 3f 00 	mov    WORD PTR [rip+0x3fb9be],ax        # 0x14098a15c

   14058e79e:	0f b7 c8             	movzx  ecx,ax

   14058e73c:	75 13                	jne    0x14058e751
   14058e73e:	45 33 c0             	xor    r8d,r8d
   14058e741:	33 d2                	xor    edx,edx
   14058e743:	33 c9                	xor    ecx,ecx
   14058e745:	e8 b6 ee 03 00       	call   0x1405cd600
   14058e74a:	48 89 87 80 00 00 00 	mov    QWORD PTR [rdi+0x80],rax
   14058e751:	4c 8d 47 28          	lea    r8,[rdi+0x28]
   14058e755:	45 8b ce             	mov    r9d,r14d
   14058e758:	8b 15 4a ba 3f 00    	mov    edx,DWORD PTR [rip+0x3fba4a]        # 0x14098a1a8
   14058e75e:	8b 0d f0 b9 3f 00    	mov    ecx,DWORD PTR [rip+0x3fb9f0]        # 0x14098a154
   14058e764:	e8 47 78 dd ff       	call   0x140365fb0
   14058e769:	89 47 24             	mov    DWORD PTR [rdi+0x24],eax
   14058e76c:	0f b7 1d df b9 3f 00 	movzx  ebx,WORD PTR [rip+0x3fb9df]        # 0x14098a152
   14058e773:	66 83 fb 01          	cmp    bx,0x1
   14058e777:	75 35                	jne    0x14058e7ae
   14058e779:	b8 02 00 00 00       	mov    eax,0x2
   14058e77e:	66 89 05 cd b9 3f 00 	mov    WORD PTR [rip+0x3fb9cd],ax        # 0x14098a152
   14058e785:	0f b7 05 d2 b9 3f 00 	movzx  eax,WORD PTR [rip+0x3fb9d2]        # 0x14098a15e
   14058e78c:	03 c0                	add    eax,eax
   14058e78e:	99                   	cdq
   14058e78f:	83 e2 07             	and    edx,0x7
   14058e792:	03 c2                	add    eax,edx
   14058e794:	c1 f8 03             	sar    eax,0x3
   14058e797:	66 89 05 be b9 3f 00 	mov    WORD PTR [rip+0x3fb9be],ax        # 0x14098a15c
   14058e79e:	0f b7 c8             	movzx  ecx,ax
   14058e7a1:	0f af 0d ac b9 3f 00 	imul   ecx,DWORD PTR [rip+0x3fb9ac]        # 0x14098a154

   14058e7a8:	89 0d aa b9 3f 00    	mov    DWORD PTR [rip+0x3fb9aa],ecx        # 0x14098a158

   14058e7ae:	48 8b 0d e3 9c 2c 17 	mov    rcx,QWORD PTR [rip+0x172c9ce3]        # 0x157858498

   14058e7b5:	48 85 c9             	test   rcx,rcx

   14058e7b8:	74 15                	je     0x14058e7cf

   14058e7ba:	48 8b 01             	mov    rax,QWORD PTR [rcx]

   14058e7bd:	ff 50 10             	call   QWORD PTR [rax+0x10]

   14058e7c0:	45 33 f6             	xor    r14d,r14d

   14058e7c3:	41 8b ce             	mov    ecx,r14d

   14058e7c6:	48 89 0d cb 9c 2c 17 	mov    QWORD PTR [rip+0x172c9ccb],rcx        # 0x157858498

   14058e7cd:	eb 03                	jmp    0x14058e7d2

   14058e7cf:	45 33 f6             	xor    r14d,r14d

   14058e7d2:	48 8b 15 b7 9c 2c 17 	mov    rdx,QWORD PTR [rip+0x172c9cb7]        # 0x157858490

   14058e7d9:	48 85 d2             	test   rdx,rdx

   14058e7dc:	74 1a                	je     0x14058e7f8

   14058e7de:	48 8b 02             	mov    rax,QWORD PTR [rdx]

   14058e7e1:	48 8b ca             	mov    rcx,rdx

   14058e885:	0f 88 4d 04 00 00    	js     0x14058ecd8
   14058e88b:	44 89 35 1a 9c 2c 17 	mov    DWORD PTR [rip+0x172c9c1a],r14d        # 0x1578584ac
   14058e892:	44 89 35 2b 9e 2c 17 	mov    DWORD PTR [rip+0x172c9e2b],r14d        # 0x1578586c4
   14058e899:	48 c7 86 7c 02 00 00 	mov    QWORD PTR [rsi+0x27c],0x0
   14058e8a0:	00 00 00 00 
   14058e8a4:	4c 89 35 d5 b2 2e 17 	mov    QWORD PTR [rip+0x172eb2d5],r14        # 0x157879b80
   14058e8ab:	80 3d 93 e1 28 17 00 	cmp    BYTE PTR [rip+0x1728e193],0x0        # 0x15781ca45
   14058e8b2:	74 16                	je     0x14058e8ca
   14058e8b4:	c7 05 26 f9 3d 00 cd 	mov    DWORD PTR [rip+0x3df926],0x3dcccccd        # 0x14096e1e4
   14058e8bb:	cc cc 3d 
   14058e8be:	c7 05 20 f9 3d 00 cd 	mov    DWORD PTR [rip+0x3df920],0x3d4ccccd        # 0x14096e1e8
   14058e8c5:	cc 4c 3d 
   14058e8c8:	eb 14                	jmp    0x14058e8de
   14058e8ca:	c7 05 10 f9 3d 00 cd 	mov    DWORD PTR [rip+0x3df910],0x3e4ccccd        # 0x14096e1e4
   14058e8d1:	cc 4c 3e 
   14058e8d4:	c7 05 0a f9 3d 00 cd 	mov    DWORD PTR [rip+0x3df90a],0x3dcccccd        # 0x14096e1e8
   14058e8db:	cc cc 3d 
   14058e8de:	c6 05 9d 9b 2c 17 00 	mov    BYTE PTR [rip+0x172c9b9d],0x0        # 0x157858482
   14058e8e5:	66 83 fb 01          	cmp    bx,0x1
   14058e8e9:	75 26                	jne    0x14058e911
   14058e8eb:	66 44 89 3d 5f b8 3f 	mov    WORD PTR [rip+0x3fb85f],r15w        # 0x14098a152
   14058e8f2:	00 
   14058e8f3:	0f b7 05 64 b8 3f 00 	movzx  eax,WORD PTR [rip+0x3fb864]        # 0x14098a15e
   14058e8fa:	c1 e8 03             	shr    eax,0x3
   14058e8fd:	66 89 05 58 b8 3f 00 	mov    WORD PTR [rip+0x3fb858],ax        # 0x14098a15c
   14058e904:	0f af 05 49 b8 3f 00 	imul   eax,DWORD PTR [rip+0x3fb849]        # 0x14098a154

   14058e90b:	89 05 47 b8 3f 00    	mov    DWORD PTR [rip+0x3fb847],eax        # 0x14098a158

   14058e911:	44 89 3d 6c 9b 2c 17 	mov    DWORD PTR [rip+0x172c9b6c],r15d        # 0x157858484

   14058e918:	c6 05 b1 77 97 14 00 	mov    BYTE PTR [rip+0x149777b1],0x0        # 0x154f060d0

   14058e91f:	44 89 3d f6 79 97 14 	mov    DWORD PTR [rip+0x149779f6],r15d        # 0x154f0631c

   14058e926:	c6 05 f3 79 97 14 00 	mov    BYTE PTR [rip+0x149779f3],0x0        # 0x154f06320

   14058e92d:	c6 05 04 97 2a 17 00 	mov    BYTE PTR [rip+0x172a9704],0x0        # 0x157838038

   14058e934:	c7 05 6e b0 3a 00 ff 	mov    DWORD PTR [rip+0x3ab06e],0xffffffff        # 0x1409399ac

   14058e93b:	ff ff ff 

   14058e93e:	c6 05 8d 77 97 14 00 	mov    BYTE PTR [rip+0x1497778d],0x0        # 0x154f060d2

   14058e945:	c6 05 85 77 97 14 01 	mov    BYTE PTR [rip+0x14977785],0x1        # 0x154f060d1

   14058e94c:	44 8b 37             	mov    r14d,DWORD PTR [rdi]

   14058e94f:	48 8b 1d 82 9d 2c 17 	mov    rbx,QWORD PTR [rip+0x172c9d82]        # 0x1578586d8

   14058e956:	48 85 db             	test   rbx,rbx

   14058e959:	74 1e                	je     0x14058e979

   14058e95b:	48 8b cb             	mov    rcx,rbx

   14058e95e:	e8 9d c7 ff ff       	call   0x14058b100

   14058fb5f:	0f 45 f9             	cmovne edi,ecx
   14058fb62:	8b c7                	mov    eax,edi
   14058fb64:	42 80 bc 00 f0 92 85 	cmp    BYTE PTR [rax+r8*1+0x178592f0],0x0
   14058fb6b:	17 00 
   14058fb6d:	75 1e                	jne    0x14058fb8d
   14058fb6f:	84 d2                	test   dl,dl
   14058fb71:	b8 bf 29 00 00       	mov    eax,0x29bf
   14058fb76:	b9 69 28 00 00       	mov    ecx,0x2869
   14058fb7b:	66 0f 45 c8          	cmovne cx,ax
   14058fb7f:	0f bf d1             	movsx  edx,cx
   14058fb82:	33 c9                	xor    ecx,ecx
   14058fb84:	e8 e7 7d fa ff       	call   0x140537970
   14058fb89:	8b c6                	mov    eax,esi
   14058fb8b:	eb 66                	jmp    0x14058fbf3
   14058fb8d:	48 8d 15 bc a5 3f 00 	lea    rdx,[rip+0x3fa5bc]        # 0x14098a150
   14058fb94:	8b cf                	mov    ecx,edi
   14058fb96:	e8 a5 66 dd ff       	call   0x140366240
   14058fb9b:	0f b7 05 b0 a5 3f 00 	movzx  eax,WORD PTR [rip+0x3fa5b0]        # 0x14098a152
   14058fba2:	66 3b c6             	cmp    ax,si
   14058fba5:	74 0f                	je     0x14058fbb6
   14058fba7:	0f b7 c0             	movzx  eax,ax
   14058fbaa:	ff c0                	inc    eax
   14058fbac:	41 3b c4             	cmp    eax,r12d
   14058fbaf:	44 0f 42 e0          	cmovb  r12d,eax
   14058fbb3:	41 8b f4             	mov    esi,r12d
   14058fbb6:	8b 0d 98 a5 3f 00    	mov    ecx,DWORD PTR [rip+0x3fa598]        # 0x14098a154

   14058fbbc:	89 35 e6 9d 3a 00    	mov    DWORD PTR [rip+0x3a9de6],esi        # 0x1409399a8

   14058fbc2:	e8 a9 63 dd ff       	call   0x140365f70

   14058fb6b:	17 00 
   14058fb6d:	75 1e                	jne    0x14058fb8d
   14058fb6f:	84 d2                	test   dl,dl
   14058fb71:	b8 bf 29 00 00       	mov    eax,0x29bf
   14058fb76:	b9 69 28 00 00       	mov    ecx,0x2869
   14058fb7b:	66 0f 45 c8          	cmovne cx,ax
   14058fb7f:	0f bf d1             	movsx  edx,cx
   14058fb82:	33 c9                	xor    ecx,ecx
   14058fb84:	e8 e7 7d fa ff       	call   0x140537970
   14058fb89:	8b c6                	mov    eax,esi
   14058fb8b:	eb 66                	jmp    0x14058fbf3
   14058fb8d:	48 8d 15 bc a5 3f 00 	lea    rdx,[rip+0x3fa5bc]        # 0x14098a150
   14058fb94:	8b cf                	mov    ecx,edi
   14058fb96:	e8 a5 66 dd ff       	call   0x140366240
   14058fb9b:	0f b7 05 b0 a5 3f 00 	movzx  eax,WORD PTR [rip+0x3fa5b0]        # 0x14098a152
   14058fba2:	66 3b c6             	cmp    ax,si
   14058fba5:	74 0f                	je     0x14058fbb6
   14058fba7:	0f b7 c0             	movzx  eax,ax
   14058fbaa:	ff c0                	inc    eax
   14058fbac:	41 3b c4             	cmp    eax,r12d
   14058fbaf:	44 0f 42 e0          	cmovb  r12d,eax
   14058fbb3:	41 8b f4             	mov    esi,r12d
   14058fbb6:	8b 0d 98 a5 3f 00    	mov    ecx,DWORD PTR [rip+0x3fa598]        # 0x14098a154
   14058fbbc:	89 35 e6 9d 3a 00    	mov    DWORD PTR [rip+0x3a9de6],esi        # 0x1409399a8
   14058fbc2:	e8 a9 63 dd ff       	call   0x140365f70
   14058fbc7:	8b 0d 87 a5 3f 00    	mov    ecx,DWORD PTR [rip+0x3fa587]        # 0x14098a154

   14058fbcd:	0f 57 c9             	xorps  xmm1,xmm1

   14058fb6f:	84 d2                	test   dl,dl
   14058fb71:	b8 bf 29 00 00       	mov    eax,0x29bf
   14058fb76:	b9 69 28 00 00       	mov    ecx,0x2869
   14058fb7b:	66 0f 45 c8          	cmovne cx,ax
   14058fb7f:	0f bf d1             	movsx  edx,cx
   14058fb82:	33 c9                	xor    ecx,ecx
   14058fb84:	e8 e7 7d fa ff       	call   0x140537970
   14058fb89:	8b c6                	mov    eax,esi
   14058fb8b:	eb 66                	jmp    0x14058fbf3
   14058fb8d:	48 8d 15 bc a5 3f 00 	lea    rdx,[rip+0x3fa5bc]        # 0x14098a150
   14058fb94:	8b cf                	mov    ecx,edi
   14058fb96:	e8 a5 66 dd ff       	call   0x140366240
   14058fb9b:	0f b7 05 b0 a5 3f 00 	movzx  eax,WORD PTR [rip+0x3fa5b0]        # 0x14098a152
   14058fba2:	66 3b c6             	cmp    ax,si
   14058fba5:	74 0f                	je     0x14058fbb6
   14058fba7:	0f b7 c0             	movzx  eax,ax
   14058fbaa:	ff c0                	inc    eax
   14058fbac:	41 3b c4             	cmp    eax,r12d
   14058fbaf:	44 0f 42 e0          	cmovb  r12d,eax
   14058fbb3:	41 8b f4             	mov    esi,r12d
   14058fbb6:	8b 0d 98 a5 3f 00    	mov    ecx,DWORD PTR [rip+0x3fa598]        # 0x14098a154
   14058fbbc:	89 35 e6 9d 3a 00    	mov    DWORD PTR [rip+0x3a9de6],esi        # 0x1409399a8
   14058fbc2:	e8 a9 63 dd ff       	call   0x140365f70
   14058fbc7:	8b 0d 87 a5 3f 00    	mov    ecx,DWORD PTR [rip+0x3fa587]        # 0x14098a154
   14058fbcd:	0f 57 c9             	xorps  xmm1,xmm1
   14058fbd0:	89 05 d2 a5 3f 00    	mov    DWORD PTR [rip+0x3fa5d2],eax        # 0x14098a1a8

   14058fbd6:	0f 57 c0             	xorps  xmm0,xmm0

   14058fbd9:	8b c0                	mov    eax,eax

   14058fbdb:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx

   14058fbe0:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   14058fbe5:	33 c0                	xor    eax,eax

   14058fbe7:	f3 0f 5e c8          	divss  xmm1,xmm0

   14058fbeb:	f3 0f 11 0d b9 a5 3f 	movss  DWORD PTR [rip+0x3fa5b9],xmm1        # 0x14098a1ac

   14058fbf2:	00 

   14058fbf3:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]

   14058fbf8:	48 33 cc             	xor    rcx,rsp

   14058fbfb:	e8 00 ba 08 00       	call   0x14061b600

   14058fc00:	48 81 c4 90 00 00 00 	add    rsp,0x90

   14058fc07:	41 5c                	pop    r12

   14058fc09:	5f                   	pop    rdi

   14058fc0a:	5e                   	pop    rsi

   14058fc0b:	c3                   	ret

   140590367:	0f 11 05 e2 14 3b 00 	movups XMMWORD PTR [rip+0x3b14e2],xmm0        # 0x140941850
   14059036e:	40 88 35 5d 5d 97 14 	mov    BYTE PTR [rip+0x14975d5d],sil        # 0x154f060d2
   140590375:	f2 0f 11 0d e3 14 3b 	movsd  QWORD PTR [rip+0x3b14e3],xmm1        # 0x140941860
   14059037c:	00 
   14059037d:	48 83 c4 40          	add    rsp,0x40
   140590381:	5e                   	pop    rsi
   140590382:	c3                   	ret
   140590383:	cc                   	int3
   140590384:	cc                   	int3
   140590385:	cc                   	int3
   140590386:	cc                   	int3
   140590387:	cc                   	int3
   140590388:	cc                   	int3
   140590389:	cc                   	int3
   14059038a:	cc                   	int3
   14059038b:	cc                   	int3
   14059038c:	cc                   	int3
   14059038d:	cc                   	int3
   14059038e:	cc                   	int3
   14059038f:	cc                   	int3
   140590390:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140590395:	44 8b 15 6c 9c 3f 00 	mov    r10d,DWORD PTR [rip+0x3f9c6c]        # 0x14098a008
   14059039c:	45 33 db             	xor    r11d,r11d
   14059039f:	48 8b 1d 6a 9c 3f 00 	mov    rbx,QWORD PTR [rip+0x3f9c6a]        # 0x14098a010
   1405903a6:	0f 57 e4             	xorps  xmm4,xmm4
   1405903a9:	44 8b 05 f8 9d 3f 00 	mov    r8d,DWORD PTR [rip+0x3f9df8]        # 0x14098a1a8

   14059036e:	40 88 35 5d 5d 97 14 	mov    BYTE PTR [rip+0x14975d5d],sil        # 0x154f060d2
   140590375:	f2 0f 11 0d e3 14 3b 	movsd  QWORD PTR [rip+0x3b14e3],xmm1        # 0x140941860
   14059037c:	00 
   14059037d:	48 83 c4 40          	add    rsp,0x40
   140590381:	5e                   	pop    rsi
   140590382:	c3                   	ret
   140590383:	cc                   	int3
   140590384:	cc                   	int3
   140590385:	cc                   	int3
   140590386:	cc                   	int3
   140590387:	cc                   	int3
   140590388:	cc                   	int3
   140590389:	cc                   	int3
   14059038a:	cc                   	int3
   14059038b:	cc                   	int3
   14059038c:	cc                   	int3
   14059038d:	cc                   	int3
   14059038e:	cc                   	int3
   14059038f:	cc                   	int3
   140590390:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140590395:	44 8b 15 6c 9c 3f 00 	mov    r10d,DWORD PTR [rip+0x3f9c6c]        # 0x14098a008
   14059039c:	45 33 db             	xor    r11d,r11d
   14059039f:	48 8b 1d 6a 9c 3f 00 	mov    rbx,QWORD PTR [rip+0x3f9c6a]        # 0x14098a010
   1405903a6:	0f 57 e4             	xorps  xmm4,xmm4
   1405903a9:	44 8b 05 f8 9d 3f 00 	mov    r8d,DWORD PTR [rip+0x3f9df8]        # 0x14098a1a8
   1405903b0:	44 8b 0d 9d 9d 3f 00 	mov    r9d,DWORD PTR [rip+0x3f9d9d]        # 0x14098a154

   1405903b7:	41 83 fa 04          	cmp    r10d,0x4

   1405903bb:	0f 82 bf 01 00 00    	jb     0x140590580

   1405903c1:	41 8d 42 fc          	lea    eax,[r10-0x4]

   1405903c5:	c1 e8 02             	shr    eax,0x2

   1405903c8:	48 8d 8b ac 12 00 00 	lea    rcx,[rbx+0x12ac]

   1405903cf:	ff c0                	inc    eax

   1405903d1:	8b d0                	mov    edx,eax

   1405903d3:	44 8d 1c 85 00 00 00 	lea    r11d,[rax*4+0x0]

   1405903da:	00 

   1405903db:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

   1405903e0:	8b 81 cc ef ff ff    	mov    eax,DWORD PTR [rcx-0x1034]

   1405903e6:	85 c0                	test   eax,eax

   1405903e8:	74 5d                	je     0x140590447

   1405903ea:	0f 57 db             	xorps  xmm3,xmm3

   1405903ed:	0f 57 c0             	xorps  xmm0,xmm0

   1405903f0:	f3 48 0f 2a d8       	cvtsi2ss xmm3,rax

   1405ac27f:	75 27                	jne    0x1405ac2a8
   1405ac281:	85 ff                	test   edi,edi
   1405ac283:	75 0e                	jne    0x1405ac293
   1405ac285:	45 33 c0             	xor    r8d,r8d
   1405ac288:	41 8b c4             	mov    eax,r12d
   1405ac28b:	41 3b d4             	cmp    edx,r12d
   1405ac28e:	0f 4c c2             	cmovl  eax,edx
   1405ac291:	eb 1a                	jmp    0x1405ac2ad
   1405ac293:	80 bd 98 04 00 00 00 	cmp    BYTE PTR [rbp+0x498],0x0
   1405ac29a:	45 8b c4             	mov    r8d,r12d
   1405ac29d:	b8 00 00 00 00       	mov    eax,0x0
   1405ac2a2:	44 0f 45 c0          	cmovne r8d,eax
   1405ac2a6:	eb 03                	jmp    0x1405ac2ab
   1405ac2a8:	45 33 c0             	xor    r8d,r8d
   1405ac2ab:	8b c2                	mov    eax,edx
   1405ac2ad:	8b 55 fc             	mov    edx,DWORD PTR [rbp-0x4]
   1405ac2b0:	3b d0                	cmp    edx,eax
   1405ac2b2:	0f 4d d0             	cmovge edx,eax
   1405ac2b5:	83 3d b4 59 39 00 00 	cmp    DWORD PTR [rip+0x3959b4],0x0        # 0x140941c70
   1405ac2bc:	0f b7 c6             	movzx  eax,si
   1405ac2bf:	7c 43                	jl     0x1405ac304
   1405ac2c1:	3b f8                	cmp    edi,eax
   1405ac2c3:	7d 3f                	jge    0x1405ac304
   1405ac2c5:	83 ff 01             	cmp    edi,0x1
   1405ac2c8:	75 3a                	jne    0x1405ac304
   1405ac2ca:	8b 05 d8 de 3d 00    	mov    eax,DWORD PTR [rip+0x3dded8]        # 0x14098a1a8

   1405ac2d0:	45 0f 57 c9          	xorps  xmm9,xmm9

   1405ac2d4:	0f 57 c0             	xorps  xmm0,xmm0

   1405ac2d7:	f3 4c 0f 2a c8       	cvtsi2ss xmm9,rax

   1405ac288:	41 8b c4             	mov    eax,r12d
   1405ac28b:	41 3b d4             	cmp    edx,r12d
   1405ac28e:	0f 4c c2             	cmovl  eax,edx
   1405ac291:	eb 1a                	jmp    0x1405ac2ad
   1405ac293:	80 bd 98 04 00 00 00 	cmp    BYTE PTR [rbp+0x498],0x0
   1405ac29a:	45 8b c4             	mov    r8d,r12d
   1405ac29d:	b8 00 00 00 00       	mov    eax,0x0
   1405ac2a2:	44 0f 45 c0          	cmovne r8d,eax
   1405ac2a6:	eb 03                	jmp    0x1405ac2ab
   1405ac2a8:	45 33 c0             	xor    r8d,r8d
   1405ac2ab:	8b c2                	mov    eax,edx
   1405ac2ad:	8b 55 fc             	mov    edx,DWORD PTR [rbp-0x4]
   1405ac2b0:	3b d0                	cmp    edx,eax
   1405ac2b2:	0f 4d d0             	cmovge edx,eax
   1405ac2b5:	83 3d b4 59 39 00 00 	cmp    DWORD PTR [rip+0x3959b4],0x0        # 0x140941c70
   1405ac2bc:	0f b7 c6             	movzx  eax,si
   1405ac2bf:	7c 43                	jl     0x1405ac304
   1405ac2c1:	3b f8                	cmp    edi,eax
   1405ac2c3:	7d 3f                	jge    0x1405ac304
   1405ac2c5:	83 ff 01             	cmp    edi,0x1
   1405ac2c8:	75 3a                	jne    0x1405ac304
   1405ac2ca:	8b 05 d8 de 3d 00    	mov    eax,DWORD PTR [rip+0x3dded8]        # 0x14098a1a8
   1405ac2d0:	45 0f 57 c9          	xorps  xmm9,xmm9
   1405ac2d4:	0f 57 c0             	xorps  xmm0,xmm0
   1405ac2d7:	f3 4c 0f 2a c8       	cvtsi2ss xmm9,rax
   1405ac2dc:	8b 05 72 de 3d 00    	mov    eax,DWORD PTR [rip+0x3dde72]        # 0x14098a154

   1405ac2e2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1405ac2e7:	f3 45 0f 58 c9       	addss  xmm9,xmm9

   1405ac2ec:	f3 44 0f 5e c8       	divss  xmm9,xmm0

   1405ac2f1:	f3 44 0f 58 0d 62 e8 	addss  xmm9,DWORD PTR [rip+0x172fe862]        # 0x1578aab5c

   1405ac2f8:	2f 17 

   1405ac2fa:	f3 44 0f 58 cf       	addss  xmm9,xmm7

   1405ac2ff:	e9 4b ff ff ff       	jmp    0x1405ac24f

   1405ac304:	83 3d 31 55 39 00 00 	cmp    DWORD PTR [rip+0x395531],0x0        # 0x14094183c

   1405ac30b:	7c 12                	jl     0x1405ac31f

   1405ac30d:	3b f8                	cmp    edi,eax

   1405ac30f:	7d 0e                	jge    0x1405ac31f

   1405ac311:	83 ff 01             	cmp    edi,0x1

   1405ac314:	75 09                	jne    0x1405ac31f

   1405ac316:	44 0f 28 cf          	movaps xmm9,xmm7

   1405ac31a:	e9 30 ff ff ff       	jmp    0x1405ac24f

   1405ac31f:	44 0f 28 cf          	movaps xmm9,xmm7

   1405aca6f:	85 ff                	test   edi,edi
   1405aca71:	75 10                	jne    0x1405aca83
   1405aca73:	44 8b 45 9c          	mov    r8d,DWORD PTR [rbp-0x64]
   1405aca77:	41 8b c0             	mov    eax,r8d
   1405aca7a:	89 45 b0             	mov    DWORD PTR [rbp-0x50],eax
   1405aca7d:	eb 0d                	jmp    0x1405aca8c
   1405aca7f:	44 8b 7d 84          	mov    r15d,DWORD PTR [rbp-0x7c]
   1405aca83:	44 8b 45 9c          	mov    r8d,DWORD PTR [rbp-0x64]
   1405aca87:	8b c3                	mov    eax,ebx
   1405aca89:	89 5d b0             	mov    DWORD PTR [rbp-0x50],ebx
   1405aca8c:	3b c2                	cmp    eax,edx
   1405aca8e:	0f 8c 04 13 00 00    	jl     0x1405add98
   1405aca94:	4c 63 65 b0          	movsxd r12,DWORD PTR [rbp-0x50]
   1405aca98:	4d 8b cc             	mov    r9,r12
   1405aca9b:	4c 89 65 20          	mov    QWORD PTR [rbp+0x20],r12
   1405aca9f:	eb 0e                	jmp    0x1405acaaf
   1405acaa1:	44 8b 7d 84          	mov    r15d,DWORD PTR [rbp-0x7c]
   1405acaa5:	4c 8d 1d 54 35 a5 ff 	lea    r11,[rip+0xffffffffffa53554]        # 0x140000000
   1405acaac:	44 8b e0             	mov    r12d,eax
   1405acaaf:	83 3d ba 51 39 00 00 	cmp    DWORD PTR [rip+0x3951ba],0x0        # 0x140941c70
   1405acab6:	7c 46                	jl     0x1405acafe
   1405acab8:	45 3b e6             	cmp    r12d,r14d
   1405acabb:	7d 41                	jge    0x1405acafe
   1405acabd:	41 83 fc 01          	cmp    r12d,0x1
   1405acac1:	75 3b                	jne    0x1405acafe
   1405acac3:	8b 05 df d6 3d 00    	mov    eax,DWORD PTR [rip+0x3dd6df]        # 0x14098a1a8

   1405acac9:	45 0f 57 c9          	xorps  xmm9,xmm9

   1405acacd:	0f 57 c0             	xorps  xmm0,xmm0

   1405acad0:	45 0f 57 ed          	xorps  xmm13,xmm13

   1405acad4:	f3 4c 0f 2a c8       	cvtsi2ss xmm9,rax

   1405aca7d:	eb 0d                	jmp    0x1405aca8c
   1405aca7f:	44 8b 7d 84          	mov    r15d,DWORD PTR [rbp-0x7c]
   1405aca83:	44 8b 45 9c          	mov    r8d,DWORD PTR [rbp-0x64]
   1405aca87:	8b c3                	mov    eax,ebx
   1405aca89:	89 5d b0             	mov    DWORD PTR [rbp-0x50],ebx
   1405aca8c:	3b c2                	cmp    eax,edx
   1405aca8e:	0f 8c 04 13 00 00    	jl     0x1405add98
   1405aca94:	4c 63 65 b0          	movsxd r12,DWORD PTR [rbp-0x50]
   1405aca98:	4d 8b cc             	mov    r9,r12
   1405aca9b:	4c 89 65 20          	mov    QWORD PTR [rbp+0x20],r12
   1405aca9f:	eb 0e                	jmp    0x1405acaaf
   1405acaa1:	44 8b 7d 84          	mov    r15d,DWORD PTR [rbp-0x7c]
   1405acaa5:	4c 8d 1d 54 35 a5 ff 	lea    r11,[rip+0xffffffffffa53554]        # 0x140000000
   1405acaac:	44 8b e0             	mov    r12d,eax
   1405acaaf:	83 3d ba 51 39 00 00 	cmp    DWORD PTR [rip+0x3951ba],0x0        # 0x140941c70
   1405acab6:	7c 46                	jl     0x1405acafe
   1405acab8:	45 3b e6             	cmp    r12d,r14d
   1405acabb:	7d 41                	jge    0x1405acafe
   1405acabd:	41 83 fc 01          	cmp    r12d,0x1
   1405acac1:	75 3b                	jne    0x1405acafe
   1405acac3:	8b 05 df d6 3d 00    	mov    eax,DWORD PTR [rip+0x3dd6df]        # 0x14098a1a8
   1405acac9:	45 0f 57 c9          	xorps  xmm9,xmm9
   1405acacd:	0f 57 c0             	xorps  xmm0,xmm0
   1405acad0:	45 0f 57 ed          	xorps  xmm13,xmm13
   1405acad4:	f3 4c 0f 2a c8       	cvtsi2ss xmm9,rax
   1405acad9:	8b 05 75 d6 3d 00    	mov    eax,DWORD PTR [rip+0x3dd675]        # 0x14098a154

   1405acadf:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax

   1405acae4:	f3 45 0f 58 c9       	addss  xmm9,xmm9

   1405acae9:	f3 44 0f 5e c8       	divss  xmm9,xmm0

   1405acaee:	f3 44 0f 58 0d 65 e0 	addss  xmm9,DWORD PTR [rip+0x172fe065]        # 0x1578aab5c

   1405acaf5:	2f 17 

   1405acaf7:	f3 45 0f 58 cd       	addss  xmm9,xmm13

   1405acafc:	eb 08                	jmp    0x1405acb06

   1405acafe:	45 0f 57 c9          	xorps  xmm9,xmm9

   1405acb02:	45 0f 57 ed          	xorps  xmm13,xmm13

   1405acb06:	f3 44 0f 11 4d e8    	movss  DWORD PTR [rbp-0x18],xmm9

   1405acb0c:	85 ff                	test   edi,edi

   1405acb0e:	74 0a                	je     0x1405acb1a

   1405acb10:	48 8b 45 f0          	mov    rax,QWORD PTR [rbp-0x10]

   1405acb14:	46 8b 34 88          	mov    r14d,DWORD PTR [rax+r9*4]

   1405acb18:	eb 0f                	jmp    0x1405acb29

   1405acb1a:	48 8b 45 e0          	mov    rax,QWORD PTR [rbp-0x20]
