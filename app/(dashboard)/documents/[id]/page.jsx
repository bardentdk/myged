import DocumentScreen from '@/components/screens/DocumentScreen';

export const metadata = { title: "Document — Mar'my GED" };

export default function DocumentPage({ params }) {
  return <DocumentScreen id={params.id} />;
}
