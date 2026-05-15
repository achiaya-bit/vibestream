import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, Sparkles, Cloud, Headphones, Shield, Zap, ChevronRight, Radio, Music } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeStream — Cloud-native music streaming for the next era" },
      { name: "description", content: "VibeStream is a futuristic cloud music streaming platform with elastic infrastructure, real-time monitoring, and a premium player experience." },
      { property: "og:title", content: "VibeStream — Cloud-native music streaming" },
      { property: "og:description", content: "Stream your sound. Powered by a modern cloud architecture." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-[var(--neon-purple)]/30 blur-[120px] animate-glow" />
        <div className="absolute top-1/2 right-0 h-[28rem] w-[28rem] rounded-full bg-[var(--neon-cyan)]/25 blur-[140px] animate-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[var(--neon-pink)]/20 blur-[120px] animate-glow" style={{ animationDelay: "3s" }} />
      </div>

      <Nav />

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-32 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium tracking-wide text-muted-foreground">
            <Sparkles size={14} className="text-[var(--neon-cyan)]" /> Cloud-native · Edge streaming · Real-time monitoring
          </span>
          <h1 className="mt-6 text-5xl sm:text-7xl font-display font-bold leading-[1.05]">
            Stream your sound.
            <br />
            <span className="text-gradient">Powered by the cloud.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            VibeStream is a production-grade music streaming platform built on a modern cloud architecture — Nginx, Node.js, PostgreSQL, MinIO, Prometheus and Grafana.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="group inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-hero shadow-glow font-semibold transition hover:scale-[1.02]">
              Start streaming free <ChevronRight size={18} className="group-hover:translate-x-0.5 transition" />
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 h-12 px-6 rounded-full glass font-semibold hover:bg-white/10 transition">
              <Play size={16} fill="currentColor" /> Open the app
            </Link>
          </div>
        </motion.div>

        {/* Floating mock player card */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="hidden lg:block absolute right-0 top-32 w-[380px] animate-float"
        >
          <div className="glass-strong rounded-3xl p-5 shadow-elevated border border-white/10">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-cyan-400 mb-4 relative overflow-hidden">
              <Music className="absolute inset-0 m-auto text-white/40" size={64} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Neon Skyline</p>
                <p className="text-sm text-muted-foreground">Aurora Vega</p>
              </div>
              <button className="h-12 w-12 rounded-full bg-white text-black grid place-items-center shadow-glow">
                <Play size={18} className="ml-0.5" fill="currentColor" />
              </button>
            </div>
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-hero" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold">Built for scale. Designed for taste.</h2>
          <p className="mt-4 text-muted-foreground">Every layer of the stack is observable, elastic, and crafted to disappear behind the music.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Cloud, title: "Cloud-native", text: "Nginx reverse proxy, containerized services, and MinIO object storage scale with your library." },
            { icon: Headphones, title: "Premium player", text: "Lossless-ready player with persistent playback, queues, and smooth transitions." },
            { icon: Shield, title: "Secure auth", text: "JWT sessions, role-based access, and admin controls baked in from day one." },
            { icon: Zap, title: "Real-time monitoring", text: "Prometheus + Grafana panels for CPU, memory, network, and storage." },
            { icon: Radio, title: "Smart curation", text: "Recommended playlists, recently played, and genre filters out of the box." },
            { icon: Sparkles, title: "Beautifully responsive", text: "Glassmorphism, neon accents, and motion that respects your bandwidth." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:shadow-glow-cyan transition"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-hero shadow-glow grid place-items-center mb-4">
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mockup section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="glass-strong rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[var(--neon-purple)]/30 blur-[100px]" />
          <div className="grid lg:grid-cols-2 gap-12 items-center relative">
            <div>
              <h3 className="text-3xl md:text-4xl font-display font-bold">A dashboard that feels like a stage.</h3>
              <p className="mt-4 text-muted-foreground">Recently played, trending, recommendations, and continue-listening — surfaced with cards that respond to every interaction.</p>
              <div className="mt-6 flex gap-4">
                <Link to="/dashboard" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-gradient-hero font-semibold shadow-glow">Try the dashboard</Link>
                <Link to="/infrastructure" className="inline-flex items-center gap-2 h-11 px-5 rounded-full glass font-semibold">View architecture</Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${["from-purple-500 to-cyan-400","from-pink-500 to-purple-600","from-emerald-400 to-cyan-500","from-orange-400 to-pink-500","from-yellow-300 to-pink-500","from-rose-400 to-indigo-500","from-teal-400 to-purple-500","from-blue-500 to-purple-600","from-fuchsia-500 to-cyan-400"][i]} animate-float`} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-40 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-hero shadow-glow grid place-items-center">
            <Radio size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">VibeStream</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <Link to="/infrastructure" className="hover:text-foreground transition">Infrastructure</Link>
          <Link to="/admin" className="hover:text-foreground transition">Admin</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-white/5 transition">Sign in</Link>
          <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-hero shadow-glow">Get started</Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-hero shadow-glow grid place-items-center">
              <Radio size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg">VibeStream</span>
          </div>
          <p className="mt-4 text-muted-foreground">Cloud-native music streaming for the next era.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/songs" className="hover:text-foreground">Catalog</Link></li>
            <li><Link to="/infrastructure" className="hover:text-foreground">Infrastructure</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>About</li><li>Careers</li><li>Press</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Privacy</li><li>Terms</li><li>Cookies</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">© 2026 VibeStream. All rights reserved.</div>
    </footer>
  );
}
