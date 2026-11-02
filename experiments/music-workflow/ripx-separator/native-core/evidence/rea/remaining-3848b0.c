
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */
/* WARNING: Type propagation algorithm not settling */

void FUN_1403848b0(uint *param_1,byte param_2,undefined1 param_3)

{
  float *pfVar1;
  int *piVar2;
  bool bVar3;
  bool bVar4;
  double dVar5;
  undefined2 uVar6;
  short sVar7;
  ulonglong uVar8;
  undefined8 uVar9;
  uint *puVar10;
  float *pfVar11;
  double *pdVar12;
  uint uVar13;
  ushort *puVar14;
  ulonglong uVar15;
  ushort uVar16;
  uint uVar17;
  uint uVar18;
  longlong lVar19;
  int iVar20;
  uint *puVar21;
  uint uVar22;
  ulonglong uVar23;
  undefined8 *puVar24;
  float *pfVar25;
  ushort uVar26;
  uint *puVar27;
  longlong *plVar28;
  longlong lVar29;
  undefined8 *puVar30;
  char *pcVar31;
  ulonglong uVar32;
  ushort *puVar33;
  uint uVar34;
  ulonglong uVar35;
  longlong lVar36;
  undefined4 uVar37;
  float fVar38;
  undefined4 uVar45;
  double dVar39;
  double dVar40;
  undefined4 uVar46;
  undefined1 auVar41 [16];
  undefined1 auVar42 [16];
  undefined1 auVar43 [16];
  undefined1 auVar44 [16];
  float fVar47;
  undefined4 uVar48;
  float fVar49;
  float fVar50;
  float fVar51;
  float fVar52;
  float fVar53;
  float fVar54;
  float fVar55;
  float fVar56;
  float fVar57;
  float fVar58;
  undefined1 auStack_e18 [32];
  undefined4 local_df8;
  ulonglong local_df0;
  uint *local_de8;
  uint local_de0;
  uint local_ddc;
  uint local_dd8;
  byte local_dd4;
  undefined4 local_dd0;
  uint local_dcc;
  uint local_dc8;
  uint *local_dc0;
  uint local_db8;
  longlong local_db0;
  longlong local_da8;
  undefined8 local_da0;
  undefined8 local_d98;
  undefined8 local_d90;
  undefined8 local_d88;
  undefined8 local_d80;
  undefined8 local_d78;
  undefined8 local_d70;
  undefined8 local_d68;
  undefined8 local_d60;
  float local_d58 [128];
  float local_b58 [128];
  double local_958 [128];
  undefined8 local_558;
  double local_550 [127];
  char local_158 [128];
  ulonglong local_d8;
  
  local_da0 = 0xfffffffffffffffe;
  local_d8 = DAT_140972168 ^ (ulonglong)auStack_e18;
  local_dcc = CONCAT31(local_dcc._1_3_,param_3);
  local_de8 = param_1;
  local_dd4 = param_2;
  FUN_140537480();
  DAT_154f06320 = '\0';
  FUN_14038f8a0(0,0,0);
  DAT_154f0631c = 8;
  FUN_140539390();
  local_dd0 = 0xfffd;
  if (param_2 != 0) {
    if ((*(char *)((longlong)param_1 + 0x96) != '\0') &&
       ((((*(char *)((longlong)param_1 + 0x92) != '\0' ||
          (*(char *)((longlong)param_1 + 0x93) != '\0')) ||
         (*(char *)((longlong)param_1 + 0x91) != '\0')) ||
        ((((char)param_1[0x25] != '\0' || (*(char *)((longlong)param_1 + 0x99) != '\0')) ||
         ((*(char *)((longlong)param_1 + 0x95) != '\0' || (DAT_1409399f8 == 2)))))))) {
      uVar22 = 0;
      if (*(char *)((longlong)param_1 + 0x93) == '\0') {
        if (*(char *)((longlong)param_1 + 0x92) == '\0') {
          if (*(char *)((longlong)param_1 + 0x91) == '\0') {
            if ((char)param_1[0x25] == '\0') {
              if (*(char *)((longlong)param_1 + 0x99) == '\0') {
                if (*(char *)((longlong)param_1 + 0x95) == '\0') {
                  uVar6 = 0;
                  if (DAT_1409399f8 == 2) {
                    uVar6 = 1;
                  }
                }
                else {
                  uVar6 = 4;
                }
              }
              else {
                uVar6 = 0x2e;
              }
            }
            else {
              uVar6 = 3;
            }
          }
          else {
            uVar6 = 7;
          }
        }
        else {
          uVar6 = 1;
        }
      }
      else {
        uVar6 = 0x1e;
      }
      (&DAT_1409ee730)[(ulonglong)*param_1 * 0x355bc] = 0;
      local_df8 = CONCAT31(local_df8._1_3_,1);
      FUN_14037b830(uVar6,0,*param_1,0xffffffff);
      uVar8 = (ulonglong)*param_1;
      if ((&DAT_14098a5d8)[uVar8 * 0x1aade] == 0) {
        return;
      }
      do {
        lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x30 + (ulonglong)uVar22 * 0x90);
        if (lVar29 != 0) {
          *(undefined2 *)(lVar29 + 0x20) = uVar6;
          uVar8 = (ulonglong)*param_1;
        }
        uVar22 = uVar22 + 1;
      } while (uVar22 < (uint)(&DAT_14098a5d8)[uVar8 * 0x1aade]);
      return;
    }
    uVar22 = param_1[0xd4];
    uVar13 = *param_1;
    if (((-1 < (int)*param_1) || (uVar13 = DAT_14098a1b0, -1 < (int)DAT_14098a1b0)) &&
       ((int)uVar13 < DAT_1549b0dd0)) {
      uVar26 = 0;
      do {
        if (((((((ushort)(uVar26 - 1) < 2) && ((uVar22 & 2) != 0)) ||
              (((ushort)(uVar26 - 4) < 3 && ((uVar22 & 4) != 0)))) ||
             (((ushort)(uVar26 - 7) < 2 && ((uVar22 & 8) != 0)))) ||
            ((uVar26 == 3 && ((uVar22 & 0x10) != 0)))) ||
           ((DAT_140989f10 == '\0' && ((uVar26 - 9 & 0xfffd) == 0)))) {
          FUN_14037bba0(uVar26,0,uVar13);
        }
        else {
          local_df8 = CONCAT31(local_df8._1_3_,1);
          FUN_14037b830(uVar26,0,uVar13,0xffffffff);
        }
        uVar26 = uVar26 + 1;
        param_1 = local_de8;
      } while (uVar26 < 0x80);
    }
  }
  local_de0 = 0;
  local_dc8 = param_2 + 1;
  if (local_dc8 != 0) {
    local_dc0 = param_1 + 0x34;
    do {
      puVar10 = local_dc0;
      FUN_140539390();
      uVar22 = 0x10;
      if ((uint)(DAT_14096b388 * 2) < 0x10) {
        uVar22 = DAT_14096b388 * 2;
      }
      if ((uint)(&DAT_14098a5d8)[(ulonglong)*param_1 * 0x1aade] >> 4 <= uVar22) {
        uVar22 = (uint)(&DAT_14098a5d8)[(ulonglong)*param_1 * 0x1aade] >> 4;
      }
      uVar13 = 1;
      if (1 < uVar22) {
        uVar13 = uVar22;
      }
      uVar22 = 0;
      memset(puVar10,0,0x80);
      puVar27 = puVar10;
      if (uVar13 != 0) {
        puVar21 = local_de8 + 0x75;
        uVar18 = uVar22;
        do {
          *(uint **)(puVar21 + 3) = local_de8;
          puVar21[-1] = uVar18;
          if (uVar22 == uVar13 - 1) {
            uVar17 = (&DAT_14098a5d8)[(ulonglong)*local_de8 * 0x1aade];
            *puVar21 = uVar17;
            uVar34 = uVar18;
          }
          else {
            uVar17 = (&DAT_14098a5d8)[(ulonglong)*local_de8 * 0x1aade];
            uVar34 = ((uVar22 + 1) * uVar17) / uVar13;
            if (uVar34 <= uVar18 + 1) {
              uVar34 = uVar18 + 1;
            }
            if (uVar17 <= uVar34) {
              uVar34 = uVar17;
            }
            *puVar21 = uVar34;
            uVar17 = uVar34;
          }
          puVar27 = local_dc0;
          if (uVar17 == uVar18) break;
          uVar9 = 0;
          puVar21[1] = 0;
          puVar21[2] = uVar22;
          local_da8 = FUN_14061b650(0x10);
          if (local_da8 != 0) {
            local_df0 = local_df0 & 0xffffffff00000000;
            local_df8 = 1;
            uVar9 = FUN_140529d80(local_da8,FUN_140383b90,
                                  local_de8 + ((ulonglong)uVar22 * 3 + 0x3a) * 2,
                                  local_de8 + (ulonglong)uVar22 * 2 + 0x54);
          }
          *(undefined8 *)puVar10 = uVar9;
          FUN_140529ec0(uVar9);
          uVar22 = uVar22 + 1;
          puVar10 = puVar10 + 2;
          puVar21 = puVar21 + 6;
          puVar27 = local_dc0;
          uVar18 = uVar34;
        } while (uVar22 < uVar13);
      }
      uVar8 = 0;
      while (Sleep(0x14), puVar10 = puVar27, uVar32 = uVar8, uVar22 != 0) {
        while (*(longlong *)puVar10 == 0) {
          uVar13 = (int)uVar32 + 1;
          puVar10 = puVar10 + 2;
          uVar32 = (ulonglong)uVar13;
          if (uVar22 <= uVar13) goto LAB_140384d84;
        }
      }
LAB_140384d84:
      local_dd8 = 0;
      local_ddc = 0;
      uVar23 = (ulonglong)*local_de8;
      puVar10 = local_de8;
      uVar32 = uVar8;
      uVar15 = uVar8;
      if ((&DAT_14098a604)[uVar23 * 0x1aade] != 0) {
        do {
          uVar22 = (uint)uVar32;
          uVar35 = uVar32;
          if (uVar22 < (uint)(&DAT_14098a5d8)[uVar23 * 0x1aade]) {
            do {
              if (*(float *)(&DAT_14098a608 + uVar23 * 0x6ab78 + uVar15 * 4) - 0.001 <=
                  *(float *)((&DAT_14098a5d0)[uVar23 * 0xd56f] + 0x10 + uVar35 * 0x90)) break;
              uVar13 = (int)uVar35 + 1;
              uVar35 = (ulonglong)uVar13;
            } while (uVar13 < (uint)(&DAT_14098a5d8)[uVar23 * 0x1aade]);
            local_dd8 = (uint)uVar35;
          }
          memset(local_958,0,0x400);
          uVar13 = (uint)uVar35;
          if (uVar22 < uVar13) {
            plVar28 = (longlong *)(uVar32 * 0x90 + 0x30 + (&DAT_14098a5d0)[uVar23 * 0xd56f]);
            uVar23 = (ulonglong)(uVar13 - uVar22);
            do {
              lVar29 = *plVar28;
              if ((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) {
                uVar26 = *(ushort *)(lVar29 + 0x20);
                if ((ushort)(uVar26 - 1) < 0xfffe) {
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x24) + local_958[uVar26];
                  }
                  uVar26 = *(ushort *)(lVar29 + 0x28);
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x2c) + local_958[uVar26];
                  }
                  uVar26 = *(ushort *)(lVar29 + 0x30);
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x34) + local_958[uVar26];
                  }
                  uVar26 = *(ushort *)(lVar29 + 0x38);
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x3c) + local_958[uVar26];
                  }
                  uVar26 = *(ushort *)(lVar29 + 0x40);
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x44) + local_958[uVar26];
                  }
                  uVar26 = *(ushort *)(lVar29 + 0x48);
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x4c) + local_958[uVar26];
                  }
                  uVar26 = *(ushort *)(lVar29 + 0x50);
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x54) + local_958[uVar26];
                  }
                  uVar26 = *(ushort *)(lVar29 + 0x58);
                  if ((ushort)(uVar26 - 1) < 0x7f) {
                    local_958[uVar26] = (double)*(float *)(lVar29 + 0x5c) + local_958[uVar26];
                  }
                }
              }
              plVar28 = plVar28 + 0x12;
              uVar23 = uVar23 - 1;
              puVar10 = local_de8;
            } while (uVar23 != 0);
          }
          uVar37 = SUB84(local_958[6],0);
          uVar45 = (undefined4)((ulonglong)local_958[6] >> 0x20);
          if (local_958[6] <= local_958[5]) {
            uVar37 = SUB84(local_958[5],0);
            uVar45 = (undefined4)((ulonglong)local_958[5] >> 0x20);
          }
          if ((double)CONCAT44(uVar45,uVar37) < local_958[4] ||
              (double)CONCAT44(uVar45,uVar37) == local_958[4]) {
            uVar37 = SUB84(local_958[4],0);
            uVar45 = (undefined4)((ulonglong)local_958[4] >> 0x20);
          }
          local_958[4] = (double)CONCAT44(uVar45,uVar37);
          bVar3 = local_958[3] == (double)CONCAT44(uVar45,uVar37);
          bVar4 = local_958[3] < (double)CONCAT44(uVar45,uVar37);
          uVar18 = (uint)uVar15;
          if (uVar22 < uVar13) {
            lVar29 = uVar32 * 0x90;
            uVar32 = (ulonglong)(uVar13 - uVar22);
            do {
              lVar36 = *(longlong *)
                        ((&DAT_14098a5d0)[(ulonglong)*local_de8 * 0xd56f] + 0x30 + lVar29);
              if (lVar36 != 0) {
                if ((((char)local_de8[0x26] == '\0') || (-1 < *(short *)(lVar36 + 0x21c))) ||
                   ((*(short *)(lVar36 + 0x20) + 1U & 0xfffe) != 0)) {
                  sVar7 = *(short *)(lVar36 + 0x20);
                  if ((ushort)(sVar7 - 1U) < 0xfffe) {
                    if (bVar4 || bVar3) {
                      if (sVar7 == 3) {
                        *(undefined4 *)(lVar36 + 0x24) = 0;
                        *(undefined2 *)(lVar36 + 0x20) = 4;
                      }
                      if (*(short *)(lVar36 + 0x28) == 3) {
                        *(undefined4 *)(lVar36 + 0x2c) = 0;
                        *(undefined2 *)(lVar36 + 0x28) = 4;
                      }
                      if (*(short *)(lVar36 + 0x30) == 3) {
                        *(undefined4 *)(lVar36 + 0x34) = 0;
                        *(undefined2 *)(lVar36 + 0x30) = 4;
                      }
                      if (*(short *)(lVar36 + 0x38) == 3) {
                        *(undefined4 *)(lVar36 + 0x3c) = 0;
                        *(undefined2 *)(lVar36 + 0x38) = 4;
                      }
                      if (*(short *)(lVar36 + 0x40) == 3) {
                        *(undefined4 *)(lVar36 + 0x44) = 0;
                        *(undefined2 *)(lVar36 + 0x40) = 4;
                      }
                      if (*(short *)(lVar36 + 0x48) == 3) {
                        *(undefined4 *)(lVar36 + 0x4c) = 0;
                        *(undefined2 *)(lVar36 + 0x48) = 4;
                      }
                      if (*(short *)(lVar36 + 0x50) == 3) {
                        *(undefined4 *)(lVar36 + 0x54) = 0;
                        *(undefined2 *)(lVar36 + 0x50) = 4;
                      }
                      if (*(short *)(lVar36 + 0x58) == 3) {
                        *(undefined4 *)(lVar36 + 0x5c) = 0;
                        *(undefined2 *)(lVar36 + 0x58) = 4;
                      }
                    }
                    else {
                      if ((ushort)(sVar7 - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x24) = 0;
                        *(undefined2 *)(lVar36 + 0x20) = 3;
                      }
                      if ((ushort)(*(short *)(lVar36 + 0x28) - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x2c) = 0;
                        *(undefined2 *)(lVar36 + 0x28) = 3;
                      }
                      if ((ushort)(*(short *)(lVar36 + 0x30) - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x34) = 0;
                        *(undefined2 *)(lVar36 + 0x30) = 3;
                      }
                      if ((ushort)(*(short *)(lVar36 + 0x38) - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x3c) = 0;
                        *(undefined2 *)(lVar36 + 0x38) = 3;
                      }
                      if ((ushort)(*(short *)(lVar36 + 0x40) - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x44) = 0;
                        *(undefined2 *)(lVar36 + 0x40) = 3;
                      }
                      if ((ushort)(*(short *)(lVar36 + 0x48) - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x4c) = 0;
                        *(undefined2 *)(lVar36 + 0x48) = 3;
                      }
                      if ((ushort)(*(short *)(lVar36 + 0x50) - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x54) = 0;
                        *(undefined2 *)(lVar36 + 0x50) = 3;
                      }
                      if ((ushort)(*(short *)(lVar36 + 0x58) - 4U) < 3) {
                        *(undefined4 *)(lVar36 + 0x5c) = 0;
                        *(undefined2 *)(lVar36 + 0x58) = 3;
                      }
                    }
                  }
                }
                else if ((bVar4 || bVar3) || (local_958[3] <= 0.0)) {
                  if (0.0 <= (double)CONCAT44(uVar45,uVar37) &&
                      (double)CONCAT44(uVar45,uVar37) != 0.0) {
                    *(undefined2 *)(lVar36 + 0x20) = 4;
                  }
                }
                else {
                  *(undefined2 *)(lVar36 + 0x20) = 3;
                }
              }
              lVar29 = lVar29 + 0x90;
              uVar32 = uVar32 - 1;
            } while (uVar32 != 0);
            uVar35 = (ulonglong)local_dd8;
            puVar10 = local_de8;
            uVar18 = local_ddc;
          }
          local_ddc = uVar18 + 1;
          uVar23 = (ulonglong)*puVar10;
          uVar32 = uVar35;
          uVar15 = (ulonglong)local_ddc;
        } while (local_ddc < (uint)(&DAT_14098a604)[(ulonglong)*puVar10 * 0x1aade]);
      }
      memset(local_958,0,0x400);
      if ((&DAT_14098a5d8)[uVar23 * 0x1aade] != 0) {
        plVar28 = (longlong *)((&DAT_14098a5d0)[uVar23 * 0xd56f] + 0x30);
        uVar32 = (ulonglong)(uint)(&DAT_14098a5d8)[uVar23 * 0x1aade];
        do {
          lVar29 = *plVar28;
          if ((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) {
            uVar26 = *(ushort *)(lVar29 + 0x20);
            if ((ushort)(uVar26 - 1) < 0xfffe) {
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x24) + local_958[uVar26];
              }
              uVar26 = *(ushort *)(lVar29 + 0x28);
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x2c) + local_958[uVar26];
              }
              uVar26 = *(ushort *)(lVar29 + 0x30);
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x34) + local_958[uVar26];
              }
              uVar26 = *(ushort *)(lVar29 + 0x38);
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x3c) + local_958[uVar26];
              }
              uVar26 = *(ushort *)(lVar29 + 0x40);
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x44) + local_958[uVar26];
              }
              uVar26 = *(ushort *)(lVar29 + 0x48);
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x4c) + local_958[uVar26];
              }
              uVar26 = *(ushort *)(lVar29 + 0x50);
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x54) + local_958[uVar26];
              }
              uVar26 = *(ushort *)(lVar29 + 0x58);
              if ((ushort)(uVar26 - 1) < 0x7f) {
                local_958[uVar26] = (double)*(float *)(lVar29 + 0x5c) + local_958[uVar26];
              }
            }
          }
          plVar28 = plVar28 + 0x12;
          uVar32 = uVar32 - 1;
        } while (uVar32 != 0);
        uVar23 = (ulonglong)*local_de8;
      }
      local_ddc = 0;
      uVar32 = uVar8;
      if ((&DAT_14098a5d8)[uVar23 * 0x1aade] != 0) {
        do {
          uVar22 = (uint)uVar32;
          lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar23 * 0xd56f] + 0x30 + uVar32 * 0x90);
          if ((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) {
            puVar33 = (ushort *)(lVar29 + 0x20);
            if ((*puVar33 != 0xffff) && (*puVar33 != 0)) {
              uVar32 = 1;
              lVar36 = 8;
              do {
                uVar13 = (uint)uVar32;
                uVar22 = 8;
                switch(*puVar33) {
                case 1:
                  uVar22 = 2;
                  break;
                case 2:
                  uVar22 = 1;
                  break;
                default:
                  goto switchD_14038552d_caseD_3;
                case 4:
                  uVar22 = 5;
                  break;
                case 5:
                  uVar22 = 4;
                  break;
                case 7:
                  break;
                case 8:
                  uVar22 = 7;
                  break;
                case 0xd:
                  uVar22 = 0xe;
                  break;
                case 0xe:
                  uVar22 = 0xd;
                }
                if (local_958[*puVar33] <= local_958[uVar22] &&
                    local_958[uVar22] != local_958[*puVar33]) {
                  *puVar33 = (ushort)uVar22;
                }
                if (uVar13 < 8) {
                  puVar14 = (ushort *)(lVar29 + (uVar32 + 4) * 8);
LAB_140385590:
                  uVar18 = (uint)uVar32;
                  if (*puVar14 != (ushort)uVar22) goto code_r0x000140385595;
                  if (uVar18 < 7) {
                    puVar24 = (undefined8 *)(lVar29 + ((ulonglong)(uVar18 + 1) + 4) * 8);
                    puVar30 = (undefined8 *)(lVar29 + (uVar32 + 4) * 8);
                    for (uVar15 = (ulonglong)(7 - uVar18); uVar15 != 0; uVar15 = uVar15 - 1) {
                      *puVar30 = *puVar24;
                      puVar24 = puVar24 + 1;
                      puVar30 = puVar30 + 1;
                    }
                  }
                  *(undefined8 *)(lVar29 + 0x58) = 0xffff;
                }
switchD_14038552d_caseD_3:
                uVar32 = (ulonglong)(uVar13 + 1);
                puVar33 = puVar33 + 4;
                lVar36 = lVar36 + -1;
              } while (lVar36 != 0);
              uVar23 = (ulonglong)*local_de8;
              uVar22 = local_ddc;
            }
          }
          local_ddc = uVar22 + 1;
          uVar32 = (ulonglong)local_ddc;
        } while (local_ddc < (uint)(&DAT_14098a5d8)[uVar23 * 0x1aade]);
      }
      if ((local_dd4 != 0) && (local_de0 == 0)) {
        memset(&local_558,0,0x400);
        memset(local_158,0,0x80);
        puVar10 = local_de8;
        uVar32 = uVar8;
        if ((&DAT_14098a5d8)[uVar23 * 0x1aade] != 0) {
          do {
            piVar2 = *(int **)((&DAT_14098a5d0)[uVar23 * 0xd56f] + 0x30 + uVar32 * 0x90);
            if ((((piVar2 != (int *)0x0) && (uVar26 = *(ushort *)(piVar2 + 8), uVar26 != 0xffff)) &&
                (uVar26 != 0)) && ((uVar26 != 0 && (uVar26 < 0x80)))) {
              if ((short)piVar2[0x87] < 0) {
                local_158[uVar26] = '\x01';
              }
              else {
                iVar20 = *piVar2;
                if (iVar20 < piVar2[1]) {
                  do {
                    local_df0 = 0;
                    local_df8 = 0;
                    fVar47 = (float)FUN_14036a7f0(piVar2,iVar20,0,0);
                    (&local_558)[*(ushort *)(piVar2 + 8)] =
                         (double)fVar47 + (double)(&local_558)[*(ushort *)(piVar2 + 8)];
                    iVar20 = iVar20 + 1;
                  } while (iVar20 < piVar2[1]);
                  uVar23 = (ulonglong)*puVar10;
                }
              }
            }
            uVar22 = (int)uVar32 + 1;
            uVar32 = (ulonglong)uVar22;
          } while (uVar22 < (uint)(&DAT_14098a5d8)[uVar23 * 0x1aade]);
        }
        uVar22 = 3;
        do {
          dVar40 = -1.0;
          uVar18 = 1;
          uVar35 = 1;
          pcVar31 = local_158 + 3;
          uVar32 = uVar8;
          uVar15 = uVar8;
          uVar23 = uVar8;
          uVar13 = uVar22;
          do {
            if (((*(longlong *)((longlong)&DAT_154f06378 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f06378 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32), 0.0 < dVar39)) {
              if ((pcVar31[-2] == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = uVar35;
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            if (((*(longlong *)((longlong)&DAT_154f06380 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f06380 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32 + 8), 0.0 < dVar39)) {
              if ((pcVar31[-1] == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = (ulonglong)(uVar13 - 1);
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            if (((*(longlong *)((longlong)&DAT_154f06388 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f06388 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32 + 0x10), 0.0 < dVar39)) {
              if ((*pcVar31 == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = (ulonglong)uVar13;
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            if (((*(longlong *)((longlong)&DAT_154f06390 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f06390 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32 + 0x18), 0.0 < dVar39)) {
              if ((pcVar31[1] == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = (ulonglong)(uVar13 + 1);
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            if (((*(longlong *)((longlong)&DAT_154f06398 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f06398 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32 + 0x20), 0.0 < dVar39)) {
              if ((pcVar31[2] == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = (ulonglong)(uVar13 + 2);
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            if (((*(longlong *)((longlong)&DAT_154f063a0 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f063a0 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32 + 0x28), 0.0 < dVar39)) {
              if ((pcVar31[3] == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = (ulonglong)(uVar13 + 3);
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            if (((*(longlong *)((longlong)&DAT_154f063a8 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f063a8 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32 + 0x30), 0.0 < dVar39)) {
              if ((pcVar31[4] == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = (ulonglong)(uVar13 + 4);
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            if (((*(longlong *)((longlong)&DAT_154f063b0 + uVar32) != 0) &&
                ((*(byte *)(*(longlong *)((longlong)&DAT_154f063b0 + uVar32) + 0x28) & 0x10) == 0))
               && (dVar39 = *(double *)((longlong)local_550 + uVar32 + 0x38), 0.0 < dVar39)) {
              if ((pcVar31[5] == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                uVar23 = (ulonglong)(uVar13 + 5);
                dVar40 = dVar39;
              }
              uVar15 = (ulonglong)((int)uVar15 + 1);
            }
            uVar17 = (uint)uVar15;
            uVar34 = (int)uVar35 + 8;
            uVar35 = (ulonglong)uVar34;
            uVar32 = uVar32 + 0x40;
            uVar13 = uVar13 + 8;
            pcVar31 = pcVar31 + 8;
          } while (uVar13 < 0x7b);
          if (uVar34 < 0x80) {
            pcVar31 = local_158 + uVar34;
            lVar29 = uVar35 * 8;
            do {
              if (((*(longlong *)((longlong)&DAT_154f06370 + lVar29) != 0) &&
                  ((*(byte *)(*(longlong *)((longlong)&DAT_154f06370 + lVar29) + 0x28) & 0x10) == 0)
                  ) && (dVar39 = *(double *)((longlong)&local_558 + lVar29), 0.0 < dVar39)) {
                if ((*pcVar31 == '\0') && ((dVar40 == -1.0 || (dVar39 < dVar40)))) {
                  uVar23 = uVar35;
                  dVar40 = dVar39;
                }
                uVar15 = (ulonglong)((int)uVar15 + 1);
              }
              uVar17 = (uint)uVar15;
              uVar13 = (int)uVar35 + 1;
              uVar35 = (ulonglong)uVar13;
              lVar29 = lVar29 + 8;
              pcVar31 = pcVar31 + 1;
            } while (uVar13 < 0x80);
          }
          if (dVar40 == -1.0) break;
          uVar26 = (ushort)local_de8[5];
          if ((8 < uVar26) || ((char)local_de8[0x26] != '\0')) {
            uVar18 = (uint)uVar26;
          }
          if (uVar18 < uVar17) {
            (&local_558)[uVar23] = 0;
            uVar17 = uVar17 - 1;
          }
          uVar13 = (uint)uVar26;
          if ((uVar26 < 9) && ((char)local_de8[0x26] == '\0')) {
            uVar13 = 1;
          }
        } while (uVar13 < uVar17);
        uVar32 = 1;
        auVar44 = ZEXT816(0);
        pdVar12 = local_550 + 2;
        do {
          iVar20 = (int)uVar32;
          dVar40 = pdVar12[-2];
          uVar37 = 0;
          uVar45 = 0;
          dVar39 = auVar44._0_8_;
          if (iVar20 - 3U < 4) {
            dVar5 = dVar40 * 0.25;
            if (dVar40 * 0.25 <= dVar39) {
              dVar5 = dVar39;
            }
          }
          else {
            dVar5 = dVar40;
            if (dVar40 <= dVar39) {
              uVar37 = auVar44._8_4_;
              uVar45 = auVar44._12_4_;
              dVar5 = dVar39;
            }
          }
          if ((uVar22 - 5 < 3) || (iVar20 == 2)) {
            auVar41._0_8_ = pdVar12[-1] * 0.25;
            auVar41._8_8_ = 0;
            if (auVar41._0_8_ <= dVar5) {
              auVar41._8_8_ = 0;
              auVar41._0_8_ = dVar5;
            }
          }
          else {
            auVar41._8_8_ = 0;
            auVar41._0_8_ = pdVar12[-1];
            if (pdVar12[-1] <= dVar5) {
              auVar41._8_4_ = uVar37;
              auVar41._0_8_ = dVar5;
              auVar41._12_4_ = uVar45;
            }
          }
          dVar40 = auVar41._0_8_;
          if ((uVar22 - 4 < 3) || (iVar20 == 1)) {
            uVar37 = 0;
            uVar45 = 0;
            dVar39 = *pdVar12 * 0.25;
            if (*pdVar12 * 0.25 <= dVar40) {
              dVar39 = dVar40;
            }
          }
          else {
            uVar37 = 0;
            uVar45 = 0;
            dVar39 = *pdVar12;
            if (*pdVar12 <= dVar40) {
              uVar37 = auVar41._8_4_;
              uVar45 = auVar41._12_4_;
              dVar39 = dVar40;
            }
          }
          if ((uVar22 - 3 < 3) || (iVar20 == 0)) {
            auVar42._0_8_ = pdVar12[1] * 0.25;
            auVar42._8_8_ = 0;
            if (auVar42._0_8_ <= dVar39) {
              auVar42._8_8_ = 0;
              auVar42._0_8_ = dVar39;
            }
          }
          else {
            auVar42._8_8_ = 0;
            auVar42._0_8_ = pdVar12[1];
            if (pdVar12[1] <= dVar39) {
              auVar42._8_4_ = uVar37;
              auVar42._0_8_ = dVar39;
              auVar42._12_4_ = uVar45;
            }
          }
          dVar40 = auVar42._0_8_;
          if ((uVar22 - 2 < 3) || (iVar20 == -1)) {
            uVar37 = 0;
            uVar45 = 0;
            dVar39 = pdVar12[2] * 0.25;
            if (pdVar12[2] * 0.25 <= dVar40) {
              dVar39 = dVar40;
            }
          }
          else {
            uVar37 = 0;
            uVar45 = 0;
            dVar39 = pdVar12[2];
            if (pdVar12[2] <= dVar40) {
              uVar37 = auVar42._8_4_;
              uVar45 = auVar42._12_4_;
              dVar39 = dVar40;
            }
          }
          if ((uVar22 - 1 < 3) || (iVar20 == -2)) {
            auVar43._0_8_ = pdVar12[3] * 0.25;
            auVar43._8_8_ = 0;
            if (auVar43._0_8_ <= dVar39) {
              auVar43._8_8_ = 0;
              auVar43._0_8_ = dVar39;
            }
          }
          else {
            auVar43._8_8_ = 0;
            auVar43._0_8_ = pdVar12[3];
            if (pdVar12[3] <= dVar39) {
              auVar43._8_4_ = uVar37;
              auVar43._0_8_ = dVar39;
              auVar43._12_4_ = uVar45;
            }
          }
          dVar40 = auVar43._0_8_;
          if ((uVar22 < 3) || (iVar20 == -3)) {
            uVar37 = 0;
            uVar45 = 0;
            dVar39 = pdVar12[4] * 0.25;
            if (pdVar12[4] * 0.25 <= dVar40) {
              dVar39 = dVar40;
            }
          }
          else {
            uVar37 = 0;
            uVar45 = 0;
            dVar39 = pdVar12[4];
            if (pdVar12[4] <= dVar40) {
              uVar37 = auVar43._8_4_;
              uVar45 = auVar43._12_4_;
              dVar39 = dVar40;
            }
          }
          if ((uVar22 + 1 < 3) || (iVar20 == -4)) {
            auVar44._0_8_ = pdVar12[5] * 0.25;
            auVar44._8_8_ = 0;
            if (auVar44._0_8_ <= dVar39) {
              auVar44._8_8_ = 0;
              auVar44._0_8_ = dVar39;
            }
          }
          else {
            auVar44._8_8_ = 0;
            auVar44._0_8_ = pdVar12[5];
            if (pdVar12[5] <= dVar39) {
              auVar44._8_4_ = uVar37;
              auVar44._0_8_ = dVar39;
              auVar44._12_4_ = uVar45;
            }
          }
          uVar37 = auVar44._0_4_;
          uVar45 = auVar44._4_4_;
          uVar13 = iVar20 + 8;
          uVar32 = (ulonglong)uVar13;
          uVar22 = uVar22 + 8;
          pdVar12 = pdVar12 + 8;
        } while (uVar22 < 0x7b);
        while (uVar13 < 0x80) {
          if ((int)uVar32 - 3U < 4) {
            dVar40 = (double)(&local_558)[uVar32] * 0.25;
            if (dVar40 <= (double)CONCAT44(uVar45,uVar37)) {
              dVar40 = (double)CONCAT44(uVar45,uVar37);
            }
            auVar44._8_8_ = 0;
            auVar44._0_8_ = dVar40;
            uVar37 = SUB84(dVar40,0);
            uVar45 = (undefined4)((ulonglong)dVar40 >> 0x20);
          }
          else {
            dVar40 = (double)(&local_558)[uVar32];
            uVar37 = SUB84(dVar40,0);
            uVar45 = (undefined4)((ulonglong)dVar40 >> 0x20);
            uVar46 = 0;
            uVar48 = 0;
            if (dVar40 <= auVar44._0_8_) {
              uVar37 = auVar44._0_4_;
              uVar45 = auVar44._4_4_;
              uVar46 = auVar44._8_4_;
              uVar48 = auVar44._12_4_;
            }
            auVar44._4_4_ = uVar45;
            auVar44._0_4_ = uVar37;
            auVar44._8_4_ = uVar46;
            auVar44._12_4_ = uVar48;
          }
          uVar13 = (int)uVar32 + 1;
          uVar32 = (ulonglong)uVar13;
        }
        uVar22 = 1;
        pcVar31 = local_158;
        uVar32 = uVar8;
        do {
          pcVar31 = pcVar31 + 1;
          if (((uVar22 - 0x13 & 0xffffffee) == 0) && (uVar22 != 0x24)) {
            bVar3 = true;
          }
          else {
            bVar3 = false;
          }
          if ((*pcVar31 == '\0') &&
             ((((bVar3 || (*(longlong *)((longlong)&DAT_154f06378 + uVar32) == 0)) ||
               (*(double *)((longlong)local_550 + uVar32) <=
                (double)CONCAT44(uVar45,uVar37) * 0.10000000149011612)) &&
              (uVar23 = (ulonglong)*local_de8, uVar15 = uVar8,
              (&DAT_14098a5d8)[uVar23 * 0x1aade] != 0)))) {
            do {
              lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar23 * 0xd56f] + 0x30 + uVar15 * 0x90);
              if (lVar29 != 0) {
                puVar33 = (ushort *)(lVar29 + 0x20);
                uVar23 = uVar8;
                do {
                  uVar13 = (uint)uVar23;
                  if (*puVar33 == uVar22) {
                    if (uVar13 < 7) {
                      puVar24 = (undefined8 *)(lVar29 + (uVar23 + 4) * 8);
                      do {
                        uVar18 = (int)uVar23 + 1;
                        uVar23 = (ulonglong)uVar18;
                        *puVar24 = *(undefined8 *)(lVar29 + 0x20 + uVar23 * 8);
                        puVar24 = puVar24 + 1;
                      } while (uVar18 < 7);
                    }
                    *(undefined8 *)(lVar29 + 0x58) = 0xffff;
                  }
                  uVar13 = uVar13 + 1;
                  uVar23 = (ulonglong)uVar13;
                  puVar33 = puVar33 + 4;
                } while (uVar13 < 8);
                uVar23 = (ulonglong)*local_de8;
              }
              uVar13 = (int)uVar15 + 1;
              uVar15 = (ulonglong)uVar13;
            } while (uVar13 < (uint)(&DAT_14098a5d8)[uVar23 * 0x1aade]);
          }
          uVar22 = uVar22 + 1;
          uVar32 = uVar32 + 8;
        } while (uVar22 < 0x80);
      }
      uVar22 = local_de0;
      DAT_154f06320 = DAT_154f06320 + '\x1e';
      FUN_14038f8a0(DAT_154f06320,0,0);
      local_de0 = uVar22 + 1;
      param_1 = local_de8;
    } while (local_de0 < local_dc8);
  }
  uVar8 = 0;
  FUN_1405374b0();
  if ((char)local_dcc != '\0') {
    auVar44 = ZEXT816(8) * ZEXT416((uint)((&DAT_14098a5d8)[(ulonglong)*param_1 * 0x1aade] << 3));
    uVar9 = auVar44._0_8_;
    if (auVar44._8_8_ != 0) {
      uVar9 = 0xffffffffffffffff;
    }
    local_dc0 = (uint *)thunk_FUN_14061b650(uVar9);
    if (local_dc0 == (uint *)0x0) {
      FUN_14038fa00();
      return;
    }
    uVar15 = (ulonglong)*param_1;
    uVar32 = uVar8;
    if ((&DAT_14098a5d8)[uVar15 * 0x1aade] != 0) {
      do {
        lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar15 * 0xd56f] + 0x30 + uVar32 * 0x90);
        if (((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) &&
           ((*(short *)(lVar29 + 0x20) != -1 && (*(short *)(lVar29 + 0x20) != 0)))) {
          uVar15 = (ulonglong)(uint)((int)uVar32 * 8);
          uVar9 = *(undefined8 *)(lVar29 + 0x28);
          *(undefined8 *)(local_dc0 + uVar15 * 2) = *(undefined8 *)(lVar29 + 0x20);
          *(undefined8 *)(local_dc0 + uVar15 * 2 + 2) = uVar9;
          uVar9 = *(undefined8 *)(lVar29 + 0x38);
          *(undefined8 *)(local_dc0 + uVar15 * 2 + 4) = *(undefined8 *)(lVar29 + 0x30);
          *(undefined8 *)(local_dc0 + uVar15 * 2 + 4 + 2) = uVar9;
          *(undefined1 (*) [16])(local_dc0 + uVar15 * 2 + 8) = *(undefined1 (*) [16])(lVar29 + 0x40)
          ;
          uVar9 = *(undefined8 *)(lVar29 + 0x58);
          *(undefined8 *)(local_dc0 + uVar15 * 2 + 0xc) = *(undefined8 *)(lVar29 + 0x50);
          *(undefined8 *)(local_dc0 + uVar15 * 2 + 0xc + 2) = uVar9;
          uVar15 = (ulonglong)*param_1;
        }
        uVar22 = (int)uVar32 + 1;
        uVar32 = (ulonglong)uVar22;
      } while (uVar22 < (uint)(&DAT_14098a5d8)[uVar15 * 0x1aade]);
    }
    local_dd8 = 0;
    do {
      uVar15 = 0;
      local_de0 = 0;
      uVar32 = (ulonglong)*param_1;
      uVar22 = (uint)uVar8;
      if ((&DAT_14098a5d8)[uVar32 * 0x1aade] != 0) {
        uVar8 = (ulonglong)*param_1;
        do {
          lVar36 = uVar15 * 0x90;
          lVar29 = (&DAT_14098a5d0)[uVar32 * 0xd56f];
          local_db0 = *(longlong *)(lVar29 + 0x30 + lVar36);
          uVar22 = (uint)uVar8;
          local_da8 = lVar36;
          if (((local_db0 != 0) && (-1 < *(short *)(local_db0 + 0x21c))) &&
             ((*(short *)(local_db0 + 0x20) != -1 && (*(short *)(local_db0 + 0x20) != 0)))) {
            pfVar1 = (float *)(local_db0 + 0x24);
            if ((*pfVar1 < 0.9) || (*pfVar1 - *(float *)(local_db0 + 0x2c) <= 0.15)) {
              local_db8 = (int)(*(float *)(lVar29 + 0x24 + lVar36) + 0.5) & 0xff;
              local_dc8 = local_db8 - 8;
              local_db8 = local_db8 + 8;
              fVar47 = *(float *)(lVar29 + 0x14 + lVar36);
              fVar58 = *(float *)(lVar29 + 0x10 + lVar36);
              fVar57 = fVar47 - fVar58;
              fVar38 = 1.0;
              if ((fVar57 <= 1.0) || (fVar38 = 2.0, 2.0 <= fVar57)) {
                fVar57 = fVar38;
              }
              fVar58 = fVar58 - fVar57;
              uVar6 = FUN_14036b6d0(local_db0,0xffffffff,0xffffffff);
              local_dcc = CONCAT22(local_dcc._2_2_,uVar6);
              memset(local_d58,0,0x200);
              memset(&local_558,0,0x200);
              memset(local_b58,0,0x200);
              bVar3 = false;
              uVar8 = 0;
              local_ddc = 0;
              uVar22 = *local_de8;
              param_1 = local_de8;
              if ((&DAT_14098a5d8)[(ulonglong)uVar22 * 0x1aade] != 0) {
                uVar32 = (ulonglong)uVar22;
                do {
                  uVar22 = (uint)uVar32;
                  lVar29 = (&DAT_14098a5d0)[uVar32 * 0xd56f];
                  pfVar25 = (float *)(lVar29 + 0x14 + uVar8 * 0x90);
                  if (fVar58 < *pfVar25 || fVar58 == *pfVar25) {
                    if (fVar47 + fVar57 < *(float *)(lVar29 + 0x10 + uVar8 * 0x90)) break;
                    if (((((uint)uVar8 != local_de0) &&
                         (lVar19 = *(longlong *)(lVar29 + 0x30 + uVar8 * 0x90), lVar19 != 0)) &&
                        (-1 < *(short *)(lVar19 + 0x21c))) &&
                       ((((ushort)(*(short *)(lVar19 + 0x20) - 1U) < 0xfffe &&
                         (uVar22 = (int)(*(float *)(lVar29 + 0x24 + uVar8 * 0x90) + 0.5) & 0xff,
                         (int)local_dc8 <= (int)uVar22)) && (uVar22 <= local_db8)))) {
                      sVar7 = FUN_14036b6d0(lVar19,0xffffffff,0xffffffff);
                      uVar22 = (int)(short)local_dcc - (int)sVar7 >> 0x1f;
                      if (((int)(((int)(short)local_dcc - (int)sVar7 ^ uVar22) - uVar22) < 0x7001)
                         && (*(byte *)(local_db0 + 0x22) <= *(byte *)(lVar19 + 0x22))) {
                        lVar29 = (&DAT_14098a5d0)[(ulonglong)*local_de8 * 0xd56f];
                        fVar38 = *(float *)(lVar29 + 0x14 + lVar36);
                        fVar52 = *(float *)(lVar29 + 0x10 + uVar8 * 0x90);
                        fVar53 = *(float *)(lVar29 + 0x14 + uVar8 * 0x90);
                        fVar55 = *(float *)(lVar29 + 0x10 + lVar36);
                        fVar54 = fVar38 - fVar55;
                        fVar50 = fVar53 - fVar52;
                        fVar56 = fVar38 - fVar52;
                        if (fVar53 - fVar55 <= fVar38 - fVar52) {
                          fVar56 = fVar53 - fVar55;
                        }
                        fVar49 = fVar54 * 0.8;
                        if (fVar50 * 0.8 <= fVar54 * 0.8) {
                          fVar49 = fVar50 * 0.8;
                        }
                        fVar51 = 1.0;
                        if (fVar52 <= fVar38 + 0.5) {
                          if (fVar53 < fVar55 - 0.5) {
                            fVar38 = (fVar55 - fVar53) - 0.5;
                            if (fVar38 <= 0.0) {
                              fVar38 = 0.0;
                            }
                            fVar51 = 1.0 - fVar38 / fVar57;
                          }
                        }
                        else {
                          fVar38 = (fVar52 - fVar38) - 0.5;
                          if (fVar38 <= 0.0) {
                            fVar38 = 0.0;
                          }
                          fVar51 = 1.0 - fVar38 / fVar57;
                        }
                        fVar38 = *(float *)(lVar29 + 0x24 + uVar8 * 0x90);
                        fVar55 = *(float *)(lVar29 + 0x24 + lVar36);
                        if (fVar38 <= fVar55) {
                          fVar38 = fVar55 - fVar38;
                        }
                        else {
                          fVar38 = fVar38 - fVar55;
                        }
                        fVar38 = fVar38 - 3.75;
                        if (fVar38 <= 0.0) {
                          fVar38 = 0.0;
                        }
                        fVar51 = (1.0 - fVar38 * 0.125) * fVar51;
                        fVar38 = fVar54;
                        if (fVar54 <= 0.3) {
                          fVar38 = 0.3;
                        }
                        if (fVar50 < fVar38) {
                          fVar50 = fVar50 / fVar54;
                          if (1.0 <= fVar50) {
                            fVar50 = 1.0;
                          }
                          else if (fVar50 <= 0.0) {
                            fVar50 = 0.0;
                          }
                          fVar51 = fVar51 * fVar50;
                        }
                        uVar22 = *(uint *)(lVar29 + 0x28 + uVar8 * 0x90);
                        if ((uVar22 != 0) || (*(int *)(lVar29 + 0x28 + lVar36) != 0)) {
                          uVar13 = *(uint *)(lVar29 + 0x28 + lVar36);
                          uVar32 = (ulonglong)local_de0;
                          if (uVar22 <= uVar13) {
                            uVar32 = uVar8;
                          }
                          if (uVar13 <= uVar22) {
                            uVar13 = uVar22;
                          }
                          fVar38 = ((float)*(uint *)(lVar29 + 0x28 + uVar32 * 0x90) * 4.0) /
                                   (float)uVar13;
                          if (1.0 <= fVar38) {
                            fVar38 = 1.0;
                          }
                          fVar51 = fVar51 * (fVar38 * 0.3 + 0.7);
                        }
                        uVar22 = 0;
                        pfVar25 = (float *)(lVar19 + 0x24);
                        do {
                          if (local_dd8 == 0) {
                            if ((*pfVar25 < 0.9) || (0.15 < *(float *)(lVar19 + 0x24) - *pfVar25))
                            break;
                          }
                          else if ((local_dd8 == 1) && (uVar22 != 0)) break;
                          uVar26 = *(ushort *)(pfVar25 + -1);
                          if (((ushort)(uVar26 - 1) < 0x7f) &&
                             (((*(byte *)((&DAT_154f06370)[uVar26] + 0x28) & 1) == 0 ||
                              (fVar56 <= fVar49)))) {
                            uVar13 = 0;
                            pfVar11 = pfVar1;
                            do {
                              if ((*(ushort *)(pfVar11 + -1) == uVar26) &&
                                 (*pfVar1 - *pfVar11 < 0.15)) {
                                local_d58[uVar26] =
                                     fVar51 * *pfVar25 * (fVar53 - fVar52) + local_d58[uVar26];
                                local_b58[uVar26] = (fVar53 - fVar52) + local_b58[uVar26];
                                break;
                              }
                              uVar13 = uVar13 + 1;
                              pfVar11 = pfVar11 + 2;
                            } while (uVar13 < 8);
                          }
                          uVar22 = uVar22 + 1;
                          pfVar25 = pfVar25 + 2;
                        } while (uVar22 < 8);
                        bVar3 = true;
                        uVar8 = (ulonglong)local_ddc;
                        lVar36 = local_da8;
                      }
                    }
                  }
                  local_ddc = (int)uVar8 + 1;
                  uVar8 = (ulonglong)local_ddc;
                  uVar22 = *local_de8;
                  uVar32 = (ulonglong)uVar22;
                } while (local_ddc < (uint)(&DAT_14098a5d8)[uVar32 * 0x1aade]);
                param_1 = local_de8;
                if (bVar3) {
                  uVar22 = 2;
                  do {
                    uVar13 = uVar22 - 2;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 - 1;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    if (local_b58[uVar22] != 0.0) {
                      local_d58[uVar22] = local_d58[uVar22] / (local_b58[uVar22] * 3.0);
                    }
                    uVar13 = uVar22 + 1;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 2;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 3;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 4;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 5;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 6;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 7;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 8;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 9;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 10;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0xb;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0xc;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0xd;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0xe;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0xf;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x10;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x11;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x12;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x13;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x14;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x15;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x16;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x17;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x18;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x19;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x1a;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x1b;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x1c;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x1d;
                    if (local_b58[uVar13] != 0.0) {
                      local_d58[uVar13] = local_d58[uVar13] / (local_b58[uVar13] * 3.0);
                    }
                    uVar13 = uVar22 + 0x1e;
                    uVar22 = uVar22 + 0x20;
                  } while (uVar13 < 0x80);
                  if ((ushort)(*(ushort *)(local_db0 + 0x20) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x20);
                    local_d58[uVar8] = *pfVar1 + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x22);
                  }
                  if ((ushort)(*(ushort *)(local_db0 + 0x28) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x28);
                    local_d58[uVar8] = *(float *)(local_db0 + 0x2c) + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x2a);
                  }
                  if ((ushort)(*(ushort *)(local_db0 + 0x30) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x30);
                    local_d58[uVar8] = *(float *)(local_db0 + 0x34) + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x32);
                  }
                  if ((ushort)(*(ushort *)(local_db0 + 0x38) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x38);
                    local_d58[uVar8] = *(float *)(local_db0 + 0x3c) + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x3a);
                  }
                  if ((ushort)(*(ushort *)(local_db0 + 0x40) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x40);
                    local_d58[uVar8] = *(float *)(local_db0 + 0x44) + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x42);
                  }
                  if ((ushort)(*(ushort *)(local_db0 + 0x48) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x48);
                    local_d58[uVar8] = *(float *)(local_db0 + 0x4c) + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x4a);
                  }
                  if ((ushort)(*(ushort *)(local_db0 + 0x50) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x50);
                    local_d58[uVar8] = *(float *)(local_db0 + 0x54) + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x52);
                  }
                  if ((ushort)(*(ushort *)(local_db0 + 0x58) - 1) < 0x7f) {
                    uVar8 = (ulonglong)*(ushort *)(local_db0 + 0x58);
                    local_d58[uVar8] = *(float *)(local_db0 + 0x5c) + local_d58[uVar8];
                    *(float *)((longlong)&local_558 + uVar8 * 4) =
                         (float)*(byte *)(local_db0 + 0x5a);
                  }
                  FUN_140381ef0(local_dc0 + (ulonglong)(local_de0 * 8) * 2,local_d58,&local_558);
                  uVar22 = *local_de8;
                  param_1 = local_de8;
                }
              }
            }
          }
          uVar32 = (ulonglong)uVar22;
          local_de0 = local_de0 + 1;
          uVar15 = (ulonglong)local_de0;
          uVar8 = uVar32;
          uVar22 = local_dd8;
        } while (local_de0 < (uint)(&DAT_14098a5d8)[uVar32 * 0x1aade]);
      }
      uVar8 = 0;
      if ((&DAT_14098a5d8)[uVar32 * 0x1aade] != 0) {
        do {
          lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar32 * 0xd56f] + 0x30 + uVar8 * 0x90);
          if ((((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) &&
              (*(short *)(lVar29 + 0x20) != -1)) && (*(short *)(lVar29 + 0x20) != 0)) {
            uVar32 = (ulonglong)(uint)((int)uVar8 * 8);
            uVar9 = *(undefined8 *)(local_dc0 + uVar32 * 2 + 2);
            *(undefined8 *)(lVar29 + 0x20) = *(undefined8 *)(local_dc0 + uVar32 * 2);
            *(undefined8 *)(lVar29 + 0x28) = uVar9;
            uVar9 = *(undefined8 *)(local_dc0 + uVar32 * 2 + 4 + 2);
            *(undefined8 *)(lVar29 + 0x30) = *(undefined8 *)(local_dc0 + uVar32 * 2 + 4);
            *(undefined8 *)(lVar29 + 0x38) = uVar9;
            *(undefined1 (*) [16])(lVar29 + 0x40) =
                 *(undefined1 (*) [16])(local_dc0 + uVar32 * 2 + 8);
            uVar9 = *(undefined8 *)(local_dc0 + uVar32 * 2 + 0xc + 2);
            *(undefined8 *)(lVar29 + 0x50) = *(undefined8 *)(local_dc0 + uVar32 * 2 + 0xc);
            *(undefined8 *)(lVar29 + 0x58) = uVar9;
            uVar32 = (ulonglong)*param_1;
          }
          uVar13 = (int)uVar8 + 1;
          uVar8 = (ulonglong)uVar13;
        } while (uVar13 < (uint)(&DAT_14098a5d8)[uVar32 * 0x1aade]);
      }
      DAT_154f06320 = DAT_154f06320 + '\x05';
      FUN_14038f8a0(DAT_154f06320,0,0);
      local_dd8 = uVar22 + 1;
      uVar8 = (ulonglong)local_dd8;
    } while (local_dd8 < 2);
    if (((byte)param_1[0xd4] & 0x1e) == 0x1e) {
      memset(local_958,0,0x400);
      uVar8 = (ulonglong)*param_1;
      uVar13 = (&DAT_14098a5d8)[uVar8 * 0x1aade];
      uVar22 = 0;
      if (3 < uVar13) {
        plVar28 = (longlong *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0xc0);
        uVar22 = (uVar13 - 4 >> 2) + 1;
        uVar32 = (ulonglong)uVar22;
        uVar22 = uVar22 * 4;
        do {
          lVar29 = plVar28[-0x12];
          if (((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) &&
             (uVar26 = *(ushort *)(lVar29 + 0x20), (ushort)(uVar26 - 1) < 0x7e)) {
            local_958[uVar26] = (double)*(float *)(lVar29 + 0x24) + local_958[uVar26];
          }
          lVar29 = *plVar28;
          if (((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) &&
             (uVar26 = *(ushort *)(lVar29 + 0x20), (ushort)(uVar26 - 1) < 0x7e)) {
            local_958[uVar26] = (double)*(float *)(lVar29 + 0x24) + local_958[uVar26];
          }
          lVar29 = plVar28[0x12];
          if (((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) &&
             (uVar26 = *(ushort *)(lVar29 + 0x20), (ushort)(uVar26 - 1) < 0x7e)) {
            local_958[uVar26] = (double)*(float *)(lVar29 + 0x24) + local_958[uVar26];
          }
          lVar29 = plVar28[0x24];
          if (((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) &&
             (uVar26 = *(ushort *)(lVar29 + 0x20), (ushort)(uVar26 - 1) < 0x7e)) {
            local_958[uVar26] = (double)*(float *)(lVar29 + 0x24) + local_958[uVar26];
          }
          plVar28 = plVar28 + 0x48;
          uVar32 = uVar32 - 1;
        } while (uVar32 != 0);
      }
      if (uVar22 < uVar13) {
        plVar28 = (longlong *)((ulonglong)uVar22 * 0x90 + 0x30 + (&DAT_14098a5d0)[uVar8 * 0xd56f]);
        uVar32 = (ulonglong)(uVar13 - uVar22);
        do {
          lVar29 = *plVar28;
          if (((lVar29 != 0) && (-1 < *(short *)(lVar29 + 0x21c))) &&
             (uVar26 = *(ushort *)(lVar29 + 0x20), (ushort)(uVar26 - 1) < 0x7e)) {
            local_958[uVar26] = (double)*(float *)(lVar29 + 0x24) + local_958[uVar26];
          }
          plVar28 = plVar28 + 0x12;
          uVar32 = uVar32 - 1;
        } while (uVar32 != 0);
      }
      uVar32 = 0;
      if (uVar13 != 0) {
        do {
          lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x30 + uVar32 * 0x90);
          if (lVar29 != 0) {
            *(undefined2 *)(lVar29 + 0x20) = 0x2d;
            uVar8 = (ulonglong)*param_1;
          }
          uVar22 = (int)uVar32 + 1;
          uVar32 = (ulonglong)uVar22;
        } while (uVar22 < (uint)(&DAT_14098a5d8)[uVar8 * 0x1aade]);
      }
    }
    else {
      uVar32 = 0;
      uVar8 = (ulonglong)*param_1;
      if ((&DAT_14098a5d8)[uVar8 * 0x1aade] != 0) {
        do {
          uVar15 = 0;
          lVar29 = (&DAT_14098a5d0)[uVar8 * 0xd56f];
          iVar20 = (int)uVar32;
          lVar19 = uVar32 * 0x90;
          lVar36 = *(longlong *)(lVar19 + 0x30 + lVar29);
          if (((lVar36 != 0) && (-1 < *(short *)(lVar36 + 0x21c))) &&
             (((ushort)(*(short *)(lVar36 + 0x20) - 1U) < 0xfffe &&
              (*(float *)(lVar36 + 0x24) - *(float *)(lVar36 + 0x2c) <= 0.15)))) {
            local_d78 = 0;
            local_d70 = 0;
            local_d68 = 0;
            local_d60 = 0;
            local_d98 = 0;
            local_d90 = 0;
            local_d88 = 0;
            local_d80 = 0;
            local_dc8 = (int)(*(float *)(lVar19 + 0x24 + lVar29) + 0.5) & 0xff;
            local_db8 = local_dc8 - 8;
            local_dc8 = local_dc8 + 8;
            fVar47 = *(float *)(lVar19 + 0x14 + lVar29);
            fVar58 = *(float *)(lVar19 + 0x10 + lVar29);
            fVar38 = fVar47 - fVar58;
            if (fVar38 <= 1.0) {
              fVar38 = 1.0;
            }
            fVar58 = fVar58 - fVar38;
            local_dcc = (&DAT_14098a5d8)[uVar8 * 0x1aade];
            local_d78._0_4_ = 0;
            local_d80._4_4_ = 0.0;
            local_d80._0_4_ = 0.0;
            local_d88._4_4_ = 0.0;
            local_d88._0_4_ = 0.0;
            local_d90._4_4_ = 0.0;
            local_d90._0_4_ = 0.0;
            local_d98._4_4_ = 0.0;
            local_d98._0_4_ = 0.0;
            fVar52 = (float)local_d88;
            fVar53 = local_d88._4_4_;
            fVar55 = local_d80._4_4_;
            fVar56 = (float)local_d80;
            uVar22 = (uint)local_d78;
            fVar50 = local_d90._4_4_;
            fVar54 = (float)local_d90;
            fVar49 = local_d98._4_4_;
            fVar57 = (float)local_d98;
            if (local_dcc != 0) {
              local_de0 = 0;
              local_dd8 = 0;
              local_ddc = 0;
              do {
                pfVar1 = (float *)(lVar29 + 0x14 + uVar15 * 0x90);
                param_1 = local_de8;
                if (fVar58 < *pfVar1 || fVar58 == *pfVar1) {
                  if (fVar38 + fVar47 < *(float *)(lVar29 + 0x10 + uVar15 * 0x90)) break;
                  lVar19 = *(longlong *)(lVar29 + 0x30 + uVar15 * 0x90);
                  if (((lVar19 != 0) && (-1 < *(short *)(lVar19 + 0x21c))) &&
                     ((sVar7 = *(short *)(lVar19 + 0x20), (ushort)(sVar7 - 1U) < 0xfffe &&
                      ((uVar13 = (int)(*(float *)(lVar29 + 0x24 + uVar15 * 0x90) + 0.5) & 0xff,
                       (int)local_db8 <= (int)uVar13 && (uVar13 <= local_dc8)))))) {
                    if (sVar7 == *(short *)(lVar36 + 0x20)) {
                      uVar22 = uVar22 + 1;
                      fVar57 = fVar57 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                    if (((ushort)(*(short *)(lVar36 + 0x28) - 1U) <= (ushort)local_dd0) &&
                       (sVar7 == *(short *)(lVar36 + 0x28))) {
                      local_ddc = local_ddc + 1;
                      fVar49 = fVar49 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                    if (((ushort)(*(short *)(lVar36 + 0x30) - 1U) <= (ushort)local_dd0) &&
                       (sVar7 == *(short *)(lVar36 + 0x30))) {
                      local_dd8 = local_dd8 + 1;
                      fVar54 = fVar54 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                    if (((ushort)(*(short *)(lVar36 + 0x38) - 1U) <= (ushort)local_dd0) &&
                       (sVar7 == *(short *)(lVar36 + 0x38))) {
                      local_de0 = local_de0 + 1;
                      fVar50 = fVar50 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                    if (((ushort)(*(short *)(lVar36 + 0x40) - 1U) <= (ushort)local_dd0) &&
                       (sVar7 == *(short *)(lVar36 + 0x40))) {
                      fVar52 = fVar52 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                    if (((ushort)(*(short *)(lVar36 + 0x48) - 1U) <= (ushort)local_dd0) &&
                       (sVar7 == *(short *)(lVar36 + 0x48))) {
                      fVar53 = fVar53 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                    if (((ushort)(*(short *)(lVar36 + 0x50) - 1U) <= (ushort)local_dd0) &&
                       (sVar7 == *(short *)(lVar36 + 0x50))) {
                      fVar56 = fVar56 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                    if (((ushort)(*(short *)(lVar36 + 0x58) - 1U) <= (ushort)local_dd0) &&
                       (sVar7 == *(short *)(lVar36 + 0x58))) {
                      fVar55 = fVar55 + (*(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x14 +
                                                   uVar15 * 0x90) -
                                        *(float *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x10 +
                                                  uVar15 * 0x90));
                    }
                  }
                }
                uVar13 = (int)uVar15 + 1;
                uVar15 = (ulonglong)uVar13;
              } while (uVar13 < local_dcc);
            }
            if (uVar22 < 3) {
              fVar57 = fVar57 * 3.0;
              if (fVar57 <= fVar49) {
                uVar22 = iVar20 * 8;
                uVar9 = *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2) =
                     *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 1) * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 1) * 2) = uVar9;
              }
              if (fVar57 <= fVar54) {
                uVar22 = iVar20 * 8;
                uVar9 = *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2) =
                     *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 2) * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 2) * 2) = uVar9;
              }
              if (fVar57 <= fVar50) {
                uVar22 = iVar20 * 8;
                uVar9 = *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2) =
                     *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 3) * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 3) * 2) = uVar9;
              }
              if (fVar57 <= fVar52) {
                uVar22 = iVar20 * 8;
                uVar9 = *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2) =
                     *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 4) * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 4) * 2) = uVar9;
              }
              if (fVar57 <= fVar53) {
                uVar22 = iVar20 * 8;
                uVar9 = *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2) =
                     *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 5) * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 5) * 2) = uVar9;
              }
              if (fVar57 <= fVar56) {
                uVar22 = iVar20 * 8;
                uVar9 = *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2) =
                     *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 6) * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 6) * 2) = uVar9;
              }
              if (fVar57 <= fVar55) {
                uVar22 = iVar20 * 8;
                uVar9 = *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)uVar22 * 2) =
                     *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 7) * 2);
                *(undefined8 *)(local_dc0 + (ulonglong)(uVar22 + 7) * 2) = uVar9;
              }
            }
          }
          uVar32 = (ulonglong)(iVar20 + 1U);
          uVar8 = (ulonglong)*param_1;
        } while (iVar20 + 1U < (uint)(&DAT_14098a5d8)[(ulonglong)*param_1 * 0x1aade]);
      }
      uVar32 = 0;
      if ((&DAT_14098a5d8)[uVar8 * 0x1aade] != 0) {
        do {
          lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar8 * 0xd56f] + 0x30 + uVar32 * 0x90);
          if (lVar29 != 0) {
            if ((char)param_1[0x26] == '\0') {
              if (-1 < *(short *)(lVar29 + 0x21c)) {
                uVar8 = (ulonglong)(uint)((int)uVar32 * 8);
                uVar9 = *(undefined8 *)(local_dc0 + uVar8 * 2 + 2);
                *(undefined8 *)(lVar29 + 0x20) = *(undefined8 *)(local_dc0 + uVar8 * 2);
                *(undefined8 *)(lVar29 + 0x28) = uVar9;
                uVar9 = *(undefined8 *)(local_dc0 + uVar8 * 2 + 4 + 2);
                *(undefined8 *)(lVar29 + 0x30) = *(undefined8 *)(local_dc0 + uVar8 * 2 + 4);
                *(undefined8 *)(lVar29 + 0x38) = uVar9;
                *(undefined1 (*) [16])(lVar29 + 0x40) =
                     *(undefined1 (*) [16])(local_dc0 + uVar8 * 2 + 8);
                uVar9 = *(undefined8 *)(local_dc0 + uVar8 * 2 + 0xc + 2);
                *(undefined8 *)(lVar29 + 0x50) = *(undefined8 *)(local_dc0 + uVar8 * 2 + 0xc);
                *(undefined8 *)(lVar29 + 0x58) = uVar9;
              }
            }
            else {
              pdVar12 = local_958 + 0x2d;
              if (local_958[0x2d] < local_958[0xd]) {
                pdVar12 = local_958 + 0xd;
              }
              uVar37 = SUB84(local_958[3],0);
              uVar45 = (undefined4)((ulonglong)local_958[3] >> 0x20);
              if (local_958[3] < local_958[4]) {
                uVar37 = SUB84(local_958[4],0);
                uVar45 = (undefined4)((ulonglong)local_958[4] >> 0x20);
              }
              if (*pdVar12 < (double)CONCAT44(uVar45,uVar37) ||
                  *pdVar12 == (double)CONCAT44(uVar45,uVar37)) {
                if (local_958[4] < local_958[3] * 4.0) {
                  *(undefined2 *)(lVar29 + 0x20) = 3;
                }
                else {
                  *(undefined2 *)(lVar29 + 0x20) = 4;
                }
              }
              else {
                *(undefined2 *)(lVar29 + 0x20) = 0x2d;
              }
            }
          }
          uVar22 = (int)uVar32 + 1;
          uVar32 = (ulonglong)uVar22;
          uVar8 = (ulonglong)*param_1;
        } while (uVar22 < (uint)(&DAT_14098a5d8)[(ulonglong)*param_1 * 0x1aade]);
      }
    }
    DAT_154f06320 = DAT_154f06320 + '\x05';
    free(local_dc0);
  }
  uVar15 = 0;
  memset(local_958,0,0x400);
  uVar32 = (ulonglong)*param_1;
  uVar8 = uVar15;
  if ((&DAT_14098a5d8)[uVar32 * 0x1aade] != 0) {
    do {
      lVar29 = *(longlong *)((&DAT_14098a5d0)[uVar32 * 0xd56f] + 0x30 + uVar8 * 0x90);
      if (lVar29 != 0) {
        fVar47 = *(float *)(lVar29 + 0x24);
        uVar32 = uVar15;
        if (*(short *)(lVar29 + 0x20) != -1) {
          uVar32 = (ulonglong)*(ushort *)(lVar29 + 0x20);
        }
        uVar26 = (ushort)uVar32;
        if (fVar47 == 0.0) {
          uVar32 = 0;
          uVar23 = 1;
          pdVar12 = local_958;
          do {
            pdVar12 = pdVar12 + 1;
            if (local_958[uVar32] <= *pdVar12 && *pdVar12 != local_958[uVar32]) {
              uVar32 = uVar23;
            }
            uVar26 = (ushort)uVar32;
            uVar16 = (short)uVar23 + 1;
            uVar23 = (ulonglong)uVar16;
          } while (uVar16 < 0x80);
          *(ushort *)(lVar29 + 0x20) = uVar26;
          if (fVar47 < 0.01) {
            fVar47 = 0.01;
          }
          *(float *)(lVar29 + 0x24) = fVar47;
        }
        if (uVar26 < 0x80) {
          local_958[uVar26] = (double)fVar47 + local_958[uVar26];
        }
      }
      uVar22 = (int)uVar8 + 1;
      uVar32 = (ulonglong)*param_1;
      uVar8 = (ulonglong)uVar22;
    } while (uVar22 < (uint)(&DAT_14098a5d8)[(ulonglong)*param_1 * 0x1aade]);
  }
  pdVar12 = local_958;
  do {
    if (*pdVar12 == 0.0) {
      FUN_14037bba0(uVar15,0,*param_1);
    }
    uVar22 = (int)uVar15 + 1;
    uVar15 = (ulonglong)uVar22;
    pdVar12 = pdVar12 + 1;
  } while (uVar22 < 0x80);
  FUN_14038fa00();
  if (*param_1 == DAT_14098a1b0) {
    FUN_140491c30(0xffffffff,0);
  }
  return;
code_r0x000140385595:
  uVar32 = (ulonglong)(uVar18 + 1);
  puVar14 = puVar14 + 4;
  if (7 < uVar18 + 1) goto switchD_14038552d_caseD_3;
  goto LAB_140385590;
}

