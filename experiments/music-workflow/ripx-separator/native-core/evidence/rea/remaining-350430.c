
void FUN_140350430(undefined8 param_1,longlong param_2,undefined8 param_3,ushort param_4,
                  ushort param_5,longlong param_6,uint param_7,uint param_8,int param_9,
                  char param_10)

{
  longlong lVar1;
  float fVar2;
  ushort uVar3;
  longlong lVar4;
  longlong lVar5;
  longlong lVar6;
  bool bVar7;
  bool bVar8;
  int iVar9;
  longlong lVar10;
  ulonglong uVar11;
  ulonglong uVar12;
  byte bVar13;
  int iVar14;
  uint uVar15;
  uint uVar16;
  uint uVar17;
  int iVar18;
  ulonglong uVar19;
  longlong lVar20;
  byte bVar21;
  ushort uVar22;
  uint uVar23;
  float *pfVar24;
  longlong lVar25;
  ushort *puVar26;
  uint uVar27;
  float fVar28;
  int local_8c;
  ulonglong local_60;
  ulonglong local_58;
  
  lVar4 = *(longlong *)(param_2 + 0x598);
  uVar17 = 0;
  lVar5 = *(longlong *)(param_2 + 0x5a0);
  for (bVar21 = 2; bVar21 < 8; bVar21 = bVar21 + 1) {
    uVar17 = uVar17 | 1 << (bVar21 & 0x1f);
  }
  local_58 = (ulonglong)param_7;
  if (param_7 != 0) {
    puVar26 = (ushort *)(param_6 + 0x12);
    local_60 = local_58;
    do {
      uVar16 = 0;
      if (((((char)puVar26[7] != '\0') && (*(longlong *)(puVar26 + -9) != 0)) &&
          ((char)puVar26[7] == '\x11')) && (*(int *)(puVar26 + 0xf) != 0)) {
        bVar7 = false;
        bVar21 = 2;
        bVar8 = false;
        local_8c = 1;
        do {
          uVar23 = param_8;
          if ((int)param_8 < (int)(uint)puVar26[1]) {
            uVar23 = (uint)puVar26[1];
          }
          if ((int)uVar23 <= (int)(uint)puVar26[2]) {
            bVar7 = bVar8;
            do {
              uVar22 = puVar26[-1];
              iVar14 = DAT_140989fe4 + (uVar23 - *(int *)(param_2 + 0xc));
              lVar25 = (ulonglong)(uint)(iVar14 * 0x1d0) * 0xf8 + lVar4;
              if (uVar22 <= *puVar26) {
                do {
                  uVar15 = (uint)uVar22;
                  lVar6 = *(longlong *)(puVar26 + -9);
                  lVar10 = (longlong)(int)((uVar23 - param_8) * (uint)param_4 + uVar15);
                  if (0.0 < *(float *)(lVar6 + lVar10 * 4)) {
                    uVar27 = (uVar15 + 1) * (uint)param_5;
                    iVar18 = param_5 * uVar15;
                    lVar20 = (longlong)iVar18 * 0x3e;
                    pfVar24 = (float *)((longlong)iVar18 * 0xf8 + lVar25);
                    while( true ) {
                      uVar3 = *(ushort *)(lVar5 + (longlong)iVar14 * 2);
                      uVar15 = (uint)uVar3;
                      if ((int)uVar27 <= (int)(uint)uVar3) {
                        uVar15 = uVar27;
                      }
                      if ((int)uVar15 <= iVar18) break;
                      if (500.0 < *pfVar24) {
                        if (DAT_1409399a8 == 1) {
                          fVar28 = pfVar24[5];
                        }
                        else {
                          fVar28 = (pfVar24[6] + pfVar24[5]) * 0.5;
                        }
                        if (0.0 < fVar28) {
                          if (local_8c == 0) {
                            uVar11 = (ulonglong)bVar21;
                            if (DAT_1409399a8 == 1) {
                              fVar28 = pfVar24[uVar11 * 6 + 5];
                            }
                            else {
                              fVar28 = (pfVar24[uVar11 * 6 + 6] + pfVar24[uVar11 * 6 + 5]) * 0.5;
                            }
                            if (fVar28 == 0.0) {
                              bVar13 = 2 < DAT_1409399a8;
                              uVar15 = (uint)bVar13;
                              if (bVar13 < DAT_1409399a8) {
                                do {
                                  iVar9 = uVar15 - 1;
                                  if (iVar9 < 1) {
                                    iVar9 = 0;
                                  }
                                  lVar1 = lVar20 + iVar9;
                                  fVar28 = *(float *)(lVar25 + 0x14 + lVar1 * 4);
                                  fVar2 = *(float *)(lVar6 + lVar10 * 4);
                                  if (fVar2 <= fVar28) {
                                    fVar28 = fVar2;
                                  }
                                  bVar13 = bVar13 + 1;
                                  *(float *)(lVar25 + 0x14 +
                                            (lVar20 + uVar11 * 6 + (longlong)iVar9) * 4) = fVar28;
                                  *(float *)(lVar25 + 0x14 + lVar1 * 4) =
                                       *(float *)(lVar25 + 0x14 + lVar1 * 4) - fVar28;
                                  *(char *)(uVar11 + 0xd0 + (longlong)pfVar24) = (char)puVar26[7];
                                  uVar15 = (uint)bVar13;
                                  *(undefined4 *)(lVar25 + 0xd8 + (lVar20 + uVar11) * 4) =
                                       *(undefined4 *)(puVar26 + 0xf);
                                } while (uVar15 < DAT_1409399a8);
                              }
                            }
                            goto LAB_1403507ce;
                          }
                          bVar7 = true;
                          for (bVar13 = 2; bVar13 < 8; bVar13 = bVar13 + 1) {
                            uVar11 = (ulonglong)bVar13;
                            if (DAT_1409399a8 == 1) {
                              fVar28 = pfVar24[uVar11 * 6 + 5];
                            }
                            else {
                              fVar28 = (pfVar24[uVar11 * 6 + 6] + pfVar24[uVar11 * 6 + 5]) * 0.5;
                            }
                            if (0.0 < fVar28) {
                              uVar16 = uVar16 | 1 << (bVar13 & 0x1f);
                            }
                          }
                        }
                        if ((local_8c != 0) && (uVar16 == uVar17)) break;
                      }
LAB_1403507ce:
                      iVar18 = iVar18 + 1;
                      pfVar24 = pfVar24 + 0x3e;
                      lVar20 = lVar20 + 0x3e;
                    }
                  }
                } while (((local_8c == 0) || (uVar16 != uVar17)) &&
                        (uVar22 = uVar22 + 1, uVar22 <= *puVar26));
              }
              bVar8 = bVar7;
            } while (((local_8c == 0) || (uVar16 != uVar17)) &&
                    (uVar23 = uVar23 + 1, (int)uVar23 <= (int)(uint)puVar26[2]));
          }
          if ((!bVar7) || (local_8c == 0)) break;
          if (uVar16 == uVar17) {
            bVar21 = 7;
          }
          else {
            bVar13 = 2;
            while ((bVar21 = 2, bVar13 < 8 &&
                   (bVar21 = bVar13, (uVar16 >> (bVar13 & 0x1f) & 1) != 0))) {
              bVar13 = bVar13 + 1;
            }
          }
          local_8c = local_8c + -1;
        } while (-1 < local_8c);
      }
      puVar26 = puVar26 + 0x1c;
      local_60 = local_60 - 1;
    } while (local_60 != 0);
    puVar26 = (ushort *)(param_6 + 0x14);
    do {
      uVar16 = 0;
      if (((((char)puVar26[6] != '\0') && (*(longlong *)(puVar26 + -10) != 0)) &&
          ((char)puVar26[6] == '\x11')) && (*(int *)(puVar26 + 0xe) != 0)) {
        bVar21 = 2;
        iVar14 = 1;
        do {
          uVar23 = (uint)*puVar26;
          if ((int)(uint)*puVar26 <= *(int *)(param_2 + 0xc)) {
            uVar23 = *(uint *)(param_2 + 0xc);
          }
          while( true ) {
            uVar11 = 0;
            uVar15 = (uint)puVar26[1];
            if ((int)*(uint *)(param_2 + 0x10) <= (int)(uint)puVar26[1]) {
              uVar15 = *(uint *)(param_2 + 0x10);
            }
            if ((int)uVar15 < (int)uVar23) break;
            iVar18 = DAT_140989fe4 + (uVar23 - *(int *)(param_2 + 0xc));
            lVar25 = (ulonglong)(uint)(iVar18 * 0x1d0) * 0xf8 + lVar4;
            if (*(short *)(lVar5 + (longlong)iVar18 * 2) != 0) {
              pfVar24 = (float *)(lVar25 + 0x2c);
              uVar19 = uVar11;
              do {
                uVar12 = (ulonglong)bVar21;
                if (500.0 < pfVar24[-0xb]) break;
                if ((*(char *)((longlong)pfVar24 + 0xa5) == '\x11') &&
                   (pfVar24[0x2c] == *(float *)(puVar26 + 0xe))) {
                  if (DAT_1409399a8 == 1) {
                    fVar28 = *pfVar24;
                  }
                  else {
                    fVar28 = (pfVar24[1] + *pfVar24) * 0.5;
                  }
                  if (0.0 < fVar28) {
                    if (iVar14 == 0) {
                      bVar13 = 2 < DAT_1409399a8;
                      uVar15 = (uint)bVar13;
                      if (bVar13 < DAT_1409399a8) {
                        do {
                          iVar9 = uVar15 - 1;
                          if ((int)(uVar15 - 1) < 1) {
                            iVar9 = 0;
                          }
                          bVar13 = bVar13 + 1;
                          lVar6 = uVar19 + (longlong)iVar9;
                          lVar10 = uVar19 + uVar12 * 6 + (longlong)iVar9;
                          *(float *)(lVar25 + 0x14 + lVar10 * 4) =
                               *(float *)(lVar25 + 0x14 + lVar10 * 4) +
                               *(float *)(lVar25 + 0x2c + lVar6 * 4);
                          *(undefined4 *)(lVar25 + 0x2c + lVar6 * 4) = 0;
                          uVar15 = (uint)bVar13;
                        } while (uVar15 < DAT_1409399a8);
                      }
                      *(undefined1 *)((longlong)pfVar24 + uVar12 + 0xa4) = 0x11;
                      *(undefined4 *)(lVar25 + 0xd8 + (uVar19 + uVar12) * 4) =
                           *(undefined4 *)(puVar26 + 0xe);
                      *(undefined1 *)((longlong)pfVar24 + 0xa5) = 0;
                      pfVar24[0x2c] = 0.0;
                    }
                    else {
                      if (DAT_1409399a8 == 1) {
                        fVar28 = pfVar24[-6];
                      }
                      else {
                        fVar28 = (pfVar24[-5] + pfVar24[-6]) * 0.5;
                      }
                      if (0.0 < fVar28) {
                        for (bVar13 = 2; bVar13 < 8; bVar13 = bVar13 + 1) {
                          uVar12 = (ulonglong)bVar13;
                          if (DAT_1409399a8 == 1) {
                            fVar28 = pfVar24[uVar12 * 6 + -6];
                          }
                          else {
                            fVar28 = (pfVar24[uVar12 * 6 + -5] + pfVar24[uVar12 * 6 + -6]) * 0.5;
                          }
                          if (0.0 < fVar28) {
                            uVar16 = uVar16 | 1 << (bVar13 & 0x1f);
                          }
                        }
                      }
                      if (uVar16 == uVar17) break;
                    }
                  }
                }
                uVar15 = (int)uVar11 + 1;
                uVar11 = (ulonglong)uVar15;
                uVar19 = uVar19 + 0x3e;
                pfVar24 = pfVar24 + 0x3e;
              } while ((int)uVar15 < (int)(uint)*(ushort *)(lVar5 + (longlong)iVar18 * 2));
            }
            if ((iVar14 != 0) && (uVar16 == uVar17)) break;
            uVar23 = uVar23 + 1;
          }
          if (iVar14 == 0) break;
          if (uVar16 == uVar17) {
            bVar21 = 7;
          }
          else {
            bVar13 = 2;
            while ((bVar21 = 2, bVar13 < 8 &&
                   (bVar21 = bVar13, (uVar16 >> (bVar13 & 0x1f) & 1) != 0))) {
              bVar13 = bVar13 + 1;
            }
          }
          iVar14 = iVar14 + -1;
        } while (-1 < iVar14);
      }
      puVar26 = puVar26 + 0x1c;
      local_58 = local_58 - 1;
    } while (local_58 != 0);
  }
  if (param_10 != '\0') {
    lVar4 = *(longlong *)(param_2 + 0x598);
    lVar5 = *(longlong *)(param_2 + 0x5a0);
    for (; (int)param_8 <= param_9; param_8 = param_8 + 1) {
      iVar18 = (param_8 - *(int *)(param_2 + 0xc)) + DAT_140989fe4;
      uVar22 = *(ushort *)(lVar5 + (longlong)iVar18 * 2);
      iVar14 = uVar22 - 1;
      if (iVar14 < 1) {
        iVar14 = 0;
      }
      FUN_140350100(param_1,(ulonglong)(uint)(iVar18 * 0x1d0) * 0xf8 + lVar4,uVar22,0,(short)iVar14)
      ;
    }
  }
  return;
}

