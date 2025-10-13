import {defineEnableDraftMode} from "next-sanity/draft-mode";

import {client} from "@/data/sanity/client";
import {token} from "@/data/sanity/token";

export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token}),
});
