export default function SectionTitle({ eyebrow, title, text, center = true, light = false, className = '' }) {
  return (
    <div className={`${center ? 'text-center mx-auto max-w-2xl' : ''} mb-12 ${className}`}>
      {eyebrow && <p className={`eyebrow mb-2 ${light ? 'text-white/80' : ''}`}>{eyebrow}</p>}
      {title && <h2 className={`heading mb-4 ${light ? '!text-white' : ''}`}>{title}</h2>}
      <div className={`divider-line ${center ? 'mx-auto' : ''} ${light ? 'bg-white' : ''}`} />
      {text && <p className={`mt-5 leading-relaxed ${light ? 'text-white/80' : 'text-gray-500'}`}>{text}</p>}
    </div>
  );
}
