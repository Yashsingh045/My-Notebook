import React, { useEffect, useState } from 'react';
import {
    LogOut,
    Plus,
    Trash2,
    Check,
    Edit2,
    Save,
    X,
    HardDrive,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';
import { driveService, type ConnectedDrive } from '../../services/DriveService';

const BYTES_IN_GB = 1024 ** 3;

const formatBytes = (value: string | number): string => {
    const n = Number(value || 0);
    if (!n) return '0 B';
    if (n >= BYTES_IN_GB) return `${(n / BYTES_IN_GB).toFixed(2)} GB`;
    if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${n} B`;
};

const SettingsTab: React.FC = () => {
    const { user, logout, refreshUser } = useAuth();
    const [drives, setDrives] = useState<ConnectedDrive[] | null>(null);
    const [loadingDrives, setLoadingDrives] = useState(false);
    const [addingDrive, setAddingDrive] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [editingUsername, setEditingUsername] = useState(false);
    const [usernameDraft, setUsernameDraft] = useState(user?.username || '');
    const [savingUsername, setSavingUsername] = useState(false);

    const loadDrives = async () => {
        setLoadingDrives(true);
        try {
            const data = await driveService.list();
            setDrives(data);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err.message || 'Failed to load drives'
            );
        } finally {
            setLoadingDrives(false);
        }
    };

    useEffect(() => {
        loadDrives();
    }, []);

    useEffect(() => {
        setUsernameDraft(user?.username || '');
    }, [user?.username]);

    const handleAddDrive = async () => {
        setAddingDrive(true);
        try {
            const url = await authService.getOAuthUrl('callback');
            window.location.href = url;
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err.message || 'Failed to start OAuth'
            );
            setAddingDrive(false);
        }
    };

    const handleRemove = async (drive: ConnectedDrive) => {
        if (drive.isPrimary) {
            toast.error('Cannot remove your primary drive.');
            return;
        }
        if (
            !window.confirm(
                `Disconnect ${drive.gmailAccount}? Files already saved in this drive stay there; we just stop using it.`
            )
        )
            return;
        setRemovingId(drive.id);
        try {
            await driveService.disconnect(drive.id);
            toast.success('Drive disconnected');
            await loadDrives();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || 'Remove failed');
        } finally {
            setRemovingId(null);
        }
    };

    const handleSaveUsername = async () => {
        const value = usernameDraft.trim();
        if (!value) {
            toast.error('Username cannot be empty.');
            return;
        }
        if (value === user?.username) {
            setEditingUsername(false);
            return;
        }
        setSavingUsername(true);
        try {
            await authService.updateMe({ username: value });
            await refreshUser();
            toast.success('Username updated');
            setEditingUsername(false);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err.message || 'Failed to update username'
            );
        } finally {
            setSavingUsername(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Log out of My-Notebook?')) {
            logout();
            toast.success('Logged out');
        }
    };

    return (
        <div className="p-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-[#001D4A] mb-1">Settings</h1>
            <p className="text-gray-500 mb-10">
                Manage your account and Google Drive integration.
            </p>

            {/* Account */}
            <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 mb-6">
                <h2 className="text-base font-bold text-[#001D4A] mb-5">Account</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Email">{user?.email || '—'}</Field>

                    <Field label="Username">
                        {editingUsername ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={usernameDraft}
                                    onChange={(e) => setUsernameDraft(e.target.value)}
                                    autoFocus
                                    className="flex-1 bg-[#F3F6F9] border border-transparent focus:border-[#00337C] focus:bg-white outline-none rounded-lg py-1.5 px-2.5 text-sm"
                                />
                                <button
                                    onClick={handleSaveUsername}
                                    disabled={savingUsername}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                    title="Save"
                                >
                                    {savingUsername ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Save size={14} />
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingUsername(false);
                                        setUsernameDraft(user?.username || '');
                                    }}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                                    title="Cancel"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#1A1A1A]">
                                    {user?.username || '—'}
                                </span>
                                <button
                                    onClick={() => setEditingUsername(true)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#00337C] hover:bg-gray-50"
                                    title="Edit"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        )}
                    </Field>

                    <Field label="Account Created">
                        {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'Unknown'}
                    </Field>
                </div>
            </section>

            {/* Drives */}
            <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-bold text-[#001D4A]">
                            Connected Google Drives
                        </h2>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                            Your primary drive stores everything. Additional drives are used once
                            the primary is full.
                        </p>
                    </div>
                    <button
                        onClick={handleAddDrive}
                        disabled={addingDrive}
                        className="flex items-center gap-2 px-3 py-2 bg-[#001D4A] text-white rounded-lg text-xs font-bold hover:bg-[#002861] disabled:opacity-50 transition"
                    >
                        {addingDrive ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Plus size={14} />
                        )}
                        Add Drive
                    </button>
                </div>

                {loadingDrives && drives === null ? (
                    <div className="flex items-center gap-2 py-6 text-gray-500 text-sm">
                        <Loader2 size={14} className="animate-spin" /> Loading drives…
                    </div>
                ) : drives && drives.length === 0 ? (
                    <div className="text-gray-500 text-sm py-6 text-center">
                        No drives connected yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {(drives || []).map((d) => (
                            <DriveCard
                                key={d.id}
                                drive={d}
                                onRemove={() => handleRemove(d)}
                                removing={removingId === d.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Danger zone */}
            <section className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl p-6">
                <h2 className="text-base font-bold text-[#DC2626] mb-3">Danger Zone</h2>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#DC2626] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                >
                    <LogOut size={14} /> Logout
                </button>
            </section>
        </div>
    );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {label}
        </label>
        <div className="mt-1.5 text-sm text-[#1A1A1A] font-medium">{children}</div>
    </div>
);

const DriveCard: React.FC<{
    drive: ConnectedDrive;
    onRemove: () => void;
    removing: boolean;
}> = ({ drive, onRemove, removing }) => {
    const used = Number(drive.spaceUsed || 0);
    const total = Number(drive.spaceTotal || 0);
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    const pctColor = pct >= 95 ? '#DC2626' : pct >= 80 ? '#D97706' : '#00337C';
    const full = total > 0 && used >= total * 0.995;

    return (
        <div className="border border-[#E5E5E5] rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#E8F2FF] text-[#00337C] flex items-center justify-center mt-0.5">
                <HardDrive size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#1A1A1A] truncate">
                        {drive.gmailAccount}
                    </p>
                    {drive.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <Check size={10} /> Primary
                        </span>
                    )}
                    {full && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            Full
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                    Connected {new Date(drive.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: pctColor }}
                    />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                    {formatBytes(used)} used of {total ? formatBytes(total) : 'unknown'} ({pct}%)
                </p>
            </div>
            {!drive.isPrimary && (
                <button
                    onClick={onRemove}
                    disabled={removing}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                >
                    {removing ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : (
                        <Trash2 size={12} />
                    )}
                    Remove
                </button>
            )}
        </div>
    );
};

export default SettingsTab;
