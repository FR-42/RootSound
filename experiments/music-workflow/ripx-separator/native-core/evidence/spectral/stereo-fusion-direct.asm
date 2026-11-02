
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403358f0 <.text+0x3348f0>:
   1403358f0:	83 3d b1 40 60 00 03 	cmp    DWORD PTR [rip+0x6040b1],0x3        # 0x1409399a8
   1403358f7:	44 8b 0d aa 48 65 00 	mov    r9d,DWORD PTR [rip+0x6548aa]        # 0x14098a1a8
   1403358fe:	73 05                	jae    0x140335905
   140335900:	45 32 c0             	xor    r8b,r8b
   140335903:	eb 25                	jmp    0x14033592a
   140335905:	48 8d 45 80          	lea    rax,[rbp-0x80]
   140335909:	44 0f af cb          	imul   r9d,ebx
   14033590d:	41 b0 01             	mov    r8b,0x1
   140335910:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140335915:	49 8b d4             	mov    rdx,r12
   140335918:	48 8b cf             	mov    rcx,rdi
   14033591b:	e8 60 0f ff ff       	call   0x140326880
   140335920:	44 8b 0d 81 48 65 00 	mov    r9d,DWORD PTR [rip+0x654881]        # 0x14098a1a8
   140335927:	41 b0 02             	mov    r8b,0x2
   14033592a:	48 8d 45 80          	lea    rax,[rbp-0x80]
   14033592e:	44 0f af cb          	imul   r9d,ebx
   140335932:	49 8b d4             	mov    rdx,r12
   140335935:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   14033593a:	48 8b cf             	mov    rcx,rdi
   14033593d:	e8 3e 0f ff ff       	call   0x140326880
   140335942:	8b 8f bc 00 00 00    	mov    ecx,DWORD PTR [rdi+0xbc]
   140335948:	ff c3                	inc    ebx
   14033594a:	03 ce                	add    ecx,esi
   14033594c:	3b d9                	cmp    ebx,ecx
   14033594e:	7c a0                	jl     0x1403358f0
   140335950:	48 8b 5d 88          	mov    rbx,QWORD PTR [rbp-0x78]
   140335954:	48 8b 55 80          	mov    rdx,QWORD PTR [rbp-0x80]
   140335958:	48 8b ca             	mov    rcx,rdx
   14033595b:	ff 15 af 40 35 00    	call   QWORD PTR [rip+0x3540af]        # 0x140689a10
   140335961:	48 8b cb             	mov    rcx,rbx
   140335964:	ff 15 a6 40 35 00    	call   QWORD PTR [rip+0x3540a6]        # 0x140689a10
   14033596a:	8b 8f bc 00 00 00    	mov    ecx,DWORD PTR [rdi+0xbc]
   140335970:	45 8b fd             	mov    r15d,r13d
   140335973:	f3 0f 10 35 b5 a6 51 	movss  xmm6,DWORD PTR [rip+0x51a6b5]        # 0x140850030
   14033597a:	00 
   14033597b:	03 ce                	add    ecx,esi
   14033597d:	f3 44 0f 10 15 82 1f 	movss  xmm10,DWORD PTR [rip+0x371f82]        # 0x1406a7908
   140335984:	37 00 
   140335986:	44 3b e9             	cmp    r13d,ecx
   140335989:	0f 8d cd 03 00 00    	jge    0x140335d5c
   14033598f:	8b 3d c3 46 65 00    	mov    edi,DWORD PTR [rip+0x6546c3]        # 0x14098a058
   140335995:	49 81 c4 90 04 00 00 	add    r12,0x490
   14033599c:	f3 44 0f 10 0d 73 18 	movss  xmm9,DWORD PTR [rip+0x361873]        # 0x140697218
   1403359a3:	36 00 
   1403359a5:	f3 44 0f 10 05 12 88 	movss  xmm8,DWORD PTR [rip+0x358812]        # 0x14068e1c0
   1403359ac:	35 00 
   1403359ae:	44 8b 05 f3 3f 60 00 	mov    r8d,DWORD PTR [rip+0x603ff3]        # 0x1409399a8
   1403359b5:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   1403359ba:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   1403359bf:	4c 89 65 80          	mov    QWORD PTR [rbp-0x80],r12
   1403359c3:	eb 0e                	jmp    0x1403359d3
   1403359c5:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   1403359cc:	00 00 00 00 
   1403359d0:	45 33 f6             	xor    r14d,r14d
   1403359d3:	45 8b df             	mov    r11d,r15d
   1403359d6:	48 8d 95 00 02 00 00 	lea    rdx,[rbp+0x200]
   1403359dd:	44 2b 5b 0c          	sub    r11d,DWORD PTR [rbx+0xc]
   1403359e1:	4d 8b cc             	mov    r9,r12
   1403359e4:	44 0f af 1d 68 46 65 	imul   r11d,DWORD PTR [rip+0x654668]        # 0x14098a054
   1403359eb:	00 
   1403359ec:	41 ba 03 00 00 00    	mov    r10d,0x3
   1403359f2:	49 c1 e3 04          	shl    r11,0x4
   1403359f6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   1403359fd:	00 00 00 
   140335a00:	49 8b 09             	mov    rcx,QWORD PTR [r9]
   140335a03:	48 8d 52 08          	lea    rdx,[rdx+0x8]
   140335a07:	49 03 cb             	add    rcx,r11
   140335a0a:	4d 8d 49 38          	lea    r9,[r9+0x38]
   140335a0e:	48 89 4a f8          	mov    QWORD PTR [rdx-0x8],rcx
   140335a12:	49 83 ea 01          	sub    r10,0x1
   140335a16:	75 e8                	jne    0x140335a00
   140335a18:	41 83 f8 03          	cmp    r8d,0x3
   140335a1c:	41 0f 93 c2          	setae  r10b
   140335a20:	41 0f b6 c2          	movzx  eax,r10b
   140335a24:	41 3b c0             	cmp    eax,r8d
   140335a27:	0f 83 a7 00 00 00    	jae    0x140335ad4
   140335a2d:	0f 1f 00             	nop    DWORD PTR [rax]
   140335a30:	41 0f b6 c2          	movzx  eax,r10b
   140335a34:	41 8b d6             	mov    edx,r14d
   140335a37:	4c 8b 8c c5 00 02 00 	mov    r9,QWORD PTR [rbp+rax*8+0x200]
   140335a3e:	00 
   140335a3f:	85 ff                	test   edi,edi
   140335a41:	0f 8e 7d 00 00 00    	jle    0x140335ac4
   140335a47:	49 8b c9             	mov    rcx,r9
   140335a4a:	4d 8b c1             	mov    r8,r9
   140335a4d:	0f 57 d2             	xorps  xmm2,xmm2
   140335a50:	f3 0f 10 41 04       	movss  xmm0,DWORD PTR [rcx+0x4]
   140335a55:	0f 2e c2             	ucomiss xmm0,xmm2
   140335a58:	7a 02                	jp     0x140335a5c
   140335a5a:	74 53                	je     0x140335aaf
   140335a5c:	f3 0f 10 09          	movss  xmm1,DWORD PTR [rcx]
   140335a60:	0f 2e ca             	ucomiss xmm1,xmm2
   140335a63:	7a 02                	jp     0x140335a67
   140335a65:	74 48                	je     0x140335aaf
   140335a67:	f3 0f 5e c7          	divss  xmm0,xmm7
   140335a6b:	f3 0f 5c c6          	subss  xmm0,xmm6
   140335a6f:	f3 41 0f 58 c2       	addss  xmm0,xmm10
   140335a74:	f3 0f 2c c0          	cvttss2si eax,xmm0
   140335a78:	3b c2                	cmp    eax,edx
   140335a7a:	74 33                	je     0x140335aaf
   140335a7c:	85 c0                	test   eax,eax
   140335a7e:	78 2f                	js     0x140335aaf
   140335a80:	3b c7                	cmp    eax,edi
   140335a82:	7d 2b                	jge    0x140335aaf
   140335a84:	48 98                	cdqe
   140335a86:	48 03 c0             	add    rax,rax
   140335a89:	f3 41 0f 10 44 c1 04 	movss  xmm0,DWORD PTR [r9+rax*8+0x4]
   140335a90:	0f 2e c2             	ucomiss xmm0,xmm2
   140335a93:	7a 02                	jp     0x140335a97
   140335a95:	74 07                	je     0x140335a9e
   140335a97:	41 0f 2f 0c c1       	comiss xmm1,DWORD PTR [r9+rax*8]
   140335a9c:	76 11                	jbe    0x140335aaf
   140335a9e:	0f 10 01             	movups xmm0,XMMWORD PTR [rcx]
   140335aa1:	41 0f 11 04 c1       	movups XMMWORD PTR [r9+rax*8],xmm0
   140335aa6:	33 c0                	xor    eax,eax
   140335aa8:	49 89 00             	mov    QWORD PTR [r8],rax
   140335aab:	49 89 40 08          	mov    QWORD PTR [r8+0x8],rax
   140335aaf:	ff c2                	inc    edx
   140335ab1:	49 83 c0 10          	add    r8,0x10
   140335ab5:	48 83 c1 10          	add    rcx,0x10
   140335ab9:	3b d7                	cmp    edx,edi
   140335abb:	7c 93                	jl     0x140335a50
   140335abd:	44 8b 05 e4 3e 60 00 	mov    r8d,DWORD PTR [rip+0x603ee4]        # 0x1409399a8
   140335ac4:	41 fe c2             	inc    r10b
   140335ac7:	41 0f b6 c2          	movzx  eax,r10b
   140335acb:	41 3b c0             	cmp    eax,r8d
   140335ace:	0f 82 5c ff ff ff    	jb     0x140335a30
   140335ad4:	41 83 f8 03          	cmp    r8d,0x3
   140335ad8:	0f 82 5f 02 00 00    	jb     0x140335d3d
   140335ade:	8b 0d 70 45 65 00    	mov    ecx,DWORD PTR [rip+0x654570]        # 0x14098a054
   140335ae4:	41 8b c7             	mov    eax,r15d
   140335ae7:	2b 43 0c             	sub    eax,DWORD PTR [rbx+0xc]
   140335aea:	44 8b c1             	mov    r8d,ecx
   140335aed:	0f af c1             	imul   eax,ecx
   140335af0:	33 d2                	xor    edx,edx
   140335af2:	49 c1 e0 04          	shl    r8,0x4
   140335af6:	8b d8                	mov    ebx,eax
   140335af8:	48 c1 e3 04          	shl    rbx,0x4
   140335afc:	49 03 1c 24          	add    rbx,QWORD PTR [r12]
   140335b00:	48 8b cb             	mov    rcx,rbx
   140335b03:	e8 e2 b1 2e 00       	call   0x140620cea
   140335b08:	85 ff                	test   edi,edi
   140335b0a:	0f 8e 21 02 00 00    	jle    0x140335d31
   140335b10:	48 8b 85 10 02 00 00 	mov    rax,QWORD PTR [rbp+0x210]
   140335b17:	41 bd 08 00 00 00    	mov    r13d,0x8
   140335b1d:	48 8b b5 08 02 00 00 	mov    rsi,QWORD PTR [rbp+0x208]
   140335b24:	49 c7 c3 fc ff ff ff 	mov    r11,0xfffffffffffffffc
   140335b2b:	f3 0f 10 3d 7d 86 35 	movss  xmm7,DWORD PTR [rip+0x35867d]        # 0x14068e1b0
   140335b32:	00 
   140335b33:	48 2b f0             	sub    rsi,rax
   140335b36:	48 2b d8             	sub    rbx,rax
   140335b39:	44 8b f7             	mov    r14d,edi
   140335b3c:	4c 2b d8             	sub    r11,rax
   140335b3f:	48 8d 50 04          	lea    rdx,[rax+0x4]
   140335b43:	41 8d 7d fc          	lea    edi,[r13-0x4]
   140335b47:	0f 57 ed             	xorps  xmm5,xmm5
   140335b4a:	45 33 e4             	xor    r12d,r12d
   140335b4d:	0f 1f 00             	nop    DWORD PTR [rax]
   140335b50:	33 c0                	xor    eax,eax
   140335b52:	48 8d 8d 08 02 00 00 	lea    rcx,[rbp+0x208]
   140335b59:	48 89 85 20 02 00 00 	mov    QWORD PTR [rbp+0x220],rax
   140335b60:	41 ba 02 00 00 00    	mov    r10d,0x2
   140335b66:	48 89 85 28 02 00 00 	mov    QWORD PTR [rbp+0x228],rax
   140335b6d:	48 89 85 30 02 00 00 	mov    QWORD PTR [rbp+0x230],rax
   140335b74:	48 89 85 38 02 00 00 	mov    QWORD PTR [rbp+0x238],rax
   140335b7b:	48 89 85 40 02 00 00 	mov    QWORD PTR [rbp+0x240],rax
   140335b82:	48 89 85 48 02 00 00 	mov    QWORD PTR [rbp+0x248],rax
   140335b89:	48 89 85 50 02 00 00 	mov    QWORD PTR [rbp+0x250],rax
   140335b90:	48 89 85 58 02 00 00 	mov    QWORD PTR [rbp+0x258],rax
   140335b97:	48 8d 85 24 02 00 00 	lea    rax,[rbp+0x224]
   140335b9e:	66 90                	xchg   ax,ax
   140335ba0:	4c 8b 01             	mov    r8,QWORD PTR [rcx]
   140335ba3:	4d 8d 0c 13          	lea    r9,[r11+rdx*1]
   140335ba7:	f3 43 0f 10 44 01 04 	movss  xmm0,DWORD PTR [r9+r8*1+0x4]
   140335bae:	0f 2e c5             	ucomiss xmm0,xmm5
   140335bb1:	7a 02                	jp     0x140335bb5
   140335bb3:	74 0f                	je     0x140335bc4
   140335bb5:	f3 43 0f 10 04 01    	movss  xmm0,DWORD PTR [r9+r8*1]
   140335bbb:	0f 2f c5             	comiss xmm0,xmm5
   140335bbe:	76 04                	jbe    0x140335bc4
   140335bc0:	f3 0f 11 00          	movss  DWORD PTR [rax],xmm0
   140335bc4:	49 03 cd             	add    rcx,r13
   140335bc7:	48 03 c7             	add    rax,rdi
   140335bca:	49 83 ea 01          	sub    r10,0x1
   140335bce:	75 d0                	jne    0x140335ba0
   140335bd0:	f3 0f 10 a5 24 02 00 	movss  xmm4,DWORD PTR [rbp+0x224]
   140335bd7:	00 
   140335bd8:	0f 2e e5             	ucomiss xmm4,xmm5
   140335bdb:	f3 0f 10 9d 28 02 00 	movss  xmm3,DWORD PTR [rbp+0x228]
   140335be2:	00 
   140335be3:	7a 18                	jp     0x140335bfd
   140335be5:	75 16                	jne    0x140335bfd
   140335be7:	0f 2e dd             	ucomiss xmm3,xmm5
   140335bea:	7a 06                	jp     0x140335bf2
   140335bec:	0f 84 18 01 00 00    	je     0x140335d0a
   140335bf2:	0f 2e e5             	ucomiss xmm4,xmm5
   140335bf5:	7a 06                	jp     0x140335bfd
   140335bf7:	0f 84 d4 00 00 00    	je     0x140335cd1
   140335bfd:	0f 2e dd             	ucomiss xmm3,xmm5
   140335c00:	7a 06                	jp     0x140335c08
   140335c02:	0f 84 c9 00 00 00    	je     0x140335cd1
   140335c08:	f3 0f 10 12          	movss  xmm2,DWORD PTR [rdx]
   140335c0c:	f3 0f 10 0c 16       	movss  xmm1,DWORD PTR [rsi+rdx*1]
   140335c11:	0f 28 c2             	movaps xmm0,xmm2
   140335c14:	f3 0f 5c c1          	subss  xmm0,xmm1
   140335c18:	0f 2f c6             	comiss xmm0,xmm6
   140335c1b:	0f 87 b0 00 00 00    	ja     0x140335cd1
   140335c21:	f3 0f 5c ca          	subss  xmm1,xmm2
   140335c25:	0f 2f ce             	comiss xmm1,xmm6
   140335c28:	0f 87 a3 00 00 00    	ja     0x140335cd1
   140335c2e:	83 3d 73 3d 60 00 03 	cmp    DWORD PTR [rip+0x603d73],0x3        # 0x1409399a8
   140335c35:	73 06                	jae    0x140335c3d
   140335c37:	41 0f b7 c4          	movzx  eax,r12w
   140335c3b:	eb 54                	jmp    0x140335c91
   140335c3d:	0f 2f dd             	comiss xmm3,xmm5
   140335c40:	77 0f                	ja     0x140335c51
   140335c42:	0f 2f e5             	comiss xmm4,xmm5
   140335c45:	77 0a                	ja     0x140335c51
   140335c47:	0f 28 cd             	movaps xmm1,xmm5
   140335c4a:	f3 41 0f 58 ca       	addss  xmm1,xmm10
   140335c4f:	eb 28                	jmp    0x140335c79
   140335c51:	0f 28 c3             	movaps xmm0,xmm3
   140335c54:	0f 28 cb             	movaps xmm1,xmm3
   140335c57:	f3 0f 58 c4          	addss  xmm0,xmm4
   140335c5b:	f3 0f 5e c8          	divss  xmm1,xmm0
   140335c5f:	f3 41 0f 59 c9       	mulss  xmm1,xmm9
   140335c64:	f3 0f 5c cf          	subss  xmm1,xmm7
   140335c68:	0f 2f cd             	comiss xmm1,xmm5
   140335c6b:	72 07                	jb     0x140335c74
   140335c6d:	f3 41 0f 58 ca       	addss  xmm1,xmm10
   140335c72:	eb 05                	jmp    0x140335c79
   140335c74:	f3 41 0f 5c ca       	subss  xmm1,xmm10
   140335c79:	0f 2f f9             	comiss xmm7,xmm1
   140335c7c:	76 0c                	jbe    0x140335c8a
   140335c7e:	41 0f 2f c8          	comiss xmm1,xmm8
   140335c82:	77 09                	ja     0x140335c8d
   140335c84:	41 0f 28 c8          	movaps xmm1,xmm8
   140335c88:	eb 03                	jmp    0x140335c8d
   140335c8a:	0f 28 cf             	movaps xmm1,xmm7
   140335c8d:	f3 0f 2c c1          	cvttss2si eax,xmm1
   140335c91:	0f 28 d3             	movaps xmm2,xmm3
   140335c94:	66 89 44 13 04       	mov    WORD PTR [rbx+rdx*1+0x4],ax
   140335c99:	0f 28 cb             	movaps xmm1,xmm3
   140335c9c:	f3 0f 58 d4          	addss  xmm2,xmm4
   140335ca0:	f3 0f 59 0a          	mulss  xmm1,DWORD PTR [rdx]
   140335ca4:	0f 28 c4             	movaps xmm0,xmm4
   140335ca7:	f3 0f 59 04 16       	mulss  xmm0,DWORD PTR [rsi+rdx*1]
   140335cac:	f3 0f 59 db          	mulss  xmm3,xmm3
   140335cb0:	f3 0f 59 e4          	mulss  xmm4,xmm4
   140335cb4:	f3 0f 58 c8          	addss  xmm1,xmm0
   140335cb8:	f3 0f 58 dc          	addss  xmm3,xmm4
   140335cbc:	f3 0f 5e ca          	divss  xmm1,xmm2
   140335cc0:	f3 0f 5e da          	divss  xmm3,xmm2
   140335cc4:	f3 0f 11 0c 13       	movss  DWORD PTR [rbx+rdx*1],xmm1
   140335cc9:	f3 0f 11 5c 13 fc    	movss  DWORD PTR [rbx+rdx*1-0x4],xmm3
   140335ccf:	eb 39                	jmp    0x140335d0a
   140335cd1:	0f 2f e3             	comiss xmm4,xmm3
   140335cd4:	b8 10 00 00 00       	mov    eax,0x10
   140335cd9:	66 44 89 64 13 04    	mov    WORD PTR [rbx+rdx*1+0x4],r12w
   140335cdf:	49 0f 47 c5          	cmova  rax,r13
   140335ce3:	48 8b 8c 05 00 02 00 	mov    rcx,QWORD PTR [rbp+rax*1+0x200]
   140335cea:	00 
   140335ceb:	49 03 cb             	add    rcx,r11
   140335cee:	0f 2f e3             	comiss xmm4,xmm3
   140335cf1:	8b 44 11 04          	mov    eax,DWORD PTR [rcx+rdx*1+0x4]
   140335cf5:	89 04 13             	mov    DWORD PTR [rbx+rdx*1],eax
   140335cf8:	49 8b c5             	mov    rax,r13
   140335cfb:	48 0f 47 c7          	cmova  rax,rdi
   140335cff:	8b 84 05 20 02 00 00 	mov    eax,DWORD PTR [rbp+rax*1+0x220]
   140335d06:	89 44 13 fc          	mov    DWORD PTR [rbx+rdx*1-0x4],eax
   140335d0a:	48 83 c2 10          	add    rdx,0x10
   140335d0e:	49 83 ee 01          	sub    r14,0x1
   140335d12:	0f 85 38 fe ff ff    	jne    0x140335b50
   140335d18:	f3 0f 10 7c 24 60    	movss  xmm7,DWORD PTR [rsp+0x60]
   140335d1e:	8b 3d 34 43 65 00    	mov    edi,DWORD PTR [rip+0x654334]        # 0x14098a058
   140335d24:	4c 8b 65 80          	mov    r12,QWORD PTR [rbp-0x80]
   140335d28:	4c 8b 6c 24 58       	mov    r13,QWORD PTR [rsp+0x58]
   140335d2d:	8b 74 24 4c          	mov    esi,DWORD PTR [rsp+0x4c]
   140335d31:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   140335d36:	44 8b 05 6b 3c 60 00 	mov    r8d,DWORD PTR [rip+0x603c6b]        # 0x1409399a8
   140335d3d:	41 8b 8d bc 00 00 00 	mov    ecx,DWORD PTR [r13+0xbc]
   140335d44:	41 ff c7             	inc    r15d
   140335d47:	03 ce                	add    ecx,esi
   140335d49:	44 3b f9             	cmp    r15d,ecx
   140335d4c:	0f 8c 7e fc ff ff    	jl     0x1403359d0
