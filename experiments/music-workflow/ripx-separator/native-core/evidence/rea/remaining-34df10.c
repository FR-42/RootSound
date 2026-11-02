
void FUN_14034df10(longlong param_1,longlong param_2,ushort param_3,ushort param_4,uint param_5,
                  undefined4 param_6,undefined8 *param_7,uint *param_8,longlong param_9,
                  ushort *param_10)

{
  undefined8 uVar1;
  undefined8 uVar2;
  undefined8 uVar3;
  undefined8 uVar4;
  undefined8 uVar5;
  undefined8 uVar6;
  undefined8 uVar7;
  int iVar8;
  int iVar9;
  uint uVar10;
  ushort uVar11;
  ushort uVar12;
  uint uVar13;
  int *piVar14;
  longlong lVar15;
  float *pfVar16;
  ulonglong uVar17;
  float *pfVar18;
  undefined8 *puVar19;
  undefined1 *puVar20;
  ushort uVar21;
  ushort uVar22;
  uint uVar23;
  uint uVar24;
  undefined4 *puVar25;
  ulonglong uVar26;
  uint uVar27;
  ulonglong uVar28;
  undefined8 *puVar29;
  ushort *puVar30;
  ushort *puVar31;
  longlong lVar32;
  ulonglong uVar33;
  byte bVar34;
  longlong *plVar35;
  char *pcVar36;
  uint uVar37;
  uint uVar38;
  byte *pbVar39;
  ulonglong uVar40;
  int iVar41;
  longlong lVar42;
  longlong lVar43;
  ushort *puVar44;
  longlong lVar45;
  ushort *puVar46;
  longlong lVar47;
  longlong lVar48;
  byte bVar49;
  bool bVar50;
  float fVar51;
  undefined1 auVar52 [16];
  undefined1 auVar53 [16];
  float fVar54;
  float fVar55;
  undefined4 uVar56;
  undefined4 uVar57;
  float fVar58;
  uint local_138;
  uint local_134;
  uint local_130;
  uint local_12c;
  int local_128;
  int local_124;
  longlong local_120;
  
  local_134 = *param_8;
  if (1 < local_134) {
    do {
      bVar50 = false;
      if ((int)(local_134 - 1) < 1) {
        local_134 = *param_8;
      }
      else {
        puVar44 = (ushort *)(param_7 + 9);
        bVar50 = false;
        iVar41 = 0;
        do {
          if ((int)((uint)puVar44[-0x1b] - (uint)puVar44[-0x1c]) <
              (int)((uint)puVar44[1] - (uint)*puVar44)) {
            bVar50 = true;
            uVar2 = *(undefined8 *)(puVar44 + -0x24);
            uVar3 = *(undefined8 *)(puVar44 + -0x20);
            uVar4 = *(undefined8 *)(puVar44 + -0x1c);
            uVar5 = *(undefined8 *)(puVar44 + -0x18);
            uVar6 = *(undefined8 *)(puVar44 + -0x14);
            uVar7 = *(undefined8 *)(puVar44 + -0x10);
            uVar1 = *(undefined8 *)(puVar44 + -0xc);
            *(undefined8 *)(puVar44 + -0x24) = *(undefined8 *)(puVar44 + -8);
            *(undefined8 *)(puVar44 + -0x20) = *(undefined8 *)(puVar44 + -4);
            *(undefined8 *)(puVar44 + -0x1c) = *(undefined8 *)puVar44;
            *(undefined8 *)(puVar44 + -0x18) = *(undefined8 *)(puVar44 + 4);
            *(undefined8 *)(puVar44 + -8) = uVar2;
            *(undefined8 *)(puVar44 + -4) = uVar3;
            *(undefined8 *)puVar44 = uVar4;
            *(undefined8 *)(puVar44 + 4) = uVar5;
            *(undefined8 *)(puVar44 + -0x14) = *(undefined8 *)(puVar44 + 8);
            *(undefined8 *)(puVar44 + -0x10) = *(undefined8 *)(puVar44 + 0xc);
            *(undefined8 *)(puVar44 + 8) = uVar6;
            *(undefined8 *)(puVar44 + 0xc) = uVar7;
            *(undefined4 *)(puVar44 + -0xc) = *(undefined4 *)(puVar44 + 0x10);
            *(undefined4 *)(puVar44 + -10) = *(undefined4 *)(puVar44 + 0x12);
            *(undefined8 *)(puVar44 + 0x10) = uVar1;
          }
          local_134 = *param_8;
          iVar41 = iVar41 + 1;
          puVar44 = puVar44 + 0x1c;
        } while (iVar41 < (int)(local_134 - 1));
      }
    } while (bVar50);
  }
  local_128 = 0;
  iVar8 = (int)(DAT_14098a1ac * 0.5 + 0.5);
  iVar41 = 1;
  if (1 < iVar8) {
    iVar41 = iVar8;
  }
  if (0 < (int)(local_134 - 1)) {
    local_120 = 0;
    do {
      lVar45 = local_120 * 0x38;
      if (*(short *)(param_1 + 0x14) == 0) {
        uVar38 = (uint)*(ushort *)(lVar45 + 0x14 + (longlong)param_7);
        uVar37 = (uint)*(ushort *)(lVar45 + 0x16 + (longlong)param_7);
        iVar9 = (int)(DAT_14098a1ac * 0.1 + 0.5);
        iVar8 = 1;
        if (1 < iVar9) {
          iVar8 = iVar9;
        }
      }
      else {
        uVar37 = (uint)*(ushort *)(lVar45 + 0x16 + (longlong)param_7);
        uVar11 = *(ushort *)(lVar45 + 0x14 + (longlong)param_7);
        uVar38 = (uint)uVar11;
        iVar9 = (int)(DAT_14098a1ac * 0.05 + 0.5);
        iVar8 = 1;
        if (1 < iVar9) {
          iVar8 = iVar9;
        }
        iVar9 = (int)((float)(int)((uVar37 - uVar11) + 1) * 0.5 + 0.5);
        if (iVar8 <= iVar9) {
          iVar9 = iVar8;
        }
        iVar8 = 1;
        if (1 < iVar9) {
          iVar8 = iVar9;
        }
      }
LAB_14034e1d0:
      local_134 = *param_8;
      iVar9 = local_128 + 1;
      if (iVar9 < (int)local_134) {
        uVar11 = *(ushort *)(lVar45 + 0x14 + (longlong)param_7);
        uVar27 = *(uint *)(param_2 + 0xc);
        lVar48 = local_120 + 1;
        local_12c = iVar9;
        do {
          local_130 = (uint)uVar11;
          plVar35 = param_7 + lVar48 * 7;
          if (((uVar27 <= local_130) || (uVar27 <= *(ushort *)((longlong)plVar35 + 0x14))) ||
             ((char)plVar35[4] == *(char *)(param_7 + local_120 * 7 + 4))) {
            if (*(char *)(param_1 + 0x92) != '\0') {
              fVar54 = (float)*(ushort *)(param_7 + local_120 * 7 + 2) * 500.0;
              if (((1500.0 <= fVar54) &&
                  (((float)*(ushort *)(plVar35 + 2) * 500.0 < 1500.0 ||
                   (((float)*(ushort *)((longlong)plVar35 + 0x12) * 500.0 < 6500.0 &&
                    ((float)*(ushort *)(plVar35 + 2) * 500.0 < 3000.0)))))) ||
                 ((1500.0 <= (float)*(ushort *)(plVar35 + 2) * 500.0 &&
                  ((fVar54 < 1500.0 ||
                   (((float)*(ushort *)(lVar45 + 0x12 + (longlong)param_7) * 500.0 < 6500.0 &&
                    (fVar54 < 3000.0)))))))) goto LAB_14034e4b9;
              if (((char)plVar35[4] == '\0') && (*(char *)(param_7 + local_120 * 7 + 4) == '\0')) {
                lVar32 = lVar48;
                if (*(ushort *)((longlong)plVar35 + 0x16) <=
                    *(ushort *)(lVar45 + 0x16 + (longlong)param_7)) {
                  lVar32 = local_120;
                }
                uVar21 = *(ushort *)((longlong)plVar35 + 0x14);
                if (uVar11 <= *(ushort *)((longlong)plVar35 + 0x14)) {
                  uVar21 = uVar11;
                }
                if (iVar41 < (int)((uint)*(ushort *)(lVar32 * 0x38 + 0x16 + (longlong)param_7) -
                                  (uint)uVar21)) goto LAB_14034e4b9;
              }
            }
            if (((int)(uVar38 - iVar8) <= (int)(uint)*(ushort *)((longlong)plVar35 + 0x14)) &&
               ((int)(uint)*(ushort *)((longlong)plVar35 + 0x16) <= (int)(uVar37 + iVar8))) {
              uVar23 = (uint)*(ushort *)((longlong)plVar35 + 0x14);
              uVar13 = (uint)*(ushort *)((longlong)plVar35 + 0x16);
              if (*(short *)(param_1 + 0x14) == 0) {
                uVar21 = *(ushort *)((longlong)plVar35 + 0x12);
                if (((((int)(*(ushort *)(param_7 + local_120 * 7 + 2) - 2) <= (int)(uint)uVar21) &&
                     (uVar22 = *(ushort *)(plVar35 + 2),
                     (uint)uVar22 <= *(ushort *)(lVar45 + 0x12 + (longlong)param_7) + 1)) &&
                    (uVar10 = *(ushort *)(lVar45 + 0x16 + (longlong)param_7) - uVar13,
                    uVar24 = (int)uVar10 >> 0x1f, (int)((uVar10 ^ uVar24) - uVar24) < iVar8)) &&
                   (uVar10 = (int)(local_130 - uVar23) >> 0x1f,
                   (int)((local_130 - uVar23 ^ uVar10) - uVar10) < iVar8)) goto LAB_14034e3e8;
              }
              else {
                uVar22 = *(ushort *)(plVar35 + 2);
                if (((int)(*(ushort *)(param_7 + local_120 * 7 + 2) - 1) <= (int)(uint)uVar22) &&
                   (uVar21 = *(ushort *)((longlong)plVar35 + 0x12),
                   (uint)uVar21 <= *(ushort *)(lVar45 + 0x12 + (longlong)param_7) + 1)) {
LAB_14034e3e8:
                  fVar54 = 0.0;
                  fVar51 = 0.0;
                  uVar10 = param_5;
                  if ((int)param_5 < (int)uVar23) {
                    uVar10 = uVar23;
                  }
                  if ((int)uVar13 < (int)uVar10) goto LAB_14034e4e9;
                  do {
                    if (uVar22 <= uVar21) {
                      uVar12 = uVar22;
                      do {
                        uVar23 = (uint)uVar12;
                        uVar12 = uVar12 + 1;
                        lVar32 = (longlong)(int)(uVar23 + (uVar10 - param_5) * (uint)param_3);
                        fVar54 = fVar54 + *(float *)(param_7[local_120 * 7] + lVar32 * 4);
                        fVar51 = fVar51 + *(float *)(*plVar35 + lVar32 * 4);
                      } while (uVar12 <= uVar21);
                    }
                    uVar10 = uVar10 + 1;
                  } while ((int)uVar10 <= (int)uVar13);
                  if ((fVar54 == 0.0) ||
                     (fVar58 = (float)FUN_1402a0d40(10), fVar51 <= fVar58 * fVar54))
                  goto LAB_14034e4e9;
                }
              }
            }
          }
LAB_14034e4b9:
          lVar48 = lVar48 + 1;
          local_12c = local_12c + 1;
          if ((int)local_134 <= (int)local_12c) break;
        } while( true );
      }
      local_128 = iVar9;
      local_120 = local_120 + 1;
      if ((int)(local_134 - 1) <= iVar9) break;
    } while( true );
  }
  uVar26 = 0;
  if (0 < (int)local_134) {
    puVar44 = (ushort *)(param_7 + 2);
    uVar33 = uVar26;
    do {
      if ((*(uint *)(param_2 + 0xc) <= (uint)puVar44[2]) && ((char)puVar44[8] == '\0')) {
        if (*(char *)(param_1 + 0x92) == '\0') {
          if (*(short *)(param_1 + 0x14) == 0) {
            *(undefined1 *)(puVar44 + 8) = 0x12;
          }
        }
        else if (1500.0 <= (float)*puVar44 * 500.0) {
          fVar54 = (float)puVar44[1] * 500.0;
          if (fVar54 <= 9000.0) {
            fVar51 = 3000.0;
          }
          else {
            fVar51 = 1500.0;
          }
          if (((fVar51 <= (float)(int)((uint)puVar44[1] - (uint)*puVar44) * 500.0) &&
              (6500.0 <= fVar54)) && ((int)((uint)puVar44[3] - (uint)puVar44[2]) <= iVar41)) {
            *(undefined1 *)(puVar44 + 8) = 0x40;
          }
        }
        uVar28 = uVar26;
        if (*param_10 != 0) {
          do {
            if (*(int *)(uVar28 * 0x38 + 0x30 + param_9) == *(int *)(puVar44 + 0x10)) {
              *(char *)(uVar28 * 0x38 + 0x20 + param_9) = (char)puVar44[8];
            }
            uVar37 = (int)uVar28 + 1;
            uVar28 = (ulonglong)uVar37;
          } while (uVar37 < *param_10);
        }
      }
      if (((char)puVar44[8] == '@') && (*puVar44 < 6)) {
        *puVar44 = 6;
      }
      local_134 = *param_8;
      uVar37 = (int)uVar33 + 1;
      uVar33 = (ulonglong)uVar37;
      puVar44 = puVar44 + 0x1c;
    } while ((int)uVar37 < (int)local_134);
  }
  if ((*(short *)(param_1 + 0x14) != 0) && (0 < (int)(local_134 - 1))) {
    puVar44 = (ushort *)(param_7 + 2);
    do {
      iVar41 = 0;
      if (0 < (int)local_134) {
        puVar30 = (ushort *)((longlong)param_7 + 0x12);
        pcVar36 = (char *)(param_7 + 4);
        puVar31 = (ushort *)((longlong)param_7 + 0x14);
        puVar46 = (ushort *)(param_7 + 2);
        do {
          if (((((uint)*puVar31 == puVar44[3] + 1) && (*pcVar36 == (char)puVar44[8])) &&
              (uVar37 = (int)((uint)*puVar46 - (uint)*puVar44) >> 0x1f,
              (int)(((uint)*puVar46 - (uint)*puVar44 ^ uVar37) - uVar37) < 2)) &&
             (uVar37 = (int)((uint)*puVar30 - (uint)puVar44[1]) >> 0x1f,
             (int)(((uint)*puVar30 - (uint)puVar44[1] ^ uVar37) - uVar37) < 2)) {
            FUN_14034dd10(param_2,param_3,param_5,param_6,(int)uVar26,iVar41,param_7,param_8,param_9
                          ,param_10);
            iVar41 = iVar41 + -1;
            puVar31 = puVar31 + -0x1c;
            pcVar36 = pcVar36 + -0x38;
            puVar46 = puVar46 + -0x1c;
            puVar30 = puVar30 + -0x1c;
          }
          iVar41 = iVar41 + 1;
          puVar31 = puVar31 + 0x1c;
          pcVar36 = pcVar36 + 0x38;
          puVar46 = puVar46 + 0x1c;
          puVar30 = puVar30 + 0x1c;
          local_134 = *param_8;
        } while (iVar41 < (int)local_134);
      }
      uVar37 = (int)uVar26 + 1;
      uVar26 = (ulonglong)uVar37;
      puVar44 = puVar44 + 0x1c;
    } while ((int)uVar37 < (int)(local_134 - 1));
  }
  iVar41 = 0;
  uVar37 = local_134;
  if ((*(char *)(param_1 + 0x92) != '\0') && (0 < (int)local_134)) {
    pcVar36 = (char *)(param_7 + 4);
    do {
      uVar11 = *(ushort *)(pcVar36 + -0xc);
      if ((*(uint *)(param_2 + 0xc) <= (uint)uVar11) && (*pcVar36 == '@')) {
        uVar37 = (uint)*(ushort *)(pcVar36 + -10);
        iVar9 = (int)(DAT_14098a1ac * 0.3 + 0.5);
        iVar8 = 1;
        if (1 < iVar9) {
          iVar8 = iVar9;
        }
        if (iVar8 < (int)((uVar37 - uVar11) + 1)) {
          uVar21 = *(ushort *)(pcVar36 + -0x10);
          fVar54 = 0.0;
          if (uVar21 < 0xc) {
            uVar21 = 0xc;
          }
          uVar27 = (uint)uVar11;
          uVar38 = param_5;
          if ((int)param_5 < (int)uVar27) {
            uVar38 = uVar27;
          }
          if ((int)uVar38 <= (int)(uint)*(ushort *)(pcVar36 + -10)) {
            do {
              fVar51 = 0.0;
              if (uVar21 <= *(ushort *)(pcVar36 + -0xe)) {
                uVar11 = uVar21;
                do {
                  uVar13 = (uint)uVar11;
                  uVar11 = uVar11 + 1;
                  fVar51 = fVar51 + *(float *)(*(longlong *)(pcVar36 + -0x20) +
                                              (longlong)
                                              (int)(uVar13 + (uVar38 - param_5) * (uint)param_3) * 4
                                              );
                } while (uVar11 <= *(ushort *)(pcVar36 + -0xe));
              }
              uVar38 = uVar38 + 1;
              fVar54 = fVar54 + fVar51;
            } while ((int)uVar38 <= (int)uVar37);
          }
          uVar38 = param_5;
          if ((int)param_5 < (int)uVar27) {
            uVar38 = uVar27;
          }
          if (fVar54 / (float)(int)((uVar37 - uVar38) + 1) < 500.0) {
            *pcVar36 = '\0';
          }
        }
      }
      uVar37 = *param_8;
      iVar41 = iVar41 + 1;
      pcVar36 = pcVar36 + 0x38;
    } while (iVar41 < (int)uVar37);
  }
  if (*(short *)(param_1 + 0x14) == 0) {
    lVar45 = *(longlong *)(param_2 + 0x598);
    lVar48 = *(longlong *)(param_2 + 0x5a0);
    iVar8 = (int)(DAT_14098a1ac * 0.05 + 0.5);
    iVar41 = 1;
    if (1 < iVar8) {
      iVar41 = iVar8;
    }
    local_134 = 0;
    uVar38 = DAT_1409399a8;
    if (0 < (int)uVar37) {
      local_120 = 0;
      do {
        plVar35 = param_7 + local_120 * 7;
        if (((char)plVar35[4] == '\x12') && ((float)*(ushort *)(plVar35 + 2) * 500.0 <= 1000.0)) {
          uVar37 = *(uint *)(param_2 + 0x10);
          bVar34 = 0x11;
LAB_14034ead0:
          uVar27 = *(uint *)(param_2 + 0xc);
          local_138 = uVar37 + 1;
          local_12c = uVar27 - 1;
          uVar23 = (uint)*(ushort *)((longlong)plVar35 + 0x14);
          uVar13 = local_138;
          if ((int)(uint)*(ushort *)((longlong)plVar35 + 0x14) <= (int)uVar27) {
            uVar23 = uVar27;
          }
LAB_14034eaf2:
          while( true ) {
            uVar11 = *(ushort *)((longlong)plVar35 + 0x16);
            uVar37 = *(uint *)(param_2 + 0x10);
            uVar27 = (uint)uVar11;
            if ((int)uVar37 <= (int)(uint)uVar11) {
              uVar27 = uVar37;
            }
            if ((int)uVar27 < (int)uVar23) break;
            iVar8 = DAT_140989fe4 + (uVar23 - *(int *)(param_2 + 0xc));
            lVar47 = (ulonglong)(uint)(iVar8 * 0x1d0) * 0xf8 + lVar45;
            uVar11 = *(ushort *)(lVar48 + (longlong)iVar8 * 2);
            uVar37 = (uint)uVar11;
            lVar32 = (ulonglong)uVar37 - 1;
            if (-1 < lVar32) {
              piVar14 = (int *)(lVar32 * 0xf8 + 0xdc + lVar47);
              do {
                if ((((float)piVar14[-0x37] <= 500.0) &&
                    (*(byte *)((longlong)piVar14 + -0xb) == bVar34)) && (*piVar14 == 0)) {
                  iVar8 = local_134 + 1;
                  fVar54 = -1.0;
                  uVar27 = *param_8;
                  if ((int)uVar27 <= iVar8) goto LAB_14034ecc8;
                  puVar44 = (ushort *)((longlong)param_7 + (local_120 + 1) * 0x38 + 0x16);
                  goto LAB_14034ebd3;
                }
                piVar14 = piVar14 + -0x3e;
                lVar32 = lVar32 + -1;
              } while (-1 < lVar32);
            }
            uVar23 = uVar23 + 1;
          }
          if ((int)uVar37 < (int)uVar13) goto code_r0x00014034f022;
          uVar21 = *(ushort *)((longlong)plVar35 + 0x14);
          uVar37 = local_12c;
          if (bVar34 == 0x10) {
            uVar38 = uVar13;
            if ((int)(uint)uVar21 <= (int)uVar13) {
              uVar38 = (uint)uVar21;
            }
            uVar37 = uVar38 + iVar41;
            if ((int)local_12c <= (int)(uVar38 + iVar41)) {
              uVar37 = local_12c;
            }
          }
          local_12c = uVar37;
          uVar22 = (ushort)uVar13;
          if ((ushort)uVar13 <= uVar21) {
            uVar22 = uVar21;
          }
          *(ushort *)((longlong)plVar35 + 0x14) = uVar22;
          uVar37 = local_12c;
          if ((int)local_12c <= (int)uVar13) {
            uVar37 = uVar13;
          }
          uVar21 = (ushort)uVar37;
          if (uVar11 <= (ushort)uVar37) {
            uVar21 = uVar11;
          }
          *(ushort *)((longlong)plVar35 + 0x16) = uVar21;
          uVar37 = *(uint *)(param_2 + 0xc);
          if (uVar37 <= local_12c) {
            iVar8 = -1;
            uVar38 = uVar37;
            do {
              uVar27 = uVar13 - 1;
              uVar37 = uVar38;
              if (iVar8 != -1) {
                uVar27 = local_12c + 1;
              }
              while( true ) {
                uVar13 = uVar27;
                if (iVar8 == -1) {
                  bVar50 = uVar38 <= uVar13;
                  uVar37 = uVar38;
                }
                else {
                  bVar50 = uVar13 <= *(uint *)(param_2 + 0x10);
                }
                if (!bVar50) break;
                bVar50 = false;
                iVar9 = (uVar13 - uVar37) + DAT_140989fe4;
                lVar32 = (ulonglong)*(ushort *)(lVar48 + (longlong)iVar9 * 2) - 1;
                if (-1 < lVar32) {
                  puVar25 = (undefined4 *)
                            (lVar45 + 0xdc + ((ulonglong)(uint)(iVar9 * 0x1d0) + lVar32) * 0xf8);
                  bVar50 = false;
                  do {
                    if (*(byte *)((longlong)puVar25 + -0xb) == bVar34) {
                      bVar50 = true;
                      *puVar25 = (int)plVar35[6];
                    }
                    puVar25 = puVar25 + -0x3e;
                    lVar32 = lVar32 + -1;
                  } while (-1 < lVar32);
                  uVar38 = *(uint *)(param_2 + 0xc);
                  uVar37 = uVar38;
                }
                if (!bVar50) break;
                if (iVar8 == -1) {
                  uVar27 = uVar13 - 1;
                  local_138 = uVar13;
                }
                else {
                  uVar27 = uVar13 + iVar8;
                  local_12c = uVar13;
                }
              }
              iVar8 = iVar8 + 2;
              uVar13 = local_138;
            } while (iVar8 < 2);
          }
          if (uVar13 == uVar37) {
            uVar26 = (ulonglong)(uint)((DAT_140989fe4 + -1) * 0x1d0);
            uVar11 = *(ushort *)(lVar48 + (longlong)(DAT_140989fe4 + -1) * 2);
            lVar32 = (ulonglong)uVar11 - 1;
            uVar37 = (uint)uVar11;
            if (lVar32 < 0) goto LAB_14034f23d;
            piVar14 = (int *)(lVar45 + 0xdc + (uVar26 + lVar32) * 0xf8);
            while ((uVar37 = uVar37 - 1, *(byte *)((longlong)piVar14 + -0xb) != bVar34 ||
                   (*piVar14 == 0))) {
              piVar14 = piVar14 + -0x3e;
              lVar32 = lVar32 + -1;
              if (lVar32 < 0) goto LAB_14034f23d;
            }
            local_124 = *(int *)(((longlong)(int)uVar37 + uVar26) * 0xf8 + 0xdc + lVar45);
            uVar37 = DAT_1409399a8;
            if (local_124 == -1) goto LAB_14034f23d;
          }
          else {
LAB_14034f23d:
            WaitForSingleObject(DAT_140989f08,0xffffffff);
            local_124 = DAT_14098a148 + 1;
            DAT_14098a148 = local_124;
            ReleaseMutex(DAT_140989f08);
            uVar37 = DAT_1409399a8;
            uVar13 = local_138;
          }
          while ((int)uVar13 <= (int)local_12c) {
            iVar8 = (uVar13 - *(int *)(param_2 + 0xc)) + DAT_140989fe4;
            uVar26 = (ulonglong)(uint)(iVar8 * 0x1d0);
            uVar11 = *(ushort *)(lVar48 + (longlong)iVar8 * 2);
            pfVar16 = (float *)(uVar26 * 0xf8 + lVar45);
            if (bVar34 == 0x10) {
              bVar49 = 2 < uVar37;
              uVar38 = (uint)bVar49;
              if (bVar49 < uVar37) {
                do {
                  uVar27 = (uint)uVar11;
                  uVar17 = 0;
                  fVar54 = 0.0;
                  iVar8 = 0;
                  pfVar18 = pfVar16;
                  uVar33 = uVar17;
                  uVar28 = uVar17;
                  uVar40 = uVar17;
                  if (3 < uVar27) {
                    do {
                      uVar33 = uVar28;
                      if (500.0 < *pfVar18) goto LAB_14034f46a;
                      if (350.0 <= *pfVar18) {
                        iVar9 = uVar38 - 1;
                        if ((int)(uVar38 - 1) < 1) {
                          iVar9 = iVar8;
                        }
                        if (fVar54 < pfVar16[(longlong)iVar9 + uVar17 + 0xb]) {
                          fVar54 = pfVar16[(longlong)iVar9 + uVar17 + 0xb];
                        }
                      }
                      uVar33 = uVar28 + 1;
                      if (500.0 < pfVar18[0x3e]) goto LAB_14034f46a;
                      if (350.0 <= pfVar18[0x3e]) {
                        iVar9 = uVar38 - 1;
                        if ((int)(uVar38 - 1) < 1) {
                          iVar9 = iVar8;
                        }
                        if (fVar54 < pfVar16[(longlong)iVar9 + uVar17 + 0x49]) {
                          fVar54 = pfVar16[(longlong)iVar9 + uVar17 + 0x49];
                        }
                      }
                      uVar33 = uVar28 + 2;
                      if (500.0 < pfVar18[0x7c]) goto LAB_14034f46a;
                      if (350.0 <= pfVar18[0x7c]) {
                        iVar9 = uVar38 - 1;
                        if ((int)(uVar38 - 1) < 1) {
                          iVar9 = iVar8;
                        }
                        if (fVar54 < pfVar16[(longlong)iVar9 + uVar17 + 0x87]) {
                          fVar54 = pfVar16[(longlong)iVar9 + uVar17 + 0x87];
                        }
                      }
                      uVar33 = uVar28 + 3;
                      if (500.0 < pfVar18[0xba]) goto LAB_14034f46a;
                      if (350.0 <= pfVar18[0xba]) {
                        iVar9 = uVar38 - 1;
                        if ((int)(uVar38 - 1) < 1) {
                          iVar9 = iVar8;
                        }
                        if (fVar54 < pfVar16[(longlong)iVar9 + uVar17 + 0xc5]) {
                          fVar54 = pfVar16[(longlong)iVar9 + uVar17 + 0xc5];
                        }
                      }
                      uVar33 = uVar28 + 4;
                      uVar17 = uVar17 + 0xf8;
                      uVar13 = (int)uVar40 + 4;
                      uVar40 = (ulonglong)uVar13;
                      pfVar18 = pfVar18 + 0xf8;
                      uVar28 = uVar33;
                    } while ((int)uVar13 < (int)(uVar27 - 3));
                  }
                  if ((int)uVar40 < (int)uVar27) {
                    lVar32 = uVar33 * 0x3e;
                    pfVar18 = pfVar16 + uVar33 * 0x3e;
                    do {
                      if (500.0 < *pfVar18) break;
                      if (350.0 <= *pfVar18) {
                        iVar9 = uVar38 - 1;
                        if ((int)(uVar38 - 1) < 1) {
                          iVar9 = iVar8;
                        }
                        if (fVar54 < pfVar16[iVar9 + lVar32 + 0xb]) {
                          fVar54 = pfVar16[iVar9 + lVar32 + 0xb];
                        }
                      }
                      uVar33 = uVar33 + 1;
                      pfVar18 = pfVar18 + 0x3e;
                      lVar32 = lVar32 + 0x3e;
                      uVar13 = (int)uVar40 + 1;
                      uVar40 = (ulonglong)uVar13;
                    } while ((int)uVar13 < (int)uVar27);
                  }
LAB_14034f46a:
                  if ((0.0 < fVar54) && ((longlong)uVar33 < (longlong)(int)uVar27)) {
                    lVar32 = uVar33 * 0x3e;
                    pfVar18 = pfVar16 + uVar33 * 0x3e + 0x37;
                    do {
                      uVar37 = DAT_1409399a8;
                      if (3000.0 < pfVar18[-0x37]) break;
                      fVar51 = (float)FUN_1403516c0(0xffffffff);
                      fVar54 = fVar51 * fVar54;
                      uVar37 = DAT_1409399a8;
                      if (fVar54 < 1.0) break;
                      iVar8 = uVar38 - 1;
                      if (iVar8 < 1) {
                        iVar8 = 0;
                      }
                      lVar47 = iVar8 + lVar32;
                      fVar51 = pfVar16[lVar47 + 5];
                      if (fVar54 <= pfVar16[lVar47 + 5]) {
                        fVar51 = fVar54;
                      }
                      uVar33 = uVar33 + 1;
                      lVar32 = lVar32 + 0x3e;
                      pfVar16[lVar47 + 0xb] = fVar51 + pfVar16[lVar47 + 0xb];
                      pfVar16[lVar47 + 5] = pfVar16[lVar47 + 5] - fVar51;
                      *(undefined1 *)((longlong)pfVar18 + -0xb) = 0x10;
                      *pfVar18 = *(float *)(plVar35 + 6);
                      pfVar18 = pfVar18 + 0x3e;
                      uVar37 = DAT_1409399a8;
                    } while ((longlong)uVar33 < (longlong)(int)uVar27);
                  }
                  bVar49 = bVar49 + 1;
                  uVar38 = (uint)bVar49;
                  uVar13 = local_138;
                } while (uVar38 < uVar37);
              }
            }
            lVar32 = (ulonglong)uVar11 - 1;
            if (-1 < lVar32) {
              piVar14 = (int *)(lVar45 + 0xdc + (uVar26 + lVar32) * 0xf8);
              do {
                if ((*(byte *)((longlong)piVar14 + -0xb) == bVar34) &&
                   ((*piVar14 == (int)plVar35[6] || (*piVar14 == 0)))) {
                  *piVar14 = local_124;
                }
                piVar14 = piVar14 + -0x3e;
                lVar32 = lVar32 + -1;
                uVar37 = DAT_1409399a8;
              } while (-1 < lVar32);
            }
            local_138 = uVar13 + 1;
            uVar13 = local_138;
          }
          *(int *)(plVar35 + 6) = local_124;
          uVar38 = DAT_1409399a8;
        }
LAB_14034f625:
        local_134 = local_134 + 1;
        local_120 = local_120 + 1;
      } while ((int)local_134 < (int)*param_8);
    }
    uVar33 = 0;
    uVar11 = *(ushort *)(lVar48 + (longlong)DAT_140989fe4 * 2);
    uVar26 = uVar33;
    if (uVar11 != 0) {
      do {
        iVar41 = (int)uVar26;
        if (500.0 < *(float *)((ulonglong)(uint)(DAT_140989fe4 * 0x1d0 + iVar41) * 0xf8 + lVar45))
        break;
        bVar50 = true;
        iVar8 = *(int *)(param_2 + 0xc);
        if (iVar8 <= *(int *)(param_2 + 0x10)) {
          lVar32 = uVar33 * 0xf8;
          do {
            iVar9 = DAT_140989fe4 + (iVar8 - *(int *)(param_2 + 0xc));
            lVar47 = (ulonglong)(uint)(iVar9 * 0x1d0) * 0xf8 + lVar45;
            lVar43 = (ulonglong)(uint)((iVar9 + -1) * 0x1d0) * 0xf8 + lVar45;
            if (uVar38 == 1) {
              fVar54 = *(float *)(lVar43 + 0x2c + lVar32);
            }
            else {
              fVar54 = (*(float *)(lVar43 + 0x30 + lVar32) + *(float *)(lVar43 + 0x2c + lVar32)) *
                       0.5;
            }
            uVar26 = uVar33;
            if (0 < iVar41) {
              if (uVar38 == 1) {
                fVar51 = *(float *)(lVar43 + -0xcc + lVar32);
              }
              else {
                fVar51 = (*(float *)(lVar43 + -200 + lVar32) + *(float *)(lVar43 + -0xcc + lVar32))
                         * 0.5;
              }
              if (fVar54 < fVar51) {
                uVar26 = uVar33 - 1;
                lVar42 = uVar26 * 0xf8;
                if (uVar38 == 1) {
                  fVar54 = *(float *)(lVar42 + 0x2c + lVar43);
                }
                else {
                  fVar54 = (*(float *)(lVar42 + 0x30 + lVar43) + *(float *)(lVar42 + 0x2c + lVar43))
                           * 0.5;
                }
              }
            }
            if (iVar41 + 1 < (int)(uint)*(ushort *)(lVar48 + (longlong)iVar9 * 2)) {
              if (uVar38 == 1) {
                fVar51 = *(float *)(lVar43 + 0x124 + lVar32);
              }
              else {
                fVar51 = (*(float *)(lVar43 + 0x128 + lVar32) + *(float *)(lVar43 + 0x124 + lVar32))
                         * 0.5;
              }
              if (fVar54 < fVar51) {
                uVar26 = uVar33 + 1;
                lVar42 = uVar26 * 0xf8;
                if (uVar38 == 1) {
                  fVar54 = *(float *)(lVar42 + 0x2c + lVar43);
                }
                else {
                  fVar54 = (*(float *)(lVar42 + 0x30 + lVar43) + *(float *)(lVar42 + 0x2c + lVar43))
                           * 0.5;
                }
              }
            }
            if (bVar50) {
              if (1.0 <= fVar54) {
                bVar50 = false;
LAB_14034f839:
                fVar54 = *(float *)(lVar47 + 0x14 + lVar32);
                fVar51 = fVar54;
                if (uVar38 != 1) {
                  fVar51 = (fVar54 + *(float *)(lVar47 + 0x18 + lVar32)) * 0.5;
                }
                if (16.0 <= fVar51) {
                  if (uVar38 != 1) {
                    fVar54 = (fVar54 + *(float *)(lVar47 + 0x18 + lVar32)) * 0.5;
                  }
                  if (1.0 <= fVar54) {
                    bVar34 = 2 < uVar38;
                    uVar37 = (uint)bVar34;
                    if (bVar34 < uVar38) {
                      do {
                        iVar9 = uVar37 - 1;
                        if ((int)(uVar37 - 1) < 1) {
                          iVar9 = 0;
                        }
                        bVar34 = bVar34 + 1;
                        lVar42 = (longlong)iVar9 + uVar33 * 0x3e;
                        fVar54 = *(float *)(lVar47 + 0x14 + lVar42 * 4);
                        *(float *)(lVar47 + 0x2c + lVar42 * 4) =
                             fVar54 + *(float *)(lVar47 + 0x2c + lVar42 * 4);
                        *(float *)(lVar47 + 0x14 + lVar42 * 4) =
                             *(float *)(lVar47 + 0x14 + lVar42 * 4) - fVar54;
                        *(undefined1 *)(lVar47 + 0xd1 + lVar32) =
                             *(undefined1 *)(uVar26 * 0xf8 + 0xd1 + lVar43);
                        *(undefined4 *)(lVar47 + 0xdc + lVar32) =
                             *(undefined4 *)(uVar26 * 0xf8 + 0xdc + lVar43);
                        uVar37 = (uint)bVar34;
                        uVar38 = DAT_1409399a8;
                      } while (uVar37 < DAT_1409399a8);
                    }
                  }
                }
                else {
                  bVar50 = true;
                }
              }
            }
            else {
              if (1.0 <= fVar54) goto LAB_14034f839;
              bVar50 = true;
            }
            iVar8 = iVar8 + 1;
          } while (iVar8 <= *(int *)(param_2 + 0x10));
        }
        uVar33 = uVar33 + 1;
        uVar26 = (ulonglong)(iVar41 + 1U);
      } while ((int)(iVar41 + 1U) < (int)(uint)uVar11);
    }
    iVar41 = 0;
    uVar37 = *param_8;
    puVar29 = param_7;
    if (0 < (int)uVar37) {
      do {
        if (*(char *)(puVar29 + 4) == '\x12') {
          free((void *)*puVar29);
          uVar37 = *param_8;
          puVar19 = puVar29;
          iVar8 = iVar41;
          if (iVar41 < (int)(uVar37 - 1)) {
            do {
              iVar8 = iVar8 + 1;
              *puVar19 = puVar19[7];
              puVar19[1] = puVar19[8];
              puVar19[2] = puVar19[9];
              puVar19[3] = puVar19[10];
              *(undefined1 (*) [16])(puVar19 + 4) = *(undefined1 (*) [16])(puVar19 + 0xb);
              *(undefined4 *)(puVar19 + 6) = *(undefined4 *)(puVar19 + 0xd);
              *(undefined4 *)((longlong)puVar19 + 0x34) = *(undefined4 *)((longlong)puVar19 + 0x6c);
              uVar37 = *param_8;
              puVar19 = puVar19 + 7;
            } while (iVar8 < (int)(uVar37 - 1));
          }
          uVar37 = uVar37 - 1;
          iVar41 = iVar41 + -1;
          *param_8 = uVar37;
          puVar29 = puVar29 + -7;
        }
        iVar41 = iVar41 + 1;
        puVar29 = puVar29 + 7;
        uVar38 = DAT_1409399a8;
      } while (iVar41 < (int)uVar37);
    }
    iVar41 = *(int *)(param_2 + 0xc);
    uVar27 = iVar41 - DAT_140989fe4;
    uVar37 = *(uint *)(param_2 + 0x10);
    if (uVar27 <= uVar37) {
      do {
        iVar8 = (uVar27 - iVar41) + DAT_140989fe4;
        uVar26 = (ulonglong)*(ushort *)(lVar48 + (longlong)iVar8 * 2);
        if (uVar26 != 0) {
          puVar25 = (undefined4 *)((ulonglong)(uint)(iVar8 * 0x1d0) * 0xf8 + 0xd8 + lVar45);
          lVar32 = 0;
          do {
            lVar32 = lVar32 + 1;
            *puVar25 = 0;
            puVar25 = puVar25 + 0x3e;
          } while (lVar32 < (longlong)uVar26);
          iVar41 = *(int *)(param_2 + 0xc);
        }
        uVar37 = *(uint *)(param_2 + 0x10);
        uVar27 = uVar27 + 1;
        uVar38 = DAT_1409399a8;
      } while (uVar27 <= uVar37);
    }
    uVar27 = iVar41 - 3;
    uVar13 = 0xffffffff;
    uVar23 = 0xffffffff;
    fVar54 = 0.0;
    fVar51 = 0.0;
    iVar8 = (int)(DAT_14098a1ac * 0.035 + 0.5);
    iVar41 = 1;
    if (1 < iVar8) {
      iVar41 = iVar8;
    }
    if (uVar27 <= uVar37) {
      do {
        lVar32 = 0;
        fVar58 = 0.0;
        iVar8 = (uVar27 - *(uint *)(param_2 + 0xc)) + 1 + DAT_140989fe4;
        uVar26 = (ulonglong)*(ushort *)(lVar48 + (longlong)iVar8 * 2);
        lVar47 = (ulonglong)(uint)(iVar8 * 0x1d0) * 0xf8;
        if (3 < uVar26) {
          pfVar16 = (float *)(lVar45 + 0x204 + lVar47);
          lVar43 = (uVar26 - 4 >> 2) + 1;
          lVar32 = lVar43 * 4;
          do {
            if (3000.0 < pfVar16[-0x81] || pfVar16[-0x81] == 3000.0) {
              if (uVar38 == 1) {
                fVar55 = pfVar16[-0x7c];
              }
              else {
                fVar55 = (pfVar16[-0x7b] + pfVar16[-0x7c]) * 0.5;
              }
              fVar58 = fVar58 + fVar55;
            }
            if (3000.0 < pfVar16[-0x43] || pfVar16[-0x43] == 3000.0) {
              if (uVar38 == 1) {
                fVar55 = pfVar16[-0x3e];
              }
              else {
                fVar55 = (pfVar16[-0x3d] + pfVar16[-0x3e]) * 0.5;
              }
              fVar58 = fVar58 + fVar55;
            }
            if (3000.0 < pfVar16[-5] || pfVar16[-5] == 3000.0) {
              if (uVar38 == 1) {
                fVar55 = *pfVar16;
              }
              else {
                fVar55 = (pfVar16[1] + *pfVar16) * 0.5;
              }
              fVar58 = fVar58 + fVar55;
            }
            if (3000.0 < pfVar16[0x39] || pfVar16[0x39] == 3000.0) {
              if (uVar38 == 1) {
                fVar55 = pfVar16[0x3e];
              }
              else {
                fVar55 = (pfVar16[0x3f] + pfVar16[0x3e]) * 0.5;
              }
              fVar58 = fVar58 + fVar55;
            }
            pfVar16 = pfVar16 + 0xf8;
            lVar43 = lVar43 + -1;
          } while (lVar43 != 0);
        }
        if (lVar32 < (longlong)uVar26) {
          pfVar16 = (float *)(lVar45 + 0x14 + lVar47 + lVar32 * 0xf8);
          lVar32 = uVar26 - lVar32;
          do {
            if (3000.0 < pfVar16[-5] || pfVar16[-5] == 3000.0) {
              if (uVar38 == 1) {
                fVar55 = *pfVar16;
              }
              else {
                fVar55 = (pfVar16[1] + *pfVar16) * 0.5;
              }
              fVar58 = fVar58 + fVar55;
            }
            pfVar16 = pfVar16 + 0x3e;
            lVar32 = lVar32 + -1;
          } while (lVar32 != 0);
        }
        if (*(uint *)(param_2 + 0xc) <= uVar27) {
          if ((int)uVar13 < 0) {
            if (8192.0 <= fVar54) {
              uVar13 = uVar27;
            }
            fVar55 = fVar51;
            if (-1 < (int)uVar13) goto LAB_14034fcb3;
          }
          else {
LAB_14034fcb3:
            if (((int)uVar23 < 0) && (fVar58 <= fVar54)) {
              uVar23 = uVar27;
            }
            fVar55 = fVar54;
            if (fVar54 <= fVar51) {
              fVar55 = fVar51;
            }
          }
          fVar51 = fVar55;
          if ((int)uVar23 < 0) {
            if (((int)uVar13 < 0) || (uVar37 = *(uint *)(param_2 + 0x10), uVar27 != uVar37))
            goto LAB_14034fe62;
          }
          else {
            uVar37 = *(uint *)(param_2 + 0x10);
          }
          if ((fVar54 < fVar58) || ((fVar58 < 4096.0 || (uVar27 == uVar37)))) {
            if ((16384.0 <= fVar55) &&
               (((iVar41 <= (int)((uVar27 - uVar13) + 1) && (*param_8 < 0x600)) &&
                (1 < (int)(uVar27 - uVar13))))) {
              puVar29 = param_7 + (ulonglong)*param_8 * 7;
              *puVar29 = 0;
              puVar29[1] = 0;
              puVar29[2] = 0;
              puVar29[3] = 0;
              puVar29[4] = 0;
              puVar29[5] = 0;
              puVar29[6] = 0;
              *(undefined1 *)(puVar29 + 4) = 0x12;
              *(ushort *)((longlong)puVar29 + 0x12) = param_3 - 1;
              WaitForSingleObject(DAT_140989f08,0xffffffff);
              DAT_14098a148 = DAT_14098a148 + 1;
              *(int *)(puVar29 + 6) = DAT_14098a148;
              ReleaseMutex(DAT_140989f08);
              *param_8 = *param_8 + 1;
              uVar37 = *(uint *)(param_2 + 0xc);
              *(short *)((longlong)puVar29 + 0x16) = (short)uVar27;
              if ((int)uVar37 < (int)uVar13) {
                uVar37 = uVar13 & 0xffff;
              }
              uVar38 = uVar27 & 0xffff;
              if (-1 < (int)uVar23) {
                uVar38 = uVar23 & 0xffff;
              }
              *(short *)((longlong)puVar29 + 0x14) = (short)uVar37;
              *(short *)(puVar29 + 3) = (short)uVar38;
              uVar13 = uVar37 & 0xffff;
              if ((int)(uVar37 & 0xffff) <= *(int *)(param_2 + 0xc)) {
                uVar13 = *(uint *)(param_2 + 0xc);
              }
              uVar38 = DAT_1409399a8;
              if ((int)uVar13 <= (int)(uVar27 & 0xffff)) {
                do {
                  iVar8 = (uVar13 - *(int *)(param_2 + 0xc)) + DAT_140989fe4;
                  uVar26 = (ulonglong)*(ushort *)(lVar48 + (longlong)iVar8 * 2);
                  if (uVar26 != 0) {
                    puVar20 = (undefined1 *)
                              ((ulonglong)(uint)(iVar8 * 0x1d0) * 0xf8 + 0xd0 + lVar45);
                    lVar32 = 0;
                    do {
                      lVar32 = lVar32 + 1;
                      *(undefined4 *)(puVar20 + 8) = *(undefined4 *)(puVar29 + 6);
                      *puVar20 = 0x12;
                      puVar20 = puVar20 + 0xf8;
                    } while (lVar32 < (longlong)uVar26);
                  }
                  uVar13 = uVar13 + 1;
                  uVar38 = DAT_1409399a8;
                } while ((int)uVar13 <= (int)(uint)*(ushort *)((longlong)puVar29 + 0x16));
              }
            }
            uVar23 = 0xffffffff;
            uVar13 = 0xffffffff;
            fVar51 = 0.0;
          }
        }
LAB_14034fe62:
        uVar27 = uVar27 + 1;
        fVar54 = fVar58;
      } while (uVar27 <= *(uint *)(param_2 + 0x10));
    }
  }
  return;
LAB_14034e4e9:
  FUN_14034dd10(param_2,param_3,param_5,param_6,local_128,local_12c,param_7,param_8,param_9,param_10
               );
  goto LAB_14034e1d0;
code_r0x00014034f022:
  bVar34 = bVar34 - 1;
  if (bVar34 < 0x10) goto LAB_14034f625;
  goto LAB_14034ead0;
LAB_14034ebd3:
  do {
    uVar13 = local_138;
    if ((((int)uVar23 <= (int)(uint)*puVar44) && ((int)(uint)puVar44[-1] <= (int)uVar23)) &&
       (((char)puVar44[5] == '\x12' && (uVar21 = puVar44[-3], (float)uVar21 * 500.0 <= 1000.0)))) {
      if (fVar54 < 0.0) {
        fVar54 = 0.0;
        if (*(ushort *)(plVar35 + 2) <= *(ushort *)((longlong)plVar35 + 0x12)) {
          uVar22 = *(ushort *)(plVar35 + 2);
          do {
            uVar12 = uVar22 + 1;
            fVar54 = fVar54 + *(float *)(*plVar35 +
                                        (longlong)
                                        (int)((uint)uVar22 + (uVar23 - param_5) * (uint)param_3) * 4
                                        );
            uVar22 = uVar12;
          } while (uVar12 <= *(ushort *)((longlong)plVar35 + 0x12));
        }
      }
      auVar52._0_12_ = ZEXT812(0);
      auVar52._12_4_ = 0;
      if (uVar21 <= puVar44[-2]) {
        do {
          uVar10 = (uint)uVar21;
          uVar21 = uVar21 + 1;
          auVar52._0_4_ =
               auVar52._0_4_ +
               *(float *)(*(longlong *)(puVar44 + -0xb) +
                         (longlong)(int)(uVar10 + (uVar23 - param_5) * (uint)param_3) * 4);
        } while (uVar21 <= puVar44[-2]);
      }
      if (fVar54 < auVar52._0_4_) {
        if (iVar8 < (int)uVar27) goto LAB_14034efff;
        break;
      }
    }
    iVar8 = iVar8 + 1;
    puVar44 = puVar44 + 0x1c;
  } while (iVar8 < (int)uVar27);
LAB_14034ecc8:
  local_138 = uVar23;
  if ((int)uVar13 <= (int)uVar23) {
    local_138 = uVar13;
  }
  uVar27 = uVar23;
  if ((int)uVar23 <= (int)local_12c) {
    uVar27 = local_12c;
  }
  *(byte *)(plVar35 + 4) = bVar34;
  lVar43 = 0;
  uVar38 = DAT_1409399a8;
  if ((ulonglong)uVar11 != 0) {
    pbVar39 = (byte *)(lVar47 + 0xd1);
    lVar42 = 0;
    do {
      if (500.0 < *(float *)(pbVar39 + -0xd1)) break;
      if (lVar32 < lVar43) {
        *pbVar39 = bVar34;
        bVar49 = 2 < DAT_1409399a8;
        uVar13 = (uint)bVar49;
        if (bVar49 < DAT_1409399a8) {
          do {
            iVar8 = uVar13 - 1;
            if (iVar8 < 1) {
              iVar8 = 0;
            }
            bVar49 = bVar49 + 1;
            lVar15 = iVar8 + lVar42;
            *(undefined4 *)(lVar47 + 0x2c + lVar15 * 4) =
                 *(undefined4 *)(lVar47 + 0x14 + lVar15 * 4);
            *(undefined4 *)(lVar47 + 0x14 + lVar15 * 4) = 0;
            uVar13 = (uint)bVar49;
            uVar38 = DAT_1409399a8;
          } while (uVar13 < DAT_1409399a8);
          goto LAB_14034ed7e;
        }
LAB_14034ed83:
        *(int *)(pbVar39 + 0xb) = (int)plVar35[6];
        uVar38 = DAT_1409399a8;
      }
      else {
LAB_14034ed7e:
        if (*pbVar39 == bVar34) goto LAB_14034ed83;
      }
      lVar43 = lVar43 + 1;
      lVar42 = lVar42 + 0x3e;
      pbVar39 = pbVar39 + 0xf8;
    } while (lVar43 < (longlong)(ulonglong)uVar11);
  }
  local_12c = uVar27;
  if (bVar34 == 0x10) {
    uVar27 = local_138;
    if ((int)(uint)*(ushort *)((longlong)plVar35 + 0x14) <= (int)local_138) {
      uVar27 = (uint)*(ushort *)((longlong)plVar35 + 0x14);
    }
    if ((int)uVar23 <= (int)(uVar27 + iVar41)) {
      uVar11 = *(ushort *)(plVar35 + 2);
      uVar21 = *(ushort *)((longlong)plVar35 + 0x12);
      if (uVar11 <= uVar21) {
        auVar53 = ZEXT816(0);
        uVar22 = uVar11;
        do {
          fVar54 = *(float *)(*plVar35 +
                             (longlong)(int)((uVar23 - param_5) * (uint)param_3 + (uint)uVar22) * 4)
          ;
          uVar56 = 0;
          uVar57 = 0;
          if (fVar54 <= auVar53._0_4_) {
            uVar56 = auVar53._8_4_;
            uVar57 = auVar53._12_4_;
            fVar54 = auVar53._0_4_;
          }
          if (750.0 < (float)uVar22 * 500.0) break;
          uVar22 = uVar22 + 1;
          auVar53._4_4_ = 0;
          auVar53._0_4_ = fVar54;
          auVar53._8_4_ = uVar56;
          auVar53._12_4_ = uVar57;
        } while (uVar22 <= uVar21);
        if (uVar11 <= uVar21) {
          do {
            uVar27 = (uint)uVar11;
            fVar51 = *(float *)(*plVar35 +
                               (longlong)(int)(uVar27 + (uVar23 - param_5) * (uint)param_3) * 4);
            fVar58 = fVar51;
            if (750.0 < (float)uVar27 * 500.0) {
              fVar58 = fVar54;
              if (fVar51 <= fVar54) {
                fVar58 = fVar51;
              }
              fVar54 = (float)FUN_1402a0d40(0xfffffffb);
              fVar54 = fVar54 * fVar58;
            }
            if (0.0 < fVar58) {
              uVar13 = (uVar27 + 1) * (uint)param_4;
              iVar8 = param_4 * uVar27;
              uVar27 = uVar37;
              if ((int)uVar13 <= (int)uVar37) {
                uVar27 = uVar13;
              }
              lVar32 = (longlong)iVar8 * 0x3e;
              pfVar16 = (float *)(lVar47 + 0x14 + (longlong)iVar8 * 0xf8);
              for (; iVar8 < (int)uVar27; iVar8 = iVar8 + 1) {
                if (500.0 < pfVar16[-5]) {
                  if (uVar38 == 1) {
                    fVar51 = *pfVar16;
                  }
                  else {
                    fVar51 = (pfVar16[1] + *pfVar16) * 0.5;
                  }
                  if (0.0 < fVar51) {
                    bVar49 = 2 < uVar38;
                    uVar13 = (uint)bVar49;
                    if (bVar49 < uVar38) {
                      do {
                        iVar9 = uVar13 - 1;
                        if (iVar9 < 1) {
                          iVar9 = 0;
                        }
                        lVar43 = iVar9 + lVar32;
                        fVar51 = *(float *)(lVar47 + 0x14 + lVar43 * 4);
                        if (fVar58 <= fVar51) {
                          fVar51 = fVar58;
                        }
                        bVar49 = bVar49 + 1;
                        *(float *)(lVar47 + 0x2c + lVar43 * 4) =
                             fVar51 + *(float *)(lVar47 + 0x2c + lVar43 * 4);
                        *(float *)(lVar47 + 0x14 + lVar43 * 4) =
                             *(float *)(lVar47 + 0x14 + lVar43 * 4) - fVar51;
                        *(char *)((longlong)pfVar16 + 0xbd) = (char)plVar35[4];
                        pfVar16[0x32] = *(float *)(plVar35 + 6);
                        uVar13 = (uint)bVar49;
                        uVar38 = DAT_1409399a8;
                      } while (uVar13 < DAT_1409399a8);
                    }
                  }
                }
                lVar32 = lVar32 + 0x3e;
                pfVar16 = pfVar16 + 0x3e;
              }
            }
            uVar11 = uVar11 + 1;
          } while (uVar11 <= *(ushort *)((longlong)plVar35 + 0x12));
        }
      }
    }
  }
LAB_14034efff:
  uVar23 = uVar23 + 1;
  uVar13 = local_138;
  goto LAB_14034eaf2;
}

