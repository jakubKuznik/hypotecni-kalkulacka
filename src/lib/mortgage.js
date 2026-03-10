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

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
  const normalizedPrincipal = toNumber(principal);
  const normalizedAnnualRate = toNumber(annualRate);
  const normalizedYears = toNumber(years);
  const normalizedPaymentsPerYear = toNumber(paymentsPerYear);
  const normalizedFixationYears = toNumber(fixationYears);
  const normalizedTotalPayments = normalizedYears * normalizedPaymentsPerYear;

  if (normalizedTotalPayments <= 0 || normalizedPaymentsPerYear <= 0) {
    return {
      payment: 0,
      totalPayments: 0,
      totalPaid: 0,
      totalInterest: 0,
      fixationInterestPaid: 0,
      fixationPrincipalPaid: 0,
      fixationTotalPaid: 0,
      remainingAfterFixation: normalizedPrincipal,
      fixationEndDate: firstPaymentDate,
      schedule: [],
      intervalLabel: `${normalizedPaymentsPerYear}x rocne`
    };
  }

  const periodicRate = normalizedAnnualRate / 100 / normalizedPaymentsPerYear;
  const monthsBetweenPayments = 12 / normalizedPaymentsPerYear;
  const fixationPayments = Math.min(
    normalizedTotalPayments,
    normalizedFixationYears * normalizedPaymentsPerYear
  );
  const startDate = new Date(`${firstPaymentDate}T00:00:00`);

  const payment =
    periodicRate === 0
      ? normalizedPrincipal / normalizedTotalPayments
      : (normalizedPrincipal * periodicRate) /
        (1 - Math.pow(1 + periodicRate, -normalizedTotalPayments));

  let balance = normalizedPrincipal;
  let totalInterest = 0;
  let fixationInterestPaid = 0;
  let fixationPrincipalPaid = 0;
  const schedule = [];
  let remainingAfterFixation = normalizedPrincipal;
  let fixationEndDate = firstPaymentDate;

  for (let index = 1; index <= normalizedTotalPayments; index += 1) {
    const interest = balance * periodicRate;
    const principalPart = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    const paymentDate = addMonths(startDate, (index - 1) * monthsBetweenPayments);

    if (index <= fixationPayments) {
      fixationInterestPaid += interest;
      fixationPrincipalPaid += principalPart;
      schedule.push({
        index,
        date: formatDate(paymentDate),
        payment,
        interest,
        principal: principalPart,
        balance
      });
    }

    if (index === fixationPayments) {
      remainingAfterFixation = balance;
      fixationEndDate = formatDate(paymentDate);
    }
  }

  return {
    payment,
    totalPayments: normalizedTotalPayments,
    totalPaid: payment * normalizedTotalPayments,
    totalInterest,
    fixationInterestPaid,
    fixationPrincipalPaid,
    fixationTotalPaid: fixationInterestPaid + fixationPrincipalPaid,
    remainingAfterFixation,
    fixationEndDate,
    schedule,
    intervalLabel:
      intervalOptions.find((option) => option.value === normalizedPaymentsPerYear)?.label ??
      `${normalizedPaymentsPerYear}x rocne`
  };
}

export function calculateInvestment({
  contribution,
  annualReturn,
  years = 30,
  contributionsPerYear = 12
}) {
  const normalizedContribution = toNumber(contribution);
  const normalizedAnnualReturn = toNumber(annualReturn);
  const normalizedYears = toNumber(years);
  const normalizedContributionsPerYear = toNumber(contributionsPerYear);
  const totalContributions = normalizedYears * normalizedContributionsPerYear;
  const periodicRate =
    normalizedAnnualReturn / 100 / normalizedContributionsPerYear;
  let balance = 0;

  for (let index = 0; index < totalContributions; index += 1) {
    balance = balance * (1 + periodicRate) + normalizedContribution;
  }

  const investedPrincipal = normalizedContribution * totalContributions;

  return {
    futureValue: balance,
    investedPrincipal,
    profit: balance - investedPrincipal,
    totalContributions,
    years: normalizedYears
  };
}
