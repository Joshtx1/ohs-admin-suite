import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Paperclip, StickyNote, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface GlobalNoteButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalNoteButton({ open: externalOpen, onOpenChange }: GlobalNoteButtonProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [takingScreenshot, setTakingScreenshot] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const currentPageName = location.pathname.split('/').filter(Boolean).pop() || 'home';

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const takeScreenshot = async () => {
    setTakingScreenshot(true);
    try {
      // Close dialog temporarily to capture clean screenshot
      setOpen(false);
      
      // Wait a bit for dialog to close
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
      });
      
      // Reopen dialog
      setOpen(true);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
          setScreenshot(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setScreenshotPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({
        title: "Screenshot failed",
        description: "Could not capture screenshot. You can still upload an image manually.",
        variant: "destructive",
      });
      setOpen(true);
    } finally {
      setTakingScreenshot(false);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let screenshotUrl: string | null = null;
      let attachmentUrl: string | null = null;

      // Upload screenshot if present
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${user.id}/screenshot-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('action-items')
          .upload(fileName, screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('action-items')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      // Upload attachment if present
      if (attachment) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${user.id}/attachment-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('action-items')
          .upload(fileName, attachment);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('action-items')
          .getPublicUrl(fileName);
        
        attachmentUrl = publicUrl;
      }

      // Create action item
      const { error } = await supabase.from('action_items').insert({
        user_id: user.id,
        title,
        description: description || null,
        page_url: window.location.href,
        screenshot_url: screenshotUrl,
        attachment_url: attachmentUrl,
      });

      if (error) throw error;

      toast({
        title: "Note created",
        description: "Your note has been saved successfully.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setScreenshot(null);
      setScreenshotPreview(null);
      setAttachment(null);
      setAttachmentPreview(null);
      setOpen(false);
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[100]"
        title="Add Quick Note"
      >
        <StickyNote className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="page">Page</Label>
              <Input
                id="page"
                value={currentPageName}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="title">Note Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details..."
                rows={4}
              />
            </div>

            <div>
              <Label>Attachments</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={takeScreenshot}
                  disabled={takingScreenshot}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {takingScreenshot ? "Capturing..." : "Screenshot"}
                </Button>
                
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleAttachmentChange}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    asChild
                  >
                    <span>
                      <Paperclip className="h-4 w-4" />
                      Attach File
                    </span>
                  </Button>
                </Label>
              </div>

              {screenshotPreview && (
                <div className="mt-4 relative">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    className="max-h-48 rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeScreenshot}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {attachmentPreview && (
                <div className="mt-4 relative">
                  {attachment?.type.startsWith('image/') ? (
                    <img
                      src={attachmentPreview}
                      alt="Attachment preview"
                      className="max-h-48 rounded-md border"
                    />
                  ) : (
                    <div className="p-4 border rounded-md flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">{attachment?.name}</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeAttachment}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !title}>
                {loading ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
