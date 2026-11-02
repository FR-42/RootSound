
undefined4 FUN_1403883b0(float param_1)

{
  if (32767.0 <= param_1) {
    param_1 = 32767.0;
  }
  else if (param_1 <= 0.0) {
    return DAT_1549b10b0;
  }
  return (&DAT_1549b10b0)[(longlong)param_1 & 0xffffffff];
}

