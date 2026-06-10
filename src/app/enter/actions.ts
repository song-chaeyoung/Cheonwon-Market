"use server";

import { redirect } from "next/navigation";

import {
  ACCESS_DENIED_MESSAGE,
  grantMarketAccess,
} from "@/server/access";

export type EntryCodeActionState = {
  ok?: boolean;
  message?: string;
};

export async function submitEntryCodeAction(
  _prevState: EntryCodeActionState,
  formData: FormData,
): Promise<EntryCodeActionState> {
  const entryCode = formData.get("entryCode");

  if (typeof entryCode !== "string" || !(await grantMarketAccess(entryCode))) {
    return { ok: false, message: ACCESS_DENIED_MESSAGE };
  }

  redirect("/");
}
