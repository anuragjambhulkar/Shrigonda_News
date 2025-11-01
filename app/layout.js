import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'I Love Shrigonda News - Your Love for the City',
  description: 'Stay updated with the latest news from Shrigonda and beyond',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}