// src/pages/Schedule.jsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon, AlertTriangle, Clock, MapPin, User, Grid } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Badge } from '../components/common/ui/index.jsx';

const TIME_SLOTS = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "14:00 - 16:00",
  "16:30 - 18:30",
  "19:00 - 21:00"
];

const ROOMS = [
  "Chilonzor xonasi",
  "Amir Temur xonasi",
  "Navoiy xonasi",
  "IT Lab-1",
  "IT Lab-2",
  "Xadra xonasi",
  "Xiva xonasi"
];

export default function Schedule() {
  const { db } = useCRM();
  const [scheduleDayFilter, setScheduleDayFilter] = useState('odd'); // 'odd' (Toq kunlar), 'even' (Juft kunlar)

  if (!db) return null;

  // Filter groups by active and schedule day
  const activeGroups = db.groups.filter(g => g.status === 'active');
  
  const scheduleGroups = activeGroups.filter(g => {
    const isOdd = g.schedule.toLowerCase().includes('toq');
    return scheduleDayFilter === 'odd' ? isOdd : !isOdd;
  });

  // Conflict detection parser
  const getCellLessons = (slot, room) => {
    return scheduleGroups.filter(g => {
      // Check room match
      const roomMatch = g.room === room;
      // Check slot match (contains time string, e.g. "14:00" or "16:30")
      const timeMatch = TIME_SLOTS.some(ts => {
        const timePart = ts.split(' - ')[0]; // "14:00"
        return g.schedule.includes(timePart) && slot.includes(timePart);
      });
      return roomMatch && timeMatch;
    });
  };

  // Global teacher conflict finder in the active schedule day
  const getTeacherConflict = (teacherId, slot) => {
    const teacherLessons = scheduleGroups.filter(g => {
      const isTeacher = g.teacherId === teacherId;
      const timeMatch = TIME_SLOTS.some(ts => {
        const timePart = ts.split(' - ')[0];
        return g.schedule.includes(timePart) && slot.includes(timePart);
      });
      return isTeacher && timeMatch;
    });
    return teacherLessons.length > 1 ? teacherLessons : null;
  };

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Dars Jadvali - Auditoriyalar Bandligi</h1>
          <p className="page-subtitle">Xonalar va o'qituvchilar bandligi jadvali. Konfliktlarni avtomatik aniqlash tizimi.</p>
        </div>
      </div>

      {/* Selector Day Toggle */}
      <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '4px'
        }}>
          <button
            onClick={() => setScheduleDayFilter('odd')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: '600',
              backgroundColor: scheduleDayFilter === 'odd' ? 'var(--color-primary)' : 'transparent',
              color: scheduleDayFilter === 'odd' ? 'white' : 'var(--color-text-muted)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Toq kunlar (Dush / Chor / Jum)
          </button>
          <button
            onClick={() => setScheduleDayFilter('even')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: '600',
              backgroundColor: scheduleDayFilter === 'even' ? 'var(--color-primary)' : 'transparent',
              color: scheduleDayFilter === 'even' ? 'white' : 'var(--color-text-muted)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Juft kunlar (Sesh / Pay / Shan)
          </button>
        </div>

        <div className="d-flex align-center gap-2">
          <Badge variant="warning" dot>Conflict Warning tizimi faol</Badge>
        </div>
      </div>

      {/* Schedule Grid Table */}
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ width: '150px', backgroundColor: 'var(--color-secondary-light)' }}>Xona / Vaqt</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} style={{ textAlign: 'center', width: '200px' }}>
                  <div className="d-flex align-center justify-center gap-1">
                    <Clock size={14} />
                    <span>{slot}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROOMS.map(room => (
              <tr key={room}>
                {/* Room label */}
                <td style={{
                  fontWeight: '700',
                  backgroundColor: 'var(--color-secondary-light)',
                  borderRight: '1px solid var(--color-border)',
                  fontSize: '13px'
                }}>
                  <div className="d-flex align-center gap-1">
                    <MapPin size={13} style={{ color: 'var(--color-text-light)' }} />
                    <span>{room}</span>
                  </div>
                </td>

                {/* Slots cell content */}
                {TIME_SLOTS.map(slot => {
                  const cellLessons = getCellLessons(slot, room);
                  const isRoomConflict = cellLessons.length > 1;

                  return (
                    <td 
                      key={slot} 
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '8px',
                        verticalAlign: 'top',
                        backgroundColor: isRoomConflict ? 'var(--color-danger-light)' : 'transparent',
                        height: '110px'
                      }}
                    >
                      {/* Conflicts Render */}
                      {isRoomConflict && (
                        <div style={{
                          color: 'var(--color-danger)',
                          fontSize: '10.5px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginBottom: '6px',
                          backgroundColor: '#ffb3b3',
                          padding: '4px',
                          borderRadius: '4px'
                        }}>
                          <AlertTriangle size={12} />
                          <span>⚠️ XONA BAND! ({cellLessons.length} guruh)</span>
                        </div>
                      )}

                      {cellLessons.map(g => {
                        const course = db.courses.find(c => c.id === g.courseId);
                        const teacher = db.teachers.find(t => t.id === g.teacherId);
                        const teacherConflict = getTeacherConflict(g.teacherId, slot);

                        return (
                          <div 
                            key={g.id} 
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              border: `1px solid ${teacherConflict ? 'var(--color-warning)' : 'var(--color-border)'}`,
                              borderRadius: 'var(--radius-md)',
                              padding: '8px',
                              fontSize: '11.5px',
                              boxShadow: 'var(--shadow-sm)',
                              marginBottom: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              backgroundColor: teacherConflict ? 'var(--color-warning-light)' : 'var(--color-surface)'
                            }}
                          >
                            <div className="d-flex justify-between align-center">
                              <strong style={{ color: 'var(--color-text)' }}>{g.name}</strong>
                              <Badge variant="primary" style={{ fontSize: '9px', padding: '2px 4px' }}>
                                {course ? course.name : 'Kurs'}
                              </Badge>
                            </div>
                            
                            <div className="d-flex align-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                              <User size={11} />
                              <span>{teacher ? teacher.name : 'O\'qituvchi'}</span>
                            </div>

                            {teacherConflict && (
                              <div style={{
                                color: 'var(--color-warning-hover)',
                                fontSize: '9.5px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                marginTop: '2px'
                              }}>
                                <AlertTriangle size={10} />
                                <span>⚠️ O'qituvchida to'qnashuv!</span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {cellLessons.length === 0 && (
                        <div style={{
                          color: 'var(--color-text-light)',
                          fontSize: '11px',
                          textAlign: 'center',
                          paddingTop: '32px'
                        }}>
                          Bo'sh
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conflict description legend */}
      <Card header="Conflict Detection haqida ma'lumot" className="no-print">
        <div className="d-flex flex-column gap-3" style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          <p>
            Tizim dars jadvalida yuzaga kelishi mumkin bo'lgan to'qnashuvlarni real vaqtda nazorat qiladi:
          </p>
          <div className="d-flex align-center gap-3">
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', borderRadius: '3px' }} />
            <span><strong>Xona to'qnashuvi:</strong> Agar bitta xonaga bir vaqtning o'zida ikkita guruh joylashtirilsa, xona qizil rangda ogohlantiriladi.</span>
          </div>
          <div className="d-flex align-center gap-3">
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', borderRadius: '3px' }} />
            <span><strong>O'qituvchi to'qnashuvi:</strong> Agar bitta o'qituvchi bir vaqtning o'zida ikkita guruhda dars o'tishi rejalashtirilsa, karta sariq rangda ogohlantiriladi.</span>
          </div>
        </div>
      </Card>

    </div>
  );
}
