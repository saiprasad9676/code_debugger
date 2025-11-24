
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MinusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAICompletion } from '@/utils/aiService';
import { useTypewriter } from '@/utils/animations';

interface Message {
  id: string;
  content: string;
  from: 'user' | 'ai';
  typing?: boolean;
}

interface AIResponse {
  text: string;
  isError: boolean;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm your AI coding assistant. How can I help you today?",
      from: 'ai'
    }
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      from: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Add temporary AI message to show typing indicator
    const tempAiMessageId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempAiMessageId,
      content: '',
      from: 'ai',
      typing: true
    }]);

    try {
      const aiResponse = await getAICompletion({ text: input });

      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(m => m.id !== tempAiMessageId));

      const aiMessage: Message = {
        id: `ai-response-${Date.now()}`,
        content: aiResponse.text,
        from: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Failed to get AI response");
      setMessages(prev => prev.filter(m => m.id !== tempAiMessageId));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return isVisible ? (
    <div className={`fixed ${isMinimized ? 'bottom-0 right-4 w-auto' : 'bottom-4 right-4 w-80 sm:w-96'} transition-all duration-300 z-40`}>
      <div className="bg-card shadow-xl rounded-xl border overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            {!isMinimized && <span className="font-medium">AI Assistant</span>}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white hover:bg-white/20"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="h-80 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${message.from === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                      }`}
                  >
                    {message.typing ? (
                      <div className="flex space-x-1 items-center h-6">
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t">
              <div className="flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-secondary rounded-l-lg px-3 py-2 focus:outline-none"
                  disabled={isTyping}
                />
                <Button
                  className="rounded-l-none"
                  onClick={sendMessage}
                  disabled={isTyping || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  ) : (
    <Button
      className="fixed bottom-4 right-4 rounded-full shadow-lg"
      size="icon"
      onClick={() => {
        setIsVisible(true);
        setIsMinimized(false);
      }}
    >
      <Bot className="h-5 w-5" />
    </Button>
  );
};

export default AIChat;
