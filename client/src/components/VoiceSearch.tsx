import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VoiceSearchProps {
  onSearchResult: (text: string) => void;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearchResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioPermissionGranted(true);
      
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
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (err) {
      setAudioPermissionGranted(false);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
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
      
      // Send to backend for processing
      const response = await apiRequest('/api/speech-to-text', {
        method: 'POST',
        body: JSON.stringify({ audioBase64: base64Audio }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.text) {
          toast({
            title: "Voice processed",
            description: `"${data.text}"`,
          });
          
          // Pass the transcribed text back to the parent
          onSearchResult(data.text);
        } else {
          toast({
            title: "Could not understand",
            description: "We couldn't recognize what you said. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Processing Error",
          description: "Failed to process audio. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Network error while processing audio.",
        variant: "destructive"
      });
      console.error("Audio processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to convert a Blob to base64
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

  // Request permission check when component mounts
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const { state } = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setAudioPermissionGranted(state === 'granted');
      } catch (err) {
        // If the browser doesn't support permission query for microphone
        console.log("Permission query not supported");
      }
    };
    
    checkPermission();
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-center mb-3">
            {audioPermissionGranted === false
              ? "Microphone access denied. Please enable in your browser settings."
              : "Press and hold to speak your question"}
          </p>
          
          <Button
            size="lg"
            className={`rounded-full w-16 h-16 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
            disabled={isProcessing || audioPermissionGranted === false}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2">
            {isProcessing 
              ? "Processing your voice..." 
              : isRecording 
                ? "Listening..." 
                : "Tap to speak"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceSearch;