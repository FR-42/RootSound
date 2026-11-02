
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140343da0 <.text+0x342da0>:
   140343da0:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   140343da5:	57                   	push   rdi
   140343da6:	41 56                	push   r14
   140343da8:	41 57                	push   r15
   140343daa:	48 83 ec 20          	sub    rsp,0x20
   140343dae:	41 8b 40 2c          	mov    eax,DWORD PTR [r8+0x2c]
   140343db2:	33 f6                	xor    esi,esi
   140343db4:	89 42 0c             	mov    DWORD PTR [rdx+0xc],eax
   140343db7:	4d 8b f8             	mov    r15,r8
   140343dba:	41 8b 40 30          	mov    eax,DWORD PTR [r8+0x30]
   140343dbe:	48 8b fa             	mov    rdi,rdx
   140343dc1:	89 42 10             	mov    DWORD PTR [rdx+0x10],eax
   140343dc4:	4c 8b f1             	mov    r14,rcx
   140343dc7:	41 8b 40 34          	mov    eax,DWORD PTR [r8+0x34]
   140343dcb:	89 42 14             	mov    DWORD PTR [rdx+0x14],eax
   140343dce:	41 8b 40 38          	mov    eax,DWORD PTR [r8+0x38]
   140343dd2:	89 02                	mov    DWORD PTR [rdx],eax
   140343dd4:	41 8b 40 3c          	mov    eax,DWORD PTR [r8+0x3c]
   140343dd8:	89 42 04             	mov    DWORD PTR [rdx+0x4],eax
   140343ddb:	41 8b 40 40          	mov    eax,DWORD PTR [r8+0x40]
   140343ddf:	89 42 08             	mov    DWORD PTR [rdx+0x8],eax
   140343de2:	39 35 c0 5b 5f 00    	cmp    DWORD PTR [rip+0x5f5bc0],esi        # 0x1409399a8
   140343de8:	48 89 5c 24 40       	mov    QWORD PTR [rsp+0x40],rbx
   140343ded:	48 89 6c 24 48       	mov    QWORD PTR [rsp+0x48],rbp
   140343df2:	8b ee                	mov    ebp,esi
   140343df4:	76 3b                	jbe    0x140343e31
   140343df6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140343dfd:	00 00 00 
   140343e00:	45 8b 46 20          	mov    r8d,DWORD PTR [r14+0x20]
   140343e04:	8b dd                	mov    ebx,ebp
   140343e06:	49 c1 e0 02          	shl    r8,0x2
   140343e0a:	49 8b 54 df 10       	mov    rdx,QWORD PTR [r15+rbx*8+0x10]
   140343e0f:	48 8d 0c db          	lea    rcx,[rbx+rbx*8]
   140343e13:	48 8b 4c cf 18       	mov    rcx,QWORD PTR [rdi+rcx*8+0x18]
   140343e18:	e8 c7 ce 2d 00       	call   0x140620ce4
   140343e1d:	49 8b 4c df 10       	mov    rcx,QWORD PTR [r15+rbx*8+0x10]
   140343e22:	e8 31 77 2d 00       	call   0x14061b558
   140343e27:	ff c5                	inc    ebp
   140343e29:	3b 2d 79 5b 5f 00    	cmp    ebp,DWORD PTR [rip+0x5f5b79]        # 0x1409399a8
   140343e2f:	72 cf                	jb     0x140343e00
   140343e31:	48 8b d7             	mov    rdx,rdi
   140343e34:	49 8b ce             	mov    rcx,r14
   140343e37:	e8 a4 7f fd ff       	call   0x14031bde0
   140343e3c:	44 8b 87 60 05 00 00 	mov    r8d,DWORD PTR [rdi+0x560]
   140343e43:	33 d2                	xor    edx,edx
   140343e45:	48 8b 8f 58 05 00 00 	mov    rcx,QWORD PTR [rdi+0x558]
   140343e4c:	89 b7 48 05 00 00    	mov    DWORD PTR [rdi+0x548],esi
   140343e52:	e8 93 ce 2d 00       	call   0x140620cea
   140343e57:	44 8b 87 78 05 00 00 	mov    r8d,DWORD PTR [rdi+0x578]
   140343e5e:	33 d2                	xor    edx,edx
   140343e60:	48 8b 8f 70 05 00 00 	mov    rcx,QWORD PTR [rdi+0x570]
   140343e67:	e8 7e ce 2d 00       	call   0x140620cea
   140343e6c:	48 89 b7 80 05 00 00 	mov    QWORD PTR [rdi+0x580],rsi
   140343e73:	33 d2                	xor    edx,edx
   140343e75:	41 8b 46 24          	mov    eax,DWORD PTR [r14+0x24]
   140343e79:	8b ee                	mov    ebp,esi
   140343e7b:	41 03 46 28          	add    eax,DWORD PTR [r14+0x28]
   140343e7f:	f7 35 cb 61 64 00    	div    DWORD PTR [rip+0x6461cb]        # 0x14098a050
   140343e85:	39 35 1d 5b 5f 00    	cmp    DWORD PTR [rip+0x5f5b1d],esi        # 0x1409399a8
   140343e8b:	44 8b d0             	mov    r10d,eax
   140343e8e:	76 66                	jbe    0x140343ef6
   140343e90:	4c 8b de             	mov    r11,rsi
   140343e93:	bb 03 00 00 00       	mov    ebx,0x3
   140343e98:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140343e9f:	00 
   140343ea0:	44 8b 05 65 61 64 00 	mov    r8d,DWORD PTR [rip+0x646165]        # 0x14098a00c
   140343ea7:	41 f7 d8             	neg    r8d
   140343eaa:	45 3b c2             	cmp    r8d,r10d
   140343ead:	7d 34                	jge    0x140343ee3
   140343eaf:	44 8b cd             	mov    r9d,ebp
   140343eb2:	4b 8d 04 4b          	lea    rax,[r11+r9*2]
   140343eb6:	4c 03 c8             	add    r9,rax
   140343eb9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140343ec0:	8b 0d 46 61 64 00    	mov    ecx,DWORD PTR [rip+0x646146]        # 0x14098a00c
   140343ec6:	4a 8b 84 cf c0 05 00 	mov    rax,QWORD PTR [rdi+r9*8+0x5c0]
   140343ecd:	00 
   140343ece:	41 03 c8             	add    ecx,r8d
   140343ed1:	48 63 d1             	movsxd rdx,ecx
   140343ed4:	41 ff c0             	inc    r8d
   140343ed7:	48 03 d2             	add    rdx,rdx
   140343eda:	89 74 d0 08          	mov    DWORD PTR [rax+rdx*8+0x8],esi
   140343ede:	45 3b c2             	cmp    r8d,r10d
   140343ee1:	7c dd                	jl     0x140343ec0
   140343ee3:	49 ff c3             	inc    r11
   140343ee6:	48 83 eb 01          	sub    rbx,0x1
   140343eea:	75 b4                	jne    0x140343ea0
   140343eec:	ff c5                	inc    ebp
   140343eee:	3b 2d b4 5a 5f 00    	cmp    ebp,DWORD PTR [rip+0x5f5ab4]        # 0x1409399a8
   140343ef4:	72 9a                	jb     0x140343e90
   140343ef6:	48 8b d7             	mov    rdx,rdi
   140343ef9:	49 8b ce             	mov    rcx,r14
   140343efc:	e8 1f a9 fe ff       	call   0x14032e820
   140343f01:	45 8b 86 bc 00 00 00 	mov    r8d,DWORD PTR [r14+0xbc]
   140343f08:	33 d2                	xor    edx,edx
   140343f0a:	45 03 46 24          	add    r8d,DWORD PTR [r14+0x24]
   140343f0e:	48 8b 8f 90 05 00 00 	mov    rcx,QWORD PTR [rdi+0x590]
   140343f15:	4d 03 c0             	add    r8,r8
   140343f18:	e8 cd cd 2d 00       	call   0x140620cea
   140343f1d:	45 8b 86 bc 00 00 00 	mov    r8d,DWORD PTR [r14+0xbc]
   140343f24:	33 d2                	xor    edx,edx
   140343f26:	45 03 46 24          	add    r8d,DWORD PTR [r14+0x24]
   140343f2a:	44 03 05 b3 60 64 00 	add    r8d,DWORD PTR [rip+0x6460b3]        # 0x140989fe4
   140343f31:	48 8b 8f a0 05 00 00 	mov    rcx,QWORD PTR [rdi+0x5a0]
   140343f38:	4d 03 c0             	add    r8,r8
   140343f3b:	e8 aa cd 2d 00       	call   0x140620cea
   140343f40:	45 8b 86 bc 00 00 00 	mov    r8d,DWORD PTR [r14+0xbc]
   140343f47:	33 d2                	xor    edx,edx
   140343f49:	45 03 46 24          	add    r8d,DWORD PTR [r14+0x24]
   140343f4d:	48 8b 8f b0 05 00 00 	mov    rcx,QWORD PTR [rdi+0x5b0]
   140343f54:	4d 03 c0             	add    r8,r8
   140343f57:	e8 8e cd 2d 00       	call   0x140620cea
   140343f5c:	45 8b 46 24          	mov    r8d,DWORD PTR [r14+0x24]
   140343f60:	33 d2                	xor    edx,edx
   140343f62:	45 03 46 28          	add    r8d,DWORD PTR [r14+0x28]
   140343f66:	48 8b 8f 20 06 00 00 	mov    rcx,QWORD PTR [rdi+0x620]
   140343f6d:	49 c1 e0 02          	shl    r8,0x2
   140343f71:	e8 74 cd 2d 00       	call   0x140620cea
   140343f76:	41 8b 46 24          	mov    eax,DWORD PTR [r14+0x24]
   140343f7a:	48 8b 6c 24 48       	mov    rbp,QWORD PTR [rsp+0x48]
   140343f7f:	48 8b 5c 24 40       	mov    rbx,QWORD PTR [rsp+0x40]
   140343f84:	41 03 46 28          	add    eax,DWORD PTR [r14+0x28]
   140343f88:	74 2e                	je     0x140343fb8
   140343f8a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140343f90:	48 8b 8f 28 06 00 00 	mov    rcx,QWORD PTR [rdi+0x628]
   140343f97:	33 d2                	xor    edx,edx
   140343f99:	8b c6                	mov    eax,esi
   140343f9b:	41 b8 00 d0 11 00    	mov    r8d,0x11d000
   140343fa1:	48 8b 0c c1          	mov    rcx,QWORD PTR [rcx+rax*8]
   140343fa5:	e8 40 cd 2d 00       	call   0x140620cea
   140343faa:	41 8b 46 24          	mov    eax,DWORD PTR [r14+0x24]
   140343fae:	ff c6                	inc    esi
   140343fb0:	41 03 46 28          	add    eax,DWORD PTR [r14+0x28]
   140343fb4:	3b f0                	cmp    esi,eax
   140343fb6:	72 d8                	jb     0x140343f90
   140343fb8:	41 0f b6 47 44       	movzx  eax,BYTE PTR [r15+0x44]
   140343fbd:	48 8b 74 24 50       	mov    rsi,QWORD PTR [rsp+0x50]
   140343fc2:	88 87 bc 05 00 00    	mov    BYTE PTR [rdi+0x5bc],al
   140343fc8:	41 8b 86 a0 00 00 00 	mov    eax,DWORD PTR [r14+0xa0]
   140343fcf:	89 87 28 87 04 00    	mov    DWORD PTR [rdi+0x48728],eax
   140343fd5:	41 8b 86 a4 00 00 00 	mov    eax,DWORD PTR [r14+0xa4]
   140343fdc:	89 87 2c 87 04 00    	mov    DWORD PTR [rdi+0x4872c],eax
   140343fe2:	41 8b 86 a8 00 00 00 	mov    eax,DWORD PTR [r14+0xa8]
   140343fe9:	89 87 30 87 04 00    	mov    DWORD PTR [rdi+0x48730],eax
   140343fef:	b0 01                	mov    al,0x1
   140343ff1:	48 83 c4 20          	add    rsp,0x20
   140343ff5:	41 5f                	pop    r15
   140343ff7:	41 5e                	pop    r14
   140343ff9:	5f                   	pop    rdi
   140343ffa:	c3                   	ret
   140343ffb:	cc                   	int3
   140343ffc:	cc                   	int3
   140343ffd:	cc                   	int3
   140343ffe:	cc                   	int3
   140343fff:	cc                   	int3
   140344000:	cc                   	int3
   140344001:	cc                   	int3
   140344002:	cc                   	int3
   140344003:	cc                   	int3
   140344004:	cc                   	int3
   140344005:	cc                   	int3
   140344006:	cc                   	int3
   140344007:	cc                   	int3
   140344008:	cc                   	int3
   140344009:	cc                   	int3
   14034400a:	cc                   	int3
   14034400b:	cc                   	int3
   14034400c:	cc                   	int3
   14034400d:	cc                   	int3
   14034400e:	cc                   	int3
   14034400f:	cc                   	int3
   140344010:	40 53                	rex push rbx
   140344012:	56                   	push   rsi
   140344013:	41 56                	push   r14
   140344015:	48 83 ec 30          	sub    rsp,0x30
   140344019:	4c 8b f1             	mov    r14,rcx
   14034401c:	48 89 6c 24 50       	mov    QWORD PTR [rsp+0x50],rbp
   140344021:	48 8b 8a 98 05 00 00 	mov    rcx,QWORD PTR [rdx+0x598]
   140344028:	48 8b f2             	mov    rsi,rdx
   14034402b:	4c 89 6c 24 28       	mov    QWORD PTR [rsp+0x28],r13
   140344030:	e8 23 75 2d 00       	call   0x14061b558
   140344035:	48 8b 8e a0 05 00 00 	mov    rcx,QWORD PTR [rsi+0x5a0]
   14034403c:	e8 17 75 2d 00       	call   0x14061b558
   140344041:	48 8b 8e 20 06 00 00 	mov    rcx,QWORD PTR [rsi+0x620]
   140344048:	e8 0b 75 2d 00       	call   0x14061b558
   14034404d:	41 8b 46 24          	mov    eax,DWORD PTR [r14+0x24]
   140344051:	33 ed                	xor    ebp,ebp
   140344053:	8b dd                	mov    ebx,ebp
   140344055:	41 03 46 28          	add    eax,DWORD PTR [r14+0x28]
   140344059:	74 25                	je     0x140344080
   14034405b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140344060:	48 8b 8e 28 06 00 00 	mov    rcx,QWORD PTR [rsi+0x628]
   140344067:	8b c3                	mov    eax,ebx
   140344069:	48 8b 0c c1          	mov    rcx,QWORD PTR [rcx+rax*8]
   14034406d:	e8 e6 74 2d 00       	call   0x14061b558
   140344072:	41 8b 46 24          	mov    eax,DWORD PTR [r14+0x24]
   140344076:	ff c3                	inc    ebx
   140344078:	41 03 46 28          	add    eax,DWORD PTR [r14+0x28]
   14034407c:	3b d8                	cmp    ebx,eax
   14034407e:	72 e0                	jb     0x140344060
   140344080:	48 8b 8e 28 06 00 00 	mov    rcx,QWORD PTR [rsi+0x628]
   140344087:	e8 cc 74 2d 00       	call   0x14061b558
   14034408c:	48 8b 8e 50 06 00 00 	mov    rcx,QWORD PTR [rsi+0x650]
   140344093:	e8 c0 74 2d 00       	call   0x14061b558
   140344098:	48 8b 8e 58 06 00 00 	mov    rcx,QWORD PTR [rsi+0x658]
   14034409f:	e8 b4 74 2d 00       	call   0x14061b558
   1403440a4:	48 8b 8e 38 06 00 00 	mov    rcx,QWORD PTR [rsi+0x638]
   1403440ab:	48 85 c9             	test   rcx,rcx
   1403440ae:	74 58                	je     0x140344108
   1403440b0:	48 8b 41 08          	mov    rax,QWORD PTR [rcx+0x8]
   1403440b4:	48 85 c0             	test   rax,rax
   1403440b7:	74 0f                	je     0x1403440c8
   1403440b9:	48 8b c8             	mov    rcx,rax
   1403440bc:	e8 97 74 2d 00       	call   0x14061b558
   1403440c1:	48 8b 8e 38 06 00 00 	mov    rcx,QWORD PTR [rsi+0x638]
   1403440c8:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   1403440cb:	48 85 c0             	test   rax,rax
   1403440ce:	74 0f                	je     0x1403440df
   1403440d0:	48 8b c8             	mov    rcx,rax
   1403440d3:	e8 80 74 2d 00       	call   0x14061b558
   1403440d8:	48 8b 8e 38 06 00 00 	mov    rcx,QWORD PTR [rsi+0x638]
   1403440df:	48 8b 41 10          	mov    rax,QWORD PTR [rcx+0x10]
   1403440e3:	48 85 c0             	test   rax,rax
   1403440e6:	74 0f                	je     0x1403440f7
   1403440e8:	48 8b c8             	mov    rcx,rax
   1403440eb:	e8 68 74 2d 00       	call   0x14061b558
   1403440f0:	48 8b 8e 38 06 00 00 	mov    rcx,QWORD PTR [rsi+0x638]
   1403440f7:	ba 18 00 00 00       	mov    edx,0x18
   1403440fc:	e8 57 74 2d 00       	call   0x14061b558
   140344101:	48 89 ae 38 06 00 00 	mov    QWORD PTR [rsi+0x638],rbp
   140344108:	39 2d 9a 58 5f 00    	cmp    DWORD PTR [rip+0x5f589a],ebp        # 0x1409399a8
   14034410e:	44 8b ed             	mov    r13d,ebp
   140344111:	48 89 7c 24 58       	mov    QWORD PTR [rsp+0x58],rdi
   140344116:	0f 86 e1 00 00 00    	jbe    0x1403441fd
   14034411c:	4c 89 64 24 60       	mov    QWORD PTR [rsp+0x60],r12
   140344121:	4c 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],r15
   140344126:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14034412d:	00 00 00 
   140344130:	45 8b fd             	mov    r15d,r13d
   140344133:	ba 04 00 00 00       	mov    edx,0x4
   140344138:	4b 8d 04 ff          	lea    rax,[r15+r15*8]
   14034413c:	48 8d 1c c5 00 00 00 	lea    rbx,[rax*8+0x0]
   140344143:	00 
   140344144:	48 8b 4c 33 18       	mov    rcx,QWORD PTR [rbx+rsi*1+0x18]
   140344149:	e8 0a 74 2d 00       	call   0x14061b558
   14034414e:	48 8b 8c 33 f0 00 00 	mov    rcx,QWORD PTR [rbx+rsi*1+0xf0]
   140344155:	00 
   140344156:	ba 04 00 00 00       	mov    edx,0x4
   14034415b:	e8 f8 73 2d 00       	call   0x14061b558
   140344160:	41 8b 86 c0 00 00 00 	mov    eax,DWORD PTR [r14+0xc0]
   140344167:	8b fd                	mov    edi,ebp
   140344169:	85 c0                	test   eax,eax
   14034416b:	74 3f                	je     0x1403441ac
   14034416d:	4f 8d 24 ff          	lea    r12,[r15+r15*8]
   140344171:	ff c7                	inc    edi
   140344173:	ba 04 00 00 00       	mov    edx,0x4
   140344178:	8b c7                	mov    eax,edi
   14034417a:	49 03 c4             	add    rax,r12
   14034417d:	48 8d 1c c5 00 00 00 	lea    rbx,[rax*8+0x0]
   140344184:	00 
   140344185:	48 8b 4c 33 18       	mov    rcx,QWORD PTR [rbx+rsi*1+0x18]
   14034418a:	e8 c9 73 2d 00       	call   0x14061b558
   14034418f:	48 8b 8c 33 f0 00 00 	mov    rcx,QWORD PTR [rbx+rsi*1+0xf0]
   140344196:	00 
   140344197:	ba 04 00 00 00       	mov    edx,0x4
   14034419c:	e8 b7 73 2d 00       	call   0x14061b558
   1403441a1:	41 8b 86 c0 00 00 00 	mov    eax,DWORD PTR [r14+0xc0]
   1403441a8:	3b f8                	cmp    edi,eax
   1403441aa:	72 c5                	jb     0x140344171
   1403441ac:	8d 48 01             	lea    ecx,[rax+0x1]
   1403441af:	ba 04 00 00 00       	mov    edx,0x4
   1403441b4:	4b 8d 1c ff          	lea    rbx,[r15+r15*8]
   1403441b8:	48 03 cb             	add    rcx,rbx
   1403441bb:	48 8b 4c ce 18       	mov    rcx,QWORD PTR [rsi+rcx*8+0x18]
   1403441c0:	e8 93 73 2d 00       	call   0x14061b558
   1403441c5:	41 8b 8e c0 00 00 00 	mov    ecx,DWORD PTR [r14+0xc0]
   1403441cc:	ba 04 00 00 00       	mov    edx,0x4
   1403441d1:	ff c1                	inc    ecx
   1403441d3:	48 03 cb             	add    rcx,rbx
   1403441d6:	48 8b 8c ce f0 00 00 	mov    rcx,QWORD PTR [rsi+rcx*8+0xf0]
   1403441dd:	00 
   1403441de:	e8 75 73 2d 00       	call   0x14061b558
   1403441e3:	41 ff c5             	inc    r13d
   1403441e6:	44 3b 2d bb 57 5f 00 	cmp    r13d,DWORD PTR [rip+0x5f57bb]        # 0x1409399a8
   1403441ed:	0f 82 3d ff ff ff    	jb     0x140344130
   1403441f3:	4c 8b 7c 24 20       	mov    r15,QWORD PTR [rsp+0x20]
   1403441f8:	4c 8b 64 24 60       	mov    r12,QWORD PTR [rsp+0x60]
   1403441fd:	48 8b 8e 08 06 00 00 	mov    rcx,QWORD PTR [rsi+0x608]
   140344204:	e8 4f 73 2d 00       	call   0x14061b558
   140344209:	48 8b 8e 10 06 00 00 	mov    rcx,QWORD PTR [rsi+0x610]
   140344210:	48 89 ae 08 06 00 00 	mov    QWORD PTR [rsi+0x608],rbp
   140344217:	e8 3c 73 2d 00       	call   0x14061b558
   14034421c:	48 8b 8e 18 06 00 00 	mov    rcx,QWORD PTR [rsi+0x618]
   140344223:	48 89 ae 10 06 00 00 	mov    QWORD PTR [rsi+0x610],rbp
   14034422a:	e8 29 73 2d 00       	call   0x14061b558
   14034422f:	48 8b d6             	mov    rdx,rsi
   140344232:	48 89 ae 18 06 00 00 	mov    QWORD PTR [rsi+0x618],rbp
   140344239:	49 8b ce             	mov    rcx,r14
   14034423c:	e8 6f 30 fe ff       	call   0x1403272b0
   140344241:	48 8b 8e 50 05 00 00 	mov    rcx,QWORD PTR [rsi+0x550]
   140344248:	e8 0b 73 2d 00       	call   0x14061b558
   14034424d:	48 8b 8e 58 05 00 00 	mov    rcx,QWORD PTR [rsi+0x558]
   140344254:	e8 ff 72 2d 00       	call   0x14061b558
   140344259:	48 8b 8e 68 05 00 00 	mov    rcx,QWORD PTR [rsi+0x568]
   140344260:	e8 f3 72 2d 00       	call   0x14061b558
   140344265:	48 8b 8e 70 05 00 00 	mov    rcx,QWORD PTR [rsi+0x570]
   14034426c:	e8 e7 72 2d 00       	call   0x14061b558
   140344271:	48 8b 8e 40 05 00 00 	mov    rcx,QWORD PTR [rsi+0x540]
   140344278:	e8 db 72 2d 00       	call   0x14061b558
   14034427d:	4c 8b 6c 24 28       	mov    r13,QWORD PTR [rsp+0x28]
   140344282:	41 be 03 00 00 00    	mov    r14d,0x3
   140344288:	48 89 ae 40 05 00 00 	mov    QWORD PTR [rsi+0x540],rbp
   14034428f:	89 ae 48 05 00 00    	mov    DWORD PTR [rsi+0x548],ebp
   140344295:	39 2d 0d 57 5f 00    	cmp    DWORD PTR [rip+0x5f570d],ebp        # 0x1409399a8
   14034429b:	76 48                	jbe    0x1403442e5
   14034429d:	0f 1f 00             	nop    DWORD PTR [rax]
   1403442a0:	8b c5                	mov    eax,ebp
   1403442a2:	48 6b d8 38          	imul   rbx,rax,0x38
   1403442a6:	48 03 de             	add    rbx,rsi
   1403442a9:	48 8b 8b 90 04 00 00 	mov    rcx,QWORD PTR [rbx+0x490]
   1403442b0:	e8 a3 72 2d 00       	call   0x14061b558
   1403442b5:	48 81 c3 b0 04 00 00 	add    rbx,0x4b0
   1403442bc:	49 8b fe             	mov    rdi,r14
   1403442bf:	90                   	nop
   1403442c0:	48 8b 4b e8          	mov    rcx,QWORD PTR [rbx-0x18]
   1403442c4:	e8 8f 72 2d 00       	call   0x14061b558
   1403442c9:	48 8b 0b             	mov    rcx,QWORD PTR [rbx]
   1403442cc:	e8 87 72 2d 00       	call   0x14061b558
   1403442d1:	48 8d 5b 08          	lea    rbx,[rbx+0x8]
   1403442d5:	48 83 ef 01          	sub    rdi,0x1
   1403442d9:	75 e5                	jne    0x1403442c0
   1403442db:	ff c5                	inc    ebp
   1403442dd:	3b 2d c5 56 5f 00    	cmp    ebp,DWORD PTR [rip+0x5f56c5]        # 0x1409399a8
   1403442e3:	72 bb                	jb     0x1403442a0
   1403442e5:	48 8b 8e 38 05 00 00 	mov    rcx,QWORD PTR [rsi+0x538]
   1403442ec:	e8 67 72 2d 00       	call   0x14061b558
   1403442f1:	48 8b 8e 88 05 00 00 	mov    rcx,QWORD PTR [rsi+0x588]
   1403442f8:	e8 5b 72 2d 00       	call   0x14061b558
   1403442fd:	48 8b 8e 90 05 00 00 	mov    rcx,QWORD PTR [rsi+0x590]
   140344304:	e8 4f 72 2d 00       	call   0x14061b558
   140344309:	48 8b 8e a8 05 00 00 	mov    rcx,QWORD PTR [rsi+0x5a8]
   140344310:	e8 43 72 2d 00       	call   0x14061b558
   140344315:	48 8b 8e b0 05 00 00 	mov    rcx,QWORD PTR [rsi+0x5b0]
   14034431c:	e8 37 72 2d 00       	call   0x14061b558
   140344321:	48 8b 8e 40 06 00 00 	mov    rcx,QWORD PTR [rsi+0x640]
   140344328:	e8 2b 72 2d 00       	call   0x14061b558
   14034432d:	48 8b 8e 48 06 00 00 	mov    rcx,QWORD PTR [rsi+0x648]
   140344334:	e8 1f 72 2d 00       	call   0x14061b558
   140344339:	48 8b 8e 60 06 00 00 	mov    rcx,QWORD PTR [rsi+0x660]
   140344340:	e8 13 72 2d 00       	call   0x14061b558
   140344345:	48 8b 8e 68 06 00 00 	mov    rcx,QWORD PTR [rsi+0x668]
   14034434c:	e8 07 72 2d 00       	call   0x14061b558
   140344351:	48 8b 8e 90 06 00 00 	mov    rcx,QWORD PTR [rsi+0x690]
   140344358:	e8 fb 71 2d 00       	call   0x14061b558
   14034435d:	48 8b 8e f8 86 04 00 	mov    rcx,QWORD PTR [rsi+0x486f8]
   140344364:	e8 ef 71 2d 00       	call   0x14061b558
   140344369:	48 8b 8e 00 87 04 00 	mov    rcx,QWORD PTR [rsi+0x48700]
   140344370:	e8 e3 71 2d 00       	call   0x14061b558
   140344375:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   14034437a:	48 8d 9e 08 87 04 00 	lea    rbx,[rsi+0x48708]
   140344381:	48 8b 6c 24 50       	mov    rbp,QWORD PTR [rsp+0x50]
   140344386:	48 8b 0b             	mov    rcx,QWORD PTR [rbx]
   140344389:	e8 ca 71 2d 00       	call   0x14061b558
   14034438e:	48 8d 5b 08          	lea    rbx,[rbx+0x8]
   140344392:	49 83 ee 01          	sub    r14,0x1
   140344396:	75 ee                	jne    0x140344386
   140344398:	48 8b 8e 20 87 04 00 	mov    rcx,QWORD PTR [rsi+0x48720]
   14034439f:	48 83 c4 30          	add    rsp,0x30
   1403443a3:	41 5e                	pop    r14
   1403443a5:	5e                   	pop    rsi
   1403443a6:	5b                   	pop    rbx
   1403443a7:	e9 ac 71 2d 00       	jmp    0x14061b558
   1403443ac:	cc                   	int3
   1403443ad:	cc                   	int3
   1403443ae:	cc                   	int3
   1403443af:	cc                   	int3
   1403443b0:	cc                   	int3
   1403443b1:	cc                   	int3
   1403443b2:	cc                   	int3
   1403443b3:	cc                   	int3
   1403443b4:	cc                   	int3
   1403443b5:	cc                   	int3
   1403443b6:	cc                   	int3
   1403443b7:	cc                   	int3
   1403443b8:	cc                   	int3
   1403443b9:	cc                   	int3
   1403443ba:	cc                   	int3
   1403443bb:	cc                   	int3
   1403443bc:	cc                   	int3
   1403443bd:	cc                   	int3
   1403443be:	cc                   	int3
   1403443bf:	cc                   	int3
   1403443c0:	e9 4b 95 fe ff       	jmp    0x14032d910
   1403443c5:	cc                   	int3
   1403443c6:	cc                   	int3
   1403443c7:	cc                   	int3
   1403443c8:	cc                   	int3
   1403443c9:	cc                   	int3
   1403443ca:	cc                   	int3
   1403443cb:	cc                   	int3
   1403443cc:	cc                   	int3
   1403443cd:	cc                   	int3
   1403443ce:	cc                   	int3
   1403443cf:	cc                   	int3
   1403443d0:	f3 0f 10 05 58 bc 50 	movss  xmm0,DWORD PTR [rip+0x50bc58]        # 0x140850030
   1403443d7:	00 
   1403443d8:	c3                   	ret
   1403443d9:	cc                   	int3
   1403443da:	cc                   	int3
   1403443db:	cc                   	int3
   1403443dc:	cc                   	int3
   1403443dd:	cc                   	int3
   1403443de:	cc                   	int3
   1403443df:	cc                   	int3
