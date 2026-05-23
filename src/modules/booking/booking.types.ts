export type VehicleType =
  | "CAR"
  | "SUV"
  | "LUXURY"
  | "BIKE"
  | "COMMERCIAL"
  | "EV";

export type ServiceType =
  | "TOWING"
  | "FLAT_TYRE"
  | "BATTERY"
  | "FUEL_DELIVERY"
  | "LOCKOUT"
  | "ENGINE_FAILURE"
  | "ACCIDENT"
  | "OTHER";

export type BookingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface CustomerDTO {
  name: string;
  phone: string;
}

export interface VehicleDTO {
  type: VehicleType;
  plateNumber: string;
}

export interface LocationDTO {
  lat: number;
  lng: number;
  address?: string;
}

export interface CreateBookingDTO {
  customer: CustomerDTO;

  vehicle: VehicleDTO;

  serviceType: ServiceType;

  description?: string;

  isPriority?: boolean;

  images?: string[];

  location: LocationDTO;
  paymentStatus?:
    | "PENDING"
    | "COMPLETED"
    | "FAILED";

  paymentAmount?: number;

  createdBy?: string | null;
}

export interface BookingResponseDTO {
  id: string;

  ticketId: string;

  customer: CustomerDTO;

  vehicle: VehicleDTO;

  serviceType: ServiceType;

  description?: string;

  isPriority: boolean;

  images: string[];

  location: {
    address?: string;
    lat: number;
    lng: number;
  };

  status: BookingStatus;

  technicianId?: string | null;

  technicianName?: string | null;

  estimatedArrivalTime?: number | null;

  createdAt: Date;

  updatedAt: Date;
}