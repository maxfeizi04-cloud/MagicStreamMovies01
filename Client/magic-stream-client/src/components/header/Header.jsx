import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useLanguage from "../../hooks/useLanguage";
import logo from "../../assets/MagicStreamLogo.png";
import "./Header.css";

const Header = ({ handleLogout }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <Navbar expand="lg" sticky="top" className="site-header">
      <Container className="site-header__inner">
        <Navbar.Brand as={NavLink} to="/" className="site-header__brand">
          <img alt="" src={logo} width="38" height="38" className="site-header__logo" />
          <div>
            <strong>{t.common.appName}</strong>
            <span>{auth ? t.header.welcomeBack : t.header.guest}</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" className="site-header__toggle" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto site-header__nav">
            <Nav.Link as={NavLink} to="/">
              {t.common.home}
            </Nav.Link>
            {auth ? (
              <Nav.Link as={NavLink} to="/recommended">
                {t.common.recommended}
              </Nav.Link>
            ) : null}
          </Nav>

          <div className="site-header__actions">
            <div className="language-switch" aria-label={t.common.language}>
              <button
                type="button"
                className={language === "zh" ? "is-active" : ""}
                onClick={() => setLanguage("zh")}
              >
                {t.common.chinese}
              </button>
              <button
                type="button"
                className={language === "en" ? "is-active" : ""}
                onClick={() => setLanguage("en")}
              >
                {t.common.english}
              </button>
            </div>

            {auth ? (
              <>
                <span className="site-header__user">
                  {t.header.hello} {auth.first_name}
                </span>
                <Button variant="light" size="sm" className="site-header__button" onClick={handleLogout}>
                  {t.common.logout}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="site-header__button"
                  onClick={() => navigate("/login")}
                >
                  {t.common.login}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="site-header__button"
                  onClick={() => navigate("/register")}
                >
                  {t.common.register}
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
