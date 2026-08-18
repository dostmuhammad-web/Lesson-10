// src/pages/Students.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, Eye, Download, Users, 
  ArrowRight, ArrowLeft, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { 
  Table, Button, SearchInput, Select, Badge, 
  Pagination, Modal, ConfirmModal, EmptyState, Input
} from '../components/common/ui/index.jsx';

export default function Students({ quickAddType, resetQuickAdd }) {
  const navigate = useNavigate();
  const { 
    db, selectedBranch, addStudent, updateStudent, deleteStudent 
  } = useCRM();

  if (!db) return null;

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Multi-select & Bulk actions state
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkGroupModal, setShowBulkGroupModal] = useState(false);
  const [bulkTargetGroupId, setBulkTargetGroupId] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(quickAddType === 'student');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Multi-step Registration Form wizard state
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Erkak',
    phone: '',
    dob: '',
    address: '',
    parentName: '',
    parentPhone: '',
    relationship: 'Otasi',
    courseId: db.courses[0]?.id || '',
    groupId: db.groups[0]?.id || '',
    teacherId: db.groups[0]?.teacherId || '',
    status: 'Active',
    branchId: selectedBranch === 'all' ? (db.branches[0]?.id || '') : selectedBranch,
    initialPaid: 0
  });

  // Handle Quick Add trigger from global layout/header
  React.useEffect(() => {
    if (quickAddType === 'student') {
      setIsAddModalOpen(true);
      resetQuickAdd();
    }
  }, [quickAddType, resetQuickAdd]);

  // Form input change handlers
  const handleInputChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      
      // Auto-assign teacher when group changes
      if (field === 'groupId') {
        const grp = db.groups.find(g => g.id === val);
        if (grp) {
          updated.teacherId = grp.teacherId;
          updated.courseId = grp.courseId;
        }
      }
      return updated;
    });

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Step validation
  const validateStep = (currentStep) => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) errors.name = "F.I.SH. kiritilishi shart";
      if (!formData.phone.trim()) errors.phone = "Telefon raqam kiritilishi shart";
      if (!formData.dob) errors.dob = "Tug'ilgan sana tanlanishi shart";
      if (!formData.address.trim()) errors.address = "Manzil kiritilishi shart";
    } else if (currentStep === 2) {
      if (!formData.parentName.trim()) errors.parentName = "Ota-ona ismi kiritilishi shart";
      if (!formData.parentPhone.trim()) errors.parentPhone = "Ota-ona telefoni kiritilishi shart";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleFormSubmit = () => {
    // Compile final student object
    const finalData = {
      name: formData.name,
      gender: formData.gender,
      phone: formData.phone,
      dob: formData.dob,
      address: formData.address,
      parent: {
        name: formData.parentName,
        phone: formData.parentPhone,
        relationship: formData.relationship
      },
      courseId: formData.courseId,
      groupId: formData.groupId,
      teacherId: formData.teacherId,
      status: formData.status,
      branchId: formData.branchId
    };

    if (isEditModalOpen) {
      updateStudent(activeStudentId, finalData);
      setIsEditModalOpen(false);
    } else {
      addStudent(finalData);
      setIsAddModalOpen(false);
      // Simulating step 5 payment log
      if (formData.initialPaid > 0) {
        // Find newly added student ID, mock standard naming: stdXXX
        const newId = `std${String(db.students.length + 1).padStart(3, '0')}`;
        // Add initial payment in DB context
        // Wait, Context addPayment takes: { studentId, paid, amount, method }
        // We will make a direct mock injection, or since state updates are synced, we call addPayment
        setTimeout(() => {
          const course = db.courses.find(c => c.id === formData.courseId);
          // Register payment
          db.payments.unshift({
            id: `INV-${1000 + db.payments.length + 1}`,
            studentId: newId,
            studentName: formData.name,
            courseName: course ? course.name : 'Kurs',
            amount: course ? course.price : 0,
            paid: Number(formData.initialPaid),
            remaining: course ? Math.max(0, course.price - Number(formData.initialPaid)) : 0,
            dueDate: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
            date: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
            status: Number(formData.initialPaid) >= (course?.price || 0) ? "Paid" : "Partial",
            method: 'Naqd',
            cashier: 'Kassa'
          });
        }, 100);
      }
    }
    
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setFormErrors({});
    setFormData({
      name: '',
      gender: 'Erkak',
      phone: '',
      dob: '',
      address: '',
      parentName: '',
      parentPhone: '',
      relationship: 'Otasi',
      courseId: db.courses[0]?.id || '',
      groupId: db.groups[0]?.id || '',
      teacherId: db.groups[0]?.teacherId || '',
      status: 'Active',
      branchId: selectedBranch === 'all' ? (db.branches[0]?.id || '') : selectedBranch,
      initialPaid: 0
    });
  };

  const openEditModal = (student) => {
    setActiveStudentId(student.id);
    setFormData({
      name: student.name,
      gender: student.gender,
      phone: student.phone,
      dob: student.dob,
      address: student.address,
      parentName: student.parent?.name || '',
      parentPhone: student.parent?.phone || '',
      relationship: student.parent?.relationship || 'Otasi',
      courseId: student.courseId,
      groupId: student.groupId,
      teacherId: student.teacherId,
      status: student.status,
      branchId: student.branchId,
      initialPaid: 0
    });
    setStep(1);
    setIsEditModalOpen(true);
  };

  const openDeleteConfirm = (id) => {
    setActiveStudentId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteStudent(activeStudentId);
    setIsDeleteOpen(false);
  };

  // CSV Export simulator
  const handleExportCSV = () => {
    const headers = ["ID", "F.I.SH.", "Telefon", "Ota-onasi", "Kurs", "Guruh", "Status", "Balans", "Qo'shilgan sana"];
    const rows = filteredStudents.map(s => [
      s.id,
      s.name,
      s.phone,
      `${s.parent?.name || ''} (${s.parent?.relationship || ''})`,
      db.courses.find(c => c.id === s.courseId)?.name || '',
      db.groups.find(g => g.id === s.groupId)?.name || '',
      s.status,
      s.balance,
      s.joinedDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `o_quvchilar_hisoboti_${new Date().toLocaleDateString('uz-UZ')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Checkbox row toggler
  const handleRowSelect = (id) => {
    setSelectedRowIds(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleAllRowsSelect = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(paginatedStudents.map(s => s.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  // Bulk actions processor
  const handleBulkActionExecute = (action) => {
    if (selectedRowIds.length === 0) {
      alert("Hech qaysi o'quvchi tanlanmagan!");
      setBulkAction('');
      return;
    }

    if (action === 'delete') {
      if (confirm(`Haqiqatan ham tanlangan ${selectedRowIds.length} ta o'quvchini tizimdan butunlay o'chirmoqchimisiz?`)) {
        selectedRowIds.forEach(id => deleteStudent(id));
        setSelectedRowIds([]);
      }
    } else if (action === 'group') {
      setShowBulkGroupModal(true);
    } else if (action === 'status_active') {
      selectedRowIds.forEach(id => {
        const std = db.students.find(s => s.id === id);
        if (std) updateStudent(id, { ...std, status: 'Active' });
      });
      setSelectedRowIds([]);
      alert("O'quvchilar statusi 'Faol' qilib belgilandi.");
    } else if (action === 'status_paused') {
      selectedRowIds.forEach(id => {
        const std = db.students.find(s => s.id === id);
        if (std) updateStudent(id, { ...std, status: 'Paused' });
      });
      setSelectedRowIds([]);
      alert("O'quvchilar statusi 'Muzlatilgan' qilib belgilandi.");
    }
    setBulkAction('');
  };

  const executeBulkGroupChange = () => {
    if (!bulkTargetGroupId) return;
    const targetGroup = db.groups.find(g => g.id === bulkTargetGroupId);
    
    selectedRowIds.forEach(id => {
      const std = db.students.find(s => s.id === id);
      if (std) {
        updateStudent(id, { 
          ...std, 
          groupId: bulkTargetGroupId, 
          courseId: targetGroup.courseId,
          teacherId: targetGroup.teacherId
        });
      }
    });

    setSelectedRowIds([]);
    setShowBulkGroupModal(false);
    setBulkTargetGroupId('');
    alert("O'quvchilar guruhi muvaffaqiyatli o'zgartirildi.");
  };

  // Filter & Search Logic
  const filteredStudents = db.students.filter(student => {
    // 1. Branch filter
    if (selectedBranch !== 'all' && student.branchId !== selectedBranch) return false;
    
    // 2. Course filter
    if (courseFilter !== 'all' && student.courseId !== courseFilter) return false;
    
    // 3. Group filter
    if (groupFilter !== 'all' && student.groupId !== groupFilter) return false;
    
    // 4. Status filter
    if (statusFilter !== 'all' && student.status !== statusFilter) return false;
    
    // 5. Search filter
    const query = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.phone.includes(query) ||
      student.id.toLowerCase().includes(query)
    );
  });

  // Pagination Logic
  const totalItems = filteredStudents.length;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="success" dot>Faol</Badge>;
      case 'Paused': return <Badge variant="warning" dot>Muzlatilgan</Badge>;
      case 'Completed': return <Badge variant="primary" dot>Tugatgan</Badge>;
      case 'Dropped': return <Badge variant="danger" dot>Tashlab ketgan</Badge>;
      case 'Graduated': return <Badge variant="success" dot>Bitirgan</Badge>;
      case 'Trial': return <Badge variant="info" dot>Sinov darsi</Badge>;
      case 'Lead': return <Badge variant="secondary" dot>Qiziqqan</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Pre-load select options
  const courseOptions = [
    { value: 'all', label: 'Barcha kurslar' },
    ...db.courses.map(c => ({ value: c.id, label: c.name }))
  ];

  const groupOptions = [
    { value: 'all', label: 'Barcha guruhlar' },
    ...db.groups.map(g => ({ value: g.id, label: g.name }))
  ];

  const statusOptions = [
    { value: 'all', label: 'Barcha statuslar' },
    { value: 'Active', label: 'Faol' },
    { value: 'Paused', label: 'Muzlatilgan' },
    { value: 'Completed', label: 'Tugatgan' },
    { value: 'Dropped', label: 'Tashlab ketgan' },
    { value: 'Graduated', label: 'Bitirgan' },
    { value: 'Trial', label: 'Sinov darsi' }
  ];

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 className="page-title">O'quvchilar</h1>
          <p className="page-subtitle">Markazdagi o'quvchilar ro'yxati, guruhlari va hisobotlari</p>
        </div>
        <div className="page-header-actions">
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>Eksport (CSV)</Button>
          <Button variant="primary" icon={Plus} onClick={() => { resetForm(); setIsAddModalOpen(true); }}>Yangi O'quvchi</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <SearchInput 
          placeholder="O'quvchi F.I.SH., ID yoki tel raqami bo'yicha qidirish..." 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <div className="filter-item">
          <Select 
            value={courseFilter} 
            onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }} 
            options={courseOptions} 
          />
        </div>
        <div className="filter-item">
          <Select 
            value={groupFilter} 
            onChange={(e) => { setGroupFilter(e.target.value); setCurrentPage(1); }} 
            options={groupOptions} 
          />
        </div>
        <div className="filter-item">
          <Select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
            options={statusOptions} 
          />
        </div>
      </div>

      {/* Bulk actions options bar */}
      {selectedRowIds.length > 0 && (
        <div className="fade-in" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          backgroundColor: 'var(--color-primary-light)',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            Tanlandi: {selectedRowIds.length} ta o'quvchi
          </span>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <Select 
              value={bulkAction} 
              onChange={(e) => { setBulkAction(e.target.value); handleBulkActionExecute(e.target.value); }}
              options={[
                { value: '', label: 'Guruhli amallar...' },
                { value: 'group', label: 'Guruhini o\'zgartirish' },
                { value: 'status_active', label: 'Faol rejimga o\'tkazish' },
                { value: 'status_paused', label: 'Muzlatish rejimiga o\'tkazish' },
                { value: 'delete', label: 'Butunlay o\'chirish (Danger)' }
              ]} 
              style={{ marginBottom: 0, padding: '6px 12px' }}
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      {paginatedStudents.length === 0 ? (
        <EmptyState 
          title="O'quvchilar topilmadi" 
          description="Kiritilgan qidiruv yoki filtr mezonlariga mos keladigan o'quvchilar bazada mavjud emas."
          actionLabel="Yangi o'quvchi qo'shish"
          onAction={() => { resetForm(); setIsAddModalOpen(true); }}
        />
      ) : (
        <div className="table-container">
          <Table headers={[
            { label: <input type="checkbox" onChange={handleAllRowsSelect} checked={selectedRowIds.length === paginatedStudents.length} />, width: '40px' },
            { label: 'O\'quvchi' },
            { label: 'Telefon' },
            { label: 'Ota-ona' },
            { label: 'Kurs / Guruh' },
            { label: 'Holati' },
            { label: 'Balans' },
            { label: 'Qatnashuv' },
            { label: 'Amallar', width: '120px' }
          ]}>
            {paginatedStudents.map(student => {
              const grp = db.groups.find(g => g.id === student.groupId);
              const course = db.courses.find(c => c.id === student.courseId);
              
              const isSelected = selectedRowIds.includes(student.id);
              const isDebt = student.balance < 0;

              return (
                <tr key={student.id} className={isSelected ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleRowSelect(student.id)} 
                    />
                  </td>
                  <td>
                    <div className="d-flex align-center gap-3">
                      <img 
                        src={student.avatar} 
                        alt={student.name} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }} 
                      />
                      <div className="d-flex flex-column">
                        <span style={{ fontWeight: '700', color: 'var(--color-text)' }}>{student.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>ID: {student.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: '500' }}>{student.phone}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <span style={{ fontSize: '12.5px', fontWeight: '600' }}>{student.parent?.name || '-'}</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--color-text-light)' }}>{student.parent?.relationship || ''}: {student.parent?.phone || ''}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span style={{ fontSize: '12.5px', fontWeight: '700' }}>{course ? course.name : '-'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '600' }}>{grp ? grp.name : 'Guruhsiz'}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(student.status)}</td>
                  <td style={{ 
                    fontWeight: '700', 
                    color: isDebt ? 'var(--color-danger)' : 'var(--color-success)'
                  }}>
                    {student.balance.toLocaleString()} so'm
                  </td>
                  <td>
                    <div className="d-flex align-center gap-2">
                      <div style={{
                        width: '40px',
                        height: '6px',
                        backgroundColor: 'var(--color-border)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${student.attendancePercentage}%`,
                          height: '100%',
                          backgroundColor: student.attendancePercentage > 85 ? 'var(--color-success)' : (student.attendancePercentage > 70 ? 'var(--color-warning)' : 'var(--color-danger)')
                        }} />
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: '700' }}>{student.attendancePercentage}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon text-primary" onClick={() => navigate(`/students/${student.id}`)} title="Ko'rish">
                        <Eye size={14} />
                      </button>
                      <button className="btn-icon text-warning" onClick={() => openEditModal(student)} title="Tahrirlash">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-icon text-danger" onClick={() => openDeleteConfirm(student.id)} title="O'chirish">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
          
          <Pagination 
            currentPage={currentPage} 
            totalItems={totalItems} 
            itemsPerPage={itemsPerPage} 
            onPageChange={(page) => setCurrentPage(page)} 
          />
        </div>
      )}

      {/* MULTI-STEP WIZARD ADD STUDENT MODAL */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title={isEditModalOpen ? "O'quvchini tahrirlash" : "Yangi o'quvchini ro'yxatga olish"}
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-4">
          
          {/* Step indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '14px',
            marginBottom: '10px'
          }}>
            {[
              { s: 1, label: 'Shaxsiy ma\'lumotlar' },
              { s: 2, label: 'Ota-ona ma\'lumotlari' },
              { s: 3, label: 'Kurs & Guruh' },
              { s: 4, label: 'To\'lov (Dastlabki)' },
              { s: 5, label: 'Tasdiqlash' }
            ].map(indicator => (
              <div key={indicator.s} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                opacity: step >= indicator.s ? 1 : 0.4
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: step >= indicator.s ? 'var(--color-primary)' : 'var(--color-border)',
                  color: step >= indicator.s ? 'white' : 'var(--color-text-muted)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  {indicator.s}
                </div>
                <span className="header-role" style={{ fontSize: '10px', fontWeight: '600', textAlign: 'center' }}>
                  {indicator.label}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1: Personal info */}
          {step === 1 && (
            <div className="fade-in d-flex flex-column gap-3">
              <h3 style={{ fontSize: '15px' }}>Shaxsiy ma'lumotlar</h3>
              <Input 
                label="O'quvchi F.I.SH. (To'liq)" 
                placeholder="Masalan: Alisher Karimov" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={formErrors.name}
                required
              />
              <div className="grid grid-cols-2">
                <Select 
                  label="Jinsi" 
                  value={formData.gender} 
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  options={[
                    { value: 'Erkak', label: 'Erkak' },
                    { value: 'Ayol', label: 'Ayol' }
                  ]}
                  required
                />
                <Input 
                  label="Telefon raqami" 
                  placeholder="+998901234567" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={formErrors.phone}
                  required
                />
              </div>
              <div className="grid grid-cols-2">
                <Input 
                  label="Tug'ilgan sanasi" 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  error={formErrors.dob}
                  required
                />
                <Select 
                  label="Filial" 
                  value={formData.branchId} 
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  options={db.branches.map(b => ({ value: b.id, label: b.name }))}
                  required
                />
              </div>
              <Input 
                label="Yashash manzili" 
                placeholder="Toshkent shahar, Chilonzor tumani..." 
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={formErrors.address}
                required
              />
            </div>
          )}

          {/* STEP 2: Parent info */}
          {step === 2 && (
            <div className="fade-in d-flex flex-column gap-3">
              <h3 style={{ fontSize: '15px' }}>Ota-ona / Vasiy ma'lumotlari</h3>
              <Input 
                label="Ota-ona yoki vasiyning F.I.SH." 
                placeholder="Masalan: Eldor Karimov" 
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                error={formErrors.parentName}
                required
              />
              <div className="grid grid-cols-2">
                <Select 
                  label="Qarindoshlik aloqasi" 
                  value={formData.relationship} 
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  options={[
                    { value: 'Otasi', label: 'Otasi' },
                    { value: 'Onasi', label: 'Onasi' },
                    { value: 'Vasiy', label: 'Boshqa vasiy' }
                  ]}
                  required
                />
                <Input 
                  label="Vasiy telefon raqami" 
                  placeholder="+998909876543" 
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  error={formErrors.parentPhone}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: Course & Group selection */}
          {step === 3 && (
            <div className="fade-in d-flex flex-column gap-3">
              <h3 style={{ fontSize: '15px' }}>Kurs va guruhni tanlash</h3>
              
              <Select 
                label="Guruhni tanlang" 
                value={formData.groupId} 
                onChange={(e) => handleInputChange('groupId', e.target.value)}
                options={db.groups.filter(g => g.status === 'active').map(g => {
                  const course = db.courses.find(c => c.id === g.courseId);
                  const studentCount = db.students.filter(s => s.groupId === g.id && s.status === 'Active').length;
                  return {
                    value: g.id,
                    label: `${g.name} (${course?.name || ''}) - Bandlik: ${studentCount}/${g.capacity} xona: ${g.room}`
                  };
                })}
                required
              />

              <div className="grid grid-cols-2">
                <Select 
                  label="Kurs" 
                  value={formData.courseId} 
                  disabled
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  options={db.courses.map(c => ({ value: c.id, label: c.name }))}
                />
                <Select 
                  label="O'qituvchi" 
                  value={formData.teacherId} 
                  disabled
                  onChange={(e) => handleInputChange('teacherId', e.target.value)}
                  options={db.teachers.map(t => ({ value: t.id, label: t.name }))}
                />
              </div>

              <Select 
                label="Dastlabki statusi" 
                value={formData.status} 
                onChange={(e) => handleInputChange('status', e.target.value)}
                options={[
                  { value: 'Active', label: 'Faol (Darslarni boshlaydi)' },
                  { value: 'Trial', label: 'Sinov darsida' },
                  { value: 'Paused', label: 'Kutish ro\'yxatida' }
                ]}
                required
              />
            </div>
          )}

          {/* STEP 4: Initial Payment */}
          {step === 4 && (
            <div className="fade-in d-flex flex-column gap-3">
              <h3 style={{ fontSize: '15px' }}>Kassaga dastlabki to'lov (Majburiy emas)</h3>
              
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-secondary-light)',
                border: '1px solid var(--color-border)',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  Tanlangan kurs narxi: <span style={{ color: 'var(--color-primary)' }}>
                    {(db.courses.find(c => c.id === formData.courseId)?.price || 0).toLocaleString()} so'm
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                  Hozir to'lov qabul qilsangiz, avtomatik ravishda kassaga tushum bo'lib yoziladi va o'quvchi balansi yangilanadi.
                </div>
              </div>

              <Input 
                label="To'lov summasi (so'm)" 
                type="number" 
                placeholder="Masalan: 500000" 
                value={formData.initialPaid}
                onChange={(e) => handleInputChange('initialPaid', e.target.value)}
              />
            </div>
          )}

          {/* STEP 5: Confirmation page */}
          {step === 5 && (
            <div className="fade-in d-flex flex-column gap-3" style={{ fontSize: '13.5px' }}>
              <div style={{ textAlign: 'center', color: 'var(--color-success)', marginBottom: '10px' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 10px auto' }} />
                <h3 style={{ fontSize: '18px', color: 'var(--color-text)' }}>Barcha ma'lumotlar tayyor</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Ro'yxatga olishni tasdiqlang</p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
                backgroundColor: 'var(--color-secondary-light)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>O'quvchi F.I.SH.:</span>
                  <div style={{ fontWeight: 'bold' }}>{formData.name}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Telefon:</span>
                  <div style={{ fontWeight: 'bold' }}>{formData.phone}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Kurs:</span>
                  <div style={{ fontWeight: 'bold' }}>
                    {db.courses.find(c => c.id === formData.courseId)?.name}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Guruh:</span>
                  <div style={{ fontWeight: 'bold' }}>
                    {db.groups.find(g => g.id === formData.groupId)?.name}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Ota-onasi:</span>
                  <div style={{ fontWeight: 'bold' }}>{formData.parentName} ({formData.parentPhone})</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Kiritilgan to'lov:</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                    {Number(formData.initialPaid).toLocaleString()} so'm
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px'
          }}>
            {step > 1 ? (
              <Button variant="secondary" icon={ArrowLeft} onClick={handlePrevStep}>Orqaga</Button>
            ) : (
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Bekor qilish</Button>
            )}

            {step < 5 ? (
              <Button variant="primary" onClick={handleNextStep}>
                Keyingi <ArrowRight size={16} style={{ marginLeft: '6px' }} />
              </Button>
            ) : (
              <Button variant="success" onClick={handleFormSubmit}>
                Ro'yxatga olishni yakunlash
              </Button>
            )}
          </div>

        </div>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); resetForm(); }}
        title="O'quvchi ma'lumotlarini tahrirlash"
        maxWidth="lg"
      >
        <div className="d-flex flex-column gap-3">
          <Input 
            label="O'quvchi F.I.SH." 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
          <div className="grid grid-cols-2">
            <Input 
              label="Telefon raqami" 
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
            <Select 
              label="Jinsi" 
              value={formData.gender} 
              onChange={(e) => handleInputChange('gender', e.target.value)}
              options={[
                { value: 'Erkak', label: 'Erkak' },
                { value: 'Ayol', label: 'Ayol' }
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-2">
            <Input 
              label="Tug'ilgan sanasi" 
              type="date" 
              value={formData.dob}
              onChange={(e) => handleInputChange('dob', e.target.value)}
              required
            />
            <Select 
              label="Holati" 
              value={formData.status} 
              onChange={(e) => handleInputChange('status', e.target.value)}
              options={statusOptions.filter(o => o.value !== 'all')}
              required
            />
          </div>
          <div className="grid grid-cols-2">
            <Select 
              label="Filial" 
              value={formData.branchId} 
              onChange={(e) => handleInputChange('branchId', e.target.value)}
              options={db.branches.map(b => ({ value: b.id, label: b.name }))}
              required
            />
            <Select 
              label="Guruh" 
              value={formData.groupId} 
              onChange={(e) => handleInputChange('groupId', e.target.value)}
              options={db.groups.map(g => ({ value: g.id, label: g.name }))}
              required
            />
          </div>
          <Input 
            label="Yashash manzili" 
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
          />
          <h4 style={{ margin: '10px 0 2px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Vasiy ma'lumotlari</h4>
          <div className="grid grid-cols-2">
            <Input 
              label="Vasiy ismi" 
              value={formData.parentName}
              onChange={(e) => handleInputChange('parentName', e.target.value)}
              required
            />
            <Input 
              label="Vasiy telefoni" 
              value={formData.parentPhone}
              onChange={(e) => handleInputChange('parentPhone', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleFormSubmit}>Saqlash</Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* BULK CHANGE GROUP MODAL */}
      <Modal 
        isOpen={showBulkGroupModal} 
        onClose={() => setShowBulkGroupModal(false)}
        title="Guruhlarni ommaviy o'zgartirish"
        maxWidth="md"
      >
        <div className="d-flex flex-column gap-4">
          <p style={{ fontSize: '13px' }}>
            Tanlangan <strong>{selectedRowIds.length}</strong> ta o'quvchini qaysi guruhga o'tkazmoqchisiz?
          </p>
          <Select 
            label="Yangi guruh"
            value={bulkTargetGroupId}
            onChange={(e) => setBulkTargetGroupId(e.target.value)}
            options={[
              { value: '', label: 'Guruhni tanlang...' },
              ...db.groups.map(g => ({ value: g.id, label: `${g.name} (${db.courses.find(c => c.id === g.courseId)?.name})` }))
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" onClick={() => setShowBulkGroupModal(false)}>Bekor qilish</Button>
            <Button variant="primary" disabled={!bulkTargetGroupId} onClick={executeBulkGroupChange}>O'tkazish</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
