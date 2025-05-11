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

interface OutOfMinutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyMinutes: () => void;
}

export function OutOfMinutesModal({ isOpen, onClose, onBuyMinutes }: OutOfMinutesModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Out of Minutes</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ve run out of minutes. Purchase more minutes to continue creating interviews.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onBuyMinutes}>Buy Minutes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
