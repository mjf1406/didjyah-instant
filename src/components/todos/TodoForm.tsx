/** @format */

"use client";

import React from "react";
import { type InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type Todo = InstaQLEntity<AppSchema, "todos">;

export default function TodoForm({
    todos,
    addTodo,
    toggleAll,
}: {
    todos: Todo[];
    addTodo: (t: string) => void;
    toggleAll: (t: Todo[]) => void;
}) {
    return (
        <div className="flex items-center h-10 border-b border-gray-300">
            <button
                className="h-full px-2 border-r border-gray-300 flex items-center justify-center"
                onClick={() => toggleAll(todos)}
            >
                <div className="w-5 h-5">
                    <svg viewBox="0 0 20 20">
                        <path
                            d="M5 8 L10 13 L15 8"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            </button>
            <form
                className="flex-1 h-full"
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.input as HTMLInputElement;
                    addTodo(input.value);
                    input.value = "";
                }}
            >
                <input
                    className="w-full h-full px-2 outline-none bg-transparent"
                    autoFocus
                    placeholder="What needs to be done?"
                    type="text"
                    name="input"
                />
            </form>
        </div>
    );
}
