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
   14031fc49:	cc                   	int3
   14031fc4a:	cc                   	int3
   14031fc4b:	cc                   	int3
   14031fc4c:	cc                   	int3
   14031fc4d:	cc                   	int3
   14031fc4e:	cc                   	int3
   14031fc4f:	cc                   	int3
   14031fc50:	0f b7 15 07 a5 66 00 	movzx  edx,WORD PTR [rip+0x66a507]        # 0x14098a15e
   14031fc57:	8b 41 28             	mov    eax,DWORD PTR [rcx+0x28]
   14031fc5a:	0f af c2             	imul   eax,edx
   14031fc5d:	0f af 05 44 a5 66 00 	imul   eax,DWORD PTR [rip+0x66a544]        # 0x14098a1a8
   14031fc64:	c1 e8 03             	shr    eax,0x3
   14031fc67:	c3                   	ret
   14031fc68:	cc                   	int3
   14031fc69:	cc                   	int3
   14031fc6a:	cc                   	int3
   14031fc6b:	cc                   	int3
   14031fc6c:	cc                   	int3
   14031fc6d:	cc                   	int3
   14031fc6e:	cc                   	int3
   14031fc6f:	cc                   	int3
   14031fc70:	8b 41 24             	mov    eax,DWORD PTR [rcx+0x24]
   14031fc73:	0f af 05 2e a5 66 00 	imul   eax,DWORD PTR [rip+0x66a52e]        # 0x14098a1a8
   14031fc7a:	c3                   	ret
   14031fc7b:	cc                   	int3
   14031fc7c:	cc                   	int3
   14031fc89:	cc                   	int3
   14031fc8a:	cc                   	int3
   14031fc8b:	cc                   	int3
   14031fc8c:	cc                   	int3
   14031fc8d:	cc                   	int3
   14031fc8e:	cc                   	int3
   14031fc8f:	cc                   	int3
   14031fc90:	0f b7 15 c7 a4 66 00 	movzx  edx,WORD PTR [rip+0x66a4c7]        # 0x14098a15e
   14031fc97:	8b 41 24             	mov    eax,DWORD PTR [rcx+0x24]
   14031fc9a:	0f af c2             	imul   eax,edx
   14031fc9d:	0f af 05 04 a5 66 00 	imul   eax,DWORD PTR [rip+0x66a504]        # 0x14098a1a8
   14031fca4:	c1 e8 03             	shr    eax,0x3
   14031fca7:	c3                   	ret
   14031fca8:	cc                   	int3
   14031fca9:	cc                   	int3
   14031fcaa:	cc                   	int3
   14031fcab:	cc                   	int3
   14031fcac:	cc                   	int3
   14031fcad:	cc                   	int3
   14031fcae:	cc                   	int3
   14031fcaf:	cc                   	int3
   14031fcb0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14031fcb5:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   14031fcba:	57                   	push   rdi
   14031fcbb:	48 83 ec 20          	sub    rsp,0x20
   14031fcbf:	33 f6                	xor    esi,esi
   1403669bb:	41 54                	push   r12
   1403669bd:	41 55                	push   r13
   1403669bf:	41 56                	push   r14
   1403669c1:	41 57                	push   r15
   1403669c3:	48 83 ec 20          	sub    rsp,0x20
   1403669c7:	44 8b b9 7c 02 00 00 	mov    r15d,DWORD PTR [rcx+0x27c]
   1403669ce:	40 32 ed             	xor    bpl,bpl
   1403669d1:	44 0f b7 25 85 37 62 	movzx  r12d,WORD PTR [rip+0x623785]        # 0x14098a15e
   1403669d8:	00 
   1403669d9:	48 8b d9             	mov    rbx,rcx
   1403669dc:	8b b9 dc 02 00 00    	mov    edi,DWORD PTR [rcx+0x2dc]
   1403669e2:	ba 01 00 00 00       	mov    edx,0x1
   1403669e7:	0f af 3d ba 37 62 00 	imul   edi,DWORD PTR [rip+0x6237ba]        # 0x14098a1a8
   1403669ee:	45 0f af e7          	imul   r12d,r15d
   1403669f2:	41 03 ff             	add    edi,r15d
   1403669f5:	41 c1 ec 03          	shr    r12d,0x3
   1403669f9:	40 38 2d d0 f6 b9 14 	cmp    BYTE PTR [rip+0x14b9f6d0],bpl        # 0x154f060d0
   140366a00:	74 15                	je     0x140366a17
   140366a02:	8b 81 80 02 00 00    	mov    eax,DWORD PTR [rcx+0x280]
   140366a08:	03 81 78 02 00 00    	add    eax,DWORD PTR [rcx+0x278]
   140366a0e:	3b f8                	cmp    edi,eax
   140366a10:	40 0f b6 ed          	movzx  ebp,bpl
   140366a14:	0f 43 ea             	cmovae ebp,edx
   140366a17:	80 3d b3 f6 b9 14 00 	cmp    BYTE PTR [rip+0x14b9f6b3],0x0        # 0x154f060d1
   140366a1e:	74 19                	je     0x140366a39
   140366a20:	8b 89 78 02 00 00    	mov    ecx,DWORD PTR [rcx+0x278]
   140366aa9:	e8 82 cc 00 00       	call   0x140373730
   140366aae:	84 c0                	test   al,al
   140366ab0:	75 07                	jne    0x140366ab9
   140366ab2:	b0 01                	mov    al,0x1
   140366ab4:	e9 ba 00 00 00       	jmp    0x140366b73
   140366ab9:	48 89 74 24 50       	mov    QWORD PTR [rsp+0x50],rsi
   140366abe:	89 bb 7c 02 00 00    	mov    DWORD PTR [rbx+0x27c],edi
   140366ac4:	0f b7 35 93 36 62 00 	movzx  esi,WORD PTR [rip+0x623693]        # 0x14098a15e
   140366acb:	0f af f7             	imul   esi,edi
   140366ace:	c1 ee 03             	shr    esi,0x3
   140366ad1:	44 3b bb 80 02 00 00 	cmp    r15d,DWORD PTR [rbx+0x280]
   140366ad8:	75 0e                	jne    0x140366ae8
   140366ada:	48 8d 8b b8 02 00 00 	lea    rcx,[rbx+0x2b8]
   140366ae1:	e8 6a 91 fb ff       	call   0x14031fc50
   140366ae6:	eb 03                	jmp    0x140366aeb
   140366ae8:	41 8b c6             	mov    eax,r14d
   140366aeb:	2b 83 84 02 00 00    	sub    eax,DWORD PTR [rbx+0x284]
   140366af1:	41 2b c4             	sub    eax,r12d
   140366af4:	03 c6                	add    eax,esi
   140366af6:	79 11                	jns    0x140366b09
   140366af8:	45 33 c0             	xor    r8d,r8d
   140366afb:	48 8d 15 ae 6f 34 00 	lea    rdx,[rip+0x346fae]        # 0x1406adab0
   140366b02:	33 c9                	xor    ecx,ecx
   140366b04:	e8 c7 81 1c 00       	call   0x14052ecd0
   140366b09:	44 3b bb 80 02 00 00 	cmp    r15d,DWORD PTR [rbx+0x280]
   140366b10:	75 0f                	jne    0x140366b21
   140366b04:	e8 c7 81 1c 00       	call   0x14052ecd0
   140366b09:	44 3b bb 80 02 00 00 	cmp    r15d,DWORD PTR [rbx+0x280]
   140366b10:	75 0f                	jne    0x140366b21
   140366b12:	48 8d 8b b8 02 00 00 	lea    rcx,[rbx+0x2b8]
   140366b19:	e8 32 91 fb ff       	call   0x14031fc50
   140366b1e:	44 8b f0             	mov    r14d,eax
   140366b21:	8b bb 84 02 00 00    	mov    edi,DWORD PTR [rbx+0x284]
   140366b27:	0f b7 0d 30 36 62 00 	movzx  ecx,WORD PTR [rip+0x623630]        # 0x14098a15e
   140366b2e:	41 2b fe             	sub    edi,r14d
   140366b31:	8d 34 fd 00 00 00 00 	lea    esi,[rdi*8+0x0]
   140366b38:	8b c6                	mov    eax,esi
   140366b3a:	99                   	cdq
   140366b3b:	f7 f9                	idiv   ecx
   140366b3d:	85 c0                	test   eax,eax
   140366b3f:	79 11                	jns    0x140366b52
   140366b41:	45 33 c0             	xor    r8d,r8d
   140366b44:	48 8d 15 1d 6f 34 00 	lea    rdx,[rip+0x346f1d]        # 0x1406ada68
   140366b4b:	33 c9                	xor    ecx,ecx
   140366b4d:	e8 7e 81 1c 00       	call   0x14052ecd0
   140366b3b:	f7 f9                	idiv   ecx
   140366b3d:	85 c0                	test   eax,eax
   140366b3f:	79 11                	jns    0x140366b52
   140366b41:	45 33 c0             	xor    r8d,r8d
   140366b44:	48 8d 15 1d 6f 34 00 	lea    rdx,[rip+0x346f1d]        # 0x1406ada68
   140366b4b:	33 c9                	xor    ecx,ecx
   140366b4d:	e8 7e 81 1c 00       	call   0x14052ecd0
   140366b52:	0f b7 0d 05 36 62 00 	movzx  ecx,WORD PTR [rip+0x623605]        # 0x14098a15e
   140366b59:	8b c6                	mov    eax,esi
   140366b5b:	48 8b 74 24 50       	mov    rsi,QWORD PTR [rsp+0x50]
   140366b60:	99                   	cdq
   140366b61:	f7 f9                	idiv   ecx
   140366b63:	01 83 38 02 00 00    	add    DWORD PTR [rbx+0x238],eax
   140366b69:	40 0f b6 c5          	movzx  eax,bpl
   140366b6d:	01 bb 34 02 00 00    	add    DWORD PTR [rbx+0x234],edi
   140366b73:	48 8b 5c 24 58       	mov    rbx,QWORD PTR [rsp+0x58]
   140366b78:	48 8b 6c 24 60       	mov    rbp,QWORD PTR [rsp+0x60]
   140366b7d:	48 83 c4 20          	add    rsp,0x20
   140366b81:	41 5f                	pop    r15
   140366b83:	41 5e                	pop    r14
   140366b85:	41 5d                	pop    r13
   140366b87:	41 5c                	pop    r12
   140366b89:	5f                   	pop    rdi
   140366b8a:	c3                   	ret
   140366b8b:	cc                   	int3
   140366b8c:	cc                   	int3
   140366bab:	57                   	push   rdi
   140366bac:	41 54                	push   r12
   140366bae:	41 55                	push   r13
   140366bb0:	41 56                	push   r14
   140366bb2:	48 83 ec 20          	sub    rsp,0x20
   140366bb6:	8b 44 24 70          	mov    eax,DWORD PTR [rsp+0x70]
   140366bba:	4c 8b f2             	mov    r14,rdx
   140366bbd:	44 0f b7 15 99 35 62 	movzx  r10d,WORD PTR [rip+0x623599]        # 0x14098a15e
   140366bc4:	00 
   140366bc5:	49 8b f1             	mov    rsi,r9
   140366bc8:	4d 8b e0             	mov    r12,r8
   140366bcb:	48 8b d9             	mov    rbx,rcx
   140366bce:	8d 04 c5 00 00 00 00 	lea    eax,[rax*8+0x0]
   140366bd5:	99                   	cdq
   140366bd6:	41 f7 fa             	idiv   r10d
   140366bd9:	48 63 f8             	movsxd rdi,eax
   140366bdc:	41 0f b7 46 0e       	movzx  eax,WORD PTR [r14+0xe]
   140366be1:	4c 8b ef             	mov    r13,rdi
   140366be4:	66 83 f8 08          	cmp    ax,0x8
   140366be8:	0f 85 b2 01 00 00    	jne    0x140366da0
   140366bee:	0f b6 6c 24 78       	movzx  ebp,BYTE PTR [rsp+0x78]
   140366bf3:	40 84 ed             	test   bpl,bpl
   140366bf6:	75 43                	jne    0x140366c3b
   140366bf8:	48 8b 89 a0 02 00 00 	mov    rcx,QWORD PTR [rcx+0x2a0]
   140366bff:	48 85 c9             	test   rcx,rcx
   140366c02:	74 05                	je     0x140366c09
   1403672a3:	48 83 f9 03          	cmp    rcx,0x3
   1403672a7:	0f 8c 85 00 00 00    	jl     0x140367332
   1403672ad:	e8 6e 66 22 00       	call   0x14058d920
   1403672b2:	48 8b 8e 88 02 00 00 	mov    rcx,QWORD PTR [rsi+0x288]
   1403672b9:	ba ff ff ff ff       	mov    edx,0xffffffff
   1403672be:	48 89 3d 23 f0 b9 14 	mov    QWORD PTR [rip+0x14b9f023],rdi        # 0x154f062e8
   1403672c5:	ff 15 85 13 32 00    	call   QWORD PTR [rip+0x321385]        # 0x140688650
   1403672cb:	0f b7 05 8c 2e 62 00 	movzx  eax,WORD PTR [rip+0x622e8c]        # 0x14098a15e
   1403672d2:	0f af 86 7c 02 00 00 	imul   eax,DWORD PTR [rsi+0x27c]
   1403672d9:	44 8b b6 9c 02 00 00 	mov    r14d,DWORD PTR [rsi+0x29c]
   1403672e0:	48 8b 8e 88 02 00 00 	mov    rcx,QWORD PTR [rsi+0x288]
   1403672e7:	99                   	cdq
   1403672e8:	83 e2 07             	and    edx,0x7
   1403672eb:	03 c2                	add    eax,edx
   1403672ed:	c1 f8 03             	sar    eax,0x3
   1403672f0:	44 2b f0             	sub    r14d,eax
   1403672f3:	45 85 f6             	test   r14d,r14d
   1403672f6:	45 0f 4e f4          	cmovle r14d,r12d
   1403672fa:	ff 15 48 13 32 00    	call   QWORD PTR [rip+0x321348]        # 0x140688648
   140367300:	41 8d 04 2f          	lea    eax,[r15+rbp*1]
   140367304:	44 3b f0             	cmp    r14d,eax
   140367307:	73 0d                	jae    0x140367316
   140367309:	83 3d 9c 26 5d 00 00 	cmp    DWORD PTR [rip+0x5d269c],0x0        # 0x1409399ac
   140367310:	0f 8c 4c ff ff ff    	jl     0x140367262
   140367316:	45 8b cc             	mov    r9d,r12d
   140367319:	44 3b f3             	cmp    r14d,ebx
   140367330:	eb 73                	jmp    0x1403673a5
   140367332:	2b d7                	sub    edx,edi
   140367334:	8d 4a 03             	lea    ecx,[rdx+0x3]
   140367337:	ff 15 2b 13 32 00    	call   QWORD PTR [rip+0x32132b]        # 0x140688668
   14036733d:	e9 20 ff ff ff       	jmp    0x140367262
   140367342:	80 3d 87 ed b9 14 00 	cmp    BYTE PTR [rip+0x14b9ed87],0x0        # 0x154f060d0
   140367349:	74 cb                	je     0x140367316
   14036734b:	0f b7 0d 0c 2e 62 00 	movzx  ecx,WORD PTR [rip+0x622e0c]        # 0x14098a15e
   140367352:	41 2b d0             	sub    edx,r8d
   140367355:	03 54 24 54          	add    edx,DWORD PTR [rsp+0x54]
   140367359:	44 8b f3             	mov    r14d,ebx
   14036735c:	0f af d1             	imul   edx,ecx
   14036735f:	8b c2                	mov    eax,edx
   140367361:	99                   	cdq
   140367362:	83 e2 07             	and    edx,0x7
   140367365:	03 c2                	add    eax,edx
   140367367:	c1 f8 03             	sar    eax,0x3
   14036736a:	85 c0                	test   eax,eax
   14036736c:	41 0f 4e c4          	cmovle eax,r12d
   140367370:	3b c3                	cmp    eax,ebx
   140367372:	44 0f 4c f0          	cmovl  r14d,eax
   140367376:	45 8b ce             	mov    r9d,r14d
   140367379:	44 89 b4 24 d8 00 00 	mov    DWORD PTR [rsp+0xd8],r14d
   140367380:	00 
   140367381:	42 8d 04 f5 00 00 00 	lea    eax,[r14*8+0x0]
   140367388:	00 
   14036741d:	ff 15 9d 23 32 00    	call   QWORD PTR [rip+0x32239d]        # 0x1406897c0
   140367423:	83 3d 7e 25 5d 00 00 	cmp    DWORD PTR [rip+0x5d257e],0x0        # 0x1409399a8
   14036742a:	41 8b fc             	mov    edi,r12d
   14036742d:	8b 86 98 02 00 00    	mov    eax,DWORD PTR [rsi+0x298]
   140367433:	8b e8                	mov    ebp,eax
   140367435:	89 84 24 d0 00 00 00 	mov    DWORD PTR [rsp+0xd0],eax
   14036743c:	0f 86 cd 04 00 00    	jbe    0x14036790f
   140367442:	66 83 3d 14 2d 62 00 	cmp    WORD PTR [rip+0x622d14],0x8        # 0x14098a15e
   140367449:	08 
   14036744a:	0f 85 7e 02 00 00    	jne    0x1403676ce
   140367450:	4a 83 bc e6 40 02 00 	cmp    QWORD PTR [rsi+r12*8+0x240],0x0
   140367457:	00 00 
   140367459:	49 8b cd             	mov    rcx,r13
   14036745c:	45 8b fc             	mov    r15d,r12d
   14036745f:	0f 84 63 01 00 00    	je     0x1403675c8
   140367465:	8b 9e 2c 02 00 00    	mov    ebx,DWORD PTR [rsi+0x22c]
   14036746b:	e8 e0 87 fb ff       	call   0x14031fc50
   140367470:	4e 8b 8c e6 40 02 00 	mov    r9,QWORD PTR [rsi+r12*8+0x240]
   140367477:	00 
   140367478:	03 c0                	add    eax,eax
   14036747a:	ba 00 00 00 00       	mov    edx,0x0
   14036747f:	8b cb                	mov    ecx,ebx
   140367481:	2b c8                	sub    ecx,eax
   140367483:	8b f9                	mov    edi,ecx
   140367485:	f7 df                	neg    edi
   140367487:	85 ff                	test   edi,edi
   1403676b1:	4c 63 c0             	movsxd r8,eax
   1403676b4:	ba 80 00 00 00       	mov    edx,0x80
   1403676b9:	e8 2c 96 2b 00       	call   0x140620cea
   1403676be:	41 b7 01             	mov    r15b,0x1
   1403676c1:	44 88 bc 24 c0 00 00 	mov    BYTE PTR [rsp+0xc0],r15b
   1403676c8:	00 
   1403676c9:	e9 31 02 00 00       	jmp    0x1403678ff
   1403676ce:	66 83 3d 88 2a 62 00 	cmp    WORD PTR [rip+0x622a88],0x10        # 0x14098a15e
   1403676d5:	10 
   1403676d6:	0f 85 23 02 00 00    	jne    0x1403678ff
   1403676dc:	4a 83 bc e6 58 02 00 	cmp    QWORD PTR [rsi+r12*8+0x258],0x0
   1403676e3:	00 00 
   1403676e5:	49 8b cd             	mov    rcx,r13
   1403676e8:	45 8b fc             	mov    r15d,r12d
   1403676eb:	0f 84 3a 01 00 00    	je     0x14036782b
   1403676f1:	8b 9e 2c 02 00 00    	mov    ebx,DWORD PTR [rsi+0x22c]
   1403676f7:	e8 54 85 fb ff       	call   0x14031fc50
   1403676fc:	4e 8b 8c e6 58 02 00 	mov    r9,QWORD PTR [rsi+r12*8+0x258]
   140367703:	00 
   140367704:	03 c0                	add    eax,eax
   140367706:	ba 00 00 00 00       	mov    edx,0x0
   14036770b:	8b cb                	mov    ecx,ebx
   14036770d:	2b c8                	sub    ecx,eax
   14036770f:	8b f9                	mov    edi,ecx
   140367711:	f7 df                	neg    edi
   140367713:	85 ff                	test   edi,edi
   1403678ff:	41 ff c4             	inc    r12d
   140367902:	44 3b 25 9f 20 5d 00 	cmp    r12d,DWORD PTR [rip+0x5d209f]        # 0x1409399a8
   140367909:	0f 82 33 fb ff ff    	jb     0x140367442
   14036790f:	33 d2                	xor    edx,edx
   140367911:	89 ae 98 02 00 00    	mov    DWORD PTR [rsi+0x298],ebp
   140367917:	89 be 2c 02 00 00    	mov    DWORD PTR [rsi+0x22c],edi
   14036791d:	8d 04 fd 00 00 00 00 	lea    eax,[rdi*8+0x0]
   140367924:	0f b7 0d 33 28 62 00 	movzx  ecx,WORD PTR [rip+0x622833]        # 0x14098a15e
   14036792b:	f7 f1                	div    ecx
   14036792d:	33 d2                	xor    edx,edx
   14036792f:	48 8d 4c 24 40       	lea    rcx,[rsp+0x40]
   140367934:	89 86 30 02 00 00    	mov    DWORD PTR [rsi+0x230],eax
   14036793a:	e8 a1 bd 24 00       	call   0x1405b36e0
   14036793f:	48 8b 8e 88 02 00 00 	mov    rcx,QWORD PTR [rsi+0x288]
   140367946:	ff 15 fc 0c 32 00    	call   QWORD PTR [rip+0x320cfc]        # 0x140688648
   14036794c:	45 84 ff             	test   r15b,r15b
   14036794f:	74 2b                	je     0x14036797c
   140367951:	45 85 f6             	test   r14d,r14d
   140367954:	7f 13                	jg     0x140367969
   140367956:	80 3d 73 e7 b9 14 00 	cmp    BYTE PTR [rip+0x14b9e773],0x0        # 0x154f060d0
   14036795d:	74 1d                	je     0x14036797c
   14036795f:	83 bc 24 d8 00 00 00 	cmp    DWORD PTR [rsp+0xd8],0x0
   140367966:	00 
   140367967:	7e 13                	jle    0x14036797c
   140367969:	48 8b ce             	mov    rcx,rsi
   14036796c:	44 89 b6 84 02 00 00 	mov    DWORD PTR [rsi+0x284],r14d
   140367d4e:	0f 84 f2 fe ff ff    	je     0x140367c46
   140367d54:	44 39 2d 4d 1c 5d 00 	cmp    DWORD PTR [rip+0x5d1c4d],r13d        # 0x1409399a8
   140367d5b:	41 8b f5             	mov    esi,r13d
   140367d5e:	0f 86 30 01 00 00    	jbe    0x140367e94
   140367d64:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140367d68:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140367d6f:	00 
   140367d70:	0f b7 05 e7 23 62 00 	movzx  eax,WORD PTR [rip+0x6223e7]        # 0x14098a15e
   140367d77:	66 83 f8 08          	cmp    ax,0x8
   140367d7b:	75 7f                	jne    0x140367dfc
   140367d7d:	44 8b f6             	mov    r14d,esi
   140367d80:	4a 8b 9c f7 40 02 00 	mov    rbx,QWORD PTR [rdi+r14*8+0x240]
   140367d87:	00 
   140367d88:	48 85 db             	test   rbx,rbx
   140367d8b:	74 4d                	je     0x140367dda
   140367d8d:	ff 15 0d 09 32 00    	call   QWORD PTR [rip+0x32090d]        # 0x1406886a0
   140367d93:	45 8b 67 20          	mov    r12d,DWORD PTR [r15+0x20]
   140367d97:	4c 8b c3             	mov    r8,rbx
   140367d9a:	48 8b c8             	mov    rcx,rax
   140367d9d:	33 d2                	xor    edx,edx
   140367d9f:	ff 15 f3 08 32 00    	call   QWORD PTR [rip+0x3208f3]        # 0x140688698
   140367da5:	49 3b c4             	cmp    rax,r12
   140367da8:	0f 83 cd 00 00 00    	jae    0x140367e7b
   140367dae:	4a 8b 9c f7 40 02 00 	mov    rbx,QWORD PTR [rdi+r14*8+0x240]
   140367db5:	00 
   140367db6:	ff 15 e4 08 32 00    	call   QWORD PTR [rip+0x3208e4]        # 0x1406886a0
   140367efe:	41 0f af 77 24       	imul   esi,DWORD PTR [r15+0x24]
   140367f03:	41 2b 47 28          	sub    eax,DWORD PTR [r15+0x28]
   140367f07:	0f af 05 9a 22 62 00 	imul   eax,DWORD PTR [rip+0x62229a]        # 0x14098a1a8
   140367f0e:	41 03 77 28          	add    esi,DWORD PTR [r15+0x28]
   140367f12:	0f af 35 8f 22 62 00 	imul   esi,DWORD PTR [rip+0x62228f]        # 0x14098a1a8
   140367f19:	44 8d 24 18          	lea    r12d,[rax+rbx*1]
   140367f1d:	03 f3                	add    esi,ebx
   140367f1f:	66 83 3d 37 22 62 00 	cmp    WORD PTR [rip+0x622237],0x8        # 0x14098a15e
   140367f26:	08 
   140367f27:	44 89 a4 24 e8 00 00 	mov    DWORD PTR [rsp+0xe8],r12d
   140367f2e:	00 
   140367f2f:	41 0f 95 c6          	setne  r14b
   140367f33:	41 ff c6             	inc    r14d
   140367f36:	45 0f af f4          	imul   r14d,r12d
   140367f3a:	44 3b 64 24 54       	cmp    r12d,DWORD PTR [rsp+0x54]
   140367f3f:	0f 8d 35 02 00 00    	jge    0x14036817a
   140367f45:	83 3d 5c 1a 5d 00 00 	cmp    DWORD PTR [rip+0x5d1a5c],0x0        # 0x1409399a8
   140367f4c:	41 8b dd             	mov    ebx,r13d
   140367f4f:	0f 86 7b 01 00 00    	jbe    0x1403680d0
   140367f55:	41 8b c4             	mov    eax,r12d
   140367f58:	f7 d8                	neg    eax
   140367f5a:	85 c0                	test   eax,eax
   140367f5c:	41 0f 4e c5          	cmovle eax,r13d
   140367f60:	4c 63 e8             	movsxd r13,eax
   140367f63:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140367f67:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140367f89:	48 8b 4c 24 44       	mov    rcx,QWORD PTR [rsp+0x44]
   140367f8e:	45 85 f6             	test   r14d,r14d
   140367f91:	41 0f 4f c6          	cmovg  eax,r14d
   140367f95:	45 33 c0             	xor    r8d,r8d
   140367f98:	0f af d0             	imul   edx,eax
   140367f9b:	03 54 24 4c          	add    edx,DWORD PTR [rsp+0x4c]
   140367f9f:	ff 15 1b 18 32 00    	call   QWORD PTR [rip+0x32181b]        # 0x1406897c0
   140367fa5:	66 83 3d b1 21 62 00 	cmp    WORD PTR [rip+0x6221b1],0x8        # 0x14098a15e
   140367fac:	08 
   140367fad:	75 76                	jne    0x140368025
   140367faf:	45 85 f6             	test   r14d,r14d
   140367fb2:	79 19                	jns    0x140367fcd
   140367fb4:	41 8b c6             	mov    eax,r14d
   140367fb7:	8b cb                	mov    ecx,ebx
   140367fb9:	f7 d8                	neg    eax
   140367fbb:	33 d2                	xor    edx,edx
   140367fbd:	4c 63 c0             	movsxd r8,eax
   140367fc0:	48 8b 8c cf 40 02 00 	mov    rcx,QWORD PTR [rdi+rcx*8+0x240]
   140367fc7:	00 
   140367fc8:	e8 1d 8d 2b 00       	call   0x140620cea
   140367fcd:	3b f5                	cmp    esi,ebp
   140367fcf:	7e 20                	jle    0x140367ff1
   140367fd1:	41 8b 4f 20          	mov    ecx,DWORD PTR [r15+0x20]
   140367fd5:	8b c6                	mov    eax,esi
   140367fd7:	2b c5                	sub    eax,ebp
   140367fd9:	2b ce                	sub    ecx,esi
   14058da61:	0f 85 a4 00 00 00    	jne    0x14058db0b
   14058da67:	8b 44 24 7c          	mov    eax,DWORD PTR [rsp+0x7c]
   14058da6b:	0f 57 f6             	xorps  xmm6,xmm6
   14058da6e:	0f 57 c0             	xorps  xmm0,xmm0
   14058da71:	f3 48 0f 2a f0       	cvtsi2ss xmm6,rax
   14058da76:	8b 05 d8 c6 3f 00    	mov    eax,DWORD PTR [rip+0x3fc6d8]        # 0x14098a154
   14058da7c:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058da81:	0f b7 05 d6 c6 3f 00 	movzx  eax,WORD PTR [rip+0x3fc6d6]        # 0x14098a15e
   14058da88:	f3 0f 5e f0          	divss  xmm6,xmm0
   14058da8c:	0f 57 c0             	xorps  xmm0,xmm0
   14058da8f:	f3 0f 2a c0          	cvtsi2ss xmm0,eax
   14058da93:	f3 41 0f 59 f3       	mulss  xmm6,xmm11
   14058da98:	f3 0f 5e f0          	divss  xmm6,xmm0
   14058da9c:	e8 6f b8 fa ff       	call   0x140539310
   14058daa1:	48 2b 05 d0 c0 2e 17 	sub    rax,QWORD PTR [rip+0x172ec0d0]        # 0x157879b78
   14058daa8:	8b 0d 16 ac 2c 17    	mov    ecx,DWORD PTR [rip+0x172cac16]        # 0x1578586c4
   14058daae:	0f 57 d2             	xorps  xmm2,xmm2
   14058dab1:	0f 57 c0             	xorps  xmm0,xmm0
   14058dab4:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   14058dab9:	8b 05 95 c6 3f 00    	mov    eax,DWORD PTR [rip+0x3fc695]        # 0x14098a154
   14058dabf:	0f 57 c9             	xorps  xmm1,xmm1
   14058dac2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058daa8:	8b 0d 16 ac 2c 17    	mov    ecx,DWORD PTR [rip+0x172cac16]        # 0x1578586c4
   14058daae:	0f 57 d2             	xorps  xmm2,xmm2
   14058dab1:	0f 57 c0             	xorps  xmm0,xmm0
   14058dab4:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   14058dab9:	8b 05 95 c6 3f 00    	mov    eax,DWORD PTR [rip+0x3fc695]        # 0x14098a154
   14058dabf:	0f 57 c9             	xorps  xmm1,xmm1
   14058dac2:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058dac7:	0f b7 05 90 c6 3f 00 	movzx  eax,WORD PTR [rip+0x3fc690]        # 0x14098a15e
   14058dace:	f3 41 0f 5e d4       	divss  xmm2,xmm12
   14058dad3:	f3 0f 2a c8          	cvtsi2ss xmm1,eax
   14058dad7:	f3 0f 5c d6          	subss  xmm2,xmm6
   14058dadb:	f3 0f 59 d0          	mulss  xmm2,xmm0
   14058dadf:	f3 0f 59 d1          	mulss  xmm2,xmm1
   14058dae3:	f3 41 0f 59 d5       	mulss  xmm2,xmm13
   14058dae8:	f3 48 0f 2c c2       	cvttss2si rax,xmm2
   14058daed:	83 e0 fc             	and    eax,0xfffffffc
   14058daf0:	89 05 d2 ab 2c 17    	mov    DWORD PTR [rip+0x172cabd2],eax        # 0x1578586c8
   14058daf6:	3b c1                	cmp    eax,ecx
   14058daf8:	76 09                	jbe    0x14058db03
   14058dafa:	44 89 25 c3 ab 2c 17 	mov    DWORD PTR [rip+0x172cabc3],r12d        # 0x1578586c4
   14058db01:	eb 08                	jmp    0x14058db0b
   14058db03:	2b c8                	sub    ecx,eax
   14058db05:	89 0d b9 ab 2c 17    	mov    DWORD PTR [rip+0x172cabb9],ecx        # 0x1578586c4
   14058db0b:	44 8b 7d 80          	mov    r15d,DWORD PTR [rbp-0x80]
   14058db0f:	8b 15 97 a9 2c 17    	mov    edx,DWORD PTR [rip+0x172ca997]        # 0x1578584ac
   14058db15:	44 2b fa             	sub    r15d,edx
   14058dbcd:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   14058dbd2:	48 8d 0d d7 78 1f 00 	lea    rcx,[rip+0x1f78d7]        # 0x1407854b0
   14058dbd9:	f3 48 0f 2a d2       	cvtsi2ss xmm2,rdx
   14058dbde:	e8 bd 8d dd ff       	call   0x1403669a0
   14058dbe3:	83 3d c2 bd 3a 00 00 	cmp    DWORD PTR [rip+0x3abdc2],0x0        # 0x1409399ac
   14058dbea:	0f 28 f7             	movaps xmm6,xmm7
   14058dbed:	0f 8d d6 01 00 00    	jge    0x14058ddc9
   14058dbf3:	44 0f b7 1d 63 c5 3f 	movzx  r11d,WORD PTR [rip+0x3fc563]        # 0x14098a15e
   14058dbfa:	00 
   14058dbfb:	48 8d 74 24 68       	lea    rsi,[rsp+0x68]
   14058dc00:	45 8b eb             	mov    r13d,r11d
   14058dc03:	4c 8d 74 24 48       	lea    r14,[rsp+0x48]
   14058dc08:	0f 28 cf             	movaps xmm1,xmm7
   14058dc0b:	41 bc 02 00 00 00    	mov    r12d,0x2
   14058dc11:	45 33 ff             	xor    r15d,r15d
   14058dc14:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14058dc18:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14058dc1f:	00 
   14058dc20:	41 8b 06             	mov    eax,DWORD PTR [r14]
   14058dc23:	33 d2                	xor    edx,edx
   14058dc25:	c1 e0 03             	shl    eax,0x3
   14058dc28:	41 f7 f5             	div    r13d
   14058dc2b:	41 8b d7             	mov    edx,r15d
   14058dc2e:	8b d8                	mov    ebx,eax
   14058dc30:	83 f8 04             	cmp    eax,0x4
   14058dc33:	0f 82 ce 00 00 00    	jb     0x14058dd07
   14058de01:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058de06:	f3 0f 5c c8          	subss  xmm1,xmm0
   14058de0a:	0f 2f cf             	comiss xmm1,xmm7
   14058de0d:	77 03                	ja     0x14058de12
   14058de0f:	0f 28 cf             	movaps xmm1,xmm7
   14058de12:	8b 05 90 c3 3f 00    	mov    eax,DWORD PTR [rip+0x3fc390]        # 0x14098a1a8
   14058de18:	0f 57 c0             	xorps  xmm0,xmm0
   14058de1b:	0f b7 0d 3c c3 3f 00 	movzx  ecx,WORD PTR [rip+0x3fc33c]        # 0x14098a15e
   14058de22:	0f 57 d2             	xorps  xmm2,xmm2
   14058de25:	0f 57 db             	xorps  xmm3,xmm3
   14058de28:	33 d2                	xor    edx,edx
   14058de2a:	f3 48 0f 2a d0       	cvtsi2ss xmm2,rax
   14058de2f:	8b 05 1f c3 3f 00    	mov    eax,DWORD PTR [rip+0x3fc31f]        # 0x14098a154
   14058de35:	f3 48 0f 2a d8       	cvtsi2ss xmm3,rax
   14058de3a:	41 8b 85 7c 02 00 00 	mov    eax,DWORD PTR [r13+0x27c]
   14058de41:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058de46:	f3 0f 59 ca          	mulss  xmm1,xmm2
   14058de4a:	f3 0f 58 c8          	addss  xmm1,xmm0
   14058de4e:	f3 0f 5e cb          	divss  xmm1,xmm3
   14058de52:	f3 0f 11 0d 6e cc ab 	movss  DWORD PTR [rip+0x14abcc6e],xmm1        # 0x15504aac8
   14058de59:	14 
   14058de5a:	0f 57 c9             	xorps  xmm1,xmm1
   14058de5d:	41 8b 85 9c 02 00 00 	mov    eax,DWORD PTR [r13+0x29c]
   14058de64:	66 41 0f 6e 85 c4 02 	movd   xmm0,DWORD PTR [r13+0x2c4]
   14058de6b:	00 00 
   14058de6d:	c1 e0 03             	shl    eax,0x3
   14058dfba:	74 15                	je     0x14058dfd1
   14058dfbc:	0f b7 05 8f c1 3f 00 	movzx  eax,WORD PTR [rip+0x3fc18f]        # 0x14098a152
   14058dfc3:	89 44 24 54          	mov    DWORD PTR [rsp+0x54],eax
   14058dfc7:	3b c6                	cmp    eax,esi
   14058dfc9:	0f 85 5e 02 00 00    	jne    0x14058e22d
   14058dfcf:	eb 04                	jmp    0x14058dfd5
   14058dfd1:	89 74 24 54          	mov    DWORD PTR [rsp+0x54],esi
   14058dfd5:	44 0f b7 35 81 c1 3f 	movzx  r14d,WORD PTR [rip+0x3fc181]        # 0x14098a15e
   14058dfdc:	00 
   14058dfdd:	48 8d 74 24 68       	lea    rsi,[rsp+0x68]
   14058dfe2:	4c 89 64 24 60       	mov    QWORD PTR [rsp+0x60],r12
   14058dfe7:	4c 8d 7c 24 48       	lea    r15,[rsp+0x48]
   14058dfec:	45 8b ee             	mov    r13d,r14d
   14058dfef:	41 bc 02 00 00 00    	mov    r12d,0x2
   14058dff5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14058dffc:	00 00 00 00 
   14058e000:	41 8b 07             	mov    eax,DWORD PTR [r15]
   14058e003:	48 8d 5c 24 60       	lea    rbx,[rsp+0x60]
   14058e008:	c1 e0 03             	shl    eax,0x3
   14058e00b:	33 d2                	xor    edx,edx
   14058e00d:	41 f7 f5             	div    r13d
   14058e010:	44 8b d8             	mov    r11d,eax
   14058e013:	41 d1 eb             	shr    r11d,1
   14058e016:	45 33 d2             	xor    r10d,r10d
   14058e019:	41 8d 7a 02          	lea    edi,[r10+0x2]
   14058e01d:	0f 1f 00             	nop    DWORD PTR [rax]
   14058e135:	e8 26 d4 08 00       	call   0x14061b560
   14058e13a:	48 89 44 1d 88       	mov    QWORD PTR [rbp+rbx*1-0x78],rax
   14058e13f:	45 8b dc             	mov    r11d,r12d
   14058e142:	45 8b c4             	mov    r8d,r12d
   14058e145:	45 85 ff             	test   r15d,r15d
   14058e148:	0f 84 a7 00 00 00    	je     0x14058e1f5
   14058e14e:	4d 8b cc             	mov    r9,r12
   14058e151:	66 83 3d 05 c0 3f 00 	cmp    WORD PTR [rip+0x3fc005],0x8        # 0x14098a15e
   14058e158:	08 
   14058e159:	43 8d 04 00          	lea    eax,[r8+r8*1]
   14058e15d:	8b c8                	mov    ecx,eax
   14058e15f:	41 8d 14 03          	lea    edx,[r11+rax*1]
   14058e163:	48 8b 44 1c 68       	mov    rax,QWORD PTR [rsp+rbx*1+0x68]
   14058e168:	75 44                	jne    0x14058e1ae
   14058e16a:	44 0f b6 14 01       	movzx  r10d,BYTE PTR [rcx+rax*1]
   14058e16f:	0f b6 0c 02          	movzx  ecx,BYTE PTR [rdx+rax*1]
   14058e173:	40 84 ff             	test   dil,dil
   14058e176:	74 1d                	je     0x14058e195
   14058e178:	40 84 f6             	test   sil,sil
   14058e17b:	74 18                	je     0x14058e195
   14058e17d:	0f b6 d1             	movzx  edx,cl
   14058e180:	41 0f b6 c2          	movzx  eax,r10b
   14058e184:	03 d0                	add    edx,eax
   14058e186:	41 8b c8             	mov    ecx,r8d
   14058e189:	48 8b 44 1d 88       	mov    rax,QWORD PTR [rbp+rbx*1-0x78]
   14058e18e:	d1 ea                	shr    edx,1
   14058e1f5:	41 ff c3             	inc    r11d
   14058e1f8:	41 83 fb 02          	cmp    r11d,0x2
   14058e1fc:	0f 8c 40 ff ff ff    	jl     0x14058e142
   14058e202:	49 83 c5 04          	add    r13,0x4
   14058e206:	48 83 c3 08          	add    rbx,0x8
   14058e20a:	48 83 6c 24 60 01    	sub    QWORD PTR [rsp+0x60],0x1
   14058e210:	74 0d                	je     0x14058e21f
   14058e212:	44 0f b7 35 44 bf 3f 	movzx  r14d,WORD PTR [rip+0x3fbf44]        # 0x14098a15e
   14058e219:	00 
   14058e21a:	e9 e1 fe ff ff       	jmp    0x14058e100
   14058e21f:	4c 8b 7d c0          	mov    r15,QWORD PTR [rbp-0x40]
   14058e223:	be 02 00 00 00       	mov    esi,0x2
   14058e228:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   14058e22d:	8b 0d 91 a4 2c 17    	mov    ecx,DWORD PTR [rip+0x172ca491]        # 0x1578586c4
   14058e233:	48 8d 7d 88          	lea    rdi,[rbp-0x78]
   14058e237:	4c 89 64 24 58       	mov    QWORD PTR [rsp+0x58],r12
   14058e23c:	49 8b dc             	mov    rbx,r12
   14058e23f:	41 be 02 00 00 00    	mov    r14d,0x2
   14058e245:	4c 8b 0f             	mov    r9,QWORD PTR [rdi]
   14058e248:	4d 85 c9             	test   r9,r9
   14058e24b:	74 51                	je     0x14058e29e
   14058e24d:	44 8b 44 1c 48       	mov    r8d,DWORD PTR [rsp+rbx*1+0x48]
   14058e252:	33 d2                	xor    edx,edx
   14058e254:	41 8b c0             	mov    eax,r8d
   14058e257:	f7 f6                	div    esi
   14058e259:	3b c8                	cmp    ecx,eax
   14058e2e9:	80 3d c4 be 3f 00 00 	cmp    BYTE PTR [rip+0x3fbec4],0x0        # 0x14098a1b4
   14058e2f0:	44 0f b7 05 5a be 3f 	movzx  r8d,WORD PTR [rip+0x3fbe5a]        # 0x14098a152
   14058e2f7:	00 
   14058e2f8:	75 06                	jne    0x14058e300
   14058e2fa:	41 b8 01 00 00 00    	mov    r8d,0x1
   14058e300:	41 8b 85 9c 02 00 00 	mov    eax,DWORD PTR [r13+0x29c]
   14058e307:	33 d2                	xor    edx,edx
   14058e309:	0f b7 0d 4e be 3f 00 	movzx  ecx,WORD PTR [rip+0x3fbe4e]        # 0x14098a15e
   14058e310:	0f 57 c9             	xorps  xmm1,xmm1
   14058e313:	c1 e0 03             	shl    eax,0x3
   14058e316:	0f 57 c0             	xorps  xmm0,xmm0
   14058e319:	f7 f1                	div    ecx
   14058e31b:	33 d2                	xor    edx,edx
   14058e31d:	41 f7 f0             	div    r8d
   14058e320:	8b 54 24 58          	mov    edx,DWORD PTR [rsp+0x58]
   14058e324:	03 54 24 5c          	add    edx,DWORD PTR [rsp+0x5c]
   14058e328:	8b c8                	mov    ecx,eax
   14058e32a:	8b 05 24 be 3f 00    	mov    eax,DWORD PTR [rip+0x3fbe24]        # 0x14098a154
   14058e330:	f3 48 0f 2a c9       	cvtsi2ss xmm1,rcx
   14058e335:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14058e33a:	8b 45 a8             	mov    eax,DWORD PTR [rbp-0x58]
   14058e33d:	03 c2                	add    eax,edx
   14058e33f:	33 d2                	xor    edx,edx
   14058e341:	89 45 a8             	mov    DWORD PTR [rbp-0x58],eax
   14058e344:	8d 04 c5 00 00 00 00 	lea    eax,[rax*8+0x0]
   14058e34b:	f3 0f 5e c8          	divss  xmm1,xmm0
   14058e33d:	03 c2                	add    eax,edx
   14058e33f:	33 d2                	xor    edx,edx
   14058e341:	89 45 a8             	mov    DWORD PTR [rbp-0x58],eax
   14058e344:	8d 04 c5 00 00 00 00 	lea    eax,[rax*8+0x0]
   14058e34b:	f3 0f 5e c8          	divss  xmm1,xmm0
   14058e34f:	f3 41 0f 11 8d c8 02 	movss  DWORD PTR [r13+0x2c8],xmm1
   14058e356:	00 00 
   14058e358:	0f b7 0d ff bd 3f 00 	movzx  ecx,WORD PTR [rip+0x3fbdff]        # 0x14098a15e
   14058e35f:	f7 f1                	div    ecx
   14058e361:	ba 10 00 00 00       	mov    edx,0x10
   14058e366:	49 8b cf             	mov    rcx,r15
   14058e369:	89 45 ac             	mov    DWORD PTR [rbp-0x54],eax
   14058e36c:	ff 15 46 b4 0f 00    	call   QWORD PTR [rip+0xfb446]        # 0x1406897b8
   14058e372:	8b 55 b0             	mov    edx,DWORD PTR [rbp-0x50]
   14058e375:	45 33 c0             	xor    r8d,r8d
   14058e378:	49 8b cf             	mov    rcx,r15
   14058e37b:	ff 15 3f b4 0f 00    	call   QWORD PTR [rip+0xfb43f]        # 0x1406897c0
   14058e381:	8b 45 a8             	mov    eax,DWORD PTR [rbp-0x58]
   14058e384:	48 8d 54 24 50       	lea    rdx,[rsp+0x50]
   14058e389:	41 b8 04 00 00 00    	mov    r8d,0x4
   14058e38f:	89 44 24 50          	mov    DWORD PTR [rsp+0x50],eax
   14058e393:	49 8b cf             	mov    rcx,r15
   14058e396:	ff 15 fc b3 0f 00    	call   QWORD PTR [rip+0xfb3fc]        # 0x140689798
   14058e39c:	ba 10 00 00 00       	mov    edx,0x10
   14058e3a1:	49 8b cf             	mov    rcx,r15
   14058e3a4:	ff 15 0e b4 0f 00    	call   QWORD PTR [rip+0xfb40e]        # 0x1406897b8
   14058e764:	e8 47 78 dd ff       	call   0x140365fb0
   14058e769:	89 47 24             	mov    DWORD PTR [rdi+0x24],eax
   14058e76c:	0f b7 1d df b9 3f 00 	movzx  ebx,WORD PTR [rip+0x3fb9df]        # 0x14098a152
   14058e773:	66 83 fb 01          	cmp    bx,0x1
   14058e777:	75 35                	jne    0x14058e7ae
   14058e779:	b8 02 00 00 00       	mov    eax,0x2
   14058e77e:	66 89 05 cd b9 3f 00 	mov    WORD PTR [rip+0x3fb9cd],ax        # 0x14098a152
   14058e785:	0f b7 05 d2 b9 3f 00 	movzx  eax,WORD PTR [rip+0x3fb9d2]        # 0x14098a15e
   14058e78c:	03 c0                	add    eax,eax
   14058e78e:	99                   	cdq
   14058e78f:	83 e2 07             	and    edx,0x7
   14058e792:	03 c2                	add    eax,edx
   14058e794:	c1 f8 03             	sar    eax,0x3
   14058e797:	66 89 05 be b9 3f 00 	mov    WORD PTR [rip+0x3fb9be],ax        # 0x14098a15c
   14058e79e:	0f b7 c8             	movzx  ecx,ax
   14058e7a1:	0f af 0d ac b9 3f 00 	imul   ecx,DWORD PTR [rip+0x3fb9ac]        # 0x14098a154
   14058e7a8:	89 0d aa b9 3f 00    	mov    DWORD PTR [rip+0x3fb9aa],ecx        # 0x14098a158
   14058e7ae:	48 8b 0d e3 9c 2c 17 	mov    rcx,QWORD PTR [rip+0x172c9ce3]        # 0x157858498
   14058e7b5:	48 85 c9             	test   rcx,rcx
   14058e7b8:	74 15                	je     0x14058e7cf
   14058e7ba:	48 8b 01             	mov    rax,QWORD PTR [rcx]
   14058e7bd:	ff 50 10             	call   QWORD PTR [rax+0x10]
   14058e7c0:	45 33 f6             	xor    r14d,r14d
   14058e7c3:	41 8b ce             	mov    ecx,r14d
   14058e7c6:	48 89 0d cb 9c 2c 17 	mov    QWORD PTR [rip+0x172c9ccb],rcx        # 0x157858498
   14058e7cd:	eb 03                	jmp    0x14058e7d2
   14058e8d4:	c7 05 0a f9 3d 00 cd 	mov    DWORD PTR [rip+0x3df90a],0x3dcccccd        # 0x14096e1e8
   14058e8db:	cc cc 3d 
   14058e8de:	c6 05 9d 9b 2c 17 00 	mov    BYTE PTR [rip+0x172c9b9d],0x0        # 0x157858482
   14058e8e5:	66 83 fb 01          	cmp    bx,0x1
   14058e8e9:	75 26                	jne    0x14058e911
   14058e8eb:	66 44 89 3d 5f b8 3f 	mov    WORD PTR [rip+0x3fb85f],r15w        # 0x14098a152
   14058e8f2:	00 
   14058e8f3:	0f b7 05 64 b8 3f 00 	movzx  eax,WORD PTR [rip+0x3fb864]        # 0x14098a15e
   14058e8fa:	c1 e8 03             	shr    eax,0x3
   14058e8fd:	66 89 05 58 b8 3f 00 	mov    WORD PTR [rip+0x3fb858],ax        # 0x14098a15c
   14058e904:	0f af 05 49 b8 3f 00 	imul   eax,DWORD PTR [rip+0x3fb849]        # 0x14098a154
   14058e90b:	89 05 47 b8 3f 00    	mov    DWORD PTR [rip+0x3fb847],eax        # 0x14098a158
   14058e911:	44 89 3d 6c 9b 2c 17 	mov    DWORD PTR [rip+0x172c9b6c],r15d        # 0x157858484
   14058e918:	c6 05 b1 77 97 14 00 	mov    BYTE PTR [rip+0x149777b1],0x0        # 0x154f060d0
   14058e91f:	44 89 3d f6 79 97 14 	mov    DWORD PTR [rip+0x149779f6],r15d        # 0x154f0631c
   14058e926:	c6 05 f3 79 97 14 00 	mov    BYTE PTR [rip+0x149779f3],0x0        # 0x154f06320
   14058e92d:	c6 05 04 97 2a 17 00 	mov    BYTE PTR [rip+0x172a9704],0x0        # 0x157838038
   14058e934:	c7 05 6e b0 3a 00 ff 	mov    DWORD PTR [rip+0x3ab06e],0xffffffff        # 0x1409399ac
   14058e93b:	ff ff ff 
   14058e93e:	c6 05 8d 77 97 14 00 	mov    BYTE PTR [rip+0x1497778d],0x0        # 0x154f060d2
   14058e945:	c6 05 85 77 97 14 01 	mov    BYTE PTR [rip+0x14977785],0x1        # 0x154f060d1
   14058e94c:	44 8b 37             	mov    r14d,DWORD PTR [rdi]
   14058e94f:	48 8b 1d 82 9d 2c 17 	mov    rbx,QWORD PTR [rip+0x172c9d82]        # 0x1578586d8
   14058e956:	48 85 db             	test   rbx,rbx
   14058e959:	74 1e                	je     0x14058e979
   14058e95b:	48 8b cb             	mov    rcx,rbx
