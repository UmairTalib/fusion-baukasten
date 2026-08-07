import React, { useState } from 'react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('team_member');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/invitations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, role })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Fehler beim Senden der Einladung');
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setEmail('');
                setRole('team_member');
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm px-4">
            {/* Modal Card */}
            <div className="bg-surface/90 backdrop-blur-md border border-border w-full max-w-[440px] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 flex flex-col gap-6 relative">
                {/* Modal Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-[18px] font-bold text-on-surface">Neues Teammitglied einladen</h2>
                        <p className="text-on-surface-variant text-[13px] mt-1">Senden Sie eine Einladung an einen neuen Mitarbeiter.</p>
                    </div>
                    <button 
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        onClick={onClose}
                    >
                        <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0"}}>close</span>
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-error-container text-on-error-container text-sm rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-[#e6f4ea] text-success text-sm rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Einladung erfolgreich gesendet!
                    </div>
                )}

                {/* Modal Form */}
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">E-Mail Adresse</label>
                        <div className="relative focus-within:ring-2 focus-within:ring-primary/20 rounded-lg">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" style={{fontVariationSettings: "'FILL' 0"}}>mail</span>
                            <input 
                                className="w-full pl-10 pr-3 py-3 bg-surface border border-line rounded-lg text-[14px] focus:outline-none focus:border-primary transition-colors"
                                placeholder="kollege@stadt.de"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Role Dropdown */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">Rolle auswählen</label>
                        <div className="relative focus-within:ring-2 focus-within:ring-primary/20 rounded-lg">
                            <select 
                                className="w-full pl-3 pr-10 py-3 bg-surface border border-line rounded-lg text-[14px] focus:outline-none focus:border-primary appearance-none transition-colors"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="project_manager">Project Manager</option>
                                <option value="team_member">Team Member</option>
                                <option value="client">Viewer</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{fontVariationSettings: "'FILL' 0"}}>expand_more</span>
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex justify-end gap-3 mt-4">
                        <button 
                            className="px-4 py-2 rounded-lg font-bold text-[14px] text-on-surface-variant hover:bg-bg-subtle transition-colors border border-transparent"
                            onClick={onClose}
                            type="button"
                        >
                            Abbrechen
                        </button>
                        <button 
                            className="bg-primary hover:bg-[#350f9f] text-white px-5 py-2 rounded-lg font-bold text-[14px] transition-colors shadow-sm flex items-center justify-center min-w-[150px]"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                            ) : (
                                "Einladung senden"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
