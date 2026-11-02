
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014037be30 <.text+0x37ae30>:
   14037be30:	40 53                	rex push rbx
   14037be32:	56                   	push   rsi
   14037be33:	57                   	push   rdi
   14037be34:	41 55                	push   r13
   14037be36:	41 56                	push   r14
   14037be38:	41 57                	push   r15
   14037be3a:	48 81 ec b8 02 00 00 	sub    rsp,0x2b8
   14037be41:	48 8b 05 20 63 5f 00 	mov    rax,QWORD PTR [rip+0x5f6320]        # 0x140972168
   14037be48:	48 33 c4             	xor    rax,rsp
   14037be4b:	48 89 84 24 00 02 00 	mov    QWORD PTR [rsp+0x200],rax
   14037be52:	00 
   14037be53:	48 8b 84 24 10 03 00 	mov    rax,QWORD PTR [rsp+0x310]
   14037be5a:	00 
   14037be5b:	48 8b f1             	mov    rsi,rcx
   14037be5e:	4c 8b ac 24 28 03 00 	mov    r13,QWORD PTR [rsp+0x328]
   14037be65:	00 
   14037be66:	49 8b f9             	mov    rdi,r9
   14037be69:	48 89 44 24 48       	mov    QWORD PTR [rsp+0x48],rax
   14037be6e:	45 8b f0             	mov    r14d,r8d
   14037be71:	8b 84 24 40 03 00 00 	mov    eax,DWORD PTR [rsp+0x340]
   14037be78:	4c 8b fa             	mov    r15,rdx
   14037be7b:	48 89 4c 24 30       	mov    QWORD PTR [rsp+0x30],rcx
   14037be80:	48 8b 8c 24 18 03 00 	mov    rcx,QWORD PTR [rsp+0x318]
   14037be87:	00 
   14037be88:	4c 89 4c 24 40       	mov    QWORD PTR [rsp+0x40],r9
   14037be8d:	48 8b d9             	mov    rbx,rcx
   14037be90:	44 89 44 24 24       	mov    DWORD PTR [rsp+0x24],r8d
   14037be95:	48 89 54 24 38       	mov    QWORD PTR [rsp+0x38],rdx
   14037be9a:	48 89 4c 24 50       	mov    QWORD PTR [rsp+0x50],rcx
   14037be9f:	48 89 4c 24 28       	mov    QWORD PTR [rsp+0x28],rcx
   14037bea4:	85 c0                	test   eax,eax
   14037bea6:	79 15                	jns    0x14037bebd
   14037bea8:	8b 05 02 e3 60 00    	mov    eax,DWORD PTR [rip+0x60e302]        # 0x14098a1b0
   14037beae:	89 84 24 40 03 00 00 	mov    DWORD PTR [rsp+0x340],eax
   14037beb5:	85 c0                	test   eax,eax
   14037beb7:	0f 88 eb 04 00 00    	js     0x14037c3a8
   14037bebd:	3b 05 0d 4f 63 14    	cmp    eax,DWORD PTR [rip+0x14634f0d]        # 0x1549b0dd0
   14037bec3:	0f 8d df 04 00 00    	jge    0x14037c3a8
   14037bec9:	48 89 ac 24 f0 02 00 	mov    QWORD PTR [rsp+0x2f0],rbp
   14037bed0:	00 
   14037bed1:	4c 89 a4 24 b0 02 00 	mov    QWORD PTR [rsp+0x2b0],r12
   14037bed8:	00 
   14037bed9:	0f 29 b4 24 a0 02 00 	movaps XMMWORD PTR [rsp+0x2a0],xmm6
   14037bee0:	00 
   14037bee1:	0f 29 bc 24 90 02 00 	movaps XMMWORD PTR [rsp+0x290],xmm7
   14037bee8:	00 
   14037bee9:	44 0f 29 84 24 80 02 	movaps XMMWORD PTR [rsp+0x280],xmm8
   14037bef0:	00 00 
   14037bef2:	44 0f 29 8c 24 70 02 	movaps XMMWORD PTR [rsp+0x270],xmm9
   14037bef9:	00 00 
   14037befb:	44 0f 29 94 24 60 02 	movaps XMMWORD PTR [rsp+0x260],xmm10
   14037bf02:	00 00 
   14037bf04:	44 0f 29 9c 24 50 02 	movaps XMMWORD PTR [rsp+0x250],xmm11
   14037bf0b:	00 00 
   14037bf0d:	44 0f 29 a4 24 40 02 	movaps XMMWORD PTR [rsp+0x240],xmm12
   14037bf14:	00 00 
   14037bf16:	44 0f 29 ac 24 30 02 	movaps XMMWORD PTR [rsp+0x230],xmm13
   14037bf1d:	00 00 
   14037bf1f:	44 0f 29 b4 24 20 02 	movaps XMMWORD PTR [rsp+0x220],xmm14
   14037bf26:	00 00 
   14037bf28:	44 0f 29 bc 24 10 02 	movaps XMMWORD PTR [rsp+0x210],xmm15
   14037bf2f:	00 00 
   14037bf31:	c6 44 24 21 00       	mov    BYTE PTR [rsp+0x21],0x0
   14037bf36:	4d 85 ed             	test   r13,r13
   14037bf39:	75 4b                	jne    0x14037bf86
   14037bf3b:	41 8d 4d 40          	lea    ecx,[r13+0x40]
   14037bf3f:	e8 0c f7 29 00       	call   0x14061b650
   14037bf44:	4c 8b e8             	mov    r13,rax
   14037bf47:	c6 44 24 21 01       	mov    BYTE PTR [rsp+0x21],0x1
   14037bf4c:	c7 40 10 00 08 00 00 	mov    DWORD PTR [rax+0x10],0x800
   14037bf53:	c7 40 28 00 40 00 00 	mov    DWORD PTR [rax+0x28],0x4000
   14037bf5a:	48 8d 05 13 e8 b8 14 	lea    rax,[rip+0x14b8e813]        # 0x154f0a774
   14037bf61:	49 89 45 20          	mov    QWORD PTR [r13+0x20],rax
   14037bf65:	48 8d 05 04 e8 b8 14 	lea    rax,[rip+0x14b8e804]        # 0x154f0a770
   14037bf6c:	49 89 45 08          	mov    QWORD PTR [r13+0x8],rax
   14037bf70:	48 8d 05 09 e8 b8 14 	lea    rax,[rip+0x14b8e809]        # 0x154f0a780
   14037bf77:	49 89 45 18          	mov    QWORD PTR [r13+0x18],rax
   14037bf7b:	48 8d 05 ee a7 b8 14 	lea    rax,[rip+0x14b8a7ee]        # 0x154f06770
   14037bf82:	49 89 45 00          	mov    QWORD PTR [r13+0x0],rax
   14037bf86:	48 85 db             	test   rbx,rbx
   14037bf89:	75 12                	jne    0x14037bf9d
   14037bf8b:	b9 80 00 00 00       	mov    ecx,0x80
   14037bf90:	e8 cb f5 29 00       	call   0x14061b560
   14037bf95:	48 8b d8             	mov    rbx,rax
   14037bf98:	48 89 44 24 28       	mov    QWORD PTR [rsp+0x28],rax
   14037bf9d:	33 d2                	xor    edx,edx
   14037bf9f:	41 b8 80 00 00 00    	mov    r8d,0x80
   14037bfa5:	48 8b cb             	mov    rcx,rbx
   14037bfa8:	e8 3d 4d 2a 00       	call   0x140620cea
   14037bfad:	41 c7 07 ff ff ff ff 	mov    DWORD PTR [r15],0xffffffff
   14037bfb4:	45 0f 57 db          	xorps  xmm11,xmm11
   14037bfb8:	0f b6 0e             	movzx  ecx,BYTE PTR [rsi]
   14037bfbb:	0f 57 ff             	xorps  xmm7,xmm7
   14037bfbe:	45 0f 57 c0          	xorps  xmm8,xmm8
   14037bfc2:	84 c9                	test   cl,cl
   14037bfc4:	74 19                	je     0x14037bfdf
   14037bfc6:	48 8d 46 04          	lea    rax,[rsi+0x4]
   14037bfca:	0f b6 c9             	movzx  ecx,cl
   14037bfcd:	0f 1f 00             	nop    DWORD PTR [rax]
   14037bfd0:	f3 44 0f 58 00       	addss  xmm8,DWORD PTR [rax]
   14037bfd5:	48 83 c0 04          	add    rax,0x4
   14037bfd9:	48 83 e9 01          	sub    rcx,0x1
   14037bfdd:	75 f1                	jne    0x14037bfd0
   14037bfdf:	48 85 ff             	test   rdi,rdi
   14037bfe2:	74 10                	je     0x14037bff4
   14037bfe4:	33 d2                	xor    edx,edx
   14037bfe6:	41 b8 00 02 00 00    	mov    r8d,0x200
   14037bfec:	48 8b cf             	mov    rcx,rdi
   14037bfef:	e8 f6 4c 2a 00       	call   0x140620cea
   14037bff4:	8b 94 24 30 03 00 00 	mov    edx,DWORD PTR [rsp+0x330]
   14037bffb:	40 b7 05             	mov    dil,0x5
   14037bffe:	0f b6 b4 24 20 03 00 	movzx  esi,BYTE PTR [rsp+0x320]
   14037c005:	00 
   14037c006:	f3 44 0f 10 15 89 b1 	movss  xmm10,DWORD PTR [rip+0x31b189]        # 0x140697198
   14037c00d:	31 00 
   14037c00f:	f3 44 0f 10 0d c4 3f 	movss  xmm9,DWORD PTR [rip+0x4d3fc4]        # 0x14084ffdc
   14037c016:	4d 00 
   14037c018:	f3 44 0f 10 25 0f 40 	movss  xmm12,DWORD PTR [rip+0x4d400f]        # 0x140850030
   14037c01f:	4d 00 
   14037c021:	f3 44 0f 10 2d 2a b1 	movss  xmm13,DWORD PTR [rip+0x31b12a]        # 0x140697154
   14037c028:	31 00 
   14037c02a:	f3 44 0f 10 35 1d b1 	movss  xmm14,DWORD PTR [rip+0x31b11d]        # 0x140697150
   14037c031:	31 00 
   14037c033:	f3 44 0f 10 3d 08 b1 	movss  xmm15,DWORD PTR [rip+0x31b108]        # 0x140697144
   14037c03a:	31 00 
   14037c03c:	40 88 7c 24 20       	mov    BYTE PTR [rsp+0x20],dil
   14037c041:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14037c045:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14037c04c:	00 00 00 00 
   14037c050:	49 8b 45 20          	mov    rax,QWORD PTR [r13+0x20]
   14037c054:	45 33 e4             	xor    r12d,r12d
   14037c057:	44 39 20             	cmp    DWORD PTR [rax],r12d
   14037c05a:	0f 86 51 02 00 00    	jbe    0x14037c2b1
   14037c060:	49 8b 45 18          	mov    rax,QWORD PTR [r13+0x18]
   14037c064:	4e 8b 14 e0          	mov    r10,QWORD PTR [rax+r12*8]
   14037c068:	49 8b 45 00          	mov    rax,QWORD PTR [r13+0x0]
   14037c06c:	41 8b 8a 88 01 00 00 	mov    ecx,DWORD PTR [r10+0x188]
   14037c073:	4c 8b 1c c8          	mov    r11,QWORD PTR [rax+rcx*8]
   14037c077:	45 0f b6 7b 08       	movzx  r15d,BYTE PTR [r11+0x8]
   14037c07c:	44 3a ff             	cmp    r15b,dil
   14037c07f:	0f 85 1c 02 00 00    	jne    0x14037c2a1
   14037c085:	3b ca                	cmp    ecx,edx
   14037c087:	0f 84 14 02 00 00    	je     0x14037c2a1
   14037c08d:	41 0f b6 02          	movzx  eax,BYTE PTR [r10]
   14037c091:	88 44 24 60          	mov    BYTE PTR [rsp+0x60],al
   14037c095:	84 c0                	test   al,al
   14037c097:	74 4c                	je     0x14037c0e5
   14037c099:	4c 8d 44 24 64       	lea    r8,[rsp+0x64]
   14037c09e:	0f b6 d0             	movzx  edx,al
   14037c0a1:	4d 2b c2             	sub    r8,r10
   14037c0a4:	4c 8d 4c 24 60       	lea    r9,[rsp+0x60]
   14037c0a9:	4d 2b ca             	sub    r9,r10
   14037c0ac:	49 8d 8a c4 00 00 00 	lea    rcx,[r10+0xc4]
   14037c0b3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14037c0b7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14037c0be:	00 00 
   14037c0c0:	8b 81 40 ff ff ff    	mov    eax,DWORD PTR [rcx-0xc0]
   14037c0c6:	41 89 84 08 3c ff ff 	mov    DWORD PTR [r8+rcx*1-0xc4],eax
   14037c0cd:	ff 
   14037c0ce:	8b 01                	mov    eax,DWORD PTR [rcx]
   14037c0d0:	41 89 04 09          	mov    DWORD PTR [r9+rcx*1],eax
   14037c0d4:	48 8d 49 04          	lea    rcx,[rcx+0x4]
   14037c0d8:	48 83 ea 01          	sub    rdx,0x1
   14037c0dc:	75 e2                	jne    0x14037c0c0
   14037c0de:	8b 94 24 30 03 00 00 	mov    edx,DWORD PTR [rsp+0x330]
   14037c0e5:	f3 41 0f 10 82 84 01 	movss  xmm0,DWORD PTR [r10+0x184]
   14037c0ec:	00 00 
   14037c0ee:	41 8b 6b 04          	mov    ebp,DWORD PTR [r11+0x4]
   14037c0f2:	41 0f b6 3b          	movzx  edi,BYTE PTR [r11]
   14037c0f6:	f3 0f 11 84 24 e4 01 	movss  DWORD PTR [rsp+0x1e4],xmm0
   14037c0fd:	00 00 
   14037c0ff:	89 ac 24 ec 01 00 00 	mov    DWORD PTR [rsp+0x1ec],ebp
   14037c106:	40 88 bc 24 e8 01 00 	mov    BYTE PTR [rsp+0x1e8],dil
   14037c10d:	00 
   14037c10e:	44 88 bc 24 f0 01 00 	mov    BYTE PTR [rsp+0x1f0],r15b
   14037c115:	00 
   14037c116:	45 85 f6             	test   r14d,r14d
   14037c119:	78 09                	js     0x14037c124
   14037c11b:	41 3b ee             	cmp    ebp,r14d
   14037c11e:	0f 85 78 01 00 00    	jne    0x14037c29c
   14037c124:	80 bc 24 38 03 00 00 	cmp    BYTE PTR [rsp+0x338],0x0
   14037c12b:	00 
   14037c12c:	75 17                	jne    0x14037c145
   14037c12e:	8b 94 24 40 03 00 00 	mov    edx,DWORD PTR [rsp+0x340]
   14037c135:	8b cd                	mov    ecx,ebp
   14037c137:	e8 f4 1d 00 00       	call   0x14037df30
   14037c13c:	48 85 c0             	test   rax,rax
   14037c13f:	0f 84 50 01 00 00    	je     0x14037c295
   14037c145:	40 84 f6             	test   sil,sil
   14037c148:	74 0b                	je     0x14037c155
   14037c14a:	44 3a 7c 1d 00       	cmp    r15b,BYTE PTR [rbp+rbx*1+0x0]
   14037c14f:	0f 82 40 01 00 00    	jb     0x14037c295
   14037c155:	48 8d 05 14 a2 b8 14 	lea    rax,[rip+0x14b8a214]        # 0x154f06370
   14037c15c:	48 8b 34 e8          	mov    rsi,QWORD PTR [rax+rbp*8]
   14037c160:	48 8b 44 24 30       	mov    rax,QWORD PTR [rsp+0x30]
   14037c165:	0f b6 98 88 01 00 00 	movzx  ebx,BYTE PTR [rax+0x188]
   14037c16c:	3a 5e 08             	cmp    bl,BYTE PTR [rsi+0x8]
   14037c16f:	0f 82 0e 01 00 00    	jb     0x14037c283
   14037c175:	3a 5e 0a             	cmp    bl,BYTE PTR [rsi+0xa]
   14037c178:	0f 87 05 01 00 00    	ja     0x14037c283
   14037c17e:	0f b6 c3             	movzx  eax,bl
   14037c181:	66 0f 6e c8          	movd   xmm1,eax
   14037c185:	40 0f b6 c7          	movzx  eax,dil
   14037c189:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14037c18c:	66 0f 6e c0          	movd   xmm0,eax
   14037c190:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14037c193:	40 3a df             	cmp    bl,dil
   14037c196:	76 06                	jbe    0x14037c19e
   14037c198:	f3 0f 5c c8          	subss  xmm1,xmm0
   14037c19c:	eb 07                	jmp    0x14037c1a5
   14037c19e:	f3 0f 5c c1          	subss  xmm0,xmm1
   14037c1a2:	0f 28 c8             	movaps xmm1,xmm0
   14037c1a5:	8b 94 24 30 03 00 00 	mov    edx,DWORD PTR [rsp+0x330]
   14037c1ac:	85 d2                	test   edx,edx
   14037c1ae:	78 0a                	js     0x14037c1ba
   14037c1b0:	41 0f 2f ca          	comiss xmm1,xmm10
   14037c1b4:	0f 87 17 01 00 00    	ja     0x14037c2d1
   14037c1ba:	0f 28 c1             	movaps xmm0,xmm1
   14037c1bd:	e8 3e ba 00 00       	call   0x140387c00
   14037c1c2:	41 0f 2e c3          	ucomiss xmm0,xmm11
   14037c1c6:	7a 06                	jp     0x14037c1ce
   14037c1c8:	0f 84 b5 00 00 00    	je     0x14037c283
   14037c1ce:	48 8b 4c 24 30       	mov    rcx,QWORD PTR [rsp+0x30]
   14037c1d3:	48 8d 54 24 60       	lea    rdx,[rsp+0x60]
   14037c1d8:	41 0f 28 d0          	movaps xmm2,xmm8
   14037c1dc:	e8 ff 01 00 00       	call   0x14037c3e0
   14037c1e1:	0f 28 f0             	movaps xmm6,xmm0
   14037c1e4:	3a 5e 09             	cmp    bl,BYTE PTR [rsi+0x9]
   14037c1e7:	76 05                	jbe    0x14037c1ee
   14037c1e9:	f3 41 0f 59 f1       	mulss  xmm6,xmm9
   14037c1ee:	0f b6 b4 24 20 03 00 	movzx  esi,BYTE PTR [rsp+0x320]
   14037c1f5:	00 
   14037c1f6:	40 84 f6             	test   sil,sil
   14037c1f9:	75 19                	jne    0x14037c214
   14037c1fb:	41 0f b6 cf          	movzx  ecx,r15b
   14037c1ff:	e8 6c ba 00 00       	call   0x140387c70
   14037c204:	48 8b 5c 24 28       	mov    rbx,QWORD PTR [rsp+0x28]
   14037c209:	f3 0f 59 f0          	mulss  xmm6,xmm0
   14037c20d:	0f 2f f7             	comiss xmm6,xmm7
   14037c210:	77 18                	ja     0x14037c22a
   14037c212:	eb 26                	jmp    0x14037c23a
   14037c214:	48 8b 5c 24 28       	mov    rbx,QWORD PTR [rsp+0x28]
   14037c219:	0f b6 44 1d 00       	movzx  eax,BYTE PTR [rbp+rbx*1+0x0]
   14037c21e:	44 3a f8             	cmp    r15b,al
   14037c221:	77 07                	ja     0x14037c22a
   14037c223:	75 15                	jne    0x14037c23a
   14037c225:	0f 2f f7             	comiss xmm6,xmm7
   14037c228:	76 10                	jbe    0x14037c23a
   14037c22a:	48 8b 44 24 38       	mov    rax,QWORD PTR [rsp+0x38]
   14037c22f:	0f 28 fe             	movaps xmm7,xmm6
   14037c232:	44 88 7c 1d 00       	mov    BYTE PTR [rbp+rbx*1+0x0],r15b
   14037c237:	44 89 20             	mov    DWORD PTR [rax],r12d
   14037c23a:	48 8b 7c 24 40       	mov    rdi,QWORD PTR [rsp+0x40]
   14037c23f:	48 85 ff             	test   rdi,rdi
   14037c242:	74 4c                	je     0x14037c290
   14037c244:	83 fd 7f             	cmp    ebp,0x7f
   14037c247:	77 47                	ja     0x14037c290
   14037c249:	0f 2f 34 af          	comiss xmm6,DWORD PTR [rdi+rbp*4]
   14037c24d:	76 41                	jbe    0x14037c290
   14037c24f:	4c 8b 7c 24 48       	mov    r15,QWORD PTR [rsp+0x48]
   14037c254:	8b 94 24 30 03 00 00 	mov    edx,DWORD PTR [rsp+0x330]
   14037c25b:	44 8b 74 24 24       	mov    r14d,DWORD PTR [rsp+0x24]
   14037c260:	f3 0f 11 34 af       	movss  DWORD PTR [rdi+rbp*4],xmm6
   14037c265:	0f b6 7c 24 20       	movzx  edi,BYTE PTR [rsp+0x20]
   14037c26a:	4d 85 ff             	test   r15,r15
   14037c26d:	74 32                	je     0x14037c2a1
   14037c26f:	49 8b 45 18          	mov    rax,QWORD PTR [r13+0x18]
   14037c273:	4a 8b 0c e0          	mov    rcx,QWORD PTR [rax+r12*8]
   14037c277:	8b 81 88 01 00 00    	mov    eax,DWORD PTR [rcx+0x188]
   14037c27d:	41 89 04 af          	mov    DWORD PTR [r15+rbp*4],eax
   14037c281:	eb 1e                	jmp    0x14037c2a1
   14037c283:	48 8b 5c 24 28       	mov    rbx,QWORD PTR [rsp+0x28]
   14037c288:	0f b6 b4 24 20 03 00 	movzx  esi,BYTE PTR [rsp+0x320]
   14037c28f:	00 
   14037c290:	44 8b 74 24 24       	mov    r14d,DWORD PTR [rsp+0x24]
   14037c295:	8b 94 24 30 03 00 00 	mov    edx,DWORD PTR [rsp+0x330]
   14037c29c:	0f b6 7c 24 20       	movzx  edi,BYTE PTR [rsp+0x20]
   14037c2a1:	49 8b 45 20          	mov    rax,QWORD PTR [r13+0x20]
   14037c2a5:	41 ff c4             	inc    r12d
   14037c2a8:	44 3b 20             	cmp    r12d,DWORD PTR [rax]
   14037c2ab:	0f 82 af fd ff ff    	jb     0x14037c060
   14037c2b1:	8d 47 ff             	lea    eax,[rdi-0x1]
   14037c2b4:	0f b6 c8             	movzx  ecx,al
   14037c2b7:	83 e9 01             	sub    ecx,0x1
   14037c2ba:	74 3b                	je     0x14037c2f7
   14037c2bc:	83 e9 01             	sub    ecx,0x1
   14037c2bf:	74 30                	je     0x14037c2f1
   14037c2c1:	83 e9 01             	sub    ecx,0x1
   14037c2c4:	74 25                	je     0x14037c2eb
   14037c2c6:	83 e9 01             	sub    ecx,0x1
   14037c2c9:	74 1a                	je     0x14037c2e5
   14037c2cb:	41 0f 28 c4          	movaps xmm0,xmm12
   14037c2cf:	eb 2e                	jmp    0x14037c2ff
   14037c2d1:	48 8b 5c 24 28       	mov    rbx,QWORD PTR [rsp+0x28]
   14037c2d6:	0f b6 b4 24 20 03 00 	movzx  esi,BYTE PTR [rsp+0x320]
   14037c2dd:	00 
   14037c2de:	44 8b 74 24 24       	mov    r14d,DWORD PTR [rsp+0x24]
   14037c2e3:	eb b7                	jmp    0x14037c29c
   14037c2e5:	41 0f 28 c5          	movaps xmm0,xmm13
   14037c2e9:	eb 14                	jmp    0x14037c2ff
   14037c2eb:	41 0f 28 c6          	movaps xmm0,xmm14
   14037c2ef:	eb 0e                	jmp    0x14037c2ff
   14037c2f1:	41 0f 28 c7          	movaps xmm0,xmm15
   14037c2f5:	eb 08                	jmp    0x14037c2ff
   14037c2f7:	f3 0f 10 05 35 ae 31 	movss  xmm0,DWORD PTR [rip+0x31ae35]        # 0x140697134
   14037c2fe:	00 
   14037c2ff:	0f 2f f8             	comiss xmm7,xmm0
   14037c302:	73 13                	jae    0x14037c317
   14037c304:	40 80 c7 ff          	add    dil,0xff
   14037c308:	40 88 7c 24 20       	mov    BYTE PTR [rsp+0x20],dil
   14037c30d:	40 80 ff 01          	cmp    dil,0x1
   14037c311:	0f 83 39 fd ff ff    	jae    0x14037c050
   14037c317:	48 83 7c 24 50 00    	cmp    QWORD PTR [rsp+0x50],0x0
   14037c31d:	44 0f 28 bc 24 10 02 	movaps xmm15,XMMWORD PTR [rsp+0x210]
   14037c324:	00 00 
   14037c326:	44 0f 28 b4 24 20 02 	movaps xmm14,XMMWORD PTR [rsp+0x220]
   14037c32d:	00 00 
   14037c32f:	44 0f 28 ac 24 30 02 	movaps xmm13,XMMWORD PTR [rsp+0x230]
   14037c336:	00 00 
   14037c338:	44 0f 28 a4 24 40 02 	movaps xmm12,XMMWORD PTR [rsp+0x240]
   14037c33f:	00 00 
   14037c341:	44 0f 28 9c 24 50 02 	movaps xmm11,XMMWORD PTR [rsp+0x250]
   14037c348:	00 00 
   14037c34a:	44 0f 28 94 24 60 02 	movaps xmm10,XMMWORD PTR [rsp+0x260]
   14037c351:	00 00 
   14037c353:	44 0f 28 8c 24 70 02 	movaps xmm9,XMMWORD PTR [rsp+0x270]
   14037c35a:	00 00 
   14037c35c:	44 0f 28 84 24 80 02 	movaps xmm8,XMMWORD PTR [rsp+0x280]
   14037c363:	00 00 
   14037c365:	0f 28 b4 24 a0 02 00 	movaps xmm6,XMMWORD PTR [rsp+0x2a0]
   14037c36c:	00 
   14037c36d:	4c 8b a4 24 b0 02 00 	mov    r12,QWORD PTR [rsp+0x2b0]
   14037c374:	00 
   14037c375:	48 8b ac 24 f0 02 00 	mov    rbp,QWORD PTR [rsp+0x2f0]
   14037c37c:	00 
   14037c37d:	75 08                	jne    0x14037c387
   14037c37f:	48 8b cb             	mov    rcx,rbx
   14037c382:	e8 d1 f1 29 00       	call   0x14061b558
   14037c387:	80 7c 24 21 00       	cmp    BYTE PTR [rsp+0x21],0x0
   14037c38c:	74 0d                	je     0x14037c39b
   14037c38e:	ba 40 00 00 00       	mov    edx,0x40
   14037c393:	49 8b cd             	mov    rcx,r13
   14037c396:	e8 bd f1 29 00       	call   0x14061b558
   14037c39b:	0f 28 c7             	movaps xmm0,xmm7
   14037c39e:	0f 28 bc 24 90 02 00 	movaps xmm7,XMMWORD PTR [rsp+0x290]
   14037c3a5:	00 
   14037c3a6:	eb 03                	jmp    0x14037c3ab
   14037c3a8:	0f 57 c0             	xorps  xmm0,xmm0
   14037c3ab:	48 8b 8c 24 00 02 00 	mov    rcx,QWORD PTR [rsp+0x200]
   14037c3b2:	00 
   14037c3b3:	48 33 cc             	xor    rcx,rsp
   14037c3b6:	e8 45 f2 29 00       	call   0x14061b600
   14037c3bb:	48 81 c4 b8 02 00 00 	add    rsp,0x2b8
   14037c3c2:	41 5f                	pop    r15
   14037c3c4:	41 5e                	pop    r14
   14037c3c6:	41 5d                	pop    r13
   14037c3c8:	5f                   	pop    rdi
   14037c3c9:	5e                   	pop    rsi
   14037c3ca:	5b                   	pop    rbx
   14037c3cb:	c3                   	ret
   14037c3cc:	cc                   	int3
   14037c3cd:	cc                   	int3
   14037c3ce:	cc                   	int3
   14037c3cf:	cc                   	int3
   14037c3d0:	cc                   	int3
   14037c3d1:	cc                   	int3
   14037c3d2:	cc                   	int3
   14037c3d3:	cc                   	int3
   14037c3d4:	cc                   	int3
   14037c3d5:	cc                   	int3
   14037c3d6:	cc                   	int3
   14037c3d7:	cc                   	int3
   14037c3d8:	cc                   	int3
   14037c3d9:	cc                   	int3
   14037c3da:	cc                   	int3
   14037c3db:	cc                   	int3
   14037c3dc:	cc                   	int3
   14037c3dd:	cc                   	int3
   14037c3de:	cc                   	int3
   14037c3df:	cc                   	int3
