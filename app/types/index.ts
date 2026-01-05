/**
 * Centralized type exports for the mangro-web application.
 * Import types from this file for consistency across the codebase.
 * 
 * @example
 * import type { User, Client, Task, Equipment } from "~/types";
 */

// User types
export type { 
    User, 
    UserRole, 
    FirestoreTimestamp 
} from "./user.types";

// Client types
export type { 
    Client, 
    GeoPointType, 
    CreateClientDTO, 
    UpdateClientDTO 
} from "./client.types";

// Service types
export type { 
    Task, 
    EquipmentRef, 
    ServiceType, 
    ServicePriority, 
    ServiceStatus, 
    CreateTaskDTO 
} from "./service.types";

// Equipment types
export type { 
    Equipment, 
    EquipmentStatus, 
    CreateEquipmentDTO, 
    UpdateEquipmentDTO 
} from "./equipment.types";

// Template types
export type { 
    Template, 
    CreateTemplateDTO, 
    UpdateTemplateDTO,
    Report 
} from "./template.types";
