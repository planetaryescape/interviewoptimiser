import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OutOfCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyCredits: () => void;
}

export function OutOfCreditsModal({
  isOpen,
  onClose,
  onBuyCredits,
}: OutOfCreditsModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Out of Credits</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ve run out of credits. Purchase more credits to continue
            optimizing CVs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onBuyCredits}>
            Buy Credits
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
