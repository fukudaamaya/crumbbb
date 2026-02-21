import { Link } from 'react-router-dom';

export default function DemoBanner() {
  return (
    <div
      className="bg-primary text-primary-foreground px-4 py-2.5 flex items-center justify-between gap-3 z-50"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <p className="text-[13px] font-medium">
        You're exploring Crumb — sign up to start your own journal.
      </p>
      <Link
        to="/signup"
        className="shrink-0 text-[13px] font-bold underline underline-offset-2"
      >
        Sign Up
      </Link>
    </div>
  );
}
