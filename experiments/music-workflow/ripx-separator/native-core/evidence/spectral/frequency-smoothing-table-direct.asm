
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140614b90 <.text+0x613b90>:
   140614b90:	85 d2                	test   edx,edx
   140614b92:	0f 84 ba 01 00 00    	je     0x140614d52
   140614b98:	48 8b c4             	mov    rax,rsp
   140614b9b:	48 89 70 18          	mov    QWORD PTR [rax+0x18],rsi
   140614b9f:	48 89 78 20          	mov    QWORD PTR [rax+0x20],rdi
   140614ba3:	41 56                	push   r14
   140614ba5:	48 81 ec a0 00 00 00 	sub    rsp,0xa0
   140614bac:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   140614bb0:	33 ff                	xor    edi,edi
   140614bb2:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6
   140614bb6:	4c 8b f1             	mov    r14,rcx
   140614bb9:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7
   140614bbd:	f2 0f 10 3d b3 b5 23 	movsd  xmm7,QWORD PTR [rip+0x23b5b3]        # 0x140850178
   140614bc4:	00 
   140614bc5:	8b f2                	mov    esi,edx
   140614bc7:	44 0f 29 40 c8       	movaps XMMWORD PTR [rax-0x38],xmm8
   140614bcc:	44 0f 29 48 b8       	movaps XMMWORD PTR [rax-0x48],xmm9
   140614bd1:	83 fe 02             	cmp    esi,0x2
   140614bd4:	0f 82 d9 00 00 00    	jb     0x140614cb3
   140614bda:	66 44 0f 6f 05 3d b8 	movdqa xmm8,XMMWORD PTR [rip+0x23b83d]        # 0x140850420
   140614be1:	23 00 
   140614be3:	0f 57 c0             	xorps  xmm0,xmm0
   140614be6:	44 0f 28 0d f2 ba 23 	movaps xmm9,XMMWORD PTR [rip+0x23baf2]        # 0x1408506e0
   140614bed:	00 
   140614bee:	48 89 68 10          	mov    QWORD PTR [rax+0x10],rbp
   140614bf2:	8b ee                	mov    ebp,esi
   140614bf4:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   140614bf9:	83 e5 fe             	and    ebp,0xfffffffe
   140614bfc:	44 0f 29 58 98       	movaps XMMWORD PTR [rax-0x68],xmm11
   140614c01:	45 0f 57 d2          	xorps  xmm10,xmm10
   140614c05:	44 0f 28 1d b3 2f 09 	movaps xmm11,XMMWORD PTR [rip+0x92fb3]        # 0x1406a7bc0
   140614c0c:	00 
   140614c0d:	f2 48 0f 2a c6       	cvtsi2sd xmm0,rsi
   140614c12:	44 0f 29 60 88       	movaps XMMWORD PTR [rax-0x78],xmm12
   140614c17:	44 0f 28 25 01 bb 23 	movaps xmm12,XMMWORD PTR [rip+0x23bb01]        # 0x140850720
   140614c1e:	00 
   140614c1f:	f2 0f 5c c7          	subsd  xmm0,xmm7
   140614c23:	44 0f 29 6c 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm13
   140614c29:	44 0f 28 2d 7f ba 23 	movaps xmm13,XMMWORD PTR [rip+0x23ba7f]        # 0x1408506b0
   140614c30:	00 
   140614c31:	0f 28 f0             	movaps xmm6,xmm0
   140614c34:	66 0f 14 f6          	unpcklpd xmm6,xmm6
   140614c38:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140614c3f:	00 
   140614c40:	66 0f 6e cf          	movd   xmm1,edi
   140614c44:	f3 41 0f 7e c0       	movq   xmm0,xmm8
   140614c49:	66 0f 70 c9 00       	pshufd xmm1,xmm1,0x0
   140614c4e:	66 0f fe c8          	paddd  xmm1,xmm0
   140614c52:	f3 0f e6 d1          	cvtdq2pd xmm2,xmm1
   140614c56:	0f 28 c2             	movaps xmm0,xmm2
   140614c59:	66 41 0f c2 c2 01    	cmpltpd xmm0,xmm10
   140614c5f:	41 0f 54 c3          	andps  xmm0,xmm11
   140614c63:	66 0f 58 c2          	addpd  xmm0,xmm2
   140614c67:	66 41 0f 59 c4       	mulpd  xmm0,xmm12
   140614c6c:	66 0f 5e c6          	divpd  xmm0,xmm6
   140614c70:	e8 eb 75 00 00       	call   0x14061c260
   140614c75:	41 0f 28 c9          	movaps xmm1,xmm9
   140614c79:	66 0f 5c c8          	subpd  xmm1,xmm0
   140614c7d:	66 41 0f 59 cd       	mulpd  xmm1,xmm13
   140614c82:	66 0f 5a c1          	cvtpd2ps xmm0,xmm1
   140614c86:	f2 41 0f 11 04 be    	movsd  QWORD PTR [r14+rdi*4],xmm0
   140614c8c:	83 c7 02             	add    edi,0x2
   140614c8f:	3b fd                	cmp    edi,ebp
   140614c91:	72 ad                	jb     0x140614c40
   140614c93:	44 0f 28 6c 24 20    	movaps xmm13,XMMWORD PTR [rsp+0x20]
   140614c99:	44 0f 28 64 24 30    	movaps xmm12,XMMWORD PTR [rsp+0x30]
   140614c9f:	44 0f 28 5c 24 40    	movaps xmm11,XMMWORD PTR [rsp+0x40]
   140614ca5:	44 0f 28 54 24 50    	movaps xmm10,XMMWORD PTR [rsp+0x50]
   140614cab:	48 8b ac 24 b8 00 00 	mov    rbp,QWORD PTR [rsp+0xb8]
   140614cb2:	00 
   140614cb3:	3b fe                	cmp    edi,esi
   140614cb5:	73 62                	jae    0x140614d19
   140614cb7:	f2 44 0f 10 05 38 b5 	movsd  xmm8,QWORD PTR [rip+0x23b538]        # 0x1408501f8
   140614cbe:	23 00 
   140614cc0:	49 8d 1c be          	lea    rbx,[r14+rdi*4]
   140614cc4:	f2 44 0f 10 0d 5b b4 	movsd  xmm9,QWORD PTR [rip+0x23b45b]        # 0x140850128
   140614ccb:	23 00 
   140614ccd:	0f 57 f6             	xorps  xmm6,xmm6
   140614cd0:	f2 48 0f 2a f6       	cvtsi2sd xmm6,rsi
   140614cd5:	f2 0f 5c f7          	subsd  xmm6,xmm7
   140614cd9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140614ce0:	0f 57 c0             	xorps  xmm0,xmm0
   140614ce3:	8b c7                	mov    eax,edi
   140614ce5:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140614cea:	f2 41 0f 59 c0       	mulsd  xmm0,xmm8
   140614cef:	f2 0f 5e c6          	divsd  xmm0,xmm6
   140614cf3:	e8 dc c0 00 00       	call   0x140620dd4
   140614cf8:	0f 28 cf             	movaps xmm1,xmm7
   140614cfb:	ff c7                	inc    edi
   140614cfd:	f2 0f 5c c8          	subsd  xmm1,xmm0
   140614d01:	0f 57 c0             	xorps  xmm0,xmm0
   140614d04:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   140614d09:	f2 0f 5a c1          	cvtsd2ss xmm0,xmm1
   140614d0d:	f3 0f 11 03          	movss  DWORD PTR [rbx],xmm0
   140614d11:	48 83 c3 04          	add    rbx,0x4
   140614d15:	3b fe                	cmp    edi,esi
   140614d17:	72 c7                	jb     0x140614ce0
   140614d19:	44 0f 28 44 24 70    	movaps xmm8,XMMWORD PTR [rsp+0x70]
   140614d1f:	4c 8d 9c 24 a0 00 00 	lea    r11,[rsp+0xa0]
   140614d26:	00 
   140614d27:	49 8b 73 20          	mov    rsi,QWORD PTR [r11+0x20]
   140614d2b:	49 8b 7b 28          	mov    rdi,QWORD PTR [r11+0x28]
   140614d2f:	0f 28 bc 24 80 00 00 	movaps xmm7,XMMWORD PTR [rsp+0x80]
   140614d36:	00 
   140614d37:	0f 28 b4 24 90 00 00 	movaps xmm6,XMMWORD PTR [rsp+0x90]
   140614d3e:	00 
   140614d3f:	48 8b 9c 24 b0 00 00 	mov    rbx,QWORD PTR [rsp+0xb0]
   140614d46:	00 
   140614d47:	44 0f 28 4c 24 60    	movaps xmm9,XMMWORD PTR [rsp+0x60]
   140614d4d:	49 8b e3             	mov    rsp,r11
   140614d50:	41 5e                	pop    r14
   140614d52:	c3                   	ret
   140614d53:	cc                   	int3
   140614d54:	cc                   	int3
   140614d55:	cc                   	int3
   140614d56:	cc                   	int3
   140614d57:	cc                   	int3
   140614d58:	cc                   	int3
   140614d59:	cc                   	int3
   140614d5a:	cc                   	int3
   140614d5b:	cc                   	int3
   140614d5c:	cc                   	int3
   140614d5d:	cc                   	int3
   140614d5e:	cc                   	int3
   140614d5f:	cc                   	int3
   140614d60:	e9 f3 67 00 00       	jmp    0x14061b558
   140614d65:	cc                   	int3
   140614d66:	cc                   	int3
   140614d67:	cc                   	int3
   140614d68:	cc                   	int3
   140614d69:	cc                   	int3
   140614d6a:	cc                   	int3
   140614d6b:	cc                   	int3
   140614d6c:	cc                   	int3
   140614d6d:	cc                   	int3
   140614d6e:	cc                   	int3
   140614d6f:	cc                   	int3
   140614d70:	0f 57 c0             	xorps  xmm0,xmm0
   140614d73:	c3                   	ret
   140614d74:	cc                   	int3
   140614d75:	cc                   	int3
   140614d76:	cc                   	int3
   140614d77:	cc                   	int3
   140614d78:	cc                   	int3
   140614d79:	cc                   	int3
   140614d7a:	cc                   	int3
   140614d7b:	cc                   	int3
   140614d7c:	cc                   	int3
   140614d7d:	cc                   	int3
   140614d7e:	cc                   	int3
   140614d7f:	cc                   	int3
