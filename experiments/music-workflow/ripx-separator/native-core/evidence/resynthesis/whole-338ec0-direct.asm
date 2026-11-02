
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140338ec0 <.text+0x337ec0>:
   140338ec0:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   140338ec5:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   140338eca:	56                   	push   rsi
   140338ecb:	57                   	push   rdi
   140338ecc:	41 54                	push   r12
   140338ece:	41 55                	push   r13
   140338ed0:	41 57                	push   r15
   140338ed2:	48 83 ec 50          	sub    rsp,0x50
   140338ed6:	44 8b 81 48 05 00 00 	mov    r8d,DWORD PTR [rcx+0x548]
   140338edd:	33 ed                	xor    ebp,ebp
   140338edf:	48 8b 99 40 05 00 00 	mov    rbx,QWORD PTR [rcx+0x540]
   140338ee6:	44 0f b6 e2          	movzx  r12d,dl
   140338eea:	0f 29 74 24 40       	movaps XMMWORD PTR [rsp+0x40],xmm6
   140338eef:	4c 8b e9             	mov    r13,rcx
   140338ef2:	0f 29 7c 24 30       	movaps XMMWORD PTR [rsp+0x30],xmm7
   140338ef7:	8b f5                	mov    esi,ebp
   140338ef9:	44 0f 29 44 24 20    	movaps XMMWORD PTR [rsp+0x20],xmm8
   140338eff:	45 0f 57 c0          	xorps  xmm8,xmm8
   140338f03:	45 85 c0             	test   r8d,r8d
   140338f06:	0f 84 5d 02 00 00    	je     0x140339169
   140338f0c:	45 8b d8             	mov    r11d,r8d
   140338f0f:	0f 57 ff             	xorps  xmm7,xmm7
   140338f12:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140338f16:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140338f1d:	00 00 00 
   140338f20:	8b fe                	mov    edi,esi
   140338f22:	45 8b c3             	mov    r8d,r11d
   140338f25:	4c 8d 0c bf          	lea    r9,[rdi+rdi*4]
   140338f29:	42 f6 44 cb 0c 01    	test   BYTE PTR [rbx+r9*8+0xc],0x1
   140338f2f:	0f 85 26 02 00 00    	jne    0x14033915b
   140338f35:	42 80 7c cb 24 01    	cmp    BYTE PTR [rbx+r9*8+0x24],0x1
   140338f3b:	0f 85 1a 02 00 00    	jne    0x14033915b
   140338f41:	46 0f 2f 44 cb 1c    	comiss xmm8,DWORD PTR [rbx+r9*8+0x1c]
   140338f47:	0f 87 0e 02 00 00    	ja     0x14033915b
   140338f4d:	45 8b 55 0c          	mov    r10d,DWORD PTR [r13+0xc]
   140338f51:	48 8d 4b 0a          	lea    rcx,[rbx+0xa]
   140338f55:	42 0f bf 04 c9       	movsx  eax,WORD PTR [rcx+r9*8]
   140338f5a:	4a 8d 0c c9          	lea    rcx,[rcx+r9*8]
   140338f5e:	41 3b c2             	cmp    eax,r10d
   140338f61:	0f 8c f4 01 00 00    	jl     0x14033915b
   140338f67:	0f 28 f7             	movaps xmm6,xmm7
   140338f6a:	0f 28 d7             	movaps xmm2,xmm7
   140338f6d:	44 8b c6             	mov    r8d,esi
   140338f70:	41 3b f3             	cmp    esi,r11d
   140338f73:	0f 83 61 01 00 00    	jae    0x1403390da
   140338f79:	41 8b c3             	mov    eax,r11d
   140338f7c:	2b c6                	sub    eax,esi
   140338f7e:	83 f8 04             	cmp    eax,0x4
   140338f81:	0f 82 f3 00 00 00    	jb     0x14033907a
   140338f87:	41 8b c3             	mov    eax,r11d
   140338f8a:	2b c6                	sub    eax,esi
   140338f8c:	83 e8 04             	sub    eax,0x4
   140338f8f:	c1 e8 02             	shr    eax,0x2
   140338f92:	ff c0                	inc    eax
   140338f94:	8b d0                	mov    edx,eax
   140338f96:	44 8d 04 86          	lea    r8d,[rsi+rax*4]
   140338f9a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140338fa0:	f6 41 02 01          	test   BYTE PTR [rcx+0x2],0x1
   140338fa4:	75 2a                	jne    0x140338fd0
   140338fa6:	0f bf 01             	movsx  eax,WORD PTR [rcx]
   140338fa9:	41 3b c2             	cmp    eax,r10d
   140338fac:	7c 22                	jl     0x140338fd0
   140338fae:	42 8b 44 cb 10       	mov    eax,DWORD PTR [rbx+r9*8+0x10]
   140338fb3:	39 41 06             	cmp    DWORD PTR [rcx+0x6],eax
   140338fb6:	75 18                	jne    0x140338fd0
   140338fb8:	f3 0f 10 41 12       	movss  xmm0,DWORD PTR [rcx+0x12]
   140338fbd:	f3 0f 10 49 16       	movss  xmm1,DWORD PTR [rcx+0x16]
   140338fc2:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140338fc5:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140338fc8:	f2 0f 58 f0          	addsd  xmm6,xmm0
   140338fcc:	f2 0f 58 d1          	addsd  xmm2,xmm1
   140338fd0:	f6 41 2a 01          	test   BYTE PTR [rcx+0x2a],0x1
   140338fd4:	75 2b                	jne    0x140339001
   140338fd6:	0f bf 41 28          	movsx  eax,WORD PTR [rcx+0x28]
   140338fda:	41 3b c2             	cmp    eax,r10d
   140338fdd:	7c 22                	jl     0x140339001
   140338fdf:	42 8b 44 cb 10       	mov    eax,DWORD PTR [rbx+r9*8+0x10]
   140338fe4:	39 41 2e             	cmp    DWORD PTR [rcx+0x2e],eax
   140338fe7:	75 18                	jne    0x140339001
   140338fe9:	f3 0f 10 41 3a       	movss  xmm0,DWORD PTR [rcx+0x3a]
   140338fee:	f3 0f 10 49 3e       	movss  xmm1,DWORD PTR [rcx+0x3e]
   140338ff3:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140338ff6:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140338ff9:	f2 0f 58 f0          	addsd  xmm6,xmm0
   140338ffd:	f2 0f 58 d1          	addsd  xmm2,xmm1
   140339001:	f6 41 52 01          	test   BYTE PTR [rcx+0x52],0x1
   140339005:	75 2b                	jne    0x140339032
   140339007:	0f bf 41 50          	movsx  eax,WORD PTR [rcx+0x50]
   14033900b:	41 3b c2             	cmp    eax,r10d
   14033900e:	7c 22                	jl     0x140339032
   140339010:	42 8b 44 cb 10       	mov    eax,DWORD PTR [rbx+r9*8+0x10]
   140339015:	39 41 56             	cmp    DWORD PTR [rcx+0x56],eax
   140339018:	75 18                	jne    0x140339032
   14033901a:	f3 0f 10 41 62       	movss  xmm0,DWORD PTR [rcx+0x62]
   14033901f:	f3 0f 10 49 66       	movss  xmm1,DWORD PTR [rcx+0x66]
   140339024:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140339027:	0f 5a c9             	cvtps2pd xmm1,xmm1
   14033902a:	f2 0f 58 f0          	addsd  xmm6,xmm0
   14033902e:	f2 0f 58 d1          	addsd  xmm2,xmm1
   140339032:	f6 41 7a 01          	test   BYTE PTR [rcx+0x7a],0x1
   140339036:	75 31                	jne    0x140339069
   140339038:	0f bf 41 78          	movsx  eax,WORD PTR [rcx+0x78]
   14033903c:	41 3b c2             	cmp    eax,r10d
   14033903f:	7c 28                	jl     0x140339069
   140339041:	42 8b 44 cb 10       	mov    eax,DWORD PTR [rbx+r9*8+0x10]
   140339046:	39 41 7e             	cmp    DWORD PTR [rcx+0x7e],eax
   140339049:	75 1e                	jne    0x140339069
   14033904b:	f3 0f 10 81 8a 00 00 	movss  xmm0,DWORD PTR [rcx+0x8a]
   140339052:	00 
   140339053:	f3 0f 10 89 8e 00 00 	movss  xmm1,DWORD PTR [rcx+0x8e]
   14033905a:	00 
   14033905b:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14033905e:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140339061:	f2 0f 58 f0          	addsd  xmm6,xmm0
   140339065:	f2 0f 58 d1          	addsd  xmm2,xmm1
   140339069:	48 81 c1 a0 00 00 00 	add    rcx,0xa0
   140339070:	48 83 ea 01          	sub    rdx,0x1
   140339074:	0f 85 26 ff ff ff    	jne    0x140338fa0
   14033907a:	45 3b c3             	cmp    r8d,r11d
   14033907d:	73 4f                	jae    0x1403390ce
   14033907f:	41 8b c0             	mov    eax,r8d
   140339082:	48 8d 53 0a          	lea    rdx,[rbx+0xa]
   140339086:	45 2b d8             	sub    r11d,r8d
   140339089:	48 8d 0c 80          	lea    rcx,[rax+rax*4]
   14033908d:	48 8d 14 ca          	lea    rdx,[rdx+rcx*8]
   140339091:	41 8b cb             	mov    ecx,r11d
   140339094:	f6 42 02 01          	test   BYTE PTR [rdx+0x2],0x1
   140339098:	75 2a                	jne    0x1403390c4
   14033909a:	0f bf 02             	movsx  eax,WORD PTR [rdx]
   14033909d:	41 3b c2             	cmp    eax,r10d
   1403390a0:	7c 22                	jl     0x1403390c4
   1403390a2:	42 8b 44 cb 10       	mov    eax,DWORD PTR [rbx+r9*8+0x10]
   1403390a7:	39 42 06             	cmp    DWORD PTR [rdx+0x6],eax
   1403390aa:	75 18                	jne    0x1403390c4
   1403390ac:	f3 0f 10 42 12       	movss  xmm0,DWORD PTR [rdx+0x12]
   1403390b1:	f3 0f 10 4a 16       	movss  xmm1,DWORD PTR [rdx+0x16]
   1403390b6:	0f 5a c0             	cvtps2pd xmm0,xmm0
   1403390b9:	0f 5a c9             	cvtps2pd xmm1,xmm1
   1403390bc:	f2 0f 58 f0          	addsd  xmm6,xmm0
   1403390c0:	f2 0f 58 d1          	addsd  xmm2,xmm1
   1403390c4:	48 83 c2 28          	add    rdx,0x28
   1403390c8:	48 83 e9 01          	sub    rcx,0x1
   1403390cc:	75 c6                	jne    0x140339094
   1403390ce:	66 0f 2e d7          	ucomisd xmm2,xmm7
   1403390d2:	7a 02                	jp     0x1403390d6
   1403390d4:	74 04                	je     0x1403390da
   1403390d6:	f2 0f 5e f2          	divsd  xmm6,xmm2
   1403390da:	f3 42 0f 10 44 cb 18 	movss  xmm0,DWORD PTR [rbx+r9*8+0x18]
   1403390e1:	e8 8a 31 03 00       	call   0x14036c270
   1403390e6:	0f 57 c9             	xorps  xmm1,xmm1
   1403390e9:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   1403390ed:	66 0f 2f ce          	comisd xmm1,xmm6
   1403390f1:	76 03                	jbe    0x1403390f6
   1403390f3:	0f 28 f7             	movaps xmm6,xmm7
   1403390f6:	45 8b 85 48 05 00 00 	mov    r8d,DWORD PTR [r13+0x548]
   1403390fd:	44 8b ce             	mov    r9d,esi
   140339100:	41 3b f0             	cmp    esi,r8d
   140339103:	73 56                	jae    0x14033915b
   140339105:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14033910c:	00 00 00 00 
   140339110:	41 8b c1             	mov    eax,r9d
   140339113:	48 8d 14 80          	lea    rdx,[rax+rax*4]
   140339117:	f6 44 d3 0c 01       	test   BYTE PTR [rbx+rdx*8+0xc],0x1
   14033911c:	75 2e                	jne    0x14033914c
   14033911e:	0f bf 44 d3 0a       	movsx  eax,WORD PTR [rbx+rdx*8+0xa]
   140339123:	41 3b 45 0c          	cmp    eax,DWORD PTR [r13+0xc]
   140339127:	7c 23                	jl     0x14033914c
   140339129:	48 8d 04 bf          	lea    rax,[rdi+rdi*4]
   14033912d:	8b 4c c3 10          	mov    ecx,DWORD PTR [rbx+rax*8+0x10]
   140339131:	39 4c d3 10          	cmp    DWORD PTR [rbx+rdx*8+0x10],ecx
   140339135:	75 15                	jne    0x14033914c
   140339137:	0f 57 c0             	xorps  xmm0,xmm0
   14033913a:	c7 44 d3 1c 00 00 80 	mov    DWORD PTR [rbx+rdx*8+0x1c],0xbf800000
   140339141:	bf 
   140339142:	f2 0f 5a c6          	cvtsd2ss xmm0,xmm6
   140339146:	f3 0f 11 44 d3 20    	movss  DWORD PTR [rbx+rdx*8+0x20],xmm0
   14033914c:	45 8b 85 48 05 00 00 	mov    r8d,DWORD PTR [r13+0x548]
   140339153:	41 ff c1             	inc    r9d
   140339156:	45 3b c8             	cmp    r9d,r8d
   140339159:	72 b5                	jb     0x140339110
   14033915b:	ff c6                	inc    esi
   14033915d:	45 8b d8             	mov    r11d,r8d
   140339160:	41 3b f0             	cmp    esi,r8d
   140339163:	0f 82 b7 fd ff ff    	jb     0x140338f20
   140339169:	44 8b fd             	mov    r15d,ebp
   14033916c:	45 85 c0             	test   r8d,r8d
   14033916f:	0f 84 13 01 00 00    	je     0x140339288
   140339175:	f3 0f 10 3d b3 6e 51 	movss  xmm7,DWORD PTR [rip+0x516eb3]        # 0x140850030
   14033917c:	00 
   14033917d:	4c 89 b4 24 80 00 00 	mov    QWORD PTR [rsp+0x80],r14
   140339184:	00 
   140339185:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14033918c:	00 00 00 00 
   140339190:	41 8b c7             	mov    eax,r15d
   140339193:	48 8d 3c 80          	lea    rdi,[rax+rax*4]
   140339197:	f6 44 fb 0c 01       	test   BYTE PTR [rbx+rdi*8+0xc],0x1
   14033919c:	0f 85 ce 00 00 00    	jne    0x140339270
   1403391a2:	80 7c fb 24 01       	cmp    BYTE PTR [rbx+rdi*8+0x24],0x1
   1403391a7:	0f 85 c3 00 00 00    	jne    0x140339270
   1403391ad:	0f bf 44 fb 0a       	movsx  eax,WORD PTR [rbx+rdi*8+0xa]
   1403391b2:	41 3b 45 0c          	cmp    eax,DWORD PTR [r13+0xc]
   1403391b6:	7c 08                	jl     0x1403391c0
   1403391b8:	8b 44 fb 20          	mov    eax,DWORD PTR [rbx+rdi*8+0x20]
   1403391bc:	89 44 fb 1c          	mov    DWORD PTR [rbx+rdi*8+0x1c],eax
   1403391c0:	45 84 e4             	test   r12b,r12b
   1403391c3:	0f 84 a7 00 00 00    	je     0x140339270
   1403391c9:	8b f5                	mov    esi,ebp
   1403391cb:	4c 8b 34 fb          	mov    r14,QWORD PTR [rbx+rdi*8]
   1403391cf:	66 3b 6c fb 08       	cmp    bp,WORD PTR [rbx+rdi*8+0x8]
   1403391d4:	0f 83 96 00 00 00    	jae    0x140339270
   1403391da:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   1403391e0:	0f bf 44 fb 0a       	movsx  eax,WORD PTR [rbx+rdi*8+0xa]
   1403391e5:	03 c6                	add    eax,esi
   1403391e7:	41 3b 45 0c          	cmp    eax,DWORD PTR [r13+0xc]
   1403391eb:	7c 72                	jl     0x14033925f
   1403391ed:	8b c6                	mov    eax,esi
   1403391ef:	48 6b e8 5c          	imul   rbp,rax,0x5c
   1403391f3:	41 f6 44 2e 48 40    	test   BYTE PTR [r14+rbp*1+0x48],0x40
   1403391f9:	75 64                	jne    0x14033925f
   1403391fb:	0f b6 44 fb 25       	movzx  eax,BYTE PTR [rbx+rdi*8+0x25]
   140339200:	0f b6 4c fb 24       	movzx  ecx,BYTE PTR [rbx+rdi*8+0x24]
   140339205:	f3 41 0f 10 74 2e 50 	movss  xmm6,DWORD PTR [r14+rbp*1+0x50]
   14033920c:	66 0f 6e c0          	movd   xmm0,eax
   140339210:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140339213:	80 f9 01             	cmp    cl,0x1
   140339216:	75 2e                	jne    0x140339246
   140339218:	f3 0f 10 54 fb 20    	movss  xmm2,DWORD PTR [rbx+rdi*8+0x20]
   14033921e:	0f 28 c8             	movaps xmm1,xmm0
   140339221:	41 0f 2f d0          	comiss xmm2,xmm8
   140339225:	f3 0f 59 ce          	mulss  xmm1,xmm6
   140339229:	76 16                	jbe    0x140339241
   14033922b:	f3 0f 59 c0          	mulss  xmm0,xmm0
   14033922f:	f3 0f 5c c7          	subss  xmm0,xmm7
   140339233:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140339237:	f3 0f 58 c7          	addss  xmm0,xmm7
   14033923b:	f3 0f 59 c1          	mulss  xmm0,xmm1
   14033923f:	eb 17                	jmp    0x140339258
   140339241:	0f 28 c1             	movaps xmm0,xmm1
   140339244:	eb 12                	jmp    0x140339258
   140339246:	e8 d5 1a 03 00       	call   0x14036ad20
   14033924b:	84 c0                	test   al,al
   14033924d:	74 05                	je     0x140339254
   14033924f:	0f 28 c6             	movaps xmm0,xmm6
   140339252:	eb 04                	jmp    0x140339258
   140339254:	41 0f 28 c0          	movaps xmm0,xmm8
   140339258:	f3 41 0f 11 44 2e 10 	movss  DWORD PTR [r14+rbp*1+0x10],xmm0
   14033925f:	0f b7 44 fb 08       	movzx  eax,WORD PTR [rbx+rdi*8+0x8]
   140339264:	ff c6                	inc    esi
   140339266:	3b f0                	cmp    esi,eax
   140339268:	0f 82 72 ff ff ff    	jb     0x1403391e0
   14033926e:	33 ed                	xor    ebp,ebp
   140339270:	41 ff c7             	inc    r15d
   140339273:	45 3b bd 48 05 00 00 	cmp    r15d,DWORD PTR [r13+0x548]
   14033927a:	0f 82 10 ff ff ff    	jb     0x140339190
   140339280:	4c 8b b4 24 80 00 00 	mov    r14,QWORD PTR [rsp+0x80]
   140339287:	00 
   140339288:	0f 28 74 24 40       	movaps xmm6,XMMWORD PTR [rsp+0x40]
   14033928d:	4c 8d 5c 24 50       	lea    r11,[rsp+0x50]
   140339292:	49 8b 5b 38          	mov    rbx,QWORD PTR [r11+0x38]
   140339296:	49 8b 6b 40          	mov    rbp,QWORD PTR [r11+0x40]
   14033929a:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   14033929f:	0f 28 7c 24 30       	movaps xmm7,XMMWORD PTR [rsp+0x30]
   1403392a4:	49 8b e3             	mov    rsp,r11
   1403392a7:	41 5f                	pop    r15
   1403392a9:	41 5d                	pop    r13
   1403392ab:	41 5c                	pop    r12
   1403392ad:	5f                   	pop    rdi
   1403392ae:	5e                   	pop    rsi
   1403392af:	c3                   	ret
   1403392b0:	cc                   	int3
   1403392b1:	cc                   	int3
   1403392b2:	cc                   	int3
   1403392b3:	cc                   	int3
   1403392b4:	cc                   	int3
   1403392b5:	cc                   	int3
   1403392b6:	cc                   	int3
   1403392b7:	cc                   	int3
   1403392b8:	cc                   	int3
   1403392b9:	cc                   	int3
   1403392ba:	cc                   	int3
   1403392bb:	cc                   	int3
   1403392bc:	cc                   	int3
   1403392bd:	cc                   	int3
   1403392be:	cc                   	int3
   1403392bf:	cc                   	int3
   1403392c0:	4c 8b dc             	mov    r11,rsp
   1403392c3:	49 89 4b 08          	mov    QWORD PTR [r11+0x8],rcx
   1403392c7:	41 55                	push   r13
   1403392c9:	41 56                	push   r14
   1403392cb:	41 57                	push   r15
   1403392cd:	48 81 ec 00 01 00 00 	sub    rsp,0x100
   1403392d4:	f3 0f 10 0d d0 0e 65 	movss  xmm1,DWORD PTR [rip+0x650ed0]        # 0x14098a1ac
   1403392db:	00 
   1403392dc:	41 bf 01 00 00 00    	mov    r15d,0x1
   1403392e2:	0f 28 c1             	movaps xmm0,xmm1
   1403392e5:	44 0f 29 6c 24 60    	movaps XMMWORD PTR [rsp+0x60],xmm13
   1403392eb:	f3 44 0f 10 2d e8 6c 	movss  xmm13,DWORD PTR [rip+0x516ce8]        # 0x14084ffdc
   1403392f2:	51 00 
   1403392f4:	4c 8b f1             	mov    r14,rcx
   1403392f7:	f3 0f 59 05 a9 6c 51 	mulss  xmm0,DWORD PTR [rip+0x516ca9]        # 0x14084ffa8
   1403392fe:	00 
   1403392ff:	b9 01 00 00 00       	mov    ecx,0x1
   140339304:	4c 8b ea             	mov    r13,rdx
   140339307:	f3 0f 59 0d d1 d5 36 	mulss  xmm1,DWORD PTR [rip+0x36d5d1]        # 0x1406a68e0
   14033930e:	00 
   14033930f:	f3 41 0f 58 c5       	addss  xmm0,xmm13
   140339314:	f3 41 0f 58 cd       	addss  xmm1,xmm13
   140339319:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14033931d:	41 3b c7             	cmp    eax,r15d
   140339320:	44 0f 4f f8          	cmovg  r15d,eax
   140339324:	f3 0f 2c c1          	cvttss2si eax,xmm1
   140339328:	44 89 7c 24 2c       	mov    DWORD PTR [rsp+0x2c],r15d
   14033932d:	3b c1                	cmp    eax,ecx
   14033932f:	0f 4f c8             	cmovg  ecx,eax
   140339332:	89 4c 24 28          	mov    DWORD PTR [rsp+0x28],ecx
   140339336:	45 85 c9             	test   r9d,r9d
   140339339:	0f 84 66 04 00 00    	je     0x1403397a5
   14033933f:	49 89 5b 10          	mov    QWORD PTR [r11+0x10],rbx
   140339343:	49 89 6b e0          	mov    QWORD PTR [r11-0x20],rbp
   140339347:	49 8d 68 0a          	lea    rbp,[r8+0xa]
   14033934b:	49 89 73 d8          	mov    QWORD PTR [r11-0x28],rsi
   14033934f:	49 89 7b d0          	mov    QWORD PTR [r11-0x30],rdi
   140339353:	4d 89 63 c8          	mov    QWORD PTR [r11-0x38],r12
   140339357:	41 0f 29 73 b8       	movaps XMMWORD PTR [r11-0x48],xmm6
   14033935c:	0f 57 f6             	xorps  xmm6,xmm6
   14033935f:	41 0f 29 7b a8       	movaps XMMWORD PTR [r11-0x58],xmm7
   140339364:	45 0f 29 43 98       	movaps XMMWORD PTR [r11-0x68],xmm8
   140339369:	45 0f 29 4b 88       	movaps XMMWORD PTR [r11-0x78],xmm9
   14033936e:	f2 44 0f 10 0d 49 6e 	movsd  xmm9,QWORD PTR [rip+0x516e49]        # 0x1408501c0
   140339375:	51 00 
   140339377:	45 0f 29 93 78 ff ff 	movaps XMMWORD PTR [r11-0x88],xmm10
   14033937e:	ff 
   14033937f:	f3 44 0f 10 15 e4 f8 	movss  xmm10,DWORD PTR [rip+0x35f8e4]        # 0x140698c6c
   140339386:	35 00 
   140339388:	45 0f 29 9b 68 ff ff 	movaps XMMWORD PTR [r11-0x98],xmm11
   14033938f:	ff 
   140339390:	f3 44 0f 10 1d 33 de 	movss  xmm11,DWORD PTR [rip+0x35de33]        # 0x1406971cc
   140339397:	35 00 
   140339399:	44 0f 29 64 24 70    	movaps XMMWORD PTR [rsp+0x70],xmm12
   14033939f:	f3 44 0f 10 25 28 74 	movss  xmm12,DWORD PTR [rip+0x517428]        # 0x1408507d0
   1403393a6:	51 00 
   1403393a8:	44 0f 29 74 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm14
   1403393ae:	f3 44 0f 10 35 7d f7 	movss  xmm14,DWORD PTR [rip+0x35f77d]        # 0x140698b34
   1403393b5:	35 00 
   1403393b7:	41 8b f1             	mov    esi,r9d
   1403393ba:	44 0f 29 7c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm15
   1403393c0:	f3 44 0f 10 3d e3 6b 	movss  xmm15,DWORD PTR [rip+0x516be3]        # 0x14084ffac
   1403393c7:	51 00 
   1403393c9:	48 89 74 24 30       	mov    QWORD PTR [rsp+0x30],rsi
   1403393ce:	66 90                	xchg   ax,ax
   1403393d0:	f6 45 02 01          	test   BYTE PTR [rbp+0x2],0x1
   1403393d4:	0f 85 4a 03 00 00    	jne    0x140339724
   1403393da:	80 7d 1a 01          	cmp    BYTE PTR [rbp+0x1a],0x1
   1403393de:	0f 85 40 03 00 00    	jne    0x140339724
   1403393e4:	0f b6 45 1b          	movzx  eax,BYTE PTR [rbp+0x1b]
   1403393e8:	48 8b 7d f6          	mov    rdi,QWORD PTR [rbp-0xa]
   1403393ec:	3c 08                	cmp    al,0x8
   1403393ee:	0f 86 30 03 00 00    	jbe    0x140339724
   1403393f4:	f3 0f 10 5d 0e       	movss  xmm3,DWORD PTR [rbp+0xe]
   1403393f9:	b2 01                	mov    dl,0x1
   1403393fb:	f3 0f 10 55 12       	movss  xmm2,DWORD PTR [rbp+0x12]
   140339400:	0f b6 c0             	movzx  eax,al
   140339403:	66 0f 6e c0          	movd   xmm0,eax
   140339407:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14033940a:	e8 b1 ce 00 00       	call   0x1403462c0
   14033940f:	f3 0f 10 0d c5 e6 36 	movss  xmm1,DWORD PTR [rip+0x36e6c5]        # 0x1406a7adc
   140339416:	00 
   140339417:	0f 2f c8             	comiss xmm1,xmm0
   14033941a:	0f 87 04 03 00 00    	ja     0x140339724
   140339420:	f3 0f 10 45 0e       	movss  xmm0,DWORD PTR [rbp+0xe]
   140339425:	41 0f 2f c2          	comiss xmm0,xmm10
   140339429:	76 06                	jbe    0x140339431
   14033942b:	41 0f 28 c6          	movaps xmm0,xmm14
   14033942f:	eb 04                	jmp    0x140339435
   140339431:	41 0f 28 c7          	movaps xmm0,xmm15
   140339435:	f3 0f 59 05 6f 0d 65 	mulss  xmm0,DWORD PTR [rip+0x650d6f]        # 0x14098a1ac
   14033943c:	00 
   14033943d:	b9 01 00 00 00       	mov    ecx,0x1
   140339442:	f3 41 0f 58 c5       	addss  xmm0,xmm13
   140339447:	f3 0f 2c c0          	cvttss2si eax,xmm0
   14033944b:	3b c1                	cmp    eax,ecx
   14033944d:	0f 4f c8             	cmovg  ecx,eax
   140339450:	33 db                	xor    ebx,ebx
   140339452:	39 1d a4 05 60 00    	cmp    DWORD PTR [rip+0x6005a4],ebx        # 0x1409399fc
   140339458:	89 4c 24 20          	mov    DWORD PTR [rsp+0x20],ecx
   14033945c:	0f 86 c2 02 00 00    	jbe    0x140339724
   140339462:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140339466:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14033946d:	00 00 00 
   140339470:	40 32 f6             	xor    sil,sil
   140339473:	40 88 b4 24 38 01 00 	mov    BYTE PTR [rsp+0x138],sil
   14033947a:	00 
   14033947b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140339480:	0f b7 45 fe          	movzx  eax,WORD PTR [rbp-0x2]
   140339484:	45 8b df             	mov    r11d,r15d
   140339487:	44 3b f8             	cmp    r15d,eax
   14033948a:	0f 83 04 02 00 00    	jae    0x140339694
   140339490:	8b c1                	mov    eax,ecx
   140339492:	f7 d8                	neg    eax
   140339494:	44 8d 3c 00          	lea    r15d,[rax+rax*1]
   140339498:	44 89 7c 24 24       	mov    DWORD PTR [rsp+0x24],r15d
   14033949d:	0f 1f 00             	nop    DWORD PTR [rax]
   1403394a0:	0f bf 4d 00          	movsx  ecx,WORD PTR [rbp+0x0]
   1403394a4:	41 03 cb             	add    ecx,r11d
   1403394a7:	41 3b 4d 0c          	cmp    ecx,DWORD PTR [r13+0xc]
   1403394ab:	0f 8c ce 01 00 00    	jl     0x14033967f
   1403394b1:	41 8b 86 bc 00 00 00 	mov    eax,DWORD PTR [r14+0xbc]
   1403394b8:	41 03 45 10          	add    eax,DWORD PTR [r13+0x10]
   1403394bc:	3b c8                	cmp    ecx,eax
   1403394be:	0f 8d bb 01 00 00    	jge    0x14033967f
   1403394c4:	41 8b c3             	mov    eax,r11d
   1403394c7:	4c 6b c0 17          	imul   r8,rax,0x17
   1403394cb:	4c 6b c8 5c          	imul   r9,rax,0x5c
   1403394cf:	44 0f b6 d6          	movzx  r10d,sil
   1403394d3:	4f 8d 24 02          	lea    r12,[r10+r8*1]
   1403394d7:	42 c7 44 a7 54 00 00 	mov    DWORD PTR [rdi+r12*4+0x54],0x0
   1403394de:	00 00 
   1403394e0:	41 0f b6 44 39 4b    	movzx  eax,BYTE PTR [r9+rdi*1+0x4b]
   1403394e6:	3b d8                	cmp    ebx,eax
   1403394e8:	0f 83 91 01 00 00    	jae    0x14033967f
   1403394ee:	8b 74 24 20          	mov    esi,DWORD PTR [rsp+0x20]
   1403394f2:	4b 8d 04 02          	lea    rax,[r10+r8*1]
   1403394f6:	41 03 f3             	add    esi,r11d
   1403394f9:	48 8d 14 5b          	lea    rdx,[rbx+rbx*2]
   1403394fd:	48 03 d2             	add    rdx,rdx
   140339500:	4c 8d 34 5b          	lea    r14,[rbx+rbx*2]
   140339504:	48 03 c2             	add    rax,rdx
   140339507:	46 8d 04 3e          	lea    r8d,[rsi+r15*1]
   14033950b:	44 0f b7 7d fe       	movzx  r15d,WORD PTR [rbp-0x2]
   140339510:	44 39 44 24 28       	cmp    DWORD PTR [rsp+0x28],r8d
   140339515:	f3 0f 10 7c 87 08    	movss  xmm7,DWORD PTR [rdi+rax*4+0x8]
   14033951b:	4b 8d 04 f1          	lea    rax,[r9+r14*8]
   14033951f:	44 0f 4d 44 24 28    	cmovge r8d,DWORD PTR [rsp+0x28]
   140339525:	4c 8d 8f a7 00 00 00 	lea    r9,[rdi+0xa7]
   14033952c:	f3 44 0f 10 44 38 10 	movss  xmm8,DWORD PTR [rax+rdi*1+0x10]
   140339533:	0f 28 e7             	movaps xmm4,xmm7
   140339536:	41 8d 47 ff          	lea    eax,[r15-0x1]
   14033953a:	49 63 c8             	movsxd rcx,r8d
   14033953d:	3b f0                	cmp    esi,eax
   14033953f:	41 0f 28 d0          	movaps xmm2,xmm8
   140339543:	0f 28 ef             	movaps xmm5,xmm7
   140339546:	0f 28 da             	movaps xmm3,xmm2
   140339549:	0f 4d f0             	cmovge esi,eax
   14033954c:	48 6b c1 5c          	imul   rax,rcx,0x5c
   140339550:	48 6b c9 17          	imul   rcx,rcx,0x17
   140339554:	4c 03 c8             	add    r9,rax
   140339557:	48 83 c1 eb          	add    rcx,0xffffffffffffffeb
   14033955b:	49 03 ca             	add    rcx,r10
   14033955e:	48 03 ca             	add    rcx,rdx
   140339561:	48 8d 0c 8f          	lea    rcx,[rdi+rcx*4]
   140339565:	44 3b c6             	cmp    r8d,esi
   140339568:	0f 8f c2 00 00 00    	jg     0x140339630
   14033956e:	45 3b c3             	cmp    r8d,r11d
   140339571:	0f 84 a9 00 00 00    	je     0x140339620
   140339577:	41 0f b6 41 a4       	movzx  eax,BYTE PTR [r9-0x5c]
   14033957c:	3b d8                	cmp    ebx,eax
   14033957e:	0f 83 81 00 00 00    	jae    0x140339605
   140339584:	f3 0f 10 41 5c       	movss  xmm0,DWORD PTR [rcx+0x5c]
   140339589:	45 85 c0             	test   r8d,r8d
   14033958c:	7e 10                	jle    0x14033959e
   14033958e:	41 0f b6 81 48 ff ff 	movzx  eax,BYTE PTR [r9-0xb8]
   140339595:	ff 
   140339596:	3b d8                	cmp    ebx,eax
   140339598:	73 04                	jae    0x14033959e
   14033959a:	f3 0f 58 01          	addss  xmm0,DWORD PTR [rcx]
   14033959e:	41 8d 40 01          	lea    eax,[r8+0x1]
   1403395a2:	0f 28 c8             	movaps xmm1,xmm0
   1403395a5:	41 3b c7             	cmp    eax,r15d
   1403395a8:	7d 10                	jge    0x1403395ba
   1403395aa:	41 0f b6 01          	movzx  eax,BYTE PTR [r9]
   1403395ae:	3b d8                	cmp    ebx,eax
   1403395b0:	73 08                	jae    0x1403395ba
   1403395b2:	f3 0f 58 89 b8 00 00 	addss  xmm1,DWORD PTR [rcx+0xb8]
   1403395b9:	00 
   1403395ba:	0f 5a c1             	cvtps2pd xmm0,xmm1
   1403395bd:	f2 41 0f 5e c1       	divsd  xmm0,xmm9
   1403395c2:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   1403395c6:	45 3b c3             	cmp    r8d,r11d
   1403395c9:	7d 09                	jge    0x1403395d4
   1403395cb:	f3 0f 5d cd          	minss  xmm1,xmm5
   1403395cf:	0f 28 e9             	movaps xmm5,xmm1
   1403395d2:	eb 07                	jmp    0x1403395db
   1403395d4:	f3 0f 5d cc          	minss  xmm1,xmm4
   1403395d8:	0f 28 e1             	movaps xmm4,xmm1
   1403395db:	f3 43 0f 10 84 f1 69 	movss  xmm0,DWORD PTR [r9+r14*8-0x97]
   1403395e2:	ff ff ff 
   1403395e5:	0f 2f d8             	comiss xmm3,xmm0
   1403395e8:	76 03                	jbe    0x1403395ed
   1403395ea:	0f 28 d8             	movaps xmm3,xmm0
   1403395ed:	0f 2f c2             	comiss xmm0,xmm2
   1403395f0:	76 2e                	jbe    0x140339620
   1403395f2:	41 ff c0             	inc    r8d
   1403395f5:	48 83 c1 5c          	add    rcx,0x5c
   1403395f9:	49 83 c1 5c          	add    r9,0x5c
   1403395fd:	0f 28 d0             	movaps xmm2,xmm0
   140339600:	e9 60 ff ff ff       	jmp    0x140339565
   140339605:	45 3b c3             	cmp    r8d,r11d
   140339608:	7d 13                	jge    0x14033961d
   14033960a:	41 ff c0             	inc    r8d
   14033960d:	48 83 c1 5c          	add    rcx,0x5c
   140339611:	49 83 c1 5c          	add    r9,0x5c
   140339615:	0f 28 ee             	movaps xmm5,xmm6
   140339618:	e9 48 ff ff ff       	jmp    0x140339565
   14033961d:	0f 28 e6             	movaps xmm4,xmm6
   140339620:	41 ff c0             	inc    r8d
   140339623:	48 83 c1 5c          	add    rcx,0x5c
   140339627:	49 83 c1 5c          	add    r9,0x5c
   14033962b:	e9 35 ff ff ff       	jmp    0x140339565
   140339630:	f3 0f 5c d3          	subss  xmm2,xmm3
   140339634:	0f 2f f2             	comiss xmm6,xmm2
   140339637:	76 04                	jbe    0x14033963d
   140339639:	41 0f 57 d4          	xorps  xmm2,xmm12
   14033963d:	f3 0f 10 45 0e       	movss  xmm0,DWORD PTR [rbp+0xe]
   140339642:	41 0f 2f c2          	comiss xmm0,xmm10
   140339646:	76 0b                	jbe    0x140339653
   140339648:	f3 45 0f 5e c3       	divss  xmm8,xmm11
   14033964d:	41 0f 2f d0          	comiss xmm2,xmm8
   140339651:	77 10                	ja     0x140339663
   140339653:	0f 2f e5             	comiss xmm4,xmm5
   140339656:	77 03                	ja     0x14033965b
   140339658:	0f 28 e5             	movaps xmm4,xmm5
   14033965b:	0f 2f e7             	comiss xmm4,xmm7
   14033965e:	77 03                	ja     0x140339663
   140339660:	0f 28 fc             	movaps xmm7,xmm4
   140339663:	44 8b 7c 24 24       	mov    r15d,DWORD PTR [rsp+0x24]
   140339668:	4c 8b b4 24 20 01 00 	mov    r14,QWORD PTR [rsp+0x120]
   14033966f:	00 
   140339670:	0f b6 b4 24 38 01 00 	movzx  esi,BYTE PTR [rsp+0x138]
   140339677:	00 
   140339678:	f3 42 0f 11 7c a7 54 	movss  DWORD PTR [rdi+r12*4+0x54],xmm7
   14033967f:	0f b7 45 fe          	movzx  eax,WORD PTR [rbp-0x2]
   140339683:	41 ff c3             	inc    r11d
   140339686:	44 3b d8             	cmp    r11d,eax
   140339689:	0f 82 11 fe ff ff    	jb     0x1403394a0
   14033968f:	44 8b 7c 24 2c       	mov    r15d,DWORD PTR [rsp+0x2c]
   140339694:	0f b7 c0             	movzx  eax,ax
   140339697:	45 8b d7             	mov    r10d,r15d
   14033969a:	44 3b f8             	cmp    r15d,eax
   14033969d:	73 59                	jae    0x1403396f8
   14033969f:	90                   	nop
   1403396a0:	0f bf 4d 00          	movsx  ecx,WORD PTR [rbp+0x0]
   1403396a4:	41 03 ca             	add    ecx,r10d
   1403396a7:	41 3b 4d 0c          	cmp    ecx,DWORD PTR [r13+0xc]
   1403396ab:	7c 3f                	jl     0x1403396ec
   1403396ad:	41 8b 86 bc 00 00 00 	mov    eax,DWORD PTR [r14+0xbc]
   1403396b4:	41 03 45 10          	add    eax,DWORD PTR [r13+0x10]
   1403396b8:	3b c8                	cmp    ecx,eax
   1403396ba:	7d 30                	jge    0x1403396ec
   1403396bc:	45 8b c2             	mov    r8d,r10d
   1403396bf:	49 6b c0 5c          	imul   rax,r8,0x5c
   1403396c3:	0f b6 4c 38 4b       	movzx  ecx,BYTE PTR [rax+rdi*1+0x4b]
   1403396c8:	3b d9                	cmp    ebx,ecx
   1403396ca:	73 20                	jae    0x1403396ec
   1403396cc:	4d 6b c0 17          	imul   r8,r8,0x17
   1403396d0:	40 0f b6 d6          	movzx  edx,sil
   1403396d4:	48 8d 0c 5b          	lea    rcx,[rbx+rbx*2]
   1403396d8:	4e 8d 0c 02          	lea    r9,[rdx+r8*1]
   1403396dc:	42 8b 44 8f 54       	mov    eax,DWORD PTR [rdi+r9*4+0x54]
   1403396e1:	48 8d 14 4a          	lea    rdx,[rdx+rcx*2]
   1403396e5:	49 03 d0             	add    rdx,r8
   1403396e8:	89 44 97 08          	mov    DWORD PTR [rdi+rdx*4+0x8],eax
   1403396ec:	0f b7 45 fe          	movzx  eax,WORD PTR [rbp-0x2]
   1403396f0:	41 ff c2             	inc    r10d
   1403396f3:	44 3b d0             	cmp    r10d,eax
   1403396f6:	72 a8                	jb     0x1403396a0
   1403396f8:	8b 4c 24 20          	mov    ecx,DWORD PTR [rsp+0x20]
   1403396fc:	40 fe c6             	inc    sil
   1403396ff:	40 88 b4 24 38 01 00 	mov    BYTE PTR [rsp+0x138],sil
   140339706:	00 
   140339707:	40 80 fe 02          	cmp    sil,0x2
   14033970b:	0f 82 6f fd ff ff    	jb     0x140339480
   140339711:	ff c3                	inc    ebx
   140339713:	3b 1d e3 02 60 00    	cmp    ebx,DWORD PTR [rip+0x6002e3]        # 0x1409399fc
   140339719:	0f 82 51 fd ff ff    	jb     0x140339470
   14033971f:	48 8b 74 24 30       	mov    rsi,QWORD PTR [rsp+0x30]
   140339724:	48 83 c5 28          	add    rbp,0x28
   140339728:	48 83 ee 01          	sub    rsi,0x1
   14033972c:	48 89 74 24 30       	mov    QWORD PTR [rsp+0x30],rsi
   140339731:	0f 85 99 fc ff ff    	jne    0x1403393d0
   140339737:	44 0f 28 7c 24 40    	movaps xmm15,XMMWORD PTR [rsp+0x40]
   14033973d:	44 0f 28 74 24 50    	movaps xmm14,XMMWORD PTR [rsp+0x50]
   140339743:	44 0f 28 64 24 70    	movaps xmm12,XMMWORD PTR [rsp+0x70]
   140339749:	44 0f 28 9c 24 80 00 	movaps xmm11,XMMWORD PTR [rsp+0x80]
   140339750:	00 00 
   140339752:	44 0f 28 94 24 90 00 	movaps xmm10,XMMWORD PTR [rsp+0x90]
   140339759:	00 00 
   14033975b:	44 0f 28 8c 24 a0 00 	movaps xmm9,XMMWORD PTR [rsp+0xa0]
   140339762:	00 00 
   140339764:	44 0f 28 84 24 b0 00 	movaps xmm8,XMMWORD PTR [rsp+0xb0]
   14033976b:	00 00 
   14033976d:	0f 28 bc 24 c0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xc0]
   140339774:	00 
   140339775:	0f 28 b4 24 d0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xd0]
   14033977c:	00 
   14033977d:	4c 8b a4 24 e0 00 00 	mov    r12,QWORD PTR [rsp+0xe0]
   140339784:	00 
   140339785:	48 8b bc 24 e8 00 00 	mov    rdi,QWORD PTR [rsp+0xe8]
   14033978c:	00 
   14033978d:	48 8b b4 24 f0 00 00 	mov    rsi,QWORD PTR [rsp+0xf0]
   140339794:	00 
   140339795:	48 8b ac 24 f8 00 00 	mov    rbp,QWORD PTR [rsp+0xf8]
   14033979c:	00 
   14033979d:	48 8b 9c 24 28 01 00 	mov    rbx,QWORD PTR [rsp+0x128]
   1403397a4:	00 
   1403397a5:	44 0f 28 6c 24 60    	movaps xmm13,XMMWORD PTR [rsp+0x60]
   1403397ab:	48 81 c4 00 01 00 00 	add    rsp,0x100
   1403397b2:	41 5f                	pop    r15
   1403397b4:	41 5e                	pop    r14
   1403397b6:	41 5d                	pop    r13
   1403397b8:	c3                   	ret
   1403397b9:	cc                   	int3
   1403397ba:	cc                   	int3
   1403397bb:	cc                   	int3
   1403397bc:	cc                   	int3
   1403397bd:	cc                   	int3
   1403397be:	cc                   	int3
   1403397bf:	cc                   	int3
