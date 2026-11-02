
void FUN_140380410(int param_1)

{
  undefined8 uVar1;
  bool bVar2;
  undefined8 uVar3;
  undefined8 uVar4;
  undefined8 uVar5;
  undefined8 uVar6;
  float *pfVar7;
  bool bVar8;
  ushort *puVar9;
  ushort *puVar10;
  ushort *puVar11;
  uint *puVar12;
  ushort *puVar13;
  ushort *puVar14;
  longlong lVar15;
  ushort *puVar16;
  uint uVar17;
  int iVar18;
  ulonglong uVar20;
  ushort uVar21;
  int iVar22;
  longlong lVar23;
  ushort *puVar24;
  ushort uVar25;
  ulonglong uVar26;
  float fVar27;
  float fVar28;
  ushort local_res8 [4];
  ushort local_res10 [4];
  float local_res18 [2];
  float local_res20 [2];
  ulonglong uVar19;
  
  lVar23 = (longlong)param_1;
  uVar26 = 0;
  if ((&DAT_14098a5d8)[lVar23 * 0x1aade] != 0) {
    fVar28 = 0.0;
    uVar19 = uVar26;
    do {
      lVar15 = uVar19 * 0x90 + (&DAT_14098a5d0)[lVar23 * 0xd56f];
      if (fVar28 < *(float *)(lVar15 + 0xc)) {
        fVar28 = *(float *)(lVar15 + 0xc);
      }
      fVar27 = (float)FUN_140260930(lVar15,0xffffffff,0xffffffff,0);
      uVar17 = (int)uVar19 + 1;
      uVar19 = (ulonglong)uVar17;
      *(int *)(lVar15 + 0x28) = (int)(longlong)fVar27;
    } while (uVar17 < (uint)(&DAT_14098a5d8)[lVar23 * 0x1aade]);
    if (fVar28 != 0.0) {
      uVar25 = 0;
      local_res8[0] = 0;
      local_res10[0] = 0;
      local_res20[0] = 0.0;
      local_res18[0] = 0.0;
      uVar19 = uVar26;
      uVar21 = uVar25;
      do {
        iVar22 = (int)uVar19;
        if ((&DAT_1409ee730)[lVar23 * 0x355bc] != 0) {
          puVar16 = &DAT_1409c3730 + lVar23 * 0x355bc;
          uVar19 = uVar26;
          puVar24 = puVar16;
          do {
            iVar18 = (int)uVar19;
            uVar17 = (&DAT_14098a5d8)[lVar23 * 0x1aade];
            bVar8 = false;
            uVar25 = *puVar24;
            fVar27 = 0.0;
            if (uVar17 != 0) {
              uVar20 = (ulonglong)uVar17;
              puVar12 = (uint *)((&DAT_14098a5d0)[lVar23 * 0xd56f] + 0x28);
              do {
                if (*(ushort *)(*(longlong *)(puVar12 + 2) + 0x20) == uVar25) {
                  if ((*(byte *)(*(longlong *)(puVar12 + 2) + 0x21c) & 0x80) != 0) {
                    bVar8 = true;
                  }
                  fVar27 = fVar27 + (float)*puVar12;
                }
                puVar12 = puVar12 + 0x24;
                uVar20 = uVar20 - 1;
              } while (uVar20 != 0);
            }
            bVar2 = false;
            fVar27 = fVar27 / fVar28;
            if ((0x1e < uVar25) && ((uVar25 < 0x22 || (uVar25 == 0x24)))) {
              bVar2 = true;
            }
            puVar13 = local_res10;
            pfVar7 = local_res18;
            if (!bVar2) {
              puVar13 = local_res8;
              pfVar7 = local_res20;
            }
            if (iVar22 == 0) {
              if ((*pfVar7 <= fVar27 && fVar27 != *pfVar7) && (1 < uVar25)) {
                *pfVar7 = fVar27;
                *puVar13 = uVar25;
              }
            }
            else if (((!bVar8) && (*puVar13 != 0)) && ((fVar27 < 100.0 || (uVar25 == 0)))) {
              uVar20 = uVar26;
              if (uVar17 != 0) {
                do {
                  lVar15 = *(longlong *)((&DAT_14098a5d0)[lVar23 * 0xd56f] + 0x30 + uVar20 * 0x90);
                  if (*(ushort *)(lVar15 + 0x20) == uVar25) {
                    *(ushort *)(lVar15 + 0x20) = -(ushort)bVar2;
                  }
                  uVar17 = (int)uVar20 + 1;
                  uVar20 = (ulonglong)uVar17;
                } while (uVar17 < (uint)(&DAT_14098a5d8)[lVar23 * 0x1aade]);
              }
              uVar25 = (&DAT_1409ee730)[lVar23 * 0x355bc];
              puVar13 = puVar16;
              if (iVar18 < (int)(uVar25 - 1)) {
                do {
                  lVar15 = 2;
                  puVar9 = puVar13 + 0xac;
                  puVar10 = puVar13;
                  do {
                    puVar14 = puVar10;
                    puVar11 = puVar9;
                    uVar1 = *(undefined8 *)(puVar11 + 4);
                    uVar3 = *(undefined8 *)(puVar11 + 8);
                    uVar4 = *(undefined8 *)(puVar11 + 0xc);
                    *(undefined8 *)puVar14 = *(undefined8 *)puVar11;
                    *(undefined8 *)(puVar14 + 4) = uVar1;
                    uVar1 = *(undefined8 *)(puVar11 + 0x10);
                    uVar5 = *(undefined8 *)(puVar11 + 0x14);
                    *(undefined8 *)(puVar14 + 8) = uVar3;
                    *(undefined8 *)(puVar14 + 0xc) = uVar4;
                    uVar3 = *(undefined8 *)(puVar11 + 0x18);
                    uVar4 = *(undefined8 *)(puVar11 + 0x1c);
                    *(undefined8 *)(puVar14 + 0x10) = uVar1;
                    *(undefined8 *)(puVar14 + 0x14) = uVar5;
                    uVar1 = *(undefined8 *)(puVar11 + 0x20);
                    uVar5 = *(undefined8 *)(puVar11 + 0x24);
                    *(undefined8 *)(puVar14 + 0x18) = uVar3;
                    *(undefined8 *)(puVar14 + 0x1c) = uVar4;
                    uVar3 = *(undefined8 *)(puVar11 + 0x28);
                    uVar4 = *(undefined8 *)(puVar11 + 0x2c);
                    *(undefined8 *)(puVar14 + 0x20) = uVar1;
                    *(undefined8 *)(puVar14 + 0x24) = uVar5;
                    uVar1 = *(undefined8 *)(puVar11 + 0x30);
                    uVar5 = *(undefined8 *)(puVar11 + 0x34);
                    *(undefined8 *)(puVar14 + 0x28) = uVar3;
                    *(undefined8 *)(puVar14 + 0x2c) = uVar4;
                    uVar3 = *(undefined8 *)(puVar11 + 0x38);
                    uVar4 = *(undefined8 *)(puVar11 + 0x3c);
                    *(undefined8 *)(puVar14 + 0x30) = uVar1;
                    *(undefined8 *)(puVar14 + 0x34) = uVar5;
                    *(undefined8 *)(puVar14 + 0x38) = uVar3;
                    *(undefined8 *)(puVar14 + 0x3c) = uVar4;
                    lVar15 = lVar15 + -1;
                    puVar9 = puVar11 + 0x40;
                    puVar10 = puVar14 + 0x40;
                  } while (lVar15 != 0);
                  uVar1 = *(undefined8 *)(puVar11 + 0x44);
                  uVar17 = (int)uVar19 + 1;
                  uVar19 = (ulonglong)uVar17;
                  uVar3 = *(undefined8 *)(puVar11 + 0x48);
                  uVar4 = *(undefined8 *)(puVar11 + 0x4c);
                  *(undefined8 *)(puVar14 + 0x40) = *(undefined8 *)(puVar11 + 0x40);
                  *(undefined8 *)(puVar14 + 0x44) = uVar1;
                  uVar1 = *(undefined8 *)(puVar11 + 0x50);
                  uVar5 = *(undefined8 *)(puVar11 + 0x54);
                  *(undefined8 *)(puVar14 + 0x48) = uVar3;
                  *(undefined8 *)(puVar14 + 0x4c) = uVar4;
                  uVar3 = *(undefined8 *)(puVar11 + 0x58);
                  uVar4 = *(undefined8 *)(puVar11 + 0x5c);
                  *(undefined8 *)(puVar14 + 0x50) = uVar1;
                  *(undefined8 *)(puVar14 + 0x54) = uVar5;
                  uVar5 = *(undefined8 *)(puVar11 + 0x60);
                  uVar6 = *(undefined8 *)(puVar11 + 100);
                  uVar1 = *(undefined8 *)(puVar11 + 0x68);
                  *(undefined8 *)(puVar14 + 0x58) = uVar3;
                  *(undefined8 *)(puVar14 + 0x5c) = uVar4;
                  *(undefined8 *)(puVar14 + 0x60) = uVar5;
                  *(undefined8 *)(puVar14 + 100) = uVar6;
                  *(undefined8 *)(puVar14 + 0x68) = uVar1;
                  uVar25 = (&DAT_1409ee730)[lVar23 * 0x355bc];
                  puVar13 = puVar13 + 0xac;
                } while ((int)uVar17 < (int)(uVar25 - 1));
              }
              iVar18 = iVar18 + -1;
              puVar24 = puVar24 + -0xac;
              (&DAT_1409ee730)[lVar23 * 0x355bc] = uVar25 - 1;
              puVar16 = puVar16 + -0xac;
            }
            uVar19 = (ulonglong)(iVar18 + 1U);
            puVar24 = puVar24 + 0xac;
            puVar16 = puVar16 + 0xac;
            uVar25 = local_res8[0];
            uVar21 = local_res10[0];
          } while ((int)(iVar18 + 1U) < (int)(uint)(ushort)(&DAT_1409ee730)[lVar23 * 0x355bc]);
        }
        if (((iVar22 == 0) && (uVar25 == 0)) && (uVar21 == 0)) {
          return;
        }
        uVar19 = (ulonglong)(iVar22 + 1U);
      } while ((int)(iVar22 + 1U) < 2);
      if (((uVar25 != 0) || (uVar21 != 0)) && ((&DAT_14098a5d8)[lVar23 * 0x1aade] != 0)) {
        do {
          lVar15 = *(longlong *)((&DAT_14098a5d0)[lVar23 * 0xd56f] + 0x30 + uVar26 * 0x90);
          if (*(short *)(lVar15 + 0x20) == 0) {
            if (uVar25 != 0) {
              *(ushort *)(lVar15 + 0x20) = uVar25;
            }
          }
          else if ((*(short *)(lVar15 + 0x20) == -1) && (uVar21 != 0)) {
            *(ushort *)(lVar15 + 0x20) = uVar21;
          }
          uVar17 = (int)uVar26 + 1;
          uVar26 = (ulonglong)uVar17;
        } while (uVar17 < (uint)(&DAT_14098a5d8)[lVar23 * 0x1aade]);
      }
    }
  }
  return;
}

