// mockData.js
// Procedural mock data generator for Uzbek Learning Center CRM

const UZ_NAMES = [
  "Alisher", "Aziz", "Madina", "Shahzoda", "Doston", "Jasur", "Nigora", "Zilola", "Bekzod", "Sardor",
  "Lola", "Ruxshona", "Abdurahmon", "Shohruh", "Kamola", "Farrux", "Nozima", "Javohir", "Dilshod", "Malika",
  "Otabek", "Sirojiddin", "Shaxzod", "Rayhona", "Gulnoza", "Sanjar", "Mirjalol", "Sevara", "Nilufar", "Bobur",
  "Jur'at", "Rustam", "Temur", "Sitora", "Asal", "Begali", "Sherzod", "Muzaffar", "Umida", "Shoira",
  "Akmal", "Sardorbek", "Zuhra", "Tohir", "Feruza", "Kozim", "Davron", "Jamshid", "Ziyoda", "Lobar"
];

const UZ_SURNAMES = [
  "Karimov", "Rahimov", "Umarov", "Qodirov", "Aliyev", "Rustamov", "Tojiyev", "Orifov", "Sultonov", "Hasanov",
  "Usmonov", "Elmurodov", "Mahmudov", "Tursunov", "G'ofurov", "Ismoilov", "Axmedov", "Solihov", "Yusupov", "Eshonov",
  "Hamroyev", "Nabiyev", "Mirzayev", "Hakimov", "Botirov", "Eshmurodov", "Shermatov", "Xalilov", "Zokirov", "Abduvaliyev"
];

const PARENT_NAMES = [
  "Eldor", "Ulug'bek", "Sobir", "G'ayrat", "Salim", "Mansur", "Olim", "Otabek", "Farhod", "Tolib",
  "Dilorom", "Ra'no", "Mavluda", "Shohida", "Barno", "Adolat", "Nasiba", "Zulxumor", "Klara", "Munira"
];

const SOURCES = [
  "Instagram", "Telegram", "Facebook", "Website", "Tavsiya", "Telefon orqali", "Tashrif buyurdi", "Reklama", "Boshqa"
];

const COURSES_DATA = [
  { id: "c1", name: "IELTS", category: "Ingliz tili", duration: "3 oy", price: 800000, status: "active", desc: "IELTS imtihoniga tayyorlov kursi (7+ ball kafolati)." },
  { id: "c2", name: "General English", category: "Ingliz tili", duration: "4 oy", price: 600000, status: "active", desc: "Ingliz tili grammatikasi va so'zlashuv kursi." },
  { id: "c3", name: "Kids English", category: "Ingliz tili", duration: "6 oy", price: 450000, status: "active", desc: "Bolalar uchun ingliz tili darslari (o'yinlar orqali)." },
  { id: "c4", name: "CEFR B2/C1", category: "Ingliz tili", duration: "3 oy", price: 700000, status: "active", desc: "Milliy sertifikat (CEFR) tayyorlov kursi." },
  { id: "c5", name: "Matematika", category: "Aniq fanlar", duration: "9 oy", price: 500000, status: "active", desc: "DTM va maktab dasturi bo'yicha matematika kursi." },
  { id: "c6", name: "Fizika", category: "Aniq fanlar", duration: "9 oy", price: 500000, status: "active", desc: "DTM imtihonlariga fizika fanidan tayyorgarlik." },
  { id: "c7", name: "Frontend Web Dasturlash", category: "IT", duration: "6 oy", price: 1200000, status: "active", desc: "HTML, CSS, JS, React bo'yicha professional kurs." },
  { id: "c8", name: "Backend Web Dasturlash", category: "IT", duration: "6 oy", price: 1200000, status: "active", desc: "Node.js, Express, MongoDB va SQL bo'yicha kurs." },
  { id: "c9", name: "Grafik Dizayn", category: "IT", duration: "4 oy", price: 1000000, status: "active", desc: "Photoshop, Illustrator, Figma dasturlarida ishlash." },
  { id: "c10", name: "Ona tili va Adabiyot", category: "Gumanitar", duration: "9 oy", price: 400000, status: "active", desc: "Ona tili va adabiyot fanidan chuqurlashtirilgan kurs." }
];

const TEACHERS_DATA = [
  { id: "t1", name: "Sardor Axmedov", phone: "+998901234501", email: "sardor@crm.uz", specialization: "IELTS / CEFR", experience: "5 yil", salary: 5000000, bonus: 500000, rating: 4.9 },
  { id: "t2", name: "Umida Yo'ldosheva", phone: "+998901234502", email: "umida@crm.uz", specialization: "General English", experience: "4 oy", salary: 4000000, bonus: 300000, rating: 4.8 },
  { id: "t3", name: "Jahongir Rustamov", phone: "+998901234503", email: "jahongir@crm.uz", specialization: "Frontend Web", experience: "6 yil", salary: 8000000, bonus: 1000000, rating: 4.95 },
  { id: "t4", name: "Nilufar Tojiyeva", phone: "+998901234504", email: "nilufar@crm.uz", specialization: "Kids English", experience: "3 yil", salary: 3500000, bonus: 200000, rating: 4.7 },
  { id: "t5", name: "Rustam Orifov", phone: "+998901234505", email: "rustam@crm.uz", specialization: "Matematika", experience: "8 yil", salary: 6000000, bonus: 800000, rating: 4.85 },
  { id: "t6", name: "Bekzod Aliyev", phone: "+998901234506", email: "bekzod@crm.uz", specialization: "Fizika", experience: "4 yil", salary: 5000000, bonus: 400000, rating: 4.6 },
  { id: "t7", name: "Odilbek Sultonov", phone: "+998901234507", email: "odilbek@crm.uz", specialization: "Backend Node.js", experience: "5 yil", salary: 9000000, bonus: 1200000, rating: 4.9 },
  { id: "t8", name: "Zebo Hasanova", phone: "+998901234508", email: "zebo@crm.uz", specialization: "Grafik Dizayn", experience: "3 yil", salary: 4500000, bonus: 300000, rating: 4.75 },
  { id: "t9", name: "Nigora Usmonova", phone: "+998901234509", email: "nigora@crm.uz", specialization: "Ona tili", experience: "7 yil", salary: 4000000, bonus: 200000, rating: 4.7 },
  { id: "t10", name: "Jasur Elmurodov", phone: "+998901234510", email: "jasur@crm.uz", specialization: "CEFR / IELTS", experience: "4 yil", salary: 4800000, bonus: 400000, rating: 4.8 }
];

const GROUPS_DATA = [
  { id: "g1", name: "IELTS-01", courseId: "c1", teacherId: "t1", room: "Mingo'rik xonasi", schedule: "Toq kunlar, 14:00 - 16:00", capacity: 20, status: "active" },
  { id: "g2", name: "IELTS-02 (Kechki)", courseId: "c1", teacherId: "t10", room: "Xadra xonasi", schedule: "Juft kunlar, 18:30 - 20:30", capacity: 20, status: "active" },
  { id: "g3", name: "Pre-IELTS 03", courseId: "c2", teacherId: "t2", room: "Amir Temur xonasi", schedule: "Toq kunlar, 09:00 - 11:00", capacity: 20, status: "active" },
  { id: "g4", name: "General English Inter-01", courseId: "c2", teacherId: "t2", room: "Chilonzor xonasi", schedule: "Juft kunlar, 14:00 - 16:00", capacity: 20, status: "active" },
  { id: "g5", name: "Kids English 01", courseId: "c3", teacherId: "t4", room: "Bolalar xonasi", schedule: "Toq kunlar, 16:30 - 18:00", capacity: 20, status: "active" },
  { id: "g6", name: "CEFR B2-01", courseId: "c4", teacherId: "t10", room: "Navoiy xonasi", schedule: "Juft kunlar, 16:30 - 18:30", capacity: 20, status: "active" },
  { id: "g7", name: "Matematika DTM 01", courseId: "c5", teacherId: "t5", room: "Samarqand xonasi", schedule: "Toq kunlar, 16:30 - 18:30", capacity: 20, status: "active" },
  { id: "g8", name: "Matematika Registan 02", courseId: "c5", teacherId: "t5", room: "Buxoro xonasi", schedule: "Juft kunlar, 14:00 - 16:00", capacity: 20, status: "active" },
  { id: "g9", name: "Fizika DTM 01", courseId: "c6", teacherId: "t6", room: "Xiva xonasi", schedule: "Toq kunlar, 14:00 - 16:00", capacity: 20, status: "active" },
  { id: "g10", name: "Fizika 02", courseId: "c6", teacherId: "t6", room: "Xiva xonasi", schedule: "Juft kunlar, 16:30 - 18:30", capacity: 20, status: "active" },
  { id: "g11", name: "Frontend React-01", courseId: "c7", teacherId: "t3", room: "IT Lab-1", schedule: "Toq kunlar, 19:00 - 21:00", capacity: 20, status: "active" },
  { id: "g12", name: "Frontend Web-02", courseId: "c7", teacherId: "t3", room: "IT Lab-1", schedule: "Juft kunlar, 16:30 - 18:30", capacity: 20, status: "active" },
  { id: "g13", name: "Backend Node-01", courseId: "c8", teacherId: "t7", room: "IT Lab-2", schedule: "Toq kunlar, 16:30 - 18:30", capacity: 20, status: "active" },
  { id: "g14", name: "Grafik Dizayn Figma-01", courseId: "c9", teacherId: "t8", room: "IT Lab-2", schedule: "Juft kunlar, 14:00 - 16:00", capacity: 20, status: "active" },
  { id: "g15", name: "Ona tili DTM 01", courseId: "c10", teacherId: "t9", room: "Amir Temur xonasi", schedule: "Juft kunlar, 16:30 - 18:30", capacity: 20, status: "active" }
];

const EMPLOYEES_DATA = [
  { id: "emp1", name: "Azizbek Rahimov", role: "Super Admin", phone: "+998909990001", email: "azizbek@crm.uz", branchId: "b1", active: true },
  { id: "emp2", name: "Dilshod Umarov", role: "Director", phone: "+998909990002", email: "dilshod@crm.uz", branchId: "b1", active: true },
  { id: "emp3", name: "Dostonbek Qodirov", role: "Manager", phone: "+998909990003", email: "dostonbek@crm.uz", branchId: "b1", active: true },
  { id: "emp4", name: "Kamola Aliyeva", role: "Manager", phone: "+998909990004", email: "kamola@crm.uz", branchId: "b2", active: true },
  { id: "emp5", name: "Shahnoza Karimova", role: "Cashier", phone: "+998909990005", email: "shahnoza@crm.uz", branchId: "b1", active: true },
  { id: "emp6", name: "Ziyoda Saidova", role: "Cashier", phone: "+998909990006", email: "ziyoda@crm.uz", branchId: "b2", active: true },
  { id: "emp7", name: "Nilufar Oripova", role: "Operator", phone: "+998909990007", email: "nilufar.op@crm.uz", branchId: "b3", active: true }
];

const BRANCHES_DATA = [
  { id: "b1", name: "Chilonzor filiali", address: "Chilonzor tumani, Qatortol ko'chasi, 24-uy", phone: "+998901112233", manager: "Dostonbek Qodirov", studentsCount: 22, groupsCount: 6 },
  { id: "b2", name: "Yunusobod filiali", address: "Yunusobod tumani, Amir Temur ko'chasi, 8-uy", phone: "+998902223344", manager: "Kamola Aliyeva", studentsCount: 18, groupsCount: 5 },
  { id: "b3", name: "Darxon filiali", address: "Mirzo Ulug'bek tumani, Mustaqillik shoh ko'chasi, 45-uy", phone: "+998903334455", manager: "Nilufar Oripova", studentsCount: 15, groupsCount: 4 }
];

const EXPENSES_DATA = [
  { id: "exp1", title: "Ofis ijarasi - Chilonzor", category: "Ijara", amount: 4500000, date: "05.08.2026", description: "Chilonzor filiali ijara to'lovi", responsiblePerson: "Dilshod Umarov" },
  { id: "exp2", title: "O'qituvchilar oyligi (Sardor)", category: "Oylik", amount: 5500000, date: "10.08.2026", description: "Iyul oyi oyligi va bonus", responsiblePerson: "Shahnoza Karimova" },
  { id: "exp3", title: "Flayer va posterlar", category: "Marketing", amount: 1200000, date: "12.08.2026", description: "Yangi mavsum uchun reklama", responsiblePerson: "Dostonbek Qodirov" },
  { id: "exp4", title: "Kompyuter ta'miri", category: "Jihozlar", amount: 800000, date: "14.08.2026", description: "IT xonadagi 2 ta monitor almashtirildi", responsiblePerson: "Jahongir Rustamov" },
  { id: "exp5", title: "Kommunal to'lovlar va Internet", category: "Kommunal", amount: 1500000, date: "15.08.2026", description: "Elektr, suv va 100Mbps internet", responsiblePerson: "Shahnoza Karimova" },
  { id: "exp6", title: "Ofis ijarasi - Yunusobod", category: "Ijara", amount: 4000000, date: "05.08.2026", description: "Yunusobod filiali ijara to'lovi", responsiblePerson: "Dilshod Umarov" }
];

// Helper to generate phone number
function genPhone() {
  const code = ["90", "91", "93", "94", "97", "99", "33", "88", "95"][Math.floor(Math.random() * 9)];
  let num = "";
  for (let i = 0; i < 7; i++) num += Math.floor(Math.random() * 10);
  return `+998${code}${num}`;
}

// Helper to generate a date relative to now
function genDateOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// Generate Students (55 Students)
function generateStudents() {
  const list = [];
  const statuses = ["Active", "Active", "Active", "Active", "Active", "Paused", "Completed", "Dropped", "Graduated", "Trial"];
  
  for (let i = 1; i <= 55; i++) {
    const nameIndex = (i - 1) % UZ_NAMES.length;
    const surnameIndex = (i * 7) % UZ_SURNAMES.length;
    const name = UZ_NAMES[nameIndex];
    const surname = UZ_SURNAMES[surnameIndex];
    const gender = ["Madina", "Shahzoda", "Nigora", "Zilola", "Lola", "Ruxshona", "Kamola", "Nozima", "Malika", "Rayhona", "Gulnoza", "Sevara", "Nilufar", "Sitora", "Asal", "Umida", "Shoira", "Zuhra", "Feruza", "Ziyoda", "Lobar"].includes(name) ? "Ayol" : "Erkak";
    
    // Assign random group
    const grp = GROUPS_DATA[(i * 3) % GROUPS_DATA.length];
    const course = COURSES_DATA.find(c => c.id === grp.courseId);
    const teacher = TEACHERS_DATA.find(t => t.id === grp.teacherId);
    
    const balance = (i % 7 === 0) ? -Math.floor((Math.random() * 2 + 1)) * 300000 : 0; // Negative means debt
    const status = (balance < 0) ? "Active" : statuses[i % statuses.length];
    
    list.push({
      id: `std${String(i).padStart(3, '0')}`,
      name: `${name} ${surname}`,
      gender,
      phone: genPhone(),
      dob: genDateOffset(Math.floor(Math.random() * 3000) + 5000), // ~14-22 years old
      address: `Toshkent shahar, ${["Chilonzor", "Yunusobod", "M.Ulug'bek", "Yashnobod", "Uchtepa", "Mirobod", "Olmazor"][i % 7]} tumani`,
      parent: {
        name: `${PARENT_NAMES[i % PARENT_NAMES.length]} ${surname}`,
        phone: genPhone(),
        relationship: gender === "Erkak" ? "Otasi" : "Onasi"
      },
      courseId: course.id,
      groupId: grp.id,
      teacherId: teacher.id,
      status,
      joinedDate: genDateOffset(Math.floor(Math.random() * 180) + 30),
      balance,
      branchId: BRANCHES_DATA[i % BRANCHES_DATA.length].id,
      attendancePercentage: Math.floor(Math.random() * 30) + 70, // 70% to 100%
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}+${surname}`
    });
  }
  return list;
}

// Generate Leads (32 Leads)
function generateLeads() {
  const list = [];
  const statuses = ["New", "Contacted", "Interested", "Trial booked", "Trial attended", "Negotiation", "Enrolled", "Lost"];
  const managers = ["Dostonbek Qodirov", "Kamola Aliyeva"];
  
  for (let i = 1; i <= 32; i++) {
    const nameIndex = (i * 2 + 5) % UZ_NAMES.length;
    const surnameIndex = (i * 3 + 12) % UZ_SURNAMES.length;
    const name = UZ_NAMES[nameIndex];
    const surname = UZ_SURNAMES[surnameIndex];
    
    const course = COURSES_DATA[i % COURSES_DATA.length];
    const status = statuses[i % statuses.length];
    
    list.push({
      id: `lead${String(i).padStart(3, '0')}`,
      name: `${name} ${surname}`,
      phone: genPhone(),
      interestedCourse: course.name,
      source: SOURCES[i % SOURCES.length],
      manager: managers[i % managers.length],
      status,
      createdDate: genDateOffset(Math.floor(Math.random() * 20) + 1),
      nextFollowUp: status !== "Enrolled" && status !== "Lost" ? genDateOffset(-Math.floor(Math.random() * 5) + 3) : null,
      notes: "Kurs haqida batafsil ma'lumot so'radi. Narxlarni aytib o'tdik."
    });
  }
  return list;
}

// Generate Trial Lessons (15 Trials)
function generateTrials(students) {
  const trials = [];
  const list = students.filter(s => s.status === "Trial" || s.status === "Active").slice(0, 15);
  const statuses = ["Scheduled", "Attended", "Missed", "Converted", "Cancelled"];
  
  list.forEach((std, index) => {
    const course = COURSES_DATA.find(c => c.id === std.courseId);
    const teacher = TEACHERS_DATA.find(t => t.id === std.teacherId);
    const grp = GROUPS_DATA.find(g => g.id === std.groupId);
    
    trials.push({
      id: `trial${index + 1}`,
      studentName: std.name,
      studentPhone: std.phone,
      courseName: course.name,
      teacherName: teacher.name,
      date: genDateOffset(Math.floor(Math.random() * 10) - 2), // past & future
      time: `${10 + (index % 5) * 2}:00`,
      room: grp.room,
      status: statuses[index % statuses.length],
      result: index % 3 === 0 ? "O'quvchi kursga yozildi." : "O'ylab ko'rmoqchi.",
      comment: "Sinov darsida faol qatnashdi."
    });
  });
  
  return trials;
}

// Generate Payments (60 Payments)
function generatePayments(students) {
  const list = [];
  const methods = ["Naqd", "Karta", "O'tkazma"];
  const statuses = ["Paid", "Paid", "Paid", "Paid", "Partial", "Overdue"];
  
  for (let i = 1; i <= 60; i++) {
    const std = students[(i * 4) % students.length];
    const course = COURSES_DATA.find(c => c.id === std.courseId);
    
    const amount = course.price;
    const paid = statuses[i % statuses.length] === "Paid" ? amount : (statuses[i % statuses.length] === "Partial" ? amount / 2 : 0);
    const remaining = amount - paid;
    const status = remaining === 0 ? "Paid" : (paid > 0 ? "Partial" : "Overdue");
    
    list.push({
      id: `INV-${1000 + i}`,
      studentId: std.id,
      studentName: std.name,
      courseName: course.name,
      amount,
      paid,
      remaining,
      dueDate: genDateOffset(-Math.floor(Math.random() * 10) + 15),
      date: status !== "Overdue" ? genDateOffset(Math.floor(Math.random() * 25)) : null,
      status,
      method: status !== "Overdue" ? methods[i % methods.length] : "-",
      cashier: ["Shahnoza Karimova", "Ziyoda Saidova"][i % 2]
    });
  }
  return list;
}

// Generate Attendance (150 Records)
function generateAttendance(students) {
  const records = [];
  // Take first 3 groups
  const groups = GROUPS_DATA.slice(0, 4);
  const statuses = ["Present", "Present", "Present", "Absent", "Late", "Excused"];
  
  // Create 5 dates of attendance for each student in these groups
  const dates = [genDateOffset(1), genDateOffset(3), genDateOffset(5), genDateOffset(8), genDateOffset(10)];
  
  groups.forEach(group => {
    const groupStudents = students.filter(s => s.groupId === group.id);
    
    dates.forEach(date => {
      groupStudents.forEach(std => {
        // Simple mock rule: 3+ consecutive absence for standard std003, for inactive student simulation
        let status = statuses[Math.floor(Math.random() * 6)];
        if (std.id === "std003") {
          status = "Absent"; // always absent to trigger Inactive Student Detection
        }
        
        records.push({
          id: `att_${group.id}_${std.id}_${date.replace(/\./g, '')}`,
          groupId: group.id,
          groupName: group.name,
          studentId: std.id,
          studentName: std.name,
          date,
          status, // "Present", "Absent", "Late", "Excused"
          markedBy: TEACHERS_DATA.find(t => t.id === group.teacherId).name
        });
      });
    });
  });
  
  return records;
}

// Generate Grades, Assignments, Exams
function generateAcademic(students) {
  const grades = [];
  const assignments = [];
  const exams = [];
  
  const topics = ["Grammar: Tenses", "Speaking: Introduce Yourself", "Vocabulary: Environment", "Writing Task 1: Bar Chart", "Algebra basics", "HTML tags", "CSS Grid layout", "Variables and Loops"];
  const hwStatuses = ["Submitted", "Submitted", "Late", "Checked", "Not submitted"];
  
  students.slice(0, 40).forEach((std, index) => {
    // Grades
    grades.push({
      id: `grd_${index}`,
      studentId: std.id,
      studentName: std.name,
      courseId: std.courseId,
      topic: topics[index % topics.length],
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      grade: ["A", "B", "C", "D", "F"][index % 5],
      date: genDateOffset(Math.floor(Math.random() * 10) + 1),
      teacherName: TEACHERS_DATA.find(t => t.id === std.teacherId).name
    });
    
    // Assignments
    assignments.push({
      id: `asm_${index}`,
      studentId: std.id,
      studentName: std.name,
      title: `${topics[(index + 1) % topics.length]} Homework`,
      deadline: genDateOffset(-Math.floor(Math.random() * 5) + 3),
      status: hwStatuses[index % hwStatuses.length],
      feedback: index % 4 === 0 ? "Yaxshi topshirilgan, xatolar ustida ishlang." : "Zo'r bajarilgan!",
      teacherName: TEACHERS_DATA.find(t => t.id === std.teacherId).name
    });
    
    // Exams
    if (index % 3 === 0) {
      exams.push({
        id: `ex_${index}`,
        studentId: std.id,
        studentName: std.name,
        examName: "Oylik Sinov Imtihoni (Midterm)",
        date: genDateOffset(12),
        score: Math.floor(Math.random() * 50) + 50, // 50-100
        passStatus: index % 6 === 0 ? "Fail" : "Pass"
      });
    }
  });
  
  return { grades, assignments, exams };
}

// Generate Activity Log (20 records)
function generateActivityLog() {
  return [
    { timestamp: genDateOffset(0) + " 10:30", message: "Admin Azizbek yangi student qo'shdi (Javlonbek Karimov)." },
    { timestamp: genDateOffset(0) + " 11:15", message: "Cashier Shahnoza Ziyodullayev Rustamdan 600,000 so'm to'lov qabul qildi." },
    { timestamp: genDateOffset(1) + " 14:00", message: "Manager Dostonbek yangi lead kiritdi (Nilufar Aliyeva)." },
    { timestamp: genDateOffset(1) + " 15:45", message: "O'qituvchi Sardor Axmedov IELTS-01 guruhi uchun davomatni saqladi." },
    { timestamp: genDateOffset(2) + " 09:30", message: "Manager Kamola yangi guruh yaratdi (Frontend React-02)." },
    { timestamp: genDateOffset(2) + " 16:00", message: "Cashier Ziyoda o'qituvchi oyligini to'ladi (Sardor Axmedov: 5,500,000 so'm)." },
    { timestamp: genDateOffset(3) + " 11:00", message: "Manager Dostonbek leadni Enrolled (Yozildi) statusiga o'tkazdi." },
    { timestamp: genDateOffset(3) + " 17:20", message: "Admin Azizbek Yunusobod filiali parametrlarini o'zgartirdi." },
    { timestamp: genDateOffset(4) + " 12:10", message: "Manager Kamola lead bilan bog'landi va trial belgiladi (Farrux Rahimov)." },
    { timestamp: genDateOffset(5) + " 15:30", message: "O'qituvchi Umida Yo'ldosheva guruhga yangi dars vazifasini berdi." }
  ];
}

// Main initial structure
export function getInitialMockData() {
  const students = generateStudents();
  const leads = generateLeads();
  const trials = generateTrials(students);
  const payments = generatePayments(students);
  const attendance = generateAttendance(students);
  const academic = generateAcademic(students);
  const activityLog = generateActivityLog();
  
  return {
    courses: COURSES_DATA,
    teachers: TEACHERS_DATA,
    groups: GROUPS_DATA,
    employees: EMPLOYEES_DATA,
    branches: BRANCHES_DATA,
    expenses: EXPENSES_DATA,
    students,
    leads,
    trials,
    payments,
    attendance,
    grades: academic.grades,
    assignments: academic.assignments,
    exams: academic.exams,
    activityLog,
    settings: {
      centerName: "Apex Academy",
      logo: "",
      phone: "+998712003040",
      address: "Toshkent shahar, Chilonzor 1-kvartal",
      currency: "so'm",
      theme: "light",
      notifications: {
        paymentReminders: true,
        leadReminders: true,
        attendanceAlerts: true
      }
    }
  };
}

// LocalStorage helpers
export function initDB() {
  if (!localStorage.getItem("crm_db")) {
    const initialData = getInitialMockData();
    localStorage.setItem("crm_db", JSON.stringify(initialData));
  }
}

export function getDB() {
  initDB();
  try {
    const raw = localStorage.getItem("crm_db");
    const data = JSON.parse(raw);
    
    // Check if it is a valid object and contains all required keys
    const requiredKeys = [
      "courses", "teachers", "groups", "employees", "branches", 
      "expenses", "students", "leads", "trials", "payments", 
      "attendance", "grades", "assignments", "exams", "activityLog", "settings"
    ];
    
    let isCorrupted = !data || typeof data !== 'object';
    if (!isCorrupted) {
      for (const key of requiredKeys) {
        if (data[key] === undefined || data[key] === null) {
          isCorrupted = true;
          break;
        }
      }
    }

    if (isCorrupted) {
      console.warn("CRM Database in localStorage was corrupted or outdated. Resetting to initial mock data.");
      const initialData = getInitialMockData();
      localStorage.setItem("crm_db", JSON.stringify(initialData));
      return initialData;
    }
    
    return data;
  } catch (e) {
    console.error("Database reading error, resetting database", e);
    const initialData = getInitialMockData();
    localStorage.setItem("crm_db", JSON.stringify(initialData));
    return initialData;
  }
}

export function saveDB(data) {
  localStorage.setItem("crm_db", JSON.stringify(data));
}
