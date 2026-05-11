import DocumentScreen from '@/components/screens/DocumentScreen';

export const metadata = { title: "Document — Mar'my GED" };

export default async function DocumentPage({ params }) {
  const { id } = await params;
  return <DocumentScreen id={id} />;
}
