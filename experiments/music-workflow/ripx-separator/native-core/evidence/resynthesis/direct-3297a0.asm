
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403297a0 <.text+0x3287a0>:
   1403297a0:	48 8b c4             	mov    rax,rsp
   1403297a3:	48 89 58 18          	mov    QWORD PTR [rax+0x18],rbx
   1403297a7:	55                   	push   rbp
   1403297a8:	56                   	push   rsi
   1403297a9:	57                   	push   rdi
   1403297aa:	41 54                	push   r12
   1403297ac:	41 55                	push   r13
   1403297ae:	41 56                	push   r14
   1403297b0:	41 57                	push   r15
   1403297b2:	48 81 ec d0 01 00 00 	sub    rsp,0x1d0
   1403297b9:	0f 29 70 b8          	movaps XMMWORD PTR [rax-0x48],xmm6
   1403297bd:	0f 29 78 a8          	movaps XMMWORD PTR [rax-0x58],xmm7
   1403297c1:	44 0f 29 40 98       	movaps XMMWORD PTR [rax-0x68],xmm8
   1403297c6:	48 8b 05 9b 89 64 00 	mov    rax,QWORD PTR [rip+0x64899b]        # 0x140972168
   1403297cd:	48 33 c4             	xor    rax,rsp
   1403297d0:	48 89 84 24 90 01 00 	mov    QWORD PTR [rsp+0x190],rax
   1403297d7:	00 
   1403297d8:	48 8b 84 24 48 02 00 	mov    rax,QWORD PTR [rsp+0x248]
   1403297df:	00 
   1403297e0:	4c 8d 94 24 94 00 00 	lea    r10,[rsp+0x94]
   1403297e7:	00 
   1403297e8:	8b 3d ba 09 66 00    	mov    edi,DWORD PTR [rip+0x6609ba]        # 0x14098a1a8
   1403297ee:	4c 8b e2             	mov    r12,rdx
   1403297f1:	4c 8b 9c 24 40 02 00 	mov    r11,QWORD PTR [rsp+0x240]
   1403297f8:	00 
   1403297f9:	45 33 ed             	xor    r13d,r13d
   1403297fc:	48 8b b4 24 30 02 00 	mov    rsi,QWORD PTR [rsp+0x230]
   140329803:	00 
   140329804:	32 db                	xor    bl,bl
   140329806:	48 89 84 24 88 00 00 	mov    QWORD PTR [rsp+0x88],rax
   14032980d:	00 
   14032980e:	41 8b e8             	mov    ebp,r8d
   140329811:	41 8b c0             	mov    eax,r8d
   140329814:	45 8b f1             	mov    r14d,r9d
   140329817:	99                   	cdq
   140329818:	4c 8b f9             	mov    r15,rcx
   14032981b:	f7 ff                	idiv   edi
   14032981d:	49 83 c3 10          	add    r11,0x10
   140329821:	45 8b c5             	mov    r8d,r13d
   140329824:	45 0f 57 c0          	xorps  xmm8,xmm8
   140329828:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   14032982f:	00 
   140329830:	8b c7                	mov    eax,edi
   140329832:	8b cf                	mov    ecx,edi
   140329834:	45 85 c0             	test   r8d,r8d
   140329837:	75 06                	jne    0x14032983f
   140329839:	85 d2                	test   edx,edx
   14032983b:	7e 02                	jle    0x14032983f
   14032983d:	2b c2                	sub    eax,edx
   14032983f:	f2 41 0f 10 53 f0    	movsd  xmm2,QWORD PTR [r11-0x10]
   140329845:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   14032984a:	66 0f 6e c0          	movd   xmm0,eax
   14032984e:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329851:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329854:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329858:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032985c:	f3 41 0f 11 4a fc    	movss  DWORD PTR [r10-0x4],xmm1
   140329862:	7a 02                	jp     0x140329866
   140329864:	74 02                	je     0x140329868
   140329866:	b3 01                	mov    bl,0x1
   140329868:	41 8d 40 01          	lea    eax,[r8+0x1]
   14032986c:	44 8b c9             	mov    r9d,ecx
   14032986f:	85 c0                	test   eax,eax
   140329871:	75 07                	jne    0x14032987a
   140329873:	85 d2                	test   edx,edx
   140329875:	7e 03                	jle    0x14032987a
   140329877:	44 2b ca             	sub    r9d,edx
   14032987a:	f2 41 0f 10 53 f8    	movsd  xmm2,QWORD PTR [r11-0x8]
   140329880:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329885:	66 41 0f 6e c1       	movd   xmm0,r9d
   14032988a:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032988d:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329890:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329894:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329898:	f3 41 0f 11 0a       	movss  DWORD PTR [r10],xmm1
   14032989d:	7a 02                	jp     0x1403298a1
   14032989f:	74 02                	je     0x1403298a3
   1403298a1:	b3 01                	mov    bl,0x1
   1403298a3:	41 8d 40 02          	lea    eax,[r8+0x2]
   1403298a7:	44 8b c9             	mov    r9d,ecx
   1403298aa:	85 c0                	test   eax,eax
   1403298ac:	75 07                	jne    0x1403298b5
   1403298ae:	85 d2                	test   edx,edx
   1403298b0:	7e 03                	jle    0x1403298b5
   1403298b2:	44 2b ca             	sub    r9d,edx
   1403298b5:	f2 41 0f 10 13       	movsd  xmm2,QWORD PTR [r11]
   1403298ba:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   1403298bf:	66 41 0f 6e c1       	movd   xmm0,r9d
   1403298c4:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403298c7:	0f 5a c8             	cvtps2pd xmm1,xmm0
   1403298ca:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   1403298ce:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   1403298d2:	f3 41 0f 11 4a 04    	movss  DWORD PTR [r10+0x4],xmm1
   1403298d8:	7a 02                	jp     0x1403298dc
   1403298da:	74 02                	je     0x1403298de
   1403298dc:	b3 01                	mov    bl,0x1
   1403298de:	41 8d 40 03          	lea    eax,[r8+0x3]
   1403298e2:	44 8b c9             	mov    r9d,ecx
   1403298e5:	85 c0                	test   eax,eax
   1403298e7:	75 07                	jne    0x1403298f0
   1403298e9:	85 d2                	test   edx,edx
   1403298eb:	7e 03                	jle    0x1403298f0
   1403298ed:	44 2b ca             	sub    r9d,edx
   1403298f0:	f2 41 0f 10 53 08    	movsd  xmm2,QWORD PTR [r11+0x8]
   1403298f6:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   1403298fb:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329900:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329903:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329906:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   14032990a:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032990e:	f3 41 0f 11 4a 08    	movss  DWORD PTR [r10+0x8],xmm1
   140329914:	7a 02                	jp     0x140329918
   140329916:	74 02                	je     0x14032991a
   140329918:	b3 01                	mov    bl,0x1
   14032991a:	41 8d 40 04          	lea    eax,[r8+0x4]
   14032991e:	44 8b c9             	mov    r9d,ecx
   140329921:	85 c0                	test   eax,eax
   140329923:	75 07                	jne    0x14032992c
   140329925:	85 d2                	test   edx,edx
   140329927:	7e 03                	jle    0x14032992c
   140329929:	44 2b ca             	sub    r9d,edx
   14032992c:	f2 41 0f 10 53 10    	movsd  xmm2,QWORD PTR [r11+0x10]
   140329932:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329937:	66 41 0f 6e c1       	movd   xmm0,r9d
   14032993c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032993f:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329942:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329946:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   14032994a:	f3 41 0f 11 4a 0c    	movss  DWORD PTR [r10+0xc],xmm1
   140329950:	7a 02                	jp     0x140329954
   140329952:	74 02                	je     0x140329956
   140329954:	b3 01                	mov    bl,0x1
   140329956:	41 8d 40 05          	lea    eax,[r8+0x5]
   14032995a:	44 8b c9             	mov    r9d,ecx
   14032995d:	85 c0                	test   eax,eax
   14032995f:	75 07                	jne    0x140329968
   140329961:	85 d2                	test   edx,edx
   140329963:	7e 03                	jle    0x140329968
   140329965:	44 2b ca             	sub    r9d,edx
   140329968:	f2 41 0f 10 53 18    	movsd  xmm2,QWORD PTR [r11+0x18]
   14032996e:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329973:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329978:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14032997b:	0f 5a c8             	cvtps2pd xmm1,xmm0
   14032997e:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329982:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329986:	f3 41 0f 11 4a 10    	movss  DWORD PTR [r10+0x10],xmm1
   14032998c:	7a 02                	jp     0x140329990
   14032998e:	74 02                	je     0x140329992
   140329990:	b3 01                	mov    bl,0x1
   140329992:	41 8d 40 06          	lea    eax,[r8+0x6]
   140329996:	44 8b c9             	mov    r9d,ecx
   140329999:	85 c0                	test   eax,eax
   14032999b:	75 07                	jne    0x1403299a4
   14032999d:	85 d2                	test   edx,edx
   14032999f:	7e 03                	jle    0x1403299a4
   1403299a1:	44 2b ca             	sub    r9d,edx
   1403299a4:	f2 41 0f 10 53 20    	movsd  xmm2,QWORD PTR [r11+0x20]
   1403299aa:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   1403299af:	66 41 0f 6e c1       	movd   xmm0,r9d
   1403299b4:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403299b7:	0f 5a c8             	cvtps2pd xmm1,xmm0
   1403299ba:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   1403299be:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   1403299c2:	f3 41 0f 11 4a 14    	movss  DWORD PTR [r10+0x14],xmm1
   1403299c8:	7a 02                	jp     0x1403299cc
   1403299ca:	74 02                	je     0x1403299ce
   1403299cc:	b3 01                	mov    bl,0x1
   1403299ce:	41 8d 40 07          	lea    eax,[r8+0x7]
   1403299d2:	44 8b c9             	mov    r9d,ecx
   1403299d5:	85 c0                	test   eax,eax
   1403299d7:	75 07                	jne    0x1403299e0
   1403299d9:	85 d2                	test   edx,edx
   1403299db:	7e 03                	jle    0x1403299e0
   1403299dd:	44 2b ca             	sub    r9d,edx
   1403299e0:	f2 41 0f 10 53 28    	movsd  xmm2,QWORD PTR [r11+0x28]
   1403299e6:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   1403299eb:	66 41 0f 6e c1       	movd   xmm0,r9d
   1403299f0:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   1403299f3:	0f 5a c8             	cvtps2pd xmm1,xmm0
   1403299f6:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   1403299fa:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   1403299fe:	f3 41 0f 11 4a 18    	movss  DWORD PTR [r10+0x18],xmm1
   140329a04:	7a 02                	jp     0x140329a08
   140329a06:	74 02                	je     0x140329a0a
   140329a08:	b3 01                	mov    bl,0x1
   140329a0a:	41 8d 40 08          	lea    eax,[r8+0x8]
   140329a0e:	44 8b c9             	mov    r9d,ecx
   140329a11:	85 c0                	test   eax,eax
   140329a13:	75 07                	jne    0x140329a1c
   140329a15:	85 d2                	test   edx,edx
   140329a17:	7e 03                	jle    0x140329a1c
   140329a19:	44 2b ca             	sub    r9d,edx
   140329a1c:	f2 41 0f 10 53 30    	movsd  xmm2,QWORD PTR [r11+0x30]
   140329a22:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329a27:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329a2c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329a2f:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329a32:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329a36:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329a3a:	f3 41 0f 11 4a 1c    	movss  DWORD PTR [r10+0x1c],xmm1
   140329a40:	7a 02                	jp     0x140329a44
   140329a42:	74 02                	je     0x140329a46
   140329a44:	b3 01                	mov    bl,0x1
   140329a46:	41 8d 40 09          	lea    eax,[r8+0x9]
   140329a4a:	44 8b c9             	mov    r9d,ecx
   140329a4d:	85 c0                	test   eax,eax
   140329a4f:	75 07                	jne    0x140329a58
   140329a51:	85 d2                	test   edx,edx
   140329a53:	7e 03                	jle    0x140329a58
   140329a55:	44 2b ca             	sub    r9d,edx
   140329a58:	f2 41 0f 10 53 38    	movsd  xmm2,QWORD PTR [r11+0x38]
   140329a5e:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329a63:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329a68:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329a6b:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329a6e:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329a72:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329a76:	f3 41 0f 11 4a 20    	movss  DWORD PTR [r10+0x20],xmm1
   140329a7c:	7a 02                	jp     0x140329a80
   140329a7e:	74 02                	je     0x140329a82
   140329a80:	b3 01                	mov    bl,0x1
   140329a82:	41 8d 40 0a          	lea    eax,[r8+0xa]
   140329a86:	44 8b c9             	mov    r9d,ecx
   140329a89:	85 c0                	test   eax,eax
   140329a8b:	75 07                	jne    0x140329a94
   140329a8d:	85 d2                	test   edx,edx
   140329a8f:	7e 03                	jle    0x140329a94
   140329a91:	44 2b ca             	sub    r9d,edx
   140329a94:	f2 41 0f 10 53 40    	movsd  xmm2,QWORD PTR [r11+0x40]
   140329a9a:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329a9f:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329aa4:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329aa7:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329aaa:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329aae:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329ab2:	f3 41 0f 11 4a 24    	movss  DWORD PTR [r10+0x24],xmm1
   140329ab8:	7a 02                	jp     0x140329abc
   140329aba:	74 02                	je     0x140329abe
   140329abc:	b3 01                	mov    bl,0x1
   140329abe:	41 8d 40 0b          	lea    eax,[r8+0xb]
   140329ac2:	44 8b c9             	mov    r9d,ecx
   140329ac5:	85 c0                	test   eax,eax
   140329ac7:	75 07                	jne    0x140329ad0
   140329ac9:	85 d2                	test   edx,edx
   140329acb:	7e 03                	jle    0x140329ad0
   140329acd:	44 2b ca             	sub    r9d,edx
   140329ad0:	f2 41 0f 10 53 48    	movsd  xmm2,QWORD PTR [r11+0x48]
   140329ad6:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329adb:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329ae0:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329ae3:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329ae6:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329aea:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329aee:	f3 41 0f 11 4a 28    	movss  DWORD PTR [r10+0x28],xmm1
   140329af4:	7a 02                	jp     0x140329af8
   140329af6:	74 02                	je     0x140329afa
   140329af8:	b3 01                	mov    bl,0x1
   140329afa:	41 8d 40 0c          	lea    eax,[r8+0xc]
   140329afe:	44 8b c9             	mov    r9d,ecx
   140329b01:	85 c0                	test   eax,eax
   140329b03:	75 07                	jne    0x140329b0c
   140329b05:	85 d2                	test   edx,edx
   140329b07:	7e 03                	jle    0x140329b0c
   140329b09:	44 2b ca             	sub    r9d,edx
   140329b0c:	f2 41 0f 10 53 50    	movsd  xmm2,QWORD PTR [r11+0x50]
   140329b12:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329b17:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329b1c:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329b1f:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329b22:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329b26:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329b2a:	f3 41 0f 11 4a 2c    	movss  DWORD PTR [r10+0x2c],xmm1
   140329b30:	7a 02                	jp     0x140329b34
   140329b32:	74 02                	je     0x140329b36
   140329b34:	b3 01                	mov    bl,0x1
   140329b36:	41 8d 40 0d          	lea    eax,[r8+0xd]
   140329b3a:	44 8b c9             	mov    r9d,ecx
   140329b3d:	85 c0                	test   eax,eax
   140329b3f:	75 07                	jne    0x140329b48
   140329b41:	85 d2                	test   edx,edx
   140329b43:	7e 03                	jle    0x140329b48
   140329b45:	44 2b ca             	sub    r9d,edx
   140329b48:	f2 41 0f 10 53 58    	movsd  xmm2,QWORD PTR [r11+0x58]
   140329b4e:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329b53:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329b58:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329b5b:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329b5e:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329b62:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329b66:	f3 41 0f 11 4a 30    	movss  DWORD PTR [r10+0x30],xmm1
   140329b6c:	7a 02                	jp     0x140329b70
   140329b6e:	74 02                	je     0x140329b72
   140329b70:	b3 01                	mov    bl,0x1
   140329b72:	41 8d 40 0e          	lea    eax,[r8+0xe]
   140329b76:	44 8b c9             	mov    r9d,ecx
   140329b79:	85 c0                	test   eax,eax
   140329b7b:	75 07                	jne    0x140329b84
   140329b7d:	85 d2                	test   edx,edx
   140329b7f:	7e 03                	jle    0x140329b84
   140329b81:	44 2b ca             	sub    r9d,edx
   140329b84:	f2 41 0f 10 53 60    	movsd  xmm2,QWORD PTR [r11+0x60]
   140329b8a:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329b8f:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329b94:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329b97:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329b9a:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329b9e:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329ba2:	f3 41 0f 11 4a 34    	movss  DWORD PTR [r10+0x34],xmm1
   140329ba8:	7a 02                	jp     0x140329bac
   140329baa:	74 02                	je     0x140329bae
   140329bac:	b3 01                	mov    bl,0x1
   140329bae:	41 8d 40 0f          	lea    eax,[r8+0xf]
   140329bb2:	44 8b c9             	mov    r9d,ecx
   140329bb5:	85 c0                	test   eax,eax
   140329bb7:	75 07                	jne    0x140329bc0
   140329bb9:	85 d2                	test   edx,edx
   140329bbb:	7e 03                	jle    0x140329bc0
   140329bbd:	44 2b ca             	sub    r9d,edx
   140329bc0:	f2 41 0f 10 53 68    	movsd  xmm2,QWORD PTR [r11+0x68]
   140329bc6:	66 41 0f 2e d0       	ucomisd xmm2,xmm8
   140329bcb:	66 41 0f 6e c1       	movd   xmm0,r9d
   140329bd0:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   140329bd3:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140329bd6:	f2 0f 59 ca          	mulsd  xmm1,xmm2
   140329bda:	66 0f 5a c9          	cvtpd2ps xmm1,xmm1
   140329bde:	f3 41 0f 11 4a 38    	movss  DWORD PTR [r10+0x38],xmm1
   140329be4:	7a 02                	jp     0x140329be8
   140329be6:	74 02                	je     0x140329bea
   140329be8:	b3 01                	mov    bl,0x1
   140329bea:	41 83 c0 10          	add    r8d,0x10
   140329bee:	49 83 eb 80          	sub    r11,0xffffffffffffff80
   140329bf2:	49 83 c2 40          	add    r10,0x40
   140329bf6:	41 83 f8 40          	cmp    r8d,0x40
   140329bfa:	0f 82 30 fc ff ff    	jb     0x140329830
   140329c00:	8b 86 28 02 00 00    	mov    eax,DWORD PTR [rsi+0x228]
   140329c06:	4c 8d 44 24 50       	lea    r8,[rsp+0x50]
   140329c0b:	0f b6 bc 24 58 02 00 	movzx  edi,BYTE PTR [rsp+0x258]
   140329c12:	00 
   140329c13:	49 8b d4             	mov    rdx,r12
   140329c16:	f3 0f 10 b4 24 38 02 	movss  xmm6,DWORD PTR [rsp+0x238]
   140329c1d:	00 00 
   140329c1f:	49 8b cf             	mov    rcx,r15
   140329c22:	40 88 7c 24 48       	mov    BYTE PTR [rsp+0x48],dil
   140329c27:	0f 28 de             	movaps xmm3,xmm6
   140329c2a:	89 44 24 40          	mov    DWORD PTR [rsp+0x40],eax
   140329c2e:	0f b6 86 2c 02 00 00 	movzx  eax,BYTE PTR [rsi+0x22c]
   140329c35:	88 44 24 38          	mov    BYTE PTR [rsp+0x38],al
   140329c39:	8b 84 24 50 02 00 00 	mov    eax,DWORD PTR [rsp+0x250]
   140329c40:	89 44 24 30          	mov    DWORD PTR [rsp+0x30],eax
   140329c44:	44 89 74 24 28       	mov    DWORD PTR [rsp+0x28],r14d
   140329c49:	89 6c 24 20          	mov    DWORD PTR [rsp+0x20],ebp
   140329c4d:	e8 9e f7 ff ff       	call   0x1403293f0
   140329c52:	f2 0f 10 3d 9e 65 52 	movsd  xmm7,QWORD PTR [rip+0x52659e]        # 0x1408501f8
   140329c59:	00 
   140329c5a:	f3 0f 10 44 24 58    	movss  xmm0,DWORD PTR [rsp+0x58]
   140329c60:	0f 28 d7             	movaps xmm2,xmm7
   140329c63:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140329c66:	0f 28 cf             	movaps xmm1,xmm7
   140329c69:	f2 0f 5e d0          	divsd  xmm2,xmm0
   140329c6d:	0f 5a c6             	cvtps2pd xmm0,xmm6
   140329c70:	f2 0f 59 d0          	mulsd  xmm2,xmm0
   140329c74:	0f 28 c2             	movaps xmm0,xmm2
   140329c77:	e8 ec 70 2f 00       	call   0x140620d68
   140329c7c:	66 44 0f 2f c0       	comisd xmm8,xmm0
   140329c81:	0f 28 d8             	movaps xmm3,xmm0
   140329c84:	76 04                	jbe    0x140329c8a
   140329c86:	f2 0f 58 df          	addsd  xmm3,xmm7
   140329c8a:	f2 0f 10 7c 24 70    	movsd  xmm7,QWORD PTR [rsp+0x70]
   140329c90:	66 41 0f 2e f8       	ucomisd xmm7,xmm8
   140329c95:	f3 0f 10 56 04       	movss  xmm2,DWORD PTR [rsi+0x4]
   140329c9a:	0f 5a d2             	cvtps2pd xmm2,xmm2
   140329c9d:	7a 0b                	jp     0x140329caa
   140329c9f:	75 09                	jne    0x140329caa
   140329ca1:	41 0f 28 c0          	movaps xmm0,xmm8
   140329ca5:	e9 bf 04 00 00       	jmp    0x14032a169
   140329caa:	f2 0f 10 2d 5e dd 37 	movsd  xmm5,QWORD PTR [rip+0x37dd5e]        # 0x1406a7a10
   140329cb1:	00 
   140329cb2:	0f 28 c3             	movaps xmm0,xmm3
   140329cb5:	f2 0f 10 35 c3 dd 37 	movsd  xmm6,QWORD PTR [rip+0x37ddc3]        # 0x1406a7a80
   140329cbc:	00 
   140329cbd:	33 c9                	xor    ecx,ecx
   140329cbf:	f2 0f 10 25 61 64 52 	movsd  xmm4,QWORD PTR [rip+0x526461]        # 0x140850128
   140329cc6:	00 
   140329cc7:	0f 57 c9             	xorps  xmm1,xmm1
   140329cca:	f2 0f 59 c5          	mulsd  xmm0,xmm5
   140329cce:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   140329cd2:	f2 0f 58 c4          	addsd  xmm0,xmm4
   140329cd6:	84 db                	test   bl,bl
   140329cd8:	0f 84 38 02 00 00    	je     0x140329f16
   140329cde:	f2 0f 58 15 1a dd 37 	addsd  xmm2,QWORD PTR [rip+0x37dd1a]        # 0x1406a7a00
   140329ce5:	00 
   140329ce6:	f2 4c 0f 2c c8       	cvttsd2si r9,xmm0
   140329ceb:	f2 0f 10 05 bd 65 52 	movsd  xmm0,QWORD PTR [rip+0x5265bd]        # 0x1408502b0
   140329cf2:	00 
   140329cf3:	f2 0f 59 d5          	mulsd  xmm2,xmm5
   140329cf7:	f2 0f 59 d6          	mulsd  xmm2,xmm6
   140329cfb:	f2 0f 58 d4          	addsd  xmm2,xmm4
   140329cff:	66 0f 2f d0          	comisd xmm2,xmm0
   140329d03:	72 17                	jb     0x140329d1c
   140329d05:	f2 0f 5c d0          	subsd  xmm2,xmm0
   140329d09:	66 0f 2f d0          	comisd xmm2,xmm0
   140329d0d:	73 0d                	jae    0x140329d1c
   140329d0f:	48 b8 00 00 00 00 00 	movabs rax,0x8000000000000000
   140329d16:	00 00 80 
   140329d19:	48 8b c8             	mov    rcx,rax
   140329d1c:	4c 63 64 24 60       	movsxd r12,DWORD PTR [rsp+0x60]
   140329d21:	8b 6c 24 64          	mov    ebp,DWORD PTR [rsp+0x64]
   140329d25:	49 8b fc             	mov    rdi,r12
   140329d28:	f2 48 0f 2c d2       	cvttsd2si rdx,xmm2
   140329d2d:	48 03 d1             	add    rdx,rcx
   140329d30:	49 2b d1             	sub    rdx,r9
   140329d33:	44 3b e5             	cmp    r12d,ebp
   140329d36:	0f 8d 6d 01 00 00    	jge    0x140329ea9
   140329d3c:	44 8b 7c 24 68       	mov    r15d,DWORD PTR [rsp+0x68]
   140329d41:	4d 8b c4             	mov    r8,r12
   140329d44:	48 8b 74 24 50       	mov    rsi,QWORD PTR [rsp+0x50]
   140329d49:	4c 8b 1d f0 c5 bd 14 	mov    r11,QWORD PTR [rip+0x14bdc5f0]        # 0x154f06340
   140329d50:	45 8d 77 ff          	lea    r14d,[r15-0x1]
   140329d54:	41 f7 d6             	not    r14d
   140329d57:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   140329d5e:	00 00 
   140329d60:	41 8b ce             	mov    ecx,r14d
   140329d63:	8b c5                	mov    eax,ebp
   140329d65:	23 cf                	and    ecx,edi
   140329d67:	41 03 cf             	add    ecx,r15d
   140329d6a:	3b cd                	cmp    ecx,ebp
   140329d6c:	0f 4c c1             	cmovl  eax,ecx
   140329d6f:	48 63 c8             	movsxd rcx,eax
   140329d72:	4c 3b c1             	cmp    r8,rcx
   140329d75:	0f 8d f1 00 00 00    	jge    0x140329e6c
   140329d7b:	48 8b c1             	mov    rax,rcx
   140329d7e:	49 2b c0             	sub    rax,r8
   140329d81:	48 83 f8 04          	cmp    rax,0x4
   140329d85:	0f 8c ae 00 00 00    	jl     0x140329e39
   140329d8b:	48 8b d9             	mov    rbx,rcx
   140329d8e:	4c 8d 56 08          	lea    r10,[rsi+0x8]
   140329d92:	49 2b d8             	sub    rbx,r8
   140329d95:	4f 8d 14 82          	lea    r10,[r10+r8*4]
   140329d99:	48 83 eb 04          	sub    rbx,0x4
   140329d9d:	48 c1 eb 02          	shr    rbx,0x2
   140329da1:	48 ff c3             	inc    rbx
   140329da4:	8d 3c 9f             	lea    edi,[rdi+rbx*4]
   140329da7:	4d 8d 04 98          	lea    r8,[r8+rbx*4]
   140329dab:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140329db0:	49 03 d1             	add    rdx,r9
   140329db3:	48 8b c2             	mov    rax,rdx
   140329db6:	49 03 d1             	add    rdx,r9
   140329db9:	48 c1 e8 20          	shr    rax,0x20
   140329dbd:	25 ff 7f 00 00       	and    eax,0x7fff
   140329dc2:	f3 41 0f 10 04 83    	movss  xmm0,DWORD PTR [r11+rax*4]
   140329dc8:	48 8b c2             	mov    rax,rdx
   140329dcb:	f3 41 0f 59 42 f8    	mulss  xmm0,DWORD PTR [r10-0x8]
   140329dd1:	49 03 d1             	add    rdx,r9
   140329dd4:	48 c1 e8 20          	shr    rax,0x20
   140329dd8:	25 ff 7f 00 00       	and    eax,0x7fff
   140329ddd:	f3 0f 5c c8          	subss  xmm1,xmm0
   140329de1:	f3 41 0f 10 04 83    	movss  xmm0,DWORD PTR [r11+rax*4]
   140329de7:	48 8b c2             	mov    rax,rdx
   140329dea:	f3 41 0f 59 42 fc    	mulss  xmm0,DWORD PTR [r10-0x4]
   140329df0:	49 03 d1             	add    rdx,r9
   140329df3:	48 c1 e8 20          	shr    rax,0x20
   140329df7:	25 ff 7f 00 00       	and    eax,0x7fff
   140329dfc:	f3 0f 5c c8          	subss  xmm1,xmm0
   140329e00:	f3 41 0f 10 04 83    	movss  xmm0,DWORD PTR [r11+rax*4]
   140329e06:	48 8b c2             	mov    rax,rdx
   140329e09:	f3 41 0f 59 02       	mulss  xmm0,DWORD PTR [r10]
   140329e0e:	48 c1 e8 20          	shr    rax,0x20
   140329e12:	25 ff 7f 00 00       	and    eax,0x7fff
   140329e17:	f3 0f 5c c8          	subss  xmm1,xmm0
   140329e1b:	f3 41 0f 10 04 83    	movss  xmm0,DWORD PTR [r11+rax*4]
   140329e21:	f3 41 0f 59 42 04    	mulss  xmm0,DWORD PTR [r10+0x4]
   140329e27:	49 83 c2 10          	add    r10,0x10
   140329e2b:	f3 0f 5c c8          	subss  xmm1,xmm0
   140329e2f:	48 83 eb 01          	sub    rbx,0x1
   140329e33:	0f 85 77 ff ff ff    	jne    0x140329db0
   140329e39:	4c 3b c1             	cmp    r8,rcx
   140329e3c:	7d 2e                	jge    0x140329e6c
   140329e3e:	8b c1                	mov    eax,ecx
   140329e40:	41 2b c0             	sub    eax,r8d
   140329e43:	03 f8                	add    edi,eax
   140329e45:	49 03 d1             	add    rdx,r9
   140329e48:	48 8b c2             	mov    rax,rdx
   140329e4b:	48 c1 e8 20          	shr    rax,0x20
   140329e4f:	25 ff 7f 00 00       	and    eax,0x7fff
   140329e54:	f3 41 0f 10 04 83    	movss  xmm0,DWORD PTR [r11+rax*4]
   140329e5a:	f3 42 0f 59 04 86    	mulss  xmm0,DWORD PTR [rsi+r8*4]
   140329e60:	49 ff c0             	inc    r8
   140329e63:	f3 0f 5c c8          	subss  xmm1,xmm0
   140329e67:	4c 3b c1             	cmp    r8,rcx
   140329e6a:	7c d9                	jl     0x140329e45
   140329e6c:	f3 42 0f 10 84 ac 90 	movss  xmm0,DWORD PTR [rsp+r13*4+0x90]
   140329e73:	00 00 00 
   140329e76:	41 ff c5             	inc    r13d
   140329e79:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140329e7c:	f2 0f 58 d8          	addsd  xmm3,xmm0
   140329e80:	66 41 0f 2f d8       	comisd xmm3,xmm8
   140329e85:	0f 28 d3             	movaps xmm2,xmm3
   140329e88:	f2 0f 59 d5          	mulsd  xmm2,xmm5
   140329e8c:	f2 0f 59 d6          	mulsd  xmm2,xmm6
   140329e90:	72 06                	jb     0x140329e98
   140329e92:	f2 0f 58 d4          	addsd  xmm2,xmm4
   140329e96:	eb 04                	jmp    0x140329e9c
   140329e98:	f2 0f 5c d4          	subsd  xmm2,xmm4
   140329e9c:	f2 4c 0f 2c ca       	cvttsd2si r9,xmm2
   140329ea1:	3b fd                	cmp    edi,ebp
   140329ea3:	0f 8c b7 fe ff ff    	jl     0x140329d60
   140329ea9:	80 bc 24 58 02 00 00 	cmp    BYTE PTR [rsp+0x258],0x0
   140329eb0:	00 
   140329eb1:	0f 57 c0             	xorps  xmm0,xmm0
   140329eb4:	f2 0f 10 35 6c db 37 	movsd  xmm6,QWORD PTR [rip+0x37db6c]        # 0x1406a7a28
   140329ebb:	00 
   140329ebc:	f3 0f 5a c1          	cvtss2sd xmm0,xmm1
   140329ec0:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   140329ec4:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   140329ec8:	0f 5a d8             	cvtps2pd xmm3,xmm0
   140329ecb:	0f 28 cb             	movaps xmm1,xmm3
   140329ece:	0f 28 c3             	movaps xmm0,xmm3
   140329ed1:	f2 0f 59 05 e7 62 52 	mulsd  xmm0,QWORD PTR [rip+0x5262e7]        # 0x1408501c0
   140329ed8:	00 
   140329ed9:	f2 0f 58 cb          	addsd  xmm1,xmm3
   140329edd:	66 0f 5a e9          	cvtpd2ps xmm5,xmm1
   140329ee1:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   140329ee5:	74 18                	je     0x140329eff
   140329ee7:	f3 0f 10 44 24 78    	movss  xmm0,DWORD PTR [rsp+0x78]
   140329eed:	41 2b ec             	sub    ebp,r12d
   140329ef0:	0f 57 d2             	xorps  xmm2,xmm2
   140329ef3:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140329ef6:	f2 0f 2a d5          	cvtsi2sd xmm2,ebp
   140329efa:	e9 8f 01 00 00       	jmp    0x14032a08e
   140329eff:	f2 0f 10 05 71 62 52 	movsd  xmm0,QWORD PTR [rip+0x526271]        # 0x140850178
   140329f06:	00 
   140329f07:	41 2b ec             	sub    ebp,r12d
   140329f0a:	0f 57 d2             	xorps  xmm2,xmm2
   140329f0d:	f2 0f 2a d5          	cvtsi2sd xmm2,ebp
   140329f11:	e9 78 01 00 00       	jmp    0x14032a08e
   140329f16:	f2 0f 10 1d 92 63 52 	movsd  xmm3,QWORD PTR [rip+0x526392]        # 0x1408502b0
   140329f1d:	00 
   140329f1e:	48 b8 00 00 00 00 00 	movabs rax,0x8000000000000000
   140329f25:	00 00 80 
   140329f28:	66 0f 2f c3          	comisd xmm0,xmm3
   140329f2c:	72 0d                	jb     0x140329f3b
   140329f2e:	f2 0f 5c c3          	subsd  xmm0,xmm3
   140329f32:	66 0f 2f c3          	comisd xmm0,xmm3
   140329f36:	73 03                	jae    0x140329f3b
   140329f38:	48 03 c8             	add    rcx,rax
   140329f3b:	f2 0f 59 d5          	mulsd  xmm2,xmm5
   140329f3f:	f2 4c 0f 2c c8       	cvttsd2si r9,xmm0
   140329f44:	f2 0f 59 d6          	mulsd  xmm2,xmm6
   140329f48:	4c 03 c9             	add    r9,rcx
   140329f4b:	33 c9                	xor    ecx,ecx
   140329f4d:	f2 0f 58 d4          	addsd  xmm2,xmm4
   140329f51:	66 0f 2f d3          	comisd xmm2,xmm3
   140329f55:	72 0d                	jb     0x140329f64
   140329f57:	f2 0f 5c d3          	subsd  xmm2,xmm3
   140329f5b:	66 0f 2f d3          	comisd xmm2,xmm3
   140329f5f:	73 03                	jae    0x140329f64
   140329f61:	48 8b c8             	mov    rcx,rax
   140329f64:	4c 63 5c 24 60       	movsxd r11,DWORD PTR [rsp+0x60]
   140329f69:	8b 5c 24 64          	mov    ebx,DWORD PTR [rsp+0x64]
   140329f6d:	f2 48 0f 2c d2       	cvttsd2si rdx,xmm2
   140329f72:	48 03 d1             	add    rdx,rcx
   140329f75:	49 2b d1             	sub    rdx,r9
   140329f78:	44 3b db             	cmp    r11d,ebx
   140329f7b:	0f 8d b7 00 00 00    	jge    0x14032a038
   140329f81:	40 84 ff             	test   dil,dil
   140329f84:	75 71                	jne    0x140329ff7
   140329f86:	48 8b 4c 24 50       	mov    rcx,QWORD PTR [rsp+0x50]
   140329f8b:	4a 8d 04 9d 00 00 00 	lea    rax,[r11*4+0x0]
   140329f92:	00 
   140329f93:	4c 8b 94 24 80 00 00 	mov    r10,QWORD PTR [rsp+0x80]
   140329f9a:	00 
   140329f9b:	48 8b 3d 9e c3 bd 14 	mov    rdi,QWORD PTR [rip+0x14bdc39e]        # 0x154f06340
   140329fa2:	4c 2b d0             	sub    r10,rax
   140329fa5:	4c 2b d1             	sub    r10,rcx
   140329fa8:	4c 8d 04 08          	lea    r8,[rax+rcx*1]
   140329fac:	8b c3                	mov    eax,ebx
   140329fae:	41 2b c3             	sub    eax,r11d
   140329fb1:	48 63 c8             	movsxd rcx,eax
   140329fb4:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140329fb8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [rax+rax*1+0x0]
   140329fbf:	00 
   140329fc0:	f3 43 0f 10 04 02    	movss  xmm0,DWORD PTR [r10+r8*1]
   140329fc6:	49 03 d1             	add    rdx,r9
   140329fc9:	f3 41 0f 59 00       	mulss  xmm0,DWORD PTR [r8]
   140329fce:	48 8b c2             	mov    rax,rdx
   140329fd1:	48 c1 e8 20          	shr    rax,0x20
   140329fd5:	49 83 c0 04          	add    r8,0x4
   140329fd9:	25 ff 7f 00 00       	and    eax,0x7fff
   140329fde:	f3 0f 59 04 87       	mulss  xmm0,DWORD PTR [rdi+rax*4]
   140329fe3:	f3 0f 5c c8          	subss  xmm1,xmm0
   140329fe7:	48 83 e9 01          	sub    rcx,0x1
   140329feb:	75 d3                	jne    0x140329fc0
   140329fed:	0f b6 bc 24 58 02 00 	movzx  edi,BYTE PTR [rsp+0x258]
   140329ff4:	00 
   140329ff5:	eb 41                	jmp    0x14032a038
   140329ff7:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   140329ffc:	4c 8b 15 3d c3 bd 14 	mov    r10,QWORD PTR [rip+0x14bdc33d]        # 0x154f06340
   14032a003:	4e 8d 04 98          	lea    r8,[rax+r11*4]
   14032a007:	8b c3                	mov    eax,ebx
   14032a009:	41 2b c3             	sub    eax,r11d
   14032a00c:	48 63 c8             	movsxd rcx,eax
   14032a00f:	90                   	nop
   14032a010:	49 03 d1             	add    rdx,r9
   14032a013:	48 8b c2             	mov    rax,rdx
   14032a016:	48 c1 e8 20          	shr    rax,0x20
   14032a01a:	25 ff 7f 00 00       	and    eax,0x7fff
   14032a01f:	f3 41 0f 10 04 82    	movss  xmm0,DWORD PTR [r10+rax*4]
   14032a025:	f3 41 0f 59 00       	mulss  xmm0,DWORD PTR [r8]
   14032a02a:	49 83 c0 04          	add    r8,0x4
   14032a02e:	f3 0f 5c c8          	subss  xmm1,xmm0
   14032a032:	48 83 e9 01          	sub    rcx,0x1
   14032a036:	75 d8                	jne    0x14032a010
   14032a038:	f2 0f 10 35 e8 d9 37 	movsd  xmm6,QWORD PTR [rip+0x37d9e8]        # 0x1406a7a28
   14032a03f:	00 
   14032a040:	0f 57 c0             	xorps  xmm0,xmm0
   14032a043:	f3 0f 5a c1          	cvtss2sd xmm0,xmm1
   14032a047:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14032a04b:	66 0f 5a c0          	cvtpd2ps xmm0,xmm0
   14032a04f:	0f 5a d8             	cvtps2pd xmm3,xmm0
   14032a052:	0f 28 cb             	movaps xmm1,xmm3
   14032a055:	0f 28 c3             	movaps xmm0,xmm3
   14032a058:	f2 0f 59 05 60 61 52 	mulsd  xmm0,QWORD PTR [rip+0x526160]        # 0x1408501c0
   14032a05f:	00 
   14032a060:	f2 0f 58 cb          	addsd  xmm1,xmm3
   14032a064:	66 0f 5a e9          	cvtpd2ps xmm5,xmm1
   14032a068:	66 0f 5a c8          	cvtpd2ps xmm1,xmm0
   14032a06c:	40 84 ff             	test   dil,dil
   14032a06f:	74 0b                	je     0x14032a07c
   14032a071:	f3 0f 10 44 24 78    	movss  xmm0,DWORD PTR [rsp+0x78]
   14032a077:	0f 5a c0             	cvtps2pd xmm0,xmm0
   14032a07a:	eb 08                	jmp    0x14032a084
   14032a07c:	f2 0f 10 05 f4 60 52 	movsd  xmm0,QWORD PTR [rip+0x5260f4]        # 0x140850178
   14032a083:	00 
   14032a084:	41 2b db             	sub    ebx,r11d
   14032a087:	0f 57 d2             	xorps  xmm2,xmm2
   14032a08a:	f2 0f 2a d3          	cvtsi2sd xmm2,ebx
   14032a08e:	f2 0f 59 15 c2 d9 37 	mulsd  xmm2,QWORD PTR [rip+0x37d9c2]        # 0x1406a7a58
   14032a095:	00 
   14032a096:	8b 44 24 5c          	mov    eax,DWORD PTR [rsp+0x5c]
   14032a09a:	f2 0f 59 d0          	mulsd  xmm2,xmm0
   14032a09e:	0f 5a c5             	cvtps2pd xmm0,xmm5
   14032a0a1:	0f 28 e2             	movaps xmm4,xmm2
   14032a0a4:	f2 0f 58 e7          	addsd  xmm4,xmm7
   14032a0a8:	f2 0f 58 e3          	addsd  xmm4,xmm3
   14032a0ac:	0f 28 da             	movaps xmm3,xmm2
   14032a0af:	f2 0f 59 15 81 40 36 	mulsd  xmm2,QWORD PTR [rip+0x364081]        # 0x14068e138
   14032a0b6:	00 
   14032a0b7:	f2 0f 59 1d 19 61 52 	mulsd  xmm3,QWORD PTR [rip+0x526119]        # 0x1408501d8
   14032a0be:	00 
   14032a0bf:	f2 0f 58 d7          	addsd  xmm2,xmm7
   14032a0c3:	f2 0f 58 df          	addsd  xmm3,xmm7
   14032a0c7:	f2 0f 58 d8          	addsd  xmm3,xmm0
   14032a0cb:	0f 5a c1             	cvtps2pd xmm0,xmm1
   14032a0ce:	0f 57 c9             	xorps  xmm1,xmm1
   14032a0d1:	f2 0f 58 d0          	addsd  xmm2,xmm0
   14032a0d5:	f2 48 0f 2a c8       	cvtsi2sd xmm1,rax
   14032a0da:	48 8b 84 24 88 00 00 	mov    rax,QWORD PTR [rsp+0x88]
   14032a0e1:	00 
   14032a0e2:	66 0f 5a c4          	cvtpd2ps xmm0,xmm4
   14032a0e6:	0f 28 e1             	movaps xmm4,xmm1
   14032a0e9:	0f 5a e8             	cvtps2pd xmm5,xmm0
   14032a0ec:	66 0f 5a c3          	cvtpd2ps xmm0,xmm3
   14032a0f0:	f2 0f 59 e9          	mulsd  xmm5,xmm1
   14032a0f4:	0f 5a d8             	cvtps2pd xmm3,xmm0
   14032a0f7:	66 0f 5a c2          	cvtpd2ps xmm0,xmm2
   14032a0fb:	f2 0f 59 d9          	mulsd  xmm3,xmm1
   14032a0ff:	0f 5a d0             	cvtps2pd xmm2,xmm0
   14032a102:	f2 0f 5c dd          	subsd  xmm3,xmm5
   14032a106:	f2 0f 59 e7          	mulsd  xmm4,xmm7
   14032a10a:	f2 0f 59 d1          	mulsd  xmm2,xmm1
   14032a10e:	f2 0f 10 0d 02 d9 37 	movsd  xmm1,QWORD PTR [rip+0x37d902]        # 0x1406a7a18
   14032a115:	00 
   14032a116:	0f 28 c3             	movaps xmm0,xmm3
   14032a119:	f2 0f 59 c6          	mulsd  xmm0,xmm6
   14032a11d:	f2 0f 5c d5          	subsd  xmm2,xmm5
   14032a121:	f2 0f 59 d1          	mulsd  xmm2,xmm1
   14032a125:	f2 0f 5c d0          	subsd  xmm2,xmm0
   14032a129:	f2 0f 5e 15 6f d9 37 	divsd  xmm2,QWORD PTR [rip+0x37d96f]        # 0x1406a7aa0
   14032a130:	00 
   14032a131:	0f 28 c2             	movaps xmm0,xmm2
   14032a134:	f2 0f 11 10          	movsd  QWORD PTR [rax],xmm2
   14032a138:	f2 0f 59 05 30 d9 37 	mulsd  xmm0,QWORD PTR [rip+0x37d930]        # 0x1406a7a70
   14032a13f:	00 
   14032a140:	f2 0f 59 d1          	mulsd  xmm2,xmm1
   14032a144:	f2 0f 5c d8          	subsd  xmm3,xmm0
   14032a148:	0f 28 c4             	movaps xmm0,xmm4
   14032a14b:	f2 0f 59 d1          	mulsd  xmm2,xmm1
   14032a14f:	f2 0f 5e d9          	divsd  xmm3,xmm1
   14032a153:	f2 0f 5c ea          	subsd  xmm5,xmm2
   14032a157:	f2 0f 11 58 08       	movsd  QWORD PTR [rax+0x8],xmm3
   14032a15c:	f2 0f 59 d9          	mulsd  xmm3,xmm1
   14032a160:	f2 0f 5c eb          	subsd  xmm5,xmm3
   14032a164:	f2 0f 11 68 10       	movsd  QWORD PTR [rax+0x10],xmm5
   14032a169:	48 8b 8c 24 90 01 00 	mov    rcx,QWORD PTR [rsp+0x190]
   14032a170:	00 
   14032a171:	48 33 cc             	xor    rcx,rsp
   14032a174:	e8 87 14 2f 00       	call   0x14061b600
   14032a179:	4c 8d 9c 24 d0 01 00 	lea    r11,[rsp+0x1d0]
   14032a180:	00 
   14032a181:	49 8b 5b 50          	mov    rbx,QWORD PTR [r11+0x50]
   14032a185:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
   14032a18a:	41 0f 28 7b e0       	movaps xmm7,XMMWORD PTR [r11-0x20]
   14032a18f:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   14032a194:	49 8b e3             	mov    rsp,r11
   14032a197:	41 5f                	pop    r15
   14032a199:	41 5e                	pop    r14
   14032a19b:	41 5d                	pop    r13
   14032a19d:	41 5c                	pop    r12
   14032a19f:	5f                   	pop    rdi
   14032a1a0:	5e                   	pop    rsi
   14032a1a1:	5d                   	pop    rbp
   14032a1a2:	c3                   	ret
