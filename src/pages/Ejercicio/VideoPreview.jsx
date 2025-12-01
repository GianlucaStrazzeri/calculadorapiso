import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ContadorReps.css";

function getYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    return null;
  } catch (e) {
    return null;
  }
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function VideoPreview({ exercise, size = "small", asButton = true }) {
  const url = exercise.videoUrl || exercise.mediaUrl || null;
  const thumb = url ? getYouTubeThumbnail(url) : null;
  const [showModal, setShowModal] = useState(false);

  const small = size === "small";
  if (!url) {
    return <span className={"cr-exercise-emoji"}>{exercise.emoji || "🏋️"}</span>;
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setShowModal(false);
    }
    if (showModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const open = (e) => {
    e && e.preventDefault();
    setShowModal(true);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  const embed = getYouTubeId(url) ? `https://www.youtube.com/embed/${getYouTubeId(url)}?rel=0&modestbranding=1&autoplay=1` : null;

  // Thumbnail/button
  if (thumb) {
    const className = small ? "cr-exercise-video-small" : "cr-exercise-video";
    const media = (
      <>
        <img src={thumb} alt={exercise.videoTitle || exercise.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div className="cr-video-play-overlay">▶</div>
      </>
    );

    return (
      <>
        {asButton ? (
          <button onClick={open} className={className} title={exercise.videoTitle || exercise.label}>
            {media}
          </button>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={handleKey}
            className={className}
            title={exercise.videoTitle || exercise.label}
          >
            {media}
          </div>
        )}

        {showModal && createPortal(
          <div className="cr-video-modal" onClick={() => setShowModal(false)}>
            <div className="cr-video-modal-content" onClick={(ev) => ev.stopPropagation()}>
              <button className="cr-video-modal-close" onClick={() => setShowModal(false)}>✕</button>
              {embed ? (
                <iframe title={exercise.videoTitle || exercise.label} src={embed} frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%' }} />
              ) : (
                <video src={url} controls autoPlay style={{ width: '100%', height: '100%', background: '#000' }} />
              )}
            </div>
          </div>
        , document.body)}
      </>
    );
  }

  // fallback: direct video
  const className = small ? "cr-exercise-video-small" : "cr-exercise-video";
  const media = (
    <>
      <video src={url} muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div className="cr-video-play-overlay">▶</div>
    </>
  );

  return (
    <>
      {asButton ? (
        <button onClick={open} className={className} title={exercise.videoTitle || exercise.label}>
          {media}
        </button>
      ) : (
        <div role="button" tabIndex={0} onClick={open} onKeyDown={handleKey} className={className} title={exercise.videoTitle || exercise.label}>
          {media}
        </div>
      )}

      {showModal && createPortal(
        <div className="cr-video-modal" onClick={() => setShowModal(false)}>
          <div className="cr-video-modal-content" onClick={(ev) => ev.stopPropagation()}>
            <button className="cr-video-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <video src={url} controls autoPlay style={{ width: '100%', height: '100%', background: '#000' }} />
          </div>
        </div>
      , document.body)}
    </>
  );
}
