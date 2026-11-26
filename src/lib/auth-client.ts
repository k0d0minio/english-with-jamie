"use client";
// Browser client for Neon Auth. It talks to /api/auth on this site (the SDK handler).
import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
