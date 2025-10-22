import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Image as ImageIcon, X } from "lucide-react";

interface ViewMediaDialogProps {
  mediaUrl: string;
  type: "screenshot" | "attachment";
}

export function ViewMediaDialog({ mediaUrl, type }: ViewMediaDialogProps) {
  const [open, setOpen] = useState(false);
  
  const isImage = type === "screenshot" || mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {type === "screenshot" ? (
            <ImageIcon className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {type === "screenshot" ? "Screenshot" : "Attachment"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto flex items-center justify-center bg-muted/50 rounded-lg p-4">
          {isImage ? (
            <img 
              src={mediaUrl} 
              alt={type} 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                File preview not available
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.open(mediaUrl, '_blank')}
              >
                Open in New Tab
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
