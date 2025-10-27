/** @format */

"use client";

import React from "react";
import { id, type InstaQLEntity } from "@instantdb/react";
import { db } from "@/lib/db";
import type { AppSchema } from "@/instant.schema";
import TodoForm from "@/components/todos/TodoForm";
import TodoList from "@/components/todos/TodoList";
import TodoActionBar from "@/components/todos/TodoActionBar";
import UserCard from "@/components/user/UserCard";
import ThemeToggle from "@/components/ThemeToggle";

type Todo = InstaQLEntity<AppSchema, "todos">;

const room = db.room("todos");

export default function SignedInApp() {
    const user = db.useUser();
    const { isLoading, error, data } = db.useQuery({
        todos: {
            $: { where: { "owner.id": user.id } },
        },
    });
    const { peers } = db.rooms.usePresence(room);
    const numUsers = 1 + Object.keys(peers).length;
    if (isLoading) return null;
    if (error)
        return <div className="text-red-500 p-4">Error: {error.message}</div>;
    const { todos } = data;

    function addTodo(text: string) {
        const tx = db.tx.todos[id()].update({
            text,
            done: false,
            createdAt: Date.now(),
            creatorId: user.id,
        });

        if (user?.id) {
            db.transact(tx.link({ owner: user.id }));
            return;
        }

        let guestId = localStorage.getItem("guestId");
        if (!guestId) {
            guestId = crypto.randomUUID();
            localStorage.setItem("guestId", guestId);
        }

        db.transact(tx.update({ guestId }));
    }

    function deleteTodo(todo: Todo) {
        db.transact(db.tx.todos[todo.id].delete());
    }

    function toggleDone(todo: Todo) {
        db.transact(db.tx.todos[todo.id].update({ done: !todo.done }));
    }

    function deleteCompleted(all: Todo[]) {
        const completed = all.filter((todo) => todo.done);
        const txs = completed.map((todo) => db.tx.todos[todo.id].delete());
        db.transact(txs);
    }

    function toggleAll(all: Todo[]) {
        const newVal = !all.every((todo) => todo.done);
        db.transact(
            all.map((todo) => db.tx.todos[todo.id].update({ done: newVal }))
        );
    }

    return (
        <div className="font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
            <div className="flex items-center gap-4">
                <UserCard />
                <ThemeToggle />
                <div className="text-xs text-gray-500">
                    Number of users online: {numUsers}
                </div>
            </div>
            <h2 className="tracking-wide text-5xl text-gray-300">todos</h2>
            <div className="border border-gray-300 max-w-xs w-full">
                <TodoForm
                    todos={todos}
                    addTodo={addTodo}
                    toggleAll={toggleAll}
                />
                <TodoList
                    todos={todos}
                    toggleDone={toggleDone}
                    deleteTodo={deleteTodo}
                />
                <TodoActionBar
                    todos={todos}
                    deleteCompleted={deleteCompleted}
                />
            </div>
            <div className="text-xs text-center">
                Open another tab to see todos update in realtime!
            </div>
            <button
                className="mt-4 text-sm text-gray-300 hover:text-gray-500"
                onClick={() => db.auth.signOut()}
            >
                Sign out
            </button>
        </div>
    );
}
