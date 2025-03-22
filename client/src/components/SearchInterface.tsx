import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  onImageSearch: (base64Image: string) => void;
}

const SearchInterface = ({ onSearch, onImageSearch }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  
  const placeholders = [
    "what's bugging you?",
    "give service manager a break"
  ];

  // Rotate placeholders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSearch(query);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      onImageSearch(base64String);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Voice recognition functions
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
        title: "Listening...",
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
      
      // Use our server-side implementation for speech recognition
      // as this is more reliable across browsers
      await sendAudioToServer(base64Audio);
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const sendAudioToServer = async (audioData: any) => {
    try {
      // Determine if we're dealing with a blob or base64 string
      let base64Audio = audioData;
      if (audioData instanceof Blob) {
        base64Audio = await blobToBase64(audioData);
      }
      
      // Send to backend for processing
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: JSON.stringify({ audioBase64: base64Audio }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.text) {
          setQuery(data.text);
          onSearch(data.text);
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
  useEffect(() => {
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
    <Card className="mb-6 shadow-none border-0">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input 
            type="text" 
            placeholder={placeholders[placeholderIndex]} 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white py-3 px-4 pr-10 rounded-lg shadow-sm border-0 focus:ring-2 focus:ring-primary"
          />
          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className={`text-neutral-medium hover:text-primary ${isRecording ? 'text-red-500' : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex justify-center mt-3">
          <Button 
            type="submit"
            className="bg-primary text-white px-5 py-2 rounded-lg shadow hover:bg-primary-dark mr-2"
            disabled={!query.trim() || isProcessing}
          >
            <span className="flex items-center">
              <span className="material-icons mr-1">search</span>
              Search
            </span>
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="bg-white text-neutral-dark px-5 py-2 rounded-lg shadow hover:bg-neutral-lightest border border-neutral-light"
            onClick={triggerFileInput}
            disabled={isProcessing}
          >
            <span className="flex items-center">
              <span className="material-icons mr-1">photo_camera</span>
              Image
            </span>
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
          />
        </div>
      </form>
    </Card>
  );
};

export default SearchInterface;
