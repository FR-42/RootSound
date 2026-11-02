
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014037b830 <.text+0x37a830>:
   14037b830:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14037b835:	88 54 24 10          	mov    BYTE PTR [rsp+0x10],dl
   14037b839:	55                   	push   rbp
   14037b83a:	56                   	push   rsi
   14037b83b:	57                   	push   rdi
   14037b83c:	41 54                	push   r12
   14037b83e:	41 55                	push   r13
   14037b840:	41 56                	push   r14
   14037b842:	41 57                	push   r15
   14037b844:	48 81 ec 80 00 00 00 	sub    rsp,0x80
   14037b84b:	49 63 f1             	movsxd rsi,r9d
   14037b84e:	45 8b f0             	mov    r14d,r8d
   14037b851:	44 0f b6 ea          	movzx  r13d,dl
   14037b855:	45 85 c0             	test   r8d,r8d
   14037b858:	79 10                	jns    0x14037b86a
   14037b85a:	44 8b 35 4f e9 60 00 	mov    r14d,DWORD PTR [rip+0x60e94f]        # 0x14098a1b0
   14037b861:	45 85 f6             	test   r14d,r14d
   14037b864:	0f 88 11 03 00 00    	js     0x14037bb7b
   14037b86a:	44 3b 35 5f 55 63 14 	cmp    r14d,DWORD PTR [rip+0x1463555f]        # 0x1549b0dd0
   14037b871:	0f 8d 04 03 00 00    	jge    0x14037bb7b
   14037b877:	33 c0                	xor    eax,eax
   14037b879:	81 f9 ff ff 00 00    	cmp    ecx,0xffff
   14037b87f:	8b e8                	mov    ebp,eax
   14037b881:	8b d8                	mov    ebx,eax
   14037b883:	0f 45 e9             	cmovne ebp,ecx
   14037b886:	89 ac 24 d0 00 00 00 	mov    DWORD PTR [rsp+0xd0],ebp
   14037b88d:	81 fd 00 04 00 00    	cmp    ebp,0x400
   14037b893:	0f 83 dd 02 00 00    	jae    0x14037bb76
   14037b899:	4c 8d 24 ed 00 00 00 	lea    r12,[rbp*8+0x0]
   14037b8a0:	00 
   14037b8a1:	4c 03 e5             	add    r12,rbp
   14037b8a4:	4c 8d 3d 55 47 c8 ff 	lea    r15,[rip+0xffffffffffc84755]        # 0x140000000
   14037b8ab:	4b 8b bc e7 80 a7 f2 	mov    rdi,QWORD PTR [r15+r12*8+0x14f2a780]
   14037b8b2:	14 
   14037b8b3:	48 85 ff             	test   rdi,rdi
   14037b8b6:	0f 84 ba 02 00 00    	je     0x14037bb76
   14037b8bc:	41 8b d6             	mov    edx,r14d
   14037b8bf:	8b cd                	mov    ecx,ebp
   14037b8c1:	e8 6a 26 00 00       	call   0x14037df30
   14037b8c6:	48 8b d8             	mov    rbx,rax
   14037b8c9:	48 85 c0             	test   rax,rax
   14037b8cc:	0f 85 73 02 00 00    	jne    0x14037bb45
   14037b8d2:	49 63 c6             	movsxd rax,r14d
   14037b8d5:	b9 00 02 00 00       	mov    ecx,0x200
   14037b8da:	48 69 d8 78 ab 06 00 	imul   rbx,rax,0x6ab78
   14037b8e1:	48 89 5c 24 60       	mov    QWORD PTR [rsp+0x60],rbx
   14037b8e6:	42 0f b7 84 3b 30 e7 	movzx  eax,WORD PTR [rbx+r15*1+0x9ee730]
   14037b8ed:	9e 00 
   14037b8ef:	66 3b c1             	cmp    ax,cx
   14037b8f2:	0f 83 83 02 00 00    	jae    0x14037bb7b
   14037b8f8:	0f 29 74 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm6
   14037b8fd:	41 bf 02 00 00 00    	mov    r15d,0x2
   14037b903:	45 84 ed             	test   r13b,r13b
   14037b906:	74 22                	je     0x14037b92a
   14037b908:	41 8b cf             	mov    ecx,r15d
   14037b90b:	e8 70 7c 1f 00       	call   0x140573580
   14037b910:	4c 8d 2d e9 46 c8 ff 	lea    r13,[rip+0xffffffffffc846e9]        # 0x140000000
   14037b917:	42 0f b7 84 2b 30 e7 	movzx  eax,WORD PTR [rbx+r13*1+0x9ee730]
   14037b91e:	9e 00 
   14037b920:	4b 8b bc e5 80 a7 f2 	mov    rdi,QWORD PTR [r13+r12*8+0x14f2a780]
   14037b927:	14 
   14037b928:	eb 07                	jmp    0x14037b931
   14037b92a:	4c 8d 2d cf 46 c8 ff 	lea    r13,[rip+0xffffffffffc846cf]        # 0x140000000
   14037b931:	0f b7 c0             	movzx  eax,ax
   14037b934:	33 d2                	xor    edx,edx
   14037b936:	48 69 c8 58 01 00 00 	imul   rcx,rax,0x158
   14037b93d:	41 b8 58 01 00 00    	mov    r8d,0x158
   14037b943:	48 8d 89 30 37 9c 00 	lea    rcx,[rcx+0x9c3730]
   14037b94a:	48 03 d9             	add    rbx,rcx
   14037b94d:	49 03 dd             	add    rbx,r13
   14037b950:	48 8b cb             	mov    rcx,rbx
   14037b953:	e8 92 53 2a 00       	call   0x140620cea
   14037b958:	43 8b 84 e5 94 a7 f2 	mov    eax,DWORD PTR [r13+r12*8+0x14f2a794]
   14037b95f:	14 
   14037b960:	48 8b cb             	mov    rcx,rbx
   14037b963:	89 43 0c             	mov    DWORD PTR [rbx+0xc],eax
   14037b966:	48 2b cf             	sub    rcx,rdi
   14037b969:	43 8b 84 e5 88 a7 f2 	mov    eax,DWORD PTR [r13+r12*8+0x14f2a788]
   14037b970:	14 
   14037b971:	89 83 10 01 00 00    	mov    DWORD PTR [rbx+0x110],eax
   14037b977:	43 8b 84 e5 8c a7 f2 	mov    eax,DWORD PTR [r13+r12*8+0x14f2a78c]
   14037b97e:	14 
   14037b97f:	89 83 14 01 00 00    	mov    DWORD PTR [rbx+0x114],eax
   14037b985:	43 8b 84 e5 90 a7 f2 	mov    eax,DWORD PTR [r13+r12*8+0x14f2a790]
   14037b98c:	14 
   14037b98d:	89 83 18 01 00 00    	mov    DWORD PTR [rbx+0x118],eax
   14037b993:	66 89 2b             	mov    WORD PTR [rbx],bp
   14037b996:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14037b99d:	00 00 00 
   14037b9a0:	0f b7 07             	movzx  eax,WORD PTR [rdi]
   14037b9a3:	66 89 44 39 10       	mov    WORD PTR [rcx+rdi*1+0x10],ax
   14037b9a8:	48 8d 7f 02          	lea    rdi,[rdi+0x2]
   14037b9ac:	66 85 c0             	test   ax,ax
   14037b9af:	75 ef                	jne    0x14037b9a0
   14037b9b1:	85 f6                	test   esi,esi
   14037b9b3:	0f 88 80 00 00 00    	js     0x14037ba39
   14037b9b9:	3b 35 11 54 63 14    	cmp    esi,DWORD PTR [rip+0x14635411]        # 0x1549b0dd0
   14037b9bf:	7d 78                	jge    0x14037ba39
   14037b9c1:	4c 69 c6 78 ab 06 00 	imul   r8,rsi,0x6ab78
   14037b9c8:	33 d2                	xor    edx,edx
   14037b9ca:	0f b7 ca             	movzx  ecx,dx
   14037b9cd:	47 0f b7 8c 28 30 e7 	movzx  r9d,WORD PTR [r8+r13*1+0x9ee730]
   14037b9d4:	9e 00 
   14037b9d6:	66 41 3b d1          	cmp    dx,r9w
   14037b9da:	73 5d                	jae    0x14037ba39
   14037b9dc:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14037b9e0:	0f b7 d1             	movzx  edx,cx
   14037b9e3:	48 69 c2 58 01 00 00 	imul   rax,rdx,0x158
   14037b9ea:	49 03 c0             	add    rax,r8
   14037b9ed:	42 0f b7 84 28 30 37 	movzx  eax,WORD PTR [rax+r13*1+0x9c3730]
   14037b9f4:	9c 00 
   14037b9f6:	3b c5                	cmp    eax,ebp
   14037b9f8:	74 0b                	je     0x14037ba05
   14037b9fa:	66 ff c1             	inc    cx
   14037b9fd:	66 41 3b c9          	cmp    cx,r9w
   14037ba01:	72 dd                	jb     0x14037b9e0
   14037ba03:	eb 34                	jmp    0x14037ba39
   14037ba05:	48 69 ca 58 01 00 00 	imul   rcx,rdx,0x158
   14037ba0c:	49 03 c8             	add    rcx,r8
   14037ba0f:	42 8b 84 29 40 38 9c 	mov    eax,DWORD PTR [rcx+r13*1+0x9c3840]
   14037ba16:	00 
   14037ba17:	89 83 10 01 00 00    	mov    DWORD PTR [rbx+0x110],eax
   14037ba1d:	42 8b 84 29 44 38 9c 	mov    eax,DWORD PTR [rcx+r13*1+0x9c3844]
   14037ba24:	00 
   14037ba25:	89 83 14 01 00 00    	mov    DWORD PTR [rbx+0x114],eax
   14037ba2b:	42 8b 84 29 48 38 9c 	mov    eax,DWORD PTR [rcx+r13*1+0x9c3848]
   14037ba32:	00 
   14037ba33:	89 83 18 01 00 00    	mov    DWORD PTR [rbx+0x118],eax
   14037ba39:	48 8b cb             	mov    rcx,rbx
   14037ba3c:	e8 bf 30 00 00       	call   0x14037eb00
   14037ba41:	43 8b 84 e5 c0 a7 f2 	mov    eax,DWORD PTR [r13+r12*8+0x14f2a7c0]
   14037ba48:	14 
   14037ba49:	33 ed                	xor    ebp,ebp
   14037ba4b:	f3 0f 10 35 9d 48 4d 	movss  xmm6,DWORD PTR [rip+0x4d489d]        # 0x1408502f0
   14037ba52:	00 
   14037ba53:	4f 8d 6c e5 00       	lea    r13,[r13+r12*8+0x0]
   14037ba58:	89 83 38 01 00 00    	mov    DWORD PTR [rbx+0x138],eax
   14037ba5e:	4e 8d 24 e5 a8 a7 f2 	lea    r12,[r12*8+0x14f2a7a8]
   14037ba65:	14 
   14037ba66:	48 8d 05 93 45 c8 ff 	lea    rax,[rip+0xffffffffffc84593]        # 0x140000000
   14037ba6d:	8b f5                	mov    esi,ebp
   14037ba6f:	4c 03 e0             	add    r12,rax
   14037ba72:	4d 8d ad b8 a7 f2 14 	lea    r13,[r13+0x14f2a7b8]
   14037ba79:	8b fd                	mov    edi,ebp
   14037ba7b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14037ba80:	46 0f b7 04 2f       	movzx  r8d,WORD PTR [rdi+r13*1]
   14037ba85:	48 8d 87 34 01 00 00 	lea    rax,[rdi+0x134]
   14037ba8c:	f3 0f 11 74 24 50    	movss  DWORD PTR [rsp+0x50],xmm6
   14037ba92:	48 8d 8f 30 01 00 00 	lea    rcx,[rdi+0x130]
   14037ba99:	f3 0f 11 74 24 48    	movss  DWORD PTR [rsp+0x48],xmm6
   14037ba9f:	4c 8d 8e 20 01 00 00 	lea    r9,[rsi+0x120]
   14037baa6:	40 88 6c 24 40       	mov    BYTE PTR [rsp+0x40],bpl
   14037baab:	48 03 cb             	add    rcx,rbx
   14037baae:	c7 44 24 38 01 00 00 	mov    DWORD PTR [rsp+0x38],0x1
   14037bab5:	00 
   14037bab6:	48 03 c3             	add    rax,rbx
   14037bab9:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   14037babe:	4c 03 cb             	add    r9,rbx
   14037bac1:	48 89 4c 24 28       	mov    QWORD PTR [rsp+0x28],rcx
   14037bac6:	33 d2                	xor    edx,edx
   14037bac8:	49 8b 0c 34          	mov    rcx,QWORD PTR [r12+rsi*1]
   14037bacc:	48 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],rbp
   14037bad1:	e8 1a 05 f0 ff       	call   0x14027bff0
   14037bad6:	48 8d 7f 02          	lea    rdi,[rdi+0x2]
   14037bada:	48 8d 76 08          	lea    rsi,[rsi+0x8]
   14037bade:	49 83 ef 01          	sub    r15,0x1
   14037bae2:	75 9c                	jne    0x14037ba80
   14037bae4:	48 8b 44 24 60       	mov    rax,QWORD PTR [rsp+0x60]
   14037bae9:	48 8d 0d 10 45 c8 ff 	lea    rcx,[rip+0xffffffffffc84510]        # 0x140000000
   14037baf0:	66 ff 84 08 30 e7 9e 	inc    WORD PTR [rax+rcx*1+0x9ee730]
   14037baf7:	00 
   14037baf8:	41 8b ce             	mov    ecx,r14d
   14037bafb:	e8 30 11 00 00       	call   0x14037cc30
   14037bb00:	0f 28 74 24 70       	movaps xmm6,XMMWORD PTR [rsp+0x70]
   14037bb05:	8b ac 24 d0 00 00 00 	mov    ebp,DWORD PTR [rsp+0xd0]
   14037bb0c:	84 c0                	test   al,al
   14037bb0e:	74 0d                	je     0x14037bb1d
