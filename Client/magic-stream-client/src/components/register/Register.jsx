import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosConfig";
import useAuth from "../../hooks/useAuth";
import useLanguage from "../../hooks/useLanguage";
import logo from "../../assets/MagicStreamLogo.png";
import "../auth/AuthPage.css";

const Register = () => {
  const { auth, setAuth } = useAuth();
  const { t, translateGenre } = useLanguage();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [favouriteGenres, setFavouriteGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      navigate("/", { replace: true });
    }
  }, [auth, navigate]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axiosClient.get("/genres");
        setGenres(response.data);
      } catch (fetchError) {
        console.error("Error fetching movie genres:", fetchError);
      }
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genre) => {
    setFavouriteGenres((currentGenres) => {
      const alreadySelected = currentGenres.some(
        (item) => item.genre_id === genre.genre_id,
      );

      if (alreadySelected) {
        return currentGenres.filter((item) => item.genre_id !== genre.genre_id);
      }

      return [...currentGenres, genre];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (favouriteGenres.length === 0) {
      setError(t.auth.selectGenre);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: "USER",
        favourite_genres: favouriteGenres,
      };

      const registerResponse = await axiosClient.post("/register", payload);
      if (registerResponse.data.error) {
        setError(registerResponse.data.error);
        return;
      }

      const loginResponse = await axiosClient.post("/login", { email, password });
      if (loginResponse.data.error) {
        setError(loginResponse.data.error);
        return;
      }

      setAuth(loginResponse.data);
      navigate("/", { replace: true });
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.response?.data?.error || t.auth.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-shell">
      <div className="auth-panel">
        <section className="auth-panel__intro">
          <span className="auth-panel__eyebrow">{t.common.register}</span>
          <h1>{t.auth.registerTitle}</h1>
          <p>{t.auth.registerSubtitle}</p>
          <ul className="auth-panel__list">
            <li>{t.home.defaultVideoNote}</li>
            <li>{t.home.openLibrary}</li>
            <li>{t.home.recommendationPrompt}</li>
          </ul>
        </section>

        <section className="auth-panel__form">
          <div className="mb-4 text-center">
            <img src={logo} alt="Magic Stream Logo" width={72} className="mb-3" />
            <h2 className="fw-bold mb-2">{t.common.register}</h2>
            <p className="text-secondary mb-0">{t.auth.registerSubtitle}</p>
          </div>

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

          <Form onSubmit={handleSubmit}>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>{t.auth.firstName}</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>{t.auth.lastName}</Form.Label>
                <Form.Control
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>{t.auth.email}</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>{t.auth.password}</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>{t.auth.confirmPassword}</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  isInvalid={Boolean(confirmPassword) && password !== confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {t.auth.passwordMismatch}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <Form.Group className="mb-4">
              <Form.Label>{t.auth.favouriteGenres}</Form.Label>
              <div className="auth-genre-grid">
                {genres.map((genre) => {
                  const isActive = favouriteGenres.some(
                    (item) => item.genre_id === genre.genre_id,
                  );

                  return (
                    <button
                      key={genre.genre_id}
                      type="button"
                      className={`auth-genre-chip ${isActive ? "is-active" : ""}`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {translateGenre(genre.genre_name)}
                    </button>
                  );
                })}
              </div>
              <Form.Text className="text-muted">{t.auth.favouriteGenresHint}</Form.Text>
            </Form.Group>

            <Button type="submit" className="w-100 rounded-pill py-2" disabled={loading}>
              {loading ? t.auth.registerLoading : t.auth.registerButton}
            </Button>
          </Form>

          <div className="auth-panel__footer">
            {t.auth.haveAccount} <Link to="/login">{t.auth.goLogin}</Link>
          </div>
        </section>
      </div>
    </Container>
  );
};

export default Register;
