
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140378120 <.text+0x377120>:
   140378120:	2a 00                	sub    al,BYTE PTR [rax]
   140378122:	48 8b 03             	mov    rax,QWORD PTR [rbx]
   140378125:	48 89 78 18          	mov    QWORD PTR [rax+0x18],rdi
   140378129:	48 8b 0b             	mov    rcx,QWORD PTR [rbx]
   14037812c:	ba 30 00 00 00       	mov    edx,0x30
   140378131:	e8 22 34 2a 00       	call   0x14061b558
   140378136:	48 89 3b             	mov    QWORD PTR [rbx],rdi
   140378139:	48 8b 7c 24 20       	mov    rdi,QWORD PTR [rsp+0x20]
   14037813e:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   140378143:	48 83 c4 28          	add    rsp,0x28
   140378147:	c3                   	ret
   140378148:	cc                   	int3
   140378149:	cc                   	int3
   14037814a:	cc                   	int3
   14037814b:	cc                   	int3
   14037814c:	cc                   	int3
   14037814d:	cc                   	int3
   14037814e:	cc                   	int3
   14037814f:	cc                   	int3
   140378150:	66 83 f9 7f          	cmp    cx,0x7f
   140378154:	77 17                	ja     0x14037816d
   140378156:	0f b7 c1             	movzx  eax,cx
   140378159:	48 8d 0d 10 e2 b8 14 	lea    rcx,[rip+0x14b8e210]        # 0x154f06370
   140378160:	48 8b 04 c1          	mov    rax,QWORD PTR [rcx+rax*8]
   140378164:	f6 40 28 20          	test   BYTE PTR [rax+0x28],0x20
   140378168:	74 03                	je     0x14037816d
   14037816a:	b0 01                	mov    al,0x1
   14037816c:	c3                   	ret
   14037816d:	32 c0                	xor    al,al
   14037816f:	c3                   	ret
   140378170:	cc                   	int3
   140378171:	cc                   	int3
   140378172:	cc                   	int3
   140378173:	cc                   	int3
   140378174:	cc                   	int3
   140378175:	cc                   	int3
   140378176:	cc                   	int3
   140378177:	cc                   	int3
   140378178:	cc                   	int3
   140378179:	cc                   	int3
   14037817a:	cc                   	int3
   14037817b:	cc                   	int3
   14037817c:	cc                   	int3
   14037817d:	cc                   	int3
   14037817e:	cc                   	int3
   14037817f:	cc                   	int3
   140378180:	66 83 f9 03          	cmp    cx,0x3
   140378184:	72 15                	jb     0x14037819b
   140378186:	66 83 f9 08          	cmp    cx,0x8
   14037818a:	76 0c                	jbe    0x140378198
   14037818c:	66 83 f9 2d          	cmp    cx,0x2d
   140378190:	76 09                	jbe    0x14037819b
   140378192:	66 83 f9 30          	cmp    cx,0x30
   140378196:	77 03                	ja     0x14037819b
   140378198:	b0 01                	mov    al,0x1
   14037819a:	c3                   	ret
   14037819b:	32 c0                	xor    al,al
   14037819d:	c3                   	ret
   14037819e:	cc                   	int3
   14037819f:	cc                   	int3
   1403781a0:	cc                   	int3
   1403781a1:	cc                   	int3
   1403781a2:	cc                   	int3
   1403781a3:	cc                   	int3
   1403781a4:	cc                   	int3
   1403781a5:	cc                   	int3
   1403781a6:	cc                   	int3
   1403781a7:	cc                   	int3
   1403781a8:	cc                   	int3
   1403781a9:	cc                   	int3
   1403781aa:	cc                   	int3
   1403781ab:	cc                   	int3
   1403781ac:	cc                   	int3
   1403781ad:	cc                   	int3
   1403781ae:	cc                   	int3
   1403781af:	cc                   	int3
   1403781b0:	85 c9                	test   ecx,ecx
   1403781b2:	78 60                	js     0x140378214
   1403781b4:	45 33 d2             	xor    r10d,r10d
   1403781b7:	48 63 c1             	movsxd rax,ecx
   1403781ba:	4c 69 c8 78 ab 06 00 	imul   r9,rax,0x6ab78
   1403781c1:	4c 8d 1d 08 24 61 00 	lea    r11,[rip+0x612408]        # 0x14098a5d0
   1403781c8:	45 8b c2             	mov    r8d,r10d
   1403781cb:	47 39 54 19 08       	cmp    DWORD PTR [r9+r11*1+0x8],r10d
   1403781d0:	76 42                	jbe    0x140378214
   1403781d2:	41 8b c0             	mov    eax,r8d
   1403781d5:	48 8d 0c c0          	lea    rcx,[rax+rax*8]
   1403781d9:	4b 8b 04 19          	mov    rax,QWORD PTR [r9+r11*1]
   1403781dd:	48 03 c9             	add    rcx,rcx
   1403781e0:	48 8b 54 c8 30       	mov    rdx,QWORD PTR [rax+rcx*8+0x30]
   1403781e5:	48 85 d2             	test   rdx,rdx
   1403781e8:	74 20                	je     0x14037820a
   1403781ea:	4c 89 52 20          	mov    QWORD PTR [rdx+0x20],r10
   1403781ee:	4c 89 52 28          	mov    QWORD PTR [rdx+0x28],r10
   1403781f2:	4c 89 52 30          	mov    QWORD PTR [rdx+0x30],r10
   1403781f6:	4c 89 52 38          	mov    QWORD PTR [rdx+0x38],r10
   1403781fa:	4c 89 52 40          	mov    QWORD PTR [rdx+0x40],r10
   1403781fe:	4c 89 52 48          	mov    QWORD PTR [rdx+0x48],r10
   140378202:	4c 89 52 50          	mov    QWORD PTR [rdx+0x50],r10
   140378206:	4c 89 52 58          	mov    QWORD PTR [rdx+0x58],r10
   14037820a:	41 ff c0             	inc    r8d
   14037820d:	47 3b 44 19 08       	cmp    r8d,DWORD PTR [r9+r11*1+0x8]
   140378212:	72 be                	jb     0x1403781d2
   140378214:	c3                   	ret
   140378215:	cc                   	int3
   140378216:	cc                   	int3
   140378217:	cc                   	int3
   140378218:	cc                   	int3
   140378219:	cc                   	int3
   14037821a:	cc                   	int3
   14037821b:	cc                   	int3
   14037821c:	cc                   	int3
   14037821d:	cc                   	int3
   14037821e:	cc                   	int3
   14037821f:	cc                   	int3
   140378220:	4c 8b dc             	mov    r11,rsp
   140378223:	53                   	push   rbx
   140378224:	41 55                	push   r13
   140378226:	48 81 ec 28 07 00 00 	sub    rsp,0x728
   14037822d:	48 8b 05 34 9f 5f 00 	mov    rax,QWORD PTR [rip+0x5f9f34]        # 0x140972168
   140378234:	48 33 c4             	xor    rax,rsp
   140378237:	48 89 84 24 70 06 00 	mov    QWORD PTR [rsp+0x670],rax
   14037823e:	00 
   14037823f:	41 0f 29 73 c8       	movaps XMMWORD PTR [r11-0x38],xmm6
   140378244:	48 8d 05 25 e1 b8 14 	lea    rax,[rip+0x14b8e125]        # 0x154f06370
   14037824b:	41 0f 29 7b b8       	movaps XMMWORD PTR [r11-0x48],xmm7
   140378250:	45 33 ed             	xor    r13d,r13d
   140378253:	45 0f 29 43 a8       	movaps XMMWORD PTR [r11-0x58],xmm8
   140378258:	48 8b d9             	mov    rbx,rcx
   14037825b:	45 0f 29 4b 98       	movaps XMMWORD PTR [r11-0x68],xmm9
   140378260:	45 0f 29 53 88       	movaps XMMWORD PTR [r11-0x78],xmm10
   140378265:	45 0f 29 9b 78 ff ff 	movaps XMMWORD PTR [r11-0x88],xmm11
   14037826c:	ff 
   14037826d:	41 8d 4d 10          	lea    ecx,[r13+0x10]
   140378271:	45 0f 29 a3 68 ff ff 	movaps XMMWORD PTR [r11-0x98],xmm12
   140378278:	ff 
   140378279:	45 0f 29 ab 58 ff ff 	movaps XMMWORD PTR [r11-0xa8],xmm13
   140378280:	ff 
   140378281:	45 0f 29 b3 48 ff ff 	movaps XMMWORD PTR [r11-0xb8],xmm14
   140378288:	ff 
   140378289:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140378290:	4c 89 28             	mov    QWORD PTR [rax],r13
   140378293:	4c 89 68 08          	mov    QWORD PTR [rax+0x8],r13
   140378297:	4c 89 68 10          	mov    QWORD PTR [rax+0x10],r13
   14037829b:	48 8d 40 40          	lea    rax,[rax+0x40]
   14037829f:	4c 89 68 d8          	mov    QWORD PTR [rax-0x28],r13
   1403782a3:	4c 89 68 e0          	mov    QWORD PTR [rax-0x20],r13
   1403782a7:	4c 89 68 e8          	mov    QWORD PTR [rax-0x18],r13
   1403782ab:	4c 89 68 f0          	mov    QWORD PTR [rax-0x10],r13
   1403782af:	4c 89 68 f8          	mov    QWORD PTR [rax-0x8],r13
   1403782b3:	48 83 e9 01          	sub    rcx,0x1
   1403782b7:	75 d7                	jne    0x140378290
   1403782b9:	b9 38 00 00 00       	mov    ecx,0x38
   1403782be:	e8 8d 33 2a 00       	call   0x14061b650
   1403782c3:	33 c9                	xor    ecx,ecx
   1403782c5:	48 89 05 a4 e0 b8 14 	mov    QWORD PTR [rip+0x14b8e0a4],rax        # 0x154f06370
   1403782cc:	48 89 08             	mov    QWORD PTR [rax],rcx
   1403782cf:	48 89 48 08          	mov    QWORD PTR [rax+0x8],rcx
   1403782d3:	48 89 48 10          	mov    QWORD PTR [rax+0x10],rcx
   1403782d7:	48 89 48 18          	mov    QWORD PTR [rax+0x18],rcx
   1403782db:	48 89 48 20          	mov    QWORD PTR [rax+0x20],rcx
   1403782df:	48 89 48 28          	mov    QWORD PTR [rax+0x28],rcx
   1403782e3:	48 89 48 30          	mov    QWORD PTR [rax+0x30],rcx
   1403782e7:	b9 0c 00 00 00       	mov    ecx,0xc
   1403782ec:	e8 6f 32 2a 00       	call   0x14061b560
   1403782f1:	48 8b 0d 78 e0 b8 14 	mov    rcx,QWORD PTR [rip+0x14b8e078]        # 0x154f06370
   1403782f8:	4c 8d 05 e9 72 33 00 	lea    r8,[rip+0x3372e9]        # 0x1406af5e8
   1403782ff:	ba 06 00 00 00       	mov    edx,0x6
   140378304:	48 89 01             	mov    QWORD PTR [rcx],rax
   140378307:	48 8b c8             	mov    rcx,rax
   14037830a:	e8 41 fd 1b 00       	call   0x140538050
   14037830f:	48 8b 05 5a e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e05a]        # 0x154f06370
   140378316:	44 88 68 08          	mov    BYTE PTR [rax+0x8],r13b
   14037831a:	48 8b 05 4f e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e04f]        # 0x154f06370
   140378321:	c6 40 09 7f          	mov    BYTE PTR [rax+0x9],0x7f
   140378325:	48 8b 05 44 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e044]        # 0x154f06370
   14037832c:	c6 40 0a 7f          	mov    BYTE PTR [rax+0xa],0x7f
   140378330:	48 8b 05 39 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e039]        # 0x154f06370
   140378337:	44 89 68 2c          	mov    DWORD PTR [rax+0x2c],r13d
   14037833b:	48 8b 05 2e e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e02e]        # 0x154f06370
   140378342:	c7 40 0c 00 00 80 40 	mov    DWORD PTR [rax+0xc],0x40800000
   140378349:	48 8b 05 20 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e020]        # 0x154f06370
   140378350:	44 89 68 10          	mov    DWORD PTR [rax+0x10],r13d
   140378354:	48 8b 05 15 e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e015]        # 0x154f06370
   14037835b:	44 89 68 14          	mov    DWORD PTR [rax+0x14],r13d
   14037835f:	48 8b 05 0a e0 b8 14 	mov    rax,QWORD PTR [rip+0x14b8e00a]        # 0x154f06370
   140378366:	44 89 68 18          	mov    DWORD PTR [rax+0x18],r13d
   14037836a:	48 8b 05 ff df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfff]        # 0x154f06370
   140378371:	c7 40 1c 00 00 40 40 	mov    DWORD PTR [rax+0x1c],0x40400000
   140378378:	48 8b 05 f1 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dff1]        # 0x154f06370
   14037837f:	c7 40 20 00 00 80 40 	mov    DWORD PTR [rax+0x20],0x40800000
   140378386:	48 8b 05 e3 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfe3]        # 0x154f06370
   14037838d:	c7 40 30 00 00 00 41 	mov    DWORD PTR [rax+0x30],0x41000000
   140378394:	48 8b 05 d5 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfd5]        # 0x154f06370
   14037839b:	c7 40 24 00 00 80 3f 	mov    DWORD PTR [rax+0x24],0x3f800000
   1403783a2:	48 8b 05 c7 df b8 14 	mov    rax,QWORD PTR [rip+0x14b8dfc7]        # 0x154f06370
   1403783a9:	44 89 68 28          	mov    DWORD PTR [rax+0x28],r13d
   1403783ad:	48 8b 0d cc df b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dfcc]        # 0x154f06380
   1403783b4:	48 85 c9             	test   rcx,rcx
   1403783b7:	74 28                	je     0x1403783e1
   1403783b9:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403783bc:	48 85 c0             	test   rax,rax
   1403783bf:	74 0f                	je     0x1403783d0
   1403783c1:	48 8b c8             	mov    rcx,rax
   1403783c4:	e8 8f 31 2a 00       	call   0x14061b558
   1403783c9:	48 8b 0d b0 df b8 14 	mov    rcx,QWORD PTR [rip+0x14b8dfb0]        # 0x154f06380
