"use client";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";

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
import { createDidjyah } from "@/app/actions/createDidjyah";
import { DidjyahOptions } from "@/app/api/queryOptions";
import type { DidjyahDb } from "@/server/db/types";
import FAIconPicker from "../FAIconPicker";
import ColorPicker from "../ShadcnColorPicker";
import { generateUuidWithPrefix } from "@/lib/utils";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { DialogDrawer } from "../ui/dialog-drawer";

// Extend schema to include two new fields: color and icon_color.
// The "icon" field will be stored as a string formatted as "prefix|iconName".
const didjyahSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["since", "timer", "stopwatch", "daily", "goal"]),
  // The icon field now holds a string like "fas|cat"
  icon: z.string().optional(),
  // New fields:
  color: z.string().optional(), // A general color
  icon_color: z.string().optional(), // Color specific for the icon
  description: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.coerce.number().optional(),
  daily_goal: z.coerce.number().optional(),
  timer: z.coerce.number().optional(),
  stopwatch: z.boolean().optional(),
  since_last: z.boolean().optional(),
  inputs: z.string().optional(),
});

// Define the form values type from the schema
type DidjyahFormValues = z.infer<typeof didjyahSchema>;

export function CreateDidjyahDialog() {
  const queryClient = useQueryClient();

  const form = useForm<DidjyahFormValues>({
    resolver: zodResolver(didjyahSchema),
    defaultValues: {
      name: "",
      type: "since",
      icon: "", // will be set as "prefix|iconName"
      color: "#000000",
      icon_color: "#000000",
      description: "",
      unit: "",
      quantity: undefined,
      daily_goal: undefined,
      timer: undefined,
      stopwatch: false,
      inputs: "",
    },
  });

  const onSubmit: SubmitHandler<DidjyahFormValues> = async (data) => {
    try {
      // Parse the inputs JSON; if invalid, fallback to storing the string.
      let parsedInputs: unknown = null;
      if (data.inputs) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          parsedInputs = JSON.parse(data.inputs);
        } catch (error) {
          console.error("Error parsing inputs JSON:", error);
          parsedInputs = data.inputs;
        }
      }

      // Create an optimistic record adhering to DidjyahDb.
      // For fields like user_id where data comes from the server, we use dummy values.
      const optimisticRecord: DidjyahDb = {
        id: generateUuidWithPrefix("didjyah_"),
        user_id: "optimistic",
        name: data.name,
        type: data.type,
        icon: data.icon ?? "",
        color: data.color ?? "#000000",
        icon_color: data.icon_color ?? "#000000",
        description: data.description ?? "",
        unit: data.unit ?? "",
        quantity: data.quantity,
        daily_goal: data.daily_goal,
        timer: data.timer,
        stopwatch: data.stopwatch ?? false,
        since_last: data.since_last ?? false,
        // inputs: parsedInputs, // Uncomment if needed
        records: [],
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      // Optimistically update the cache for didjyahs.
      queryClient.setQueryData<DidjyahDb[]>(DidjyahOptions.queryKey, (old) =>
        old ? [...old, optimisticRecord] : [optimisticRecord],
      );

      // Close the dialog/drawer immediately for snappiness.
      // (Handled inside the DialogDrawer by an external trigger in most cases.)

      // Fire off the server call in the background.
      const response = await createDidjyah(optimisticRecord);
      if (response.success) {
        toast.success(`${APP_NAME} has been created`);
        form.reset();
      } else {
        toast.error(response.message ?? "Error creating " + APP_NAME);
        // Optionally, you can roll back the optimistic update here.
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <DialogDrawer
      trigger={<Button variant="default">Create {APP_NAME}</Button>}
      className="overflow-y-auto sm:max-w-[425px]"
    >
      {/* Header */}
      <DialogHeader>
        <DialogTitle>Create New {APP_NAME}</DialogTitle>
        <DialogDescription>
          Fill in the following details to create a new {APP_NAME}.
        </DialogDescription>
      </DialogHeader>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Didjyah Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Icon Picker */}
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
                            const [prefix, name] = field.value.split("|");
                            // Only pass if both prefix and name are defined
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
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                      field.onChange(`${prefix}|${iconName}`)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Icon Color Picker */}
          <FormField
            control={form.control}
            name="icon_color"
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

          {/* General Color Picker */}
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

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit */}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="Unit of measure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity */}
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

          {/* Daily Goal */}
          <FormField
            control={form.control}
            name="daily_goal"
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

          {/* Timer */}
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

          {/* Stopwatch */}
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

          {/* Since Last */}
          <FormField
            control={form.control}
            name="since_last"
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

          {/* Inputs (JSON) */}
          <FormField
            control={form.control}
            name="inputs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inputs (JSON)</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., {"blah": "example"}' {...field} />
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
