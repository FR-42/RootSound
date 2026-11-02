
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

void FUN_140378220(longlong param_1)

{
  longlong *plVar1;
  undefined1 uVar2;
  char cVar3;
  uint uVar4;
  int iVar5;
  undefined4 uVar6;
  undefined4 uVar7;
  undefined4 uVar8;
  undefined8 *puVar9;
  undefined8 uVar10;
  void *_Dst;
  byte *pbVar11;
  longlong lVar12;
  uint uVar13;
  void *pvVar14;
  ulonglong uVar15;
  byte bVar16;
  void *pvVar17;
  longlong lVar18;
  void *pvVar19;
  undefined1 auStack_738 [32];
  undefined1 local_718;
  undefined4 local_710;
  undefined4 local_708;
  undefined4 local_700;
  undefined4 local_6f8;
  undefined4 local_6f0;
  undefined4 local_6e8;
  undefined4 local_6e0;
  undefined1 local_6d8 [528];
  undefined1 local_4c8 [1024];
  ulonglong local_c8;
  
  local_c8 = DAT_140972168 ^ (ulonglong)auStack_738;
  pvVar19 = (void *)0x0;
  lVar12 = 0x10;
  puVar9 = &DAT_154f06370;
  do {
    *puVar9 = 0;
    puVar9[1] = 0;
    puVar9[2] = 0;
    puVar9[3] = 0;
    puVar9[4] = 0;
    puVar9[5] = 0;
    puVar9[6] = 0;
    puVar9[7] = 0;
    lVar12 = lVar12 + -1;
    puVar9 = puVar9 + 8;
  } while (lVar12 != 0);
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06370 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xc);
  *DAT_154f06370 = uVar10;
  FUN_140538050(uVar10,6,L"Other");
  *(undefined1 *)(DAT_154f06370 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06370 + 9) = 0x7f;
  *(undefined1 *)((longlong)DAT_154f06370 + 10) = 0x7f;
  *(undefined4 *)((longlong)DAT_154f06370 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06370 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f06370 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06370 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06370 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06370 + 0x1c) = 0x40400000;
  *(undefined4 *)(DAT_154f06370 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f06370 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f06370 + 0x24) = 0x3f800000;
  *(undefined4 *)(DAT_154f06370 + 5) = 0;
  if (DAT_154f06380 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06380 != (void *)0x0) {
      free((void *)*DAT_154f06380);
    }
    free(DAT_154f06380);
    DAT_154f06380 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06380 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x12);
  *DAT_154f06380 = uVar10;
  FUN_140538050(uVar10,9,L"F. Voice");
  *(undefined1 *)(DAT_154f06380 + 1) = 0x35;
  *(undefined1 *)((longlong)DAT_154f06380 + 9) = 0x5b;
  *(undefined1 *)((longlong)DAT_154f06380 + 10) = 0x5b;
  *(undefined4 *)((longlong)DAT_154f06380 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06380 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f06380 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06380 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06380 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06380 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f06380 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f06380 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f06380 + 0x24) = 0x3f800000;
  *(undefined4 *)(DAT_154f06380 + 5) = 0xa3;
  if (DAT_154f06378 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06378 != (void *)0x0) {
      free((void *)*DAT_154f06378);
    }
    free(DAT_154f06378);
    DAT_154f06378 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06378 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xc);
  *DAT_154f06378 = uVar10;
  FUN_140538050(uVar10,6,L"Voice");
  *(undefined1 *)(DAT_154f06378 + 1) = 0x29;
  *(undefined1 *)((longlong)DAT_154f06378 + 9) = 0x5b;
  *(undefined1 *)((longlong)DAT_154f06378 + 10) = 0x5b;
  *(undefined4 *)((longlong)DAT_154f06378 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06378 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f06378 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06378 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06378 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06378 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f06378 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f06378 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f06378 + 0x24) = 0x3f800000;
  *(undefined4 *)(DAT_154f06378 + 5) = 0xa3;
  if (DAT_154f064a8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f064a8 != (void *)0x0) {
      free((void *)*DAT_154f064a8);
    }
    free(DAT_154f064a8);
    DAT_154f064a8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f064a8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x1c);
  *DAT_154f064a8 = uVar10;
  FUN_140538050(uVar10,0xe,L"Backing Vocal");
  *(undefined1 *)(DAT_154f064a8 + 1) = 0x29;
  *(undefined1 *)((longlong)DAT_154f064a8 + 9) = 0x5b;
  *(undefined1 *)((longlong)DAT_154f064a8 + 10) = 0x5b;
  *(undefined4 *)((longlong)DAT_154f064a8 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f064a8 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f064a8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f064a8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f064a8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f064a8 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f064a8 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f064a8 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f064a8 + 0x24) = 0x3f800000;
  *(undefined4 *)(DAT_154f064a8 + 5) = 0xa3;
  if (DAT_154f06388 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06388 != (void *)0x0) {
      free((void *)*DAT_154f06388);
    }
    free(DAT_154f06388);
    DAT_154f06388 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06388 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xc);
  *DAT_154f06388 = uVar10;
  FUN_140538050(uVar10,6,L"Piano");
  *(undefined1 *)(DAT_154f06388 + 1) = 0x15;
  *(undefined1 *)((longlong)DAT_154f06388 + 9) = 0x6c;
  *(undefined1 *)((longlong)DAT_154f06388 + 10) = 0x6c;
  *(undefined4 *)((longlong)DAT_154f06388 + 0x2c) = 0x3e19999a;
  *(undefined4 *)((longlong)DAT_154f06388 + 0xc) = 0x41000000;
  *(undefined4 *)(DAT_154f06388 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06388 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06388 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06388 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06388 + 4) = 0x3dcccccd;
  *(undefined4 *)(DAT_154f06388 + 6) = 0x3f800000;
  *(undefined4 *)((longlong)DAT_154f06388 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f06388 + 5) = 0x80;
  if (DAT_154f064b0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f064b0 != (void *)0x0) {
      free((void *)*DAT_154f064b0);
    }
    free(DAT_154f064b0);
    DAT_154f064b0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f064b0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x16);
  *DAT_154f064b0 = uVar10;
  FUN_140538050(uVar10,0xb,L"Synth Lead");
  *(undefined1 *)(DAT_154f064b0 + 1) = 0x15;
  *(undefined1 *)((longlong)DAT_154f064b0 + 9) = 0x6c;
  *(undefined1 *)((longlong)DAT_154f064b0 + 10) = 0x6c;
  *(undefined4 *)((longlong)DAT_154f064b0 + 0x2c) = 0x3e19999a;
  *(undefined4 *)((longlong)DAT_154f064b0 + 0xc) = 0x41000000;
  *(undefined4 *)(DAT_154f064b0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f064b0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f064b0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f064b0 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f064b0 + 4) = 0x3dcccccd;
  *(undefined4 *)(DAT_154f064b0 + 6) = 0x3f800000;
  *(undefined4 *)((longlong)DAT_154f064b0 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f064b0 + 5) = 0x80;
  if (DAT_154f06500 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06500 != (void *)0x0) {
      free((void *)*DAT_154f06500);
    }
    free(DAT_154f06500);
    DAT_154f06500 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06500 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x14);
  *DAT_154f06500 = uVar10;
  FUN_140538050(uVar10,10,L"Synth Pad");
  *(undefined1 *)(DAT_154f06500 + 1) = 0x15;
  *(undefined1 *)((longlong)DAT_154f06500 + 9) = 0x6c;
  *(undefined1 *)((longlong)DAT_154f06500 + 10) = 0x6c;
  *(undefined4 *)((longlong)DAT_154f06500 + 0x2c) = 0x3e19999a;
  *(undefined4 *)((longlong)DAT_154f06500 + 0xc) = 0x41000000;
  *(undefined4 *)(DAT_154f06500 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06500 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06500 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06500 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06500 + 4) = 0x3dcccccd;
  *(undefined4 *)(DAT_154f06500 + 6) = 0x3f800000;
  *(undefined4 *)((longlong)DAT_154f06500 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f06500 + 5) = 0x80;
  if (DAT_154f064b8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f064b8 != (void *)0x0) {
      free((void *)*DAT_154f064b8);
    }
    free(DAT_154f064b8);
    DAT_154f064b8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f064b8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x12);
  *DAT_154f064b8 = uVar10;
  FUN_140538050(uVar10,9,L"Keyboard");
  *(undefined1 *)(DAT_154f064b8 + 1) = 0x15;
  *(undefined1 *)((longlong)DAT_154f064b8 + 9) = 0x6c;
  *(undefined1 *)((longlong)DAT_154f064b8 + 10) = 0x6c;
  *(undefined4 *)((longlong)DAT_154f064b8 + 0x2c) = 0x3e19999a;
  *(undefined4 *)((longlong)DAT_154f064b8 + 0xc) = 0x41000000;
  *(undefined4 *)(DAT_154f064b8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f064b8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f064b8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f064b8 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f064b8 + 4) = 0x3dcccccd;
  *(undefined4 *)(DAT_154f064b8 + 6) = 0x3f800000;
  *(undefined4 *)((longlong)DAT_154f064b8 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f064b8 + 5) = 0x80;
  if (DAT_154f06390 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06390 != (void *)0x0) {
      free((void *)*DAT_154f06390);
    }
    free(DAT_154f06390);
    DAT_154f06390 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06390 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x14);
  *DAT_154f06390 = uVar10;
  FUN_140538050(uVar10,10,L"A. Guitar");
  *(undefined1 *)(DAT_154f06390 + 1) = 0x28;
  *(undefined1 *)((longlong)DAT_154f06390 + 9) = 0x58;
  *(undefined1 *)((longlong)DAT_154f06390 + 10) = 0x5a;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x2c) = 0x3dcccccd;
  *(undefined4 *)((longlong)DAT_154f06390 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f06390 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06390 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x1c) = 0x3ecccccd;
  *(undefined4 *)(DAT_154f06390 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f06390 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06390 + 5) = 0x28;
  if (DAT_154f06398 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06398 != (void *)0x0) {
      free((void *)*DAT_154f06398);
    }
    free(DAT_154f06398);
    DAT_154f06398 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06398 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x14);
  *DAT_154f06398 = uVar10;
  FUN_140538050(uVar10,10,L"E. Guitar");
  *(undefined1 *)(DAT_154f06398 + 1) = 0x28;
  *(undefined1 *)((longlong)DAT_154f06398 + 9) = 0x58;
  *(undefined1 *)((longlong)DAT_154f06398 + 10) = 0x5a;
  *(undefined4 *)((longlong)DAT_154f06398 + 0x2c) = 0x3dcccccd;
  *(undefined4 *)((longlong)DAT_154f06398 + 0xc) = 0x40000000;
  *(undefined4 *)(DAT_154f06398 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06398 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06398 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06398 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06398 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f06398 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f06398 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06398 + 5) = 0x28;
  if (DAT_154f06390 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06390 != (void *)0x0) {
      free((void *)*DAT_154f06390);
    }
    free(DAT_154f06390);
    DAT_154f06390 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06390 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xe);
  *DAT_154f06390 = uVar10;
  FUN_140538050(uVar10,7,L"Guitar");
  *(undefined1 *)(DAT_154f06390 + 1) = 0x28;
  *(undefined1 *)((longlong)DAT_154f06390 + 9) = 0x58;
  *(undefined1 *)((longlong)DAT_154f06390 + 10) = 0x5a;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x2c) = 0x3dcccccd;
  *(undefined4 *)((longlong)DAT_154f06390 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f06390 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06390 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x1c) = 0x3ecccccd;
  *(undefined4 *)(DAT_154f06390 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f06390 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f06390 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06390 + 5) = 0x28;
  if (DAT_154f063a0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063a0 != (void *)0x0) {
      free((void *)*DAT_154f063a0);
    }
    free(DAT_154f063a0);
    DAT_154f063a0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063a0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x1a);
  *DAT_154f063a0 = uVar10;
  FUN_140538050(uVar10,0xd,L"Dist. Guitar");
  *(undefined1 *)(DAT_154f063a0 + 1) = 0x28;
  *(undefined1 *)((longlong)DAT_154f063a0 + 9) = 0x58;
  *(undefined1 *)((longlong)DAT_154f063a0 + 10) = 0x5a;
  *(undefined4 *)((longlong)DAT_154f063a0 + 0x2c) = 0x3dcccccd;
  *(undefined4 *)((longlong)DAT_154f063a0 + 0xc) = 0x40000000;
  *(undefined4 *)(DAT_154f063a0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063a0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063a0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063a0 + 0x1c) = 0x3ecccccd;
  *(undefined4 *)(DAT_154f063a0 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063a0 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f063a0 + 0x24) = 0;
  *(undefined4 *)(DAT_154f063a0 + 5) = 0x20;
  if (DAT_154f063a8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063a8 != (void *)0x0) {
      free((void *)*DAT_154f063a8);
    }
    free(DAT_154f063a8);
    DAT_154f063a8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063a8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(10);
  *DAT_154f063a8 = uVar10;
  FUN_140538050(uVar10,5,L"Bass");
  *(undefined1 *)(DAT_154f063a8 + 1) = 0x1c;
  *(undefined1 *)((longlong)DAT_154f063a8 + 9) = 0x43;
  *(undefined1 *)((longlong)DAT_154f063a8 + 10) = 0x43;
  *(undefined4 *)((longlong)DAT_154f063a8 + 0x2c) = 0x3e800000;
  *(undefined4 *)((longlong)DAT_154f063a8 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f063a8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063a8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063a8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063a8 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f063a8 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063a8 + 6) = 0x40800000;
  *(undefined4 *)((longlong)DAT_154f063a8 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f063a8 + 5) = 0;
  if (DAT_154f063b0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063b0 != (void *)0x0) {
      free((void *)*DAT_154f063b0);
    }
    free(DAT_154f063b0);
    DAT_154f063b0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063b0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x12);
  *DAT_154f063b0 = uVar10;
  FUN_140538050(uVar10,9,L"Dbl Bass");
  *(undefined1 *)(DAT_154f063b0 + 1) = 0x1c;
  *(undefined1 *)((longlong)DAT_154f063b0 + 9) = 0x43;
  *(undefined1 *)((longlong)DAT_154f063b0 + 10) = 0x43;
  *(undefined4 *)((longlong)DAT_154f063b0 + 0x2c) = 0x3e800000;
  *(undefined4 *)((longlong)DAT_154f063b0 + 0xc) = 0x40000000;
  *(undefined4 *)(DAT_154f063b0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063b0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063b0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063b0 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f063b0 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063b0 + 6) = 0x40800000;
  *(undefined4 *)((longlong)DAT_154f063b0 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f063b0 + 5) = 0;
  if (DAT_154f063b8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063b8 != (void *)0x0) {
      free((void *)*DAT_154f063b8);
    }
    free(DAT_154f063b8);
    DAT_154f063b8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063b8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xc);
  *DAT_154f063b8 = uVar10;
  FUN_140538050(uVar10,6,L"Flute");
  *(undefined1 *)(DAT_154f063b8 + 1) = 0x3c;
  *(undefined1 *)((longlong)DAT_154f063b8 + 9) = 0x67;
  *(undefined1 *)((longlong)DAT_154f063b8 + 10) = 0x67;
  *(undefined4 *)((longlong)DAT_154f063b8 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063b8 + 0xc) = 0x3f800000;
  *(undefined4 *)(DAT_154f063b8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063b8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063b8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063b8 + 0x1c) = 0x3e19999a;
  *(undefined4 *)(DAT_154f063b8 + 4) = 0x3f4ccccd;
  *(undefined4 *)(DAT_154f063b8 + 6) = 0x40000000;
  *(undefined4 *)((longlong)DAT_154f063b8 + 0x24) = 0x3e6b851f;
  *(undefined4 *)(DAT_154f063b8 + 5) = 1;
  if (DAT_154f063c0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063c0 != (void *)0x0) {
      free((void *)*DAT_154f063c0);
    }
    free(DAT_154f063c0);
    DAT_154f063c0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063c0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x10);
  *DAT_154f063c0 = uVar10;
  FUN_140538050(uVar10,8,L"Trumpet");
  *(undefined1 *)(DAT_154f063c0 + 1) = 0x36;
  *(undefined1 *)((longlong)DAT_154f063c0 + 9) = 0x54;
  *(undefined1 *)((longlong)DAT_154f063c0 + 10) = 0x54;
  *(undefined4 *)((longlong)DAT_154f063c0 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063c0 + 0xc) = 0x40000000;
  *(undefined4 *)(DAT_154f063c0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063c0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063c0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063c0 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f063c0 + 4) = 0x3f4ccccd;
  *(undefined4 *)(DAT_154f063c0 + 6) = 0x3f800000;
  *(undefined4 *)((longlong)DAT_154f063c0 + 0x24) = 0x3e800000;
  *(undefined4 *)(DAT_154f063c0 + 5) = 1;
  if (DAT_154f063c8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063c8 != (void *)0x0) {
      free((void *)*DAT_154f063c8);
    }
    free(DAT_154f063c8);
    DAT_154f063c8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063c8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x12);
  *DAT_154f063c8 = uVar10;
  FUN_140538050(uVar10,9,L"Clarinet");
  *(undefined1 *)(DAT_154f063c8 + 1) = 0x32;
  *(undefined1 *)((longlong)DAT_154f063c8 + 9) = 0x60;
  *(undefined1 *)((longlong)DAT_154f063c8 + 10) = 0x60;
  *(undefined4 *)((longlong)DAT_154f063c8 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063c8 + 0xc) = 0x402ccccd;
  *(undefined4 *)(DAT_154f063c8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063c8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063c8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063c8 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f063c8 + 4) = 0x3dcccccd;
  *(undefined4 *)(DAT_154f063c8 + 6) = 0x3f800000;
  *(undefined4 *)((longlong)DAT_154f063c8 + 0x24) = 0x3e99999a;
  *(undefined4 *)(DAT_154f063c8 + 5) = 0x41;
  if (DAT_154f063d0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063d0 != (void *)0x0) {
      free((void *)*DAT_154f063d0);
    }
    free(DAT_154f063d0);
    DAT_154f063d0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063d0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(8);
  *DAT_154f063d0 = uVar10;
  FUN_140538050(uVar10,4,&DAT_1406af758);
  *(undefined1 *)(DAT_154f063d0 + 1) = 0x2c;
  *(undefined1 *)((longlong)DAT_154f063d0 + 9) = 0x50;
  *(undefined1 *)((longlong)DAT_154f063d0 + 10) = 0x50;
  *(undefined4 *)((longlong)DAT_154f063d0 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063d0 + 0xc) = 0x40400000;
  *(undefined4 *)(DAT_154f063d0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063d0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063d0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063d0 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f063d0 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063d0 + 6) = 0x40000000;
  *(undefined4 *)((longlong)DAT_154f063d0 + 0x24) = 0x3f000000;
  *(undefined4 *)(DAT_154f063d0 + 5) = 9;
  if (DAT_154f063d8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063d8 != (void *)0x0) {
      free((void *)*DAT_154f063d8);
    }
    free(DAT_154f063d8);
    DAT_154f063d8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063d8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xe);
  *DAT_154f063d8 = uVar10;
  FUN_140538050(uVar10,7,L"Violin");
  *(undefined1 *)(DAT_154f063d8 + 1) = 0x37;
  *(undefined1 *)((longlong)DAT_154f063d8 + 9) = 0x6c;
  *(undefined1 *)((longlong)DAT_154f063d8 + 10) = 0x6c;
  *(undefined4 *)((longlong)DAT_154f063d8 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063d8 + 0xc) = 0x40400000;
  *(undefined4 *)(DAT_154f063d8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063d8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063d8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063d8 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f063d8 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063d8 + 6) = 0x40000000;
  *(undefined4 *)((longlong)DAT_154f063d8 + 0x24) = 0x3e99999a;
  *(undefined4 *)(DAT_154f063d8 + 5) = 0xc5;
  if (DAT_154f063e0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063e0 != (void *)0x0) {
      free((void *)*DAT_154f063e0);
    }
    free(DAT_154f063e0);
    DAT_154f063e0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063e0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xc);
  *DAT_154f063e0 = uVar10;
  FUN_140538050(uVar10,6,L"Cello");
  *(undefined1 *)(DAT_154f063e0 + 1) = 0x24;
  *(undefined1 *)((longlong)DAT_154f063e0 + 9) = 0x43;
  *(undefined1 *)((longlong)DAT_154f063e0 + 10) = 0x51;
  *(undefined4 *)((longlong)DAT_154f063e0 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063e0 + 0xc) = 0x40000000;
  *(undefined4 *)(DAT_154f063e0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063e0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063e0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063e0 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f063e0 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063e0 + 6) = 0x40000000;
  *(undefined4 *)((longlong)DAT_154f063e0 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f063e0 + 5) = 0x47;
  if (DAT_154f063e8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063e8 != (void *)0x0) {
      free((void *)*DAT_154f063e8);
    }
    free(DAT_154f063e8);
    DAT_154f063e8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063e8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x1a);
  *DAT_154f063e8 = uVar10;
  FUN_140538050(uVar10,0xd,L"Bass (Synth)");
  *(undefined1 *)(DAT_154f063e8 + 1) = 0x1c;
  *(undefined1 *)((longlong)DAT_154f063e8 + 9) = 0x43;
  *(undefined1 *)((longlong)DAT_154f063e8 + 10) = 0x43;
  *(undefined4 *)((longlong)DAT_154f063e8 + 0x2c) = 0x3e800000;
  *(undefined4 *)((longlong)DAT_154f063e8 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f063e8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063e8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063e8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063e8 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f063e8 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063e8 + 6) = 0x40800000;
  *(undefined4 *)((longlong)DAT_154f063e8 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f063e8 + 5) = 0;
  if (DAT_154f063f0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063f0 != (void *)0x0) {
      free((void *)*DAT_154f063f0);
    }
    free(DAT_154f063f0);
    DAT_154f063f0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063f0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x1e);
  *DAT_154f063f0 = uVar10;
  FUN_140538050(uVar10,0xf,L"Violin (Synth)");
  *(undefined1 *)(DAT_154f063f0 + 1) = 0x37;
  *(undefined1 *)((longlong)DAT_154f063f0 + 9) = 0x6c;
  *(undefined1 *)((longlong)DAT_154f063f0 + 10) = 0x6c;
  *(undefined4 *)((longlong)DAT_154f063f0 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063f0 + 0xc) = 0x40400000;
  *(undefined4 *)(DAT_154f063f0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063f0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063f0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063f0 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f063f0 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063f0 + 6) = 0x40000000;
  *(undefined4 *)((longlong)DAT_154f063f0 + 0x24) = 0x3e99999a;
  *(undefined4 *)(DAT_154f063f0 + 5) = 0x45;
  if (DAT_154f063f8 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f063f8 != (void *)0x0) {
      free((void *)*DAT_154f063f8);
    }
    free(DAT_154f063f8);
    DAT_154f063f8 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f063f8 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x1c);
  *DAT_154f063f8 = uVar10;
  FUN_140538050(uVar10,0xe,L"Cello (Synth)");
  *(undefined1 *)(DAT_154f063f8 + 1) = 0x24;
  *(undefined1 *)((longlong)DAT_154f063f8 + 9) = 0x51;
  *(undefined1 *)((longlong)DAT_154f063f8 + 10) = 0x51;
  *(undefined4 *)((longlong)DAT_154f063f8 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f063f8 + 0xc) = 0x40000000;
  *(undefined4 *)(DAT_154f063f8 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f063f8 + 0x14) = 0;
  *(undefined4 *)(DAT_154f063f8 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f063f8 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f063f8 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f063f8 + 6) = 0x40000000;
  *(undefined4 *)((longlong)DAT_154f063f8 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f063f8 + 5) = 0x45;
  if (DAT_154f06400 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06400 != (void *)0x0) {
      free((void *)*DAT_154f06400);
    }
    free(DAT_154f06400);
    DAT_154f06400 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06400 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(10);
  *DAT_154f06400 = uVar10;
  FUN_140538050(uVar10,5,L"Beep");
  *(undefined1 *)(DAT_154f06400 + 1) = 0x45;
  *(undefined1 *)((longlong)DAT_154f06400 + 9) = 0x53;
  *(undefined1 *)((longlong)DAT_154f06400 + 10) = 0x53;
  *(undefined4 *)((longlong)DAT_154f06400 + 0x2c) = 0x3dcccccd;
  *(undefined4 *)((longlong)DAT_154f06400 + 0xc) = 0x40000000;
  *(undefined4 *)(DAT_154f06400 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06400 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06400 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06400 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06400 + 4) = 0x3e99999a;
  *(undefined4 *)(DAT_154f06400 + 6) = 0x3f800000;
  *(undefined4 *)((longlong)DAT_154f06400 + 0x24) = 0x3e4ccccd;
  *(undefined4 *)(DAT_154f06400 + 5) = 1;
  if (DAT_154f06408 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06408 != (void *)0x0) {
      free((void *)*DAT_154f06408);
    }
    free(DAT_154f06408);
    DAT_154f06408 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06408 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x20);
  *DAT_154f06408 = uVar10;
  FUN_140538050(uVar10,0x10,L"Unpitched (Low)");
  *(undefined1 *)(DAT_154f06408 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06408 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06408 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06408 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06408 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06408 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06408 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06408 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06408 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06408 + 4) = 0;
  *(undefined4 *)(DAT_154f06408 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06408 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06408 + 5) = 0x10;
  if (DAT_154f06410 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06410 != (void *)0x0) {
      free((void *)*DAT_154f06410);
    }
    free(DAT_154f06410);
    DAT_154f06410 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06410 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x22);
  *DAT_154f06410 = uVar10;
  FUN_140538050(uVar10,0x11,L"Unpitched (High)");
  *(undefined1 *)(DAT_154f06410 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06410 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06410 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06410 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06410 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06410 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06410 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06410 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06410 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06410 + 4) = 0;
  *(undefined4 *)(DAT_154f06410 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06410 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06410 + 5) = 0x10;
  if (DAT_154f06460 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06460 != (void *)0x0) {
      free((void *)*DAT_154f06460);
    }
    free(DAT_154f06460);
    DAT_154f06460 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06460 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(8);
  *DAT_154f06460 = uVar10;
  FUN_140538050(uVar10,4,&DAT_1406af838);
  *(undefined1 *)(DAT_154f06460 + 1) = 0x29;
  *(undefined1 *)((longlong)DAT_154f06460 + 9) = 0x5b;
  *(undefined1 *)((longlong)DAT_154f06460 + 10) = 0x5b;
  *(undefined4 *)((longlong)DAT_154f06460 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06460 + 0xc) = 0x40800000;
  *(undefined4 *)(DAT_154f06460 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06460 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06460 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06460 + 0x1c) = 0x3fc00000;
  *(undefined4 *)(DAT_154f06460 + 4) = 0x40800000;
  *(undefined4 *)(DAT_154f06460 + 6) = 0x41000000;
  *(undefined4 *)((longlong)DAT_154f06460 + 0x24) = 0x3f800000;
  *(undefined4 *)(DAT_154f06460 + 5) = 0xa3;
  if (DAT_154f06468 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06468 != (void *)0x0) {
      free((void *)*DAT_154f06468);
    }
    free(DAT_154f06468);
    DAT_154f06468 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06468 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(10);
  *DAT_154f06468 = uVar10;
  FUN_140538050(uVar10,5,L"Kick");
  *(undefined1 *)(DAT_154f06468 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06468 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06468 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06468 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06468 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06468 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06468 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06468 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06468 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06468 + 4) = 0;
  *(undefined4 *)(DAT_154f06468 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06468 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06468 + 5) = 0x10;
  if (DAT_154f06470 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06470 != (void *)0x0) {
      free((void *)*DAT_154f06470);
    }
    free(DAT_154f06470);
    DAT_154f06470 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06470 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xc);
  *DAT_154f06470 = uVar10;
  FUN_140538050(uVar10,6,L"Drums");
  *(undefined1 *)(DAT_154f06470 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06470 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06470 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06470 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06470 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06470 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06470 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06470 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06470 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06470 + 4) = 0;
  *(undefined4 *)(DAT_154f06470 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06470 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06470 + 5) = 0x10;
  if (DAT_154f06478 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06478 != (void *)0x0) {
      free((void *)*DAT_154f06478);
    }
    free(DAT_154f06478);
    DAT_154f06478 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06478 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x16);
  *DAT_154f06478 = uVar10;
  FUN_140538050(uVar10,0xb,L"Percussion");
  *(undefined1 *)(DAT_154f06478 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06478 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06478 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06478 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06478 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06478 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06478 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06478 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06478 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06478 + 4) = 0;
  *(undefined4 *)(DAT_154f06478 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06478 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06478 + 5) = 0x10;
  if (DAT_154f06508 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06508 != (void *)0x0) {
      free((void *)*DAT_154f06508);
    }
    free(DAT_154f06508);
    DAT_154f06508 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06508 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x22);
  *DAT_154f06508 = uVar10;
  FUN_140538050(uVar10,0x11,L"Tuned Percussion");
  *(undefined1 *)(DAT_154f06508 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06508 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06508 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06508 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06508 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06508 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06508 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06508 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06508 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06508 + 4) = 0;
  *(undefined4 *)(DAT_154f06508 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06508 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06508 + 5) = 0x10;
  if (DAT_154f06510 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06510 != (void *)0x0) {
      free((void *)*DAT_154f06510);
    }
    free(DAT_154f06510);
    DAT_154f06510 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06510 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x10);
  *DAT_154f06510 = uVar10;
  FUN_140538050(uVar10,8,L"Marimba");
  *(undefined1 *)(DAT_154f06510 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06510 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06510 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06510 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06510 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06510 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06510 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06510 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06510 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06510 + 4) = 0;
  *(undefined4 *)(DAT_154f06510 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06510 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06510 + 5) = 0x10;
  if (DAT_154f06480 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06480 != (void *)0x0) {
      free((void *)*DAT_154f06480);
    }
    free(DAT_154f06480);
    DAT_154f06480 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06480 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0x14);
  *DAT_154f06480 = uVar10;
  FUN_140538050(uVar10,10,L"Harmonics");
  *(undefined1 *)(DAT_154f06480 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06480 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06480 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06480 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06480 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06480 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06480 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06480 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06480 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06480 + 4) = 0;
  *(undefined4 *)(DAT_154f06480 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06480 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06480 + 5) = 0x10;
  if (DAT_154f06490 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06490 != (void *)0x0) {
      free((void *)*DAT_154f06490);
    }
    free(DAT_154f06490);
    DAT_154f06490 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06490 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xc);
  *DAT_154f06490 = uVar10;
  FUN_140538050(uVar10,6,L"Snare");
  *(undefined1 *)(DAT_154f06490 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06490 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06490 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06490 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06490 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06490 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06490 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06490 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06490 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06490 + 4) = 0;
  *(undefined4 *)(DAT_154f06490 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06490 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06490 + 5) = 0x10;
  if (DAT_154f06498 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f06498 != (void *)0x0) {
      free((void *)*DAT_154f06498);
    }
    free(DAT_154f06498);
    DAT_154f06498 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650();
  DAT_154f06498 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(8);
  *DAT_154f06498 = uVar10;
  FUN_140538050(uVar10,4,&DAT_1406af8d8);
  *(undefined1 *)(DAT_154f06498 + 1) = 0;
  *(undefined1 *)((longlong)DAT_154f06498 + 9) = 0;
  *(undefined1 *)((longlong)DAT_154f06498 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f06498 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f06498 + 0xc) = 0;
  *(undefined4 *)(DAT_154f06498 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f06498 + 0x14) = 0;
  *(undefined4 *)(DAT_154f06498 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f06498 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f06498 + 4) = 0;
  *(undefined4 *)(DAT_154f06498 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f06498 + 0x24) = 0;
  *(undefined4 *)(DAT_154f06498 + 5) = 0x10;
  if (DAT_154f064c0 != (undefined8 *)0x0) {
    if ((void *)*DAT_154f064c0 != (void *)0x0) {
      free((void *)*DAT_154f064c0);
    }
    free(DAT_154f064c0);
    DAT_154f064c0 = (undefined8 *)0x0;
  }
  puVar9 = (undefined8 *)FUN_14061b650(0x38);
  DAT_154f064c0 = puVar9;
  *puVar9 = 0;
  puVar9[1] = 0;
  puVar9[2] = 0;
  puVar9[3] = 0;
  puVar9[4] = 0;
  puVar9[5] = 0;
  puVar9[6] = 0;
  uVar10 = thunk_FUN_14061b650(0xe);
  *DAT_154f064c0 = uVar10;
  FUN_140538050(uVar10,7,L"Hi-Hat");
  local_6e0 = 0x10;
  local_6e8 = 0;
  local_6f0 = 0;
  *(undefined1 *)(DAT_154f064c0 + 1) = 0;
  local_6f8 = 0;
  local_700 = 0;
  local_708 = 0;
  *(undefined1 *)((longlong)DAT_154f064c0 + 9) = 0;
  local_710 = 0;
  local_718 = 0;
  *(undefined1 *)((longlong)DAT_154f064c0 + 10) = 0;
  *(undefined4 *)((longlong)DAT_154f064c0 + 0x2c) = 0;
  *(undefined4 *)((longlong)DAT_154f064c0 + 0xc) = 0;
  *(undefined4 *)(DAT_154f064c0 + 2) = 0;
  *(undefined4 *)((longlong)DAT_154f064c0 + 0x14) = 0;
  *(undefined4 *)(DAT_154f064c0 + 3) = 0;
  *(undefined4 *)((longlong)DAT_154f064c0 + 0x1c) = 0;
  *(undefined4 *)(DAT_154f064c0 + 4) = 0;
  *(undefined4 *)(DAT_154f064c0 + 6) = 0;
  *(undefined4 *)((longlong)DAT_154f064c0 + 0x24) = 0;
  *(undefined4 *)(DAT_154f064c0 + 5) = 0x10;
  FUN_140387830(0x2b,L"Cymbal",0,0);
  local_6e0 = 0x10;
  local_6e8 = 0;
  local_6f0 = 0;
  local_6f8 = 0;
  local_700 = 0;
  local_708 = 0;
  local_710 = 0;
  local_718 = 0;
  FUN_140387830(0x31,L"Clap",0,0);
  local_6e0 = 0;
  local_6e8 = 0;
  local_6f0 = 0;
  local_6f8 = 0;
  local_700 = 0;
  local_708 = 0;
  local_710 = 0;
  local_718 = 0;
  FUN_140387830(0x26,&DAT_1406af910,0,0);
  local_6e0 = 0x10;
  local_6e8 = 0;
  local_6f0 = 0;
  local_6f8 = 0;
  local_700 = 0;
  local_708 = 0;
  local_710 = 0;
  local_718 = 0;
  FUN_140387830(0x2c,L"Loops",0,0);
  local_6e0 = 1;
  local_6e8 = 0x3e6b851f;
  local_6f0 = 0x40000000;
  local_6f8 = 0x3f4ccccd;
  local_700 = 0x3e19999a;
  local_708 = 0x3f800000;
  local_710 = 0;
  local_718 = 0x67;
  FUN_140387830(0x15,L"Piccolo",0x3c,0x67);
  local_6e0 = 0x41;
  local_6e8 = 0x3e99999a;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3dcccccd;
  local_700 = 0;
  local_708 = 0x402ccccd;
  local_710 = 0;
  local_718 = 0x60;
  FUN_140387830(0x16,L"Oboe",0x32,0x60);
  local_6e0 = 0x41;
  local_6e8 = 0x3e99999a;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3dcccccd;
  local_700 = 0;
  local_708 = 0x402ccccd;
  local_710 = 0;
  local_718 = 0x60;
  FUN_140387830(0x17,L"Bassoon",0x32,0x60);
  local_6e0 = 1;
  local_6e8 = 0x3e800000;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3f4ccccd;
  local_700 = 0;
  local_708 = 0x40000000;
  local_710 = 0;
  local_718 = 0x54;
  FUN_140387830(0x18,L"French Horn",0x36,0x54);
  local_6e0 = 1;
  local_6e8 = 0x3e800000;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3f4ccccd;
  local_700 = 0;
  local_708 = 0x40000000;
  local_710 = 0;
  local_718 = 0x54;
  FUN_140387830(0x19,L"Trombone",0x36,0x54);
  local_6e0 = 1;
  local_6e8 = 0x3e800000;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3f4ccccd;
  local_700 = 0;
  local_708 = 0x40000000;
  local_710 = 0;
  local_718 = 0x54;
  FUN_140387830(0x1a,L"Tuba",0x36,0x54);
  local_6e0 = 0xc5;
  local_6e8 = 0x3e99999a;
  local_6f0 = 0x40000000;
  local_6f8 = 0x40800000;
  local_700 = 0x3fc00000;
  local_708 = 0x40400000;
  local_710 = 0;
  local_718 = 0x6c;
  FUN_140387830(0x1b,L"Violin I",0x37,0x6c);
  local_6e0 = 0xc5;
  local_6e8 = 0x3e99999a;
  local_6f0 = 0x40000000;
  local_6f8 = 0x40800000;
  local_700 = 0x3fc00000;
  local_708 = 0x40400000;
  local_710 = 0;
  local_718 = 0x6c;
  FUN_140387830(0x1c,L"Violin II",0x37,0x6c);
  local_6e0 = 0xc5;
  local_6e8 = 0x3e99999a;
  local_6f0 = 0x40000000;
  local_6f8 = 0x40800000;
  local_700 = 0x3fc00000;
  local_708 = 0x40400000;
  local_710 = 0;
  local_718 = 0x6c;
  FUN_140387830(0x1d,L"Viola",0x37,0x6c);
  local_6e0 = 0xc5;
  local_6e8 = 0x3e99999a;
  local_6f0 = 0x40000000;
  local_6f8 = 0x40800000;
  local_700 = 0x3fc00000;
  local_708 = 0x40400000;
  local_710 = 0;
  local_718 = 0x6c;
  FUN_140387830(0x2d,L"Strings",0x37,0x6c);
  local_6e0 = 0x80;
  local_6e8 = 0x3e4ccccd;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3dcccccd;
  local_700 = 0;
  local_708 = 0x41000000;
  local_710 = 0x3e19999a;
  local_718 = 0x6c;
  FUN_140387830(0x2e,L"Organ",0x15,0x6c);
  local_6e0 = 0x80;
  local_6e8 = 0x3e4ccccd;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3dcccccd;
  local_700 = 0;
  local_708 = 0x41000000;
  local_710 = 0x3e19999a;
  local_718 = 0x58;
  FUN_140387830(0x2f,L"Xylophone",0x38,0x58);
  local_6e0 = 0x80;
  local_6e8 = 0x3e4ccccd;
  local_6f0 = 0x3f800000;
  local_6f8 = 0x3dcccccd;
  local_700 = 0;
  local_708 = 0x41000000;
  local_710 = 0x3e19999a;
  local_718 = 0x66;
  FUN_140387830(0x30,L"Glockenspiel",0x46,0x66);
  DAT_154f0a774 = 0;
  if (param_1 == 0) {
    FUN_140532150(local_6d8,u_idat_140939a20);
  }
  else {
    FUN_140538050(local_6d8,0x104,L"%s.idat",param_1);
  }
  lVar12 = FUN_140531870(local_6d8,0x40,0,0x2000000);
  if (lVar12 != 0) {
    uVar4 = FUN_140531da0(lVar12);
    if (uVar4 <= DAT_140939a4c) {
      lVar18 = 0x80;
      if (uVar4 < 8) {
        lVar18 = 0x200;
      }
      do {
        iVar5 = FUN_1402e4e00(lVar12);
        if (iVar5 != 0) {
          FUN_1405333d0(lVar12,local_4c8,0x200);
          FUN_1402e4e00(lVar12);
          FUN_1402e4e00(lVar12);
          FUN_140532540(lVar12);
          FUN_140532540(lVar12);
          FUN_140532540(lVar12);
          FUN_140532540(lVar12);
          FUN_140532540(lVar12);
          FUN_140532540(lVar12);
          FUN_140532540(lVar12);
          if (1 < uVar4) {
            FUN_140531da0(lVar12);
          }
          if (2 < uVar4) {
            FUN_140532540(lVar12);
            FUN_140532540(lVar12);
          }
        }
        lVar18 = lVar18 + -1;
      } while (lVar18 != 0);
      uVar6 = FUN_140531da0(lVar12);
      uVar7 = FUN_140531da0(lVar12);
      DAT_154f0a770 = FUN_140531da0(lVar12);
      pvVar14 = pvVar19;
      if (DAT_154f0a770 != 0) {
        do {
          uVar10 = FUN_14061b650(0x120);
          (&DAT_154f06770)[(longlong)pvVar14] = uVar10;
          uVar2 = FUN_1402e4e00(lVar12);
          *(undefined1 *)(&DAT_154f06770)[(longlong)pvVar14] = uVar2;
          uVar8 = FUN_140532890(lVar12);
          *(undefined4 *)((&DAT_154f06770)[(longlong)pvVar14] + 4) = uVar8;
          if (*(int *)((&DAT_154f06770)[(longlong)pvVar14] + 4) - 1U < 2) {
            *(undefined4 *)((&DAT_154f06770)[(longlong)pvVar14] + 4) = 1;
          }
          if (*(int *)((&DAT_154f06770)[(longlong)pvVar14] + 4) - 4U < 2) {
            *(undefined4 *)((&DAT_154f06770)[(longlong)pvVar14] + 4) = 4;
          }
          if (*(int *)((&DAT_154f06770)[(longlong)pvVar14] + 4) == 8) {
            *(undefined4 *)((&DAT_154f06770)[(longlong)pvVar14] + 4) = 7;
          }
          uVar2 = FUN_1402e4e00(lVar12);
          *(undefined1 *)((&DAT_154f06770)[(longlong)pvVar14] + 8) = uVar2;
          FUN_1405333d0(lVar12,(&DAT_154f06770)[(longlong)pvVar14] + 0x18,0x80);
          uVar8 = FUN_140532540(lVar12);
          *(undefined4 *)((&DAT_154f06770)[(longlong)pvVar14] + 0x118) = uVar8;
          *(undefined8 *)((&DAT_154f06770)[(longlong)pvVar14] + 0x10) = 0;
          if (uVar4 < 6) {
            _Dst = (void *)FUN_14061b650(0x2c0);
            pvVar17 = pvVar19;
            if (_Dst != (void *)0x0) {
              memset(_Dst,0,0x2c0);
              pvVar17 = _Dst;
            }
            local_710 = 0;
            local_718 = 0;
            *(void **)((&DAT_154f06770)[(longlong)pvVar14] + 0x10) = pvVar17;
            cVar3 = FUN_1405945c0(lVar12,*(undefined8 *)((&DAT_154f06770)[(longlong)pvVar14] + 0x10)
                                  ,uVar6,uVar7);
            if (cVar3 == '\0') goto LAB_14037b5e7;
            FUN_140377f90(*(undefined8 *)((&DAT_154f06770)[(longlong)pvVar14] + 0x10));
            free(*(void **)((&DAT_154f06770)[(longlong)pvVar14] + 0x10));
            *(undefined8 *)((&DAT_154f06770)[(longlong)pvVar14] + 0x10) = 0;
          }
          uVar13 = (int)pvVar14 + 1;
          pvVar14 = (void *)(ulonglong)uVar13;
        } while (uVar13 < DAT_154f0a770);
      }
      DAT_154f0a774 = FUN_140531da0(lVar12);
      if (DAT_154f0a774 != 0) {
        do {
          uVar10 = FUN_14061b650(0x18c);
          (&DAT_154f0a780)[(longlong)pvVar19] = uVar10;
          uVar2 = FUN_1402e4e00(lVar12);
          bVar16 = 0;
          *(undefined1 *)(&DAT_154f0a780)[(longlong)pvVar19] = uVar2;
          pbVar11 = (byte *)(&DAT_154f0a780)[(longlong)pvVar19];
          if (*pbVar11 != 0) {
            do {
              uVar6 = FUN_140532540(lVar12);
              uVar15 = (ulonglong)bVar16;
              *(undefined4 *)((&DAT_154f0a780)[(longlong)pvVar19] + 4 + uVar15 * 4) = uVar6;
              if (uVar4 < 4) {
                *(undefined4 *)((&DAT_154f0a780)[(longlong)pvVar19] + 0xc4 + uVar15 * 4) = 0;
              }
              else {
                uVar6 = FUN_140532540(lVar12);
                *(undefined4 *)((&DAT_154f0a780)[(longlong)pvVar19] + 0xc4 + uVar15 * 4) = uVar6;
              }
              pbVar11 = (byte *)(&DAT_154f0a780)[(longlong)pvVar19];
              bVar16 = bVar16 + 1;
            } while (bVar16 < *pbVar11);
          }
          if (uVar4 < 5) {
            pbVar11[0x184] = 0;
            pbVar11[0x185] = 0;
            pbVar11[0x186] = 0;
            pbVar11[0x187] = 0;
          }
          else {
            uVar6 = FUN_140532540(lVar12);
            *(undefined4 *)((&DAT_154f0a780)[(longlong)pvVar19] + 0x184) = uVar6;
          }
          uVar6 = FUN_140531da0(lVar12);
          plVar1 = &DAT_154f0a780 + (longlong)pvVar19;
          uVar13 = (int)pvVar19 + 1;
          pvVar19 = (void *)(ulonglong)uVar13;
          *(undefined4 *)(*plVar1 + 0x188) = uVar6;
        } while (uVar13 < DAT_154f0a774);
      }
    }
LAB_14037b5e7:
    FUN_1405319f0(lVar12);
  }
  return;
}

