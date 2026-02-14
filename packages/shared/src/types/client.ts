import type { ClientType, DocumentType } from '../constants/status.js';

export interface Client {
  id: string;
  document_type: DocumentType;
  document_number: string;
  name: string;
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  client_type: ClientType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateClientRequest {
  document_type: DocumentType;
  document_number: string;
  name: string;
  legal_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  client_type: ClientType;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}
