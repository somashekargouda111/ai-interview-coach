import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-ink text-white' : 'text-ink hover:bg-desk'}`;

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-sheet">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-serif text-xl font-semibold">Interview Coach</span>
          <nav className="flex gap-1" aria-label="Main">
            <NavLink to="/" end className={link}>Dashboard</NavLink>
            <NavLink to="/new" className={link}>New interview</NavLink>
            <NavLink to="/history" className={link}>History</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-muted">{user?.fullName}</span>
            <button onClick={logout} className="font-medium underline underline-offset-2 hover:text-pine">Log out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
