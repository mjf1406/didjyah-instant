/** @format */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import TodoForm from "@/app/(app)/_components/todos/TodoForm";
import TodoList from "@/app/(app)/_components/todos/TodoList";
import TodoActionBar from "@/app/(app)/_components/todos/TodoActionBar";
import EnsureProfile from "@/app/(app)/_components/user/EnsureProfile";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import GoogleSignIn from "@/app/(app)/_components/auth/GoogleSignIn";
import { getErrorMessage } from "@/lib/errors";
import type { Todo, UserWithGuests } from "@/lib/types";

const room = db.room("todos");

export default function TodoPage() {
    return (
        <>
            <db.SignedIn>
                <AuthedApp />
            </db.SignedIn>
            <db.SignedOut>
                <SignedOutView />
            </db.SignedOut>
        </>
    );
}

function AuthedApp() {
    const user = db.useUser();
    const [ownedTodos, setOwnedTodos] = useState<Todo[]>([]);
    const [notice, setNotice] = useState<string | null>(null);
    const [nonce] = useState<string>(crypto.randomUUID());
    const router = useRouter();

    const handleOwnedTodos = useCallback(
        (ts: Todo[]) => {
            setOwnedTodos(ts);
        },
        [setOwnedTodos]
    );

    // Presence
    const { peers } = db.rooms.usePresence(room);
    const numUsers = 1 + Object.keys(peers).length;

    function addTodo(text: string) {
        const tx = db.tx.todos[id()].update({
            text,
            done: false,
            createdAt: Date.now(),
        });
        setNotice(null);
        db.transact(tx.link({ owner: user.id })).catch((err) => {
            const message = getErrorMessage(err);
            const permsFailed =
                message.includes("perms-pass") ||
                message.toLowerCase().includes("permission denied");
            if (permsFailed && ownedTodos.length >= 5) {
                setNotice("Upgrade for more todos");
            }
        });
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

    const todos = ownedTodos;

    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), 5000);
        return () => clearTimeout(timer);
    }, [notice]);

    return (
        <div className="font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
            <div className="flex flex-col items-center gap-4" />
            <h2 className="tracking-wide text-5xl text-gray-300">todos</h2>
            {/* Ensure a profile exists for signed-in users (covers guest→real migration) */}
            <EnsureProfile />
            {user.isGuest ? (
                <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-2 text-center">
                        Continue with Google to save your todos permanently
                    </div>
                    <div className="flex justify-center">
                        <GoogleSignIn
                            nonce={nonce}
                            onSuccess={() => router.refresh()}
                        />
                    </div>
                </div>
            ) : null}
            <div className="border border-gray-300 max-w-xs w-full">
                <TodoForm
                    todos={todos}
                    addTodo={addTodo}
                    toggleAll={toggleAll}
                />
                {notice ? (
                    <div className="divide-y divide-gray-300">
                        <div className="flex items-center h-10 bg-destructive text-destructive-foreground">
                            <div className="h-full px-2 flex items-center justify-center">
                                <div className="w-5 h-5 flex items-center justify-center" />
                            </div>
                            <div className="flex-1 px-2 overflow-hidden flex items-center">
                                <span className="font-medium">{notice}</span>
                            </div>
                            <div className="h-full px-2 flex items-center justify-center" />
                        </div>
                    </div>
                ) : null}
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

            {/* Bridge owned todos into parent state without violating hooks rules */}
            <OwnedTodosData onTodos={handleOwnedTodos} />
            <MigrateGuestTodos />
        </div>
    );
}

function SignedOutView() {
    return (
        <div className="font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
            <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-center text-muted-foreground space-y-2">
                    <div>Sign in to start using todos</div>
                </div>
                <Button onClick={() => db.auth.signInAsGuest()}>
                    Try as Guest
                </Button>
            </div>
        </div>
    );
}

function OwnedTodosData({ onTodos }: { onTodos: (todos: Todo[]) => void }) {
    const user = db.useUser();
    const { data: userData } = db.useQuery({
        $users: {
            $: { where: { id: user.id } },
            linkedGuestUsers: {},
        },
    });
    const userWithGuests = userData?.$users?.[0] as UserWithGuests | undefined;
    const guestIds: string[] =
        userWithGuests?.linkedGuestUsers?.map((u) => u.id) ?? [];
    const guestIdsOrNone = guestIds.length ? guestIds : ["__none__"];

    const {
        isLoading: l1,
        error: e1,
        data: d1,
    } = db.useQuery({
        todos: {
            $: { where: { "owner.id": user.id } },
        },
    });
    const {
        isLoading: l2,
        error: e2,
        data: d2,
    } = db.useQuery({
        todos: {
            $: { where: { "owner.id": { $in: guestIdsOrNone } } },
        },
    });
    useEffect(() => {
        const owned: Todo[] = (d1?.todos as Todo[]) || [];
        const guestOwned: Todo[] = (d2?.todos as Todo[]) || [];
        if (owned || guestOwned)
            onTodos([...(owned || []), ...(guestOwned || [])]);
    }, [d1?.todos, d2?.todos, onTodos]);
    if (l1 || l2 || e1 || e2) return null;
    return null;
}

function MigrateGuestTodos() {
    const user = db.useUser();
    useEffect(() => {
        if (!user?.id) return;
        if (user.isGuest) return;
        const transferGuestData = async () => {
            try {
                // Read linked guest users from the current user's record
                const {
                    data: { $users },
                } = await db.queryOnce({
                    $users: {
                        $: { where: { id: user.id } },
                        linkedGuestUsers: {},
                    },
                });
                const userWithGuests = $users?.[0] as
                    | UserWithGuests
                    | undefined;
                const guestIds: string[] = (
                    userWithGuests?.linkedGuestUsers ?? []
                ).map((u) => u.id);
                if (!guestIds.length) return;

                const {
                    data: { todos },
                } = await db.queryOnce({
                    todos: {
                        // Query by owner link instead of creatorId
                        $: { where: { "owner.id": { $in: guestIds } } },
                    },
                });
                if (!todos?.length) return;

                const txes = (todos as Todo[]).map((t) =>
                    db.tx.todos[t.id].link({ owner: user.id })
                );
                await db.transact(txes);
            } catch (err) {
                // swallow; optional best-effort migration
                console.error("Guest migration failed", err);
            }
        };
        transferGuestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.isGuest]);
    return null;
}

