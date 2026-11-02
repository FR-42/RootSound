
float FUN_1403827e0(int *param_1,int param_2)

{
  int iVar1;
  int iVar2;
  int iVar3;
  int iVar4;
  int iVar5;
  int iVar6;
  int iVar7;
  int iVar8;
  ulonglong uVar9;
  float fVar10;
  float fVar11;
  double dVar12;
  double dVar13;
  float fVar14;
  float fVar15;
  float fVar16;
  float fVar17;
  
  if ((param_2 < 0) && (param_2 = DAT_14098a1b0, DAT_14098a1b0 < 0)) {
    return 0.0;
  }
  iVar1 = *param_1;
  iVar2 = param_1[1];
  fVar17 = -1.0;
  iVar3 = (int)(0.3 / *(float *)(&DAT_1409c3720 + (longlong)param_2 * 0x6ab78) + 0.5);
  iVar5 = 1;
  if (1 < iVar3) {
    iVar5 = iVar3;
  }
  if (iVar2 - iVar1 <= iVar5) {
    iVar5 = iVar2 - iVar1;
  }
  if (iVar1 <= iVar2 - iVar5) {
    iVar3 = iVar1 + 1;
    uVar9 = (ulonglong)(((uint)((iVar2 - iVar5) - iVar1) >> 1) + 1);
    do {
      iVar8 = iVar5 + -2 + iVar3;
      fVar16 = -1.0;
      fVar15 = -1.0;
      if (iVar3 < iVar8) {
        iVar7 = iVar3 + 1;
        iVar6 = iVar3;
        do {
          if (iVar1 < iVar2) {
            if ((short)param_1[0x87] < 0) {
              fVar11 = **(float **)(param_1 + 2);
            }
            else {
              iVar4 = iVar6 + -1;
              if (iVar6 + -1 < iVar1) {
                iVar4 = iVar1;
              }
              if (iVar2 <= iVar4) {
                iVar4 = iVar2 + -1;
              }
              fVar11 = *(float *)(*(longlong *)(param_1 + 2) + (ulonglong)(uint)(iVar4 - iVar1) * 4)
              ;
            }
          }
          else {
            fVar11 = 0.0;
          }
          if (iVar1 < iVar2) {
            if ((short)param_1[0x87] < 0) {
              fVar10 = **(float **)(param_1 + 2);
            }
            else {
              iVar4 = iVar6;
              if (iVar6 < iVar1) {
                iVar4 = iVar1;
              }
              if (iVar2 <= iVar4) {
                iVar4 = iVar2 + -1;
              }
              fVar10 = *(float *)(*(longlong *)(param_1 + 2) + (ulonglong)(uint)(iVar4 - iVar1) * 4)
              ;
            }
          }
          else {
            fVar10 = 0.0;
          }
          if (iVar1 < iVar2) {
            if ((short)param_1[0x87] < 0) {
              fVar14 = **(float **)(param_1 + 2);
            }
            else {
              iVar4 = iVar7;
              if (iVar7 < iVar1) {
                iVar4 = iVar1;
              }
              if (iVar2 <= iVar4) {
                iVar4 = iVar2 + -1;
              }
              fVar14 = *(float *)(*(longlong *)(param_1 + 2) + (ulonglong)(uint)(iVar4 - iVar1) * 4)
              ;
            }
          }
          else {
            fVar14 = 0.0;
          }
          fVar11 = (fVar10 + fVar11 + fVar14) / 3.0;
          if ((fVar16 == -1.0) || (fVar11 < fVar16)) {
            fVar16 = fVar11;
          }
          if ((fVar15 == -1.0) || (fVar15 < fVar11)) {
            fVar15 = fVar11;
          }
          iVar6 = iVar6 + 2;
          iVar7 = iVar7 + 2;
        } while (iVar6 < iVar8);
      }
      dVar12 = log10(((double)fVar15 * 32.0) / 440.0);
      dVar13 = log10(((double)fVar16 * 32.0) / 440.0);
      fVar15 = (float)((dVar12 * 12.0) / 0.3010299956639812 + 9.0) -
               (float)((dVar13 * 12.0) / 0.3010299956639812 + 9.0);
      if ((fVar17 == -1.0) || (fVar15 < fVar17)) {
        fVar17 = fVar15;
      }
      iVar3 = iVar3 + 2;
      uVar9 = uVar9 - 1;
    } while (uVar9 != 0);
  }
  if (fVar17 <= 0.0) {
    fVar17 = 0.0;
  }
  return fVar17;
}

