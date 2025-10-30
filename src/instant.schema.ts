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
        todos: i.entity({
            text: i.string(),
            done: i.boolean(),
            createdAt: i.number(),
        }),
        profiles: i.entity({
            joined: i.date(),
            plan: i.string(),
            firstName: i.string(),
            lastName: i.string(),
            googlePicture: i.string().optional(),
        }),
        didjyahs: i.entity({
            name: i.string(),
            type: i.string().optional(),
            icon: i.string().optional(),
            color: i.string().optional(),
            iconColor: i.string().optional(),
            description: i.string().optional(),
            unit: i.string().optional(),
            quantity: i.number().optional(),
            dailyGoal: i.number().optional(),
            timer: i.number().optional(),
            stopwatch: i.boolean().optional(),
            sinceLast: i.boolean().optional(),
            inputs: i.json().optional(),
            createdDate: i.number().optional(),
            updatedDate: i.number().optional(),
            // userId: i.string().indexed(), // This is abstracted in the didjyahsOwners link and is called 'owner'
        }),
        didjyahRecords: i.entity({
            inputs: i.json().optional(),
            // test: i.string().optional(), // I think we can get rid of this
            createdDate: i.number().optional(),
            updatedDate: i.number().optional(),
            endDate: i.number().optional(),
            // didjyahId: i.string().indexed(), // This is abstracted in the didjyahRecordsDidjyahs link and is called 'didjyah'
            // userid: i.string(), // This is abstracted in the didjyahRecordsOwners link and is called 'owner'
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
        didjyahsOwners: {
            forward: {
                on: "didjyahs",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            },
            reverse: {
                on: "$users",
                has: "many",
                label: "didjyahs",
            },
        },
        didjyahRecordsDidjyahs: {
            forward: {
                on: "didjyahRecords",
                has: "one",
                label: "didjyah",
                onDelete: "cascade",
            },
            reverse: {
                on: "didjyahs",
                has: "many",
                label: "records",
            },
        },
        didjyahRecordsOwners: {
            forward: {
                on: "didjyahRecords",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            },
            reverse: {
                on: "$users",
                has: "many",
                label: "didjyahRecords",
            },
        },
    },
    rooms: {
        todos: {
            presence: i.entity({}),
        },
        didjyahs: {
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
