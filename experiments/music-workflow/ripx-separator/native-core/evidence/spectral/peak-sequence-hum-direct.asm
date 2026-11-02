
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140337000 <.text+0x336000>:
   140337000:	92                   	xchg   edx,eax
   140337001:	80 00 00             	add    BYTE PTR [rax],0x0
   140337004:	00 0f                	add    BYTE PTR [rdi],cl
   140337006:	11 41 80             	adc    DWORD PTR [rcx-0x80],eax
   140337009:	0f 10 42 a0          	movups xmm0,XMMWORD PTR [rdx-0x60]
   14033700d:	0f 11 49 90          	movups XMMWORD PTR [rcx-0x70],xmm1
   140337011:	0f 10 4a b0          	movups xmm1,XMMWORD PTR [rdx-0x50]
   140337015:	0f 11 41 a0          	movups XMMWORD PTR [rcx-0x60],xmm0
   140337019:	0f 10 42 c0          	movups xmm0,XMMWORD PTR [rdx-0x40]
   14033701d:	0f 11 49 b0          	movups XMMWORD PTR [rcx-0x50],xmm1
   140337021:	0f 10 4a d0          	movups xmm1,XMMWORD PTR [rdx-0x30]
   140337025:	0f 11 41 c0          	movups XMMWORD PTR [rcx-0x40],xmm0
   140337029:	0f 10 42 e0          	movups xmm0,XMMWORD PTR [rdx-0x20]
   14033702d:	0f 11 49 d0          	movups XMMWORD PTR [rcx-0x30],xmm1
   140337031:	0f 10 4a f0          	movups xmm1,XMMWORD PTR [rdx-0x10]
   140337035:	0f 11 41 e0          	movups XMMWORD PTR [rcx-0x20],xmm0
   140337039:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   14033703d:	48 83 e8 01          	sub    rax,0x1
   140337041:	75 ad                	jne    0x140336ff0
   140337043:	48 8b 42 30          	mov    rax,QWORD PTR [rdx+0x30]
   140337047:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   14033704a:	0f 10 4a 10          	movups xmm1,XMMWORD PTR [rdx+0x10]
   14033704e:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   140337051:	0f 10 42 20          	movups xmm0,XMMWORD PTR [rdx+0x20]
   140337055:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   140337059:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   14033705d:	48 89 41 30          	mov    QWORD PTR [rcx+0x30],rax
   140337061:	8b 42 38             	mov    eax,DWORD PTR [rdx+0x38]
   140337064:	48 8d 55 d0          	lea    rdx,[rbp-0x30]
   140337068:	89 41 38             	mov    DWORD PTR [rcx+0x38],eax
   14033706b:	49 8b c9             	mov    rcx,r9
   14033706e:	49 8b c4             	mov    rax,r12
   140337071:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   140337074:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14033707b:	0f 10 4a 10          	movups xmm1,XMMWORD PTR [rdx+0x10]
   14033707f:	0f 11 41 80          	movups XMMWORD PTR [rcx-0x80],xmm0
   140337083:	0f 10 42 20          	movups xmm0,XMMWORD PTR [rdx+0x20]
   140337087:	0f 11 49 90          	movups XMMWORD PTR [rcx-0x70],xmm1
   14033708b:	0f 10 4a 30          	movups xmm1,XMMWORD PTR [rdx+0x30]
   14033708f:	0f 11 41 a0          	movups XMMWORD PTR [rcx-0x60],xmm0
   140337093:	0f 10 42 40          	movups xmm0,XMMWORD PTR [rdx+0x40]
   140337097:	0f 11 49 b0          	movups XMMWORD PTR [rcx-0x50],xmm1
   14033709b:	0f 10 4a 50          	movups xmm1,XMMWORD PTR [rdx+0x50]
   14033709f:	0f 11 41 c0          	movups XMMWORD PTR [rcx-0x40],xmm0
   1403370a3:	0f 10 42 60          	movups xmm0,XMMWORD PTR [rdx+0x60]
   1403370a7:	0f 11 49 d0          	movups XMMWORD PTR [rcx-0x30],xmm1
   1403370ab:	0f 10 4a 70          	movups xmm1,XMMWORD PTR [rdx+0x70]
   1403370af:	48 83 ea 80          	sub    rdx,0xffffffffffffff80
   1403370b3:	0f 11 41 e0          	movups XMMWORD PTR [rcx-0x20],xmm0
   1403370b7:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   1403370bb:	48 83 e8 01          	sub    rax,0x1
   1403370bf:	75 b0                	jne    0x140337071
   1403370c1:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   1403370c4:	48 8b 42 30          	mov    rax,QWORD PTR [rdx+0x30]
   1403370c8:	41 b0 01             	mov    r8b,0x1
   1403370cb:	0f 10 4a 10          	movups xmm1,XMMWORD PTR [rdx+0x10]
   1403370cf:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   1403370d2:	0f 10 42 20          	movups xmm0,XMMWORD PTR [rdx+0x20]
   1403370d6:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   1403370da:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   1403370de:	48 89 41 30          	mov    QWORD PTR [rcx+0x30],rax
   1403370e2:	8b 42 38             	mov    eax,DWORD PTR [rdx+0x38]
   1403370e5:	89 41 38             	mov    DWORD PTR [rcx+0x38],eax
   1403370e8:	41 0f b7 0c 5b       	movzx  ecx,WORD PTR [r11+rbx*2]
   1403370ed:	41 ff c2             	inc    r10d
   1403370f0:	49 81 c1 3c 01 00 00 	add    r9,0x13c
   1403370f7:	0f b7 d1             	movzx  edx,cx
   1403370fa:	8d 41 ff             	lea    eax,[rcx-0x1]
   1403370fd:	44 3b d0             	cmp    r10d,eax
   140337100:	0f 8c 2a fe ff ff    	jl     0x140336f30
   140337106:	45 33 c9             	xor    r9d,r9d
   140337109:	eb 03                	jmp    0x14033710e
   14033710b:	0f b7 ca             	movzx  ecx,dx
   14033710e:	0f b7 c1             	movzx  eax,cx
   140337111:	45 84 c0             	test   r8b,r8b
   140337114:	0f 85 f6 fd ff ff    	jne    0x140336f10
   14033711a:	4c 8b 64 24 50       	mov    r12,QWORD PTR [rsp+0x50]
   14033711f:	66 44 3b c9          	cmp    r9w,cx
   140337123:	0f 83 71 01 00 00    	jae    0x14033729a
   140337129:	4c 8b 74 24 68       	mov    r14,QWORD PTR [rsp+0x68]
   14033712e:	be 01 00 00 00       	mov    esi,0x1
   140337133:	49 8b ff             	mov    rdi,r15
   140337136:	44 8d 66 01          	lea    r12d,[rsi+0x1]
   14033713a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140337140:	0f b7 c1             	movzx  eax,cx
   140337143:	44 8b d6             	mov    r10d,esi
   140337146:	0f b7 d1             	movzx  edx,cx
   140337149:	3b f0                	cmp    esi,eax
   14033714b:	0f 8d 18 01 00 00    	jge    0x140337269
   140337151:	4c 8d 9f 3c 01 00 00 	lea    r11,[rdi+0x13c]
   140337158:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14033715f:	00 
   140337160:	f3 41 0f 10 13       	movss  xmm2,DWORD PTR [r11]
   140337165:	0f b7 d1             	movzx  edx,cx
   140337168:	f3 0f 10 0f          	movss  xmm1,DWORD PTR [rdi]
   14033716c:	0f 28 c2             	movaps xmm0,xmm2
   14033716f:	f3 0f 5c c1          	subss  xmm0,xmm1
   140337173:	0f 2f d8             	comiss xmm3,xmm0
   140337176:	0f 82 d4 00 00 00    	jb     0x140337250
   14033717c:	f3 0f 5c ca          	subss  xmm1,xmm2
   140337180:	0f 2f d9             	comiss xmm3,xmm1
   140337183:	0f 82 c7 00 00 00    	jb     0x140337250
   140337189:	0f b7 c1             	movzx  eax,cx
   14033718c:	45 8b ca             	mov    r9d,r10d
   14033718f:	ff c8                	dec    eax
   140337191:	44 3b d0             	cmp    r10d,eax
   140337194:	0f 8d a4 00 00 00    	jge    0x14033723e
   14033719a:	49 8b cb             	mov    rcx,r11
   14033719d:	0f 1f 00             	nop    DWORD PTR [rax]
   1403371a0:	4c 8d 81 3c 01 00 00 	lea    r8,[rcx+0x13c]
   1403371a7:	49 8b c4             	mov    rax,r12
   1403371aa:	49 8b d0             	mov    rdx,r8
   1403371ad:	0f 1f 00             	nop    DWORD PTR [rax]
   1403371b0:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   1403371b7:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   1403371ba:	0f 10 4a 10          	movups xmm1,XMMWORD PTR [rdx+0x10]
   1403371be:	48 8d 92 80 00 00 00 	lea    rdx,[rdx+0x80]
   1403371c5:	0f 11 41 80          	movups XMMWORD PTR [rcx-0x80],xmm0
   1403371c9:	0f 10 42 a0          	movups xmm0,XMMWORD PTR [rdx-0x60]
   1403371cd:	0f 11 49 90          	movups XMMWORD PTR [rcx-0x70],xmm1
   1403371d1:	0f 10 4a b0          	movups xmm1,XMMWORD PTR [rdx-0x50]
   1403371d5:	0f 11 41 a0          	movups XMMWORD PTR [rcx-0x60],xmm0
   1403371d9:	0f 10 42 c0          	movups xmm0,XMMWORD PTR [rdx-0x40]
   1403371dd:	0f 11 49 b0          	movups XMMWORD PTR [rcx-0x50],xmm1
   1403371e1:	0f 10 4a d0          	movups xmm1,XMMWORD PTR [rdx-0x30]
   1403371e5:	0f 11 41 c0          	movups XMMWORD PTR [rcx-0x40],xmm0
   1403371e9:	0f 10 42 e0          	movups xmm0,XMMWORD PTR [rdx-0x20]
   1403371ed:	0f 11 49 d0          	movups XMMWORD PTR [rcx-0x30],xmm1
   1403371f1:	0f 10 4a f0          	movups xmm1,XMMWORD PTR [rdx-0x10]
   1403371f5:	0f 11 41 e0          	movups XMMWORD PTR [rcx-0x20],xmm0
   1403371f9:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   1403371fd:	48 83 e8 01          	sub    rax,0x1
   140337201:	75 ad                	jne    0x1403371b0
   140337203:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   140337206:	48 8b 42 30          	mov    rax,QWORD PTR [rdx+0x30]
   14033720a:	41 ff c1             	inc    r9d
   14033720d:	0f 10 4a 10          	movups xmm1,XMMWORD PTR [rdx+0x10]
   140337211:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   140337214:	0f 10 42 20          	movups xmm0,XMMWORD PTR [rdx+0x20]
   140337218:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   14033721c:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   140337220:	48 89 41 30          	mov    QWORD PTR [rcx+0x30],rax
   140337224:	8b 42 38             	mov    eax,DWORD PTR [rdx+0x38]
   140337227:	89 41 38             	mov    DWORD PTR [rcx+0x38],eax
   14033722a:	49 8b c8             	mov    rcx,r8
   14033722d:	41 0f b7 14 5e       	movzx  edx,WORD PTR [r14+rbx*2]
   140337232:	8d 42 ff             	lea    eax,[rdx-0x1]
   140337235:	44 3b c8             	cmp    r9d,eax
   140337238:	0f 8c 62 ff ff ff    	jl     0x1403371a0
   14033723e:	66 ff ca             	dec    dx
   140337241:	41 ff ca             	dec    r10d
   140337244:	66 41 89 14 5e       	mov    WORD PTR [r14+rbx*2],dx
   140337249:	49 81 eb 3c 01 00 00 	sub    r11,0x13c
   140337250:	41 ff c2             	inc    r10d
   140337253:	0f b7 c2             	movzx  eax,dx
   140337256:	49 81 c3 3c 01 00 00 	add    r11,0x13c
   14033725d:	0f b7 ca             	movzx  ecx,dx
   140337260:	44 3b d0             	cmp    r10d,eax
   140337263:	0f 8c f7 fe ff ff    	jl     0x140337160
   140337269:	ff c6                	inc    esi
   14033726b:	0f b7 c2             	movzx  eax,dx
   14033726e:	48 81 c7 3c 01 00 00 	add    rdi,0x13c
   140337275:	0f b7 ca             	movzx  ecx,dx
   140337278:	3b f0                	cmp    esi,eax
   14033727a:	0f 8e c0 fe ff ff    	jle    0x140337140
   140337280:	4c 8b 75 80          	mov    r14,QWORD PTR [rbp-0x80]
   140337284:	45 33 c9             	xor    r9d,r9d
   140337287:	8b 7c 24 48          	mov    edi,DWORD PTR [rsp+0x48]
   14033728b:	4c 8b 5c 24 68       	mov    r11,QWORD PTR [rsp+0x68]
   140337290:	48 8b 74 24 58       	mov    rsi,QWORD PTR [rsp+0x58]
   140337295:	4c 8b 64 24 50       	mov    r12,QWORD PTR [rsp+0x50]
   14033729a:	41 8b d1             	mov    edx,r9d
   14033729d:	66 44 3b c9          	cmp    r9w,cx
   1403372a1:	73 76                	jae    0x140337319
   1403372a3:	f3 41 0f 10 0f       	movss  xmm1,DWORD PTR [r15]
   1403372a8:	41 0f 2f ca          	comiss xmm1,xmm10
   1403372ac:	76 0a                	jbe    0x1403372b8
   1403372ae:	0f 28 d1             	movaps xmm2,xmm1
   1403372b1:	f3 41 0f 5c d2       	subss  xmm2,xmm10
   1403372b6:	eb 08                	jmp    0x1403372c0
   1403372b8:	41 0f 28 d2          	movaps xmm2,xmm10
   1403372bc:	f3 0f 5c d1          	subss  xmm2,xmm1
   1403372c0:	41 0f 2f cb          	comiss xmm1,xmm11
   1403372c4:	76 07                	jbe    0x1403372cd
   1403372c6:	f3 41 0f 5c cb       	subss  xmm1,xmm11
   1403372cb:	eb 0b                	jmp    0x1403372d8
   1403372cd:	41 0f 28 c3          	movaps xmm0,xmm11
   1403372d1:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403372d5:	0f 28 c8             	movaps xmm1,xmm0
   1403372d8:	f3 0f 5d ca          	minss  xmm1,xmm2
   1403372dc:	44 0f 2f e1          	comiss xmm12,xmm1
   1403372e0:	76 25                	jbe    0x140337307
   1403372e2:	f3 41 0f 10 87 cc 00 	movss  xmm0,DWORD PTR [r15+0xcc]
   1403372e9:	00 00 
   1403372eb:	0f 2f e0             	comiss xmm4,xmm0
   1403372ee:	76 17                	jbe    0x140337307
   1403372f0:	49 63 c5             	movsxd rax,r13d
   1403372f3:	f3 41 0f 10 0c 86    	movss  xmm1,DWORD PTR [r14+rax*4]
   1403372f9:	0f 2f c1             	comiss xmm0,xmm1
   1403372fc:	77 03                	ja     0x140337301
   1403372fe:	0f 28 c1             	movaps xmm0,xmm1
   140337301:	f3 41 0f 11 04 86    	movss  DWORD PTR [r14+rax*4],xmm0
   140337307:	41 0f b7 04 5b       	movzx  eax,WORD PTR [r11+rbx*2]
   14033730c:	ff c2                	inc    edx
   14033730e:	49 81 c7 3c 01 00 00 	add    r15,0x13c
   140337315:	3b d0                	cmp    edx,eax
   140337317:	7c 8a                	jl     0x1403372a3
   140337319:	44 8b 86 bc 00 00 00 	mov    r8d,DWORD PTR [rsi+0xbc]
   140337320:	41 8b d0             	mov    edx,r8d
   140337323:	44 8b 7c 24 4c       	mov    r15d,DWORD PTR [rsp+0x4c]
   140337328:	49 63 c5             	movsxd rax,r13d
   14033732b:	66 41 0f 6e c5       	movd   xmm0,r13d
   140337330:	41 ff c5             	inc    r13d
   140337333:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140337336:	43 8d 0c 38          	lea    ecx,[r8+r15*1]
   14033733a:	f3 41 0f 58 34 86    	addss  xmm6,DWORD PTR [r14+rax*4]
   140337340:	f3 41 0f 59 04 86    	mulss  xmm0,DWORD PTR [r14+rax*4]
   140337346:	42 8d 04 2f          	lea    eax,[rdi+r13*1]
   14033734a:	f3 0f 58 e8          	addss  xmm5,xmm0
   14033734e:	3b c1                	cmp    eax,ecx
   140337350:	0f 8c 7a fb ff ff    	jl     0x140336ed0
   140337356:	41 0f 2e f5          	ucomiss xmm6,xmm13
   14033735a:	44 8b 64 24 40       	mov    r12d,DWORD PTR [rsp+0x40]
   14033735f:	7a 02                	jp     0x140337363
   140337361:	74 04                	je     0x140337367
   140337363:	f3 0f 5e ee          	divss  xmm5,xmm6
   140337367:	41 8b c0             	mov    eax,r8d
   14033736a:	45 0f 28 c5          	movaps xmm8,xmm13
   14033736e:	2b c7                	sub    eax,edi
   140337370:	41 03 c7             	add    eax,r15d
   140337373:	66 0f 6e c8          	movd   xmm1,eax
   140337377:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   14033737a:	0f 28 c1             	movaps xmm0,xmm1
   14033737d:	f3 0f 59 05 f3 17 36 	mulss  xmm0,DWORD PTR [rip+0x3617f3]        # 0x140698b78
   140337384:	00 
   140337385:	0f 2f e8             	comiss xmm5,xmm0
   140337388:	0f 86 92 00 00 00    	jbe    0x140337420
   14033738e:	f3 0f 59 0d a2 fd 35 	mulss  xmm1,DWORD PTR [rip+0x35fda2]        # 0x140697138
   140337395:	00 
   140337396:	0f 2f cd             	comiss xmm1,xmm5
   140337399:	0f 86 81 00 00 00    	jbe    0x140337420
   14033739f:	45 33 ff             	xor    r15d,r15d
   1403373a2:	45 32 c9             	xor    r9b,r9b
   1403373a5:	43 8d 04 20          	lea    eax,[r8+r12*1]
   1403373a9:	3b f8                	cmp    edi,eax
   1403373ab:	7d 41                	jge    0x1403373ee
   1403373ad:	41 8b d7             	mov    edx,r15d
   1403373b0:	48 63 c2             	movsxd rax,edx
   1403373b3:	f3 41 0f 10 0c 86    	movss  xmm1,DWORD PTR [r14+rax*4]
   1403373b9:	f3 41 0f 10 44 86 04 	movss  xmm0,DWORD PTR [r14+rax*4+0x4]
   1403373c0:	0f 2f c1             	comiss xmm0,xmm1
   1403373c3:	76 10                	jbe    0x1403373d5
   1403373c5:	f3 41 0f 11 04 86    	movss  DWORD PTR [r14+rax*4],xmm0
   1403373cb:	41 b1 01             	mov    r9b,0x1
   1403373ce:	f3 41 0f 11 4c 86 04 	movss  DWORD PTR [r14+rax*4+0x4],xmm1
   1403373d5:	44 8b 86 bc 00 00 00 	mov    r8d,DWORD PTR [rsi+0xbc]
   1403373dc:	ff c2                	inc    edx
   1403373de:	8d 0c 3a             	lea    ecx,[rdx+rdi*1]
   1403373e1:	43 8d 04 20          	lea    eax,[r8+r12*1]
   1403373e5:	3b c8                	cmp    ecx,eax
   1403373e7:	7c c7                	jl     0x1403373b0
   1403373e9:	41 8b d0             	mov    edx,r8d
   1403373ec:	eb 03                	jmp    0x1403373f1
   1403373ee:	44 8b c2             	mov    r8d,edx
   1403373f1:	45 84 c9             	test   r9b,r9b
   1403373f4:	75 ac                	jne    0x1403373a2
   1403373f6:	44 8b 7c 24 4c       	mov    r15d,DWORD PTR [rsp+0x4c]
   1403373fb:	44 2b c7             	sub    r8d,edi
   1403373fe:	43 8d 04 07          	lea    eax,[r15+r8*1]
   140337402:	99                   	cdq
   140337403:	2b c2                	sub    eax,edx
   140337405:	d1 f8                	sar    eax,1
   140337407:	48 63 c8             	movsxd rcx,eax
   14033740a:	f3 41 0f 10 04 8e    	movss  xmm0,DWORD PTR [r14+rcx*4]
   140337410:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140337413:	f2 0f 59 05 c5 05 37 	mulsd  xmm0,QWORD PTR [rip+0x3705c5]        # 0x1406a79e0
   14033741a:	00 
   14033741b:	66 44 0f 5a c0       	cvtpd2ps xmm8,xmm0
   140337420:	49 8b ce             	mov    rcx,r14
   140337423:	e8 30 41 2e 00       	call   0x14061b558
   140337428:	8b 8e bc 00 00 00    	mov    ecx,DWORD PTR [rsi+0xbc]
   14033742e:	41 03 cf             	add    ecx,r15d
   140337431:	3b f9                	cmp    edi,ecx
   140337433:	0f 8d 31 02 00 00    	jge    0x14033766a
   140337439:	f2 0f 10 3d 3f 6d 35 	movsd  xmm7,QWORD PTR [rip+0x356d3f]        # 0x14068e180
   140337440:	00 
   140337441:	f3 44 0f 10 0d 5e 06 	movss  xmm9,DWORD PTR [rip+0x37065e]        # 0x1406a7aa8
   140337448:	37 00 
   14033744a:	4c 8b 74 24 68       	mov    r14,QWORD PTR [rsp+0x68]
   14033744f:	90                   	nop
   140337450:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   140337455:	8b cf                	mov    ecx,edi
   140337457:	2b 48 0c             	sub    ecx,DWORD PTR [rax+0xc]
   14033745a:	8b c1                	mov    eax,ecx
   14033745c:	48 63 f1             	movsxd rsi,ecx
   14033745f:	c1 e0 09             	shl    eax,0x9
   140337462:	48 69 d8 3c 01 00 00 	imul   rbx,rax,0x13c
   140337469:	33 c0                	xor    eax,eax
   14033746b:	48 03 5c 24 78       	add    rbx,QWORD PTR [rsp+0x78]
   140337470:	8b f8                	mov    edi,eax
   140337472:	66 41 3b 04 76       	cmp    ax,WORD PTR [r14+rsi*2]
   140337477:	0f 83 cd 01 00 00    	jae    0x14033764a
   14033747d:	44 8d 78 02          	lea    r15d,[rax+0x2]
   140337481:	f3 0f 10 0b          	movss  xmm1,DWORD PTR [rbx]
   140337485:	41 0f 2e cd          	ucomiss xmm1,xmm13
   140337489:	7a 06                	jp     0x140337491
   14033748b:	0f 84 9e 01 00 00    	je     0x14033762f
   140337491:	f3 0f 10 9b cc 00 00 	movss  xmm3,DWORD PTR [rbx+0xcc]
   140337498:	00 
   140337499:	41 0f 2e dd          	ucomiss xmm3,xmm13
   14033749d:	7a 06                	jp     0x1403374a5
   14033749f:	0f 84 8a 01 00 00    	je     0x14033762f
   1403374a5:	41 0f 2f ca          	comiss xmm1,xmm10
   1403374a9:	76 0a                	jbe    0x1403374b5
   1403374ab:	0f 28 d1             	movaps xmm2,xmm1
   1403374ae:	f3 41 0f 5c d2       	subss  xmm2,xmm10
   1403374b3:	eb 08                	jmp    0x1403374bd
   1403374b5:	41 0f 28 d2          	movaps xmm2,xmm10
   1403374b9:	f3 0f 5c d1          	subss  xmm2,xmm1
   1403374bd:	41 0f 2f cb          	comiss xmm1,xmm11
   1403374c1:	76 07                	jbe    0x1403374ca
   1403374c3:	f3 41 0f 5c cb       	subss  xmm1,xmm11
   1403374c8:	eb 0b                	jmp    0x1403374d5
   1403374ca:	41 0f 28 c3          	movaps xmm0,xmm11
   1403374ce:	f3 0f 5c c1          	subss  xmm0,xmm1
   1403374d2:	0f 28 c8             	movaps xmm1,xmm0
   1403374d5:	f3 0f 5d ca          	minss  xmm1,xmm2
   1403374d9:	44 0f 2f e1          	comiss xmm12,xmm1
   1403374dd:	0f 86 4c 01 00 00    	jbe    0x14033762f
   1403374e3:	44 0f 2f eb          	comiss xmm13,xmm3
   1403374e7:	72 06                	jb     0x1403374ef
   1403374e9:	41 0f 28 f5          	movaps xmm6,xmm13
   1403374ed:	eb 20                	jmp    0x14033750f
   1403374ef:	f2 0f 10 0d 39 6c 35 	movsd  xmm1,QWORD PTR [rip+0x356c39]        # 0x14068e130
   1403374f6:	00 
   1403374f7:	0f 5a c3             	cvtps2pd xmm0,xmm3
   1403374fa:	f2 0f 5e c7          	divsd  xmm0,xmm7
   1403374fe:	e8 77 98 2e 00       	call   0x140620d7a
   140337503:	0f 57 f6             	xorps  xmm6,xmm6
   140337506:	f2 0f 5a f0          	cvtsd2ss xmm6,xmm0
   14033750a:	f3 41 0f 59 f7       	mulss  xmm6,xmm15
   14033750f:	41 0f 28 c0          	movaps xmm0,xmm8
   140337513:	e8 38 f9 00 00       	call   0x140346e50
   140337518:	f3 0f 5c f0          	subss  xmm6,xmm0
   14033751c:	44 0f 2f ee          	comiss xmm13,xmm6
   140337520:	72 0b                	jb     0x14033752d
   140337522:	f3 44 0f 11 ab cc 00 	movss  DWORD PTR [rbx+0xcc],xmm13
   140337529:	00 00 
   14033752b:	eb 32                	jmp    0x14033755f
   14033752d:	0f 57 c0             	xorps  xmm0,xmm0
   140337530:	41 0f 28 ce          	movaps xmm1,xmm14
   140337534:	f3 0f 5a c6          	cvtss2sd xmm0,xmm6
   140337538:	f2 0f 5e c7          	divsd  xmm0,xmm7
   14033753c:	e8 39 98 2e 00       	call   0x140620d7a
   140337541:	0f 57 c9             	xorps  xmm1,xmm1
   140337544:	f2 0f 5a c8          	cvtsd2ss xmm1,xmm0
   140337548:	f3 41 0f 59 cf       	mulss  xmm1,xmm15
   14033754d:	44 0f 2f c9          	comiss xmm9,xmm1
   140337551:	f3 0f 11 8b cc 00 00 	movss  DWORD PTR [rbx+0xcc],xmm1
   140337558:	00 
   140337559:	0f 86 d0 00 00 00    	jbe    0x14033762f
   14033755f:	41 0f b7 14 76       	movzx  edx,WORD PTR [r14+rsi*2]
   140337564:	44 8b c7             	mov    r8d,edi
   140337567:	8d 42 ff             	lea    eax,[rdx-0x1]
   14033756a:	3b f8                	cmp    edi,eax
   14033756c:	0f 8d ac 00 00 00    	jge    0x14033761e
   140337572:	48 8b cb             	mov    rcx,rbx
   140337575:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14033757c:	00 00 00 00 
   140337580:	4c 8d 89 3c 01 00 00 	lea    r9,[rcx+0x13c]
   140337587:	49 8b c7             	mov    rax,r15
   14033758a:	49 8b d1             	mov    rdx,r9
   14033758d:	0f 1f 00             	nop    DWORD PTR [rax]
   140337590:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   140337597:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   14033759a:	0f 10 4a 10          	movups xmm1,XMMWORD PTR [rdx+0x10]
   14033759e:	48 8d 92 80 00 00 00 	lea    rdx,[rdx+0x80]
   1403375a5:	0f 11 41 80          	movups XMMWORD PTR [rcx-0x80],xmm0
   1403375a9:	0f 10 42 a0          	movups xmm0,XMMWORD PTR [rdx-0x60]
   1403375ad:	0f 11 49 90          	movups XMMWORD PTR [rcx-0x70],xmm1
   1403375b1:	0f 10 4a b0          	movups xmm1,XMMWORD PTR [rdx-0x50]
   1403375b5:	0f 11 41 a0          	movups XMMWORD PTR [rcx-0x60],xmm0
   1403375b9:	0f 10 42 c0          	movups xmm0,XMMWORD PTR [rdx-0x40]
   1403375bd:	0f 11 49 b0          	movups XMMWORD PTR [rcx-0x50],xmm1
   1403375c1:	0f 10 4a d0          	movups xmm1,XMMWORD PTR [rdx-0x30]
   1403375c5:	0f 11 41 c0          	movups XMMWORD PTR [rcx-0x40],xmm0
   1403375c9:	0f 10 42 e0          	movups xmm0,XMMWORD PTR [rdx-0x20]
   1403375cd:	0f 11 49 d0          	movups XMMWORD PTR [rcx-0x30],xmm1
   1403375d1:	0f 10 4a f0          	movups xmm1,XMMWORD PTR [rdx-0x10]
   1403375d5:	0f 11 41 e0          	movups XMMWORD PTR [rcx-0x20],xmm0
   1403375d9:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   1403375dd:	48 83 e8 01          	sub    rax,0x1
   1403375e1:	75 ad                	jne    0x140337590
   1403375e3:	0f 10 02             	movups xmm0,XMMWORD PTR [rdx]
   1403375e6:	48 8b 42 30          	mov    rax,QWORD PTR [rdx+0x30]
   1403375ea:	41 ff c0             	inc    r8d
   1403375ed:	0f 10 4a 10          	movups xmm1,XMMWORD PTR [rdx+0x10]
   1403375f1:	0f 11 01             	movups XMMWORD PTR [rcx],xmm0
   1403375f4:	0f 10 42 20          	movups xmm0,XMMWORD PTR [rdx+0x20]
   1403375f8:	0f 11 49 10          	movups XMMWORD PTR [rcx+0x10],xmm1
   1403375fc:	0f 11 41 20          	movups XMMWORD PTR [rcx+0x20],xmm0
   140337600:	48 89 41 30          	mov    QWORD PTR [rcx+0x30],rax
   140337604:	8b 42 38             	mov    eax,DWORD PTR [rdx+0x38]
   140337607:	89 41 38             	mov    DWORD PTR [rcx+0x38],eax
   14033760a:	49 8b c9             	mov    rcx,r9
   14033760d:	41 0f b7 14 76       	movzx  edx,WORD PTR [r14+rsi*2]
   140337612:	8d 42 ff             	lea    eax,[rdx-0x1]
   140337615:	44 3b c0             	cmp    r8d,eax
   140337618:	0f 8c 62 ff ff ff    	jl     0x140337580
   14033761e:	66 ff ca             	dec    dx
   140337621:	ff cf                	dec    edi
   140337623:	66 41 89 14 76       	mov    WORD PTR [r14+rsi*2],dx
   140337628:	48 81 eb 3c 01 00 00 	sub    rbx,0x13c
   14033762f:	41 0f b7 04 76       	movzx  eax,WORD PTR [r14+rsi*2]
   140337634:	ff c7                	inc    edi
   140337636:	48 81 c3 3c 01 00 00 	add    rbx,0x13c
   14033763d:	3b f8                	cmp    edi,eax
   14033763f:	0f 8c 3c fe ff ff    	jl     0x140337481
   140337645:	44 8b 7c 24 4c       	mov    r15d,DWORD PTR [rsp+0x4c]
   14033764a:	8b 7c 24 48          	mov    edi,DWORD PTR [rsp+0x48]
   14033764e:	48 8b 44 24 58       	mov    rax,QWORD PTR [rsp+0x58]
   140337653:	ff c7                	inc    edi
   140337655:	89 7c 24 48          	mov    DWORD PTR [rsp+0x48],edi
   140337659:	8b 88 bc 00 00 00    	mov    ecx,DWORD PTR [rax+0xbc]
   14033765f:	41 03 cf             	add    ecx,r15d
   140337662:	3b f9                	cmp    edi,ecx
   140337664:	0f 8c e6 fd ff ff    	jl     0x140337450
   14033766a:	48 8b 8d 60 02 00 00 	mov    rcx,QWORD PTR [rbp+0x260]
   140337671:	48 33 cc             	xor    rcx,rsp
   140337674:	e8 87 3f 2e 00       	call   0x14061b600
   140337679:	4c 8d 9c 24 10 04 00 	lea    r11,[rsp+0x410]
   140337680:	 
