
undefined8 FUN_14037c3e0(float *param_1,float *param_2,float param_3)

{
  byte bVar1;
  byte bVar2;
  byte bVar3;
  float *pfVar4;
  byte bVar5;
  byte bVar6;
  ulonglong uVar7;
  byte bVar8;
  float fVar9;
  float fVar10;
  float fVar11;
  undefined1 auVar12 [16];
  undefined1 auVar13 [16];
  float fVar14;
  float fVar15;
  float fVar16;
  float fVar17;
  undefined8 extraout_XMM0_Qb;
  
  bVar1 = *(byte *)param_2;
  if (bVar1 != 0) {
    uVar7 = (ulonglong)bVar1;
    pfVar4 = param_2;
    fVar17 = 0.0;
    do {
      pfVar4 = pfVar4 + 1;
      fVar15 = *pfVar4;
      if (*pfVar4 <= fVar17) {
        fVar15 = fVar17;
      }
      uVar7 = uVar7 - 1;
      fVar17 = fVar15;
    } while (uVar7 != 0);
  }
  bVar2 = *(byte *)param_1;
  fVar17 = -1.0;
  bVar8 = 0;
  do {
    bVar6 = 6;
    if (bVar2 < 6) {
      bVar6 = bVar2;
    }
    if (bVar6 <= bVar8) {
      bVar8 = 0;
      pfVar4 = param_2;
      if (bVar2 <= bVar1) {
        pfVar4 = param_1;
      }
      fVar15 = 0.0;
      fVar16 = 0.0;
      for (; bVar8 < *(byte *)pfVar4; bVar8 = bVar8 + 1) {
        fVar9 = param_1[(ulonglong)bVar8 + 1];
        fVar11 = param_2[(ulonglong)bVar8 + 1];
        if ((fVar9 != 0.0) && (fVar11 != 0.0)) {
          if (fVar11 <= fVar9) {
            fVar11 = fVar9;
          }
          fVar14 = param_1[(ulonglong)bVar8 + 0x31] - param_2[(ulonglong)bVar8 + 0x31];
          fVar9 = 6.2831855 / (float)(bVar8 + 1);
          if (fVar14 <= fVar9 * 0.5) {
            if (fVar14 < -fVar9 * 0.5) {
              fVar14 = fVar14 + fVar9;
            }
          }
          else {
            fVar14 = fVar14 - fVar9;
          }
          if (fVar14 < 0.0) {
            fVar14 = -fVar14;
          }
          fVar16 = fVar16 + fVar11;
          fVar15 = fVar15 + (fVar14 / fVar9) * fVar11;
        }
      }
      if (fVar16 != 0.0) {
        fVar15 = fVar15 / fVar16;
      }
      auVar12._0_8_ = FUN_140387c00();
      auVar12._8_8_ = extraout_XMM0_Qb;
      auVar13._4_12_ = auVar12._4_12_;
      auVar13._0_4_ =
           (float)auVar12._0_8_ * ((param_3 * 1.2 - fVar17 * (fVar15 + 1.0)) / (param_3 * 1.2));
      return auVar13._0_8_;
    }
    fVar15 = param_1[(ulonglong)bVar8 + 1];
    if (fVar15 == 0.0) {
      fVar16 = param_2[(ulonglong)bVar8 + 1];
      if (32767.0 <= fVar16) {
        fVar16 = 32767.0;
      }
      else if (fVar16 <= 0.0) {
        fVar16 = 0.0;
      }
      fVar9 = (float)FUN_1403883b0();
      if (fVar9 - 50.0 < (float)(&DAT_1549b10b0)[(longlong)fVar16 & 0xffffffff] ||
          fVar9 - 50.0 == (float)(&DAT_1549b10b0)[(longlong)fVar16 & 0xffffffff])
      goto LAB_14037c523;
    }
    else {
LAB_14037c523:
      if (bVar8 < bVar1) {
        fVar16 = param_2[(ulonglong)bVar8 + 1];
      }
      else {
        fVar16 = 0.0;
      }
      if ((fVar15 != 0.0) && (fVar16 != 0.0)) {
        bVar6 = 0;
        pfVar4 = param_2;
        if (bVar1 <= bVar2) {
          pfVar4 = param_1;
        }
        bVar3 = *(byte *)pfVar4;
        fVar9 = 0.0;
        while( true ) {
          bVar5 = 0x10;
          if (bVar3 < 0x10) {
            bVar5 = bVar3;
          }
          if (bVar5 <= bVar6) break;
          fVar11 = param_1[(ulonglong)bVar6 + 1];
          if (fVar11 == 0.0) {
            fVar14 = param_2[(ulonglong)bVar6 + 1];
            if (32767.0 <= fVar14) {
              fVar14 = 32767.0;
            }
            else if (fVar14 <= 0.0) {
              fVar14 = 0.0;
            }
            fVar10 = (float)FUN_1403883b0();
            if (fVar10 - 50.0 < (float)(&DAT_1549b10b0)[(longlong)fVar14 & 0xffffffff] ||
                fVar10 - 50.0 == (float)(&DAT_1549b10b0)[(longlong)fVar14 & 0xffffffff])
            goto LAB_14037c5da;
LAB_14037c644:
            bVar6 = bVar6 + 1;
          }
          else {
LAB_14037c5da:
            fVar14 = 1.0;
            if (7 < bVar6) {
              fVar14 = 1.0 / (float)(bVar6 - 6);
            }
            if (bVar1 <= bVar6) {
LAB_14037c63c:
              fVar9 = fVar9 + fVar11 * fVar14;
              goto LAB_14037c644;
            }
            fVar10 = (fVar15 / fVar16) * param_2[(ulonglong)bVar6 + 1];
            if (bVar6 < bVar2) {
              if (fVar11 <= fVar10) {
                fVar11 = fVar10 - fVar11;
                goto LAB_14037c63c;
              }
              bVar6 = bVar6 + 1;
              fVar9 = fVar9 + (fVar11 - fVar10) * fVar14;
            }
            else {
              bVar6 = bVar6 + 1;
              fVar9 = fVar9 + fVar10 * fVar14;
            }
          }
        }
        if ((fVar17 == -1.0) || (fVar9 < fVar17)) {
          fVar17 = fVar9;
        }
      }
    }
    bVar8 = bVar8 + 1;
  } while( true );
}

