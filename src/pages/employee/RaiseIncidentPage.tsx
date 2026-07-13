import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertCircle, FileText, Tag, BarChart, ArrowLeft, CheckCircle } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../types/constants';
import type { TicketCategory, TicketPriority } from '../../types/database';
import toast from 'react-hot-toast';

interface TicketForm {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

const PRIORITY_DESCRIPTIONS: Record<TicketPriority, string> = {
  Low: 'Minor issue, no immediate impact',
  Medium: 'Moderate impact, can wait for next business day',
  High: 'Significant impact on work or productivity',
  Critical: 'System down or severe business impact',
};

export function RaiseIncidentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TicketForm>({
    defaultValues: { priority: 'Medium', category: 'Software' },
  });

  const selectedPriority = watch('priority');

  const onSubmit = async (data: TicketForm) => {
    setLoading(true);
    try {
      const ticket = await ticketService.createTicket(data);
      setCreated(ticket.ticket_number);
      toast.success('Incident raised successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to raise incident');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto animate-slide-in">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Incident Raised!</h2>
          <p className="text-slate-500 text-sm mb-2">Your ticket has been submitted successfully.</p>
          <div className="inline-block bg-slate-100 rounded-lg px-4 py-2 mb-6">
            <p className="text-xs text-slate-500 mb-0.5">Ticket ID</p>
            <p className="font-mono font-bold text-slate-800 text-lg">{created}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setCreated(null)} className="btn-secondary">
              Raise Another
            </button>
            <button onClick={() => navigate('/tickets')} className="btn-primary">
              View My Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Raise Incident</h2>
          <p className="text-sm text-slate-500">Submit a new incident or support request</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Title <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              className={`input ${errors.title ? 'border-red-400' : ''}`}
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 5, message: 'At least 5 characters' },
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Description <span className="text-red-500">*</span></span>
            </label>
            <textarea
              rows={5}
              placeholder="Provide detailed information about the issue — what happened, when, steps to reproduce, impact..."
              className={`input resize-none ${errors.description ? 'border-red-400' : ''}`}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 20, message: 'At least 20 characters' },
                maxLength: { value: 2000, message: 'Max 2000 characters' },
              })}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Category <span className="text-red-500">*</span></span>
              </label>
              <select className={`input bg-white ${errors.category ? 'border-red-400' : ''}`} {...register('category', { required: true })}>
                {TICKET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="flex items-center gap-1.5"><BarChart className="w-3.5 h-3.5" /> Priority <span className="text-red-500">*</span></span>
              </label>
              <select className={`input bg-white ${errors.priority ? 'border-red-400' : ''}`} {...register('priority', { required: true })}>
                {TICKET_PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {selectedPriority && (
                <p className="text-xs text-slate-500 mt-1">{PRIORITY_DESCRIPTIONS[selectedPriority]}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
