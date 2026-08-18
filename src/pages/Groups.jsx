// src/pages/Groups.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Users, Calendar, Grid, Award, CreditCard, 
  MapPin, Clock, ArrowRight, BookOpen, Trash2, Edit2
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Badge, Modal, Input, Select, Table, EmptyState } from '../components/common/ui/index.jsx';

export default function Groups({ quickAddType, resetQuickAdd }) {
  const navigate = useNavigate();
  const { db, addGroup, updateGroup, deleteGroup } = useCRM();

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(quickAddType === 'group');

  const [formData, setFormData] = useState({
    name: '',
    courseId: db?.courses[0]?.id || '',
    teacherId: db?.teachers[0]?.id || '',
    room: 'Chilonzor xonasi',
    schedule: 'Toq kunlar, 14:00 - 16:00',
    capacity: 20
  });

  // Handle Quick Add group trigger
  React.useEffect(() => {
    if (quickAddType === 'group') {
      setIsAddOpen(true);
      resetQuickAdd();
    }
  }, [quickAddType, resetQuickAdd]);

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.courseId || !formData.teacherId) {
      alert("Barcha maydonlar to'ldirilishi shart!");
      return;
    }

    addGroup(formData);
    setIsAddOpen(false);
    setFormData({
      name: '',
      courseId: db.courses[0]?.id || '',
      teacherId: db.teachers[0]?.id || '',
      room: 'Chilonzor xonasi',
      schedule: 'Toq kunlar, 14:00 - 16:00',
      capacity: 20
    });
  };

  const getCapacityBadge = (studentsCount, capacity) => {
    if (studentsCount >= capacity) {
      return <Badge variant="danger">FULL</Badge>;
    }
    const emptyCount = capacity - studentsCount;
    return (
      <Badge variant="success">
        Sig'im: {studentsCount}/{capacity} ({emptyCount} bo'sh joy)
      </Badge>
    );
  };

  const activeGroup = db.groups.find(g => g.id === selectedGroupId);
  const groupStudents = activeGroup ? db.students.filter(s => s.groupId === activeGroup.id && s.status === 'Active') : [];

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Guruhlar Boshqaruvi</h1>
          <p className="page-subtitle">O'quv guruhlari jadvali, sig'imi va o'quvchilar ro'yxati</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>Yangi Guruh Yaratish</Button>
        </div>
      </div>

      {/* Main layout split: list of groups on left, group details on right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedGroupId ? '1.2fr 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start',
        transition: 'all var(--transition-normal)'
      }}>
        
        {/* Left Side: Groups List */}
        <div className="d-flex flex-column gap-4">
          <div className="grid grid-cols-2" style={{ gridTemplateColumns: selectedGroupId ? '1fr' : 'repeat(3, 1fr)' }}>
            {db.groups.map(group => {
              const course = db.courses.find(c => c.id === group.courseId);
              const teacher = db.teachers.find(t => t.id === group.teacherId);
              const studentsCount = db.students.filter(s => s.groupId === group.id && s.status === 'Active').length;
              const isSelected = selectedGroupId === group.id;

              return (
                <Card 
                  key={group.id}
                  header={
                    <div className="d-flex align-center justify-between" style={{ width: '100%' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: isSelected ? 'var(--color-primary)' : 'inherit' }}>
                        {group.name}
                      </span>
                      {getCapacityBadge(studentsCount, group.capacity)}
                    </div>
                  }
                  className="card-interactive"
                  style={{
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                  }}
                  onClick={() => setSelectedGroupId(isSelected ? null : group.id)}
                >
                  <div className="d-flex flex-column gap-2" style={{ fontSize: '13px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Kurs:</span>
                      <strong style={{ color: 'var(--color-text)' }}>{course ? course.name : 'Noma\'lum'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>O'qituvchi:</span>
                      <strong>{teacher ? teacher.name : 'Noma\'lum'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Dars vaqti:</span>
                      <strong style={{ fontSize: '12px' }}>{group.schedule}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Dars xonasi:</span>
                      <strong>{group.room}</strong>
                    </div>

                    <div className="d-flex align-center gap-1" style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: 'var(--color-primary)',
                      fontWeight: 'bold',
                      justifyContent: 'flex-end'
                    }}>
                      <span>Batafsil ko'rish</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Group Detailed Profile */}
        {selectedGroupId && activeGroup && (
          <div className="fade-in d-flex flex-column gap-4" style={{
            position: 'sticky',
            top: '20px'
          }}>
            <Card 
              header={
                <div className="d-flex justify-between align-center" style={{ width: '100%' }}>
                  <div>
                    <h2 style={{ fontSize: '18px' }}>{activeGroup.name} profili</h2>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                      Fan: {db.courses.find(c => c.id === activeGroup.courseId)?.name}
                    </span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedGroupId(null)}>Yopish</Button>
                </div>
              }
            >
              <div className="d-flex flex-column gap-4">
                
                {/* Details list */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  fontSize: '12.5px',
                  backgroundColor: 'var(--color-secondary-light)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div>
                    <span style={{ color: 'var(--color-text-light)' }}>O'qituvchi:</span>
                    <div style={{ fontWeight: 'bold' }}>{db.teachers.find(t => t.id === activeGroup.teacherId)?.name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-light)' }}>Dars jadvali:</span>
                    <div style={{ fontWeight: 'bold' }}>{activeGroup.schedule}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-light)' }}>Xona:</span>
                    <div style={{ fontWeight: 'bold' }}>{activeGroup.room}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-light)' }}>Guruh o'rtacha davomati:</span>
                    <div style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>84%</div>
                  </div>
                </div>

                {/* Group Students list */}
                <div>
                  <h3 style={{ fontSize: '14px', marginBottom: '8px', fontWeight: '700' }}>
                    O'quvchilar ro'yxati ({groupStudents.length} ta o'quvchi)
                  </h3>
                  {groupStudents.length === 0 ? (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: 'var(--color-text-light)',
                      border: '1px dashed var(--color-border)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      Ushbu guruhda hali faol o'quvchilar mavjud emas.
                    </div>
                  ) : (
                    <div style={{
                      maxHeight: '260px',
                      overflowY: 'auto',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <table className="table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>O'quvchi</th>
                            <th>Telefon</th>
                            <th>Balans</th>
                            <th>Profil</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupStudents.map(student => (
                            <tr key={student.id}>
                              <td style={{ fontWeight: 'bold' }}>{student.name}</td>
                              <td>{student.phone}</td>
                              <td style={{ color: student.balance < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                {student.balance.toLocaleString()} so'm
                              </td>
                              <td>
                                <button 
                                  onClick={() => navigate(`/students/${student.id}`)}
                                  className="btn-icon"
                                  style={{ padding: '2px', border: 'none' }}
                                >
                                  <ArrowRight size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Group delete action */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '16px'
                }}>
                  <Button variant="secondary" size="sm" onClick={() => {
                    if (confirm("Ushbu guruh dars jadvalini o'zgartirish sahifasiga o'tasizmi?")) {
                      navigate('/schedule');
                    }
                  }}>
                    Jadvalda ko'rish
                  </Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => {
                    if (confirm("Haqiqatan ham ushbu guruhni butunlay o'chirmoqchimisiz? O'quvchilar guruhsiz qoladi.")) {
                      deleteGroup(activeGroup.id);
                      setSelectedGroupId(null);
                    }
                  }}>
                    Guruhni o'chirish
                  </Button>
                </div>

              </div>
            </Card>
          </div>
        )}

      </div>

      {/* ADD GROUP MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Yangi dars guruhi yaratish"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="Guruh nomi" 
            placeholder="Masalan: IELTS Morning 08:30" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2">
            <Select 
              label="Kurs" 
              value={formData.courseId}
              onChange={(e) => handleInputChange('courseId', e.target.value)}
              options={db.courses.map(c => ({ value: c.id, label: c.name }))}
              required
            />
            <Select 
              label="O'qituvchi" 
              value={formData.teacherId}
              onChange={(e) => handleInputChange('teacherId', e.target.value)}
              options={db.teachers.map(t => ({ value: t.id, label: t.name }))}
              required
            />
          </div>

          <div className="grid grid-cols-2">
            <Select 
              label="Dars xonasi" 
              value={formData.room}
              onChange={(e) => handleInputChange('room', e.target.value)}
              options={[
                { value: 'Chilonzor xonasi', label: 'Chilonzor xonasi' },
                { value: 'Amir Temur xonasi', label: 'Amir Temur xonasi' },
                { value: 'Navoiy xonasi', label: 'Navoiy xonasi' },
                { value: 'IT Lab-1', label: 'IT Lab-1 (Kompyuter)' },
                { value: 'IT Lab-2', label: 'IT Lab-2 (Kompyuter)' }
              ]}
              required
            />
            <Select 
              label="Dars jadvali va vaqti" 
              value={formData.schedule}
              onChange={(e) => handleInputChange('schedule', e.target.value)}
              options={[
                { value: 'Toq kunlar, 14:00 - 16:00', label: 'Toq kunlar (Dush/Chor/Jum) 14:00' },
                { value: 'Toq kunlar, 16:30 - 18:30', label: 'Toq kunlar (Dush/Chor/Jum) 16:30' },
                { value: 'Toq kunlar, 19:00 - 21:00', label: 'Toq kunlar (Dush/Chor/Jum) 19:00' },
                { value: 'Juft kunlar, 14:00 - 16:00', label: 'Juft kunlar (Sesh/Pay/Shan) 14:00' },
                { value: 'Juft kunlar, 16:30 - 18:30', label: 'Juft kunlar (Sesh/Pay/Shan) 16:30' },
                { value: 'Juft kunlar, 18:30 - 20:30', label: 'Juft kunlar (Sesh/Pay/Shan) 18:30' }
              ]}
              required
            />
          </div>

          <Input 
            label="Guruh maksimal sig'imi" 
            type="number"
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
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
