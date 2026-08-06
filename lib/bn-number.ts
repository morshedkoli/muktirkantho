const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

function toBnDigits(input: string): string {
  return input.replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
}

/**
 * Render a number in Bangla digits.
 *
 * Done by hand rather than via `toLocaleString("bn-BD")` because that depends
 * on the runtime shipping full ICU data — it silently falls back to Latin
 * digits on a small-ICU build, which would leave the console counting in two
 * scripts at once.
 */
export function bnNumber(value: number): string {
  return toBnDigits(String(Math.trunc(value)));
}

/**
 * Grouped figure using the South Asian convention the paper's readers use:
 * three digits, then pairs — ১২,৩৪,৫৬৭ rather than ১,২৩৪,৫৬৭.
 */
export function bnCount(value: number): string {
  const digits = String(Math.trunc(Math.abs(value)));
  const sign = value < 0 ? "-" : "";

  if (digits.length <= 3) return sign + toBnDigits(digits);

  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return sign + toBnDigits(`${rest},${lastThree}`);
}
