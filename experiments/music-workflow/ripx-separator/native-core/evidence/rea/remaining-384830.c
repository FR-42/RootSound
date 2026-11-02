
undefined8 FUN_140384830(longlong param_1)

{
  if (*(char *)(param_1 + 0x96) == '\0') {
    return 0;
  }
  if (*(char *)(param_1 + 0x93) != '\0') {
    return 0x1e;
  }
  if (*(char *)(param_1 + 0x92) == '\0') {
    if (*(char *)(param_1 + 0x91) != '\0') {
      return 7;
    }
    if (*(char *)(param_1 + 0x94) != '\0') {
      return 3;
    }
    if (*(char *)(param_1 + 0x99) != '\0') {
      return 0x2e;
    }
    if (*(char *)(param_1 + 0x95) != '\0') {
      return 4;
    }
    if (DAT_1409399f8 != 2) {
      return 0;
    }
  }
  return 1;
}

