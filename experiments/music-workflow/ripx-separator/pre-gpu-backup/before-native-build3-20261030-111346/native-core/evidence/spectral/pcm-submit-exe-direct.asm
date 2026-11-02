
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140317ed0 <.text+0x316ed0>:
   140317ed0:	37                   	(bad)
   140317ed1:	00 f2                	add    dl,dh
   140317ed3:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140317ed6:	48 83 c4 28          	add    rsp,0x28
   140317eda:	c3                   	ret
   140317edb:	cc                   	int3
   140317edc:	cc                   	int3
   140317edd:	cc                   	int3
   140317ede:	cc                   	int3
   140317edf:	cc                   	int3
   140317ee0:	40 53                	rex push rbx
   140317ee2:	55                   	push   rbp
   140317ee3:	56                   	push   rsi
   140317ee4:	57                   	push   rdi
   140317ee5:	41 54                	push   r12
   140317ee7:	41 55                	push   r13
   140317ee9:	48 83 ec 68          	sub    rsp,0x68
   140317eed:	48 8b 05 74 a2 65 00 	mov    rax,QWORD PTR [rip+0x65a274]        # 0x140972168
   140317ef4:	48 33 c4             	xor    rax,rsp
   140317ef7:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   140317efc:	8b 05 a6 1a 62 00    	mov    eax,DWORD PTR [rip+0x621aa6]        # 0x1409399a8
   140317f02:	33 f6                	xor    esi,esi
   140317f04:	44 89 4c 24 20       	mov    DWORD PTR [rsp+0x20],r9d
   140317f09:	45 8b e8             	mov    r13d,r8d
   140317f0c:	44 8b e2             	mov    r12d,edx
   140317f0f:	48 8b d9             	mov    rbx,rcx
   140317f12:	8b fe                	mov    edi,esi
   140317f14:	85 c0                	test   eax,eax
   140317f16:	74 4f                	je     0x140317f67
   140317f18:	48 c7 c5 ff ff ff ff 	mov    rbp,0xffffffffffffffff
   140317f1f:	90                   	nop
   140317f20:	8b 8b d8 02 00 00    	mov    ecx,DWORD PTR [rbx+0x2d8]
   140317f26:	b8 04 00 00 00       	mov    eax,0x4
   140317f2b:	48 f7 e1             	mul    rcx
   140317f2e:	48 0f 40 c5          	cmovo  rax,rbp
   140317f32:	48 8b c8             	mov    rcx,rax
   140317f35:	e8 26 36 30 00       	call   0x14061b560
   140317f3a:	8b cf                	mov    ecx,edi
   140317f3c:	48 89 44 cc 28       	mov    QWORD PTR [rsp+rcx*8+0x28],rax
   140317f41:	48 85 c0             	test   rax,rax
   140317f44:	74 7c                	je     0x140317fc2
   140317f46:	44 8b 83 d8 02 00 00 	mov    r8d,DWORD PTR [rbx+0x2d8]
   140317f4d:	33 d2                	xor    edx,edx
   140317f4f:	49 c1 e0 02          	shl    r8,0x2
   140317f53:	48 8b c8             	mov    rcx,rax
   140317f56:	e8 8f 8d 30 00       	call   0x140620cea
   140317f5b:	8b 05 47 1a 62 00    	mov    eax,DWORD PTR [rip+0x621a47]        # 0x1409399a8
   140317f61:	ff c7                	inc    edi
   140317f63:	3b f8                	cmp    edi,eax
   140317f65:	72 b9                	jb     0x140317f20
   140317f67:	4c 89 74 24 60       	mov    QWORD PTR [rsp+0x60],r14
   140317f6c:	44 8b d6             	mov    r10d,esi
   140317f6f:	4c 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],r15
   140317f74:	85 c0                	test   eax,eax
   140317f76:	0f 84 9b 00 00 00    	je     0x140318017
   140317f7c:	f3 0f 10 0d 38 fb 38 	movss  xmm1,DWORD PTR [rip+0x38fb38]        # 0x1406a7abc
   140317f83:	00 
   140317f84:	f3 0f 10 15 44 f2 37 	movss  xmm2,DWORD PTR [rip+0x37f244]        # 0x1406971d0
   140317f8b:	00 
   140317f8c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140317f90:	44 8b c6             	mov    r8d,esi
   140317f93:	39 b3 d8 02 00 00    	cmp    DWORD PTR [rbx+0x2d8],esi
   140317f99:	76 70                	jbe    0x14031800b
   140317f9b:	45 8b ca             	mov    r9d,r10d
   140317f9e:	66 90                	xchg   ax,ax
   140317fa0:	66 83 3d b6 21 67 00 	cmp    WORD PTR [rip+0x6721b6],0x10        # 0x14098a15e
   140317fa7:	10 
   140317fa8:	75 1d                	jne    0x140317fc7
   140317faa:	4a 8b 84 cb 58 02 00 	mov    rax,QWORD PTR [rbx+r9*8+0x258]
   140317fb1:	00 
   140317fb2:	41 8b d0             	mov    edx,r8d
   140317fb5:	0f bf 0c 50          	movsx  ecx,WORD PTR [rax+rdx*2]
   140317fb9:	66 0f 6e c1          	movd   xmm0,ecx
   140317fbd:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140317fc0:	eb 2d                	jmp    0x140317fef
   140317fc2:	e9 f0 01 00 00       	jmp    0x1403181b7
   140317fc7:	66 83 3d 8f 21 67 00 	cmp    WORD PTR [rip+0x67218f],0x8        # 0x14098a15e
   140317fce:	08 
   140317fcf:	75 28                	jne    0x140317ff9
   140317fd1:	4a 8b 84 cb 40 02 00 	mov    rax,QWORD PTR [rbx+r9*8+0x240]
   140317fd8:	00 
   140317fd9:	41 8b d0             	mov    edx,r8d
   140317fdc:	0f b6 0c 10          	movzx  ecx,BYTE PTR [rax+rdx*1]
   140317fe0:	66 0f 6e c1          	movd   xmm0,ecx
   140317fe4:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140317fe7:	f3 0f 5c c1          	subss  xmm0,xmm1
   140317feb:	f3 0f 59 c2          	mulss  xmm0,xmm2
   140317fef:	4a 8b 44 cc 28       	mov    rax,QWORD PTR [rsp+r9*8+0x28]
   140317ff4:	f3 0f 11 04 90       	movss  DWORD PTR [rax+rdx*4],xmm0
   140317ff9:	41 ff c0             	inc    r8d
   140317ffc:	44 3b 83 d8 02 00 00 	cmp    r8d,DWORD PTR [rbx+0x2d8]
   140318003:	72 9b                	jb     0x140317fa0
   140318005:	8b 05 9d 19 62 00    	mov    eax,DWORD PTR [rip+0x62199d]        # 0x1409399a8
   14031800b:	41 ff c2             	inc    r10d
   14031800e:	44 3b d0             	cmp    r10d,eax
   140318011:	0f 82 79 ff ff ff    	jb     0x140317f90
   140318017:	44 8b b4 24 c8 00 00 	mov    r14d,DWORD PTR [rsp+0xc8]
   14031801e:	00 
   14031801f:	44 0f b6 bc 24 c0 00 	movzx  r15d,BYTE PTR [rsp+0xc0]
   140318026:	00 00 
   140318028:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14031802f:	00 
   140318030:	48 8b 8b 08 03 00 00 	mov    rcx,QWORD PTR [rbx+0x308]
   140318037:	ba ff ff ff ff       	mov    edx,0xffffffff
   14031803c:	ff 15 0e 06 37 00    	call   QWORD PTR [rip+0x37060e]        # 0x140688650
   140318042:	44 8b 83 40 03 00 00 	mov    r8d,DWORD PTR [rbx+0x340]
   140318049:	40 32 ed             	xor    bpl,bpl
   14031804c:	40 b7 01             	mov    dil,0x1
   14031804f:	8b ce                	mov    ecx,esi
   140318051:	45 85 c0             	test   r8d,r8d
   140318054:	0f 84 fd 00 00 00    	je     0x140318157
   14031805a:	48 8b 93 e8 02 00 00 	mov    rdx,QWORD PTR [rbx+0x2e8]
   140318061:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140318065:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14031806c:	00 00 00 00 
   140318070:	44 8b c9             	mov    r9d,ecx
   140318073:	4b 8d 04 89          	lea    rax,[r9+r9*4]
   140318077:	48 03 c0             	add    rax,rax
   14031807a:	48 39 34 c2          	cmp    QWORD PTR [rdx+rax*8],rsi
   14031807e:	74 07                	je     0x140318087
   140318080:	83 7c c2 08 01       	cmp    DWORD PTR [rdx+rax*8+0x8],0x1
   140318085:	74 1d                	je     0x1403180a4
   140318087:	8b 44 c2 08          	mov    eax,DWORD PTR [rdx+rax*8+0x8]
   14031808b:	83 e8 04             	sub    eax,0x4
   14031808e:	40 0f b6 ff          	movzx  edi,dil
   140318092:	83 f8 01             	cmp    eax,0x1
   140318095:	0f 47 fe             	cmova  edi,esi
   140318098:	ff c1                	inc    ecx
   14031809a:	41 3b c8             	cmp    ecx,r8d
   14031809d:	72 d1                	jb     0x140318070
   14031809f:	e9 b3 00 00 00       	jmp    0x140318157
   1403180a4:	39 35 fe 18 62 00    	cmp    DWORD PTR [rip+0x6218fe],esi        # 0x1409399a8
   1403180aa:	44 8b c6             	mov    r8d,esi
   1403180ad:	76 28                	jbe    0x1403180d7
   1403180af:	4f 8d 14 89          	lea    r10,[r9+r9*4]
   1403180b3:	48 8b 8b e8 02 00 00 	mov    rcx,QWORD PTR [rbx+0x2e8]
   1403180ba:	41 8b c0             	mov    eax,r8d
   1403180bd:	41 ff c0             	inc    r8d
   1403180c0:	4a 8d 14 50          	lea    rdx,[rax+r10*2]
   1403180c4:	48 8b 44 c4 28       	mov    rax,QWORD PTR [rsp+rax*8+0x28]
   1403180c9:	48 89 44 d1 10       	mov    QWORD PTR [rcx+rdx*8+0x10],rax
   1403180ce:	44 3b 05 d3 18 62 00 	cmp    r8d,DWORD PTR [rip+0x6218d3]        # 0x1409399a8
   1403180d5:	72 dc                	jb     0x1403180b3
   1403180d7:	48 8b 8b e8 02 00 00 	mov    rcx,QWORD PTR [rbx+0x2e8]
   1403180de:	4b 8d 14 89          	lea    rdx,[r9+r9*4]
   1403180e2:	8b 83 e0 02 00 00    	mov    eax,DWORD PTR [rbx+0x2e0]
   1403180e8:	48 03 d2             	add    rdx,rdx
   1403180eb:	40 b5 01             	mov    bpl,0x1
   1403180ee:	89 44 d1 2c          	mov    DWORD PTR [rcx+rdx*8+0x2c],eax
   1403180f2:	48 8b 83 e8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2e8]
   1403180f9:	8b 8b dc 02 00 00    	mov    ecx,DWORD PTR [rbx+0x2dc]
   1403180ff:	03                   	.byte 0x3
