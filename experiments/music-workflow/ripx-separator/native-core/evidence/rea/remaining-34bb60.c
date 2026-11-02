
longlong FUN_14034bb60(longlong param_1,undefined8 param_2,ushort param_3,int param_4,int param_5,
                      longlong param_6,ushort param_7,longlong param_8,ushort *param_9,
                      ushort *param_10,float *param_11,undefined2 param_12,undefined8 param_13,
                      float param_14,int param_15,longlong param_16)

{
  char cVar1;
  ulonglong uVar2;
  undefined8 uVar3;
  uint7 uVar4;
  uint uVar5;
  longlong lVar6;
  int iVar7;
  float *pfVar8;
  ulonglong uVar9;
  float *pfVar10;
  int iVar11;
  float fVar12;
  float fVar13;
  float fVar14;
  float extraout_XMM0_Da;
  float fVar15;
  float fVar16;
  float fVar17;
  
  *param_10 = param_3;
  *param_9 = param_3;
  uVar9 = (ulonglong)param_3;
  pfVar10 = (float *)((longlong)
                      (int)(((DAT_140989fe4 - param_15) + param_4) * (uint)param_7 + (uint)param_3)
                      * 0x410 + param_6);
  *param_11 = *pfVar10 - *(float *)(param_8 + uVar9 * 4);
  fVar12 = param_14 * 0.1;
  fVar17 = *(float *)(param_8 + uVar9 * 4);
  if (24.0 <= fVar12) {
    fVar12 = 24.0;
  }
  else if (fVar12 <= 2.0) {
    fVar12 = 2.0;
  }
  iVar7 = -1;
  do {
    uVar5 = (uint)param_3;
    fVar16 = *pfVar10 - *(float *)(param_8 + uVar9 * 4);
    iVar11 = 0;
    cVar1 = *(char *)(param_1 + 0x92);
    while( true ) {
      uVar5 = uVar5 + iVar7;
      if (iVar7 < 1) {
        uVar2 = (ulonglong)(~uVar5 >> 0x1f);
      }
      else {
        uVar2 = (ulonglong)((int)uVar5 < (int)(uint)param_7);
      }
      if (((int)uVar2 == 0) ||
         ((((pfVar8 = (float *)((longlong)
                                (int)(((DAT_140989fe4 - param_15) + param_4) * (uint)param_7 + uVar5
                                     ) * 0x410 + param_6), *(char *)(param_1 + 0x92) != '\0' &&
            (iVar7 < 0)) && (4500.0 < (float)*(ushort *)(param_16 + 0x12) * 500.0)) &&
          (((float)(int)uVar5 * 500.0 <= 1500.0 &&
           (uVar2 = (ulonglong)(int)uVar5,
           *pfVar8 - *(float *)(param_8 + uVar2 * 4) < *pfVar10 - *(float *)(param_8 + uVar9 * 4))))
          ))) break;
      fVar15 = *pfVar8;
      lVar6 = (longlong)(int)uVar5;
      fVar14 = *(float *)(param_8 + lVar6 * 4);
      fVar13 = (float)FUN_140351580(3);
      if ((fVar15 <= fVar13 * fVar14) || (fVar15 <= fVar14 + fVar12)) {
LAB_14034bde0:
        iVar11 = iVar11 + 1;
        uVar2 = 0;
        if (iVar11 <= (int)(uint)(cVar1 == '\0')) {
          uVar2 = 1;
        }
      }
      else {
        fVar15 = fVar15 - fVar14;
        fVar14 = (float)FUN_1402a0d40(0xfffffff6);
        if ((fVar15 <= fVar14 * fVar16) ||
           (uVar3 = FUN_1403514f0(10), extraout_XMM0_Da * fVar16 <= fVar15)) goto LAB_14034bde0;
        uVar2 = CONCAT71((int7)((ulonglong)uVar3 >> 8),1);
        iVar11 = 0;
        fVar16 = fVar15;
      }
      if (iVar7 < 1) {
        *param_9 = (ushort)uVar5;
      }
      else {
        *param_10 = (ushort)uVar5;
      }
      if ((char)uVar2 == '\0') break;
      if (((int)(param_3 - 3) <= (int)uVar5) && ((int)uVar5 <= (int)(param_3 + 3))) {
        fVar15 = *pfVar8 - *(float *)(param_8 + lVar6 * 4);
        if (param_14 <= fVar15) {
          fVar15 = param_14;
        }
        *param_11 = fVar15 + *param_11;
        fVar17 = fVar17 + *(float *)(param_8 + lVar6 * 4);
      }
    }
    if (iVar7 < 1) {
      *param_9 = *param_9 + (short)iVar11;
    }
    else {
      *param_10 = *param_10 - (short)iVar11;
    }
    iVar7 = iVar7 + 2;
    if (1 < iVar7) {
      fVar12 = *param_11;
      fVar17 = fVar17 / 7.0;
      *param_11 = fVar12 / 7.0;
      uVar4 = (uint7)(uVar2 >> 8);
      if (param_4 == param_5) {
        return CONCAT71(uVar4,1);
      }
      fVar15 = *(float *)(param_16 + 0x1c) * 0.031622775;
      fVar16 = 48.0;
      if (fVar15 <= 48.0) {
        fVar16 = fVar15;
      }
      fVar15 = DAT_140939684 * fVar17;
      if (DAT_140939684 * fVar17 <= fVar16 + fVar17) {
        fVar15 = fVar16 + fVar17;
      }
      if (fVar15 < fVar12 / 7.0 + fVar17) {
        lVar6 = FUN_14034ba00(param_1,param_9,param_10,param_12);
        return lVar6;
      }
      return (ulonglong)uVar4 << 8;
    }
  } while( true );
}

