import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ContinualLearningDemo = () => {
  const containerRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    
    // Mark as initialized to prevent double initialization
    isInitializedRef.current = true;

    // Create the demo HTML structure
    const container = d3.select(containerRef.current);
    container.html(`
      <div class="container">
        <h1 class="title">Neural Network Visualization (Multiple Distributions)</h1>
        
        <div class="param-controls">
          <label for="activationFunction">Activation Function:</label>
          <select id="activationFunction">
            <option value="tanh">Tanh</option>
            <option value="relu">ReLU</option>
            <option value="sigmoid">Sigmoid</option>
            <option value="leakyRelu">Leaky ReLU</option>
          </select>
          <label for="useBias" style="margin-left: 20px;">Use Bias:</label>
          <input type="checkbox" id="useBias" checked>
          <label for="learningRate" style="margin-left: 20px;">Learning Rate:</label>
          <select id="learningRate">
            <option value="0.00001">0.00001</option>
            <option value="0.0001">0.0001</option>
            <option value="0.001">0.001</option>
            <option value="0.003">0.003</option>
            <option value="0.01" selected>0.01</option>
            <option value="0.03">0.03</option>
            <option value="0.1">0.1</option>
            <option value="0.3">0.3</option>
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="10">10</option>
          </select>
          <label for="historyInterval" style="margin-left: 20px;">Save History Every:</label>
          <input type="number" id="historyInterval" min="5" max="100" step="5" value="10" style="width: 50px;">
          <span>epochs</span>
        </div>
        
        <div class="controls">
          <div>
            <button id="train">Train Network</button>
            <button id="pause" class="pause-button" disabled>Pause</button>
            <button id="reset">Reset Network</button>
            
            <label for="distributionType" style="margin-left: 10px;">Distribution:</label>
            <select id="distributionType">
              <option value="circle" selected>Circle</option>
              <option value="ring">Ring</option>
              <option value="xor">XOR</option>
              <option value="spiral">Spiral</option>
              <option value="gaussian">Gaussian</option>
            </select>
            
            <label style="margin-left: 10px;">
              <input type="checkbox" id="showTestData" checked> Show Test Data
            </label>
            
            <span class="counter">Epoch: <span id="epochCounter">0</span></span>
          </div>
          <div class="loss-display">
            <div>Training Loss: <span id="trainingLoss">-</span></div>
            <div>Test Loss: <span id="testLoss">-</span></div>
          </div>
        </div>
        
        <div class="history-container">
          <div class="history-title">Model History</div>
          <div class="history-slider-container">
            <span class="history-label">Current</span>
            <input type="range" class="history-slider" id="historySlider" min="0" max="0" value="0" disabled>
            <span class="history-label">Epoch: <span id="selectedEpoch">0</span></span>
            <button id="jumpToLatest" class="history-button" disabled>Latest</button>
          </div>
        </div>

        <div class="tabs" style="justify-content: flex-start;">
          <div>
            <div class="section-title">Input Samples</div>
            <div class="samples-vis" id="forward-samples"></div>
          </div>
          <div>
            <div class="section-title">Ground Truth</div>
            <div class="samples-vis" id="backward-samples"></div>
          </div>
        </div>
        
        <div class="tabs">
          <div class="tab active" data-tab="forward">Forward Pass</div>
          <div class="tab" data-tab="backward">Backward Pass</div>
        </div>
        
        <div class="tab-content">
          <div id="forward-content" class="pass-container">
            <div class="visualization-row">
              <div>
                <div class="section-title">Neural Network (Forward)</div>
                <div class="network-vis" id="forward-network"></div>
              </div>
              <div>
                <div class="section-title">Network Output</div>
                <div class="output-vis" id="forward-output"></div>
              </div>
            </div>
          </div>
          
          <div id="backward-content" class="pass-container" style="display: none;">
            <div class="visualization-row">
              <div>
                <div class="section-title">Neural Network (Backward)</div>
                <div class="network-vis" id="backward-network"></div>
              </div>
              <div>
                <div class="section-title">Neuron Gradients</div>
                <div class="output-vis" id="backward-output"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="chart-row">
            <div class="loss-chart" id="loss-chart"></div>
            <div class="gradient-chart" id="gradient-chart"></div>
          </div>
        </div>
        
        <div class="status" id="status"></div>
      </div>
    `);

    // Initialize the demo
    initializeDemo();
    
    // Cleanup function
    return () => {
      // Clean up any running animations
      if (window.animationId) {
        cancelAnimationFrame(window.animationId);
        window.animationId = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <style>{getStyles()}</style>
    </div>
  );
};

function getStyles() {
  return `
    .container {
      display: flex;
      flex-direction: column;
      max-width: 1400px;
      margin: 0 auto;
    }
    .title {
      text-align: center;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .controls {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .control-group {
      margin-right: 15px;
    }
    .param-controls {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .param-controls label {
      width: 120px;
      display: inline-block;
    }
    
    /* Tab interface */
    .tabs {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .tab {
      padding: 10px 20px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .tab.active {
      background-color: #007bff;
      color: white;
    }
    
    /* Visualization containers */
    .visualization-row {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
    }
    .visualization-row > div {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .network-vis, .samples-vis, .output-vis {
      width: 400px;
      height: 400px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 5px;
      background-color: #f9f9f9;
    }
    
    .loss-chart, .gradient-chart {
      width: 500px;
      height: 200px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 5px;
      background-color: #f9f9f9;
    }
    
    .chart-row {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
    
    .section-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    /* Node styling */
    .node {
      stroke: #333;
      stroke-width: 1.5px;
    }
    
    /* Link styling */
    .link {
      fill: none;
      stroke-opacity: 0.6;
    }
    
    /* Hover effects */
    .dimmed {
      opacity: 0.2;
    }
    .highlight-node {
      stroke-width: 3px;
      stroke: #ff6600;
    }
    .highlight-link {
      stroke-width: 4px !important;
    }
    .highlight-label {
      font-weight: bold;
      fill: #ff6600;
    }
    
    /* Weight labels */
    .weight-label, .bias-label {
      font-size: 10px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    /* Feature and layer labels */
    .feature-label, .layer-label {
      font-size: 12px;
      text-anchor: middle;
    }
    
    /* History controls */
    .history-container {
      margin-top: 20px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    .history-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .history-slider-container {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .history-slider {
      flex: 1;
      margin: 0 10px;
    }
    .history-label {
      min-width: 60px;
    }
    .history-button {
      padding: 5px 10px;
      margin: 0 5px;
      cursor: pointer;
    }
    
    /* Loss display */
    .loss-display {
      font-size: 14px;
    }
    .loss-display div {
      margin: 2px 0;
    }
    
    /* Status */
    .status {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
    
    /* Counter */
    .counter {
      font-weight: bold;
      margin-left: 10px;
    }
    
    /* Buttons */
    button {
      padding: 8px 16px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
    }
    button:hover {
      background-color: #0056b3;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .pause-button {
      background-color: #f44336;
    }
    .pause-button:hover {
      background-color: #d32f2f;
    }
    .continue-button {
      background-color: #4CAF50;
    }
    .continue-button:hover {
      background-color: #45a049;
    }
    
    /* Select and input styling */
    select, input[type="number"] {
      padding: 5px;
      font-size: 14px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
    input[type="checkbox"] {
      margin-left: 5px;
    }
    
    /* Data points */
    .data-point {
      stroke: black;
      stroke-width: 0.5;
    }
    .class-0 {
      fill: #e74c3c;
    }
    .class-1 {
      fill: #3498db;
    }
  `;
}

// Include all the JavaScript code inline
function initializeDemo() {
  ${getDemoCode()}
}

${getDemoCode()}

export default ContinualLearningDemo;