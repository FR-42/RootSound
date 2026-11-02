
float FUN_140351580(int param_1)

{
  double dVar1;
  
  switch(param_1) {
  case 0:
    return 1.0;
  default:
    dVar1 = pow(10.0,(double)param_1 / 20.0);
    return (float)dVar1;
  case 3:
    return 1.4125376;
  case 6:
    return 1.9952623;
  case 9:
    return 2.818383;
  case 0xc:
    return 3.9810717;
  case 0xf:
    return 5.623413;
  }
}

