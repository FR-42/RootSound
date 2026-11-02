
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

void FUN_140382c80(int *param_1,undefined4 param_2,uint param_3)

{
  byte bVar1;
  ushort uVar2;
  undefined4 uVar3;
  undefined8 uVar4;
  undefined1 auVar5 [16];
  undefined1 auVar6 [16];
  undefined1 auVar7 [16];
  double dVar8;
  double dVar9;
  double dVar10;
  undefined4 uVar11;
  undefined4 uVar12;
  undefined4 uVar13;
  undefined8 uVar14;
  undefined8 uVar15;
  undefined8 uVar16;
  byte *pbVar17;
  undefined8 *puVar18;
  char cVar19;
  uint uVar20;
  byte *pbVar21;
  float *pfVar22;
  ulonglong uVar23;
  undefined8 *puVar24;
  int *piVar25;
  uint uVar26;
  longlong lVar27;
  ulonglong uVar28;
  int iVar29;
  float fVar30;
  longlong *plVar31;
  longlong lVar32;
  float fVar33;
  float fVar34;
  double dVar35;
  undefined1 auVar36 [16];
  float fVar37;
  float fVar38;
  float fVar39;
  float fVar40;
  float fVar41;
  undefined1 auStack_d28 [32];
  undefined1 *local_d08;
  byte *local_d00;
  uint local_cf8;
  undefined8 local_cf0;
  undefined4 local_ce8;
  byte local_ce0;
  uint local_cd8;
  float local_cc8;
  int local_cc4;
  undefined4 local_cc0 [2];
  longlong local_cb8;
  byte local_ca8 [4];
  float afStack_ca4 [103];
  undefined8 local_b08 [52];
  float local_968 [4];
  float local_958;
  undefined8 local_954;
  float local_94c;
  float local_948;
  float local_768 [4];
  undefined1 auStack_758 [496];
  float local_568 [128];
  undefined1 local_368 [512];
  byte local_168 [128];
  ulonglong local_e8;
  
  local_e8 = DAT_140972168 ^ (ulonglong)auStack_d28;
  if ((-1 < (int)param_3) || (param_3 = DAT_14098a1b0, -1 < (int)DAT_14098a1b0)) {
    if ((short)param_1[0x87] < 0) {
      param_1[10] = 0xffff;
      param_1[0xb] = 0;
      param_1[0xc] = 0xffff;
      param_1[0xd] = 0;
      param_1[0xe] = 0xffff;
      param_1[0xf] = 0;
      param_1[0x10] = 0xffff;
      param_1[0x11] = 0;
      param_1[0x12] = 0xffff;
      param_1[0x13] = 0;
      param_1[0x14] = 0xffff;
      param_1[0x15] = 0;
      param_1[0x16] = 0xffff;
      param_1[0x17] = 0;
      param_1[9] = 0x3f800000;
      *(undefined2 *)((longlong)param_1 + 0x22) = 5;
    }
    else {
      *(undefined2 *)(param_1 + 8) = 0;
      local_cb8 = (longlong)(int)param_3 * 0x6ab78;
      local_cc8 = (float)(int)(0.025 / *(float *)(&DAT_1409c3720 + local_cb8) + 0.5);
      if (((int)local_cc8 < 2) || ((int)local_cc8 < 3)) {
        local_cc8 = 2.8026e-45;
      }
      fVar30 = local_cc8;
      memset(local_968,0,0x200);
      memset(local_768,0,0x200);
      iVar29 = *param_1;
      dVar8 = 0.0;
      dVar10 = 0.0;
      dVar9 = 0.0;
      uVar26 = 0;
      dVar35 = 0.0;
      if (iVar29 < param_1[1]) {
        do {
          local_d00 = (byte *)0x0;
          local_d08 = (undefined1 *)((ulonglong)local_d08 & 0xffffffff00000000);
          fVar33 = (float)FUN_14036a7f0(param_1,iVar29,0xffffffff);
          dVar9 = dVar9 + 1.0;
          dVar35 = (double)fVar33;
          iVar29 = iVar29 + 1;
          dVar8 = dVar8 + dVar35;
          dVar10 = dVar10 + dVar35 * dVar35;
        } while (iVar29 < param_1[1]);
        dVar35 = dVar10;
        if (dVar9 != 0.0) {
          dVar8 = dVar8 / dVar9;
          dVar35 = sqrt(dVar10 / dVar9 - dVar8 * dVar8);
        }
      }
      lVar32 = 0x80;
      fVar33 = 0.0;
      uVar28 = 0;
      fVar38 = local_cc8;
      while (0 < (int)fVar38) {
        local_cc4 = *param_1;
        if (local_cc4 <= param_1[1] - (int)fVar30) {
          do {
            local_d08 = (undefined1 *)(dVar8 - dVar35 * 0.5);
            local_d00 = (byte *)(dVar35 * 1.4 + dVar8);
            local_cf8 = param_3;
            cVar19 = FUN_140380d90(local_ca8,param_1,&local_cc4,fVar30);
            if (cVar19 != '\0') {
              if ((int)uVar28 != 0) {
                fVar38 = 0.0;
                if (local_ca8[0] != 0) {
                  pfVar22 = afStack_ca4;
                  uVar23 = (ulonglong)local_ca8[0];
                  do {
                    fVar38 = fVar38 + *pfVar22;
                    pfVar22 = pfVar22 + 1;
                    uVar23 = uVar23 - 1;
                  } while (uVar23 != 0);
                }
                fVar38 = (float)FUN_14037c3e0(local_ca8,local_b08,fVar38);
                fVar33 = fVar33 + fVar38;
              }
              lVar27 = 3;
              pbVar17 = local_ca8;
              puVar18 = local_b08;
              do {
                puVar24 = puVar18;
                pbVar21 = pbVar17;
                uVar4 = *(undefined8 *)(pbVar21 + 8);
                uVar14 = *(undefined8 *)(pbVar21 + 0x10);
                uVar15 = *(undefined8 *)(pbVar21 + 0x18);
                *puVar24 = *(undefined8 *)pbVar21;
                puVar24[1] = uVar4;
                uVar4 = *(undefined8 *)(pbVar21 + 0x20);
                uVar16 = *(undefined8 *)(pbVar21 + 0x28);
                puVar24[2] = uVar14;
                puVar24[3] = uVar15;
                uVar14 = *(undefined8 *)(pbVar21 + 0x30);
                uVar15 = *(undefined8 *)(pbVar21 + 0x38);
                puVar24[4] = uVar4;
                puVar24[5] = uVar16;
                uVar4 = *(undefined8 *)(pbVar21 + 0x40);
                uVar16 = *(undefined8 *)(pbVar21 + 0x48);
                puVar24[6] = uVar14;
                puVar24[7] = uVar15;
                uVar14 = *(undefined8 *)(pbVar21 + 0x50);
                uVar15 = *(undefined8 *)(pbVar21 + 0x58);
                puVar24[8] = uVar4;
                puVar24[9] = uVar16;
                uVar4 = *(undefined8 *)(pbVar21 + 0x60);
                uVar16 = *(undefined8 *)(pbVar21 + 0x68);
                puVar24[10] = uVar14;
                puVar24[0xb] = uVar15;
                uVar3 = *(undefined4 *)(pbVar21 + 0x70);
                uVar11 = *(undefined4 *)(pbVar21 + 0x74);
                uVar12 = *(undefined4 *)(pbVar21 + 0x78);
                uVar13 = *(undefined4 *)(pbVar21 + 0x7c);
                puVar24[0xc] = uVar4;
                puVar24[0xd] = uVar16;
                *(undefined4 *)(puVar24 + 0xe) = uVar3;
                *(undefined4 *)((longlong)puVar24 + 0x74) = uVar11;
                *(undefined4 *)(puVar24 + 0xf) = uVar12;
                *(undefined4 *)((longlong)puVar24 + 0x7c) = uVar13;
                lVar27 = lVar27 + -1;
                pbVar17 = pbVar21 + 0x80;
                puVar18 = puVar24 + 0x10;
              } while (lVar27 != 0);
              uVar4 = *(undefined8 *)(pbVar21 + 0x88);
              uVar3 = *(undefined4 *)(pbVar21 + 0x90);
              puVar24[0x10] = *(undefined8 *)(pbVar21 + 0x80);
              puVar24[0x11] = uVar4;
              *(undefined4 *)(puVar24 + 0x12) = uVar3;
              local_cc0[0] = 0xffffffff;
              local_ce0 = (byte)((uint)param_2 >> 0x1f) ^ 1;
              local_d00 = local_168;
              local_cf0 = 0;
              local_cf8 = local_cf8 & 0xffffff00;
              local_d08 = local_368;
              local_ce8 = param_2;
              local_cd8 = param_3;
              FUN_14037be30(local_ca8,local_cc0,0xffffffff,local_568);
              fVar38 = -1.0;
              uVar26 = 2;
              do {
                uVar20 = uVar26 - 2;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 - 1;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                bVar1 = local_168[uVar26];
                fVar39 = local_568[uVar26];
                local_968[uVar26] = fVar39 + local_968[uVar26];
                local_768[uVar26] = (float)bVar1 + local_768[uVar26];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 1;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 2;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 3;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 4;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 5;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 6;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 7;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 8;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 9;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 10;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 0xb;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 0xc;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 0xd;
                fVar39 = local_568[uVar20];
                local_968[uVar20] = fVar39 + local_968[uVar20];
                local_768[uVar20] = (float)local_168[uVar20] + local_768[uVar20];
                if ((fVar38 == -1.0) || (fVar38 < fVar39)) {
                  fVar38 = fVar39;
                }
                uVar20 = uVar26 + 0xe;
                uVar26 = uVar26 + 0x10;
              } while (uVar20 < 0x80);
              uVar28 = (ulonglong)((int)uVar28 + 1);
              local_cc4 = local_cc4 + -1 + (int)fVar30;
            }
            uVar26 = (uint)uVar28;
            local_cc4 = local_cc4 + 1;
          } while (local_cc4 <= param_1[1] - (int)fVar30);
          if (uVar26 != 0) break;
        }
        uVar26 = (uint)uVar28;
        fVar30 = (float)((int)fVar30 + (1 - (int)local_cc8));
        fVar38 = fVar30;
      }
      if (uVar26 != 0) {
        lVar27 = 0x10;
        fVar30 = (float)(-(uint)((float)(int)uVar26 < 0.0) & 0x4f800000) + (float)(int)uVar26;
        fVar38 = (float)(-(uint)((float)(int)uVar26 < 0.0) & 0x4f800000) + (float)(int)uVar26;
        fVar39 = (float)(-(uint)((float)(int)uVar26 < 0.0) & 0x4f800000) + (float)(int)uVar26;
        fVar40 = (float)(-(uint)((float)(int)uVar26 < 0.0) & 0x4f800000) + (float)(int)uVar26;
        uVar28 = 0;
        do {
          auVar36._4_4_ = fVar38;
          auVar36._0_4_ = fVar30;
          auVar36._8_4_ = fVar39;
          auVar36._12_4_ = fVar40;
          auVar36 = divps(*(undefined1 (*) [16])((longlong)local_968 + uVar28),auVar36);
          *(undefined1 (*) [16])((longlong)local_968 + uVar28) = auVar36;
          auVar5._4_4_ = fVar38;
          auVar5._0_4_ = fVar30;
          auVar5._8_4_ = fVar39;
          auVar5._12_4_ = fVar40;
          auVar36 = divps(*(undefined1 (*) [16])((longlong)local_768 + uVar28),auVar5);
          *(undefined1 (*) [16])((longlong)local_768 + uVar28) = auVar36;
          auVar6._4_4_ = fVar38;
          auVar6._0_4_ = fVar30;
          auVar6._8_4_ = fVar39;
          auVar6._12_4_ = fVar40;
          auVar36 = divps(*(undefined1 (*) [16])((longlong)&local_958 + uVar28),auVar6);
          *(undefined1 (*) [16])((longlong)&local_958 + uVar28) = auVar36;
          auVar7._4_4_ = fVar38;
          auVar7._0_4_ = fVar30;
          auVar7._8_4_ = fVar39;
          auVar7._12_4_ = fVar40;
          auVar36 = divps(*(undefined1 (*) [16])(auStack_758 + uVar28),auVar7);
          *(undefined1 (*) [16])(auStack_758 + uVar28) = auVar36;
          lVar27 = lVar27 + -1;
          uVar28 = uVar28 + 0x20;
        } while (lVar27 != 0);
        fVar30 = (float)FUN_140382540(param_1,param_3);
        fVar38 = (float)FUN_140381980(param_1,param_3);
        fVar39 = (float)FUN_1403827e0(param_1,param_3);
        if (uVar26 < 2) {
          fVar33 = 1.0;
        }
        else {
          fVar33 = fVar33 / (float)(uVar26 - 1);
        }
        fVar40 = (float)param_1[0x86];
        fVar33 = 1.0 - fVar33;
        fVar41 = (float)(param_1[1] - *param_1) * *(float *)(&DAT_1409c3720 + local_cb8);
        if (fVar40 <= 0.0) {
          local_cc8 = 0.0;
        }
        else {
          local_cc8 = (float)FUN_14036c2a0();
        }
        pfVar22 = local_968;
        plVar31 = &DAT_154f06370;
        do {
          fVar34 = *pfVar22;
          if ((fVar34 != 0.0) && (lVar27 = *plVar31, lVar27 != 0)) {
            uVar26 = *(uint *)(lVar27 + 0x28);
            if ((uVar26 & 0x10) == 0) {
              if ((uVar26 & 0x40) != 0) {
                fVar37 = fVar39 - 0.3;
                if (fVar39 - 0.3 <= 0.0) {
                  fVar37 = 0.0;
                }
                fVar37 = fVar37 - fVar38 * 2.0;
                if (fVar37 <= 0.0) {
                  fVar37 = 0.0;
                }
                if (0.4 <= fVar37) {
                  fVar37 = 0.4;
                }
                fVar34 = (1.0 - fVar37) * fVar34;
                *pfVar22 = fVar34;
              }
              if (*(float *)(lVar27 + 0xc) < fVar30) {
                fVar37 = (fVar30 - *(float *)(lVar27 + 0xc)) / 3.0;
                if (0.4 <= fVar37) {
                  fVar37 = 0.4;
                }
                fVar34 = fVar34 * (1.0 - fVar37);
                *pfVar22 = fVar34;
              }
              if (*(float *)(lVar27 + 0x1c) < fVar38) {
                fVar37 = (fVar38 - *(float *)(lVar27 + 0x1c)) / 0.2;
                if (0.5 <= fVar37) {
                  fVar37 = 0.5;
                }
                fVar34 = fVar34 * (1.0 - fVar37);
                *pfVar22 = fVar34;
              }
              if ((((uVar26 & 4) != 0) && (0.2 < fVar41)) && (fVar38 < 0.1)) {
                fVar34 = (1.0 - (1.0 - fVar38 / 0.1) * 0.1) * fVar34;
                *pfVar22 = fVar34;
              }
              if (fVar39 <= *(float *)(lVar27 + 0x20)) {
                if ((uVar26 & 2) != 0) {
                  fVar37 = 0.4 - fVar39;
                  if (fVar37 <= 0.0) {
                    fVar37 = 0.0;
                  }
                  else if (0.4 <= fVar37) {
                    fVar37 = 0.4;
                  }
                  goto LAB_140383890;
                }
              }
              else {
                fVar37 = (fVar39 - *(float *)(lVar27 + 0x20)) * 0.25;
                if (0.1 <= fVar37) {
                  fVar37 = 0.1;
                }
LAB_140383890:
                fVar34 = fVar34 * (1.0 - fVar37);
                *pfVar22 = fVar34;
              }
              if (fVar33 <= *(float *)(lVar27 + 0x24)) {
                if ((uVar26 & 2) != 0) {
                  fVar37 = 0.05 - fVar33;
                  if (fVar37 <= 0.0) {
                    fVar37 = 0.0;
                  }
                  fVar37 = fVar37 * 4.0;
                  if (0.2 <= fVar37) {
                    fVar37 = 0.2;
                  }
                  goto LAB_1403838ec;
                }
              }
              else {
                fVar37 = (fVar33 - *(float *)(lVar27 + 0x24)) * 0.5;
                if (0.15 <= fVar37) {
                  fVar37 = 0.15;
                }
LAB_1403838ec:
                fVar34 = fVar34 * (1.0 - fVar37);
                *pfVar22 = fVar34;
              }
              if (fVar41 < *(float *)(lVar27 + 0x2c)) {
                fVar37 = *(float *)(lVar27 + 0x2c) - fVar41;
                if (0.4 <= fVar37) {
                  fVar37 = 0.4;
                }
                fVar34 = fVar34 * (1.0 - fVar37);
                *pfVar22 = fVar34;
              }
              if (*(float *)(lVar27 + 0x30) < fVar39 / fVar41) {
                fVar37 = (fVar39 / fVar41 - *(float *)(lVar27 + 0x30)) / 1.5;
                if (0.4 <= fVar37) {
                  fVar37 = 0.4;
                }
                fVar34 = fVar34 * (1.0 - fVar37);
                *pfVar22 = fVar34;
              }
              if ((-1 < (char)uVar26) && (0.0 < fVar40)) {
                fVar37 = (fVar40 * 16.0) / local_cc8;
                if (0.2 <= fVar37) {
                  fVar37 = 0.2;
                }
                *pfVar22 = (1.0 - fVar37) * fVar34;
              }
            }
          }
          plVar31 = plVar31 + 1;
          pfVar22 = pfVar22 + 1;
          lVar32 = lVar32 + -1;
        } while (lVar32 != 0);
        local_958 = local_958 + (float)local_954 + local_954._4_4_;
        local_94c = local_94c + local_948;
        local_948 = 0.0;
        local_968[3] = local_968[3] * 0.6 + local_968[3];
        local_954 = lVar32;
        FUN_140381ef0(param_1 + 8,local_968,local_768);
        uVar2 = *(ushort *)(param_1 + 8);
        if ((((ushort)(uVar2 - 1) < 0x7f) && ((&DAT_154f06370)[uVar2] != 0)) &&
           ((*(byte *)((&DAT_154f06370)[uVar2] + 0x28) & 8) != 0)) {
          piVar25 = param_1 + 10;
          uVar28 = 1;
          do {
            if ((ushort)((short)*piVar25 - 1U) < 2) {
              if ((float)param_1[uVar28 * 2 + 9] <= (float)param_1[9] - 0.1) {
                return;
              }
              param_1[uVar28 * 2 + 9] = (int)((float)param_1[uVar28 * 2 + 9] + 0.1);
              uVar4 = *(undefined8 *)(param_1 + 8);
              *(undefined8 *)(param_1 + 8) = *(undefined8 *)(param_1 + uVar28 * 2 + 8);
              *(undefined8 *)(param_1 + uVar28 * 2 + 8) = uVar4;
              return;
            }
            uVar26 = (int)uVar28 + 1;
            uVar28 = (ulonglong)uVar26;
            piVar25 = piVar25 + 2;
          } while (uVar26 < 8);
        }
        else if (((((ushort)(uVar2 - 1) < 2) && ((ushort)(*(ushort *)(param_1 + 10) - 1) < 0x7f)) &&
                 ((&DAT_154f06370)[*(ushort *)(param_1 + 10)] != 0)) &&
                (((*(byte *)((&DAT_154f06370)[*(ushort *)(param_1 + 10)] + 0x28) & 8) != 0 &&
                 (fVar30 = (float)param_1[9], param_1[9] = (int)(fVar30 - 0.1),
                 fVar30 - 0.1 < (float)param_1[0xb])))) {
          uVar4 = *(undefined8 *)(param_1 + 8);
          *(undefined8 *)(param_1 + 8) = *(undefined8 *)(param_1 + 10);
          *(undefined8 *)(param_1 + 10) = uVar4;
        }
      }
    }
  }
  return;
}

