'use client';

import { useState, useRef } from 'react';
import { Send, Mic, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string, inputType: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message, 'text');
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setRecordingDuration(0);
  };

  const cancelRecording = () => {
    stopRecording();
    setMessage('');
  };

  const confirmRecording = () => {
    const voiceMessage = 'This is a simulated voice input: Create a post about AI innovation';
    setMessage(voiceMessage);
    stopRecording();
    onSend(voiceMessage, 'voice');
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Generate waveform bars for visual effect
  const generateWaveformBars = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const height = Math.random() * 20 + 4; // Random height between 4-24px
      bars.push(
        <div
          key={i}
          className="bg-gray-600 rounded-sm animate-pulse"
          style={{
            width: '2px',
            height: `${height}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.5s'
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="mx-auto max-w-4xl">
        {/* Main Input Container */}
        <div className="relative flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          {/* Plus Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
            disabled={disabled || isRecording}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Input Content */}
          <div className="flex-1 flex items-center">
            {isRecording ? (
              // Voice Recording UI
              <div className="flex items-center gap-2 w-full">
                {/* Dotted line */}
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>
                
                {/* Waveform */}
                <div className="flex items-center gap-1 flex-1 justify-center">
                  {generateWaveformBars()}
                </div>
                
                {/* Dotted line */}
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ) : (
              // Text Input
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder="Ask anything"
                className="min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={disabled}
                rows={1}
              />
            )}
          </div>

          {/* Action Buttons */}
          {isRecording ? (
            // Recording buttons
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
                onClick={cancelRecording}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 w-8 rounded-full p-0 bg-gradient-brand hover:opacity-90"
                onClick={confirmRecording}
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          ) : (
            // Normal buttons
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
                onClick={startRecording}
                disabled={disabled}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className={`h-8 w-8 rounded-full p-0 ${
                  message.trim() 
                    ? 'bg-gradient-brand hover:opacity-90' 
                    : 'bg-gray-200 text-gray-400'
                }`}
                onClick={handleSend}
                disabled={!message.trim() || disabled}
              >
                <Send className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Recording Duration */}
        {isRecording && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Recording... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
          </div>
        )}

        {/* Footer Text */}
        <p className="mt-2 text-center text-xs text-gray-500">
          EchoWrite can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}