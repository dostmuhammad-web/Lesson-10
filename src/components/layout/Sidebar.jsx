// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, GitFork, Grid, BookOpen, GraduationCap, 
  CheckSquare, Calendar, CreditCard, AlertOctagon, Award, 
  FileText, ClipboardCheck, BarChart3, DollarSign, UserCheck, 
  Bell, Settings, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { currentUser, notifications } = useCRM();
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Permissions config for Sidebar Navigation
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Director', 'Manager', 'Teacher', 'Cashier'] },
    { path: '/students', label: 'O\'quvchilar', icon: Users, roles: ['Super Admin', 'Director', 'Manager'] },
    { path: '/leads', label: 'Leadlar (Kanban)', icon: GitFork, roles: ['Super Admin', 'Director', 'Manager'] },
    { path: '/groups', label: 'Guruhlar', icon: Grid, roles: ['Super Admin', 'Director', 'Manager', 'Teacher'] },
    { path: '/courses', label: 'Kurslar', icon: BookOpen, roles: ['Super Admin', 'Director', 'Manager'] },
    { path: '/teachers', label: 'O\'qituvchilar', icon: GraduationCap, roles: ['Super Admin', 'Director', 'Manager'] },
    { path: '/attendance', label: 'Davomat', icon: CheckSquare, roles: ['Super Admin', 'Director', 'Manager', 'Teacher'] },
    { path: '/schedule', label: 'Dars jadvali', icon: Calendar, roles: ['Super Admin', 'Director', 'Manager', 'Teacher'] },
    { path: '/payments', label: 'To\'lovlar', icon: CreditCard, roles: ['Super Admin', 'Director', 'Manager', 'Cashier'] },
    { path: '/debtors', label: 'Qarzdorlik', icon: AlertOctagon, roles: ['Super Admin', 'Director', 'Manager', 'Cashier'] },
    { path: '/grades', label: 'Baholar', icon: Award, roles: ['Super Admin', 'Director', 'Teacher'] },
    { path: '/assignments', label: 'Vazifalar', icon: FileText, roles: ['Super Admin', 'Director', 'Teacher'] },
    { path: '/exams', label: 'Imtihonlar', icon: ClipboardCheck, roles: ['Super Admin', 'Director', 'Teacher'] },
    { path: '/reports', label: 'Hisobotlar', icon: BarChart3, roles: ['Super Admin', 'Director'] },
    { path: '/finance', label: 'Moliya', icon: DollarSign, roles: ['Super Admin', 'Director'] },
    { path: '/employees', label: 'Xodimlar', icon: UserCheck, roles: ['Super Admin', 'Director'] },
    { path: '/notifications', label: 'Bildirishnomalar', icon: Bell, roles: ['Super Admin', 'Director', 'Manager', 'Teacher', 'Cashier'], badge: unreadNotificationsCount },
    { path: '/settings', label: 'Sozlamalar', icon: Settings, roles: ['Super Admin', 'Director'] },
  ];

  // Filter menu items by user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  const sidebarClass = `sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <div className={sidebarClass} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        transition: 'width var(--transition-normal), transform var(--transition-normal)',
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        position: isMobileOpen ? 'fixed' : 'relative',
        zIndex: isMobileOpen ? 1000 : 1,
        flexShrink: 0
      }}>
        {/* Brand / Logo Section */}
        <div style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0
        }}>
          <Link to="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer'
          }}>
            {!isCollapsed && (
              <div className="d-flex align-center gap-2">
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '18px'
                }}>
                  A
                </div>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)' }}>Apex CRM</span>
              </div>
            )}
            {isCollapsed && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '800',
                fontSize: '16px'
              }}>
                A
              </div>
            )}
          </Link>

          {/* Close button for mobile */}
          {isMobileOpen ? (
            <button onClick={() => setIsMobileOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
          ) : (
            // Collapse toggle for desktop
            !isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(true)} 
                className="btn-icon" 
                style={{ border: 'none', padding: '4px', display: 'flex' }}
              >
                <ChevronLeft size={16} />
              </button>
            )
          )}

          {isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="btn-icon" 
              style={{
                position: 'absolute',
                right: '-14px',
                top: '20px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                padding: '4px',
                zIndex: 10,
                display: 'flex'
              }}
            >
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobileOpen && setIsMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                fontWeight: isActive ? '700' : '500',
                transition: 'all var(--transition-fast)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative'
              })}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                if (!target.style.backgroundColor) {
                  target.style.backgroundColor = 'var(--color-secondary-light)';
                  target.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                const isActive = target.classList.contains('active');
                target.style.backgroundColor = isActive ? 'var(--color-primary-light)' : 'transparent';
                target.style.color = isActive ? 'var(--color-primary)' : 'var(--color-text-muted)';
              }}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ fontSize: '13.5px' }}>{item.label}</span>}
              {item.badge > 0 && (
                <span style={{
                  position: isCollapsed ? 'absolute' : 'static',
                  top: isCollapsed ? '2px' : 'auto',
                  right: isCollapsed ? '2px' : 'auto',
                  marginLeft: isCollapsed ? '0' : 'auto',
                  backgroundColor: 'var(--color-danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Quick Info */}
        {!isCollapsed && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0
          }}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid var(--color-primary-light)' }} 
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: '600' }}>
                {currentUser.role}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
