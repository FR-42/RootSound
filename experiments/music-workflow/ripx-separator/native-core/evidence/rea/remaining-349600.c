
void FUN_140349600(longlong param_1,int param_2,int param_3)

{
  ushort uVar1;
  ushort uVar2;
  longlong lVar3;
  longlong lVar4;
  bool bVar5;
  int iVar6;
  int iVar7;
  uint uVar8;
  int iVar9;
  longlong lVar10;
  undefined4 *puVar11;
  int iVar12;
  int iVar13;
  ulonglong uVar14;
  ulonglong uVar15;
  char *pcVar16;
  float *pfVar17;
  int iVar18;
  ulonglong uVar19;
  int iVar20;
  ulonglong uVar21;
  longlong lVar22;
  longlong lVar23;
  int iVar24;
  uint uVar25;
  byte bVar26;
  bool bVar27;
  float fVar28;
  float fVar29;
  float fVar30;
  double dVar31;
  float fVar32;
  float fVar33;
  float fVar34;
  float fVar35;
  float fVar36;
  float fVar37;
  int local_10c;
  int local_108;
  longlong local_100;
  
  fVar30 = DAT_14098a1ac;
  lVar3 = *(longlong *)(param_1 + 0x5a0);
  lVar4 = *(longlong *)(param_1 + 0x598);
  iVar6 = (int)(DAT_14098a1ac * 0.15 + 0.5);
  iVar24 = 1;
  if (1 < iVar6) {
    iVar24 = iVar6;
  }
  dVar31 = pow(0.20000000298023224,1.6609640475208238);
  fVar37 = (float)dVar31 * 32767.0;
  iVar7 = (int)(fVar30 * 0.2 + 0.5);
  iVar6 = 1;
  if (1 < iVar7) {
    iVar6 = iVar7;
  }
  dVar31 = pow(0.07500000298023224,1.6609640475208238);
  uVar19 = (ulonglong)(int)DAT_140989fe4;
  uVar1 = *(ushort *)(lVar3 + uVar19 * 2);
  local_10c = 0;
  if (uVar1 != 0) {
    local_100 = 0;
    do {
      fVar30 = 0.0;
      fVar35 = fVar30;
      iVar7 = param_2;
      if (500.0 < *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + local_10c) * 0xf8 + lVar4))
      break;
      for (; iVar7 <= param_3; iVar7 = iVar7 + 1) {
        iVar18 = *(int *)(param_1 + 0xc);
        iVar9 = (iVar7 - iVar18) + (int)uVar19;
        fVar32 = fVar30;
        fVar34 = fVar35;
        if (local_10c < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar9 * 2)) {
          lVar10 = (local_100 + (ulonglong)(uint)(iVar9 * 0x1d0)) * 0xf8;
          if (DAT_1409399a8 == 1) {
            fVar36 = *(float *)(lVar10 + 0x14 + lVar4);
          }
          else {
            fVar36 = (*(float *)(lVar10 + 0x18 + lVar4) + *(float *)(lVar10 + 0x14 + lVar4)) * 0.5;
          }
          fVar32 = fVar35;
          fVar34 = fVar36;
          if (param_2 + 1 <= iVar7) {
            iVar9 = iVar6;
            fVar33 = (float)dVar31 * 32767.0;
            if (500.0 <= *(float *)(lVar10 + lVar4)) {
              iVar9 = iVar24;
              fVar33 = fVar37;
            }
            if ((fVar33 < fVar36) &&
               (((fVar28 = (float)FUN_1402a0d40(5), fVar28 * fVar35 < fVar36 &&
                 (fVar35 + 48.0 < fVar36)) ||
                ((param_2 + 2 <= iVar7 &&
                 ((((fVar29 = (float)FUN_1402a0d40(0), fVar29 * fVar35 < fVar36 &&
                    (fVar35 + 0.0 < fVar36)) && (fVar28 * fVar30 < fVar36)) &&
                  (fVar30 + 48.0 < fVar36)))))))) {
              bVar5 = false;
              bVar27 = true;
              local_108 = iVar7 + 1;
              iVar20 = iVar7;
              if (local_108 <= param_3) {
                iVar18 = (local_108 - iVar18) + (int)uVar19;
                fVar30 = fVar36;
                do {
                  fVar36 = fVar30;
                  fVar32 = fVar34;
                  if (local_10c < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar18 * 2)) {
                    lVar10 = ((ulonglong)(uint)(iVar18 * 0x1d0) + local_100) * 0xf8;
                    if (DAT_1409399a8 == 1) {
                      fVar32 = *(float *)(lVar10 + 0x14 + lVar4);
                    }
                    else {
                      fVar32 = (*(float *)(lVar10 + 0x18 + lVar4) +
                               *(float *)(lVar10 + 0x14 + lVar4)) * 0.5;
                    }
                    if (bVar27) {
                      fVar29 = (float)FUN_1402a0d40(0xfffffffb);
                      if (fVar29 * fVar30 <= fVar32) {
                        fVar36 = fVar32;
                        fVar35 = fVar34;
                        if (fVar32 <= fVar30) {
                          fVar36 = fVar30;
                        }
                        goto LAB_140349a56;
                      }
                      iVar20 = local_108 + -1;
                      bVar27 = false;
                    }
                    fVar29 = (float)FUN_1402a0d40(0xfffffff6);
                    if ((((fVar32 < fVar29 * fVar30) ||
                         ((bVar5 && ((fVar30 = (float)FUN_1403516c0(0xffffffff),
                                     fVar30 * fVar34 <= fVar32 || (fVar34 + 16.0 <= fVar32)))))) ||
                        ((fVar28 * fVar34 < fVar32 &&
                         (((fVar34 + 48.0 < fVar32 && (fVar28 * fVar35 < fVar32)) &&
                          (fVar35 + 48.0 < fVar32)))))) ||
                       (fVar30 = (float)FUN_1402a0d40(0), fVar32 < fVar30 * fVar33)) break;
                    fVar30 = (float)FUN_1402a0d40(0xfffffffb);
                    fVar35 = fVar34;
                    if (fVar32 < fVar30 * fVar34) {
                      bVar5 = true;
                    }
                  }
LAB_140349a56:
                  local_108 = local_108 + 1;
                  iVar18 = iVar18 + 1;
                  fVar30 = fVar36;
                  fVar34 = fVar32;
                } while (local_108 <= param_3);
                uVar19 = (ulonglong)DAT_140989fe4;
                fVar32 = fVar35;
              }
              iVar18 = 0;
              fVar30 = fVar36;
              do {
                do {
                  iVar13 = iVar20;
                  fVar35 = fVar30;
                  iVar20 = iVar13 + -1;
                  iVar12 = param_2;
                  if (param_2 < iVar7) {
                    iVar12 = iVar7;
                  }
                  if (iVar20 < iVar12) goto LAB_140349b92;
                  iVar12 = (iVar20 - *(int *)(param_1 + 0xc)) + (int)uVar19;
                  fVar30 = fVar35;
                } while ((int)(uint)*(ushort *)(lVar3 + (longlong)iVar12 * 2) <= local_10c);
                lVar10 = ((ulonglong)(uint)(iVar12 * 0x1d0) + local_100) * 0xf8;
                if (DAT_1409399a8 == 1) {
                  fVar30 = *(float *)(lVar10 + 0x14 + lVar4);
                }
                else {
                  fVar30 = (*(float *)(lVar10 + 0x18 + lVar4) + *(float *)(lVar10 + 0x14 + lVar4)) *
                           0.5;
                }
                fVar28 = (float)FUN_1402a0d40(0xfffffff1);
              } while (((fVar28 * fVar36 <= fVar30) &&
                       (fVar28 = (float)FUN_1402a0d40(0), fVar28 * fVar33 <= fVar30)) &&
                      ((fVar28 = (float)FUN_1402a0d40(0xfffffff6), fVar28 * fVar36 <= fVar30 ||
                       (((fVar28 = (float)FUN_1403516c0(0xffffffff), fVar30 < fVar28 * fVar35 &&
                         (fVar30 < fVar35 + 16.0)) && (iVar18 = iVar18 + 1, iVar18 < 3))))));
LAB_140349b92:
              iVar7 = local_108 - iVar13;
              if (((0 < iVar7) && (iVar7 <= iVar9)) && (iVar13 < local_108)) {
                if (3 < iVar7) {
                  do {
                    iVar7 = (iVar13 - *(int *)(param_1 + 0xc)) + (int)uVar19;
                    if (local_10c < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) {
                      lVar10 = local_100 + (ulonglong)(uint)(iVar7 * 0x1d0);
                      *(undefined1 *)(lVar10 * 0xf8 + 0xd1 + lVar4) = 0x10;
                      *(undefined4 *)(lVar10 * 0xf8 + 0xdc + lVar4) = 0;
                      bVar27 = DAT_1409399a8 != 1;
                      *(float *)(lVar10 * 0xf8 + 0x2c + lVar4) = fVar36;
                      if (bVar27) {
                        *(float *)(lVar10 * 0xf8 + 0x30 + lVar4) = fVar36;
                      }
                      uVar19 = (ulonglong)DAT_140989fe4;
                    }
                    iVar7 = (iVar13 - *(int *)(param_1 + 0xc)) + 1 + (int)uVar19;
                    if (local_10c < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) {
                      lVar10 = local_100 + (ulonglong)(uint)(iVar7 * 0x1d0);
                      *(undefined1 *)(lVar10 * 0xf8 + 0xd1 + lVar4) = 0x10;
                      *(undefined4 *)(lVar10 * 0xf8 + 0xdc + lVar4) = 0;
                      bVar27 = DAT_1409399a8 != 1;
                      *(float *)(lVar10 * 0xf8 + 0x2c + lVar4) = fVar36;
                      if (bVar27) {
                        *(float *)(lVar10 * 0xf8 + 0x30 + lVar4) = fVar36;
                      }
                      uVar19 = (ulonglong)DAT_140989fe4;
                    }
                    iVar7 = (iVar13 - *(int *)(param_1 + 0xc)) + 2 + (int)uVar19;
                    if (local_10c < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) {
                      lVar10 = local_100 + (ulonglong)(uint)(iVar7 * 0x1d0);
                      *(undefined1 *)(lVar10 * 0xf8 + 0xd1 + lVar4) = 0x10;
                      *(undefined4 *)(lVar10 * 0xf8 + 0xdc + lVar4) = 0;
                      bVar27 = DAT_1409399a8 != 1;
                      *(float *)(lVar10 * 0xf8 + 0x2c + lVar4) = fVar36;
                      if (bVar27) {
                        *(float *)(lVar10 * 0xf8 + 0x30 + lVar4) = fVar36;
                      }
                      uVar19 = (ulonglong)DAT_140989fe4;
                    }
                    iVar7 = (iVar13 - *(int *)(param_1 + 0xc)) + 3 + (int)uVar19;
                    if (local_10c < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) {
                      lVar10 = local_100 + (ulonglong)(uint)(iVar7 * 0x1d0);
                      *(undefined1 *)(lVar10 * 0xf8 + 0xd1 + lVar4) = 0x10;
                      *(undefined4 *)(lVar10 * 0xf8 + 0xdc + lVar4) = 0;
                      bVar27 = DAT_1409399a8 != 1;
                      *(float *)(lVar10 * 0xf8 + 0x2c + lVar4) = fVar36;
                      if (bVar27) {
                        *(float *)(lVar10 * 0xf8 + 0x30 + lVar4) = fVar36;
                      }
                      uVar19 = (ulonglong)DAT_140989fe4;
                    }
                    iVar13 = iVar13 + 4;
                  } while (iVar13 < local_108 + -3);
                }
                for (; iVar13 < local_108; iVar13 = iVar13 + 1) {
                  iVar7 = (iVar13 - *(int *)(param_1 + 0xc)) + (int)uVar19;
                  if (local_10c < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) {
                    lVar10 = local_100 + (ulonglong)(uint)(iVar7 * 0x1d0);
                    *(undefined1 *)(lVar10 * 0xf8 + 0xd1 + lVar4) = 0x10;
                    *(undefined4 *)(lVar10 * 0xf8 + 0xdc + lVar4) = 0;
                    bVar27 = DAT_1409399a8 != 1;
                    *(float *)(lVar10 * 0xf8 + 0x2c + lVar4) = fVar36;
                    if (bVar27) {
                      *(float *)(lVar10 * 0xf8 + 0x30 + lVar4) = fVar36;
                    }
                    uVar19 = (ulonglong)DAT_140989fe4;
                  }
                }
              }
              iVar7 = local_108 + -1;
            }
          }
        }
        fVar30 = fVar32;
        fVar35 = fVar34;
      }
      local_10c = local_10c + 1;
      local_100 = local_100 + 1;
    } while (local_100 < (longlong)(ulonglong)uVar1);
  }
  uVar21 = 0;
  if (uVar1 != 0) {
    uVar15 = uVar21;
    do {
      iVar24 = (int)uVar15;
      fVar30 = *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar24) * 0xf8 + lVar4);
      if (500.0 < fVar30) break;
      if (fVar30 < 100.0) {
        fVar30 = (float)FUN_1402a0d40(10);
        fVar30 = fVar30 * (float)dVar31 * 32767.0;
      }
      else if (fVar30 <= 150.0) {
        fVar30 = (float)FUN_140351660(7);
        fVar30 = fVar30 * fVar37;
      }
      else {
        fVar30 = (float)FUN_1402a0d40(5);
        fVar30 = fVar30 * fVar37;
      }
      local_10c = param_2;
      if (param_2 <= param_3) {
LAB_140349f40:
        iVar6 = *(int *)(param_1 + 0xc);
        iVar7 = (local_10c - iVar6) + (int)uVar19;
        if ((iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) &&
           (*(char *)(((uint)(iVar7 * 0x1d0) + uVar21) * 0xf8 + 0xd1 + lVar4) == '\x10')) {
          fVar35 = 0.0;
          iVar7 = local_10c;
          if (local_10c <= param_3) {
            iVar18 = ((int)uVar19 - iVar6) + local_10c;
            fVar32 = fVar35;
            do {
              fVar35 = fVar32;
              if (iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar18 * 2)) {
                lVar10 = (uVar21 + (uint)(iVar18 * 0x1d0)) * 0xf8;
                if (*(char *)(lVar10 + 0xd1 + lVar4) != '\x10') break;
                if (DAT_1409399a8 == 1) {
                  fVar35 = *(float *)(lVar10 + 0x2c + lVar4);
                }
                else {
                  fVar35 = (*(float *)(lVar10 + 0x30 + lVar4) + *(float *)(lVar10 + 0x2c + lVar4)) *
                           0.5;
                }
                if (fVar35 <= fVar32) {
                  fVar35 = fVar32;
                }
              }
              iVar7 = iVar7 + 1;
              iVar18 = iVar18 + 1;
              fVar32 = fVar35;
            } while (iVar7 <= param_3);
            uVar19 = (ulonglong)DAT_140989fe4;
          }
          fVar32 = 0.0;
          uVar25 = 0;
          iVar18 = -1;
LAB_14034a050:
          iVar9 = local_10c + -1;
          if (-1 < iVar18) {
            iVar9 = iVar7;
          }
          do {
            if (iVar18 < 0) {
              iVar20 = param_2;
              if (param_2 < local_10c + -2) {
                iVar20 = local_10c + -2;
              }
              bVar27 = iVar20 <= iVar9;
            }
            else {
              iVar20 = iVar7 + 2;
              if (param_3 + 1 <= iVar7 + 2) {
                iVar20 = param_3 + 1;
              }
              bVar27 = iVar9 < iVar20;
            }
            if (!bVar27) goto LAB_14034a106;
            iVar20 = (iVar9 - iVar6) + (int)uVar19;
            if (iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar20 * 2)) {
              lVar10 = (uVar21 + (uint)(iVar20 * 0x1d0)) * 0xf8;
              if (*(char *)(lVar10 + 0xd1 + lVar4) == '\x10') goto LAB_14034a106;
              if (DAT_1409399a8 == 1) {
                fVar34 = *(float *)(lVar10 + 0x14 + lVar4);
              }
              else {
                fVar34 = (*(float *)(lVar10 + 0x18 + lVar4) + *(float *)(lVar10 + 0x14 + lVar4)) *
                         0.5;
              }
              uVar25 = uVar25 + 1;
              fVar32 = fVar32 + fVar34;
            }
            iVar9 = iVar9 + iVar18;
          } while( true );
        }
        goto LAB_14034a415;
      }
LAB_14034a432:
      uVar15 = (ulonglong)(iVar24 + 1);
      uVar21 = uVar21 + 1;
    } while ((longlong)uVar21 < (longlong)(ulonglong)uVar1);
  }
  uVar21 = 0;
  for (iVar24 = param_2; iVar24 <= param_3; iVar24 = iVar24 + 1) {
    iVar6 = (iVar24 - *(int *)(param_1 + 0xc)) + (int)uVar19;
    uVar2 = *(ushort *)(lVar3 + (longlong)iVar6 * 2);
    lVar10 = (ulonglong)(uint)(iVar6 * 0x1d0) * 0xf8 + lVar4;
    uVar25 = (uint)uVar2;
    uVar15 = (ulonglong)uVar2;
    while (uVar14 = uVar15, uVar8 = uVar25, uVar15 = uVar14 - 1, -1 < (longlong)uVar15) {
      uVar25 = uVar8 - 1;
      if ((*(float *)((ulonglong)((int)uVar19 * 0x1d0 + uVar25) * 0xf8 + lVar4) < 500.0) &&
         (*(char *)(uVar15 * 0xf8 + 0xd1 + lVar10) == '\x10')) {
        uVar25 = uVar8 - 2;
        uVar15 = uVar14 - 2;
        if (-1 < (longlong)uVar15) {
          puVar11 = (undefined4 *)(lVar10 + 0xdc + uVar15 * 0xf8);
          iVar6 = (int)uVar15;
          do {
            uVar15 = uVar15 - 1;
            *(undefined1 *)((longlong)puVar11 + -0xb) = 0x10;
            *puVar11 = 0;
            puVar11 = puVar11 + -0x3e;
          } while (-1 < (longlong)uVar15);
          uVar19 = (ulonglong)DAT_140989fe4;
          uVar25 = uVar25 + (-1 - iVar6);
        }
      }
    }
  }
  uVar15 = uVar21;
  if (uVar1 != 0) {
    do {
      iVar6 = (int)uVar15;
      iVar24 = param_2;
      if (500.0 < *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar6) * 0xf8 + lVar4)) break;
      for (; iVar24 <= param_3; iVar24 = iVar24 + 1) {
        iVar7 = (iVar24 - *(int *)(param_1 + 0xc)) + (int)uVar19;
        if ((iVar6 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) &&
           (lVar10 = (uVar21 + (uint)(iVar7 * 0x1d0)) * 0xf8,
           *(char *)(lVar10 + 0xd1 + lVar4) == '\x10')) {
          if (DAT_1409399a8 == 1) {
            fVar30 = *(float *)(lVar10 + 0x14 + lVar4);
          }
          else {
            fVar30 = (*(float *)(lVar10 + 0x18 + lVar4) + *(float *)(lVar10 + 0x14 + lVar4)) * 0.5;
          }
          iVar18 = iVar24 + -1;
          iVar7 = iVar18;
          while( true ) {
            iVar9 = param_2;
            if (param_2 < iVar18) {
              iVar9 = iVar18;
            }
            iVar20 = (int)uVar19;
            if (iVar7 < iVar9) break;
            iVar9 = (iVar7 - *(int *)(param_1 + 0xc)) + iVar20;
            if ((int)(uint)*(ushort *)(lVar3 + (longlong)iVar9 * 2) <= iVar6) break;
            lVar10 = uVar21 + (uint)(iVar9 * 0x1d0);
            lVar22 = lVar10 * 0xf8;
            if (*(char *)(lVar22 + 0xd1 + lVar4) == '\x10') break;
            if (DAT_1409399a8 == 1) {
              fVar37 = *(float *)(lVar22 + 0x14 + lVar4);
            }
            else {
              fVar37 = (*(float *)(lVar22 + 0x18 + lVar4) + *(float *)(lVar22 + 0x14 + lVar4)) * 0.5
              ;
            }
            if ((fVar30 <= fVar37) || (fVar37 < 16.0)) break;
            if (param_2 < iVar7) {
              lVar23 = 0;
              uVar15 = (ulonglong)*(ushort *)(lVar3 + -2 + (longlong)iVar9 * 2);
              if (uVar15 != 0) {
                uVar25 = iVar20 * 0x1d0;
                pcVar16 = (char *)((ulonglong)(iVar9 * 0x1d0 - 0x1d0) * 0xf8 + 0xd1 + lVar4);
                do {
                  if (500.0 < *(float *)((ulonglong)uVar25 * 0xf8 + lVar4)) break;
                  if (*pcVar16 == '\x10') goto LAB_14034a746;
                  uVar25 = uVar25 + 1;
                  lVar23 = lVar23 + 1;
                  pcVar16 = pcVar16 + 0xf8;
                } while (lVar23 < (longlong)uVar15);
              }
            }
            *(undefined1 *)(lVar22 + 0xd1 + lVar4) = 0x10;
            iVar7 = iVar7 + -1;
            *(undefined4 *)(lVar10 * 0xf8 + 0xdc + lVar4) = 0;
            uVar19 = (ulonglong)DAT_140989fe4;
            fVar30 = fVar37;
          }
LAB_14034a746:
          iVar24 = iVar24 + 1;
          if (iVar24 <= param_3) {
            iVar18 = iVar24 - *(int *)(param_1 + 0xc);
            iVar7 = (iVar20 - *(int *)(param_1 + 0xc)) + iVar24;
            do {
              if ((int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2) <= iVar6) break;
              if (*(char *)(((uint)(iVar7 * 0x1d0) + uVar21) * 0xf8 + 0xd1 + lVar4) != '\x10') {
                lVar10 = ((uint)((iVar20 + -1 + iVar18) * 0x1d0) + uVar21) * 0xf8;
                if (DAT_1409399a8 == 1) {
                  fVar30 = *(float *)(lVar10 + 0x14 + lVar4);
                }
                else {
                  fVar30 = (*(float *)(lVar10 + 0x18 + lVar4) + *(float *)(lVar10 + 0x14 + lVar4)) *
                           0.5;
                }
                if (iVar24 <= param_3) goto LAB_14034a800;
                break;
              }
              iVar24 = iVar24 + 1;
              iVar18 = iVar18 + 1;
              iVar7 = iVar7 + 1;
            } while (iVar24 <= param_3);
          }
        }
LAB_14034a924:
      }
      uVar21 = uVar21 + 1;
      uVar15 = (ulonglong)(iVar6 + 1);
    } while ((longlong)uVar21 < (longlong)(ulonglong)uVar1);
  }
  iVar24 = *(int *)(param_1 + 0xc);
  if (*(int *)(param_1 + 0xc) < param_2) {
    iVar24 = param_2;
  }
  for (; iVar6 = param_2, iVar24 <= param_3; iVar24 = iVar24 + 1) {
    iVar18 = 0;
    iVar7 = (int)uVar19;
    iVar6 = (iVar24 - *(int *)(param_1 + 0xc)) + iVar7;
    lVar22 = 0;
    fVar30 = 0.0;
    fVar37 = 0.0;
    uVar21 = (ulonglong)*(ushort *)(lVar3 + (longlong)iVar6 * 2);
    lVar10 = (ulonglong)(uint)(iVar6 * 0x1d0) * 0xf8;
    if (3 < uVar21) {
      uVar25 = iVar7 * 0x1d0;
      pfVar17 = (float *)(lVar4 + 0x204 + lVar10);
      do {
        fVar35 = *(float *)((ulonglong)uVar25 * 0xf8 + lVar4);
        if (500.0 <= fVar35) goto LAB_14034abfe;
        if (*(char *)((longlong)pfVar17 + -0x133) == '\x10') {
          if (DAT_1409399a8 == 1) {
            fVar32 = pfVar17[-0x7c];
          }
          else {
            fVar32 = (pfVar17[-0x7b] + pfVar17[-0x7c]) * 0.5;
          }
          fVar37 = fVar37 + fVar32;
          fVar30 = fVar30 + fVar32 * fVar35;
        }
        fVar35 = *(float *)((ulonglong)(uVar25 + 1) * 0xf8 + lVar4);
        if (500.0 <= fVar35) goto LAB_14034abfe;
        if (*(char *)((longlong)pfVar17 + -0x3b) == '\x10') {
          if (DAT_1409399a8 == 1) {
            fVar32 = pfVar17[-0x3e];
          }
          else {
            fVar32 = (pfVar17[-0x3d] + pfVar17[-0x3e]) * 0.5;
          }
          fVar37 = fVar37 + fVar32;
          fVar30 = fVar30 + fVar32 * fVar35;
        }
        fVar35 = *(float *)((ulonglong)(uVar25 + 2) * 0xf8 + lVar4);
        if (500.0 <= fVar35) goto LAB_14034abfe;
        if (*(char *)((longlong)pfVar17 + 0xbd) == '\x10') {
          if (DAT_1409399a8 == 1) {
            fVar32 = *pfVar17;
          }
          else {
            fVar32 = (pfVar17[1] + *pfVar17) * 0.5;
          }
          fVar37 = fVar37 + fVar32;
          fVar30 = fVar30 + fVar32 * fVar35;
        }
        fVar35 = *(float *)((ulonglong)(uVar25 + 3) * 0xf8 + lVar4);
        if (500.0 <= fVar35) goto LAB_14034abfe;
        if (*(char *)((longlong)pfVar17 + 0x1b5) == '\x10') {
          if (DAT_1409399a8 == 1) {
            fVar32 = pfVar17[0x3e];
          }
          else {
            fVar32 = (pfVar17[0x3f] + pfVar17[0x3e]) * 0.5;
          }
          fVar37 = fVar37 + fVar32;
          fVar30 = fVar30 + fVar32 * fVar35;
        }
        iVar18 = iVar18 + 4;
        uVar25 = uVar25 + 4;
        lVar22 = lVar22 + 4;
        pfVar17 = pfVar17 + 0xf8;
      } while (lVar22 < (longlong)(uVar21 - 3));
    }
    if (lVar22 < (longlong)uVar21) {
      uVar25 = iVar7 * 0x1d0 + iVar18;
      pfVar17 = (float *)(lVar4 + 0x14 + lVar10 + lVar22 * 0xf8);
      do {
        fVar35 = *(float *)((ulonglong)uVar25 * 0xf8 + lVar4);
        if (500.0 <= fVar35) break;
        if (*(char *)((longlong)pfVar17 + 0xbd) == '\x10') {
          if (DAT_1409399a8 == 1) {
            fVar32 = *pfVar17;
          }
          else {
            fVar32 = (pfVar17[1] + *pfVar17) * 0.5;
          }
          fVar37 = fVar37 + fVar32;
          fVar30 = fVar30 + fVar32 * fVar35;
        }
        uVar25 = uVar25 + 1;
        lVar22 = lVar22 + 1;
        pfVar17 = pfVar17 + 0x3e;
      } while (lVar22 < (longlong)uVar21);
      uVar19 = (ulonglong)DAT_140989fe4;
    }
LAB_14034abfe:
    if (fVar37 != 0.0) {
      iVar6 = iVar24 + 1;
      iVar7 = iVar24;
      if (iVar6 <= param_3) {
        iVar18 = ((int)uVar19 - *(int *)(param_1 + 0xc)) + iVar6;
        do {
          iVar9 = iVar6;
          iVar6 = 0;
          lVar22 = 0;
          fVar32 = 0.0;
          fVar35 = 0.0;
          lVar10 = (ulonglong)(uint)(iVar18 * 0x1d0) * 0xf8;
          uVar21 = (ulonglong)*(ushort *)(lVar3 + (longlong)iVar18 * 2);
          if (3 < uVar21) {
            uVar25 = (int)uVar19 * 0x1d0;
            pfVar17 = (float *)(lVar4 + 0x204 + lVar10);
            do {
              fVar34 = *(float *)((ulonglong)uVar25 * 0xf8 + lVar4);
              if (500.0 <= fVar34) goto LAB_14034aeb3;
              if (*(char *)((longlong)pfVar17 + -0x133) == '\x10') {
                if (DAT_1409399a8 == 1) {
                  fVar36 = pfVar17[-0x7c];
                }
                else {
                  fVar36 = (pfVar17[-0x7b] + pfVar17[-0x7c]) * 0.5;
                }
                fVar35 = fVar35 + fVar36;
                fVar32 = fVar32 + fVar36 * fVar34;
              }
              fVar34 = *(float *)((ulonglong)(uVar25 + 1) * 0xf8 + lVar4);
              if (500.0 <= fVar34) goto LAB_14034aeb3;
              if (*(char *)((longlong)pfVar17 + -0x3b) == '\x10') {
                if (DAT_1409399a8 == 1) {
                  fVar36 = pfVar17[-0x3e];
                }
                else {
                  fVar36 = (pfVar17[-0x3d] + pfVar17[-0x3e]) * 0.5;
                }
                fVar35 = fVar35 + fVar36;
                fVar32 = fVar32 + fVar36 * fVar34;
              }
              fVar34 = *(float *)((ulonglong)(uVar25 + 2) * 0xf8 + lVar4);
              if (500.0 <= fVar34) goto LAB_14034aeb3;
              if (*(char *)((longlong)pfVar17 + 0xbd) == '\x10') {
                if (DAT_1409399a8 == 1) {
                  fVar36 = *pfVar17;
                }
                else {
                  fVar36 = (pfVar17[1] + *pfVar17) * 0.5;
                }
                fVar35 = fVar35 + fVar36;
                fVar32 = fVar32 + fVar36 * fVar34;
              }
              fVar34 = *(float *)((ulonglong)(uVar25 + 3) * 0xf8 + lVar4);
              if (500.0 <= fVar34) goto LAB_14034aeb3;
              if (*(char *)((longlong)pfVar17 + 0x1b5) == '\x10') {
                if (DAT_1409399a8 == 1) {
                  fVar36 = pfVar17[0x3e];
                }
                else {
                  fVar36 = (pfVar17[0x3f] + pfVar17[0x3e]) * 0.5;
                }
                fVar35 = fVar35 + fVar36;
                fVar32 = fVar32 + fVar36 * fVar34;
              }
              iVar6 = iVar6 + 4;
              uVar25 = uVar25 + 4;
              lVar22 = lVar22 + 4;
              pfVar17 = pfVar17 + 0xf8;
            } while (lVar22 < (longlong)(uVar21 - 3));
          }
          if (lVar22 < (longlong)uVar21) {
            uVar25 = (int)uVar19 * 0x1d0 + iVar6;
            pfVar17 = (float *)(lVar4 + 0x14 + lVar10 + lVar22 * 0xf8);
            do {
              fVar34 = *(float *)((ulonglong)uVar25 * 0xf8 + lVar4);
              if (500.0 <= fVar34) break;
              if (*(char *)((longlong)pfVar17 + 0xbd) == '\x10') {
                if (DAT_1409399a8 == 1) {
                  fVar36 = *pfVar17;
                }
                else {
                  fVar36 = (pfVar17[1] + *pfVar17) * 0.5;
                }
                fVar35 = fVar35 + fVar36;
                fVar32 = fVar32 + fVar36 * fVar34;
              }
              uVar25 = uVar25 + 1;
              lVar22 = lVar22 + 1;
              pfVar17 = pfVar17 + 0x3e;
            } while (lVar22 < (longlong)uVar21);
            uVar19 = (ulonglong)DAT_140989fe4;
          }
LAB_14034aeb3:
          if (fVar35 == 0.0) break;
          fVar30 = fVar30 + fVar32;
          fVar37 = fVar37 + fVar35;
          iVar18 = iVar18 + 1;
          iVar6 = iVar9 + 1;
          iVar7 = iVar9;
        } while (iVar9 + 1 <= param_3);
      }
      if (115.0 <= fVar30 / fVar37) {
        for (; iVar24 <= iVar7; iVar24 = iVar24 + 1) {
          iVar18 = 0;
          lVar10 = 0;
          iVar6 = (iVar24 - *(int *)(param_1 + 0xc)) + (int)uVar19;
          uVar21 = (ulonglong)*(ushort *)(lVar3 + (longlong)iVar6 * 2);
          lVar22 = (ulonglong)(uint)(iVar6 * 0x1d0) * 0xf8;
          if (3 < uVar21) {
            pcVar16 = (char *)(lVar4 + 0x1c9 + lVar22);
            do {
              if (500.0 <= *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar18) * 0xf8 + lVar4
                                     )) goto LAB_14034b094;
              if (pcVar16[-0xf8] == '\x10') {
                pcVar16[-0xf8] = '\x11';
                uVar19 = (ulonglong)DAT_140989fe4;
              }
              if (500.0 <= *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar18 + 1) * 0xf8 +
                                     lVar4)) goto LAB_14034b094;
              if (*pcVar16 == '\x10') {
                *pcVar16 = '\x11';
                uVar19 = (ulonglong)DAT_140989fe4;
              }
              if (500.0 <= *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar18 + 2) * 0xf8 +
                                     lVar4)) goto LAB_14034b094;
              if (pcVar16[0xf8] == '\x10') {
                pcVar16[0xf8] = '\x11';
                uVar19 = (ulonglong)DAT_140989fe4;
              }
              if (500.0 <= *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar18 + 3) * 0xf8 +
                                     lVar4)) goto LAB_14034b094;
              if (pcVar16[0x1f0] == '\x10') {
                pcVar16[0x1f0] = '\x11';
                uVar19 = (ulonglong)DAT_140989fe4;
              }
              iVar18 = iVar18 + 4;
              lVar10 = lVar10 + 4;
              pcVar16 = pcVar16 + 0x3e0;
            } while (lVar10 < (longlong)(uVar21 - 3));
          }
          if (lVar10 < (longlong)uVar21) {
            pcVar16 = (char *)(lVar4 + 0xd1 + lVar22 + lVar10 * 0xf8);
            do {
              if (500.0 <= *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar18) * 0xf8 + lVar4
                                     )) break;
              if (*pcVar16 == '\x10') {
                *pcVar16 = '\x11';
                uVar19 = (ulonglong)DAT_140989fe4;
              }
              iVar18 = iVar18 + 1;
              lVar10 = lVar10 + 1;
              pcVar16 = pcVar16 + 0xf8;
            } while (lVar10 < (longlong)uVar21);
          }
LAB_14034b094:
        }
      }
      iVar24 = iVar7 + 1;
    }
  }
joined_r0x00014034b105:
  if (param_3 < iVar6) {
    uVar21 = 0;
    if ((ulonglong)uVar1 != 0) {
      local_100 = 0;
      lVar10 = 0xd1;
      uVar15 = uVar21;
      do {
        iVar6 = (int)uVar15;
        iVar24 = param_2;
        uVar25 = DAT_1409399a8;
        if (500.0 < *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar6) * 0xf8 + lVar4)) {
          return;
        }
        for (; iVar24 <= param_3; iVar24 = iVar24 + 1) {
          iVar7 = (iVar24 - *(int *)(param_1 + 0xc)) + (int)uVar19;
          lVar22 = (ulonglong)(uint)(iVar7 * 0x1d0) * 0xf8 + lVar4;
          if ((iVar6 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2)) &&
             ((byte)(*(char *)(lVar22 + lVar10) - 0x10U) < 2)) {
            bVar26 = 2 < uVar25;
            uVar8 = (uint)bVar26;
            if (bVar26 < uVar25) {
              do {
                iVar7 = uVar8 - 1;
                if ((int)(uVar8 - 1) < 1) {
                  iVar7 = 0;
                }
                bVar26 = bVar26 + 1;
                lVar23 = (longlong)iVar7 + uVar21;
                *(undefined4 *)(lVar22 + 0x2c + lVar23 * 4) =
                     *(undefined4 *)(lVar22 + 0x14 + lVar23 * 4);
                *(undefined4 *)(lVar22 + 0x14 + lVar23 * 4) = 0;
                uVar8 = (uint)bVar26;
              } while (uVar8 < DAT_1409399a8);
              uVar19 = (ulonglong)DAT_140989fe4;
              uVar25 = DAT_1409399a8;
            }
          }
        }
        local_100 = local_100 + 1;
        uVar15 = (ulonglong)(iVar6 + 1);
        lVar10 = lVar10 + 0xf8;
        uVar21 = uVar21 + 0x3e;
      } while (local_100 < (longlong)(ulonglong)uVar1);
    }
    return;
  }
  iVar24 = (iVar6 - *(int *)(param_1 + 0xc)) + (int)uVar19;
  uVar15 = (ulonglong)(uint)(iVar24 * 0x1d0);
  uVar2 = *(ushort *)(lVar3 + (longlong)iVar24 * 2);
  uVar21 = (ulonglong)uVar2;
  lVar10 = (ulonglong)uVar2 - 1;
  iVar24 = uVar2 - 1;
  if (-1 < lVar10) {
    uVar25 = (int)uVar19 * 0x1d0 + iVar24;
    pcVar16 = (char *)(lVar4 + 0xd1 + (lVar10 + uVar15) * 0xf8);
    do {
      if ((*(float *)((ulonglong)uVar25 * 0xf8 + lVar4) < 500.0) && (*pcVar16 == '\x10')) {
        iVar24 = iVar24 + 1;
        lVar10 = (longlong)iVar24;
        if (lVar10 < (longlong)uVar21) {
          if ((longlong)(uVar21 - lVar10) < 4) goto LAB_14034b2ba;
          puVar11 = (undefined4 *)(lVar4 + 0xdc + (lVar10 + uVar15) * 0xf8);
          goto LAB_14034b1d0;
        }
        break;
      }
      iVar24 = iVar24 + -1;
      uVar25 = uVar25 - 1;
      pcVar16 = pcVar16 + -0xf8;
      lVar10 = lVar10 + -1;
    } while (-1 < lVar10);
  }
  goto LAB_14034b30d;
LAB_14034a106:
  iVar18 = iVar18 + 2;
  if (1 < iVar18) goto code_r0x00014034a120;
  goto LAB_14034a050;
code_r0x00014034a120:
  if (uVar25 != 0) {
    fVar32 = fVar32 / (float)uVar25;
  }
  if ((fVar35 - fVar32 < fVar30) && (fVar34 = 0.0, iVar18 = local_10c, local_10c < iVar7)) {
    do {
      iVar9 = (iVar18 - iVar6) + (int)uVar19;
      uVar15 = (ulonglong)(uint)(iVar9 * 0x1d0);
      uVar25 = (uint)*(ushort *)(lVar3 + (longlong)iVar9 * 2);
      if (iVar24 < (int)uVar25) {
        if (iVar24 < (int)(uVar25 - 1)) {
          lVar10 = (uVar21 + uVar15) * 0xf8;
          if (DAT_1409399a8 == 1) {
            fVar36 = *(float *)(lVar10 + 0x124 + lVar4);
          }
          else {
            fVar36 = (*(float *)(lVar10 + 0x128 + lVar4) + *(float *)(lVar10 + 0x124 + lVar4)) * 0.5
            ;
          }
        }
        else {
          fVar36 = 0.0;
        }
        if ((longlong)uVar21 < 1) {
          fVar33 = 0.0;
        }
        else {
          lVar10 = (uVar21 + uVar15) * 0xf8;
          if (DAT_1409399a8 == 1) {
            fVar33 = *(float *)(lVar10 + -0xcc + lVar4);
          }
          else {
            fVar33 = (*(float *)(lVar10 + -200 + lVar4) + *(float *)(lVar10 + -0xcc + lVar4)) * 0.5;
          }
        }
        if (fVar36 <= fVar33) {
          fVar36 = fVar33;
        }
        if (fVar34 < fVar36) {
          fVar34 = fVar36;
        }
      }
      iVar18 = iVar18 + 1;
    } while (iVar18 < iVar7);
    if (((fVar34 == 0.0) || ((fVar35 - fVar32 < fVar30 && (fVar34 < fVar30)))) &&
       (local_10c < iVar7)) {
      if (3 < iVar7 - local_10c) {
        do {
          iVar6 = *(int *)(param_1 + 0xc);
          iVar18 = (local_10c - iVar6) + (int)uVar19;
          if (iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar18 * 2)) {
            lVar10 = uVar21 + (uint)(iVar18 * 0x1d0);
            *(undefined4 *)(lVar10 * 0xf8 + 0x2c + lVar4) = 0;
            lVar10 = lVar10 * 0xf8;
            *(undefined4 *)(lVar10 + 0x30 + lVar4) = 0;
            *(undefined1 *)(lVar10 + 0xd1 + lVar4) = 0;
            iVar6 = *(int *)(param_1 + 0xc);
            uVar19 = (ulonglong)DAT_140989fe4;
          }
          iVar18 = (local_10c - iVar6) + 1 + (int)uVar19;
          if (iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar18 * 2)) {
            lVar10 = uVar21 + (uint)(iVar18 * 0x1d0);
            *(undefined4 *)(lVar10 * 0xf8 + 0x2c + lVar4) = 0;
            lVar10 = lVar10 * 0xf8;
            *(undefined4 *)(lVar10 + 0x30 + lVar4) = 0;
            *(undefined1 *)(lVar10 + 0xd1 + lVar4) = 0;
            iVar6 = *(int *)(param_1 + 0xc);
            uVar19 = (ulonglong)DAT_140989fe4;
          }
          iVar18 = (local_10c - iVar6) + 2 + (int)uVar19;
          if (iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar18 * 2)) {
            lVar10 = uVar21 + (uint)(iVar18 * 0x1d0);
            *(undefined4 *)(lVar10 * 0xf8 + 0x2c + lVar4) = 0;
            lVar10 = lVar10 * 0xf8;
            *(undefined4 *)(lVar10 + 0x30 + lVar4) = 0;
            *(undefined1 *)(lVar10 + 0xd1 + lVar4) = 0;
            iVar6 = *(int *)(param_1 + 0xc);
            uVar19 = (ulonglong)DAT_140989fe4;
          }
          iVar6 = (local_10c - iVar6) + 3 + (int)uVar19;
          if (iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar6 * 2)) {
            lVar10 = uVar21 + (uint)(iVar6 * 0x1d0);
            *(undefined4 *)(lVar10 * 0xf8 + 0x2c + lVar4) = 0;
            lVar10 = lVar10 * 0xf8;
            *(undefined4 *)(lVar10 + 0x30 + lVar4) = 0;
            *(undefined1 *)(lVar10 + 0xd1 + lVar4) = 0;
            uVar19 = (ulonglong)DAT_140989fe4;
          }
          local_10c = local_10c + 4;
        } while (local_10c < iVar7 + -3);
      }
      for (; local_10c < iVar7; local_10c = local_10c + 1) {
        iVar6 = (local_10c - *(int *)(param_1 + 0xc)) + (int)uVar19;
        if (iVar24 < (int)(uint)*(ushort *)(lVar3 + (longlong)iVar6 * 2)) {
          lVar10 = uVar21 + (uint)(iVar6 * 0x1d0);
          *(undefined4 *)(lVar10 * 0xf8 + 0x2c + lVar4) = 0;
          lVar10 = lVar10 * 0xf8;
          *(undefined4 *)(lVar10 + 0x30 + lVar4) = 0;
          *(undefined1 *)(lVar10 + 0xd1 + lVar4) = 0;
          uVar19 = (ulonglong)DAT_140989fe4;
        }
      }
    }
  }
  local_10c = iVar7 + -1;
LAB_14034a415:
  local_10c = local_10c + 1;
  if (param_3 < local_10c) goto LAB_14034a432;
  goto LAB_140349f40;
LAB_14034a800:
  iVar7 = (iVar24 - *(int *)(param_1 + 0xc)) + (int)uVar19;
  if ((int)(uint)*(ushort *)(lVar3 + (longlong)iVar7 * 2) <= iVar6) goto LAB_14034a924;
  lVar10 = uVar21 + (uint)(iVar7 * 0x1d0);
  lVar22 = lVar10 * 0xf8;
  if (*(char *)(lVar22 + 0xd1 + lVar4) == '\x10') {
    iVar24 = iVar24 + -1;
    goto LAB_14034a924;
  }
  if (DAT_1409399a8 == 1) {
    fVar37 = *(float *)(lVar22 + 0x14 + lVar4);
  }
  else {
    fVar37 = (*(float *)(lVar22 + 0x18 + lVar4) + *(float *)(lVar22 + 0x14 + lVar4)) * 0.5;
  }
  if ((fVar30 <= fVar37) || (fVar37 < 16.0)) goto LAB_14034a924;
  if (iVar24 < param_3) {
    uVar15 = (ulonglong)*(ushort *)(lVar3 + 2 + (longlong)iVar7 * 2);
    lVar23 = 0;
    if (uVar15 != 0) {
      uVar25 = (int)uVar19 * 0x1d0;
      pcVar16 = (char *)((ulonglong)(iVar7 * 0x1d0 + 0x1d0) * 0xf8 + 0xd1 + lVar4);
      do {
        if (500.0 < *(float *)((ulonglong)uVar25 * 0xf8 + lVar4)) break;
        if (*pcVar16 == '\x10') goto LAB_14034a924;
        uVar25 = uVar25 + 1;
        lVar23 = lVar23 + 1;
        pcVar16 = pcVar16 + 0xf8;
      } while (lVar23 < (longlong)uVar15);
    }
  }
  iVar24 = iVar24 + 1;
  *(undefined1 *)(lVar22 + 0xd1 + lVar4) = 0x10;
  *(undefined4 *)(lVar10 * 0xf8 + 0xdc + lVar4) = 0;
  uVar19 = (ulonglong)DAT_140989fe4;
  fVar30 = fVar37;
  if (param_3 < iVar24) goto LAB_14034a924;
  goto LAB_14034a800;
  while( true ) {
    *(undefined1 *)((longlong)puVar11 + -0xb) = 0x10;
    *puVar11 = 0;
    uVar19 = (ulonglong)DAT_140989fe4;
    if (500.0 <= *(float *)((ulonglong)(DAT_140989fe4 * 0x1d0 + iVar24 + 1) * 0xf8 + lVar4))
    goto LAB_14034b30d;
    *(undefined1 *)((longlong)puVar11 + 0xed) = 0x10;
    puVar11[0x3e] = 0;
    uVar19 = (ulonglong)DAT_140989fe4;
    if (500.0 <= *(float *)((ulonglong)(DAT_140989fe4 * 0x1d0 + iVar24 + 2) * 0xf8 + lVar4))
    goto LAB_14034b30d;
    *(undefined1 *)((longlong)puVar11 + 0x1e5) = 0x10;
    puVar11[0x7c] = 0;
    uVar19 = (ulonglong)DAT_140989fe4;
    if (500.0 <= *(float *)((ulonglong)(DAT_140989fe4 * 0x1d0 + iVar24 + 3) * 0xf8 + lVar4))
    goto LAB_14034b30d;
    *(undefined1 *)((longlong)puVar11 + 0x2dd) = 0x10;
    puVar11[0xba] = 0;
    iVar24 = iVar24 + 4;
    uVar19 = (ulonglong)DAT_140989fe4;
    puVar11 = puVar11 + 0xf8;
    lVar10 = lVar10 + 4;
    if ((longlong)(uVar21 - 3) <= lVar10) break;
LAB_14034b1d0:
    if (500.0 <= *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar24) * 0xf8 + lVar4))
    goto LAB_14034b30d;
  }
LAB_14034b2ba:
  if (lVar10 < (longlong)uVar21) {
    puVar11 = (undefined4 *)(lVar4 + 0xdc + (uVar15 + lVar10) * 0xf8);
    do {
      if (500.0 <= *(float *)((ulonglong)(uint)((int)uVar19 * 0x1d0 + iVar24) * 0xf8 + lVar4))
      break;
      *(undefined1 *)((longlong)puVar11 + -0xb) = 0x10;
      iVar24 = iVar24 + 1;
      *puVar11 = 0;
      lVar10 = lVar10 + 1;
      uVar19 = (ulonglong)DAT_140989fe4;
      puVar11 = puVar11 + 0x3e;
    } while (lVar10 < (longlong)uVar21);
  }
LAB_14034b30d:
  iVar6 = iVar6 + 1;
  goto joined_r0x00014034b105;
}

