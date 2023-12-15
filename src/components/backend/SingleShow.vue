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

            <div class="col12 marg-top-s" v-if="seasons">
                <ul class="tabs" data-tabs id="season-tabs">
                    <li v-for="(season, index) in seasons" :key="index" class="tabs-title">
                        <a :href="`#season-${season.season_number}`" :data-tab-id="`season-${season.season_number}`">{{season.title}}</a>
                    </li>
                </ul>
                <div class="tabs-content" data-tabs-content="season-tabs">
                    <div v-for="(season, index) in seasons" :key="index" class="tabs-panel" :id="`season-${season.season_number}`">
                        <div v-for="(episode, index) in episodes.filter(episode => episode.season_number === season.season_number)" :key="index" class="col4">
                            <figure class="widescreen disabled" v-if="episode.file_path === null">
                                <img :data-img="$loadImg(episode.backdrop)" loading="lazy" importance="low" :alt="`${episode.title}`">
                            </figure>
                            <figure class="widescreen" v-else>
                                <img :data-img="$loadImg(media.backdrop)" loading="lazy" importance="low" :alt="`${episode.title}`">
                            </figure>
                            <span class="small marg-top-xxs">Episode {{episode.episode_number}}:<br>{{episode.title}}</span>
                            <a href="#media-browser" data-fancybox @click="selectMedia(show, episode.tmdbID)" class="btn btn-small btn-success" >{{ langSnippet('select_file')  }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="media-browser" style="display: none;">
            <media-browser-component></media-browser-component>
        </div>
    </div>   
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import language from '../mixins/language.vue';
import Mediabrowser from '../Mediabrowser.vue';

export default {
    name: 'BackendShow',
    mixins: [tmdbAPI, language],
    components: {
        'media-browser-component': Mediabrowser,
    },
    data() {
        return {
            show: null,
            genre: null,
            seasons: [],
            episodes: [],
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
        },
        async getSeasons(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getSeasons?showID=${showID}`);
                this.seasons = response.data;
            } catch (err) {
                console.log(err);
            }
        },
        async getEpisodes(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/getEpisodes?showID=${showID}`);
                this.episodes = response.data;
            } catch (err) {
                console.log(err);
            }
        },
        async selectMedia(media, episodeID) {
            this.$route.params.media = media;
            this.$route.params.episodeID = episodeID;
        }
    },
    mounted() {
        const showID = this.$route.params.id;
        
        this.outPutShow(showID).then(async(show) => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.show = show[0];

            const genres = JSON.parse(this.show.genres);

            await this.getGenre(genres);
            await this.getSeasons(showID);
            await this.getEpisodes(showID).then(() => {
                document.querySelector('.tabs .tabs-title a').setAttribute('aria-selected', 'true');
                document.querySelector('.tabs-content .tabs-panel').classList.add('is-active');
            });
        });
    }
};
</script>

<style>
#app {

}
</style>
