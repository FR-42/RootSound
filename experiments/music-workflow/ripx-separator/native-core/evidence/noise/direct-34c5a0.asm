
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014034c5a0 <.text+0x34b5a0>:
   14034c5a0:	48 8b c4             	mov    rax,rsp
   14034c5a3:	66 44 89 48 20       	mov    WORD PTR [rax+0x20],r9w
   14034c5a8:	4c 89 40 18          	mov    QWORD PTR [rax+0x18],r8
   14034c5ac:	48 89 50 10          	mov    QWORD PTR [rax+0x10],rdx
   14034c5b0:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14034c5b4:	55                   	push   rbp
   14034c5b5:	53                   	push   rbx
   14034c5b6:	56                   	push   rsi
   14034c5b7:	57                   	push   rdi
   14034c5b8:	41 54                	push   r12
   14034c5ba:	41 55                	push   r13
   14034c5bc:	41 56                	push   r14
   14034c5be:	41 57                	push   r15
   14034c5c0:	48 8d 6c 24 a8       	lea    rbp,[rsp-0x58]
   14034c5c5:	48 81 ec 68 01 00 00 	sub    rsp,0x168
   14034c5cc:	48 8b 9d c0 00 00 00 	mov    rbx,QWORD PTR [rbp+0xc0]
   14034c5d3:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   14034c5d7:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   14034c5db:	44 0f 29 40 88       	movaps XMMWORD PTR [rax-0x78],xmm8
   14034c5e0:	0f b7 7b 10          	movzx  edi,WORD PTR [rbx+0x10]
   14034c5e4:	0f b7 73 12          	movzx  esi,WORD PTR [rbx+0x12]
   14034c5e8:	44 0f 29 88 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm9
   14034c5ef:	ff 
   14034c5f0:	44 0f 29 90 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm10
   14034c5f7:	ff 
   14034c5f8:	b8 04 00 00 00       	mov    eax,0x4
   14034c5fd:	41 0f b7 c9          	movzx  ecx,r9w
   14034c601:	48 f7 e1             	mul    rcx
   14034c604:	48 89 4d b8          	mov    QWORD PTR [rbp-0x48],rcx
   14034c608:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   14034c60f:	66 89 7d 8a          	mov    WORD PTR [rbp-0x76],di
   14034c613:	48 0f 40 c1          	cmovo  rax,rcx
   14034c617:	66 89 75 8c          	mov    WORD PTR [rbp-0x74],si
   14034c61b:	48 8b c8             	mov    rcx,rax
   14034c61e:	e8 3d ef 2c 00       	call   0x14061b560
   14034c623:	f3 44 0f 10 0d 88 ab 	movss  xmm9,DWORD PTR [rip+0x34ab88]        # 0x1406971b4
   14034c62a:	34 00 
   14034c62c:	41 bd 01 00 00 00    	mov    r13d,0x1
   14034c632:	f3 0f 10 35 f6 39 50 	movss  xmm6,DWORD PTR [rip+0x5039f6]        # 0x140850030
   14034c639:	00 
   14034c63a:	45 33 db             	xor    r11d,r11d
   14034c63d:	f3 0f 10 7d 98       	movss  xmm7,DWORD PTR [rbp-0x68]
   14034c642:	45 0f 57 d2          	xorps  xmm10,xmm10
   14034c646:	44 0f b7 75 80       	movzx  r14d,WORD PTR [rbp-0x80]
   14034c64b:	44 89 6d a0          	mov    DWORD PTR [rbp-0x60],r13d
   14034c64f:	48 89 45 c0          	mov    QWORD PTR [rbp-0x40],rax
   14034c653:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14034c657:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14034c65e:	00 00 
   14034c660:	4c 8b 95 a8 00 00 00 	mov    r10,QWORD PTR [rbp+0xa8]
   14034c667:	0f b7 43 14          	movzx  eax,WORD PTR [rbx+0x14]
   14034c66b:	41 3b 42 0c          	cmp    eax,DWORD PTR [r10+0xc]
   14034c66f:	73 26                	jae    0x14034c697
   14034c671:	41 83 fd 01          	cmp    r13d,0x1
   14034c675:	0f 85 a7 07 00 00    	jne    0x14034ce22
   14034c67b:	44 0f b7 43 22       	movzx  r8d,WORD PTR [rbx+0x22]
   14034c680:	0f b7 53 24          	movzx  edx,WORD PTR [rbx+0x24]
   14034c684:	44 0f b7 4b 26       	movzx  r9d,WORD PTR [rbx+0x26]
   14034c689:	c7 43 22 00 00 00 00 	mov    DWORD PTR [rbx+0x22],0x0
   14034c690:	66 44 89 5b 26       	mov    WORD PTR [rbx+0x26],r11w
   14034c695:	eb 0c                	jmp    0x14034c6a3
   14034c697:	44 0f b7 4b 1a       	movzx  r9d,WORD PTR [rbx+0x1a]
   14034c69c:	44 0f b7 c7          	movzx  r8d,di
   14034c6a0:	0f b7 d6             	movzx  edx,si
   14034c6a3:	44 0f b7 63 18       	movzx  r12d,WORD PTR [rbx+0x18]
   14034c6a8:	41 8b f3             	mov    esi,r11d
   14034c6ab:	44 8b bd c8 00 00 00 	mov    r15d,DWORD PTR [rbp+0xc8]
   14034c6b2:	40 b7 01             	mov    dil,0x1
   14034c6b5:	48 8b 4b 08          	mov    rcx,QWORD PTR [rbx+0x8]
   14034c6b9:	45 3b fc             	cmp    r15d,r12d
   14034c6bc:	41 8b c7             	mov    eax,r15d
   14034c6bf:	66 44 89 4d 90       	mov    WORD PTR [rbp-0x70],r9w
   14034c6c4:	41 0f 4c c4          	cmovl  eax,r12d
   14034c6c8:	66 44 89 4d 94       	mov    WORD PTR [rbp-0x6c],r9w
   14034c6cd:	45 85 ed             	test   r13d,r13d
   14034c6d0:	66 89 55 92          	mov    WORD PTR [rbp-0x6e],dx
   14034c6d4:	66 44 89 45 88       	mov    WORD PTR [rbp-0x78],r8w
   14034c6d9:	45 0f 28 c2          	movaps xmm8,xmm10
   14034c6dd:	40 0f 9f c6          	setg   sil
   14034c6e1:	44 89 65 9c          	mov    DWORD PTR [rbp-0x64],r12d
   14034c6e5:	ff ce                	dec    esi
   14034c6e7:	c7 45 a4 00 00 00 00 	mov    DWORD PTR [rbp-0x5c],0x0
   14034c6ee:	03 f0                	add    esi,eax
   14034c6f0:	48 89 4d b0          	mov    QWORD PTR [rbp-0x50],rcx
   14034c6f4:	40 88 7d 8e          	mov    BYTE PTR [rbp-0x72],dil
   14034c6f8:	44 0f b6 cf          	movzx  r9d,dil
   14034c6fc:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14034c700:	41 8b c3             	mov    eax,r11d
   14034c703:	45 85 ed             	test   r13d,r13d
   14034c706:	7e 0b                	jle    0x14034c713
   14034c708:	3b b5 d0 00 00 00    	cmp    esi,DWORD PTR [rbp+0xd0]
   14034c70e:	0f 9e c0             	setle  al
   14034c711:	eb 06                	jmp    0x14034c719
   14034c713:	41 3b f7             	cmp    esi,r15d
   14034c716:	0f 9d c0             	setge  al
   14034c719:	85 c0                	test   eax,eax
   14034c71b:	0f 84 ae 05 00 00    	je     0x14034cccf
   14034c721:	45 84 c9             	test   r9b,r9b
   14034c724:	0f 84 89 00 00 00    	je     0x14034c7b3
   14034c72a:	48 89 5c 24 78       	mov    QWORD PTR [rsp+0x78],rbx
   14034c72f:	48 8d 45 98          	lea    rax,[rbp-0x68]
   14034c733:	44 89 7c 24 70       	mov    DWORD PTR [rsp+0x70],r15d
   14034c738:	44 8b ce             	mov    r9d,esi
   14034c73b:	c6 44 24 68 01       	mov    BYTE PTR [rsp+0x68],0x1
   14034c740:	66 89 54 24 60       	mov    WORD PTR [rsp+0x60],dx
   14034c745:	49 8b d2             	mov    rdx,r10
   14034c748:	66 44 89 44 24 58    	mov    WORD PTR [rsp+0x58],r8w
   14034c74e:	4c 8d 45 94          	lea    r8,[rbp-0x6c]
   14034c752:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax
   14034c757:	48 8d 45 80          	lea    rax,[rbp-0x80]
   14034c75b:	48 89 44 24 48       	mov    QWORD PTR [rsp+0x48],rax
   14034c760:	48 8d 45 84          	lea    rax,[rbp-0x7c]
   14034c764:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   14034c769:	0f b7 85 b8 00 00 00 	movzx  eax,WORD PTR [rbp+0xb8]
   14034c770:	48 89 4c 24 38       	mov    QWORD PTR [rsp+0x38],rcx
   14034c775:	48 8b 8d a0 00 00 00 	mov    rcx,QWORD PTR [rbp+0xa0]
   14034c77c:	66 89 44 24 30       	mov    WORD PTR [rsp+0x30],ax
   14034c781:	48 8b 85 b0 00 00 00 	mov    rax,QWORD PTR [rbp+0xb0]
   14034c788:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14034c78d:	44 89 64 24 20       	mov    DWORD PTR [rsp+0x20],r12d
   14034c792:	e8 89 f8 ff ff       	call   0x14034c020
   14034c797:	84 c0                	test   al,al
   14034c799:	0f 84 1c 05 00 00    	je     0x14034ccbb
   14034c79f:	44 0f b7 4d 94       	movzx  r9d,WORD PTR [rbp-0x6c]
   14034c7a4:	f3 0f 10 7d 98       	movss  xmm7,DWORD PTR [rbp-0x68]
   14034c7a9:	44 0f b7 75 80       	movzx  r14d,WORD PTR [rbp-0x80]
   14034c7ae:	66 44 89 4d 90       	mov    WORD PTR [rbp-0x70],r9w
   14034c7b3:	41 3b f4             	cmp    esi,r12d
   14034c7b6:	c6 45 8f 01          	mov    BYTE PTR [rbp-0x71],0x1
   14034c7ba:	44 0f b7 65 84       	movzx  r12d,WORD PTR [rbp-0x7c]
   14034c7bf:	75 0a                	jne    0x14034c7cb
   14034c7c1:	66 44 89 65 8a       	mov    WORD PTR [rbp-0x76],r12w
   14034c7c6:	66 44 89 75 8c       	mov    WORD PTR [rbp-0x74],r14w
   14034c7cb:	40 84 ff             	test   dil,dil
   14034c7ce:	75 38                	jne    0x14034c808
   14034c7d0:	b9 f6 ff ff ff       	mov    ecx,0xfffffff6
   14034c7d5:	e8 66 45 f5 ff       	call   0x1402a0d40
   14034c7da:	f3 0f 59 43 1c       	mulss  xmm0,DWORD PTR [rbx+0x1c]
   14034c7df:	0f 2f c7             	comiss xmm0,xmm7
   14034c7e2:	76 24                	jbe    0x14034c808
   14034c7e4:	48 8b 85 a0 00 00 00 	mov    rax,QWORD PTR [rbp+0xa0]
   14034c7eb:	66 83 78 14 00       	cmp    WORD PTR [rax+0x14],0x0
   14034c7f0:	0f 84 cf 04 00 00    	je     0x14034ccc5
   14034c7f6:	0f 28 c7             	movaps xmm0,xmm7
   14034c7f9:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   14034c7fe:	44 0f 2f c8          	comiss xmm9,xmm0
   14034c802:	0f 83 bd 04 00 00    	jae    0x14034ccc5
   14034c808:	44 0f b7 8d b8 00 00 	movzx  r9d,WORD PTR [rbp+0xb8]
   14034c80f:	00 
   14034c810:	33 c0                	xor    eax,eax
   14034c812:	4c 8b 85 b0 00 00 00 	mov    r8,QWORD PTR [rbp+0xb0]
   14034c819:	0f 28 c7             	movaps xmm0,xmm7
   14034c81c:	48 8b 95 a8 00 00 00 	mov    rdx,QWORD PTR [rbp+0xa8]
   14034c823:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   14034c828:	48 8b 8d a0 00 00 00 	mov    rcx,QWORD PTR [rbp+0xa0]
   14034c82f:	48 89 45 c8          	mov    QWORD PTR [rbp-0x38],rax
   14034c833:	48 89 45 d0          	mov    QWORD PTR [rbp-0x30],rax
   14034c837:	48 89 45 d8          	mov    QWORD PTR [rbp-0x28],rax
   14034c83b:	48 89 45 e0          	mov    QWORD PTR [rbp-0x20],rax
   14034c83f:	48 89 45 e8          	mov    QWORD PTR [rbp-0x18],rax
   14034c843:	48 89 45 f0          	mov    QWORD PTR [rbp-0x10],rax
   14034c847:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
   14034c84b:	8b 85 d0 00 00 00    	mov    eax,DWORD PTR [rbp+0xd0]
   14034c851:	89 84 24 80 00 00 00 	mov    DWORD PTR [rsp+0x80],eax
   14034c858:	48 8d 45 8e          	lea    rax,[rbp-0x72]
   14034c85c:	44 89 7c 24 78       	mov    DWORD PTR [rsp+0x78],r15d
   14034c861:	48 89 44 24 70       	mov    QWORD PTR [rsp+0x70],rax
   14034c866:	48 8d 45 a4          	lea    rax,[rbp-0x5c]
   14034c86a:	48 89 44 24 68       	mov    QWORD PTR [rsp+0x68],rax
   14034c86f:	48 8d 45 c8          	lea    rax,[rbp-0x38]
   14034c873:	f3 0f 11 44 24 60    	movss  DWORD PTR [rsp+0x60],xmm0
   14034c879:	48 89 44 24 58       	mov    QWORD PTR [rsp+0x58],rax
   14034c87e:	8b 45 9c             	mov    eax,DWORD PTR [rbp-0x64]
   14034c881:	c6 44 24 50 01       	mov    BYTE PTR [rsp+0x50],0x1
   14034c886:	44 89 6c 24 48       	mov    DWORD PTR [rsp+0x48],r13d
   14034c88b:	89 74 24 40          	mov    DWORD PTR [rsp+0x40],esi
   14034c88f:	89 44 24 38          	mov    DWORD PTR [rsp+0x38],eax
   14034c893:	0f b7 45 90          	movzx  eax,WORD PTR [rbp-0x70]
   14034c897:	66 89 44 24 30       	mov    WORD PTR [rsp+0x30],ax
   14034c89c:	48 8b 45 c0          	mov    rax,QWORD PTR [rbp-0x40]
   14034c8a0:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14034c8a5:	48 8b 45 b0          	mov    rax,QWORD PTR [rbp-0x50]
   14034c8a9:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14034c8ae:	e8 fd f9 ff ff       	call   0x14034c2b0
   14034c8b3:	b9 07 00 00 00       	mov    ecx,0x7
   14034c8b8:	8b f8                	mov    edi,eax
   14034c8ba:	e8 a1 4d 00 00       	call   0x140351660
   14034c8bf:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   14034c8c4:	0f 2f 45 e4          	comiss xmm0,DWORD PTR [rbp-0x1c]
   14034c8c8:	76 09                	jbe    0x14034c8d3
   14034c8ca:	48 c7 c7 ff ff ff ff 	mov    rdi,0xffffffffffffffff
   14034c8d1:	eb 05                	jmp    0x14034c8d8
   14034c8d3:	83 ff ff             	cmp    edi,0xffffffff
   14034c8d6:	75 18                	jne    0x14034c8f0
   14034c8d8:	44 0f b7 55 80       	movzx  r10d,WORD PTR [rbp-0x80]
   14034c8dd:	44 0f 28 c7          	movaps xmm8,xmm7
   14034c8e1:	66 44 89 55 92       	mov    WORD PTR [rbp-0x6e],r10w
   14034c8e6:	66 44 89 65 88       	mov    WORD PTR [rbp-0x78],r12w
   14034c8eb:	e9 c2 00 00 00       	jmp    0x14034c9b2
   14034c8f0:	41 8b c7             	mov    eax,r15d
   14034c8f3:	46 8d 0c 2f          	lea    r9d,[rdi+r13*1]
   14034c8f7:	2b 05 e7 d6 63 00    	sub    eax,DWORD PTR [rip+0x63d6e7]        # 0x140989fe4
   14034c8fd:	44 3b c8             	cmp    r9d,eax
   14034c900:	0f 8c bf 03 00 00    	jl     0x14034ccc5
   14034c906:	44 3b 8d d0 00 00 00 	cmp    r9d,DWORD PTR [rbp+0xd0]
   14034c90d:	0f 8f b2 03 00 00    	jg     0x14034ccc5
   14034c913:	0f b7 45 92          	movzx  eax,WORD PTR [rbp-0x6e]
   14034c917:	4c 8d 45 94          	lea    r8,[rbp-0x6c]
   14034c91b:	48 8b 95 a8 00 00 00 	mov    rdx,QWORD PTR [rbp+0xa8]
   14034c922:	48 8b 8d a0 00 00 00 	mov    rcx,QWORD PTR [rbp+0xa0]
   14034c929:	48 89 5c 24 78       	mov    QWORD PTR [rsp+0x78],rbx
   14034c92e:	44 89 7c 24 70       	mov    DWORD PTR [rsp+0x70],r15d
   14034c933:	c6 44 24 68 01       	mov    BYTE PTR [rsp+0x68],0x1
   14034c938:	66 89 44 24 60       	mov    WORD PTR [rsp+0x60],ax
   14034c93d:	0f b7 45 88          	movzx  eax,WORD PTR [rbp-0x78]
   14034c941:	66 89 44 24 58       	mov    WORD PTR [rsp+0x58],ax
   14034c946:	48 8d 45 98          	lea    rax,[rbp-0x68]
   14034c94a:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax
   14034c94f:	48 8d 45 80          	lea    rax,[rbp-0x80]
   14034c953:	48 89 44 24 48       	mov    QWORD PTR [rsp+0x48],rax
   14034c958:	48 8d 45 84          	lea    rax,[rbp-0x7c]
   14034c95c:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   14034c961:	48 8b 45 b0          	mov    rax,QWORD PTR [rbp-0x50]
   14034c965:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   14034c96a:	0f b7 85 b8 00 00 00 	movzx  eax,WORD PTR [rbp+0xb8]
   14034c971:	66 89 44 24 30       	mov    WORD PTR [rsp+0x30],ax
   14034c976:	48 8b 85 b0 00 00 00 	mov    rax,QWORD PTR [rbp+0xb0]
   14034c97d:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14034c982:	8b 45 9c             	mov    eax,DWORD PTR [rbp-0x64]
   14034c985:	89 44 24 20          	mov    DWORD PTR [rsp+0x20],eax
   14034c989:	e8 92 f6 ff ff       	call   0x14034c020
   14034c98e:	84 c0                	test   al,al
   14034c990:	0f 84 25 03 00 00    	je     0x14034ccbb
   14034c996:	f3 0f 10 7d 98       	movss  xmm7,DWORD PTR [rbp-0x68]
   14034c99b:	32 c0                	xor    al,al
   14034c99d:	44 0f b7 55 80       	movzx  r10d,WORD PTR [rbp-0x80]
   14034c9a2:	44 0f b7 65 84       	movzx  r12d,WORD PTR [rbp-0x7c]
   14034c9a7:	88 45 8f             	mov    BYTE PTR [rbp-0x71],al
   14034c9aa:	0f b7 45 94          	movzx  eax,WORD PTR [rbp-0x6c]
   14034c9ae:	66 89 45 90          	mov    WORD PTR [rbp-0x70],ax
   14034c9b2:	83 ff ff             	cmp    edi,0xffffffff
   14034c9b5:	44 8b f7             	mov    r14d,edi
   14034c9b8:	45 0f b7 dc          	movzx  r11d,r12w
   14034c9bc:	44 0f 44 f6          	cmove  r14d,esi
   14034c9c0:	66 45 3b e2          	cmp    r12w,r10w
   14034c9c4:	0f 87 d0 01 00 00    	ja     0x14034cb9a
   14034c9ca:	8b 15 14 d6 63 00    	mov    edx,DWORD PTR [rip+0x63d614]        # 0x140989fe4
   14034c9d0:	44 8b e7             	mov    r12d,edi
   14034c9d3:	44 2b e6             	sub    r12d,esi
   14034c9d6:	b8 01 00 00 00       	mov    eax,0x1
   14034c9db:	2b c7                	sub    eax,edi
   14034c9dd:	89 45 a8             	mov    DWORD PTR [rbp-0x58],eax
   14034c9e0:	45 8d 4c 24 01       	lea    r9d,[r12+0x1]
   14034c9e5:	41 0f 28 e2          	movaps xmm4,xmm10
   14034c9e9:	41 0f 28 da          	movaps xmm3,xmm10
   14034c9ed:	83 ff ff             	cmp    edi,0xffffffff
   14034c9f0:	0f 84 90 00 00 00    	je     0x14034ca86
   14034c9f6:	8b 8d d0 00 00 00    	mov    ecx,DWORD PTR [rbp+0xd0]
   14034c9fc:	45 8b c7             	mov    r8d,r15d
   14034c9ff:	4c 8b 95 b0 00 00 00 	mov    r10,QWORD PTR [rbp+0xb0]
   14034ca06:	8b c6                	mov    eax,esi
   14034ca08:	44 2b c2             	sub    r8d,edx
   14034ca0b:	41 2b c5             	sub    eax,r13d
   14034ca0e:	41 3b c0             	cmp    eax,r8d
   14034ca11:	7c 33                	jl     0x14034ca46
   14034ca13:	3b c1                	cmp    eax,ecx
   14034ca15:	7f 2f                	jg     0x14034ca46
   14034ca17:	0f b7 85 b8 00 00 00 	movzx  eax,WORD PTR [rbp+0xb8]
   14034ca1e:	8b ca                	mov    ecx,edx
   14034ca20:	41 2b cd             	sub    ecx,r13d
   14034ca23:	41 2b cf             	sub    ecx,r15d
   14034ca26:	03 ce                	add    ecx,esi
   14034ca28:	0f af c8             	imul   ecx,eax
   14034ca2b:	41 0f b7 c3          	movzx  eax,r11w
   14034ca2f:	03 c1                	add    eax,ecx
   14034ca31:	48 98                	cdqe
   14034ca33:	48 69 c8 10 04 00 00 	imul   rcx,rax,0x410
   14034ca3a:	f3 42 0f 10 24 11    	movss  xmm4,DWORD PTR [rcx+r10*1]
   14034ca40:	8b 8d d0 00 00 00    	mov    ecx,DWORD PTR [rbp+0xd0]
   14034ca46:	42 8d 04 2f          	lea    eax,[rdi+r13*1]
   14034ca4a:	41 3b c0             	cmp    eax,r8d
   14034ca4d:	7c 2d                	jl     0x14034ca7c
   14034ca4f:	3b c1                	cmp    eax,ecx
   14034ca51:	7f 29                	jg     0x14034ca7c
   14034ca53:	0f b7 85 b8 00 00 00 	movzx  eax,WORD PTR [rbp+0xb8]
   14034ca5a:	8b ca                	mov    ecx,edx
   14034ca5c:	41 2b cf             	sub    ecx,r15d
   14034ca5f:	03 cf                	add    ecx,edi
   14034ca61:	41 03 cd             	add    ecx,r13d
   14034ca64:	0f af c8             	imul   ecx,eax
   14034ca67:	41 0f b7 c3          	movzx  eax,r11w
   14034ca6b:	03 c1                	add    eax,ecx
   14034ca6d:	48 98                	cdqe
   14034ca6f:	48 69 c8 10 04 00 00 	imul   rcx,rax,0x410
   14034ca76:	f3 42 0f 10 1c 11    	movss  xmm3,DWORD PTR [rcx+r10*1]
   14034ca7c:	0f 28 c4             	movaps xmm0,xmm4
   14034ca7f:	f3 0f 5d c3          	minss  xmm0,xmm3
   14034ca83:	0f 28 d8             	movaps xmm3,xmm0
   14034ca86:	44 8b c6             	mov    r8d,esi
   14034ca89:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14034ca90:	33 c0                	xor    eax,eax
   14034ca92:	45 85 ed             	test   r13d,r13d
   14034ca95:	7e 08                	jle    0x14034ca9f
   14034ca97:	45 3b c6             	cmp    r8d,r14d
   14034ca9a:	0f 9e c0             	setle  al
   14034ca9d:	eb 06                	jmp    0x14034caa5
   14034ca9f:	45 3b c6             	cmp    r8d,r14d
   14034caa2:	0f 9d c0             	setge  al
   14034caa5:	85 c0                	test   eax,eax
   14034caa7:	0f 84 d0 00 00 00    	je     0x14034cb7d
   14034caad:	0f b7 8d b8 00 00 00 	movzx  ecx,WORD PTR [rbp+0xb8]
   14034cab4:	41 2b d7             	sub    edx,r15d
   14034cab7:	45 0f b7 d3          	movzx  r10d,r11w
   14034cabb:	8d 04 16             	lea    eax,[rsi+rdx*1]
   14034cabe:	0f af c1             	imul   eax,ecx
   14034cac1:	41 03 c2             	add    eax,r10d
   14034cac4:	48 98                	cdqe
   14034cac6:	48 69 d0 10 04 00 00 	imul   rdx,rax,0x410
   14034cacd:	48 03 95 b0 00 00 00 	add    rdx,QWORD PTR [rbp+0xb0]
   14034cad4:	f3 0f 10 12          	movss  xmm2,DWORD PTR [rdx]
   14034cad8:	83 ff ff             	cmp    edi,0xffffffff
   14034cadb:	74 4a                	je     0x14034cb27
   14034cadd:	45 85 ed             	test   r13d,r13d
   14034cae0:	7e 0c                	jle    0x14034caee
   14034cae2:	66 41 0f 6e c9       	movd   xmm1,r9d
   14034cae7:	41 8d 44 24 02       	lea    eax,[r12+0x2]
   14034caec:	eb 11                	jmp    0x14034caff
   14034caee:	8b 45 a8             	mov    eax,DWORD PTR [rbp-0x58]
   14034caf1:	41 03 c0             	add    eax,r8d
   14034caf4:	66 0f 6e c8          	movd   xmm1,eax
   14034caf8:	8b c6                	mov    eax,esi
   14034cafa:	2b c7                	sub    eax,edi
   14034cafc:	83 c0 02             	add    eax,0x2
   14034caff:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14034cb02:	66 0f 6e c0          	movd   xmm0,eax
   14034cb06:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14034cb09:	f3 0f 5e c8          	divss  xmm1,xmm0
   14034cb0d:	0f 28 c6             	movaps xmm0,xmm6
   14034cb10:	f3 0f 5c c1          	subss  xmm0,xmm1
   14034cb14:	f3 0f 59 cc          	mulss  xmm1,xmm4
   14034cb18:	f3 0f 59 c3          	mulss  xmm0,xmm3
   14034cb1c:	f3 0f 58 c1          	addss  xmm0,xmm1
   14034cb20:	f3 0f 5d c2          	minss  xmm0,xmm2
   14034cb24:	0f 28 d0             	movaps xmm2,xmm0
   14034cb27:	48 8b 5d b0          	mov    rbx,QWORD PTR [rbp-0x50]
   14034cb2b:	41 0f b7 c3          	movzx  eax,r11w
   14034cb2f:	f3 0f 5c 14 83       	subss  xmm2,DWORD PTR [rbx+rax*4]
   14034cb34:	48 8b 9d c0 00 00 00 	mov    rbx,QWORD PTR [rbp+0xc0]
   14034cb3b:	8b c6                	mov    eax,esi
   14034cb3d:	41 2b c7             	sub    eax,r15d
   14034cb40:	0f af c1             	imul   eax,ecx
   14034cb43:	f3 41 0f 5f d2       	maxss  xmm2,xmm10
   14034cb48:	41 03 c2             	add    eax,r10d
   14034cb4b:	48 63 c8             	movsxd rcx,eax
   14034cb4e:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034cb51:	f3 0f 11 14 88       	movss  DWORD PTR [rax+rcx*4],xmm2
   14034cb56:	f3 0f 10 02          	movss  xmm0,DWORD PTR [rdx]
   14034cb5a:	f3 0f 5c c2          	subss  xmm0,xmm2
   14034cb5e:	41 0f 2f c2          	comiss xmm0,xmm10
   14034cb62:	77 04                	ja     0x14034cb68
   14034cb64:	41 0f 28 c2          	movaps xmm0,xmm10
   14034cb68:	45 03 c5             	add    r8d,r13d
   14034cb6b:	f3 0f 11 02          	movss  DWORD PTR [rdx],xmm0
   14034cb6f:	8b 15 6f d4 63 00    	mov    edx,DWORD PTR [rip+0x63d46f]        # 0x140989fe4
   14034cb75:	45 2b cd             	sub    r9d,r13d
   14034cb78:	e9 13 ff ff ff       	jmp    0x14034ca90
   14034cb7d:	44 0f b7 55 80       	movzx  r10d,WORD PTR [rbp-0x80]
   14034cb82:	45 8d 4c 24 01       	lea    r9d,[r12+0x1]
   14034cb87:	66 41 ff c3          	inc    r11w
   14034cb8b:	66 45 3b da          	cmp    r11w,r10w
   14034cb8f:	0f 86 50 fe ff ff    	jbe    0x14034c9e5
   14034cb95:	44 0f b7 65 84       	movzx  r12d,WORD PTR [rbp-0x7c]
   14034cb9a:	4c 8b 85 a8 00 00 00 	mov    r8,QWORD PTR [rbp+0xa8]
   14034cba1:	45 85 ed             	test   r13d,r13d
   14034cba4:	7e 1e                	jle    0x14034cbc4
   14034cba6:	41 8b 50 10          	mov    edx,DWORD PTR [r8+0x10]
   14034cbaa:	0f b7 43 14          	movzx  eax,WORD PTR [rbx+0x14]
   14034cbae:	8d 4a ff             	lea    ecx,[rdx-0x1]
   14034cbb1:	3b c1                	cmp    eax,ecx
   14034cbb3:	77 0c                	ja     0x14034cbc1
   14034cbb5:	8d 42 ff             	lea    eax,[rdx-0x1]
   14034cbb8:	3b f0                	cmp    esi,eax
   14034cbba:	7f 05                	jg     0x14034cbc1
   14034cbbc:	44 3b f0             	cmp    r14d,eax
   14034cbbf:	7d 25                	jge    0x14034cbe6
   14034cbc1:	45 85 ed             	test   r13d,r13d
   14034cbc4:	0f 89 8c 00 00 00    	jns    0x14034cc56
   14034cbca:	0f b7 43 16          	movzx  eax,WORD PTR [rbx+0x16]
   14034cbce:	41 8b 48 10          	mov    ecx,DWORD PTR [r8+0x10]
   14034cbd2:	3b c1                	cmp    eax,ecx
   14034cbd4:	0f 8c 7c 00 00 00    	jl     0x14034cc56
   14034cbda:	8d 41 ff             	lea    eax,[rcx-0x1]
   14034cbdd:	3b f0                	cmp    esi,eax
   14034cbdf:	7c 75                	jl     0x14034cc56
   14034cbe1:	44 3b f0             	cmp    r14d,eax
   14034cbe4:	7f 70                	jg     0x14034cc56
   14034cbe6:	0f b7 43 10          	movzx  eax,WORD PTR [rbx+0x10]
   14034cbea:	48 8b 4b 28          	mov    rcx,QWORD PTR [rbx+0x28]
   14034cbee:	66 44 3b e0          	cmp    r12w,ax
   14034cbf2:	66 41 0f 42 c4       	cmovb  ax,r12w
   14034cbf7:	66 89 43 22          	mov    WORD PTR [rbx+0x22],ax
   14034cbfb:	0f b7 43 12          	movzx  eax,WORD PTR [rbx+0x12]
   14034cbff:	66 41 3b c2          	cmp    ax,r10w
   14034cc03:	66 41 0f 42 c2       	cmovb  ax,r10w
   14034cc08:	66 89 43 24          	mov    WORD PTR [rbx+0x24],ax
   14034cc0c:	0f b7 45 90          	movzx  eax,WORD PTR [rbp-0x70]
   14034cc10:	66 89 43 26          	mov    WORD PTR [rbx+0x26],ax
   14034cc14:	48 85 c9             	test   rcx,rcx
   14034cc17:	75 23                	jne    0x14034cc3c
   14034cc19:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   14034cc20:	b8 04 00 00 00       	mov    eax,0x4
   14034cc25:	48 f7 65 b8          	mul    QWORD PTR [rbp-0x48]
   14034cc29:	48 0f 40 c1          	cmovo  rax,rcx
   14034cc2d:	48 8b c8             	mov    rcx,rax
   14034cc30:	e8 2b e9 2c 00       	call   0x14061b560
   14034cc35:	48 89 43 28          	mov    QWORD PTR [rbx+0x28],rax
   14034cc39:	48 8b c8             	mov    rcx,rax
   14034cc3c:	48 8b 45 b8          	mov    rax,QWORD PTR [rbp-0x48]
   14034cc40:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   14034cc44:	4c 8d 04 85 00 00 00 	lea    r8,[rax*4+0x0]
   14034cc4b:	00 
   14034cc4c:	e8 93 40 2d 00       	call   0x140620ce4
   14034cc51:	44 0f b7 55 80       	movzx  r10d,WORD PTR [rbp-0x80]
   14034cc56:	0f b7 43 10          	movzx  eax,WORD PTR [rbx+0x10]
   14034cc5a:	66 44 3b e0          	cmp    r12w,ax
   14034cc5e:	66 41 0f 42 c4       	cmovb  ax,r12w
   14034cc63:	66 89 43 10          	mov    WORD PTR [rbx+0x10],ax
   14034cc67:	0f b7 43 12          	movzx  eax,WORD PTR [rbx+0x12]
   14034cc6b:	66 41 3b c2          	cmp    ax,r10w
   14034cc6f:	66 41 0f 42 c2       	cmovb  ax,r10w
   14034cc74:	66 89 43 12          	mov    WORD PTR [rbx+0x12],ax
   14034cc78:	45 85 ed             	test   r13d,r13d
   14034cc7b:	7e 07                	jle    0x14034cc84
   14034cc7d:	66 44 89 73 16       	mov    WORD PTR [rbx+0x16],r14w
   14034cc82:	eb 05                	jmp    0x14034cc89
   14034cc84:	66 44 89 73 14       	mov    WORD PTR [rbx+0x14],r14w
   14034cc89:	0f b6 7d 8e          	movzx  edi,BYTE PTR [rbp-0x72]
   14034cc8d:	43 8d 34 2e          	lea    esi,[r14+r13*1]
   14034cc91:	44 0f b7 75 80       	movzx  r14d,WORD PTR [rbp-0x80]
   14034cc96:	45 33 db             	xor    r11d,r11d
   14034cc99:	48 8b 4d b0          	mov    rcx,QWORD PTR [rbp-0x50]
   14034cc9d:	0f b7 55 92          	movzx  edx,WORD PTR [rbp-0x6e]
   14034cca1:	44 0f b7 45 88       	movzx  r8d,WORD PTR [rbp-0x78]
   14034cca6:	44 8b 65 9c          	mov    r12d,DWORD PTR [rbp-0x64]
   14034ccaa:	44 0f b6 4d 8f       	movzx  r9d,BYTE PTR [rbp-0x71]
   14034ccaf:	4c 8b 95 a8 00 00 00 	mov    r10,QWORD PTR [rbp+0xa8]
   14034ccb6:	e9 45 fa ff ff       	jmp    0x14034c700
   14034ccbb:	f3 0f 10 7d 98       	movss  xmm7,DWORD PTR [rbp-0x68]
   14034ccc0:	44 0f b7 75 80       	movzx  r14d,WORD PTR [rbp-0x80]
   14034ccc5:	4c 8b 95 a8 00 00 00 	mov    r10,QWORD PTR [rbp+0xa8]
   14034cccc:	45 33 db             	xor    r11d,r11d
   14034cccf:	41 83 fd ff          	cmp    r13d,0xffffffff
   14034ccd3:	0f 85 52 01 00 00    	jne    0x14034ce2b
   14034ccd9:	41 3b 72 0c          	cmp    esi,DWORD PTR [r10+0xc]
   14034ccdd:	0f 8d 48 01 00 00    	jge    0x14034ce2b
   14034cce3:	44 0f b7 a5 e0 00 00 	movzx  r12d,WORD PTR [rbp+0xe0]
   14034ccea:	00 
   14034cceb:	49 8b f3             	mov    rsi,r11
   14034ccee:	66 45 3b dc          	cmp    r11w,r12w
   14034ccf2:	0f 83 33 01 00 00    	jae    0x14034ce2b
   14034ccf8:	48 8b 85 d8 00 00 00 	mov    rax,QWORD PTR [rbp+0xd8]
   14034ccff:	44 0f b7 6d 92       	movzx  r13d,WORD PTR [rbp-0x6e]
   14034cd04:	45 0f b7 e4          	movzx  r12d,r12w
   14034cd08:	48 8d 78 24          	lea    rdi,[rax+0x24]
   14034cd0c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14034cd10:	44 0f b7 7f fe       	movzx  r15d,WORD PTR [rdi-0x2]
   14034cd15:	66 45 3b fd          	cmp    r15w,r13w
   14034cd19:	0f 83 a3 00 00 00    	jae    0x14034cdc2
   14034cd1f:	44 0f b7 37          	movzx  r14d,WORD PTR [rdi]
   14034cd23:	0f b7 45 88          	movzx  eax,WORD PTR [rbp-0x78]
   14034cd27:	66 44 3b f0          	cmp    r14w,ax
   14034cd2b:	0f 86 91 00 00 00    	jbe    0x14034cdc2
   14034cd31:	48 8b 8d a0 00 00 00 	mov    rcx,QWORD PTR [rbp+0xa0]
   14034cd38:	4c 8d 45 80          	lea    r8,[rbp-0x80]
   14034cd3c:	48 89 5c 24 28       	mov    QWORD PTR [rsp+0x28],rbx
   14034cd41:	48 8d 55 84          	lea    rdx,[rbp-0x7c]
   14034cd45:	44 0f b7 c8          	movzx  r9d,ax
   14034cd49:	66 44 89 6c 24 20    	mov    WORD PTR [rsp+0x20],r13w
   14034cd4f:	66 44 89 7d 84       	mov    WORD PTR [rbp-0x7c],r15w
   14034cd54:	66 44 89 75 80       	mov    WORD PTR [rbp-0x80],r14w
   14034cd59:	e8 a2 ec ff ff       	call   0x14034ba00
   14034cd5e:	84 c0                	test   al,al
   14034cd60:	74 60                	je     0x14034cdc2
   14034cd62:	48 85 f6             	test   rsi,rsi
   14034cd65:	74 57                	je     0x14034cdbe
   14034cd67:	0f b7 45 88          	movzx  eax,WORD PTR [rbp-0x78]
   14034cd6b:	0f b7 4e 22          	movzx  ecx,WORD PTR [rsi+0x22]
   14034cd6f:	44 8b c0             	mov    r8d,eax
   14034cd72:	2b c1                	sub    eax,ecx
   14034cd74:	45 0f b7 d5          	movzx  r10d,r13w
   14034cd78:	0f b7 4e 24          	movzx  ecx,WORD PTR [rsi+0x24]
   14034cd7c:	99                   	cdq
   14034cd7d:	44 8b c8             	mov    r9d,eax
   14034cd80:	41 8b c2             	mov    eax,r10d
   14034cd83:	2b c1                	sub    eax,ecx
   14034cd85:	44 33 ca             	xor    r9d,edx
   14034cd88:	44 2b ca             	sub    r9d,edx
   14034cd8b:	41 0f b7 cf          	movzx  ecx,r15w
   14034cd8f:	99                   	cdq
   14034cd90:	44 2b c1             	sub    r8d,ecx
   14034cd93:	33 c2                	xor    eax,edx
   14034cd95:	41 0f b7 ce          	movzx  ecx,r14w
   14034cd99:	2b c2                	sub    eax,edx
   14034cd9b:	44 2b d1             	sub    r10d,ecx
   14034cd9e:	44 03 c8             	add    r9d,eax
   14034cda1:	41 8b c0             	mov    eax,r8d
   14034cda4:	99                   	cdq
   14034cda5:	44 8b c0             	mov    r8d,eax
   14034cda8:	41 8b c2             	mov    eax,r10d
   14034cdab:	44 33 c2             	xor    r8d,edx
   14034cdae:	44 2b c2             	sub    r8d,edx
   14034cdb1:	99                   	cdq
   14034cdb2:	33 c2                	xor    eax,edx
   14034cdb4:	2b c2                	sub    eax,edx
   14034cdb6:	44 03 c0             	add    r8d,eax
   14034cdb9:	45 3b c1             	cmp    r8d,r9d
   14034cdbc:	7d 04                	jge    0x14034cdc2
   14034cdbe:	48 8d 77 dc          	lea    rsi,[rdi-0x24]
   14034cdc2:	48 83 c7 38          	add    rdi,0x38
   14034cdc6:	49 83 ec 01          	sub    r12,0x1
   14034cdca:	0f 85 40 ff ff ff    	jne    0x14034cd10
   14034cdd0:	44 8b 6d a0          	mov    r13d,DWORD PTR [rbp-0x60]
   14034cdd4:	44 8b bd c8 00 00 00 	mov    r15d,DWORD PTR [rbp+0xc8]
   14034cddb:	44 0f b7 75 80       	movzx  r14d,WORD PTR [rbp-0x80]
   14034cde0:	0f b7 7d 8a          	movzx  edi,WORD PTR [rbp-0x76]
   14034cde4:	48 85 f6             	test   rsi,rsi
   14034cde7:	74 46                	je     0x14034ce2f
   14034cde9:	0f b7 46 14          	movzx  eax,WORD PTR [rsi+0x14]
   14034cded:	66 89 43 14          	mov    WORD PTR [rbx+0x14],ax
   14034cdf1:	0f b6 46 20          	movzx  eax,BYTE PTR [rsi+0x20]
   14034cdf5:	88 43 20             	mov    BYTE PTR [rbx+0x20],al
   14034cdf8:	8b 46 30             	mov    eax,DWORD PTR [rsi+0x30]
   14034cdfb:	89 43 30             	mov    DWORD PTR [rbx+0x30],eax
   14034cdfe:	0f b7 4e 10          	movzx  ecx,WORD PTR [rsi+0x10]
   14034ce02:	66 3b 4b 10          	cmp    cx,WORD PTR [rbx+0x10]
   14034ce06:	66 0f 43 4b 10       	cmovae cx,WORD PTR [rbx+0x10]
   14034ce0b:	66 89 4b 10          	mov    WORD PTR [rbx+0x10],cx
   14034ce0f:	0f b7 46 12          	movzx  eax,WORD PTR [rsi+0x12]
   14034ce13:	66 39 43 12          	cmp    WORD PTR [rbx+0x12],ax
   14034ce17:	66 0f 43 43 12       	cmovae ax,WORD PTR [rbx+0x12]
   14034ce1c:	66 89 43 12          	mov    WORD PTR [rbx+0x12],ax
   14034ce20:	eb 0d                	jmp    0x14034ce2f
   14034ce22:	44 8b bd c8 00 00 00 	mov    r15d,DWORD PTR [rbp+0xc8]
   14034ce29:	eb 08                	jmp    0x14034ce33
   14034ce2b:	0f b7 7d 8a          	movzx  edi,WORD PTR [rbp-0x76]
   14034ce2f:	0f b7 75 8c          	movzx  esi,WORD PTR [rbp-0x74]
   14034ce33:	41 83 ed 02          	sub    r13d,0x2
   14034ce37:	41 bb 00 00 00 00    	mov    r11d,0x0
   14034ce3d:	44 89 6d a0          	mov    DWORD PTR [rbp-0x60],r13d
   14034ce41:	41 83 fd ff          	cmp    r13d,0xffffffff
   14034ce45:	0f 8d 15 f8 ff ff    	jge    0x14034c660
   14034ce4b:	48 8b 4d c0          	mov    rcx,QWORD PTR [rbp-0x40]
   14034ce4f:	e8 04 e7 2c 00       	call   0x14061b558
   14034ce54:	f3 44 0f 10 0d 3f a3 	movss  xmm9,DWORD PTR [rip+0x34a33f]        # 0x14069719c
   14034ce5b:	34 00 
   14034ce5d:	49 c7 c6 ff ff ff ff 	mov    r14,0xffffffffffffffff
   14034ce64:	0f b7 7b 14          	movzx  edi,WORD PTR [rbx+0x14]
   14034ce68:	40 32 f6             	xor    sil,sil
   14034ce6b:	41 3b ff             	cmp    edi,r15d
   14034ce6e:	40 88 b5 c0 00 00 00 	mov    BYTE PTR [rbp+0xc0],sil
   14034ce75:	44 8b e7             	mov    r12d,edi
   14034ce78:	45 0f 4c e7          	cmovl  r12d,r15d
   14034ce7c:	44 89 65 98          	mov    DWORD PTR [rbp-0x68],r12d
   14034ce80:	0f 8c 0a 03 00 00    	jl     0x14034d190
   14034ce86:	44 0f b7 4b 10       	movzx  r9d,WORD PTR [rbx+0x10]
   14034ce8b:	45 0f 28 c2          	movaps xmm8,xmm10
   14034ce8f:	44 0f b7 5b 12       	movzx  r11d,WORD PTR [rbx+0x12]
   14034ce94:	45 8b c6             	mov    r8d,r14d
   14034ce97:	44 89 75 9c          	mov    DWORD PTR [rbp-0x64],r14d
   14034ce9b:	45 3b cb             	cmp    r9d,r11d
   14034ce9e:	0f 87 ec 02 00 00    	ja     0x14034d190
   14034cea4:	44 0f b7 53 16       	movzx  r10d,WORD PTR [rbx+0x16]
   14034cea9:	0f b7 b5 b8 00 00 00 	movzx  esi,WORD PTR [rbp+0xb8]
   14034ceb0:	48 8b 7d b8          	mov    rdi,QWORD PTR [rbp-0x48]
   14034ceb4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14034ceb8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14034cebf:	00 
   14034cec0:	41 0f 28 c8          	movaps xmm1,xmm8
   14034cec4:	41 0f 28 c2          	movaps xmm0,xmm10
   14034cec8:	45 3b e2             	cmp    r12d,r10d
   14034cecb:	7f 44                	jg     0x14034cf11
   14034cecd:	41 8b cc             	mov    ecx,r12d
   14034ced0:	0f b7 c6             	movzx  eax,si
   14034ced3:	41 2b cf             	sub    ecx,r15d
   14034ced6:	4c 8d 04 bd 00 00 00 	lea    r8,[rdi*4+0x0]
   14034cedd:	00 
   14034cede:	0f af c8             	imul   ecx,eax
   14034cee1:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034cee4:	41 03 c9             	add    ecx,r9d
   14034cee7:	48 63 c9             	movsxd rcx,ecx
   14034ceea:	48 8d 14 88          	lea    rdx,[rax+rcx*4]
   14034ceee:	41 8b c2             	mov    eax,r10d
   14034cef1:	41 2b c4             	sub    eax,r12d
   14034cef4:	ff c0                	inc    eax
   14034cef6:	48 63 c8             	movsxd rcx,eax
   14034cef9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14034cf00:	f3 0f 58 02          	addss  xmm0,DWORD PTR [rdx]
   14034cf04:	49 03 d0             	add    rdx,r8
   14034cf07:	48 83 e9 01          	sub    rcx,0x1
   14034cf0b:	75 f3                	jne    0x14034cf00
   14034cf0d:	44 8b 45 9c          	mov    r8d,DWORD PTR [rbp-0x64]
   14034cf11:	41 0f 2f c0          	comiss xmm0,xmm8
   14034cf15:	76 04                	jbe    0x14034cf1b
   14034cf17:	44 0f 28 c0          	movaps xmm8,xmm0
   14034cf1b:	0f 2f c1             	comiss xmm0,xmm1
   14034cf1e:	41 8b c1             	mov    eax,r9d
   14034cf21:	41 0f 46 c0          	cmovbe eax,r8d
   14034cf25:	41 ff c1             	inc    r9d
   14034cf28:	89 45 9c             	mov    DWORD PTR [rbp-0x64],eax
   14034cf2b:	44 8b c0             	mov    r8d,eax
   14034cf2e:	45 3b cb             	cmp    r9d,r11d
   14034cf31:	7e 8d                	jle    0x14034cec0
   14034cf33:	0f b7 7b 14          	movzx  edi,WORD PTR [rbx+0x14]
   14034cf37:	0f b6 b5 c0 00 00 00 	movzx  esi,BYTE PTR [rbp+0xc0]
   14034cf3e:	85 c0                	test   eax,eax
   14034cf40:	0f 88 4a 02 00 00    	js     0x14034d190
   14034cf46:	44 8b 9d c8 00 00 00 	mov    r11d,DWORD PTR [rbp+0xc8]
   14034cf4d:	44 2b d7             	sub    r10d,edi
   14034cf50:	b8 56 55 55 55       	mov    eax,0x55555556
   14034cf55:	45 8b eb             	mov    r13d,r11d
   14034cf58:	41 8d 4a 01          	lea    ecx,[r10+0x1]
   14034cf5c:	f7 e9                	imul   ecx
   14034cf5e:	42 8d 0c 55 02 00 00 	lea    ecx,[r10*2+0x2]
   14034cf65:	00 
   14034cf66:	8b c2                	mov    eax,edx
   14034cf68:	c1 e8 1f             	shr    eax,0x1f
   14034cf6b:	03 c2                	add    eax,edx
   14034cf6d:	03 c7                	add    eax,edi
   14034cf6f:	44 3b d8             	cmp    r11d,eax
   14034cf72:	44 0f 4c f8          	cmovl  r15d,eax
   14034cf76:	b8 56 55 55 55       	mov    eax,0x55555556
   14034cf7b:	f7 e9                	imul   ecx
   14034cf7d:	44 89 7d a8          	mov    DWORD PTR [rbp-0x58],r15d
   14034cf81:	8b c2                	mov    eax,edx
   14034cf83:	c1 e8 1f             	shr    eax,0x1f
   14034cf86:	03 c2                	add    eax,edx
   14034cf88:	03 c7                	add    eax,edi
   14034cf8a:	44 3b d8             	cmp    r11d,eax
   14034cf8d:	44 0f 4c e8          	cmovl  r13d,eax
   14034cf91:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   14034cf98:	44 8b f0             	mov    r14d,eax
   14034cf9b:	44 89 6d a4          	mov    DWORD PTR [rbp-0x5c],r13d
   14034cf9f:	90                   	nop
   14034cfa0:	45 85 f6             	test   r14d,r14d
   14034cfa3:	bf 01 00 00 00       	mov    edi,0x1
   14034cfa8:	0f 4e f8             	cmovle edi,eax
   14034cfab:	41 03 f8             	add    edi,r8d
   14034cfae:	66 90                	xchg   ax,ax
   14034cfb0:	33 c9                	xor    ecx,ecx
   14034cfb2:	45 85 f6             	test   r14d,r14d
   14034cfb5:	7e 0b                	jle    0x14034cfc2
   14034cfb7:	0f b7 43 12          	movzx  eax,WORD PTR [rbx+0x12]
   14034cfbb:	3b f8                	cmp    edi,eax
   14034cfbd:	0f 9e c1             	setle  cl
   14034cfc0:	eb 09                	jmp    0x14034cfcb
   14034cfc2:	0f b7 43 10          	movzx  eax,WORD PTR [rbx+0x10]
   14034cfc6:	3b f8                	cmp    edi,eax
   14034cfc8:	0f 9d c1             	setge  cl
   14034cfcb:	85 c9                	test   ecx,ecx
   14034cfcd:	0f 84 93 01 00 00    	je     0x14034d166
   14034cfd3:	0f b7 73 16          	movzx  esi,WORD PTR [rbx+0x16]
   14034cfd7:	41 0f 28 f2          	movaps xmm6,xmm10
   14034cfdb:	41 0f 28 fa          	movaps xmm7,xmm10
   14034cfdf:	41 8b d4             	mov    edx,r12d
   14034cfe2:	44 3b e6             	cmp    r12d,esi
   14034cfe5:	7f 4c                	jg     0x14034d033
   14034cfe7:	48 8b 45 b8          	mov    rax,QWORD PTR [rbp-0x48]
   14034cfeb:	41 8b cc             	mov    ecx,r12d
   14034cfee:	41 2b cb             	sub    ecx,r11d
   14034cff1:	4c 8d 0c 85 00 00 00 	lea    r9,[rax*4+0x0]
   14034cff8:	00 
   14034cff9:	0f b7 85 b8 00 00 00 	movzx  eax,WORD PTR [rbp+0xb8]
   14034d000:	0f af c8             	imul   ecx,eax
   14034d003:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034d006:	03 cf                	add    ecx,edi
   14034d008:	48 63 c9             	movsxd rcx,ecx
   14034d00b:	4c 8d 04 88          	lea    r8,[rax+rcx*4]
   14034d00f:	90                   	nop
   14034d010:	f3 41 0f 10 00       	movss  xmm0,DWORD PTR [r8]
   14034d015:	f3 0f 58 f0          	addss  xmm6,xmm0
   14034d019:	41 3b d7             	cmp    edx,r15d
   14034d01c:	7c 0c                	jl     0x14034d02a
   14034d01e:	41 3b d5             	cmp    edx,r13d
   14034d021:	7f 07                	jg     0x14034d02a
   14034d023:	f3 0f 5f c7          	maxss  xmm0,xmm7
   14034d027:	0f 28 f8             	movaps xmm7,xmm0
   14034d02a:	ff c2                	inc    edx
   14034d02c:	4d 03 c1             	add    r8,r9
   14034d02f:	3b d6                	cmp    edx,esi
   14034d031:	7e dd                	jle    0x14034d010
   14034d033:	b9 ec ff ff ff       	mov    ecx,0xffffffec
   14034d038:	e8 03 3d f5 ff       	call   0x1402a0d40
   14034d03d:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   14034d042:	0f 2f c6             	comiss xmm0,xmm6
   14034d045:	76 1c                	jbe    0x14034d063
   14034d047:	8b c6                	mov    eax,esi
   14034d049:	41 2b c4             	sub    eax,r12d
   14034d04c:	ff c0                	inc    eax
   14034d04e:	66 0f 6e c8          	movd   xmm1,eax
   14034d052:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14034d055:	f3 0f 59 cf          	mulss  xmm1,xmm7
   14034d059:	f3 41 0f 5e c9       	divss  xmm1,xmm9
   14034d05e:	0f 2f c1             	comiss xmm0,xmm1
   14034d061:	77 0f                	ja     0x14034d072
   14034d063:	44 8b 9d c8 00 00 00 	mov    r11d,DWORD PTR [rbp+0xc8]
   14034d06a:	41 03 fe             	add    edi,r14d
   14034d06d:	e9 3e ff ff ff       	jmp    0x14034cfb0
   14034d072:	44 8b bd c8 00 00 00 	mov    r15d,DWORD PTR [rbp+0xc8]
   14034d079:	44 8b df             	mov    r11d,edi
   14034d07c:	44 0f b7 ad b8 00 00 	movzx  r13d,WORD PTR [rbp+0xb8]
   14034d083:	00 
   14034d084:	33 c9                	xor    ecx,ecx
   14034d086:	45 85 f6             	test   r14d,r14d
   14034d089:	7e 0b                	jle    0x14034d096
   14034d08b:	0f b7 43 12          	movzx  eax,WORD PTR [rbx+0x12]
   14034d08f:	3b f8                	cmp    edi,eax
   14034d091:	0f 9e c1             	setle  cl
   14034d094:	eb 09                	jmp    0x14034d09f
   14034d096:	0f b7 43 10          	movzx  eax,WORD PTR [rbx+0x10]
   14034d09a:	3b f8                	cmp    edi,eax
   14034d09c:	0f 9d c1             	setge  cl
   14034d09f:	85 c9                	test   ecx,ecx
   14034d0a1:	0f 84 8b 00 00 00    	je     0x14034d132
   14034d0a7:	0f b7 c6             	movzx  eax,si
   14034d0aa:	45 8b cc             	mov    r9d,r12d
   14034d0ad:	44 3b e0             	cmp    r12d,eax
   14034d0b0:	7f 71                	jg     0x14034d123
   14034d0b2:	45 8b c4             	mov    r8d,r12d
   14034d0b5:	45 0f b7 d5          	movzx  r10d,r13w
   14034d0b9:	4c 8b a5 b0 00 00 00 	mov    r12,QWORD PTR [rbp+0xb0]
   14034d0c0:	45 2b c7             	sub    r8d,r15d
   14034d0c3:	45 0f af c2          	imul   r8d,r10d
   14034d0c7:	44 03 c7             	add    r8d,edi
   14034d0ca:	33 f6                	xor    esi,esi
   14034d0cc:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14034d0d0:	8b 05 0e cf 63 00    	mov    eax,DWORD PTR [rip+0x63cf0e]        # 0x140989fe4
   14034d0d6:	41 2b c7             	sub    eax,r15d
   14034d0d9:	49 63 c8             	movsxd rcx,r8d
   14034d0dc:	41 03 c1             	add    eax,r9d
   14034d0df:	45 03 c2             	add    r8d,r10d
   14034d0e2:	41 0f af c2          	imul   eax,r10d
   14034d0e6:	41 ff c1             	inc    r9d
   14034d0e9:	03 c7                	add    eax,edi
   14034d0eb:	48 98                	cdqe
   14034d0ed:	48 69 d0 10 04 00 00 	imul   rdx,rax,0x410
   14034d0f4:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034d0f7:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14034d0fc:	f3 42 0f 58 04 22    	addss  xmm0,DWORD PTR [rdx+r12*1]
   14034d102:	f3 42 0f 11 04 22    	movss  DWORD PTR [rdx+r12*1],xmm0
   14034d108:	89 34 88             	mov    DWORD PTR [rax+rcx*4],esi
   14034d10b:	0f b7 43 16          	movzx  eax,WORD PTR [rbx+0x16]
   14034d10f:	44 3b c8             	cmp    r9d,eax
   14034d112:	7e bc                	jle    0x14034d0d0
   14034d114:	44 8b 65 98          	mov    r12d,DWORD PTR [rbp-0x68]
   14034d118:	41 03 fe             	add    edi,r14d
   14034d11b:	0f b7 f0             	movzx  esi,ax
   14034d11e:	e9 61 ff ff ff       	jmp    0x14034d084
   14034d123:	0f b7 43 16          	movzx  eax,WORD PTR [rbx+0x16]
   14034d127:	41 03 fe             	add    edi,r14d
   14034d12a:	0f b7 f0             	movzx  esi,ax
   14034d12d:	e9 52 ff ff ff       	jmp    0x14034d084
   14034d132:	45 85 f6             	test   r14d,r14d
   14034d135:	7e 0b                	jle    0x14034d142
   14034d137:	66 41 ff cb          	dec    r11w
   14034d13b:	66 44 89 5b 12       	mov    WORD PTR [rbx+0x12],r11w
   14034d140:	eb 09                	jmp    0x14034d14b
   14034d142:	66 41 ff c3          	inc    r11w
   14034d146:	66 44 89 5b 10       	mov    WORD PTR [rbx+0x10],r11w
   14034d14b:	44 8b 7d a8          	mov    r15d,DWORD PTR [rbp-0x58]
   14034d14f:	40 b6 01             	mov    sil,0x1
   14034d152:	44 8b 6d a4          	mov    r13d,DWORD PTR [rbp-0x5c]
   14034d156:	44 8b 9d c8 00 00 00 	mov    r11d,DWORD PTR [rbp+0xc8]
   14034d15d:	40 88 b5 c0 00 00 00 	mov    BYTE PTR [rbp+0xc0],sil
   14034d164:	eb 07                	jmp    0x14034d16d
   14034d166:	0f b6 b5 c0 00 00 00 	movzx  esi,BYTE PTR [rbp+0xc0]
   14034d16d:	44 8b 45 9c          	mov    r8d,DWORD PTR [rbp-0x64]
   14034d171:	41 83 c6 02          	add    r14d,0x2
   14034d175:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   14034d17c:	41 83 fe 01          	cmp    r14d,0x1
   14034d180:	0f 8e 1a fe ff ff    	jle    0x14034cfa0
   14034d186:	44 8b bd c8 00 00 00 	mov    r15d,DWORD PTR [rbp+0xc8]
   14034d18d:	4c 8b f0             	mov    r14,rax
   14034d190:	44 0f b7 5b 16       	movzx  r11d,WORD PTR [rbx+0x16]
   14034d195:	45 0f 28 c2          	movaps xmm8,xmm10
   14034d199:	41 8b fe             	mov    edi,r14d
   14034d19c:	45 8b c4             	mov    r8d,r12d
   14034d19f:	45 3b e3             	cmp    r12d,r11d
   14034d1a2:	0f 8f d4 02 00 00    	jg     0x14034d47c
   14034d1a8:	44 0f b7 4b 10       	movzx  r9d,WORD PTR [rbx+0x10]
   14034d1ad:	44 0f b7 53 12       	movzx  r10d,WORD PTR [rbx+0x12]
   14034d1b2:	44 0f b7 a5 b8 00 00 	movzx  r12d,WORD PTR [rbp+0xb8]
   14034d1b9:	00 
   14034d1ba:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14034d1c0:	41 0f 28 c8          	movaps xmm1,xmm8
   14034d1c4:	41 0f 28 c2          	movaps xmm0,xmm10
   14034d1c8:	45 3b ca             	cmp    r9d,r10d
   14034d1cb:	77 31                	ja     0x14034d1fe
   14034d1cd:	41 8b c8             	mov    ecx,r8d
   14034d1d0:	41 0f b7 c4          	movzx  eax,r12w
   14034d1d4:	41 2b cf             	sub    ecx,r15d
   14034d1d7:	0f af c8             	imul   ecx,eax
   14034d1da:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034d1dd:	41 03 c9             	add    ecx,r9d
   14034d1e0:	48 63 c9             	movsxd rcx,ecx
   14034d1e3:	48 8d 14 88          	lea    rdx,[rax+rcx*4]
   14034d1e7:	41 8b ca             	mov    ecx,r10d
   14034d1ea:	41 2b c9             	sub    ecx,r9d
   14034d1ed:	ff c1                	inc    ecx
   14034d1ef:	90                   	nop
   14034d1f0:	f3 0f 58 02          	addss  xmm0,DWORD PTR [rdx]
   14034d1f4:	48 83 c2 04          	add    rdx,0x4
   14034d1f8:	48 83 e9 01          	sub    rcx,0x1
   14034d1fc:	75 f2                	jne    0x14034d1f0
   14034d1fe:	41 0f 2f c0          	comiss xmm0,xmm8
   14034d202:	76 04                	jbe    0x14034d208
   14034d204:	44 0f 28 c0          	movaps xmm8,xmm0
   14034d208:	0f 2f c1             	comiss xmm0,xmm1
   14034d20b:	41 8b c0             	mov    eax,r8d
   14034d20e:	0f 46 c7             	cmovbe eax,edi
   14034d211:	41 ff c0             	inc    r8d
   14034d214:	8b f8                	mov    edi,eax
   14034d216:	45 3b c3             	cmp    r8d,r11d
   14034d219:	7e a5                	jle    0x14034d1c0
   14034d21b:	44 8b 65 98          	mov    r12d,DWORD PTR [rbp-0x68]
   14034d21f:	89 45 a4             	mov    DWORD PTR [rbp-0x5c],eax
   14034d222:	85 c0                	test   eax,eax
   14034d224:	0f 88 52 02 00 00    	js     0x14034d47c
   14034d22a:	44 0f b7 43 10       	movzx  r8d,WORD PTR [rbx+0x10]
   14034d22f:	b8 56 55 55 55       	mov    eax,0x55555556
   14034d234:	45 2b d0             	sub    r10d,r8d
   14034d237:	41 be 01 00 00 00    	mov    r14d,0x1
   14034d23d:	41 8d 4a 01          	lea    ecx,[r10+0x1]
   14034d241:	f7 e9                	imul   ecx
   14034d243:	b8 56 55 55 55       	mov    eax,0x55555556
   14034d248:	42 8d 0c 55 02 00 00 	lea    ecx,[r10*2+0x2]
   14034d24f:	00 
   14034d250:	44 8b ea             	mov    r13d,edx
   14034d253:	41 c1 ed 1f          	shr    r13d,0x1f
   14034d257:	44 03 ea             	add    r13d,edx
   14034d25a:	f7 e9                	imul   ecx
   14034d25c:	0f b7 43 14          	movzx  eax,WORD PTR [rbx+0x14]
   14034d260:	45 03 e8             	add    r13d,r8d
   14034d263:	44 8b ca             	mov    r9d,edx
   14034d266:	44 89 6d a8          	mov    DWORD PTR [rbp-0x58],r13d
   14034d26a:	41 c1 e9 1f          	shr    r9d,0x1f
   14034d26e:	44 03 ca             	add    r9d,edx
   14034d271:	45 03 c8             	add    r9d,r8d
   14034d274:	41 3b c7             	cmp    eax,r15d
   14034d277:	44 89 4d a0          	mov    DWORD PTR [rbp-0x60],r9d
   14034d27b:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   14034d282:	44 0f 4d f0          	cmovge r14d,eax
   14034d286:	45 85 f6             	test   r14d,r14d
   14034d289:	7e 0e                	jle    0x14034d299
   14034d28b:	8d 47 01             	lea    eax,[rdi+0x1]
   14034d28e:	41 8b ff             	mov    edi,r15d
   14034d291:	44 3b f8             	cmp    r15d,eax
   14034d294:	0f 4c f8             	cmovl  edi,eax
   14034d297:	eb 07                	jmp    0x14034d2a0
   14034d299:	ff cf                	dec    edi
   14034d29b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14034d2a0:	45 85 f6             	test   r14d,r14d
   14034d2a3:	7e 0d                	jle    0x14034d2b2
   14034d2a5:	0f b7 43 16          	movzx  eax,WORD PTR [rbx+0x16]
   14034d2a9:	33 c9                	xor    ecx,ecx
   14034d2ab:	3b f8                	cmp    edi,eax
   14034d2ad:	0f 9e c1             	setle  cl
   14034d2b0:	eb 0a                	jmp    0x14034d2bc
   14034d2b2:	33 c0                	xor    eax,eax
   14034d2b4:	41 3b fc             	cmp    edi,r12d
   14034d2b7:	8b c8                	mov    ecx,eax
   14034d2b9:	0f 9d c1             	setge  cl
   14034d2bc:	85 c9                	test   ecx,ecx
   14034d2be:	0f 84 92 01 00 00    	je     0x14034d456
   14034d2c4:	44 0f b7 7b 10       	movzx  r15d,WORD PTR [rbx+0x10]
   14034d2c9:	41 0f 28 f2          	movaps xmm6,xmm10
   14034d2cd:	0f b7 73 12          	movzx  esi,WORD PTR [rbx+0x12]
   14034d2d1:	41 0f 28 fa          	movaps xmm7,xmm10
   14034d2d5:	41 8b d7             	mov    edx,r15d
   14034d2d8:	44 3b fe             	cmp    r15d,esi
   14034d2db:	77 47                	ja     0x14034d324
   14034d2dd:	0f b7 85 b8 00 00 00 	movzx  eax,WORD PTR [rbp+0xb8]
   14034d2e4:	8b cf                	mov    ecx,edi
   14034d2e6:	2b 8d c8 00 00 00    	sub    ecx,DWORD PTR [rbp+0xc8]
   14034d2ec:	0f af c8             	imul   ecx,eax
   14034d2ef:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034d2f2:	03 ca                	add    ecx,edx
   14034d2f4:	48 63 c9             	movsxd rcx,ecx
   14034d2f7:	4c 8d 04 88          	lea    r8,[rax+rcx*4]
   14034d2fb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14034d300:	f3 41 0f 10 00       	movss  xmm0,DWORD PTR [r8]
   14034d305:	f3 0f 58 f0          	addss  xmm6,xmm0
   14034d309:	41 3b d5             	cmp    edx,r13d
   14034d30c:	7c 0c                	jl     0x14034d31a
   14034d30e:	41 3b d1             	cmp    edx,r9d
   14034d311:	7f 07                	jg     0x14034d31a
   14034d313:	f3 0f 5f c7          	maxss  xmm0,xmm7
   14034d317:	0f 28 f8             	movaps xmm7,xmm0
   14034d31a:	ff c2                	inc    edx
   14034d31c:	49 83 c0 04          	add    r8,0x4
   14034d320:	3b d6                	cmp    edx,esi
   14034d322:	7e dc                	jle    0x14034d300
   14034d324:	b9 ec ff ff ff       	mov    ecx,0xffffffec
   14034d329:	e8 12 3a f5 ff       	call   0x1402a0d40
   14034d32e:	f3 41 0f 59 c0       	mulss  xmm0,xmm8
   14034d333:	0f 2f c6             	comiss xmm0,xmm6
   14034d336:	76 1a                	jbe    0x14034d352
   14034d338:	41 2b f7             	sub    esi,r15d
   14034d33b:	ff c6                	inc    esi
   14034d33d:	66 0f 6e ce          	movd   xmm1,esi
   14034d341:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14034d344:	f3 0f 59 cf          	mulss  xmm1,xmm7
   14034d348:	f3 41 0f 5e c9       	divss  xmm1,xmm9
   14034d34d:	0f 2f c1             	comiss xmm0,xmm1
   14034d350:	77 0c                	ja     0x14034d35e
   14034d352:	44 8b 4d a0          	mov    r9d,DWORD PTR [rbp-0x60]
   14034d356:	41 03 fe             	add    edi,r14d
   14034d359:	e9 42 ff ff ff       	jmp    0x14034d2a0
   14034d35e:	44 8b ad c8 00 00 00 	mov    r13d,DWORD PTR [rbp+0xc8]
   14034d365:	44 8b df             	mov    r11d,edi
   14034d368:	44 0f b7 9d b8 00 00 	movzx  r11d,WORD PTR [rbp+0xb8]
   14034d36f:	00 
   14034d370:	89 bd c0 00 00 00    	mov    DWORD PTR [rbp+0xc0],edi
   14034d376:	33 f6                	xor    esi,esi
   14034d378:	8b ce                	mov    ecx,esi
   14034d37a:	45 85 f6             	test   r14d,r14d
   14034d37d:	7e 0b                	jle    0x14034d38a
   14034d37f:	0f b7 43 16          	movzx  eax,WORD PTR [rbx+0x16]
   14034d383:	3b f8                	cmp    edi,eax
   14034d385:	0f 9e c1             	setle  cl
   14034d388:	eb 06                	jmp    0x14034d390
   14034d38a:	41 3b fc             	cmp    edi,r12d
   14034d38d:	0f 9d c1             	setge  cl
   14034d390:	85 c9                	test   ecx,ecx
   14034d392:	74 7c                	je     0x14034d410
   14034d394:	44 0f b7 4b 10       	movzx  r9d,WORD PTR [rbx+0x10]
   14034d399:	0f b7 43 12          	movzx  eax,WORD PTR [rbx+0x12]
   14034d39d:	44 3b c8             	cmp    r9d,eax
   14034d3a0:	77 66                	ja     0x14034d408
   14034d3a2:	4c 8b a5 b0 00 00 00 	mov    r12,QWORD PTR [rbp+0xb0]
   14034d3a9:	44 8b c7             	mov    r8d,edi
   14034d3ac:	45 2b c5             	sub    r8d,r13d
   14034d3af:	45 0f b7 d3          	movzx  r10d,r11w
   14034d3b3:	45 0f af c2          	imul   r8d,r10d
   14034d3b7:	45 03 c1             	add    r8d,r9d
   14034d3ba:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14034d3c0:	8b 05 1e cc 63 00    	mov    eax,DWORD PTR [rip+0x63cc1e]        # 0x140989fe4
   14034d3c6:	41 2b c5             	sub    eax,r13d
   14034d3c9:	49 63 c8             	movsxd rcx,r8d
   14034d3cc:	03 c7                	add    eax,edi
   14034d3ce:	41 ff c0             	inc    r8d
   14034d3d1:	41 0f af c2          	imul   eax,r10d
   14034d3d5:	41 03 c1             	add    eax,r9d
   14034d3d8:	41 ff c1             	inc    r9d
   14034d3db:	48 98                	cdqe
   14034d3dd:	48 69 d0 10 04 00 00 	imul   rdx,rax,0x410
   14034d3e4:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   14034d3e7:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14034d3ec:	f3 42 0f 58 04 22    	addss  xmm0,DWORD PTR [rdx+r12*1]
   14034d3f2:	f3 42 0f 11 04 22    	movss  DWORD PTR [rdx+r12*1],xmm0
   14034d3f8:	89 34 88             	mov    DWORD PTR [rax+rcx*4],esi
   14034d3fb:	0f b7 43 12          	movzx  eax,WORD PTR [rbx+0x12]
   14034d3ff:	44 3b c8             	cmp    r9d,eax
   14034d402:	7e bc                	jle    0x14034d3c0
   14034d404:	44 8b 65 98          	mov    r12d,DWORD PTR [rbp-0x68]
   14034d408:	41 03 fe             	add    edi,r14d
   14034d40b:	e9 66 ff ff ff       	jmp    0x14034d376
   14034d410:	44 8b 9d c0 00 00 00 	mov    r11d,DWORD PTR [rbp+0xc0]
   14034d417:	45 85 f6             	test   r14d,r14d
   14034d41a:	7e 1d                	jle    0x14034d439
   14034d41c:	44 8b 6d a8          	mov    r13d,DWORD PTR [rbp-0x58]
   14034d420:	66 41 ff cb          	dec    r11w
   14034d424:	44 8b 4d a0          	mov    r9d,DWORD PTR [rbp-0x60]
   14034d428:	40 b6 01             	mov    sil,0x1
   14034d42b:	66 44 89 5b 16       	mov    WORD PTR [rbx+0x16],r11w
   14034d430:	40 88 b5 c0 00 00 00 	mov    BYTE PTR [rbp+0xc0],sil
   14034d437:	eb 24                	jmp    0x14034d45d
   14034d439:	44 8b 6d a8          	mov    r13d,DWORD PTR [rbp-0x58]
   14034d43d:	66 41 ff c3          	inc    r11w
   14034d441:	44 8b 4d a0          	mov    r9d,DWORD PTR [rbp-0x60]
   14034d445:	40 b6 01             	mov    sil,0x1
   14034d448:	66 44 89 5b 14       	mov    WORD PTR [rbx+0x14],r11w
   14034d44d:	40 88 b5 c0 00 00 00 	mov    BYTE PTR [rbp+0xc0],sil
   14034d454:	eb 07                	jmp    0x14034d45d
   14034d456:	0f b6 b5 c0 00 00 00 	movzx  esi,BYTE PTR [rbp+0xc0]
   14034d45d:	8b 7d a4             	mov    edi,DWORD PTR [rbp-0x5c]
   14034d460:	41 83 c6 02          	add    r14d,0x2
   14034d464:	44 8b bd c8 00 00 00 	mov    r15d,DWORD PTR [rbp+0xc8]
   14034d46b:	41 83 fe 01          	cmp    r14d,0x1
   14034d46f:	0f 8e 11 fe ff ff    	jle    0x14034d286
   14034d475:	49 c7 c6 ff ff ff ff 	mov    r14,0xffffffffffffffff
   14034d47c:	40 84 f6             	test   sil,sil
   14034d47f:	0f 85 df f9 ff ff    	jne    0x14034ce64
   14034d485:	4c 8d 9c 24 68 01 00 	lea    r11,[rsp+0x168]
   14034d48c:	00 
   14034d48d:	41 0f 28 73 e8       	movaps xmm6,XMMWORD PTR [r11-0x18]
   14034d492:	41 0f 28 7b d8       	movaps xmm7,XMMWORD PTR [r11-0x28]
   14034d497:	45 0f 28 43 c8       	movaps xmm8,XMMWORD PTR [r11-0x38]
   14034d49c:	45 0f 28 4b b8       	movaps xmm9,XMMWORD PTR [r11-0x48]
   14034d4a1:	45 0f 28 53 a8       	movaps xmm10,XMMWORD PTR [r11-0x58]
   14034d4a6:	49 8b e3             	mov    rsp,r11
   14034d4a9:	41 5f                	pop    r15
   14034d4ab:	41 5e                	pop    r14
   14034d4ad:	41 5d                	pop    r13
   14034d4af:	41 5c                	pop    r12
   14034d4b1:	5f                   	pop    rdi
   14034d4b2:	5e                   	pop    rsi
   14034d4b3:	5b                   	pop    rbx
   14034d4b4:	5d                   	pop    rbp
   14034d4b5:	c3                   	ret
   14034d4b6:	cc                   	int3
   14034d4b7:	cc                   	int3
   14034d4b8:	cc                   	int3
   14034d4b9:	cc                   	int3
   14034d4ba:	cc                   	int3
   14034d4bb:	cc                   	int3
   14034d4bc:	cc                   	int3
   14034d4bd:	cc                   	int3
   14034d4be:	cc                   	int3
   14034d4bf:	cc                   	int3
   14034d4c0:	48 89 54 24 10       	mov    QWORD PTR [rsp+0x10],rdx
   14034d4c5:	48 89 4c 24 08       	mov    QWORD PTR [rsp+0x8],rcx
   14034d4ca:	55                   	push   rbp
   14034d4cb:	56                   	push   rsi
   14034d4cc:	41 54                	push   r12
   14034d4ce:	41 55                	push   r13
   14034d4d0:	48 81 ec a8 00 00 00 	sub    rsp,0xa8
   14034d4d7:	41 0f b7 f1          	movzx  esi,r9w
   14034d4db:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   14034d4e2:	b8 04 00 00 00       	mov    eax,0x4
   14034d4e7:	49 8b e8             	mov    rbp,r8
   14034d4ea:	48 f7 e6             	mul    rsi
   14034d4ed:	48 0f 40 c1          	cmovo  rax,rcx
   14034d4f1:	48 8b c8             	mov    rcx,rax
   14034d4f4:	e8 67 e0 2c 00       	call   0x14061b560
   14034d4f9:	45 33 c0             	xor    r8d,r8d
   14034d4fc:	4c 8b e8             	mov    r13,rax
   14034d4ff:	45 0f b7 e0          	movzx  r12d,r8w
   14034d503:	66 44 3b c6          	cmp    r8w,si
   14034d507:	0f 83 cf 01 00 00    	jae    0x14034d6dc
   14034d50d:	4c 8b 9c 24 f0 00 00 	mov    r11,QWORD PTR [rsp+0xf0]
   14034d514:	00 
   14034d515:	8b 15 c9 ca 63 00    	mov    edx,DWORD PTR [rip+0x63cac9]        # 0x140989fe4
   14034d51b:	4c 8b 94 24 d0 00 00 	mov    r10,QWORD PTR [rsp+0xd0]
   14034d522:	00 
   14034d523:	48 89 9c 24 e0 00 00 	mov    QWORD PTR [rsp+0xe0],rbx
   14034d52a:	00 
   14034d52b:	48 89 bc 24 a0 00 00 	mov    QWORD PTR [rsp+0xa0],rdi
   14034d532:	00 
   14034d533:	8b bc 24 f8 00 00 00 	mov    edi,DWORD PTR [rsp+0xf8]
   14034d53a:	4c 89 b4 24 98 00 00 	mov    QWORD PTR [rsp+0x98],r14
   14034d541:	00 
   14034d542:	4c 89 bc 24 90 00 00 	mov    QWORD PTR [rsp+0x90],r15
   14034d549:	00 
   14034d54a:	44 8b bc 24 00 01 00 	mov    r15d,DWORD PTR [rsp+0x100]
   14034d551:	00 
   14034d552:	0f 29 b4 24 80 00 00 	movaps XMMWORD PTR [rsp+0x80],xmm6
   14034d559:	00 
   14034d55a:	f3 0f 10 35 22 2d 50 	movss  xmm6,DWORD PTR [rip+0x502d22]        # 0x140850284
   14034d561:	00 
   14034d562:	0f 29 7c 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm7
   14034d567:	f3 0f 10 3d 71 9c 34 	movss  xmm7,DWORD PTR [rip+0x349c71]        # 0x1406971e0
   14034d56e:	00 
   14034d56f:	44 0f 29 44 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm8
   14034d575:	f3 44 0f 10 05 56 b7 	movss  xmm8,DWORD PTR [rip+0x34b756]        # 0x140698cd4
   14034d57c:	34 00 
   14034d57e:	66 90                	xchg   ax,ax
   14034d580:	41 80 ba 92 00 00 00 	cmp    BYTE PTR [r10+0x92],0x0
   14034d587:	00 
   14034d588:	74 06                	je     0x14034d590
   14034d58a:	41 0f 28 c8          	movaps xmm1,xmm8
   14034d58e:	eb 03                	jmp    0x14034d593
   14034d590:	0f 28 cf             	movaps xmm1,xmm7
   14034d593:	41 0f b7 cc          	movzx  ecx,r12w
   14034d597:	66 0f 6e c1          	movd   xmm0,ecx
   14034d59b:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14034d59e:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14034d5a2:	0f 2f c8             	comiss xmm1,xmm0
   14034d5a5:	0f 87 f0 00 00 00    	ja     0x14034d69b
   14034d5ab:	8b df                	mov    ebx,edi
   14034d5ad:	41 3b ff             	cmp    edi,r15d
   14034d5b0:	0f 8f e5 00 00 00    	jg     0x14034d69b
   14034d5b6:	44 0f b7 f6          	movzx  r14d,si
   14034d5ba:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14034d5c0:	8b c2                	mov    eax,edx
   14034d5c2:	2b c7                	sub    eax,edi
   14034d5c4:	03 c3                	add    eax,ebx
   14034d5c6:	41 0f af c6          	imul   eax,r14d
   14034d5ca:	03 c1                	add    eax,ecx
   14034d5cc:	48 98                	cdqe
   14034d5ce:	48 69 c8 10 04 00 00 	imul   rcx,rax,0x410
   14034d5d5:	f3 0f 10 04 29       	movss  xmm0,DWORD PTR [rcx+rbp*1]
   14034d5da:	0f 2f c6             	comiss xmm0,xmm6
   14034d5dd:	0f 86 a9 00 00 00    	jbe    0x14034d68c
   14034d5e3:	4d 8b cd             	mov    r9,r13
   14034d5e6:	8b c7                	mov    eax,edi
   14034d5e8:	2b c2                	sub    eax,edx
   14034d5ea:	3b d8                	cmp    ebx,eax
   14034d5ec:	7f 05                	jg     0x14034d5f3
   14034d5ee:	0f 28 c6             	movaps xmm0,xmm6
   14034d5f1:	eb 1f                	jmp    0x14034d612
   14034d5f3:	2b d7                	sub    edx,edi
   14034d5f5:	41 0f b7 c0          	movzx  eax,r8w
   14034d5f9:	8d 4b ff             	lea    ecx,[rbx-0x1]
   14034d5fc:	03 ca                	add    ecx,edx
   14034d5fe:	41 0f af ce          	imul   ecx,r14d
   14034d602:	03 c1                	add    eax,ecx
   14034d604:	48 98                	cdqe
   14034d606:	48 69 c8 10 04 00 00 	imul   rcx,rax,0x410
   14034d60d:	f3 0f 10 04 29       	movss  xmm0,DWORD PTR [rcx+rbp*1]
   14034d612:	f3 41 0f 11 01       	movss  DWORD PTR [r9],xmm0
   14034d617:	66 41 ff c0          	inc    r8w
   14034d61b:	49 83 c1 04          	add    r9,0x4
   14034d61f:	66 44 3b c6          	cmp    r8w,si
   14034d623:	73 08                	jae    0x14034d62d
   14034d625:	8b 15 b9 c9 63 00    	mov    edx,DWORD PTR [rip+0x63c9b9]        # 0x140989fe4
   14034d62b:	eb b9                	jmp    0x14034d5e6
   14034d62d:	48 8b 94 24 d8 00 00 	mov    rdx,QWORD PTR [rsp+0xd8]
   14034d634:	00 
   14034d635:	44 0f b7 ce          	movzx  r9d,si
   14034d639:	44 89 7c 24 58       	mov    DWORD PTR [rsp+0x58],r15d
   14034d63e:	4c 8b c5             	mov    r8,rbp
   14034d641:	89 7c 24 50          	mov    DWORD PTR [rsp+0x50],edi
   14034d645:	49 8b ca             	mov    rcx,r10
   14034d648:	4c 89 5c 24 48       	mov    QWORD PTR [rsp+0x48],r11
   14034d64d:	c6 44 24 40 00       	mov    BYTE PTR [rsp+0x40],0x0
   14034d652:	c7 44 24 38 01 00 00 	mov    DWORD PTR [rsp+0x38],0x1
   14034d659:	00 
   14034d65a:	89 5c 24 30          	mov    DWORD PTR [rsp+0x30],ebx
   14034d65e:	66 44 89 64 24 28    	mov    WORD PTR [rsp+0x28],r12w
   14034d664:	4c 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],r13
   14034d669:	e8 82 bc ff ff       	call   0x1403492f0
   14034d66e:	8b 15 70 c9 63 00    	mov    edx,DWORD PTR [rip+0x63c970]        # 0x140989fe4
   14034d674:	3b c3                	cmp    eax,ebx
   14034d676:	4c 8b 94 24 d0 00 00 	mov    r10,QWORD PTR [rsp+0xd0]
   14034d67d:	00 
   14034d67e:	4c 8b 9c 24 f0 00 00 	mov    r11,QWORD PTR [rsp+0xf0]
   14034d685:	00 
   14034d686:	0f 4d d8             	cmovge ebx,eax
   14034d689:	45 33 c0             	xor    r8d,r8d
   14034d68c:	ff c3                	inc    ebx
   14034d68e:	41 0f b7 cc          	movzx  ecx,r12w
   14034d692:	41 3b df             	cmp    ebx,r15d
   14034d695:	0f 8e 25 ff ff ff    	jle    0x14034d5c0
   14034d69b:	66 41 ff c4          	inc    r12w
   14034d69f:	66 44 3b e6          	cmp    r12w,si
   14034d6a3:	0f 82 d7 fe ff ff    	jb     0x14034d580
   14034d6a9:	44 0f 28 44 24 60    	movaps xmm8,XMMWORD PTR [rsp+0x60]
   14034d6af:	0f 28 7c 24 70       	movaps xmm7,XMMWORD PTR [rsp+0x70]
   14034d6b4:	0f 28 b4 24 80 00 00 	movaps xmm6,XMMWORD PTR [rsp+0x80]
   14034d6bb:	00 
   14034d6bc:	4c 8b bc 24 90 00 00 	mov    r15,QWORD PTR [rsp+0x90]
   14034d6c3:	00 
   14034d6c4:	4c 8b b4 24 98 00 00 	mov    r14,QWORD PTR [rsp+0x98]
   14034d6cb:	00 
   14034d6cc:	48 8b bc 24 a0 00 00 	mov    rdi,QWORD PTR [rsp+0xa0]
   14034d6d3:	00 
   14034d6d4:	48 8b 9c 24 e0 00 00 	mov    rbx,QWORD PTR [rsp+0xe0]
   14034d6db:	00 
   14034d6dc:	49 8b cd             	mov    rcx,r13
   14034d6df:	48 81 c4 a8 00 00 00 	add    rsp,0xa8
   14034d6e6:	41 5d                	pop    r13
   14034d6e8:	41 5c                	pop    r12
   14034d6ea:	5e                   	pop    rsi
   14034d6eb:	5d                   	pop    rbp
   14034d6ec:	e9 67 de 2c 00       	jmp    0x14061b558
   14034d6f1:	cc                   	int3
   14034d6f2:	cc                   	int3
   14034d6f3:	cc                   	int3
   14034d6f4:	cc                   	int3
   14034d6f5:	cc                   	int3
   14034d6f6:	cc                   	int3
   14034d6f7:	cc                   	int3
   14034d6f8:	cc                   	int3
   14034d6f9:	cc                   	int3
   14034d6fa:	cc                   	int3
   14034d6fb:	cc                   	int3
   14034d6fc:	cc                   	int3
   14034d6fd:	cc                   	int3
   14034d6fe:	cc                   	int3
   14034d6ff:	cc                   	int3
   14034d700:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14034d705:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   14034d70a:	57                   	push   rdi
   14034d70b:	48 83 ec 20          	sub    rsp,0x20
   14034d70f:	33 db                	xor    ebx,ebx
   14034d711:	48 8b f2             	mov    rsi,rdx
   14034d714:	48 8b f9             	mov    rdi,rcx
   14034d717:	39 1a                	cmp    DWORD PTR [rdx],ebx
   14034d719:	76 1d                	jbe    0x14034d738
   14034d71b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14034d720:	48 8b 0f             	mov    rcx,QWORD PTR [rdi]
   14034d723:	8b c3                	mov    eax,ebx
   14034d725:	4c 6b c0 38          	imul   r8,rax,0x38
   14034d729:	49 8b 0c 08          	mov    rcx,QWORD PTR [r8+rcx*1]
   14034d72d:	e8 26 de 2c 00       	call   0x14061b558
   14034d732:	ff c3                	inc    ebx
   14034d734:	3b 1e                	cmp    ebx,DWORD PTR [rsi]
   14034d736:	72 e8                	jb     0x14034d720
   14034d738:	48 8b 0f             	mov    rcx,QWORD PTR [rdi]
   14034d73b:	e8 18 de 2c 00       	call   0x14061b558
   14034d740:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   14034d745:	48 c7 07 00 00 00 00 	mov    QWORD PTR [rdi],0x0
   14034d74c:	c7 06 00 00 00 00    	mov    DWORD PTR [rsi],0x0
   14034d752:	48 8b 74 24 38       	mov    rsi,QWORD PTR [rsp+0x38]
   14034d757:	48 83 c4 20          	add    rsp,0x20
   14034d75b:	5f                   	pop    rdi
   14034d75c:	c3                   	ret
   14034d75d:	cc                   	int3
   14034d75e:	cc                   	int3
   14034d75f:	cc                   	int3
   14034d760:	cc                   	int3
   14034d761:	cc                   	int3
   14034d762:	cc                   	int3
   14034d763:	cc                   	int3
   14034d764:	cc                   	int3
   14034d765:	cc                   	int3
   14034d766:	cc                   	int3
   14034d767:	cc                   	int3
   14034d768:	cc                   	int3
   14034d769:	cc                   	int3
   14034d76a:	cc                   	int3
   14034d76b:	cc                   	int3
   14034d76c:	cc                   	int3
   14034d76d:	cc                   	int3
   14034d76e:	cc                   	int3
   14034d76f:	cc                   	int3
