
D:\#Software\ripx\HitnMixLibCLR.x64.dll:     file format pei-x86-64


Disassembly of section .text:

000000018004ad10 <.text+0x49d10>:
   18004ad10:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   18004ad15:	48 89 6c 24 18       	mov    QWORD PTR [rsp+0x18],rbp
   18004ad1a:	56                   	push   rsi
   18004ad1b:	57                   	push   rdi
   18004ad1c:	41 54                	push   r12
   18004ad1e:	41 55                	push   r13
   18004ad20:	41 56                	push   r14
   18004ad22:	48 83 ec 20          	sub    rsp,0x20
   18004ad26:	8b 44 24 70          	mov    eax,DWORD PTR [rsp+0x70]
   18004ad2a:	4c 8b f2             	mov    r14,rdx
   18004ad2d:	44 0f b7 15 19 7f 06 	movzx  r10d,WORD PTR [rip+0x67f19]        # 0x1800b2c4e
   18004ad34:	00 
   18004ad35:	49 8b f1             	mov    rsi,r9
   18004ad38:	4d 8b e0             	mov    r12,r8
   18004ad3b:	48 8b d9             	mov    rbx,rcx
   18004ad3e:	8d 04 c5 00 00 00 00 	lea    eax,[rax*8+0x0]
   18004ad45:	99                   	cdq
   18004ad46:	41 f7 fa             	idiv   r10d
   18004ad49:	48 63 f8             	movsxd rdi,eax
   18004ad4c:	41 0f b7 46 0e       	movzx  eax,WORD PTR [r14+0xe]
   18004ad51:	4c 8b ef             	mov    r13,rdi
   18004ad54:	66 83 f8 08          	cmp    ax,0x8
   18004ad58:	0f 85 b2 01 00 00    	jne    0x18004af10
   18004ad5e:	0f b6 6c 24 78       	movzx  ebp,BYTE PTR [rsp+0x78]
   18004ad63:	40 84 ed             	test   bpl,bpl
   18004ad66:	75 43                	jne    0x18004adab
   18004ad68:	48 8b 89 a0 02 00 00 	mov    rcx,QWORD PTR [rcx+0x2a0]
   18004ad6f:	48 85 c9             	test   rcx,rcx
   18004ad72:	74 05                	je     0x18004ad79
   18004ad74:	e8 1b c2 fc ff       	call   0x180016f94
   18004ad79:	41 0f b7 46 02       	movzx  eax,WORD PTR [r14+0x2]
   18004ad7e:	0f af c7             	imul   eax,edi
   18004ad81:	48 63 c8             	movsxd rcx,eax
   18004ad84:	e8 13 c2 fc ff       	call   0x180016f9c
   18004ad89:	48 89 83 a0 02 00 00 	mov    QWORD PTR [rbx+0x2a0],rax
   18004ad90:	48 8b d0             	mov    rdx,rax
   18004ad93:	45 0f b7 46 02       	movzx  r8d,WORD PTR [r14+0x2]
   18004ad98:	49 8b cc             	mov    rcx,r12
   18004ad9b:	44 0f af c7          	imul   r8d,edi
   18004ad9f:	ff 15 63 75 03 00    	call   QWORD PTR [rip+0x37563]        # 0x180082308
   18004ada5:	89 83 b0 02 00 00    	mov    DWORD PTR [rbx+0x2b0],eax
   18004adab:	45 33 db             	xor    r11d,r11d
   18004adae:	85 ff                	test   edi,edi
   18004adb0:	0f 8e 4e 03 00 00    	jle    0x18004b104
   18004adb6:	40 0f b6 ed          	movzx  ebp,bpl
   18004adba:	45 8d 63 01          	lea    r12d,[r11+0x1]
   18004adbe:	66 90                	xchg   ax,ax
   18004adc0:	8b cd                	mov    ecx,ebp
   18004adc2:	85 ed                	test   ebp,ebp
   18004adc4:	74 55                	je     0x18004ae1b
   18004adc6:	41 2b cc             	sub    ecx,r12d
   18004adc9:	74 32                	je     0x18004adfd
   18004adcb:	41 3b cc             	cmp    ecx,r12d
   18004adce:	0f 85 28 01 00 00    	jne    0x18004aefc
   18004add4:	41 0f b7 4e 02       	movzx  ecx,WORD PTR [r14+0x2]
   18004add9:	48 8b 93 a0 02 00 00 	mov    rdx,QWORD PTR [rbx+0x2a0]
   18004ade0:	8d 41 ff             	lea    eax,[rcx-0x1]
   18004ade3:	41 3b c4             	cmp    eax,r12d
   18004ade6:	41 0f 4f c4          	cmovg  eax,r12d
   18004adea:	41 0f af cb          	imul   ecx,r11d
   18004adee:	03 c1                	add    eax,ecx
   18004adf0:	48 98                	cdqe
   18004adf2:	0f b6 0c 10          	movzx  ecx,BYTE PTR [rax+rdx*1]
   18004adf6:	88 0e                	mov    BYTE PTR [rsi],cl
   18004adf8:	e9 ff 00 00 00       	jmp    0x18004aefc
   18004adfd:	41 0f b7 46 02       	movzx  eax,WORD PTR [r14+0x2]
   18004ae02:	41 0f af c3          	imul   eax,r11d
   18004ae06:	48 63 c8             	movsxd rcx,eax
   18004ae09:	48 8b 83 a0 02 00 00 	mov    rax,QWORD PTR [rbx+0x2a0]
   18004ae10:	0f b6 0c 01          	movzx  ecx,BYTE PTR [rcx+rax*1]
   18004ae14:	88 0e                	mov    BYTE PTR [rsi],cl
   18004ae16:	e9 e1 00 00 00       	jmp    0x18004aefc
   18004ae1b:	45 0f b7 46 02       	movzx  r8d,WORD PTR [r14+0x2]
   18004ae20:	45 33 c9             	xor    r9d,r9d
   18004ae23:	33 c0                	xor    eax,eax
   18004ae25:	45 85 c0             	test   r8d,r8d
   18004ae28:	0f 84 c4 00 00 00    	je     0x18004aef2
   18004ae2e:	41 83 f8 08          	cmp    r8d,0x8
   18004ae32:	0f 82 89 00 00 00    	jb     0x18004aec1
   18004ae38:	48 8b bb a0 02 00 00 	mov    rdi,QWORD PTR [rbx+0x2a0]
   18004ae3f:	45 8b c8             	mov    r9d,r8d
   18004ae42:	45 0f af cb          	imul   r9d,r11d
   18004ae46:	45 8b d0             	mov    r10d,r8d
   18004ae49:	41 83 e2 f8          	and    r10d,0xfffffff8
   18004ae4d:	0f 57 db             	xorps  xmm3,xmm3
   18004ae50:	0f 57 d2             	xorps  xmm2,xmm2
   18004ae53:	41 83 c1 04          	add    r9d,0x4
   18004ae57:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   18004ae5e:	00 00 
   18004ae60:	0f 57 c0             	xorps  xmm0,xmm0
   18004ae63:	41 8d 49 fc          	lea    ecx,[r9-0x4]
   18004ae67:	66 0f 6e 0c 39       	movd   xmm1,DWORD PTR [rcx+rdi*1]
   18004ae6c:	83 c0 08             	add    eax,0x8
   18004ae6f:	66 0f 60 c8          	punpcklbw xmm1,xmm0
   18004ae73:	66 0f 61 c8          	punpcklwd xmm1,xmm0
   18004ae77:	66 0f fe cb          	paddd  xmm1,xmm3
   18004ae7b:	66 0f 6f d9          	movdqa xmm3,xmm1
   18004ae7f:	66 41 0f 6e 0c 39    	movd   xmm1,DWORD PTR [r9+rdi*1]
   18004ae85:	66 0f 60 c8          	punpcklbw xmm1,xmm0
   18004ae89:	45 8d 49 08          	lea    r9d,[r9+0x8]
   18004ae8d:	66 0f 61 c8          	punpcklwd xmm1,xmm0
   18004ae91:	66 0f fe ca          	paddd  xmm1,xmm2
   18004ae95:	66 0f 6f d1          	movdqa xmm2,xmm1
   18004ae99:	41 3b c2             	cmp    eax,r10d
   18004ae9c:	72 c2                	jb     0x18004ae60
   18004ae9e:	66 0f fe d3          	paddd  xmm2,xmm3
   18004aea2:	66 0f 6f c2          	movdqa xmm0,xmm2
   18004aea6:	66 0f 73 d8 08       	psrldq xmm0,0x8
   18004aeab:	66 0f fe d0          	paddd  xmm2,xmm0
   18004aeaf:	66 0f 6f c2          	movdqa xmm0,xmm2
   18004aeb3:	66 0f 73 d8 04       	psrldq xmm0,0x4
   18004aeb8:	66 0f fe d0          	paddd  xmm2,xmm0
   18004aebc:	66 41 0f 7e d1       	movd   r9d,xmm2
   18004aec1:	41 3b c0             	cmp    eax,r8d
   18004aec4:	73 2c                	jae    0x18004aef2
   18004aec6:	48 8b bb a0 02 00 00 	mov    rdi,QWORD PTR [rbx+0x2a0]
   18004aecd:	45 8b d0             	mov    r10d,r8d
   18004aed0:	45 0f af d3          	imul   r10d,r11d
   18004aed4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   18004aed8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   18004aedf:	00 
   18004aee0:	41 8d 0c 02          	lea    ecx,[r10+rax*1]
   18004aee4:	ff c0                	inc    eax
   18004aee6:	0f b6 0c 39          	movzx  ecx,BYTE PTR [rcx+rdi*1]
   18004aeea:	44 03 c9             	add    r9d,ecx
   18004aeed:	41 3b c0             	cmp    eax,r8d
   18004aef0:	72 ee                	jb     0x18004aee0
   18004aef2:	33 d2                	xor    edx,edx
   18004aef4:	41 8b c1             	mov    eax,r9d
   18004aef7:	41 f7 f0             	div    r8d
   18004aefa:	88 06                	mov    BYTE PTR [rsi],al
   18004aefc:	41 ff c3             	inc    r11d
   18004aeff:	48 ff c6             	inc    rsi
   18004af02:	4d 2b ec             	sub    r13,r12
   18004af05:	0f 85 b5 fe ff ff    	jne    0x18004adc0
   18004af0b:	e9 f4 01 00 00       	jmp    0x18004b104
   18004af10:	66 83 f8 10          	cmp    ax,0x10
   18004af14:	0f 85 ea 01 00 00    	jne    0x18004b104
   18004af1a:	4c 89 7c 24 50       	mov    QWORD PTR [rsp+0x50],r15
   18004af1f:	44 0f b6 7c 24 78    	movzx  r15d,BYTE PTR [rsp+0x78]
   18004af25:	45 84 ff             	test   r15b,r15b
   18004af28:	75 5c                	jne    0x18004af86
   18004af2a:	48 8b 89 a8 02 00 00 	mov    rcx,QWORD PTR [rcx+0x2a8]
   18004af31:	48 85 c9             	test   rcx,rcx
   18004af34:	74 05                	je     0x18004af3b
   18004af36:	e8 59 c0 fc ff       	call   0x180016f94
   18004af3b:	41 0f b7 46 02       	movzx  eax,WORD PTR [r14+0x2]
   18004af40:	0f af c7             	imul   eax,edi
   18004af43:	48 63 c8             	movsxd rcx,eax
   18004af46:	b8 02 00 00 00       	mov    eax,0x2
   18004af4b:	48 f7 e1             	mul    rcx
   18004af4e:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   18004af55:	48 0f 40 c1          	cmovo  rax,rcx
   18004af59:	48 8b c8             	mov    rcx,rax
   18004af5c:	e8 3b c0 fc ff       	call   0x180016f9c
   18004af61:	48 89 83 a8 02 00 00 	mov    QWORD PTR [rbx+0x2a8],rax
   18004af68:	48 8b d0             	mov    rdx,rax
   18004af6b:	45 0f b7 46 02       	movzx  r8d,WORD PTR [r14+0x2]
   18004af70:	49 8b cc             	mov    rcx,r12
   18004af73:	44 0f af c7          	imul   r8d,edi
   18004af77:	45 03 c0             	add    r8d,r8d
   18004af7a:	ff 15 88 73 03 00    	call   QWORD PTR [rip+0x37388]        # 0x180082308
   18004af80:	89 83 b0 02 00 00    	mov    DWORD PTR [rbx+0x2b0],eax
   18004af86:	33 ed                	xor    ebp,ebp
   18004af88:	85 ff                	test   edi,edi
   18004af8a:	0f 8e 6f 01 00 00    	jle    0x18004b0ff
   18004af90:	45 33 db             	xor    r11d,r11d
   18004af93:	45 0f b6 ff          	movzx  r15d,r15b
   18004af97:	44 8d 65 01          	lea    r12d,[rbp+0x1]
   18004af9b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   18004afa0:	41 8b cf             	mov    ecx,r15d
   18004afa3:	45 85 ff             	test   r15d,r15d
   18004afa6:	74 59                	je     0x18004b001
   18004afa8:	41 2b cc             	sub    ecx,r12d
   18004afab:	74 34                	je     0x18004afe1
   18004afad:	41 3b cc             	cmp    ecx,r12d
   18004afb0:	0f 85 3b 01 00 00    	jne    0x18004b0f1
   18004afb6:	41 0f b7 4e 02       	movzx  ecx,WORD PTR [r14+0x2]
   18004afbb:	48 8b 93 a8 02 00 00 	mov    rdx,QWORD PTR [rbx+0x2a8]
   18004afc2:	8d 41 ff             	lea    eax,[rcx-0x1]
   18004afc5:	41 3b c4             	cmp    eax,r12d
   18004afc8:	41 0f 4f c4          	cmovg  eax,r12d
   18004afcc:	0f af cd             	imul   ecx,ebp
   18004afcf:	03 c1                	add    eax,ecx
   18004afd1:	48 98                	cdqe
   18004afd3:	0f b7 0c 42          	movzx  ecx,WORD PTR [rdx+rax*2]
   18004afd7:	66 42 89 0c 5e       	mov    WORD PTR [rsi+r11*2],cx
   18004afdc:	e9 10 01 00 00       	jmp    0x18004b0f1
   18004afe1:	41 0f b7 46 02       	movzx  eax,WORD PTR [r14+0x2]
   18004afe6:	0f af c5             	imul   eax,ebp
   18004afe9:	48 63 c8             	movsxd rcx,eax
   18004afec:	48 8b 83 a8 02 00 00 	mov    rax,QWORD PTR [rbx+0x2a8]
   18004aff3:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   18004aff7:	66 42 89 0c 5e       	mov    WORD PTR [rsi+r11*2],cx
   18004affc:	e9 f0 00 00 00       	jmp    0x18004b0f1
   18004b001:	45 0f b7 4e 02       	movzx  r9d,WORD PTR [r14+0x2]
   18004b006:	45 33 c0             	xor    r8d,r8d
   18004b009:	33 d2                	xor    edx,edx
   18004b00b:	45 85 c9             	test   r9d,r9d
   18004b00e:	0f 84 be 00 00 00    	je     0x18004b0d2
   18004b014:	41 83 f9 08          	cmp    r9d,0x8
   18004b018:	0f 82 82 00 00 00    	jb     0x18004b0a0
   18004b01e:	48 8b bb a8 02 00 00 	mov    rdi,QWORD PTR [rbx+0x2a8]
   18004b025:	45 8b c1             	mov    r8d,r9d
   18004b028:	44 0f af c5          	imul   r8d,ebp
   18004b02c:	45 8b d1             	mov    r10d,r9d
   18004b02f:	41 83 e2 f8          	and    r10d,0xfffffff8
   18004b033:	0f 57 d2             	xorps  xmm2,xmm2
   18004b036:	0f 57 c9             	xorps  xmm1,xmm1
   18004b039:	41 83 c0 04          	add    r8d,0x4
   18004b03d:	0f 1f 00             	nop    DWORD PTR [rax]
   18004b040:	41 8d 40 fc          	lea    eax,[r8-0x4]
   18004b044:	83 c2 08             	add    edx,0x8
   18004b047:	f3 0f 7e 04 47       	movq   xmm0,QWORD PTR [rdi+rax*2]
   18004b04c:	66 0f 61 c0          	punpcklwd xmm0,xmm0
   18004b050:	66 0f 72 e0 10       	psrad  xmm0,0x10
   18004b055:	66 0f fe c2          	paddd  xmm0,xmm2
   18004b059:	66 0f 6f d0          	movdqa xmm2,xmm0
   18004b05d:	f3 42 0f 7e 04 47    	movq   xmm0,QWORD PTR [rdi+r8*2]
   18004b063:	66 0f 61 c0          	punpcklwd xmm0,xmm0
   18004b067:	45 8d 40 08          	lea    r8d,[r8+0x8]
   18004b06b:	66 0f 72 e0 10       	psrad  xmm0,0x10
   18004b070:	66 0f fe c1          	paddd  xmm0,xmm1
   18004b074:	66 0f 6f c8          	movdqa xmm1,xmm0
   18004b078:	41 3b d2             	cmp    edx,r10d
   18004b07b:	72 c3                	jb     0x18004b040
   18004b07d:	66 0f fe ca          	paddd  xmm1,xmm2
   18004b081:	66 0f 6f c1          	movdqa xmm0,xmm1
   18004b085:	66 0f 73 d8 08       	psrldq xmm0,0x8
   18004b08a:	66 0f fe c8          	paddd  xmm1,xmm0
   18004b08e:	66 0f 6f c1          	movdqa xmm0,xmm1
   18004b092:	66 0f 73 d8 04       	psrldq xmm0,0x4
   18004b097:	66 0f fe c8          	paddd  xmm1,xmm0
   18004b09b:	66 41 0f 7e c8       	movd   r8d,xmm1
   18004b0a0:	41 3b d1             	cmp    edx,r9d
   18004b0a3:	73 2d                	jae    0x18004b0d2
   18004b0a5:	48 8b bb a8 02 00 00 	mov    rdi,QWORD PTR [rbx+0x2a8]
   18004b0ac:	45 8b d1             	mov    r10d,r9d
   18004b0af:	44 0f af d5          	imul   r10d,ebp
   18004b0b3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   18004b0b7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   18004b0be:	00 00 
   18004b0c0:	41 8d 04 12          	lea    eax,[r10+rdx*1]
   18004b0c4:	ff c2                	inc    edx
   18004b0c6:	0f bf 04 47          	movsx  eax,WORD PTR [rdi+rax*2]
   18004b0ca:	44 03 c0             	add    r8d,eax
   18004b0cd:	41 3b d1             	cmp    edx,r9d
   18004b0d0:	72 ee                	jb     0x18004b0c0
   18004b0d2:	41 83 f9 02          	cmp    r9d,0x2
   18004b0d6:	75 0d                	jne    0x18004b0e5
   18004b0d8:	45 85 c0             	test   r8d,r8d
   18004b0db:	78 05                	js     0x18004b0e2
   18004b0dd:	41 ff c0             	inc    r8d
   18004b0e0:	eb 03                	jmp    0x18004b0e5
   18004b0e2:	41 ff c8             	dec    r8d
   18004b0e5:	41 8b c0             	mov    eax,r8d
   18004b0e8:	99                   	cdq
   18004b0e9:	41 f7 f9             	idiv   r9d
   18004b0ec:	66 42 89 04 5e       	mov    WORD PTR [rsi+r11*2],ax
   18004b0f1:	ff c5                	inc    ebp
   18004b0f3:	49 ff c3             	inc    r11
   18004b0f6:	4d 3b dd             	cmp    r11,r13
   18004b0f9:	0f 8c a1 fe ff ff    	jl     0x18004afa0
   18004b0ff:	4c 8b 7c 24 50       	mov    r15,QWORD PTR [rsp+0x50]
   18004b104:	8b 83 b0 02 00 00    	mov    eax,DWORD PTR [rbx+0x2b0]
   18004b10a:	41 0f b7 4e 02       	movzx  ecx,WORD PTR [r14+0x2]
   18004b10f:	99                   	cdq
   18004b110:	48 8b 5c 24 58       	mov    rbx,QWORD PTR [rsp+0x58]
   18004b115:	48 8b 6c 24 60       	mov    rbp,QWORD PTR [rsp+0x60]
   18004b11a:	f7 f9                	idiv   ecx
   18004b11c:	48 83 c4 20          	add    rsp,0x20
   18004b120:	41 5e                	pop    r14
   18004b122:	41 5d                	pop    r13
   18004b124:	41 5c                	pop    r12
   18004b126:	5f                   	pop    rdi
   18004b127:	5e                   	pop    rsi
   18004b128:	c3                   	ret
   18004b129:	cc                   	int3
   18004b12a:	cc                   	int3
   18004b12b:	cc                   	int3
   18004b12c:	cc                   	int3
   18004b12d:	cc                   	int3
   18004b12e:	cc                   	int3
   18004b12f:	cc                   	int3
