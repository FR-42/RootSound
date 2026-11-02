
/* WARNING: Function: _alloca_probe replaced with injection: alloca_probe */
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

int FUN_140347170(longlong param_1,longlong param_2,int param_3,byte param_4,undefined8 param_5,
                 undefined2 param_6,undefined8 param_7,undefined8 param_8)

{
  longlong lVar1;
  short sVar2;
  short sVar3;
  short sVar4;
  ushort uVar5;
  int iVar6;
  uint uVar7;
  longlong lVar8;
  int iVar9;
  int iVar10;
  longlong lVar11;
  ulonglong uVar12;
  float *_Dst;
  uint uVar13;
  ushort uVar14;
  longlong lVar15;
  undefined1 *puVar16;
  ulonglong uVar17;
  float fVar18;
  float fVar19;
  float fVar20;
  float _X;
  float fVar21;
  float fVar22;
  undefined1 auStack_2498 [32];
  undefined8 local_2478;
  undefined1 *local_2470;
  undefined8 local_2468;
  ulonglong local_2460;
  byte local_2458;
  char local_2448;
  byte local_2447;
  float local_2440 [2];
  int local_2438;
  int local_2434;
  uint local_2430;
  int local_242c;
  int local_2428;
  longlong local_2420;
  longlong local_2418;
  longlong local_2410;
  longlong local_2408;
  undefined8 local_2400;
  undefined8 local_23f8;
  undefined8 local_23f0;
  undefined1 local_23e8 [4];
  float local_23e4;
  float local_23d8;
  float local_21b4;
  float local_21a8;
  float local_1f84;
  float local_1f78;
  ulonglong local_e8;
  
  local_e8 = DAT_140972168 ^ (ulonglong)auStack_2498;
  local_23f0 = param_5;
  local_23f8 = param_7;
  local_2400 = param_8;
  if (*(char *)(param_1 + 0x92) == '\0') {
    fVar21 = 0.0;
    fVar22 = 0.0;
  }
  else {
    fVar21 = 24000.0;
    fVar22 = DAT_1549b10a4;
  }
  if ((param_4 == 0) || (fVar21 != 0.0)) {
    local_2418 = *(longlong *)(param_2 + 0x598);
    lVar1 = *(longlong *)(param_2 + 0x5a0);
    iVar9 = 0;
    *(undefined4 *)(param_2 + 0x5b8) = 0;
    if ((DAT_140939680 == '\0') ||
       ((*(char *)(param_1 + 0x92) == '\0' && (*(short *)(param_1 + 0x14) != 0)))) {
      local_2448 = '\0';
    }
    else {
      iVar9 = *(int *)(param_1 + 0xbc);
      local_2448 = '\x01';
    }
    iVar9 = *(int *)(param_2 + 0x10) + iVar9;
    local_2428 = *(int *)(param_2 + 0xc);
    local_2434 = iVar9 + -1;
    if (*(float *)(param_1 + 0x10) != 0.0) {
      iVar6 = (int)(*(float *)(param_1 + 0x10) * DAT_14098a1ac + 0.5);
      iVar10 = 1;
      if (1 < iVar6) {
        iVar10 = iVar6;
      }
      iVar9 = (*(int *)(param_2 + 0x14) - local_2428) + iVar9;
      if (iVar10 < iVar9) {
        local_2434 = local_2434 + (iVar10 - iVar9);
      }
      if (local_2434 < param_3) {
        return local_2428;
      }
    }
    local_2447 = param_4;
    local_2438 = param_3;
    local_242c = param_3;
    local_2420 = param_2;
    local_2410 = param_1;
    iVar9 = local_2434;
    if (param_3 <= local_2434) {
      do {
        uVar12 = 0;
        iVar10 = DAT_140989fe4 + (param_3 - *(int *)(param_2 + 0xc));
        lVar15 = (longlong)iVar10;
        uVar14 = 0;
        *(undefined2 *)(lVar1 + lVar15 * 2) = 0;
        local_2408 = (ulonglong)(uint)(iVar10 * 0x1d0) * 0xf8 + local_2418;
        iVar10 = (int)(((double)DAT_14098a1a8 + (double)DAT_14098a1a8) * 1.0833333333333333);
        uVar7 = DAT_14098a1a8;
        if ((int)DAT_14098a1a8 < 0) {
          uVar7 = DAT_14098a1a8 + 1;
        }
        uVar7 = (DAT_14098a1a8 * param_3 - iVar10 / 2) + ((int)uVar7 >> 1);
        uVar17 = (ulonglong)uVar7;
        if ((int)uVar7 < 1) {
          uVar17 = uVar12;
        }
        iVar10 = iVar10 + (int)uVar17;
        iVar6 = (*(int *)(param_1 + 0x24) + *(int *)(param_1 + 0x28) * 2) * DAT_14098a1a8;
        if (iVar6 <= iVar10) {
          iVar10 = iVar6;
        }
        local_2438 = param_3;
        FUN_14031e620(param_2,uVar17,iVar10);
        local_2430 = 0;
        if (DAT_140989f20 != '\0') {
          puVar16 = &DAT_140989f20;
          uVar17 = uVar12;
          do {
            uVar13 = 1;
            uVar7 = (uint)(longlong)*(float *)((longlong)&DAT_140989f2c + uVar17);
            if (uVar7 <= *(uint *)(param_2 + 0x5b8)) {
              uVar7 = *(uint *)(param_2 + 0x5b8);
            }
            *(uint *)(param_2 + 0x5b8) = uVar7;
            uVar7 = (uint)uVar12;
            if ((int)(longlong)*(float *)((longlong)&DAT_140989f2c + uVar17) != 0) {
              do {
                fVar18 = (float)FUN_1403198c0(*puVar16);
                param_2 = local_2420;
                uVar7 = local_2430;
                if (0x1cf < uVar14) break;
                _Dst = (float *)((ulonglong)uVar14 * 0xf8 + local_2408);
                memset(_Dst,0,0xf8);
                *_Dst = fVar18;
                *(undefined1 *)(_Dst + 0x34) = 0x7e;
                if ((local_2447 == 0) || ((fVar22 < fVar18 && (fVar18 < fVar21)))) {
                  local_2460 = CONCAT71(local_2460._1_7_,local_2448) ^ 1;
                  local_2470 = local_23e8;
                  local_2468 = CONCAT71(local_2468._1_7_,1);
                  local_2478 = CONCAT44(local_2478._4_4_,fVar18);
                  FUN_140346ed0(local_2410,local_2420,local_2438,0);
                  _X = local_1f84;
                  fVar20 = local_21b4;
                  fVar19 = local_23e4;
                  if (DAT_1409399a8 < 3) {
                    *(undefined2 *)((longlong)_Dst + 0xce) = 0;
                    _Dst[2] = local_23d8 + _Dst[2];
                    local_2440[0] = local_23e4;
                    sVar2 = _fdtest(local_2440);
                    fVar20 = fVar19;
                    if (0 < sVar2) {
                      fVar20 = 0.0;
                    }
                    local_2440[0] = fVar19;
                    sVar2 = _fdtest(local_2440);
                    if (0 < sVar2) {
                      fVar19 = 0.0;
                    }
                    fVar20 = fmodf(fVar20,6.2831855);
                    if (fVar20 < 0.0) {
                      fVar20 = fVar20 + 6.2831855;
                    }
                    fVar19 = fmodf(fVar19,6.2831855);
                    if (fVar19 < 0.0) {
                      fVar19 = fVar19 + 6.2831855;
                    }
                    lVar8 = (longlong)(fVar19 * 10000.0 + 0.5);
                    lVar11 = (longlong)(fVar20 * 10000.0 + 0.5);
                    sVar2 = (short)lVar8;
                    sVar3 = sVar2 + 0xa90;
                    if ((uint)lVar8 < 0xf570) {
                      sVar3 = sVar2;
                    }
                    sVar2 = (short)lVar11;
                    sVar4 = sVar2 + 0xa90;
                    if ((uint)lVar11 < 0xf570) {
                      sVar4 = sVar2;
                    }
                    _Dst[1] = (float)CONCAT22(sVar3,sVar4);
                    _Dst[5] = local_23d8;
                    _Dst[6] = local_23d8;
                    _Dst[3] = local_23e4;
                    fVar19 = local_23e4;
                  }
                  else {
                    if ((0.0 < local_1f78) || (0.0 < local_21a8)) {
                      fVar19 = (local_1f78 / (local_1f78 + local_21a8)) * 65534.0 - 32767.0;
                      if (fVar19 < 0.0) {
                        fVar19 = fVar19 - 0.5001;
                      }
                      else {
                        fVar19 = fVar19 + 0.5001;
                      }
                    }
                    else {
                      fVar19 = 0.5001;
                    }
                    if (32767.0 <= fVar19) {
                      fVar19 = 32767.0;
                    }
                    else if (fVar19 <= -32767.0) {
                      fVar19 = -32767.0;
                    }
                    *(short *)((longlong)_Dst + 0xce) = (short)(int)fVar19;
                    _Dst[2] = (local_1f78 + local_21a8) * 0.5 + _Dst[2];
                    local_2440[0] = local_21b4;
                    sVar2 = _fdtest(local_2440);
                    if (0 < sVar2) {
                      fVar20 = 0.0;
                    }
                    local_2440[0] = _X;
                    sVar2 = _fdtest(local_2440);
                    if (0 < sVar2) {
                      _X = 0.0;
                    }
                    fVar19 = fmodf(fVar20,6.2831855);
                    if (fVar19 < 0.0) {
                      fVar19 = fVar19 + 6.2831855;
                    }
                    fVar20 = fmodf(_X,6.2831855);
                    if (fVar20 < 0.0) {
                      fVar20 = fVar20 + 6.2831855;
                    }
                    lVar8 = (longlong)(fVar20 * 10000.0 + 0.5);
                    lVar11 = (longlong)(fVar19 * 10000.0 + 0.5);
                    sVar2 = (short)lVar8;
                    sVar3 = sVar2 + 0xa90;
                    if ((uint)lVar8 < 0xf570) {
                      sVar3 = sVar2;
                    }
                    sVar2 = (short)lVar11;
                    sVar4 = sVar2 + 0xa90;
                    if ((uint)lVar11 < 0xf570) {
                      sVar4 = sVar2;
                    }
                    _Dst[1] = (float)CONCAT22(sVar3,sVar4);
                    _Dst[5] = local_21a8;
                    _Dst[6] = local_1f78;
                    _Dst[3] = local_21b4;
                    fVar19 = local_1f84;
                  }
                  _Dst[4] = fVar19;
                  _Dst[7] = fVar18;
                  *(undefined1 *)(_Dst + 0x33) = 1;
                }
                uVar14 = uVar14 + 1;
                uVar5 = uVar14;
                if (uVar14 <= *(ushort *)(lVar1 + lVar15 * 2)) {
                  uVar5 = *(ushort *)(lVar1 + lVar15 * 2);
                }
                uVar13 = uVar13 + 1;
                *(ushort *)(lVar1 + lVar15 * 2) = uVar5;
                param_2 = local_2420;
                uVar7 = local_2430;
              } while (uVar13 <= (uint)(longlong)*(float *)((longlong)&DAT_140989f2c + uVar17));
            }
            local_2430 = uVar7 + 1;
            uVar12 = (ulonglong)local_2430;
            uVar17 = (ulonglong)local_2430 * 0x10;
            puVar16 = &DAT_140989f20 + uVar17;
            param_1 = local_2410;
            iVar9 = local_2434;
          } while ((&DAT_140989f20)[uVar17] != '\0');
        }
        param_3 = local_2438 + 1;
        local_2438 = param_3;
      } while (param_3 <= iVar9);
    }
    iVar10 = local_2428;
    if (local_2448 != '\0') {
      for (; iVar10 < local_242c; iVar10 = iVar10 + 1) {
        uVar14 = 0;
        iVar9 = DAT_140989fe4 + (iVar10 - *(int *)(param_2 + 0xc));
        lVar15 = (ulonglong)(uint)(iVar9 * 0x1d0) * 0xf8 + local_2418;
        if (*(short *)(lVar1 + (longlong)iVar9 * 2) != 0) {
          do {
            lVar8 = (ulonglong)uVar14 * 0xf8;
            fVar22 = *(float *)(lVar8 + 8 + lVar15);
            if (DAT_1409399a8 < 3) {
              *(float *)(lVar8 + 0x14 + lVar15) = fVar22;
            }
            else {
              fVar21 = (float)(int)*(short *)(lVar8 + 0xce + lVar15) + 32767.0;
              fVar21 = (fVar21 + fVar21) / 65534.0;
              *(float *)(lVar8 + 0x14 + lVar15) = (2.0 - fVar21) * fVar22;
              fVar22 = fVar21 * fVar22;
            }
            *(float *)(lVar15 + 0x18 + lVar8) = fVar22;
            for (uVar7 = 1; uVar7 < 8; uVar7 = uVar7 + 1) {
              uVar12 = (ulonglong)uVar7;
              *(undefined8 *)(lVar8 + uVar12 * 0x18 + 0x14 + lVar15) = 0;
              *(undefined1 *)(uVar12 + lVar8 + 0xd0 + lVar15) = 0;
              *(undefined4 *)(lVar15 + 0xd8 + ((ulonglong)uVar14 * 0x3e + uVar12) * 4) = 0;
            }
            *(undefined1 *)(lVar15 + 0xd0 + lVar8) = 0x7e;
            uVar14 = uVar14 + 1;
            *(undefined4 *)(lVar15 + 0xd8 + lVar8) = 0;
            *(undefined1 *)(lVar15 + 0xcc + lVar8) = 1;
          } while (uVar14 < *(ushort *)(lVar1 + (longlong)iVar9 * 2));
        }
        param_2 = local_2420;
        param_1 = local_2410;
        iVar9 = local_2434;
      }
      local_2458 = local_2447 ^ 1;
      local_2460 = local_2400;
      local_2468 = local_23f8;
      local_2470 = (undefined1 *)CONCAT62(local_2470._2_6_,param_6);
      local_2478 = local_23f0;
      FUN_140350e40(param_1,local_2420,local_2428,iVar9);
    }
    iVar9 = iVar9 + 1;
  }
  else {
    iVar9 = *(int *)(param_2 + 0xc);
  }
  return iVar9;
}

