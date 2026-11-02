
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031fdf0 <.text+0x31edf0>:
   14031fdf0:	48 8b c4             	mov    rax,rsp
   14031fdf3:	4c 89 48 20          	mov    QWORD PTR [rax+0x20],r9
   14031fdf7:	48 89 50 10          	mov    QWORD PTR [rax+0x10],rdx
   14031fdfb:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   14031fdff:	53                   	push   rbx
   14031fe00:	55                   	push   rbp
   14031fe01:	56                   	push   rsi
   14031fe02:	57                   	push   rdi
   14031fe03:	41 55                	push   r13
   14031fe05:	41 56                	push   r14
   14031fe07:	41 57                	push   r15
   14031fe09:	48 81 ec f0 00 00 00 	sub    rsp,0xf0
   14031fe10:	44 8b bc 24 50 01 00 	mov    r15d,DWORD PTR [rsp+0x150]
   14031fe17:	00 
   14031fe18:	45 32 f6             	xor    r14b,r14b
   14031fe1b:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   14031fe1f:	b9 01 00 00 00       	mov    ecx,0x1
   14031fe24:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   14031fe28:	49 8b f9             	mov    rdi,r9
   14031fe2b:	33 c0                	xor    eax,eax
   14031fe2d:	44 88 b4 24 50 01 00 	mov    BYTE PTR [rsp+0x150],r14b
   14031fe34:	00 
   14031fe35:	45 85 ff             	test   r15d,r15d
   14031fe38:	4d 8b e8             	mov    r13,r8
   14031fe3b:	48 8b ea             	mov    rbp,rdx
   14031fe3e:	41 0f 4e c7          	cmovle eax,r15d
   14031fe42:	3b c1                	cmp    eax,ecx
   14031fe44:	0f 4f c8             	cmovg  ecx,eax
   14031fe47:	89 4c 24 30          	mov    DWORD PTR [rsp+0x30],ecx
   14031fe4b:	41 83 ff 02          	cmp    r15d,0x2
   14031fe4f:	7c 0e                	jl     0x14031fe5f
   14031fe51:	bb 08 00 00 00       	mov    ebx,0x8
   14031fe56:	44 3b fb             	cmp    r15d,ebx
   14031fe59:	41 0f 4e df          	cmovle ebx,r15d
   14031fe5d:	eb 05                	jmp    0x14031fe64
   14031fe5f:	bb 01 00 00 00       	mov    ebx,0x1
   14031fe64:	89 5c 24 28          	mov    DWORD PTR [rsp+0x28],ebx
   14031fe68:	4d 85 ed             	test   r13,r13
   14031fe6b:	74 17                	je     0x14031fe84
   14031fe6d:	8d 04 49             	lea    eax,[rcx+rcx*2]
   14031fe70:	33 d2                	xor    edx,edx
   14031fe72:	c1 e0 04             	shl    eax,0x4
   14031fe75:	49 8b cd             	mov    rcx,r13
   14031fe78:	44 8b c0             	mov    r8d,eax
   14031fe7b:	49 c1 e0 02          	shl    r8,0x2
   14031fe7f:	e8 66 0e 30 00       	call   0x140620cea
   14031fe84:	48 85 ff             	test   rdi,rdi
   14031fe87:	74 17                	je     0x14031fea0
   14031fe89:	8d 04 5b             	lea    eax,[rbx+rbx*2]
   14031fe8c:	33 d2                	xor    edx,edx
   14031fe8e:	c1 e0 04             	shl    eax,0x4
   14031fe91:	48 8b cf             	mov    rcx,rdi
   14031fe94:	44 8b c0             	mov    r8d,eax
   14031fe97:	49 c1 e0 02          	shl    r8,0x2
   14031fe9b:	e8 4a 0e 30 00       	call   0x140620cea
   14031fea0:	45 85 ff             	test   r15d,r15d
   14031fea3:	74 0a                	je     0x14031feaf
   14031fea5:	45 8b c7             	mov    r8d,r15d
   14031fea8:	44 89 7c 24 2c       	mov    DWORD PTR [rsp+0x2c],r15d
   14031fead:	eb 2e                	jmp    0x14031fedd
   14031feaf:	f3 0f 10 05 f5 a2 66 	movss  xmm0,DWORD PTR [rip+0x66a2f5]        # 0x14098a1ac
   14031feb6:	00 
   14031feb7:	41 b8 01 00 00 00    	mov    r8d,0x1
   14031febd:	f3 0f 59 05 e7 00 53 	mulss  xmm0,DWORD PTR [rip+0x5300e7]        # 0x14084ffac
   14031fec4:	00 
   14031fec5:	f3 0f 58 05 0f 01 53 	addss  xmm0,DWORD PTR [rip+0x53010f]        # 0x14084ffdc
   14031fecc:	00 
   14031fecd:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14031fed1:	41 3b c0             	cmp    eax,r8d
   14031fed4:	44 0f 4f c0          	cmovg  r8d,eax
   14031fed8:	44 89 44 24 2c       	mov    DWORD PTR [rsp+0x2c],r8d
   14031fedd:	f3 0f 10 75 00       	movss  xmm6,DWORD PTR [rbp+0x0]
   14031fee2:	33 f6                	xor    esi,esi
   14031fee4:	33 d2                	xor    edx,edx
   14031fee6:	89 74 24 24          	mov    DWORD PTR [rsp+0x24],esi
   14031feea:	0f 57 ff             	xorps  xmm7,xmm7
   14031feed:	89 54 24 20          	mov    DWORD PTR [rsp+0x20],edx
   14031fef1:	0f 2e f7             	ucomiss xmm6,xmm7
   14031fef4:	7a 0b                	jp     0x14031ff01
   14031fef6:	75 09                	jne    0x14031ff01
   14031fef8:	41 0f b6 c6          	movzx  eax,r14b
   14031fefc:	e9 92 05 00 00       	jmp    0x140320493
   14031ff01:	4c 8b 8c 24 30 01 00 	mov    r9,QWORD PTR [rsp+0x130]
   14031ff08:	00 
   14031ff09:	45 33 f6             	xor    r14d,r14d
   14031ff0c:	4c 89 a4 24 e8 00 00 	mov    QWORD PTR [rsp+0xe8],r12
   14031ff13:	00 
   14031ff14:	44 0f b7 a5 90 0d 00 	movzx  r12d,WORD PTR [rbp+0xd90]
   14031ff1b:	00 
   14031ff1c:	44 0f 29 84 24 b0 00 	movaps XMMWORD PTR [rsp+0xb0],xmm8
   14031ff23:	00 00 
   14031ff25:	49 8b 81 80 06 00 00 	mov    rax,QWORD PTR [r9+0x680]
   14031ff2c:	f3 44 0f 10 84 24 58 	movss  xmm8,DWORD PTR [rsp+0x158]
   14031ff33:	01 00 00 
   14031ff36:	44 0f 29 8c 24 a0 00 	movaps XMMWORD PTR [rsp+0xa0],xmm9
   14031ff3d:	00 00 
   14031ff3f:	f3 44 0f 10 4d 18    	movss  xmm9,DWORD PTR [rbp+0x18]
   14031ff45:	44 0f 29 94 24 90 00 	movaps XMMWORD PTR [rsp+0x90],xmm10
   14031ff4c:	00 00 
   14031ff4e:	f3 44 0f 10 15 d9 00 	movss  xmm10,DWORD PTR [rip+0x5300d9]        # 0x140850030
   14031ff55:	53 00 
   14031ff57:	44 0f 29 9c 24 80 00 	movaps XMMWORD PTR [rsp+0x80],xmm11
   14031ff5e:	00 00 
   14031ff60:	f3 44 0f 10 1d 0f 03 	movss  xmm11,DWORD PTR [rip+0x53030f]        # 0x140850278
   14031ff67:	53 00 
   14031ff69:	44 0f 29 64 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm12
   14031ff6f:	f3 44 0f 10 25 d4 71 	movss  xmm12,DWORD PTR [rip+0x3771d4]        # 0x14069714c
   14031ff76:	37 00 
   14031ff78:	44 0f 29 6c 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm13
   14031ff7e:	f2 44 0f 10 2d f1 01 	movsd  xmm13,QWORD PTR [rip+0x5301f1]        # 0x140850178
   14031ff85:	53 00 
   14031ff87:	44 0f 29 74 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm14
   14031ff8d:	f2 44 0f 10 35 da 01 	movsd  xmm14,QWORD PTR [rip+0x5301da]        # 0x140850170
   14031ff94:	53 00 
   14031ff96:	44 0f 29 7c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm15
   14031ff9c:	f3 44 0f 10 3d 4b 03 	movss  xmm15,DWORD PTR [rip+0x53034b]        # 0x1408502f0
   14031ffa3:	53 00 
   14031ffa5:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   14031ffaa:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   14031ffb0:	8b 00                	mov    eax,DWORD PTR [rax]
   14031ffb2:	41 8b c8             	mov    ecx,r8d
   14031ffb5:	41 3b c0             	cmp    eax,r8d
   14031ffb8:	0f 42 c8             	cmovb  ecx,eax
   14031ffbb:	44 3b f1             	cmp    r14d,ecx
   14031ffbe:	0f 83 83 04 00 00    	jae    0x140320447
   14031ffc4:	85 f6                	test   esi,esi
   14031ffc6:	74 15                	je     0x14031ffdd
   14031ffc8:	41 8b c6             	mov    eax,r14d
   14031ffcb:	2b c2                	sub    eax,edx
   14031ffcd:	83 f8 04             	cmp    eax,0x4
   14031ffd0:	72 0b                	jb     0x14031ffdd
   14031ffd2:	ff ce                	dec    esi
   14031ffd4:	44 89 74 24 20       	mov    DWORD PTR [rsp+0x20],r14d
   14031ffd9:	89 74 24 24          	mov    DWORD PTR [rsp+0x24],esi
   14031ffdd:	4d 8b 99 78 06 00 00 	mov    r11,QWORD PTR [r9+0x678]
   14031ffe4:	33 db                	xor    ebx,ebx
   14031ffe6:	41 8b c6             	mov    eax,r14d
   14031ffe9:	45 33 d2             	xor    r10d,r10d
   14031ffec:	48 69 f8 04 96 00 00 	imul   rdi,rax,0x9604
   14031fff3:	41 0f 28 d7          	movaps xmm2,xmm15
   14031fff7:	42 0f b7 ac 1f 00 96 	movzx  ebp,WORD PTR [rdi+r11*1+0x9600]
   14031fffe:	00 00 
   140320000:	83 fd 04             	cmp    ebp,0x4
   140320003:	0f 82 a6 01 00 00    	jb     0x1403201af
   140320009:	4d 8d 43 0c          	lea    r8,[r11+0xc]
   14032000d:	4c 03 c7             	add    r8,rdi
   140320010:	8d 75 fd             	lea    esi,[rbp-0x3]
   140320013:	44 8d 4b 02          	lea    r9d,[rbx+0x2]
   140320017:	41 80 78 02 01       	cmp    BYTE PTR [r8+0x2],0x1
   14032001c:	75 4e                	jne    0x14032006c
   14032001e:	41 0f bf 08          	movsx  ecx,WORD PTR [r8]
   140320022:	41 0f bf c4          	movsx  eax,r12w
   140320026:	2b c1                	sub    eax,ecx
   140320028:	99                   	cdq
   140320029:	33 c2                	xor    eax,edx
   14032002b:	2b c2                	sub    eax,edx
   14032002d:	3d 00 70 00 00       	cmp    eax,0x7000
   140320032:	7f 38                	jg     0x14032006c
   140320034:	f3 41 0f 10 48 f4    	movss  xmm1,DWORD PTR [r8-0xc]
   14032003a:	0f 2f ce             	comiss xmm1,xmm6
   14032003d:	76 06                	jbe    0x140320045
   14032003f:	f3 0f 5c ce          	subss  xmm1,xmm6
   140320043:	eb 0a                	jmp    0x14032004f
   140320045:	0f 28 c6             	movaps xmm0,xmm6
   140320048:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032004c:	0f 28 c8             	movaps xmm1,xmm0
   14032004f:	48 85 db             	test   rbx,rbx
   140320052:	74 05                	je     0x140320059
   140320054:	0f 2f d1             	comiss xmm2,xmm1
   140320057:	76 13                	jbe    0x14032006c
   140320059:	41 8b c2             	mov    eax,r10d
   14032005c:	0f 28 d1             	movaps xmm2,xmm1
   14032005f:	48 69 d8 90 01 00 00 	imul   rbx,rax,0x190
   140320066:	48 03 df             	add    rbx,rdi
   140320069:	49 03 db             	add    rbx,r11
   14032006c:	41 80 b8 92 01 00 00 	cmp    BYTE PTR [r8+0x192],0x1
   140320073:	01 
   140320074:	75 56                	jne    0x1403200cc
   140320076:	41 0f bf 88 90 01 00 	movsx  ecx,WORD PTR [r8+0x190]
   14032007d:	00 
   14032007e:	41 0f bf c4          	movsx  eax,r12w
   140320082:	2b c1                	sub    eax,ecx
   140320084:	99                   	cdq
   140320085:	33 c2                	xor    eax,edx
   140320087:	2b c2                	sub    eax,edx
   140320089:	3d 00 70 00 00       	cmp    eax,0x7000
   14032008e:	7f 3c                	jg     0x1403200cc
   140320090:	f3 41 0f 10 88 84 01 	movss  xmm1,DWORD PTR [r8+0x184]
   140320097:	00 00 
   140320099:	0f 2f ce             	comiss xmm1,xmm6
   14032009c:	76 06                	jbe    0x1403200a4
   14032009e:	f3 0f 5c ce          	subss  xmm1,xmm6
   1403200a2:	eb 0a                	jmp    0x1403200ae
   1403200a4:	0f 28 c6             	movaps xmm0,xmm6
   1403200a7:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403200ab:	0f 28 c8             	movaps xmm1,xmm0
   1403200ae:	48 85 db             	test   rbx,rbx
   1403200b1:	74 05                	je     0x1403200b8
   1403200b3:	0f 2f d1             	comiss xmm2,xmm1
   1403200b6:	76 14                	jbe    0x1403200cc
   1403200b8:	41 8d 49 ff          	lea    ecx,[r9-0x1]
   1403200bc:	0f 28 d1             	movaps xmm2,xmm1
   1403200bf:	48 69 d9 90 01 00 00 	imul   rbx,rcx,0x190
   1403200c6:	48 03 df             	add    rbx,rdi
   1403200c9:	49 03 db             	add    rbx,r11
   1403200cc:	41 80 b8 22 03 00 00 	cmp    BYTE PTR [r8+0x322],0x1
   1403200d3:	01 
   1403200d4:	75 55                	jne    0x14032012b
   1403200d6:	41 0f bf 88 20 03 00 	movsx  ecx,WORD PTR [r8+0x320]
   1403200dd:	00 
   1403200de:	41 0f bf c4          	movsx  eax,r12w
   1403200e2:	2b c1                	sub    eax,ecx
   1403200e4:	99                   	cdq
   1403200e5:	33 c2                	xor    eax,edx
   1403200e7:	2b c2                	sub    eax,edx
   1403200e9:	3d 00 70 00 00       	cmp    eax,0x7000
   1403200ee:	7f 3b                	jg     0x14032012b
   1403200f0:	f3 41 0f 10 88 14 03 	movss  xmm1,DWORD PTR [r8+0x314]
   1403200f7:	00 00 
   1403200f9:	0f 2f ce             	comiss xmm1,xmm6
   1403200fc:	76 06                	jbe    0x140320104
   1403200fe:	f3 0f 5c ce          	subss  xmm1,xmm6
   140320102:	eb 0a                	jmp    0x14032010e
   140320104:	0f 28 c6             	movaps xmm0,xmm6
   140320107:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032010b:	0f 28 c8             	movaps xmm1,xmm0
   14032010e:	48 85 db             	test   rbx,rbx
   140320111:	74 05                	je     0x140320118
   140320113:	0f 2f d1             	comiss xmm2,xmm1
   140320116:	76 13                	jbe    0x14032012b
   140320118:	41 8b c1             	mov    eax,r9d
   14032011b:	0f 28 d1             	movaps xmm2,xmm1
   14032011e:	48 69 d8 90 01 00 00 	imul   rbx,rax,0x190
   140320125:	48 03 df             	add    rbx,rdi
   140320128:	49 03 db             	add    rbx,r11
   14032012b:	41 80 b8 b2 04 00 00 	cmp    BYTE PTR [r8+0x4b2],0x1
   140320132:	01 
   140320133:	75 56                	jne    0x14032018b
   140320135:	41 0f bf 88 b0 04 00 	movsx  ecx,WORD PTR [r8+0x4b0]
   14032013c:	00 
   14032013d:	41 0f bf c4          	movsx  eax,r12w
   140320141:	2b c1                	sub    eax,ecx
   140320143:	99                   	cdq
   140320144:	33 c2                	xor    eax,edx
   140320146:	2b c2                	sub    eax,edx
   140320148:	3d 00 70 00 00       	cmp    eax,0x7000
   14032014d:	7f 3c                	jg     0x14032018b
   14032014f:	f3 41 0f 10 88 a4 04 	movss  xmm1,DWORD PTR [r8+0x4a4]
   140320156:	00 00 
   140320158:	0f 2f ce             	comiss xmm1,xmm6
   14032015b:	76 06                	jbe    0x140320163
   14032015d:	f3 0f 5c ce          	subss  xmm1,xmm6
   140320161:	eb 0a                	jmp    0x14032016d
   140320163:	0f 28 c6             	movaps xmm0,xmm6
   140320166:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032016a:	0f 28 c8             	movaps xmm1,xmm0
   14032016d:	48 85 db             	test   rbx,rbx
   140320170:	74 05                	je     0x140320177
   140320172:	0f 2f d1             	comiss xmm2,xmm1
   140320175:	76 14                	jbe    0x14032018b
   140320177:	41 8d 49 01          	lea    ecx,[r9+0x1]
   14032017b:	0f 28 d1             	movaps xmm2,xmm1
   14032017e:	48 69 d9 90 01 00 00 	imul   rbx,rcx,0x190
   140320185:	48 03 df             	add    rbx,rdi
   140320188:	49 03 db             	add    rbx,r11
   14032018b:	49 81 c0 40 06 00 00 	add    r8,0x640
   140320192:	41 83 c2 04          	add    r10d,0x4
   140320196:	41 83 c1 04          	add    r9d,0x4
   14032019a:	44 3b d6             	cmp    r10d,esi
   14032019d:	0f 82 74 fe ff ff    	jb     0x140320017
   1403201a3:	8b 74 24 24          	mov    esi,DWORD PTR [rsp+0x24]
   1403201a7:	4c 8b 8c 24 30 01 00 	mov    r9,QWORD PTR [rsp+0x130]
   1403201ae:	00 
   1403201af:	44 3b d5             	cmp    r10d,ebp
   1403201b2:	0f 83 7f 00 00 00    	jae    0x140320237
   1403201b8:	4d 8b 89 78 06 00 00 	mov    r9,QWORD PTR [r9+0x678]
   1403201bf:	41 8b c2             	mov    eax,r10d
   1403201c2:	48 69 c8 90 01 00 00 	imul   rcx,rax,0x190
   1403201c9:	4d 8d 41 0c          	lea    r8,[r9+0xc]
   1403201cd:	48 03 cf             	add    rcx,rdi
   1403201d0:	4c 03 c1             	add    r8,rcx
   1403201d3:	41 80 78 02 01       	cmp    BYTE PTR [r8+0x2],0x1
   1403201d8:	75 4e                	jne    0x140320228
   1403201da:	41 0f bf 08          	movsx  ecx,WORD PTR [r8]
   1403201de:	41 0f bf c4          	movsx  eax,r12w
   1403201e2:	2b c1                	sub    eax,ecx
   1403201e4:	99                   	cdq
   1403201e5:	33 c2                	xor    eax,edx
   1403201e7:	2b c2                	sub    eax,edx
   1403201e9:	3d 00 70 00 00       	cmp    eax,0x7000
   1403201ee:	7f 38                	jg     0x140320228
   1403201f0:	f3 41 0f 10 48 f4    	movss  xmm1,DWORD PTR [r8-0xc]
   1403201f6:	0f 2f ce             	comiss xmm1,xmm6
   1403201f9:	76 06                	jbe    0x140320201
   1403201fb:	f3 0f 5c ce          	subss  xmm1,xmm6
   1403201ff:	eb 0a                	jmp    0x14032020b
   140320201:	0f 28 c6             	movaps xmm0,xmm6
   140320204:	f3 0f 5c c1          	subss  xmm0,xmm1
   140320208:	0f 28 c8             	movaps xmm1,xmm0
   14032020b:	48 85 db             	test   rbx,rbx
   14032020e:	74 05                	je     0x140320215
   140320210:	0f 2f d1             	comiss xmm2,xmm1
   140320213:	76 13                	jbe    0x140320228
   140320215:	41 8b c2             	mov    eax,r10d
   140320218:	0f 28 d1             	movaps xmm2,xmm1
   14032021b:	48 69 d8 90 01 00 00 	imul   rbx,rax,0x190
   140320222:	48 03 df             	add    rbx,rdi
   140320225:	49 03 d9             	add    rbx,r9
   140320228:	49 81 c0 90 01 00 00 	add    r8,0x190
   14032022f:	41 ff c2             	inc    r10d
   140320232:	44 3b d5             	cmp    r10d,ebp
   140320235:	72 9c                	jb     0x1403201d3
   140320237:	48 85 db             	test   rbx,rbx
   14032023a:	0f 84 c7 01 00 00    	je     0x140320407
   140320240:	44 0f 2e c7          	ucomiss xmm8,xmm7
   140320244:	7a 08                	jp     0x14032024e
   140320246:	75 06                	jne    0x14032024e
   140320248:	41 0f 28 cc          	movaps xmm1,xmm12
   14032024c:	eb 04                	jmp    0x140320252
   14032024e:	41 0f 28 c8          	movaps xmm1,xmm8
   140320252:	f3 0f 10 53 14       	movss  xmm2,DWORD PTR [rbx+0x14]
   140320257:	41 0f 2f d1          	comiss xmm2,xmm9
   14032025b:	f3 0f 10 1b          	movss  xmm3,DWORD PTR [rbx]
   14032025f:	76 16                	jbe    0x140320277
   140320261:	0f 28 c2             	movaps xmm0,xmm2
   140320264:	f3 41 0f 5c c1       	subss  xmm0,xmm9
   140320269:	0f 2f c8             	comiss xmm1,xmm0
   14032026c:	77 27                	ja     0x140320295
   14032026e:	0f 28 c3             	movaps xmm0,xmm3
   140320271:	f3 0f 5c c6          	subss  xmm0,xmm6
   140320275:	eb 14                	jmp    0x14032028b
   140320277:	41 0f 28 c1          	movaps xmm0,xmm9
   14032027b:	f3 0f 5c c2          	subss  xmm0,xmm2
   14032027f:	0f 2f c8             	comiss xmm1,xmm0
   140320282:	77 11                	ja     0x140320295
   140320284:	0f 28 c6             	movaps xmm0,xmm6
   140320287:	f3 0f 5c c3          	subss  xmm0,xmm3
   14032028b:	44 0f 2f d8          	comiss xmm11,xmm0
   14032028f:	0f 86 72 01 00 00    	jbe    0x140320407
   140320295:	44 0f 2e c7          	ucomiss xmm8,xmm7
   140320299:	7a 09                	jp     0x1403202a4
   14032029b:	75 07                	jne    0x1403202a4
   14032029d:	0f 28 f3             	movaps xmm6,xmm3
   1403202a0:	44 0f 28 ca          	movaps xmm9,xmm2
   1403202a4:	44 0f b7 63 0c       	movzx  r12d,WORD PTR [rbx+0xc]
   1403202a9:	41 8d 46 01          	lea    eax,[r14+0x1]
   1403202ad:	66 44 89 a4 24 40 01 	mov    WORD PTR [rsp+0x140],r12w
   1403202b4:	00 00 
   1403202b6:	88 84 24 50 01 00 00 	mov    BYTE PTR [rsp+0x150],al
   1403202bd:	4d 85 ed             	test   r13,r13
   1403202c0:	74 0b                	je     0x1403202cd
   1403202c2:	45 85 ff             	test   r15d,r15d
   1403202c5:	74 06                	je     0x1403202cd
   1403202c7:	41 0f 28 c5          	movaps xmm0,xmm13
   1403202cb:	eb 14                	jmp    0x1403202e1
   1403202cd:	41 8b c6             	mov    eax,r14d
   1403202d0:	0f 57 c9             	xorps  xmm1,xmm1
   1403202d3:	41 0f 28 c6          	movaps xmm0,xmm14
   1403202d7:	f2 48 0f 2a c8       	cvtsi2sd xmm1,rax
   1403202dc:	e8 99 0a 30 00       	call   0x140620d7a
   1403202e1:	48 8b ac 24 38 01 00 	mov    rbp,QWORD PTR [rsp+0x138]
   1403202e8:	00 
   1403202e9:	33 d2                	xor    edx,edx
   1403202eb:	0f 57 db             	xorps  xmm3,xmm3
   1403202ee:	f2 0f 5a d8          	cvtsd2ss xmm3,xmm0
   1403202f2:	38 95 92 0d 00 00    	cmp    BYTE PTR [rbp+0xd92],dl
   1403202f8:	0f 86 eb 00 00 00    	jbe    0x1403203e9
   1403202fe:	48 8b bc 24 48 01 00 	mov    rdi,QWORD PTR [rsp+0x148]
   140320305:	00 
   140320306:	4c 8d 43 10          	lea    r8,[rbx+0x10]
   14032030a:	44 8b 64 24 28       	mov    r12d,DWORD PTR [rsp+0x28]
   14032030f:	90                   	nop
   140320310:	4d 85 ed             	test   r13,r13
   140320313:	74 4e                	je     0x140320363
   140320315:	45 85 ff             	test   r15d,r15d
   140320318:	74 07                	je     0x140320321
   14032031a:	44 3b 74 24 30       	cmp    r14d,DWORD PTR [rsp+0x30]
   14032031f:	73 42                	jae    0x140320363
   140320321:	0f 28 c3             	movaps xmm0,xmm3
   140320324:	f3 41 0f 59 00       	mulss  xmm0,DWORD PTR [r8]
   140320329:	45 85 ff             	test   r15d,r15d
   14032032c:	74 09                	je     0x140320337
   14032032e:	43 8d 04 76          	lea    eax,[r14+r14*2]
   140320332:	c1 e0 04             	shl    eax,0x4
   140320335:	eb 02                	jmp    0x140320339
   140320337:	33 c0                	xor    eax,eax
   140320339:	03 c2                	add    eax,edx
   14032033b:	f3 41 0f 10 4c 85 00 	movss  xmm1,DWORD PTR [r13+rax*4+0x0]
   140320342:	0f 2f c1             	comiss xmm0,xmm1
   140320345:	77 03                	ja     0x14032034a
   140320347:	0f 28 c1             	movaps xmm0,xmm1
   14032034a:	45 85 ff             	test   r15d,r15d
   14032034d:	74 09                	je     0x140320358
   14032034f:	43 8d 04 76          	lea    eax,[r14+r14*2]
   140320353:	c1 e0 04             	shl    eax,0x4
   140320356:	eb 02                	jmp    0x14032035a
   140320358:	33 c0                	xor    eax,eax
   14032035a:	03 c2                	add    eax,edx
   14032035c:	f3 41 0f 11 44 85 00 	movss  DWORD PTR [r13+rax*4+0x0],xmm0
   140320363:	48 85 ff             	test   rdi,rdi
   140320366:	74 63                	je     0x1403203cb
   140320368:	44 3b f6             	cmp    r14d,esi
   14032036b:	74 07                	je     0x140320374
   14032036d:	45 85 ff             	test   r15d,r15d
   140320370:	74 59                	je     0x1403203cb
   140320372:	eb 05                	jmp    0x140320379
   140320374:	45 85 ff             	test   r15d,r15d
   140320377:	74 05                	je     0x14032037e
   140320379:	45 3b f4             	cmp    r14d,r12d
   14032037c:	73 4d                	jae    0x1403203cb
   14032037e:	f3 0f 10 53 08       	movss  xmm2,DWORD PTR [rbx+0x8]
   140320383:	8d 42 01             	lea    eax,[rdx+0x1]
   140320386:	0f 2f d7             	comiss xmm2,xmm7
   140320389:	66 0f 6e c0          	movd   xmm0,eax
   14032038d:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140320390:	0f 28 c8             	movaps xmm1,xmm0
   140320393:	f3 0f 59 0b          	mulss  xmm1,DWORD PTR [rbx]
   140320397:	76 18                	jbe    0x1403203b1
   140320399:	f3 0f 59 c0          	mulss  xmm0,xmm0
   14032039d:	f3 41 0f 5c c2       	subss  xmm0,xmm10
   1403203a2:	f3 0f 59 c2          	mulss  xmm0,xmm2
   1403203a6:	f3 41 0f 58 c2       	addss  xmm0,xmm10
   1403203ab:	f3 0f 59 c1          	mulss  xmm0,xmm1
   1403203af:	eb 03                	jmp    0x1403203b4
   1403203b1:	0f 28 c1             	movaps xmm0,xmm1
   1403203b4:	45 85 ff             	test   r15d,r15d
   1403203b7:	74 09                	je     0x1403203c2
   1403203b9:	43 8d 04 76          	lea    eax,[r14+r14*2]
   1403203bd:	c1 e0 04             	shl    eax,0x4
   1403203c0:	eb 02                	jmp    0x1403203c4
   1403203c2:	33 c0                	xor    eax,eax
   1403203c4:	03 c2                	add    eax,edx
   1403203c6:	f3 0f 11 04 87       	movss  DWORD PTR [rdi+rax*4],xmm0
   1403203cb:	0f b6 85 92 0d 00 00 	movzx  eax,BYTE PTR [rbp+0xd92]
   1403203d2:	ff c2                	inc    edx
   1403203d4:	49 83 c0 08          	add    r8,0x8
   1403203d8:	3b d0                	cmp    edx,eax
   1403203da:	0f 8c 30 ff ff ff    	jl     0x140320310
   1403203e0:	44 0f b7 a4 24 40 01 	movzx  r12d,WORD PTR [rsp+0x140]
   1403203e7:	00 00 
   1403203e9:	8b 54 24 20          	mov    edx,DWORD PTR [rsp+0x20]
   1403203ed:	41 ff c6             	inc    r14d
   1403203f0:	44 8b 44 24 2c       	mov    r8d,DWORD PTR [rsp+0x2c]
   1403203f5:	4c 8b 8c 24 30 01 00 	mov    r9,QWORD PTR [rsp+0x130]
   1403203fc:	00 
   1403203fd:	48 8b 44 24 38       	mov    rax,QWORD PTR [rsp+0x38]
   140320402:	e9 a9 fb ff ff       	jmp    0x14031ffb0
   140320407:	44 0f 2f c7          	comiss xmm8,xmm7
   14032040b:	77 0a                	ja     0x140320417
   14032040d:	b8 02 00 00 00       	mov    eax,0x2
   140320412:	45 85 f6             	test   r14d,r14d
   140320415:	75 05                	jne    0x14032041c
   140320417:	b8 01 00 00 00       	mov    eax,0x1
   14032041c:	ff c6                	inc    esi
   14032041e:	89 74 24 24          	mov    DWORD PTR [rsp+0x24],esi
   140320422:	3b f0                	cmp    esi,eax
   140320424:	73 21                	jae    0x140320447
   140320426:	44 8b 44 24 2c       	mov    r8d,DWORD PTR [rsp+0x2c]
   14032042b:	41 8b d6             	mov    edx,r14d
   14032042e:	4c 8b 8c 24 30 01 00 	mov    r9,QWORD PTR [rsp+0x130]
   140320435:	00 
   140320436:	41 ff c6             	inc    r14d
   140320439:	48 8b 44 24 38       	mov    rax,QWORD PTR [rsp+0x38]
   14032043e:	89 54 24 20          	mov    DWORD PTR [rsp+0x20],edx
   140320442:	e9 69 fb ff ff       	jmp    0x14031ffb0
   140320447:	0f b6 84 24 50 01 00 	movzx  eax,BYTE PTR [rsp+0x150]
   14032044e:	00 
   14032044f:	44 0f 28 74 24 50    	movaps xmm14,XMMWORD PTR [rsp+0x50]
   140320455:	44 0f 28 6c 24 60    	movaps xmm13,XMMWORD PTR [rsp+0x60]
   14032045b:	44 0f 28 64 24 70    	movaps xmm12,XMMWORD PTR [rsp+0x70]
   140320461:	44 0f 28 9c 24 80 00 	movaps xmm11,XMMWORD PTR [rsp+0x80]
   140320468:	00 00 
   14032046a:	44 0f 28 94 24 90 00 	movaps xmm10,XMMWORD PTR [rsp+0x90]
   140320471:	00 00 
   140320473:	44 0f 28 8c 24 a0 00 	movaps xmm9,XMMWORD PTR [rsp+0xa0]
   14032047a:	00 00 
   14032047c:	44 0f 28 84 24 b0 00 	movaps xmm8,XMMWORD PTR [rsp+0xb0]
   140320483:	00 00 
   140320485:	4c 8b a4 24 e8 00 00 	mov    r12,QWORD PTR [rsp+0xe8]
   14032048c:	00 
   14032048d:	44 0f 28 7c 24 40    	movaps xmm15,XMMWORD PTR [rsp+0x40]
   140320493:	0f 28 b4 24 d0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xd0]
   14032049a:	00 
   14032049b:	0f 28 bc 24 c0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xc0]
   1403204a2:	00 
   1403204a3:	48 81 c4 f0 00 00 00 	add    rsp,0xf0
   1403204aa:	41 5f                	pop    r15
   1403204ac:	41 5e                	pop    r14
   1403204ae:	41 5d                	pop    r13
   1403204b0:	5f                   	pop    rdi
   1403204b1:	5e                   	pop    rsi
   1403204b2:	5d                   	pop    rbp
   1403204b3:	5b                   	pop    rbx
   1403204b4:	c3                   	ret
   1403204b5:	cc                   	int3
   1403204b6:	cc                   	int3
   1403204b7:	cc                   	int3
   1403204b8:	cc                   	int3
   1403204b9:	cc                   	int3
   1403204ba:	cc                   	int3
   1403204bb:	cc                   	int3
   1403204bc:	cc                   	int3
   1403204bd:	cc                   	int3
   1403204be:	cc                   	int3
   1403204bf:	cc                   	int3
