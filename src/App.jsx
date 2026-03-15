import { useState } from "react";
import MortgageCalculatorApp from "./apps/hypotecni-kalkulacka/MortgageCalculatorApp.jsx";
import PlaceholderApp from "./apps/placeholder/PlaceholderApp.jsx";

const applications = [
  {
    id: "hypotecni-kalkulacka",
    label: "Hypotecni kalkulacka",
    component: MortgageCalculatorApp
  },
  {
    id: "placeholder",
    label: "Placeholder",
    component: PlaceholderApp
  }
];

function App() {
  const [activeAppId, setActiveAppId] = useState(applications[0].id);

  const activeApp =
    applications.find((application) => application.id === activeAppId) ?? applications[0];
  const ActiveComponent = activeApp.component;

  return (
    <div className="global-shell">
      <header className="global-header">
        <div className="global-header__inner">
          <nav aria-label="Vyber aplikace" className="app-nav">
            {applications.map((application) => (
              <button
                key={application.id}
                className={`app-nav__button${application.id === activeApp.id ? " is-active" : ""}`}
                type="button"
                onClick={() => setActiveAppId(application.id)}
              >
                {application.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="global-content">
        <section className="app-frame">
          <ActiveComponent />
        </section>
      </main>
    </div>
  );
}

export default App;
