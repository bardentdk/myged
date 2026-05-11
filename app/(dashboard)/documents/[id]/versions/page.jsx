import VersionsScreen from '@/components/screens/VersionsScreen';

export const metadata = { title: "Versions — Mar'my GED" };

export default async function VersionsPage({ params }) {
  const { id } = await params;
  return <VersionsScreen docId={id} />;
}
