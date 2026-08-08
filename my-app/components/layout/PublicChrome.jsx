'use client';

import { usePathname } from 'next/navigation';
import { ADMIN_BASE } from '../../utils/constants';

/**
 * Renders the public site chrome (header / footer / floating buttons) for every
 * route except the admin panel, which brings its own shell.
 */
export default function PublicChrome({ header, footer, extras, children }) {
  const pathname = usePathname() || '/';
  const isAdmin = pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
      {extras}
    </>
  );
}
