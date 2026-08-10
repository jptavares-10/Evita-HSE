import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { getPostBySlug, formatPostDate } from "@/lib/blog";

const BASE_URL = "https://evita-hse-br.lovable.app";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  usePageTitle(post?.title ?? "Artigo", {
    description: post?.description,
    breadcrumbs: post
      ? [
          { name: "Início", url: `${BASE_URL}/` },
          { name: "Blog", url: `${BASE_URL}/blog` },
          { name: post.title, url: `${BASE_URL}/blog/${post.slug}` },
        ]
      : undefined,
  });

  // Article JSON-LD
  useEffect(() => {
    if (!post) return;
    const data = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      image: post.cover ? `${BASE_URL}${post.cover}` : undefined,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: post.author ?? "Equipe Evita HSE" },
      publisher: {
        "@type": "Organization",
        name: "Evita HSE",
        logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon.ico` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "article-jsonld";
    script.textContent = JSON.stringify(data);
    document.getElementById("article-jsonld")?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById("article-jsonld")?.remove();
    };
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <BlogLayout>
      <article className="max-w-3xl mx-auto px-6 lg:px-8 pt-10 lg:pt-14 pb-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-lp-muted hover:text-lp-ink transition-colors mb-8"
        >
          <span aria-hidden>←</span> Voltar para o blog
        </Link>

        {post.category && (
          <span className="lp-eyebrow mb-4">{post.category}</span>
        )}
        <h1 className="font-lp-display text-3xl lg:text-5xl font-semibold tracking-tight text-lp-ink leading-tight">
          {post.title}
        </h1>
        <p className="mt-5 text-lg text-lp-muted leading-relaxed">{post.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-lp-muted border-b border-lp-border pb-6">
          <span>{post.author}</span>
          <span>{formatPostDate(post.date)}</span>
          {post.readingMinutes && <span>{post.readingMinutes} min de leitura</span>}
        </div>

        {post.cover && (
          <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-lp-border bg-lp-surface">
            <img
              src={post.cover}
              alt={`Capa do artigo: ${post.title}`}
              className="w-full h-full object-cover"
              width={1280}
              height={720}
            />
          </div>
        )}

        <div className="prose prose-lg prose-invert mt-10 max-w-none
          prose-headings:font-semibold prose-headings:text-lp-ink prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-lp-ink/85 prose-p:leading-relaxed
          prose-strong:text-lp-ink prose-strong:font-semibold
          prose-a:text-lp-emerald-glow prose-a:no-underline hover:prose-a:underline
          prose-li:text-lp-ink/85 prose-li:my-1
          prose-ul:my-5 prose-ol:my-5
          prose-blockquote:border-l-lp-emerald prose-blockquote:text-lp-muted prose-blockquote:not-italic
          prose-code:text-lp-emerald-glow prose-code:bg-lp-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-lp-surface text-lp-muted border border-lp-border"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <BlogCTA />
      </article>
    </BlogLayout>
  );
}