import { useState } from 'react';
import Sidebar from './components/Sidebar';
import OrderManagement from './pages/OrderManagement';
import CreateOrder from './pages/CreateOrder';
import UserProfile from './pages/UserProfile';
import { MOCK_USER } from './constants';

type Page = 'orders' | 'create' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('orders');
  const [user] = useState(MOCK_USER);

  const renderPage = () => {
    switch (currentPage) {
      case 'orders':
        return <OrderManagement />;
      case 'create':
        return <CreateOrder />;
      case 'profile':
        return <UserProfile user={user} />;
      default:
        return <OrderManagement />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
        {renderPage()}
      </main>
    </div>
  );
}
