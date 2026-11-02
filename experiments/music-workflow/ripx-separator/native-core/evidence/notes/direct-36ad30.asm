
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014036ad30 <.text+0x369d30>:
   14036ad30:	48 89 5c 24 18       	mov    QWORD PTR [rsp+0x18],rbx
   14036ad35:	55                   	push   rbp
   14036ad36:	56                   	push   rsi
   14036ad37:	41 54                	push   r12
   14036ad39:	41 55                	push   r13
   14036ad3b:	41 56                	push   r14
   14036ad3d:	48 81 ec 20 01 00 00 	sub    rsp,0x120
   14036ad44:	8b ac 24 78 01 00 00 	mov    ebp,DWORD PTR [rsp+0x178]
   14036ad4b:	41 8b f1             	mov    esi,r9d
   14036ad4e:	45 8b f0             	mov    r14d,r8d
   14036ad51:	8b da                	mov    ebx,edx
   14036ad53:	85 ed                	test   ebp,ebp
   14036ad55:	79 15                	jns    0x14036ad6c
   14036ad57:	8b 2d 53 f4 61 00    	mov    ebp,DWORD PTR [rip+0x61f453]        # 0x14098a1b0
   14036ad5d:	89 ac 24 78 01 00 00 	mov    DWORD PTR [rsp+0x178],ebp
   14036ad64:	85 ed                	test   ebp,ebp
   14036ad66:	0f 88 da 06 00 00    	js     0x14036b446
   14036ad6c:	3b 2d 5e 60 64 14    	cmp    ebp,DWORD PTR [rip+0x1464605e]        # 0x1549b0dd0
   14036ad72:	0f 8d ce 06 00 00    	jge    0x14036b446
   14036ad78:	f3 0f 10 05 70 55 4e 	movss  xmm0,DWORD PTR [rip+0x4e5570]        # 0x1408502f0
   14036ad7f:	00 
   14036ad80:	48 8d 54 24 70       	lea    rdx,[rsp+0x70]
   14036ad85:	45 33 ed             	xor    r13d,r13d
   14036ad88:	45 33 c9             	xor    r9d,r9d
   14036ad8b:	4c 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],r13
   14036ad90:	45 33 c0             	xor    r8d,r8d
   14036ad93:	44 88 6c 24 50       	mov    BYTE PTR [rsp+0x50],r13b
   14036ad98:	f3 0f 11 44 24 48    	movss  DWORD PTR [rsp+0x48],xmm0
   14036ad9e:	f3 0f 11 44 24 40    	movss  DWORD PTR [rsp+0x40],xmm0
   14036ada4:	44 88 6c 24 38       	mov    BYTE PTR [rsp+0x38],r13b
   14036ada9:	4c 89 6c 24 30       	mov    QWORD PTR [rsp+0x30],r13
   14036adae:	44 88 6c 24 28       	mov    BYTE PTR [rsp+0x28],r13b
   14036adb3:	44 88 6c 24 20       	mov    BYTE PTR [rsp+0x20],r13b
   14036adb8:	4c 89 6c 24 70       	mov    QWORD PTR [rsp+0x70],r13
   14036adbd:	e8 8e 0a 00 00       	call   0x14036b850
   14036adc2:	4c 8b 64 24 70       	mov    r12,QWORD PTR [rsp+0x70]
   14036adc7:	4d 85 e4             	test   r12,r12
   14036adca:	0f 84 76 06 00 00    	je     0x14036b446
   14036add0:	48 89 bc 24 50 01 00 	mov    QWORD PTR [rsp+0x150],rdi
   14036add7:	00 
   14036add8:	4c 89 bc 24 58 01 00 	mov    QWORD PTR [rsp+0x158],r15
   14036addf:	00 
   14036ade0:	0f 29 b4 24 10 01 00 	movaps XMMWORD PTR [rsp+0x110],xmm6
   14036ade7:	00 
   14036ade8:	0f 29 bc 24 00 01 00 	movaps XMMWORD PTR [rsp+0x100],xmm7
   14036adef:	00 
   14036adf0:	44 0f 29 84 24 f0 00 	movaps XMMWORD PTR [rsp+0xf0],xmm8
   14036adf7:	00 00 
   14036adf9:	44 0f 29 8c 24 e0 00 	movaps XMMWORD PTR [rsp+0xe0],xmm9
   14036ae00:	00 00 
   14036ae02:	44 0f 29 94 24 d0 00 	movaps XMMWORD PTR [rsp+0xd0],xmm10
   14036ae09:	00 00 
   14036ae0b:	44 0f 29 9c 24 c0 00 	movaps XMMWORD PTR [rsp+0xc0],xmm11
   14036ae12:	00 00 
   14036ae14:	44 0f 29 a4 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm12
   14036ae1b:	00 00 
   14036ae1d:	44 0f 29 ac 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm13
   14036ae24:	00 00 
   14036ae26:	44 0f 29 b4 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm14
   14036ae2d:	00 00 
   14036ae2f:	44 0f 29 bc 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm15
   14036ae36:	00 00 
   14036ae38:	45 85 f6             	test   r14d,r14d
   14036ae3b:	79 04                	jns    0x14036ae41
   14036ae3d:	45 8b 34 24          	mov    r14d,DWORD PTR [r12]
   14036ae41:	85 f6                	test   esi,esi
   14036ae43:	79 05                	jns    0x14036ae4a
   14036ae45:	41 8b 74 24 04       	mov    esi,DWORD PTR [r12+0x4]
   14036ae4a:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   14036ae4e:	44 3b f0             	cmp    r14d,eax
   14036ae51:	41 8b 7c 24 04       	mov    edi,DWORD PTR [r12+0x4]
   14036ae56:	44 0f 4c f0          	cmovl  r14d,eax
   14036ae5a:	3b fe                	cmp    edi,esi
   14036ae5c:	44 89 74 24 68       	mov    DWORD PTR [rsp+0x68],r14d
   14036ae61:	0f 4c f7             	cmovl  esi,edi
   14036ae64:	2b f8                	sub    edi,eax
   14036ae66:	4c 63 ff             	movsxd r15,edi
   14036ae69:	49 8b cf             	mov    rcx,r15
   14036ae6c:	89 74 24 64          	mov    DWORD PTR [rsp+0x64],esi
   14036ae70:	4c 89 7c 24 78       	mov    QWORD PTR [rsp+0x78],r15
   14036ae75:	e8 e6 06 2b 00       	call   0x14061b560
   14036ae7a:	48 89 44 24 70       	mov    QWORD PTR [rsp+0x70],rax
   14036ae7f:	48 85 c0             	test   rax,rax
   14036ae82:	74 0f                	je     0x14036ae93
   14036ae84:	4d 8b c7             	mov    r8,r15
   14036ae87:	33 d2                	xor    edx,edx
   14036ae89:	48 8b c8             	mov    rcx,rax
   14036ae8c:	e8 59 5e 2b 00       	call   0x140620cea
   14036ae91:	eb 05                	jmp    0x14036ae98
   14036ae93:	4c 89 6c 24 70       	mov    QWORD PTR [rsp+0x70],r13
   14036ae98:	33 d2                	xor    edx,edx
   14036ae9a:	8d 43 ff             	lea    eax,[rbx-0x1]
   14036ae9d:	03 c7                	add    eax,edi
   14036ae9f:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   14036aea6:	f7 f3                	div    ebx
   14036aea8:	48 63 f0             	movsxd rsi,eax
   14036aeab:	b8 04 00 00 00       	mov    eax,0x4
   14036aeb0:	48 f7 e6             	mul    rsi
   14036aeb3:	48 0f 40 c1          	cmovo  rax,rcx
   14036aeb7:	48 8b c8             	mov    rcx,rax
   14036aeba:	e8 a1 06 2b 00       	call   0x14061b560
   14036aebf:	4c 8b e8             	mov    r13,rax
   14036aec2:	32 c0                	xor    al,al
   14036aec4:	88 44 24 60          	mov    BYTE PTR [rsp+0x60],al
   14036aec8:	41 38 44 24 60       	cmp    BYTE PTR [r12+0x60],al
   14036aecd:	0f 86 59 01 00 00    	jbe    0x14036b02c
   14036aed3:	f3 0f 10 05 55 51 4e 	movss  xmm0,DWORD PTR [rip+0x4e5155]        # 0x140850030
   14036aeda:	00 
   14036aedb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14036aee0:	44 0f b6 f0          	movzx  r14d,al
   14036aee4:	40 32 ed             	xor    bpl,bpl
   14036aee7:	4b 8b 8c f4 98 00 00 	mov    rcx,QWORD PTR [r12+r14*8+0x98]
   14036aeee:	00 
   14036aeef:	4c 8b 11             	mov    r10,QWORD PTR [rcx]
   14036aef2:	43 38 6c 34 61       	cmp    BYTE PTR [r12+r14*1+0x61],bpl
   14036aef7:	0f 86 12 01 00 00    	jbe    0x14036b00f
   14036aefd:	4d 03 ff             	add    r15,r15
   14036af00:	45 33 c0             	xor    r8d,r8d
   14036af03:	45 33 db             	xor    r11d,r11d
   14036af06:	48 83 fe 04          	cmp    rsi,0x4
   14036af0a:	0f 8c b3 00 00 00    	jl     0x14036afc3
   14036af10:	48 8d 7e fc          	lea    rdi,[rsi-0x4]
   14036af14:	48 c1 ef 02          	shr    rdi,0x2
   14036af18:	45 8d 48 02          	lea    r9d,[r8+0x2]
   14036af1c:	48 ff c7             	inc    rdi
   14036af1f:	49 8d 55 08          	lea    rdx,[r13+0x8]
   14036af23:	4c 8d 1c bd 00 00 00 	lea    r11,[rdi*4+0x0]
   14036af2a:	00 
   14036af2b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14036af30:	41 8b c0             	mov    eax,r8d
   14036af33:	0f af c3             	imul   eax,ebx
   14036af36:	41 0f b7 0c 42       	movzx  ecx,WORD PTR [r10+rax*2]
   14036af3b:	66 0f 6e c9          	movd   xmm1,ecx
   14036af3f:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14036af42:	0f 2f c8             	comiss xmm1,xmm0
   14036af45:	77 03                	ja     0x14036af4a
   14036af47:	0f 28 c8             	movaps xmm1,xmm0
   14036af4a:	f3 0f 11 4a f8       	movss  DWORD PTR [rdx-0x8],xmm1
   14036af4f:	41 8d 41 ff          	lea    eax,[r9-0x1]
   14036af53:	0f af c3             	imul   eax,ebx
   14036af56:	41 0f b7 0c 42       	movzx  ecx,WORD PTR [r10+rax*2]
   14036af5b:	66 0f 6e c9          	movd   xmm1,ecx
   14036af5f:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14036af62:	0f 2f c8             	comiss xmm1,xmm0
   14036af65:	77 03                	ja     0x14036af6a
   14036af67:	0f 28 c8             	movaps xmm1,xmm0
   14036af6a:	f3 0f 11 4a fc       	movss  DWORD PTR [rdx-0x4],xmm1
   14036af6f:	41 8b c1             	mov    eax,r9d
   14036af72:	0f af c3             	imul   eax,ebx
   14036af75:	41 0f b7 0c 42       	movzx  ecx,WORD PTR [r10+rax*2]
   14036af7a:	66 0f 6e c9          	movd   xmm1,ecx
   14036af7e:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14036af81:	0f 2f c8             	comiss xmm1,xmm0
   14036af84:	77 03                	ja     0x14036af89
   14036af86:	0f 28 c8             	movaps xmm1,xmm0
   14036af89:	f3 0f 11 0a          	movss  DWORD PTR [rdx],xmm1
   14036af8d:	41 8d 41 01          	lea    eax,[r9+0x1]
   14036af91:	0f af c3             	imul   eax,ebx
   14036af94:	41 0f b7 0c 42       	movzx  ecx,WORD PTR [r10+rax*2]
   14036af99:	66 0f 6e c9          	movd   xmm1,ecx
   14036af9d:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14036afa0:	0f 2f c8             	comiss xmm1,xmm0
   14036afa3:	77 03                	ja     0x14036afa8
   14036afa5:	0f 28 c8             	movaps xmm1,xmm0
   14036afa8:	f3 0f 11 4a 04       	movss  DWORD PTR [rdx+0x4],xmm1
   14036afad:	41 83 c0 04          	add    r8d,0x4
   14036afb1:	48 83 c2 10          	add    rdx,0x10
   14036afb5:	41 83 c1 04          	add    r9d,0x4
   14036afb9:	48 83 ef 01          	sub    rdi,0x1
   14036afbd:	0f 85 6d ff ff ff    	jne    0x14036af30
   14036afc3:	4c 3b de             	cmp    r11,rsi
   14036afc6:	7d 2c                	jge    0x14036aff4
   14036afc8:	41 8b c0             	mov    eax,r8d
   14036afcb:	0f af c3             	imul   eax,ebx
   14036afce:	41 0f b7 0c 42       	movzx  ecx,WORD PTR [r10+rax*2]
   14036afd3:	66 0f 6e c9          	movd   xmm1,ecx
   14036afd7:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14036afda:	0f 2f c8             	comiss xmm1,xmm0
   14036afdd:	77 03                	ja     0x14036afe2
   14036afdf:	0f 28 c8             	movaps xmm1,xmm0
   14036afe2:	f3 43 0f 11 4c 9d 00 	movss  DWORD PTR [r13+r11*4+0x0],xmm1
   14036afe9:	41 ff c0             	inc    r8d
   14036afec:	49 ff c3             	inc    r11
   14036afef:	4c 3b de             	cmp    r11,rsi
   14036aff2:	7c d4                	jl     0x14036afc8
   14036aff4:	4d 03 d7             	add    r10,r15
   14036aff7:	40 fe c5             	inc    bpl
   14036affa:	43 3a 6c 26 61       	cmp    bpl,BYTE PTR [r14+r12*1+0x61]
   14036afff:	0f 82 fb fe ff ff    	jb     0x14036af00
   14036b005:	0f b6 44 24 60       	movzx  eax,BYTE PTR [rsp+0x60]
   14036b00a:	4c 8b 7c 24 78       	mov    r15,QWORD PTR [rsp+0x78]
   14036b00f:	fe c0                	inc    al
   14036b011:	88 44 24 60          	mov    BYTE PTR [rsp+0x60],al
   14036b015:	41 3a 44 24 60       	cmp    al,BYTE PTR [r12+0x60]
   14036b01a:	0f 82 c0 fe ff ff    	jb     0x14036aee0
   14036b020:	44 8b 74 24 68       	mov    r14d,DWORD PTR [rsp+0x68]
   14036b025:	8b ac 24 78 01 00 00 	mov    ebp,DWORD PTR [rsp+0x178]
   14036b02c:	4c 8b 44 24 70       	mov    r8,QWORD PTR [rsp+0x70]
   14036b031:	44 8b cb             	mov    r9d,ebx
   14036b034:	49 8b d5             	mov    rdx,r13
   14036b037:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp
   14036b03b:	49 8b cc             	mov    rcx,r12
   14036b03e:	e8 4d 87 00 00       	call   0x140373790
   14036b043:	4c 8b 44 24 70       	mov    r8,QWORD PTR [rsp+0x70]
   14036b048:	44 8b cb             	mov    r9d,ebx
   14036b04b:	49 8b d5             	mov    rdx,r13
   14036b04e:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp
   14036b052:	49 8b cc             	mov    rcx,r12
   14036b055:	e8 96 8d 00 00       	call   0x140373df0
   14036b05a:	44 8b 4c 24 64       	mov    r9d,DWORD PTR [rsp+0x64]
   14036b05f:	0f 57 ff             	xorps  xmm7,xmm7
   14036b062:	f3 0f 10 05 42 4f 4e 	movss  xmm0,DWORD PTR [rip+0x4e4f42]        # 0x14084ffac
   14036b069:	00 
   14036b06a:	45 0f 57 c0          	xorps  xmm8,xmm8
   14036b06e:	41 8b 3c 24          	mov    edi,DWORD PTR [r12]
   14036b072:	45 0f 57 c9          	xorps  xmm9,xmm9
   14036b076:	41 8b 74 24 04       	mov    esi,DWORD PTR [r12+0x4]
   14036b07b:	44 0f b6 bc 24 70 01 	movzx  r15d,BYTE PTR [rsp+0x170]
   14036b082:	00 00 
   14036b084:	48 63 c5             	movsxd rax,ebp
   14036b087:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   14036b08e:	48 8d 05 8b 86 65 00 	lea    rax,[rip+0x65868b]        # 0x1409c3720
   14036b095:	f3 0f 5e 04 01       	divss  xmm0,DWORD PTR [rcx+rax*1]
   14036b09a:	41 8b c1             	mov    eax,r9d
   14036b09d:	41 2b c6             	sub    eax,r14d
   14036b0a0:	99                   	cdq
   14036b0a1:	83 e2 03             	and    edx,0x3
   14036b0a4:	03 c2                	add    eax,edx
   14036b0a6:	c1 f8 02             	sar    eax,0x2
   14036b0a9:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   14036b0ae:	41 3b c0             	cmp    eax,r8d
   14036b0b1:	41 8b c8             	mov    ecx,r8d
   14036b0b4:	0f 4c c8             	cmovl  ecx,eax
   14036b0b7:	03 cf                	add    ecx,edi
   14036b0b9:	44 3b f1             	cmp    r14d,ecx
   14036b0bc:	44 0f 4c f1          	cmovl  r14d,ecx
   14036b0c0:	41 3b c0             	cmp    eax,r8d
   14036b0c3:	44 0f 4c c0          	cmovl  r8d,eax
   14036b0c7:	8b c6                	mov    eax,esi
   14036b0c9:	41 2b c0             	sub    eax,r8d
   14036b0cc:	41 3b c1             	cmp    eax,r9d
   14036b0cf:	44 0f 4c c8          	cmovl  r9d,eax
   14036b0d3:	41 8b c6             	mov    eax,r14d
   14036b0d6:	2b c7                	sub    eax,edi
   14036b0d8:	44 89 4c 24 64       	mov    DWORD PTR [rsp+0x64],r9d
   14036b0dd:	33 d2                	xor    edx,edx
   14036b0df:	f7 f3                	div    ebx
   14036b0e1:	44 2b f2             	sub    r14d,edx
   14036b0e4:	44 89 74 24 68       	mov    DWORD PTR [rsp+0x68],r14d
   14036b0e9:	41 8b ee             	mov    ebp,r14d
   14036b0ec:	45 3b f1             	cmp    r14d,r9d
   14036b0ef:	0f 8d ed 00 00 00    	jge    0x14036b1e2
   14036b0f5:	44 2b f7             	sub    r14d,edi
   14036b0f8:	45 84 ff             	test   r15b,r15b
   14036b0fb:	74 40                	je     0x14036b13d
   14036b0fd:	3b f7                	cmp    esi,edi
   14036b0ff:	7e 7c                	jle    0x14036b17d
   14036b101:	66 41 83 bc 24 1c 02 	cmp    WORD PTR [r12+0x21c],0x0
   14036b108:	00 00 00 
   14036b10b:	7d 12                	jge    0x14036b11f
   14036b10d:	8b c7                	mov    eax,edi
   14036b10f:	2b c7                	sub    eax,edi
   14036b111:	8b c8                	mov    ecx,eax
   14036b113:	49 8b 44 24 10       	mov    rax,QWORD PTR [r12+0x10]
   14036b118:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036b11d:	eb 61                	jmp    0x14036b180
   14036b11f:	3b ef                	cmp    ebp,edi
   14036b121:	8b c5                	mov    eax,ebp
   14036b123:	0f 4c c7             	cmovl  eax,edi
   14036b126:	3b c6                	cmp    eax,esi
   14036b128:	7c 03                	jl     0x14036b12d
   14036b12a:	8d 46 ff             	lea    eax,[rsi-0x1]
   14036b12d:	2b c7                	sub    eax,edi
   14036b12f:	8b c8                	mov    ecx,eax
   14036b131:	49 8b 44 24 10       	mov    rax,QWORD PTR [r12+0x10]
   14036b136:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036b13b:	eb 43                	jmp    0x14036b180
   14036b13d:	3b f7                	cmp    esi,edi
   14036b13f:	7e 3c                	jle    0x14036b17d
   14036b141:	66 41 83 bc 24 1c 02 	cmp    WORD PTR [r12+0x21c],0x0
   14036b148:	00 00 00 
   14036b14b:	7d 12                	jge    0x14036b15f
   14036b14d:	8b c7                	mov    eax,edi
   14036b14f:	2b c7                	sub    eax,edi
   14036b151:	8b c8                	mov    ecx,eax
   14036b153:	49 8b 44 24 08       	mov    rax,QWORD PTR [r12+0x8]
   14036b158:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036b15d:	eb 21                	jmp    0x14036b180
   14036b15f:	3b ef                	cmp    ebp,edi
   14036b161:	8b c5                	mov    eax,ebp
   14036b163:	0f 4c c7             	cmovl  eax,edi
   14036b166:	3b c6                	cmp    eax,esi
   14036b168:	7c 03                	jl     0x14036b16d
   14036b16a:	8d 46 ff             	lea    eax,[rsi-0x1]
   14036b16d:	2b c7                	sub    eax,edi
   14036b16f:	8b c8                	mov    ecx,eax
   14036b171:	49 8b 44 24 08       	mov    rax,QWORD PTR [r12+0x8]
   14036b176:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036b17b:	eb 03                	jmp    0x14036b180
   14036b17d:	0f 28 c7             	movaps xmm0,xmm7
   14036b180:	0f 2e c7             	ucomiss xmm0,xmm7
   14036b183:	7a 02                	jp     0x14036b187
   14036b185:	74 35                	je     0x14036b1bc
   14036b187:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]
   14036b18c:	49 63 c6             	movsxd rax,r14d
   14036b18f:	f6 04 08 01          	test   BYTE PTR [rax+rcx*1],0x1
   14036b193:	75 27                	jne    0x14036b1bc
   14036b195:	8b c5                	mov    eax,ebp
   14036b197:	33 d2                	xor    edx,edx
   14036b199:	2b c7                	sub    eax,edi
   14036b19b:	f7 f3                	div    ebx
   14036b19d:	f3 41 0f 10 74 85 00 	movss  xmm6,DWORD PTR [r13+rax*4+0x0]
   14036b1a4:	e8 07 5c 2b 00       	call   0x140620db0
   14036b1a9:	44 8b 4c 24 64       	mov    r9d,DWORD PTR [rsp+0x64]
   14036b1ae:	f3 44 0f 58 ce       	addss  xmm9,xmm6
   14036b1b3:	f3 0f 59 c6          	mulss  xmm0,xmm6
   14036b1b7:	f3 44 0f 58 c0       	addss  xmm8,xmm0
   14036b1bc:	03 eb                	add    ebp,ebx
   14036b1be:	44 03 f3             	add    r14d,ebx
   14036b1c1:	41 3b e9             	cmp    ebp,r9d
   14036b1c4:	0f 8c 2e ff ff ff    	jl     0x14036b0f8
   14036b1ca:	44 0f 2e cf          	ucomiss xmm9,xmm7
   14036b1ce:	7a 02                	jp     0x14036b1d2
   14036b1d0:	74 10                	je     0x14036b1e2
   14036b1d2:	f3 45 0f 5e c1       	divss  xmm8,xmm9
   14036b1d7:	41 0f 28 c0          	movaps xmm0,xmm8
   14036b1db:	e8 c4 5b 2b 00       	call   0x140620da4
   14036b1e0:	eb 08                	jmp    0x14036b1ea
   14036b1e2:	f3 0f 10 05 f2 bf 32 	movss  xmm0,DWORD PTR [rip+0x32bff2]        # 0x1406971dc
   14036b1e9:	00 
   14036b1ea:	f2 44 0f 10 1d 5d 2f 	movsd  xmm11,QWORD PTR [rip+0x322f5d]        # 0x14068e150
   14036b1f1:	32 00 
   14036b1f3:	f2 44 0f 10 25 74 2f 	movsd  xmm12,QWORD PTR [rip+0x322f74]        # 0x14068e170
   14036b1fa:	32 00 
   14036b1fc:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14036b200:	f2 41 0f 59 c3       	mulsd  xmm0,xmm11
   14036b205:	f2 41 0f 5e c4       	divsd  xmm0,xmm12
   14036b20a:	e8 65 5b 2b 00       	call   0x140620d74
   14036b20f:	f2 44 0f 10 2d 28 2f 	movsd  xmm13,QWORD PTR [rip+0x322f28]        # 0x14068e140
   14036b216:	32 00 
   14036b218:	45 0f 57 d2          	xorps  xmm10,xmm10
   14036b21c:	f2 44 0f 10 35 f3 2e 	movsd  xmm14,QWORD PTR [rip+0x322ef3]        # 0x14068e118
   14036b223:	32 00 
   14036b225:	0f 28 f7             	movaps xmm6,xmm7
   14036b228:	f2 44 0f 10 3d 07 2f 	movsd  xmm15,QWORD PTR [rip+0x322f07]        # 0x14068e138
   14036b22f:	32 00 
   14036b231:	44 0f 28 c7          	movaps xmm8,xmm7
   14036b235:	44 8b 74 24 68       	mov    r14d,DWORD PTR [rsp+0x68]
   14036b23a:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   14036b23e:	f2 41 0f 59 c5       	mulsd  xmm0,xmm13
   14036b243:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14036b248:	f2 41 0f 58 c7       	addsd  xmm0,xmm15
   14036b24d:	f2 44 0f 5a d0       	cvtsd2ss xmm10,xmm0
   14036b252:	44 3b f0             	cmp    r14d,eax
   14036b255:	0f 8d 2e 01 00 00    	jge    0x14036b389
   14036b25b:	f2 44 0f 10 0d 14 4f 	movsd  xmm9,QWORD PTR [rip+0x4e4f14]        # 0x140850178
   14036b262:	4e 00 
   14036b264:	41 8b ee             	mov    ebp,r14d
   14036b267:	2b ef                	sub    ebp,edi
   14036b269:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14036b270:	45 84 ff             	test   r15b,r15b
   14036b273:	74 4a                	je     0x14036b2bf
   14036b275:	3b f7                	cmp    esi,edi
   14036b277:	7e 7e                	jle    0x14036b2f7
   14036b279:	66 41 83 bc 24 1c 02 	cmp    WORD PTR [r12+0x21c],0x0
   14036b280:	00 00 00 
   14036b283:	7d 16                	jge    0x14036b29b
   14036b285:	8b c7                	mov    eax,edi
   14036b287:	2b c7                	sub    eax,edi
   14036b289:	8b c8                	mov    ecx,eax
   14036b28b:	49 8b 44 24 10       	mov    rax,QWORD PTR [r12+0x10]
   14036b290:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036b295:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   14036b299:	eb 5f                	jmp    0x14036b2fa
   14036b29b:	44 3b f7             	cmp    r14d,edi
   14036b29e:	41 8b c6             	mov    eax,r14d
   14036b2a1:	0f 4c c7             	cmovl  eax,edi
   14036b2a4:	3b c6                	cmp    eax,esi
   14036b2a6:	7c 03                	jl     0x14036b2ab
   14036b2a8:	8d 46 ff             	lea    eax,[rsi-0x1]
   14036b2ab:	2b c7                	sub    eax,edi
   14036b2ad:	8b c8                	mov    ecx,eax
   14036b2af:	49 8b 44 24 10       	mov    rax,QWORD PTR [r12+0x10]
   14036b2b4:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036b2b9:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   14036b2bd:	eb 3b                	jmp    0x14036b2fa
   14036b2bf:	3b f7                	cmp    esi,edi
   14036b2c1:	7e 34                	jle    0x14036b2f7
   14036b2c3:	66 41 83 bc 24 1c 02 	cmp    WORD PTR [r12+0x21c],0x0
   14036b2ca:	00 00 00 
   14036b2cd:	7d 04                	jge    0x14036b2d3
   14036b2cf:	8b c7                	mov    eax,edi
   14036b2d1:	eb 10                	jmp    0x14036b2e3
   14036b2d3:	44 3b f7             	cmp    r14d,edi
   14036b2d6:	41 8b c6             	mov    eax,r14d
   14036b2d9:	0f 4c c7             	cmovl  eax,edi
   14036b2dc:	3b c6                	cmp    eax,esi
   14036b2de:	7c 03                	jl     0x14036b2e3
   14036b2e0:	8d 46 ff             	lea    eax,[rsi-0x1]
   14036b2e3:	2b c7                	sub    eax,edi
   14036b2e5:	8b c8                	mov    ecx,eax
   14036b2e7:	49 8b 44 24 08       	mov    rax,QWORD PTR [r12+0x8]
   14036b2ec:	f3 0f 10 04 88       	movss  xmm0,DWORD PTR [rax+rcx*4]
   14036b2f1:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   14036b2f5:	eb 03                	jmp    0x14036b2fa
   14036b2f7:	0f 28 c7             	movaps xmm0,xmm7
   14036b2fa:	0f 2e c7             	ucomiss xmm0,xmm7
   14036b2fd:	7a 02                	jp     0x14036b301
   14036b2ff:	74 7a                	je     0x14036b37b
   14036b301:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]
   14036b306:	48 63 c5             	movsxd rax,ebp
   14036b309:	f6 04 08 01          	test   BYTE PTR [rax+rcx*1],0x1
   14036b30d:	75 68                	jne    0x14036b377
   14036b30f:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14036b313:	f2 41 0f 59 c3       	mulsd  xmm0,xmm11
   14036b318:	f2 41 0f 5e c4       	divsd  xmm0,xmm12
   14036b31d:	e8 52 5a 2b 00       	call   0x140620d74
   14036b322:	f2 41 0f 59 c5       	mulsd  xmm0,xmm13
   14036b327:	0f 57 d2             	xorps  xmm2,xmm2
   14036b32a:	0f 57 c9             	xorps  xmm1,xmm1
   14036b32d:	f3 41 0f 5a ca       	cvtss2sd xmm1,xmm10
   14036b332:	f2 41 0f 5e c6       	divsd  xmm0,xmm14
   14036b337:	f2 41 0f 58 c7       	addsd  xmm0,xmm15
   14036b33c:	f2 0f 5a d0          	cvtsd2ss xmm2,xmm0
   14036b340:	0f 28 c1             	movaps xmm0,xmm1
   14036b343:	0f 5a da             	cvtps2pd xmm3,xmm2
   14036b346:	f2 41 0f 5c c1       	subsd  xmm0,xmm9
   14036b34b:	66 0f 2f d8          	comisd xmm3,xmm0
   14036b34f:	72 26                	jb     0x14036b377
   14036b351:	f2 41 0f 58 c9       	addsd  xmm1,xmm9
   14036b356:	66 0f 2f cb          	comisd xmm1,xmm3
   14036b35a:	72 1b                	jb     0x14036b377
   14036b35c:	41 8b c6             	mov    eax,r14d
   14036b35f:	33 d2                	xor    edx,edx
   14036b361:	2b c7                	sub    eax,edi
   14036b363:	f7 f3                	div    ebx
   14036b365:	f3 41 0f 59 54 85 00 	mulss  xmm2,DWORD PTR [r13+rax*4+0x0]
   14036b36c:	f3 45 0f 58 44 85 00 	addss  xmm8,DWORD PTR [r13+rax*4+0x0]
   14036b373:	f3 0f 58 f2          	addss  xmm6,xmm2
   14036b377:	8b 44 24 64          	mov    eax,DWORD PTR [rsp+0x64]
   14036b37b:	44 03 f3             	add    r14d,ebx
   14036b37e:	03 eb                	add    ebp,ebx
   14036b380:	44 3b f0             	cmp    r14d,eax
   14036b383:	0f 8c e7 fe ff ff    	jl     0x14036b270
   14036b389:	48 8b 4c 24 70       	mov    rcx,QWORD PTR [rsp+0x70]
   14036b38e:	e8 c5 01 2b 00       	call   0x14061b558
   14036b393:	49 8b cd             	mov    rcx,r13
   14036b396:	e8 bd 01 2b 00       	call   0x14061b558
   14036b39b:	49 8b cc             	mov    rcx,r12
   14036b39e:	e8 ed cb 00 00       	call   0x140377f90
   14036b3a3:	ba c0 02 00 00       	mov    edx,0x2c0
   14036b3a8:	49 8b cc             	mov    rcx,r12
   14036b3ab:	e8 a8 01 2b 00       	call   0x14061b558
   14036b3b0:	44 0f 28 bc 24 80 00 	movaps xmm15,XMMWORD PTR [rsp+0x80]
   14036b3b7:	00 00 
   14036b3b9:	44 0f 28 b4 24 90 00 	movaps xmm14,XMMWORD PTR [rsp+0x90]
   14036b3c0:	00 00 
   14036b3c2:	44 0f 28 ac 24 a0 00 	movaps xmm13,XMMWORD PTR [rsp+0xa0]
   14036b3c9:	00 00 
   14036b3cb:	44 0f 28 a4 24 b0 00 	movaps xmm12,XMMWORD PTR [rsp+0xb0]
   14036b3d2:	00 00 
   14036b3d4:	44 0f 28 9c 24 c0 00 	movaps xmm11,XMMWORD PTR [rsp+0xc0]
   14036b3db:	00 00 
   14036b3dd:	44 0f 28 8c 24 e0 00 	movaps xmm9,XMMWORD PTR [rsp+0xe0]
   14036b3e4:	00 00 
   14036b3e6:	4c 8b bc 24 58 01 00 	mov    r15,QWORD PTR [rsp+0x158]
   14036b3ed:	00 
   14036b3ee:	48 8b bc 24 50 01 00 	mov    rdi,QWORD PTR [rsp+0x150]
   14036b3f5:	00 
   14036b3f6:	44 0f 2e c7          	ucomiss xmm8,xmm7
   14036b3fa:	0f 28 bc 24 00 01 00 	movaps xmm7,XMMWORD PTR [rsp+0x100]
   14036b401:	00 
   14036b402:	7a 38                	jp     0x14036b43c
   14036b404:	75 36                	jne    0x14036b43c
   14036b406:	41 0f 28 c2          	movaps xmm0,xmm10
   14036b40a:	44 0f 28 84 24 f0 00 	movaps xmm8,XMMWORD PTR [rsp+0xf0]
   14036b411:	00 00 
   14036b413:	0f 28 b4 24 10 01 00 	movaps xmm6,XMMWORD PTR [rsp+0x110]
   14036b41a:	00 
   14036b41b:	44 0f 28 94 24 d0 00 	movaps xmm10,XMMWORD PTR [rsp+0xd0]
   14036b422:	00 00 
   14036b424:	48 8b 9c 24 60 01 00 	mov    rbx,QWORD PTR [rsp+0x160]
   14036b42b:	00 
   14036b42c:	48 81 c4 20 01 00 00 	add    rsp,0x120
   14036b433:	41 5e                	pop    r14
   14036b435:	41 5d                	pop    r13
   14036b437:	41 5c                	pop    r12
   14036b439:	5e                   	pop    rsi
   14036b43a:	5d                   	pop    rbp
   14036b43b:	c3                   	ret
   14036b43c:	f3 41 0f 5e f0       	divss  xmm6,xmm8
   14036b441:	0f 28 c6             	movaps xmm0,xmm6
   14036b444:	eb c4                	jmp    0x14036b40a
   14036b446:	0f 57 c0             	xorps  xmm0,xmm0
   14036b449:	eb d9                	jmp    0x14036b424
   14036b44b:	cc                   	int3
   14036b44c:	cc                   	int3
   14036b44d:	cc                   	int3
   14036b44e:	cc                   	int3
   14036b44f:	cc                   	int3
   14036b450:	cc                   	int3
   14036b451:	cc                   	int3
   14036b452:	cc                   	int3
   14036b453:	cc                   	int3
   14036b454:	cc                   	int3
   14036b455:	cc                   	int3
   14036b456:	cc                   	int3
   14036b457:	cc                   	int3
   14036b458:	cc                   	int3
   14036b459:	cc                   	int3
   14036b45a:	cc                   	int3
   14036b45b:	cc                   	int3
   14036b45c:	cc                   	int3
   14036b45d:	cc                   	int3
   14036b45e:	cc                   	int3
   14036b45f:	cc                   	int3
