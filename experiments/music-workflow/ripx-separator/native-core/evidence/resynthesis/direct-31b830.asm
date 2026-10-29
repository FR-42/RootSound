
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031b830 <.text+0x31a830>:
   14031b830:	48 8b c4             	mov    rax,rsp
   14031b833:	48 89 50 10          	mov    QWORD PTR [rax+0x10],rdx
   14031b837:	48 81 ec 18 01 00 00 	sub    rsp,0x118
   14031b83e:	80 bc 24 50 01 00 00 	cmp    BYTE PTR [rsp+0x150],0x0
   14031b845:	00 
   14031b846:	0f 57 c0             	xorps  xmm0,xmm0
   14031b849:	0f 29 70 c8          	movaps XMMWORD PTR [rax-0x38],xmm6
   14031b84d:	4c 8b d2             	mov    r10,rdx
   14031b850:	48 89 58 08          	mov    QWORD PTR [rax+0x8],rbx
   14031b854:	49 8b d9             	mov    rbx,r9
   14031b857:	48 89 68 18          	mov    QWORD PTR [rax+0x18],rbp
   14031b85b:	48 89 70 20          	mov    QWORD PTR [rax+0x20],rsi
   14031b85f:	48 89 78 f8          	mov    QWORD PTR [rax-0x8],rdi
   14031b863:	4c 89 60 f0          	mov    QWORD PTR [rax-0x10],r12
   14031b867:	45 8b e0             	mov    r12d,r8d
   14031b86a:	4c 89 68 e8          	mov    QWORD PTR [rax-0x18],r13
   14031b86e:	4c 8b e9             	mov    r13,rcx
   14031b871:	4c 89 70 e0          	mov    QWORD PTR [rax-0x20],r14
   14031b875:	4c 89 78 d8          	mov    QWORD PTR [rax-0x28],r15
   14031b879:	44 0f 29 40 a8       	movaps XMMWORD PTR [rax-0x58],xmm8
   14031b87e:	44 0f 29 48 98       	movaps XMMWORD PTR [rax-0x68],xmm9
   14031b883:	44 0f 29 50 88       	movaps XMMWORD PTR [rax-0x78],xmm10
   14031b888:	f2 44 0f 10 15 67 49 	movsd  xmm10,QWORD PTR [rip+0x534967]        # 0x1408501f8
   14031b88f:	53 00 
   14031b891:	44 0f 29 98 78 ff ff 	movaps XMMWORD PTR [rax-0x88],xmm11
   14031b898:	ff 
   14031b899:	41 0f 28 d2          	movaps xmm2,xmm10
   14031b89d:	44 0f 29 a0 68 ff ff 	movaps XMMWORD PTR [rax-0x98],xmm12
   14031b8a4:	ff 
   14031b8a5:	8b 05 a9 e8 66 00    	mov    eax,DWORD PTR [rip+0x66e8a9]        # 0x14098a154
   14031b8ab:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   14031b8b0:	f2 0f 5e d0          	divsd  xmm2,xmm0
   14031b8b4:	75 1e                	jne    0x14031b8d4
   14031b8b6:	45 8b b1 18 02 00 00 	mov    r14d,DWORD PTR [r9+0x218]
   14031b8bd:	45 8b b9 1c 02 00 00 	mov    r15d,DWORD PTR [r9+0x21c]
   14031b8c4:	45 89 b1 20 02 00 00 	mov    DWORD PTR [r9+0x220],r14d
   14031b8cb:	45 89 b9 24 02 00 00 	mov    DWORD PTR [r9+0x224],r15d
   14031b8d2:	eb 0e                	jmp    0x14031b8e2
   14031b8d4:	45 8b b1 20 02 00 00 	mov    r14d,DWORD PTR [r9+0x220]
   14031b8db:	45 8b b9 24 02 00 00 	mov    r15d,DWORD PTR [r9+0x224]
   14031b8e2:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   14031b8e7:	49 8d 69 18          	lea    rbp,[r9+0x18]
   14031b8eb:	41 8b c6             	mov    eax,r14d
   14031b8ee:	45 0f 57 db          	xorps  xmm11,xmm11
   14031b8f2:	99                   	cdq
   14031b8f3:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031b8f7:	f7 3d ab e8 66 00    	idiv   DWORD PTR [rip+0x66e8ab]        # 0x14098a1a8
   14031b8fd:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031b900:	41 8b c6             	mov    eax,r14d
   14031b903:	66 0f 6e ca          	movd   xmm1,edx
   14031b907:	99                   	cdq
   14031b908:	f3 0f e6 c9          	cvtdq2pd xmm1,xmm1
   14031b90c:	f2 0f 59 4d 00       	mulsd  xmm1,QWORD PTR [rbp+0x0]
   14031b911:	f2 0f 5e ca          	divsd  xmm1,xmm2
   14031b915:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031b919:	0f 57 c0             	xorps  xmm0,xmm0
   14031b91c:	66 44 0f 5a e1       	cvtpd2ps xmm12,xmm1
   14031b921:	41 0f 5a cc          	cvtps2pd xmm1,xmm12
   14031b925:	f3 45 0f 11 21       	movss  DWORD PTR [r9],xmm12
   14031b92a:	8b 0d 24 e8 66 00    	mov    ecx,DWORD PTR [rip+0x66e824]        # 0x14098a154
   14031b930:	8b 3d 72 e8 66 00    	mov    edi,DWORD PTR [rip+0x66e872]        # 0x14098a1a8
   14031b936:	f2 41 0f 59 ca       	mulsd  xmm1,xmm10
   14031b93b:	f2 48 0f 2a c1       	cvtsi2sd xmm0,rcx
   14031b940:	41 8b cc             	mov    ecx,r12d
   14031b943:	f7 ff                	idiv   edi
   14031b945:	f2 0f 5e c8          	divsd  xmm1,xmm0
   14031b949:	2b c8                	sub    ecx,eax
   14031b94b:	48 63 f1             	movsxd rsi,ecx
   14031b94e:	33 c9                	xor    ecx,ecx
   14031b950:	66 0f 5a d1          	cvtpd2ps xmm2,xmm1
   14031b954:	48 83 fe 04          	cmp    rsi,0x4
   14031b958:	0f 8c 10 01 00 00    	jl     0x14031ba6e
   14031b95e:	48 8d 6e fd          	lea    rbp,[rsi-0x3]
   14031b962:	8b c7                	mov    eax,edi
   14031b964:	48 85 c9             	test   rcx,rcx
   14031b967:	75 06                	jne    0x14031b96f
   14031b969:	85 d2                	test   edx,edx
   14031b96b:	7e 02                	jle    0x14031b96f
   14031b96d:	2b c2                	sub    eax,edx
   14031b96f:	0f 57 db             	xorps  xmm3,xmm3
   14031b972:	4c 8d 59 03          	lea    r11,[rcx+0x3]
   14031b976:	f2 0f 2a d8          	cvtsi2sd xmm3,eax
   14031b97a:	48 8d 41 01          	lea    rax,[rcx+0x1]
   14031b97e:	44 8b cf             	mov    r9d,edi
   14031b981:	0f 5a d2             	cvtps2pd xmm2,xmm2
   14031b984:	41 0f 5a c0          	cvtps2pd xmm0,xmm8
   14031b988:	0f 28 ca             	movaps xmm1,xmm2
   14031b98b:	f2 0f 59 cb          	mulsd  xmm1,xmm3
   14031b98f:	f2 42 0f 59 1c db    	mulsd  xmm3,QWORD PTR [rbx+r11*8]
   14031b995:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031b999:	f2 0f 58 da          	addsd  xmm3,xmm2
   14031b99d:	66 0f 5a e1          	cvtpd2ps xmm4,xmm1
   14031b9a1:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14031b9a5:	48 85 c0             	test   rax,rax
   14031b9a8:	75 07                	jne    0x14031b9b1
   14031b9aa:	85 d2                	test   edx,edx
   14031b9ac:	7e 03                	jle    0x14031b9b1
   14031b9ae:	44 2b ca             	sub    r9d,edx
   14031b9b1:	0f 57 db             	xorps  xmm3,xmm3
   14031b9b4:	4c 8d 51 04          	lea    r10,[rcx+0x4]
   14031b9b8:	f2 41 0f 2a d9       	cvtsi2sd xmm3,r9d
   14031b9bd:	48 8d 41 02          	lea    rax,[rcx+0x2]
   14031b9c1:	44 8b cf             	mov    r9d,edi
   14031b9c4:	0f 5a d0             	cvtps2pd xmm2,xmm0
   14031b9c7:	0f 5a c4             	cvtps2pd xmm0,xmm4
   14031b9ca:	0f 28 ca             	movaps xmm1,xmm2
   14031b9cd:	f2 0f 59 cb          	mulsd  xmm1,xmm3
   14031b9d1:	f2 42 0f 59 1c d3    	mulsd  xmm3,QWORD PTR [rbx+r10*8]
   14031b9d7:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031b9db:	f2 0f 58 da          	addsd  xmm3,xmm2
   14031b9df:	66 0f 5a e1          	cvtpd2ps xmm4,xmm1
   14031b9e3:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14031b9e7:	48 85 c0             	test   rax,rax
   14031b9ea:	75 07                	jne    0x14031b9f3
   14031b9ec:	85 d2                	test   edx,edx
   14031b9ee:	7e 03                	jle    0x14031b9f3
   14031b9f0:	44 2b ca             	sub    r9d,edx
   14031b9f3:	0f 57 db             	xorps  xmm3,xmm3
   14031b9f6:	8b c7                	mov    eax,edi
   14031b9f8:	0f 5a d0             	cvtps2pd xmm2,xmm0
   14031b9fb:	f2 41 0f 2a d9       	cvtsi2sd xmm3,r9d
   14031ba00:	0f 28 ca             	movaps xmm1,xmm2
   14031ba03:	0f 5a c4             	cvtps2pd xmm0,xmm4
   14031ba06:	f2 0f 59 cb          	mulsd  xmm1,xmm3
   14031ba0a:	f2 0f 59 5c cb 28    	mulsd  xmm3,QWORD PTR [rbx+rcx*8+0x28]
   14031ba10:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031ba14:	f2 0f 58 da          	addsd  xmm3,xmm2
   14031ba18:	66 0f 5a e1          	cvtpd2ps xmm4,xmm1
   14031ba1c:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14031ba20:	4d 85 db             	test   r11,r11
   14031ba23:	75 06                	jne    0x14031ba2b
   14031ba25:	85 d2                	test   edx,edx
   14031ba27:	7e 02                	jle    0x14031ba2b
   14031ba29:	2b c2                	sub    eax,edx
   14031ba2b:	0f 57 db             	xorps  xmm3,xmm3
   14031ba2e:	0f 5a d0             	cvtps2pd xmm2,xmm0
   14031ba31:	f2 0f 2a d8          	cvtsi2sd xmm3,eax
   14031ba35:	0f 28 ca             	movaps xmm1,xmm2
   14031ba38:	0f 5a c4             	cvtps2pd xmm0,xmm4
   14031ba3b:	f2 0f 59 cb          	mulsd  xmm1,xmm3
   14031ba3f:	f2 0f 59 5c cb 30    	mulsd  xmm3,QWORD PTR [rbx+rcx*8+0x30]
   14031ba45:	49 8b ca             	mov    rcx,r10
   14031ba48:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031ba4c:	f2 0f 58 da          	addsd  xmm3,xmm2
   14031ba50:	66 44 0f 5a c1       	cvtpd2ps xmm8,xmm1
   14031ba55:	66 0f 5a d3          	cvtpd2ps xmm2,xmm3
   14031ba59:	4c 3b d5             	cmp    r10,rbp
   14031ba5c:	0f 8c 00 ff ff ff    	jl     0x14031b962
   14031ba62:	4c 8b 94 24 28 01 00 	mov    r10,QWORD PTR [rsp+0x128]
   14031ba69:	00 
   14031ba6a:	48 8d 6b 18          	lea    rbp,[rbx+0x18]
   14031ba6e:	48 3b ce             	cmp    rcx,rsi
   14031ba71:	7d 41                	jge    0x14031bab4
   14031ba73:	8b c7                	mov    eax,edi
   14031ba75:	48 85 c9             	test   rcx,rcx
   14031ba78:	75 06                	jne    0x14031ba80
   14031ba7a:	85 d2                	test   edx,edx
   14031ba7c:	7e 02                	jle    0x14031ba80
   14031ba7e:	2b c2                	sub    eax,edx
   14031ba80:	0f 57 db             	xorps  xmm3,xmm3
   14031ba83:	f2 0f 2a d8          	cvtsi2sd xmm3,eax
   14031ba87:	0f 5a d2             	cvtps2pd xmm2,xmm2
   14031ba8a:	41 0f 5a c0          	cvtps2pd xmm0,xmm8
   14031ba8e:	0f 28 ca             	movaps xmm1,xmm2
   14031ba91:	f2 0f 59 cb          	mulsd  xmm1,xmm3
   14031ba95:	f2 0f 59 5c cb 18    	mulsd  xmm3,QWORD PTR [rbx+rcx*8+0x18]
   14031ba9b:	48 ff c1             	inc    rcx
   14031ba9e:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031baa2:	f2 0f 58 da          	addsd  xmm3,xmm2
   14031baa6:	66 44 0f 5a c1       	cvtpd2ps xmm8,xmm1
   14031baab:	66 0f 5a d3          	cvtpd2ps xmm2,xmm3
   14031baaf:	48 3b ce             	cmp    rcx,rsi
   14031bab2:	7c bf                	jl     0x14031ba73
   14031bab4:	f3 44 0f 10 8c 24 58 	movss  xmm9,DWORD PTR [rsp+0x158]
   14031babb:	01 00 00 
   14031babe:	45 0f 2f d9          	comiss xmm11,xmm9
   14031bac2:	0f b6 bc 24 40 01 00 	movzx  edi,BYTE PTR [rsp+0x140]
   14031bac9:	00 
   14031baca:	48 8b b4 24 38 01 00 	mov    rsi,QWORD PTR [rsp+0x138]
   14031bad1:	00 
   14031bad2:	0f 86 23 01 00 00    	jbe    0x14031bbfb
   14031bad8:	80 bc 24 48 01 00 00 	cmp    BYTE PTR [rsp+0x148],0x0
   14031badf:	00 
   14031bae0:	8b 8b 28 02 00 00    	mov    ecx,DWORD PTR [rbx+0x228]
   14031bae6:	0f 29 bc 24 d0 00 00 	movaps XMMWORD PTR [rsp+0xd0],xmm7
   14031baed:	00 
   14031baee:	74 10                	je     0x14031bb00
   14031baf0:	85 c9                	test   ecx,ecx
   14031baf2:	78 0c                	js     0x14031bb00
   14031baf4:	41 8b 85 c0 00 00 00 	mov    eax,DWORD PTR [r13+0xc0]
   14031bafb:	3b c8                	cmp    ecx,eax
   14031bafd:	0f 4c c8             	cmovl  ecx,eax
   14031bb00:	40 88 7c 24 58       	mov    BYTE PTR [rsp+0x58],dil
   14031bb05:	48 8d 44 24 60       	lea    rax,[rsp+0x60]
   14031bb0a:	89 4c 24 50          	mov    DWORD PTR [rsp+0x50],ecx
   14031bb0e:	45 8b cf             	mov    r9d,r15d
   14031bb11:	44 89 64 24 48       	mov    DWORD PTR [rsp+0x48],r12d
   14031bb16:	45 8b c6             	mov    r8d,r14d
   14031bb19:	48 89 44 24 40       	mov    QWORD PTR [rsp+0x40],rax
   14031bb1e:	49 8b d2             	mov    rdx,r10
   14031bb21:	48 89 6c 24 38       	mov    QWORD PTR [rsp+0x38],rbp
   14031bb26:	49 8b cd             	mov    rcx,r13
   14031bb29:	f3 44 0f 11 5c 24 30 	movss  DWORD PTR [rsp+0x30],xmm11
   14031bb30:	f3 44 0f 11 64 24 28 	movss  DWORD PTR [rsp+0x28],xmm12
   14031bb37:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx
   14031bb3c:	e8 6f e6 00 00       	call   0x14032a1b0
   14031bb41:	f2 0f 10 4c 24 60    	movsd  xmm1,QWORD PTR [rsp+0x60]
   14031bb47:	f2 0f 10 54 24 68    	movsd  xmm2,QWORD PTR [rsp+0x68]
   14031bb4d:	0f 28 e1             	movaps xmm4,xmm1
   14031bb50:	f2 0f 10 5c 24 70    	movsd  xmm3,QWORD PTR [rsp+0x70]
   14031bb56:	f2 0f 10 74 24 78    	movsd  xmm6,QWORD PTR [rsp+0x78]
   14031bb5c:	0f 28 c3             	movaps xmm0,xmm3
   14031bb5f:	0f 28 fb             	movaps xmm7,xmm3
   14031bb62:	0f 28 ee             	movaps xmm5,xmm6
   14031bb65:	f2 0f 58 f9          	addsd  xmm7,xmm1
   14031bb69:	f2 0f 58 ea          	addsd  xmm5,xmm2
   14031bb6d:	f2 0f 59 3d b3 45 53 	mulsd  xmm7,QWORD PTR [rip+0x5345b3]        # 0x140850128
   14031bb74:	00 
   14031bb75:	f2 0f 59 2d ab 45 53 	mulsd  xmm5,QWORD PTR [rip+0x5345ab]        # 0x140850128
   14031bb7c:	00 
   14031bb7d:	f2 0f 5c cf          	subsd  xmm1,xmm7
   14031bb81:	f2 0f 5c c7          	subsd  xmm0,xmm7
   14031bb85:	f2 0f 5c e5          	subsd  xmm4,xmm5
   14031bb89:	f2 0f 5c dd          	subsd  xmm3,xmm5
   14031bb8d:	f2 0f 58 e1          	addsd  xmm4,xmm1
   14031bb91:	0f 28 ca             	movaps xmm1,xmm2
   14031bb94:	f2 0f 5c cd          	subsd  xmm1,xmm5
   14031bb98:	f2 0f 5c d7          	subsd  xmm2,xmm7
   14031bb9c:	f2 0f 5c e0          	subsd  xmm4,xmm0
   14031bba0:	f2 0f 58 ca          	addsd  xmm1,xmm2
   14031bba4:	0f 28 d6             	movaps xmm2,xmm6
   14031bba7:	f2 0f 5c d7          	subsd  xmm2,xmm7
   14031bbab:	f2 0f 5c f5          	subsd  xmm6,xmm5
   14031bbaf:	f2 0f 5c e3          	subsd  xmm4,xmm3
   14031bbb3:	f2 0f 5c ca          	subsd  xmm1,xmm2
   14031bbb7:	f2 0f 59 25 f9 44 53 	mulsd  xmm4,QWORD PTR [rip+0x5344f9]        # 0x1408500b8
   14031bbbe:	00 
   14031bbbf:	f2 0f 5c ce          	subsd  xmm1,xmm6
   14031bbc3:	0f 28 c4             	movaps xmm0,xmm4
   14031bbc6:	f2 0f 59 0d ea 44 53 	mulsd  xmm1,QWORD PTR [rip+0x5344ea]        # 0x1408500b8
   14031bbcd:	00 
   14031bbce:	e8 31 52 30 00       	call   0x140620e04
   14031bbd3:	0f 57 d2             	xorps  xmm2,xmm2
   14031bbd6:	41 0f 28 ca          	movaps xmm1,xmm10
   14031bbda:	f2 0f 5c d0          	subsd  xmm2,xmm0
   14031bbde:	0f 57 f6             	xorps  xmm6,xmm6
   14031bbe1:	f2 0f 58 15 ff bd 38 	addsd  xmm2,QWORD PTR [rip+0x38bdff]        # 0x1406a79e8
   14031bbe8:	00 
   14031bbe9:	0f 28 c2             	movaps xmm0,xmm2
   14031bbec:	e8 77 51 30 00       	call   0x140620d68
   14031bbf1:	0f 28 bc 24 d0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xd0]
   14031bbf8:	00 
   14031bbf9:	eb 18                	jmp    0x14031bc13
   14031bbfb:	41 0f 28 c1          	movaps xmm0,xmm9
   14031bbff:	41 0f 28 ca          	movaps xmm1,xmm10
   14031bc03:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   14031bc08:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031bc0b:	e8 58 51 30 00       	call   0x140620d68
   14031bc10:	0f 57 f6             	xorps  xmm6,xmm6
   14031bc13:	66 0f 2f f0          	comisd xmm6,xmm0
   14031bc17:	76 05                	jbe    0x14031bc1e
   14031bc19:	f2 41 0f 58 c2       	addsd  xmm0,xmm10
   14031bc1e:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   14031bc22:	48 8d 84 24 50 01 00 	lea    rax,[rsp+0x150]
   14031bc29:	00 
   14031bc2a:	45 8b cf             	mov    r9d,r15d
   14031bc2d:	48 89 44 24 50       	mov    QWORD PTR [rsp+0x50],rax
   14031bc32:	45 8b c6             	mov    r8d,r14d
   14031bc35:	40 88 7c 24 48       	mov    BYTE PTR [rsp+0x48],dil
   14031bc3a:	48 8d 44 24 60       	lea    rax,[rsp+0x60]
   14031bc3f:	44 89 64 24 40       	mov    DWORD PTR [rsp+0x40],r12d
   14031bc44:	49 8b cd             	mov    rcx,r13
   14031bc47:	48 89 44 24 38       	mov    QWORD PTR [rsp+0x38],rax
   14031bc4c:	f3 0f 11 43 04       	movss  DWORD PTR [rbx+0x4],xmm0
   14031bc51:	48 8b 94 24 28 01 00 	mov    rdx,QWORD PTR [rsp+0x128]
   14031bc58:	00 
   14031bc59:	48 89 6c 24 30       	mov    QWORD PTR [rsp+0x30],rbp
   14031bc5e:	f3 44 0f 11 64 24 28 	movss  DWORD PTR [rsp+0x28],xmm12
   14031bc65:	48 89 5c 24 20       	mov    QWORD PTR [rsp+0x20],rbx
   14031bc6a:	e8 31 db 00 00       	call   0x1403297a0
   14031bc6f:	66 0f 2e c6          	ucomisd xmm0,xmm6
   14031bc73:	4c 8b bc 24 f0 00 00 	mov    r15,QWORD PTR [rsp+0xf0]
   14031bc7a:	00 
   14031bc7b:	4c 8b b4 24 f8 00 00 	mov    r14,QWORD PTR [rsp+0xf8]
   14031bc82:	00 
   14031bc83:	4c 8b ac 24 00 01 00 	mov    r13,QWORD PTR [rsp+0x100]
   14031bc8a:	00 
   14031bc8b:	4c 8b a4 24 08 01 00 	mov    r12,QWORD PTR [rsp+0x108]
   14031bc92:	00 
   14031bc93:	48 8b bc 24 10 01 00 	mov    rdi,QWORD PTR [rsp+0x110]
   14031bc9a:	00 
   14031bc9b:	48 8b ac 24 30 01 00 	mov    rbp,QWORD PTR [rsp+0x130]
   14031bca2:	00 
   14031bca3:	f2 0f 10 1d 55 be 38 	movsd  xmm3,QWORD PTR [rip+0x38be55]        # 0x1406a7b00
   14031bcaa:	00 
   14031bcab:	0f 28 e0             	movaps xmm4,xmm0
   14031bcae:	44 0f 28 a4 24 80 00 	movaps xmm12,XMMWORD PTR [rsp+0x80]
   14031bcb5:	00 00 
   14031bcb7:	7a 07                	jp     0x14031bcc0
   14031bcb9:	75 05                	jne    0x14031bcc0
   14031bcbb:	0f 57 c0             	xorps  xmm0,xmm0
   14031bcbe:	eb 57                	jmp    0x14031bd17
   14031bcc0:	f2 0f 10 54 24 68    	movsd  xmm2,QWORD PTR [rsp+0x68]
   14031bcc6:	f2 0f 59 15 2a 46 53 	mulsd  xmm2,QWORD PTR [rip+0x53462a]        # 0x1408502f8
   14031bccd:	00 
   14031bcce:	f2 0f 5e 54 24 60    	divsd  xmm2,QWORD PTR [rsp+0x60]
   14031bcd4:	0f 28 c2             	movaps xmm0,xmm2
   14031bcd7:	0f 28 da             	movaps xmm3,xmm2
   14031bcda:	f2 0f 59 5c 24 60    	mulsd  xmm3,QWORD PTR [rsp+0x60]
   14031bce0:	f2 0f 59 44 24 68    	mulsd  xmm0,QWORD PTR [rsp+0x68]
   14031bce6:	f2 0f 59 da          	mulsd  xmm3,xmm2
   14031bcea:	f2 0f 58 d8          	addsd  xmm3,xmm0
   14031bcee:	f2 0f 10 05 8a 24 37 	movsd  xmm0,QWORD PTR [rip+0x37248a]        # 0x14068e180
   14031bcf5:	00 
   14031bcf6:	66 0f 2f c2          	comisd xmm0,xmm2
   14031bcfa:	f2 0f 58 5c 24 70    	addsd  xmm3,QWORD PTR [rsp+0x70]
   14031bd00:	76 0b                	jbe    0x14031bd0d
   14031bd02:	66 0f 2f d6          	comisd xmm2,xmm6
   14031bd06:	77 08                	ja     0x14031bd10
   14031bd08:	0f 57 d2             	xorps  xmm2,xmm2
   14031bd0b:	eb 03                	jmp    0x14031bd10
   14031bd0d:	0f 28 d0             	movaps xmm2,xmm0
   14031bd10:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   14031bd14:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031bd17:	66 0f 2e e6          	ucomisd xmm4,xmm6
   14031bd1b:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14031bd1f:	f3 0f 11 43 10       	movss  DWORD PTR [rbx+0x10],xmm0
   14031bd24:	7a 07                	jp     0x14031bd2d
   14031bd26:	75 05                	jne    0x14031bd2d
   14031bd28:	0f 57 e4             	xorps  xmm4,xmm4
   14031bd2b:	eb 04                	jmp    0x14031bd31
   14031bd2d:	f2 0f 5c e3          	subsd  xmm4,xmm3
   14031bd31:	66 0f 2f f4          	comisd xmm6,xmm4
   14031bd35:	f2 0f 11 63 08       	movsd  QWORD PTR [rbx+0x8],xmm4
   14031bd3a:	72 07                	jb     0x14031bd43
   14031bd3c:	c7 43 10 00 00 00 00 	mov    DWORD PTR [rbx+0x10],0x0
   14031bd43:	45 0f 2f d9          	comiss xmm11,xmm9
   14031bd47:	44 0f 28 9c 24 90 00 	movaps xmm11,XMMWORD PTR [rsp+0x90]
   14031bd4e:	00 00 
   14031bd50:	76 27                	jbe    0x14031bd79
   14031bd52:	f3 44 0f 58 43 04    	addss  xmm8,DWORD PTR [rbx+0x4]
   14031bd58:	41 0f 28 ca          	movaps xmm1,xmm10
   14031bd5c:	41 0f 5a c0          	cvtps2pd xmm0,xmm8
   14031bd60:	e8 03 50 30 00       	call   0x140620d68
   14031bd65:	66 0f 2f f0          	comisd xmm6,xmm0
   14031bd69:	76 05                	jbe    0x14031bd70
   14031bd6b:	f2 41 0f 58 c2       	addsd  xmm0,xmm10
   14031bd70:	45 0f 57 c9          	xorps  xmm9,xmm9
   14031bd74:	f2 44 0f 5a c8       	cvtsd2ss xmm9,xmm0
   14031bd79:	f3 44 0f 11 4b 04    	movss  DWORD PTR [rbx+0x4],xmm9
   14031bd7f:	66 0f 2f 73 08       	comisd xmm6,QWORD PTR [rbx+0x8]
   14031bd84:	48 8b 9c 24 20 01 00 	mov    rbx,QWORD PTR [rsp+0x120]
   14031bd8b:	00 
   14031bd8c:	44 0f 28 94 24 a0 00 	movaps xmm10,XMMWORD PTR [rsp+0xa0]
   14031bd93:	00 00 
   14031bd95:	44 0f 28 8c 24 b0 00 	movaps xmm9,XMMWORD PTR [rsp+0xb0]
   14031bd9c:	00 00 
   14031bd9e:	44 0f 28 84 24 c0 00 	movaps xmm8,XMMWORD PTR [rsp+0xc0]
   14031bda5:	00 00 
   14031bda7:	72 13                	jb     0x14031bdbc
   14031bda9:	0f 57 c0             	xorps  xmm0,xmm0
   14031bdac:	0f 28 b4 24 e0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xe0]
   14031bdb3:	00 
   14031bdb4:	48 81 c4 18 01 00 00 	add    rsp,0x118
   14031bdbb:	c3                   	ret
   14031bdbc:	f2 0f 10 05 b4 43 53 	movsd  xmm0,QWORD PTR [rip+0x5343b4]        # 0x140850178
   14031bdc3:	00 
   14031bdc4:	0f 28 b4 24 e0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xe0]
   14031bdcb:	00 
   14031bdcc:	48 81 c4 18 01 00 00 	add    rsp,0x118
   14031bdd3:	c3                   	ret
   14031bdd4:	cc                   	int3
   14031bdd5:	cc                   	int3
   14031bdd6:	cc                   	int3
   14031bdd7:	cc                   	int3
   14031bdd8:	cc                   	int3
   14031bdd9:	cc                   	int3
   14031bdda:	cc                   	int3
   14031bddb:	cc                   	int3
   14031bddc:	cc                   	int3
   14031bddd:	cc                   	int3
   14031bdde:	cc                   	int3
   14031bddf:	cc                   	int3
   14031bde0:	40 53                	rex push rbx
   14031bde2:	55                   	push   rbp
   14031bde3:	56                   	push   rsi
   14031bde4:	57                   	push   rdi
   14031bde5:	41 54                	push   r12
   14031bde7:	41 55                	push   r13
   14031bde9:	41 56                	push   r14
   14031bdeb:	41 57                	push   r15
   14031bded:	48 81 ec 88 00 00 00 	sub    rsp,0x88
   14031bdf4:	44 8b 52 0c          	mov    r10d,DWORD PTR [rdx+0xc]
   14031bdf8:	45 33 e4             	xor    r12d,r12d
   14031bdfb:	44 8b 1d a6 e3 66 00 	mov    r11d,DWORD PTR [rip+0x66e3a6]        # 0x14098a1a8
   14031be02:	48 8b ea             	mov    rbp,rdx
   14031be05:	f3 0f 10 25 97 52 69 	movss  xmm4,DWORD PTR [rip+0x14695297]        # 0x1549b10a4
   14031be0c:	14 
   14031be0d:	48 8b f1             	mov    rsi,rcx
   14031be10:	8b 1d 3e e3 66 00    	mov    ebx,DWORD PTR [rip+0x66e33e]        # 0x14098a154
   14031be16:	f3 0f 10 2d da a2 38 	movss  xmm5,DWORD PTR [rip+0x38a2da]        # 0x1406a60f8
   14031be1d:	00 
   14031be1e:	f3 0f 10 15 e2 ba 38 	movss  xmm2,DWORD PTR [rip+0x38bae2]        # 0x1406a7908
   14031be25:	00 
   14031be26:	f3 0f 10 1d 72 43 53 	movss  xmm3,DWORD PTR [rip+0x534372]        # 0x1408501a0
   14031be2d:	00 
   14031be2e:	0f 29 74 24 70       	movaps XMMWORD PTR [rsp+0x70],xmm6
   14031be33:	f3 0f 10 35 ad 22 37 	movss  xmm6,DWORD PTR [rip+0x3722ad]        # 0x14068e0e8
   14031be3a:	00 
   14031be3b:	0f 29 7c 24 60       	movaps XMMWORD PTR [rsp+0x60],xmm7
   14031be40:	f3 0f 10 3d c8 b2 37 	movss  xmm7,DWORD PTR [rip+0x37b2c8]        # 0x140697110
   14031be47:	00 
   14031be48:	44 0f 29 44 24 50    	movaps XMMWORD PTR [rsp+0x50],xmm8
   14031be4e:	45 0f 57 c0          	xorps  xmm8,xmm8
   14031be52:	45 0f af d3          	imul   r10d,r11d
   14031be56:	41 0f 2e e0          	ucomiss xmm4,xmm8
   14031be5a:	44 0f 29 4c 24 40    	movaps XMMWORD PTR [rsp+0x40],xmm9
   14031be60:	f3 44 0f 10 0d c7 41 	movss  xmm9,DWORD PTR [rip+0x5341c7]        # 0x140850030
   14031be67:	53 00 
   14031be69:	7a 0b                	jp     0x14031be76
   14031be6b:	75 09                	jne    0x14031be76
   14031be6d:	44 8b 49 28          	mov    r9d,DWORD PTR [rcx+0x28]
   14031be71:	45 8b c4             	mov    r8d,r12d
   14031be74:	eb 72                	jmp    0x14031bee8
   14031be76:	0f 57 c9             	xorps  xmm1,xmm1
   14031be79:	f3 48 0f 2a cb       	cvtsi2ss xmm1,rbx
   14031be7e:	0f 28 c1             	movaps xmm0,xmm1
   14031be81:	f3 0f 59 c5          	mulss  xmm0,xmm5
   14031be85:	f3 0f 5e c4          	divss  xmm0,xmm4
   14031be89:	f3 0f 58 c2          	addss  xmm0,xmm2
   14031be8d:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14031be92:	0f 28 c1             	movaps xmm0,xmm1
   14031be95:	f3 0f 59 c6          	mulss  xmm0,xmm6
   14031be99:	f3 0f 58 c2          	addss  xmm0,xmm2
   14031be9d:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   14031bea2:	41 3b c0             	cmp    eax,r8d
   14031bea5:	44 0f 43 c0          	cmovae r8d,eax
   14031bea9:	44 38 a1 91 00 00 00 	cmp    BYTE PTR [rcx+0x91],r12b
   14031beb0:	74 05                	je     0x14031beb7
   14031beb2:	0f 28 c3             	movaps xmm0,xmm3
   14031beb5:	eb 04                	jmp    0x14031bebb
   14031beb7:	41 0f 28 c1          	movaps xmm0,xmm9
   14031bebb:	44 8b 49 28          	mov    r9d,DWORD PTR [rcx+0x28]
   14031bebf:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14031bec3:	42 8d 0c 4d 01 00 00 	lea    ecx,[r9*2+0x1]
   14031beca:	00 
   14031becb:	41 0f af cb          	imul   ecx,r11d
   14031becf:	f3 0f 59 c8          	mulss  xmm1,xmm0
   14031bed3:	f3 0f 58 ca          	addss  xmm1,xmm2
   14031bed7:	f3 48 0f 2c c1       	cvttss2si rax,xmm1
   14031bedc:	3b c8                	cmp    ecx,eax
   14031bede:	0f 43 c8             	cmovae ecx,eax
   14031bee1:	41 3b c8             	cmp    ecx,r8d
   14031bee4:	44 0f 42 c1          	cmovb  r8d,ecx
   14031bee8:	41 8b c3             	mov    eax,r11d
   14031beeb:	99                   	cdq
   14031beec:	2b c2                	sub    eax,edx
   14031beee:	d1 f8                	sar    eax,1
   14031bef0:	8b f8                	mov    edi,eax
   14031bef2:	41 8b c0             	mov    eax,r8d
   14031bef5:	99                   	cdq
   14031bef6:	8b cf                	mov    ecx,edi
   14031bef8:	2b c2                	sub    eax,edx
   14031befa:	d1 f8                	sar    eax,1
   14031befc:	2b c8                	sub    ecx,eax
   14031befe:	42 8d 04 11          	lea    eax,[rcx+r10*1]
   14031bf02:	44 8b 96 bc 00 00 00 	mov    r10d,DWORD PTR [rsi+0xbc]
   14031bf09:	85 c0                	test   eax,eax
   14031bf0b:	41 0f 4e c4          	cmovle eax,r12d
   14031bf0f:	44 03 55 10          	add    r10d,DWORD PTR [rbp+0x10]
   14031bf13:	99                   	cdq
   14031bf14:	45 0f af d3          	imul   r10d,r11d
   14031bf18:	41 f7 fb             	idiv   r11d
   14031bf1b:	41 0f 2e e0          	ucomiss xmm4,xmm8
   14031bf1f:	44 8b e8             	mov    r13d,eax
   14031bf22:	7a 07                	jp     0x14031bf2b
   14031bf24:	75 05                	jne    0x14031bf2b
   14031bf26:	45 8b c4             	mov    r8d,r12d
   14031bf29:	eb 6b                	jmp    0x14031bf96
   14031bf2b:	0f 57 c9             	xorps  xmm1,xmm1
   14031bf2e:	f3 48 0f 2a cb       	cvtsi2ss xmm1,rbx
   14031bf33:	0f 28 c1             	movaps xmm0,xmm1
   14031bf36:	f3 0f 59 c5          	mulss  xmm0,xmm5
   14031bf3a:	f3 0f 5e c4          	divss  xmm0,xmm4
   14031bf3e:	f3 0f 58 c2          	addss  xmm0,xmm2
   14031bf42:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   14031bf47:	0f 28 c1             	movaps xmm0,xmm1
   14031bf4a:	f3 0f 59 c6          	mulss  xmm0,xmm6
   14031bf4e:	f3 0f 58 c2          	addss  xmm0,xmm2
   14031bf52:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   14031bf57:	41 3b c0             	cmp    eax,r8d
   14031bf5a:	44 0f 43 c0          	cmovae r8d,eax
   14031bf5e:	0f b6 86 91 00 00 00 	movzx  eax,BYTE PTR [rsi+0x91]
   14031bf65:	84 c0                	test   al,al
   14031bf67:	75 04                	jne    0x14031bf6d
   14031bf69:	41 0f 28 d9          	movaps xmm3,xmm9
   14031bf6d:	f3 0f 59 df          	mulss  xmm3,xmm7
   14031bf71:	42 8d 0c 4d 01 00 00 	lea    ecx,[r9*2+0x1]
   14031bf78:	00 
   14031bf79:	41 0f af cb          	imul   ecx,r11d
   14031bf7d:	f3 0f 59 cb          	mulss  xmm1,xmm3
   14031bf81:	f3 0f 58 ca          	addss  xmm1,xmm2
   14031bf85:	f3 48 0f 2c c1       	cvttss2si rax,xmm1
   14031bf8a:	3b c8                	cmp    ecx,eax
   14031bf8c:	0f 43 c8             	cmovae ecx,eax
   14031bf8f:	41 3b c8             	cmp    ecx,r8d
   14031bf92:	44 0f 42 c1          	cmovb  r8d,ecx
   14031bf96:	41 8b c0             	mov    eax,r8d
   14031bf99:	99                   	cdq
   14031bf9a:	2b c2                	sub    eax,edx
   14031bf9c:	d1 f8                	sar    eax,1
   14031bf9e:	2b f8                	sub    edi,eax
   14031bfa0:	42 8d 04 17          	lea    eax,[rdi+r10*1]
   14031bfa4:	85 c0                	test   eax,eax
   14031bfa6:	41 0f 4e c4          	cmovle eax,r12d
   14031bfaa:	42 8d 0c 00          	lea    ecx,[rax+r8*1]
   14031bfae:	8b 46 24             	mov    eax,DWORD PTR [rsi+0x24]
   14031bfb1:	46 8d 14 48          	lea    r10d,[rax+r9*2]
   14031bfb5:	41 8b c2             	mov    eax,r10d
   14031bfb8:	41 0f af c3          	imul   eax,r11d
   14031bfbc:	3b c8                	cmp    ecx,eax
   14031bfbe:	0f 4d c8             	cmovge ecx,eax
   14031bfc1:	41 8d 43 ff          	lea    eax,[r11-0x1]
   14031bfc5:	03 c1                	add    eax,ecx
   14031bfc7:	48 8b 8e c8 00 00 00 	mov    rcx,QWORD PTR [rsi+0xc8]
   14031bfce:	99                   	cdq
   14031bfcf:	41 f7 fb             	idiv   r11d
   14031bfd2:	8b 96 c0 00 00 00    	mov    edx,DWORD PTR [rsi+0xc0]
   14031bfd8:	41 3b c2             	cmp    eax,r10d
   14031bfdb:	44 8b c8             	mov    r9d,eax
   14031bfde:	41 8b c5             	mov    eax,r13d
   14031bfe1:	45 0f 4d ca          	cmovge r9d,r10d
   14031bfe5:	ff ca                	dec    edx
   14031bfe7:	48 c1 e2 06          	shl    rdx,0x6
   14031bfeb:	44 8b 44 0a 18       	mov    r8d,DWORD PTR [rdx+rcx*1+0x18]
   14031bff0:	99                   	cdq
   14031bff1:	41 f7 f8             	idiv   r8d
   14031bff4:	41 8d 40 ff          	lea    eax,[r8-0x1]
   14031bff8:	b9 00 02 00 00       	mov    ecx,0x200
   14031bffd:	44 2b ea             	sub    r13d,edx
   14031c000:	41 03 c1             	add    eax,r9d
   14031c003:	99                   	cdq
   14031c004:	41 f7 f8             	idiv   r8d
   14031c007:	44 2b c2             	sub    r8d,edx
   14031c00a:	41 8d 58 ff          	lea    ebx,[r8-0x1]
   14031c00e:	41 03 d9             	add    ebx,r9d
   14031c011:	45 85 ed             	test   r13d,r13d
   14031c014:	45 0f 4e ec          	cmovle r13d,r12d
   14031c018:	45 0f af eb          	imul   r13d,r11d
   14031c01c:	41 3b da             	cmp    ebx,r10d
   14031c01f:	41 0f 4d da          	cmovge ebx,r10d
   14031c023:	45 33 c9             	xor    r9d,r9d
   14031c026:	45 33 c0             	xor    r8d,r8d
   14031c029:	41 0f af db          	imul   ebx,r11d
   14031c02d:	33 d2                	xor    edx,edx
   14031c02f:	44 89 ac 24 d0 00 00 	mov    DWORD PTR [rsp+0xd0],r13d
   14031c036:	00 
   14031c037:	e8 44 cd 20 00       	call   0x140528d80
   14031c03c:	45 33 c9             	xor    r9d,r9d
   14031c03f:	48 89 84 24 e0 00 00 	mov    QWORD PTR [rsp+0xe0],rax
   14031c046:	00 
   14031c047:	45 33 c0             	xor    r8d,r8d
   14031c04a:	b9 00 02 00 00       	mov    ecx,0x200
   14031c04f:	48 8b f8             	mov    rdi,rax
   14031c052:	41 8d 51 01          	lea    edx,[r9+0x1]
   14031c056:	e8 25 cd 20 00       	call   0x140528d80
   14031c05b:	44 39 25 46 d9 61 00 	cmp    DWORD PTR [rip+0x61d946],r12d        # 0x1409399a8
   14031c062:	4c 8b f0             	mov    r14,rax
   14031c065:	48 89 44 24 30       	mov    QWORD PTR [rsp+0x30],rax
   14031c06a:	45 8b fc             	mov    r15d,r12d
   14031c06d:	48 63 c3             	movsxd rax,ebx
   14031c070:	48 89 84 24 e8 00 00 	mov    QWORD PTR [rsp+0xe8],rax
   14031c077:	00 
   14031c078:	44 89 a4 24 d8 00 00 	mov    DWORD PTR [rsp+0xd8],r12d
   14031c07f:	00 
   14031c080:	0f 86 2f 04 00 00    	jbe    0x14031c4b5
   14031c086:	f3 0f 10 3d 4e 3f 53 	movss  xmm7,DWORD PTR [rip+0x533f4e]        # 0x14084ffdc
   14031c08d:	00 
   14031c08e:	f3 0f 10 35 5a 42 53 	movss  xmm6,DWORD PTR [rip+0x53425a]        # 0x1408502f0
   14031c095:	00 
   14031c096:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   14031c09d:	00 00 00 
   14031c0a0:	8b 86 c0 00 00 00    	mov    eax,DWORD PTR [rsi+0xc0]
   14031c0a6:	83 f8 01             	cmp    eax,0x1
   14031c0a9:	75 57                	jne    0x14031c102
   14031c0ab:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   14031c0b2:	41 8b df             	mov    ebx,r15d
   14031c0b5:	44 8b 40 30          	mov    r8d,DWORD PTR [rax+0x30]
   14031c0b9:	48 8d 3c db          	lea    rdi,[rbx+rbx*8]
   14031c0bd:	49 c1 e0 02          	shl    r8,0x2
   14031c0c1:	48 8b 54 fd 18       	mov    rdx,QWORD PTR [rbp+rdi*8+0x18]
   14031c0c6:	48 8b 4c fd 20       	mov    rcx,QWORD PTR [rbp+rdi*8+0x20]
   14031c0cb:	e8 14 4c 30 00       	call   0x140620ce4
   14031c0d0:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   14031c0d7:	8b 8e c0 00 00 00    	mov    ecx,DWORD PTR [rsi+0xc0]
   14031c0dd:	48 8b 54 fd 18       	mov    rdx,QWORD PTR [rbp+rdi*8+0x18]
   14031c0e2:	ff c1                	inc    ecx
   14031c0e4:	44 8b 40 30          	mov    r8d,DWORD PTR [rax+0x30]
   14031c0e8:	48 8d 04 db          	lea    rax,[rbx+rbx*8]
   14031c0ec:	48 03 c8             	add    rcx,rax
   14031c0ef:	49 c1 e0 02          	shl    r8,0x2
   14031c0f3:	48 8b 4c cd 18       	mov    rcx,QWORD PTR [rbp+rcx*8+0x18]
   14031c0f8:	e8 e7 4b 30 00       	call   0x140620ce4
   14031c0fd:	e9 93 03 00 00       	jmp    0x14031c495
   14031c102:	41 8b dc             	mov    ebx,r12d
   14031c105:	85 c0                	test   eax,eax
   14031c107:	74 7b                	je     0x14031c184
   14031c109:	41 8b ff             	mov    edi,r15d
   14031c10c:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031c110:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   14031c117:	85 db                	test   ebx,ebx
   14031c119:	75 30                	jne    0x14031c14b
   14031c11b:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   14031c11f:	49 8b cc             	mov    rcx,r12
   14031c122:	41 0f 2e c0          	ucomiss xmm0,xmm8
   14031c126:	7a 25                	jp     0x14031c14d
   14031c128:	75 23                	jne    0x14031c14d
   14031c12a:	44 8b 40 30          	mov    r8d,DWORD PTR [rax+0x30]
   14031c12e:	48 8d 14 ff          	lea    rdx,[rdi+rdi*8]
   14031c132:	48 8b 54 d5 18       	mov    rdx,QWORD PTR [rbp+rdx*8+0x18]
   14031c137:	48 8d 0c ff          	lea    rcx,[rdi+rdi*8]
   14031c13b:	48 8b 4c cd 20       	mov    rcx,QWORD PTR [rbp+rcx*8+0x20]
   14031c140:	49 c1 e0 02          	shl    r8,0x2
   14031c144:	e8 9b 4b 30 00       	call   0x140620ce4
   14031c149:	eb 25                	jmp    0x14031c170
   14031c14b:	8b cb                	mov    ecx,ebx
   14031c14d:	48 c1 e1 06          	shl    rcx,0x6
   14031c151:	33 d2                	xor    edx,edx
   14031c153:	44 8b 44 01 30       	mov    r8d,DWORD PTR [rcx+rax*1+0x30]
   14031c158:	48 8d 04 ff          	lea    rax,[rdi+rdi*8]
   14031c15c:	8d 4b 01             	lea    ecx,[rbx+0x1]
   14031c15f:	49 c1 e0 02          	shl    r8,0x2
   14031c163:	48 03 c8             	add    rcx,rax
   14031c166:	48 8b 4c cd 18       	mov    rcx,QWORD PTR [rbp+rcx*8+0x18]
   14031c16b:	e8 7a 4b 30 00       	call   0x140620cea
   14031c170:	8b 86 c0 00 00 00    	mov    eax,DWORD PTR [rsi+0xc0]
   14031c176:	ff c3                	inc    ebx
   14031c178:	3b d8                	cmp    ebx,eax
   14031c17a:	72 94                	jb     0x14031c110
   14031c17c:	48 8b bc 24 e0 00 00 	mov    rdi,QWORD PTR [rsp+0xe0]
   14031c183:	00 
   14031c184:	44 8b 46 20          	mov    r8d,DWORD PTR [rsi+0x20]
   14031c188:	8d 48 01             	lea    ecx,[rax+0x1]
   14031c18b:	41 8b d7             	mov    edx,r15d
   14031c18e:	49 c1 e0 02          	shl    r8,0x2
   14031c192:	48 8d 04 d2          	lea    rax,[rdx+rdx*8]
   14031c196:	48 8d 1c d2          	lea    rbx,[rdx+rdx*8]
   14031c19a:	48 03 c8             	add    rcx,rax
   14031c19d:	48 8b 54 dd 18       	mov    rdx,QWORD PTR [rbp+rbx*8+0x18]
   14031c1a2:	48 89 5c 24 38       	mov    QWORD PTR [rsp+0x38],rbx
   14031c1a7:	48 8b 4c cd 18       	mov    rcx,QWORD PTR [rbp+rcx*8+0x18]
   14031c1ac:	e8 33 4b 30 00       	call   0x140620ce4
   14031c1b1:	49 63 cd             	movsxd rcx,r13d
   14031c1b4:	45 8b e5             	mov    r12d,r13d
   14031c1b7:	4c 8b e9             	mov    r13,rcx
   14031c1ba:	48 3b 8c 24 e8 00 00 	cmp    rcx,QWORD PTR [rsp+0xe8]
   14031c1c1:	00 
   14031c1c2:	0f 8d c2 02 00 00    	jge    0x14031c48a
   14031c1c8:	4c 8d 3c dd 00 00 00 	lea    r15,[rbx*8+0x0]
   14031c1cf:	00 
   14031c1d0:	4c 03 fd             	add    r15,rbp
   14031c1d3:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   14031c1d7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   14031c1de:	00 00 
   14031c1e0:	4c 8b 95 10 06 00 00 	mov    r10,QWORD PTR [rbp+0x610]
   14031c1e7:	49 8d 55 02          	lea    rdx,[r13+0x2]
   14031c1eb:	48 8b 44 dd 18       	mov    rax,QWORD PTR [rbp+rbx*8+0x18]
   14031c1f0:	b9 02 00 00 00       	mov    ecx,0x2
   14031c1f5:	4c 8b 9d 08 06 00 00 	mov    r11,QWORD PTR [rbp+0x608]
   14031c1fc:	4d 8d 42 10          	lea    r8,[r10+0x10]
   14031c200:	48 8d 14 90          	lea    rdx,[rax+rdx*4]
   14031c204:	8d 41 fe             	lea    eax,[rcx-0x2]
   14031c207:	3d 00 01 00 00       	cmp    eax,0x100
   14031c20c:	73 0a                	jae    0x14031c218
   14031c20e:	f3 0f 10 42 f8       	movss  xmm0,DWORD PTR [rdx-0x8]
   14031c213:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c216:	eb 03                	jmp    0x14031c21b
   14031c218:	0f 57 c0             	xorps  xmm0,xmm0
   14031c21b:	8d 41 ff             	lea    eax,[rcx-0x1]
   14031c21e:	f2 41 0f 11 40 f0    	movsd  QWORD PTR [r8-0x10],xmm0
   14031c224:	3d 00 01 00 00       	cmp    eax,0x100
   14031c229:	73 0a                	jae    0x14031c235
   14031c22b:	f3 0f 10 42 fc       	movss  xmm0,DWORD PTR [rdx-0x4]
   14031c230:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c233:	eb 03                	jmp    0x14031c238
   14031c235:	0f 57 c0             	xorps  xmm0,xmm0
   14031c238:	f2 41 0f 11 40 f8    	movsd  QWORD PTR [r8-0x8],xmm0
   14031c23e:	81 f9 00 01 00 00    	cmp    ecx,0x100
   14031c244:	73 09                	jae    0x14031c24f
   14031c246:	f3 0f 10 02          	movss  xmm0,DWORD PTR [rdx]
   14031c24a:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c24d:	eb 03                	jmp    0x14031c252
   14031c24f:	0f 57 c0             	xorps  xmm0,xmm0
   14031c252:	8d 41 01             	lea    eax,[rcx+0x1]
   14031c255:	f2 41 0f 11 00       	movsd  QWORD PTR [r8],xmm0
   14031c25a:	3d 00 01 00 00       	cmp    eax,0x100
   14031c25f:	73 0a                	jae    0x14031c26b
   14031c261:	f3 0f 10 42 04       	movss  xmm0,DWORD PTR [rdx+0x4]
   14031c266:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c269:	eb 03                	jmp    0x14031c26e
   14031c26b:	0f 57 c0             	xorps  xmm0,xmm0
   14031c26e:	8d 41 02             	lea    eax,[rcx+0x2]
   14031c271:	f2 41 0f 11 40 08    	movsd  QWORD PTR [r8+0x8],xmm0
   14031c277:	3d 00 01 00 00       	cmp    eax,0x100
   14031c27c:	73 0a                	jae    0x14031c288
   14031c27e:	f3 0f 10 42 08       	movss  xmm0,DWORD PTR [rdx+0x8]
   14031c283:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c286:	eb 03                	jmp    0x14031c28b
   14031c288:	0f 57 c0             	xorps  xmm0,xmm0
   14031c28b:	8d 41 03             	lea    eax,[rcx+0x3]
   14031c28e:	f2 41 0f 11 40 10    	movsd  QWORD PTR [r8+0x10],xmm0
   14031c294:	3d 00 01 00 00       	cmp    eax,0x100
   14031c299:	73 0a                	jae    0x14031c2a5
   14031c29b:	f3 0f 10 42 0c       	movss  xmm0,DWORD PTR [rdx+0xc]
   14031c2a0:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c2a3:	eb 03                	jmp    0x14031c2a8
   14031c2a5:	0f 57 c0             	xorps  xmm0,xmm0
   14031c2a8:	8d 41 04             	lea    eax,[rcx+0x4]
   14031c2ab:	f2 41 0f 11 40 18    	movsd  QWORD PTR [r8+0x18],xmm0
   14031c2b1:	3d 00 01 00 00       	cmp    eax,0x100
   14031c2b6:	73 0a                	jae    0x14031c2c2
   14031c2b8:	f3 0f 10 42 10       	movss  xmm0,DWORD PTR [rdx+0x10]
   14031c2bd:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c2c0:	eb 03                	jmp    0x14031c2c5
   14031c2c2:	0f 57 c0             	xorps  xmm0,xmm0
   14031c2c5:	8d 41 05             	lea    eax,[rcx+0x5]
   14031c2c8:	f2 41 0f 11 40 20    	movsd  QWORD PTR [r8+0x20],xmm0
   14031c2ce:	3d 00 01 00 00       	cmp    eax,0x100
   14031c2d3:	73 0a                	jae    0x14031c2df
   14031c2d5:	f3 0f 10 42 14       	movss  xmm0,DWORD PTR [rdx+0x14]
   14031c2da:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c2dd:	eb 03                	jmp    0x14031c2e2
   14031c2df:	0f 57 c0             	xorps  xmm0,xmm0
   14031c2e2:	83 c1 08             	add    ecx,0x8
   14031c2e5:	f2 41 0f 11 40 28    	movsd  QWORD PTR [r8+0x28],xmm0
   14031c2eb:	48 83 c2 20          	add    rdx,0x20
   14031c2ef:	49 83 c0 40          	add    r8,0x40
   14031c2f3:	8d 41 fe             	lea    eax,[rcx-0x2]
   14031c2f6:	3d 00 02 00 00       	cmp    eax,0x200
   14031c2fb:	0f 82 03 ff ff ff    	jb     0x14031c204
   14031c301:	4c 8b cf             	mov    r9,rdi
   14031c304:	41 b8 00 02 00 00    	mov    r8d,0x200
   14031c30a:	49 8b d2             	mov    rdx,r10
   14031c30d:	49 8b cb             	mov    rcx,r11
   14031c310:	e8 fb a1 00 00       	call   0x140326510
   14031c315:	33 c9                	xor    ecx,ecx
   14031c317:	8b f9                	mov    edi,ecx
   14031c319:	39 8e c0 00 00 00    	cmp    DWORD PTR [rsi+0xc0],ecx
   14031c31f:	0f 86 39 01 00 00    	jbe    0x14031c45e
   14031c325:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   14031c32c:	85 ff                	test   edi,edi
   14031c32e:	75 15                	jne    0x14031c345
   14031c330:	f3 0f 10 00          	movss  xmm0,DWORD PTR [rax]
   14031c334:	48 8b d9             	mov    rbx,rcx
   14031c337:	41 0f 2e c0          	ucomiss xmm0,xmm8
   14031c33b:	7a 0a                	jp     0x14031c347
   14031c33d:	0f 84 08 01 00 00    	je     0x14031c44b
   14031c343:	eb 02                	jmp    0x14031c347
   14031c345:	8b df                	mov    ebx,edi
   14031c347:	4c 8b 8d 18 06 00 00 	mov    r9,QWORD PTR [rbp+0x618]
   14031c34e:	4c 8b 85 10 06 00 00 	mov    r8,QWORD PTR [rbp+0x610]
   14031c355:	48 8b 8d 08 06 00 00 	mov    rcx,QWORD PTR [rbp+0x608]
   14031c35c:	48 c1 e3 06          	shl    rbx,0x6
   14031c360:	4c 89 74 24 20       	mov    QWORD PTR [rsp+0x20],r14
   14031c365:	48 8d 14 18          	lea    rdx,[rax+rbx*1]
   14031c369:	e8 a2 be 00 00       	call   0x140328210
   14031c36e:	4c 8b 86 c8 00 00 00 	mov    r8,QWORD PTR [rsi+0xc8]
   14031c375:	f3 42 0f 10 44 03 08 	movss  xmm0,DWORD PTR [rbx+r8*1+0x8]
   14031c37c:	41 0f 2f c0          	comiss xmm0,xmm8
   14031c380:	76 1f                	jbe    0x14031c3a1
   14031c382:	8b 05 cc dd 66 00    	mov    eax,DWORD PTR [rip+0x66ddcc]        # 0x14098a154
   14031c388:	0f 57 c0             	xorps  xmm0,xmm0
   14031c38b:	f3 48 0f 2a c0       	cvtsi2ss xmm0,rax
   14031c390:	f3 0f 59 c7          	mulss  xmm0,xmm7
   14031c394:	42 0f 2f 44 03 0c    	comiss xmm0,DWORD PTR [rbx+r8*1+0xc]
   14031c39a:	76 05                	jbe    0x14031c3a1
   14031c39c:	0f 28 d6             	movaps xmm2,xmm6
   14031c39f:	eb 04                	jmp    0x14031c3a5
   14031c3a1:	41 0f 28 d1          	movaps xmm2,xmm9
   14031c3a5:	42 8b 4c 03 28       	mov    ecx,DWORD PTR [rbx+r8*1+0x28]
   14031c3aa:	41 8b c4             	mov    eax,r12d
   14031c3ad:	99                   	cdq
   14031c3ae:	42 f7 7c 03 18       	idiv   DWORD PTR [rbx+r8*1+0x18]
   14031c3b3:	44 8d 1c 09          	lea    r11d,[rcx+rcx*1]
   14031c3b7:	44 8b c8             	mov    r9d,eax
   14031c3ba:	8b c1                	mov    eax,ecx
   14031c3bc:	99                   	cdq
   14031c3bd:	2b c2                	sub    eax,edx
   14031c3bf:	d1 f8                	sar    eax,1
   14031c3c1:	44 2b c8             	sub    r9d,eax
   14031c3c4:	b8 00 00 00 00       	mov    eax,0x0
   14031c3c9:	45 8b c1             	mov    r8d,r9d
   14031c3cc:	41 f7 d8             	neg    r8d
   14031c3cf:	45 85 c0             	test   r8d,r8d
   14031c3d2:	44 0f 4e c0          	cmovle r8d,eax
   14031c3d6:	45 3b c3             	cmp    r8d,r11d
   14031c3d9:	7d 6e                	jge    0x14031c449
   14031c3db:	47 8d 14 08          	lea    r10d,[r8+r9*1]
   14031c3df:	49 63 c8             	movsxd rcx,r8d
   14031c3e2:	4d 63 c9             	movsxd r9,r9d
   14031c3e5:	44 8d 77 01          	lea    r14d,[rdi+0x1]
   14031c3e9:	4c 03 c9             	add    r9,rcx
   14031c3ec:	49 c1 e1 02          	shl    r9,0x2
   14031c3f0:	48 8b 86 c8 00 00 00 	mov    rax,QWORD PTR [rsi+0xc8]
   14031c3f7:	44 3b 54 03 30       	cmp    r10d,DWORD PTR [rbx+rax*1+0x30]
   14031c3fc:	7d 46                	jge    0x14031c444
   14031c3fe:	8b 4c 18 18          	mov    ecx,DWORD PTR [rax+rbx*1+0x18]
   14031c402:	0f 57 c9             	xorps  xmm1,xmm1
   14031c405:	4b 8b 54 f7 18       	mov    rdx,QWORD PTR [r15+r14*8+0x18]
   14031c40a:	41 ff c2             	inc    r10d
   14031c40d:	48 8b 85 10 06 00 00 	mov    rax,QWORD PTR [rbp+0x610]
   14031c414:	41 0f af c8          	imul   ecx,r8d
   14031c418:	41 ff c0             	inc    r8d
   14031c41b:	f3 0f 5a ca          	cvtss2sd xmm1,xmm2
   14031c41f:	f3 42 0f 10 04 0a    	movss  xmm0,DWORD PTR [rdx+r9*1]
   14031c425:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14031c428:	f2 0f 59 0c c8       	mulsd  xmm1,QWORD PTR [rax+rcx*8]
   14031c42d:	f2 0f 58 c8          	addsd  xmm1,xmm0
   14031c431:	66 0f 5a c1          	cvtpd2ps xmm0,xmm1
   14031c435:	f3 42 0f 11 04 0a    	movss  DWORD PTR [rdx+r9*1],xmm0
   14031c43b:	49 83 c1 04          	add    r9,0x4
   14031c43f:	45 3b c3             	cmp    r8d,r11d
   14031c442:	7c ac                	jl     0x14031c3f0
   14031c444:	4c 8b 74 24 30       	mov    r14,QWORD PTR [rsp+0x30]
   14031c449:	33 c9                	xor    ecx,ecx
   14031c44b:	ff c7                	inc    edi
   14031c44d:	3b be c0 00 00 00    	cmp    edi,DWORD PTR [rsi+0xc0]
   14031c453:	0f 82 cc fe ff ff    	jb     0x14031c325
   14031c459:	48 8b 5c 24 38       	mov    rbx,QWORD PTR [rsp+0x38]
   14031c45e:	48 8b bc 24 e0 00 00 	mov    rdi,QWORD PTR [rsp+0xe0]
   14031c465:	00 
   14031c466:	41 81 c4 00 01 00 00 	add    r12d,0x100
   14031c46d:	49 81 c5 00 01 00 00 	add    r13,0x100
   14031c474:	4c 3b ac 24 e8 00 00 	cmp    r13,QWORD PTR [rsp+0xe8]
   14031c47b:	00 
   14031c47c:	0f 8c 5e fd ff ff    	jl     0x14031c1e0
   14031c482:	44 8b bc 24 d8 00 00 	mov    r15d,DWORD PTR [rsp+0xd8]
   14031c489:	00 
   14031c48a:	44 8b ac 24 d0 00 00 	mov    r13d,DWORD PTR [rsp+0xd0]
   14031c491:	00 
   14031c492:	45 33 e4             	xor    r12d,r12d
   14031c495:	48 8b bc 24 e0 00 00 	mov    rdi,QWORD PTR [rsp+0xe0]
   14031c49c:	00 
   14031c49d:	41 ff c7             	inc    r15d
   14031c4a0:	44 3b 3d 01 d5 61 00 	cmp    r15d,DWORD PTR [rip+0x61d501]        # 0x1409399a8
   14031c4a7:	44 89 bc 24 d8 00 00 	mov    DWORD PTR [rsp+0xd8],r15d
   14031c4ae:	00 
   14031c4af:	0f 82 eb fb ff ff    	jb     0x14031c0a0
   14031c4b5:	48 8b cf             	mov    rcx,rdi
   14031c4b8:	ff 15 52 d5 36 00    	call   QWORD PTR [rip+0x36d552]        # 0x140689a10
   14031c4be:	49 8b ce             	mov    rcx,r14
   14031c4c1:	0f 28 74 24 70       	movaps xmm6,XMMWORD PTR [rsp+0x70]
   14031c4c6:	0f 28 7c 24 60       	movaps xmm7,XMMWORD PTR [rsp+0x60]
   14031c4cb:	44 0f 28 44 24 50    	movaps xmm8,XMMWORD PTR [rsp+0x50]
   14031c4d1:	44 0f 28 4c 24 40    	movaps xmm9,XMMWORD PTR [rsp+0x40]
   14031c4d7:	48 81 c4 88 00 00 00 	add    rsp,0x88
   14031c4de:	41 5f                	pop    r15
   14031c4e0:	41 5e                	pop    r14
   14031c4e2:	41 5d                	pop    r13
   14031c4e4:	41 5c                	pop    r12
   14031c4e6:	5f                   	pop    rdi
   14031c4e7:	5e                   	pop    rsi
   14031c4e8:	5d                   	pop    rbp
   14031c4e9:	5b                   	pop    rbx
   14031c4ea:	48 ff 25 1f d5 36 00 	rex.W jmp QWORD PTR [rip+0x36d51f]        # 0x140689a10
   14031c4f1:	cc                   	int3
   14031c4f2:	cc                   	int3
   14031c4f3:	cc                   	int3
   14031c4f4:	cc                   	int3
   14031c4f5:	cc                   	int3
   14031c4f6:	cc                   	int3
   14031c4f7:	cc                   	int3
   14031c4f8:	cc                   	int3
   14031c4f9:	cc                   	int3
   14031c4fa:	cc                   	int3
   14031c4fb:	cc                   	int3
   14031c4fc:	cc                   	int3
   14031c4fd:	cc                   	int3
   14031c4fe:	cc                   	int3
   14031c4ff:	cc                   	int3
