
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

undefined8
FUN_14032c560(longlong param_1,longlong param_2,int param_3,undefined8 *param_4,undefined8 param_5,
             undefined8 param_6,int *param_7)

{
  longlong lVar1;
  float fVar2;
  float fVar3;
  longlong lVar4;
  double dVar5;
  double dVar6;
  double dVar7;
  double dVar8;
  undefined8 uVar9;
  undefined8 uVar10;
  undefined8 uVar11;
  undefined8 uVar12;
  float *pfVar13;
  int iVar14;
  uint uVar15;
  uint uVar16;
  int iVar17;
  double *pdVar18;
  float *pfVar19;
  uint uVar20;
  double *pdVar21;
  undefined8 *puVar22;
  longlong lVar23;
  longlong lVar24;
  undefined8 *puVar25;
  ulonglong uVar26;
  uint uVar27;
  int iVar28;
  float fVar29;
  float fVar30;
  float fVar31;
  undefined1 auStack_7a8 [32];
  float local_788;
  float local_780;
  float local_778;
  uint local_770;
  undefined4 local_768;
  undefined1 local_758;
  int local_754;
  int local_750;
  int local_74c;
  longlong local_748;
  longlong local_740;
  ulonglong local_738;
  undefined8 local_728;
  double dStack_720;
  undefined8 local_718;
  double adStack_710 [64];
  int local_510;
  undefined8 local_50c;
  undefined4 local_504;
  undefined4 local_500;
  undefined1 local_4fc;
  undefined2 local_4fb;
  undefined1 local_4f9;
  float local_4f8 [2];
  double dStack_4f0;
  float local_4e8;
  undefined2 uStack_4e4;
  double local_2c8 [64];
  ulonglong local_c8;
  
  local_c8 = DAT_140972168 ^ (ulonglong)auStack_7a8;
  local_754 = param_3;
  local_748 = param_1;
  memset(param_4,0,0x230);
  iVar28 = DAT_14098a058;
  iVar17 = *param_7;
  local_738 = (ulonglong)((param_3 - *(int *)(param_2 + 0xc)) * DAT_14098a054);
  lVar4 = *(longlong *)(param_2 + 0x490);
  iVar14 = iVar17 + 1;
  *param_7 = iVar14;
  if (iVar14 < iVar28) {
    local_740 = (longlong)*(int *)(*(longlong *)(param_2 + 0x538) + 4 + (longlong)iVar17 * 4);
    lVar1 = local_740 + local_738;
    fVar2 = *(float *)(lVar4 + 4 + lVar1 * 0x10);
    if (((fVar2 != 0.0) && (fVar3 = *(float *)(lVar4 + lVar1 * 0x10), fVar3 != 0.0)) &&
       (1.0 <= ((double)fVar3 / ((double)DAT_14098a054 + (double)DAT_14098a054)) / 0.7071067812)) {
      local_758 = FUN_1403459a0(*(undefined2 *)(lVar4 + 8 + lVar1 * 0x10));
      memset(local_4f8,0,0x230);
      fVar3 = DAT_1549b10a4;
      fVar29 = fVar2 / 17.317154;
      if (41.0 <= fVar29) {
        fVar29 = 41.0;
      }
      uVar15 = (uint)(longlong)(fVar29 / 7.0);
      uVar27 = 1;
      if (1 < uVar15) {
        uVar27 = uVar15;
      }
      fVar29 = fVar2 - (float)uVar27 * 7.0;
      if (fVar29 <= DAT_1549b10a4) {
        fVar29 = DAT_1549b10a4;
      }
      fVar31 = fVar29 / 17732.766;
      if (fVar31 <= 0.0) {
        fVar31 = 0.0;
      }
      memset(local_2c8,0,0x200);
      if (fVar29 == 0.0) {
        iVar17 = *(int *)(param_1 + 0x28);
        uVar26 = 0;
      }
      else {
        fVar30 = (float)DAT_14098a154;
        uVar15 = (uint)(longlong)(fVar30 * 0.035 + 0.5001);
        uVar20 = (uint)(longlong)((fVar30 * 40.0) / fVar29 + 0.5001);
        if (uVar15 <= uVar20) {
          uVar15 = uVar20;
        }
        if (*(char *)(param_1 + 0x91) == '\0') {
          fVar29 = 1.0;
        }
        else {
          fVar29 = 2.0;
        }
        iVar17 = *(int *)(param_1 + 0x28);
        uVar20 = (iVar17 * 2 + 1) * DAT_14098a1a8;
        uVar16 = (uint)(longlong)(fVar30 * fVar29 * 0.15 + 0.5001);
        if (uVar16 <= uVar20) {
          uVar20 = uVar16;
        }
        uVar26 = (ulonglong)uVar15;
        if (uVar20 < uVar15) {
          uVar26 = (ulonglong)uVar20;
        }
      }
      local_750 = (DAT_14098a1a8 / 2 - (int)uVar26 / 2) + local_754 * DAT_14098a1a8;
      if (local_750 < 1) {
        local_750 = 0;
      }
      iVar28 = (int)uVar26 + local_750;
      local_74c = (*(int *)(local_748 + 0x24) + iVar17 * 2) * DAT_14098a1a8;
      local_2c8[local_754 - local_750 / DAT_14098a1a8] = (double)fVar2;
      local_728 = 0;
      dStack_720 = 0.0;
      local_718 = 0;
      local_50c = 0;
      local_504 = 0;
      local_4fb = 0;
      local_4f9 = 0;
      local_500 = FUN_14031b7a0(local_748,(longlong)local_750 % (longlong)DAT_14098a1a8 & 0xffffffff
                                ,CONCAT71((int7)(uVar26 >> 8),1));
      lVar24 = 4;
      lVar23 = 4;
      pdVar18 = adStack_710;
      pdVar21 = local_2c8;
      do {
        dVar5 = pdVar21[1];
        dVar6 = pdVar21[2];
        dVar7 = pdVar21[3];
        *pdVar18 = *pdVar21;
        pdVar18[1] = dVar5;
        dVar5 = pdVar21[4];
        dVar8 = pdVar21[5];
        pdVar18[2] = dVar6;
        pdVar18[3] = dVar7;
        dVar6 = pdVar21[6];
        dVar7 = pdVar21[7];
        pdVar18[4] = dVar5;
        pdVar18[5] = dVar8;
        dVar5 = pdVar21[8];
        dVar8 = pdVar21[9];
        pdVar18[6] = dVar6;
        pdVar18[7] = dVar7;
        dVar6 = pdVar21[10];
        dVar7 = pdVar21[0xb];
        pdVar18[8] = dVar5;
        pdVar18[9] = dVar8;
        dVar5 = pdVar21[0xc];
        dVar8 = pdVar21[0xd];
        pdVar18[10] = dVar6;
        pdVar18[0xb] = dVar7;
        dVar6 = pdVar21[0xe];
        dVar7 = pdVar21[0xf];
        pdVar18[0xc] = dVar5;
        pdVar18[0xd] = dVar8;
        pdVar18[0xe] = dVar6;
        pdVar18[0xf] = dVar7;
        lVar23 = lVar23 + -1;
        pdVar18 = pdVar18 + 0x10;
        pdVar21 = pdVar21 + 0x10;
      } while (lVar23 != 0);
      if (local_74c <= iVar28) {
        iVar28 = local_74c;
      }
      local_510 = local_750;
      local_50c = CONCAT44(local_50c._4_4_,iVar28);
      local_4fc = local_758;
      local_788 = fVar2 - 7.0;
      if (fVar2 - 7.0 <= fVar3) {
        local_788 = fVar3;
      }
      local_780 = fVar2 + 7.0;
      if (DAT_1549b10a8 <= fVar2 + 7.0) {
        local_780 = DAT_1549b10a8;
      }
      local_768 = 0;
      *(undefined8 *)(param_2 + 0x3e4) = 0;
      *(undefined8 *)(param_2 + 0x3ec) = 0;
      *(undefined8 *)(param_2 + 0x3f4) = 0;
      *(undefined8 *)(param_2 + 0x3fc) = 0;
      *(undefined8 *)(param_2 + 0x404) = 0;
      *(undefined8 *)(param_2 + 0x40c) = 0;
      *(undefined4 *)(param_2 + 0x414) = 0;
      *(undefined2 *)(param_2 + 0x418) = 0;
      *(int *)(param_2 + 0x488) = local_750;
      *(int *)(param_2 + 0x48c) = iVar28;
      local_778 = fVar31 + fVar31;
      local_770 = uVar27;
      iVar17 = FUN_14032aef0(local_748,param_2,local_754,&local_728);
      if ((iVar17 == 0) && (0.0 < dStack_720)) {
        lVar23 = 4;
        pfVar13 = local_4f8;
        puVar25 = &local_728;
        do {
          puVar22 = puVar25;
          pfVar19 = pfVar13;
          uVar9 = puVar22[1];
          uVar10 = puVar22[2];
          uVar11 = puVar22[3];
          *(undefined8 *)pfVar19 = *puVar22;
          *(undefined8 *)(pfVar19 + 2) = uVar9;
          uVar9 = puVar22[4];
          uVar12 = puVar22[5];
          *(undefined8 *)(pfVar19 + 4) = uVar10;
          *(undefined8 *)(pfVar19 + 6) = uVar11;
          uVar10 = puVar22[6];
          uVar11 = puVar22[7];
          *(undefined8 *)(pfVar19 + 8) = uVar9;
          *(undefined8 *)(pfVar19 + 10) = uVar12;
          uVar9 = puVar22[8];
          uVar12 = puVar22[9];
          *(undefined8 *)(pfVar19 + 0xc) = uVar10;
          *(undefined8 *)(pfVar19 + 0xe) = uVar11;
          uVar10 = puVar22[10];
          uVar11 = puVar22[0xb];
          *(undefined8 *)(pfVar19 + 0x10) = uVar9;
          *(undefined8 *)(pfVar19 + 0x12) = uVar12;
          uVar9 = puVar22[0xc];
          uVar12 = puVar22[0xd];
          *(undefined8 *)(pfVar19 + 0x14) = uVar10;
          *(undefined8 *)(pfVar19 + 0x16) = uVar11;
          uVar10 = puVar22[0xe];
          uVar11 = puVar22[0xf];
          *(undefined8 *)(pfVar19 + 0x18) = uVar9;
          *(undefined8 *)(pfVar19 + 0x1a) = uVar12;
          *(undefined8 *)(pfVar19 + 0x1c) = uVar10;
          *(undefined8 *)(pfVar19 + 0x1e) = uVar11;
          lVar23 = lVar23 + -1;
          pfVar13 = pfVar19 + 0x20;
          puVar25 = puVar22 + 0x10;
        } while (lVar23 != 0);
        uVar9 = puVar22[0x11];
        uVar10 = puVar22[0x12];
        uVar11 = puVar22[0x13];
        *(undefined8 *)(pfVar19 + 0x20) = puVar22[0x10];
        *(undefined8 *)(pfVar19 + 0x22) = uVar9;
        uVar9 = puVar22[0x14];
        uVar12 = puVar22[0x15];
        *(undefined8 *)(pfVar19 + 0x24) = uVar10;
        *(undefined8 *)(pfVar19 + 0x26) = uVar11;
        *(undefined8 *)(pfVar19 + 0x28) = uVar9;
        *(undefined8 *)(pfVar19 + 0x2a) = uVar12;
      }
      *(undefined4 *)(lVar4 + lVar1 * 0x10) = 0;
      dStack_4f0 = (double)*(float *)((local_740 + local_738) * 0x10 + 4 + lVar4);
      if ((local_4f8[0] == 0.0) || (local_4e8 < 1.0)) {
        memset(param_4,0,0x230);
      }
      else {
        local_4e8 = (float)FUN_140346e90();
        uStack_4e4 = 0;
        pfVar13 = local_4f8;
        do {
          puVar25 = param_4;
          pfVar19 = pfVar13;
          uVar9 = *(undefined8 *)(pfVar19 + 2);
          uVar10 = *(undefined8 *)(pfVar19 + 4);
          uVar11 = *(undefined8 *)(pfVar19 + 6);
          *puVar25 = *(undefined8 *)pfVar19;
          puVar25[1] = uVar9;
          uVar9 = *(undefined8 *)(pfVar19 + 8);
          uVar12 = *(undefined8 *)(pfVar19 + 10);
          puVar25[2] = uVar10;
          puVar25[3] = uVar11;
          uVar10 = *(undefined8 *)(pfVar19 + 0xc);
          uVar11 = *(undefined8 *)(pfVar19 + 0xe);
          puVar25[4] = uVar9;
          puVar25[5] = uVar12;
          uVar9 = *(undefined8 *)(pfVar19 + 0x10);
          uVar12 = *(undefined8 *)(pfVar19 + 0x12);
          puVar25[6] = uVar10;
          puVar25[7] = uVar11;
          uVar10 = *(undefined8 *)(pfVar19 + 0x14);
          uVar11 = *(undefined8 *)(pfVar19 + 0x16);
          puVar25[8] = uVar9;
          puVar25[9] = uVar12;
          uVar9 = *(undefined8 *)(pfVar19 + 0x18);
          uVar12 = *(undefined8 *)(pfVar19 + 0x1a);
          puVar25[10] = uVar10;
          puVar25[0xb] = uVar11;
          uVar10 = *(undefined8 *)(pfVar19 + 0x1c);
          uVar11 = *(undefined8 *)(pfVar19 + 0x1e);
          puVar25[0xc] = uVar9;
          puVar25[0xd] = uVar12;
          puVar25[0xe] = uVar10;
          puVar25[0xf] = uVar11;
          lVar24 = lVar24 + -1;
          pfVar13 = pfVar19 + 0x20;
          param_4 = puVar25 + 0x10;
        } while (lVar24 != 0);
        uVar9 = *(undefined8 *)(pfVar19 + 0x22);
        uVar10 = *(undefined8 *)(pfVar19 + 0x24);
        uVar11 = *(undefined8 *)(pfVar19 + 0x26);
        puVar25[0x10] = *(undefined8 *)(pfVar19 + 0x20);
        puVar25[0x11] = uVar9;
        uVar9 = *(undefined8 *)(pfVar19 + 0x28);
        uVar12 = *(undefined8 *)(pfVar19 + 0x2a);
        puVar25[0x12] = uVar10;
        puVar25[0x13] = uVar11;
        puVar25[0x14] = uVar9;
        puVar25[0x15] = uVar12;
      }
      return 1;
    }
  }
  return 0;
}

