"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false, input: false },
        status: { type: "string", required: false, input: false },
        hostStatus: { type: "string", required: false, input: false },
        phone: { type: "string", required: false, input: false },
        city: { type: "string", required: false, input: false },
        bio: { type: "string", required: false, input: false },
      },
    }),
  ],
});
