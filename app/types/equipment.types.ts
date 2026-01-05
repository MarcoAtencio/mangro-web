import type { FirestoreTimestamp } from "./user.types";

/**
 * Equipment status options.
 */
export type EquipmentStatus = 
    | "OPERATIVO" 
    | "MANTENIMIENTO" 
    | "INACTIVO" 
    | "active" 
    | "maintenance" 
    | "inactive";

/**
 * Equipment entity belonging to a client.
 */
export interface Equipment {
    id: string;
    clientId: string;
    name: string;
    model: string;
    serialNumber: string;
    lastMaintenance: Date | FirestoreTimestamp;
    status: EquipmentStatus;
    checklistTemplateId?: string;
    createdAt?: Date | FirestoreTimestamp;
}

/**
 * DTO for creating new equipment.
 */
export interface CreateEquipmentDTO {
    name: string;
    model: string;
    serialNumber: string;
    lastMaintenance: Date;
    status: EquipmentStatus | string;
    checklistTemplateId?: string;
}

/**
 * DTO for updating equipment.
 */
export type UpdateEquipmentDTO = Partial<CreateEquipmentDTO>;
