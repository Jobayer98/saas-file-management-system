"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setError("");
    await onConfirm();
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      setError("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <DialogTitle className="text-xl">Delete Account</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 p-4">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
              What will be deleted:
            </h4>
            <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 list-disc list-inside">
              <li>Your profile and account information</li>
              <li>All uploaded files and folders</li>
              <li>File sharing links and permissions</li>
              <li>Subscription and billing history</li>
              <li>All settings and preferences</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-base">
              Type <span className="font-bold text-red-600">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError("");
              }}
              placeholder="Type DELETE here"
              disabled={isDeleting}
              className={error ? "border-red-500" : ""}
              autoComplete="off"
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10 p-3">
            <p className="text-sm text-orange-900 dark:text-amber-200">
              <strong>Note:</strong> You will be immediately logged out and
              won't be able to recover your account or data.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-red-600"
            onClick={handleConfirm}
            disabled={isDeleting || confirmText !== "DELETE"}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
