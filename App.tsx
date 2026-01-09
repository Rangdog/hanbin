import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import OrderManagement from './pages/OrderManagement';
import CreateOrder from './pages/CreateOrder';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import { backend } from './services/backend';
import { User } from './types';

type Page = 'orders' | 'create' | 'profile' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('orders');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect để tự động chuyển trang khi user thay đổi (sau khi đăng nhập)
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' && currentPage !== 'admin') {
        setCurrentPage('admin');
      } else if (user.role !== 'admin' && currentPage === 'admin') {
        setCurrentPage('orders');
      }
    }
  }, [user?.role]); // Chỉ theo dõi role, không theo dõi toàn bộ user object

  useEffect(() => {
    (async () => {
      const existing = await backend.getCurrentUser();
      if (existing) {
        setUser(existing);
        // Nếu là admin, tự động chuyển sang trang admin
        if (existing.role === 'admin') {
          setCurrentPage('admin');
        }
      }
      setLoading(false);
    })();
  }, []);

  const refreshUser = async () => {
    const me = await backend.getUser();
    setUser(me);
    // Nếu là admin, tự động chuyển sang trang admin
    if (me.role === 'admin') {
      setCurrentPage('admin');
    }
  };

  const handleLogout = async () => {
    await backend.logout();
    setUser(null);
  };

  const renderPage = () => {
    if (!user) return null;
    
    switch (currentPage) {
      case 'orders':
        return <OrderManagement />;
      case 'create':
        return <CreateOrder />;
      case 'profile':
        return <UserProfile user={user} />;
      case 'admin':
        return user.role === 'admin' ? <AdminDashboard /> : <OrderManagement />;
      default:
        // Nếu là admin, mặc định hiển thị AdminDashboard
        return user.role === 'admin' ? <AdminDashboard /> : <OrderManagement />;
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Đang tải...</div>;
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: '1rem' }}>
        <Auth onAuthenticated={refreshUser} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} userRole={user.role} />
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
        {renderPage()}
      </main>
    </div>
  );
}
