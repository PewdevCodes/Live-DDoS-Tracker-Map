
export function getNextDelayMs(
  ratePerSecond: number
): number {
  if ( !Number.isFinite(ratePerSecond) || ratePerSecond <= 0) {
    throw new Error(
      "ratePerSecond must be a positive finite number."
    );
  }

  const random = Math.random();

  return (
    (-Math.log(1 - random) / ratePerSecond) * 1000
  );
}
