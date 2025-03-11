import * as React from "react";
import NextImage, { ImageProps } from "next/image";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer2/hooks";

import { cn } from "@/lib/utils";
import { MdxCard } from "@/components/content/mdx-card";
import BlurImage from "@/components/shared/blur-image";
import { Callout } from "@/components/shared/callout";
import { CopyButton } from "@/components/shared/copy-button";

const components = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "mt-2 scroll-m-20 text-3xl font-bold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-8 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mt-6 scroll-m-20 text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "mt-6 scroll-m-20 text-base font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        "mt-6 scroll-m-20 text-base font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        "mt-6 scroll-m-20 text-sm font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("leading-6 [&:not(:first-child)]:mt-4 text-sm", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-4 ml-6 list-disc text-sm", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-4 ml-6 list-decimal text-sm", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("mt-1.5", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "mt-4 border-l-2 pl-4 italic text-sm [&>*]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("rounded-md border", className)} alt={alt} {...props} />
  ),
  hr: ({ ...props }) => <hr className="my-3 md:my-6" {...props} />,
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 w-full overflow-y-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("m-0 border-t p-0 even:bg-muted", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border px-3 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border px-3 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  pre: ({
    className,
    __rawString__,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & { __rawString__?: string }) => (
    <div className="group relative w-full overflow-hidden">
      <pre
        className={cn(
          "max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-900 py-4 text-sm dark:bg-zinc-900",
          className,
        )}
        {...props}
      />
      {__rawString__ && (
        <CopyButton
          value={__rawString__}
          className={cn(
            "absolute right-4 top-4 z-20",
            "duration-250 opacity-0 transition-all group-hover:opacity-100",
          )}
        />
      )}
    </div>
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "relative rounded-md border bg-muted px-[0.4rem] py-1 font-mono text-xs text-foreground",
        className,
      )}
      {...props}
    />
  ),
  Callout,
  Card: MdxCard,
  Step: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "mt-6 scroll-m-20 font-heading text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  Steps: ({ ...props }) => (
    <div
      className="[&>h3]:step steps mb-8 ml-4 border-l pl-6 [counter-reset:step]"
      {...props}
    />
  ),
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "flex w-full flex-col items-center rounded-xl border bg-card p-4 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-6",
        className,
      )}
      {...props}
    />
  ),
};

interface MdxProps {
  code: string;
  images?: { alt: string; src: string; blurDataURL: string }[];
}

export function Mdx({ code, images }: MdxProps) {
  const Component = useMDXComponent(code);

  const MDXImage = (props: any) => {
    if (!images) return null;
    const blurDataURL = images.find(
      (image) => image.src === props.src,
    )?.blurDataURL;

    return (
      <div className="mt-5 w-full overflow-hidden rounded-lg border">
        <BlurImage
          {...props}
          blurDataURL={blurDataURL}
          className="size-full object-cover object-center"
        />
      </div>
    );
  };

  return (
    <div className="mdx">
      <Component
        components={{
          ...components,
          Image: MDXImage,
        }}
      />
    </div>
  );
}
