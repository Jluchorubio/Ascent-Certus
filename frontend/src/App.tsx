import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BookOpen,
  Target,
  BarChart3,
  Clock,
  ChevronRight,
  LayoutDashboard,
  Zap,
  Globe,
  MousePointer2,
  Info,
} from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import type { ActivePage, UserInfo } from './types/app';
import { api } from './services/api';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';

type Subject = {
  id: string;
  name: string;
  color: string;
  icon: JSX.Element;
  descripcion?: string | null;
  icono?: string | null;
};

type MateriaApi = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  color?: string | null;
};

type Cuestionario = {
  id: string;
  materia_id: string;
  nombre: string;
  cantidad_preguntas: number;
  tiempo_minutos: number;
};

type Opcion = {
  id: number;
  texto: string;
};

type Pregunta = {
  id: string;
  enunciado: string;
  nivel: 'FACIL' | 'MEDIO' | 'ALTO';
  subtema?: string | null;
  opciones: Opcion[];
};

type SesionPayload = {
  sesion: { id: string; iniciada_en: string };
  cuestionario: {
    id: string;
    nombre: string;
    cantidadPreguntas: number;
    tiempoMinutos: number;
  };
  pregunta: Pregunta;
};

type ResultadoSesion = {
  puntajeNumerico: 1 | 2 | 3;
  nivelFinal: 'BAJO' | 'MEDIO' | 'ALTO';
  proporcionPorNivel: Record<1 | 2 | 3, number>;
  tendencia: 'ascendente' | 'plana' | 'descendente';
};

type FinishPayload = {
  completed: true;
  resultado: ResultadoSesion;
  tiempoEmpleadoSegundos: number;
  desgloseSubtemas?: { subtema: string; total: number; correctas: number }[];
  timeout?: boolean;
};

type ProgressPayload = {
  completed: false;
  progreso: { respondidas: number; total: number };
  pregunta: Pregunta;
};

type HistorialItem = {
  id: string;
  user_id: string;
  cuestionario_id: string;
  materia_id: string;
  nivel_obtenido: 'BAJO' | 'MEDIO' | 'ALTO';
  puntaje_numerico: number;
  completado_en: string;
  tiempo_empleado_segundos: number;
  materia_nombre: string;
  materia_color: string | null;
};

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

type LandingPageProps = {
  onLoginClick: () => void;
};

type SubjectDashboardProps = {
  subject: Subject;
  principal?: Cuestionario;
  demo?: Cuestionario | null;
  stats: {
    bestScore: number;
    averageScore: number;
    attempts: number;
    lastLevel?: 'BAJO' | 'MEDIO' | 'ALTO';
  };
  onStartTest: (cuestionario: Cuestionario) => void;
};

type AnalyticsViewProps = {
  subjects: Subject[];
  historial: HistorialItem[];
  activeFilterId: string | null;
  onFilterChange: (id: string | null) => void;
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type,
  disabled,
}: ButtonProps) => {
  const base =
    'px-6 py-2.5 rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed';
  const styles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#00A8E8] text-white hover:bg-[#0086bc] shadow-lg shadow-blue-500/20',
    secondary:
      'bg-white text-[#00A8E8] border-2 border-[#00A8E8] hover:bg-blue-50',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    dark: 'bg-gray-900 text-white hover:bg-black',
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const LandingPage = ({ onLoginClick }: LandingPageProps) => (
  <div className="min-h-screen pt-20">
    <section className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-12">
      <div className="flex-1 text-center lg:text-left">
        <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          PREICFES <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-blue-600">
            Estudia y practica
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-xl">
          Te ofrecemos la forma más eficaz de estudiar y practicar para el examen ICFES Saber 11°
          de manera completamente gratuita. ¡Mejora tu futuro hoy!
        </p>
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          <Button onClick={onLoginClick}>Crear Cuenta</Button>
          <Button variant="secondary" onClick={onLoginClick}>
            Iniciar Sesión
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl transform hover:rotate-2 transition-transform duration-500">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
            alt="Estudiante"
            className="rounded-2xl"
          />
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl -z-10"></div>
      </div>
    </section>

    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-[#00A8E8] uppercase tracking-widest font-bold mb-4">¿ES POSIBLE?</h2>
        <h3 className="text-4xl font-bold text-gray-900 mb-12">Mejores puntajes</h3>
        <p className="max-w-2xl mx-auto text-gray-600 mb-16">
          Estamos comprometidos en ayudarte a alcanzar el mejor puntaje, por ello te ofrecemos una
          solución de práctica accesible para todos.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Flexibilidad',
              desc: 'Puedes estudiar a tu propio ritmo y en el horario más adecuado.',
              icon: <MousePointer2 className="w-8 h-8" />,
            },
            {
              title: 'Accesibilidad',
              desc: 'Podrás practicar desde tu pc o dispositivo móvil.',
              icon: <Globe className="w-8 h-8" />,
            },
            {
              title: 'Inmediatez',
              desc: 'Obtendrás de manera inmediata los resultados de tus simulacros.',
              icon: <Zap className="w-8 h-8" />,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-50 text-[#00A8E8] rounded-2xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h4 className="text-xl font-bold mb-4">{item.title}</h4>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
            alt="Equipo"
            className="rounded-[40px] shadow-2xl"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6">
            NOSOTROS <br /> <span className="text-[#00A8E8]">Preicfes.net</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Preicfes.net es una plataforma gratuita diseñada para ayudar a estudiantes que están
            por terminar su educación secundaria. Nuestro objetivo es apoyarles en la preparación
            para el examen ICFES Saber 11°, ofreciendo una herramienta de práctica y evaluación de
            conocimientos de alto nivel.
          </p>
          <Button>Preguntas Frecuentes</Button>
        </div>
      </div>
    </section>
  </div>
);

const SubjectDashboard = ({ subject, principal, demo, stats, onStartTest }: SubjectDashboardProps) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 rounded-lg bg-gray-100 text-[#00A8E8]">{subject.icon}</div>
      <h2 className="text-3xl font-bold text-gray-800">{subject.name}</h2>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <Zap className="w-8 h-8" />
        </div>
        <div>
          <p className="text-4xl font-bold">
            {stats.bestScore}
            <span className="text-xl text-gray-300 font-normal">/100</span>
          </p>
          <p className="text-sm text-gray-500">Mayor puntaje</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <Target className="w-8 h-8" />
        </div>
        <div>
          <p className="text-4xl font-bold">{stats.lastLevel || '---'}</p>
          <p className="text-sm text-gray-500">Desempeño en área</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <p className="text-4xl font-bold">
            {stats.attempts}
            <span className="text-xl text-gray-300 font-normal">/∞</span>
          </p>
          <p className="text-sm text-gray-500">Simulacros realizados</p>
        </div>
      </div>
    </div>

    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-12">
      <h3 className="text-xl font-bold mb-8 text-center">Posición a nivel {subject.name}</h3>
      <div className="max-w-2xl mx-auto relative mb-4">
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00A8E8] transition-all duration-1000"
            style={{ width: `${stats.averageScore}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-4 text-sm text-gray-500 font-medium">
          <span>0%</span>
          <span>20%</span>
          <span>40%</span>
          <span>60%</span>
          <span>80%</span>
          <span>100%</span>
        </div>
      </div>
      <p className="text-center text-gray-500 text-sm mt-8">
        Para lograr esta estadística, debes realizar una prueba principal de {subject.name}.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold mb-2">Prueba demo</h4>
          <p className="text-gray-500 italic">Demostración del examen</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl text-sm text-gray-600 mb-6 text-center">
          Es una prueba corta, te brinda la posibilidad de hacerte una idea del examen.
        </div>
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm py-2 border-b">
            <span>Cantidad de preguntas:</span>
            <span className="font-bold">{demo ? demo.cantidad_preguntas : '---'}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b">
            <span>Tiempo para la prueba:</span>
            <span className="font-bold">{demo ? `${demo.tiempo_minutos} min` : 'Sin límite'}</span>
          </div>
        </div>
        <Button className="w-full" variant="secondary" disabled={!demo} onClick={() => demo && onStartTest(demo)}>
          Iniciar Demo
        </Button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow ring-2 ring-blue-100">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold mb-2">Prueba principal</h4>
          <p className="text-gray-500 italic">Una sesión del examen saber 11°</p>
        </div>
        <div className="bg-blue-50/50 p-6 rounded-2xl text-sm text-gray-600 mb-6 text-center">
          Es una prueba con mayor número de preguntas, muy similar al examen real.
        </div>
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm py-2 border-b">
            <span>Cantidad de preguntas:</span>
            <span className="font-bold">{principal ? principal.cantidad_preguntas : '---'}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b">
            <span>Tiempo para la prueba:</span>
            <span className="font-bold">{principal ? `${principal.tiempo_minutos} min` : '---'}</span>
          </div>
        </div>
        <Button className="w-full" disabled={!principal} onClick={() => principal && onStartTest(principal)}>
          Comenzar
        </Button>
      </div>
    </div>
  </div>
);

const AnalyticsView = ({ subjects, historial, activeFilterId, onFilterChange }: AnalyticsViewProps) => {
  const filteredHistorial = activeFilterId
    ? historial.filter((item) => item.materia_id === activeFilterId)
    : historial;

  const chartData = filteredHistorial.map((item, index) => ({
    label: `Intento ${index + 1}`,
    fecha: new Date(item.completado_en).toLocaleDateString('es-CO'),
    [item.materia_id]: item.puntaje_numerico,
  }));

  const subjectsToShow = activeFilterId
    ? subjects.filter((s) => s.id === activeFilterId)
    : subjects;

  return (
    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Progreso por Módulo</h2>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => onFilterChange(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                activeFilterId
                  ? 'border-gray-200 text-gray-500'
                  : 'border-[#00A8E8] text-[#00A8E8]'
              }`}
            >
              Todas
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => onFilterChange(s.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  activeFilterId === s.id ? 'text-white' : ''
                }`}
                style={{
                  borderColor: `${s.color}44`,
                  color: activeFilterId === s.id ? '#fff' : s.color,
                  backgroundColor: activeFilterId === s.id ? s.color : 'transparent',
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {subjectsToShow.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
              style={{ borderColor: `${s.color}44`, color: s.color }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
              {s.name}
            </div>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            Aún no hay resultados para mostrar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                dy={15}
              />
              <YAxis
                domain={[1, 3]}
                ticks={[1, 2, 3]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                dx={-10}
                tickFormatter={(val) => (val === 1 ? 'Bajo' : val === 2 ? 'Medio' : 'Alto')}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}
                formatter={(value, _name, props) => [
                  value,
                  `Nivel (${props?.payload?.fecha || ''})`,
                ]}
              />
              {subjectsToShow.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  stroke={s.color}
                  strokeWidth={4}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const scoreToPercent = (avg: number) => {
  if (!avg) return 0;
  return Math.max(0, Math.min(100, Math.round(((avg - 1) / 2) * 100)));
};

const iconForMateria = (materia: MateriaApi) => {
  const name = `${materia.icono || ''} ${materia.nombre}`.toLowerCase();
  if (name.includes('mat')) return <Target className="w-5 h-5" />;
  if (name.includes('cien')) return <Zap className="w-5 h-5" />;
  if (name.includes('lect')) return <BookOpen className="w-5 h-5" />;
  if (name.includes('ingl') || name.includes('english')) return <Globe className="w-5 h-5" />;
  if (name.includes('social')) return <Info className="w-5 h-5" />;
  return <BarChart3 className="w-5 h-5" />;
};

const levelCopy: Record<ResultadoSesion['nivelFinal'], { title: string; desc: string }> = {
  ALTO: {
    title: 'Nivel Alto',
    desc: 'Excelente desempeño. Has sostenido un nivel alto y una tendencia ascendente.',
  },
  MEDIO: {
    title: 'Nivel Medio',
    desc: 'Buen trabajo. Tu rendimiento fue estable con avances consistentes.',
  },
  BAJO: {
    title: 'Nivel Bajo',
    desc: 'Puedes mejorar con práctica adicional. Enfócate en fortalecer los fundamentos.',
  },
};

const mapUserInfo = (data: { id?: string; nombre?: string; name?: string; email?: string; rol?: string; role?: string }) => ({
  id: data.id || '',
  name: data.nombre || data.name || '',
  email: data.email || '',
  role: (data.rol || data.role || 'STUDENT') as UserInfo['role'],
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [is2FAPending, setIs2FAPending] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Pregunta | null>(null);
  const [currentSession, setCurrentSession] = useState<SesionPayload | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [progress, setProgress] = useState({ respondidas: 0, total: 0 });
  const [sessionEndAt, setSessionEndAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [resultData, setResultData] = useState<FinishPayload | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [chartFilter, setChartFilter] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const twoFaDigitsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [twoFaDigits, setTwoFaDigits] = useState(Array.from({ length: 6 }, () => ''));

  const historialByMateria = useMemo(() => {
    const map = new Map<string, HistorialItem[]>();
    historial.forEach((item) => {
      const list = map.get(item.materia_id) || [];
      list.push(item);
      map.set(item.materia_id, list);
    });
    return map;
  }, [historial]);

  const lastResult = historial.length ? historial[historial.length - 1] : null;

  const computeStats = (subjectId: string) => {
    const items = historialByMateria.get(subjectId) || [];
    if (items.length === 0) {
      return { bestScore: 0, averageScore: 0, attempts: 0, lastLevel: undefined };
    }

    const avg = items.reduce((sum, item) => sum + item.puntaje_numerico, 0) / items.length;
    const best = Math.max(...items.map((item) => item.puntaje_numerico));
    const lastLevel = items[items.length - 1]?.nivel_obtenido;

    return {
      bestScore: scoreToPercent(best),
      averageScore: scoreToPercent(avg),
      attempts: items.length,
      lastLevel,
    };
  };

  const loadMaterias = async () => {
    const data = await api.listMaterias();
    const materias = (data.materias as MateriaApi[]).map((materia) => ({
      id: materia.id,
      name: materia.nombre,
      descripcion: materia.descripcion || null,
      icono: materia.icono || null,
      color: materia.color || '#00A8E8',
      icon: iconForMateria(materia),
    }));
    setSubjects(materias);
  };

  const loadHistorial = async () => {
    const data = await api.listHistorial();
    setHistorial(data.historial as HistorialItem[]);
  };

  const loadCuestionarios = async (materiaId: string) => {
    const data = await api.listCuestionarios(materiaId);
    setCuestionarios(data.cuestionarios as Cuestionario[]);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      const data = await api.login(email, password);
      if (data.requires2FA) {
        setIs2FAPending(true);
        setPendingUserId(data.userId || null);
        setPendingEmail(data.email || null);
        return;
      }

      const userData = mapUserInfo(data.user as { id?: string; nombre?: string; name?: string; email?: string; rol?: string; role?: string });
      setUser(userData);
      setIsAuthenticated(true);
      setActivePage('dashboard');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handleVerify2FA = async () => {
    setTwoFaError(null);
    if (!pendingUserId) {
      setTwoFaError('No se encontró el usuario pendiente');
      return;
    }

    const code = twoFaDigits.join('');
    if (code.length !== 6) {
      setTwoFaError('Ingresa el código completo');
      return;
    }

    try {
      const data = await api.verify2FA(pendingUserId, code);
      const userData = mapUserInfo(data.user as { id?: string; nombre?: string; name?: string; email?: string; rol?: string; role?: string });
      setUser(userData);
      setIsAuthenticated(true);
      setIs2FAPending(false);
      setActivePage('dashboard');
    } catch (error) {
      setTwoFaError(error instanceof Error ? error.message : 'Error al verificar el código');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setUser(null);
    setActivePage('landing');
    setSelectedSubject(null);
  };

  const startTest = async (cuestionario: Cuestionario) => {
    setResultData(null);
    setSelectedOptionId(null);
    setIsSubmittingAnswer(false);

    try {
      const data = (await api.startSesion(cuestionario.id)) as SesionPayload;
      setCurrentSession(data);
      setCurrentQuestion(data.pregunta);
      setProgress({ respondidas: 0, total: data.cuestionario.cantidadPreguntas });

      const start = new Date(data.sesion.iniciada_en).getTime();
      const endAt = start + data.cuestionario.tiempoMinutos * 60 * 1000;
      setSessionEndAt(endAt);
      setTimeRemaining(Math.max(0, Math.floor((endAt - Date.now()) / 1000)));
      setActivePage('test');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error iniciando la sesión');
    }
  };

  const handleAnswer = async () => {
    if (!currentSession || !currentQuestion || selectedOptionId === null || isSubmittingAnswer) {
      return;
    }

    setIsSubmittingAnswer(true);
    try {
      const response = (await api.answerPregunta(
        currentSession.sesion.id,
        currentQuestion.id,
        selectedOptionId
      )) as FinishPayload | ProgressPayload;

      if (response.completed) {
        setResultData(response as FinishPayload);
        setActivePage('result');
        setCurrentQuestion(null);
        setCurrentSession(null);
        setSessionEndAt(null);
        await loadHistorial();
      } else {
        setCurrentQuestion((response as ProgressPayload).pregunta);
        setProgress((response as ProgressPayload).progreso);
        setSelectedOptionId(null);
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error enviando respuesta');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const finishByTimeout = async () => {
    if (!currentSession || isFinishing) return;
    setIsFinishing(true);
    try {
      const response = (await api.finishSesion(currentSession.sesion.id)) as FinishPayload;
      setResultData(response);
      setActivePage('result');
      setCurrentQuestion(null);
      setCurrentSession(null);
      setSessionEndAt(null);
      await loadHistorial();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error finalizando la sesión');
    } finally {
      setIsFinishing(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.me();
        const userData = mapUserInfo(data.user as { id?: string; nombre?: string; name?: string; email?: string; rol?: string; role?: string });
        setUser(userData);
        setIsAuthenticated(true);
        setActivePage('dashboard');
      } catch {
        setIsAuthenticated(false);
        setActivePage('landing');
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAll = async () => {
      await Promise.all([loadMaterias(), loadHistorial()]);
    };

    loadAll();

    const interval = setInterval(() => {
      loadHistorial();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedSubject) return;
    loadCuestionarios(selectedSubject.id);
  }, [selectedSubject]);

  useEffect(() => {
    if (!sessionEndAt || activePage !== 'test') return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((sessionEndAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        finishByTimeout();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [sessionEndAt, activePage]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
        Cargando...
      </div>
    );
  }

  const questionNumber = progress.respondidas + 1;
  const timerColor = timeRemaining <= 60 ? 'text-red-500 bg-red-500/20 border-red-500/30' :
    timeRemaining <= 180 ? 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30' :
      'text-green-500 bg-green-500/20 border-green-500/30';

  const sortedCuestionarios = [...cuestionarios].sort(
    (a, b) => a.cantidad_preguntas - b.cantidad_preguntas
  );
  const demoCuestionario = sortedCuestionarios.length > 1 ? sortedCuestionarios[0] : null;
  const principalCuestionario = sortedCuestionarios.length > 0
    ? sortedCuestionarios[sortedCuestionarios.length - 1]
    : undefined;

  if (!isAuthenticated) {
    if (is2FAPending) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
            <div className="w-16 h-16 bg-blue-50 text-[#00A8E8] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verificación en 2 pasos</h2>
            <p className="text-gray-500 mb-2">
              Ingresa el código que enviamos a tu correo institucional
            </p>
            {pendingEmail && (
              <p className="text-gray-400 text-sm mb-6">{pendingEmail}</p>
            )}
            <div className="flex justify-between gap-2 mb-4">
              {twoFaDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { twoFaDigitsRef.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, '');
                    const next = [...twoFaDigits];
                    next[index] = value;
                    setTwoFaDigits(next);
                    if (value && twoFaDigitsRef.current[index + 1]) {
                      twoFaDigitsRef.current[index + 1]?.focus();
                    }
                  }}
                  className="w-12 h-14 border-2 border-gray-100 rounded-xl text-center text-xl font-bold focus:border-[#00A8E8] focus:outline-none"
                />
              ))}
            </div>
            {twoFaError && <p className="text-sm text-red-500 mb-4">{twoFaError}</p>}
            <Button className="w-full" onClick={handleVerify2FA}>
              Verificar y Entrar
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white selection:bg-blue-100 min-h-screen flex flex-col">
        <Header setActivePage={setActivePage} isAuthenticated={false} onLogin={() => setActivePage('login')} />
        {activePage === 'login' ? (
          <div className="min-h-screen pt-32 px-4 bg-gray-50">
            <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
              <h2 className="text-3xl font-bold mb-6">Bienvenido de nuevo</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="pedro@colegio.edu.co"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A8E8] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A8E8] outline-none"
                    required
                  />
                </div>
                {loginError && <p className="text-sm text-red-500">{loginError}</p>}
                <Button className="w-full pt-4" type="submit">
                  Ingresar
                </Button>
              </form>
              <button
                onClick={() => setActivePage('landing')}
                className="w-full text-center mt-6 text-sm text-gray-400 hover:text-gray-600"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        ) : (
          <>
            <LandingPage onLoginClick={() => setActivePage('login')} />
            <Footer />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={user || undefined} onLogout={logout} setActivePage={setActivePage} isAuthenticated />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 flex-1">
        <div className="flex flex-wrap gap-4 mb-12">
          <button
            onClick={() => {
              setActivePage('dashboard');
              setSelectedSubject(null);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
              activePage === 'dashboard' && !selectedSubject
                ? 'bg-[#00A8E8] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={20} /> Resumen General
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => {
                setSelectedSubject(subject);
                setActivePage('subject');
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                selectedSubject?.id === subject.id
                  ? 'bg-[#00A8E8] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {subject.icon} {subject.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            {activePage === 'dashboard' && (
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Hola, {user?.name} 👋</h1>
                    <p className="text-gray-500">
                      Aquí tienes un resumen de tu progreso en los módulos del ICFES.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Último Simulacro</p>
                      <p className="font-bold text-gray-700 text-lg">
                        {lastResult ? lastResult.materia_nombre : 'Sin registros'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00A8E8] flex items-center justify-center">
                      <Zap size={24} />
                    </div>
                  </div>
                </div>

                <AnalyticsView
                  subjects={subjects}
                  historial={historial}
                  activeFilterId={chartFilter}
                  onFilterChange={setChartFilter}
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subjects.map((s) => {
                    const stats = computeStats(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedSubject(s);
                          setActivePage('subject');
                        }}
                        className="group bg-white p-6 rounded-3xl border border-gray-100 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${s.color}15`, color: s.color }}
                          >
                            {s.icon}
                          </div>
                          <ChevronRight className="text-gray-300 group-hover:text-[#00A8E8] transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{s.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">Puntaje global: {stats.averageScore}/100</p>
                        <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00A8E8] transition-all duration-700"
                            style={{ width: `${stats.averageScore}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activePage === 'subject' && selectedSubject && (
              <SubjectDashboard
                subject={selectedSubject}
                principal={principalCuestionario}
                demo={demoCuestionario}
                stats={computeStats(selectedSubject.id)}
                onStartTest={(cuestionario) => {
                  setSelectedSubject(selectedSubject);
                  startTest(cuestionario);
                }}
              />
            )}

            {activePage === 'test' && selectedSubject && currentQuestion && currentSession && (
              <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in duration-500">
                <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{selectedSubject.name}</h2>
                    <p className="text-gray-400 text-sm">
                      {currentSession.cuestionario.nombre} • Pregunta {questionNumber} de {progress.total}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xl font-bold ${timerColor}`}>
                      <Clock size={20} /> {formatSeconds(timeRemaining)}
                    </div>
                  </div>
                </div>
                <div className="p-12">
                  <div className="h-2 w-full bg-gray-100 rounded-full mb-12">
                    <div
                      className="h-full bg-[#00A8E8] rounded-full shadow-lg shadow-blue-500/20 transition-all duration-500"
                      style={{ width: `${(progress.respondidas / Math.max(progress.total, 1)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-4">
                    Pregunta Adaptativa (Nivel: {currentQuestion.nivel})
                  </p>
                  <h3 className="text-2xl font-bold mb-10 leading-relaxed">
                    {currentQuestion.enunciado}
                  </h3>
                  <div className="space-y-4 mb-12">
                    {currentQuestion.opciones.map((opt, i) => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedOptionId(opt.id)}
                          className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                            isSelected
                              ? 'border-[#00A8E8] bg-blue-50'
                              : 'border-gray-100 hover:border-[#00A8E8] hover:bg-blue-50'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                              isSelected
                                ? 'bg-[#00A8E8] text-white'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-[#00A8E8] group-hover:text-white'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-gray-700 font-medium">{opt.texto}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm italic">
                      Tu respuesta se guardará automáticamente al avanzar.
                    </p>
                    <Button onClick={handleAnswer} disabled={selectedOptionId === null || isSubmittingAnswer}>
                      Siguiente Pregunta
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'result' && resultData && (
              <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in duration-500">
                <div className="bg-gray-900 p-8 text-white">
                  <h2 className="text-2xl font-bold mb-2">Resultado final</h2>
                  <p className="text-gray-400 text-sm">{selectedSubject?.name}</p>
                </div>
                <div className="p-12 space-y-10">
                  <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-8 text-center">
                    <p className="text-sm uppercase tracking-widest text-blue-500 font-bold mb-2">Nivel alcanzado</p>
                    <h3 className="text-4xl font-bold mb-3">{levelCopy[resultData.resultado.nivelFinal].title}</h3>
                    <p className="text-gray-600">{levelCopy[resultData.resultado.nivelFinal].desc}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 mb-1">Tiempo empleado</p>
                      <p className="text-2xl font-bold">{formatSeconds(resultData.tiempoEmpleadoSegundos)}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 mb-1">Tendencia</p>
                      <p className="text-2xl font-bold capitalize">{resultData.resultado.tendencia}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 mb-1">Puntaje</p>
                      <p className="text-2xl font-bold">{resultData.resultado.puntajeNumerico}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <h4 className="text-xl font-bold mb-4">Desglose por subtema</h4>
                    {resultData.desgloseSubtemas && resultData.desgloseSubtemas.length > 0 ? (
                      <div className="space-y-3">
                        {resultData.desgloseSubtemas.map((subtema) => (
                          <div key={subtema.subtema} className="flex justify-between text-sm border-b pb-2">
                            <span>{subtema.subtema}</span>
                            <span className="font-semibold">
                              {subtema.correctas}/{subtema.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No hay subtemas registrados para este cuestionario.</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setActivePage('dashboard');
                        setSelectedSubject(null);
                        setResultData(null);
                      }}
                    >
                      Volver al inicio
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
