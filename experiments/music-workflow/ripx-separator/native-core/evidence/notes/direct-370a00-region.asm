
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140370a00 <.text+0x36fa00>:
   140370a00:	88 54 24 10          	mov    BYTE PTR [rsp+0x10],dl
   140370a04:	48 89 4c 24 08       	mov    QWORD PTR [rsp+0x8],rcx
   140370a09:	55                   	push   rbp
   140370a0a:	41 54                	push   r12
   140370a0c:	48 8d ac 24 48 ff ff 	lea    rbp,[rsp-0xb8]
   140370a13:	ff 
   140370a14:	48 81 ec b8 01 00 00 	sub    rsp,0x1b8
   140370a1b:	80 3d af 56 b9 14 00 	cmp    BYTE PTR [rip+0x14b956af],0x0        # 0x154f060d1
   140370a22:	4c 8b e1             	mov    r12,rcx
   140370a25:	75 16                	jne    0x140370a3d
   140370a27:	80 3d a2 56 b9 14 00 	cmp    BYTE PTR [rip+0x14b956a2],0x0        # 0x154f060d0
   140370a2e:	75 0d                	jne    0x140370a3d
   140370a30:	b0 01                	mov    al,0x1
   140370a32:	48 81 c4 b8 01 00 00 	add    rsp,0x1b8
   140370a39:	41 5c                	pop    r12
   140370a3b:	5d                   	pop    rbp
   140370a3c:	c3                   	ret
   140370a3d:	8b 01                	mov    eax,DWORD PTR [rcx]
   140370a3f:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140370a46:	48 89 9c 24 b0 01 00 	mov    QWORD PTR [rsp+0x1b0],rbx
   140370a4d:	00 
   140370a4e:	48 89 bc 24 a0 01 00 	mov    QWORD PTR [rsp+0x1a0],rdi
   140370a55:	00 
   140370a56:	48 8d 3d a3 f5 c8 ff 	lea    rdi,[rip+0xffffffffffc8f5a3]        # 0x140000000
   140370a5d:	8b 84 39 d8 a5 98 00 	mov    eax,DWORD PTR [rcx+rdi*1+0x98a5d8]
   140370a64:	05 00 04 00 00       	add    eax,0x400
   140370a69:	3b 84 39 dc a5 98 00 	cmp    eax,DWORD PTR [rcx+rdi*1+0x98a5dc]
   140370a70:	76 29                	jbe    0x140370a9b
   140370a72:	e8 99 a5 ef ff       	call   0x14026b010
   140370a77:	41 8b 0c 24          	mov    ecx,DWORD PTR [r12]
   140370a7b:	33 d2                	xor    edx,edx
   140370a7d:	41 b8 00 04 00 00    	mov    r8d,0x400
   140370a83:	e8 38 4c fe ff       	call   0x1403556c0
   140370a88:	0f b6 d8             	movzx  ebx,al
   140370a8b:	e8 c0 a5 ef ff       	call   0x14026b050
   140370a90:	84 db                	test   bl,bl
   140370a92:	75 07                	jne    0x140370a9b
   140370a94:	32 c0                	xor    al,al
   140370a96:	e9 ae 1c 00 00       	jmp    0x140372749
   140370a9b:	48 8b 0d 66 58 b9 14 	mov    rcx,QWORD PTR [rip+0x14b95866]        # 0x154f06308
   140370aa2:	ba ff ff ff ff       	mov    edx,0xffffffff
   140370aa7:	48 89 b4 24 a8 01 00 	mov    QWORD PTR [rsp+0x1a8],rsi
   140370aae:	00 
   140370aaf:	4c 89 ac 24 98 01 00 	mov    QWORD PTR [rsp+0x198],r13
   140370ab6:	00 
   140370ab7:	4c 89 b4 24 90 01 00 	mov    QWORD PTR [rsp+0x190],r14
   140370abe:	00 
   140370abf:	4c 89 bc 24 88 01 00 	mov    QWORD PTR [rsp+0x188],r15
   140370ac6:	00 
   140370ac7:	44 0f 29 8c 24 40 01 	movaps XMMWORD PTR [rsp+0x140],xmm9
   140370ace:	00 00 
   140370ad0:	44 0f 29 bc 24 e0 00 	movaps XMMWORD PTR [rsp+0xe0],xmm15
   140370ad7:	00 00 
   140370ad9:	ff 15 71 7b 31 00    	call   QWORD PTR [rip+0x317b71]        # 0x140688650
   140370adf:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   140370ae3:	f3 0f 10 05 b5 d6 31 	movss  xmm0,DWORD PTR [rip+0x31d6b5]        # 0x14068e1a0
   140370aea:	00 
   140370aeb:	41 8b 5c 24 08       	mov    ebx,DWORD PTR [r12+0x8]
   140370af0:	41 2b 5c 24 04       	sub    ebx,DWORD PTR [r12+0x4]
   140370af5:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140370afc:	b8 08 00 00 00       	mov    eax,0x8
   140370b01:	89 5c 24 38          	mov    DWORD PTR [rsp+0x38],ebx
   140370b05:	f3 0f 5e 84 39 20 37 	divss  xmm0,DWORD PTR [rcx+rdi*1+0x9c3720]
   140370b0c:	9c 00 
   140370b0e:	f3 48 0f 2c f8       	cvttss2si rdi,xmm0
   140370b13:	8b cf                	mov    ecx,edi
   140370b15:	48 f7 e1             	mul    rcx
   140370b18:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   140370b1f:	48 89 7d a0          	mov    QWORD PTR [rbp-0x60],rdi
   140370b23:	48 0f 40 c1          	cmovo  rax,rcx
   140370b27:	48 8b c8             	mov    rcx,rax
   140370b2a:	e8 31 aa 2a 00       	call   0x14061b560
   140370b2f:	41 8b 4c 24 08       	mov    ecx,DWORD PTR [r12+0x8]
   140370b34:	45 33 ed             	xor    r13d,r13d
   140370b37:	41 2b 4c 24 04       	sub    ecx,DWORD PTR [r12+0x4]
   140370b3c:	4c 8b f0             	mov    r14,rax
   140370b3f:	4d 8b 44 24 38       	mov    r8,QWORD PTR [r12+0x38]
   140370b44:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   140370b49:	85 c9                	test   ecx,ecx
   140370b4b:	7e 45                	jle    0x140370b92
   140370b4d:	49 81 c0 00 52 04 00 	add    r8,0x45200
   140370b54:	44 8b c9             	mov    r9d,ecx
   140370b57:	41 ba fe ff 00 00    	mov    r10d,0xfffe
   140370b5d:	0f 1f 00             	nop    DWORD PTR [rax]
   140370b60:	41 8b d5             	mov    edx,r13d
   140370b63:	45 38 28             	cmp    BYTE PTR [r8],r13b
   140370b66:	76 1d                	jbe    0x140370b85
   140370b68:	49 8d 88 04 ae fb ff 	lea    rcx,[r8-0x451fc]
   140370b6f:	90                   	nop
   140370b70:	66 44 21 11          	and    WORD PTR [rcx],r10w
   140370b74:	48 8d 89 e0 09 00 00 	lea    rcx,[rcx+0x9e0]
   140370b7b:	41 0f b6 00          	movzx  eax,BYTE PTR [r8]
   140370b7f:	ff c2                	inc    edx
   140370b81:	3b d0                	cmp    edx,eax
   140370b83:	7c eb                	jl     0x140370b70
   140370b85:	49 81 c0 08 52 04 00 	add    r8,0x45208
   140370b8c:	49 83 e9 01          	sub    r9,0x1
   140370b90:	75 ce                	jne    0x140370b60
   140370b92:	b9 00 10 00 00       	mov    ecx,0x1000
   140370b97:	e8 c4 a9 2a 00       	call   0x14061b560
   140370b9c:	41 8b 0c 24          	mov    ecx,DWORD PTR [r12]
   140370ba0:	4c 8d 44 24 50       	lea    r8,[rsp+0x50]
   140370ba5:	48 69 d1 78 ab 06 00 	imul   rdx,rcx,0x6ab78
   140370bac:	45 0f 57 c9          	xorps  xmm9,xmm9
   140370bb0:	45 0f 57 ff          	xorps  xmm15,xmm15
   140370bb4:	48 8b f0             	mov    rsi,rax
   140370bb7:	48 89 45 90          	mov    QWORD PTR [rbp-0x70],rax
   140370bbb:	48 8d 05 3e f4 c8 ff 	lea    rax,[rip+0xffffffffffc8f43e]        # 0x140000000
   140370bc2:	44 89 6d 80          	mov    DWORD PTR [rbp-0x80],r13d
   140370bc6:	45 8b fd             	mov    r15d,r13d
   140370bc9:	44 89 6c 24 60       	mov    DWORD PTR [rsp+0x60],r13d
   140370bce:	44 8b cf             	mov    r9d,edi
   140370bd1:	49 8b cc             	mov    rcx,r12
   140370bd4:	44 8b ac 02 d8 a5 98 	mov    r13d,DWORD PTR [rdx+rax*1+0x98a5d8]
   140370bdb:	00 
   140370bdc:	48 8d 45 80          	lea    rax,[rbp-0x80]
   140370be0:	49 8b d6             	mov    rdx,r14
   140370be3:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140370be8:	44 89 6c 24 30       	mov    DWORD PTR [rsp+0x30],r13d
   140370bed:	e8 fe ee ff ff       	call   0x14036faf0
   140370bf2:	89 44 24 5c          	mov    DWORD PTR [rsp+0x5c],eax
   140370bf6:	8b f8                	mov    edi,eax
   140370bf8:	83 f8 ff             	cmp    eax,0xffffffff
   140370bfb:	0f 84 c5 19 00 00    	je     0x1403725c6
   140370c01:	0f 29 b4 24 70 01 00 	movaps XMMWORD PTR [rsp+0x170],xmm6
   140370c08:	00 
   140370c09:	0f 57 f6             	xorps  xmm6,xmm6
   140370c0c:	0f 29 bc 24 60 01 00 	movaps XMMWORD PTR [rsp+0x160],xmm7
   140370c13:	00 
   140370c14:	f3 0f 10 3d 14 f4 4d 	movss  xmm7,DWORD PTR [rip+0x4df414]        # 0x140850030
   140370c1b:	00 
   140370c1c:	44 0f 29 94 24 30 01 	movaps XMMWORD PTR [rsp+0x130],xmm10
   140370c23:	00 00 
   140370c25:	f3 44 0f 10 15 86 d5 	movss  xmm10,DWORD PTR [rip+0x31d586]        # 0x14068e1b4
   140370c2c:	31 00 
   140370c2e:	44 0f 29 9c 24 20 01 	movaps XMMWORD PTR [rsp+0x120],xmm11
   140370c35:	00 00 
   140370c37:	f3 44 0f 10 1d 9c f3 	movss  xmm11,DWORD PTR [rip+0x4df39c]        # 0x14084ffdc
   140370c3e:	4d 00 
   140370c40:	44 0f 29 a4 24 10 01 	movaps XMMWORD PTR [rsp+0x110],xmm12
   140370c47:	00 00 
   140370c49:	f3 44 0f 10 a5 e0 00 	movss  xmm12,DWORD PTR [rbp+0xe0]
   140370c50:	00 00 
   140370c52:	44 0f 29 ac 24 00 01 	movaps XMMWORD PTR [rsp+0x100],xmm13
   140370c59:	00 00 
   140370c5b:	f2 44 0f 10 2d 9c d4 	movsd  xmm13,QWORD PTR [rip+0x31d49c]        # 0x14068e100
   140370c62:	31 00 
   140370c64:	44 0f 29 b4 24 f0 00 	movaps XMMWORD PTR [rsp+0xf0],xmm14
   140370c6b:	00 00 
   140370c6d:	f3 44 0f 10 35 62 d4 	movss  xmm14,DWORD PTR [rip+0x31d462]        # 0x14068e0d8
   140370c74:	31 00 
   140370c76:	44 0f 29 84 24 50 01 	movaps XMMWORD PTR [rsp+0x150],xmm8
   140370c7d:	00 00 
   140370c7f:	90                   	nop
   140370c80:	3b fb                	cmp    edi,ebx
   140370c82:	0f 8d ef 18 00 00    	jge    0x140372577
   140370c88:	44 8b 6c 24 50       	mov    r13d,DWORD PTR [rsp+0x50]
   140370c8d:	33 f6                	xor    esi,esi
   140370c8f:	44 89 6c 24 58       	mov    DWORD PTR [rsp+0x58],r13d
   140370c94:	8b ce                	mov    ecx,esi
   140370c96:	44 8b c6             	mov    r8d,esi
   140370c99:	45 85 ed             	test   r13d,r13d
   140370c9c:	7e 27                	jle    0x140370cc5
   140370c9e:	49 8b d6             	mov    rdx,r14
   140370ca1:	45 8b cd             	mov    r9d,r13d
   140370ca4:	48 39 32             	cmp    QWORD PTR [rdx],rsi
   140370ca7:	74 10                	je     0x140370cb9
   140370ca9:	ff c1                	inc    ecx
   140370cab:	41 3b c8             	cmp    ecx,r8d
   140370cae:	8b c1                	mov    eax,ecx
   140370cb0:	41 0f 46 c0          	cmovbe eax,r8d
   140370cb4:	44 8b c0             	mov    r8d,eax
   140370cb7:	eb 02                	jmp    0x140370cbb
   140370cb9:	8b ce                	mov    ecx,esi
   140370cbb:	48 83 c2 08          	add    rdx,0x8
   140370cbf:	49 83 e9 01          	sub    r9,0x1
   140370cc3:	75 df                	jne    0x140370ca4
   140370cc5:	42 8d 04 2f          	lea    eax,[rdi+r13*1]
   140370cc9:	3b c3                	cmp    eax,ebx
   140370ccb:	7c 10                	jl     0x140370cdd
   140370ccd:	44 8b eb             	mov    r13d,ebx
   140370cd0:	44 2b ef             	sub    r13d,edi
   140370cd3:	44 89 6c 24 58       	mov    DWORD PTR [rsp+0x58],r13d
   140370cd8:	44 89 6c 24 50       	mov    DWORD PTR [rsp+0x50],r13d
   140370cdd:	45 85 ed             	test   r13d,r13d
   140370ce0:	0f 84 7d 18 00 00    	je     0x140372563
   140370ce6:	41 8d 4d ff          	lea    ecx,[r13-0x1]
   140370cea:	49 39 34 ce          	cmp    QWORD PTR [r14+rcx*8],rsi
   140370cee:	75 0b                	jne    0x140370cfb
   140370cf0:	89 4c 24 50          	mov    DWORD PTR [rsp+0x50],ecx
   140370cf4:	44 8b e9             	mov    r13d,ecx
   140370cf7:	85 c9                	test   ecx,ecx
   140370cf9:	75 eb                	jne    0x140370ce6
   140370cfb:	44 89 6c 24 58       	mov    DWORD PTR [rsp+0x58],r13d
   140370d00:	45 85 ed             	test   r13d,r13d
   140370d03:	0f 84 5a 18 00 00    	je     0x140372563
   140370d09:	45 85 c0             	test   r8d,r8d
   140370d0c:	0f 84 51 18 00 00    	je     0x140372563
   140370d12:	b9 c0 02 00 00       	mov    ecx,0x2c0
   140370d17:	e8 34 a9 2a 00       	call   0x14061b650
   140370d1c:	48 8b d8             	mov    rbx,rax
   140370d1f:	48 85 c0             	test   rax,rax
   140370d22:	74 12                	je     0x140370d36
   140370d24:	33 d2                	xor    edx,edx
   140370d26:	41 b8 c0 02 00 00    	mov    r8d,0x2c0
   140370d2c:	48 8b c8             	mov    rcx,rax
   140370d2f:	e8 b6 ff 2a 00       	call   0x140620cea
   140370d34:	eb 03                	jmp    0x140370d39
   140370d36:	48 8b de             	mov    rbx,rsi
   140370d39:	49 8b 06             	mov    rax,QWORD PTR [r14]
   140370d3c:	66 39 70 04          	cmp    WORD PTR [rax+0x4],si
   140370d40:	7d 05                	jge    0x140370d47
   140370d42:	41 b7 01             	mov    r15b,0x1
   140370d45:	eb 0f                	jmp    0x140370d56
   140370d47:	44 0f b6 3d ad 8c 5c 	movzx  r15d,BYTE PTR [rip+0x5c8cad]        # 0x1409399fc
   140370d4e:	00 
   140370d4f:	44 02 3d aa 8c 5c 00 	add    r15b,BYTE PTR [rip+0x5c8caa]        # 0x140939a00
   140370d56:	41 0f b6 d7          	movzx  edx,r15b
   140370d5a:	48 8d 4d a8          	lea    rcx,[rbp-0x58]
   140370d5e:	41 b8 30 00 00 00    	mov    r8d,0x30
   140370d64:	44 88 bd e8 00 00 00 	mov    BYTE PTR [rbp+0xe8],r15b
   140370d6b:	e8 7a ff 2a 00       	call   0x140620cea
   140370d70:	4c 8d 4d a8          	lea    r9,[rbp-0x58]
   140370d74:	41 b0 30             	mov    r8b,0x30
   140370d77:	41 8b d5             	mov    edx,r13d
   140370d7a:	48 8b cb             	mov    rcx,rbx
   140370d7d:	e8 0e 96 ff ff       	call   0x14036a390
   140370d82:	84 c0                	test   al,al
   140370d84:	0f 84 32 0b 00 00    	je     0x1403718bc
   140370d8a:	41 8b 4c 24 04       	mov    ecx,DWORD PTR [r12+0x4]
   140370d8f:	42 8d 04 2f          	lea    eax,[rdi+r13*1]
   140370d93:	03 cf                	add    ecx,edi
   140370d95:	0f 28 c7             	movaps xmm0,xmm7
   140370d98:	89 0b                	mov    DWORD PTR [rbx],ecx
   140370d9a:	45 33 db             	xor    r11d,r11d
   140370d9d:	41 03 44 24 04       	add    eax,DWORD PTR [r12+0x4]
   140370da2:	89 43 04             	mov    DWORD PTR [rbx+0x4],eax
   140370da5:	f3 0f 5e 05 ff 93 61 	divss  xmm0,DWORD PTR [rip+0x6193ff]        # 0x14098a1ac
   140370dac:	00 
   140370dad:	f3 0f 11 83 7c 02 00 	movss  DWORD PTR [rbx+0x27c],xmm0
   140370db4:	00 
   140370db5:	48 c7 43 20 ff ff 00 	mov    QWORD PTR [rbx+0x20],0xffff
   140370dbc:	00 
   140370dbd:	48 c7 43 28 ff ff 00 	mov    QWORD PTR [rbx+0x28],0xffff
   140370dc4:	00 
   140370dc5:	48 c7 43 30 ff ff 00 	mov    QWORD PTR [rbx+0x30],0xffff
   140370dcc:	00 
   140370dcd:	48 c7 43 38 ff ff 00 	mov    QWORD PTR [rbx+0x38],0xffff
   140370dd4:	00 
   140370dd5:	48 c7 43 40 ff ff 00 	mov    QWORD PTR [rbx+0x40],0xffff
   140370ddc:	00 
   140370ddd:	48 c7 43 48 ff ff 00 	mov    QWORD PTR [rbx+0x48],0xffff
   140370de4:	00 
   140370de5:	48 c7 43 50 ff ff 00 	mov    QWORD PTR [rbx+0x50],0xffff
   140370dec:	00 
   140370ded:	48 c7 43 58 ff ff 00 	mov    QWORD PTR [rbx+0x58],0xffff
   140370df4:	00 
   140370df5:	49 8b 06             	mov    rax,QWORD PTR [r14]
   140370df8:	66 39 70 04          	cmp    WORD PTR [rax+0x4],si
   140370dfc:	7d 46                	jge    0x140370e44
   140370dfe:	0f b7 83 1c 02 00 00 	movzx  eax,WORD PTR [rbx+0x21c]
   140370e05:	b9 00 80 00 00       	mov    ecx,0x8000
   140370e0a:	66 0b c1             	or     ax,cx
   140370e0d:	66 89 83 1c 02 00 00 	mov    WORD PTR [rbx+0x21c],ax
   140370e14:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   140370e17:	f6 41 04 04          	test   BYTE PTR [rcx+0x4],0x4
   140370e1b:	74 0e                	je     0x140370e2b
   140370e1d:	66 83 c8 40          	or     ax,0x40
   140370e21:	66 89 83 1c 02 00 00 	mov    WORD PTR [rbx+0x21c],ax
   140370e28:	49 8b 0e             	mov    rcx,QWORD PTR [r14]
   140370e2b:	0f b6 91 cd 09 00 00 	movzx  edx,BYTE PTR [rcx+0x9cd]
   140370e32:	49 8b cc             	mov    rcx,r12
   140370e35:	e8 06 1d 01 00       	call   0x140382b40
   140370e3a:	66 89 43 20          	mov    WORD PTR [rbx+0x20],ax
   140370e3e:	45 33 db             	xor    r11d,r11d
   140370e41:	49 8b 06             	mov    rax,QWORD PTR [r14]
   140370e44:	8b 80 d0 09 00 00    	mov    eax,DWORD PTR [rax+0x9d0]
   140370e4a:	0f 28 d6             	movaps xmm2,xmm6
   140370e4d:	89 83 2c 02 00 00    	mov    DWORD PTR [rbx+0x22c],eax
   140370e53:	41 0f 28 d9          	movaps xmm3,xmm9
   140370e57:	49 8b 06             	mov    rax,QWORD PTR [r14]
   140370e5a:	45 8b d3             	mov    r10d,r11d
   140370e5d:	8b 88 d8 09 00 00    	mov    ecx,DWORD PTR [rax+0x9d8]
   140370e63:	89 8b 20 02 00 00    	mov    DWORD PTR [rbx+0x220],ecx
   140370e69:	89 b3 68 02 00 00    	mov    DWORD PTR [rbx+0x268],esi
   140370e6f:	4c 89 9b 60 02 00 00 	mov    QWORD PTR [rbx+0x260],r11
   140370e76:	45 85 ed             	test   r13d,r13d
   140370e79:	0f 8e ee 00 00 00    	jle    0x140370f6d
   140370e7f:	49 8b d3             	mov    rdx,r11
   140370e82:	4d 8b c6             	mov    r8,r14
   140370e85:	49 8b 00             	mov    rax,QWORD PTR [r8]
   140370e88:	48 85 c0             	test   rax,rax
   140370e8b:	75 3f                	jne    0x140370ecc
   140370e8d:	45 85 d2             	test   r10d,r10d
   140370e90:	7e 28                	jle    0x140370eba
   140370e92:	66 39 b3 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],si
   140370e99:	0f 8c a7 00 00 00    	jl     0x140370f46
   140370e9f:	48 8b 4b 08          	mov    rcx,QWORD PTR [rbx+0x8]
   140370ea3:	8b 44 11 fc          	mov    eax,DWORD PTR [rcx+rdx*1-0x4]
   140370ea7:	89 04 11             	mov    DWORD PTR [rcx+rdx*1],eax
   140370eaa:	48 8b 4b 10          	mov    rcx,QWORD PTR [rbx+0x10]
   140370eae:	8b 44 0a fc          	mov    eax,DWORD PTR [rdx+rcx*1-0x4]
   140370eb2:	89 04 0a             	mov    DWORD PTR [rdx+rcx*1],eax
   140370eb5:	e9 8c 00 00 00       	jmp    0x140370f46
   140370eba:	48 8b 43 08          	mov    rax,QWORD PTR [rbx+0x8]
   140370ebe:	44 89 1c 02          	mov    DWORD PTR [rdx+rax*1],r11d
   140370ec2:	48 8b 43 10          	mov    rax,QWORD PTR [rbx+0x10]
   140370ec6:	44 89 1c 02          	mov    DWORD PTR [rdx+rax*1],r11d
   140370eca:	eb 7a                	jmp    0x140370f46
   140370ecc:	45 85 d2             	test   r10d,r10d
   140370ecf:	74 09                	je     0x140370eda
   140370ed1:	66 39 b3 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],si
   140370ed8:	7c 1b                	jl     0x140370ef5
   140370eda:	48 8b 4b 08          	mov    rcx,QWORD PTR [rbx+0x8]
   140370ede:	8b 00                	mov    eax,DWORD PTR [rax]
   140370ee0:	89 04 0a             	mov    DWORD PTR [rdx+rcx*1],eax
   140370ee3:	4c 8b 4b 10          	mov    r9,QWORD PTR [rbx+0x10]
   140370ee7:	4d 85 c9             	test   r9,r9
   140370eea:	74 09                	je     0x140370ef5
   140370eec:	49 8b 00             	mov    rax,QWORD PTR [r8]
   140370eef:	8b 08                	mov    ecx,DWORD PTR [rax]
   140370ef1:	41 89 0c 11          	mov    DWORD PTR [r9+rdx*1],ecx
   140370ef5:	49 8b 00             	mov    rax,QWORD PTR [r8]
   140370ef8:	66 83 48 04 01       	or     WORD PTR [rax+0x4],0x1
   140370efd:	66 39 b3 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],si
   140370f04:	7c 40                	jl     0x140370f46
   140370f06:	4d 8b 08             	mov    r9,QWORD PTR [r8]
   140370f09:	41 0f 28 c9          	movaps xmm1,xmm9
   140370f0d:	b9 30 00 00 00       	mov    ecx,0x30
   140370f12:	49 8d 41 10          	lea    rax,[r9+0x10]
   140370f16:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140370f1d:	00 00 00 
   140370f20:	f3 0f 58 08          	addss  xmm1,DWORD PTR [rax]
   140370f24:	48 83 c0 34          	add    rax,0x34
   140370f28:	48 83 e9 01          	sub    rcx,0x1
   140370f2c:	75 f2                	jne    0x140370f20
   140370f2e:	0f 28 c1             	movaps xmm0,xmm1
   140370f31:	f3 0f 58 d9          	addss  xmm3,xmm1
   140370f35:	f3 41 0f 59 81 c8 09 	mulss  xmm0,DWORD PTR [r9+0x9c8]
   140370f3c:	00 00 
   140370f3e:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140370f42:	f2 0f 58 d0          	addsd  xmm2,xmm0
   140370f46:	41 ff c2             	inc    r10d
   140370f49:	48 83 c2 04          	add    rdx,0x4
   140370f4d:	49 83 c0 08          	add    r8,0x8
   140370f51:	45 3b d5             	cmp    r10d,r13d
   140370f54:	0f 8c 2b ff ff ff    	jl     0x140370e85
   140370f5a:	41 0f 2e d9          	ucomiss xmm3,xmm9
   140370f5e:	7a 02                	jp     0x140370f62
   140370f60:	74 0b                	je     0x140370f6d
   140370f62:	0f 57 c0             	xorps  xmm0,xmm0
   140370f65:	f3 0f 5a c3          	cvtss2sd xmm0,xmm3
   140370f69:	f2 0f 5e d0          	divsd  xmm2,xmm0
   140370f6d:	0f 57 c0             	xorps  xmm0,xmm0
   140370f70:	40 88 73 60          	mov    BYTE PTR [rbx+0x60],sil
   140370f74:	f2 0f 5a c2          	cvtsd2ss xmm0,xmm2
   140370f78:	41 8b d3             	mov    edx,r11d
   140370f7b:	4c 8d 63 61          	lea    r12,[rbx+0x61]
   140370f7f:	89 54 24 68          	mov    DWORD PTR [rsp+0x68],edx
   140370f83:	f3 0f 11 83 18 02 00 	movss  DWORD PTR [rbx+0x218],xmm0
   140370f8a:	00 
   140370f8b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140370f90:	44 0f b6 53 60       	movzx  r10d,BYTE PTR [rbx+0x60]
   140370f95:	41 8b f3             	mov    esi,r11d
   140370f98:	44 89 5c 24 34       	mov    DWORD PTR [rsp+0x34],r11d
   140370f9d:	49 8b fb             	mov    rdi,r11
   140370fa0:	4c 89 5c 24 48       	mov    QWORD PTR [rsp+0x48],r11
   140370fa5:	41 8d 42 01          	lea    eax,[r10+0x1]
   140370fa9:	88 43 60             	mov    BYTE PTR [rbx+0x60],al
   140370fac:	47 88 3c 14          	mov    BYTE PTR [r12+r10*1],r15b
   140370fb0:	45 85 ed             	test   r13d,r13d
   140370fb3:	0f 8e 36 07 00 00    	jle    0x1403716ef
   140370fb9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140370fc0:	49 8b 0c fe          	mov    rcx,QWORD PTR [r14+rdi*8]
   140370fc4:	48 85 c9             	test   rcx,rcx
   140370fc7:	0f 84 71 02 00 00    	je     0x14037123e
   140370fcd:	0f b6 81 cc 09 00 00 	movzx  eax,BYTE PTR [rcx+0x9cc]
   140370fd4:	3b d0                	cmp    edx,eax
   140370fd6:	0f 8d 62 02 00 00    	jge    0x14037123e
   140370fdc:	48 63 c2             	movsxd rax,edx
   140370fdf:	4c 6b e0 34          	imul   r12,rax,0x34
   140370fe3:	45 0f b6 44 0c 38    	movzx  r8d,BYTE PTR [r12+rcx*1+0x38]
   140370fe9:	45 3a c7             	cmp    r8b,r15b
   140370fec:	73 2f                	jae    0x14037101d
   140370fee:	41 0f b6 d0          	movzx  edx,r8b
   140370ff2:	41 0f b6 c7          	movzx  eax,r15b
   140370ff6:	48 c1 e2 04          	shl    rdx,0x4
   140370ffa:	41 2a c0             	sub    al,r8b
   140370ffd:	44 0f b6 c0          	movzx  r8d,al
   140371001:	49 8b 0c fe          	mov    rcx,QWORD PTR [r14+rdi*8]
   140371005:	48 8d 52 10          	lea    rdx,[rdx+0x10]
   140371009:	49 03 cc             	add    rcx,r12
   14037100c:	33 c0                	xor    eax,eax
   14037100e:	48 89 44 11 f8       	mov    QWORD PTR [rcx+rdx*1-0x8],rax
   140371013:	48 89 04 11          	mov    QWORD PTR [rcx+rdx*1],rax
   140371017:	49 83 e8 01          	sub    r8,0x1
   14037101b:	75 e4                	jne    0x140371001
   14037101d:	45 32 ed             	xor    r13b,r13b
   140371020:	45 84 ff             	test   r15b,r15b
   140371023:	0f 84 9e 06 00 00    	je     0x1403716c7
   140371029:	4d 8b fb             	mov    r15,r11
   14037102c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140371030:	44 8b 1b             	mov    r11d,DWORD PTR [rbx]
   140371033:	41 8b cb             	mov    ecx,r11d
   140371036:	45 0f b6 f5          	movzx  r14d,r13b
   14037103a:	45 8d 0c 33          	lea    r9d,[r11+rsi*1]
   14037103e:	45 3b cb             	cmp    r9d,r11d
   140371041:	7c 6f                	jl     0x1403710b2
   140371043:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   140371046:	44 3b ca             	cmp    r9d,edx
   140371049:	7d 67                	jge    0x1403710b2
   14037104b:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   14037104f:	73 61                	jae    0x1403710b2
   140371051:	42 0f b6 44 13 61    	movzx  eax,BYTE PTR [rbx+r10*1+0x61]
   140371057:	44 3b f0             	cmp    r14d,eax
   14037105a:	73 56                	jae    0x1403710b2
   14037105c:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   140371061:	4b 8d 0c 3c          	lea    rcx,[r12+r15*1]
   140371065:	48 8b 04 f8          	mov    rax,QWORD PTR [rax+rdi*8]
   140371069:	f3 0f 10 44 01 10    	movss  xmm0,DWORD PTR [rcx+rax*1+0x10]
   14037106f:	f3 41 0f 58 c3       	addss  xmm0,xmm11
   140371074:	44 0f 2f d0          	comiss xmm10,xmm0
   140371078:	76 0c                	jbe    0x140371086
   14037107a:	41 0f 2f c1          	comiss xmm0,xmm9
   14037107e:	77 0a                	ja     0x14037108a
   140371080:	41 0f 28 c1          	movaps xmm0,xmm9
   140371084:	eb 04                	jmp    0x14037108a
   140371086:	41 0f 28 c2          	movaps xmm0,xmm10
   14037108a:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   140371091:	00 
   140371092:	41 2b d3             	sub    edx,r11d
   140371095:	41 0f af d6          	imul   edx,r14d
   140371099:	f3 44 0f 2c c0       	cvttss2si r8d,xmm0
   14037109e:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1403710a1:	41 2b d3             	sub    edx,r11d
   1403710a4:	41 03 d1             	add    edx,r9d
   1403710a7:	66 44 89 04 51       	mov    WORD PTR [rcx+rdx*2],r8w
   1403710ac:	44 8b 1b             	mov    r11d,DWORD PTR [rbx]
   1403710af:	41 8b cb             	mov    ecx,r11d
   1403710b2:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   1403710b9:	00 
   1403710ba:	44 8b c9             	mov    r9d,ecx
   1403710bd:	48 8b d0             	mov    rdx,rax
   1403710c0:	48 8b 70 08          	mov    rsi,QWORD PTR [rax+0x8]
   1403710c4:	48 85 f6             	test   rsi,rsi
   1403710c7:	74 59                	je     0x140371122
   1403710c9:	8b 7c 24 34          	mov    edi,DWORD PTR [rsp+0x34]
   1403710cd:	03 f9                	add    edi,ecx
   1403710cf:	3b f9                	cmp    edi,ecx
   1403710d1:	7c 4f                	jl     0x140371122
   1403710d3:	44 8b 43 04          	mov    r8d,DWORD PTR [rbx+0x4]
   1403710d7:	41 3b f8             	cmp    edi,r8d
   1403710da:	7d 46                	jge    0x140371122
   1403710dc:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   1403710e0:	73 40                	jae    0x140371122
   1403710e2:	42 0f b6 44 13 61    	movzx  eax,BYTE PTR [rbx+r10*1+0x61]
   1403710e8:	44 3b f0             	cmp    r14d,eax
   1403710eb:	73 35                	jae    0x140371122
   1403710ed:	4c 8b 4c 24 40       	mov    r9,QWORD PTR [rsp+0x40]
   1403710f2:	4b 8d 14 3c          	lea    rdx,[r12+r15*1]
   1403710f6:	48 8b 44 24 48       	mov    rax,QWORD PTR [rsp+0x48]
   1403710fb:	44 2b c1             	sub    r8d,ecx
   1403710fe:	45 0f af c6          	imul   r8d,r14d
   140371102:	49 8b 04 c1          	mov    rax,QWORD PTR [r9+rax*8]
   140371106:	44 2b c1             	sub    r8d,ecx
   140371109:	44 03 c7             	add    r8d,edi
   14037110c:	8b 44 02 0c          	mov    eax,DWORD PTR [rdx+rax*1+0xc]
   140371110:	42 89 04 86          	mov    DWORD PTR [rsi+r8*4],eax
   140371114:	44 8b 1b             	mov    r11d,DWORD PTR [rbx]
   140371117:	45 8b cb             	mov    r9d,r11d
   14037111a:	4a 8b 94 d3 98 00 00 	mov    rdx,QWORD PTR [rbx+r10*8+0x98]
   140371121:	00 
   140371122:	48 8b 44 24 48       	mov    rax,QWORD PTR [rsp+0x48]
   140371127:	0f b7 bb 1c 02 00 00 	movzx  edi,WORD PTR [rbx+0x21c]
   14037112e:	48 85 c0             	test   rax,rax
   140371131:	74 05                	je     0x140371138
   140371133:	66 85 ff             	test   di,di
   140371136:	78 78                	js     0x1403711b0
   140371138:	4c 8b 42 10          	mov    r8,QWORD PTR [rdx+0x10]
   14037113c:	8b 74 24 34          	mov    esi,DWORD PTR [rsp+0x34]
   140371140:	4d 85 c0             	test   r8,r8
   140371143:	74 6f                	je     0x1403711b4
   140371145:	48 8b 54 24 40       	mov    rdx,QWORD PTR [rsp+0x40]
   14037114a:	4b 8d 0c 3c          	lea    rcx,[r12+r15*1]
   14037114e:	48 8b 04 c2          	mov    rax,QWORD PTR [rdx+rax*8]
   140371152:	f3 0f 10 44 01 08    	movss  xmm0,DWORD PTR [rcx+rax*1+0x8]
   140371158:	41 8d 04 31          	lea    eax,[r9+rsi*1]
   14037115c:	41 3b c1             	cmp    eax,r9d
   14037115f:	7c 53                	jl     0x1403711b4
   140371161:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   140371164:	3b c1                	cmp    eax,ecx
   140371166:	7d 4c                	jge    0x1403711b4
   140371168:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   14037116c:	73 46                	jae    0x1403711b4
   14037116e:	41 2b cb             	sub    ecx,r11d
   140371171:	ba 01 00 00 00       	mov    edx,0x1
   140371176:	66 85 ff             	test   di,di
   140371179:	48 8d 7b 61          	lea    rdi,[rbx+0x61]
   14037117d:	0f 48 ca             	cmovs  ecx,edx
   140371180:	41 8b d3             	mov    edx,r11d
   140371183:	0f 49 d0             	cmovns edx,eax
   140371186:	42 0f b6 04 17       	movzx  eax,BYTE PTR [rdi+r10*1]
   14037118b:	44 3b f0             	cmp    r14d,eax
   14037118e:	73 28                	jae    0x1403711b8
   140371190:	45 84 ed             	test   r13b,r13b
   140371193:	41 8b c6             	mov    eax,r14d
   140371196:	41 b9 00 00 00 00    	mov    r9d,0x0
   14037119c:	41 0f 44 c1          	cmove  eax,r9d
   1403711a0:	0f af c1             	imul   eax,ecx
   1403711a3:	41 2b c3             	sub    eax,r11d
   1403711a6:	03 c2                	add    eax,edx
   1403711a8:	f3 41 0f 11 04 80    	movss  DWORD PTR [r8+rax*4],xmm0
   1403711ae:	eb 08                	jmp    0x1403711b8
   1403711b0:	8b 74 24 34          	mov    esi,DWORD PTR [rsp+0x34]
   1403711b4:	48 8d 7b 61          	lea    rdi,[rbx+0x61]
   1403711b8:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   1403711bf:	00 
   1403711c0:	4c 8b 58 18          	mov    r11,QWORD PTR [rax+0x18]
   1403711c4:	4d 85 db             	test   r11,r11
   1403711c7:	74 4f                	je     0x140371218
   1403711c9:	44 8b 03             	mov    r8d,DWORD PTR [rbx]
   1403711cc:	45 8d 0c 30          	lea    r9d,[r8+rsi*1]
   1403711d0:	45 3b c8             	cmp    r9d,r8d
   1403711d3:	7c 43                	jl     0x140371218
   1403711d5:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   1403711d8:	44 3b c9             	cmp    r9d,ecx
   1403711db:	7d 3b                	jge    0x140371218
   1403711dd:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   1403711e1:	73 35                	jae    0x140371218
   1403711e3:	42 0f b6 04 17       	movzx  eax,BYTE PTR [rdi+r10*1]
   1403711e8:	48 8b 7c 24 48       	mov    rdi,QWORD PTR [rsp+0x48]
   1403711ed:	44 3b f0             	cmp    r14d,eax
   1403711f0:	73 2b                	jae    0x14037121d
   1403711f2:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   1403711f7:	4b 8d 14 3c          	lea    rdx,[r12+r15*1]
   1403711fb:	41 2b c8             	sub    ecx,r8d
   1403711fe:	41 0f af ce          	imul   ecx,r14d
   140371202:	48 8b 04 f8          	mov    rax,QWORD PTR [rax+rdi*8]
   140371206:	41 2b c8             	sub    ecx,r8d
   140371209:	0f b7 44 02 14       	movzx  eax,WORD PTR [rdx+rax*1+0x14]
   14037120e:	41 03 c9             	add    ecx,r9d
   140371211:	66 41 89 04 4b       	mov    WORD PTR [r11+rcx*2],ax
   140371216:	eb 05                	jmp    0x14037121d
   140371218:	48 8b 7c 24 48       	mov    rdi,QWORD PTR [rsp+0x48]
   14037121d:	41 fe c5             	inc    r13b
   140371220:	49 83 c7 10          	add    r15,0x10
   140371224:	44 3a ad e8 00 00 00 	cmp    r13b,BYTE PTR [rbp+0xe8]
   14037122b:	0f 82 ff fd ff ff    	jb     0x140371030
   140371231:	44 0f b6 bd e8 00 00 	movzx  r15d,BYTE PTR [rbp+0xe8]
   140371238:	00 
   140371239:	e9 81 04 00 00       	jmp    0x1403716bf
   14037123e:	45 32 ed             	xor    r13b,r13b
   140371241:	44 88 ad e0 00 00 00 	mov    BYTE PTR [rbp+0xe0],r13b
   140371248:	45 84 ff             	test   r15b,r15b
   14037124b:	0f 84 76 04 00 00    	je     0x1403716c7
   140371251:	44 8b 0b             	mov    r9d,DWORD PTR [rbx]
   140371254:	45 0f b6 fd          	movzx  r15d,r13b
   140371258:	45 8d 04 31          	lea    r8d,[r9+rsi*1]
   14037125c:	48 85 ff             	test   rdi,rdi
   14037125f:	0f 8e fa 02 00 00    	jle    0x14037155f
   140371265:	0f b6 73 60          	movzx  esi,BYTE PTR [rbx+0x60]
   140371269:	41 8d 48 ff          	lea    ecx,[r8-0x1]
   14037126d:	44 3a d6             	cmp    r10b,sil
   140371270:	73 4d                	jae    0x1403712bf
   140371272:	43 0f b6 04 14       	movzx  eax,BYTE PTR [r12+r10*1]
   140371277:	44 3b f8             	cmp    r15d,eax
   14037127a:	73 43                	jae    0x1403712bf
   14037127c:	44 8b 43 04          	mov    r8d,DWORD PTR [rbx+0x4]
   140371280:	45 3b c1             	cmp    r8d,r9d
   140371283:	7e 3a                	jle    0x1403712bf
   140371285:	41 3b c9             	cmp    ecx,r9d
   140371288:	41 8d 50 ff          	lea    edx,[r8-0x1]
   14037128c:	41 8b c1             	mov    eax,r9d
   14037128f:	0f 4d c1             	cmovge eax,ecx
   140371292:	41 3b c0             	cmp    eax,r8d
   140371295:	0f 4c d0             	cmovl  edx,eax
   140371298:	41 8b c0             	mov    eax,r8d
   14037129b:	41 2b c1             	sub    eax,r9d
   14037129e:	41 0f af c7          	imul   eax,r15d
   1403712a2:	03 d0                	add    edx,eax
   1403712a4:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   1403712ab:	00 
   1403712ac:	41 2b d1             	sub    edx,r9d
   1403712af:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1403712b2:	0f b7 04 51          	movzx  eax,WORD PTR [rcx+rdx*2]
   1403712b6:	66 0f 6e c0          	movd   xmm0,eax
   1403712ba:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403712bd:	eb 08                	jmp    0x1403712c7
   1403712bf:	44 8b 43 04          	mov    r8d,DWORD PTR [rbx+0x4]
   1403712c3:	41 0f 28 c1          	movaps xmm0,xmm9
   1403712c7:	8b 44 24 34          	mov    eax,DWORD PTR [rsp+0x34]
   1403712cb:	41 8b d0             	mov    edx,r8d
   1403712ce:	45 8b d9             	mov    r11d,r9d
   1403712d1:	40 0f b6 fe          	movzx  edi,sil
   1403712d5:	8b ca                	mov    ecx,edx
   1403712d7:	45 8d 34 01          	lea    r14d,[r9+rax*1]
   1403712db:	45 3b f1             	cmp    r14d,r9d
   1403712de:	7c 61                	jl     0x140371341
   1403712e0:	44 3b f2             	cmp    r14d,edx
   1403712e3:	7d 5c                	jge    0x140371341
   1403712e5:	44 3a d6             	cmp    r10b,sil
   1403712e8:	73 57                	jae    0x140371341
   1403712ea:	43 0f b6 04 14       	movzx  eax,BYTE PTR [r12+r10*1]
   1403712ef:	44 3b f8             	cmp    r15d,eax
   1403712f2:	73 49                	jae    0x14037133d
   1403712f4:	f3 41 0f 58 c3       	addss  xmm0,xmm11
   1403712f9:	44 0f 2f d0          	comiss xmm10,xmm0
   1403712fd:	77 04                	ja     0x140371303
   1403712ff:	41 0f 28 c2          	movaps xmm0,xmm10
   140371303:	41 0f 2f c1          	comiss xmm0,xmm9
   140371307:	77 04                	ja     0x14037130d
   140371309:	41 0f 28 c1          	movaps xmm0,xmm9
   14037130d:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   140371314:	00 
   140371315:	41 2b d1             	sub    edx,r9d
   140371318:	41 0f af d7          	imul   edx,r15d
   14037131c:	f3 44 0f 2c c0       	cvttss2si r8d,xmm0
   140371321:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   140371324:	41 2b d1             	sub    edx,r9d
   140371327:	41 03 d6             	add    edx,r14d
   14037132a:	66 44 89 04 51       	mov    WORD PTR [rcx+rdx*2],r8w
   14037132f:	44 8b 43 04          	mov    r8d,DWORD PTR [rbx+0x4]
   140371333:	41 8b c8             	mov    ecx,r8d
   140371336:	44 8b 1b             	mov    r11d,DWORD PTR [rbx]
   140371339:	0f b6 7b 60          	movzx  edi,BYTE PTR [rbx+0x60]
   14037133d:	8b 44 24 34          	mov    eax,DWORD PTR [rsp+0x34]
   140371341:	4e 8b b4 d3 98 00 00 	mov    r14,QWORD PTR [rbx+r10*8+0x98]
   140371348:	00 
   140371349:	41 8b d3             	mov    edx,r11d
   14037134c:	4d 8b 66 08          	mov    r12,QWORD PTR [r14+0x8]
   140371350:	4c 89 65 98          	mov    QWORD PTR [rbp-0x68],r12
   140371354:	4d 85 e4             	test   r12,r12
   140371357:	0f 84 b3 00 00 00    	je     0x140371410
   14037135d:	45 8d 2c 03          	lea    r13d,[r11+rax*1]
   140371361:	44 0f b6 cf          	movzx  r9d,dil
   140371365:	41 8d 55 ff          	lea    edx,[r13-0x1]
   140371369:	41 8b f3             	mov    esi,r11d
   14037136c:	44 3a d7             	cmp    r10b,dil
   14037136f:	73 2b                	jae    0x14037139c
   140371371:	45 3b eb             	cmp    r13d,r11d
   140371374:	7e 26                	jle    0x14037139c
   140371376:	44 8b c1             	mov    r8d,ecx
   140371379:	3b d1                	cmp    edx,ecx
   14037137b:	7d 1f                	jge    0x14037139c
   14037137d:	42 0f b6 44 13 61    	movzx  eax,BYTE PTR [rbx+r10*1+0x61]
   140371383:	44 3b f8             	cmp    r15d,eax
   140371386:	73 14                	jae    0x14037139c
   140371388:	8b c1                	mov    eax,ecx
   14037138a:	41 2b c3             	sub    eax,r11d
   14037138d:	41 0f af c7          	imul   eax,r15d
   140371391:	41 2b c3             	sub    eax,r11d
   140371394:	03 c2                	add    eax,edx
   140371396:	41 8b 04 84          	mov    eax,DWORD PTR [r12+rax*4]
   14037139a:	eb 09                	jmp    0x1403713a5
   14037139c:	33 c0                	xor    eax,eax
   14037139e:	41 8b c8             	mov    ecx,r8d
   1403713a1:	41 0f b6 f9          	movzx  edi,r9b
   1403713a5:	89 44 24 54          	mov    DWORD PTR [rsp+0x54],eax
   1403713a9:	44 0f b6 e7          	movzx  r12d,dil
   1403713ad:	41 0f b6 f9          	movzx  edi,r9b
   1403713b1:	44 8b c1             	mov    r8d,ecx
   1403713b4:	8b d6                	mov    edx,esi
   1403713b6:	45 3b eb             	cmp    r13d,r11d
   1403713b9:	7c 4d                	jl     0x140371408
   1403713bb:	44 3b e9             	cmp    r13d,ecx
   1403713be:	7d 48                	jge    0x140371408
   1403713c0:	45 3a d4             	cmp    r10b,r12b
   1403713c3:	4c 8d 63 61          	lea    r12,[rbx+0x61]
   1403713c7:	73 35                	jae    0x1403713fe
   1403713c9:	43 0f b6 04 14       	movzx  eax,BYTE PTR [r12+r10*1]
   1403713ce:	44 3b f8             	cmp    r15d,eax
   1403713d1:	73 2b                	jae    0x1403713fe
   1403713d3:	48 8b 55 98          	mov    rdx,QWORD PTR [rbp-0x68]
   1403713d7:	41 2b cb             	sub    ecx,r11d
   1403713da:	41 0f af cf          	imul   ecx,r15d
   1403713de:	41 2b cb             	sub    ecx,r11d
   1403713e1:	42 8d 04 29          	lea    eax,[rcx+r13*1]
   1403713e5:	8b 4c 24 54          	mov    ecx,DWORD PTR [rsp+0x54]
   1403713e9:	89 0c 82             	mov    DWORD PTR [rdx+rax*4],ecx
   1403713ec:	44 8b 43 04          	mov    r8d,DWORD PTR [rbx+0x4]
   1403713f0:	4e 8b b4 d3 98 00 00 	mov    r14,QWORD PTR [rbx+r10*8+0x98]
   1403713f7:	00 
   1403713f8:	8b 13                	mov    edx,DWORD PTR [rbx]
   1403713fa:	0f b6 7b 60          	movzx  edi,BYTE PTR [rbx+0x60]
   1403713fe:	44 0f b6 ad e0 00 00 	movzx  r13d,BYTE PTR [rbp+0xe0]
   140371405:	00 
   140371406:	eb 0c                	jmp    0x140371414
   140371408:	44 0f b6 ad e0 00 00 	movzx  r13d,BYTE PTR [rbp+0xe0]
   14037140f:	00 
   140371410:	4c 8d 63 61          	lea    r12,[rbx+0x61]
   140371414:	49 8b 76 10          	mov    rsi,QWORD PTR [r14+0x10]
   140371418:	48 85 f6             	test   rsi,rsi
   14037141b:	0f 84 a1 00 00 00    	je     0x1403714c2
   140371421:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   140371428:	00 
   140371429:	0f 8c 93 00 00 00    	jl     0x1403714c2
   14037142f:	44 8b 4c 24 34       	mov    r9d,DWORD PTR [rsp+0x34]
   140371434:	46 8d 1c 0a          	lea    r11d,[rdx+r9*1]
   140371438:	41 8d 4b ff          	lea    ecx,[r11-0x1]
   14037143c:	44 3a d7             	cmp    r10b,dil
   14037143f:	73 45                	jae    0x140371486
   140371441:	44 3b c2             	cmp    r8d,edx
   140371444:	7e 40                	jle    0x140371486
   140371446:	3b ca                	cmp    ecx,edx
   140371448:	8b c2                	mov    eax,edx
   14037144a:	45 8b c8             	mov    r9d,r8d
   14037144d:	0f 4d c1             	cmovge eax,ecx
   140371450:	41 8d 48 ff          	lea    ecx,[r8-0x1]
   140371454:	41 3b c0             	cmp    eax,r8d
   140371457:	0f 4c c8             	cmovl  ecx,eax
   14037145a:	43 0f b6 04 14       	movzx  eax,BYTE PTR [r12+r10*1]
   14037145f:	2b ca                	sub    ecx,edx
   140371461:	44 2b ca             	sub    r9d,edx
   140371464:	44 3b f8             	cmp    r15d,eax
   140371467:	73 1d                	jae    0x140371486
   140371469:	45 85 ff             	test   r15d,r15d
   14037146c:	41 8b c7             	mov    eax,r15d
   14037146f:	41 be 00 00 00 00    	mov    r14d,0x0
   140371475:	41 0f 44 c6          	cmove  eax,r14d
   140371479:	41 0f af c1          	imul   eax,r9d
   14037147d:	03 c1                	add    eax,ecx
   14037147f:	f3 0f 10 04 86       	movss  xmm0,DWORD PTR [rsi+rax*4]
   140371484:	eb 07                	jmp    0x14037148d
   140371486:	45 33 f6             	xor    r14d,r14d
   140371489:	41 0f 28 c1          	movaps xmm0,xmm9
   14037148d:	44 3b da             	cmp    r11d,edx
   140371490:	7c 30                	jl     0x1403714c2
   140371492:	45 3b d8             	cmp    r11d,r8d
   140371495:	7d 2b                	jge    0x1403714c2
   140371497:	44 3a d7             	cmp    r10b,dil
   14037149a:	73 26                	jae    0x1403714c2
   14037149c:	41 0f b6 44 1a 61    	movzx  eax,BYTE PTR [r10+rbx*1+0x61]
   1403714a2:	44 2b c2             	sub    r8d,edx
   1403714a5:	44 3b f8             	cmp    r15d,eax
   1403714a8:	73 18                	jae    0x1403714c2
   1403714aa:	45 85 ff             	test   r15d,r15d
   1403714ad:	41 8b c7             	mov    eax,r15d
   1403714b0:	41 0f 44 c6          	cmove  eax,r14d
   1403714b4:	41 0f af c0          	imul   eax,r8d
   1403714b8:	2b c2                	sub    eax,edx
   1403714ba:	41 03 c3             	add    eax,r11d
   1403714bd:	f3 0f 11 04 86       	movss  DWORD PTR [rsi+rax*4],xmm0
   1403714c2:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   1403714c9:	00 
   1403714ca:	8b 74 24 34          	mov    esi,DWORD PTR [rsp+0x34]
   1403714ce:	4c 8b 58 18          	mov    r11,QWORD PTR [rax+0x18]
   1403714d2:	4d 85 db             	test   r11,r11
   1403714d5:	0f 84 c4 01 00 00    	je     0x14037169f
   1403714db:	8b 13                	mov    edx,DWORD PTR [rbx]
   1403714dd:	0f b6 7b 60          	movzx  edi,BYTE PTR [rbx+0x60]
   1403714e1:	44 8d 0c 32          	lea    r9d,[rdx+rsi*1]
   1403714e5:	45 8d 41 ff          	lea    r8d,[r9-0x1]
   1403714e9:	44 3a d7             	cmp    r10b,dil
   1403714ec:	73 2b                	jae    0x140371519
   1403714ee:	44 3b c2             	cmp    r8d,edx
   1403714f1:	7c 26                	jl     0x140371519
   1403714f3:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   1403714f6:	44 3b c1             	cmp    r8d,ecx
   1403714f9:	7d 1e                	jge    0x140371519
   1403714fb:	43 0f b6 04 14       	movzx  eax,BYTE PTR [r12+r10*1]
   140371500:	44 3b f8             	cmp    r15d,eax
   140371503:	73 14                	jae    0x140371519
   140371505:	8b c1                	mov    eax,ecx
   140371507:	2b c2                	sub    eax,edx
   140371509:	41 0f af c7          	imul   eax,r15d
   14037150d:	2b c2                	sub    eax,edx
   14037150f:	41 03 c0             	add    eax,r8d
   140371512:	45 0f b7 04 43       	movzx  r8d,WORD PTR [r11+rax*2]
   140371517:	eb 08                	jmp    0x140371521
   140371519:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   14037151c:	33 c0                	xor    eax,eax
   14037151e:	44 8b c0             	mov    r8d,eax
   140371521:	44 3b ca             	cmp    r9d,edx
   140371524:	0f 8c 75 01 00 00    	jl     0x14037169f
   14037152a:	44 3b c9             	cmp    r9d,ecx
   14037152d:	0f 8d 6c 01 00 00    	jge    0x14037169f
   140371533:	44 3a d7             	cmp    r10b,dil
   140371536:	0f 83 63 01 00 00    	jae    0x14037169f
   14037153c:	43 0f b6 04 14       	movzx  eax,BYTE PTR [r12+r10*1]
   140371541:	44 3b f8             	cmp    r15d,eax
   140371544:	0f 83 55 01 00 00    	jae    0x14037169f
   14037154a:	2b ca                	sub    ecx,edx
   14037154c:	41 0f af cf          	imul   ecx,r15d
   140371550:	2b ca                	sub    ecx,edx
   140371552:	41 03 c9             	add    ecx,r9d
   140371555:	66 45 89 04 4b       	mov    WORD PTR [r11+rcx*2],r8w
   14037155a:	e9 3e 01 00 00       	jmp    0x14037169d
   14037155f:	41 8b c9             	mov    ecx,r9d
   140371562:	45 3b c1             	cmp    r8d,r9d
   140371565:	7c 3c                	jl     0x1403715a3
   140371567:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   14037156a:	44 3b c2             	cmp    r8d,edx
   14037156d:	7d 34                	jge    0x1403715a3
   14037156f:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   140371573:	73 2e                	jae    0x1403715a3
   140371575:	43 0f b6 04 14       	movzx  eax,BYTE PTR [r12+r10*1]
   14037157a:	44 3b f8             	cmp    r15d,eax
   14037157d:	73 24                	jae    0x1403715a3
   14037157f:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   140371586:	00 
   140371587:	41 2b d1             	sub    edx,r9d
   14037158a:	41 0f af d7          	imul   edx,r15d
   14037158e:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   140371591:	41 2b d1             	sub    edx,r9d
   140371594:	41 03 d0             	add    edx,r8d
   140371597:	45 33 f6             	xor    r14d,r14d
   14037159a:	66 44 89 34 51       	mov    WORD PTR [rcx+rdx*2],r14w
   14037159f:	8b 0b                	mov    ecx,DWORD PTR [rbx]
   1403715a1:	eb 03                	jmp    0x1403715a6
   1403715a3:	45 33 f6             	xor    r14d,r14d
   1403715a6:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   1403715ad:	00 
   1403715ae:	8b d1                	mov    edx,ecx
   1403715b0:	4c 8b c8             	mov    r9,rax
   1403715b3:	48 8b 78 08          	mov    rdi,QWORD PTR [rax+0x8]
   1403715b7:	48 85 ff             	test   rdi,rdi
   1403715ba:	74 3e                	je     0x1403715fa
   1403715bc:	44 8d 1c 31          	lea    r11d,[rcx+rsi*1]
   1403715c0:	44 3b d9             	cmp    r11d,ecx
   1403715c3:	7c 35                	jl     0x1403715fa
   1403715c5:	44 8b 43 04          	mov    r8d,DWORD PTR [rbx+0x4]
   1403715c9:	45 3b d8             	cmp    r11d,r8d
   1403715cc:	7d 2c                	jge    0x1403715fa
   1403715ce:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   1403715d2:	73 26                	jae    0x1403715fa
   1403715d4:	41 0f b6 44 1a 61    	movzx  eax,BYTE PTR [r10+rbx*1+0x61]
   1403715da:	44 3b f8             	cmp    r15d,eax
   1403715dd:	73 1b                	jae    0x1403715fa
   1403715df:	44 2b c1             	sub    r8d,ecx
   1403715e2:	45 0f af c7          	imul   r8d,r15d
   1403715e6:	44 2b c1             	sub    r8d,ecx
   1403715e9:	45 03 c3             	add    r8d,r11d
   1403715ec:	46 89 34 87          	mov    DWORD PTR [rdi+r8*4],r14d
   1403715f0:	8b 13                	mov    edx,DWORD PTR [rbx]
   1403715f2:	4e 8b 8c d3 98 00 00 	mov    r9,QWORD PTR [rbx+r10*8+0x98]
   1403715f9:	00 
   1403715fa:	4d 8b 59 10          	mov    r11,QWORD PTR [r9+0x10]
   1403715fe:	4d 85 db             	test   r11,r11
   140371601:	74 55                	je     0x140371658
   140371603:	44 8d 04 32          	lea    r8d,[rdx+rsi*1]
   140371607:	44 3b c2             	cmp    r8d,edx
   14037160a:	7c 4c                	jl     0x140371658
   14037160c:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   14037160f:	44 3b c1             	cmp    r8d,ecx
   140371612:	7d 44                	jge    0x140371658
   140371614:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   140371618:	73 3e                	jae    0x140371658
   14037161a:	0f b7 83 1c 02 00 00 	movzx  eax,WORD PTR [rbx+0x21c]
   140371621:	2b ca                	sub    ecx,edx
   140371623:	66 85 c0             	test   ax,ax
   140371626:	41 b9 01 00 00 00    	mov    r9d,0x1
   14037162c:	41 0f b6 44 1a 61    	movzx  eax,BYTE PTR [r10+rbx*1+0x61]
   140371632:	41 0f 48 c9          	cmovs  ecx,r9d
   140371636:	44 8b ca             	mov    r9d,edx
   140371639:	45 0f 49 c8          	cmovns r9d,r8d
   14037163d:	44 3b f8             	cmp    r15d,eax
   140371640:	73 16                	jae    0x140371658
   140371642:	45 84 ed             	test   r13b,r13b
   140371645:	41 8b c7             	mov    eax,r15d
   140371648:	41 0f 44 c6          	cmove  eax,r14d
   14037164c:	0f af c1             	imul   eax,ecx
   14037164f:	2b c2                	sub    eax,edx
   140371651:	41 03 c1             	add    eax,r9d
   140371654:	45 89 34 83          	mov    DWORD PTR [r11+rax*4],r14d
   140371658:	4a 8b 84 d3 98 00 00 	mov    rax,QWORD PTR [rbx+r10*8+0x98]
   14037165f:	00 
   140371660:	4c 8b 48 18          	mov    r9,QWORD PTR [rax+0x18]
   140371664:	4d 85 c9             	test   r9,r9
   140371667:	74 36                	je     0x14037169f
   140371669:	8b 13                	mov    edx,DWORD PTR [rbx]
   14037166b:	44 8d 04 32          	lea    r8d,[rdx+rsi*1]
   14037166f:	44 3b c2             	cmp    r8d,edx
   140371672:	7c 2b                	jl     0x14037169f
   140371674:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   140371677:	44 3b c1             	cmp    r8d,ecx
   14037167a:	7d 23                	jge    0x14037169f
   14037167c:	44 3a 53 60          	cmp    r10b,BYTE PTR [rbx+0x60]
   140371680:	73 1d                	jae    0x14037169f
   140371682:	41 0f b6 44 1a 61    	movzx  eax,BYTE PTR [r10+rbx*1+0x61]
   140371688:	44 3b f8             	cmp    r15d,eax
   14037168b:	73 12                	jae    0x14037169f
   14037168d:	2b ca                	sub    ecx,edx
   14037168f:	41 0f af cf          	imul   ecx,r15d
   140371693:	2b ca                	sub    ecx,edx
   140371695:	41 03 c8             	add    ecx,r8d
   140371698:	66 45 89 34 49       	mov    WORD PTR [r9+rcx*2],r14w
   14037169d:	8b c1                	mov    eax,ecx
   14037169f:	44 0f b6 bd e8 00 00 	movzx  r15d,BYTE PTR [rbp+0xe8]
   1403716a6:	00 
   1403716a7:	41 fe c5             	inc    r13b
   1403716aa:	48 8b 7c 24 48       	mov    rdi,QWORD PTR [rsp+0x48]
   1403716af:	44 88 ad e0 00 00 00 	mov    BYTE PTR [rbp+0xe0],r13b
   1403716b6:	45 3a ef             	cmp    r13b,r15b
   1403716b9:	0f 82 92 fb ff ff    	jb     0x140371251
   1403716bf:	4c 8b 74 24 40       	mov    r14,QWORD PTR [rsp+0x40]
   1403716c4:	45 33 db             	xor    r11d,r11d
   1403716c7:	44 8b 6c 24 58       	mov    r13d,DWORD PTR [rsp+0x58]
   1403716cc:	4c 8d 63 61          	lea    r12,[rbx+0x61]
   1403716d0:	8b 54 24 68          	mov    edx,DWORD PTR [rsp+0x68]
   1403716d4:	ff c6                	inc    esi
   1403716d6:	48 ff c7             	inc    rdi
   1403716d9:	89 74 24 34          	mov    DWORD PTR [rsp+0x34],esi
   1403716dd:	48 89 7c 24 48       	mov    QWORD PTR [rsp+0x48],rdi
   1403716e2:	41 3b f5             	cmp    esi,r13d
   1403716e5:	0f 8c d5 f8 ff ff    	jl     0x140370fc0
   1403716eb:	4c 8d 63 61          	lea    r12,[rbx+0x61]
   1403716ef:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   1403716f6:	00 
   1403716f7:	4a 8b 8c d3 98 00 00 	mov    rcx,QWORD PTR [rbx+r10*8+0x98]
   1403716fe:	00 
   1403716ff:	7d 04                	jge    0x140371705
   140371701:	32 c0                	xor    al,al
   140371703:	eb 03                	jmp    0x140371708
   140371705:	8d 42 01             	lea    eax,[rdx+0x1]
   140371708:	ff c2                	inc    edx
   14037170a:	88 41 2c             	mov    BYTE PTR [rcx+0x2c],al
   14037170d:	89 54 24 68          	mov    DWORD PTR [rsp+0x68],edx
   140371711:	83 fa 30             	cmp    edx,0x30
   140371714:	0f 8c 76 f8 ff ff    	jl     0x140370f90
   14037171a:	44 8b 2b             	mov    r13d,DWORD PTR [rbx]
   14037171d:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   140371720:	44 3b ea             	cmp    r13d,edx
   140371723:	0f 8d 6c 01 00 00    	jge    0x140371895
   140371729:	f3 0f 10 15 df 4b b9 	movss  xmm2,DWORD PTR [rip+0x14b94bdf]        # 0x154f06310
   140371730:	14 
   140371731:	4c 8d 9b 98 00 00 00 	lea    r11,[rbx+0x98]
   140371738:	f3 0f 10 1d c4 4b b9 	movss  xmm3,DWORD PTR [rip+0x14b94bc4]        # 0x154f06304
   14037173f:	14 
   140371740:	8b 0b                	mov    ecx,DWORD PTR [rbx]
   140371742:	44 8d 42 ff          	lea    r8d,[rdx-0x1]
   140371746:	44 0f b6 53 60       	movzx  r10d,BYTE PTR [rbx+0x60]
   14037174b:	44 3b e9             	cmp    r13d,ecx
   14037174e:	41 8b c5             	mov    eax,r13d
   140371751:	44 8b ca             	mov    r9d,edx
   140371754:	0f 4c c1             	cmovl  eax,ecx
   140371757:	41 0f 28 c9          	movaps xmm1,xmm9
   14037175b:	44 2b c9             	sub    r9d,ecx
   14037175e:	3b c2                	cmp    eax,edx
   140371760:	44 0f 4c c0          	cmovl  r8d,eax
   140371764:	44 2b c1             	sub    r8d,ecx
   140371767:	45 85 d2             	test   r10d,r10d
   14037176a:	0f 84 ec 00 00 00    	je     0x14037185c
   140371770:	4d 63 e0             	movsxd r12,r8d
   140371773:	4c 8d 73 61          	lea    r14,[rbx+0x61]
   140371777:	49 63 f9             	movsxd rdi,r9d
   14037177a:	49 8b f3             	mov    rsi,r11
   14037177d:	45 8b fa             	mov    r15d,r10d
   140371780:	33 c0                	xor    eax,eax
   140371782:	45 0f b6 0e          	movzx  r9d,BYTE PTR [r14]
   140371786:	4d 8b d4             	mov    r10,r12
   140371789:	41 83 e9 01          	sub    r9d,0x1
   14037178d:	44 8b d8             	mov    r11d,eax
   140371790:	0f 88 ae 00 00 00    	js     0x140371844
   140371796:	41 8d 41 01          	lea    eax,[r9+0x1]
   14037179a:	83 f8 04             	cmp    eax,0x4
   14037179d:	0f 8c 6c 00 00 00    	jl     0x14037180f
   1403717a3:	48 8b 06             	mov    rax,QWORD PTR [rsi]
   1403717a6:	4c 8d 04 3f          	lea    r8,[rdi+rdi*1]
   1403717aa:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1403717ad:	4a 8d 14 61          	lea    rdx,[rcx+r12*2]
   1403717b1:	41 8d 49 01          	lea    ecx,[r9+0x1]
   1403717b5:	48 c1 e9 02          	shr    rcx,0x2
   1403717b9:	44 8d 1c 8d 00 00 00 	lea    r11d,[rcx*4+0x0]
   1403717c0:	00 
   1403717c1:	0f b7 02             	movzx  eax,WORD PTR [rdx]
   1403717c4:	4d 8d 14 ba          	lea    r10,[r10+rdi*4]
   1403717c8:	49 03 d0             	add    rdx,r8
   1403717cb:	66 0f 6e c0          	movd   xmm0,eax
   1403717cf:	0f b7 02             	movzx  eax,WORD PTR [rdx]
   1403717d2:	49 03 d0             	add    rdx,r8
   1403717d5:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403717d8:	f3 0f 58 c8          	addss  xmm1,xmm0
   1403717dc:	66 0f 6e c0          	movd   xmm0,eax
   1403717e0:	0f b7 02             	movzx  eax,WORD PTR [rdx]
   1403717e3:	49 03 d0             	add    rdx,r8
   1403717e6:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403717e9:	f3 0f 58 c8          	addss  xmm1,xmm0
   1403717ed:	66 0f 6e c0          	movd   xmm0,eax
   1403717f1:	0f b7 02             	movzx  eax,WORD PTR [rdx]
   1403717f4:	49 03 d0             	add    rdx,r8
   1403717f7:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403717fa:	f3 0f 58 c8          	addss  xmm1,xmm0
   1403717fe:	66 0f 6e c0          	movd   xmm0,eax
   140371802:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140371805:	f3 0f 58 c8          	addss  xmm1,xmm0
   140371809:	48 83 e9 01          	sub    rcx,0x1
   14037180d:	75 b2                	jne    0x1403717c1
   14037180f:	45 3b d9             	cmp    r11d,r9d
   140371812:	7f 2e                	jg     0x140371842
   140371814:	48 8b 06             	mov    rax,QWORD PTR [rsi]
   140371817:	4c 8d 04 3f          	lea    r8,[rdi+rdi*1]
   14037181b:	45 2b cb             	sub    r9d,r11d
   14037181e:	41 ff c1             	inc    r9d
   140371821:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   140371824:	4a 8d 14 51          	lea    rdx,[rcx+r10*2]
   140371828:	49 63 c9             	movsxd rcx,r9d
   14037182b:	0f b7 02             	movzx  eax,WORD PTR [rdx]
   14037182e:	49 03 d0             	add    rdx,r8
   140371831:	66 0f 6e c0          	movd   xmm0,eax
   140371835:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140371838:	f3 0f 58 c8          	addss  xmm1,xmm0
   14037183c:	48 83 e9 01          	sub    rcx,0x1
   140371840:	75 e9                	jne    0x14037182b
   140371842:	33 c0                	xor    eax,eax
   140371844:	49 ff c6             	inc    r14
   140371847:	48 83 c6 08          	add    rsi,0x8
   14037184b:	49 83 ef 01          	sub    r15,0x1
   14037184f:	0f 85 2d ff ff ff    	jne    0x140371782
   140371855:	4c 8d 9b 98 00 00 00 	lea    r11,[rbx+0x98]
   14037185c:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   140371863:	00 
   140371864:	7d 11                	jge    0x140371877
   140371866:	f3 0f 5f ca          	maxss  xmm1,xmm2
   14037186a:	f3 0f 11 0d 9e 4a b9 	movss  DWORD PTR [rip+0x14b94a9e],xmm1        # 0x154f06310
   140371871:	14 
   140371872:	0f 28 d1             	movaps xmm2,xmm1
   140371875:	eb 0f                	jmp    0x140371886
   140371877:	f3 0f 5f cb          	maxss  xmm1,xmm3
   14037187b:	f3 0f 11 0d 81 4a b9 	movss  DWORD PTR [rip+0x14b94a81],xmm1        # 0x154f06304
   140371882:	14 
   140371883:	0f 28 d9             	movaps xmm3,xmm1
   140371886:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   140371889:	41 ff c5             	inc    r13d
   14037188c:	44 3b ea             	cmp    r13d,edx
   14037188f:	0f 8c ab fe ff ff    	jl     0x140371740
   140371895:	80 7b 60 00          	cmp    BYTE PTR [rbx+0x60],0x0
   140371899:	75 5b                	jne    0x1403718f6
   14037189b:	48 8b cb             	mov    rcx,rbx
   14037189e:	e8 ed 66 00 00       	call   0x140377f90
   1403718a3:	ba c0 02 00 00       	mov    edx,0x2c0
   1403718a8:	48 8b cb             	mov    rcx,rbx
   1403718ab:	e8 a8 9c 2a 00       	call   0x14061b558
   1403718b0:	4c 8b 74 24 40       	mov    r14,QWORD PTR [rsp+0x40]
   1403718b5:	4c 8b a5 d0 00 00 00 	mov    r12,QWORD PTR [rbp+0xd0]
   1403718bc:	44 8b 6c 24 30       	mov    r13d,DWORD PTR [rsp+0x30]
   1403718c1:	8b 5c 24 38          	mov    ebx,DWORD PTR [rsp+0x38]
   1403718c5:	44 8b 4d a0          	mov    r9d,DWORD PTR [rbp-0x60]
   1403718c9:	48 8d 45 80          	lea    rax,[rbp-0x80]
   1403718cd:	4c 8d 44 24 50       	lea    r8,[rsp+0x50]
   1403718d2:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   1403718d7:	49 8b d6             	mov    rdx,r14
   1403718da:	49 8b cc             	mov    rcx,r12
   1403718dd:	e8 0e e2 ff ff       	call   0x14036faf0
   1403718e2:	89 44 24 5c          	mov    DWORD PTR [rsp+0x5c],eax
   1403718e6:	8b f8                	mov    edi,eax
   1403718e8:	83 f8 ff             	cmp    eax,0xffffffff
   1403718eb:	0f 85 8f f3 ff ff    	jne    0x140370c80
   1403718f1:	e9 81 0c 00 00       	jmp    0x140372577
   1403718f6:	48 8b 43 18          	mov    rax,QWORD PTR [rbx+0x18]
   1403718fa:	48 8d b3 7c 02 00 00 	lea    rsi,[rbx+0x27c]
   140371901:	66 0f 6e 3b          	movd   xmm7,DWORD PTR [rbx]
   140371905:	48 85 c0             	test   rax,rax
   140371908:	4c 8b a5 d0 00 00 00 	mov    r12,QWORD PTR [rbp+0xd0]
   14037190f:	45 0f 28 c1          	movaps xmm8,xmm9
   140371913:	44 8b 1d 96 88 61 00 	mov    r11d,DWORD PTR [rip+0x618896]        # 0x14098a1b0
   14037191a:	48 0f 44 c6          	cmove  rax,rsi
   14037191e:	0f 5b ff             	cvtdq2ps xmm7,xmm7
   140371921:	f3 0f 59 38          	mulss  xmm7,DWORD PTR [rax]
   140371925:	45 39 1c 24          	cmp    DWORD PTR [r12],r11d
   140371929:	0f 85 bd 02 00 00    	jne    0x140371bec
   14037192f:	44 0f b6 0d 9a 47 b9 	movzx  r9d,BYTE PTR [rip+0x14b9479a]        # 0x154f060d1
   140371936:	14 
   140371937:	44 8b 05 6e 80 5c 00 	mov    r8d,DWORD PTR [rip+0x5c806e]        # 0x1409399ac
   14037193e:	45 84 c9             	test   r9b,r9b
   140371941:	75 09                	jne    0x14037194c
   140371943:	45 85 c0             	test   r8d,r8d
   140371946:	0f 88 af 02 00 00    	js     0x140371bfb
   14037194c:	0f 28 f7             	movaps xmm6,xmm7
   14037194f:	45 84 c9             	test   r9b,r9b
   140371952:	75 0a                	jne    0x14037195e
   140371954:	45 85 c0             	test   r8d,r8d
   140371957:	79 0a                	jns    0x140371963
   140371959:	e9 ae 00 00 00       	jmp    0x140371a0c
   14037195e:	45 85 c0             	test   r8d,r8d
   140371961:	78 1e                	js     0x140371981
   140371963:	f3 0f 10 1d 6d 47 b9 	movss  xmm3,DWORD PTR [rip+0x14b9476d]        # 0x154f060d8
   14037196a:	14 
   14037196b:	f3 0f 10 15 69 47 b9 	movss  xmm2,DWORD PTR [rip+0x14b94769]        # 0x154f060dc
   140371972:	14 
   140371973:	f3 0f 11 5c 24 70    	movss  DWORD PTR [rsp+0x70],xmm3
   140371979:	f3 0f 11 54 24 74    	movss  DWORD PTR [rsp+0x74],xmm2
   14037197f:	eb 31                	jmp    0x1403719b2
   140371981:	48 8d 54 24 74       	lea    rdx,[rsp+0x74]
   140371986:	48 8d 4c 24 70       	lea    rcx,[rsp+0x70]
   14037198b:	e8 00 08 0f 00       	call   0x140462190
   140371990:	44 0f b6 0d 39 47 b9 	movzx  r9d,BYTE PTR [rip+0x14b94739]        # 0x154f060d1
   140371997:	14 
   140371998:	44 8b 05 0d 80 5c 00 	mov    r8d,DWORD PTR [rip+0x5c800d]        # 0x1409399ac
   14037199f:	f3 0f 10 5c 24 70    	movss  xmm3,DWORD PTR [rsp+0x70]
   1403719a5:	f3 0f 10 54 24 74    	movss  xmm2,DWORD PTR [rsp+0x74]
   1403719ab:	44 8b 1d fe 87 61 00 	mov    r11d,DWORD PTR [rip+0x6187fe]        # 0x14098a1b0
   1403719b2:	41 0f 2f d1          	comiss xmm2,xmm9
   1403719b6:	72 54                	jb     0x140371a0c
   1403719b8:	0f 28 c3             	movaps xmm0,xmm3
   1403719bb:	f3 41 0f 58 c6       	addss  xmm0,xmm14
   1403719c0:	0f 2f d0             	comiss xmm2,xmm0
   1403719c3:	76 47                	jbe    0x140371a0c
   1403719c5:	f3 0f 10 0d 7f 8e 53 	movss  xmm1,DWORD PTR [rip+0x17538e7f]        # 0x1578aa84c
   1403719cc:	17 
   1403719cd:	0f 28 c2             	movaps xmm0,xmm2
   1403719d0:	f3 0f 58 0d 70 8e 53 	addss  xmm1,DWORD PTR [rip+0x17538e70]        # 0x1578aa848
   1403719d7:	17 
   1403719d8:	f3 41 0f 5c c6       	subss  xmm0,xmm14
   1403719dd:	0f 2f c1             	comiss xmm0,xmm1
   1403719e0:	76 2a                	jbe    0x140371a0c
   1403719e2:	0f 2f fa             	comiss xmm7,xmm2
   1403719e5:	72 25                	jb     0x140371a0c
   1403719e7:	0f 28 c7             	movaps xmm0,xmm7
   1403719ea:	f3 0f 5c d3          	subss  xmm2,xmm3
   1403719ee:	f3 0f 5c c3          	subss  xmm0,xmm3
   1403719f2:	0f 28 f7             	movaps xmm6,xmm7
   1403719f5:	f3 0f 5e c2          	divss  xmm0,xmm2
   1403719f9:	f3 0f 2c c0          	cvttss2si eax,xmm0
   1403719fd:	66 0f 6e c0          	movd   xmm0,eax
   140371a01:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140371a04:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140371a08:	f3 0f 5c f0          	subss  xmm6,xmm0
   140371a0c:	44 0f 28 c7          	movaps xmm8,xmm7
   140371a10:	f3 44 0f 5c c6       	subss  xmm8,xmm6
   140371a15:	45 0f 2f c1          	comiss xmm8,xmm9
   140371a19:	0f 86 dc 01 00 00    	jbe    0x140371bfb
   140371a1f:	48 8d 55 84          	lea    rdx,[rbp-0x7c]
   140371a23:	48 8d 4d 88          	lea    rcx,[rbp-0x78]
   140371a27:	e8 64 07 0f 00       	call   0x140462190
   140371a2c:	44 8b 0d 0d fe 5c 00 	mov    r9d,DWORD PTR [rip+0x5cfe0d]        # 0x140941840
   140371a33:	44 8b 1d 76 87 61 00 	mov    r11d,DWORD PTR [rip+0x618776]        # 0x14098a1b0
   140371a3a:	45 85 c9             	test   r9d,r9d
   140371a3d:	79 4a                	jns    0x140371a89
   140371a3f:	45 8b cb             	mov    r9d,r11d
   140371a42:	45 85 db             	test   r11d,r11d
   140371a45:	79 42                	jns    0x140371a89
   140371a47:	44 0f b6 05 4f 7c 5c 	movzx  r8d,BYTE PTR [rip+0x5c7c4f]        # 0x14093969e
   140371a4e:	00 
   140371a4f:	41 83 f8 06          	cmp    r8d,0x6
   140371a53:	72 14                	jb     0x140371a69
   140371a55:	b8 ab aa aa aa       	mov    eax,0xaaaaaaab
   140371a5a:	41 f7 e0             	mul    r8d
   140371a5d:	d1 ea                	shr    edx,1
   140371a5f:	8d 0c 52             	lea    ecx,[rdx+rdx*2]
   140371a62:	44 3b c1             	cmp    r8d,ecx
   140371a65:	44 0f 44 c2          	cmove  r8d,edx
   140371a69:	66 41 0f 6e c0       	movd   xmm0,r8d
   140371a6e:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140371a71:	0f 28 c8             	movaps xmm1,xmm0
   140371a74:	f3 0f 59 0d 2c c7 31 	mulss  xmm1,DWORD PTR [rip+0x31c72c]        # 0x14068e1a8
   140371a7b:	00 
   140371a7c:	f3 0f 5e 0d 1c 7c 5c 	divss  xmm1,DWORD PTR [rip+0x5c7c1c]        # 0x1409396a0
   140371a83:	00 
   140371a84:	e9 3c 01 00 00       	jmp    0x140371bc5
   140371a89:	41 8b c1             	mov    eax,r9d
   140371a8c:	45 85 c9             	test   r9d,r9d
   140371a8f:	79 4e                	jns    0x140371adf
   140371a91:	41 8b c3             	mov    eax,r11d
   140371a94:	45 85 db             	test   r11d,r11d
   140371a97:	79 46                	jns    0x140371adf
   140371a99:	44 0f b6 05 fd 7b 5c 	movzx  r8d,BYTE PTR [rip+0x5c7bfd]        # 0x14093969e
   140371aa0:	00 
   140371aa1:	41 83 f8 06          	cmp    r8d,0x6
   140371aa5:	72 14                	jb     0x140371abb
   140371aa7:	b8 ab aa aa aa       	mov    eax,0xaaaaaaab
   140371aac:	41 f7 e0             	mul    r8d
   140371aaf:	d1 ea                	shr    edx,1
   140371ab1:	8d 0c 52             	lea    ecx,[rdx+rdx*2]
   140371ab4:	44 3b c1             	cmp    r8d,ecx
   140371ab7:	44 0f 44 c2          	cmove  r8d,edx
   140371abb:	66 41 0f 6e c8       	movd   xmm1,r8d
   140371ac0:	4c 8d 3d 39 e5 c8 ff 	lea    r15,[rip+0xffffffffffc8e539]        # 0x140000000
   140371ac7:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   140371aca:	f3 0f 59 0d d6 c6 31 	mulss  xmm1,DWORD PTR [rip+0x31c6d6]        # 0x14068e1a8
   140371ad1:	00 
   140371ad2:	f3 0f 5e 0d c6 7b 5c 	divss  xmm1,DWORD PTR [rip+0x5c7bc6]        # 0x1409396a0
   140371ad9:	00 
   140371ada:	e9 b1 00 00 00       	jmp    0x140371b90
   140371adf:	45 33 f6             	xor    r14d,r14d
   140371ae2:	48 63 f8             	movsxd rdi,eax
   140371ae5:	4c 69 df 78 ab 06 00 	imul   r11,rdi,0x6ab78
   140371aec:	4c 8d 3d 0d e5 c8 ff 	lea    r15,[rip+0xffffffffffc8e50d]        # 0x140000000
   140371af3:	41 8b d6             	mov    edx,r14d
   140371af6:	41 8b ce             	mov    ecx,r14d
   140371af9:	4f 63 94 3b 04 a6 98 	movsxd r10,DWORD PTR [r11+r15*1+0x98a604]
   140371b00:	00 
   140371b01:	45 85 d2             	test   r10d,r10d
   140371b04:	7e 33                	jle    0x140371b39
   140371b06:	0f 28 ce             	movaps xmm1,xmm6
   140371b09:	49 8d 87 08 a6 98 00 	lea    rax,[r15+0x98a608]
   140371b10:	f3 43 0f 58 8c 3b 20 	addss  xmm1,DWORD PTR [r11+r15*1+0x9c3720]
   140371b17:	37 9c 00 
   140371b1a:	49 03 c3             	add    rax,r11
   140371b1d:	f3 41 0f 58 ce       	addss  xmm1,xmm14
   140371b22:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   140371b26:	0f 2f c1             	comiss xmm0,xmm1
   140371b29:	77 0e                	ja     0x140371b39
   140371b2b:	ff c2                	inc    edx
   140371b2d:	48 ff c1             	inc    rcx
   140371b30:	48 83 c0 04          	add    rax,0x4
   140371b34:	49 3b ca             	cmp    rcx,r10
   140371b37:	7c e9                	jl     0x140371b22
   140371b39:	8b c2                	mov    eax,edx
   140371b3b:	41 3b d2             	cmp    edx,r10d
   140371b3e:	7c 0a                	jl     0x140371b4a
   140371b40:	41 8d 42 ff          	lea    eax,[r10-0x1]
   140371b44:	85 c0                	test   eax,eax
   140371b46:	41 0f 4e c6          	cmovle eax,r14d
   140371b4a:	48 63 c8             	movsxd rcx,eax
   140371b4d:	85 c0                	test   eax,eax
   140371b4f:	75 0c                	jne    0x140371b5d
   140371b51:	f3 43 0f 10 84 3b 10 	movss  xmm0,DWORD PTR [r11+r15*1+0x9c3610]
   140371b58:	36 9c 00 
   140371b5b:	eb 14                	jmp    0x140371b71
   140371b5d:	48 69 c7 de aa 01 00 	imul   rax,rdi,0x1aade
   140371b64:	48 03 c1             	add    rax,rcx
   140371b67:	f3 41 0f 10 84 87 04 	movss  xmm0,DWORD PTR [r15+rax*4+0x98a604]
   140371b6e:	a6 98 00 
   140371b71:	44 8b 1d 38 86 61 00 	mov    r11d,DWORD PTR [rip+0x618638]        # 0x14098a1b0
   140371b78:	48 69 c7 de aa 01 00 	imul   rax,rdi,0x1aade
   140371b7f:	48 03 c1             	add    rax,rcx
   140371b82:	f3 41 0f 10 8c 87 08 	movss  xmm1,DWORD PTR [r15+rax*4+0x98a608]
   140371b89:	a6 98 00 
   140371b8c:	f3 0f 5c c8          	subss  xmm1,xmm0
   140371b90:	49 63 c1             	movsxd rax,r9d
   140371b93:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140371b9a:	46 0f b7 84 39 14 37 	movzx  r8d,WORD PTR [rcx+r15*1+0x9c3714]
   140371ba1:	9c 00 
   140371ba3:	41 83 f8 06          	cmp    r8d,0x6
   140371ba7:	72 14                	jb     0x140371bbd
   140371ba9:	b8 ab aa aa aa       	mov    eax,0xaaaaaaab
   140371bae:	41 f7 e0             	mul    r8d
   140371bb1:	d1 ea                	shr    edx,1
   140371bb3:	8d 0c 52             	lea    ecx,[rdx+rdx*2]
   140371bb6:	44 3b c1             	cmp    r8d,ecx
   140371bb9:	44 0f 44 c2          	cmove  r8d,edx
   140371bbd:	66 41 0f 6e c0       	movd   xmm0,r8d
   140371bc2:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140371bc5:	f3 0f 10 55 84       	movss  xmm2,DWORD PTR [rbp-0x7c]
   140371bca:	f3 0f 5e c8          	divss  xmm1,xmm0
   140371bce:	0f 28 c2             	movaps xmm0,xmm2
   140371bd1:	f3 0f 59 0d 2f 55 32 	mulss  xmm1,DWORD PTR [rip+0x32552f]        # 0x140697108
   140371bd8:	00 
   140371bd9:	f3 0f 5c c1          	subss  xmm0,xmm1
   140371bdd:	0f 2f f0             	comiss xmm6,xmm0
   140371be0:	76 0a                	jbe    0x140371bec
   140371be2:	f3 0f 5c 55 88       	subss  xmm2,DWORD PTR [rbp-0x78]
   140371be7:	f3 44 0f 58 c2       	addss  xmm8,xmm2
   140371bec:	44 8b 05 b9 7d 5c 00 	mov    r8d,DWORD PTR [rip+0x5c7db9]        # 0x1409399ac
   140371bf3:	44 0f b6 0d d6 44 b9 	movzx  r9d,BYTE PTR [rip+0x14b944d6]        # 0x154f060d1
   140371bfa:	14 
   140371bfb:	80 bd d8 00 00 00 00 	cmp    BYTE PTR [rbp+0xd8],0x0
   140371c02:	0f 84 24 06 00 00    	je     0x14037222c
   140371c08:	83 7c 24 5c 00       	cmp    DWORD PTR [rsp+0x5c],0x0
   140371c0d:	0f 8f 24 06 00 00    	jg     0x140372237
   140371c13:	45 84 c9             	test   r9b,r9b
   140371c16:	75 05                	jne    0x140371c1d
   140371c18:	45 85 c0             	test   r8d,r8d
   140371c1b:	78 10                	js     0x140371c2d
   140371c1d:	44 8b 15 50 00 5d 00 	mov    r10d,DWORD PTR [rip+0x5d0050]        # 0x140941c74
   140371c24:	45 85 d2             	test   r10d,r10d
   140371c27:	78 04                	js     0x140371c2d
   140371c29:	33 ff                	xor    edi,edi
   140371c2b:	eb 05                	jmp    0x140371c32
   140371c2d:	33 ff                	xor    edi,edi
   140371c2f:	44 8b d7             	mov    r10d,edi
   140371c32:	44 3b 15 3f 00 5d 00 	cmp    r10d,DWORD PTR [rip+0x5d003f]        # 0x140941c78
   140371c39:	4c 8d 35 c0 e3 c8 ff 	lea    r14,[rip+0xffffffffffc8e3c0]        # 0x140000000
   140371c40:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   140371c44:	44 0f 4c 15 2c 00 5d 	cmovl  r10d,DWORD PTR [rip+0x5d002c]        # 0x140941c78
   140371c4b:	00 
   140371c4c:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140371c53:	44 89 54 24 54       	mov    DWORD PTR [rsp+0x54],r10d
   140371c58:	42 8b 84 30 d8 a5 98 	mov    eax,DWORD PTR [rax+r14*1+0x98a5d8]
   140371c5f:	00 
   140371c60:	8d 50 ff             	lea    edx,[rax-0x1]
   140371c63:	89 95 e0 00 00 00    	mov    DWORD PTR [rbp+0xe0],edx
   140371c69:	41 3b c2             	cmp    eax,r10d
   140371c6c:	0f 8e ba 05 00 00    	jle    0x14037222c
   140371c72:	48 63 c2             	movsxd rax,edx
   140371c75:	4c 8d 14 c0          	lea    r10,[rax+rax*8]
   140371c79:	49 c1 e2 04          	shl    r10,0x4
   140371c7d:	4c 89 54 24 48       	mov    QWORD PTR [rsp+0x48],r10
   140371c82:	89 95 e8 00 00 00    	mov    DWORD PTR [rbp+0xe8],edx
   140371c88:	41 8b 14 24          	mov    edx,DWORD PTR [r12]
   140371c8c:	48 69 c2 78 ab 06 00 	imul   rax,rdx,0x6ab78
   140371c93:	4a 8b 84 30 d0 a5 98 	mov    rax,QWORD PTR [rax+r14*1+0x98a5d0]
   140371c9a:	00 
   140371c9b:	4d 8d 3c 02          	lea    r15,[r10+rax*1]
   140371c9f:	4d 8b 54 02 30       	mov    r10,QWORD PTR [r10+rax*1+0x30]
   140371ca4:	4c 89 54 24 68       	mov    QWORD PTR [rsp+0x68],r10
   140371ca9:	45 84 c9             	test   r9b,r9b
   140371cac:	75 05                	jne    0x140371cb3
   140371cae:	45 85 c0             	test   r8d,r8d
   140371cb1:	78 2c                	js     0x140371cdf
   140371cb3:	41 0f b7 82 1c 02 00 	movzx  eax,WORD PTR [r10+0x21c]
   140371cba:	00 
   140371cbb:	b9 00 08 00 00       	mov    ecx,0x800
   140371cc0:	66 85 c1             	test   cx,ax
   140371cc3:	0f 85 92 03 00 00    	jne    0x14037205b
   140371cc9:	45 85 c0             	test   r8d,r8d
   140371ccc:	78 11                	js     0x140371cdf
   140371cce:	83 3d 9f ff 5c 00 00 	cmp    DWORD PTR [rip+0x5cff9f],0x0        # 0x140941c74
   140371cd5:	7d 08                	jge    0x140371cdf
   140371cd7:	a8 20                	test   al,0x20
   140371cd9:	0f 84 46 05 00 00    	je     0x140372225
   140371cdf:	85 d2                	test   edx,edx
   140371ce1:	8b c2                	mov    eax,edx
   140371ce3:	41 0f 48 c3          	cmovs  eax,r11d
   140371ce7:	48 98                	cdqe
   140371ce9:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140371cf0:	f3 42 0f 10 94 31 20 	movss  xmm2,DWORD PTR [rcx+r14*1+0x9c3720]
   140371cf7:	37 9c 00 
   140371cfa:	41 0f 2e d1          	ucomiss xmm2,xmm9
   140371cfe:	7a 07                	jp     0x140371d07
   140371d00:	75 05                	jne    0x140371d07
   140371d02:	44 8b ef             	mov    r13d,edi
   140371d05:	eb 1f                	jmp    0x140371d26
   140371d07:	f3 41 0f 10 47 08    	movss  xmm0,DWORD PTR [r15+0x8]
   140371d0d:	f3 41 0f 58 c1       	addss  xmm0,xmm9
   140371d12:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140371d15:	0f 5a c2             	cvtps2pd xmm0,xmm2
   140371d18:	f2 41 0f 58 cd       	addsd  xmm1,xmm13
   140371d1d:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140371d21:	f2 44 0f 2c e9       	cvttsd2si r13d,xmm1
   140371d26:	85 d2                	test   edx,edx
   140371d28:	41 0f 48 d3          	cmovs  edx,r11d
   140371d2c:	48 63 c2             	movsxd rax,edx
   140371d2f:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140371d36:	f3 42 0f 10 94 31 20 	movss  xmm2,DWORD PTR [rcx+r14*1+0x9c3720]
   140371d3d:	37 9c 00 
   140371d40:	41 0f 2e d1          	ucomiss xmm2,xmm9
   140371d44:	7a 06                	jp     0x140371d4c
   140371d46:	75 04                	jne    0x140371d4c
   140371d48:	8b f7                	mov    esi,edi
   140371d4a:	eb 1e                	jmp    0x140371d6a
   140371d4c:	f3 41 0f 10 47 0c    	movss  xmm0,DWORD PTR [r15+0xc]
   140371d52:	f3 41 0f 58 c1       	addss  xmm0,xmm9
   140371d57:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140371d5a:	0f 5a c2             	cvtps2pd xmm0,xmm2
   140371d5d:	f2 41 0f 58 cd       	addsd  xmm1,xmm13
   140371d62:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140371d66:	f2 0f 2c f1          	cvttsd2si esi,xmm1
   140371d6a:	44 8b 33             	mov    r14d,DWORD PTR [rbx]
   140371d6d:	44 8b 63 04          	mov    r12d,DWORD PTR [rbx+0x4]
   140371d71:	45 84 c9             	test   r9b,r9b
   140371d74:	75 0c                	jne    0x140371d82
   140371d76:	41 8b fe             	mov    edi,r14d
   140371d79:	45 85 c0             	test   r8d,r8d
   140371d7c:	0f 88 50 01 00 00    	js     0x140371ed2
   140371d82:	0f 28 f7             	movaps xmm6,xmm7
   140371d85:	45 84 c9             	test   r9b,r9b
   140371d88:	75 0b                	jne    0x140371d95
   140371d8a:	45 85 c0             	test   r8d,r8d
   140371d8d:	0f 88 9b 00 00 00    	js     0x140371e2e
   140371d93:	eb 05                	jmp    0x140371d9a
   140371d95:	45 85 c0             	test   r8d,r8d
   140371d98:	78 1e                	js     0x140371db8
   140371d9a:	f3 0f 10 05 36 43 b9 	movss  xmm0,DWORD PTR [rip+0x14b94336]        # 0x154f060d8
   140371da1:	14 
   140371da2:	f3 0f 10 15 32 43 b9 	movss  xmm2,DWORD PTR [rip+0x14b94332]        # 0x154f060dc
   140371da9:	14 
   140371daa:	f3 0f 11 44 24 78    	movss  DWORD PTR [rsp+0x78],xmm0
   140371db0:	f3 0f 11 54 24 7c    	movss  DWORD PTR [rsp+0x7c],xmm2
   140371db6:	eb 36                	jmp    0x140371dee
   140371db8:	48 8d 54 24 7c       	lea    rdx,[rsp+0x7c]
   140371dbd:	48 8d 4c 24 78       	lea    rcx,[rsp+0x78]
   140371dc2:	e8 c9 03 0f 00       	call   0x140462190
   140371dc7:	44 0f b6 0d 02 43 b9 	movzx  r9d,BYTE PTR [rip+0x14b94302]        # 0x154f060d1
   140371dce:	14 
   140371dcf:	44 8b 05 d6 7b 5c 00 	mov    r8d,DWORD PTR [rip+0x5c7bd6]        # 0x1409399ac
   140371dd6:	f3 0f 10 44 24 78    	movss  xmm0,DWORD PTR [rsp+0x78]
   140371ddc:	f3 0f 10 54 24 7c    	movss  xmm2,DWORD PTR [rsp+0x7c]
   140371de2:	4c 8b 54 24 68       	mov    r10,QWORD PTR [rsp+0x68]
   140371de7:	44 8b 1d c2 83 61 00 	mov    r11d,DWORD PTR [rip+0x6183c2]        # 0x14098a1b0
   140371dee:	41 0f 2f d1          	comiss xmm2,xmm9
   140371df2:	72 3a                	jb     0x140371e2e
   140371df4:	f3 41 0f 58 c6       	addss  xmm0,xmm14
   140371df9:	0f 2f d0             	comiss xmm2,xmm0
   140371dfc:	76 30                	jbe    0x140371e2e
   140371dfe:	f3 0f 10 0d 46 8a 53 	movss  xmm1,DWORD PTR [rip+0x17538a46]        # 0x1578aa84c
   140371e05:	17 
   140371e06:	0f 28 c2             	movaps xmm0,xmm2
   140371e09:	f3 0f 58 0d 37 8a 53 	addss  xmm1,DWORD PTR [rip+0x17538a37]        # 0x1578aa848
   140371e10:	17 
   140371e11:	f3 41 0f 5c c6       	subss  xmm0,xmm14
   140371e16:	0f 2f c1             	comiss xmm0,xmm1
   140371e19:	76 13                	jbe    0x140371e2e
   140371e1b:	0f 2f fa             	comiss xmm7,xmm2
   140371e1e:	72 0e                	jb     0x140371e2e
   140371e20:	0f 28 f7             	movaps xmm6,xmm7
   140371e23:	f3 41 0f 58 77 08    	addss  xmm6,DWORD PTR [r15+0x8]
   140371e29:	f3 41 0f 5c 37       	subss  xmm6,DWORD PTR [r15]
   140371e2e:	48 8b 95 d0 00 00 00 	mov    rdx,QWORD PTR [rbp+0xd0]
   140371e35:	44 0f 28 e7          	movaps xmm12,xmm7
   140371e39:	f3 44 0f 5c e6       	subss  xmm12,xmm6
   140371e3e:	8b 12                	mov    edx,DWORD PTR [rdx]
   140371e40:	85 d2                	test   edx,edx
   140371e42:	8b c2                	mov    eax,edx
   140371e44:	41 0f 48 c3          	cmovs  eax,r11d
   140371e48:	48 98                	cdqe
   140371e4a:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140371e51:	48 8d 05 a8 e1 c8 ff 	lea    rax,[rip+0xffffffffffc8e1a8]        # 0x140000000
   140371e58:	f3 0f 10 84 01 20 37 	movss  xmm0,DWORD PTR [rcx+rax*1+0x9c3720]
   140371e5f:	9c 00 
   140371e61:	41 0f 2e c1          	ucomiss xmm0,xmm9
   140371e65:	7a 06                	jp     0x140371e6d
   140371e67:	75 04                	jne    0x140371e6d
   140371e69:	33 c0                	xor    eax,eax
   140371e6b:	eb 18                	jmp    0x140371e85
   140371e6d:	0f 57 c9             	xorps  xmm1,xmm1
   140371e70:	f3 41 0f 5a cc       	cvtss2sd xmm1,xmm12
   140371e75:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140371e78:	f2 41 0f 58 cd       	addsd  xmm1,xmm13
   140371e7d:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140371e81:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140371e85:	44 2b f0             	sub    r14d,eax
   140371e88:	85 d2                	test   edx,edx
   140371e8a:	41 8b fe             	mov    edi,r14d
   140371e8d:	41 0f 48 d3          	cmovs  edx,r11d
   140371e91:	48 63 c2             	movsxd rax,edx
   140371e94:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140371e9b:	48 8d 05 5e e1 c8 ff 	lea    rax,[rip+0xffffffffffc8e15e]        # 0x140000000
   140371ea2:	f3 0f 10 84 01 20 37 	movss  xmm0,DWORD PTR [rcx+rax*1+0x9c3720]
   140371ea9:	9c 00 
   140371eab:	41 0f 2e c1          	ucomiss xmm0,xmm9
   140371eaf:	7a 06                	jp     0x140371eb7
   140371eb1:	75 04                	jne    0x140371eb7
   140371eb3:	33 c0                	xor    eax,eax
   140371eb5:	eb 18                	jmp    0x140371ecf
   140371eb7:	0f 57 c9             	xorps  xmm1,xmm1
   140371eba:	f3 41 0f 5a cc       	cvtss2sd xmm1,xmm12
   140371ebf:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140371ec2:	f2 41 0f 58 cd       	addsd  xmm1,xmm13
   140371ec7:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140371ecb:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140371ecf:	44 2b e0             	sub    r12d,eax
   140371ed2:	8b c7                	mov    eax,edi
   140371ed4:	2b c6                	sub    eax,esi
   140371ed6:	83 f8 01             	cmp    eax,0x1
   140371ed9:	0f 8f 6e 01 00 00    	jg     0x14037204d
   140371edf:	41 0f b7 82 1c 02 00 	movzx  eax,WORD PTR [r10+0x21c]
   140371ee6:	00 
   140371ee7:	b9 00 80 00 00       	mov    ecx,0x8000
   140371eec:	66 33 83 1c 02 00 00 	xor    ax,WORD PTR [rbx+0x21c]
   140371ef3:	66 85 c1             	test   cx,ax
   140371ef6:	0f 85 51 01 00 00    	jne    0x14037204d
   140371efc:	41 8b 82 20 02 00 00 	mov    eax,DWORD PTR [r10+0x220]
   140371f03:	39 83 20 02 00 00    	cmp    DWORD PTR [rbx+0x220],eax
   140371f09:	0f 85 3e 01 00 00    	jne    0x14037204d
   140371f0f:	3b fe                	cmp    edi,esi
   140371f11:	0f 8c 36 01 00 00    	jl     0x14037204d
   140371f17:	44 8d 46 ff          	lea    r8d,[rsi-0x1]
   140371f1b:	45 33 c9             	xor    r9d,r9d
   140371f1e:	33 d2                	xor    edx,edx
   140371f20:	49 8b cf             	mov    rcx,r15
   140371f23:	e8 98 d7 ee ff       	call   0x14025f6c0
   140371f28:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140371f2c:	f2 0f 59 05 1c c2 31 	mulsd  xmm0,QWORD PTR [rip+0x31c21c]        # 0x14068e150
   140371f33:	00 
   140371f34:	f2 0f 5e 05 34 c2 31 	divsd  xmm0,QWORD PTR [rip+0x31c234]        # 0x14068e170
   140371f3b:	00 
   140371f3c:	e8 33 ee 2a 00       	call   0x140620d74
   140371f41:	f2 0f 59 05 f7 c1 31 	mulsd  xmm0,QWORD PTR [rip+0x31c1f7]        # 0x14068e140
   140371f48:	00 
   140371f49:	8d 46 ff             	lea    eax,[rsi-0x1]
   140371f4c:	8b 4b 04             	mov    ecx,DWORD PTR [rbx+0x4]
   140371f4f:	3b f8                	cmp    edi,eax
   140371f51:	0f 57 f6             	xorps  xmm6,xmm6
   140371f54:	0f 4c f8             	cmovl  edi,eax
   140371f57:	8b 03                	mov    eax,DWORD PTR [rbx]
   140371f59:	f2 0f 5e 05 b7 c1 31 	divsd  xmm0,QWORD PTR [rip+0x31c1b7]        # 0x14068e118
   140371f60:	00 
   140371f61:	f2 0f 58 05 cf c1 31 	addsd  xmm0,QWORD PTR [rip+0x31c1cf]        # 0x14068e138
   140371f68:	00 
   140371f69:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   140371f6d:	3b c8                	cmp    ecx,eax
   140371f6f:	7e 32                	jle    0x140371fa3
   140371f71:	66 83 bb 1c 02 00 00 	cmp    WORD PTR [rbx+0x21c],0x0
   140371f78:	00 
   140371f79:	7d 0f                	jge    0x140371f8a
   140371f7b:	8b f8                	mov    edi,eax
   140371f7d:	2b f8                	sub    edi,eax
   140371f7f:	48 8b 43 08          	mov    rax,QWORD PTR [rbx+0x8]
   140371f83:	f3 0f 10 04 b8       	movss  xmm0,DWORD PTR [rax+rdi*4]
   140371f88:	eb 1d                	jmp    0x140371fa7
   140371f8a:	3b f8                	cmp    edi,eax
   140371f8c:	0f 4c f8             	cmovl  edi,eax
   140371f8f:	3b f9                	cmp    edi,ecx
   140371f91:	7c 03                	jl     0x140371f96
   140371f93:	8d 79 ff             	lea    edi,[rcx-0x1]
   140371f96:	2b f8                	sub    edi,eax
   140371f98:	48 8b 43 08          	mov    rax,QWORD PTR [rbx+0x8]
   140371f9c:	f3 0f 10 04 b8       	movss  xmm0,DWORD PTR [rax+rdi*4]
   140371fa1:	eb 04                	jmp    0x140371fa7
   140371fa3:	41 0f 28 c1          	movaps xmm0,xmm9
   140371fa7:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140371fab:	f2 0f 59 05 9d c1 31 	mulsd  xmm0,QWORD PTR [rip+0x31c19d]        # 0x14068e150
   140371fb2:	00 
   140371fb3:	f2 0f 5e 05 b5 c1 31 	divsd  xmm0,QWORD PTR [rip+0x31c1b5]        # 0x14068e170
   140371fba:	00 
   140371fbb:	e8 b4 ed 2a 00       	call   0x140620d74
   140371fc0:	f2 0f 59 05 78 c1 31 	mulsd  xmm0,QWORD PTR [rip+0x31c178]        # 0x14068e140
   140371fc7:	00 
   140371fc8:	0f 57 d2             	xorps  xmm2,xmm2
   140371fcb:	f2 0f 10 1d 0d 7a 5c 	movsd  xmm3,QWORD PTR [rip+0x5c7a0d]        # 0x1409399e0
   140371fd2:	00 
   140371fd3:	f2 0f 5e 05 3d c1 31 	divsd  xmm0,QWORD PTR [rip+0x31c13d]        # 0x14068e118
   140371fda:	00 
   140371fdb:	f2 0f 58 05 55 c1 31 	addsd  xmm0,QWORD PTR [rip+0x31c155]        # 0x14068e138
   140371fe2:	00 
   140371fe3:	f2 0f 5a d0          	cvtsd2ss xmm2,xmm0
   140371fe7:	0f 28 c6             	movaps xmm0,xmm6
   140371fea:	f3 0f 5c c2          	subss  xmm0,xmm2
   140371fee:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140371ff1:	66 0f 2f cb          	comisd xmm1,xmm3
   140371ff5:	77 47                	ja     0x14037203e
   140371ff7:	f3 0f 5c d6          	subss  xmm2,xmm6
   140371ffb:	0f 5a c2             	cvtps2pd xmm0,xmm2
   140371ffe:	66 0f 2f c3          	comisd xmm0,xmm3
   140372002:	77 3a                	ja     0x14037203e
   140372004:	45 3b ec             	cmp    r13d,r12d
   140372007:	7f 35                	jg     0x14037203e
   140372009:	45 3b ee             	cmp    r13d,r14d
   14037200c:	0f 8e af 00 00 00    	jle    0x1403720c1
   140372012:	f3 0f 10 05 92 81 61 	movss  xmm0,DWORD PTR [rip+0x618192]        # 0x14098a1ac
   140372019:	00 
   14037201a:	b9 01 00 00 00       	mov    ecx,0x1
   14037201f:	f3 0f 59 05 cd 50 32 	mulss  xmm0,DWORD PTR [rip+0x3250cd]        # 0x1406970f4
   140372026:	00 
   140372027:	f3 41 0f 58 c3       	addss  xmm0,xmm11
   14037202c:	f3 0f 2c c0          	cvttss2si eax,xmm0
   140372030:	3b c1                	cmp    eax,ecx
   140372032:	0f 4f c8             	cmovg  ecx,eax
   140372035:	42 8d 04 29          	lea    eax,[rcx+r13*1]
   140372039:	44 3b e0             	cmp    r12d,eax
   14037203c:	7f 5a                	jg     0x140372098
   14037203e:	44 0f b6 0d 8b 40 b9 	movzx  r9d,BYTE PTR [rip+0x14b9408b]        # 0x154f060d1
   140372045:	14 
   140372046:	44 8b 05 5f 79 5c 00 	mov    r8d,DWORD PTR [rip+0x5c795f]        # 0x1409399ac
   14037204d:	4c 8b a5 d0 00 00 00 	mov    r12,QWORD PTR [rbp+0xd0]
   140372054:	4c 8d 35 a5 df c8 ff 	lea    r14,[rip+0xffffffffffc8dfa5]        # 0x140000000
   14037205b:	8b 95 e0 00 00 00    	mov    edx,DWORD PTR [rbp+0xe0]
   140372061:	4c 8b 54 24 48       	mov    r10,QWORD PTR [rsp+0x48]
   140372066:	ff ca                	dec    edx
   140372068:	8b 85 e8 00 00 00    	mov    eax,DWORD PTR [rbp+0xe8]
   14037206e:	49 81 ea 90 00 00 00 	sub    r10,0x90
   140372075:	89 95 e0 00 00 00    	mov    DWORD PTR [rbp+0xe0],edx
   14037207b:	4c 89 54 24 48       	mov    QWORD PTR [rsp+0x48],r10
   140372080:	3b 44 24 54          	cmp    eax,DWORD PTR [rsp+0x54]
   140372084:	0f 8e 9b 01 00 00    	jle    0x140372225
   14037208a:	44 8b 1d 1f 81 61 00 	mov    r11d,DWORD PTR [rip+0x61811f]        # 0x14098a1b0
   140372091:	33 ff                	xor    edi,edi
   140372093:	e9 ea fb ff ff       	jmp    0x140371c82
   140372098:	48 8b 85 d0 00 00 00 	mov    rax,QWORD PTR [rbp+0xd0]
   14037209f:	8b b5 e0 00 00 00    	mov    esi,DWORD PTR [rbp+0xe0]
   1403720a5:	8b d6                	mov    edx,esi
   1403720a7:	8b 08                	mov    ecx,DWORD PTR [rax]
   1403720a9:	e8 62 be ef ff       	call   0x14026df10
   1403720ae:	45 8b c5             	mov    r8d,r13d
   1403720b1:	41 8b d6             	mov    edx,r14d
   1403720b4:	45 2b c6             	sub    r8d,r14d
   1403720b7:	48 8b cb             	mov    rcx,rbx
   1403720ba:	e8 b1 ab ff ff       	call   0x14036cc70
   1403720bf:	eb 16                	jmp    0x1403720d7
   1403720c1:	48 8b 85 d0 00 00 00 	mov    rax,QWORD PTR [rbp+0xd0]
   1403720c8:	8b b5 e0 00 00 00    	mov    esi,DWORD PTR [rbp+0xe0]
   1403720ce:	8b d6                	mov    edx,esi
   1403720d0:	8b 08                	mov    ecx,DWORD PTR [rax]
   1403720d2:	e8 39 be ef ff       	call   0x14026df10
   1403720d7:	8b 44 24 30          	mov    eax,DWORD PTR [rsp+0x30]
   1403720db:	4c 8b c3             	mov    r8,rbx
   1403720de:	48 8b 7c 24 68       	mov    rdi,QWORD PTR [rsp+0x68]
   1403720e3:	3b f0                	cmp    esi,eax
   1403720e5:	48 8b d7             	mov    rdx,rdi
   1403720e8:	0f 42 c6             	cmovb  eax,esi
   1403720eb:	45 2b e5             	sub    r12d,r13d
   1403720ee:	44 89 63 04          	mov    DWORD PTR [rbx+0x4],r12d
   1403720f2:	45 2b f5             	sub    r14d,r13d
   1403720f5:	4c 8b a5 d0 00 00 00 	mov    r12,QWORD PTR [rbp+0xd0]
   1403720fc:	45 33 c9             	xor    r9d,r9d
   1403720ff:	49 8b cc             	mov    rcx,r12
   140372102:	89 44 24 30          	mov    DWORD PTR [rsp+0x30],eax
   140372106:	44 89 33             	mov    DWORD PTR [rbx],r14d
   140372109:	e8 62 df ff ff       	call   0x140370070
   14037210e:	ba c0 02 00 00       	mov    edx,0x2c0
   140372113:	48 8b cb             	mov    rcx,rbx
   140372116:	e8 3d 94 2a 00       	call   0x14061b558
   14037211b:	33 d2                	xor    edx,edx
   14037211d:	48 8b cf             	mov    rcx,rdi
   140372120:	e8 eb 5a 00 00       	call   0x140377c10
   140372125:	66 0f 6e 4f 04       	movd   xmm1,DWORD PTR [rdi+0x4]
   14037212a:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14037212d:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140372131:	f3 41 0f 58 47 08    	addss  xmm0,DWORD PTR [r15+0x8]
   140372137:	f3 41 0f 11 47 04    	movss  DWORD PTR [r15+0x4],xmm0
   14037213d:	f3 41 0f 11 47 14    	movss  DWORD PTR [r15+0x14],xmm0
   140372143:	f3 41 0f 11 47 1c    	movss  DWORD PTR [r15+0x1c],xmm0
   140372149:	f3 41 0f 11 47 0c    	movss  DWORD PTR [r15+0xc],xmm0
   14037214f:	80 3d 7b 3f b9 14 00 	cmp    BYTE PTR [rip+0x14b93f7b],0x0        # 0x154f060d1
   140372156:	75 09                	jne    0x140372161
   140372158:	83 3d 4d 78 5c 00 00 	cmp    DWORD PTR [rip+0x5c784d],0x0        # 0x1409399ac
   14037215f:	7c 45                	jl     0x1403721a6
   140372161:	33 c0                	xor    eax,eax
   140372163:	f3 41 0f 58 c4       	addss  xmm0,xmm12
   140372168:	44 0f b7 c8          	movzx  r9d,ax
   14037216c:	f3 41 0f 11 47 04    	movss  DWORD PTR [r15+0x4],xmm0
   140372172:	66 3b 87 68 02 00 00 	cmp    ax,WORD PTR [rdi+0x268]
   140372179:	73 2b                	jae    0x1403721a6
   14037217b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140372180:	48 8b 97 60 02 00 00 	mov    rdx,QWORD PTR [rdi+0x260]
   140372187:	41 8b 47 0c          	mov    eax,DWORD PTR [r15+0xc]
   14037218b:	45 0f b7 c1          	movzx  r8d,r9w
   14037218f:	66 41 ff c1          	inc    r9w
   140372193:	49 c1 e0 05          	shl    r8,0x5
   140372197:	41 89 44 10 14       	mov    DWORD PTR [r8+rdx*1+0x14],eax
   14037219c:	66 44 3b 8f 68 02 00 	cmp    r9w,WORD PTR [rdi+0x268]
   1403721a3:	00 
   1403721a4:	72 da                	jb     0x140372180
   1403721a6:	41 8b 0c 24          	mov    ecx,DWORD PTR [r12]
   1403721aa:	8b d6                	mov    edx,esi
   1403721ac:	e8 ef bd ef ff       	call   0x14026dfa0
   1403721b1:	33 d2                	xor    edx,edx
   1403721b3:	49 8b cf             	mov    rcx,r15
   1403721b6:	44 8d 42 ff          	lea    r8d,[rdx-0x1]
   1403721ba:	e8 c1 da ee ff       	call   0x14025fc80
   1403721bf:	8b 05 eb 7f 61 00    	mov    eax,DWORD PTR [rip+0x617feb]        # 0x14098a1b0
   1403721c5:	41 39 04 24          	cmp    DWORD PTR [r12],eax
   1403721c9:	0f 85 7f 03 00 00    	jne    0x14037254e
   1403721cf:	80 3d fb 3e b9 14 00 	cmp    BYTE PTR [rip+0x14b93efb],0x0        # 0x154f060d1
   1403721d6:	75 0d                	jne    0x1403721e5
   1403721d8:	83 3d cd 77 5c 00 00 	cmp    DWORD PTR [rip+0x5c77cd],0x0        # 0x1409399ac
   1403721df:	0f 8c 69 03 00 00    	jl     0x14037254e
   1403721e5:	44 8b 7c 24 60       	mov    r15d,DWORD PTR [rsp+0x60]
   1403721ea:	0f 57 f6             	xorps  xmm6,xmm6
   1403721ed:	f3 0f 10 3d 3b de 4d 	movss  xmm7,DWORD PTR [rip+0x4dde3b]        # 0x140850030
   1403721f4:	00 
   1403721f5:	4c 8b 74 24 40       	mov    r14,QWORD PTR [rsp+0x40]
   1403721fa:	44 8b 6c 24 30       	mov    r13d,DWORD PTR [rsp+0x30]
   1403721ff:	8b 5c 24 38          	mov    ebx,DWORD PTR [rsp+0x38]
   140372203:	41 81 ff 00 04 00 00 	cmp    r15d,0x400
   14037220a:	0f 83 b5 f6 ff ff    	jae    0x1403718c5
   140372210:	48 8b 4d 90          	mov    rcx,QWORD PTR [rbp-0x70]
   140372214:	42 89 34 b9          	mov    DWORD PTR [rcx+r15*4],esi
   140372218:	41 ff c7             	inc    r15d
   14037221b:	44 89 7c 24 60       	mov    DWORD PTR [rsp+0x60],r15d
   140372220:	e9 a0 f6 ff ff       	jmp    0x1403718c5
   140372225:	48 8d b3 7c 02 00 00 	lea    rsi,[rbx+0x27c]
   14037222c:	83 7c 24 5c 00       	cmp    DWORD PTR [rsp+0x5c],0x0
   140372231:	0f 8c 17 03 00 00    	jl     0x14037254e
   140372237:	41 8b 0c 24          	mov    ecx,DWORD PTR [r12]
   14037223b:	41 bf 01 00 00 00    	mov    r15d,0x1
   140372241:	45 8b c7             	mov    r8d,r15d
   140372244:	33 d2                	xor    edx,edx
   140372246:	e8 75 34 fe ff       	call   0x1403556c0
   14037224b:	84 c0                	test   al,al
   14037224d:	0f 84 1a 03 00 00    	je     0x14037256d
   140372253:	41 8b 0c 24          	mov    ecx,DWORD PTR [r12]
   140372257:	48 8d 15 a2 dd c8 ff 	lea    rdx,[rip+0xffffffffffc8dda2]        # 0x140000000
   14037225e:	48 69 c1 78 ab 06 00 	imul   rax,rcx,0x6ab78
   140372265:	44 8b b4 10 d8 a5 98 	mov    r14d,DWORD PTR [rax+rdx*1+0x98a5d8]
   14037226c:	00 
   14037226d:	41 8b d6             	mov    edx,r14d
   140372270:	e8 9b bc ef ff       	call   0x14026df10
   140372275:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   140372279:	48 8d 15 80 dd c8 ff 	lea    rdx,[rip+0xffffffffffc8dd80]        # 0x140000000
   140372280:	44 8b 6c 24 30       	mov    r13d,DWORD PTR [rsp+0x30]
   140372285:	4b 8d 3c f6          	lea    rdi,[r14+r14*8]
   140372289:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372290:	ff 84 11 d8 a5 98 00 	inc    DWORD PTR [rcx+rdx*1+0x98a5d8]
   140372297:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   14037229b:	45 3b f5             	cmp    r14d,r13d
   14037229e:	45 0f 42 ee          	cmovb  r13d,r14d
   1403722a2:	48 c1 e7 04          	shl    rdi,0x4
   1403722a6:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403722ad:	44 89 6c 24 30       	mov    DWORD PTR [rsp+0x30],r13d
   1403722b2:	48 03 bc 11 d0 a5 98 	add    rdi,QWORD PTR [rcx+rdx*1+0x98a5d0]
   1403722b9:	00 
   1403722ba:	41 8b d7             	mov    edx,r15d
   1403722bd:	48 8b cf             	mov    rcx,rdi
   1403722c0:	e8 db d0 ee ff       	call   0x14025f3a0
   1403722c5:	49 8b cc             	mov    rcx,r12
   1403722c8:	e8 63 25 01 00       	call   0x140384830
   1403722cd:	66 89 43 20          	mov    WORD PTR [rbx+0x20],ax
   1403722d1:	80 3d f9 3d b9 14 00 	cmp    BYTE PTR [rip+0x14b93df9],0x0        # 0x154f060d1
   1403722d8:	75 10                	jne    0x1403722ea
   1403722da:	83 3d cb 76 5c 00 00 	cmp    DWORD PTR [rip+0x5c76cb],0x0        # 0x1409399ac
   1403722e1:	7d 07                	jge    0x1403722ea
   1403722e3:	8b 13                	mov    edx,DWORD PTR [rbx]
   1403722e5:	e9 a0 00 00 00       	jmp    0x14037238a
   1403722ea:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   1403722ee:	4c 8d 0d 0b dd c8 ff 	lea    r9,[rip+0xffffffffffc8dd0b]        # 0x140000000
   1403722f5:	85 c0                	test   eax,eax
   1403722f7:	0f 48 05 b2 7e 61 00 	cmovs  eax,DWORD PTR [rip+0x617eb2]        # 0x14098a1b0
   1403722fe:	48 98                	cdqe
   140372300:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372307:	f3 42 0f 10 84 09 20 	movss  xmm0,DWORD PTR [rcx+r9*1+0x9c3720]
   14037230e:	37 9c 00 
   140372311:	41 0f 2e c1          	ucomiss xmm0,xmm9
   140372315:	7a 0a                	jp     0x140372321
   140372317:	75 08                	jne    0x140372321
   140372319:	45 33 c0             	xor    r8d,r8d
   14037231c:	41 8b c0             	mov    eax,r8d
   14037231f:	eb 1b                	jmp    0x14037233c
   140372321:	0f 57 c9             	xorps  xmm1,xmm1
   140372324:	45 33 c0             	xor    r8d,r8d
   140372327:	f3 41 0f 5a c8       	cvtss2sd xmm1,xmm8
   14037232c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14037232f:	f2 41 0f 58 cd       	addsd  xmm1,xmm13
   140372334:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140372338:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   14037233c:	8b 13                	mov    edx,DWORD PTR [rbx]
   14037233e:	2b d0                	sub    edx,eax
   140372340:	89 13                	mov    DWORD PTR [rbx],edx
   140372342:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   140372346:	85 c0                	test   eax,eax
   140372348:	0f 48 05 61 7e 61 00 	cmovs  eax,DWORD PTR [rip+0x617e61]        # 0x14098a1b0
   14037234f:	48 98                	cdqe
   140372351:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372358:	f3 42 0f 10 84 09 20 	movss  xmm0,DWORD PTR [rcx+r9*1+0x9c3720]
   14037235f:	37 9c 00 
   140372362:	41 0f 2e c1          	ucomiss xmm0,xmm9
   140372366:	7a 07                	jp     0x14037236f
   140372368:	75 05                	jne    0x14037236f
   14037236a:	41 8b c0             	mov    eax,r8d
   14037236d:	eb 18                	jmp    0x140372387
   14037236f:	0f 57 c9             	xorps  xmm1,xmm1
   140372372:	f3 41 0f 5a c8       	cvtss2sd xmm1,xmm8
   140372377:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14037237a:	f2 41 0f 58 cd       	addsd  xmm1,xmm13
   14037237f:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140372383:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140372387:	29 43 04             	sub    DWORD PTR [rbx+0x4],eax
   14037238a:	48 8b 43 18          	mov    rax,QWORD PTR [rbx+0x18]
   14037238e:	48 85 c0             	test   rax,rax
   140372391:	66 0f 6e c2          	movd   xmm0,edx
   140372395:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140372398:	48 0f 44 c6          	cmove  rax,rsi
   14037239c:	f3 0f 59 00          	mulss  xmm0,DWORD PTR [rax]
   1403723a0:	f3 0f 11 47 08       	movss  DWORD PTR [rdi+0x8],xmm0
   1403723a5:	48 8b 43 18          	mov    rax,QWORD PTR [rbx+0x18]
   1403723a9:	66 0f 6e 43 04       	movd   xmm0,DWORD PTR [rbx+0x4]
   1403723ae:	48 85 c0             	test   rax,rax
   1403723b1:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403723b4:	48 0f 44 c6          	cmove  rax,rsi
   1403723b8:	33 f6                	xor    esi,esi
   1403723ba:	33 d2                	xor    edx,edx
   1403723bc:	44 8d 46 ff          	lea    r8d,[rsi-0x1]
   1403723c0:	f3 0f 59 00          	mulss  xmm0,DWORD PTR [rax]
   1403723c4:	f3 0f 11 47 0c       	movss  DWORD PTR [rdi+0xc],xmm0
   1403723c9:	48 89 5f 30          	mov    QWORD PTR [rdi+0x30],rbx
   1403723cd:	8b 0d 55 6c 5c 00    	mov    ecx,DWORD PTR [rip+0x5c6c55]        # 0x140939028
   1403723d3:	8d 41 01             	lea    eax,[rcx+0x1]
   1403723d6:	89 05 4c 6c 5c 00    	mov    DWORD PTR [rip+0x5c6c4c],eax        # 0x140939028
   1403723dc:	48 8b 47 30          	mov    rax,QWORD PTR [rdi+0x30]
   1403723e0:	89 88 28 02 00 00    	mov    DWORD PTR [rax+0x228],ecx
   1403723e6:	48 8b cf             	mov    rcx,rdi
   1403723e9:	48 8b 47 30          	mov    rax,QWORD PTR [rdi+0x30]
   1403723ed:	c7 80 24 02 00 00 ff 	mov    DWORD PTR [rax+0x224],0xffffffff
   1403723f4:	ff ff ff 
   1403723f7:	8b 03                	mov    eax,DWORD PTR [rbx]
   1403723f9:	29 43 04             	sub    DWORD PTR [rbx+0x4],eax
   1403723fc:	89 33                	mov    DWORD PTR [rbx],esi
   1403723fe:	e8 7d d8 ee ff       	call   0x14025fc80
   140372403:	66 83 8b 1c 02 00 00 	or     WORD PTR [rbx+0x21c],0x20
   14037240a:	20 
   14037240b:	40 38 35 bf 3c b9 14 	cmp    BYTE PTR [rip+0x14b93cbf],sil        # 0x154f060d1
   140372412:	75 26                	jne    0x14037243a
   140372414:	39 35 92 75 5c 00    	cmp    DWORD PTR [rip+0x5c7592],esi        # 0x1409399ac
   14037241a:	7d 1e                	jge    0x14037243a
   14037241c:	0f b7 05 3d 72 5c 00 	movzx  eax,WORD PTR [rip+0x5c723d]        # 0x140939660
   140372423:	b9 ff ff 00 00       	mov    ecx,0xffff
   140372428:	66 3b c1             	cmp    ax,cx
   14037242b:	0f 84 a1 00 00 00    	je     0x1403724d2
   140372431:	66 89 43 20          	mov    WORD PTR [rbx+0x20],ax
   140372435:	e9 98 00 00 00       	jmp    0x1403724d2
   14037243a:	f3 0f 10 4f 08       	movss  xmm1,DWORD PTR [rdi+0x8]
   14037243f:	f3 0f 10 47 0c       	movss  xmm0,DWORD PTR [rdi+0xc]
   140372444:	f3 41 0f 5c c9       	subss  xmm1,xmm9
   140372449:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   14037244e:	44 0f 2f c9          	comiss xmm9,xmm1
   140372452:	f3 0f 11 4f 08       	movss  DWORD PTR [rdi+0x8],xmm1
   140372457:	f3 0f 11 47 0c       	movss  DWORD PTR [rdi+0xc],xmm0
   14037245c:	76 0c                	jbe    0x14037246a
   14037245e:	f3 0f 5c c1          	subss  xmm0,xmm1
   140372462:	89 77 08             	mov    DWORD PTR [rdi+0x8],esi
   140372465:	f3 0f 11 47 0c       	movss  DWORD PTR [rdi+0xc],xmm0
   14037246a:	41 8b 14 24          	mov    edx,DWORD PTR [r12]
   14037246e:	48 8d 0d db f3 5c 00 	lea    rcx,[rip+0x5cf3db]        # 0x140941850
   140372475:	e8 e6 57 09 00       	call   0x140407c60
   14037247a:	66 41 83 7c 24 14 00 	cmp    WORD PTR [r12+0x14],0x0
   140372481:	0f b7 f0             	movzx  esi,ax
   140372484:	75 36                	jne    0x1403724bc
   140372486:	0f b7 c8             	movzx  ecx,ax
   140372489:	e8 22 b1 09 00       	call   0x14040d5b0
   14037248e:	84 c0                	test   al,al
   140372490:	74 2a                	je     0x1403724bc
   140372492:	0f b7 4b 20          	movzx  ecx,WORD PTR [rbx+0x20]
   140372496:	83 c1 e1             	add    ecx,0xffffffe1
   140372499:	83 f9 12             	cmp    ecx,0x12
   14037249c:	77 1e                	ja     0x1403724bc
   14037249e:	48 63 c1             	movsxd rax,ecx
   1403724a1:	48 8d 15 58 db c8 ff 	lea    rdx,[rip+0xffffffffffc8db58]        # 0x140000000
   1403724a8:	0f b6 84 02 6c 27 37 	movzx  eax,BYTE PTR [rdx+rax*1+0x37276c]
   1403724af:	00 
   1403724b0:	8b 8c 82 64 27 37 00 	mov    ecx,DWORD PTR [rdx+rax*4+0x372764]
   1403724b7:	48 03 ca             	add    rcx,rdx
   1403724ba:	ff e1                	jmp    rcx
   1403724bc:	66 89 73 20          	mov    WORD PTR [rbx+0x20],si
   1403724c0:	45 8b 04 24          	mov    r8d,DWORD PTR [r12]
   1403724c4:	45 33 c9             	xor    r9d,r9d
   1403724c7:	41 8b d6             	mov    edx,r14d
   1403724ca:	41 8b cf             	mov    ecx,r15d
   1403724cd:	e8 3e 82 0b 00       	call   0x14042a710
   1403724d2:	f3 0f 10 47 0c       	movss  xmm0,DWORD PTR [rdi+0xc]
   1403724d7:	41 0f 2f c7          	comiss xmm0,xmm15
   1403724db:	76 04                	jbe    0x1403724e1
   1403724dd:	44 0f 28 f8          	movaps xmm15,xmm0
   1403724e1:	f3 0f 10 47 08       	movss  xmm0,DWORD PTR [rdi+0x8]
   1403724e6:	f3 0f 10 4f 0c       	movss  xmm1,DWORD PTR [rdi+0xc]
   1403724eb:	f3 0f 11 07          	movss  DWORD PTR [rdi],xmm0
   1403724ef:	f3 0f 11 47 10       	movss  DWORD PTR [rdi+0x10],xmm0
   1403724f4:	f3 0f 11 47 18       	movss  DWORD PTR [rdi+0x18],xmm0
   1403724f9:	f3 0f 11 4f 04       	movss  DWORD PTR [rdi+0x4],xmm1
   1403724fe:	f3 0f 11 4f 14       	movss  DWORD PTR [rdi+0x14],xmm1
   140372503:	f3 0f 11 4f 1c       	movss  DWORD PTR [rdi+0x1c],xmm1
   140372508:	80 3d c2 3b b9 14 00 	cmp    BYTE PTR [rip+0x14b93bc2],0x0        # 0x154f060d1
   14037250f:	75 09                	jne    0x14037251a
   140372511:	83 3d 94 74 5c 00 00 	cmp    DWORD PTR [rip+0x5c7494],0x0        # 0x1409399ac
   140372518:	7c 13                	jl     0x14037252d
   14037251a:	f3 41 0f 58 c0       	addss  xmm0,xmm8
   14037251f:	f3 41 0f 58 c8       	addss  xmm1,xmm8
   140372524:	f3 0f 11 07          	movss  DWORD PTR [rdi],xmm0
   140372528:	f3 0f 11 4f 04       	movss  DWORD PTR [rdi+0x4],xmm1
   14037252d:	41 8b 0c 24          	mov    ecx,DWORD PTR [r12]
   140372531:	41 8b d6             	mov    edx,r14d
   140372534:	e8 67 ba ef ff       	call   0x14026dfa0
   140372539:	f3 0f 10 3d ef da 4d 	movss  xmm7,DWORD PTR [rip+0x4ddaef]        # 0x140850030
   140372540:	00 
   140372541:	0f 57 f6             	xorps  xmm6,xmm6
   140372544:	4c 8b 74 24 40       	mov    r14,QWORD PTR [rsp+0x40]
   140372549:	e9 73 f3 ff ff       	jmp    0x1403718c1
   14037254e:	f3 0f 10 3d da da 4d 	movss  xmm7,DWORD PTR [rip+0x4ddada]        # 0x140850030
   140372555:	00 
   140372556:	0f 57 f6             	xorps  xmm6,xmm6
   140372559:	4c 8b 74 24 40       	mov    r14,QWORD PTR [rsp+0x40]
   14037255e:	e9 59 f3 ff ff       	jmp    0x1403718bc
   140372563:	44 8b 6c 24 30       	mov    r13d,DWORD PTR [rsp+0x30]
   140372568:	e9 58 f3 ff ff       	jmp    0x1403718c5
   14037256d:	4c 8b 74 24 40       	mov    r14,QWORD PTR [rsp+0x40]
   140372572:	44 8b 6c 24 30       	mov    r13d,DWORD PTR [rsp+0x30]
   140372577:	44 8b 7c 24 60       	mov    r15d,DWORD PTR [rsp+0x60]
   14037257c:	48 8b 75 90          	mov    rsi,QWORD PTR [rbp-0x70]
   140372580:	44 0f 28 b4 24 f0 00 	movaps xmm14,XMMWORD PTR [rsp+0xf0]
   140372587:	00 00 
   140372589:	44 0f 28 ac 24 00 01 	movaps xmm13,XMMWORD PTR [rsp+0x100]
   140372590:	00 00 
   140372592:	44 0f 28 a4 24 10 01 	movaps xmm12,XMMWORD PTR [rsp+0x110]
   140372599:	00 00 
   14037259b:	44 0f 28 9c 24 20 01 	movaps xmm11,XMMWORD PTR [rsp+0x120]
   1403725a2:	00 00 
   1403725a4:	44 0f 28 94 24 30 01 	movaps xmm10,XMMWORD PTR [rsp+0x130]
   1403725ab:	00 00 
   1403725ad:	44 0f 28 84 24 50 01 	movaps xmm8,XMMWORD PTR [rsp+0x150]
   1403725b4:	00 00 
   1403725b6:	0f 28 bc 24 60 01 00 	movaps xmm7,XMMWORD PTR [rsp+0x160]
   1403725bd:	00 
   1403725be:	0f 28 b4 24 70 01 00 	movaps xmm6,XMMWORD PTR [rsp+0x170]
   1403725c5:	00 
   1403725c6:	44 0f b6 05 03 3b b9 	movzx  r8d,BYTE PTR [rip+0x14b93b03]        # 0x154f060d1
   1403725cd:	14 
   1403725ce:	8b 15 d8 73 5c 00    	mov    edx,DWORD PTR [rip+0x5c73d8]        # 0x1409399ac
   1403725d4:	45 84 c0             	test   r8b,r8b
   1403725d7:	75 08                	jne    0x1403725e1
   1403725d9:	85 d2                	test   edx,edx
   1403725db:	0f 88 68 00 00 00    	js     0x140372649
   1403725e1:	8b 05 8d f6 5c 00    	mov    eax,DWORD PTR [rip+0x5cf68d]        # 0x140941c74
   1403725e7:	41 3b c5             	cmp    eax,r13d
   1403725ea:	41 0f 4c c5          	cmovl  eax,r13d
   1403725ee:	4c 8d 2d 0b da c8 ff 	lea    r13,[rip+0xffffffffffc8da0b]        # 0x140000000
   1403725f5:	89 05 79 f6 5c 00    	mov    DWORD PTR [rip+0x5cf679],eax        # 0x140941c74
   1403725fb:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   1403725ff:	66 41 0f 6e 44 24 04 	movd   xmm0,DWORD PTR [r12+0x4]
   140372606:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   14037260d:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140372610:	f3 42 0f 59 84 29 20 	mulss  xmm0,DWORD PTR [rcx+r13*1+0x9c3720]
   140372617:	37 9c 00 
   14037261a:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   14037261f:	f3 0f 11 05 75 84 cd 	movss  DWORD PTR [rip+0x14cd8475],xmm0        # 0x15504aa9c
   140372626:	14 
   140372627:	45 84 c0             	test   r8b,r8b
   14037262a:	75 04                	jne    0x140372630
   14037262c:	85 d2                	test   edx,edx
   14037262e:	78 20                	js     0x140372650
   140372630:	33 c9                	xor    ecx,ecx
   140372632:	f3 44 0f 11 3d 0d f2 	movss  DWORD PTR [rip+0x5cf20d],xmm15        # 0x140941848
   140372639:	5c 00 
   14037263b:	c6 05 f8 f1 5c 00 01 	mov    BYTE PTR [rip+0x5cf1f8],0x1        # 0x14094183a
   140372642:	e8 49 c3 09 00       	call   0x14040e990
   140372647:	eb 07                	jmp    0x140372650
   140372649:	4c 8d 2d b0 d9 c8 ff 	lea    r13,[rip+0xffffffffffc8d9b0]        # 0x140000000
   140372650:	8b 05 52 7b 61 00    	mov    eax,DWORD PTR [rip+0x617b52]        # 0x14098a1a8
   140372656:	48 8d 0d 43 c0 33 00 	lea    rcx,[rip+0x33c043]        # 0x1406ae6a0
   14037265d:	66 41 0f 6e 44 24 04 	movd   xmm0,DWORD PTR [r12+0x4]
   140372664:	0f 57 c9             	xorps  xmm1,xmm1
   140372667:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037266a:	0f 57 db             	xorps  xmm3,xmm3
   14037266d:	41 0f 28 d7          	movaps xmm2,xmm15
   140372671:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140372676:	8b 05 d8 7a 61 00    	mov    eax,DWORD PTR [rip+0x617ad8]        # 0x14098a154
   14037267c:	f3 48 0f 2a d8       	cvtsi2ss xmm3,rax
   140372681:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140372685:	f3 0f 5e cb          	divss  xmm1,xmm3
   140372689:	e8 12 43 ff ff       	call   0x1403669a0
   14037268e:	49 8b ce             	mov    rcx,r14
   140372691:	e8 c2 8e 2a 00       	call   0x14061b558
   140372696:	48 8b 0d ab ce 45 17 	mov    rcx,QWORD PTR [rip+0x1745ceab]        # 0x1577cf548
   14037269d:	ba ff ff ff ff       	mov    edx,0xffffffff
   1403726a2:	ff 15 a8 5f 31 00    	call   QWORD PTR [rip+0x315fa8]        # 0x140688650
   1403726a8:	44 0f 28 bc 24 e0 00 	movaps xmm15,XMMWORD PTR [rsp+0xe0]
   1403726af:	00 00 
   1403726b1:	44 0f 28 8c 24 40 01 	movaps xmm9,XMMWORD PTR [rsp+0x140]
   1403726b8:	00 00 
   1403726ba:	4c 8b b4 24 90 01 00 	mov    r14,QWORD PTR [rsp+0x190]
   1403726c1:	00 
   1403726c2:	45 85 ff             	test   r15d,r15d
   1403726c5:	74 46                	je     0x14037270d
   1403726c7:	48 8b de             	mov    rbx,rsi
   1403726ca:	41 8b ff             	mov    edi,r15d
   1403726cd:	0f 1f 00             	nop    DWORD PTR [rax]
   1403726d0:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   1403726d4:	8b 0b                	mov    ecx,DWORD PTR [rbx]
   1403726d6:	48 69 d0 78 ab 06 00 	imul   rdx,rax,0x6ab78
   1403726dd:	42 3b 8c 2a d8 a5 98 	cmp    ecx,DWORD PTR [rdx+r13*1+0x98a5d8]
   1403726e4:	00 
   1403726e5:	73 1c                	jae    0x140372703
   1403726e7:	8b c1                	mov    eax,ecx
   1403726e9:	45 33 c0             	xor    r8d,r8d
   1403726ec:	48 8d 0c c9          	lea    rcx,[rcx+rcx*8]
   1403726f0:	48 c1 e1 04          	shl    rcx,0x4
   1403726f4:	4a 03 8c 2a d0 a5 98 	add    rcx,QWORD PTR [rdx+r13*1+0x98a5d0]
   1403726fb:	00 
   1403726fc:	33 d2                	xor    edx,edx
   1403726fe:	e8 6d f4 11 00       	call   0x140491b70
   140372703:	48 83 c3 04          	add    rbx,0x4
   140372707:	48 83 ef 01          	sub    rdi,0x1
   14037270b:	75 c3                	jne    0x1403726d0
   14037270d:	48 8b 0d 34 ce 45 17 	mov    rcx,QWORD PTR [rip+0x1745ce34]        # 0x1577cf548
   140372714:	ff 15 2e 5f 31 00    	call   QWORD PTR [rip+0x315f2e]        # 0x140688648
   14037271a:	48 8b ce             	mov    rcx,rsi
   14037271d:	e8 36 8e 2a 00       	call   0x14061b558
   140372722:	48 8b 0d df 3b b9 14 	mov    rcx,QWORD PTR [rip+0x14b93bdf]        # 0x154f06308
   140372729:	ff 15 19 5f 31 00    	call   QWORD PTR [rip+0x315f19]        # 0x140688648
   14037272f:	4c 8b bc 24 88 01 00 	mov    r15,QWORD PTR [rsp+0x188]
   140372736:	00 
   140372737:	b0 01                	mov    al,0x1
   140372739:	4c 8b ac 24 98 01 00 	mov    r13,QWORD PTR [rsp+0x198]
   140372740:	00 
   140372741:	48 8b b4 24 a8 01 00 	mov    rsi,QWORD PTR [rsp+0x1a8]
   140372748:	00 
   140372749:	48 8b 9c 24 b0 01 00 	mov    rbx,QWORD PTR [rsp+0x1b0]
   140372750:	00 
   140372751:	48 8b bc 24 a0 01 00 	mov    rdi,QWORD PTR [rsp+0x1a0]
   140372758:	00 
   140372759:	48 81 c4 b8 01 00 00 	add    rsp,0x1b8
   140372760:	41 5c                	pop    r12
   140372762:	5d                   	pop    rbp
   140372763:	c3                   	ret
   140372764:	c0 24 37 00          	shl    BYTE PTR [rdi+rsi*1],0x0
   140372768:	bc 24 37 00 00       	mov    esp,0x3724
   14037276d:	00 00                	add    BYTE PTR [rax],al
   14037276f:	01 01                	add    DWORD PTR [rcx],eax
   140372771:	00 00                	add    BYTE PTR [rax],al
   140372773:	01 01                	add    DWORD PTR [rcx],eax
   140372775:	01 01                	add    DWORD PTR [rcx],eax
   140372777:	00 00                	add    BYTE PTR [rax],al
   140372779:	01 01                	add    DWORD PTR [rcx],eax
   14037277b:	01 01                	add    DWORD PTR [rcx],eax
   14037277d:	01 00                	add    DWORD PTR [rax],eax
   14037277f:	cc                   	int3
   140372780:	cc                   	int3
   140372781:	cc                   	int3
   140372782:	cc                   	int3
   140372783:	cc                   	int3
   140372784:	cc                   	int3
   140372785:	cc                   	int3
   140372786:	cc                   	int3
   140372787:	cc                   	int3
   140372788:	cc                   	int3
   140372789:	cc                   	int3
   14037278a:	cc                   	int3
   14037278b:	cc                   	int3
   14037278c:	cc                   	int3
   14037278d:	cc                   	int3
   14037278e:	cc                   	int3
   14037278f:	cc                   	int3
   140372790:	44 88 4c 24 20       	mov    BYTE PTR [rsp+0x20],r9b
   140372795:	4c 89 44 24 18       	mov    QWORD PTR [rsp+0x18],r8
   14037279a:	89 54 24 10          	mov    DWORD PTR [rsp+0x10],edx
   14037279e:	48 89 4c 24 08       	mov    QWORD PTR [rsp+0x8],rcx
   1403727a3:	53                   	push   rbx
   1403727a4:	55                   	push   rbp
   1403727a5:	56                   	push   rsi
   1403727a6:	57                   	push   rdi
   1403727a7:	41 55                	push   r13
   1403727a9:	48 81 ec 10 01 00 00 	sub    rsp,0x110
   1403727b0:	8b 01                	mov    eax,DWORD PTR [rcx]
   1403727b2:	4c 8d 2d 17 7e 61 00 	lea    r13,[rip+0x617e17]        # 0x14098a5d0
   1403727b9:	41 8b 38             	mov    edi,DWORD PTR [r8]
   1403727bc:	49 8b e8             	mov    rbp,r8
   1403727bf:	4c 69 d0 78 ab 06 00 	imul   r10,rax,0x6ab78
   1403727c6:	44 8b da             	mov    r11d,edx
   1403727c9:	89 7c 24 30          	mov    DWORD PTR [rsp+0x30],edi
   1403727cd:	48 8b f1             	mov    rsi,rcx
   1403727d0:	43 8b 44 2a 08       	mov    eax,DWORD PTR [r10+r13*1+0x8]
   1403727d5:	41 89 00             	mov    DWORD PTR [r8],eax
   1403727d8:	8b 19                	mov    ebx,DWORD PTR [rcx]
   1403727da:	48 69 c3 78 ab 06 00 	imul   rax,rbx,0x6ab78
   1403727e1:	48 89 5c 24 40       	mov    QWORD PTR [rsp+0x40],rbx
   1403727e6:	48 89 44 24 48       	mov    QWORD PTR [rsp+0x48],rax
   1403727eb:	42 8b 44 28 08       	mov    eax,DWORD PTR [rax+r13*1+0x8]
   1403727f0:	89 44 24 38          	mov    DWORD PTR [rsp+0x38],eax
   1403727f4:	3b f8                	cmp    edi,eax
   1403727f6:	0f 8d e7 06 00 00    	jge    0x140372ee3
   1403727fc:	44 8b 15 ad 79 61 00 	mov    r10d,DWORD PTR [rip+0x6179ad]        # 0x14098a1b0
   140372803:	44 8b c7             	mov    r8d,edi
   140372806:	4c 89 a4 24 08 01 00 	mov    QWORD PTR [rsp+0x108],r12
   14037280d:	00 
   14037280e:	4c 89 b4 24 00 01 00 	mov    QWORD PTR [rsp+0x100],r14
   140372815:	00 
   140372816:	4c 89 bc 24 f8 00 00 	mov    QWORD PTR [rsp+0xf8],r15
   14037281d:	00 
   14037281e:	44 8b fb             	mov    r15d,ebx
   140372821:	0f 29 b4 24 e0 00 00 	movaps XMMWORD PTR [rsp+0xe0],xmm6
   140372828:	00 
   140372829:	0f 29 bc 24 d0 00 00 	movaps XMMWORD PTR [rsp+0xd0],xmm7
   140372830:	00 
   140372831:	44 0f 29 84 24 c0 00 	movaps XMMWORD PTR [rsp+0xc0],xmm8
   140372838:	00 00 
   14037283a:	45 0f 57 c0          	xorps  xmm8,xmm8
   14037283e:	44 0f 29 8c 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm9
   140372845:	00 00 
   140372847:	f2 44 0f 10 0d b0 b8 	movsd  xmm9,QWORD PTR [rip+0x31b8b0]        # 0x14068e100
   14037284e:	31 00 
   140372850:	44 0f 29 94 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm10
   140372857:	00 00 
   140372859:	f3 44 0f 10 15 ce d7 	movss  xmm10,DWORD PTR [rip+0x4dd7ce]        # 0x140850030
   140372860:	4d 00 
   140372862:	44 0f 29 9c 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm11
   140372869:	00 00 
   14037286b:	f3 44 0f 10 1d 5c df 	movss  xmm11,DWORD PTR [rip+0x4ddf5c]        # 0x1408507d0
   140372872:	4d 00 
   140372874:	44 0f 29 a4 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm12
   14037287b:	00 00 
   14037287d:	f2 44 0f 10 25 ca b8 	movsd  xmm12,QWORD PTR [rip+0x31b8ca]        # 0x14068e150
   140372884:	31 00 
   140372886:	44 0f 29 6c 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm13
   14037288c:	f2 44 0f 10 2d db b8 	movsd  xmm13,QWORD PTR [rip+0x31b8db]        # 0x14068e170
   140372893:	31 00 
   140372895:	44 0f 29 74 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm14
   14037289b:	f2 44 0f 10 35 9c b8 	movsd  xmm14,QWORD PTR [rip+0x31b89c]        # 0x14068e140
   1403728a2:	31 00 
   1403728a4:	44 0f 29 7c 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm15
   1403728aa:	f2 44 0f 10 3d 65 b8 	movsd  xmm15,QWORD PTR [rip+0x31b865]        # 0x14068e118
   1403728b1:	31 00 
   1403728b3:	41 8b c7             	mov    eax,r15d
   1403728b6:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403728bd:	49 63 d0             	movsxd rdx,r8d
   1403728c0:	4e 8b 0c 29          	mov    r9,QWORD PTR [rcx+r13*1]
   1403728c4:	48 8d 04 d2          	lea    rax,[rdx+rdx*8]
   1403728c8:	48 03 c0             	add    rax,rax
   1403728cb:	45 85 ff             	test   r15d,r15d
   1403728ce:	4d 8b 74 c1 30       	mov    r14,QWORD PTR [r9+rax*8+0x30]
   1403728d3:	41 8b c7             	mov    eax,r15d
   1403728d6:	41 0f 48 c2          	cmovs  eax,r10d
   1403728da:	48 98                	cdqe
   1403728dc:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403728e3:	f3 42 0f 10 84 29 50 	movss  xmm0,DWORD PTR [rcx+r13*1+0x39150]
   1403728ea:	91 03 00 
   1403728ed:	41 0f 2e c0          	ucomiss xmm0,xmm8
   1403728f1:	7a 06                	jp     0x1403728f9
   1403728f3:	75 04                	jne    0x1403728f9
   1403728f5:	33 c0                	xor    eax,eax
   1403728f7:	eb 21                	jmp    0x14037291a
   1403728f9:	48 8d 04 d2          	lea    rax,[rdx+rdx*8]
   1403728fd:	48 03 c0             	add    rax,rax
   140372900:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140372903:	f3 41 0f 10 4c c1 08 	movss  xmm1,DWORD PTR [r9+rax*8+0x8]
   14037290a:	0f 5a c9             	cvtps2pd xmm1,xmm1
   14037290d:	f2 41 0f 58 c9       	addsd  xmm1,xmm9
   140372912:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140372916:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   14037291a:	41 3b c3             	cmp    eax,r11d
   14037291d:	0f 8d 4c 05 00 00    	jge    0x140372e6f
   140372923:	45 85 ff             	test   r15d,r15d
   140372926:	41 8b c7             	mov    eax,r15d
   140372929:	41 0f 48 c2          	cmovs  eax,r10d
   14037292d:	48 98                	cdqe
   14037292f:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372936:	f3 42 0f 10 84 29 50 	movss  xmm0,DWORD PTR [rcx+r13*1+0x39150]
   14037293d:	91 03 00 
   140372940:	41 0f 2e c0          	ucomiss xmm0,xmm8
   140372944:	7a 06                	jp     0x14037294c
   140372946:	75 04                	jne    0x14037294c
   140372948:	33 c0                	xor    eax,eax
   14037294a:	eb 21                	jmp    0x14037296d
   14037294c:	48 8d 04 d2          	lea    rax,[rdx+rdx*8]
   140372950:	48 03 c0             	add    rax,rax
   140372953:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140372956:	f3 41 0f 10 4c c1 0c 	movss  xmm1,DWORD PTR [r9+rax*8+0xc]
   14037295d:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140372960:	f2 41 0f 58 c9       	addsd  xmm1,xmm9
   140372965:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140372969:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   14037296d:	41 3b c3             	cmp    eax,r11d
   140372970:	0f 8e bd 04 00 00    	jle    0x140372e33
   140372976:	45 0f b7 ae 1c 02 00 	movzx  r13d,WORD PTR [r14+0x21c]
   14037297d:	00 
   14037297e:	b8 00 80 00 00       	mov    eax,0x8000
   140372983:	c7 44 24 34 ff ff ff 	mov    DWORD PTR [rsp+0x34],0xffffffff
   14037298a:	ff 
   14037298b:	66 44 23 e8          	and    r13w,ax
   14037298f:	74 0f                	je     0x1403729a0
   140372991:	80 bc 24 58 01 00 00 	cmp    BYTE PTR [rsp+0x158],0x0
   140372998:	00 
   140372999:	75 13                	jne    0x1403729ae
   14037299b:	e9 76 03 00 00       	jmp    0x140372d16
   1403729a0:	80 bc 24 60 01 00 00 	cmp    BYTE PTR [rsp+0x160],0x0
   1403729a7:	00 
   1403729a8:	0f 84 68 03 00 00    	je     0x140372d16
   1403729ae:	41 8b 56 04          	mov    edx,DWORD PTR [r14+0x4]
   1403729b2:	41 8b 0e             	mov    ecx,DWORD PTR [r14]
   1403729b5:	44 8d 42 ff          	lea    r8d,[rdx-0x1]
   1403729b9:	3b d1                	cmp    edx,ecx
   1403729bb:	7e 2b                	jle    0x1403729e8
   1403729bd:	66 45 85 ed          	test   r13w,r13w
   1403729c1:	74 04                	je     0x1403729c7
   1403729c3:	8b c1                	mov    eax,ecx
   1403729c5:	eb 0f                	jmp    0x1403729d6
   1403729c7:	44 3b c1             	cmp    r8d,ecx
   1403729ca:	41 8b c0             	mov    eax,r8d
   1403729cd:	0f 4c c1             	cmovl  eax,ecx
   1403729d0:	3b c2                	cmp    eax,edx
   1403729d2:	41 0f 4d c0          	cmovge eax,r8d
   1403729d6:	2b c1                	sub    eax,ecx
   1403729d8:	44 8b fb             	mov    r15d,ebx
   1403729db:	8b c8                	mov    ecx,eax
   1403729dd:	49 8b 46 08          	mov    rax,QWORD PTR [r14+0x8]
   1403729e1:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   1403729e6:	eb 04                	jmp    0x1403729ec
   1403729e8:	41 0f 28 c0          	movaps xmm0,xmm8
   1403729ec:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   1403729f0:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12
   1403729f5:	f2 41 0f 5e c5       	divsd  xmm0,xmm13
   1403729fa:	e8 75 e3 2a 00       	call   0x140620d74
   1403729ff:	f3 0f 10 35 19 47 32 	movss  xmm6,DWORD PTR [rip+0x324719]        # 0x140697120
   140372a06:	00 
   140372a07:	8d 6f 01             	lea    ebp,[rdi+0x1]
   140372a0a:	f2 41 0f 59 c6       	mulsd  xmm0,xmm14
   140372a0f:	4c 8d 05 ba 7b 61 00 	lea    r8,[rip+0x617bba]        # 0x14098a5d0
   140372a16:	41 8b c7             	mov    eax,r15d
   140372a19:	48 63 fd             	movsxd rdi,ebp
   140372a1c:	0f 57 ff             	xorps  xmm7,xmm7
   140372a1f:	4c 69 e0 78 ab 06 00 	imul   r12,rax,0x6ab78
   140372a26:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140372a2b:	89 6c 24 3c          	mov    DWORD PTR [rsp+0x3c],ebp
   140372a2f:	f2 0f 58 05 01 b7 31 	addsd  xmm0,QWORD PTR [rip+0x31b701]        # 0x14068e138
   140372a36:	00 
   140372a37:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   140372a3b:	43 3b 7c 04 08       	cmp    edi,DWORD PTR [r12+r8*1+0x8]
   140372a40:	0f 8d c4 02 00 00    	jge    0x140372d0a
   140372a46:	8b 2d 64 77 61 00    	mov    ebp,DWORD PTR [rip+0x617764]        # 0x14098a1b0
   140372a4c:	48 8d 34 ff          	lea    rsi,[rdi+rdi*8]
   140372a50:	8b 5c 24 34          	mov    ebx,DWORD PTR [rsp+0x34]
   140372a54:	48 c1 e6 04          	shl    rsi,0x4
   140372a58:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140372a5f:	00 
   140372a60:	45 85 ff             	test   r15d,r15d
   140372a63:	41 8b c7             	mov    eax,r15d
   140372a66:	0f 48 c5             	cmovs  eax,ebp
   140372a69:	48 98                	cdqe
   140372a6b:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372a72:	f3 42 0f 10 84 01 50 	movss  xmm0,DWORD PTR [rcx+r8*1+0x39150]
   140372a79:	91 03 00 
   140372a7c:	41 0f 2e c0          	ucomiss xmm0,xmm8
   140372a80:	7a 06                	jp     0x140372a88
   140372a82:	75 04                	jne    0x140372a88
   140372a84:	33 c0                	xor    eax,eax
   140372a86:	eb 1d                	jmp    0x140372aa5
   140372a88:	4b 8b 04 04          	mov    rax,QWORD PTR [r12+r8*1]
   140372a8c:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140372a8f:	f3 0f 10 4c 30 08    	movss  xmm1,DWORD PTR [rax+rsi*1+0x8]
   140372a95:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140372a98:	f2 41 0f 58 c9       	addsd  xmm1,xmm9
   140372a9d:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140372aa1:	f2 0f 2c c1          	cvttsd2si eax,xmm1
   140372aa5:	3b 84 24 48 01 00 00 	cmp    eax,DWORD PTR [rsp+0x148]
   140372aac:	0f 8c bd 00 00 00    	jl     0x140372b6f
   140372ab2:	0f 8f cb 00 00 00    	jg     0x140372b83
   140372ab8:	4b 8b 04 04          	mov    rax,QWORD PTR [r12+r8*1]
   140372abc:	b9 00 80 00 00       	mov    ecx,0x8000
   140372ac1:	48 8b 54 30 30       	mov    rdx,QWORD PTR [rax+rsi*1+0x30]
   140372ac6:	44 0f b7 8a 1c 02 00 	movzx  r9d,WORD PTR [rdx+0x21c]
   140372acd:	00 
   140372ace:	41 0f b7 c1          	movzx  eax,r9w
   140372ad2:	66 23 c1             	and    ax,cx
   140372ad5:	66 41 3b c5          	cmp    ax,r13w
   140372ad9:	0f 85 90 00 00 00    	jne    0x140372b6f
   140372adf:	66 41 83 be 1c 02 00 	cmp    WORD PTR [r14+0x21c],0x0
   140372ae6:	00 00 
   140372ae8:	7d 0b                	jge    0x140372af5
   140372aea:	41 0f b7 46 20       	movzx  eax,WORD PTR [r14+0x20]
   140372aef:	66 39 42 20          	cmp    WORD PTR [rdx+0x20],ax
   140372af3:	75 7a                	jne    0x140372b6f
   140372af5:	8b 0a                	mov    ecx,DWORD PTR [rdx]
   140372af7:	44 8b 42 04          	mov    r8d,DWORD PTR [rdx+0x4]
   140372afb:	44 3b c1             	cmp    r8d,ecx
   140372afe:	7e 20                	jle    0x140372b20
   140372b00:	8b c1                	mov    eax,ecx
   140372b02:	66 45 85 c9          	test   r9w,r9w
   140372b06:	78 09                	js     0x140372b11
   140372b08:	41 3b c8             	cmp    ecx,r8d
   140372b0b:	7c 04                	jl     0x140372b11
   140372b0d:	41 8d 40 ff          	lea    eax,[r8-0x1]
   140372b11:	2b c1                	sub    eax,ecx
   140372b13:	8b c8                	mov    ecx,eax
   140372b15:	48 8b 42 08          	mov    rax,QWORD PTR [rdx+0x8]
   140372b19:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   140372b1e:	eb 04                	jmp    0x140372b24
   140372b20:	41 0f 28 c0          	movaps xmm0,xmm8
   140372b24:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140372b28:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12
   140372b2d:	f2 41 0f 5e c5       	divsd  xmm0,xmm13
   140372b32:	e8 3d e2 2a 00       	call   0x140620d74
   140372b37:	f2 41 0f 59 c6       	mulsd  xmm0,xmm14
   140372b3c:	0f 28 cf             	movaps xmm1,xmm7
   140372b3f:	f2 41 0f 5e c7       	divsd  xmm0,xmm15
   140372b44:	f2 0f 58 05 ec b5 31 	addsd  xmm0,QWORD PTR [rip+0x31b5ec]        # 0x14068e138
   140372b4b:	00 
   140372b4c:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140372b50:	f3 0f 5c c8          	subss  xmm1,xmm0
   140372b54:	44 0f 2f c1          	comiss xmm8,xmm1
   140372b58:	76 04                	jbe    0x140372b5e
   140372b5a:	41 0f 57 cb          	xorps  xmm1,xmm11
   140372b5e:	0f 2f f1             	comiss xmm6,xmm1
   140372b61:	4c 8d 05 68 7a 61 00 	lea    r8,[rip+0x617a68]        # 0x14098a5d0
   140372b68:	76 05                	jbe    0x140372b6f
   140372b6a:	8b df                	mov    ebx,edi
   140372b6c:	0f 28 f1             	movaps xmm6,xmm1
   140372b6f:	ff c7                	inc    edi
   140372b71:	48 81 c6 90 00 00 00 	add    rsi,0x90
   140372b78:	43 3b 7c 04 08       	cmp    edi,DWORD PTR [r12+r8*1+0x8]
   140372b7d:	0f 8c dd fe ff ff    	jl     0x140372a60
   140372b83:	48 63 6c 24 3c       	movsxd rbp,DWORD PTR [rsp+0x3c]
   140372b88:	85 db                	test   ebx,ebx
   140372b8a:	89 5c 24 34          	mov    DWORD PTR [rsp+0x34],ebx
   140372b8e:	48 8b 5c 24 40       	mov    rbx,QWORD PTR [rsp+0x40]
   140372b93:	0f 88 69 01 00 00    	js     0x140372d02
   140372b99:	4c 63 64 24 34       	movsxd r12,DWORD PTR [rsp+0x34]
   140372b9e:	4c 8d 2d 2b 7a 61 00 	lea    r13,[rip+0x617a2b]        # 0x14098a5d0
   140372ba5:	48 8b 4c 24 48       	mov    rcx,QWORD PTR [rsp+0x48]
   140372baa:	49 8b c4             	mov    rax,r12
   140372bad:	4b 8d 3c e4          	lea    rdi,[r12+r12*8]
   140372bb1:	4a 8b 0c 29          	mov    rcx,QWORD PTR [rcx+r13*1]
   140372bb5:	48 03 ff             	add    rdi,rdi
   140372bb8:	66 41 83 be 1c 02 00 	cmp    WORD PTR [r14+0x21c],0x0
   140372bbf:	00 00 
   140372bc1:	4c 8b 54 f9 30       	mov    r10,QWORD PTR [rcx+rdi*8+0x30]
   140372bc6:	0f 8d cb 00 00 00    	jge    0x140372c97
   140372bcc:	41 0f b7 46 20       	movzx  eax,WORD PTR [r14+0x20]
   140372bd1:	66 83 f8 21          	cmp    ax,0x21
   140372bd5:	0f 84 bc 00 00 00    	je     0x140372c97
   140372bdb:	66 85 c0             	test   ax,ax
   140372bde:	0f 84 b3 00 00 00    	je     0x140372c97
   140372be4:	45 8b 8a 2c 02 00 00 	mov    r9d,DWORD PTR [r10+0x22c]
   140372beb:	f3 0f 10 54 f9 0c    	movss  xmm2,DWORD PTR [rcx+rdi*8+0xc]
   140372bf1:	3b 6c 24 38          	cmp    ebp,DWORD PTR [rsp+0x38]
   140372bf5:	0f 8d 9c 00 00 00    	jge    0x140372c97
   140372bfb:	4c 8b 9c 24 40 01 00 	mov    r11,QWORD PTR [rsp+0x140]
   140372c02:	00 
   140372c03:	48 8d 14 ed 00 00 00 	lea    rdx,[rbp*8+0x0]
   140372c0a:	00 
   140372c0b:	48 03 d5             	add    rdx,rbp
   140372c0e:	48 c1 e2 04          	shl    rdx,0x4
   140372c12:	8b c3                	mov    eax,ebx
   140372c14:	0f 28 ca             	movaps xmm1,xmm2
   140372c17:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372c1e:	f3 41 0f 58 ca       	addss  xmm1,xmm10
   140372c23:	4e 8b 04 29          	mov    r8,QWORD PTR [rcx+r13*1]
   140372c27:	f3 41 0f 10 44 10 08 	movss  xmm0,DWORD PTR [r8+rdx*1+0x8]
   140372c2e:	0f 2f c1             	comiss xmm0,xmm1
   140372c31:	77 64                	ja     0x140372c97
   140372c33:	4d 8b 44 10 30       	mov    r8,QWORD PTR [r8+rdx*1+0x30]
   140372c38:	8b cb                	mov    ecx,ebx
   140372c3a:	66 41 83 b8 1c 02 00 	cmp    WORD PTR [r8+0x21c],0x0
   140372c41:	00 00 
   140372c43:	7d 33                	jge    0x140372c78
   140372c45:	45 39 88 2c 02 00 00 	cmp    DWORD PTR [r8+0x22c],r9d
   140372c4c:	75 2a                	jne    0x140372c78
   140372c4e:	41 8b 86 2c 02 00 00 	mov    eax,DWORD PTR [r14+0x22c]
   140372c55:	41 89 80 2c 02 00 00 	mov    DWORD PTR [r8+0x22c],eax
   140372c5c:	41 8b 0b             	mov    ecx,DWORD PTR [r11]
   140372c5f:	48 69 c1 78 ab 06 00 	imul   rax,rcx,0x6ab78
   140372c66:	4a 8b 04 28          	mov    rax,QWORD PTR [rax+r13*1]
   140372c6a:	f3 0f 10 44 10 0c    	movss  xmm0,DWORD PTR [rax+rdx*1+0xc]
   140372c70:	0f 2f c2             	comiss xmm0,xmm2
   140372c73:	76 03                	jbe    0x140372c78
   140372c75:	0f 28 d0             	movaps xmm2,xmm0
   140372c78:	8b c1                	mov    eax,ecx
   140372c7a:	8b d9                	mov    ebx,ecx
   140372c7c:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372c83:	ff c5                	inc    ebp
   140372c85:	48 81 c2 90 00 00 00 	add    rdx,0x90
   140372c8c:	42 3b 6c 29 08       	cmp    ebp,DWORD PTR [rcx+r13*1+0x8]
   140372c91:	0f 8c 7b ff ff ff    	jl     0x140372c12
   140372c97:	41 8b 46 04          	mov    eax,DWORD PTR [r14+0x4]
   140372c9b:	41 b1 01             	mov    r9b,0x1
   140372c9e:	48 8b b4 24 40 01 00 	mov    rsi,QWORD PTR [rsp+0x140]
   140372ca5:	00 
   140372ca6:	ff c8                	dec    eax
   140372ca8:	41 01 02             	add    DWORD PTR [r10],eax
   140372cab:	4d 8b c2             	mov    r8,r10
   140372cae:	41 8b 46 04          	mov    eax,DWORD PTR [r14+0x4]
   140372cb2:	49 8b d6             	mov    rdx,r14
   140372cb5:	ff c8                	dec    eax
   140372cb7:	48 8b ce             	mov    rcx,rsi
   140372cba:	41 01 42 04          	add    DWORD PTR [r10+0x4],eax
   140372cbe:	e8 ad d3 ff ff       	call   0x140370070
   140372cc3:	8b 06                	mov    eax,DWORD PTR [rsi]
   140372cc5:	41 b1 01             	mov    r9b,0x1
   140372cc8:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140372ccf:	41 b8 ff ff ff ff    	mov    r8d,0xffffffff
   140372cd5:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   140372cda:	41 8b cc             	mov    ecx,r12d
   140372cdd:	4a 8b 04 28          	mov    rax,QWORD PTR [rax+r13*1]
   140372ce1:	48 c7 44 f8 30 00 00 	mov    QWORD PTR [rax+rdi*8+0x30],0x0
   140372ce8:	00 00 
   140372cea:	8b 16                	mov    edx,DWORD PTR [rsi]
   140372cec:	e8 af d0 ee ff       	call   0x14025fda0
   140372cf1:	8b 7c 24 30          	mov    edi,DWORD PTR [rsp+0x30]
   140372cf5:	48 8b ac 24 50 01 00 	mov    rbp,QWORD PTR [rsp+0x150]
   140372cfc:	00 
   140372cfd:	e9 91 00 00 00       	jmp    0x140372d93
   140372d02:	48 8b b4 24 40 01 00 	mov    rsi,QWORD PTR [rsp+0x140]
   140372d09:	00 
   140372d0a:	48 8b ac 24 50 01 00 	mov    rbp,QWORD PTR [rsp+0x150]
   140372d11:	00 
   140372d12:	8b 7c 24 30          	mov    edi,DWORD PTR [rsp+0x30]
   140372d16:	41 8b 56 04          	mov    edx,DWORD PTR [r14+0x4]
   140372d1a:	41 8b 0e             	mov    ecx,DWORD PTR [r14]
   140372d1d:	8d 42 ff             	lea    eax,[rdx-0x1]
   140372d20:	3b c1                	cmp    eax,ecx
   140372d22:	75 58                	jne    0x140372d7c
   140372d24:	49 8b ce             	mov    rcx,r14
   140372d27:	e8 64 52 00 00       	call   0x140377f90
   140372d2c:	8b 06                	mov    eax,DWORD PTR [rsi]
   140372d2e:	4c 8d 2d 9b 78 61 00 	lea    r13,[rip+0x61789b]        # 0x14098a5d0
   140372d35:	48 69 d0 78 ab 06 00 	imul   rdx,rax,0x6ab78
   140372d3c:	48 63 c7             	movsxd rax,edi
   140372d3f:	41 b1 01             	mov    r9b,0x1
   140372d42:	41 b8 ff ff ff ff    	mov    r8d,0xffffffff
   140372d48:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   140372d4d:	48 8d 0c c0          	lea    rcx,[rax+rax*8]
   140372d51:	4a 8b 04 2a          	mov    rax,QWORD PTR [rdx+r13*1]
   140372d55:	48 03 c9             	add    rcx,rcx
   140372d58:	48 c7 44 c8 30 00 00 	mov    QWORD PTR [rax+rcx*8+0x30],0x0
   140372d5f:	00 00 
   140372d61:	8b cf                	mov    ecx,edi
   140372d63:	8b 45 00             	mov    eax,DWORD PTR [rbp+0x0]
   140372d66:	3b f8                	cmp    edi,eax
   140372d68:	0f 4c c7             	cmovl  eax,edi
   140372d6b:	ff cf                	dec    edi
   140372d6d:	89 45 00             	mov    DWORD PTR [rbp+0x0],eax
   140372d70:	8b 16                	mov    edx,DWORD PTR [rsi]
   140372d72:	e8 29 d0 ee ff       	call   0x14025fda0
   140372d77:	e9 b0 00 00 00       	jmp    0x140372e2c
   140372d7c:	2b d1                	sub    edx,ecx
   140372d7e:	49 8b ce             	mov    rcx,r14
   140372d81:	ff ca                	dec    edx
   140372d83:	e8 68 71 ff ff       	call   0x140369ef0
   140372d88:	41 ff 4e 04          	dec    DWORD PTR [r14+0x4]
   140372d8c:	4c 8d 2d 3d 78 61 00 	lea    r13,[rip+0x61783d]        # 0x14098a5d0
   140372d93:	8b 06                	mov    eax,DWORD PTR [rsi]
   140372d95:	45 8b 46 04          	mov    r8d,DWORD PTR [r14+0x4]
   140372d99:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140372da0:	66 41 0f 6e c0       	movd   xmm0,r8d
   140372da5:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140372da8:	48 63 c7             	movsxd rax,edi
   140372dab:	f3 42 0f 59 84 29 50 	mulss  xmm0,DWORD PTR [rcx+r13*1+0x39150]
   140372db2:	91 03 00 
   140372db5:	48 8d 14 c0          	lea    rdx,[rax+rax*8]
   140372db9:	4a 8b 04 29          	mov    rax,QWORD PTR [rcx+r13*1]
   140372dbd:	48 c1 e2 04          	shl    rdx,0x4
   140372dc1:	f3 0f 58 44 10 08    	addss  xmm0,DWORD PTR [rax+rdx*1+0x8]
   140372dc7:	f3 0f 11 44 10 04    	movss  DWORD PTR [rax+rdx*1+0x4],xmm0
   140372dcd:	8b 06                	mov    eax,DWORD PTR [rsi]
   140372dcf:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140372dd6:	4a 8b 04 28          	mov    rax,QWORD PTR [rax+r13*1]
   140372dda:	f3 0f 11 44 10 14    	movss  DWORD PTR [rax+rdx*1+0x14],xmm0
   140372de0:	8b 06                	mov    eax,DWORD PTR [rsi]
   140372de2:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140372de9:	4a 8b 04 28          	mov    rax,QWORD PTR [rax+r13*1]
   140372ded:	f3 0f 11 44 10 1c    	movss  DWORD PTR [rax+rdx*1+0x1c],xmm0
   140372df3:	8b 06                	mov    eax,DWORD PTR [rsi]
   140372df5:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140372dfc:	4a 8b 04 28          	mov    rax,QWORD PTR [rax+r13*1]
   140372e00:	f3 0f 11 44 10 0c    	movss  DWORD PTR [rax+rdx*1+0xc],xmm0
   140372e06:	8b 06                	mov    eax,DWORD PTR [rsi]
   140372e08:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140372e0f:	4a 8b 0c 28          	mov    rcx,QWORD PTR [rax+r13*1]
   140372e13:	48 03 ca             	add    rcx,rdx
   140372e16:	33 d2                	xor    edx,edx
   140372e18:	44 8d 42 ff          	lea    r8d,[rdx-0x1]
   140372e1c:	e8 5f ce ee ff       	call   0x14025fc80
   140372e21:	8b 45 00             	mov    eax,DWORD PTR [rbp+0x0]
   140372e24:	3b f8                	cmp    edi,eax
   140372e26:	0f 4c c7             	cmovl  eax,edi
   140372e29:	89 45 00             	mov    DWORD PTR [rbp+0x0],eax
   140372e2c:	44 8b 15 7d 73 61 00 	mov    r10d,DWORD PTR [rip+0x61737d]        # 0x14098a1b0
   140372e33:	8b 1e                	mov    ebx,DWORD PTR [rsi]
   140372e35:	ff c7                	inc    edi
   140372e37:	4c 69 db 78 ab 06 00 	imul   r11,rbx,0x6ab78
   140372e3e:	89 7c 24 30          	mov    DWORD PTR [rsp+0x30],edi
   140372e42:	44 8b c7             	mov    r8d,edi
   140372e45:	4c 89 5c 24 48       	mov    QWORD PTR [rsp+0x48],r11
   140372e4a:	44 8b fb             	mov    r15d,ebx
   140372e4d:	48 89 5c 24 40       	mov    QWORD PTR [rsp+0x40],rbx
   140372e52:	47 8b 5c 2b 08       	mov    r11d,DWORD PTR [r11+r13*1+0x8]
   140372e57:	41 3b fb             	cmp    edi,r11d
   140372e5a:	44 89 5c 24 38       	mov    DWORD PTR [rsp+0x38],r11d
   140372e5f:	44 8b 9c 24 48 01 00 	mov    r11d,DWORD PTR [rsp+0x148]
   140372e66:	00 
   140372e67:	0f 8c 46 fa ff ff    	jl     0x1403728b3
   140372e6d:	eb 0d                	jmp    0x140372e7c
   140372e6f:	44 3b 45 00          	cmp    r8d,DWORD PTR [rbp+0x0]
   140372e73:	44 0f 4d 45 00       	cmovge r8d,DWORD PTR [rbp+0x0]
   140372e78:	44 89 45 00          	mov    DWORD PTR [rbp+0x0],r8d
   140372e7c:	44 0f 28 74 24 60    	movaps xmm14,XMMWORD PTR [rsp+0x60]
   140372e82:	44 0f 28 6c 24 70    	movaps xmm13,XMMWORD PTR [rsp+0x70]
   140372e88:	44 0f 28 a4 24 80 00 	movaps xmm12,XMMWORD PTR [rsp+0x80]
   140372e8f:	00 00 
   140372e91:	44 0f 28 9c 24 90 00 	movaps xmm11,XMMWORD PTR [rsp+0x90]
   140372e98:	00 00 
   140372e9a:	44 0f 28 94 24 a0 00 	movaps xmm10,XMMWORD PTR [rsp+0xa0]
   140372ea1:	00 00 
   140372ea3:	44 0f 28 8c 24 b0 00 	movaps xmm9,XMMWORD PTR [rsp+0xb0]
   140372eaa:	00 00 
   140372eac:	44 0f 28 84 24 c0 00 	movaps xmm8,XMMWORD PTR [rsp+0xc0]
   140372eb3:	00 00 
   140372eb5:	0f 28 bc 24 d0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xd0]
   140372ebc:	00 
   140372ebd:	0f 28 b4 24 e0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xe0]
   140372ec4:	00 
   140372ec5:	4c 8b bc 24 f8 00 00 	mov    r15,QWORD PTR [rsp+0xf8]
   140372ecc:	00 
   140372ecd:	4c 8b b4 24 00 01 00 	mov    r14,QWORD PTR [rsp+0x100]
   140372ed4:	00 
   140372ed5:	4c 8b a4 24 08 01 00 	mov    r12,QWORD PTR [rsp+0x108]
   140372edc:	00 
   140372edd:	44 0f 28 7c 24 50    	movaps xmm15,XMMWORD PTR [rsp+0x50]
   140372ee3:	48 81 c4 10 01 00 00 	add    rsp,0x110
   140372eea:	41 5d                	pop    r13
   140372eec:	5f                   	pop    rdi
   140372eed:	5e                   	pop    rsi
   140372eee:	5d                   	pop    rbp
   140372eef:	5b                   	pop    rbx
   140372ef0:	c3                   	ret
   140372ef1:	cc                   	int3
   140372ef2:	cc                   	int3
   140372ef3:	cc                   	int3
   140372ef4:	cc                   	int3
   140372ef5:	cc                   	int3
   140372ef6:	cc                   	int3
   140372ef7:	cc                   	int3
   140372ef8:	cc                   	int3
   140372ef9:	cc                   	int3
   140372efa:	cc                   	int3
   140372efb:	cc                   	int3
   140372efc:	cc                   	int3
   140372efd:	cc                   	int3
   140372efe:	cc                   	int3
   140372eff:	cc                   	int3
   140372f00:	4c 8b dc             	mov    r11,rsp
   140372f03:	45 88 43 18          	mov    BYTE PTR [r11+0x18],r8b
   140372f07:	89 54 24 10          	mov    DWORD PTR [rsp+0x10],edx
   140372f0b:	49 89 4b 08          	mov    QWORD PTR [r11+0x8],rcx
   140372f0f:	41 54                	push   r12
   140372f11:	48 81 ec c0 00 00 00 	sub    rsp,0xc0
   140372f18:	44 8b 09             	mov    r9d,DWORD PTR [rcx]
   140372f1b:	48 8d 0d ae 76 61 00 	lea    rcx,[rip+0x6176ae]        # 0x14098a5d0
   140372f22:	49 69 c1 78 ab 06 00 	imul   rax,r9,0x6ab78
   140372f29:	4c 63 e2             	movsxd r12,edx
   140372f2c:	44 3b 64 08 08       	cmp    r12d,DWORD PTR [rax+rcx*1+0x8]
   140372f31:	0f 8d 21 07 00 00    	jge    0x140373658
   140372f37:	49 89 5b f0          	mov    QWORD PTR [r11-0x10],rbx
   140372f3b:	ba 80 00 00 00       	mov    edx,0x80
   140372f40:	49 89 6b e8          	mov    QWORD PTR [r11-0x18],rbp
   140372f44:	41 ba 20 08 00 00    	mov    r10d,0x820
   140372f4a:	49 89 73 e0          	mov    QWORD PTR [r11-0x20],rsi
   140372f4e:	49 89 7b d8          	mov    QWORD PTR [r11-0x28],rdi
   140372f52:	4d 89 6b d0          	mov    QWORD PTR [r11-0x30],r13
   140372f56:	4f 8d 2c e4          	lea    r13,[r12+r12*8]
   140372f5a:	4d 89 73 c8          	mov    QWORD PTR [r11-0x38],r14
   140372f5e:	4d 89 7b c0          	mov    QWORD PTR [r11-0x40],r15
   140372f62:	0f 29 74 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm6
   140372f67:	0f 29 7c 24 60       	movaps XMMWORD PTR [rsp+0x60],xmm7
   140372f6c:	45 0f 29 43 88       	movaps XMMWORD PTR [r11-0x78],xmm8
   140372f71:	41 bb 80 80 00 00    	mov    r11d,0x8080
   140372f77:	f2 44 0f 10 05 d0 b1 	movsd  xmm8,QWORD PTR [rip+0x31b1d0]        # 0x14068e150
   140372f7e:	31 00 
   140372f80:	44 0f 29 4c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm9
   140372f86:	f3 44 0f 10 0d 4d d0 	movss  xmm9,DWORD PTR [rip+0x4dd04d]        # 0x14084ffdc
   140372f8d:	4d 00 
   140372f8f:	49 c1 e5 04          	shl    r13,0x4
   140372f93:	44 0f 29 54 24 30    	movaps XMMWORD PTR [rsp+0x30],xmm10
   140372f99:	f3 44 0f 10 15 8e d0 	movss  xmm10,DWORD PTR [rip+0x4dd08e]        # 0x140850030
   140372fa0:	4d 00 
   140372fa2:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   140372fa7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140372fae:	00 00 
   140372fb0:	41 8b c1             	mov    eax,r9d
   140372fb3:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140372fba:	48 8b 04 08          	mov    rax,QWORD PTR [rax+rcx*1]
   140372fbe:	4a 8b 5c 28 30       	mov    rbx,QWORD PTR [rax+r13*1+0x30]
   140372fc3:	48 85 db             	test   rbx,rbx
   140372fc6:	0f 84 f4 05 00 00    	je     0x1403735c0
   140372fcc:	0f b7 8b 1c 02 00 00 	movzx  ecx,WORD PTR [rbx+0x21c]
   140372fd3:	0f b7 c1             	movzx  eax,cx
   140372fd6:	66 41 23 c2          	and    ax,r10w
   140372fda:	66 83 f8 20          	cmp    ax,0x20
   140372fde:	0f 85 dc 05 00 00    	jne    0x1403735c0
   140372fe4:	0f b6 c1             	movzx  eax,cl
   140372fe7:	c0 e8 07             	shr    al,0x7
   140372fea:	24 01                	and    al,0x1
   140372fec:	41 3a c0             	cmp    al,r8b
   140372fef:	0f 85 cb 05 00 00    	jne    0x1403735c0
   140372ff5:	80 3d 15 6f 61 00 00 	cmp    BYTE PTR [rip+0x616f15],0x0        # 0x140989f11
   140372ffc:	74 06                	je     0x140373004
   140372ffe:	41 0f 28 c0          	movaps xmm0,xmm8
   140373002:	eb 14                	jmp    0x140373018
   140373004:	66 41 85 cb          	test   r11w,cx
   140373008:	74 06                	je     0x140373010
   14037300a:	41 0f 28 c1          	movaps xmm0,xmm9
   14037300e:	eb 04                	jmp    0x140373014
   140373010:	41 0f 28 c2          	movaps xmm0,xmm10
   140373014:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   140373018:	0f b6 43 60          	movzx  eax,BYTE PTR [rbx+0x60]
   14037301c:	0f 57 ff             	xorps  xmm7,xmm7
   14037301f:	66 c1 e9 0f          	shr    cx,0xf
   140373023:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   140373027:	66 3b c1             	cmp    ax,cx
   14037302a:	0f 86 d6 01 00 00    	jbe    0x140373206
   140373030:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   140373033:	41 bc 80 00 00 00    	mov    r12d,0x80
   140373039:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140373040:	8b 2b                	mov    ebp,DWORD PTR [rbx]
   140373042:	3b ea                	cmp    ebp,edx
   140373044:	0f 8d 8d 01 00 00    	jge    0x1403731d7
   14037304a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140373050:	0f b7 8b 1c 02 00 00 	movzx  ecx,WORD PTR [rbx+0x21c]
   140373057:	66 41 23 cc          	and    cx,r12w
   14037305b:	0f b7 c1             	movzx  eax,cx
   14037305e:	66 f7 d8             	neg    ax
   140373061:	0f b6 43 60          	movzx  eax,BYTE PTR [rbx+0x60]
   140373065:	1b ff                	sbb    edi,edi
   140373067:	44 8d 40 ff          	lea    r8d,[rax-0x1]
   14037306b:	44 3b c0             	cmp    r8d,eax
   14037306e:	0f 83 45 01 00 00    	jae    0x1403731b9
   140373074:	45 0f b6 5c 18 61    	movzx  r11d,BYTE PTR [r8+rbx*1+0x61]
   14037307a:	45 8b f0             	mov    r14d,r8d
   14037307d:	41 3b fb             	cmp    edi,r11d
   140373080:	0f 8d 33 01 00 00    	jge    0x1403731b9
   140373086:	44 8b 0b             	mov    r9d,DWORD PTR [rbx]
   140373089:	41 3b d1             	cmp    edx,r9d
   14037308c:	0f 8e 27 01 00 00    	jle    0x1403731b9
   140373092:	41 3b e9             	cmp    ebp,r9d
   140373095:	44 8d 52 ff          	lea    r10d,[rdx-0x1]
   140373099:	8b c5                	mov    eax,ebp
   14037309b:	41 0f 4c c1          	cmovl  eax,r9d
   14037309f:	3b c2                	cmp    eax,edx
   1403730a1:	44 0f 4c d0          	cmovl  r10d,eax
   1403730a5:	66 85 c9             	test   cx,cx
   1403730a8:	0f 84 e7 00 00 00    	je     0x140373195
   1403730ae:	45 33 c0             	xor    r8d,r8d
   1403730b1:	0f 57 f6             	xorps  xmm6,xmm6
   1403730b4:	41 83 fb 04          	cmp    r11d,0x4
   1403730b8:	0f 82 9f 00 00 00    	jb     0x14037315d
   1403730be:	4a 8b 84 f3 98 00 00 	mov    rax,QWORD PTR [rbx+r14*8+0x98]
   1403730c5:	00 
   1403730c6:	45 8d 7b fd          	lea    r15d,[r11-0x3]
   1403730ca:	41 2b d1             	sub    edx,r9d
   1403730cd:	41 8d 78 02          	lea    edi,[r8+0x2]
   1403730d1:	48 8b 30             	mov    rsi,QWORD PTR [rax]
   1403730d4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   1403730d8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   1403730df:	00 
   1403730e0:	8b c2                	mov    eax,edx
   1403730e2:	41 0f af c0          	imul   eax,r8d
   1403730e6:	41 83 c0 04          	add    r8d,0x4
   1403730ea:	41 2b c1             	sub    eax,r9d
   1403730ed:	41 03 c2             	add    eax,r10d
   1403730f0:	0f b7 0c 46          	movzx  ecx,WORD PTR [rsi+rax*2]
   1403730f4:	8d 47 ff             	lea    eax,[rdi-0x1]
   1403730f7:	0f af c2             	imul   eax,edx
   1403730fa:	66 0f 6e c9          	movd   xmm1,ecx
   1403730fe:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   140373101:	41 2b c1             	sub    eax,r9d
   140373104:	41 03 c2             	add    eax,r10d
   140373107:	0f b7 0c 46          	movzx  ecx,WORD PTR [rsi+rax*2]
   14037310b:	f3 0f 58 ce          	addss  xmm1,xmm6
   14037310f:	8b c2                	mov    eax,edx
   140373111:	0f af c7             	imul   eax,edi
   140373114:	66 0f 6e c1          	movd   xmm0,ecx
   140373118:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037311b:	41 2b c1             	sub    eax,r9d
   14037311e:	41 03 c2             	add    eax,r10d
   140373121:	0f 28 f1             	movaps xmm6,xmm1
   140373124:	f3 0f 58 f0          	addss  xmm6,xmm0
   140373128:	0f b7 0c 46          	movzx  ecx,WORD PTR [rsi+rax*2]
   14037312c:	8d 47 01             	lea    eax,[rdi+0x1]
   14037312f:	0f af c2             	imul   eax,edx
   140373132:	83 c7 04             	add    edi,0x4
   140373135:	66 0f 6e c1          	movd   xmm0,ecx
   140373139:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037313c:	41 2b c1             	sub    eax,r9d
   14037313f:	41 03 c2             	add    eax,r10d
   140373142:	0f b7 0c 46          	movzx  ecx,WORD PTR [rsi+rax*2]
   140373146:	f3 0f 58 f0          	addss  xmm6,xmm0
   14037314a:	66 0f 6e c1          	movd   xmm0,ecx
   14037314e:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140373151:	f3 0f 58 f0          	addss  xmm6,xmm0
   140373155:	45 3b c7             	cmp    r8d,r15d
   140373158:	7c 86                	jl     0x1403730e0
   14037315a:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   14037315d:	45 3b c3             	cmp    r8d,r11d
   140373160:	7d 5a                	jge    0x1403731bc
   140373162:	4a 8b 84 f3 98 00 00 	mov    rax,QWORD PTR [rbx+r14*8+0x98]
   140373169:	00 
   14037316a:	41 2b d1             	sub    edx,r9d
   14037316d:	48 8b 38             	mov    rdi,QWORD PTR [rax]
   140373170:	8b c2                	mov    eax,edx
   140373172:	41 0f af c0          	imul   eax,r8d
   140373176:	41 ff c0             	inc    r8d
   140373179:	41 2b c1             	sub    eax,r9d
   14037317c:	41 03 c2             	add    eax,r10d
   14037317f:	0f b7 0c 47          	movzx  ecx,WORD PTR [rdi+rax*2]
   140373183:	66 0f 6e c1          	movd   xmm0,ecx
   140373187:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037318a:	f3 0f 58 f0          	addss  xmm6,xmm0
   14037318e:	45 3b c3             	cmp    r8d,r11d
   140373191:	7c dd                	jl     0x140373170
   140373193:	eb 27                	jmp    0x1403731bc
   140373195:	4a 8b 84 c3 98 00 00 	mov    rax,QWORD PTR [rbx+r8*8+0x98]
   14037319c:	00 
   14037319d:	41 2b d1             	sub    edx,r9d
   1403731a0:	0f af d7             	imul   edx,edi
   1403731a3:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   1403731a6:	41 2b d1             	sub    edx,r9d
   1403731a9:	41 03 d2             	add    edx,r10d
   1403731ac:	0f b7 04 51          	movzx  eax,WORD PTR [rcx+rdx*2]
   1403731b0:	66 0f 6e f0          	movd   xmm6,eax
   1403731b4:	0f 5b f6             	cvtdq2ps xmm6,xmm6
   1403731b7:	eb 03                	jmp    0x1403731bc
   1403731b9:	0f 57 f6             	xorps  xmm6,xmm6
   1403731bc:	e8 0f 12 fd ff       	call   0x1403443d0
   1403731c1:	f3 0f 59 c6          	mulss  xmm0,xmm6
   1403731c5:	0f 2f c7             	comiss xmm0,xmm7
   1403731c8:	77 0d                	ja     0x1403731d7
   1403731ca:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   1403731cd:	ff c5                	inc    ebp
   1403731cf:	3b ea                	cmp    ebp,edx
   1403731d1:	0f 8c 79 fe ff ff    	jl     0x140373050
   1403731d7:	8b 53 04             	mov    edx,DWORD PTR [rbx+0x4]
   1403731da:	3b ea                	cmp    ebp,edx
   1403731dc:	7c 1b                	jl     0x1403731f9
   1403731de:	fe 4b 60             	dec    BYTE PTR [rbx+0x60]
   1403731e1:	0f b7 83 1c 02 00 00 	movzx  eax,WORD PTR [rbx+0x21c]
   1403731e8:	0f b6 4b 60          	movzx  ecx,BYTE PTR [rbx+0x60]
   1403731ec:	66 c1 e8 0f          	shr    ax,0xf
   1403731f0:	66 3b c8             	cmp    cx,ax
   1403731f3:	0f 87 47 fe ff ff    	ja     0x140373040
   1403731f9:	44 8b a4 24 d8 00 00 	mov    r12d,DWORD PTR [rsp+0xd8]
   140373200:	00 
   140373201:	ba 80 00 00 00       	mov    edx,0x80
   140373206:	44 8b 73 04          	mov    r14d,DWORD PTR [rbx+0x4]
   14037320a:	44 8b 03             	mov    r8d,DWORD PTR [rbx]
   14037320d:	41 8d 4e ff          	lea    ecx,[r14-0x1]
   140373211:	89 4c 24 20          	mov    DWORD PTR [rsp+0x20],ecx
   140373215:	41 3b c8             	cmp    ecx,r8d
   140373218:	0f 8e d8 01 00 00    	jle    0x1403733f6
   14037321e:	44 0f b6 6b 60       	movzx  r13d,BYTE PTR [rbx+0x60]
   140373223:	40 32 f6             	xor    sil,sil
   140373226:	45 84 ed             	test   r13b,r13b
   140373229:	0f 84 a6 01 00 00    	je     0x1403733d5
   14037322f:	44 0f b7 9b 1c 02 00 	movzx  r11d,WORD PTR [rbx+0x21c]
   140373236:	00 
   140373237:	66 44 23 da          	and    r11w,dx
   14037323b:	41 0f b7 c3          	movzx  eax,r11w
   14037323f:	66 44 89 9c 24 e8 00 	mov    WORD PTR [rsp+0xe8],r11w
   140373246:	00 00 
   140373248:	66 f7 d8             	neg    ax
   14037324b:	1b d2                	sbb    edx,edx
   14037324d:	89 54 24 24          	mov    DWORD PTR [rsp+0x24],edx
   140373251:	41 3a f5             	cmp    sil,r13b
   140373254:	0f 83 60 01 00 00    	jae    0x1403733ba
   14037325a:	40 0f b6 fe          	movzx  edi,sil
   14037325e:	44 0f b6 54 1f 61    	movzx  r10d,BYTE PTR [rdi+rbx*1+0x61]
   140373264:	41 3b d2             	cmp    edx,r10d
   140373267:	0f 8d 4d 01 00 00    	jge    0x1403733ba
   14037326d:	45 3b f0             	cmp    r14d,r8d
   140373270:	0f 8e 44 01 00 00    	jle    0x1403733ba
   140373276:	41 3b c8             	cmp    ecx,r8d
   140373279:	45 8d 4e ff          	lea    r9d,[r14-0x1]
   14037327d:	8b c1                	mov    eax,ecx
   14037327f:	41 0f 4c c0          	cmovl  eax,r8d
   140373283:	41 3b c6             	cmp    eax,r14d
   140373286:	44 0f 4c c8          	cmovl  r9d,eax
   14037328a:	66 45 85 db          	test   r11w,r11w
   14037328e:	0f 84 f7 00 00 00    	je     0x14037338b
   140373294:	33 d2                	xor    edx,edx
   140373296:	0f 57 d2             	xorps  xmm2,xmm2
   140373299:	41 83 fa 04          	cmp    r10d,0x4
   14037329d:	0f 82 9d 00 00 00    	jb     0x140373340
   1403732a3:	48 8b 84 fb 98 00 00 	mov    rax,QWORD PTR [rbx+rdi*8+0x98]
   1403732aa:	00 
   1403732ab:	45 8d 62 fd          	lea    r12d,[r10-0x3]
   1403732af:	45 8b de             	mov    r11d,r14d
   1403732b2:	8d 6a 02             	lea    ebp,[rdx+0x2]
   1403732b5:	45 2b d8             	sub    r11d,r8d
   1403732b8:	4c 8b 38             	mov    r15,QWORD PTR [rax]
   1403732bb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   1403732c0:	41 8b c3             	mov    eax,r11d
   1403732c3:	0f af c2             	imul   eax,edx
   1403732c6:	83 c2 04             	add    edx,0x4
   1403732c9:	41 2b c0             	sub    eax,r8d
   1403732cc:	41 03 c1             	add    eax,r9d
   1403732cf:	41 0f b7 0c 47       	movzx  ecx,WORD PTR [r15+rax*2]
   1403732d4:	8d 45 ff             	lea    eax,[rbp-0x1]
   1403732d7:	41 0f af c3          	imul   eax,r11d
   1403732db:	66 0f 6e c9          	movd   xmm1,ecx
   1403732df:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   1403732e2:	41 2b c0             	sub    eax,r8d
   1403732e5:	41 03 c1             	add    eax,r9d
   1403732e8:	41 0f b7 0c 47       	movzx  ecx,WORD PTR [r15+rax*2]
   1403732ed:	f3 0f 58 ca          	addss  xmm1,xmm2
   1403732f1:	41 8b c3             	mov    eax,r11d
   1403732f4:	0f af c5             	imul   eax,ebp
   1403732f7:	66 0f 6e c1          	movd   xmm0,ecx
   1403732fb:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403732fe:	41 2b c0             	sub    eax,r8d
   140373301:	41 03 c1             	add    eax,r9d
   140373304:	0f 28 d1             	movaps xmm2,xmm1
   140373307:	f3 0f 58 d0          	addss  xmm2,xmm0
   14037330b:	41 0f b7 0c 47       	movzx  ecx,WORD PTR [r15+rax*2]
   140373310:	8d 45 01             	lea    eax,[rbp+0x1]
   140373313:	41 0f af c3          	imul   eax,r11d
   140373317:	83 c5 04             	add    ebp,0x4
   14037331a:	66 0f 6e c1          	movd   xmm0,ecx
   14037331e:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140373321:	41 2b c0             	sub    eax,r8d
   140373324:	41 03 c1             	add    eax,r9d
   140373327:	41 0f b7 0c 47       	movzx  ecx,WORD PTR [r15+rax*2]
   14037332c:	f3 0f 58 d0          	addss  xmm2,xmm0
   140373330:	66 0f 6e c1          	movd   xmm0,ecx
   140373334:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140373337:	f3 0f 58 d0          	addss  xmm2,xmm0
   14037333b:	41 3b d4             	cmp    edx,r12d
   14037333e:	7c 80                	jl     0x1403732c0
   140373340:	41 3b d2             	cmp    edx,r10d
   140373343:	7d 33                	jge    0x140373378
   140373345:	48 8b 84 fb 98 00 00 	mov    rax,QWORD PTR [rbx+rdi*8+0x98]
   14037334c:	00 
   14037334d:	45 8b de             	mov    r11d,r14d
   140373350:	45 2b d8             	sub    r11d,r8d
   140373353:	48 8b 38             	mov    rdi,QWORD PTR [rax]
   140373356:	41 8b c3             	mov    eax,r11d
   140373359:	0f af c2             	imul   eax,edx
   14037335c:	ff c2                	inc    edx
   14037335e:	41 2b c0             	sub    eax,r8d
   140373361:	41 03 c1             	add    eax,r9d
   140373364:	0f b7 0c 47          	movzx  ecx,WORD PTR [rdi+rax*2]
   140373368:	66 0f 6e c1          	movd   xmm0,ecx
   14037336c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037336f:	f3 0f 58 d0          	addss  xmm2,xmm0
   140373373:	41 3b d2             	cmp    edx,r10d
   140373376:	7c de                	jl     0x140373356
   140373378:	8b 4c 24 20          	mov    ecx,DWORD PTR [rsp+0x20]
   14037337c:	8b 54 24 24          	mov    edx,DWORD PTR [rsp+0x24]
   140373380:	44 0f b7 9c 24 e8 00 	movzx  r11d,WORD PTR [rsp+0xe8]
   140373387:	00 00 
   140373389:	eb 32                	jmp    0x1403733bd
   14037338b:	41 8b c6             	mov    eax,r14d
   14037338e:	41 2b c0             	sub    eax,r8d
   140373391:	0f af d0             	imul   edx,eax
   140373394:	48 8b 84 fb 98 00 00 	mov    rax,QWORD PTR [rbx+rdi*8+0x98]
   14037339b:	00 
   14037339c:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   14037339f:	41 2b d0             	sub    edx,r8d
   1403733a2:	41 03 d1             	add    edx,r9d
   1403733a5:	0f b7 04 51          	movzx  eax,WORD PTR [rcx+rdx*2]
   1403733a9:	8b 4c 24 20          	mov    ecx,DWORD PTR [rsp+0x20]
   1403733ad:	8b 54 24 24          	mov    edx,DWORD PTR [rsp+0x24]
   1403733b1:	66 0f 6e d0          	movd   xmm2,eax
   1403733b5:	0f 5b d2             	cvtdq2ps xmm2,xmm2
   1403733b8:	eb 03                	jmp    0x1403733bd
   1403733ba:	0f 57 d2             	xorps  xmm2,xmm2
   1403733bd:	0f 2f d7             	comiss xmm2,xmm7
   1403733c0:	77 0e                	ja     0x1403733d0
   1403733c2:	40 fe c6             	inc    sil
   1403733c5:	41 3a f5             	cmp    sil,r13b
   1403733c8:	0f 82 8c fe ff ff    	jb     0x14037325a
   1403733ce:	eb 05                	jmp    0x1403733d5
   1403733d0:	41 3a f5             	cmp    sil,r13b
   1403733d3:	72 14                	jb     0x1403733e9
   1403733d5:	ff c9                	dec    ecx
   1403733d7:	ba 80 00 00 00       	mov    edx,0x80
   1403733dc:	89 4c 24 20          	mov    DWORD PTR [rsp+0x20],ecx
   1403733e0:	41 3b c8             	cmp    ecx,r8d
   1403733e3:	0f 8f 3a fe ff ff    	jg     0x140373223
   1403733e9:	4c 8b 6c 24 28       	mov    r13,QWORD PTR [rsp+0x28]
   1403733ee:	44 8b a4 24 d8 00 00 	mov    r12d,DWORD PTR [rsp+0xd8]
   1403733f5:	00 
   1403733f6:	8d 79 01             	lea    edi,[rcx+0x1]
   1403733f9:	41 3b fe             	cmp    edi,r14d
   1403733fc:	0f 8d c8 00 00 00    	jge    0x1403734ca
   140373402:	48 8b 94 24 d0 00 00 	mov    rdx,QWORD PTR [rsp+0xd0]
   140373409:	00 
   14037340a:	4c 8d 05 bf 71 61 00 	lea    r8,[rip+0x6171bf]        # 0x14098a5d0
   140373411:	66 0f 6e d7          	movd   xmm2,edi
   140373415:	66 41 0f 6e c6       	movd   xmm0,r14d
   14037341a:	0f 5b d2             	cvtdq2ps xmm2,xmm2
   14037341d:	8b 02                	mov    eax,DWORD PTR [rdx]
   14037341f:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140373426:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140373429:	f3 0f 5e d0          	divss  xmm2,xmm0
   14037342d:	4a 8b 04 01          	mov    rax,QWORD PTR [rcx+r8*1]
   140373431:	f3 42 0f 10 4c 28 1c 	movss  xmm1,DWORD PTR [rax+r13*1+0x1c]
   140373438:	f3 42 0f 5c 4c 28 18 	subss  xmm1,DWORD PTR [rax+r13*1+0x18]
   14037343f:	f3 0f 59 ca          	mulss  xmm1,xmm2
   140373443:	f3 42 0f 58 4c 28 18 	addss  xmm1,DWORD PTR [rax+r13*1+0x18]
   14037344a:	f3 42 0f 11 4c 28 1c 	movss  DWORD PTR [rax+r13*1+0x1c],xmm1
   140373451:	8b 02                	mov    eax,DWORD PTR [rdx]
   140373453:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   14037345a:	4a 8b 04 01          	mov    rax,QWORD PTR [rcx+r8*1]
   14037345e:	f3 42 0f 10 4c 28 0c 	movss  xmm1,DWORD PTR [rax+r13*1+0xc]
   140373465:	f3 42 0f 5c 4c 28 08 	subss  xmm1,DWORD PTR [rax+r13*1+0x8]
   14037346c:	f3 0f 59 ca          	mulss  xmm1,xmm2
   140373470:	f3 42 0f 58 4c 28 08 	addss  xmm1,DWORD PTR [rax+r13*1+0x8]
   140373477:	f3 42 0f 11 4c 28 14 	movss  DWORD PTR [rax+r13*1+0x14],xmm1
   14037347e:	8b 02                	mov    eax,DWORD PTR [rdx]
   140373480:	48 69 c0 78 ab 06 00 	imul   rax,rax,0x6ab78
   140373487:	4a 8b 04 00          	mov    rax,QWORD PTR [rax+r8*1]
   14037348b:	f3 42 0f 11 4c 28 0c 	movss  DWORD PTR [rax+r13*1+0xc],xmm1
   140373492:	8b 02                	mov    eax,DWORD PTR [rdx]
   140373494:	8b d7                	mov    edx,edi
   140373496:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   14037349d:	4a 8b 04 01          	mov    rax,QWORD PTR [rcx+r8*1]
   1403734a1:	48 8b cb             	mov    rcx,rbx
   1403734a4:	f3 42 0f 10 4c 28 04 	movss  xmm1,DWORD PTR [rax+r13*1+0x4]
   1403734ab:	f3 42 0f 5c 0c 28    	subss  xmm1,DWORD PTR [rax+r13*1]
   1403734b1:	f3 0f 59 ca          	mulss  xmm1,xmm2
   1403734b5:	f3 42 0f 58 0c 28    	addss  xmm1,DWORD PTR [rax+r13*1]
   1403734bb:	f3 42 0f 11 4c 28 04 	movss  DWORD PTR [rax+r13*1+0x4],xmm1
   1403734c2:	e8 29 6a ff ff       	call   0x140369ef0
   1403734c7:	89 7b 04             	mov    DWORD PTR [rbx+0x4],edi
   1403734ca:	f6 83 1c 02 00 00 80 	test   BYTE PTR [rbx+0x21c],0x80
   1403734d1:	0f 85 cf 00 00 00    	jne    0x1403735a6
   1403734d7:	40 32 f6             	xor    sil,sil
   1403734da:	40 38 73 60          	cmp    BYTE PTR [rbx+0x60],sil
   1403734de:	0f 86 c2 00 00 00    	jbe    0x1403735a6
   1403734e4:	40 b5 01             	mov    bpl,0x1
   1403734e7:	44 0f b6 fe          	movzx  r15d,sil
   1403734eb:	44 0f b6 e5          	movzx  r12d,bpl
   1403734ef:	45 0f b6 74 1f 61    	movzx  r14d,BYTE PTR [r15+rbx*1+0x61]
   1403734f5:	44 3a f5             	cmp    r14b,bpl
   1403734f8:	0f 86 8e 00 00 00    	jbe    0x14037358c
   1403734fe:	44 8b 4b 04          	mov    r9d,DWORD PTR [rbx+0x4]
   140373502:	44 8b 13             	mov    r10d,DWORD PTR [rbx]
   140373505:	45 8b c2             	mov    r8d,r10d
   140373508:	45 3b d1             	cmp    r10d,r9d
   14037350b:	7d 66                	jge    0x140373573
   14037350d:	0f b6 7b 60          	movzx  edi,BYTE PTR [rbx+0x60]
   140373511:	45 0f b6 dc          	movzx  r11d,r12b
   140373515:	40 3a f7             	cmp    sil,dil
   140373518:	73 49                	jae    0x140373563
   14037351a:	41 0f b6 c6          	movzx  eax,r14b
   14037351e:	44 3b d8             	cmp    r11d,eax
   140373521:	73 40                	jae    0x140373563
   140373523:	45 3b ca             	cmp    r9d,r10d
   140373526:	7e 3b                	jle    0x140373563
   140373528:	45 3b c2             	cmp    r8d,r10d
   14037352b:	41 8d 51 ff          	lea    edx,[r9-0x1]
   14037352f:	41 8b c0             	mov    eax,r8d
   140373532:	41 0f 4c c2          	cmovl  eax,r10d
   140373536:	41 3b c1             	cmp    eax,r9d
   140373539:	0f 4c d0             	cmovl  edx,eax
   14037353c:	41 8b c1             	mov    eax,r9d
   14037353f:	41 2b c2             	sub    eax,r10d
   140373542:	41 0f af c3          	imul   eax,r11d
   140373546:	03 d0                	add    edx,eax
   140373548:	4a 8b 84 fb 98 00 00 	mov    rax,QWORD PTR [rbx+r15*8+0x98]
   14037354f:	00 
   140373550:	41 2b d2             	sub    edx,r10d
   140373553:	48 8b 08             	mov    rcx,QWORD PTR [rax]
   140373556:	0f b7 04 51          	movzx  eax,WORD PTR [rcx+rdx*2]
   14037355a:	66 0f 6e c0          	movd   xmm0,eax
   14037355e:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140373561:	eb 03                	jmp    0x140373566
   140373563:	0f 57 c0             	xorps  xmm0,xmm0
   140373566:	0f 2f c7             	comiss xmm0,xmm7
   140373569:	77 08                	ja     0x140373573
   14037356b:	41 ff c0             	inc    r8d
   14037356e:	45 3b c1             	cmp    r8d,r9d
   140373571:	7c a2                	jl     0x140373515
   140373573:	45 3b c1             	cmp    r8d,r9d
   140373576:	7d 14                	jge    0x14037358c
   140373578:	41 8d 6c 24 01       	lea    ebp,[r12+0x1]
   14037357d:	44 0f b6 e5          	movzx  r12d,bpl
   140373581:	41 3a 6c 1f 61       	cmp    bpl,BYTE PTR [r15+rbx*1+0x61]
   140373586:	0f 82 79 ff ff ff    	jb     0x140373505
   14037358c:	40 fe c6             	inc    sil
   14037358f:	41 88 6c 1f 61       	mov    BYTE PTR [r15+rbx*1+0x61],bpl
   140373594:	40 3a 73 60          	cmp    sil,BYTE PTR [rbx+0x60]
   140373598:	0f 82 46 ff ff ff    	jb     0x1403734e4
   14037359e:	44 8b a4 24 d8 00 00 	mov    r12d,DWORD PTR [rsp+0xd8]
   1403735a5:	00 
   1403735a6:	44 0f b6 84 24 e0 00 	movzx  r8d,BYTE PTR [rsp+0xe0]
   1403735ad:	00 00 
   1403735af:	ba 80 00 00 00       	mov    edx,0x80
   1403735b4:	41 ba 20 08 00 00    	mov    r10d,0x820
   1403735ba:	41 bb 80 80 00 00    	mov    r11d,0x8080
   1403735c0:	48 8b 84 24 d0 00 00 	mov    rax,QWORD PTR [rsp+0xd0]
   1403735c7:	00 
   1403735c8:	41 ff c4             	inc    r12d
   1403735cb:	49 81 c5 90 00 00 00 	add    r13,0x90
   1403735d2:	44 89 a4 24 d8 00 00 	mov    DWORD PTR [rsp+0xd8],r12d
   1403735d9:	00 
   1403735da:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   1403735df:	8b 00                	mov    eax,DWORD PTR [rax]
   1403735e1:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   1403735e8:	44 8b c8             	mov    r9d,eax
   1403735eb:	48 8d 05 de 6f 61 00 	lea    rax,[rip+0x616fde]        # 0x14098a5d0
   1403735f2:	44 3b 64 01 08       	cmp    r12d,DWORD PTR [rcx+rax*1+0x8]
   1403735f7:	48 8d 0d d2 6f 61 00 	lea    rcx,[rip+0x616fd2]        # 0x14098a5d0
   1403735fe:	0f 8c ac f9 ff ff    	jl     0x140372fb0
   140373604:	44 0f 28 54 24 30    	movaps xmm10,XMMWORD PTR [rsp+0x30]
   14037360a:	44 0f 28 4c 24 40    	movaps xmm9,XMMWORD PTR [rsp+0x40]
   140373610:	44 0f 28 44 24 50    	movaps xmm8,XMMWORD PTR [rsp+0x50]
   140373616:	0f 28 7c 24 60       	movaps xmm7,XMMWORD PTR [rsp+0x60]
   14037361b:	0f 28 74 24 70       	movaps xmm6,XMMWORD PTR [rsp+0x70]
   140373620:	4c 8b bc 24 88 00 00 	mov    r15,QWORD PTR [rsp+0x88]
   140373627:	00 
   140373628:	4c 8b b4 24 90 00 00 	mov    r14,QWORD PTR [rsp+0x90]
   14037362f:	00 
   140373630:	4c 8b ac 24 98 00 00 	mov    r13,QWORD PTR [rsp+0x98]
   140373637:	00 
   140373638:	48 8b bc 24 a0 00 00 	mov    rdi,QWORD PTR [rsp+0xa0]
   14037363f:	00 
   140373640:	48 8b b4 24 a8 00 00 	mov    rsi,QWORD PTR [rsp+0xa8]
   140373647:	00 
   140373648:	48 8b ac 24 b0 00 00 	mov    rbp,QWORD PTR [rsp+0xb0]
   14037364f:	00 
   140373650:	48 8b 9c 24 b8 00 00 	mov    rbx,QWORD PTR [rsp+0xb8]
   140373657:	00 
   140373658:	48 81 c4 c0 00 00 00 	add    rsp,0xc0
   14037365f:	41 5c                	pop    r12
   140373661:	c3                   	ret
   140373662:	cc                   	int3
   140373663:	cc                   	int3
   140373664:	cc                   	int3
   140373665:	cc                   	int3
   140373666:	cc                   	int3
   140373667:	cc                   	int3
   140373668:	cc                   	int3
   140373669:	cc                   	int3
   14037366a:	cc                   	int3
   14037366b:	cc                   	int3
   14037366c:	cc                   	int3
   14037366d:	cc                   	int3
   14037366e:	cc                   	int3
   14037366f:	cc                   	int3
