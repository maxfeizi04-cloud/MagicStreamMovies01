import { useParams, useNavigate } from "react-router-dom";
import useLanguage from "../../hooks/useLanguage";
import "./StreamMovie.css";

const StreamMovie = () => {
  const { yt_id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="stream-page">
      <div className="stream-topbar">
        <button
          type="button"
          className="stream-topbar__back"
          onClick={() => navigate(-1)}
        >
          &larr; {t.common.backHome}
        </button>
        <span className="stream-topbar__label">{t.stream.title}</span>
      </div>

      <div className="stream-player-wrap">
        {yt_id ? (
          <div className="stream-player-wrap__inner">
            <iframe
              src={`https://www.youtube.com/embed/${yt_id}`}
              title={t.stream.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div className="stream-player-wrap__empty">
            {t.stream.guestLocked}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamMovie;
