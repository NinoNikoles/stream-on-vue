<template>
    <div class="innerWrap">
        <div class="col12 marg-top-xl">
            <div class="col12">
                <h1>{{ langSnippet('shows') }}</h1>
            </div>

            <div class="col12 marg-bottom-m">
                <div id="searchbar">
                    <label for="show-api-search">{{ langSnippet('show_name') }}*
                        <input v-model="inputText" @input="handleInputChange" type="text" id="show-api-search" name="show-name" placeholder="" required>
                    </label>

                    <div v-if="shows" id="showsearchResults">
                        <a v-for="(show, index) in shows" :key="index" :href="`#add-show-${show.id}`" class="display-flex flex-row marg-no" data-fancybox>
                            <figure class="poster" style="width:20%;max-width:100px;">
                                <img :data-img="$loadImg()" loading="lazy" :alt="`${show.name}`">
                            </figure>
                            <span class="pad-xs" style="width:80%;">{{ show.name }}</span>

                            <div :id="`add-show-${show.id}`" style="display:none;">
                                <p>Möchtest du {{ show.title}} hinzufügen?</p>
                                <p class="text-right">
                                    <button class="btn btn-success icon-left icon-add" :data-media="`${show.id}`" data-fancybox-close type="submit" name="add-show" @click="saveData(show)">{{ langSnippet('add') }}</button>
                                </p>
                            </div>
                        </a>                        
                    </div>
                </div>

                <div v-if="outputShows" class="col12 marg-top-m">
                    <div class="row">
                        <div v-for="(show, index) in outputShows" :key="index" class="col-6 col-3-medium column">
                            <a :href="`/backend/show/${show.tmdbID}`" :title="`${show.title}`" class="media-card">
                                <figure class="poster">
                                    <img :src="$loadImg()" loading="lazy" :alt="`${show.title}`">
                                </figure>
                                <span class="title marg-no">{{ $truncate(show.title, 15) }}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../api/tmdbAPI.vue';
import language from '../api/language.vue';

export default {
    name: 'BackendShows',
    mixins: [tmdbAPI, language],
    data() {
        return {
            inputText: '',
            outputText: '',
            shows: null,
            outputShows: null,
            genre: null,
            loader: document.getElementById('loader')
        };
    },
    methods: {
        handleInputChange() {
            // Hier können Sie die eingegebenen Daten bearbeiten und in outputText speichern
            this.outputText = this.inputText; //.toUpperCase(); // Beispiel: Text in Großbuchstaben anzeigen
            this.searchAndDisplayShows(this.outputText);
        },
        async searchAndDisplayShows(title) {
            const query = title;
            try {
                if ( query.length > 0 ) {
                    const shows = await this.searchShows(query);
                    this.shows = await this.filterShowsWithExistingIDs(shows);
                } else {
                    this.shows = null;
                }

                //this.genre = await this.getGenre(this.show);
                //this.saveData(this.show); // Speichern Sie die Daten nach dem Abrufen
            } catch (error) {
                console.error('Fehler beim Abrufen der Daten:', error);
            }

            
        },
        async filterShowsWithExistingIDs(shows) {
            const filteredshows = [];
            for (const show of shows) {
                const existsInDatabase = await this.checkIfShowExistsInDatabase(show.id);
                if (!existsInDatabase) {
                    filteredshows.push(show);
                }
            }
            return filteredshows;
        },
        async checkIfShowExistsInDatabase(tmdbID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID="${tmdbID}"`);
                return response.data.length > 0;
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return false;
            }
        },
        async saveData(data) {
            this.loader.classList.remove('hidden');
            const show = await this.searchShowByID(data.id);
            const genres = show.genres.map(genre => genre.id);

            let date = show.first_air_date;
            let parsedDate = new Date(date);
            let day = parsedDate.getDate();
            let month = parsedDate.getMonth() + 1;
            let year = parsedDate.getFullYear();
            let formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;

            var media = {
                tmdbID: show.id,
                title: show.name,
                tagline: show.tagline,
                genres: JSON.stringify(genres),
                overview: show.overview,
                poster: show.poster_path,
                backdrop: show.backdrop_path,
                rating: show.vote_average.toFixed(2),
                release_date: formattedDate,
                show_season_count: show.number_of_seasons,
                show_episodes_count: show.number_of_episodes,
                media_type: "show"
            }

            try {
                var seasons = await this.saveSeasons(show.seasons, show.id);
                var episodes = await this.saveEpisodes(show.id, show.seasons);
                await this.sendMedia(media, seasons, episodes);
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }

            console.log(this.langSnippet('add_show_success'));
            this.outPutShows().then(outputShows => {
                // Verwenden Sie outputshows hier, um die Daten in Ihrer Komponente zu verwenden
                this.outputShows = outputShows;
                this.searchAndDisplayShows(this.outputText);
            });
        },
        async saveSeasons(seasons, showID) {
            var dataSeasons = [];

            for (const season of seasons) {
                const newSeason = await this.searchSeasonByNumber(showID, season.season_number);

                var seasonData = {
                    tmdbID: newSeason.id,
                    title: newSeason.name,
                    overview: newSeason.overview,
                    poster: newSeason.poster_path,
                    season_number: newSeason.season_number,
                    release_date: newSeason.air_date,
                    episodes_count: newSeason.episodes.length,
                    show_tmdbID: showID,
                }

                dataSeasons.push(seasonData);
            }

            return dataSeasons;
        },
        async saveEpisodes(showID, seasons) {
            var dataEpisodes = [];

            for (const season of seasons) {
                try {
                    const newSeason = await this.searchSeasonByNumber(showID, season.season_number);

                    try {
                        let newEpisodes = await this.searchShowEpisodes(showID, season.season_number, newSeason.episodes);

                        for ( const episode of newEpisodes ) {
                            var episodeData = {
                                tmdbID: episode.id,
                                episode_number: episode.episode_number,
                                title: episode.name,
                                overview: episode.overview,
                                backdrop: episode.still_path,
                                runtime: episode.runtime,
                                release_date: episode.air_date,
                                show_id: showID,
                                season_number: season.season_number,
                            }

                            dataEpisodes.push(episodeData);
                        }                        
                    } catch (err) {
                        console.log(err);
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            return dataEpisodes;
        },
        async sendMedia(media, seasons, episodes) {
            var response = await axios.post(`${this.$mainURL}:3000/api/db/show?mediaID=${media.tmdbID}&dataGenres=${media.genres}`, { media: media, seasons: seasons, episodes: episodes, });
            
            if ( response.data.message === true ) {
                this.loader.classList.add('hidden');
            }
        },
        async outPutShows() {
            var order = 'title';
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=media_type="show"&orderBy=${order}&order=ASC`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        }
    },
    mounted() {
        this.outPutShows().then(outputShows => {
            // Verwenden Sie outputshows hier, um die Daten in Ihrer Komponente zu verwenden
            this.outputShows = outputShows;
        });
    }
};
</script>

<style>
#app {

}
</style>
