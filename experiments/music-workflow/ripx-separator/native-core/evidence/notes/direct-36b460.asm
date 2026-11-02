
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014036b460 <.text+0x36a460>:
   14036b460:	48 83 ec 38          	sub    rsp,0x38
   14036b464:	8b 44 24 68          	mov    eax,DWORD PTR [rsp+0x68]
   14036b468:	85 c0                	test   eax,eax
   14036b46a:	79 0a                	jns    0x14036b476
   14036b46c:	8b 05 3e ed 61 00    	mov    eax,DWORD PTR [rip+0x61ed3e]        # 0x14098a1b0
   14036b472:	85 c0                	test   eax,eax
   14036b474:	78 4f                	js     0x14036b4c5
   14036b476:	3b 05 54 59 64 14    	cmp    eax,DWORD PTR [rip+0x14645954]        # 0x1549b0dd0
   14036b47c:	7d 47                	jge    0x14036b4c5
   14036b47e:	89 44 24 28          	mov    DWORD PTR [rsp+0x28],eax
   14036b482:	0f b6 44 24 60       	movzx  eax,BYTE PTR [rsp+0x60]
   14036b487:	88 44 24 20          	mov    BYTE PTR [rsp+0x20],al
   14036b48b:	e8 a0 f8 ff ff       	call   0x14036ad30
   14036b490:	0f 57 c9             	xorps  xmm1,xmm1
   14036b493:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   14036b497:	f2 0f 10 05 09 4d 4e 	movsd  xmm0,QWORD PTR [rip+0x4e4d09]        # 0x1408501a8
   14036b49e:	00 
   14036b49f:	f2 0f 5c 0d 91 2c 32 	subsd  xmm1,QWORD PTR [rip+0x322c91]        # 0x14068e138
   14036b4a6:	00 
   14036b4a7:	f2 0f 5e 0d 91 2c 32 	divsd  xmm1,QWORD PTR [rip+0x322c91]        # 0x14068e140
   14036b4ae:	00 
   14036b4af:	e8 c6 58 2b 00       	call   0x140620d7a
   14036b4b4:	f2 0f 59 05 ec 32 34 	mulsd  xmm0,QWORD PTR [rip+0x3432ec]        # 0x1406ae7a8
   14036b4bb:	00 
   14036b4bc:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14036b4c0:	48 83 c4 38          	add    rsp,0x38
   14036b4c4:	c3                   	ret
   14036b4c5:	0f 57 c0             	xorps  xmm0,xmm0
   14036b4c8:	48 83 c4 38          	add    rsp,0x38
   14036b4cc:	c3                   	ret
   14036b4cd:	cc                   	int3
   14036b4ce:	cc                   	int3
   14036b4cf:	cc                   	int3
   14036b4d0:	cc                   	int3
   14036b4d1:	cc                   	int3
   14036b4d2:	cc                   	int3
   14036b4d3:	cc                   	int3
   14036b4d4:	cc                   	int3
   14036b4d5:	cc                   	int3
   14036b4d6:	cc                   	int3
   14036b4d7:	cc                   	int3
   14036b4d8:	cc                   	int3
   14036b4d9:	cc                   	int3
   14036b4da:	cc                   	int3
   14036b4db:	cc                   	int3
   14036b4dc:	cc                   	int3
   14036b4dd:	cc                   	int3
   14036b4de:	cc                   	int3
   14036b4df:	cc                   	int3
   14036b4e0:	40 55                	rex push rbp
   14036b4e2:	57                   	push   rdi
   14036b4e3:	41 56                	push   r14
   14036b4e5:	48 83 ec 10          	sub    rsp,0x10
   14036b4e9:	8b 01                	mov    eax,DWORD PTR [rcx]
   14036b4eb:	49 8b e9             	mov    rbp,r9
   14036b4ee:	4c 8b f1             	mov    r14,rcx
   14036b4f1:	85 d2                	test   edx,edx
   14036b4f3:	79 02                	jns    0x14036b4f7
   14036b4f5:	8b d0                	mov    edx,eax
   14036b4f7:	45 85 c0             	test   r8d,r8d
   14036b4fa:	79 09                	jns    0x14036b505
   14036b4fc:	44 8b 41 04          	mov    r8d,DWORD PTR [rcx+0x4]
   14036b500:	41 8b f8             	mov    edi,r8d
   14036b503:	eb 03                	jmp    0x14036b508
   14036b505:	8b 79 04             	mov    edi,DWORD PTR [rcx+0x4]
   14036b508:	3b d0                	cmp    edx,eax
   14036b50a:	7d 02                	jge    0x14036b50e
   14036b50c:	8b d0                	mov    edx,eax
   14036b50e:	41 3b f8             	cmp    edi,r8d
   14036b511:	0f 57 e4             	xorps  xmm4,xmm4
   14036b514:	0f 57 db             	xorps  xmm3,xmm3
   14036b517:	44 0f 4c c7          	cmovl  r8d,edi
   14036b51b:	2b f8                	sub    edi,eax
   14036b51d:	44 3b c2             	cmp    r8d,edx
   14036b520:	0f 8e 93 01 00 00    	jle    0x14036b6b9
   14036b526:	f3 0f 10 54 24 50    	movss  xmm2,DWORD PTR [rsp+0x50]
   14036b52c:	0f 2e d4             	ucomiss xmm2,xmm4
   14036b52f:	48 89 5c 24 30       	mov    QWORD PTR [rsp+0x30],rbx
   14036b534:	4c 89 6c 24 08       	mov    QWORD PTR [rsp+0x8],r13
   14036b539:	7a 19                	jp     0x14036b554
   14036b53b:	75 17                	jne    0x14036b554
   14036b53d:	48 8b 41 18          	mov    rax,QWORD PTR [rcx+0x18]
   14036b541:	48 85 c0             	test   rax,rax
   14036b544:	75 0a                	jne    0x14036b550
   14036b546:	f3 0f 10 91 7c 02 00 	movss  xmm2,DWORD PTR [rcx+0x27c]
   14036b54d:	00 
   14036b54e:	eb 04                	jmp    0x14036b554
   14036b550:	f3 0f 10 10          	movss  xmm2,DWORD PTR [rax]
   14036b554:	f3 0f 10 05 80 4a 4e 	movss  xmm0,DWORD PTR [rip+0x4e4a80]        # 0x14084ffdc
   14036b55b:	00 
   14036b55c:	44 2b c2             	sub    r8d,edx
   14036b55f:	0f 28 c8             	movaps xmm1,xmm0
   14036b562:	45 03 c0             	add    r8d,r8d
   14036b565:	f3 0f 5e ca          	divss  xmm1,xmm2
   14036b569:	b8 56 55 55 55       	mov    eax,0x55555556
   14036b56e:	41 f7 e8             	imul   r8d
   14036b571:	f3 0f 58 c8          	addss  xmm1,xmm0
   14036b575:	8b c2                	mov    eax,edx
   14036b577:	c1 e8 1f             	shr    eax,0x1f
   14036b57a:	f3 44 0f 2c e9       	cvttss2si r13d,xmm1
   14036b57f:	03 d0                	add    edx,eax
   14036b581:	44 3b ea             	cmp    r13d,edx
   14036b584:	7e 0d                	jle    0x14036b593
   14036b586:	41 bd 01 00 00 00    	mov    r13d,0x1
   14036b58c:	41 3b d5             	cmp    edx,r13d
   14036b58f:	44 0f 4f ea          	cmovg  r13d,edx
   14036b593:	33 db                	xor    ebx,ebx
   14036b595:	45 85 ed             	test   r13d,r13d
   14036b598:	0f 8e 16 01 00 00    	jle    0x14036b6b4
   14036b59e:	48 89 74 24 38       	mov    QWORD PTR [rsp+0x38],rsi
   14036b5a3:	4c 89 64 24 40       	mov    QWORD PTR [rsp+0x40],r12
   14036b5a8:	4c 89 3c 24          	mov    QWORD PTR [rsp],r15
   14036b5ac:	44 0f b6 79 60       	movzx  r15d,BYTE PTR [rcx+0x60]
   14036b5b1:	0f 28 cc             	movaps xmm1,xmm4
   14036b5b4:	48 85 ed             	test   rbp,rbp
   14036b5b7:	75 67                	jne    0x14036b620
   14036b5b9:	45 84 ff             	test   r15b,r15b
   14036b5bc:	0f 84 bc 00 00 00    	je     0x14036b67e
   14036b5c2:	45 33 db             	xor    r11d,r11d
   14036b5c5:	41 0f b6 f7          	movzx  esi,r15b
   14036b5c9:	4d 8d 56 61          	lea    r10,[r14+0x61]
   14036b5cd:	0f 1f 00             	nop    DWORD PTR [rax]
   14036b5d0:	45 0f b6 02          	movzx  r8d,BYTE PTR [r10]
   14036b5d4:	32 d2                	xor    dl,dl
   14036b5d6:	45 84 c0             	test   r8b,r8b
   14036b5d9:	74 36                	je     0x14036b611
   14036b5db:	4b 8b 84 33 98 00 00 	mov    rax,QWORD PTR [r11+r14*1+0x98]
   14036b5e2:	00 
   14036b5e3:	4c 8b 08             	mov    r9,QWORD PTR [rax]
   14036b5e6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14036b5ed:	00 00 00 
   14036b5f0:	0f b6 c2             	movzx  eax,dl
   14036b5f3:	fe c2                	inc    dl
   14036b5f5:	0f af c7             	imul   eax,edi
   14036b5f8:	03 c3                	add    eax,ebx
   14036b5fa:	48 98                	cdqe
   14036b5fc:	41 0f b7 0c 41       	movzx  ecx,WORD PTR [r9+rax*2]
   14036b601:	66 0f 6e c1          	movd   xmm0,ecx
   14036b605:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14036b608:	f3 0f 58 c8          	addss  xmm1,xmm0
   14036b60c:	41 3a d0             	cmp    dl,r8b
   14036b60f:	72 df                	jb     0x14036b5f0
   14036b611:	49 ff c2             	inc    r10
   14036b614:	49 83 c3 08          	add    r11,0x8
   14036b618:	48 83 ee 01          	sub    rsi,0x1
   14036b61c:	75 b2                	jne    0x14036b5d0
   14036b61e:	eb 5e                	jmp    0x14036b67e
   14036b620:	45 84 ff             	test   r15b,r15b
   14036b623:	74 59                	je     0x14036b67e
   14036b625:	45 33 c9             	xor    r9d,r9d
   14036b628:	41 0f b6 f7          	movzx  esi,r15b
   14036b62c:	4d 8d 9e 98 00 00 00 	lea    r11,[r14+0x98]
   14036b633:	41 80 3c 29 00       	cmp    BYTE PTR [r9+rbp*1],0x0
   14036b638:	74 37                	je     0x14036b671
   14036b63a:	47 0f b6 44 31 61    	movzx  r8d,BYTE PTR [r9+r14*1+0x61]
   14036b640:	32 d2                	xor    dl,dl
   14036b642:	45 84 c0             	test   r8b,r8b
   14036b645:	74 2a                	je     0x14036b671
   14036b647:	49 8b 03             	mov    rax,QWORD PTR [r11]
   14036b64a:	4c 8b 10             	mov    r10,QWORD PTR [rax]
   14036b64d:	0f 1f 00             	nop    DWORD PTR [rax]
   14036b650:	0f b6 c2             	movzx  eax,dl
   14036b653:	fe c2                	inc    dl
   14036b655:	0f af c7             	imul   eax,edi
   14036b658:	03 c3                	add    eax,ebx
   14036b65a:	48 98                	cdqe
   14036b65c:	41 0f b7 0c 42       	movzx  ecx,WORD PTR [r10+rax*2]
   14036b661:	66 0f 6e c1          	movd   xmm0,ecx
   14036b665:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14036b668:	f3 0f 58 c8          	addss  xmm1,xmm0
   14036b66c:	41 3a d0             	cmp    dl,r8b
   14036b66f:	72 df                	jb     0x14036b650
   14036b671:	49 ff c1             	inc    r9
   14036b674:	49 83 c3 08          	add    r11,0x8
   14036b678:	48 83 ee 01          	sub    rsi,0x1
   14036b67c:	75 b5                	jne    0x14036b633
   14036b67e:	f3 0f 5f cb          	maxss  xmm1,xmm3
   14036b682:	ff c3                	inc    ebx
   14036b684:	0f 28 d9             	movaps xmm3,xmm1
   14036b687:	41 3b dd             	cmp    ebx,r13d
   14036b68a:	0f 8c 21 ff ff ff    	jl     0x14036b5b1
   14036b690:	4c 8b 3c 24          	mov    r15,QWORD PTR [rsp]
   14036b694:	0f 28 c1             	movaps xmm0,xmm1
   14036b697:	4c 8b 64 24 40       	mov    r12,QWORD PTR [rsp+0x40]
   14036b69c:	48 8b 74 24 38       	mov    rsi,QWORD PTR [rsp+0x38]
   14036b6a1:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   14036b6a6:	4c 8b 6c 24 08       	mov    r13,QWORD PTR [rsp+0x8]
   14036b6ab:	48 83 c4 10          	add    rsp,0x10
   14036b6af:	41 5e                	pop    r14
   14036b6b1:	5f                   	pop    rdi
   14036b6b2:	5d                   	pop    rbp
   14036b6b3:	c3                   	ret
   14036b6b4:	0f 57 c0             	xorps  xmm0,xmm0
   14036b6b7:	eb e8                	jmp    0x14036b6a1
   14036b6b9:	0f 57 c0             	xorps  xmm0,xmm0
   14036b6bc:	48 83 c4 10          	add    rsp,0x10
   14036b6c0:	41 5e                	pop    r14
   14036b6c2:	5f                   	pop    rdi
   14036b6c3:	5d                   	pop    rbp
   14036b6c4:	c3                   	ret
   14036b6c5:	cc                   	int3
   14036b6c6:	cc                   	int3
   14036b6c7:	cc                   	int3
   14036b6c8:	cc                   	int3
   14036b6c9:	cc                   	int3
   14036b6ca:	cc                   	int3
   14036b6cb:	cc                   	int3
   14036b6cc:	cc                   	int3
   14036b6cd:	cc                   	int3
   14036b6ce:	cc                   	int3
   14036b6cf:	cc                   	int3
   14036b6d0:	48 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],rbp
   14036b6d5:	57                   	push   rdi
   14036b6d6:	41 54                	push   r12
   14036b6d8:	41 56                	push   r14
   14036b6da:	41 57                	push   r15
   14036b6dc:	8b 29                	mov    ebp,DWORD PTR [rcx]
   14036b6de:	8b c5                	mov    eax,ebp
   14036b6e0:	45 8b e0             	mov    r12d,r8d
   14036b6e3:	8b fa                	mov    edi,edx
   14036b6e5:	4c 8b f9             	mov    r15,rcx
   14036b6e8:	85 d2                	test   edx,edx
   14036b6ea:	79 02                	jns    0x14036b6ee
   14036b6ec:	8b fd                	mov    edi,ebp
   14036b6ee:	45 85 c0             	test   r8d,r8d
   14036b6f1:	79 09                	jns    0x14036b6fc
   14036b6f3:	44 8b 61 04          	mov    r12d,DWORD PTR [rcx+0x4]
   14036b6f7:	45 8b f4             	mov    r14d,r12d
   14036b6fa:	eb 04                	jmp    0x14036b700
   14036b6fc:	44 8b 71 04          	mov    r14d,DWORD PTR [rcx+0x4]
   14036b700:	44 2b f0             	sub    r14d,eax
   14036b703:	0f 57 ed             	xorps  xmm5,xmm5
   14036b706:	0f 57 d2             	xorps  xmm2,xmm2
   14036b709:	0f 57 db             	xorps  xmm3,xmm3
   14036b70c:	41 3b fc             	cmp    edi,r12d
   14036b70f:	0f 8d df 00 00 00    	jge    0x14036b7f4
   14036b715:	f3 0f 10 25 bb 29 32 	movss  xmm4,DWORD PTR [rip+0x3229bb]        # 0x14068e0d8
   14036b71c:	00 
   14036b71d:	48 8d 81 98 00 00 00 	lea    rax,[rcx+0x98]
   14036b724:	48 89 5c 24 28       	mov    QWORD PTR [rsp+0x28],rbx
   14036b729:	48 89 74 24 30       	mov    QWORD PTR [rsp+0x30],rsi
   14036b72e:	4c 89 6c 24 38       	mov    QWORD PTR [rsp+0x38],r13
   14036b733:	44 0f b6 69 60       	movzx  r13d,BYTE PTR [rcx+0x60]
   14036b738:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14036b73f:	00 
   14036b740:	45 84 ed             	test   r13b,r13b
   14036b743:	0f 84 79 00 00 00    	je     0x14036b7c2
   14036b749:	4d 8d 4f 61          	lea    r9,[r15+0x61]
   14036b74d:	41 0f b6 f5          	movzx  esi,r13b
   14036b751:	4c 8b d0             	mov    r10,rax
   14036b754:	45 0f b6 01          	movzx  r8d,BYTE PTR [r9]
   14036b758:	32 d2                	xor    dl,dl
   14036b75a:	45 84 c0             	test   r8b,r8b
   14036b75d:	74 4f                	je     0x14036b7ae
   14036b75f:	49 8b 02             	mov    rax,QWORD PTR [r10]
   14036b762:	4c 8b 18             	mov    r11,QWORD PTR [rax]
   14036b765:	48 8b 58 18          	mov    rbx,QWORD PTR [rax+0x18]
   14036b769:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14036b770:	0f b6 c2             	movzx  eax,dl
   14036b773:	0f 28 cc             	movaps xmm1,xmm4
   14036b776:	41 0f af c6          	imul   eax,r14d
   14036b77a:	fe c2                	inc    dl
   14036b77c:	2b c5                	sub    eax,ebp
   14036b77e:	03 c7                	add    eax,edi
   14036b780:	8b c8                	mov    ecx,eax
   14036b782:	41 0f b7 04 43       	movzx  eax,WORD PTR [r11+rax*2]
   14036b787:	66 0f 6e c0          	movd   xmm0,eax
   14036b78b:	0f bf 04 4b          	movsx  eax,WORD PTR [rbx+rcx*2]
   14036b78f:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14036b792:	f3 0f 5f c8          	maxss  xmm1,xmm0
   14036b796:	66 0f 6e c0          	movd   xmm0,eax
   14036b79a:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14036b79d:	f3 0f 58 d9          	addss  xmm3,xmm1
   14036b7a1:	f3 0f 59 c1          	mulss  xmm0,xmm1
   14036b7a5:	f3 0f 58 d0          	addss  xmm2,xmm0
   14036b7a9:	41 3a d0             	cmp    dl,r8b
   14036b7ac:	72 c2                	jb     0x14036b770
   14036b7ae:	49 ff c1             	inc    r9
   14036b7b1:	49 83 c2 08          	add    r10,0x8
   14036b7b5:	48 83 ee 01          	sub    rsi,0x1
   14036b7b9:	75 99                	jne    0x14036b754
   14036b7bb:	49 8d 87 98 00 00 00 	lea    rax,[r15+0x98]
   14036b7c2:	ff c7                	inc    edi
   14036b7c4:	41 3b fc             	cmp    edi,r12d
   14036b7c7:	0f 8c 73 ff ff ff    	jl     0x14036b740
   14036b7cd:	0f 2e dd             	ucomiss xmm3,xmm5
   14036b7d0:	4c 8b 6c 24 38       	mov    r13,QWORD PTR [rsp+0x38]
   14036b7d5:	48 8b 74 24 30       	mov    rsi,QWORD PTR [rsp+0x30]
   14036b7da:	48 8b 5c 24 28       	mov    rbx,QWORD PTR [rsp+0x28]
   14036b7df:	7a 02                	jp     0x14036b7e3
   14036b7e1:	74 04                	je     0x14036b7e7
   14036b7e3:	f3 0f 5e d3          	divss  xmm2,xmm3
   14036b7e7:	f3 0f 10 05 c1 29 32 	movss  xmm0,DWORD PTR [rip+0x3229c1]        # 0x14068e1b0
   14036b7ee:	00 
   14036b7ef:	0f 2f c2             	comiss xmm0,xmm2
   14036b7f2:	76 10                	jbe    0x14036b804
   14036b7f4:	f3 0f 10 0d c4 29 32 	movss  xmm1,DWORD PTR [rip+0x3229c4]        # 0x14068e1c0
   14036b7fb:	00 
   14036b7fc:	0f 28 c2             	movaps xmm0,xmm2
   14036b7ff:	0f 2f d1             	comiss xmm2,xmm1
   14036b802:	76 1e                	jbe    0x14036b822
   14036b804:	0f 2f c5             	comiss xmm0,xmm5
   14036b807:	72 1c                	jb     0x14036b825
   14036b809:	f3 0f 58 05 cb 47 4e 	addss  xmm0,DWORD PTR [rip+0x4e47cb]        # 0x14084ffdc
   14036b810:	00 
   14036b811:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14036b815:	48 8b 6c 24 40       	mov    rbp,QWORD PTR [rsp+0x40]
   14036b81a:	41 5f                	pop    r15
   14036b81c:	41 5e                	pop    r14
   14036b81e:	41 5c                	pop    r12
   14036b820:	5f                   	pop    rdi
   14036b821:	c3                   	ret
   14036b822:	0f 28 c1             	movaps xmm0,xmm1
   14036b825:	f3 0f 5c 05 af 47 4e 	subss  xmm0,DWORD PTR [rip+0x4e47af]        # 0x14084ffdc
   14036b82c:	00 
   14036b82d:	48 8b 6c 24 40       	mov    rbp,QWORD PTR [rsp+0x40]
   14036b832:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14036b836:	41 5f                	pop    r15
   14036b838:	41 5e                	pop    r14
   14036b83a:	41 5c                	pop    r12
   14036b83c:	5f                   	pop    rdi
   14036b83d:	c3                   	ret
   14036b83e:	cc                   	int3
   14036b83f:	cc                   	int3
   14036b840:	cc                   	int3
   14036b841:	cc                   	int3
   14036b842:	cc                   	int3
   14036b843:	cc                   	int3
   14036b844:	cc                   	int3
   14036b845:	cc                   	int3
   14036b846:	cc                   	int3
   14036b847:	cc                   	int3
   14036b848:	cc                   	int3
   14036b849:	cc                   	int3
   14036b84a:	cc                   	int3
   14036b84b:	cc                   	int3
   14036b84c:	cc                   	int3
   14036b84d:	cc                   	int3
   14036b84e:	cc                   	int3
   14036b84f:	cc                   	int3
   14036b850:	48 89 5c 24 18       	mov    QWORD PTR [rsp+0x18],rbx
   14036b855:	55                   	push   rbp
   14036b856:	56                   	push   rsi
   14036b857:	57                   	push   rdi
   14036b858:	41 54                	push   r12
   14036b85a:	41 55                	push   r13
   14036b85c:	41 56                	push   r14
   14036b85e:	41 57                	push   r15
   14036b860:	48 81 ec c0 00 00 00 	sub    rsp,0xc0
   14036b867:	0f 29 b4 24 b0 00 00 	movaps XMMWORD PTR [rsp+0xb0],xmm6
   14036b86e:	00 
   14036b86f:	48 8b 05 f2 68 60 00 	mov    rax,QWORD PTR [rip+0x6068f2]        # 0x140972168
   14036b876:	48 33 c4             	xor    rax,rsp
   14036b879:	48 89 84 24 90 00 00 	mov    QWORD PTR [rsp+0x90],rax
   14036b880:	00 
   14036b881:	48 8b 9c 24 30 01 00 	mov    rbx,QWORD PTR [rsp+0x130]
   14036b888:	00 
   14036b889:	41 0f b6 f9          	movzx  edi,r9b
   14036b88d:	48 8b 84 24 58 01 00 	mov    rax,QWORD PTR [rsp+0x158]
   14036b894:	00 
   14036b895:	45 0f b6 f0          	movzx  r14d,r8b
   14036b899:	48 89 54 24 58       	mov    QWORD PTR [rsp+0x58],rdx
   14036b89e:	4c                   	rex.WR
   14036b89f:	8b                   	.byte 0x8b
