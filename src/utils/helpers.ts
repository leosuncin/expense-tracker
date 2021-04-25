export function dollarsToCents(dollars: number) {
  return dollars * 100;
}

export function centsToDollars(cents: number) {
  return Number((cents / 100).toFixed(2));
}
