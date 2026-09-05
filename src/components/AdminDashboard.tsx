import React, { useState, useEffect } from "react";
import { Lead } from "../types";
import {
  ShieldAlert,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ArrowUpDown,
  LogOut,
  MailWarning,
  RefreshCw,
  MailCheck,
  FileCheck
} from "lucide-react";
import { motion } from "motion/react";

// Memory fallback if sessionStorage is blocked inside iframe sandboxes
const memoryStorage: Record<string, string> = {};
const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined") {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {
      // Ignored
    }
    return memoryStorage[key] || null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Ignored
    }
    memoryStorage[key] = value;
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Ignored
    }
    delete memoryStorage[key];
  }
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "budget">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate with security token
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authKey.trim()) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const resp = await fetch("/api/leads", {
        headers: {
          Authorization: authKey,
        },
      });

      if (!resp.ok) {
        throw new Error("ACCESS DEBARRED. Authentication credentials invalid.");
      }

      const data = await resp.json();
      setLeads(data.leads || []);
      setIsAuthenticated(true);
      safeSessionStorage.setItem("cyber_crm_token", authKey);
    } catch (err: any) {
      setErrorMsg(err.message || "Bypassed unauthorized authentication attempt.");
    } finally {
      setIsLoading(false);
    }
  };

  // Log out Admin
  const handleLogout = () => {
    safeSessionStorage.removeItem("cyber_crm_token");
    setIsAuthenticated(false);
    setAuthKey("");
    setLeads([]);
  };

  // Check storage on load
  useEffect(() => {
    const savedToken = safeSessionStorage.getItem("cyber_crm_token");
    if (savedToken) {
      setAuthKey(savedToken);
      fetchLeads(savedToken);
    }
  }, []);

  const fetchLeads = async (token: string) => {
    try {
      const resp = await fetch("/api/leads", {
        headers: { Authorization: token },
      });
      if (resp.ok) {
        const data = await resp.json();
        setLeads(data.leads || []);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Auto fetch leads failed", err);
    }
  };

  // Update lead Status or Notes
  const handleUpdateLead = async (id: string, newStatus: Lead["status"], notesText: string) => {
    setUpdatingId(id);
    const token = safeSessionStorage.getItem("cyber_crm_token") || authKey;

    try {
      const resp = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          status: newStatus,
          privateNotes: notesText,
        }),
      });

      if (!resp.ok) throw new Error("Synchronization bypass error.");

      const data = await resp.json();
      
      // Update local state
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, ...data.lead } : lead))
      );
      
      // Keep selected lead display operational with updated fields
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) => (prev ? { ...prev, ...data.lead } : null));
      }
    } catch (err) {
      console.error("System sync failure", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Simple budget sorting translation weight mapping
  const getBudgetWeight = (budgetString: string) => {
    const s = budgetString.toLowerCase();
    if (s.includes("under $5k") || s.includes("<$2k")) return 1;
    if (s.includes("$5k - $15k") || s.includes("2k-5k")) return 2;
    if (s.includes("$15k - $50k") || s.includes("5k-10k")) return 3;
    if (s.includes("$50k+") || s.includes("10k")) return 4;
    return 0;
  };

  // Filter & Sort leads
  const filteredLeads = leads
    .filter((l) => {
      const query = search.toLowerCase();
      const matchesSearch =
        l.name.toLowerCase().includes(query) ||
        l.email.toLowerCase().includes(query) ||
        l.projectScope.toLowerCase().includes(query) ||
        l.id.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = getBudgetWeight(a.budget) - getBudgetWeight(b.budget);
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });

  const toggleSort = (type: "date" | "budget") => {
    if (sortBy === type) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(type);
      setSortDirection("desc");
    }
  };

  // Format timestamp helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div id="admin-dashboard-root" className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] flex flex-col pt-24 font-sans select-none relative overflow-hidden">
      {/* Background glow matrix lights */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] rounded-full bg-[#66FCF1]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      {/* LOGIN VIEW PANEL */}
      {!isAuthenticated ? (
        <div id="admin-login-stage" className="flex-1 flex items-center justify-center p-6 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[#1F2833] border border-[#1F2833] rounded-2xl p-8 relative shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          >
            {/* Pulsating system ring ornament */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-xl bg-[#0B0C10] border border-[#66FCF1]/30 relative group">
                <ShieldAlert size={32} className="text-[#66FCF1] animate-pulse" />
                <span className="absolute inset-0 rounded-xl bg-[#66FCF1]/10 blur-md pointer-events-none" />
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-white text-xl font-bold uppercase tracking-widest font-mono">
                AURION OPERATIONAL FIREWALL
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                RESTRICTED AREA. DECRYPTION AUTH REQUIRED.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Access Key Cipher
                </label>
                <input
                  type="password"
                  placeholder="System clearance token..."
                  value={authKey}
                  onChange={(e) => {
                    setAuthKey(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full px-4 py-3 bg-[#0B0C10] text-white border border-[#1F2833] rounded-xl placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#66FCF1]/60 focus:border-[#66FCF1]/40 text-center font-mono tracking-widest transition-all"
                />
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs font-mono leading-relaxed">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-400 shrink-0 animate-ping" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#66FCF1] to-[#66FCF1]/80 text-[#0B0C10] font-bold tracking-widest uppercase text-sm hover:brightness-115 active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(102,252,241,0.25)] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Validating...
                  </>
                ) : (
                  "Initiate Port Entry"
                )}
              </button>
            </form>

            <p className="text-center text-[10px] text-gray-600 mt-8 font-mono tracking-wider uppercase">
              AES-256 System Handshake Protected by TLS Core
            </p>
          </motion.div>
        </div>
      ) : (
        /* CORE CONTROL CENTER DASHBOARD */
        <div id="admin-crm-terminal" className="flex-1 w-full max-w-7xl mx-auto px-6 pb-16 z-10 flex flex-col gap-8">
          
          {/* Dashboard Header Panel */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1F2833]/40 border border-[#1F2833]/60 p-6 rounded-2xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2.5">
                Command Center
                <span className="text-xs bg-[#66FCF1]/10 text-[#66FCF1] border border-[#66FCF1]/25 px-2 py-0.5 rounded-md font-mono tracking-normal">
                  authenticated
                </span>
              </h2>
              <p className="text-sm text-gray-400">
                Real-time transaction log, chatbot interactions, and email notification diagnostic monitors.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-[#1F2833] hover:bg-red-950/40 border border-[#1F2833] hover:border-red-900/40 rounded-xl text-xs font-mono text-gray-400 hover:text-red-400 transition-all flex items-center gap-2 cursor-pointer outline-none"
            >
              <LogOut size={13} />
              End Session
            </button>
          </div>

          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#1F2833]/30 border border-[#1F2833]/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Captured Leads</span>
                <h3 className="text-2xl font-black text-white mt-1">{leads.length}</h3>
              </div>
              <FileSpreadsheet className="text-gray-500" size={24} />
            </div>

            <div className="p-5 bg-[#1F2833]/30 border border-[#1F2833]/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Pending Leads (New)</span>
                <h3 className="text-2xl font-black text-[#66FCF1] mt-1">
                  {leads.filter((l) => l.status === "NEW").length}
                </h3>
              </div>
              <Clock className="text-[#66FCF1]" size={24} />
            </div>

            <div className="p-5 bg-[#1F2833]/30 border border-[#1F2833]/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">In Progress</span>
                <h3 className="text-2xl font-black text-amber-400 mt-1">
                  {leads.filter((l) => l.status === "IN_PROGRESS").length}
                </h3>
              </div>
              <Sparkles className="text-amber-400" size={24} />
            </div>

            <div className="p-5 bg-[#1F2833]/30 border border-[#1F2833]/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Closed Clients</span>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">
                  {leads.filter((l) => l.status === "CLOSED").length}
                </h3>
              </div>
              <CheckCircle className="text-emerald-400" size={24} />
            </div>
          </div>

          {/* CRM Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Leads Table Card */}
            <div className="lg:col-span-8 bg-[#1F2833]/30 border border-[#1F2833]/60 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Controls bar */}
              <div className="p-4 border-b border-[#1F2833]/60 bg-[#1F2833]/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search input */}
                <div className="relative w-full md:w-72">
                  <Search size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search specifications or contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0B0C10] text-[#C5C6C7] rounded-xl pl-9 pr-4 py-2 text-xs border border-[#1F2833] focus:outline-none focus:border-[#66FCF1]/50 placeholder-gray-600 transition-colors font-mono"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0 pb-1 md:pb-0">
                  {["ALL", "NEW", "IN_PROGRESS", "CLOSED"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setStatusFilter(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-colors cursor-pointer ${
                        statusFilter === tag
                          ? "bg-[#66FCF1] text-[#0B0C10] font-bold"
                          : "bg-[#0B0C10] border border-[#1F2833] text-gray-400 hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

              </div>

              {/* Table rendering panel */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-[#1F2833]/60 bg-[#1F2833]/15 text-gray-500 font-bold">
                      <th className="p-4 select-none">Client Contacts</th>
                      <th className="p-4 cursor-pointer hover:text-white select-none transition-colors" onClick={() => toggleSort("budget")}>
                        Budget  <ArrowUpDown size={12} className="inline ml-1" />
                      </th>
                      <th className="p-4 cursor-pointer hover:text-white select-none transition-colors" onClick={() => toggleSort("date")}>
                        Time & Date <ArrowUpDown size={12} className="inline ml-1" />
                      </th>
                      <th className="p-4 select-none">Source</th>
                      <th className="p-4 select-none text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2833]/60">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500 font-mono text-xs">
                          NO SERIALIZED RECORDS MATCHING FILTERS WERE DETECTED.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setEditingNotes(lead.privateNotes || "");
                          }}
                          className={`hover:bg-[#1F2833]/25 cursor-pointer transition-colors ${
                            selectedLead?.id === lead.id ? "bg-[#1F2833]/45" : ""
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-white">{lead.name}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{lead.email}</div>
                          </td>
                          <td className="p-4">
                            <span className="text-[#66FCF1]">{lead.budget}</span>
                            <div className="text-[10px] text-gray-500 mt-0.5 max-w-[130px] truncate">{lead.projectScope}</div>
                          </td>
                          <td className="p-4 text-gray-400">
                            {formatDate(lead.createdAt)}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                              lead.source === "BOT" ? "bg-cyan-950/40 text-[#66FCF1] border border-[#66FCF1]/20" : "bg-violet-950/40 text-violet-400 border border-violet-500/20"
                            }`}>
                              {lead.source}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest leading-none ${
                              lead.status === 'NEW' ? "bg-cyan-950 text-[#66FCF1] border border-[#66FCF1]/40" :
                              lead.status === 'IN_PROGRESS' ? "bg-amber-950 text-amber-400 border border-amber-500/30" :
                              "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* CRM footer block counter */}
              <div className="p-4 border-t border-[#1F2833]/60 bg-[#1F2833]/10 flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                <span>Displaying {filteredLeads.length} of {leads.length} records</span>
                <span>Active Vault Session v2.0</span>
              </div>

            </div>

            {/* Selected Lead Detail Inspect Card */}
            <div className="lg:col-span-4 space-y-4">
              {selectedLead ? (
                <div className="bg-[#1F2833]/35 border border-[#1F2833]/60 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
                  
                  {/* Decorative glowing neon block */}
                  <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-[#66FCF1] to-transparent" />

                  {/* Top profile core */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-gray-500 uppercase">
                      Serialized Core Record Inspect
                    </span>
                    <h3 className="text-lg font-black text-white">{selectedLead.name}</h3>
                    <p className="text-xs text-[#66FCF1] font-mono">{selectedLead.email}</p>
                  </div>

                  <hr className="border-[#1F2833]" />

                  {/* Metadata spec points */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">Budget Matrix</span>
                      <span className="text-white font-semibold">{selectedLead.budget}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">Receipt Time</span>
                      <span className="text-white">{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">Service Architecture</span>
                      <span className="text-[#66FCF1] font-semibold">{selectedLead.projectScope}</span>
                    </div>
                  </div>

                  {/* Inquiry messages */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono font-bold text-gray-500 block">Transmission Message</span>
                    <div className="bg-[#0B0C10] border border-[#1F2833] p-3 rounded-lg text-xs leading-relaxed text-gray-300 font-mono whitespace-pre-line max-h-[120px] overflow-y-auto">
                      {selectedLead.customMessage || "No supplementary messages received."}
                    </div>
                  </div>

                  <hr className="border-[#1F2833]" />

                  {/* Email Automations Diagnostics */}
                  <div className="space-y-3.5">
                    <span className="text-[9px] uppercase font-mono font-black text-gray-500 tracking-wider block">
                      Automated Email Transmissions
                    </span>
                    <div className="space-y-2">
                      {selectedLead.emailsSent && selectedLead.emailsSent.length > 0 ? (
                        selectedLead.emailsSent.map((log, index) => (
                          <div key={index} className="bg-[#0B0C10]/60 p-2.5 rounded-lg border border-[#1F2833]/80 flex items-center justify-between text-[11px] font-mono">
                            <div className="space-y-1">
                              <span className="text-white block font-semibold text-[10px]">
                                {log.type === "CLIENT_ONBOARDING" ? "Customer Gateway Template" : "Admin Alert Ticket"}
                              </span>
                              <span className="text-gray-500 block text-[9px]">{formatDate(log.sentAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {log.success ? (
                                <>
                                  <MailCheck size={13} className="text-emerald-400" />
                                  <span className="text-emerald-400 text-[9px] uppercase font-bold">sent</span>
                                </>
                              ) : (
                                <>
                                  <MailWarning size={13} className="text-red-400" />
                                  <span className="text-red-400 text-[9px] uppercase font-bold">failed</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-gray-600 font-mono">NO ACTIVE DISPATCH RECORDS LOGGED ON VAULT.</div>
                      )}
                    </div>
                  </div>

                  <hr className="border-[#1F2833]" />

                  {/* System states and custom notation inputs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-mono font-bold text-gray-500 block">
                        Pipeline Status Override
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-[#0B0C10] p-1 rounded-xl border border-[#1F2833]/50">
                        {["NEW", "IN_PROGRESS", "CLOSED"].map((s) => (
                          <button
                            key={s}
                            disabled={updatingId !== null}
                            onClick={() => handleUpdateLead(selectedLead.id, s as Lead["status"], selectedLead.privateNotes)}
                            className={`py-1.5 rounded-lg text-[9px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer ${
                              selectedLead.status === s
                                ? s === "NEW" ? "bg-cyan-950 text-[#66FCF1] border border-[#66FCF1]/40" :
                                  s === "IN_PROGRESS" ? "bg-amber-950 text-amber-400 border border-amber-500/30" :
                                  "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                : "text-gray-600 hover:text-white"
                            }`}
                          >
                            {s === "IN_PROGRESS" ? "Active" : s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-mono font-bold text-gray-500 block">
                        Operational Private Notes
                      </label>
                      <textarea
                        rows={3}
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Internal admin comments..."
                        className="w-full bg-[#0B0C10] text-[#C5C6C7] rounded-xl border border-[#1F2833] p-3 text-xs focus:outline-none focus:border-[#66FCF1]/50 placeholder-gray-600 transition-colors font-mono resize-none focus:ring-1 focus:ring-[#66FCF1]/30"
                      />
                    </div>

                    <button
                      onClick={() => handleUpdateLead(selectedLead.id, selectedLead.status, editingNotes)}
                      disabled={updatingId !== null || editingNotes === selectedLead.privateNotes}
                      className="w-full py-2.5 rounded-xl bg-[#66FCF1] hover:brightness-110 text-[#0B0C10] font-bold font-mono text-[10px] tracking-widest uppercase disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.99]"
                    >
                      {updatingId === selectedLead.id ? (
                        <>
                          <RefreshCw className="animate-spin" size={13} />
                          writing changes...
                        </>
                      ) : (
                        <>
                          <FileCheck size={13} />
                          Commit Notes Checksum
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-[#1F2833]/15 border border-[#1F2833]/40 border-dashed rounded-2xl p-12 text-center text-xs font-mono text-gray-600">
                  SELECT A CLIENT CORE FILE IN THE PORT MATRIX TO INITIALIZE THE REAL-TIME METRIC ANALYSIS ENGINE.
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
