<template>
    <div id="mainPlayer" class="mainPlayer fullscreen" v-if="media">
        <figure>
            <video-player :options="videoOptions" v-if="videoOptions.sources[0].src !== ''"></video-player>
            <a :href="`/watchTogether?id=${$route.query.id}&uuid=${uuid}`" id="player-session-btn" title="Group session" v-if="uuid"></a>
        </figure>

        <!-- <span :data-time="`${watchedTime}`" :data-media="`${mediaID}`" :data-volume="`${volume}`" id="time"></span> -->
    </div>
</template>

<script>
import axios from 'axios';
//import { Fancybox } from '@fancyapps/ui';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../mixins/functions.vue';
import VideoPlayer from '../VideoJS.vue';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'MediaPlayer',
    mixins: [langSnippet, mainFunctions],
    components: {
        VideoPlayer
    },
    data() {
        return {
            mediaID: this.$route.query.id,
            uuid: null,
            media: null,
            seasons: null,
            show: null,
            type: null,
            videoOptions: {
                controls: true,
                duration: true,
                preload: 'auto',
                autoplay: true,
                controlBar: {
                    skipButtons: {
                        forward: 10,
                        backward: 10
                    },
                    volumePanel: {
                        inline: false,
                    },
                    pictureInPictureToggle: false,
                },
                sources: [
                    {
                        src: '',
                        type: 'video/mp4'
                    }
                ],
                userActions: {
                    click: true
                }
            }
        };
    },
    methods: {
        async getMedia(tmdbID) {
            if ( tmdbID !== null && tmdbID !== undefined ) {
                try {
                    const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${tmdbID}`);

                    if ( response.data.length > 0 ) {
                        this.media = response.data[0];
                        this.type = 'movie';
                        this.videoOptions.sources[0].src = this.$mainURL+this.media.file_path;
                    } else {
                        const newResponse = await axios.get(`${this.$mainURL}:3000/api/db/episode?tmdbID=${tmdbID}`);
                        this.media = newResponse.data[0];
                        this.type = 'show';
                        this.videoOptions.sources[0].src = this.$mainURL+this.media.file_path;
                    }

                } catch (error) {
                    console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                    return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
                }         
            }
        },
        async getShow(showID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/media?whereClause=tmdbID=${showID}`);
                this.show = response.data[0];
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        },
        async generateUUID() {
            if ( this.$route.query.uuid === null || this.$route.query.uuid === undefined) {
                this.uuid = uuidv4();
            }
        }
    },
    mounted() {
        this.getMedia(this.mediaID).then(() => {
            if ( this.type === 'show' ) {
                this.getShow(this.media.show_id);
            }
        });

        this.generateUUID();
    }
};
</script>

<style>
#app {

}
body {
    padding-top: 0 !important;
}

#main {
    padding: 0 !important;
    height: unset !important;
    overflow: unset !important;
}
</style>
