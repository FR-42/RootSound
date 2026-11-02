
/* WARNING: Type propagation algorithm not settling */

int FUN_1403492f0(undefined8 param_1,undefined8 param_2,undefined8 param_3,ushort param_4,
                 void *param_5,undefined2 param_6,int param_7,int param_8,char param_9,
                 longlong param_10,int param_11,int param_12)

{
  bool bVar1;
  undefined1 auVar2 [16];
  undefined2 uVar3;
  int iVar4;
  char cVar5;
  longlong lVar6;
  int iVar7;
  float fVar8;
  char cVar9;
  int iVar10;
  undefined8 uVar11;
  undefined2 uVar12;
  int iVar13;
  undefined2 uVar14;
  undefined2 uVar15;
  float fVar16;
  float *pfVar17;
  undefined1 local_88 [4];
  undefined2 local_84 [2];
  float local_80 [2];
  void *local_78;
  ulonglong local_70;
  
  uVar15 = param_6;
  local_70 = CONCAT62(0,param_4);
  auVar2._8_8_ = 0;
  auVar2._0_8_ = local_70;
  uVar11 = SUB168(ZEXT816(4) * auVar2,0);
  if (SUB168(ZEXT816(4) * auVar2,8) != 0) {
    uVar11 = 0xffffffffffffffff;
  }
  local_78 = (void *)thunk_FUN_14061b650(uVar11);
  iVar7 = param_11;
  lVar6 = param_10;
  cVar5 = param_9;
  iVar4 = param_8;
  local_80[1] = 0.0;
  local_88[0] = 1;
  fVar16 = 0.0;
  iVar13 = param_7;
  uVar14 = uVar15;
LAB_14034939a:
  do {
    if (iVar4 < 1) {
      bVar1 = iVar7 - DAT_140989fe4 <= iVar13;
    }
    else {
      bVar1 = iVar13 <= param_12;
    }
    if (!bVar1) {
LAB_1403495b6:
      free(local_78);
      return iVar13 - iVar4;
    }
    pfVar17 = local_80;
    cVar9 = FUN_14034c020(param_1,param_2,&param_6,iVar13,param_7,param_3,param_4,param_5,&param_8,
                          local_84,pfVar17,uVar15,uVar14,cVar5,iVar7,lVar6);
    fVar8 = local_80[0];
    uVar3 = param_6;
    if (cVar9 == '\0') goto LAB_1403495b6;
    if (cVar5 == '\0') {
      iVar10 = FUN_14034c2b0(param_1,param_2,param_3,param_4,param_5,local_78,param_6,param_7,iVar13
                             ,iVar4,(ulonglong)pfVar17 & 0xffffffffffffff00,lVar6,
                             local_80[0] - fVar16,local_80 + 1,local_88,iVar7,param_12);
      if (iVar10 != -1) {
        iVar13 = iVar10 + iVar4;
        goto LAB_14034939a;
      }
    }
    uVar14 = local_84[0];
    uVar15 = (undefined2)param_8;
    if (((lVar6 != 0) && (*(float *)(lVar6 + 0x1c) <= fVar8 && fVar8 != *(float *)(lVar6 + 0x1c)))
       && (iVar7 <= iVar13)) {
      *(float *)(lVar6 + 0x1c) = fVar8;
      uVar12 = (undefined2)iVar13;
      *(undefined2 *)(lVar6 + 0x16) = uVar12;
      *(undefined2 *)(lVar6 + 0x14) = uVar12;
      *(undefined2 *)(lVar6 + 0x18) = uVar12;
      *(undefined2 *)(lVar6 + 0x1a) = uVar3;
      *(undefined2 *)(lVar6 + 0x10) = (undefined2)param_8;
      *(undefined2 *)(lVar6 + 0x12) = local_84[0];
      *(undefined1 *)(lVar6 + 0x20) = 0;
      *(undefined4 *)(lVar6 + 0x24) = 0;
      *(undefined2 *)(lVar6 + 0x22) = 0;
      *(undefined8 *)(lVar6 + 0x28) = 0;
      *(undefined4 *)(lVar6 + 0x30) = 0;
      if (cVar5 == '\0') {
        memcpy(*(void **)(lVar6 + 8),param_5,local_70 * 4);
      }
    }
    iVar13 = iVar13 + iVar4;
    fVar16 = fVar8;
  } while( true );
}

