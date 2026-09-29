import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Project } from '../types';
import {
  FolderKanban,
  Search,
  LayoutGrid,
  List,
  PlusCircle,
  Copy,
  Trash2,
  Archive,
  ChevronRight,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

interface MyProductsProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onOpenWizard: () => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const MyProducts: React.FC<MyProductsProps> = ({
  projects,
  onOpenProject,
  onOpenWizard,
  onDuplicate,
  onDelete
}) => {
  const { t } = useI18n();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'score'>('newest');

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.niche.toLowerCase().includes(search.toLowerCase()) ||
      p.product_type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.opportunity_score?.overall_score || 0) - (a.opportunity_score?.overall_score || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Product Catalog & Multi-Platform Assets</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Products</h1>
          <p className="text-xs text-gray-400">
            View, duplicate, and export complete product packages and listing suites.
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('common.buildProduct', 'Build a POD Product')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by product name, niche, or blank type..."
              className="w-full pl-10 pr-4 py-2 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#0c0e15] border border-gray-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0c0e15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="score">Sort: Highest Score</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-800/60 text-xs">
          {['All', 'Ready', 'Listing', 'Mockups', 'Design', 'Research', 'Archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Product Display List or Grid */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#12141e] border border-gray-800">
          <FolderKanban className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No products found</h3>
          <p className="text-xs text-gray-400 mb-6">Try adjusting your filters or build a new POD product.</p>
          <button
            onClick={onOpenWizard}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            Create Product Now
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onOpenProject(proj.id)}
              className="p-5 rounded-2xl bg-[#12141e] hover:bg-[#161825] border border-gray-800 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className="text-gray-400">
                    {proj.product_type} · {proj.niche}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
                  {proj.name}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                  {proj.selected_concept?.design_angle || `${proj.style} style tailored for ${proj.audience}`}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Score</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {proj.opportunity_score?.overall_score || 80}/100
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(proj.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-gray-800"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(proj.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-rose-400 rounded hover:bg-gray-800"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="rounded-2xl border border-gray-800 overflow-hidden bg-[#12141e]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c0e15] border-b border-gray-800 text-[11px] font-mono text-gray-400">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Blank</th>
                  <th className="p-3.5">Niche</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {sorted.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => onOpenProject(proj.id)}
                    className="hover:bg-[#161825] cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-medium text-white">{proj.name}</td>
                    <td className="p-3.5 text-gray-300">{proj.product_type}</td>
                    <td className="p-3.5 text-gray-400">{proj.niche}</td>
                    <td className="p-3.5 font-mono font-bold text-indigo-400">
                      {proj.opportunity_score?.overall_score || 80}/100
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                        {proj.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProject(proj.id);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
