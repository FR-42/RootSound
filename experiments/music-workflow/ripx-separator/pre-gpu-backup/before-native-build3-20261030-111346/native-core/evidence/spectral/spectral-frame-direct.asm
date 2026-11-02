
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140326880 <.text+0x325880>:
   140326880:	40 53                	rex push rbx
   140326882:	55                   	push   rbp
   140326883:	56                   	push   rsi
   140326884:	41 55                	push   r13
   140326886:	48 81 ec 48 01 00 00 	sub    rsp,0x148
   14032688d:	48 8b 05 d4 b8 64 00 	mov    rax,QWORD PTR [rip+0x64b8d4]        # 0x140972168
   140326894:	48 33 c4             	xor    rax,rsp
   140326897:	48 89 84 24 98 00 00 	mov    QWORD PTR [rsp+0x98],rax
   14032689e:	00 
   14032689f:	48 8b 84 24 90 01 00 	mov    rax,QWORD PTR [rsp+0x190]
   1403268a6:	00 
   1403268a7:	48 8b e9             	mov    rbp,rcx
   1403268aa:	33 c9                	xor    ecx,ecx
   1403268ac:	48 89 54 24 58       	mov    QWORD PTR [rsp+0x58],rdx
   1403268b1:	48 89 44 24 78       	mov    QWORD PTR [rsp+0x78],rax
   1403268b6:	4c 8b ea             	mov    r13,rdx
   1403268b9:	48 85 d2             	test   rdx,rdx
   1403268bc:	74 44                	je     0x140326902
   1403268be:	41 0f b6 c8          	movzx  ecx,r8b
   1403268c2:	48 8d 9a 90 04 00 00 	lea    rbx,[rdx+0x490]
   1403268c9:	48 6b c1 38          	imul   rax,rcx,0x38
   1403268cd:	48 03 d8             	add    rbx,rax
   1403268d0:	48 8d 04 cd 03 00 00 	lea    rax,[rcx*8+0x3]
   1403268d7:	00 
   1403268d8:	48 03 c1             	add    rax,rcx
   1403268db:	48 8d 34 c5 00 00 00 	lea    rsi,[rax*8+0x0]
   1403268e2:	00 
   1403268e3:	48 8d 41 5c          	lea    rax,[rcx+0x5c]
   1403268e7:	48 03 f2             	add    rsi,rdx
   1403268ea:	48 8d 04 41          	lea    rax,[rcx+rax*2]
   1403268ee:	48 8d 04 c5 00 00 00 	lea    rax,[rax*8+0x0]
   1403268f5:	00 
   1403268f6:	48 03 c2             	add    rax,rdx
   1403268f9:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax
   1403268fe:	33 c9                	xor    ecx,ecx
   140326900:	eb 0b                	jmp    0x14032690d
   140326902:	48 8b d9             	mov    rbx,rcx
   140326905:	48 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],rcx
   14032690a:	48 8b f1             	mov    rsi,rcx
   14032690d:	48 89 bc 24 40 01 00 	mov    QWORD PTR [rsp+0x140],rdi
   140326914:	00 
   140326915:	4c 89 bc 24 28 01 00 	mov    QWORD PTR [rsp+0x128],r15
   14032691c:	00 
   14032691d:	4d 85 ed             	test   r13,r13
   140326920:	0f 84 91 00 00 00    	je     0x1403269b7
   140326926:	44 8b 45 24          	mov    r8d,DWORD PTR [rbp+0x24]
   14032692a:	41 8b c1             	mov    eax,r9d
   14032692d:	44 8b 0d 74 38 66 00 	mov    r9d,DWORD PTR [rip+0x663874]        # 0x14098a1a8
   140326934:	99                   	cdq
   140326935:	41 f7 f9             	idiv   r9d
   140326938:	8b 55 28             	mov    edx,DWORD PTR [rbp+0x28]
   14032693b:	44 8b f8             	mov    r15d,eax
   14032693e:	44 2b fa             	sub    r15d,edx
   140326941:	45 85 ff             	test   r15d,r15d
   140326944:	44 0f 4e f9          	cmovle r15d,ecx
   140326948:	44 03 c2             	add    r8d,edx
   14032694b:	41 8d 48 ff          	lea    ecx,[r8-0x1]
   14032694f:	44 3b f9             	cmp    r15d,ecx
   140326952:	44 0f 4d f9          	cmovge r15d,ecx
   140326956:	41 2b 45 0c          	sub    eax,DWORD PTR [r13+0xc]
   14032695a:	8b 0d f4 36 66 00    	mov    ecx,DWORD PTR [rip+0x6636f4]        # 0x14098a054
   140326960:	0f af c1             	imul   eax,ecx
   140326963:	44 89 7c 24 20       	mov    DWORD PTR [rsp+0x20],r15d
   140326968:	8b f8                	mov    edi,eax
   14032696a:	48 c1 e7 04          	shl    rdi,0x4
   14032696e:	48 03 3b             	add    rdi,QWORD PTR [rbx]
   140326971:	48 89 7c 24 70       	mov    QWORD PTR [rsp+0x70],rdi
   140326976:	45 85 ff             	test   r15d,r15d
   140326979:	0f 88 f0 08 00 00    	js     0x14032726f
   14032697f:	45 3b f8             	cmp    r15d,r8d
   140326982:	0f 8d e7 08 00 00    	jge    0x14032726f
   140326988:	42 8d 04 3a          	lea    eax,[rdx+r15*1]
   14032698c:	44 8b c1             	mov    r8d,ecx
   14032698f:	41 0f af c1          	imul   eax,r9d
   140326993:	33 d2                	xor    edx,edx
   140326995:	49 c1 e0 04          	shl    r8,0x4
   140326999:	48 8b cf             	mov    rcx,rdi
   14032699c:	89 44 24 40          	mov    DWORD PTR [rsp+0x40],eax
   1403269a0:	e8 45 a3 2f 00       	call   0x140620cea
   1403269a5:	48 8b 0e             	mov    rcx,QWORD PTR [rsi]
   1403269a8:	48 8b 43 10          	mov    rax,QWORD PTR [rbx+0x10]
   1403269ac:	48 89 4c 24 48       	mov    QWORD PTR [rsp+0x48],rcx
   1403269b1:	48 8b 4b 28          	mov    rcx,QWORD PTR [rbx+0x28]
   1403269b5:	eb 36                	jmp    0x1403269ed
   1403269b7:	44 8b 7c 24 20       	mov    r15d,DWORD PTR [rsp+0x20]
   1403269bc:	48 8b 7c 24 60       	mov    rdi,QWORD PTR [rsp+0x60]
   1403269c1:	48 8b 8c 24 88 00 00 	mov    rcx,QWORD PTR [rsp+0x88]
   1403269c8:	00 
   1403269c9:	44 89 7c 24 20       	mov    DWORD PTR [rsp+0x20],r15d
   1403269ce:	8b 44 24 20          	mov    eax,DWORD PTR [rsp+0x20]
   1403269d2:	89 44 24 40          	mov    DWORD PTR [rsp+0x40],eax
   1403269d6:	48 8b 44 24 60       	mov    rax,QWORD PTR [rsp+0x60]
   1403269db:	48 89 44 24 48       	mov    QWORD PTR [rsp+0x48],rax
   1403269e0:	48 8b 84 24 88 00 00 	mov    rax,QWORD PTR [rsp+0x88]
   1403269e7:	00 
   1403269e8:	48 89 7c 24 70       	mov    QWORD PTR [rsp+0x70],rdi
   1403269ed:	80 3d 7c 2c 61 00 00 	cmp    BYTE PTR [rip+0x612c7c],0x0        # 0x140939670
   1403269f4:	4c 89 a4 24 38 01 00 	mov    QWORD PTR [rsp+0x138],r12
   1403269fb:	00 
   1403269fc:	4c 89 b4 24 30 01 00 	mov    QWORD PTR [rsp+0x130],r14
   140326a03:	00 
   140326a04:	0f 29 b4 24 10 01 00 	movaps XMMWORD PTR [rsp+0x110],xmm6
   140326a0b:	00 
   140326a0c:	0f 29 bc 24 00 01 00 	movaps XMMWORD PTR [rsp+0x100],xmm7
   140326a13:	00 
   140326a14:	44 0f 29 84 24 f0 00 	movaps XMMWORD PTR [rsp+0xf0],xmm8
   140326a1b:	00 00 
   140326a1d:	44 0f 29 8c 24 e0 00 	movaps XMMWORD PTR [rsp+0xe0],xmm9
   140326a24:	00 00 
   140326a26:	44 0f 29 94 24 d0 00 	movaps XMMWORD PTR [rsp+0xd0],xmm10
   140326a2d:	00 00 
   140326a2f:	44 0f 29 9c 24 c0 00 	movaps XMMWORD PTR [rsp+0xc0],xmm11
   140326a36:	00 00 
   140326a38:	44 0f 29 a4 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm12
   140326a3f:	00 00 
   140326a41:	44 0f 29 ac 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm13
   140326a48:	00 00 
   140326a4a:	48 89 4c 24 28       	mov    QWORD PTR [rsp+0x28],rcx
   140326a4f:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   140326a54:	74 15                	je     0x140326a6b
   140326a56:	33 c0                	xor    eax,eax
   140326a58:	48 89 05 31 36 66 00 	mov    QWORD PTR [rip+0x663631],rax        # 0x14098a090
   140326a5f:	89 05 33 36 66 00    	mov    DWORD PTR [rip+0x663633],eax        # 0x14098a098
   140326a65:	88 05 05 2c 61 00    	mov    BYTE PTR [rip+0x612c05],al        # 0x140939670
   140326a6b:	f2 44 0f 10 25 44 0f 	movsd  xmm12,QWORD PTR [rip+0x380f44]        # 0x1406a79b8
   140326a72:	38 00 
   140326a74:	48 8d 0d 85 95 cd ff 	lea    rcx,[rip+0xffffffffffcd9585]        # 0x140000000
   140326a7b:	f2 44 0f 10 2d 7c 97 	movsd  xmm13,QWORD PTR [rip+0x52977c]        # 0x140850200
   140326a82:	52 00 
   140326a84:	be 01 00 00 00       	mov    esi,0x1
   140326a89:	f3 44 0f 10 15 4a 95 	movss  xmm10,DWORD PTR [rip+0x52954a]        # 0x14084ffdc
   140326a90:	52 00 
   140326a92:	45 0f 57 c0          	xorps  xmm8,xmm8
   140326a96:	f3 44 0f 10 1d 59 10 	movss  xmm11,DWORD PTR [rip+0x381059]        # 0x1406a7af8
   140326a9d:	38 00 
   140326a9f:	f3 44 0f 10 0d d8 21 	movss  xmm9,DWORD PTR [rip+0x3721d8]        # 0x140698c80
   140326aa6:	37 00 
   140326aa8:	44 8b 44 24 20       	mov    r8d,DWORD PTR [rsp+0x20]
   140326aad:	44 8b 64 24 20       	mov    r12d,DWORD PTR [rsp+0x20]
   140326ab2:	44 8b 74 24 20       	mov    r14d,DWORD PTR [rsp+0x20]
   140326ab7:	44 8b 0d 96 35 66 00 	mov    r9d,DWORD PTR [rip+0x663596]        # 0x14098a054
   140326abe:	89 74 24 30          	mov    DWORD PTR [rsp+0x30],esi
   140326ac2:	8b c6                	mov    eax,esi
   140326ac4:	85 f6                	test   esi,esi
   140326ac6:	74 3b                	je     0x140326b03
   140326ac8:	83 e8 01             	sub    eax,0x1
   140326acb:	74 1e                	je     0x140326aeb
   140326acd:	83 f8 01             	cmp    eax,0x1
   140326ad0:	75 39                	jne    0x140326b0b
   140326ad2:	47 8d 34 09          	lea    r14d,[r9+r9*1]
   140326ad6:	45 8b c1             	mov    r8d,r9d
   140326ad9:	47 8d 1c 36          	lea    r11d,[r14+r14*1]
   140326add:	41 c1 e8 02          	shr    r8d,0x2
   140326ae1:	45 8b e6             	mov    r12d,r14d
   140326ae4:	44 89 5c 24 24       	mov    DWORD PTR [rsp+0x24],r11d
   140326ae9:	eb 25                	jmp    0x140326b10
   140326aeb:	45 8b c1             	mov    r8d,r9d
   140326aee:	47 8d 1c 09          	lea    r11d,[r9+r9*1]
   140326af2:	41 c1 e8 02          	shr    r8d,0x2
   140326af6:	45 8b f1             	mov    r14d,r9d
   140326af9:	44 89 5c 24 24       	mov    DWORD PTR [rsp+0x24],r11d
   140326afe:	45 8b e1             	mov    r12d,r9d
   140326b01:	eb 0d                	jmp    0x140326b10
   140326b03:	45 8b f1             	mov    r14d,r9d
   140326b06:	41 d1 ee             	shr    r14d,1
   140326b09:	eb cb                	jmp    0x140326ad6
   140326b0b:	44 8b 5c 24 24       	mov    r11d,DWORD PTR [rsp+0x24]
   140326b10:	8b 05 92 36 66 00    	mov    eax,DWORD PTR [rip+0x663692]        # 0x14098a1a8
   140326b16:	0f 57 ff             	xorps  xmm7,xmm7
   140326b19:	41 3b c0             	cmp    eax,r8d
   140326b1c:	0f 57 c0             	xorps  xmm0,xmm0
   140326b1f:	41 0f 42 c0          	cmovb  eax,r8d
   140326b23:	89 44 24 44          	mov    DWORD PTR [rsp+0x44],eax
   140326b27:	44 8b c0             	mov    r8d,eax
   140326b2a:	8b 05 24 36 66 00    	mov    eax,DWORD PTR [rip+0x663624]        # 0x14098a154
   140326b30:	f3 48 0f 2a f8       	cvtsi2ss xmm7,rax
   140326b35:	41 8b c3             	mov    eax,r11d
   140326b38:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140326b3d:	f3 0f 5e f8          	divss  xmm7,xmm0
   140326b41:	4d 85 ed             	test   r13,r13
   140326b44:	75 60                	jne    0x140326ba6
   140326b46:	8b de                	mov    ebx,esi
   140326b48:	44 3b 9c 99 90 a0 98 	cmp    r11d,DWORD PTR [rcx+rbx*4+0x98a090]
   140326b4f:	00 
   140326b50:	74 54                	je     0x140326ba6
   140326b52:	48 8b 8c d9 78 a0 98 	mov    rcx,QWORD PTR [rcx+rbx*8+0x98a078]
   140326b59:	00 
   140326b5a:	48 85 c9             	test   rcx,rcx
   140326b5d:	74 05                	je     0x140326b64
   140326b5f:	e8 fc e1 2e 00       	call   0x140614d60
   140326b64:	41 8b cc             	mov    ecx,r12d
   140326b67:	e8 a4 e4 2e 00       	call   0x140615010
   140326b6c:	48 8d 0d 8d 94 cd ff 	lea    rcx,[rip+0xffffffffffcd948d]        # 0x140000000
   140326b73:	41 8b d4             	mov    edx,r12d
   140326b76:	48 89 84 d9 78 a0 98 	mov    QWORD PTR [rcx+rbx*8+0x98a078],rax
   140326b7d:	00 
   140326b7e:	48 8b c8             	mov    rcx,rax
   140326b81:	e8 1a da 2e 00       	call   0x1406145a0
   140326b86:	44 8b 5c 24 24       	mov    r11d,DWORD PTR [rsp+0x24]
   140326b8b:	48 8d 05 6e 94 cd ff 	lea    rax,[rip+0xffffffffffcd946e]        # 0x140000000
   140326b92:	44 8b 0d bb 34 66 00 	mov    r9d,DWORD PTR [rip+0x6634bb]        # 0x14098a054
   140326b99:	44 8b 44 24 44       	mov    r8d,DWORD PTR [rsp+0x44]
   140326b9e:	44 89 9c 98 90 a0 98 	mov    DWORD PTR [rax+rbx*4+0x98a090],r11d
   140326ba5:	00 
   140326ba6:	41 8b c1             	mov    eax,r9d
   140326ba9:	0f 57 c9             	xorps  xmm1,xmm1
   140326bac:	44 8b d6             	mov    r10d,esi
   140326baf:	0f 57 c0             	xorps  xmm0,xmm0
   140326bb2:	4c 89 54 24 60       	mov    QWORD PTR [rsp+0x60],r10
   140326bb7:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   140326bbc:	41 8b c6             	mov    eax,r14d
   140326bbf:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140326bc4:	f3 0f 5e c8          	divss  xmm1,xmm0
   140326bc8:	f3 0f 58 c9          	addss  xmm1,xmm1
   140326bcc:	f3 42 0f 11 8c 94 80 	movss  DWORD PTR [rsp+r10*4+0x80],xmm1
   140326bd3:	00 00 00 
   140326bd6:	4d 85 ed             	test   r13,r13
   140326bd9:	0f 84 1a 06 00 00    	je     0x1403271f9
   140326bdf:	8b 05 c3 35 66 00    	mov    eax,DWORD PTR [rip+0x6635c3]        # 0x14098a1a8
   140326be5:	41 8b c8             	mov    ecx,r8d
   140326be8:	99                   	cdq
   140326be9:	d1 e9                	shr    ecx,1
   140326beb:	2b c2                	sub    eax,edx
   140326bed:	d1 f8                	sar    eax,1
   140326bef:	8b d8                	mov    ebx,eax
   140326bf1:	8b 44 24 40          	mov    eax,DWORD PTR [rsp+0x40]
   140326bf5:	2b d9                	sub    ebx,ecx
   140326bf7:	99                   	cdq
   140326bf8:	41 f7 f8             	idiv   r8d
   140326bfb:	8b 45 28             	mov    eax,DWORD PTR [rbp+0x28]
   140326bfe:	41 8b cc             	mov    ecx,r12d
   140326c01:	03 45 24             	add    eax,DWORD PTR [rbp+0x24]
   140326c04:	2b da                	sub    ebx,edx
   140326c06:	d1 e9                	shr    ecx,1
   140326c08:	33 d2                	xor    edx,edx
   140326c0a:	2b d9                	sub    ebx,ecx
   140326c0c:	8b 0d 3e 34 66 00    	mov    ecx,DWORD PTR [rip+0x66343e]        # 0x14098a050
   140326c12:	f7 f1                	div    ecx
   140326c14:	41 03 d8             	add    ebx,r8d
   140326c17:	03 5c 24 40          	add    ebx,DWORD PTR [rsp+0x40]
   140326c1b:	44 8b e8             	mov    r13d,eax
   140326c1e:	41 8b c7             	mov    eax,r15d
   140326c21:	45 85 ff             	test   r15d,r15d
   140326c24:	79 04                	jns    0x140326c2a
   140326c26:	2b c1                	sub    eax,ecx
   140326c28:	ff c0                	inc    eax
   140326c2a:	99                   	cdq
   140326c2b:	f7 f9                	idiv   ecx
   140326c2d:	8b 0d d9 33 66 00    	mov    ecx,DWORD PTR [rip+0x6633d9]        # 0x14098a00c
   140326c33:	44 8d 78 01          	lea    r15d,[rax+0x1]
   140326c37:	8b c1                	mov    eax,ecx
   140326c39:	f7 d8                	neg    eax
   140326c3b:	44 3b f8             	cmp    r15d,eax
   140326c3e:	7c 47                	jl     0x140326c87
   140326c40:	45 3b fd             	cmp    r15d,r13d
   140326c43:	7d 42                	jge    0x140326c87
   140326c45:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   140326c4a:	4a 8b 14 d0          	mov    rdx,QWORD PTR [rax+r10*8]
   140326c4e:	41 8d 04 0f          	lea    eax,[r15+rcx*1]
   140326c52:	48 63 c8             	movsxd rcx,eax
   140326c55:	48 03 c9             	add    rcx,rcx
   140326c58:	83 7c ca 08 03       	cmp    DWORD PTR [rdx+rcx*8+0x8],0x3
   140326c5d:	75 20                	jne    0x140326c7f
   140326c5f:	48 8b 14 ca          	mov    rdx,QWORD PTR [rdx+rcx*8]
   140326c63:	4c 8b 7c 24 28       	mov    r15,QWORD PTR [rsp+0x28]
   140326c68:	45 8b c6             	mov    r8d,r14d
   140326c6b:	49 8b cf             	mov    rcx,r15
   140326c6e:	49 c1 e0 04          	shl    r8,0x4
   140326c72:	e8 6d a0 2f 00       	call   0x140620ce4
   140326c77:	44 8b ee             	mov    r13d,esi
   140326c7a:	e9 cf 03 00 00       	jmp    0x14032704e
   140326c7f:	c7 44 ca 08 01 00 00 	mov    DWORD PTR [rdx+rcx*8+0x8],0x1
   140326c86:	00 
   140326c87:	48 8b 4c 24 38       	mov    rcx,QWORD PTR [rsp+0x38]
   140326c8c:	33 d2                	xor    edx,edx
   140326c8e:	45 8b c3             	mov    r8d,r11d
   140326c91:	49 c1 e0 03          	shl    r8,0x3
   140326c95:	e8 50 a0 2f 00       	call   0x140620cea
   140326c9a:	33 c0                	xor    eax,eax
   140326c9c:	8b f0                	mov    esi,eax
   140326c9e:	44 8b c0             	mov    r8d,eax
   140326ca1:	41 83 fc 04          	cmp    r12d,0x4
   140326ca5:	0f 8c ba 00 00 00    	jl     0x140326d65
   140326cab:	48 8b 44 24 48       	mov    rax,QWORD PTR [rsp+0x48]
   140326cb0:	8d 4b 02             	lea    ecx,[rbx+0x2]
   140326cb3:	48 8b 54 24 38       	mov    rdx,QWORD PTR [rsp+0x38]
   140326cb8:	48 8b 7c 24 48       	mov    rdi,QWORD PTR [rsp+0x48]
   140326cbd:	48 83 c2 10          	add    rdx,0x10
   140326cc1:	4c 63 d3             	movsxd r10,ebx
   140326cc4:	4e 8d 0c 90          	lea    r9,[rax+r10*4]
   140326cc8:	41 8d 44 24 fc       	lea    eax,[r12-0x4]
   140326ccd:	c1 e8 02             	shr    eax,0x2
   140326cd0:	ff c0                	inc    eax
   140326cd2:	44 8b d8             	mov    r11d,eax
   140326cd5:	8d 34 85 00 00 00 00 	lea    esi,[rax*4+0x0]
   140326cdc:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140326ce0:	8d 41 fe             	lea    eax,[rcx-0x2]
   140326ce3:	85 c0                	test   eax,eax
   140326ce5:	78 12                	js     0x140326cf9
   140326ce7:	3b 45 20             	cmp    eax,DWORD PTR [rbp+0x20]
   140326cea:	7d 0d                	jge    0x140326cf9
   140326cec:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   140326cf1:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140326cf4:	f2 0f 11 42 f0       	movsd  QWORD PTR [rdx-0x10],xmm0
   140326cf9:	8d 41 ff             	lea    eax,[rcx-0x1]
   140326cfc:	85 c0                	test   eax,eax
   140326cfe:	78 13                	js     0x140326d13
   140326d00:	3b 45 20             	cmp    eax,DWORD PTR [rbp+0x20]
   140326d03:	7d 0e                	jge    0x140326d13
   140326d05:	f3 41 0f 10 41 04    	movss  xmm0,DWORD PTR [r9+0x4]
   140326d0b:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140326d0e:	f2 0f 11 42 f8       	movsd  QWORD PTR [rdx-0x8],xmm0
   140326d13:	85 c9                	test   ecx,ecx
   140326d15:	78 16                	js     0x140326d2d
   140326d17:	3b 4d 20             	cmp    ecx,DWORD PTR [rbp+0x20]
   140326d1a:	7d 11                	jge    0x140326d2d
   140326d1c:	4b 8d 04 02          	lea    rax,[r10+r8*1]
   140326d20:	f3 0f 10 44 87 08    	movss  xmm0,DWORD PTR [rdi+rax*4+0x8]
   140326d26:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140326d29:	f2 0f 11 02          	movsd  QWORD PTR [rdx],xmm0
   140326d2d:	8d 41 01             	lea    eax,[rcx+0x1]
   140326d30:	85 c0                	test   eax,eax
   140326d32:	78 17                	js     0x140326d4b
   140326d34:	3b 45 20             	cmp    eax,DWORD PTR [rbp+0x20]
   140326d37:	7d 12                	jge    0x140326d4b
   140326d39:	4b 8d 04 02          	lea    rax,[r10+r8*1]
   140326d3d:	f3 0f 10 44 87 0c    	movss  xmm0,DWORD PTR [rdi+rax*4+0xc]
   140326d43:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140326d46:	f2 0f 11 42 08       	movsd  QWORD PTR [rdx+0x8],xmm0
   140326d4b:	49 83 c0 04          	add    r8,0x4
   140326d4f:	49 83 c1 10          	add    r9,0x10
   140326d53:	48 83 c2 20          	add    rdx,0x20
   140326d57:	83 c1 04             	add    ecx,0x4
   140326d5a:	49 83 eb 01          	sub    r11,0x1
   140326d5e:	75 80                	jne    0x140326ce0
   140326d60:	48 8b 7c 24 70       	mov    rdi,QWORD PTR [rsp+0x70]
   140326d65:	4c 8b 5c 24 38       	mov    r11,QWORD PTR [rsp+0x38]
   140326d6a:	41 3b f4             	cmp    esi,r12d
   140326d6d:	7d 41                	jge    0x140326db0
   140326d6f:	48 8b 44 24 48       	mov    rax,QWORD PTR [rsp+0x48]
   140326d74:	4f 8d 0c c3          	lea    r9,[r11+r8*8]
   140326d78:	48 63 cb             	movsxd rcx,ebx
   140326d7b:	8d 14 1e             	lea    edx,[rsi+rbx*1]
   140326d7e:	49 03 c8             	add    rcx,r8
   140326d81:	4c 8d 04 88          	lea    r8,[rax+rcx*4]
   140326d85:	41 8b cc             	mov    ecx,r12d
   140326d88:	2b ce                	sub    ecx,esi
   140326d8a:	85 d2                	test   edx,edx
   140326d8c:	78 12                	js     0x140326da0
   140326d8e:	3b 55 20             	cmp    edx,DWORD PTR [rbp+0x20]
   140326d91:	7d 0d                	jge    0x140326da0
   140326d93:	f3 41 0f 10 00       	movss  xmm0,DWORD PTR [r8]
   140326d98:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140326d9b:	f2 41 0f 11 01       	movsd  QWORD PTR [r9],xmm0
   140326da0:	49 83 c0 04          	add    r8,0x4
   140326da4:	49 83 c1 08          	add    r9,0x8
   140326da8:	ff c2                	inc    edx
   140326daa:	48 83 e9 01          	sub    rcx,0x1
   140326dae:	75 da                	jne    0x140326d8a
   140326db0:	4c 8b 54 24 60       	mov    r10,QWORD PTR [rsp+0x60]
   140326db5:	48 8d 05 44 92 cd ff 	lea    rax,[rip+0xffffffffffcd9244]        # 0x140000000
   140326dbc:	4e 8b 94 d0 78 a0 98 	mov    r10,QWORD PTR [rax+r10*8+0x98a078]
   140326dc3:	00 
   140326dc4:	33 c0                	xor    eax,eax
   140326dc6:	44 8b c0             	mov    r8d,eax
   140326dc9:	45 85 e4             	test   r12d,r12d
   140326dcc:	0f 84 60 01 00 00    	je     0x140326f32
   140326dd2:	41 83 fc 08          	cmp    r12d,0x8
   140326dd6:	0f 82 8f 00 00 00    	jb     0x140326e6b
   140326ddc:	41 8d 44 24 ff       	lea    eax,[r12-0x1]
   140326de1:	49 8d 14 c3          	lea    rdx,[r11+rax*8]
   140326de5:	49 8d 04 c2          	lea    rax,[r10+rax*8]
   140326de9:	4c 3b d8             	cmp    r11,rax
   140326dec:	77 05                	ja     0x140326df3
   140326dee:	49 3b d2             	cmp    rdx,r10
   140326df1:	73 78                	jae    0x140326e6b
   140326df3:	4c 3b da             	cmp    r11,rdx
   140326df6:	76 73                	jbe    0x140326e6b
   140326df8:	41 8b d4             	mov    edx,r12d
   140326dfb:	83 e2 f8             	and    edx,0xfffffff8
   140326dfe:	41 b9 04 00 00 00    	mov    r9d,0x4
   140326e04:	41 8b c0             	mov    eax,r8d
   140326e07:	41 83 c0 08          	add    r8d,0x8
   140326e0b:	41 0f 10 04 c3       	movups xmm0,XMMWORD PTR [r11+rax*8]
   140326e10:	41 0f 10 0c c2       	movups xmm1,XMMWORD PTR [r10+rax*8]
   140326e15:	66 0f 59 c8          	mulpd  xmm1,xmm0
   140326e19:	41 0f 11 0c c3       	movups XMMWORD PTR [r11+rax*8],xmm1
   140326e1e:	41 8d 41 fe          	lea    eax,[r9-0x2]
   140326e22:	41 0f 10 04 c3       	movups xmm0,XMMWORD PTR [r11+rax*8]
   140326e27:	41 0f 10 0c c2       	movups xmm1,XMMWORD PTR [r10+rax*8]
   140326e2c:	66 0f 59 c8          	mulpd  xmm1,xmm0
   140326e30:	41 0f 11 0c c3       	movups XMMWORD PTR [r11+rax*8],xmm1
   140326e35:	41 8b c1             	mov    eax,r9d
   140326e38:	41 0f 10 04 c3       	movups xmm0,XMMWORD PTR [r11+rax*8]
   140326e3d:	41 0f 10 0c c2       	movups xmm1,XMMWORD PTR [r10+rax*8]
   140326e42:	66 0f 59 c8          	mulpd  xmm1,xmm0
   140326e46:	41 0f 11 0c c3       	movups XMMWORD PTR [r11+rax*8],xmm1
   140326e4b:	41 8d 41 02          	lea    eax,[r9+0x2]
   140326e4f:	41 83 c1 08          	add    r9d,0x8
   140326e53:	41 0f 10 0c c2       	movups xmm1,XMMWORD PTR [r10+rax*8]
   140326e58:	41 0f 10 04 c3       	movups xmm0,XMMWORD PTR [r11+rax*8]
   140326e5d:	66 0f 59 c8          	mulpd  xmm1,xmm0
   140326e61:	41 0f 11 0c c3       	movups XMMWORD PTR [r11+rax*8],xmm1
   140326e66:	44 3b c2             	cmp    r8d,edx
   140326e69:	72 99                	jb     0x140326e04
   140326e6b:	45 3b c4             	cmp    r8d,r12d
   140326e6e:	0f 83 be 00 00 00    	jae    0x140326f32
   140326e74:	41 8b c4             	mov    eax,r12d
   140326e77:	41 2b c0             	sub    eax,r8d
   140326e7a:	83 f8 04             	cmp    eax,0x4
   140326e7d:	72 7f                	jb     0x140326efe
   140326e7f:	41 8b c8             	mov    ecx,r8d
   140326e82:	41 8b c4             	mov    eax,r12d
   140326e85:	41 2b c0             	sub    eax,r8d
   140326e88:	48 ff c1             	inc    rcx
   140326e8b:	83 e8 04             	sub    eax,0x4
   140326e8e:	49 8b d3             	mov    rdx,r11
   140326e91:	c1 e8 02             	shr    eax,0x2
   140326e94:	49 2b d2             	sub    rdx,r10
   140326e97:	ff c0                	inc    eax
   140326e99:	49 8d 0c ca          	lea    rcx,[r10+rcx*8]
   140326e9d:	44 8b c8             	mov    r9d,eax
   140326ea0:	45 8d 04 80          	lea    r8d,[r8+rax*4]
   140326ea4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140326ea8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140326eaf:	00 
   140326eb0:	f2 0f 10 41 f8       	movsd  xmm0,QWORD PTR [rcx-0x8]
   140326eb5:	f2 0f 59 44 0a f8    	mulsd  xmm0,QWORD PTR [rdx+rcx*1-0x8]
   140326ebb:	48 8d 49 20          	lea    rcx,[rcx+0x20]
   140326ebf:	f2 0f 11 44 0a d8    	movsd  QWORD PTR [rdx+rcx*1-0x28],xmm0
   140326ec5:	f2 0f 10 4c 0a e0    	movsd  xmm1,QWORD PTR [rdx+rcx*1-0x20]
   140326ecb:	f2 0f 59 49 e0       	mulsd  xmm1,QWORD PTR [rcx-0x20]
   140326ed0:	f2 0f 11 4c 0a e0    	movsd  QWORD PTR [rdx+rcx*1-0x20],xmm1
   140326ed6:	f2 0f 10 44 0a e8    	movsd  xmm0,QWORD PTR [rdx+rcx*1-0x18]
   140326edc:	f2 0f 59 41 e8       	mulsd  xmm0,QWORD PTR [rcx-0x18]
   140326ee1:	f2 0f 11 44 0a e8    	movsd  QWORD PTR [rdx+rcx*1-0x18],xmm0
   140326ee7:	f2 0f 10 49 f0       	movsd  xmm1,QWORD PTR [rcx-0x10]
   140326eec:	f2 0f 59 4c 0a f0    	mulsd  xmm1,QWORD PTR [rdx+rcx*1-0x10]
   140326ef2:	f2 0f 11 4c 0a f0    	movsd  QWORD PTR [rdx+rcx*1-0x10],xmm1
   140326ef8:	49 83 e9 01          	sub    r9,0x1
   140326efc:	75 b2                	jne    0x140326eb0
   140326efe:	45 3b c4             	cmp    r8d,r12d
   140326f01:	73 2f                	jae    0x140326f32
   140326f03:	41 8b c0             	mov    eax,r8d
   140326f06:	49 8b d3             	mov    rdx,r11
   140326f09:	49 2b d2             	sub    rdx,r10
   140326f0c:	49 8d 0c c2          	lea    rcx,[r10+rax*8]
   140326f10:	41 8b c4             	mov    eax,r12d
   140326f13:	41 2b c0             	sub    eax,r8d
   140326f16:	44 8b c0             	mov    r8d,eax
   140326f19:	f2 0f 10 01          	movsd  xmm0,QWORD PTR [rcx]
   140326f1d:	f2 0f 59 04 0a       	mulsd  xmm0,QWORD PTR [rdx+rcx*1]
   140326f22:	48 8d 49 08          	lea    rcx,[rcx+0x8]
   140326f26:	f2 0f 11 44 0a f8    	movsd  QWORD PTR [rdx+rcx*1-0x8],xmm0
   140326f2c:	49 83 e8 01          	sub    r8,0x1
   140326f30:	75 e7                	jne    0x140326f19
   140326f32:	8b 74 24 30          	mov    esi,DWORD PTR [rsp+0x30]
   140326f36:	48 8b 44 24 78       	mov    rax,QWORD PTR [rsp+0x78]
   140326f3b:	8d 5e ff             	lea    ebx,[rsi-0x1]
   140326f3e:	48 8b 04 d8          	mov    rax,QWORD PTR [rax+rbx*8]
   140326f42:	48 85 c0             	test   rax,rax
   140326f45:	75 1a                	jne    0x140326f61
   140326f47:	8b 4c 24 24          	mov    ecx,DWORD PTR [rsp+0x24]
   140326f4b:	45 33 c9             	xor    r9d,r9d
   140326f4e:	45 33 c0             	xor    r8d,r8d
   140326f51:	33 d2                	xor    edx,edx
   140326f53:	e8 28 1e 20 00       	call   0x140528d80
   140326f58:	48 8b 4c 24 78       	mov    rcx,QWORD PTR [rsp+0x78]
   140326f5d:	48 89 04 d9          	mov    QWORD PTR [rcx+rbx*8],rax
   140326f61:	48 8b 5c 24 28       	mov    rbx,QWORD PTR [rsp+0x28]
   140326f66:	4c 8b c8             	mov    r9,rax
   140326f69:	44 8b 44 24 24       	mov    r8d,DWORD PTR [rsp+0x24]
   140326f6e:	48 8b cb             	mov    rcx,rbx
   140326f71:	48 8b 54 24 38       	mov    rdx,QWORD PTR [rsp+0x38]
   140326f76:	e8 95 f5 ff ff       	call   0x140326510
   140326f7b:	45 85 f6             	test   r14d,r14d
   140326f7e:	74 50                	je     0x140326fd0
   140326f80:	41 8b f6             	mov    esi,r14d
   140326f83:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140326f87:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140326f8e:	00 00 
   140326f90:	66 0f 10 33          	movupd xmm6,XMMWORD PTR [rbx]
   140326f94:	48 8d 4c 24 60       	lea    rcx,[rsp+0x60]
   140326f99:	66 0f 7f 74 24 60    	movdqa XMMWORD PTR [rsp+0x60],xmm6
   140326f9f:	e8 dc d5 2e 00       	call   0x140614580
   140326fa4:	48 8d 4c 24 60       	lea    rcx,[rsp+0x60]
   140326fa9:	f2 0f 11 03          	movsd  QWORD PTR [rbx],xmm0
   140326fad:	66 0f 7f 74 24 60    	movdqa XMMWORD PTR [rsp+0x60],xmm6
   140326fb3:	e8 a8 d5 2e 00       	call   0x140614560
   140326fb8:	f2 0f 11 43 08       	movsd  QWORD PTR [rbx+0x8],xmm0
   140326fbd:	48 8d 5b 10          	lea    rbx,[rbx+0x10]
   140326fc1:	48 83 ee 01          	sub    rsi,0x1
   140326fc5:	75 c9                	jne    0x140326f90
   140326fc7:	8b 74 24 30          	mov    esi,DWORD PTR [rsp+0x30]
   140326fcb:	48 8b 5c 24 28       	mov    rbx,QWORD PTR [rsp+0x28]
   140326fd0:	8b 0d 36 30 66 00    	mov    ecx,DWORD PTR [rip+0x663036]        # 0x14098a00c
   140326fd6:	8b c1                	mov    eax,ecx
   140326fd8:	f7 d8                	neg    eax
   140326fda:	44 3b f8             	cmp    r15d,eax
   140326fdd:	7c 67                	jl     0x140327046
   140326fdf:	45 3b fd             	cmp    r15d,r13d
   140326fe2:	44 8b ee             	mov    r13d,esi
   140326fe5:	7d 62                	jge    0x140327049
   140326fe7:	41 8d 04 0f          	lea    eax,[r15+rcx*1]
   140326feb:	45 8b c6             	mov    r8d,r14d
   140326fee:	4c 63 c8             	movsxd r9,eax
   140326ff1:	48 8b d3             	mov    rdx,rbx
   140326ff4:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   140326ff9:	4d 03 c9             	add    r9,r9
   140326ffc:	49 c1 e0 04          	shl    r8,0x4
   140327000:	4a 8b 0c e8          	mov    rcx,QWORD PTR [rax+r13*8]
   140327004:	4a 8b 0c c9          	mov    rcx,QWORD PTR [rcx+r9*8]
   140327008:	e8 d7 9c 2f 00       	call   0x140620ce4
   14032700d:	8b 05 f9 2f 66 00    	mov    eax,DWORD PTR [rip+0x662ff9]        # 0x14098a00c
   140327013:	48 8b 4c 24 50       	mov    rcx,QWORD PTR [rsp+0x50]
   140327018:	41 03 c7             	add    eax,r15d
   14032701b:	48 98                	cdqe
   14032701d:	48 03 c0             	add    rax,rax
   140327020:	4a 8b 0c e9          	mov    rcx,QWORD PTR [rcx+r13*8]
   140327024:	8b 54 c1 08          	mov    edx,DWORD PTR [rcx+rax*8+0x8]
   140327028:	83 fa 01             	cmp    edx,0x1
   14032702b:	75 0a                	jne    0x140327037
   14032702d:	c7 44 c1 08 03 00 00 	mov    DWORD PTR [rcx+rax*8+0x8],0x3
   140327034:	00 
   140327035:	eb 12                	jmp    0x140327049
   140327037:	83 fa 02             	cmp    edx,0x2
   14032703a:	75 0d                	jne    0x140327049
   14032703c:	c7 44 c1 08 00 00 00 	mov    DWORD PTR [rcx+rax*8+0x8],0x0
   140327043:	00 
   140327044:	eb 03                	jmp    0x140327049
   140327046:	44 8b ee             	mov    r13d,esi
   140327049:	4c 8b 7c 24 28       	mov    r15,QWORD PTR [rsp+0x28]
   14032704e:	44 8b 0d ff 2f 66 00 	mov    r9d,DWORD PTR [rip+0x662fff]        # 0x14098a054
   140327055:	41 8d 5e ff          	lea    ebx,[r14-0x1]
   140327059:	0f 57 c0             	xorps  xmm0,xmm0
   14032705c:	41 8b c6             	mov    eax,r14d
   14032705f:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140327064:	33 c0                	xor    eax,eax
   140327066:	8b c8                	mov    ecx,eax
   140327068:	f2 0f 58 c0          	addsd  xmm0,xmm0
   14032706c:	f2 41 0f 59 c4       	mulsd  xmm0,xmm12
   140327071:	f2 41 0f 59 c5       	mulsd  xmm0,xmm13
   140327076:	66 0f 5a e0          	cvtpd2ps xmm4,xmm0
   14032707a:	85 db                	test   ebx,ebx
   14032707c:	0f 8e 72 01 00 00    	jle    0x1403271f4
   140327082:	4d 8d 57 20          	lea    r10,[r15+0x20]
   140327086:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14032708d:	00 00 00 
   140327090:	8b 05 be 30 66 00    	mov    eax,DWORD PTR [rip+0x6630be]        # 0x14098a154
   140327096:	44 8d 59 01          	lea    r11d,[rcx+0x1]
   14032709a:	0f 57 c0             	xorps  xmm0,xmm0
   14032709d:	66 41 0f 6e cb       	movd   xmm1,r11d
   1403270a2:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   1403270a5:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   1403270aa:	f3 0f 59 cf          	mulss  xmm1,xmm7
   1403270ae:	f3 41 0f 59 c2       	mulss  xmm0,xmm10
   1403270b3:	f3 41 0f 5d c3       	minss  xmm0,xmm11
   1403270b8:	0f 2f c8             	comiss xmm1,xmm0
   1403270bb:	0f 87 33 01 00 00    	ja     0x1403271f4
   1403270c1:	83 fe 01             	cmp    esi,0x1
   1403270c4:	74 13                	je     0x1403270d9
   1403270c6:	83 fe 02             	cmp    esi,0x2
   1403270c9:	0f 85 15 01 00 00    	jne    0x1403271e4
   1403270cf:	44 0f 2f c9          	comiss xmm9,xmm1
   1403270d3:	0f 86 0b 01 00 00    	jbe    0x1403271e4
   1403270d9:	f3 42 0f 10 8c ac 80 	movss  xmm1,DWORD PTR [rsp+r13*4+0x80]
   1403270e0:	00 00 00 
   1403270e3:	0f 5a c9             	cvtps2pd xmm1,xmm1
   1403270e6:	83 f9 01             	cmp    ecx,0x1
   1403270e9:	7c 0b                	jl     0x1403270f6
   1403270eb:	0f 28 c1             	movaps xmm0,xmm1
   1403270ee:	f2 41 0f 59 42 e0    	mulsd  xmm0,QWORD PTR [r10-0x20]
   1403270f4:	eb 03                	jmp    0x1403270f9
   1403270f6:	0f 57 c0             	xorps  xmm0,xmm0
   1403270f9:	66 0f 5a d8          	cvtpd2ps xmm3,xmm0
   1403270fd:	8d 41 02             	lea    eax,[rcx+0x2]
   140327100:	0f 28 c1             	movaps xmm0,xmm1
   140327103:	f2 41 0f 59 42 f0    	mulsd  xmm0,QWORD PTR [r10-0x10]
   140327109:	66 0f 5a d0          	cvtpd2ps xmm2,xmm0
   14032710d:	41 3b c6             	cmp    eax,r14d
   140327110:	7d 07                	jge    0x140327119
   140327112:	f2 41 0f 59 0a       	mulsd  xmm1,QWORD PTR [r10]
   140327117:	eb 03                	jmp    0x14032711c
   140327119:	0f 57 c9             	xorps  xmm1,xmm1
   14032711c:	0f 2f d4             	comiss xmm2,xmm4
   14032711f:	0f 82 bf 00 00 00    	jb     0x1403271e4
   140327125:	0f 2f d3             	comiss xmm2,xmm3
   140327128:	0f 82 b6 00 00 00    	jb     0x1403271e4
   14032712e:	66 0f 5a c1          	cvtpd2ps xmm0,xmm1
   140327132:	0f 2f d0             	comiss xmm2,xmm0
   140327135:	0f 82 a9 00 00 00    	jb     0x1403271e4
   14032713b:	33 d2                	xor    edx,edx
   14032713d:	8b c1                	mov    eax,ecx
   14032713f:	41 0f af c1          	imul   eax,r9d
   140327143:	41 f7 f6             	div    r14d
   140327146:	4c 63 c0             	movsxd r8,eax
   140327149:	4d 03 c0             	add    r8,r8
   14032714c:	42 0f 2f 14 c7       	comiss xmm2,DWORD PTR [rdi+r8*8]
   140327151:	0f 86 8d 00 00 00    	jbe    0x1403271e4
   140327157:	33 c0                	xor    eax,eax
   140327159:	f3 42 0f 11 14 c7    	movss  DWORD PTR [rdi+r8*8],xmm2
   14032715f:	8d 51 ff             	lea    edx,[rcx-0x1]
   140327162:	42 89 44 c7 04       	mov    DWORD PTR [rdi+r8*8+0x4],eax
   140327167:	85 d2                	test   edx,edx
   140327169:	45 8b cb             	mov    r9d,r11d
   14032716c:	41 0f 28 d0          	movaps xmm2,xmm8
   140327170:	41 0f 28 c8          	movaps xmm1,xmm8
   140327174:	0f 4e d0             	cmovle edx,eax
   140327177:	41 8d 46 fe          	lea    eax,[r14-0x2]
   14032717b:	44 3b d8             	cmp    r11d,eax
   14032717e:	48 63 ca             	movsxd rcx,edx
   140327181:	44 0f 4d c8          	cmovge r9d,eax
   140327185:	48 ff c1             	inc    rcx
   140327188:	48 c1 e1 04          	shl    rcx,0x4
   14032718c:	8d 42 01             	lea    eax,[rdx+0x1]
   14032718f:	49 03 cf             	add    rcx,r15
   140327192:	41 3b d1             	cmp    edx,r9d
   140327195:	7f 33                	jg     0x1403271ca
   140327197:	f2 0f 10 01          	movsd  xmm0,QWORD PTR [rcx]
   14032719b:	ff c2                	inc    edx
   14032719d:	66 0f 6e c8          	movd   xmm1,eax
   1403271a1:	ff c0                	inc    eax
   1403271a3:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   1403271a6:	48 83 c1 10          	add    rcx,0x10
   1403271aa:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   1403271ae:	f3 0f 59 cf          	mulss  xmm1,xmm7
   1403271b2:	f3 0f 58 d0          	addss  xmm2,xmm0
   1403271b6:	f3 0f 59 c8          	mulss  xmm1,xmm0
   1403271ba:	f3 42 0f 58 4c c7 04 	addss  xmm1,DWORD PTR [rdi+r8*8+0x4]
   1403271c1:	f3 42 0f 11 4c c7 04 	movss  DWORD PTR [rdi+r8*8+0x4],xmm1
   1403271c8:	eb c8                	jmp    0x140327192
   1403271ca:	41 0f 2e d0          	ucomiss xmm2,xmm8
   1403271ce:	7a 02                	jp     0x1403271d2
   1403271d0:	74 0b                	je     0x1403271dd
   1403271d2:	f3 0f 5e ca          	divss  xmm1,xmm2
   1403271d6:	f3 42 0f 11 4c c7 04 	movss  DWORD PTR [rdi+r8*8+0x4],xmm1
   1403271dd:	44 8b 0d 70 2e 66 00 	mov    r9d,DWORD PTR [rip+0x662e70]        # 0x14098a054
   1403271e4:	49 83 c2 10          	add    r10,0x10
   1403271e8:	41 8b cb             	mov    ecx,r11d
   1403271eb:	44 3b db             	cmp    r11d,ebx
   1403271ee:	0f 8c 9c fe ff ff    	jl     0x140327090
   1403271f4:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   1403271f9:	44 8b 44 24 44       	mov    r8d,DWORD PTR [rsp+0x44]
   1403271fe:	48 8d 0d fb 8d cd ff 	lea    rcx,[rip+0xffffffffffcd8dfb]        # 0x140000000
   140327205:	44 8b 7c 24 20       	mov    r15d,DWORD PTR [rsp+0x20]
   14032720a:	ff c6                	inc    esi
   14032720c:	89 74 24 30          	mov    DWORD PTR [rsp+0x30],esi
   140327210:	83 fe 02             	cmp    esi,0x2
   140327213:	0f 86 a9 f8 ff ff    	jbe    0x140326ac2
   140327219:	44 0f 28 ac 24 a0 00 	movaps xmm13,XMMWORD PTR [rsp+0xa0]
   140327220:	00 00 
   140327222:	44 0f 28 a4 24 b0 00 	movaps xmm12,XMMWORD PTR [rsp+0xb0]
   140327229:	00 00 
   14032722b:	44 0f 28 9c 24 c0 00 	movaps xmm11,XMMWORD PTR [rsp+0xc0]
   140327232:	00 00 
   140327234:	44 0f 28 94 24 d0 00 	movaps xmm10,XMMWORD PTR [rsp+0xd0]
   14032723b:	00 00 
   14032723d:	44 0f 28 8c 24 e0 00 	movaps xmm9,XMMWORD PTR [rsp+0xe0]
   140327244:	00 00 
   140327246:	44 0f 28 84 24 f0 00 	movaps xmm8,XMMWORD PTR [rsp+0xf0]
   14032724d:	00 00 
   14032724f:	0f 28 bc 24 00 01 00 	movaps xmm7,XMMWORD PTR [rsp+0x100]
   140327256:	00 
   140327257:	0f 28 b4 24 10 01 00 	movaps xmm6,XMMWORD PTR [rsp+0x110]
   14032725e:	00 
   14032725f:	4c                   	rex.WR
