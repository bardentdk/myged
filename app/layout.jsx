import './globals.css';
import { ToastProvider } from '@/lib/context/ToastContext';
import { DocsProvider } from '@/lib/context/DocsContext';
import { NotificationsProvider } from '@/lib/context/NotificationsContext';

export const metadata = {
  title: "Mar'my GED",
  description: 'Gestion électronique de documents pour centres de formation — CFA Horizon Réunion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <DocsProvider>
          <NotificationsProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </NotificationsProvider>
        </DocsProvider>
      </body>
    </html>
  );
}
