import React, { useMemo, useState } from 'react';
import { Download, Copy, Check, Share2, FileText, Maximize2 } from 'lucide-react';
import { renderPosterToCanvasDataUrl } from './PosterPreviewEngine';
import { PLATFORM_TARGETS, generatePlatformContent } from './templates';
import { PosterAspectRatio, PromotionAdData, SocialPlatformTarget } from './types';

interface ExportShareModuleProps {
  data: PromotionAdData;
  onMatchRatio: (ratio: PosterAspectRatio) => void;
  theme?: 'dark' | 'light';
}

export const ExportShareModule: React.FC<ExportShareModuleProps> = ({
  data,
  onMatchRatio,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [platform, setPlatform] = useState<SocialPlatformTarget>('instagram-post');
  const [exportingPng, setExportingPng] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const generated = useMemo(
    () => generatePlatformContent(data, platform),
    [data, platform]
  );

  const whatsappShareHref = useMemo(() => {
    const waContent = generatePlatformContent(data, 'whatsapp-broadcast').fullShareText;
    return `https://wa.me/?text=${encodeURIComponent(waContent)}`;
  }, [data]);

  const slug = (data.salonName || 'salon')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  const handleCopyCaption = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(generated.fullShareText).catch(() => {});
    }
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleDownloadPoster = async () => {
    setExportingPng(true);
    setExportStatus(null);
    try {
      const url = await renderPosterToCanvasDataUrl(data);
      if (!url) throw new Error('Unable to render poster canvas.');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-${platform}-${data.aspectRatio.replace(':', 'x')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setExportStatus(`Poster PNG downloaded (${generated.recommendedRatio === data.aspectRatio ? data.aspectRatio : `${data.aspectRatio} format`}).`);
    } catch {
      setExportStatus('Poster download could not complete.');
    } finally {
      setExportingPng(false);
    }
  };

  const handleDownloadTextKit = () => {
    const sections = PLATFORM_TARGETS.map((target) => {
      const item = generatePlatformContent(data, target.id);
      return [
        `=== ${item.label.toUpperCase()} (${item.dimensions}) ===`,
        item.fullShareText,
        '',
      ].join('\n');
    }).join('\n');

    const blob = new Blob([sections], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-campaign-copy-kit.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportStatus('All-platform text kit downloaded.');
  };

  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 space-y-5 ${
        isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#EFE6DA]/60 border-[#D8C8B4]'
      }`}
    >
      {/* Header + Primary Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/10">
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? 'text-[#F2F4F8]' : 'text-[#1D1612]'}`}>
            Export &amp; Platform Sharing
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
            Download high-resolution PNG artwork or copy channel-specific captions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPoster}
          disabled={exportingPng}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50 ${
            isDark
              ? 'bg-[#238636] hover:bg-[#2EA043] text-white'
              : 'bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{exportingPng ? 'Rendering PNG…' : 'Download Poster (PNG)'}</span>
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {PLATFORM_TARGETS.map((item) => {
          const active = platform === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPlatform(item.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? isDark
                    ? 'bg-[#1F6FEB]/20 border-[#58A6FF] text-[#58A6FF]'
                    : 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                  : isDark
                    ? 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#F2F4F8]'
                    : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#6F5F51] hover:text-[#1D1612]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Platform Spec & Quick Match Ratio */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-xs ${
          isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-[#F6F1EA] border-[#D8C8B4]'
        }`}
      >
        <div className={isDark ? 'text-[#C9D1D9]' : 'text-[#1D1612]'}>
          <span className="font-medium">{generated.label}</span>
          <span className={isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}>
            {' '}
            · {generated.dimensions}
          </span>
        </div>

        {data.aspectRatio !== generated.recommendedRatio && (
          <button
            type="button"
            onClick={() => onMatchRatio(generated.recommendedRatio)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-[#21262D] border-[#30363D] text-[#58A6FF] hover:border-[#58A6FF]'
                : 'bg-[#EFE6DA] border-[#D8C8B4] text-[#8C6A43] hover:border-[#8C6A43]'
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            <span>Switch Preview to {generated.recommendedRatio}</span>
          </button>
        )}
      </div>

      {/* Platform Generated Content Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-medium ${isDark ? 'text-[#C9D1D9]' : 'text-[#1D1612]'}`}>
            Generated Copy &amp; Hashtags
          </span>
          <span className={`text-[11px] font-mono tabular-nums ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
            {generated.fullShareText.length} chars
          </span>
        </div>

        <pre
          className={`whitespace-pre-wrap font-sans text-xs leading-relaxed p-3.5 rounded-lg border max-h-52 overflow-y-auto ${
            isDark
              ? 'bg-[#0D1117] border-[#30363D] text-[#C9D1D9]'
              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612]'
          }`}
        >
          {generated.fullShareText}
        </pre>
      </div>

      {/* Action Strip */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleCopyCaption}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-[#21262D] border-[#30363D] text-[#F2F4F8] hover:border-[#58A6FF]'
              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
          }`}
        >
          {copiedCaption ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copiedCaption ? 'Copied Copy' : 'Copy Platform Copy'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadTextKit}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-[#21262D] border-[#30363D] text-[#C9D1D9] hover:text-white'
              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Download All Copy (.txt)</span>
        </button>

        <a
          href={whatsappShareHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-[#21262D] border-[#30363D] text-emerald-400 hover:border-emerald-500'
              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#8C6A43] hover:border-[#8C6A43]'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share via WhatsApp ↗</span>
        </a>
      </div>

      {exportStatus && (
        <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
          {exportStatus}
        </p>
      )}
    </div>
  );
};
