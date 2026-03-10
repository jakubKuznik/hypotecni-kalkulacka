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

function calculatePayment(principal, annualRate, totalPayments, paymentsPerYear) {
  const periodicRate = annualRate / 100 / paymentsPerYear;

  if (totalPayments <= 0) {
    return 0;
  }

  if (periodicRate === 0) {
    return principal / totalPayments;
  }

  return (
    (principal * periodicRate) /
    (1 - Math.pow(1 + periodicRate, -totalPayments))
  );
}

function buildScheduleSegment({
  principal,
  annualRate,
  amortizationPayments,
  executedPayments,
  displayedPayments,
  paymentsPerYear,
  startDate,
  startIndex
}) {
  const payment = calculatePayment(
    principal,
    annualRate,
    amortizationPayments,
    paymentsPerYear
  );
  const periodicRate = annualRate / 100 / paymentsPerYear;
  const monthsBetweenPayments = 12 / paymentsPerYear;
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;
  const schedule = [];

  for (let offset = 0; offset < executedPayments; offset += 1) {
    const interest = balance * periodicRate;
    const principalPart = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    totalPrincipal += principalPart;

    if (offset < displayedPayments) {
      schedule.push({
        index: startIndex + offset,
        date: formatDate(addMonths(startDate, offset * monthsBetweenPayments)),
        payment,
        interest,
        principal: principalPart,
        balance
      });
    }
  }

  return {
    payment,
    totalInterest,
    totalPrincipal,
    totalPaid: payment * executedPayments,
    remainingBalance: balance,
    paymentsCount: executedPayments,
    displayedPayments,
    schedule,
    endDate:
      executedPayments > 0
        ? formatDate(addMonths(startDate, (executedPayments - 1) * monthsBetweenPayments))
        : formatDate(startDate)
  };
}

export function calculateMortgage({
  principal,
  annualRate,
  years,
  paymentsPerYear,
  fixationYears,
  firstPaymentDate,
  refinanceRate
}) {
  const totalPayments = years * paymentsPerYear;
  const fixationPayments = Math.min(totalPayments, fixationYears * paymentsPerYear);
  const remainingPayments = Math.max(0, totalPayments - fixationPayments);
  const startDate = new Date(`${firstPaymentDate}T00:00:00`);
  const firstSegment = buildScheduleSegment({
    principal,
    annualRate,
    amortizationPayments: totalPayments,
    executedPayments: fixationPayments,
    displayedPayments: fixationPayments,
    paymentsPerYear,
    startDate,
    startIndex: 1
  });

  const refinancePayments = Math.min(
    remainingPayments,
    fixationYears * paymentsPerYear
  );
  const refinanceStartDate = addMonths(startDate, (12 / paymentsPerYear) * fixationPayments);
  const normalizedRefinanceRate = Number.isFinite(refinanceRate)
    ? refinanceRate
    : annualRate;

  const refinanceSegment =
    remainingPayments > 0
      ? buildScheduleSegment({
          principal: firstSegment.remainingBalance,
          annualRate: normalizedRefinanceRate,
          amortizationPayments: remainingPayments,
          executedPayments: remainingPayments,
          displayedPayments: refinancePayments,
          paymentsPerYear,
          startDate: refinanceStartDate,
          startIndex: fixationPayments + 1
        })
      : null;

  const totalInterest =
    firstSegment.totalInterest +
    (refinanceSegment?.totalInterest ?? 0);
  const totalPaid =
    firstSegment.totalPaid +
    (refinanceSegment?.totalPaid ?? 0);

  return {
    payment: firstSegment.payment,
    refinancePayment: refinanceSegment?.payment ?? 0,
    totalPayments,
    totalPaid,
    totalInterest,
    fixationInterestPaid: firstSegment.totalInterest,
    fixationPrincipalPaid: firstSegment.totalPrincipal,
    fixationTotalPaid: firstSegment.totalPaid,
    remainingAfterFixation: firstSegment.remainingBalance,
    fixationEndDate: firstSegment.endDate,
    refinanceEndDate: refinanceSegment?.endDate ?? firstSegment.endDate,
    firstFixationSchedule: firstSegment.schedule,
    refinanceSchedule: refinanceSegment?.schedule ?? [],
    refinanceInterestPaid: refinanceSegment?.totalInterest ?? 0,
    refinancePrincipalPaid: refinanceSegment?.totalPrincipal ?? 0,
    refinanceTotalPaid: refinanceSegment?.totalPaid ?? 0,
    remainingYearsAfterFixation: remainingPayments / paymentsPerYear,
    intervalLabel:
      intervalOptions.find((option) => option.value === paymentsPerYear)?.label ??
      `${paymentsPerYear}x rocne`
  };
}
