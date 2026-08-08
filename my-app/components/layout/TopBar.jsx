import { Phone, Mail } from 'lucide-react';
import SocialLinks from '../shared/SocialLinks';

export default function TopBar({ settings }) {
  const { phone, email } = settings || {};
  if (!phone && !email) return null;

  return (
    <div className="hidden md:block bg-[#f8f9fa] border-b border-gray-100 text-[13px]">
      <div className="container-app flex items-center justify-between h-10">
        <div className="flex items-center gap-6 text-gray-600">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span dir="ltr">{phone}</span>
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span dir="ltr">{email}</span>
            </a>
          )}
        </div>
        <SocialLinks socials={settings?.socials} size="sm" />
      </div>
    </div>
  );
}
