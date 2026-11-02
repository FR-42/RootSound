
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140381ef0 <.text+0x380ef0>:
   140381ef0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   140381ef5:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   140381efa:	57                   	push   rdi
   140381efb:	48 83 ec 20          	sub    rsp,0x20
   140381eff:	be ff ff 00 00       	mov    esi,0xffff
   140381f04:	0f 29 74 24 10       	movaps XMMWORD PTR [rsp+0x10],xmm6
   140381f09:	f3 0f 10 35 9b e0 4c 	movss  xmm6,DWORD PTR [rip+0x4ce09b]        # 0x14084ffac
   140381f10:	00 
   140381f11:	4c 8d 59 02          	lea    r11,[rcx+0x2]
   140381f15:	33 ff                	xor    edi,edi
   140381f17:	0f 29 3c 24          	movaps XMMWORD PTR [rsp],xmm7
   140381f1b:	f3 0f 10 3d b9 e0 4c 	movss  xmm7,DWORD PTR [rip+0x4ce0b9]        # 0x14084ffdc
   140381f22:	00 
   140381f23:	8b df                	mov    ebx,edi
   140381f25:	89 79 04             	mov    DWORD PTR [rcx+0x4],edi
   140381f28:	41 88 3b             	mov    BYTE PTR [r11],dil
   140381f2b:	40 88 79 03          	mov    BYTE PTR [rcx+0x3],dil
   140381f2f:	66 89 39             	mov    WORD PTR [rcx],di
   140381f32:	48 89 71 10          	mov    QWORD PTR [rcx+0x10],rsi
   140381f36:	48 89 71 18          	mov    QWORD PTR [rcx+0x18],rsi
   140381f3a:	48 89 71 20          	mov    QWORD PTR [rcx+0x20],rsi
   140381f3e:	48 89 71 28          	mov    QWORD PTR [rcx+0x28],rsi
   140381f42:	48 89 71 30          	mov    QWORD PTR [rcx+0x30],rsi
   140381f46:	48 89 71 38          	mov    QWORD PTR [rcx+0x38],rsi
   140381f4a:	48 c7 41 08 ff ff 00 	mov    QWORD PTR [rcx+0x8],0xffff
   140381f51:	00 
   140381f52:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140381f56:	66 66 0f 1f 84 00 00 	data16 nop WORD PTR [rax+rax*1+0x0]
   140381f5d:	00 00 00 
   140381f60:	8b c3                	mov    eax,ebx
   140381f62:	0f 57 c0             	xorps  xmm0,xmm0
   140381f65:	f7 d8                	neg    eax
   140381f67:	0f 57 c9             	xorps  xmm1,xmm1
   140381f6a:	b9 02 00 00 00       	mov    ecx,0x2
   140381f6f:	45 1b c9             	sbb    r9d,r9d
   140381f72:	44 23 ce             	and    r9d,esi
   140381f75:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   140381f7c:	00 00 00 00 
   140381f80:	8d 41 fe             	lea    eax,[rcx-0x2]
   140381f83:	0f 28 d8             	movaps xmm3,xmm0
   140381f86:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140381f8b:	0f 2f d0             	comiss xmm2,xmm0
   140381f8e:	76 09                	jbe    0x140381f99
   140381f90:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140381f96:	0f 28 c2             	movaps xmm0,xmm2
   140381f99:	0f 2f d3             	comiss xmm2,xmm3
   140381f9c:	0f 28 e0             	movaps xmm4,xmm0
   140381f9f:	41 0f 46 c1          	cmovbe eax,r9d
   140381fa3:	44 8d 49 ff          	lea    r9d,[rcx-0x1]
   140381fa7:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140381fad:	0f 2f d0             	comiss xmm2,xmm0
   140381fb0:	76 09                	jbe    0x140381fbb
   140381fb2:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   140381fb8:	0f 28 c2             	movaps xmm0,xmm2
   140381fbb:	0f 2f d4             	comiss xmm2,xmm4
   140381fbe:	0f 28 d8             	movaps xmm3,xmm0
   140381fc1:	44 0f 46 c8          	cmovbe r9d,eax
   140381fc5:	8b c1                	mov    eax,ecx
   140381fc7:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140381fcc:	0f 2f d0             	comiss xmm2,xmm0
   140381fcf:	76 09                	jbe    0x140381fda
   140381fd1:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140381fd7:	0f 28 c2             	movaps xmm0,xmm2
   140381fda:	0f 2f d3             	comiss xmm2,xmm3
   140381fdd:	8d 41 01             	lea    eax,[rcx+0x1]
   140381fe0:	44 8b d1             	mov    r10d,ecx
   140381fe3:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140381fe8:	0f 28 e0             	movaps xmm4,xmm0
   140381feb:	45 0f 46 d1          	cmovbe r10d,r9d
   140381fef:	0f 2f d0             	comiss xmm2,xmm0
   140381ff2:	76 09                	jbe    0x140381ffd
   140381ff4:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140381ffa:	0f 28 c2             	movaps xmm0,xmm2
   140381ffd:	0f 2f d4             	comiss xmm2,xmm4
   140382000:	44 8d 49 02          	lea    r9d,[rcx+0x2]
   140382004:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   14038200a:	0f 28 d8             	movaps xmm3,xmm0
   14038200d:	41 0f 46 c2          	cmovbe eax,r10d
   140382011:	0f 2f d0             	comiss xmm2,xmm0
   140382014:	76 09                	jbe    0x14038201f
   140382016:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   14038201c:	0f 28 c2             	movaps xmm0,xmm2
   14038201f:	0f 2f d3             	comiss xmm2,xmm3
   140382022:	0f 28 e0             	movaps xmm4,xmm0
   140382025:	44 0f 46 c8          	cmovbe r9d,eax
   140382029:	8d 41 03             	lea    eax,[rcx+0x3]
   14038202c:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140382031:	0f 2f d0             	comiss xmm2,xmm0
   140382034:	76 09                	jbe    0x14038203f
   140382036:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   14038203c:	0f 28 c2             	movaps xmm0,xmm2
   14038203f:	0f 2f d4             	comiss xmm2,xmm4
   140382042:	0f 28 d8             	movaps xmm3,xmm0
   140382045:	41 0f 46 c1          	cmovbe eax,r9d
   140382049:	44 8d 49 04          	lea    r9d,[rcx+0x4]
   14038204d:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140382053:	0f 2f d0             	comiss xmm2,xmm0
   140382056:	76 09                	jbe    0x140382061
   140382058:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   14038205e:	0f 28 c2             	movaps xmm0,xmm2
   140382061:	0f 2f d3             	comiss xmm2,xmm3
   140382064:	0f 28 e0             	movaps xmm4,xmm0
   140382067:	44 0f 46 c8          	cmovbe r9d,eax
   14038206b:	8d 41 05             	lea    eax,[rcx+0x5]
   14038206e:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140382073:	0f 2f d0             	comiss xmm2,xmm0
   140382076:	76 09                	jbe    0x140382081
   140382078:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   14038207e:	0f 28 c2             	movaps xmm0,xmm2
   140382081:	0f 2f d4             	comiss xmm2,xmm4
   140382084:	0f 28 d8             	movaps xmm3,xmm0
   140382087:	41 0f 46 c1          	cmovbe eax,r9d
   14038208b:	44 8d 49 06          	lea    r9d,[rcx+0x6]
   14038208f:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140382095:	0f 2f d0             	comiss xmm2,xmm0
   140382098:	76 09                	jbe    0x1403820a3
   14038209a:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   1403820a0:	0f 28 c2             	movaps xmm0,xmm2
   1403820a3:	0f 2f d3             	comiss xmm2,xmm3
   1403820a6:	0f 28 e0             	movaps xmm4,xmm0
   1403820a9:	44 0f 46 c8          	cmovbe r9d,eax
   1403820ad:	8d 41 07             	lea    eax,[rcx+0x7]
   1403820b0:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   1403820b5:	0f 2f d0             	comiss xmm2,xmm0
   1403820b8:	76 09                	jbe    0x1403820c3
   1403820ba:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   1403820c0:	0f 28 c2             	movaps xmm0,xmm2
   1403820c3:	0f 2f d4             	comiss xmm2,xmm4
   1403820c6:	0f 28 d8             	movaps xmm3,xmm0
   1403820c9:	41 0f 46 c1          	cmovbe eax,r9d
   1403820cd:	44 8d 49 08          	lea    r9d,[rcx+0x8]
   1403820d1:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   1403820d7:	0f 2f d0             	comiss xmm2,xmm0
   1403820da:	76 09                	jbe    0x1403820e5
   1403820dc:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   1403820e2:	0f 28 c2             	movaps xmm0,xmm2
   1403820e5:	0f 2f d3             	comiss xmm2,xmm3
   1403820e8:	0f 28 e0             	movaps xmm4,xmm0
   1403820eb:	44 0f 46 c8          	cmovbe r9d,eax
   1403820ef:	8d 41 09             	lea    eax,[rcx+0x9]
   1403820f2:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   1403820f7:	0f 2f d0             	comiss xmm2,xmm0
   1403820fa:	76 09                	jbe    0x140382105
   1403820fc:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140382102:	0f 28 c2             	movaps xmm0,xmm2
   140382105:	0f 2f d4             	comiss xmm2,xmm4
   140382108:	0f 28 d8             	movaps xmm3,xmm0
   14038210b:	41 0f 46 c1          	cmovbe eax,r9d
   14038210f:	44 8d 49 0a          	lea    r9d,[rcx+0xa]
   140382113:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140382119:	0f 2f d0             	comiss xmm2,xmm0
   14038211c:	76 09                	jbe    0x140382127
   14038211e:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   140382124:	0f 28 c2             	movaps xmm0,xmm2
   140382127:	0f 2f d3             	comiss xmm2,xmm3
   14038212a:	0f 28 e0             	movaps xmm4,xmm0
   14038212d:	44 0f 46 c8          	cmovbe r9d,eax
   140382131:	8d 41 0b             	lea    eax,[rcx+0xb]
   140382134:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140382139:	0f 2f d0             	comiss xmm2,xmm0
   14038213c:	76 09                	jbe    0x140382147
   14038213e:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140382144:	0f 28 c2             	movaps xmm0,xmm2
   140382147:	0f 2f d4             	comiss xmm2,xmm4
   14038214a:	0f 28 d8             	movaps xmm3,xmm0
   14038214d:	41 0f 46 c1          	cmovbe eax,r9d
   140382151:	44 8d 49 0c          	lea    r9d,[rcx+0xc]
   140382155:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   14038215b:	0f 2f d0             	comiss xmm2,xmm0
   14038215e:	76 09                	jbe    0x140382169
   140382160:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   140382166:	0f 28 c2             	movaps xmm0,xmm2
   140382169:	0f 2f d3             	comiss xmm2,xmm3
   14038216c:	0f 28 e0             	movaps xmm4,xmm0
   14038216f:	44 0f 46 c8          	cmovbe r9d,eax
   140382173:	8d 41 0d             	lea    eax,[rcx+0xd]
   140382176:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   14038217b:	0f 2f d0             	comiss xmm2,xmm0
   14038217e:	76 09                	jbe    0x140382189
   140382180:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140382186:	0f 28 c2             	movaps xmm0,xmm2
   140382189:	0f 2f d4             	comiss xmm2,xmm4
   14038218c:	0f 28 d8             	movaps xmm3,xmm0
   14038218f:	41 0f 46 c1          	cmovbe eax,r9d
   140382193:	44 8d 49 0e          	lea    r9d,[rcx+0xe]
   140382197:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   14038219d:	0f 2f d0             	comiss xmm2,xmm0
   1403821a0:	76 09                	jbe    0x1403821ab
   1403821a2:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   1403821a8:	0f 28 c2             	movaps xmm0,xmm2
   1403821ab:	0f 2f d3             	comiss xmm2,xmm3
   1403821ae:	0f 28 e0             	movaps xmm4,xmm0
   1403821b1:	44 0f 46 c8          	cmovbe r9d,eax
   1403821b5:	8d 41 0f             	lea    eax,[rcx+0xf]
   1403821b8:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   1403821bd:	0f 2f d0             	comiss xmm2,xmm0
   1403821c0:	76 09                	jbe    0x1403821cb
   1403821c2:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   1403821c8:	0f 28 c2             	movaps xmm0,xmm2
   1403821cb:	0f 2f d4             	comiss xmm2,xmm4
   1403821ce:	0f 28 d8             	movaps xmm3,xmm0
   1403821d1:	41 0f 46 c1          	cmovbe eax,r9d
   1403821d5:	44 8d 49 10          	lea    r9d,[rcx+0x10]
   1403821d9:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   1403821df:	0f 2f d0             	comiss xmm2,xmm0
   1403821e2:	76 09                	jbe    0x1403821ed
   1403821e4:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   1403821ea:	0f 28 c2             	movaps xmm0,xmm2
   1403821ed:	0f 2f d3             	comiss xmm2,xmm3
   1403821f0:	0f 28 e0             	movaps xmm4,xmm0
   1403821f3:	44 0f 46 c8          	cmovbe r9d,eax
   1403821f7:	8d 41 11             	lea    eax,[rcx+0x11]
   1403821fa:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   1403821ff:	0f 2f d0             	comiss xmm2,xmm0
   140382202:	76 09                	jbe    0x14038220d
   140382204:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   14038220a:	0f 28 c2             	movaps xmm0,xmm2
   14038220d:	0f 2f d4             	comiss xmm2,xmm4
   140382210:	0f 28 d8             	movaps xmm3,xmm0
   140382213:	41 0f 46 c1          	cmovbe eax,r9d
   140382217:	44 8d 49 12          	lea    r9d,[rcx+0x12]
   14038221b:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140382221:	0f 2f d0             	comiss xmm2,xmm0
   140382224:	76 09                	jbe    0x14038222f
   140382226:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   14038222c:	0f 28 c2             	movaps xmm0,xmm2
   14038222f:	0f 2f d3             	comiss xmm2,xmm3
   140382232:	0f 28 e0             	movaps xmm4,xmm0
   140382235:	44 0f 46 c8          	cmovbe r9d,eax
   140382239:	8d 41 13             	lea    eax,[rcx+0x13]
   14038223c:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140382241:	0f 2f d0             	comiss xmm2,xmm0
   140382244:	76 09                	jbe    0x14038224f
   140382246:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   14038224c:	0f 28 c2             	movaps xmm0,xmm2
   14038224f:	0f 2f d4             	comiss xmm2,xmm4
   140382252:	0f 28 d8             	movaps xmm3,xmm0
   140382255:	41 0f 46 c1          	cmovbe eax,r9d
   140382259:	44 8d 49 14          	lea    r9d,[rcx+0x14]
   14038225d:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140382263:	0f 2f d0             	comiss xmm2,xmm0
   140382266:	76 09                	jbe    0x140382271
   140382268:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   14038226e:	0f 28 c2             	movaps xmm0,xmm2
   140382271:	0f 2f d3             	comiss xmm2,xmm3
   140382274:	0f 28 e0             	movaps xmm4,xmm0
   140382277:	44 0f 46 c8          	cmovbe r9d,eax
   14038227b:	8d 41 15             	lea    eax,[rcx+0x15]
   14038227e:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140382283:	0f 2f d0             	comiss xmm2,xmm0
   140382286:	76 09                	jbe    0x140382291
   140382288:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   14038228e:	0f 28 c2             	movaps xmm0,xmm2
   140382291:	0f 2f d4             	comiss xmm2,xmm4
   140382294:	0f 28 d8             	movaps xmm3,xmm0
   140382297:	41 0f 46 c1          	cmovbe eax,r9d
   14038229b:	44 8d 49 16          	lea    r9d,[rcx+0x16]
   14038229f:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   1403822a5:	0f 2f d0             	comiss xmm2,xmm0
   1403822a8:	76 09                	jbe    0x1403822b3
   1403822aa:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   1403822b0:	0f 28 c2             	movaps xmm0,xmm2
   1403822b3:	0f 2f d3             	comiss xmm2,xmm3
   1403822b6:	0f 28 e0             	movaps xmm4,xmm0
   1403822b9:	44 0f 46 c8          	cmovbe r9d,eax
   1403822bd:	8d 41 17             	lea    eax,[rcx+0x17]
   1403822c0:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   1403822c5:	0f 2f d0             	comiss xmm2,xmm0
   1403822c8:	76 09                	jbe    0x1403822d3
   1403822ca:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   1403822d0:	0f 28 c2             	movaps xmm0,xmm2
   1403822d3:	0f 2f d4             	comiss xmm2,xmm4
   1403822d6:	0f 28 d8             	movaps xmm3,xmm0
   1403822d9:	41 0f 46 c1          	cmovbe eax,r9d
   1403822dd:	44 8d 49 18          	lea    r9d,[rcx+0x18]
   1403822e1:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   1403822e7:	0f 2f d0             	comiss xmm2,xmm0
   1403822ea:	76 09                	jbe    0x1403822f5
   1403822ec:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   1403822f2:	0f 28 c2             	movaps xmm0,xmm2
   1403822f5:	0f 2f d3             	comiss xmm2,xmm3
   1403822f8:	0f 28 e0             	movaps xmm4,xmm0
   1403822fb:	44 0f 46 c8          	cmovbe r9d,eax
   1403822ff:	8d 41 19             	lea    eax,[rcx+0x19]
   140382302:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140382307:	0f 2f d0             	comiss xmm2,xmm0
   14038230a:	76 09                	jbe    0x140382315
   14038230c:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140382312:	0f 28 c2             	movaps xmm0,xmm2
   140382315:	0f 2f d4             	comiss xmm2,xmm4
   140382318:	0f 28 d8             	movaps xmm3,xmm0
   14038231b:	41 0f 46 c1          	cmovbe eax,r9d
   14038231f:	44 8d 49 1a          	lea    r9d,[rcx+0x1a]
   140382323:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140382329:	0f 2f d0             	comiss xmm2,xmm0
   14038232c:	76 09                	jbe    0x140382337
   14038232e:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   140382334:	0f 28 c2             	movaps xmm0,xmm2
   140382337:	0f 2f d3             	comiss xmm2,xmm3
   14038233a:	44 8d 51 1b          	lea    r10d,[rcx+0x1b]
   14038233e:	f3 42 0f 10 14 92    	movss  xmm2,DWORD PTR [rdx+r10*4]
   140382344:	0f 28 e0             	movaps xmm4,xmm0
   140382347:	44 0f 46 c8          	cmovbe r9d,eax
   14038234b:	0f 2f d0             	comiss xmm2,xmm0
   14038234e:	76 09                	jbe    0x140382359
   140382350:	f3 43 0f 10 0c 90    	movss  xmm1,DWORD PTR [r8+r10*4]
   140382356:	0f 28 c2             	movaps xmm0,xmm2
   140382359:	0f 2f d4             	comiss xmm2,xmm4
   14038235c:	8d 41 1c             	lea    eax,[rcx+0x1c]
   14038235f:	f3 0f 10 14 82       	movss  xmm2,DWORD PTR [rdx+rax*4]
   140382364:	0f 28 e8             	movaps xmm5,xmm0
   140382367:	45 0f 46 d1          	cmovbe r10d,r9d
   14038236b:	0f 2f d0             	comiss xmm2,xmm0
   14038236e:	76 09                	jbe    0x140382379
   140382370:	f3 41 0f 10 0c 80    	movss  xmm1,DWORD PTR [r8+rax*4]
   140382376:	0f 28 c2             	movaps xmm0,xmm2
   140382379:	0f 2f d5             	comiss xmm2,xmm5
   14038237c:	44 8d 49 1d          	lea    r9d,[rcx+0x1d]
   140382380:	f3 42 0f 10 14 8a    	movss  xmm2,DWORD PTR [rdx+r9*4]
   140382386:	0f 28 d8             	movaps xmm3,xmm0
   140382389:	41 0f 46 c2          	cmovbe eax,r10d
   14038238d:	0f 2f d0             	comiss xmm2,xmm0
   140382390:	76 09                	jbe    0x14038239b
   140382392:	f3 43 0f 10 0c 88    	movss  xmm1,DWORD PTR [r8+r9*4]
   140382398:	0f 28 c2             	movaps xmm0,xmm2
   14038239b:	0f 2f d3             	comiss xmm2,xmm3
   14038239e:	44 0f 46 c8          	cmovbe r9d,eax
   1403823a2:	83 c1 20             	add    ecx,0x20
   1403823a5:	8d 41 fe             	lea    eax,[rcx-0x2]
   1403823a8:	83 f8 7f             	cmp    eax,0x7f
   1403823ab:	0f 86 cf fb ff ff    	jbe    0x140381f80
   1403823b1:	0f 2f f0             	comiss xmm6,xmm0
   1403823b4:	77 31                	ja     0x1403823e7
   1403823b6:	f3 41 0f 11 43 02    	movss  DWORD PTR [r11+0x2],xmm0
   1403823bc:	f3 0f 58 cf          	addss  xmm1,xmm7
   1403823c0:	41 88 7b 01          	mov    BYTE PTR [r11+0x1],dil
   1403823c4:	ff c3                	inc    ebx
   1403823c6:	66 45 89 4b fe       	mov    WORD PTR [r11-0x2],r9w
   1403823cb:	f3 0f 2c c1          	cvttss2si eax,xmm1
   1403823cf:	41 88 03             	mov    BYTE PTR [r11],al
   1403823d2:	49 83 c3 08          	add    r11,0x8
   1403823d6:	42 89 3c 8a          	mov    DWORD PTR [rdx+r9*4],edi
   1403823da:	43 89 3c 88          	mov    DWORD PTR [r8+r9*4],edi
   1403823de:	83 fb 08             	cmp    ebx,0x8
   1403823e1:	0f 82 79 fb ff ff    	jb     0x140381f60
   1403823e7:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   1403823ec:	48 8b 74 24 38       	mov    rsi,QWORD PTR [rsp+0x38]
   1403823f1:	0f 28 74 24 10       	movaps xmm6,XMMWORD PTR [rsp+0x10]
   1403823f6:	0f 28 3c 24          	movaps xmm7,XMMWORD PTR [rsp]
   1403823fa:	48 83 c4 20          	add    rsp,0x20
   1403823fe:	5f                   	pop    rdi
   1403823ff:	c3                   	ret
   140382400:	cc                   	int3
   140382401:	cc                   	int3
   140382402:	cc                   	int3
   140382403:	cc                   	int3
   140382404:	cc                   	int3
   140382405:	cc                   	int3
   140382406:	cc                   	int3
   140382407:	cc                   	int3
   140382408:	cc                   	int3
   140382409:	cc                   	int3
   14038240a:	cc                   	int3
   14038240b:	cc                   	int3
   14038240c:	cc                   	int3
   14038240d:	cc                   	int3
   14038240e:	cc                   	int3
   14038240f:	cc                   	int3
   140382410:	48 8b c4             	mov    rax,rsp
   140382413:	48 89 58 10          	mov    QWORD PTR [rax+0x10],rbx
   140382417:	48 89 68 18          	mov    QWORD PTR [rax+0x18],rbp
   14038241b:	48 89 70 20          	mov    QWORD PTR [rax+0x20],rsi
   14038241f:	57                   	push   rdi
   140382420:	48 81 ec 80 00 00 00 	sub    rsp,0x80
   140382427:	8b 19                	mov    ebx,DWORD PTR [rcx]
   140382429:	49 8b f0             	mov    rsi,r8
   14038242c:	48 8b ea             	mov    rbp,rdx
   14038242f:	0f 29 70 e8          	movaps XMMWORD PTR [rax-0x18],xmm6
   140382433:	48 8b f9             	mov    rdi,rcx
   140382436:	0f 29 78 d8          	movaps XMMWORD PTR [rax-0x28],xmm7
   14038243a:	0f 57 ff             	xorps  xmm7,xmm7
   14038243d:	44 0f 29 40 c8       	movaps XMMWORD PTR [rax-0x38],xmm8
   140382442:	0f 57 f6             	xorps  xmm6,xmm6
   140382445:	44 0f 29 48 b8       	movaps XMMWORD PTR [rax-0x48],xmm9
   14038244a:	45 0f 57 c9          	xorps  xmm9,xmm9
   14038244e:	45 0f 57 c0          	xorps  xmm8,xmm8
   140382452:	3b 59 04             	cmp    ebx,DWORD PTR [rcx+0x4]
   140382455:	0f 8d 86 00 00 00    	jge    0x1403824e1
   14038245b:	4c 89 70 08          	mov    QWORD PTR [rax+0x8],r14
   14038245f:	45 33 f6             	xor    r14d,r14d
   140382462:	44 0f 29 50 a8       	movaps XMMWORD PTR [rax-0x58],xmm10
   140382467:	f2 44 0f 10 15 08 dd 	movsd  xmm10,QWORD PTR [rip+0x4cdd08]        # 0x140850178
   14038246e:	4c 00 
   140382470:	45 33 c9             	xor    r9d,r9d
   140382473:	4c 89 74 24 28       	mov    QWORD PTR [rsp+0x28],r14
   140382478:	8b d3                	mov    edx,ebx
   14038247a:	44 89 74 24 20       	mov    DWORD PTR [rsp+0x20],r14d
   14038247f:	48 8b cf             	mov    rcx,rdi
   140382482:	45 8d 41 ff          	lea    r8d,[r9-0x1]
   140382486:	e8 65 83 fe ff       	call   0x14036a7f0
   14038248b:	0f 57 c9             	xorps  xmm1,xmm1
   14038248e:	f2 45 0f 58 c2       	addsd  xmm8,xmm10
   140382493:	f3 0f 5a c8          	cvtss2sd xmm1,xmm0
   140382497:	ff c3                	inc    ebx
   140382499:	f2 0f 58 f9          	addsd  xmm7,xmm1
   14038249d:	f2 0f 59 c9          	mulsd  xmm1,xmm1
   1403824a1:	f2 0f 58 f1          	addsd  xmm6,xmm1
   1403824a5:	3b 5f 04             	cmp    ebx,DWORD PTR [rdi+0x4]
   1403824a8:	7c c6                	jl     0x140382470
   1403824aa:	66 45 0f 2e c1       	ucomisd xmm8,xmm9
   1403824af:	4c 8b b4 24 90 00 00 	mov    r14,QWORD PTR [rsp+0x90]
   1403824b6:	00 
   1403824b7:	44 0f 28 54 24 30    	movaps xmm10,XMMWORD PTR [rsp+0x30]
   1403824bd:	7a 02                	jp     0x1403824c1
   1403824bf:	74 20                	je     0x1403824e1
   1403824c1:	f2 41 0f 5e f8       	divsd  xmm7,xmm8
   1403824c6:	f2 41 0f 5e f0       	divsd  xmm6,xmm8
   1403824cb:	0f 28 c7             	movaps xmm0,xmm7
   1403824ce:	f2 0f 59 c7          	mulsd  xmm0,xmm7
   1403824d2:	f2 0f 5c f0          	subsd  xmm6,xmm0
   1403824d6:	0f 28 c6             	movaps xmm0,xmm6
   1403824d9:	e8 de e8 29 00       	call   0x140620dbc
   1403824de:	0f 28 f0             	movaps xmm6,xmm0
   1403824e1:	4c 8d 9c 24 80 00 00 	lea    r11,[rsp+0x80]
   1403824e8:	00 
   1403824e9:	0f 28 d6             	movaps xmm2,xmm6
   1403824ec:	f2 0f 59 35 cc d9 32 	mulsd  xmm6,QWORD PTR [rip+0x32d9cc]        # 0x1406afec0
   1403824f3:	00 
   1403824f4:	0f 28 cf             	movaps xmm1,xmm7
   1403824f7:	49 8b 5b 18          	mov    rbx,QWORD PTR [r11+0x18]
   1403824fb:	f2 0f 59 15 25 dc 4c 	mulsd  xmm2,QWORD PTR [rip+0x4cdc25]        # 0x140850128
   140382502:	00 
   140382503:	45 0f 28 43 d0       	movaps xmm8,XMMWORD PTR [r11-0x30]
   140382508:	45 0f 28 4b c0       	movaps xmm9,XMMWORD PTR [r11-0x40]
   14038250d:	f2 0f 58 f7          	addsd  xmm6,xmm7
   140382511:	0f 28 7c 24 60       	movaps xmm7,XMMWORD PTR [rsp+0x60]
   140382516:	f2 0f 5c ca          	subsd  xmm1,xmm2
   14038251a:	f2 0f 11 4d 00       	movsd  QWORD PTR [rbp+0x0],xmm1
   14038251f:	49 8b 6b 20          	mov    rbp,QWORD PTR [r11+0x20]
   140382523:	f2 0f 11 36          	movsd  QWORD PTR [rsi],xmm6
   140382527:	49 8b 73 28          	mov    rsi,QWORD PTR [r11+0x28]
   14038252b:	0f 28 74 24 70       	movaps xmm6,XMMWORD PTR [rsp+0x70]
   140382530:	49 8b e3             	mov    rsp,r11
   140382533:	5f                   	pop    rdi
   140382534:	c3                   	ret
   140382535:	cc                   	int3
   140382536:	cc                   	int3
   140382537:	cc                   	int3
   140382538:	cc                   	int3
   140382539:	cc                   	int3
   14038253a:	cc                   	int3
   14038253b:	cc                   	int3
   14038253c:	cc                   	int3
   14038253d:	cc                   	int3
   14038253e:	cc                   	int3
   14038253f:	cc                   	int3
