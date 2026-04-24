import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axiosClient from '../../api/axiosConfig';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage';
import logo from '../../assets/MagicStreamLogo.png';

const Login = () => {
    const { setAuth } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.post('/login', { email, password });
            setAuth(response.data);
            navigate(from, { replace: true });
        } catch (error) {
            setError(error.response?.data?.error || t('login.invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="auth-shell">
            <div className="auth-panel">
                <div className="auth-panel__brand">
                    <img src={logo} alt="MagicStream logo" width={64} className="mb-3" />
                    <p className="section-eyebrow">{t('login.eyebrow')}</p>
                    <h2>{t('login.title')}</h2>
                    <p>{t('login.description')}</p>
                </div>

                {error ? <div className="alert alert-danger py-2">{error}</div> : null}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicEmail" className="mb-3">
                        <Form.Label>{t('login.emailLabel')}</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder={t('login.emailPlaceholder')}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            autoFocus
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="mb-3">
                        <Form.Label>{t('login.passwordLabel')}</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder={t('login.passwordPlaceholder')}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="dark" type="submit" className="w-100 auth-submit" disabled={loading}>
                        {loading ? t('login.submitting') : t('login.submit')}
                    </Button>
                </Form>

                <div className="text-center mt-3">
                    <span className="text-muted">{t('login.needAccount')} </span>
                    <Link to="/register" className="fw-semibold">{t('login.registerHere')}</Link>
                </div>
            </div>
        </Container>
    );
};

export default Login;
