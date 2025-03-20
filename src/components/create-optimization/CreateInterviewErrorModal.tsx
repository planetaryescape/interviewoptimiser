import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CreateInterviewErrorModal {
  isOpen: boolean;
  onClose: () => void;
  onTryAgain: () => void;
}

export function CreateInterviewErrorModal({
  isOpen,
  onClose,
  onTryAgain,
}: CreateInterviewErrorModal) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Scheduling Issue</AlertDialogTitle>
          <AlertDialogDescription>
            We encountered an issue with creating your interview. Not to worry, Just click try again
            and we will create the interview for you.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onTryAgain}>Try Again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
