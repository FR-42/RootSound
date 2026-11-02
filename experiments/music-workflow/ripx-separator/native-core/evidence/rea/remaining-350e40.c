
void FUN_140350e40(longlong param_1,longlong param_2,int param_3,int param_4,undefined8 param_5,
                  undefined2 param_6,longlong *param_7,ushort *param_8,undefined1 param_9)

{
  float fVar1;
  double dVar2;
  undefined8 uVar3;
  int iVar4;
  int iVar5;
  int iVar6;
  undefined8 *_Memory;
  void *_Dst;
  longlong lVar7;
  undefined8 *puVar8;
  byte bVar9;
  undefined2 uVar10;
  uint uVar11;
  ushort *puVar12;
  uint uVar13;
  ulonglong uVar14;
  size_t _Size;
  int iVar15;
  longlong lVar16;
  ulonglong uVar17;
  size_t sVar18;
  ulonglong uVar19;
  uint uVar20;
  byte bVar21;
  undefined8 local_res8;
  longlong local_res10;
  int local_res18;
  int local_res20;
  undefined8 in_stack_ffffffffffffff28;
  undefined4 uVar22;
  undefined8 in_stack_ffffffffffffff38;
  undefined4 uVar23;
  uint local_a8;
  uint local_a4;
  longlong local_a0;
  void *local_98;
  longlong local_90;
  
  uVar23 = (undefined4)((ulonglong)in_stack_ffffffffffffff38 >> 0x20);
  uVar22 = (undefined4)((ulonglong)in_stack_ffffffffffffff28 >> 0x20);
  local_90 = *(longlong *)(param_2 + 0x598);
  local_a0 = *(longlong *)(param_2 + 0x5a0);
  uVar11 = (uint)(500.0 / DAT_140989fe0 + 0.5);
  local_res10 = param_2;
  local_res18 = param_3;
  local_res20 = param_4;
  local_a4 = uVar11;
  if (*(short *)(param_1 + 0x14) == 0) {
    FUN_140349600(param_2,param_3 - DAT_140989fe4,param_4);
  }
  local_98 = (void *)FUN_14034b460(param_2,uVar11 & 0xffff,3,param_3,CONCAT44(uVar22,param_4),
                                   &local_a8);
  local_res8 = (ulonglong)local_res8._4_4_ << 0x20;
  _Memory = (undefined8 *)
            FUN_14034d770(param_1,param_2,local_98,(undefined2)local_a8,&local_res8,param_3,
                          CONCAT44(uVar23,param_4),param_5,param_6);
  iVar15 = 1;
  iVar6 = (int)local_res8;
  uVar17 = local_res8 & 0xffffffff;
  do {
    sVar18 = 0xffffffffffffffff;
    *param_8 = 0;
    if (iVar6 != 0) {
      puVar12 = (ushort *)((longlong)_Memory + 0x16);
      uVar14 = uVar17;
      lVar7 = local_res10;
      do {
        uVar19 = uVar14;
        if ((*(uint *)(lVar7 + 0x10) - 1 < (uint)puVar12[-1]) ||
           ((uint)*puVar12 < *(uint *)(lVar7 + 0x10))) {
          if ((iVar15 == 0) && (*(void **)(puVar12 + 9) != (void *)0x0)) {
            free(*(void **)(puVar12 + 9));
            lVar7 = local_res10;
          }
        }
        else {
          if (iVar15 == 0) {
            uVar3 = *(undefined8 *)(puVar12 + -7);
            puVar8 = (undefined8 *)((ulonglong)*param_8 * 0x38 + *param_7);
            *puVar8 = *(undefined8 *)(puVar12 + -0xb);
            puVar8[1] = uVar3;
            uVar3 = *(undefined8 *)(puVar12 + 1);
            puVar8[2] = *(undefined8 *)(puVar12 + -3);
            puVar8[3] = uVar3;
            uVar3 = *(undefined8 *)(puVar12 + 9);
            puVar8[4] = *(undefined8 *)(puVar12 + 5);
            puVar8[5] = uVar3;
            puVar8[6] = *(undefined8 *)(puVar12 + 0xd);
            if (*(uint *)(lVar7 + 0x10) <= (uint)*(ushort *)(puVar8 + 3)) {
              *(undefined4 *)((longlong)puVar8 + 0x1c) = 0;
            }
            iVar5 = (uint)*(ushort *)((longlong)puVar8 + 0x14) - *(int *)(param_1 + 0x24);
            if (iVar5 < 1) {
              iVar5 = 0;
            }
            *(short *)((longlong)puVar8 + 0x14) = (short)iVar5;
            iVar5 = (uint)*(ushort *)((longlong)puVar8 + 0x16) - *(int *)(param_1 + 0x24);
            if (iVar5 < 1) {
              iVar5 = 0;
            }
            *(short *)((longlong)puVar8 + 0x16) = (short)iVar5;
            iVar5 = (uint)*(ushort *)(puVar8 + 3) - *(int *)(param_1 + 0x24);
            *puVar8 = 0;
            puVar8[1] = 0;
            if (iVar5 < 1) {
              iVar5 = 0;
            }
            *(short *)(puVar8 + 3) = (short)iVar5;
          }
          *param_8 = *param_8 + 1;
        }
        puVar12 = puVar12 + 0x1c;
        uVar14 = uVar19 - 1;
      } while (uVar14 != 0);
      sVar18 = uVar19 - 2;
    }
    if (iVar15 == 0) {
      _Dst = (void *)*param_7;
    }
    else {
      _Size = SUB168(ZEXT816(0x38) * ZEXT216(*param_8),0);
      if (SUB168(ZEXT816(0x38) * ZEXT216(*param_8),8) != 0) {
        _Size = sVar18;
      }
      _Dst = (void *)thunk_FUN_14061b650(_Size);
      if (_Dst == (void *)0x0) {
        _Dst = (void *)0x0;
        *param_7 = 0;
      }
      else {
        memset(_Dst,0,_Size);
        *param_7 = (longlong)_Dst;
      }
    }
    iVar4 = local_res20;
    iVar5 = local_res18;
    lVar7 = local_res10;
    iVar15 = iVar15 + -1;
  } while (-1 < iVar15);
  uVar10 = (undefined2)local_a4;
  FUN_14034df10(param_1,local_res10,local_a8 & 0xffff,uVar10,local_res18,local_res20,_Memory,
                &local_res8,_Dst,param_8);
  iVar6 = (int)local_res8;
  uVar17 = local_res8 & 0xffffffff;
  FUN_140350430(param_1,lVar7,local_98,local_a8 & 0xffff,uVar10,_Memory,local_res8 & 0xffffffff,
                iVar5,iVar4,param_9);
  puVar8 = _Memory;
  if (iVar6 != 0) {
    do {
      free((void *)*puVar8);
      uVar17 = uVar17 - 1;
      puVar8 = puVar8 + 7;
    } while (uVar17 != 0);
  }
  free(_Memory);
  iVar6 = local_res20;
  uVar11 = DAT_1409399a8;
  if (local_res18 <= local_res20) {
    do {
      iVar15 = DAT_140989fe4 + (local_res18 - *(int *)(lVar7 + 0xc));
      uVar17 = (ulonglong)iVar15;
      lVar16 = (ulonglong)(uint)(iVar15 * 0x1d0) * 0xf8 + local_90;
      bVar21 = 2 < uVar11;
      uVar13 = (uint)bVar21;
      lVar7 = local_a0;
      local_res8 = uVar17;
      if (bVar21 < uVar11) {
        do {
          uVar19 = 0;
          uVar14 = uVar19;
          if (*(short *)(lVar7 + uVar17 * 2) != 0) {
            do {
              uVar17 = 0;
              while (bVar9 = (byte)uVar17, bVar9 < 8) {
                iVar6 = uVar13 - 1;
                if (iVar6 < 1) {
                  iVar6 = 0;
                }
                lVar7 = uVar19 + (longlong)iVar6 + uVar17 * 6;
                fVar1 = *(float *)(lVar16 + 0x14 + lVar7 * 4);
                if (0.0 < fVar1) {
                  dVar2 = pow((double)fVar1 / 32767.0,0.6020599913);
                  uVar17 = (ulonglong)(byte)(bVar9 + 1);
                  *(float *)(lVar16 + 0x14 + lVar7 * 4) = (float)dVar2 * 32767.0;
                }
                else {
                  uVar17 = (ulonglong)(byte)(bVar9 + 1);
                  *(undefined4 *)(lVar16 + 0x14 + lVar7 * 4) = 0;
                }
              }
              uVar20 = (int)uVar14 + 1;
              uVar19 = uVar19 + 0x3e;
              lVar7 = local_a0;
              uVar17 = local_res8;
              uVar14 = (ulonglong)uVar20;
              uVar11 = DAT_1409399a8;
            } while ((int)uVar20 < (int)(uint)*(ushort *)(local_a0 + local_res8 * 2));
          }
          bVar21 = bVar21 + 1;
          uVar13 = (uint)bVar21;
          iVar6 = local_res20;
        } while (uVar13 < uVar11);
      }
      local_res18 = local_res18 + 1;
      lVar7 = local_res10;
    } while (local_res18 <= iVar6);
  }
  free(local_98);
  return;
}

