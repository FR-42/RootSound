
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

void FUN_14031cf80(longlong param_1,int param_2,int param_3)

{
  byte *pbVar1;
  float fVar2;
  ushort uVar3;
  longlong lVar4;
  longlong *plVar5;
  longlong lVar6;
  undefined8 *puVar7;
  undefined4 uVar8;
  undefined4 uVar9;
  undefined4 uVar10;
  undefined8 uVar11;
  bool bVar12;
  int iVar13;
  char cVar14;
  int iVar15;
  undefined8 *puVar16;
  uint uVar17;
  longlong *plVar18;
  uint uVar19;
  int iVar20;
  uint uVar21;
  int iVar22;
  longlong lVar23;
  longlong lVar24;
  uint uVar25;
  uint uVar26;
  uint uVar27;
  ulonglong uVar28;
  longlong lVar29;
  void *_Dst;
  ulonglong uVar30;
  ulonglong uVar31;
  longlong lVar32;
  int iVar33;
  int iVar34;
  longlong lVar35;
  float fVar36;
  float fVar37;
  undefined1 auStack_388 [32];
  int local_368;
  longlong *local_360;
  uint local_358;
  uint local_354;
  longlong local_350;
  int local_348;
  longlong local_340;
  longlong local_338;
  longlong local_330;
  longlong local_328;
  longlong local_320;
  undefined8 local_318;
  undefined8 uStack_310;
  int iStack_2fc;
  undefined8 local_2f8 [23];
  longlong lStack_240;
  undefined1 local_238 [384];
  ulonglong local_b8;
  
  local_b8 = DAT_140972168 ^ (ulonglong)auStack_388;
  lVar32 = *(longlong *)(param_1 + 0x540);
  uVar25 = 0;
  plVar18 = *(longlong **)(param_1 + 0x638);
  if (*(int *)(param_1 + 0x548) != 0) {
    do {
      uVar31 = (ulonglong)uVar25;
      if ((((*(byte *)(lVar32 + 0xc + uVar31 * 0x28) & 1) == 0) &&
          (*(char *)(lVar32 + 0x24 + uVar31 * 0x28) != '\x01')) &&
         (lVar35 = *(longlong *)(lVar32 + uVar31 * 0x28), uVar17 = 0,
         *(short *)(lVar32 + 8 + uVar31 * 0x28) != 0)) {
        do {
          uVar19 = uVar17 + 1;
          pbVar1 = (byte *)((ulonglong)uVar17 * 0x5c + 0x48 + lVar35);
          *pbVar1 = *pbVar1 & 0xfe;
          uVar17 = uVar19;
        } while (uVar19 < *(ushort *)(lVar32 + 8 + uVar31 * 0x28));
      }
      uVar25 = uVar25 + 1;
    } while (uVar25 < *(uint *)(param_1 + 0x548));
  }
  iVar22 = DAT_1409399a8;
  local_360 = plVar18;
  local_348 = param_3;
  local_340 = param_1;
  local_338 = lVar32;
  if (param_2 < param_3) {
    do {
      uVar31 = 0;
      local_354 = 0;
      local_328 = (longlong)param_2 * 4;
      uVar25 = *(uint *)(local_328 + plVar18[2]);
      local_320 = *plVar18 + (ulonglong)(uint)(param_2 * 0x1500) * 8;
      lVar35 = plVar18[1] + (ulonglong)(uint)(param_2 * 0x1500) * 8;
      if (uVar25 != 0) {
        local_330 = 0;
        local_368 = param_2;
        local_358 = uVar25;
        local_350 = lVar35;
        do {
          lVar6 = local_320;
          lVar24 = local_330;
          uVar17 = (uint)uVar31;
          if ((*(byte *)(*(longlong *)(lVar35 + local_330 * 8) + 0x48) & 1) == 0) {
            lVar29 = *(longlong *)(local_320 + local_330 * 8);
            param_2 = local_368;
            if ((2 < (byte)(*(char *)(lVar29 + 0x24) - 0x10U)) && (*(char *)(lVar29 + 0x24) != '@'))
            {
              fVar37 = 0.0;
              if (uVar17 < uVar25) {
                uVar30 = uVar31;
                if (3 < uVar25 - uVar17) {
                  iVar15 = *(int *)(lVar29 + 0x10);
                  uVar19 = ((uVar25 - uVar17) - 4 >> 2) + 1;
                  lVar23 = local_320 - lVar35;
                  uVar28 = (ulonglong)uVar19;
                  plVar18 = (longlong *)(lVar35 + (uVar31 + 1) * 8);
                  uVar30 = (ulonglong)(uVar19 * 4 + uVar17);
                  do {
                    if (*(int *)(*(longlong *)(lVar23 + -8 + (longlong)plVar18) + 0x10) == iVar15) {
                      lVar4 = plVar18[-1];
                      if (iVar22 == 1) {
                        fVar2 = *(float *)(lVar4 + 8);
                      }
                      else {
                        fVar2 = (*(float *)(lVar4 + 0xc) + *(float *)(lVar4 + 8)) * 0.5;
                      }
                      fVar37 = fVar37 + fVar2;
                    }
                    if (*(int *)(*(longlong *)(lVar23 + (longlong)plVar18) + 0x10) == iVar15) {
                      lVar4 = *plVar18;
                      if (iVar22 == 1) {
                        fVar2 = *(float *)(lVar4 + 8);
                      }
                      else {
                        fVar2 = (*(float *)(lVar4 + 0xc) + *(float *)(lVar4 + 8)) * 0.5;
                      }
                      fVar37 = fVar37 + fVar2;
                    }
                    if (*(int *)(*(longlong *)(lVar23 + 8 + (longlong)plVar18) + 0x10) == iVar15) {
                      lVar4 = plVar18[1];
                      if (iVar22 == 1) {
                        fVar2 = *(float *)(lVar4 + 8);
                      }
                      else {
                        fVar2 = (*(float *)(lVar4 + 0xc) + *(float *)(lVar4 + 8)) * 0.5;
                      }
                      fVar37 = fVar37 + fVar2;
                    }
                    if (*(int *)(*(longlong *)(lVar23 + 0x10 + (longlong)plVar18) + 0x10) == iVar15)
                    {
                      lVar4 = plVar18[2];
                      if (iVar22 == 1) {
                        fVar2 = *(float *)(lVar4 + 8);
                      }
                      else {
                        fVar2 = (*(float *)(lVar4 + 0xc) + *(float *)(lVar4 + 8)) * 0.5;
                      }
                      fVar37 = fVar37 + fVar2;
                    }
                    plVar18 = plVar18 + 4;
                    uVar28 = uVar28 - 1;
                  } while (uVar28 != 0);
                }
                if ((uint)uVar30 < uVar25) {
                  uVar28 = (ulonglong)(uVar25 - (uint)uVar30);
                  plVar18 = (longlong *)(lVar35 + uVar30 * 8);
                  do {
                    if (*(int *)(*(longlong *)((longlong)plVar18 + (local_320 - lVar35)) + 0x10) ==
                        *(int *)(lVar29 + 0x10)) {
                      lVar23 = *plVar18;
                      if (iVar22 == 1) {
                        fVar2 = *(float *)(lVar23 + 8);
                      }
                      else {
                        fVar2 = (*(float *)(lVar23 + 0xc) + *(float *)(lVar23 + 8)) * 0.5;
                      }
                      fVar37 = fVar37 + fVar2;
                    }
                    plVar18 = plVar18 + 1;
                    uVar28 = uVar28 - 1;
                  } while (uVar28 != 0);
                }
              }
              if (uVar17 < uVar25) {
                uVar19 = uVar17;
                if (3 < uVar25 - uVar17) {
                  lVar29 = local_320 - lVar35;
                  uVar19 = ((uVar25 - uVar17) - 4 >> 2) + 1;
                  plVar18 = (longlong *)(lVar35 + (uVar31 + 1) * 8);
                  uVar31 = (ulonglong)uVar19;
                  uVar19 = uVar19 * 4 + uVar17;
                  do {
                    lVar23 = *(longlong *)(local_320 + local_330 * 8);
                    if (*(int *)(*(longlong *)((longlong)plVar18 + lVar29 + -8) + 0x10) ==
                        *(int *)(lVar23 + 0x10)) {
                      lVar23 = plVar18[-1];
                      *(float *)(lVar23 + 0x54) = fVar37;
                      pbVar1 = (byte *)(lVar23 + 0x48);
                      *pbVar1 = *pbVar1 | 1;
                      lVar23 = *(longlong *)(local_320 + local_330 * 8);
                    }
                    if (*(int *)(*(longlong *)((longlong)plVar18 + lVar29) + 0x10) ==
                        *(int *)(lVar23 + 0x10)) {
                      lVar23 = *plVar18;
                      *(float *)(lVar23 + 0x54) = fVar37;
                      pbVar1 = (byte *)(lVar23 + 0x48);
                      *pbVar1 = *pbVar1 | 1;
                      lVar23 = *(longlong *)(local_320 + local_330 * 8);
                    }
                    if (*(int *)(*(longlong *)((longlong)plVar18 + lVar29 + 8) + 0x10) ==
                        *(int *)(lVar23 + 0x10)) {
                      lVar23 = plVar18[1];
                      *(float *)(lVar23 + 0x54) = fVar37;
                      pbVar1 = (byte *)(lVar23 + 0x48);
                      *pbVar1 = *pbVar1 | 1;
                      lVar23 = *(longlong *)(local_320 + local_330 * 8);
                    }
                    if (*(int *)(*(longlong *)((longlong)plVar18 + lVar29 + 0x10) + 0x10) ==
                        *(int *)(lVar23 + 0x10)) {
                      lVar23 = plVar18[2];
                      *(float *)(lVar23 + 0x54) = fVar37;
                      pbVar1 = (byte *)(lVar23 + 0x48);
                      *pbVar1 = *pbVar1 | 1;
                    }
                    plVar18 = plVar18 + 4;
                    uVar31 = uVar31 - 1;
                    iVar22 = DAT_1409399a8;
                  } while (uVar31 != 0);
                }
                if (uVar19 < uVar25) {
                  uVar31 = (ulonglong)(uVar25 - uVar19);
                  plVar18 = (longlong *)(lVar35 + (ulonglong)uVar19 * 8);
                  do {
                    if (*(int *)(*(longlong *)((longlong)plVar18 + (local_320 - lVar35)) + 0x10) ==
                        *(int *)(*(longlong *)(local_320 + local_330 * 8) + 0x10)) {
                      lVar29 = *plVar18;
                      *(float *)(lVar29 + 0x54) = fVar37;
                      pbVar1 = (byte *)(lVar29 + 0x48);
                      *pbVar1 = *pbVar1 | 1;
                    }
                    plVar18 = plVar18 + 1;
                    uVar31 = uVar31 - 1;
                    iVar22 = DAT_1409399a8;
                  } while (uVar31 != 0);
                }
              }
              plVar5 = *(longlong **)(local_320 + local_330 * 8);
              uVar19 = local_368 - *(short *)((longlong)plVar5 + 10);
              iVar20 = (int)(DAT_14098a1ac * 0.05 + 0.5);
              iVar15 = 1;
              if (1 < iVar20) {
                iVar15 = iVar20;
              }
              plVar18 = local_360;
              lVar35 = local_350;
              if (iVar15 < (int)uVar19) {
                iVar15 = 1;
                if (1 < iVar20) {
                  iVar15 = iVar20;
                }
                if ((int)uVar19 <= (int)((uint)*(ushort *)(plVar5 + 1) - iVar15)) {
                  lVar29 = (ulonglong)(uVar19 - 1) * 0x5c;
                  if ((*(byte *)(lVar29 + 0x48 + *plVar5) & 1) == 0) {
                    fVar2 = 0.0;
                  }
                  else {
                    fVar2 = *(float *)(lVar29 + 0x54 + *plVar5);
                  }
                  fVar36 = fVar2 * 2.3713737;
                  if (fVar36 <= 384.0) {
                    fVar36 = 384.0;
                  }
                  if (((fVar36 < fVar37) || ((256.0 < fVar2 && (fVar37 < fVar2 * 0.707107)))) &&
                     (cVar14 = FUN_1403459e0(param_1,0x30), plVar18 = local_360, lVar35 = local_350,
                     param_2 = local_368, cVar14 != '\0')) {
                    lVar29 = 3;
                    puVar16 = local_2f8;
                    do {
                      *puVar16 = 0xffffffffffffffff;
                      puVar16[1] = 0xffffffffffffffff;
                      puVar16[2] = 0xffffffffffffffff;
                      puVar16[3] = 0xffffffffffffffff;
                      puVar16[4] = 0xffffffffffffffff;
                      puVar16[5] = 0xffffffffffffffff;
                      puVar16[6] = 0xffffffffffffffff;
                      puVar16[7] = 0xffffffffffffffff;
                      lVar29 = lVar29 + -1;
                      puVar16 = puVar16 + 8;
                    } while (lVar29 != 0);
                    uVar26 = *(uint *)(param_1 + 0x548);
                    uVar21 = 1;
                    uVar31 = 0;
                    if (uVar26 != 0) {
                      do {
                        if ((*(byte *)(lVar32 + 0xc + uVar31 * 0x28) & 1) != 0) {
                          uVar27 = uVar21 - 1;
                          uVar21 = uVar21 + 1;
                          *(int *)((longlong)local_2f8 + (ulonglong)uVar27 * 4) = (int)uVar31;
                          if (0x30 < uVar21) goto LAB_14031d688;
                        }
                        uVar27 = (int)uVar31 + 1;
                        uVar31 = (ulonglong)uVar27;
                      } while (uVar27 < uVar26);
                      if (0x30 < uVar21) {
LAB_14031d688:
                        WaitForSingleObject(DAT_140989f08,0xffffffff);
                        iVar20 = DAT_140989fe8;
                        DAT_140989fe8 = DAT_140989fe8 + 1;
                        ReleaseMutex(DAT_140989f08);
                        lVar32 = *(longlong *)(lVar6 + lVar24 * 8);
                        local_318 = *(undefined8 *)(lVar32 + 0x10);
                        uStack_310 = *(undefined8 *)(lVar32 + 0x18);
                        memset(local_238,0,0x180);
                        iVar33 = 0;
                        iVar13 = (int)local_318;
                        iVar22 = DAT_1409399a8;
                        iVar15 = local_368;
                        lVar29 = local_328;
                        iVar34 = 0;
                        if (local_354 < local_358) {
                          plVar18 = (longlong *)(lVar6 + (ulonglong)local_354 * 8);
                          uVar25 = local_354;
                          do {
                            lVar32 = *plVar18;
                            if ((*(byte *)(lVar32 + 0xc) & 1) == 0) {
                              iVar22 = DAT_1409399a8;
                              iVar15 = local_368;
                              lVar29 = local_328;
                              iVar34 = iVar33;
                              if (*(int *)(lVar32 + 0x10) != iVar13) break;
                              iVar22 = (&iStack_2fc)[*(byte *)(lVar32 + 0x25)];
                              if (-1 < iVar22) {
                                uVar17 = *(uint *)(local_340 + 0x580);
                                if (uVar17 < *(uint *)(local_340 + 0x560)) {
                                  do {
                                    if (*(char *)(*(longlong *)(local_340 + 0x558) +
                                                 (ulonglong)uVar17) == '\0') {
                                      *(undefined1 *)
                                       (*(longlong *)(local_340 + 0x558) + (ulonglong)uVar17) = 1;
                                      *(int *)(local_340 + 0x580) = *(int *)(local_340 + 0x580) + 1;
                                      _Dst = (void *)((ulonglong)
                                                      (*(int *)(local_340 + 0x564) * uVar17) * 0x5c
                                                     + *(longlong *)(local_340 + 0x550));
                                      if (_Dst != (void *)0x0) {
                                        puVar16 = (undefined8 *)
                                                  (local_338 + (longlong)iVar22 * 0x28);
                                        puVar7 = (undefined8 *)*plVar18;
                                        uVar11 = puVar7[1];
                                        *puVar16 = *puVar7;
                                        puVar16[1] = uVar11;
                                        uVar8 = *(undefined4 *)((longlong)puVar7 + 0x14);
                                        uVar9 = *(undefined4 *)(puVar7 + 3);
                                        uVar10 = *(undefined4 *)((longlong)puVar7 + 0x1c);
                                        *(undefined4 *)(puVar16 + 2) = *(undefined4 *)(puVar7 + 2);
                                        *(undefined4 *)((longlong)puVar16 + 0x14) = uVar8;
                                        *(undefined4 *)(puVar16 + 3) = uVar9;
                                        *(undefined4 *)((longlong)puVar16 + 0x1c) = uVar10;
                                        puVar16[4] = puVar7[4];
                                        *(short *)(puVar16 + 1) =
                                             *(short *)(puVar16 + 1) - (short)uVar19;
                                        *(short *)((longlong)puVar16 + 10) = (short)local_368;
                                        *puVar16 = _Dst;
                                        memcpy(_Dst,(void *)((ulonglong)uVar19 * 0x5c +
                                                            *(longlong *)*plVar18),
                                               (ulonglong)*(ushort *)(puVar16 + 1) * 0x5c);
                                        *(int *)(puVar16 + 2) = iVar20;
                                        *(short *)(*plVar18 + 8) = (short)uVar19;
                                        if (*(int *)(local_340 + 0x548) <= iVar22) {
                                          *(int *)(local_340 + 0x548) = iVar22 + 1;
                                        }
                                        uVar3 = *(ushort *)(puVar16 + 1);
                                        (&lStack_240)[*(byte *)(*plVar18 + 0x25)] =
                                             (longlong)puVar16;
                                        iVar22 = (uint)uVar3 +
                                                 (int)*(short *)((longlong)puVar16 + 10);
                                        if (iVar33 < iVar22) {
                                          iVar33 = iVar22;
                                        }
                                        goto LAB_14031d753;
                                      }
                                      break;
                                    }
                                    uVar17 = uVar17 + 1;
                                  } while (uVar17 < *(uint *)(local_340 + 0x560));
                                }
                              }
                              pbVar1 = (byte *)(local_338 + 0xc + (longlong)iVar22 * 0x28);
                              *pbVar1 = *pbVar1 | 1;
                            }
LAB_14031d753:
                            uVar25 = uVar25 + 1;
                            plVar18 = plVar18 + 1;
                            iVar22 = DAT_1409399a8;
                            iVar15 = local_368;
                            lVar29 = local_328;
                            iVar34 = iVar33;
                          } while (uVar25 < local_358);
                        }
                        for (; plVar18 = local_360, lVar24 = local_330, param_1 = local_340,
                            lVar32 = local_338, lVar35 = local_350, uVar25 = local_358,
                            uVar17 = local_354, DAT_1409399a8 = iVar22, param_2 = local_368,
                            iVar15 < iVar34; iVar15 = iVar15 + 1) {
                          uVar31 = 0;
                          bVar12 = false;
                          lVar35 = local_360[2];
                          lVar32 = *local_360 + (ulonglong)(uint)(iVar15 * 0x1500) * 8;
                          lVar24 = local_360[1];
                          if (*(int *)(lVar29 + lVar35) != 0) {
                            do {
                              lVar6 = *(longlong *)(lVar32 + uVar31 * 8);
                              if ((*(byte *)(lVar6 + 0xc) & 1) == 0) {
                                if ((*(int *)(lVar6 + 0x10) == iVar13) &&
                                   (plVar18 = (longlong *)(&lStack_240)[*(byte *)(lVar6 + 0x25)],
                                   plVar18 != (longlong *)0x0)) {
                                  *(longlong **)(lVar32 + uVar31 * 8) = plVar18;
                                  bVar12 = true;
                                  *(ulonglong *)
                                   (lVar24 + (ulonglong)(uint)(iVar15 * 0x1500) * 8 + uVar31 * 8) =
                                       (ulonglong)
                                       (uint)(iVar15 - *(short *)((longlong)plVar18 + 10)) * 0x5c +
                                       *plVar18;
                                }
                                else if (bVar12) break;
                              }
                              uVar25 = (int)uVar31 + 1;
                              uVar31 = (ulonglong)uVar25;
                            } while (uVar25 < *(uint *)(lVar29 + lVar35));
                          }
                          iVar22 = DAT_1409399a8;
                          lVar29 = lVar29 + 4;
                        }
                        goto LAB_14031d5d6;
                      }
                    }
                    for (; uVar26 < 0x3c00; uVar26 = uVar26 + 1) {
                      uVar27 = uVar21 - 1;
                      uVar21 = uVar21 + 1;
                      *(uint *)((longlong)local_2f8 + (ulonglong)uVar27 * 4) = uVar26;
                      if (0x30 < uVar21) goto LAB_14031d688;
                    }
                  }
                }
              }
            }
          }
LAB_14031d5d6:
          local_354 = uVar17 + 1;
          uVar31 = (ulonglong)local_354;
          local_330 = lVar24 + 1;
        } while (local_354 < uVar25);
      }
      param_2 = param_2 + 1;
    } while (param_2 < local_348);
  }
  return;
}

