import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Sparkles } from 'lucide-react';
import { ACCENT_PALETTES, ASPECT_SPECS, PROMOTION_TEMPLATES } from './templates';
import { PromotionAdData } from './types';

interface PosterPreviewEngineProps {
  data: PromotionAdData;
  theme?: 'dark' | 'light';
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const test = `${current} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderPosterToCanvasDataUrl(data: PromotionAdData): Promise<string> {
  const palette = ACCENT_PALETTES[data.paletteId] || ACCENT_PALETTES.champagne;
  const spec = ASPECT_SPECS[data.aspectRatio] || ASPECT_SPECS['4:5'];

  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const W = spec.width;
  const H = spec.height;
  const pad = Math.round(W * 0.065);

  // Canvas background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);

  // Outer editorial hairline frame
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(pad * 0.5, pad * 0.5, W - pad, H - pad);

  const isSplit = data.templateId === 'seasonal-split' || data.aspectRatio === '16:9';
  const loadedPhoto = await loadImage(data.featuredImage);

  // Draw featured photography region
  let imgX = pad;
  let imgY = Math.round(pad * 1.45);
  let imgW = W - pad * 2;
  let imgH = Math.round(H * 0.42);

  if (isSplit) {
    imgX = Math.round(W * 0.52);
    imgY = pad;
    imgW = W - imgX - pad;
    imgH = H - pad * 2;
  } else if (data.templateId === 'editorial-arch') {
    imgW = Math.round(W * 0.62);
    imgX = Math.round((W - imgW) / 2);
    imgH = Math.round(H * 0.43);
  }

  ctx.save();
  ctx.beginPath();
  if (data.templateId === 'editorial-arch' && !isSplit) {
    const r = Math.round(imgW / 2);
    ctx.moveTo(imgX, imgY + imgH);
    ctx.lineTo(imgX, imgY + r);
    ctx.arc(imgX + r, imgY + r, r, Math.PI, 0, false);
    ctx.lineTo(imgX + imgW, imgY + imgH);
    ctx.closePath();
  } else {
    ctx.rect(imgX, imgY, imgW, imgH);
  }
  ctx.clip();

  if (loadedPhoto) {
    const ratio = Math.max(imgW / loadedPhoto.width, imgH / loadedPhoto.height);
    const drawW = loadedPhoto.width * ratio;
    const drawH = loadedPhoto.height * ratio;
    ctx.drawImage(
      loadedPhoto,
      imgX + (imgW - drawW) / 2,
      imgY + (imgH - drawH) / 2,
      drawW,
      drawH
    );
  } else {
    ctx.fillStyle = palette.surface;
    ctx.fillRect(imgX, imgY, imgW, imgH);
  }
  ctx.restore();

  // Subtle image border
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  if (!(data.templateId === 'editorial-arch' && !isSplit)) {
    ctx.strokeRect(imgX, imgY, imgW, imgH);
  }

  // Brand top line
  const textMaxW = isSplit ? Math.round(W * 0.42) : W - pad * 2;
  ctx.fillStyle = palette.accent;
  ctx.font = `600 ${Math.round(W * 0.02)}px sans-serif`;
  ctx.textAlign = isSplit || data.templateId === 'botanical-minimal' ? 'left' : 'center';
  const headerX = isSplit || data.templateId === 'botanical-minimal' ? pad : W / 2;
  ctx.fillText(
    `${data.salonName.toUpperCase()}${data.city ? `  ·  ${data.city.toUpperCase()}` : ''}`,
    headerX,
    pad * 1.05
  );

  // Content block coordinates
  let cursorY = isSplit ? Math.round(H * 0.24) : imgY + imgH + Math.round(H * 0.055);
  const alignX = isSplit || data.templateId === 'botanical-minimal' ? pad : W / 2;

  if (data.eyebrow) {
    ctx.fillStyle = palette.accent;
    ctx.font = `600 ${Math.round(W * 0.02)}px sans-serif`;
    ctx.fillText(data.eyebrow.toUpperCase(), alignX, cursorY);
    cursorY += Math.round(H * 0.045);
  }

  // Headline
  ctx.fillStyle = palette.text;
  const headSize = isSplit ? Math.round(W * 0.042) : Math.round(W * 0.052);
  ctx.font = `400 ${headSize}px Georgia, serif`;
  const headLines = wrapCanvasText(ctx, data.headline || data.salonName, textMaxW).slice(0, 3);
  for (const line of headLines) {
    ctx.fillText(line, alignX, cursorY);
    cursorY += Math.round(headSize * 1.18);
  }

  cursorY += Math.round(H * 0.012);

  // Subheadline
  if (data.subheadline) {
    ctx.fillStyle = palette.muted;
    const subSize = Math.round(W * 0.024);
    ctx.font = `400 ${subSize}px sans-serif`;
    const subLines = wrapCanvasText(ctx, data.subheadline, textMaxW).slice(0, 3);
    for (const line of subLines) {
      ctx.fillText(line, alignX, cursorY);
      cursorY += Math.round(subSize * 1.45);
    }
  }

  // Offer highlight strip
  const offerMeta = [
    data.offerBadge,
    data.priceHighlight,
    data.promoCode ? `CODE: ${data.promoCode}` : '',
  ]
    .filter(Boolean)
    .join('   ·   ');

  if (offerMeta) {
    cursorY += Math.round(H * 0.02);
    ctx.fillStyle = palette.accent;
    ctx.font = `700 ${Math.round(W * 0.024)}px monospace`;
    ctx.fillText(offerMeta, alignX, cursorY);
  }

  // Footer bar + QR code
  const footerY = H - pad * 1.45;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, footerY);
  ctx.lineTo(isSplit ? Math.round(W * 0.47) : W - pad, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = palette.text;
  ctx.font = `600 ${Math.round(W * 0.022)}px sans-serif`;
  ctx.fillText(data.ctaLabel || 'Book Appointment', pad, footerY + Math.round(H * 0.04));

  ctx.fillStyle = palette.muted;
  ctx.font = `400 ${Math.round(W * 0.018)}px monospace`;
  const footerMeta = [data.phone, data.validUntil ? `Valid till ${data.validUntil}` : '']
    .filter(Boolean)
    .join(' · ');
  ctx.fillText(footerMeta, pad, footerY + Math.round(H * 0.072));

  if (data.includeQrCode && data.bookingUrl) {
    try {
      const qrSize = Math.round(W * 0.11);
      const qrDataUrl = await QRCode.toDataURL(data.bookingUrl, {
        width: qrSize,
        margin: 1,
        color: { dark: '#1D1612', light: '#FFFFFF' },
      });
      const qrImg = await loadImage(qrDataUrl);
      if (qrImg) {
        const qrX = (isSplit ? Math.round(W * 0.47) : W - pad) - qrSize;
        const qrY = footerY + Math.round(H * 0.012);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }
    } catch {
      // Skip QR on canvas failure cleanly
    }
  }

  return canvas.toDataURL('image/png');
}

export const PosterPreviewEngine: React.FC<PosterPreviewEngineProps> = ({
  data,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const palette = ACCENT_PALETTES[data.paletteId] || ACCENT_PALETTES.champagne;
  const spec = ASPECT_SPECS[data.aspectRatio] || ASPECT_SPECS['4:5'];
  const templateMeta = PROMOTION_TEMPLATES.find((t) => t.id === data.templateId);

  const [imgFailed, setImgFailed] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    setImgFailed(false);
  }, [data.featuredImage]);

  useEffect(() => {
    if (!data.includeQrCode || !data.bookingUrl) {
      setQrUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(data.bookingUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#1D1612', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [data.includeQrCode, data.bookingUrl]);

  const isSplitLayout = data.templateId === 'seasonal-split' || data.aspectRatio === '16:9';
  const isArchLayout = data.templateId === 'editorial-arch' && !isSplitLayout;
  const isMinimalLayout = data.templateId === 'botanical-minimal' && !isSplitLayout;

  const offerMetadataParts = [
    data.offerBadge,
    data.priceHighlight,
    data.promoCode ? `Code: ${data.promoCode}` : '',
  ].filter(Boolean);

  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 space-y-4 ${
        isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#EFE6DA]/60 border-[#D8C8B4]'
      }`}
    >
      {/* Preview Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-current/10">
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? 'text-[#F2F4F8]' : 'text-[#1D1612]'}`}>
            Live Poster Preview
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
            {templateMeta?.name} · {spec.label}
          </p>
        </div>
        <span className={`text-xs font-mono tabular-nums ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
          {spec.width} × {spec.height} px
        </span>
      </div>

      {/* Poster Canvas Container */}
      <div
        className={`flex items-center justify-center p-4 sm:p-6 rounded-lg border ${
          isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-[#E3D7C7]/50 border-[#D8C8B4]'
        }`}
      >
        <div
          className={`w-full ${spec.previewClass} ${
            data.aspectRatio === '9:16'
              ? 'max-w-[290px]'
              : data.aspectRatio === '16:9'
                ? 'max-w-[540px]'
                : 'max-w-[380px]'
          } rounded-md overflow-hidden shadow-2xl border p-4 sm:p-5 flex flex-col justify-between transition-colors`}
          style={{
            backgroundColor: palette.bg,
            color: palette.text,
            borderColor: palette.border,
          }}
        >
          {/* Poster Inner Frame */}
          <div
            className="w-full h-full border p-3.5 sm:p-4 flex flex-col justify-between gap-3 overflow-hidden"
            style={{ borderColor: palette.border }}
          >
            {/* Top Brand Line */}
            <div
              className={`text-[10px] font-medium tracking-[0.2em] uppercase truncate ${
                isSplitLayout || isMinimalLayout ? 'text-left' : 'text-center'
              }`}
              style={{ color: palette.accent }}
            >
              {data.salonName}
              {data.city ? ` · ${data.city}` : ''}
            </div>

            {/* Body */}
            <div
              className={`flex-1 min-h-0 ${
                isSplitLayout
                  ? 'grid grid-cols-12 gap-3.5 items-center'
                  : 'flex flex-col justify-between gap-3'
              }`}
            >
              {/* Photo Container */}
              <div
                className={`${
                  isSplitLayout
                    ? 'col-span-6 order-2 h-full min-h-[140px]'
                    : isArchLayout
                      ? 'w-[68%] mx-auto aspect-[4/4.4] rounded-t-full'
                      : 'w-full flex-1 min-h-[110px] max-h-[52%] rounded-[4px]'
                } overflow-hidden border relative`}
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                }}
              >
                {data.featuredImage && !imgFailed ? (
                  <img
                    src={data.featuredImage}
                    alt={data.headline || data.salonName}
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                    <Sparkles className="w-5 h-5 mb-1.5 opacity-60" style={{ color: palette.accent }} />
                    <span className="text-[10px] font-medium opacity-75">{data.salonName}</span>
                  </div>
                )}
              </div>

              {/* Typography & Offer Copy */}
              <div
                className={`${
                  isSplitLayout
                    ? 'col-span-6 order-1 text-left'
                    : isMinimalLayout
                      ? 'text-left'
                      : 'text-center'
                } space-y-1.5`}
              >
                {data.eyebrow && (
                  <p
                    className="text-[9px] font-semibold tracking-[0.18em] uppercase truncate"
                    style={{ color: palette.accent }}
                  >
                    {data.eyebrow}
                  </p>
                )}

                <h4
                  className="font-serif text-lg sm:text-xl leading-snug font-normal line-clamp-2"
                  style={{ color: palette.text }}
                >
                  {data.headline || 'Seasonal Ritual'}
                </h4>

                {data.subheadline && (
                  <p
                    className="text-[11px] leading-relaxed line-clamp-2"
                    style={{ color: palette.muted }}
                  >
                    {data.subheadline}
                  </p>
                )}

                {offerMetadataParts.length > 0 && (
                  <p
                    className="text-[10px] font-mono font-semibold pt-0.5 truncate"
                    style={{ color: palette.accent }}
                  >
                    {offerMetadataParts.join(' · ')}
                  </p>
                )}
              </div>
            </div>

            {/* Footer & Optional Booking QR */}
            <div
              className="pt-2.5 border-t flex items-center justify-between gap-2 shrink-0"
              style={{ borderColor: palette.border }}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold truncate" style={{ color: palette.text }}>
                  {data.ctaLabel || 'Book Appointment'}
                </p>
                <p
                  className="text-[9px] font-mono tabular-nums truncate"
                  style={{ color: palette.muted }}
                >
                  {[data.phone, data.validUntil ? `Till ${data.validUntil}` : '']
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              {data.includeQrCode && qrUrl && (
                <div className="bg-white p-1 rounded-[3px] border border-black/10 shrink-0">
                  <img
                    src={qrUrl}
                    alt={`Booking QR for ${data.salonName}`}
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
