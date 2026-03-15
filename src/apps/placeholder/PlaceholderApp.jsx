import "./placeholder.css";

function PlaceholderApp() {
  return (
    <div className="placeholder-app">
      <section className="placeholder-hero">
        <p className="placeholder-hero__eyebrow">Placeholder</p>
        <h2>Prostor pro dalsi aplikaci</h2>
        <p className="placeholder-hero__text">
          Tady muzeme postupne postavit novou aplikaci. Navigace uz je pripravena a tahle sekce ma
          vlastni slozku i vlastni soubory.
        </p>
      </section>

      <section className="placeholder-grid">
        <article className="placeholder-card">
          <p className="results-label">Stav</p>
          <strong>Pripraveno na vyvoj</strong>
          <p>Logika i UI pro druhou aplikaci ted mohou vznikat oddelene od hypotecni kalkulacky.</p>
        </article>

        <article className="placeholder-card placeholder-card--accent">
          <p className="results-label">Dalsi krok</p>
          <strong>Dopsat zadani druhe aplikace</strong>
          <p>Jakmile upresnime funkcionalitu, muzeme do teto slozky pridat vlastni komponenty, data a styly.</p>
        </article>
      </section>
    </div>
  );
}

export default PlaceholderApp;
