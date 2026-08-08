import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Ghost, Camera } from 'lucide-react';

const MAP = {
  facebook: { Icon: Facebook, label: 'فيسبوك' },
  twitter: { Icon: Twitter, label: 'تويتر / X' },
  instagram: { Icon: Instagram, label: 'انستغرام' },
  linkedin: { Icon: Linkedin, label: 'لينكدإن' },
  youtube: { Icon: Youtube, label: 'يوتيوب' },
  github: { Icon: Github, label: 'GitHub' },
  tiktok: { Icon: Camera, label: 'تيك توك' },
  snapchat: { Icon: Ghost, label: 'سناب شات' },
  pinterest: { Icon: Camera, label: 'بنترست' },
};

export default function SocialLinks({ socials = {}, size = 'md', variant = 'solid', className = '' }) {
  const entries = Object.entries(socials || {}).filter(([k, v]) => v && MAP[k]);
  if (!entries.length) return null;

  const box = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const style = variant === 'solid'
    ? 'bg-primary text-white hover:bg-primary-dark'
    : 'bg-white/10 text-white hover:bg-primary';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {entries.map(([key, url]) => {
        const { Icon, label } = MAP[key];
        return (
          <a
            key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
            className={`${box} ${style} rounded-full grid place-items-center transition-all duration-300 hover:scale-110`}
          >
            <Icon className={icon} />
          </a>
        );
      })}
    </div>
  );
}
