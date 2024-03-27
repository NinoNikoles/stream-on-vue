<!-- src/components/MovieComponent.vue -->
<script>
import axios from 'axios';

export default {
    data() {
        return {
            API_KEY: null,
            LANGUAGE: null,
            TMDB_URL: 'https://api.themoviedb.org/3'
        };
    },
    methods: {
        async tmdbApiRequest(request, query = null, append = null ) {
            if ( this.API_KEY === null ) return false;
            var requestQuery = '';
            var requestLanguage = '';
            var requestAppend = '';

            if ( query ) requestQuery = `&query=${query}`;
            if ( this.LANGUAGE && this.LANGUAGE !== '') requestLanguage = `&language=${this.LANGUAGE}`;
            if ( append ) requestAppend = `&append_to_response=${append}`;

            const response = await axios.get(`${this.TMDB_URL}/${request}?api_key=${this.API_KEY}${requestQuery}${requestLanguage}${requestAppend}`);
            return new Promise((resolve) => {
                resolve(response);
            });
        },
        async checkApiKey(key) {
            try {
                const response = await axios.get(`${this.TMDB_URL}/authentication?api_key=${key}`);
                return response.data.success;
            } catch (error) {
                if (error.response && error.response.status !== 401) {
                    console.error('Fehler bei der Anfrage:', error);
                    return false;
                } else {
                    return error.response.data.success;
                }
            }
        },
        async getAllGenre() {
            const movieGenre = await this.tmdbApiRequest(`genre/movie/list`);
            const tvGenre = await this.tmdbApiRequest(`genre/tv/list`);
            if ( movieGenre === false || tvGenre === false ) return false;
            const genres = [].concat (movieGenre.data.genres, tvGenre.data.genres);
            const uniqueGenresSet = new Set(genres.map(genre => JSON.stringify(genre)));
            const uniqueGenresArray = Array.from(uniqueGenresSet).map(genre => JSON.parse(genre));
            return new Promise((resolve) => {
                resolve(uniqueGenresArray);
            });
        },
        async searchMovies(query) {
            const movies = await this.tmdbApiRequest(`search/movie`, query);
            return new Promise((resolve) => {
                resolve(movies.data.results);
            });
        },
        async searchMovieByID(movieID) {
            const movie = await this.tmdbApiRequest(`movie/${movieID}`, null, 'videos');
            return new Promise((resolve) => {
                resolve(movie.data);
            });
        },
        async searchShows(query) {
            const shows = await this.tmdbApiRequest(`search/tv`, query);
            return new Promise((resolve) => {
                resolve(shows.data.results);
            });
        },
        async searchShowByID(showID) {
            const show = await this.tmdbApiRequest(`tv/${showID}`, null, 'videos');
            return new Promise((resolve) => {
                resolve(show.data);
            });
        },
        async searchSeasonByNumber(showID, seasonNumber) {
            const season = await this.tmdbApiRequest(`tv/${showID}/season/${seasonNumber}`);
            return season.data;
        },
        async searchShowEpisodes(showID, seasonNumber, seasonEpisodes) {
            const episodes = [];

            for ( const episode of seasonEpisodes ) {
                const dataEpisode = await this.tmdbApiRequest(`tv/${showID}/season/${seasonNumber}/episode/${episode.episode_number}`);
                episodes.push(dataEpisode.data);
            }
            
            return new Promise((resolve) => {
                resolve(episodes);
            });
        },

        //--- Details ---
        
        // Genre
        async getGenre(mediaObj) {
            return mediaObj.genres;
        },
        // Thumbnails
        async getBackdrops(type, mediaID) {
            const response = await this.tmdbApiRequest(`${type}/${mediaID}/images`);
            return new Promise((resolve) => {
                resolve(response.data.backdrops);
            });
        },
        // Poster
        async getPosters(type, mediaID) {
            const response = await this.tmdbApiRequest(`${type}/${mediaID}/images`);
            return new Promise((resolve) => {
                resolve(response.data.posters);
            });
        },



        //-- Get collection movies
        async getCollectionMovies(collectionID) {
            const response = await this.tmdbApiRequest(`collection/${collectionID}`);
            return new Promise((resolve) => {
                resolve(response.data.parts);
            });
        },

        //-- Get simliar movies
        async getSimilarMovies(mediaID) {
            const response = await this.tmdbApiRequest(`movie/${mediaID}/similar`);
            return new Promise((resolve) => {
                resolve(response.data);
            });
        },




        async checkIfMediaIsInDB(mediaArray) {
            const newCheckedArray = [];

            // Verwende map anstelle von forEach, um ein Array von Promises zu erhalten
            const promises = mediaArray.map(async (media) => {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID="${media.id}"`);
                if (response.data.length === 0) newCheckedArray.push(media);
            });

            // Warte auf Abschluss aller Promises
            await Promise.all(promises);
            return newCheckedArray;
        },
    },
    async mounted() {
        var settings = await this.getSettings();
        this.API_KEY = settings[1].setting_option;
        this.LANGUAGE = settings[2].setting_option;
    }
};
</script>