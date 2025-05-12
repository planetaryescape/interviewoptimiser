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
import type { Job } from "~/db/schema";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userMinutes: number;
  job?: Job;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userMinutes,
  job,
}: ConfirmationModalProps) {
  const storedDuration = useCreateJobDuration();
  const duration = job ? job.duration : storedDuration;

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
