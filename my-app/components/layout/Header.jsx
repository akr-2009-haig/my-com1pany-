import { getMenu } from '../../lib/data';
import TopBar from './TopBar';
import Navbar from './Navbar';

export default async function Header({ settings }) {
  const [menu, services] = await Promise.all([
    getMenu('header'),
    (await import('../../lib/data')).getServices({ limit: 8 }),
  ]);

  return (
    <header className="sticky top-0 z-50">
      {settings?.topBarEnabled !== false && <TopBar settings={settings} />}
      <Navbar settings={settings} menu={menu} services={services} />
    </header>
  );
}
