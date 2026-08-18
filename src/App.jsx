// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CRMProvider, useCRM } from './context/CRMContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Leads from './pages/Leads';
import Courses from './pages/Courses';
import Groups from './pages/Groups';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Schedule from './pages/Schedule';
import Payments from './pages/Payments';
import Debtors from './pages/Debtors';
import Grades from './pages/Grades';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import Reports from './pages/Reports';
import Finance from './pages/Finance';
import Employees from './pages/Employees';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login.jsx';

// Reusable UI
import { Toast } from './components/common/ui/index.jsx';

// Guard component to handle simulated permissions
function RoleProtectedRoute({ children, allowedRoles }) {
  const { currentUser, showToast } = useCRM();
  const location = useLocation();

  if (!allowedRoles.includes(currentUser.role)) {
    // Show warning toast and redirect
    setTimeout(() => {
      showToast(`Sizda ushbu bo'limga (${location.pathname}) kirish huquqi yo'q!`, 'error');
    }, 50);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Inner App with Routing & Layout structure
function AppContent() {
  const { toast, closeToast, isAuthenticated } = useCRM();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Quick Add handler state
  const [quickAdd, setQuickAdd] = useState(null); // 'student', 'lead', 'payment', etc.

  const triggerQuickAdd = (type) => {
    setQuickAdd(type);
    
    // Redirect to the appropriate page that handles the modal wizard
    if (type === 'student') window.location.pathname = '/students';
    else if (type === 'lead') window.location.pathname = '/leads';
    else if (type === 'group') window.location.pathname = '/groups';
    else if (type === 'teacher') window.location.pathname = '/teachers';
    else if (type === 'payment') window.location.pathname = '/payments';
    else if (type === 'trial') window.location.pathname = '/leads';
  };

  const resetQuickAdd = () => setQuickAdd(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Login Route */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />

        {/* Protected Panel Layout wrapper */}
        <Route path="/*" element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="app-container">
              {/* Sidebar */}
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                setIsCollapsed={setSidebarCollapsed}
                isMobileOpen={mobileSidebarOpen}
                setIsMobileOpen={setMobileSidebarOpen}
              />

              {/* Right main panel */}
              <div className="main-layout">
                {/* Header */}
                <Header 
                  setIsMobileOpen={setMobileSidebarOpen}
                  openGlobalQuickModal={triggerQuickAdd}
                />

                {/* Main content viewport */}
                <main className="content-container">
                  <Routes>
                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Dashboard */}
                    <Route path="/dashboard" element={
                      <Dashboard openGlobalQuickModal={triggerQuickAdd} />
                    } />

                    {/* Students (Manager, Admin, Director) */}
                    <Route path="/students" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager']}>
                        <Students quickAddType={quickAdd} resetQuickAdd={resetQuickAdd} />
                      </RoleProtectedRoute>
                    } />

                    {/* Student Details (Manager, Admin, Director) */}
                    <Route path="/students/:id" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager']}>
                        <StudentDetails />
                      </RoleProtectedRoute>
                    } />

                    {/* Leads Kanban CRM (Manager, Admin, Director) */}
                    <Route path="/leads" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager']}>
                        <Leads quickAddType={quickAdd} resetQuickAdd={resetQuickAdd} />
                      </RoleProtectedRoute>
                    } />

                    {/* Courses (Manager, Admin, Director) */}
                    <Route path="/courses" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager']}>
                        <Courses />
                      </RoleProtectedRoute>
                    } />

                    {/* Groups (Manager, Admin, Director, Teacher) */}
                    <Route path="/groups" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager', 'Teacher']}>
                        <Groups quickAddType={quickAdd} resetQuickAdd={resetQuickAdd} />
                      </RoleProtectedRoute>
                    } />

                    {/* Teachers Performance (Manager, Admin, Director) */}
                    <Route path="/teachers" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager']}>
                        <Teachers quickAddType={quickAdd} resetQuickAdd={resetQuickAdd} />
                      </RoleProtectedRoute>
                    } />

                    {/* Attendance Tracking (Manager, Admin, Director, Teacher) */}
                    <Route path="/attendance" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager', 'Teacher']}>
                        <Attendance />
                      </RoleProtectedRoute>
                    } />

                    {/* Schedule (Manager, Admin, Director, Teacher) */}
                    <Route path="/schedule" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager', 'Teacher']}>
                        <Schedule />
                      </RoleProtectedRoute>
                    } />

                    {/* Payments & Receipts (Cashier, Manager, Admin, Director) */}
                    <Route path="/payments" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager', 'Cashier']}>
                        <Payments quickAddType={quickAdd} resetQuickAdd={resetQuickAdd} />
                      </RoleProtectedRoute>
                    } />

                    {/* Debtors List (Cashier, Manager, Admin, Director) */}
                    <Route path="/debtors" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Manager', 'Cashier']}>
                        <Debtors />
                      </RoleProtectedRoute>
                    } />

                    {/* Grades Inputs (Teacher, Admin, Director) */}
                    <Route path="/grades" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Teacher']}>
                        <Grades />
                      </RoleProtectedRoute>
                    } />

                    {/* Homework Assignments (Teacher, Admin, Director) */}
                    <Route path="/assignments" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Teacher']}>
                        <Assignments />
                      </RoleProtectedRoute>
                    } />

                    {/* Exams (Teacher, Admin, Director) */}
                    <Route path="/exams" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director', 'Teacher']}>
                        <Exams />
                      </RoleProtectedRoute>
                    } />

                    {/* Financial & General Reports (Admin, Director) */}
                    <Route path="/reports" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director']}>
                        <Reports />
                      </RoleProtectedRoute>
                    } />

                    {/* Expenses Register (Admin, Director) */}
                    <Route path="/finance" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director']}>
                        <Finance />
                      </RoleProtectedRoute>
                    } />

                    {/* Employees roster (Admin, Director) */}
                    <Route path="/employees" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director']}>
                        <Employees />
                      </RoleProtectedRoute>
                    } />

                    {/* Notifications center (All Roles) */}
                    <Route path="/notifications" element={
                      <Notifications />
                    } />

                    {/* General CRM Settings (Admin, Director) */}
                    <Route path="/settings" element={
                      <RoleProtectedRoute allowedRoles={['Super Admin', 'Director']}>
                        <Settings />
                      </RoleProtectedRoute>
                    } />

                    {/* 404 Redirect to Dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          )
        } />
      </Routes>

      {/* Global Toast System Notification */}
      {toast && (
        <div className="toast-container no-print">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={closeToast} 
          />
        </div>
      )}
    </BrowserRouter>
  );
}

// App wrapper inside Context Provider
export default function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}
