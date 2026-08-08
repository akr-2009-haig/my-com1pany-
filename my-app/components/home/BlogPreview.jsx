import Link from 'next/link';
import SectionTitle from '../shared/SectionTitle';
import BlogCard from '../shared/BlogCard';
import Reveal from '../shared/Reveal';

export default function BlogPreview({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="section-alt">
      <div className="container-app">
        <SectionTitle
          eyebrow="المدونة"
          title="أحدث المقالات"
          text="مقالات ورؤى تقنية من فريقنا حول التطوير والتصميم والتحول الرقمي."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <Reveal key={p._id} delay={i * 80}><BlogCard post={p} /></Reveal>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/blog" className="btn-primary">جميع المقالات</Link>
        </div>
      </div>
    </section>
  );
}
