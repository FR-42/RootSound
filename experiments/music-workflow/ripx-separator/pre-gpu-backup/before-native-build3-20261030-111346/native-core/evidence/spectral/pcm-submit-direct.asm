
D:\#Software\ripx\HitnMixLibCLR.x64.dll:     file format pei-x86-64


Disassembly of section .text:

00000001800226c0 <.text+0x216c0>:
   1800226c0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   1800226c5:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   1800226ca:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   1800226cf:	57                   	push   rdi
   1800226d0:	41 56                	push   r14
   1800226d2:	41 57                	push   r15
   1800226d4:	48 83 ec 30          	sub    rsp,0x30
   1800226d8:	44 8b f2             	mov    r14d,edx
   1800226db:	48 8b f9             	mov    rdi,rcx
   1800226de:	48 8b 89 38 03 00 00 	mov    rcx,QWORD PTR [rcx+0x338]
   1800226e5:	ba ff ff ff ff       	mov    edx,0xffffffff
   1800226ea:	41 8b f0             	mov    esi,r8d
   1800226ed:	ff 15 05 fa 05 00    	call   QWORD PTR [rip+0x5fa05]        # 0x1800820f8
   1800226f3:	8b af dc 02 00 00    	mov    ebp,DWORD PTR [rdi+0x2dc]
   1800226f9:	48 8b 87 28 03 00 00 	mov    rax,QWORD PTR [rdi+0x328]
   180022700:	4d 6b ce 1c          	imul   r9,r14,0x1c
   180022704:	0f af ee             	imul   ebp,esi
   180022707:	80 3d a1 05 09 00 00 	cmp    BYTE PTR [rip+0x905a1],0x0        # 0x1800b2caf
   18002270e:	45 8b 3c 01          	mov    r15d,DWORD PTR [r9+rax*1]
   180022712:	75 0f                	jne    0x180022723
   180022714:	41 8b 44 01 04       	mov    eax,DWORD PTR [r9+rax*1+0x4]
   180022719:	ff c8                	dec    eax
   18002271b:	3b f0                	cmp    esi,eax
   18002271d:	74 04                	je     0x180022723
   18002271f:	32 db                	xor    bl,bl
   180022721:	eb 02                	jmp    0x180022725
   180022723:	b3 01                	mov    bl,0x1
   180022725:	48 8b 8f 38 03 00 00 	mov    rcx,QWORD PTR [rdi+0x338]
   18002272c:	ff 15 ce f9 05 00    	call   QWORD PTR [rip+0x5f9ce]        # 0x180082100
   180022732:	44 8b ce             	mov    r9d,esi
   180022735:	44 89 74 24 28       	mov    DWORD PTR [rsp+0x28],r14d
   18002273a:	45 8b c7             	mov    r8d,r15d
   18002273d:	88 5c 24 20          	mov    BYTE PTR [rsp+0x20],bl
   180022741:	8b d5                	mov    edx,ebp
   180022743:	48 8b cf             	mov    rcx,rdi
   180022746:	e8 25 00 00 00       	call   0x180022770
   18002274b:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   180022750:	48 8b 6c 24 58       	mov    rbp,QWORD PTR [rsp+0x58]
   180022755:	48 8b 74 24 60       	mov    rsi,QWORD PTR [rsp+0x60]
   18002275a:	48 83 c4 30          	add    rsp,0x30
   18002275e:	41 5f                	pop    r15
   180022760:	41 5e                	pop    r14
   180022762:	5f                   	pop    rdi
   180022763:	c3                   	ret
   180022764:	cc                   	int3
   180022765:	cc                   	int3
   180022766:	cc                   	int3
   180022767:	cc                   	int3
   180022768:	cc                   	int3
   180022769:	cc                   	int3
   18002276a:	cc                   	int3
   18002276b:	cc                   	int3
   18002276c:	cc                   	int3
   18002276d:	cc                   	int3
   18002276e:	cc                   	int3
   18002276f:	cc                   	int3
   180022770:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   180022775:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   18002277a:	56                   	push   rsi
   18002277b:	57                   	push   rdi
   18002277c:	41 54                	push   r12
   18002277e:	41 56                	push   r14
   180022780:	41 57                	push   r15
   180022782:	48 83 ec 60          	sub    rsp,0x60
   180022786:	48 8b 05 b3 e8 08 00 	mov    rax,QWORD PTR [rip+0x8e8b3]        # 0x1800b1040
   18002278d:	48 33 c4             	xor    rax,rsp
   180022790:	48 89 44 24 58       	mov    QWORD PTR [rsp+0x58],rax
   180022795:	33 db                	xor    ebx,ebx
   180022797:	48 8d b9 b8 02 00 00 	lea    rdi,[rcx+0x2b8]
   18002279e:	39 1d 58 e9 08 00    	cmp    DWORD PTR [rip+0x8e958],ebx        # 0x1800b10fc
   1800227a4:	41 8b e9             	mov    ebp,r9d
   1800227a7:	45 8b f0             	mov    r14d,r8d
   1800227aa:	44 8b fa             	mov    r15d,edx
   1800227ad:	48 8b f1             	mov    rsi,rcx
   1800227b0:	0f 86 ec 00 00 00    	jbe    0x1800228a2
   1800227b6:	49 c7 c4 ff ff ff ff 	mov    r12,0xffffffffffffffff
   1800227bd:	0f 1f 00             	nop    DWORD PTR [rax]
   1800227c0:	8b 4f 20             	mov    ecx,DWORD PTR [rdi+0x20]
   1800227c3:	b8 04 00 00 00       	mov    eax,0x4
   1800227c8:	48 f7 e1             	mul    rcx
   1800227cb:	49 0f 40 c4          	cmovo  rax,r12
   1800227cf:	48 8b c8             	mov    rcx,rax
   1800227d2:	e8 c5 47 ff ff       	call   0x180016f9c
   1800227d7:	48 89 44 dc 40       	mov    QWORD PTR [rsp+rbx*8+0x40],rax
   1800227dc:	48 85 c0             	test   rax,rax
   1800227df:	0f 84 11 01 00 00    	je     0x1800228f6
   1800227e5:	44 8b 47 20          	mov    r8d,DWORD PTR [rdi+0x20]
   1800227e9:	33 d2                	xor    edx,edx
   1800227eb:	49 c1 e0 02          	shl    r8,0x2
   1800227ef:	48 8b c8             	mov    rcx,rax
   1800227f2:	e8 78 67 ff ff       	call   0x180018f6f
   1800227f7:	8b 05 ff e8 08 00    	mov    eax,DWORD PTR [rip+0x8e8ff]        # 0x1800b10fc
   1800227fd:	ff c3                	inc    ebx
   1800227ff:	3b d8                	cmp    ebx,eax
   180022801:	72 bd                	jb     0x1800227c0
   180022803:	85 c0                	test   eax,eax
   180022805:	0f 84 97 00 00 00    	je     0x1800228a2
   18002280b:	f3 0f 10 0d 29 82 07 	movss  xmm1,DWORD PTR [rip+0x78229]        # 0x18009aa3c
   180022812:	00 
   180022813:	48 8d 4c 24 40       	lea    rcx,[rsp+0x40]
   180022818:	f3 0f 10 15 40 82 07 	movss  xmm2,DWORD PTR [rip+0x78240]        # 0x18009aa60
   18002281f:	00 
   180022820:	4c 8d 4c 24 40       	lea    r9,[rsp+0x40]
   180022825:	4c 8b d6             	mov    r10,rsi
   180022828:	44 8b d8             	mov    r11d,eax
   18002282b:	4c 2b d1             	sub    r10,rcx
   18002282e:	48 8d 4c 24 40       	lea    rcx,[rsp+0x40]
   180022833:	48 2b f1             	sub    rsi,rcx
   180022836:	45 33 c0             	xor    r8d,r8d
   180022839:	44 39 47 20          	cmp    DWORD PTR [rdi+0x20],r8d
   18002283d:	76 59                	jbe    0x180022898
   18002283f:	90                   	nop
   180022840:	66 83 3d 06 04 09 00 	cmp    WORD PTR [rip+0x90406],0x10        # 0x1800b2c4e
   180022847:	10 
   180022848:	75 16                	jne    0x180022860
   18002284a:	4b 8b 84 0a 58 02 00 	mov    rax,QWORD PTR [r10+r9*1+0x258]
   180022851:	00 
   180022852:	42 0f bf 0c 40       	movsx  ecx,WORD PTR [rax+r8*2]
   180022857:	66 0f 6e c1          	movd   xmm0,ecx
   18002285b:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   18002285e:	eb 26                	jmp    0x180022886
   180022860:	66 83 3d e6 03 09 00 	cmp    WORD PTR [rip+0x903e6],0x8        # 0x1800b2c4e
   180022867:	08 
   180022868:	75 25                	jne    0x18002288f
   18002286a:	4a 8b 84 0e 40 02 00 	mov    rax,QWORD PTR [rsi+r9*1+0x240]
   180022871:	00 
   180022872:	42 0f b6 0c 00       	movzx  ecx,BYTE PTR [rax+r8*1]
   180022877:	66 0f 6e c1          	movd   xmm0,ecx
   18002287b:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   18002287e:	f3 0f 5c c1          	subss  xmm0,xmm1
   180022882:	f3 0f 59 c2          	mulss  xmm0,xmm2
   180022886:	49 8b 01             	mov    rax,QWORD PTR [r9]
   180022889:	f3 42 0f 11 04 80    	movss  DWORD PTR [rax+r8*4],xmm0
   18002288f:	41 ff c0             	inc    r8d
   180022892:	44 3b 47 20          	cmp    r8d,DWORD PTR [rdi+0x20]
   180022896:	72 a8                	jb     0x180022840
   180022898:	49 83 c1 08          	add    r9,0x8
   18002289c:	49 83 eb 01          	sub    r11,0x1
   1800228a0:	75 94                	jne    0x180022836
   1800228a2:	8b 84 24 b8 00 00 00 	mov    eax,DWORD PTR [rsp+0xb8]
   1800228a9:	48 8d 54 24 40       	lea    rdx,[rsp+0x40]
   1800228ae:	89 44 24 30          	mov    DWORD PTR [rsp+0x30],eax
   1800228b2:	45 8b ce             	mov    r9d,r14d
   1800228b5:	0f b6 84 24 b0 00 00 	movzx  eax,BYTE PTR [rsp+0xb0]
   1800228bc:	00 
   1800228bd:	45 8b c7             	mov    r8d,r15d
   1800228c0:	88 44 24 28          	mov    BYTE PTR [rsp+0x28],al
   1800228c4:	48 8b cf             	mov    rcx,rdi
   1800228c7:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp
   1800228cb:	e8 30 00 00 00       	call   0x180022900
   1800228d0:	48 8b 4c 24 58       	mov    rcx,QWORD PTR [rsp+0x58]
   1800228d5:	48 33 cc             	xor    rcx,rsp
   1800228d8:	e8 b3 43 ff ff       	call   0x180016c90
   1800228dd:	4c 8d 5c 24 60       	lea    r11,[rsp+0x60]
   1800228e2:	49 8b 5b 38          	mov    rbx,QWORD PTR [r11+0x38]
   1800228e6:	49 8b 6b 40          	mov    rbp,QWORD PTR [r11+0x40]
   1800228ea:	49 8b e3             	mov    rsp,r11
   1800228ed:	41 5f                	pop    r15
   1800228ef:	41 5e                	pop    r14
   1800228f1:	41 5c                	pop    r12
   1800228f3:	5f                   	pop    rdi
   1800228f4:	5e                   	pop    rsi
   1800228f5:	c3                   	ret
   1800228f6:	eb d8                	jmp    0x1800228d0
   1800228f8:	cc                   	int3
   1800228f9:	cc                   	int3
   1800228fa:	cc                   	int3
   1800228fb:	cc                   	int3
   1800228fc:	cc                   	int3
   1800228fd:	cc                   	int3
   1800228fe:	cc                   	int3
   1800228ff:	cc                   	int3
   180022900:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   180022905:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   18002290a:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   18002290f:	57                   	push   rdi
   180022910:	41 54                	push   r12
   180022912:	41 55                	push   r13
   180022914:	41 56                	push   r14
   180022916:	41 57                	push   r15
   180022918:	48 83 ec 20          	sub    rsp,0x20
   18002291c:	44 8b ac 24 80 00 00 	mov    r13d,DWORD PTR [rsp+0x80]
   180022923:	00 
   180022924:	45 8b f9             	mov    r15d,r9d
   180022927:	45 8b e0             	mov    r12d,r8d
   18002292a:	4c 8b f2             	mov    r14,rdx
   18002292d:	48 8b f1             	mov    rsi,rcx
   180022930:	33 ff                	xor    edi,edi
   180022932:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   180022936:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   18002293d:	00 00 00 
   180022940:	48 8b 4e 50          	mov    rcx,QWORD PTR [rsi+0x50]
   180022944:	ba ff ff ff ff       	mov    edx,0xffffffff
   180022949:	ff 15 a9 f7 05 00    	call   QWORD PTR [rip+0x5f7a9]        # 0x1800820f8
   18002294f:	8b 96 88 00 00 00    	mov    edx,DWORD PTR [rsi+0x88]
   180022955:	40 32 ed             	xor    bpl,bpl
   180022958:	b3 01                	mov    bl,0x1
   18002295a:	8b cf                	mov    ecx,edi
   18002295c:	85 d2                	test   edx,edx
   18002295e:	0f 84 e8 00 00 00    	je     0x180022a4c
   180022964:	4c 8b 46 30          	mov    r8,QWORD PTR [rsi+0x30]
   180022968:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   18002296f:	00 
   180022970:	44 8b c9             	mov    r9d,ecx
   180022973:	4b 8d 04 89          	lea    rax,[r9+r9*4]
   180022977:	48 03 c0             	add    rax,rax
   18002297a:	49 39 3c c0          	cmp    QWORD PTR [r8+rax*8],rdi
   18002297e:	74 08                	je     0x180022988
   180022980:	41 83 7c c0 08 01    	cmp    DWORD PTR [r8+rax*8+0x8],0x1
   180022986:	74 1c                	je     0x1800229a4
   180022988:	41 8b 44 c0 08       	mov    eax,DWORD PTR [r8+rax*8+0x8]
   18002298d:	83 e8 04             	sub    eax,0x4
   180022990:	0f b6 db             	movzx  ebx,bl
   180022993:	83 f8 01             	cmp    eax,0x1
   180022996:	0f 47 df             	cmova  ebx,edi
   180022999:	ff c1                	inc    ecx
   18002299b:	3b ca                	cmp    ecx,edx
   18002299d:	72 d1                	jb     0x180022970
   18002299f:	e9 a8 00 00 00       	jmp    0x180022a4c
   1800229a4:	8b 15 52 e7 08 00    	mov    edx,DWORD PTR [rip+0x8e752]        # 0x1800b10fc
   1800229aa:	85 d2                	test   edx,edx
   1800229ac:	74 3b                	je     0x1800229e9
   1800229ae:	4f 8d 1c 89          	lea    r11,[r9+r9*4]
   1800229b2:	49 8b c6             	mov    rax,r14
   1800229b5:	49 c1 e3 04          	shl    r11,0x4
   1800229b9:	44 8b d2             	mov    r10d,edx
   1800229bc:	4d 2b de             	sub    r11,r14
   1800229bf:	49 83 c3 10          	add    r11,0x10
   1800229c3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1800229c7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   1800229ce:	00 00 
   1800229d0:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1800229d3:	4d 8d 04 03          	lea    r8,[r11+rax*1]
   1800229d7:	48 8b 56 30          	mov    rdx,QWORD PTR [rsi+0x30]
   1800229db:	48 8d 40 08          	lea    rax,[rax+0x8]
   1800229df:	49 89 0c 10          	mov    QWORD PTR [r8+rdx*1],rcx
   1800229e3:	49 83 ea 01          	sub    r10,0x1
   1800229e7:	75 e7                	jne    0x1800229d0
   1800229e9:	48 8b 4e 30          	mov    rcx,QWORD PTR [rsi+0x30]
   1800229ed:	4b 8d 14 89          	lea    rdx,[r9+r9*4]
   1800229f1:	8b 46 28             	mov    eax,DWORD PTR [rsi+0x28]
   1800229f4:	48 03 d2             	add    rdx,rdx
   1800229f7:	40 b5 01             	mov    bpl,0x1
   1800229fa:	89 44 d1 2c          	mov    DWORD PTR [rcx+rdx*8+0x2c],eax
   1800229fe:	48 8b 46 30          	mov    rax,QWORD PTR [rsi+0x30]
   180022a02:	8b 4e 24             	mov    ecx,DWORD PTR [rsi+0x24]
   180022a05:	03 4e 28             	add    ecx,DWORD PTR [rsi+0x28]
   180022a08:	89 4c d0 30          	mov    DWORD PTR [rax+rdx*8+0x30],ecx
   180022a0c:	48 8b 46 30          	mov    rax,QWORD PTR [rsi+0x30]
   180022a10:	8b 4c 24 70          	mov    ecx,DWORD PTR [rsp+0x70]
   180022a14:	44 89 64 d0 34       	mov    DWORD PTR [rax+rdx*8+0x34],r12d
   180022a19:	48 8b 46 30          	mov    rax,QWORD PTR [rsi+0x30]
   180022a1d:	89 4c d0 38          	mov    DWORD PTR [rax+rdx*8+0x38],ecx
   180022a21:	48 8b 46 30          	mov    rax,QWORD PTR [rsi+0x30]
   180022a25:	0f b6 4c 24 78       	movzx  ecx,BYTE PTR [rsp+0x78]
   180022a2a:	44 89 7c d0 3c       	mov    DWORD PTR [rax+rdx*8+0x3c],r15d
   180022a2f:	48 8b 46 30          	mov    rax,QWORD PTR [rsi+0x30]
   180022a33:	44 89 6c d0 40       	mov    DWORD PTR [rax+rdx*8+0x40],r13d
   180022a38:	48 8b 46 30          	mov    rax,QWORD PTR [rsi+0x30]
   180022a3c:	88 4c d0 44          	mov    BYTE PTR [rax+rdx*8+0x44],cl
   180022a40:	48 8b 46 30          	mov    rax,QWORD PTR [rsi+0x30]
   180022a44:	c7 44 d0 08 02 00 00 	mov    DWORD PTR [rax+rdx*8+0x8],0x2
   180022a4b:	00 
   180022a4c:	48 8b 4e 50          	mov    rcx,QWORD PTR [rsi+0x50]
   180022a50:	ff 15 aa f6 05 00    	call   QWORD PTR [rip+0x5f6aa]        # 0x180082100
   180022a56:	40 84 ed             	test   bpl,bpl
   180022a59:	75 38                	jne    0x180022a93
   180022a5b:	84 db                	test   bl,bl
   180022a5d:	75 18                	jne    0x180022a77
   180022a5f:	b9 1e 00 00 00       	mov    ecx,0x1e
   180022a64:	ff 15 ae f6 05 00    	call   QWORD PTR [rip+0x5f6ae]        # 0x180082118
   180022a6a:	40 38 3d 3e 02 09 00 	cmp    BYTE PTR [rip+0x9023e],dil        # 0x1800b2caf
   180022a71:	0f 84 c9 fe ff ff    	je     0x180022940
   180022a77:	39 3d 7f e6 08 00    	cmp    DWORD PTR [rip+0x8e67f],edi        # 0x1800b10fc
   180022a7d:	76 14                	jbe    0x180022a93
   180022a7f:	90                   	nop
   180022a80:	49 8b 0c fe          	mov    rcx,QWORD PTR [r14+rdi*8]
   180022a84:	e8 0b 45 ff ff       	call   0x180016f94
   180022a89:	ff c7                	inc    edi
   180022a8b:	3b 3d 6b e6 08 00    	cmp    edi,DWORD PTR [rip+0x8e66b]        # 0x1800b10fc
   180022a91:	72 ed                	jb     0x180022a80
   180022a93:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   180022a98:	b0 01                	mov    al,0x1
   180022a9a:	48 8b 6c 24 58       	mov    rbp,QWORD PTR [rsp+0x58]
   180022a9f:	48 8b 74 24 60       	mov    rsi,QWORD PTR [rsp+0x60]
   180022aa4:	48 83 c4 20          	add    rsp,0x20
   180022aa8:	41 5f                	pop    r15
   180022aaa:	41 5e                	pop    r14
   180022aac:	41 5d                	pop    r13
   180022aae:	41 5c                	pop    r12
   180022ab0:	5f                   	pop    rdi
   180022ab1:	c3                   	ret
   180022ab2:	cc                   	int3
   180022ab3:	cc                   	int3
   180022ab4:	cc                   	int3
   180022ab5:	cc                   	int3
   180022ab6:	cc                   	int3
   180022ab7:	cc                   	int3
   180022ab8:	cc                   	int3
   180022ab9:	cc                   	int3
   180022aba:	cc                   	int3
   180022abb:	cc                   	int3
   180022abc:	cc                   	int3
   180022abd:	cc                   	int3
   180022abe:	cc                   	int3
   180022abf:	cc                   	int3
