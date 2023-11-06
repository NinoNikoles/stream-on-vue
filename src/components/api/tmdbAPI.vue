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
        async tmdbApiRequest(request, query = "", language = this.LANGUAGE) {
            if ( this.API_KEY === null ) return false;

            var requestSettings;
            if ( query !== "" ) {
                requestSettings = `&query=${query}&language=${language}`;
            } else {
                requestSettings = `&language=${language}`;
            }

            const response = await axios.get(`${this.TMDB_URL}/${request}?api_key=${this.API_KEY}${requestSettings}`);
            return response;
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
            return uniqueGenresArray;
        },
        async searchMovies(query) {
            const movies = await this.tmdbApiRequest(`search/movie`, query);
            return movies.data.results;
        },
        async searchMovieByID(movieID) {
            const movie = await this.tmdbApiRequest(`movie/${movieID}`);
            return movie.data;
        },
        async searchShows(query) {
            const shows = await this.tmdbApiRequest(`search/tv`, query);
            return shows.data.results;
        },
        async searchShowByID(showID) {
            const show = await this.tmdbApiRequest(`tv/${showID}`);
            return show.data;
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
            
            return episodes;
        },

        //--- Details ---
        
        // Genre
        async getGenre(mediaObj) {
            return mediaObj.genres;
        },
        // Thumbnails
        async getBackdrops(mediaID, language = ``) {
            const movie = await this.tmdbApiRequest(`movie/${mediaID}/images`, '', language);
            return movie.data.backdrops;
        },
        // Poster
        async getPosters(mediaID, language = ``) {
            const movie = await this.tmdbApiRequest(`movie/${mediaID}/images`, '', language);
            return movie.data.posters;
        },
        async getSettings() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getSettings`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        }
    },
    mounted() {
        this.getSettings().then(settings => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.API_KEY = settings[1].setting_option;
            this.LANGUAGE = settings[2].setting_option;
        });
    }
};
</script>