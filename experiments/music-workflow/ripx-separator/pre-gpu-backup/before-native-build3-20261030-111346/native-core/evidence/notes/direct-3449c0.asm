
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403449c0 <.text+0x3439c0>:
   1403449c0:	4c 8b dc             	mov    r11,rsp
   1403449c3:	48 81 ec c8 09 00 00 	sub    rsp,0x9c8
   1403449ca:	48 8b 05 97 d7 62 00 	mov    rax,QWORD PTR [rip+0x62d797]        # 0x140972168
   1403449d1:	48 33 c4             	xor    rax,rsp
   1403449d4:	48 89 84 24 80 09 00 	mov    QWORD PTR [rsp+0x980],rax
   1403449db:	00 
   1403449dc:	8b 41 08             	mov    eax,DWORD PTR [rcx+0x8]
   1403449df:	2b 41 04             	sub    eax,DWORD PTR [rcx+0x4]
   1403449e2:	03 c2                	add    eax,edx
   1403449e4:	44 89 4c 24 24       	mov    DWORD PTR [rsp+0x24],r9d
   1403449e9:	3b 41 40             	cmp    eax,DWORD PTR [rcx+0x40]
   1403449ec:	0f 8d 27 03 00 00    	jge    0x140344d19
   1403449f2:	48 8b 51 38          	mov    rdx,QWORD PTR [rcx+0x38]
   1403449f6:	48 98                	cdqe
   1403449f8:	48 69 c8 08 52 04 00 	imul   rcx,rax,0x45208
   1403449ff:	48 89 54 24 38       	mov    QWORD PTR [rsp+0x38],rdx
   140344a04:	48 89 4c 24 48       	mov    QWORD PTR [rsp+0x48],rcx
   140344a09:	c7 44 24 20 00 00 00 	mov    DWORD PTR [rsp+0x20],0x0
   140344a10:	00 
   140344a11:	c6 84 11 00 52 04 00 	mov    BYTE PTR [rcx+rdx*1+0x45200],0x0
   140344a18:	00 
   140344a19:	48 8d 04 11          	lea    rax,[rcx+rdx*1]
   140344a1d:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   140344a22:	45 85 c9             	test   r9d,r9d
   140344a25:	0f 84 ee 02 00 00    	je     0x140344d19
   140344a2b:	49 89 5b 18          	mov    QWORD PTR [r11+0x18],rbx
   140344a2f:	32 c0                	xor    al,al
   140344a31:	49 89 6b f8          	mov    QWORD PTR [r11-0x8],rbp
   140344a35:	49 89 73 f0          	mov    QWORD PTR [r11-0x10],rsi
   140344a39:	49 89 7b e8          	mov    QWORD PTR [r11-0x18],rdi
   140344a3d:	4d 89 63 e0          	mov    QWORD PTR [r11-0x20],r12
   140344a41:	4c 8b a4 24 f0 09 00 	mov    r12,QWORD PTR [rsp+0x9f0]
   140344a48:	00 
   140344a49:	4d 89 6b d8          	mov    QWORD PTR [r11-0x28],r13
   140344a4d:	4d 89 73 d0          	mov    QWORD PTR [r11-0x30],r14
   140344a51:	4d 8d 70 14          	lea    r14,[r8+0x14]
   140344a55:	4c 89 74 24 30       	mov    QWORD PTR [rsp+0x30],r14
   140344a5a:	4d 89 7b c8          	mov    QWORD PTR [r11-0x38],r15
   140344a5e:	66 90                	xchg   ax,ax
   140344a60:	3c 70                	cmp    al,0x70
   140344a62:	0f 83 65 02 00 00    	jae    0x140344ccd
   140344a68:	0f b6 c0             	movzx  eax,al
   140344a6b:	41 b8 e0 09 00 00    	mov    r8d,0x9e0
   140344a71:	48 69 c0 e0 09 00 00 	imul   rax,rax,0x9e0
   140344a78:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   140344a7d:	4c 8d 3c 08          	lea    r15,[rax+rcx*1]
   140344a81:	4d 8d 2c 17          	lea    r13,[r15+rdx*1]
   140344a85:	33 d2                	xor    edx,edx
   140344a87:	49 8b cd             	mov    rcx,r13
   140344a8a:	e8 5b c2 2d 00       	call   0x140620cea
   140344a8f:	f3 41 0f 10 4e f4    	movss  xmm1,DWORD PTR [r14-0xc]
   140344a95:	48 8d b4 24 50 09 00 	lea    rsi,[rsp+0x950]
   140344a9c:	00 
   140344a9d:	45 33 c0             	xor    r8d,r8d
   140344aa0:	49 8d 7e 04          	lea    rdi,[r14+0x4]
   140344aa4:	41 8d 68 30          	lea    ebp,[r8+0x30]
   140344aa8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140344aaf:	00 
   140344ab0:	48 63 1f             	movsxd rbx,DWORD PTR [rdi]
   140344ab3:	8b 0d 43 4f 5f 00    	mov    ecx,DWORD PTR [rip+0x5f4f43]        # 0x1409399fc
   140344ab9:	85 db                	test   ebx,ebx
   140344abb:	78 6a                	js     0x140344b27
   140344abd:	44 8b 0d 3c 4f 5f 00 	mov    r9d,DWORD PTR [rip+0x5f4f3c]        # 0x140939a00
   140344ac4:	44 03 c9             	add    r9d,ecx
   140344ac7:	32 c9                	xor    cl,cl
   140344ac9:	45 85 c9             	test   r9d,r9d
   140344acc:	74 4a                	je     0x140344b18
   140344ace:	4c 6b db 4c          	imul   r11,rbx,0x4c
   140344ad2:	47 0f b6 54 23 30    	movzx  r10d,BYTE PTR [r11+r12*1+0x30]
   140344ad8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140344adf:	00 
   140344ae0:	0f b6 d1             	movzx  edx,cl
   140344ae3:	49 8d 04 10          	lea    rax,[r8+rdx*1]
   140344ae7:	48 03 c0             	add    rax,rax
   140344aea:	41 3a ca             	cmp    cl,r10b
   140344aed:	73 13                	jae    0x140344b02
   140344aef:	48 c1 e2 04          	shl    rdx,0x4
   140344af3:	49 03 d3             	add    rdx,r11
   140344af6:	42 0f 10 04 22       	movups xmm0,XMMWORD PTR [rdx+r12*1]
   140344afb:	0f 11 44 c4 50       	movups XMMWORD PTR [rsp+rax*8+0x50],xmm0
   140344b00:	eb 0c                	jmp    0x140344b0e
   140344b02:	33 d2                	xor    edx,edx
   140344b04:	48 89 54 c4 50       	mov    QWORD PTR [rsp+rax*8+0x50],rdx
   140344b09:	48 89 54 c4 58       	mov    QWORD PTR [rsp+rax*8+0x58],rdx
   140344b0e:	fe c1                	inc    cl
   140344b10:	0f b6 c1             	movzx  eax,cl
   140344b13:	41 3b c1             	cmp    eax,r9d
   140344b16:	72 c8                	jb     0x140344ae0
   140344b18:	48 6b cb 4c          	imul   rcx,rbx,0x4c
   140344b1c:	48 8b c3             	mov    rax,rbx
   140344b1f:	42 0f b6 44 21 30    	movzx  eax,BYTE PTR [rcx+r12*1+0x30]
   140344b25:	eb 3a                	jmp    0x140344b61
   140344b27:	8b 05 d3 4e 5f 00    	mov    eax,DWORD PTR [rip+0x5f4ed3]        # 0x140939a00
   140344b2d:	8d 14 08             	lea    edx,[rax+rcx*1]
   140344b30:	32 c9                	xor    cl,cl
   140344b32:	85 d2                	test   edx,edx
   140344b34:	74 29                	je     0x140344b5f
   140344b36:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140344b3d:	00 00 00 
   140344b40:	45 33 c9             	xor    r9d,r9d
   140344b43:	0f b6 c1             	movzx  eax,cl
   140344b46:	49 03 c0             	add    rax,r8
   140344b49:	fe c1                	inc    cl
   140344b4b:	48 03 c0             	add    rax,rax
   140344b4e:	4c 89 4c c4 50       	mov    QWORD PTR [rsp+rax*8+0x50],r9
   140344b53:	4c 89 4c c4 58       	mov    QWORD PTR [rsp+rax*8+0x58],r9
   140344b58:	0f b6 c1             	movzx  eax,cl
   140344b5b:	3b c2                	cmp    eax,edx
   140344b5d:	72 e1                	jb     0x140344b40
   140344b5f:	b0 01                	mov    al,0x1
   140344b61:	88 06                	mov    BYTE PTR [rsi],al
   140344b63:	48 83 c7 04          	add    rdi,0x4
   140344b67:	48 ff c6             	inc    rsi
   140344b6a:	49 83 c0 03          	add    r8,0x3
   140344b6e:	48 83 ed 01          	sub    rbp,0x1
   140344b72:	0f 85 38 ff ff ff    	jne    0x140344ab0
   140344b78:	41 8b 46 fc          	mov    eax,DWORD PTR [r14-0x4]
   140344b7c:	33 d2                	xor    edx,edx
   140344b7e:	4c 8b 44 24 28       	mov    r8,QWORD PTR [rsp+0x28]
   140344b83:	4c 8b 4c 24 40       	mov    r9,QWORD PTR [rsp+0x40]
   140344b88:	f3 41 0f 11 4d 00    	movss  DWORD PTR [r13+0x0],xmm1
   140344b8e:	43 89 84 01 c8 09 00 	mov    DWORD PTR [r9+r8*1+0x9c8],eax
   140344b95:	00 
   140344b96:	b8 00 80 00 00       	mov    eax,0x8000
   140344b9b:	41 80 3e 01          	cmp    BYTE PTR [r14],0x1
   140344b9f:	66 0f 45 d0          	cmovne dx,ax
   140344ba3:	66 41 89 55 04       	mov    WORD PTR [r13+0x4],dx
   140344ba8:	41 0f b6 06          	movzx  eax,BYTE PTR [r14]
   140344bac:	0f b6 c8             	movzx  ecx,al
   140344baf:	3c 01                	cmp    al,0x1
   140344bb1:	74 27                	je     0x140344bda
   140344bb3:	3c 10                	cmp    al,0x10
   140344bb5:	72 23                	jb     0x140344bda
   140344bb7:	3c 11                	cmp    al,0x11
   140344bb9:	76 12                	jbe    0x140344bcd
   140344bbb:	3c 12                	cmp    al,0x12
   140344bbd:	74 04                	je     0x140344bc3
   140344bbf:	3c 40                	cmp    al,0x40
   140344bc1:	75 17                	jne    0x140344bda
   140344bc3:	41 83 7e f0 00       	cmp    DWORD PTR [r14-0x10],0x0
   140344bc8:	0f b6 c8             	movzx  ecx,al
   140344bcb:	74 0d                	je     0x140344bda
   140344bcd:	66 83 ca 04          	or     dx,0x4
   140344bd1:	66 41 89 55 04       	mov    WORD PTR [r13+0x4],dx
   140344bd6:	41 0f b6 0e          	movzx  ecx,BYTE PTR [r14]
   140344bda:	4c 8b 64 24 38       	mov    r12,QWORD PTR [rsp+0x38]
   140344bdf:	48 8d bc 24 50 09 00 	lea    rdi,[rsp+0x950]
   140344be6:	00 
   140344be7:	43 88 8c 01 cd 09 00 	mov    BYTE PTR [r9+r8*1+0x9cd],cl
   140344bee:	00 
   140344bef:	48 8d 74 24 50       	lea    rsi,[rsp+0x50]
   140344bf4:	41 8b 46 ec          	mov    eax,DWORD PTR [r14-0x14]
   140344bf8:	49 8d 6d 08          	lea    rbp,[r13+0x8]
   140344bfc:	41 89 85 d8 09 00 00 	mov    DWORD PTR [r13+0x9d8],eax
   140344c03:	33 db                	xor    ebx,ebx
   140344c05:	41 8b 46 f0          	mov    eax,DWORD PTR [r14-0x10]
   140344c09:	4f 8d 34 27          	lea    r14,[r15+r12*1]
   140344c0d:	41 89 85 d0 09 00 00 	mov    DWORD PTR [r13+0x9d0],eax
   140344c14:	41 c6 85 cc 09 00 00 	mov    BYTE PTR [r13+0x9cc],0x0
   140344c1b:	00 
   140344c1c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140344c20:	41 0f b6 86 cc 09 00 	movzx  eax,BYTE PTR [r14+0x9cc]
   140344c27:	00 
   140344c28:	48 8b d6             	mov    rdx,rsi
   140344c2b:	fe c0                	inc    al
   140344c2d:	48 8b cd             	mov    rcx,rbp
   140344c30:	41 88 85 cc 09 00 00 	mov    BYTE PTR [r13+0x9cc],al
   140344c37:	44 8b 05 be 4d 5f 00 	mov    r8d,DWORD PTR [rip+0x5f4dbe]        # 0x1409399fc
   140344c3e:	8b 05 bc 4d 5f 00    	mov    eax,DWORD PTR [rip+0x5f4dbc]        # 0x140939a00
   140344c44:	44 03 c0             	add    r8d,eax
   140344c47:	49 c1 e0 04          	shl    r8,0x4
   140344c4b:	e8 94 c0 2d 00       	call   0x140620ce4
   140344c50:	0f b6 07             	movzx  eax,BYTE PTR [rdi]
   140344c53:	43 88 44 3c 38       	mov    BYTE PTR [r12+r15*1+0x38],al
   140344c58:	66 41 83 7d 04 00    	cmp    WORD PTR [r13+0x4],0x0
   140344c5e:	7d 04                	jge    0x140344c64
   140344c60:	32 c0                	xor    al,al
   140344c62:	eb 03                	jmp    0x140344c67
   140344c64:	8d 43 01             	lea    eax,[rbx+0x1]
   140344c67:	43 88 44 3c 39       	mov    BYTE PTR [r12+r15*1+0x39],al
   140344c6c:	ff c3                	inc    ebx
   140344c6e:	49 83 c7 34          	add    r15,0x34
   140344c72:	48 83 c6 30          	add    rsi,0x30
   140344c76:	48 ff c7             	inc    rdi
   140344c79:	48 83 c5 34          	add    rbp,0x34
   140344c7d:	83 fb 30             	cmp    ebx,0x30
   140344c80:	72 9e                	jb     0x140344c20
   140344c82:	48 8b 4c 24 28       	mov    rcx,QWORD PTR [rsp+0x28]
   140344c87:	4c 8b 74 24 30       	mov    r14,QWORD PTR [rsp+0x30]
   140344c8c:	4c 8b a4 24 f0 09 00 	mov    r12,QWORD PTR [rsp+0x9f0]
   140344c93:	00 
   140344c94:	49 81 c6 d8 00 00 00 	add    r14,0xd8
   140344c9b:	48 8b 54 24 38       	mov    rdx,QWORD PTR [rsp+0x38]
   140344ca0:	fe 81 00 52 04 00    	inc    BYTE PTR [rcx+0x45200]
   140344ca6:	0f b6 81 00 52 04 00 	movzx  eax,BYTE PTR [rcx+0x45200]
   140344cad:	8b 4c 24 20          	mov    ecx,DWORD PTR [rsp+0x20]
   140344cb1:	ff c1                	inc    ecx
   140344cb3:	4c 89 74 24 30       	mov    QWORD PTR [rsp+0x30],r14
   140344cb8:	3b 4c 24 24          	cmp    ecx,DWORD PTR [rsp+0x24]
   140344cbc:	89 4c 24 20          	mov    DWORD PTR [rsp+0x20],ecx
   140344cc0:	48 8b 4c 24 48       	mov    rcx,QWORD PTR [rsp+0x48]
   140344cc5:	0f 82 95 fd ff ff    	jb     0x140344a60
   140344ccb:	eb 0c                	jmp    0x140344cd9
   140344ccd:	48 8d 0d 0c 26 36 00 	lea    rcx,[rip+0x36260c]        # 0x1406a72e0
   140344cd4:	e8 67 46 28 00       	call   0x1405c9340
   140344cd9:	4c 8b b4 24 98 09 00 	mov    r14,QWORD PTR [rsp+0x998]
   140344ce0:	00 
   140344ce1:	4c 8b ac 24 a0 09 00 	mov    r13,QWORD PTR [rsp+0x9a0]
   140344ce8:	00 
   140344ce9:	4c 8b a4 24 a8 09 00 	mov    r12,QWORD PTR [rsp+0x9a8]
   140344cf0:	00 
   140344cf1:	48 8b bc 24 b0 09 00 	mov    rdi,QWORD PTR [rsp+0x9b0]
   140344cf8:	00 
   140344cf9:	48 8b b4 24 b8 09 00 	mov    rsi,QWORD PTR [rsp+0x9b8]
   140344d00:	00 
   140344d01:	48 8b ac 24 c0 09 00 	mov    rbp,QWORD PTR [rsp+0x9c0]
   140344d08:	00 
   140344d09:	48 8b 9c 24 e0 09 00 	mov    rbx,QWORD PTR [rsp+0x9e0]
   140344d10:	00 
   140344d11:	4c 8b bc 24 90 09 00 	mov    r15,QWORD PTR [rsp+0x990]
   140344d18:	00 
   140344d19:	48 8b 8c 24 80 09 00 	mov    rcx,QWORD PTR [rsp+0x980]
   140344d20:	00 
   140344d21:	48 33 cc             	xor    rcx,rsp
   140344d24:	e8 d7 68 2d 00       	call   0x14061b600
   140344d29:	48 81 c4 c8 09 00 00 	add    rsp,0x9c8
   140344d30:	c3                   	ret
   140344d31:	cc                   	int3
   140344d32:	cc                   	int3
   140344d33:	cc                   	int3
   140344d34:	cc                   	int3
   140344d35:	cc                   	int3
   140344d36:	cc                   	int3
   140344d37:	cc                   	int3
   140344d38:	cc                   	int3
   140344d39:	cc                   	int3
   140344d3a:	cc                   	int3
   140344d3b:	cc                   	int3
   140344d3c:	cc                   	int3
   140344d3d:	cc                   	int3
   140344d3e:	cc                   	int3
   140344d3f:	cc                   	int3
