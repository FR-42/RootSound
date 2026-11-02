
ulonglong FUN_14034ba00(longlong param_1,ushort *param_2,ushort *param_3,ushort param_4,
                       ushort param_5,longlong param_6)

{
  ushort uVar1;
  ushort uVar2;
  int iVar3;
  int iVar4;
  ulonglong uVar5;
  int iVar6;
  uint uVar7;
  uint uVar8;
  
  uVar7 = (uint)param_5;
  uVar1 = *param_2;
  uVar8 = (uint)param_4;
  iVar3 = (int)((float)(int)((uVar7 - uVar8) + 1) * 0.5 + 0.5);
  iVar6 = 1;
  if (1 < iVar3) {
    iVar6 = iVar3;
  }
  uVar5 = (ulonglong)(uVar8 + iVar6);
  if ((int)(uint)uVar1 <= (int)(uVar8 + iVar6)) {
    uVar2 = *param_3;
    uVar5 = (ulonglong)(uVar7 - iVar6);
    if (((int)(uVar7 - iVar6) <= (int)(uint)uVar2) &&
       ((*(char *)(param_1 + 0x92) == '\0' ||
        (((1000.0 <= (float)*(ushort *)(param_6 + 0x14) * 500.0 ||
          (uVar5 = (ulonglong)(uVar7 + iVar6), (int)(uint)uVar2 <= (int)(uVar7 + iVar6))) &&
         (((float)*(ushort *)(param_6 + 0x16) * 500.0 <= 1500.0 ||
          (uVar5 = (ulonglong)(uVar8 - iVar6), (int)(uVar8 - iVar6) <= (int)(uint)uVar1)))))))) {
      iVar3 = (int)((float)uVar8 * 0.125 + 0.5);
      iVar6 = 1;
      if (1 < iVar3) {
        iVar6 = iVar3;
      }
      iVar4 = (int)((float)param_5 * 0.125 + 0.5);
      iVar3 = 1;
      if (1 < iVar4) {
        iVar3 = iVar4;
      }
      if ((int)(uint)uVar1 < (int)(uVar8 - iVar6)) {
        *param_2 = param_4;
        uVar2 = *param_3;
      }
      if ((int)((uint)param_5 + iVar3) < (int)(uint)uVar2) {
        *param_3 = param_5;
      }
      return CONCAT71((uint7)(byte)(uVar2 >> 8),1);
    }
  }
  return uVar5 & 0xffffffffffffff00;
}

