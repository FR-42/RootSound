
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140334d50 <.text+0x333d50>:
   140334d50:	40 53                	rex push rbx
   140334d52:	55                   	push   rbp
   140334d53:	57                   	push   rdi
   140334d54:	41 55                	push   r13
   140334d56:	41 56                	push   r14
   140334d58:	41 57                	push   r15
   140334d5a:	48 81 ec 38 02 00 00 	sub    rsp,0x238
   140334d61:	48 8b 05 00 d4 63 00 	mov    rax,QWORD PTR [rip+0x63d400]        # 0x140972168
   140334d68:	48 33 c4             	xor    rax,rsp
   140334d6b:	48 89 84 24 c0 01 00 	mov    QWORD PTR [rsp+0x1c0],rax
   140334d72:	00 
   140334d73:	4c 8b b4 24 90 02 00 	mov    r14,QWORD PTR [rsp+0x290]
   140334d7a:	00 
   140334d7b:	33 db                	xor    ebx,ebx
   140334d7d:	44 0f b6 ac 24 a0 02 	movzx  r13d,BYTE PTR [rsp+0x2a0]
   140334d84:	00 00 
   140334d86:	4d 8b f9             	mov    r15,r9
   140334d89:	8b fb                	mov    edi,ebx
   140334d8b:	4d 8b d8             	mov    r11,r8
   140334d8e:	4c 89 44 24 28       	mov    QWORD PTR [rsp+0x28],r8
   140334d93:	48 8b ea             	mov    rbp,rdx
   140334d96:	66 41 89 1e          	mov    WORD PTR [r14],bx
   140334d9a:	4c 8b c9             	mov    r9,rcx
   140334d9d:	38 1d 7d 51 65 00    	cmp    BYTE PTR [rip+0x65517d],bl        # 0x140989f20
   140334da3:	48 89 4c 24 30       	mov    QWORD PTR [rsp+0x30],rcx
   140334da8:	89 7c 24 20          	mov    DWORD PTR [rsp+0x20],edi
   140334dac:	0f 84 9b 06 00 00    	je     0x14033544d
   140334db2:	48 89 b4 24 70 02 00 	mov    QWORD PTR [rsp+0x270],rsi
   140334db9:	00 
   140334dba:	4c 89 a4 24 30 02 00 	mov    QWORD PTR [rsp+0x230],r12
   140334dc1:	00 
   140334dc2:	0f 29 b4 24 20 02 00 	movaps XMMWORD PTR [rsp+0x220],xmm6
   140334dc9:	00 
   140334dca:	0f 29 bc 24 10 02 00 	movaps XMMWORD PTR [rsp+0x210],xmm7
   140334dd1:	00 
   140334dd2:	0f 57 ff             	xorps  xmm7,xmm7
   140334dd5:	44 0f 29 84 24 00 02 	movaps XMMWORD PTR [rsp+0x200],xmm8
   140334ddc:	00 00 
   140334dde:	f3 44 0f 10 05 f1 92 	movss  xmm8,DWORD PTR [rip+0x3592f1]        # 0x14068e0d8
   140334de5:	35 00 
   140334de7:	44 0f 29 8c 24 f0 01 	movaps XMMWORD PTR [rsp+0x1f0],xmm9
   140334dee:	00 00 
   140334df0:	f3 44 0f 10 0d e3 b1 	movss  xmm9,DWORD PTR [rip+0x51b1e3]        # 0x14084ffdc
   140334df7:	51 00 
   140334df9:	44 0f 29 94 24 e0 01 	movaps XMMWORD PTR [rsp+0x1e0],xmm10
   140334e00:	00 00 
   140334e02:	f2 44 0f 10 15 1d b3 	movsd  xmm10,QWORD PTR [rip+0x51b31d]        # 0x140850128
   140334e09:	51 00 
   140334e0b:	44 0f 29 9c 24 d0 01 	movaps XMMWORD PTR [rsp+0x1d0],xmm11
   140334e12:	00 00 
   140334e14:	f3 44 0f 10 1d 4f 23 	movss  xmm11,DWORD PTR [rip+0x36234f]        # 0x14069716c
   140334e1b:	36 00 
   140334e1d:	0f 1f 00             	nop    DWORD PTR [rax]
   140334e20:	41 0f b7 0e          	movzx  ecx,WORD PTR [r14]
   140334e24:	44 8b c3             	mov    r8d,ebx
   140334e27:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140334e2e:	00 00 
   140334e30:	0f b7 d1             	movzx  edx,cx
   140334e33:	45 84 ed             	test   r13b,r13b
   140334e36:	0f 84 80 00 00 00    	je     0x140334ebc
   140334e3c:	41 80 fd 01          	cmp    r13b,0x1
   140334e40:	74 5f                	je     0x140334ea1
   140334e42:	41 8d 45 fe          	lea    eax,[r13-0x2]
   140334e46:	3c 05                	cmp    al,0x5
   140334e48:	0f 87 99 05 00 00    	ja     0x1403353e7
   140334e4e:	41 80 b9 92 00 00 00 	cmp    BYTE PTR [r9+0x92],0x0
   140334e55:	00 
   140334e56:	74 18                	je     0x140334e70
   140334e58:	45 85 c0             	test   r8d,r8d
   140334e5b:	41 bc 40 00 00 00    	mov    r12d,0x40
   140334e61:	44 0f 45 e3          	cmovne r12d,ebx
   140334e65:	0f 85 7c 05 00 00    	jne    0x1403353e7
   140334e6b:	e9 85 00 00 00       	jmp    0x140334ef5
   140334e70:	66 41 83 79 14 00    	cmp    WORD PTR [r9+0x14],0x0
   140334e76:	41 8b c0             	mov    eax,r8d
   140334e79:	75 13                	jne    0x140334e8e
   140334e7b:	45 85 c0             	test   r8d,r8d
   140334e7e:	74 32                	je     0x140334eb2
   140334e80:	83 f8 01             	cmp    eax,0x1
   140334e83:	0f 85 5e 05 00 00    	jne    0x1403353e7
   140334e89:	41 b4 12             	mov    r12b,0x12
   140334e8c:	eb 67                	jmp    0x140334ef5
   140334e8e:	45 85 c0             	test   r8d,r8d
   140334e91:	74 1f                	je     0x140334eb2
   140334e93:	83 f8 01             	cmp    eax,0x1
   140334e96:	0f 85 4b 05 00 00    	jne    0x1403353e7
   140334e9c:	41 b4 40             	mov    r12b,0x40
   140334e9f:	eb 54                	jmp    0x140334ef5
   140334ea1:	41 8b c0             	mov    eax,r8d
   140334ea4:	45 85 c0             	test   r8d,r8d
   140334ea7:	74 0e                	je     0x140334eb7
   140334ea9:	83 f8 01             	cmp    eax,0x1
   140334eac:	0f 85 35 05 00 00    	jne    0x1403353e7
   140334eb2:	41 b4 11             	mov    r12b,0x11
   140334eb5:	eb 3e                	jmp    0x140334ef5
   140334eb7:	41 b4 10             	mov    r12b,0x10
   140334eba:	eb 39                	jmp    0x140334ef5
   140334ebc:	66 41 83 79 14 00    	cmp    WORD PTR [r9+0x14],0x0
   140334ec2:	41 8b c0             	mov    eax,r8d
   140334ec5:	75 18                	jne    0x140334edf
   140334ec7:	45 85 c0             	test   r8d,r8d
   140334eca:	74 26                	je     0x140334ef2
   140334ecc:	83 e8 01             	sub    eax,0x1
   140334ecf:	74 1c                	je     0x140334eed
   140334ed1:	83 f8 01             	cmp    eax,0x1
   140334ed4:	0f 85 0d 05 00 00    	jne    0x1403353e7
   140334eda:	41 b4 12             	mov    r12b,0x12
   140334edd:	eb 16                	jmp    0x140334ef5
   140334edf:	45 85 c0             	test   r8d,r8d
   140334ee2:	74 0e                	je     0x140334ef2
   140334ee4:	83 f8 01             	cmp    eax,0x1
   140334ee7:	0f 85 fa 04 00 00    	jne    0x1403353e7
   140334eed:	41 b4 02             	mov    r12b,0x2
   140334ef0:	eb 03                	jmp    0x140334ef5
   140334ef2:	41 b4 7e             	mov    r12b,0x7e
   140334ef5:	41 ff c0             	inc    r8d
   140334ef8:	44 89 44 24 24       	mov    DWORD PTR [rsp+0x24],r8d
   140334efd:	0f 1f 00             	nop    DWORD PTR [rax]
   140334f00:	33 c0                	xor    eax,eax
   140334f02:	8b f3                	mov    esi,ebx
   140334f04:	44 8b d3             	mov    r10d,ebx
   140334f07:	0f 28 f7             	movaps xmm6,xmm7
   140334f0a:	bb ff ff ff ff       	mov    ebx,0xffffffff
   140334f0f:	44 0f b7 c8          	movzx  r9d,ax
   140334f13:	66 41 3b 03          	cmp    ax,WORD PTR [r11]
   140334f17:	0f 83 a3 04 00 00    	jae    0x1403353c0
   140334f1d:	48 03 ff             	add    rdi,rdi
   140334f20:	48 8d 15 f9 4f 65 00 	lea    rdx,[rip+0x654ff9]        # 0x140989f20
   140334f27:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140334f2e:	00 00 
   140334f30:	f3 0f 10 44 fa 04    	movss  xmm0,DWORD PTR [rdx+rdi*8+0x4]
   140334f36:	45 0f b7 c1          	movzx  r8d,r9w
   140334f3a:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   140334f3f:	49 69 c0 f8 00 00 00 	imul   rax,r8,0xf8
   140334f46:	f3 0f 10 0c 28       	movss  xmm1,DWORD PTR [rax+rbp*1]
   140334f4b:	0f 2f c1             	comiss xmm0,xmm1
   140334f4e:	48 8d 0c 28          	lea    rcx,[rax+rbp*1]
   140334f52:	0f 87 b4 00 00 00    	ja     0x14033500c
   140334f58:	f3 0f 10 44 fa 08    	movss  xmm0,DWORD PTR [rdx+rdi*8+0x8]
   140334f5e:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   140334f63:	0f 2f c8             	comiss xmm1,xmm0
   140334f66:	0f 83 a0 00 00 00    	jae    0x14033500c
   140334f6c:	41 0f b6 d5          	movzx  edx,r13b
   140334f70:	48 03 c2             	add    rax,rdx
   140334f73:	44 38 a4 28 d0 00 00 	cmp    BYTE PTR [rax+rbp*1+0xd0],r12b
   140334f7a:	00 
   140334f7b:	0f 85 84 00 00 00    	jne    0x140335005
   140334f81:	49 6b c0 3e          	imul   rax,r8,0x3e
   140334f85:	48 03 c2             	add    rax,rdx
   140334f88:	44 8b 84 85 d8 00 00 	mov    r8d,DWORD PTR [rbp+rax*4+0xd8]
   140334f8f:	00 
   140334f90:	41 83 f8 ff          	cmp    r8d,0xffffffff
   140334f94:	74 6f                	je     0x140335005
   140334f96:	83 fb ff             	cmp    ebx,0xffffffff
   140334f99:	75 05                	jne    0x140334fa0
   140334f9b:	41 8b d8             	mov    ebx,r8d
   140334f9e:	eb 05                	jmp    0x140334fa5
   140334fa0:	44 3b c3             	cmp    r8d,ebx
   140334fa3:	75 60                	jne    0x140335005
   140334fa5:	c7 84 85 d8 00 00 00 	mov    DWORD PTR [rbp+rax*4+0xd8],0xffffffff
   140334fac:	ff ff ff ff 
   140334fb0:	83 fe 30             	cmp    esi,0x30
   140334fb3:	73 65                	jae    0x14033501a
   140334fb5:	f3 0f 58 71 08       	addss  xmm6,DWORD PTR [rcx+0x8]
   140334fba:	8b c6                	mov    eax,esi
   140334fbc:	ff c6                	inc    esi
   140334fbe:	83 3d e3 49 60 00 01 	cmp    DWORD PTR [rip+0x6049e3],0x1        # 0x1409399a8
   140334fc5:	48 89 4c c4 40       	mov    QWORD PTR [rsp+rax*8+0x40],rcx
   140334fca:	48 8d 04 52          	lea    rax,[rdx+rdx*2]
   140334fce:	75 0b                	jne    0x140334fdb
   140334fd0:	f3 0f 10 44 c1 14    	movss  xmm0,DWORD PTR [rcx+rax*8+0x14]
   140334fd6:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140334fd9:	eb 14                	jmp    0x140334fef
   140334fdb:	f3 0f 10 44 c1 18    	movss  xmm0,DWORD PTR [rcx+rax*8+0x18]
   140334fe1:	f3 0f 58 44 c1 14    	addss  xmm0,DWORD PTR [rcx+rax*8+0x14]
   140334fe7:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140334fea:	f2 41 0f 59 c2       	mulsd  xmm0,xmm10
   140334fef:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   140334ff3:	48 8d 15 26 4f 65 00 	lea    rdx,[rip+0x654f26]        # 0x140989f20
   140334ffa:	41 0f 2f c1          	comiss xmm0,xmm9
   140334ffe:	72 0c                	jb     0x14033500c
   140335000:	41 ff c2             	inc    r10d
   140335003:	eb 07                	jmp    0x14033500c
   140335005:	48 8d 15 14 4f 65 00 	lea    rdx,[rip+0x654f14]        # 0x140989f20
   14033500c:	66 41 ff c1          	inc    r9w
   140335010:	66 45 3b 0b          	cmp    r9w,WORD PTR [r11]
   140335014:	0f 82 16 ff ff ff    	jb     0x140334f30
   14033501a:	45 85 d2             	test   r10d,r10d
   14033501d:	0f 84 9d 03 00 00    	je     0x1403353c0
   140335023:	41 0f b7 0e          	movzx  ecx,WORD PTR [r14]
   140335027:	0f b7 c1             	movzx  eax,cx
   14033502a:	66 83 f9 60          	cmp    cx,0x60
   14033502e:	0f 83 93 03 00 00    	jae    0x1403353c7
   140335034:	0f b7 c1             	movzx  eax,cx
   140335037:	33 d2                	xor    edx,edx
   140335039:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   140335040:	41 b8 18 3c 00 00    	mov    r8d,0x3c18
   140335046:	49 03 0f             	add    rcx,QWORD PTR [r15]
   140335049:	e8 9c bc 2e 00       	call   0x140620cea
   14033504e:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   140335052:	4c 8d 15 c7 4e 65 00 	lea    r10,[rip+0x654ec7]        # 0x140989f20
   140335059:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   140335060:	49 8b 07             	mov    rax,QWORD PTR [r15]
   140335063:	f3 0f 11 74 01 08    	movss  DWORD PTR [rcx+rax*1+0x8],xmm6
   140335069:	45 0f b6 04 fa       	movzx  r8d,BYTE PTR [r10+rdi*8]
   14033506e:	41 80 f8 c0          	cmp    r8b,0xc0
   140335072:	72 51                	jb     0x1403350c5
   140335074:	0f b6 05 a5 4e 65 00 	movzx  eax,BYTE PTR [rip+0x654ea5]        # 0x140989f20
   14033507b:	33 c9                	xor    ecx,ecx
   14033507d:	84 c0                	test   al,al
   14033507f:	74 44                	je     0x1403350c5
   140335081:	49 8b d2             	mov    rdx,r10
   140335084:	41 3a c0             	cmp    al,r8b
   140335087:	74 17                	je     0x1403350a0
   140335089:	ff c1                	inc    ecx
   14033508b:	8b c1                	mov    eax,ecx
   14033508d:	48 c1 e0 04          	shl    rax,0x4
   140335091:	4a 8d 14 10          	lea    rdx,[rax+r10*1]
   140335095:	42 0f b6 04 10       	movzx  eax,BYTE PTR [rax+r10*1]
   14033509a:	84 c0                	test   al,al
   14033509c:	75 e6                	jne    0x140335084
   14033509e:	eb 25                	jmp    0x1403350c5
   1403350a0:	48 85 d2             	test   rdx,rdx
   1403350a3:	74 20                	je     0x1403350c5
   1403350a5:	f3 0f 10 4a 08       	movss  xmm1,DWORD PTR [rdx+0x8]
   1403350aa:	0f 28 d1             	movaps xmm2,xmm1
   1403350ad:	f3 0f 5c 52 04       	subss  xmm2,DWORD PTR [rdx+0x4]
   1403350b2:	f3 0f 5e 52 0c       	divss  xmm2,DWORD PTR [rdx+0xc]
   1403350b7:	f3 0f 59 d7          	mulss  xmm2,xmm7
   1403350bb:	f3 0f 58 52 04       	addss  xmm2,DWORD PTR [rdx+0x4]
   1403350c0:	0f 2f ca             	comiss xmm1,xmm2
   1403350c3:	77 03                	ja     0x1403350c8
   1403350c5:	0f 28 d7             	movaps xmm2,xmm7
   1403350c8:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403350cc:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   1403350d3:	49 8b 07             	mov    rax,QWORD PTR [r15]
   1403350d6:	f3 0f 11 14 01       	movss  DWORD PTR [rcx+rax*1],xmm2
   1403350db:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403350df:	49 8b 17             	mov    rdx,QWORD PTR [r15]
   1403350e2:	4c 69 c0 18 3c 00 00 	imul   r8,rax,0x3c18
   1403350e9:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   1403350ee:	0f b7 88 ce 00 00 00 	movzx  ecx,WORD PTR [rax+0xce]
   1403350f5:	66 41 89 4c 10 0e    	mov    WORD PTR [r8+rdx*1+0xe],cx
   1403350fb:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403350ff:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   140335106:	49 8b 07             	mov    rax,QWORD PTR [r15]
   140335109:	44 88 64 01 0c       	mov    BYTE PTR [rcx+rax*1+0xc],r12b
   14033510e:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   140335112:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   140335119:	49 8b 07             	mov    rax,QWORD PTR [r15]
   14033511c:	89 5c 01 10          	mov    DWORD PTR [rcx+rax*1+0x10],ebx
   140335120:	33 db                	xor    ebx,ebx
   140335122:	f3 49 0f 2c 44 fa 0c 	cvttss2si rax,DWORD PTR [r10+rdi*8+0xc]
   140335129:	83 f8 01             	cmp    eax,0x1
   14033512c:	0f 82 c1 00 00 00    	jb     0x1403351f3
   140335132:	44 8b cb             	mov    r9d,ebx
   140335135:	45 0f b6 04 fa       	movzx  r8d,BYTE PTR [r10+rdi*8]
   14033513a:	41 80 f8 c0          	cmp    r8b,0xc0
   14033513e:	72 5c                	jb     0x14033519c
   140335140:	0f b6 05 d9 4d 65 00 	movzx  eax,BYTE PTR [rip+0x654dd9]        # 0x140989f20
   140335147:	8b cb                	mov    ecx,ebx
   140335149:	84 c0                	test   al,al
   14033514b:	74 4f                	je     0x14033519c
   14033514d:	49 8b d2             	mov    rdx,r10
   140335150:	41 3a c0             	cmp    al,r8b
   140335153:	74 17                	je     0x14033516c
   140335155:	ff c1                	inc    ecx
   140335157:	8b c1                	mov    eax,ecx
   140335159:	48 c1 e0 04          	shl    rax,0x4
   14033515d:	4a 8d 14 10          	lea    rdx,[rax+r10*1]
   140335161:	42 0f b6 04 10       	movzx  eax,BYTE PTR [rax+r10*1]
   140335166:	84 c0                	test   al,al
   140335168:	75 e6                	jne    0x140335150
   14033516a:	eb 30                	jmp    0x14033519c
   14033516c:	48 85 d2             	test   rdx,rdx
   14033516f:	74 2b                	je     0x14033519c
   140335171:	f3 0f 10 52 08       	movss  xmm2,DWORD PTR [rdx+0x8]
   140335176:	0f 57 c0             	xorps  xmm0,xmm0
   140335179:	0f 28 da             	movaps xmm3,xmm2
   14033517c:	41 8b c1             	mov    eax,r9d
   14033517f:	f3 0f 5c 5a 04       	subss  xmm3,DWORD PTR [rdx+0x4]
   140335184:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140335189:	f3 0f 5e 5a 0c       	divss  xmm3,DWORD PTR [rdx+0xc]
   14033518e:	f3 0f 59 d8          	mulss  xmm3,xmm0
   140335192:	f3 0f 58 5a 04       	addss  xmm3,DWORD PTR [rdx+0x4]
   140335197:	0f 2f d3             	comiss xmm2,xmm3
   14033519a:	77 03                	ja     0x14033519f
   14033519c:	0f 28 df             	movaps xmm3,xmm7
   14033519f:	41 8b c1             	mov    eax,r9d
   1403351a2:	41 ff c1             	inc    r9d
   1403351a5:	48 69 d0 3c 01 00 00 	imul   rdx,rax,0x13c
   1403351ac:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403351b0:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   1403351b7:	49 8b 07             	mov    rax,QWORD PTR [r15]
   1403351ba:	48 03 ca             	add    rcx,rdx
   1403351bd:	f3 0f 11 9c 01 d8 00 	movss  DWORD PTR [rcx+rax*1+0xd8],xmm3
   1403351c4:	00 00 
   1403351c6:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403351ca:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   1403351d1:	49 8b 07             	mov    rax,QWORD PTR [r15]
   1403351d4:	48 03 ca             	add    rcx,rdx
   1403351d7:	f3 0f 11 9c 01 0c 02 	movss  DWORD PTR [rcx+rax*1+0x20c],xmm3
   1403351de:	00 00 
   1403351e0:	41 8d 49 01          	lea    ecx,[r9+0x1]
   1403351e4:	f3 49 0f 2c 44 fa 0c 	cvttss2si rax,DWORD PTR [r10+rdi*8+0xc]
   1403351eb:	3b c8                	cmp    ecx,eax
   1403351ed:	0f 86 42 ff ff ff    	jbe    0x140335135
   1403351f3:	44 0f b7 db          	movzx  r11d,bx
   1403351f7:	85 f6                	test   esi,esi
   1403351f9:	0f 84 af 01 00 00    	je     0x1403353ae
   1403351ff:	44 0f b6 0d 19 4d 65 	movzx  r9d,BYTE PTR [rip+0x654d19]        # 0x140989f20
   140335206:	00 
   140335207:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14033520e:	00 00 
   140335210:	45 0f b6 04 fa       	movzx  r8d,BYTE PTR [r10+rdi*8]
   140335215:	41 80 f8 c0          	cmp    r8b,0xc0
   140335219:	72 6e                	jb     0x140335289
   14033521b:	8b cb                	mov    ecx,ebx
   14033521d:	45 84 c9             	test   r9b,r9b
   140335220:	74 67                	je     0x140335289
   140335222:	49 8b d2             	mov    rdx,r10
   140335225:	41 0f b6 c1          	movzx  eax,r9b
   140335229:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140335230:	41 3a c0             	cmp    al,r8b
   140335233:	74 17                	je     0x14033524c
   140335235:	ff c1                	inc    ecx
   140335237:	8b c1                	mov    eax,ecx
   140335239:	48 c1 e0 04          	shl    rax,0x4
   14033523d:	4a 8d 14 10          	lea    rdx,[rax+r10*1]
   140335241:	42 0f b6 04 10       	movzx  eax,BYTE PTR [rax+r10*1]
   140335246:	84 c0                	test   al,al
   140335248:	75 e6                	jne    0x140335230
   14033524a:	eb 3d                	jmp    0x140335289
   14033524c:	48 85 d2             	test   rdx,rdx
   14033524f:	74 38                	je     0x140335289
   140335251:	f3 0f 10 4a 08       	movss  xmm1,DWORD PTR [rdx+0x8]
   140335256:	f3 0f 5c 4a 04       	subss  xmm1,DWORD PTR [rdx+0x4]
   14033525b:	45 0f b7 d3          	movzx  r10d,r11w
   14033525f:	f3 0f 5e 4a 0c       	divss  xmm1,DWORD PTR [rdx+0xc]
   140335264:	4a 8b 44 d4 40       	mov    rax,QWORD PTR [rsp+r10*8+0x40]
   140335269:	f3 0f 10 10          	movss  xmm2,DWORD PTR [rax]
   14033526d:	f3 0f 5c 52 04       	subss  xmm2,DWORD PTR [rdx+0x4]
   140335272:	f3 0f 5e d1          	divss  xmm2,xmm1
   140335276:	f3 41 0f 58 d3       	addss  xmm2,xmm11
   14033527b:	f3 0f 2c ca          	cvttss2si ecx,xmm2
   14033527f:	83 f9 01             	cmp    ecx,0x1
   140335282:	7c 05                	jl     0x140335289
   140335284:	83 f9 30             	cmp    ecx,0x30
   140335287:	76 06                	jbe    0x14033528f
   140335289:	8b cb                	mov    ecx,ebx
   14033528b:	45 0f b7 d3          	movzx  r10d,r11w
   14033528f:	8d 41 ff             	lea    eax,[rcx-0x1]
   140335292:	66 83 f8 2f          	cmp    ax,0x2f
   140335296:	0f 87 fb 00 00 00    	ja     0x140335397
   14033529c:	4e 8b 54 d4 40       	mov    r10,QWORD PTR [rsp+r10*8+0x40]
   1403352a1:	0f b7 c1             	movzx  eax,cx
   1403352a4:	49 8b 0f             	mov    rcx,QWORD PTR [r15]
   1403352a7:	4c 69 c8 3c 01 00 00 	imul   r9,rax,0x13c
   1403352ae:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403352b2:	48 69 d0 18 3c 00 00 	imul   rdx,rax,0x3c18
   1403352b9:	41 8b 42 08          	mov    eax,DWORD PTR [r10+0x8]
   1403352bd:	49 81 c1 c4 fe ff ff 	add    r9,0xfffffffffffffec4
   1403352c4:	49 03 d1             	add    rdx,r9
   1403352c7:	89 84 0a a4 01 00 00 	mov    DWORD PTR [rdx+rcx*1+0x1a4],eax
   1403352ce:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403352d2:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   1403352d9:	49 8b 07             	mov    rax,QWORD PTR [r15]
   1403352dc:	49 03 c9             	add    rcx,r9
   1403352df:	c6 84 01 cb 01 00 00 	mov    BYTE PTR [rcx+rax*1+0x1cb],0x0
   1403352e6:	00 
   1403352e7:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   1403352eb:	49 8b 0f             	mov    rcx,QWORD PTR [r15]
   1403352ee:	48 69 d0 18 3c 00 00 	imul   rdx,rax,0x3c18
   1403352f5:	41 8b 02             	mov    eax,DWORD PTR [r10]
   1403352f8:	49 03 d1             	add    rdx,r9
   1403352fb:	89 84 0a d8 00 00 00 	mov    DWORD PTR [rdx+rcx*1+0xd8],eax
   140335302:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   140335306:	41 0f 10 42 0c       	movups xmm0,XMMWORD PTR [r10+0xc]
   14033530b:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   140335312:	49 8b 07             	mov    rax,QWORD PTR [r15]
   140335315:	49 03 c9             	add    rcx,r9
   140335318:	0f 11 84 01 fc 01 00 	movups XMMWORD PTR [rcx+rax*1+0x1fc],xmm0
   14033531f:	00 
   140335320:	f2 41 0f 10 4a 1c    	movsd  xmm1,QWORD PTR [r10+0x1c]
   140335326:	f2 0f 11 8c 01 0c 02 	movsd  QWORD PTR [rcx+rax*1+0x20c],xmm1
   14033532d:	00 00 
   14033532f:	4d 8b 07             	mov    r8,QWORD PTR [r15]
   140335332:	41 0f b6 c5          	movzx  eax,r13b
   140335336:	48 8d 14 40          	lea    rdx,[rax+rax*2]
   14033533a:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   14033533e:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   140335345:	41 8b 44 d2 14       	mov    eax,DWORD PTR [r10+rdx*8+0x14]
   14033534a:	49 03 c9             	add    rcx,r9
   14033534d:	42 89 84 01 04 02 00 	mov    DWORD PTR [rcx+r8*1+0x204],eax
   140335354:	00 
   140335355:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   140335359:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   140335360:	41 8b 44 d2 18       	mov    eax,DWORD PTR [r10+rdx*8+0x18]
   140335365:	49 03 c9             	add    rcx,r9
   140335368:	42 89 84 01 08 02 00 	mov    DWORD PTR [rcx+r8*1+0x208],eax
   14033536f:	00 
   140335370:	41 0f b7 06          	movzx  eax,WORD PTR [r14]
   140335374:	48 69 c8 18 3c 00 00 	imul   rcx,rax,0x3c18
   14033537b:	41 0f b7 82 ce 00 00 	movzx  eax,WORD PTR [r10+0xce]
   140335382:	00 
   140335383:	49 03 c9             	add    rcx,r9
   140335386:	66 42 89 84 01 c8 01 	mov    WORD PTR [rcx+r8*1+0x1c8],ax
   14033538d:	00 00 
   14033538f:	44 0f b6 0d 89 4b 65 	movzx  r9d,BYTE PTR [rip+0x654b89]        # 0x140989f20
   140335396:	00 
   140335397:	66 41 ff c3          	inc    r11w
   14033539b:	4c 8d 15 7e 4b 65 00 	lea    r10,[rip+0x654b7e]        # 0x140989f20
   1403353a2:	41 0f b7 c3          	movzx  eax,r11w
   1403353a6:	3b c6                	cmp    eax,esi
   1403353a8:	0f 82 62 fe ff ff    	jb     0x140335210
   1403353ae:	66 41 ff 06          	inc    WORD PTR [r14]
   1403353b2:	4c 8b 5c 24 28       	mov    r11,QWORD PTR [rsp+0x28]
   1403353b7:	8b 7c 24 20          	mov    edi,DWORD PTR [rsp+0x20]
   1403353bb:	e9 40 fb ff ff       	jmp    0x140334f00
   1403353c0:	41 0f b7 0e          	movzx  ecx,WORD PTR [r14]
   1403353c4:	0f b7 c1             	movzx  eax,cx
   1403353c7:	44 8b 44 24 24       	mov    r8d,DWORD PTR [rsp+0x24]
   1403353cc:	0f b7 d1             	movzx  edx,cx
   1403353cf:	8b 7c 24 20          	mov    edi,DWORD PTR [rsp+0x20]
   1403353d3:	bb 00 00 00 00       	mov    ebx,0x0
   1403353d8:	4c 8b 4c 24 30       	mov    r9,QWORD PTR [rsp+0x30]
   1403353dd:	66 83 f8 60          	cmp    ax,0x60
   1403353e1:	0f 85 49 fa ff ff    	jne    0x140334e30
   1403353e7:	66 83 fa 60          	cmp    dx,0x60
   1403353eb:	74 1c                	je     0x140335409
   1403353ed:	ff c7                	inc    edi
   1403353ef:	48 8d 0d 2a 4b 65 00 	lea    rcx,[rip+0x654b2a]        # 0x140989f20
   1403353f6:	8b c7                	mov    eax,edi
   1403353f8:	48 03 c0             	add    rax,rax
   1403353fb:	89 7c 24 20          	mov    DWORD PTR [rsp+0x20],edi
   1403353ff:	80 3c c1 00          	cmp    BYTE PTR [rcx+rax*8],0x0
   140335403:	0f 85 17 fa ff ff    	jne    0x140334e20
   140335409:	44 0f 28 94 24 e0 01 	movaps xmm10,XMMWORD PTR [rsp+0x1e0]
   140335410:	00 00 
   140335412:	44 0f 28 8c 24 f0 01 	movaps xmm9,XMMWORD PTR [rsp+0x1f0]
   140335419:	00 00 
   14033541b:	44 0f 28 84 24 00 02 	movaps xmm8,XMMWORD PTR [rsp+0x200]
   140335422:	00 00 
   140335424:	0f 28 bc 24 10 02 00 	movaps xmm7,XMMWORD PTR [rsp+0x210]
   14033542b:	00 
   14033542c:	0f 28 b4 24 20 02 00 	movaps xmm6,XMMWORD PTR [rsp+0x220]
   140335433:	00 
   140335434:	4c 8b a4 24 30 02 00 	mov    r12,QWORD PTR [rsp+0x230]
   14033543b:	00 
   14033543c:	48 8b b4 24 70 02 00 	mov    rsi,QWORD PTR [rsp+0x270]
   140335443:	00 
   140335444:	44 0f 28 9c 24 d0 01 	movaps xmm11,XMMWORD PTR [rsp+0x1d0]
   14033544b:	00 00 
   14033544d:	48 8b 8c 24 c0 01 00 	mov    rcx,QWORD PTR [rsp+0x1c0]
   140335454:	00 
   140335455:	48 33 cc             	xor    rcx,rsp
   140335458:	e8 a3 61 2e 00       	call   0x14061b600
   14033545d:	48 81 c4 38 02 00 00 	add    rsp,0x238
   140335464:	41 5f                	pop    r15
   140335466:	41 5e                	pop    r14
   140335468:	41 5d                	pop    r13
   14033546a:	5f                   	pop    rdi
   14033546b:	5d                   	pop    rbp
   14033546c:	5b                   	pop    rbx
   14033546d:	c3                   	ret
   14033546e:	cc                   	int3
   14033546f:	cc                   	int3
   140335470:	cc                   	int3
   140335471:	cc                   	int3
   140335472:	cc                   	int3
   140335473:	cc                   	int3
   140335474:	cc                   	int3
   140335475:	cc                   	int3
   140335476:	cc                   	int3
   140335477:	cc                   	int3
   140335478:	cc                   	int3
   140335479:	cc                   	int3
   14033547a:	cc                   	int3
   14033547b:	cc                   	int3
   14033547c:	cc                   	int3
   14033547d:	cc                   	int3
   14033547e:	cc                   	int3
   14033547f:	cc                   	int3
