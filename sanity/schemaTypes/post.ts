import {
  defineArrayMember,
  defineField,
  defineType,
} from "sanity";

export const postType =
  defineType({
    name: "post",
    title: "Blog Post",
    type: "document",

    fields: [
      defineField({
        name: "title",
        title: "Title",
        type: "string",

        validation: (rule) =>
          rule.required(),
      }),

      defineField({
        name: "slug",
        title: "Slug",
        type: "slug",

        options: {
          source: "title",
          maxLength: 96,
        },

        validation: (rule) =>
          rule.required(),
      }),

      defineField({
        name: "excerpt",
        title: "Excerpt",
        type: "text",
        rows: 4,

        description:
          "Short summary used on the blog index and search previews.",

        validation: (rule) =>
          rule
            .required()
            .max(220),
      }),

      defineField({
        name: "author",
        title: "Author",
        type: "reference",

        to: [
          {
            type: "author",
          },
        ],
      }),

      defineField({
        name: "categories",
        title: "Categories",
        type: "array",

        of: [
          defineArrayMember({
            type: "reference",

            to: [
              {
                type: "category",
              },
            ],
          }),
        ],
      }),

      defineField({
        name: "publishedAt",
        title: "Published At",
        type: "datetime",

        initialValue: () =>
          new Date()
            .toISOString(),

        validation: (rule) =>
          rule.required(),
      }),

      defineField({
        name: "featured",
        title: "Featured Post",
        type: "boolean",

        initialValue:
          false,
      }),

      defineField({
        name: "mainImage",
        title: "Featured Image",
        type: "image",

        options: {
          hotspot: true,
        },

        fields: [
          defineField({
            name: "alt",
            title: "Alternative Text",
            type: "string",

            description:
              "Describe the image for accessibility and SEO.",

            validation: (rule) =>
              rule.required(),
          }),
        ],
      }),

      defineField({
        name: "body",
        title: "Article",
        type: "array",

        of: [
          defineArrayMember({
            type: "block",

            styles: [
              {
                title: "Normal",
                value: "normal",
              },
              {
                title: "Heading 2",
                value: "h2",
              },
              {
                title: "Heading 3",
                value: "h3",
              },
              {
                title: "Quote",
                value:
                  "blockquote",
              },
            ],

            lists: [
              {
                title: "Bullet",
                value: "bullet",
              },
              {
                title: "Numbered",
                value: "number",
              },
            ],

            marks: {
              annotations: [
                {
                  name: "link",
                  type: "object",
                  title: "Link",

                  fields: [
                    {
                      name: "href",
                      title: "URL",
                      type: "url",
                    },
                  ],
                },
              ],
            },
          }),

          defineArrayMember({
            type: "image",

            options: {
              hotspot: true,
            },

            fields: [
              defineField({
                name: "alt",
                title:
                  "Alternative Text",
                type: "string",
              }),

              defineField({
                name: "caption",
                title:
                  "Caption",
                type: "string",
              }),
            ],
          }),
        ],

        validation: (rule) =>
          rule.required(),
      }),

      /*
       * SEO
       */

      defineField({
        name: "seoTitle",
        title: "SEO Title",
        type: "string",

        description:
          "Optional. Defaults to article title.",

        validation: (rule) =>
          rule.max(65),
      }),

      defineField({
        name: "seoDescription",
        title:
          "SEO Description",
        type: "text",
        rows: 3,

        validation: (rule) =>
          rule.max(165),
      }),

      defineField({
        name: "seoKeywords",
        title: "SEO Keywords",
        type: "array",

        of: [
          {
            type: "string",
          },
        ],
      }),

      defineField({
        name: "canonicalUrl",
        title: "Canonical URL",
        type: "url",
      }),
    ],

    orderings: [
      {
        title:
          "Published Date, New",
        name:
          "publishedAtDesc",

        by: [
          {
            field:
              "publishedAt",

            direction:
              "desc",
          },
        ],
      },
    ],

    preview: {
      select: {
        title: "title",
        subtitle:
          "author.name",
        media: "mainImage",
      },
    },
  });