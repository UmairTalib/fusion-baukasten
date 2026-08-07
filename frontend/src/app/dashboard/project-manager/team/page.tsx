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
        <div className="flex-1 overflow-y-auto p-gutter relative">
            <div className="flex justify-between items-center mb-lg">
                <h1 className="font-h1 text-h1 font-bold text-on-surface">Team-Verwaltung</h1>
                <button 
                    className="bg-primary hover:bg-[#350f9f] text-on-primary py-sm px-md rounded-lg font-label-bold flex items-center gap-xs transition-colors shadow-ambient"
                    onClick={() => setIsModalOpen(true)}
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Teammitglied einladen
                </button>
            </div>

            <div className="bg-surface rounded-xl border border-border shadow-ambient overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-border">
                            <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant font-medium">Member</th>
                            <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant font-medium hidden md:table-cell">Email</th>
                            <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant font-medium">Role</th>
                            <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant font-medium">Status</th>
                            <th className="py-sm px-lg"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-xl text-center text-on-surface-variant">
                                    Laden...
                                </td>
                            </tr>
                        ) : team.map((member) => (
                            <tr key={member.id} className="hover:bg-bg-subtle transition-colors group">
                                <td className="py-sm px-lg">
                                    <div className="flex items-center gap-sm">
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">
                                            {member.initials}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-body-md font-bold text-on-surface">{member.name}</span>
                                            <span className="text-on-surface-variant font-body-sm md:hidden">{member.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-sm px-lg text-on-surface-variant font-body-sm hidden md:table-cell">
                                    {member.email}
                                </td>
                                <td className="py-sm px-lg">
                                    <span className={`px-xs py-1 rounded font-label-bold text-label-caps ${
                                        member.role === 'project_manager' 
                                        ? 'bg-tertiary-fixed text-on-tertiary-fixed' 
                                        : member.role === 'team_member'
                                        ? 'bg-surface-container-high text-on-surface'
                                        : 'bg-surface-container text-on-surface-variant'
                                    }`}>
                                        {formatRole(member.role)}
                                    </span>
                                </td>
                                <td className="py-sm px-lg">
                                    {member.is_pending ? (
                                        <span className="flex items-center gap-xs text-warning font-body-sm">
                                            <span className="w-2 h-2 rounded-full bg-warning"></span> Ausstehend
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-xs text-success font-body-sm">
                                            <span className="w-2 h-2 rounded-full bg-success"></span> Aktiv
                                        </span>
                                    )}
                                </td>
                                <td className="py-sm px-lg text-right">
                                    <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && team.length === 0 && (
                    <div className="p-lg text-center text-on-surface-variant font-body-md">
                        Keine Teammitglieder gefunden.
                    </div>
                )}
            </div>

            <InviteModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    fetchTeam(); // Refresh the list after inviting
                }} 
            />
        </div>
    );
}
