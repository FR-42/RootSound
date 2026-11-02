
undefined8 FUN_140382b40(longlong param_1,undefined1 param_2)

{
  undefined8 uVar1;
  
  switch(param_2) {
  case 2:
  case 3:
    return 0x22;
  default:
    return 0;
  case 0x10:
    return 0x1f;
  case 0x11:
    return 0x20;
  case 0x12:
    return 0x21;
  case 0x40:
    return 1;
  case 0x7e:
    uVar1 = 0;
    if (*(short *)(param_1 + 0x14) == 0) {
      uVar1 = 0x21;
    }
    break;
  case 0x7f:
    uVar1 = 0x14;
    if (*(short *)(param_1 + 0x14) == 0) {
      uVar1 = 0x21;
    }
    return uVar1;
  case 0x80:
    uVar1 = 0x13;
    if (*(short *)(param_1 + 0x14) == 0) {
      uVar1 = 0x21;
    }
    return uVar1;
  }
  return uVar1;
}

