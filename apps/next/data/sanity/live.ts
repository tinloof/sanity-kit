import {defineLive} from "next-sanity/live";
import "server-only";

import {client} from "./client";
import {token} from "./token";

export const {SanityLive, sanityFetch} = defineLive({
  client,
  browserToken: token,
  serverToken: token,
});
