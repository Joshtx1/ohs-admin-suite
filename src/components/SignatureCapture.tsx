import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignatureCaptureProps {
  currentSignatureUrl?: string | null;
  onSignatureCapture: (signatureUrl: string) => void;
  traineeId?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  currentSignatureUrl,
  onSignatureCapture,
  traineeId
}) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const [uploading, setUploading] = useState(false);

  const clearSignature = () => {
    sigRef.current?.clear();
  };

  const saveSignature = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast.error('Please provide a signature');
      return;
    }

    setUploading(true);
    try {
      const dataURL = sigRef.current.toDataURL('image/png');
      const blob = await fetch(dataURL).then(res => res.blob());
      
      const fileName = `${traineeId || Date.now()}_signature.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('trainee-signatures')
        .upload(fileName, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trainee-signatures')
        .getPublicUrl(fileName);

      onSignatureCapture(publicUrl);
      toast.success('Signature saved successfully');
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        {currentSignatureUrl ? (
          <div className="space-y-4">
            <div className="w-full h-32 border border-gray-200 rounded bg-gray-50 flex items-center justify-center">
              <img 
                src={currentSignatureUrl} 
                alt="Signature" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSignatureCapture('')}
            >
              Clear Signature
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded">
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{
                  width: 400,
                  height: 150,
                  className: 'signature-canvas w-full'
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveSignature}
                disabled={uploading}
              >
                Save Signature
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};