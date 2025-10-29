/** @format */

// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
    entities: {
        $files: i.entity({
            path: i.string().unique().indexed(),
            url: i.string(),
        }),
        $users: i.entity({
            email: i.string().unique().indexed().optional(),
            imageURL: i.string().optional(),
            type: i.string().optional(),
        }),
        // guests: i.entity({}),
        todos: i.entity({
            text: i.string(),
            done: i.boolean(),
            createdAt: i.number(),
            creatorId: i.string().indexed(),
            // guestId: i.string().optional().indexed(),
        }),
        profiles: i.entity({
            joined: i.date(),
            plan: i.string(),
            firstName: i.string(),
            lastName: i.string(),
            googlePicture: i.string().optional(),
        }),
    },
    links: {
        todosOwners: {
            forward: {
                on: "todos",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            },
            reverse: {
                on: "$users",
                has: "many",
                label: "ownerTodos",
            },
        },
        // todosGuests: {
        //     forward: {
        //         on: "todos",
        //         has: "one",
        //         label: "guest",
        //         onDelete: "cascade",
        //     },
        //     reverse: {
        //         on: "guests",
        //         has: "many",
        //         label: "guestTodos",
        //     },
        // },
        $usersLinkedPrimaryUser: {
            forward: {
                on: "$users",
                has: "one",
                label: "linkedPrimaryUser",
                onDelete: "cascade",
            },
            reverse: {
                on: "$users",
                has: "many",
                label: "linkedGuestUsers",
            },
        },
        userProfiles: {
            forward: {
                on: "profiles",
                has: "one",
                label: "user",
            },
            reverse: {
                on: "$users",
                has: "one",
                label: "profile",
            },
        },
    },
    rooms: {
        todos: {
            presence: i.entity({}),
        },
    },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
