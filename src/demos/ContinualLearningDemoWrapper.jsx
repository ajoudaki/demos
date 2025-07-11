import React, { useEffect, useRef } from 'react';

const ContinualLearningDemoWrapper = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Copy the entire HTML file into an iframe to preserve all functionality
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Read the original HTML file and inject it
      fetch('/cl-demo.html')
        .then(response => response.text())
        .then(html => {
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
        })
        .catch(err => {
          console.error('Failed to load demo:', err);
          iframeDoc.open();
          iframeDoc.write('<p>Failed to load demo. Please ensure cl-demo.html is in the public directory.</p>');
          iframeDoc.close();
        });
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Continual Learning Demo"
      />
    </div>
  );
};

export default ContinualLearningDemoWrapper;