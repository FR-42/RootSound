
D:/#Software/ripx/RipX.exe:     file format pei-x86-64


Disassembly of section .text:

00000001405333d0 <.text+0x5323d0>:
   1405333d0:	40 56                	rex push rsi
   1405333d2:	41 54                	push   r12
   1405333d4:	41 56                	push   r14
   1405333d6:	41 57                	push   r15
   1405333d8:	48 83 ec 28          	sub    rsp,0x28
   1405333dc:	45 33 e4             	xor    r12d,r12d
   1405333df:	45 8b f0             	mov    r14d,r8d
   1405333e2:	4c 8b fa             	mov    r15,rdx
   1405333e5:	66 44 89 22          	mov    WORD PTR [rdx],r12w
   1405333e9:	48 8b f1             	mov    rsi,rcx
   1405333ec:	45 8d 4c 24 0d       	lea    r9d,[r12+0xd]
   1405333f1:	e8 ba 2d 00 00       	call   0x1405361b0
   1405333f6:	48 85 c0             	test   rax,rax
   1405333f9:	0f 84 c7 00 00 00    	je     0x1405334c6
   1405333ff:	48 89 5c 24 50       	mov    QWORD PTR [rsp+0x50],rbx
   140533404:	48 8b ce             	mov    rcx,rsi
   140533407:	48 89 6c 24 58       	mov    QWORD PTR [rsp+0x58],rbp
   14053340c:	41 8b ec             	mov    ebp,r12d
   14053340f:	48 89 7c 24 60       	mov    QWORD PTR [rsp+0x60],rdi
   140533414:	41 8b fc             	mov    edi,r12d
   140533417:	ff 15 93 68 15 00    	call   QWORD PTR [rip+0x156893]        # 0x140689cb0
   14053341d:	48 8b ce             	mov    rcx,rsi
   140533420:	8b d8                	mov    ebx,eax
   140533422:	ff 15 88 68 15 00    	call   QWORD PTR [rip+0x156888]        # 0x140689cb0
   140533428:	41 8b cc             	mov    ecx,r12d
   14053342b:	83 fb ff             	cmp    ebx,0xffffffff
   14053342e:	74 79                	je     0x1405334a9
   140533430:	4c 89 6c 24 20       	mov    QWORD PTR [rsp+0x20],r13
   140533435:	41 bd ff 00 00 00    	mov    r13d,0xff
   14053343b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]
   140533440:	83 f8 ff             	cmp    eax,0xffffffff
   140533443:	74 5d                	je     0x1405334a2
   140533445:	66 41 23 dd          	and    bx,r13w
   140533449:	66 c1 e0 08          	shl    ax,0x8
   14053344d:	66 33 d8             	xor    bx,ax
   140533450:	66 83 fb 0d          	cmp    bx,0xd
   140533454:	75 16                	jne    0x14053346c
   140533456:	48 8b ce             	mov    rcx,rsi
   140533459:	ff 15 51 68 15 00    	call   QWORD PTR [rip+0x156851]        # 0x140689cb0
   14053345f:	48 8b ce             	mov    rcx,rsi
   140533462:	ff 15 48 68 15 00    	call   QWORD PTR [rip+0x156848]        # 0x140689cb0
   140533468:	41 0f b7 dc          	movzx  ebx,r12w
   14053346c:	8b c7                	mov    eax,edi
   14053346e:	ff c7                	inc    edi
   140533470:	8b ef                	mov    ebp,edi
   140533472:	66 41 89 1c 47       	mov    WORD PTR [r15+rax*2],bx
   140533477:	66 85 db             	test   bx,bx
   14053347a:	74 22                	je     0x14053349e
   14053347c:	41 3b fe             	cmp    edi,r14d
   14053347f:	73 1d                	jae    0x14053349e
   140533481:	48 8b ce             	mov    rcx,rsi
   140533484:	ff 15 26 68 15 00    	call   QWORD PTR [rip+0x156826]        # 0x140689cb0
   14053348a:	48 8b ce             	mov    rcx,rsi
   14053348d:	8b d8                	mov    ebx,eax
   14053348f:	ff 15 1b 68 15 00    	call   QWORD PTR [rip+0x15681b]        # 0x140689cb0
   140533495:	8b cf                	mov    ecx,edi
   140533497:	83 fb ff             	cmp    ebx,0xffffffff
   14053349a:	75 a4                	jne    0x140533440
   14053349c:	eb 06                	jmp    0x1405334a4
   14053349e:	8b cf                	mov    ecx,edi
   1405334a0:	eb 02                	jmp    0x1405334a4
   1405334a2:	8b cd                	mov    ecx,ebp
   1405334a4:	4c 8b 6c 24 20       	mov    r13,QWORD PTR [rsp+0x20]
   1405334a9:	48 8b 7c 24 60       	mov    rdi,QWORD PTR [rsp+0x60]
   1405334ae:	41 8d 46 ff          	lea    eax,[r14-0x1]
   1405334b2:	48 8b 6c 24 58       	mov    rbp,QWORD PTR [rsp+0x58]
   1405334b7:	3b c1                	cmp    eax,ecx
   1405334b9:	48 8b 5c 24 50       	mov    rbx,QWORD PTR [rsp+0x50]
   1405334be:	0f 43 c1             	cmovae eax,ecx
   1405334c1:	66 45 89 24 47       	mov    WORD PTR [r15+rax*2],r12w
   1405334c6:	48 83 c4 28          	add    rsp,0x28
   1405334ca:	41 5f                	pop    r15
   1405334cc:	41 5e                	pop    r14
   1405334ce:	41 5c                	pop    r12
   1405334d0:	5e                   	pop    rsi
   1405334d1:	c3                   	ret
   1405334d2:	cc                   	int3
   1405334d3:	cc                   	int3
   1405334d4:	cc                   	int3
   1405334d5:	cc                   	int3
   1405334d6:	cc                   	int3
   1405334d7:	cc                   	int3
   1405334d8:	cc                   	int3
   1405334d9:	cc                   	int3
   1405334da:	cc                   	int3
   1405334db:	cc                   	int3
   1405334dc:	cc                   	int3
   1405334dd:	cc                   	int3
   1405334de:	cc                   	int3
   1405334df:	cc                   	int3
   1405334e0:	48 89 5c 24 18       	mov    QWORD PTR [rsp+0x18],rbx
   1405334e5:	55                   	push   rbp
   1405334e6:	48 83 ec 20          	sub    rsp,0x20
   1405334ea:	48 8b da             	mov    rbx,rdx
   1405334ed:	48 8b e9             	mov    rbp,rcx
   1405334f0:	49 c7 c0 ff ff ff ff 	mov    r8,0xffffffffffffffff
   1405334f7:	66 0f 1f 84 00 00 00 	nop    WORD PTR [rax+rax*1+0x0]
   1405334fe:	00 00 
   140533500:	49 ff c0             	inc    r8
   140533503:	66 42 83 3c 42 00    	cmp    WORD PTR [rdx+r8*2],0x0
   140533509:	75 f5                	jne    0x140533500
   14053350b:	4d 03 c0             	add    r8,r8
   14053350e:	45 33 c9             	xor    r9d,r9d
   140533511:	e8 3a 31 00 00       	call   0x140536650
   140533516:	48 85 c0             	test   rax,rax
   140533519:	74 73                	je     0x14053358e
   14053351b:	48 89 74 24 30       	mov    QWORD PTR [rsp+0x30],rsi
   140533520:	48 c7 c0 ff ff ff ff 	mov    rax,0xffffffffffffffff
   140533527:	33 f6                	xor    esi,esi
   140533529:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
   140533530:	48 ff c0             	inc    rax
   140533533:	66 39 34 43          	cmp    WORD PTR [rbx+rax*2],si
   140533537:	75 f7                	jne    0x140533530
   140533539:	48 85 c0             	test   rax,rax
   14053353c:	74 4b                	je     0x140533589
   14053353e:	48                   	rex.W
   14053353f:	89                   	.byte 0x89
