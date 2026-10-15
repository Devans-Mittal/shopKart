// import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useState, useEffect } from "react";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await api("/customers/me");
        navigate("/home");
      } catch (error) {
        // Not logged in, stay on login page
      }
    };

    checkLogin();
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      await api("/customers/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });

      navigate("/home");
    } catch (error) {
      setError("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>ShopKart</h1>
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;