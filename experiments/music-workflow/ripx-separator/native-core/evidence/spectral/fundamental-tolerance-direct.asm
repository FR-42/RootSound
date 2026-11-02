
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001403463d0 <.text+0x3453d0>:
   1403463d0:	45 85 c0             	test   r8d,r8d
   1403463d3:	78 0a                	js     0x1403463df
   1403463d5:	f3 0f 10 05 83 16 36 	movss  xmm0,DWORD PTR [rip+0x361683]        # 0x1406a7a60
   1403463dc:	00 
   1403463dd:	eb 08                	jmp    0x1403463e7
   1403463df:	f3 0f 10 05 81 16 36 	movss  xmm0,DWORD PTR [rip+0x361681]        # 0x1406a7a68
   1403463e6:	00 
   1403463e7:	80 b9 91 00 00 00 00 	cmp    BYTE PTR [rcx+0x91],0x0
   1403463ee:	f3 0f 5e c8          	divss  xmm1,xmm0
   1403463f2:	74 10                	je     0x140346404
   1403463f4:	f3 0f 10 05 90 7d 34 	movss  xmm0,DWORD PTR [rip+0x347d90]        # 0x14068e18c
   1403463fb:	00 
   1403463fc:	f3 0f 5f c8          	maxss  xmm1,xmm0
   140346400:	0f 28 c1             	movaps xmm0,xmm1
   140346403:	c3                   	ret
   140346404:	f3 0f 10 05 44 16 36 	movss  xmm0,DWORD PTR [rip+0x361644]        # 0x1406a7a50
   14034640b:	00 
   14034640c:	f3 0f 5f c8          	maxss  xmm1,xmm0
   140346410:	0f 28 c1             	movaps xmm0,xmm1
   140346413:	c3                   	ret
   140346414:	cc                   	int3
   140346415:	cc                   	int3
   140346416:	cc                   	int3
   140346417:	cc                   	int3
   140346418:	cc                   	int3
   140346419:	cc                   	int3
   14034641a:	cc                   	int3
   14034641b:	cc                   	int3
   14034641c:	cc                   	int3
   14034641d:	cc                   	int3
   14034641e:	cc                   	int3
   14034641f:	cc                   	int3
