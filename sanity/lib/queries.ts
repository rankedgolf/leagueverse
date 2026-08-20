import {
  defineQuery,
} from "next-sanity";

export const POSTS_QUERY =
  defineQuery(`
    *[
      _type == "post" &&
      defined(slug.current)
    ]
    | order(
      publishedAt desc
    ) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      featured,
      mainImage {
        ...,
        alt
      },

      author-> {
        name,
        "slug": slug.current,
        image
      },

      categories[]-> {
        _id,
        title,
        "slug": slug.current
      }
    }
  `);

export const FEATURED_POST_QUERY =
  defineQuery(`
    *[
      _type == "post" &&
      featured == true &&
      defined(slug.current)
    ]
    | order(
      publishedAt desc
    )[0] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,

      mainImage {
        ...,
        alt
      },

      author-> {
        name
      },

      categories[]-> {
        title,
        "slug": slug.current
      }
    }
  `);

export const POST_QUERY =
  defineQuery(`
    *[
      _type == "post" &&
      slug.current == $slug
    ][0] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,

      mainImage {
        ...,
        alt
      },

      author-> {
        name,
        bio,
        image
      },

      categories[]-> {
        _id,
        title,
        "slug": slug.current
      },

      body,

      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl
    }
  `);

export const POST_SLUGS_QUERY =
  defineQuery(`
    *[
      _type == "post" &&
      defined(slug.current)
    ] {
      "slug": slug.current
    }
  `);