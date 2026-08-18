// src/pages/Exams.jsx
import React, { useState } from 'react';
import { Plus, ClipboardCheck, Award } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Table, Button, Badge, Modal, Input, Select } from '../components/common/ui/index.jsx';

export default function Exams() {
  const { db, addExam } = useCRM();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    examName: 'Midterm Sinov Imtihoni',
    score: '',
    passStatus: 'Pass'
  });

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.score) {
      alert("O'quvchi va imtihon balli kiritilishi shart!");
      return;
    }

    const student = db.students.find(s => s.id === formData.studentId);
    
    addExam({
      studentId: formData.studentId,
      studentName: student ? student.name : 'Noma\'lum',
      examName: formData.examName,
      score: Number(formData.score),
      passStatus: formData.passStatus
    });

    setIsAddOpen(false);
    setFormData({
      studentId: '',
      examName: 'Midterm Sinov Imtihoni',
      score: '',
      passStatus: 'Pass'
    });
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Imtihon Natijalari (Exams)</h1>
          <p className="page-subtitle">Oylik monitoring va yakuniy sinov imtihonlari natijalari tahlili</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => {
            const firstStd = db.students[0];
            setFormData({
              studentId: firstStd?.id || '',
              examName: 'Midterm Oylik Test Imtihoni',
              score: 85,
              passStatus: 'Pass'
            });
            setIsAddOpen(true);
          }}>Natija Kiritish</Button>
        </div>
      </div>

      {/* Exams Table */}
      <div className="table-container">
        <Table headers={[
          { label: 'Sana' },
          { label: 'O\'quvchi' },
          { label: 'Imtihon nomi' },
          { label: 'Ball (100 dan)' },
          { label: 'Natija' }
        ]}>
          {db.exams.map(e => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td style={{ fontWeight: '700' }}>{e.studentName}</td>
              <td style={{ fontWeight: '600' }}>{e.examName}</td>
              <td style={{ fontWeight: '800', color: e.score >= 60 ? 'var(--color-success)' : 'var(--color-danger)' }}>{e.score}</td>
              <td>
                <Badge variant={e.passStatus === 'Pass' ? 'success' : 'danger'}>
                  {e.passStatus === 'Pass' ? 'O\'tdi (Pass)' : 'Yiqildi (Fail)'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* ADD EXAM MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Imtihon natijasini kiritish"
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
            label="Imtihon turi / Nomi"
            placeholder="Masalan: IELTS Mock Test 08/2026"
            value={formData.examName}
            onChange={(e) => handleInputChange('examName', e.target.value)}
            required
          />

          <div className="grid grid-cols-2">
            <Input 
              label="To'plangan ball (0-100)"
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => handleInputChange('score', e.target.value)}
              required
            />
            <Select 
              label="Natija holati"
              value={formData.passStatus}
              onChange={(e) => handleInputChange('passStatus', e.target.value)}
              options={[
                { value: 'Pass', label: 'O\'tdi (Pass)' },
                { value: 'Fail', label: 'Kutilgan natija bo\'lmadi (Fail)' }
              ]}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSubmit}>Natijani Saqlash</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
