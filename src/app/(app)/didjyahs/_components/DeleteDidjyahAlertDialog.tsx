"use client";

import React from "react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type DidjyahWithRecords = InstaQLEntity<
  AppSchema,
  "didjyahs",
  { records: {} }
>;

interface DeleteDidjyahAlertDialogProps {
  detail: DidjyahWithRecords;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DeleteDidjyahAlertDialog: React.FC<DeleteDidjyahAlertDialogProps> = ({
  detail,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const handleDelete = async () => {
    try {
      await db.transact(db.tx.didjyahs[detail.id].delete());
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the didjyah.";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <AlertDialogTrigger asChild>
          <Button id={`delete-${detail.id}`} variant={"ghost"} size={"icon"}>
            <Trash />
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {detail.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <b>{detail.name}</b>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDidjyahAlertDialog;

