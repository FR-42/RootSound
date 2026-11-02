
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140350e40 <.text+0x34fe40>:
   140350e40:	44 89 4c 24 20       	mov    DWORD PTR [rsp+0x20],r9d
   140350e45:	44 89 44 24 18       	mov    DWORD PTR [rsp+0x18],r8d
   140350e4a:	48 89 54 24 10       	mov    QWORD PTR [rsp+0x10],rdx
   140350e4f:	53                   	push   rbx
   140350e50:	55                   	push   rbp
   140350e51:	56                   	push   rsi
   140350e52:	57                   	push   rdi
   140350e53:	41 54                	push   r12
   140350e55:	41 55                	push   r13
   140350e57:	41 56                	push   r14
   140350e59:	41 57                	push   r15
   140350e5b:	48 81 ec b8 00 00 00 	sub    rsp,0xb8
   140350e62:	66 83 79 14 00       	cmp    WORD PTR [rcx+0x14],0x0
   140350e67:	41 8b e9             	mov    ebp,r9d
   140350e6a:	f3 0f 10 05 6e 63 34 	movss  xmm0,DWORD PTR [rip+0x34636e]        # 0x1406971e0
   140350e71:	00 
   140350e72:	41 8b f0             	mov    esi,r8d
   140350e75:	f3 0f 5e 05 63 91 63 	divss  xmm0,DWORD PTR [rip+0x639163]        # 0x140989fe0
   140350e7c:	00 
   140350e7d:	48 8b 82 98 05 00 00 	mov    rax,QWORD PTR [rdx+0x598]
   140350e84:	48 8b fa             	mov    rdi,rdx
   140350e87:	48 89 44 24 68       	mov    QWORD PTR [rsp+0x68],rax
   140350e8c:	4c 8b f9             	mov    r15,rcx
   140350e8f:	48 8b 82 a0 05 00 00 	mov    rax,QWORD PTR [rdx+0x5a0]
   140350e96:	48 89 44 24 58       	mov    QWORD PTR [rsp+0x58],rax
   140350e9b:	f3 0f 58 05 39 f1 4f 	addss  xmm0,DWORD PTR [rip+0x4ff139]        # 0x14084ffdc
   140350ea2:	00 
   140350ea3:	f3 0f 2c d8          	cvttss2si ebx,xmm0
   140350ea7:	89 5c 24 54          	mov    DWORD PTR [rsp+0x54],ebx
   140350eab:	75 14                	jne    0x140350ec1
   140350ead:	41 8b d0             	mov    edx,r8d
   140350eb0:	48 8b cf             	mov    rcx,rdi
   140350eb3:	2b 15 2b 91 63 00    	sub    edx,DWORD PTR [rip+0x63912b]        # 0x140989fe4
   140350eb9:	45 8b c1             	mov    r8d,r9d
   140350ebc:	e8 3f 87 ff ff       	call   0x140349600
   140350ec1:	48 8d 44 24 50       	lea    rax,[rsp+0x50]
   140350ec6:	41 b8 03 00 00 00    	mov    r8d,0x3
   140350ecc:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   140350ed1:	44 8b ce             	mov    r9d,esi
   140350ed4:	0f b7 d3             	movzx  edx,bx
   140350ed7:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp
   140350edb:	48 8b cf             	mov    rcx,rdi
   140350ede:	e8 7d a5 ff ff       	call   0x14034b460
   140350ee3:	0f b7 8c 24 28 01 00 	movzx  ecx,WORD PTR [rsp+0x128]
   140350eea:	00 
   140350eeb:	33 db                	xor    ebx,ebx
   140350eed:	44 0f b7 4c 24 50    	movzx  r9d,WORD PTR [rsp+0x50]
   140350ef3:	4c 8b c0             	mov    r8,rax
   140350ef6:	66 89 4c 24 40       	mov    WORD PTR [rsp+0x40],cx
   140350efb:	48 8b d7             	mov    rdx,rdi
   140350efe:	48 8b 8c 24 20 01 00 	mov    rcx,QWORD PTR [rsp+0x120]
   140350f05:	00 
   140350f06:	48 89 4c 24 38       	mov    QWORD PTR [rsp+0x38],rcx
   140350f0b:	48 8d 8c 24 00 01 00 	lea    rcx,[rsp+0x100]
   140350f12:	00 
   140350f13:	89 6c 24 30          	mov    DWORD PTR [rsp+0x30],ebp
   140350f17:	89 74 24 28          	mov    DWORD PTR [rsp+0x28],esi
   140350f1b:	48 89 4c 24 20       	mov    QWORD PTR [rsp+0x20],rcx
   140350f20:	49 8b cf             	mov    rcx,r15
   140350f23:	48 89 44 24 60       	mov    QWORD PTR [rsp+0x60],rax
   140350f28:	89 9c 24 00 01 00 00 	mov    DWORD PTR [rsp+0x100],ebx
   140350f2f:	e8 3c c8 ff ff       	call   0x14034d770
   140350f34:	48 8b bc 24 38 01 00 	mov    rdi,QWORD PTR [rsp+0x138]
   140350f3b:	00 
   140350f3c:	4c 8d 43 ff          	lea    r8,[rbx-0x1]
   140350f40:	4c 8b b4 24 30 01 00 	mov    r14,QWORD PTR [rsp+0x130]
   140350f47:	00 
   140350f48:	8d 73 01             	lea    esi,[rbx+0x1]
   140350f4b:	44 8b a4 24 00 01 00 	mov    r12d,DWORD PTR [rsp+0x100]
   140350f52:	00 
   140350f53:	4c 8b e8             	mov    r13,rax
   140350f56:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140350f5d:	00 00 00 
   140350f60:	45 33 c9             	xor    r9d,r9d
   140350f63:	66 44 89 0f          	mov    WORD PTR [rdi],r9w
   140350f67:	45 85 e4             	test   r12d,r12d
   140350f6a:	0f 84 d7 00 00 00    	je     0x140351047
   140350f70:	4c 8b 84 24 08 01 00 	mov    r8,QWORD PTR [rsp+0x108]
   140350f77:	00 
   140350f78:	49 8d 5d 16          	lea    rbx,[r13+0x16]
   140350f7c:	49 8b ec             	mov    rbp,r12
   140350f7f:	90                   	nop
   140350f80:	41 8b 50 10          	mov    edx,DWORD PTR [r8+0x10]
   140350f84:	0f b7 4b fe          	movzx  ecx,WORD PTR [rbx-0x2]
   140350f88:	8d 42 ff             	lea    eax,[rdx-0x1]
   140350f8b:	3b c8                	cmp    ecx,eax
   140350f8d:	0f 87 85 00 00 00    	ja     0x140351018
   140350f93:	0f b7 03             	movzx  eax,WORD PTR [rbx]
   140350f96:	3b c2                	cmp    eax,edx
   140350f98:	72 7e                	jb     0x140351018
   140350f9a:	85 f6                	test   esi,esi
   140350f9c:	75 75                	jne    0x140351013
   140350f9e:	0f b7 07             	movzx  eax,WORD PTR [rdi]
   140350fa1:	0f 10 43 ea          	movups xmm0,XMMWORD PTR [rbx-0x16]
   140350fa5:	48 6b c8 38          	imul   rcx,rax,0x38
   140350fa9:	49 03 0e             	add    rcx,QWORD PTR [r14]
   140350fac:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   140350faf:	0f 10 4b fa          	movups xmm1,XMMWORD PTR [rbx-0x6]
   140350fb3:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   140350fb7:	0f 10 43 0a          	movups xmm0,XMMWORD PTR [rbx+0xa]
   140350fbb:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   140350fbf:	f2 0f 10 4b 1a       	movsd  xmm1,QWORD PTR [rbx+0x1a]
   140350fc4:	f2 0f 11 49 30       	movsd  QWORD PTR [rcx+0x30],xmm1
   140350fc9:	0f b7 51 18          	movzx  edx,WORD PTR [rcx+0x18]
   140350fcd:	41 3b 50 10          	cmp    edx,DWORD PTR [r8+0x10]
   140350fd1:	72 04                	jb     0x140350fd7
   140350fd3:	44 89 49 1c          	mov    DWORD PTR [rcx+0x1c],r9d
   140350fd7:	0f b7 41 14          	movzx  eax,WORD PTR [rcx+0x14]
   140350fdb:	41 2b 47 24          	sub    eax,DWORD PTR [r15+0x24]
   140350fdf:	85 c0                	test   eax,eax
   140350fe1:	66 41 0f 4e c1       	cmovle ax,r9w
   140350fe6:	66 89 41 14          	mov    WORD PTR [rcx+0x14],ax
   140350fea:	0f b7 41 16          	movzx  eax,WORD PTR [rcx+0x16]
   140350fee:	41 2b 47 24          	sub    eax,DWORD PTR [r15+0x24]
   140350ff2:	85 c0                	test   eax,eax
   140350ff4:	66 41 0f 4e c1       	cmovle ax,r9w
   140350ff9:	66 89 41 16          	mov    WORD PTR [rcx+0x16],ax
   140350ffd:	41 2b 57 24          	sub    edx,DWORD PTR [r15+0x24]
   140351001:	85 d2                	test   edx,edx
   140351003:	4c 89 09             	mov    QWORD PTR [rcx],r9
   140351006:	4c 89 49 08          	mov    QWORD PTR [rcx+0x8],r9
   14035100a:	66 41 0f 4e d1       	cmovle dx,r9w
   14035100f:	66 89 51 18          	mov    WORD PTR [rcx+0x18],dx
   140351013:	66 ff 07             	inc    WORD PTR [rdi]
   140351016:	eb 1d                	jmp    0x140351035
   140351018:	85 f6                	test   esi,esi
   14035101a:	75 19                	jne    0x140351035
   14035101c:	48 8b 4b 12          	mov    rcx,QWORD PTR [rbx+0x12]
   140351020:	48 85 c9             	test   rcx,rcx
   140351023:	74 10                	je     0x140351035
   140351025:	e8 2e a5 2c 00       	call   0x14061b558
   14035102a:	4c 8b 84 24 08 01 00 	mov    r8,QWORD PTR [rsp+0x108]
   140351031:	00 
   140351032:	45 33 c9             	xor    r9d,r9d
   140351035:	48 83 c3 38          	add    rbx,0x38
   140351039:	48 83 ed 01          	sub    rbp,0x1
   14035103d:	0f 85 3d ff ff ff    	jne    0x140350f80
   140351043:	4c 8d 45 ff          	lea    r8,[rbp-0x1]
   140351047:	85 f6                	test   esi,esi
   140351049:	74 3b                	je     0x140351086
   14035104b:	0f b7 0f             	movzx  ecx,WORD PTR [rdi]
   14035104e:	b8 38 00 00 00       	mov    eax,0x38
   140351053:	48 f7 e1             	mul    rcx
   140351056:	48 8b e8             	mov    rbp,rax
   140351059:	49 0f 40 e8          	cmovo  rbp,r8
   14035105d:	48 8b cd             	mov    rcx,rbp
   140351060:	e8 fb a4 2c 00       	call   0x14061b560
   140351065:	48 8b d8             	mov    rbx,rax
   140351068:	48 85 c0             	test   rax,rax
   14035106b:	74 12                	je     0x14035107f
   14035106d:	4c 8b c5             	mov    r8,rbp
   140351070:	33 d2                	xor    edx,edx
   140351072:	48 8b c8             	mov    rcx,rax
   140351075:	e8 70 fc 2c 00       	call   0x140620cea
   14035107a:	49 89 1e             	mov    QWORD PTR [r14],rbx
   14035107d:	eb 0a                	jmp    0x140351089
   14035107f:	33 db                	xor    ebx,ebx
   140351081:	49 89 1e             	mov    QWORD PTR [r14],rbx
   140351084:	eb 03                	jmp    0x140351089
   140351086:	49 8b 1e             	mov    rbx,QWORD PTR [r14]
   140351089:	83 ee 01             	sub    esi,0x1
   14035108c:	49 c7 c0 ff ff ff ff 	mov    r8,0xffffffffffffffff
   140351093:	0f 89 c7 fe ff ff    	jns    0x140350f60
   140351099:	48 8b ac 24 08 01 00 	mov    rbp,QWORD PTR [rsp+0x108]
   1403510a0:	00 
   1403510a1:	48 8d 84 24 00 01 00 	lea    rax,[rsp+0x100]
   1403510a8:	00 
   1403510a9:	44 8b b4 24 18 01 00 	mov    r14d,DWORD PTR [rsp+0x118]
   1403510b0:	00 
   1403510b1:	48 8b d5             	mov    rdx,rbp
   1403510b4:	8b 74 24 50          	mov    esi,DWORD PTR [rsp+0x50]
   1403510b8:	49 8b cf             	mov    rcx,r15
   1403510bb:	48 89 7c 24 48       	mov    QWORD PTR [rsp+0x48],rdi
   1403510c0:	44 0f b7 c6          	movzx  r8d,si
   1403510c4:	8b bc 24 10 01 00 00 	mov    edi,DWORD PTR [rsp+0x110]
   1403510cb:	48 89 5c 24 40       	mov    QWORD PTR [rsp+0x40],rbx
   1403510d0:	8b 5c 24 54          	mov    ebx,DWORD PTR [rsp+0x54]
   1403510d4:	44 0f b7 cb          	movzx  r9d,bx
   1403510d8:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   1403510dd:	4c 89 6c 24 30       	mov    QWORD PTR [rsp+0x30],r13
   1403510e2:	44 89 74 24 28       	mov    DWORD PTR [rsp+0x28],r14d
   1403510e7:	89 7c 24 20          	mov    DWORD PTR [rsp+0x20],edi
   1403510eb:	e8 20 ce ff ff       	call   0x14034df10
   1403510f0:	0f b6 84 24 40 01 00 	movzx  eax,BYTE PTR [rsp+0x140]
   1403510f7:	00 
   1403510f8:	44 0f b7 ce          	movzx  r9d,si
   1403510fc:	4c 8b 44 24 60       	mov    r8,QWORD PTR [rsp+0x60]
   140351101:	48 8b d5             	mov    rdx,rbp
   140351104:	88 44 24 48          	mov    BYTE PTR [rsp+0x48],al
   140351108:	49 8b cf             	mov    rcx,r15
   14035110b:	44 89 74 24 40       	mov    DWORD PTR [rsp+0x40],r14d
   140351110:	89 7c 24 38          	mov    DWORD PTR [rsp+0x38],edi
   140351114:	8b bc 24 00 01 00 00 	mov    edi,DWORD PTR [rsp+0x100]
   14035111b:	89 7c 24 30          	mov    DWORD PTR [rsp+0x30],edi
   14035111f:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   140351124:	66 89 5c 24 20       	mov    WORD PTR [rsp+0x20],bx
   140351129:	e8 02 f3 ff ff       	call   0x140350430
   14035112e:	85 ff                	test   edi,edi
   140351130:	74 15                	je     0x140351147
   140351132:	49 8b dd             	mov    rbx,r13
   140351135:	48 8b 0b             	mov    rcx,QWORD PTR [rbx]
   140351138:	e8 1b a4 2c 00       	call   0x14061b558
   14035113d:	48 83 c3 38          	add    rbx,0x38
   140351141:	48 83 ef 01          	sub    rdi,0x1
   140351145:	75 ee                	jne    0x140351135
   140351147:	49 8b cd             	mov    rcx,r13
   14035114a:	e8 09 a4 2c 00       	call   0x14061b558
   14035114f:	44 8b 8c 24 10 01 00 	mov    r9d,DWORD PTR [rsp+0x110]
   140351156:	00 
   140351157:	44 8b 94 24 18 01 00 	mov    r10d,DWORD PTR [rsp+0x118]
   14035115e:	00 
   14035115f:	45 3b ca             	cmp    r9d,r10d
   140351162:	0f 8f 90 01 00 00    	jg     0x1403512f8
   140351168:	44 8b 05 39 88 5e 00 	mov    r8d,DWORD PTR [rip+0x5e8839]        # 0x1409399a8
   14035116f:	0f 29 b4 24 a0 00 00 	movaps XMMWORD PTR [rsp+0xa0],xmm6
   140351176:	00 
   140351177:	0f 57 f6             	xorps  xmm6,xmm6
   14035117a:	0f 29 bc 24 90 00 00 	movaps XMMWORD PTR [rsp+0x90],xmm7
   140351181:	00 
   140351182:	f2 0f 10 3d f6 cf 33 	movsd  xmm7,QWORD PTR [rip+0x33cff6]        # 0x14068e180
   140351189:	00 
   14035118a:	44 0f 29 84 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm8
   140351191:	00 00 
   140351193:	f2 44 0f 10 05 84 cf 	movsd  xmm8,QWORD PTR [rip+0x33cf84]        # 0x14068e120
   14035119a:	33 00 
   14035119c:	44 0f 29 4c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm9
   1403511a2:	f3 44 0f 10 0d 05 d0 	movss  xmm9,DWORD PTR [rip+0x33d005]        # 0x14068e1b0
   1403511a9:	33 00 
   1403511ab:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   1403511b0:	8b 15 2e 8e 63 00    	mov    edx,DWORD PTR [rip+0x638e2e]        # 0x140989fe4
   1403511b6:	41 8b c9             	mov    ecx,r9d
   1403511b9:	2b 4d 0c             	sub    ecx,DWORD PTR [rbp+0xc]
   1403511bc:	03 d1                	add    edx,ecx
   1403511be:	69 ca d0 01 00 00    	imul   ecx,edx,0x1d0
   1403511c4:	4c 63 e2             	movsxd r12,edx
   1403511c7:	4c 89 a4 24 00 01 00 	mov    QWORD PTR [rsp+0x100],r12
   1403511ce:	00 
   1403511cf:	48 69 f1 f8 00 00 00 	imul   rsi,rcx,0xf8
   1403511d6:	48 03 74 24 68       	add    rsi,QWORD PTR [rsp+0x68]
   1403511db:	41 83 f8 03          	cmp    r8d,0x3
   1403511df:	41 0f 93 c5          	setae  r13b
   1403511e3:	41 0f b6 ed          	movzx  ebp,r13b
   1403511e7:	41 3b e8             	cmp    ebp,r8d
   1403511ea:	0f 83 cd 00 00 00    	jae    0x1403512bd
   1403511f0:	48 8b 44 24 58       	mov    rax,QWORD PTR [rsp+0x58]
   1403511f5:	33 c9                	xor    ecx,ecx
   1403511f7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   1403511fe:	00 00 
   140351200:	44 8b f9             	mov    r15d,ecx
   140351203:	66 42 3b 0c 60       	cmp    cx,WORD PTR [rax+r12*2]
   140351208:	0f 83 8f 00 00 00    	jae    0x14035129d
   14035120e:	4c 8b f1             	mov    r14,rcx
   140351211:	32 db                	xor    bl,bl
   140351213:	45 33 e4             	xor    r12d,r12d
   140351216:	80 fb 07             	cmp    bl,0x7
   140351219:	77 56                	ja     0x140351271
   14035121b:	8d 45 ff             	lea    eax,[rbp-0x1]
   14035121e:	85 c0                	test   eax,eax
   140351220:	41 0f 4e c4          	cmovle eax,r12d
   140351224:	48 63 d0             	movsxd rdx,eax
   140351227:	0f b6 c3             	movzx  eax,bl
   14035122a:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14035122e:	49 8d 04 16          	lea    rax,[r14+rdx*1]
   140351232:	48 8d 3c 48          	lea    rdi,[rax+rcx*2]
   140351236:	f3 0f 10 44 be 14    	movss  xmm0,DWORD PTR [rsi+rdi*4+0x14]
   14035123c:	0f 2f f0             	comiss xmm6,xmm0
   14035123f:	72 0d                	jb     0x14035124e
   140351241:	0f 28 c6             	movaps xmm0,xmm6
   140351244:	fe c3                	inc    bl
   140351246:	f3 0f 11 44 be 14    	movss  DWORD PTR [rsi+rdi*4+0x14],xmm0
   14035124c:	eb c8                	jmp    0x140351216
   14035124e:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140351251:	41 0f 28 c8          	movaps xmm1,xmm8
   140351255:	f2 0f 5e c7          	divsd  xmm0,xmm7
   140351259:	e8 1c fb 2c 00       	call   0x140620d7a
   14035125e:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140351262:	fe c3                	inc    bl
   140351264:	f3 41 0f 59 c1       	mulss  xmm0,xmm9
   140351269:	f3 0f 11 44 be 14    	movss  DWORD PTR [rsi+rdi*4+0x14],xmm0
   14035126f:	eb a5                	jmp    0x140351216
   140351271:	4c 8b a4 24 00 01 00 	mov    r12,QWORD PTR [rsp+0x100]
   140351278:	00 
   140351279:	41 ff c7             	inc    r15d
   14035127c:	48 8b 44 24 58       	mov    rax,QWORD PTR [rsp+0x58]
   140351281:	49 83 c6 3e          	add    r14,0x3e
   140351285:	42 0f b7 04 60       	movzx  eax,WORD PTR [rax+r12*2]
   14035128a:	44 3b f8             	cmp    r15d,eax
   14035128d:	7c 82                	jl     0x140351211
   14035128f:	44 8b 05 12 87 5e 00 	mov    r8d,DWORD PTR [rip+0x5e8712]        # 0x1409399a8
   140351296:	33 c9                	xor    ecx,ecx
   140351298:	48 8b 44 24 58       	mov    rax,QWORD PTR [rsp+0x58]
   14035129d:	41 fe c5             	inc    r13b
   1403512a0:	41 0f b6 ed          	movzx  ebp,r13b
   1403512a4:	41 3b e8             	cmp    ebp,r8d
   1403512a7:	0f 82 53 ff ff ff    	jb     0x140351200
   1403512ad:	44 8b 8c 24 10 01 00 	mov    r9d,DWORD PTR [rsp+0x110]
   1403512b4:	00 
   1403512b5:	44 8b 94 24 18 01 00 	mov    r10d,DWORD PTR [rsp+0x118]
   1403512bc:	00 
   1403512bd:	48 8b ac 24 08 01 00 	mov    rbp,QWORD PTR [rsp+0x108]
   1403512c4:	00 
   1403512c5:	41 ff c1             	inc    r9d
   1403512c8:	44 89 8c 24 10 01 00 	mov    DWORD PTR [rsp+0x110],r9d
   1403512cf:	00 
   1403512d0:	45 3b ca             	cmp    r9d,r10d
   1403512d3:	0f 8e d7 fe ff ff    	jle    0x1403511b0
   1403512d9:	44 0f 28 4c 24 70    	movaps xmm9,XMMWORD PTR [rsp+0x70]
   1403512df:	44 0f 28 84 24 80 00 	movaps xmm8,XMMWORD PTR [rsp+0x80]
   1403512e6:	00 00 
   1403512e8:	0f 28 bc 24 90 00 00 	movaps xmm7,XMMWORD PTR [rsp+0x90]
   1403512ef:	00 
   1403512f0:	0f 28 b4 24 a0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xa0]
   1403512f7:	00 
   1403512f8:	48 8b 4c 24 60       	mov    rcx,QWORD PTR [rsp+0x60]
   1403512fd:	48 81 c4 b8 00 00 00 	add    rsp,0xb8
   140351304:	41 5f                	pop    r15
   140351306:	41 5e                	pop    r14
   140351308:	41 5d                	pop    r13
   14035130a:	41 5c                	pop    r12
   14035130c:	5f                   	pop    rdi
   14035130d:	5e                   	pop    rsi
   14035130e:	5d                   	pop    rbp
   14035130f:	5b                   	pop    rbx
   140351310:	e9 43 a2 2c 00       	jmp    0x14061b558
   140351315:	cc                   	int3
   140351316:	cc                   	int3
   140351317:	cc                   	int3
   140351318:	cc                   	int3
   140351319:	cc                   	int3
   14035131a:	cc                   	int3
   14035131b:	cc                   	int3
   14035131c:	cc                   	int3
   14035131d:	cc                   	int3
   14035131e:	cc                   	int3
   14035131f:	cc                   	int3
   140351320:	8b 15 82 86 5e 00    	mov    edx,DWORD PTR [rip+0x5e8682]        # 0x1409399a8
   140351326:	4c 8b c1             	mov    r8,rcx
   140351329:	83 fa 01             	cmp    edx,0x1
   14035132c:	75 05                	jne    0x140351333
   14035132e:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   140351332:	c3                   	ret
   140351333:	83 fa 03             	cmp    edx,0x3
   140351336:	0f 57 c0             	xorps  xmm0,xmm0
   140351339:	0f 93 c1             	setae  cl
   14035133c:	0f b6 c1             	movzx  eax,cl
   14035133f:	3b c2                	cmp    eax,edx
   140351341:	73 26                	jae    0x140351369
   140351343:	45 33 c9             	xor    r9d,r9d
   140351346:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14035134d:	00 00 00 
   140351350:	ff c8                	dec    eax
   140351352:	85 c0                	test   eax,eax
   140351354:	41 0f 4e c1          	cmovle eax,r9d
   140351358:	fe c1                	inc    cl
   14035135a:	48 98                	cdqe
   14035135c:	f3 41 0f 58 04 80    	addss  xmm0,DWORD PTR [r8+rax*4]
   140351362:	0f b6 c1             	movzx  eax,cl
   140351365:	3b c2                	cmp    eax,edx
   140351367:	72 e7                	jb     0x140351350
   140351369:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14035136d:	f2 0f 59 05 b3 ed 4f 	mulsd  xmm0,QWORD PTR [rip+0x4fedb3]        # 0x140850128
   140351374:	00 
   140351375:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140351379:	c3                   	ret
   14035137a:	cc                   	int3
   14035137b:	cc                   	int3
   14035137c:	cc                   	int3
   14035137d:	cc                   	int3
   14035137e:	cc                   	int3
   14035137f:	cc                   	int3
   140351380:	40 53                	rex push rbx
   140351382:	41 54                	push   r12
   140351384:	41 56                	push   r14
   140351386:	b8 80 80 00 00       	mov    eax,0x8080
   14035138b:	4d 8b f0             	mov    r14,r8
   14035138e:	4c 8b e2             	mov    r12,rdx
   140351391:	48 8b d9             	mov    rbx,rcx
   140351394:	66 85 81 1c 02 00 00 	test   WORD PTR [rcx+0x21c],ax
   14035139b:	0f 84 43 01 00 00    	je     0x1403514e4
   1403513a1:	44 8b 51 04          	mov    r10d,DWORD PTR [rcx+0x4]
   1403513a5:	44 2b 11             	sub    r10d,DWORD PTR [rcx]
   1403513a8:	4c 89 7c 24 38       	mov    QWORD PTR [rsp+0x38],r15
   1403513ad:	45 32 ff             	xor    r15b,r15b
   1403513b0:	44 38 79 60          	cmp    BYTE PTR [rcx+0x60],r15b
   1403513b4:	0f 86 25 01 00 00    	jbe    0x1403514df
   1403513ba:	48 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],rbp
   1403513bf:	48 89 74 24 28       	mov    QWORD PTR [rsp+0x28],rsi
   1403513c4:	48 89 7c 24 30       	mov    QWORD PTR [rsp+0x30],rdi
   1403513c9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   1403513d0:	41 0f b6 ef          	movzx  ebp,r15b
   1403513d4:	45 32 c9             	xor    r9b,r9b
   1403513d7:	44 38 4c 2b 61       	cmp    BYTE PTR [rbx+rbp*1+0x61],r9b
   1403513dc:	0f 86 e1 00 00 00    	jbe    0x1403514c3
   1403513e2:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403513e6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   1403513ed:	00 00 00 
   1403513f0:	48 8b bc eb 98 00 00 	mov    rdi,QWORD PTR [rbx+rbp*8+0x98]
   1403513f7:	00 
   1403513f8:	45 33 c0             	xor    r8d,r8d
   1403513fb:	41 0f b6 f1          	movzx  esi,r9b
   1403513ff:	0f 57 d2             	xorps  xmm2,xmm2
   140351402:	41 0f af f2          	imul   esi,r10d
   140351406:	48 8b 07             	mov    rax,QWORD PTR [rdi]
   140351409:	4c 8d 1c 70          	lea    r11,[rax+rsi*2]
   14035140d:	41 83 fa 04          	cmp    r10d,0x4
   140351411:	72 65                	jb     0x140351478
   140351413:	41 8d 42 fc          	lea    eax,[r10-0x4]
   140351417:	c1 e8 02             	shr    eax,0x2
   14035141a:	49 8d 4b 04          	lea    rcx,[r11+0x4]
   14035141e:	ff c0                	inc    eax
   140351420:	8b d0                	mov    edx,eax
   140351422:	44 8d 04 85 00 00 00 	lea    r8d,[rax*4+0x0]
   140351429:	00 
   14035142a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140351430:	0f b7 41 fc          	movzx  eax,WORD PTR [rcx-0x4]
   140351434:	66 0f 6e c8          	movd   xmm1,eax
   140351438:	0f b7 41 fe          	movzx  eax,WORD PTR [rcx-0x2]
   14035143c:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14035143f:	66 0f 6e c0          	movd   xmm0,eax
   140351443:	0f b7 01             	movzx  eax,WORD PTR [rcx]
   140351446:	f3 0f 58 ca          	addss  xmm1,xmm2
   14035144a:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14035144d:	0f 28 d1             	movaps xmm2,xmm1
   140351450:	66 0f 6e c8          	movd   xmm1,eax
   140351454:	0f b7 41 02          	movzx  eax,WORD PTR [rcx+0x2]
   140351458:	f3 0f 58 d0          	addss  xmm2,xmm0
   14035145c:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14035145f:	48 83 c1 08          	add    rcx,0x8
   140351463:	66 0f 6e c0          	movd   xmm0,eax
   140351467:	f3 0f 58 d1          	addss  xmm2,xmm1
   14035146b:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14035146e:	f3 0f 58 d0          	addss  xmm2,xmm0
   140351472:	48 83 ea 01          	sub    rdx,0x1
   140351476:	75 b8                	jne    0x140351430
   140351478:	45 3b c2             	cmp    r8d,r10d
   14035147b:	73 22                	jae    0x14035149f
   14035147d:	41 8b d2             	mov    edx,r10d
   140351480:	4b 8d 0c 43          	lea    rcx,[r11+r8*2]
   140351484:	41 2b d0             	sub    edx,r8d
   140351487:	0f b7 01             	movzx  eax,WORD PTR [rcx]
   14035148a:	48 83 c1 02          	add    rcx,0x2
   14035148e:	66 0f 6e c0          	movd   xmm0,eax
   140351492:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140351495:	f3 0f 58 d0          	addss  xmm2,xmm0
   140351499:	48 83 ea 01          	sub    rdx,0x1
   14035149d:	75 e8                	jne    0x140351487
   14035149f:	41 0f 2f 16          	comiss xmm2,DWORD PTR [r14]
   1403514a3:	76 10                	jbe    0x1403514b5
   1403514a5:	48 8b 47 10          	mov    rax,QWORD PTR [rdi+0x10]
   1403514a9:	8b 0c b0             	mov    ecx,DWORD PTR [rax+rsi*4]
   1403514ac:	41 89 0c 24          	mov    DWORD PTR [r12],ecx
   1403514b0:	f3 41 0f 11 16       	movss  DWORD PTR [r14],xmm2
   1403514b5:	41 fe c1             	inc    r9b
   1403514b8:	44 3a 4c 2b 61       	cmp    r9b,BYTE PTR [rbx+rbp*1+0x61]
   1403514bd:	0f 82 2d ff ff ff    	jb     0x1403513f0
   1403514c3:	41 fe c7             	inc    r15b
   1403514c6:	44 3a 7b 60          	cmp    r15b,BYTE PTR [rbx+0x60]
   1403514ca:	0f 82 00 ff ff ff    	jb     0x1403513d0
   1403514d0:	48 8b 7c 24 30       	mov    rdi,QWORD PTR [rsp+0x30]
   1403514d5:	48 8b 74 24 28       	mov    rsi,QWORD PTR [rsp+0x28]
   1403514da:	48 8b 6c 24 20       	mov    rbp,QWORD PTR [rsp+0x20]
   1403514df:	4c 8b 7c 24 38       	mov    r15,QWORD PTR [rsp+0x38]
   1403514e4:	41 5e                	pop    r14
   1403514e6:	41 5c                	pop    r12
   1403514e8:	5b                   	pop    rbx
   1403514e9:	c3                   	ret
   1403514ea:	cc                   	int3
   1403514eb:	cc                   	int3
   1403514ec:	cc                   	int3
   1403514ed:	cc                   	int3
   1403514ee:	cc                   	int3
   1403514ef:	cc                   	int3
   1403514f0:	48 83 ec 28          	sub    rsp,0x28
   1403514f4:	85 c9                	test   ecx,ecx
   1403514f6:	74 6e                	je     0x140351566
   1403514f8:	83 f9 0a             	cmp    ecx,0xa
   1403514fb:	74 5c                	je     0x140351559
   1403514fd:	83 f9 14             	cmp    ecx,0x14
   140351500:	74 4a                	je     0x14035154c
   140351502:	83 f9 1e             	cmp    ecx,0x1e
   140351505:	74 38                	je     0x14035153f
   140351507:	83 f9 28             	cmp    ecx,0x28
   14035150a:	74 26                	je     0x140351532
   14035150c:	f2 0f 10 05 f4 ec 4f 	movsd  xmm0,QWORD PTR [rip+0x4fecf4]        # 0x140850208
   140351513:	00 
   140351514:	66 0f 6e c9          	movd   xmm1,ecx
   140351518:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   14035151c:	f2 0f 5e 0d 24 cc 33 	divsd  xmm1,QWORD PTR [rip+0x33cc24]        # 0x14068e148
   140351523:	00 
   140351524:	e8 51 f8 2c 00       	call   0x140620d7a
   140351529:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14035152d:	48 83 c4 28          	add    rsp,0x28
   140351531:	c3                   	ret
   140351532:	f3 0f 10 05 66 ed 4f 	movss  xmm0,DWORD PTR [rip+0x4fed66]        # 0x1408502a0
   140351539:	00 
   14035153a:	48 83 c4 28          	add    rsp,0x28
   14035153e:	c3                   	ret
   14035153f:	f3 0f 10 05 5d cc 33 	movss  xmm0,DWORD PTR [rip+0x33cc5d]        # 0x14068e1a4
   140351546:	00 
   140351547:	48 83 c4 28          	add    rsp,0x28
   14035154b:	c3                   	ret
   14035154c:	f3 0f 10 05 38 cc 33 	movss  xmm0,DWORD PTR [rip+0x33cc38]        # 0x14068e18c
   140351553:	00 
   140351554:	48 83 c4 28          	add    rsp,0x28
   140351558:	c3                   	ret
   140351559:	f3 0f 10 05 f7 cb 33 	movss  xmm0,DWORD PTR [rip+0x33cbf7]        # 0x14068e158
   140351560:	00 
   140351561:	48 83 c4 28          	add    rsp,0x28
   140351565:	c3                   	ret
   140351566:	f3 0f 10 05 c2 ea 4f 	movss  xmm0,DWORD PTR [rip+0x4feac2]        # 0x140850030
   14035156d:	00 
   14035156e:	48 83 c4 28          	add    rsp,0x28
   140351572:	c3                   	ret
   140351573:	cc                   	int3
   140351574:	cc                   	int3
   140351575:	cc                   	int3
   140351576:	cc                   	int3
   140351577:	cc                   	int3
   140351578:	cc                   	int3
   140351579:	cc                   	int3
   14035157a:	cc                   	int3
   14035157b:	cc                   	int3
   14035157c:	cc                   	int3
   14035157d:	cc                   	int3
   14035157e:	cc                   	int3
   14035157f:	cc                   	int3
   140351580:	48 83 ec 28          	sub    rsp,0x28
   140351584:	83 f9 0f             	cmp    ecx,0xf
   140351587:	77 65                	ja     0x1403515ee
   140351589:	4c 8d 05 70 ea ca ff 	lea    r8,[rip+0xffffffffffcaea70]        # 0x140000000
   140351590:	48 63 c1             	movsxd rax,ecx
   140351593:	41 8b 94 80 14 16 35 	mov    edx,DWORD PTR [r8+rax*4+0x351614]
   14035159a:	00 
   14035159b:	49 03 d0             	add    rdx,r8
   14035159e:	ff e2                	jmp    rdx
   1403515a0:	f3 0f 10 05 88 ea 4f 	movss  xmm0,DWORD PTR [rip+0x4fea88]        # 0x140850030
   1403515a7:	00 
   1403515a8:	48 83 c4 28          	add    rsp,0x28
   1403515ac:	c3                   	ret
   1403515ad:	f3 0f 10 05 5b cb 33 	movss  xmm0,DWORD PTR [rip+0x33cb5b]        # 0x14068e110
   1403515b4:	00 
   1403515b5:	48 83 c4 28          	add    rsp,0x28
   1403515b9:	c3                   	ret
   1403515ba:	f3 0f 10 05 9a 6d 35 	movss  xmm0,DWORD PTR [rip+0x356d9a]        # 0x1406a835c
   1403515c1:	00 
   1403515c2:	48 83 c4 28          	add    rsp,0x28
   1403515c6:	c3                   	ret
   1403515c7:	f3 0f 10 05 95 6d 35 	movss  xmm0,DWORD PTR [rip+0x356d95]        # 0x1406a8364
   1403515ce:	00 
   1403515cf:	48 83 c4 28          	add    rsp,0x28
   1403515d3:	c3                   	ret
   1403515d4:	f3 0f 10 05 8c 6d 35 	movss  xmm0,DWORD PTR [rip+0x356d8c]        # 0x1406a8368
   1403515db:	00 
   1403515dc:	48 83 c4 28          	add    rsp,0x28
   1403515e0:	c3                   	ret
   1403515e1:	f3 0f 10 05 93 cb 33 	movss  xmm0,DWORD PTR [rip+0x33cb93]        # 0x14068e17c
   1403515e8:	00 
   1403515e9:	48 83 c4 28          	add    rsp,0x28
   1403515ed:	c3                   	ret
   1403515ee:	f2 0f 10 05 12 ec 4f 	movsd  xmm0,QWORD PTR [rip+0x4fec12]        # 0x140850208
   1403515f5:	00 
   1403515f6:	66 0f 6e c9          	movd   xmm1,ecx
   1403515fa:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   1403515fe:	f2 0f 5e 0d 42 cb 33 	divsd  xmm1,QWORD PTR [rip+0x33cb42]        # 0x14068e148
   140351605:	00 
   140351606:	e8 6f f7 2c 00       	call   0x140620d7a
   14035160b:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14035160f:	48 83 c4 28          	add    rsp,0x28
   140351613:	c3                   	ret
   140351614:	a0 15 35 00 ee 15 35 	movabs al,ds:0xee003515ee003515
   14035161b:	00 ee 
   14035161d:	15 35 00 ad 15       	adc    eax,0x15ad0035
   140351622:	35 00 ee 15 35       	xor    eax,0x3515ee00
   140351627:	00 ee                	add    dh,ch
   140351629:	15 35 00 ba 15       	adc    eax,0x15ba0035
   14035162e:	35 00 ee 15 35       	xor    eax,0x3515ee00
   140351633:	00 ee                	add    dh,ch
   140351635:	15 35 00 c7 15       	adc    eax,0x15c70035
   14035163a:	35 00 ee 15 35       	xor    eax,0x3515ee00
   14035163f:	00 ee                	add    dh,ch
   140351641:	15 35 00 d4 15       	adc    eax,0x15d40035
   140351646:	35 00 ee 15 35       	xor    eax,0x3515ee00
   14035164b:	00 ee                	add    dh,ch
   14035164d:	15 35 00 e1 15       	adc    eax,0x15e10035
   140351652:	35 00 cc cc cc       	xor    eax,0xcccccc00
   140351657:	cc                   	int3
   140351658:	cc                   	int3
   140351659:	cc                   	int3
   14035165a:	cc                   	int3
   14035165b:	cc                   	int3
   14035165c:	cc                   	int3
   14035165d:	cc                   	int3
   14035165e:	cc                   	int3
   14035165f:	cc                   	int3
   140351660:	48 83 ec 28          	sub    rsp,0x28
   140351664:	85 c9                	test   ecx,ecx
   140351666:	74 4a                	je     0x1403516b2
   140351668:	83 f9 07             	cmp    ecx,0x7
   14035166b:	74 38                	je     0x1403516a5
   14035166d:	83 f9 0e             	cmp    ecx,0xe
   140351670:	74 26                	je     0x140351698
   140351672:	f2 0f 10 05 8e eb 4f 	movsd  xmm0,QWORD PTR [rip+0x4feb8e]        # 0x140850208
   140351679:	00 
   14035167a:	66 0f 6e c9          	movd   xmm1,ecx
   14035167e:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   140351682:	f2 0f 5e 0d be ca 33 	divsd  xmm1,QWORD PTR [rip+0x33cabe]        # 0x14068e148
   140351689:	00 
   14035168a:	e8 eb f6 2c 00       	call   0x140620d7a
   14035168f:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140351693:	48 83 c4 28          	add    rsp,0x28
   140351697:	c3                   	ret
   140351698:	f3 0f 10 05 cc 6c 35 	movss  xmm0,DWORD PTR [rip+0x356ccc]        # 0x1406a836c
   14035169f:	00 
   1403516a0:	48 83 c4 28          	add    rsp,0x28
   1403516a4:	c3                   	ret
   1403516a5:	f3 0f 10 05 b3 6c 35 	movss  xmm0,DWORD PTR [rip+0x356cb3]        # 0x1406a8360
   1403516ac:	00 
   1403516ad:	48 83 c4 28          	add    rsp,0x28
   1403516b1:	c3                   	ret
   1403516b2:	f3 0f 10 05 76 e9 4f 	movss  xmm0,DWORD PTR [rip+0x4fe976]        # 0x140850030
   1403516b9:	00 
   1403516ba:	48 83 c4 28          	add    rsp,0x28
   1403516be:	c3                   	ret
   1403516bf:	cc                   	int3
   1403516c0:	48 83 ec 28          	sub    rsp,0x28
   1403516c4:	83 f9 fe             	cmp    ecx,0xfffffffe
   1403516c7:	74 49                	je     0x140351712
   1403516c9:	83 f9 ff             	cmp    ecx,0xffffffff
   1403516cc:	74 37                	je     0x140351705
   1403516ce:	85 c9                	test   ecx,ecx
   1403516d0:	74 26                	je     0x1403516f8
   1403516d2:	f2 0f 10 05 2e eb 4f 	movsd  xmm0,QWORD PTR [rip+0x4feb2e]        # 0x140850208
   1403516d9:	00 
   1403516da:	66 0f 6e c9          	movd   xmm1,ecx
   1403516de:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   1403516e2:	f2 0f 5e 0d 5e ca 33 	divsd  xmm1,QWORD PTR [rip+0x33ca5e]        # 0x14068e148
   1403516e9:	00 
   1403516ea:	e8 8b f6 2c 00       	call   0x140620d7a
   1403516ef:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   1403516f3:	48 83 c4 28          	add    rsp,0x28
   1403516f7:	c3                   	ret
   1403516f8:	f3 0f 10 05 30 e9 4f 	movss  xmm0,DWORD PTR [rip+0x4fe930]        # 0x140850030
   1403516ff:	00 
   140351700:	48 83 c4 28          	add    rsp,0x28
   140351704:	c3                   	ret
   140351705:	f3 0f 10 05 2f 6c 35 	movss  xmm0,DWORD PTR [rip+0x356c2f]        # 0x1406a833c
   14035170c:	00 
   14035170d:	48 83 c4 28          	add    rsp,0x28
   140351711:	c3                   	ret
   140351712:	f3 0f 10 05 f6 61 35 	movss  xmm0,DWORD PTR [rip+0x3561f6]        # 0x1406a7910
   140351719:	00 
   14035171a:	48 83 c4 28          	add    rsp,0x28
   14035171e:	c3                   	ret
   14035171f:	cc                   	int3
   140351720:	48 83 ec 68          	sub    rsp,0x68
   140351724:	48 8b 05 3d 0a 62 00 	mov    rax,QWORD PTR [rip+0x620a3d]        # 0x140972168
   14035172b:	48 33 c4             	xor    rax,rsp
   14035172e:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax
   140351733:	0f 10 05 c6 6c 35 00 	movups xmm0,XMMWORD PTR [rip+0x356cc6]        # 0x1406a8400
   14035173a:	4c 8b c1             	mov    r8,rcx
   14035173d:	8b 05 d5 6c 35 00    	mov    eax,DWORD PTR [rip+0x356cd5]        # 0x1406a8418
   140351743:	f2 0f 10 0d c5 6c 35 	movsd  xmm1,QWORD PTR [rip+0x356cc5]        # 0x1406a8410
   14035174a:	00 
   14035174b:	48 8d 4c 24 20       	lea    rcx,[rsp+0x20]
   140351750:	0f 11 44 24 20       	movups XMMWORD PTR [rsp+0x20],xmm0
   140351755:	c7 44 24 3c 00 00 00 	mov    DWORD PTR [rsp+0x3c],0x0
   14035175c:	00 
   14035175d:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   140351760:	ba 30 00 00 00       	mov    edx,0x30
   140351765:	89 44 24 38          	mov    DWORD PTR [rsp+0x38],eax
   140351769:	f2 0f 11 4c 24 30    	movsd  QWORD PTR [rsp+0x30],xmm1
   14035176f:	0f 11 44 24 40       	movups XMMWORD PTR [rsp+0x40],xmm0
   140351774:	e8 a7 2d 00 00       	call   0x140354520
   140351779:	48 8b 4c 24 50       	mov    rcx,QWORD PTR [rsp+0x50]
   14035177e:	48 33 cc             	xor    rcx,rsp
   140351781:	e8 7a 9e 2c 00       	call   0x14061b600
   140351786:	48 83 c4 68          	add    rsp,0x68
   14035178a:	c3                   	ret
   14035178b:	cc                   	int3
   14035178c:	cc                   	int3
   14035178d:	cc                   	int3
   14035178e:	cc                   	int3
   14035178f:	cc                   	int3
   140351790:	cc                   	int3
   140351791:	cc                   	int3
   140351792:	cc                   	int3
   140351793:	cc                   	int3
   140351794:	cc                   	int3
   140351795:	cc                   	int3
   140351796:	cc                   	int3
   140351797:	cc                   	int3
   140351798:	cc                   	int3
   140351799:	cc                   	int3
   14035179a:	cc                   	int3
   14035179b:	cc                   	int3
   14035179c:	cc                   	int3
   14035179d:	cc                   	int3
   14035179e:	cc                   	int3
   14035179f:	cc                   	int3
   1403517a0:	40 55                	rex push rbp
   1403517a2:	53                   	push   rbx
   1403517a3:	56                   	push   rsi
   1403517a4:	57                   	push   rdi
   1403517a5:	41 54                	push   r12
   1403517a7:	41 56                	push   r14
   1403517a9:	41 57                	push   r15
   1403517ab:	48 8d 6c 24 e1       	lea    rbp,[rsp-0x1f]
   1403517b0:	48 81 ec c0 00 00 00 	sub    rsp,0xc0
   1403517b7:	48 c7 45 e7 fe ff ff 	mov    QWORD PTR [rbp-0x19],0xfffffffffffffffe
   1403517be:	ff 
   1403517bf:	48 8b 05 a2 09 62 00 	mov    rax,QWORD PTR [rip+0x6209a2]        # 0x140972168
   1403517c6:	48 33 c4             	xor    rax,rsp
   1403517c9:	48 89 45 0f          	mov    QWORD PTR [rbp+0xf],rax
   1403517cd:	41 8b f1             	mov    esi,r9d
   1403517d0:	4d 8b f0             	mov    r14,r8
   1403517d3:	4c 8b fa             	mov    r15,rdx
   1403517d6:	48 8b f9             	mov    rdi,rcx
   1403517d9:	48 8b 5d 7f          	mov    rbx,QWORD PTR [rbp+0x7f]
   1403517dd:	45 33 e4             	xor    r12d,r12d
   1403517e0:	4c 89 65 b7          	mov    QWORD PTR [rbp-0x49],r12
   1403517e4:	4c 89 65 bf          	mov    QWORD PTR [rbp-0x41],r12
   1403517e8:	4c 89 65 c7          	mov    QWORD PTR [rbp-0x39],r12
   1403517ec:	48 85 c9             	test   rcx,rcx
   1403517ef:	74 44                	je     0x140351835
   1403517f1:	66 44 39 21          	cmp    WORD PTR [rcx],r12w
   1403517f5:	74 3e                	je     0x140351835
   1403517f7:	48 c7 c2 ff ff ff ff 	mov    rdx,0xffffffffffffffff
   1403517fe:	66 90                	xchg   ax,ax
   140351800:	48 8d 52 01          	lea    rdx,[rdx+0x1]
   140351804:	66 83 3c 51 00       	cmp    WORD PTR [rcx+rdx*2],0x0
   140351809:	75 f5                	jne    0x140351800
   14035180b:	48 8d 14 55 02 00 00 	lea    rdx,[rdx*2+0x2]
   140351812:	00 
   140351813:	4c 8d 45 b7          	lea    r8,[rbp-0x49]
   140351817:	48 8d 4d b7          	lea    rcx,[rbp-0x49]
   14035181b:	e8 24 c6 e8 ff       	call   0x1401dde44
   140351820:	4c 8b 45 bf          	mov    r8,QWORD PTR [rbp-0x41]
   140351824:	48 8b 4d b7          	mov    rcx,QWORD PTR [rbp-0x49]
   140351828:	4c 2b c1             	sub    r8,rcx
   14035182b:	48 8b d7             	mov    rdx,rdi
   14035182e:	e8 b1 f4 2c 00       	call   0x140620ce4
   140351833:	eb 1a                	jmp    0x14035184f
   140351835:	4c 8d 45 b7          	lea    r8,[rbp-0x49]
   140351839:	ba 02 00 00 00       	mov    edx,0x2
   14035183e:	48 8d 4d b7          	lea    rcx,[rbp-0x49]
   140351842:	e8 fd c5 e8 ff       	call   0x1401dde44
   140351847:	48 8b 45 b7          	mov    rax,QWORD PTR [rbp-0x49]
   14035184b:	66 44 89 20          	mov    WORD PTR [rax],r12w
   14035184f:	41 b9 02 00 00 00    	mov    r9d,0x2
   140351855:	45 8d 41 0a          	lea    r8d,[r9+0xa]
   140351859:	48 8d 55 ef          	lea    rdx,[rbp-0x11]
   14035185d:	33 c9                	xor    ecx,ecx
   14035185f:	e8 74 f4 2c 00       	call   0x140620cd8
   140351864:	85 c0                	test   eax,eax
   140351866:	74 07                	je     0x14035186f
   140351868:	32 db                	xor    bl,bl
   14035186a:	e9 c1 01 00 00       	jmp    0x140351a30
   14035186f:	4c 89 65 cf          	mov    QWORD PTR [rbp-0x31],r12
   140351873:	0f 57 c0             	xorps  xmm0,xmm0
   140351876:	f3 0f 7f 45 d7       	movdqu XMMWORD PTR [rbp-0x29],xmm0
   14035187b:	48 8b 55 bf          	mov    rdx,QWORD PTR [rbp-0x41]
   14035187f:	48 8b 45 b7          	mov    rax,QWORD PTR [rbp-0x49]
   140351883:	48 2b d0             	sub    rdx,rax
   140351886:	48 8d 4d ff          	lea    rcx,[rbp-0x1]
   14035188a:	48 89 4c 24 40       	mov    QWORD PTR [rsp+0x40],rcx
   14035188f:	48 8d 4d cf          	lea    rcx,[rbp-0x31]
   140351893:	48 89 4c 24 38       	mov    QWORD PTR [rsp+0x38],rcx
   140351898:	48 89 54 24 30       	mov    QWORD PTR [rsp+0x30],rdx
   14035189d:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   1403518a2:	48 89 74 24 20       	mov    QWORD PTR [rsp+0x20],rsi
   1403518a7:	4d 8b ce             	mov    r9,r14
   1403518aa:	41 b8 0c 00 00 00    	mov    r8d,0xc
   1403518b0:	48 8d 55 ef          	lea    rdx,[rbp-0x11]
   1403518b4:	49 8b cf             	mov    rcx,r15
   1403518b7:	e8 54 23 00 00       	call   0x140353c10
   1403518bc:	84 c0                	test   al,al
   1403518be:	75 07                	jne    0x1403518c7
   1403518c0:	32 db                	xor    bl,bl
   1403518c2:	e9 20 01 00 00       	jmp    0x1403519e7
   1403518c7:	48 8b 13             	mov    rdx,QWORD PTR [rbx]
   1403518ca:	48 89 53 08          	mov    QWORD PTR [rbx+0x8],rdx
   1403518ce:	48 39 53 10          	cmp    QWORD PTR [rbx+0x10],rdx
   1403518d2:	74 09                	je     0x1403518dd
   1403518d4:	c6 02 01             	mov    BYTE PTR [rdx],0x1
   1403518d7:	48 ff 43 08          	inc    QWORD PTR [rbx+0x8]
   1403518db:	eb 0f                	jmp    0x1403518ec
   1403518dd:	4c 8d 05 c9 6a 35 00 	lea    r8,[rip+0x356ac9]        # 0x1406a83ad
   1403518e4:	48 8b cb             	mov    rcx,rbx
   1403518e7:	e8 c4 a4 f6 ff       	call   0x1402bbdb0
   1403518ec:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   1403518f0:	85 f6                	test   esi,esi
   1403518f2:	0f 95 c0             	setne  al
   1403518f5:	88 45 af             	mov    BYTE PTR [rbp-0x51],al
   1403518f8:	48 39 53 10          	cmp    QWORD PTR [rbx+0x10],rdx
   1403518fc:	74 08                	je     0x140351906
   1403518fe:	88 02                	mov    BYTE PTR [rdx],al
   140351900:	48 ff 43 08          	inc    QWORD PTR [rbx+0x8]
   140351904:	eb 0c                	jmp    0x140351912
   140351906:	4c 8d 45 af          	lea    r8,[rbp-0x51]
   14035190a:	48 8b cb             	mov    rcx,rbx
   14035190d:	e8 3e 19 00 00       	call   0x140353250
   140351912:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   140351916:	c6 45 af 00          	mov    BYTE PTR [rbp-0x51],0x0
   14035191a:	48 39 53 10          	cmp    QWORD PTR [rbx+0x10],rdx
   14035191e:	74 09                	je     0x140351929
   140351920:	c6 02 00             	mov    BYTE PTR [rdx],0x0
   140351923:	48 ff 43 08          	inc    QWORD PTR [rbx+0x8]
   140351927:	eb 0c                	jmp    0x140351935
   140351929:	4c 8d 45 af          	lea    r8,[rbp-0x51]
   14035192d:	48 8b cb             	mov    rcx,rbx
   140351930:	e8 1b 19 00 00       	call   0x140353250
   140351935:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   140351939:	c6 45 af 00          	mov    BYTE PTR [rbp-0x51],0x0
   14035193d:	48 39 53 10          	cmp    QWORD PTR [rbx+0x10],rdx
   140351941:	74 09                	je     0x14035194c
   140351943:	c6 02 00             	mov    BYTE PTR [rdx],0x0
   140351946:	48 ff 43 08          	inc    QWORD PTR [rbx+0x8]
   14035194a:	eb 0c                	jmp    0x140351958
   14035194c:	4c 8d 45 af          	lea    r8,[rbp-0x51]
   140351950:	48 8b cb             	mov    rcx,rbx
   140351953:	e8 f8 18 00 00       	call   0x140353250
   140351958:	8b d6                	mov    edx,esi
   14035195a:	48 8b cb             	mov    rcx,rbx
   14035195d:	e8 2e 2d 00 00       	call   0x140354690
   140351962:	48 8b 55 d7          	mov    rdx,QWORD PTR [rbp-0x29]
   140351966:	48 2b 55 cf          	sub    rdx,QWORD PTR [rbp-0x31]
   14035196a:	48 8b cb             	mov    rcx,rbx
   14035196d:	e8 1e 2d 00 00       	call   0x140354690
   140351972:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   140351976:	0f b6 45 af          	movzx  eax,BYTE PTR [rbp-0x51]
   14035197a:	88 44 24 20          	mov    BYTE PTR [rsp+0x20],al
   14035197e:	4c 8d 4d fb          	lea    r9,[rbp-0x5]
   140351982:	4c 8d 45 ef          	lea    r8,[rbp-0x11]
   140351986:	48 8b cb             	mov    rcx,rbx
   140351989:	e8 72 1d 00 00       	call   0x140353700
   14035198e:	85 f6                	test   esi,esi
   140351990:	74 1b                	je     0x1403519ad
   140351992:	4e 8d 0c 36          	lea    r9,[rsi+r14*1]
   140351996:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   14035199a:	0f b6 45 af          	movzx  eax,BYTE PTR [rbp-0x51]
   14035199e:	88 44 24 20          	mov    BYTE PTR [rsp+0x20],al
   1403519a2:	4d 8b c6             	mov    r8,r14
   1403519a5:	48 8b cb             	mov    rcx,rbx
   1403519a8:	e8 53 1d 00 00       	call   0x140353700
   1403519ad:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   1403519b1:	0f b6 45 af          	movzx  eax,BYTE PTR [rbp-0x51]
   1403519b5:	88 44 24 20          	mov    BYTE PTR [rsp+0x20],al
   1403519b9:	4c 8b 4d d7          	mov    r9,QWORD PTR [rbp-0x29]
   1403519bd:	4c 8b 45 cf          	mov    r8,QWORD PTR [rbp-0x31]
   1403519c1:	48 8b cb             	mov    rcx,rbx
   1403519c4:	e8 37 1d 00 00       	call   0x140353700
   1403519c9:	48 8b 53 08          	mov    rdx,QWORD PTR [rbx+0x8]
   1403519cd:	0f b6 45 af          	movzx  eax,BYTE PTR [rbp-0x51]
   1403519d1:	88 44 24 20          	mov    BYTE PTR [rsp+0x20],al
   1403519d5:	4c 8d 4d 0f          	lea    r9,[rbp+0xf]
   1403519d9:	4c 8d 45 ff          	lea    r8,[rbp-0x1]
   1403519dd:	48 8b cb             	mov    rcx,rbx
   1403519e0:	e8 1b 1d 00 00       	call   0x140353700
   1403519e5:	b3 01                	mov    bl,0x1
   1403519e7:	48 8b 4d cf          	mov    rcx,QWORD PTR [rbp-0x31]
   1403519eb:	48 85 c9             	test   rcx,rcx
   1403519ee:	74 40                	je     0x140351a30
   1403519f0:	48 8b 55 df          	mov    rdx,QWORD PTR [rbp-0x21]
   1403519f4:	48 2b d1             	sub    rdx,rcx
   1403519f7:	48 8b c1             	mov    rax,rcx
   1403519fa:	48 81 fa 00 10 00 00 	cmp    rdx,0x1000
   140351a01:	72 1c                	jb     0x140351a1f
   140351a03:	48 83 c2 27          	add    rdx,0x27
   140351a07:	48 8b 49 f8          	mov    rcx,QWORD PTR [rcx-0x8]
   140351a0b:	48 2b c1             	sub    rax,rcx
   140351a0e:	48 83 c0 f8          	add    rax,0xfffffffffffffff8
   140351a12:	48 83 f8 1f          	cmp    rax,0x1f
   140351a16:	76 07                	jbe    0x140351a1f
   140351a18:	ff 15 ca 81 33 00    	call   QWORD PTR [rip+0x3381ca]        # 0x140689be8
   140351a1e:	cc                   	int3
   140351a1f:	e8 34 9b 2c 00       	call   0x14061b558
   140351a24:	0f 57 c0             	xorps  xmm0,xmm0
   140351a27:	f3 0f 7f 45 cf       	movdqu XMMWORD PTR [rbp-0x31],xmm0
   140351a2c:	4c 89 65 df          	mov    QWORD PTR [rbp-0x21],r12
   140351a30:	48 8b 4d b7          	mov    rcx,QWORD PTR [rbp-0x49]
   140351a34:	48 85 c9             	test   rcx,rcx
   140351a37:	74 34                	je     0x140351a6d
   140351a39:	48 8b 55 c7          	mov    rdx,QWORD PTR [rbp-0x39]
   140351a3d:	48 2b d1             	sub    rdx,rcx
   140351a40:	48 8b c1             	mov    rax,rcx
   140351a43:	48 81 fa 00 10 00 00 	cmp    rdx,0x1000
   140351a4a:	72 1c                	jb     0x140351a68
   140351a4c:	48 83 c2 27          	add    rdx,0x27
   140351a50:	48 8b 49 f8          	mov    rcx,QWORD PTR [rcx-0x8]
   140351a54:	48 2b c1             	sub    rax,rcx
   140351a57:	48 83 c0 f8          	add    rax,0xfffffffffffffff8
   140351a5b:	48 83 f8 1f          	cmp    rax,0x1f
   140351a5f:	76 07                	jbe    0x140351a68
   140351a61:	ff 15 81 81 33 00    	call   QWORD PTR [rip+0x338181]        # 0x140689be8
   140351a67:	cc                   	int3
   140351a68:	e8 eb 9a 2c 00       	call   0x14061b558
   140351a6d:	0f b6 c3             	movzx  eax,bl
   140351a70:	48 8b 4d 0f          	mov    rcx,QWORD PTR [rbp+0xf]
   140351a74:	48 33 cc             	xor    rcx,rsp
   140351a77:	e8 84 9b 2c 00       	call   0x14061b600
   140351a7c:	48 81 c4 c0 00 00 00 	add    rsp,0xc0
   140351a83:	41 5f                	pop    r15
   140351a85:	41 5e                	pop    r14
   140351a87:	41 5c                	pop    r12
   140351a89:	5f                   	pop    rdi
   140351a8a:	5e                   	pop    rsi
   140351a8b:	5b                   	pop    rbx
   140351a8c:	5d                   	pop    rbp
   140351a8d:	c3                   	ret
   140351a8e:	cc                   	int3
   140351a8f:	cc                   	int3
   140351a90:	cc                   	int3
   140351a91:	cc                   	int3
   140351a92:	cc                   	int3
   140351a93:	cc                   	int3
   140351a94:	cc                   	int3
   140351a95:	cc                   	int3
   140351a96:	cc                   	int3
   140351a97:	cc                   	int3
   140351a98:	cc                   	int3
   140351a99:	cc                   	int3
   140351a9a:	cc                   	int3
   140351a9b:	cc                   	int3
   140351a9c:	cc                   	int3
   140351a9d:	cc                   	int3
   140351a9e:	cc                   	int3
   140351a9f:	cc                   	int3
   140351aa0:	48 8b c4             	mov    rax,rsp
   140351aa3:	57                   	push   rdi
   140351aa4:	41 54                	push   r12
   140351aa6:	41 55                	push   r13
   140351aa8:	41 56                	push   r14
   140351aaa:	41 57                	push   r15
   140351aac:	48 81 ec 90 00 00 00 	sub    rsp,0x90
   140351ab3:	48 c7 40 98 fe ff ff 	mov    QWORD PTR [rax-0x68],0xfffffffffffffffe
   140351aba:	ff 
   140351abb:	48 89 58 10          	mov    QWORD PTR [rax+0x10],rbx
   140351abf:	48 89 68 18          	mov    QWORD PTR [rax+0x18],rbp
   140351ac3:	48 89 70 20          	mov    QWORD PTR [rax+0x20],rsi
   140351ac7:	49 8b e9             	mov    rbp,r9
   140351aca:	4d 8b f8             	mov    r15,r8
   140351acd:	4c 8d 1c 11          	lea    r11,[rcx+rdx*1]
   140351ad1:	48 8d 41 20          	lea    rax,[rcx+0x20]
   140351ad5:	49 3b c3             	cmp    rax,r11
   140351ad8:	76 07                	jbe    0x140351ae1
   140351ada:	32 c0                	xor    al,al
   140351adc:	e9 f4 01 00 00       	jmp    0x140351cd5
   140351ae1:	0f b6 59 01          	movzx  ebx,BYTE PTR [rcx+0x1]
   140351ae5:	80 39 01             	cmp    BYTE PTR [rcx],0x1
   140351ae8:	75 f0                	jne    0x140351ada
   140351aea:	4c 8d 41 08          	lea    r8,[rcx+0x8]
   140351aee:	4d 3b c3             	cmp    r8,r11
   140351af1:	0f 87 22 02 00 00    	ja     0x140351d19
   140351af7:	0f b6 51 07          	movzx  edx,BYTE PTR [rcx+0x7]
   140351afb:	c1 e2 08             	shl    edx,0x8
   140351afe:	0f                   	.byte 0xf
   140351aff:	b6                   	.byte 0xb6
