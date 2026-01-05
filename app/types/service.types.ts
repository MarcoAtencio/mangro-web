import type { FirestoreTimestamp } from "./user.types";

/**
 * Equipment reference for service tasks.
 */
export interface EquipmentRef {
    id: string;
    name: string;
    checklistTemplateId?: string;
    templateId?: string;
    templateName?: string;
}

/**
 * Service type options.
 */
export type ServiceType = "PREVENTIVO" | "CORRECTIVO" | "EMERGENCIA";

/**
 * Service priority levels.
 */
export type ServicePriority = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";

/**
 * Service status options.
 */
export type ServiceStatus = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO";

/**
 * Service task type (main entity for work orders).
 */
export interface Task {
    id: string;
    companyId: string;
    address: string;
    clientName: string;
    contactName: string;
    equipment: EquipmentRef[];
    equipmentSummary?: string;
    serviceType: ServiceType;
    priority: ServicePriority;
    status: ServiceStatus;
    scheduledTime: string;
    technicianId: string;
    description: string;
    createAt: Date | FirestoreTimestamp;
    updatedAt: Date | FirestoreTimestamp;
    startedAt?: Date | FirestoreTimestamp;
    completedAt?: Date | FirestoreTimestamp;
    date?: Date;
}

/**
 * DTO for creating a new service task.
 */
export interface CreateTaskDTO {
    companyId: string;
    clientName: string;
    clientAddress: string;
    contactName: string;
    technicianId: string;
    date: Date;
    startTime: string;
    endTime: string;
    priority: ServicePriority;
    serviceType: ServiceType;
    description: string;
    equipment: EquipmentRef[];
}
