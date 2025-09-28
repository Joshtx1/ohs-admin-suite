import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoUpload: (photoUrl: string) => void;
  traineeId?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoUpload,
  traineeId
}) => {
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${traineeId || Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('trainee-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trainee-photos')
        .getPublicUrl(fileName);

      onPhotoUpload(publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast.error('Camera not available');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setUploading(true);
      try {
        const fileName = `${traineeId || Date.now()}_camera.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('trainee-photos')
          .upload(fileName, blob, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trainee-photos')
          .getPublicUrl(fileName);

        onPhotoUpload(publicUrl);
        toast.success('Photo captured successfully');
        stopCamera();
      } catch (error) {
        console.error('Error uploading captured photo:', error);
        toast.error('Failed to upload captured photo');
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-32 h-40">
          <AvatarImage src={currentPhotoUrl || undefined} className="object-cover" />
          <AvatarFallback className="text-2xl bg-muted">
            <Camera className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startCamera}
            disabled={uploading || showCamera}
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-gray-200 rounded"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex justify-center space-x-4 mt-4">
              <Button onClick={capturePhoto} disabled={uploading}>
                Capture Photo
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};