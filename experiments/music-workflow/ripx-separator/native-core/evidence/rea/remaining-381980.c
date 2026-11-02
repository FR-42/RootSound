
/* WARNING: Function: _alloca_probe replaced with injection: alloca_probe */
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

float FUN_140381980(int *param_1,int param_2)

{
  uint uVar1;
  int iVar2;
  double dVar3;
  double dVar4;
  bool bVar5;
  bool bVar6;
  bool bVar7;
  int iVar8;
  int iVar9;
  ulonglong uVar10;
  float *pfVar11;
  uint uVar12;
  char cVar13;
  ulonglong uVar14;
  int iVar15;
  int iVar16;
  bool bVar17;
  float fVar18;
  float fVar19;
  float fVar20;
  float fVar21;
  float fVar22;
  float fVar23;
  undefined1 auStack_4138 [32];
  undefined4 local_4118;
  undefined8 local_4110;
  char local_4108;
  int local_4104;
  int local_4100;
  ulonglong local_40f8;
  undefined8 local_40e8;
  undefined8 uStack_40e0;
  undefined8 local_40d8 [2];
  undefined4 local_40c8 [4088];
  ulonglong local_e8;
  
  local_e8 = DAT_140972168 ^ (ulonglong)auStack_4138;
  if ((param_2 < 0) && (param_2 = DAT_14098a1b0, DAT_14098a1b0 < 0)) {
    fVar18 = 0.0;
  }
  else {
    uVar14 = 0;
    bVar5 = false;
    uVar12 = 0;
    cVar13 = '\0';
    iVar15 = 0;
    bVar6 = false;
    iVar16 = *param_1;
    iVar9 = param_1[1];
    fVar22 = 0.0;
    fVar18 = 0.0;
    dVar4 = 0.0;
    local_40f8 = 0;
    local_4108 = '\0';
    if (iVar16 < iVar9) {
      local_4104 = iVar16 + -1;
      fVar19 = 0.0;
      local_4100 = param_2;
      do {
        iVar2 = *param_1;
        bVar17 = false;
        fVar23 = fVar19;
        if (iVar2 < iVar9) {
          iVar8 = iVar2;
          if (-1 < (short)param_1[0x87]) {
            iVar8 = iVar16;
            if (iVar16 < iVar2) {
              iVar8 = iVar2;
            }
            if (iVar9 <= iVar8) {
              iVar8 = iVar9 + -1;
            }
          }
          fVar21 = *(float *)(*(longlong *)(param_1 + 2) + (ulonglong)(uint)(iVar8 - iVar2) * 4);
          if (fVar21 != 0.0) {
            if (fVar22 == 0.0) {
              bVar6 = false;
              local_40f8 = local_40f8 & 0xffffffff00000000;
              bVar5 = false;
              uVar12 = 0;
              dVar4 = 0.0;
              fVar23 = 0.0;
              iVar9 = 0;
            }
            else {
              fVar20 = (float)(dVar4 / (double)(uVar14 & 0xffffffff));
              iVar9 = iVar15;
              if ((fVar21 < fVar20 - fVar20 / 5.7723846) || (fVar20 / 5.7723846 + fVar20 < fVar21))
              {
                cVar13 = '\0';
                bVar17 = true;
                local_4108 = '\0';
              }
              else if (bVar5) {
                if (fVar21 < fVar22) {
                  bVar6 = true;
                }
                bVar7 = false;
                if (fVar21 < fVar22) {
LAB_140381bdc:
                  bVar5 = bVar7;
                  fVar23 = fVar21;
                  iVar9 = local_4104;
                  if (iVar15 != 0) {
                    dVar3 = (double)FUN_14036d280((iVar16 - iVar15) + -1,local_4100);
                    iVar9 = local_4104;
                    if ((0.2 < (float)dVar3) ||
                       ((fVar19 - fVar19 / 173.17154 < fVar22 &&
                        (fVar22 < fVar19 / 173.17154 + fVar19)))) {
                      cVar13 = '\0';
                      bVar17 = true;
                      local_4108 = '\0';
                    }
                    else {
                      if (uVar12 < 0x400) {
                        uVar14 = (ulonglong)uVar12;
                        uVar12 = uVar12 + 1;
                        *(int *)(&local_40e8 + uVar14 * 2) = iVar15;
                        *(int *)((longlong)&local_40e8 + uVar14 * 0x10 + 4) = local_4104;
                        *(float *)(local_40d8 + uVar14 * 2 + -1) = fVar19;
                        *(float *)((longlong)local_40d8 + uVar14 * 0x10 + -4) = fVar22;
                        if (0x3ff < uVar12) goto LAB_140381c6a;
                      }
                      else {
LAB_140381c6a:
                        cVar13 = '\x01';
                        local_4108 = '\x01';
                      }
                      bVar17 = 0x3ff < uVar12;
                      local_40f8 = local_40f8 & 0xffffffff00000000;
                      dVar4 = 0.0;
                    }
                  }
                }
              }
              else if (bVar6) {
                if (fVar22 < fVar21) {
                  bVar6 = false;
                  bVar7 = true;
                  goto LAB_140381bdc;
                }
              }
              else {
                bVar5 = fVar22 < fVar21;
                if (fVar21 < fVar22) {
                  bVar6 = true;
                }
              }
            }
            local_4110 = 0;
            local_4118 = 0;
            fVar22 = (float)FUN_14036a7f0(param_1,iVar16,0xffffffff);
            if (fVar22 <= 1.0) {
              fVar22 = 1.0;
            }
            uVar14 = (ulonglong)((float)(local_40f8 & 0xffffffff) + fVar22);
            dVar4 = dVar4 + (double)(fVar22 * fVar21);
            fVar22 = fVar21;
            iVar15 = iVar9;
            local_40f8 = uVar14;
            if (bVar17) {
              if (uVar12 < 3) {
                fVar22 = 0.0;
                uVar12 = 0;
              }
              else {
                if (uVar12 != 0) {
                  pfVar11 = (float *)&uStack_40e0;
                  uVar14 = (ulonglong)uVar12;
                  do {
                    dVar3 = log10(((double)pfVar11[1] * 32.0) / 440.0);
                    fVar21 = (float)((dVar3 * 12.0) / 0.3010299956639812 + 9.0);
                    dVar3 = log10(((double)*pfVar11 * 32.0) / 440.0);
                    fVar19 = (float)((dVar3 * 12.0) / 0.3010299956639812 + 9.0);
                    if (fVar19 <= fVar21) {
                      fVar19 = fVar21 - fVar19;
                    }
                    else {
                      fVar19 = fVar19 - fVar21;
                    }
                    pfVar11 = pfVar11 + 4;
                    if (fVar18 <= fVar19 * 0.5) {
                      fVar18 = fVar19 * 0.5;
                    }
                    uVar14 = uVar14 - 1;
                    cVar13 = local_4108;
                  } while (uVar14 != 0);
                }
                uVar14 = local_40f8;
                if (cVar13 == '\0') {
                  uVar12 = 0;
                  fVar22 = 0.0;
                }
                else {
                  uVar1 = uVar12 - 2;
                  local_40e8 = (&local_40e8)[(ulonglong)(uVar12 - 3) * 2];
                  uStack_40e0 = local_40d8[(ulonglong)(uVar12 - 3) * 2 + -1];
                  uVar10 = (ulonglong)(uVar12 - 1);
                  uVar12 = 3;
                  local_40d8[0] = (&local_40e8)[(ulonglong)uVar1 * 2];
                  local_40d8[1] = local_40d8[(ulonglong)uVar1 * 2 + -1];
                  local_40c8[0] = *(undefined4 *)(&local_40e8 + uVar10 * 2);
                  local_40c8[1] = *(undefined4 *)((longlong)&local_40e8 + uVar10 * 0x10 + 4);
                  local_40c8[2] = *(undefined4 *)(local_40d8 + uVar10 * 2 + -1);
                  local_40c8[3] = *(undefined4 *)((longlong)local_40d8 + uVar10 * 0x10 + -4);
                }
              }
            }
          }
        }
        local_4104 = local_4104 + 1;
        iVar16 = iVar16 + 1;
        iVar9 = param_1[1];
        fVar19 = fVar23;
      } while (iVar16 < iVar9);
    }
  }
  return fVar18;
}

