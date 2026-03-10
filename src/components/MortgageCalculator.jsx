import { useState } from "react";
import {
  calculateMortgage,
  fixationOptions,
  formatCurrency,
  formatPercent,
  intervalOptions
} from "../lib/mortgage.js";

const initialValues = {
  principal: 10000000,
  annualRate: 6,
  years: 20,
  paymentsPerYear: 12,
  fixationYears: 5,
  firstPaymentDate: "2026-04-01"
};

function MortgageCalculator() {
  const [values, setValues] = useState(initialValues);

  const result = calculateMortgage(values);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: event.target.type === "date" ? value : Number(value)
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
                <input
                  min="100000"
                  name="principal"
                  step="10000"
                  type="number"
                  value={values.principal}
                  onChange={handleChange}
                />
                <em>Kc</em>
              </div>
            </label>

            <label className="field">
              <span>Urokova mira</span>
              <div className="input-wrap">
                <input
                  max="30"
                  min="0.1"
                  name="annualRate"
                  step="0.1"
                  type="number"
                  value={values.annualRate}
                  onChange={handleChange}
                />
                <em>%</em>
              </div>
            </label>

            <label className="field">
              <span>Doba splaceni</span>
              <div className="input-wrap">
                <input
                  max="40"
                  min="1"
                  name="years"
                  step="1"
                  type="number"
                  value={values.years}
                  onChange={handleChange}
                />
                <em>let</em>
              </div>
            </label>

            <label className="field">
              <span>Interval</span>
              <div className="select-wrap">
                <select
                  name="paymentsPerYear"
                  value={values.paymentsPerYear}
                  onChange={handleChange}
                >
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
                <input
                  name="firstPaymentDate"
                  type="date"
                  value={values.firstPaymentDate}
                  onChange={handleChange}
                />
              </div>
            </label>

            <label className="field">
              <span>Fixace</span>
              <div className="select-wrap">
                <select
                  name="fixationYears"
                  value={values.fixationYears}
                  onChange={handleChange}
                >
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
            <div className="summary-card highlight">
              <span>Pravidelna splatka</span>
              <strong>{formatCurrency(result.payment)}</strong>
            </div>

            <div className="summary-card">
              <span>Celkem zaplaceno</span>
              <strong>{formatCurrency(result.totalPaid)}</strong>
            </div>

            <div className="summary-card">
              <span>Zaplacene uroky</span>
              <strong>{formatCurrency(result.totalInterest)}</strong>
            </div>

            <div className="summary-card">
              <span>Pocet splatek</span>
              <strong>{result.totalPayments}</strong>
            </div>

            <div className="summary-card">
              <span>Zbyvajici castka po fixaci</span>
              <strong>{formatCurrency(result.remainingAfterFixation)}</strong>
              <small>Konec fixace: {result.fixationEndDate}</small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel schedule-panel">
        <div className="schedule-header">
          <div>
            <p className="results-label">Splatkovy kalendar</p>
            <h2>Prvnich 12 splatek</h2>
          </div>
          <p className="schedule-note">
            Kazda splatka se deli na urok a umor jistiny. Zbytek jistiny postupne
            klesa.
          </p>
        </div>

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
              {result.schedule.map((row) => (
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
      </section>
    </main>
  );
}

export default MortgageCalculator;
