// Data generation utilities for various distributions
// Extracted from cl-demo.html

export function generateData(numSamples, distributionType) {
  switch (distributionType) {
    case 'xor':
      return generateXorData(numSamples);
    case 'spiral':
      return generateSpiralData(numSamples);
    case 'gaussian':
      return generateGaussianData(numSamples);
    case 'ring':
      return generateRingData(numSamples);
    case 'circle':
    default:
      return generateCircleData(numSamples);
  }
}

export function generateCircleData(numSamples) {
  const data = [];
  const labels = [];
  for (let i = 0; i < numSamples; i++) {
    const x1 = (Math.random() * 12) - 6;
    const x2 = (Math.random() * 12) - 6;
    const distance = Math.sqrt(x1 * x1 + x2 * x2);
    const ringInner = 2.5;
    const ringOuter = 4.5;
    const isInRing = (distance >= ringInner && distance <= ringOuter);
    data.push([x1, x2]);
    labels.push(isInRing ? 1 : 0);
  }
  return { data, labels };
}

export function generateRingData(numSamples) {
  const data = [];
  const labels = [];
  
  // Half of the samples in the center cluster, half in the outer ring
  const half = Math.floor(numSamples / 2);
  
  // Center cluster (class 0)
  for (let i = 0; i < half; i++) {
    const angle = Math.random() * 2 * Math.PI;
    // Radius from 0 to ~1. Increase to expand the inner cluster
    const r = Math.random() * 4.0;
    
    // Convert polar (r, angle) -> Cartesian (x, y)
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    
    data.push([x, y]);
    labels.push(0); // Center cluster label
  }
  
  // Outer ring (class 1)
  for (let i = 0; i < numSamples - half; i++) {
    const angle = Math.random() * 2 * Math.PI;
    // Radius from 2 to 3. Adjust as needed to move or widen the ring
    const r = 4 + Math.random() * 2.0;
    
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    
    data.push([x, y]);
    labels.push(1); // Ring label
  }
  
  return { data, labels };
}

export function generateXorData(numSamples) {
  const data = [];
  const labels = [];
  for (let i = 0; i < numSamples; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    data.push([x * 5, y * 5]); // scale them a bit
    const label = (x > 0) ^ (y > 0) ? 1 : 0;
    labels.push(label);
  }
  return { data, labels };
}

export function generateSpiralData(numSamples) {
  const data = [];
  const labels = [];
  
  // Each spiral will have half the total samples
  const n = numSamples / 2;
  
  // Number of times the spiral wraps around (try 2 or 3)
  const revolutions = 3;
  
  // Random noise factor (standard deviation). Increase for fuzzier spiral
  const noise = 0.2;
  
  for (let i = 0; i < n; i++) {
    // Fraction of the way through the spiral
    const t = i / (n - 1) * revolutions * Math.PI;
    
    // Radius grows with angle t. You can adjust the 0.5 to expand or shrink
    const r = 0.5 * t;
    
    // First spiral (class 0)
    let x1 = r * Math.cos(t) + (Math.random() * 2 - 1) * noise;
    let y1 = r * Math.sin(t) + (Math.random() * 2 - 1) * noise;
    data.push([x1, y1]);
    labels.push(0);
    
    // Second spiral (class 1), shifted by π
    let x2 = r * Math.cos(t + Math.PI) + (Math.random() * 2 - 1) * noise;
    let y2 = r * Math.sin(t + Math.PI) + (Math.random() * 2 - 1) * noise;
    data.push([x2, y2]);
    labels.push(1);
  }
  
  return { data, labels };
}

export function generateGaussianData(numSamples) {
  const data = [];
  const labels = [];
  const half = Math.floor(numSamples / 2);
  
  // Class 0 - centered at (2, 2)
  for (let i = 0; i < half; i++) {
    const x = randn_bm() + 2;
    const y = randn_bm() + 2;
    data.push([x, y]);
    labels.push(0);
  }
  
  // Class 1 - centered at (-2, -2)
  for (let i = 0; i < (numSamples - half); i++) {
    const x = randn_bm() - 2;
    const y = randn_bm() - 2;
    data.push([x, y]);
    labels.push(1);
  }
  
  return { data, labels };
}

// Box-Muller transform for generating normally distributed random numbers
function randn_bm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}