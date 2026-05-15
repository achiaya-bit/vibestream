const covers = [
  "from-purple-500 via-fuchsia-500 to-cyan-400",
  "from-cyan-400 via-blue-500 to-purple-600",
  "from-pink-500 via-purple-500 to-indigo-500",
  "from-emerald-400 via-cyan-500 to-blue-500",
  "from-orange-400 via-pink-500 to-purple-600",
  "from-yellow-300 via-pink-500 to-purple-600",
  "from-rose-400 via-fuchsia-500 to-indigo-500",
  "from-teal-400 via-cyan-500 to-purple-500",
];

export const cover = (i: number) => covers[i % covers.length];

export const seedArtists = [
  { id: "a1", name: "Aurora Vega", image: cover(0), followers: 2_400_000, monthlyListeners: 8_120_000, bio: "Genre-bending electronic producer crafting cinematic soundscapes." },
  { id: "a2", name: "Kairo Lune", image: cover(1), followers: 1_800_000, monthlyListeners: 5_600_000, bio: "Synthwave architect from Lisbon. Neon and nostalgia." },
  { id: "a3", name: "NOVA/7", image: cover(2), followers: 3_100_000, monthlyListeners: 11_200_000, bio: "Ambient collective exploring orbit, gravity, and quiet." },
  { id: "a4", name: "Mira Sole", image: cover(3), followers: 980_000, monthlyListeners: 3_400_000, bio: "Indie pop, lavender vocals, lo-fi heart." },
  { id: "a5", name: "Echo Pilot", image: cover(4), followers: 720_000, monthlyListeners: 2_100_000, bio: "Cassette-warm storytelling for the late shift." },
];

export const seedSongs = [
  { id: "s1", title: "Neon Skyline", artistId: "a1", album: "Midnight Pulse", duration: "3:42", cover: cover(0), genre: "Electronic", plays: 1240000 },
  { id: "s2", title: "Velvet Static", artistId: "a2", album: "Glass Hours", duration: "4:18", cover: cover(1), genre: "Synthwave", plays: 892000 },
  { id: "s3", title: "Cosmic Drift", artistId: "a3", album: "Orbit", duration: "3:05", cover: cover(2), genre: "Ambient", plays: 2310000 },
  { id: "s4", title: "Lavender Echo", artistId: "a4", album: "Soft Frequencies", duration: "3:55", cover: cover(3), genre: "Indie Pop", plays: 540000 },
  { id: "s5", title: "Chrome Dreams", artistId: "a1", album: "Midnight Pulse", duration: "4:32", cover: cover(4), genre: "Electronic", plays: 1700000 },
  { id: "s6", title: "Hyperloop", artistId: "a2", album: "Glass Hours", duration: "3:21", cover: cover(5), genre: "Synthwave", plays: 980000 },
  { id: "s7", title: "Solar Bloom", artistId: "a4", album: "Soft Frequencies", duration: "4:08", cover: cover(6), genre: "Indie Pop", plays: 412000 },
  { id: "s8", title: "Gravity Loop", artistId: "a3", album: "Orbit", duration: "3:48", cover: cover(7), genre: "Ambient", plays: 1820000 },
  { id: "s9", title: "Midnight Run", artistId: "a5", album: "Cassette", duration: "3:30", cover: cover(0), genre: "Synthwave", plays: 760000 },
  { id: "s10", title: "Paper Cities", artistId: "a5", album: "Cassette", duration: "4:14", cover: cover(2), genre: "Indie Pop", plays: 510000 },
  { id: "s11", title: "Ion Tide", artistId: "a3", album: "Orbit", duration: "3:12", cover: cover(3), genre: "Electronic", plays: 1320000 },
  { id: "s12", title: "Quiet Storm", artistId: "a4", album: "Soft Frequencies", duration: "3:58", cover: cover(5), genre: "Ambient", plays: 640000 },
];

export const seedPlaylists = [
  { id: "p1", title: "Late Night Drive", description: "Synth-soaked anthems for empty highways.", cover: cover(0), curator: "VibeStream", songs: ["s1", "s2", "s5", "s6", "s9", "s10"] },
  { id: "p2", title: "Focus Flow", description: "Ambient textures to fuel deep work.", cover: cover(3), curator: "VibeStream", songs: ["s3", "s8", "s11", "s12"] },
  { id: "p3", title: "Indie Mornings", description: "Soft songs for slow sunrises.", cover: cover(6), curator: "VibeStream", songs: ["s4", "s7", "s10", "s12"] },
  { id: "p4", title: "Neon Future", description: "Tomorrow, on repeat.", cover: cover(1), curator: "VibeStream", songs: ["s1", "s5", "s6", "s9"] },
  { id: "p5", title: "Cosmic Ambient", description: "Stargaze in stereo.", cover: cover(2), curator: "VibeStream", songs: ["s3", "s8", "s11"] },
  { id: "p6", title: "Pulse Workout", description: "BPM that hits.", cover: cover(4), curator: "VibeStream", songs: ["s2", "s5", "s6", "s11"] },
];
