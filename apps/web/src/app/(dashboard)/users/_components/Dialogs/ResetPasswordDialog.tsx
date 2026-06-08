"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useResetUserPassword } from "@/lib/hooks/useUsers";

interface ResetPasswordDialogProps {
  userId: string | null;
  userName: string;
  open: boolean;
  onClose: () => void;
}

export function ResetPasswordDialog({
  userId,
  userName,
  open,
  onClose,
}: ResetPasswordDialogProps) {
  const { mutate: resetPassword, isPending } = useResetUserPassword();

  const handleConfirm = () => {
    if (!userId) return;
    resetPassword(userId, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Send a password reset email to <strong>{userName}</strong>?
          </p>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Sending..." : "Send Reset Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
