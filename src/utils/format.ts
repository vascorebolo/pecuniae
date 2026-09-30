const formatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'EUR',
});

export const formatMoney = (cents: number) => formatter.format(cents / 100);

export const getToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};
