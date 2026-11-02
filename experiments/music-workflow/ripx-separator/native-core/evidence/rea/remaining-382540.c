
undefined8 FUN_140382540(int *param_1,int param_2)

{
  int iVar1;
  undefined4 uVar2;
  int iVar3;
  int iVar4;
  int iVar5;
  int iVar6;
  int iVar7;
  float fVar8;
  float fVar9;
  float fVar10;
  float fVar11;
  undefined8 uVar12;
  undefined4 uVar13;
  float fVar14;
  
  fVar14 = 0.0;
  if ((-1 < param_2) || (param_2 = DAT_14098a1b0, -1 < DAT_14098a1b0)) {
    iVar1 = *param_1;
    iVar3 = (int)(0.3 / *(float *)(&DAT_1409c3720 + (longlong)param_2 * 0x6ab78) + 0.5);
    iVar4 = 1;
    if (1 < iVar3) {
      iVar4 = iVar3;
    }
    iVar3 = param_1[1] - iVar1;
    iVar3 = iVar3 / 3 + (iVar3 >> 0x1f) +
            (int)(((longlong)iVar3 / 3 + ((longlong)iVar3 >> 0x3f) & 0xffffffffU) >> 0x1f);
    if (iVar3 <= iVar4) {
      iVar4 = iVar3;
    }
    fVar8 = 0.0;
    uVar2 = 0;
    iVar7 = iVar1 + 1;
    iVar3 = 0;
    while( true ) {
      iVar5 = iVar3;
      iVar3 = iVar7;
      uVar13 = uVar2;
      fVar10 = fVar8;
      iVar6 = param_1[1] + -1;
      iVar7 = iVar6;
      if (iVar4 + iVar1 < iVar6) {
        iVar7 = iVar4 + iVar1;
      }
      if (iVar7 <= iVar3) break;
      fVar8 = (float)FUN_14036a7f0(param_1,iVar3 + -1,0xffffffff,0,0,0);
      fVar9 = (float)FUN_14036a7f0(param_1,iVar3,0xffffffff,0,0,0);
      iVar7 = iVar3 + 1;
      uVar12 = FUN_14036a7f0(param_1,iVar7,0xffffffff,0,0,0);
      fVar8 = ((float)uVar12 + fVar8 + fVar9) / 3.0;
      uVar2 = (int)((ulonglong)uVar12 >> 0x20);
      if (fVar8 <= fVar10) {
        fVar8 = fVar10;
        uVar2 = uVar13;
        iVar3 = iVar5;
      }
    }
    if (fVar10 != 0.0) {
      iVar4 = (param_1[1] + iVar5) / 2;
      iVar3 = (int)(0.3 / *(float *)(&DAT_1409c3720 + (longlong)param_2 * 0x6ab78) + 0.5);
      iVar1 = 1;
      if (1 < iVar3) {
        iVar1 = iVar3;
      }
      if (iVar1 + iVar5 <= iVar4) {
        iVar4 = iVar1 + iVar5;
      }
      iVar1 = iVar4;
      if (iVar4 < iVar6) {
        do {
          fVar8 = (float)FUN_14036a7f0(param_1,iVar1 + -1,0xffffffff,0,0,0);
          fVar9 = (float)FUN_14036a7f0(param_1,iVar4,0xffffffff,0,0,0);
          fVar11 = (float)FUN_14036a7f0(param_1,iVar1 + 1,0xffffffff,0,0,0);
          fVar8 = (fVar11 + fVar8 + fVar9) / 3.0;
          if (fVar14 < fVar8) {
            fVar14 = fVar8;
          }
          iVar4 = iVar4 + 1;
          iVar1 = iVar1 + 1;
        } while (iVar4 < param_1[1] + -1);
      }
      if (fVar14 <= 1.0) {
        fVar14 = 1.0;
      }
      fVar10 = fVar10 / fVar14;
      if (4.0 <= fVar10) {
        fVar10 = 4.0;
      }
      goto LAB_1403827a2;
    }
  }
  fVar10 = 0.0;
  uVar13 = 0;
LAB_1403827a2:
  return CONCAT44(uVar13,fVar10);
}

