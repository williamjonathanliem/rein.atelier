// All amounts in IDR
// EXTENSIBLE: move rates to settings table if dynamic pricing is needed later

export const SHIPPING_RATES: Record<string, Record<string, number>> = {
  barat: {
    barat:   10_000,
    pusat:   15_000,
    selatan: 20_000,
  },
  tengah: {
    tengah:  10_000,
    timur:   15_000,
    selatan: 20_000,
  },
}

export function calculateShipping(
  deliveryType: 'pickup' | 'delivery',
  origin?: string,
  destination?: string
): number {
  if (deliveryType === 'pickup') return 0
  if (!origin || !destination) return 0
  return SHIPPING_RATES[origin]?.[destination] ?? 0
}

export function getDestinationOptions(origin: 'barat' | 'tengah'): string[] {
  return Object.keys(SHIPPING_RATES[origin] ?? {})
}

export const AREA_LABELS: Record<string, string> = {
  barat:   'Surabaya Barat',
  pusat:   'Surabaya Pusat',
  selatan: 'Surabaya Selatan',
  tengah:  'Surabaya Tengah',
  timur:   'Surabaya Timur',
}
