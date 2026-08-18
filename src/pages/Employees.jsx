// src/pages/Employees.jsx
import React, { useState } from 'react';
import { Plus, UserCheck, Shield, Phone, Mail, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Badge, Modal, Input, Select, Table, Tabs } from '../components/common/ui/index.jsx';

const ROLES = ["Super Admin", "Director", "Manager", "Teacher", "Cashier", "Operator"];

const MODULE_PERMISSIONS = [
  { module: "Moliya (Kassa & Xarajatlar)", superAdmin: true, director: true, manager: false, teacher: false, cashier: true },
  { module: "Hisobotlar (Analytics)", superAdmin: true, director: true, manager: false, teacher: false, cashier: false },
  { module: "O'quvchilar & Guruhlar", superAdmin: true, director: true, manager: true, teacher: true, cashier: false },
  { module: "Leadlar (Kanban & So'rovlar)", superAdmin: true, director: true, manager: true, teacher: false, cashier: false },
  { module: "Baholar & Uy vazifalari", superAdmin: true, director: true, manager: false, teacher: true, cashier: false },
  { module: "Tizim sozlamalari", superAdmin: true, director: false, manager: false, teacher: false, cashier: false }
];

export default function Employees() {
  const { db, addEmployee, updateEmployee } = useCRM();
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'roles'
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Manager',
    phone: '',
    email: '',
    branchId: 'b1'
  });

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert("Xodim ismi va telefoni majburiy!");
      return;
    }

    addEmployee(formData);
    setIsAddOpen(false);
    setFormData({
      name: '',
      role: 'Manager',
      phone: '',
      email: '',
      branchId: 'b1'
    });
  };

  const handleToggleActive = (employee) => {
    updateEmployee(employee.id, { ...employee, active: !employee.active });
  };

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Xodimlar va Rollar</h1>
          <p className="page-subtitle">Markaz ishchi xodimlari registri, rollari va foydalanish huquqlari (Permissions)</p>
        </div>
        <div className="page-header-actions">
          {activeTab === 'list' && (
            <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>Yangi Xodim Qo'shish</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={[
          { id: 'list', label: 'Xodimlar ro\'yxati' },
          { id: 'roles', label: 'Huquqlar & Rollar Matritsasi (Permissions)' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 1. EMPLOYEES ROSTER */}
      {activeTab === 'list' && (
        <div className="table-container">
          <Table headers={[
            { label: 'Foydalanuvchi' },
            { label: 'Tizim Roli' },
            { label: 'Telefon' },
            { label: 'Filiali' },
            { label: 'Holati' },
            { label: 'Huquqni o\'zgartirish', width: '130px' }
          ]}>
            {db.employees.map(emp => {
              const branch = db.branches.find(b => b.id === emp.branchId);
              return (
                <tr key={emp.id} style={{ opacity: emp.active ? 1 : 0.5 }}>
                  <td>
                    <div className="d-flex align-center gap-3">
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="d-flex flex-column">
                        <span style={{ fontWeight: '750' }}>{emp.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>{emp.email || ''}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={emp.role === 'Super Admin' || emp.role === 'Director' ? 'success' : 'primary'}>
                      {emp.role}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: '500' }}>{emp.phone}</td>
                  <td>{branch ? branch.name : '-'}</td>
                  <td>
                    <Badge variant={emp.active ? 'success' : 'danger'}>
                      {emp.active ? 'Faol' : 'Inaktiv'}
                    </Badge>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleActive(emp)}
                      className="btn-icon"
                      style={{ border: 'none', background: 'none' }}
                      title={emp.active ? "Bloklash" : "Faollashtirish"}
                    >
                      {emp.active ? (
                        <ToggleRight size={24} style={{ color: 'var(--color-success)' }} />
                      ) : (
                        <ToggleLeft size={24} style={{ color: 'var(--color-text-light)' }} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      )}

      {/* 2. ROLES MATRIX TABLE */}
      {activeTab === 'roles' && (
        <Card header="Tizim rollari va ruxsat berilgan modullar matritsasi">
          <Table headers={[
            { label: 'Tizim Moduli' },
            { label: 'Super Admin', width: '120px' },
            { label: 'Director', width: '120px' },
            { label: 'Manager', width: '120px' },
            { label: 'Teacher', width: '120px' },
            { label: 'Cashier', width: '120px' }
          ]}>
            {MODULE_PERMISSIONS.map((perm, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: '700' }}>{perm.module}</td>
                {/* Super Admin */}
                <td style={{ textAlign: 'center' }}>
                  {perm.superAdmin ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <X size={18} style={{ color: 'var(--color-danger)' }} />}
                </td>
                {/* Director */}
                <td style={{ textAlign: 'center' }}>
                  {perm.director ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <X size={18} style={{ color: 'var(--color-danger)' }} />}
                </td>
                {/* Manager */}
                <td style={{ textAlign: 'center' }}>
                  {perm.manager ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <X size={18} style={{ color: 'var(--color-danger)' }} />}
                </td>
                {/* Teacher */}
                <td style={{ textAlign: 'center' }}>
                  {perm.teacher ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <X size={18} style={{ color: 'var(--color-danger)' }} />}
                </td>
                {/* Cashier */}
                <td style={{ textAlign: 'center' }}>
                  {perm.cashier ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <X size={18} style={{ color: 'var(--color-danger)' }} />}
                </td>
              </tr>
            ))}
          </Table>
          
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: '1.5'
          }}>
            ℹ️ Ruxsatlar matn va sahifalarga kirishni boshqaradi. Sidebar va Headerdagi havolalar ushbu huquqlar asosida o'zgaradi. 
            Sinov rejimida Headerning o'ng burchagidagi Foydalanuvchi menyusi orqali rollarni almashtirib sinab ko'rishingiz mumkin.
          </div>
        </Card>
      )}

      {/* ADD EMPLOYEE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Yangi xodim qo'shish"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="Xodim F.I.SH." 
            placeholder="Masalan: Dilshod Rahimov" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2">
            <Input 
              label="Telefon raqami" 
              placeholder="+998901234567" 
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
            <Input 
              label="Elektron pochta (Email)" 
              placeholder="dilshod@crm.uz" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2">
            <Select 
              label="Tizim roli" 
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              options={ROLES.map(role => ({ value: role, label: role }))}
              required
            />
            <Select 
              label="Biriktirilgan filial" 
              value={formData.branchId}
              onChange={(e) => handleInputChange('branchId', e.target.value)}
              options={db.branches.map(b => ({ value: b.id, label: b.name }))}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSubmit}>Saqlash</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
