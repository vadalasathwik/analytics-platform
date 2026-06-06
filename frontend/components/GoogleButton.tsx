import { API_URL } from "@/lib/api";

type GoogleButtonProps = {
  className?: string;
};

export default function GoogleButton({ className }: GoogleButtonProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 ${className ?? ""}`}
      onClick={() => {
        window.location.href = `${API_URL}/auth/google/login`;
      }}
    >
      Continue with Google
    </button>
  );
}
