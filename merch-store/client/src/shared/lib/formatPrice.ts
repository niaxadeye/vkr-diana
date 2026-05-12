export function formatPrice(value: number, currency = "₽") {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ${currency}`;
}