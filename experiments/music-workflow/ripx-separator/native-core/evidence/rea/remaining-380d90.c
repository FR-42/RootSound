
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

undefined8
FUN_140380d90(byte *param_1,int *param_2,longlong *param_3,int param_4,double param_5,double param_6
             ,int param_7)

{
  byte *pbVar1;
  int iVar2;
  longlong lVar3;
  uint uVar4;
  byte bVar5;
  short sVar6;
  int iVar7;
  int iVar8;
  int iVar9;
  int iVar10;
  byte bVar11;
  byte bVar12;
  int iVar13;
  int iVar14;
  int iVar15;
  ulonglong uVar16;
  int iVar17;
  uint uVar18;
  uint uVar19;
  int iVar20;
  char *pcVar21;
  uint uVar22;
  byte *pbVar23;
  longlong *plVar24;
  ulonglong uVar25;
  float extraout_XMM0_Da;
  float extraout_XMM0_Da_00;
  double dVar26;
  float fVar27;
  float fVar28;
  double dVar29;
  float fVar30;
  float fVar31;
  float fVar32;
  undefined1 auStack_208 [32];
  undefined4 local_1e8;
  undefined8 local_1e0;
  float local_1d8;
  float local_1d4;
  byte *local_1d0;
  int local_1c8;
  longlong *local_1c0;
  char *local_1b8;
  int local_1b0;
  float local_1a8 [48];
  ulonglong local_e8;
  
  local_e8 = DAT_140972168 ^ (ulonglong)auStack_208;
  if ((-1 < param_7) || (param_7 = DAT_14098a1b0, -1 < DAT_14098a1b0)) {
    local_1d0 = param_1;
    local_1c0 = param_3;
    local_1b0 = param_4;
    memset(param_1,0,0x194);
    local_1d8 = 0.0;
    local_1d4 = 0.0;
    fVar28 = *(float *)(&DAT_1409c3720 + (longlong)param_7 * 0x6ab78);
    memset(local_1a8,0,0xc0);
    iVar15 = (int)*param_3;
    local_1b8 = (char *)((longlong)param_2 + 0x61);
    fVar32 = 0.0;
    fVar31 = 0.0;
    while( true ) {
      iVar13 = param_2[1];
      iVar2 = (int)*param_3;
      iVar7 = iVar2 + param_4;
      if (iVar13 <= iVar2 + param_4) {
        iVar7 = iVar13;
      }
      local_1c8 = iVar15;
      if (iVar7 <= iVar15) break;
      uVar25 = 0;
      local_1e0 = 0;
      local_1e8 = 0;
      FUN_14036a7f0(param_2,iVar15,0xffffffff,0);
      dVar29 = (double)extraout_XMM0_Da;
      if (((0.0 <= param_5) && (0.0 <= param_6)) && ((dVar29 < param_5 || (param_6 < dVar29)))) {
        *(int *)param_3 = iVar15;
        return 0;
      }
      iVar13 = param_2[1];
      iVar2 = *param_2;
      if (iVar2 < iVar13) {
        if ((short)param_2[0x87] < 0) {
          fVar30 = **(float **)(param_2 + 2);
        }
        else {
          iVar7 = iVar15;
          if (iVar15 < iVar2) {
            iVar7 = iVar2;
          }
          if (iVar13 <= iVar7) {
            iVar7 = iVar13 + -1;
          }
          fVar30 = *(float *)(*(longlong *)(param_2 + 2) + (ulonglong)(uint)(iVar7 - iVar2) * 4);
        }
      }
      else {
        fVar30 = 0.0;
      }
      local_1d8 = (float)((double)fVar30 * dVar29 + (double)fVar32);
      local_1d4 = (float)((double)fVar31 + dVar29);
      if ((char)param_2[0x18] != '\0') {
        fVar32 = (float)param_4;
        pbVar23 = local_1d0;
        do {
          iVar13 = 0;
          uVar22 = (uint)uVar25;
          uVar19 = uVar22;
          if (*(byte *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x2c) != 0) {
            uVar19 = *(byte *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x2c) - 1;
          }
          bVar11 = (char)uVar19 + 1;
          if (bVar11 <= *pbVar23) {
            bVar11 = *pbVar23;
          }
          *pbVar23 = bVar11;
          if (uVar22 < *(byte *)(param_2 + 0x18)) {
            iVar2 = param_2[1];
            iVar7 = *param_2;
            bVar11 = *(byte *)((longlong)param_2 + uVar25 + 0x61);
            if (iVar2 <= iVar7) goto LAB_14038111e;
            fVar31 = 0.0;
            iVar14 = iVar15;
            if (iVar15 < iVar7) {
              iVar14 = iVar7;
            }
            iVar20 = iVar2 + -1;
            if (iVar14 < iVar2) {
              iVar20 = iVar14;
            }
            if (3 < bVar11) {
              iVar14 = 2;
              iVar17 = iVar2 - iVar7;
              lVar3 = **(longlong **)(param_2 + uVar25 * 2 + 0x26);
              do {
                iVar8 = iVar17 * iVar13;
                iVar13 = iVar13 + 4;
                iVar9 = iVar14 + -1;
                iVar10 = iVar14 * iVar17;
                iVar15 = iVar14 + 1;
                iVar14 = iVar14 + 4;
                fVar31 = (float)*(ushort *)(lVar3 + (ulonglong)(uint)((iVar8 - iVar7) + iVar20) * 2)
                         + fVar31 +
                         (float)*(ushort *)
                                 (lVar3 + (ulonglong)(uint)((iVar9 * iVar17 - iVar7) + iVar20) * 2)
                         + (float)*(ushort *)
                                   (lVar3 + (ulonglong)(uint)((iVar10 - iVar7) + iVar20) * 2) +
                         (float)*(ushort *)
                                 (lVar3 + (ulonglong)(uint)((iVar15 * iVar17 - iVar7) + iVar20) * 2)
                ;
                pbVar23 = local_1d0;
                iVar15 = local_1c8;
              } while (iVar13 < (int)(bVar11 - 3));
            }
            if (iVar13 < (int)(uint)bVar11) {
              do {
                iVar14 = (iVar2 - iVar7) * iVar13;
                iVar13 = iVar13 + 1;
                fVar31 = fVar31 + (float)*(ushort *)
                                          (**(longlong **)(param_2 + uVar25 * 2 + 0x26) +
                                          (ulonglong)(uint)((iVar14 - iVar7) + iVar20) * 2);
              } while (iVar13 < (int)(uint)bVar11);
            }
          }
          else {
LAB_14038111e:
            fVar31 = 0.0;
          }
          uVar18 = 0;
          uVar16 = (ulonglong)uVar19;
          *(float *)(pbVar23 + uVar16 * 4 + 4) =
               fVar31 / fVar32 + *(float *)(pbVar23 + uVar16 * 4 + 4);
          bVar11 = *(byte *)(param_2 + 0x18);
          if ((((uVar22 < bVar11) &&
               (*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 8) != 0)) &&
              (*param_2 <= iVar15)) &&
             ((iVar15 < param_2[1] && (*(char *)(uVar25 + 0x61 + (longlong)param_2) != '\0')))) {
            uVar18 = *(uint *)(*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 8) +
                              (ulonglong)(uint)(iVar15 - *param_2) * 4);
          }
          if (((uVar22 < bVar11) &&
              (*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x18) != 0)) &&
             ((*param_2 <= iVar15 &&
              ((iVar15 < param_2[1] && (*(char *)(uVar25 + 0x61 + (longlong)param_2) != '\0')))))) {
            sVar6 = *(short *)(*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x18) +
                              (ulonglong)(uint)(iVar15 - *param_2) * 2);
          }
          else {
            sVar6 = 0;
          }
          uVar19 = uVar18 >> 0x10;
          if (sVar6 < 0) {
            uVar19 = uVar18 & 0xffff;
          }
          iVar13 = iVar15 + -1;
          iVar2 = (int)*local_1c0;
          fVar30 = (float)uVar19 * 0.0001;
          bVar12 = bVar11;
          if (iVar2 < iVar15) {
            do {
              if (uVar22 < *(byte *)(param_2 + 0x18)) {
                iVar7 = *param_2;
                iVar14 = param_2[1];
                if (iVar14 <= iVar7) goto LAB_14038128c;
                if ((short)param_2[0x87] < 0) {
                  uVar19 = 0;
                }
                else {
                  iVar20 = iVar13;
                  if (iVar13 < iVar7) {
                    iVar20 = iVar7;
                  }
                  iVar17 = iVar14 + -1;
                  if (iVar20 < iVar14) {
                    iVar17 = iVar20;
                  }
                  uVar19 = iVar17 - iVar7;
                }
                bVar12 = *(byte *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x2c);
                if ((bVar12 == 0) || ((short)param_2[0x87] < 0)) {
                  fVar27 = *(float *)(*(longlong *)
                                       (*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x10) +
                                     (ulonglong)uVar19 * 4);
                }
                else {
                  fVar27 = (float)bVar12 *
                           *(float *)(*(longlong *)(param_2 + 2) + (ulonglong)uVar19 * 4);
                  if (0.0 < (float)param_2[0x86]) {
                    fVar27 = ((float)(int)((uint)bVar12 * (uint)bVar12 + -1) * (float)param_2[0x86]
                             + 1.0) * fVar27;
                  }
                }
              }
              else {
LAB_14038128c:
                fVar27 = 0.0;
              }
              iVar13 = iVar13 + -1;
              fVar30 = fVar30 - fVar27 * fVar28 * 6.2831855;
            } while (iVar2 <= iVar13);
            bVar12 = *(byte *)(param_2 + 0x18);
            pbVar23 = local_1d0;
          }
          if ((((uVar22 < bVar12) &&
               (*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 8) != 0)) &&
              (*param_2 <= iVar2)) &&
             ((iVar2 < param_2[1] && (*(char *)(uVar25 + 0x61 + (longlong)param_2) != '\0')))) {
            uVar19 = *(uint *)(*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 8) +
                              (ulonglong)(uint)(iVar2 - *param_2) * 4);
          }
          else {
            uVar19 = 0;
          }
          sVar6 = 0;
          if (((uVar22 < bVar12) &&
              (*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x18) != 0)) &&
             ((*param_2 <= iVar2 &&
              ((iVar2 < param_2[1] && (*(char *)(uVar25 + 0x61 + (longlong)param_2) != '\0')))))) {
            sVar6 = *(short *)(*(longlong *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x18) +
                              (ulonglong)(uint)(iVar2 - *param_2) * 2);
          }
          uVar18 = uVar19 >> 0x10;
          if (sVar6 < 0) {
            uVar18 = uVar19 & 0xffff;
          }
          dVar29 = fmod((double)fVar30,6.283185307179586);
          if (dVar29 < 0.0) {
            dVar29 = dVar29 + 6.283185307179586;
          }
          fVar30 = (float)(dVar29 - (double)((float)uVar18 * 0.0001));
          if (fVar30 <= 3.1415927) {
            if (fVar30 < -3.1415927) {
              fVar30 = fVar30 + 6.2831855;
            }
          }
          else {
            fVar30 = fVar30 - 6.2831855;
          }
          uVar25 = (ulonglong)(uVar22 + 1);
          local_1a8[uVar16] = fVar30 * (fVar31 / fVar32) + local_1a8[uVar16];
          param_3 = local_1c0;
          param_4 = local_1b0;
        } while (uVar22 + 1 < (uint)bVar11);
      }
      iVar15 = iVar15 + 1;
      fVar32 = local_1d8;
      fVar31 = local_1d4;
    }
    bVar11 = *(byte *)(param_2 + 0x18);
    uVar19 = 0;
    bVar12 = 0;
    if (bVar11 != 0) {
      local_1c0 = (longlong *)(param_2 + 0x26);
      pcVar21 = (char *)((longlong)param_2 + 0x61);
      do {
        lVar3 = *local_1c0;
        bVar12 = *(byte *)(lVar3 + 0x2c);
        uVar22 = uVar19;
        if (bVar12 != 0) {
          uVar22 = bVar12 - 1;
        }
        uVar25 = (ulonglong)uVar22;
        uVar22 = (uint)bVar11;
        if (*(float *)(local_1d0 + uVar25 * 4 + 4) != 0.0) {
          uVar18 = 0;
          if ((((uVar19 < uVar22) && (*(longlong *)(lVar3 + 8) != 0)) && (*param_2 <= iVar2)) &&
             ((iVar2 < iVar13 && (*pcVar21 != '\0')))) {
            uVar18 = *(uint *)(*(longlong *)(lVar3 + 8) + (ulonglong)(uint)(iVar2 - *param_2) * 4);
            bVar5 = bVar11;
          }
          else {
            bVar5 = *(byte *)(param_2 + 0x18);
          }
          if (((uVar19 < bVar5) && (*(longlong *)(lVar3 + 0x18) != 0)) &&
             ((*param_2 <= iVar2 && ((iVar2 < iVar13 && (*pcVar21 != '\0')))))) {
            sVar6 = *(short *)(*(longlong *)(lVar3 + 0x18) + (ulonglong)(uint)(iVar2 - *param_2) * 2
                              );
          }
          else {
            sVar6 = 0;
          }
          uVar4 = uVar18 >> 0x10;
          if (sVar6 < 0) {
            uVar4 = uVar18 & 0xffff;
          }
          dVar29 = fmod((double)((float)uVar4 * 0.0001 +
                                local_1a8[uVar25] / *(float *)(local_1d0 + uVar25 * 4 + 4)),
                        6.283185307179586);
          if (dVar29 < 0.0) {
            dVar29 = dVar29 + 6.283185307179586;
          }
          iVar15 = *param_2;
          if (iVar15 < iVar13) {
            if ((short)param_2[0x87] < 0) {
              fVar28 = **(float **)(param_2 + 2);
            }
            else {
              iVar7 = iVar2;
              if (iVar2 < iVar15) {
                iVar7 = iVar15;
              }
              if (iVar13 <= iVar7) {
                iVar7 = iVar13 + -1;
              }
              fVar28 = *(float *)(*(longlong *)(param_2 + 2) + (ulonglong)(uint)(iVar7 - iVar15) * 4
                                 );
            }
          }
          else {
            fVar28 = 0.0;
          }
          if ((uVar19 < uVar22) && (iVar15 < iVar13)) {
            if ((short)param_2[0x87] < 0) {
              uVar18 = 0;
            }
            else {
              iVar7 = iVar2;
              if (iVar2 < iVar15) {
                iVar7 = iVar15;
              }
              iVar14 = iVar13 + -1;
              if (iVar7 < iVar13) {
                iVar14 = iVar7;
              }
              uVar18 = iVar14 - iVar15;
            }
            if ((bVar12 == 0) || ((short)param_2[0x87] < 0)) {
              fVar31 = *(float *)(*(longlong *)(lVar3 + 0x10) + (ulonglong)uVar18 * 4);
            }
            else {
              fVar31 = (float)bVar12 *
                       *(float *)(*(longlong *)(param_2 + 2) + (ulonglong)uVar18 * 4);
              if (0.0 < (float)param_2[0x86]) {
                fVar31 = ((float)(int)((uint)bVar12 * (uint)bVar12 + -1) * (float)param_2[0x86] +
                         1.0) * fVar31;
              }
            }
          }
          else {
            fVar31 = 0.0;
          }
          local_1a8[uVar25] = (fVar28 / fVar31) * (float)dVar29;
          pcVar21 = local_1b8;
        }
        pcVar21 = pcVar21 + 1;
        local_1c0 = local_1c0 + 1;
        uVar19 = uVar19 + 1;
        local_1b8 = pcVar21;
      } while (uVar19 < uVar22);
      bVar12 = *(byte *)(param_2 + 0x18);
    }
    pbVar23 = local_1d0;
    uVar25 = 1;
    if (1 < bVar12) {
      do {
        uVar22 = (uint)uVar25;
        uVar19 = uVar22;
        if (*(byte *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x2c) != 0) {
          uVar19 = *(byte *)(*(longlong *)(param_2 + uVar25 * 2 + 0x26) + 0x2c) - 1;
        }
        uVar25 = (ulonglong)uVar19;
        if (*(float *)(pbVar23 + uVar25 * 4 + 4) != 0.0) {
          pbVar1 = pbVar23 + uVar25 * 4 + 0xc4;
          pbVar1[0] = 0;
          pbVar1[1] = 0;
          pbVar1[2] = 0;
          pbVar1[3] = 0;
          fVar31 = 0.0;
          fVar28 = 0.0;
          uVar18 = 0;
          fVar32 = (float)(6.283185307179586 / (double)(uVar19 + 1));
          if (uVar22 != 0) {
            plVar24 = (longlong *)(param_2 + 0x26);
            do {
              uVar19 = uVar18;
              if (*(byte *)(*plVar24 + 0x2c) != 0) {
                uVar19 = *(byte *)(*plVar24 + 0x2c) - 1;
              }
              uVar16 = (ulonglong)uVar19;
              if (*(float *)(pbVar23 + uVar16 * 4 + 4) != 0.0) {
                fVar28 = local_1a8[uVar16];
                dVar29 = (double)fVar32;
                local_1b8 = (char *)(double)fVar28;
                sVar6 = _dtest(&local_1b8);
                if ((0 < sVar6) || (dVar29 <= 0.0)) {
                  dVar26 = 0.0;
                }
                else {
                  dVar26 = fmod((double)fVar28,dVar29);
                  if (dVar26 < 0.0) {
                    dVar26 = dVar26 + dVar29;
                  }
                  if (dVar29 <= dVar26) {
                    dVar26 = dVar26 - dVar29;
                  }
                }
                fVar28 = (float)((double)local_1a8[uVar25] - dVar26);
                if ((double)fVar28 <= dVar29 * 0.5) {
                  if ((double)fVar28 < (double)-fVar32 * 0.5) {
                    fVar28 = fVar28 + fVar32;
                  }
                }
                else {
                  fVar28 = fVar28 - fVar32;
                }
                fVar31 = fVar31 + *(float *)(pbVar23 + uVar16 * 4 + 4);
                fVar28 = *(float *)(pbVar23 + uVar16 * 4 + 4) * fVar28 +
                         *(float *)(pbVar23 + uVar25 * 4 + 0xc4);
                *(float *)(pbVar23 + uVar25 * 4 + 0xc4) = fVar28;
              }
              uVar18 = uVar18 + 1;
              plVar24 = plVar24 + 1;
            } while (uVar18 < uVar22);
            if (fVar31 != 0.0) {
              *(float *)(pbVar23 + uVar25 * 4 + 0xc4) = fVar28 / fVar31;
            }
          }
        }
        uVar25 = (ulonglong)(uVar22 + 1);
        fVar32 = local_1d8;
      } while (uVar22 + 1 < (uint)*(byte *)(param_2 + 0x18));
    }
    fVar28 = local_1d4;
    bVar11 = *pbVar23;
    bVar12 = 0;
    fVar31 = 0.0;
    while( true ) {
      bVar5 = bVar11;
      if (0x2f < bVar11) {
        bVar5 = 0x30;
      }
      if (bVar5 <= bVar12) break;
      if (fVar31 < *(float *)(pbVar23 + (ulonglong)bVar12 * 4 + 4)) {
        fVar31 = *(float *)(pbVar23 + (ulonglong)bVar12 * 4 + 4);
      }
      bVar12 = bVar12 + 1;
    }
    if (0x2f < bVar11) {
      bVar11 = 0x30;
    }
    *pbVar23 = bVar11;
    if (bVar11 != 0) {
      do {
        if (fVar31 * 0.015625 < *(float *)(pbVar23 + (ulonglong)bVar11 * 4)) break;
        bVar11 = bVar11 - 1;
        *pbVar23 = bVar11;
      } while (bVar11 != 0);
    }
    if ((local_1d4 <= 0.0) || (fVar32 / local_1d4 <= 0.0)) {
      bVar11 = 0;
    }
    else {
      dVar29 = log10(((double)(fVar32 / local_1d4) * 32.0) / 440.0);
      bVar11 = (byte)(longlong)((float)((dVar29 * 12.0) / 0.3010299956639812 + 9.0) + 0.5);
    }
    pbVar23[0x188] = bVar11;
    uVar19 = (uint)*(ushort *)(param_2 + 8);
    if (uVar19 == 0xffff) {
      uVar19 = 0;
    }
    *(uint *)(pbVar23 + 0x18c) = uVar19;
    if (0.0 < fVar28) {
      FUN_14036c2a0();
      *(float *)(pbVar23 + 0x184) = (float)param_2[0x86] / extraout_XMM0_Da_00;
      return 1;
    }
  }
  return 0;
}

