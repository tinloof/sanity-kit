"use server";

import {draftMode} from "next/headers";

export async function disableDraftMode() {
  "use server";
  console.log("hello");

  await Promise.allSettled([
    (await draftMode()).disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}
