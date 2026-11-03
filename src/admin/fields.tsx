import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export type UploadHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (url: string) => void
) => void;

export const inputCls =
  'w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs focus:outline-none focus:border-[#58A6FF]';
const labelCls = 'text-[11px] text-[#8B949E]';

/* ---------- Layout ---------- */

export const Panel: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#F2F4F8]">{title}</h2>
        {subtitle && <p className="text-xs text-[#8B949E]">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export const Card: React.FC<{
  title: string;
  onDelete?: () => void;
  children: React.ReactNode;
}> = ({ title, onDelete, children }) => (
  <div className="bg-[#0D1117] border border-[#30363D] p-5 rounded-lg space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-[#58A6FF]">{title}</span>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 p-1"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    {children}
  </div>
);

export const AddButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0"
  >
    <Plus className="w-3.5 h-3.5" />
    <span>{label}</span>
  </button>
);

/* ---------- Inputs ---------- */

export const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, hint, type = 'text' }) => (
  <div className="space-y-1">
    <label className={labelCls}>{label}</label>
    <input
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
    {hint && <p className="text-[10px] text-[#6E7681]">{hint}</p>}
  </div>
);

export const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}> = ({ label, value, onChange, hint }) => (
  <div className="space-y-1">
    <label className={labelCls}>{label}</label>
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={inputCls}
    />
    {hint && <p className="text-[10px] text-[#6E7681]">{hint}</p>}
  </div>
);

export const TextAreaField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}> = ({ label, value, onChange, rows = 3, hint }) => (
  <div className="space-y-1">
    <label className={labelCls}>{label}</label>
    <textarea
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
    {hint && <p className="text-[10px] text-[#6E7681]">{hint}</p>}
  </div>
);

export const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="space-y-1">
    <label className={labelCls}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export const ToggleField: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between gap-3 bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-3 cursor-pointer">
    <span className="text-xs text-[#C9D1D9]">{label}</span>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-[#238636]"
    />
  </label>
);

/** Image or video: preview + paste a URL + upload from device. */
export const MediaField: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  upload: UploadHandler;
  uploading: boolean;
  kind?: 'image' | 'video';
}> = ({ label, value, onChange, upload, uploading, kind = 'image' }) => (
  <div className="space-y-1.5">
    <label className={labelCls}>{label}</label>
    <div className="flex items-start gap-3">
      {value && kind === 'image' && (
        <img
          src={value}
          alt=""
          className="h-12 w-16 object-cover rounded border border-[#30363D] shrink-0"
        />
      )}
      {value && kind === 'video' && (
        <video
          src={value}
          muted
          className="h-12 w-16 object-cover rounded border border-[#30363D] shrink-0"
        />
      )}
      <div className="flex-1 space-y-1.5 min-w-0">
        <input
          type="text"
          value={value ?? ''}
          placeholder={kind === 'image' ? 'Image URL (or upload below)' : 'Video URL (or upload below)'}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
        <input
          type="file"
          accept={kind === 'image' ? 'image/*' : 'video/mp4,video/webm'}
          disabled={uploading}
          onChange={(e) => upload(e, onChange)}
          className="text-xs text-[#8B949E] max-w-full"
        />
      </div>
    </div>
  </div>
);

/** Editable list of plain strings (add / edit / remove). */
export const StringListField: React.FC<{
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  addLabel?: string;
  multiline?: boolean;
  hint?: string;
}> = ({ label, values, onChange, addLabel = 'Add', multiline = false, hint }) => {
  const list = values ?? [];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={labelCls}>{label}</label>
        <button
          type="button"
          onClick={() => onChange([...list, ''])}
          className="text-[11px] text-[#58A6FF] hover:text-[#79C0FF] flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          {addLabel}
        </button>
      </div>
      {list.map((value, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <textarea
              rows={3}
              value={value}
              onChange={(e) => onChange(list.map((v, idx) => (idx === i ? e.target.value : v)))}
              className={inputCls}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(list.map((v, idx) => (idx === i ? e.target.value : v)))}
              className={inputCls}
            />
          )}
          <button
            type="button"
            onClick={() => onChange(list.filter((_, idx) => idx !== i))}
            className="text-red-400 hover:text-red-300 p-2 shrink-0"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {list.length === 0 && <p className="text-[11px] text-[#6E7681]">Nothing added yet.</p>}
      {hint && <p className="text-[10px] text-[#6E7681]">{hint}</p>}
    </div>
  );
};

/* ---------- List helpers ---------- */

export function patchAt<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

export function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

export const newId = (prefix: string) => `${prefix}-${Date.now()}`;

/** "heroImage" -> "Hero Image" */
export const humanize = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
