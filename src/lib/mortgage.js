export const intervalOptions = [
  { value: 12, label: "mesicni (12)" },
  { value: 4, label: "ctvrtletni (4)" },
  { value: 2, label: "pulrocni (2)" },
  { value: 1, label: "rocni (1)" }
];

export const fixationOptions = [1, 2, 3, 5, 7, 10];

const currencyFormatter = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat("cs-CZ", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat("cs-CZ", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

export function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export function formatPercent(value) {
  return `${percentFormatter.format(value)} %`;
}

function addMonths(date, monthsToAdd) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  return nextDate;
}

function formatDate(date) {
  return dateFormatter.format(date);
}

export function calculateMortgage({
  principal,
  annualRate,
  years,
  paymentsPerYear,
  fixationYears,
  firstPaymentDate
}) {
  const totalPayments = years * paymentsPerYear;
  const periodicRate = annualRate / 100 / paymentsPerYear;
  const monthsBetweenPayments = 12 / paymentsPerYear;
  const fixationPayments = Math.min(totalPayments, fixationYears * paymentsPerYear);
  const startDate = new Date(`${firstPaymentDate}T00:00:00`);

  const payment =
    periodicRate === 0
      ? principal / totalPayments
      : (principal * periodicRate) /
        (1 - Math.pow(1 + periodicRate, -totalPayments));

  let balance = principal;
  let totalInterest = 0;
  const schedule = [];
  const previewRows = Math.min(totalPayments, 12);
  let remainingAfterFixation = principal;
  let fixationEndDate = firstPaymentDate;

  for (let index = 1; index <= totalPayments; index += 1) {
    const interest = balance * periodicRate;
    const principalPart = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    const paymentDate = addMonths(startDate, (index - 1) * monthsBetweenPayments);

    if (index === fixationPayments) {
      remainingAfterFixation = balance;
      fixationEndDate = formatDate(paymentDate);
    }

    if (index <= previewRows) {
      schedule.push({
        index,
        date: formatDate(paymentDate),
        payment,
        interest,
        principal: principalPart,
        balance
      });
    }
  }

  return {
    payment,
    totalPayments,
    totalPaid: payment * totalPayments,
    totalInterest,
    remainingAfterFixation,
    fixationEndDate,
    schedule,
    intervalLabel:
      intervalOptions.find((option) => option.value === paymentsPerYear)?.label ??
      `${paymentsPerYear}x rocne`
  };
}
