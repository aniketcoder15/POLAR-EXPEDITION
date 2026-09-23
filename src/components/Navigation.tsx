import { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Radio, 
  Package, 
  Boxes, 
  AlertTriangle, 
  Menu, 
  X, 
  LogOut,
  Bot
} from 'lucide-react';
import { NavigationTab, AuthUser } from '../types';
import { useTranslation } from '../i18n';
import { LanguageSelector } from './LanguageSelector';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeEmergenciesCount: number;
  onOpenEmergencyModal: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenAssistant?: () => void;
  isAssistantOpen?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeEmergenciesCount,
  onOpenEmergencyModal,
  currentUser,
  onLogout,
  onOpenAssistant,
  isAssistantOpen
}) => {
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Base list of core navigation items
  const allNavItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'expeditions', label: t('nav.expeditions'), icon: Compass },
    { id: 'tracking', label: t('nav.tracking'), icon: Radio },
    { id: 'cargo', label: t('nav.cargo'), icon: Package },
    { id: 'inventory', label: t('nav.inventory'), icon: Boxes },
    { id: 'emergency', label: t('nav.emergency'), icon: AlertTriangle }
  ];

  // Filter navigation items by role permissions
  const navItems = allNavItems.filter(item => {
    if (!currentUser) return true;
    return currentUser.allowedTabs.includes(item.id);
  });

  const userInitials = currentUser 
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PE';

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-[#FFFCF8]/95 backdrop-blur-md border-b border-[#EAE3D5] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-[#C96A20]" />
          </div>
          <div className="truncate">
            <span className="font-bold text-xs tracking-tight text-[#24313A] font-display">
              {t('nav.title')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageSelector compact />

          {currentUser?.allowedTabs.includes('emergency') && (
            <button
              id="mobile-emergency-header-btn"
              onClick={onOpenEmergencyModal}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#E84D4D] text-white flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('nav.sos')}</span>
            </button>
          )}

          <button
            id="mobile-drawer-toggle"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-1.5 rounded-lg border border-[#EAE3D5] bg-[#F7F4EF] text-[#24313A] cursor-pointer"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (When Opened) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-72 bg-[#FFFCF8] h-full p-4 flex flex-col justify-between border-r border-[#EAE3D5]">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] font-bold text-xs">
                    {userInitials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#24313A] truncate">{currentUser?.name || 'Operator'}</div>
                    <div className="text-[10px] text-[#C96A20] font-semibold">{currentUser?.roleTitle || 'Polar Ops'}</div>
                  </div>
                </div>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 rounded-lg text-[#71808A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#F29A3D] text-[#24313A] font-bold'
                          : 'text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'emergency' && activeEmergenciesCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-[#E84D4D] text-white rounded-full text-[10px]">
                          {activeEmergenciesCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Actions & Logout */}
            <div className="pt-4 border-t border-[#EAE3D5] space-y-2">
              {onOpenAssistant && (
                <button
                  id="mobile-drawer-assistant-btn"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenAssistant();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-[#24313A] bg-[#FFE5C7] rounded-xl hover:bg-[#FCD4A0] border border-[#F29A3D]/40 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#C96A20]" />
                    <span>Polar Assistant</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#39A96B] animate-pulse" />
                </button>
              )}
              <button
                id="mobile-logout-btn"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[#E84D4D] bg-[#FDE8E8] rounded-xl hover:bg-[#FCD4D4] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 bg-[#FFFCF8] border-r border-[#EAE3D5] shadow-[2px_0_12px_rgba(36,49,58,0.03)]">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#EAE3D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE5C7] to-[#F29A3D]/20 border border-[#F29A3D]/40 flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-[#C96A20]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#24313A] tracking-tight font-display leading-tight">
                {t('nav.title')}
              </h1>
              <p className="text-[10px] text-[#C96A20] font-semibold tracking-wider uppercase mt-0.5">
                {t('nav.tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Report Emergency Button (if permitted) */}
        {currentUser?.allowedTabs.includes('emergency') && (
          <div className="px-4 pt-4">
            <button
              id="sidebar-report-emergency-btn"
              onClick={onOpenEmergencyModal}
              className="w-full py-2.5 px-3 rounded-xl bg-[#E84D4D] hover:bg-[#D43F3F] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs group cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">{t('nav.reportEmergency')}</span>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#F29A3D] text-[#24313A] shadow-xs'
                    : 'text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#24313A]'
                        : 'text-[#71808A] group-hover:text-[#24313A]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Badges */}
                {item.id === 'emergency' && activeEmergenciesCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#E84D4D] text-white shadow-2xs">
                    {activeEmergenciesCount}
                  </span>
                )}
                {item.id === 'tracking' && (
                  <span className="w-2 h-2 rounded-full bg-[#39A96B] live-indicator" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Polar Assistant Quick Button */}
        {onOpenAssistant && (
          <div className="px-3 pb-2 pt-1">
            <button
              id="sidebar-assistant-btn"
              onClick={onOpenAssistant}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isAssistantOpen
                  ? 'bg-[#FFE5C7] text-[#C96A20] border border-[#F29A3D]/50 shadow-xs'
                  : 'bg-[#F7F4EF] hover:bg-[#FFE5C7] text-[#24313A] border border-[#EAE3D5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-[#C96A20]" />
                <span>Polar Assistant</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#39A96B] animate-pulse" />
            </button>
          </div>
        )}

        {/* User Profile & Role (Bottom Sidebar) */}
        <div className="p-3 border-t border-[#EAE3D5] relative" ref={profileRef}>
          <button
            id="profile-menu-toggle"
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F7F4EF] transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#FFE5C7] border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20] font-bold text-xs shrink-0">
                {userInitials}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#24313A] truncate">
                  {currentUser?.name || 'Alex Morgan'}
                </div>
                <div className="text-[10px] text-[#71808A] truncate flex items-center gap-1.5">
                  <span className="font-semibold">{currentUser?.roleTitle || 'Logistics Officer'}</span>
                  <span className="text-[#39A96B] font-bold">● Online</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-[#F29A3D] shrink-0">{t('nav.menu')}</span>
          </button>

          {/* Settings, Actions & Logout Popup */}
          {profileOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 p-2 rounded-xl bg-[#FFFCF8] border border-[#EAE3D5] shadow-xl backdrop-blur-xl z-50 text-xs space-y-1">
              <div className="px-3 py-1.5 border-b border-[#EAE3D5] text-[10px] text-[#71808A]">
                Signed in as <strong className="text-[#24313A]">{currentUser?.username}</strong>
              </div>
              <div className="pt-1">
                <button
                  id="sidebar-logout-btn"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#E84D4D] hover:bg-[#FDE8E8] transition-colors text-left font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFCF8] border-t border-[#EAE3D5] flex items-center justify-around py-1.5 px-2 shadow-lg">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all relative ${
                isActive
                  ? 'text-[#C96A20] font-bold'
                  : 'text-[#71808A] font-medium'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">{item.label}</span>
              {item.id === 'emergency' && activeEmergenciesCount > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#E84D4D]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
