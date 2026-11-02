
void FUN_14036a7f0(int *param_1,int param_2,int param_3,uint param_4,uint param_5,longlong param_6)

{
  byte bVar1;
  int iVar2;
  uint uVar3;
  longlong lVar4;
  ulonglong uVar5;
  longlong lVar6;
  ulonglong uVar7;
  int iVar8;
  longlong lVar9;
  longlong *plVar10;
  longlong lVar11;
  int iVar12;
  uint uVar13;
  int iVar14;
  
  if (param_1 != (int *)0x0) {
    iVar12 = *param_1;
    iVar14 = param_1[1];
    if (param_2 < iVar12) {
      param_2 = iVar12;
    }
    bVar1 = *(byte *)(param_1 + 0x18);
    iVar8 = iVar14 + -1;
    if (param_2 < iVar14) {
      iVar8 = param_2;
    }
    uVar13 = (uint)bVar1;
    if ((param_5 != 0) && (param_5 < bVar1)) {
      uVar13 = param_5;
    }
    iVar2 = param_3;
    if (param_3 == -1) {
      iVar2 = 0;
    }
    if (param_4 < uVar13) {
      lVar4 = (longlong)((iVar2 * (iVar14 - iVar12) - iVar12) + iVar8);
      lVar6 = (longlong)(iVar14 - iVar12);
      do {
        uVar5 = (ulonglong)param_4;
        iVar12 = *(byte *)((longlong)param_1 + uVar5 + 0x61) - 1;
        if ((param_3 != -1) && (param_3 < iVar12)) {
          iVar12 = param_3;
        }
        if (iVar2 <= iVar12) {
          lVar9 = lVar4;
          iVar14 = iVar2;
          if (3 < (iVar12 - iVar2) + 1) {
            uVar3 = ((iVar12 - iVar2) - 3U >> 2) + 1;
            uVar7 = (ulonglong)uVar3;
            iVar14 = uVar3 * 4 + iVar2;
            do {
              plVar10 = *(longlong **)(param_1 + uVar5 * 2 + 0x26);
              if (param_6 != 0) {
                *(float *)(param_6 + uVar5 * 4) =
                     (float)*(ushort *)(*plVar10 + lVar9 * 2) + *(float *)(param_6 + uVar5 * 4);
                plVar10 = *(longlong **)(param_1 + uVar5 * 2 + 0x26);
              }
              if (param_6 != 0) {
                *(float *)(param_6 + uVar5 * 4) =
                     (float)*(ushort *)(*plVar10 + (lVar9 + lVar6) * 2) +
                     *(float *)(param_6 + uVar5 * 4);
              }
              lVar9 = lVar9 + lVar6 + lVar6;
              if (param_6 != 0) {
                *(float *)(param_6 + uVar5 * 4) =
                     (float)*(ushort *)(**(longlong **)(param_1 + uVar5 * 2 + 0x26) + lVar9 * 2) +
                     *(float *)(param_6 + uVar5 * 4);
              }
              lVar9 = lVar9 + lVar6;
              if (param_6 != 0) {
                *(float *)(param_6 + uVar5 * 4) =
                     (float)*(ushort *)(**(longlong **)(param_1 + uVar5 * 2 + 0x26) + lVar9 * 2) +
                     *(float *)(param_6 + uVar5 * 4);
              }
              lVar9 = lVar9 + lVar6;
              uVar7 = uVar7 - 1;
            } while (uVar7 != 0);
          }
          if (iVar14 <= iVar12) {
            lVar9 = lVar9 * 2;
            lVar11 = (longlong)((iVar12 - iVar14) + 1);
            do {
              if (param_6 != 0) {
                *(float *)(param_6 + uVar5 * 4) =
                     (float)*(ushort *)(**(longlong **)(param_1 + uVar5 * 2 + 0x26) + lVar9) +
                     *(float *)(param_6 + uVar5 * 4);
              }
              lVar9 = lVar9 + lVar6 * 2;
              lVar11 = lVar11 + -1;
            } while (lVar11 != 0);
          }
        }
        param_4 = param_4 + 1;
      } while (param_4 < uVar13);
    }
    return;
  }
  return;
}

