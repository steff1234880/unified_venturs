/**
 * Converts a numeric Indian Rupee amount into words according to Indian numbering system.
 */
export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Rupees Only'

  const singleDigits = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
  ]
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ]
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ]

  function convertTwoDigits(n: number): string {
    if (n === 0) return ''
    if (n < 10) return singleDigits[n] || ''
    if (n < 20) return teens[n - 10] || ''
    const ten = Math.floor(n / 10)
    const unit = n % 10
    const prefix = tens[ten] || ''
    const suffix = unit > 0 ? singleDigits[unit] || '' : ''
    return suffix ? `${prefix} ${suffix}` : prefix
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100)
    const rest = n % 100
    if (hundred > 0 && rest > 0) {
      return `${singleDigits[hundred]} Hundred and ${convertTwoDigits(rest)}`
    }
    if (hundred > 0) {
      return `${singleDigits[hundred]} Hundred`
    }
    return convertTwoDigits(rest)
  }

  const rounded = Math.floor(amount)
  const paise = Math.round((amount - rounded) * 100)

  let n = rounded
  let words = ''

  const crore = Math.floor(n / 10000000)
  n %= 10000000

  const lakh = Math.floor(n / 100000)
  n %= 100000

  const thousand = Math.floor(n / 1000)
  n %= 1000

  const hundred = n

  if (crore > 0) {
    words += `${convertTwoDigits(crore)} Crore `
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} Lakh `
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} Thousand `
  }
  if (hundred > 0) {
    words += `${convertThreeDigits(hundred)} `
  }

  words = words.trim() + ' Rupees'

  if (paise > 0) {
    words += ` and ${convertTwoDigits(paise)} Paise`
  }

  return `${words} Only`
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val)
}
