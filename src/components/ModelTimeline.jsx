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
        
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="range"
            min="0"
            max={snapshots.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              cursor: 'pointer'
            }}
          />
          {/* Task switch markers */}
          <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, pointerEvents: 'none' }}>
            {snapshots.map((snapshot, i) => {
              if (!snapshot.isTaskSwitch) return null;
              const position = (i / (snapshots.length - 1)) * 100;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6b6b',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}
                  title={`Task switch at epoch ${snapshot.epoch}`}
                />
              );
            })}
          </div>
        </div>
        
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


      <div style={{
        marginTop: '10px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        {snapshots.length} snapshots saved
        {snapshots.some(s => s.isTaskSwitch) && ' | Task switches marked with ●'}
      </div>
    </div>
  );
};

export default ModelTimeline;