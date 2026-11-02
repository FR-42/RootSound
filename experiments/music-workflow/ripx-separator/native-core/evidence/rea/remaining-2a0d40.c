
float FUN_1402a0d40(int param_1)

{
  double dVar1;
  
  switch(param_1) {
  case 0:
    return 1.0;
  case 5:
    return 1.7782794;
  case 10:
    return 3.1622777;
  case 0xf:
    return 5.623413;
  case 0x14:
    return 10.0;
  case -0x3c:
    return 0.001;
  default:
    dVar1 = pow(10.0,(double)param_1 / 20.0);
    return (float)dVar1;
  case -0x37:
    return 0.0017782794;
  case -0x32:
    return 0.0031622776;
  case -0x2d:
    return 0.0056234132;
  case -0x28:
    return 0.01;
  case -0x23:
    return 0.017782794;
  case -0x1e:
    return 0.031622775;
  case -0x19:
    return 0.056234132;
  case -0x14:
    return 0.1;
  case -0xf:
    return 0.17782794;
  case -10:
    return 0.31622776;
  case -5:
    return 0.56234133;
  }
}

