import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useLanguage from '../../hooks/useLanguage';
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';

const Recommended = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageKey, setMessageKey] = useState('');
    const axiosPrivate = useAxiosPrivate();
    const { t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchRecommendedMovies = async () => {
            setLoading(true);
            setMessageKey('');

            try {
                const response = await axiosPrivate.get('/recommendedmovies');
                if (!isMounted) {
                    return;
                }

                const recommendedMovies = response.data ?? [];
                setMovies(recommendedMovies);
                if (recommendedMovies.length === 0) {
                    setMessageKey('recommended.emptyMessage');
                }
            } catch (error) {
                if (isMounted) {
                    setMovies([]);
                    setMessageKey('recommended.errorMessage');
                }
                console.error('Error fetching recommended movies:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRecommendedMovies();

        return () => {
            isMounted = false;
        };
    }, [axiosPrivate]);

    return loading ? (
        <Spinner />
    ) : (
        <Movies
            movies={movies}
            message={messageKey ? t(messageKey) : ''}
            eyebrow={t('recommended.eyebrow')}
            title={t('recommended.title')}
            description={t('recommended.description')}
            emptyTitle={t('recommended.emptyTitle')}
            emptyDescription={t('recommended.emptyDescription')}
            isAuthenticated={true}
            onOpenMovie={(movie) => navigate(`/stream/${movie.youtube_id}`)}
        />
    );
};

export default Recommended;
