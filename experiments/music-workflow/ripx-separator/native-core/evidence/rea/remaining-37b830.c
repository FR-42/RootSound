
/* WARNING: Type propagation algorithm not settling */

undefined2 * FUN_14037b830(uint param_1,char param_2,int param_3,int param_4,char param_5)

{
  short sVar1;
  char cVar2;
  undefined2 *puVar3;
  longlong lVar4;
  ushort uVar5;
  longlong lVar6;
  ulonglong uVar7;
  longlong lVar8;
  longlong lVar9;
  uint uVar10;
  short *psVar11;
  short *psVar12;
  longlong lVar13;
  
  lVar9 = (longlong)param_4;
  if (((-1 < param_3) || (param_3 = DAT_14098a1b0, -1 < DAT_14098a1b0)) && (param_3 < DAT_1549b0dd0)
     ) {
    uVar10 = 0;
    if (param_1 != 0xffff) {
      uVar10 = param_1;
    }
    uVar7 = (ulonglong)uVar10;
    if (0x3ff < uVar10) {
      return (undefined2 *)0x0;
    }
    psVar11 = (short *)(&DAT_154f2a780)[uVar7 * 9];
    if (psVar11 == (short *)0x0) {
      return (undefined2 *)0x0;
    }
    puVar3 = (undefined2 *)FUN_14037df30(uVar7);
    if (puVar3 != (undefined2 *)0x0) {
      if (param_5 == '\0') {
        return puVar3;
      }
      uVar10 = *(uint *)(puVar3 + 6);
      if ((uVar10 & 2) != 0) {
        uVar10 = uVar10 & 0xfffffffd;
        *(uint *)(puVar3 + 6) = uVar10;
      }
      cVar2 = FUN_14037cc30(param_3);
      if (cVar2 == '\0') {
        return puVar3;
      }
      if ((uVar10 & 8) != 0) {
        return puVar3;
      }
      *(uint *)(puVar3 + 6) = uVar10 | 8;
      return puVar3;
    }
    lVar4 = (longlong)param_3;
    uVar5 = (&DAT_1409ee730)[lVar4 * 0x355bc];
    if (uVar5 < 0x200) {
      lVar13 = 2;
      if (param_2 != '\0') {
        FUN_140573580(2);
        uVar5 = (&DAT_1409ee730)[lVar4 * 0x355bc];
        psVar11 = (short *)(&DAT_154f2a780)[uVar7 * 9];
      }
      lVar6 = lVar4 * 0x6ab78 + (ulonglong)uVar5 * 0x158 + 0x9c3730;
      puVar3 = (undefined2 *)(lVar6 + 0x140000000);
      memset(puVar3,0,0x158);
      *(undefined4 *)(lVar6 + 0x14000000c) = (&DAT_154f2a794)[uVar7 * 0x12];
      *(undefined4 *)(lVar6 + 0x140000110) = (&DAT_154f2a788)[uVar7 * 0x12];
      *(undefined4 *)(lVar6 + 0x140000114) = (&DAT_154f2a78c)[uVar7 * 0x12];
      *(undefined4 *)(lVar6 + 0x140000118) = (&DAT_154f2a790)[uVar7 * 0x12];
      *puVar3 = (short)uVar10;
      psVar12 = psVar11;
      do {
        sVar1 = *psVar12;
        *(short *)((longlong)puVar3 + (0x10 - (longlong)psVar11) + (longlong)psVar12) = sVar1;
        psVar12 = psVar12 + 1;
      } while (sVar1 != 0);
      if ((-1 < param_4) && (param_4 < DAT_1549b0dd0)) {
        uVar5 = 0;
        if ((&DAT_1409ee730)[lVar9 * 0x355bc] != 0) {
          do {
            if ((ushort)(&DAT_1409c3730)[lVar9 * 0x355bc + (ulonglong)uVar5 * 0xac] == uVar10) {
              lVar9 = (ulonglong)uVar5 * 0x158 + lVar9 * 0x6ab78;
              *(undefined4 *)(lVar6 + 0x140000110) = *(undefined4 *)(&DAT_1409c3840 + lVar9);
              *(undefined4 *)(lVar6 + 0x140000114) = *(undefined4 *)(&DAT_1409c3844 + lVar9);
              *(undefined4 *)(lVar6 + 0x140000118) = *(undefined4 *)(&DAT_1409c3848 + lVar9);
              break;
            }
            uVar5 = uVar5 + 1;
          } while (uVar5 < (ushort)(&DAT_1409ee730)[lVar9 * 0x355bc]);
        }
      }
      FUN_14037eb00(puVar3);
      lVar8 = 0;
      *(undefined4 *)(lVar6 + 0x140000138) = (&DAT_154f2a7c0)[uVar7 * 0x12];
      lVar9 = lVar8;
      do {
        FUN_14027bff0(*(undefined8 *)((longlong)&DAT_154f2a7a8 + lVar8 + uVar7 * 0x48),0,
                      *(undefined2 *)((longlong)&DAT_154f2a7b8 + lVar9 + uVar7 * 0x48),
                      lVar8 + 0x120 + (longlong)puVar3,0,lVar9 + 0x130 + (longlong)puVar3,
                      lVar9 + 0x134 + (longlong)puVar3,1,0,0xbf800000,0xbf800000);
        lVar9 = lVar9 + 2;
        lVar8 = lVar8 + 8;
        lVar13 = lVar13 + -1;
      } while (lVar13 != 0);
      (&DAT_1409ee730)[lVar4 * 0x355bc] = (&DAT_1409ee730)[lVar4 * 0x355bc] + 1;
      cVar2 = FUN_14037cc30(param_3);
      if ((cVar2 != '\0') && ((*(uint *)(lVar6 + 0x14000000c) & 8) == 0)) {
        *(uint *)(lVar6 + 0x14000000c) = *(uint *)(lVar6 + 0x14000000c) | 8;
      }
      FUN_14043e3b0(uVar10 & 0xffff);
      FUN_1404401d0();
      if (param_2 == '\0') {
        return puVar3;
      }
      FUN_1402e6a30(0,0xffffffff);
      return puVar3;
    }
  }
  return (undefined2 *)0x0;
}

