import type { Timestamp } from "firebase/firestore";
import type { ServiceType } from "./service.types";

/**
 * Activity template for maintenance protocols
 */
export interface Template {
    id: string;
    /** Template name, e.g. "COCINA O QUEMADOR" */
    name: string;
    /** Equipment category, e.g. "EQUIPOS CALIENTES" */
    category: string;
    /** Type of service this template is for */
    serviceType: ServiceType;
    /** List of maintenance activities */
    activities: string[];
    /** Whether the template is active */
    active: boolean;
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

/**
 * DTO for creating a new template
 */
export interface CreateTemplateDTO {
    name: string;
    category: string;
    serviceType: ServiceType;
    activities: string[];
    active?: boolean;
}

/**
 * DTO for updating an existing template
 */
export type UpdateTemplateDTO = Partial<CreateTemplateDTO>;

/**
 * Report entity for maintenance reports
 */
export interface Report {
    id: string;
    clientId: string;
    equipmentId: string;
    technicianId: string;
    date: Timestamp | Date;
    status: "pending" | "completed" | "review";
    photosBefore: string[];
    photosAfter: string[];
    description: string;
}
