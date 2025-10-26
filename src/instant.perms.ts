/** @format */

// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
    // Prevent creation of new attributes without explicit schema changes
    attrs: {
        allow: {
            $default: "false",
        },
    },
    // No Better Auth entities
} satisfies InstantRules;

export default rules;
