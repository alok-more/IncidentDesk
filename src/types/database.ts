export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory =
  | 'Hardware' | 'Software' | 'Network' | 'Email' | 'Printer'
  | 'Access' | 'Security' | 'Database' | 'Server' | 'Other';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  changed_by: string;
  field: string;
  old_value: string | null;
  new_value: string;
  created_at: string;
  changer?: Profile;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  high: number;
  medium: number;
  low: number;
  critical: number;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'creator'>;
        Update: Partial<Omit<Ticket, 'id' | 'ticket_number' | 'created_by' | 'created_at' | 'creator'>>;
      };
      ticket_history: {
        Row: TicketHistory;
        Insert: Omit<TicketHistory, 'id' | 'created_at' | 'changer'>;
        Update: never;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
};
