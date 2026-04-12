import { Mail, MapPin, Phone } from 'lucide-react';
import LogoMark from './LogoMark';

const Footer = () => (
  <footer className="bg-[#0B1F2A] text-white">
    <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-4 gap-10">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 grid place-items-center">
            <LogoMark className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Ascent Certus
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Evaluaciones adaptativas para instituciones educativas. Potenciamos el progreso con datos
          reales y rutas personalizadas.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Plataforma</h4>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>Panel de desempeño</li>
          <li>Módulos adaptativos</li>
          <li>Reportes históricos</li>
          <li>Seguridad institucional</li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Recursos</h4>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>Guía para docentes</li>
          <li>Manual del estudiante</li>
          <li>Preguntas frecuentes</li>
          <li>Soporte técnico</li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Contacto</h4>
        <div className="space-y-3 text-sm text-slate-200">
          <div className="flex items-center gap-2">
            <Mail size={16} /> soporte@ascentcertus.com
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} /> +57 300 123 4567
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} /> Bogota, Colombia
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
        <span>© {new Date().getFullYear()} Ascent Certus</span>
        <span className="mt-2 md:mt-0">Resultados adaptativos y métricas en tiempo real.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
