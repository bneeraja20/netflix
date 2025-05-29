import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, ThumbsUp, Info, ChevronDown, Search, Bell, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import YouTube from 'react-youtube';

// Netflix API Service
const TMDB_API_KEYS = [
  'c8dea14dc917687ac631a52620e4f7ad',
  '3cb41ecea3bf606c56552db3d17adefd'
];

let currentKeyIndex = 0;

const getApiKey = () => {
  return TMDB_API_KEYS[currentKeyIndex];
};

const rotateApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % TMDB_API_KEYS.length;
};

const tmdbApi = {
  baseURL: 'https://api.themoviedb.org/3',
  imageBaseURL: 'https://image.tmdb.org/t/p',
  
  async fetchWithRetry(url, retries = 1) {
    try {
      const response = await fetch(`${this.baseURL}${url}&api_key=${getApiKey()}`);
      if (response.status === 429 && retries > 0) {
        rotateApiKey();
        return this.fetchWithRetry(url, retries - 1);
      }
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async getPopularMovies() {
    return this.fetchWithRetry('/movie/popular?language=en-US&page=1');
  },

  async getTrendingMovies() {
    return this.fetchWithRetry('/trending/movie/week?language=en-US');
  },

  async getPopularTVShows() {
    return this.fetchWithRetry('/tv/popular?language=en-US&page=1');
  },

  async getMoviesByGenre(genreId) {
    return this.fetchWithRetry(`/discover/movie?with_genres=${genreId}&language=en-US&page=1`);
  },

  async getTVShowsByGenre(genreId) {
    return this.fetchWithRetry(`/discover/tv?with_genres=${genreId}&language=en-US&page=1`);
  },

  async getMovieVideos(movieId) {
    return this.fetchWithRetry(`/movie/${movieId}/videos?language=en-US`);
  },

  async getTVVideos(tvId) {
    return this.fetchWithRetry(`/tv/${tvId}/videos?language=en-US`);
  },

  async getMovieDetails(movieId) {
    return this.fetchWithRetry(`/movie/${movieId}?language=en-US`);
  },

  async getTVDetails(tvId) {
    return this.fetchWithRetry(`/tv/${tvId}?language=en-US`);
  },

  getImageURL(path, size = 'w500') {
    return path ? `${this.imageBaseURL}/${size}${path}` : '/api/placeholder/300/450';
  },

  getBackdropURL(path, size = 'w1280') {
    return path ? `${this.imageBaseURL}/${size}${path}` : '/api/placeholder/1280/720';
  }
};

// Header Component
export const Header = ({ onSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <motion.header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-4 lg:px-16 py-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="text-red-600 text-2xl font-bold">NETFLIX</div>
          <nav className="hidden lg:flex space-x-6 text-sm">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">TV Shows</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Movies</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">New & Popular</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">My List</a>
          </nav>
        </div>

        {/* Right side - Search, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-black/70 border border-white/50 text-white px-4 py-2 text-sm rounded-sm w-64"
                  autoFocus
                />
                <X 
                  className="ml-2 text-white cursor-pointer"
                  size={20}
                  onClick={() => setShowSearch(false)}
                />
              </form>
            ) : (
              <Search 
                className="text-white cursor-pointer hover:text-gray-300 transition-colors"
                size={20}
                onClick={() => setShowSearch(true)}
              />
            )}
          </div>
          <Bell className="text-white cursor-pointer hover:text-gray-300 transition-colors" size={20} />
          <div className="flex items-center space-x-2 cursor-pointer">
            <User className="text-white" size={20} />
            <ChevronDown className="text-white" size={16} />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Hero Section Component
export const Hero = ({ featuredContent, onPlayTrailer, onMoreInfo }) => {
  if (!featuredContent) return null;

  const backdropUrl = tmdbApi.getBackdropURL(featuredContent.backdrop_path, 'original');
  const title = featuredContent.title || featuredContent.name;
  const overview = featuredContent.overview;

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-4 lg:px-16">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Netflix Original Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-red-600 font-bold text-sm">NETFLIX</span>
            <span className="text-white text-sm">ORIGINAL</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-white text-lg lg:text-xl mb-8 max-w-xl leading-relaxed">
            {overview}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <motion.button
              onClick={() => onPlayTrailer(featuredContent)}
              className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded font-semibold text-lg hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={20} fill="black" />
              <span>Play</span>
            </motion.button>

            <motion.button
              onClick={() => onMoreInfo(featuredContent)}
              className="flex items-center space-x-2 bg-gray-600/70 text-white px-8 py-3 rounded font-semibold text-lg hover:bg-gray-600/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info size={20} />
              <span>More Info</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Content Card Component
export const ContentCard = ({ content, onPlay, onMoreInfo, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = tmdbApi.getImageURL(content.poster_path);
  const title = content.title || content.name;

  return (
    <motion.div
      className="relative group cursor-pointer min-w-[200px] lg:min-w-[250px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
    >
      {/* Main Image */}
      <div className="aspect-[2/3] rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/450';
          }}
        />
      </div>

      {/* Hover Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-black/80 flex flex-col justify-end p-4 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{title}</h3>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(content);
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors"
              >
                <Play size={14} fill="black" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreInfo(content);
                }}
                className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"
              >
                <Plus size={14} className="text-white" />
              </button>
              <button className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors">
                <ThumbsUp size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Content Row Component
export const ContentRow = ({ title, content, onPlay, onMoreInfo, isLoading }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 1000;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 lg:px-16 mb-12">
        <h2 className="text-white text-xl lg:text-2xl font-semibold mb-4">{title}</h2>
        <div className="flex space-x-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[200px] lg:min-w-[250px] aspect-[2/3] bg-gray-800 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-16 mb-12">
      <h2 className="text-white text-xl lg:text-2xl font-semibold mb-4">{title}</h2>
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Content Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {content?.map((item, index) => (
            <ContentCard
              key={item.id}
              content={item}
              onPlay={onPlay}
              onMoreInfo={onMoreInfo}
              index={index}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

// Video Modal Component
export const VideoModal = ({ isOpen, onClose, videoKey, title }) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-6xl mx-4 aspect-video"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X size={32} />
            </button>
            {videoKey && (
              <YouTube
                videoId={videoKey}
                opts={opts}
                className="w-full h-full rounded-lg overflow-hidden"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Content Details Modal Component
export const ContentModal = ({ isOpen, onClose, content, onPlay }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && content) {
      setLoading(true);
      const fetchDetails = async () => {
        try {
          const isMovie = content.title !== undefined;
          const detailsData = isMovie 
            ? await tmdbApi.getMovieDetails(content.id)
            : await tmdbApi.getTVDetails(content.id);
          setDetails(detailsData);
        } catch (error) {
          console.error('Error fetching details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, content]);

  if (!isOpen || !content) return null;

  const backdropUrl = tmdbApi.getBackdropURL(content.backdrop_path, 'w1280');
  const title = content.title || content.name;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-4xl mx-4 bg-gray-900 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Hero Section */}
          <div className="relative h-64 lg:h-80">
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-white text-2xl lg:text-4xl font-bold mb-4">{title}</h2>
              <button
                onClick={() => onPlay(content)}
                className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition-colors"
              >
                <Play size={20} fill="black" />
                <span>Play</span>
              </button>
            </div>
          </div>

          {/* Content Details */}
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-300">
                  {details?.release_date && (
                    <span>{new Date(details.release_date).getFullYear()}</span>
                  )}
                  {details?.first_air_date && (
                    <span>{new Date(details.first_air_date).getFullYear()}</span>
                  )}
                  {details?.runtime && (
                    <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
                  )}
                  {details?.vote_average && (
                    <span>⭐ {details.vote_average.toFixed(1)}</span>
                  )}
                </div>

                <p className="text-white text-base leading-relaxed mb-6">
                  {content.overview}
                </p>

                {details?.genres && (
                  <div className="mb-4">
                    <span className="text-gray-400 font-semibold">Genres: </span>
                    <span className="text-white">
                      {details.genres.map(genre => genre.name).join(', ')}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Loading Component
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <motion.div
      className="text-red-600 text-4xl font-bold"
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      NETFLIX
    </motion.div>
  </div>
);