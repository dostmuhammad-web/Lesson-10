// src/pages/StudentDetails.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, Heart, Award, 
  CreditCard, ClipboardList, BookOpen, Clock, Printer, Save, MessageSquare
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { 
  Card, Button, Badge, Table, Tabs, EmptyState 
} from '../components/common/ui/index.jsx';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, updateStudent, addPayment } = useCRM();

  const [activeTab, setActiveTab] = useState('general');
  const [internalNote, setInternalNote] = useState('');
  
  if (!db) return null;

  const student = db.students.find(s => s.id === id);

  if (!student) {
    return (
      <EmptyState 
        title="O'quvchi topilmadi" 
        description="Qidirilayotgan o'quvchi ma'lumotlar bazasida mavjud emas."
        actionLabel="O'quvchilar ro'yxatiga qaytish"
        onAction={() => navigate('/students')}
      />
    );
  }

  // Pre-fetch related items
  const group = db.groups.find(g => g.id === student.groupId);
  const course = db.courses.find(c => c.id === student.courseId);
  const teacher = db.teachers.find(t => t.id === student.teacherId);
  
  const studentPayments = db.payments.filter(p => p.studentId === student.id);
  const studentAttendance = db.attendance.filter(a => a.studentId === student.id);
  
  // Academic records
  const studentGrades = db.grades.filter(g => g.studentId === student.id);
  const studentAssignments = db.assignments.filter(a => a.studentId === student.id);
  const studentExams = db.exams.filter(e => e.studentId === student.id);

  // Initialize note
  React.useEffect(() => {
    if (student) {
      setInternalNote(student.internalNotes || '');
    }
  }, [student]);

  // Handle note save
  const handleSaveNote = () => {
    updateStudent(student.id, { ...student, internalNotes: internalNote });
    alert("Ichki eslatma saqlandi!");
  };

  // Payment calculator
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.paid, 0);
  const totalDue = course ? course.price : 0;
  const remainingDebt = Math.max(0, totalDue - totalPaid);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Paused': return 'warning';
      case 'Completed': return 'primary';
      case 'Dropped': return 'danger';
      case 'Graduated': return 'success';
      case 'Trial': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Back navigation & Actions */}
      <div className="d-flex align-center justify-between no-print">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/students')}>
          O'quvchilarga qaytish
        </Button>
        <Button variant="secondary" icon={Printer} onClick={handlePrint}>
          Profilni chop etish
        </Button>
      </div>

      {/* Profile Summary Card */}
      <Card className="print-full-width">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
          padding: '10px 0'
        }}>
          <img 
            src={student.avatar} 
            alt={student.name} 
            style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--color-primary-light)' }} 
          />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div className="d-flex align-center gap-3" style={{ marginBottom: '6px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '850' }}>{student.name}</h1>
              <Badge variant={getStatusColor(student.status)}>{student.status === 'Active' ? 'Faol' : (student.status === 'Paused' ? 'Muzlatilgan' : student.status)}</Badge>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <span className="d-flex align-center gap-1"><User size={14} /> ID: {student.id}</span>
              <span className="d-flex align-center gap-1"><Phone size={14} /> {student.phone}</span>
              <span className="d-flex align-center gap-1"><MapPin size={14} /> {student.address}</span>
            </div>
          </div>

          {/* Quick Balance indicator */}
          <div style={{
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: student.balance < 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)',
            border: `1px solid ${student.balance < 0 ? 'var(--color-danger)' : 'var(--color-success)'}`,
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>BALANS HOLATI</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '800',
              color: student.balance < 0 ? 'var(--color-danger)' : 'var(--color-success)'
            }}>
              {student.balance.toLocaleString()} so'm
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs list */}
      <Tabs 
        tabs={[
          { id: 'general', label: 'Umumiy ma\'lumotlar' },
          { id: 'attendance', label: 'Davomat tarixi' },
          { id: 'payments', label: 'To\'lovlar' },
          { id: 'progress', label: 'Akademik natijalar' },
          { id: 'activity', label: 'Tizim tarixi' }
        ]} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        className="no-print"
      />

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="fade-in grid grid-cols-3">
          {/* Personal details */}
          <Card header="Shaxsiy ma'lumotlar" className="grid-cols-span-2">
            <div style={detailGridStyle}>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>To'liq ismi</span>
                <span style={detailValueStyle}>{student.name}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Jinsi</span>
                <span style={detailValueStyle}>{student.gender}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Tug'ilgan sanasi</span>
                <span style={detailValueStyle}>{student.dob}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Telefon</span>
                <span style={detailValueStyle}>{student.phone}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Manzil</span>
                <span style={detailValueStyle}>{student.address}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Qo'shilgan sana</span>
                <span style={detailValueStyle}>{student.joinedDate}</span>
              </div>
            </div>
          </Card>

          {/* Parent details */}
          <Card header="Ota-ona / Vasiy ma'lumotlari">
            <div className="d-flex flex-column gap-3" style={{ fontSize: '13px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={detailLabelStyle}>Vasiy F.I.SH.</span>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{student.parent?.name || '-'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={detailLabelStyle}>Telefon raqami</span>
                <span style={{ fontWeight: 'bold' }}>{student.parent?.phone || '-'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={detailLabelStyle}>Qarindoshligi</span>
                <Badge variant="primary" style={{ width: 'fit-content', marginTop: '4px' }}>{student.parent?.relationship || 'Ota-ona'}</Badge>
              </div>
            </div>
          </Card>

          {/* Education details */}
          <Card header="O'quv kursi va guruh" className="grid-cols-span-2">
            <div style={detailGridStyle}>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Kurs nomi</span>
                <span style={{ ...detailValueStyle, color: 'var(--color-primary)' }}>{course ? course.name : 'Kurs belgilanmagan'}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Guruh</span>
                <span style={detailValueStyle}>{group ? group.name : 'Guruh biriktirilmagan'}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>O'qituvchi</span>
                <span style={detailValueStyle}>{teacher ? teacher.name : 'O\'qituvchi belgilanmagan'}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Dars jadvali</span>
                <span style={detailValueStyle}>{group ? group.schedule : '-'}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Xona</span>
                <span style={detailValueStyle}>{group ? group.room : '-'}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>O'rtacha o'zlashtirish</span>
                <span style={{ ...detailValueStyle, color: 'var(--color-success)' }}>87%</span>
              </div>
            </div>
          </Card>

          {/* Internal Notes */}
          <Card header="Ichki eslatmalar (Faqat xodimlar ko'ra oladi)" className="no-print">
            <div className="d-flex flex-column gap-3">
              <textarea 
                className="form-textarea"
                rows="4"
                placeholder="O'quvchi haqida qo'shimcha izoh yoki ichki eslatmalar..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                style={{ fontSize: '13px' }}
              />
              <Button variant="primary" icon={Save} onClick={handleSaveNote}>
                Eslatmani saqlash
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="fade-in d-flex flex-column gap-4">
          <div className="grid grid-cols-3">
            <Card header="Darslarda qatnashuv foizi">
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  color: student.attendancePercentage > 85 ? 'var(--color-success)' : (student.attendancePercentage > 70 ? 'var(--color-warning)' : 'var(--color-danger)')
                }}>
                  {student.attendancePercentage}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Jami darslar soniga nisbatan
                </div>
              </div>
            </Card>
            
            <Card header="Darslar balansi" className="grid-cols-span-2">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', padding: '14px 0' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)' }}>
                    {studentAttendance.length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Jami darslar</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-success)' }}>
                    {studentAttendance.filter(a => a.status === 'Present').length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>Kelgan</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-danger)' }}>
                    {studentAttendance.filter(a => a.status === 'Absent').length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-danger)' }}>Kelmadi</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-warning)' }}>
                    {studentAttendance.filter(a => a.status === 'Late').length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-warning)' }}>Kechikdi</div>
                </div>
              </div>
            </Card>
          </div>

          <Card header="Davomat jurnalining batafsil yozuvi">
            {studentAttendance.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                Davomat yozuvlari topilmadi.
              </div>
            ) : (
              <Table headers={[
                { label: 'Sana' },
                { label: 'Guruh' },
                { label: 'Status' },
                { label: 'Belgilagan o\'qituvchi' }
              ]}>
                {studentAttendance.map(att => (
                  <tr key={att.id}>
                    <td style={{ fontWeight: '600' }}>{att.date}</td>
                    <td>{att.groupName}</td>
                    <td>
                      <Badge variant={
                        att.status === 'Present' ? 'success' : 
                        (att.status === 'Absent' ? 'danger' : 
                        (att.status === 'Late' ? 'warning' : 'info'))
                      }>
                        {att.status === 'Present' ? 'Kelgan' : 
                        (att.status === 'Absent' ? 'Kelmadi' : 
                        (att.status === 'Late' ? 'Kechikdi' : 'Sababli'))}
                      </Badge>
                    </td>
                    <td>{att.markedBy}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="fade-in d-flex flex-column gap-4">
          <div className="grid grid-cols-3">
            <Card header="To'lov balansi">
              <div className="d-flex flex-column gap-3" style={{ fontSize: '13px' }}>
                <div className="d-flex justify-between">
                  <span style={{ color: 'var(--color-text-light)' }}>Kurs narxi:</span>
                  <span style={{ fontWeight: 'bold' }}>{totalDue.toLocaleString()} so'm</span>
                </div>
                <div className="d-flex justify-between">
                  <span style={{ color: 'var(--color-text-light)' }}>To'langan:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>{totalPaid.toLocaleString()} so'm</span>
                </div>
                <div className="d-flex justify-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Qoldiq qarz:</span>
                  <span style={{ fontWeight: 'bold', color: remainingDebt > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {remainingDebt.toLocaleString()} so'm
                  </span>
                </div>
              </div>
            </Card>

            <Card header="Kvitansiya chop etish" className="grid-cols-span-2">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Quyidagi ro'yxatdan to'lovni tanlab, o'quv markazining rasmiy kvitansiyasini chop etish tugmasini bosing.
                Kvitansiyada kassa xodimi ismi, to'lov turi va muhr joylari ko'rsatiladi.
              </div>
            </Card>
          </div>

          <Card header="To'lovlar to'liq tarixi">
            {studentPayments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                To'lov yozuvlari topilmadi.
              </div>
            ) : (
              <Table headers={[
                { label: 'Kvitansiya ID' },
                { label: 'Kurs nomi' },
                { label: 'Sana' },
                { label: 'To\'lov turi' },
                { label: 'To\'langan' },
                { label: 'Holati' },
                { label: 'Kassir' },
                { label: 'Chop etish', width: '80px' }
              ]}>
                {studentPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '700' }}>{p.id}</td>
                    <td>{p.courseName}</td>
                    <td>{p.date || '-'}</td>
                    <td>{p.method}</td>
                    <td style={{ fontWeight: '700', color: 'var(--color-success)' }}>{p.paid.toLocaleString()} so'm</td>
                    <td>
                      <Badge variant={p.status === 'Paid' ? 'success' : (p.status === 'Partial' ? 'warning' : 'danger')}>
                        {p.status === 'Paid' ? 'To\'liq to\'langan' : (p.status === 'Partial' ? 'Qisman' : 'Muddati o\'tgan')}
                      </Badge>
                    </td>
                    <td>{p.cashier}</td>
                    <td>
                      <Button variant="secondary" size="sm" icon={Printer} onClick={() => navigate(`/payments?printInvoice=${p.id}`)} />
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* ACADEMIC PROGRESS TAB */}
      {activeTab === 'progress' && (
        <div className="fade-in d-flex flex-column gap-4">
          <div className="grid grid-cols-3">
            {/* Grades */}
            <Card header="Dars faolligi va baholari (Uyga vazifalar)" className="grid-cols-span-2">
              {studentGrades.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                  Baholar kiritilmagan.
                </div>
              ) : (
                <Table headers={[{ label: 'Sana' }, { label: 'Mavzu' }, { label: 'Baho (A-F)' }, { label: 'Ball' }, { label: 'O\'qituvchi' }]}>
                  {studentGrades.map(g => (
                    <tr key={g.id}>
                      <td>{g.date}</td>
                      <td>{g.topic}</td>
                      <td>
                        <Badge variant={g.grade === 'A' || g.grade === 'B' ? 'success' : 'warning'}>{g.grade}</Badge>
                      </td>
                      <td style={{ fontWeight: '700' }}>{g.score}</td>
                      <td>{g.teacherName}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>

            {/* Assignments */}
            <Card header="Uyga vazifalar holati">
              {studentAssignments.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                  Vazifalar ro'yxati bo'sh.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {studentAssignments.map(asm => (
                    <div key={asm.id} style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      fontSize: '12px'
                    }}>
                      <div className="d-flex justify-between align-center" style={{ marginBottom: '6px' }}>
                        <span style={{ fontWeight: '700' }}>{asm.title}</span>
                        <Badge variant={
                          asm.status === 'Checked' ? 'success' : 
                          (asm.status === 'Submitted' ? 'info' : 
                          (asm.status === 'Late' ? 'warning' : 'danger'))
                        }>
                          {asm.status === 'Checked' ? 'Tekshirildi' : 
                          (asm.status === 'Submitted' ? 'Topshirdi' : 
                          (asm.status === 'Late' ? 'Kechikdi' : 'Kutilmoqda'))}
                        </Badge>
                      </div>
                      <div style={{ color: 'var(--color-text-light)' }}>Muddat: {asm.deadline}</div>
                      {asm.feedback && (
                        <div style={{
                          marginTop: '6px',
                          fontStyle: 'italic',
                          color: 'var(--color-text-muted)',
                          borderLeft: '2px solid var(--color-primary)',
                          paddingLeft: '6px'
                        }}>
                          {asm.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Exams */}
          <Card header="Imtihonlar (Midterm / Final) natijalari">
            {studentExams.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                Imtihon natijalari kiritilmagan.
              </div>
            ) : (
              <Table headers={[{ label: 'Imtihon nomi' }, { label: 'Sana' }, { label: 'Ball (100 dan)' }, { label: 'Natija' }]}>
                {studentExams.map(ex => (
                  <tr key={ex.id}>
                    <td style={{ fontWeight: '700' }}>{ex.examName}</td>
                    <td>{ex.date}</td>
                    <td style={{ fontWeight: '800', color: ex.score >= 60 ? 'var(--color-success)' : 'var(--color-danger)' }}>{ex.score}</td>
                    <td>
                      <Badge variant={ex.passStatus === 'Pass' ? 'success' : 'danger'}>
                        {ex.passStatus === 'Pass' ? "O'tdi" : "Yiqildi"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* ACTIVITY TIMELINE TAB */}
      {activeTab === 'activity' && (
        <Card header="Tizim loglari va harakatlar tarixi">
          <div className="d-flex flex-column gap-3" style={{ padding: '10px 0' }}>
            {[
              { time: student.joinedDate + " 09:00", text: "O'quvchi markazga ro'yxatdan o'tdi." },
              studentPayments.length > 0 && { time: studentPayments[0]?.date + " 10:45", text: `Dastlabki to'lov qabul qilindi: ${studentPayments[0]?.paid.toLocaleString()} so'm.` },
              studentAttendance.length > 0 && { time: studentAttendance[0]?.date + " 14:00", text: "Birinchi darsga dars jurnalida qayd etildi." },
              studentGrades.length > 0 && { time: studentGrades[0]?.date + " 15:30", text: "O'qituvchi tomonidan birinchi uyga vazifa bahosi kiritildi." }
            ].filter(Boolean).map((log, idx) => (
              <div key={idx} className="d-flex gap-3 align-start" style={{
                position: 'relative',
                paddingBottom: '14px',
                borderLeft: '2px solid var(--color-border)',
                paddingLeft: '16px',
                marginLeft: '8px'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '-5px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)'
                }} />
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 'bold' }}>{log.time}</span>
                  <p style={{ fontSize: '13px', color: 'var(--color-text)', marginTop: '2px' }}>{log.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}

// Inline Styles
const detailGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px'
};

const detailItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const detailLabelStyle = {
  fontSize: '11.5px',
  color: 'var(--color-text-light)',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const detailValueStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--color-text)'
};
