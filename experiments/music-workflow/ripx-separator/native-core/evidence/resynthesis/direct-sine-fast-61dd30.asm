
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014061dd30 <.text+0x61cd30>:
   14061dd30:	48 81 ec d8 00 00 00 	sub    rsp,0xd8
   14061dd37:	0f 29 bc 24 c0 00 00 	movaps XMMWORD PTR [rsp+0xc0],xmm7
   14061dd3e:	00 
   14061dd3f:	0f 29 b4 24 b0 00 00 	movaps XMMWORD PTR [rsp+0xb0],xmm6
   14061dd46:	00 
   14061dd47:	66 0f 28 f8          	movapd xmm7,xmm0
   14061dd4b:	66 0f 28 25 2d 3a 2d 	movapd xmm4,XMMWORD PTR [rip+0x172d3a2d]        # 0x1578f1780
   14061dd52:	17 
   14061dd53:	66 0f 28 d0          	movapd xmm2,xmm0
   14061dd57:	66 0f 59 05 11 3a 2d 	mulpd  xmm0,XMMWORD PTR [rip+0x172d3a11]        # 0x1578f1770
   14061dd5e:	17 
   14061dd5f:	66 0f 54 3d f9 39 2d 	andpd  xmm7,XMMWORD PTR [rip+0x172d39f9]        # 0x1578f1760
   14061dd66:	17 
   14061dd67:	66 0f 28 2d e1 39 2d 	movapd xmm5,XMMWORD PTR [rip+0x172d39e1]        # 0x1578f1750
   14061dd6e:	17 
   14061dd6f:	66 0f 28 35 c9 39 2d 	movapd xmm6,XMMWORD PTR [rip+0x172d39c9]        # 0x1578f1740
   14061dd76:	17 
   14061dd77:	66 0f 58 05 b1 39 2d 	addpd  xmm0,XMMWORD PTR [rip+0x172d39b1]        # 0x1578f1730
   14061dd7e:	17 
   14061dd7f:	66 0f 28 d8          	movapd xmm3,xmm0
   14061dd83:	66 0f 5c 05 a5 39 2d 	subpd  xmm0,XMMWORD PTR [rip+0x172d39a5]        # 0x1578f1730
   14061dd8a:	17 
   14061dd8b:	66 0f 66 3d 8d 39 2d 	pcmpgtd xmm7,XMMWORD PTR [rip+0x172d398d]        # 0x1578f1720
   14061dd92:	17 
   14061dd93:	66 0f 50 c7          	movmskpd eax,xmm7
   14061dd97:	0b c0                	or     eax,eax
   14061dd99:	0f 85 c9 00 00 00    	jne    0x14061de68
   14061dd9f:	66 0f 28 3d 69 39 2d 	movapd xmm7,XMMWORD PTR [rip+0x172d3969]        # 0x1578f1710
   14061dda6:	17 
   14061dda7:	66 0f 59 e0          	mulpd  xmm4,xmm0
   14061ddab:	66 0f 59 e8          	mulpd  xmm5,xmm0
   14061ddaf:	66 0f 59 f0          	mulpd  xmm6,xmm0
   14061ddb3:	66 0f 59 f8          	mulpd  xmm7,xmm0
   14061ddb7:	66 0f 73 f3 3f       	psllq  xmm3,0x3f
   14061ddbc:	66 0f 5c d4          	subpd  xmm2,xmm4
   14061ddc0:	66 0f 5c d5          	subpd  xmm2,xmm5
   14061ddc4:	66 0f 5c d6          	subpd  xmm2,xmm6
   14061ddc8:	66 0f 28 ca          	movapd xmm1,xmm2
   14061ddcc:	66 0f 59 d2          	mulpd  xmm2,xmm2
   14061ddd0:	66 0f 5c cf          	subpd  xmm1,xmm7
   14061ddd4:	66 0f 28 05 24 39 2d 	movapd xmm0,XMMWORD PTR [rip+0x172d3924]        # 0x1578f1700
   14061dddb:	17 
   14061dddc:	66 0f 28 35 0c 39 2d 	movapd xmm6,XMMWORD PTR [rip+0x172d390c]        # 0x1578f16f0
   14061dde3:	17 
   14061dde4:	66 0f 28 e2          	movapd xmm4,xmm2
   14061dde8:	66 0f 59 e4          	mulpd  xmm4,xmm4
   14061ddec:	66 0f 59 d1          	mulpd  xmm2,xmm1
   14061ddf0:	66 0f 59 c4          	mulpd  xmm0,xmm4
   14061ddf4:	66 0f 59 f4          	mulpd  xmm6,xmm4
   14061ddf8:	66 0f 58 05 e0 38 2d 	addpd  xmm0,XMMWORD PTR [rip+0x172d38e0]        # 0x1578f16e0
   14061ddff:	17 
   14061de00:	66 0f 58 35 c8 38 2d 	addpd  xmm6,XMMWORD PTR [rip+0x172d38c8]        # 0x1578f16d0
   14061de07:	17 
   14061de08:	66 0f 59 c4          	mulpd  xmm0,xmm4
   14061de0c:	66 0f 59 f4          	mulpd  xmm6,xmm4
   14061de10:	66 0f 58 05 a8 38 2d 	addpd  xmm0,XMMWORD PTR [rip+0x172d38a8]        # 0x1578f16c0
   14061de17:	17 
   14061de18:	66 0f 58 35 90 38 2d 	addpd  xmm6,XMMWORD PTR [rip+0x172d3890]        # 0x1578f16b0
   14061de1f:	17 
   14061de20:	66 0f 59 c4          	mulpd  xmm0,xmm4
   14061de24:	66 0f 59 f4          	mulpd  xmm6,xmm4
   14061de28:	66 0f 58 05 70 38 2d 	addpd  xmm0,XMMWORD PTR [rip+0x172d3870]        # 0x1578f16a0
   14061de2f:	17 
   14061de30:	66 0f 58 35 58 38 2d 	addpd  xmm6,XMMWORD PTR [rip+0x172d3858]        # 0x1578f1690
   14061de37:	17 
   14061de38:	66 0f 59 c4          	mulpd  xmm0,xmm4
   14061de3c:	66 0f 59 f2          	mulpd  xmm6,xmm2
   14061de40:	66 0f 59 c1          	mulpd  xmm0,xmm1
   14061de44:	66 0f 58 f1          	addpd  xmm6,xmm1
   14061de48:	66 0f 58 c6          	addpd  xmm0,xmm6
   14061de4c:	66 0f 57 c3          	xorpd  xmm0,xmm3
   14061de50:	0f 28 b4 24 b0 00 00 	movaps xmm6,XMMWORD PTR [rsp+0xb0]
   14061de57:	00 
   14061de58:	0f 28 bc 24 c0 00 00 	movaps xmm7,XMMWORD PTR [rsp+0xc0]
   14061de5f:	00 
   14061de60:	48 81 c4 d8 00 00 00 	add    rsp,0xd8
   14061de67:	c3                   	ret
