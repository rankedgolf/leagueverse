import Link from "next/link";

import {
  client,
} from "@/sanity/lib/client";

import {
  POSTS_QUERY,
  FEATURED_POST_QUERY,
} from "@/sanity/lib/queries";

import {
  urlForImage,
} from "@/sanity/lib/image";

type BlogPost = {
  _id: string;

  title: string;
  slug: string;
  excerpt: string;

  publishedAt: string;

  featured?: boolean | null;

  mainImage?: {
    alt?: string | null;
    asset?: unknown;
  } | null;

  author?: {
    name?: string | null;
    slug?: string | null;
  } | null;

  categories?: {
    _id?: string;
    title?: string | null;
    slug?: string | null;
  }[] | null;
};

export const metadata = {
  title:
    "Dynasty Fantasy Football Blog | LeagueVerse",

  description:
    "Dynasty fantasy football strategy, salary cap guides, commissioner resources, rookie draft analysis, free agency strategy, and LeagueVerse insights.",
};

export default async function BlogPage() {
  const [
    posts,
    featuredPost,
  ] =
    await Promise.all([
      client.fetch<BlogPost[]>(
        POSTS_QUERY,
      ),

      client.fetch<BlogPost | null>(
        FEATURED_POST_QUERY,
      ),
    ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
            LeagueVerse Blog
          </p>

          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-extrabold md:text-6xl">
            Dynasty Strategy.
            Commissioner Insights.
            Front Office Thinking.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Strategy, guides, commissioner resources,
            salary-cap analysis, rookie advice, and everything
            you need to build a better dynasty league.
          </p>
        </div>
      </section>

      {featuredPost ? (
        <section className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Featured
            </p>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="grid overflow-hidden rounded-3xl border border-violet-800 bg-violet-950/10 lg:grid-cols-2"
            >
              {featuredPost.mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urlForImage(
                    featuredPost.mainImage,
                  )
                    .width(1200)
                    .height(700)
                    .url()}
                  alt={
                    featuredPost.mainImage.alt ??
                    featuredPost.title
                  }
                  className="h-full min-h-[320px] w-full object-cover"
                />
              ) : (
                <div className="min-h-[320px] bg-slate-900" />
              )}

              <div className="flex flex-col justify-center p-8 md:p-12">
                <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                  {featuredPost
                    .categories?.[0]
                    ?.title ??
                    "LeagueVerse"}
                </p>

                <h2 className="mt-4 text-4xl font-bold leading-tight">
                  {
                    featuredPost.title
                  }
                </h2>

                <p className="mt-5 text-lg leading-8 text-slate-400">
                  {
                    featuredPost.excerpt
                  }
                </p>

                <p className="mt-7 font-semibold text-violet-300">
                  Read Article →
                </p>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                Latest
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Latest Articles
              </h2>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <p className="text-slate-400">
                Our first articles are coming soon.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map(
                (post) => (
                  <article
                    key={
                      post._id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                  >
                    {post.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlForImage(
                          post.mainImage,
                        )
                          .width(
                            800,
                          )
                          .height(
                            450,
                          )
                          .url()}
                        alt={
                          post.mainImage
                            .alt ??
                          post.title
                        }
                        className="aspect-video w-full object-cover"
                      />
                    ) : null}

                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                        {post
                          .categories?.[0]
                          ?.title ??
                          "Fantasy Football"}
                      </p>

                      <h2 className="mt-3 text-2xl font-bold">
                        {
                          post.title
                        }
                      </h2>

                      <p className="mt-4 leading-7 text-slate-400">
                        {
                          post.excerpt
                        }
                      </p>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-6 inline-block font-semibold text-violet-300 hover:text-violet-200"
                      >
                        Read Article →
                      </Link>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}