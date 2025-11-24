
import { useState, useEffect, useRef } from 'react';

// Custom hook for typewriter effect
export const useTypewriter = (text: string, speed: number = 50, delay: number = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const currentIndexRef = useRef(0);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (delay > 0) {
      timeout = setTimeout(() => {
        setIsTyping(true);
      }, delay);
    } else {
      setIsTyping(true);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
      setIsTyping(false);
      currentIndexRef.current = 0;
      setDisplayText('');
    };
  }, [delay, text]);
  
  useEffect(() => {
    if (!isTyping) return;
    
    const interval = setInterval(() => {
      if (currentIndexRef.current < text.length) {
        setDisplayText(text.substring(0, currentIndexRef.current + 1));
        currentIndexRef.current += 1;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [isTyping, speed, text]);
  
  return { displayText, isTyping };
};

// Custom hook for fade-in effect
export const useFadeIn = (delay: number = 0, duration: number = 300) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return {
    style: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
      transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    },
    isVisible,
  };
};

// Custom hook for intersection observer (reveal on scroll)
export const useScrollReveal = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold: 0.1, rootMargin: '0px', ...options });
    
    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);
  
  return { ref, isIntersecting };
};
