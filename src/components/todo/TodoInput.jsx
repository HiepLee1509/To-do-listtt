import React from 'react';
import CalendarIcon from '../common/CalendarIcon';
import { PRIORITY_OPTIONS } from '../../constants';
import { getNowDatetimeLocal, getTodayThresholdDatetimeLocal, formatDueDate } from '../../utils/dateUtils';

export default function TodoInput({
  input, setInput,
  priority, setPriority,
  dueDate, setDueDate,
  onAdd,
  aiInput, setAiInput,
  onSmartAdd, isAiLoading
}) {
  return (
    <div className="flex flex-col gap-4 mb-7 mt-3">
      {/* AI Smart Add Field */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500 z-10 hidden md:block">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0l1.669 4.661L14.33 6.33 9.669 8 8 12.661 6.331 8 1.67 6.33 6.331 4.661 8 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={aiInput || ''}
          onChange={e => setAiInput(e.target.value)}
          placeholder="AI Smart Add: e.g. 'Buy groceries tomorrow high priority'"
          disabled={isAiLoading}
          className="flex-1 md:pl-10 px-4 py-3 md:py-2 rounded-xl border border-purple-200 focus:border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50/50 text-purple-900 placeholder-purple-400 font-semibold backdrop-blur transition"
          onKeyDown={e => { if (e.key === 'Enter') onSmartAdd(); }}
        />
        <button
          onClick={onSmartAdd}
          disabled={!aiInput || !aiInput.trim() || isAiLoading}
          className="px-5 py-3 md:py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:from-purple-600 hover:to-indigo-600 transition tracking-wide disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isAiLoading ? 'Thinking...' : '✨ Smart Add'}
        </button>
      </div>

      <div className="relative flex items-center justify-center my-1 z-0">
        <span className="w-full border-t border-gray-200"></span>
        <span className="absolute px-3 py-0.5 text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider bg-white rounded-full border border-gray-100 shadow-sm">OR MANUAL ADD</span>
      </div>

      {/* Manual Add Field */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a task"
          className="flex-1 px-4 py-3 md:py-2 rounded-xl border-none focus:border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white/70 text-slate-700 placeholder-gray-400 font-semibold backdrop-blur transition"
          onKeyDown={e => { if (e.key === 'Enter') onAdd(); }}
          autoFocus
        />

        {/* Container cho Priority và Date để xếp ngang trên mobile nếu muốn, hoặc dọc tùy ý */}
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="flex-1 md:flex-none px-4 py-3 md:py-2 rounded-xl border-none focus:border-transparent bg-white/90 text-slate-800 font-semibold shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
            aria-label="Choose priority"
          >
            {PRIORITY_OPTIONS.map(opt =>
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            )}
          </select>

          <div className="flex-1 md:flex-none relative flex items-center">
            <div
              className={`
              w-full md:w-auto flex items-center justify-center cursor-pointer px-3 py-3 md:py-2 bg-white/90 rounded-xl shadow-sm border border-transparent
              hover:bg-cyan-100 transition select-none
              ${dueDate ? "ring-2 ring-cyan-300" : ""}
            `}
              onClick={() => {
                const dateInput = document.getElementById('date-picker-input');
                if (dateInput && dateInput.showPicker) dateInput.showPicker();
              }}
            >
              <CalendarIcon size={21} color="#2dd4bf" />
              <input
                id="date-picker-input"
                type="datetime-local"
                value={dueDate}
                min={getTodayThresholdDatetimeLocal()}
                onChange={e => setDueDate(e.target.value)}
                className="absolute opacity-0 w-0 h-0"
              />
              {dueDate && (
                <span className="ml-2 text-xs text-slate-700 font-semibold truncate max-w-[80px] md:max-w-none">
                  {formatDueDate(dueDate)}
                </span>
              )}
              {dueDate && (
                <button
                  type="button"
                  className="ml-2 text-gray-400 hover:text-red-500 font-bold px-1"
                  onClick={e => {
                    e.stopPropagation();
                    setDueDate(getNowDatetimeLocal());
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="
          px-5 py-3 md:py-2 rounded-xl 
          bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 
          text-white font-semibold shadow
          hover:from-green-500 hover:to-cyan-600
          transition
          uppercase tracking-wide
          disabled:opacity-50
          "
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}