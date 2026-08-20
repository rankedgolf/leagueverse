import imageUrlBuilder from "@sanity/image-url";

import {
  client,
} from "@/sanity/lib/client";

const builder =
  imageUrlBuilder(client);

export function urlForImage(
  source: Parameters<
    typeof builder.image
  >[0],
) {
  return builder.image(
    source,
  );
}
