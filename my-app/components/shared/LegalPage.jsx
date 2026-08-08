import PageBanner from './PageBanner';
import TableOfContents from './TableOfContents';
import { formatDate } from '../../utils/formatDate';

/** Shared renderer for the privacy / terms pages (rich text + side TOC). */
export default function LegalPage({ title, banner, page }) {
  const html = page?.content || '<p>لم يتم إضافة المحتوى بعد.</p>';
  const headings = [...html.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gi)]
    .map((m, i) => ({ id: `sec-${i}`, level: Number(m[1]), text: m[2].replace(/<[^>]+>/g, '') }));

  let idx = -1;
  const withIds = html.replace(/<h([23])([^>]*)>/gi, (m, lvl, attrs) => {
    idx += 1;
    return `<h${lvl}${attrs} id="sec-${idx}">`;
  });

  return (
    <>
      <PageBanner
        title={banner?.title || title}
        subtitle={banner?.subtitle}
        image={banner?.image}
        breadcrumb={[{ label: title }]}
      />
      <section className="section bg-white">
        <div className="container-app grid lg:grid-cols-[260px_1fr] gap-10">
          <TableOfContents headings={headings} />
          <article>
            {page?.data?.updatedAt && (
              <p className="text-sm text-gray-400 mb-6">آخر تحديث: {formatDate(page.data.updatedAt)}</p>
            )}
            <div className="prose-rtl" dangerouslySetInnerHTML={{ __html: withIds }} />
          </article>
        </div>
      </section>
    </>
  );
}
