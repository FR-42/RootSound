
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140610e60 <.text+0x60fe60>:
   140610e60:	48 8b c4             	mov    rax,rsp
   140610e63:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   140610e67:	48 89 68 10          	mov    QWORD PTR [rax+0x10],rbp
   140610e6b:	48 89 70 18          	mov    QWORD PTR [rax+0x18],rsi
   140610e6f:	48 89 78 20          	mov    QWORD PTR [rax+0x20],rdi
   140610e73:	41 56                	push   r14
   140610e75:	48 81 ec c0 00 00 00 	sub    rsp,0xc0
   140610e7c:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6
   140610e80:	4d 8d 90 08 01 00 00 	lea    r10,[r8+0x108]
   140610e87:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7
   140610e8b:	48 8d 3c 52          	lea    rdi,[rdx+rdx*2]
   140610e8f:	44 0f 29 40 c8       	movaps XMMWORD PTR [rax-0x38],xmm8
   140610e94:	4c 8b da             	mov    r11,rdx
   140610e97:	44 0f 29 48 b8       	movaps XMMWORD PTR [rax-0x48],xmm9
   140610e9c:	48 8b da             	mov    rbx,rdx
   140610e9f:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   140610ea4:	4b 8d 14 49          	lea    rdx,[r9+r9*2]
   140610ea8:	44 0f 29 58 98       	movaps XMMWORD PTR [rax-0x68],xmm11
   140610ead:	49 8b f0             	mov    rsi,r8
   140610eb0:	49 8b c1             	mov    rax,r9
   140610eb3:	49 c1 e3 04          	shl    r11,0x4
   140610eb7:	4d 8b c1             	mov    r8,r9
   140610eba:	48 c1 e3 05          	shl    rbx,0x5
   140610ebe:	48 03 c0             	add    rax,rax
   140610ec1:	48 c1 e7 04          	shl    rdi,0x4
   140610ec5:	48 83 c1 08          	add    rcx,0x8
   140610ec9:	49 c1 e0 05          	shl    r8,0x5
   140610ecd:	48 03 d2             	add    rdx,rdx
   140610ed0:	49 8b ea             	mov    rbp,r10
   140610ed3:	4d 8b f2             	mov    r14,r10
   140610ed6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140610edd:	00 00 00 
   140610ee0:	f2 45 0f 10 0a       	movsd  xmm9,QWORD PTR [r10]
   140610ee5:	f2 41 0f 10 52 08    	movsd  xmm2,QWORD PTR [r10+0x8]
   140610eeb:	45 0f 28 d1          	movaps xmm10,xmm9
   140610eef:	f2 41 0f 10 3e       	movsd  xmm7,QWORD PTR [r14]
   140610ef4:	0f 28 c2             	movaps xmm0,xmm2
   140610ef7:	f2 0f 59 54 c1 f8    	mulsd  xmm2,QWORD PTR [rcx+rax*8-0x8]
   140610efd:	0f 28 ef             	movaps xmm5,xmm7
   140610f00:	4d 03 d3             	add    r10,r11
   140610f03:	f2 0f 59 04 c1       	mulsd  xmm0,QWORD PTR [rcx+rax*8]
   140610f08:	f2 44 0f 59 0c c1    	mulsd  xmm9,QWORD PTR [rcx+rax*8]
   140610f0e:	f2 44 0f 59 54 c1 f8 	mulsd  xmm10,QWORD PTR [rcx+rax*8-0x8]
   140610f15:	f2 0f 10 65 00       	movsd  xmm4,QWORD PTR [rbp+0x0]
   140610f1a:	f2 0f 59 6c d1 f8    	mulsd  xmm5,QWORD PTR [rcx+rdx*8-0x8]
   140610f20:	f2 44 0f 58 ca       	addsd  xmm9,xmm2
   140610f25:	f2 0f 10 55 08       	movsd  xmm2,QWORD PTR [rbp+0x8]
   140610f2a:	f2 44 0f 5c d0       	subsd  xmm10,xmm0
   140610f2f:	f2 0f 59 3c d1       	mulsd  xmm7,QWORD PTR [rcx+rdx*8]
   140610f34:	0f 28 f4             	movaps xmm6,xmm4
   140610f37:	48 03 eb             	add    rbp,rbx
   140610f3a:	f2 44 0f 10 01       	movsd  xmm8,QWORD PTR [rcx]
   140610f3f:	0f 28 c2             	movaps xmm0,xmm2
   140610f42:	f2 41 0f 59 54 08 f8 	mulsd  xmm2,QWORD PTR [r8+rcx*1-0x8]
   140610f49:	f2 41 0f 59 04 08    	mulsd  xmm0,QWORD PTR [r8+rcx*1]
   140610f4f:	f2 41 0f 59 74 08 f8 	mulsd  xmm6,QWORD PTR [r8+rcx*1-0x8]
   140610f56:	f2 44 0f 10 59 f8    	movsd  xmm11,QWORD PTR [rcx-0x8]
   140610f5c:	f2 41 0f 59 24 08    	mulsd  xmm4,QWORD PTR [r8+rcx*1]
   140610f62:	f2 0f 5c f0          	subsd  xmm6,xmm0
   140610f66:	f2 0f 58 e2          	addsd  xmm4,xmm2
   140610f6a:	f2 41 0f 10 56 08    	movsd  xmm2,QWORD PTR [r14+0x8]
   140610f70:	0f 28 c2             	movaps xmm0,xmm2
   140610f73:	4c 03 f7             	add    r14,rdi
   140610f76:	f2 0f 59 04 d1       	mulsd  xmm0,QWORD PTR [rcx+rdx*8]
   140610f7b:	f2 44 0f 5c de       	subsd  xmm11,xmm6
   140610f80:	f2 0f 59 54 d1 f8    	mulsd  xmm2,QWORD PTR [rcx+rdx*8-0x8]
   140610f86:	0f 28 de             	movaps xmm3,xmm6
   140610f89:	f2 44 0f 5c c4       	subsd  xmm8,xmm4
   140610f8e:	f2 0f 11 64 24 18    	movsd  QWORD PTR [rsp+0x18],xmm4
   140610f94:	66 0f 16 5c 24 18    	movhpd xmm3,QWORD PTR [rsp+0x18]
   140610f9a:	f2 0f 5c e8          	subsd  xmm5,xmm0
   140610f9e:	0f 10 41 f8          	movups xmm0,XMMWORD PTR [rcx-0x8]
   140610fa2:	f2 0f 58 fa          	addsd  xmm7,xmm2
   140610fa6:	66 0f 58 d8          	addpd  xmm3,xmm0
   140610faa:	0f 28 d5             	movaps xmm2,xmm5
   140610fad:	0f 28 cf             	movaps xmm1,xmm7
   140610fb0:	0f 11 59 f8          	movups XMMWORD PTR [rcx-0x8],xmm3
   140610fb4:	f2 41 0f 58 d2       	addsd  xmm2,xmm10
   140610fb9:	f2 41 0f 58 c9       	addsd  xmm1,xmm9
   140610fbe:	f2 44 0f 5c cf       	subsd  xmm9,xmm7
   140610fc3:	f2 44 0f 5c d5       	subsd  xmm10,xmm5
   140610fc8:	f2 0f 5c da          	subsd  xmm3,xmm2
   140610fcc:	f2 0f 11 4c 24 38    	movsd  QWORD PTR [rsp+0x38],xmm1
   140610fd2:	f2 41 0f 11 5c 08 f8 	movsd  QWORD PTR [r8+rcx*1-0x8],xmm3
   140610fd9:	41 0f 28 d8          	movaps xmm3,xmm8
   140610fdd:	f2 0f 10 01          	movsd  xmm0,QWORD PTR [rcx]
   140610fe1:	f2 41 0f 5c da       	subsd  xmm3,xmm10
   140610fe6:	f2 0f 5c c1          	subsd  xmm0,xmm1
   140610fea:	0f 28 ca             	movaps xmm1,xmm2
   140610fed:	66 0f 16 4c 24 38    	movhpd xmm1,QWORD PTR [rsp+0x38]
   140610ff3:	f2 45 0f 58 d0       	addsd  xmm10,xmm8
   140610ff8:	41 0f 28 d1          	movaps xmm2,xmm9
   140610ffc:	f2 41 0f 58 d3       	addsd  xmm2,xmm11
   140611001:	f2 45 0f 5c d9       	subsd  xmm11,xmm9
   140611006:	f2 41 0f 11 04 08    	movsd  QWORD PTR [r8+rcx*1],xmm0
   14061100c:	0f 10 41 f8          	movups xmm0,XMMWORD PTR [rcx-0x8]
   140611010:	66 0f 58 c8          	addpd  xmm1,xmm0
   140611014:	0f 11 49 f8          	movups XMMWORD PTR [rcx-0x8],xmm1
   140611018:	83 7e 04 00          	cmp    DWORD PTR [rsi+0x4],0x0
   14061101c:	74 08                	je     0x140611026
   14061101e:	0f 28 c3             	movaps xmm0,xmm3
   140611021:	0f 28 ca             	movaps xmm1,xmm2
   140611024:	eb 10                	jmp    0x140611036
   140611026:	41 0f 28 c2          	movaps xmm0,xmm10
   14061102a:	41 0f 28 cb          	movaps xmm1,xmm11
   14061102e:	44 0f 28 d3          	movaps xmm10,xmm3
   140611032:	44 0f 28 da          	movaps xmm11,xmm2
   140611036:	f2 44 0f 11 5c c1 f8 	movsd  QWORD PTR [rcx+rax*8-0x8],xmm11
   14061103d:	f2 44 0f 11 14 c1    	movsd  QWORD PTR [rcx+rax*8],xmm10
   140611043:	f2 0f 11 4c d1 f8    	movsd  QWORD PTR [rcx+rdx*8-0x8],xmm1
   140611049:	f2 0f 11 04 d1       	movsd  QWORD PTR [rcx+rdx*8],xmm0
   14061104e:	48 83 c1 10          	add    rcx,0x10
   140611052:	49 83 e9 01          	sub    r9,0x1
   140611056:	0f 85 84 fe ff ff    	jne    0x140610ee0
   14061105c:	4c 8d 9c 24 c0 00 00 	lea    r11,[rsp+0xc0]
   140611063:	00 
   140611064:	49 8b 5b 10          	mov    rbx,QWORD PTR [r11+0x10]
   140611068:	49 8b 6b 18          	mov    rbp,QWORD PTR [r11+0x18]
   14061106c:	49 8b 73 20          	mov    rsi,QWORD PTR [r11+0x20]
   140611070:	49 8b 7b 28          	mov    rdi,QWORD PTR [r11+0x28]
   140611074:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
   140611079:	41 0f 28 7b e0       	movaps xmm7,XMMWORD PTR [r11-0x20]
   14061107e:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   140611083:	45 0f 28 4b c0       	movaps xmm9,XMMWORD PTR [r11-0x40]
   140611088:	45 0f 28 53 b0       	movaps xmm10,XMMWORD PTR [r11-0x50]
   14061108d:	45 0f 28 5b a0       	movaps xmm11,XMMWORD PTR [r11-0x60]
   140611092:	49 8b e3             	mov    rsp,r11
   140611095:	41 5e                	pop    r14
   140611097:	c3                   	ret
   140611098:	cc                   	int3
   140611099:	cc                   	int3
   14061109a:	cc                   	int3
   14061109b:	cc                   	int3
   14061109c:	cc                   	int3
   14061109d:	cc                   	int3
   14061109e:	cc                   	int3
   14061109f:	cc                   	int3
