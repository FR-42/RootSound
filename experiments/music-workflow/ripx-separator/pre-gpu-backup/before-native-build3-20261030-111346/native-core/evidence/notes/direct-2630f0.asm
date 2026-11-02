
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001402630f0 <.text+0x2620f0>:
   1402630f0:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   1402630f5:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   1402630fa:	57                   	push   rdi
   1402630fb:	48 83 ec 20          	sub    rsp,0x20
   1402630ff:	48 8b f9             	mov    rdi,rcx
   140263102:	49 8b f1             	mov    rsi,r9
   140263105:	8b 0d a5 70 72 00    	mov    ecx,DWORD PTR [rip+0x7270a5]        # 0x14098a1b0
   14026310b:	44 8b ca             	mov    r9d,edx
   14026310e:	8b 54 24 58          	mov    edx,DWORD PTR [rsp+0x58]
   140263112:	85 d2                	test   edx,edx
   140263114:	0f b6 47 38          	movzx  eax,BYTE PTR [rdi+0x38]
   140263118:	0f 48 d1             	cmovs  edx,ecx
   14026311b:	44 3b c8             	cmp    r9d,eax
   14026311e:	0f 83 ba 00 00 00    	jae    0x1402631de
   140263124:	49 8d 41 02          	lea    rax,[r9+0x2]
   140263128:	48 8d 2c 40          	lea    rbp,[rax+rax*2]
   14026312c:	4c 8b 0c ef          	mov    r9,QWORD PTR [rdi+rbp*8]
   140263130:	4d 85 c9             	test   r9,r9
   140263133:	0f 84 a5 00 00 00    	je     0x1402631de
   140263139:	85 d2                	test   edx,edx
   14026313b:	48 89 5c 24 30       	mov    QWORD PTR [rsp+0x30],rbx
   140263140:	8b c2                	mov    eax,edx
   140263142:	0f 57 c0             	xorps  xmm0,xmm0
   140263145:	0f 48 c1             	cmovs  eax,ecx
   140263148:	48 98                	cdqe
   14026314a:	48 69 c8 78 ab 06 00 	imul   rcx,rax,0x6ab78
   140263151:	48 8d 05 c8 05 76 00 	lea    rax,[rip+0x7605c8]        # 0x1409c3720
   140263158:	f3 0f 10 14 01       	movss  xmm2,DWORD PTR [rcx+rax*1]
   14026315d:	33 c0                	xor    eax,eax
   14026315f:	0f 2e d0             	ucomiss xmm2,xmm0
   140263162:	7a 06                	jp     0x14026316a
   140263164:	75 04                	jne    0x14026316a
   140263166:	8b d8                	mov    ebx,eax
   140263168:	eb 1b                	jmp    0x140263185
   14026316a:	f3 0f 10 4f 10       	movss  xmm1,DWORD PTR [rdi+0x10]
   14026316f:	0f 5a c9             	cvtps2pd xmm1,xmm1
   140263172:	0f 5a c2             	cvtps2pd xmm0,xmm2
   140263175:	f2 0f 58 0d 83 af 42 	addsd  xmm1,QWORD PTR [rip+0x42af83]        # 0x14068e100
   14026317c:	00 
   14026317d:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140263181:	f2 0f 2c d9          	cvttsd2si ebx,xmm1
   140263185:	41 8b 09             	mov    ecx,DWORD PTR [r9]
   140263188:	85 db                	test   ebx,ebx
   14026318a:	0f 4e d8             	cmovle ebx,eax
   14026318d:	03 cb                	add    ecx,ebx
   14026318f:	41 89 08             	mov    DWORD PTR [r8],ecx
   140263192:	38 44 24 50          	cmp    BYTE PTR [rsp+0x50],al
   140263196:	74 3d                	je     0x1402631d5
   140263198:	48 8b cf             	mov    rcx,rdi
   14026319b:	e8 70 21 01 00       	call   0x140275310
   1402631a0:	48 8b 04 ef          	mov    rax,QWORD PTR [rdi+rbp*8]
   1402631a4:	66 0f 6e 48 04       	movd   xmm1,DWORD PTR [rax+0x4]
   1402631a9:	0f 5b c9             	cvtdq2ps xmm1,xmm1
   1402631ac:	f3 0f 59 c1          	mulss  xmm0,xmm1
   1402631b0:	f3 0f 58 05 24 ce 5e 	addss  xmm0,DWORD PTR [rip+0x5ece24]        # 0x14084ffdc
   1402631b7:	00 
   1402631b8:	f3 0f 2c c0          	cvttss2si eax,xmm0
   1402631bc:	03 c3                	add    eax,ebx
   1402631be:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   1402631c3:	89 06                	mov    DWORD PTR [rsi],eax
   1402631c5:	48 8b 6c 24 38       	mov    rbp,QWORD PTR [rsp+0x38]
   1402631ca:	48 8b 74 24 40       	mov    rsi,QWORD PTR [rsp+0x40]
   1402631cf:	48 83 c4 20          	add    rsp,0x20
   1402631d3:	5f                   	pop    rdi
   1402631d4:	c3                   	ret
   1402631d5:	48 8b 04 ef          	mov    rax,QWORD PTR [rdi+rbp*8]
   1402631d9:	8b 40 04             	mov    eax,DWORD PTR [rax+0x4]
   1402631dc:	eb de                	jmp    0x1402631bc
   1402631de:	48 8b 6c 24 38       	mov    rbp,QWORD PTR [rsp+0x38]
   1402631e3:	33 c0                	xor    eax,eax
   1402631e5:	89 06                	mov    DWORD PTR [rsi],eax
   1402631e7:	48 8b 74 24 40       	mov    rsi,QWORD PTR [rsp+0x40]
   1402631ec:	41 89 00             	mov    DWORD PTR [r8],eax
   1402631ef:	48 83 c4 20          	add    rsp,0x20
   1402631f3:	5f                   	pop    rdi
   1402631f4:	c3                   	ret
   1402631f5:	cc                   	int3
   1402631f6:	cc                   	int3
   1402631f7:	cc                   	int3
   1402631f8:	cc                   	int3
   1402631f9:	cc                   	int3
   1402631fa:	cc                   	int3
   1402631fb:	cc                   	int3
   1402631fc:	cc                   	int3
   1402631fd:	cc                   	int3
   1402631fe:	cc                   	int3
   1402631ff:	cc                   	int3
   140263200:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140263205:	57                   	push   rdi
   140263206:	48 83 ec 30          	sub    rsp,0x30
   14026320a:	8b 44 24 68          	mov    eax,DWORD PTR [rsp+0x68]
   14026320e:	49 8b f9             	mov    rdi,r9
   140263211:	85 c0                	test   eax,eax
   140263213:	4c 8d 4c 24 50       	lea    r9,[rsp+0x50]
   140263218:	49 8b d8             	mov    rbx,r8
   14026321b:	4c 8d 44 24 68       	lea    r8,[rsp+0x68]
