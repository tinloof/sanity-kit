import "@tinloof/sanity-extends";

import orderableAbstract from "./orderable";
import singletonAbstract from "./singleton";
import syncAbstract from "./sync";

export const ABSTRACTS_MAP = {
  orderable: orderableAbstract,
  singleton: singletonAbstract,
  sync: syncAbstract,
};

export {orderableAbstract, singletonAbstract, syncAbstract};
