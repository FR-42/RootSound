
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140366e16 <.text+0x365e16>:
   140366e16:	33 ed                	xor    ebp,ebp
   140366e18:	85 ff                	test   edi,edi
   140366e1a:	0f 8e 6f 01 00 00    	jle    0x140366f8f
   140366e20:	45 33 db             	xor    r11d,r11d
   140366e23:	45 0f b6 ff          	movzx  r15d,r15b
   140366e27:	44 8d 65 01          	lea    r12d,[rbp+0x1]
   140366e2b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140366e30:	41 8b cf             	mov    ecx,r15d
   140366e33:	45 85 ff             	test   r15d,r15d
   140366e36:	74 59                	je     0x140366e91
   140366e38:	41 2b cc             	sub    ecx,r12d
   140366e3b:	74 34                	je     0x140366e71
   140366e3d:	41 3b cc             	cmp    ecx,r12d
   140366e40:	0f 85 3b 01 00 00    	jne    0x140366f81
   140366e46:	41 0f b7 4e 02       	movzx  ecx,WORD PTR [r14+0x2]
   140366e4b:	48 8b 93 a8 02 00 00 	mov    rdx,QWORD PTR [rbx+0x2a8]
   140366e52:	8d 41 ff             	lea    eax,[rcx-0x1]
   140366e55:	41 3b c4             	cmp    eax,r12d
   140366e58:	41 0f 4f c4          	cmovg  eax,r12d
   140366e5c:	0f af cd             	imul   ecx,ebp
   140366e5f:	03 c1                	add    eax,ecx
   140366e61:	48 98                	cdqe
   140366e63:	0f b7 0c 42          	movzx  ecx,WORD PTR [rdx+rax*2]
   140366e67:	66 42 89 0c 5e       	mov    WORD PTR [rsi+r11*2],cx
   140366e6c:	e9 10 01 00 00       	jmp    0x140366f81
   140366e71:	41 0f b7 46 02       	movzx  eax,WORD PTR [r14+0x2]
   140366e76:	0f af c5             	imul   eax,ebp
   140366e79:	48 63 c8             	movsxd rcx,eax
   140366e7c:	48 8b 83 a8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2a8]
   140366e83:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   140366e87:	66 42 89 0c 5e       	mov    WORD PTR [rsi+r11*2],cx
   140366e8c:	e9 f0 00 00 00       	jmp    0x140366f81
   140366e91:	45 0f b7 4e 02       	movzx  r9d,WORD PTR [r14+0x2]
   140366e96:	45 33 c0             	xor    r8d,r8d
   140366e99:	33 d2                	xor    edx,edx
   140366e9b:	45 85 c9             	test   r9d,r9d
   140366e9e:	0f 84 be 00 00 00    	je     0x140366f62
   140366ea4:	41 83 f9 08          	cmp    r9d,0x8
   140366ea8:	0f 82 82 00 00 00    	jb     0x140366f30
   140366eae:	48 8b bb a8 02 00 00 	mov    rdi,QWORD PTR [rbx+0x2a8]
   140366eb5:	45 8b c1             	mov    r8d,r9d
   140366eb8:	44 0f af c5          	imul   r8d,ebp
   140366ebc:	45 8b d1             	mov    r10d,r9d
   140366ebf:	41 83 e2 f8          	and    r10d,0xfffffff8
   140366ec3:	0f 57 d2             	xorps  xmm2,xmm2
   140366ec6:	0f 57 c9             	xorps  xmm1,xmm1
   140366ec9:	41 83 c0 04          	add    r8d,0x4
   140366ecd:	0f 1f 00             	nop    DWORD PTR [rax]
   140366ed0:	41 8d 40 fc          	lea    eax,[r8-0x4]
   140366ed4:	83 c2 08             	add    edx,0x8
   140366ed7:	f3 0f 7e 04 47       	movq   xmm0,QWORD PTR [rdi+rax*2]
   140366edc:	66 0f 61 c0          	punpcklwd xmm0,xmm0
   140366ee0:	66 0f 72 e0 10       	psrad  xmm0,0x10
   140366ee5:	66 0f fe c2          	paddd  xmm0,xmm2
   140366ee9:	66 0f 6f d0          	movdqa xmm2,xmm0
   140366eed:	f3 42 0f 7e 04 47    	movq   xmm0,QWORD PTR [rdi+r8*2]
   140366ef3:	66 0f 61 c0          	punpcklwd xmm0,xmm0
   140366ef7:	45 8d 40 08          	lea    r8d,[r8+0x8]
   140366efb:	66 0f 72 e0 10       	psrad  xmm0,0x10
   140366f00:	66 0f fe c1          	paddd  xmm0,xmm1
   140366f04:	66 0f 6f c8          	movdqa xmm1,xmm0
   140366f08:	41 3b d2             	cmp    edx,r10d
   140366f0b:	72 c3                	jb     0x140366ed0
   140366f0d:	66 0f fe ca          	paddd  xmm1,xmm2
   140366f11:	66 0f 6f c1          	movdqa xmm0,xmm1
   140366f15:	66 0f 73 d8 08       	psrldq xmm0,0x8
   140366f1a:	66 0f fe c8          	paddd  xmm1,xmm0
   140366f1e:	66 0f 6f c1          	movdqa xmm0,xmm1
   140366f22:	66 0f 73 d8 04       	psrldq xmm0,0x4
   140366f27:	66 0f fe c8          	paddd  xmm1,xmm0
   140366f2b:	66 41 0f 7e c8       	movd   r8d,xmm1
   140366f30:	41 3b d1             	cmp    edx,r9d
   140366f33:	73 2d                	jae    0x140366f62
   140366f35:	48 8b bb a8 02 00 00 	mov    rdi,QWORD PTR [rbx+0x2a8]
   140366f3c:	45 8b d1             	mov    r10d,r9d
   140366f3f:	44 0f af d5          	imul   r10d,ebp
   140366f43:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140366f47:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140366f4e:	00 00 
   140366f50:	41 8d 04 12          	lea    eax,[r10+rdx*1]
   140366f54:	ff c2                	inc    edx
   140366f56:	0f bf 04 47          	movsx  eax,WORD PTR [rdi+rax*2]
   140366f5a:	44 03 c0             	add    r8d,eax
   140366f5d:	41 3b d1             	cmp    edx,r9d
   140366f60:	72 ee                	jb     0x140366f50
   140366f62:	41 83 f9 02          	cmp    r9d,0x2
   140366f66:	75 0d                	jne    0x140366f75
   140366f68:	45 85 c0             	test   r8d,r8d
   140366f6b:	78 05                	js     0x140366f72
   140366f6d:	41 ff c0             	inc    r8d
   140366f70:	eb 03                	jmp    0x140366f75
   140366f72:	41 ff c8             	dec    r8d
   140366f75:	41 8b c0             	mov    eax,r8d
   140366f78:	99                   	cdq
   140366f79:	41 f7 f9             	idiv   r9d
   140366f7c:	66 42 89 04 5e       	mov    WORD PTR [rsi+r11*2],ax
   140366f81:	ff c5                	inc    ebp
   140366f83:	49 ff c3             	inc    r11
   140366f86:	4d 3b dd             	cmp    r11,r13
   140366f89:	0f 8c a1 fe ff ff    	jl     0x140366e30
   140366f8f:	4c 8b 7c 24 50       	mov    r15,QWORD PTR [rsp+0x50]
   140366f94:	8b                   	.byte 0x8b
