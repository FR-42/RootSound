
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

void FUN_14037be30(float *param_1,int *param_2,uint param_3,void *param_4,longlong param_5,
                  void *param_6,char param_7,longlong *param_8,uint param_9,char param_10,
                  int param_11)

{
  float *pfVar1;
  byte bVar2;
  byte bVar3;
  byte bVar4;
  byte *pbVar5;
  byte *pbVar6;
  longlong lVar7;
  ulonglong uVar8;
  byte *pbVar9;
  ulonglong uVar10;
  byte bVar11;
  uint uVar12;
  bool bVar13;
  float fVar14;
  float fVar15;
  float fVar16;
  float fVar17;
  byte abStack_348 [88];
  undefined8 uStack_2f0;
  undefined1 auStack_2e8 [32];
  byte local_2c8;
  char local_2c7;
  uint local_2c4;
  void *local_2c0;
  float *local_2b8;
  int *local_2b0;
  void *local_2a8;
  longlong local_2a0;
  void *local_298;
  byte local_288 [388];
  undefined4 local_104;
  byte local_100;
  uint local_fc;
  byte local_f8;
  ulonglong local_e8;
  
  local_e8 = DAT_140972168 ^ (ulonglong)auStack_2e8;
  local_2a0 = param_5;
  local_298 = param_6;
  local_2c0 = param_6;
  if (((-1 < param_11) || (param_11 = DAT_14098a1b0, -1 < DAT_14098a1b0)) &&
     (param_11 < DAT_1549b0dd0)) {
    local_2c7 = 0;
    bVar13 = param_8 == (longlong *)0x0;
    local_2c4 = param_3;
    local_2b8 = param_1;
    local_2b0 = param_2;
    local_2a8 = param_4;
    if (bVar13) {
      uStack_2f0 = 0x14037bf44;
      param_8 = (longlong *)FUN_14061b650(0x40);
      *(undefined4 *)(param_8 + 2) = 0x800;
      *(undefined4 *)(param_8 + 5) = 0x4000;
      param_8[4] = (longlong)&DAT_154f0a774;
      param_8[1] = (longlong)&DAT_154f0a770;
      param_8[3] = (longlong)&DAT_154f0a780;
      *param_8 = (longlong)&DAT_154f06770;
    }
    local_2c7 = bVar13;
    if (param_6 == (void *)0x0) {
      uStack_2f0 = 0x14037bf95;
      param_6 = (void *)thunk_FUN_14061b650(0x80);
      local_2c0 = param_6;
    }
    uStack_2f0 = 0x14037bfad;
    memset(param_6,0,0x80);
    *param_2 = -1;
    fVar16 = 0.0;
    fVar17 = 0.0;
    if (*(byte *)param_1 != 0) {
      uVar8 = (ulonglong)*(byte *)param_1;
      do {
        param_1 = param_1 + 1;
        fVar17 = fVar17 + *param_1;
        uVar8 = uVar8 - 1;
      } while (uVar8 != 0);
    }
    if (param_4 != (void *)0x0) {
      uStack_2f0 = 0x14037bff4;
      memset(param_4,0,0x200);
    }
    local_2c8 = 5;
    do {
      uVar8 = 0;
      bVar11 = local_2c8;
      if (*(int *)param_8[4] != 0) {
        do {
          pbVar5 = *(byte **)(param_8[3] + uVar8 * 8);
          pbVar6 = *(byte **)(*param_8 + (ulonglong)*(uint *)(pbVar5 + 0x188) * 8);
          bVar2 = pbVar6[8];
          if ((bVar2 == bVar11) && (*(uint *)(pbVar5 + 0x188) != param_9)) {
            local_288[0] = *pbVar5;
            if (local_288[0] != 0) {
              uVar10 = (ulonglong)local_288[0];
              pbVar9 = pbVar5 + 0xc4;
              do {
                *(undefined4 *)(pbVar9 + (longlong)(abStack_348 + -(longlong)pbVar5)) =
                     *(undefined4 *)(pbVar9 + -0xc0);
                *(undefined4 *)(pbVar9 + (longlong)(local_288 + -(longlong)pbVar5)) =
                     *(undefined4 *)pbVar9;
                pbVar9 = pbVar9 + 4;
                uVar10 = uVar10 - 1;
              } while (uVar10 != 0);
            }
            local_104 = *(undefined4 *)(pbVar5 + 0x184);
            uVar12 = *(uint *)(pbVar6 + 4);
            uVar10 = (ulonglong)uVar12;
            bVar3 = *pbVar6;
            local_100 = bVar3;
            local_fc = uVar12;
            local_f8 = bVar2;
            if (((int)param_3 < 0) || (bVar11 = local_2c8, uVar12 == param_3)) {
              if (param_10 == '\0') {
                uStack_2f0 = 0x14037c13c;
                lVar7 = FUN_14037df30(uVar12,param_11);
                bVar11 = local_2c8;
                if (lVar7 == 0) goto LAB_14037c2a1;
              }
              bVar11 = local_2c8;
              if ((param_7 == '\0') || (*(byte *)(uVar10 + (longlong)param_6) <= bVar2)) {
                lVar7 = (&DAT_154f06370)[uVar10];
                bVar4 = *(byte *)(local_2b8 + 0x62);
                param_6 = local_2c0;
                param_3 = local_2c4;
                if ((*(byte *)(lVar7 + 8) <= bVar4) && (bVar4 <= *(byte *)(lVar7 + 10))) {
                  if (bVar3 < bVar4) {
                    fVar15 = (float)bVar4 - (float)bVar3;
                  }
                  else {
                    fVar15 = (float)bVar3 - (float)bVar4;
                  }
                  if (((int)param_9 < 0) || (fVar15 <= 2.5)) {
                    uStack_2f0 = 0x14037c1c2;
                    fVar15 = (float)FUN_140387c00();
                    param_6 = local_2c0;
                    bVar11 = local_2c8;
                    param_3 = local_2c4;
                    if (fVar15 != 0.0) {
                      uStack_2f0 = 0x14037c1e1;
                      fVar15 = (float)FUN_14037c3e0(local_2b8,local_288,fVar17);
                      if (*(byte *)(lVar7 + 9) < bVar4) {
                        fVar15 = fVar15 * 0.5;
                      }
                      if (param_7 == '\0') {
                        uStack_2f0 = 0x14037c204;
                        fVar14 = (float)FUN_140387c70(bVar2);
                        fVar15 = fVar15 * fVar14;
joined_r0x00014037c228:
                        if (fVar16 < fVar15) {
LAB_14037c22a:
                          *(byte *)(uVar10 + (longlong)local_2c0) = bVar2;
                          *local_2b0 = (int)uVar8;
                          fVar16 = fVar15;
                        }
                      }
                      else {
                        if (*(byte *)(uVar10 + (longlong)local_2c0) < bVar2) goto LAB_14037c22a;
                        if (bVar2 == *(byte *)(uVar10 + (longlong)local_2c0))
                        goto joined_r0x00014037c228;
                      }
                      param_6 = local_2c0;
                      bVar11 = local_2c8;
                      param_3 = local_2c4;
                      if ((((local_2a8 != (void *)0x0) && (uVar12 < 0x80)) &&
                          (pfVar1 = (float *)((longlong)local_2a8 + uVar10 * 4),
                          *pfVar1 <= fVar15 && fVar15 != *pfVar1)) &&
                         (*(float *)((longlong)local_2a8 + uVar10 * 4) = fVar15, local_2a0 != 0)) {
                        *(undefined4 *)(local_2a0 + uVar10 * 4) =
                             *(undefined4 *)(*(longlong *)(param_8[3] + uVar8 * 8) + 0x188);
                      }
                    }
                  }
                }
              }
            }
          }
LAB_14037c2a1:
          uVar12 = (int)uVar8 + 1;
          uVar8 = (ulonglong)uVar12;
        } while (uVar12 < *(uint *)param_8[4]);
      }
      if (bVar11 == 2) {
        fVar15 = 0.6;
      }
      else if (bVar11 == 3) {
        fVar15 = 0.7;
      }
      else if (bVar11 == 4) {
        fVar15 = 0.8;
      }
      else if (bVar11 == 5) {
        fVar15 = 0.9;
      }
      else {
        fVar15 = 1.0;
      }
    } while ((fVar16 < fVar15) && (local_2c8 = bVar11 - 1, local_2c8 != 0));
    if (local_298 == (void *)0x0) {
      uStack_2f0 = 0x14037c387;
      free(param_6);
    }
    if (local_2c7 != '\0') {
      uStack_2f0 = 0x14037c39b;
      free(param_8);
    }
  }
  return;
}

