
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140347a90 <.text+0x346a90>:
   140347a90:	48 8b c4             	mov    rax,rsp
   140347a93:	53                   	push   rbx
   140347a94:	41 55                	push   r13
   140347a96:	41 56                	push   r14
   140347a98:	48 81 ec 90 00 00 00 	sub    rsp,0x90
   140347a9f:	33 db                	xor    ebx,ebx
   140347aa1:	4c 8b ea             	mov    r13,rdx
   140347aa4:	4c 8b f1             	mov    r14,rcx
   140347aa7:	89 9c 24 b8 00 00 00 	mov    DWORD PTR [rsp+0xb8],ebx
   140347aae:	48 8b 8a 40 05 00 00 	mov    rcx,QWORD PTR [rdx+0x540]
   140347ab5:	8b d3                	mov    edx,ebx
   140347ab7:	48 89 8c 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],rcx
   140347abe:	00 
   140347abf:	41 39 9d 48 05 00 00 	cmp    DWORD PTR [r13+0x548],ebx
   140347ac6:	0f 86 15 01 00 00    	jbe    0x140347be1
   140347acc:	48 89 68 e0          	mov    QWORD PTR [rax-0x20],rbp
   140347ad0:	48 89 70 d8          	mov    QWORD PTR [rax-0x28],rsi
   140347ad4:	48 89 78 d0          	mov    QWORD PTR [rax-0x30],rdi
   140347ad8:	4c 89 60 c8          	mov    QWORD PTR [rax-0x38],r12
   140347adc:	4c 89 78 c0          	mov    QWORD PTR [rax-0x40],r15
   140347ae0:	8b c2                	mov    eax,edx
   140347ae2:	4c 8d 04 80          	lea    r8,[rax+rax*4]
   140347ae6:	42 f6 44 c1 0c 01    	test   BYTE PTR [rcx+r8*8+0xc],0x1
   140347aec:	4a 8d 34 c1          	lea    rsi,[rcx+r8*8]
   140347af0:	0f 85 b6 00 00 00    	jne    0x140347bac
   140347af6:	80 7e 24 01          	cmp    BYTE PTR [rsi+0x24],0x1
   140347afa:	0f 85 ac 00 00 00    	jne    0x140347bac
   140347b00:	44 8b e3             	mov    r12d,ebx
   140347b03:	48 8b 2e             	mov    rbp,QWORD PTR [rsi]
   140347b06:	66 3b 5e 08          	cmp    bx,WORD PTR [rsi+0x8]
   140347b0a:	0f 83 9c 00 00 00    	jae    0x140347bac
   140347b10:	48 83 c5 4b          	add    rbp,0x4b
   140347b14:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140347b18:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140347b1f:	00 
   140347b20:	0f bf 7e 0a          	movsx  edi,WORD PTR [rsi+0xa]
   140347b24:	41 8b 45 0c          	mov    eax,DWORD PTR [r13+0xc]
   140347b28:	41 03 fc             	add    edi,r12d
   140347b2b:	41 8b 4e 28          	mov    ecx,DWORD PTR [r14+0x28]
   140347b2f:	2b c1                	sub    eax,ecx
   140347b31:	3b f8                	cmp    edi,eax
   140347b33:	7c 56                	jl     0x140347b8b
   140347b35:	41 03 4d 10          	add    ecx,DWORD PTR [r13+0x10]
   140347b39:	3b f9                	cmp    edi,ecx
   140347b3b:	7d 5e                	jge    0x140347b9b
   140347b3d:	32 db                	xor    bl,bl
   140347b3f:	38 5d 00             	cmp    BYTE PTR [rbp+0x0],bl
   140347b42:	76 47                	jbe    0x140347b8b
   140347b44:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140347b48:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140347b4f:	00 
   140347b50:	c6 44 24 50 00       	mov    BYTE PTR [rsp+0x50],0x0
   140347b55:	49 8d 55 18          	lea    rdx,[r13+0x18]
   140347b59:	c6 44 24 48 01       	mov    BYTE PTR [rsp+0x48],0x1
   140347b5e:	44 8b cf             	mov    r9d,edi
   140347b61:	c6 44 24 40 00       	mov    BYTE PTR [rsp+0x40],0x0
   140347b66:	4c 8b c6             	mov    r8,rsi
   140347b69:	c6 44 24 38 01       	mov    BYTE PTR [rsp+0x38],0x1
   140347b6e:	49 8b ce             	mov    rcx,r14
   140347b71:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0
   140347b76:	c6 44 24 28 01       	mov    BYTE PTR [rsp+0x28],0x1
   140347b7b:	88 5c 24 20          	mov    BYTE PTR [rsp+0x20],bl
   140347b7f:	e8 7c 49 fd ff       	call   0x14031c500
   140347b84:	fe c3                	inc    bl
   140347b86:	3a 5d 00             	cmp    bl,BYTE PTR [rbp+0x0]
   140347b89:	72 c5                	jb     0x140347b50
   140347b8b:	0f b7 46 08          	movzx  eax,WORD PTR [rsi+0x8]
   140347b8f:	41 ff c4             	inc    r12d
   140347b92:	48 83 c5 5c          	add    rbp,0x5c
   140347b96:	44 3b e0             	cmp    r12d,eax
   140347b99:	7c 85                	jl     0x140347b20
   140347b9b:	8b 94 24 b8 00 00 00 	mov    edx,DWORD PTR [rsp+0xb8]
   140347ba2:	33 db                	xor    ebx,ebx
   140347ba4:	48 8b 8c 24 c8 00 00 	mov    rcx,QWORD PTR [rsp+0xc8]
   140347bab:	00 
   140347bac:	ff c2                	inc    edx
   140347bae:	89 94 24 b8 00 00 00 	mov    DWORD PTR [rsp+0xb8],edx
   140347bb5:	41 3b 95 48 05 00 00 	cmp    edx,DWORD PTR [r13+0x548]
   140347bbc:	0f 82 1e ff ff ff    	jb     0x140347ae0
   140347bc2:	4c 8b 7c 24 68       	mov    r15,QWORD PTR [rsp+0x68]
   140347bc7:	4c 8b 64 24 70       	mov    r12,QWORD PTR [rsp+0x70]
   140347bcc:	48 8b 7c 24 78       	mov    rdi,QWORD PTR [rsp+0x78]
   140347bd1:	48 8b b4 24 80 00 00 	mov    rsi,QWORD PTR [rsp+0x80]
   140347bd8:	00 
   140347bd9:	48 8b ac 24 88 00 00 	mov    rbp,QWORD PTR [rsp+0x88]
   140347be0:	00 
   140347be1:	4c 8d 8c 24 b0 00 00 	lea    r9,[rsp+0xb0]
   140347be8:	00 
   140347be9:	48 89 9c 24 c0 00 00 	mov    QWORD PTR [rsp+0xc0],rbx
   140347bf0:	00 
   140347bf1:	4c 8d 84 24 c0 00 00 	lea    r8,[rsp+0xc0]
   140347bf8:	00 
   140347bf9:	66 89 9c 24 b0 00 00 	mov    WORD PTR [rsp+0xb0],bx
   140347c00:	00 
   140347c01:	49 8b d5             	mov    rdx,r13
   140347c04:	49 8b ce             	mov    rcx,r14
   140347c07:	e8 44 6a fe ff       	call   0x14032e650
   140347c0c:	45 8b 45 0c          	mov    r8d,DWORD PTR [r13+0xc]
   140347c10:	49 8b d5             	mov    rdx,r13
   140347c13:	44 3b c0             	cmp    r8d,eax
   140347c16:	48 89 9c 24 c8 00 00 	mov    QWORD PTR [rsp+0xc8],rbx
   140347c1d:	00 
   140347c1e:	49 8b ce             	mov    rcx,r14
   140347c21:	66 89 9c 24 b8 00 00 	mov    WORD PTR [rsp+0xb8],bx
   140347c28:	00 
   140347c29:	44 0f 4c c0          	cmovl  r8d,eax
   140347c2d:	48 8d 84 24 b8 00 00 	lea    rax,[rsp+0xb8]
   140347c34:	00 
   140347c35:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   140347c3a:	45 33 c9             	xor    r9d,r9d
   140347c3d:	48 8d 84 24 c8 00 00 	lea    rax,[rsp+0xc8]
   140347c44:	00 
   140347c45:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   140347c4a:	0f b7 84 24 b0 00 00 	movzx  eax,WORD PTR [rsp+0xb0]
   140347c51:	00 
   140347c52:	66 89 44 24 28       	mov    WORD PTR [rsp+0x28],ax
   140347c57:	48 8b 84 24 c0 00 00 	mov    rax,QWORD PTR [rsp+0xc0]
   140347c5e:	00 
   140347c5f:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140347c64:	e8 07 f5 ff ff       	call   0x140347170
   140347c69:	0f b7 84 24 b8 00 00 	movzx  eax,WORD PTR [rsp+0xb8]
   140347c70:	00 
   140347c71:	49 8b d5             	mov    rdx,r13
   140347c74:	4c 8b 8c 24 c8 00 00 	mov    r9,QWORD PTR [rsp+0xc8]
   140347c7b:	00 
   140347c7c:	49 8b ce             	mov    rcx,r14
   140347c7f:	45 8b 45 10          	mov    r8d,DWORD PTR [r13+0x10]
   140347c83:	66 89 44 24 20       	mov    WORD PTR [rsp+0x20],ax
   140347c88:	e8 23 68 fe ff       	call   0x14032e4b0
   140347c8d:	41 8b 55 0c          	mov    edx,DWORD PTR [r13+0xc]
   140347c91:	41 8b 8e bc 00 00 00 	mov    ecx,DWORD PTR [r14+0xbc]
   140347c98:	44 8b 05 45 23 64 00 	mov    r8d,DWORD PTR [rip+0x642345]        # 0x140989fe4
   140347c9f:	41 2b d0             	sub    edx,r8d
   140347ca2:	45 8b 4d 10          	mov    r9d,DWORD PTR [r13+0x10]
   140347ca6:	41 03 c9             	add    ecx,r9d
   140347ca9:	3b d1                	cmp    edx,ecx
   140347cab:	7d 42                	jge    0x140347cef
   140347cad:	0f 1f 00             	nop    DWORD PTR [rax]
   140347cb0:	41 8b 45 0c          	mov    eax,DWORD PTR [r13+0xc]
   140347cb4:	3b d0                	cmp    edx,eax
   140347cb6:	7c 08                	jl     0x140347cc0
   140347cb8:	41 8b c9             	mov    ecx,r9d
   140347cbb:	41 3b d1             	cmp    edx,r9d
   140347cbe:	7c 1f                	jl     0x140347cdf
   140347cc0:	44 2b c0             	sub    r8d,eax
   140347cc3:	49 8b 85 a0 05 00 00 	mov    rax,QWORD PTR [r13+0x5a0]
   140347cca:	44 03 c2             	add    r8d,edx
   140347ccd:	49 63 c8             	movsxd rcx,r8d
   140347cd0:	66 89 1c 48          	mov    WORD PTR [rax+rcx*2],bx
   140347cd4:	41 8b 4d 10          	mov    ecx,DWORD PTR [r13+0x10]
   140347cd8:	44 8b 05 05 23 64 00 	mov    r8d,DWORD PTR [rip+0x642305]        # 0x140989fe4
   140347cdf:	44 8b c9             	mov    r9d,ecx
   140347ce2:	ff c2                	inc    edx
   140347ce4:	41 03 8e bc 00 00 00 	add    ecx,DWORD PTR [r14+0xbc]
   140347ceb:	3b d1                	cmp    edx,ecx
   140347ced:	7c c1                	jl     0x140347cb0
   140347cef:	49 8b d5             	mov    rdx,r13
   140347cf2:	49 8b ce             	mov    rcx,r14
   140347cf5:	e8 66 5c fd ff       	call   0x14031d960
   140347cfa:	41 b0 01             	mov    r8b,0x1
   140347cfd:	49 8b d5             	mov    rdx,r13
   140347d00:	49 8b ce             	mov    rcx,r14
   140347d03:	e8 88 50 fd ff       	call   0x14031cd90
   140347d08:	45 8b 45 10          	mov    r8d,DWORD PTR [r13+0x10]
   140347d0c:	49 8b cd             	mov    rcx,r13
   140347d0f:	41 8b 55 0c          	mov    edx,DWORD PTR [r13+0xc]
   140347d13:	e8 68 52 fd ff       	call   0x14031cf80
   140347d18:	48 81 c4 90 00 00 00 	add    rsp,0x90
   140347d1f:	41 5e                	pop    r14
   140347d21:	41 5d                	pop    r13
   140347d23:	5b                   	pop    rbx
   140347d24:	c3                   	ret
   140347d25:	cc                   	int3
   140347d26:	cc                   	int3
   140347d27:	cc                   	int3
   140347d28:	cc                   	int3
   140347d29:	cc                   	int3
   140347d2a:	cc                   	int3
   140347d2b:	cc                   	int3
   140347d2c:	cc                   	int3
   140347d2d:	cc                   	int3
   140347d2e:	cc                   	int3
   140347d2f:	cc                   	int3
   140347d30:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140347d35:	8b 05 6d 24 64 00    	mov    eax,DWORD PTR [rip+0x64246d]        # 0x14098a1a8
   140347d3b:	44 8b da             	mov    r11d,edx
   140347d3e:	45 2b d8             	sub    r11d,r8d
   140347d41:	0f 57 c0             	xorps  xmm0,xmm0
   140347d44:	44 0f af d8          	imul   r11d,eax
   140347d48:	48 8b d9             	mov    rbx,rcx
   140347d4b:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140347d50:	99                   	cdq
   140347d51:	2b c2                	sub    eax,edx
   140347d53:	d1 f8                	sar    eax,1
   140347d55:	44 03 d8             	add    r11d,eax
   140347d58:	f2 0f 58 c0          	addsd  xmm0,xmm0
   140347d5c:	f2 0f 59 05 ec 05 36 	mulsd  xmm0,QWORD PTR [rip+0x3605ec]        # 0x1406a8350
   140347d63:	00 
   140347d64:	f2 44 0f 2c d0       	cvttsd2si r10d,xmm0
   140347d69:	41 8b c2             	mov    eax,r10d
   140347d6c:	99                   	cdq
   140347d6d:	2b c2                	sub    eax,edx
   140347d6f:	d1 f8                	sar    eax,1
   140347d71:	44 2b d8             	sub    r11d,eax
   140347d74:	33 c0                	xor    eax,eax
   140347d76:	45 85 db             	test   r11d,r11d
   140347d79:	44 0f 4e d8          	cmovle r11d,eax
   140347d7d:	45 89 19             	mov    DWORD PTR [r9],r11d
   140347d80:	8b 43 24             	mov    eax,DWORD PTR [rbx+0x24]
   140347d83:	8b 49 28             	mov    ecx,DWORD PTR [rcx+0x28]
   140347d86:	48 8b 5c 24 08       	mov    rbx,QWORD PTR [rsp+0x8]
   140347d8b:	47 8d 04 13          	lea    r8d,[r11+r10*1]
   140347d8f:	8d 14 48             	lea    edx,[rax+rcx*2]
   140347d92:	48 8b 44 24 28       	mov    rax,QWORD PTR [rsp+0x28]
   140347d97:	0f af 15 0a 24 64 00 	imul   edx,DWORD PTR [rip+0x64240a]        # 0x14098a1a8
   140347d9e:	44 3b c2             	cmp    r8d,edx
   140347da1:	44 0f 4d c2          	cmovge r8d,edx
   140347da5:	44 89 00             	mov    DWORD PTR [rax],r8d
   140347da8:	c3                   	ret
   140347da9:	cc                   	int3
   140347daa:	cc                   	int3
   140347dab:	cc                   	int3
   140347dac:	cc                   	int3
   140347dad:	cc                   	int3
   140347dae:	cc                   	int3
   140347daf:	cc                   	int3
