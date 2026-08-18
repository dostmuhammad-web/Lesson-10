// src/context/CRMContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDB, saveDB } from '../data/mockData';

const CRMContext = createContext();

export const CRMProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("crm_auth") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("crm_user");
      return savedUser ? JSON.parse(savedUser) : {
        id: "emp1",
        name: "Azizbek Rahimov",
        role: "Super Admin",
        phone: "+998909990001",
        email: "azizbek@crm.uz",
        branchId: "b1",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Azizbek+Rahimov"
      };
    } catch (e) {
      return null;
    }
  });
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [theme, setTheme] = useState("light");
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Load database on mount
  useEffect(() => {
    const data = getDB();
    setDb(data);
    
    // Set theme
    const savedTheme = data.settings?.theme || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load initial system notifications based on DB state (conflict and payment warning alerts)
    generateSystemNotifications(data);
    setLoading(false);
  }, []);

  // Save DB helper
  const updateDB = (newData) => {
    setDb(newData);
    saveDB(newData);
    // Refresh notifications after state updates to detect newly created conflicts/dues
    generateSystemNotifications(newData);
  };

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Close toast helper
  const closeToast = () => {
    setToast(null);
  };

  // Activity logger
  const logActivity = (message, database = db) => {
    const timestamp = new Date().toLocaleString('uz-UZ', { hour12: false }).replace(',', '');
    const newLog = { timestamp, message };
    const updatedLogs = [newLog, ...(database.activityLog || [])].slice(0, 50); // limit to 50
    return updatedLogs;
  };

  // Generate system-level notifications
  const generateSystemNotifications = (data) => {
    const list = [];
    
    // 1. Payment Overdue alerts
    const todayStr = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.');
    const today = new Date();
    
    data.payments.forEach(pay => {
      if (pay.status === 'Overdue') {
        list.push({
          id: `notif_pay_${pay.id}`,
          type: 'payment overdue',
          title: "Muddati o'tgan to'lov",
          message: `${pay.studentName}ning ${pay.courseName} uchun ${pay.remaining.toLocaleString()} so'm to'lov muddati o'tgan!`,
          date: todayStr,
          read: false
        });
      }
    });

    // 2. Group capacity alerts
    data.groups.forEach(g => {
      const studentCount = data.students.filter(s => s.groupId === g.id && s.status === 'Active').length;
      if (studentCount >= g.capacity) {
        list.push({
          id: `notif_grp_${g.id}`,
          type: 'group full',
          title: "Guruh to'lgan",
          message: `${g.name} guruhida bo'sh joy qolmadi! (Sig'im: ${g.capacity}/${g.capacity})`,
          date: todayStr,
          read: false
        });
      }
    });

    // 3. Inactive student alerts (3+ consecutive absences)
    const absenceCounts = {};
    // Sort attendance by date descending
    const sortedAttendance = [...data.attendance].sort((a, b) => {
      const partsA = a.date.split('.');
      const partsB = b.date.split('.');
      return new Date(partsB[2], partsB[1]-1, partsB[0]) - new Date(partsA[2], partsA[1]-1, partsA[0]);
    });

    // Count consecutive absences
    const studentsMap = {};
    sortedAttendance.forEach(att => {
      if (!studentsMap[att.studentId]) {
        studentsMap[att.studentId] = [];
      }
      studentsMap[att.studentId].push(att.status);
    });

    Object.keys(studentsMap).forEach(stdId => {
      const statuses = studentsMap[stdId];
      let consecutiveAbsences = 0;
      for (let s of statuses) {
        if (s === 'Absent') {
          consecutiveAbsences++;
        } else if (s === 'Present' || s === 'Late') {
          break; // break the consecutive chain
        }
      }
      if (consecutiveAbsences >= 3) {
        const std = data.students.find(s => s.id === stdId);
        if (std) {
          list.push({
            id: `notif_inactive_${stdId}`,
            type: 'attendance issue',
            title: "Inaktiv o'quvchi",
            message: `${std.name} ketma-ket ${consecutiveAbsences} ta darsga qatnashmadi!`,
            date: todayStr,
            read: false
          });
        }
      }
    });

    // 4. Schedule conflicts
    // Let's check for teacher schedule conflict
    // Since mock groups are on standard schedules (e.g. "Toq kunlar, 14:00 - 16:00"), let's find duplicate schedules for same teacher/room
    const teacherSchedules = {};
    const roomSchedules = {};
    
    data.groups.forEach(g => {
      if (g.status === 'active') {
        // Teacher checks
        const tKey = `${g.teacherId}_${g.schedule}`;
        if (!teacherSchedules[tKey]) {
          teacherSchedules[tKey] = [];
        }
        teacherSchedules[tKey].push(g);

        // Room checks
        const rKey = `${g.room}_${g.schedule}`;
        if (!roomSchedules[rKey]) {
          roomSchedules[rKey] = [];
        }
        roomSchedules[rKey].push(g);
      }
    });

    Object.keys(teacherSchedules).forEach(key => {
      if (teacherSchedules[key].length > 1) {
        const grps = teacherSchedules[key];
        const teacher = data.teachers.find(t => t.id === grps[0].teacherId);
        list.push({
          id: `notif_conf_t_${key}`,
          type: 'schedule conflict',
          title: "O'qituvchi jadvalida to'qnashuv",
          message: `${teacher ? teacher.name : 'O\'qituvchi'} bir vaqtning o'zida ${grps.map(g => g.name).join(' va ')} guruhlarida dars o'tishi belgilangan!`,
          date: todayStr,
          read: false
        });
      }
    });

    Object.keys(roomSchedules).forEach(key => {
      if (roomSchedules[key].length > 1) {
        const grps = roomSchedules[key];
        list.push({
          id: `notif_conf_r_${key}`,
          type: 'schedule conflict',
          title: "Xona bandligida to'qnashuv",
          message: `${grps[0].room} xonasi bir vaqtning o'zida ${grps.map(g => g.name).join(' va ')} guruhlari uchun band qilingan!`,
          date: todayStr,
          read: false
        });
      }
    });

    // Add manual / new notification cards if any from before
    setNotifications(list);
  };

  // Change active branch
  const changeBranch = (branchId) => {
    setSelectedBranch(branchId);
    showToast(`Filial o'zgartirildi`, 'info');
  };

  // Theme switch
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    
    const updated = {
      ...db,
      settings: {
        ...db.settings,
        theme: nextTheme
      }
    };
    updateDB(updated);
    showToast(`Mavzu: ${nextTheme === 'light' ? 'Yorug\'' : 'Qorong\'u'} rejimga o'tkazildi`, 'info');
  };

  // --- CRUD OPERATIONS ---
  
  // Students CRUD
  const addStudent = (studentData) => {
    const id = `std${String(db.students.length + 1).padStart(3, '0')}`;
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${studentData.name.replace(/\s+/g, '+')}`;
    const newStudent = {
      id,
      avatar,
      balance: 0,
      attendancePercentage: 100,
      joinedDate: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
      ...studentData
    };

    const newLogs = logActivity(`Yangi o'quvchi qo'shildi: ${newStudent.name}`);
    const updated = {
      ...db,
      students: [newStudent, ...db.students],
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`O'quvchi muvaffaqiyatli qo'shildi: ${newStudent.name}`, 'success');
  };

  const updateStudent = (id, studentData) => {
    const newLogs = logActivity(`O'quvchi ma'lumotlari tahrirlandi: ${studentData.name}`);
    const updated = {
      ...db,
      students: db.students.map(s => s.id === id ? { ...s, ...studentData } : s),
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`O'quvchi ma'lumotlari yangilandi`, 'success');
  };

  const deleteStudent = (id) => {
    const std = db.students.find(s => s.id === id);
    const newLogs = logActivity(`O'quvchi tizimdan o'chirildi: ${std ? std.name : id}`);
    const updated = {
      ...db,
      students: db.students.filter(s => s.id !== id),
      payments: db.payments.filter(p => p.studentId !== id),
      attendance: db.attendance.filter(a => a.studentId !== id),
      grades: db.grades.filter(g => g.studentId !== id),
      assignments: db.assignments.filter(a => a.studentId !== id),
      exams: db.exams.filter(e => e.studentId !== id),
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`O'quvchi o'chirildi`, 'warning');
  };

  // Leads CRM CRUD
  const addLead = (leadData) => {
    const id = `lead${String(db.leads.length + 1).padStart(3, '0')}`;
    const newLead = {
      id,
      createdDate: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
      status: 'New',
      ...leadData
    };
    const newLogs = logActivity(`Yangi lead ro'yxatga olindi: ${newLead.name}`);
    const updated = {
      ...db,
      leads: [newLead, ...db.leads],
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`Yangi lead muvaffaqiyatli qo'shildi`, 'success');
  };

  const updateLead = (id, leadData) => {
    const updated = {
      ...db,
      leads: db.leads.map(l => l.id === id ? { ...l, ...leadData } : l)
    };
    updateDB(updated);
    showToast(`Lead ma'lumotlari yangilandi`, 'success');
  };

  const moveLead = (id, newStatus) => {
    const lead = db.leads.find(l => l.id === id);
    const newLogs = logActivity(`Lead statusi o'zgardi: ${lead ? lead.name : id} -> ${newStatus}`);
    
    // Business logic: if enrolled, automatically offer adding to students!
    const updated = {
      ...db,
      leads: db.leads.map(l => l.id === id ? { ...l, status: newStatus } : l),
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`Lead statusi yangilandi: ${newStatus}`, 'info');
  };

  const deleteLead = (id) => {
    const updated = {
      ...db,
      leads: db.leads.filter(l => l.id !== id)
    };
    updateDB(updated);
    showToast(`Lead o'chirildi`, 'warning');
  };

  // Groups CRUD
  const addGroup = (groupData) => {
    const id = `g${String(db.groups.length + 1).padStart(2, '0')}`;
    const newGroup = {
      id,
      status: 'active',
      ...groupData
    };
    const newLogs = logActivity(`Yangi guruh ochildi: ${newGroup.name}`);
    const updated = {
      ...db,
      groups: [...db.groups, newGroup],
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`Yangi guruh muvaffaqiyatli ochildi: ${newGroup.name}`, 'success');
  };

  const updateGroup = (id, groupData) => {
    const updated = {
      ...db,
      groups: db.groups.map(g => g.id === id ? { ...g, ...groupData } : g)
    };
    updateDB(updated);
    showToast(`Guruh ma'lumotlari yangilandi`, 'success');
  };

  const deleteGroup = (id) => {
    const grp = db.groups.find(g => g.id === id);
    const newLogs = logActivity(`Guruh o'chirildi: ${grp ? grp.name : id}`);
    const updated = {
      ...db,
      groups: db.groups.filter(g => g.id !== id),
      students: db.students.map(s => s.groupId === id ? { ...s, groupId: '', status: 'Paused' } : s),
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`Guruh o'chirildi. Ushbu guruh o'quvchilari "Kutish" rejimiga o'tkazildi`, 'warning');
  };

  // Payments CRUD
  const addPayment = (paymentData) => {
    const id = `INV-${1000 + db.payments.length + 1}`;
    const student = db.students.find(s => s.id === paymentData.studentId);
    const course = db.courses.find(c => c.id === student?.courseId);
    
    const amount = Number(paymentData.amount || course?.price || 0);
    const paid = Number(paymentData.paid || 0);
    const remaining = amount - paid;
    const status = remaining === 0 ? "Paid" : (paid > 0 ? "Partial" : "Overdue");

    const newPayment = {
      id,
      studentName: student ? student.name : 'Noma\'lum',
      courseName: course ? course.name : 'Noma\'lum',
      amount,
      paid,
      remaining,
      dueDate: paymentData.dueDate || new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
      date: paid > 0 ? new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.') : null,
      status,
      method: paymentData.method || 'Naqd',
      cashier: currentUser.name,
      ...paymentData
    };

    // Update student balance
    // Positive balance = pre-paid, negative = debt
    // If student pays more, balance increases. If student pays less, balance decreases.
    // In our context: student.balance represents debt (if negative). So we add the paid amount to their balance.
    const updatedStudents = db.students.map(s => {
      if (s.id === paymentData.studentId) {
        return {
          ...s,
          balance: s.balance + paid - amount // net balance change
        };
      }
      return s;
    });

    const newLogs = logActivity(`To'lov qabul qilindi: ${newPayment.studentName} - ${paid.toLocaleString()} so'm`);
    const updated = {
      ...db,
      payments: [newPayment, ...db.payments],
      students: updatedStudents,
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`To'lov muvaffaqiyatli saqlandi`, 'success');
  };

  const deletePayment = (id) => {
    const updated = {
      ...db,
      payments: db.payments.filter(p => p.id !== id)
    };
    updateDB(updated);
    showToast(`To'lov o'chirildi`, 'warning');
  };

  // Expenses CRUD
  const addExpense = (expenseData) => {
    const id = `exp${db.expenses.length + 1}`;
    const newExpense = {
      id,
      date: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
      responsiblePerson: currentUser.name,
      ...expenseData,
      amount: Number(expenseData.amount)
    };
    const newLogs = logActivity(`Xarajat kiritildi: ${newExpense.title} - ${newExpense.amount.toLocaleString()} so'm`);
    const updated = {
      ...db,
      expenses: [newExpense, ...db.expenses],
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`Xarajat kiritildi`, 'success');
  };

  const deleteExpense = (id) => {
    const updated = {
      ...db,
      expenses: db.expenses.filter(e => e.id !== id)
    };
    updateDB(updated);
    showToast(`Xarajat o'chirildi`, 'warning');
  };

  // Attendance Tracker
  const saveAttendance = (groupId, date, list) => {
    // List is an array of { studentId, studentName, status }
    // Clean old records for this group and date first
    const cleanAttendance = db.attendance.filter(a => !(a.groupId === groupId && a.date === date));
    
    const newRecords = list.map(item => ({
      id: `att_${groupId}_${item.studentId}_${date.replace(/\./g, '')}`,
      groupId,
      groupName: db.groups.find(g => g.id === groupId)?.name || 'Guruh',
      studentId: item.studentId,
      studentName: item.studentName,
      date,
      status: item.status,
      markedBy: currentUser.name
    }));

    // Update students average attendance percentage
    const updatedStudents = db.students.map(s => {
      const studentRecords = [...cleanAttendance, ...newRecords].filter(a => a.studentId === s.id);
      if (studentRecords.length === 0) return s;
      const presentCount = studentRecords.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Excused').length;
      const percentage = Math.round((presentCount / studentRecords.length) * 100);
      return { ...s, attendancePercentage: percentage };
    });

    const newLogs = logActivity(`Davomat saqlandi: ${db.groups.find(g => g.id === groupId)?.name} - ${date}`);
    const updated = {
      ...db,
      attendance: [...newRecords, ...cleanAttendance],
      students: updatedStudents,
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`Davomat muvaffaqiyatli saqlandi`, 'success');
  };

  // Teacher CRU
  const addTeacher = (teacherData) => {
    const id = `t${db.teachers.length + 1}`;
    const newTeacher = {
      id,
      rating: 5.0,
      bonus: 0,
      ...teacherData,
      salary: Number(teacherData.salary)
    };
    const newLogs = logActivity(`Yangi o'qituvchi yollindi: ${newTeacher.name}`);
    const updated = {
      ...db,
      teachers: [...db.teachers, newTeacher],
      activityLog: newLogs
    };
    updateDB(updated);
    showToast(`O'qituvchi muvaffaqiyatli qo'shildi`, 'success');
  };

  const updateTeacher = (id, teacherData) => {
    const updated = {
      ...db,
      teachers: db.teachers.map(t => t.id === id ? { ...t, ...teacherData } : t)
    };
    updateDB(updated);
    showToast(`O'qituvchi ma'lumotlari yangilandi`, 'success');
  };

  const deleteTeacher = (id) => {
    const updated = {
      ...db,
      teachers: db.teachers.filter(t => t.id !== id)
    };
    updateDB(updated);
    showToast(`O'qituvchi o'chirildi`, 'warning');
  };

  // Courses CRU
  const addCourse = (courseData) => {
    const id = `c${db.courses.length + 1}`;
    const newCourse = {
      id,
      status: 'active',
      ...courseData,
      price: Number(courseData.price)
    };
    const updated = {
      ...db,
      courses: [...db.courses, newCourse]
    };
    updateDB(updated);
    showToast(`Yangi kurs qo'shildi`, 'success');
  };

  const updateCourse = (id, courseData) => {
    const updated = {
      ...db,
      courses: db.courses.map(c => c.id === id ? { ...c, ...courseData } : c)
    };
    updateDB(updated);
    showToast(`Kurs yangilandi`, 'success');
  };

  // Trials CRU
  const addTrial = (trialData) => {
    const id = `trial${db.trials.length + 1}`;
    const newTrial = {
      id,
      status: 'Scheduled',
      ...trialData
    };
    const updated = {
      ...db,
      trials: [...db.trials, newTrial]
    };
    updateDB(updated);
    showToast(`Sinov darsi muvaffaqiyatli belgilandi`, 'success');
  };

  const updateTrialStatus = (id, status, result) => {
    const updated = {
      ...db,
      trials: db.trials.map(t => t.id === id ? { ...t, status, result } : t)
    };
    updateDB(updated);
    showToast(`Sinov darsi natijasi saqlandi`, 'success');
  };

  // Grades, Assignments, Exams
  const addGrade = (gradeData) => {
    const id = `grd_${db.grades.length + 1}`;
    const newGrade = {
      id,
      date: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
      ...gradeData,
      score: Number(gradeData.score)
    };
    const updated = {
      ...db,
      grades: [newGrade, ...db.grades]
    };
    updateDB(updated);
    showToast(`Baholandi`, 'success');
  };

  const addAssignment = (assignmentData) => {
    const id = `asm_${db.assignments.length + 1}`;
    const newAsm = {
      id,
      status: 'Not submitted',
      feedback: '',
      ...assignmentData
    };
    const updated = {
      ...db,
      assignments: [newAsm, ...db.assignments]
    };
    updateDB(updated);
    showToast(`Vazifa yuborildi`, 'success');
  };

  const addExam = (examData) => {
    const id = `ex_${db.exams.length + 1}`;
    const newExam = {
      id,
      date: new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.'),
      ...examData,
      score: Number(examData.score)
    };
    const updated = {
      ...db,
      exams: [newExam, ...db.exams]
    };
    updateDB(updated);
    showToast(`Imtihon natijasi kiritildi`, 'success');
  };

  // Employees CRUD
  const addEmployee = (empData) => {
    const id = `emp${db.employees.length + 1}`;
    const newEmp = {
      id,
      active: true,
      ...empData
    };
    const updated = {
      ...db,
      employees: [...db.employees, newEmp]
    };
    updateDB(updated);
    showToast(`Xodim qo'shildi`, 'success');
  };

  const updateEmployee = (id, empData) => {
    const updated = {
      ...db,
      employees: db.employees.map(e => e.id === id ? { ...e, ...empData } : e)
    };
    updateDB(updated);
    showToast(`Xodim yangilandi`, 'success');
  };

  // Settings
  const saveSettings = (newSettings) => {
    const updated = {
      ...db,
      settings: {
        ...db.settings,
        ...newSettings
      }
    };
    updateDB(updated);
    showToast(`Tizim sozlamalari saqlandi`, 'success');
  };

  // Simulated Authentication
  const login = (role) => {
    const matchingEmp = db?.employees?.find(e => e.role === role && e.active !== false);
    const userObj = {
      id: matchingEmp?.id || `emp_${role.toLowerCase()}`,
      name: matchingEmp?.name || `Xodim (${role})`,
      role,
      phone: matchingEmp?.phone || "+998901234567",
      email: matchingEmp?.email || `${role.toLowerCase()}@crm.uz`,
      branchId: matchingEmp?.branchId || "b1",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${(matchingEmp?.name || role).replace(/\s+/g, '+')}`
    };

    setCurrentUser(userObj);
    setIsAuthenticated(true);
    localStorage.setItem("crm_auth", "true");
    localStorage.setItem("crm_user", JSON.stringify(userObj));
    showToast(`Xush kelibsiz, ${userObj.name}!`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("crm_auth");
    localStorage.removeItem("crm_user");
    showToast("Tizimdan chiqdingiz.", 'info');
  };

  return (
    <CRMContext.Provider value={{
      db,
      loading,
      isAuthenticated,
      currentUser,
      login,
      logout,
      changeUserRole: (role) => {
        const matchingEmp = db.employees.find(e => e.role === role);
        const newUser = {
          id: matchingEmp?.id || "temp",
          name: matchingEmp?.name || `Foydalanuvchi (${role})`,
          role,
          phone: matchingEmp?.phone || "+998901234567",
          email: matchingEmp?.email || "role@crm.uz",
          branchId: matchingEmp?.branchId || "b1",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${(matchingEmp?.name || role).replace(/\s+/g, '+')}`
        };
        setCurrentUser(newUser);
        localStorage.setItem("crm_user", JSON.stringify(newUser));
        showToast(`Rol o'zgartirildi: ${role}`, 'info');
      },
      selectedBranch,
      changeBranch,
      theme,
      toggleTheme,
      toast,
      showToast,
      closeToast,
      notifications,
      markNotificationRead: (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      },
      markAllNotificationsRead: () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      },
      
      // Data operations
      addStudent,
      updateStudent,
      deleteStudent,
      addLead,
      updateLead,
      moveLead,
      deleteLead,
      addGroup,
      updateGroup,
      deleteGroup,
      addPayment,
      deletePayment,
      addExpense,
      deleteExpense,
      saveAttendance,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addCourse,
      updateCourse,
      addTrial,
      updateTrialStatus,
      addGrade,
      addAssignment,
      addExam,
      addEmployee,
      updateEmployee,
      saveSettings
    }}>
      {!loading && children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => useContext(CRMContext);
