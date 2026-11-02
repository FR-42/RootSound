
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140373670 <.text+0x372670>:
   140373670:	40 53                	rex push rbx
   140373672:	48 83 ec 20          	sub    rsp,0x20
   140373676:	48 8b d9             	mov    rbx,rcx
   140373679:	48 8b 49 38          	mov    rcx,QWORD PTR [rcx+0x38]
   14037367d:	48 85 c9             	test   rcx,rcx
   140373680:	74 05                	je     0x140373687
   140373682:	e8 d1 7e 2a 00       	call   0x14061b558
   140373687:	33 c0                	xor    eax,eax
   140373689:	48 89 43 38          	mov    QWORD PTR [rbx+0x38],rax
   14037368d:	48 89 43 04          	mov    QWORD PTR [rbx+0x4],rax
   140373691:	48 83 c4 20          	add    rsp,0x20
   140373695:	5b                   	pop    rbx
   140373696:	c3                   	ret
   140373697:	cc                   	int3
   140373698:	cc                   	int3
   140373699:	cc                   	int3
   14037369a:	cc                   	int3
   14037369b:	cc                   	int3
   14037369c:	cc                   	int3
   14037369d:	cc                   	int3
   14037369e:	cc                   	int3
   14037369f:	cc                   	int3
   1403736a0:	48 89 5c 24 08       	mov    QWORD PTR [rsp+0x8],rbx
   1403736a5:	57                   	push   rdi
   1403736a6:	48 83 ec 20          	sub    rsp,0x20
   1403736aa:	48 8b d9             	mov    rbx,rcx
   1403736ad:	48 8b 49 38          	mov    rcx,QWORD PTR [rcx+0x38]
   1403736b1:	48 85 c9             	test   rcx,rcx
   1403736b4:	74 05                	je     0x1403736bb
   1403736b6:	e8 9d 7e 2a 00       	call   0x14061b558
   1403736bb:	8b 53 28             	mov    edx,DWORD PTR [rbx+0x28]
   1403736be:	33 ff                	xor    edi,edi
   1403736c0:	03 53 24             	add    edx,DWORD PTR [rbx+0x24]
   1403736c3:	b8 08 52 04 00       	mov    eax,0x45208
   1403736c8:	8b ca                	mov    ecx,edx
   1403736ca:	89 53 40             	mov    DWORD PTR [rbx+0x40],edx
   1403736cd:	48 f7 e1             	mul    rcx
   1403736d0:	48 c7 c1 ff ff ff ff 	mov    rcx,0xffffffffffffffff
   1403736d7:	48 89 7b 38          	mov    QWORD PTR [rbx+0x38],rdi
   1403736db:	48 89 7b 04          	mov    QWORD PTR [rbx+0x4],rdi
   1403736df:	48 0f 40 c1          	cmovo  rax,rcx
   1403736e3:	48 8b c8             	mov    rcx,rax
   1403736e6:	e8 75 7e 2a 00       	call   0x14061b560
   1403736eb:	8b 4b 40             	mov    ecx,DWORD PTR [rbx+0x40]
   1403736ee:	33 d2                	xor    edx,edx
   1403736f0:	4c 69 c1 08 52 04 00 	imul   r8,rcx,0x45208
   1403736f7:	48 8b c8             	mov    rcx,rax
   1403736fa:	48 89 43 38          	mov    QWORD PTR [rbx+0x38],rax
   1403736fe:	e8 e7 d5 2a 00       	call   0x140620cea
   140373703:	48 39 7b 38          	cmp    QWORD PTR [rbx+0x38],rdi
   140373707:	48 89 7b 04          	mov    QWORD PTR [rbx+0x4],rdi
   14037370b:	c6 43 44 01          	mov    BYTE PTR [rbx+0x44],0x1
   14037370f:	0f 95 c0             	setne  al
   140373712:	48 8b 5c 24 30       	mov    rbx,QWORD PTR [rsp+0x30]
   140373717:	48 83 c4 20          	add    rsp,0x20
   14037371b:	5f                   	pop    rdi
   14037371c:	c3                   	ret
   14037371d:	cc                   	int3
   14037371e:	cc                   	int3
   14037371f:	cc                   	int3
   140373720:	cc                   	int3
   140373721:	cc                   	int3
   140373722:	cc                   	int3
   140373723:	cc                   	int3
   140373724:	cc                   	int3
   140373725:	cc                   	int3
   140373726:	cc                   	int3
   140373727:	cc                   	int3
   140373728:	cc                   	int3
   140373729:	cc                   	int3
   14037372a:	cc                   	int3
   14037372b:	cc                   	int3
   14037372c:	cc                   	int3
   14037372d:	cc                   	int3
   14037372e:	cc                   	int3
   14037372f:	cc                   	int3
   140373730:	48 83 ec 38          	sub    rsp,0x38
   140373734:	80 b9 fc 02 00 00 00 	cmp    BYTE PTR [rcx+0x2fc],0x0
   14037373b:	41 8b c0             	mov    eax,r8d
   14037373e:	74 13                	je     0x140373753
   140373740:	45 33 c9             	xor    r9d,r9d
   140373743:	44 89 89 00 03 00 00 	mov    DWORD PTR [rcx+0x300],r9d
   14037374a:	44 88 89 fc 02 00 00 	mov    BYTE PTR [rcx+0x2fc],r9b
   140373751:	eb 0d                	jmp    0x140373760
   140373753:	ff 81 00 03 00 00    	inc    DWORD PTR [rcx+0x300]
   140373759:	44 8b 89 00 03 00 00 	mov    r9d,DWORD PTR [rcx+0x300]
   140373760:	c7 44 24 28 ff ff ff 	mov    DWORD PTR [rsp+0x28],0xffffffff
   140373767:	ff 
   140373768:	45 33 c0             	xor    r8d,r8d
   14037376b:	88 54 24 20          	mov    BYTE PTR [rsp+0x20],dl
   14037376f:	8b d0                	mov    edx,eax
   140373771:	e8 6a 47 fa ff       	call   0x140317ee0
   140373776:	48 83 c4 38          	add    rsp,0x38
   14037377a:	c3                   	ret
   14037377b:	cc                   	int3
   14037377c:	cc                   	int3
   14037377d:	cc                   	int3
   14037377e:	cc                   	int3
   14037377f:	cc                   	int3
   140373780:	cc                   	int3
   140373781:	cc                   	int3
   140373782:	cc                   	int3
   140373783:	cc                   	int3
   140373784:	cc                   	int3
   140373785:	cc                   	int3
   140373786:	cc                   	int3
   140373787:	cc                   	int3
   140373788:	cc                   	int3
   140373789:	cc                   	int3
   14037378a:	cc                   	int3
   14037378b:	cc                   	int3
   14037378c:	cc                   	int3
   14037378d:	cc                   	int3
   14037378e:	cc                   	int3
   14037378f:	cc                   	int3
