import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CreateJobErrorModalProps {
  isOpen: boolean;
  onTryAgain: () => void;
  onClose: () => void;
}

export function CreateJobErrorModal({ isOpen, onTryAgain, onClose }: CreateJobErrorModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Error Creating Job</AlertDialogTitle>
          <AlertDialogDescription>
            There was an error creating your job. Please try again later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Cancel</AlertDialogAction>
          <AlertDialogAction onClick={onTryAgain}>Try Again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
