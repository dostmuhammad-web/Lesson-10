// src/pages/Reports.jsx
import React, { useState } from 'react';
import { 
  BarChart3, FileText, Printer, Calendar, Users, 
  TrendingUp, BookOpen, UserCheck, CreditCard, ChevronRight 
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Card, Button, Select, Table, Tabs } from '../components/common/ui/index.jsx';

export default function Reports() {
  const { db, selectedBranch } = useCRM();
  const [activeReportTab, setActiveReportTab] = useState('finance');
  const [dateFilter, setDateFilter] = useState('month');

  if (!db) return null;

  const handlePrint = () => {
    window.print();
  };

  // Branch filter helper
  const filterByBranch = (list) => {
    if (selectedBranch === 'all') return list;
    return list.filter(item => item.branchId === selectedBranch);
  };

  // 1. Finance Data Calculations
  const branchStudents = filterByBranch(db.students);
  const branchPayments = db.payments.filter(p => {
    if (selectedBranch === 'all') return true;
    const std = db.students.find(s => s.id === p.studentId);
    return std && std.branchId === selectedBranch;
  });
  
  const totalRevenue = branchPayments.filter(p => p.status === 'Paid' || p.status === 'Partial').reduce((sum, p) => sum + p.paid, 0);
  const totalExpenses = db.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // 2. Student Growth Data (6 months)
  const studentGrowthData = [
    { month: 'Fevral', newCount: 12, total: 15 },
    { month: 'Mart', newCount: 15, total: 25 },
    { month: 'Aprel', newCount: 18, total: 38 },
    { month: 'May', newCount: 14, total: 42 },
    { month: 'Iyun', newCount: 16, total: 48 },
    { month: 'Iyul', newCount: 22, total: 55 }
  ];

  // 3. Teacher Performance Reports
  const teacherPerformanceData = db.teachers.map(teacher => {
    const teacherGroups = db.groups.filter(g => g.teacherId === teacher.id);
    const teacherStudents = db.students.filter(s => s.teacherId === teacher.id && s.status === 'Active');
    
    // Mock attendance & satisfaction
    const idNum = parseInt(teacher.id.replace('t', ''));
    const avgAttendance = 82 + (idNum % 4) * 3;
    const studentSatisfaction = 90 + (idNum % 3) * 4;

    return {
      name: teacher.name,
      specialization: teacher.specialization,
      groupsCount: teacherGroups.length,
      studentsCount: teacherStudents.length,
      avgAttendance: `${avgAttendance}%`,
      studentSatisfaction: `${studentSatisfaction}%`,
      rating: teacher.rating
    };
  });

  // 4. Course Analytics
  const courseAnalyticsData = db.courses.map(course => {
    const studentsCount = db.students.filter(s => s.courseId === course.id && s.status === 'Active').length;
    const groupsCount = db.groups.filter(g => g.courseId === course.id && g.status === 'active').length;
    const totalPayments = db.payments
      .filter(p => p.courseName === course.name)
      .reduce((sum, p) => sum + p.paid, 0);

    return {
      name: course.name,
      studentsCount,
      groupsCount,
      revenue: totalPayments
    };
  });

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header no-print">
        <div className="page-header-info">
          <h1 className="page-title">Tahliliy Hisobotlar</h1>
          <p className="page-subtitle">O'quv markazining barcha moliyaviy, akademik va talabalar dinamikasi hisobotlari</p>
        </div>
        <div className="page-header-actions">
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>Chop Etish</Button>
        </div>
      </div>

      {/* Reports navigation tabs */}
      <Tabs 
        tabs={[
          { id: 'finance', label: 'Moliyaviy Hisobot (Moliya & Foyda)' },
          { id: 'students', label: 'O\'quvchilar va Kurslar Tahlili' },
          { id: 'teachers', label: 'Ustozlar Performance Hisoboti' },
          { id: 'leads', label: 'Lid & Konversiya Voronkasi' }
        ]}
        activeTab={activeReportTab}
        onTabChange={setActiveReportTab}
        className="no-print"
      />

      {/* 1. FINANCE REPORT TAB */}
      {activeReportTab === 'finance' && (
        <div className="fade-in d-flex flex-column gap-4">
          <div className="grid grid-cols-3">
            <Card header="Jami Daromad (Tushum)">
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h2 style={{ color: 'var(--color-success)', fontSize: '24px', fontWeight: '850' }}>{totalRevenue.toLocaleString()} so'm</h2>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Kassadagi umumiy kirim</span>
              </div>
            </Card>
            <Card header="Jami Xarajatlar">
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h2 style={{ color: 'var(--color-danger)', fontSize: '24px', fontWeight: '850' }}>{totalExpenses.toLocaleString()} so'm</h2>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Ijara, oyliklar va marketing xarajatlari</span>
              </div>
            </Card>
            <Card header="Sof Foyda (Net Profit)">
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h2 style={{ color: netProfit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', fontSize: '24px', fontWeight: '850' }}>
                  {netProfit.toLocaleString()} so'm
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Daromad - Xarajat</span>
              </div>
            </Card>
          </div>

          <Card header="Moliyaviy xarajatlar turlari bo'yicha ulush">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {db.expenses.map((e, idx) => {
                const percent = Math.round((e.amount / totalExpenses) * 100);
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="d-flex justify-between" style={{ fontSize: '12.5px', fontWeight: 'bold' }}>
                      <span>{e.title} ({e.category})</span>
                      <span>{e.amount.toLocaleString()} so'm ({percent}%)</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: e.category === 'Oylik' ? 'var(--color-primary)' : (e.category === 'Ijara' ? 'var(--color-warning)' : 'var(--color-danger)')
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* 2. STUDENTS REPORT TAB */}
      {activeReportTab === 'students' && (
        <div className="fade-in d-flex flex-column gap-4">
          <Card header="Kurslar samaradorligi va daromadlilik ko'rsatkichi">
            <Table headers={[
              { label: 'Kurs nomi' },
              { label: 'Faol guruhlar' },
              { label: 'O\'quvchilar soni' },
              { label: 'Kurs narxi' },
              { label: 'Keltirgan tushumi (UZS)' }
            ]}>
              {courseAnalyticsData.map((c, idx) => {
                const matchingCourse = db.courses.find(course => course.name === c.name);
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700' }}>{c.name}</td>
                    <td>{c.groupsCount} ta guruh</td>
                    <td>{c.studentsCount} ta o'quvchi</td>
                    <td>{matchingCourse?.price.toLocaleString()} so'm</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                      {(c.studentsCount * (matchingCourse?.price || 0)).toLocaleString()} so'm
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Card>

          <Card header="O'quvchilar sonining oylik o'sish dinamikasi">
            <Table headers={[
              { label: 'Oy' },
              { label: 'Yozilgan yangi o\'quvchilar' },
              { label: 'Jami faol o\'quvchilar' }
            ]}>
              {studentGrowthData.map((data, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '700' }}>{data.month}</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>+{data.newCount} ta</td>
                  <td style={{ fontWeight: 'bold' }}>{data.total} ta o'quvchi</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* 3. TEACHERS REPORT TAB */}
      {activeReportTab === 'teachers' && (
        <div className="fade-in">
          <Card header="Ustozlarning oylik reyting va dars ko'rsatkichlari">
            <Table headers={[
              { label: 'Ustoz F.I.SH.' },
              { label: 'Yo\'nalishi' },
              { label: 'Guruhlari' },
              { label: 'O\'quvchilari' },
              { label: 'O\'rtacha davomat' },
              { label: 'O\'quvchi mamnunligi' },
              { label: 'Reyting' }
            ]}>
              {teacherPerformanceData.map((t, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '700' }}>{t.name}</td>
                  <td>{t.specialization}</td>
                  <td>{t.groupsCount} ta guruh</td>
                  <td>{t.studentsCount} ta o'quvchi</td>
                  <td style={{ fontWeight: '600' }}>{t.avgAttendance}</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{t.studentSatisfaction}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-warning)' }}>★ {t.rating}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* 4. LEADS REPORT TAB */}
      {activeReportTab === 'leads' && (
        <div className="fade-in grid grid-cols-2">
          {/* Conversion rates */}
          <Card header="Voronka bosqichlari bo'yicha konversiya foizlari">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
              {[
                { stage: 'Mijoz so\'rovi (Leads)', percent: 100, count: 32 },
                { stage: 'Bog\'lanildi va muloqot qilindi', percent: 81, count: 26 },
                { stage: 'Sinov darsiga belgilandi', percent: 62, count: 20 },
                { stage: 'Sinov darsiga qatnashdi', percent: 50, count: 16 },
                { stage: 'Kursga ro\'yxatdan o\'tdi (Enrolled)', percent: 37, count: 12 }
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="d-flex justify-between" style={{ fontSize: '12.5px', fontWeight: 'bold' }}>
                    <span>{step.stage}</span>
                    <span>{step.count} ta ({step.percent}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${step.percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--color-primary)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sources Analysis */}
          <Card header="Eng yuqori konversiya keltirgan reklama manbalari">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { source: 'Instagram Reklama', conversionRate: '45%', count: 12 },
                { source: 'Telegram kanallar', conversionRate: '38%', count: 9 },
                { source: 'Tavsiya (Do\'stlar)', conversionRate: '75%', count: 6 },
                { source: 'Tashrif buyurganlar', conversionRate: '60%', count: 4 },
                { source: 'Website ariza', conversionRate: '30%', count: 3 }
              ].map((stat, idx) => (
                <div key={idx} className="d-flex align-center justify-between" style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-secondary-light)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div className="d-flex flex-column">
                    <strong style={{ fontSize: '13px' }}>{stat.source}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Ro'yxatga olingan: {stat.count} ta o'quvchi</span>
                  </div>
                  <Badge variant="success">Konversiya: {stat.conversionRate}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
