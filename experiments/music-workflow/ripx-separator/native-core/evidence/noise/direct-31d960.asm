
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031d960 <.text+0x31c960>:
   14031d960:	48 89 5c 24 18       	mov    QWORD PTR [rsp+0x18],rbx
   14031d965:	55                   	push   rbp
   14031d966:	56                   	push   rsi
   14031d967:	57                   	push   rdi
   14031d968:	41 54                	push   r12
   14031d96a:	41 55                	push   r13
   14031d96c:	41 56                	push   r14
   14031d96e:	41 57                	push   r15
   14031d970:	48 81 ec e0 01 00 00 	sub    rsp,0x1e0
   14031d977:	48 8b 05 ea 47 65 00 	mov    rax,QWORD PTR [rip+0x6547ea]        # 0x140972168
   14031d97e:	48 33 c4             	xor    rax,rsp
   14031d981:	48 89 84 24 90 01 00 	mov    QWORD PTR [rsp+0x190],rax
   14031d988:	00 
   14031d989:	44 8b 81 bc 00 00 00 	mov    r8d,DWORD PTR [rcx+0xbc]
   14031d990:	4c 8b e2             	mov    r12,rdx
   14031d993:	4c 8b ba b0 05 00 00 	mov    r15,QWORD PTR [rdx+0x5b0]
   14031d99a:	48 8b f1             	mov    rsi,rcx
   14031d99d:	44 8b 72 10          	mov    r14d,DWORD PTR [rdx+0x10]
   14031d9a1:	44 03 41 24          	add    r8d,DWORD PTR [rcx+0x24]
   14031d9a5:	48 8b aa 98 05 00 00 	mov    rbp,QWORD PTR [rdx+0x598]
   14031d9ac:	4d 03 c0             	add    r8,r8
   14031d9af:	4c 8b aa a0 05 00 00 	mov    r13,QWORD PTR [rdx+0x5a0]
   14031d9b6:	48 8b 82 a8 05 00 00 	mov    rax,QWORD PTR [rdx+0x5a8]
   14031d9bd:	48 8b ba 40 05 00 00 	mov    rdi,QWORD PTR [rdx+0x540]
   14031d9c4:	44 2b 72 0c          	sub    r14d,DWORD PTR [rdx+0xc]
   14031d9c8:	48 89 54 24 50       	mov    QWORD PTR [rsp+0x50],rdx
   14031d9cd:	33 d2                	xor    edx,edx
   14031d9cf:	48 89 8c 24 90 00 00 	mov    QWORD PTR [rsp+0x90],rcx
   14031d9d6:	00 
   14031d9d7:	49 8b cf             	mov    rcx,r15
   14031d9da:	48 89 ac 24 c0 00 00 	mov    QWORD PTR [rsp+0xc0],rbp
   14031d9e1:	00 
   14031d9e2:	4c 89 ac 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],r13
   14031d9e9:	00 
   14031d9ea:	48 89 84 24 98 00 00 	mov    QWORD PTR [rsp+0x98],rax
   14031d9f1:	00 
   14031d9f2:	4c 89 bc 24 b8 00 00 	mov    QWORD PTR [rsp+0xb8],r15
   14031d9f9:	00 
   14031d9fa:	48 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],rdi
   14031d9ff:	44 89 74 24 68       	mov    DWORD PTR [rsp+0x68],r14d
   14031da04:	e8 e1 32 30 00       	call   0x140620cea
   14031da09:	41 8b 5c 24 0c       	mov    ebx,DWORD PTR [r12+0xc]
   14031da0e:	89 5c 24 44          	mov    DWORD PTR [rsp+0x44],ebx
   14031da12:	41 3b 5c 24 10       	cmp    ebx,DWORD PTR [r12+0x10]
   14031da17:	0f 8d c6 0b 00 00    	jge    0x14031e5e3
   14031da1d:	0f 29 b4 24 d0 01 00 	movaps XMMWORD PTR [rsp+0x1d0],xmm6
   14031da24:	00 
   14031da25:	0f 57 f6             	xorps  xmm6,xmm6
   14031da28:	0f 29 bc 24 c0 01 00 	movaps XMMWORD PTR [rsp+0x1c0],xmm7
   14031da2f:	00 
   14031da30:	f2 0f 10 3d 78 2d 53 	movsd  xmm7,QWORD PTR [rip+0x532d78]        # 0x1408507b0
   14031da37:	00 
   14031da38:	44 0f 29 84 24 b0 01 	movaps XMMWORD PTR [rsp+0x1b0],xmm8
   14031da3f:	00 00 
   14031da41:	f3 44 0f 10 05 7e 28 	movss  xmm8,DWORD PTR [rip+0x53287e]        # 0x1408502c8
   14031da48:	53 00 
   14031da4a:	44 0f 29 8c 24 a0 01 	movaps XMMWORD PTR [rsp+0x1a0],xmm9
   14031da51:	00 00 
   14031da53:	f3 44 0f 10 0d d4 25 	movss  xmm9,DWORD PTR [rip+0x5325d4]        # 0x140850030
   14031da5a:	53 00 
   14031da5c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031da60:	8b 15 7e c5 66 00    	mov    edx,DWORD PTR [rip+0x66c57e]        # 0x140989fe4
   14031da66:	44 8b c3             	mov    r8d,ebx
   14031da69:	45 2b 44 24 0c       	sub    r8d,DWORD PTR [r12+0xc]
   14031da6e:	41 03 d0             	add    edx,r8d
   14031da71:	41 89 9c 24 88 06 00 	mov    DWORD PTR [r12+0x688],ebx
   14031da78:	00 
   14031da79:	48 63 c2             	movsxd rax,edx
   14031da7c:	69 ca d0 01 00 00    	imul   ecx,edx,0x1d0
   14031da82:	48 8d 14 45 00 00 00 	lea    rdx,[rax*2+0x0]
   14031da89:	00 
   14031da8a:	43 8d 04 40          	lea    eax,[r8+r8*2]
   14031da8e:	49 03 d5             	add    rdx,r13
   14031da91:	4c 69 d1 f8 00 00 00 	imul   r10,rcx,0xf8
   14031da98:	c1 e0 05             	shl    eax,0x5
   14031da9b:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   14031daa2:	4c 03 d5             	add    r10,rbp
   14031daa5:	49 63 c0             	movsxd rax,r8d
   14031daa8:	48 03 8c 24 98 00 00 	add    rcx,QWORD PTR [rsp+0x98]
   14031daaf:	00 
   14031dab0:	4c 89 94 24 a8 00 00 	mov    QWORD PTR [rsp+0xa8],r10
   14031dab7:	00 
   14031dab8:	48 89 94 24 b0 00 00 	mov    QWORD PTR [rsp+0xb0],rdx
   14031dabf:	00 
   14031dac0:	49 8d 2c 47          	lea    rbp,[r15+rax*2]
   14031dac4:	48 89 8c 24 80 00 00 	mov    QWORD PTR [rsp+0x80],rcx
   14031dacb:	00 
   14031dacc:	32 c0                	xor    al,al
   14031dace:	48 89 6c 24 70       	mov    QWORD PTR [rsp+0x70],rbp
   14031dad3:	88 44 24 41          	mov    BYTE PTR [rsp+0x41],al
   14031dad7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14031dade:	00 00 
   14031dae0:	88 44 24 30          	mov    BYTE PTR [rsp+0x30],al
   14031dae4:	4c 8d 8c 24 80 00 00 	lea    r9,[rsp+0x80]
   14031daeb:	00 
   14031daec:	4c 8b c2             	mov    r8,rdx
   14031daef:	89 5c 24 28          	mov    DWORD PTR [rsp+0x28],ebx
   14031daf3:	49 8b d2             	mov    rdx,r10
   14031daf6:	48 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],rbp
   14031dafb:	48 8b ce             	mov    rcx,rsi
   14031dafe:	e8 4d 72 01 00       	call   0x140334d50
   14031db03:	45 33 c9             	xor    r9d,r9d
   14031db06:	41 0f b7 c1          	movzx  eax,r9w
   14031db0a:	66 89 44 24 48       	mov    WORD PTR [rsp+0x48],ax
   14031db0f:	66 44 3b 4d 00       	cmp    r9w,WORD PTR [rbp+0x0]
   14031db14:	0f 83 56 05 00 00    	jae    0x14031e070
   14031db1a:	4c 8b ac 24 80 00 00 	mov    r13,QWORD PTR [rsp+0x80]
   14031db21:	00 
   14031db22:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031db26:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14031db2d:	00 00 00 
   14031db30:	0f b7 c0             	movzx  eax,ax
   14031db33:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   14031db3a:	48 89 4c 24 78       	mov    QWORD PTR [rsp+0x78],rcx
   14031db3f:	46 0f b6 54 29 0c    	movzx  r10d,BYTE PTR [rcx+r13*1+0xc]
   14031db45:	44 88 54 24 40       	mov    BYTE PTR [rsp+0x40],r10b
   14031db4a:	41 8d 42 f0          	lea    eax,[r10-0x10]
   14031db4e:	3c 02                	cmp    al,0x2
   14031db50:	76 06                	jbe    0x14031db58
   14031db52:	41 80 fa 40          	cmp    r10b,0x40
   14031db56:	75 03                	jne    0x14031db5b
   14031db58:	45 8b f1             	mov    r14d,r9d
   14031db5b:	48 81 c1 a4 01 00 00 	add    rcx,0x1a4
   14031db62:	0f 28 ce             	movaps xmm1,xmm6
   14031db65:	49 03 cd             	add    rcx,r13
   14031db68:	0f 28 e6             	movaps xmm4,xmm6
   14031db6b:	41 8b e9             	mov    ebp,r9d
   14031db6e:	0f 28 c6             	movaps xmm0,xmm6
   14031db71:	ba 03 00 00 00       	mov    edx,0x3
   14031db76:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14031db7d:	00 00 00 
   14031db80:	f3 0f 10 99 34 ff ff 	movss  xmm3,DWORD PTR [rcx-0xcc]
   14031db87:	ff 
   14031db88:	0f 2e de             	ucomiss xmm3,xmm6
   14031db8b:	7a 02                	jp     0x14031db8f
   14031db8d:	74 12                	je     0x14031dba1
   14031db8f:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]
   14031db93:	0f 2f d1             	comiss xmm2,xmm1
   14031db96:	76 09                	jbe    0x14031dba1
   14031db98:	0f 28 ca             	movaps xmm1,xmm2
   14031db9b:	8d 6a fe             	lea    ebp,[rdx-0x2]
   14031db9e:	0f 28 e3             	movaps xmm4,xmm3
   14031dba1:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]
   14031dba5:	0f 2f d0             	comiss xmm2,xmm0
   14031dba8:	76 03                	jbe    0x14031dbad
   14031dbaa:	0f 28 c2             	movaps xmm0,xmm2
   14031dbad:	f3 0f 10 59 70       	movss  xmm3,DWORD PTR [rcx+0x70]
   14031dbb2:	0f 2e de             	ucomiss xmm3,xmm6
   14031dbb5:	7a 02                	jp     0x14031dbb9
   14031dbb7:	74 16                	je     0x14031dbcf
   14031dbb9:	f3 0f 10 91 3c 01 00 	movss  xmm2,DWORD PTR [rcx+0x13c]
   14031dbc0:	00 
   14031dbc1:	0f 2f d1             	comiss xmm2,xmm1
   14031dbc4:	76 09                	jbe    0x14031dbcf
   14031dbc6:	0f 28 ca             	movaps xmm1,xmm2
   14031dbc9:	8d 6a ff             	lea    ebp,[rdx-0x1]
   14031dbcc:	0f 28 e3             	movaps xmm4,xmm3
   14031dbcf:	f3 0f 10 91 3c 01 00 	movss  xmm2,DWORD PTR [rcx+0x13c]
   14031dbd6:	00 
   14031dbd7:	0f 2f d0             	comiss xmm2,xmm0
   14031dbda:	76 03                	jbe    0x14031dbdf
   14031dbdc:	0f 28 c2             	movaps xmm0,xmm2
   14031dbdf:	f3 0f 10 99 ac 01 00 	movss  xmm3,DWORD PTR [rcx+0x1ac]
   14031dbe6:	00 
   14031dbe7:	0f 2e de             	ucomiss xmm3,xmm6
   14031dbea:	7a 02                	jp     0x14031dbee
   14031dbec:	74 15                	je     0x14031dc03
   14031dbee:	f3 0f 10 91 78 02 00 	movss  xmm2,DWORD PTR [rcx+0x278]
   14031dbf5:	00 
   14031dbf6:	0f 2f d1             	comiss xmm2,xmm1
   14031dbf9:	76 08                	jbe    0x14031dc03
   14031dbfb:	0f 28 ca             	movaps xmm1,xmm2
   14031dbfe:	0f 28 e3             	movaps xmm4,xmm3
   14031dc01:	8b ea                	mov    ebp,edx
   14031dc03:	f3 0f 10 91 78 02 00 	movss  xmm2,DWORD PTR [rcx+0x278]
   14031dc0a:	00 
   14031dc0b:	0f 2f d0             	comiss xmm2,xmm0
   14031dc0e:	76 03                	jbe    0x14031dc13
   14031dc10:	0f 28 c2             	movaps xmm0,xmm2
   14031dc13:	f3 0f 10 99 e8 02 00 	movss  xmm3,DWORD PTR [rcx+0x2e8]
   14031dc1a:	00 
   14031dc1b:	0f 2e de             	ucomiss xmm3,xmm6
   14031dc1e:	7a 02                	jp     0x14031dc22
   14031dc20:	74 16                	je     0x14031dc38
   14031dc22:	f3 0f 10 91 b4 03 00 	movss  xmm2,DWORD PTR [rcx+0x3b4]
   14031dc29:	00 
   14031dc2a:	0f 2f d1             	comiss xmm2,xmm1
   14031dc2d:	76 09                	jbe    0x14031dc38
   14031dc2f:	0f 28 ca             	movaps xmm1,xmm2
   14031dc32:	8d 6a 01             	lea    ebp,[rdx+0x1]
   14031dc35:	0f 28 e3             	movaps xmm4,xmm3
   14031dc38:	f3 0f 10 91 b4 03 00 	movss  xmm2,DWORD PTR [rcx+0x3b4]
   14031dc3f:	00 
   14031dc40:	0f 2f d0             	comiss xmm2,xmm0
   14031dc43:	76 03                	jbe    0x14031dc48
   14031dc45:	0f 28 c2             	movaps xmm0,xmm2
   14031dc48:	f3 0f 10 99 24 04 00 	movss  xmm3,DWORD PTR [rcx+0x424]
   14031dc4f:	00 
   14031dc50:	0f 2e de             	ucomiss xmm3,xmm6
   14031dc53:	7a 02                	jp     0x14031dc57
   14031dc55:	74 16                	je     0x14031dc6d
   14031dc57:	f3 0f 10 91 f0 04 00 	movss  xmm2,DWORD PTR [rcx+0x4f0]
   14031dc5e:	00 
   14031dc5f:	0f 2f d1             	comiss xmm2,xmm1
   14031dc62:	76 09                	jbe    0x14031dc6d
   14031dc64:	0f 28 ca             	movaps xmm1,xmm2
   14031dc67:	8d 6a 02             	lea    ebp,[rdx+0x2]
   14031dc6a:	0f 28 e3             	movaps xmm4,xmm3
   14031dc6d:	f3 0f 10 91 f0 04 00 	movss  xmm2,DWORD PTR [rcx+0x4f0]
   14031dc74:	00 
   14031dc75:	0f 2f d0             	comiss xmm2,xmm0
   14031dc78:	76 03                	jbe    0x14031dc7d
   14031dc7a:	0f 28 c2             	movaps xmm0,xmm2
   14031dc7d:	f3 0f 10 99 60 05 00 	movss  xmm3,DWORD PTR [rcx+0x560]
   14031dc84:	00 
   14031dc85:	0f 2e de             	ucomiss xmm3,xmm6
   14031dc88:	7a 02                	jp     0x14031dc8c
   14031dc8a:	74 16                	je     0x14031dca2
   14031dc8c:	f3 0f 10 91 2c 06 00 	movss  xmm2,DWORD PTR [rcx+0x62c]
   14031dc93:	00 
   14031dc94:	0f 2f d1             	comiss xmm2,xmm1
   14031dc97:	76 09                	jbe    0x14031dca2
   14031dc99:	0f 28 ca             	movaps xmm1,xmm2
   14031dc9c:	8d 6a 03             	lea    ebp,[rdx+0x3]
   14031dc9f:	0f 28 e3             	movaps xmm4,xmm3
   14031dca2:	f3 0f 10 91 2c 06 00 	movss  xmm2,DWORD PTR [rcx+0x62c]
   14031dca9:	00 
   14031dcaa:	0f 2f d0             	comiss xmm2,xmm0
   14031dcad:	76 03                	jbe    0x14031dcb2
   14031dcaf:	0f 28 c2             	movaps xmm0,xmm2
   14031dcb2:	f3 0f 10 99 9c 06 00 	movss  xmm3,DWORD PTR [rcx+0x69c]
   14031dcb9:	00 
   14031dcba:	0f 2e de             	ucomiss xmm3,xmm6
   14031dcbd:	7a 02                	jp     0x14031dcc1
   14031dcbf:	74 16                	je     0x14031dcd7
   14031dcc1:	f3 0f 10 91 68 07 00 	movss  xmm2,DWORD PTR [rcx+0x768]
   14031dcc8:	00 
   14031dcc9:	0f 2f d1             	comiss xmm2,xmm1
   14031dccc:	76 09                	jbe    0x14031dcd7
   14031dcce:	0f 28 ca             	movaps xmm1,xmm2
   14031dcd1:	8d 6a 04             	lea    ebp,[rdx+0x4]
   14031dcd4:	0f 28 e3             	movaps xmm4,xmm3
   14031dcd7:	f3 0f 10 91 68 07 00 	movss  xmm2,DWORD PTR [rcx+0x768]
   14031dcde:	00 
   14031dcdf:	0f 2f d0             	comiss xmm2,xmm0
   14031dce2:	76 03                	jbe    0x14031dce7
   14031dce4:	0f 28 c2             	movaps xmm0,xmm2
   14031dce7:	f3 0f 10 99 d8 07 00 	movss  xmm3,DWORD PTR [rcx+0x7d8]
   14031dcee:	00 
   14031dcef:	0f 2e de             	ucomiss xmm3,xmm6
   14031dcf2:	7a 02                	jp     0x14031dcf6
   14031dcf4:	74 16                	je     0x14031dd0c
   14031dcf6:	f3 0f 10 91 a4 08 00 	movss  xmm2,DWORD PTR [rcx+0x8a4]
   14031dcfd:	00 
   14031dcfe:	0f 2f d1             	comiss xmm2,xmm1
   14031dd01:	76 09                	jbe    0x14031dd0c
   14031dd03:	0f 28 ca             	movaps xmm1,xmm2
   14031dd06:	8d 6a 05             	lea    ebp,[rdx+0x5]
   14031dd09:	0f 28 e3             	movaps xmm4,xmm3
   14031dd0c:	f3 0f 10 91 a4 08 00 	movss  xmm2,DWORD PTR [rcx+0x8a4]
   14031dd13:	00 
   14031dd14:	0f 2f d0             	comiss xmm2,xmm0
   14031dd17:	76 03                	jbe    0x14031dd1c
   14031dd19:	0f 28 c2             	movaps xmm0,xmm2
   14031dd1c:	83 c2 08             	add    edx,0x8
   14031dd1f:	48 81 c1 e0 09 00 00 	add    rcx,0x9e0
   14031dd26:	8d 42 fe             	lea    eax,[rdx-0x2]
   14031dd29:	83 f8 30             	cmp    eax,0x30
   14031dd2c:	0f 86 4e fe ff ff    	jbe    0x14031db80
   14031dd32:	85 ed                	test   ebp,ebp
   14031dd34:	0f 84 a6 07 00 00    	je     0x14031e4e0
   14031dd3a:	44 0f 2f c8          	comiss xmm9,xmm0
   14031dd3e:	0f 87 9c 07 00 00    	ja     0x14031e4e0
   14031dd44:	4c 8b 5c 24 50       	mov    r11,QWORD PTR [rsp+0x50]
   14031dd49:	41 8d 76 01          	lea    esi,[r14+0x1]
   14031dd4d:	49 c7 c7 ff ff ff ff 	mov    r15,0xffffffffffffffff
   14031dd54:	4c 89 bc 24 88 00 00 	mov    QWORD PTR [rsp+0x88],r15
   14031dd5b:	00 
   14031dd5c:	41 3b 5b 0c          	cmp    ebx,DWORD PTR [r11+0xc]
   14031dd60:	77 12                	ja     0x14031dd74
   14031dd62:	41 80 fa 40          	cmp    r10b,0x40
   14031dd66:	74 0c                	je     0x14031dd74
   14031dd68:	41 8d 42 f0          	lea    eax,[r10-0x10]
   14031dd6c:	3c 02                	cmp    al,0x2
   14031dd6e:	0f 87 73 01 00 00    	ja     0x14031dee7
   14031dd74:	45 8b 83 48 05 00 00 	mov    r8d,DWORD PTR [r11+0x548]
   14031dd7b:	41 8b f9             	mov    edi,r9d
   14031dd7e:	49 8b d9             	mov    rbx,r9
   14031dd81:	45 85 c0             	test   r8d,r8d
   14031dd84:	0f 8e 58 01 00 00    	jle    0x14031dee2
   14031dd8a:	4c 8b 5c 24 58       	mov    r11,QWORD PTR [rsp+0x58]
   14031dd8f:	4c 8b 64 24 50       	mov    r12,QWORD PTR [rsp+0x50]
   14031dd94:	49 83 c3 24          	add    r11,0x24
   14031dd98:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14031dd9f:	00 
   14031dda0:	41 f6 43 e8 01       	test   BYTE PTR [r11-0x18],0x1
   14031dda5:	45 8b c8             	mov    r9d,r8d
   14031dda8:	0f 85 0b 01 00 00    	jne    0x14031deb9
   14031ddae:	45 38 13             	cmp    BYTE PTR [r11],r10b
   14031ddb1:	0f 85 02 01 00 00    	jne    0x14031deb9
   14031ddb7:	41 0f b6 43 01       	movzx  eax,BYTE PTR [r11+0x1]
   14031ddbc:	3b c5                	cmp    eax,ebp
   14031ddbe:	0f 85 f5 00 00 00    	jne    0x14031deb9
   14031ddc4:	41 8b d0             	mov    edx,r8d
   14031ddc7:	41 80 fa 12          	cmp    r10b,0x12
   14031ddcb:	75 7c                	jne    0x14031de49
   14031ddcd:	4c 8b 4c 24 78       	mov    r9,QWORD PTR [rsp+0x78]
   14031ddd2:	45 8b 53 f0          	mov    r10d,DWORD PTR [r11-0x10]
   14031ddd6:	47 3b 54 29 10       	cmp    r10d,DWORD PTR [r9+r13*1+0x10]
   14031dddb:	74 6c                	je     0x14031de49
   14031dddd:	41 0f b7 4b e4       	movzx  ecx,WORD PTR [r11-0x1c]
   14031dde2:	41 0f bf 43 e6       	movsx  eax,WORD PTR [r11-0x1a]
   14031dde7:	03 c8                	add    ecx,eax
   14031dde9:	39 4c 24 44          	cmp    DWORD PTR [rsp+0x44],ecx
   14031dded:	75 5a                	jne    0x14031de49
   14031ddef:	f3 41 0f 10 43 f4    	movss  xmm0,DWORD PTR [r11-0xc]
   14031ddf5:	f3 43 0f 5c 04 29    	subss  xmm0,DWORD PTR [r9+r13*1]
   14031ddfb:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14031ddfe:	0f 54 cf             	andps  xmm1,xmm7
   14031de01:	66 0f 5a d1          	cvtpd2ps xmm2,xmm1
   14031de05:	44 0f 2f c2          	comiss xmm8,xmm2
   14031de09:	76 3e                	jbe    0x14031de49
   14031de0b:	33 c0                	xor    eax,eax
   14031de0d:	44 8b c8             	mov    r9d,eax
   14031de10:	45 85 c0             	test   r8d,r8d
   14031de13:	7e 34                	jle    0x14031de49
   14031de15:	48 8b 4c 24 58       	mov    rcx,QWORD PTR [rsp+0x58]
   14031de1a:	4c 8b 44 24 78       	mov    r8,QWORD PTR [rsp+0x78]
   14031de1f:	48 83 c1 14          	add    rcx,0x14
   14031de23:	f6 41 f8 01          	test   BYTE PTR [rcx-0x8],0x1
   14031de27:	75 0c                	jne    0x14031de35
   14031de29:	44 39 11             	cmp    DWORD PTR [rcx],r10d
   14031de2c:	75 07                	jne    0x14031de35
   14031de2e:	43 8b 44 28 10       	mov    eax,DWORD PTR [r8+r13*1+0x10]
   14031de33:	89 01                	mov    DWORD PTR [rcx],eax
   14031de35:	41 8b 94 24 48 05 00 	mov    edx,DWORD PTR [r12+0x548]
   14031de3c:	00 
   14031de3d:	41 ff c1             	inc    r9d
   14031de40:	48 83 c1 28          	add    rcx,0x28
   14031de44:	44 3b ca             	cmp    r9d,edx
   14031de47:	7c da                	jl     0x14031de23
   14031de49:	48 8b 44 24 78       	mov    rax,QWORD PTR [rsp+0x78]
   14031de4e:	44 8b ca             	mov    r9d,edx
   14031de51:	42 8b 44 28 10       	mov    eax,DWORD PTR [rax+r13*1+0x10]
   14031de56:	41 39 43 f0          	cmp    DWORD PTR [r11-0x10],eax
   14031de5a:	75 5d                	jne    0x14031deb9
   14031de5c:	41 0f bf 4b e6       	movsx  ecx,WORD PTR [r11-0x1a]
   14031de61:	44 8b 44 24 44       	mov    r8d,DWORD PTR [rsp+0x44]
   14031de66:	44 3b c1             	cmp    r8d,ecx
   14031de69:	7e 4e                	jle    0x14031deb9
   14031de6b:	41 0f b7 43 e4       	movzx  eax,WORD PTR [r11-0x1c]
   14031de70:	44 2b c1             	sub    r8d,ecx
   14031de73:	4d 8b 53 dc          	mov    r10,QWORD PTR [r11-0x24]
   14031de77:	41 3b c0             	cmp    eax,r8d
   14031de7a:	8b c8                	mov    ecx,eax
   14031de7c:	41 0f 4d c8          	cmovge ecx,r8d
   14031de80:	44 2b c0             	sub    r8d,eax
   14031de83:	45 85 c0             	test   r8d,r8d
   14031de86:	b8 00 00 00 00       	mov    eax,0x0
   14031de8b:	44 0f 4e c0          	cmovle r8d,eax
   14031de8f:	45 3b c6             	cmp    r8d,r14d
   14031de92:	7f 25                	jg     0x14031deb9
   14031de94:	48 63 c1             	movsxd rax,ecx
   14031de97:	48 6b c8 5c          	imul   rcx,rax,0x5c
   14031de9b:	f3 42 0f 10 44 11 b4 	movss  xmm0,DWORD PTR [rcx+r10*1-0x4c]
   14031dea2:	0f 2e c4             	ucomiss xmm0,xmm4
   14031dea5:	7a 12                	jp     0x14031deb9
   14031dea7:	75 10                	jne    0x14031deb9
   14031dea9:	44 3b c6             	cmp    r8d,esi
   14031deac:	7d 0b                	jge    0x14031deb9
   14031deae:	4c 8b fb             	mov    r15,rbx
   14031deb1:	41 8b f0             	mov    esi,r8d
   14031deb4:	45 85 c0             	test   r8d,r8d
   14031deb7:	74 1b                	je     0x14031ded4
   14031deb9:	44 0f b6 54 24 40    	movzx  r10d,BYTE PTR [rsp+0x40]
   14031debf:	ff c7                	inc    edi
   14031dec1:	48 ff c3             	inc    rbx
   14031dec4:	49 83 c3 28          	add    r11,0x28
   14031dec8:	45 8b c1             	mov    r8d,r9d
   14031decb:	41 3b f9             	cmp    edi,r9d
   14031dece:	0f 8c cc fe ff ff    	jl     0x14031dda0
   14031ded4:	4c 89 bc 24 88 00 00 	mov    QWORD PTR [rsp+0x88],r15
   14031dedb:	00 
   14031dedc:	4d 8b dc             	mov    r11,r12
   14031dedf:	45 33 c9             	xor    r9d,r9d
   14031dee2:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   14031dee7:	48 8d 84 24 d0 00 00 	lea    rax,[rsp+0xd0]
   14031deee:	00 
   14031deef:	b9 03 00 00 00       	mov    ecx,0x3
   14031def4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031def8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14031deff:	00 
   14031df00:	48 c7 00 ff ff ff ff 	mov    QWORD PTR [rax],0xffffffffffffffff
   14031df07:	48 c7 40 08 ff ff ff 	mov    QWORD PTR [rax+0x8],0xffffffffffffffff
   14031df0e:	ff 
   14031df0f:	48 c7 40 10 ff ff ff 	mov    QWORD PTR [rax+0x10],0xffffffffffffffff
   14031df16:	ff 
   14031df17:	48 8d 40 40          	lea    rax,[rax+0x40]
   14031df1b:	48 c7 40 d8 ff ff ff 	mov    QWORD PTR [rax-0x28],0xffffffffffffffff
   14031df22:	ff 
   14031df23:	48 c7 40 e0 ff ff ff 	mov    QWORD PTR [rax-0x20],0xffffffffffffffff
   14031df2a:	ff 
   14031df2b:	48 c7 40 e8 ff ff ff 	mov    QWORD PTR [rax-0x18],0xffffffffffffffff
   14031df32:	ff 
   14031df33:	48 c7 40 f0 ff ff ff 	mov    QWORD PTR [rax-0x10],0xffffffffffffffff
   14031df3a:	ff 
   14031df3b:	48 c7 40 f8 ff ff ff 	mov    QWORD PTR [rax-0x8],0xffffffffffffffff
   14031df42:	ff 
   14031df43:	48 83 e9 01          	sub    rcx,0x1
   14031df47:	75 b7                	jne    0x14031df00
   14031df49:	4d 85 ff             	test   r15,r15
   14031df4c:	78 48                	js     0x14031df96
   14031df4e:	45 8b 83 48 05 00 00 	mov    r8d,DWORD PTR [r11+0x548]
   14031df55:	4b 8d 04 bf          	lea    rax,[r15+r15*4]
   14031df59:	8b 5c c7 10          	mov    ebx,DWORD PTR [rdi+rax*8+0x10]
   14031df5d:	41 8b d1             	mov    edx,r9d
   14031df60:	89 5c 24 64          	mov    DWORD PTR [rsp+0x64],ebx
   14031df64:	45 85 c0             	test   r8d,r8d
   14031df67:	0f 8e b2 02 00 00    	jle    0x14031e21f
   14031df6d:	48 8d 4f 10          	lea    rcx,[rdi+0x10]
   14031df71:	f6 41 fc 01          	test   BYTE PTR [rcx-0x4],0x1
   14031df75:	75 0f                	jne    0x14031df86
   14031df77:	39 19                	cmp    DWORD PTR [rcx],ebx
   14031df79:	75 0b                	jne    0x14031df86
   14031df7b:	0f b6 41 15          	movzx  eax,BYTE PTR [rcx+0x15]
   14031df7f:	89 94 84 cc 00 00 00 	mov    DWORD PTR [rsp+rax*4+0xcc],edx
   14031df86:	ff c2                	inc    edx
   14031df88:	48 83 c1 28          	add    rcx,0x28
   14031df8c:	41 3b d0             	cmp    edx,r8d
   14031df8f:	7c e0                	jl     0x14031df71
   14031df91:	e9 89 02 00 00       	jmp    0x14031e21f
   14031df96:	48 8b 0d 6b bf 66 00 	mov    rcx,QWORD PTR [rip+0x66bf6b]        # 0x140989f08
   14031df9d:	ba ff ff ff ff       	mov    edx,0xffffffff
   14031dfa2:	ff 15 a8 a6 36 00    	call   QWORD PTR [rip+0x36a6a8]        # 0x140688650
   14031dfa8:	8b 1d 3a c0 66 00    	mov    ebx,DWORD PTR [rip+0x66c03a]        # 0x140989fe8
   14031dfae:	48 8b 0d 53 bf 66 00 	mov    rcx,QWORD PTR [rip+0x66bf53]        # 0x140989f08
   14031dfb5:	89 5c 24 64          	mov    DWORD PTR [rsp+0x64],ebx
   14031dfb9:	8d 43 01             	lea    eax,[rbx+0x1]
   14031dfbc:	89 05 26 c0 66 00    	mov    DWORD PTR [rip+0x66c026],eax        # 0x140989fe8
   14031dfc2:	ff 15 80 a6 36 00    	call   QWORD PTR [rip+0x36a680]        # 0x140688648
   14031dfc8:	4c 8b 5c 24 50       	mov    r11,QWORD PTR [rsp+0x50]
   14031dfcd:	33 c0                	xor    eax,eax
   14031dfcf:	ba 01 00 00 00       	mov    edx,0x1
   14031dfd4:	44 8b c8             	mov    r9d,eax
   14031dfd7:	45 8b 83 48 05 00 00 	mov    r8d,DWORD PTR [r11+0x548]
   14031dfde:	45 85 c0             	test   r8d,r8d
   14031dfe1:	7e 37                	jle    0x14031e01a
   14031dfe3:	4c 8d 57 0c          	lea    r10,[rdi+0xc]
   14031dfe7:	41 f6 02 01          	test   BYTE PTR [r10],0x1
   14031dfeb:	74 18                	je     0x14031e005
   14031dfed:	8d 42 ff             	lea    eax,[rdx-0x1]
   14031dff0:	ff c2                	inc    edx
   14031dff2:	8b c8                	mov    ecx,eax
   14031dff4:	44 89 8c 84 d0 00 00 	mov    DWORD PTR [rsp+rax*4+0xd0],r9d
   14031dffb:	00 
   14031dffc:	83 fa 30             	cmp    edx,0x30
   14031dfff:	0f 87 d6 01 00 00    	ja     0x14031e1db
   14031e005:	41 ff c1             	inc    r9d
   14031e008:	49 83 c2 28          	add    r10,0x28
   14031e00c:	45 3b c8             	cmp    r9d,r8d
   14031e00f:	7c d6                	jl     0x14031dfe7
   14031e011:	83 fa 30             	cmp    edx,0x30
   14031e014:	0f 87 c1 01 00 00    	ja     0x14031e1db
   14031e01a:	41 81 f8 00 3c 00 00 	cmp    r8d,0x3c00
   14031e021:	73 31                	jae    0x14031e054
   14031e023:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031e027:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14031e02e:	00 00 
   14031e030:	8d 42 ff             	lea    eax,[rdx-0x1]
   14031e033:	ff c2                	inc    edx
   14031e035:	8b c8                	mov    ecx,eax
   14031e037:	44 89 84 84 d0 00 00 	mov    DWORD PTR [rsp+rax*4+0xd0],r8d
   14031e03e:	00 
   14031e03f:	83 fa 30             	cmp    edx,0x30
   14031e042:	0f 87 93 01 00 00    	ja     0x14031e1db
   14031e048:	41 ff c0             	inc    r8d
   14031e04b:	41 81 f8 00 3c 00 00 	cmp    r8d,0x3c00
   14031e052:	72 dc                	jb     0x14031e030
   14031e054:	45 33 c9             	xor    r9d,r9d
   14031e057:	48 8b 6c 24 70       	mov    rbp,QWORD PTR [rsp+0x70]
   14031e05c:	4d 8b e3             	mov    r12,r11
   14031e05f:	8b 5c 24 44          	mov    ebx,DWORD PTR [rsp+0x44]
   14031e063:	48 8b b4 24 90 00 00 	mov    rsi,QWORD PTR [rsp+0x90]
   14031e06a:	00 
   14031e06b:	44 8b 74 24 68       	mov    r14d,DWORD PTR [rsp+0x68]
   14031e070:	0f b6 44 24 41       	movzx  eax,BYTE PTR [rsp+0x41]
   14031e075:	4c 8b 94 24 a8 00 00 	mov    r10,QWORD PTR [rsp+0xa8]
   14031e07c:	00 
   14031e07d:	fe c0                	inc    al
   14031e07f:	48 8b 94 24 b0 00 00 	mov    rdx,QWORD PTR [rsp+0xb0]
   14031e086:	00 
   14031e087:	88 44 24 41          	mov    BYTE PTR [rsp+0x41],al
   14031e08b:	3c 08                	cmp    al,0x8
   14031e08d:	0f 82 4d fa ff ff    	jb     0x14031dae0
   14031e093:	41 83 bc 24 48 05 00 	cmp    DWORD PTR [r12+0x548],0x0
   14031e09a:	00 00 
   14031e09c:	41 8b f1             	mov    esi,r9d
   14031e09f:	0f 8e e6 04 00 00    	jle    0x14031e58b
   14031e0a5:	48 8b df             	mov    rbx,rdi
   14031e0a8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14031e0af:	00 
   14031e0b0:	0f b6 53 0c          	movzx  edx,BYTE PTR [rbx+0xc]
   14031e0b4:	f6 c2 01             	test   dl,0x1
   14031e0b7:	0f 85 b6 04 00 00    	jne    0x14031e573
   14031e0bd:	0f b6 4b 24          	movzx  ecx,BYTE PTR [rbx+0x24]
   14031e0c1:	80 f9 01             	cmp    cl,0x1
   14031e0c4:	0f 84 a9 04 00 00    	je     0x14031e573
   14031e0ca:	8d 41 f0             	lea    eax,[rcx-0x10]
   14031e0cd:	3c 02                	cmp    al,0x2
   14031e0cf:	76 08                	jbe    0x14031e0d9
   14031e0d1:	80 f9 40             	cmp    cl,0x40
   14031e0d4:	74 03                	je     0x14031e0d9
   14031e0d6:	45 8b ce             	mov    r9d,r14d
   14031e0d9:	0f bf 4b 0a          	movsx  ecx,WORD PTR [rbx+0xa]
   14031e0dd:	44 0f b7 43 08       	movzx  r8d,WORD PTR [rbx+0x8]
   14031e0e2:	41 03 c9             	add    ecx,r9d
   14031e0e5:	8b 44 24 44          	mov    eax,DWORD PTR [rsp+0x44]
   14031e0e9:	41 03 c8             	add    ecx,r8d
   14031e0ec:	ff c8                	dec    eax
   14031e0ee:	3b c8                	cmp    ecx,eax
   14031e0f0:	0f 8d 7a 04 00 00    	jge    0x14031e570
   14031e0f6:	41 83 f8 01          	cmp    r8d,0x1
   14031e0fa:	0f 83 06 04 00 00    	jae    0x14031e506
   14031e100:	4c 8b 0b             	mov    r9,QWORD PTR [rbx]
   14031e103:	80 ca 01             	or     dl,0x1
   14031e106:	88 53 0c             	mov    BYTE PTR [rbx+0xc],dl
   14031e109:	4d 85 c9             	test   r9,r9
   14031e10c:	0f 84 be 00 00 00    	je     0x14031e1d0
   14031e112:	49 8b 8c 24 50 05 00 	mov    rcx,QWORD PTR [r12+0x550]
   14031e119:	00 
   14031e11a:	4c 3b c9             	cmp    r9,rcx
   14031e11d:	7c 52                	jl     0x14031e171
   14031e11f:	41 8b 94 24 64 05 00 	mov    edx,DWORD PTR [r12+0x564]
   14031e126:	00 
   14031e127:	41 8b 84 24 60 05 00 	mov    eax,DWORD PTR [r12+0x560]
   14031e12e:	00 
   14031e12f:	48 0f af c2          	imul   rax,rdx
   14031e133:	48 6b c0 5c          	imul   rax,rax,0x5c
   14031e137:	48 03 c1             	add    rax,rcx
   14031e13a:	4c 3b c8             	cmp    r9,rax
   14031e13d:	7d 32                	jge    0x14031e171
   14031e13f:	44 6b c2 5c          	imul   r8d,edx,0x5c
   14031e143:	49 8b c1             	mov    rax,r9
   14031e146:	48 2b c1             	sub    rax,rcx
   14031e149:	49 8b 8c 24 58 05 00 	mov    rcx,QWORD PTR [r12+0x558]
   14031e150:	00 
   14031e151:	48 99                	cqo
   14031e153:	49 f7 f8             	idiv   r8
   14031e156:	8b d0                	mov    edx,eax
   14031e158:	c6 04 0a 00          	mov    BYTE PTR [rdx+rcx*1],0x0
   14031e15c:	41 8b 8c 24 80 05 00 	mov    ecx,DWORD PTR [r12+0x580]
   14031e163:	00 
   14031e164:	3b c1                	cmp    eax,ecx
   14031e166:	0f 43 c1             	cmovae eax,ecx
   14031e169:	41 89 84 24 80 05 00 	mov    DWORD PTR [r12+0x580],eax
   14031e170:	00 
   14031e171:	49 8b 84 24 68 05 00 	mov    rax,QWORD PTR [r12+0x568]
   14031e178:	00 
   14031e179:	4c 3b c8             	cmp    r9,rax
   14031e17c:	7c 52                	jl     0x14031e1d0
   14031e17e:	41 8b 94 24 7c 05 00 	mov    edx,DWORD PTR [r12+0x57c]
   14031e185:	00 
   14031e186:	41 8b 8c 24 78 05 00 	mov    ecx,DWORD PTR [r12+0x578]
   14031e18d:	00 
   14031e18e:	48 0f af ca          	imul   rcx,rdx
   14031e192:	48 6b c9 5c          	imul   rcx,rcx,0x5c
   14031e196:	48 03 c8             	add    rcx,rax
   14031e199:	4c 3b c9             	cmp    r9,rcx
   14031e19c:	7d 32                	jge    0x14031e1d0
   14031e19e:	49 8b 8c 24 70 05 00 	mov    rcx,QWORD PTR [r12+0x570]
   14031e1a5:	00 
   14031e1a6:	4c 2b c8             	sub    r9,rax
   14031e1a9:	44 6b c2 5c          	imul   r8d,edx,0x5c
   14031e1ad:	49 8b c1             	mov    rax,r9
   14031e1b0:	48 99                	cqo
   14031e1b2:	49 f7 f8             	idiv   r8
   14031e1b5:	8b d0                	mov    edx,eax
   14031e1b7:	c6 04 0a 00          	mov    BYTE PTR [rdx+rcx*1],0x0
   14031e1bb:	41 8b 8c 24 84 05 00 	mov    ecx,DWORD PTR [r12+0x584]
   14031e1c2:	00 
   14031e1c3:	3b c1                	cmp    eax,ecx
   14031e1c5:	0f 43 c1             	cmovae eax,ecx
   14031e1c8:	41 89 84 24 84 05 00 	mov    DWORD PTR [r12+0x584],eax
   14031e1cf:	00 
   14031e1d0:	45 33 c9             	xor    r9d,r9d
   14031e1d3:	4c 89 0b             	mov    QWORD PTR [rbx],r9
   14031e1d6:	e9 98 03 00 00       	jmp    0x14031e573
   14031e1db:	41 8b 8b 80 05 00 00 	mov    ecx,DWORD PTR [r11+0x580]
   14031e1e2:	45 33 c9             	xor    r9d,r9d
   14031e1e5:	45 8b 83 60 05 00 00 	mov    r8d,DWORD PTR [r11+0x560]
   14031e1ec:	41 8b d1             	mov    edx,r9d
   14031e1ef:	41 3b c8             	cmp    ecx,r8d
   14031e1f2:	0f 83 5f fe ff ff    	jae    0x14031e057
   14031e1f8:	4d 8b 8b 58 05 00 00 	mov    r9,QWORD PTR [r11+0x558]
   14031e1ff:	90                   	nop
   14031e200:	8b c1                	mov    eax,ecx
   14031e202:	42 80 3c 08 00       	cmp    BYTE PTR [rax+r9*1],0x0
   14031e207:	75 07                	jne    0x14031e210
   14031e209:	ff c2                	inc    edx
   14031e20b:	83 fa 30             	cmp    edx,0x30
   14031e20e:	73 0c                	jae    0x14031e21c
   14031e210:	ff c1                	inc    ecx
   14031e212:	41 3b c8             	cmp    ecx,r8d
   14031e215:	72 e9                	jb     0x14031e200
   14031e217:	e9 38 fe ff ff       	jmp    0x14031e054
   14031e21c:	45 33 c9             	xor    r9d,r9d
   14031e21f:	45 8b e1             	mov    r12d,r9d
   14031e222:	44 89 4c 24 60       	mov    DWORD PTR [rsp+0x60],r9d
   14031e227:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14031e22e:	00 00 
   14031e230:	41 8b c4             	mov    eax,r12d
   14031e233:	48 89 84 24 a0 00 00 	mov    QWORD PTR [rsp+0xa0],rax
   14031e23a:	00 
   14031e23b:	4c 63 94 84 d0 00 00 	movsxd r10,DWORD PTR [rsp+rax*4+0xd0]
   14031e242:	00 
   14031e243:	4d 85 ff             	test   r15,r15
   14031e246:	78 2e                	js     0x14031e276
   14031e248:	45 85 d2             	test   r10d,r10d
   14031e24b:	0f 88 57 02 00 00    	js     0x14031e4a8
   14031e251:	8b 6c 24 44          	mov    ebp,DWORD PTR [rsp+0x44]
   14031e255:	4b 8d 0c 92          	lea    rcx,[r10+r10*4]
   14031e259:	0f bf 44 cf 0a       	movsx  eax,WORD PTR [rdi+rcx*8+0xa]
   14031e25e:	4c 8d 71 01          	lea    r14,[rcx+0x1]
   14031e262:	46 0f b7 3c f7       	movzx  r15d,WORD PTR [rdi+r14*8]
   14031e267:	4e 8d 34 f7          	lea    r14,[rdi+r14*8]
   14031e26b:	48 8b 34 cf          	mov    rsi,QWORD PTR [rdi+rcx*8]
   14031e26f:	2b e8                	sub    ebp,eax
   14031e271:	e9 de 00 00 00       	jmp    0x14031e354
   14031e276:	45 85 d2             	test   r10d,r10d
   14031e279:	0f 88 53 02 00 00    	js     0x14031e4d2
   14031e27f:	33 c0                	xor    eax,eax
   14031e281:	4b 8d 14 92          	lea    rdx,[r10+r10*4]
   14031e285:	48 89 04 d7          	mov    QWORD PTR [rdi+rdx*8],rax
   14031e289:	48 89 44 d7 08       	mov    QWORD PTR [rdi+rdx*8+0x8],rax
   14031e28e:	48 89 44 d7 10       	mov    QWORD PTR [rdi+rdx*8+0x10],rax
   14031e293:	48 89 44 d7 18       	mov    QWORD PTR [rdi+rdx*8+0x18],rax
   14031e298:	48 89 44 d7 20       	mov    QWORD PTR [rdi+rdx*8+0x20],rax
   14031e29d:	41 8b 8b 80 05 00 00 	mov    ecx,DWORD PTR [r11+0x580]
   14031e2a4:	45 8b 8b 60 05 00 00 	mov    r9d,DWORD PTR [r11+0x560]
   14031e2ab:	41 3b c9             	cmp    ecx,r9d
   14031e2ae:	73 24                	jae    0x14031e2d4
   14031e2b0:	4d 8b 83 58 05 00 00 	mov    r8,QWORD PTR [r11+0x558]
   14031e2b7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14031e2be:	00 00 
   14031e2c0:	8b c1                	mov    eax,ecx
   14031e2c2:	41 80 3c 00 00       	cmp    BYTE PTR [r8+rax*1],0x0
   14031e2c7:	0f 84 3c 01 00 00    	je     0x14031e409
   14031e2cd:	ff c1                	inc    ecx
   14031e2cf:	41 3b c9             	cmp    ecx,r9d
   14031e2d2:	72 ec                	jb     0x14031e2c0
   14031e2d4:	45 33 c9             	xor    r9d,r9d
   14031e2d7:	41 8b f1             	mov    esi,r9d
   14031e2da:	48 89 34 d7          	mov    QWORD PTR [rdi+rdx*8],rsi
   14031e2de:	48 85 f6             	test   rsi,rsi
   14031e2e1:	0f 84 eb 01 00 00    	je     0x14031e4d2
   14031e2e7:	48 8b 4c 24 78       	mov    rcx,QWORD PTR [rsp+0x78]
   14031e2ec:	4c 8d 72 01          	lea    r14,[rdx+0x1]
   14031e2f0:	8b 44 24 44          	mov    eax,DWORD PTR [rsp+0x44]
   14031e2f4:	4e 8d 34 f7          	lea    r14,[rdi+r14*8]
   14031e2f8:	66 89 44 d7 0a       	mov    WORD PTR [rdi+rdx*8+0xa],ax
   14031e2fd:	41 8b e9             	mov    ebp,r9d
   14031e300:	66 45 89 0e          	mov    WORD PTR [r14],r9w
   14031e304:	45 8b f9             	mov    r15d,r9d
   14031e307:	42 8b 04 29          	mov    eax,DWORD PTR [rcx+r13*1]
   14031e30b:	89 44 d7 18          	mov    DWORD PTR [rdi+rdx*8+0x18],eax
   14031e30f:	0f b6 44 24 40       	movzx  eax,BYTE PTR [rsp+0x40]
   14031e314:	88 44 d7 24          	mov    BYTE PTR [rdi+rdx*8+0x24],al
   14031e318:	41 8d 44 24 01       	lea    eax,[r12+0x1]
   14031e31d:	88 44 d7 25          	mov    BYTE PTR [rdi+rdx*8+0x25],al
   14031e321:	c6 44 d7 0c 00       	mov    BYTE PTR [rdi+rdx*8+0xc],0x0
   14031e326:	89 5c d7 10          	mov    DWORD PTR [rdi+rdx*8+0x10],ebx
   14031e32a:	48 c7 44 d7 1c 00 00 	mov    QWORD PTR [rdi+rdx*8+0x1c],0x0
   14031e331:	00 00 
   14031e333:	42 8b 44 29 10       	mov    eax,DWORD PTR [rcx+r13*1+0x10]
   14031e338:	89 44 d7 14          	mov    DWORD PTR [rdi+rdx*8+0x14],eax
   14031e33c:	45 3b 93 48 05 00 00 	cmp    r10d,DWORD PTR [r11+0x548]
   14031e343:	7c 0f                	jl     0x14031e354
   14031e345:	41 8d 42 01          	lea    eax,[r10+0x1]
   14031e349:	41 89 83 48 05 00 00 	mov    DWORD PTR [r11+0x548],eax
   14031e350:	48 8b 34 d7          	mov    rsi,QWORD PTR [rdi+rdx*8]
   14031e354:	8b fd                	mov    edi,ebp
   14031e356:	41 3b ef             	cmp    ebp,r15d
   14031e359:	0f 8c 41 01 00 00    	jl     0x14031e4a0
   14031e35f:	4c 8b a4 24 a0 00 00 	mov    r12,QWORD PTR [rsp+0xa0]
   14031e366:	00 
   14031e367:	45 8b ef             	mov    r13d,r15d
   14031e36a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14031e370:	48 8b 8c 24 90 00 00 	mov    rcx,QWORD PTR [rsp+0x90]
   14031e377:	00 
   14031e378:	4c 8b c6             	mov    r8,rsi
   14031e37b:	49 8b d3             	mov    rdx,r11
   14031e37e:	e8 9d 80 02 00       	call   0x140346420
   14031e383:	3b f8                	cmp    edi,eax
   14031e385:	0f 8d 08 01 00 00    	jge    0x14031e493
   14031e38b:	48 63 c7             	movsxd rax,edi
   14031e38e:	33 d2                	xor    edx,edx
   14031e390:	48 6b d8 5c          	imul   rbx,rax,0x5c
   14031e394:	44 8d 42 5c          	lea    r8d,[rdx+0x5c]
   14031e398:	48 03 de             	add    rbx,rsi
   14031e39b:	48 8b cb             	mov    rcx,rbx
   14031e39e:	e8 47 29 30 00       	call   0x140620cea
   14031e3a3:	4c 8b 8c 24 80 00 00 	mov    r9,QWORD PTR [rsp+0x80]
   14031e3aa:	00 
   14031e3ab:	0f b7 54 24 48       	movzx  edx,WORD PTR [rsp+0x48]
   14031e3b0:	48 69 ca 18 3c 00 00 	imul   rcx,rdx,0x3c18
   14031e3b7:	4d 69 c4 3c 01 00 00 	imul   r8,r12,0x13c
   14031e3be:	42 8b 04 09          	mov    eax,DWORD PTR [rcx+r9*1]
   14031e3c2:	89 43 50             	mov    DWORD PTR [rbx+0x50],eax
   14031e3c5:	4c 03 c1             	add    r8,rcx
   14031e3c8:	f3 43 0f 10 84 08 d8 	movss  xmm0,DWORD PTR [r8+r9*1+0xd8]
   14031e3cf:	00 00 00 
   14031e3d2:	0f 2e c6             	ucomiss xmm0,xmm6
   14031e3d5:	7a 62                	jp     0x14031e439
   14031e3d7:	75 60                	jne    0x14031e439
   14031e3d9:	33 c0                	xor    eax,eax
   14031e3db:	49 8d 4d ff          	lea    rcx,[r13-0x1]
   14031e3df:	89 43 10             	mov    DWORD PTR [rbx+0x10],eax
   14031e3e2:	48 85 c9             	test   rcx,rcx
   14031e3e5:	78 7b                	js     0x14031e462
   14031e3e7:	48 6b c1 5c          	imul   rax,rcx,0x5c
   14031e3eb:	48 8d 56 10          	lea    rdx,[rsi+0x10]
   14031e3ef:	48 03 d0             	add    rdx,rax
   14031e3f2:	f3 0f 10 02          	movss  xmm0,DWORD PTR [rdx]
   14031e3f6:	0f 2e c6             	ucomiss xmm0,xmm6
   14031e3f9:	7a 37                	jp     0x14031e432
   14031e3fb:	75 35                	jne    0x14031e432
   14031e3fd:	48 83 ea 5c          	sub    rdx,0x5c
   14031e401:	48 83 e9 01          	sub    rcx,0x1
   14031e405:	79 eb                	jns    0x14031e3f2
   14031e407:	eb 59                	jmp    0x14031e462
   14031e409:	41 c6 04 00 01       	mov    BYTE PTR [r8+rax*1],0x1
   14031e40e:	41 8b 83 64 05 00 00 	mov    eax,DWORD PTR [r11+0x564]
   14031e415:	41 ff 83 80 05 00 00 	inc    DWORD PTR [r11+0x580]
   14031e41c:	0f af c1             	imul   eax,ecx
   14031e41f:	48 6b f0 5c          	imul   rsi,rax,0x5c
   14031e423:	49 03 b3 50 05 00 00 	add    rsi,QWORD PTR [r11+0x550]
   14031e42a:	45 33 c9             	xor    r9d,r9d
   14031e42d:	e9 a8 fe ff ff       	jmp    0x14031e2da
   14031e432:	f3 0f 11 43 10       	movss  DWORD PTR [rbx+0x10],xmm0
   14031e437:	eb 29                	jmp    0x14031e462
   14031e439:	43 0f 10 84 08 fc 01 	movups xmm0,XMMWORD PTR [r8+r9*1+0x1fc]
   14031e440:	00 00 
   14031e442:	0f 11 03             	movups XMMWORD PTR [rbx],xmm0
   14031e445:	f2 43 0f 10 8c 08 0c 	movsd  xmm1,QWORD PTR [r8+r9*1+0x20c]
   14031e44c:	02 00 00 
   14031e44f:	f2 0f 11 4b 10       	movsd  QWORD PTR [rbx+0x10],xmm1
   14031e454:	3b fd                	cmp    edi,ebp
   14031e456:	74 06                	je     0x14031e45e
   14031e458:	33 c0                	xor    eax,eax
   14031e45a:	48 89 43 08          	mov    QWORD PTR [rbx+0x8],rax
   14031e45e:	c6 43 4b 01          	mov    BYTE PTR [rbx+0x4b],0x1
   14031e462:	4c 8b 5c 24 50       	mov    r11,QWORD PTR [rsp+0x50]
   14031e467:	8d 4f 01             	lea    ecx,[rdi+0x1]
   14031e46a:	c6 43 48 00          	mov    BYTE PTR [rbx+0x48],0x0
   14031e46e:	43 0f b7 84 08 c8 01 	movzx  eax,WORD PTR [r8+r9*1+0x1c8]
   14031e475:	00 00 
   14031e477:	66 89 43 4c          	mov    WORD PTR [rbx+0x4c],ax
   14031e47b:	66 41 39 0e          	cmp    WORD PTR [r14],cx
   14031e47f:	66 41 0f 43 0e       	cmovae cx,WORD PTR [r14]
   14031e484:	ff cf                	dec    edi
   14031e486:	66 41 89 0e          	mov    WORD PTR [r14],cx
   14031e48a:	41 3b ff             	cmp    edi,r15d
   14031e48d:	0f 8d dd fe ff ff    	jge    0x14031e370
   14031e493:	44 8b 64 24 60       	mov    r12d,DWORD PTR [rsp+0x60]
   14031e498:	4c 8b ac 24 80 00 00 	mov    r13,QWORD PTR [rsp+0x80]
   14031e49f:	00 
   14031e4a0:	4c 8b bc 24 88 00 00 	mov    r15,QWORD PTR [rsp+0x88]
   14031e4a7:	00 
   14031e4a8:	8b 5c 24 64          	mov    ebx,DWORD PTR [rsp+0x64]
   14031e4ac:	41 ff c4             	inc    r12d
   14031e4af:	4c 8b 5c 24 50       	mov    r11,QWORD PTR [rsp+0x50]
   14031e4b4:	41 b9 00 00 00 00    	mov    r9d,0x0
   14031e4ba:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   14031e4bf:	44 89 64 24 60       	mov    DWORD PTR [rsp+0x60],r12d
   14031e4c4:	41 8d 44 24 01       	lea    eax,[r12+0x1]
   14031e4c9:	83 f8 30             	cmp    eax,0x30
   14031e4cc:	0f 86 5e fd ff ff    	jbe    0x14031e230
   14031e4d2:	4c 8b 64 24 50       	mov    r12,QWORD PTR [rsp+0x50]
   14031e4d7:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   14031e4dc:	8b 5c 24 44          	mov    ebx,DWORD PTR [rsp+0x44]
   14031e4e0:	0f b7 44 24 48       	movzx  eax,WORD PTR [rsp+0x48]
   14031e4e5:	48 8b 6c 24 70       	mov    rbp,QWORD PTR [rsp+0x70]
   14031e4ea:	66 ff c0             	inc    ax
   14031e4ed:	44 8b 74 24 68       	mov    r14d,DWORD PTR [rsp+0x68]
   14031e4f2:	66 89 44 24 48       	mov    WORD PTR [rsp+0x48],ax
   14031e4f7:	66 3b 45 00          	cmp    ax,WORD PTR [rbp+0x0]
   14031e4fb:	0f 82 2f f6 ff ff    	jb     0x14031db30
   14031e501:	e9 59 fb ff ff       	jmp    0x14031e05f
   14031e506:	41 83 f8 20          	cmp    r8d,0x20
   14031e50a:	77 64                	ja     0x14031e570
   14031e50c:	48 8b 13             	mov    rdx,QWORD PTR [rbx]
   14031e50f:	4d 8b 84 24 68 05 00 	mov    r8,QWORD PTR [r12+0x568]
   14031e516:	00 
   14031e517:	49 3b d0             	cmp    rdx,r8
   14031e51a:	7c 20                	jl     0x14031e53c
   14031e51c:	41 8b 84 24 78 05 00 	mov    eax,DWORD PTR [r12+0x578]
   14031e523:	00 
   14031e524:	41 8b 8c 24 7c 05 00 	mov    ecx,DWORD PTR [r12+0x57c]
   14031e52b:	00 
   14031e52c:	48 0f af c8          	imul   rcx,rax
   14031e530:	48 6b c1 5c          	imul   rax,rcx,0x5c
   14031e534:	49 03 c0             	add    rax,r8
   14031e537:	48 3b d0             	cmp    rdx,rax
   14031e53a:	7c 34                	jl     0x14031e570
   14031e53c:	ba 20 00 00 00       	mov    edx,0x20
   14031e541:	49 8b cc             	mov    rcx,r12
   14031e544:	e8 07 73 02 00       	call   0x140345850
   14031e549:	48 8b f8             	mov    rdi,rax
   14031e54c:	48 85 c0             	test   rax,rax
   14031e54f:	74 1f                	je     0x14031e570
   14031e551:	48 8b 13             	mov    rdx,QWORD PTR [rbx]
   14031e554:	48 8b c8             	mov    rcx,rax
   14031e557:	41 b8 80 0b 00 00    	mov    r8d,0xb80
   14031e55d:	e8 82 27 30 00       	call   0x140620ce4
   14031e562:	48 8b 13             	mov    rdx,QWORD PTR [rbx]
   14031e565:	49 8b cc             	mov    rcx,r12
   14031e568:	e8 b3 79 02 00       	call   0x140345f20
   14031e56d:	48 89 3b             	mov    QWORD PTR [rbx],rdi
   14031e570:	45 33 c9             	xor    r9d,r9d
   14031e573:	ff c6                	inc    esi
   14031e575:	48 83 c3 28          	add    rbx,0x28
   14031e579:	41 3b b4 24 48 05 00 	cmp    esi,DWORD PTR [r12+0x548]
   14031e580:	00 
   14031e581:	0f 8c 29 fb ff ff    	jl     0x14031e0b0
   14031e587:	8b 5c 24 44          	mov    ebx,DWORD PTR [rsp+0x44]
   14031e58b:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   14031e590:	ff c3                	inc    ebx
   14031e592:	48 8b b4 24 90 00 00 	mov    rsi,QWORD PTR [rsp+0x90]
   14031e599:	00 
   14031e59a:	4c 8b bc 24 b8 00 00 	mov    r15,QWORD PTR [rsp+0xb8]
   14031e5a1:	00 
   14031e5a2:	48 8b ac 24 c0 00 00 	mov    rbp,QWORD PTR [rsp+0xc0]
   14031e5a9:	00 
   14031e5aa:	4c 8b ac 24 c8 00 00 	mov    r13,QWORD PTR [rsp+0xc8]
   14031e5b1:	00 
   14031e5b2:	89 5c 24 44          	mov    DWORD PTR [rsp+0x44],ebx
   14031e5b6:	41 3b 5c 24 10       	cmp    ebx,DWORD PTR [r12+0x10]
   14031e5bb:	0f 8c 9f f4 ff ff    	jl     0x14031da60
   14031e5c1:	44 0f 28 8c 24 a0 01 	movaps xmm9,XMMWORD PTR [rsp+0x1a0]
   14031e5c8:	00 00 
   14031e5ca:	44 0f 28 84 24 b0 01 	movaps xmm8,XMMWORD PTR [rsp+0x1b0]
   14031e5d1:	00 00 
   14031e5d3:	0f 28 bc 24 c0 01 00 	movaps xmm7,XMMWORD PTR [rsp+0x1c0]
   14031e5da:	00 
   14031e5db:	0f 28 b4 24 d0 01 00 	movaps xmm6,XMMWORD PTR [rsp+0x1d0]
   14031e5e2:	00 
   14031e5e3:	48 8b 8c 24 90 01 00 	mov    rcx,QWORD PTR [rsp+0x190]
   14031e5ea:	00 
   14031e5eb:	48 33 cc             	xor    rcx,rsp
   14031e5ee:	e8 0d d0 2f 00       	call   0x14061b600
   14031e5f3:	48 8b 9c 24 30 02 00 	mov    rbx,QWORD PTR [rsp+0x230]
   14031e5fa:	00 
   14031e5fb:	48 81 c4 e0 01 00 00 	add    rsp,0x1e0
   14031e602:	41 5f                	pop    r15
   14031e604:	41 5e                	pop    r14
   14031e606:	41 5d                	pop    r13
   14031e608:	41 5c                	pop    r12
   14031e60a:	5f                   	pop    rdi
   14031e60b:	5e                   	pop    rsi
   14031e60c:	5d                   	pop    rbp
   14031e60d:	c3                   	ret
   14031e60e:	cc                   	int3
   14031e60f:	cc                   	int3
   14031e610:	cc                   	int3
   14031e611:	cc                   	int3
   14031e612:	cc                   	int3
   14031e613:	cc                   	int3
   14031e614:	cc                   	int3
   14031e615:	cc                   	int3
   14031e616:	cc                   	int3
   14031e617:	cc                   	int3
   14031e618:	cc                   	int3
   14031e619:	cc                   	int3
   14031e61a:	cc                   	int3
   14031e61b:	cc                   	int3
   14031e61c:	cc                   	int3
   14031e61d:	cc                   	int3
   14031e61e:	cc                   	int3
   14031e61f:	cc                   	int3
