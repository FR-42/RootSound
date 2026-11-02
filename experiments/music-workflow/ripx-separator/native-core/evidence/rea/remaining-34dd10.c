
void FUN_14034dd10(longlong param_1,ushort param_2,uint param_3,undefined8 param_4,int param_5,
                  int param_6,longlong param_7,int *param_8,longlong param_9,ushort *param_10)

{
  ushort uVar1;
  uint uVar2;
  int iVar3;
  ulonglong uVar4;
  longlong lVar5;
  longlong *plVar6;
  ulonglong uVar7;
  ushort uVar8;
  ushort uVar9;
  longlong *plVar10;
  
  uVar7 = (ulonglong)param_6;
  plVar10 = (longlong *)((longlong)param_5 * 0x38 + param_7);
  plVar6 = (longlong *)(uVar7 * 0x38 + param_7);
  if (((uint)*(ushort *)((longlong)plVar10 + 0x14) < *(uint *)(param_1 + 0xc)) ||
     (*(uint *)(param_1 + 0xc) <= (uint)*(ushort *)((longlong)plVar6 + 0x14))) {
    uVar4 = 0;
    if (*param_10 != 0) {
      do {
        if (*(int *)(uVar4 * 0x38 + 0x30 + param_9) == (int)plVar6[6]) {
          *(int *)(uVar4 * 0x38 + 0x30 + param_9) = (int)plVar10[6];
        }
        uVar2 = (int)uVar4 + 1;
        uVar4 = (ulonglong)uVar2;
      } while (uVar2 < *param_10);
    }
  }
  else {
    uVar4 = 0;
    *(char *)(plVar10 + 4) = (char)plVar6[4];
    *(int *)(plVar10 + 6) = (int)plVar6[6];
    if (*param_10 != 0) {
      do {
        if (*(int *)(uVar4 * 0x38 + 0x30 + param_9) == (int)plVar10[6]) {
          *(int *)(uVar4 * 0x38 + 0x30 + param_9) = (int)plVar6[6];
        }
        uVar2 = (int)uVar4 + 1;
        uVar4 = (ulonglong)uVar2;
      } while (uVar2 < *param_10);
    }
  }
  uVar1 = *(ushort *)(plVar6 + 2);
  if (*(ushort *)(plVar10 + 2) <= *(ushort *)(plVar6 + 2)) {
    uVar1 = *(ushort *)(plVar10 + 2);
  }
  *(ushort *)(plVar10 + 2) = uVar1;
  uVar1 = *(ushort *)((longlong)plVar6 + 0x12);
  if (*(ushort *)((longlong)plVar6 + 0x12) <= *(ushort *)((longlong)plVar10 + 0x12)) {
    uVar1 = *(ushort *)((longlong)plVar10 + 0x12);
  }
  *(ushort *)((longlong)plVar10 + 0x12) = uVar1;
  uVar1 = *(ushort *)((longlong)plVar6 + 0x14);
  if (*(ushort *)((longlong)plVar10 + 0x14) <= *(ushort *)((longlong)plVar6 + 0x14)) {
    uVar1 = *(ushort *)((longlong)plVar10 + 0x14);
  }
  *(ushort *)((longlong)plVar10 + 0x14) = uVar1;
  uVar1 = *(ushort *)((longlong)plVar6 + 0x16);
  if (*(ushort *)((longlong)plVar6 + 0x16) <= *(ushort *)((longlong)plVar10 + 0x16)) {
    uVar1 = *(ushort *)((longlong)plVar10 + 0x16);
  }
  *(ushort *)((longlong)plVar10 + 0x16) = uVar1;
  uVar2 = param_3;
  if ((int)param_3 < (int)(uint)*(ushort *)((longlong)plVar6 + 0x14)) {
    uVar2 = (uint)*(ushort *)((longlong)plVar6 + 0x14);
  }
  if ((int)uVar2 <= (int)(uint)*(ushort *)((longlong)plVar6 + 0x16)) {
    uVar1 = *(ushort *)((longlong)plVar6 + 0x12);
    do {
      if (*(ushort *)(plVar6 + 2) <= uVar1) {
        uVar8 = *(ushort *)(plVar6 + 2);
        do {
          uVar9 = uVar8 + 1;
          lVar5 = (longlong)(int)((uint)uVar8 + (uVar2 - param_3) * (uint)param_2);
          *(float *)(*plVar10 + lVar5 * 4) =
               *(float *)(*plVar6 + lVar5 * 4) + *(float *)(*plVar10 + lVar5 * 4);
          uVar1 = *(ushort *)((longlong)plVar6 + 0x12);
          uVar8 = uVar9;
        } while (uVar9 <= uVar1);
      }
      uVar2 = uVar2 + 1;
    } while ((int)uVar2 <= (int)(uint)*(ushort *)((longlong)plVar6 + 0x16));
  }
  free((void *)*plVar6);
  iVar3 = *param_8;
  if (param_6 < iVar3 + -1) {
    do {
      uVar2 = (int)uVar7 + 1;
      uVar7 = (ulonglong)uVar2;
      *plVar6 = plVar6[7];
      plVar6[1] = plVar6[8];
      plVar6[2] = plVar6[9];
      plVar6[3] = plVar6[10];
      plVar6[4] = plVar6[0xb];
      plVar6[5] = plVar6[0xc];
      plVar6[6] = plVar6[0xd];
      plVar6 = plVar6 + 7;
      iVar3 = *param_8;
    } while ((int)uVar2 < iVar3 + -1);
  }
  *param_8 = iVar3 + -1;
  return;
}

