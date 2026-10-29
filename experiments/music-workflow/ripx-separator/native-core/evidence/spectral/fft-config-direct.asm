
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140610900 <.text+0x60f900>:
   140610900:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140610905:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   14061090a:	48 89 7c 24 18       	mov    QWORD PTR [rsp+0x18],rdi
   14061090f:	41 56                	push   r14
   140610911:	48 83 ec 60          	sub    rsp,0x60
   140610915:	8d 41 ff             	lea    eax,[rcx-0x1]
   140610918:	8b f9                	mov    edi,ecx
   14061091a:	33 db                	xor    ebx,ebx
   14061091c:	48 63 c8             	movsxd rcx,eax
   14061091f:	48 c1 e1 04          	shl    rcx,0x4
   140610923:	8b f2                	mov    esi,edx
   140610925:	48 81 c1 18 01 00 00 	add    rcx,0x118
   14061092c:	44 8b f3             	mov    r14d,ebx
   14061092f:	4d 85 c9             	test   r9,r9
   140610932:	75 0b                	jne    0x14061093f
   140610934:	ff 15 c6 90 07 00    	call   QWORD PTR [rip+0x790c6]        # 0x140689a00
   14061093a:	4c 8b f0             	mov    r14,rax
   14061093d:	eb 0f                	jmp    0x14061094e
   14061093f:	4d 85 c0             	test   r8,r8
   140610942:	74 07                	je     0x14061094b
   140610944:	49 39 09             	cmp    QWORD PTR [r9],rcx
   140610947:	4d 0f 43 f0          	cmovae r14,r8
   14061094b:	49 89 09             	mov    QWORD PTR [r9],rcx
   14061094e:	4d 85 f6             	test   r14,r14
   140610951:	0f 84 11 01 00 00    	je     0x140610a68
   140610957:	41 89 3e             	mov    DWORD PTR [r14],edi
   14061095a:	41 89 76 04          	mov    DWORD PTR [r14+0x4],esi
   14061095e:	85 ff                	test   edi,edi
   140610960:	0f 8e 90 00 00 00    	jle    0x1406109f6
   140610966:	0f 29 74 24 50       	movaps XMMWORD PTR [rsp+0x50],xmm6
   14061096b:	49 8d b6 10 01 00 00 	lea    rsi,[r14+0x110]
   140610972:	0f 29 7c 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm7
   140610977:	f2 0f 10 3d 81 f9 23 	movsd  xmm7,QWORD PTR [rip+0x23f981]        # 0x140850300
   14061097e:	00 
   14061097f:	44 0f 29 44 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm8
   140610985:	66 44 0f 6e c7       	movd   xmm8,edi
   14061098a:	44 0f 29 4c 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm9
   140610990:	f2 44 0f 10 0d a7 dd 	movsd  xmm9,QWORD PTR [rip+0x18dda7]        # 0x14079e740
   140610997:	18 00 
   140610999:	f3 45 0f e6 c0       	cvtdq2pd xmm8,xmm8
   14061099e:	66 90                	xchg   ax,ax
   1406109a0:	41 83 7e 04 00       	cmp    DWORD PTR [r14+0x4],0x0
   1406109a5:	66 0f 6e f3          	movd   xmm6,ebx
   1406109a9:	f3 0f e6 f6          	cvtdq2pd xmm6,xmm6
   1406109ad:	f2 41 0f 59 f1       	mulsd  xmm6,xmm9
   1406109b2:	f2 41 0f 5e f0       	divsd  xmm6,xmm8
   1406109b7:	74 04                	je     0x1406109bd
   1406109b9:	f2 0f 59 f7          	mulsd  xmm6,xmm7
   1406109bd:	0f 28 c6             	movaps xmm0,xmm6
   1406109c0:	e8 0f 04 01 00       	call   0x140620dd4
   1406109c5:	f2 0f 11 46 f8       	movsd  QWORD PTR [rsi-0x8],xmm0
   1406109ca:	0f 28 c6             	movaps xmm0,xmm6
   1406109cd:	e8 b4 03 01 00       	call   0x140620d86
   1406109d2:	f2 0f 11 06          	movsd  QWORD PTR [rsi],xmm0
   1406109d6:	ff c3                	inc    ebx
   1406109d8:	48 83 c6 10          	add    rsi,0x10
   1406109dc:	3b df                	cmp    ebx,edi
   1406109de:	7c c0                	jl     0x1406109a0
   1406109e0:	44 0f 28 4c 24 20    	movaps xmm9,XMMWORD PTR [rsp+0x20]
   1406109e6:	44 0f 28 44 24 30    	movaps xmm8,XMMWORD PTR [rsp+0x30]
   1406109ec:	0f 28 7c 24 40       	movaps xmm7,XMMWORD PTR [rsp+0x40]
   1406109f1:	0f 28 74 24 50       	movaps xmm6,XMMWORD PTR [rsp+0x50]
   1406109f6:	66 0f 6e c7          	movd   xmm0,edi
   1406109fa:	49 8d 76 08          	lea    rsi,[r14+0x8]
   1406109fe:	f3 0f e6 c0          	cvtdq2pd xmm0,xmm0
   140610a02:	bb 04 00 00 00       	mov    ebx,0x4
   140610a07:	e8 b0 03 01 00       	call   0x140620dbc
   140610a0c:	e8 3f 03 01 00       	call   0x140620d50
   140610a11:	0f 28 c8             	movaps xmm1,xmm0
   140610a14:	8b c7                	mov    eax,edi
   140610a16:	99                   	cdq
   140610a17:	f7 fb                	idiv   ebx
   140610a19:	85 d2                	test   edx,edx
   140610a1b:	74 36                	je     0x140610a53
   140610a1d:	0f 1f 00             	nop    DWORD PTR [rax]
   140610a20:	83 fb 02             	cmp    ebx,0x2
   140610a23:	74 11                	je     0x140610a36
   140610a25:	83 fb 04             	cmp    ebx,0x4
   140610a28:	74 05                	je     0x140610a2f
   140610a2a:	83 c3 02             	add    ebx,0x2
   140610a2d:	eb 0c                	jmp    0x140610a3b
   140610a2f:	bb 02 00 00 00       	mov    ebx,0x2
   140610a34:	eb 05                	jmp    0x140610a3b
   140610a36:	bb 03 00 00 00       	mov    ebx,0x3
   140610a3b:	66 0f 6e c3          	movd   xmm0,ebx
   140610a3f:	8b c7                	mov    eax,edi
   140610a41:	f3 0f e6 c0          	cvtdq2pd xmm0,xmm0
   140610a45:	99                   	cdq
   140610a46:	66 0f 2f c1          	comisd xmm0,xmm1
   140610a4a:	0f 47 df             	cmova  ebx,edi
   140610a4d:	f7 fb                	idiv   ebx
   140610a4f:	85 d2                	test   edx,edx
   140610a51:	75 cd                	jne    0x140610a20
   140610a53:	8b c7                	mov    eax,edi
   140610a55:	89 1e                	mov    DWORD PTR [rsi],ebx
   140610a57:	99                   	cdq
   140610a58:	f7 fb                	idiv   ebx
   140610a5a:	89 46 04             	mov    DWORD PTR [rsi+0x4],eax
   140610a5d:	8b f8                	mov    edi,eax
   140610a5f:	48 83 c6 08          	add    rsi,0x8
   140610a63:	83 f8 01             	cmp    eax,0x1
   140610a66:	7f ac                	jg     0x140610a14
   140610a68:	48 8b 5c 24 70       	mov    rbx,QWORD PTR [rsp+0x70]
   140610a6d:	49 8b c6             	mov    rax,r14
   140610a70:	48 8b 74 24 78       	mov    rsi,QWORD PTR [rsp+0x78]
   140610a75:	48 8b bc 24 80 00 00 	mov    rdi,QWORD PTR [rsp+0x80]
   140610a7c:	00 
   140610a7d:	48 83 c4 60          	add    rsp,0x60
   140610a81:	41 5e                	pop    r14
   140610a83:	c3                   	ret
   140610a84:	cc                   	int3
   140610a85:	cc                   	int3
   140610a86:	cc                   	int3
   140610a87:	cc                   	int3
   140610a88:	cc                   	int3
   140610a89:	cc                   	int3
   140610a8a:	cc                   	int3
   140610a8b:	cc                   	int3
   140610a8c:	cc                   	int3
   140610a8d:	cc                   	int3
   140610a8e:	cc                   	int3
   140610a8f:	cc                   	int3
