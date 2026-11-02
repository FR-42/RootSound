
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403204c0 <.text+0x31f4c0>:
   1403204c0:	40 55                	rex push rbp
   1403204c2:	41 55                	push   r13
   1403204c4:	48 8d ac 24 38 ef ff 	lea    rbp,[rsp-0x10c8]
   1403204cb:	ff 
   1403204cc:	b8 c8 11 00 00       	mov    eax,0x11c8
   1403204d1:	e8 6a b8 2f 00       	call   0x14061bd40
   1403204d6:	48 2b e0             	sub    rsp,rax
   1403204d9:	44 0f 29 8c 24 60 11 	movaps XMMWORD PTR [rsp+0x1160],xmm9
   1403204e0:	00 00 
   1403204e2:	48 8b 05 7f 1c 65 00 	mov    rax,QWORD PTR [rip+0x651c7f]        # 0x140972168
   1403204e9:	48 33 c4             	xor    rax,rsp
   1403204ec:	48 89 85 f0 0f 00 00 	mov    QWORD PTR [rbp+0xff0],rax
   1403204f3:	4d 8b e8             	mov    r13,r8
   1403204f6:	4c 89 44 24 58       	mov    QWORD PTR [rsp+0x58],r8
   1403204fb:	49 83 c0 14          	add    r8,0x14
   1403204ff:	4c 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],r9
   140320504:	49 8b c0             	mov    rax,r8
   140320507:	48 89 4c 24 48       	mov    QWORD PTR [rsp+0x48],rcx
   14032050c:	4c 8b d9             	mov    r11,rcx
   14032050f:	45 0f 57 c9          	xorps  xmm9,xmm9
   140320513:	0f 57 d2             	xorps  xmm2,xmm2
   140320516:	ba 30 00 00 00       	mov    edx,0x30
   14032051b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140320520:	f3 0f 58 10          	addss  xmm2,DWORD PTR [rax]
   140320524:	48 83 c0 20          	add    rax,0x20
   140320528:	48 83 ea 01          	sub    rdx,0x1
   14032052c:	75 f2                	jne    0x140320520
   14032052e:	49 8d 85 cc 0c 00 00 	lea    rax,[r13+0xccc]
   140320535:	f3 0f 11 54 24 38    	movss  DWORD PTR [rsp+0x38],xmm2
   14032053b:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   14032053e:	48 8d 8d b0 01 00 00 	lea    rcx,[rbp+0x1b0]
   140320545:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   140320549:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   14032054c:	0f 10 40 20          	movups xmm0,XMMWORD PTR [rax+0x20]
   140320550:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   140320554:	0f 10 48 30          	movups xmm1,XMMWORD PTR [rax+0x30]
   140320558:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   14032055c:	0f 10 40 40          	movups xmm0,XMMWORD PTR [rax+0x40]
   140320560:	0f 11 49 30          	movups XMMWORD PTR [rcx+0x30],xmm1
   140320564:	0f 10 48 50          	movups xmm1,XMMWORD PTR [rax+0x50]
   140320568:	0f 11 41 40          	movups XMMWORD PTR [rcx+0x40],xmm0
   14032056c:	0f 10 40 60          	movups xmm0,XMMWORD PTR [rax+0x60]
   140320570:	0f 11 49 50          	movups XMMWORD PTR [rcx+0x50],xmm1
   140320574:	0f 10 88 80 00 00 00 	movups xmm1,XMMWORD PTR [rax+0x80]
   14032057b:	0f 11 41 60          	movups XMMWORD PTR [rcx+0x60],xmm0
   14032057f:	0f 10 40 70          	movups xmm0,XMMWORD PTR [rax+0x70]
   140320583:	0f 11 41 70          	movups XMMWORD PTR [rcx+0x70],xmm0
   140320587:	0f 10 80 90 00 00 00 	movups xmm0,XMMWORD PTR [rax+0x90]
   14032058e:	0f 11 89 80 00 00 00 	movups XMMWORD PTR [rcx+0x80],xmm1
   140320595:	0f 10 88 a0 00 00 00 	movups xmm1,XMMWORD PTR [rax+0xa0]
   14032059c:	0f 11 81 90 00 00 00 	movups XMMWORD PTR [rcx+0x90],xmm0
   1403205a3:	0f 10 80 b0 00 00 00 	movups xmm0,XMMWORD PTR [rax+0xb0]
   1403205aa:	48 8d 85 b0 01 00 00 	lea    rax,[rbp+0x1b0]
   1403205b1:	0f 11 89 a0 00 00 00 	movups XMMWORD PTR [rcx+0xa0],xmm1
   1403205b8:	f2 0f 10 0d 18 86 37 	movsd  xmm1,QWORD PTR [rip+0x378618]        # 0x140698bd8
   1403205bf:	00 
   1403205c0:	0f 11 81 b0 00 00 00 	movups XMMWORD PTR [rcx+0xb0],xmm0
   1403205c7:	8d 4a 30             	lea    ecx,[rdx+0x30]
   1403205ca:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   1403205d0:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   1403205d4:	0f 5a c0             	cvtps2pd xmm0,xmm0
   1403205d7:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   1403205db:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   1403205df:	f3 0f 11 00          	movss  DWORD PTR [rax],xmm0
   1403205e3:	48 83 c0 04          	add    rax,0x4
   1403205e7:	48 83 e9 01          	sub    rcx,0x1
   1403205eb:	75 e3                	jne    0x1403205d0
   1403205ed:	48 89 9c 24 e8 11 00 	mov    QWORD PTR [rsp+0x11e8],rbx
   1403205f4:	00 
   1403205f5:	48 89 b4 24 c0 11 00 	mov    QWORD PTR [rsp+0x11c0],rsi
   1403205fc:	00 
   1403205fd:	48 89 bc 24 b8 11 00 	mov    QWORD PTR [rsp+0x11b8],rdi
   140320604:	00 
   140320605:	4c 89 a4 24 b0 11 00 	mov    QWORD PTR [rsp+0x11b0],r12
   14032060c:	00 
   14032060d:	4c 89 b4 24 a8 11 00 	mov    QWORD PTR [rsp+0x11a8],r14
   140320614:	00 
   140320615:	4c 89 bc 24 a0 11 00 	mov    QWORD PTR [rsp+0x11a0],r15
   14032061c:	00 
   14032061d:	0f 29 b4 24 90 11 00 	movaps XMMWORD PTR [rsp+0x1190],xmm6
   140320624:	00 
   140320625:	0f 29 bc 24 80 11 00 	movaps XMMWORD PTR [rsp+0x1180],xmm7
   14032062c:	00 
   14032062d:	44 0f 29 84 24 70 11 	movaps XMMWORD PTR [rsp+0x1170],xmm8
   140320634:	00 00 
   140320636:	44 0f 29 94 24 50 11 	movaps XMMWORD PTR [rsp+0x1150],xmm10
   14032063d:	00 00 
   14032063f:	44 0f 29 9c 24 40 11 	movaps XMMWORD PTR [rsp+0x1140],xmm11
   140320646:	00 00 
   140320648:	44 0f 29 a4 24 30 11 	movaps XMMWORD PTR [rsp+0x1130],xmm12
   14032064f:	00 00 
   140320651:	44 0f 29 ac 24 20 11 	movaps XMMWORD PTR [rsp+0x1120],xmm13
   140320658:	00 00 
   14032065a:	44 0f 29 b4 24 10 11 	movaps XMMWORD PTR [rsp+0x1110],xmm14
   140320661:	00 00 
   140320663:	44 0f 29 bc 24 00 11 	movaps XMMWORD PTR [rsp+0x1100],xmm15
   14032066a:	00 00 
   14032066c:	41 38 8b 92 00 00 00 	cmp    BYTE PTR [r11+0x92],cl
   140320673:	75 0d                	jne    0x140320682
   140320675:	41 38 8b 93 00 00 00 	cmp    BYTE PTR [r11+0x93],cl
   14032067c:	0f 84 e4 0a 00 00    	je     0x140321166
   140320682:	0f b7 8d 00 11 00 00 	movzx  ecx,WORD PTR [rbp+0x1100]
   140320689:	45 33 d2             	xor    r10d,r10d
   14032068c:	41 0f b7 c2          	movzx  eax,r10w
   140320690:	66 89 44 24 30       	mov    WORD PTR [rsp+0x30],ax
   140320695:	66 44 3b d1          	cmp    r10w,cx
   140320699:	0f 83 c7 0a 00 00    	jae    0x140321166
   14032069f:	f2 0f 10 1d d1 fa 52 	movsd  xmm3,QWORD PTR [rip+0x52fad1]        # 0x140850178
   1403206a6:	00 
   1403206a7:	45 0f 57 c0          	xorps  xmm8,xmm8
   1403206ab:	f3 44 0f 10 2d 7c f9 	movss  xmm13,DWORD PTR [rip+0x52f97c]        # 0x140850030
   1403206b2:	52 00 
   1403206b4:	f2 0f 10 25 ec fa 52 	movsd  xmm4,QWORD PTR [rip+0x52faec]        # 0x1408501a8
   1403206bb:	00 
   1403206bc:	f3 0f 10 2d c8 da 36 	movss  xmm5,DWORD PTR [rip+0x36dac8]        # 0x14068e18c
   1403206c3:	00 
   1403206c4:	f3 0f 10 35 84 73 38 	movss  xmm6,DWORD PTR [rip+0x387384]        # 0x1406a7a50
   1403206cb:	00 
   1403206cc:	f3 0f 10 3d b8 85 37 	movss  xmm7,DWORD PTR [rip+0x3785b8]        # 0x140698c8c
   1403206d3:	00 
   1403206d4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403206d8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1403206df:	00 
   1403206e0:	83 3d c1 92 61 00 03 	cmp    DWORD PTR [rip+0x6192c1],0x3        # 0x1409399a8
   1403206e7:	44 0f b7 e0          	movzx  r12d,ax
   1403206eb:	72 63                	jb     0x140320750
   1403206ed:	41 0f bf 95 90 0d 00 	movsx  edx,WORD PTR [r13+0xd90]
   1403206f4:	00 
   1403206f5:	49 69 c4 18 3c 00 00 	imul   rax,r12,0x3c18
   1403206fc:	66 0f 6e ca          	movd   xmm1,edx
   140320700:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   140320704:	42 0f bf 4c 08 0e    	movsx  ecx,WORD PTR [rax+r9*1+0xe]
   14032070a:	8b c1                	mov    eax,ecx
   14032070c:	66 0f 6e c0          	movd   xmm0,eax
   140320710:	f3 0f e6 c0          	cvtdq2pd xmm0,xmm0
   140320714:	66 3b ca             	cmp    cx,dx
   140320717:	7e 06                	jle    0x14032071f
   140320719:	f2 0f 5c c1          	subsd  xmm0,xmm1
   14032071d:	eb 07                	jmp    0x140320726
   14032071f:	f2 0f 5c c8          	subsd  xmm1,xmm0
   140320723:	0f 28 c1             	movaps xmm0,xmm1
   140320726:	f2 0f 5c 05 0a 73 38 	subsd  xmm0,QWORD PTR [rip+0x38730a]        # 0x1406a7a38
   14032072d:	00 
   14032072e:	0f b7 44 24 30       	movzx  eax,WORD PTR [rsp+0x30]
   140320733:	0f 28 cb             	movaps xmm1,xmm3
   140320736:	0f b7 8d 00 11 00 00 	movzx  ecx,WORD PTR [rbp+0x1100]
   14032073d:	f2 41 0f 5f c0       	maxsd  xmm0,xmm8
   140320742:	f2 0f 5e 05 f6 72 38 	divsd  xmm0,QWORD PTR [rip+0x3872f6]        # 0x1406a7a40
   140320749:	00 
   14032074a:	f2 0f 5c c8          	subsd  xmm1,xmm0
   14032074e:	eb 03                	jmp    0x140320753
   140320750:	0f 28 cb             	movaps xmm1,xmm3
   140320753:	45 0f 57 f6          	xorps  xmm14,xmm14
   140320757:	f2 44 0f 5a f1       	cvtsd2ss xmm14,xmm1
   14032075c:	45 0f 2e f1          	ucomiss xmm14,xmm9
   140320760:	7a 06                	jp     0x140320768
   140320762:	0f 84 ed 09 00 00    	je     0x140321155
   140320768:	f3 45 0f 10 7d 00    	movss  xmm15,DWORD PTR [r13+0x0]
   14032076e:	48 8d 8d f0 00 00 00 	lea    rcx,[rbp+0xf0]
   140320775:	4d 69 f4 18 3c 00 00 	imul   r14,r12,0x3c18
   14032077c:	41 0f 28 c7          	movaps xmm0,xmm15
   140320780:	49 8b d0             	mov    rdx,r8
   140320783:	41 b8 30 00 00 00    	mov    r8d,0x30
   140320789:	4c 89 74 24 60       	mov    QWORD PTR [rsp+0x60],r14
   14032078e:	f3 43 0f 10 14 0e    	movss  xmm2,DWORD PTR [r14+r9*1]
   140320794:	f3 0f 5e c2          	divss  xmm0,xmm2
   140320798:	f3 0f 11 54 24 34    	movss  DWORD PTR [rsp+0x34],xmm2
   14032079e:	f3 0f 58 05 36 f8 52 	addss  xmm0,DWORD PTR [rip+0x52f836]        # 0x14084ffdc
   1403207a5:	00 
   1403207a6:	f3 44 0f 2c f8       	cvttss2si r15d,xmm0
   1403207ab:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   1403207b0:	8b 02                	mov    eax,DWORD PTR [rdx]
   1403207b2:	48 8d 52 20          	lea    rdx,[rdx+0x20]
   1403207b6:	89 01                	mov    DWORD PTR [rcx],eax
   1403207b8:	48 8d 49 04          	lea    rcx,[rcx+0x4]
   1403207bc:	49 83 e8 01          	sub    r8,0x1
   1403207c0:	75 ee                	jne    0x1403207b0
   1403207c2:	f3 43 0f 10 4c 0e 04 	movss  xmm1,DWORD PTR [r14+r9*1+0x4]
   1403207c9:	be 01 00 00 00       	mov    esi,0x1
   1403207ce:	f3 45 0f 10 65 04    	movss  xmm12,DWORD PTR [r13+0x4]
   1403207d4:	4c 8b 74 24 50       	mov    r14,QWORD PTR [rsp+0x50]
   1403207d9:	f3 0f 11 4c 24 40    	movss  DWORD PTR [rsp+0x40],xmm1
   1403207df:	8b c6                	mov    eax,esi
   1403207e1:	41 0f 2f c9          	comiss xmm1,xmm9
   1403207e5:	45 0f 57 db          	xorps  xmm11,xmm11
   1403207e9:	f3 4c 0f 2a d8       	cvtsi2ss xmm11,rax
   1403207ee:	41 0f 28 c3          	movaps xmm0,xmm11
   1403207f2:	f3 0f 59 c2          	mulss  xmm0,xmm2
   1403207f6:	76 1b                	jbe    0x140320813
   1403207f8:	f3 45 0f 59 db       	mulss  xmm11,xmm11
   1403207fd:	f3 45 0f 5c dd       	subss  xmm11,xmm13
   140320802:	f3 44 0f 59 d9       	mulss  xmm11,xmm1
   140320807:	f3 45 0f 58 dd       	addss  xmm11,xmm13
   14032080c:	f3 44 0f 59 d8       	mulss  xmm11,xmm0
   140320811:	eb 04                	jmp    0x140320817
   140320813:	44 0f 28 d8          	movaps xmm11,xmm0
   140320817:	45 0f 2e e1          	ucomiss xmm12,xmm9
   14032081b:	8d 46 ff             	lea    eax,[rsi-0x1]
   14032081e:	41 8b da             	mov    ebx,r10d
   140320821:	8b f8                	mov    edi,eax
   140320823:	44 89 54 85 30       	mov    DWORD PTR [rbp+rax*4+0x30],r10d
   140320828:	7a 06                	jp     0x140320830
   14032082a:	0f 84 e5 00 00 00    	je     0x140320915
   140320830:	41 0f 28 c3          	movaps xmm0,xmm11
   140320834:	f3 0f 59 05 cc 68 37 	mulss  xmm0,DWORD PTR [rip+0x3768cc]        # 0x140697108
   14032083b:	00 
   14032083c:	44 0f 2f f8          	comiss xmm15,xmm0
   140320840:	0f 83 cf 00 00 00    	jae    0x140320915
   140320846:	0f 57 c9             	xorps  xmm1,xmm1
   140320849:	0f 28 d3             	movaps xmm2,xmm3
   14032084c:	f3 41 0f 5a cc       	cvtss2sd xmm1,xmm12
   140320851:	45 0f 57 d2          	xorps  xmm10,xmm10
   140320855:	f2 0f 5c d1          	subsd  xmm2,xmm1
   140320859:	41 0f 5a fb          	cvtps2pd xmm7,xmm11
   14032085d:	f2 0f 5e d1          	divsd  xmm2,xmm1
   140320861:	f3 45 0f 5a d7       	cvtss2sd xmm10,xmm15
   140320866:	41 0f 28 c2          	movaps xmm0,xmm10
   14032086a:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14032086e:	0f 28 ca             	movaps xmm1,xmm2
   140320871:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140320875:	f2 0f 5e f8          	divsd  xmm7,xmm0
   140320879:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032087d:	0f 57 3d 3c ff 52 00 	xorps  xmm7,XMMWORD PTR [rip+0x52ff3c]        # 0x1408507c0
   140320884:	0f 28 c7             	movaps xmm0,xmm7
   140320887:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   14032088b:	f2 0f 5e 0d 65 71 38 	divsd  xmm1,QWORD PTR [rip+0x387165]        # 0x1406a79f8
   140320892:	00 
   140320893:	f2 0f 59 05 1d f8 52 	mulsd  xmm0,QWORD PTR [rip+0x52f81d]        # 0x1408500b8
   14032089a:	00 
   14032089b:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14032089f:	0f 28 c1             	movaps xmm0,xmm1
   1403208a2:	e8 15 05 30 00       	call   0x140620dbc
   1403208a7:	f2 0f 59 3d 79 f8 52 	mulsd  xmm7,QWORD PTR [rip+0x52f879]        # 0x140850128
   1403208ae:	00 
   1403208af:	0f 28 f0             	movaps xmm6,xmm0
   1403208b2:	f2 0f 10 0d b6 70 38 	movsd  xmm1,QWORD PTR [rip+0x3870b6]        # 0x1406a7970
   1403208b9:	00 
   1403208ba:	f2 0f 5c c7          	subsd  xmm0,xmm7
   1403208be:	e8 b7 04 30 00       	call   0x140620d7a
   1403208c3:	f2 0f 10 0d a5 70 38 	movsd  xmm1,QWORD PTR [rip+0x3870a5]        # 0x1406a7970
   1403208ca:	00 
   1403208cb:	f2 0f 58 fe          	addsd  xmm7,xmm6
   1403208cf:	44 0f 28 c0          	movaps xmm8,xmm0
   1403208d3:	0f 28 c7             	movaps xmm0,xmm7
   1403208d6:	e8 9f 04 30 00       	call   0x140620d7a
   1403208db:	f3 0f 10 54 24 34    	movss  xmm2,DWORD PTR [rsp+0x34]
   1403208e1:	f2 44 0f 5c c0       	subsd  xmm8,xmm0
   1403208e6:	f3 0f 10 2d 9e d8 36 	movss  xmm5,DWORD PTR [rip+0x36d89e]        # 0x14068e18c
   1403208ed:	00 
   1403208ee:	f2 0f 10 1d 82 f8 52 	movsd  xmm3,QWORD PTR [rip+0x52f882]        # 0x140850178
   1403208f5:	00 
   1403208f6:	f2 0f 10 25 aa f8 52 	movsd  xmm4,QWORD PTR [rip+0x52f8aa]        # 0x1408501a8
   1403208fd:	00 
   1403208fe:	4c 8b 5c 24 48       	mov    r11,QWORD PTR [rsp+0x48]
   140320903:	f3 0f 10 35 45 71 38 	movss  xmm6,DWORD PTR [rip+0x387145]        # 0x1406a7a50
   14032090a:	00 
   14032090b:	f3 0f 10 3d 79 83 37 	movss  xmm7,DWORD PTR [rip+0x378379]        # 0x140698c8c
   140320912:	00 
   140320913:	eb 12                	jmp    0x140320927
   140320915:	45 0f 57 d2          	xorps  xmm10,xmm10
   140320919:	45 0f 5a c3          	cvtps2pd xmm8,xmm11
   14032091d:	f3 45 0f 5a d7       	cvtss2sd xmm10,xmm15
   140320922:	f2 45 0f 5e c2       	divsd  xmm8,xmm10
   140320927:	0f 57 c9             	xorps  xmm1,xmm1
   14032092a:	41 b8 01 00 00 00    	mov    r8d,0x1
   140320930:	f3 0f 5a ca          	cvtss2sd xmm1,xmm2
   140320934:	b9 30 00 00 00       	mov    ecx,0x30
   140320939:	41 0f 28 c0          	movaps xmm0,xmm8
   14032093d:	f2 41 0f 5e ca       	divsd  xmm1,xmm10
   140320942:	f2 44 0f 10 15 dd f7 	movsd  xmm10,QWORD PTR [rip+0x52f7dd]        # 0x140850128
   140320949:	52 00 
   14032094b:	f2 41 0f 59 ca       	mulsd  xmm1,xmm10
   140320950:	f2 0f 5d cc          	minsd  xmm1,xmm4
   140320954:	f2 0f 5c c1          	subsd  xmm0,xmm1
   140320958:	f2 41 0f 58 c8       	addsd  xmm1,xmm8
   14032095d:	f2 41 0f 58 c2       	addsd  xmm0,xmm10
   140320962:	f2 41 0f 58 ca       	addsd  xmm1,xmm10
   140320967:	f2 0f 2c c0          	cvttsd2si eax,xmm0
   14032096b:	41 3b c0             	cmp    eax,r8d
   14032096e:	44 0f 4f c0          	cmovg  r8d,eax
   140320972:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140320976:	49 63 d0             	movsxd rdx,r8d
   140320979:	3b c1                	cmp    eax,ecx
   14032097b:	0f 4c c8             	cmovl  ecx,eax
   14032097e:	4c 63 d1             	movsxd r10,ecx
   140320981:	49 3b d2             	cmp    rdx,r10
   140320984:	0f 8f ec 01 00 00    	jg     0x140320b76
   14032098a:	4c 8b ca             	mov    r9,rdx
   14032098d:	4c 2b d2             	sub    r10,rdx
   140320990:	49 c1 e1 05          	shl    r9,0x5
   140320994:	49 83 c1 f8          	add    r9,0xfffffffffffffff8
   140320998:	4d 03 cd             	add    r9,r13
   14032099b:	49 ff c2             	inc    r10
   14032099e:	66 90                	xchg   ax,ax
   1403209a0:	41 83 79 f4 00       	cmp    DWORD PTR [r9-0xc],0x0
   1403209a5:	0f 8c ac 01 00 00    	jl     0x140320b57
   1403209ab:	41 80 bb 92 00 00 00 	cmp    BYTE PTR [r11+0x92],0x0
   1403209b2:	00 
   1403209b3:	75 0a                	jne    0x1403209bf
   1403209b5:	41 80 bb 93 00 00 00 	cmp    BYTE PTR [r11+0x93],0x0
   1403209bc:	00 
   1403209bd:	74 03                	je     0x1403209c2
   1403209bf:	0f 28 dc             	movaps xmm3,xmm4
   1403209c2:	45 0f 2f e1          	comiss xmm12,xmm9
   1403209c6:	66 41 0f 6e c0       	movd   xmm0,r8d
   1403209cb:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403209ce:	0f 28 c8             	movaps xmm1,xmm0
   1403209d1:	f3 41 0f 59 cf       	mulss  xmm1,xmm15
   1403209d6:	76 19                	jbe    0x1403209f1
   1403209d8:	f3 0f 59 c0          	mulss  xmm0,xmm0
   1403209dc:	f3 41 0f 5c c5       	subss  xmm0,xmm13
   1403209e1:	f3 41 0f 59 c4       	mulss  xmm0,xmm12
   1403209e6:	f3 41 0f 58 c5       	addss  xmm0,xmm13
   1403209eb:	f3 0f 59 c1          	mulss  xmm0,xmm1
   1403209ef:	eb 03                	jmp    0x1403209f4
   1403209f1:	0f 28 c1             	movaps xmm0,xmm1
   1403209f4:	f3 41 0f 10 11       	movss  xmm2,DWORD PTR [r9]
   1403209f9:	0f 57 e4             	xorps  xmm4,xmm4
   1403209fc:	49 69 d4 18 3c 00 00 	imul   rdx,r12,0x3c18
   140320a03:	48 69 c7 3c 01 00 00 	imul   rax,rdi,0x13c
   140320a0a:	f2 0f 5a e3          	cvtsd2ss xmm4,xmm3
   140320a0e:	48 03 c2             	add    rax,rdx
   140320a11:	f3 42 0f 10 8c 30 dc 	movss  xmm1,DWORD PTR [rax+r14*1+0xdc]
   140320a18:	00 00 00 
   140320a1b:	41 0f b6 83 91 00 00 	movzx  eax,BYTE PTR [r11+0x91]
   140320a22:	00 
   140320a23:	84 c0                	test   al,al
   140320a25:	74 05                	je     0x140320a2c
   140320a27:	0f 28 dd             	movaps xmm3,xmm5
   140320a2a:	eb 03                	jmp    0x140320a2f
   140320a2c:	0f 28 de             	movaps xmm3,xmm6
   140320a2f:	f3 0f 59 1d 2d 70 38 	mulss  xmm3,DWORD PTR [rip+0x38702d]        # 0x1406a7a64
   140320a36:	00 
   140320a37:	41 0f 2f db          	comiss xmm3,xmm11
   140320a3b:	76 6f                	jbe    0x140320aac
   140320a3d:	0f 2f ca             	comiss xmm1,xmm2
   140320a40:	72 3c                	jb     0x140320a7e
   140320a42:	f3 0f 5c ca          	subss  xmm1,xmm2
   140320a46:	f3 0f 5e cc          	divss  xmm1,xmm4
   140320a4a:	84 c0                	test   al,al
   140320a4c:	74 05                	je     0x140320a53
   140320a4e:	0f 28 dd             	movaps xmm3,xmm5
   140320a51:	eb 03                	jmp    0x140320a56
   140320a53:	0f 28 de             	movaps xmm3,xmm6
   140320a56:	41 0f 28 d3          	movaps xmm2,xmm11
   140320a5a:	f3 0f 5c d0          	subss  xmm2,xmm0
   140320a5e:	f3 0f 5e d3          	divss  xmm2,xmm3
   140320a62:	0f 2f d1             	comiss xmm2,xmm1
   140320a65:	77 03                	ja     0x140320a6a
   140320a67:	0f 28 ca             	movaps xmm1,xmm2
   140320a6a:	44 0f 2f e9          	comiss xmm13,xmm1
   140320a6e:	77 04                	ja     0x140320a74
   140320a70:	41 0f 28 cd          	movaps xmm1,xmm13
   140320a74:	41 0f 28 dd          	movaps xmm3,xmm13
   140320a78:	f3 0f 5c d9          	subss  xmm3,xmm1
   140320a7c:	eb 77                	jmp    0x140320af5
   140320a7e:	f3 0f 5c d1          	subss  xmm2,xmm1
   140320a82:	f3 0f 5e d4          	divss  xmm2,xmm4
   140320a86:	84 c0                	test   al,al
   140320a88:	74 11                	je     0x140320a9b
   140320a8a:	f3 41 0f 5c c3       	subss  xmm0,xmm11
   140320a8f:	0f 28 cd             	movaps xmm1,xmm5
   140320a92:	f3 0f 5e c1          	divss  xmm0,xmm1
   140320a96:	0f 2f c2             	comiss xmm0,xmm2
   140320a99:	eb 43                	jmp    0x140320ade
   140320a9b:	f3 41 0f 5c c3       	subss  xmm0,xmm11
   140320aa0:	0f 28 ce             	movaps xmm1,xmm6
   140320aa3:	f3 0f 5e c1          	divss  xmm0,xmm1
   140320aa7:	0f 2f c2             	comiss xmm0,xmm2
   140320aaa:	eb 32                	jmp    0x140320ade
   140320aac:	0f 2f ca             	comiss xmm1,xmm2
   140320aaf:	72 19                	jb     0x140320aca
   140320ab1:	f3 0f 5c ca          	subss  xmm1,xmm2
   140320ab5:	41 0f 28 d3          	movaps xmm2,xmm11
   140320ab9:	f3 0f 5c d0          	subss  xmm2,xmm0
   140320abd:	f3 0f 5e cc          	divss  xmm1,xmm4
   140320ac1:	f3 0f 5e d7          	divss  xmm2,xmm7
   140320ac5:	0f 2f ca             	comiss xmm1,xmm2
   140320ac8:	eb 9b                	jmp    0x140320a65
   140320aca:	f3 0f 5c d1          	subss  xmm2,xmm1
   140320ace:	f3 41 0f 5c c3       	subss  xmm0,xmm11
   140320ad3:	f3 0f 5e d4          	divss  xmm2,xmm4
   140320ad7:	f3 0f 5e c7          	divss  xmm0,xmm7
   140320adb:	0f 2f d0             	comiss xmm2,xmm0
   140320ade:	77 03                	ja     0x140320ae3
   140320ae0:	0f 28 d0             	movaps xmm2,xmm0
   140320ae3:	44 0f 2f ea          	comiss xmm13,xmm2
   140320ae7:	77 04                	ja     0x140320aed
   140320ae9:	41 0f 28 d5          	movaps xmm2,xmm13
   140320aed:	41 0f 28 dd          	movaps xmm3,xmm13
   140320af1:	f3 0f 5c da          	subss  xmm3,xmm2
   140320af5:	0f 28 c3             	movaps xmm0,xmm3
   140320af8:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   140320afd:	41 0f 2e c1          	ucomiss xmm0,xmm9
   140320b01:	7a 02                	jp     0x140320b05
   140320b03:	74 4a                	je     0x140320b4f
   140320b05:	83 fb 08             	cmp    ebx,0x8
   140320b08:	73 45                	jae    0x140320b4f
   140320b0a:	f3 42 0f 10 04 32    	movss  xmm0,DWORD PTR [rdx+r14*1]
   140320b10:	0f 2f 05 95 d6 36 00 	comiss xmm0,DWORD PTR [rip+0x36d695]        # 0x14068e1ac
   140320b17:	8b c3                	mov    eax,ebx
   140320b19:	48 8d 0c f8          	lea    rcx,[rax+rdi*8]
   140320b1d:	44 89 84 8d f0 09 00 	mov    DWORD PTR [rbp+rcx*4+0x9f0],r8d
   140320b24:	00 
   140320b25:	76 14                	jbe    0x140320b3b
   140320b27:	41 80 bd 8c 0d 00 00 	cmp    BYTE PTR [r13+0xd8c],0x2
   140320b2e:	02 
   140320b2f:	73 0a                	jae    0x140320b3b
   140320b31:	41 83 ff 02          	cmp    r15d,0x2
   140320b35:	7c 04                	jl     0x140320b3b
   140320b37:	41 0f 28 dd          	movaps xmm3,xmm13
   140320b3b:	f3 41 0f 59 de       	mulss  xmm3,xmm14
   140320b40:	ff c3                	inc    ebx
   140320b42:	89 5c bd 30          	mov    DWORD PTR [rbp+rdi*4+0x30],ebx
   140320b46:	f3 0f 11 9c 8d f0 03 	movss  DWORD PTR [rbp+rcx*4+0x3f0],xmm3
   140320b4d:	00 00 
   140320b4f:	f2 0f 10 25 51 f6 52 	movsd  xmm4,QWORD PTR [rip+0x52f651]        # 0x1408501a8
   140320b56:	00 
   140320b57:	f2 0f 10 1d 19 f6 52 	movsd  xmm3,QWORD PTR [rip+0x52f619]        # 0x140850178
   140320b5e:	00 
   140320b5f:	41 ff c0             	inc    r8d
   140320b62:	49 83 c1 20          	add    r9,0x20
   140320b66:	49 83 ea 01          	sub    r10,0x1
   140320b6a:	0f 85 30 fe ff ff    	jne    0x1403209a0
   140320b70:	f3 0f 10 54 24 34    	movss  xmm2,DWORD PTR [rsp+0x34]
   140320b76:	f3 0f 10 4c 24 40    	movss  xmm1,DWORD PTR [rsp+0x40]
   140320b7c:	ff c6                	inc    esi
   140320b7e:	f2 0f 10 1d f2 f5 52 	movsd  xmm3,QWORD PTR [rip+0x52f5f2]        # 0x140850178
   140320b85:	00 
   140320b86:	41 ba 00 00 00 00    	mov    r10d,0x0
   140320b8c:	8b c6                	mov    eax,esi
   140320b8e:	83 fe 30             	cmp    esi,0x30
   140320b91:	0f 86 4a fc ff ff    	jbe    0x1403207e1
   140320b97:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   140320b9c:	45 8d 62 30          	lea    r12d,[r10+0x30]
   140320ba0:	45 33 ff             	xor    r15d,r15d
   140320ba3:	33 f6                	xor    esi,esi
   140320ba5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   140320bac:	00 00 00 00 
   140320bb0:	8b 44 35 30          	mov    eax,DWORD PTR [rbp+rsi*1+0x30]
   140320bb4:	41 0f 28 f1          	movaps xmm6,xmm9
   140320bb8:	85 c0                	test   eax,eax
   140320bba:	0f 84 86 00 00 00    	je     0x140320c46
   140320bc0:	f2 0f 10 3d b8 d5 36 	movsd  xmm7,QWORD PTR [rip+0x36d5b8]        # 0x14068e180
   140320bc7:	00 
   140320bc8:	49 8b df             	mov    rbx,r15
   140320bcb:	f3 44 0f 10 05 dc d5 	movss  xmm8,DWORD PTR [rip+0x36d5dc]        # 0x14068e1b0
   140320bd2:	36 00 
   140320bd4:	8b f8                	mov    edi,eax
   140320bd6:	f2 44 0f 10 15 51 d5 	movsd  xmm10,QWORD PTR [rip+0x36d551]        # 0x14068e130
   140320bdd:	36 00 
   140320bdf:	90                   	nop
   140320be0:	8b 84 1d f0 09 00 00 	mov    eax,DWORD PTR [rbp+rbx*1+0x9f0]
   140320be7:	ff c8                	dec    eax
   140320be9:	8b c8                	mov    ecx,eax
   140320beb:	48 c1 e0 05          	shl    rax,0x5
   140320bef:	f3 0f 10 84 8d b0 01 	movss  xmm0,DWORD PTR [rbp+rcx*4+0x1b0]
   140320bf6:	00 00 
   140320bf8:	f3 42 0f 10 4c 28 14 	movss  xmm1,DWORD PTR [rax+r13*1+0x14]
   140320bff:	0f 2f c1             	comiss xmm0,xmm1
   140320c02:	77 03                	ja     0x140320c07
   140320c04:	0f 28 c1             	movaps xmm0,xmm1
   140320c07:	f3 0f 59 84 1d f0 03 	mulss  xmm0,DWORD PTR [rbp+rbx*1+0x3f0]
   140320c0e:	00 00 
   140320c10:	44 0f 2f c8          	comiss xmm9,xmm0
   140320c14:	72 06                	jb     0x140320c1c
   140320c16:	41 0f 28 c9          	movaps xmm1,xmm9
   140320c1a:	eb 1c                	jmp    0x140320c38
   140320c1c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140320c1f:	41 0f 28 ca          	movaps xmm1,xmm10
   140320c23:	f2 0f 5e c7          	divsd  xmm0,xmm7
   140320c27:	e8 4e 01 30 00       	call   0x140620d7a
   140320c2c:	0f 57 c9             	xorps  xmm1,xmm1
   140320c2f:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140320c33:	f3 41 0f 59 c8       	mulss  xmm1,xmm8
   140320c38:	48 83 c3 04          	add    rbx,0x4
   140320c3c:	f3 0f 58 f1          	addss  xmm6,xmm1
   140320c40:	48 83 ef 01          	sub    rdi,0x1
   140320c44:	75 9a                	jne    0x140320be0
   140320c46:	f3 0f 10 44 34 70    	movss  xmm0,DWORD PTR [rsp+rsi*1+0x70]
   140320c4c:	44 0f 2f c8          	comiss xmm9,xmm0
   140320c50:	f2 44 0f 10 3d 27 d5 	movsd  xmm15,QWORD PTR [rip+0x36d527]        # 0x14068e180
   140320c57:	36 00 
   140320c59:	f2 44 0f 10 05 ce d4 	movsd  xmm8,QWORD PTR [rip+0x36d4ce]        # 0x14068e130
   140320c60:	36 00 
   140320c62:	72 0f                	jb     0x140320c73
   140320c64:	f3 44 0f 10 35 43 d5 	movss  xmm14,DWORD PTR [rip+0x36d543]        # 0x14068e1b0
   140320c6b:	36 00 
   140320c6d:	41 0f 28 c1          	movaps xmm0,xmm9
   140320c71:	eb 23                	jmp    0x140320c96
   140320c73:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140320c76:	41 0f 28 c8          	movaps xmm1,xmm8
   140320c7a:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320c7f:	e8 f6 00 30 00       	call   0x140620d7a
   140320c84:	f3 44 0f 10 35 23 d5 	movss  xmm14,DWORD PTR [rip+0x36d523]        # 0x14068e1b0
   140320c8b:	36 00 
   140320c8d:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140320c91:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   140320c96:	f2 0f 10 3d 82 d4 36 	movsd  xmm7,QWORD PTR [rip+0x36d482]        # 0x14068e120
   140320c9d:	00 
   140320c9e:	f3 0f 58 c6          	addss  xmm0,xmm6
   140320ca2:	44 0f 2f c8          	comiss xmm9,xmm0
   140320ca6:	72 06                	jb     0x140320cae
   140320ca8:	41 0f 28 c9          	movaps xmm1,xmm9
   140320cac:	eb 1d                	jmp    0x140320ccb
   140320cae:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140320cb2:	0f 28 cf             	movaps xmm1,xmm7
   140320cb5:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320cba:	e8 bb 00 30 00       	call   0x140620d7a
   140320cbf:	0f 57 c9             	xorps  xmm1,xmm1
   140320cc2:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140320cc6:	f3 41 0f 59 ce       	mulss  xmm1,xmm14
   140320ccb:	44 0f 2f ce          	comiss xmm9,xmm6
   140320ccf:	f3 0f 11 4c 34 70    	movss  DWORD PTR [rsp+rsi*1+0x70],xmm1
   140320cd5:	72 06                	jb     0x140320cdd
   140320cd7:	41 0f 28 c1          	movaps xmm0,xmm9
   140320cdb:	eb 1d                	jmp    0x140320cfa
   140320cdd:	0f 57 c0             	xorps  xmm0,xmm0
   140320ce0:	0f 28 cf             	movaps xmm1,xmm7
   140320ce3:	f3 0f 5a c6          	cvtss2sd xmm0,xmm6
   140320ce7:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320cec:	e8 89 00 30 00       	call   0x140620d7a
   140320cf1:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140320cf5:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   140320cfa:	f3 0f 11 84 35 30 03 	movss  DWORD PTR [rbp+rsi*1+0x330],xmm0
   140320d01:	00 00 
   140320d03:	49 83 c7 20          	add    r15,0x20
   140320d07:	48 83 c6 04          	add    rsi,0x4
   140320d0b:	49 83 ec 01          	sub    r12,0x1
   140320d0f:	0f 85 9b fe ff ff    	jne    0x140320bb0
   140320d15:	bb 30 00 00 00       	mov    ebx,0x30
   140320d1a:	8b c3                	mov    eax,ebx
   140320d1c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140320d20:	f3 0f 10 44 84 6c    	movss  xmm0,DWORD PTR [rsp+rax*4+0x6c]
   140320d26:	48 ff c8             	dec    rax
   140320d29:	8b cb                	mov    ecx,ebx
   140320d2b:	ff cb                	dec    ebx
   140320d2d:	41 0f 2f c1          	comiss xmm0,xmm9
   140320d31:	77 07                	ja     0x140320d3a
   140320d33:	48 85 c0             	test   rax,rax
   140320d36:	75 e8                	jne    0x140320d20
   140320d38:	eb 02                	jmp    0x140320d3c
   140320d3a:	8b d9                	mov    ebx,ecx
   140320d3c:	83 fb 30             	cmp    ebx,0x30
   140320d3f:	7d 23                	jge    0x140320d64
   140320d41:	b8 30 00 00 00       	mov    eax,0x30
   140320d46:	48 8d 8d 70 02 00 00 	lea    rcx,[rbp+0x270]
   140320d4d:	2b c3                	sub    eax,ebx
   140320d4f:	33 d2                	xor    edx,edx
   140320d51:	4c 63 c0             	movsxd r8,eax
   140320d54:	48 63 c3             	movsxd rax,ebx
   140320d57:	49 c1 e0 02          	shl    r8,0x2
   140320d5b:	48 8d 0c 81          	lea    rcx,[rcx+rax*4]
   140320d5f:	e8 86 ff 2f 00       	call   0x140620cea
   140320d64:	85 db                	test   ebx,ebx
   140320d66:	74 2f                	je     0x140320d97
   140320d68:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   140320d6d:	4c 8d 85 70 02 00 00 	lea    r8,[rbp+0x270]
   140320d74:	48 8b 4c 24 48       	mov    rcx,QWORD PTR [rsp+0x48]
   140320d79:	48 8d 54 24 70       	lea    rdx,[rsp+0x70]
   140320d7e:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   140320d83:	44 8b cb             	mov    r9d,ebx
   140320d86:	f3 41 0f 10 04 06    	movss  xmm0,DWORD PTR [r14+rax*1]
   140320d8c:	f3 0f 11 44 24 20    	movss  DWORD PTR [rsp+0x20],xmm0
   140320d92:	e8 89 9c ff ff       	call   0x14031aa20
   140320d97:	45 33 ff             	xor    r15d,r15d
   140320d9a:	45 33 e4             	xor    r12d,r12d
   140320d9d:	41 bd 30 00 00 00    	mov    r13d,0x30
   140320da3:	45 33 f6             	xor    r14d,r14d
   140320da6:	4c 89 6c 24 40       	mov    QWORD PTR [rsp+0x40],r13
   140320dab:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140320db0:	46 8b 44 35 30       	mov    r8d,DWORD PTR [rbp+r14*1+0x30]
   140320db5:	45 85 c0             	test   r8d,r8d
   140320db8:	0f 84 f7 01 00 00    	je     0x140320fb5
   140320dbe:	45 33 c9             	xor    r9d,r9d
   140320dc1:	41 0f 28 f9          	movaps xmm7,xmm9
   140320dc5:	41 83 f8 04          	cmp    r8d,0x4
   140320dc9:	72 42                	jb     0x140320e0d
   140320dcb:	48 8d 8d f4 03 00 00 	lea    rcx,[rbp+0x3f4]
   140320dd2:	41 8d 40 fc          	lea    eax,[r8-0x4]
   140320dd6:	49 03 cf             	add    rcx,r15
   140320dd9:	c1 e8 02             	shr    eax,0x2
   140320ddc:	ff c0                	inc    eax
   140320dde:	8b d0                	mov    edx,eax
   140320de0:	44 8d 0c 85 00 00 00 	lea    r9d,[rax*4+0x0]
   140320de7:	00 
   140320de8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140320def:	00 
   140320df0:	f3 0f 58 79 fc       	addss  xmm7,DWORD PTR [rcx-0x4]
   140320df5:	f3 0f 58 39          	addss  xmm7,DWORD PTR [rcx]
   140320df9:	f3 0f 58 79 04       	addss  xmm7,DWORD PTR [rcx+0x4]
   140320dfe:	f3 0f 58 79 08       	addss  xmm7,DWORD PTR [rcx+0x8]
   140320e03:	48 83 c1 10          	add    rcx,0x10
   140320e07:	48 83 ea 01          	sub    rdx,0x1
   140320e0b:	75 e3                	jne    0x140320df0
   140320e0d:	45 3b c8             	cmp    r9d,r8d
   140320e10:	73 25                	jae    0x140320e37
   140320e12:	41 8b c9             	mov    ecx,r9d
   140320e15:	48 8d 95 f0 03 00 00 	lea    rdx,[rbp+0x3f0]
   140320e1c:	49 03 cc             	add    rcx,r12
   140320e1f:	48 8d 14 8a          	lea    rdx,[rdx+rcx*4]
   140320e23:	41 8b c8             	mov    ecx,r8d
   140320e26:	41 2b c9             	sub    ecx,r9d
   140320e29:	f3 0f 58 3a          	addss  xmm7,DWORD PTR [rdx]
   140320e2d:	48 83 c2 04          	add    rdx,0x4
   140320e31:	48 83 e9 01          	sub    rcx,0x1
   140320e35:	75 f2                	jne    0x140320e29
   140320e37:	45 85 c0             	test   r8d,r8d
   140320e3a:	0f 84 75 01 00 00    	je     0x140320fb5
   140320e40:	f3 46 0f 10 94 35 30 	movss  xmm10,DWORD PTR [rbp+r14*1+0x330]
   140320e47:	03 00 00 
   140320e4a:	49 8b ff             	mov    rdi,r15
   140320e4d:	f3 46 0f 10 5c 34 70 	movss  xmm11,DWORD PTR [rsp+r14*1+0x70]
   140320e54:	49 8b f0             	mov    rsi,r8
   140320e57:	f3 46 0f 10 a4 35 70 	movss  xmm12,DWORD PTR [rbp+r14*1+0x270]
   140320e5e:	02 00 00 
   140320e61:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   140320e66:	45 0f 2f ca          	comiss xmm9,xmm10
   140320e6a:	72 06                	jb     0x140320e72
   140320e6c:	41 0f 28 f1          	movaps xmm6,xmm9
   140320e70:	eb 22                	jmp    0x140320e94
   140320e72:	0f 57 c0             	xorps  xmm0,xmm0
   140320e75:	41 0f 28 c8          	movaps xmm1,xmm8
   140320e79:	f3 41 0f 5a c2       	cvtss2sd xmm0,xmm10
   140320e7e:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320e83:	e8 f2 fe 2f 00       	call   0x140620d7a
   140320e88:	0f 57 f6             	xorps  xmm6,xmm6
   140320e8b:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   140320e8f:	f3 41 0f 59 f6       	mulss  xmm6,xmm14
   140320e94:	45 0f 2f cb          	comiss xmm9,xmm11
   140320e98:	72 06                	jb     0x140320ea0
   140320e9a:	45 0f 28 c1          	movaps xmm8,xmm9
   140320e9e:	eb 24                	jmp    0x140320ec4
   140320ea0:	0f 57 c0             	xorps  xmm0,xmm0
   140320ea3:	41 0f 28 c8          	movaps xmm1,xmm8
   140320ea7:	f3 41 0f 5a c3       	cvtss2sd xmm0,xmm11
   140320eac:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320eb1:	e8 c4 fe 2f 00       	call   0x140620d7a
   140320eb6:	45 0f 57 c0          	xorps  xmm8,xmm8
   140320eba:	f2 44 0f 5a c0       	cvtsd2ss xmm8,xmm0
   140320ebf:	f3 45 0f 59 c6       	mulss  xmm8,xmm14
   140320ec4:	45 0f 2f cc          	comiss xmm9,xmm12
   140320ec8:	72 06                	jb     0x140320ed0
   140320eca:	41 0f 28 c1          	movaps xmm0,xmm9
   140320ece:	eb 23                	jmp    0x140320ef3
   140320ed0:	f2 0f 10 0d 58 d2 36 	movsd  xmm1,QWORD PTR [rip+0x36d258]        # 0x14068e130
   140320ed7:	00 
   140320ed8:	0f 57 c0             	xorps  xmm0,xmm0
   140320edb:	f3 41 0f 5a c4       	cvtss2sd xmm0,xmm12
   140320ee0:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320ee5:	e8 90 fe 2f 00       	call   0x140620d7a
   140320eea:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140320eee:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   140320ef3:	8b 84 3d f0 09 00 00 	mov    eax,DWORD PTR [rbp+rdi*1+0x9f0]
   140320efa:	f3 44 0f 5c c0       	subss  xmm8,xmm0
   140320eff:	ff c8                	dec    eax
   140320f01:	8b d8                	mov    ebx,eax
   140320f03:	48 c1 e0 05          	shl    rax,0x5
   140320f07:	f3 41 0f 5c f0       	subss  xmm6,xmm8
   140320f0c:	f2 44 0f 10 05 1b d2 	movsd  xmm8,QWORD PTR [rip+0x36d21b]        # 0x14068e130
   140320f13:	36 00 
   140320f15:	f3 42 0f 10 44 28 14 	movss  xmm0,DWORD PTR [rax+r13*1+0x14]
   140320f1c:	44 0f 2f c8          	comiss xmm9,xmm0
   140320f20:	f3 41 0f 5f f1       	maxss  xmm6,xmm9
   140320f25:	72 06                	jb     0x140320f2d
   140320f27:	41 0f 28 c1          	movaps xmm0,xmm9
   140320f2b:	eb 1a                	jmp    0x140320f47
   140320f2d:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140320f30:	41 0f 28 c8          	movaps xmm1,xmm8
   140320f34:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320f39:	e8 3c fe 2f 00       	call   0x140620d7a
   140320f3e:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140320f42:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   140320f47:	f3 0f 59 b4 3d f0 03 	mulss  xmm6,DWORD PTR [rbp+rdi*1+0x3f0]
   140320f4e:	00 00 
   140320f50:	f3 0f 5e f7          	divss  xmm6,xmm7
   140320f54:	f3 0f 5c c6          	subss  xmm0,xmm6
   140320f58:	44 0f 2f c8          	comiss xmm9,xmm0
   140320f5c:	72 06                	jb     0x140320f64
   140320f5e:	41 0f 28 c1          	movaps xmm0,xmm9
   140320f62:	eb 1f                	jmp    0x140320f83
   140320f64:	f2 0f 10 0d b4 d1 36 	movsd  xmm1,QWORD PTR [rip+0x36d1b4]        # 0x14068e120
   140320f6b:	00 
   140320f6c:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140320f70:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140320f75:	e8 00 fe 2f 00       	call   0x140620d7a
   140320f7a:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140320f7e:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   140320f83:	f3 0f 10 8c 9d f0 00 	movss  xmm1,DWORD PTR [rbp+rbx*4+0xf0]
   140320f8a:	00 00 
   140320f8c:	f3 41 0f 5f c1       	maxss  xmm0,xmm9
   140320f91:	0f 2f c8             	comiss xmm1,xmm0
   140320f94:	77 03                	ja     0x140320f99
   140320f96:	0f 28 c1             	movaps xmm0,xmm1
   140320f99:	48 83 c7 04          	add    rdi,0x4
   140320f9d:	f3 0f 11 84 9d f0 00 	movss  DWORD PTR [rbp+rbx*4+0xf0],xmm0
   140320fa4:	00 00 
   140320fa6:	48 83 ee 01          	sub    rsi,0x1
   140320faa:	0f 85 b6 fe ff ff    	jne    0x140320e66
   140320fb0:	4c 8b 6c 24 40       	mov    r13,QWORD PTR [rsp+0x40]
   140320fb5:	49 83 c4 08          	add    r12,0x8
   140320fb9:	49 83 c6 04          	add    r14,0x4
   140320fbd:	49 83 c7 20          	add    r15,0x20
   140320fc1:	49 83 ed 01          	sub    r13,0x1
   140320fc5:	4c 89 6c 24 40       	mov    QWORD PTR [rsp+0x40],r13
   140320fca:	0f 85 e0 fd ff ff    	jne    0x140320db0
   140320fd0:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   140320fd5:	bf 01 00 00 00       	mov    edi,0x1
   140320fda:	41 0f 28 f1          	movaps xmm6,xmm9
   140320fde:	8b c7                	mov    eax,edi
   140320fe0:	f3 45 0f 10 45 00    	movss  xmm8,DWORD PTR [r13+0x0]
   140320fe6:	f3 41 0f 10 7d 04    	movss  xmm7,DWORD PTR [r13+0x4]
   140320fec:	4c 8d 2d bd 9f 8f 14 	lea    r13,[rip+0x148f9fbd]        # 0x154c1afb0
   140320ff3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140320ff7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140320ffe:	00 00 
   140321000:	83 f8 02             	cmp    eax,0x2
   140321003:	b9 02 00 00 00       	mov    ecx,0x2
   140321008:	0f 57 c0             	xorps  xmm0,xmm0
   14032100b:	41 0f 28 c8          	movaps xmm1,xmm8
   14032100f:	0f 47 c1             	cmova  eax,ecx
   140321012:	41 0f 2f f9          	comiss xmm7,xmm9
   140321016:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14032101b:	f3 0f 59 c8          	mulss  xmm1,xmm0
   14032101f:	76 18                	jbe    0x140321039
   140321021:	f3 0f 59 c0          	mulss  xmm0,xmm0
   140321025:	f3 41 0f 5c c5       	subss  xmm0,xmm13
   14032102a:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14032102e:	f3 41 0f 58 c5       	addss  xmm0,xmm13
   140321033:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140321037:	eb 03                	jmp    0x14032103c
   140321039:	0f 28 c1             	movaps xmm0,xmm1
   14032103c:	8d 47 ff             	lea    eax,[rdi-0x1]
   14032103f:	f3 0f 2c d8          	cvttss2si ebx,xmm0
   140321043:	8b c8                	mov    ecx,eax
   140321045:	f3 0f 10 84 85 f0 00 	movss  xmm0,DWORD PTR [rbp+rax*4+0xf0]
   14032104c:	00 00 
   14032104e:	44 0f 2f c8          	comiss xmm9,xmm0
   140321052:	72 06                	jb     0x14032105a
   140321054:	41 0f 28 c1          	movaps xmm0,xmm9
   140321058:	eb 1e                	jmp    0x140321078
   14032105a:	f2 0f 10 0d ce d0 36 	movsd  xmm1,QWORD PTR [rip+0x36d0ce]        # 0x14068e130
   140321061:	00 
   140321062:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140321065:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   14032106a:	e8 0b fd 2f 00       	call   0x140620d7a
   14032106f:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140321073:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   140321078:	81 fb 97 3a 00 00    	cmp    ebx,0x3a97
   14032107e:	7d 0c                	jge    0x14032108c
   140321080:	83 fb 14             	cmp    ebx,0x14
   140321083:	7f 0c                	jg     0x140321091
   140321085:	bb 14 00 00 00       	mov    ebx,0x14
   14032108a:	eb 05                	jmp    0x140321091
   14032108c:	bb 97 3a 00 00       	mov    ebx,0x3a97
   140321091:	48 63 c3             	movsxd rax,ebx
   140321094:	f3 41 0f 59 44 85 00 	mulss  xmm0,DWORD PTR [r13+rax*4+0x0]
   14032109b:	44 0f 2f c8          	comiss xmm9,xmm0
   14032109f:	72 06                	jb     0x1403210a7
   1403210a1:	41 0f 28 c9          	movaps xmm1,xmm9
   1403210a5:	eb 22                	jmp    0x1403210c9
   1403210a7:	f2 0f 10 0d 71 d0 36 	movsd  xmm1,QWORD PTR [rip+0x36d071]        # 0x14068e120
   1403210ae:	00 
   1403210af:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   1403210b3:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   1403210b8:	e8 bd fc 2f 00       	call   0x140620d7a
   1403210bd:	0f 57 c9             	xorps  xmm1,xmm1
   1403210c0:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   1403210c4:	f3 41 0f 59 ce       	mulss  xmm1,xmm14
   1403210c9:	ff c7                	inc    edi
   1403210cb:	0f 57 c0             	xorps  xmm0,xmm0
   1403210ce:	8b c7                	mov    eax,edi
   1403210d0:	f3 0f 5a c6          	cvtss2sd xmm0,xmm6
   1403210d4:	0f 57 f6             	xorps  xmm6,xmm6
   1403210d7:	f3 0f 5a c9          	cvtss2sd xmm1,xmm1
   1403210db:	f2 0f 58 c8          	addsd  xmm1,xmm0
   1403210df:	f2 0f 5a f1          	cvtsd2ss xmm6,xmm1
   1403210e3:	83 ff 30             	cmp    edi,0x30
   1403210e6:	0f 86 14 ff ff ff    	jbe    0x140321000
   1403210ec:	f3 0f 5d 74 24 38    	minss  xmm6,DWORD PTR [rsp+0x38]
   1403210f2:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   1403210f7:	41 0f 2e f1          	ucomiss xmm6,xmm9
   1403210fb:	f3 0f 11 74 24 38    	movss  DWORD PTR [rsp+0x38],xmm6
   140321101:	0f 28 d6             	movaps xmm2,xmm6
   140321104:	7a 06                	jp     0x14032110c
   140321106:	0f 84 ff 00 00 00    	je     0x14032120b
   14032110c:	0f b7 8d 00 11 00 00 	movzx  ecx,WORD PTR [rbp+0x1100]
   140321113:	4d 8d 45 14          	lea    r8,[r13+0x14]
   140321117:	0f b7 44 24 30       	movzx  eax,WORD PTR [rsp+0x30]
   14032111c:	45 33 d2             	xor    r10d,r10d
   14032111f:	4c 8b 4c 24 50       	mov    r9,QWORD PTR [rsp+0x50]
   140321124:	45 0f 57 c0          	xorps  xmm8,xmm8
   140321128:	4c 8b 5c 24 48       	mov    r11,QWORD PTR [rsp+0x48]
   14032112d:	f2 0f 10 25 73 f0 52 	movsd  xmm4,QWORD PTR [rip+0x52f073]        # 0x1408501a8
   140321134:	00 
   140321135:	f2 0f 10 1d 3b f0 52 	movsd  xmm3,QWORD PTR [rip+0x52f03b]        # 0x140850178
   14032113c:	00 
   14032113d:	f3 0f 10 3d 47 7b 37 	movss  xmm7,DWORD PTR [rip+0x377b47]        # 0x140698c8c
   140321144:	00 
   140321145:	f3 0f 10 35 03 69 38 	movss  xmm6,DWORD PTR [rip+0x386903]        # 0x1406a7a50
   14032114c:	00 
   14032114d:	f3 0f 10 2d 37 d0 36 	movss  xmm5,DWORD PTR [rip+0x36d037]        # 0x14068e18c
   140321154:	00 
   140321155:	66 ff c0             	inc    ax
   140321158:	66 89 44 24 30       	mov    WORD PTR [rsp+0x30],ax
   14032115d:	66 3b c1             	cmp    ax,cx
   140321160:	0f 82 7a f5 ff ff    	jb     0x1403206e0
   140321166:	0f 28 c2             	movaps xmm0,xmm2
   140321169:	44 0f 28 bc 24 00 11 	movaps xmm15,XMMWORD PTR [rsp+0x1100]
   140321170:	00 00 
   140321172:	44 0f 28 b4 24 10 11 	movaps xmm14,XMMWORD PTR [rsp+0x1110]
   140321179:	00 00 
   14032117b:	44 0f 28 ac 24 20 11 	movaps xmm13,XMMWORD PTR [rsp+0x1120]
   140321182:	00 00 
   140321184:	44 0f 28 a4 24 30 11 	movaps xmm12,XMMWORD PTR [rsp+0x1130]
   14032118b:	00 00 
   14032118d:	44 0f 28 9c 24 40 11 	movaps xmm11,XMMWORD PTR [rsp+0x1140]
   140321194:	00 00 
   140321196:	44 0f 28 94 24 50 11 	movaps xmm10,XMMWORD PTR [rsp+0x1150]
   14032119d:	00 00 
   14032119f:	44 0f 28 84 24 70 11 	movaps xmm8,XMMWORD PTR [rsp+0x1170]
   1403211a6:	00 00 
   1403211a8:	0f 28 bc 24 80 11 00 	movaps xmm7,XMMWORD PTR [rsp+0x1180]
   1403211af:	00 
   1403211b0:	0f 28 b4 24 90 11 00 	movaps xmm6,XMMWORD PTR [rsp+0x1190]
   1403211b7:	00 
   1403211b8:	4c 8b bc 24 a0 11 00 	mov    r15,QWORD PTR [rsp+0x11a0]
   1403211bf:	00 
   1403211c0:	4c 8b b4 24 a8 11 00 	mov    r14,QWORD PTR [rsp+0x11a8]
   1403211c7:	00 
   1403211c8:	4c 8b a4 24 b0 11 00 	mov    r12,QWORD PTR [rsp+0x11b0]
   1403211cf:	00 
   1403211d0:	48 8b bc 24 b8 11 00 	mov    rdi,QWORD PTR [rsp+0x11b8]
   1403211d7:	00 
   1403211d8:	48 8b b4 24 c0 11 00 	mov    rsi,QWORD PTR [rsp+0x11c0]
   1403211df:	00 
   1403211e0:	48 8b 9c 24 e8 11 00 	mov    rbx,QWORD PTR [rsp+0x11e8]
   1403211e7:	00 
   1403211e8:	48 8b 8d f0 0f 00 00 	mov    rcx,QWORD PTR [rbp+0xff0]
   1403211ef:	48 33 cc             	xor    rcx,rsp
   1403211f2:	e8 09 a4 2f 00       	call   0x14061b600
   1403211f7:	44 0f 28 8c 24 60 11 	movaps xmm9,XMMWORD PTR [rsp+0x1160]
   1403211fe:	00 00 
   140321200:	48 81 c4 c8 11 00 00 	add    rsp,0x11c8
   140321207:	41 5d                	pop    r13
   140321209:	5d                   	pop    rbp
   14032120a:	c3                   	ret
   14032120b:	41 0f 28 c1          	movaps xmm0,xmm9
   14032120f:	e9 55 ff ff ff       	jmp    0x140321169
   140321214:	cc                   	int3
   140321215:	cc                   	int3
   140321216:	cc                   	int3
   140321217:	cc                   	int3
   140321218:	cc                   	int3
   140321219:	cc                   	int3
   14032121a:	cc                   	int3
   14032121b:	cc                   	int3
   14032121c:	cc                   	int3
   14032121d:	cc                   	int3
   14032121e:	cc                   	int3
   14032121f:	cc                   	int3
