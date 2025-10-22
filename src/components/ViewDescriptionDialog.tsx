import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface ViewDescriptionDialogProps {
  description: string;
}

export function ViewDescriptionDialog({ description }: ViewDescriptionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto py-1">
          <p className="text-sm text-muted-foreground truncate max-w-xs text-left">
            {description}
          </p>
          <Eye className="ml-2 h-3 w-3 flex-shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Full Description</DialogTitle>
          <DialogDescription>
            Complete note details
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
