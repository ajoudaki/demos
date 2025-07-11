import React from 'react';

const ModelTimeline = ({
  snapshots = [],
  currentIndex = 0,
  onSelectSnapshot,
  onClearHistory,
  width = 800,
  height = 80
}) => {
  if (snapshots.length === 0) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd',
        color: '#666',
        fontSize: '14px'
      }}>
        No snapshots saved yet. Snapshots are saved automatically during training.
      </div>
    );
  }

  const handleSliderChange = (e) => {
    const index = parseInt(e.target.value);
    onSelectSnapshot(index);
  };

  const currentSnapshot = snapshots[currentIndex];

  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: 0 }}>Model History Timeline</h4>
        <button
          onClick={onClearHistory}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear History
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{ fontSize: '14px', minWidth: '80px' }}>
          Epoch {snapshots[0]?.epoch || 0}
        </span>
        
        <input
          type="range"
          min="0"
          max={snapshots.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          style={{
            flex: 1,
            cursor: 'pointer'
          }}
        />
        
        <span style={{ fontSize: '14px', minWidth: '80px', textAlign: 'right' }}>
          Epoch {snapshots[snapshots.length - 1]?.epoch || 0}
        </span>
      </div>

      <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#666'
      }}>
        <div>
          <strong>Current:</strong> Epoch {currentSnapshot?.epoch || 0}
          {currentSnapshot?.dataset && ` | Dataset: ${currentSnapshot.dataset}`}
        </div>
        <div>
          <strong>Loss:</strong> Train: {currentSnapshot?.trainLoss?.toFixed(4) || 'N/A'} | 
          Test: {currentSnapshot?.testLoss?.toFixed(4) || 'N/A'}
        </div>
      </div>

      {/* Timeline markers */}
      <div style={{
        position: 'relative',
        height: '20px',
        marginTop: '10px',
        backgroundColor: '#e0e0e0',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        {snapshots.map((snapshot, i) => {
          const position = (i / (snapshots.length - 1)) * 100;
          const isSelected = i === currentIndex;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: isSelected ? '12px' : '8px',
                height: isSelected ? '12px' : '8px',
                borderRadius: '50%',
                backgroundColor: isSelected ? '#007bff' : '#666',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: isSelected ? 2 : 1
              }}
              onClick={() => onSelectSnapshot(i)}
              title={`Epoch ${snapshot.epoch}`}
            />
          );
        })}
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        {snapshots.length} snapshots saved | Click on timeline or use slider to navigate
      </div>
    </div>
  );
};

export default ModelTimeline;