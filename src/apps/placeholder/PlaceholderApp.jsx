import { useState } from "react";
import "./placeholder.css";
import { calculatePortfolioComparison, formatCurrency, formatPercent } from "./lib/portfolio.js";

const initialValues = {
  monthlyContribution: "10000",
  years: "30",
  sp500Return: "10",
  goldReturn: "4",
  goldAllocation: "20"
};

function ResultCard({ label, value, note, accent = false }) {
  return (
    <article className={`placeholder-card${accent ? " placeholder-card--accent" : ""}`}>
      <p className="results-label">{label}</p>
      <strong>{value}</strong>
      {note ? <p>{note}</p> : null}
    </article>
  );
}

function PlaceholderApp() {
  const [values, setValues] = useState(initialValues);
  const comparison = calculatePortfolioComparison(values);
  const mixedWins = comparison.differenceValue > 0;
  const maxHorizonValue = Math.max(
    ...comparison.horizons.map((horizon) => Math.max(horizon.pureSp500, horizon.mixedPortfolio)),
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
    <div className="placeholder-app">
      <section className="placeholder-hero">
        <p className="placeholder-hero__eyebrow">Portfolio simulator</p>
        <h2>S&amp;P 500 vs. S&amp;P 500 + zlato</h2>
        <p className="placeholder-hero__text">
          Simulace ukazuje, jestli se pri pravidelnem investovani podle zadanych prumernych
          rocnych vynosu vyplati drzet cast portfolia i ve zlate, nebo jestli vyjde lepe cista
          investice do S&amp;P 500.
        </p>
      </section>

      <section className="placeholder-layout">
        <article className="placeholder-panel">
          <h2>Vstupy simulace</h2>

          <div className="placeholder-form">
            <label className="placeholder-field">
              <span>Mesicni investice</span>
              <div className="placeholder-input">
                <input
                  min="0"
                  name="monthlyContribution"
                  step="500"
                  type="number"
                  value={values.monthlyContribution}
                  onChange={handleChange}
                />
                <em>Kc</em>
              </div>
            </label>

            <label className="placeholder-field">
              <span>Investicni horizont</span>
              <div className="placeholder-input">
                <input
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

            <label className="placeholder-field">
              <span>Prumerny rocni vynos S&amp;P 500</span>
              <div className="placeholder-input">
                <input
                  min="0"
                  name="sp500Return"
                  step="0.1"
                  type="number"
                  value={values.sp500Return}
                  onChange={handleChange}
                />
                <em>%</em>
              </div>
            </label>

            <label className="placeholder-field">
              <span>Prumerny rocni vynos zlata</span>
              <div className="placeholder-input">
                <input
                  min="0"
                  name="goldReturn"
                  step="0.1"
                  type="number"
                  value={values.goldReturn}
                  onChange={handleChange}
                />
                <em>%</em>
              </div>
            </label>

            <label className="placeholder-field placeholder-field--full">
              <span>Kolik z mesicni investice pujde do zlata</span>
              <div className="placeholder-range">
                <input
                  max="100"
                  min="0"
                  name="goldAllocation"
                  step="1"
                  type="range"
                  value={values.goldAllocation}
                  onChange={handleChange}
                />
                <strong>{values.goldAllocation} %</strong>
              </div>
              <p className="placeholder-note">
                Zbytek automaticky investujeme do S&amp;P 500: {comparison.sp500Allocation} %
              </p>
            </label>
          </div>
        </article>

        <section className="placeholder-results">
          <div className="placeholder-grid">
            <ResultCard
              label="Cista investice do S&P 500"
              value={formatCurrency(comparison.pureSp500.futureValue)}
              note={`Vlozeno ${formatCurrency(comparison.pureSp500.totalContributed)}`}
              accent
            />
            <ResultCard
              label="Mix S&P 500 + zlato"
              value={formatCurrency(comparison.mixedPortfolio.futureValue)}
              note={`S&P ${comparison.sp500Allocation} % / zlato ${comparison.goldAllocation} %`}
            />
            <ResultCard
              label="Rozdil mezi scenari"
              value={formatCurrency(comparison.differenceValue)}
              note={
                mixedWins
                  ? `Mix vychazi lepe o ${formatPercent(comparison.differencePercent)}`
                  : `Cisty S&P 500 vychazi lepe o ${formatPercent(Math.abs(comparison.differencePercent))}`
              }
            />
            <ResultCard
              label="Zisk u mixu"
              value={formatCurrency(comparison.mixedPortfolio.profit)}
              note={`Zlato samo udela ${formatCurrency(comparison.mixedPortfolio.goldPart.futureValue)}`}
            />
          </div>

          <article className="placeholder-panel">
            <div className="placeholder-panel__header">
              <div>
                <p className="results-label">Interpretace</p>
                <h2>Co ten model rika</h2>
              </div>
              <p className="placeholder-note">
                Tohle je zjednodusena simulace na zaklade prumernych vynosu. Zatim nepocita s volatilitou,
                realnymi historickymi roky ani rebalancovanim.
              </p>
            </div>

            <div className="placeholder-insight">
              <strong>
                {mixedWins
                  ? "Pri techto predpokladech dava diverzifikace do zlata vyssi konecnou hodnotu."
                  : "Pri techto predpokladech vychazi lepe investovat vse jen do S&P 500."}
              </strong>
              <p>
                Rozhodujici je hlavne rozdil ve vynosech a to, jak velkou cast mesicni investice presouvas
                ze S&amp;P 500 do zlata.
              </p>
            </div>
          </article>

          <article className="placeholder-panel">
            <div className="placeholder-panel__header">
              <div>
                <p className="results-label">Vyvoj v case</p>
                <h2>Porovnani po jednotlivych horizontech</h2>
              </div>
            </div>

            <div className="placeholder-bars">
              {comparison.horizons.map((item) => {
                return (
                  <div key={item.years} className="placeholder-bar-group">
                    <div className="placeholder-bar-value">{item.years} let</div>
                    <div className="placeholder-bar-track">
                      <div
                        className="placeholder-bar placeholder-bar--sp500"
                        style={{ height: `${(item.pureSp500 / maxHorizonValue) * 100}%` }}
                      />
                      <div
                        className="placeholder-bar placeholder-bar--mix"
                        style={{ height: `${(item.mixedPortfolio / maxHorizonValue) * 100}%` }}
                      />
                    </div>
                    <p>{formatCurrency(item.pureSp500)}</p>
                    <p>{formatCurrency(item.mixedPortfolio)}</p>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}

export default PlaceholderApp;
