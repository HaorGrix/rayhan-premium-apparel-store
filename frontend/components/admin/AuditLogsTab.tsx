"use client";

import React, { useState, useEffect } from "react";
import { Search, Activity, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  action: string;
  context: any;
  request_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiFetch<AuditLog[]>("/admin/audit-logs");
        setLogs(data);
      } catch (err: any) {
        setError(err.message || "Failed to load audit logs from server.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-800 border-green-200";
    if (action.includes("delete")) return "bg-red-100 text-red-800 border-red-200";
    if (action.includes("update") || action.includes("moderate")) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-neutral-100 text-neutral-800 border-neutral-200";
  };

  const filteredLogs = logs.filter(log => {
    const actionMatch = log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = log.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    return actionMatch || emailMatch;
  });

  return (
    <div className="flex flex-col gap-6 font-sans text-neutral-800 text-left">
      
      {/* Search Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center select-none">
        <div className="flex items-center gap-3 w-full sm:max-w-md">
          <Search size={16} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search by action or admin email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none focus:outline-none text-xs w-full placeholder-neutral-400"
            aria-label="Search audit logs"
          />
        </div>
        <div className="text-[10px] text-neutral-400 font-mono">
          Showing {filteredLogs.length} entries
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center animate-pulse text-xs tracking-widest text-neutral-400 select-none">
          RETRIEVING COMPLIANCE LOGS...
        </div>
      ) : error ? (
        <div className="py-20 text-center text-xs text-red-500 font-bold select-none">
          ⚠️ {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-400 font-medium select-none">
          No audit entries match the query criteria.
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse select-none">
              <thead>
                <tr className="bg-neutral-50 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-neutral-50/50 cursor-pointer transition-colors ${
                          isExpanded ? "bg-neutral-50/30" : ""
                        }`}
                        onClick={() => handleToggleExpand(log.id)}
                      >
                        <td className="p-4 text-center">
                          <button
                            className="text-neutral-400 hover:text-black transition-colors"
                            aria-label={isExpanded ? "Collapse details" : "Expand details"}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-neutral-800">{log.user_email}</td>
                        <td className="p-4 font-mono text-neutral-500">{log.ip_address || "N/A"}</td>
                        <td className="p-4 text-right text-neutral-400 font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-neutral-50/50 p-6 border-y border-neutral-200/80">
                            <div className="flex flex-col gap-3 max-w-3xl text-left">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                                <FileText size={12} /> Payload details
                              </span>
                              <pre className="p-4 bg-neutral-900 text-neutral-200 rounded-sm font-mono text-[10px] overflow-x-auto max-h-48 border border-neutral-800">
                                {JSON.stringify(log.context, null, 2)}
                              </pre>
                              <div className="flex gap-6 text-[10px] text-neutral-400 font-mono mt-1 select-none">
                                <span>Log ID: {log.id}</span>
                                <span>Request ID: {log.request_id || "N/A"}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
