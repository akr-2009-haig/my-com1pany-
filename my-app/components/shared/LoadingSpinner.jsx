export default function LoadingSpinner({ className = '', size = 'md', label = '' }) {
  const s = { sm: 'w-5 h-5 border-2', md: 'w-9 h-9 border-[3px]', lg: 'w-14 h-14 border-4' }[size] || 'w-9 h-9 border-[3px]';
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`} role="status" aria-live="polite">
      <span className={`${s} rounded-full border-primary/20 border-t-primary animate-spin`} />
      {label && <span className="text-sm text-gray-400">{label}</span>}
    </div>
  );
}
