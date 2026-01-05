import type { FirestoreTimestamp } from "./user.types";

/**
 * Client (company) type.
 */
export interface Client {
    id: string;
    name: string;
    ruc?: string;
    address: string;
    phone?: string;
    email?: string;
    contactName?: string;
    location?: GeoPointType;
    createdAt?: Date | FirestoreTimestamp;
}

/**
 * GeoPoint type for location coordinates.
 */
export interface GeoPointType {
    latitude: number;
    longitude: number;
}

/**
 * DTO for creating a new client.
 */
export interface CreateClientDTO {
    name: string;
    ruc?: string;
    address: string;
    phone?: string;
    email?: string;
    contactName?: string;
    lat?: number;
    lng?: number;
}

/**
 * DTO for updating an existing client.
 */
export type UpdateClientDTO = Partial<CreateClientDTO>;
