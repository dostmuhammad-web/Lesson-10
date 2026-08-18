// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { Input, Button, Card, Select } from '../components/common/ui/index.jsx';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { db, login } = useCRM();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [email, setEmail] = useState('azizbek@crm.uz');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Account profiles mapping to make testing easier
  const roleAccounts = [
    { role: 'Super Admin', email: 'azizbek@crm.uz', name: 'Azizbek Rahimov (Super Admin)' },
    { role: 'Director', email: 'director@crm.uz', name: 'Alisher Usmanov (Direktor)' },
    { role: 'Manager', email: 'doston@crm.uz', name: 'Dostonbek Qodirov (Menejer)' },
    { role: 'Teacher', email: 'sardor@crm.uz', name: 'Sardor Axmedov (O\'qituvchi)' },
    { role: 'Cashier', email: 'shaxlo@crm.uz', name: 'Shahlo Karimova (Kassir)' }
  ];

  const handleQuickSelect = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    const account = roleAccounts.find(acc => acc.role === role);
    if (account) {
      setEmail(account.email);
      setPassword(role === 'Super Admin' ? 'admin123' : 'password123');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError("Email va parolni to'ldiring!");
      setIsLoading(false);
      return;
    }

    // Simulate database lookup delay
    setTimeout(() => {
      try {
        login(selectedRole);
        setIsLoading(false);
        navigate('/dashboard');
      } catch (err) {
        setError("Tizimga kirishda xatolik yuz berdi!");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-secondary-light)',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Logo and Brand Title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            fontSize: '24px',
            boxShadow: 'var(--shadow-md)'
          }}>
            A
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: 'var(--color-text)' }}>Apex CRM</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-light)', margin: 0 }}>
            O'quv markazlarini boshqarishning eng mukammal tizimi
          </p>
        </div>

        {/* Login Card Form */}
        <Card>
          <div style={{ padding: '8px 4px 16px 4px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--color-text)' }}>Tizimga Kirish</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Davom etish uchun hisobingizga kiring
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick selector of roles for testing */}
            <Select
              label="Test kirish uchun rolini tanlang"
              value={selectedRole}
              onChange={handleQuickSelect}
              options={roleAccounts.map(acc => ({ value: acc.role, label: acc.name }))}
            />

            <Input
              label="E-pochta manzili"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@crm.uz"
              required
            />

            <Input
              label="Maxfiy kalit (Password)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              icon={LogIn}
              style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '8px' }}
              disabled={isLoading}
            >
              {isLoading ? "Tizimga kirilmoqda..." : "Tizimga kirish"}
            </Button>
          </form>
        </Card>

        {/* Small footer notice */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-light)' }}>
          Apex Academy © 2026. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </div>
  );
}
