/** @format */

// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const adminBind = [
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

const dataBind = [
    "isAuthenticated",
    "auth.id != null",
    "isOwner",
    "data.owner == auth.id",
    "isGuestOwner",
    "data.owner in auth.ref('$user.linkedGuestUsers.id')",
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
        bind: adminBind,
    },
    $users: {
        allow: {
            view: "isOwner",
            create: "false",
            delete: "false",
            update: "false",
        },
        bind: adminBind,
    },
    userProfiles: {
        allow: {
            view: "isOwner",
            create: "isAuthenticated",
            update: "isOwner",
            delete: "isOwner",
        },
        bind: adminBind,
    },
    todos: {
        allow: {
            view: "isOwner || isGuestOwner",
            create: "isAuthenticated && (size(data.ref('owner.ownerTodos.id')) < 6 || isPremium)",
            update: "isOwner || isGuestOwner",
            delete: "isOwner || isGuestOwner",
        },
        bind: dataBind,
    },
    didjyahs: {
        allow: {
            view: "isOwner || isGuestOwner",
            create: "isAuthenticated && (size(data.ref('owner.didjyahs.id')) < 6 || isPremium)",
            update: "isOwner || isGuestOwner",
            delete: "isOwner || isGuestOwner",
        },
        bind: dataBind,
    },
    didjyahRecords: {
        allow: {
            view: "isOwner || isGuestOwner",
            create: "isAuthenticated",
            update: "isOwner || isGuestOwner",
            delete: "isOwner || isGuestOwner",
        },
        bind: dataBind,
    },
} satisfies InstantRules;

export default rules;
