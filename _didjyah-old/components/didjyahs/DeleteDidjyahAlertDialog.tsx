"use client";

import React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteDidjyah } from "@/app/actions/deleteDidjyah";
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
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import type { DidjyahDb } from "@/server/db/types";

interface DeleteDidjyahAlertDialogProps {
  detail: DidjyahDb;
}

const DeleteDidjyahAlertDialog: React.FC<DeleteDidjyahAlertDialogProps> = ({
  detail,
}) => {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    // Optimistically update the cache before the server call
    queryClient.setQueryData<DidjyahDb[]>(["didjyahs"], (oldData) => {
      if (!oldData) return oldData;
      return oldData.filter((d) => d.id !== detail.id);
    });

    // Call the server action
    const result = await deleteDidjyah(detail.id);
    if (!result.success) {
      // If deletion fails, you might want to rollback the cache update.
      // This is a basic example that simply notifies the user.
      toast.error(
        result.message ?? "An error occurred while deleting the didjyah.",
      );
      // Optionally refetch the data
      void queryClient.invalidateQueries({ queryKey: ["didjyahs"] });
    } else {
      toast.success(`${detail.name} deleted`);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button id={`delete-${detail.id}`} variant={"ghost"} size={"icon"}>
          <Trash />
        </Button>
      </AlertDialogTrigger>
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
