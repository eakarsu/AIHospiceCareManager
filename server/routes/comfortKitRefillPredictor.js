const express = require('express');

const router = express.Router();

function predict(input = {}) {
  const kits = input.kits || [
    { patient: 'Patient A', morphine_doses_remaining: 5, symptom_escalations_72h: 3, nurse_visit_days: 2 },
    { patient: 'Patient B', morphine_doses_remaining: 14, symptom_escalations_72h: 0, nurse_visit_days: 5 },
  ];
  return {
    kits: kits.map((k) => {
      const score = Math.min(100, (12 - Number(k.morphine_doses_remaining)) * 6 + Number(k.symptom_escalations_72h) * 18 + Number(k.nurse_visit_days) * 3);
      return { ...k, refill_score: Math.round(score), action: score >= 70 ? 'dispatch_refill_today' : score >= 40 ? 'nurse_verify' : 'monitor' };
    }),
  };
}

router.get('/', (req, res) => res.json(predict()));
router.post('/predict', (req, res) => res.json(predict(req.body || {})));

module.exports = router;
