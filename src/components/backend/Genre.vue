<template>
    <div class="col12 display-flex backend-wrap" style="flex-direction: row; flex-wrap: nowrap;">

        <backend-menu></backend-menu>

        <div class="col12 backend-content pad-top-xl pad-bottom-l">
            <div class="innerWrap">
                <div class="col12">
                    <h1>Genre</h1>
                </div>

                <div class="col12" v-if="apiCheck">
                    <table class="rounded marg-no" v-if="genre">
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
                    <button @click="saveGenre" class="btn btn-success icon-left icon-add loading" id="add-genre" name="add-genre" v-else>Add</button>
                </div>

                <div class="col12" v-else>
                    <p>Please finish the setup first.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import mainFunctions from '../mixins/functions.vue';
import BackendMenu from './../includes/BackendMenu.vue';

export default {
    name: 'BackendGenre',
    mixins: [tmdbAPI, mainFunctions],
    components: {
        'backend-menu': BackendMenu,
    },
    data() {
        return {
            genre: null,
            url: window.location.protocol + '//' + window.location.hostname,
            apiCheck: false
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
                console.log(error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async apiKeyCheck() {
            const response = await axios.get(`${this.$mainURL}:3000/api/db/getApiKey`);
            var result = false;
            if (response.data[0].setting_option !== null) result = true;

            return new Promise((resolve) => {
                resolve(result);
            });
        }
    },
    async mounted() {
        this.apiCheck = await this.apiKeyCheck();

        if (this.apiCheck) {
            await this.outPutGenres().then(genres => {
                if ( genres.length > 0 ) {
                    this.genre = genres;
                } else {
                    this.genre = null;
                }            
            });
        }
    }
};
</script>