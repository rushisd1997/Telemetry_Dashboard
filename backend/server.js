const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;
const sampleLimit = 100;

const metrics = {
  velocity: { base: 185.4, value: 185.4, unit: 'cm/s', history: [] },
  pressure: { base: 1012, value: 1012, unit: 'mbar', history: [] },
  temperature: { base: 36.8, value: 36.8, unit: '°C', history: [] }
};

let updateCount = 0;

function roundValue(value) {
  return Number(value.toFixed(2));
}

function createSample(metric) {
  const change = (Math.random() * 0.2 - 0.1) * metric.value;
  metric.value = Math.max(0, metric.value + change);

  return {
    time: new Date().toISOString(),
    value: roundValue(metric.value)
  };
}

function moveTowardBase(metric) {
  metric.value += (metric.base - metric.value) * 0.35;
}

function updateTelemetry() {
  updateCount += 1;

  if (updateCount % 5 === 0) {
    Object.values(metrics).forEach(moveTowardBase);
  }

  Object.values(metrics).forEach((metric) => {
    metric.value = roundValue(metric.value);
    metric.history.push(createSample(metric));

    if (metric.history.length > sampleLimit) {
      metric.history.shift();
    }
  });
}

function getMetric(metric) {
  return {
    value: metric.value,
    unit: metric.unit,
    history: metric.history
  };
}

app.use(cors());
app.use(express.json());

app.get('/api/dashboard', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    velocity: getMetric(metrics.velocity),
    pressure: getMetric(metrics.pressure),
    temperature: getMetric(metrics.temperature)
  });
});

app.listen(port, () => {
  console.log(`Telemetry backend running on http://localhost:${port}`);
});

setInterval(updateTelemetry, 1000);
