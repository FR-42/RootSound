
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032aef0 <.text+0x329ef0>:
   14032aef0:	48 8b c4             	mov    rax,rsp
   14032aef3:	55                   	push   rbp
   14032aef4:	53                   	push   rbx
   14032aef5:	56                   	push   rsi
   14032aef6:	57                   	push   rdi
   14032aef7:	41 54                	push   r12
   14032aef9:	41 55                	push   r13
   14032aefb:	41 56                	push   r14
   14032aefd:	41 57                	push   r15
   14032aeff:	48 8d a8 c8 f4 ff ff 	lea    rbp,[rax-0xb38]
   14032af06:	48 81 ec f8 0b 00 00 	sub    rsp,0xbf8
   14032af0d:	0f 29 70 a8          	movaps XMMWORD PTR [rax-0x58],xmm6
   14032af11:	0f 29 78 98          	movaps XMMWORD PTR [rax-0x68],xmm7
   14032af15:	44 0f 29 40 88       	movaps XMMWORD PTR [rax-0x78],xmm8
   14032af1a:	44 0f 29 88 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm9
   14032af21:	ff 
   14032af22:	44 0f 29 90 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm10
   14032af29:	ff 
   14032af2a:	44 0f 29 98 58 ff ff 	movaps XMMWORD PTR [rax-0xa8],xmm11
   14032af31:	ff 
   14032af32:	44 0f 29 a0 48 ff ff 	movaps XMMWORD PTR [rax-0xb8],xmm12
   14032af39:	ff 
   14032af3a:	44 0f 29 a8 38 ff ff 	movaps XMMWORD PTR [rax-0xc8],xmm13
   14032af41:	ff 
   14032af42:	44 0f 29 b0 28 ff ff 	movaps XMMWORD PTR [rax-0xd8],xmm14
   14032af49:	ff 
   14032af4a:	44 0f 29 b8 18 ff ff 	movaps XMMWORD PTR [rax-0xe8],xmm15
   14032af51:	ff 
   14032af52:	48 8b 05 0f 72 64 00 	mov    rax,QWORD PTR [rip+0x64720f]        # 0x140972168
   14032af59:	48 33 c4             	xor    rax,rsp
   14032af5c:	48 89 85 40 0a 00 00 	mov    QWORD PTR [rbp+0xa40],rax
   14032af63:	f3 44 0f 10 9d 68 0b 	movss  xmm11,DWORD PTR [rbp+0xb68]
   14032af6a:	00 00 
   14032af6c:	4d 8b e9             	mov    r13,r9
   14032af6f:	f3 44 0f 10 95 60 0b 	movss  xmm10,DWORD PTR [rbp+0xb60]
   14032af76:	00 00 
   14032af78:	41 8b d8             	mov    ebx,r8d
   14032af7b:	48 89 55 80          	mov    QWORD PTR [rbp-0x80],rdx
   14032af7f:	41 bb 01 00 00 00    	mov    r11d,0x1
   14032af85:	48 89 4d 88          	mov    QWORD PTR [rbp-0x78],rcx
   14032af89:	45 0f 28 c3          	movaps xmm8,xmm11
   14032af8d:	8b 0d 15 f2 65 00    	mov    ecx,DWORD PTR [rip+0x65f215]        # 0x14098a1a8
   14032af93:	f3 45 0f 5c c2       	subss  xmm8,xmm10
   14032af98:	41 8b 85 18 02 00 00 	mov    eax,DWORD PTR [r13+0x218]
   14032af9f:	99                   	cdq
   14032afa0:	44 89 44 24 50       	mov    DWORD PTR [rsp+0x50],r8d
   14032afa5:	f7 f9                	idiv   ecx
   14032afa7:	4c 89 4c 24 70       	mov    QWORD PTR [rsp+0x70],r9
   14032afac:	45 8b c8             	mov    r9d,r8d
   14032afaf:	f3 44 0f 59 05 18 50 	mulss  xmm8,DWORD PTR [rip+0x525018]        # 0x14084ffd0
   14032afb6:	52 00 
   14032afb8:	2b d8                	sub    ebx,eax
   14032afba:	41 8b 85 1c 02 00 00 	mov    eax,DWORD PTR [r13+0x21c]
   14032afc1:	ff c8                	dec    eax
   14032afc3:	89 5c 24 68          	mov    DWORD PTR [rsp+0x68],ebx
   14032afc7:	03 c1                	add    eax,ecx
   14032afc9:	99                   	cdq
   14032afca:	44 8d 43 01          	lea    r8d,[rbx+0x1]
   14032afce:	f7 f9                	idiv   ecx
   14032afd0:	48 8d 8d 40 08 00 00 	lea    rcx,[rbp+0x840]
   14032afd7:	41 2b c1             	sub    eax,r9d
   14032afda:	41 8d 53 03          	lea    edx,[r11+0x3]
   14032afde:	41 3b c0             	cmp    eax,r8d
   14032afe1:	44 0f 4d c0          	cmovge r8d,eax
   14032afe5:	41 8b c3             	mov    eax,r11d
   14032afe8:	44 3b c0             	cmp    r8d,eax
   14032afeb:	41 0f 4f c0          	cmovg  eax,r8d
   14032afef:	ff c0                	inc    eax
   14032aff1:	89 44 24 4c          	mov    DWORD PTR [rsp+0x4c],eax
   14032aff5:	49 8d 45 18          	lea    rax,[r13+0x18]
   14032aff9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14032b000:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14032b007:	0f 10 00             	movups xmm0,XMMWORD PTR [rax]
   14032b00a:	0f 10 48 10          	movups xmm1,XMMWORD PTR [rax+0x10]
   14032b00e:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14032b015:	0f 11 41 80          	movups XMMWORD PTR [rcx-0x80],xmm0
   14032b019:	0f 10 40 a0          	movups xmm0,XMMWORD PTR [rax-0x60]
   14032b01d:	0f 11 49 90          	movups XMMWORD PTR [rcx-0x70],xmm1
   14032b021:	0f 10 48 b0          	movups xmm1,XMMWORD PTR [rax-0x50]
   14032b025:	0f 11 41 a0          	movups XMMWORD PTR [rcx-0x60],xmm0
   14032b029:	0f 10 40 c0          	movups xmm0,XMMWORD PTR [rax-0x40]
   14032b02d:	0f 11 49 b0          	movups XMMWORD PTR [rcx-0x50],xmm1
   14032b031:	0f 10 48 d0          	movups xmm1,XMMWORD PTR [rax-0x30]
   14032b035:	0f 11 41 c0          	movups XMMWORD PTR [rcx-0x40],xmm0
   14032b039:	0f 10 40 e0          	movups xmm0,XMMWORD PTR [rax-0x20]
   14032b03d:	0f 11 49 d0          	movups XMMWORD PTR [rcx-0x30],xmm1
   14032b041:	0f 10 48 f0          	movups xmm1,XMMWORD PTR [rax-0x10]
   14032b045:	0f 11 41 e0          	movups XMMWORD PTR [rcx-0x20],xmm0
   14032b049:	0f 11 49 f0          	movups XMMWORD PTR [rcx-0x10],xmm1
   14032b04d:	49 2b d3             	sub    rdx,r11
   14032b050:	75 ae                	jne    0x14032b000
   14032b052:	8b 05 fc f0 65 00    	mov    eax,DWORD PTR [rip+0x65f0fc]        # 0x14098a154
   14032b058:	48 8d 8d 40 08 00 00 	lea    rcx,[rbp+0x840]
   14032b05f:	f2 0f 10 3d 91 51 52 	movsd  xmm7,QWORD PTR [rip+0x525191]        # 0x1408501f8
   14032b066:	00 
   14032b067:	0f 57 c0             	xorps  xmm0,xmm0
   14032b06a:	89 54 24 44          	mov    DWORD PTR [rsp+0x44],edx
   14032b06e:	0f 57 f6             	xorps  xmm6,xmm6
   14032b071:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   14032b076:	8b c2                	mov    eax,edx
   14032b078:	f2 0f 5e f8          	divsd  xmm7,xmm0
   14032b07c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032b080:	f2 0f 10 01          	movsd  xmm0,QWORD PTR [rcx]
   14032b084:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b088:	7a 0f                	jp     0x14032b099
   14032b08a:	75 0d                	jne    0x14032b099
   14032b08c:	ff c0                	inc    eax
   14032b08e:	48 83 c1 08          	add    rcx,0x8
   14032b092:	83 f8 40             	cmp    eax,0x40
   14032b095:	72 e9                	jb     0x14032b080
   14032b097:	eb 04                	jmp    0x14032b09d
   14032b099:	89 44 24 44          	mov    DWORD PTR [rsp+0x44],eax
   14032b09d:	f2 44 0f 10 25 82 50 	movsd  xmm12,QWORD PTR [rip+0x525082]        # 0x140850128
   14032b0a4:	52 00 
   14032b0a6:	45 32 c9             	xor    r9b,r9b
   14032b0a9:	f2 44 0f 10 2d de 4f 	movsd  xmm13,QWORD PTR [rip+0x524fde]        # 0x140850090
   14032b0b0:	52 00 
   14032b0b2:	45 32 e4             	xor    r12b,r12b
   14032b0b5:	f3 44 0f 10 0d 72 4f 	movss  xmm9,DWORD PTR [rip+0x524f72]        # 0x140850030
   14032b0bc:	52 00 
   14032b0be:	45 32 d2             	xor    r10b,r10b
   14032b0c1:	f3 44 0f 10 35 26 52 	movss  xmm14,DWORD PTR [rip+0x525226]        # 0x1408502f0
   14032b0c8:	52 00 
   14032b0ca:	45 0f 57 ff          	xorps  xmm15,xmm15
   14032b0ce:	44 88 54 24 41       	mov    BYTE PTR [rsp+0x41],r10b
   14032b0d3:	f2 0f 11 75 90       	movsd  QWORD PTR [rbp-0x70],xmm6
   14032b0d8:	f3 44 0f 11 7c 24 54 	movss  DWORD PTR [rsp+0x54],xmm15
   14032b0df:	44 88 4c 24 40       	mov    BYTE PTR [rsp+0x40],r9b
   14032b0e4:	41 89 55 10          	mov    DWORD PTR [r13+0x10],edx
   14032b0e8:	49 89 55 08          	mov    QWORD PTR [r13+0x8],rdx
   14032b0ec:	f3 0f 10 15 60 c0 36 	movss  xmm2,DWORD PTR [rip+0x36c060]        # 0x140697154
   14032b0f3:	00 
   14032b0f4:	f3 0f 10 8d 70 0b 00 	movss  xmm1,DWORD PTR [rbp+0xb70]
   14032b0fb:	00 
   14032b0fc:	44 88 64 24 42       	mov    BYTE PTR [rsp+0x42],r12b
   14032b101:	45 84 e4             	test   r12b,r12b
   14032b104:	74 11                	je     0x14032b117
   14032b106:	0f 28 c1             	movaps xmm0,xmm1
   14032b109:	f3 0f 59 c2          	mulss  xmm0,xmm2
   14032b10d:	44 0f 2f c0          	comiss xmm8,xmm0
   14032b111:	0f 86 8d 12 00 00    	jbe    0x14032c3a4
   14032b117:	33 d2                	xor    edx,edx
   14032b119:	48 8d 8d e0 03 00 00 	lea    rcx,[rbp+0x3e0]
   14032b120:	41 b8 60 04 00 00    	mov    r8d,0x460
   14032b126:	45 32 ff             	xor    r15b,r15b
   14032b129:	e8 bc 5b 2f 00       	call   0x140620cea
   14032b12e:	44 8b 64 24 4c       	mov    r12d,DWORD PTR [rsp+0x4c]
   14032b133:	48 8d bd 08 06 00 00 	lea    rdi,[rbp+0x608]
   14032b13a:	8b c3                	mov    eax,ebx
   14032b13c:	48 8d 74 24 60       	lea    rsi,[rsp+0x60]
   14032b141:	f7 d8                	neg    eax
   14032b143:	48 8d 9d f0 01 00 00 	lea    rbx,[rbp+0x1f0]
   14032b14a:	89 44 24 48          	mov    DWORD PTR [rsp+0x48],eax
   14032b14e:	45 33 f6             	xor    r14d,r14d
   14032b151:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032b158:	48 2b d8             	sub    rbx,rax
   14032b15b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14032b160:	45 85 f6             	test   r14d,r14d
   14032b163:	75 0b                	jne    0x14032b170
   14032b165:	41 0f 28 c8          	movaps xmm1,xmm8
   14032b169:	f3 41 0f 58 ca       	addss  xmm1,xmm10
   14032b16e:	eb 09                	jmp    0x14032b179
   14032b170:	41 0f 28 cb          	movaps xmm1,xmm11
   14032b174:	f3 41 0f 5c c8       	subss  xmm1,xmm8
   14032b179:	0f 2f 0d 24 5f 68 14 	comiss xmm1,DWORD PTR [rip+0x14685f24]        # 0x1549b10a4
   14032b180:	77 08                	ja     0x14032b18a
   14032b182:	f3 0f 10 0d 1a 5f 68 	movss  xmm1,DWORD PTR [rip+0x14685f1a]        # 0x1549b10a4
   14032b189:	14 
   14032b18a:	f3 0f 10 05 16 5f 68 	movss  xmm0,DWORD PTR [rip+0x14685f16]        # 0x1549b10a8
   14032b191:	14 
   14032b192:	0f 2f c1             	comiss xmm0,xmm1
   14032b195:	77 03                	ja     0x14032b19a
   14032b197:	0f 28 c8             	movaps xmm1,xmm0
   14032b19a:	44 8b 15 4b ee 65 00 	mov    r10d,DWORD PTR [rip+0x65ee4b]        # 0x140989fec
   14032b1a1:	45 33 c9             	xor    r9d,r9d
   14032b1a4:	4c 8b 1d 45 ee 65 00 	mov    r11,QWORD PTR [rip+0x65ee45]        # 0x140989ff0
   14032b1ab:	45 33 c0             	xor    r8d,r8d
   14032b1ae:	44 8b 6c 24 48       	mov    r13d,DWORD PTR [rsp+0x48]
   14032b1b3:	f3 0f 11 0e          	movss  DWORD PTR [rsi],xmm1
   14032b1b7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14032b1be:	00 00 
   14032b1c0:	f2 42 0f 10 a4 05 40 	movsd  xmm4,QWORD PTR [rbp+r8*1+0x840]
   14032b1c7:	08 00 00 
   14032b1ca:	66 0f 2e e6          	ucomisd xmm4,xmm6
   14032b1ce:	7a 0a                	jp     0x14032b1da
   14032b1d0:	75 08                	jne    0x14032b1da
   14032b1d2:	0f 28 d6             	movaps xmm2,xmm6
   14032b1d5:	e9 84 00 00 00       	jmp    0x14032b25e
   14032b1da:	0f 57 c0             	xorps  xmm0,xmm0
   14032b1dd:	43 8d 04 29          	lea    eax,[r9+r13*1]
   14032b1e1:	f3 0f 2a c0          	cvtsi2ss xmm0,eax
   14032b1e5:	33 c9                	xor    ecx,ecx
   14032b1e7:	41 8b c2             	mov    eax,r10d
   14032b1ea:	99                   	cdq
   14032b1eb:	2b c2                	sub    eax,edx
   14032b1ed:	d1 f8                	sar    eax,1
   14032b1ef:	0f 57 c9             	xorps  xmm1,xmm1
   14032b1f2:	0f 5a d8             	cvtps2pd xmm3,xmm0
   14032b1f5:	0f 57 c0             	xorps  xmm0,xmm0
   14032b1f8:	f3 41 0f 2a c4       	cvtsi2ss xmm0,r12d
   14032b1fd:	f3 41 0f 2a ca       	cvtsi2ss xmm1,r10d
   14032b202:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b205:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032b208:	f2 41 0f 59 d4       	mulsd  xmm2,xmm12
   14032b20d:	0f 57 c0             	xorps  xmm0,xmm0
   14032b210:	f2 0f 2a c0          	cvtsi2sd xmm0,eax
   14032b214:	f2 0f 59 da          	mulsd  xmm3,xmm2
   14032b218:	f2 41 0f 59 dd       	mulsd  xmm3,xmm13
   14032b21d:	f2 0f 5e d9          	divsd  xmm3,xmm1
   14032b221:	f2 0f 58 d8          	addsd  xmm3,xmm0
   14032b225:	f2 0f 2c c3          	cvttsd2si eax,xmm3
   14032b229:	85 c0                	test   eax,eax
   14032b22b:	0f 49 c8             	cmovns ecx,eax
   14032b22e:	41 3b ca             	cmp    ecx,r10d
   14032b231:	7c 04                	jl     0x14032b237
   14032b233:	41 8d 4a ff          	lea    ecx,[r10-0x1]
   14032b237:	0f 57 d2             	xorps  xmm2,xmm2
   14032b23a:	48 63 c1             	movsxd rax,ecx
   14032b23d:	41 0f 28 c1          	movaps xmm0,xmm9
   14032b241:	f3 41 0f 10 0c 83    	movss  xmm1,DWORD PTR [r11+rax*4]
   14032b247:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032b24b:	f3 0f 59 0e          	mulss  xmm1,DWORD PTR [rsi]
   14032b24f:	f3 0f 5a d0          	cvtss2sd xmm2,xmm0
   14032b253:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14032b256:	f2 0f 59 d4          	mulsd  xmm2,xmm4
   14032b25a:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14032b25e:	f2 42 0f 11 94 05 e0 	movsd  QWORD PTR [rbp+r8*1+0x1e0],xmm2
   14032b265:	01 00 00 
   14032b268:	41 ff c1             	inc    r9d
   14032b26b:	49 83 c0 08          	add    r8,0x8
   14032b26f:	41 83 f9 40          	cmp    r9d,0x40
   14032b273:	0f 82 47 ff ff ff    	jb     0x14032b1c0
   14032b279:	8b 4c 24 44          	mov    ecx,DWORD PTR [rsp+0x44]
   14032b27d:	33 d2                	xor    edx,edx
   14032b27f:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14032b284:	44 8b 05 1d ef 65 00 	mov    r8d,DWORD PTR [rip+0x65ef1d]        # 0x14098a1a8
   14032b28b:	f2 0f 10 84 cd e0 01 	movsd  xmm0,QWORD PTR [rbp+rcx*8+0x1e0]
   14032b292:	00 00 
   14032b294:	48 8d 8f 00 fe ff ff 	lea    rcx,[rdi-0x200]
   14032b29b:	41 8b 85 28 02 00 00 	mov    eax,DWORD PTR [r13+0x228]
   14032b2a2:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14032b2a6:	89 07                	mov    DWORD PTR [rdi],eax
   14032b2a8:	41 0f b6 85 2c 02 00 	movzx  eax,BYTE PTR [r13+0x22c]
   14032b2af:	00 
   14032b2b0:	88 47 04             	mov    BYTE PTR [rdi+0x4],al
   14032b2b3:	f3 0f 11 87 d8 fd ff 	movss  DWORD PTR [rdi-0x228],xmm0
   14032b2ba:	ff 
   14032b2bb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   14032b2c0:	f2 0f 10 54 0b f0    	movsd  xmm2,QWORD PTR [rbx+rcx*1-0x10]
   14032b2c6:	66 0f 2e d6          	ucomisd xmm2,xmm6
   14032b2ca:	7a 02                	jp     0x14032b2ce
   14032b2cc:	74 34                	je     0x14032b302
   14032b2ce:	f2 0f 10 44 0b f8    	movsd  xmm0,QWORD PTR [rbx+rcx*1-0x8]
   14032b2d4:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b2d8:	7a 02                	jp     0x14032b2dc
   14032b2da:	74 26                	je     0x14032b302
   14032b2dc:	83 fa 3f             	cmp    edx,0x3f
   14032b2df:	74 21                	je     0x14032b302
   14032b2e1:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b2e5:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   14032b2e9:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b2ed:	0f 57 c0             	xorps  xmm0,xmm0
   14032b2f0:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b2f5:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b2f8:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b2fc:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b300:	eb 03                	jmp    0x14032b305
   14032b302:	0f 28 d6             	movaps xmm2,xmm6
   14032b305:	f2 0f 11 51 f0       	movsd  QWORD PTR [rcx-0x10],xmm2
   14032b30a:	f2 0f 10 5c 0b f8    	movsd  xmm3,QWORD PTR [rbx+rcx*1-0x8]
   14032b310:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b314:	7a 02                	jp     0x14032b318
   14032b316:	74 33                	je     0x14032b34b
   14032b318:	f2 0f 10 04 0b       	movsd  xmm0,QWORD PTR [rbx+rcx*1]
   14032b31d:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b321:	7a 02                	jp     0x14032b325
   14032b323:	74 26                	je     0x14032b34b
   14032b325:	83 fa 3e             	cmp    edx,0x3e
   14032b328:	74 21                	je     0x14032b34b
   14032b32a:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b32e:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b332:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b336:	0f 57 c0             	xorps  xmm0,xmm0
   14032b339:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b33e:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b341:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b345:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b349:	eb 03                	jmp    0x14032b34e
   14032b34b:	0f 28 d6             	movaps xmm2,xmm6
   14032b34e:	f2 0f 11 51 f8       	movsd  QWORD PTR [rcx-0x8],xmm2
   14032b353:	f2 0f 10 1c 0b       	movsd  xmm3,QWORD PTR [rbx+rcx*1]
   14032b358:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b35c:	7a 02                	jp     0x14032b360
   14032b35e:	74 34                	je     0x14032b394
   14032b360:	f2 0f 10 44 0b 08    	movsd  xmm0,QWORD PTR [rbx+rcx*1+0x8]
   14032b366:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b36a:	7a 02                	jp     0x14032b36e
   14032b36c:	74 26                	je     0x14032b394
   14032b36e:	83 fa 3d             	cmp    edx,0x3d
   14032b371:	74 21                	je     0x14032b394
   14032b373:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b377:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b37b:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b37f:	0f 57 c0             	xorps  xmm0,xmm0
   14032b382:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b387:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b38a:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b38e:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b392:	eb 03                	jmp    0x14032b397
   14032b394:	0f 28 d6             	movaps xmm2,xmm6
   14032b397:	f2 0f 11 11          	movsd  QWORD PTR [rcx],xmm2
   14032b39b:	f2 0f 10 5c 0b 08    	movsd  xmm3,QWORD PTR [rbx+rcx*1+0x8]
   14032b3a1:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b3a5:	7a 02                	jp     0x14032b3a9
   14032b3a7:	74 34                	je     0x14032b3dd
   14032b3a9:	f2 0f 10 44 0b 10    	movsd  xmm0,QWORD PTR [rbx+rcx*1+0x10]
   14032b3af:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b3b3:	7a 02                	jp     0x14032b3b7
   14032b3b5:	74 26                	je     0x14032b3dd
   14032b3b7:	83 fa 3c             	cmp    edx,0x3c
   14032b3ba:	74 21                	je     0x14032b3dd
   14032b3bc:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b3c0:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b3c4:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b3c8:	0f 57 c0             	xorps  xmm0,xmm0
   14032b3cb:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b3d0:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b3d3:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b3d7:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b3db:	eb 03                	jmp    0x14032b3e0
   14032b3dd:	0f 28 d6             	movaps xmm2,xmm6
   14032b3e0:	f2 0f 11 51 08       	movsd  QWORD PTR [rcx+0x8],xmm2
   14032b3e5:	f2 0f 10 5c 0b 10    	movsd  xmm3,QWORD PTR [rbx+rcx*1+0x10]
   14032b3eb:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b3ef:	7a 02                	jp     0x14032b3f3
   14032b3f1:	74 34                	je     0x14032b427
   14032b3f3:	f2 0f 10 44 0b 18    	movsd  xmm0,QWORD PTR [rbx+rcx*1+0x18]
   14032b3f9:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b3fd:	7a 02                	jp     0x14032b401
   14032b3ff:	74 26                	je     0x14032b427
   14032b401:	83 fa 3b             	cmp    edx,0x3b
   14032b404:	74 21                	je     0x14032b427
   14032b406:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b40a:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b40e:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b412:	0f 57 c0             	xorps  xmm0,xmm0
   14032b415:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b41a:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b41d:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b421:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b425:	eb 03                	jmp    0x14032b42a
   14032b427:	0f 28 d6             	movaps xmm2,xmm6
   14032b42a:	f2 0f 11 51 10       	movsd  QWORD PTR [rcx+0x10],xmm2
   14032b42f:	f2 0f 10 5c 0b 18    	movsd  xmm3,QWORD PTR [rbx+rcx*1+0x18]
   14032b435:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b439:	7a 02                	jp     0x14032b43d
   14032b43b:	74 34                	je     0x14032b471
   14032b43d:	f2 0f 10 44 0b 20    	movsd  xmm0,QWORD PTR [rbx+rcx*1+0x20]
   14032b443:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b447:	7a 02                	jp     0x14032b44b
   14032b449:	74 26                	je     0x14032b471
   14032b44b:	83 fa 3a             	cmp    edx,0x3a
   14032b44e:	74 21                	je     0x14032b471
   14032b450:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b454:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b458:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b45c:	0f 57 c0             	xorps  xmm0,xmm0
   14032b45f:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b464:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b467:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b46b:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b46f:	eb 03                	jmp    0x14032b474
   14032b471:	0f 28 d6             	movaps xmm2,xmm6
   14032b474:	f2 0f 11 51 18       	movsd  QWORD PTR [rcx+0x18],xmm2
   14032b479:	f2 0f 10 5c 0b 20    	movsd  xmm3,QWORD PTR [rbx+rcx*1+0x20]
   14032b47f:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b483:	7a 02                	jp     0x14032b487
   14032b485:	74 34                	je     0x14032b4bb
   14032b487:	f2 0f 10 44 0b 28    	movsd  xmm0,QWORD PTR [rbx+rcx*1+0x28]
   14032b48d:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b491:	7a 02                	jp     0x14032b495
   14032b493:	74 26                	je     0x14032b4bb
   14032b495:	83 fa 39             	cmp    edx,0x39
   14032b498:	74 21                	je     0x14032b4bb
   14032b49a:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b49e:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b4a2:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b4a6:	0f 57 c0             	xorps  xmm0,xmm0
   14032b4a9:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b4ae:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b4b1:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b4b5:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b4b9:	eb 03                	jmp    0x14032b4be
   14032b4bb:	0f 28 d6             	movaps xmm2,xmm6
   14032b4be:	f2 0f 11 51 20       	movsd  QWORD PTR [rcx+0x20],xmm2
   14032b4c3:	f2 0f 10 5c 0b 28    	movsd  xmm3,QWORD PTR [rbx+rcx*1+0x28]
   14032b4c9:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b4cd:	7a 02                	jp     0x14032b4d1
   14032b4cf:	74 34                	je     0x14032b505
   14032b4d1:	f2 0f 10 44 0b 30    	movsd  xmm0,QWORD PTR [rbx+rcx*1+0x30]
   14032b4d7:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b4db:	7a 02                	jp     0x14032b4df
   14032b4dd:	74 26                	je     0x14032b505
   14032b4df:	83 fa 38             	cmp    edx,0x38
   14032b4e2:	74 21                	je     0x14032b505
   14032b4e4:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b4e8:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b4ec:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b4f0:	0f 57 c0             	xorps  xmm0,xmm0
   14032b4f3:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b4f8:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b4fb:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b4ff:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b503:	eb 03                	jmp    0x14032b508
   14032b505:	0f 28 d6             	movaps xmm2,xmm6
   14032b508:	f2 0f 11 51 28       	movsd  QWORD PTR [rcx+0x28],xmm2
   14032b50d:	83 c2 08             	add    edx,0x8
   14032b510:	48 83 c1 40          	add    rcx,0x40
   14032b514:	83 fa 40             	cmp    edx,0x40
   14032b517:	0f 82 a3 fd ff ff    	jb     0x14032b2c0
   14032b51d:	41 8b 85 18 02 00 00 	mov    eax,DWORD PTR [r13+0x218]
   14032b524:	4c 8d 8d e0 03 00 00 	lea    r9,[rbp+0x3e0]
   14032b52b:	44 8b 44 24 50       	mov    r8d,DWORD PTR [rsp+0x50]
   14032b530:	48 8b 55 80          	mov    rdx,QWORD PTR [rbp-0x80]
   14032b534:	89 47 f0             	mov    DWORD PTR [rdi-0x10],eax
   14032b537:	41 8b 85 1c 02 00 00 	mov    eax,DWORD PTR [r13+0x21c]
   14032b53e:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14032b545:	89 47 f4             	mov    DWORD PTR [rdi-0xc],eax
   14032b548:	49 63 c6             	movsxd rax,r14d
   14032b54b:	48 69 c8 30 02 00 00 	imul   rcx,rax,0x230
   14032b552:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0
   14032b557:	4c 03 c9             	add    r9,rcx
   14032b55a:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   14032b55f:	48 8b 4d 88          	mov    rcx,QWORD PTR [rbp-0x78]
   14032b563:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   14032b568:	e8 c3 02 ff ff       	call   0x14031b830
   14032b56d:	f2 0f 10 87 e0 fd ff 	movsd  xmm0,QWORD PTR [rdi-0x220]
   14032b574:	ff 
   14032b575:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b579:	7a 02                	jp     0x14032b57d
   14032b57b:	74 03                	je     0x14032b580
   14032b57d:	41 b7 01             	mov    r15b,0x1
   14032b580:	45 0f 2e c7          	ucomiss xmm8,xmm15
   14032b584:	7a 02                	jp     0x14032b588
   14032b586:	74 1f                	je     0x14032b5a7
   14032b588:	41 ff c6             	inc    r14d
   14032b58b:	48 83 c6 04          	add    rsi,0x4
   14032b58f:	48 81 c7 30 02 00 00 	add    rdi,0x230
   14032b596:	48 81 eb 30 02 00 00 	sub    rbx,0x230
   14032b59d:	41 83 fe 02          	cmp    r14d,0x2
   14032b5a1:	0f 8c b9 fb ff ff    	jl     0x14032b160
   14032b5a7:	44 0f b6 64 24 42    	movzx  r12d,BYTE PTR [rsp+0x42]
   14032b5ad:	45 84 ff             	test   r15b,r15b
   14032b5b0:	0f 84 dc 0d 00 00    	je     0x14032c392
   14032b5b6:	f2 0f 10 95 e8 03 00 	movsd  xmm2,QWORD PTR [rbp+0x3e8]
   14032b5bd:	00 
   14032b5be:	f2 0f 10 9d 18 06 00 	movsd  xmm3,QWORD PTR [rbp+0x618]
   14032b5c5:	00 
   14032b5c6:	45 84 e4             	test   r12b,r12b
   14032b5c9:	0f 85 d4 0b 00 00    	jne    0x14032c1a3
   14032b5cf:	f2 0f 10 0d a1 4a 52 	movsd  xmm1,QWORD PTR [rip+0x524aa1]        # 0x140850078
   14032b5d6:	00 
   14032b5d7:	0f 28 c2             	movaps xmm0,xmm2
   14032b5da:	f2 0f 5c c3          	subsd  xmm0,xmm3
   14032b5de:	66 0f 2f c1          	comisd xmm0,xmm1
   14032b5e2:	77 11                	ja     0x14032b5f5
   14032b5e4:	0f 28 c3             	movaps xmm0,xmm3
   14032b5e7:	f2 0f 5c c2          	subsd  xmm0,xmm2
   14032b5eb:	66 0f 2f c1          	comisd xmm0,xmm1
   14032b5ef:	0f 86 76 0b 00 00    	jbe    0x14032c16b
   14032b5f5:	b8 01 00 00 00       	mov    eax,0x1
   14032b5fa:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   14032b5ff:	66 0f 2f d3          	comisd xmm2,xmm3
   14032b603:	8b d8                	mov    ebx,eax
   14032b605:	89 44 24 58          	mov    DWORD PTR [rsp+0x58],eax
   14032b609:	0f 47 d9             	cmova  ebx,ecx
   14032b60c:	89 5c 24 5c          	mov    DWORD PTR [rsp+0x5c],ebx
   14032b610:	39 85 78 0b 00 00    	cmp    DWORD PTR [rbp+0xb78],eax
   14032b616:	0f 86 4f 0b 00 00    	jbe    0x14032c16b
   14032b61c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032b620:	66 0f 2f d3          	comisd xmm2,xmm3
   14032b624:	0f 47 c1             	cmova  eax,ecx
   14032b627:	3b c3                	cmp    eax,ebx
   14032b629:	0f 85 3c 0b 00 00    	jne    0x14032c16b
   14032b62f:	85 db                	test   ebx,ebx
   14032b631:	79 0b                	jns    0x14032b63e
   14032b633:	41 0f 28 ea          	movaps xmm5,xmm10
   14032b637:	f3 41 0f 5c e8       	subss  xmm5,xmm8
   14032b63c:	eb 09                	jmp    0x14032b647
   14032b63e:	41 0f 28 e8          	movaps xmm5,xmm8
   14032b642:	f3 41 0f 58 eb       	addss  xmm5,xmm11
   14032b647:	f3 0f 10 05 55 5a 68 	movss  xmm0,DWORD PTR [rip+0x14685a55]        # 0x1549b10a4
   14032b64e:	14 
   14032b64f:	0f 2f c5             	comiss xmm0,xmm5
   14032b652:	0f 87 13 0b 00 00    	ja     0x14032c16b
   14032b658:	0f 2f 2d 49 5a 68 14 	comiss xmm5,DWORD PTR [rip+0x14685a49]        # 0x1549b10a8
   14032b65f:	0f 87 06 0b 00 00    	ja     0x14032c16b
   14032b665:	44 8b 15 80 e9 65 00 	mov    r10d,DWORD PTR [rip+0x65e980]        # 0x140989fec
   14032b66c:	45 33 c9             	xor    r9d,r9d
   14032b66f:	4c 8b 1d 7a e9 65 00 	mov    r11,QWORD PTR [rip+0x65e97a]        # 0x140989ff0
   14032b676:	45 33 c0             	xor    r8d,r8d
   14032b679:	8b 7c 24 48          	mov    edi,DWORD PTR [rsp+0x48]
   14032b67d:	8b 5c 24 4c          	mov    ebx,DWORD PTR [rsp+0x4c]
   14032b681:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032b685:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14032b68c:	00 00 00 00 
   14032b690:	f2 42 0f 10 a4 05 40 	movsd  xmm4,QWORD PTR [rbp+r8*1+0x840]
   14032b697:	08 00 00 
   14032b69a:	66 0f 2e e6          	ucomisd xmm4,xmm6
   14032b69e:	7a 0a                	jp     0x14032b6aa
   14032b6a0:	75 08                	jne    0x14032b6aa
   14032b6a2:	0f 28 d6             	movaps xmm2,xmm6
   14032b6a5:	e9 83 00 00 00       	jmp    0x14032b72d
   14032b6aa:	0f 57 c0             	xorps  xmm0,xmm0
   14032b6ad:	42 8d 04 0f          	lea    eax,[rdi+r9*1]
   14032b6b1:	f3 0f 2a c0          	cvtsi2ss xmm0,eax
   14032b6b5:	33 c9                	xor    ecx,ecx
   14032b6b7:	41 8b c2             	mov    eax,r10d
   14032b6ba:	99                   	cdq
   14032b6bb:	2b c2                	sub    eax,edx
   14032b6bd:	d1 f8                	sar    eax,1
   14032b6bf:	0f 57 c9             	xorps  xmm1,xmm1
   14032b6c2:	0f 5a d8             	cvtps2pd xmm3,xmm0
   14032b6c5:	0f 57 c0             	xorps  xmm0,xmm0
   14032b6c8:	f3 0f 2a c3          	cvtsi2ss xmm0,ebx
   14032b6cc:	f3 41 0f 2a ca       	cvtsi2ss xmm1,r10d
   14032b6d1:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b6d4:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032b6d7:	f2 41 0f 59 d4       	mulsd  xmm2,xmm12
   14032b6dc:	0f 57 c0             	xorps  xmm0,xmm0
   14032b6df:	f2 0f 2a c0          	cvtsi2sd xmm0,eax
   14032b6e3:	f2 0f 59 da          	mulsd  xmm3,xmm2
   14032b6e7:	f2 41 0f 59 dd       	mulsd  xmm3,xmm13
   14032b6ec:	f2 0f 5e d9          	divsd  xmm3,xmm1
   14032b6f0:	f2 0f 58 d8          	addsd  xmm3,xmm0
   14032b6f4:	f2 0f 2c c3          	cvttsd2si eax,xmm3
   14032b6f8:	85 c0                	test   eax,eax
   14032b6fa:	0f 49 c8             	cmovns ecx,eax
   14032b6fd:	41 3b ca             	cmp    ecx,r10d
   14032b700:	7c 04                	jl     0x14032b706
   14032b702:	41 8d 4a ff          	lea    ecx,[r10-0x1]
   14032b706:	0f 57 d2             	xorps  xmm2,xmm2
   14032b709:	48 63 c1             	movsxd rax,ecx
   14032b70c:	41 0f 28 c1          	movaps xmm0,xmm9
   14032b710:	f3 41 0f 10 0c 83    	movss  xmm1,DWORD PTR [r11+rax*4]
   14032b716:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032b71a:	f3 0f 59 cd          	mulss  xmm1,xmm5
   14032b71e:	f3 0f 5a d0          	cvtss2sd xmm2,xmm0
   14032b722:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14032b725:	f2 0f 59 d4          	mulsd  xmm2,xmm4
   14032b729:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14032b72d:	f2 42 0f 11 94 05 e0 	movsd  QWORD PTR [rbp+r8*1+0x1e0],xmm2
   14032b734:	01 00 00 
   14032b737:	41 ff c1             	inc    r9d
   14032b73a:	49 83 c0 08          	add    r8,0x8
   14032b73e:	41 83 f9 40          	cmp    r9d,0x40
   14032b742:	0f 82 48 ff ff ff    	jb     0x14032b690
   14032b748:	8b 5c 24 5c          	mov    ebx,DWORD PTR [rsp+0x5c]
   14032b74c:	48 8d 4d b0          	lea    rcx,[rbp-0x50]
   14032b750:	33 d2                	xor    edx,edx
   14032b752:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032b758:	e8 8d 55 2f 00       	call   0x140620cea
   14032b75d:	8b 4c 24 44          	mov    ecx,DWORD PTR [rsp+0x44]
   14032b761:	33 d2                	xor    edx,edx
   14032b763:	41 8b 85 28 02 00 00 	mov    eax,DWORD PTR [r13+0x228]
   14032b76a:	44 8b 05 37 ea 65 00 	mov    r8d,DWORD PTR [rip+0x65ea37]        # 0x14098a1a8
   14032b771:	89 85 d8 01 00 00    	mov    DWORD PTR [rbp+0x1d8],eax
   14032b777:	f2 0f 10 84 cd e0 01 	movsd  xmm0,QWORD PTR [rbp+rcx*8+0x1e0]
   14032b77e:	00 00 
   14032b780:	33 c9                	xor    ecx,ecx
   14032b782:	41 0f b6 85 2c 02 00 	movzx  eax,BYTE PTR [r13+0x22c]
   14032b789:	00 
   14032b78a:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14032b78e:	88 85 dc 01 00 00    	mov    BYTE PTR [rbp+0x1dc],al
   14032b794:	f3 0f 11 45 b0       	movss  DWORD PTR [rbp-0x50],xmm0
   14032b799:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   14032b7a0:	f2 0f 10 94 0d e0 01 	movsd  xmm2,QWORD PTR [rbp+rcx*1+0x1e0]
   14032b7a7:	00 00 
   14032b7a9:	66 0f 2e d6          	ucomisd xmm2,xmm6
   14032b7ad:	7a 02                	jp     0x14032b7b1
   14032b7af:	74 37                	je     0x14032b7e8
   14032b7b1:	f2 0f 10 84 0d e8 01 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x1e8]
   14032b7b8:	00 00 
   14032b7ba:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b7be:	7a 02                	jp     0x14032b7c2
   14032b7c0:	74 26                	je     0x14032b7e8
   14032b7c2:	83 fa 3f             	cmp    edx,0x3f
   14032b7c5:	74 21                	je     0x14032b7e8
   14032b7c7:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b7cb:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   14032b7cf:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b7d3:	0f 57 c0             	xorps  xmm0,xmm0
   14032b7d6:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b7db:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b7de:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b7e2:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b7e6:	eb 03                	jmp    0x14032b7eb
   14032b7e8:	0f 28 d6             	movaps xmm2,xmm6
   14032b7eb:	f2 0f 11 54 0d c8    	movsd  QWORD PTR [rbp+rcx*1-0x38],xmm2
   14032b7f1:	f2 0f 10 9c 0d e8 01 	movsd  xmm3,QWORD PTR [rbp+rcx*1+0x1e8]
   14032b7f8:	00 00 
   14032b7fa:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b7fe:	7a 02                	jp     0x14032b802
   14032b800:	74 37                	je     0x14032b839
   14032b802:	f2 0f 10 84 0d f0 01 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x1f0]
   14032b809:	00 00 
   14032b80b:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b80f:	7a 02                	jp     0x14032b813
   14032b811:	74 26                	je     0x14032b839
   14032b813:	83 fa 3e             	cmp    edx,0x3e
   14032b816:	74 21                	je     0x14032b839
   14032b818:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b81c:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b820:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b824:	0f 57 c0             	xorps  xmm0,xmm0
   14032b827:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b82c:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b82f:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b833:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b837:	eb 03                	jmp    0x14032b83c
   14032b839:	0f 28 d6             	movaps xmm2,xmm6
   14032b83c:	f2 0f 11 54 0d d0    	movsd  QWORD PTR [rbp+rcx*1-0x30],xmm2
   14032b842:	f2 0f 10 9c 0d f0 01 	movsd  xmm3,QWORD PTR [rbp+rcx*1+0x1f0]
   14032b849:	00 00 
   14032b84b:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b84f:	7a 02                	jp     0x14032b853
   14032b851:	74 37                	je     0x14032b88a
   14032b853:	f2 0f 10 84 0d f8 01 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x1f8]
   14032b85a:	00 00 
   14032b85c:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b860:	7a 02                	jp     0x14032b864
   14032b862:	74 26                	je     0x14032b88a
   14032b864:	83 fa 3d             	cmp    edx,0x3d
   14032b867:	74 21                	je     0x14032b88a
   14032b869:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b86d:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b871:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b875:	0f 57 c0             	xorps  xmm0,xmm0
   14032b878:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b87d:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b880:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b884:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b888:	eb 03                	jmp    0x14032b88d
   14032b88a:	0f 28 d6             	movaps xmm2,xmm6
   14032b88d:	f2 0f 11 54 0d d8    	movsd  QWORD PTR [rbp+rcx*1-0x28],xmm2
   14032b893:	f2 0f 10 9c 0d f8 01 	movsd  xmm3,QWORD PTR [rbp+rcx*1+0x1f8]
   14032b89a:	00 00 
   14032b89c:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b8a0:	7a 02                	jp     0x14032b8a4
   14032b8a2:	74 37                	je     0x14032b8db
   14032b8a4:	f2 0f 10 84 0d 00 02 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x200]
   14032b8ab:	00 00 
   14032b8ad:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b8b1:	7a 02                	jp     0x14032b8b5
   14032b8b3:	74 26                	je     0x14032b8db
   14032b8b5:	83 fa 3c             	cmp    edx,0x3c
   14032b8b8:	74 21                	je     0x14032b8db
   14032b8ba:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b8be:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b8c2:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b8c6:	0f 57 c0             	xorps  xmm0,xmm0
   14032b8c9:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b8ce:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b8d1:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b8d5:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b8d9:	eb 03                	jmp    0x14032b8de
   14032b8db:	0f 28 d6             	movaps xmm2,xmm6
   14032b8de:	f2 0f 11 54 0d e0    	movsd  QWORD PTR [rbp+rcx*1-0x20],xmm2
   14032b8e4:	f2 0f 10 9c 0d 00 02 	movsd  xmm3,QWORD PTR [rbp+rcx*1+0x200]
   14032b8eb:	00 00 
   14032b8ed:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b8f1:	7a 02                	jp     0x14032b8f5
   14032b8f3:	74 37                	je     0x14032b92c
   14032b8f5:	f2 0f 10 84 0d 08 02 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x208]
   14032b8fc:	00 00 
   14032b8fe:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b902:	7a 02                	jp     0x14032b906
   14032b904:	74 26                	je     0x14032b92c
   14032b906:	83 fa 3b             	cmp    edx,0x3b
   14032b909:	74 21                	je     0x14032b92c
   14032b90b:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b90f:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b913:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b917:	0f 57 c0             	xorps  xmm0,xmm0
   14032b91a:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b91f:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b922:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b926:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b92a:	eb 03                	jmp    0x14032b92f
   14032b92c:	0f 28 d6             	movaps xmm2,xmm6
   14032b92f:	f2 0f 11 54 0d e8    	movsd  QWORD PTR [rbp+rcx*1-0x18],xmm2
   14032b935:	f2 0f 10 9c 0d 08 02 	movsd  xmm3,QWORD PTR [rbp+rcx*1+0x208]
   14032b93c:	00 00 
   14032b93e:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b942:	7a 02                	jp     0x14032b946
   14032b944:	74 37                	je     0x14032b97d
   14032b946:	f2 0f 10 84 0d 10 02 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x210]
   14032b94d:	00 00 
   14032b94f:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b953:	7a 02                	jp     0x14032b957
   14032b955:	74 26                	je     0x14032b97d
   14032b957:	83 fa 3a             	cmp    edx,0x3a
   14032b95a:	74 21                	je     0x14032b97d
   14032b95c:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b960:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b964:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b968:	0f 57 c0             	xorps  xmm0,xmm0
   14032b96b:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b970:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b973:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b977:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b97b:	eb 03                	jmp    0x14032b980
   14032b97d:	0f 28 d6             	movaps xmm2,xmm6
   14032b980:	f2 0f 11 54 0d f0    	movsd  QWORD PTR [rbp+rcx*1-0x10],xmm2
   14032b986:	f2 0f 10 9c 0d 10 02 	movsd  xmm3,QWORD PTR [rbp+rcx*1+0x210]
   14032b98d:	00 00 
   14032b98f:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b993:	7a 02                	jp     0x14032b997
   14032b995:	74 37                	je     0x14032b9ce
   14032b997:	f2 0f 10 84 0d 18 02 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x218]
   14032b99e:	00 00 
   14032b9a0:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b9a4:	7a 02                	jp     0x14032b9a8
   14032b9a6:	74 26                	je     0x14032b9ce
   14032b9a8:	83 fa 39             	cmp    edx,0x39
   14032b9ab:	74 21                	je     0x14032b9ce
   14032b9ad:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032b9b1:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032b9b5:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032b9b9:	0f 57 c0             	xorps  xmm0,xmm0
   14032b9bc:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032b9c1:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032b9c4:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032b9c8:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032b9cc:	eb 03                	jmp    0x14032b9d1
   14032b9ce:	0f 28 d6             	movaps xmm2,xmm6
   14032b9d1:	f2 0f 11 54 0d f8    	movsd  QWORD PTR [rbp+rcx*1-0x8],xmm2
   14032b9d7:	f2 0f 10 9c 0d 18 02 	movsd  xmm3,QWORD PTR [rbp+rcx*1+0x218]
   14032b9de:	00 00 
   14032b9e0:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032b9e4:	7a 02                	jp     0x14032b9e8
   14032b9e6:	74 37                	je     0x14032ba1f
   14032b9e8:	f2 0f 10 84 0d 20 02 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x220]
   14032b9ef:	00 00 
   14032b9f1:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032b9f5:	7a 02                	jp     0x14032b9f9
   14032b9f7:	74 26                	je     0x14032ba1f
   14032b9f9:	83 fa 38             	cmp    edx,0x38
   14032b9fc:	74 21                	je     0x14032ba1f
   14032b9fe:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032ba02:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032ba06:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032ba0a:	0f 57 c0             	xorps  xmm0,xmm0
   14032ba0d:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032ba12:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032ba15:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032ba19:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032ba1d:	eb 03                	jmp    0x14032ba22
   14032ba1f:	0f 28 d6             	movaps xmm2,xmm6
   14032ba22:	f2 0f 11 54 0d 00    	movsd  QWORD PTR [rbp+rcx*1+0x0],xmm2
   14032ba28:	83 c2 08             	add    edx,0x8
   14032ba2b:	48 83 c1 40          	add    rcx,0x40
   14032ba2f:	83 fa 40             	cmp    edx,0x40
   14032ba32:	0f 82 68 fd ff ff    	jb     0x14032b7a0
   14032ba38:	41 8b 85 18 02 00 00 	mov    eax,DWORD PTR [r13+0x218]
   14032ba3f:	4c 8d 4d b0          	lea    r9,[rbp-0x50]
   14032ba43:	44 8b 44 24 50       	mov    r8d,DWORD PTR [rsp+0x50]
   14032ba48:	48 8b 55 80          	mov    rdx,QWORD PTR [rbp-0x80]
   14032ba4c:	48 8b 4d 88          	mov    rcx,QWORD PTR [rbp-0x78]
   14032ba50:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14032ba57:	89 85 c8 01 00 00    	mov    DWORD PTR [rbp+0x1c8],eax
   14032ba5d:	41 8b 85 1c 02 00 00 	mov    eax,DWORD PTR [r13+0x21c]
   14032ba64:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0
   14032ba69:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   14032ba6e:	89 85 cc 01 00 00    	mov    DWORD PTR [rbp+0x1cc],eax
   14032ba74:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   14032ba79:	e8 b2 fd fe ff       	call   0x14031b830
   14032ba7e:	f2 0f 10 9d 18 06 00 	movsd  xmm3,QWORD PTR [rbp+0x618]
   14032ba85:	00 
   14032ba86:	f2 0f 10 95 e8 03 00 	movsd  xmm2,QWORD PTR [rbp+0x3e8]
   14032ba8d:	00 
   14032ba8e:	85 db                	test   ebx,ebx
   14032ba90:	79 05                	jns    0x14032ba97
   14032ba92:	0f 28 ca             	movaps xmm1,xmm2
   14032ba95:	eb 03                	jmp    0x14032ba9a
   14032ba97:	0f 28 cb             	movaps xmm1,xmm3
   14032ba9a:	f2 0f 10 45 b8       	movsd  xmm0,QWORD PTR [rbp-0x48]
   14032ba9f:	66 0f 2f c1          	comisd xmm0,xmm1
   14032baa3:	0f 86 c2 06 00 00    	jbe    0x14032c16b
   14032baa9:	48 8d 4d b0          	lea    rcx,[rbp-0x50]
   14032baad:	0f 57 e4             	xorps  xmm4,xmm4
   14032bab0:	0f 57 db             	xorps  xmm3,xmm3
   14032bab3:	0f 57 d2             	xorps  xmm2,xmm2
   14032bab6:	ba 04 00 00 00       	mov    edx,0x4
   14032babb:	f3 41 0f 5a e0       	cvtss2sd xmm4,xmm8
   14032bac0:	f3 41 0f 5a da       	cvtss2sd xmm3,xmm10
   14032bac5:	f2 0f 59 25 0b 47 52 	mulsd  xmm4,QWORD PTR [rip+0x52470b]        # 0x1408501d8
   14032bacc:	00 
   14032bacd:	f3 41 0f 5a d3       	cvtss2sd xmm2,xmm11
   14032bad2:	85 db                	test   ebx,ebx
   14032bad4:	0f 89 cd 00 00 00    	jns    0x14032bba7
   14032bada:	48 8d 85 10 06 00 00 	lea    rax,[rbp+0x610]
   14032bae1:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14032bae8:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032baeb:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032baef:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14032baf6:	0f 11 40 80          	movups XMMWORD PTR [rax-0x80],xmm0
   14032bafa:	0f 10 41 a0          	movups xmm0,XMMWORD PTR [rcx-0x60]
   14032bafe:	0f 11 48 90          	movups XMMWORD PTR [rax-0x70],xmm1
   14032bb02:	0f 10 49 b0          	movups xmm1,XMMWORD PTR [rcx-0x50]
   14032bb06:	0f 11 40 a0          	movups XMMWORD PTR [rax-0x60],xmm0
   14032bb0a:	0f 10 41 c0          	movups xmm0,XMMWORD PTR [rcx-0x40]
   14032bb0e:	0f 11 48 b0          	movups XMMWORD PTR [rax-0x50],xmm1
   14032bb12:	0f 10 49 d0          	movups xmm1,XMMWORD PTR [rcx-0x30]
   14032bb16:	0f 11 40 c0          	movups XMMWORD PTR [rax-0x40],xmm0
   14032bb1a:	0f 10 41 e0          	movups xmm0,XMMWORD PTR [rcx-0x20]
   14032bb1e:	0f 11 48 d0          	movups XMMWORD PTR [rax-0x30],xmm1
   14032bb22:	0f 10 49 f0          	movups xmm1,XMMWORD PTR [rcx-0x10]
   14032bb26:	0f 11 40 e0          	movups XMMWORD PTR [rax-0x20],xmm0
   14032bb2a:	0f 11 48 f0          	movups XMMWORD PTR [rax-0x10],xmm1
   14032bb2e:	48 83 ea 01          	sub    rdx,0x1
   14032bb32:	75 ad                	jne    0x14032bae1
   14032bb34:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032bb37:	4c 8d 5c 24 60       	lea    r11,[rsp+0x60]
   14032bb3c:	33 ff                	xor    edi,edi
   14032bb3e:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032bb42:	48 8d b5 e0 03 00 00 	lea    rsi,[rbp+0x3e0]
   14032bb49:	0f 11 00             	movups XMMWORD PTR [rax],xmm0
   14032bb4c:	4c 8d b5 08 06 00 00 	lea    r14,[rbp+0x608]
   14032bb53:	0f 10 41 20          	movups xmm0,XMMWORD PTR [rcx+0x20]
   14032bb57:	4c 8d bd 0c 06 00 00 	lea    r15,[rbp+0x60c]
   14032bb5e:	0f 11 48 10          	movups XMMWORD PTR [rax+0x10],xmm1
   14032bb62:	4c 8d a5 e0 03 00 00 	lea    r12,[rbp+0x3e0]
   14032bb69:	0f 11 40 20          	movups XMMWORD PTR [rax+0x20],xmm0
   14032bb6d:	48 8d 85 f8 05 00 00 	lea    rax,[rbp+0x5f8]
   14032bb74:	45 0f 57 d2          	xorps  xmm10,xmm10
   14032bb78:	48 89 45 98          	mov    QWORD PTR [rbp-0x68],rax
   14032bb7c:	f2 0f 5c dc          	subsd  xmm3,xmm4
   14032bb80:	45 0f 57 db          	xorps  xmm11,xmm11
   14032bb84:	f2 0f 5c d4          	subsd  xmm2,xmm4
   14032bb88:	48 8d 85 fc 05 00 00 	lea    rax,[rbp+0x5fc]
   14032bb8f:	f2 44 0f 5a d3       	cvtsd2ss xmm10,xmm3
   14032bb94:	f2 44 0f 5a da       	cvtsd2ss xmm11,xmm2
   14032bb99:	41 0f 28 c2          	movaps xmm0,xmm10
   14032bb9d:	f3 41 0f 58 c0       	addss  xmm0,xmm8
   14032bba2:	e9 d0 00 00 00       	jmp    0x14032bc77
   14032bba7:	48 8d 85 e0 03 00 00 	lea    rax,[rbp+0x3e0]
   14032bbae:	66 90                	xchg   ax,ax
   14032bbb0:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14032bbb7:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032bbba:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032bbbe:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14032bbc5:	0f 11 40 80          	movups XMMWORD PTR [rax-0x80],xmm0
   14032bbc9:	0f 10 41 a0          	movups xmm0,XMMWORD PTR [rcx-0x60]
   14032bbcd:	0f 11 48 90          	movups XMMWORD PTR [rax-0x70],xmm1
   14032bbd1:	0f 10 49 b0          	movups xmm1,XMMWORD PTR [rcx-0x50]
   14032bbd5:	0f 11 40 a0          	movups XMMWORD PTR [rax-0x60],xmm0
   14032bbd9:	0f 10 41 c0          	movups xmm0,XMMWORD PTR [rcx-0x40]
   14032bbdd:	0f 11 48 b0          	movups XMMWORD PTR [rax-0x50],xmm1
   14032bbe1:	0f 10 49 d0          	movups xmm1,XMMWORD PTR [rcx-0x30]
   14032bbe5:	0f 11 40 c0          	movups XMMWORD PTR [rax-0x40],xmm0
   14032bbe9:	0f 10 41 e0          	movups xmm0,XMMWORD PTR [rcx-0x20]
   14032bbed:	0f 11 48 d0          	movups XMMWORD PTR [rax-0x30],xmm1
   14032bbf1:	0f 10 49 f0          	movups xmm1,XMMWORD PTR [rcx-0x10]
   14032bbf5:	0f 11 40 e0          	movups XMMWORD PTR [rax-0x20],xmm0
   14032bbf9:	0f 11 48 f0          	movups XMMWORD PTR [rax-0x10],xmm1
   14032bbfd:	48 83 ea 01          	sub    rdx,0x1
   14032bc01:	75 ad                	jne    0x14032bbb0
   14032bc03:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032bc06:	4c 8d 5c 24 64       	lea    r11,[rsp+0x64]
   14032bc0b:	bf 30 02 00 00       	mov    edi,0x230
   14032bc10:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032bc14:	48 8d b5 10 06 00 00 	lea    rsi,[rbp+0x610]
   14032bc1b:	0f 11 00             	movups XMMWORD PTR [rax],xmm0
   14032bc1e:	4c 8d b5 38 08 00 00 	lea    r14,[rbp+0x838]
   14032bc25:	0f 10 41 20          	movups xmm0,XMMWORD PTR [rcx+0x20]
   14032bc29:	4c 8d bd 3c 08 00 00 	lea    r15,[rbp+0x83c]
   14032bc30:	0f 11 48 10          	movups XMMWORD PTR [rax+0x10],xmm1
   14032bc34:	4c 8d a5 10 06 00 00 	lea    r12,[rbp+0x610]
   14032bc3b:	0f 11 40 20          	movups XMMWORD PTR [rax+0x20],xmm0
   14032bc3f:	48 8d 85 28 08 00 00 	lea    rax,[rbp+0x828]
   14032bc46:	0f 28 cc             	movaps xmm1,xmm4
   14032bc49:	48 89 45 98          	mov    QWORD PTR [rbp-0x68],rax
   14032bc4d:	45 0f 57 db          	xorps  xmm11,xmm11
   14032bc51:	f2 0f 58 e2          	addsd  xmm4,xmm2
   14032bc55:	f2 0f 58 cb          	addsd  xmm1,xmm3
   14032bc59:	45 0f 57 d2          	xorps  xmm10,xmm10
   14032bc5d:	48 8d 85 2c 08 00 00 	lea    rax,[rbp+0x82c]
   14032bc64:	f2 44 0f 5a dc       	cvtsd2ss xmm11,xmm4
   14032bc69:	f2 44 0f 5a d1       	cvtsd2ss xmm10,xmm1
   14032bc6e:	41 0f 28 c3          	movaps xmm0,xmm11
   14032bc72:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   14032bc77:	f3 0f 10 0d 25 54 68 	movss  xmm1,DWORD PTR [rip+0x14685425]        # 0x1549b10a4
   14032bc7e:	14 
   14032bc7f:	0f 2f c1             	comiss xmm0,xmm1
   14032bc82:	4c 89 64 24 78       	mov    QWORD PTR [rsp+0x78],r12
   14032bc87:	48 89 45 a0          	mov    QWORD PTR [rbp-0x60],rax
   14032bc8b:	77 03                	ja     0x14032bc90
   14032bc8d:	0f 28 c1             	movaps xmm0,xmm1
   14032bc90:	f3 0f 10 0d 10 54 68 	movss  xmm1,DWORD PTR [rip+0x14685410]        # 0x1549b10a8
   14032bc97:	14 
   14032bc98:	0f 2f c8             	comiss xmm1,xmm0
   14032bc9b:	77 03                	ja     0x14032bca0
   14032bc9d:	0f 28 c1             	movaps xmm0,xmm1
   14032bca0:	44 8b 15 45 e3 65 00 	mov    r10d,DWORD PTR [rip+0x65e345]        # 0x140989fec
   14032bca7:	45 33 c9             	xor    r9d,r9d
   14032bcaa:	48 8b 1d 3f e3 65 00 	mov    rbx,QWORD PTR [rip+0x65e33f]        # 0x140989ff0
   14032bcb1:	45 33 c0             	xor    r8d,r8d
   14032bcb4:	44 8b 6c 24 48       	mov    r13d,DWORD PTR [rsp+0x48]
   14032bcb9:	44 8b 64 24 4c       	mov    r12d,DWORD PTR [rsp+0x4c]
   14032bcbe:	f3 41 0f 11 03       	movss  DWORD PTR [r11],xmm0
   14032bcc3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14032bcc7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14032bcce:	00 00 
   14032bcd0:	f2 42 0f 10 a4 05 40 	movsd  xmm4,QWORD PTR [rbp+r8*1+0x840]
   14032bcd7:	08 00 00 
   14032bcda:	66 0f 2e e6          	ucomisd xmm4,xmm6
   14032bcde:	7a 0a                	jp     0x14032bcea
   14032bce0:	75 08                	jne    0x14032bcea
   14032bce2:	0f 28 d6             	movaps xmm2,xmm6
   14032bce5:	e9 84 00 00 00       	jmp    0x14032bd6e
   14032bcea:	0f 57 c0             	xorps  xmm0,xmm0
   14032bced:	43 8d 04 29          	lea    eax,[r9+r13*1]
   14032bcf1:	f3 0f 2a c0          	cvtsi2ss xmm0,eax
   14032bcf5:	33 c9                	xor    ecx,ecx
   14032bcf7:	41 8b c2             	mov    eax,r10d
   14032bcfa:	99                   	cdq
   14032bcfb:	2b c2                	sub    eax,edx
   14032bcfd:	d1 f8                	sar    eax,1
   14032bcff:	0f 57 c9             	xorps  xmm1,xmm1
   14032bd02:	0f 5a d8             	cvtps2pd xmm3,xmm0
   14032bd05:	0f 57 c0             	xorps  xmm0,xmm0
   14032bd08:	f3 41 0f 2a c4       	cvtsi2ss xmm0,r12d
   14032bd0d:	f3 41 0f 2a ca       	cvtsi2ss xmm1,r10d
   14032bd12:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032bd15:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032bd18:	f2 41 0f 59 d4       	mulsd  xmm2,xmm12
   14032bd1d:	0f 57 c0             	xorps  xmm0,xmm0
   14032bd20:	f2 0f 2a c0          	cvtsi2sd xmm0,eax
   14032bd24:	f2 0f 59 da          	mulsd  xmm3,xmm2
   14032bd28:	f2 41 0f 59 dd       	mulsd  xmm3,xmm13
   14032bd2d:	f2 0f 5e d9          	divsd  xmm3,xmm1
   14032bd31:	f2 0f 58 d8          	addsd  xmm3,xmm0
   14032bd35:	f2 0f 2c c3          	cvttsd2si eax,xmm3
   14032bd39:	85 c0                	test   eax,eax
   14032bd3b:	0f 49 c8             	cmovns ecx,eax
   14032bd3e:	41 3b ca             	cmp    ecx,r10d
   14032bd41:	7c 04                	jl     0x14032bd47
   14032bd43:	41 8d 4a ff          	lea    ecx,[r10-0x1]
   14032bd47:	0f 57 d2             	xorps  xmm2,xmm2
   14032bd4a:	48 63 c1             	movsxd rax,ecx
   14032bd4d:	41 0f 28 c1          	movaps xmm0,xmm9
   14032bd51:	f3 0f 10 0c 83       	movss  xmm1,DWORD PTR [rbx+rax*4]
   14032bd56:	f3 0f 5c c1          	subss  xmm0,xmm1
   14032bd5a:	f3 41 0f 59 0b       	mulss  xmm1,DWORD PTR [r11]
   14032bd5f:	f3 0f 5a d0          	cvtss2sd xmm2,xmm0
   14032bd63:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14032bd66:	f2 0f 59 d4          	mulsd  xmm2,xmm4
   14032bd6a:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14032bd6e:	f2 42 0f 11 94 05 e0 	movsd  QWORD PTR [rbp+r8*1+0x1e0],xmm2
   14032bd75:	01 00 00 
   14032bd78:	41 ff c1             	inc    r9d
   14032bd7b:	49 83 c0 08          	add    r8,0x8
   14032bd7f:	41 83 f9 40          	cmp    r9d,0x40
   14032bd83:	0f 82 47 ff ff ff    	jb     0x14032bcd0
   14032bd89:	48 8b 4c 24 78       	mov    rcx,QWORD PTR [rsp+0x78]
   14032bd8e:	33 d2                	xor    edx,edx
   14032bd90:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14032bd95:	41 b8 30 02 00 00    	mov    r8d,0x230
   14032bd9b:	e8 4a 4f 2f 00       	call   0x140620cea
   14032bda0:	41 8b 85 28 02 00 00 	mov    eax,DWORD PTR [r13+0x228]
   14032bda7:	4c 8d 8d e8 01 00 00 	lea    r9,[rbp+0x1e8]
   14032bdae:	8b 4c 24 44          	mov    ecx,DWORD PTR [rsp+0x44]
   14032bdb2:	4c 8d 95 f0 01 00 00 	lea    r10,[rbp+0x1f0]
   14032bdb9:	44 8b 05 e8 e3 65 00 	mov    r8d,DWORD PTR [rip+0x65e3e8]        # 0x14098a1a8
   14032bdc0:	4c 8d 9d f8 01 00 00 	lea    r11,[rbp+0x1f8]
   14032bdc7:	41 89 06             	mov    DWORD PTR [r14],eax
   14032bdca:	48 8d 9d 00 02 00 00 	lea    rbx,[rbp+0x200]
   14032bdd1:	41 0f b6 85 2c 02 00 	movzx  eax,BYTE PTR [r13+0x22c]
   14032bdd8:	00 
   14032bdd9:	4c 8d b5 10 02 00 00 	lea    r14,[rbp+0x210]
   14032bde0:	f2 0f 10 84 cd e0 01 	movsd  xmm0,QWORD PTR [rbp+rcx*8+0x1e0]
   14032bde7:	00 00 
   14032bde9:	4c 8d ad 20 02 00 00 	lea    r13,[rbp+0x220]
   14032bdf0:	41 88 07             	mov    BYTE PTR [r15],al
   14032bdf3:	48 8d 8d 08 04 00 00 	lea    rcx,[rbp+0x408]
   14032bdfa:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be01:	33 d2                	xor    edx,edx
   14032be03:	4c 2b c8             	sub    r9,rax
   14032be06:	4c 8d bd 18 02 00 00 	lea    r15,[rbp+0x218]
   14032be0d:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be14:	48 03 cf             	add    rcx,rdi
   14032be17:	4c 2b d0             	sub    r10,rax
   14032be1a:	4c 8d a5 e0 01 00 00 	lea    r12,[rbp+0x1e0]
   14032be21:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be28:	4c 2b cf             	sub    r9,rdi
   14032be2b:	4c 2b d8             	sub    r11,rax
   14032be2e:	4c 2b d7             	sub    r10,rdi
   14032be31:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be38:	4c 2b df             	sub    r11,rdi
   14032be3b:	48 2b d8             	sub    rbx,rax
   14032be3e:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be45:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14032be49:	48 2b df             	sub    rbx,rdi
   14032be4c:	f3 0f 11 06          	movss  DWORD PTR [rsi],xmm0
   14032be50:	48 8d b5 08 02 00 00 	lea    rsi,[rbp+0x208]
   14032be57:	48 2b f0             	sub    rsi,rax
   14032be5a:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be61:	4c 2b f0             	sub    r14,rax
   14032be64:	48 2b f7             	sub    rsi,rdi
   14032be67:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be6e:	4c 2b f7             	sub    r14,rdi
   14032be71:	4c 2b f8             	sub    r15,rax
   14032be74:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be7b:	4c 2b e8             	sub    r13,rax
   14032be7e:	4c 2b ff             	sub    r15,rdi
   14032be81:	48 8d 85 08 04 00 00 	lea    rax,[rbp+0x408]
   14032be88:	4c 2b ef             	sub    r13,rdi
   14032be8b:	4c 2b e0             	sub    r12,rax
   14032be8e:	4c 2b e7             	sub    r12,rdi
   14032be91:	f2 41 0f 10 14 0c    	movsd  xmm2,QWORD PTR [r12+rcx*1]
   14032be97:	66 0f 2e d6          	ucomisd xmm2,xmm6
   14032be9b:	7a 02                	jp     0x14032be9f
   14032be9d:	74 34                	je     0x14032bed3
   14032be9f:	f2 41 0f 10 04 09    	movsd  xmm0,QWORD PTR [r9+rcx*1]
   14032bea5:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032bea9:	7a 02                	jp     0x14032bead
   14032beab:	74 26                	je     0x14032bed3
   14032bead:	83 fa 3f             	cmp    edx,0x3f
   14032beb0:	74 21                	je     0x14032bed3
   14032beb2:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032beb6:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   14032beba:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032bebe:	0f 57 c0             	xorps  xmm0,xmm0
   14032bec1:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032bec6:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032bec9:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032becd:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032bed1:	eb 03                	jmp    0x14032bed6
   14032bed3:	0f 28 d6             	movaps xmm2,xmm6
   14032bed6:	f2 0f 11 51 f0       	movsd  QWORD PTR [rcx-0x10],xmm2
   14032bedb:	f2 41 0f 10 1c 09    	movsd  xmm3,QWORD PTR [r9+rcx*1]
   14032bee1:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032bee5:	7a 02                	jp     0x14032bee9
   14032bee7:	74 34                	je     0x14032bf1d
   14032bee9:	f2 41 0f 10 04 0a    	movsd  xmm0,QWORD PTR [r10+rcx*1]
   14032beef:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032bef3:	7a 02                	jp     0x14032bef7
   14032bef5:	74 26                	je     0x14032bf1d
   14032bef7:	83 fa 3e             	cmp    edx,0x3e
   14032befa:	74 21                	je     0x14032bf1d
   14032befc:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032bf00:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032bf04:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032bf08:	0f 57 c0             	xorps  xmm0,xmm0
   14032bf0b:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032bf10:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032bf13:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032bf17:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032bf1b:	eb 03                	jmp    0x14032bf20
   14032bf1d:	0f 28 d6             	movaps xmm2,xmm6
   14032bf20:	f2 0f 11 51 f8       	movsd  QWORD PTR [rcx-0x8],xmm2
   14032bf25:	f2 41 0f 10 1c 0a    	movsd  xmm3,QWORD PTR [r10+rcx*1]
   14032bf2b:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032bf2f:	7a 02                	jp     0x14032bf33
   14032bf31:	74 34                	je     0x14032bf67
   14032bf33:	f2 41 0f 10 04 0b    	movsd  xmm0,QWORD PTR [r11+rcx*1]
   14032bf39:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032bf3d:	7a 02                	jp     0x14032bf41
   14032bf3f:	74 26                	je     0x14032bf67
   14032bf41:	83 fa 3d             	cmp    edx,0x3d
   14032bf44:	74 21                	je     0x14032bf67
   14032bf46:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032bf4a:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032bf4e:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032bf52:	0f 57 c0             	xorps  xmm0,xmm0
   14032bf55:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032bf5a:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032bf5d:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032bf61:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032bf65:	eb 03                	jmp    0x14032bf6a
   14032bf67:	0f 28 d6             	movaps xmm2,xmm6
   14032bf6a:	f2 0f 11 11          	movsd  QWORD PTR [rcx],xmm2
   14032bf6e:	f2 41 0f 10 1c 0b    	movsd  xmm3,QWORD PTR [r11+rcx*1]
   14032bf74:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032bf78:	7a 02                	jp     0x14032bf7c
   14032bf7a:	74 33                	je     0x14032bfaf
   14032bf7c:	f2 0f 10 04 0b       	movsd  xmm0,QWORD PTR [rbx+rcx*1]
   14032bf81:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032bf85:	7a 02                	jp     0x14032bf89
   14032bf87:	74 26                	je     0x14032bfaf
   14032bf89:	83 fa 3c             	cmp    edx,0x3c
   14032bf8c:	74 21                	je     0x14032bfaf
   14032bf8e:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032bf92:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032bf96:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032bf9a:	0f 57 c0             	xorps  xmm0,xmm0
   14032bf9d:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032bfa2:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032bfa5:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032bfa9:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032bfad:	eb 03                	jmp    0x14032bfb2
   14032bfaf:	0f 28 d6             	movaps xmm2,xmm6
   14032bfb2:	f2 0f 11 51 08       	movsd  QWORD PTR [rcx+0x8],xmm2
   14032bfb7:	f2 0f 10 1c 0b       	movsd  xmm3,QWORD PTR [rbx+rcx*1]
   14032bfbc:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032bfc0:	7a 02                	jp     0x14032bfc4
   14032bfc2:	74 33                	je     0x14032bff7
   14032bfc4:	f2 0f 10 04 0e       	movsd  xmm0,QWORD PTR [rsi+rcx*1]
   14032bfc9:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032bfcd:	7a 02                	jp     0x14032bfd1
   14032bfcf:	74 26                	je     0x14032bff7
   14032bfd1:	83 fa 3b             	cmp    edx,0x3b
   14032bfd4:	74 21                	je     0x14032bff7
   14032bfd6:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032bfda:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032bfde:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032bfe2:	0f 57 c0             	xorps  xmm0,xmm0
   14032bfe5:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032bfea:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032bfed:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032bff1:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032bff5:	eb 03                	jmp    0x14032bffa
   14032bff7:	0f 28 d6             	movaps xmm2,xmm6
   14032bffa:	f2 0f 11 51 10       	movsd  QWORD PTR [rcx+0x10],xmm2
   14032bfff:	f2 0f 10 1c 0e       	movsd  xmm3,QWORD PTR [rsi+rcx*1]
   14032c004:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032c008:	7a 02                	jp     0x14032c00c
   14032c00a:	74 34                	je     0x14032c040
   14032c00c:	f2 41 0f 10 04 0e    	movsd  xmm0,QWORD PTR [r14+rcx*1]
   14032c012:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032c016:	7a 02                	jp     0x14032c01a
   14032c018:	74 26                	je     0x14032c040
   14032c01a:	83 fa 3a             	cmp    edx,0x3a
   14032c01d:	74 21                	je     0x14032c040
   14032c01f:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032c023:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032c027:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032c02b:	0f 57 c0             	xorps  xmm0,xmm0
   14032c02e:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032c033:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032c036:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032c03a:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032c03e:	eb 03                	jmp    0x14032c043
   14032c040:	0f 28 d6             	movaps xmm2,xmm6
   14032c043:	f2 0f 11 51 18       	movsd  QWORD PTR [rcx+0x18],xmm2
   14032c048:	f2 41 0f 10 1c 0e    	movsd  xmm3,QWORD PTR [r14+rcx*1]
   14032c04e:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032c052:	7a 02                	jp     0x14032c056
   14032c054:	74 34                	je     0x14032c08a
   14032c056:	f2 41 0f 10 04 0f    	movsd  xmm0,QWORD PTR [r15+rcx*1]
   14032c05c:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032c060:	7a 02                	jp     0x14032c064
   14032c062:	74 26                	je     0x14032c08a
   14032c064:	83 fa 39             	cmp    edx,0x39
   14032c067:	74 21                	je     0x14032c08a
   14032c069:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032c06d:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032c071:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032c075:	0f 57 c0             	xorps  xmm0,xmm0
   14032c078:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032c07d:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032c080:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032c084:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032c088:	eb 03                	jmp    0x14032c08d
   14032c08a:	0f 28 d6             	movaps xmm2,xmm6
   14032c08d:	f2 0f 11 51 20       	movsd  QWORD PTR [rcx+0x20],xmm2
   14032c092:	f2 41 0f 10 1c 0f    	movsd  xmm3,QWORD PTR [r15+rcx*1]
   14032c098:	66 0f 2e de          	ucomisd xmm3,xmm6
   14032c09c:	7a 02                	jp     0x14032c0a0
   14032c09e:	74 34                	je     0x14032c0d4
   14032c0a0:	f2 42 0f 10 04 29    	movsd  xmm0,QWORD PTR [rcx+r13*1]
   14032c0a6:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14032c0aa:	7a 02                	jp     0x14032c0ae
   14032c0ac:	74 26                	je     0x14032c0d4
   14032c0ae:	83 fa 38             	cmp    edx,0x38
   14032c0b1:	74 21                	je     0x14032c0d4
   14032c0b3:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032c0b7:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032c0bb:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032c0bf:	0f 57 c0             	xorps  xmm0,xmm0
   14032c0c2:	f2 49 0f 2a c0       	cvtsi2sd xmm0,r8
   14032c0c7:	0f 5a d1             	cvtps2pd xmm2,xmm1
   14032c0ca:	f2 0f 59 d7          	mulsd  xmm2,xmm7
   14032c0ce:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14032c0d2:	eb 03                	jmp    0x14032c0d7
   14032c0d4:	0f 28 d6             	movaps xmm2,xmm6
   14032c0d7:	f2 0f 11 51 28       	movsd  QWORD PTR [rcx+0x28],xmm2
   14032c0dc:	83 c2 08             	add    edx,0x8
   14032c0df:	48 83 c1 40          	add    rcx,0x40
   14032c0e3:	83 fa 40             	cmp    edx,0x40
   14032c0e6:	0f 82 a5 fd ff ff    	jb     0x14032be91
   14032c0ec:	4c 8b 6c 24 70       	mov    r13,QWORD PTR [rsp+0x70]
   14032c0f1:	48 8b 4d 98          	mov    rcx,QWORD PTR [rbp-0x68]
   14032c0f5:	4c 8b 4c 24 78       	mov    r9,QWORD PTR [rsp+0x78]
   14032c0fa:	44 8b 44 24 50       	mov    r8d,DWORD PTR [rsp+0x50]
   14032c0ff:	41 8b 85 18 02 00 00 	mov    eax,DWORD PTR [r13+0x218]
   14032c106:	48 8b 55 80          	mov    rdx,QWORD PTR [rbp-0x80]
   14032c10a:	89 01                	mov    DWORD PTR [rcx],eax
   14032c10c:	48 8b 4d a0          	mov    rcx,QWORD PTR [rbp-0x60]
   14032c110:	41 8b 85 1c 02 00 00 	mov    eax,DWORD PTR [r13+0x21c]
   14032c117:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   14032c11e:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0
   14032c123:	89 01                	mov    DWORD PTR [rcx],eax
   14032c125:	48 8b 4d 88          	mov    rcx,QWORD PTR [rbp-0x78]
   14032c129:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   14032c12e:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   14032c133:	e8 f8 f6 fe ff       	call   0x14031b830
   14032c138:	8b 4c 24 58          	mov    ecx,DWORD PTR [rsp+0x58]
   14032c13c:	f2 0f 10 9d 18 06 00 	movsd  xmm3,QWORD PTR [rbp+0x618]
   14032c143:	00 
   14032c144:	ff c1                	inc    ecx
   14032c146:	f2 0f 10 95 e8 03 00 	movsd  xmm2,QWORD PTR [rbp+0x3e8]
   14032c14d:	00 
   14032c14e:	89 4c 24 58          	mov    DWORD PTR [rsp+0x58],ecx
   14032c152:	3b 8d 78 0b 00 00    	cmp    ecx,DWORD PTR [rbp+0xb78]
   14032c158:	73 11                	jae    0x14032c16b
   14032c15a:	8b 5c 24 5c          	mov    ebx,DWORD PTR [rsp+0x5c]
   14032c15e:	b9 ff ff ff ff       	mov    ecx,0xffffffff
   14032c163:	8d 41 02             	lea    eax,[rcx+0x2]
   14032c166:	e9 b5 f4 ff ff       	jmp    0x14032b620
   14032c16b:	f3 0f 10 85 20 06 00 	movss  xmm0,DWORD PTR [rbp+0x620]
   14032c172:	00 
   14032c173:	f3 0f 10 8d f0 03 00 	movss  xmm1,DWORD PTR [rbp+0x3f0]
   14032c17a:	00 
   14032c17b:	0f 2f c1             	comiss xmm0,xmm1
   14032c17e:	77 03                	ja     0x14032c183
   14032c180:	0f 28 c1             	movaps xmm0,xmm1
   14032c183:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032c186:	f3 0f 10 85 80 0b 00 	movss  xmm0,DWORD PTR [rbp+0xb80]
   14032c18d:	00 
   14032c18e:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032c191:	f2 0f 59 05 3f ca 36 	mulsd  xmm0,QWORD PTR [rip+0x36ca3f]        # 0x140698bd8
   14032c198:	00 
   14032c199:	66 0f 2f c1          	comisd xmm0,xmm1
   14032c19d:	0f 87 7b 01 00 00    	ja     0x14032c31e
   14032c1a3:	33 c0                	xor    eax,eax
   14032c1a5:	45 33 c0             	xor    r8d,r8d
   14032c1a8:	66 0f 2f da          	comisd xmm3,xmm2
   14032c1ac:	44 8d 58 01          	lea    r11d,[rax+0x1]
   14032c1b0:	76 06                	jbe    0x14032c1b8
   14032c1b2:	41 8b c3             	mov    eax,r11d
   14032c1b5:	45 8b c3             	mov    r8d,r11d
   14032c1b8:	41 0f 28 c0          	movaps xmm0,xmm8
   14032c1bc:	f3 41 0f 58 c0       	addss  xmm0,xmm8
   14032c1c1:	85 c0                	test   eax,eax
   14032c1c3:	75 19                	jne    0x14032c1de
   14032c1c5:	44 0f b6 4c 24 40    	movzx  r9d,BYTE PTR [rsp+0x40]
   14032c1cb:	44 0f 28 d8          	movaps xmm11,xmm0
   14032c1cf:	41 b2 01             	mov    r10b,0x1
   14032c1d2:	f3 45 0f 58 da       	addss  xmm11,xmm10
   14032c1d7:	44 88 54 24 41       	mov    BYTE PTR [rsp+0x41],r10b
   14032c1dc:	eb 17                	jmp    0x14032c1f5
   14032c1de:	44 0f b6 54 24 41    	movzx  r10d,BYTE PTR [rsp+0x41]
   14032c1e4:	45 0f 28 d3          	movaps xmm10,xmm11
   14032c1e8:	41 b1 01             	mov    r9b,0x1
   14032c1eb:	f3 44 0f 5c d0       	subss  xmm10,xmm0
   14032c1f0:	44 88 4c 24 40       	mov    BYTE PTR [rsp+0x40],r9b
   14032c1f5:	f3 0f 10 44 24 54    	movss  xmm0,DWORD PTR [rsp+0x54]
   14032c1fb:	49 69 c8 30 02 00 00 	imul   rcx,r8,0x230
   14032c202:	41 0f 2e c7          	ucomiss xmm0,xmm15
   14032c206:	7a 02                	jp     0x14032c20a
   14032c208:	74 4a                	je     0x14032c254
   14032c20a:	f2 0f 10 84 0d e8 03 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x3e8]
   14032c211:	00 00 
   14032c213:	66 0f 2f 45 90       	comisd xmm0,QWORD PTR [rbp-0x70]
   14032c218:	73 3a                	jae    0x14032c254
   14032c21a:	85 c0                	test   eax,eax
   14032c21c:	75 1b                	jne    0x14032c239
   14032c21e:	41 b1 01             	mov    r9b,0x1
   14032c221:	f2 0f 11 75 90       	movsd  QWORD PTR [rbp-0x70],xmm6
   14032c226:	44 88 4c 24 40       	mov    BYTE PTR [rsp+0x40],r9b
   14032c22b:	f3 45 0f 58 d0       	addss  xmm10,xmm8
   14032c230:	f3 44 0f 11 7c 24 54 	movss  DWORD PTR [rsp+0x54],xmm15
   14032c237:	eb 36                	jmp    0x14032c26f
   14032c239:	41 b2 01             	mov    r10b,0x1
   14032c23c:	f2 0f 11 75 90       	movsd  QWORD PTR [rbp-0x70],xmm6
   14032c241:	44 88 54 24 41       	mov    BYTE PTR [rsp+0x41],r10b
   14032c246:	f3 45 0f 5c d8       	subss  xmm11,xmm8
   14032c24b:	f3 44 0f 11 7c 24 54 	movss  DWORD PTR [rsp+0x54],xmm15
   14032c252:	eb 1b                	jmp    0x14032c26f
   14032c254:	f2 0f 10 84 0d e8 03 	movsd  xmm0,QWORD PTR [rbp+rcx*1+0x3e8]
   14032c25b:	00 00 
   14032c25d:	f3 42 0f 10 54 84 60 	movss  xmm2,DWORD PTR [rsp+r8*4+0x60]
   14032c264:	f2 0f 11 45 90       	movsd  QWORD PTR [rbp-0x70],xmm0
   14032c269:	f3 0f 11 54 24 54    	movss  DWORD PTR [rsp+0x54],xmm2
   14032c26f:	66 41 0f 2f 45 08    	comisd xmm0,QWORD PTR [r13+0x8]
   14032c275:	45 0f 28 c3          	movaps xmm8,xmm11
   14032c279:	f3 45 0f 5c c2       	subss  xmm8,xmm10
   14032c27e:	f3 44 0f 59 05 49 3d 	mulss  xmm8,DWORD PTR [rip+0x523d49]        # 0x14084ffd0
   14032c285:	52 00 
   14032c287:	0f 86 85 00 00 00    	jbe    0x14032c312
   14032c28d:	48 8d 95 e0 03 00 00 	lea    rdx,[rbp+0x3e0]
   14032c294:	49 8b c5             	mov    rax,r13
   14032c297:	48 03 ca             	add    rcx,rdx
   14032c29a:	ba 04 00 00 00       	mov    edx,0x4
   14032c29f:	90                   	nop
   14032c2a0:	48 8d 80 80 00 00 00 	lea    rax,[rax+0x80]
   14032c2a7:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032c2aa:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032c2ae:	48 8d 89 80 00 00 00 	lea    rcx,[rcx+0x80]
   14032c2b5:	0f 11 40 80          	movups XMMWORD PTR [rax-0x80],xmm0
   14032c2b9:	0f 10 41 a0          	movups xmm0,XMMWORD PTR [rcx-0x60]
   14032c2bd:	0f 11 48 90          	movups XMMWORD PTR [rax-0x70],xmm1
   14032c2c1:	0f 10 49 b0          	movups xmm1,XMMWORD PTR [rcx-0x50]
   14032c2c5:	0f 11 40 a0          	movups XMMWORD PTR [rax-0x60],xmm0
   14032c2c9:	0f 10 41 c0          	movups xmm0,XMMWORD PTR [rcx-0x40]
   14032c2cd:	0f 11 48 b0          	movups XMMWORD PTR [rax-0x50],xmm1
   14032c2d1:	0f 10 49 d0          	movups xmm1,XMMWORD PTR [rcx-0x30]
   14032c2d5:	0f 11 40 c0          	movups XMMWORD PTR [rax-0x40],xmm0
   14032c2d9:	0f 10 41 e0          	movups xmm0,XMMWORD PTR [rcx-0x20]
   14032c2dd:	0f 11 48 d0          	movups XMMWORD PTR [rax-0x30],xmm1
   14032c2e1:	0f 10 49 f0          	movups xmm1,XMMWORD PTR [rcx-0x10]
   14032c2e5:	0f 11 40 e0          	movups XMMWORD PTR [rax-0x20],xmm0
   14032c2e9:	0f 11 48 f0          	movups XMMWORD PTR [rax-0x10],xmm1
   14032c2ed:	48 83 ea 01          	sub    rdx,0x1
   14032c2f1:	75 ad                	jne    0x14032c2a0
   14032c2f3:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   14032c2f6:	0f 10 49 10          	movups xmm1,XMMWORD PTR [rcx+0x10]
   14032c2fa:	0f 11 00             	movups XMMWORD PTR [rax],xmm0
   14032c2fd:	0f 10 41 20          	movups xmm0,XMMWORD PTR [rcx+0x20]
   14032c301:	0f 11 48 10          	movups XMMWORD PTR [rax+0x10],xmm1
   14032c305:	0f 11 40 20          	movups XMMWORD PTR [rax+0x20],xmm0
   14032c309:	42 8b 44 84 60       	mov    eax,DWORD PTR [rsp+r8*4+0x60]
   14032c30e:	41 89 45 00          	mov    DWORD PTR [r13+0x0],eax
   14032c312:	8b 5c 24 68          	mov    ebx,DWORD PTR [rsp+0x68]
   14032c316:	41 b4 01             	mov    r12b,0x1
   14032c319:	e9 ce ed ff ff       	jmp    0x14032b0ec
   14032c31e:	41 c7 45 10 00 00 00 	mov    DWORD PTR [r13+0x10],0x0
   14032c325:	00 
   14032c326:	49 c7 45 08 00 00 00 	mov    QWORD PTR [r13+0x8],0x0
   14032c32d:	00 
   14032c32e:	33 c0                	xor    eax,eax
   14032c330:	48 8b 8d 40 0a 00 00 	mov    rcx,QWORD PTR [rbp+0xa40]
   14032c337:	48 33 cc             	xor    rcx,rsp
   14032c33a:	e8 c1 f2 2e 00       	call   0x14061b600
   14032c33f:	4c 8d 9c 24 f8 0b 00 	lea    r11,[rsp+0xbf8]
   14032c346:	00 
   14032c347:	41 0f 28 73 e8       	movaps xmm6,XMMWORD PTR [r11-0x18]
   14032c34c:	41 0f 28 7b d8       	movaps xmm7,XMMWORD PTR [r11-0x28]
   14032c351:	45 0f 28 43 c8       	movaps xmm8,XMMWORD PTR [r11-0x38]
   14032c356:	45 0f 28 4b b8       	movaps xmm9,XMMWORD PTR [r11-0x48]
   14032c35b:	45 0f 28 53 a8       	movaps xmm10,XMMWORD PTR [r11-0x58]
   14032c360:	45 0f 28 5b 98       	movaps xmm11,XMMWORD PTR [r11-0x68]
   14032c365:	45 0f 28 63 88       	movaps xmm12,XMMWORD PTR [r11-0x78]
   14032c36a:	45 0f 28 ab 78 ff ff 	movaps xmm13,XMMWORD PTR [r11-0x88]
   14032c371:	ff 
   14032c372:	45 0f 28 b3 68 ff ff 	movaps xmm14,XMMWORD PTR [r11-0x98]
   14032c379:	ff 
   14032c37a:	45 0f 28 bb 58 ff ff 	movaps xmm15,XMMWORD PTR [r11-0xa8]
   14032c381:	ff 
   14032c382:	49 8b e3             	mov    rsp,r11
   14032c385:	41 5f                	pop    r15
   14032c387:	41 5e                	pop    r14
   14032c389:	41 5d                	pop    r13
   14032c38b:	41 5c                	pop    r12
   14032c38d:	5f                   	pop    rdi
   14032c38e:	5e                   	pop    rsi
   14032c38f:	5b                   	pop    rbx
   14032c390:	5d                   	pop    rbp
   14032c391:	c3                   	ret
   14032c392:	44 0f b6 4c 24 40    	movzx  r9d,BYTE PTR [rsp+0x40]
   14032c398:	41 bb 01 00 00 00    	mov    r11d,0x1
   14032c39e:	44 0f b6 54 24 41    	movzx  r10d,BYTE PTR [rsp+0x41]
   14032c3a4:	83 bd 78 0b 00 00 02 	cmp    DWORD PTR [rbp+0xb78],0x2
   14032c3ab:	72 81                	jb     0x14032c32e
   14032c3ad:	45 84 c9             	test   r9b,r9b
   14032c3b0:	74 0c                	je     0x14032c3be
   14032c3b2:	45 84 d2             	test   r10b,r10b
   14032c3b5:	0f 85 73 ff ff ff    	jne    0x14032c32e
   14032c3bb:	45 84 c9             	test   r9b,r9b
   14032c3be:	b8 ff ff ff ff       	mov    eax,0xffffffff
   14032c3c3:	41 0f 45 c3          	cmovne eax,r11d
   14032c3c7:	e9 64 ff ff ff       	jmp    0x14032c330
   14032c3cc:	cc                   	int3
   14032c3cd:	cc                   	int3
   14032c3ce:	cc                   	int3
   14032c3cf:	cc                   	int3
   14032c3d0:	cc                   	int3
   14032c3d1:	cc                   	int3
   14032c3d2:	cc                   	int3
   14032c3d3:	cc                   	int3
   14032c3d4:	cc                   	int3
   14032c3d5:	cc                   	int3
   14032c3d6:	cc                   	int3
   14032c3d7:	cc                   	int3
   14032c3d8:	cc                   	int3
   14032c3d9:	cc                   	int3
   14032c3da:	cc                   	int3
   14032c3db:	cc                   	int3
   14032c3dc:	cc                   	int3
   14032c3dd:	cc                   	int3
   14032c3de:	cc                   	int3
   14032c3df:	cc                   	int3
