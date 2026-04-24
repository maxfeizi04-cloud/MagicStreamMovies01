import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axiosClient from '../../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/MagicStreamLogo.png';
import useAuth from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage';

const Register = () => {
    const { setAuth } = useAuth();
    const { t } = useLanguage();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [favouriteGenres, setFavouriteGenres] = useState([]);
    const [genres, setGenres] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchGenres = async () => {
            try {
                const response = await axiosClient.get('/genres');
                if (isMounted) {
                    setGenres(response.data ?? []);
                }
            } catch (requestError) {
                if (isMounted) {
                    setError(t('register.loadGenresError'));
                }
                console.error('Error fetching movie genres:', requestError);
            }
        };

        fetchGenres();

        return () => {
            isMounted = false;
        };
    }, [t]);

    const handleGenreChange = (event) => {
        const options = Array.from(event.target.selectedOptions);
        setFavouriteGenres(options.map((option) => ({
            genre_id: Number(option.value),
            genre_name: option.label,
        })));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError(t('register.passwordMismatch'));
            return;
        }

        setLoading(true);

        try {
            await axiosClient.post('/register', {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role: 'USER',
                favourite_genres: favouriteGenres,
            });

            const loginResponse = await axiosClient.post('/login', {
                email,
                password,
            });

            setAuth(loginResponse.data);
            navigate('/', { replace: true });
        } catch (requestError) {
            setError(
                requestError.response?.data?.details
                || requestError.response?.data?.error
                || t('register.failed')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="auth-shell">
            <div className="auth-panel auth-panel--wide">
                <div className="auth-panel__brand">
                    <img src={logo} alt="MagicStream logo" width={64} className="mb-3" />
                    <p className="section-eyebrow">{t('register.eyebrow')}</p>
                    <h2>{t('register.title')}</h2>
                    <p>{t('register.description')}</p>
                </div>

                {error ? <div className="alert alert-danger py-2">{error}</div> : null}

                <Form onSubmit={handleSubmit}>
                    <div className="auth-grid">
                        <Form.Group className="mb-3">
                            <Form.Label>{t('register.firstNameLabel')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={t('register.firstNamePlaceholder')}
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('register.lastNameLabel')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={t('register.lastNamePlaceholder')}
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                required
                            />
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>{t('register.emailLabel')}</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder={t('register.emailPlaceholder')}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </Form.Group>

                    <div className="auth-grid">
                        <Form.Group className="mb-3">
                            <Form.Label>{t('register.passwordLabel')}</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder={t('register.passwordPlaceholder')}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('register.confirmPasswordLabel')}</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder={t('register.confirmPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                required
                                isInvalid={!!confirmPassword && password !== confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {t('register.passwordMismatch')}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Label>{t('register.genresLabel')}</Form.Label>
                        <Form.Select
                            multiple
                            value={favouriteGenres.map((genre) => String(genre.genre_id))}
                            onChange={handleGenreChange}
                            className="genre-select"
                        >
                            {genres.map((genre) => (
                                <option key={genre.genre_id} value={genre.genre_id} label={genre.genre_name}>
                                    {genre.genre_name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                            {t('register.genresHint')}
                        </Form.Text>
                    </Form.Group>

                    <Button variant="dark" type="submit" className="w-100 auth-submit" disabled={loading}>
                        {loading ? t('register.submitting') : t('register.submit')}
                    </Button>
                </Form>

                <div className="text-center mt-3">
                    <span className="text-muted">{t('register.alreadyRegistered')} </span>
                    <Link to="/login" className="fw-semibold">{t('register.signInHere')}</Link>
                </div>
            </div>
        </Container>
    );
};

export default Register;
