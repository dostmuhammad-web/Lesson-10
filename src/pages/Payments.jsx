// src/pages/Payments.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, CreditCard, Search, Plus, FileText, Download, Check } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Table, Button, Badge, Modal, Input, Select, Pagination } from '../components/common/ui/index.jsx';

export default function Payments({ quickAddType, resetQuickAdd }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { db, addPayment, deletePayment, currentUser } = useCRM();

  // Search/Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(quickAddType === 'payment');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paid: '',
    dueDate: '',
    method: 'Naqd'
  });

  // Handle URL query parameters for invoice printing on redirect
  useEffect(() => {
    if (!db) return;
    const params = new URLSearchParams(location.search);
    const invoiceId = params.get('printInvoice');
    if (invoiceId) {
      const inv = db.payments.find(p => p.id === invoiceId);
      if (inv) {
        setSelectedInvoice(inv);
      }
    }
  }, [location, db]);

  // Handle Quick Add payment trigger
  useEffect(() => {
    if (quickAddType === 'payment') {
      setIsAddOpen(true);
      resetQuickAdd();
    }
  }, [quickAddType, resetQuickAdd]);

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      // Auto-populate amount based on student course price
      if (field === 'studentId') {
        const std = db.students.find(s => s.id === val);
        const course = db.courses.find(c => c.id === std?.courseId);
        if (course) {
          updated.amount = course.price;
          updated.paid = course.price; // default to full payment
        }
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.paid) {
      alert("O'quvchi va to'lov summasi majburiy!");
      return;
    }

    addPayment(formData);
    setIsAddOpen(false);
    setFormData({
      studentId: '',
      amount: '',
      paid: '',
      dueDate: '',
      method: 'Naqd'
    });
  };

  // Filter & Search Logic
  const filteredPayments = db.payments.filter(p => {
    const std = db.students.find(s => s.id === p.studentId);
    
    // Status filter
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    
    // Method filter
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;

    // Search filter
    const query = searchTerm.toLowerCase();
    return (
      p.studentName.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.courseName.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalItems = filteredPayments.length;
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <Badge variant="success">To'langan</Badge>;
      case 'Partial': return <Badge variant="warning">Qisman</Badge>;
      case 'Pending': return <Badge variant="secondary">Kutilmoqda</Badge>;
      case 'Overdue': return <Badge variant="danger">Muddati o'tgan</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header no-print">
        <div className="page-header-info">
          <h1 className="page-title">To'lovlar va Kassa</h1>
          <p className="page-subtitle">O'quvchilar oylik to'lovlari hisoboti, kvitansiyalar va moliyaviy tushumlar reyestri</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => {
            const firstActiveStd = db.students.find(s => s.status === 'Active');
            setFormData({
              studentId: firstActiveStd?.id || '',
              amount: db.courses[0]?.price || '',
              paid: db.courses[0]?.price || '',
              dueDate: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
              method: 'Naqd'
            });
            setIsAddOpen(true);
          }}>To'lov Qabul Qilish</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar no-print">
        <div style={{ flex: 2, minWidth: '240px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              className="form-input"
              placeholder="O'quvchi ismi yoki kvitansiya raqami bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>
        
        <div className="filter-item">
          <Select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
            options={[
              { value: 'all', label: 'Barcha statuslar' },
              { value: 'Paid', label: "To'langan" },
              { value: 'Partial', label: 'Qisman' },
              { value: 'Overdue', label: "Muddati o'tgan" }
            ]} 
          />
        </div>

        <div className="filter-item">
          <Select 
            value={methodFilter} 
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }} 
            options={[
              { value: 'all', label: 'Barcha to\'lov turlari' },
              { value: 'Naqd', label: 'Naqd pul' },
              { value: 'Karta', label: 'Karta (Payme/Click)' },
              { value: 'O\'tkazma', label: 'Bank o\'tkazmasi' }
            ]} 
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container no-print">
        <Table headers={[
          { label: 'Kvitansiya' },
          { label: 'O\'quvchi' },
          { label: 'Kurs' },
          { label: 'To\'lov turi' },
          { label: 'Jami narx' },
          { label: 'To\'langan' },
          { label: 'Qoldiq qarz' },
          { label: 'To\'lov sanasi' },
          { label: 'Holati' },
          { label: 'Kvitansiya', width: '100px' }
        ]}>
          {paginatedPayments.map(p => (
            <tr key={p.id}>
              <td style={{ fontWeight: '700' }}>{p.id}</td>
              <td style={{ fontWeight: '600' }}>{p.studentName}</td>
              <td>{p.courseName}</td>
              <td>
                <Badge variant="secondary">{p.method}</Badge>
              </td>
              <td style={{ fontWeight: 'bold' }}>{p.amount.toLocaleString()} so'm</td>
              <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{p.paid.toLocaleString()} so'm</td>
              <td style={{ color: p.remaining > 0 ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 'bold' }}>
                {p.remaining.toLocaleString()} so'm
              </td>
              <td>{p.date || p.dueDate}</td>
              <td>{getStatusBadge(p.status)}</td>
              <td>
                <Button variant="secondary" size="sm" icon={FileText} onClick={() => setSelectedInvoice(p)}>
                  Kvitansiya
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        
        <Pagination 
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ADD PAYMENT MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Yangi to'lov qabul qilish"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Select 
            label="O'quvchini tanlang"
            value={formData.studentId}
            onChange={(e) => handleInputChange('studentId', e.target.value)}
            options={[
              { value: '', label: 'O\'quvchini tanlang...' },
              ...db.students.filter(s => s.status === 'Active' || s.status === 'Trial').map(s => ({
                value: s.id,
                label: `${s.name} (Qarz: ${Math.abs(s.balance).toLocaleString()} so'm)`
              }))
            ]}
            required
          />

          <div className="grid grid-cols-2">
            <Input 
              label="Jami to'lov summasi (Kurs narxi)" 
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
            />
            <Input 
              label="Hozir to'lanayotgan summa (so'm)" 
              type="number"
              value={formData.paid}
              onChange={(e) => handleInputChange('paid', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2">
            <Select 
              label="To'lov usuli"
              value={formData.method}
              onChange={(e) => handleInputChange('method', e.target.value)}
              options={[
                { value: 'Naqd', label: 'Naqd pul' },
                { value: 'Karta', label: 'Karta (Click/Payme/Ucard)' },
                { value: 'O\'tkazma', label: 'Bank o\'tkazmasi (Pul o\'tkazish)' }
              ]}
              required
            />
            <Input 
              label="To'lov muddati (Oxirgi sana)" 
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSubmit}>To'lovni Saqlash</Button>
          </div>
        </div>
      </Modal>

      {/* DETAILED RECEIPT / INVOICE MODAL (FOR PRINTING) */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => { setSelectedInvoice(null); navigate(location.pathname); }}
        title="To'lov kvitansiyasi (Receipt)"
        maxWidth="lg"
      >
        {selectedInvoice && (
          <div className="d-flex flex-column gap-6">
            
            {/* The printable receipt block */}
            <div id="printable-receipt" style={{
              padding: '24px',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'white',
              color: '#333',
              fontFamily: 'monospace'
            }}>
              {/* Receipt Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '2px dashed #ccc',
                paddingBottom: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <h2 style={{ fontSize: '18px', margin: 0, color: 'black', fontWeight: 'bold' }}>APEX LEARNING CENTER</h2>
                  <span style={{ fontSize: '11px', color: '#666' }}>Toshkent, Chilonzor 1-kvartal. Tel: +998712003040</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: 0, color: 'black' }}>KVITANSIYA</h3>
                  <strong style={{ fontSize: '14px', color: 'var(--color-primary)' }}>{selectedInvoice.id}</strong>
                </div>
              </div>

              {/* Receipt Body Info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>O'quvchi F.I.SH.:</span>
                  <strong style={{ color: 'black' }}>{selectedInvoice.studentName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Kurs (Fani):</span>
                  <strong>{selectedInvoice.courseName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>To'lov turi:</span>
                  <strong>{selectedInvoice.method}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>To'lov sanasi:</span>
                  <strong>{selectedInvoice.date || selectedInvoice.dueDate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Kassa xodimi:</span>
                  <strong>{selectedInvoice.cashier}</strong>
                </div>

                <div style={{
                  borderTop: '1px dashed #ccc',
                  borderBottom: '1px dashed #ccc',
                  padding: '12px 0',
                  margin: '12px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>Jami Hisob:</span>
                    <strong>{selectedInvoice.amount.toLocaleString()} so'm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'green' }}>
                    <span>To'landi:</span>
                    <strong>{selectedInvoice.paid.toLocaleString()} so'm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: selectedInvoice.remaining > 0 ? 'red' : 'black' }}>
                    <span>Qoldiq qarz:</span>
                    <strong>{selectedInvoice.remaining.toLocaleString()} so'm</strong>
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div style={{
                textAlign: 'center',
                fontSize: '11px',
                color: '#666',
                marginTop: '16px',
                borderTop: '1px solid #eee',
                paddingTop: '8px'
              }}>
                To'lovingiz uchun rahmat! Apex Academy sizga zafarlar tilaydi.
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Muhr o'rni: L.S._________</span>
                  <span>Imzo: _______________</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="no-print" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <Button variant="secondary" onClick={() => { setSelectedInvoice(null); navigate(location.pathname); }}>Yopish</Button>
              <Button variant="primary" icon={Printer} onClick={handlePrintReceipt}>Kvitansiyani Chop Etish</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
