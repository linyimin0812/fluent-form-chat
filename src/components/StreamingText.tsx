
import React, { useState, useEffect } from 'react';

interface StreamingTextProps {
  text: string;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayText(text);
    
    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [text]);

  return (
    <div className="whitespace-pre-wrap break-words">
      {displayText}
      {showCursor && (
        <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
      )}
    </div>
  );
};

export default StreamingText;
