import { notFound } from "next/navigation";
import { allPages } from "contentlayer/generated";

import { Mdx } from "@/components/content/mdx-components";

import "@/styles/mdx.css";

import { Metadata } from "next";

import { constructMetadata, getBlurDataURL } from "@/lib/utils";

export async function generateStaticParams() {
  return allPages.map((page) => ({
    slug: page.slugAsParams,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const page = allPages.find((page) => page.slugAsParams === params.slug);
  if (!page) {
    return;
  }

  const { title, description } = page;

  return constructMetadata({
    title: `${title} – NEXTPION`,
    description: description,
  });
}

export default async function PagePage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const page = allPages.find((page) => page.slugAsParams === params.slug);

  if (!page) {
    notFound();
  }

  const images = await Promise.all(
    page.images.map(async (src: string) => ({
      src,
      blurDataURL: await getBlurDataURL(src),
    })),
  );

  return (
    <article className="container max-w-3xl py-6 lg:py-20">
      <div className="space-y-3">
        <h1 className="inline-block font-heading text-2xl lg:text-3xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-base text-muted-foreground">{page.description}</p>
        )}
      </div>
      <hr className="my-3" />
      <Mdx code={page.body.code} images={images} />
    </article>
  );
}
