
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032e650 <.text+0x32d650>:
   14032e650:	4c 89 4c 24 20       	mov    QWORD PTR [rsp+0x20],r9
   14032e655:	4c 89 44 24 18       	mov    QWORD PTR [rsp+0x18],r8
   14032e65a:	56                   	push   rsi
   14032e65b:	57                   	push   rdi
   14032e65c:	41 55                	push   r13
   14032e65e:	48 83 ec 40          	sub    rsp,0x40
   14032e662:	41 b8 05 00 00 00    	mov    r8d,0x5
   14032e668:	48 8b f2             	mov    rsi,rdx
   14032e66b:	4c 8b e9             	mov    r13,rcx
   14032e66e:	e8 cd f4 ff ff       	call   0x14032db40
   14032e673:	48 8b f8             	mov    rdi,rax
   14032e676:	48 85 c0             	test   rax,rax
   14032e679:	75 0c                	jne    0x14032e687
   14032e67b:	8b 46 0c             	mov    eax,DWORD PTR [rsi+0xc]
   14032e67e:	48 83 c4 40          	add    rsp,0x40
   14032e682:	41 5d                	pop    r13
   14032e684:	5f                   	pop    rdi
   14032e685:	5e                   	pop    rsi
   14032e686:	c3                   	ret
   14032e687:	8b 48 24             	mov    ecx,DWORD PTR [rax+0x24]
   14032e68a:	48 89 5c 24 60       	mov    QWORD PTR [rsp+0x60],rbx
   14032e68f:	8b 5e 0c             	mov    ebx,DWORD PTR [rsi+0xc]
   14032e692:	2b 1d 4c b9 65 00    	sub    ebx,DWORD PTR [rip+0x65b94c]        # 0x140989fe4
   14032e698:	48 89 6c 24 38       	mov    QWORD PTR [rsp+0x38],rbp
   14032e69d:	03 cb                	add    ecx,ebx
   14032e69f:	4c 89 64 24 30       	mov    QWORD PTR [rsp+0x30],r12
   14032e6a4:	8b eb                	mov    ebp,ebx
   14032e6a6:	4c 8b a6 a0 05 00 00 	mov    r12,QWORD PTR [rsi+0x5a0]
   14032e6ad:	4c 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],r15
   14032e6b2:	4c 8b be 98 05 00 00 	mov    r15,QWORD PTR [rsi+0x598]
   14032e6b9:	3b d9                	cmp    ebx,ecx
   14032e6bb:	7d 52                	jge    0x14032e70f
   14032e6bd:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   14032e6c2:	45 33 f6             	xor    r14d,r14d
   14032e6c5:	48 8b 47 40          	mov    rax,QWORD PTR [rdi+0x40]
   14032e6c9:	41 0f b7 14 06       	movzx  edx,WORD PTR [r14+rax*1]
   14032e6ce:	8b c5                	mov    eax,ebp
   14032e6d0:	4c 69 c2 f8 00 00 00 	imul   r8,rdx,0xf8
   14032e6d7:	66 43 89 14 26       	mov    WORD PTR [r14+r12*1],dx
   14032e6dc:	2b c3                	sub    eax,ebx
   14032e6de:	48 8b 57 38          	mov    rdx,QWORD PTR [rdi+0x38]
   14032e6e2:	69 c8 d0 01 00 00    	imul   ecx,eax,0x1d0
   14032e6e8:	4c 69 c9 f8 00 00 00 	imul   r9,rcx,0xf8
   14032e6ef:	49 03 d1             	add    rdx,r9
   14032e6f2:	4b 8d 0c 39          	lea    rcx,[r9+r15*1]
   14032e6f6:	e8 e9 25 2f 00       	call   0x140620ce4
   14032e6fb:	8b 4f 24             	mov    ecx,DWORD PTR [rdi+0x24]
   14032e6fe:	4d 8d 76 02          	lea    r14,[r14+0x2]
   14032e702:	03 cb                	add    ecx,ebx
   14032e704:	ff c5                	inc    ebp
   14032e706:	3b e9                	cmp    ebp,ecx
   14032e708:	7c bb                	jl     0x14032e6c5
   14032e70a:	4c 8b 74 24 28       	mov    r14,QWORD PTR [rsp+0x28]
   14032e70f:	48 8b 47 58          	mov    rax,QWORD PTR [rdi+0x58]
   14032e713:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]
   14032e718:	48 89 01             	mov    QWORD PTR [rcx],rax
   14032e71b:	48 8b 4c 24 78       	mov    rcx,QWORD PTR [rsp+0x78]
   14032e720:	0f b7 47 60          	movzx  eax,WORD PTR [rdi+0x60]
   14032e724:	66 89 01             	mov    WORD PTR [rcx],ax
   14032e727:	49 8b 4d 58          	mov    rcx,QWORD PTR [r13+0x58]
   14032e72b:	ff 15 17 9f 35 00    	call   QWORD PTR [rip+0x359f17]        # 0x140688648
   14032e731:	8b 47 24             	mov    eax,DWORD PTR [rdi+0x24]
   14032e734:	4c 8b 7c 24 20       	mov    r15,QWORD PTR [rsp+0x20]
   14032e739:	03 c3                	add    eax,ebx
   14032e73b:	39 46 0c             	cmp    DWORD PTR [rsi+0xc],eax
   14032e73e:	4c 8b 64 24 30       	mov    r12,QWORD PTR [rsp+0x30]
   14032e743:	0f 4d 46 0c          	cmovge eax,DWORD PTR [rsi+0xc]
   14032e747:	48 8b 6c 24 38       	mov    rbp,QWORD PTR [rsp+0x38]
   14032e74c:	48 8b 5c 24 60       	mov    rbx,QWORD PTR [rsp+0x60]
   14032e751:	48 83 c4 40          	add    rsp,0x40
   14032e755:	41 5d                	pop    r13
   14032e757:	5f                   	pop    rdi
   14032e758:	5e                   	pop    rsi
   14032e759:	c3                   	ret
   14032e75a:	cc                   	int3
   14032e75b:	cc                   	int3
   14032e75c:	cc                   	int3
   14032e75d:	cc                   	int3
   14032e75e:	cc                   	int3
   14032e75f:	cc                   	int3
   14032e760:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14032e765:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   14032e76a:	57                   	push   rdi
   14032e76b:	48 83 ec 20          	sub    rsp,0x20
   14032e76f:	33 c0                	xor    eax,eax
   14032e771:	49 8b f8             	mov    rdi,r8
   14032e774:	49 89 00             	mov    QWORD PTR [r8],rax
   14032e777:	49 8b d9             	mov    rbx,r9
   14032e77a:	48 8b f1             	mov    rsi,rcx
   14032e77d:	41 89 01             	mov    DWORD PTR [r9],eax
   14032e780:	44 8d 40 04          	lea    r8d,[rax+0x4]
   14032e784:	e8 b7 f3 ff ff       	call   0x14032db40
   14032e789:	48 85 c0             	test   rax,rax
   14032e78c:	74 16                	je     0x14032e7a4
   14032e78e:	48 8b 50 68          	mov    rdx,QWORD PTR [rax+0x68]
   14032e792:	48 89 17             	mov    QWORD PTR [rdi],rdx
   14032e795:	8b 40 70             	mov    eax,DWORD PTR [rax+0x70]
   14032e798:	89 03                	mov    DWORD PTR [rbx],eax
   14032e79a:	48 8b 4e 58          	mov    rcx,QWORD PTR [rsi+0x58]
   14032e79e:	ff 15 a4 9e 35 00    	call   QWORD PTR [rip+0x359ea4]        # 0x140688648
   14032e7a4:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   14032e7a9:	48 8b 74 24 38       	mov    rsi,QWORD PTR [rsp+0x38]
   14032e7ae:	48 83 c4 20          	add    rsp,0x20
   14032e7b2:	5f                   	pop    rdi
   14032e7b3:	c3                   	ret
   14032e7b4:	cc                   	int3
   14032e7b5:	cc                   	int3
   14032e7b6:	cc                   	int3
   14032e7b7:	cc                   	int3
   14032e7b8:	cc                   	int3
   14032e7b9:	cc                   	int3
   14032e7ba:	cc                   	int3
   14032e7bb:	cc                   	int3
   14032e7bc:	cc                   	int3
   14032e7bd:	cc                   	int3
   14032e7be:	cc                   	int3
   14032e7bf:	cc                   	int3
   14032e7c0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14032e7c5:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   14032e7ca:	57                   	push   rdi
   14032e7cb:	48 83 ec 20          	sub    rsp,0x20
   14032e7cf:	33 c0                	xor    eax,eax
   14032e7d1:	49 8b f8             	mov    rdi,r8
   14032e7d4:	49 89 00             	mov    QWORD PTR [r8],rax
   14032e7d7:	49 8b d9             	mov    rbx,r9
   14032e7da:	48 8b f1             	mov    rsi,rcx
   14032e7dd:	41 89 01             	mov    DWORD PTR [r9],eax
   14032e7e0:	44 8d 40 06          	lea    r8d,[rax+0x6]
   14032e7e4:	e8 57 f3 ff ff       	call   0x14032db40
   14032e7e9:	48 85 c0             	test   rax,rax
   14032e7ec:	74 19                	je     0x14032e807
   14032e7ee:	48 8d 50 78          	lea    rdx,[rax+0x78]
   14032e7f2:	48 89 17             	mov    QWORD PTR [rdi],rdx
   14032e7f5:	8b 80 78 60 09 00    	mov    eax,DWORD PTR [rax+0x96078]
   14032e7fb:	89 03                	mov    DWORD PTR [rbx],eax
   14032e7fd:	48 8b 4e 58          	mov    rcx,QWORD PTR [rsi+0x58]
   14032e801:	ff 15 41 9e 35 00    	call   QWORD PTR [rip+0x359e41]        # 0x140688648
   14032e807:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   14032e80c:	48 8b 74 24 38       	mov    rsi,QWORD PTR [rsp+0x38]
   14032e811:	48 83 c4 20          	add    rsp,0x20
   14032e815:	5f                   	pop    rdi
   14032e816:	c3                   	ret
   14032e817:	cc                   	int3
   14032e818:	cc                   	int3
   14032e819:	cc                   	int3
   14032e81a:	cc                   	int3
   14032e81b:	cc                   	int3
   14032e81c:	cc                   	int3
   14032e81d:	cc                   	int3
   14032e81e:	cc                   	int3
   14032e81f:	cc                   	int3
