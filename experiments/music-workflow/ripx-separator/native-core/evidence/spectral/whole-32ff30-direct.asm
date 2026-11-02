
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

000000014032ff30 <.text+0x32ef30>:
   14032ff30:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   14032ff35:	48 89 74 24 10       	mov    QWORD PTR [rsp+0x10],rsi
   14032ff3a:	57                   	push   rdi
   14032ff3b:	48 83 ec 20          	sub    rsp,0x20
   14032ff3f:	48 8b 99 90 06 00 00 	mov    rbx,QWORD PTR [rcx+0x690]
   14032ff46:	48 8b f9             	mov    rdi,rcx
   14032ff49:	41 0f b7 c0          	movzx  eax,r8w
   14032ff4d:	ba ff 00 00 00       	mov    edx,0xff
   14032ff52:	44 69 c0 e0 01 00 00 	imul   r8d,eax,0x1e0
   14032ff59:	48 8b cb             	mov    rcx,rbx
   14032ff5c:	4d 03 c0             	add    r8,r8
   14032ff5f:	e8 86 0d 2f 00       	call   0x140620cea
   14032ff64:	33 f6                	xor    esi,esi
   14032ff66:	44 0f b7 ce          	movzx  r9d,si
   14032ff6a:	66 3b b7 70 06 00 00 	cmp    si,WORD PTR [rdi+0x670]
   14032ff71:	0f 83 48 03 00 00    	jae    0x1403302bf
   14032ff77:	41 bb ff ff 00 00    	mov    r11d,0xffff
   14032ff7d:	0f 1f 00             	nop    DWORD PTR [rax]
   14032ff80:	48 8b 87 68 06 00 00 	mov    rax,QWORD PTR [rdi+0x668]
   14032ff87:	44 8b d6             	mov    r10d,esi
   14032ff8a:	41 0f b7 c9          	movzx  ecx,r9w
   14032ff8e:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   14032ff92:	4c 69 c1 94 0d 00 00 	imul   r8,rcx,0xd94
   14032ff99:	49 83 c0 4c          	add    r8,0x4c
   14032ff9d:	4c 03 87 60 06 00 00 	add    r8,QWORD PTR [rdi+0x660]
   14032ffa4:	41 8b 40 c0          	mov    eax,DWORD PTR [r8-0x40]
   14032ffa8:	85 c0                	test   eax,eax
   14032ffaa:	78 2f                	js     0x14032ffdb
   14032ffac:	8d 04 40             	lea    eax,[rax+rax*2]
   14032ffaf:	8b ce                	mov    ecx,esi
   14032ffb1:	c1 e0 04             	shl    eax,0x4
   14032ffb4:	41 03 c2             	add    eax,r10d
   14032ffb7:	8d 04 80             	lea    eax,[rax+rax*4]
   14032ffba:	03 c0                	add    eax,eax
   14032ffbc:	48 8d 14 43          	lea    rdx,[rbx+rax*2]
   14032ffc0:	48 8b c6             	mov    rax,rsi
   14032ffc3:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   14032ffc8:	74 0c                	je     0x14032ffd6
   14032ffca:	ff c1                	inc    ecx
   14032ffcc:	48 ff c0             	inc    rax
   14032ffcf:	83 f9 0a             	cmp    ecx,0xa
   14032ffd2:	72 ef                	jb     0x14032ffc3
   14032ffd4:	eb 05                	jmp    0x14032ffdb
   14032ffd6:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   14032ffdb:	41 8b 40 e0          	mov    eax,DWORD PTR [r8-0x20]
   14032ffdf:	85 c0                	test   eax,eax
   14032ffe1:	78 35                	js     0x140330018
   14032ffe3:	8d 04 40             	lea    eax,[rax+rax*2]
   14032ffe6:	c1 e0 04             	shl    eax,0x4
   14032ffe9:	ff c0                	inc    eax
   14032ffeb:	41 03 c2             	add    eax,r10d
   14032ffee:	8d 0c 80             	lea    ecx,[rax+rax*4]
   14032fff1:	48 8b c6             	mov    rax,rsi
   14032fff4:	03 c9                	add    ecx,ecx
   14032fff6:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   14032fffa:	8b ce                	mov    ecx,esi
   14032fffc:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140330000:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330005:	74 0c                	je     0x140330013
   140330007:	ff c1                	inc    ecx
   140330009:	48 ff c0             	inc    rax
   14033000c:	83 f9 0a             	cmp    ecx,0xa
   14033000f:	72 ef                	jb     0x140330000
   140330011:	eb 05                	jmp    0x140330018
   140330013:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330018:	41 8b 00             	mov    eax,DWORD PTR [r8]
   14033001b:	85 c0                	test   eax,eax
   14033001d:	78 39                	js     0x140330058
   14033001f:	8d 04 40             	lea    eax,[rax+rax*2]
   140330022:	c1 e0 04             	shl    eax,0x4
   140330025:	83 c0 02             	add    eax,0x2
   140330028:	41 03 c2             	add    eax,r10d
   14033002b:	8d 0c 80             	lea    ecx,[rax+rax*4]
   14033002e:	48 8b c6             	mov    rax,rsi
   140330031:	03 c9                	add    ecx,ecx
   140330033:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   140330037:	8b ce                	mov    ecx,esi
   140330039:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140330040:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330045:	74 0c                	je     0x140330053
   140330047:	ff c1                	inc    ecx
   140330049:	48 ff c0             	inc    rax
   14033004c:	83 f9 0a             	cmp    ecx,0xa
   14033004f:	72 ef                	jb     0x140330040
   140330051:	eb 05                	jmp    0x140330058
   140330053:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330058:	41 8b 40 20          	mov    eax,DWORD PTR [r8+0x20]
   14033005c:	85 c0                	test   eax,eax
   14033005e:	78 38                	js     0x140330098
   140330060:	8d 04 40             	lea    eax,[rax+rax*2]
   140330063:	c1 e0 04             	shl    eax,0x4
   140330066:	83 c0 03             	add    eax,0x3
   140330069:	41 03 c2             	add    eax,r10d
   14033006c:	8d 0c 80             	lea    ecx,[rax+rax*4]
   14033006f:	48 8b c6             	mov    rax,rsi
   140330072:	03 c9                	add    ecx,ecx
   140330074:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   140330078:	8b ce                	mov    ecx,esi
   14033007a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140330080:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330085:	74 0c                	je     0x140330093
   140330087:	ff c1                	inc    ecx
   140330089:	48 ff c0             	inc    rax
   14033008c:	83 f9 0a             	cmp    ecx,0xa
   14033008f:	72 ef                	jb     0x140330080
   140330091:	eb 05                	jmp    0x140330098
   140330093:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330098:	41 8b 40 40          	mov    eax,DWORD PTR [r8+0x40]
   14033009c:	85 c0                	test   eax,eax
   14033009e:	78 38                	js     0x1403300d8
   1403300a0:	8d 04 40             	lea    eax,[rax+rax*2]
   1403300a3:	c1 e0 04             	shl    eax,0x4
   1403300a6:	83 c0 04             	add    eax,0x4
   1403300a9:	41 03 c2             	add    eax,r10d
   1403300ac:	8d 0c 80             	lea    ecx,[rax+rax*4]
   1403300af:	48 8b c6             	mov    rax,rsi
   1403300b2:	03 c9                	add    ecx,ecx
   1403300b4:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   1403300b8:	8b ce                	mov    ecx,esi
   1403300ba:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   1403300c0:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   1403300c5:	74 0c                	je     0x1403300d3
   1403300c7:	ff c1                	inc    ecx
   1403300c9:	48 ff c0             	inc    rax
   1403300cc:	83 f9 0a             	cmp    ecx,0xa
   1403300cf:	72 ef                	jb     0x1403300c0
   1403300d1:	eb 05                	jmp    0x1403300d8
   1403300d3:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   1403300d8:	41 8b 40 60          	mov    eax,DWORD PTR [r8+0x60]
   1403300dc:	85 c0                	test   eax,eax
   1403300de:	78 38                	js     0x140330118
   1403300e0:	8d 04 40             	lea    eax,[rax+rax*2]
   1403300e3:	c1 e0 04             	shl    eax,0x4
   1403300e6:	83 c0 05             	add    eax,0x5
   1403300e9:	41 03 c2             	add    eax,r10d
   1403300ec:	8d 0c 80             	lea    ecx,[rax+rax*4]
   1403300ef:	48 8b c6             	mov    rax,rsi
   1403300f2:	03 c9                	add    ecx,ecx
   1403300f4:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   1403300f8:	8b ce                	mov    ecx,esi
   1403300fa:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140330100:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330105:	74 0c                	je     0x140330113
   140330107:	ff c1                	inc    ecx
   140330109:	48 ff c0             	inc    rax
   14033010c:	83 f9 0a             	cmp    ecx,0xa
   14033010f:	72 ef                	jb     0x140330100
   140330111:	eb 05                	jmp    0x140330118
   140330113:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330118:	41 8b 80 80 00 00 00 	mov    eax,DWORD PTR [r8+0x80]
   14033011f:	85 c0                	test   eax,eax
   140330121:	78 35                	js     0x140330158
   140330123:	8d 04 40             	lea    eax,[rax+rax*2]
   140330126:	c1 e0 04             	shl    eax,0x4
   140330129:	83 c0 06             	add    eax,0x6
   14033012c:	41 03 c2             	add    eax,r10d
   14033012f:	8d 0c 80             	lea    ecx,[rax+rax*4]
   140330132:	48 8b c6             	mov    rax,rsi
   140330135:	03 c9                	add    ecx,ecx
   140330137:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   14033013b:	8b ce                	mov    ecx,esi
   14033013d:	0f 1f 00             	nop    DWORD PTR [rax]
   140330140:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330145:	74 0c                	je     0x140330153
   140330147:	ff c1                	inc    ecx
   140330149:	48 ff c0             	inc    rax
   14033014c:	83 f9 0a             	cmp    ecx,0xa
   14033014f:	72 ef                	jb     0x140330140
   140330151:	eb 05                	jmp    0x140330158
   140330153:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330158:	41 8b 80 a0 00 00 00 	mov    eax,DWORD PTR [r8+0xa0]
   14033015f:	85 c0                	test   eax,eax
   140330161:	78 35                	js     0x140330198
   140330163:	8d 04 40             	lea    eax,[rax+rax*2]
   140330166:	c1 e0 04             	shl    eax,0x4
   140330169:	83 c0 07             	add    eax,0x7
   14033016c:	41 03 c2             	add    eax,r10d
   14033016f:	8d 0c 80             	lea    ecx,[rax+rax*4]
   140330172:	48 8b c6             	mov    rax,rsi
   140330175:	03 c9                	add    ecx,ecx
   140330177:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   14033017b:	8b ce                	mov    ecx,esi
   14033017d:	0f 1f 00             	nop    DWORD PTR [rax]
   140330180:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330185:	74 0c                	je     0x140330193
   140330187:	ff c1                	inc    ecx
   140330189:	48 ff c0             	inc    rax
   14033018c:	83 f9 0a             	cmp    ecx,0xa
   14033018f:	72 ef                	jb     0x140330180
   140330191:	eb 05                	jmp    0x140330198
   140330193:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330198:	41 8b 80 c0 00 00 00 	mov    eax,DWORD PTR [r8+0xc0]
   14033019f:	85 c0                	test   eax,eax
   1403301a1:	78 35                	js     0x1403301d8
   1403301a3:	8d 04 40             	lea    eax,[rax+rax*2]
   1403301a6:	c1 e0 04             	shl    eax,0x4
   1403301a9:	83 c0 08             	add    eax,0x8
   1403301ac:	41 03 c2             	add    eax,r10d
   1403301af:	8d 0c 80             	lea    ecx,[rax+rax*4]
   1403301b2:	48 8b c6             	mov    rax,rsi
   1403301b5:	03 c9                	add    ecx,ecx
   1403301b7:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   1403301bb:	8b ce                	mov    ecx,esi
   1403301bd:	0f 1f 00             	nop    DWORD PTR [rax]
   1403301c0:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   1403301c5:	74 0c                	je     0x1403301d3
   1403301c7:	ff c1                	inc    ecx
   1403301c9:	48 ff c0             	inc    rax
   1403301cc:	83 f9 0a             	cmp    ecx,0xa
   1403301cf:	72 ef                	jb     0x1403301c0
   1403301d1:	eb 05                	jmp    0x1403301d8
   1403301d3:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   1403301d8:	41 8b 80 e0 00 00 00 	mov    eax,DWORD PTR [r8+0xe0]
   1403301df:	85 c0                	test   eax,eax
   1403301e1:	78 35                	js     0x140330218
   1403301e3:	8d 04 40             	lea    eax,[rax+rax*2]
   1403301e6:	c1 e0 04             	shl    eax,0x4
   1403301e9:	83 c0 09             	add    eax,0x9
   1403301ec:	41 03 c2             	add    eax,r10d
   1403301ef:	8d 0c 80             	lea    ecx,[rax+rax*4]
   1403301f2:	48 8b c6             	mov    rax,rsi
   1403301f5:	03 c9                	add    ecx,ecx
   1403301f7:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   1403301fb:	8b ce                	mov    ecx,esi
   1403301fd:	0f 1f 00             	nop    DWORD PTR [rax]
   140330200:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330205:	74 0c                	je     0x140330213
   140330207:	ff c1                	inc    ecx
   140330209:	48 ff c0             	inc    rax
   14033020c:	83 f9 0a             	cmp    ecx,0xa
   14033020f:	72 ef                	jb     0x140330200
   140330211:	eb 05                	jmp    0x140330218
   140330213:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330218:	41 8b 80 00 01 00 00 	mov    eax,DWORD PTR [r8+0x100]
   14033021f:	85 c0                	test   eax,eax
   140330221:	78 35                	js     0x140330258
   140330223:	8d 04 40             	lea    eax,[rax+rax*2]
   140330226:	c1 e0 04             	shl    eax,0x4
   140330229:	83 c0 0a             	add    eax,0xa
   14033022c:	41 03 c2             	add    eax,r10d
   14033022f:	8d 0c 80             	lea    ecx,[rax+rax*4]
   140330232:	48 8b c6             	mov    rax,rsi
   140330235:	03 c9                	add    ecx,ecx
   140330237:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   14033023b:	8b ce                	mov    ecx,esi
   14033023d:	0f 1f 00             	nop    DWORD PTR [rax]
   140330240:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330245:	74 0c                	je     0x140330253
   140330247:	ff c1                	inc    ecx
   140330249:	48 ff c0             	inc    rax
   14033024c:	83 f9 0a             	cmp    ecx,0xa
   14033024f:	72 ef                	jb     0x140330240
   140330251:	eb 05                	jmp    0x140330258
   140330253:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330258:	41 8b 80 20 01 00 00 	mov    eax,DWORD PTR [r8+0x120]
   14033025f:	85 c0                	test   eax,eax
   140330261:	78 35                	js     0x140330298
   140330263:	8d 04 40             	lea    eax,[rax+rax*2]
   140330266:	c1 e0 04             	shl    eax,0x4
   140330269:	83 c0 0b             	add    eax,0xb
   14033026c:	41 03 c2             	add    eax,r10d
   14033026f:	8d 0c 80             	lea    ecx,[rax+rax*4]
   140330272:	48 8b c6             	mov    rax,rsi
   140330275:	03 c9                	add    ecx,ecx
   140330277:	48 8d 14 4b          	lea    rdx,[rbx+rcx*2]
   14033027b:	8b ce                	mov    ecx,esi
   14033027d:	0f 1f 00             	nop    DWORD PTR [rax]
   140330280:	66 44 39 1c 42       	cmp    WORD PTR [rdx+rax*2],r11w
   140330285:	74 0c                	je     0x140330293
   140330287:	ff c1                	inc    ecx
   140330289:	48 ff c0             	inc    rax
   14033028c:	83 f9 0a             	cmp    ecx,0xa
   14033028f:	72 ef                	jb     0x140330280
   140330291:	eb 05                	jmp    0x140330298
   140330293:	66 44 89 0c 42       	mov    WORD PTR [rdx+rax*2],r9w
   140330298:	41 83 c2 0c          	add    r10d,0xc
   14033029c:	49 81 c0 80 01 00 00 	add    r8,0x180
   1403302a3:	41 83 fa 30          	cmp    r10d,0x30
   1403302a7:	0f 82 f7 fc ff ff    	jb     0x14032ffa4
   1403302ad:	66 41 ff c1          	inc    r9w
   1403302b1:	66 44 3b 8f 70 06 00 	cmp    r9w,WORD PTR [rdi+0x670]
   1403302b8:	00 
   1403302b9:	0f 82 c1 fc ff ff    	jb     0x14032ff80
   1403302bf:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   1403302c4:	48 8b 74 24 38       	mov    rsi,QWORD PTR [rsp+0x38]
   1403302c9:	48 83 c4 20          	add    rsp,0x20
   1403302cd:	5f                   	pop    rdi
   1403302ce:	c3                   	ret
   1403302cf:	cc                   	int3
   1403302d0:	cc                   	int3
   1403302d1:	cc                   	int3
   1403302d2:	cc                   	int3
   1403302d3:	cc                   	int3
   1403302d4:	cc                   	int3
   1403302d5:	cc                   	int3
   1403302d6:	cc                   	int3
   1403302d7:	cc                   	int3
   1403302d8:	cc                   	int3
   1403302d9:	cc                   	int3
   1403302da:	cc                   	int3
   1403302db:	cc                   	int3
   1403302dc:	cc                   	int3
   1403302dd:	cc                   	int3
   1403302de:	cc                   	int3
   1403302df:	cc                   	int3
   1403302e0:	4c 8b dc             	mov    r11,rsp
   1403302e3:	55                   	push   rbp
   1403302e4:	57                   	push   rdi
   1403302e5:	41 54                	push   r12
   1403302e7:	41 56                	push   r14
   1403302e9:	49 8d ab 58 fc ff ff 	lea    rbp,[r11-0x3a8]
   1403302f0:	48 81 ec 88 04 00 00 	sub    rsp,0x488
   1403302f7:	45 0f 29 4b 88       	movaps XMMWORD PTR [r11-0x78],xmm9
   1403302fc:	48 8b 05 65 1e 64 00 	mov    rax,QWORD PTR [rip+0x641e65]        # 0x140972168
   140330303:	48 33 c4             	xor    rax,rsp
   140330306:	48 89 85 c0 02 00 00 	mov    QWORD PTR [rbp+0x2c0],rax
   14033030d:	8b 05 41 9e 65 00    	mov    eax,DWORD PTR [rip+0x659e41]        # 0x14098a154
   140330313:	45 33 c9             	xor    r9d,r9d
   140330316:	f2 44 0f 10 0d d9 fe 	movsd  xmm9,QWORD PTR [rip+0x51fed9]        # 0x1408501f8
   14033031d:	51 00 
   14033031f:	48 8b fa             	mov    rdi,rdx
   140330322:	0f 57 c0             	xorps  xmm0,xmm0
   140330325:	48 89 54 24 50       	mov    QWORD PTR [rsp+0x50],rdx
   14033032a:	41 0f b7 d1          	movzx  edx,r9w
   14033032e:	44 89 44 24 48       	mov    DWORD PTR [rsp+0x48],r8d
   140330333:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140330338:	45 8b f0             	mov    r14d,r8d
   14033033b:	4c 8b e1             	mov    r12,rcx
   14033033e:	48 89 4c 24 58       	mov    QWORD PTR [rsp+0x58],rcx
   140330343:	4c 89 8d b0 01 00 00 	mov    QWORD PTR [rbp+0x1b0],r9
   14033034a:	44 89 8d b8 01 00 00 	mov    DWORD PTR [rbp+0x1b8],r9d
   140330351:	66 89 54 24 44       	mov    WORD PTR [rsp+0x44],dx
   140330356:	f2 44 0f 5e c8       	divsd  xmm9,xmm0
   14033035b:	66 44 3b 8f 70 06 00 	cmp    r9w,WORD PTR [rdi+0x670]
   140330362:	00 
   140330363:	0f 83 c6 09 00 00    	jae    0x140330d2f
   140330369:	49 89 5b 20          	mov    QWORD PTR [r11+0x20],rbx
   14033036d:	45 8d 41 ff          	lea    r8d,[r9-0x1]
   140330371:	49 89 73 d8          	mov    QWORD PTR [r11-0x28],rsi
   140330375:	41 ba 00 b8 ff ff    	mov    r10d,0xffffb800
   14033037b:	4d 89 6b d0          	mov    QWORD PTR [r11-0x30],r13
   14033037f:	4d 89 7b c8          	mov    QWORD PTR [r11-0x38],r15
   140330383:	41 0f 29 73 b8       	movaps XMMWORD PTR [r11-0x48],xmm6
   140330388:	0f 57 f6             	xorps  xmm6,xmm6
   14033038b:	41 0f 29 7b a8       	movaps XMMWORD PTR [r11-0x58],xmm7
   140330390:	45 0f 29 43 98       	movaps XMMWORD PTR [r11-0x68],xmm8
   140330395:	45 0f 29 93 78 ff ff 	movaps XMMWORD PTR [r11-0x88],xmm10
   14033039c:	ff 
   14033039d:	f3 44 0f 10 15 52 5d 	movss  xmm10,DWORD PTR [rip+0x375d52]        # 0x1406a60f8
   1403303a4:	37 00 
   1403303a6:	45 0f 29 9b 68 ff ff 	movaps XMMWORD PTR [r11-0x98],xmm11
   1403303ad:	ff 
   1403303ae:	f3 44 0f 10 1d 79 fc 	movss  xmm11,DWORD PTR [rip+0x51fc79]        # 0x140850030
   1403303b5:	51 00 
   1403303b7:	45 0f 29 a3 58 ff ff 	movaps XMMWORD PTR [r11-0xa8],xmm12
   1403303be:	ff 
   1403303bf:	f3 44 0f 10 25 40 75 	movss  xmm12,DWORD PTR [rip+0x377540]        # 0x1406a7908
   1403303c6:	37 00 
   1403303c8:	45 0f 29 ab 48 ff ff 	movaps XMMWORD PTR [r11-0xb8],xmm13
   1403303cf:	ff 
   1403303d0:	f3 44 0f 10 2d 03 fc 	movss  xmm13,DWORD PTR [rip+0x51fc03]        # 0x14084ffdc
   1403303d7:	51 00 
   1403303d9:	45 0f 29 b3 38 ff ff 	movaps XMMWORD PTR [r11-0xc8],xmm14
   1403303e0:	ff 
   1403303e1:	f3 44 0f 10 35 06 ff 	movss  xmm14,DWORD PTR [rip+0x51ff06]        # 0x1408502f0
   1403303e8:	51 00 
   1403303ea:	45 0f 29 bb 28 ff ff 	movaps XMMWORD PTR [r11-0xd8],xmm15
   1403303f1:	ff 
   1403303f2:	f3 44 0f 10 3d 15 6e 	movss  xmm15,DWORD PTR [rip+0x366e15]        # 0x140697210
   1403303f9:	36 00 
   1403303fb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140330400:	48 8b 87 68 06 00 00 	mov    rax,QWORD PTR [rdi+0x668]
   140330407:	0f b7 ca             	movzx  ecx,dx
   14033040a:	0f b7 0c 48          	movzx  ecx,WORD PTR [rax+rcx*2]
   14033040e:	4c 69 f9 94 0d 00 00 	imul   r15,rcx,0xd94
   140330415:	b9 01 00 00 00       	mov    ecx,0x1
   14033041a:	4c 03 bf 60 06 00 00 	add    r15,QWORD PTR [rdi+0x660]
   140330421:	89 4c 24 40          	mov    DWORD PTR [rsp+0x40],ecx
   140330425:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14033042c:	00 00 00 00 
   140330430:	83 f9 01             	cmp    ecx,0x1
   140330433:	be 10 00 00 00       	mov    esi,0x10
   140330438:	41 bd 0f 00 00 00    	mov    r13d,0xf
   14033043e:	41 0f 44 f0          	cmove  esi,r8d
   140330442:	45 0f 44 e9          	cmove  r13d,r9d
   140330446:	89 74 24 4c          	mov    DWORD PTR [rsp+0x4c],esi
   14033044a:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140330450:	83 f9 01             	cmp    ecx,0x1
   140330453:	75 0c                	jne    0x140330461
   140330455:	41 83 fd 10          	cmp    r13d,0x10
   140330459:	41 8b c1             	mov    eax,r9d
   14033045c:	0f 9c c0             	setl   al
   14033045f:	eb 08                	jmp    0x140330469
   140330461:	41 8b c5             	mov    eax,r13d
   140330464:	f7 d0                	not    eax
   140330466:	c1 e8 1f             	shr    eax,0x1f
   140330469:	85 c0                	test   eax,eax
   14033046b:	0f 84 1f 08 00 00    	je     0x140330c90
   140330471:	4d 63 c5             	movsxd r8,r13d
   140330474:	4d 8b d8             	mov    r11,r8
   140330477:	49 c1 e3 05          	shl    r11,0x5
   14033047b:	43 83 7c 3b 0c 00    	cmp    DWORD PTR [r11+r15*1+0xc],0x0
   140330481:	4c 89 5c 24 60       	mov    QWORD PTR [rsp+0x60],r11
   140330486:	4b 8d 04 3b          	lea    rax,[r11+r15*1]
   14033048a:	0f 8d be 07 00 00    	jge    0x140330c4e
   140330490:	f3 43 0f 10 44 3b 1c 	movss  xmm0,DWORD PTR [r11+r15*1+0x1c]
   140330497:	0f 2e c6             	ucomiss xmm0,xmm6
   14033049a:	0f 8a ae 07 00 00    	jp     0x140330c4e
   1403304a0:	0f 85 a8 07 00 00    	jne    0x140330c4e
   1403304a6:	41 f6 c5 01          	test   r13b,0x1
   1403304aa:	0f 84 9e 07 00 00    	je     0x140330c4e
   1403304b0:	41 8b c5             	mov    eax,r13d
   1403304b3:	2b c6                	sub    eax,esi
   1403304b5:	99                   	cdq
   1403304b6:	33 c2                	xor    eax,edx
   1403304b8:	2b c2                	sub    eax,edx
   1403304ba:	83 f8 02             	cmp    eax,0x2
   1403304bd:	0f 8f 8b 07 00 00    	jg     0x140330c4e
   1403304c3:	f3 0f 10 05 e1 9c 65 	movss  xmm0,DWORD PTR [rip+0x659ce1]        # 0x14098a1ac
   1403304ca:	00 
   1403304cb:	b9 01 00 00 00       	mov    ecx,0x1
   1403304d0:	f3 0f 59 05 d4 fa 51 	mulss  xmm0,DWORD PTR [rip+0x51fad4]        # 0x14084ffac
   1403304d7:	00 
   1403304d8:	f3 41 0f 58 c5       	addss  xmm0,xmm13
   1403304dd:	f3 0f 2c c0          	cvttss2si eax,xmm0
   1403304e1:	3b c1                	cmp    eax,ecx
   1403304e3:	0f 4f c8             	cmovg  ecx,eax
   1403304e6:	41 0f b6 87 8c 0d 00 	movzx  eax,BYTE PTR [r15+0xd8c]
   1403304ed:	00 
   1403304ee:	3b c1                	cmp    eax,ecx
   1403304f0:	0f 8c 54 07 00 00    	jl     0x140330c4a
   1403304f6:	f3 43 0f 10 84 87 cc 	movss  xmm0,DWORD PTR [r15+r8*4+0xccc]
   1403304fd:	0c 00 00 
   140330500:	0f 2e c6             	ucomiss xmm0,xmm6
   140330503:	7a 06                	jp     0x14033050b
   140330505:	0f 84 3f 07 00 00    	je     0x140330c4a
   14033050b:	f3 41 0f 10 4f 04    	movss  xmm1,DWORD PTR [r15+0x4]
   140330511:	41 8d 45 01          	lea    eax,[r13+0x1]
   140330515:	0f 2f ce             	comiss xmm1,xmm6
   140330518:	66 44 0f 6e c0       	movd   xmm8,eax
   14033051d:	45 0f 5b c0          	cvtdq2ps xmm8,xmm8
   140330521:	41 0f 28 c0          	movaps xmm0,xmm8
   140330525:	f3 41 0f 59 07       	mulss  xmm0,DWORD PTR [r15]
   14033052a:	76 1b                	jbe    0x140330547
   14033052c:	f3 45 0f 59 c0       	mulss  xmm8,xmm8
   140330531:	f3 45 0f 5c c3       	subss  xmm8,xmm11
   140330536:	f3 44 0f 59 c1       	mulss  xmm8,xmm1
   14033053b:	f3 45 0f 58 c3       	addss  xmm8,xmm11
   140330540:	f3 44 0f 59 c0       	mulss  xmm8,xmm0
   140330545:	eb 04                	jmp    0x14033054b
   140330547:	44 0f 28 c0          	movaps xmm8,xmm0
   14033054b:	45 0f 2f c7          	comiss xmm8,xmm15
   14033054f:	0f 87 26 07 00 00    	ja     0x140330c7b
   140330555:	32 db                	xor    bl,bl
   140330557:	83 3d 4a 94 60 00 03 	cmp    DWORD PTR [rip+0x60944a],0x3        # 0x1409399a8
   14033055e:	72 25                	jb     0x140330585
   140330560:	41 0f b7 87 90 0d 00 	movzx  eax,WORD PTR [r15+0xd90]
   140330567:	00 
   140330568:	66 41 3b c2          	cmp    ax,r10w
   14033056c:	7d 04                	jge    0x140330572
   14033056e:	b3 01                	mov    bl,0x1
   140330570:	eb 13                	jmp    0x140330585
   140330572:	b9 00 48 00 00       	mov    ecx,0x4800
   140330577:	0f b6 db             	movzx  ebx,bl
   14033057a:	66 3b c1             	cmp    ax,cx
   14033057d:	b8 02 00 00 00       	mov    eax,0x2
   140330582:	0f 4f d8             	cmovg  ebx,eax
   140330585:	0f b6 c3             	movzx  eax,bl
   140330588:	41 8b d1             	mov    edx,r9d
   14033058b:	48 89 44 24 68       	mov    QWORD PTR [rsp+0x68],rax
   140330590:	4c 8b 94 c7 08 87 04 	mov    r10,QWORD PTR [rdi+rax*8+0x48708]
   140330597:	00 
   140330598:	44 8b 8c 85 b0 01 00 	mov    r9d,DWORD PTR [rbp+rax*4+0x1b0]
   14033059f:	00 
   1403305a0:	4c 89 54 24 70       	mov    QWORD PTR [rsp+0x70],r10
   1403305a5:	45 85 c9             	test   r9d,r9d
   1403305a8:	74 4f                	je     0x1403305f9
   1403305aa:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   1403305b0:	8b c2                	mov    eax,edx
   1403305b2:	48 03 c0             	add    rax,rax
   1403305b5:	44 8b c2             	mov    r8d,edx
   1403305b8:	f3 41 0f 10 04 c2    	movss  xmm0,DWORD PTR [r10+rax*8]
   1403305be:	f3 41 0f 5c c0       	subss  xmm0,xmm8
   1403305c3:	0f 2e c6             	ucomiss xmm0,xmm6
   1403305c6:	7a 02                	jp     0x1403305ca
   1403305c8:	74 09                	je     0x1403305d3
   1403305ca:	ff c2                	inc    edx
   1403305cc:	41 3b d1             	cmp    edx,r9d
   1403305cf:	72 df                	jb     0x1403305b0
   1403305d1:	eb 26                	jmp    0x1403305f9
   1403305d3:	4d 03 c0             	add    r8,r8
   1403305d6:	4b 8b 44 c2 08       	mov    rax,QWORD PTR [r10+r8*8+0x8]
   1403305db:	8b 48 10             	mov    ecx,DWORD PTR [rax+0x10]
   1403305de:	43 89 4c 3b 1c       	mov    DWORD PTR [r11+r15*1+0x1c],ecx
   1403305e3:	4b 8b 44 c2 08       	mov    rax,QWORD PTR [r10+r8*8+0x8]
   1403305e8:	8b 48 08             	mov    ecx,DWORD PTR [rax+0x8]
   1403305eb:	43 89 4c 3b 14       	mov    DWORD PTR [r11+r15*1+0x14],ecx
   1403305f0:	41 3b d1             	cmp    edx,r9d
   1403305f3:	0f 82 82 06 00 00    	jb     0x140330c7b
   1403305f9:	33 d2                	xor    edx,edx
   1403305fb:	48 8d 4d 80          	lea    rcx,[rbp-0x80]
   1403305ff:	41 b8 30 02 00 00    	mov    r8d,0x230
   140330605:	e8 e0 06 2f 00       	call   0x140620cea
   14033060a:	41 8b 94 24 c0 00 00 	mov    edx,DWORD PTR [r12+0xc0]
   140330611:	00 
   140330612:	ff ca                	dec    edx
   140330614:	83 fa 01             	cmp    edx,0x1
   140330617:	7c 54                	jl     0x14033066d
   140330619:	4d 8b 8c 24 c8 00 00 	mov    r9,QWORD PTR [r12+0xc8]
   140330620:	00 
   140330621:	f3 0f 10 15 b7 99 65 	movss  xmm2,DWORD PTR [rip+0x6599b7]        # 0x140989fe0
   140330628:	00 
   140330629:	49 83 c1 04          	add    r9,0x4
   14033062d:	4c 63 c2             	movsxd r8,edx
   140330630:	49 8b c8             	mov    rcx,r8
   140330633:	f3 41 0f 59 d5       	mulss  xmm2,xmm13
   140330638:	48 c1 e1 06          	shl    rcx,0x6
   14033063c:	4c 03 c9             	add    r9,rcx
   14033063f:	90                   	nop
   140330640:	44 0f 2f d2          	comiss xmm10,xmm2
   140330644:	76 06                	jbe    0x14033064c
   140330646:	41 0f 28 ca          	movaps xmm1,xmm10
   14033064a:	eb 03                	jmp    0x14033064f
   14033064c:	0f 28 ca             	movaps xmm1,xmm2
   14033064f:	f3 41 0f 10 01       	movss  xmm0,DWORD PTR [r9]
   140330654:	f3 0f 5c c1          	subss  xmm0,xmm1
   140330658:	41 0f 2f c0          	comiss xmm0,xmm8
   14033065c:	77 43                	ja     0x1403306a1
   14033065e:	ff ca                	dec    edx
   140330660:	49 ff c8             	dec    r8
   140330663:	49 83 e9 40          	sub    r9,0x40
   140330667:	49 83 f8 01          	cmp    r8,0x1
   14033066b:	7d d3                	jge    0x140330640
   14033066d:	45 33 db             	xor    r11d,r11d
   140330670:	41 8b d3             	mov    edx,r11d
   140330673:	8b 35 2f 9b 65 00    	mov    esi,DWORD PTR [rip+0x659b2f]        # 0x14098a1a8
   140330679:	45 8b d6             	mov    r10d,r14d
   14033067c:	44 0f af d6          	imul   r10d,esi
   140330680:	44 0f 2e c6          	ucomiss xmm8,xmm6
   140330684:	89 95 a8 01 00 00    	mov    DWORD PTR [rbp+0x1a8],edx
   14033068a:	88 9d ac 01 00 00    	mov    BYTE PTR [rbp+0x1ac],bl
   140330690:	7a 14                	jp     0x1403306a6
   140330692:	75 12                	jne    0x1403306a6
   140330694:	45 8b 4c 24 28       	mov    r9d,DWORD PTR [r12+0x28]
   140330699:	45 8b c3             	mov    r8d,r11d
   14033069c:	e9 91 00 00 00       	jmp    0x140330732
   1403306a1:	45 33 db             	xor    r11d,r11d
   1403306a4:	eb cd                	jmp    0x140330673
   1403306a6:	8b 05 a8 9a 65 00    	mov    eax,DWORD PTR [rip+0x659aa8]        # 0x14098a154
   1403306ac:	0f 57 c9             	xorps  xmm1,xmm1
   1403306af:	f3 48 0f 2a c8       	cvtsi2ss xmm1,rax
   1403306b4:	0f 28 c1             	movaps xmm0,xmm1
   1403306b7:	f3 41 0f 59 c2       	mulss  xmm0,xmm10
   1403306bc:	f3 41 0f 5e c0       	divss  xmm0,xmm8
   1403306c1:	f3 41 0f 58 c4       	addss  xmm0,xmm12
   1403306c6:	f3 48 0f 2c c0       	cvttss2si rax,xmm0
   1403306cb:	0f 28 c1             	movaps xmm0,xmm1
   1403306ce:	f3 0f 59 05 12 da 35 	mulss  xmm0,DWORD PTR [rip+0x35da12]        # 0x14068e0e8
   1403306d5:	00 
   1403306d6:	f3 41 0f 58 c4       	addss  xmm0,xmm12
   1403306db:	f3 4c 0f 2c c0       	cvttss2si r8,xmm0
   1403306e0:	41 3b c0             	cmp    eax,r8d
   1403306e3:	44 0f 43 c0          	cmovae r8d,eax
   1403306e7:	41 80 bc 24 91 00 00 	cmp    BYTE PTR [r12+0x91],0x0
   1403306ee:	00 00 
   1403306f0:	74 0a                	je     0x1403306fc
   1403306f2:	f3 0f 10 05 a6 fa 51 	movss  xmm0,DWORD PTR [rip+0x51faa6]        # 0x1408501a0
   1403306f9:	00 
   1403306fa:	eb 04                	jmp    0x140330700
   1403306fc:	41 0f 28 c3          	movaps xmm0,xmm11
   140330700:	f3 0f 59 05 08 6a 36 	mulss  xmm0,DWORD PTR [rip+0x366a08]        # 0x140697110
   140330707:	00 
   140330708:	45 8b 4c 24 28       	mov    r9d,DWORD PTR [r12+0x28]
   14033070d:	f3 0f 59 c8          	mulss  xmm1,xmm0
   140330711:	42 8d 0c 4d 01 00 00 	lea    ecx,[r9*2+0x1]
   140330718:	00 
   140330719:	0f af ce             	imul   ecx,esi
   14033071c:	f3 41 0f 58 cc       	addss  xmm1,xmm12
   140330721:	f3 48 0f 2c c1       	cvttss2si rax,xmm1
   140330726:	3b c8                	cmp    ecx,eax
   140330728:	0f 43 c8             	cmovae ecx,eax
   14033072b:	41 3b c8             	cmp    ecx,r8d
   14033072e:	44 0f 42 c1          	cmovb  r8d,ecx
   140330732:	41 8b c0             	mov    eax,r8d
   140330735:	99                   	cdq
   140330736:	2b c2                	sub    eax,edx
   140330738:	d1 f8                	sar    eax,1
   14033073a:	8b c8                	mov    ecx,eax
   14033073c:	8b c6                	mov    eax,esi
   14033073e:	99                   	cdq
   14033073f:	2b c2                	sub    eax,edx
   140330741:	d1 f8                	sar    eax,1
   140330743:	2b c1                	sub    eax,ecx
   140330745:	41 8b 4c 24 24       	mov    ecx,DWORD PTR [r12+0x24]
   14033074a:	41 03 c2             	add    eax,r10d
   14033074d:	85 c0                	test   eax,eax
   14033074f:	41 0f 4e c3          	cmovle eax,r11d
   140330753:	42 8d 14 49          	lea    edx,[rcx+r9*2]
   140330757:	0f af d6             	imul   edx,esi
   14033075a:	48 8d 8d c0 01 00 00 	lea    rcx,[rbp+0x1c0]
   140330761:	44 03 c0             	add    r8d,eax
   140330764:	89 85 98 01 00 00    	mov    DWORD PTR [rbp+0x198],eax
   14033076a:	44 3b c2             	cmp    r8d,edx
   14033076d:	44 0f 4d c2          	cmovge r8d,edx
   140330771:	99                   	cdq
   140330772:	f7 fe                	idiv   esi
   140330774:	44 89 85 9c 01 00 00 	mov    DWORD PTR [rbp+0x19c],r8d
   14033077b:	33 d2                	xor    edx,edx
   14033077d:	41 b8 00 01 00 00    	mov    r8d,0x100
   140330783:	48 63 d8             	movsxd rbx,eax
   140330786:	e8 5f 05 2f 00       	call   0x140620cea
   14033078b:	41 8b d6             	mov    edx,r14d
   14033078e:	4c 8b e3             	mov    r12,rbx
   140330791:	2b d3                	sub    edx,ebx
   140330793:	4d 63 f6             	movsxd r14,r14d
   140330796:	48 63 ca             	movsxd rcx,edx
   140330799:	48 8b fb             	mov    rdi,rbx
   14033079c:	f3 44 0f 11 84 8d c0 	movss  DWORD PTR [rbp+rcx*4+0x1c0],xmm8
   1403307a3:	01 00 00 
   1403307a6:	49 3b de             	cmp    rbx,r14
   1403307a9:	0f 8d 95 01 00 00    	jge    0x140330944
   1403307af:	49 8b c6             	mov    rax,r14
   1403307b2:	48 2b c3             	sub    rax,rbx
   1403307b5:	48 83 f8 04          	cmp    rax,0x4
   1403307b9:	0f 8c 0f 01 00 00    	jl     0x1403308ce
   1403307bf:	4c 8b 4c 24 50       	mov    r9,QWORD PTR [rsp+0x50]
   1403307c4:	4c 8d 85 c4 01 00 00 	lea    r8,[rbp+0x1c4]
   1403307cb:	8b 74 24 48          	mov    esi,DWORD PTR [rsp+0x48]
   1403307cf:	4d 8b de             	mov    r11,r14
   1403307d2:	4c 2b db             	sub    r11,rbx
   1403307d5:	83 c2 fe             	add    edx,0xfffffffe
   1403307d8:	49 83 eb 04          	sub    r11,0x4
   1403307dc:	4d 8b 89 80 06 00 00 	mov    r9,QWORD PTR [r9+0x680]
   1403307e3:	49 c1 eb 02          	shr    r11,0x2
   1403307e7:	49 ff c3             	inc    r11
   1403307ea:	45 8b 11             	mov    r10d,DWORD PTR [r9]
   1403307ed:	4a 8d 3c 9b          	lea    rdi,[rbx+r11*4]
   1403307f1:	41 83 fa 08          	cmp    r10d,0x8
   1403307f5:	48 8d 0d 70 69 37 00 	lea    rcx,[rip+0x376970]        # 0x1406a716c
   1403307fc:	8d 42 01             	lea    eax,[rdx+0x1]
   1403307ff:	49 0f 46 c9          	cmovbe rcx,r9
   140330803:	3b 01                	cmp    eax,DWORD PTR [rcx]
   140330805:	7d 1b                	jge    0x140330822
   140330807:	8b c6                	mov    eax,esi
   140330809:	2b c3                	sub    eax,ebx
   14033080b:	ff c8                	dec    eax
   14033080d:	8d 04 40             	lea    eax,[rax+rax*2]
   140330810:	c1 e0 04             	shl    eax,0x4
   140330813:	41 03 c5             	add    eax,r13d
   140330816:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   14033081d:	00 
   14033081e:	41 89 48 fc          	mov    DWORD PTR [r8-0x4],ecx
   140330822:	41 83 fa 08          	cmp    r10d,0x8
   140330826:	48 8d 05 3f 69 37 00 	lea    rax,[rip+0x37693f]        # 0x1406a716c
   14033082d:	49 0f 46 c1          	cmovbe rax,r9
   140330831:	3b 10                	cmp    edx,DWORD PTR [rax]
   140330833:	7d 1b                	jge    0x140330850
   140330835:	8b c6                	mov    eax,esi
   140330837:	2b c3                	sub    eax,ebx
   140330839:	83 e8 02             	sub    eax,0x2
   14033083c:	8d 04 40             	lea    eax,[rax+rax*2]
   14033083f:	c1 e0 04             	shl    eax,0x4
   140330842:	41 03 c5             	add    eax,r13d
   140330845:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   14033084c:	00 
   14033084d:	41 89 08             	mov    DWORD PTR [r8],ecx
   140330850:	41 83 fa 08          	cmp    r10d,0x8
   140330854:	48 8d 0d 11 69 37 00 	lea    rcx,[rip+0x376911]        # 0x1406a716c
   14033085b:	8d 42 ff             	lea    eax,[rdx-0x1]
   14033085e:	49 0f 46 c9          	cmovbe rcx,r9
   140330862:	3b 01                	cmp    eax,DWORD PTR [rcx]
   140330864:	7d 1c                	jge    0x140330882
   140330866:	8b c6                	mov    eax,esi
   140330868:	2b c3                	sub    eax,ebx
   14033086a:	83 e8 03             	sub    eax,0x3
   14033086d:	8d 04 40             	lea    eax,[rax+rax*2]
   140330870:	c1 e0 04             	shl    eax,0x4
   140330873:	41 03 c5             	add    eax,r13d
   140330876:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   14033087d:	00 
   14033087e:	41 89 48 04          	mov    DWORD PTR [r8+0x4],ecx
   140330882:	41 83 fa 08          	cmp    r10d,0x8
   140330886:	48 8d 0d df 68 37 00 	lea    rcx,[rip+0x3768df]        # 0x1406a716c
   14033088d:	8d 42 fe             	lea    eax,[rdx-0x2]
   140330890:	49 0f 46 c9          	cmovbe rcx,r9
   140330894:	3b 01                	cmp    eax,DWORD PTR [rcx]
   140330896:	7d 1c                	jge    0x1403308b4
   140330898:	8b c6                	mov    eax,esi
   14033089a:	2b c3                	sub    eax,ebx
   14033089c:	83 e8 04             	sub    eax,0x4
   14033089f:	8d 04 40             	lea    eax,[rax+rax*2]
   1403308a2:	c1 e0 04             	shl    eax,0x4
   1403308a5:	41 03 c5             	add    eax,r13d
   1403308a8:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   1403308af:	00 
   1403308b0:	41 89 48 08          	mov    DWORD PTR [r8+0x8],ecx
   1403308b4:	83 c3 04             	add    ebx,0x4
   1403308b7:	83 ea 04             	sub    edx,0x4
   1403308ba:	49 83 c0 10          	add    r8,0x10
   1403308be:	49 83 eb 01          	sub    r11,0x1
   1403308c2:	0f 85 29 ff ff ff    	jne    0x1403307f1
   1403308c8:	8b 35 da 98 65 00    	mov    esi,DWORD PTR [rip+0x6598da]        # 0x14098a1a8
   1403308ce:	49 3b fe             	cmp    rdi,r14
   1403308d1:	7d 71                	jge    0x140330944
   1403308d3:	48 8b 44 24 50       	mov    rax,QWORD PTR [rsp+0x50]
   1403308d8:	4c 8d 85 c0 01 00 00 	lea    r8,[rbp+0x1c0]
   1403308df:	8b 74 24 48          	mov    esi,DWORD PTR [rsp+0x48]
   1403308e3:	4d 8b ce             	mov    r9,r14
   1403308e6:	8b d6                	mov    edx,esi
   1403308e8:	2b d3                	sub    edx,ebx
   1403308ea:	4c 8b 90 80 06 00 00 	mov    r10,QWORD PTR [rax+0x680]
   1403308f1:	ff ca                	dec    edx
   1403308f3:	48 8b c7             	mov    rax,rdi
   1403308f6:	49 2b c4             	sub    rax,r12
   1403308f9:	4c 2b cf             	sub    r9,rdi
   1403308fc:	45 8b 1a             	mov    r11d,DWORD PTR [r10]
   1403308ff:	4d 8d 04 80          	lea    r8,[r8+rax*4]
   140330903:	41 83 fb 08          	cmp    r11d,0x8
   140330907:	48 8d 05 5e 68 37 00 	lea    rax,[rip+0x37685e]        # 0x1406a716c
   14033090e:	49 0f 46 c2          	cmovbe rax,r10
   140330912:	3b 10                	cmp    edx,DWORD PTR [rax]
   140330914:	7d 1a                	jge    0x140330930
   140330916:	8b c6                	mov    eax,esi
   140330918:	2b c3                	sub    eax,ebx
   14033091a:	ff c8                	dec    eax
   14033091c:	8d 04 40             	lea    eax,[rax+rax*2]
   14033091f:	c1 e0 04             	shl    eax,0x4
   140330922:	41 03 c5             	add    eax,r13d
   140330925:	41 8b 8c 87 cc 06 00 	mov    ecx,DWORD PTR [r15+rax*4+0x6cc]
   14033092c:	00 
   14033092d:	41 89 08             	mov    DWORD PTR [r8],ecx
   140330930:	ff c3                	inc    ebx
   140330932:	ff ca                	dec    edx
   140330934:	49 83 c0 04          	add    r8,0x4
   140330938:	49 83 e9 01          	sub    r9,0x1
   14033093c:	75 c5                	jne    0x140330903
   14033093e:	8b 35 64 98 65 00    	mov    esi,DWORD PTR [rip+0x659864]        # 0x14098a1a8
   140330944:	33 d2                	xor    edx,edx
   140330946:	48 8d 4d 98          	lea    rcx,[rbp-0x68]
   14033094a:	41 b8 00 02 00 00    	mov    r8d,0x200
   140330950:	41 0f 28 fe          	movaps xmm7,xmm14
   140330954:	e8 91 03 2f 00       	call   0x140620cea
   140330959:	4d 3b e6             	cmp    r12,r14
   14033095c:	0f 8d b5 01 00 00    	jge    0x140330b17
   140330962:	49 8b c6             	mov    rax,r14
   140330965:	4d 8b cc             	mov    r9,r12
   140330968:	49 2b c4             	sub    rax,r12
   14033096b:	48 83 f8 04          	cmp    rax,0x4
   14033096f:	0f 8c 31 01 00 00    	jl     0x140330aa6
   140330975:	4d 8b c6             	mov    r8,r14
   140330978:	48 8d 55 a0          	lea    rdx,[rbp-0x60]
   14033097c:	4d 2b c4             	sub    r8,r12
   14033097f:	48 8d 8d c4 01 00 00 	lea    rcx,[rbp+0x1c4]
   140330986:	49 83 e8 04          	sub    r8,0x4
   14033098a:	49 c1 e8 02          	shr    r8,0x2
   14033098e:	49 ff c0             	inc    r8
   140330991:	4f 8d 0c 84          	lea    r9,[r12+r8*4]
   140330995:	66 66 66 0f 1f 84 00 	data16 data16 nop WORD PTR [rax+rax*1+0x0]
   14033099c:	00 00 00 00 
   1403309a0:	f3 0f 10 59 fc       	movss  xmm3,DWORD PTR [rcx-0x4]
   1403309a5:	0f 2e de             	ucomiss xmm3,xmm6
   1403309a8:	f3 0f 10 11          	movss  xmm2,DWORD PTR [rcx]
   1403309ac:	7a 02                	jp     0x1403309b0
   1403309ae:	74 31                	je     0x1403309e1
   1403309b0:	0f 2e d6             	ucomiss xmm2,xmm6
   1403309b3:	7a 02                	jp     0x1403309b7
   1403309b5:	74 2a                	je     0x1403309e1
   1403309b7:	0f 2f f7             	comiss xmm6,xmm7
   1403309ba:	8b c6                	mov    eax,esi
   1403309bc:	0f 28 c2             	movaps xmm0,xmm2
   1403309bf:	f3 0f 5c c3          	subss  xmm0,xmm3
   1403309c3:	0f 5a c8             	cvtps2pd xmm1,xmm0
   1403309c6:	0f 57 c0             	xorps  xmm0,xmm0
   1403309c9:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   1403309ce:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   1403309d3:	f2 0f 5e c8          	divsd  xmm1,xmm0
   1403309d7:	f2 0f 11 4a f8       	movsd  QWORD PTR [rdx-0x8],xmm1
   1403309dc:	76 03                	jbe    0x1403309e1
   1403309de:	0f 28 fb             	movaps xmm7,xmm3
   1403309e1:	0f 2e d6             	ucomiss xmm2,xmm6
   1403309e4:	f3 0f 10 59 04       	movss  xmm3,DWORD PTR [rcx+0x4]
   1403309e9:	7a 02                	jp     0x1403309ed
   1403309eb:	74 30                	je     0x140330a1d
   1403309ed:	0f 2e de             	ucomiss xmm3,xmm6
   1403309f0:	7a 02                	jp     0x1403309f4
   1403309f2:	74 29                	je     0x140330a1d
   1403309f4:	0f 2f f7             	comiss xmm6,xmm7
   1403309f7:	8b c6                	mov    eax,esi
   1403309f9:	0f 28 c3             	movaps xmm0,xmm3
   1403309fc:	f3 0f 5c c2          	subss  xmm0,xmm2
   140330a00:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140330a03:	0f 57 c0             	xorps  xmm0,xmm0
   140330a06:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140330a0b:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   140330a10:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140330a14:	f2 0f 11 0a          	movsd  QWORD PTR [rdx],xmm1
   140330a18:	76 03                	jbe    0x140330a1d
   140330a1a:	0f 28 fa             	movaps xmm7,xmm2
   140330a1d:	0f 2e de             	ucomiss xmm3,xmm6
   140330a20:	f3 0f 10 51 08       	movss  xmm2,DWORD PTR [rcx+0x8]
   140330a25:	7a 02                	jp     0x140330a29
   140330a27:	74 31                	je     0x140330a5a
   140330a29:	0f 2e d6             	ucomiss xmm2,xmm6
   140330a2c:	7a 02                	jp     0x140330a30
   140330a2e:	74 2d                	je     0x140330a5d
   140330a30:	0f 2f f7             	comiss xmm6,xmm7
   140330a33:	8b c6                	mov    eax,esi
   140330a35:	0f 28 c2             	movaps xmm0,xmm2
   140330a38:	f3 0f 5c c3          	subss  xmm0,xmm3
   140330a3c:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140330a3f:	0f 57 c0             	xorps  xmm0,xmm0
   140330a42:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140330a47:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   140330a4c:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140330a50:	f2 0f 11 4a 08       	movsd  QWORD PTR [rdx+0x8],xmm1
   140330a55:	76 03                	jbe    0x140330a5a
   140330a57:	0f 28 fb             	movaps xmm7,xmm3
   140330a5a:	0f 2e d6             	ucomiss xmm2,xmm6
   140330a5d:	7a 02                	jp     0x140330a61
   140330a5f:	74 33                	je     0x140330a94
   140330a61:	f3 0f 10 41 0c       	movss  xmm0,DWORD PTR [rcx+0xc]
   140330a66:	0f 2e c6             	ucomiss xmm0,xmm6
   140330a69:	7a 02                	jp     0x140330a6d
   140330a6b:	74 27                	je     0x140330a94
   140330a6d:	0f 2f f7             	comiss xmm6,xmm7
   140330a70:	8b c6                	mov    eax,esi
   140330a72:	f3 0f 5c c2          	subss  xmm0,xmm2
   140330a76:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140330a79:	0f 57 c0             	xorps  xmm0,xmm0
   140330a7c:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140330a81:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   140330a86:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140330a8a:	f2 0f 11 4a 10       	movsd  QWORD PTR [rdx+0x10],xmm1
   140330a8f:	76 03                	jbe    0x140330a94
   140330a91:	0f 28 fa             	movaps xmm7,xmm2
   140330a94:	48 83 c1 10          	add    rcx,0x10
   140330a98:	48 83 c2 20          	add    rdx,0x20
   140330a9c:	49 83 e8 01          	sub    r8,0x1
   140330aa0:	0f 85 fa fe ff ff    	jne    0x1403309a0
   140330aa6:	4d 3b ce             	cmp    r9,r14
   140330aa9:	7d 67                	jge    0x140330b12
   140330aab:	49 8b c1             	mov    rax,r9
   140330aae:	48 8d 55 98          	lea    rdx,[rbp-0x68]
   140330ab2:	49 2b c4             	sub    rax,r12
   140330ab5:	48 8d 8d c4 01 00 00 	lea    rcx,[rbp+0x1c4]
   140330abc:	4d 2b f1             	sub    r14,r9
   140330abf:	48 8d 14 c2          	lea    rdx,[rdx+rax*8]
   140330ac3:	48 8d 0c 81          	lea    rcx,[rcx+rax*4]
   140330ac7:	f3 0f 10 51 fc       	movss  xmm2,DWORD PTR [rcx-0x4]
   140330acc:	0f 2e d6             	ucomiss xmm2,xmm6
   140330acf:	7a 02                	jp     0x140330ad3
   140330ad1:	74 31                	je     0x140330b04
   140330ad3:	f3 0f 10 01          	movss  xmm0,DWORD PTR [rcx]
   140330ad7:	0f 2e c6             	ucomiss xmm0,xmm6
   140330ada:	7a 02                	jp     0x140330ade
   140330adc:	74 26                	je     0x140330b04
   140330ade:	0f 2f f7             	comiss xmm6,xmm7
   140330ae1:	8b c6                	mov    eax,esi
   140330ae3:	f3 0f 5c c2          	subss  xmm0,xmm2
   140330ae7:	0f 5a c8             	cvtps2pd xmm1,xmm0
   140330aea:	0f 57 c0             	xorps  xmm0,xmm0
   140330aed:	f2 48 0f 2a c0       	cvtsi2sd xmm0,rax
   140330af2:	f2 41 0f 59 c9       	mulsd  xmm1,xmm9
   140330af7:	f2 0f 5e c8          	divsd  xmm1,xmm0
   140330afb:	f2 0f 11 0a          	movsd  QWORD PTR [rdx],xmm1
   140330aff:	76 03                	jbe    0x140330b04
   140330b01:	0f 28 fa             	movaps xmm7,xmm2
   140330b04:	48 83 c1 04          	add    rcx,0x4
   140330b08:	48 83 c2 08          	add    rdx,0x8
   140330b0c:	49 83 ee 01          	sub    r14,0x1
   140330b10:	75 b5                	jne    0x140330ac7
   140330b12:	0f 2f f7             	comiss xmm6,xmm7
   140330b15:	76 04                	jbe    0x140330b1b
   140330b17:	41 0f 28 f8          	movaps xmm7,xmm8
   140330b1b:	48 8b 7c 24 50       	mov    rdi,QWORD PTR [rsp+0x50]
   140330b20:	4c 8d 4d 80          	lea    r9,[rbp-0x80]
   140330b24:	4c 8b 64 24 58       	mov    r12,QWORD PTR [rsp+0x58]
   140330b29:	33 c0                	xor    eax,eax
   140330b2b:	44 8b 74 24 48       	mov    r14d,DWORD PTR [rsp+0x48]
   140330b30:	48 8b d7             	mov    rdx,rdi
   140330b33:	f3 44 0f 11 74 24 38 	movss  DWORD PTR [rsp+0x38],xmm14
   140330b3a:	45 8b c6             	mov    r8d,r14d
   140330b3d:	48 89 87 e4 03 00 00 	mov    QWORD PTR [rdi+0x3e4],rax
   140330b44:	49 8b cc             	mov    rcx,r12
   140330b47:	48 89 87 ec 03 00 00 	mov    QWORD PTR [rdi+0x3ec],rax
   140330b4e:	48 89 87 f4 03 00 00 	mov    QWORD PTR [rdi+0x3f4],rax
   140330b55:	48 89 87 fc 03 00 00 	mov    QWORD PTR [rdi+0x3fc],rax
   140330b5c:	48 89 87 04 04 00 00 	mov    QWORD PTR [rdi+0x404],rax
   140330b63:	48 89 87 0c 04 00 00 	mov    QWORD PTR [rdi+0x40c],rax
   140330b6a:	89 87 14 04 00 00    	mov    DWORD PTR [rdi+0x414],eax
   140330b70:	66 89 87 18 04 00 00 	mov    WORD PTR [rdi+0x418],ax
   140330b77:	8b 85 98 01 00 00    	mov    eax,DWORD PTR [rbp+0x198]
   140330b7d:	89 87 88 04 00 00    	mov    DWORD PTR [rdi+0x488],eax
   140330b83:	8b 85 9c 01 00 00    	mov    eax,DWORD PTR [rbp+0x19c]
   140330b89:	c6 44 24 30 00       	mov    BYTE PTR [rsp+0x30],0x0
   140330b8e:	c6 44 24 28 00       	mov    BYTE PTR [rsp+0x28],0x0
   140330b93:	89 87 8c 04 00 00    	mov    DWORD PTR [rdi+0x48c],eax
   140330b99:	f3 0f 11 7d 80       	movss  DWORD PTR [rbp-0x80],xmm7
   140330b9e:	c6 44 24 20 01       	mov    BYTE PTR [rsp+0x20],0x1
   140330ba3:	e8 88 ac fe ff       	call   0x14031b830
   140330ba8:	f3 0f 10 45 90       	movss  xmm0,DWORD PTR [rbp-0x70]
   140330bad:	0f 2f f0             	comiss xmm6,xmm0
   140330bb0:	72 05                	jb     0x140330bb7
   140330bb2:	0f 28 c6             	movaps xmm0,xmm6
   140330bb5:	eb 24                	jmp    0x140330bdb
   140330bb7:	f2 0f 10 0d 61 d5 35 	movsd  xmm1,QWORD PTR [rip+0x35d561]        # 0x14068e120
   140330bbe:	00 
   140330bbf:	0f 5a c0             	cvtps2pd xmm0,xmm0
   140330bc2:	f2 0f 5e 05 b6 d5 35 	divsd  xmm0,QWORD PTR [rip+0x35d5b6]        # 0x14068e180
   140330bc9:	00 
   140330bca:	e8 ab 01 2f 00       	call   0x140620d7a
   140330bcf:	f2 0f 5a c0          	cvtsd2ss xmm0,xmm0
   140330bd3:	f3 0f 59 05 d5 d5 35 	mulss  xmm0,DWORD PTR [rip+0x35d5d5]        # 0x14068e1b0
   140330bda:	00 
   140330bdb:	4c 8b 5c 24 60       	mov    r11,QWORD PTR [rsp+0x60]
   140330be0:	41 8d 45 01          	lea    eax,[r13+0x1]
   140330be4:	4c 8b 44 24 68       	mov    r8,QWORD PTR [rsp+0x68]
   140330be9:	0f b6 c8             	movzx  ecx,al
   140330bec:	f3 0f 11 45 90       	movss  DWORD PTR [rbp-0x70],xmm0
   140330bf1:	f3 43 0f 11 44 3b 1c 	movss  DWORD PTR [r11+r15*1+0x1c],xmm0
   140330bf8:	f3 43 0f 11 44 3b 14 	movss  DWORD PTR [r11+r15*1+0x14],xmm0
   140330bff:	41 0f b6 87 92 0d 00 	movzx  eax,BYTE PTR [r15+0xd92]
   140330c06:	00 
   140330c07:	3a c1                	cmp    al,cl
   140330c09:	0f 43 c8             	cmovae ecx,eax
   140330c0c:	41 88 8f 92 0d 00 00 	mov    BYTE PTR [r15+0xd92],cl
   140330c13:	42 8b 8c 85 b0 01 00 	mov    ecx,DWORD PTR [rbp+r8*4+0x1b0]
   140330c1a:	00 
   140330c1b:	81 f9 80 00 00 00    	cmp    ecx,0x80
   140330c21:	73 27                	jae    0x140330c4a
   140330c23:	48 8b 54 24 70       	mov    rdx,QWORD PTR [rsp+0x70]
   140330c28:	4d 8d 4b 0c          	lea    r9,[r11+0xc]
   140330c2c:	8b c1                	mov    eax,ecx
   140330c2e:	48 03 c0             	add    rax,rax
   140330c31:	4d 03 cf             	add    r9,r15
   140330c34:	f3 44 0f 11 04 c2    	movss  DWORD PTR [rdx+rax*8],xmm8
   140330c3a:	4c 89 4c c2 08       	mov    QWORD PTR [rdx+rax*8+0x8],r9
   140330c3f:	8d 41 01             	lea    eax,[rcx+0x1]
   140330c42:	42 89 84 85 b0 01 00 	mov    DWORD PTR [rbp+r8*4+0x1b0],eax
   140330c49:	00 
   140330c4a:	8b 4c 24 40          	mov    ecx,DWORD PTR [rsp+0x40]
   140330c4e:	8b 44 24 4c          	mov    eax,DWORD PTR [rsp+0x4c]
   140330c52:	41 ba 00 b8 ff ff    	mov    r10d,0xffffb800
   140330c58:	f3 43 0f 10 44 3b 1c 	movss  xmm0,DWORD PTR [r11+r15*1+0x1c]
   140330c5f:	0f 2f 05 42 6e 37 00 	comiss xmm0,DWORD PTR [rip+0x376e42]        # 0x1406a7aa8
   140330c66:	41 0f 43 c5          	cmovae eax,r13d
   140330c6a:	44 03 e9             	add    r13d,ecx
   140330c6d:	45 33 c9             	xor    r9d,r9d
   140330c70:	89 44 24 4c          	mov    DWORD PTR [rsp+0x4c],eax
   140330c74:	8b f0                	mov    esi,eax
   140330c76:	e9 d5 f7 ff ff       	jmp    0x140330450
   140330c7b:	8b 4c 24 40          	mov    ecx,DWORD PTR [rsp+0x40]
   140330c7f:	41 ba 00 b8 ff ff    	mov    r10d,0xffffb800
   140330c85:	44 03 e9             	add    r13d,ecx
   140330c88:	45 33 c9             	xor    r9d,r9d
   140330c8b:	e9 c0 f7 ff ff       	jmp    0x140330450
   140330c90:	83 e9 02             	sub    ecx,0x2
   140330c93:	41 b8 ff ff ff ff    	mov    r8d,0xffffffff
   140330c99:	89 4c 24 40          	mov    DWORD PTR [rsp+0x40],ecx
   140330c9d:	83 f9 ff             	cmp    ecx,0xffffffff
   140330ca0:	0f 8d 8a f7 ff ff    	jge    0x140330430
   140330ca6:	0f b7 54 24 44       	movzx  edx,WORD PTR [rsp+0x44]
   140330cab:	66 ff c2             	inc    dx
   140330cae:	66 89 54 24 44       	mov    WORD PTR [rsp+0x44],dx
   140330cb3:	66 3b 97 70 06 00 00 	cmp    dx,WORD PTR [rdi+0x670]
   140330cba:	0f 82 40 f7 ff ff    	jb     0x140330400
   140330cc0:	44 0f 28 bc 24 d0 03 	movaps xmm15,XMMWORD PTR [rsp+0x3d0]
   140330cc7:	00 00 
   140330cc9:	44 0f 28 b4 24 e0 03 	movaps xmm14,XMMWORD PTR [rsp+0x3e0]
   140330cd0:	00 00 
   140330cd2:	44 0f 28 ac 24 f0 03 	movaps xmm13,XMMWORD PTR [rsp+0x3f0]
   140330cd9:	00 00 
   140330cdb:	44 0f 28 a4 24 00 04 	movaps xmm12,XMMWORD PTR [rsp+0x400]
   140330ce2:	00 00 
   140330ce4:	44 0f 28 9c 24 10 04 	movaps xmm11,XMMWORD PTR [rsp+0x410]
   140330ceb:	00 00 
   140330ced:	44 0f 28 94 24 20 04 	movaps xmm10,XMMWORD PTR [rsp+0x420]
   140330cf4:	00 00 
   140330cf6:	44 0f 28 84 24 40 04 	movaps xmm8,XMMWORD PTR [rsp+0x440]
   140330cfd:	00 00 
   140330cff:	0f 28 bc 24 50 04 00 	movaps xmm7,XMMWORD PTR [rsp+0x450]
   140330d06:	00 
   140330d07:	0f 28 b4 24 60 04 00 	movaps xmm6,XMMWORD PTR [rsp+0x460]
   140330d0e:	00 
   140330d0f:	4c 8b bc 24 70 04 00 	mov    r15,QWORD PTR [rsp+0x470]
   140330d16:	00 
   140330d17:	4c 8b ac 24 78 04 00 	mov    r13,QWORD PTR [rsp+0x478]
   140330d1e:	00 
   140330d1f:	48 8b b4 24 80 04 00 	mov    rsi,QWORD PTR [rsp+0x480]
   140330d26:	00 
   140330d27:	48 8b 9c 24 c8 04 00 	mov    rbx,QWORD PTR [rsp+0x4c8]
   140330d2e:	00 
   140330d2f:	48 8b 8d c0 02 00 00 	mov    rcx,QWORD PTR [rbp+0x2c0]
   140330d36:	48 33 cc             	xor    rcx,rsp
   140330d39:	e8 c2 a8 2e 00       	call   0x14061b600
   140330d3e:	44 0f 28 8c 24 30 04 	movaps xmm9,XMMWORD PTR [rsp+0x430]
   140330d45:	00 00 
   140330d47:	48 81 c4 88 04 00 00 	add    rsp,0x488
   140330d4e:	41 5e                	pop    r14
   140330d50:	41 5c                	pop    r12
   140330d52:	5f                   	pop    rdi
   140330d53:	5d                   	pop    rbp
   140330d54:	c3                   	ret
   140330d55:	cc                   	int3
   140330d56:	cc                   	int3
   140330d57:	cc                   	int3
   140330d58:	cc                   	int3
   140330d59:	cc                   	int3
   140330d5a:	cc                   	int3
   140330d5b:	cc                   	int3
   140330d5c:	cc                   	int3
   140330d5d:	cc                   	int3
   140330d5e:	cc                   	int3
   140330d5f:	cc                   	int3
   140330d60:	40 53                	rex push rbx
   140330d62:	48 83 ec 30          	sub    rsp,0x30
   140330d66:	0f b7 82 70 06 00 00 	movzx  eax,WORD PTR [rdx+0x670]
   140330d6d:	45 33 c0             	xor    r8d,r8d
   140330d70:	48 8b da             	mov    rbx,rdx
   140330d73:	45 0f b7 c8          	movzx  r9d,r8w
   140330d77:	66 44 3b c0          	cmp    r8w,ax
   140330d7b:	0f 83 80 00 00 00    	jae    0x140330e01
   140330d81:	41 0f b7 c1          	movzx  eax,r9w
   140330d85:	48 69 c8 94 0d 00 00 	imul   rcx,rax,0xd94
   140330d8c:	48 03 8b 60 06 00 00 	add    rcx,QWORD PTR [rbx+0x660]
   140330d93:	0f b6 91 92 0d 00 00 	movzx  edx,BYTE PTR [rcx+0xd92]
   140330d9a:	44 89 41 08          	mov    DWORD PTR [rcx+0x8],r8d
   140330d9e:	84 d2                	test   dl,dl
   140330da0:	74 21                	je     0x140330dc3
   140330da2:	0f 57 c0             	xorps  xmm0,xmm0
   140330da5:	0f b6 d2             	movzx  edx,dl
   140330da8:	48 8d 41 14          	lea    rax,[rcx+0x14]
   140330dac:	0f 1f 40 00          	nop    DWORD PTR [rax+0x0]
   140330db0:	f3 0f 58 00          	addss  xmm0,DWORD PTR [rax]
   140330db4:	48 83 c0 20          	add    rax,0x20
   140330db8:	f3 0f 11 41 08       	movss  DWORD PTR [rcx+0x8],xmm0
   140330dbd:	48 83 ea 01          	sub    rdx,0x1
   140330dc1:	75 ed                	jne    0x140330db0
   140330dc3:	0f b7 83 70 06 00 00 	movzx  eax,WORD PTR [rbx+0x670]
   140330dca:	66 41 ff c1          	inc    r9w
   140330dce:	66 44 3b c8          	cmp    r9w,ax
   140330dd2:	72 ad                	jb     0x140330d81
   140330dd4:	66 44 3b c0          	cmp    r8w,ax
   140330dd8:	73 27                	jae    0x140330e01
   140330dda:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
   140330de0:	48 8b 83 68 06 00 00 	mov    rax,QWORD PTR [rbx+0x668]
   140330de7:	41 0f b7 c8          	movzx  ecx,r8w
   140330deb:	66 44 89 04 48       	mov    WORD PTR [rax+rcx*2],r8w
   140330df0:	66 41 ff c0          	inc    r8w
   140330df4:	0f b7 83 70 06 00 00 	movzx  eax,WORD PTR [rbx+0x670]
   140330dfb:	66 44 3b c0          	cmp    r8w,ax
   140330dff:	72 df                	jb     0x140330de0
   140330e01:	66 83 f8 01          	cmp    ax,0x1
   140330e05:	76 31                	jbe    0x140330e38
   140330e07:	4c 8b 8b 40 06 00 00 	mov    r9,QWORD PTR [rbx+0x640]
   140330e0e:	48 8b 93 60 06 00 00 	mov    rdx,QWORD PTR [rbx+0x660]
   140330e15:	48 8b 8b 68 06 00 00 	mov    rcx,QWORD PTR [rbx+0x668]
   140330e1c:	44 0f b7 c0          	movzx  r8d,ax
   140330e20:	48 8b 83 48 06 00 00 	mov    rax,QWORD PTR [rbx+0x648]
   140330e27:	48 89 44 24 20       	mov    QWORD PTR [rsp+0x20],rax
   140330e2c:	e8 2f e2 fe ff       	call   0x14031f060
   140330e31:	0f b7 83 70 06 00 00 	movzx  eax,WORD PTR [rbx+0x670]
   140330e38:	48 8b cb             	mov    rcx,rbx
   140330e3b:	66 89 83 72 06 00 00 	mov    WORD PTR [rbx+0x672],ax
   140330e42:	48 83 c4 30          	add    rsp,0x30
   140330e46:	5b                   	pop    rbx
   140330e47:	e9 a4 dd ff ff       	jmp    0x14032ebf0
   140330e4c:	cc                   	int3
   140330e4d:	cc                   	int3
   140330e4e:	cc                   	int3
   140330e4f:	cc                   	int3
   140330e50:	cc                   	int3
   140330e51:	cc                   	int3
   140330e52:	cc                   	int3
   140330e53:	cc                   	int3
   140330e54:	cc                   	int3
   140330e55:	cc                   	int3
   140330e56:	cc                   	int3
   140330e57:	cc                   	int3
   140330e58:	cc                   	int3
   140330e59:	cc                   	int3
   140330e5a:	cc                   	int3
   140330e5b:	cc                   	int3
   140330e5c:	cc                   	int3
   140330e5d:	cc                   	int3
   140330e5e:	cc                   	int3
   140330e5f:	cc                   	int3
   140330e60:	48 89 5c 24 10       	mov    QWORD PTR [rsp+0x10],rbx
   140330e65:	48 89 74 24 18       	mov    QWORD PTR [rsp+0x18],rsi
   140330e6a:	48 89 7c 24 20       	mov    QWORD PTR [rsp+0x20],rdi
   140330e6f:	41 56                	push   r14
   140330e71:	4c 8b b1 40 06 00 00 	mov    r14,QWORD PTR [rcx+0x640]
   140330e78:	33 db                	xor    ebx,ebx
   140330e7a:	48 8b b1 48 06 00 00 	mov    rsi,QWORD PTR [rcx+0x648]
   140330e81:	4d 8b d8             	mov    r11,r8
   140330e84:	4c 8b d2             	mov    r10,rdx
   140330e87:	48 89 6c 24 10       	mov    QWORD PTR [rsp+0x10],rbp
   140330e8c:	41 89 1e             	mov    DWORD PTR [r14],ebx
   140330e8f:	44 89 0e             	mov    DWORD PTR [rsi],r9d
   140330e92:	8b 04 9e             	mov    eax,DWORD PTR [rsi+rbx*4]
   140330e95:	4d 63 0c 9e          	movsxd r9,DWORD PTR [r14+rbx*4]
   140330e99:	ff c8                	dec    eax
   140330e9b:	44 3b c8             	cmp    r9d,eax
   140330e9e:	0f 8d e9 00 00 00    	jge    0x140330f8d
   140330ea4:	43 0f b7 2c 4a       	movzx  ebp,WORD PTR [r10+r9*2]
   140330ea9:	49 8b d1             	mov    rdx,r9
   140330eac:	4c 63 c0             	movsxd r8,eax
   140330eaf:	4d 3b c8             	cmp    r9,r8
   140330eb2:	0f 8d b2 00 00 00    	jge    0x140330f6a
   140330eb8:	0f b7 c5             	movzx  eax,bp
   140330ebb:	48 69 f8 3c 01 00 00 	imul   rdi,rax,0x13c
   140330ec2:	43 0f b7 04 42       	movzx  eax,WORD PTR [r10+r8*2]
   140330ec7:	f3 42 0f 10 0c 1f    	movss  xmm1,DWORD PTR [rdi+r11*1]
   140330ecd:	48 69 c8 3c 01 00 00 	imul   rcx,rax,0x13c
   140330ed4:	f3 42 0f 10 04 19    	movss  xmm0,DWORD PTR [rcx+r11*1]
   140330eda:	0f 2f c1             	comiss xmm0,xmm1
   140330edd:	72 21                	jb     0x140330f00
   140330edf:	90                   	nop
   140330ee0:	49 3b d0             	cmp    rdx,r8
   140330ee3:	7d 30                	jge    0x140330f15
   140330ee5:	43 0f b7 44 42 fe    	movzx  eax,WORD PTR [r10+r8*2-0x2]
   140330eeb:	49 ff c8             	dec    r8
   140330eee:	48 69 c8 3c 01 00 00 	imul   rcx,rax,0x13c
   140330ef5:	f3 42 0f 10 04 19    	movss  xmm0,DWORD PTR [rcx+r11*1]
   140330efb:	0f 2f c1             	comiss xmm0,xmm1
   140330efe:	73 e0                	jae    0x140330ee0
   140330f00:	49 3b d0             	cmp    rdx,r8
   140330f03:	7d 10                	jge    0x140330f15
   140330f05:	43 0f b7 04 42       	movzx  eax,WORD PTR [r10+r8*2]
   140330f0a:	41 ff c1             	inc    r9d
   140330f0d:	66 41 89 04 52       	mov    WORD PTR [r10+rdx*2],ax
   140330f12:	48 ff c2             	inc    rdx
   140330f15:	41 0f b7 04 52       	movzx  eax,WORD PTR [r10+rdx*2]
   140330f1a:	f3 42 0f 10 04 1f    	movss  xmm0,DWORD PTR [rdi+r11*1]
   140330f20:	48 69 c8 3c 01 00 00 	imul   rcx,rax,0x13c
   140330f27:	42 0f 2f 04 19       	comiss xmm0,DWORD PTR [rcx+r11*1]
   140330f2c:	72 21                	jb     0x140330f4f
   140330f2e:	66 90                	xchg   ax,ax
   140330f30:	49 3b d0             	cmp    rdx,r8
   140330f33:	7d 35                	jge    0x140330f6a
   140330f35:	41 0f b7 44 52 02    	movzx  eax,WORD PTR [r10+rdx*2+0x2]
   140330f3b:	48 ff c2             	inc    rdx
   140330f3e:	48 69 c8 3c 01 00 00 	imul   rcx,rax,0x13c
   140330f45:	41 ff c1             	inc    r9d
   140330f48:	42 0f 2f 04 19       	comiss xmm0,DWORD PTR [rcx+r11*1]
   140330f4d:	73 e1                	jae    0x140330f30
   140330f4f:	49 3b d0             	cmp    rdx,r8
   140330f52:	7d 16                	jge    0x140330f6a
   140330f54:	41 0f b7 04 52       	movzx  eax,WORD PTR [r10+rdx*2]
   140330f59:	66 43 89 04 42       	mov    WORD PTR [r10+r8*2],ax
   140330f5e:	49 ff c8             	dec    r8
   140330f61:	49 3b d0             	cmp    rdx,r8
   140330f64:	0f 8c 58 ff ff ff    	jl     0x140330ec2
   140330f6a:	49 63 c1             	movsxd rax,r9d
   140330f6d:	66 41 89 2c 42       	mov    WORD PTR [r10+rax*2],bp
   140330f72:	41 8d 41 01          	lea    eax,[r9+0x1]
   140330f76:	41 89 44 9e 04       	mov    DWORD PTR [r14+rbx*4+0x4],eax
   140330f7b:	8b 04 9e             	mov    eax,DWORD PTR [rsi+rbx*4]
   140330f7e:	89 44 9e 04          	mov    DWORD PTR [rsi+rbx*4+0x4],eax
   140330f82:	b8 01 00 00 00       	mov    eax,0x1
   140330f87:	44 89 0c 9e          	mov    DWORD PTR [rsi+rbx*4],r9d
   140330f8b:	eb 07                	jmp    0x140330f94
   140330f8d:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   140330f94:	48 03 d8             	add    rbx,rax
   140330f97:	0f 89 f5 fe ff ff    	jns    0x140330e92
   140330f9d:	48 8b 6c 24 10       	mov    rbp,QWORD PTR [rsp+0x10]
   140330fa2:	b0 01                	mov    al,0x1
   140330fa4:	48 8b 5c 24 18       	mov    rbx,QWORD PTR [rsp+0x18]
   140330fa9:	48 8b 74 24 20       	mov    rsi,QWORD PTR [rsp+0x20]
   140330fae:	48 8b 7c 24 28       	mov    rdi,QWORD PTR [rsp+0x28]
   140330fb3:	41 5e                	pop    r14
   140330fb5:	c3                   	ret
   140330fb6:	cc                   	int3
   140330fb7:	cc                   	int3
   140330fb8:	cc                   	int3
   140330fb9:	cc                   	int3
   140330fba:	cc                   	int3
   140330fbb:	cc                   	int3
   140330fbc:	cc                   	int3
   140330fbd:	cc                   	int3
   140330fbe:	cc                   	int3
   140330fbf:	cc                   	int3
