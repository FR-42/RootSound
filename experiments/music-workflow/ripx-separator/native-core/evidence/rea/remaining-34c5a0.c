
void FUN_14034c5a0(longlong param_1,longlong param_2,longlong param_3,ushort param_4,
                  longlong *param_5,float param_6,int param_7,longlong param_8,ushort param_9)

{
  float fVar1;
  bool bVar2;
  bool bVar3;
  undefined1 auVar4 [16];
  undefined1 auVar5 [16];
  char cVar6;
  char cVar7;
  uint uVar8;
  float fVar9;
  int iVar10;
  undefined8 uVar11;
  void *_Dst;
  ushort uVar12;
  longlong lVar13;
  longlong lVar14;
  ushort uVar15;
  uint uVar16;
  uint uVar17;
  uint uVar18;
  float fVar19;
  float *pfVar20;
  longlong lVar21;
  uint uVar22;
  ushort *puVar23;
  ushort *puVar24;
  uint uVar25;
  int iVar26;
  int iVar27;
  int iVar28;
  ushort uVar29;
  ulonglong uVar30;
  ushort uVar31;
  int iVar32;
  float fVar33;
  float fVar34;
  float fVar35;
  float fVar36;
  float fVar37;
  float fVar38;
  undefined4 uVar39;
  undefined2 uVar40;
  char *pcVar41;
  ushort local_118 [2];
  ushort local_114 [2];
  ushort local_110;
  ushort local_10e;
  ushort local_10c;
  char local_10a;
  char local_109;
  undefined2 local_108;
  ushort local_106;
  undefined2 local_104 [2];
  float local_100;
  uint local_fc;
  int local_f8;
  float local_f4;
  float local_f0;
  longlong local_e8;
  ulonglong local_e0;
  void *local_d8;
  undefined8 local_d0;
  undefined8 local_c8;
  undefined8 local_c0;
  undefined8 local_b8;
  undefined8 local_b0;
  undefined8 local_a8;
  undefined8 local_a0;
  undefined4 uVar42;
  
  uVar29 = *(ushort *)(param_5 + 2);
  uVar15 = *(ushort *)((longlong)param_5 + 0x12);
  local_e0 = CONCAT62(0,param_4);
  auVar4._8_8_ = 0;
  auVar4._0_8_ = local_e0;
  uVar11 = SUB168(ZEXT816(4) * auVar4,0);
  if (SUB168(ZEXT816(4) * auVar4,8) != 0) {
    uVar11 = 0xffffffffffffffff;
  }
  local_10e = uVar29;
  local_10c = uVar15;
  local_d8 = (void *)thunk_FUN_14061b650(uVar11);
  local_f8 = 1;
  fVar9 = local_100;
  uVar31 = local_118[0];
LAB_14034c660:
  iVar32 = local_f8;
  if (*(uint *)(param_2 + 0xc) <= (uint)*(ushort *)((longlong)param_5 + 0x14)) {
    local_108 = *(undefined2 *)((longlong)param_5 + 0x1a);
LAB_14034c6a3:
    uVar12 = *(ushort *)(param_5 + 3);
    local_e8 = param_5[1];
    fVar33 = param_6;
    if ((int)param_6 < (int)(uint)uVar12) {
      fVar33 = (float)(uint)uVar12;
    }
    fVar38 = 0.0;
    local_fc = (uint)uVar12;
    local_f4 = 0.0;
    uVar22 = ((0 < local_f8) - 1) + (int)fVar33;
    local_10a = '\x01';
    local_110 = uVar29;
    local_106 = uVar15;
    local_104[0] = local_108;
    cVar7 = '\x01';
    do {
      uVar8 = local_fc;
      cVar6 = local_10a;
      if (iVar32 < 1) {
        bVar2 = (int)param_6 <= (int)uVar22;
      }
      else {
        bVar2 = (int)uVar22 <= param_7;
      }
      if (!bVar2) goto LAB_14034cccf;
      if (cVar7 != '\0') {
        cVar7 = FUN_14034c020(param_1,param_2,local_104,uVar22,local_fc,param_3,param_4,local_e8,
                              local_114,local_118,&local_100,local_110,local_106,1,param_6,param_5);
        fVar9 = local_100;
        uVar31 = local_118[0];
        if (cVar7 == '\0') goto LAB_14034cccf;
        local_108 = local_104[0];
      }
      uVar29 = local_114[0];
      local_109 = '\x01';
      if (uVar22 == uVar8) {
        local_10e = local_114[0];
        local_10c = uVar31;
      }
      if (((cVar6 == '\0') &&
          (fVar33 = (float)FUN_1402a0d40(0xfffffff6),
          fVar9 < fVar33 * *(float *)((longlong)param_5 + 0x1c))) &&
         ((*(short *)(param_1 + 0x14) == 0 || (fVar9 - fVar38 <= 32.0)))) goto LAB_14034cccf;
      fVar33 = fVar9 - fVar38;
      local_d0 = 0;
      local_c8 = 0;
      local_c0 = 0;
      local_b8 = 0;
      local_b0 = 0;
      local_a8 = 0;
      local_a0 = 0;
      pcVar41 = &local_10a;
      lVar13 = local_e8;
      uVar8 = FUN_14034c2b0(param_1,param_2,param_3,param_4,local_e8,local_d8,local_108,local_fc,
                            uVar22,iVar32,1,&local_d0,fVar33,&local_f4,pcVar41,param_6,param_7);
      uVar39 = (undefined4)((ulonglong)lVar13 >> 0x20);
      uVar40 = (undefined2)((uint)fVar33 >> 0x10);
      uVar42 = (undefined4)((ulonglong)pcVar41 >> 0x20);
      fVar33 = (float)FUN_140351660(7);
      if (fVar33 * fVar38 <= local_b8._4_4_) {
        if (uVar8 == 0xffffffff) goto LAB_14034c8d8;
        iVar28 = uVar8 + iVar32;
        if (((iVar28 < (int)param_6 - DAT_140989fe4) || (param_7 < iVar28)) ||
           (cVar7 = FUN_14034c020(param_1,param_2,local_104,iVar28,CONCAT44(uVar39,local_fc),param_3
                                  ,param_4,local_e8,local_114,local_118,&local_100,local_110,
                                  CONCAT22(uVar40,local_106),1,CONCAT44(uVar42,param_6),param_5),
           fVar9 = local_100, uVar31 = local_118[0], cVar7 == '\0')) goto LAB_14034cccf;
        local_109 = '\0';
        local_108 = local_104[0];
        uVar29 = local_114[0];
      }
      else {
        uVar8 = 0xffffffff;
LAB_14034c8d8:
        local_106 = local_118[0];
        local_110 = uVar29;
        fVar38 = fVar9;
      }
      uVar16 = uVar8;
      if (uVar8 == 0xffffffff) {
        uVar16 = uVar22;
      }
      uVar15 = uVar29;
      if (uVar29 <= local_118[0]) {
        local_f0 = (float)(1 - uVar8);
        iVar28 = DAT_140989fe4;
        do {
          iVar27 = (uVar8 - uVar22) + 1;
          fVar33 = 0.0;
          fVar36 = 0.0;
          uVar18 = (uint)uVar29;
          uVar17 = uVar22;
          fVar37 = fVar36;
          if (uVar8 != 0xffffffff) {
            if (((int)param_6 - iVar28 <= (int)(uVar22 - iVar32)) &&
               ((int)(uVar22 - iVar32) <= param_7)) {
              fVar33 = *(float *)((longlong)
                                  (int)(uVar18 + (((iVar28 - iVar32) - (int)param_6) + uVar22) *
                                                 (uint)param_4) * 0x410 + param_3);
            }
            if (((int)param_6 - iVar28 <= (int)(uVar8 + iVar32)) &&
               ((int)(uVar8 + iVar32) <= param_7)) {
              fVar36 = *(float *)((longlong)
                                  (int)(uVar18 + ((iVar28 - (int)param_6) + uVar8 + iVar32) *
                                                 (uint)param_4) * 0x410 + param_3);
            }
            fVar37 = fVar33;
            if (fVar36 <= fVar33) {
              fVar37 = fVar36;
            }
          }
          while( true ) {
            if (iVar32 < 1) {
              bVar2 = (int)uVar16 <= (int)uVar17;
            }
            else {
              bVar2 = (int)uVar17 <= (int)uVar16;
            }
            if (!bVar2) break;
            pfVar20 = (float *)((longlong)
                                (int)((uVar22 + (iVar28 - (int)param_6)) * (uint)param_4 + uVar18) *
                                0x410 + param_3);
            fVar36 = *pfVar20;
            fVar35 = fVar36;
            if (uVar8 != 0xffffffff) {
              iVar28 = iVar27;
              iVar26 = uVar8 - uVar22;
              if (iVar32 < 1) {
                iVar28 = (int)local_f0 + uVar17;
                iVar26 = uVar22 - uVar8;
              }
              fVar35 = (float)iVar28 / (float)(iVar26 + 2);
              fVar35 = (1.0 - fVar35) * fVar37 + fVar35 * fVar33;
              if (fVar36 <= fVar35) {
                fVar35 = fVar36;
              }
            }
            fVar35 = fVar35 - *(float *)(local_e8 + (ulonglong)uVar29 * 4);
            if (fVar35 <= 0.0) {
              fVar35 = 0.0;
            }
            *(float *)(*param_5 +
                      (longlong)(int)((uVar22 - (int)param_6) * (uint)param_4 + uVar18) * 4) =
                 fVar35;
            fVar35 = *pfVar20 - fVar35;
            if (fVar35 <= 0.0) {
              fVar35 = 0.0;
            }
            *pfVar20 = fVar35;
            iVar27 = iVar27 - iVar32;
            iVar28 = DAT_140989fe4;
            uVar17 = uVar17 + iVar32;
          }
          uVar29 = uVar29 + 1;
          uVar15 = local_114[0];
        } while (uVar29 <= local_118[0]);
      }
      if (((((0 < iVar32) &&
            ((uint)*(ushort *)((longlong)param_5 + 0x14) <= *(int *)(param_2 + 0x10) - 1U)) &&
           (iVar28 = *(int *)(param_2 + 0x10) + -1, (int)uVar22 <= iVar28)) &&
          (iVar28 <= (int)uVar16)) ||
         (((iVar32 < 0 &&
           (*(int *)(param_2 + 0x10) <= (int)(uint)*(ushort *)((longlong)param_5 + 0x16))) &&
          ((iVar28 = *(int *)(param_2 + 0x10) + -1, iVar28 <= (int)uVar22 && ((int)uVar16 <= iVar28)
           ))))) {
        _Dst = (void *)param_5[5];
        uVar29 = *(ushort *)(param_5 + 2);
        if (uVar15 < *(ushort *)(param_5 + 2)) {
          uVar29 = uVar15;
        }
        *(ushort *)((longlong)param_5 + 0x22) = uVar29;
        uVar29 = *(ushort *)((longlong)param_5 + 0x12);
        if (*(ushort *)((longlong)param_5 + 0x12) < local_118[0]) {
          uVar29 = local_118[0];
        }
        *(ushort *)((longlong)param_5 + 0x24) = uVar29;
        *(undefined2 *)((longlong)param_5 + 0x26) = local_108;
        if (_Dst == (void *)0x0) {
          auVar5._8_8_ = 0;
          auVar5._0_8_ = local_e0;
          uVar11 = SUB168(ZEXT816(4) * auVar5,0);
          if (SUB168(ZEXT816(4) * auVar5,8) != 0) {
            uVar11 = 0xffffffffffffffff;
          }
          _Dst = (void *)thunk_FUN_14061b650(uVar11);
          param_5[5] = (longlong)_Dst;
        }
        memcpy(_Dst,(void *)param_5[1],local_e0 * 4);
      }
      uVar29 = *(ushort *)(param_5 + 2);
      if (uVar15 < *(ushort *)(param_5 + 2)) {
        uVar29 = uVar15;
      }
      *(ushort *)(param_5 + 2) = uVar29;
      uVar29 = *(ushort *)((longlong)param_5 + 0x12);
      if (*(ushort *)((longlong)param_5 + 0x12) < local_118[0]) {
        uVar29 = local_118[0];
      }
      *(ushort *)((longlong)param_5 + 0x12) = uVar29;
      if (iVar32 < 1) {
        *(short *)((longlong)param_5 + 0x14) = (short)uVar16;
      }
      else {
        *(short *)((longlong)param_5 + 0x16) = (short)uVar16;
      }
      uVar22 = uVar16 + iVar32;
      uVar31 = local_118[0];
      cVar7 = local_109;
    } while( true );
  }
  if (local_f8 == 1) {
    uVar29 = *(ushort *)((longlong)param_5 + 0x22);
    uVar15 = *(ushort *)((longlong)param_5 + 0x24);
    local_108 = *(undefined2 *)((longlong)param_5 + 0x26);
    *(undefined4 *)((longlong)param_5 + 0x22) = 0;
    *(undefined2 *)((longlong)param_5 + 0x26) = 0;
    goto LAB_14034c6a3;
  }
  goto LAB_14034ce33;
LAB_14034cccf:
  uVar12 = local_106;
  puVar23 = (ushort *)0x0;
  uVar29 = local_10e;
  uVar15 = local_10c;
  if (((iVar32 == -1) && ((int)uVar22 < *(int *)(param_2 + 0xc))) && (param_9 != 0)) {
    uVar30 = (ulonglong)param_9;
    puVar24 = (ushort *)(param_8 + 0x24);
    do {
      uVar29 = puVar24[-1];
      if (((uVar29 < uVar12) && (uVar15 = *puVar24, local_110 < uVar15)) &&
         ((local_118[0] = uVar15, local_114[0] = uVar29,
          cVar7 = FUN_14034ba00(param_1,local_114,local_118,local_110,uVar12,param_5), cVar7 != '\0'
          && ((puVar23 == (ushort *)0x0 ||
              (uVar22 = (uint)local_110 - (uint)puVar23[0x11], uVar8 = (int)uVar22 >> 0x1f,
              uVar16 = (int)((uint)uVar12 - (uint)puVar23[0x12]) >> 0x1f,
              uVar25 = (uint)local_110 - (uint)uVar29, uVar17 = (int)uVar25 >> 0x1f,
              uVar18 = (int)((uint)uVar12 - (uint)uVar15) >> 0x1f,
              (int)(((uVar25 ^ uVar17) - uVar17) + (((uint)uVar12 - (uint)uVar15 ^ uVar18) - uVar18)
                   ) < (int)(((uVar22 ^ uVar8) - uVar8) +
                            (((uint)uVar12 - (uint)puVar23[0x12] ^ uVar16) - uVar16)))))))) {
        puVar23 = puVar24 + -0x12;
      }
      puVar24 = puVar24 + 0x1c;
      uVar30 = uVar30 - 1;
    } while (uVar30 != 0);
    uVar29 = local_10e;
    uVar31 = local_118[0];
    iVar32 = local_f8;
    uVar15 = local_10c;
    if (puVar23 != (ushort *)0x0) {
      *(ushort *)((longlong)param_5 + 0x14) = puVar23[10];
      *(char *)(param_5 + 4) = (char)puVar23[0x10];
      *(undefined4 *)(param_5 + 6) = *(undefined4 *)(puVar23 + 0x18);
      uVar12 = puVar23[8];
      if (*(ushort *)(param_5 + 2) <= puVar23[8]) {
        uVar12 = *(ushort *)(param_5 + 2);
      }
      *(ushort *)(param_5 + 2) = uVar12;
      uVar12 = puVar23[9];
      if (puVar23[9] <= *(ushort *)((longlong)param_5 + 0x12)) {
        uVar12 = *(ushort *)((longlong)param_5 + 0x12);
      }
      *(ushort *)((longlong)param_5 + 0x12) = uVar12;
    }
  }
LAB_14034ce33:
  local_f8 = iVar32 + -2;
  if (local_f8 < -1) {
    free(local_d8);
    do {
      bVar2 = false;
      local_100 = (float)(uint)*(ushort *)((longlong)param_5 + 0x14);
      fVar9 = param_6;
      fVar33 = param_6;
      if ((int)param_6 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x14)) {
        uVar22 = (uint)*(ushort *)(param_5 + 2);
        fVar38 = 0.0;
        local_fc = 0xffffffff;
        fVar9 = local_100;
        fVar33 = local_100;
        if ((uint)*(ushort *)(param_5 + 2) <= (uint)*(ushort *)((longlong)param_5 + 0x12)) {
          uVar29 = *(ushort *)((longlong)param_5 + 0x16);
          do {
            fVar36 = 0.0;
            if ((uint)local_100 <= (uint)uVar29) {
              pfVar20 = (float *)(*param_5 +
                                 (longlong)
                                 (int)(((int)local_100 - (int)param_6) * (uint)param_4 + uVar22) * 4
                                 );
              lVar13 = (longlong)(int)(((uint)uVar29 - (int)local_100) + 1);
              do {
                fVar36 = fVar36 + *pfVar20;
                pfVar20 = pfVar20 + local_e0;
                lVar13 = lVar13 + -1;
              } while (lVar13 != 0);
            }
            uVar8 = uVar22;
            if (fVar36 <= fVar38) {
              uVar8 = local_fc;
              fVar36 = fVar38;
            }
            fVar38 = fVar36;
            uVar22 = uVar22 + 1;
            local_fc = uVar8;
          } while ((int)uVar22 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x12));
          uVar15 = *(ushort *)((longlong)param_5 + 0x14);
          if (-1 < (int)uVar8) {
            iVar28 = (uint)uVar29 - (uint)uVar15;
            iVar32 = iVar28 + 1;
            iVar28 = iVar28 * 2 + 2;
            fVar9 = (float)((int)(((longlong)iVar32 / 3 + ((longlong)iVar32 >> 0x3f) & 0xffffffffU)
                                 >> 0x1f) + iVar32 / 3 + (iVar32 >> 0x1f) + (uint)uVar15);
            local_f0 = param_6;
            if ((int)param_6 < (int)fVar9) {
              local_f0 = fVar9;
            }
            fVar9 = (float)((int)(((longlong)iVar28 / 3 + ((longlong)iVar28 >> 0x3f) & 0xffffffffU)
                                 >> 0x1f) + iVar28 / 3 + (iVar28 >> 0x1f) + (uint)uVar15);
            local_f4 = param_6;
            if ((int)param_6 < (int)fVar9) {
              local_f4 = fVar9;
            }
            iVar32 = -1;
            fVar36 = local_f0;
            fVar37 = local_f4;
            do {
              iVar28 = 1;
              if (iVar32 < 1) {
                iVar28 = -1;
              }
              iVar28 = iVar28 + local_fc;
              while( true ) {
                if (iVar32 < 1) {
                  bVar3 = (int)(uint)*(ushort *)(param_5 + 2) <= iVar28;
                }
                else {
                  bVar3 = iVar28 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x12);
                }
                if (!bVar3) goto LAB_14034d16d;
                uVar29 = *(ushort *)((longlong)param_5 + 0x16);
                uVar22 = (uint)uVar29;
                fVar35 = 0.0;
                fVar9 = 0.0;
                if ((int)fVar33 <= (int)(uint)uVar29) {
                  pfVar20 = (float *)(*param_5 +
                                     (longlong)
                                     (int)(((int)fVar33 - (int)param_6) * (uint)param_4 + iVar28) *
                                     4);
                  fVar34 = fVar9;
                  fVar19 = fVar33;
                  do {
                    fVar1 = *pfVar20;
                    fVar35 = fVar35 + fVar1;
                    fVar9 = fVar34;
                    if ((((int)fVar36 <= (int)fVar19) && ((int)fVar19 <= (int)fVar37)) &&
                       (fVar9 = fVar1, fVar1 <= fVar34)) {
                      fVar9 = fVar34;
                    }
                    fVar19 = (float)((int)fVar19 + 1);
                    pfVar20 = pfVar20 + local_e0;
                    fVar34 = fVar9;
                  } while ((int)fVar19 <= (int)(uint)uVar29);
                }
                fVar34 = (float)FUN_1402a0d40(0xffffffec);
                if ((fVar35 < fVar34 * fVar38) &&
                   (iVar27 = iVar28,
                   ((float)(int)((uVar22 - (int)fVar33) + 1) * fVar9) / 3.0 < fVar34 * fVar38))
                break;
                iVar28 = iVar28 + iVar32;
              }
              while( true ) {
                if (iVar32 < 1) {
                  bVar2 = (int)(uint)*(ushort *)(param_5 + 2) <= iVar27;
                }
                else {
                  bVar2 = iVar27 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x12);
                }
                if (!bVar2) break;
                if ((int)uVar22 < (int)fVar33) {
                  uVar22 = (uint)*(ushort *)((longlong)param_5 + 0x16);
                  iVar27 = iVar27 + iVar32;
                }
                else {
                  iVar26 = ((int)fVar33 - (int)param_6) * (uint)param_4 + iVar27;
                  do {
                    lVar14 = (longlong)iVar26;
                    iVar10 = (DAT_140989fe4 - (int)param_6) + (int)fVar33;
                    iVar26 = iVar26 + (uint)param_4;
                    fVar33 = (float)((int)fVar33 + 1);
                    lVar21 = (longlong)(int)(iVar10 * (uint)param_4 + iVar27) * 0x410;
                    lVar13 = *param_5;
                    *(float *)(lVar21 + param_3) =
                         *(float *)(lVar13 + lVar14 * 4) + *(float *)(lVar21 + param_3);
                    *(undefined4 *)(lVar13 + lVar14 * 4) = 0;
                  } while ((int)fVar33 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x16));
                  uVar22 = (uint)*(ushort *)((longlong)param_5 + 0x16);
                  iVar27 = iVar27 + iVar32;
                  fVar33 = local_100;
                }
              }
              if (iVar32 < 1) {
                *(short *)(param_5 + 2) = (short)iVar28 + 1;
              }
              else {
                *(short *)((longlong)param_5 + 0x12) = (short)iVar28 + -1;
              }
              bVar2 = true;
              fVar36 = local_f0;
              fVar37 = local_f4;
LAB_14034d16d:
              iVar32 = iVar32 + 2;
              fVar9 = local_100;
            } while (iVar32 < 2);
          }
        }
      }
      local_100 = fVar9;
      fVar9 = 0.0;
      local_f4 = -NAN;
      if ((int)fVar33 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x16)) {
        uVar29 = *(ushort *)(param_5 + 2);
        uVar15 = *(ushort *)((longlong)param_5 + 0x12);
        do {
          fVar38 = 0.0;
          if ((uint)uVar29 <= (uint)uVar15) {
            pfVar20 = (float *)(*param_5 +
                               (longlong)
                               (int)(((int)fVar33 - (int)param_6) * (uint)param_4 + (uint)uVar29) *
                               4);
            uVar30 = (ulonglong)(((uint)uVar15 - (uint)uVar29) + 1);
            do {
              fVar38 = fVar38 + *pfVar20;
              pfVar20 = pfVar20 + 1;
              uVar30 = uVar30 - 1;
            } while (uVar30 != 0);
          }
          fVar36 = fVar33;
          if (fVar38 <= fVar9) {
            fVar36 = local_f4;
            fVar38 = fVar9;
          }
          fVar9 = fVar38;
          local_f4 = fVar36;
          fVar33 = (float)((int)fVar33 + 1);
        } while ((int)fVar33 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x16));
        if (-1 < (int)local_f4) {
          uVar29 = *(ushort *)(param_5 + 2);
          iVar32 = (uint)uVar15 - (uint)uVar29;
          fVar38 = (float)((iVar32 + 1) / 3 + (uint)uVar29);
          local_f8 = (iVar32 * 2 + 2) / 3 + (uint)uVar29;
          fVar33 = local_100;
          iVar32 = 1;
          local_f0 = fVar38;
          iVar28 = local_f8;
          if ((int)param_6 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x14)) {
            iVar32 = -1;
          }
          do {
            if (iVar32 < 1) {
              fVar36 = (float)((int)local_f4 - 1);
            }
            else {
              fVar36 = param_6;
              if ((int)param_6 < (int)((int)local_f4 + 1U)) {
                fVar36 = (float)((int)local_f4 + 1U);
              }
            }
            while( true ) {
              if (iVar32 < 1) {
                bVar3 = (int)fVar33 <= (int)fVar36;
              }
              else {
                bVar3 = (int)fVar36 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x16);
              }
              if (!bVar3) goto LAB_14034d45d;
              uVar29 = *(ushort *)(param_5 + 2);
              uVar22 = (uint)uVar29;
              fVar35 = 0.0;
              uVar15 = *(ushort *)((longlong)param_5 + 0x12);
              fVar37 = 0.0;
              uVar8 = (uint)uVar15;
              if (uVar29 < uVar8 || uVar29 == uVar8) {
                pfVar20 = (float *)(*param_5 +
                                   (longlong)
                                   (int)(((int)fVar36 - (int)param_6) * (uint)param_4 + (uint)uVar29
                                        ) * 4);
                fVar34 = fVar37;
                do {
                  fVar19 = *pfVar20;
                  fVar35 = fVar35 + fVar19;
                  fVar37 = fVar34;
                  if ((((int)fVar38 <= (int)uVar22) && ((int)uVar22 <= iVar28)) &&
                     (fVar37 = fVar19, fVar19 <= fVar34)) {
                    fVar37 = fVar34;
                  }
                  uVar22 = uVar22 + 1;
                  pfVar20 = pfVar20 + 1;
                  fVar34 = fVar37;
                } while ((int)uVar22 <= (int)uVar8);
              }
              fVar34 = (float)FUN_1402a0d40(0xffffffec);
              iVar28 = local_f8;
              if ((fVar35 < fVar34 * fVar9) &&
                 (fVar35 = fVar36,
                 ((float)(int)(((uint)uVar15 - (uint)uVar29) + 1) * fVar37) / 3.0 < fVar34 * fVar9))
              break;
              fVar36 = (float)((int)fVar36 + iVar32);
            }
            while( true ) {
              if (iVar32 < 1) {
                bVar2 = (int)fVar33 <= (int)fVar35;
              }
              else {
                bVar2 = (int)fVar35 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x16);
              }
              if (!bVar2) break;
              uVar29 = *(ushort *)(param_5 + 2);
              uVar22 = (uint)uVar29;
              if (uVar29 <= *(ushort *)((longlong)param_5 + 0x12)) {
                iVar27 = ((int)fVar35 - (int)param_6) * (uint)param_4 + (uint)uVar29;
                do {
                  lVar14 = (longlong)iVar27;
                  iVar27 = iVar27 + 1;
                  iVar26 = ((DAT_140989fe4 - (int)param_6) + (int)fVar35) * (uint)param_4 + uVar22;
                  uVar22 = uVar22 + 1;
                  lVar21 = (longlong)iVar26 * 0x410;
                  lVar13 = *param_5;
                  *(float *)(lVar21 + param_3) =
                       *(float *)(lVar13 + lVar14 * 4) + *(float *)(lVar21 + param_3);
                  *(undefined4 *)(lVar13 + lVar14 * 4) = 0;
                  fVar33 = local_100;
                } while ((int)uVar22 <= (int)(uint)*(ushort *)((longlong)param_5 + 0x12));
              }
              fVar35 = (float)((int)fVar35 + iVar32);
            }
            fVar38 = local_f0;
            if (iVar32 < 1) {
              *(short *)((longlong)param_5 + 0x14) = SUB42(fVar36,0) + 1;
              bVar2 = true;
            }
            else {
              *(short *)((longlong)param_5 + 0x16) = SUB42(fVar36,0) + -1;
              bVar2 = true;
            }
LAB_14034d45d:
            iVar32 = iVar32 + 2;
          } while (iVar32 < 2);
        }
      }
      if (!bVar2) {
        return;
      }
    } while( true );
  }
  goto LAB_14034c660;
}

