import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthShell, FloatingInput, Divider, SocialRow } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — VibeStream" }] }),
  component: Register,
});

function Register() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate({ to: "/dashboard" });
    } catch {
      setError("Could not create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start streaming in under a minute.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FloatingInput icon={User} label="Full name" value={name} onChange={setName} />
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
        <p className="text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={loading}
          className="h-12 rounded-xl bg-gradient-hero shadow-glow font-semibold mt-2 hover:scale-[1.01] transition disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <Divider />
      <SocialRow />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--neon-cyan)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
