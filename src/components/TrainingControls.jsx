import React from 'react';

const TrainingControls = ({
  isTraining,
  onStart,
  onStop,
  onReset,
  learningRate,
  onLearningRateChange,
  activationType,
  onActivationTypeChange,
  batchSize,
  onBatchSizeChange,
  epochsPerStep = 1,
  onEpochsPerStepChange,
  currentEpoch = 0,
  trainLoss = null,
  testLoss = null
}) => {
  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px'
      }}>
        {/* Training Actions */}
        <div>
          <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px', fontWeight: 'bold' }}>
            Training
          </label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={onStart}
              disabled={isTraining}
              style={{
                padding: '5px 12px',
                backgroundColor: isTraining ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isTraining ? 'Training...' : 'Start'}
            </button>
            
            <button
              onClick={onStop}
              disabled={!isTraining}
              style={{
                padding: '5px 12px',
                backgroundColor: !isTraining ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !isTraining ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Stop
            </button>
            
            <button
              onClick={onReset}
              disabled={isTraining}
              style={{
                padding: '5px 12px',
                backgroundColor: isTraining ? '#6c757d' : '#ffc107',
                color: isTraining ? 'white' : '#212529',
                border: 'none',
                borderRadius: '4px',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Learning Rate */}
        <div>
          <label htmlFor="learning-rate" style={{ display: 'block', marginBottom: '3px', fontSize: '12px', fontWeight: 'bold' }}>
            Learning Rate
          </label>
          <input
            id="learning-rate"
            type="number"
            min="0.001"
            max="1"
            step="0.001"
            value={learningRate}
            onChange={(e) => onLearningRateChange(parseFloat(e.target.value) || 0.01)}
            disabled={isTraining}
            style={{ 
              width: '60px',
              padding: '3px 5px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #ced4da'
            }}
          />
        </div>


        {/* Batch Size */}
        {onBatchSizeChange && (
          <div>
            <label htmlFor="batch-size" style={{ display: 'block', marginBottom: '3px', fontSize: '12px', fontWeight: 'bold' }}>
              Batch Size
            </label>
            <input
              id="batch-size"
              type="number"
              min="1"
              max="128"
              step="1"
              value={batchSize}
              onChange={(e) => onBatchSizeChange(parseInt(e.target.value) || 32)}
              disabled={isTraining}
              style={{ 
                width: '100%',
                padding: '3px 5px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            />
          </div>
        )}

        {/* Epochs Per Step */}
        {onEpochsPerStepChange && (
          <div>
            <label htmlFor="epochs-per-step" style={{ display: 'block', marginBottom: '3px', fontSize: '12px', fontWeight: 'bold' }}>
              Epochs/Step: {epochsPerStep}
            </label>
            <input
              id="epochs-per-step"
              type="range"
              min="1"
              max="50"
              step="1"
              value={epochsPerStep}
              onChange={(e) => onEpochsPerStepChange(parseInt(e.target.value))}
              disabled={isTraining}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
              <span>1</span>
              <span>50</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Display */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #dee2e6',
        fontSize: '11px',
        color: '#666'
      }}>
        <div>
          <strong>Epoch:</strong> {currentEpoch}
        </div>
        {trainLoss !== null && (
          <div>
            <strong>Train:</strong> {trainLoss.toFixed(3)}
          </div>
        )}
        {testLoss !== null && (
          <div>
            <strong>Test:</strong> {testLoss.toFixed(3)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingControls;