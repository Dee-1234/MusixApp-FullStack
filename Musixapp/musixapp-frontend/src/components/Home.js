import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AuthService from "../services/auth.service";
import authHeader from "../services/auth-header";

const Home = () => {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState("");
    const [progress, setProgress] = useState(0);
    
    // NEW: State for favorites initialized from LocalStorage
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem("musix_favorites");
        return saved ? JSON.parse(saved) : [];
    });

    const audioRef = useRef(new Audio());

    useEffect(() => {
        axios.get("http://localhost:8080/api/songs/all")
            .then((res) => setSongs(res.data))
            .catch((err) => console.log("Fetch Error", err));

        const user = AuthService.getCurrentUser();
        if (user) setCurrentUser(user);
    }, []);

    // NEW: Sync favorites to LocalStorage whenever they change
    useEffect(() => {
        localStorage.setItem("musix_favorites", JSON.stringify(favorites));
    }, [favorites]);

    const handleTogglePlay = (song) => {
        const audio = audioRef.current;

        if (currentSong?.id !== song.id) {
            setCurrentSong(song);
            const trackId = (song.id % 3) + 1;
            const fallbackUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackId}.mp3`;
            
            let trackUrl = song.url || fallbackUrl;
            if (trackUrl && !trackUrl.startsWith("http")) {
                trackUrl = `http://localhost:8080/api/songs/play/${song.id}`;
            }

            audio.src = trackUrl;
            audio.play().then(() => setIsPlaying(true)).catch(err => console.error(err));
        } else {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play().then(() => setIsPlaying(true)).catch(() => {});
            }
        }
    };

    // NEW: Toggle Favorite Function
    const toggleFavorite = (e, songId) => {
        e.stopPropagation(); // Prevents song from playing when clicking heart
        setFavorites(prev => 
            prev.includes(songId) 
                ? prev.filter(id => id !== songId) 
                : [...prev, songId]
        );
    };

    const handleNextSong = () => {
        if (songs.length === 0 || !currentSong) return;
        const currentIndex = songs.findIndex(s => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % songs.length;
        handleTogglePlay(songs[nextIndex]);
    };

    const handlePreviousSong = () => {
        if (songs.length === 0 || !currentSong) return;
        const currentIndex = songs.findIndex(s => s.id === currentSong.id);
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        handleTogglePlay(songs[prevIndex]);
    };

    useEffect(() => {
        const audio = audioRef.current;
        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setSongs((prevSongs) => {
                setCurrentSong((prevCurrent) => {
                    if (prevSongs.length === 0 || !prevCurrent) return prevCurrent;
                    const currentIndex = prevSongs.findIndex(s => s.id === prevCurrent.id);
                    const nextIndex = (currentIndex + 1) % prevSongs.length;
                    const nextSong = prevSongs[nextIndex];
                    const trackId = (nextSong.id % 3) + 1;
                    audio.src = nextSong.url || `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackId}.mp3`;
                    audio.play().then(() => setIsPlaying(true));
                    return nextSong;
                });
                return prevSongs;
            });
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const toggleMute = () => {
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm("Delete this track?")) {
            axios.delete(`http://localhost:8080/api/songs/delete/${id}`, { headers: authHeader() })
            .then(() => {
                setSongs(prev => prev.filter(s => s.id !== id));
                if (currentSong?.id === id) {
                    audioRef.current.pause();
                    setCurrentSong(null);
                    setIsPlaying(false);
                }
            });
        }
    };

    const isAdmin = currentUser?.roles?.some(role =>
        (typeof role === 'string' ? role : role.name) === "ROLE_ADMIN"
    );

    const filteredSongs = songs.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-4 mb-5 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white fw-bold">Library</h2>
                <input
                    type="text"
                    className="form-control w-25 bg-dark text-white border-secondary rounded-pill px-3"
                    placeholder="🔍 Search tracks..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="row">
                {filteredSongs.map((song) => (
                    <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={song.id}>
                        <div
                            className={`card h-100 song-card text-white border-0 shadow ${currentSong?.id === song.id ? "playing-highlight" : ""}`}
                            onClick={() => handleTogglePlay(song)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            {/* HEART ICON SECTION */}
                            <div 
                                className="position-absolute p-2" 
                                style={{ top: 5, right: 5, zIndex: 10 }}
                                onClick={(e) => toggleFavorite(e, song.id)}
                            >
                                <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>
                                    {favorites.includes(song.id) ? "❤️" : "🤍"}
                                </span>
                            </div>

                            <div className="card-body text-center d-flex flex-column">
                                <div className="display-4 mb-3 text-success">
                                    {currentSong?.id === song.id && isPlaying ? "🔊" : "▶"}
                                </div>
                                <h6 className="fw-bold text-truncate">{song.title}</h6>
                                <p className="small text-secondary">{song.artist}</p>
                                <div className="mt-auto d-flex justify-content-between">
                                    <span className="badge bg-success opacity-75">{song.genre}</span>
                                    <small className="text-muted">{song.duration}</small>
                                </div>
                                {isAdmin && (
                                    <button className="btn btn-outline-danger btn-sm mt-3" onClick={(e) => handleDelete(song.id, e)}>Delete</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Player Bar */}
            {currentSong && (
                <div className="fixed-bottom spotify-player text-white p-3 slide-up">
                    <div className="container-fluid d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center" style={{ width: '30%' }}>
                            <div className={`wave-box me-3 ${!isPlaying ? "paused" : ""}`}>
                                <div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div>
                            </div>
                            <div className="text-truncate">
                                <div className="fw-bold small">{currentSong.title}</div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{currentSong.artist}</div>
                            </div>
                        </div>

                        <div className="text-center" style={{ width: '40%' }}>
                            <div className="d-flex justify-content-center align-items-center mb-1">
                                <button className="btn btn-link text-white mx-3 fs-5 border-0 shadow-none" onClick={handlePreviousSong}>⏮</button>
                                <button className="btn-play-main" onClick={() => handleTogglePlay(currentSong)}>
                                    {isPlaying ? "❚❚" : "▶"}
                                </button>
                                <button className="btn btn-link text-white mx-3 fs-5 border-0 shadow-none" onClick={handleNextSong}>⏭</button>
                            </div>

                            <div className="d-flex align-items-center justify-content-center">
                                <small className="text-secondary me-2" style={{fontSize: '0.7rem'}}>
                                    {Math.floor(audioRef.current.currentTime / 60)}:{Math.floor(audioRef.current.currentTime % 60).toString().padStart(2, '0')}
                                </small>
                                <input
                                    type="range"
                                    className="form-range player-slider w-75"
                                    value={progress}
                                    min="0"
                                    max="100"
                                    onChange={(e) => {
                                        const newTime = (e.target.value / 100) * audioRef.current.duration;
                                        audioRef.current.currentTime = newTime;
                                        setProgress(e.target.value);
                                    }}
                                />
                                <small className="text-secondary ms-2" style={{fontSize: '0.7rem'}}>{currentSong.duration}</small>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end align-items-center" style={{ width: '30%' }}>
                            <button className="btn btn-link text-white p-0 me-3 fs-5 border-0 shadow-none" onClick={toggleMute}>
                                {isMuted ? "🔇" : "🔊"}
                            </button>
                            <input
                                type="range"
                                className="form-range w-50 player-slider"
                                min="0" max="100" defaultValue="100"
                                onChange={(e) => { if (audioRef.current) audioRef.current.volume = e.target.value / 100 }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;