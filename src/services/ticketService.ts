import { supabase } from '../lib/supabase';
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types/database';

export interface TicketFilters {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  category?: TicketCategory | '';
  search?: string;
  page?: number;
  limit?: number;
}

export interface TicketListResult {
  tickets: Ticket[];
  count: number;
}

export const ticketService = {
  async getTickets(filters: TicketFilters = {}): Promise<TicketListResult> {
    const { status, priority, category, search, page = 1, limit = 10 } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tickets')
      .select('*, creator:profiles!tickets_created_by_fkey(id,name,role)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,ticket_number.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { tickets: (data as Ticket[]) ?? [], count: count ?? 0 };
  },

  async getTicketById(id: string): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, creator:profiles!tickets_created_by_fkey(id,name,role)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Ticket not found');
    return data as Ticket;
  },

  async createTicket(ticket: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
  }): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Ticket;
  },

  async updateTicket(
    id: string,
    updates: { status?: TicketStatus; priority?: TicketPriority },
    userId: string,
    original: Ticket,
  ): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Log each changed field to ticket_history
    const historyInserts = [];
    if (updates.status && updates.status !== original.status) {
      historyInserts.push({
        ticket_id: id,
        changed_by: userId,
        field: 'status',
        old_value: original.status,
        new_value: updates.status,
      });
    }
    if (updates.priority && updates.priority !== original.priority) {
      historyInserts.push({
        ticket_id: id,
        changed_by: userId,
        field: 'priority',
        old_value: original.priority,
        new_value: updates.priority,
      });
    }
    if (historyInserts.length > 0) {
      await supabase.from('ticket_history').insert(historyInserts);
    }

    return data as Ticket;
  },

  async deleteTicket(id: string): Promise<void> {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async getTicketHistory(ticketId: string) {
    const { data, error } = await supabase
      .from('ticket_history')
      .select('*, changer:profiles!ticket_history_changed_by_fkey(id,name,role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getDashboardStats() {
    const { data, error } = await supabase
      .from('tickets')
      .select('status,priority');

    if (error) throw new Error(error.message);
    const rows = data ?? [];

    return {
      total: rows.length,
      open: rows.filter(r => r.status === 'Open').length,
      inProgress: rows.filter(r => r.status === 'In Progress').length,
      resolved: rows.filter(r => r.status === 'Resolved').length,
      closed: rows.filter(r => r.status === 'Closed').length,
      critical: rows.filter(r => r.priority === 'Critical').length,
      high: rows.filter(r => r.priority === 'High').length,
      medium: rows.filter(r => r.priority === 'Medium').length,
      low: rows.filter(r => r.priority === 'Low').length,
    };
  },

  async getOpenTicketCount(): Promise<number> {
    const { count, error } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Open');
    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async getAllUsers() {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    // Get per-user ticket counts
    const { data: ticketCounts, error: tcError } = await supabase
      .from('tickets')
      .select('created_by, status');
    if (tcError) throw new Error(tcError.message);

    return (profiles ?? []).map(profile => {
      const userTickets = (ticketCounts ?? []).filter(t => t.created_by === profile.id);
      return {
        ...profile,
        ticketCount: userTickets.length,
        openCount: userTickets.filter(t => t.status === 'Open').length,
        resolvedCount: userTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
      };
    });
  },

  async getMonthlyStats() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('tickets')
      .select('created_at, status')
      .gte('created_at', sixMonthsAgo.toISOString());

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
