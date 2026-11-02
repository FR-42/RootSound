
float FUN_140351660(int param_1)

{
  double dVar1;
  
  if (param_1 == 0) {
    return 1.0;
  }
  if (param_1 != 7) {
    if (param_1 != 0xe) {
      dVar1 = pow(10.0,(double)param_1 / 20.0);
      return (float)dVar1;
    }
    return 5.0118723;
  }
  return 2.2387211;
}

