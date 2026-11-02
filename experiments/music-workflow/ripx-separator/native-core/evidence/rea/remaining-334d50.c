
/* WARNING: Function: __security_check_cookie replaced with injection: security_check_cookie */

void FUN_140334d50(longlong param_1,longlong param_2,ushort *param_3,longlong *param_4,
                  ushort *param_5,undefined8 param_6,byte param_7)

{
  longlong lVar1;
  undefined8 *puVar2;
  float fVar3;
  undefined4 *puVar4;
  undefined8 uVar5;
  byte bVar6;
  byte bVar7;
  longlong lVar8;
  uint uVar9;
  uint uVar10;
  ulonglong uVar11;
  undefined1 *puVar12;
  int iVar13;
  int iVar14;
  uint uVar15;
  uint uVar16;
  ulonglong uVar17;
  ulonglong uVar18;
  ushort uVar19;
  longlong lVar20;
  int iVar21;
  char cVar22;
  bool bVar23;
  float fVar24;
  undefined1 auStack_268 [32];
  uint local_248;
  int local_244;
  ushort *local_240;
  longlong local_238;
  longlong local_228 [48];
  ulonglong local_a8;
  
  local_a8 = DAT_140972168 ^ (ulonglong)auStack_268;
  uVar18 = 0;
  *param_5 = 0;
  local_248 = 0;
  local_240 = param_3;
  local_238 = param_1;
  bVar6 = DAT_140989f20;
  do {
    if (bVar6 == 0) {
      return;
    }
    uVar19 = *param_5;
    local_244 = 0;
    do {
      if (param_7 == 0) {
        if (*(short *)(param_1 + 0x14) == 0) {
          if (local_244 == 0) {
LAB_140334ef2:
            cVar22 = '~';
            goto LAB_140334ef5;
          }
          if (local_244 != 1) {
            if (local_244 == 2) {
              cVar22 = '\x12';
              goto LAB_140334ef5;
            }
            break;
          }
        }
        else {
          if (local_244 == 0) goto LAB_140334ef2;
          if (local_244 != 1) break;
        }
        cVar22 = '\x02';
      }
      else if (param_7 == 1) {
        if (local_244 != 0) {
          if (local_244 == 1) goto LAB_140334eb2;
          break;
        }
        cVar22 = '\x10';
      }
      else {
        if (5 < (byte)(param_7 - 2)) break;
        if (*(char *)(param_1 + 0x92) == '\0') {
          if (*(short *)(param_1 + 0x14) == 0) {
            if (local_244 == 0) {
LAB_140334eb2:
              cVar22 = '\x11';
            }
            else {
              if (local_244 != 1) break;
              cVar22 = '\x12';
            }
          }
          else {
            if (local_244 == 0) goto LAB_140334eb2;
            if (local_244 != 1) break;
            cVar22 = '@';
          }
        }
        else {
          cVar22 = '@';
          if (local_244 != 0) break;
        }
      }
LAB_140334ef5:
      local_244 = local_244 + 1;
      while( true ) {
        uVar17 = 0;
        iVar21 = 0;
        fVar24 = 0.0;
        iVar13 = -1;
        uVar19 = 0;
        if (*param_3 == 0) break;
        do {
          uVar16 = (uint)uVar17;
          lVar8 = (ulonglong)uVar19 * 0xf8;
          lVar1 = lVar8 + param_2;
          if ((((float)(&DAT_140989f24)[uVar18 * 4] - 0.001 <= *(float *)(lVar8 + param_2)) &&
              (*(float *)(lVar8 + param_2) < (float)(&DAT_140989f28)[uVar18 * 4] - 0.001)) &&
             (uVar11 = (ulonglong)param_7, *(char *)(lVar8 + uVar11 + 0xd0 + param_2) == cVar22)) {
            lVar8 = (ulonglong)uVar19 * 0x3e + uVar11;
            iVar14 = *(int *)(param_2 + 0xd8 + lVar8 * 4);
            if ((iVar14 != -1) &&
               ((iVar13 == -1 || (bVar23 = iVar14 == iVar13, iVar14 = iVar13, bVar23)))) {
              *(undefined4 *)(param_2 + 0xd8 + lVar8 * 4) = 0xffffffff;
              iVar13 = iVar14;
              if (0x2f < uVar16) break;
              fVar24 = fVar24 + *(float *)(lVar1 + 8);
              local_228[uVar17] = lVar1;
              if (DAT_1409399a8 == 1) {
                fVar3 = *(float *)(lVar1 + 0x14 + uVar11 * 0x18);
              }
              else {
                fVar3 = (*(float *)(lVar1 + 0x18 + uVar11 * 0x18) +
                        *(float *)(lVar1 + 0x14 + uVar11 * 0x18)) * 0.5;
              }
              uVar17 = (ulonglong)(uVar16 + 1);
              if (0.5 <= fVar3) {
                iVar21 = iVar21 + 1;
              }
            }
          }
          uVar16 = (uint)uVar17;
          uVar19 = uVar19 + 1;
        } while (uVar19 < *param_3);
        if (iVar21 == 0) break;
        uVar19 = *param_5;
        if (0x5f < uVar19) goto LAB_1403353c7;
        memset((void *)((ulonglong)uVar19 * 0x3c18 + *param_4),0,0x3c18);
        *(float *)((ulonglong)*param_5 * 0x3c18 + 8 + *param_4) = fVar24;
        if ((0xbf < (&DAT_140989f20)[uVar18 * 0x10]) && (uVar9 = 0, DAT_140989f20 != 0)) {
          puVar12 = &DAT_140989f20;
          bVar6 = DAT_140989f20;
          do {
            if (bVar6 == (&DAT_140989f20)[uVar18 * 0x10]) {
              if ((puVar12 != (undefined1 *)0x0) &&
                 (fVar24 = ((*(float *)(puVar12 + 8) - *(float *)(puVar12 + 4)) /
                           *(float *)(puVar12 + 0xc)) * 0.0 + *(float *)(puVar12 + 4),
                 fVar24 < *(float *)(puVar12 + 8))) goto LAB_1403350c8;
              break;
            }
            uVar9 = uVar9 + 1;
            puVar12 = &DAT_140989f20 + (ulonglong)uVar9 * 0x10;
            bVar6 = (&DAT_140989f20)[(ulonglong)uVar9 * 0x10];
          } while (bVar6 != 0);
        }
        fVar24 = 0.0;
LAB_1403350c8:
        *(float *)((ulonglong)*param_5 * 0x3c18 + *param_4) = fVar24;
        *(undefined2 *)((ulonglong)*param_5 * 0x3c18 + 0xe + *param_4) =
             *(undefined2 *)(local_228[0] + 0xce);
        *(char *)((ulonglong)*param_5 * 0x3c18 + 0xc + *param_4) = cVar22;
        *(int *)((ulonglong)*param_5 * 0x3c18 + 0x10 + *param_4) = iVar13;
        uVar15 = 0;
        uVar9 = uVar15;
        if ((int)(longlong)(float)(&DAT_140989f2c)[uVar18 * 4] != 0) {
          do {
            if ((0xbf < (&DAT_140989f20)[uVar18 * 0x10]) && (DAT_140989f20 != 0)) {
              puVar12 = &DAT_140989f20;
              uVar10 = uVar15;
              bVar6 = DAT_140989f20;
              do {
                if (bVar6 == (&DAT_140989f20)[uVar18 * 0x10]) {
                  if ((puVar12 != (undefined1 *)0x0) &&
                     (fVar24 = ((*(float *)(puVar12 + 8) - *(float *)(puVar12 + 4)) /
                               *(float *)(puVar12 + 0xc)) * (float)uVar9 + *(float *)(puVar12 + 4),
                     fVar24 < *(float *)(puVar12 + 8))) goto LAB_14033519f;
                  break;
                }
                uVar10 = uVar10 + 1;
                puVar12 = &DAT_140989f20 + (ulonglong)uVar10 * 0x10;
                bVar6 = (&DAT_140989f20)[(ulonglong)uVar10 * 0x10];
              } while (bVar6 != 0);
            }
            fVar24 = 0.0;
LAB_14033519f:
            *(float *)((ulonglong)*param_5 * 0x3c18 + (ulonglong)uVar9 * 0x13c + 0xd8 + *param_4) =
                 fVar24;
            *(float *)((ulonglong)*param_5 * 0x3c18 + (ulonglong)uVar9 * 0x13c + 0x20c + *param_4) =
                 fVar24;
            uVar10 = uVar9 + 2;
            uVar9 = uVar9 + 1;
          } while (uVar10 <= (uint)(longlong)(float)(&DAT_140989f2c)[uVar18 * 4]);
        }
        uVar17 = 0;
        bVar6 = DAT_140989f20;
        if (uVar16 != 0) {
          do {
            if ((0xbf < (&DAT_140989f20)[uVar18 * 0x10]) && (bVar6 != 0)) {
              puVar12 = &DAT_140989f20;
              uVar9 = uVar15;
              bVar7 = bVar6;
              do {
                if (bVar7 == (&DAT_140989f20)[uVar18 * 0x10]) {
                  if (((puVar12 != (undefined1 *)0x0) &&
                      (uVar9 = (uint)((*(float *)local_228[uVar17] - *(float *)(puVar12 + 4)) /
                                      ((*(float *)(puVar12 + 8) - *(float *)(puVar12 + 4)) /
                                      *(float *)(puVar12 + 0xc)) + 1.5), 0 < (int)uVar9)) &&
                     (uVar9 < 0x31)) goto LAB_14033528f;
                  break;
                }
                uVar9 = uVar9 + 1;
                puVar12 = &DAT_140989f20 + (ulonglong)uVar9 * 0x10;
                bVar7 = (&DAT_140989f20)[(ulonglong)uVar9 * 0x10];
              } while (bVar7 != 0);
            }
            uVar9 = uVar15;
LAB_14033528f:
            if ((ushort)((short)uVar9 - 1U) < 0x30) {
              puVar4 = (undefined4 *)local_228[uVar17];
              lVar20 = (ulonglong)(uVar9 & 0xffff) * 0x13c + -0x13c;
              *(undefined4 *)((ulonglong)*param_5 * 0x3c18 + lVar20 + 0x1a4 + *param_4) = puVar4[2];
              *(undefined1 *)((ulonglong)*param_5 * 0x3c18 + lVar20 + 0x1cb + *param_4) = 0;
              *(undefined4 *)((ulonglong)*param_5 * 0x3c18 + lVar20 + 0xd8 + *param_4) = *puVar4;
              uVar5 = *(undefined8 *)(puVar4 + 5);
              lVar1 = *param_4;
              lVar8 = (ulonglong)*param_5 * 0x3c18 + lVar20;
              puVar2 = (undefined8 *)(lVar8 + 0x1fc + lVar1);
              *puVar2 = *(undefined8 *)(puVar4 + 3);
              puVar2[1] = uVar5;
              *(undefined8 *)(lVar8 + 0x20c + lVar1) = *(undefined8 *)(puVar4 + 7);
              lVar1 = *param_4;
              *(undefined4 *)((ulonglong)*param_5 * 0x3c18 + lVar20 + 0x204 + lVar1) =
                   puVar4[(ulonglong)param_7 * 6 + 5];
              *(undefined4 *)((ulonglong)*param_5 * 0x3c18 + lVar20 + 0x208 + lVar1) =
                   puVar4[(ulonglong)param_7 * 6 + 6];
              *(undefined2 *)((ulonglong)*param_5 * 0x3c18 + lVar20 + 0x1c8 + lVar1) =
                   *(undefined2 *)((longlong)puVar4 + 0xce);
              bVar6 = DAT_140989f20;
            }
            uVar19 = (short)uVar17 + 1;
            uVar17 = (ulonglong)uVar19;
          } while (uVar19 < uVar16);
        }
        *param_5 = *param_5 + 1;
        uVar18 = (ulonglong)local_248;
        param_3 = local_240;
      }
      uVar19 = *param_5;
LAB_1403353c7:
      uVar18 = (ulonglong)local_248;
      param_1 = local_238;
    } while (uVar19 != 0x60);
    if (uVar19 == 0x60) {
      return;
    }
    local_248 = (int)uVar18 + 1;
    uVar18 = (ulonglong)local_248;
    bVar6 = (&DAT_140989f20)[uVar18 * 0x10];
  } while( true );
}

