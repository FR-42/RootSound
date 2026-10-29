
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014036faf0 <.text+0x36eaf0>:
   14036faf0:	44 89 4c 24 20       	mov    DWORD PTR [rsp+0x20],r9d
   14036faf5:	4c 89 44 24 18       	mov    QWORD PTR [rsp+0x18],r8
   14036fafa:	48 89 54 24 10       	mov    QWORD PTR [rsp+0x10],rdx
   14036faff:	53                   	push   rbx
   14036fb00:	55                   	push   rbp
   14036fb01:	41 56                	push   r14
   14036fb03:	41 57                	push   r15
   14036fb05:	48 83 ec 78          	sub    rsp,0x78
   14036fb09:	41 c7 00 00 00 00 00 	mov    DWORD PTR [r8],0x0
   14036fb10:	4d 8b f0             	mov    r14,r8
   14036fb13:	8b 69 08             	mov    ebp,DWORD PTR [rcx+0x8]
   14036fb16:	4c 8b da             	mov    r11,rdx
   14036fb19:	2b 69 04             	sub    ebp,DWORD PTR [rcx+0x4]
   14036fb1c:	48 8b d9             	mov    rbx,rcx
   14036fb1f:	80 3d ab 65 b9 14 00 	cmp    BYTE PTR [rip+0x14b965ab],0x0        # 0x154f060d1
   14036fb26:	89 6c 24 28          	mov    DWORD PTR [rsp+0x28],ebp
   14036fb2a:	75 09                	jne    0x14036fb35
   14036fb2c:	83 3d 79 9e 5c 00 00 	cmp    DWORD PTR [rip+0x5c9e79],0x0        # 0x1409399ac
   14036fb33:	7c 3b                	jl     0x14036fb70
   14036fb35:	b1 01                	mov    cl,0x1
   14036fb37:	e8 d4 b7 09 00       	call   0x14040b310
   14036fb3c:	8b 03                	mov    eax,DWORD PTR [rbx]
   14036fb3e:	4c 8b 9c 24 a8 00 00 	mov    r11,QWORD PTR [rsp+0xa8]
   14036fb45:	00 
   14036fb46:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   14036fb4d:	48 8d 05 cc 3b 65 00 	lea    rax,[rip+0x653bcc]        # 0x1409c3720
   14036fb54:	f3 0f 5e 04 01       	divss  xmm0,DWORD PTR [rcx+rax*1]
   14036fb59:	48 8b 8c 24 c0 00 00 	mov    rcx,QWORD PTR [rsp+0xc0]
   14036fb60:	00 
   14036fb61:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14036fb65:	2b 43 04             	sub    eax,DWORD PTR [rbx+0x4]
   14036fb68:	39 01                	cmp    DWORD PTR [rcx],eax
   14036fb6a:	7d 0c                	jge    0x14036fb78
   14036fb6c:	89 01                	mov    DWORD PTR [rcx],eax
   14036fb6e:	eb 08                	jmp    0x14036fb78
   14036fb70:	48 8b 8c 24 c0 00 00 	mov    rcx,QWORD PTR [rsp+0xc0]
   14036fb77:	00 
   14036fb78:	4c 63 39             	movsxd r15,DWORD PTR [rcx]
   14036fb7b:	4c 8b 53 38          	mov    r10,QWORD PTR [rbx+0x38]
   14036fb7f:	48 89 74 24 70       	mov    QWORD PTR [rsp+0x70],rsi
   14036fb84:	48 89 7c 24 68       	mov    QWORD PTR [rsp+0x68],rdi
   14036fb89:	4c 89 64 24 60       	mov    QWORD PTR [rsp+0x60],r12
   14036fb8e:	4c 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],r13
   14036fb93:	4c 89 54 24 30       	mov    QWORD PTR [rsp+0x30],r10
   14036fb98:	44 89 7c 24 20       	mov    DWORD PTR [rsp+0x20],r15d
   14036fb9d:	44 3b fd             	cmp    r15d,ebp
   14036fba0:	0f 8d 5c 04 00 00    	jge    0x140370002
   14036fba6:	49 69 c7 08 52 04 00 	imul   rax,r15,0x45208
   14036fbad:	49 c7 c4 28 f6 ff ff 	mov    r12,0xfffffffffffff628
   14036fbb4:	4d 8d 8a 00 52 04 00 	lea    r9,[r10+0x45200]
   14036fbbb:	4c 2b e0             	sub    r12,rax
   14036fbbe:	4c 03 c8             	add    r9,rax
   14036fbc1:	4d 2b e2             	sub    r12,r10
   14036fbc4:	4c 89 4c 24 38       	mov    QWORD PTR [rsp+0x38],r9
   14036fbc9:	48 c7 c0 00 ae fb ff 	mov    rax,0xfffffffffffbae00
   14036fbd0:	4c 89 64 24 40       	mov    QWORD PTR [rsp+0x40],r12
   14036fbd5:	49 2b c2             	sub    rax,r10
   14036fbd8:	49 8b df             	mov    rbx,r15
   14036fbdb:	48 89 44 24 48       	mov    QWORD PTR [rsp+0x48],rax
   14036fbe0:	33 c9                	xor    ecx,ecx
   14036fbe2:	33 ff                	xor    edi,edi
   14036fbe4:	89 4c 24 24          	mov    DWORD PTR [rsp+0x24],ecx
   14036fbe8:	41 38 09             	cmp    BYTE PTR [r9],cl
   14036fbeb:	0f 86 c4 03 00 00    	jbe    0x14036ffb5
   14036fbf1:	49 8d b1 d8 b7 fb ff 	lea    rsi,[r9-0x44828]
   14036fbf8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14036fbff:	00 
   14036fc00:	0f b7 86 2c f6 ff ff 	movzx  eax,WORD PTR [rsi-0x9d4]
   14036fc07:	a8 01                	test   al,0x1
   14036fc09:	0f 85 82 03 00 00    	jne    0x14036ff91
   14036fc0f:	83 3e ff             	cmp    DWORD PTR [rsi],0xffffffff
   14036fc12:	0f 84 79 03 00 00    	je     0x14036ff91
   14036fc18:	66 83 c8 01          	or     ax,0x1
   14036fc1c:	49 63 d7             	movsxd rdx,r15d
   14036fc1f:	66 89 86 2c f6 ff ff 	mov    WORD PTR [rsi-0x9d4],ax
   14036fc26:	45 8b ef             	mov    r13d,r15d
   14036fc29:	4c 69 c2 08 52 04 00 	imul   r8,rdx,0x45208
   14036fc30:	48 63 c1             	movsxd rax,ecx
   14036fc33:	48 69 c0 e0 09 00 00 	imul   rax,rax,0x9e0
   14036fc3a:	44 89 bc 24 a0 00 00 	mov    DWORD PTR [rsp+0xa0],r15d
   14036fc41:	00 
   14036fc42:	4f 8d 3c 21          	lea    r15,[r9+r12*1]
   14036fc46:	4c 8b 64 24 48       	mov    r12,QWORD PTR [rsp+0x48]
   14036fc4b:	49 03 c2             	add    rax,r10
   14036fc4e:	4c 03 c0             	add    r8,rax
   14036fc51:	41 8b 06             	mov    eax,DWORD PTR [r14]
   14036fc54:	4d 89 04 c3          	mov    QWORD PTR [r11+rax*8],r8
   14036fc58:	4c 8b db             	mov    r11,rbx
   14036fc5b:	41 ff 06             	inc    DWORD PTR [r14]
   14036fc5e:	44 8b 36             	mov    r14d,DWORD PTR [rsi]
   14036fc61:	4d 03 e1             	add    r12,r9
   14036fc64:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14036fc68:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14036fc6f:	00 
   14036fc70:	43 0f b6 ac 22 00 52 	movzx  ebp,BYTE PTR [r10+r12*1+0x45200]
   14036fc77:	04 00 
   14036fc79:	45 33 c9             	xor    r9d,r9d
   14036fc7c:	45 33 c0             	xor    r8d,r8d
   14036fc7f:	48 83 fd 04          	cmp    rbp,0x4
   14036fc83:	0f 82 bc 01 00 00    	jb     0x14036fe45
   14036fc89:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]
   14036fc8e:	45 8d 51 02          	lea    r10d,[r9+0x2]
   14036fc92:	48 83 c1 04          	add    rcx,0x4
   14036fc96:	49 03 cc             	add    rcx,r12
   14036fc99:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14036fca0:	4c 3b db             	cmp    r11,rbx
   14036fca3:	75 05                	jne    0x14036fcaa
   14036fca5:	4c 3b c7             	cmp    r8,rdi
   14036fca8:	74 05                	je     0x14036fcaf
   14036fcaa:	f6 01 01             	test   BYTE PTR [rcx],0x1
   14036fcad:	75 47                	jne    0x14036fcf6
   14036fcaf:	8b 91 d4 09 00 00    	mov    edx,DWORD PTR [rcx+0x9d4]
   14036fcb5:	83 fa ff             	cmp    edx,0xffffffff
   14036fcb8:	74 3c                	je     0x14036fcf6
   14036fcba:	0f b7 01             	movzx  eax,WORD PTR [rcx]
   14036fcbd:	41 bd 00 80 00 00    	mov    r13d,0x8000
   14036fcc3:	66 41 33 84 37 04 ae 	xor    ax,WORD PTR [r15+rsi*1-0x451fc]
   14036fcca:	fb ff 
   14036fccc:	66 41 85 c5          	test   r13w,ax
   14036fcd0:	44 8b ac 24 a0 00 00 	mov    r13d,DWORD PTR [rsp+0xa0]
   14036fcd7:	00 
   14036fcd8:	75 1c                	jne    0x14036fcf6
   14036fcda:	0f 57 c9             	xorps  xmm1,xmm1
   14036fcdd:	0f 57 c0             	xorps  xmm0,xmm0
   14036fce0:	f2 48 0f 2a ca       	cvtsi2sd xmm1,rdx
   14036fce5:	f2 49 0f 2a c6       	cvtsi2sd xmm0,r14
   14036fcea:	66 0f 2e c8          	ucomisd xmm1,xmm0
   14036fcee:	7a 06                	jp     0x14036fcf6
   14036fcf0:	0f 84 c9 01 00 00    	je     0x14036febf
   14036fcf6:	41 ff c1             	inc    r9d
   14036fcf9:	4c 3b db             	cmp    r11,rbx
   14036fcfc:	75 09                	jne    0x14036fd07
   14036fcfe:	49 8d 42 ff          	lea    rax,[r10-0x1]
   14036fd02:	48 3b c7             	cmp    rax,rdi
   14036fd05:	74 09                	je     0x14036fd10
   14036fd07:	f6 81 e0 09 00 00 01 	test   BYTE PTR [rcx+0x9e0],0x1
   14036fd0e:	75 4b                	jne    0x14036fd5b
   14036fd10:	8b 91 b4 13 00 00    	mov    edx,DWORD PTR [rcx+0x13b4]
   14036fd16:	83 fa ff             	cmp    edx,0xffffffff
   14036fd19:	74 40                	je     0x14036fd5b
   14036fd1b:	0f b7 81 e0 09 00 00 	movzx  eax,WORD PTR [rcx+0x9e0]
   14036fd22:	41 bd 00 80 00 00    	mov    r13d,0x8000
   14036fd28:	66 41 33 84 37 04 ae 	xor    ax,WORD PTR [r15+rsi*1-0x451fc]
   14036fd2f:	fb ff 
   14036fd31:	66 41 85 c5          	test   r13w,ax
   14036fd35:	44 8b ac 24 a0 00 00 	mov    r13d,DWORD PTR [rsp+0xa0]
   14036fd3c:	00 
   14036fd3d:	75 1c                	jne    0x14036fd5b
   14036fd3f:	0f 57 c9             	xorps  xmm1,xmm1
   14036fd42:	0f 57 c0             	xorps  xmm0,xmm0
   14036fd45:	f2 48 0f 2a ca       	cvtsi2sd xmm1,rdx
   14036fd4a:	f2 49 0f 2a c6       	cvtsi2sd xmm0,r14
   14036fd4f:	66 0f 2e c8          	ucomisd xmm1,xmm0
   14036fd53:	7a 06                	jp     0x14036fd5b
   14036fd55:	0f 84 d4 01 00 00    	je     0x14036ff2f
   14036fd5b:	41 ff c1             	inc    r9d
   14036fd5e:	4c 3b db             	cmp    r11,rbx
   14036fd61:	75 05                	jne    0x14036fd68
   14036fd63:	4c 3b d7             	cmp    r10,rdi
   14036fd66:	74 09                	je     0x14036fd71
   14036fd68:	f6 81 c0 13 00 00 01 	test   BYTE PTR [rcx+0x13c0],0x1
   14036fd6f:	75 4b                	jne    0x14036fdbc
   14036fd71:	8b 91 94 1d 00 00    	mov    edx,DWORD PTR [rcx+0x1d94]
   14036fd77:	83 fa ff             	cmp    edx,0xffffffff
   14036fd7a:	74 40                	je     0x14036fdbc
   14036fd7c:	0f b7 81 c0 13 00 00 	movzx  eax,WORD PTR [rcx+0x13c0]
   14036fd83:	41 bd 00 80 00 00    	mov    r13d,0x8000
   14036fd89:	66 41 33 84 37 04 ae 	xor    ax,WORD PTR [r15+rsi*1-0x451fc]
   14036fd90:	fb ff 
   14036fd92:	66 41 85 c5          	test   r13w,ax
   14036fd96:	44 8b ac 24 a0 00 00 	mov    r13d,DWORD PTR [rsp+0xa0]
   14036fd9d:	00 
   14036fd9e:	75 1c                	jne    0x14036fdbc
   14036fda0:	0f 57 c9             	xorps  xmm1,xmm1
   14036fda3:	0f 57 c0             	xorps  xmm0,xmm0
   14036fda6:	f2 48 0f 2a ca       	cvtsi2sd xmm1,rdx
   14036fdab:	f2 49 0f 2a c6       	cvtsi2sd xmm0,r14
   14036fdb0:	66 0f 2e c8          	ucomisd xmm1,xmm0
   14036fdb4:	7a 06                	jp     0x14036fdbc
   14036fdb6:	0f 84 78 01 00 00    	je     0x14036ff34
   14036fdbc:	41 ff c1             	inc    r9d
   14036fdbf:	4c 3b db             	cmp    r11,rbx
   14036fdc2:	75 09                	jne    0x14036fdcd
   14036fdc4:	49 8d 42 01          	lea    rax,[r10+0x1]
   14036fdc8:	48 3b c7             	cmp    rax,rdi
   14036fdcb:	74 09                	je     0x14036fdd6
   14036fdcd:	f6 81 a0 1d 00 00 01 	test   BYTE PTR [rcx+0x1da0],0x1
   14036fdd4:	75 4b                	jne    0x14036fe21
   14036fdd6:	8b 91 74 27 00 00    	mov    edx,DWORD PTR [rcx+0x2774]
   14036fddc:	83 fa ff             	cmp    edx,0xffffffff
   14036fddf:	74 40                	je     0x14036fe21
   14036fde1:	0f b7 81 a0 1d 00 00 	movzx  eax,WORD PTR [rcx+0x1da0]
   14036fde8:	41 bd 00 80 00 00    	mov    r13d,0x8000
   14036fdee:	66 41 33 84 37 04 ae 	xor    ax,WORD PTR [r15+rsi*1-0x451fc]
   14036fdf5:	fb ff 
   14036fdf7:	66 41 85 c5          	test   r13w,ax
   14036fdfb:	44 8b ac 24 a0 00 00 	mov    r13d,DWORD PTR [rsp+0xa0]
   14036fe02:	00 
   14036fe03:	75 1c                	jne    0x14036fe21
   14036fe05:	0f 57 c9             	xorps  xmm1,xmm1
   14036fe08:	0f 57 c0             	xorps  xmm0,xmm0
   14036fe0b:	f2 48 0f 2a ca       	cvtsi2sd xmm1,rdx
   14036fe10:	f2 49 0f 2a c6       	cvtsi2sd xmm0,r14
   14036fe15:	66 0f 2e c8          	ucomisd xmm1,xmm0
   14036fe19:	7a 06                	jp     0x14036fe21
   14036fe1b:	0f 84 19 01 00 00    	je     0x14036ff3a
   14036fe21:	41 ff c1             	inc    r9d
   14036fe24:	48 8d 45 fd          	lea    rax,[rbp-0x3]
   14036fe28:	49 83 c0 04          	add    r8,0x4
   14036fe2c:	49 83 c2 04          	add    r10,0x4
   14036fe30:	48 81 c1 80 27 00 00 	add    rcx,0x2780
   14036fe37:	4c 3b c0             	cmp    r8,rax
   14036fe3a:	0f 8c 60 fe ff ff    	jl     0x14036fca0
   14036fe40:	4c 8b 54 24 30       	mov    r10,QWORD PTR [rsp+0x30]
   14036fe45:	4c 3b c5             	cmp    r8,rbp
   14036fe48:	7d 75                	jge    0x14036febf
   14036fe4a:	49 69 c0 e0 09 00 00 	imul   rax,r8,0x9e0
   14036fe51:	49 8d 4a 04          	lea    rcx,[r10+0x4]
   14036fe55:	41 bd 00 80 00 00    	mov    r13d,0x8000
   14036fe5b:	49 03 c4             	add    rax,r12
   14036fe5e:	48 03 c8             	add    rcx,rax
   14036fe61:	4c 3b db             	cmp    r11,rbx
   14036fe64:	75 05                	jne    0x14036fe6b
   14036fe66:	4c 3b c7             	cmp    r8,rdi
   14036fe69:	74 05                	je     0x14036fe70
   14036fe6b:	f6 01 01             	test   BYTE PTR [rcx],0x1
   14036fe6e:	75 35                	jne    0x14036fea5
   14036fe70:	8b 91 d4 09 00 00    	mov    edx,DWORD PTR [rcx+0x9d4]
   14036fe76:	83 fa ff             	cmp    edx,0xffffffff
   14036fe79:	74 2a                	je     0x14036fea5
   14036fe7b:	0f b7 01             	movzx  eax,WORD PTR [rcx]
   14036fe7e:	66 41 33 84 37 04 ae 	xor    ax,WORD PTR [r15+rsi*1-0x451fc]
   14036fe85:	fb ff 
   14036fe87:	66 41 85 c5          	test   r13w,ax
   14036fe8b:	75 18                	jne    0x14036fea5
   14036fe8d:	0f 57 c9             	xorps  xmm1,xmm1
   14036fe90:	0f 57 c0             	xorps  xmm0,xmm0
   14036fe93:	f2 48 0f 2a ca       	cvtsi2sd xmm1,rdx
   14036fe98:	f2 49 0f 2a c6       	cvtsi2sd xmm0,r14
   14036fe9d:	66 0f 2e c8          	ucomisd xmm1,xmm0
   14036fea1:	7a 02                	jp     0x14036fea5
   14036fea3:	74 12                	je     0x14036feb7
   14036fea5:	41 ff c1             	inc    r9d
   14036fea8:	49 ff c0             	inc    r8
   14036feab:	48 81 c1 e0 09 00 00 	add    rcx,0x9e0
   14036feb2:	4c 3b c5             	cmp    r8,rbp
   14036feb5:	7c aa                	jl     0x14036fe61
   14036feb7:	44 8b ac 24 a0 00 00 	mov    r13d,DWORD PTR [rsp+0xa0]
   14036febe:	00 
   14036febf:	44 3b cd             	cmp    r9d,ebp
   14036fec2:	0f 8d 22 01 00 00    	jge    0x14036ffea
   14036fec8:	48 8b ac 24 b0 00 00 	mov    rbp,QWORD PTR [rsp+0xb0]
   14036fecf:	00 
   14036fed0:	8b 84 24 b8 00 00 00 	mov    eax,DWORD PTR [rsp+0xb8]
   14036fed7:	39 45 00             	cmp    DWORD PTR [rbp+0x0],eax
   14036feda:	0f 83 0a 01 00 00    	jae    0x14036ffea
   14036fee0:	4c 3b db             	cmp    r11,rbx
   14036fee3:	75 05                	jne    0x14036feea
   14036fee5:	4c 3b c7             	cmp    r8,rdi
   14036fee8:	74 59                	je     0x14036ff43
   14036feea:	4c 8b 54 24 30       	mov    r10,QWORD PTR [rsp+0x30]
   14036feef:	49 69 c0 e0 09 00 00 	imul   rax,r8,0x9e0
   14036fef6:	49 03 c4             	add    rax,r12
   14036fef9:	66 42 83 4c 10 04 01 	or     WORD PTR [rax+r10*1+0x4],0x1
   14036ff00:	49 63 c5             	movsxd rax,r13d
   14036ff03:	48 69 c8 08 52 04 00 	imul   rcx,rax,0x45208
   14036ff0a:	49 63 c1             	movsxd rax,r9d
   14036ff0d:	48 69 d0 e0 09 00 00 	imul   rdx,rax,0x9e0
   14036ff14:	49 8d 04 0a          	lea    rax,[r10+rcx*1]
   14036ff18:	48 8b 8c 24 a8 00 00 	mov    rcx,QWORD PTR [rsp+0xa8]
   14036ff1f:	00 
   14036ff20:	48 03 d0             	add    rdx,rax
   14036ff23:	8b 45 00             	mov    eax,DWORD PTR [rbp+0x0]
   14036ff26:	48 89 14 c1          	mov    QWORD PTR [rcx+rax*8],rdx
   14036ff2a:	ff 45 00             	inc    DWORD PTR [rbp+0x0]
   14036ff2d:	eb 19                	jmp    0x14036ff48
   14036ff2f:	49 ff c0             	inc    r8
   14036ff32:	eb 8b                	jmp    0x14036febf
   14036ff34:	49 83 c0 02          	add    r8,0x2
   14036ff38:	eb 85                	jmp    0x14036febf
   14036ff3a:	49 83 c0 03          	add    r8,0x3
   14036ff3e:	e9 7c ff ff ff       	jmp    0x14036febf
   14036ff43:	4c 8b 54 24 30       	mov    r10,QWORD PTR [rsp+0x30]
   14036ff48:	8b 6c 24 28          	mov    ebp,DWORD PTR [rsp+0x28]
   14036ff4c:	8d 45 ff             	lea    eax,[rbp-0x1]
   14036ff4f:	44 3b e8             	cmp    r13d,eax
   14036ff52:	0f 84 92 00 00 00    	je     0x14036ffea
   14036ff58:	41 ff c5             	inc    r13d
   14036ff5b:	49 ff c3             	inc    r11
   14036ff5e:	49 81 c4 08 52 04 00 	add    r12,0x45208
   14036ff65:	44 89 ac 24 a0 00 00 	mov    DWORD PTR [rsp+0xa0],r13d
   14036ff6c:	00 
   14036ff6d:	44 3b ed             	cmp    r13d,ebp
   14036ff70:	0f 8c fa fc ff ff    	jl     0x14036fc70
   14036ff76:	4c 8b b4 24 b0 00 00 	mov    r14,QWORD PTR [rsp+0xb0]
   14036ff7d:	00 
   14036ff7e:	8b 4c 24 24          	mov    ecx,DWORD PTR [rsp+0x24]
   14036ff82:	4c 8b 4c 24 38       	mov    r9,QWORD PTR [rsp+0x38]
   14036ff87:	44 8b 7c 24 20       	mov    r15d,DWORD PTR [rsp+0x20]
   14036ff8c:	4c 8b 64 24 40       	mov    r12,QWORD PTR [rsp+0x40]
   14036ff91:	41 0f b6 01          	movzx  eax,BYTE PTR [r9]
   14036ff95:	ff c1                	inc    ecx
   14036ff97:	4c 8b 9c 24 a8 00 00 	mov    r11,QWORD PTR [rsp+0xa8]
   14036ff9e:	00 
   14036ff9f:	48 ff c7             	inc    rdi
   14036ffa2:	48 81 c6 e0 09 00 00 	add    rsi,0x9e0
   14036ffa9:	89 4c 24 24          	mov    DWORD PTR [rsp+0x24],ecx
   14036ffad:	3b c8                	cmp    ecx,eax
   14036ffaf:	0f 8c 4b fc ff ff    	jl     0x14036fc00
   14036ffb5:	41 ff c7             	inc    r15d
   14036ffb8:	49 81 c1 08 52 04 00 	add    r9,0x45208
   14036ffbf:	49 81 ec 08 52 04 00 	sub    r12,0x45208
   14036ffc6:	44 89 7c 24 20       	mov    DWORD PTR [rsp+0x20],r15d
   14036ffcb:	48 ff c3             	inc    rbx
   14036ffce:	4c 89 4c 24 38       	mov    QWORD PTR [rsp+0x38],r9
   14036ffd3:	4c 89 64 24 40       	mov    QWORD PTR [rsp+0x40],r12
   14036ffd8:	44 3b fd             	cmp    r15d,ebp
   14036ffdb:	7d 1d                	jge    0x14036fffa
   14036ffdd:	4c 8b 9c 24 a8 00 00 	mov    r11,QWORD PTR [rsp+0xa8]
   14036ffe4:	00 
   14036ffe5:	e9 f6 fb ff ff       	jmp    0x14036fbe0
   14036ffea:	48 8b 8c 24 c0 00 00 	mov    rcx,QWORD PTR [rsp+0xc0]
   14036fff1:	00 
   14036fff2:	8b 44 24 20          	mov    eax,DWORD PTR [rsp+0x20]
   14036fff6:	89 01                	mov    DWORD PTR [rcx],eax
   14036fff8:	eb 10                	jmp    0x14037000a
   14036fffa:	48 8b 8c 24 c0 00 00 	mov    rcx,QWORD PTR [rsp+0xc0]
   140370001:	00 
   140370002:	44 89 39             	mov    DWORD PTR [rcx],r15d
   140370005:	b8 ff ff ff ff       	mov    eax,0xffffffff
   14037000a:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   14037000f:	4c 8b 64 24 60       	mov    r12,QWORD PTR [rsp+0x60]
   140370014:	48 8b 7c 24 68       	mov    rdi,QWORD PTR [rsp+0x68]
   140370019:	48 8b 74 24 70       	mov    rsi,QWORD PTR [rsp+0x70]
   14037001e:	48 83 c4 78          	add    rsp,0x78
   140370022:	41 5f                	pop    r15
   140370024:	41 5e                	pop    r14
   140370026:	5d                   	pop    rbp
   140370027:	5b                   	pop    rbx
   140370028:	c3                   	ret
   140370029:	cc                   	int3
   14037002a:	cc                   	int3
   14037002b:	cc                   	int3
   14037002c:	cc                   	int3
   14037002d:	cc                   	int3
   14037002e:	cc                   	int3
   14037002f:	cc                   	int3
   140370030:	33 c0                	xor    eax,eax
   140370032:	45 33 c9             	xor    r9d,r9d
   140370035:	4c 8b c1             	mov    r8,rcx
   140370038:	85 d2                	test   edx,edx
   14037003a:	7e 29                	jle    0x140370065
   14037003c:	8b d2                	mov    edx,edx
   14037003e:	66 90                	xchg   ax,ax
   140370040:	49 83 38 00          	cmp    QWORD PTR [r8],0x0
   140370044:	74 10                	je     0x140370056
   140370046:	ff c0                	inc    eax
   140370048:	41 3b c1             	cmp    eax,r9d
   14037004b:	8b c8                	mov    ecx,eax
   14037004d:	41 0f 46 c9          	cmovbe ecx,r9d
   140370051:	44 8b c9             	mov    r9d,ecx
   140370054:	eb 02                	jmp    0x140370058
   140370056:	33 c0                	xor    eax,eax
   140370058:	49 83 c0 08          	add    r8,0x8
   14037005c:	48 83 ea 01          	sub    rdx,0x1
   140370060:	75 de                	jne    0x140370040
   140370062:	41 8b c1             	mov    eax,r9d
   140370065:	c3                   	ret
   140370066:	cc                   	int3
   140370067:	cc                   	int3
   140370068:	cc                   	int3
   140370069:	cc                   	int3
   14037006a:	cc                   	int3
   14037006b:	cc                   	int3
   14037006c:	cc                   	int3
   14037006d:	cc                   	int3
   14037006e:	cc                   	int3
   14037006f:	cc                   	int3
