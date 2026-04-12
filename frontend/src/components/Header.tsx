import type { Dispatch, SetStateAction } from 'react';
import { User, LogOut } from 'lucide-react';
import LogoMark from './LogoMark';
import type { ActivePage, UserInfo } from '../types/app';

type HeaderProps = {
  user?: UserInfo;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onLogin?: () => void;
  setActivePage?: Dispatch<SetStateAction<ActivePage>>;
};

const Header = ({ user, isAuthenticated, onLogout, onLogin, setActivePage }: HeaderProps) => (
  <nav className="fixed top-0 left-0 right-0 bg-[#00A8E8] shadow-sm z-50 border-b border-[#00A8E8]">
    <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setActivePage?.(isAuthenticated ? 'dashboard' : 'landing')}
      >
        <div className="h-11 w-11 rounded-2xl bg-white/15 border border-white/30 grid place-items-center shadow-sm">
          <LogoMark className="h-7 w-7 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">
          Ascent Certus
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => setActivePage?.('dashboard')}
              className="text-white/90 hover:text-white font-medium transition-colors"
            >
              Mi Progreso
            </button>
            <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full border border-white/20 group cursor-pointer relative">
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <span className="font-semibold text-white">{user?.name || 'Estudiante'}</span>
              <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-xl border border-gray-100 py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                  <User size={14} /> Mi Cuenta
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-500 border-t"
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="text-white/90 hover:text-white font-medium transition-colors"
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </div>
  </nav>
);

export default Header;
