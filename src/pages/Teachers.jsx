// src/pages/Teachers.jsx
import React, { useState } from 'react';
import { 
  Plus, GraduationCap, Phone, Mail, Award, Users, 
  TrendingUp, Star, DollarSign, Edit3, Trash2
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Badge, Modal, Input, Select, Table } from '../components/common/ui/index.jsx';

export default function Teachers({ quickAddType, resetQuickAdd }) {
  const { db, addTeacher, updateTeacher, deleteTeacher } = useCRM();

  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(quickAddType === 'teacher');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: 'IELTS / CEFR',
    experience: '3 yil',
    salary: ''
  });

  // Handle Quick Add trigger
  React.useEffect(() => {
    if (quickAddType === 'teacher') {
      setIsAddOpen(true);
      resetQuickAdd();
    }
  }, [quickAddType, resetQuickAdd]);

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.salary) {
      alert("Ism, telefon va oylik majburiy!");
      return;
    }

    addTeacher(formData);
    setIsAddOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      specialization: 'IELTS / CEFR',
      experience: '3 yil',
      salary: ''
    });
  };

  const activeTeacher = db.teachers.find(t => t.id === selectedTeacherId);
  const teacherGroups = activeTeacher ? db.groups.filter(g => g.teacherId === activeTeacher.id) : [];

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">O'qituvchilar (Ustozlar)</h1>
          <p className="page-subtitle">O'qituvchilar tarkibi, yo'nalishlari va o'qituvchi samaradorligi (performance)</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>Yangi O'qituvchi Ustoz</Button>
        </div>
      </div>

      {/* Grid structure: Teachers list & details on selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedTeacherId ? '1.2fr 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left: Teachers Cards */}
        <div className="grid grid-cols-2" style={{ gridTemplateColumns: selectedTeacherId ? '1fr' : 'repeat(3, 1fr)' }}>
          {db.teachers.map(t => {
            const groupsCount = db.groups.filter(g => g.teacherId === t.id).length;
            const studentsCount = db.students.filter(s => s.teacherId === t.id && s.status === 'Active').length;
            const isSelected = selectedTeacherId === t.id;

            return (
              <Card
                key={t.id}
                header={
                  <div className="d-flex align-center justify-between" style={{ width: '100%' }}>
                    <div className="d-flex align-center gap-2">
                      <GraduationCap size={18} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontWeight: '800', color: isSelected ? 'var(--color-primary)' : 'inherit' }}>
                        {t.name}
                      </span>
                    </div>
                    <Badge variant="primary">{t.specialization}</Badge>
                  </div>
                }
                className="card-interactive"
                style={{
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
                }}
                onClick={() => setSelectedTeacherId(isSelected ? null : t.id)}
              >
                <div className="d-flex flex-column gap-2" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Telefon:</span>
                    <strong>{t.phone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Tajribasi:</span>
                    <strong>{t.experience}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Faol guruhlari:</span>
                    <strong>{groupsCount} ta guruh</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>O'quvchilar soni:</span>
                    <strong>{studentsCount} ta faol</strong>
                  </div>
                  <div className="d-flex align-center gap-1" style={{ justifyContent: 'flex-end', marginTop: '6px', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    <span>Samaradorlik ko'rsatkichlari</span>
                    <TrendingUp size={12} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right: Selected Teacher Performance Panel */}
        {selectedTeacherId && activeTeacher && (
          <div className="fade-in d-flex flex-column gap-4">
            <Card
              header={
                <div className="d-flex justify-between align-center" style={{ width: '100%' }}>
                  <h2 style={{ fontSize: '16px' }}>{activeTeacher.name} - Performance</h2>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedTeacherId(null)}>Yopish</Button>
                </div>
              }
            >
              <div className="d-flex flex-column gap-4" style={{ fontSize: '13px' }}>
                
                {/* 1. KPIs */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  <div style={perfMetricBoxStyle}>
                    <span style={{ color: 'var(--color-text-light)' }}>O'rtacha reyting</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} fill="currentColor" /> {activeTeacher.rating || '5.0'}
                    </div>
                  </div>
                  <div style={perfMetricBoxStyle}>
                    <span style={{ color: 'var(--color-text-light)' }}>O'quvchilar davomati</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-success)' }}>
                      {Math.floor(Math.random() * 10) + 85}%
                    </div>
                  </div>
                  <div style={perfMetricBoxStyle}>
                    <span style={{ color: 'var(--color-text-light)' }}>O'quvchi saqlanishi (Retention)</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }}>
                      94.5%
                    </div>
                  </div>
                  <div style={perfMetricBoxStyle}>
                    <span style={{ color: 'var(--color-text-light)' }}>Keltirgan daromad (taxm.)</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-success)' }}>
                      {((db.students.filter(s => s.teacherId === activeTeacher.id).length) * 600000).toLocaleString()} so'm
                    </div>
                  </div>
                </div>

                {/* 2. Salary & Bonus info */}
                <div style={{
                  border: '1px solid var(--color-border)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-secondary-light)'
                }}>
                  <h3 style={{ fontSize: '13px', marginBottom: '8px', fontWeight: '700' }}>Oylik va Rag'batlantirish (Bonuslar)</h3>
                  <div className="d-flex justify-between" style={{ marginBottom: '4px' }}>
                    <span>Asosiy oylik:</span>
                    <strong>{activeTeacher.salary.toLocaleString()} so'm</strong>
                  </div>
                  <div className="d-flex justify-between">
                    <span>Oylik bonuslar:</span>
                    <strong style={{ color: 'var(--color-success)' }}>{activeTeacher.bonus.toLocaleString()} so'm</strong>
                  </div>
                </div>

                {/* 3. Teacher's Groups List */}
                <div>
                  <h3 style={{ fontSize: '13px', marginBottom: '6px', fontWeight: '700' }}>Biriktirilgan guruhlar</h3>
                  {teacherGroups.length === 0 ? (
                    <div style={{ color: 'var(--color-text-light)', padding: '10px', textAlign: 'center' }}>Guruhlar topilmadi.</div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {teacherGroups.map(g => (
                        <div key={g.id} style={{
                          padding: '8px 12px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <strong style={{ fontSize: '12.5px' }}>{g.name}</strong>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>Xona: {g.room} | Jadval: {g.schedule}</div>
                          </div>
                          <Badge variant="primary">Sig'im: 20</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Delete Action */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '16px'
                }}>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => {
                    if (confirm("Haqiqatan ham ushbu o'qituvchini o'chirmoqchimisiz?")) {
                      deleteTeacher(activeTeacher.id);
                      setSelectedTeacherId(null);
                    }
                  }}>
                    Ustozni O'chirish
                  </Button>
                </div>

              </div>
            </Card>
          </div>
        )}

      </div>

      {/* ADD TEACHER MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Yangi o'qituvchi ustoz qo'shish"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="O'qituvchi F.I.SH." 
            placeholder="Masalan: Sardor Axmedov" 
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
              placeholder="sardor@crm.uz" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2">
            <Select 
              label="Mutaxassisligi (Sohasi)" 
              value={formData.specialization}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              options={[
                { value: 'IELTS / CEFR', label: 'IELTS / CEFR' },
                { value: 'General English', label: 'General English' },
                { value: 'Kids English', label: 'Kids English' },
                { value: 'Matematika', label: 'Matematika' },
                { value: 'Fizika', label: 'Fizika' },
                { value: 'Frontend Web Dasturlash', label: 'Frontend Web Dasturlash' },
                { value: 'Backend Web Dasturlash', label: 'Backend Web Node.js' },
                { value: 'Grafik Dizayn', label: 'Grafik Dizayn Figma' },
                { value: 'Ona tili', label: 'Ona tili va Adabiyot' }
              ]}
              required
            />
            <Input 
              label="Dars berish tajribasi" 
              placeholder="Masalan: 4 yil, 6 yil" 
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
            />
          </div>

          <Input 
            label="Belgilangan oylik maoshi (so'm)" 
            type="number"
            placeholder="Masalan: 5000000" 
            value={formData.salary}
            onChange={(e) => handleInputChange('salary', e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSubmit}>Saqlash</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

// Inline Style helper
const perfMetricBoxStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};
