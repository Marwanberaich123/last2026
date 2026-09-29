import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import {
  CalendarDays,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Tag,
  AlertCircle
} from 'lucide-react';

export const SeasonalPlannerView: React.FC = () => {
  const { t } = useI18n();

  const [events, setEvents] = useState([
    {
      id: '1',
      title: "Valentine's Day",
      date: 'Feb 14',
      research_deadline: 'Dec 01',
      design_deadline: 'Dec 20',
      listing_deadline: 'Jan 05',
      promotion_deadline: 'Jan 20',
      tags: ['gifts for couples', 'funny relationship', 'matching tees']
    },
    {
      id: '2',
      title: "Mother's Day",
      date: 'May 10',
      research_deadline: 'Feb 15',
      design_deadline: 'Mar 10',
      listing_deadline: 'Mar 25',
      promotion_deadline: 'Apr 10',
      tags: ['mom life', 'dog mom', 'first time mom', 'grandma gift']
    },
    {
      id: '3',
      title: "Father's Day",
      date: 'Jun 21',
      research_deadline: 'Apr 01',
      design_deadline: 'Apr 25',
      listing_deadline: 'May 10',
      promotion_deadline: 'May 25',
      tags: ['dad jokes', 'grill master', 'hiking dad', 'vintage papa']
    },
    {
      id: '4',
      title: 'Halloween & Spooky Season',
      date: 'Oct 31',
      research_deadline: 'Jul 15',
      design_deadline: 'Aug 10',
      listing_deadline: 'Sep 01',
      promotion_deadline: 'Sep 15',
      tags: ['spooky cute', 'vintage witch', 'ghost coffee', 'creepy cute']
    },
    {
      id: '5',
      title: 'Christmas & Q4 Holiday Surge',
      date: 'Dec 25',
      research_deadline: 'Aug 20',
      design_deadline: 'Sep 15',
      listing_deadline: 'Oct 01',
      promotion_deadline: 'Nov 01',
      tags: ['holiday sweaters', 'stocking stuffers', 'family pajamas']
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
          <CalendarDays className="w-4 h-4" />
          <span>Annual Print-On-Demand Deadlines & Opportunity Calendar</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Seasonal Planner</h1>
        <p className="text-xs text-gray-400">
          Never miss an Etsy ranking window. Successful POD stores list products 60–90 days ahead of major retail holidays.
        </p>
      </div>

      {/* Events Timeline Cards */}
      <div className="space-y-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 hover:border-indigo-500/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
                  {ev.date}
                </span>
                <h3 className="text-base font-bold text-white">{ev.title}</h3>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {ev.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Critical Milestones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">1. Research</span>
                <span className="text-xs font-mono font-bold text-amber-400">{ev.research_deadline}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">2. Design</span>
                <span className="text-xs font-mono font-bold text-sky-400">{ev.design_deadline}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">3. Listing</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{ev.listing_deadline}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">4. Promotion</span>
                <span className="text-xs font-mono font-bold text-purple-400">{ev.promotion_deadline}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
