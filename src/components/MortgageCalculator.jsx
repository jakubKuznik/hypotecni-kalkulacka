import { useState } from "react";
import {
  calculateInvestment,
  calculateInflationAdjustedPayment,
  calculateMortgage,
  calculatePropertyYield,
  fixationOptions,
  formatCurrency,
  formatPercent,
  intervalOptions
} from "../lib/mortgage.js";

const initialValues = {
  principal: "10000000",
  annualRate: "6",
  years: "20",
  paymentsPerYear: "12",
  fixationYears: "5",
  firstPaymentDate: "2026-04-01",
  investmentReturn: "10",
  investmentContribution: "",
  investmentYears: "",
  inflationRate: "3",
  propertyValue: "12000000",
  propertyAnnualYield: "3",
  propertyFinalPrice: "18000000"
};

function SummaryCard({ label, value, note, highlight = false }) {
  return (
    <div className={`summary-card${highlight ? " highlight" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function ChartPanel({
  title,
  note,
  total,
  principalValue,
  principalShare,
  interestValue,
  interestShare,
  centerLabel
}) {
  return (
    <section className="panel chart-panel">
      <div className="schedule-header">
        <div>
          <h2>{title}</h2>
        </div>
        <p className="schedule-note">{note}</p>
      </div>

      <div className="chart-layout">
        <div
          aria-label={title}
          className="donut-chart"
          role="img"
          style={{ "--principal-share": `${principalShare}%` }}
        >
          <div className="donut-center">
            <span>{centerLabel}</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>

        <div className="chart-legend">
          <div className="legend-row">
            <span className="legend-swatch principal" />
            <div>
              <strong>Jistina</strong>
              <p>
                {formatCurrency(principalValue)} ({principalShare.toFixed(1)} %)
              </p>
            </div>
          </div>

          <div className="legend-row">
            <span className="legend-swatch interest" />
            <div>
              <strong>Urok</strong>
              <p>
                {formatCurrency(interestValue)} ({interestShare.toFixed(1)} %)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleTable({ rows, fixationYears }) {
  return (
    <details className="panel schedule-panel">
      <summary className="schedule-toggle">
        <div>
          <p className="results-label">Splatkovy kalendar</p>
          <h2>Obdobi fixace ({fixationYears} let)</h2>
        </div>
        <span>Zobrazit</span>
      </summary>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Datum</th>
              <th>Splatka</th>
              <th>Urok</th>
              <th>Jistina</th>
              <th>Zustatek</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.index}>
                <td>{row.index}</td>
                <td>{row.date}</td>
                <td>{formatCurrency(row.payment)}</td>
                <td>{formatCurrency(row.interest)}</td>
                <td>{formatCurrency(row.principal)}</td>
                <td>{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function MortgageCalculator() {
  const [values, setValues] = useState(initialValues);

  const result = calculateMortgage(values);
  const investmentContribution =
    values.investmentContribution === ""
      ? result.payment
      : Number(values.investmentContribution);
  const investmentYears =
    values.investmentYears === "" ? Number(values.years || 0) : Number(values.investmentYears);
  const investment = calculateInvestment({
    contribution: investmentContribution,
    annualReturn: values.investmentReturn,
    years: investmentYears,
    contributionsPerYear: values.paymentsPerYear
  });
  const principalShare = result.totalPaid === 0 ? 0 : (Number(values.principal || 0) / result.totalPaid) * 100;
  const interestShare =
    result.totalPaid === 0 ? 0 : (result.totalInterest / result.totalPaid) * 100;
  const fixationPrincipalShare =
    result.fixationTotalPaid === 0
      ? 0
      : (result.fixationPrincipalPaid / result.fixationTotalPaid) * 100;
  const fixationInterestShare =
    result.fixationTotalPaid === 0
      ? 0
      : (result.fixationInterestPaid / result.fixationTotalPaid) * 100;
  const investmentPrincipalShare =
    investment.futureValue === 0
      ? 0
      : (investment.investedPrincipal / investment.futureValue) * 100;
  const investmentProfitShare =
    investment.futureValue === 0
      ? 0
      : (investment.profit / investment.futureValue) * 100;
  const propertyYield = calculatePropertyYield({
    propertyValue: values.propertyValue,
    annualYieldPercent: values.propertyAnnualYield,
    finalPrice: values.propertyFinalPrice
  });
  const inflationView = calculateInflationAdjustedPayment({
    payment: result.payment,
    annualInflation: values.inflationRate
  });
  const maxPropertyValue = Math.max(
    ...propertyYield.horizons.map((item) => item.totalValue),
    1
  );
  const maxInflationValue = Math.max(
    ...inflationView.horizons.map((item) => item.presentValue),
    1
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value
    }));
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Hypotecni kalkulacka</p>
        </div>
      </section>

      <section className="calculator-layout">
        <article className="panel calculator-panel">
          <h2>Parametry uveru</h2>

          <div className="field-grid">
            <label className="field">
              <span>Vyse uveru</span>
              <div className="input-wrap">
                <input min="100000" name="principal" step="10000" type="number" value={values.principal} onChange={handleChange} />
                <em>Kc</em>
              </div>
            </label>

            <label className="field">
              <span>Urokova mira</span>
              <div className="input-wrap">
                <input max="30" min="0.1" name="annualRate" step="0.1" type="number" value={values.annualRate} onChange={handleChange} />
                <em>%</em>
              </div>
            </label>

            <label className="field">
              <span>Doba splaceni</span>
              <div className="input-wrap">
                <input max="40" min="1" name="years" step="1" type="number" value={values.years} onChange={handleChange} />
                <em>let</em>
              </div>
            </label>

            <label className="field">
              <span>Interval</span>
              <div className="select-wrap">
                <select name="paymentsPerYear" value={values.paymentsPerYear} onChange={handleChange}>
                  {intervalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="field">
              <span>Prvni datum splatky</span>
              <div className="input-wrap">
                <input name="firstPaymentDate" type="date" value={values.firstPaymentDate} onChange={handleChange} />
              </div>
            </label>

            <label className="field">
              <span>Fixace</span>
              <div className="select-wrap">
                <select name="fixationYears" value={values.fixationYears} onChange={handleChange}>
                  {fixationOptions.map((years) => (
                    <option key={years} value={years}>
                      {years} let
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </article>

        <article className="panel results-panel">
          <div className="results-header">
            <div>
              <p className="results-label">Vysledek</p>
              <h2>Prehled splaceni</h2>
            </div>

            <div className="rate-badge">
              <span>{formatPercent(values.annualRate)}</span>
              <small>{result.intervalLabel}</small>
            </div>
          </div>

          <div className="summary-grid">
            <SummaryCard highlight label="Pravidelna splatka" value={formatCurrency(result.payment)} />
            <SummaryCard label="Celkova castka" value={formatCurrency(result.totalPaid)} />
            <SummaryCard label="Celkovy urok" value={formatCurrency(result.totalInterest)} />
            <SummaryCard label="Pocet splatek" value={result.totalPayments} />
            <SummaryCard
              label="Zbyvajici jistina po fixaci"
              value={formatCurrency(result.remainingAfterFixation)}
              note={`Konec fixace: ${result.fixationEndDate}`}
            />
            <SummaryCard label="Urok za prvni fixaci" value={formatCurrency(result.fixationInterestPaid)} />
            <SummaryCard label="Jistina za prvni fixaci" value={formatCurrency(result.fixationPrincipalPaid)} />
          </div>
        </article>
      </section>

      <ChartPanel
        centerLabel="Celkem"
        title="Kolik z celkove castky tvori urok"
        note="Modra cast predstavuje splacenou jistinu, cervena cast ukazuje zaplacene uroky za celou dobu splatnosti."
        total={result.totalPaid}
        principalValue={values.principal}
        principalShare={principalShare}
        interestValue={result.totalInterest}
        interestShare={interestShare}
      />

      <ChartPanel
        centerLabel="Fixace"
        title="Rozpad plateb behem prvni fixace"
        note="Druhy graf ukazuje jen obdobi do konce prvni fixace a rozpad na modrou jistinu a cerveny urok."
        total={result.fixationTotalPaid}
        principalValue={result.fixationPrincipalPaid}
        principalShare={fixationPrincipalShare}
        interestValue={result.fixationInterestPaid}
        interestShare={fixationInterestShare}
      />

      <section className="panel investment-panel">
        <div className="results-header">
          <div>
            <p className="results-label">Investicni graf</p>
            <h2>Co by udelala stejna castka za zvolene obdobi</h2>
          </div>
          <p className="schedule-note">
            Kalkulace pocita s pravidelnym investovanim castky ve vysi splatky
            do investice se zadanym rocnim zhodnocenim.
          </p>
        </div>

        <div className="investment-layout">
          <label className="field">
            <span>Rocni zhodnoceni investice</span>
            <div className="input-wrap">
              <input
                max="30"
                min="0.1"
                name="investmentReturn"
                step="0.1"
                type="number"
                value={values.investmentReturn}
                onChange={handleChange}
              />
              <em>%</em>
            </div>
          </label>

          <div className="summary-grid">
            <SummaryCard
              highlight
              label="Budouci hodnota investice"
              value={formatCurrency(investment.futureValue)}
              note={`${investment.years} let`}
            />
            <SummaryCard
              label="Celkove vlozeno"
              value={formatCurrency(investment.investedPrincipal)}
            />
            <SummaryCard
              label="Vynos investice"
              value={formatCurrency(investment.profit)}
            />
            <SummaryCard
              label="Pravidelny vklad"
              value={formatCurrency(investmentContribution)}
              note={
                values.investmentContribution === ""
                  ? `${investment.totalContributions} vkladu, automaticky podle splatky`
                  : `${investment.totalContributions} vkladu`
              }
            />
          </div>
        </div>

        <div className="investment-layout single-input">
          <label className="field">
            <span>Pravidelny vklad</span>
            <div className="input-wrap">
              <input
                min="0"
                name="investmentContribution"
                step="100"
                type="number"
                value={values.investmentContribution}
                onChange={handleChange}
              />
              <em>Kc</em>
            </div>
          </label>

          <label className="field">
            <span>Investicni horizont</span>
            <div className="input-wrap">
              <input
                min="0"
                name="investmentYears"
                step="1"
                type="number"
                value={values.investmentYears}
                onChange={handleChange}
              />
              <em>let</em>
            </div>
          </label>
        </div>

        <div className="chart-layout">
          <div
            aria-label="Investicni graf"
            className="donut-chart investment-donut"
            role="img"
            style={{ "--principal-share": `${investmentPrincipalShare}%` }}
          >
            <div className="donut-center">
              <span>Investice</span>
              <strong>{formatCurrency(investment.futureValue)}</strong>
            </div>
          </div>

          <div className="chart-legend">
            <div className="legend-row">
              <span className="legend-swatch contribution" />
              <div>
                <strong>Vlozene penize</strong>
                <p>
                  {formatCurrency(investment.investedPrincipal)} (
                  {investmentPrincipalShare.toFixed(1)} %)
                </p>
              </div>
            </div>

            <div className="legend-row">
              <span className="legend-swatch profit" />
              <div>
                <strong>Vynos</strong>
                <p>
                  {formatCurrency(investment.profit)} (
                  {investmentProfitShare.toFixed(1)} %)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel property-panel">
        <div className="results-header">
          <div>
            <p className="results-label">Vynosnost nemovitosti</p>
            <h2>Vyvoj hodnoty po 5 az 30 letech</h2>
          </div>
          <p className="schedule-note">
            Vypocet kombinuje pravidelny rocni vynos z nemovitosti a finalni
            prodejni cenu.
          </p>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Hodnota nemovitosti</span>
            <div className="input-wrap">
              <input
                min="0"
                name="propertyValue"
                step="10000"
                type="number"
                value={values.propertyValue}
                onChange={handleChange}
              />
              <em>Kc</em>
            </div>
          </label>

          <label className="field">
            <span>Odhadovany rocni vynos</span>
            <div className="input-wrap">
              <input
                min="0"
                name="propertyAnnualYield"
                step="0.1"
                type="number"
                value={values.propertyAnnualYield}
                onChange={handleChange}
              />
              <em>%</em>
            </div>
          </label>

          <label className="field">
            <span>Finalni cena</span>
            <div className="input-wrap">
              <input
                min="0"
                name="propertyFinalPrice"
                step="10000"
                type="number"
                value={values.propertyFinalPrice}
                onChange={handleChange}
              />
              <em>Kc</em>
            </div>
          </label>
        </div>

        <div className="summary-grid">
          <SummaryCard
            highlight
            label="Rocni vynos v korunach"
            value={formatCurrency(propertyYield.annualYieldAmount)}
          />
          <SummaryCard
            label="Finalni prodejni cena"
            value={formatCurrency(propertyYield.finalPrice)}
          />
          <SummaryCard
            label="Celkem po 30 letech"
            value={formatCurrency(propertyYield.horizons.at(-1)?.totalValue ?? 0)}
          />
        </div>

        <div className="property-chart">
          {propertyYield.horizons.map((item) => (
            <div key={item.years} className="property-bar-group">
              <div className="property-bar-value">{formatCurrency(item.totalValue)}</div>
              <div className="property-bar-track">
                <div
                  className="property-bar-fill"
                  style={{ height: `${(item.totalValue / maxPropertyValue) * 100}%` }}
                />
              </div>
              <strong>{item.years} let</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel inflation-panel">
        <div className="results-header">
          <div>
            <p className="results-label">Inflacni zohledneni</p>
            <h2>Kolik ma stejna splatka hodnotu v dnesnich penezich</h2>
          </div>
          <p className="schedule-note">
            Graf ukazuje realnou hodnotu stejne nominalni splatky pri slozene
            inflaci v case.
          </p>
        </div>

        <div className="investment-layout">
          <label className="field">
            <span>Odhadovana inflace</span>
            <div className="input-wrap">
              <input
                min="0"
                name="inflationRate"
                step="0.1"
                type="number"
                value={values.inflationRate}
                onChange={handleChange}
              />
              <em>%</em>
            </div>
          </label>

          <div className="summary-grid">
            <SummaryCard
              highlight
              label="Dnesni hodnota splatky za 10 let"
              value={formatCurrency(
                inflationView.horizons.find((item) => item.years === 10)?.presentValue ?? 0
              )}
            />
            <SummaryCard
              label="Aktualni splatka"
              value={formatCurrency(inflationView.currentPayment)}
            />
            <SummaryCard
              label="Dnesni hodnota splatky za 30 let"
              value={formatCurrency(
                inflationView.horizons.find((item) => item.years === 30)?.presentValue ?? 0
              )}
            />
          </div>
        </div>

        <div className="property-chart inflation-chart">
          {inflationView.horizons.map((item) => (
            <div key={item.years} className="property-bar-group">
              <div className="property-bar-value">{formatCurrency(item.presentValue)}</div>
              <div className="property-bar-track">
                <div
                  className="property-bar-fill inflation-bar-fill"
                  style={{ height: `${(item.presentValue / maxInflationValue) * 100}%` }}
                />
              </div>
              <strong>{item.years} let</strong>
            </div>
          ))}
        </div>
      </section>

      <ScheduleTable fixationYears={values.fixationYears} rows={result.schedule} />
    </main>
  );
}

export default MortgageCalculator;
