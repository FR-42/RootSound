
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014025fc80 <.text+0x25ec80>:
   14025fc80:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   14025fc85:	56                   	push   rsi
   14025fc86:	48 83 ec 50          	sub    rsp,0x50
   14025fc8a:	8b f2                	mov    esi,edx
   14025fc8c:	48 8b d9             	mov    rbx,rcx
   14025fc8f:	45 85 c0             	test   r8d,r8d
   14025fc92:	79 10                	jns    0x14025fca4
   14025fc94:	44 8b 05 15 a5 72 00 	mov    r8d,DWORD PTR [rip+0x72a515]        # 0x14098a1b0
   14025fc9b:	45 85 c0             	test   r8d,r8d
   14025fc9e:	0f 88 e5 00 00 00    	js     0x14025fd89
   14025fca4:	44 3b 05 25 11 75 14 	cmp    r8d,DWORD PTR [rip+0x14751125]        # 0x1549b0dd0
   14025fcab:	0f 8d d8 00 00 00    	jge    0x14025fd89
   14025fcb1:	48 8b 49 30          	mov    rcx,QWORD PTR [rcx+0x30]
   14025fcb5:	48 89 7c 24 60       	mov    QWORD PTR [rsp+0x60],rdi
   14025fcba:	0f 29 74 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm6
   14025fcbf:	0f 29 7c 24 30       	movaps XMMWORD PTR [rsp+0x30],xmm7
   14025fcc4:	48 85 c9             	test   rcx,rcx
   14025fcc7:	75 09                	jne    0x14025fcd2
   14025fcc9:	f3 0f 10 73 20       	movss  xmm6,DWORD PTR [rbx+0x20]
   14025fcce:	33 ff                	xor    edi,edi
   14025fcd0:	eb 24                	jmp    0x14025fcf6
   14025fcd2:	44 89 44 24 28       	mov    DWORD PTR [rsp+0x28],r8d
   14025fcd7:	41 b9 ff ff ff ff    	mov    r9d,0xffffffff
   14025fcdd:	45 8b c1             	mov    r8d,r9d
   14025fce0:	c6 44 24 20 00       	mov    BYTE PTR [rsp+0x20],0x0
   14025fce5:	ba 01 00 00 00       	mov    edx,0x1
   14025fcea:	e8 71 b7 10 00       	call   0x14036b460
   14025fcef:	48 8b 7b 30          	mov    rdi,QWORD PTR [rbx+0x30]
   14025fcf3:	0f 28 f0             	movaps xmm6,xmm0
   14025fcf6:	0f 57 c0             	xorps  xmm0,xmm0
   14025fcf9:	f3 0f 5a c6          	cvtss2sd xmm0,xmm6
   14025fcfd:	f2 0f 59 05 4b e4 42 	mulsd  xmm0,QWORD PTR [rip+0x42e44b]        # 0x14068e150
   14025fd04:	00 
   14025fd05:	f2 0f 5e 05 63 e4 42 	divsd  xmm0,QWORD PTR [rip+0x42e463]        # 0x14068e170
   14025fd0c:	00 
   14025fd0d:	e8 62 10 3c 00       	call   0x140620d74
   14025fd12:	f2 0f 59 05 26 e4 42 	mulsd  xmm0,QWORD PTR [rip+0x42e426]        # 0x14068e140
   14025fd19:	00 
   14025fd1a:	0f 57 ff             	xorps  xmm7,xmm7
   14025fd1d:	f2 0f 5e 05 f3 e3 42 	divsd  xmm0,QWORD PTR [rip+0x42e3f3]        # 0x14068e118
   14025fd24:	00 
   14025fd25:	f2 0f 58 05 0b e4 42 	addsd  xmm0,QWORD PTR [rip+0x42e40b]        # 0x14068e138
   14025fd2c:	00 
   14025fd2d:	f2 0f 5a f8          	cvtsd2ss xmm7,xmm0
   14025fd31:	48 85 ff             	test   rdi,rdi
   14025fd34:	74 1f                	je     0x14025fd55
   14025fd36:	41 b9 ff ff ff ff    	mov    r9d,0xffffffff
   14025fd3c:	48 c7 44 24 20 00 00 	mov    QWORD PTR [rsp+0x20],0x0
   14025fd43:	00 00 
   14025fd45:	45 8b c1             	mov    r8d,r9d
   14025fd48:	48 8b d3             	mov    rdx,rbx
   14025fd4b:	48 8b cf             	mov    rcx,rdi
   14025fd4e:	e8 9d 4a 11 00       	call   0x1403747f0
   14025fd53:	eb 08                	jmp    0x14025fd5d
   14025fd55:	f3 0f 10 05 4b 05 5f 	movss  xmm0,DWORD PTR [rip+0x5f054b]        # 0x1408502a8
   14025fd5c:	00 
   14025fd5d:	48 8b 7c 24 60       	mov    rdi,QWORD PTR [rsp+0x60]
   14025fd62:	48 8d 0c 76          	lea    rcx,[rsi+rsi*2]
   14025fd66:	f3 0f 11 7c cb 24    	movss  DWORD PTR [rbx+rcx*8+0x24],xmm7
   14025fd6c:	0f 28 7c 24 30       	movaps xmm7,XMMWORD PTR [rsp+0x30]
   14025fd71:	f3 0f 11 74 cb 20    	movss  DWORD PTR [rbx+rcx*8+0x20],xmm6
   14025fd77:	0f 28 74 24 40       	movaps xmm6,XMMWORD PTR [rsp+0x40]
   14025fd7c:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14025fd81:	89 44 cb 28          	mov    DWORD PTR [rbx+rcx*8+0x28],eax
   14025fd85:	83 63 44 fd          	and    DWORD PTR [rbx+0x44],0xfffffffd
   14025fd89:	48 8b 5c 24 68       	mov    rbx,QWORD PTR [rsp+0x68]
   14025fd8e:	48 83 c4 50          	add    rsp,0x50
   14025fd92:	5e                   	pop    rsi
   14025fd93:	c3                   	ret
   14025fd94:	cc                   	int3
   14025fd95:	cc                   	int3
   14025fd96:	cc                   	int3
   14025fd97:	cc                   	int3
   14025fd98:	cc                   	int3
   14025fd99:	cc                   	int3
   14025fd9a:	cc                   	int3
   14025fd9b:	cc                   	int3
   14025fd9c:	cc                   	int3
   14025fd9d:	cc                   	int3
   14025fd9e:	cc                   	int3
   14025fd9f:	cc                   	int3
