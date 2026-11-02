
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

void * FUN_14034b460(longlong param_1,ushort param_2,ushort param_3,int param_4,int param_5,
                    int *param_6)

{
  undefined1 auVar1 [16];
  undefined8 uVar2;
  undefined8 uVar3;
  undefined8 uVar4;
  undefined8 uVar5;
  int iVar6;
  int iVar7;
  uint uVar8;
  size_t _Size;
  void *_Dst;
  void *pvVar9;
  undefined8 *puVar10;
  ushort uVar11;
  ushort uVar12;
  ushort *puVar14;
  short sVar15;
  int iVar16;
  float *pfVar17;
  longlong lVar18;
  float *pfVar19;
  int iVar20;
  int iVar21;
  byte bVar22;
  longlong lVar23;
  uint uVar24;
  int iVar25;
  int iVar26;
  longlong lVar27;
  uint uVar28;
  int iVar29;
  undefined1 auVar30 [12];
  float fVar31;
  float fVar32;
  float fVar33;
  undefined1 auStack_558 [32];
  int local_538;
  int local_534;
  int local_530;
  uint local_52c;
  int local_528;
  void *local_520;
  int local_518;
  uint local_514;
  longlong local_510;
  longlong local_508;
  longlong local_500;
  int *local_4f8;
  longlong local_4f0;
  ushort local_4e8 [512];
  ulonglong local_e8;
  ulonglong uVar13;
  
  local_e8 = DAT_140972168 ^ (ulonglong)auStack_558;
  local_500 = *(longlong *)(param_1 + 0x598);
  uVar8 = (uint)param_2;
  uVar28 = (uint)(ushort)(param_3 * 2 + 1) * (uint)param_2;
  local_510 = *(longlong *)(param_1 + 0x5a0);
  local_4f8 = param_6;
  local_514 = (uint)param_2;
  iVar7 = (int)((param_2 - 1) + (uint)*(ushort *)(local_510 + (longlong)DAT_140989fe4 * 2)) /
          (int)local_514;
  *param_6 = iVar7;
  auVar1 = ZEXT816(0x410) * ZEXT416((uint)((param_5 + 1 + (DAT_140989fe4 - param_4)) * iVar7));
  _Size = auVar1._0_8_;
  if (auVar1._8_8_ != 0) {
    _Size = 0xffffffffffffffff;
  }
  local_52c = uVar28;
  local_518 = param_4;
  local_4f0 = param_1;
  _Dst = (void *)thunk_FUN_14061b650(_Size);
  pvVar9 = (void *)0x0;
  if (_Dst == (void *)0x0) {
    local_520 = (void *)0x0;
  }
  else {
    local_520 = _Dst;
    memset(_Dst,0,_Size);
    pvVar9 = _Dst;
  }
  if (param_4 <= param_5) {
    iVar21 = (uint)param_3 * (uint)param_2;
    iVar25 = -iVar21;
    lVar18 = local_510;
    iVar7 = DAT_1409399a8;
    local_538 = param_4;
    local_534 = iVar21;
    local_528 = iVar25;
    iVar20 = iVar25;
    do {
      iVar16 = DAT_140989fe4 + (local_538 - *(int *)(param_1 + 0xc));
      lVar23 = (longlong)iVar16;
      lVar27 = (ulonglong)(uint)(iVar16 * 0x1d0) * 0xf8 + local_500;
      iVar16 = iVar25;
      if (iVar25 < (int)(uint)*(ushort *)(lVar18 + lVar23 * 2)) {
        iVar26 = (uVar28 & 0xffff) - iVar21;
        local_530 = iVar26;
        local_508 = lVar23;
        do {
          iVar16 = iVar21 + iVar25;
          pfVar19 = (float *)((ulonglong)
                              (uint)(iVar16 / (int)uVar8 +
                                    ((DAT_140989fe4 - local_518) + local_538) * *local_4f8) * 0x410
                             + (longlong)pvVar9);
          iVar29 = 0;
          do {
            iVar6 = iVar25;
            if (iVar29 != 0) {
              if (iVar29 == 1) {
                iVar6 = iVar25 - iVar21;
              }
              else {
                iVar6 = iVar20;
                if (iVar29 == 2) {
                  iVar6 = iVar16;
                }
              }
            }
            iVar20 = iVar6;
            uVar12 = *(ushort *)(lVar18 + lVar23 * 2);
            if ((int)(uint)uVar12 < iVar26 + iVar20) goto LAB_14034b937;
            memset(local_4e8,0,0x400);
            fVar33 = 0.0;
            uVar8 = (local_52c & 0xffff) + iVar20;
            uVar24 = 0;
            bVar22 = 1;
            uVar28 = (uint)uVar12;
            if ((int)uVar8 <= (int)(uint)uVar12) {
              uVar28 = uVar8;
            }
            do {
              iVar21 = 0;
              if (0 < iVar20) {
                iVar21 = iVar20;
              }
              pfVar17 = (float *)(lVar27 + 0x14 + (longlong)iVar21 * 0xf8);
              while (iVar21 < (int)uVar28) {
                if (500.0 < pfVar17[-5] || pfVar17[-5] == 500.0) {
                  if (iVar7 == 1) {
                    fVar31 = *pfVar17;
                  }
                  else {
                    fVar31 = (pfVar17[1] + *pfVar17) * 0.5;
                  }
                  if (bVar22 != 1) {
                    local_4e8[(int)((fVar31 / fVar33) * 511.0) & 0xffff] =
                         local_4e8[(int)((fVar31 / fVar33) * 511.0) & 0xffff] + 1;
                    uVar24 = uVar24 + 1;
                    goto LAB_14034b796;
                  }
                  auVar30 = ZEXT812(0x44800000);
                  iVar21 = iVar21 + 1;
                  if (1024.0 <= fVar31) {
                    auVar30._4_8_ = 0;
                    auVar30._0_4_ = fVar31;
                  }
                  pfVar17 = pfVar17 + 0x3e;
                  if (auVar30._0_4_ <= fVar33) {
                    auVar30._4_8_ = auVar30._4_8_;
                    auVar30._0_4_ = fVar33;
                  }
                  fVar33 = auVar30._0_4_;
                }
                else {
LAB_14034b796:
                  iVar21 = iVar21 + 1;
                  pfVar17 = pfVar17 + 0x3e;
                }
              }
            } while (((bVar22 != 1) || (fVar33 != 0.0)) && (bVar22 = bVar22 + 1, bVar22 < 3));
            uVar13 = 0;
            uVar28 = 0;
            do {
              fVar31 = (float)(int)uVar13;
              uVar12 = local_4e8[uVar13];
              uVar8 = (uint)(longlong)((float)uVar24 / 6.0 + 0.5);
              if (uVar8 <= uVar28 + uVar12) {
                if (uVar12 == 0) {
                  fVar32 = 0.0;
                }
                else {
                  fVar32 = (float)((uint)uVar12 + (uVar28 - uVar8)) / (float)uVar12;
                }
                fVar31 = fVar31 + (1.0 - fVar32);
                break;
              }
              uVar11 = (short)uVar13 + 1;
              uVar13 = (ulonglong)uVar11;
              uVar28 = uVar28 + uVar12;
            } while (uVar11 < 0x200);
            fVar31 = fVar31 * 0.001953125 * fVar33;
            if (*pfVar19 <= fVar31 && fVar31 != *pfVar19) {
              *pfVar19 = fVar31;
              pfVar19[1] = fVar31;
              sVar15 = 0;
              pfVar19[2] = fVar33;
              *(undefined2 *)(pfVar19 + 3) = 0;
              uVar13 = 0;
              do {
                uVar12 = (short)uVar13 + 1;
                sVar15 = sVar15 + local_4e8[uVar13];
                uVar13 = (ulonglong)uVar12;
              } while (uVar12 < 0x200);
              *(short *)(pfVar19 + 3) = sVar15;
              lVar18 = 8;
              puVar10 = (undefined8 *)((longlong)pfVar19 + 0xe);
              puVar14 = local_4e8;
              do {
                uVar2 = *(undefined8 *)(puVar14 + 4);
                uVar3 = *(undefined8 *)(puVar14 + 8);
                uVar4 = *(undefined8 *)(puVar14 + 0xc);
                *puVar10 = *(undefined8 *)puVar14;
                puVar10[1] = uVar2;
                uVar2 = *(undefined8 *)(puVar14 + 0x10);
                uVar5 = *(undefined8 *)(puVar14 + 0x14);
                puVar10[2] = uVar3;
                puVar10[3] = uVar4;
                uVar3 = *(undefined8 *)(puVar14 + 0x18);
                uVar4 = *(undefined8 *)(puVar14 + 0x1c);
                puVar10[4] = uVar2;
                puVar10[5] = uVar5;
                uVar2 = *(undefined8 *)(puVar14 + 0x20);
                uVar5 = *(undefined8 *)(puVar14 + 0x24);
                puVar10[6] = uVar3;
                puVar10[7] = uVar4;
                uVar3 = *(undefined8 *)(puVar14 + 0x28);
                uVar4 = *(undefined8 *)(puVar14 + 0x2c);
                puVar10[8] = uVar2;
                puVar10[9] = uVar5;
                uVar2 = *(undefined8 *)(puVar14 + 0x30);
                uVar5 = *(undefined8 *)(puVar14 + 0x34);
                puVar10[10] = uVar3;
                puVar10[0xb] = uVar4;
                auVar1 = *(undefined1 (*) [16])(puVar14 + 0x38);
                puVar10[0xc] = uVar2;
                puVar10[0xd] = uVar5;
                *(undefined1 (*) [16])(puVar10 + 0xe) = auVar1;
                lVar18 = lVar18 + -1;
                puVar10 = puVar10 + 0x10;
                puVar14 = puVar14 + 0x40;
              } while (lVar18 != 0);
              *(undefined2 *)((longlong)pfVar19 + 0x40e) = 0x200;
              iVar7 = DAT_1409399a8;
            }
            iVar29 = iVar29 + 1;
            lVar23 = local_508;
            lVar18 = local_510;
            iVar21 = local_534;
            iVar26 = local_530;
          } while (iVar29 < 3);
          uVar12 = *(ushort *)(local_510 + local_508 * 2);
LAB_14034b937:
          iVar25 = iVar25 + local_514;
          pvVar9 = local_520;
          uVar28 = local_52c;
          iVar16 = local_528;
          uVar8 = local_514;
        } while (iVar25 < (int)(uint)uVar12);
      }
      iVar25 = iVar16;
      local_538 = local_538 + 1;
      param_1 = local_4f0;
      pvVar9 = local_520;
    } while (local_538 <= param_5);
  }
  return pvVar9;
}

