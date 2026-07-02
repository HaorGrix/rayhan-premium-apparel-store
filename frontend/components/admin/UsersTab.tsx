"use client";

import React, { useState } from "react";
import { UserCheck, Shield, Key, Search, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  created_at: string;
}

interface UsersTabProps {
  users: User[];
  onRefresh: () => void;
  currentUserEmail: string;
}

export function UsersTab({ users, onRefresh, currentUserEmail }: UsersTabProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(true);
    try {
      await apiFetch(`/admin/users/${userId}/role?role=${newRole}`, {
        method: "PATCH"
      });
      onRefresh();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update user role.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "manager":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "support":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "warehouse":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Search Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex items-center gap-3 w-full sm:max-w-md focus-within:border-black transition-colors select-none shadow-xs">
        <Search size={16} className="text-neutral-400" />
        <input
          type="text"
          placeholder="Search staff members by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none focus:outline-none text-xs w-full placeholder-neutral-400 bg-transparent"
          aria-label="Search staff members"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Directory Table */}
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden lg:col-span-2 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse select-none">
              <thead>
                <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Account Email</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-400 font-medium">
                      No staff users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-neutral-50/50 cursor-pointer ${
                        selectedUser?.id === u.id ? "bg-neutral-50/40" : ""
                      }`}
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="p-4 font-bold text-neutral-900">{u.first_name} {u.last_name}</td>
                      <td className="p-4 text-neutral-600 font-medium font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold border ${getRoleBadge(u.role)}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right text-neutral-400">
                        <ChevronRight size={14} className="ml-auto" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles Details / Permissions Configuration panel */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm text-left">
          <h3 className="font-serif text-base font-bold mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3 select-none">
            <Shield size={16} className="text-amber-500" />
            Roles & Policies Configuration
          </h3>
          
          {selectedUser ? (
            <div className="flex flex-col gap-5">
              
              {/* User details */}
              <div className="flex flex-col gap-1 select-none">
                <span className="font-bold text-sm text-neutral-900">{selectedUser.first_name} {selectedUser.last_name}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{selectedUser.email}</span>
              </div>

              {/* Role selector dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">Assign System Role</label>
                <select
                  disabled={selectedUser.email === currentUserEmail || isUpdating}
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                  className="border border-neutral-200 p-2 text-xs focus:outline-none rounded-sm bg-transparent font-bold disabled:opacity-50"
                >
                  <option value="customer">Customer (Revoke Access)</option>
                  <option value="support">Support Agent</option>
                  <option value="warehouse">Warehouse Clerk</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
                {selectedUser.email === currentUserEmail && (
                  <span className="text-[9px] text-red-500 font-semibold select-none">Cannot self-downgrade own role.</span>
                )}
              </div>

              {/* Permissions grid */}
              <div className="flex flex-col gap-3 select-none">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <Key size={10} /> Active Permissions mapping
                </span>
                
                <div className="flex flex-col gap-2 bg-neutral-50 p-4 border rounded-sm font-semibold text-[11px]">
                  
                  <div className="flex justify-between items-center text-neutral-700">
                    <span>Manage Products / Inventory</span>
                    <span className={["admin", "manager", "warehouse"].includes(selectedUser.role) ? "text-green-600 font-bold" : "text-neutral-350"}>
                      {["admin", "manager", "warehouse"].includes(selectedUser.role) ? "Allowed" : "Denied"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-700">
                    <span>Fulfill / Process Orders</span>
                    <span className={["admin", "manager", "support", "warehouse"].includes(selectedUser.role) ? "text-green-600 font-bold" : "text-neutral-350"}>
                      {["admin", "manager", "support", "warehouse"].includes(selectedUser.role) ? "Allowed" : "Denied"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-700">
                    <span>Marketing Campaign Setup</span>
                    <span className={["admin", "manager"].includes(selectedUser.role) ? "text-green-600 font-bold" : "text-neutral-350"}>
                      {["admin", "manager"].includes(selectedUser.role) ? "Allowed" : "Denied"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-700">
                    <span>Configure System / Settings</span>
                    <span className={selectedUser.role === "admin" ? "text-green-600 font-bold" : "text-neutral-350"}>
                      {selectedUser.role === "admin" ? "Allowed" : "Denied"}
                    </span>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <p className="text-xs text-neutral-400 font-medium py-12 text-center select-none">
              Select a staff member from directory to configure permissions.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}
