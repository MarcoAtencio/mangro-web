// ============ Service Status ============
export const SERVICE_STATUS = {
    PENDIENTE: "PENDIENTE",
    EN_PROGRESO: "EN_PROGRESO",
    COMPLETADO: "COMPLETADO",
    CANCELADO: "CANCELADO",
} as const;

export type ServiceStatus = (typeof SERVICE_STATUS)[keyof typeof SERVICE_STATUS];

// ============ Service Priority ============
export const SERVICE_PRIORITY = {
    BAJA: "BAJA",
    MEDIA: "MEDIA",
    ALTA: "ALTA",
    URGENTE: "URGENTE",
} as const;

export type ServicePriority = (typeof SERVICE_PRIORITY)[keyof typeof SERVICE_PRIORITY];

// ============ User Roles ============
export const USER_ROLE = {
    ADMIN: "ADMIN",
    TECNICO: "TECNICO",
    SUPERVISOR: "SUPERVISOR",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ============ Equipment Status ============
export const EQUIPMENT_STATUS = {
    ACTIVO: "activo",
    MANTENIMIENTO: "mantenimiento",
    INACTIVO: "inactivo",
} as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUS)[keyof typeof EQUIPMENT_STATUS];

// ============ UI Labels (Spanish) ============
export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
    PENDIENTE: "Pendiente",
    EN_PROGRESO: "En Progreso",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
};

export const SERVICE_PRIORITY_LABELS: Record<ServicePriority, string> = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
    URGENTE: "Urgente",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: "Administrador",
    TECNICO: "Técnico",
    SUPERVISOR: "Supervisor",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
    activo: "Activo",
    mantenimiento: "En Mantenimiento",
    inactivo: "Inactivo",
};
