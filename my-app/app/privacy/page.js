import { getBanner, getPage } from '../../lib/data';
import LegalPage from '../../components/shared/LegalPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'سياسة الخصوصية' };

export default async function PrivacyPage() {
  const [page, banner] = await Promise.all([getPage('privacy'), getBanner('privacy')]);
  return <LegalPage title="سياسة الخصوصية" page={page} banner={banner} />;
}
