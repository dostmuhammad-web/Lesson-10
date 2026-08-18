// src/pages/Debtors.jsx
import React, { useState } from 'react';
import { AlertOctagon, Phone, MessageSquare, Send, Search, DollarSign } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Table, Button, Badge, Select, SearchInput, Card } from '../components/common/ui/index.jsx';

export default function Debtors() {
  const { db, selectedBranch, showToast } = useCRM();

  // Search/Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [daysFilter, setDaysFilter] = useState('all'); // 'all', '1-7', '8-30', '30+'

  if (!db) return null;

  // Process students who have a negative balance
  const debtors = db.students
    .filter(s => s.balance < 0)
    .map(student => {
      // Find course, group, and payment records to get due date
      const course = db.courses.find(c => c.id === student.courseId);
      const group = db.groups.find(g => g.id === student.groupId);
      
      const studentPayments = db.payments.filter(p => p.studentId === student.id);
      
      // Calculate how many days overdue
      // If student joined long ago or has payment, calculate from due date
      // We will generate a mock daysOverdue procedurally
      const idNum = parseInt(student.id.replace('std', ''));
      let daysOverdue = (idNum * 3) % 45 + 1; // procedural range 1 to 45
      if (daysFilter === '1-7') daysOverdue = (idNum % 7) + 1;
      else if (daysFilter === '8-30') daysOverdue = (idNum % 22) + 8;
      else if (daysFilter === '30+') daysOverdue = (idNum % 15) + 31;

      const totalFee = course ? course.price : 0;
      const debt = Math.abs(student.balance);
      const paid = Math.max(0, totalFee - debt);

      return {
        ...student,
        courseName: course ? course.name : 'Kurs',
        groupName: group ? group.name : 'Guruhsiz',
        totalFee,
        paid,
        debt,
        daysOverdue,
        dueDate: studentPayments[0]?.dueDate || '15.08.2026'
      };
    });

  // Filter & Search Logic
  const filteredDebtors = debtors.filter(d => {
    // Branch filter
    if (selectedBranch !== 'all' && d.branchId !== selectedBranch) return false;

    // Overdue days filter
    if (daysFilter === '1-7' && (d.daysOverdue < 1 || d.daysOverdue > 7)) return false;
    if (daysFilter === '8-30' && (d.daysOverdue < 8 || d.daysOverdue > 30)) return false;
    if (daysFilter === '30+' && d.daysOverdue <= 30) return false;

    // Search filter
    const query = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(query) ||
      d.phone.includes(query) ||
      d.parent?.name.toLowerCase().includes(query)
    );
  });

  // Send SMS Reminder Simulation
  const handleSendReminder = (debtor) => {
    const parentName = debtor.parent?.name || debtor.name;
    const parentPhone = debtor.parent?.phone || debtor.phone;
    
    // Simulate SMS sending API
    showToast(
      `SMS Yuborildi: ${parentName} (${parentPhone}) ga ${debtor.debt.toLocaleString()} so'm qarz haqida ogohlantirish yuborildi!`, 
      'success'
    );
  };

  const handleBulkReminder = () => {
    if (filteredDebtors.length === 0) return;
    showToast(
      `Muvaffaqiyatli: Tanlangan ${filteredDebtors.length} ta qarzdor o'quvchining ota-onalariga SMS ogohlantirish yuborildi!`,
      'success'
    );
  };

  const getOverdueSeverity = (days) => {
    if (days >= 30) return 'danger';
    if (days >= 8) return 'warning';
    return 'info';
  };

  const totalDebtSum = filteredDebtors.reduce((sum, d) => sum + d.debt, 0);

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Qarzdorlik Registri (Debtors)</h1>
          <p className="page-subtitle">O'quv to'lovini amalga oshirmagan faol o'quvchilar ro'yxati va SMS xabarnoma jo'natish</p>
        </div>
        <div className="page-header-actions">
          <Button variant="danger" icon={Send} onClick={handleBulkReminder} disabled={filteredDebtors.length === 0}>
            Hammaga SMS Eslatma Yuborish
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3" style={{ gap: '16px' }}>
        <Card header="Jami Qarzdorlar" style={{ padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', textAlign: 'center', color: 'var(--color-danger)' }}>
            {filteredDebtors.length} ta o'quvchi
          </div>
        </Card>
        <Card header="Umumiy Qarz Miqdori" style={{ padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-danger)', textAlign: 'center' }}>
            {totalDebtSum.toLocaleString()} so'm
          </div>
        </Card>
        <Card header="Muddati 30+ kundan oshganlar" style={{ padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#ff0000', textAlign: 'center' }}>
            {filteredDebtors.filter(d => d.daysOverdue >= 30).length} ta
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div style={{ flex: 2, minWidth: '240px' }}>
          <SearchInput 
            placeholder="O'quvchi yoki ota-ona ismi bo'yicha qidirish..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <Select 
            value={daysFilter} 
            onChange={(e) => setDaysFilter(e.target.value)} 
            options={[
              { value: 'all', label: 'Barcha muddatlar' },
              { value: '1-7', label: '1 - 7 kun kechikkan' },
              { value: '8-30', label: '8 - 30 kun kechikkan' },
              { value: '30+', label: '30+ kundan oshgan' }
            ]} 
          />
        </div>
      </div>

      {/* Debtors List Table */}
      {filteredDebtors.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)'
        }}>
          Qarzdor o'quvchilar ro'yxati bo'sh! Hammaning to'lovi muvaffaqiyatli yakunlangan.
        </div>
      ) : (
        <div className="table-container">
          <Table headers={[
            { label: 'O\'quvchi' },
            { label: 'Telefon' },
            { label: 'Ota-ona (Vasiy)' },
            { label: 'Kurs / Guruh' },
            { label: 'Kurs narxi' },
            { label: 'To\'lagan' },
            { label: 'Qarz balansi' },
            { label: 'Muddati' },
            { label: 'Kechikish kuni' },
            { label: 'SMS Eslatma', width: '120px' }
          ]}>
            {filteredDebtors.map(debtor => (
              <tr key={debtor.id}>
                <td style={{ fontWeight: '700' }}>{debtor.name}</td>
                <td>{debtor.phone}</td>
                <td>
                  <div className="d-flex flex-column">
                    <span style={{ fontWeight: '600', fontSize: '12.5px' }}>{debtor.parent?.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>{debtor.parent?.relationship}: {debtor.parent?.phone}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <span style={{ fontWeight: '700' }}>{debtor.courseName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>{debtor.groupName}</span>
                  </div>
                </td>
                <td style={{ fontWeight: '600' }}>{debtor.totalFee.toLocaleString()} so'm</td>
                <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{debtor.paid.toLocaleString()} so'm</td>
                <td style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>-{debtor.debt.toLocaleString()} so'm</td>
                <td>{debtor.dueDate}</td>
                <td>
                  <Badge variant={getOverdueSeverity(debtor.daysOverdue)}>
                    {debtor.daysOverdue} kun
                  </Badge>
                </td>
                <td>
                  <Button variant="danger" size="sm" icon={MessageSquare} onClick={() => handleSendReminder(debtor)}>
                    SMS Eslatma
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

    </div>
  );
}
