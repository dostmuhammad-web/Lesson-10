// src/pages/Assignments.jsx
import React, { useState } from 'react';
import { Plus, BookOpen, Clock, FileText, Check } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Table, Button, Badge, Modal, Input, Select } from '../components/common/ui/index.jsx';

export default function Assignments() {
  const { db, addAssignment } = useCRM();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    deadline: '',
    teacherName: 'Sardor Axmedov'
  });

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.title || !formData.deadline) {
      alert("Barcha maydonlar to'ldirilishi shart!");
      return;
    }

    const student = db.students.find(s => s.id === formData.studentId);
    
    addAssignment({
      studentId: formData.studentId,
      studentName: student ? student.name : 'Noma\'lum',
      title: formData.title,
      deadline: formData.deadline,
      teacherName: formData.teacherName
    });

    setIsAddOpen(false);
    setFormData({
      studentId: '',
      title: '',
      deadline: '',
      teacherName: 'Sardor Axmedov'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked': return <Badge variant="success">Tekshirildi</Badge>;
      case 'Submitted': return <Badge variant="info">Topshirildi</Badge>;
      case 'Late': return <Badge variant="warning">Kechikkan</Badge>;
      case 'Not submitted': return <Badge variant="danger">Topshirilmagan</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Uyga Vazifalar (Homework System)</h1>
          <p className="page-subtitle">O'quvchilarga berilgan vazifalar, topshirish muddatlari va o'qituvchi fikrlari</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => {
            const firstStd = db.students[0];
            setFormData({
              studentId: firstStd?.id || '',
              title: 'Tenses Practice Exercises',
              deadline: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
              teacherName: db.teachers[0]?.name || 'Sardor Axmedov'
            });
            setIsAddOpen(true);
          }}>Vazifa Qo'shish</Button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="table-container">
        <Table headers={[
          { label: 'O\'quvchi F.I.SH.' },
          { label: 'Vazifa mavzusi' },
          { label: 'Topshirish muddati' },
          { label: 'Ustoz' },
          { label: 'Holati' },
          { label: 'Izoh / Feedback' }
        ]}>
          {db.assignments.map(asm => (
            <tr key={asm.id}>
              <td style={{ fontWeight: '700' }}>{asm.studentName}</td>
              <td style={{ fontWeight: '600' }}>{asm.title}</td>
              <td>{asm.deadline}</td>
              <td>{asm.teacherName}</td>
              <td>{getStatusBadge(asm.status)}</td>
              <td style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                {asm.feedback || 'Izoh qoldirilmagan.'}
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* ADD ASSIGNMENT MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Yangi uyga vazifa biriktirish"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Select 
            label="O'quvchini tanlang"
            value={formData.studentId}
            onChange={(e) => handleInputChange('studentId', e.target.value)}
            options={[
              { value: '', label: 'O\'quvchini tanlang...' },
              ...db.students.filter(s => s.status === 'Active').map(s => ({ value: s.id, label: s.name }))
            ]}
            required
          />

          <Input 
            label="Vazifa nomi / Mavzusi"
            placeholder="Masalan: Essay writing task 1: Line graph description"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />

          <Input 
            label="Topshirish oxirgi muddati (Deadline)"
            type="date"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            required
          />

          <Select 
            label="Mas'ul o'qituvchi"
            value={formData.teacherName}
            onChange={(e) => handleInputChange('teacherName', e.target.value)}
            options={db.teachers.map(t => ({ value: t.name, label: t.name }))}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSubmit}>Vazifani Biriktirish</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
