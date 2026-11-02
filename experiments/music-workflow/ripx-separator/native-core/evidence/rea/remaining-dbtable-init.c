
void FUN_140365a30(void)

{
  ulonglong uVar1;
  uint uVar2;
  int iVar3;
  uint uVar4;
  int iVar5;
  ulonglong uVar6;
  float *pfVar7;
  uint uVar8;
  double dVar9;
  float fVar10;
  float fVar11;
  float fVar12;
  float fVar13;
  
  uVar8 = (uint)DAT_140939700;
  dVar9 = 0.0;
  iVar3 = 0;
  do {
    uVar2 = 0;
    iVar5 = 0x14;
    fVar13 = (float)(dVar9 + 90.0);
    pfVar7 = (float *)(&DAT_1549d1100 + ((longlong)(0.0 - dVar9) & 0xffffffffU) * 60000);
    uVar4 = uVar8;
    do {
      for (; ((int)uVar4 <= iVar5 && (uVar2 < 0x29)); uVar2 = uVar2 + 1) {
        uVar4 = uVar2 + 2;
        uVar4 = (uint)*(ushort *)(&DAT_1409396f0 + (ulonglong)uVar4 * 0x10);
      }
      uVar1 = (ulonglong)uVar2;
      uVar6 = (ulonglong)(uVar2 + 1);
      uVar4 = (uint)*(ushort *)(&DAT_1409396f0 + uVar6 * 0x10);
      fVar12 = (float)uVar4 - (float)iVar5;
      fVar10 = (float)iVar5 - (float)*(ushort *)(&DAT_1409396f0 + uVar1 * 0x10);
      fVar11 = (float)(int)(uVar4 - *(ushort *)(&DAT_1409396f0 + uVar1 * 0x10));
      fVar10 = powf(10.0,((((fVar12 * *(float *)(&DAT_1409396f8 + uVar1 * 0x10)) / fVar11 +
                           (fVar10 * *(float *)(&DAT_1409396f8 + uVar6 * 0x10)) / fVar11) * fVar13 +
                           (fVar12 * *(float *)(&DAT_1409396f4 + uVar1 * 0x10)) / fVar11 +
                           (fVar10 * *(float *)(&DAT_1409396f4 + uVar6 * 0x10)) / fVar11 +
                          ((fVar12 * *(float *)(&DAT_1409396fc + uVar1 * 0x10)) / fVar11 +
                          (fVar10 * *(float *)(&DAT_1409396fc + uVar6 * 0x10)) / fVar11) * fVar13 *
                          fVar13) - fVar13) / 20.0);
      *pfVar7 = fVar10;
      iVar5 = iVar5 + 1;
      pfVar7 = pfVar7 + 1;
    } while (iVar5 < 15000);
    dVar9 = dVar9 + -1.0;
  } while (-90.0 <= dVar9);
  pfVar7 = (float *)&DAT_1549b10b0;
  do {
    if (iVar3 == 0) {
      fVar13 = -90.0;
    }
    else {
      dVar9 = log10((double)iVar3 * 3.0517578125e-05);
      fVar13 = (float)(dVar9 * 20.0);
    }
    *pfVar7 = fVar13;
    iVar3 = iVar3 + 1;
    pfVar7 = pfVar7 + 1;
  } while (iVar3 < 0x8000);
  return;
}

