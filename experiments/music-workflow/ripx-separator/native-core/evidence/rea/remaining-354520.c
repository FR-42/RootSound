
ulonglong FUN_140354520(PUCHAR param_1,ULONG param_2,PUCHAR param_3)

{
  NTSTATUS NVar1;
  undefined4 extraout_var;
  undefined4 extraout_var_00;
  PUCHAR _Memory;
  undefined1 local_res20 [8];
  ULONG local_48 [2];
  BCRYPT_ALG_HANDLE local_40;
  BCRYPT_HASH_HANDLE local_38;
  PUCHAR local_30 [2];
  longlong local_20;
  ulonglong uVar2;
  
  local_40 = (BCRYPT_HANDLE)0x0;
  local_38 = (BCRYPT_HASH_HANDLE)0x0;
  local_48[0] = 0;
  local_48[1] = 0;
  NVar1 = BCryptOpenAlgorithmProvider(&local_40,L"SHA256",(LPCWSTR)0x0,0);
  uVar2 = CONCAT44(extraout_var,NVar1);
  if (NVar1 != 0) {
LAB_14035459c:
    return uVar2 & 0xffffffffffffff00;
  }
  NVar1 = BCryptGetProperty(local_40,L"ObjectLength",(PUCHAR)local_48,4,local_48 + 1,0);
  if (NVar1 != 0) {
    NVar1 = BCryptCloseAlgorithmProvider(local_40,0);
    uVar2 = CONCAT44(extraout_var_00,NVar1);
    goto LAB_14035459c;
  }
  FUN_1401e75c0(local_30,local_48[0],local_res20);
  NVar1 = BCryptCreateHash(local_40,&local_38,local_30[0],local_48[0],(PUCHAR)0x0,0,0);
  if (NVar1 == 0) {
    NVar1 = BCryptHashData(local_38,param_1,param_2,0);
    if ((NVar1 == 0) && (NVar1 = BCryptFinishHash(local_38,param_3,0x20,0), NVar1 == 0)) {
      BCryptDestroyHash(local_38);
      BCryptCloseAlgorithmProvider(local_40,0);
      uVar2 = 1;
      goto LAB_140354635;
    }
    BCryptDestroyHash(local_38);
  }
  BCryptCloseAlgorithmProvider(local_40,0);
  uVar2 = 0;
LAB_140354635:
  if (local_30[0] == (PUCHAR)0x0) {
    return uVar2;
  }
  _Memory = local_30[0];
  if ((0xfff < (ulonglong)(local_20 - (longlong)local_30[0])) &&
     (_Memory = *(PUCHAR *)(local_30[0] + -8), (PUCHAR)0x1f < local_30[0] + (-8 - (longlong)_Memory)
     )) {
                    /* WARNING: Subroutine does not return */
    _invalid_parameter_noinfo_noreturn();
  }
  free(_Memory);
  return uVar2;
}

