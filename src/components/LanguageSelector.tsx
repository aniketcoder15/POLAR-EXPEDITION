import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation, LANGUAGES, LanguageInfo } from '../i18n';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
  dropDirection?: 'down' | 'up';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
  dropDirection = 'down',
}) => {
  const { locale, setLanguage, currentLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        id="language-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFCF8] hover:bg-[#F7F4EF] border border-[#EAE3D5] text-xs font-semibold text-[#24313A] transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F29A3D]/40"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Language / भाषा चुनें"
      >
        <span className="text-sm leading-none" role="img" aria-label="Globe">
          🌐
        </span>
        <span className="font-medium text-xs text-[#24313A]">
          {compact ? currentLanguage.code.toUpperCase() : currentLanguage.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#71808A] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className={`absolute ${
            dropDirection === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } right-0 w-64 max-h-80 overflow-y-auto rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] shadow-xl z-50 py-1 focus:outline-none scrollbar-thin divide-y divide-[#F2EDE4]`}
        >
          {LANGUAGES.map((lang: LanguageInfo) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                id={`lang-option-${lang.code}`}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFE5C7]/70 text-[#C96A20] font-bold'
                    : 'text-[#24313A] hover:bg-[#F7F4EF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-medium text-[#24313A]">{lang.name}</span>
                    {lang.code !== 'en' && (
                      <span className="text-[11px] text-[#71808A]">({lang.nativeName})</span>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#C96A20]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
