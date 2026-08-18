// src/pages/Leads.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Mail, Phone, ExternalLink, Trash2, Edit2, 
  ChevronRight, ChevronLeft, ArrowRightLeft, User, Eye, BarChart3
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { 
  Card, Button, Badge, Modal, Input, Select, EmptyState, Tabs 
} from '../components/common/ui/index.jsx';

const KANBAN_STAGES = [
  { id: 'New', label: 'Yangi' },
  { id: 'Contacted', label: "Bog'lanilgan" },
  { id: 'Interested', label: 'Qiziqqan' },
  { id: 'Trial booked', label: 'Sinov belgilangan' },
  { id: 'Trial attended', label: 'Sinovga keldi' },
  { id: 'Negotiation', label: 'Kelishuvda' },
  { id: 'Enrolled', label: 'Yozildi' },
  { id: 'Lost', label: "Yo'qotilgan" }
];

const SOURCES = [
  "Instagram", "Telegram", "Facebook", "Website", "Tavsiya", 
  "Telefon orqali", "Tashrif buyurdi", "Reklama", "Boshqa"
];

export default function Leads({ quickAddType, resetQuickAdd }) {
  const { 
    db, addLead, updateLead, moveLead, deleteLead, addTrial, updateTrialStatus 
  } = useCRM();

  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'trials', 'analytics'
  
  // Leads modal state
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(quickAddType === 'lead');
  const [activeLead, setActiveLead] = useState(null);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  
  // Follow-up & Trial modal states
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isTrialOpen, setIsTrialOpen] = useState(false);

  // Forms state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    interestedCourse: db?.courses[0]?.name || 'IELTS',
    source: 'Instagram',
    manager: 'Dostonbek Qodirov',
    notes: '',
    nextFollowUp: ''
  });

  const [followUpData, setFollowUpData] = useState({
    nextFollowUp: '',
    notes: ''
  });

  const [trialData, setTrialData] = useState({
    studentName: '',
    studentPhone: '',
    courseName: db?.courses[0]?.name || 'IELTS',
    teacherName: db?.teachers[0]?.name || 'Sardor Axmedov',
    date: '',
    time: '14:00',
    room: 'Xona-1',
    comment: ''
  });

  // Handle Quick Add lead
  useEffect(() => {
    if (quickAddType === 'lead') {
      setIsAddLeadOpen(true);
      resetQuickAdd();
    }
  }, [quickAddType, resetQuickAdd]);

  if (!db) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleLeadSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert("Ism va telefon kiritilishi shart!");
      return;
    }

    if (isEditLeadOpen) {
      updateLead(activeLead.id, formData);
      setIsEditLeadOpen(false);
    } else {
      addLead(formData);
      setIsAddLeadOpen(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      interestedCourse: db.courses[0]?.name || 'IELTS',
      source: 'Instagram',
      manager: 'Dostonbek Qodirov',
      notes: '',
      nextFollowUp: ''
    });
    setActiveLead(null);
  };

  // Open Follow-up planner
  const openFollowUp = (lead) => {
    setActiveLead(lead);
    setFollowUpData({
      nextFollowUp: lead.nextFollowUp || '',
      notes: lead.notes || ''
    });
    setIsFollowUpOpen(true);
  };

  const saveFollowUp = () => {
    updateLead(activeLead.id, {
      ...activeLead,
      nextFollowUp: followUpData.nextFollowUp,
      notes: followUpData.notes
    });
    setIsFollowUpOpen(false);
    alert("Navbatdagi qo'ng'iroq va izoh saqlandi!");
  };

  // Open Trial Scheduler
  const openTrialScheduler = (lead) => {
    setActiveLead(lead);
    setTrialData({
      studentName: lead.name,
      studentPhone: lead.phone,
      courseName: lead.interestedCourse,
      teacherName: db.teachers[0]?.name || 'Sardor Axmedov',
      date: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
      time: '14:00',
      room: 'Chilonzor xonasi',
      comment: 'Lead orqali sinov darsiga yozildi.'
    });
    setIsTrialOpen(true);
  };

  const saveTrialLesson = () => {
    addTrial(trialData);
    // Move lead stage to 'Trial booked'
    moveLead(activeLead.id, 'Trial booked');
    setIsTrialOpen(false);
  };

  // Stage conversion rate counter
  const getStageCounts = (stageId) => {
    return db.leads.filter(l => l.status === stageId).length;
  };

  // Lead Sources calculator
  const sourceStats = SOURCES.map(src => {
    const count = db.leads.filter(l => l.source === src).length;
    return { name: src, count, percentage: db.leads.length ? Math.round((count / db.leads.length) * 100) : 0 };
  }).sort((a,b) => b.count - a.count);

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">Lead CRM - Potensial O'quvchilar</h1>
          <p className="page-subtitle">So'rovlar, darsga yozilish ehtimoli yuqori o'quvchilar va kanban voronkasi</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon={Plus} onClick={() => { resetForm(); setIsAddLeadOpen(true); }}>Yangi Lead</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={[
          { id: 'kanban', label: 'Kanban Doskasi' },
          { id: 'trials', label: 'Sinov darslari (Trial)' },
          { id: 'analytics', label: 'Manbalar Tahlili' }
        ]} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          height: 'calc(100vh - 260px)',
          minHeight: '400px'
        }}>
          {KANBAN_STAGES.map(stage => {
            const stageLeads = db.leads.filter(l => l.status === stage.id);
            
            return (
              <div 
                key={stage.id} 
                style={{
                  flex: '0 0 280px',
                  backgroundColor: 'var(--color-secondary-light)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '100%',
                  overflow: 'hidden'
                }}
              >
                {/* Stage Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  fontWeight: '700',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-surface)'
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>{stage.label}</span>
                  <Badge variant={stageLeads.length > 0 ? 'primary' : 'secondary'}>{stageLeads.length}</Badge>
                </div>

                {/* Stage Body (Cards scrollable) */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {stageLeads.length === 0 ? (
                    <div style={{
                      padding: '24px 10px',
                      textAlign: 'center',
                      color: 'var(--color-text-light)',
                      fontSize: '11px',
                      border: '1px dashed var(--color-border)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      Bo'sh
                    </div>
                  ) : (
                    stageLeads.map(lead => {
                      const isOverdueFollowup = () => {
                        if (!lead.nextFollowUp) return false;
                        const parts = lead.nextFollowUp.split('.');
                        return new Date(parts[2], parts[1]-1, parts[0]) < new Date();
                      };

                      return (
                        <div 
                          key={lead.id} 
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          {/* Title & Actions */}
                          <div className="d-flex justify-between align-center">
                            <span style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--color-text)' }}>{lead.name}</span>
                            <div className="d-flex gap-1">
                              <button 
                                onClick={() => openFollowUp(lead)}
                                style={{ color: 'var(--color-primary)', cursor: 'pointer', display: 'flex' }}
                                title="Navbatdagi aloqa"
                              >
                                <Calendar size={13} />
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveLead(lead);
                                  setFormData({
                                    name: lead.name,
                                    phone: lead.phone,
                                    interestedCourse: lead.interestedCourse,
                                    source: lead.source,
                                    manager: lead.manager,
                                    notes: lead.notes || '',
                                    nextFollowUp: lead.nextFollowUp || ''
                                  });
                                  setIsEditLeadOpen(true);
                                }}
                                style={{ color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}
                                title="Tahrirlash"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            📞 {lead.phone}
                          </div>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            <Badge variant="primary" style={{ fontSize: '10px' }}>{lead.interestedCourse}</Badge>
                            <Badge variant="secondary" style={{ fontSize: '10px' }}>{lead.source}</Badge>
                          </div>

                          {/* Follow up date */}
                          {lead.nextFollowUp && (
                            <div style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: isOverdueFollowup() ? 'var(--color-danger-light)' : 'var(--color-secondary-light)',
                              color: isOverdueFollowup() ? 'var(--color-danger)' : 'var(--color-text-muted)',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span>Muddati: {lead.nextFollowUp}</span>
                              {isOverdueFollowup() && <span style={{ fontSize: '9px', textTransform: 'uppercase' }}>Kechikdi</span>}
                            </div>
                          )}

                          {/* Quick Stage Mover */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: '8px',
                            marginTop: '4px'
                          }}>
                            {stage.id !== 'Enrolled' && stage.id !== 'Lost' && (
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                style={{ padding: '3px 6px', fontSize: '10px', flex: 1 }}
                                onClick={() => openTrialScheduler(lead)}
                              >
                                Trial belgilash
                              </Button>
                            )}
                            
                            <Select 
                              value={lead.status}
                              onChange={(e) => moveLead(lead.id, e.target.value)}
                              options={KANBAN_STAGES.map(s => ({ value: s.id, label: s.label }))}
                              style={{ marginBottom: 0, padding: '2px 4px', fontSize: '10px', height: '24px', flex: 1, marginLeft: '6px' }}
                            />
                          </div>

                          <div className="d-flex justify-between" style={{ fontSize: '9px', color: 'var(--color-text-light)' }}>
                            <span>Mas'ul: {lead.manager}</span>
                            <span>{lead.createdDate}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRIALS LIST TAB */}
      {activeTab === 'trials' && (
        <Card header="Sinov darslari (Trial Lessons) jadvali">
          {db.trials.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)' }}>
              Sinov darslari ro'yxatga olinmagan.
            </div>
          ) : (
            <Table headers={[
              { label: "O'quvchi F.I.SH." },
              { label: 'Telefon' },
              { label: 'Kurs' },
              { label: "O'qituvchi" },
              { label: 'Sana & Vaqt' },
              { label: 'Xona' },
              { label: 'Natija / Izoh' },
              { label: 'Holati' },
              { label: "O'zgartirish", width: '130px' }
            ]}>
              {db.trials.map(trial => (
                <tr key={trial.id}>
                  <td style={{ fontWeight: '700' }}>{trial.studentName}</td>
                  <td>{trial.studentPhone}</td>
                  <td>{trial.courseName}</td>
                  <td>{trial.teacherName}</td>
                  <td style={{ fontWeight: '600' }}>{trial.date} | {trial.time}</td>
                  <td>{trial.room}</td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {trial.result || '-'} <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>({trial.comment || ''})</span>
                  </td>
                  <td>
                    <Badge variant={
                      trial.status === 'Converted' || trial.status === 'Attended' ? 'success' : 
                      (trial.status === 'Scheduled' ? 'primary' : 'danger')
                    }>
                      {trial.status === 'Scheduled' ? 'Belgilangan' : 
                      (trial.status === 'Attended' ? 'Keldi' : 
                      (trial.status === 'Missed' ? 'Kelmadi' : 
                      (trial.status === 'Converted' ? "A'zo bo'ldi" : 'Bekor qilindi')))}
                    </Badge>
                  </td>
                  <td>
                    <Select 
                      value={trial.status} 
                      onChange={(e) => updateTrialStatus(trial.id, e.target.value, trial.result)}
                      options={[
                        { value: 'Scheduled', label: 'Belgilangan' },
                        { value: 'Attended', label: 'Keldi' },
                        { value: 'Missed', label: 'Kelmadi' },
                        { value: 'Converted', label: 'Yozildi (Converted)' },
                        { value: 'Cancelled', label: 'Bekor qilindi' }
                      ]}
                      style={{ marginBottom: 0, padding: '4px 6px', fontSize: '11px', height: '28px' }}
                    />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* LEAD ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-2">
          {/* Funnel conversion stats */}
          <Card header="Leadlar holati bo'yicha tahlil">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {KANBAN_STAGES.map(stage => {
                const count = getStageCounts(stage.id);
                const total = db.leads.length || 1;
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="d-flex justify-between" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      <span>{stage.label}</span>
                      <span>{count} ta ({percent}%)</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Sources Statistics */}
          <Card header="Lead kelish manbalari bo'yicha ulush">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sourceStats.map(stat => (
                <div key={stat.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="d-flex justify-between" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    <span>{stat.name}</span>
                    <span>{stat.count} ta ({stat.percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${stat.percentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--color-success)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      <Modal 
        isOpen={isAddLeadOpen || isEditLeadOpen} 
        onClose={() => { setIsAddLeadOpen(false); setIsEditLeadOpen(false); resetForm(); }}
        title={isEditLeadOpen ? "Lead ma'lumotlarini tahrirlash" : "Yangi lead kiritish"}
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="Mijoz ismi va familiyasi" 
            placeholder="Masalan: Jasur Karimov" 
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
            <Select 
              label="Qiziqqan kursi" 
              value={formData.interestedCourse}
              onChange={(e) => handleInputChange('interestedCourse', e.target.value)}
              options={db.courses.map(c => ({ value: c.name, label: c.name }))}
            />
          </div>

          <div className="grid grid-cols-2">
            <Select 
              label="Kelish manbasi" 
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              options={SOURCES.map(s => ({ value: s, label: s }))}
            />
            <Select 
              label="Mas'ul menejer" 
              value={formData.manager}
              onChange={(e) => handleInputChange('manager', e.target.value)}
              options={db.employees.filter(e => e.role === 'Manager' || e.role === 'Super Admin').map(e => ({ value: e.name, label: e.name }))}
            />
          </div>

          <Input 
            label="Navbatdagi bog'lanish vaqti (Follow-up)" 
            type="date"
            value={formData.nextFollowUp}
            onChange={(e) => handleInputChange('nextFollowUp', e.target.value)}
          />

          <Input 
            label="Qo'shimcha izohlar" 
            placeholder="Mijoz qaysi vaqtda darslar bo'lishini so'radi..." 
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => { setIsAddLeadOpen(false); setIsEditLeadOpen(false); resetForm(); }}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleLeadSubmit}>Saqlash</Button>
          </div>
        </div>
      </Modal>

      {/* FOLLOW UP MODAL */}
      <Modal 
        isOpen={isFollowUpOpen} 
        onClose={() => setIsFollowUpOpen(false)}
        title="Follow-up Rejalashtirish"
        maxWidth="md"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="Navbatdagi qo'ng'iroq / Bog'lanish sanasi" 
            type="date"
            value={followUpData.nextFollowUp}
            onChange={(e) => setFollowUpData(prev => ({ ...prev, nextFollowUp: e.target.value }))}
          />
          <Input 
            label="Muloqot yozuvi / Izoh" 
            placeholder="Telefon qildik, dushanba kuni kelmoqchi..." 
            value={followUpData.notes}
            onChange={(e) => setFollowUpData(prev => ({ ...prev, notes: e.target.value }))}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsFollowUpOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={saveFollowUp}>Saqlash</Button>
          </div>
        </div>
      </Modal>

      {/* SCHEDULE TRIAL MODAL */}
      <Modal 
        isOpen={isTrialOpen} 
        onClose={() => setIsTrialOpen(false)}
        title="Sinov darsini rejalashtirish"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <div className="grid grid-cols-2">
            <Input 
              label="O'quvchi" 
              value={trialData.studentName}
              onChange={(e) => setTrialData(prev => ({ ...prev, studentName: e.target.value }))}
              required
            />
            <Input 
              label="Telefon" 
              value={trialData.studentPhone}
              onChange={(e) => setTrialData(prev => ({ ...prev, studentPhone: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2">
            <Select 
              label="Kurs" 
              value={trialData.courseName}
              onChange={(e) => setTrialData(prev => ({ ...prev, courseName: e.target.value }))}
              options={db.courses.map(c => ({ value: c.name, label: c.name }))}
            />
            <Select 
              label="O'qituvchi (Dars o'tuvchi)" 
              value={trialData.teacherName}
              onChange={(e) => setTrialData(prev => ({ ...prev, teacherName: e.target.value }))}
              options={db.teachers.map(t => ({ value: t.name, label: t.name }))}
            />
          </div>

          <div className="grid grid-cols-3">
            <Input 
              label="Sana" 
              type="date"
              value={trialData.date}
              onChange={(e) => setTrialData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
            <Input 
              label="Vaqt" 
              placeholder="14:30"
              value={trialData.time}
              onChange={(e) => setTrialData(prev => ({ ...prev, time: e.target.value }))}
              required
            />
            <Input 
              label="Dars xonasi" 
              placeholder="Xona-3"
              value={trialData.room}
              onChange={(e) => setTrialData(prev => ({ ...prev, room: e.target.value }))}
              required
            />
          </div>

          <Input 
            label="Qo'shimcha izoh" 
            placeholder="Sinov darsiga yozuv sababi..." 
            value={trialData.comment}
            onChange={(e) => setTrialData(prev => ({ ...prev, comment: e.target.value }))}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsTrialOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={saveTrialLesson}>Darsni rejalashtirish</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
