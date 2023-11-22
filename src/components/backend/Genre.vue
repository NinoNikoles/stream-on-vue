<template>
    <div class="innerWrap">
        <div class="col12 marg-top-xl">
            <div class="col12">
                <h1>Genre</h1>
            </div>

            <div class="col12 marg-bottom-m">
                <div v-if="genre">  
                    <table>
                        <thead>
                            <th class="desktop-only">ID</th>
                            <th>TMDB ID</th>
                            <th>Name</th>
                        </thead>
                        <tbody>
                            <tr v-for="(listGenre, index) in genre" :key="index">
                                <td class="desktop-only">{{ listGenre.id }}</td>
                                <td>{{ listGenre.genre_id}}</td>
                                <td>{{ listGenre.genre_name }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else>
                    <button @click="saveGenre" class="btn btn-success icon-left icon-add loading" id="add-genre" name="add-genre">Add</button>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import mainFunctions from '../mixins/functions.vue';

export default {
    name: 'BackendGenre',
    mixins: [tmdbAPI, mainFunctions],
    data() {
        return {
            genre: null,
            url: window.location.protocol + '//' + window.location.hostname
        };
    },
    methods: {
        async saveGenre(e) {
            const saveButton = e.target;
            this.disableButton(saveButton);

            const genres = await this.getAllGenre();

            if ( genres !== false ) {
                try {
                    var response = await axios.post(`${this.$mainURL}:3000/api/db/saveGenre`, { genres } );

                    if ( response ) {
                        this.outPutGenres().then(genres => {
                            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
                            if ( genres.length > 0 ) {
                                this.genre = genres;
                            } else {
                                this.genre = null;
                            }            
                        });
                    }
                } catch (err) {
                    console.log(err);
                }                
            } else {
                this.enableButton(saveButton);
            }            
        },
        async outPutGenres() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/allGenre`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        }
    },
    mounted() {
        this.outPutGenres().then(genres => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            if ( genres.length > 0 ) {
                this.genre = genres;
            } else {
                this.genre = null;
            }            
        });
    }
};
</script>

<style>
#app {

}
</style>
