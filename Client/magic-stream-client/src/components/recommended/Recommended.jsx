import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import {useEffect, useState} from 'react';
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';

const Recommended = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchRecommendedMovies = async () => {
            setLoading(true);
            setMessage("");

            try{
                const response = await axiosPrivate.get('/recommendedmovies');
                setMovies(response.data);
                if (response.data.length === 0) {
                    setMessage("No recommendations are available for this account yet.");
                }
            } catch (error){
                console.error("Error fetching recommended movies:", error)
                setMessage(error.response?.data?.error || "Unable to load recommendations right now.");
            } finally {
                setLoading(false);
            }

        }
        fetchRecommendedMovies();
    }, [axiosPrivate])

    return (
        <>
            {loading ? (
                <Spinner/>
            ) :(
                <Movies movies = {movies} message ={message} />
            )}
        </>
    )

}
export default Recommended
