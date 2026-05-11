import DocumentEditorScreen from '@/components/screens/DocumentEditorScreen';

export const metadata = { title: "Éditeur — Mar'my GED" };

export default async function EditPage({ params }) {
  const { id } = await params;
  return <DocumentEditorScreen id={id} />;
}
