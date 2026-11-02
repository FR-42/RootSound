
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032e4b0 <.text+0x32d4b0>:
   14032e4b0:	4c 89 4c 24 20       	mov    QWORD PTR [rsp+0x20],r9
   14032e4b5:	48 89 4c 24 08       	mov    QWORD PTR [rsp+0x8],rcx
   14032e4ba:	53                   	push   rbx
   14032e4bb:	56                   	push   rsi
   14032e4bc:	57                   	push   rdi
   14032e4bd:	41 55                	push   r13
   14032e4bf:	41 57                	push   r15
   14032e4c1:	48 83 ec 50          	sub    rsp,0x50
   14032e4c5:	48 8b f2             	mov    rsi,rdx
   14032e4c8:	4d 63 e8             	movsxd r13,r8d
   14032e4cb:	4c 8b f9             	mov    r15,rcx
   14032e4ce:	ba ff ff ff ff       	mov    edx,0xffffffff
   14032e4d3:	48 8b 49 58          	mov    rcx,QWORD PTR [rcx+0x58]
   14032e4d7:	49 8b f9             	mov    rdi,r9
   14032e4da:	ff 15 70 a1 35 00    	call   QWORD PTR [rip+0x35a170]        # 0x140688650
   14032e4e0:	49 8b 5f 60          	mov    rbx,QWORD PTR [r15+0x60]
   14032e4e4:	48 85 db             	test   rbx,rbx
   14032e4e7:	0f 84 41 01 00 00    	je     0x14032e62e
   14032e4ed:	8b 16                	mov    edx,DWORD PTR [rsi]
   14032e4ef:	90                   	nop
   14032e4f0:	39 13                	cmp    DWORD PTR [rbx],edx
   14032e4f2:	75 08                	jne    0x14032e4fc
   14032e4f4:	8b 46 08             	mov    eax,DWORD PTR [rsi+0x8]
   14032e4f7:	39 43 04             	cmp    DWORD PTR [rbx+0x4],eax
   14032e4fa:	74 11                	je     0x14032e50d
   14032e4fc:	48 8b 9b 88 60 09 00 	mov    rbx,QWORD PTR [rbx+0x96088]
   14032e503:	48 85 db             	test   rbx,rbx
   14032e506:	75 e8                	jne    0x14032e4f0
   14032e508:	e9 21 01 00 00       	jmp    0x14032e62e
   14032e50d:	8b 0d d1 ba 65 00    	mov    ecx,DWORD PTR [rip+0x65bad1]        # 0x140989fe4
   14032e513:	4c 8b 8e 98 05 00 00 	mov    r9,QWORD PTR [rsi+0x598]
   14032e51a:	48 8b 96 a0 05 00 00 	mov    rdx,QWORD PTR [rsi+0x5a0]
   14032e521:	48 89 ac 24 88 00 00 	mov    QWORD PTR [rsp+0x88],rbp
   14032e528:	00 
   14032e529:	8b 6e 10             	mov    ebp,DWORD PTR [rsi+0x10]
   14032e52c:	2b e9                	sub    ebp,ecx
   14032e52e:	4c 89 64 24 48       	mov    QWORD PTR [rsp+0x48],r12
   14032e533:	4c 89 74 24 40       	mov    QWORD PTR [rsp+0x40],r14
   14032e538:	44 8b e5             	mov    r12d,ebp
   14032e53b:	4c 63 f5             	movsxd r14,ebp
   14032e53e:	4c 89 4c 24 30       	mov    QWORD PTR [rsp+0x30],r9
   14032e543:	48 89 54 24 20       	mov    QWORD PTR [rsp+0x20],rdx
   14032e548:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   14032e54d:	4d 3b f5             	cmp    r14,r13
   14032e550:	0f 8d 91 00 00 00    	jge    0x14032e5e7
   14032e556:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14032e55d:	00 00 00 
   14032e560:	41 8b c4             	mov    eax,r12d
   14032e563:	2b 46 0c             	sub    eax,DWORD PTR [rsi+0xc]
   14032e566:	03 c8                	add    ecx,eax
   14032e568:	48 63 f9             	movsxd rdi,ecx
   14032e56b:	69 c9 d0 01 00 00    	imul   ecx,ecx,0x1d0
   14032e571:	0f b7 04 7a          	movzx  eax,WORD PTR [rdx+rdi*2]
   14032e575:	4c 69 c0 f8 00 00 00 	imul   r8,rax,0xf8
   14032e57c:	48 69 d1 f8 00 00 00 	imul   rdx,rcx,0xf8
   14032e583:	41 8b c4             	mov    eax,r12d
   14032e586:	2b c5                	sub    eax,ebp
   14032e588:	69 c8 d0 01 00 00    	imul   ecx,eax,0x1d0
   14032e58e:	49 03 d1             	add    rdx,r9
   14032e591:	48 69 c9 f8 00 00 00 	imul   rcx,rcx,0xf8
   14032e598:	48 03 4b 38          	add    rcx,QWORD PTR [rbx+0x38]
   14032e59c:	e8 43 27 2f 00       	call   0x140620ce4
   14032e5a1:	48 8b 44 24 20       	mov    rax,QWORD PTR [rsp+0x20]
   14032e5a6:	49 8b d6             	mov    rdx,r14
   14032e5a9:	48 2b 54 24 28       	sub    rdx,QWORD PTR [rsp+0x28]
   14032e5ae:	41 ff c4             	inc    r12d
   14032e5b1:	48 8b 4b 40          	mov    rcx,QWORD PTR [rbx+0x40]
   14032e5b5:	49 ff c6             	inc    r14
   14032e5b8:	0f b7 04 78          	movzx  eax,WORD PTR [rax+rdi*2]
   14032e5bc:	66 89 04 51          	mov    WORD PTR [rcx+rdx*2],ax
   14032e5c0:	4d 3b f5             	cmp    r14,r13
   14032e5c3:	7d 12                	jge    0x14032e5d7
   14032e5c5:	8b 0d 19 ba 65 00    	mov    ecx,DWORD PTR [rip+0x65ba19]        # 0x140989fe4
   14032e5cb:	48 8b 54 24 20       	mov    rdx,QWORD PTR [rsp+0x20]
   14032e5d0:	4c 8b 4c 24 30       	mov    r9,QWORD PTR [rsp+0x30]
   14032e5d5:	eb 89                	jmp    0x14032e560
   14032e5d7:	4c 8b bc 24 80 00 00 	mov    r15,QWORD PTR [rsp+0x80]
   14032e5de:	00 
   14032e5df:	48 8b bc 24 98 00 00 	mov    rdi,QWORD PTR [rsp+0x98]
   14032e5e6:	00 
   14032e5e7:	4c 8b 74 24 40       	mov    r14,QWORD PTR [rsp+0x40]
   14032e5ec:	33 c9                	xor    ecx,ecx
   14032e5ee:	4c 8b 64 24 48       	mov    r12,QWORD PTR [rsp+0x48]
   14032e5f3:	41 8b c5             	mov    eax,r13d
   14032e5f6:	2b c5                	sub    eax,ebp
   14032e5f8:	44 3b ed             	cmp    r13d,ebp
   14032e5fb:	48 8b ac 24 88 00 00 	mov    rbp,QWORD PTR [rsp+0x88]
   14032e602:	00 
   14032e603:	0f 4e c1             	cmovle eax,ecx
   14032e606:	48 8b 4b 58          	mov    rcx,QWORD PTR [rbx+0x58]
   14032e60a:	89 43 24             	mov    DWORD PTR [rbx+0x24],eax
   14032e60d:	48 85 c9             	test   rcx,rcx
   14032e610:	74 05                	je     0x14032e617
   14032e612:	e8 41 cf 2e 00       	call   0x14061b558
   14032e617:	0f b7 84 24 a0 00 00 	movzx  eax,WORD PTR [rsp+0xa0]
   14032e61e:	00 
   14032e61f:	66 89 43 60          	mov    WORD PTR [rbx+0x60],ax
   14032e623:	48 89 7b 58          	mov    QWORD PTR [rbx+0x58],rdi
   14032e627:	c7 43 08 05 00 00 00 	mov    DWORD PTR [rbx+0x8],0x5
   14032e62e:	49 8b 4f 58          	mov    rcx,QWORD PTR [r15+0x58]
   14032e632:	48 83 c4 50          	add    rsp,0x50
   14032e636:	41 5f                	pop    r15
   14032e638:	41 5d                	pop    r13
   14032e63a:	5f                   	pop    rdi
   14032e63b:	5e                   	pop    rsi
   14032e63c:	5b                   	pop    rbx
   14032e63d:	48 ff 25 04 a0 35 00 	rex.W jmp QWORD PTR [rip+0x35a004]        # 0x140688648
   14032e644:	cc                   	int3
   14032e645:	cc                   	int3
   14032e646:	cc                   	int3
   14032e647:	cc                   	int3
   14032e648:	cc                   	int3
   14032e649:	cc                   	int3
   14032e64a:	cc                   	int3
   14032e64b:	cc                   	int3
   14032e64c:	cc                   	int3
   14032e64d:	cc                   	int3
   14032e64e:	cc                   	int3
   14032e64f:	cc                   	int3
