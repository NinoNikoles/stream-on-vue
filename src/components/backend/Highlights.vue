<template>
    <div class="col12 display-flex backend-wrap">

        <backend-menu></backend-menu>

        <div class="col12 backend-content pad-top-xl pad-bottom-l">
            <div class="innerWrap">
                <div class="col12">
                    <h1>{{ langSnippet('highlights') }}</h1>
                </div>
            
                <div class="col12">

                    <table class="table rounded marg-no" v-if="highlights">
                        <thead>
                            <th class="desktop-only">{{ langSnippet('thumbnail') }}</th>
                            <th>{{ langSnippet('name') }}</th>
                            <th>{{ langSnippet('status') }}</th>
                            <th>{{ langSnippet('remove') }}</th>
                        </thead>
                        <tbody>
                            <tr v-for="(highlight, index) in highlights" :key="index">
                                <td class="desktop-only"><figure class="widescreen"><img :src="$loadImg(highlight.backdrop)" loading="lazy"></figure></td>
                                <td><a :href="`/backend/movie/${highlight.highlight_id}`" :title="`${highlight.title}`" class="marg-no dark">{{ highlight.title }}</a></td>
                                <td>
                                    <input type="checkbox" @change="changeHighlightStatus" :data-media="`${highlight.highlight_id}`" class="highlight-change" v-if="highlight.highlight_status === 1" v-bind:checked="true">
                                    <input type="checkbox" @change="changeHighlightStatus" :data-media="`${highlight.highlight_id}`" class="highlight-change" v-else>
                                </td>
                                <td><button :data-src="`#delete-highlight-${highlight.highlight_id}`" class="btn btn-alert icon-only icon-trash marg-no" data-fancybox></button></td>
                            
                                <div :id="`delete-highlight-${highlight.highlight_id}`" style="display:none;">
                                    <p v-html="langSnippet('delete_highlight', highlight.title)"></p>
                                    <p class="text-right marg-no">
                                        <button class="btn btn-alert icon-left icon-trash" :data-media="`${highlight.highlight_id}`" data-fancybox-close type="submit" name="delete-highlight" @click="deleteHighlight">{{ langSnippet('remove') }}</button>
                                    </p>
                                </div>
                            </tr>
                        </tbody>
                    </table>

                    <p class="marg-no" v-else>{{ langSnippet('no_highlights_available')}}</p>

                </div>
            </div>
        </div>
    </div>    
</template>

<script>
import axios from 'axios';
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import mainFunctions from '../functions.vue';
import BackendMenu from './../includes/BackendMenu.vue';

export default {
    name: 'BackendGenre',
    mixins: [tmdbAPI, langSnippet, mainFunctions],
    components: {
        'backend-menu': BackendMenu,
    },
    data() {
        return {
            highlights: null,
        };
    },
    methods: {
        async outPutHighlights() {
            const response = await axios.get(`${this.$mainURL}:3000/api/db/getAllHighlights`);
            var data = response.data;
            return new Promise((resolve) => {
                if (data.length === 0) data = null;
                resolve(data);
            }); 
        },
        async changeHighlightStatus(e) {
            const input = e.target;
            var id = input.dataset.media;
            var status;
            if ( input.checked ) {
                status = 1;
            } else {
                status = 0;
            }

            try {
                await axios.post(`${this.$mainURL}:3000/api/db/changeHighlightStatus?id=${id}&status=${status}`);
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
            }
        },
        async deleteHighlight(e) {
            const button = e.target;
            var id = button.dataset.media;

            try {
                await axios.post(`${this.$mainURL}:3000/api/db/deleteHighlight?id=${id}`);

                this.highlights = await this.outPutHighlights();
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
            }
        }
    },
    async mounted() {
        this.highlights = await this.outPutHighlights();
    }
};
</script>

<style>
#app {

}
</style>
