'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showIterations, setShowIterations] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>

        {!isUser && message.iterations && message.iterations.length > 0 && (
          <div className="mt-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIterations(!showIterations)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showIterations ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Hide Iterations
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  View {message.iterations.length} Iterations
                </>
              )}
            </Button>

            {showIterations && (
              <div className="mt-2 space-y-2">
                {message.iterations.map((iteration, idx) => (
                  <Card key={idx} className="border-l-4 border-purple-400 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        Iteration {idx + 1}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="mb-1 font-semibold text-gray-700 dark:text-gray-300">
                          Generated:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{iteration.generation}</p>
                      </div>
                      <div>
                        <p className="mb-1 font-semibold text-purple-700 dark:text-purple-400">
                          AI Feedback:
                        </p>
                        <p className="italic text-gray-500 dark:text-gray-500">
                          {iteration.reflection}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!isUser && (
          <div className="mt-1 flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

