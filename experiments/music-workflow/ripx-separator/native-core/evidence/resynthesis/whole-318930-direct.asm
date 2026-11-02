
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140318930 <.text+0x317930>:
   140318930:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140318935:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   14031893a:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   14031893f:	48 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],rdi
   140318944:	41 54                	push   r12
   140318946:	41 56                	push   r14
   140318948:	41 57                	push   r15
   14031894a:	48 83 ec 20          	sub    rsp,0x20
   14031894e:	41 8b c0             	mov    eax,r8d
   140318951:	0f 57 c0             	xorps  xmm0,xmm0
   140318954:	41 bc 02 00 00 00    	mov    r12d,0x2
   14031895a:	48 8b d9             	mov    rbx,rcx
   14031895d:	45 8b cc             	mov    r9d,r12d
   140318960:	41 8b cc             	mov    ecx,r12d
   140318963:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140318968:	b8 04 00 00 00       	mov    eax,0x4
   14031896d:	f3 0f 59 05 47 ef 38 	mulss  xmm0,DWORD PTR [rip+0x38ef47]        # 0x1406a78bc
   140318974:	00 
   140318975:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   14031897a:	41 ff c0             	inc    r8d
   14031897d:	0f 1f 00             	nop    DWORD PTR [rax]
   140318980:	41 3b c0             	cmp    eax,r8d
   140318983:	77 0c                	ja     0x140318991
   140318985:	44 8b c8             	mov    r9d,eax
   140318988:	ff c1                	inc    ecx
   14031898a:	d1 c0                	rol    eax,1
   14031898c:	83 f9 10             	cmp    ecx,0x10
   14031898f:	72 ef                	jb     0x140318980
   140318991:	8b 4b 24             	mov    ecx,DWORD PTR [rbx+0x24]
   140318994:	8d 42 ff             	lea    eax,[rdx-0x1]
   140318997:	41 0f af c9          	imul   ecx,r9d
   14031899b:	33 d2                	xor    edx,edx
   14031899d:	03 c1                	add    eax,ecx
   14031899f:	f7 f1                	div    ecx
   1403189a1:	80 3d 4a f2 4b 17 00 	cmp    BYTE PTR [rip+0x174bf24a],0x0        # 0x1577d7bf2
   1403189a8:	44 8b f0             	mov    r14d,eax
   1403189ab:	75 1f                	jne    0x1403189cc
   1403189ad:	0f b6 15 ad 68 64 00 	movzx  edx,BYTE PTR [rip+0x6468ad]        # 0x14095f261
   1403189b4:	45 33 c0             	xor    r8d,r8d
   1403189b7:	0f b6 0d 33 f2 4b 17 	movzx  ecx,BYTE PTR [rip+0x174bf233]        # 0x1577d7bf1
   1403189be:	e8 dd bb 18 00       	call   0x1404a45a0
   1403189c3:	8b f8                	mov    edi,eax
   1403189c5:	3d 80 00 00 00       	cmp    eax,0x80
   1403189ca:	72 05                	jb     0x1403189d1
   1403189cc:	bf 80 00 00 00       	mov    edi,0x80
   1403189d1:	39 3d 95 0c 62 00    	cmp    DWORD PTR [rip+0x620c95],edi        # 0x14093966c
   1403189d7:	0f 42 3d 8e 0c 62 00 	cmovb  edi,DWORD PTR [rip+0x620c8e]        # 0x14093966c
   1403189de:	33 d2                	xor    edx,edx
   1403189e0:	8d 4a 11             	lea    ecx,[rdx+0x11]
   1403189e3:	e8 18 eb 21 00       	call   0x140537500
   1403189e8:	be 01 00 00 00       	mov    esi,0x1
   1403189ed:	84 c0                	test   al,al
   1403189ef:	74 05                	je     0x1403189f6
   1403189f1:	3b fe                	cmp    edi,esi
   1403189f3:	0f 47 fe             	cmova  edi,esi
   1403189f6:	48 8b 8b 80 00 00 00 	mov    rcx,QWORD PTR [rbx+0x80]
   1403189fd:	ba ff ff ff ff       	mov    edx,0xffffffff
   140318a02:	ff 15 48 fc 36 00    	call   QWORD PTR [rip+0x36fc48]        # 0x140688650
   140318a08:	44 3b f7             	cmp    r14d,edi
   140318a0b:	41 8b c6             	mov    eax,r14d
   140318a0e:	41 0f 42 fe          	cmovb  edi,r14d
   140318a12:	3b fe                	cmp    edi,esi
   140318a14:	0f 47 f7             	cmova  esi,edi
   140318a17:	33 d2                	xor    edx,edx
   140318a19:	f7 f6                	div    esi
   140318a1b:	33 d2                	xor    edx,edx
   140318a1d:	89 73 78             	mov    DWORD PTR [rbx+0x78],esi
   140318a20:	44 8b f8             	mov    r15d,eax
   140318a23:	8d 46 ff             	lea    eax,[rsi-0x1]
   140318a26:	41 03 c6             	add    eax,r14d
   140318a29:	f7 f6                	div    esi
   140318a2b:	80 3d c0 f1 4b 17 00 	cmp    BYTE PTR [rip+0x174bf1c0],0x0        # 0x1577d7bf2
   140318a32:	8b e8                	mov    ebp,eax
   140318a34:	8b c8                	mov    ecx,eax
   140318a36:	74 2a                	je     0x140318a62
   140318a38:	b8 10 00 00 00       	mov    eax,0x10
   140318a3d:	3b c8                	cmp    ecx,eax
   140318a3f:	0f 42 e8             	cmovb  ebp,eax
   140318a42:	33 d2                	xor    edx,edx
   140318a44:	ff c5                	inc    ebp
   140318a46:	83 e5 fe             	and    ebp,0xfffffffe
   140318a49:	8b cd                	mov    ecx,ebp
   140318a4b:	8d 45 ff             	lea    eax,[rbp-0x1]
   140318a4e:	41 03 c6             	add    eax,r14d
   140318a51:	f7 f5                	div    ebp
   140318a53:	33 d2                	xor    edx,edx
   140318a55:	8b f0                	mov    esi,eax
   140318a57:	89 43 78             	mov    DWORD PTR [rbx+0x78],eax
   140318a5a:	41 8b c6             	mov    eax,r14d
   140318a5d:	f7 f6                	div    esi
   140318a5f:	44 8b f8             	mov    r15d,eax
   140318a62:	8b c6                	mov    eax,esi
   140318a64:	83 f9 01             	cmp    ecx,0x1
   140318a67:	75 0a                	jne    0x140318a73
   140318a69:	3b f1                	cmp    esi,ecx
   140318a6b:	76 06                	jbe    0x140318a73
   140318a6d:	8d 46 ff             	lea    eax,[rsi-0x1]
   140318a70:	89 43 78             	mov    DWORD PTR [rbx+0x78],eax
   140318a73:	8b c8                	mov    ecx,eax
   140318a75:	33 f6                	xor    esi,esi
   140318a77:	b8 1c 00 00 00       	mov    eax,0x1c
   140318a7c:	8b fe                	mov    edi,esi
   140318a7e:	48 f7 e1             	mul    rcx
   140318a81:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   140318a88:	48 0f 40 c1          	cmovo  rax,rcx
   140318a8c:	48 8b c8             	mov    rcx,rax
   140318a8f:	e8 cc 2a 30 00       	call   0x14061b560
   140318a94:	f3 0f 10 0d 94 75 53 	movss  xmm1,DWORD PTR [rip+0x537594]        # 0x140850030
   140318a9b:	00 
   140318a9c:	44 8b ce             	mov    r9d,esi
   140318a9f:	48 89 43 70          	mov    QWORD PTR [rbx+0x70],rax
   140318aa3:	8b 43 78             	mov    eax,DWORD PTR [rbx+0x78]
   140318aa6:	f3 0f 5e 0d fe 16 67 	divss  xmm1,DWORD PTR [rip+0x6716fe]        # 0x14098a1ac
   140318aad:	00 
   140318aae:	85 c0                	test   eax,eax
   140318ab0:	0f 84 b7 00 00 00    	je     0x140318b6d
   140318ab6:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140318abd:	00 00 00 
   140318ac0:	8d 47 ff             	lea    eax,[rdi-0x1]
   140318ac3:	8b ce                	mov    ecx,esi
   140318ac5:	85 c0                	test   eax,eax
   140318ac7:	0f 57 c0             	xorps  xmm0,xmm0
   140318aca:	0f 4f c8             	cmovg  ecx,eax
   140318acd:	41 8b c1             	mov    eax,r9d
   140318ad0:	48 6b d0 1c          	imul   rdx,rax,0x1c
   140318ad4:	48 8b 43 70          	mov    rax,QWORD PTR [rbx+0x70]
   140318ad8:	89 0c 02             	mov    DWORD PTR [rdx+rax*1],ecx
   140318adb:	48 8b 4b 70          	mov    rcx,QWORD PTR [rbx+0x70]
   140318adf:	8b 04 0a             	mov    eax,DWORD PTR [rdx+rcx*1]
   140318ae2:	0f af 43 24          	imul   eax,DWORD PTR [rbx+0x24]
   140318ae6:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140318aeb:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140318aef:	f3 0f 11 44 0a 14    	movss  DWORD PTR [rdx+rcx*1+0x14],xmm0
   140318af5:	85 ff                	test   edi,edi
   140318af7:	75 19                	jne    0x140318b12
   140318af9:	83 fd 01             	cmp    ebp,0x1
   140318afc:	75 14                	jne    0x140318b12
   140318afe:	48 8b 43 70          	mov    rax,QWORD PTR [rbx+0x70]
   140318b02:	45 3b f4             	cmp    r14d,r12d
   140318b05:	41 8b ce             	mov    ecx,r14d
   140318b08:	41 0f 47 cc          	cmova  ecx,r12d
   140318b0c:	89 4c 02 04          	mov    DWORD PTR [rdx+rax*1+0x4],ecx
   140318b10:	eb 23                	jmp    0x140318b35
   140318b12:	8b 4b 78             	mov    ecx,DWORD PTR [rbx+0x78]
   140318b15:	41 8b c6             	mov    eax,r14d
   140318b18:	4c 8b 43 70          	mov    r8,QWORD PTR [rbx+0x70]
   140318b1c:	41 2b c9             	sub    ecx,r9d
   140318b1f:	2b c7                	sub    eax,edi
   140318b21:	41 0f af cf          	imul   ecx,r15d
   140318b25:	3b c1                	cmp    eax,ecx
   140318b27:	42 8d 04 3f          	lea    eax,[rdi+r15*1]
   140318b2b:	76 03                	jbe    0x140318b30
   140318b2d:	8d 04 2f             	lea    eax,[rdi+rbp*1]
   140318b30:	41 89 44 10 04       	mov    DWORD PTR [r8+rdx*1+0x4],eax
   140318b35:	48 8b 4b 70          	mov    rcx,QWORD PTR [rbx+0x70]
   140318b39:	0f 57 c0             	xorps  xmm0,xmm0
   140318b3c:	41 ff c1             	inc    r9d
   140318b3f:	8b 44 0a 04          	mov    eax,DWORD PTR [rdx+rcx*1+0x4]
   140318b43:	2b 04 0a             	sub    eax,DWORD PTR [rdx+rcx*1]
   140318b46:	0f af 43 24          	imul   eax,DWORD PTR [rbx+0x24]
   140318b4a:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   140318b4f:	f3 0f 59 c1          	mulss  xmm0,xmm1
   140318b53:	f3 0f 11 44 0a 18    	movss  DWORD PTR [rdx+rcx*1+0x18],xmm0
   140318b59:	48 8b 43 70          	mov    rax,QWORD PTR [rbx+0x70]
   140318b5d:	8b 7c 02 04          	mov    edi,DWORD PTR [rdx+rax*1+0x4]
   140318b61:	8b 43 78             	mov    eax,DWORD PTR [rbx+0x78]
   140318b64:	44 3b c8             	cmp    r9d,eax
   140318b67:	0f 82 53 ff ff ff    	jb     0x140318ac0
   140318b6d:	44 8b c6             	mov    r8d,esi
   140318b70:	85 c0                	test   eax,eax
   140318b72:	74 3a                	je     0x140318bae
   140318b74:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140318b78:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140318b7f:	00 
   140318b80:	48 8b 4b 70          	mov    rcx,QWORD PTR [rbx+0x70]
   140318b84:	41 8b c0             	mov    eax,r8d
   140318b87:	41 ff c0             	inc    r8d
   140318b8a:	48 6b d0 1c          	imul   rdx,rax,0x1c
   140318b8e:	8b 04 0a             	mov    eax,DWORD PTR [rdx+rcx*1]
   140318b91:	89 44 0a 08          	mov    DWORD PTR [rdx+rcx*1+0x8],eax
   140318b95:	48 8b 4b 70          	mov    rcx,QWORD PTR [rbx+0x70]
   140318b99:	8b 04 0a             	mov    eax,DWORD PTR [rdx+rcx*1]
   140318b9c:	89 44 0a 0c          	mov    DWORD PTR [rdx+rcx*1+0xc],eax
   140318ba0:	48 8b 43 70          	mov    rax,QWORD PTR [rbx+0x70]
   140318ba4:	89 74 02 10          	mov    DWORD PTR [rdx+rax*1+0x10],esi
   140318ba8:	44 3b 43 78          	cmp    r8d,DWORD PTR [rbx+0x78]
   140318bac:	72 d2                	jb     0x140318b80
   140318bae:	48 8b 8b 80 00 00 00 	mov    rcx,QWORD PTR [rbx+0x80]
   140318bb5:	48 8b 5c 24 40       	mov    rbx,QWORD PTR [rsp+0x40]
   140318bba:	48 8b 6c 24 48       	mov    rbp,QWORD PTR [rsp+0x48]
   140318bbf:	48 8b 74 24 50       	mov    rsi,QWORD PTR [rsp+0x50]
   140318bc4:	48 8b 7c 24 58       	mov    rdi,QWORD PTR [rsp+0x58]
   140318bc9:	48 83 c4 20          	add    rsp,0x20
   140318bcd:	41 5f                	pop    r15
   140318bcf:	41 5e                	pop    r14
   140318bd1:	41 5c                	pop    r12
   140318bd3:	48 ff 25 6e fa 36 00 	rex.W jmp QWORD PTR [rip+0x36fa6e]        # 0x140688648
   140318bda:	cc                   	int3
   140318bdb:	cc                   	int3
   140318bdc:	cc                   	int3
   140318bdd:	cc                   	int3
   140318bde:	cc                   	int3
   140318bdf:	cc                   	int3
