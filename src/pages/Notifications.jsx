// src/pages/Notifications.jsx
import React from 'react';
import { Bell, Check, Trash2, AlertTriangle, AlertCircle, Info, CreditCard } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Badge } from '../components/common/ui/index.jsx';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRM();

  const getIcon = (type) => {
    switch (type) {
      case 'payment overdue': return <CreditCard size={18} style={{ color: 'var(--color-danger)' }} />;
      case 'group full': return <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />;
      case 'attendance issue': return <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />;
      case 'schedule conflict': return <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />;
      default: return <Info size={18} style={{ color: 'var(--color-info)' }} />;
    }
  };

  const getBackgroundColor = (n) => {
    if (!n.read) return 'var(--color-primary-light)';
    return 'var(--color-surface)';
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Bildirishnomalar Markazi</h1>
          <p className="page-subtitle">To'lov kechikishlari, jadval konfliktlari va tizimning boshqa muhim ogohlantirishlari</p>
        </div>
        <div className="page-header-actions">
          <Button variant="secondary" icon={Check} onClick={markAllNotificationsRead} disabled={notifications.every(n => n.read)}>
            Hammasini o'qilgan deb belgilash
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <Card header={`Bildirishnomalar (${notifications.filter(n => !n.read).length} ta o'qilmagan)`}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-light)' }}>
            <Bell size={48} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
            <h3>Bildirishnomalar mavjud emas</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Tizimda barchasi joyida, hech qanday ogohlantirish aniqlanmadi.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markNotificationRead(n.id)}
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: getBackgroundColor(n),
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{
                  padding: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getIcon(n.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex justify-between align-center" style={{ marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text)' }}>{n.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>{n.date}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                </div>

                {!n.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    alignSelf: 'center',
                    flexShrink: 0
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
