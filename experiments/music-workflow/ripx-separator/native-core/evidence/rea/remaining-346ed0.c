
void FUN_140346ed0(longlong param_1,undefined8 param_2,int param_3,int param_4,undefined4 param_5,
                  longlong param_6,char param_7,char param_8)

{
  undefined4 uVar1;
  int iVar2;
  undefined4 *_Dst;
  int iVar3;
  byte bVar4;
  float fVar5;
  double dVar6;
  
  bVar4 = 2 < DAT_1409399a8;
  if (bVar4 < DAT_1409399a8) {
    do {
      _Dst = (undefined4 *)((ulonglong)bVar4 * 0x230 + param_6);
      memset(_Dst,0,0x230);
      if (param_7 == '\0') {
        uVar1 = FUN_14031b7a0(param_1,param_5,1);
      }
      else {
        uVar1 = 0xffffffff;
      }
      _Dst[0x8a] = uVar1;
      *(byte *)(_Dst + 0x8b) = bVar4;
      iVar3 = (int)(((double)DAT_14098a1a8 + (double)DAT_14098a1a8) * 1.0833333333333333);
      iVar2 = ((param_3 - param_4) * DAT_14098a1a8 + (int)DAT_14098a1a8 / 2) - iVar3 / 2;
      if (iVar2 < 1) {
        iVar2 = 0;
      }
      _Dst[0x86] = iVar2;
      iVar3 = iVar3 + iVar2;
      iVar2 = (*(int *)(param_1 + 0x24) + *(int *)(param_1 + 0x28) * 2) * DAT_14098a1a8;
      if (iVar2 <= iVar3) {
        iVar3 = iVar2;
      }
      _Dst[0x87] = iVar3;
      memset(_Dst + 6,0,0x200);
      *_Dst = param_5;
      FUN_14031b830(param_1,param_2,param_3 - param_4,_Dst,0,0,0,0xbf800000);
      fVar5 = (float)_Dst[4] * 1.0833334;
      _Dst[4] = fVar5;
      if ((DAT_140989f11 != '\0') && (fVar5 < 8.0)) {
        fVar5 = 0.0;
        _Dst[4] = 0;
      }
      if (param_8 != '\0') {
        if (0.0 < fVar5) {
          dVar6 = pow((double)fVar5 / 32767.0,0.6020599913);
          fVar5 = (float)dVar6 * 32767.0;
        }
        else {
          fVar5 = 0.0;
        }
        _Dst[4] = fVar5;
      }
      bVar4 = bVar4 + 1;
    } while (bVar4 < DAT_1409399a8);
  }
  return;
}

