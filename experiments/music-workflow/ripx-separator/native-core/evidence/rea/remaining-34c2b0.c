
int FUN_14034c2b0(undefined8 param_1,undefined8 param_2,longlong param_3,ushort param_4,
                 longlong param_5,undefined4 *param_6,ushort param_7,int param_8,int param_9,
                 int param_10,undefined1 param_11,undefined8 param_12,float param_13,float *param_14
                 ,char *param_15,int param_16,int param_17)

{
  float fVar1;
  bool bVar2;
  int iVar3;
  ushort uVar4;
  ushort uVar5;
  undefined4 *puVar6;
  float fVar7;
  float fVar8;
  float fVar9;
  
  if (param_9 != param_8) {
    if (((0 < param_10) && (param_8 + 1 < param_9)) || ((param_10 < 0 && (param_9 < param_8 + -1))))
    {
      fVar7 = *param_14;
      if (*param_15 == '\0') {
        if (fVar7 <= 8.0) {
          fVar7 = 8.0;
        }
        if (fVar7 < param_13) {
          fVar7 = *(float *)(param_5 + (ulonglong)param_7 * 4);
          fVar8 = *(float *)((longlong)
                             (int)((((DAT_140989fe4 - param_10) - param_16) + param_9) *
                                   (uint)param_4 + (uint)param_7) * 0x410 + param_3);
          fVar9 = fVar7;
          if (fVar7 < fVar8) {
            fVar9 = fVar8;
          }
          fVar1 = *(float *)((longlong)
                             (int)(((DAT_140989fe4 - param_16) + param_9) * (uint)param_4 +
                                  (uint)param_7) * 0x410 + param_3);
          if (fVar9 * DAT_140939688 < fVar1) {
            if (fVar8 <= fVar7) {
              fVar8 = fVar7;
            }
            if (fVar8 + 2.0 < fVar1) {
              puVar6 = param_6;
              uVar4 = 0;
              if (param_4 != 0) {
                do {
                  uVar5 = uVar4 + 1;
                  *puVar6 = *(undefined4 *)
                             ((longlong)
                              (int)((uint)uVar4 +
                                   (((DAT_140989fe4 - param_10) - param_16) + param_9) *
                                   (uint)param_4) * 0x410 + param_3);
                  puVar6 = puVar6 + 1;
                  uVar4 = uVar5;
                } while (uVar5 < param_4);
              }
              iVar3 = FUN_1403492f0(param_1,param_2,param_3,param_4,param_6,param_7,param_9,param_10
                                    ,param_11,param_12,param_16,param_17);
              if (((0 < param_10) && (param_9 <= iVar3)) || ((param_10 < 0 && (iVar3 <= param_9))))
              {
                while( true ) {
                  if (param_10 < 1) {
                    bVar2 = param_16 - DAT_140989fe4 <= iVar3;
                  }
                  else {
                    bVar2 = iVar3 <= param_17;
                  }
                  if (!bVar2) break;
                  fVar7 = *(float *)(param_5 + (ulonglong)param_7 * 4);
                  fVar8 = *(float *)((longlong)
                                     (int)(((DAT_140989fe4 - param_16) + iVar3) * (uint)param_4 +
                                          (uint)param_7) * 0x410 + param_3);
                  if ((fVar8 <= fVar7 * DAT_140939688) || (fVar8 <= fVar7 + 2.0)) break;
                  iVar3 = iVar3 + param_10;
                }
                *param_14 = param_13;
                return iVar3;
              }
            }
          }
        }
      }
      else if (param_13 < fVar7) {
        *param_15 = '\0';
      }
    }
    *param_14 = param_13;
  }
  return -1;
}

