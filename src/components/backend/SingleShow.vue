<!-- <template>
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/Index.vue'

export default {
    name: 'App',
    components: {
        HelloWorld
    }
}
</script> -->
<template>
    <div v-if="show">
        <div class="innerWrap">
            <div class="col7">
                <div class="col12"><h1>{{ show.title }}</h1></div>
                <div class="col12"><p>{{ show.overview }}</p></div>
                <div class="col3"><p><strong>Rating:</strong><br>{{ show.rating }}</p></div>
                <div class="col5"><p><strong>Release:</strong><br>{{ show.release_date }}</p></div>
                <div class="col12">
                    <p><strong>Genre:</strong><br>
                        <span v-for="(listGenre, index) in genre" :key="index" class="tag">
                            {{ listGenre }}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>   
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../api/tmdbAPI.vue';

export default {
    name: 'BackendShow',
    mixins: [tmdbAPI],
    data() {
        return {
            show: null,
            genre: null,
        };
    },
    methods: {
        async outPutShow(tmdbID) {
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
        }
    },
    mounted() {
        const showID = this.$route.params.id;
        
        this.outPutShow(showID).then(show => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            console.log(show[0]);
            this.show = show[0];

            const genres = JSON.parse(this.show.genres);

            this.getGenre(genres);
        });
    }
};
</script>

<style>
#app {

}
</style>
