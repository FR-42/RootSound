
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014031f9b0 <.text+0x31e9b0>:
   14031f9b0:	41 8b c2             	mov    eax,r10d
   14031f9b3:	41 f7 f0             	div    r8d
   14031f9b6:	0f 5b c0             	cvtdq2ps xmm0,xmm0
   14031f9b9:	8b c8                	mov    ecx,eax
   14031f9bb:	45 33 c0             	xor    r8d,r8d
   14031f9be:	33 d2                	xor    edx,edx
   14031f9c0:	f3 0f 11 05 70 a6 66 	movss  DWORD PTR [rip+0x66a670],xmm0        # 0x14098a038
   14031f9c7:	00 
   14031f9c8:	0f 57 c0             	xorps  xmm0,xmm0
   14031f9cb:	f3 48 0f 2a c1       	cvtsi2ss xmm0,rcx
   14031f9d0:	33 c9                	xor    ecx,ecx
   14031f9d2:	f3 0f 11 05 6e a6 66 	movss  DWORD PTR [rip+0x66a66e],xmm0        # 0x14098a048
   14031f9d9:	00 
   14031f9da:	e8 a1 6e 00 00       	call   0x140326880
   14031f9df:	f3 0f 10 0d c5 a7 66 	movss  xmm1,DWORD PTR [rip+0x66a7c5]        # 0x14098a1ac
   14031f9e6:	00 
   14031f9e7:	8b c7                	mov    eax,edi
   14031f9e9:	0f 28 c1             	movaps xmm0,xmm1
   14031f9ec:	f3 0f 59 05 f4 e6 36 	mulss  xmm0,DWORD PTR [rip+0x36e6f4]        # 0x14068e0e8
   14031f9f3:	00 
   14031f9f4:	f3 0f 58 c6          	addss  xmm0,xmm6
   14031f9f8:	f3 0f 2c c8          	cvttss2si ecx,xmm0
   14031f9fc:	3b c8                	cmp    ecx,eax
   14031f9fe:	f3 0f 59 0d ba 05 53 	mulss  xmm1,DWORD PTR [rip+0x5305ba]        # 0x14084ffc0
   14031fa05:	00 
   14031fa06:	0f 4f c1             	cmovg  eax,ecx
   14031fa09:	89 05 4d a6 66 00    	mov    DWORD PTR [rip+0x66a64d],eax        # 0x14098a05c
   14031fa0f:	8b c7                	mov    eax,edi
   14031fa11:	0f 4f c1             	cmovg  eax,ecx
   14031fa14:	c7 05 46 a6 66 00 3f 	mov    DWORD PTR [rip+0x66a646],0x13f        # 0x14098a064
   14031fa1b:	01 00 00 
   14031fa1e:	89 05 3c a6 66 00    	mov    DWORD PTR [rip+0x66a63c],eax        # 0x14098a060
   14031fa24:	f3 0f 58 ce          	addss  xmm1,xmm6
   14031fa28:	f3 0f 2c c1          	cvttss2si eax,xmm1
   14031fa2c:	3b c7                	cmp    eax,edi
   14031fa2e:	0f 4f f8             	cmovg  edi,eax
   14031fa31:	89 3d ad a5 66 00    	mov    DWORD PTR [rip+0x66a5ad],edi        # 0x140989fe4
   14031fa37:	4c 8d 9c 24 a0 00 00 	lea    r11,[rsp+0xa0]
   14031fa3e:	00 
   14031fa3f:	49 8b 5b 10          	mov    rbx,QWORD PTR [r11+0x10]
   14031fa43:	49 8b 6b 18          	mov    rbp,QWORD PTR [r11+0x18]
   14031fa47:	49 8b 73 20          	mov    rsi,QWORD PTR [r11+0x20]
   14031fa4b:	41 0f 28 73 f0       	movaps xmm6,XMMWORD PTR [r11-0x10]
