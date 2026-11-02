
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014036c270 <.text+0x36b270>:
   14036c270:	0f 28 c8             	movaps xmm1,xmm0
   14036c273:	f3 0f 59 0d 1d 1f 32 	mulss  xmm1,DWORD PTR [rip+0x321f1d]        # 0x14068e198
   14036c27a:	00 
   14036c27b:	0f 28 c1             	movaps xmm0,xmm1
   14036c27e:	f3 0f 59 0d 3a 25 34 	mulss  xmm1,DWORD PTR [rip+0x34253a]        # 0x1406ae7c0
   14036c285:	00 
   14036c286:	f3 0f 5e 05 3a 25 34 	divss  xmm0,DWORD PTR [rip+0x34253a]        # 0x1406ae7c8
   14036c28d:	00 
   14036c28e:	f3 0f 5e c1          	divss  xmm0,xmm1
   14036c292:	c3                   	ret
   14036c293:	cc                   	int3
   14036c294:	cc                   	int3
   14036c295:	cc                   	int3
   14036c296:	cc                   	int3
   14036c297:	cc                   	int3
   14036c298:	cc                   	int3
   14036c299:	cc                   	int3
   14036c29a:	cc                   	int3
   14036c29b:	cc                   	int3
   14036c29c:	cc                   	int3
   14036c29d:	cc                   	int3
   14036c29e:	cc                   	int3
   14036c29f:	cc                   	int3
   14036c2a0:	f3 0f 10 0d 04 38 33 	movss  xmm1,DWORD PTR [rip+0x333804]        # 0x14069faac
   14036c2a7:	00 
   14036c2a8:	0f 2f c8             	comiss xmm1,xmm0
   14036c2ab:	76 04                	jbe    0x14036c2b1
   14036c2ad:	0f 57 c0             	xorps  xmm0,xmm0
   14036c2b0:	c3                   	ret
   14036c2b1:	f3 0f 5c c1          	subss  xmm0,xmm1
   14036c2b5:	f3 0f 59 c0          	mulss  xmm0,xmm0
   14036c2b9:	f3 0f 59 05 cb 24 34 	mulss  xmm0,DWORD PTR [rip+0x3424cb]        # 0x1406ae78c
   14036c2c0:	00 
   14036c2c1:	c3                   	ret
   14036c2c2:	cc                   	int3
   14036c2c3:	cc                   	int3
   14036c2c4:	cc                   	int3
   14036c2c5:	cc                   	int3
   14036c2c6:	cc                   	int3
   14036c2c7:	cc                   	int3
   14036c2c8:	cc                   	int3
   14036c2c9:	cc                   	int3
   14036c2ca:	cc                   	int3
   14036c2cb:	cc                   	int3
   14036c2cc:	cc                   	int3
   14036c2cd:	cc                   	int3
   14036c2ce:	cc                   	int3
   14036c2cf:	cc                   	int3
