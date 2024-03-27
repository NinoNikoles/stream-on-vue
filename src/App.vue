<template>
    <div id="main">
        <template v-if="$route.name !== 'Login' && $route.name !== 'Player' && $route.name !== 'PlayerMulti' && $route.name !== langSnippet('home') && $route.name !== langSnippet('movies') && $route.name !== langSnippet('shows') && $route.name !== langSnippet('my_list')">
            <header-component></header-component>
            <router-view></router-view>
        </template>
        <template v-else>
            <header-component @mediaPopUp="updateVariable"></header-component>
            <router-view @mediaPopUp="updateVariable"></router-view>
        </template>
        
    </div>

    <template v-if="$route.name !== 'Player' && $route.name !== 'PlayerMulti'">
        <div id="callout" data-time="0" data-id="0">
            <p id="callout-content">test</p>
        </div>
    </template>

    <div class="modal" :id="`media-content`">
        <div class="modal-overlay"></div>
        
        <div class="modal-wrap large">
            <div class="modal-inner-wrap rounded">
                <a href="#" class="modal-close" @click="closeMediaPopUp($event)"></a>
                <media-content-popup :media="media" v-if="media"></media-content-popup>
            </div>
        </div>
    </div>
</template>
  
<script>
import Header from './components/Header.vue';
import tmdbAPI from './components/mixins/tmdbAPI.vue';
import functions from './components/mixins/functions.vue';
import langSnippet from './components/mixins/language.vue';
import { Fancybox } from "@fancyapps/ui";
import MediaContentPopupComponent from './components/includes/MediaContentPopup.vue';

export default {
    name: 'AppIndex',
    mixins: [functions, tmdbAPI, langSnippet],
    emits: ['mediaPopUp'],
    components: {
        'header-component': Header,
        'media-content-popup': MediaContentPopupComponent,
    },
    data() {
        return {
            modalActive: false,
            media: null,
        };
    },
    methods: {
        updateVariable(value) {
            this.media = value;
        },
        async closeMediaPopUp(event) {
            event.preventDefault();
            
            try {
                await this.closePopUp(event);
                var popUp = document.getElementById('media-content');

                popUp.addEventListener('transitionend', () => {
                    if ( !popUp.classList.contains('active') ) {
                        this.media = "";
                    }
                });
            } catch (e) {
                console.log(e);
            }        
        }
    },
    updated() {
        document.querySelectorAll('img[data-img]').forEach(function(el) {
            el.setAttribute('src', el.getAttribute('data-img'));
            el.removeAttribute('data-img');
        });
        document.title = this.$route.name;
    },
    async mounted() {
        await this.getDesign();
        Fancybox.bind('[data-fancybox]', {
            dragToClose: false,
        });
    }
};
</script>