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
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants";
import FAIconPicker from "./FAIconPicker";
import ColorPicker from "./ShadcnColorPicker";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { DialogDrawer } from "./DialogDrawer";

const didjyahSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["since", "timer", "stopwatch", "daily", "goal"]),
    icon: z.string().optional(),
    color: z.string().optional(),
    iconColor: z.string().optional(),
    description: z.string().optional(),
    unit: z.string().optional(),
    quantity: z.number().optional(),
    dailyGoal: z.number().optional(),
    timer: z.number().optional(),
    stopwatch: z.boolean().optional(),
    inputs: z.string().optional(),
    sinceLast: z.boolean().optional(),
});

type DidjyahFormValues = z.infer<typeof didjyahSchema>;

export function CreateDidjyahDialog() {
    const user = db.useUser();
    const [open, setOpen] = React.useState(false);

    const form = useForm<DidjyahFormValues>({
        resolver: zodResolver(didjyahSchema),
        defaultValues: {
            name: "",
            type: "since",
            icon: "",
            color: "#000000",
            iconColor: "#000000",
            description: "",
            unit: "",
            quantity: undefined,
            dailyGoal: undefined,
            timer: undefined,
            stopwatch: false,
            inputs: "",
            sinceLast: false,
        },
    });

    const onSubmit: SubmitHandler<DidjyahFormValues> = async (data) => {
        try {
            // Parse the inputs JSON; if invalid, fallback to storing the string or null.
            let parsedInputs: unknown = null;
            if (data.inputs) {
                try {
                    parsedInputs = JSON.parse(data.inputs);
                } catch (error) {
                    console.error("Error parsing inputs JSON:", error);
                    parsedInputs = data.inputs;
                }
            }

            const now = Date.now();
            const didjyahId = id();

            // Build update object, only including fields with actual values
            const updateData: Record<string, unknown> = {
                name: data.name,
                type: data.type,
                createdDate: now,
                updatedDate: now,
            };

            if (data.icon) updateData.icon = data.icon;
            if (data.color) updateData.color = data.color;
            if (data.iconColor) updateData.iconColor = data.iconColor;
            if (data.description) updateData.description = data.description;
            if (data.unit) updateData.unit = data.unit;
            if (data.quantity !== undefined)
                updateData.quantity = data.quantity;
            if (data.dailyGoal !== undefined)
                updateData.dailyGoal = data.dailyGoal;
            if (data.timer !== undefined) updateData.timer = data.timer;
            if (data.stopwatch !== undefined)
                updateData.stopwatch = data.stopwatch;
            if (data.sinceLast !== undefined)
                updateData.sinceLast = data.sinceLast;
            if (parsedInputs !== null) updateData.inputs = parsedInputs;

            await db.transact(
                db.tx.didjyahs[didjyahId]
                    .update(updateData)
                    .link({ owner: user.id })
            );

            form.reset();
            setOpen(false);
        } catch (error) {
            console.error(error);
            const message =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred";
            toast.error(message);
        }
    };

    return (
        <DialogDrawer
            open={open}
            onOpenChange={setOpen}
            trigger={<Button variant="default">Create {APP_NAME}</Button>}
            className="overflow-y-auto sm:max-w-[425px]"
        >
            <DialogHeader>
                <DialogTitle>Create New {APP_NAME}</DialogTitle>
                <DialogDescription>
                    Fill in the following details to create a new {APP_NAME}.
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
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Didjyah Name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Icon</FormLabel>
                                <FormControl>
                                    <FAIconPicker
                                        selectedIcon={
                                            field.value?.includes("|")
                                                ? (() => {
                                                      const [prefix, name] =
                                                          field.value.split(
                                                              "|"
                                                          );
                                                      return prefix && name
                                                          ? ({
                                                                prefix: prefix as IconPrefix,
                                                                name: name as IconName,
                                                            } as const)
                                                          : undefined;
                                                  })()
                                                : undefined
                                        }
                                        onSelectIcon={(iconName, prefix) =>
                                            field.onChange(
                                                `${prefix}|${iconName}`
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="iconColor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Icon Color</FormLabel>
                                <FormControl>
                                    <ColorPicker
                                        selectedColor={field.value ?? "#000000"}
                                        onSelectColor={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl>
                                    <ColorPicker
                                        selectedColor={field.value ?? "#000000"}
                                        onSelectColor={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Description"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Unit of measure"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Quantity"
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value);
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dailyGoal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Daily Goal</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Daily Goal"
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value);
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="timer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Timer (in seconds)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Timer value"
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value);
                                            field.onChange(value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="stopwatch"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-4">
                                <FormLabel>Use Stopwatch</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? false}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sinceLast"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-4">
                                <FormLabel>Since Last</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? false}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="inputs"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Inputs (JSON)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='e.g., {"blah": "example"}'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="submit">Create {APP_NAME}</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogDrawer>
    );
}

export default CreateDidjyahDialog;
