'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterMarkdown = ({ content = '', speed = 15, onComplete }: Props) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    // ✅ Guard against undefined/empty content
    if (!content) {
      if (onComplete) onComplete();
      return;
    }
    let currentString = '';
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < content.length) {
        currentString += content.charAt(i);
        setDisplayedContent(currentString);
        i++;
      } else {
        clearInterval(typingInterval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(typingInterval);
  }, [content, speed, onComplete]);

  return <ReactMarkdown>{displayedContent}</ReactMarkdown>;
};

export default TypewriterMarkdown;