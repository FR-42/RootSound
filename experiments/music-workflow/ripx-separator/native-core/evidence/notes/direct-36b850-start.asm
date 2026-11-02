
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014036b850 <.text+0x36a850>:
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
   14036b89e:	4c 8b e2             	mov    r12,rdx
   14036b8a1:	48 8b e9             	mov    rbp,rcx
   14036b8a4:	48 85 c9             	test   rcx,rcx
   14036b8a7:	0f 84 7b 09 00 00    	je     0x14036c228
   14036b8ad:	8b 71 04             	mov    esi,DWORD PTR [rcx+0x4]
   14036b8b0:	2b 31                	sub    esi,DWORD PTR [rcx]
   14036b8b2:	48 85 c0             	test   rax,rax
   14036b8b5:	74 04                	je     0x14036b8bb
   14036b8b7:	8b 08                	mov    ecx,DWORD PTR [rax]
   14036b8b9:	eb 02                	jmp    0x14036b8bd
   14036b8bb:	8b ce                	mov    ecx,esi
   14036b8bd:	0f b7 85 1c 02 00 00 	movzx  eax,WORD PTR [rbp+0x21c]
   14036b8c4:	44 8b f9             	mov    r15d,ecx
   14036b8c7:	f3 0f 10 b5 7c 02 00 	movss  xmm6,DWORD PTR [rbp+0x27c]
   14036b8ce:	00 
   14036b8cf:	66 85 c0             	test   ax,ax
   14036b8d2:	89 4c 24 30          	mov    DWORD PTR [rsp+0x30],ecx
   14036b8d6:	44 8b ee             	mov    r13d,esi
   14036b8d9:	b9 01 00 00 00       	mov    ecx,0x1
   14036b8de:	44 0f 48 f9          	cmovs  r15d,ecx
   14036b8e2:	44 0f 48 e9          	cmovs  r13d,ecx
   14036b8e6:	b9 c0 02 00 00       	mov    ecx,0x2c0
   14036b8eb:	44 89 7c 24 3c       	mov    DWORD PTR [rsp+0x3c],r15d
   14036b8f0:	e8 5b fd 2a 00       	call   0x14061b650
   14036b8f5:	49 89 04 24          	mov    QWORD PTR [r12],rax
   14036b8f9:	48 8b cd             	mov    rcx,rbp
   14036b8fc:	ba 05 00 00 00       	mov    edx,0x5
   14036b901:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14036b908:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14036b90b:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14036b912:	0f 11 40 80          	movups XMMWORD PTR [rax-0x80],xmm0
   14036b916:	0f 10 49 90          	movups xmm1,XMMWORD PTR [rcx-0x70]
   14036b91a:	0f 11 48 90          	movups XMMWORD PTR [rax-0x70],xmm1
   14036b91e:	0f 10 41 a0          	movups xmm0,XMMWORD PTR [rcx-0x60]
   14036b922:	0f 11 40 a0          	movups XMMWORD PTR [rax-0x60],xmm0
   14036b926:	0f 10 49 b0          	movups xmm1,XMMWORD PTR [rcx-0x50]
   14036b92a:	0f 11 48 b0          	movups XMMWORD PTR [rax-0x50],xmm1
   14036b92e:	0f 10 41 c0          	movups xmm0,XMMWORD PTR [rcx-0x40]
   14036b932:	0f 11 40 c0          	movups XMMWORD PTR [rax-0x40],xmm0
   14036b936:	0f 10 49 d0          	movups xmm1,XMMWORD PTR [rcx-0x30]
   14036b93a:	0f 11 48 d0          	movups XMMWORD PTR [rax-0x30],xmm1
   14036b93e:	0f 10 41 e0          	movups xmm0,XMMWORD PTR [rcx-0x20]
   14036b942:	0f 11 40 e0          	movups XMMWORD PTR [rax-0x20],xmm0
   14036b946:	0f 10 49 f0          	movups xmm1,XMMWORD PTR [rcx-0x10]
   14036b94a:	0f 11 48 f0          	movups XMMWORD PTR [rax-0x10],xmm1
   14036b94e:	48 83 ea 01          	sub    rdx,0x1
   14036b952:	75 ad                	jne    0x14036b901
   14036b954:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14036b957:	45 33 c0             	xor    r8d,r8d
   14036b95a:	0f 11 00             	movups XMMWORD PTR [rax],xmm0
   14036b95d:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14036b961:	0f 11 48 10          	movups XMMWORD PTR [rax+0x10],xmm1
   14036b965:	0f 10 41 20          	movups xmm0,XMMWORD PTR [rcx+0x20]
   14036b969:	0f 11 40 20          	movups XMMWORD PTR [rax+0x20],xmm0
   14036b96d:	0f 10 49 30          	movups xmm1,XMMWORD PTR [rcx+0x30]
   14036b971:	0f 11 48 30          	movups XMMWORD PTR [rax+0x30],xmm1
   14036b975:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b979:	4c 89 80 88 02 00 00 	mov    QWORD PTR [rax+0x288],r8
   14036b980:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b984:	66 44 89 80 92 02 00 	mov    WORD PTR [rax+0x292],r8w
   14036b98b:	00 
   14036b98c:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b990:	66 44 89 80 90 02 00 	mov    WORD PTR [rax+0x290],r8w
   14036b997:	00 
   14036b998:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b99c:	4c 89 80 98 02 00 00 	mov    QWORD PTR [rax+0x298],r8
   14036b9a3:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b9a7:	4c 89 40 18          	mov    QWORD PTR [rax+0x18],r8
   14036b9ab:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b9af:	4c 89 80 b0 02 00 00 	mov    QWORD PTR [rax+0x2b0],r8
   14036b9b6:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b9ba:	66 44 89 80 6a 02 00 	mov    WORD PTR [rax+0x26a],r8w
   14036b9c1:	00 
   14036b9c2:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b9c6:	66 44 89 80 68 02 00 	mov    WORD PTR [rax+0x268],r8w
   14036b9cd:	00 
   14036b9ce:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036b9d2:	4c 89 80 60 02 00 00 	mov    QWORD PTR [rax+0x260],r8
   14036b9d9:	44 38 84 24 20 01 00 	cmp    BYTE PTR [rsp+0x120],r8b
   14036b9e0:	00 
   14036b9e1:	74 34                	je     0x14036ba17
   14036b9e3:	f3 0f 10 84 24 48 01 	movss  xmm0,DWORD PTR [rsp+0x148]
   14036b9ea:	00 00 
   14036b9ec:	44 8d 42 01          	lea    r8d,[rdx+0x1]
   14036b9f0:	f3 0f 10 8c 24 40 01 	movss  xmm1,DWORD PTR [rsp+0x140]
   14036b9f7:	00 00 
   14036b9f9:	45 33 c9             	xor    r9d,r9d
   14036b9fc:	49 8b 14 24          	mov    rdx,QWORD PTR [r12]
   14036ba00:	48 8b cd             	mov    rcx,rbp
   14036ba03:	f3 0f 11 44 24 28    	movss  DWORD PTR [rsp+0x28],xmm0
   14036ba09:	f3 0f 11 4c 24 20    	movss  DWORD PTR [rsp+0x20],xmm1
   14036ba0f:	e8 4c 0b f1 ff       	call   0x14027c560
   14036ba14:	45 33 c0             	xor    r8d,r8d
   14036ba17:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036ba1b:	4c 89 80 70 02 00 00 	mov    QWORD PTR [rax+0x270],r8
   14036ba22:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036ba26:	66 44 89 80 78 02 00 	mov    WORD PTR [rax+0x278],r8w
   14036ba2d:	00 
   14036ba2e:	40 84 ff             	test   dil,dil
   14036ba31:	74 19                	je     0x14036ba4c
   14036ba33:	8b 0d ef d5 5c 00    	mov    ecx,DWORD PTR [rip+0x5cd5ef]        # 0x140939028
   14036ba39:	8d 41 01             	lea    eax,[rcx+0x1]
   14036ba3c:	89 05 e6 d5 5c 00    	mov    DWORD PTR [rip+0x5cd5e6],eax        # 0x140939028
   14036ba42:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036ba46:	89 88 28 02 00 00    	mov    DWORD PTR [rax+0x228],ecx
   14036ba4c:	48 85 db             	test   rbx,rbx
   14036ba4f:	74 21                	je     0x14036ba72
   14036ba51:	49 8b 0c 24          	mov    rcx,QWORD PTR [r12]
   14036ba55:	0f b6 84 24 28 01 00 	movzx  eax,BYTE PTR [rsp+0x128]
   14036ba5c:	00 
   14036ba5d:	88 41 60             	mov    BYTE PTR [rcx+0x60],al
   14036ba60:	0f 10 03             	movups xmm0,XMMWORD PTR [rbx]
   14036ba63:	0f 10 4b 10          	movups xmm1,XMMWORD PTR [rbx+0x10]
   14036ba67:	0f 11 44 24 60       	movups XMMWORD PTR [rsp+0x60],xmm0
   14036ba6c:	0f 10 43 20          	movups xmm0,XMMWORD PTR [rbx+0x20]
   14036ba70:	eb 14                	jmp    0x14036ba86
   14036ba72:	0f 10 45 61          	movups xmm0,XMMWORD PTR [rbp+0x61]
   14036ba76:	0f 10 4d 71          	movups xmm1,XMMWORD PTR [rbp+0x71]
   14036ba7a:	0f 11 44 24 60       	movups XMMWORD PTR [rsp+0x60],xmm0
   14036ba7f:	0f 10 85 81 00 00 00 	movups xmm0,XMMWORD PTR [rbp+0x81]
   14036ba86:	66 83 bd 1c 02 00 00 	cmp    WORD PTR [rbp+0x21c],0x0
   14036ba8d:	00 
   14036ba8e:	41 8b c8             	mov    ecx,r8d
   14036ba91:	41 0f b6 c6          	movzx  eax,r14b
   14036ba95:	0f 4d c8             	cmovge ecx,eax
   14036ba98:	0f 11 84 24 80 00 00 	movups XMMWORD PTR [rsp+0x80],xmm0
   14036ba9f:	00 
   14036baa0:	0f 11 4c 24 70       	movups XMMWORD PTR [rsp+0x70],xmm1
   14036baa5:	84 c9                	test   cl,cl
   14036baa7:	0f 84 93 00 00 00    	je     0x14036bb40
   14036baad:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036bab1:	45 8b d0             	mov    r10d,r8d
   14036bab4:	41 bb 03 00 00 00    	mov    r11d,0x3
   14036baba:	c6 40 60 30          	mov    BYTE PTR [rax+0x60],0x30
   14036babe:	66 90                	xchg   ax,ax
   14036bac0:	48 85 db             	test   rbx,rbx
   14036bac3:	75 11                	jne    0x14036bad6
   14036bac5:	49 63 c2             	movsxd rax,r10d
   14036bac8:	48 83 f8 30          	cmp    rax,0x30
   14036bacc:	0f 83 8b 07 00 00    	jae    0x14036c25d
   14036bad2:	88 5c 04 60          	mov    BYTE PTR [rsp+rax*1+0x60],bl
   14036bad6:	0f b6 4d 60          	movzx  ecx,BYTE PTR [rbp+0x60]
   14036bada:	41 8b c2             	mov    eax,r10d
   14036badd:	99                   	cdq
   14036bade:	49 63 fa             	movsxd rdi,r10d
   14036bae1:	83 e2 03             	and    edx,0x3
   14036bae4:	45 8b cb             	mov    r9d,r11d
   14036bae7:	03 c2                	add    eax,edx
   14036bae9:	c1 f8 02             	sar    eax,0x2
   14036baec:	85 c0                	test   eax,eax
   14036baee:	8b d0                	mov    edx,eax
   14036baf0:	41 0f 4e d0          	cmovle edx,r8d
   14036baf4:	ff c9                	dec    ecx
   14036baf6:	44 3b d9             	cmp    r11d,ecx
   14036baf9:	44 0f 4d c9          	cmovge r9d,ecx
   14036bafd:	0f 1f 00             	nop    DWORD PTR [rax]
   14036bb00:	41 3b d1             	cmp    edx,r9d
   14036bb03:	7f 26                	jg     0x14036bb2b
   14036bb05:	4c 63 c2             	movsxd r8,edx
   14036bb08:	48 8b c3             	mov    rax,rbx
   14036bb0b:	48 85 db             	test   rbx,rbx
   14036bb0e:	75 04                	jne    0x14036bb14
   14036bb10:	48 8d 45 61          	lea    rax,[rbp+0x61]
   14036bb14:	0f b6 4c 3c 60       	movzx  ecx,BYTE PTR [rsp+rdi*1+0x60]
   14036bb19:	41 0f b6 04 00       	movzx  eax,BYTE PTR [r8+rax*1]
   14036bb1e:	3a c8                	cmp    cl,al
   14036bb20:	0f 43 c1             	cmovae eax,ecx
   14036bb23:	ff c2                	inc    edx
   14036bb25:	88 44 3c 60          	mov    BYTE PTR [rsp+rdi*1+0x60],al
   14036bb29:	eb d5                	jmp    0x14036bb00
   14036bb2b:	41 ff c2             	inc    r10d
   14036bb2e:	41 83 c3 04          	add    r11d,0x4
   14036bb32:	41 81 fb c3 00 00 00 	cmp    r11d,0xc3
   14036bb39:	7d 05                	jge    0x14036bb40
   14036bb3b:	45 33 c0             	xor    r8d,r8d
   14036bb3e:	eb 80                	jmp    0x14036bac0
   14036bb40:	49 8b 0c 24          	mov    rcx,QWORD PTR [r12]
   14036bb44:	4c 8d 4c 24 60       	lea    r9,[rsp+0x60]
   14036bb49:	8b 5c 24 30          	mov    ebx,DWORD PTR [rsp+0x30]
   14036bb4d:	8b d3                	mov    edx,ebx
   14036bb4f:	44 0f b6 41 60       	movzx  r8d,BYTE PTR [rcx+0x60]
   14036bb54:	e8 37 e8 ff ff       	call   0x14036a390
   14036bb59:	84 c0                	test   al,al
   14036bb5b:	0f 84 c7 06 00 00    	je     0x14036c228
   14036bb61:	49 8b 14 24          	mov    rdx,QWORD PTR [r12]
   14036bb65:	0f 29 bc 24 a0 00 00 	movaps XMMWORD PTR [rsp+0xa0],xmm7
   14036bb6c:	00 
   14036bb6d:	0f 57 ff             	xorps  xmm7,xmm7
   14036bb70:	8b 0a                	mov    ecx,DWORD PTR [rdx]
   14036bb72:	03 cb                	add    ecx,ebx
   14036bb74:	80 bc 24 50 01 00 00 	cmp    BYTE PTR [rsp+0x150],0x0
   14036bb7b:	00 
   14036bb7c:	89 4a 04             	mov    DWORD PTR [rdx+0x4],ecx
   14036bb7f:	0f 84 81 00 00 00    	je     0x14036bc06
   14036bb85:	48 83 7d 18 00       	cmp    QWORD PTR [rbp+0x18],0x0
   14036bb8a:	74 7a                	je     0x14036bc06
   14036bb8c:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   14036bb93:	b8 04 00 00 00       	mov    eax,0x4
   14036bb98:	48 f7 e3             	mul    rbx
   14036bb9b:	48 0f 40 c1          	cmovo  rax,rcx
   14036bb9f:	48 8b c8             	mov    rcx,rax
   14036bba2:	e8 b9 f9 2a 00       	call   0x14061b560
   14036bba7:	49 8b 0c 24          	mov    rcx,QWORD PTR [r12]
   14036bbab:	44 8b c3             	mov    r8d,ebx
   14036bbae:	3b f3                	cmp    esi,ebx
   14036bbb0:	44 0f 42 c6          	cmovb  r8d,esi
   14036bbb4:	48 89 41 18          	mov    QWORD PTR [rcx+0x18],rax
   14036bbb8:	49 8b 0c 24          	mov    rcx,QWORD PTR [r12]
   14036bbbc:	48 8b 55 18          	mov    rdx,QWORD PTR [rbp+0x18]
   14036bbc0:	49 c1 e0 02          	shl    r8,0x2
   14036bbc4:	48 8b 49 18          	mov    rcx,QWORD PTR [rcx+0x18]
   14036bbc8:	e8 17 51 2b 00       	call   0x140620ce4
   14036bbcd:	3b de                	cmp    ebx,esi
   14036bbcf:	76 35                	jbe    0x14036bc06
   14036bbd1:	85 f6                	test   esi,esi
   14036bbd3:	74 0e                	je     0x14036bbe3
   14036bbd5:	48 8b 45 18          	mov    rax,QWORD PTR [rbp+0x18]
   14036bbd9:	8d 4e ff             	lea    ecx,[rsi-0x1]
   14036bbdc:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036bbe1:	eb 03                	jmp    0x14036bbe6
   14036bbe3:	0f 57 c0             	xorps  xmm0,xmm0
   14036bbe6:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036bbea:	4c 8d 44 24 38       	lea    r8,[rsp+0x38]
   14036bbef:	f3 0f 11 44 24 38    	movss  DWORD PTR [rsp+0x38],xmm0
   14036bbf5:	48 8b 48 18          	mov    rcx,QWORD PTR [rax+0x18]
   14036bbf9:	48 8d 14 99          	lea    rdx,[rcx+rbx*4]
   14036bbfd:	48 8d 0c b1          	lea    rcx,[rcx+rsi*4]
   14036bc01:	e8 ca 10 f5 ff       	call   0x1402bccd0
   14036bc06:	49 8b 3c 24          	mov    rdi,QWORD PTR [r12]
   14036bc0a:	45 33 f6             	xor    r14d,r14d
   14036bc0d:	41 8b d6             	mov    edx,r14d
   14036bc10:	38 57 60             	cmp    BYTE PTR [rdi+0x60],dl
   14036bc13:	76 40                	jbe    0x14036bc55
   14036bc15:	0f b6 45 60          	movzx  eax,BYTE PTR [rbp+0x60]
   14036bc19:	4c 63 c2             	movsxd r8,edx
   14036bc1c:	3b d0                	cmp    edx,eax
   14036bc1e:	7c 10                	jl     0x14036bc30
   14036bc20:	4a 8b 84 c7 98 00 00 	mov    rax,QWORD PTR [rdi+r8*8+0x98]
   14036bc27:	00 
   14036bc28:	8d 4a 01             	lea    ecx,[rdx+0x1]
   14036bc2b:	88 48 2c             	mov    BYTE PTR [rax+0x2c],cl
   14036bc2e:	eb 17                	jmp    0x14036bc47
   14036bc30:	4a 8b 84 c5 98 00 00 	mov    rax,QWORD PTR [rbp+r8*8+0x98]
   14036bc37:	00 
   14036bc38:	4a 8b 8c c7 98 00 00 	mov    rcx,QWORD PTR [rdi+r8*8+0x98]
   14036bc3f:	00 
   14036bc40:	0f b6 40 2c          	movzx  eax,BYTE PTR [rax+0x2c]
   14036bc44:	88 41 2c             	mov    BYTE PTR [rcx+0x2c],al
   14036bc47:	49 8b 3c 24          	mov    rdi,QWORD PTR [r12]
   14036bc4b:	ff c2                	inc    edx
   14036bc4d:	0f                   	.byte 0xf
   14036bc4e:	b6 47                	mov    dh,0x47
