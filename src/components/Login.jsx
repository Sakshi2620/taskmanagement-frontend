import { useMemo, useState } from "react";
import { FiLogIn } from "react-icons/fi";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const canSubmit = useMemo(
    () => username.trim().length >= 3 && password.trim().length >= 3,
    [password, username],
  );

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onLogin({ username: username.trim() });
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Task Management</h1>
          <p className="muted">Login to manage your tasks.</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label>
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sakshi"
              autoComplete="username"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </label>

          <button className="primary-btn" type="submit" disabled={!canSubmit}>
            <FiLogIn aria-hidden="true" /> Login
          </button>

          <p className="muted tiny">
            Demo auth: any username/password (min 3 chars). Stored locally in your
            browser.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

