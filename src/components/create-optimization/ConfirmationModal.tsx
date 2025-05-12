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
import { useCreateJobDuration } from "@/stores/createJobStore";
import type { Interview } from "~/db/schema";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userMinutes: number;
  interview?: Interview;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userMinutes,
  interview,
}: ConfirmationModalProps) {
  const storedDuration = useCreateJobDuration();
  const duration = interview ? interview.duration : storedDuration;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create Job Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Creating this job profile will cost {duration} minute(s). You currently have{" "}
            {userMinutes} minute(s). Do you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Proceed</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
