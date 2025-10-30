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
    "data.owner == auth.id",
    "isGuestOwner",
    "data.owner in auth.ref('$user.linkedGuestUsers.id')",
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
            view: "isOwner || isGuestOwner",
            create: "isAuthenticated && (size(data.ref('owner.ownerTodos.id')) < 6 || isPremium)",
            update: "isOwner || isGuestOwner",
            delete: "isOwner || isGuestOwner",
        },
        bind: commonBind,
    },
    didjyahs: {
        allow: {
            view: "isOwner || isGuestOwner",
            create: "isAuthenticated && (size(data.ref('owner.ownerTodos.id')) < 6 || isPremium)",
            update: "isOwner || isGuestOwner",
            delete: "isOwner || isGuestOwner",
        },
        bind: commonBind,
    },
    didjyah_records: {
        allow: {
            view: "isOwner || isGuestOwner",
            create: "isAuthenticated && (size(data.ref('owner.ownerTodos.id')) < 6 || isPremium)",
            update: "isOwner || isGuestOwner",
            delete: "isOwner || isGuestOwner",
        },
        bind: commonBind,
    },
} satisfies InstantRules;

export default rules;
