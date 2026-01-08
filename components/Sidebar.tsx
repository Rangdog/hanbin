
interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  onLogout?: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'orders', label: 'Order Management', icon: '📋' },
    { id: 'create', label: 'Create Order', icon: '➕' },
    { id: 'profile', label: 'User Profile', icon: '👤' },
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '2rem 1rem',
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 'bold' }}>
        Haibin21
      </h1>
      <nav>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
              backgroundColor: currentPage === item.id ? '#34495e' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              textAlign: 'left',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = '#34495e';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            marginTop: '2rem',
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
          }}
        >
          Đăng xuất
        </button>
      )}
    </aside>
  );
}
