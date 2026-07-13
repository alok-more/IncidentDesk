import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ProfileForm {
  name: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } =
    useForm<ProfileForm>({ defaultValues: { name: user?.profile.name ?? '' } });

  const { register: regPassword, handleSubmit: handlePassword, watch, reset: resetPassword, formState: { errors: passwordErrors } } =
    useForm<PasswordForm>();

  const newPassword = watch('newPassword');

  const onSaveProfile = async (data: ProfileForm) => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({ name: data.name }).eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;
      toast.success('Password updated');
      resetPassword();
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Manage your account preferences</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{user?.profile.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.profile.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
              user?.profile.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'
            }`}>
              {user?.profile.role === 'admin' ? 'Administrator' : 'Employee'}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Display Name</span>
            </label>
            <input
              className={`input ${profileErrors.name ? 'border-red-400' : ''}`}
              {...regProfile('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
            />
            {profileErrors.name && <p className="text-xs text-red-500 mt-1">{profileErrors.name.message}</p>}
          </div>

          <div>
            <label className="label">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
            </label>
            <input className="input bg-slate-50" value={user?.email} disabled />
          </div>

          <button type="submit" className="btn-primary" disabled={savingProfile}>
            <CheckCircle className="w-4 h-4" />
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password card */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" /> Change Password
        </h3>
        <form onSubmit={handlePassword(onSavePassword)} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input pr-10 ${passwordErrors.newPassword ? 'border-red-400' : ''}`}
                {...regPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</p>}
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input ${passwordErrors.confirmPassword ? 'border-red-400' : ''}`}
              {...regPassword('confirmPassword', {
                required: 'Required',
                validate: v => v === newPassword || 'Passwords do not match',
              })}
            />
            {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
