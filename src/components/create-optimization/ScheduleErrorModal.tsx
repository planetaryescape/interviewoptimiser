import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateInterviewActions } from "@/stores/createInterviewStore";

interface ScheduleErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleErrorModal({
  isOpen,
  onClose,
}: ScheduleErrorModalProps) {
  const { resetStore } = useCreateInterviewActions();

  const handleClose = () => {
    onClose();
    resetStore();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Scheduling Issue</AlertDialogTitle>
          <AlertDialogDescription>
            We encountered an issue with scheduling your optimization. Not to
            worry, we have scheduled it to be tried again soon. This will result
            in your having to wait a little longer for it to be done.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
