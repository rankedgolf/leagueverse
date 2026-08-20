import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  client,
} from "@/sanity/lib/client";

import {
  POST_QUERY,
} from "@/sanity/lib/queries";

import {
  urlForImage,
} from "@/sanity/lib/image";

import {
  BlogPortableText,
} from "@/components/blog/portable-text";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const post =
    await client.fetch(
      POST_QUERY,
      {
        slug,
      },
    );

  if (!post) {
    return {};
  }

  return {
    title:
      post.seoTitle ??
      `${post.title} | LeagueVerse`,

    description:
      post.seoDescription ??
      post.excerpt,

    keywords:
      post.seoKeywords ??
      undefined,

    alternates:
      post.canonicalUrl
        ? {
            canonical:
              post.canonicalUrl,
          }
        : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const {
    slug,
  } = await params;

  const post =
    await client.fetch(
      POST_QUERY,
      {
        slug,
      },
    );

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <article>
        <header className="border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <Link
              href="/blog"
              className="text-sm font-semibold text-violet-300 hover:text-violet-200"
            >
              ← LeagueVerse Blog
            </Link>

            <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-violet-400">
              {post
                .categories?.[0]
                ?.title ??
                "Fantasy Football"}
            </p>

            <h1 className="mt-4 text-5xl font-extrabold leading-tight md:text-6xl">
              {post.title}
            </h1>

            <p className="mt-6 text-xl leading-8 text-slate-400">
              {post.excerpt}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {post.author?.name ? (
                <span>
                  By{" "}
                  {
                    post.author
                      .name
                  }
                </span>
              ) : null}

              {post.publishedAt ? (
                <>
                  <span>•</span>

                  <time>
                    {new Intl.DateTimeFormat(
                      "en-US",
                      {
                        month:
                          "long",
                        day:
                          "numeric",
                        year:
                          "numeric",
                      },
                    ).format(
                      new Date(
                        post.publishedAt,
                      ),
                    )}
                  </time>
                </>
              ) : null}
            </div>
          </div>
        </header>

        {post.mainImage ? (
          <div className="mx-auto max-w-5xl px-6 pt-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlForImage(
                post.mainImage,
              )
                .width(1400)
                .height(780)
                .quality(90)
                .url()}
              alt={
                post.mainImage
                  .alt ??
                post.title
              }
              className="w-full rounded-3xl object-cover"
            />
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl px-6 py-14">
          <BlogPortableText
            value={
              post.body
            }
          />

          <div className="mt-16 rounded-3xl border border-violet-800 bg-violet-950/20 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Take Dynasty Further
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Run Your League Like a Front Office.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              LeagueVerse adds contracts, salary caps,
              franchise tags, free agency, rookie contracts,
              and complete offseason management to your
              existing fantasy league.
            </p>

            <Link
              href="/how-it-works"
              className="mt-6 inline-block rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-600"
            >
              See How LeagueVerse Works
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}