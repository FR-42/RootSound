
float FUN_1403514f0(int param_1)

{
  double dVar1;
  
  if (param_1 == 0) {
    return 1.0;
  }
  if (param_1 == 10) {
    return 3.1622777;
  }
  if (param_1 == 0x14) {
    return 10.0;
  }
  if (param_1 != 0x1e) {
    if (param_1 != 0x28) {
      dVar1 = pow(10.0,(double)param_1 / 20.0);
      return (float)dVar1;
    }
    return 100.0;
  }
  return 31.622776;
}

