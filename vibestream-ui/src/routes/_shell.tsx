import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Player } from "@/components/player";
import { PlayerProvider } from "@/context/player-context";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <PlayerProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 px-4 md:px-8 py-6 pb-32 max-w-[1600px] w-full mx-auto">
              <Outlet />
            </main>
          </div>
        </div>
        <Player />
      </div>
    </PlayerProvider>
  );
}
