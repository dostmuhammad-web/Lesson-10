// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { CheckSquare, Save, Users, Calendar as CalendarIcon, Check, X, Clock, HelpCircle } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Select, Table, DatePicker, Badge } from '../components/common/ui/index.jsx';

export default function Attendance() {
  const { db, saveAttendance } = useCRM();

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceList, setAttendanceList] = useState([]); // [{ studentId, name, status }]

  // Set today's date on mount
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setSelectedDate(`${yyyy}-${mm}-${dd}`); // HTML date input format
  }, []);

  // Pre-load default group
  useEffect(() => {
    if (db && db.groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(db.groups[0].id);
    }
  }, [db, selectedGroupId]);

  // Load group students & existing attendance records when group/date changes
  useEffect(() => {
    if (!db || !selectedGroupId || !selectedDate) return;

    // Convert date format from YYYY-MM-DD to DD.MM.YYYY
    const [y, m, d] = selectedDate.split('-');
    const formattedDate = `${d}.${m}.${y}`;

    // Find students in selected group
    const groupStudents = db.students.filter(s => s.groupId === selectedGroupId && s.status === 'Active');

    // Check if attendance already exists in DB for this group & date
    const existingRecords = db.attendance.filter(a => a.groupId === selectedGroupId && a.date === formattedDate);

    const list = groupStudents.map(std => {
      const existing = existingRecords.find(r => r.studentId === std.id);
      return {
        studentId: std.id,
        studentName: std.name,
        // Default to 'Present' if no records exist, else use existing status
        status: existing ? existing.status : 'Present'
      };
    });

    setAttendanceList(list);
  }, [selectedGroupId, selectedDate, db]);

  if (!db) return null;

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceList(prev => 
      prev.map(item => item.studentId === studentId ? { ...item, status: newStatus } : item)
    );
  };

  const markAllStatus = (status) => {
    setAttendanceList(prev => prev.map(item => ({ ...item, status })));
  };

  const handleSave = () => {
    if (!selectedGroupId || !selectedDate) {
      alert("Guruh va sana tanlanishi shart!");
      return;
    }

    const [y, m, d] = selectedDate.split('-');
    const formattedDate = `${d}.${m}.${y}`;

    saveAttendance(selectedGroupId, formattedDate, attendanceList);
  };

  // Stats calculation
  const total = attendanceList.length;
  const presentCount = attendanceList.filter(a => a.status === 'Present').length;
  const absentCount = attendanceList.filter(a => a.status === 'Absent').length;
  const lateCount = attendanceList.filter(a => a.status === 'Late').length;
  const excusedCount = attendanceList.filter(a => a.status === 'Excused').length;

  const presentPercentage = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Davomatni Qayd Etish</h1>
          <p className="page-subtitle">Dars davomati jurnalini to'ldirish, kelmaganlar sababini aniqlash va hisobotlar</p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="filters-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px' }}>
        <Select 
          label="Guruhni tanlang"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          options={db.groups.filter(g => g.status === 'active').map(g => ({ value: g.id, label: g.name }))}
          style={{ marginBottom: 0 }}
        />
        
        <DatePicker 
          label="Dars sanasi"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ marginBottom: 0 }}
        />

        <div className="d-flex align-end gap-2" style={{ height: '100%' }}>
          <Button variant="secondary" onClick={() => markAllStatus('Present')}>Hamma Keldi</Button>
          <Button variant="secondary" onClick={() => markAllStatus('Absent')}>Hamma Kelmadi</Button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-4" style={{ gap: '16px' }}>
        <Card header="Jami o'quvchilar" style={{ padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', textAlign: 'center' }}>{total} ta</div>
        </Card>
        <Card header="Kelgan + Kechikkan" style={{ padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-success)', textAlign: 'center' }}>
            {presentCount + lateCount} ta ({presentPercentage}%)
          </div>
        </Card>
        <Card header="Kelmadi" style={{ padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-danger)', textAlign: 'center' }}>{absentCount} ta</div>
        </Card>
        <Card header="Kechikdi" style={{ padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-warning)', textAlign: 'center' }}>{lateCount} ta</div>
        </Card>
      </div>

      {/* Students List Table */}
      {attendanceList.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)'
        }}>
          Ushbu guruhda o'quvchilar mavjud emas yoki guruh tanlanmagan.
        </div>
      ) : (
        <Card 
          header={
            <div className="d-flex justify-between align-center" style={{ width: '100%' }}>
              <span>Dars jurnali ({db.groups.find(g => g.id === selectedGroupId)?.name})</span>
              <Button variant="success" icon={Save} onClick={handleSave}>Davomatni Saqlash</Button>
            </div>
          }
        >
          <Table headers={[
            { label: 'O\'quvchi F.I.SH.' },
            { label: 'Keldi (Present)', width: '130px' },
            { label: 'Kelmadi (Absent)', width: '130px' },
            { label: 'Kechikdi (Late)', width: '130px' },
            { label: 'Sababli (Excused)', width: '130px' }
          ]}>
            {attendanceList.map((item, idx) => (
              <tr key={item.studentId}>
                <td style={{ fontWeight: '700' }}>
                  {idx + 1}. {item.studentName}
                </td>
                
                {/* Present check */}
                <td>
                  <label style={checkboxLabelStyle}>
                    <input 
                      type="radio" 
                      name={`att_status_${item.studentId}`} 
                      checked={item.status === 'Present'}
                      onChange={() => handleStatusChange(item.studentId, 'Present')}
                      style={radioStyle}
                    />
                    <Badge variant="success" style={{ cursor: 'pointer' }}>
                      <Check size={12} style={{ marginRight: '4px' }} /> Kelgan
                    </Badge>
                  </label>
                </td>

                {/* Absent check */}
                <td>
                  <label style={checkboxLabelStyle}>
                    <input 
                      type="radio" 
                      name={`att_status_${item.studentId}`} 
                      checked={item.status === 'Absent'}
                      onChange={() => handleStatusChange(item.studentId, 'Absent')}
                      style={radioStyle}
                    />
                    <Badge variant="danger" style={{ cursor: 'pointer' }}>
                      <X size={12} style={{ marginRight: '4px' }} /> Kelmadi
                    </Badge>
                  </label>
                </td>

                {/* Late check */}
                <td>
                  <label style={checkboxLabelStyle}>
                    <input 
                      type="radio" 
                      name={`att_status_${item.studentId}`} 
                      checked={item.status === 'Late'}
                      onChange={() => handleStatusChange(item.studentId, 'Late')}
                      style={radioStyle}
                    />
                    <Badge variant="warning" style={{ cursor: 'pointer' }}>
                      <Clock size={12} style={{ marginRight: '4px' }} /> Kechikdi
                    </Badge>
                  </label>
                </td>

                {/* Excused check */}
                <td>
                  <label style={checkboxLabelStyle}>
                    <input 
                      type="radio" 
                      name={`att_status_${item.studentId}`} 
                      checked={item.status === 'Excused'}
                      onChange={() => handleStatusChange(item.studentId, 'Excused')}
                      style={radioStyle}
                    />
                    <Badge variant="info" style={{ cursor: 'pointer' }}>
                      <HelpCircle size={12} style={{ marginRight: '4px' }} /> Sababli
                    </Badge>
                  </label>
                </td>

              </tr>
            ))}
          </Table>
        </Card>
      )}

    </div>
  );
}

// Inline styles for custom checkboxes
const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: '8px'
};

const radioStyle = {
  width: '18px',
  height: '18px',
  accentColor: 'var(--color-primary)'
};
