import Link from "next/link";

/** Landing — light, simple marketing strip + auth links. */
export default function Home() {
  return (
    <main className="np-page">
      <div className="np-shell" style={{ maxWidth: "36rem" }}>
        <div className="np-hero">
          <span className="np-hero-badge">Notepad</span>
          <h1>Thoughts, tasks, and snippets in one place</h1>
          <p>
            Sign in to sync notes to your account. Search, pin, export, and keep
            things tidy—without leaving a calm, white workspace.
          </p>
        </div>

        <div className="np-card-elevated">
          <ul className="np-features">
            <li>✓ Fast search across titles and content</li>
            <li>✓ Pin important notes to the top</li>
            <li>✓ Copy or download notes as plain text</li>
            <li>✓ Word counts and keyboard save (Ctrl/Cmd + S)</li>
          </ul>
          <div className="np-actions">
            <Link className="np-button" href="/login">
              Log in
            </Link>
            <Link className="np-button np-button-secondary" href="/signup">
              Create account
            </Link>
            <Link className="np-link" href="/dashboard" style={{ alignSelf: "center" }}>
              Go to dashboard →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
