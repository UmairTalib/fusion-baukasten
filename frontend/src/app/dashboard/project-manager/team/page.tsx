"use client";

import React, { useState, useEffect } from 'react';
import { InviteModal } from '@/components/features/team/InviteModal';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    initials: string;
    is_pending?: boolean;
}

export default function TeamPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/invitations/team', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatRole = (role: string) => {
        if (role === 'project_manager') return 'Project Manager';
        if (role === 'team_member') return 'Team Member';
        if (role === 'client') return 'Viewer';
        return role;
    };

    return (
        <div className="flex-1 overflow-y-auto p-[28px] relative bg-background">
            <div className="flex justify-between items-center mb-[28px]">
                <div>
                    <h1 className="text-h1 text-on-surface font-bold">Team-Verwaltung</h1>
                    <p className="text-outline text-body-sm mt-1">Mitglieder einladen und verwalten</p>
                </div>
                <button 
                    className="flex items-center gap-2 px-4 py-[10px] rounded-lg text-white text-label-caps font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm"
                    style={{ background: "linear-gradient(90deg, #4414c9 0%, #5243d7 100%)" }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Teammitglied einladen
                </button>
            </div>

            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white shadow-[0_14px_36px_rgba(45,55,95,0.08)] overflow-hidden">
                <div className="p-[24px] border-b border-line flex justify-between items-center bg-white/50">
                    <h2 className="text-h2 text-on-surface">Mitglieder</h2>
                    <span className="text-[12px] text-outline font-medium">{team.length} {team.length === 1 ? 'Person' : 'Personen'}</span>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-line bg-surface-bright/30">
                            <th className="py-3 px-[24px] text-label-caps text-outline uppercase tracking-wider">Mitglied</th>
                            <th className="py-3 px-[24px] text-label-caps text-outline uppercase tracking-wider hidden md:table-cell">E-Mail</th>
                            <th className="py-3 px-[24px] text-label-caps text-outline uppercase tracking-wider">Rolle</th>
                            <th className="py-3 px-[24px] text-label-caps text-outline uppercase tracking-wider">Status</th>
                            <th className="py-3 px-[24px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line/50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-outline">
                                    <span className="animate-spin material-symbols-outlined text-[24px] text-primary inline-block">progress_activity</span>
                                </td>
                            </tr>
                        ) : team.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-16 text-center">
                                    <span className="material-symbols-outlined text-[48px] text-outline/30 block mb-3">group</span>
                                    <p className="text-on-surface font-semibold">Noch keine Teammitglieder</p>
                                    <p className="text-outline text-body-sm mt-1">Laden Sie Ihr erstes Teammitglied ein, um zu starten.</p>
                                </td>
                            </tr>
                        ) : team.map((member) => (
                            <tr key={member.id} className="hover:bg-surface-tint/5 transition-colors group">
                                <td className="py-4 px-[24px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-[14px] border border-primary/10">
                                            {member.initials}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-on-surface text-[14px]">{member.name}</span>
                                            <span className="text-outline text-[12px] md:hidden">{member.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-[24px] text-outline text-[13px] hidden md:table-cell">
                                    {member.email}
                                </td>
                                <td className="py-4 px-[24px]">
                                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                        member.role === 'project_manager' 
                                        ? 'bg-primary/10 text-primary border border-primary/20' 
                                        : member.role === 'team_member'
                                        ? 'bg-tertiary/10 text-tertiary border border-tertiary/20'
                                        : 'bg-surface-container text-outline border border-line'
                                    }`}>
                                        {formatRole(member.role)}
                                    </span>
                                </td>
                                <td className="py-4 px-[24px]">
                                    {member.is_pending ? (
                                        <span className="flex items-center gap-1.5 text-amber text-[13px] font-medium">
                                            <span className="w-2 h-2 rounded-full bg-amber"></span>
                                            Ausstehend
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-green text-[13px] font-medium">
                                            <span className="w-2 h-2 rounded-full bg-green"></span>
                                            Aktiv
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-[24px] text-right">
                                    <button className="text-outline opacity-0 group-hover:opacity-100 transition-opacity hover:text-red p-1 rounded hover:bg-red/10">
                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <InviteModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    fetchTeam();
                }} 
            />
        </div>
    );
}
