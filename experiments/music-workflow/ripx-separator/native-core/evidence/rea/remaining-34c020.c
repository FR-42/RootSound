
longlong FUN_14034c020(undefined8 param_1,undefined8 param_2,ushort *param_3,int param_4,int param_5
                      ,longlong param_6,ushort param_7,longlong param_8,ushort *param_9,
                      ushort *param_10,float *param_11,undefined2 param_12,undefined2 param_13,
                      ushort param_14,int param_15,undefined8 param_16)

{
  char cVar1;
  ulonglong uVar2;
  uint7 uVar4;
  longlong lVar3;
  ushort uVar5;
  ushort uVar6;
  ulonglong uVar7;
  uint uVar8;
  uint uVar9;
  uint uVar10;
  ushort uVar11;
  ushort uVar12;
  float fVar13;
  float fVar14;
  float fVar15;
  
  uVar5 = *param_3;
  uVar8 = (uint)uVar5;
  uVar10 = param_7 - 1;
  fVar14 = 0.0;
  uVar9 = (uint)uVar5;
  if (uVar9 == 0) {
    uVar5 = 0;
  }
  uVar2 = (ulonglong)uVar5;
  fVar13 = 0.0;
  if ((int)uVar10 <= (int)uVar9) {
    uVar8 = uVar10;
  }
  while( true ) {
    fVar15 = fVar13;
    uVar6 = param_14;
    uVar12 = param_14;
    uVar11 = param_14;
    if ((int)uVar8 < (int)uVar2) break;
    uVar7 = (ulonglong)(ushort)((short)uVar2 + 1);
    fVar13 = *(float *)((longlong)
                        (int)(((DAT_140989fe4 - param_15) + param_4) * (uint)param_7 + (int)uVar2) *
                        0x410 + param_6) - *(float *)(param_8 + uVar2 * 4);
    uVar2 = uVar7;
    if (fVar13 <= fVar15) {
      fVar13 = fVar15;
    }
  }
  while( true ) {
    uVar2 = (ulonglong)*param_3;
    if ((int)uVar10 <= (int)(uint)*param_3) {
      uVar2 = (ulonglong)uVar10;
    }
    if ((int)uVar2 < (int)(uint)uVar5) break;
    cVar1 = FUN_14034bb60(param_1,param_2,uVar5,param_4,param_5,param_6,param_7,param_8,param_9,
                          param_10,param_11,param_12,param_13,fVar15,param_15,param_16);
    if ((cVar1 != '\0') &&
       (((fVar14 == 0.0 && (param_4 == param_5)) ||
        ((2.0 < *param_11 &&
         (((fVar14 == 0.0 ||
           ((int)((uint)uVar6 - (uint)uVar12) < (int)((uint)*param_10 - (uint)*param_9))) ||
          (((uint)*param_10 - (uint)*param_9 == (uint)uVar6 - (uint)uVar12 && (fVar14 < *param_11)))
          ))))))) {
      fVar14 = *param_11;
      if (fVar14 <= 2.0) {
        fVar14 = 2.0;
      }
      uVar12 = *param_9;
      uVar6 = *param_10;
      uVar11 = uVar5;
    }
    uVar5 = uVar5 + 1;
  }
  uVar4 = (uint7)(uVar2 >> 8);
  if (fVar14 == 0.0) {
    lVar3 = (ulonglong)uVar4 << 8;
  }
  else {
    *param_9 = uVar12;
    *param_10 = uVar6;
    *param_11 = fVar14;
    if ((char)param_14 != '\0') {
      *param_3 = uVar11;
    }
    lVar3 = CONCAT71(uVar4,1);
  }
  return lVar3;
}

