
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014033ec60 <.text+0x33dc60>:
   14033ec60:	4c 8b dc             	mov    r11,rsp
   14033ec63:	48 81 ec 38 03 00 00 	sub    rsp,0x338
   14033ec6a:	48 8b 05 f7 34 63 00 	mov    rax,QWORD PTR [rip+0x6334f7]        # 0x140972168
   14033ec71:	48 33 c4             	xor    rax,rsp
   14033ec74:	48 89 84 24 50 02 00 	mov    QWORD PTR [rsp+0x250],rax
   14033ec7b:	00 
   14033ec7c:	83 3d 7d ad 5f 00 00 	cmp    DWORD PTR [rip+0x5fad7d],0x0        # 0x140939a00
   14033ec83:	49 63 c0             	movsxd rax,r8d
   14033ec86:	89 84 24 88 00 00 00 	mov    DWORD PTR [rsp+0x88],eax
   14033ec8d:	44 89 8c 24 a0 00 00 	mov    DWORD PTR [rsp+0xa0],r9d
   14033ec94:	00 
   14033ec95:	48 89 8c 24 a8 00 00 	mov    QWORD PTR [rsp+0xa8],rcx
   14033ec9c:	00 
   14033ec9d:	0f 84 2f 0e 00 00    	je     0x14033fad2
   14033eca3:	4c 8b 82 38 06 00 00 	mov    r8,QWORD PTR [rdx+0x638]
   14033ecaa:	4c 89 84 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],r8
   14033ecb1:	00 
   14033ecb2:	41 3b c1             	cmp    eax,r9d
   14033ecb5:	0f 8d 17 0e 00 00    	jge    0x14033fad2
   14033ecbb:	49 89 5b 20          	mov    QWORD PTR [r11+0x20],rbx
   14033ecbf:	45 33 d2             	xor    r10d,r10d
   14033ecc2:	49 89 6b f8          	mov    QWORD PTR [r11-0x8],rbp
   14033ecc6:	49 89 73 f0          	mov    QWORD PTR [r11-0x10],rsi
   14033ecca:	48 8b f0             	mov    rsi,rax
   14033eccd:	49 89 7b e8          	mov    QWORD PTR [r11-0x18],rdi
   14033ecd1:	4d 89 63 e0          	mov    QWORD PTR [r11-0x20],r12
   14033ecd5:	4d 89 6b d8          	mov    QWORD PTR [r11-0x28],r13
   14033ecd9:	4d 89 73 d0          	mov    QWORD PTR [r11-0x30],r14
   14033ecdd:	4d 89 7b c8          	mov    QWORD PTR [r11-0x38],r15
   14033ece1:	44 8b 3d c0 ac 5f 00 	mov    r15d,DWORD PTR [rip+0x5facc0]        # 0x1409399a8
   14033ece8:	41 0f 29 73 b8       	movaps XMMWORD PTR [r11-0x48],xmm6
   14033eced:	41 0f 29 7b a8       	movaps XMMWORD PTR [r11-0x58],xmm7
   14033ecf2:	f2 0f 10 3d 36 f4 34 	movsd  xmm7,QWORD PTR [rip+0x34f436]        # 0x14068e130
   14033ecf9:	00 
   14033ecfa:	45 0f 29 43 98       	movaps XMMWORD PTR [r11-0x68],xmm8
   14033ecff:	45 0f 29 4b 88       	movaps XMMWORD PTR [r11-0x78],xmm9
   14033ed04:	f2 44 0f 10 0d 1b 14 	movsd  xmm9,QWORD PTR [rip+0x51141b]        # 0x140850128
   14033ed0b:	51 00 
   14033ed0d:	45 0f 29 93 78 ff ff 	movaps XMMWORD PTR [r11-0x88],xmm10
   14033ed14:	ff 
   14033ed15:	45 0f 57 d2          	xorps  xmm10,xmm10
   14033ed19:	45 0f 29 9b 68 ff ff 	movaps XMMWORD PTR [r11-0x98],xmm11
   14033ed20:	ff 
   14033ed21:	f2 44 0f 10 1d f6 f3 	movsd  xmm11,QWORD PTR [rip+0x34f3f6]        # 0x14068e120
   14033ed28:	34 00 
   14033ed2a:	45 0f 29 a3 58 ff ff 	movaps XMMWORD PTR [r11-0xa8],xmm12
   14033ed31:	ff 
   14033ed32:	45 0f 29 ab 48 ff ff 	movaps XMMWORD PTR [r11-0xb8],xmm13
   14033ed39:	ff 
   14033ed3a:	45 0f 29 b3 38 ff ff 	movaps XMMWORD PTR [r11-0xc8],xmm14
   14033ed41:	ff 
   14033ed42:	f2 44 0f 10 35 35 f4 	movsd  xmm14,QWORD PTR [rip+0x34f435]        # 0x14068e180
   14033ed49:	34 00 
   14033ed4b:	45 0f 29 bb 28 ff ff 	movaps XMMWORD PTR [r11-0xd8],xmm15
   14033ed52:	ff 
   14033ed53:	f3 44 0f 10 3d 54 f4 	movss  xmm15,DWORD PTR [rip+0x34f454]        # 0x14068e1b0
   14033ed5a:	34 00 
   14033ed5c:	48 89 84 24 90 00 00 	mov    QWORD PTR [rsp+0x90],rax
   14033ed63:	00 
   14033ed64:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033ed68:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033ed6f:	00 
   14033ed70:	49 8b 50 10          	mov    rdx,QWORD PTR [r8+0x10]
   14033ed74:	69 c8 00 15 00 00    	imul   ecx,eax,0x1500
   14033ed7a:	49 8b 00             	mov    rax,QWORD PTR [r8]
   14033ed7d:	48 89 94 24 80 00 00 	mov    QWORD PTR [rsp+0x80],rdx
   14033ed84:	00 
   14033ed85:	44 8b 0c b2          	mov    r9d,DWORD PTR [rdx+rsi*4]
   14033ed89:	4c 8d 34 c8          	lea    r14,[rax+rcx*8]
   14033ed8d:	49 8b 40 08          	mov    rax,QWORD PTR [r8+0x8]
   14033ed91:	4c 89 74 24 60       	mov    QWORD PTR [rsp+0x60],r14
   14033ed96:	4c 8d 2c c8          	lea    r13,[rax+rcx*8]
   14033ed9a:	4c 89 6c 24 70       	mov    QWORD PTR [rsp+0x70],r13
   14033ed9f:	41 83 f9 01          	cmp    r9d,0x1
   14033eda3:	0f 86 69 0c 00 00    	jbe    0x14033fa12
   14033eda9:	45 0f b7 e2          	movzx  r12d,r10w
   14033edad:	66 44 89 54 24 54    	mov    WORD PTR [rsp+0x54],r10w
   14033edb3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033edb7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033edbe:	00 00 
   14033edc0:	4b 8b 0c d6          	mov    rcx,QWORD PTR [r14+r10*8]
   14033edc4:	41 8b d2             	mov    edx,r10d
   14033edc7:	83 ea 01             	sub    edx,0x1
   14033edca:	66 44 89 64 24 52    	mov    WORD PTR [rsp+0x52],r12w
   14033edd0:	41 0f b7 dc          	movzx  ebx,r12w
   14033edd4:	41 0f b7 fc          	movzx  edi,r12w
   14033edd8:	66 89 5c 24 50       	mov    WORD PTR [rsp+0x50],bx
   14033eddd:	44 8b 41 10          	mov    r8d,DWORD PTR [rcx+0x10]
   14033ede1:	78 1a                	js     0x14033edfd
   14033ede3:	48 63 c2             	movsxd rax,edx
   14033ede6:	49 8b 0c c6          	mov    rcx,QWORD PTR [r14+rax*8]
   14033edea:	44 39 41 10          	cmp    DWORD PTR [rcx+0x10],r8d
   14033edee:	75 08                	jne    0x14033edf8
   14033edf0:	0f b7 fa             	movzx  edi,dx
   14033edf3:	83 ea 01             	sub    edx,0x1
   14033edf6:	79 eb                	jns    0x14033ede3
   14033edf8:	66 89 7c 24 52       	mov    WORD PTR [rsp+0x52],di
   14033edfd:	41 8d 52 01          	lea    edx,[r10+0x1]
   14033ee01:	41 3b d1             	cmp    edx,r9d
   14033ee04:	7d 26                	jge    0x14033ee2c
   14033ee06:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033ee0d:	00 00 00 
   14033ee10:	48 63 c2             	movsxd rax,edx
   14033ee13:	49 8b 0c c6          	mov    rcx,QWORD PTR [r14+rax*8]
   14033ee17:	44 39 41 10          	cmp    DWORD PTR [rcx+0x10],r8d
   14033ee1b:	75 0a                	jne    0x14033ee27
   14033ee1d:	0f b7 da             	movzx  ebx,dx
   14033ee20:	ff c2                	inc    edx
   14033ee22:	41 3b d1             	cmp    edx,r9d
   14033ee25:	7c e9                	jl     0x14033ee10
   14033ee27:	66 89 5c 24 50       	mov    WORD PTR [rsp+0x50],bx
   14033ee2c:	33 d2                	xor    edx,edx
   14033ee2e:	48 8d 8c 24 d0 00 00 	lea    rcx,[rsp+0xd0]
   14033ee35:	00 
   14033ee36:	41 b8 c0 00 00 00    	mov    r8d,0xc0
   14033ee3c:	e8 a9 1e 2e 00       	call   0x140620cea
   14033ee41:	0f b7 ef             	movzx  ebp,di
   14033ee44:	66 3b fb             	cmp    di,bx
   14033ee47:	0f 87 25 01 00 00    	ja     0x14033ef72
   14033ee4d:	44 0f b7 64 24 50    	movzx  r12d,WORD PTR [rsp+0x50]
   14033ee53:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033ee57:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033ee5e:	00 00 
   14033ee60:	0f b7 c5             	movzx  eax,bp
   14033ee63:	33 db                	xor    ebx,ebx
   14033ee65:	49 8b 7c c5 00       	mov    rdi,QWORD PTR [r13+rax*8+0x0]
   14033ee6a:	0f b6 77 4b          	movzx  esi,BYTE PTR [rdi+0x4b]
   14033ee6e:	85 f6                	test   esi,esi
   14033ee70:	0f 84 dc 00 00 00    	je     0x14033ef52
   14033ee76:	49 8b 04 c6          	mov    rax,QWORD PTR [r14+rax*8]
   14033ee7a:	44 0f b6 70 25       	movzx  r14d,BYTE PTR [rax+0x25]
   14033ee7f:	f3 42 0f 10 84 b4 cc 	movss  xmm0,DWORD PTR [rsp+r14*4+0xcc]
   14033ee86:	00 00 00 
   14033ee89:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14033ee90:	44 0f 2f d0          	comiss xmm10,xmm0
   14033ee94:	72 06                	jb     0x14033ee9c
   14033ee96:	41 0f 28 f2          	movaps xmm6,xmm10
   14033ee9a:	eb 1d                	jmp    0x14033eeb9
   14033ee9c:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14033eea0:	0f 28 cf             	movaps xmm1,xmm7
   14033eea3:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033eea8:	e8 cd 1e 2e 00       	call   0x140620d7a
   14033eead:	0f 57 f6             	xorps  xmm6,xmm6
   14033eeb0:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033eeb4:	f3 41 0f 59 f7       	mulss  xmm6,xmm15
   14033eeb9:	0f b6 c3             	movzx  eax,bl
   14033eebc:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033eec0:	41 83 ff 01          	cmp    r15d,0x1
   14033eec4:	75 0b                	jne    0x14033eed1
   14033eec6:	f3 0f 10 44 cf 08    	movss  xmm0,DWORD PTR [rdi+rcx*8+0x8]
   14033eecc:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033eecf:	eb 14                	jmp    0x14033eee5
   14033eed1:	f3 0f 10 44 cf 0c    	movss  xmm0,DWORD PTR [rdi+rcx*8+0xc]
   14033eed7:	f3 0f 58 44 cf 08    	addss  xmm0,DWORD PTR [rdi+rcx*8+0x8]
   14033eedd:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033eee0:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14033eee5:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14033eee9:	44 0f 2f d1          	comiss xmm10,xmm1
   14033eeed:	72 06                	jb     0x14033eef5
   14033eeef:	41 0f 28 c2          	movaps xmm0,xmm10
   14033eef3:	eb 19                	jmp    0x14033ef0e
   14033eef5:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14033eef8:	0f 28 cf             	movaps xmm1,xmm7
   14033eefb:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033ef00:	e8 75 1e 2e 00       	call   0x140620d7a
   14033ef05:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033ef09:	f3 41 0f 59 c7       	mulss  xmm0,xmm15
   14033ef0e:	f3 0f 58 c6          	addss  xmm0,xmm6
   14033ef12:	44 0f 2f d0          	comiss xmm10,xmm0
   14033ef16:	72 06                	jb     0x14033ef1e
   14033ef18:	41 0f 28 c2          	movaps xmm0,xmm10
   14033ef1c:	eb 1b                	jmp    0x14033ef39
   14033ef1e:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14033ef22:	41 0f 28 cb          	movaps xmm1,xmm11
   14033ef26:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033ef2b:	e8 4a 1e 2e 00       	call   0x140620d7a
   14033ef30:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033ef34:	f3 41 0f 59 c7       	mulss  xmm0,xmm15
   14033ef39:	ff c3                	inc    ebx
   14033ef3b:	3b de                	cmp    ebx,esi
   14033ef3d:	0f 8c 4d ff ff ff    	jl     0x14033ee90
   14033ef43:	f3 42 0f 11 84 b4 cc 	movss  DWORD PTR [rsp+r14*4+0xcc],xmm0
   14033ef4a:	00 00 00 
   14033ef4d:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   14033ef52:	66 ff c5             	inc    bp
   14033ef55:	66 41 3b ec          	cmp    bp,r12w
   14033ef59:	0f 86 01 ff ff ff    	jbe    0x14033ee60
   14033ef5f:	44 0f b7 64 24 54    	movzx  r12d,WORD PTR [rsp+0x54]
   14033ef65:	48 8b b4 24 90 00 00 	mov    rsi,QWORD PTR [rsp+0x90]
   14033ef6c:	00 
   14033ef6d:	0f b7 7c 24 52       	movzx  edi,WORD PTR [rsp+0x52]
   14033ef72:	41 0f b7 c4          	movzx  eax,r12w
   14033ef76:	bb 30 00 00 00       	mov    ebx,0x30
   14033ef7b:	49 8b 0c c6          	mov    rcx,QWORD PTR [r14+rax*8]
   14033ef7f:	8b c3                	mov    eax,ebx
   14033ef81:	f3 0f 10 71 18       	movss  xmm6,DWORD PTR [rcx+0x18]
   14033ef86:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033ef8d:	00 00 00 
   14033ef90:	f3 0f 10 84 84 cc 00 	movss  xmm0,DWORD PTR [rsp+rax*4+0xcc]
   14033ef97:	00 00 
   14033ef99:	48 ff c8             	dec    rax
   14033ef9c:	8b cb                	mov    ecx,ebx
   14033ef9e:	ff cb                	dec    ebx
   14033efa0:	41 0f 2f c2          	comiss xmm0,xmm10
   14033efa4:	77 07                	ja     0x14033efad
   14033efa6:	48 85 c0             	test   rax,rax
   14033efa9:	75 e5                	jne    0x14033ef90
   14033efab:	eb 02                	jmp    0x14033efaf
   14033efad:	8b d9                	mov    ebx,ecx
   14033efaf:	83 fb 30             	cmp    ebx,0x30
   14033efb2:	7d 24                	jge    0x14033efd8
   14033efb4:	b8 30 00 00 00       	mov    eax,0x30
   14033efb9:	48 8d 8c 24 90 01 00 	lea    rcx,[rsp+0x190]
   14033efc0:	00 
   14033efc1:	2b c3                	sub    eax,ebx
   14033efc3:	33 d2                	xor    edx,edx
   14033efc5:	4c 63 c0             	movsxd r8,eax
   14033efc8:	48 63 c3             	movsxd rax,ebx
   14033efcb:	49 c1 e0 02          	shl    r8,0x2
   14033efcf:	48 8d 0c 81          	lea    rcx,[rcx+rax*4]
   14033efd3:	e8 12 1d 2e 00       	call   0x140620cea
   14033efd8:	85 db                	test   ebx,ebx
   14033efda:	74 32                	je     0x14033f00e
   14033efdc:	48 8b 8c 24 a8 00 00 	mov    rcx,QWORD PTR [rsp+0xa8]
   14033efe3:	00 
   14033efe4:	4c 8d 84 24 90 01 00 	lea    r8,[rsp+0x190]
   14033efeb:	00 
   14033efec:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   14033eff1:	48 8d 94 24 d0 00 00 	lea    rdx,[rsp+0xd0]
   14033eff8:	00 
   14033eff9:	44 8b cb             	mov    r9d,ebx
   14033effc:	f3 0f 11 74 24 20    	movss  DWORD PTR [rsp+0x20],xmm6
   14033f002:	e8 19 ba fd ff       	call   0x14031aa20
   14033f007:	44 8b 3d 9a a9 5f 00 	mov    r15d,DWORD PTR [rip+0x5fa99a]        # 0x1409399a8
   14033f00e:	44 0f b7 64 24 52    	movzx  r12d,WORD PTR [rsp+0x52]
   14033f014:	0f b7 c7             	movzx  eax,di
   14033f017:	0f b7 7c 24 50       	movzx  edi,WORD PTR [rsp+0x50]
   14033f01c:	66 89 44 24 54       	mov    WORD PTR [rsp+0x54],ax
   14033f021:	66 44 3b e7          	cmp    r12w,di
   14033f025:	0f 87 b3 09 00 00    	ja     0x14033f9de
   14033f02b:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   14033f030:	4c 8b b4 24 80 00 00 	mov    r14,QWORD PTR [rsp+0x80]
   14033f037:	00 
   14033f038:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033f03f:	00 
   14033f040:	0f b7 e8             	movzx  ebp,ax
   14033f043:	48 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],rbp
   14033f048:	49 8b 04 ea          	mov    rax,QWORD PTR [r10+rbp*8]
   14033f04c:	0f b6 48 25          	movzx  ecx,BYTE PTR [rax+0x25]
   14033f050:	80 f9 02             	cmp    cl,0x2
   14033f053:	0f 82 62 09 00 00    	jb     0x14033f9bb
   14033f059:	0f b6 d9             	movzx  ebx,cl
   14033f05c:	f3 0f 10 84 9c cc 00 	movss  xmm0,DWORD PTR [rsp+rbx*4+0xcc]
   14033f063:	00 00 
   14033f065:	44 0f 2f d0          	comiss xmm10,xmm0
   14033f069:	72 06                	jb     0x14033f071
   14033f06b:	45 0f 28 ea          	movaps xmm13,xmm10
   14033f06f:	eb 1e                	jmp    0x14033f08f
   14033f071:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f074:	0f 28 cf             	movaps xmm1,xmm7
   14033f077:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f07c:	e8 f9 1c 2e 00       	call   0x140620d7a
   14033f081:	45 0f 57 ed          	xorps  xmm13,xmm13
   14033f085:	f2 44 0f 5a e8       	cvtsd2ss xmm13,xmm0
   14033f08a:	f3 45 0f 59 ef       	mulss  xmm13,xmm15
   14033f08f:	f3 0f 10 84 9c 8c 01 	movss  xmm0,DWORD PTR [rsp+rbx*4+0x18c]
   14033f096:	00 00 
   14033f098:	44 0f 2f d0          	comiss xmm10,xmm0
   14033f09c:	72 06                	jb     0x14033f0a4
   14033f09e:	41 0f 28 c2          	movaps xmm0,xmm10
   14033f0a2:	eb 19                	jmp    0x14033f0bd
   14033f0a4:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f0a7:	0f 28 cf             	movaps xmm1,xmm7
   14033f0aa:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f0af:	e8 c6 1c 2e 00       	call   0x140620d7a
   14033f0b4:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033f0b8:	f3 41 0f 59 c7       	mulss  xmm0,xmm15
   14033f0bd:	f3 44 0f 5c e8       	subss  xmm13,xmm0
   14033f0c2:	f3 45 0f 5f ea       	maxss  xmm13,xmm10
   14033f0c7:	44 0f 2f 2d 61 0f 51 	comiss xmm13,DWORD PTR [rip+0x510f61]        # 0x140850030
   14033f0ce:	00 
   14033f0cf:	0f 82 e1 08 00 00    	jb     0x14033f9b6
   14033f0d5:	0f b7 7c 24 50       	movzx  edi,WORD PTR [rsp+0x50]
   14033f0da:	b8 ff ff ff ff       	mov    eax,0xffffffff
   14033f0df:	41 8b 2c b6          	mov    ebp,DWORD PTR [r14+rsi*4]
   14033f0e3:	66 ff c7             	inc    di
   14033f0e6:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   14033f0eb:	44 0f b7 d8          	movzx  r11d,ax
   14033f0ef:	0f bf df             	movsx  ebx,di
   14033f0f2:	45 0f 28 da          	movaps xmm11,xmm10
   14033f0f6:	66 89 44 24 56       	mov    WORD PTR [rsp+0x56],ax
   14033f0fb:	3b dd                	cmp    ebx,ebp
   14033f0fd:	0f 83 f7 09 00 00    	jae    0x14033fafa
   14033f103:	f3 44 0f 10 35 9c 89 	movss  xmm14,DWORD PTR [rip+0x36899c]        # 0x1406a7aa8
   14033f10a:	36 00 
   14033f10c:	45 0f b7 e4          	movzx  r12d,r12w
   14033f110:	4c 89 a4 24 98 00 00 	mov    QWORD PTR [rsp+0x98],r12
   14033f117:	00 
   14033f118:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033f11f:	00 
   14033f120:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f125:	48 0f bf cf          	movsx  rcx,di
   14033f129:	49 8b 04 ca          	mov    rax,QWORD PTR [r10+rcx*8]
   14033f12d:	f3 0f 10 48 20       	movss  xmm1,DWORD PTR [rax+0x20]
   14033f132:	41 0f 2e ca          	ucomiss xmm1,xmm10
   14033f136:	49 8b 44 cd 00       	mov    rax,QWORD PTR [r13+rcx*8+0x0]
   14033f13b:	f3 0f 10 58 50       	movss  xmm3,DWORD PTR [rax+0x50]
   14033f140:	4b 8b 44 cd 00       	mov    rax,QWORD PTR [r13+r9*8+0x0]
   14033f145:	f3 0f 10 60 10       	movss  xmm4,DWORD PTR [rax+0x10]
   14033f14a:	4b 8b 44 e5 00       	mov    rax,QWORD PTR [r13+r12*8+0x0]
   14033f14f:	f3 44 0f 10 60 50    	movss  xmm12,DWORD PTR [rax+0x50]
   14033f155:	7a 06                	jp     0x14033f15d
   14033f157:	0f 84 b7 00 00 00    	je     0x14033f214
   14033f15d:	0f 28 c4             	movaps xmm0,xmm4
   14033f160:	f3 0f 59 05 a0 7f 35 	mulss  xmm0,DWORD PTR [rip+0x357fa0]        # 0x140697108
   14033f167:	00 
   14033f168:	0f 2f d8             	comiss xmm3,xmm0
   14033f16b:	0f 83 a3 00 00 00    	jae    0x14033f214
   14033f171:	f2 0f 10 15 ff 0f 51 	movsd  xmm2,QWORD PTR [rip+0x510fff]        # 0x140850178
   14033f178:	00 
   14033f179:	0f 5a c9             	cvtps2pd xmm1,xmm1
   14033f17c:	0f 5a fc             	cvtps2pd xmm7,xmm4
   14033f17f:	f2 0f 5c d1          	subsd  xmm2,xmm1
   14033f183:	44 0f 5a cb          	cvtps2pd xmm9,xmm3
   14033f187:	f2 0f 5e d1          	divsd  xmm2,xmm1
   14033f18b:	41 0f 28 c1          	movaps xmm0,xmm9
   14033f18f:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14033f193:	f2 0f 5e f8          	divsd  xmm7,xmm0
   14033f197:	0f 28 c2             	movaps xmm0,xmm2
   14033f19a:	0f 57 3d 1f 16 51 00 	xorps  xmm7,XMMWORD PTR [rip+0x51161f]        # 0x1408507c0
   14033f1a1:	f2 0f 59 c2          	mulsd  xmm0,xmm2
   14033f1a5:	0f 28 cf             	movaps xmm1,xmm7
   14033f1a8:	f2 0f 59 cf          	mulsd  xmm1,xmm7
   14033f1ac:	f2 0f 59 c2          	mulsd  xmm0,xmm2
   14033f1b0:	f2 0f 59 0d 00 0f 51 	mulsd  xmm1,QWORD PTR [rip+0x510f00]        # 0x1408500b8
   14033f1b7:	00 
   14033f1b8:	f2 0f 5e 05 38 88 36 	divsd  xmm0,QWORD PTR [rip+0x368838]        # 0x1406a79f8
   14033f1bf:	00 
   14033f1c0:	f2 0f 58 c1          	addsd  xmm0,xmm1
   14033f1c4:	e8 f3 1b 2e 00       	call   0x140620dbc
   14033f1c9:	f2 0f 59 3d 57 0f 51 	mulsd  xmm7,QWORD PTR [rip+0x510f57]        # 0x140850128
   14033f1d0:	00 
   14033f1d1:	0f 28 f0             	movaps xmm6,xmm0
   14033f1d4:	f2 0f 10 0d 94 87 36 	movsd  xmm1,QWORD PTR [rip+0x368794]        # 0x1406a7970
   14033f1db:	00 
   14033f1dc:	f2 0f 5c c7          	subsd  xmm0,xmm7
   14033f1e0:	e8 95 1b 2e 00       	call   0x140620d7a
   14033f1e5:	f2 0f 10 0d 83 87 36 	movsd  xmm1,QWORD PTR [rip+0x368783]        # 0x1406a7970
   14033f1ec:	00 
   14033f1ed:	f2 0f 58 f7          	addsd  xmm6,xmm7
   14033f1f1:	44 0f 28 c0          	movaps xmm8,xmm0
   14033f1f5:	0f 28 c6             	movaps xmm0,xmm6
   14033f1f8:	e8 7d 1b 2e 00       	call   0x140620d7a
   14033f1fd:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f202:	f2 44 0f 5c c0       	subsd  xmm8,xmm0
   14033f207:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   14033f20c:	44 0f b7 5c 24 56    	movzx  r11d,WORD PTR [rsp+0x56]
   14033f212:	eb 0d                	jmp    0x14033f221
   14033f214:	44 0f 5a cb          	cvtps2pd xmm9,xmm3
   14033f218:	44 0f 5a c4          	cvtps2pd xmm8,xmm4
   14033f21c:	f2 45 0f 5e c1       	divsd  xmm8,xmm9
   14033f221:	41 0f 5a cc          	cvtps2pd xmm1,xmm12
   14033f225:	41 bf 01 00 00 00    	mov    r15d,0x1
   14033f22b:	41 be 30 00 00 00    	mov    r14d,0x30
   14033f231:	0f b7 f7             	movzx  esi,di
   14033f234:	41 0f 28 c0          	movaps xmm0,xmm8
   14033f238:	f2 41 0f 5e c9       	divsd  xmm1,xmm9
   14033f23d:	f2 44 0f 10 0d e2 0e 	movsd  xmm9,QWORD PTR [rip+0x510ee2]        # 0x140850128
   14033f244:	51 00 
   14033f246:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   14033f24b:	f2 0f 5d 0d 55 0f 51 	minsd  xmm1,QWORD PTR [rip+0x510f55]        # 0x1408501a8
   14033f252:	00 
   14033f253:	f2 0f 5c c1          	subsd  xmm0,xmm1
   14033f257:	f2 41 0f 58 c8       	addsd  xmm1,xmm8
   14033f25c:	f2 41 0f 58 c1       	addsd  xmm0,xmm9
   14033f261:	f2 41 0f 58 c9       	addsd  xmm1,xmm9
   14033f266:	f2 0f 2c c0          	cvttsd2si eax,xmm0
   14033f26a:	41 3b c7             	cmp    eax,r15d
   14033f26d:	44 0f 4f f8          	cmovg  r15d,eax
   14033f271:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   14033f275:	41 3b c6             	cmp    eax,r14d
   14033f278:	44 0f 4c f0          	cmovl  r14d,eax
   14033f27c:	48 63 c3             	movsxd rax,ebx
   14033f27f:	83 eb 01             	sub    ebx,0x1
   14033f282:	49 8b 0c c2          	mov    rcx,QWORD PTR [r10+rax*8]
   14033f286:	44 8b 41 10          	mov    r8d,DWORD PTR [rcx+0x10]
   14033f28a:	78 19                	js     0x14033f2a5
   14033f28c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033f290:	48 63 c3             	movsxd rax,ebx
   14033f293:	49 8b 0c c2          	mov    rcx,QWORD PTR [r10+rax*8]
   14033f297:	44 39 41 10          	cmp    DWORD PTR [rcx+0x10],r8d
   14033f29b:	75 08                	jne    0x14033f2a5
   14033f29d:	0f b7 f3             	movzx  esi,bx
   14033f2a0:	83 eb 01             	sub    ebx,0x1
   14033f2a3:	79 eb                	jns    0x14033f290
   14033f2a5:	0f b7 d7             	movzx  edx,di
   14033f2a8:	ff c2                	inc    edx
   14033f2aa:	3b d5                	cmp    edx,ebp
   14033f2ac:	7d 18                	jge    0x14033f2c6
   14033f2ae:	66 90                	xchg   ax,ax
   14033f2b0:	48 63 c2             	movsxd rax,edx
   14033f2b3:	49 8b 0c c2          	mov    rcx,QWORD PTR [r10+rax*8]
   14033f2b7:	44 39 41 10          	cmp    DWORD PTR [rcx+0x10],r8d
   14033f2bb:	75 09                	jne    0x14033f2c6
   14033f2bd:	0f b7 fa             	movzx  edi,dx
   14033f2c0:	ff c2                	inc    edx
   14033f2c2:	3b d5                	cmp    edx,ebp
   14033f2c4:	7c ea                	jl     0x14033f2b0
   14033f2c6:	0f b7 c6             	movzx  eax,si
   14033f2c9:	49 8b 4c c5 00       	mov    rcx,QWORD PTR [r13+rax*8+0x0]
   14033f2ce:	f3 0f 10 41 50       	movss  xmm0,DWORD PTR [rcx+0x50]
   14033f2d3:	f3 41 0f 5e c4       	divss  xmm0,xmm12
   14033f2d8:	0f 2f 05 e1 98 35 00 	comiss xmm0,DWORD PTR [rip+0x3598e1]        # 0x140698bc0
   14033f2df:	0f 82 d6 00 00 00    	jb     0x14033f3bb
   14033f2e5:	0f b7 de             	movzx  ebx,si
   14033f2e8:	66 3b f7             	cmp    si,di
   14033f2eb:	0f 87 ca 00 00 00    	ja     0x14033f3bb
   14033f2f1:	4c 8b 64 24 70       	mov    r12,QWORD PTR [rsp+0x70]
   14033f2f6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033f2fd:	00 00 00 
   14033f300:	0f b7 d3             	movzx  edx,bx
   14033f303:	49 8b 04 d2          	mov    rax,QWORD PTR [r10+rdx*8]
   14033f307:	0f b6 48 25          	movzx  ecx,BYTE PTR [rax+0x25]
   14033f30b:	41 3b cf             	cmp    ecx,r15d
   14033f30e:	0f 8c 89 00 00 00    	jl     0x14033f39d
   14033f314:	41 3b ce             	cmp    ecx,r14d
   14033f317:	0f 8f 91 00 00 00    	jg     0x14033f3ae
   14033f31d:	49 8b 0c d4          	mov    rcx,QWORD PTR [r12+rdx*8]
   14033f321:	4b 8b 14 cc          	mov    rdx,QWORD PTR [r12+r9*8]
   14033f325:	f3 0f 10 42 10       	movss  xmm0,DWORD PTR [rdx+0x10]
   14033f32a:	f3 0f 5c 41 10       	subss  xmm0,DWORD PTR [rcx+0x10]
   14033f32f:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14033f332:	0f 54 0d 77 14 51 00 	andps  xmm1,XMMWORD PTR [rip+0x511477]        # 0x1408507b0
   14033f339:	66 0f 5a f1          	cvtpd2ps xmm6,xmm1
   14033f33d:	66 45 85 db          	test   r11w,r11w
   14033f341:	78 06                	js     0x14033f349
   14033f343:	44 0f 2f de          	comiss xmm11,xmm6
   14033f347:	76 54                	jbe    0x14033f39d
   14033f349:	c6 44 24 48 01       	mov    BYTE PTR [rsp+0x48],0x1
   14033f34e:	4c 8d 4a 08          	lea    r9,[rdx+0x8]
   14033f352:	f3 44 0f 11 74 24 40 	movss  DWORD PTR [rsp+0x40],xmm14
   14033f359:	45 33 c0             	xor    r8d,r8d
   14033f35c:	66 89 7c 24 38       	mov    WORD PTR [rsp+0x38],di
   14033f361:	66 89 74 24 30       	mov    WORD PTR [rsp+0x30],si
   14033f366:	66 89 5c 24 28       	mov    WORD PTR [rsp+0x28],bx
   14033f36b:	4c 89 64 24 20       	mov    QWORD PTR [rsp+0x20],r12
   14033f370:	e8 ab e1 ff ff       	call   0x14033d520
   14033f375:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   14033f37a:	3c ff                	cmp    al,0xff
   14033f37c:	74 19                	je     0x14033f397
   14033f37e:	44 0f b7 db          	movzx  r11d,bx
   14033f382:	66 89 5c 24 56       	mov    WORD PTR [rsp+0x56],bx
   14033f387:	44 0f 28 de          	movaps xmm11,xmm6
   14033f38b:	66 89 74 24 7c       	mov    WORD PTR [rsp+0x7c],si
   14033f390:	66 89 7c 24 78       	mov    WORD PTR [rsp+0x78],di
   14033f395:	eb 06                	jmp    0x14033f39d
   14033f397:	44 0f b7 5c 24 56    	movzx  r11d,WORD PTR [rsp+0x56]
   14033f39d:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f3a2:	66 ff c3             	inc    bx
   14033f3a5:	66 3b df             	cmp    bx,di
   14033f3a8:	0f 86 52 ff ff ff    	jbe    0x14033f300
   14033f3ae:	4c 8b a4 24 98 00 00 	mov    r12,QWORD PTR [rsp+0x98]
   14033f3b5:	00 
   14033f3b6:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14033f3bb:	48 8b b4 24 90 00 00 	mov    rsi,QWORD PTR [rsp+0x90]
   14033f3c2:	00 
   14033f3c3:	66 ff c7             	inc    di
   14033f3c6:	48 8b 84 24 80 00 00 	mov    rax,QWORD PTR [rsp+0x80]
   14033f3cd:	00 
   14033f3ce:	0f bf df             	movsx  ebx,di
   14033f3d1:	8b 2c b0             	mov    ebp,DWORD PTR [rax+rsi*4]
   14033f3d4:	3b dd                	cmp    ebx,ebp
   14033f3d6:	0f 82 44 fd ff ff    	jb     0x14033f120
   14033f3dc:	f2 44 0f 10 35 9b ed 	movsd  xmm14,QWORD PTR [rip+0x34ed9b]        # 0x14068e180
   14033f3e3:	34 00 
   14033f3e5:	66 45 85 db          	test   r11w,r11w
   14033f3e9:	0f 88 7a 05 00 00    	js     0x14033f969
   14033f3ef:	48 8b 74 24 70       	mov    rsi,QWORD PTR [rsp+0x70]
   14033f3f4:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f3f9:	4a 8b 04 ce          	mov    rax,QWORD PTR [rsi+r9*8]
   14033f3fd:	f3 0f 10 40 10       	movss  xmm0,DWORD PTR [rax+0x10]
   14033f402:	48 8b 84 24 a8 00 00 	mov    rax,QWORD PTR [rsp+0xa8]
   14033f409:	00 
   14033f40a:	f3 0f 5e 05 52 86 36 	divss  xmm0,DWORD PTR [rip+0x368652]        # 0x1406a7a64
   14033f411:	00 
   14033f412:	80 b8 91 00 00 00 00 	cmp    BYTE PTR [rax+0x91],0x0
   14033f419:	74 0a                	je     0x14033f425
   14033f41b:	f3 0f 10 0d 69 ed 34 	movss  xmm1,DWORD PTR [rip+0x34ed69]        # 0x14068e18c
   14033f422:	00 
   14033f423:	eb 08                	jmp    0x14033f42d
   14033f425:	f3 0f 10 0d 23 86 36 	movss  xmm1,DWORD PTR [rip+0x368623]        # 0x1406a7a50
   14033f42c:	00 
   14033f42d:	f3 0f 5f c1          	maxss  xmm0,xmm1
   14033f431:	41 0f 2f c3          	comiss xmm0,xmm11
   14033f435:	0f 86 2b 05 00 00    	jbe    0x14033f966
   14033f43b:	f2 44 0f 10 1d dc ec 	movsd  xmm11,QWORD PTR [rip+0x34ecdc]        # 0x14068e120
   14033f442:	34 00 
   14033f444:	33 c0                	xor    eax,eax
   14033f446:	45 0f 2f d5          	comiss xmm10,xmm13
   14033f44a:	66 89 44 24 68       	mov    WORD PTR [rsp+0x68],ax
   14033f44f:	88 44 24 6a          	mov    BYTE PTR [rsp+0x6a],al
   14033f453:	72 06                	jb     0x14033f45b
   14033f455:	41 0f 28 fa          	movaps xmm7,xmm10
   14033f459:	eb 27                	jmp    0x14033f482
   14033f45b:	0f 57 c0             	xorps  xmm0,xmm0
   14033f45e:	41 0f 28 cb          	movaps xmm1,xmm11
   14033f462:	f3 41 0f 5a c5       	cvtss2sd xmm0,xmm13
   14033f467:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f46c:	e8 09 19 2e 00       	call   0x140620d7a
   14033f471:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f476:	0f 57 ff             	xorps  xmm7,xmm7
   14033f479:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   14033f47d:	f3 41 0f 59 ff       	mulss  xmm7,xmm15
   14033f482:	44 8b 3d 1f a5 5f 00 	mov    r15d,DWORD PTR [rip+0x5fa51f]        # 0x1409399a8
   14033f489:	f2 44 0f 10 05 9e ec 	movsd  xmm8,QWORD PTR [rip+0x34ec9e]        # 0x14068e130
   14033f490:	34 00 
   14033f492:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14033f496:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033f49d:	00 00 00 
   14033f4a0:	4a 8b 1c ce          	mov    rbx,QWORD PTR [rsi+r9*8]
   14033f4a4:	33 ff                	xor    edi,edi
   14033f4a6:	b8 ff ff ff ff       	mov    eax,0xffffffff
   14033f4ab:	8b d7                	mov    edx,edi
   14033f4ad:	44 8b c0             	mov    r8d,eax
   14033f4b0:	44 8b e8             	mov    r13d,eax
   14033f4b3:	44 0f b6 53 4b       	movzx  r10d,BYTE PTR [rbx+0x4b]
   14033f4b8:	45 85 d2             	test   r10d,r10d
   14033f4bb:	0f 84 03 01 00 00    	je     0x14033f5c4
   14033f4c1:	4c 8d 4c 24 68       	lea    r9,[rsp+0x68]
   14033f4c6:	41 38 39             	cmp    BYTE PTR [r9],dil
   14033f4c9:	0f 85 e2 00 00 00    	jne    0x14033f5b1
   14033f4cf:	0f b6 c2             	movzx  eax,dl
   14033f4d2:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033f4d6:	f3 0f 10 4c cb 08    	movss  xmm1,DWORD PTR [rbx+rcx*8+0x8]
   14033f4dc:	41 83 ff 01          	cmp    r15d,0x1
   14033f4e0:	75 05                	jne    0x14033f4e7
   14033f4e2:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14033f4e5:	eb 11                	jmp    0x14033f4f8
   14033f4e7:	0f 28 c1             	movaps xmm0,xmm1
   14033f4ea:	f3 0f 58 44 cb 0c    	addss  xmm0,DWORD PTR [rbx+rcx*8+0xc]
   14033f4f0:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f4f3:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14033f4f8:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033f4fc:	0f 2f c7             	comiss xmm0,xmm7
   14033f4ff:	72 59                	jb     0x14033f55a
   14033f501:	45 85 c0             	test   r8d,r8d
   14033f504:	78 4f                	js     0x14033f555
   14033f506:	41 83 ff 01          	cmp    r15d,0x1
   14033f50a:	75 05                	jne    0x14033f511
   14033f50c:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14033f50f:	eb 0e                	jmp    0x14033f51f
   14033f511:	f3 0f 58 4c cb 0c    	addss  xmm1,DWORD PTR [rbx+rcx*8+0xc]
   14033f517:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14033f51a:	f2 41 0f 59 d1       	mulsd  xmm2,xmm9
   14033f51f:	41 0f b6 c0          	movzx  eax,r8b
   14033f523:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033f527:	75 0b                	jne    0x14033f534
   14033f529:	f3 0f 10 44 cb 08    	movss  xmm0,DWORD PTR [rbx+rcx*8+0x8]
   14033f52f:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f532:	eb 14                	jmp    0x14033f548
   14033f534:	f3 0f 10 44 cb 0c    	movss  xmm0,DWORD PTR [rbx+rcx*8+0xc]
   14033f53a:	f3 0f 58 44 cb 08    	addss  xmm0,DWORD PTR [rbx+rcx*8+0x8]
   14033f540:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f543:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14033f548:	66 0f 5a ca          	cvtpd2ps xmm1,xmm2
   14033f54c:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033f550:	0f 2f c1             	comiss xmm0,xmm1
   14033f553:	76 5c                	jbe    0x14033f5b1
   14033f555:	44 8b c2             	mov    r8d,edx
   14033f558:	eb 57                	jmp    0x14033f5b1
   14033f55a:	45 85 ed             	test   r13d,r13d
   14033f55d:	78 4f                	js     0x14033f5ae
   14033f55f:	41 83 ff 01          	cmp    r15d,0x1
   14033f563:	75 05                	jne    0x14033f56a
   14033f565:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14033f568:	eb 0e                	jmp    0x14033f578
   14033f56a:	f3 0f 58 4c cb 0c    	addss  xmm1,DWORD PTR [rbx+rcx*8+0xc]
   14033f570:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14033f573:	f2 41 0f 59 d1       	mulsd  xmm2,xmm9
   14033f578:	41 0f b6 c5          	movzx  eax,r13b
   14033f57c:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033f580:	75 0b                	jne    0x14033f58d
   14033f582:	f3 0f 10 44 cb 08    	movss  xmm0,DWORD PTR [rbx+rcx*8+0x8]
   14033f588:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f58b:	eb 14                	jmp    0x14033f5a1
   14033f58d:	f3 0f 10 44 cb 0c    	movss  xmm0,DWORD PTR [rbx+rcx*8+0xc]
   14033f593:	f3 0f 58 44 cb 08    	addss  xmm0,DWORD PTR [rbx+rcx*8+0x8]
   14033f599:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f59c:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14033f5a1:	66 0f 5a ca          	cvtpd2ps xmm1,xmm2
   14033f5a5:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033f5a9:	0f 2f c8             	comiss xmm1,xmm0
   14033f5ac:	76 03                	jbe    0x14033f5b1
   14033f5ae:	44 8b ea             	mov    r13d,edx
   14033f5b1:	ff c2                	inc    edx
   14033f5b3:	49 ff c1             	inc    r9
   14033f5b6:	41 3b d2             	cmp    edx,r10d
   14033f5b9:	0f 8c 07 ff ff ff    	jl     0x14033f4c6
   14033f5bf:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f5c4:	45 85 c0             	test   r8d,r8d
   14033f5c7:	45 0f 49 e8          	cmovns r13d,r8d
   14033f5cb:	44 89 ac 24 98 00 00 	mov    DWORD PTR [rsp+0x98],r13d
   14033f5d2:	00 
   14033f5d3:	45 85 ed             	test   r13d,r13d
   14033f5d6:	0f 88 ba 03 00 00    	js     0x14033f996
   14033f5dc:	4d 63 f5             	movsxd r14,r13d
   14033f5df:	45 8d 67 ff          	lea    r12d,[r15-0x1]
   14033f5e3:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14033f5e8:	8b ef                	mov    ebp,edi
   14033f5ea:	42 c6 44 34 68 01    	mov    BYTE PTR [rsp+r14*1+0x68],0x1
   14033f5f0:	b8 01 00 00 00       	mov    eax,0x1
   14033f5f5:	44 3b e0             	cmp    r12d,eax
   14033f5f8:	41 0f 47 c4          	cmova  eax,r12d
   14033f5fc:	3b e8                	cmp    ebp,eax
   14033f5fe:	0f 83 1a 01 00 00    	jae    0x14033f71e
   14033f604:	4b 8b 7c cd 00       	mov    rdi,QWORD PTR [r13+r9*8+0x0]
   14033f609:	8b f5                	mov    esi,ebp
   14033f60b:	41 83 ff 01          	cmp    r15d,0x1
   14033f60f:	75 06                	jne    0x14033f617
   14033f611:	41 0f 28 f5          	movaps xmm6,xmm13
   14033f615:	eb 67                	jmp    0x14033f67e
   14033f617:	0f 57 c0             	xorps  xmm0,xmm0
   14033f61a:	4b 8d 14 76          	lea    rdx,[r14+r14*2]
   14033f61e:	f3 0f 5a c7          	cvtss2sd xmm0,xmm7
   14033f622:	4b 8d 04 76          	lea    rax,[r14+r14*2]
   14033f626:	48 8d 0c 46          	lea    rcx,[rsi+rax*2]
   14033f62a:	f3 0f 10 54 8f 08    	movss  xmm2,DWORD PTR [rdi+rcx*4+0x8]
   14033f630:	f2 0f 58 c0          	addsd  xmm0,xmm0
   14033f634:	0f 5a d2             	cvtps2pd xmm2,xmm2
   14033f637:	f2 0f 59 d0          	mulsd  xmm2,xmm0
   14033f63b:	f3 0f 10 44 d7 0c    	movss  xmm0,DWORD PTR [rdi+rdx*8+0xc]
   14033f641:	f3 0f 58 44 d7 08    	addss  xmm0,DWORD PTR [rdi+rdx*8+0x8]
   14033f647:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14033f64a:	f2 0f 5e d1          	divsd  xmm2,xmm1
   14033f64e:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   14033f652:	44 0f 2f d0          	comiss xmm10,xmm0
   14033f656:	72 06                	jb     0x14033f65e
   14033f658:	41 0f 28 f2          	movaps xmm6,xmm10
   14033f65c:	eb 1d                	jmp    0x14033f67b
   14033f65e:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f661:	41 0f 28 c8          	movaps xmm1,xmm8
   14033f665:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f66a:	e8 0b 17 2e 00       	call   0x140620d7a
   14033f66f:	0f 57 f6             	xorps  xmm6,xmm6
   14033f672:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033f676:	f3 41 0f 59 f7       	mulss  xmm6,xmm15
   14033f67b:	48 8b df             	mov    rbx,rdi
   14033f67e:	4b 8d 04 76          	lea    rax,[r14+r14*2]
   14033f682:	48 8d 0c 46          	lea    rcx,[rsi+rax*2]
   14033f686:	f3 0f 10 44 8f 08    	movss  xmm0,DWORD PTR [rdi+rcx*4+0x8]
   14033f68c:	44 0f 2f d0          	comiss xmm10,xmm0
   14033f690:	72 06                	jb     0x14033f698
   14033f692:	41 0f 28 c2          	movaps xmm0,xmm10
   14033f696:	eb 1a                	jmp    0x14033f6b2
   14033f698:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f69b:	41 0f 28 c8          	movaps xmm1,xmm8
   14033f69f:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f6a4:	e8 d1 16 2e 00       	call   0x140620d7a
   14033f6a9:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033f6ad:	f3 41 0f 59 c7       	mulss  xmm0,xmm15
   14033f6b2:	0f 2f f0             	comiss xmm6,xmm0
   14033f6b5:	f3 0f 11 84 b4 c0 00 	movss  DWORD PTR [rsp+rsi*4+0xc0],xmm0
   14033f6bc:	00 00 
   14033f6be:	77 03                	ja     0x14033f6c3
   14033f6c0:	0f 28 c6             	movaps xmm0,xmm6
   14033f6c3:	44 0f 2f d0          	comiss xmm10,xmm0
   14033f6c7:	f3 0f 11 84 b4 b8 00 	movss  DWORD PTR [rsp+rsi*4+0xb8],xmm0
   14033f6ce:	00 00 
   14033f6d0:	72 19                	jb     0x14033f6eb
   14033f6d2:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f6d7:	41 0f 28 ca          	movaps xmm1,xmm10
   14033f6db:	f3 0f 11 8c b4 b0 00 	movss  DWORD PTR [rsp+rsi*4+0xb0],xmm1
   14033f6e2:	00 00 
   14033f6e4:	ff c5                	inc    ebp
   14033f6e6:	e9 05 ff ff ff       	jmp    0x14033f5f0
   14033f6eb:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14033f6ef:	41 0f 28 cb          	movaps xmm1,xmm11
   14033f6f3:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f6f8:	e8 7d 16 2e 00       	call   0x140620d7a
   14033f6fd:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f702:	0f 57 c9             	xorps  xmm1,xmm1
   14033f705:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   14033f709:	ff c5                	inc    ebp
   14033f70b:	f3 41 0f 59 cf       	mulss  xmm1,xmm15
   14033f710:	f3 0f 11 8c b4 b0 00 	movss  DWORD PTR [rsp+rsi*4+0xb0],xmm1
   14033f717:	00 00 
   14033f719:	e9 d2 fe ff ff       	jmp    0x14033f5f0
   14033f71e:	0f b7 54 24 78       	movzx  edx,WORD PTR [rsp+0x78]
   14033f723:	4c 8d 8c 24 b0 00 00 	lea    r9,[rsp+0xb0]
   14033f72a:	00 
   14033f72b:	48 0f bf 44 24 56    	movsx  rax,WORD PTR [rsp+0x56]
   14033f731:	f3 0f 10 35 6f 83 36 	movss  xmm6,DWORD PTR [rip+0x36836f]        # 0x1406a7aa8
   14033f738:	00 
   14033f739:	48 8b 74 24 70       	mov    rsi,QWORD PTR [rsp+0x70]
   14033f73e:	c6 44 24 48 00       	mov    BYTE PTR [rsp+0x48],0x0
   14033f743:	f3 0f 11 74 24 40    	movss  DWORD PTR [rsp+0x40],xmm6
   14033f749:	66 89 54 24 38       	mov    WORD PTR [rsp+0x38],dx
   14033f74e:	0f b7 54 24 7c       	movzx  edx,WORD PTR [rsp+0x7c]
   14033f753:	48 8b 0c c6          	mov    rcx,QWORD PTR [rsi+rax*8]
   14033f757:	66 89 54 24 30       	mov    WORD PTR [rsp+0x30],dx
   14033f75c:	48 8b d3             	mov    rdx,rbx
   14033f75f:	66 89 44 24 28       	mov    WORD PTR [rsp+0x28],ax
   14033f764:	4c 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],r13
   14033f769:	44 8b ac 24 98 00 00 	mov    r13d,DWORD PTR [rsp+0x98]
   14033f770:	00 
   14033f771:	45 0f b6 c5          	movzx  r8d,r13b
   14033f775:	e8 a6 dd ff ff       	call   0x14033d520
   14033f77a:	44 8b 3d 27 a2 5f 00 	mov    r15d,DWORD PTR [rip+0x5fa227]        # 0x1409399a8
   14033f781:	3c ff                	cmp    al,0xff
   14033f783:	75 0a                	jne    0x14033f78f
   14033f785:	4c 8b 4c 24 58       	mov    r9,QWORD PTR [rsp+0x58]
   14033f78a:	e9 11 fd ff ff       	jmp    0x14033f4a0
   14033f78f:	48 8b 6c 24 58       	mov    rbp,QWORD PTR [rsp+0x58]
   14033f794:	33 ff                	xor    edi,edi
   14033f796:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033f79d:	00 00 00 
   14033f7a0:	41 8d 47 ff          	lea    eax,[r15-0x1]
   14033f7a4:	b9 01 00 00 00       	mov    ecx,0x1
   14033f7a9:	3b c1                	cmp    eax,ecx
   14033f7ab:	0f 47 c8             	cmova  ecx,eax
   14033f7ae:	3b f9                	cmp    edi,ecx
   14033f7b0:	0f 83 be 00 00 00    	jae    0x14033f874
   14033f7b6:	f3 0f 10 b4 bc b8 00 	movss  xmm6,DWORD PTR [rsp+rdi*4+0xb8]
   14033f7bd:	00 00 
   14033f7bf:	f3 0f 10 84 bc c0 00 	movss  xmm0,DWORD PTR [rsp+rdi*4+0xc0]
   14033f7c6:	00 00 
   14033f7c8:	f3 0f 5c c6          	subss  xmm0,xmm6
   14033f7cc:	8b df                	mov    ebx,edi
   14033f7ce:	44 0f 2f d0          	comiss xmm10,xmm0
   14033f7d2:	72 06                	jb     0x14033f7da
   14033f7d4:	41 0f 28 c2          	movaps xmm0,xmm10
   14033f7d8:	eb 1a                	jmp    0x14033f7f4
   14033f7da:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f7dd:	41 0f 28 cb          	movaps xmm1,xmm11
   14033f7e1:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f7e6:	e8 8f 15 2e 00       	call   0x140620d7a
   14033f7eb:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14033f7ef:	f3 41 0f 59 c7       	mulss  xmm0,xmm15
   14033f7f4:	4b 8d 04 76          	lea    rax,[r14+r14*2]
   14033f7f8:	48 8d 0c 47          	lea    rcx,[rdi+rax*2]
   14033f7fc:	48 8b 04 ee          	mov    rax,QWORD PTR [rsi+rbp*8]
   14033f800:	f3 41 0f 5f c2       	maxss  xmm0,xmm10
   14033f805:	f3 0f 11 44 88 08    	movss  DWORD PTR [rax+rcx*4+0x8],xmm0
   14033f80b:	44 8b 3d 96 a1 5f 00 	mov    r15d,DWORD PTR [rip+0x5fa196]        # 0x1409399a8
   14033f812:	41 83 ff 01          	cmp    r15d,0x1
   14033f816:	75 0c                	jne    0x14033f824
   14033f818:	f3 44 0f 5c ee       	subss  xmm13,xmm6
   14033f81d:	ff c7                	inc    edi
   14033f81f:	e9 7c ff ff ff       	jmp    0x14033f7a0
   14033f824:	f3 0f 10 84 bc b0 00 	movss  xmm0,DWORD PTR [rsp+rdi*4+0xb0]
   14033f82b:	00 00 
   14033f82d:	f3 0f 59 05 a7 07 51 	mulss  xmm0,DWORD PTR [rip+0x5107a7]        # 0x14084ffdc
   14033f834:	00 
   14033f835:	44 0f 2f d0          	comiss xmm10,xmm0
   14033f839:	72 10                	jb     0x14033f84b
   14033f83b:	41 0f 28 ca          	movaps xmm1,xmm10
   14033f83f:	ff c7                	inc    edi
   14033f841:	f3 44 0f 5c e9       	subss  xmm13,xmm1
   14033f846:	e9 55 ff ff ff       	jmp    0x14033f7a0
   14033f84b:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f84e:	41 0f 28 c8          	movaps xmm1,xmm8
   14033f852:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f857:	e8 1e 15 2e 00       	call   0x140620d7a
   14033f85c:	0f 57 c9             	xorps  xmm1,xmm1
   14033f85f:	ff c7                	inc    edi
   14033f861:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   14033f865:	f3 41 0f 59 cf       	mulss  xmm1,xmm15
   14033f86a:	f3 44 0f 5c e9       	subss  xmm13,xmm1
   14033f86f:	e9 2c ff ff ff       	jmp    0x14033f7a0
   14033f874:	4c 8b 04 ee          	mov    r8,QWORD PTR [rsi+rbp*8]
   14033f878:	4c 8b cd             	mov    r9,rbp
   14033f87b:	41 0f b6 40 4b       	movzx  eax,BYTE PTR [r8+0x4b]
   14033f880:	8d 50 ff             	lea    edx,[rax-0x1]
   14033f883:	44 3b ea             	cmp    r13d,edx
   14033f886:	0f 85 8f 00 00 00    	jne    0x14033f91b
   14033f88c:	41 0f b6 c5          	movzx  eax,r13b
   14033f890:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033f894:	41 83 ff 01          	cmp    r15d,0x1
   14033f898:	75 0c                	jne    0x14033f8a6
   14033f89a:	f3 41 0f 10 44 c8 08 	movss  xmm0,DWORD PTR [r8+rcx*8+0x8]
   14033f8a1:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f8a4:	eb 16                	jmp    0x14033f8bc
   14033f8a6:	f3 41 0f 10 44 c8 0c 	movss  xmm0,DWORD PTR [r8+rcx*8+0xc]
   14033f8ad:	f3 41 0f 58 44 c8 08 	addss  xmm0,DWORD PTR [r8+rcx*8+0x8]
   14033f8b4:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033f8b7:	f2 41 0f 59 c1       	mulsd  xmm0,xmm9
   14033f8bc:	f3 0f 10 0d e4 81 36 	movss  xmm1,DWORD PTR [rip+0x3681e4]        # 0x1406a7aa8
   14033f8c3:	00 
   14033f8c4:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14033f8c8:	0f 2f c8             	comiss xmm1,xmm0
   14033f8cb:	76 4e                	jbe    0x14033f91b
   14033f8cd:	41 0f b6 c5          	movzx  eax,r13b
   14033f8d1:	3b c2                	cmp    eax,edx
   14033f8d3:	7d 3b                	jge    0x14033f910
   14033f8d5:	41 0f b6 c5          	movzx  eax,r13b
   14033f8d9:	41 fe c5             	inc    r13b
   14033f8dc:	48 8d 0c 40          	lea    rcx,[rax+rax*2]
   14033f8e0:	41 0f 10 44 c8 18    	movups xmm0,XMMWORD PTR [r8+rcx*8+0x18]
   14033f8e6:	48 8d 14 40          	lea    rdx,[rax+rax*2]
   14033f8ea:	41 0f b6 c5          	movzx  eax,r13b
   14033f8ee:	41 0f 11 04 d0       	movups XMMWORD PTR [r8+rdx*8],xmm0
   14033f8f3:	f2 41 0f 10 4c c8 28 	movsd  xmm1,QWORD PTR [r8+rcx*8+0x28]
   14033f8fa:	f2 41 0f 11 4c d0 10 	movsd  QWORD PTR [r8+rdx*8+0x10],xmm1
   14033f901:	4e 8b 04 ce          	mov    r8,QWORD PTR [rsi+r9*8]
   14033f905:	41 0f b6 48 4b       	movzx  ecx,BYTE PTR [r8+0x4b]
   14033f90a:	ff c9                	dec    ecx
   14033f90c:	3b c1                	cmp    eax,ecx
   14033f90e:	7c c5                	jl     0x14033f8d5
   14033f910:	41 fe 48 4b          	dec    BYTE PTR [r8+0x4b]
   14033f914:	44 8b 3d 8d a0 5f 00 	mov    r15d,DWORD PTR [rip+0x5fa08d]        # 0x1409399a8
   14033f91b:	f3 0f 10 05 0d 07 51 	movss  xmm0,DWORD PTR [rip+0x51070d]        # 0x140850030
   14033f922:	00 
   14033f923:	41 0f 2f c5          	comiss xmm0,xmm13
   14033f927:	0f 87 bd 01 00 00    	ja     0x14033faea
   14033f92d:	45 0f 2f d5          	comiss xmm10,xmm13
   14033f931:	72 09                	jb     0x14033f93c
   14033f933:	41 0f 28 fa          	movaps xmm7,xmm10
   14033f937:	e9 64 fb ff ff       	jmp    0x14033f4a0
   14033f93c:	0f 57 c0             	xorps  xmm0,xmm0
   14033f93f:	41 0f 28 cb          	movaps xmm1,xmm11
   14033f943:	f3 41 0f 5a c5       	cvtss2sd xmm0,xmm13
   14033f948:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14033f94d:	e8 28 14 2e 00       	call   0x140620d7a
   14033f952:	0f 57 ff             	xorps  xmm7,xmm7
   14033f955:	4c 8b cd             	mov    r9,rbp
   14033f958:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   14033f95c:	f3 41 0f 59 ff       	mulss  xmm7,xmm15
   14033f961:	e9 3a fb ff ff       	jmp    0x14033f4a0
   14033f966:	4c 8b ee             	mov    r13,rsi
   14033f969:	44 8b 3d 38 a0 5f 00 	mov    r15d,DWORD PTR [rip+0x5fa038]        # 0x1409399a8
   14033f970:	f2 0f 10 3d b8 e7 34 	movsd  xmm7,QWORD PTR [rip+0x34e7b8]        # 0x14068e130
   14033f977:	00 
   14033f978:	f2 44 0f 10 1d 9f e7 	movsd  xmm11,QWORD PTR [rip+0x34e79f]        # 0x14068e120
   14033f97f:	34 00 
   14033f981:	0f b7 7c 24 50       	movzx  edi,WORD PTR [rsp+0x50]
   14033f986:	4c 8b b4 24 80 00 00 	mov    r14,QWORD PTR [rsp+0x80]
   14033f98d:	00 
   14033f98e:	44 0f b7 64 24 52    	movzx  r12d,WORD PTR [rsp+0x52]
   14033f994:	eb 25                	jmp    0x14033f9bb
   14033f996:	f2 0f 10 3d 92 e7 34 	movsd  xmm7,QWORD PTR [rip+0x34e792]        # 0x14068e130
   14033f99d:	00 
   14033f99e:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14033f9a3:	0f b7 7c 24 50       	movzx  edi,WORD PTR [rsp+0x50]
   14033f9a8:	4c 8b b4 24 80 00 00 	mov    r14,QWORD PTR [rsp+0x80]
   14033f9af:	00 
   14033f9b0:	44 0f b7 64 24 52    	movzx  r12d,WORD PTR [rsp+0x52]
   14033f9b6:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   14033f9bb:	0f b7 44 24 54       	movzx  eax,WORD PTR [rsp+0x54]
   14033f9c0:	48 8b b4 24 90 00 00 	mov    rsi,QWORD PTR [rsp+0x90]
   14033f9c7:	00 
   14033f9c8:	66 ff c0             	inc    ax
   14033f9cb:	66 89 44 24 54       	mov    WORD PTR [rsp+0x54],ax
   14033f9d0:	66 3b c7             	cmp    ax,di
   14033f9d3:	0f 86 67 f6 ff ff    	jbe    0x14033f040
   14033f9d9:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   14033f9de:	44 0f b7 64 24 50    	movzx  r12d,WORD PTR [rsp+0x50]
   14033f9e4:	48 8b 84 24 80 00 00 	mov    rax,QWORD PTR [rsp+0x80]
   14033f9eb:	00 
   14033f9ec:	66 41 ff c4          	inc    r12w
   14033f9f0:	45 0f b7 d4          	movzx  r10d,r12w
   14033f9f4:	66 44 89 64 24 54    	mov    WORD PTR [rsp+0x54],r12w
   14033f9fa:	44 8b 0c b0          	mov    r9d,DWORD PTR [rax+rsi*4]
   14033f9fe:	45 3b d1             	cmp    r10d,r9d
   14033fa01:	0f 82 b9 f3 ff ff    	jb     0x14033edc0
   14033fa07:	4c 8b 84 24 c8 00 00 	mov    r8,QWORD PTR [rsp+0xc8]
   14033fa0e:	00 
   14033fa0f:	45 33 d2             	xor    r10d,r10d
   14033fa12:	8b 84 24 88 00 00 00 	mov    eax,DWORD PTR [rsp+0x88]
   14033fa19:	48 ff c6             	inc    rsi
   14033fa1c:	ff c0                	inc    eax
   14033fa1e:	48 89 b4 24 90 00 00 	mov    QWORD PTR [rsp+0x90],rsi
   14033fa25:	00 
   14033fa26:	89 84 24 88 00 00 00 	mov    DWORD PTR [rsp+0x88],eax
   14033fa2d:	3b 84 24 a0 00 00 00 	cmp    eax,DWORD PTR [rsp+0xa0]
   14033fa34:	0f 8c 36 f3 ff ff    	jl     0x14033ed70
   14033fa3a:	44 0f 28 bc 24 60 02 	movaps xmm15,XMMWORD PTR [rsp+0x260]
   14033fa41:	00 00 
   14033fa43:	44 0f 28 b4 24 70 02 	movaps xmm14,XMMWORD PTR [rsp+0x270]
   14033fa4a:	00 00 
   14033fa4c:	44 0f 28 ac 24 80 02 	movaps xmm13,XMMWORD PTR [rsp+0x280]
   14033fa53:	00 00 
   14033fa55:	44 0f 28 a4 24 90 02 	movaps xmm12,XMMWORD PTR [rsp+0x290]
   14033fa5c:	00 00 
   14033fa5e:	44 0f 28 9c 24 a0 02 	movaps xmm11,XMMWORD PTR [rsp+0x2a0]
   14033fa65:	00 00 
   14033fa67:	44 0f 28 94 24 b0 02 	movaps xmm10,XMMWORD PTR [rsp+0x2b0]
   14033fa6e:	00 00 
   14033fa70:	44 0f 28 8c 24 c0 02 	movaps xmm9,XMMWORD PTR [rsp+0x2c0]
   14033fa77:	00 00 
   14033fa79:	44 0f 28 84 24 d0 02 	movaps xmm8,XMMWORD PTR [rsp+0x2d0]
   14033fa80:	00 00 
   14033fa82:	0f 28 bc 24 e0 02 00 	movaps xmm7,XMMWORD PTR [rsp+0x2e0]
   14033fa89:	00 
   14033fa8a:	0f 28 b4 24 f0 02 00 	movaps xmm6,XMMWORD PTR [rsp+0x2f0]
   14033fa91:	00 
   14033fa92:	4c 8b bc 24 00 03 00 	mov    r15,QWORD PTR [rsp+0x300]
   14033fa99:	00 
   14033fa9a:	4c 8b b4 24 08 03 00 	mov    r14,QWORD PTR [rsp+0x308]
   14033faa1:	00 
   14033faa2:	4c 8b ac 24 10 03 00 	mov    r13,QWORD PTR [rsp+0x310]
   14033faa9:	00 
   14033faaa:	4c 8b a4 24 18 03 00 	mov    r12,QWORD PTR [rsp+0x318]
   14033fab1:	00 
   14033fab2:	48 8b bc 24 20 03 00 	mov    rdi,QWORD PTR [rsp+0x320]
   14033fab9:	00 
   14033faba:	48 8b b4 24 28 03 00 	mov    rsi,QWORD PTR [rsp+0x328]
   14033fac1:	00 
   14033fac2:	48 8b ac 24 30 03 00 	mov    rbp,QWORD PTR [rsp+0x330]
   14033fac9:	00 
   14033faca:	48 8b 9c 24 58 03 00 	mov    rbx,QWORD PTR [rsp+0x358]
   14033fad1:	00 
   14033fad2:	48 8b 8c 24 50 02 00 	mov    rcx,QWORD PTR [rsp+0x250]
   14033fad9:	00 
   14033fada:	48 33 cc             	xor    rcx,rsp
   14033fadd:	e8 1e bb 2d 00       	call   0x14061b600
   14033fae2:	48 81 c4 38 03 00 00 	add    rsp,0x338
   14033fae9:	c3                   	ret
   14033faea:	f2 0f 10 3d 3e e6 34 	movsd  xmm7,QWORD PTR [rip+0x34e63e]        # 0x14068e130
   14033faf1:	00 
   14033faf2:	4c 8b ee             	mov    r13,rsi
   14033faf5:	e9 a9 fe ff ff       	jmp    0x14033f9a3
   14033fafa:	f2 44 0f 10 1d 1d e6 	movsd  xmm11,QWORD PTR [rip+0x34e61d]        # 0x14068e120
   14033fb01:	34 00 
   14033fb03:	0f b7 7c 24 50       	movzx  edi,WORD PTR [rsp+0x50]
   14033fb08:	e9 ae fe ff ff       	jmp    0x14033f9bb
   14033fb0d:	cc                   	int3
   14033fb0e:	cc                   	int3
   14033fb0f:	cc                   	int3
   14033fb10:	cc                   	int3
   14033fb11:	cc                   	int3
   14033fb12:	cc                   	int3
   14033fb13:	cc                   	int3
   14033fb14:	cc                   	int3
   14033fb15:	cc                   	int3
   14033fb16:	cc                   	int3
   14033fb17:	cc                   	int3
   14033fb18:	cc                   	int3
   14033fb19:	cc                   	int3
   14033fb1a:	cc                   	int3
   14033fb1b:	cc                   	int3
   14033fb1c:	cc                   	int3
   14033fb1d:	cc                   	int3
   14033fb1e:	cc                   	int3
   14033fb1f:	cc                   	int3
