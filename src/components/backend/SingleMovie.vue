<template>
    <div v-if="movie">
        <div class="innerWrap">
            <div class="col7">
                <div class="col12"><h1>{{ movie.title }}</h1></div>
                <div v-if="movie.tagline" class="col12">{{ movie.tagline }}</div>
                <div class="col12"><p>{{ movie.overview }}</p></div>
                <div class="col3"><p><strong>{{ langSnippet('rating') }}:</strong><br>{{ movie.rating }}</p></div>
                <div class="col5"><p><strong>{{ langSnippet('release_date') }}:</strong><br>{{ movie.release_date }}</p></div>
                <div class="col4"><p><strong>{{ langSnippet('runtime') }}:</strong><br>{{ movie.runtime }}</p></div>
                <div class="col12">
                    <p><strong>{{ langSnippet('genres') }}:</strong><br>
                        <span v-for="(listGenre, index) in genre" :key="index" class="tag">
                            {{ listGenre }}
                        </span>
                    </p>
                </div>
            </div>
            <div v-if="isHighlight==null" class="col3 marg-left-col1">
                <div class="col12">
                    <button @click="addHighlight(movie.tmdbID)" class="btn btn-white btn-small icon-left icon-add" name="addHighlight">{{ langSnippet('add_highlight') }}</button>
                </div>
                <div class="col6">
                    <a href="#movie-poster" data-fancybox data-src="#movie-poster">
                        <figure class="poster">
                            <img :data-img="`${movie.poster }`" loading="lazy" alt="">
                        </figure>
                    </a>
                    <div id="movie-poster" class="bg-primary" style="display:none;"><p>test</p></div>
                </div>
            </div>

        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../api/tmdbAPI.vue';
import langSnippet from '../api/language.vue';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI, langSnippet],
    data() {
        return {
            movie: null,
            genre: null,
            isHighlight: null,
        };
    },
    methods: {
        async outPutMovie(tmdbID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${tmdbID}`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async getGenre(genres) {
            
            const genreData = [];

            for ( const genre of genres ) {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/genreNameByID?id=${genre}`);
                var genreName  = response.data[0].genre_name;
                genreData.push(genreName);
            }

            this.genre = genreData;
        },
        async addHighlight(mediaID) {
            try {
                var response = await axios.post(`${this.$mainURL}:3000/api/db/addHighlight?mediaID=${mediaID}`);

                if ( response ) {
                    try {
                        await this.checkForHighlight(); 
                    } catch (err) {
                        console.log(err);
                    }
                }
            } catch (err) {
                console.log(err);
            }

                       
        },
        async checkForHighlight() {
            console.log('check');
            var isTrue;

            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/checkForHighlight?mediaID=${this.movie.tmdbID}`);
                console.log(response.data.length);

                if ( response.data.length > 0 ) {
                    isTrue = 1;
                } else {
                    isTrue = null;
                }
            } catch (err) {
                console.log(err);
            }

            this.isHighlight = isTrue;
        }
    },
    mounted() {
        const movieID = this.$route.params.id;
        
        this.outPutMovie(movieID).then(movie => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.movie = movie[0];
            const genres = JSON.parse(this.movie.genres);

            this.getGenre(genres);
            this.checkForHighlight();
        });
    }
};
</script>

<style>
#app {

}
</style>
