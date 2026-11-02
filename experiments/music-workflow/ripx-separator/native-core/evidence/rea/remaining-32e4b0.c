
void FUN_14032e4b0(longlong param_1,int *param_2,int param_3,undefined8 param_4,undefined2 param_5)

{
  longlong lVar1;
  longlong lVar2;
  int iVar3;
  int *piVar4;
  int iVar5;
  int iVar6;
  longlong lVar7;
  
  WaitForSingleObject(*(HANDLE *)(param_1 + 0x58),0xffffffff);
  piVar4 = *(int **)(param_1 + 0x60);
  if (piVar4 != (int *)0x0) {
    do {
      if ((*piVar4 == *param_2) && (piVar4[1] == param_2[2])) {
        lVar1 = *(longlong *)(param_2 + 0x166);
        lVar2 = *(longlong *)(param_2 + 0x168);
        iVar5 = param_2[4] - DAT_140989fe4;
        iVar6 = iVar5;
        for (lVar7 = (longlong)iVar5; lVar7 < param_3; lVar7 = lVar7 + 1) {
          iVar3 = DAT_140989fe4 + (iVar6 - param_2[3]);
          memcpy((void *)((ulonglong)(uint)((iVar6 - iVar5) * 0x1d0) * 0xf8 +
                         *(longlong *)(piVar4 + 0xe)),
                 (void *)((ulonglong)(uint)(iVar3 * 0x1d0) * 0xf8 + lVar1),
                 (ulonglong)*(ushort *)(lVar2 + (longlong)iVar3 * 2) * 0xf8);
          iVar6 = iVar6 + 1;
          *(undefined2 *)(*(longlong *)(piVar4 + 0x10) + (lVar7 - iVar5) * 2) =
               *(undefined2 *)(lVar2 + (longlong)iVar3 * 2);
        }
        iVar6 = param_3 - iVar5;
        if (param_3 <= iVar5) {
          iVar6 = 0;
        }
        piVar4[9] = iVar6;
        if (*(void **)(piVar4 + 0x16) != (void *)0x0) {
          free(*(void **)(piVar4 + 0x16));
        }
        *(undefined2 *)(piVar4 + 0x18) = param_5;
        *(undefined8 *)(piVar4 + 0x16) = param_4;
        piVar4[2] = 5;
        break;
      }
      piVar4 = *(int **)(piVar4 + 0x25822);
    } while (piVar4 != (int *)0x0);
  }
                    /* WARNING: Could not recover jumptable at 0x00014032e63d. Too many branches */
                    /* WARNING: Treating indirect jump as call */
  ReleaseMutex(*(HANDLE *)(param_1 + 0x58));
  return;
}

