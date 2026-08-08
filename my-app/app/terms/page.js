import { getBanner, getPage } from '../../lib/data';
import LegalPage from '../../components/shared/LegalPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'الشروط والأحكام' };

export default async function TermsPage() {
  const [page, banner] = await Promise.all([getPage('terms'), getBanner('terms')]);
  return <LegalPage title="الشروط والأحكام" page={page} banner={banner} />;
}
