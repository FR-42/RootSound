
float FUN_1403516c0(int param_1)

{
  double dVar1;
  
  if (param_1 == -2) {
    return 0.7943282;
  }
  if (param_1 != -1) {
    if (param_1 != 0) {
      dVar1 = pow(10.0,(double)param_1 / 20.0);
      return (float)dVar1;
    }
    return 1.0;
  }
  return 0.8912509;
}

