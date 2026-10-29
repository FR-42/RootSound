
D:\#Software\ripx\RipX.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140318820 <.text+0x317820>:
   140318820:	80 fa 01             	cmp    dl,0x1
   140318823:	0f 85 f3 00 00 00    	jne    0x14031891c
   140318829:	44 8b 41 28          	mov    r8d,DWORD PTR [rcx+0x28]
   14031882d:	44 03 41 24          	add    r8d,DWORD PTR [rcx+0x24]
   140318831:	80 b9 91 00 00 00 00 	cmp    BYTE PTR [rcx+0x91],0x0
   140318838:	74 47                	je     0x140318881
   14031883a:	f3 0f 10 05 76 e9 37 	movss  xmm0,DWORD PTR [rip+0x37e976]        # 0x1406971b8
   140318841:	00 
   140318842:	0f 2f c2             	comiss xmm0,xmm2
   140318845:	76 0a                	jbe    0x140318851
   140318847:	f3 0f 10 05 5d 77 53 	movss  xmm0,DWORD PTR [rip+0x53775d]        # 0x14084ffac
   14031884e:	00 
   14031884f:	eb 08                	jmp    0x140318859
   140318851:	f3 0f 10 05 db 02 38 	movss  xmm0,DWORD PTR [rip+0x3802db]        # 0x140698b34
   140318858:	00 
   140318859:	f3 0f 59 05 4b 19 67 	mulss  xmm0,DWORD PTR [rip+0x67194b]        # 0x14098a1ac
   140318860:	00 
   140318861:	f3 0f 58 05 73 77 53 	addss  xmm0,DWORD PTR [rip+0x537773]        # 0x14084ffdc
   140318868:	00 
   140318869:	ba 01 00 00 00       	mov    edx,0x1
   14031886e:	f3 0f 2c c0          	cvttss2si eax,xmm0
   140318872:	3b c2                	cmp    eax,edx
   140318874:	0f 4f d0             	cmovg  edx,eax
   140318877:	41 3b d0             	cmp    edx,r8d
   14031887a:	41 0f 4d d0          	cmovge edx,r8d
   14031887e:	8b c2                	mov    eax,edx
   140318880:	c3                   	ret
   140318881:	80 b9 92 00 00 00 00 	cmp    BYTE PTR [rcx+0x92],0x0
   140318888:	75 7d                	jne    0x140318907
   14031888a:	66 83 79 14 01       	cmp    WORD PTR [rcx+0x14],0x1
   14031888f:	74 76                	je     0x140318907
   140318891:	0f 2f 15 30 7a 53 00 	comiss xmm2,DWORD PTR [rip+0x537a30]        # 0x1408502c8
   140318898:	76 0a                	jbe    0x1403188a4
   14031889a:	f3 0f 10 0d 06 77 53 	movss  xmm1,DWORD PTR [rip+0x537706]        # 0x14084ffa8
   1403188a1:	00 
   1403188a2:	eb 36                	jmp    0x1403188da
   1403188a4:	f3 0f 10 05 84 77 53 	movss  xmm0,DWORD PTR [rip+0x537784]        # 0x140850030
   1403188ab:	00 
   1403188ac:	f3 0f 10 0d f8 76 53 	movss  xmm1,DWORD PTR [rip+0x5376f8]        # 0x14084ffac
   1403188b3:	00 
   1403188b4:	f3 0f 5e c2          	divss  xmm0,xmm2
   1403188b8:	f3 0f 59 05 e8 e8 37 	mulss  xmm0,DWORD PTR [rip+0x37e8e8]        # 0x1406971a8
   1403188bf:	00 
   1403188c0:	0f 2f c8             	comiss xmm1,xmm0
   1403188c3:	76 0f                	jbe    0x1403188d4
   1403188c5:	f3 0f 10 0d 33 e8 37 	movss  xmm1,DWORD PTR [rip+0x37e833]        # 0x140697100
   1403188cc:	00 
   1403188cd:	0f 2f c1             	comiss xmm0,xmm1
   1403188d0:	77 05                	ja     0x1403188d7
   1403188d2:	eb 06                	jmp    0x1403188da
   1403188d4:	0f 28 c1             	movaps xmm0,xmm1
   1403188d7:	0f 28 c8             	movaps xmm1,xmm0
   1403188da:	f3 0f 10 05 ca 18 67 	movss  xmm0,DWORD PTR [rip+0x6718ca]        # 0x14098a1ac
   1403188e1:	00 
   1403188e2:	ba 01 00 00 00       	mov    edx,0x1
   1403188e7:	f3 0f 59 c1          	mulss  xmm0,xmm1
   1403188eb:	f3 0f 58 05 e9 76 53 	addss  xmm0,DWORD PTR [rip+0x5376e9]        # 0x14084ffdc
   1403188f2:	00 
   1403188f3:	f3 0f 2c c8          	cvttss2si ecx,xmm0
   1403188f7:	3b ca                	cmp    ecx,edx
   1403188f9:	0f 4f d1             	cmovg  edx,ecx
   1403188fc:	41 3b d0             	cmp    edx,r8d
   1403188ff:	44 0f 4c c2          	cmovl  r8d,edx
   140318903:	41 8b c0             	mov    eax,r8d
   140318906:	c3                   	ret
   140318907:	f3 0f 10 05 9d 18 67 	movss  xmm0,DWORD PTR [rip+0x67189d]        # 0x14098a1ac
   14031890e:	00 
   14031890f:	f3 0f 59 05 95 76 53 	mulss  xmm0,DWORD PTR [rip+0x537695]        # 0x14084ffac
   140318916:	00 
   140318917:	e9 45 ff ff ff       	jmp    0x140318861
   14031891c:	b8 01 00 00 00       	mov    eax,0x1
   140318921:	c3                   	ret
