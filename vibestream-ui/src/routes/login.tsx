import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Radio } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — VibeStream" },
      { name: "description", content: "Sign in to your VibeStream account." },
    ],
  }),
  component: Login,
});

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your stream.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FloatingInput icon={Mail} label="Email" type="email" value={email} onChange={setEmail} />
        <FloatingInput
          icon={Lock}
          label="Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          suffix={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle password"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="accent-[var(--neon-purple)]" /> Remember me
          </label>
          <a className="text-[var(--neon-cyan)] hover:underline" href="#">
            Forgot password?
          </a>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={loading}
          className="h-12 rounded-xl bg-gradient-hero shadow-glow font-semibold mt-2 hover:scale-[1.01] transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Divider />
      <SocialRow />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-[var(--neon-cyan)] hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-[var(--neon-purple)]/30 blur-[120px] animate-glow" />
        <div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[var(--neon-cyan)]/25 blur-[140px] animate-glow"
          style={{ animationDelay: "2s" }}
        />
      </div>
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-white/5 glass-strong">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-hero shadow-glow grid place-items-center">
            <Radio size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">VibeStream</span>
        </Link>
        <div>
          <h2 className="text-4xl font-display font-bold leading-tight">
            A studio-grade
            <br />
            stream, in your pocket.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Powered by a cloud-native architecture: Nginx, Node.js, PostgreSQL, MinIO, Prometheus,
            Grafana.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            "from-purple-500 to-cyan-400",
            "from-pink-500 to-purple-600",
            "from-emerald-400 to-cyan-500",
          ].map((g, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl bg-gradient-to-br ${g} animate-float`}
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-strong rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-elevated"
        >
          <h1 className="text-3xl font-display font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function FloatingInput({
  icon: Icon,
  label,
  type = "text",
  suffix,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  type?: string;
  suffix?: React.ReactNode;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const [internal, setInternal] = useState("");
  const [focus, setFocus] = useState(false);
  const v = value ?? internal;
  const setV = onChange ?? setInternal;
  const float = focus || v.length > 0;
  return (
    <div className="relative">
      <Icon
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type={type}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="peer w-full h-14 pl-11 pr-12 pt-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--neon-cyan)]/20 text-sm transition"
      />
      <label
        className={`absolute left-11 transition-all pointer-events-none ${float ? "top-1.5 text-[10px] uppercase tracking-wider text-[var(--neon-cyan)]" : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"}`}
      >
        {label}
      </label>
      {suffix && <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex-1 h-px bg-white/10" />
      OR
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

export function SocialRow() {
  const btn =
    "h-11 rounded-xl glass hover:bg-white/10 font-medium text-sm transition flex items-center justify-center gap-2";
  return (
    <div className="grid grid-cols-3 gap-3">
      <button className={btn}>
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1S8.7 5.9 12 5.9c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z"
          />
        </svg>
        Google
      </button>
      <button className={btn}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
          <path d="M16.4 12.3c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.8-3.6.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.4 1.3-2.7 1.3-2.7-.1 0-2.6-1-2.6-3.9zM14 4.7c.7-.8 1.1-1.9 1-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z" />
        </svg>
        Apple
      </button>
      <button className={btn}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
          <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
        </svg>
        GitHub
      </button>
    </div>
  );
}
