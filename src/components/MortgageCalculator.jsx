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
  firstPaymentDate: "2026-04-01",
  refinanceRate: 4.8
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

function ScheduleTable({ title, note, rows }) {
  return (
    <section className="panel schedule-panel">
      <div className="schedule-header">
        <div>
          <p className="results-label">Splatkovy kalendar</p>
          <h2>{title}</h2>
        </div>
        <p className="schedule-note">{note}</p>
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
            {rows.map((row) => (
              <tr key={`${title}-${row.index}`}>
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
  );
}

function ChartPanel({ title, note, total, principalValue, principalShare, interestValue, interestShare, centerLabel }) {
  return (
    <section className="panel chart-panel">
      <div className="schedule-header">
        <div>
          <p className="results-label">Kolacovy graf</p>
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

function MortgageCalculator() {
  const [values, setValues] = useState(initialValues);

  const result = calculateMortgage(values);
  const principalShare = (values.principal / result.totalPaid) * 100;
  const interestShare = (result.totalInterest / result.totalPaid) * 100;
  const fixationPrincipalShare =
    result.fixationTotalPaid === 0
      ? 0
      : (result.fixationPrincipalPaid / result.fixationTotalPaid) * 100;
  const fixationInterestShare =
    result.fixationTotalPaid === 0
      ? 0
      : (result.fixationInterestPaid / result.fixationTotalPaid) * 100;

  function handleChange(event) {
    const { name, value, type } = event.target;

    setValues((current) => ({
      ...current,
      [name]: type === "date" ? value : Number(value)
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
            <SummaryCard
              label="Nova splatka po refinancovani"
              value={formatCurrency(result.refinancePayment)}
              note={`Zbyvajici doba: ${result.remainingYearsAfterFixation} let`}
            />
            <SummaryCard label="Urok za prvni fixaci" value={formatCurrency(result.fixationInterestPaid)} />
            <SummaryCard label="Jistina za prvni fixaci" value={formatCurrency(result.fixationPrincipalPaid)} />
          </div>
        </article>
      </section>

      <section className="panel refinance-panel">
        <div className="results-header">
          <div>
            <p className="results-label">Refinancovani</p>
            <h2>Druha sazba po konci fixace</h2>
          </div>
          <p className="schedule-note">
            Po konci prvni fixace se nova sazba aplikuje na zbyvajici jistinu a prepocita se nova splatka.
          </p>
        </div>

        <div className="refinance-layout">
          <label className="field">
            <span>Nova urokova mira po fixaci</span>
            <div className="input-wrap">
              <input max="30" min="0.1" name="refinanceRate" step="0.1" type="number" value={values.refinanceRate} onChange={handleChange} />
              <em>%</em>
            </div>
          </label>

          <SummaryCard
            label="Refinancovana castka"
            value={formatCurrency(result.remainingAfterFixation)}
            note={`Nova etapa do ${result.refinanceEndDate}`}
          />
        </div>
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

      <ScheduleTable
        title={`Prvni fixace (${values.fixationYears} let)`}
        note="Tabulka ukazuje cele obdobi prvni fixace."
        rows={result.firstFixationSchedule}
      />

      {result.refinanceSchedule.length > 0 ? (
        <ScheduleTable
          title={`Po refinancovani (${values.fixationYears} let nebo do konce uveru)`}
          note="Po zadani nove sazby se zbyvajici castka refinancuje a zobrazi se dalsi etapa splaceni."
          rows={result.refinanceSchedule}
        />
      ) : null}
    </main>
  );
}

export default MortgageCalculator;
