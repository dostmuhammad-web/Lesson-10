// src/pages/Grades.jsx
import React, { useState } from 'react';
import { Plus, Award, Calendar, User, BookOpen } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Table, Button, Badge, Modal, Input, Select } from '../components/common/ui/index.jsx';

export default function Grades() {
  const { db, addGrade } = useCRM();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    topic: '',
    score: '',
    grade: 'A',
    teacherName: 'Sardor Axmedov'
  });

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'studentId') {
        const std = db.students.find(s => s.id === val);
        if (std) {
          updated.courseId = std.courseId;
        }
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.topic || !formData.score) {
      alert("Barcha maydonlar to'ldirilishi shart!");
      return;
    }

    const student = db.students.find(s => s.id === formData.studentId);
    
    addGrade({
      studentId: formData.studentId,
      studentName: student ? student.name : 'Noma\'lum',
      courseId: formData.courseId,
      topic: formData.topic,
      score: Number(formData.score),
      grade: formData.grade,
      teacherName: formData.teacherName
    });

    setIsAddOpen(false);
    setFormData({
      studentId: '',
      courseId: '',
      topic: '',
      score: '',
      grade: 'A',
      teacherName: 'Sardor Axmedov'
    });
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Baholar Jurnali (Grades)</h1>
          <p className="page-subtitle">O'quvchilarning dars faolligi va uyga vazifalar baholari reyestri</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => {
            const firstStd = db.students[0];
            setFormData({
              studentId: firstStd?.id || '',
              courseId: firstStd?.courseId || '',
              topic: 'Grammar: Past Simple',
              score: 90,
              grade: 'A',
              teacherName: db.teachers[0]?.name || 'Sardor Axmedov'
            });
            setIsAddOpen(true);
          }}>Baho Kiritish</Button>
        </div>
      </div>

      {/* Grades Table */}
      <div className="table-container">
        <Table headers={[
          { label: 'Sana' },
          { label: 'O\'quvchi' },
          { label: 'Kurs (Fan)' },
          { label: 'Mavzu / Dars' },
          { label: 'Baho (A-F)' },
          { label: 'Ball (0-100)' },
          { label: 'Belgilagan Ustoz' }
        ]}>
          {db.grades.map(g => {
            const course = db.courses.find(c => c.id === g.courseId);
            return (
              <tr key={g.id}>
                <td>{g.date}</td>
                <td style={{ fontWeight: '700' }}>{g.studentName}</td>
                <td>{course ? course.name : 'Noma\'lum'}</td>
                <td style={{ fontWeight: '600' }}>{g.topic}</td>
                <td>
                  <Badge variant={g.grade === 'A' || g.grade === 'B' ? 'success' : 'warning'}>
                    {g.grade}
                  </Badge>
                </td>
                <td style={{ fontWeight: 'bold' }}>{g.score}</td>
                <td>{g.teacherName}</td>
              </tr>
            );
          })}
        </Table>
      </div>

      {/* ADD GRADE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="O'quvchiga baho kiritish"
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
            label="Dars mavzusi"
            placeholder="Masalan: Grammar basics or Frontend project-1"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            required
          />

          <div className="grid grid-cols-2">
            <Input 
              label="Ball (0 dan 100 gacha)"
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => handleInputChange('score', e.target.value)}
              required
            />
            <Select 
              label="Baho (A-F tizimida)"
              value={formData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
              options={[
                { value: 'A', label: "A (A'lo)" },
                { value: 'B', label: 'B (Yaxshi)' },
                { value: 'C', label: 'C (Qoniqarli)' },
                { value: 'D', label: 'D (Yomon)' },
                { value: 'F', label: 'F (Qoniqarsiz)' }
              ]}
              required
            />
          </div>

          <Select 
            label="Dars o'tuvchi o'qituvchi"
            value={formData.teacherName}
            onChange={(e) => handleInputChange('teacherName', e.target.value)}
            options={db.teachers.map(t => ({ value: t.name, label: t.name }))}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSubmit}>Bahoni Saqlash</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
