
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140336c90 <.text+0x335c90>:
   140336c90:	8b 74 24 68          	mov    esi,DWORD PTR [rsp+0x68]
   140336c94:	49 ff c4             	inc    r12
   140336c97:	4c 8b 4d 98          	mov    r9,QWORD PTR [rbp-0x68]
   140336c9b:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140336ca0:	0f b7 00             	movzx  eax,WORD PTR [rax]
   140336ca3:	89 4c 24 40          	mov    DWORD PTR [rsp+0x40],ecx
   140336ca7:	4c 89 65 a8          	mov    QWORD PTR [rbp-0x58],r12
   140336cab:	3b c8                	cmp    ecx,eax
   140336cad:	0f 8c 3d f9 ff ff    	jl     0x1403365f0
   140336cb3:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   140336cb9:	44 8b 44 24 64       	mov    r8d,DWORD PTR [rsp+0x64]
   140336cbe:	44 8b 7c 24 4c       	mov    r15d,DWORD PTR [rsp+0x4c]
   140336cc3:	4c 8b 74 24 68       	mov    r14,QWORD PTR [rsp+0x68]
   140336cc8:	44 03 c3             	add    r8d,ebx
   140336ccb:	44 8b 6c 24 48       	mov    r13d,DWORD PTR [rsp+0x48]
   140336cd0:	45 33 c9             	xor    r9d,r9d
   140336cd3:	e9 5f f8 ff ff       	jmp    0x140336537
   140336cd8:	83 c3 02             	add    ebx,0x2
   140336cdb:	89 5d 90             	mov    DWORD PTR [rbp-0x70],ebx
   140336cde:	83 fb 01             	cmp    ebx,0x1
   140336ce1:	0f 8e 39 f8 ff ff    	jle    0x140336520
   140336ce7:	48 8b 54 24 50       	mov    rdx,QWORD PTR [rsp+0x50]
   140336cec:	46 8d 0c 39          	lea    r9d,[rcx+r15*1]
   140336cf0:	48 8b ce             	mov    rcx,rsi
   140336cf3:	45 8b c4             	mov    r8d,r12d
   140336cf6:	e8 a5 72 ff ff       	call   0x14032dfa0
   140336cfb:	80 be 92 00 00 00 00 	cmp    BYTE PTR [rsi+0x92],0x0
   140336d02:	48 8b 54 24 50       	mov    rdx,QWORD PTR [rsp+0x50]
   140336d07:	8b 7a 0c             	mov    edi,DWORD PTR [rdx+0xc]
   140336d0a:	89 7c 24 48          	mov    DWORD PTR [rsp+0x48],edi
   140336d0e:	75 0d                	jne    0x140336d1d
   140336d10:	80 be 93 00 00 00 00 	cmp    BYTE PTR [rsi+0x93],0x0
   140336d17:	0f 84 d5 00 00 00    	je     0x140336df2
   140336d1d:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   140336d23:	41 03 cf             	add    ecx,r15d
   140336d26:	3b f9                	cmp    edi,ecx
   140336d28:	0f 8d c4 00 00 00    	jge    0x140336df2
   140336d2e:	f3 0f 10 35 b6 04 36 	movss  xmm6,DWORD PTR [rip+0x3604b6]        # 0x1406971ec
   140336d35:	00 
   140336d36:	8b f7                	mov    esi,edi
   140336d38:	4c 8b 6c 24 68       	mov    r13,QWORD PTR [rsp+0x68]
   140336d3d:	0f 57 ff             	xorps  xmm7,xmm7
   140336d40:	4c 8b 64 24 58       	mov    r12,QWORD PTR [rsp+0x58]
   140336d45:	4c 8b 44 24 78       	mov    r8,QWORD PTR [rsp+0x78]
   140336d4a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140336d50:	8b ce                	mov    ecx,esi
   140336d52:	2b 4a 0c             	sub    ecx,DWORD PTR [rdx+0xc]
   140336d55:	8b c1                	mov    eax,ecx
   140336d57:	4c 63 f9             	movsxd r15,ecx
   140336d5a:	c1 e0 09             	shl    eax,0x9
   140336d5d:	4c 69 f0 3c 01 00 00 	imul   r14,rax,0x13c
   140336d64:	33 c0                	xor    eax,eax
   140336d66:	4d 03 f0             	add    r14,r8
   140336d69:	8b d8                	mov    ebx,eax
   140336d6b:	66 43 3b 44 7d 00    	cmp    ax,WORD PTR [r13+r15*2+0x0]
   140336d71:	73 52                	jae    0x140336dc5
   140336d73:	49 8b fe             	mov    rdi,r14
   140336d76:	f3 0f 10 07          	movss  xmm0,DWORD PTR [rdi]
   140336d7a:	0f 2e c7             	ucomiss xmm0,xmm7
   140336d7d:	7a 02                	jp     0x140336d81
   140336d7f:	74 31                	je     0x140336db2
   140336d81:	0f 2f f0             	comiss xmm6,xmm0
   140336d84:	76 2c                	jbe    0x140336db2
   140336d86:	48 63 c3             	movsxd rax,ebx
   140336d89:	49 8b cc             	mov    rcx,r12
   140336d8c:	4c 69 c8 3c 01 00 00 	imul   r9,rax,0x13c
   140336d93:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   140336d98:	4c 89 44 24 20       	mov    QWORD PTR [rsp+0x20],r8
   140336d9d:	4d 03 ce             	add    r9,r14
   140336da0:	44 8b c6             	mov    r8d,esi
   140336da3:	e8 38 5e ff ff       	call   0x14032cbe0
   140336da8:	48 8b 54 24 50       	mov    rdx,QWORD PTR [rsp+0x50]
   140336dad:	4c 8b 44 24 78       	mov    r8,QWORD PTR [rsp+0x78]
   140336db2:	43 0f b7 44 7d 00    	movzx  eax,WORD PTR [r13+r15*2+0x0]
   140336db8:	ff c3                	inc    ebx
   140336dba:	48 81 c7 3c 01 00 00 	add    rdi,0x13c
   140336dc1:	3b d8                	cmp    ebx,eax
   140336dc3:	7c b1                	jl     0x140336d76
   140336dc5:	41 8b 94 24 bc 00 00 	mov    edx,DWORD PTR [r12+0xbc]
   140336dcc:	00 
   140336dcd:	ff c6                	inc    esi
   140336dcf:	44 8b 7c 24 4c       	mov    r15d,DWORD PTR [rsp+0x4c]
   140336dd4:	41 03 d7             	add    edx,r15d
   140336dd7:	3b f2                	cmp    esi,edx
   140336dd9:	48 8b 54 24 50       	mov    rdx,QWORD PTR [rsp+0x50]
   140336dde:	0f 8c 6c ff ff ff    	jl     0x140336d50
   140336de4:	44 8b 64 24 40       	mov    r12d,DWORD PTR [rsp+0x40]
   140336de9:	8b 7c 24 48          	mov    edi,DWORD PTR [rsp+0x48]
   140336ded:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140336df2:	41 8b cf             	mov    ecx,r15d
   140336df5:	b8 04 00 00 00       	mov    eax,0x4
   140336dfa:	2b cf                	sub    ecx,edi
   140336dfc:	03 8e bc 00 00 00    	add    ecx,DWORD PTR [rsi+0xbc]
   140336e02:	48 63 c9             	movsxd rcx,ecx
   140336e05:	48 f7 e1             	mul    rcx
   140336e08:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   140336e0f:	48 0f 40 c1          	cmovo  rax,rcx
   140336e13:	48 8b c8             	mov    rcx,rax
   140336e16:	e8 45 47 2e 00       	call   0x14061b560
   140336e1b:	41 8b cf             	mov    ecx,r15d
   140336e1e:	48 89 45 80          	mov    QWORD PTR [rbp-0x80],rax
   140336e22:	2b cf                	sub    ecx,edi
   140336e24:	33 d2                	xor    edx,edx
   140336e26:	03 8e bc 00 00 00    	add    ecx,DWORD PTR [rsi+0xbc]
   140336e2c:	4c 8b f0             	mov    r14,rax
   140336e2f:	4c 63 c1             	movsxd r8,ecx
   140336e32:	48 8b c8             	mov    rcx,rax
   140336e35:	49 c1 e0 02          	shl    r8,0x2
   140336e39:	e8 ac 9e 2e 00       	call   0x140620cea
   140336e3e:	65 48 8b 0c 25 58 00 	mov    rcx,QWORD PTR gs:0x58
   140336e45:	00 00 
   140336e47:	b8 c0 13 00 00       	mov    eax,0x13c0
   140336e4c:	48 8b 11             	mov    rdx,QWORD PTR [rcx]
   140336e4f:	8b               	mov    ecx,DWORD PTR [rax+rdx*1]
