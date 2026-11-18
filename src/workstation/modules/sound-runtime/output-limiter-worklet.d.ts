export const OUTPUT_CEILING: number;
export const OUTPUT_LOOKAHEAD_SECONDS: number;

export class OutputPeakLimiter {
  readonly left: number;
  readonly right: number;
  readonly delayFrames: number;
  constructor(rate: number);
  push(left: number, right: number): void;
}
