
longlong FUN_14034d770(longlong param_1,longlong param_2,longlong param_3,ushort param_4,
                      uint *param_5,int param_6,int param_7,longlong param_8,ushort param_9)

{
  undefined1 auVar1 [16];
  undefined1 auVar2 [16];
  int iVar3;
  uint uVar4;
  uint uVar5;
  longlong lVar6;
  size_t sVar7;
  void *pvVar8;
  undefined8 uVar9;
  undefined4 *_Memory;
  float *pfVar10;
  ushort uVar11;
  ulonglong uVar12;
  int iVar13;
  float *pfVar14;
  float *pfVar15;
  ushort uVar16;
  int iVar17;
  undefined4 *puVar18;
  undefined8 *puVar19;
  undefined4 uVar20;
  float fVar21;
  ushort in_stack_ffffffffffffff58;
  
  *param_5 = 0;
  lVar6 = thunk_FUN_14061b650(0x15000);
  uVar5 = *param_5;
  while( true ) {
    puVar19 = (undefined8 *)((ulonglong)uVar5 * 0x38 + lVar6);
    *puVar19 = 0;
    puVar19[1] = 0;
    puVar19[2] = 0;
    puVar19[3] = 0;
    puVar19[4] = 0;
    puVar19[5] = 0;
    puVar19[6] = 0;
    auVar1._8_8_ = 0;
    auVar1._0_8_ = CONCAT62(0,param_4);
    sVar7 = SUB168(ZEXT816(4) * auVar1,0);
    *(undefined4 *)((longlong)puVar19 + 0x1c) = 0;
    if (SUB168(ZEXT816(4) * auVar1,8) != 0) {
      sVar7 = 0xffffffffffffffff;
    }
    pvVar8 = (void *)thunk_FUN_14061b650(sVar7);
    if (pvVar8 == (void *)0x0) {
      pvVar8 = (void *)0x0;
    }
    else {
      memset(pvVar8,0,sVar7);
    }
    puVar19[1] = pvVar8;
    auVar2._8_8_ = 0;
    auVar2._0_8_ = CONCAT62(0,param_4);
    uVar9 = SUB168(ZEXT816(4) * auVar2,0);
    if (SUB168(ZEXT816(4) * auVar2,8) != 0) {
      uVar9 = 0xffffffffffffffff;
    }
    _Memory = (undefined4 *)thunk_FUN_14061b650(uVar9);
    uVar16 = 0;
    iVar17 = DAT_140989fe4;
    if (param_4 != 0) {
      do {
        if (*(char *)(param_1 + 0x92) == '\0') {
          fVar21 = 500.0;
        }
        else {
          fVar21 = 1500.0;
        }
        iVar13 = param_6;
        if (fVar21 <= (float)uVar16 * 500.0) {
          for (; iVar13 <= param_7; iVar13 = iVar13 + 1) {
            uVar11 = 0;
            puVar18 = _Memory;
            if (8.0 < *(float *)((longlong)
                                 (int)(((iVar13 - param_6) + iVar17) * (uint)param_4 + (uint)uVar16)
                                 * 0x410 + param_3)) {
              do {
                if (param_6 - iVar17 < iVar13) {
                  uVar20 = *(undefined4 *)
                            ((longlong)
                             (int)((uint)uVar11 + (iVar17 + -1 + (iVar13 - param_6)) * (uint)param_4
                                  ) * 0x410 + param_3);
                }
                else {
                  uVar20 = 0x41000000;
                }
                *puVar18 = uVar20;
                uVar11 = uVar11 + 1;
                puVar18 = puVar18 + 1;
                iVar17 = DAT_140989fe4;
              } while (uVar11 < param_4);
              in_stack_ffffffffffffff58 = in_stack_ffffffffffffff58 & 0xff00;
              iVar3 = FUN_1403492f0(param_1,param_2,param_3,param_4,_Memory,uVar16,iVar13,1,
                                    in_stack_ffffffffffffff58,puVar19,param_6,param_7);
              iVar17 = DAT_140989fe4;
              if (iVar13 <= iVar3) {
                iVar13 = iVar3;
              }
            }
          }
        }
        uVar16 = uVar16 + 1;
      } while (uVar16 < param_4);
    }
    free(_Memory);
    pfVar15 = (float *)0x0;
    uVar5 = 0;
    uVar4 = (uint)param_9;
    pfVar14 = pfVar15;
    if (3 < uVar4) {
      pfVar10 = (float *)(param_8 + 0x8c);
      uVar5 = (param_9 - 4 >> 2) + 1;
      uVar12 = (ulonglong)uVar5;
      uVar5 = uVar5 * 4;
      do {
        fVar21 = pfVar10[-0x1c];
        if ((0.0 < fVar21) &&
           ((pfVar14 == (float *)0x0 || (pfVar14[7] <= fVar21 && fVar21 != pfVar14[7])))) {
          pfVar14 = pfVar10 + -0x23;
        }
        fVar21 = pfVar10[-0xe];
        if ((0.0 < fVar21) &&
           ((pfVar14 == (float *)0x0 || (pfVar14[7] <= fVar21 && fVar21 != pfVar14[7])))) {
          pfVar14 = pfVar10 + -0x15;
        }
        fVar21 = *pfVar10;
        if ((0.0 < fVar21) &&
           ((pfVar14 == (float *)0x0 || (pfVar14[7] <= fVar21 && fVar21 != pfVar14[7])))) {
          pfVar14 = pfVar10 + -7;
        }
        fVar21 = pfVar10[0xe];
        if ((0.0 < fVar21) &&
           ((pfVar14 == (float *)0x0 || (pfVar14[7] <= fVar21 && fVar21 != pfVar14[7])))) {
          pfVar14 = pfVar10 + 7;
        }
        pfVar10 = pfVar10 + 0x38;
        uVar12 = uVar12 - 1;
      } while (uVar12 != 0);
    }
    if (uVar5 < uVar4) {
      pfVar10 = (float *)((ulonglong)uVar5 * 0x38 + param_8);
      uVar12 = (ulonglong)(uVar4 - uVar5);
      do {
        fVar21 = pfVar10[7];
        if ((0.0 < fVar21) &&
           ((pfVar14 == (float *)0x0 || (pfVar14[7] <= fVar21 && fVar21 != pfVar14[7])))) {
          pfVar14 = pfVar10;
        }
        pfVar10 = pfVar10 + 0xe;
        uVar12 = uVar12 - 1;
      } while (uVar12 != 0);
    }
    if ((pfVar14 != (float *)0x0) &&
       (*(float *)((longlong)puVar19 + 0x1c) <= pfVar14[7] &&
        pfVar14[7] != *(float *)((longlong)puVar19 + 0x1c))) {
      uVar9 = *(undefined8 *)(pfVar14 + 2);
      pvVar8 = (void *)puVar19[1];
      *puVar19 = *(undefined8 *)pfVar14;
      puVar19[1] = uVar9;
      uVar9 = *(undefined8 *)(pfVar14 + 6);
      puVar19[2] = *(undefined8 *)(pfVar14 + 4);
      puVar19[3] = uVar9;
      uVar9 = *(undefined8 *)(pfVar14 + 10);
      puVar19[4] = *(undefined8 *)(pfVar14 + 8);
      puVar19[5] = uVar9;
      puVar19[6] = *(undefined8 *)(pfVar14 + 0xc);
      puVar19[1] = pvVar8;
      memcpy(pvVar8,(void *)puVar19[5],(ulonglong)param_4 * 4);
      free((void *)puVar19[5]);
      puVar19[5] = 0;
      uVar11 = *(short *)(param_2 + 0xc) - 1;
      uVar16 = *(ushort *)((longlong)puVar19 + 0x16);
      if (uVar11 <= *(ushort *)((longlong)puVar19 + 0x16)) {
        uVar16 = uVar11;
      }
      *(ushort *)((longlong)puVar19 + 0x16) = uVar16;
      pfVar15 = pfVar14;
    }
    if (*(float *)((longlong)puVar19 + 0x1c) == 0.0) break;
    auVar1 = ZEXT816(4) * ZEXT416((uint)param_4 * ((param_7 - param_6) + 1));
    sVar7 = auVar1._0_8_;
    if (auVar1._8_8_ != 0) {
      sVar7 = 0xffffffffffffffff;
    }
    pvVar8 = (void *)thunk_FUN_14061b650(sVar7);
    if (pvVar8 == (void *)0x0) {
      pvVar8 = (void *)0x0;
    }
    else {
      memset(pvVar8,0,sVar7);
    }
    *puVar19 = pvVar8;
    in_stack_ffffffffffffff58 = param_9;
    FUN_14034c5a0(param_1,param_2,param_3,param_4,puVar19,param_6,param_7,param_8,param_9);
    if (*(int *)(puVar19 + 6) == 0) {
      WaitForSingleObject(DAT_140989f08,0xffffffff);
      DAT_14098a148 = DAT_14098a148 + 1;
      *(int *)(puVar19 + 6) = DAT_14098a148;
      ReleaseMutex(DAT_140989f08);
    }
    else if (pfVar15 != (float *)0x0) {
      pfVar15[0] = 0.0;
      pfVar15[1] = 0.0;
      pfVar15[2] = 0.0;
      pfVar15[3] = 0.0;
      pfVar15[4] = 0.0;
      pfVar15[5] = 0.0;
      pfVar15[6] = 0.0;
      pfVar15[7] = 0.0;
      pfVar15[8] = 0.0;
      pfVar15[9] = 0.0;
      pfVar15[10] = 0.0;
      pfVar15[0xb] = 0.0;
      pfVar15[0xc] = 0.0;
      pfVar15[0xd] = 0.0;
    }
    free((void *)puVar19[1]);
    puVar19[1] = 0;
    if (((uint)*(ushort *)((longlong)puVar19 + 0x14) < *(uint *)(param_2 + 0x10)) &&
       (*(uint *)(param_2 + 0xc) <= (uint)*(ushort *)((longlong)puVar19 + 0x16))) {
      *param_5 = *param_5 + 1;
      uVar5 = *param_5;
    }
    else {
      free((void *)*puVar19);
      *puVar19 = 0;
      uVar5 = *param_5;
    }
    if (0x5ff < uVar5) {
      return lVar6;
    }
  }
  free((void *)puVar19[1]);
  puVar19[1] = 0;
  return lVar6;
}

