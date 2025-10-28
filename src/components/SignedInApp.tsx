/** @format */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { id, type InstaQLEntity } from "@instantdb/react";
import { db } from "@/lib/db";
import type { AppSchema } from "@/instant.schema";
import TodoForm from "@/components/todos/TodoForm";
import TodoList from "@/components/todos/TodoList";
import TodoActionBar from "@/components/todos/TodoActionBar";
import UserCard from "@/components/user/UserCard";

type Todo = InstaQLEntity<AppSchema, "todos">;

const room = db.room("todos");

function getOrCreateGuestId(): string {
    if (typeof window === "undefined") return "";
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
    }
    return guestId;
}

export default function SignedInApp() {
    const [signedInUserId, setSignedInUserId] = useState<string | null>(null);
    const [ownedTodos, setOwnedTodos] = useState<Todo[]>([]);
    const [guestId, setGuestId] = useState<string | null>(null);

    useEffect(() => {
        const id = getOrCreateGuestId();
        if (id) setGuestId(id);
    }, []);

    // Guest todos
    const {
        isLoading: isGuestLoading,
        error: guestError,
        data: guestData,
    } = db.useQuery({
        todos: {
            $: { where: { guestId: guestId ?? "__guest_unset__" } },
        },
        guests: {
            $: { where: { id: guestId ?? "__guest_unset__" } },
        },
    });
    const guestTodos: Todo[] = guestData?.todos ?? [];

    // Ensure older guest todos are linked to the guest entity so server perms can count them
    useEffect(() => {
        if (!guestId) return;
        if (!guestTodos?.length) return;
        const txs = guestTodos.map((t) =>
            db.tx.todos[t.id].link({ guest: guestId })
        );
        db.transact(txs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guestId, guestTodos?.length]);

    // Presence
    const { peers } = db.rooms.usePresence(room);
    const numUsers = 1 + Object.keys(peers).length;

    // Migrate guest todos to signed-in user on first login
    useEffect(() => {
        if (!signedInUserId) return;
        if (!guestId) return;
        if (!guestTodos?.length) return;
        const migrateKey = `migrated:${signedInUserId}:${guestId}`;
        if (localStorage.getItem(migrateKey)) return;

        const txs = guestTodos.map((t) =>
            db.tx.todos[t.id].link({ owner: signedInUserId })
        );
        db.transact(txs).then(() => {
            localStorage.setItem(migrateKey, "1");
            localStorage.setItem("guestId", crypto.randomUUID());
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signedInUserId, guestTodos?.length]);

    function addTodo(text: string) {
        const currentGuestId = signedInUserId
            ? null
            : guestId ?? getOrCreateGuestId();
        if (!signedInUserId && currentGuestId && currentGuestId !== guestId) {
            setGuestId(currentGuestId);
        }
        // Client guard: block guests over 5
        // if (!signedInUserId && guestTodos.length >= 5) {
        //     alert("Guests can create up to 5 todos. Please sign in for more.");
        //     return;
        // }
        const tx = db.tx.todos[id()].update({
            text,
            done: false,
            createdAt: Date.now(),
            creatorId: signedInUserId ?? (currentGuestId as string),
        });
        if (signedInUserId) {
            db.transact(tx.link({ owner: signedInUserId }));
            return;
        }
        if (currentGuestId) {
            const ensureGuest = db.tx.guests[currentGuestId].update({});
            db.transact([
                ensureGuest,
                tx
                    .update({ guestId: currentGuestId })
                    .link({ guest: currentGuestId }),
            ]);
        }
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

    const combinedTodosMap = new Map<string, Todo>();
    ownedTodos.forEach((t) => combinedTodosMap.set(t.id, t));
    guestTodos.forEach((t) => combinedTodosMap.set(t.id, t));
    const todos = Array.from(combinedTodosMap.values());

    if (isGuestLoading) return null;
    if (guestError)
        return (
            <div className="text-red-500 p-4">Error: {guestError.message}</div>
        );

    return (
        <div className="font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
            <div className="flex flex-col items-center gap-4">
                <db.SignedOut>
                    <div>Hello, Guest!</div>
                    <div className="text-sm text-center text-muted-foreground space-y-2">
                        <div>Enjoy the login-free experience!</div>
                        <div>
                            If you do end up logging in, <br />
                            your todos will be migrated to your account.
                        </div>
                    </div>
                </db.SignedOut>
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
            <div className="text-xs text-gray-500">
                Number of users online: {numUsers}
            </div>

            {/* Bridge user and owned todos into parent state without violating hooks rules */}
            <db.SignedIn>
                <AuthBridge onUser={(id) => setSignedInUserId(id)} />
                <OwnedTodosData onTodos={(ts) => setOwnedTodos(ts)} />
            </db.SignedIn>
            <db.SignedOut>
                <SignedOutBridge
                    onSignedOut={() => {
                        setSignedInUserId(null);
                        setOwnedTodos([]);
                    }}
                />
            </db.SignedOut>
        </div>
    );
}

function AuthBridge({ onUser }: { onUser: (id: string) => void }) {
    const user = db.useUser();
    useEffect(() => {
        if (user?.id) onUser(user.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);
    return null;
}

function OwnedTodosData({ onTodos }: { onTodos: (todos: Todo[]) => void }) {
    const user = db.useUser();
    const { isLoading, error, data } = db.useQuery({
        todos: {
            $: { where: { "owner.id": user.id } },
        },
    });
    useEffect(() => {
        if (data?.todos) onTodos(data.todos as Todo[]);
    }, [data?.todos, onTodos]);
    if (isLoading || error) return null;
    return null;
}

function SignedOutBridge({ onSignedOut }: { onSignedOut: () => void }) {
    useEffect(() => {
        onSignedOut();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}
