<template>
    <div id="loader" class="hidden">
        <div class="content-wrap">
            <i></i>
            <span class="visible">{{ langSnippet('please_wait_adding_show') }}</span>
        </div>
    </div>

    <div v-if="show" class="pad-top-xl pad-bottom-xl">
        <div class="innerWrap">
            <div class="col7">
                <div class="col12"><h1>{{ show.title }}</h1></div>
                <div class="col12"><p>{{ show.overview }}</p></div>
                <div class="col3"><p><strong>{{ langSnippet('rating') }}:</strong><br>{{ show.rating }}</p></div>
                <div class="col5"><p><strong>{{ langSnippet('release_date') }}:</strong><br>{{ show.release_date }}</p></div>
                <div class="col12">
                    <p><strong>{{ langSnippet('genres') }}:</strong><br>
                        <span v-for="(listGenre, index) in genre" :key="index" class="tag">
                            {{ listGenre }}
                        </span>
                    </p>
                </div>
            </div>

            <div class="col5">
                <p class="text-right">
                    <button href="#deleteShow" data-fancybox class="btn btn-small btn-alert icon-left icon-trash" >{{ langSnippet('delete')  }}</button>
                </p>
            </div>

            <div class="col12 marg-top-s" v-if="seasons">
                <ul class="tabs" data-tabs id="season-tabs">
                    <li v-for="(season, index) in seasons" :key="index" class="tabs-title">
                        <a :href="`#season-${season.season_number}`" :data-tab-id="`season-${season.season_number}`">{{season.title}}</a>
                    </li>
                </ul>
                <div class="tabs-content" data-tabs-content="season-tabs">
                    <div v-for="(season, index) in seasons" :key="index" class="tabs-panel" :id="`season-${season.season_number}`">
                        <div class="col12 text-right">
                            <p>
                                <button :href="`#deleteSeason-${season.season_number}`" data-fancybox class="btn btn-small btn-alert icon-left icon-trash marg-bottom-no">{{ langSnippet('delete') }}</button>
                            </p>
                        </div>
                        <div v-for="(episode, index) in episodes.filter(episode => episode.season_number === season.season_number)" :key="index" class="col-6-xxsmall col-4-medium">
                            <figure class="widescreen disabled" v-if="episode.file_path === null">
                                <img :src="$loadImg(episode.backdrop)" loading="lazy" importance="low" :alt="`${episode.title}`">
                            </figure>
                            <figure class="widescreen" v-else>
                                <img :src="$loadImg(media.backdrop)" loading="lazy" importance="low" :alt="`${episode.title}`">
                            </figure>
                            <span class="small marg-top-xxs">Episode {{episode.episode_number}}:<br>{{episode.title}}</span>
                            <button href="#media-browser" data-fancybox @click="selectMedia(show, episode.tmdbID)" class="btn btn-small btn-success" >{{ langSnippet('select_file')  }}</button>
                        </div>

                        <div :id="`deleteSeason-${season.season_number}`" style="display: none;">
                            <p>Delete Season?</p>
                            <p class="text-right marg-no">
                                <button @click="deleteSeason(season.season_number)" class="btn btn-small btn-alert icon-left icon-trash marg-no">{{ langSnippet('delete') }}</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="media-browser" style="display: none;">
            <div class="row">
                <media-browser-component></media-browser-component>
            </div>
        </div>

        <div id="deleteShow" style="display: none;">
            <p>Delete Show?</p>
            <p class="text-right marg-no">
                <button @click="deleteShow()" class="btn btn-small btn-alert icon-left icon-trash marg-no">{{ langSnippet('delete') }}</button>
            </p>
        </div>
    </div>   
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import language from '../mixins/language.vue';
import functions from '../mixins/functions.vue';
import Mediabrowser from '../Mediabrowser.vue';
import { Fancybox } from '@fancyapps/ui';

export default {
    name: 'BackendShow',
    mixins: [functions, tmdbAPI, language],
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
        },
        async deleteShow() {
            document.getElementById('loader').classList.remove('hidden');
            Fancybox.close();
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/deleteShow?mediaID=${this.show.tmdbID}`);
                console.log('Done');
                this.$router.push('/backend/shows');
            } catch (err) {
                console.log(err);
            }
        },
        async deleteSeason(seasonNumber) {
            const tmdbID = this.show.tmdbID;
            document.getElementById('loader').classList.remove('hidden');
            this.show = null;
            Fancybox.close();
            try {
                await axios.post(`${this.$mainURL}:3000/api/db/deleteSeason?mediaID=${tmdbID}&seasonNumber=${seasonNumber}`);
                console.log(tmdbID);
                await this.outPutShow(tmdbID).then(async(show) => {
                    // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
                    this.show = show[0];
                    const genres = JSON.parse(this.show.genres);

                    await this.getGenre(genres);
                    await this.getSeasons(tmdbID);
                    await this.getEpisodes(tmdbID).then(() => {
                        document.querySelector('.tabs .tabs-title a').setAttribute('aria-selected', 'true');
                        document.querySelector('.tabs-content .tabs-panel').classList.add('is-active');
                    });

                    document.getElementById('loader').classList.add('hidden');
                });
            } catch (err) {
                console.log(err);
            }
        },
        async savePoster() {
            var posterSelect = document.querySelector('input[name="poster"]:checked');

            if (posterSelect) {
                var newPoster = posterSelect.value;

                try {
                    await axios.post(`${this.$mainURL}:3000/api/db/saveNewPoster?mediaID=${this.movie.tmdbID}&poster=${newPoster}`);
                    document.getElementById('mainPoster').src = `http://image.tmdb.org/t/p/original${newPoster}`;
                } catch (err) {
                    console.log(err);
                }
            }

            Fancybox.close();
        },
        async saveBackdrop() {
            var backdropSelect = document.querySelector('input[name="backdrop"]:checked');
            
            if (backdropSelect) {
                var newBackdrop = backdropSelect.value;

                try {
                    await axios.post(`${this.$mainURL}:3000/api/db/saveNewBackdrop?mediaID=${this.movie.tmdbID}&backdrop=${newBackdrop}`);
                    document.getElementById('mainBackdrop').src = `http://image.tmdb.org/t/p/original${newBackdrop}`;
                } catch (err) {
                    console.log(err);
                }
            }

            Fancybox.close();
        },
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
