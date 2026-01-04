/** @format */

"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { DialogDrawer } from "./DialogDrawer";
import { useUndo } from "@/lib/undo";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type DidjyahWithRecords = InstaQLEntity<AppSchema, "didjyahs", { records: {} }>;

const customDidjyahSchema = z.object({
    dateTime: z.string().min(1, "Date and time are required"),
});

type CustomDidjyahFormValues = z.infer<typeof customDidjyahSchema>;

interface CustomDidjyahDialogProps {
    didjyah: DidjyahWithRecords;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

// Helper function to convert Date to datetime-local string format
function dateToLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CustomDidjyahDialog({
    didjyah,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: CustomDidjyahDialogProps) {
    const user = db.useUser();
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const { registerAction } = useUndo();

    const form = useForm<CustomDidjyahFormValues>({
        resolver: zodResolver(customDidjyahSchema),
        defaultValues: {
            dateTime: dateToLocalDateTime(new Date()),
        },
    });

    // Reset form when dialog opens
    React.useEffect(() => {
        if (open) {
            form.reset({
                dateTime: dateToLocalDateTime(new Date()),
            });
        }
    }, [open, form]);

    const onSubmit: SubmitHandler<CustomDidjyahFormValues> = async (data) => {
        try {
            // Convert datetime-local string to timestamp
            const selectedDate = new Date(data.dateTime);
            const timestamp = selectedDate.getTime();

            // Validate that the date is reasonable (not too far in the past or future)
            const now = Date.now();
            const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
            const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;

            if (timestamp < oneYearAgo) {
                toast.error("Date cannot be more than one year in the past");
                return;
            }

            if (timestamp > oneYearFromNow) {
                toast.error("Date cannot be more than one year in the future");
                return;
            }

            // Create the didjyah record with custom timestamp
            const recordId = id();
            await db.transact(
                db.tx.didjyahRecords[recordId]
                    .update({
                        createdDate: timestamp,
                        updatedDate: timestamp,
                        endDate: timestamp,
                    })
                    .link({ didjyah: didjyah.id })
                    .link({ owner: user.id })
            );

            registerAction({
                type: "create",
                entityType: "didjyahRecords",
                entityId: recordId,
                links: { didjyah: didjyah.id, owner: user.id },
                message: `Custom record added to "${didjyah.name}"`,
            });

            form.reset();
            setOpen(false);
        } catch (error) {
            console.error(error);
            const message =
                error instanceof Error
                    ? error.message
                    : "An error occurred while creating the custom DidjYah";
            toast.error(message);
        }
    };

    return (
        <DialogDrawer
            trigger={
                <Button variant="ghost" size="icon" className="hidden">
                    <></>
                </Button>
            }
            open={open}
            onOpenChange={setOpen}
            className="overflow-y-auto sm:max-w-[425px]"
        >
            <DialogHeader>
                <DialogTitle>Custom DidjYah</DialogTitle>
                <DialogDescription>
                    Set a custom date and time for {didjyah.name}.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="dateTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date and Time</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create DidjYah</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogDrawer>
    );
}

export default CustomDidjyahDialog;

