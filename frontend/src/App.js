import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Header, 
  Hero, 
  ContentRow, 
  VideoModal, 
  ContentModal, 
  LoadingSpinner 
} from './components';

// Mock data for fallback
const mockContent = {
  popular: [
    {
      id: 1,
      title: "Stranger Things",
      poster_path: "/api/placeholder/300/450",
      backdrop_path: "/api/placeholder/1280/720",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl."
    },
    {
      id: 2,
      title: "The Crown",
      poster_path: "/api/placeholder/300/450",
      backdrop_path: "/api/placeholder/1280/720",
      overview: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century."
    }
  ]
};

// TMDB API Service
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
  
  async fetchWithRetry(url, retries = 1) {
    try {
      const response = await fetch(`${this.baseURL}${url}&api_key=${getApiKey()}`);
      if (response.status === 429 && retries > 0) {
        rotateApiKey();
        return this.fetchWithRetry(url, retries - 1);
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
  }
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredContent, setFeaturedContent] = useState(null);
  const [contentData, setContentData] = useState({
    trending: [],
    popularMovies: [],
    popularTVShows: [],
    actionMovies: [],
    comedyMovies: [],
    horrorMovies: [],
    documentaries: []
  });
  const [loadingStates, setLoadingStates] = useState({
    trending: true,
    popularMovies: true,
    popularTVShows: true,
    actionMovies: true,
    comedyMovies: true,
    horrorMovies: true,
    documentaries: true
  });
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoKey: null, title: '' });
  const [contentModal, setContentModal] = useState({ isOpen: false, content: null });

  // Fetch all content on component mount
  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        // Fetch trending content for hero
        const trendingData = await tmdbApi.getTrendingMovies();
        if (trendingData?.results?.length > 0) {
          setFeaturedContent(trendingData.results[0]);
          setContentData(prev => ({ ...prev, trending: trendingData.results }));
        } else {
          setFeaturedContent(mockContent.popular[0]);
          setContentData(prev => ({ ...prev, trending: mockContent.popular }));
        }
        setLoadingStates(prev => ({ ...prev, trending: false }));

        // Fetch popular movies
        const popularMoviesData = await tmdbApi.getPopularMovies();
        if (popularMoviesData?.results) {
          setContentData(prev => ({ ...prev, popularMovies: popularMoviesData.results }));
        } else {
          setContentData(prev => ({ ...prev, popularMovies: mockContent.popular }));
        }
        setLoadingStates(prev => ({ ...prev, popularMovies: false }));

        // Fetch popular TV shows
        const popularTVData = await tmdbApi.getPopularTVShows();
        if (popularTVData?.results) {
          setContentData(prev => ({ ...prev, popularTVShows: popularTVData.results }));
        } else {
          setContentData(prev => ({ ...prev, popularTVShows: mockContent.popular }));
        }
        setLoadingStates(prev => ({ ...prev, popularTVShows: false }));

        // Fetch movies by genre
        const actionMoviesData = await tmdbApi.getMoviesByGenre(28); // Action
        if (actionMoviesData?.results) {
          setContentData(prev => ({ ...prev, actionMovies: actionMoviesData.results }));
        }
        setLoadingStates(prev => ({ ...prev, actionMovies: false }));

        const comedyMoviesData = await tmdbApi.getMoviesByGenre(35); // Comedy
        if (comedyMoviesData?.results) {
          setContentData(prev => ({ ...prev, comedyMovies: comedyMoviesData.results }));
        }
        setLoadingStates(prev => ({ ...prev, comedyMovies: false }));

        const horrorMoviesData = await tmdbApi.getMoviesByGenre(27); // Horror
        if (horrorMoviesData?.results) {
          setContentData(prev => ({ ...prev, horrorMovies: horrorMoviesData.results }));
        }
        setLoadingStates(prev => ({ ...prev, horrorMovies: false }));

        const documentariesData = await tmdbApi.getMoviesByGenre(99); // Documentary
        if (documentariesData?.results) {
          setContentData(prev => ({ ...prev, documentaries: documentariesData.results }));
        }
        setLoadingStates(prev => ({ ...prev, documentaries: false }));

      } catch (error) {
        console.error('Error fetching content:', error);
        // Use mock data as fallback
        setFeaturedContent(mockContent.popular[0]);
        setContentData({
          trending: mockContent.popular,
          popularMovies: mockContent.popular,
          popularTVShows: mockContent.popular,
          actionMovies: mockContent.popular,
          comedyMovies: mockContent.popular,
          horrorMovies: mockContent.popular,
          documentaries: mockContent.popular
        });
        setLoadingStates({
          trending: false,
          popularMovies: false,
          popularTVShows: false,
          actionMovies: false,
          comedyMovies: false,
          horrorMovies: false,
          documentaries: false
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  const handlePlayTrailer = async (content) => {
    try {
      const isMovie = content.title !== undefined;
      const videosData = isMovie 
        ? await tmdbApi.getMovieVideos(content.id)
        : await tmdbApi.getTVVideos(content.id);

      if (videosData?.results?.length > 0) {
        // Find trailer video
        const trailer = videosData.results.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        ) || videosData.results[0];

        setVideoModal({
          isOpen: true,
          videoKey: trailer.key,
          title: content.title || content.name
        });
      } else {
        // Fallback: Open a generic Netflix trailer
        setVideoModal({
          isOpen: true,
          videoKey: 'dQw4w9WgXcQ', // Rick Roll as fallback :)
          title: content.title || content.name
        });
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      // Fallback trailer
      setVideoModal({
        isOpen: true,
        videoKey: 'dQw4w9WgXcQ',
        title: content.title || content.name
      });
    }
  };

  const handleMoreInfo = (content) => {
    setContentModal({
      isOpen: true,
      content: content
    });
  };

  const closeVideoModal = () => {
    setVideoModal({ isOpen: false, videoKey: null, title: '' });
  };

  const closeContentModal = () => {
    setContentModal({ isOpen: false, content: null });
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
    // In a real app, this would trigger a search API call
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <Header onSearch={handleSearch} />

      {/* Hero Section */}
      <Hero 
        featuredContent={featuredContent}
        onPlayTrailer={handlePlayTrailer}
        onMoreInfo={handleMoreInfo}
      />

      {/* Content Rows */}
      <div className="relative z-10 -mt-32">
        <ContentRow
          title="Trending Now"
          content={contentData.trending}
          onPlay={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          isLoading={loadingStates.trending}
        />

        <ContentRow
          title="Popular Movies"
          content={contentData.popularMovies}
          onPlay={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          isLoading={loadingStates.popularMovies}
        />

        <ContentRow
          title="Popular TV Shows"
          content={contentData.popularTVShows}
          onPlay={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          isLoading={loadingStates.popularTVShows}
        />

        <ContentRow
          title="Action Movies"
          content={contentData.actionMovies}
          onPlay={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          isLoading={loadingStates.actionMovies}
        />

        <ContentRow
          title="Comedy Movies"
          content={contentData.comedyMovies}
          onPlay={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          isLoading={loadingStates.comedyMovies}
        />

        <ContentRow
          title="Horror Movies"
          content={contentData.horrorMovies}
          onPlay={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          isLoading={loadingStates.horrorMovies}
        />

        <ContentRow
          title="Documentaries"
          content={contentData.documentaries}
          onPlay={handlePlayTrailer}
          onMoreInfo={handleMoreInfo}
          isLoading={loadingStates.documentaries}
        />
      </div>

      {/* Footer */}
      <footer className="bg-black text-gray-400 px-4 lg:px-16 py-12 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Account</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Social</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm">
            <p>&copy; 2024 Netflix Clone. This is a demo project for educational purposes.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={closeVideoModal}
        videoKey={videoModal.videoKey}
        title={videoModal.title}
      />

      <ContentModal
        isOpen={contentModal.isOpen}
        onClose={closeContentModal}
        content={contentModal.content}
        onPlay={handlePlayTrailer}
      />
    </div>
  );
}

export default App;