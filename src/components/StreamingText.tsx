
import React, { useState, useEffect } from 'react';

interface StreamingTextProps {
  text: string;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayText(text);
    
    // Cursor blinking effect - more subtle and isolated
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Slightly slower for better UX

    return () => clearInterval(cursorInterval);
  }, [text]);

  return (
    <div className="break-words overflow-wrap-anywhere">
      <span className="whitespace-pre-wrap">{displayText}</span>
      <span 
        className={`inline-block w-0.5 h-4 bg-current ml-0.5 transition-opacity duration-100 ${
          showCursor ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ verticalAlign: 'text-top' }}
      />
    </div>
  );
};

export default StreamingText;
