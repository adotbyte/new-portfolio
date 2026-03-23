import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// Add onComplete to the props
const TypewriterMarkdown = ({ content, speed = 15, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    let currentString = "";
    let i = 0;
    
    const typingInterval = setInterval(() => {
      if (i < content.length) {
        currentString += content.charAt(i);
        setDisplayedContent(currentString);
        i++;
      } else {
        clearInterval(typingInterval);
        // TRIGGER THE COMPLETION HERE
        if (onComplete) onComplete(); 
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [content, speed, onComplete]);

  return <ReactMarkdown>{displayedContent}</ReactMarkdown>;
};

export default TypewriterMarkdown;