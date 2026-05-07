import { useState, useEffect } from "react";
import fondo from "../assets/fotoparalogindecor.jpg";
import logo from "../assets/SOL_SECURITY_AZUL.png";
import { useNavigate } from "react-router-dom";


function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();
  const navigate = useNavigate();


  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Credenciales estáticas — cámbialas a tu gusto
const STATIC_USERS = [
  { username: "admin", password: "admin123" },
  { username: "fer",   password: "sol2026"  },
];

const handleSubmit = (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  setTimeout(() => {
    const match = STATIC_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (match) {
      // 👉 guardar sesión
      localStorage.setItem("user", JSON.stringify(match));

      // 👉 redirigir
      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos.");
    }

    setLoading(false);
  }, 600);
};

  /* ── Mobile layout ── */
  if (isMobile) {
    return (
      <div style={m.page}>
        <div style={m.header}>
          <div style={m.blob1} />
          <div style={m.blob2} />
          <div style={m.headerContent}>
            <div>
              <p style={m.logoLabel}>SOL SECURITY</p>
              <h1 style={m.welcome}>Bienvenido.</h1>
            </div>
          </div>
        </div>

        <div style={m.card}>
          {/* Logo integrado sin fondo */}
          <div style={m.logoWrap}>
            <img src={logo} alt="Sol Security" style={m.logoImg} />
          </div>
          <p style={m.cardTitle}>Inicio de Sesión</p>

          <form onSubmit={handleSubmit} style={m.form}>
            <div style={m.inputWrap}>
              <UserIcon />
              <input type="text" placeholder="Usuario" value={username}
                onChange={(e) => setUsername(e.target.value)} required style={m.input} />
            </div>
            <div style={m.inputWrap}>
              <LockIcon />
              <input type="password" placeholder="Contraseña" value={password}
                onChange={(e) => setPassword(e.target.value)} required style={m.input} />
            </div>
            {error && <p style={m.error}>{error}</p>}
            <button type="submit" style={m.btn} disabled={loading}>
              {loading ? "INGRESANDO..." : "Entrar"}
            </button>
          </form>

          <div style={m.links}>
            <span style={m.linkText}>Registrate</span>
            <span style={m.linkText}>¿Olvidaste la contraseña?</span>
          </div>

          <div style={m.dots}>
            <div style={{ ...m.dot, background: "rgba(255,255,255,0.75)" }} />
            <div style={m.dot} />
            <div style={m.dot} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Desktop layout ── */
  return (
    <div style={d.page}>
      <div style={d.root}>

        {/* ── Panel izquierdo ── */}
        <div style={d.left}>

          {/* Logo + nombre empresa */}
          <div style={d.brandWrap}>
          <div style={d.logoImgWrap}>
            <img src={logo} alt="Sol Security" style={d.logoImg} />
          </div>
        </div>

          <div style={d.divider} />

          <p style={d.formTitle}>Inicio de Sesión</p>

          <form onSubmit={handleSubmit} style={d.form}>
            <div style={d.inputWrap}>
              <UserIcon />
              <input type="text" placeholder="Usuario" value={username}
                onChange={(e) => setUsername(e.target.value)} required style={d.input} />
            </div>
            <div style={d.inputWrap}>
              <LockIcon />
              <input type="password" placeholder="Contraseña" value={password}
                onChange={(e) => setPassword(e.target.value)} required style={d.input} />
            </div>
            {error && <p style={d.error}>{error}</p>}
            <button type="submit" style={d.btn} disabled={loading}>
              {loading ? "INGRESANDO..." : "Entrar"}
            </button>
          </form>

          <div style={d.links}>
            <span style={d.linkText}>Registrate</span>
            <span style={d.linkText}>¿Olvidaste la contraseña?</span>
          </div>

          <div style={d.dots}>
            <div style={{ ...d.dot, background: "rgba(255,255,255,0.75)" }} />
            <div style={d.dot} />
            <div style={d.dot} />
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div style={d.right}>
          {/* Overlay suave — más bajo para que se vea la foto */}
          <div style={d.overlay} />

          {/* Botón Ingresar arriba a la derecha */}
          <nav style={d.nav}>
            <span style={d.navCta}>Ingresar</span>
          </nav>

          {/* Texto centrado */}
          <div style={d.welcomeWrap}>
            <p style={d.welcomeEyebrow}>Sistema de Gestión Gráfica</p>
            <h1 style={d.welcome}>Bienvenido.</h1>
            <div style={d.welcomeLine} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Íconos ── */
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
      <circle cx="7" cy="5" r="3" stroke="white" strokeWidth="1.3" />
      <path d="M1 13c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
      <rect x="2" y="6" width="10" height="7" rx="2" stroke="white" strokeWidth="1.3" />
      <path d="M5 6V4a2 2 0 014 0v2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ══════════════════════════════════════
   DESKTOP STYLES  (≥768px)
══════════════════════════════════════ */
const d = {
  page: {
    position: "fixed", inset: 0,
    background: "linear-gradient(135deg, #060d1f 0%, #0d1b3e 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "32px",
  },
  root: {
    display: "flex", width: "100%", maxWidth: "1000px", minHeight: "560px",
    borderRadius: "20px", overflow: "hidden",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 32px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
  },

  /* Panel izquierdo */
  left: {
    width: "40%", background: "#0b1630",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 36px", gap: "20px", position: "relative",
  },
  brandWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
  },
  logoImgWrap: {
    width: "150px",   // 👈 aquí controlas tamaño del contenedor
    height: "100px",
    borderRadius: "12px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  },
  logoImg: {
    width: "90%",   // 👈 se adapta al contenedor
    height: "100%",
    objectFit: "contain",
  },
  brandName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#fff",
    letterSpacing: "0.05em",
    textAlign: "center",
  },
  brandSub: {
    margin: "2px 0 0", fontSize: "11px",
    color: "rgba(255,255,255,0.4)", letterSpacing: "0.03em",
  },
  divider: {
    width: "100%", height: "1px",
    background: "rgba(255,255,255,0.07)",
  },
  formTitle: {
    margin: 0, width: "100%",
    fontSize: "13px", fontWeight: "500",
    color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  form: { width: "100%", display: "flex", flexDirection: "column", gap: "14px" },
  inputWrap: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "0 16px", height: "48px",
    transition: "border-color 0.2s",
  },
  input: {
    background: "none", border: "none", outline: "none",
    color: "#fff", fontSize: "14px", width: "100%", fontFamily: "inherit",
  },
  btn: {
    width: "100%", height: "48px",
    background: "linear-gradient(135deg, #f5a623 0%, #f7c06e 100%)",
    color: "#0b1630", border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: "700", letterSpacing: "0.08em",
    cursor: "pointer", transition: "opacity 0.2s, transform 0.1s",
    fontFamily: "inherit",
  },
  error: { color: "#f0a0a0", fontSize: "12px", margin: 0, textAlign: "center" },
  links: { display: "flex", justifyContent: "space-between", width: "100%" },
  linkText: {
    fontSize: "11px", color: "rgba(255,255,255,0.35)",
    cursor: "pointer", transition: "color 0.2s",
  },
  dots: { display: "flex", gap: "6px", marginTop: "4px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" },

  /* Panel derecho */
  right: {
    width: "60%", position: "relative", overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundImage: `url(${fondo})`,
    backgroundSize: "cover", backgroundPosition: "center",
  },
  overlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(135deg, rgba(6,13,31,0.55) 0%, rgba(13,27,62,0.35) 100%)",
    zIndex: 1,
  },
  nav: {
    position: "absolute", top: "20px", right: "20px",
    display: "flex", gap: "8px", zIndex: 4, alignItems: "center",
  },
  navCta: {
    fontSize: "12px", color: "#fff", cursor: "pointer",
    padding: "5px 14px", borderRadius: "20px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    backdropFilter: "blur(8px)",
  },
  welcomeWrap: {
    position: "relative", zIndex: 2,
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    padding: "0 48px",
  },
  welcomeEyebrow: {
    margin: "0 0 8px",
    fontSize: "12px", fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.15em", textTransform: "uppercase",
  },
  welcome: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "64px", fontWeight: "800",
    color: "#fff", margin: 0,
    letterSpacing: "-0.03em",
    lineHeight: 1,
    textShadow: "0 4px 32px rgba(0,0,0,0.4)",
  },
  welcomeLine: {
    marginTop: "16px",
    width: "48px", height: "3px",
    background: "linear-gradient(90deg, #f5a623, #f7c06e)",
    borderRadius: "2px",
  },
};

/* ══════════════════════════════════════
   MOBILE STYLES  (<768px)
══════════════════════════════════════ */
const m = {
  page: {
    position: "fixed", inset: 0,
    background: "linear-gradient(135deg, #060d1f 0%, #0d1b3e 100%)",
    display: "flex", flexDirection: "column",
    fontFamily: "'DM Sans', sans-serif", overflowY: "auto",
  },
  header: {
    position: "relative", height: "200px", flexShrink: 0,
    backgroundImage: `url(${fondo})`,
    backgroundSize: "cover", backgroundPosition: "center",
    overflow: "hidden",
    display: "flex", alignItems: "flex-end", padding: "0 28px 32px",
  },
  blob1: {
    position: "absolute", inset: 0,
    background: "linear-gradient(135deg, rgba(6,13,31,0.6) 0%, rgba(13,27,62,0.4) 100%)",
    zIndex: 1,
  },
  blob2: { display: "none" },
  headerContent: {
    position: "relative", zIndex: 2, width: "100%",
  },
  logoLabel: {
    margin: "0 0 4px", fontSize: "11px", fontWeight: "600",
    color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em", textTransform: "uppercase",
  },
  welcome: {
    fontFamily: "'Syne', sans-serif", fontSize: "38px", fontWeight: "800",
    color: "#fff", margin: 0, letterSpacing: "-0.02em",
  },
  card: {
    flex: 1, background: "#0b1630",
    borderRadius: "24px 24px 0 0", marginTop: "-16px",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "32px 28px 48px", gap: "18px",
    position: "relative", zIndex: 3,
  },
  logoWrap: {
    width: "64px", height: "64px", borderRadius: "14px",
    background: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  logoImg: { width: "56px", height: "56px", objectFit: "contain" },
  cardTitle: {
    margin: 0, fontSize: "13px", fontWeight: "500",
    color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  form: { width: "100%", display: "flex", flexDirection: "column", gap: "12px" },
  inputWrap: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "0 16px", height: "50px",
  },
  input: {
    background: "none", border: "none", outline: "none",
    color: "#fff", fontSize: "15px", width: "100%", fontFamily: "inherit",
  },
  btn: {
    width: "100%", height: "50px",
    background: "linear-gradient(135deg, #f5a623 0%, #f7c06e 100%)",
    color: "#0b1630", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", letterSpacing: "0.06em",
    cursor: "pointer", fontFamily: "inherit",
  },
  error: { color: "#f0a0a0", fontSize: "12px", margin: 0, textAlign: "center" },
  links: { display: "flex", justifyContent: "space-between", width: "100%" },
  linkText: { fontSize: "12px", color: "rgba(255,255,255,0.35)", cursor: "pointer" },
  dots: { display: "flex", gap: "6px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" },
};