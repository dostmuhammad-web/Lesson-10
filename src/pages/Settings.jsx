// src/pages/Settings.jsx
import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Bell, Shield, Layers, Globe } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Input, Select, Table, Tabs } from '../components/common/ui/index.jsx';

export default function Settings() {
  const { db, saveSettings } = useCRM();
  const [activeTab, setActiveTab] = useState('general');

  const [generalData, setGeneralData] = useState({
    centerName: db?.settings?.centerName || 'Apex Academy',
    phone: db?.settings?.phone || '+998712003040',
    address: db?.settings?.address || 'Toshkent shahar, Chilonzor 1-kvartal',
    currency: db?.settings?.currency || 'so\'m'
  });

  const [notificationToggles, setNotificationToggles] = useState({
    paymentReminders: db?.settings?.notifications?.paymentReminders ?? true,
    leadReminders: db?.settings?.notifications?.leadReminders ?? true,
    attendanceAlerts: db?.settings?.notifications?.attendanceAlerts ?? true
  });

  if (!db) return null;

  const handleGeneralChange = (field, val) => {
    setGeneralData(prev => ({ ...prev, [field]: val }));
  };

  const handleNotificationChange = (field, val) => {
    setNotificationToggles(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    saveSettings({
      ...generalData,
      notifications: notificationToggles
    });
  };

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Tizim Sozlamalari</h1>
          <p className="page-subtitle">O'quv markazi ma'lumotlari, bildirishnoma parametrlari va filiallar ro'yxati</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Save} onClick={handleSave}>Sozlamalarni Saqlash</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={[
          { id: 'general', label: 'Umumiy sozlamalar' },
          { id: 'notifications', label: 'Ogohlantirishlar parametrlari' },
          { id: 'branches', label: 'Filiallar ro\'yxati' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 1. GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <Card header="O'quv markazi asosiy ma'lumotlari" style={{ maxWidth: '600px' }}>
          <div className="d-flex flex-column gap-3">
            <Input 
              label="O'quv markazi nomi"
              value={generalData.centerName}
              onChange={(e) => handleGeneralChange('centerName', e.target.value)}
              required
            />
            <Input 
              label="Bog'lanish telefoni"
              value={generalData.phone}
              onChange={(e) => handleGeneralChange('phone', e.target.value)}
              required
            />
            <Input 
              label="Markazning bosh ofisi manzili"
              value={generalData.address}
              onChange={(e) => handleGeneralChange('address', e.target.value)}
              required
            />
            <Select 
              label="Asosiy valyuta belgisi"
              value={generalData.currency}
              onChange={(e) => handleGeneralChange('currency', e.target.value)}
              options={[
                { value: 'so\'m', label: 'so\'m (UZS)' },
                { value: '$', label: 'dollar ($ - USD)' }
              ]}
              required
            />
          </div>
        </Card>
      )}

      {/* 2. NOTIFICATIONS CONFIG */}
      {activeTab === 'notifications' && (
        <Card header="Bildirishnomalarni boshqarish" style={{ maxWidth: '600px' }}>
          <div className="d-flex flex-column gap-4" style={{ fontSize: '13px' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Qaysi holatlarda tizim sizga ogohlantirish berishini belgilang:
            </p>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notificationToggles.paymentReminders}
                onChange={(e) => handleNotificationChange('paymentReminders', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <strong>To'lov muddati o'tganligini tekshirish</strong>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Qarzi bor o'quvchilarni ogohlantirish kartasi bo'lib chiqadi.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notificationToggles.leadReminders}
                onChange={(e) => handleNotificationChange('leadReminders', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <strong>Lead follow-up eslatmalari</strong>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Menejer lead bilan bugun gaplashishi kerakligini eslatadi.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notificationToggles.attendanceAlerts}
                onChange={(e) => handleNotificationChange('attendanceAlerts', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <strong>Inaktiv o'quvchilarni aniqlash</strong>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Ketma-ket 3+ darsga kelmaganlarni ogohlantirish centerda ko'rsatadi.</div>
              </div>
            </label>
          </div>
        </Card>
      )}

      {/* 3. BRANCHES MANAGEMENT */}
      {activeTab === 'branches' && (
        <Card header="O'quv markazi filiallari ro'yxati">
          <Table headers={[
            { label: 'Filial nomi' },
            { label: 'Manzil' },
            { label: 'Telefon' },
            { label: 'Mas\'ul direktor' },
            { label: 'Guruhlar' },
            { label: 'O\'quvchilar soni' }
          ]}>
            {db.branches.map(branch => (
              <tr key={branch.id}>
                <td style={{ fontWeight: '750' }}>{branch.name}</td>
                <td>{branch.address}</td>
                <td style={{ fontWeight: '500' }}>{branch.phone}</td>
                <td>{branch.manager}</td>
                <td>{branch.groupsCount} ta guruh</td>
                <td>
                  <Badge variant="primary">{branch.studentsCount} ta o'quvchi</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

    </div>
  );
}
