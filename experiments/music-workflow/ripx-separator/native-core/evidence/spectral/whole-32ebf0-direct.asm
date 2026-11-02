
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032ebf0 <.text+0x32dbf0>:
   14032ebf0:	48 83 ec 18          	sub    rsp,0x18
   14032ebf4:	0f b7 81 70 06 00 00 	movzx  eax,WORD PTR [rcx+0x670]
   14032ebfb:	45 33 db             	xor    r11d,r11d
   14032ebfe:	0f 29 34 24          	movaps XMMWORD PTR [rsp],xmm6
   14032ec02:	4c 8b d1             	mov    r10,rcx
   14032ec05:	48 89 7c 24 10       	mov    QWORD PTR [rsp+0x10],rdi
   14032ec0a:	41 0f b7 fb          	movzx  edi,r11w
   14032ec0e:	0f 57 f6             	xorps  xmm6,xmm6
   14032ec11:	66 44 3b d8          	cmp    r11w,ax
   14032ec15:	0f 83 10 01 00 00    	jae    0x14032ed2b
   14032ec1b:	f3 0f 10 2d 05 85 36 	movss  xmm5,DWORD PTR [rip+0x368505]        # 0x140697128
   14032ec22:	00 
   14032ec23:	0f b7 d0             	movzx  edx,ax
   14032ec26:	f3 0f 10 25 02 8e 37 	movss  xmm4,DWORD PTR [rip+0x378e02]        # 0x1406a7a30
   14032ec2d:	00 
   14032ec2e:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx
   14032ec33:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032ec37:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14032ec3e:	00 00 
   14032ec40:	49 8b 82 68 06 00 00 	mov    rax,QWORD PTR [r10+0x668]
   14032ec47:	0f b7 cf             	movzx  ecx,di
   14032ec4a:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   14032ec4e:	0f b7 c2             	movzx  eax,dx
   14032ec51:	48 69 d9 94 0d 00 00 	imul   rbx,rcx,0xd94
   14032ec58:	49 03 9a 60 06 00 00 	add    rbx,QWORD PTR [r10+0x660]
   14032ec5f:	f3 0f 10 03          	movss  xmm0,DWORD PTR [rbx]
   14032ec63:	0f 2e c6             	ucomiss xmm0,xmm6
   14032ec66:	7a 06                	jp     0x14032ec6e
   14032ec68:	0f 84 a9 00 00 00    	je     0x14032ed17
   14032ec6e:	44 8d 4f 01          	lea    r9d,[rdi+0x1]
   14032ec72:	0f b7 c2             	movzx  eax,dx
   14032ec75:	66 44 3b ca          	cmp    r9w,dx
   14032ec79:	0f 83 98 00 00 00    	jae    0x14032ed17
   14032ec7f:	90                   	nop
   14032ec80:	49 8b 82 68 06 00 00 	mov    rax,QWORD PTR [r10+0x668]
   14032ec87:	41 0f b7 c9          	movzx  ecx,r9w
   14032ec8b:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   14032ec8f:	4c 69 c1 94 0d 00 00 	imul   r8,rcx,0xd94
   14032ec96:	4d 03 82 60 06 00 00 	add    r8,QWORD PTR [r10+0x660]
   14032ec9d:	f3 41 0f 10 18       	movss  xmm3,DWORD PTR [r8]
   14032eca2:	0f 2e de             	ucomiss xmm3,xmm6
   14032eca5:	7a 02                	jp     0x14032eca9
   14032eca7:	74 58                	je     0x14032ed01
   14032eca9:	41 0f bf 88 90 0d 00 	movsx  ecx,WORD PTR [r8+0xd90]
   14032ecb0:	00 
   14032ecb1:	0f bf 83 90 0d 00 00 	movsx  eax,WORD PTR [rbx+0xd90]
   14032ecb8:	2b c1                	sub    eax,ecx
   14032ecba:	99                   	cdq
   14032ecbb:	33 c2                	xor    eax,edx
   14032ecbd:	2b c2                	sub    eax,edx
   14032ecbf:	3d 00 70 00 00       	cmp    eax,0x7000
   14032ecc4:	7f 3b                	jg     0x14032ed01
   14032ecc6:	f3 41 0f 10 40 18    	movss  xmm0,DWORD PTR [r8+0x18]
   14032eccc:	f3 0f 10 4b 18       	movss  xmm1,DWORD PTR [rbx+0x18]
   14032ecd1:	0f 2f c1             	comiss xmm0,xmm1
   14032ecd4:	f3 0f 10 13          	movss  xmm2,DWORD PTR [rbx]
   14032ecd8:	76 12                	jbe    0x14032ecec
   14032ecda:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032ecde:	0f 2f e8             	comiss xmm5,xmm0
   14032ece1:	77 1b                	ja     0x14032ecfe
   14032ece3:	f3 0f 5c da          	subss  xmm3,xmm2
   14032ece7:	0f 2f e3             	comiss xmm4,xmm3
   14032ecea:	eb 10                	jmp    0x14032ecfc
   14032ecec:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032ecf0:	0f 2f e9             	comiss xmm5,xmm1
   14032ecf3:	77 09                	ja     0x14032ecfe
   14032ecf5:	f3 0f 5c d3          	subss  xmm2,xmm3
   14032ecf9:	0f 2f e2             	comiss xmm4,xmm2
   14032ecfc:	76 03                	jbe    0x14032ed01
   14032ecfe:	45 89 18             	mov    DWORD PTR [r8],r11d
   14032ed01:	41 0f b7 82 70 06 00 	movzx  eax,WORD PTR [r10+0x670]
   14032ed08:	00 
   14032ed09:	66 41 ff c1          	inc    r9w
   14032ed0d:	66 44 3b c8          	cmp    r9w,ax
   14032ed11:	0f 82 69 ff ff ff    	jb     0x14032ec80
   14032ed17:	66 ff c7             	inc    di
   14032ed1a:	0f b7 d0             	movzx  edx,ax
   14032ed1d:	66 3b f8             	cmp    di,ax
   14032ed20:	0f 82 1a ff ff ff    	jb     0x14032ec40
   14032ed26:	48 8b 5c 24 20       	mov    rbx,QWORD PTR [rsp+0x20]
   14032ed2b:	48 8b 7c 24 10       	mov    rdi,QWORD PTR [rsp+0x10]
   14032ed30:	41 0f b7 cb          	movzx  ecx,r11w
   14032ed34:	66 44 3b d8          	cmp    r11w,ax
   14032ed38:	73 53                	jae    0x14032ed8d
   14032ed3a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14032ed40:	4d 8b 82 68 06 00 00 	mov    r8,QWORD PTR [r10+0x668]
   14032ed47:	0f b7 c1             	movzx  eax,cx
   14032ed4a:	45 0f b7 0c 40       	movzx  r9d,WORD PTR [r8+rax*2]
   14032ed4f:	49 69 d1 94 0d 00 00 	imul   rdx,r9,0xd94
   14032ed56:	49 03 92 60 06 00 00 	add    rdx,QWORD PTR [r10+0x660]
   14032ed5d:	45 85 db             	test   r11d,r11d
   14032ed60:	74 0d                	je     0x14032ed6f
   14032ed62:	0f b7 c1             	movzx  eax,cx
   14032ed65:	41 2b c3             	sub    eax,r11d
   14032ed68:	48 98                	cdqe
   14032ed6a:	66 45 89 0c 40       	mov    WORD PTR [r8+rax*2],r9w
   14032ed6f:	f3 0f 10 02          	movss  xmm0,DWORD PTR [rdx]
   14032ed73:	0f 2e c6             	ucomiss xmm0,xmm6
   14032ed76:	7a 05                	jp     0x14032ed7d
   14032ed78:	75 03                	jne    0x14032ed7d
   14032ed7a:	41 ff c3             	inc    r11d
   14032ed7d:	41 0f b7 82 70 06 00 	movzx  eax,WORD PTR [r10+0x670]
   14032ed84:	00 
   14032ed85:	66 ff c1             	inc    cx
   14032ed88:	66 3b c8             	cmp    cx,ax
   14032ed8b:	72 b3                	jb     0x14032ed40
   14032ed8d:	0f 28 34 24          	movaps xmm6,XMMWORD PTR [rsp]
   14032ed91:	66 41 2b c3          	sub    ax,r11w
   14032ed95:	66 41 89 82 70 06 00 	mov    WORD PTR [r10+0x670],ax
   14032ed9c:	00 
   14032ed9d:	48 83 c4 18          	add    rsp,0x18
   14032eda1:	c3                   	ret
   14032eda2:	cc                   	int3
   14032eda3:	cc                   	int3
   14032eda4:	cc                   	int3
   14032eda5:	cc                   	int3
   14032eda6:	cc                   	int3
   14032eda7:	cc                   	int3
   14032eda8:	cc                   	int3
   14032eda9:	cc                   	int3
   14032edaa:	cc                   	int3
   14032edab:	cc                   	int3
   14032edac:	cc                   	int3
   14032edad:	cc                   	int3
   14032edae:	cc                   	int3
   14032edaf:	cc                   	int3
   14032edb0:	40 55                	rex push rbp
   14032edb2:	53                   	push   rbx
   14032edb3:	56                   	push   rsi
   14032edb4:	41 55                	push   r13
   14032edb6:	41 56                	push   r14
   14032edb8:	41 57                	push   r15
   14032edba:	48 8d ac 24 d8 b3 ff 	lea    rbp,[rsp-0x4c28]
   14032edc1:	ff 
   14032edc2:	b8 28 4d 00 00       	mov    eax,0x4d28
   14032edc7:	e8 74 cf 2e 00       	call   0x14061bd40
   14032edcc:	48 2b e0             	sub    rsp,rax
   14032edcf:	48 8b 05 92 33 64 00 	mov    rax,QWORD PTR [rip+0x643392]        # 0x140972168
   14032edd6:	48 33 c4             	xor    rax,rsp
   14032edd9:	48 89 85 70 4b 00 00 	mov    QWORD PTR [rbp+0x4b70],rax
   14032ede0:	4c 8b ba 90 06 00 00 	mov    r15,QWORD PTR [rdx+0x690]
   14032ede7:	4c 8d 95 48 49 00 00 	lea    r10,[rbp+0x4948]
   14032edee:	41 b9 02 00 00 00    	mov    r9d,0x2
   14032edf4:	4c 89 7c 24 70       	mov    QWORD PTR [rsp+0x70],r15
   14032edf9:	48 8b f2             	mov    rsi,rdx
   14032edfc:	48 89 54 24 68       	mov    QWORD PTR [rsp+0x68],rdx
   14032ee01:	4c 8b f1             	mov    r14,rcx
   14032ee04:	48 89 4c 24 60       	mov    QWORD PTR [rsp+0x60],rcx
   14032ee09:	45 33 ff             	xor    r15d,r15d
   14032ee0c:	41 8d 59 15          	lea    ebx,[r9+0x15]
   14032ee10:	45 8d 69 ff          	lea    r13d,[r9-0x1]
   14032ee14:	41 8b c1             	mov    eax,r9d
   14032ee17:	49 8b cf             	mov    rcx,r15
   14032ee1a:	99                   	cdq
   14032ee1b:	2b c2                	sub    eax,edx
   14032ee1d:	d1 f8                	sar    eax,1
   14032ee1f:	4c 63 d8             	movsxd r11,eax
   14032ee22:	85 c0                	test   eax,eax
   14032ee24:	7e 20                	jle    0x14032ee46
   14032ee26:	45 8b c5             	mov    r8d,r13d
   14032ee29:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14032ee30:	41 8b c1             	mov    eax,r9d
   14032ee33:	99                   	cdq
   14032ee34:	41 f7 f8             	idiv   r8d
   14032ee37:	41 ff c0             	inc    r8d
   14032ee3a:	42 88 14 11          	mov    BYTE PTR [rcx+r10*1],dl
   14032ee3e:	48 ff c1             	inc    rcx
   14032ee41:	49 3b cb             	cmp    rcx,r11
   14032ee44:	7c ea                	jl     0x14032ee30
   14032ee46:	41 ff c1             	inc    r9d
   14032ee49:	49 83 c2 18          	add    r10,0x18
   14032ee4d:	49 2b dd             	sub    rbx,r13
   14032ee50:	75 c2                	jne    0x14032ee14
   14032ee52:	0f b7 8e 70 06 00 00 	movzx  ecx,WORD PTR [rsi+0x670]
   14032ee59:	4c 8b 7c 24 70       	mov    r15,QWORD PTR [rsp+0x70]
   14032ee5e:	49 2b cd             	sub    rcx,r13
   14032ee61:	48 89 4d 80          	mov    QWORD PTR [rbp-0x80],rcx
   14032ee65:	0f 88 94 10 00 00    	js     0x14032feff
   14032ee6b:	48 89 bc 24 70 4d 00 	mov    QWORD PTR [rsp+0x4d70],rdi
   14032ee72:	00 
   14032ee73:	4c 8d 8e 98 86 04 00 	lea    r9,[rsi+0x48698]
   14032ee7a:	4c 89 a4 24 20 4d 00 	mov    QWORD PTR [rsp+0x4d20],r12
   14032ee81:	00 
   14032ee82:	4c 8d a6 9a 86 04 00 	lea    r12,[rsi+0x4869a]
   14032ee89:	0f 29 b4 24 10 4d 00 	movaps XMMWORD PTR [rsp+0x4d10],xmm6
   14032ee90:	00 
   14032ee91:	f3 0f 10 35 1f 8c 37 	movss  xmm6,DWORD PTR [rip+0x378c1f]        # 0x1406a7ab8
   14032ee98:	00 
   14032ee99:	0f 29 bc 24 00 4d 00 	movaps XMMWORD PTR [rsp+0x4d00],xmm7
   14032eea0:	00 
   14032eea1:	f3 0f 10 3d 87 11 52 	movss  xmm7,DWORD PTR [rip+0x521187]        # 0x140850030
   14032eea8:	00 
   14032eea9:	44 0f 29 84 24 f0 4c 	movaps XMMWORD PTR [rsp+0x4cf0],xmm8
   14032eeb0:	00 00 
   14032eeb2:	44 0f 29 8c 24 e0 4c 	movaps XMMWORD PTR [rsp+0x4ce0],xmm9
   14032eeb9:	00 00 
   14032eebb:	45 0f 57 c9          	xorps  xmm9,xmm9
   14032eebf:	44 0f 29 94 24 d0 4c 	movaps XMMWORD PTR [rsp+0x4cd0],xmm10
   14032eec6:	00 00 
   14032eec8:	44 0f 29 9c 24 c0 4c 	movaps XMMWORD PTR [rsp+0x4cc0],xmm11
   14032eecf:	00 00 
   14032eed1:	f3 44 0f 10 1d b2 f2 	movss  xmm11,DWORD PTR [rip+0x35f2b2]        # 0x14068e18c
   14032eed8:	35 00 
   14032eeda:	44 0f 29 a4 24 b0 4c 	movaps XMMWORD PTR [rsp+0x4cb0],xmm12
   14032eee1:	00 00 
   14032eee3:	f3 44 0f 10 25 64 8b 	movss  xmm12,DWORD PTR [rip+0x378b64]        # 0x1406a7a50
   14032eeea:	37 00 
   14032eeec:	44 0f 29 ac 24 a0 4c 	movaps XMMWORD PTR [rsp+0x4ca0],xmm13
   14032eef3:	00 00 
   14032eef5:	f2 44 0f 10 2d 7a 12 	movsd  xmm13,QWORD PTR [rip+0x52127a]        # 0x140850178
   14032eefc:	52 00 
   14032eefe:	44 0f 29 b4 24 90 4c 	movaps XMMWORD PTR [rsp+0x4c90],xmm14
   14032ef05:	00 00 
   14032ef07:	f3 44 0f 10 35 cc 10 	movss  xmm14,DWORD PTR [rip+0x5210cc]        # 0x14084ffdc
   14032ef0e:	52 00 
   14032ef10:	44 0f 29 bc 24 80 4c 	movaps XMMWORD PTR [rsp+0x4c80],xmm15
   14032ef17:	00 00 
   14032ef19:	f3 44 0f 10 3d 6a 9d 	movss  xmm15,DWORD PTR [rip+0x369d6a]        # 0x140698c8c
   14032ef20:	36 00 
   14032ef22:	48 8b 86 68 06 00 00 	mov    rax,QWORD PTR [rsi+0x668]
   14032ef29:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   14032ef2d:	48 69 f9 94 0d 00 00 	imul   rdi,rcx,0xd94
   14032ef34:	48 03 be 60 06 00 00 	add    rdi,QWORD PTR [rsi+0x660]
   14032ef3b:	48 89 7c 24 40       	mov    QWORD PTR [rsp+0x40],rdi
   14032ef40:	0f b6 97 92 0d 00 00 	movzx  edx,BYTE PTR [rdi+0xd92]
   14032ef47:	89 54 24 3c          	mov    DWORD PTR [rsp+0x3c],edx
   14032ef4b:	8b da                	mov    ebx,edx
   14032ef4d:	83 fa 01             	cmp    edx,0x1
   14032ef50:	72 30                	jb     0x14032ef82
   14032ef52:	8d 4a ff             	lea    ecx,[rdx-0x1]
   14032ef55:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14032ef5c:	00 00 00 00 
   14032ef60:	48 63 c1             	movsxd rax,ecx
   14032ef63:	48 c1 e0 05          	shl    rax,0x5
   14032ef67:	f3 0f 10 44 38 14    	movss  xmm0,DWORD PTR [rax+rdi*1+0x14]
   14032ef6d:	41 0f 2e c1          	ucomiss xmm0,xmm9
   14032ef71:	7a 0b                	jp     0x14032ef7e
   14032ef73:	75 09                	jne    0x14032ef7e
   14032ef75:	ff cb                	dec    ebx
   14032ef77:	ff c9                	dec    ecx
   14032ef79:	83 fb 01             	cmp    ebx,0x1
   14032ef7c:	7d e2                	jge    0x14032ef60
   14032ef7e:	89 5c 24 3c          	mov    DWORD PTR [rsp+0x3c],ebx
   14032ef82:	41 80 be 95 00 00 00 	cmp    BYTE PTR [r14+0x95],0x0
   14032ef89:	00 
   14032ef8a:	45 0f 28 d1          	movaps xmm10,xmm9
   14032ef8e:	75 0e                	jne    0x14032ef9e
   14032ef90:	41 80 be 98 00 00 00 	cmp    BYTE PTR [r14+0x98],0x0
   14032ef97:	00 
   14032ef98:	0f 84 b3 00 00 00    	je     0x14032f051
   14032ef9e:	4d 8b c5             	mov    r8,r13
   14032efa1:	48 83 fa 01          	cmp    rdx,0x1
   14032efa5:	0f 86 a6 00 00 00    	jbe    0x14032f051
   14032efab:	41 0f 28 c1          	movaps xmm0,xmm9
   14032efaf:	48 83 fa 05          	cmp    rdx,0x5
   14032efb3:	72 69                	jb     0x14032f01e
   14032efb5:	48 8d 4a fb          	lea    rcx,[rdx-0x5]
   14032efb9:	41 0f 28 c9          	movaps xmm1,xmm9
   14032efbd:	48 c1 e9 02          	shr    rcx,0x2
   14032efc1:	48 8d 47 54          	lea    rax,[rdi+0x54]
   14032efc5:	48 ff c1             	inc    rcx
   14032efc8:	4c 8d 04 8d 01 00 00 	lea    r8,[rcx*4+0x1]
   14032efcf:	00 
   14032efd0:	f3 44 0f 10 50 e0    	movss  xmm10,DWORD PTR [rax-0x20]
   14032efd6:	44 0f 2f d1          	comiss xmm10,xmm1
   14032efda:	77 04                	ja     0x14032efe0
   14032efdc:	44 0f 28 d1          	movaps xmm10,xmm1
   14032efe0:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   14032efe4:	41 0f 2f c2          	comiss xmm0,xmm10
   14032efe8:	76 04                	jbe    0x14032efee
   14032efea:	44 0f 28 d0          	movaps xmm10,xmm0
   14032efee:	f3 0f 10 40 20       	movss  xmm0,DWORD PTR [rax+0x20]
   14032eff3:	41 0f 2f c2          	comiss xmm0,xmm10
   14032eff7:	76 04                	jbe    0x14032effd
   14032eff9:	44 0f 28 d0          	movaps xmm10,xmm0
   14032effd:	f3 0f 10 40 40       	movss  xmm0,DWORD PTR [rax+0x40]
   14032f002:	41 0f 2f c2          	comiss xmm0,xmm10
   14032f006:	76 04                	jbe    0x14032f00c
   14032f008:	44 0f 28 d0          	movaps xmm10,xmm0
   14032f00c:	48 83 e8 80          	sub    rax,0xffffffffffffff80
   14032f010:	41 0f 28 ca          	movaps xmm1,xmm10
   14032f014:	48 83 e9 01          	sub    rcx,0x1
   14032f018:	75 b6                	jne    0x14032efd0
   14032f01a:	41 0f 28 c2          	movaps xmm0,xmm10
   14032f01e:	4c 3b c2             	cmp    r8,rdx
   14032f021:	7d 2e                	jge    0x14032f051
   14032f023:	49 8b c0             	mov    rax,r8
   14032f026:	48 8d 4f 14          	lea    rcx,[rdi+0x14]
   14032f02a:	48 c1 e0 05          	shl    rax,0x5
   14032f02e:	48 03 c8             	add    rcx,rax
   14032f031:	49 2b d0             	sub    rdx,r8
   14032f034:	f3 44 0f 10 11       	movss  xmm10,DWORD PTR [rcx]
   14032f039:	44 0f 2f d0          	comiss xmm10,xmm0
   14032f03d:	77 04                	ja     0x14032f043
   14032f03f:	44 0f 28 d0          	movaps xmm10,xmm0
   14032f043:	48 83 c1 20          	add    rcx,0x20
   14032f047:	41 0f 28 c2          	movaps xmm0,xmm10
   14032f04b:	48 83 ea 01          	sub    rdx,0x1
   14032f04f:	75 e3                	jne    0x14032f034
   14032f051:	33 d2                	xor    edx,edx
   14032f053:	49 8b c9             	mov    rcx,r9
   14032f056:	44 8d 42 60          	lea    r8d,[rdx+0x60]
   14032f05a:	e8 8b 1c 2f 00       	call   0x140620cea
   14032f05f:	4d 8b d4             	mov    r10,r12
   14032f062:	4c 8d 85 48 49 00 00 	lea    r8,[rbp+0x4948]
   14032f069:	4c 8d 67 2c          	lea    r12,[rdi+0x2c]
   14032f06d:	41 b9 00 0c 00 00    	mov    r9d,0xc00
   14032f073:	b8 18 00 00 00       	mov    eax,0x18
   14032f078:	4c 89 64 24 58       	mov    QWORD PTR [rsp+0x58],r12
   14032f07d:	3b d8                	cmp    ebx,eax
   14032f07f:	4c 89 44 24 50       	mov    QWORD PTR [rsp+0x50],r8
   14032f084:	44 89 6c 24 34       	mov    DWORD PTR [rsp+0x34],r13d
   14032f089:	0f 4c c3             	cmovl  eax,ebx
   14032f08c:	44 3b e8             	cmp    r13d,eax
   14032f08f:	0f 8d 39 01 00 00    	jge    0x14032f1ce
   14032f095:	41 8b 04 24          	mov    eax,DWORD PTR [r12]
   14032f099:	85 c0                	test   eax,eax
   14032f09b:	0f 88 11 01 00 00    	js     0x14032f1b2
   14032f0a1:	69 c0 e0 01 00 00    	imul   eax,eax,0x1e0
   14032f0a7:	4d 8d 3c 47          	lea    r15,[r15+rax*2]
   14032f0ab:	33 c0                	xor    eax,eax
   14032f0ad:	8b f8                	mov    edi,eax
   14032f0af:	4c 89 7c 24 78       	mov    QWORD PTR [rsp+0x78],r15
   14032f0b4:	41 8d 45 01          	lea    eax,[r13+0x1]
   14032f0b8:	99                   	cdq
   14032f0b9:	2b c2                	sub    eax,edx
   14032f0bb:	d1 f8                	sar    eax,1
   14032f0bd:	89 44 24 48          	mov    DWORD PTR [rsp+0x48],eax
   14032f0c1:	44 8b f0             	mov    r14d,eax
   14032f0c4:	85 c0                	test   eax,eax
   14032f0c6:	0f 8e e1 00 00 00    	jle    0x14032f1ad
   14032f0cc:	49 8b f0             	mov    rsi,r8
   14032f0cf:	41 bc 00 0c 00 00    	mov    r12d,0xc00
   14032f0d5:	41 bd ff ff 00 00    	mov    r13d,0xffff
   14032f0db:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14032f0e0:	80 3e 00             	cmp    BYTE PTR [rsi],0x0
   14032f0e3:	0f 85 a3 00 00 00    	jne    0x14032f18c
   14032f0e9:	41 0f b7 02          	movzx  eax,WORD PTR [r10]
   14032f0ed:	8d 0c bf             	lea    ecx,[rdi+rdi*4]
   14032f0f0:	4c 8b 74 24 68       	mov    r14,QWORD PTR [rsp+0x68]
   14032f0f5:	03 c9                	add    ecx,ecx
   14032f0f7:	4d 8d 1c 4f          	lea    r11,[r15+rcx*2]
   14032f0fb:	45 33 ff             	xor    r15d,r15d
   14032f0fe:	41 8b df             	mov    ebx,r15d
   14032f101:	45 0f b7 03          	movzx  r8d,WORD PTR [r11]
   14032f105:	0f b7 c8             	movzx  ecx,ax
   14032f108:	66 45 3b c5          	cmp    r8w,r13w
   14032f10c:	74 6e                	je     0x14032f17c
   14032f10e:	41 0f b7 52 fe       	movzx  edx,WORD PTR [r10-0x2]
   14032f113:	41 0f b7 cf          	movzx  ecx,r15w
   14032f117:	66 44 3b fa          	cmp    r15w,dx
   14032f11b:	73 1c                	jae    0x14032f139
   14032f11d:	0f 1f 00             	nop    DWORD PTR [rax]
   14032f120:	0f b7 c1             	movzx  eax,cx
   14032f123:	49 03 c1             	add    rax,r9
   14032f126:	66 45 39 84 46 98 ee 	cmp    WORD PTR [r14+rax*2-0x1168],r8w
   14032f12d:	ff ff 
   14032f12f:	74 08                	je     0x14032f139
   14032f131:	66 ff c1             	inc    cx
   14032f134:	66 3b ca             	cmp    cx,dx
   14032f137:	72 e7                	jb     0x14032f120
   14032f139:	41 0f b7 12          	movzx  edx,WORD PTR [r10]
   14032f13d:	0f b7 c2             	movzx  eax,dx
   14032f140:	66 3b ca             	cmp    cx,dx
   14032f143:	72 29                	jb     0x14032f16e
   14032f145:	66 41 3b d4          	cmp    dx,r12w
   14032f149:	73 23                	jae    0x14032f16e
   14032f14b:	0f b7 c2             	movzx  eax,dx
   14032f14e:	49 03 c1             	add    rax,r9
   14032f151:	66 45 89 84 46 98 06 	mov    WORD PTR [r14+rax*2+0x698],r8w
   14032f158:	00 00 
   14032f15a:	41 0f b7 02          	movzx  eax,WORD PTR [r10]
   14032f15e:	66 ff c0             	inc    ax
   14032f161:	66 41 89 02          	mov    WORD PTR [r10],ax
   14032f165:	0f b7 c8             	movzx  ecx,ax
   14032f168:	66 41 3b c4          	cmp    ax,r12w
   14032f16c:	73 0e                	jae    0x14032f17c
   14032f16e:	ff c3                	inc    ebx
   14032f170:	49 83 c3 02          	add    r11,0x2
   14032f174:	0f b7 c8             	movzx  ecx,ax
   14032f177:	83 fb 0a             	cmp    ebx,0xa
   14032f17a:	72 85                	jb     0x14032f101
   14032f17c:	44 8b 74 24 48       	mov    r14d,DWORD PTR [rsp+0x48]
   14032f181:	4c 8b 7c 24 78       	mov    r15,QWORD PTR [rsp+0x78]
   14032f186:	66 41 3b cc          	cmp    cx,r12w
   14032f18a:	73 0e                	jae    0x14032f19a
   14032f18c:	ff c7                	inc    edi
   14032f18e:	48 ff c6             	inc    rsi
   14032f191:	41 3b fe             	cmp    edi,r14d
   14032f194:	0f 8c 46 ff ff ff    	jl     0x14032f0e0
   14032f19a:	44 8b 6c 24 34       	mov    r13d,DWORD PTR [rsp+0x34]
   14032f19f:	4c 8b 64 24 58       	mov    r12,QWORD PTR [rsp+0x58]
   14032f1a4:	4c 8b 44 24 50       	mov    r8,QWORD PTR [rsp+0x50]
   14032f1a9:	8b 5c 24 3c          	mov    ebx,DWORD PTR [rsp+0x3c]
   14032f1ad:	4c 8b 7c 24 70       	mov    r15,QWORD PTR [rsp+0x70]
   14032f1b2:	b8 00 0c 00 00       	mov    eax,0xc00
   14032f1b7:	41 ff c5             	inc    r13d
   14032f1ba:	4c 03 c8             	add    r9,rax
   14032f1bd:	49 83 c4 20          	add    r12,0x20
   14032f1c1:	49 83 c0 18          	add    r8,0x18
   14032f1c5:	49 83 c2 02          	add    r10,0x2
   14032f1c9:	e9 a5 fe ff ff       	jmp    0x14032f073
   14032f1ce:	32 c0                	xor    al,al
   14032f1d0:	8d 4b ff             	lea    ecx,[rbx-0x1]
   14032f1d3:	41 bd 17 00 00 00    	mov    r13d,0x17
   14032f1d9:	88 44 24 30          	mov    BYTE PTR [rsp+0x30],al
   14032f1dd:	41 3b cd             	cmp    ecx,r13d
   14032f1e0:	89 4c 24 34          	mov    DWORD PTR [rsp+0x34],ecx
   14032f1e4:	44 0f 4c e9          	cmovl  r13d,ecx
   14032f1e8:	44 89 6c 24 48       	mov    DWORD PTR [rsp+0x48],r13d
   14032f1ed:	41 83 fd 01          	cmp    r13d,0x1
   14032f1f1:	0f 8c 64 0c 00 00    	jl     0x14032fe5b
   14032f1f7:	f3 44 0f 10 05 ac af 	movss  xmm8,DWORD PTR [rip+0x65afac]        # 0x14098a1ac
   14032f1fe:	65 00 
   14032f200:	48 8b 74 24 68       	mov    rsi,QWORD PTR [rsp+0x68]
   14032f205:	48 63 c3             	movsxd rax,ebx
   14032f208:	4d 63 f5             	movsxd r14,r13d
   14032f20b:	48 8d 14 85 00 00 00 	lea    rdx,[rax*4+0x0]
   14032f212:	00 
   14032f213:	48 8d 3c c5 00 00 00 	lea    rdi,[rax*8+0x0]
   14032f21a:	00 
   14032f21b:	48 89 55 a0          	mov    QWORD PTR [rbp-0x60],rdx
   14032f21f:	48 89 7d 98          	mov    QWORD PTR [rbp-0x68],rdi
   14032f223:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032f227:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14032f22e:	00 00 
   14032f230:	4c 8b c2             	mov    r8,rdx
   14032f233:	49 63 dd             	movsxd rbx,r13d
   14032f236:	48 8d 8d 30 01 00 00 	lea    rcx,[rbp+0x130]
   14032f23d:	33 d2                	xor    edx,edx
   14032f23f:	48 8d 04 5b          	lea    rax,[rbx+rbx*2]
   14032f243:	48 c1 e0 06          	shl    rax,0x6
   14032f247:	48 03 c8             	add    rcx,rax
   14032f24a:	e8 9b 1a 2f 00       	call   0x140620cea
   14032f24f:	48 8d 04 5b          	lea    rax,[rbx+rbx*2]
   14032f253:	4c 8b c7             	mov    r8,rdi
   14032f256:	48 c1 e0 07          	shl    rax,0x7
   14032f25a:	48 8d 8d 30 25 00 00 	lea    rcx,[rbp+0x2530]
   14032f261:	48 03 c8             	add    rcx,rax
   14032f264:	33 d2                	xor    edx,edx
   14032f266:	e8 7f 1a 2f 00       	call   0x140620cea
   14032f26b:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   14032f270:	49 8b c6             	mov    rax,r14
   14032f273:	48 c1 e0 05          	shl    rax,0x5
   14032f277:	42 83 7c 10 0c 00    	cmp    DWORD PTR [rax+r10*1+0xc],0x0
   14032f27d:	0f 8c bf 04 00 00    	jl     0x14032f742
   14032f283:	46 0f b7 9c 76 98 86 	movzx  r11d,WORD PTR [rsi+r14*2+0x48698]
   14032f28a:	04 00 
   14032f28c:	33 db                	xor    ebx,ebx
   14032f28e:	66 89 5c 24 38       	mov    WORD PTR [rsp+0x38],bx
   14032f293:	44 0f b7 fb          	movzx  r15d,bx
   14032f297:	66 44 89 5c 24 3a    	mov    WORD PTR [rsp+0x3a],r11w
   14032f29d:	66 41 3b db          	cmp    bx,r11w
   14032f2a1:	0f 83 9b 04 00 00    	jae    0x14032f742
   14032f2a7:	45 0f b6 a2 92 0d 00 	movzx  r12d,BYTE PTR [r10+0xd92]
   14032f2ae:	00 
   14032f2af:	41 8d 75 01          	lea    esi,[r13+0x1]
   14032f2b3:	48 8b 7c 24 68       	mov    rdi,QWORD PTR [rsp+0x68]
   14032f2b8:	4f 8d 04 76          	lea    r8,[r14+r14*2]
   14032f2bc:	41 8b c4             	mov    eax,r12d
   14032f2bf:	49 c1 e0 0a          	shl    r8,0xa
   14032f2c3:	99                   	cdq
   14032f2c4:	4c 89 45 88          	mov    QWORD PTR [rbp-0x78],r8
   14032f2c8:	f7 fe                	idiv   esi
   14032f2ca:	48 8b 9f 68 06 00 00 	mov    rbx,QWORD PTR [rdi+0x668]
   14032f2d1:	44 8b c8             	mov    r9d,eax
   14032f2d4:	89 44 24 50          	mov    DWORD PTR [rsp+0x50],eax
   14032f2d8:	b8 30 00 00 00       	mov    eax,0x30
   14032f2dd:	48 89 5d 90          	mov    QWORD PTR [rbp-0x70],rbx
   14032f2e1:	99                   	cdq
   14032f2e2:	44 89 64 24 78       	mov    DWORD PTR [rsp+0x78],r12d
   14032f2e7:	f7 fe                	idiv   esi
   14032f2e9:	44 8b d0             	mov    r10d,eax
   14032f2ec:	89 44 24 58          	mov    DWORD PTR [rsp+0x58],eax
   14032f2f0:	41 0f b7 cf          	movzx  ecx,r15w
   14032f2f4:	41 8b c1             	mov    eax,r9d
   14032f2f7:	49 03 c8             	add    rcx,r8
   14032f2fa:	41 0f 28 d9          	movaps xmm3,xmm9
   14032f2fe:	41 0f 28 d1          	movaps xmm2,xmm9
   14032f302:	0f b7 8c 4f 98 06 00 	movzx  ecx,WORD PTR [rdi+rcx*2+0x698]
   14032f309:	00 
   14032f30a:	0f b7 14 4b          	movzx  edx,WORD PTR [rbx+rcx*2]
   14032f30e:	b9 01 00 00 00       	mov    ecx,0x1
   14032f313:	48 69 da 94 0d 00 00 	imul   rbx,rdx,0xd94
   14032f31a:	8b d1                	mov    edx,ecx
   14032f31c:	48 03 9f 60 06 00 00 	add    rbx,QWORD PTR [rdi+0x660]
   14032f323:	0f b6 bb 92 0d 00 00 	movzx  edi,BYTE PTR [rbx+0xd92]
   14032f32a:	41 3b f9             	cmp    edi,r9d
   14032f32d:	44 8b c9             	mov    r9d,ecx
   14032f330:	0f 4d c7             	cmovge eax,edi
   14032f333:	41 3b c2             	cmp    eax,r10d
   14032f336:	41 0f 4d c2          	cmovge eax,r10d
   14032f33a:	4c 63 d0             	movsxd r10,eax
   14032f33d:	49 3b ca             	cmp    rcx,r10
   14032f340:	0f 8d eb 00 00 00    	jge    0x14032f431
   14032f346:	4c 8b 5c 24 40       	mov    r11,QWORD PTR [rsp+0x40]
   14032f34b:	46 8d 04 6d 02 00 00 	lea    r8d,[r13*2+0x2]
   14032f352:	00 
   14032f353:	41 8d 40 ff          	lea    eax,[r8-0x1]
   14032f357:	41 3b c4             	cmp    eax,r12d
   14032f35a:	7d 21                	jge    0x14032f37d
   14032f35c:	49 63 c0             	movsxd rax,r8d
   14032f35f:	48 c1 e0 05          	shl    rax,0x5
   14032f363:	f3 42 0f 10 4c 18 04 	movss  xmm1,DWORD PTR [rax+r11*1+0x4]
   14032f36a:	f3 42 0f 10 44 18 f4 	movss  xmm0,DWORD PTR [rax+r11*1-0xc]
   14032f371:	0f 2f c1             	comiss xmm0,xmm1
   14032f374:	77 03                	ja     0x14032f379
   14032f376:	0f 28 c1             	movaps xmm0,xmm1
   14032f379:	f3 0f 58 d8          	addss  xmm3,xmm0
   14032f37d:	44 3b cf             	cmp    r9d,edi
   14032f380:	7d 5f                	jge    0x14032f3e1
   14032f382:	48 83 fa 02          	cmp    rdx,0x2
   14032f386:	75 3a                	jne    0x14032f3c2
   14032f388:	f3 0f 10 43 58       	movss  xmm0,DWORD PTR [rbx+0x58]
   14032f38d:	0f 2f c6             	comiss xmm0,xmm6
   14032f390:	76 30                	jbe    0x14032f3c2
   14032f392:	f3 0f 10 43 54       	movss  xmm0,DWORD PTR [rbx+0x54]
   14032f397:	48 8d 4b 54          	lea    rcx,[rbx+0x54]
   14032f39b:	0f 2f 43 64          	comiss xmm0,DWORD PTR [rbx+0x64]
   14032f39f:	48                   	rex.W
