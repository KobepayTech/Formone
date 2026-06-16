import type { FC, ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  zone: 'parent' | 'vendor' | 'school' | 'admin' | 'public';
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ zone, children }) => {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar zone={zone} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
