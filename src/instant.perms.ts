/** @format */

// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const commonBind = [
    "isAuthenticated",
    "auth.id != null",
    "isCreator",
    "auth.id != null && auth.id == data.creatorId",
    "isStillCreator",
    "auth.id != null && auth.id == newData.creatorId",
    "isOwner",
    "auth.id != null && auth.id == data.id",
    "isStillOwner",
    "auth.id != null && auth.id == newData.id",
    "isPremium",
    "auth.ref('$user.profile.plan').exists(p, p in ['basic', 'plus', 'pro'])",
];

const rules = {
    attrs: {
        allow: {
            $default: "false",
        },
    },
    $files: {
        allow: {
            view: "isAuthenticated",
            create: "isAuthenticated",
            update: "isAuthenticated",
            delete: "isAuthenticated",
        },
        bind: commonBind,
    },
    $users: {
        allow: {
            view: "isOwner",
            create: "false",
            delete: "false",
            update: "false",
        },
        bind: commonBind,
    },
    userProfiles: {
        allow: {
            view: "isOwner",
            create: "isAuthenticated",
            update: "isOwner",
            delete: "isOwner",
        },
        bind: commonBind,
    },
    todos: {
        allow: {
            view: "isAuthenticated",
            create: "size(data.ref('owner.ownerTodos.id')) < 6 || isPremium",
            update: "isCreator && isStillCreator && isPremium",
            delete: "isCreator",
        },
        bind: commonBind,
    },
} satisfies InstantRules;

export default rules;
