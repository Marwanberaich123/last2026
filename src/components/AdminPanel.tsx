import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { ProviderConfig, FeatureFlag } from '../types';
import {
  ShieldCheck,
  KeyRound,
  Users as UsersIcon,
  Server,
  ToggleLeft,
  ToggleRight,
  AlertOctagon,
  CheckCircle,
  XCircle,
  PlusCircle,
  Download,
  Upload,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  Copy,
  Check,
  Filter,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'overview' | 'officialKeys' | 'users' | 'providers' | 'flags' | 'logs'>('overview');

  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Search & Filter for Codes
  const [codeSearch, setCodeSearch] = useState('');
  const [codeFilter, setCodeFilter] = useState<'ALL' | 'AVAILABLE' | 'ACTIVE' | 'REVOKED'>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generator & Import States
  const [generateCount, setGenerateCount] = useState(5);
  const [freshlyGenerated, setFreshlyGenerated] = useState<string[]>([]);
  const [importText, setImportText] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Emergency Lock / Maintenance
  const [emergencyLocked, setEmergencyLocked] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const key = localStorage.getItem('givemepod_key') || 'kalo@123';
    return {
      'Content-Type': 'application/json',
      'x-access-key': key
    };
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const [resOver, resUsr, resCodes, resProv, resFlags, resLogs] = await Promise.all([
        fetch('/api/admin/overview', { headers }).then(r => r.json()),
        fetch('/api/admin/users', { headers }).then(r => r.json()),
        fetch('/api/admin/access-codes', { headers }).then(r => r.json()),
        fetch('/api/admin/providers', { headers }).then(r => r.json()),
        fetch('/api/admin/feature-flags', { headers }).then(r => r.json()),
        fetch('/api/admin/logs', { headers }).then(r => r.json())
      ]);

      setOverview(resOver);
      setEmergencyLocked(resOver?.emergencyLocked || false);
      setMaintenanceMode(resOver?.maintenanceMode || false);
      setUsers(Array.isArray(resUsr) ? resUsr : []);
      setAccessCodes(Array.isArray(resCodes) ? resCodes : []);
      setProviders(Array.isArray(resProv) ? resProv : []);
      setFlags(Array.isArray(resFlags) ? resFlags : []);
      setLogs(Array.isArray(resLogs) ? resLogs : []);
    } catch (err) {
      console.error('Error fetching admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateCodes = async () => {
    try {
      const res = await fetch('/api/admin/access-codes/generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ count: generateCount })
      });
      const data = await res.json();
      if (data.generatedCodes) {
        setFreshlyGenerated(data.generatedCodes);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportCodes = async () => {
    if (!importText.trim()) return;
    try {
      const res = await fetch('/api/admin/access-codes/import', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rawCodes: importText.trim(), notes: 'Owner manual batch import' })
      });
      const data = await res.json();
      setImportSuccessMsg(`تم استيراد وتشفير ${data.importedCount} كود بنجاح!`);
      setImportText('');
      fetchAdminData();
      setTimeout(() => setImportSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeCode = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الكود؟')) return;
    try {
      await fetch(`/api/admin/access-codes/${id}/revoke`, {
        method: 'POST',
        headers: getHeaders()
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProvider = async (id: string) => {
    try {
      await fetch(`/api/admin/providers/${id}/toggle`, {
        method: 'POST',
        headers: getHeaders()
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    try {
      await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ key, enabled })
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEmergencyLock = async () => {
    const nextState = !emergencyLocked;
    try {
      await fetch('/api/admin/emergency-lock', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ locked: nextState })
      });
      setEmergencyLocked(nextState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCodesCSV = () => {
    const rows = [
      ['ID', 'Full Key / Masked Code', 'Suffix', 'Status', 'Assigned User', 'Created At', 'Activated At'],
      ...accessCodes.map(c => [
        c.id,
        c.fullKey || c.maskedCode,
        c.suffix,
        c.status,
        c.assigned_user_id || 'None',
        c.created_at,
        c.activated_at || 'Never'
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `givemepod_access_keys_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Codes
  const filteredCodes = accessCodes.filter(c => {
    const matchesFilter = codeFilter === 'ALL' || c.status === codeFilter;
    const term = codeSearch.toLowerCase();
    const matchesSearch =
      !term ||
      c.id.toLowerCase().includes(term) ||
      c.suffix.toLowerCase().includes(term) ||
      (c.fullKey && c.fullKey.toLowerCase().includes(term)) ||
      (c.assigned_user_id && c.assigned_user_id.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#141624] via-[#10121d] to-[#0c0e17] border border-indigo-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-semibold uppercase tracking-wider">لوحة القيادة للمسؤول العام (Master Admin Panel)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px]">
              kalo@123
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            لوحة تحكم الأدمن والتحكم بالتراخيص
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            إدارة كافة أكواد التفعيل الـ 100، نسخ وتوزيع المفاتيح للعملاء، مراقبة نشاط المستخدمين، والتحكم بنماذج الذكاء الاصطناعي وحالة الأمان.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#181a26] text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700 transition-all text-xs flex items-center gap-1.5"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            onClick={handleToggleEmergencyLock}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              emergencyLocked
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-[#181a26] text-gray-300 hover:text-white border border-gray-800'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{emergencyLocked ? 'قفل الطوارئ مُفعّل' : 'قفل النظام في الطوارئ'}</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800 text-xs">
        {[
          { key: 'overview', label: '📊 نظرة عامة (Overview)' },
          { key: 'officialKeys', label: `🔑 أكواد التفعيل (${accessCodes.length})` },
          { key: 'users', label: `👥 المستخدمين (${users.length})` },
          { key: 'providers', label: '🤖 مزودات الذكاء الاصطناعي (AI Models)' },
          { key: 'flags', label: '⚙️ ميزات المنصة (Feature Flags)' },
          { key: 'logs', label: `📋 سجلات النظام (${logs.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-[#151722]'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl" />
              <span className="text-[11px] font-mono text-gray-400 block mb-1">إجمالي المستخدمين</span>
              <span className="text-3xl font-extrabold font-mono text-white">{overview.totalUsers}</span>
              <span className="text-[10px] text-gray-500 block mt-1">حسابات نشطة ومسجلة</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl" />
              <span className="text-[11px] font-mono text-emerald-400 block mb-1">الأكواد المُفعّلة</span>
              <span className="text-3xl font-extrabold font-mono text-emerald-400">{overview.activeCodes}</span>
              <span className="text-[10px] text-gray-500 block mt-1">تراخيص مستخدمة حالياً</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl" />
              <span className="text-[11px] font-mono text-indigo-400 block mb-1">الأكواد المتاحة للتوزيع</span>
              <span className="text-3xl font-extrabold font-mono text-indigo-400">{overview.availableCodes}</span>
              <span className="text-[10px] text-gray-500 block mt-1">جاهزة للإعطاء للعملاء</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl" />
              <span className="text-[11px] font-mono text-purple-400 block mb-1">مشاريع المنتجات</span>
              <span className="text-3xl font-extrabold font-mono text-purple-400">{overview.totalProjects}</span>
              <span className="text-[10px] text-gray-500 block mt-1">منتجات تم إنشاؤها</span>
            </div>
          </div>

          {/* Quick Access to Key Lists */}
          <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <span>إدارة وتوزيع أكواد التفعيل الرسمية</span>
              </h3>
              <p className="text-xs text-gray-400">
                لديك {overview.availableCodes} كود متاح في قاعدة البيانات. يمكنك نسخ أي كود بنقرة واحدة وإرساله للمشتري.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('officialKeys')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              عرض قائمة الأكواد وتوزيعها
            </button>
          </div>

          {/* System Status info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0e1017] border border-gray-800/80">
              <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">محرك الذكاء الاصطناعي</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">Google Gemini 3.8 Flash</span>
              </div>
              <span className="text-xs text-emerald-400/80 block mt-1">متصل ويعمل بكفاءة عالية</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1017] border border-gray-800/80">
              <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">أمان قاعدة البيانات</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">SHA-256 Hash Vault</span>
              </div>
              <span className="text-xs text-gray-400 block mt-1">تشفير كامل للأكواد والجلسات</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1017] border border-gray-800/80">
              <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">كود دخول الأدمن الأساسي</span>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-mono font-bold text-amber-300">kalo@123</span>
              </div>
              <span className="text-xs text-gray-400 block mt-1">صلاحية أدمن عليا كاملة</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL ACCESS CODES & MANAGEMENT */}
      {activeTab === 'officialKeys' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Filters & Export */}
          <div className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value)}
                placeholder="بحث بالكود أو الرمز..."
                className="w-full pl-9 pr-4 py-2 bg-[#0a0c12] border border-gray-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {(['ALL', 'AVAILABLE', 'ACTIVE', 'REVOKED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setCodeFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    codeFilter === status
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-[#181a26] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {status === 'ALL' && `الكل (${accessCodes.length})`}
                  {status === 'AVAILABLE' && `متاح للبيع (${accessCodes.filter(c => c.status === 'AVAILABLE').length})`}
                  {status === 'ACTIVE' && `مُفعل (${accessCodes.filter(c => c.status === 'ACTIVE').length})`}
                  {status === 'REVOKED' && `ملغي (${accessCodes.filter(c => c.status === 'REVOKED').length})`}
                </button>
              ))}
            </div>

            {/* Export CSV button */}
            <button
              onClick={handleExportCodesCSV}
              className="px-4 py-2 rounded-xl bg-[#181a26] hover:bg-[#202334] border border-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>
          </div>

          {/* Generate & Import Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Generate New Code */}
            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>توليد أكواد إضافية جديدة</span>
              </h3>
              <p className="text-xs text-gray-400">
                إنشاء مفاتيح مشفرة إضافية جديدة بصيغة POD-XXXX-XXXX-XXXX وإضافتها فوراً لقاعدة البيانات.
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-[#0c0e15] border border-gray-800 rounded-xl text-xs font-mono text-white text-center focus:outline-none"
                />
                <button
                  onClick={handleGenerateCodes}
                  className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
                >
                  توليد {generateCount} كود جديد
                </button>
              </div>

              {freshlyGenerated.length > 0 && (
                <div className="p-3 rounded-xl bg-[#0c0e15] border border-emerald-500/30 text-xs space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">
                    الأكواد المُولدة حديثاً:
                  </div>
                  <div className="font-mono text-white select-all max-h-28 overflow-y-auto space-y-1">
                    {freshlyGenerated.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-900/60 p-1.5 rounded">
                        <span>{c}</span>
                        <button
                          onClick={() => copyToClipboard(c)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300"
                        >
                          نسخ
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Batch Import */}
            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>استيراد دفعة أكواد خارجية</span>
              </h3>
              <p className="text-xs text-gray-400">
                الصق قائمة أكواد (كود في كل سطر) لتشفيرها وحفظها في قاعدة البيانات فوراً.
              </p>

              <textarea
                rows={2}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="كود1&#10;كود2"
                className="w-full p-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:outline-none resize-none"
              />

              <button
                onClick={handleImportCodes}
                className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors"
              >
                تشفير واستيراد الأكواد
              </button>

              {importSuccessMsg && (
                <div className="text-xs text-emerald-400 font-mono">{importSuccessMsg}</div>
              )}
            </div>
          </div>

          {/* Access Codes Table */}
          <div className="rounded-2xl border border-gray-800 overflow-hidden bg-[#12141e]">
            <div className="p-4 bg-[#0c0e15] border-b border-gray-800 text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>قائمة أكواد التفعيل ({filteredCodes.length} كود معروض)</span>
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                انقر على زر "نسخ" لنسخ الكود الكامل وإرساله للمستخدم
              </span>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1017] border-b border-gray-800/80 text-[11px] font-mono text-gray-400 sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">كود التفعيل (Key)</th>
                    <th className="p-3.5">الحالة (Status)</th>
                    <th className="p-3.5">المستخدم المرتبط</th>
                    <th className="p-3.5">تاريخ التفعيل</th>
                    <th className="p-3.5 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {filteredCodes.map((c, index) => {
                    const displayCode = c.fullKey || c.maskedCode;
                    const isCopied = copiedKey === displayCode;

                    return (
                      <tr key={c.id} className="hover:bg-[#161825] transition-colors">
                        <td className="p-3.5 text-gray-500 text-[11px]">{index + 1}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white bg-black/40 px-2 py-1 rounded border border-gray-800">
                              {displayCode}
                            </span>
                            {c.id === 'code_admin_kalo' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                كود الأدمن
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'AVAILABLE'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : c.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {c.status === 'AVAILABLE' ? 'متاح للبيع' : c.status === 'ACTIVE' ? 'مُفعّل ونشط' : 'ملغي'}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-400 text-xs">
                          {c.assigned_user_id || '—'}
                        </td>
                        <td className="p-3.5 text-gray-500 text-xs">
                          {c.activated_at ? new Date(c.activated_at).toLocaleDateString() : 'لم يُفعّل بعد'}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(displayCode)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-sans flex items-center gap-1 transition-all ${
                                isCopied
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30'
                              }`}
                              title="نسخ الكود"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
                            </button>

                            {c.status !== 'REVOKED' && c.id !== 'code_admin_kalo' && (
                              <button
                                onClick={() => handleRevokeCode(c.id)}
                                className="px-2 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded font-sans transition-colors"
                              >
                                إلغاء
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-gray-800 overflow-hidden bg-[#12141e]">
          <div className="p-4 bg-[#0c0e15] border-b border-gray-800 text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-purple-400" />
              <span>قائمة المستخدمين المسجلين ({users.length} مستخدم)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1017] border-b border-gray-800 text-[11px] font-mono text-gray-400">
                <tr>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">البريد الإلكتروني</th>
                  <th className="p-3.5">الرتبة</th>
                  <th className="p-3.5">حالة التفعيل</th>
                  <th className="p-3.5">كود التفعيل المرتبط</th>
                  <th className="p-3.5">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#161825] transition-colors">
                    <td className="p-3.5 font-medium text-white flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full border border-gray-700" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 text-gray-300 font-mono">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        u.hasAccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {u.hasAccess ? 'مُفعّل (Active)' : 'مغلق (Locked)'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-gray-400">{u.accessSuffix || 'None'}</td>
                    <td className="p-3.5 text-gray-500 font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-500">{p.type}</span>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                </div>
                <button
                  onClick={() => handleToggleProvider(p.id)}
                  className={`p-1 text-2xl transition-colors ${
                    p.enabled ? 'text-emerald-400' : 'text-gray-600'
                  }`}
                >
                  {p.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-xs text-gray-400 leading-relaxed">
                {p.notes}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>الحالة: <strong className={p.status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}>{p.status}</strong></span>
                <span>فُحص: {new Date(p.last_health_check).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: FEATURE FLAGS */}
      {activeTab === 'flags' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.map((flag) => (
            <div key={flag.key} className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{flag.name}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{flag.description}</p>
              </div>
              <button
                onClick={() => handleToggleFlag(flag.key, !flag.enabled)}
                className={`p-1 text-2xl transition-colors ${
                  flag.enabled ? 'text-indigo-400' : 'text-gray-600'
                }`}
              >
                {flag.enabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-gray-800 bg-[#12141e] p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800 flex items-start justify-between gap-4">
              <div>
                <span className="text-indigo-400 font-bold">[{log.action}]</span>{' '}
                <span className="text-gray-300">{log.details}</span>
              </div>
              <span className="text-gray-500 shrink-0 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
