// src/components/common/ui/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, AlertTriangle, Info, AlertCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// --- BUTTON ---
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
    </button>
  );
};

// --- INPUT ---
export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? 'error' : ''}`}
        required={required}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

// --- SELECT ---
export const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`form-select ${error ? 'error' : ''}`}
        required={required}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

// --- SEARCH INPUT ---
export const SearchInput = ({
  placeholder = 'Qidirish...',
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <div className={`filter-search ${className}`}>
      <span className="search-icon-wrapper">
        <Search size={18} />
      </span>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

// --- BADGE ---
export const Badge = ({
  children,
  variant = 'primary',
  dot = false,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className={`badge-dot badge-dot-${variant}`} />}
      {children}
    </span>
  );
};

// --- AVATAR ---
export const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
}) => {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return src ? (
    <img
      src={src}
      alt={name}
      className={`avatar avatar-${size} ${className}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';
      }}
    />
  ) : (
    <div className={`avatar avatar-${size} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

// --- CARD ---
export const Card = ({
  children,
  header,
  footer,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`card ${interactive ? 'card-interactive' : ''} ${className}`} {...props}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// --- STAT CARD (KPI) ---
export const StatCard = ({
  title,
  value,
  trend, // positive/negative change percentage, e.g. "+12%" or "-3%"
  trendDirection, // 'up' or 'down'
  period = "o'tgan oyga nisbatan",
  icon: Icon,
  variant = 'primary',
  className = '',
}) => {
  const isUp = trendDirection === 'up';
  
  return (
    <div className={`card stat-card ${className}`}>
      <div className="stat-card-header">
        <div className="stat-card-title">{title}</div>
        {Icon && (
          <div className={`stat-card-icon ${variant}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {trend && (
        <div className="stat-card-footer">
          <span className={`stat-card-trend ${isUp ? 'up' : 'down'}`}>
            {trend}
          </span>
          <span className="stat-card-period">{period}</span>
        </div>
      )}
    </div>
  );
};

// --- TABLE ---
export const Table = ({
  headers = [],
  children,
  className = '',
}) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="table table-hover">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={h.width ? { width: h.width } : {}}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

// --- PAGINATION ---
export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`pagination ${className}`}>
      <div className="pagination-info">
        {totalItems > 0 ? (
          <span>
            Ko'rsatilmoqda: <strong>{startIdx}-{endIdx}</strong> (Jami: <strong>{totalItems}</strong> tadan)
          </span>
        ) : (
          <span>Ma'lumotlar mavjud emas</span>
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination-buttons">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            icon={ChevronLeft}
          >
            Oldingi
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            icon={ChevronRight}
          >
            Keyingi
          </Button>
        </div>
      )}
    </div>
  );
};

// --- TABS ---
export const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// --- MODAL ---
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  closeOnOutsideClick = true,
}) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && overlayRef.current === e.target) {
      onClose();
    }
  };

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={handleOutsideClick}>
      <div className={`modal-container max-w-${maxWidth}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// --- CONFIRM MODAL ---
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Ma'lumotni o'chirish",
  message = "Haqiqatan ham ushbu ma'lumotni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.",
  confirmLabel = "O'chirish",
  cancelLabel = "Bekor qilish",
  variant = "danger",
}) => {
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {cancelLabel}
      </Button>
      <Button variant={variant} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="md">
      <div className="d-flex align-center gap-4">
        <div style={{
          padding: '12px',
          borderRadius: '50%',
          backgroundColor: variant === 'danger' ? 'var(--color-danger-light)' : 'var(--color-warning-light)',
          color: variant === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={24} />
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

// --- TOAST SYSTEM ---
// Let's design a Toast context or provider
export const Toast = ({
  message,
  type = 'success',
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <Check size={18} />;
      case 'error': return <AlertCircle size={18} />;
      case 'warning': return <AlertTriangle size={18} />;
      case 'info': return <Info size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className={`toast-icon ${type}`}>{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

// --- DATE PICKER ---
export const DatePicker = ({
  label,
  id,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type="date"
          id={id}
          value={value}
          onChange={onChange}
          className={`form-input ${error ? 'error' : ''}`}
          required={required}
          {...props}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

// --- EMPTY STATE ---
export const EmptyState = ({
  title = "Ma'lumot topilmadi",
  description = "Qidiruv shartlariga mos keladigan ma'lumotlar topilmadi. Boshqa shartlarni sinab ko'ring.",
  icon: Icon = Search,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// --- SKELETON ---
export const Skeleton = ({
  variant = 'text', // 'text', 'circle', 'rect'
  width,
  height,
  className = '',
}) => {
  const styles = {};
  if (width) styles.width = width;
  if (height) styles.height = height;

  return (
    <span
      className={`skeleton skeleton-${variant} ${className}`}
      style={styles}
    />
  );
};

// --- BREADCRUMB ---
export const Breadcrumb = ({
  items = [], // Array of { label: 'Home', link: '/' }
  className = '',
}) => {
  return (
    <nav className={`d-flex align-center gap-2 ${className}`} style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span style={{ color: 'var(--color-text-light)' }}>/</span>}
          {item.active ? (
            <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{item.label}</span>
          ) : (
            <span style={{ cursor: 'pointer' }} onClick={item.onClick}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// --- CHART CARD ---
export const ChartCard = ({
  title,
  subtitle,
  children,
  headerActions,
  className = '',
}) => {
  return (
    <Card
      header={
        <div className="d-flex align-center justify-between" style={{ width: '100%' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '400', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {headerActions}
        </div>
      }
      className={className}
    >
      {children}
    </Card>
  );
};

// --- DROPDOWN ---
export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className={`tooltip-wrapper ${className}`} style={{ position: 'relative' }}>
      <span onClick={() => setIsOpen(!isOpen)} style={{ display: 'inline-block' }}>
        {trigger}
      </span>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            [align === 'right' ? 'right' : 'left']: 0,
            marginTop: '8px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            minWidth: '160px',
            overflow: 'hidden',
            animation: 'fadeIn var(--transition-fast)'
          }}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};
export const DropdownItem = ({
  children,
  onClick,
  variant = 'normal',
  className = '',
}) => {
  const getStyle = () => {
    if (variant === 'danger') return { color: 'var(--color-danger)' };
    return { color: 'var(--color-text)' };
  };

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '10px 16px',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...getStyle()
      }}
      className="dropdown-item-hover"
      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-secondary-light)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      {children}
    </button>
  );
};
