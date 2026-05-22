import React, { useEffect, useState } from 'react';

export default function ComfortKitRefillPredictor({ token }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/comfort-kit-refill-predictor', { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((r) => r.json()).then(setData).catch(() => {});
  }, [token]);
  return (
    <div>
      <h1>Comfort Kit Refill Predictor</h1>
      <p>Prioritizes hospice comfort-kit refills using remaining doses, symptom escalations, and visit timing.</p>
      {data?.kits?.map((kit) => <section key={kit.patient} className="card"><h2>{kit.patient}</h2><p>{kit.action} - score {kit.refill_score}</p></section>)}
    </div>
  );
}
