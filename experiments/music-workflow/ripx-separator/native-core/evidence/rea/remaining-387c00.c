
float FUN_140387c00(float param_1)

{
  if (4.0 < param_1) {
    return 0.0;
  }
  if (param_1 <= 1.0) {
    return 1.0 - param_1 / 100.0;
  }
  if (param_1 <= 3.0) {
    return 0.99 - (param_1 - 1.0) / 22.0;
  }
  return 0.9 - (param_1 - 3.0) / 12.0;
}

