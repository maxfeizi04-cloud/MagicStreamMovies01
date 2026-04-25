import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosConfig";
import useAuth from "../../hooks/useAuth";
import useLanguage from "../../hooks/useLanguage";
import logo from "../../assets/MagicStreamLogo.png";
import "../auth/AuthPage.css";

const Login = () => {
  const { auth, setAuth } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      navigate("/", { replace: true });
    }
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post("/login", { email, password });
      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      setAuth(response.data);
      navigate(location.state?.from?.pathname || "/", {
        replace: true,
        state: {
          requestedMovieId: location.state?.requestedMovieId,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || t.auth.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-shell">
      <div className="auth-panel">
        <section className="auth-panel__intro">
          <span className="auth-panel__eyebrow">{t.common.login}</span>
          <h1>{t.auth.loginTitle}</h1>
          <p>{t.auth.loginSubtitle}</p>
          <ul className="auth-panel__list">
            <li>{t.home.defaultVideoNote}</li>
            <li>{t.home.openLibrary}</li>
            <li>{t.home.recommendationPrompt}</li>
          </ul>
        </section>

        <section className="auth-panel__form">
          <div className="mb-4 text-center">
            <img src={logo} alt="Magic Stream Logo" width={72} className="mb-3" />
            <h2 className="fw-bold mb-2">{t.common.login}</h2>
            <p className="text-secondary mb-0">{t.auth.loginSubtitle}</p>
          </div>

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="loginEmail" className="mb-3">
              <Form.Label>{t.auth.email}</Form.Label>
              <Form.Control
                type="email"
                placeholder={t.auth.email}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group controlId="loginPassword" className="mb-4">
              <Form.Label>{t.auth.password}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t.auth.password}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100 rounded-pill py-2" disabled={loading}>
              {loading ? t.auth.loginLoading : t.auth.loginButton}
            </Button>
          </Form>

          <div className="auth-panel__footer">
            {t.auth.noAccount} <Link to="/register">{t.auth.goRegister}</Link>
          </div>

          <Link className="auth-panel__guest" to="/">
            {t.auth.guestMode}
          </Link>
        </section>
      </div>
    </Container>
  );
};

export default Login;
