import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActionItemDialogProps {
  embedded?: boolean;
}

export function ActionItemDialog({ embedded = false }: ActionItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [includePageUrl, setIncludePageUrl] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

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
        const { error: uploadError, data } = await supabase.storage
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
        page_url: includePageUrl ? window.location.href : null,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Action item created",
        description: "Your note has been saved successfully.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setIncludePageUrl(true);
      setImage(null);
      setImagePreview(null);
      setOpen(false);
    } catch (error) {
      console.error('Error creating action item:', error);
      toast({
        title: "Error",
        description: "Failed to create action item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of the action item"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details, context, or notes..."
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="pageUrl"
          checked={includePageUrl}
          onCheckedChange={(checked) => setIncludePageUrl(checked as boolean)}
        />
        <Label htmlFor="pageUrl" className="cursor-pointer">
          Include current page link ({window.location.pathname})
        </Label>
      </div>

      <div>
        <Label>Attach Image (optional)</Label>
        {!imagePreview ? (
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <Label
              htmlFor="image-upload"
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent"
            >
              <Upload className="h-5 w-5" />
              Click to upload image
            </Label>
          </div>
        ) : (
          <div className="mt-2 relative">
            <img
              src={imagePreview}
              alt="Preview"
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
          {loading ? "Creating..." : "Create Action Item"}
        </Button>
      </div>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Action Item / Note</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
