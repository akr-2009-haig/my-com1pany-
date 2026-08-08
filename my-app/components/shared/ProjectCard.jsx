import Link from 'next/link';
import Image from 'next/image';
import { Eye, ExternalLink } from 'lucide-react';

export default function ProjectCard({ project }) {
  const cover = project.cover || (project.images || [])[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80';
  const category = project.category?.name || '';

  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-card aspect-[4/3] bg-gray-100">
      <Image
        src={cover} alt={project.title} fill sizes="(max-width:768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/70 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-400">
        <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{project.title}</h3>
        {category && <p className="text-white/85 text-sm mb-4">{category}</p>}
        <div className="flex items-center gap-3">
          <Link href={`/portfolio/${project.slug}`} aria-label="عرض المشروع"
            className="w-10 h-10 rounded-full bg-white text-primary grid place-items-center hover:scale-110 transition-transform">
            <Eye className="w-4.5 h-4.5" />
          </Link>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label="فتح الموقع"
              className="w-10 h-10 rounded-full bg-white text-primary grid place-items-center hover:scale-110 transition-transform">
              <ExternalLink className="w-4.5 h-4.5" />
            </a>
          )}
        </div>
      </div>
      {/* always-visible caption on touch devices */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 group-hover:opacity-0 transition-opacity">
        <h3 className="text-white font-semibold text-sm line-clamp-1">{project.title}</h3>
        {category && <p className="text-white/70 text-xs">{category}</p>}
      </div>
    </div>
  );
}
