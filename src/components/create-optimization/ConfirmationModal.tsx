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
import { useCreateInterviewDuration } from "@/stores/createInterviewStore";
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
  const storedDuration = useCreateInterviewDuration();
  const duration = interview ? interview.duration : storedDuration;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start Mock Interview </AlertDialogTitle>
          <AlertDialogDescription>
            This mock interview will cost {duration} minute(s). You currently have {userMinutes}{" "}
            minute(s). Do you want to proceed?
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
