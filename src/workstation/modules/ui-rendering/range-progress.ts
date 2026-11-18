export function paintRangeProgress(input: HTMLInputElement): void {
  const min = Number(input.min);
  const progress = (Number(input.value) - min) / (Number(input.max) - min);
  input.style.setProperty('--range-progress', String(progress));
}
