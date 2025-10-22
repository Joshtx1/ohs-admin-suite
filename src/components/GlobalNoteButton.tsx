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

export function GlobalNoteButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [takingScreenshot, setTakingScreenshot] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const currentPageName = location.pathname.split('/').filter(Boolean).pop() || 'home';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
          setImage(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
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

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl: string | null = null;

      // Upload image if present
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('action-items')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('action-items')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Create action item
      const { error } = await supabase.from('action_items').insert({
        user_id: user.id,
        title,
        description: description || null,
        page_url: window.location.href,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Note created",
        description: "Your note has been saved successfully.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
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
                  onChange={handleImageChange}
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

              {imagePreview && (
                <div className="mt-4 relative">
                  <img
                    src={imagePreview}
                    alt="Attachment preview"
                    className="max-h-48 rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
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
