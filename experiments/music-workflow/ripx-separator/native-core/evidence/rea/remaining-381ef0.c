
void FUN_140381ef0(undefined2 *param_1,longlong param_2,longlong param_3)

{
  float fVar1;
  float fVar2;
  uint uVar3;
  uint uVar4;
  uint uVar5;
  uint uVar6;
  ulonglong uVar7;
  uint uVar8;
  undefined2 *puVar9;
  float fVar10;
  float fVar11;
  float fVar12;
  float fVar13;
  
  puVar9 = param_1 + 1;
  uVar6 = 0;
  *(undefined4 *)(param_1 + 2) = 0;
  *(undefined1 *)puVar9 = 0;
  *(undefined1 *)((longlong)param_1 + 3) = 0;
  *param_1 = 0;
  *(undefined8 *)(param_1 + 8) = 0xffff;
  *(undefined8 *)(param_1 + 0xc) = 0xffff;
  *(undefined8 *)(param_1 + 0x10) = 0xffff;
  *(undefined8 *)(param_1 + 0x14) = 0xffff;
  *(undefined8 *)(param_1 + 0x18) = 0xffff;
  *(undefined8 *)(param_1 + 0x1c) = 0xffff;
  *(undefined8 *)(param_1 + 4) = 0xffff;
  while( true ) {
    fVar10 = 0.0;
    fVar13 = 0.0;
    uVar7 = (ulonglong)(-(uint)(uVar6 != 0) & 0xffff);
    uVar5 = 2;
    do {
      uVar3 = uVar5 - 2;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        fVar10 = fVar12;
      }
      else {
        uVar3 = (uint)uVar7;
      }
      uVar4 = uVar5 - 1;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar4 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar4 * 4);
        uVar3 = uVar4;
        fVar10 = fVar12;
      }
      fVar12 = *(float *)(param_2 + (ulonglong)uVar5 * 4);
      fVar11 = fVar10;
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar5 * 4);
        fVar11 = fVar12;
      }
      uVar4 = uVar5 + 1;
      fVar1 = *(float *)(param_2 + (ulonglong)uVar4 * 4);
      uVar8 = uVar5;
      if (fVar12 <= fVar10) {
        uVar8 = uVar3;
      }
      fVar10 = fVar11;
      if (fVar11 < fVar1) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar4 * 4);
        fVar10 = fVar1;
      }
      uVar3 = uVar5 + 2;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar1 <= fVar11) {
        uVar4 = uVar8;
      }
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 3;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 4;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 5;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 6;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 7;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 8;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 9;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 10;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0xb;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0xc;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0xd;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0xe;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0xf;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x10;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x11;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x12;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x13;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x14;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x15;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x16;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x17;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x18;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x19;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        uVar4 = uVar3;
        fVar10 = fVar12;
      }
      uVar3 = uVar5 + 0x1a;
      fVar12 = *(float *)(param_2 + (ulonglong)uVar3 * 4);
      fVar11 = fVar10;
      if (fVar10 < fVar12) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar3 * 4);
        fVar11 = fVar12;
      }
      uVar8 = uVar5 + 0x1b;
      fVar1 = *(float *)(param_2 + (ulonglong)uVar8 * 4);
      if (fVar12 <= fVar10) {
        uVar3 = uVar4;
      }
      fVar12 = fVar11;
      if (fVar11 < fVar1) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar8 * 4);
        fVar12 = fVar1;
      }
      uVar4 = uVar5 + 0x1c;
      fVar2 = *(float *)(param_2 + (ulonglong)uVar4 * 4);
      if (fVar1 <= fVar11) {
        uVar8 = uVar3;
      }
      fVar10 = fVar12;
      if (fVar12 < fVar2) {
        fVar13 = *(float *)(param_3 + (ulonglong)uVar4 * 4);
        fVar10 = fVar2;
      }
      uVar7 = (ulonglong)(uVar5 + 0x1d);
      fVar11 = *(float *)(param_2 + uVar7 * 4);
      if (fVar2 <= fVar12) {
        uVar4 = uVar8;
      }
      if (fVar10 < fVar11) {
        fVar13 = *(float *)(param_3 + uVar7 * 4);
        fVar10 = fVar11;
      }
      else {
        uVar7 = (ulonglong)uVar4;
      }
      uVar3 = uVar5 + 0x1e;
      uVar5 = uVar5 + 0x20;
    } while (uVar3 < 0x80);
    if (fVar10 < 0.1) break;
    *(float *)(puVar9 + 1) = fVar10;
    *(undefined1 *)((longlong)puVar9 + 1) = 0;
    uVar6 = uVar6 + 1;
    puVar9[-1] = (short)uVar7;
    *(char *)puVar9 = (char)(int)(fVar13 + 0.5);
    puVar9 = puVar9 + 4;
    *(undefined4 *)(param_2 + uVar7 * 4) = 0;
    *(undefined4 *)(param_3 + uVar7 * 4) = 0;
    if (7 < uVar6) {
      return;
    }
  }
  return;
}

