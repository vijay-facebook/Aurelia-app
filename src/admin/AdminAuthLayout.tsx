import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

interface AdminAuthLayoutProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AdminAuthLayout: React.FC<AdminAuthLayoutProps> = ({
  title,
  subtitle,
  icon,
  children,
  footer,
}) => {
  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F2F4F8] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Subtle luxury radial backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,166,255,0.08),transparent_55%)]"
      />

      <div className="relative z-10 w-full max-w-md space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#8B949E] hover:text-[#F2F4F8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Aurelia Studio</span>
          </Link>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B949E] font-medium">
            Aurelia CMS
          </span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all duration-300">
          <div className="text-center space-y-2.5">
            <div className="w-12 h-12 bg-[#21262D] border border-[#30363D] text-[#58A6FF] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              {icon || <Lock className="w-5 h-5" />}
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-normal leading-tight text-[#F2F4F8]">
              {title}
            </h1>
            <p className="text-xs leading-relaxed text-[#8B949E] max-w-sm mx-auto">
              {subtitle}
            </p>
          </div>

          {children}

          {footer && (
            <div className="pt-4 border-t border-[#30363D] text-center text-xs text-[#8B949E]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
