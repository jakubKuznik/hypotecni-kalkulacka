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

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export function formatPercent(value) {
  return `${percentFormatter.format(value)} %`;
}

function simulateInvestment({ monthlyContribution, annualReturn, years }) {
  const normalizedContribution = toNumber(monthlyContribution);
  const normalizedReturn = toNumber(annualReturn);
  const normalizedYears = toNumber(years);
  const totalMonths = normalizedYears * 12;
  const monthlyRate = normalizedReturn / 100 / 12;
  let futureValue = 0;

  for (let index = 0; index < totalMonths; index += 1) {
    futureValue = futureValue * (1 + monthlyRate) + normalizedContribution;
  }

  const totalContributed = normalizedContribution * totalMonths;

  return {
    futureValue,
    totalContributed,
    profit: futureValue - totalContributed
  };
}

export function calculatePortfolioComparison({
  monthlyContribution,
  sp500Return,
  goldReturn,
  goldAllocation,
  years
}) {
  const normalizedContribution = toNumber(monthlyContribution);
  const normalizedGoldAllocation = toNumber(goldAllocation);
  const sp500Allocation = Math.max(0, 100 - normalizedGoldAllocation);
  const pureSp500 = simulateInvestment({
    monthlyContribution: normalizedContribution,
    annualReturn: sp500Return,
    years
  });
  const mixedSp500 = simulateInvestment({
    monthlyContribution: normalizedContribution * (sp500Allocation / 100),
    annualReturn: sp500Return,
    years
  });
  const mixedGold = simulateInvestment({
    monthlyContribution: normalizedContribution * (normalizedGoldAllocation / 100),
    annualReturn: goldReturn,
    years
  });
  const mixedPortfolioValue = mixedSp500.futureValue + mixedGold.futureValue;
  const mixedPortfolioProfit = mixedSp500.profit + mixedGold.profit;
  const horizons = [5, 10, 15, 20, 25, 30]
    .filter((horizonYears) => horizonYears <= toNumber(years))
    .map((horizonYears) => {
      const pureScenario = simulateInvestment({
        monthlyContribution: normalizedContribution,
        annualReturn: sp500Return,
        years: horizonYears
      });
      const mixedSpScenario = simulateInvestment({
        monthlyContribution: normalizedContribution * (sp500Allocation / 100),
        annualReturn: sp500Return,
        years: horizonYears
      });
      const mixedGoldScenario = simulateInvestment({
        monthlyContribution: normalizedContribution * (normalizedGoldAllocation / 100),
        annualReturn: goldReturn,
        years: horizonYears
      });

      return {
        years: horizonYears,
        pureSp500: pureScenario.futureValue,
        mixedPortfolio: mixedSpScenario.futureValue + mixedGoldScenario.futureValue
      };
    });

  return {
    monthlyContribution: normalizedContribution,
    years: toNumber(years),
    goldAllocation: normalizedGoldAllocation,
    sp500Allocation,
    pureSp500,
    mixedPortfolio: {
      futureValue: mixedPortfolioValue,
      totalContributed: normalizedContribution * toNumber(years) * 12,
      profit: mixedPortfolioProfit,
      sp500Part: mixedSp500,
      goldPart: mixedGold
    },
    differenceValue: mixedPortfolioValue - pureSp500.futureValue,
    differencePercent:
      pureSp500.futureValue === 0
        ? 0
        : ((mixedPortfolioValue - pureSp500.futureValue) / pureSp500.futureValue) * 100,
    horizons
  };
}
