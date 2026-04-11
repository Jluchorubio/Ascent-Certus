import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';

const Footer = () => (
  <footer className="bg-[#0B1F2A] text-white">
    <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-4 gap-10">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#00A8E8] p-1.5 rounded-lg">
            <CheckCircle2 className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#00A8E8]">
            Preicfes<span className="text-gray-400">.net</span>
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
            <Mail size={16} /> soporte@preicfes.net
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} /> +57 300 123 4567
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} /> Bogotá, Colombia
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
        <span>© {new Date().getFullYear()} Preicfes.net</span>
        <span className="mt-2 md:mt-0">Resultados adaptativos y métricas en tiempo real.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
