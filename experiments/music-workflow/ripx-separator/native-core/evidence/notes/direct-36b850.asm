
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
   14036bc4d:	0f b6 47 60          	movzx  eax,BYTE PTR [rdi+0x60]
   14036bc51:	3b d0                	cmp    edx,eax
   14036bc53:	7c c0                	jl     0x14036bc15
   14036bc55:	48 8b 55 08          	mov    rdx,QWORD PTR [rbp+0x8]
   14036bc59:	41 8b c7             	mov    eax,r15d
   14036bc5c:	48 8b 4f 08          	mov    rcx,QWORD PTR [rdi+0x8]
   14036bc60:	45 3b ef             	cmp    r13d,r15d
   14036bc63:	41 0f 42 c5          	cmovb  eax,r13d
   14036bc67:	44 8b c0             	mov    r8d,eax
   14036bc6a:	49 c1 e0 02          	shl    r8,0x2
   14036bc6e:	e8 71 50 2b 00       	call   0x140620ce4
   14036bc73:	4d 8b 04 24          	mov    r8,QWORD PTR [r12]
   14036bc77:	49 8b 48 10          	mov    rcx,QWORD PTR [r8+0x10]
   14036bc7b:	48 85 c9             	test   rcx,rcx
   14036bc7e:	74 23                	je     0x14036bca3
   14036bc80:	48 8b 55 10          	mov    rdx,QWORD PTR [rbp+0x10]
   14036bc84:	48 85 d2             	test   rdx,rdx
   14036bc87:	74 1a                	je     0x14036bca3
   14036bc89:	45 3b ef             	cmp    r13d,r15d
   14036bc8c:	41 8b c7             	mov    eax,r15d
   14036bc8f:	41 0f 42 c5          	cmovb  eax,r13d
   14036bc93:	44 8b c0             	mov    r8d,eax
   14036bc96:	49 c1 e0 02          	shl    r8,0x2
   14036bc9a:	e8 45 50 2b 00       	call   0x140620ce4
   14036bc9f:	4d 8b 04 24          	mov    r8,QWORD PTR [r12]
   14036bca3:	66 44 39 b5 1c 02 00 	cmp    WORD PTR [rbp+0x21c],r14w
   14036bcaa:	00 
   14036bcab:	0f 8c 92 00 00 00    	jl     0x14036bd43
   14036bcb1:	45 3b fd             	cmp    r15d,r13d
   14036bcb4:	0f 86 89 00 00 00    	jbe    0x14036bd43
   14036bcba:	45 85 ed             	test   r13d,r13d
   14036bcbd:	74 15                	je     0x14036bcd4
   14036bcbf:	48 8b 45 08          	mov    rax,QWORD PTR [rbp+0x8]
   14036bcc3:	41 8d 4d ff          	lea    ecx,[r13-0x1]
   14036bcc7:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036bccc:	f3 0f 11 44 24 34    	movss  DWORD PTR [rsp+0x34],xmm0
   14036bcd2:	eb 05                	jmp    0x14036bcd9
   14036bcd4:	44 89 74 24 34       	mov    DWORD PTR [rsp+0x34],r14d
   14036bcd9:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   14036bcdd:	4a 8d 14 b8          	lea    rdx,[rax+r15*4]
   14036bce1:	4a 8d 3c a8          	lea    rdi,[rax+r13*4]
   14036bce5:	48 8b ca             	mov    rcx,rdx
   14036bce8:	48 2b cf             	sub    rcx,rdi
   14036bceb:	48 83 c1 03          	add    rcx,0x3
   14036bcef:	48 c1 e9 02          	shr    rcx,0x2
   14036bcf3:	48 3b fa             	cmp    rdi,rdx
   14036bcf6:	49 0f 47 ce          	cmova  rcx,r14
   14036bcfa:	48 85 c9             	test   rcx,rcx
   14036bcfd:	74 07                	je     0x14036bd06
   14036bcff:	48 63 44 24 34       	movsxd rax,DWORD PTR [rsp+0x34]
   14036bd04:	f3 ab                	rep stos DWORD PTR [rdi],eax
   14036bd06:	49 8b 78 10          	mov    rdi,QWORD PTR [r8+0x10]
   14036bd0a:	48 85 ff             	test   rdi,rdi
   14036bd0d:	74 34                	je     0x14036bd43
   14036bd0f:	48 8b 55 10          	mov    rdx,QWORD PTR [rbp+0x10]
   14036bd13:	48 85 d2             	test   rdx,rdx
   14036bd16:	74 2b                	je     0x14036bd43
   14036bd18:	45 85 ed             	test   r13d,r13d
   14036bd1b:	74 0b                	je     0x14036bd28
   14036bd1d:	41 8d 45 ff          	lea    eax,[r13-0x1]
   14036bd21:	f3 0f 10 04 82       	movss  xmm0,DWORD PTR [rdx+rax*4]
   14036bd26:	eb 03                	jmp    0x14036bd2b
   14036bd28:	0f 28 c7             	movaps xmm0,xmm7
   14036bd2b:	4a 8d 14 bf          	lea    rdx,[rdi+r15*4]
   14036bd2f:	f3 0f 11 44 24 38    	movss  DWORD PTR [rsp+0x38],xmm0
   14036bd35:	4a 8d 0c af          	lea    rcx,[rdi+r13*4]
   14036bd39:	4c 8d 44 24 38       	lea    r8,[rsp+0x38]
   14036bd3e:	e8 8d 0f f5 ff       	call   0x1402bccd0
   14036bd43:	49 8b 0c 24          	mov    rcx,QWORD PTR [r12]
   14036bd47:	45 33 c9             	xor    r9d,r9d
   14036bd4a:	45 8b c1             	mov    r8d,r9d
   14036bd4d:	44 89 4c 24 34       	mov    DWORD PTR [rsp+0x34],r9d
   14036bd52:	44 38 41 60          	cmp    BYTE PTR [rcx+0x60],r8b
   14036bd56:	0f 86 c0 04 00 00    	jbe    0x14036c21c
   14036bd5c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14036bd60:	0f b6 45 60          	movzx  eax,BYTE PTR [rbp+0x60]
   14036bd64:	49 63 f8             	movsxd rdi,r8d
   14036bd67:	48 89 7c 24 50       	mov    QWORD PTR [rsp+0x50],rdi
   14036bd6c:	4c 8b b4 f9 98 00 00 	mov    r14,QWORD PTR [rcx+rdi*8+0x98]
   14036bd73:	00 
   14036bd74:	4c 8b bc fd 98 00 00 	mov    r15,QWORD PTR [rbp+rdi*8+0x98]
   14036bd7b:	00 
   14036bd7c:	0f b6 54 39 61       	movzx  edx,BYTE PTR [rcx+rdi*1+0x61]
   14036bd81:	44 3b c0             	cmp    r8d,eax
   14036bd84:	0f 8c be 00 00 00    	jl     0x14036be48
   14036bd8a:	84 d2                	test   dl,dl
   14036bd8c:	0f 84 6b 04 00 00    	je     0x14036c1fd
   14036bd92:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   14036bd95:	44 0f b6 c2          	movzx  r8d,dl
   14036bd99:	33 d2                	xor    edx,edx
   14036bd9b:	44 0f af c3          	imul   r8d,ebx
   14036bd9f:	4d 03 c0             	add    r8,r8
   14036bda2:	e8 43 4f 2b 00       	call   0x140620cea
   14036bda7:	80 bc 24 38 01 00 00 	cmp    BYTE PTR [rsp+0x138],0x0
   14036bdae:	00 
   14036bdaf:	75 35                	jne    0x14036bde6
   14036bdb1:	0f 2e f7             	ucomiss xmm6,xmm7
   14036bdb4:	7a 02                	jp     0x14036bdb8
   14036bdb6:	74 2e                	je     0x14036bde6
   14036bdb8:	66 83 bd 1c 02 00 00 	cmp    WORD PTR [rbp+0x21c],0x0
   14036bdbf:	00 
   14036bdc0:	7c 24                	jl     0x14036bde6
   14036bdc2:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14036bdc7:	45 33 c9             	xor    r9d,r9d
   14036bdca:	49 8b 14 24          	mov    rdx,QWORD PTR [r12]
   14036bdce:	48 8b cd             	mov    rcx,rbp
   14036bdd1:	f3 0f 11 74 24 20    	movss  DWORD PTR [rsp+0x20],xmm6
   14036bdd7:	e8 04 86 00 00       	call   0x1403743e0
   14036bddc:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14036bde1:	e9 17 04 00 00       	jmp    0x14036c1fd
   14036bde6:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036bdea:	33 d2                	xor    edx,edx
   14036bdec:	49 8b 4e 18          	mov    rcx,QWORD PTR [r14+0x18]
   14036bdf0:	44 0f b6 44 38 61    	movzx  r8d,BYTE PTR [rax+rdi*1+0x61]
   14036bdf6:	44 0f af c3          	imul   r8d,ebx
   14036bdfa:	4d 03 c0             	add    r8,r8
   14036bdfd:	e8 e8 4e 2b 00       	call   0x140620cea
   14036be02:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036be06:	33 d2                	xor    edx,edx
   14036be08:	49 8b 4e 08          	mov    rcx,QWORD PTR [r14+0x8]
   14036be0c:	44 0f b6 44 38 61    	movzx  r8d,BYTE PTR [rax+rdi*1+0x61]
   14036be12:	44 0f af c3          	imul   r8d,ebx
   14036be16:	49 c1 e0 02          	shl    r8,0x2
   14036be1a:	e8 cb 4e 2b 00       	call   0x140620cea
   14036be1f:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036be23:	33 d2                	xor    edx,edx
   14036be25:	49 8b 4e 10          	mov    rcx,QWORD PTR [r14+0x10]
   14036be29:	44 0f b6 44 38 61    	movzx  r8d,BYTE PTR [rax+rdi*1+0x61]
   14036be2f:	44 0f af 44 24 3c    	imul   r8d,DWORD PTR [rsp+0x3c]
   14036be35:	49 c1 e0 02          	shl    r8,0x2
   14036be39:	e8 ac 4e 2b 00       	call   0x140620cea
   14036be3e:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14036be43:	e9 b5 03 00 00       	jmp    0x14036c1fd
   14036be48:	0f b6 4c 2f 61       	movzx  ecx,BYTE PTR [rdi+rbp*1+0x61]
   14036be4d:	3a d1                	cmp    dl,cl
   14036be4f:	0f b6 c2             	movzx  eax,dl
   14036be52:	8b 54 24 30          	mov    edx,DWORD PTR [rsp+0x30]
   14036be56:	0f 43 c1             	cmovae eax,ecx
   14036be59:	0f b6 c0             	movzx  eax,al
   14036be5c:	89 44 24 38          	mov    DWORD PTR [rsp+0x38],eax
   14036be60:	85 c0                	test   eax,eax
   14036be62:	0f 84 c4 02 00 00    	je     0x14036c12c
   14036be68:	3b d6                	cmp    edx,esi
   14036be6a:	75 6b                	jne    0x14036bed7
   14036be6c:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   14036be6f:	0f af c2             	imul   eax,edx
   14036be72:	49 8b 17             	mov    rdx,QWORD PTR [r15]
   14036be75:	8b f8                	mov    edi,eax
   14036be77:	48 8d 1c 00          	lea    rbx,[rax+rax*1]
   14036be7b:	4c 8b c3             	mov    r8,rbx
   14036be7e:	e8 61 4e 2b 00       	call   0x140620ce4
   14036be83:	49 8b 57 08          	mov    rdx,QWORD PTR [r15+0x8]
   14036be87:	4c 8d 04 bd 00 00 00 	lea    r8,[rdi*4+0x0]
   14036be8e:	00 
   14036be8f:	49 8b 4e 08          	mov    rcx,QWORD PTR [r14+0x8]
   14036be93:	e8 4c 4e 2b 00       	call   0x140620ce4
   14036be98:	44 8b 44 24 38       	mov    r8d,DWORD PTR [rsp+0x38]
   14036be9d:	44 0f af 44 24 3c    	imul   r8d,DWORD PTR [rsp+0x3c]
   14036bea3:	49 8b 57 10          	mov    rdx,QWORD PTR [r15+0x10]
   14036bea7:	49 8b 4e 10          	mov    rcx,QWORD PTR [r14+0x10]
   14036beab:	49 c1 e0 02          	shl    r8,0x2
   14036beaf:	e8 30 4e 2b 00       	call   0x140620ce4
   14036beb4:	49 8b 57 18          	mov    rdx,QWORD PTR [r15+0x18]
   14036beb8:	4c 8b c3             	mov    r8,rbx
   14036bebb:	49 8b 4e 18          	mov    rcx,QWORD PTR [r14+0x18]
   14036bebf:	e8 20 4e 2b 00       	call   0x140620ce4
   14036bec4:	8b 54 24 30          	mov    edx,DWORD PTR [rsp+0x30]
   14036bec8:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14036becd:	48 8b 7c 24 50       	mov    rdi,QWORD PTR [rsp+0x50]
   14036bed2:	e9 55 02 00 00       	jmp    0x14036c12c
   14036bed7:	45 32 e4             	xor    r12b,r12b
   14036beda:	85 c0                	test   eax,eax
   14036bedc:	0f 84 45 02 00 00    	je     0x14036c127
   14036bee2:	41 8b d9             	mov    ebx,r9d
   14036bee5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14036beec:	00 00 00 00 
   14036bef0:	49 8b 07             	mov    rax,QWORD PTR [r15]
   14036bef3:	44 8b c2             	mov    r8d,edx
   14036bef6:	44 8b cb             	mov    r9d,ebx
   14036bef9:	3b f2                	cmp    esi,edx
   14036befb:	8b fb                	mov    edi,ebx
   14036befd:	44 0f 42 c6          	cmovb  r8d,esi
   14036bf01:	44 0f af ca          	imul   r9d,edx
   14036bf05:	0f af fe             	imul   edi,esi
   14036bf08:	4d 03 c0             	add    r8,r8
   14036bf0b:	4c 89 4c 24 40       	mov    QWORD PTR [rsp+0x40],r9
   14036bf10:	48 8d 14 78          	lea    rdx,[rax+rdi*2]
   14036bf14:	49 8b 06             	mov    rax,QWORD PTR [r14]
   14036bf17:	4a 8d 0c 48          	lea    rcx,[rax+r9*2]
   14036bf1b:	e8 c4 4d 2b 00       	call   0x140620ce4
   14036bf20:	49 8b 47 08          	mov    rax,QWORD PTR [r15+0x8]
   14036bf24:	44 8b 44 24 30       	mov    r8d,DWORD PTR [rsp+0x30]
   14036bf29:	41 3b f0             	cmp    esi,r8d
   14036bf2c:	48 8b 4c 24 40       	mov    rcx,QWORD PTR [rsp+0x40]
   14036bf31:	44 0f 42 c6          	cmovb  r8d,esi
   14036bf35:	48 8d 14 b8          	lea    rdx,[rax+rdi*4]
   14036bf39:	49 c1 e0 02          	shl    r8,0x2
   14036bf3d:	49 8b 46 08          	mov    rax,QWORD PTR [r14+0x8]
   14036bf41:	48 8d 0c 88          	lea    rcx,[rax+rcx*4]
   14036bf45:	e8 9a 4d 2b 00       	call   0x140620ce4
   14036bf4a:	8b 54 24 3c          	mov    edx,DWORD PTR [rsp+0x3c]
   14036bf4e:	44 8b cb             	mov    r9d,ebx
   14036bf51:	49 8b 47 10          	mov    rax,QWORD PTR [r15+0x10]
   14036bf55:	44 8b c2             	mov    r8d,edx
   14036bf58:	44 3b ea             	cmp    r13d,edx
   14036bf5b:	8b cb                	mov    ecx,ebx
   14036bf5d:	45 0f 42 c5          	cmovb  r8d,r13d
   14036bf61:	44 0f af ca          	imul   r9d,edx
   14036bf65:	41 0f af cd          	imul   ecx,r13d
   14036bf69:	49 c1 e0 02          	shl    r8,0x2
   14036bf6d:	4c 89 4c 24 48       	mov    QWORD PTR [rsp+0x48],r9
   14036bf72:	48 8d 14 88          	lea    rdx,[rax+rcx*4]
   14036bf76:	49 8b 46 10          	mov    rax,QWORD PTR [r14+0x10]
   14036bf7a:	4a 8d 0c 88          	lea    rcx,[rax+r9*4]
   14036bf7e:	e8 61 4d 2b 00       	call   0x140620ce4
   14036bf83:	49 8b 47 18          	mov    rax,QWORD PTR [r15+0x18]
   14036bf87:	44 8b 44 24 30       	mov    r8d,DWORD PTR [rsp+0x30]
   14036bf8c:	41 3b f0             	cmp    esi,r8d
   14036bf8f:	44 0f 42 c6          	cmovb  r8d,esi
   14036bf93:	48 8d 14 78          	lea    rdx,[rax+rdi*2]
   14036bf97:	4d 03 c0             	add    r8,r8
   14036bf9a:	49 8b 46 18          	mov    rax,QWORD PTR [r14+0x18]
   14036bf9e:	48 8b 7c 24 40       	mov    rdi,QWORD PTR [rsp+0x40]
   14036bfa3:	48 8d 0c 78          	lea    rcx,[rax+rdi*2]
   14036bfa7:	e8 38 4d 2b 00       	call   0x140620ce4
   14036bfac:	8b 54 24 30          	mov    edx,DWORD PTR [rsp+0x30]
   14036bfb0:	3b d6                	cmp    edx,esi
   14036bfb2:	0f 86 54 01 00 00    	jbe    0x14036c10c
   14036bfb8:	44 8d 4b 01          	lea    r9d,[rbx+0x1]
   14036bfbc:	85 f6                	test   esi,esi
   14036bfbe:	74 14                	je     0x14036bfd4
   14036bfc0:	49 8b 07             	mov    rax,QWORD PTR [r15]
   14036bfc3:	41 8b c9             	mov    ecx,r9d
   14036bfc6:	0f af ce             	imul   ecx,esi
   14036bfc9:	ff c9                	dec    ecx
   14036bfcb:	33 db                	xor    ebx,ebx
   14036bfcd:	44 0f b7 04 48       	movzx  r8d,WORD PTR [rax+rcx*2]
   14036bfd2:	eb 05                	jmp    0x14036bfd9
   14036bfd4:	33 db                	xor    ebx,ebx
   14036bfd6:	44 8b c3             	mov    r8d,ebx
   14036bfd9:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   14036bfdc:	41 8b c1             	mov    eax,r9d
   14036bfdf:	0f af c2             	imul   eax,edx
   14036bfe2:	44 8b d0             	mov    r10d,eax
   14036bfe5:	48 8d 14 41          	lea    rdx,[rcx+rax*2]
   14036bfe9:	8d 04 37             	lea    eax,[rdi+rsi*1]
   14036bfec:	48 8d 3c 41          	lea    rdi,[rcx+rax*2]
   14036bff0:	44 8b d8             	mov    r11d,eax
   14036bff3:	48 8b ca             	mov    rcx,rdx
   14036bff6:	48 2b cf             	sub    rcx,rdi
   14036bff9:	48 ff c1             	inc    rcx
   14036bffc:	48 d1 e9             	shr    rcx,1
   14036bfff:	48 3b fa             	cmp    rdi,rdx
   14036c002:	48 0f 47 cb          	cmova  rcx,rbx
   14036c006:	48 85 c9             	test   rcx,rcx
   14036c009:	74 07                	je     0x14036c012
   14036c00b:	41 0f b7 c0          	movzx  eax,r8w
   14036c00f:	66 f3 ab             	rep stos WORD PTR [rdi],ax
   14036c012:	85 f6                	test   esi,esi
   14036c014:	74 12                	je     0x14036c028
   14036c016:	49 8b 47 08          	mov    rax,QWORD PTR [r15+0x8]
   14036c01a:	41 8b c9             	mov    ecx,r9d
   14036c01d:	0f af ce             	imul   ecx,esi
   14036c020:	ff c9                	dec    ecx
   14036c022:	44 8b 04 88          	mov    r8d,DWORD PTR [rax+rcx*4]
   14036c026:	eb 03                	jmp    0x14036c02b
   14036c028:	44 8b c3             	mov    r8d,ebx
   14036c02b:	49 8b 46 08          	mov    rax,QWORD PTR [r14+0x8]
   14036c02f:	4a 8d 14 90          	lea    rdx,[rax+r10*4]
   14036c033:	4a 8d 3c 98          	lea    rdi,[rax+r11*4]
   14036c037:	48 8b ca             	mov    rcx,rdx
   14036c03a:	48 2b cf             	sub    rcx,rdi
   14036c03d:	48 83 c1 03          	add    rcx,0x3
   14036c041:	48 c1 e9 02          	shr    rcx,0x2
   14036c045:	48 3b fa             	cmp    rdi,rdx
   14036c048:	48 0f 47 cb          	cmova  rcx,rbx
   14036c04c:	48 85 c9             	test   rcx,rcx
   14036c04f:	74 05                	je     0x14036c056
   14036c051:	41 8b c0             	mov    eax,r8d
   14036c054:	f3 ab                	rep stos DWORD PTR [rdi],eax
   14036c056:	66 83 bd 1c 02 00 00 	cmp    WORD PTR [rbp+0x21c],0x0
   14036c05d:	00 
   14036c05e:	7c 64                	jl     0x14036c0c4
   14036c060:	45 85 ed             	test   r13d,r13d
   14036c063:	74 1a                	je     0x14036c07f
   14036c065:	49 8b 47 10          	mov    rax,QWORD PTR [r15+0x10]
   14036c069:	41 8b c9             	mov    ecx,r9d
   14036c06c:	41 0f af cd          	imul   ecx,r13d
   14036c070:	ff c9                	dec    ecx
   14036c072:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036c077:	f3 0f 11 44 24 40    	movss  DWORD PTR [rsp+0x40],xmm0
   14036c07d:	eb 08                	jmp    0x14036c087
   14036c07f:	c7 44 24 40 00 00 00 	mov    DWORD PTR [rsp+0x40],0x0
   14036c086:	00 
   14036c087:	49 8b 56 10          	mov    rdx,QWORD PTR [r14+0x10]
   14036c08b:	41 8b c1             	mov    eax,r9d
   14036c08e:	0f af 44 24 3c       	imul   eax,DWORD PTR [rsp+0x3c]
   14036c093:	4c 8d 04 82          	lea    r8,[rdx+rax*4]
   14036c097:	48 8b 44 24 48       	mov    rax,QWORD PTR [rsp+0x48]
   14036c09c:	41 03 c5             	add    eax,r13d
   14036c09f:	49 8b c8             	mov    rcx,r8
   14036c0a2:	48 8d 3c 82          	lea    rdi,[rdx+rax*4]
   14036c0a6:	48 2b cf             	sub    rcx,rdi
   14036c0a9:	48 83 c1 03          	add    rcx,0x3
   14036c0ad:	48 c1 e9 02          	shr    rcx,0x2
   14036c0b1:	49 3b f8             	cmp    rdi,r8
   14036c0b4:	48 0f 47 cb          	cmova  rcx,rbx
   14036c0b8:	48 85 c9             	test   rcx,rcx
   14036c0bb:	74 07                	je     0x14036c0c4
   14036c0bd:	48 63 44 24 40       	movsxd rax,DWORD PTR [rsp+0x40]
   14036c0c2:	f3 ab                	rep stos DWORD PTR [rdi],eax
   14036c0c4:	85 f6                	test   esi,esi
   14036c0c6:	74 12                	je     0x14036c0da
   14036c0c8:	49 8b 47 18          	mov    rax,QWORD PTR [r15+0x18]
   14036c0cc:	44 0f af ce          	imul   r9d,esi
   14036c0d0:	41 ff c9             	dec    r9d
   14036c0d3:	46 0f b7 04 48       	movzx  r8d,WORD PTR [rax+r9*2]
   14036c0d8:	eb 03                	jmp    0x14036c0dd
   14036c0da:	44 8b c3             	mov    r8d,ebx
   14036c0dd:	49 8b 46 18          	mov    rax,QWORD PTR [r14+0x18]
   14036c0e1:	4a 8d 14 50          	lea    rdx,[rax+r10*2]
   14036c0e5:	48 8b ca             	mov    rcx,rdx
   14036c0e8:	4a 8d 3c 58          	lea    rdi,[rax+r11*2]
   14036c0ec:	48 2b cf             	sub    rcx,rdi
   14036c0ef:	48 ff c1             	inc    rcx
   14036c0f2:	48 d1 e9             	shr    rcx,1
   14036c0f5:	48 3b fa             	cmp    rdi,rdx
   14036c0f8:	8b 54 24 30          	mov    edx,DWORD PTR [rsp+0x30]
   14036c0fc:	48 0f 47 cb          	cmova  rcx,rbx
   14036c100:	48 85 c9             	test   rcx,rcx
   14036c103:	74 07                	je     0x14036c10c
   14036c105:	49 0f bf c0          	movsx  rax,r8w
   14036c109:	66 f3 ab             	rep stos WORD PTR [rdi],ax
   14036c10c:	41 fe c4             	inc    r12b
   14036c10f:	41 0f b6 dc          	movzx  ebx,r12b
   14036c113:	3b 5c 24 38          	cmp    ebx,DWORD PTR [rsp+0x38]
   14036c117:	0f 82 d3 fd ff ff    	jb     0x14036bef0
   14036c11d:	48 8b 7c 24 50       	mov    rdi,QWORD PTR [rsp+0x50]
   14036c122:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14036c127:	4c 8b 64 24 58       	mov    r12,QWORD PTR [rsp+0x58]
   14036c12c:	0f b6 5c 2f 61       	movzx  ebx,BYTE PTR [rdi+rbp*1+0x61]
   14036c131:	49 8b 04 24          	mov    rax,QWORD PTR [r12]
   14036c135:	0f b6 7c 38 61       	movzx  edi,BYTE PTR [rax+rdi*1+0x61]
   14036c13a:	2b fb                	sub    edi,ebx
   14036c13c:	85 ff                	test   edi,edi
   14036c13e:	0f 8e b5 00 00 00    	jle    0x14036c1f9
   14036c144:	8b c7                	mov    eax,edi
   14036c146:	44 8b fb             	mov    r15d,ebx
   14036c149:	0f af c2             	imul   eax,edx
   14036c14c:	44 0f af fa          	imul   r15d,edx
   14036c150:	33 d2                	xor    edx,edx
   14036c152:	48 89 44 24 48       	mov    QWORD PTR [rsp+0x48],rax
   14036c157:	4c 8d 04 00          	lea    r8,[rax+rax*1]
   14036c15b:	49 8b 06             	mov    rax,QWORD PTR [r14]
   14036c15e:	4c 89 44 24 50       	mov    QWORD PTR [rsp+0x50],r8
   14036c163:	4a 8d 0c 78          	lea    rcx,[rax+r15*2]
   14036c167:	e8 7e 4b 2b 00       	call   0x140620cea
   14036c16c:	80 bc 24 38 01 00 00 	cmp    BYTE PTR [rsp+0x138],0x0
   14036c173:	00 
   14036c174:	75 2e                	jne    0x14036c1a4
   14036c176:	0f 2e f7             	ucomiss xmm6,xmm7
   14036c179:	7a 02                	jp     0x14036c17d
   14036c17b:	74 27                	je     0x14036c1a4
   14036c17d:	66 83 bd 1c 02 00 00 	cmp    WORD PTR [rbp+0x21c],0x0
   14036c184:	00 
   14036c185:	7c 1d                	jl     0x14036c1a4
   14036c187:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14036c18c:	44 0f b6 cb          	movzx  r9d,bl
   14036c190:	49 8b 14 24          	mov    rdx,QWORD PTR [r12]
   14036c194:	48 8b cd             	mov    rcx,rbp
   14036c197:	f3 0f 11 74 24 20    	movss  DWORD PTR [rsp+0x20],xmm6
   14036c19d:	e8 3e 82 00 00       	call   0x1403743e0
   14036c1a2:	eb 50                	jmp    0x14036c1f4
   14036c1a4:	49 8b 46 08          	mov    rax,QWORD PTR [r14+0x8]
   14036c1a8:	33 d2                	xor    edx,edx
   14036c1aa:	4c 8b 44 24 48       	mov    r8,QWORD PTR [rsp+0x48]
   14036c1af:	4a 8d 0c b8          	lea    rcx,[rax+r15*4]
   14036c1b3:	4e 8d 04 85 00 00 00 	lea    r8,[r8*4+0x0]
   14036c1ba:	00 
   14036c1bb:	e8 2a 4b 2b 00       	call   0x140620cea
   14036c1c0:	49 8b 46 10          	mov    rax,QWORD PTR [r14+0x10]
   14036c1c4:	33 d2                	xor    edx,edx
   14036c1c6:	0f af 5c 24 3c       	imul   ebx,DWORD PTR [rsp+0x3c]
   14036c1cb:	0f af 7c 24 3c       	imul   edi,DWORD PTR [rsp+0x3c]
   14036c1d0:	44 8b c7             	mov    r8d,edi
   14036c1d3:	49 c1 e0 02          	shl    r8,0x2
   14036c1d7:	48 8d 0c 98          	lea    rcx,[rax+rbx*4]
   14036c1db:	e8 0a 4b 2b 00       	call   0x140620cea
   14036c1e0:	49 8b 46 18          	mov    rax,QWORD PTR [r14+0x18]
   14036c1e4:	33 d2                	xor    edx,edx
   14036c1e6:	4c 8b 44 24 50       	mov    r8,QWORD PTR [rsp+0x50]
   14036c1eb:	4a 8d 0c 78          	lea    rcx,[rax+r15*2]
   14036c1ef:	e8 f6 4a 2b 00       	call   0x140620cea
   14036c1f4:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14036c1f9:	8b 5c 24 30          	mov    ebx,DWORD PTR [rsp+0x30]
   14036c1fd:	49 8b 0c 24          	mov    rcx,QWORD PTR [r12]
   14036c201:	41 ff c0             	inc    r8d
   14036c204:	44 89 44 24 34       	mov    DWORD PTR [rsp+0x34],r8d
   14036c209:	41 b9 00 00 00 00    	mov    r9d,0x0
   14036c20f:	0f b6 41 60          	movzx  eax,BYTE PTR [rcx+0x60]
   14036c213:	44 3b c0             	cmp    r8d,eax
   14036c216:	0f 8c 44 fb ff ff    	jl     0x14036bd60
   14036c21c:	0f 28 bc 24 a0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xa0]
   14036c223:	00 
   14036c224:	b0 01                	mov    al,0x1
   14036c226:	eb 02                	jmp    0x14036c22a
   14036c228:	32 c0                	xor    al,al
   14036c22a:	48 8b 8c 24 90 00 00 	mov    rcx,QWORD PTR [rsp+0x90]
   14036c231:	00 
   14036c232:	48 33 cc             	xor    rcx,rsp
   14036c235:	e8 c6 f3 2a 00       	call   0x14061b600
   14036c23a:	48                   	rex.W
   14036c23b:	8b                   	.byte 0x8b
   14036c23c:	9c                   	pushf
   14036c23d:	24 10                	and    al,0x10
   14036c23f:	01                   	.byte 0x1
