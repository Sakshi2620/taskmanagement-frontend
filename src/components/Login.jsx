import { useMemo, useState } from "react";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import { login, register } from "../api/tasks"; // ← uses your axios instance

function Login({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!username.trim() || !password.trim()) return false;
    if (isRegisterMode) {
      return (
        fullName.trim().length >= 3 &&
        email.trim() &&
        username.trim().length >= 3 &&
        password.length >= 8 &&
        password === passwordConfirm
      );
    }
    return true;
  }, [fullName, email, username, password, passwordConfirm, isRegisterMode]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const names = fullName.trim().split(" ");
        await register({
          first_name: names[0],
          last_name: names.slice(1).join(" ") || "-",
          email: email.trim(),
          username: username.trim(),
          password,
          password_confirm: passwordConfirm,
        });

        setSuccessMsg("Registration successful! Please log in.");
        setIsRegisterMode(false);
        setPassword("");
        setPasswordConfirm("");
        return;
      }

      // login() in tasks.js already saves token + user to localStorage
      const response = await login({
        username: username.trim(),
        password,
      });

      onLogin(response.user);

    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.password?.[0] ||
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.error ||
        "Authentication failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setError("");
    setSuccessMsg("");
    setFullName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setPasswordConfirm("");
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Task Management</h1>
          <p className="muted">
            {isRegisterMode ? "Create your account" : "Login to continue"}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        <form onSubmit={submit} className="auth-form">
          {isRegisterMode && (
            <>
              <label>
                <span>Full Name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sakshi Jagtap"
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sakshi@gmail.com"
                />
              </label>
            </>
          )}

          <label>
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </label>

          {isRegisterMode && (
            <label>
              <span>Confirm Password</span>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
              />
            </label>
          )}

          <button
            type="submit"
            className="primary-btn"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              "Please wait..."
            ) : isRegisterMode ? (
              <><FiUserPlus /> Register</>
            ) : (
              <><FiLogIn /> Login</>
            )}
          </button>

          <p className="toggle-mode">
            {isRegisterMode ? "Already have an account? " : "Don't have an account? "}
            <button type="button" className="link-btn" onClick={toggleMode}>
              {isRegisterMode ? "Login" : "Register"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
