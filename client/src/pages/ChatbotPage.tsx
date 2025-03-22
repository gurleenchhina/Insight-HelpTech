import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Camera, Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AISearchResponse } from '@/lib/types';
import Layout from '@/components/Layout';
import { apiRequest } from '@/lib/queryClient';

// Define message type
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      content: 'Hello! I\'m your pest control assistant. I can help identify pests and recommend appropriate products based on Ontario regulations. How can I help you today?', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Add a loading message
      const loadingMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: loadingMessageId,
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: true
      }]);

      // Call the API
      const response = await apiRequest<AISearchResponse>('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: userMessage.content })
      });

      // Remove loading message and add real response
      setMessages(prev => {
        const filteredMessages = prev.filter(m => m.id !== loadingMessageId);
        
        let botResponseContent = response.recommendation || 'I couldn\'t process that request.';
        
        // Add product recommendations if available
        if (response.products) {
          if (response.products.primary || response.products.alternative) {
            botResponseContent += '\n\nRecommended Products:';
            if (response.products.primary) {
              botResponseContent += `\n- Primary: ${response.products.primary}`;
            }
            if (response.products.alternative) {
              botResponseContent += `\n- Alternative: ${response.products.alternative}`;
            }
          }
        }
        
        // Add application advice if available
        if (response.applicationAdvice) {
          botResponseContent += `\n\nApplication Advice: ${response.applicationAdvice}`;
        }
        
        return [...filteredMessages, {
          id: (Date.now() + 2).toString(),
          content: botResponseContent,
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    } catch (error) {
      console.error('Error processing chat message:', error);
      
      // Remove loading message and add error response
      setMessages(prev => {
        const filteredMessages = prev.filter(m => !m.isLoading);
        return [...filteredMessages, {
          id: (Date.now() + 2).toString(),
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        }];
      });
      
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRecording = async () => {
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Setup data handling
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Listening...",
        description: "Speak clearly into your microphone",
      });
    } catch (err) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
      console.error("Error accessing microphone:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // Use our server-side implementation for speech recognition
      const response = await apiRequest('/api/speech-to-text', {
        method: 'POST',
        body: JSON.stringify({ audioData: base64Audio })
      });
      
      if (response.text) {
        setInput(response.text);
        setTimeout(() => handleSendMessage(), 300); // Small delay to allow state update
      } else {
        toast({
          title: "Could not understand",
          description: "We couldn't recognize what you said. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract just the base64 data part (remove the prefix)
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: '📷 Image uploaded',
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Add a loading message
      const loadingMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: loadingMessageId,
        content: 'Analyzing image...',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: true
      }]);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          // Call the API
          const response = await apiRequest<AISearchResponse>('/api/image-search', {
            method: 'POST',
            body: JSON.stringify({ image: base64String })
          });

          // Remove loading message and add real response
          setMessages(prev => {
            const filteredMessages = prev.filter(m => m.id !== loadingMessageId);
            
            let botResponseContent = response.recommendation || 'I couldn\'t analyze that image.';
            
            // Add product recommendations if available
            if (response.products) {
              if (response.products.primary || response.products.alternative) {
                botResponseContent += '\n\nRecommended Products:';
                if (response.products.primary) {
                  botResponseContent += `\n- Primary: ${response.products.primary}`;
                }
                if (response.products.alternative) {
                  botResponseContent += `\n- Alternative: ${response.products.alternative}`;
                }
              }
            }
            
            // Add application advice if available
            if (response.applicationAdvice) {
              botResponseContent += `\n\nApplication Advice: ${response.applicationAdvice}`;
            }
            
            return [...filteredMessages, {
              id: (Date.now() + 2).toString(),
              content: botResponseContent,
              sender: 'bot',
              timestamp: new Date()
            }];
          });
        } catch (error) {
          console.error('Error processing image:', error);
          
          // Remove loading message and add error response
          setMessages(prev => {
            const filteredMessages = prev.filter(m => !m.isLoading);
            return [...filteredMessages, {
              id: (Date.now() + 2).toString(),
              content: 'Sorry, I encountered an error analyzing your image. Please try again or describe the pest in text.',
              sender: 'bot',
              timestamp: new Date()
            }];
          });
          
          toast({
            title: "Error",
            description: "Failed to analyze image. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        setIsProcessing(false);
        
        // Remove loading message and add error response
        setMessages(prev => {
          const filteredMessages = prev.filter(m => !m.isLoading);
          return [...filteredMessages, {
            id: (Date.now() + 2).toString(),
            content: 'Sorry, I encountered an error reading your image. Please try again.',
            sender: 'bot',
            timestamp: new Date()
          }];
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsProcessing(false);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    return (
      <div
        key={message.id}
        className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-md rounded-lg p-3 ${
            message.sender === 'user'
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-neutral-100 dark:bg-neutral-800 rounded-bl-none'
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Processing...</span>
            </div>
          ) : (
            message.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))
          )}
          <div
            className={`text-xs mt-1 ${
              message.sender === 'user' ? 'text-primary-100' : 'text-neutral-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout activeTab="Chatbot" onTabChange={() => {}}>
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="min-h-[70vh] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center">
              <div className="bg-primary-light bg-opacity-20 p-2 rounded-full mr-3">
                <span className="material-icons text-primary">smart_toy</span>
              </div>
              Pest Control Chatbot
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-[calc(70vh-11rem)]">
              <div className="pr-4">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="pt-2">
            <div className="w-full flex flex-col">
              <div className="relative w-full">
                <Input
                  className="pr-24"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isProcessing}
                />
                
                <div className="absolute right-0 top-0 h-full flex items-center space-x-1 mr-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-neutral-500 hover:text-primary"
                    onClick={handleImageClick}
                    disabled={isProcessing}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`text-neutral-500 hover:text-primary ${isRecording ? 'text-red-500' : ''}`}
                    onMouseDown={handleStartRecording}
                    onMouseUp={handleStopRecording}
                    onTouchStart={handleStartRecording}
                    onTouchEnd={handleStopRecording}
                    disabled={isProcessing}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:text-primary-dark"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isProcessing}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-neutral-500 text-center">
                <p>Ask questions about pest identification, product recommendations, or application techniques</p>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </Layout>
  );
};

export default ChatbotPage;