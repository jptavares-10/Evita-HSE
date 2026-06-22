import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { getAllPosts, formatPostDate } from "@/lib/blog";

export default function Blog() {
  usePageTitle("Blog Evita HSE — Conteúdo sobre Segurança do Trabalho", {
    description:
      "Guias práticos, NRs comentadas e respostas para as principais dúvidas de quem atua em SST, saúde ocupacional e meio ambiente.",
  });

  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <BlogLayout>
      {/* Hero */}
      <section className="border-b border-lp-border bg-gradient-to-b from-lp-surface/40 to-transparent">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-lp-emerald font-medium mb-3">Blog</p>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-lp-ink max-w-3xl">
            Conteúdo prático para quem vive a Segurança do Trabalho
          </h1>
          <p className="mt-4 text-lg text-lp-muted max-w-2xl leading-relaxed">
            NRs comentadas, guias passo a passo e respostas para as dúvidas mais comuns de técnicos,
            engenheiros e gestores de SST.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {posts.length === 0 ? (
          <p className="text-lp-muted">Nenhum artigo publicado ainda.</p>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link
                to={`/blog/${featured.slug}`}
                className="group grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16 lg:mb-20"
              >
                {featured.cover && (
                  <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-lp-border bg-lp-surface">
                    <img
                      src={featured.cover}
                      alt={`Capa do artigo: ${featured.title}`}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      width={1280}
                      height={800}
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  {featured.category && (
                    <p className="text-xs uppercase tracking-[0.2em] text-lp-emerald font-medium mb-3">
                      {featured.category}
                    </p>
                  )}
                  <h2 className="text-3xl lg:text-4xl font-semibold text-lp-ink leading-tight group-hover:text-lp-emerald-deep transition-colors">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-lp-muted leading-relaxed">{featured.description}</p>
                  <div className="mt-6 flex items-center gap-5 text-sm text-lp-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {formatPostDate(featured.date)}
                    </span>
                    {featured.readingMinutes && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {featured.readingMinutes} min de leitura
                      </span>
                    )}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-lp-emerald-deep font-medium">
                    Ler artigo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-2xl border border-lp-border bg-lp-bg hover:border-lp-emerald/40 hover:shadow-md transition-all overflow-hidden"
                  >
                    {post.cover && (
                      <div className="aspect-[16/10] overflow-hidden bg-lp-surface">
                        <img
                          src={post.cover}
                          alt={`Capa do artigo: ${post.title}`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          width={1280}
                          height={800}
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      {post.category && (
                        <p className="text-xs uppercase tracking-[0.18em] text-lp-emerald font-medium mb-2">
                          {post.category}
                        </p>
                      )}
                      <h3 className="text-xl font-semibold text-lp-ink leading-snug group-hover:text-lp-emerald-deep transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-sm text-lp-muted line-clamp-3">{post.description}</p>
                      <div className="mt-5 pt-4 border-t border-lp-border flex items-center justify-between text-xs text-lp-muted">
                        <span>{formatPostDate(post.date)}</span>
                        {post.readingMinutes && <span>{post.readingMinutes} min</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </BlogLayout>
  );
}