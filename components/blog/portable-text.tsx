import Link from "next/link";

import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";

import {
  urlForImage,
} from "@/sanity/lib/image";

const components:
  PortableTextComponents = {
    block: {
      h2: ({
        children,
      }) => (
        <h2 className="mt-12 text-3xl font-bold text-white">
          {children}
        </h2>
      ),

      h3: ({
        children,
      }) => (
        <h3 className="mt-10 text-2xl font-bold text-white">
          {children}
        </h3>
      ),

      blockquote: ({
        children,
      }) => (
        <blockquote className="my-8 border-l-4 border-violet-600 pl-6 text-xl italic text-slate-300">
          {children}
        </blockquote>
      ),

      normal: ({
        children,
      }) => (
        <p className="mt-6 text-lg leading-8 text-slate-300">
          {children}
        </p>
      ),
    },

    list: {
      bullet: ({
        children,
      }) => (
        <ul className="my-6 list-disc space-y-2 pl-6 text-lg text-slate-300">
          {children}
        </ul>
      ),

      number: ({
        children,
      }) => (
        <ol className="my-6 list-decimal space-y-2 pl-6 text-lg text-slate-300">
          {children}
        </ol>
      ),
    },

    marks: {
      link: ({
        value,
        children,
      }) => {
        const href =
          value?.href ??
          "#";

        const internal =
          href.startsWith(
            "/",
          );

        if (internal) {
          return (
            <Link
              href={href}
              className="font-semibold text-violet-300 underline decoration-violet-700 underline-offset-4 hover:text-violet-200"
            >
              {children}
            </Link>
          );
        }

        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-violet-300 underline decoration-violet-700 underline-offset-4 hover:text-violet-200"
          >
            {children}
          </a>
        );
      },
    },

    types: {
      image: ({
        value,
      }) => {
        if (!value?.asset) {
          return null;
        }

        const url =
          urlForImage(
            value,
          )
            .width(1200)
            .quality(90)
            .url();

        return (
          <figure className="my-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={
                value.alt ??
                ""
              }
              className="w-full rounded-2xl"
            />

            {value.caption ? (
              <figcaption className="mt-3 text-center text-sm text-slate-500">
                {
                  value.caption
                }
              </figcaption>
            ) : null}
          </figure>
        );
      },
    },
  };

export function BlogPortableText({
  value,
}: {
  value: any;
}) {
  return (
    <PortableText
      value={value}
      components={
        components
      }
    />
  );
}