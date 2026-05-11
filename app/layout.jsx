import './globals.css';
import { ToastProvider } from '@/lib/context/ToastContext';

export const metadata = {
  title: "Mar'my GED",
  description: 'Gestion électronique de documents pour centres de formation — CFA Horizon Réunion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
