import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import useLanguage from '../../hooks/useLanguage';
import './StreamMovie.css';

const StreamMovie = ({ ytId, autoplay = true, compact = false }) => {
    const params = useParams();
    const key = ytId ?? params.yt_id;
    const containerClassName = compact ? 'react-player-container react-player-container--compact' : 'react-player-container';
    const { t } = useLanguage();

    return (
        <div className={containerClassName}>
            {key ? (
                <ReactPlayer
                    controls={true}
                    playing={autoplay}
                    url={`https://www.youtube.com/watch?v=${key}`}
                    width='100%'
                    height='100%'
                />
            ) : (
                <div className="react-player-empty">{t('stream.empty')}</div>
            )}
        </div>
    );
};

export default StreamMovie;
