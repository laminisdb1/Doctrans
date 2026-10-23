export default function DocPreviewCard({ lang }) {
  const isFr = lang === "fr";
  return (
    <article className={`doc-card ${isFr ? "doc-card--fr" : "doc-card--en"}`}>
      <header className="doc-card__header">
        <span className="doc-card__lang">{isFr ? "FR — Original" : "EN — Traduit"}</span>
        <span className="doc-card__badge">{isFr ? "Source" : "DocTrans"}</span>
      </header>
      <div className="doc-card__body">
        <p className="doc-card__caption">
          {isFr ? "Contrat de prestation — Art. 4" : "Service Agreement — Art. 4"}
        </p>
        <div className="doc-card__bar doc-card__bar--near-full" />
        <div className="doc-card__bar doc-card__bar--full" />
        <div className="doc-card__bar doc-card__bar--most doc-card__bar--gap" />
        <table className="doc-card__table">
          <thead>
            <tr>
              <th>{isFr ? "Livrable" : "Deliverable"}</th>
              <th>{isFr ? "Échéance" : "Due"}</th>
              <th className="doc-card__cell-right">{isFr ? "Montant" : "Amount"}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td><span className="doc-card__cell doc-card__cell--wide" /></td>
                <td><span className="doc-card__cell doc-card__cell--narrow" /></td>
                <td className="doc-card__cell-right doc-card__amount">
                  {isFr ? "1 200 €" : "€1,200"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="doc-card__bar doc-card__bar--full" />
        <div className="doc-card__bar doc-card__bar--partial doc-card__bar--gap-lg" />
        <div className="doc-card__footer">
          <div>
            <div className="doc-card__sig-line" />
            <div className="doc-card__sig-name">A. Diouf</div>
          </div>
          <div className="doc-card__stamp">{isFr ? "SIGNÉ" : "SIGNED"}</div>
        </div>
      </div>
    </article>
  );
}