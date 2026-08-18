// src/pages/Courses.jsx
import React, { useState } from 'react';
import { BookOpen, Plus, Clock, Tag, User, Layers, CheckCircle } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Badge, Modal, Input, Select } from '../components/common/ui/index.jsx';

export default function Courses() {
  const { db, addCourse, updateCourse } = useCRM();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Ingliz tili',
    duration: '3 oy',
    price: '',
    desc: ''
  });

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      alert("Kurs nomi va narxi majburiy!");
      return;
    }

    if (selectedCourse) {
      updateCourse(selectedCourse.id, formData);
      setSelectedCourse(null);
    } else {
      addCourse(formData);
    }
    
    setIsAddOpen(false);
    setFormData({ name: '', category: 'Ingliz tili', duration: '3 oy', price: '', desc: '' });
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      category: course.category,
      duration: course.duration,
      price: course.price,
      desc: course.desc || ''
    });
    setIsAddOpen(true);
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">O'quv Kurslari</h1>
          <p className="page-subtitle">Markazda o'tiladigan fanlar, o'quv dasturlari va narxlari</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => { setSelectedCourse(null); setIsAddOpen(true); }}>Yangi Kurs Qo'shish</Button>
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-3">
        {db.courses.map(course => {
          // Count active students and groups for this course
          const activeStudentsCount = db.students.filter(s => s.courseId === course.id && s.status === 'Active').length;
          const activeGroupsCount = db.groups.filter(g => g.courseId === course.id && g.status === 'active').length;

          return (
            <Card 
              key={course.id}
              header={
                <div className="d-flex align-center justify-between" style={{ width: '100%' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800' }}>{course.name}</span>
                  <Badge variant="primary">{course.category}</Badge>
                </div>
              }
              footer={
                <div className="d-flex justify-between align-center" style={{ width: '100%' }}>
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(course)}>Tahrirlash</Button>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-light)', fontWeight: 'bold' }}>ID: {course.id}</span>
                </div>
              }
              className="card-interactive"
            >
              <div className="d-flex flex-column gap-3" style={{ fontSize: '13px' }}>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5', minHeight: '40px' }}>
                  {course.desc || "Kurs bo'yicha batafsil tavsif kiritilmagan."}
                </p>

                <div className="d-flex justify-between align-center" style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-secondary-light)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div className="d-flex align-center gap-1">
                    <Clock size={14} style={{ color: 'var(--color-text-light)' }} />
                    <span>Davomiyligi: <strong>{course.duration}</strong></span>
                  </div>
                  <div className="d-flex align-center gap-1">
                    <Tag size={14} style={{ color: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{course.price.toLocaleString()} so'm</span>
                  </div>
                </div>

                <div className="d-flex justify-between" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                  <span>Guruhlar: <strong style={{ color: 'var(--color-text)' }}>{activeGroupsCount} ta</strong></span>
                  <span>O'quvchilar: <strong style={{ color: 'var(--color-text)' }}>{activeStudentsCount} ta</strong></span>
                </div>

                {/* Course Levels details (curriculum simulation) */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: '6px' }}>O'quv bosqichlari (Levels)</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {course.category === 'Ingliz tili' ? (
                      ['Beginner', 'Elementary', 'Pre-Inter', 'Intermediate'].map(l => (
                        <Badge key={l} variant="secondary" style={{ fontSize: '9px', padding: '2px 6px' }}>{l}</Badge>
                      ))
                    ) : (
                      ['DTM tayyorgarlik', 'Milliy sertifikat', 'Olimpiada'].map(l => (
                        <Badge key={l} variant="secondary" style={{ fontSize: '9px', padding: '2px 6px' }}>{l}</Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={selectedCourse ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="Kurs nomi" 
            placeholder="Masalan: General English (Intermediate)" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2">
            <Select 
              label="Kurs yo'nalishi (Kategoriya)" 
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              options={[
                { value: 'Ingliz tili', label: 'Ingliz tili' },
                { value: 'Aniq fanlar', label: 'Aniq fanlar' },
                { value: 'IT', label: 'IT Dasturlash' },
                { value: 'Gumanitar', label: 'Gumanitar' }
              ]}
              required
            />
            <Input 
              label="Kurs davomiyligi (oyda)" 
              placeholder="Masalan: 3 oy, 6 oy, 9 oy" 
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              required
            />
          </div>

          <Input 
            label="Kurs oylik to'lov narxi (so'm)" 
            type="number"
            placeholder="Masalan: 600000" 
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            required
          />

          <Input 
            label="Kurs haqida batafsil ma'lumot (Tavsif)" 
            placeholder="Darsliklar, o'tiladigan mavzular va maqsadlar..." 
            value={formData.desc}
            onChange={(e) => handleInputChange('desc', e.target.value)}
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
