
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

void FUN_14031d960(longlong param_1,longlong param_2)

{
  longlong lVar1;
  undefined4 *puVar2;
  char cVar3;
  undefined4 uVar4;
  undefined4 uVar5;
  undefined4 uVar6;
  int iVar7;
  uint uVar8;
  uint *puVar9;
  void *pvVar10;
  ushort uVar11;
  float *pfVar12;
  int *piVar13;
  longlong lVar14;
  longlong *plVar15;
  int iVar16;
  uint uVar17;
  ulonglong uVar18;
  longlong *plVar19;
  undefined4 *_Dst;
  uint uVar20;
  ulonglong uVar21;
  ushort *puVar22;
  longlong lVar23;
  uint uVar24;
  int iVar26;
  uint uVar27;
  int iVar28;
  longlong lVar29;
  byte *pbVar30;
  char *pcVar31;
  int iVar32;
  ulonglong uVar33;
  float fVar34;
  float fVar35;
  float fVar36;
  undefined1 auStack_218 [32];
  ushort *local_1f8;
  uint local_1f0;
  byte local_1e8;
  char local_1d8;
  byte local_1d7;
  uint local_1d4;
  ushort local_1d0;
  longlong local_1c8;
  longlong *local_1c0;
  uint local_1b8;
  int local_1b4;
  int local_1b0;
  ushort *local_1a8;
  longlong local_1a0;
  longlong local_198;
  ulonglong local_190;
  longlong local_188;
  longlong local_180;
  ulonglong local_178;
  longlong local_170;
  longlong local_168;
  void *local_160;
  longlong local_158;
  longlong local_150;
  uint local_148 [48];
  ulonglong local_88;
  ulonglong uVar25;
  
  local_88 = DAT_140972168 ^ (ulonglong)auStack_218;
  pvVar10 = *(void **)(param_2 + 0x5b0);
  lVar29 = *(longlong *)(param_2 + 0x598);
  lVar14 = *(longlong *)(param_2 + 0x5a0);
  local_180 = *(longlong *)(param_2 + 0x5a8);
  plVar19 = *(longlong **)(param_2 + 0x540);
  iVar32 = *(int *)(param_2 + 0x10) - *(int *)(param_2 + 0xc);
  local_1c8 = param_2;
  local_1c0 = plVar19;
  local_1b0 = iVar32;
  local_188 = param_1;
  local_160 = pvVar10;
  local_158 = lVar29;
  local_150 = lVar14;
  memset(pvVar10,0,(ulonglong)(uint)(*(int *)(param_1 + 0xbc) + *(int *)(param_1 + 0x24)) * 2);
  uVar24 = *(uint *)(param_2 + 0xc);
  if ((int)uVar24 < *(int *)(param_2 + 0x10)) {
    do {
      iVar26 = uVar24 - *(int *)(param_2 + 0xc);
      iVar16 = DAT_140989fe4 + iVar26;
      *(uint *)(param_2 + 0x688) = uVar24;
      local_168 = (longlong)iVar16 * 2 + lVar14;
      local_170 = (ulonglong)(uint)(iVar16 * 0x1d0) * 0xf8 + lVar29;
      local_198 = (ulonglong)(uint)(iVar26 * 0x60) * 0x3c18 + local_180;
      puVar22 = (ushort *)((longlong)pvVar10 + (longlong)iVar26 * 2);
      local_1d7 = 0;
      local_1d4 = uVar24;
      local_1a8 = puVar22;
      do {
        local_1f8 = puVar22;
        local_1f0 = uVar24;
        local_1e8 = local_1d7;
        FUN_140334d50(param_1,local_170,local_168);
        local_1d0 = 0;
        lVar29 = local_198;
        uVar27 = uVar24;
        if (*puVar22 != 0) {
          do {
            uVar18 = 0;
            local_1a0 = (ulonglong)local_1d0 * 0x3c18;
            local_1d8 = *(char *)(local_1a0 + 0xc + lVar29);
            if (((byte)(local_1d8 - 0x10U) < 3) || (local_1d8 == '@')) {
              iVar32 = 0;
            }
            fVar35 = 0.0;
            pfVar12 = (float *)(local_1a0 + 0x1a4 + lVar29);
            fVar36 = 0.0;
            fVar34 = 0.0;
            uVar21 = uVar18;
            uVar27 = 3;
            do {
              if ((pfVar12[-0x33] != 0.0) && (fVar35 < *pfVar12)) {
                uVar21 = (ulonglong)(uVar27 - 2);
                fVar36 = pfVar12[-0x33];
                fVar35 = *pfVar12;
              }
              if (fVar34 < *pfVar12) {
                fVar34 = *pfVar12;
              }
              if ((pfVar12[0x1c] != 0.0) && (fVar35 < pfVar12[0x4f])) {
                uVar21 = (ulonglong)(uVar27 - 1);
                fVar36 = pfVar12[0x1c];
                fVar35 = pfVar12[0x4f];
              }
              if (fVar34 < pfVar12[0x4f]) {
                fVar34 = pfVar12[0x4f];
              }
              if ((pfVar12[0x6b] != 0.0) && (fVar35 < pfVar12[0x9e])) {
                uVar21 = (ulonglong)uVar27;
                fVar36 = pfVar12[0x6b];
                fVar35 = pfVar12[0x9e];
              }
              if (fVar34 < pfVar12[0x9e]) {
                fVar34 = pfVar12[0x9e];
              }
              if ((pfVar12[0xba] != 0.0) && (fVar35 < pfVar12[0xed])) {
                uVar21 = (ulonglong)(uVar27 + 1);
                fVar36 = pfVar12[0xba];
                fVar35 = pfVar12[0xed];
              }
              if (fVar34 < pfVar12[0xed]) {
                fVar34 = pfVar12[0xed];
              }
              if ((pfVar12[0x109] != 0.0) && (fVar35 < pfVar12[0x13c])) {
                uVar21 = (ulonglong)(uVar27 + 2);
                fVar36 = pfVar12[0x109];
                fVar35 = pfVar12[0x13c];
              }
              if (fVar34 < pfVar12[0x13c]) {
                fVar34 = pfVar12[0x13c];
              }
              if ((pfVar12[0x158] != 0.0) && (fVar35 < pfVar12[0x18b])) {
                uVar21 = (ulonglong)(uVar27 + 3);
                fVar36 = pfVar12[0x158];
                fVar35 = pfVar12[0x18b];
              }
              if (fVar34 < pfVar12[0x18b]) {
                fVar34 = pfVar12[0x18b];
              }
              if ((pfVar12[0x1a7] != 0.0) && (fVar35 < pfVar12[0x1da])) {
                uVar21 = (ulonglong)(uVar27 + 4);
                fVar36 = pfVar12[0x1a7];
                fVar35 = pfVar12[0x1da];
              }
              if (fVar34 < pfVar12[0x1da]) {
                fVar34 = pfVar12[0x1da];
              }
              if ((pfVar12[0x1f6] != 0.0) && (fVar35 < pfVar12[0x229])) {
                uVar21 = (ulonglong)(uVar27 + 5);
                fVar36 = pfVar12[0x1f6];
                fVar35 = pfVar12[0x229];
              }
              if (fVar34 < pfVar12[0x229]) {
                fVar34 = pfVar12[0x229];
              }
              pfVar12 = pfVar12 + 0x278;
              uVar17 = uVar27 + 6;
              uVar27 = uVar27 + 8;
            } while (uVar17 < 0x31);
            if (((uint)uVar21 != 0) && (1.0 <= fVar34)) {
              iVar16 = iVar32 + 1;
              uVar33 = 0xffffffffffffffff;
              local_190 = 0xffffffffffffffff;
              if (((*(uint *)(local_1c8 + 0xc) < uVar24) ||
                  ((local_1d8 == '@' || ((byte)(local_1d8 - 0x10U) < 3)))) &&
                 (iVar26 = *(int *)(local_1c8 + 0x548), plVar19 = local_1c0, 0 < iVar26)) {
                pcVar31 = (char *)((longlong)local_1c0 + 0x24);
                uVar25 = uVar18;
                do {
                  if ((((pcVar31[-0x18] & 1U) == 0) && (*pcVar31 == local_1d8)) &&
                     ((uint)(byte)pcVar31[1] == (uint)uVar21)) {
                    if (((local_1d8 == '\x12') &&
                        (iVar28 = *(int *)(pcVar31 + -0x10),
                        iVar28 != *(int *)(local_1a0 + 0x10 + lVar29))) &&
                       ((local_1d4 ==
                         (uint)*(ushort *)(pcVar31 + -0x1c) + (int)*(short *)(pcVar31 + -0x1a) &&
                        ((ABS(*(float *)(pcVar31 + -0xc) - *(float *)(local_1a0 + lVar29)) < 1000.0
                         && (iVar7 = 0, 0 < iVar26)))))) {
                      piVar13 = (int *)((longlong)local_1c0 + 0x14);
                      do {
                        if (((*(byte *)(piVar13 + -2) & 1) == 0) && (*piVar13 == iVar28)) {
                          *piVar13 = *(int *)(local_1a0 + 0x10 + lVar29);
                        }
                        iVar26 = *(int *)(local_1c8 + 0x548);
                        iVar7 = iVar7 + 1;
                        piVar13 = piVar13 + 10;
                      } while (iVar7 < iVar26);
                    }
                    if ((*(int *)(pcVar31 + -0x10) == *(int *)(local_1a0 + 0x10 + lVar29)) &&
                       ((int)*(short *)(pcVar31 + -0x1a) < (int)local_1d4)) {
                      uVar11 = *(ushort *)(pcVar31 + -0x1c);
                      uVar27 = local_1d4 - (int)*(short *)(pcVar31 + -0x1a);
                      uVar24 = (uint)uVar11;
                      if ((int)uVar27 <= (int)(uint)uVar11) {
                        uVar24 = uVar27;
                      }
                      iVar28 = uVar27 - uVar11;
                      if (iVar28 < 1) {
                        iVar28 = 0;
                      }
                      if ((((iVar28 <= iVar32) &&
                           (*(float *)((longlong)(int)uVar24 * 0x5c + -0x4c +
                                      *(longlong *)(pcVar31 + -0x24)) == fVar36)) &&
                          (iVar28 < iVar16)) &&
                         (uVar33 = uVar18, local_190 = uVar18, iVar16 = iVar28, iVar28 == 0)) break;
                    }
                  }
                  uVar24 = (int)uVar25 + 1;
                  uVar25 = (ulonglong)uVar24;
                  uVar18 = uVar18 + 1;
                  pcVar31 = pcVar31 + 0x28;
                  local_190 = uVar33;
                } while ((int)uVar24 < iVar26);
              }
              uVar18 = local_190;
              uVar24 = 0;
              lVar14 = 3;
              puVar9 = local_148;
              do {
                puVar9[0] = 0xffffffff;
                puVar9[1] = 0xffffffff;
                puVar9[2] = 0xffffffff;
                puVar9[3] = 0xffffffff;
                puVar9[4] = 0xffffffff;
                puVar9[5] = 0xffffffff;
                puVar9[6] = 0xffffffff;
                puVar9[7] = 0xffffffff;
                puVar9[8] = 0xffffffff;
                puVar9[9] = 0xffffffff;
                puVar9[10] = 0xffffffff;
                puVar9[0xb] = 0xffffffff;
                puVar9[0xc] = 0xffffffff;
                puVar9[0xd] = 0xffffffff;
                puVar9[0xe] = 0xffffffff;
                puVar9[0xf] = 0xffffffff;
                lVar14 = lVar14 + -1;
                puVar9 = puVar9 + 0x10;
              } while (lVar14 != 0);
              if ((longlong)local_190 < 0) {
                WaitForSingleObject(DAT_140989f08,0xffffffff);
                iVar16 = DAT_140989fe8;
                local_1b4 = DAT_140989fe8;
                DAT_140989fe8 = DAT_140989fe8 + 1;
                ReleaseMutex(DAT_140989f08);
                uVar17 = 1;
                uVar20 = 0;
                uVar24 = *(uint *)(local_1c8 + 0x548);
                puVar22 = local_1a8;
                param_1 = local_188;
                param_2 = local_1c8;
                iVar32 = local_1b0;
                uVar27 = local_1d4;
                if ((int)uVar24 < 1) {
joined_r0x00014031e021:
                  while( true ) {
                    if (0x3bff < uVar24) goto LAB_14031e070;
                    uVar20 = uVar17 - 1;
                    uVar17 = uVar17 + 1;
                    local_148[uVar20] = uVar24;
                    if (0x30 < uVar17) break;
                    uVar24 = uVar24 + 1;
                  }
                }
                else {
                  pbVar30 = (byte *)((longlong)plVar19 + 0xc);
                  do {
                    if ((*pbVar30 & 1) != 0) {
                      uVar8 = uVar17 - 1;
                      uVar17 = uVar17 + 1;
                      local_148[uVar8] = uVar20;
                      if (0x30 < uVar17) goto LAB_14031e1db;
                    }
                    uVar20 = uVar20 + 1;
                    pbVar30 = pbVar30 + 0x28;
                  } while ((int)uVar20 < (int)uVar24);
                  if (uVar17 < 0x31) goto joined_r0x00014031e021;
                }
LAB_14031e1db:
                uVar24 = *(uint *)(local_1c8 + 0x580);
                uVar17 = 0;
                if (*(uint *)(local_1c8 + 0x560) <= uVar24) break;
                while ((*(char *)((ulonglong)uVar24 + *(longlong *)(local_1c8 + 0x558)) != '\0' ||
                       (uVar17 = uVar17 + 1, uVar17 < 0x30))) {
                  uVar24 = uVar24 + 1;
                  if (*(uint *)(local_1c8 + 0x560) <= uVar24) goto LAB_14031e070;
                }
              }
              else {
                iVar32 = *(int *)(local_1c8 + 0x548);
                iVar16 = (int)plVar19[local_190 * 5 + 2];
                local_1b4 = iVar16;
                if (0 < iVar32) {
                  plVar15 = plVar19 + 2;
                  do {
                    if (((*(byte *)((longlong)plVar15 + -4) & 1) == 0) && ((int)*plVar15 == iVar16))
                    {
                      local_148[(ulonglong)*(byte *)((longlong)plVar15 + 0x15) - 1] = uVar24;
                    }
                    uVar24 = uVar24 + 1;
                    plVar15 = plVar15 + 5;
                  } while ((int)uVar24 < iVar32);
                }
              }
              uVar21 = 0;
              local_1b8 = 0;
              plVar15 = plVar19;
              do {
                uVar27 = local_148[uVar21];
                lVar14 = (longlong)(int)uVar27;
                uVar17 = (uint)uVar21;
                local_178 = uVar21;
                if ((longlong)uVar18 < 0) {
                  plVar19 = local_1c0;
                  param_2 = local_1c8;
                  uVar24 = local_1d4;
                  if ((int)uVar27 < 0) break;
                  plVar15[lVar14 * 5] = 0;
                  plVar15[lVar14 * 5 + 1] = 0;
                  plVar15[lVar14 * 5 + 2] = 0;
                  plVar15[lVar14 * 5 + 3] = 0;
                  plVar15[lVar14 * 5 + 4] = 0;
                  uVar20 = *(uint *)(local_1c8 + 0x580);
                  if (uVar20 < *(uint *)(local_1c8 + 0x560)) {
                    do {
                      if (*(char *)(*(longlong *)(local_1c8 + 0x558) + (ulonglong)uVar20) == '\0') {
                        *(undefined1 *)(*(longlong *)(local_1c8 + 0x558) + (ulonglong)uVar20) = 1;
                        *(int *)(local_1c8 + 0x580) = *(int *)(local_1c8 + 0x580) + 1;
                        lVar23 = (ulonglong)(*(int *)(local_1c8 + 0x564) * uVar20) * 0x5c +
                                 *(longlong *)(local_1c8 + 0x550);
                        goto LAB_14031e2da;
                      }
                      uVar20 = uVar20 + 1;
                    } while (uVar20 < *(uint *)(local_1c8 + 0x560));
                  }
                  lVar23 = 0;
LAB_14031e2da:
                  plVar15[lVar14 * 5] = lVar23;
                  if (lVar23 == 0) break;
                  puVar22 = (ushort *)(plVar15 + lVar14 * 5 + 1);
                  *(short *)((longlong)plVar15 + lVar14 * 0x28 + 10) = (short)local_1d4;
                  uVar20 = 0;
                  *puVar22 = 0;
                  *(undefined4 *)(plVar15 + lVar14 * 5 + 3) = *(undefined4 *)(local_1a0 + lVar29);
                  *(char *)((longlong)plVar15 + lVar14 * 0x28 + 0x24) = local_1d8;
                  *(char *)((longlong)plVar15 + lVar14 * 0x28 + 0x25) = (char)uVar21 + '\x01';
                  *(undefined1 *)((longlong)plVar15 + lVar14 * 0x28 + 0xc) = 0;
                  *(int *)(plVar15 + lVar14 * 5 + 2) = iVar16;
                  *(undefined8 *)((longlong)plVar15 + lVar14 * 0x28 + 0x1c) = 0;
                  *(undefined4 *)((longlong)plVar15 + lVar14 * 0x28 + 0x14) =
                       *(undefined4 *)(local_1a0 + 0x10 + lVar29);
                  uVar24 = uVar20;
                  if (*(int *)(local_1c8 + 0x548) <= (int)uVar27) {
                    *(uint *)(local_1c8 + 0x548) = uVar27 + 1;
                    lVar23 = plVar15[lVar14 * 5];
                  }
LAB_14031e354:
                  uVar18 = local_190;
                  if ((int)uVar24 <= (int)uVar20) {
                    uVar27 = uVar20;
                    do {
                      iVar32 = FUN_140346420(local_188,local_1c8,lVar23);
                      lVar29 = local_198;
                      uVar18 = local_190;
                      uVar17 = local_1b8;
                      if (iVar32 <= (int)uVar27) break;
                      _Dst = (undefined4 *)((longlong)(int)uVar27 * 0x5c + lVar23);
                      memset(_Dst,0,0x5c);
                      _Dst[0x14] = *(undefined4 *)((ulonglong)local_1d0 * 0x3c18 + local_198);
                      lVar29 = uVar21 * 0x13c + (ulonglong)local_1d0 * 0x3c18;
                      if (*(float *)(lVar29 + 0xd8 + local_198) == 0.0) {
                        lVar14 = (ulonglong)uVar24 - 1;
                        _Dst[4] = 0;
                        if (-1 < lVar14) {
                          pfVar12 = (float *)(lVar23 + 0x10 + lVar14 * 0x5c);
                          do {
                            if (*pfVar12 != 0.0) {
                              _Dst[4] = *pfVar12;
                              break;
                            }
                            pfVar12 = pfVar12 + -0x17;
                            lVar14 = lVar14 + -1;
                          } while (-1 < lVar14);
                        }
                      }
                      else {
                        puVar2 = (undefined4 *)(lVar29 + 0x1fc + local_198);
                        uVar4 = puVar2[1];
                        uVar5 = puVar2[2];
                        uVar6 = puVar2[3];
                        *_Dst = *puVar2;
                        _Dst[1] = uVar4;
                        _Dst[2] = uVar5;
                        _Dst[3] = uVar6;
                        *(undefined8 *)(_Dst + 4) = *(undefined8 *)(lVar29 + 0x20c + local_198);
                        if (uVar27 != uVar20) {
                          *(undefined8 *)(_Dst + 2) = 0;
                        }
                        *(undefined1 *)((longlong)_Dst + 0x4b) = 1;
                      }
                      uVar11 = (short)uVar27 + 1;
                      *(undefined1 *)(_Dst + 0x12) = 0;
                      *(undefined2 *)(_Dst + 0x13) = *(undefined2 *)(lVar29 + 0x1c8 + local_198);
                      if (uVar11 <= *puVar22) {
                        uVar11 = *puVar22;
                      }
                      uVar27 = uVar27 - 1;
                      *puVar22 = uVar11;
                      lVar29 = local_198;
                      uVar18 = local_190;
                      uVar17 = local_1b8;
                    } while ((int)uVar24 <= (int)uVar27);
                  }
                }
                else if (-1 < (int)uVar27) {
                  lVar1 = lVar14 * 5 + 1;
                  puVar22 = (ushort *)(plVar15 + lVar1);
                  lVar23 = plVar15[lVar14 * 5];
                  uVar20 = local_1d4 - (int)*(short *)((longlong)plVar15 + lVar14 * 0x28 + 10);
                  uVar24 = (uint)*(ushort *)(plVar15 + lVar1);
                  goto LAB_14031e354;
                }
                local_1b8 = uVar17 + 1;
                uVar21 = (ulonglong)local_1b8;
                plVar19 = local_1c0;
                plVar15 = local_1c0;
                param_2 = local_1c8;
                uVar24 = local_1d4;
                iVar16 = local_1b4;
              } while (uVar17 + 2 < 0x31);
            }
            local_1d0 = local_1d0 + 1;
            puVar22 = local_1a8;
            param_1 = local_188;
            iVar32 = local_1b0;
            uVar27 = local_1d4;
          } while (local_1d0 < *local_1a8);
        }
LAB_14031e070:
        uVar24 = uVar27;
        iVar16 = 0;
        local_1d7 = local_1d7 + 1;
      } while (local_1d7 < 8);
      if (0 < *(int *)(param_2 + 0x548)) {
        do {
          if (((*(byte *)((longlong)plVar19 + 0xc) & 1) == 0) &&
             (cVar3 = *(char *)((longlong)plVar19 + 0x24), cVar3 != '\x01')) {
            iVar26 = 0;
            if ((2 < (byte)(cVar3 - 0x10U)) && (cVar3 != '@')) {
              iVar26 = iVar32;
            }
            uVar11 = *(ushort *)(plVar19 + 1);
            if ((int)(*(short *)((longlong)plVar19 + 10) + iVar26 + (uint)uVar11) <
                (int)(local_1d4 - 1)) {
              if (uVar11 == 0) {
                lVar29 = *plVar19;
                *(byte *)((longlong)plVar19 + 0xc) = *(byte *)((longlong)plVar19 + 0xc) | 1;
                if (lVar29 != 0) {
                  lVar14 = *(longlong *)(param_2 + 0x550);
                  if ((lVar14 <= lVar29) &&
                     (lVar29 < (longlong)
                               ((ulonglong)*(uint *)(param_2 + 0x560) *
                                (ulonglong)*(uint *)(param_2 + 0x564) * 0x5c + lVar14))) {
                    uVar18 = (lVar29 - lVar14) /
                             (longlong)(ulonglong)(*(uint *)(param_2 + 0x564) * 0x5c);
                    uVar24 = (uint)uVar18;
                    *(undefined1 *)((uVar18 & 0xffffffff) + *(longlong *)(param_2 + 0x558)) = 0;
                    if (*(uint *)(param_2 + 0x580) <= uVar24) {
                      uVar24 = *(uint *)(param_2 + 0x580);
                    }
                    *(uint *)(param_2 + 0x580) = uVar24;
                  }
                  lVar14 = *(longlong *)(param_2 + 0x568);
                  if ((lVar14 <= lVar29) &&
                     (lVar29 < (longlong)
                               ((ulonglong)*(uint *)(param_2 + 0x578) *
                                (ulonglong)*(uint *)(param_2 + 0x57c) * 0x5c + lVar14))) {
                    uVar18 = (lVar29 - lVar14) /
                             (longlong)(ulonglong)(*(uint *)(param_2 + 0x57c) * 0x5c);
                    uVar24 = (uint)uVar18;
                    *(undefined1 *)((uVar18 & 0xffffffff) + *(longlong *)(param_2 + 0x570)) = 0;
                    if (*(uint *)(param_2 + 0x584) <= uVar24) {
                      uVar24 = *(uint *)(param_2 + 0x584);
                    }
                    *(uint *)(param_2 + 0x584) = uVar24;
                  }
                }
                *plVar19 = 0;
              }
              else if (uVar11 < 0x21) {
                if (((*plVar19 < *(longlong *)(param_2 + 0x568)) ||
                    ((longlong)
                     ((ulonglong)*(uint *)(param_2 + 0x57c) * (ulonglong)*(uint *)(param_2 + 0x578)
                      * 0x5c + *(longlong *)(param_2 + 0x568)) <= *plVar19)) &&
                   (pvVar10 = (void *)FUN_140345850(param_2,0x20), pvVar10 != (void *)0x0)) {
                  memcpy(pvVar10,(void *)*plVar19,0xb80);
                  FUN_140345f20(param_2,*plVar19);
                  *plVar19 = (longlong)pvVar10;
                }
              }
            }
          }
          iVar16 = iVar16 + 1;
          plVar19 = plVar19 + 5;
          uVar24 = local_1d4;
        } while (iVar16 < *(int *)(param_2 + 0x548));
      }
      uVar24 = uVar24 + 1;
      lVar29 = local_158;
      param_1 = local_188;
      plVar19 = local_1c0;
      lVar14 = local_150;
      pvVar10 = local_160;
    } while ((int)uVar24 < *(int *)(param_2 + 0x10));
  }
  return;
}

