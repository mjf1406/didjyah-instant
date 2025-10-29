/** @format */

"use client";

import React from "react";
import type { Todo } from "@/lib/types";

export default function TodoActionBar({
    todos,
    deleteCompleted,
}: {
    todos: Todo[];
    deleteCompleted: (t: Todo[]) => void;
}) {
    return (
        <div className="flex justify-between items-center h-10 px-2 text-xs border-t border-gray-300">
            <div>
                Remaining todos: {todos.filter((todo) => !todo.done).length}
            </div>
            <button
                className=" text-gray-300 hover:text-gray-500"
                onClick={() => deleteCompleted(todos)}
            >
                Delete Completed
            </button>
        </div>
    );
}
