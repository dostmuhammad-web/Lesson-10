// src/pages/Finance.jsx
import React, { useState } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Calendar, FileText } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Badge, Modal, Input, Select, Table } from '../components/common/ui/index.jsx';

const EXPENSE_CATEGORIES = [
  "Oylik", "Ijara", "Marketing", "Jihozlar", "Kommunal", "Boshqa"
];

export default function Finance() {
  const { db, addExpense, deleteExpense } = useCRM();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Oylik',
    amount: '',
    description: '',
  });

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.amount) {
      alert("Xarajat nomi va summasi majburiy!");
      return;
    }

    addExpense(formData);
    setIsAddOpen(false);
    setFormData({
      title: '',
      category: 'Oylik',
      amount: '',
      description: '',
    });
  };

  // Financial calculations
  const totalRevenue = db.payments.filter(p => p.status === 'Paid' || p.status === 'Partial').reduce((sum, p) => sum + p.paid, 0);
  const totalExpenses = db.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Category sums
  const categorySummary = EXPENSE_CATEGORIES.map(cat => {
    const sum = db.expenses.filter(e => e.category === cat).reduce((total, e) => total + e.amount, 0);
    const percent = totalExpenses ? Math.round((sum / totalExpenses) * 100) : 0;
    return { name: cat, amount: sum, percentage: percent };
  });

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Moliyaviy Boshqaruv (Kassa & Xarajatlar)</h1>
          <p className="page-subtitle">Markazning barcha tushumlari, operatsion xarajatlari va sof foyda monitoringi</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>Xarajat Kiritish</Button>
        </div>
      </div>

      {/* Finance KPI cards */}
      <div className="grid grid-cols-3">
        <Card header="Jami Kirim (Revenue)">
          <div className="d-flex align-center gap-3" style={{ padding: '10px 0' }}>
            <div style={{
              padding: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex'
            }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 style={{ color: 'var(--color-success)', fontSize: '22px', fontWeight: '850' }}>
                {totalRevenue.toLocaleString()} so'm
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>O'quvchilar oylik to'lovlaridan kirimlar</span>
            </div>
          </div>
        </Card>

        <Card header="Jami Chiqim (Expenses)">
          <div className="d-flex align-center gap-3" style={{ padding: '10px 0' }}>
            <div style={{
              padding: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              display: 'flex'
            }}>
              <TrendingDown size={24} />
            </div>
            <div>
              <h2 style={{ color: 'var(--color-danger)', fontSize: '22px', fontWeight: '850' }}>
                {totalExpenses.toLocaleString()} so'm
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Barcha xarajatlar va oylik to'lovlari</span>
            </div>
          </div>
        </Card>

        <Card header="Sof Foyda (Net Profit)">
          <div className="d-flex align-center gap-3" style={{ padding: '10px 0' }}>
            <div style={{
              padding: '10px',
              borderRadius: '50%',
              backgroundColor: netProfit >= 0 ? 'var(--color-primary-light)' : 'var(--color-danger-light)',
              color: netProfit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)',
              display: 'flex'
            }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h2 style={{ color: netProfit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontSize: '22px', fontWeight: '850' }}>
                {netProfit.toLocaleString()} so'm
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Sof rentabellik ko'rsatkichi</span>
            </div>
          </div>
        </Card>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Expenses Register */}
        <Card header="Xarajatlar Registri">
          {db.expenses.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)' }}>
              Xarajat yozuvlari topilmadi.
            </div>
          ) : (
            <Table headers={[
              { label: 'Sana' },
              { label: 'Xarajat nomi' },
              { label: 'Kategoriya' },
              { label: 'Miqdori (UZS)' },
              { label: 'Mas\'ul shaxs' },
              { label: 'Amal', width: '60px' }
            ]}>
              {db.expenses.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.date}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <span style={{ fontWeight: '700' }}>{exp.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>{exp.description || ''}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={exp.category === 'Oylik' ? 'primary' : (exp.category === 'Ijara' ? 'warning' : 'secondary')}>
                      {exp.category}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>
                    -{exp.amount.toLocaleString()} so'm
                  </td>
                  <td>{exp.responsiblePerson}</td>
                  <td>
                    <button className="btn-icon text-danger" onClick={() => {
                      if (confirm("Ushbu xarajat yozuvini o'chirmoqchimisiz?")) deleteExpense(exp.id);
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        {/* Right: Expenses Category Breakdown */}
        <Card header="Kategoriyalar bo'yicha ulush">
          <div className="d-flex flex-column gap-4" style={{ fontSize: '13px' }}>
            {categorySummary.map((item, idx) => (
              <div key={idx} className="d-flex flex-column gap-2">
                <div className="d-flex justify-between font-semibold" style={{ fontWeight: 'bold' }}>
                  <span>{item.name} xarajatlari</span>
                  <span style={{ color: 'var(--color-danger)' }}>
                    {item.amount.toLocaleString()} so'm ({item.percentage}%)
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-danger)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ADD EXPENSE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Yangi xarajat kiritish"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="Xarajat nomi / Maqsadi"
            placeholder="Masalan: Kommunal xizmatlar to'lovi"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />

          <div className="grid grid-cols-2">
            <Select 
              label="Xarajat kategoriyasi"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              options={EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              required
            />
            <Input 
              label="Sarflangan summa (so'm)"
              type="number"
              placeholder="Masalan: 1200000"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
            />
          </div>

          <Input 
            label="Tafsilotlar (Izoh)"
            placeholder="Xarajat bo'yicha qo'shimcha tafsilotlarni yozing..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSubmit}>Xarajatni Saqlash</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
