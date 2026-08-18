// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Calendar, CreditCard, DollarSign, TrendingUp, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, Award, Plus, Compass
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { StatCard, Card, ChartCard, Button, Badge } from '../components/common/ui/index.jsx';

export default function Dashboard({ openGlobalQuickModal }) {
  const navigate = useNavigate();
  const { db, selectedBranch, notifications } = useCRM();
  const [dateFilter, setDateFilter] = useState('month'); // 'today', 'week', 'month', 'year'

  if (!db) return null;

  // Filter helpers
  const filterByBranch = (list) => {
    if (selectedBranch === 'all') return list;
    return list.filter(item => item.branchId === selectedBranch);
  };

  // Branch filtered collections
  const students = filterByBranch(db.students);
  const groups = filterByBranch(db.groups);
  const payments = db.payments.filter(p => {
    if (selectedBranch === 'all') return true;
    const std = db.students.find(s => s.id === p.studentId);
    return std && std.branchId === selectedBranch;
  });
  const leads = db.leads; // Leads are global/not branch tied in our mock

  // KPI Calculations
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const newStudents = students.filter(s => {
    // joined in last 30 days
    const parts = s.joinedDate.split('.');
    const joinDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const diff = (new Date() - joinDate) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;
  
  const debtors = students.filter(s => s.balance < 0).length;

  // Today lessons calculation
  const today = new Date();
  const weekday = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const isOddDay = weekday % 2 !== 0; // Mon, Wed, Fri
  
  const todayGroups = groups.filter(g => {
    if (isOddDay) {
      return g.schedule.toLowerCase().includes('toq');
    } else {
      return g.schedule.toLowerCase().includes('juft');
    }
  });
  const todayLessonsCount = todayGroups.length;

  // Financial statistics
  // Today's collections
  const todayStr = today.toLocaleDateString('uz-UZ').replace(/\//g, '.');
  const todayRevenue = payments
    .filter(p => p.date === todayStr && p.status === 'Paid')
    .reduce((sum, p) => sum + p.paid, 0);

  // Monthly Revenue (all payments this month)
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  const monthlyPayments = payments.filter(p => {
    if (!p.date) return false;
    const parts = p.date.split('.');
    return parseInt(parts[1]) === currentMonth && parseInt(parts[2]) === currentYear;
  });
  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.paid, 0);

  // New leads this month
  const newLeads = leads.filter(l => {
    const parts = l.createdDate.split('.');
    return parseInt(parts[1]) === currentMonth && parseInt(parts[2]) === currentYear;
  }).length;

  // Smart business alerts
  const alerts = [];
  
  // 1. Debt alert
  const totalDebt = Math.abs(students.filter(s => s.balance < 0).reduce((sum, s) => sum + s.balance, 0));
  if (debtors > 0) {
    alerts.push({
      type: 'warning',
      message: `${debtors} ta o'quvchining to'lov muddati o'tgan. Umumiy qarz miqdori: ${totalDebt.toLocaleString()} so'm.`
    });
  }

  // 2. Lead follow-up alert
  const pendingFollowups = leads.filter(l => {
    if (!l.nextFollowUp) return false;
    const parts = l.nextFollowUp.split('.');
    const d = new Date(parts[2], parts[1]-1, parts[0]);
    return d <= new Date() && l.status !== 'Enrolled' && l.status !== 'Lost';
  }).length;
  if (pendingFollowups > 0) {
    alerts.push({
      type: 'info',
      message: `${pendingFollowups} ta lead bilan bog'lanish vaqti keldi (Follow-up talab qilinadi).`
    });
  }

  // 3. Full groups alert
  const fullGroups = groups.filter(g => {
    const count = db.students.filter(s => s.groupId === g.id && s.status === 'Active').length;
    return count >= g.capacity;
  });
  if (fullGroups.length > 0) {
    alerts.push({
      type: 'danger',
      message: `${fullGroups.length} ta guruh to'liq to'lgan (sig'im 20/20): ${fullGroups.map(g => g.name).join(', ')}.`
    });
  }

  // Inactive Student detection alert
  const inactiveNotifications = notifications.filter(n => n.type === 'attendance issue' && !n.read);
  if (inactiveNotifications.length > 0) {
    alerts.push({
      type: 'danger',
      message: `${inactiveNotifications.length} ta o'quvchi darslarni muntazam qoldirmoqda (Inaktiv o'quvchilar aniqlandi).`
    });
  }

  return (
    <div className="fade-in d-flex flex-column gap-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Asosiy Dashboard</h1>
          <p className="page-subtitle">O'quv markazining umumiy ko'rsatkichlari va tahlillari</p>
        </div>

        {/* Date Filter */}
        <div className="d-flex align-center gap-2">
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '4px'
          }}>
            {[['today', 'Bugun'], ['week', 'Haftalik'], ['month', 'Oylik'], ['year', 'Yillik']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDateFilter(key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: dateFilter === key ? 'var(--color-primary)' : 'transparent',
                  color: dateFilter === key ? 'white' : 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STAT CARDS (KPIs) */}
      <div className="grid grid-cols-4">
        <StatCard 
          title="Jami o'quvchilar" 
          value={totalStudents} 
          trend="+8%" 
          trendDirection="up" 
          icon={Users} 
          variant="primary" 
        />
        <StatCard 
          title="Faol o'quvchilar" 
          value={activeStudents} 
          trend="+5%" 
          trendDirection="up" 
          icon={Users} 
          variant="success" 
        />
        <StatCard 
          title="Yangi o'quvchilar (30 kun)" 
          value={newStudents} 
          trend="+15%" 
          trendDirection="up" 
          icon={UserPlus} 
          variant="info" 
        />
        <StatCard 
          title="Qarzdor o'quvchilar" 
          value={debtors} 
          trend={debtors > 5 ? "+12%" : "-4%"} 
          trendDirection={debtors > 5 ? "up" : "down"} 
          icon={AlertTriangle} 
          variant="danger" 
        />
        <StatCard 
          title="Bugungi darslar" 
          value={todayLessonsCount} 
          period="dars jadvali bo'yicha" 
          icon={Calendar} 
          variant="secondary" 
        />
        <StatCard 
          title="Bugungi tushum" 
          value={`${todayRevenue.toLocaleString()} so'm`} 
          period="kassadagi naqd/karta tushumi" 
          icon={DollarSign} 
          variant="success" 
        />
        <StatCard 
          title="Oylik tushum (Iyul)" 
          value={`${monthlyRevenue.toLocaleString()} so'm`} 
          trend="+12%" 
          trendDirection="up" 
          icon={TrendingUp} 
          variant="primary" 
        />
        <StatCard 
          title="Yangi leadlar (Iyul)" 
          value={newLeads} 
          trend="+22%" 
          trendDirection="up" 
          icon={Compass} 
          variant="info" 
        />
      </div>

      {/* QUICK ACTIONS BUTTONS */}
      <Card header="Tezkor Amallar" className="fade-in">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Button variant="primary" icon={Plus} onClick={() => openGlobalQuickModal('student')}>Yangi O'quvchi</Button>
          <Button variant="info" icon={Plus} onClick={() => openGlobalQuickModal('lead')}>Yangi Lead</Button>
          <Button variant="success" icon={Plus} onClick={() => openGlobalQuickModal('group')}>Yangi Guruh</Button>
          <Button variant="warning" icon={Plus} onClick={() => openGlobalQuickModal('payment')}>To'lov Qabul Qilish</Button>
          <Button variant="secondary" icon={Plus} onClick={() => openGlobalQuickModal('teacher')}>O'qituvchi Qo'shish</Button>
          <Button variant="secondary" icon={Plus} onClick={() => openGlobalQuickModal('trial')}>Sinov Darsi</Button>
        </div>
      </Card>

      {/* SMART BUSINESS ALERTS */}
      {alerts.length > 0 && (
        <Card 
          header={
            <div className="d-flex align-center gap-2" style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
              <AlertTriangle size={18} />
              <span>Tizim E'lonlari va Ogohlantirishlar</span>
            </div>
          }
          className="fade-in"
          style={{ borderLeft: '4px solid var(--color-danger)' }}
        >
          <div className="d-flex flex-column gap-3">
            {alerts.map((a, idx) => (
              <div 
                key={idx} 
                className="d-flex align-center gap-2"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: a.type === 'danger' ? 'var(--color-danger-light)' : (a.type === 'warning' ? 'var(--color-warning-light)' : 'var(--color-info-light)'),
                  color: a.type === 'danger' ? 'var(--color-danger)' : (a.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'),
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CHARTS GRAPHICS (SVG ANALYTICS) */}
      <div className="grid grid-cols-2">
        
        {/* Student Growth Chart */}
        <ChartCard 
          title="O'quvchilar sonining o'sishi" 
          subtitle="Oxirgi 6 oylik yangi va faol o'quvchilar o'sish dinamikasi"
        >
          <div className="d-flex flex-column justify-between" style={{ height: '240px', position: 'relative' }}>
            {/* SVG line chart */}
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '180px' }}>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--color-border)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--color-border)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--color-border)" strokeDasharray="4 4" />
              
              {/* Line Paths */}
              {/* Month data: Feb (15), Mar (25), Apr (38), May (42), Jun (48), Jul (55) */}
              {/* Map data points: x=0..500, y=180..20 */}
              <path 
                d="M 10 170 L 100 150 L 190 120 L 280 90 L 370 70 L 460 30" 
                fill="none" 
                stroke="var(--color-primary)" 
                strokeWidth="3" 
              />
              {/* Dots */}
              <circle cx="10" cy="170" r="5" fill="var(--color-primary)" />
              <circle cx="100" cy="150" r="5" fill="var(--color-primary)" />
              <circle cx="190" cy="120" r="5" fill="var(--color-primary)" />
              <circle cx="280" cy="90" r="5" fill="var(--color-primary)" />
              <circle cx="370" cy="70" r="5" fill="var(--color-primary)" />
              <circle cx="460" cy="30" r="5" fill="var(--color-primary)" />
              
              {/* Label points */}
              <text x="10" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Fev</text>
              <text x="100" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Mar</text>
              <text x="190" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Apr</text>
              <text x="280" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">May</text>
              <text x="370" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Iyun</text>
              <text x="460" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Iyul</text>
              
              {/* Values */}
              <text x="10" y="155" fontSize="9" fill="var(--color-text)" fontWeight="bold">15</text>
              <text x="100" y="135" fontSize="9" fill="var(--color-text)" fontWeight="bold">25</text>
              <text x="190" y="105" fontSize="9" fill="var(--color-text)" fontWeight="bold">38</text>
              <text x="280" y="75" fontSize="9" fill="var(--color-text)" fontWeight="bold">42</text>
              <text x="370" y="55" fontSize="9" fill="var(--color-text)" fontWeight="bold">48</text>
              <text x="460" y="15" fontSize="9" fill="var(--color-text)" fontWeight="bold">55</text>
            </svg>
          </div>
        </ChartCard>

        {/* Revenue Chart */}
        <ChartCard 
          title="Tushumlar hajmi (mln so'm)" 
          subtitle="Kunlik / haftalik tushumlar hisoboti"
        >
          <div className="d-flex flex-column justify-between" style={{ height: '240px' }}>
            {/* SVG bar chart */}
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '180px' }}>
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--color-border)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--color-border)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--color-border)" strokeDasharray="4 4" />
              
              {/* Bars: Feb (12m), Mar (18m), Apr (24m), May (22m), Jun (28m), Jul (34m) */}
              <rect x="25" y="140" width="30" height="40" rx="3" fill="var(--color-success)" />
              <rect x="110" y="110" width="30" height="70" rx="3" fill="var(--color-success)" />
              <rect x="195" y="80" width="30" height="100" rx="3" fill="var(--color-success)" />
              <rect x="280" y="90" width="30" height="90" rx="3" fill="var(--color-success)" />
              <rect x="365" y="60" width="30" height="120" rx="3" fill="var(--color-success)" />
              <rect x="450" y="30" width="30" height="150" rx="3" fill="var(--color-success)" />

              {/* Labels */}
              <text x="40" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Fev</text>
              <text x="125" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Mar</text>
              <text x="210" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Apr</text>
              <text x="295" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">May</text>
              <text x="380" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Iyun</text>
              <text x="465" y="192" fontSize="9" fill="var(--color-text-muted)" textAnchor="middle">Iyul</text>

              {/* Values */}
              <text x="40" y="130" fontSize="9" fill="var(--color-text)" fontWeight="bold" textAnchor="middle">12.4</text>
              <text x="125" y="100" fontSize="9" fill="var(--color-text)" fontWeight="bold" textAnchor="middle">18.2</text>
              <text x="210" y="70" fontSize="9" fill="var(--color-text)" fontWeight="bold" textAnchor="middle">24.5</text>
              <text x="295" y="80" fontSize="9" fill="var(--color-text)" fontWeight="bold" textAnchor="middle">22.0</text>
              <text x="380" y="50" fontSize="9" fill="var(--color-text)" fontWeight="bold" textAnchor="middle">28.9</text>
              <text x="465" y="20" fontSize="9" fill="var(--color-text)" fontWeight="bold" textAnchor="middle">34.6</text>
            </svg>
          </div>
        </ChartCard>

        {/* Lead Conversion Funnel */}
        <ChartCard 
          title="Lead Konversiya Voronkasi" 
          subtitle="Kelgan so'rovlardan ro'yxatga olingan faol o'quvchilargacha bo'lgan foizlar"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
            {[
              { label: '1. Jami Leadlar (So\'rovlar)', val: 32, rate: '100%', color: 'var(--color-primary)' },
              { label: '2. Bog\'lanildi (Muloqotda)', val: 26, rate: '81%', color: '#4f46e5' },
              { label: '3. Sinov darsiga yozildi', val: 20, rate: '62%', color: '#7c3aed' },
              { label: '4. Sinov darsiga keldi', val: 16, rate: '50%', color: '#a855f7' },
              { label: '5. To\'lov qildi va O\'quvchi bo\'ldi', val: 12, rate: '37.5%', color: 'var(--color-success)' }
            ].map((step, idx) => (
              <div key={idx} className="d-flex align-center justify-between" style={{
                backgroundColor: 'var(--color-secondary-light)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                borderLeft: `4px solid ${step.color}`
              }}>
                <div className="d-flex flex-column">
                  <span style={{ fontSize: '12.5px', fontWeight: '600' }}>{step.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Soni: {step.val} ta lead</span>
                </div>
                <Badge variant={idx === 4 ? 'success' : 'primary'}>{step.rate}</Badge>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Course Popularity Chart */}
        <ChartCard 
          title="Kurslarning ommabopligi" 
          subtitle="O'quvchilar soni bo'yicha eng yuqori talabga ega kurslar"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'IELTS English', count: 18, pct: 90 },
              { name: 'Frontend Web Dasturlash', count: 15, pct: 75 },
              { name: 'General English', count: 12, pct: 60 },
              { name: 'Matematika DTM', count: 8, pct: 40 },
              { name: 'Grafik Dizayn', count: 6, pct: 30 }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="d-flex justify-between" style={{ fontSize: '12.5px', fontWeight: '600' }}>
                  <span>{item.name}</span>
                  <span style={{ color: 'var(--color-primary)' }}>{item.count} ta o'quvchi</span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.pct}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-normal)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

      </div>
    </div>
  );
}
