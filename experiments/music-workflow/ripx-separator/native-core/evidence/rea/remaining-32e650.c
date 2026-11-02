
int FUN_14032e650(longlong param_1,longlong param_2,undefined8 *param_3,undefined2 *param_4)

{
  ushort uVar1;
  longlong lVar2;
  longlong lVar3;
  longlong lVar4;
  int iVar5;
  int iVar6;
  longlong lVar7;
  longlong lVar8;
  
  lVar4 = FUN_14032db40(param_1,param_2,5);
  if (lVar4 != 0) {
    iVar5 = *(int *)(param_2 + 0xc) - DAT_140989fe4;
    lVar2 = *(longlong *)(param_2 + 0x5a0);
    lVar3 = *(longlong *)(param_2 + 0x598);
    if (iVar5 < *(int *)(lVar4 + 0x24) + iVar5) {
      lVar8 = 0;
      iVar6 = iVar5;
      do {
        uVar1 = *(ushort *)(lVar8 + *(longlong *)(lVar4 + 0x40));
        *(ushort *)(lVar8 + lVar2) = uVar1;
        lVar7 = (ulonglong)(uint)((iVar6 - iVar5) * 0x1d0) * 0xf8;
        memcpy((void *)(lVar7 + lVar3),(void *)(*(longlong *)(lVar4 + 0x38) + lVar7),
               (ulonglong)uVar1 * 0xf8);
        lVar8 = lVar8 + 2;
        iVar6 = iVar6 + 1;
      } while (iVar6 < *(int *)(lVar4 + 0x24) + iVar5);
    }
    *param_3 = *(undefined8 *)(lVar4 + 0x58);
    *param_4 = *(undefined2 *)(lVar4 + 0x60);
    ReleaseMutex(*(HANDLE *)(param_1 + 0x58));
    iVar5 = *(int *)(lVar4 + 0x24) + iVar5;
    if (iVar5 <= *(int *)(param_2 + 0xc)) {
      iVar5 = *(int *)(param_2 + 0xc);
    }
    return iVar5;
  }
  return *(int *)(param_2 + 0xc);
}

