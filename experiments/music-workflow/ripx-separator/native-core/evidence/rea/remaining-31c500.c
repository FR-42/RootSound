
void FUN_14031c500(longlong param_1,longlong param_2,longlong *param_3,int param_4,byte param_5,
                  byte param_6,byte param_7,byte param_8,undefined1 param_9,char param_10,
                  char param_11)

{
  uint uVar1;
  undefined4 *puVar2;
  ulonglong uVar3;
  float *pfVar4;
  float *pfVar5;
  undefined4 uVar6;
  longlong lVar7;
  longlong lVar8;
  double dVar9;
  float fVar10;
  float fVar11;
  float fVar12;
  float fVar13;
  float fVar14;
  float fVar15;
  float fVar16;
  float fVar17;
  float fVar18;
  float fVar19;
  float fVar20;
  float fVar21;
  float fVar22;
  int iVar23;
  int iVar24;
  int iVar25;
  float *pfVar26;
  uint uVar27;
  ulonglong uVar28;
  longlong lVar29;
  longlong lVar30;
  longlong lVar31;
  int iVar32;
  uint uVar33;
  longlong lVar34;
  longlong lVar35;
  longlong lVar36;
  uint uVar37;
  longlong lVar38;
  byte bVar39;
  int iVar40;
  int iVar41;
  byte bVar42;
  float fVar43;
  float fVar44;
  double dVar45;
  double dVar46;
  float fVar47;
  float fVar48;
  float fVar49;
  byte local_127;
  undefined4 local_108;
  undefined4 uStack_104;
  undefined4 uStack_100;
  undefined4 uStack_fc;
  longlong local_f8;
  ulonglong local_f0;
  longlong local_e8;
  
  lVar7 = *param_3;
  uVar37 = param_4 - *(short *)((longlong)param_3 + 10);
  uVar1 = uVar37 - 1;
  if (uVar37 == 0) {
    uVar1 = 0;
  }
  uVar33 = param_8 ^ 1;
  do {
    uVar27 = 0;
    if (param_8 == 0) {
      uVar27 = *(uint *)(param_1 + 0xc0);
    }
    if (uVar27 < uVar33) {
      return;
    }
    bVar39 = param_7 ^ 1;
    if (bVar39 <= param_6) {
      do {
        if ((bVar39 == 0) && (local_127 = param_8, param_8 == 0)) {
          if (uVar33 < 2) {
LAB_14031c6a5:
            if (uVar33 == 0) goto LAB_14031c6cc;
            uVar28 = (ulonglong)(bVar39 == 0);
            fVar43 = *(float *)(*(longlong *)(param_1 + 200) + 0x10 +
                               ((ulonglong)(uVar33 - 1) * 0x10 + uVar28) * 4);
LAB_14031c6e3:
            iVar40 = DAT_14098a1a8;
            if (uVar33 != 0) {
              iVar40 = *(int *)(*(longlong *)(param_1 + 200) + 0x20 +
                               ((ulonglong)(uVar33 - 1) * 0x10 + uVar28) * 4);
            }
            iVar41 = iVar40 * param_4;
            iVar32 = (*(int *)(param_1 + 0x24) + *(int *)(param_1 + 0x28) * 2) * iVar40;
            bVar42 = 2 < DAT_1409399a8;
            uVar27 = (uint)bVar42;
            if (bVar42 < DAT_1409399a8) {
              uVar28 = (ulonglong)uVar37;
              lVar30 = uVar28 * 0x17 + (ulonglong)param_5 * 6;
              local_f0 = uVar28;
              local_e8 = lVar30;
              do {
                iVar23 = uVar27 - 1;
                lVar31 = param_2 + (ulonglong)bVar42 * 0x48;
                if (iVar23 < 1) {
                  iVar23 = 0;
                }
                fVar49 = *(float *)(lVar7 + 8 + (iVar23 + lVar30) * 4);
                if (62.0 <= fVar49) {
                  uVar6 = *(undefined4 *)(lVar7 + (iVar23 + lVar30) * 4);
                  fVar47 = *(float *)(uVar28 * 0x5c + lVar7 + 0x10 + (ulonglong)param_5 * 0x18);
                  if (fVar47 != 0.0) {
                    local_f8 = lVar31;
                    if (0.0 < fVar49) {
                      dVar9 = pow((double)fVar49 / 32767.0,1.6609640475208238);
                      fVar49 = (float)dVar9 * 32767.0;
                    }
                    else {
                      fVar49 = 0.0;
                    }
                    if (param_10 != '\0') {
                      fVar49 = (float)((int)(fVar49 + 0.5) & 0xffff);
                    }
                    if (local_127 != 0) {
                      fVar48 = (fVar47 * 512.0) / (float)DAT_14098a154;
                      if (255.0 <= fVar48) {
                        fVar48 = 255.0;
                      }
                      else if (fVar48 <= 1.0) {
                        fVar48 = 1.0;
                      }
                      fVar44 = floorf(fVar48 + 0.5001);
                      iVar23 = (int)fVar44;
                      lVar30 = (longlong)iVar23;
                      fVar48 = fVar48 - (float)iVar23;
                      if (fVar48 < 0.0) {
                        if (iVar23 < 2) {
                          dVar9 = 0.0;
                        }
                        else {
                          puVar2 = (undefined4 *)
                                   (*(longlong *)
                                     ((ulonglong)(uVar33 - 1) * 0x40 + 0x38 +
                                     *(longlong *)(param_1 + 200)) + -0x10 + lVar30 * 0x10);
                          local_108 = *puVar2;
                          uStack_104 = puVar2[1];
                          uStack_100 = puVar2[2];
                          uStack_fc = puVar2[3];
                          dVar9 = (double)FUN_140614580(&local_108);
                          dVar9 = dVar9 * (double)-fVar48;
                        }
                        puVar2 = (undefined4 *)
                                 (*(longlong *)
                                   ((ulonglong)(uVar33 - 1) * 0x40 + 0x38 +
                                   *(longlong *)(param_1 + 200)) + lVar30 * 0x10);
                        local_108 = *puVar2;
                        uStack_104 = puVar2[1];
                        uStack_100 = puVar2[2];
                        uStack_fc = puVar2[3];
                        dVar45 = (double)FUN_140614580(&local_108);
                        dVar46 = (double)fVar48 + 1.0;
                      }
                      else {
                        if (iVar23 < 0xff) {
                          puVar2 = (undefined4 *)
                                   (*(longlong *)
                                     ((ulonglong)(uVar33 - 1) * 0x40 + 0x38 +
                                     *(longlong *)(param_1 + 200)) + (lVar30 + 1) * 0x10);
                          local_108 = *puVar2;
                          uStack_104 = puVar2[1];
                          uStack_100 = puVar2[2];
                          uStack_fc = puVar2[3];
                          dVar9 = (double)FUN_140614580(&local_108);
                          dVar9 = dVar9 * (double)fVar48;
                        }
                        else {
                          dVar9 = 0.0;
                        }
                        puVar2 = (undefined4 *)
                                 (*(longlong *)
                                   ((ulonglong)(uVar33 - 1) * 0x40 + 0x38 +
                                   *(longlong *)(param_1 + 200)) + lVar30 * 0x10);
                        local_108 = *puVar2;
                        uStack_104 = puVar2[1];
                        uStack_100 = puVar2[2];
                        uStack_fc = puVar2[3];
                        dVar45 = (double)FUN_140614580(&local_108);
                        dVar46 = 1.0 - (double)fVar48;
                      }
                      fVar49 = (float)((dVar45 * dVar46 + dVar9) * (double)fVar49);
                      lVar31 = local_f8;
                    }
                    uVar28 = local_f0;
                    lVar30 = local_e8;
                    if (1.0 <= fVar49) {
                      if ((bVar39 == 0) && (param_8 == 0)) {
                        iVar23 = *(int *)(param_1 + 0xc0);
                      }
                      else {
                        iVar23 = 0;
                      }
                      FUN_1403190b0(*(undefined8 *)(lVar31 + (ulonglong)(uVar33 + iVar23) * 8),
                                    iVar41,iVar32,iVar40,(int)fVar43,-fVar49,fVar47,uVar6,param_9);
                      uVar28 = local_f0;
                      lVar30 = local_e8;
                    }
                  }
                }
                bVar42 = bVar42 + 1;
                uVar27 = (uint)bVar42;
              } while (uVar27 < DAT_1409399a8);
            }
            if ((param_11 != '\0') && (2 < DAT_1409399a8)) {
              iVar24 = iVar40 / 2;
              iVar23 = iVar41;
              if (iVar24 < iVar41) {
                iVar23 = iVar24;
              }
              iVar32 = iVar32 - (iVar41 + iVar40);
              if (iVar32 <= iVar24) {
                iVar24 = iVar32;
              }
              if ((bVar39 == 0) && (param_8 == 0)) {
                iVar32 = *(int *)(param_1 + 0xc0);
              }
              else {
                iVar32 = 0;
              }
              lVar30 = *(longlong *)(param_2 + 0x48 + (ulonglong)(iVar32 + uVar33) * 8);
              iVar32 = 0;
              iVar25 = iVar32;
              if ((bVar39 == 0) && (param_8 == 0)) {
                iVar25 = *(int *)(param_1 + 0xc0);
              }
              lVar31 = *(longlong *)(param_2 + 0x90 + (ulonglong)(iVar25 + uVar33) * 8);
              if ((bVar39 == 0) && (param_8 == 0)) {
                iVar32 = *(int *)(param_1 + 0xc0);
              }
              iVar23 = iVar41 - iVar23;
              iVar24 = iVar41 + iVar40 + iVar24;
              lVar8 = *(longlong *)(param_2 + (ulonglong)(iVar32 + uVar33) * 8);
              if ((iVar23 < iVar24) && (0xf < (uint)(iVar24 - iVar23))) {
                lVar29 = (longlong)iVar23;
                lVar34 = (longlong)(iVar24 + -1);
                uVar28 = lVar8 + lVar29 * 4;
                uVar3 = lVar8 + lVar34 * 4;
                if ((((ulonglong)(lVar30 + lVar34 * 4) < uVar28) ||
                    (uVar3 < (ulonglong)(lVar30 + lVar29 * 4))) &&
                   (((ulonglong)(lVar31 + lVar34 * 4) < uVar28 ||
                    (uVar3 < (ulonglong)(lVar31 + lVar29 * 4))))) {
                  uVar27 = iVar24 - iVar23 & 0x8000000f;
                  if ((int)uVar27 < 0) {
                    uVar27 = (uVar27 - 1 | 0xfffffff0) + 1;
                  }
                  lVar34 = lVar31 - lVar30;
                  pfVar26 = (float *)(lVar30 + (lVar29 + 4) * 4);
                  lVar35 = lVar8 - lVar30;
                  do {
                    fVar43 = pfVar26[-3];
                    fVar49 = pfVar26[-2];
                    fVar47 = pfVar26[-1];
                    iVar23 = iVar23 + 0x10;
                    lVar29 = lVar29 + 0x10;
                    pfVar5 = (float *)(lVar34 + -0x10 + (longlong)pfVar26);
                    fVar48 = pfVar5[1];
                    fVar44 = pfVar5[2];
                    fVar10 = pfVar5[3];
                    pfVar4 = (float *)(lVar34 + (longlong)pfVar26);
                    fVar11 = *pfVar4;
                    fVar12 = pfVar4[1];
                    fVar13 = pfVar4[2];
                    fVar14 = pfVar4[3];
                    fVar15 = *pfVar26;
                    fVar16 = pfVar26[1];
                    fVar17 = pfVar26[2];
                    fVar18 = pfVar26[3];
                    fVar19 = pfVar26[4];
                    fVar20 = pfVar26[5];
                    fVar21 = pfVar26[6];
                    fVar22 = pfVar26[7];
                    pfVar4 = (float *)(lVar35 + -0x10 + (longlong)pfVar26);
                    *pfVar4 = (*pfVar5 + pfVar26[-4]) * 0.5;
                    pfVar4[1] = (fVar48 + fVar43) * 0.5;
                    pfVar4[2] = (fVar44 + fVar49) * 0.5;
                    pfVar4[3] = (fVar10 + fVar47) * 0.5;
                    pfVar4 = (float *)(lVar34 + 0x10 + (longlong)pfVar26);
                    fVar43 = *pfVar4;
                    fVar49 = pfVar4[1];
                    fVar47 = pfVar4[2];
                    fVar48 = pfVar4[3];
                    pfVar4 = (float *)(lVar35 + (longlong)pfVar26);
                    *pfVar4 = (fVar11 + fVar15) * 0.5;
                    pfVar4[1] = (fVar12 + fVar16) * 0.5;
                    pfVar4[2] = (fVar13 + fVar17) * 0.5;
                    pfVar4[3] = (fVar14 + fVar18) * 0.5;
                    pfVar4 = (float *)(lVar34 + 0x20 + (longlong)pfVar26);
                    fVar44 = *pfVar4;
                    fVar10 = pfVar4[1];
                    fVar11 = pfVar4[2];
                    fVar12 = pfVar4[3];
                    fVar13 = pfVar26[8];
                    fVar14 = pfVar26[9];
                    fVar15 = pfVar26[10];
                    fVar16 = pfVar26[0xb];
                    pfVar4 = (float *)(lVar35 + 0x10 + (longlong)pfVar26);
                    *pfVar4 = (fVar43 + fVar19) * 0.5;
                    pfVar4[1] = (fVar49 + fVar20) * 0.5;
                    pfVar4[2] = (fVar47 + fVar21) * 0.5;
                    pfVar4[3] = (fVar48 + fVar22) * 0.5;
                    pfVar4 = (float *)(lVar35 + 0x20 + (longlong)pfVar26);
                    *pfVar4 = (fVar44 + fVar13) * 0.5;
                    pfVar4[1] = (fVar10 + fVar14) * 0.5;
                    pfVar4[2] = (fVar11 + fVar15) * 0.5;
                    pfVar4[3] = (fVar12 + fVar16) * 0.5;
                    pfVar26 = pfVar26 + 0x10;
                  } while (lVar29 < (int)(iVar24 - uVar27));
                }
              }
              lVar29 = (longlong)iVar23;
              lVar34 = (longlong)iVar24;
              if (lVar29 < lVar34) {
                if (3 < lVar34 - lVar29) {
                  pfVar26 = (float *)(lVar30 + (lVar29 + 1) * 4);
                  lVar35 = lVar31 - lVar30;
                  lVar36 = lVar8 - lVar30;
                  lVar38 = ((lVar34 - lVar29) - 4U >> 2) + 1;
                  lVar29 = lVar29 + lVar38 * 4;
                  do {
                    *(float *)((longlong)pfVar26 + lVar36 + -4) =
                         (*(float *)((longlong)pfVar26 + lVar35 + -4) + pfVar26[-1]) * 0.5;
                    *(float *)((longlong)pfVar26 + lVar36) =
                         (*(float *)((longlong)pfVar26 + lVar35) + *pfVar26) * 0.5;
                    *(float *)(lVar36 + 4 + (longlong)pfVar26) =
                         (*(float *)(lVar35 + 4 + (longlong)pfVar26) + pfVar26[1]) * 0.5;
                    *(float *)(lVar36 + 8 + (longlong)pfVar26) =
                         (*(float *)(lVar35 + 8 + (longlong)pfVar26) + pfVar26[2]) * 0.5;
                    pfVar26 = pfVar26 + 4;
                    lVar38 = lVar38 + -1;
                  } while (lVar38 != 0);
                }
                if (lVar29 < lVar34) {
                  pfVar26 = (float *)(lVar30 + lVar29 * 4);
                  lVar34 = lVar34 - lVar29;
                  do {
                    *(float *)((lVar8 - lVar30) + (longlong)pfVar26) =
                         (*(float *)((lVar31 - lVar30) + (longlong)pfVar26) + *pfVar26) * 0.5;
                    pfVar26 = pfVar26 + 1;
                    lVar34 = lVar34 + -1;
                  } while (lVar34 != 0);
                }
              }
            }
          }
        }
        else {
          local_127 = uVar33 != 0;
          if (uVar33 == 0) {
LAB_14031c6cc:
            uVar28 = (ulonglong)(bVar39 == 0);
            fVar43 = (float)DAT_14098a154;
            goto LAB_14031c6e3;
          }
          fVar43 = *(float *)((ulonglong)uVar1 * 0x5c + (ulonglong)param_5 * 0x18 + 0x10 + lVar7);
          fVar49 = *(float *)((ulonglong)uVar37 * 0x5c + (ulonglong)param_5 * 0x18 + 0x10 + lVar7);
          fVar47 = fVar49;
          if (fVar49 < fVar43) {
            fVar47 = fVar43;
          }
          lVar30 = (ulonglong)(uVar33 - 1) * 0x40;
          pfVar26 = (float *)(lVar30 + 0xc + *(longlong *)(param_1 + 200));
          if (*pfVar26 <= fVar47 && fVar47 != *pfVar26) break;
          if (fVar49 <= fVar43) {
            fVar43 = fVar49;
          }
          if (*(float *)(lVar30 + 8 + *(longlong *)(param_1 + 200)) <= fVar43) goto LAB_14031c6a5;
        }
        bVar39 = bVar39 + 1;
      } while (bVar39 <= param_6);
    }
    uVar33 = uVar33 + 1;
  } while( true );
}

