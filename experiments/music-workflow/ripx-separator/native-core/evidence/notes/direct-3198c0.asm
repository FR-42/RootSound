
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403198c0 <.text+0x3188c0>:
   1403198c0:	80 f9 c0             	cmp    cl,0xc0
   1403198c3:	72 6e                	jb     0x140319933
   1403198c5:	0f b6 05 54 06 67 00 	movzx  eax,BYTE PTR [rip+0x670654]        # 0x140989f20
   1403198cc:	45 33 c0             	xor    r8d,r8d
   1403198cf:	84 c0                	test   al,al
   1403198d1:	74 60                	je     0x140319933
   1403198d3:	4c 8d 15 46 06 67 00 	lea    r10,[rip+0x670646]        # 0x140989f20
   1403198da:	4d 8b ca             	mov    r9,r10
   1403198dd:	0f 1f 00             	nop    DWORD PTR [rax]
   1403198e0:	3a c1                	cmp    al,cl
   1403198e2:	74 1b                	je     0x1403198ff
   1403198e4:	41 ff c0             	inc    r8d
   1403198e7:	41 8b c0             	mov    eax,r8d
   1403198ea:	48 c1 e0 04          	shl    rax,0x4
   1403198ee:	4e 8d 0c 10          	lea    r9,[rax+r10*1]
   1403198f2:	42 0f b6 04 10       	movzx  eax,BYTE PTR [rax+r10*1]
   1403198f7:	84 c0                	test   al,al
   1403198f9:	75 e5                	jne    0x1403198e0
   1403198fb:	0f 57 c0             	xorps  xmm0,xmm0
   1403198fe:	c3                   	ret
   1403198ff:	4d 85 c9             	test   r9,r9
   140319902:	74 2f                	je     0x140319933
   140319904:	f3 41 0f 10 59 08    	movss  xmm3,DWORD PTR [r9+0x8]
   14031990a:	8d 4a ff             	lea    ecx,[rdx-0x1]
   14031990d:	0f 28 c3             	movaps xmm0,xmm3
   140319910:	0f 57 c9             	xorps  xmm1,xmm1
   140319913:	f3 41 0f 5c 41 04    	subss  xmm0,DWORD PTR [r9+0x4]
   140319919:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   14031991e:	f3 41 0f 5e 41 0c    	divss  xmm0,DWORD PTR [r9+0xc]
   140319924:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140319928:	f3 41 0f 58 41 04    	addss  xmm0,DWORD PTR [r9+0x4]
   14031992e:	0f 2f d8             	comiss xmm3,xmm0
   140319931:	77 03                	ja     0x140319936
   140319933:	0f 57 c0             	xorps  xmm0,xmm0
   140319936:	c3                   	ret
   140319937:	cc                   	int3
   140319938:	cc                   	int3
   140319939:	cc                   	int3
   14031993a:	cc                   	int3
   14031993b:	cc                   	int3
   14031993c:	cc                   	int3
   14031993d:	cc                   	int3
   14031993e:	cc                   	int3
   14031993f:	cc                   	int3
   140319940:	48 8b c4             	mov    rax,rsp
   140319943:	53                   	push   rbx
   140319944:	55                   	push   rbp
   140319945:	56                   	push   rsi
   140319946:	57                   	push   rdi
   140319947:	41 54                	push   r12
   140319949:	41 55                	push   r13
   14031994b:	41 56                	push   r14
   14031994d:	41 57                	push   r15
   14031994f:	48 81 ec 28 03 00 00 	sub    rsp,0x328
   140319956:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   14031995a:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   14031995e:	44 0f 29 40 88       	movaps XMMWORD PTR [rax-0x78],xmm8
   140319963:	48 8b 05 fe 87 65 00 	mov    rax,QWORD PTR [rip+0x6587fe]        # 0x140972168
   14031996a:	48 33 c4             	xor    rax,rsp
   14031996d:	48 89 84 24 a0 02 00 	mov    QWORD PTR [rsp+0x2a0],rax
   140319974:	00 
   140319975:	48 63 9c 24 90 03 00 	movsxd rbx,DWORD PTR [rsp+0x390]
   14031997c:	00 
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
   140319a1f:	0f                   	.byte 0xf
