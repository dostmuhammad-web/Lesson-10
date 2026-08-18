// src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Sun, Moon, Plus, Globe, ChevronDown, 
  Menu, CreditCard, Users, UserPlus, Grid, GraduationCap, Calendar, CheckSquare
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../common/ui/index.jsx';

export default function Header({ setIsMobileOpen, openGlobalQuickModal }) {
  const navigate = useNavigate();
  const { 
    db, currentUser, changeUserRole, 
    selectedBranch, changeBranch, 
    theme, toggleTheme, notifications, markNotificationRead,
    logout
  } = useCRM();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    students: [],
    teachers: [],
    groups: [],
    leads: []
  });

  const [activeDropdown, setActiveDropdown] = useState(null); // 'branch', 'lang', 'actions', 'user', 'notif'
  const dropdownRef = useRef(null);

  const unreadNotifications = notifications.filter(n => !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut CTRL + K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global search implementation
  useEffect(() => {
    if (!searchQuery.trim() || !db) {
      setSearchResults({ students: [], teachers: [], groups: [], leads: [] });
      return;
    }

    const q = searchQuery.toLowerCase();
    
    const students = db.students.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.phone.includes(q) || 
      s.id.toLowerCase().includes(q)
    ).slice(0, 5);

    const teachers = db.teachers.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.phone.includes(q) || 
      t.specialization.toLowerCase().includes(q)
    ).slice(0, 5);

    const groups = db.groups.filter(g => 
      g.name.toLowerCase().includes(q) || 
      g.room.toLowerCase().includes(q)
    ).slice(0, 5);

    const leads = db.leads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.phone.includes(q) || 
      l.interestedCourse.toLowerCase().includes(q)
    ).slice(0, 5);

    setSearchResults({ students, teachers, groups, leads });
  }, [searchQuery, db]);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSearchResultClick = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleQuickAction = (actionName) => {
    setActiveDropdown(null);
    openGlobalQuickModal(actionName);
  };

  return (
    <header className="main-header" style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'relative',
      zIndex: 900,
      flexShrink: 0
    }}>
      {/* Left side: Hamburger (mobile) & Search bar */}
      <div className="header-left" style={{ display: 'flex', alignCenter: 'center', gap: '16px', flex: 1 }}>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileOpen(true)} 
          style={{ display: 'none', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}
        >
          <Menu size={20} />
        </button>

        {/* Search trigger button (looks like search bar) */}
        <button 
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            width: '100%',
            maxWidth: '320px',
            color: 'var(--color-text-light)',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '13px'
          }}
        >
          <Search size={16} />
          <span>Global qidiruv...</span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '10px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 'bold',
            color: 'var(--color-text-muted)'
          }}>
            Ctrl + K
          </span>
        </button>
      </div>

      {/* Right side Actions */}
      <div ref={dropdownRef} className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Branch Selector (Director/Super Admin only) */}
        {['Super Admin', 'Director'].includes(currentUser.role) && (
          <div className="branch-selector-wrapper" style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => toggleDropdown('branch')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>
                {selectedBranch === 'all' 
                  ? 'Hamma filiallar' 
                  : db?.branches.find(b => b.id === selectedBranch)?.name || 'Filial'}
              </span>
              <ChevronDown size={14} />
            </button>
            
            {activeDropdown === 'branch' && (
              <div className="dropdown-menu fade-in" style={dropdownMenuStyle}>
                <button style={dropdownItemStyle} onClick={() => { changeBranch('all'); setActiveDropdown(null); }}>
                  Hamma filiallar
                </button>
                {db?.branches.map(b => (
                  <button 
                    key={b.id} 
                    style={dropdownItemStyle} 
                    onClick={() => { changeBranch(b.id); setActiveDropdown(null); }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions (Admin, Director, Manager, Cashier) */}
        {currentUser.role !== 'Teacher' && (
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => toggleDropdown('actions')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Yangi qo'shish</span>
              <ChevronDown size={14} />
            </button>

            {activeDropdown === 'actions' && (
              <div className="dropdown-menu fade-in" style={{ ...dropdownMenuStyle, width: '200px' }}>
                {['Super Admin', 'Director', 'Manager'].includes(currentUser.role) && (
                  <>
                    <button style={dropdownItemStyle} onClick={() => handleQuickAction('student')}>
                      <Users size={14} style={{ marginRight: '8px' }} /> O'quvchi
                    </button>
                    <button style={dropdownItemStyle} onClick={() => handleQuickAction('lead')}>
                      <UserPlus size={14} style={{ marginRight: '8px' }} /> Lead kiritish
                    </button>
                    <button style={dropdownItemStyle} onClick={() => handleQuickAction('group')}>
                      <Grid size={14} style={{ marginRight: '8px' }} /> Guruh
                    </button>
                    <button style={dropdownItemStyle} onClick={() => handleQuickAction('teacher')}>
                      <GraduationCap size={14} style={{ marginRight: '8px' }} /> O'qituvchi
                    </button>
                  </>
                )}
                {['Super Admin', 'Director', 'Manager', 'Cashier'].includes(currentUser.role) && (
                  <button style={dropdownItemStyle} onClick={() => handleQuickAction('payment')}>
                    <CreditCard size={14} style={{ marginRight: '8px' }} /> To'lov qabul qilish
                  </button>
                )}
                {['Super Admin', 'Director', 'Manager'].includes(currentUser.role) && (
                  <button style={dropdownItemStyle} onClick={() => handleQuickAction('trial')}>
                    <Calendar size={14} style={{ marginRight: '8px' }} /> Sinov darsi belgilash
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Language selector */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-icon" 
            onClick={() => toggleDropdown('lang')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Globe size={18} />
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>UZ</span>
          </button>
          {activeDropdown === 'lang' && (
            <div className="dropdown-menu fade-in" style={{ ...dropdownMenuStyle, width: '100px', minWidth: 'auto' }}>
              <button style={{ ...dropdownItemStyle, fontWeight: 'bold', color: 'var(--color-primary)' }}>UZ (O'zbek)</button>
              <button style={dropdownItemStyle} onClick={() => alert("Hozircha faqat O'zbek tili qo'llab-quvvatlanadi!")}>EN (English)</button>
              <button style={dropdownItemStyle} onClick={() => alert("Hozircha faqat O'zbek tili qo'llab-quvvatlanadi!")}>RU (Русский)</button>
            </div>
          )}
        </div>

        {/* Theme switcher */}
        <button className="btn-icon" onClick={toggleTheme} title="Mavzuni o'zgartirish">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={() => toggleDropdown('notif')}>
            <Bell size={18} />
            {unreadNotifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--color-danger)',
                width: '8px',
                height: '8px',
                borderRadius: '50%'
              }} />
            )}
          </button>

          {activeDropdown === 'notif' && (
            <div className="dropdown-menu fade-in" style={{ ...dropdownMenuStyle, width: '320px', padding: '0' }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-secondary-light)'
              }}>
                <span>Bildirishnomalar</span>
                {unreadNotifications.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {unreadNotifications.length} ta yangi
                  </span>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '13px' }}>
                    Bildirishnomalar mavjud emas.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: n.read ? 'transparent' : 'var(--color-primary-light)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'var(--color-primary-light)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text)' }}>{n.title}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>{n.date}</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div style={{
                padding: '8px',
                borderTop: '1px solid var(--color-border)',
                textAlign: 'center',
                backgroundColor: 'var(--color-secondary-light)'
              }}>
                <button 
                  onClick={() => { navigate('/notifications'); setActiveDropdown(null); }}
                  style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)' }}
                >
                  Hammasini ko'rish
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile switcher (Testing simulator) */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => toggleDropdown('user')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              backgroundColor: 'var(--color-secondary-light)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              style={{ width: '24px', height: '24px', borderRadius: '50%' }} 
            />
            <span className="header-user-name" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--color-text)' }}>
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown size={14} className="header-user-name" style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {activeDropdown === 'user' && (
            <div className="dropdown-menu fade-in" style={{ ...dropdownMenuStyle, width: '220px' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 'bold' }}>SİMULATSIYA ROLI</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{currentUser.role}</div>
              </div>
              
              <div style={{ padding: '8px 0' }}>
                <div style={{ padding: '4px 16px', fontSize: '10px', color: 'var(--color-text-light)', fontWeight: 'bold' }}>ROLNI O'ZGARTIRISH</div>
                {['Super Admin', 'Director', 'Manager', 'Teacher', 'Cashier'].map(role => (
                  <button
                    key={role}
                    onClick={() => { changeUserRole(role); setActiveDropdown(null); }}
                    style={{
                      ...dropdownItemStyle,
                      fontWeight: currentUser.role === role ? 'bold' : 'normal',
                      color: currentUser.role === role ? 'var(--color-primary)' : 'var(--color-text)'
                    }}
                  >
                    {role === 'Super Admin' && '👑 '}
                    {role === 'Director' && '💼 '}
                    {role === 'Manager' && '📂 '}
                    {role === 'Teacher' && '🎓 '}
                    {role === 'Cashier' && '💵 '}
                    {role}
                  </button>
                ))}
              </div>
              
              <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0 0 0' }}>
                <button
                  onClick={() => { logout(); setActiveDropdown(null); }}
                  style={{
                    ...dropdownItemStyle,
                    color: 'var(--color-danger)',
                    fontWeight: '700'
                  }}
                >
                  🚪 Chiqish (Log Out)
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* COMMAND PALETTE (GLOBAL SEARCH MODAL) */}
      <Modal 
        isOpen={searchOpen} 
        onClose={() => { setSearchOpen(false); setSearchQuery(''); }} 
        title="Apex CRM - Global Qidiruv"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-4" style={{ minHeight: '300px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              className="form-input"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O'quvchi ismi, ID, telefon raqami, o'qituvchi, guruh yoki lead nomi..."
              style={{ paddingLeft: '38px', fontSize: '16px', paddingHeight: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {!searchQuery.trim() ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Qidirishni boshlash uchun biror narsa kiriting...
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '6px' }}>
                  Ism, telefon raqam, yoki ID bo'yicha tezkor qidiruv tizimi.
                </div>
              </div>
            ) : (
              Object.keys(searchResults).every(k => searchResults[k].length === 0) ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Natija topilmadi.
                </div>
              ) : (
                <>
                  {/* Students Result */}
                  {searchResults.students.length > 0 && (
                    <div>
                      <div style={searchCategoryTitleStyle}>O'quvchilar</div>
                      <div className="d-flex flex-column gap-1">
                        {searchResults.students.map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => handleSearchResultClick(`/students/${s.id}`)}
                            style={searchResultItemStyle}
                            className="search-item-hover"
                          >
                            <span style={{ fontWeight: '700' }}>{s.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>ID: {s.id} | Tel: {s.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leads Result */}
                  {searchResults.leads.length > 0 && (
                    <div>
                      <div style={searchCategoryTitleStyle}>Leadlar (Potensial O'quvchilar)</div>
                      <div className="d-flex flex-column gap-1">
                        {searchResults.leads.map(l => (
                          <div 
                            key={l.id} 
                            onClick={() => handleSearchResultClick(`/leads`)}
                            style={searchResultItemStyle}
                            className="search-item-hover"
                          >
                            <span style={{ fontWeight: '700' }}>{l.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Kurs: {l.interestedCourse} | Manba: {l.source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teachers Result */}
                  {searchResults.teachers.length > 0 && (
                    <div>
                      <div style={searchCategoryTitleStyle}>O'qituvchilar</div>
                      <div className="d-flex flex-column gap-1">
                        {searchResults.teachers.map(t => (
                          <div 
                            key={t.id} 
                            onClick={() => handleSearchResultClick(`/teachers/${t.id}`)}
                            style={searchResultItemStyle}
                            className="search-item-hover"
                          >
                            <span style={{ fontWeight: '700' }}>{t.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Sohasi: {t.specialization} | Den: {t.experience}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Groups Result */}
                  {searchResults.groups.length > 0 && (
                    <div>
                      <div style={searchCategoryTitleStyle}>Guruhlar</div>
                      <div className="d-flex flex-column gap-1">
                        {searchResults.groups.map(g => (
                          <div 
                            key={g.id} 
                            onClick={() => handleSearchResultClick(`/groups/${g.id}`)}
                            style={searchResultItemStyle}
                            className="search-item-hover"
                          >
                            <span style={{ fontWeight: '700' }}>{g.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Jadval: {g.schedule} | Xona: {g.room}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </Modal>
    </header>
  );
}

// Inline Styles for simplicity/flexibility in dropdowns
const dropdownMenuStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  width: '160px',
  display: 'flex',
  flexDirection: 'column',
  padding: '6px 0',
  zIndex: 1000
};

const dropdownItemStyle = {
  padding: '10px 16px',
  width: '100%',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '500',
  color: 'var(--color-text)',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'background-color var(--transition-fast)'
};

const searchCategoryTitleStyle = {
  fontSize: '11px',
  fontWeight: '800',
  color: 'var(--color-text-light)',
  textTransform: 'uppercase',
  marginBottom: '6px',
  letterSpacing: '0.5px'
};

const searchResultItemStyle = {
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-background)',
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '13px',
  transition: 'all var(--transition-fast)'
};
