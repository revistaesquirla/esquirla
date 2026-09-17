import Image from 'next/image';
import Link from 'next/link';
import { formatDate, htmlToPlainText } from '@/lib/utils';
import type { PostWithCategory } from '@/types/database';

export function PostCard({ post }: { post: PostWithCategory }) {
  const summary = post.excerpt ?? htmlToPlainText(post.content_html, 150);

  return (
    <article className="group flex gap-4 border-2 border-carbon bg-paper p-4 transition-shadow duration-200 hover:shadow-block-sm sm:gap-5">
      {post.cover_url ? (
        <Link
          href={`/posts/${post.slug}`}
          className="relative hidden h-28 w-28 shrink-0 overflow-hidden border-2 border-carbon sm:block"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image src={post.cover_url} alt="" fill sizes="112px" className="object-cover" />
        </Link>
      ) : null}

      <div className="flex min-w-0 flex-col gap-2">
        <p className="dato text-rojo">
          {post.category?.name ?? 'Sin categoría'}
          {post.published_at ? ` · ${formatDate(post.published_at)}` : ''}
        </p>

        <h3 className="titular text-xl sm:text-2xl">
          <Link href={`/posts/${post.slug}`} className="hover:text-rojo">
            {post.title}
          </Link>
        </h3>

        {summary ? <p className="line-clamp-2 text-sm text-carbon/75">{summary}</p> : null}

        {post.author ? <p className="dato text-carbon/45">{post.author}</p> : null}
      </div>
    </article>
  );
}
