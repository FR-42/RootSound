
void FUN_140350100(longlong param_1,longlong param_2,undefined8 param_3,ushort param_4,
                  ushort param_5)

{
  float fVar1;
  char cVar2;
  bool bVar3;
  int iVar4;
  uint uVar5;
  longlong lVar6;
  byte bVar7;
  longlong lVar8;
  uint uVar9;
  ulonglong uVar10;
  longlong lVar11;
  ulonglong uVar12;
  byte bVar13;
  float fVar14;
  
  uVar9 = DAT_1409399a8;
  for (; param_4 <= param_5; param_4 = param_4 + 1) {
    bVar3 = false;
    bVar13 = 2 < uVar9;
    uVar5 = (uint)bVar13;
    if (bVar13 < uVar9) {
      uVar12 = (ulonglong)param_4;
      lVar8 = uVar12 * 0x3e;
      do {
        iVar4 = uVar5 - 1;
        if (iVar4 < 1) {
          iVar4 = 0;
        }
        lVar11 = (longlong)iVar4;
        fVar1 = *(float *)(param_2 + 0x14 + (lVar11 + lVar8) * 4);
        if (0.0 < fVar1) {
          fVar14 = 0.0;
          for (bVar7 = 1; bVar7 < 8; bVar7 = bVar7 + 1) {
            cVar2 = *(char *)(uVar12 * 0xf8 + (ulonglong)bVar7 + 0xd0 + param_2);
            if ((cVar2 == '\x11') || (cVar2 == '@')) {
              fVar14 = fVar14 + *(float *)(param_2 + 0x14 +
                                          (lVar11 + (ulonglong)bVar7 * 6 + lVar8) * 4);
            }
          }
          if (0.0 < fVar14) {
            for (bVar7 = 1; bVar7 < 8; bVar7 = bVar7 + 1) {
              uVar10 = (ulonglong)bVar7;
              cVar2 = *(char *)(uVar12 * 0xf8 + uVar10 + 0xd0 + param_2);
              if ((cVar2 == '\x11') || (cVar2 == '@')) {
                lVar6 = lVar11 + uVar10 * 6 + lVar8;
                *(float *)(param_2 + 0x14 + lVar6 * 4) =
                     (fVar1 * *(float *)(param_2 + 0x14 + (lVar11 + uVar10 * 6 + lVar8) * 4)) /
                     fVar14 + *(float *)(param_2 + 0x14 + lVar6 * 4);
              }
            }
            *(undefined4 *)(param_2 + 0x14 + (lVar11 + lVar8) * 4) = 0;
            uVar9 = DAT_1409399a8;
          }
          bVar3 = true;
        }
        bVar13 = bVar13 + 1;
        uVar5 = (uint)bVar13;
      } while (uVar5 < uVar9);
      if ((bVar3) &&
         ((*(short *)(param_1 + 0x14) != 0 || (*(char *)(uVar12 * 0xf8 + 0xd0 + param_2) != '\x12'))
         )) {
        *(undefined1 *)(uVar12 * 0xf8 + 0xd0 + param_2) = 0x7e;
        uVar9 = DAT_1409399a8;
      }
    }
  }
  return;
}

