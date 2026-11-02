
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032edb0 <.text+0x32ddb0>:
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
   14032f39f:	48 8d 43 64          	lea    rax,[rbx+0x64]
   14032f3a3:	f3 0f 10 43 44       	movss  xmm0,DWORD PTR [rbx+0x44]
   14032f3a8:	f3 0f 10 4b 34       	movss  xmm1,DWORD PTR [rbx+0x34]
   14032f3ad:	48 0f 46 c8          	cmovbe rcx,rax
   14032f3b1:	0f 2f c8             	comiss xmm1,xmm0
   14032f3b4:	77 03                	ja     0x14032f3b9
   14032f3b6:	0f 28 c8             	movaps xmm1,xmm0
   14032f3b9:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   14032f3bd:	0f 2f c8             	comiss xmm1,xmm0
   14032f3c0:	eb 16                	jmp    0x14032f3d8
   14032f3c2:	48 8b c2             	mov    rax,rdx
   14032f3c5:	48 c1 e0 05          	shl    rax,0x5
   14032f3c9:	f3 0f 10 4c 18 24    	movss  xmm1,DWORD PTR [rax+rbx*1+0x24]
   14032f3cf:	f3 0f 10 44 18 14    	movss  xmm0,DWORD PTR [rax+rbx*1+0x14]
   14032f3d5:	0f 2f c1             	comiss xmm0,xmm1
   14032f3d8:	77 03                	ja     0x14032f3dd
   14032f3da:	0f 28 c1             	movaps xmm0,xmm1
   14032f3dd:	f3 0f 58 d0          	addss  xmm2,xmm0
   14032f3e1:	41 ff c1             	inc    r9d
   14032f3e4:	44 03 c6             	add    r8d,esi
   14032f3e7:	48 ff c2             	inc    rdx
   14032f3ea:	49 3b d2             	cmp    rdx,r10
   14032f3ed:	0f 8c 60 ff ff ff    	jl     0x14032f353
   14032f3f3:	41 0f 2f d9          	comiss xmm3,xmm9
   14032f3f7:	76 2c                	jbe    0x14032f425
   14032f3f9:	f3 0f 5e d3          	divss  xmm2,xmm3
   14032f3fd:	f3 0f 5c d7          	subss  xmm2,xmm7
   14032f401:	0f 2f fa             	comiss xmm7,xmm2
   14032f404:	76 13                	jbe    0x14032f419
   14032f406:	41 0f 2f d1          	comiss xmm2,xmm9
   14032f40a:	77 10                	ja     0x14032f41c
   14032f40c:	41 0f 28 d1          	movaps xmm2,xmm9
   14032f410:	0f 57 c0             	xorps  xmm0,xmm0
   14032f413:	f3 0f 5a c2          	cvtss2sd xmm0,xmm2
   14032f417:	eb 1b                	jmp    0x14032f434
   14032f419:	0f 28 d7             	movaps xmm2,xmm7
   14032f41c:	0f 57 c0             	xorps  xmm0,xmm0
   14032f41f:	f3 0f 5a c2          	cvtss2sd xmm0,xmm2
   14032f423:	eb 0f                	jmp    0x14032f434
   14032f425:	41 0f 2f d1          	comiss xmm2,xmm9
   14032f429:	76 06                	jbe    0x14032f431
   14032f42b:	41 0f 28 c5          	movaps xmm0,xmm13
   14032f42f:	eb 03                	jmp    0x14032f434
   14032f431:	0f 57 c0             	xorps  xmm0,xmm0
   14032f434:	48 8b 44 24 60       	mov    rax,QWORD PTR [rsp+0x60]
   14032f439:	0f 57 f6             	xorps  xmm6,xmm6
   14032f43c:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14032f440:	80 b8 95 00 00 00 00 	cmp    BYTE PTR [rax+0x95],0x0
   14032f447:	75 09                	jne    0x14032f452
   14032f449:	80 b8 98 00 00 00 00 	cmp    BYTE PTR [rax+0x98],0x0
   14032f450:	74 28                	je     0x14032f47a
   14032f452:	41 83 fd 04          	cmp    r13d,0x4
   14032f456:	7c 22                	jl     0x14032f47a
   14032f458:	b9 f1 ff ff ff       	mov    ecx,0xfffffff1
   14032f45d:	e8 de 18 f7 ff       	call   0x1402a0d40
   14032f462:	48 8b 44 24 40       	mov    rax,QWORD PTR [rsp+0x40]
   14032f467:	f3 41 0f 59 c2       	mulss  xmm0,xmm10
   14032f46c:	f3 0f 10 48 14       	movss  xmm1,DWORD PTR [rax+0x14]
   14032f471:	0f 2f c8             	comiss xmm1,xmm0
   14032f474:	76 04                	jbe    0x14032f47a
   14032f476:	41 0f 28 f1          	movaps xmm6,xmm9
   14032f47a:	44 8b 5c 24 3c       	mov    r11d,DWORD PTR [rsp+0x3c]
   14032f47f:	4c 8d 4b 14          	lea    r9,[rbx+0x14]
   14032f483:	4c 8b 64 24 40       	mov    r12,QWORD PTR [rsp+0x40]
   14032f488:	33 c0                	xor    eax,eax
   14032f48a:	4c 8b 6c 24 60       	mov    r13,QWORD PTR [rsp+0x60]
   14032f48f:	44 8b d0             	mov    r10d,eax
   14032f492:	44 8b c6             	mov    r8d,esi
   14032f495:	41 bf 01 00 00 00    	mov    r15d,0x1
   14032f49b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14032f4a0:	41 8b cf             	mov    ecx,r15d
   14032f4a3:	40 3a f9             	cmp    dil,cl
   14032f4a6:	0f 42 cf             	cmovb  ecx,edi
   14032f4a9:	0f b6 c1             	movzx  eax,cl
   14032f4ac:	44 3b d0             	cmp    r10d,eax
   14032f4af:	0f 8d 3a 02 00 00    	jge    0x14032f6ef
   14032f4b5:	f3 41 0f 10 29       	movss  xmm5,DWORD PTR [r9]
   14032f4ba:	41 0f 2e e9          	ucomiss xmm5,xmm9
   14032f4be:	7a 06                	jp     0x14032f4c6
   14032f4c0:	0f 84 1a 02 00 00    	je     0x14032f6e0
   14032f4c6:	41 8d 40 ff          	lea    eax,[r8-0x1]
   14032f4ca:	41 3b c3             	cmp    eax,r11d
   14032f4cd:	0f 8d 1c 02 00 00    	jge    0x14032f6ef
   14032f4d3:	f3 41 0f 10 4c 24 04 	movss  xmm1,DWORD PTR [r12+0x4]
   14032f4da:	41 0f 2f c9          	comiss xmm1,xmm9
   14032f4de:	66 41 0f 6e d0       	movd   xmm2,r8d
   14032f4e3:	0f 5b d2             	cvtdq2ps xmm2,xmm2
   14032f4e6:	0f 28 c2             	movaps xmm0,xmm2
   14032f4e9:	f3 41 0f 59 04 24    	mulss  xmm0,DWORD PTR [r12]
   14032f4ef:	76 16                	jbe    0x14032f507
   14032f4f1:	f3 0f 59 d2          	mulss  xmm2,xmm2
   14032f4f5:	f3 0f 5c d7          	subss  xmm2,xmm7
   14032f4f9:	f3 0f 59 d1          	mulss  xmm2,xmm1
   14032f4fd:	f3 0f 58 d7          	addss  xmm2,xmm7
   14032f501:	f3 0f 59 d0          	mulss  xmm2,xmm0
   14032f505:	eb 03                	jmp    0x14032f50a
   14032f507:	0f 28 d0             	movaps xmm2,xmm0
   14032f50a:	f3 0f 10 4b 04       	movss  xmm1,DWORD PTR [rbx+0x4]
   14032f50f:	41 8d 42 01          	lea    eax,[r10+0x1]
   14032f513:	41 0f 2f c9          	comiss xmm1,xmm9
   14032f517:	66 0f 6e d8          	movd   xmm3,eax
   14032f51b:	0f 5b db             	cvtdq2ps xmm3,xmm3
   14032f51e:	0f 28 c3             	movaps xmm0,xmm3
   14032f521:	f3 0f 59 03          	mulss  xmm0,DWORD PTR [rbx]
   14032f525:	76 16                	jbe    0x14032f53d
   14032f527:	f3 0f 59 db          	mulss  xmm3,xmm3
   14032f52b:	f3 0f 5c df          	subss  xmm3,xmm7
   14032f52f:	f3 0f 59 d9          	mulss  xmm3,xmm1
   14032f533:	f3 0f 58 df          	addss  xmm3,xmm7
   14032f537:	f3 0f 59 d8          	mulss  xmm3,xmm0
   14032f53b:	eb 03                	jmp    0x14032f540
   14032f53d:	0f 28 d8             	movaps xmm3,xmm0
   14032f540:	f3 41 0f 10 49 04    	movss  xmm1,DWORD PTR [r9+0x4]
   14032f546:	49 63 d0             	movsxd rdx,r8d
   14032f549:	48 ff ca             	dec    rdx
   14032f54c:	48 8b c2             	mov    rax,rdx
   14032f54f:	48 c1 e0 05          	shl    rax,0x5
   14032f553:	f3 42 0f 10 44 20 18 	movss  xmm0,DWORD PTR [rax+r12*1+0x18]
   14032f55a:	41 0f b6 85 91 00 00 	movzx  eax,BYTE PTR [r13+0x91]
   14032f561:	00 
   14032f562:	84 c0                	test   al,al
   14032f564:	74 06                	je     0x14032f56c
   14032f566:	41 0f 28 e3          	movaps xmm4,xmm11
   14032f56a:	eb 04                	jmp    0x14032f570
   14032f56c:	41 0f 28 e4          	movaps xmm4,xmm12
   14032f570:	f3 0f 59 25 ec 84 37 	mulss  xmm4,DWORD PTR [rip+0x3784ec]        # 0x1406a7a64
   14032f577:	00 
   14032f578:	0f 2f e2             	comiss xmm4,xmm2
   14032f57b:	76 62                	jbe    0x14032f5df
   14032f57d:	0f 2f c1             	comiss xmm0,xmm1
   14032f580:	72 33                	jb     0x14032f5b5
   14032f582:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032f586:	84 c0                	test   al,al
   14032f588:	74 06                	je     0x14032f590
   14032f58a:	41 0f 28 cb          	movaps xmm1,xmm11
   14032f58e:	eb 04                	jmp    0x14032f594
   14032f590:	41 0f 28 cc          	movaps xmm1,xmm12
   14032f594:	f3 0f 5c d3          	subss  xmm2,xmm3
   14032f598:	f3 0f 5e d1          	divss  xmm2,xmm1
   14032f59c:	0f 2f d0             	comiss xmm2,xmm0
   14032f59f:	77 03                	ja     0x14032f5a4
   14032f5a1:	0f 28 c2             	movaps xmm0,xmm2
   14032f5a4:	0f 2f f8             	comiss xmm7,xmm0
   14032f5a7:	77 03                	ja     0x14032f5ac
   14032f5a9:	0f 28 c7             	movaps xmm0,xmm7
   14032f5ac:	0f 28 df             	movaps xmm3,xmm7
   14032f5af:	f3 0f 5c d8          	subss  xmm3,xmm0
   14032f5b3:	eb 65                	jmp    0x14032f61a
   14032f5b5:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032f5b9:	84 c0                	test   al,al
   14032f5bb:	74 11                	je     0x14032f5ce
   14032f5bd:	f3 0f 5c da          	subss  xmm3,xmm2
   14032f5c1:	41 0f 28 c3          	movaps xmm0,xmm11
   14032f5c5:	f3 0f 5e d8          	divss  xmm3,xmm0
   14032f5c9:	0f 2f d9             	comiss xmm3,xmm1
   14032f5cc:	eb 38                	jmp    0x14032f606
   14032f5ce:	f3 0f 5c da          	subss  xmm3,xmm2
   14032f5d2:	41 0f 28 c4          	movaps xmm0,xmm12
   14032f5d6:	f3 0f 5e d8          	divss  xmm3,xmm0
   14032f5da:	0f 2f d9             	comiss xmm3,xmm1
   14032f5dd:	eb 27                	jmp    0x14032f606
   14032f5df:	0f 2f c1             	comiss xmm0,xmm1
   14032f5e2:	72 12                	jb     0x14032f5f6
   14032f5e4:	f3 0f 5c d3          	subss  xmm2,xmm3
   14032f5e8:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032f5ec:	f3 41 0f 5e d7       	divss  xmm2,xmm15
   14032f5f1:	0f 2f c2             	comiss xmm0,xmm2
   14032f5f4:	eb a9                	jmp    0x14032f59f
   14032f5f6:	f3 0f 5c da          	subss  xmm3,xmm2
   14032f5fa:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032f5fe:	f3 41 0f 5e df       	divss  xmm3,xmm15
   14032f603:	0f 2f cb             	comiss xmm1,xmm3
   14032f606:	77 03                	ja     0x14032f60b
   14032f608:	0f 28 cb             	movaps xmm1,xmm3
   14032f60b:	0f 2f f9             	comiss xmm7,xmm1
   14032f60e:	77 03                	ja     0x14032f613
   14032f610:	0f 28 cf             	movaps xmm1,xmm7
   14032f613:	0f 28 df             	movaps xmm3,xmm7
   14032f616:	f3 0f 5c d9          	subss  xmm3,xmm1
   14032f61a:	41 80 bd 92 00 00 00 	cmp    BYTE PTR [r13+0x92],0x0
   14032f621:	00 
   14032f622:	74 32                	je     0x14032f656
   14032f624:	41 8b cf             	mov    ecx,r15d
   14032f627:	41 0f 28 c0          	movaps xmm0,xmm8
   14032f62b:	f3 0f 59 05 b5 ea 35 	mulss  xmm0,DWORD PTR [rip+0x35eab5]        # 0x14068e0e8
   14032f632:	00 
   14032f633:	f3 41 0f 58 c6       	addss  xmm0,xmm14
   14032f638:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14032f63c:	3b c1                	cmp    eax,ecx
   14032f63e:	0f 4f c8             	cmovg  ecx,eax
   14032f641:	0f b6 83 8c 0d 00 00 	movzx  eax,BYTE PTR [rbx+0xd8c]
   14032f648:	3b c1                	cmp    eax,ecx
   14032f64a:	7d 0a                	jge    0x14032f656
   14032f64c:	f2 0f 10 0d 74 83 37 	movsd  xmm1,QWORD PTR [rip+0x378374]        # 0x1406a79c8
   14032f653:	00 
   14032f654:	eb 04                	jmp    0x14032f65a
   14032f656:	41 0f 28 cd          	movaps xmm1,xmm13
   14032f65a:	f3 0f 59 ee          	mulss  xmm5,xmm6
   14032f65e:	4b 8d 0c 76          	lea    rcx,[r14+r14*2]
   14032f662:	48 c1 e1 04          	shl    rcx,0x4
   14032f666:	48 03 ca             	add    rcx,rdx
   14032f669:	f3 0f 59 eb          	mulss  xmm5,xmm3
   14032f66d:	0f 5a c5             	cvtps2pd xmm0,xmm5
   14032f670:	f2 0f 59 c1          	mulsd  xmm0,xmm1
   14032f674:	66 0f 5a d0          	cvtpd2ps xmm2,xmm0
   14032f678:	f3 0f 10 84 8d 30 01 	movss  xmm0,DWORD PTR [rbp+rcx*4+0x130]
   14032f67f:	00 00 
   14032f681:	0f 2f d0             	comiss xmm2,xmm0
   14032f684:	77 1a                	ja     0x14032f6a0
   14032f686:	41 0f 2e f1          	ucomiss xmm6,xmm9
   14032f68a:	7a 54                	jp     0x14032f6e0
   14032f68c:	75 52                	jne    0x14032f6e0
   14032f68e:	41 0f 2e c1          	ucomiss xmm0,xmm9
   14032f692:	7a 4c                	jp     0x14032f6e0
   14032f694:	75 4a                	jne    0x14032f6e0
   14032f696:	0f 2f 9c 8d 30 13 00 	comiss xmm3,DWORD PTR [rbp+rcx*4+0x1330]
   14032f69d:	00 
   14032f69e:	76 40                	jbe    0x14032f6e0
   14032f6a0:	0f 57 c0             	xorps  xmm0,xmm0
   14032f6a3:	f3 0f 11 94 8d 30 01 	movss  DWORD PTR [rbp+rcx*4+0x130],xmm2
   14032f6aa:	00 00 
   14032f6ac:	f3 0f 5a c6          	cvtss2sd xmm0,xmm6
   14032f6b0:	48 89 9c cd 30 25 00 	mov    QWORD PTR [rbp+rcx*8+0x2530],rbx
   14032f6b7:	00 
   14032f6b8:	44 88 7c 24 30       	mov    BYTE PTR [rsp+0x30],r15b
   14032f6bd:	0f 57 c9             	xorps  xmm1,xmm1
   14032f6c0:	41 0f 28 d5          	movaps xmm2,xmm13
   14032f6c4:	f2 0f 5c d0          	subsd  xmm2,xmm0
   14032f6c8:	0f 57 c0             	xorps  xmm0,xmm0
   14032f6cb:	f3 0f 5a cb          	cvtss2sd xmm1,xmm3
   14032f6cf:	f2 0f 59 d1          	mulsd  xmm2,xmm1
   14032f6d3:	f2 0f 5a c2          	cvtsd2ss xmm0,xmm2
   14032f6d7:	f3 0f 11 84 8d 30 13 	movss  DWORD PTR [rbp+rcx*4+0x1330],xmm0
   14032f6de:	00 00 
   14032f6e0:	41 ff c2             	inc    r10d
   14032f6e3:	44 03 c6             	add    r8d,esi
   14032f6e6:	49 83 c1 20          	add    r9,0x20
   14032f6ea:	e9 b1 fd ff ff       	jmp    0x14032f4a0
   14032f6ef:	44 0f b7 7c 24 38    	movzx  r15d,WORD PTR [rsp+0x38]
   14032f6f5:	f3 0f 10 35 bb 83 37 	movss  xmm6,DWORD PTR [rip+0x3783bb]        # 0x1406a7ab8
   14032f6fc:	00 
   14032f6fd:	66 41 ff c7          	inc    r15w
   14032f701:	44 8b 64 24 78       	mov    r12d,DWORD PTR [rsp+0x78]
   14032f706:	44 8b 6c 24 48       	mov    r13d,DWORD PTR [rsp+0x48]
   14032f70b:	4c 8b 45 88          	mov    r8,QWORD PTR [rbp-0x78]
   14032f70f:	44 8b 4c 24 50       	mov    r9d,DWORD PTR [rsp+0x50]
   14032f714:	44 8b 54 24 58       	mov    r10d,DWORD PTR [rsp+0x58]
   14032f719:	48 8b 5d 90          	mov    rbx,QWORD PTR [rbp-0x70]
   14032f71d:	48 8b 7c 24 68       	mov    rdi,QWORD PTR [rsp+0x68]
   14032f722:	66 44 89 7c 24 38    	mov    WORD PTR [rsp+0x38],r15w
   14032f728:	66 44 3b 7c 24 3a    	cmp    r15w,WORD PTR [rsp+0x3a]
   14032f72e:	0f 82 bc fb ff ff    	jb     0x14032f2f0
   14032f734:	48 8b 7d 98          	mov    rdi,QWORD PTR [rbp-0x68]
   14032f738:	48 8b 74 24 68       	mov    rsi,QWORD PTR [rsp+0x68]
   14032f73d:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   14032f742:	48 8b 55 a0          	mov    rdx,QWORD PTR [rbp-0x60]
   14032f746:	41 ff cd             	dec    r13d
   14032f749:	49 ff ce             	dec    r14
   14032f74c:	44 89 6c 24 48       	mov    DWORD PTR [rsp+0x48],r13d
   14032f751:	41 83 fd 01          	cmp    r13d,0x1
   14032f755:	0f 8d d5 fa ff ff    	jge    0x14032f230
   14032f75b:	80 7c 24 30 00       	cmp    BYTE PTR [rsp+0x30],0x0
   14032f760:	0f 84 fc 06 00 00    	je     0x14032fe62
   14032f766:	f2 44 0f 10 05 11 ea 	movsd  xmm8,QWORD PTR [rip+0x35ea11]        # 0x14068e180
   14032f76d:	35 00 
   14032f76f:	b8 01 00 00 00       	mov    eax,0x1
   14032f774:	f3 44 0f 10 15 33 ea 	movss  xmm10,DWORD PTR [rip+0x35ea33]        # 0x14068e1b0
   14032f77b:	35 00 
   14032f77d:	32 c9                	xor    cl,cl
   14032f77f:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14032f784:	44 8b f0             	mov    r14d,eax
   14032f787:	44 8b f8             	mov    r15d,eax
   14032f78a:	41 bd c0 00 00 00    	mov    r13d,0xc0
   14032f790:	44 8d 60 1f          	lea    r12d,[rax+0x1f]
   14032f794:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032f798:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14032f79f:	00 
   14032f7a0:	b8 17 00 00 00       	mov    eax,0x17
   14032f7a5:	44 3b c0             	cmp    r8d,eax
   14032f7a8:	41 0f 4c c0          	cmovl  eax,r8d
   14032f7ac:	44 3b f0             	cmp    r14d,eax
   14032f7af:	0f 8f 93 00 00 00    	jg     0x14032f848
   14032f7b5:	41 8b f6             	mov    esi,r14d
   14032f7b8:	49 8b ff             	mov    rdi,r15
   14032f7bb:	44 3b 74 24 3c       	cmp    r14d,DWORD PTR [rsp+0x3c]
   14032f7c0:	7d 70                	jge    0x14032f832
   14032f7c2:	49 8b dc             	mov    rbx,r12
   14032f7c5:	48 8d 04 bd 00 00 00 	lea    rax,[rdi*4+0x0]
   14032f7cc:	00 
   14032f7cd:	49 03 c5             	add    rax,r13
   14032f7d0:	f3 0f 10 84 05 30 01 	movss  xmm0,DWORD PTR [rbp+rax*1+0x130]
   14032f7d7:	00 00 
   14032f7d9:	41 0f 2f c1          	comiss xmm0,xmm9
   14032f7dd:	76 36                	jbe    0x14032f815
   14032f7df:	f2 0f 10 0d 49 e9 35 	movsd  xmm1,QWORD PTR [rip+0x35e949]        # 0x14068e130
   14032f7e6:	00 
   14032f7e7:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032f7ea:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   14032f7ef:	e8 86 15 2f 00       	call   0x140620d7a
   14032f7f4:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   14032f7f9:	0f 57 c9             	xorps  xmm1,xmm1
   14032f7fc:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   14032f800:	b1 01                	mov    cl,0x1
   14032f802:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14032f807:	f3 42 0f 58 4c 13 28 	addss  xmm1,DWORD PTR [rbx+r10*1+0x28]
   14032f80e:	f3 42 0f 11 4c 13 28 	movss  DWORD PTR [rbx+r10*1+0x28],xmm1
   14032f815:	ff c6                	inc    esi
   14032f817:	48 83 c3 20          	add    rbx,0x20
   14032f81b:	48 ff c7             	inc    rdi
   14032f81e:	41 03 f6             	add    esi,r14d
   14032f821:	49 03 ff             	add    rdi,r15
   14032f824:	49 03 dc             	add    rbx,r12
   14032f827:	3b 74 24 3c          	cmp    esi,DWORD PTR [rsp+0x3c]
   14032f82b:	7c 98                	jl     0x14032f7c5
   14032f82d:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14032f832:	41 ff c6             	inc    r14d
   14032f835:	49 ff c7             	inc    r15
   14032f838:	49 81 c5 c0 00 00 00 	add    r13,0xc0
   14032f83f:	49 83 c4 20          	add    r12,0x20
   14032f843:	e9 58 ff ff ff       	jmp    0x14032f7a0
   14032f848:	84 c9                	test   cl,cl
   14032f84a:	0f 84 33 02 00 00    	je     0x14032fa83
   14032f850:	45 0f b6 b2 92 0d 00 	movzx  r14d,BYTE PTR [r10+0xd92]
   14032f857:	00 
   14032f858:	33 db                	xor    ebx,ebx
   14032f85a:	8b fb                	mov    edi,ebx
   14032f85c:	45 85 f6             	test   r14d,r14d
   14032f85f:	74 62                	je     0x14032f8c3
   14032f861:	49 8d 5a 28          	lea    rbx,[r10+0x28]
   14032f865:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14032f86c:	00 00 00 00 
   14032f870:	f3 0f 10 43 f8       	movss  xmm0,DWORD PTR [rbx-0x8]
   14032f875:	f3 0f 5c 03          	subss  xmm0,DWORD PTR [rbx]
   14032f879:	44 0f 2f c8          	comiss xmm9,xmm0
   14032f87d:	73 27                	jae    0x14032f8a6
   14032f87f:	f2 0f 10 0d 99 e8 35 	movsd  xmm1,QWORD PTR [rip+0x35e899]        # 0x14068e120
   14032f886:	00 
   14032f887:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032f88a:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   14032f88f:	e8 e6 14 2f 00       	call   0x140620d7a
   14032f894:	0f 57 c9             	xorps  xmm1,xmm1
   14032f897:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   14032f89b:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14032f8a0:	41 0f 2f c9          	comiss xmm1,xmm9
   14032f8a4:	77 04                	ja     0x14032f8aa
   14032f8a6:	41 0f 28 c9          	movaps xmm1,xmm9
   14032f8aa:	f3 0f 11 4c bd b0    	movss  DWORD PTR [rbp+rdi*4-0x50],xmm1
   14032f8b0:	48 83 c3 20          	add    rbx,0x20
   14032f8b4:	48 ff c7             	inc    rdi
   14032f8b7:	49 3b fe             	cmp    rdi,r14
   14032f8ba:	7c b4                	jl     0x14032f870
   14032f8bc:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   14032f8c1:	33 db                	xor    ebx,ebx
   14032f8c3:	f3 41 0f 10 02       	movss  xmm0,DWORD PTR [r10]
   14032f8c8:	4c 8d 45 70          	lea    r8,[rbp+0x70]
   14032f8cc:	45 8b ce             	mov    r9d,r14d
   14032f8cf:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   14032f8d4:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   14032f8d9:	48 8d 55 b0          	lea    rdx,[rbp-0x50]
   14032f8dd:	49 8b ce             	mov    rcx,r14
   14032f8e0:	f3 0f 11 44 24 20    	movss  DWORD PTR [rsp+0x20],xmm0
   14032f8e6:	e8 35 b1 fe ff       	call   0x14031aa20
   14032f8eb:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   14032f8f0:	8b d3                	mov    edx,ebx
   14032f8f2:	45 0f b6 82 92 0d 00 	movzx  r8d,BYTE PTR [r10+0xd92]
   14032f8f9:	00 
   14032f8fa:	45 84 c0             	test   r8b,r8b
   14032f8fd:	74 3c                	je     0x14032f93b
   14032f8ff:	48 8d 4d 70          	lea    rcx,[rbp+0x70]
   14032f903:	49 8d 42 14          	lea    rax,[r10+0x14]
   14032f907:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14032f90e:	00 00 
   14032f910:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   14032f914:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   14032f918:	0f 2f c8             	comiss xmm1,xmm0
   14032f91b:	77 03                	ja     0x14032f920
   14032f91d:	0f 28 c1             	movaps xmm0,xmm1
   14032f920:	f3 0f 11 00          	movss  DWORD PTR [rax],xmm0
   14032f924:	ff c2                	inc    edx
   14032f926:	45 0f b6 82 92 0d 00 	movzx  r8d,BYTE PTR [r10+0xd92]
   14032f92d:	00 
   14032f92e:	48 83 c0 20          	add    rax,0x20
   14032f932:	48 83 c1 04          	add    rcx,0x4
   14032f936:	41 3b d0             	cmp    edx,r8d
   14032f939:	7c d5                	jl     0x14032f910
   14032f93b:	f3 0f 10 5d b0       	movss  xmm3,DWORD PTR [rbp-0x50]
   14032f940:	45 0f b6 c8          	movzx  r9d,r8b
   14032f944:	f3 0f 11 5d 70       	movss  DWORD PTR [rbp+0x70],xmm3
   14032f949:	41 83 f9 01          	cmp    r9d,0x1
   14032f94d:	0f 86 f2 00 00 00    	jbe    0x14032fa45
   14032f953:	b9 02 00 00 00       	mov    ecx,0x2
   14032f958:	44 3b c9             	cmp    r9d,ecx
   14032f95b:	76 7f                	jbe    0x14032f9dc
   14032f95d:	8d 51 02             	lea    edx,[rcx+0x2]
   14032f960:	f3 0f 10 44 8d a8    	movss  xmm0,DWORD PTR [rbp+rcx*4-0x58]
   14032f966:	f3 0f 10 4c 8d ac    	movss  xmm1,DWORD PTR [rbp+rcx*4-0x54]
   14032f96c:	0f 2f c8             	comiss xmm1,xmm0
   14032f96f:	77 03                	ja     0x14032f974
   14032f971:	0f 28 c8             	movaps xmm1,xmm0
   14032f974:	8d 42 ff             	lea    eax,[rdx-0x1]
   14032f977:	41 3b c1             	cmp    eax,r9d
   14032f97a:	7d 1b                	jge    0x14032f997
   14032f97c:	f3 0f 10 44 8d b4    	movss  xmm0,DWORD PTR [rbp+rcx*4-0x4c]
   14032f982:	41 3b d1             	cmp    edx,r9d
   14032f985:	7d 14                	jge    0x14032f99b
   14032f987:	f3 0f 10 54 8d b8    	movss  xmm2,DWORD PTR [rbp+rcx*4-0x48]
   14032f98d:	0f 2f d0             	comiss xmm2,xmm0
   14032f990:	76 09                	jbe    0x14032f99b
   14032f992:	0f 28 c2             	movaps xmm0,xmm2
   14032f995:	eb 04                	jmp    0x14032f99b
   14032f997:	41 0f 28 c1          	movaps xmm0,xmm9
   14032f99b:	0f 2f cb             	comiss xmm1,xmm3
   14032f99e:	76 03                	jbe    0x14032f9a3
   14032f9a0:	0f 28 cb             	movaps xmm1,xmm3
   14032f9a3:	0f 2f c3             	comiss xmm0,xmm3
   14032f9a6:	76 03                	jbe    0x14032f9ab
   14032f9a8:	0f 28 c3             	movaps xmm0,xmm3
   14032f9ab:	f3 0f 58 c1          	addss  xmm0,xmm1
   14032f9af:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   14032f9b4:	0f 2f c1             	comiss xmm0,xmm1
   14032f9b7:	77 03                	ja     0x14032f9bc
   14032f9b9:	0f 28 c1             	movaps xmm0,xmm1
   14032f9bc:	f3 0f 10 4c 8d b0    	movss  xmm1,DWORD PTR [rbp+rcx*4-0x50]
   14032f9c2:	0f 2f c8             	comiss xmm1,xmm0
   14032f9c5:	77 03                	ja     0x14032f9ca
   14032f9c7:	0f 28 c1             	movaps xmm0,xmm1
   14032f9ca:	f3 0f 11 44 8d 70    	movss  DWORD PTR [rbp+rcx*4+0x70],xmm0
   14032f9d0:	83 c2 02             	add    edx,0x2
   14032f9d3:	48 83 c1 02          	add    rcx,0x2
   14032f9d7:	49 3b c9             	cmp    rcx,r9
   14032f9da:	7c 84                	jl     0x14032f960
   14032f9dc:	b8 01 00 00 00       	mov    eax,0x1
   14032f9e1:	44 3b c8             	cmp    r9d,eax
   14032f9e4:	76 5f                	jbe    0x14032fa45
   14032f9e6:	f3 0f 59 1d 7a 08 52 	mulss  xmm3,DWORD PTR [rip+0x52087a]        # 0x140850268
   14032f9ed:	00 
   14032f9ee:	b9 02 00 00 00       	mov    ecx,0x2
   14032f9f3:	41 3b c9             	cmp    ecx,r9d
   14032f9f6:	7d 08                	jge    0x14032fa00
   14032f9f8:	f3 0f 10 54 85 b4    	movss  xmm2,DWORD PTR [rbp+rax*4-0x4c]
   14032f9fe:	eb 04                	jmp    0x14032fa04
   14032fa00:	41 0f 28 d1          	movaps xmm2,xmm9
   14032fa04:	0f 28 cb             	movaps xmm1,xmm3
   14032fa07:	0f 28 c3             	movaps xmm0,xmm3
   14032fa0a:	f3 0f 5d 4c 85 ac    	minss  xmm1,DWORD PTR [rbp+rax*4-0x54]
   14032fa10:	f3 0f 5d c2          	minss  xmm0,xmm2
   14032fa14:	f3 0f 58 c1          	addss  xmm0,xmm1
   14032fa18:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   14032fa1d:	0f 2f c1             	comiss xmm0,xmm1
   14032fa20:	77 03                	ja     0x14032fa25
   14032fa22:	0f 28 c1             	movaps xmm0,xmm1
   14032fa25:	f3 0f 10 4c 85 b0    	movss  xmm1,DWORD PTR [rbp+rax*4-0x50]
   14032fa2b:	0f 2f c8             	comiss xmm1,xmm0
   14032fa2e:	77 03                	ja     0x14032fa33
   14032fa30:	0f 28 c1             	movaps xmm0,xmm1
   14032fa33:	f3 0f 11 44 85 70    	movss  DWORD PTR [rbp+rax*4+0x70],xmm0
   14032fa39:	83 c1 02             	add    ecx,0x2
   14032fa3c:	48 83 c0 02          	add    rax,0x2
   14032fa40:	49 3b c1             	cmp    rax,r9
   14032fa43:	7c ae                	jl     0x14032f9f3
   14032fa45:	41 80 ba 92 0d 00 00 	cmp    BYTE PTR [r10+0xd92],0x0
   14032fa4c:	00 
   14032fa4d:	44 8b c3             	mov    r8d,ebx
   14032fa50:	76 2a                	jbe    0x14032fa7c
   14032fa52:	48 8d 4d 70          	lea    rcx,[rbp+0x70]
   14032fa56:	49 8d 52 24          	lea    rdx,[r10+0x24]
   14032fa5a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14032fa60:	8b 01                	mov    eax,DWORD PTR [rcx]
   14032fa62:	48 8d 49 04          	lea    rcx,[rcx+0x4]
   14032fa66:	89 02                	mov    DWORD PTR [rdx],eax
   14032fa68:	48 8d 52 20          	lea    rdx,[rdx+0x20]
   14032fa6c:	41 0f b6 82 92 0d 00 	movzx  eax,BYTE PTR [r10+0xd92]
   14032fa73:	00 
   14032fa74:	41 ff c0             	inc    r8d
   14032fa77:	44 3b c0             	cmp    r8d,eax
   14032fa7a:	7c e4                	jl     0x14032fa60
   14032fa7c:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14032fa81:	eb 05                	jmp    0x14032fa88
   14032fa83:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   14032fa88:	f3 0f 10 05 1c 80 37 	movss  xmm0,DWORD PTR [rip+0x37801c]        # 0x1406a7aac
   14032fa8f:	00 
   14032fa90:	b9 01 00 00 00       	mov    ecx,0x1
   14032fa95:	41 0f 2f 02          	comiss xmm0,DWORD PTR [r10]
   14032fa99:	b8 03 00 00 00       	mov    eax,0x3
   14032fa9e:	0f 47 c1             	cmova  eax,ecx
   14032faa1:	8b c8                	mov    ecx,eax
   14032faa3:	8b d0                	mov    edx,eax
   14032faa5:	48 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],rcx
   14032faaa:	48 89 54 24 58       	mov    QWORD PTR [rsp+0x58],rdx
   14032faaf:	44 8b e8             	mov    r13d,eax
   14032fab2:	44 8b e0             	mov    r12d,eax
   14032fab5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14032fabc:	00 00 00 00 
   14032fac0:	b8 17 00 00 00       	mov    eax,0x17
   14032fac5:	44 3b c0             	cmp    r8d,eax
   14032fac8:	41 0f 4c c0          	cmovl  eax,r8d
   14032facc:	44 3b e8             	cmp    r13d,eax
   14032facf:	0f 8f 92 03 00 00    	jg     0x14032fe67
   14032fad5:	49 69 c4 88 01 00 00 	imul   rax,r12,0x188
   14032fadc:	4c 8b bc 05 30 25 00 	mov    r15,QWORD PTR [rbp+rax*1+0x2530]
   14032fae3:	00 
   14032fae4:	4d 85 ff             	test   r15,r15
   14032fae7:	0f 84 63 03 00 00    	je     0x14032fe50
   14032faed:	49 8b c4             	mov    rax,r12
   14032faf0:	48 c1 e0 05          	shl    rax,0x5
   14032faf4:	f3 42 0f 10 44 10 24 	movss  xmm0,DWORD PTR [rax+r10*1+0x24]
   14032fafb:	f3 42 0f 10 4c 10 14 	movss  xmm1,DWORD PTR [rax+r10*1+0x14]
   14032fb02:	0f 2f c8             	comiss xmm1,xmm0
   14032fb05:	77 03                	ja     0x14032fb0a
   14032fb07:	0f 28 c1             	movaps xmm0,xmm1
   14032fb0a:	49 69 c4 c4 00 00 00 	imul   rax,r12,0xc4
   14032fb11:	f3 0f 59 84 05 30 13 	mulss  xmm0,DWORD PTR [rbp+rax*1+0x1330]
   14032fb18:	00 00 
   14032fb1a:	43 0f 2f 84 a7 0c 06 	comiss xmm0,DWORD PTR [r15+r12*4+0x60c]
   14032fb21:	00 00 
   14032fb23:	0f 86 27 03 00 00    	jbe    0x14032fe50
   14032fb29:	f3 43 0f 11 84 a7 0c 	movss  DWORD PTR [r15+r12*4+0x60c],xmm0
   14032fb30:	06 00 00 
   14032fb33:	48 83 f9 07          	cmp    rcx,0x7
   14032fb37:	0f 83 cb 00 00 00    	jae    0x14032fc08
   14032fb3d:	48 8d 82 84 01 00 00 	lea    rax,[rdx+0x184]
   14032fb44:	b9 03 00 00 00       	mov    ecx,0x3
   14032fb49:	48 2b ca             	sub    rcx,rdx
   14032fb4c:	49 8d 04 87          	lea    rax,[r15+rax*4]
   14032fb50:	48 c1 e9 02          	shr    rcx,0x2
   14032fb54:	41 0f 28 c1          	movaps xmm0,xmm9
   14032fb58:	48 ff c1             	inc    rcx
   14032fb5b:	48 8d 14 8a          	lea    rdx,[rdx+rcx*4]
   14032fb5f:	90                   	nop
   14032fb60:	f3 0f 10 48 fc       	movss  xmm1,DWORD PTR [rax-0x4]
   14032fb65:	0f 2f c8             	comiss xmm1,xmm0
   14032fb68:	76 03                	jbe    0x14032fb6d
   14032fb6a:	0f 28 c1             	movaps xmm0,xmm1
   14032fb6d:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   14032fb71:	0f 2f c8             	comiss xmm1,xmm0
   14032fb74:	76 03                	jbe    0x14032fb79
   14032fb76:	0f 28 c1             	movaps xmm0,xmm1
   14032fb79:	f3 0f 10 48 04       	movss  xmm1,DWORD PTR [rax+0x4]
   14032fb7e:	0f 2f c8             	comiss xmm1,xmm0
   14032fb81:	76 03                	jbe    0x14032fb86
   14032fb83:	0f 28 c1             	movaps xmm0,xmm1
   14032fb86:	f3 0f 10 48 08       	movss  xmm1,DWORD PTR [rax+0x8]
   14032fb8b:	0f 2f c8             	comiss xmm1,xmm0
   14032fb8e:	76 03                	jbe    0x14032fb93
   14032fb90:	0f 28 c1             	movaps xmm0,xmm1
   14032fb93:	48 83 c0 10          	add    rax,0x10
   14032fb97:	48 83 e9 01          	sub    rcx,0x1
   14032fb9b:	75 c3                	jne    0x14032fb60
   14032fb9d:	48 83 fa 07          	cmp    rdx,0x7
   14032fba1:	7d 29                	jge    0x14032fbcc
   14032fba3:	48 8d 82 83 01 00 00 	lea    rax,[rdx+0x183]
   14032fbaa:	b9 07 00 00 00       	mov    ecx,0x7
   14032fbaf:	49 8d 04 87          	lea    rax,[r15+rax*4]
   14032fbb3:	48 2b ca             	sub    rcx,rdx
   14032fbb6:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   14032fbba:	0f 2f c8             	comiss xmm1,xmm0
   14032fbbd:	76 03                	jbe    0x14032fbc2
   14032fbbf:	0f 28 c1             	movaps xmm0,xmm1
   14032fbc2:	48 83 c0 04          	add    rax,0x4
   14032fbc6:	48 83 e9 01          	sub    rcx,0x1
   14032fbca:	75 ea                	jne    0x14032fbb6
   14032fbcc:	44 0f 2f c8          	comiss xmm9,xmm0
   14032fbd0:	73 36                	jae    0x14032fc08
   14032fbd2:	f2 44 0f 10 05 a5 e5 	movsd  xmm8,QWORD PTR [rip+0x35e5a5]        # 0x14068e180
   14032fbd9:	35 00 
   14032fbdb:	f2 0f 10 0d 4d e5 35 	movsd  xmm1,QWORD PTR [rip+0x35e54d]        # 0x14068e130
   14032fbe2:	00 
   14032fbe3:	f3 0f 5a c0          	cvtss2sd xmm0,xmm0
   14032fbe7:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   14032fbec:	e8 89 11 2f 00       	call   0x140620d7a
   14032fbf1:	f3 44 0f 10 15 b6 e5 	movss  xmm10,DWORD PTR [rip+0x35e5b6]        # 0x14068e1b0
   14032fbf8:	35 00 
   14032fbfa:	0f 57 c9             	xorps  xmm1,xmm1
   14032fbfd:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   14032fc01:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14032fc06:	eb 16                	jmp    0x14032fc1e
   14032fc08:	f2 44 0f 10 05 6f e5 	movsd  xmm8,QWORD PTR [rip+0x35e56f]        # 0x14068e180
   14032fc0f:	35 00 
   14032fc11:	41 0f 28 c9          	movaps xmm1,xmm9
   14032fc15:	f3 44 0f 10 15 92 e5 	movss  xmm10,DWORD PTR [rip+0x35e592]        # 0x14068e1b0
   14032fc1c:	35 00 
   14032fc1e:	33 c0                	xor    eax,eax
   14032fc20:	f3 41 0f 11 4f 28    	movss  DWORD PTR [r15+0x28],xmm1
   14032fc26:	45 0f b6 b7 92 0d 00 	movzx  r14d,BYTE PTR [r15+0xd92]
   14032fc2d:	00 
   14032fc2e:	49 8d 5f 28          	lea    rbx,[r15+0x28]
   14032fc32:	8b f8                	mov    edi,eax
   14032fc34:	45 85 f6             	test   r14d,r14d
   14032fc37:	74 53                	je     0x14032fc8c
   14032fc39:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14032fc40:	f3 0f 10 43 f8       	movss  xmm0,DWORD PTR [rbx-0x8]
   14032fc45:	f3 0f 5c 03          	subss  xmm0,DWORD PTR [rbx]
   14032fc49:	44 0f 2f c8          	comiss xmm9,xmm0
   14032fc4d:	73 27                	jae    0x14032fc76
   14032fc4f:	f2 0f 10 0d c9 e4 35 	movsd  xmm1,QWORD PTR [rip+0x35e4c9]        # 0x14068e120
   14032fc56:	00 
   14032fc57:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032fc5a:	f2 41 0f 5e c0       	divsd  xmm0,xmm8
   14032fc5f:	e8 16 11 2f 00       	call   0x140620d7a
   14032fc64:	0f 57 c9             	xorps  xmm1,xmm1
   14032fc67:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   14032fc6b:	f3 41 0f 59 ca       	mulss  xmm1,xmm10
   14032fc70:	41 0f 2f c9          	comiss xmm1,xmm9
   14032fc74:	77 04                	ja     0x14032fc7a
   14032fc76:	41 0f 28 c9          	movaps xmm1,xmm9
   14032fc7a:	f3 0f 11 4c bd b0    	movss  DWORD PTR [rbp+rdi*4-0x50],xmm1
   14032fc80:	48 83 c3 20          	add    rbx,0x20
   14032fc84:	48 ff c7             	inc    rdi
   14032fc87:	49 3b fe             	cmp    rdi,r14
   14032fc8a:	7c b4                	jl     0x14032fc40
   14032fc8c:	f3 41 0f 10 07       	movss  xmm0,DWORD PTR [r15]
   14032fc91:	4c 8d 45 70          	lea    r8,[rbp+0x70]
   14032fc95:	45 8b ce             	mov    r9d,r14d
   14032fc98:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   14032fc9d:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   14032fca2:	48 8d 55 b0          	lea    rdx,[rbp-0x50]
   14032fca6:	49 8b ce             	mov    rcx,r14
   14032fca9:	f3 0f 11 44 24 20    	movss  DWORD PTR [rsp+0x20],xmm0
   14032fcaf:	e8 6c ad fe ff       	call   0x14031aa20
   14032fcb4:	45 0f b6 87 92 0d 00 	movzx  r8d,BYTE PTR [r15+0xd92]
   14032fcbb:	00 
   14032fcbc:	33 db                	xor    ebx,ebx
   14032fcbe:	8b d3                	mov    edx,ebx
   14032fcc0:	45 84 c0             	test   r8b,r8b
   14032fcc3:	74 36                	je     0x14032fcfb
   14032fcc5:	48 8d 4d 70          	lea    rcx,[rbp+0x70]
   14032fcc9:	49 8d 47 14          	lea    rax,[r15+0x14]
   14032fccd:	0f 1f 00             	nop    DWORD PTR [rax]
   14032fcd0:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   14032fcd4:	f3 0f 10 08          	movss  xmm1,DWORD PTR [rax]
   14032fcd8:	0f 2f c8             	comiss xmm1,xmm0
   14032fcdb:	77 03                	ja     0x14032fce0
   14032fcdd:	0f 28 c1             	movaps xmm0,xmm1
   14032fce0:	f3 0f 11 00          	movss  DWORD PTR [rax],xmm0
   14032fce4:	ff c2                	inc    edx
   14032fce6:	45 0f b6 87 92 0d 00 	movzx  r8d,BYTE PTR [r15+0xd92]
   14032fced:	00 
   14032fcee:	48 83 c0 20          	add    rax,0x20
   14032fcf2:	48 83 c1 04          	add    rcx,0x4
   14032fcf6:	41 3b d0             	cmp    edx,r8d
   14032fcf9:	7c d5                	jl     0x14032fcd0
   14032fcfb:	f3 0f 10 5d b0       	movss  xmm3,DWORD PTR [rbp-0x50]
   14032fd00:	45 0f b6 c8          	movzx  r9d,r8b
   14032fd04:	f3 0f 11 5d 70       	movss  DWORD PTR [rbp+0x70],xmm3
   14032fd09:	41 83 f9 01          	cmp    r9d,0x1
   14032fd0d:	0f 86 f2 00 00 00    	jbe    0x14032fe05
   14032fd13:	b9 02 00 00 00       	mov    ecx,0x2
   14032fd18:	44 3b c9             	cmp    r9d,ecx
   14032fd1b:	76 7f                	jbe    0x14032fd9c
   14032fd1d:	8d 51 02             	lea    edx,[rcx+0x2]
   14032fd20:	f3 0f 10 44 8d a8    	movss  xmm0,DWORD PTR [rbp+rcx*4-0x58]
   14032fd26:	f3 0f 10 4c 8d ac    	movss  xmm1,DWORD PTR [rbp+rcx*4-0x54]
   14032fd2c:	0f 2f c8             	comiss xmm1,xmm0
   14032fd2f:	77 03                	ja     0x14032fd34
   14032fd31:	0f 28 c8             	movaps xmm1,xmm0
   14032fd34:	8d 42 ff             	lea    eax,[rdx-0x1]
   14032fd37:	41 3b c1             	cmp    eax,r9d
   14032fd3a:	7d 1b                	jge    0x14032fd57
   14032fd3c:	f3 0f 10 44 8d b4    	movss  xmm0,DWORD PTR [rbp+rcx*4-0x4c]
   14032fd42:	41 3b d1             	cmp    edx,r9d
   14032fd45:	7d 14                	jge    0x14032fd5b
   14032fd47:	f3 0f 10 54 8d b8    	movss  xmm2,DWORD PTR [rbp+rcx*4-0x48]
   14032fd4d:	0f 2f d0             	comiss xmm2,xmm0
   14032fd50:	76 09                	jbe    0x14032fd5b
   14032fd52:	0f 28 c2             	movaps xmm0,xmm2
   14032fd55:	eb 04                	jmp    0x14032fd5b
   14032fd57:	41 0f 28 c1          	movaps xmm0,xmm9
   14032fd5b:	0f 2f cb             	comiss xmm1,xmm3
   14032fd5e:	76 03                	jbe    0x14032fd63
   14032fd60:	0f 28 cb             	movaps xmm1,xmm3
   14032fd63:	0f 2f c3             	comiss xmm0,xmm3
   14032fd66:	76 03                	jbe    0x14032fd6b
   14032fd68:	0f 28 c3             	movaps xmm0,xmm3
   14032fd6b:	f3 0f 58 c1          	addss  xmm0,xmm1
   14032fd6f:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   14032fd74:	0f 2f c1             	comiss xmm0,xmm1
   14032fd77:	77 03                	ja     0x14032fd7c
   14032fd79:	0f 28 c1             	movaps xmm0,xmm1
   14032fd7c:	f3 0f 10 4c 8d b0    	movss  xmm1,DWORD PTR [rbp+rcx*4-0x50]
   14032fd82:	0f 2f c8             	comiss xmm1,xmm0
   14032fd85:	77 03                	ja     0x14032fd8a
   14032fd87:	0f 28 c1             	movaps xmm0,xmm1
   14032fd8a:	f3 0f 11 44 8d 70    	movss  DWORD PTR [rbp+rcx*4+0x70],xmm0
   14032fd90:	83 c2 02             	add    edx,0x2
   14032fd93:	48 83 c1 02          	add    rcx,0x2
   14032fd97:	49 3b c9             	cmp    rcx,r9
   14032fd9a:	7c 84                	jl     0x14032fd20
   14032fd9c:	b8 01 00 00 00       	mov    eax,0x1
   14032fda1:	44 3b c8             	cmp    r9d,eax
   14032fda4:	76 5f                	jbe    0x14032fe05
   14032fda6:	f3 0f 59 1d ba 04 52 	mulss  xmm3,DWORD PTR [rip+0x5204ba]        # 0x140850268
   14032fdad:	00 
   14032fdae:	b9 02 00 00 00       	mov    ecx,0x2
   14032fdb3:	41 3b c9             	cmp    ecx,r9d
   14032fdb6:	7d 08                	jge    0x14032fdc0
   14032fdb8:	f3 0f 10 54 85 b4    	movss  xmm2,DWORD PTR [rbp+rax*4-0x4c]
   14032fdbe:	eb 04                	jmp    0x14032fdc4
   14032fdc0:	41 0f 28 d1          	movaps xmm2,xmm9
   14032fdc4:	0f 28 cb             	movaps xmm1,xmm3
   14032fdc7:	0f 28 c3             	movaps xmm0,xmm3
   14032fdca:	f3 0f 5d 4c 85 ac    	minss  xmm1,DWORD PTR [rbp+rax*4-0x54]
   14032fdd0:	f3 0f 5d c2          	minss  xmm0,xmm2
   14032fdd4:	f3 0f 58 c1          	addss  xmm0,xmm1
   14032fdd8:	f3 41 0f 59 c6       	mulss  xmm0,xmm14
   14032fddd:	0f 2f c1             	comiss xmm0,xmm1
   14032fde0:	77 03                	ja     0x14032fde5
   14032fde2:	0f 28 c1             	movaps xmm0,xmm1
   14032fde5:	f3 0f 10 4c 85 b0    	movss  xmm1,DWORD PTR [rbp+rax*4-0x50]
   14032fdeb:	0f 2f c8             	comiss xmm1,xmm0
   14032fdee:	77 03                	ja     0x14032fdf3
   14032fdf0:	0f 28 c1             	movaps xmm0,xmm1
   14032fdf3:	f3 0f 11 44 85 70    	movss  DWORD PTR [rbp+rax*4+0x70],xmm0
   14032fdf9:	83 c1 02             	add    ecx,0x2
   14032fdfc:	48 83 c0 02          	add    rax,0x2
   14032fe00:	49 3b c1             	cmp    rax,r9
   14032fe03:	7c ae                	jl     0x14032fdb3
   14032fe05:	44 8b c3             	mov    r8d,ebx
   14032fe08:	41 38 9f 92 0d 00 00 	cmp    BYTE PTR [r15+0xd92],bl
   14032fe0f:	76 2b                	jbe    0x14032fe3c
   14032fe11:	48 8d 4d 70          	lea    rcx,[rbp+0x70]
   14032fe15:	49 8d 57 24          	lea    rdx,[r15+0x24]
   14032fe19:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14032fe20:	8b 01                	mov    eax,DWORD PTR [rcx]
   14032fe22:	48 8d 49 04          	lea    rcx,[rcx+0x4]
   14032fe26:	89 02                	mov    DWORD PTR [rdx],eax
   14032fe28:	48 8d 52 20          	lea    rdx,[rdx+0x20]
   14032fe2c:	41 0f b6 87 92 0d 00 	movzx  eax,BYTE PTR [r15+0xd92]
   14032fe33:	00 
   14032fe34:	41 ff c0             	inc    r8d
   14032fe37:	44 3b c0             	cmp    r8d,eax
   14032fe3a:	7c e4                	jl     0x14032fe20
   14032fe3c:	4c 8b 54 24 40       	mov    r10,QWORD PTR [rsp+0x40]
   14032fe41:	44 8b 44 24 34       	mov    r8d,DWORD PTR [rsp+0x34]
   14032fe46:	48 8b 4c 24 50       	mov    rcx,QWORD PTR [rsp+0x50]
   14032fe4b:	48 8b 54 24 58       	mov    rdx,QWORD PTR [rsp+0x58]
   14032fe50:	41 ff c5             	inc    r13d
   14032fe53:	49 ff c4             	inc    r12
   14032fe56:	e9 65 fc ff ff       	jmp    0x14032fac0
   14032fe5b:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   14032fe60:	eb 0a                	jmp    0x14032fe6c
   14032fe62:	4c 8b 74 24 60       	mov    r14,QWORD PTR [rsp+0x60]
   14032fe67:	4c 8b 7c 24 70       	mov    r15,QWORD PTR [rsp+0x70]
   14032fe6c:	48 8b 74 24 68       	mov    rsi,QWORD PTR [rsp+0x68]
   14032fe71:	41 bd 01 00 00 00    	mov    r13d,0x1
   14032fe77:	48 8b 4d 80          	mov    rcx,QWORD PTR [rbp-0x80]
   14032fe7b:	48 83 e9 01          	sub    rcx,0x1
   14032fe7f:	48 89 4d 80          	mov    QWORD PTR [rbp-0x80],rcx
   14032fe83:	4c 8d 8e 98 86 04 00 	lea    r9,[rsi+0x48698]
   14032fe8a:	4c 8d a6 9a 86 04 00 	lea    r12,[rsi+0x4869a]
   14032fe91:	0f 89 8b f0 ff ff    	jns    0x14032ef22
   14032fe97:	44 0f 28 bc 24 80 4c 	movaps xmm15,XMMWORD PTR [rsp+0x4c80]
   14032fe9e:	00 00 
   14032fea0:	44 0f 28 b4 24 90 4c 	movaps xmm14,XMMWORD PTR [rsp+0x4c90]
   14032fea7:	00 00 
   14032fea9:	44 0f 28 ac 24 a0 4c 	movaps xmm13,XMMWORD PTR [rsp+0x4ca0]
   14032feb0:	00 00 
   14032feb2:	44 0f 28 a4 24 b0 4c 	movaps xmm12,XMMWORD PTR [rsp+0x4cb0]
   14032feb9:	00 00 
   14032febb:	44 0f 28 9c 24 c0 4c 	movaps xmm11,XMMWORD PTR [rsp+0x4cc0]
   14032fec2:	00 00 
   14032fec4:	44 0f 28 94 24 d0 4c 	movaps xmm10,XMMWORD PTR [rsp+0x4cd0]
   14032fecb:	00 00 
   14032fecd:	44 0f 28 8c 24 e0 4c 	movaps xmm9,XMMWORD PTR [rsp+0x4ce0]
   14032fed4:	00 00 
   14032fed6:	44 0f 28 84 24 f0 4c 	movaps xmm8,XMMWORD PTR [rsp+0x4cf0]
   14032fedd:	00 00 
   14032fedf:	0f 28 bc 24 00 4d 00 	movaps xmm7,XMMWORD PTR [rsp+0x4d00]
   14032fee6:	00 
   14032fee7:	0f 28 b4 24 10 4d 00 	movaps xmm6,XMMWORD PTR [rsp+0x4d10]
   14032feee:	00 
   14032feef:	4c 8b a4 24 20 4d 00 	mov    r12,QWORD PTR [rsp+0x4d20]
   14032fef6:	00 
   14032fef7:	48 8b bc 24 70 4d 00 	mov    rdi,QWORD PTR [rsp+0x4d70]
   14032fefe:	00 
   14032feff:	48 8b 8d 70 4b 00 00 	mov    rcx,QWORD PTR [rbp+0x4b70]
   14032ff06:	48 33 cc             	xor    rcx,rsp
   14032ff09:	e8 f2 b6 2e 00       	call   0x14061b600
   14032ff0e:	48 81 c4 28 4d 00 00 	add    rsp,0x4d28
   14032ff15:	41 5f                	pop    r15
   14032ff17:	41 5e                	pop    r14
   14032ff19:	41 5d                	pop    r13
   14032ff1b:	5e                   	pop    rsi
   14032ff1c:	5b                   	pop    rbx
   14032ff1d:	5d                   	pop    rbp
   14032ff1e:	c3                   	ret
   14032ff1f:	cc                   	int3
   14032ff20:	cc                   	int3
   14032ff21:	cc                   	int3
   14032ff22:	cc                   	int3
   14032ff23:	cc                   	int3
   14032ff24:	cc                   	int3
   14032ff25:	cc                   	int3
   14032ff26:	cc                   	int3
   14032ff27:	cc                   	int3
   14032ff28:	cc                   	int3
   14032ff29:	cc                   	int3
   14032ff2a:	cc                   	int3
   14032ff2b:	cc                   	int3
   14032ff2c:	cc                   	int3
   14032ff2d:	cc                   	int3
   14032ff2e:	cc                   	int3
   14032ff2f:	cc                   	int3
