<template>
    <div id="main">
        <template v-if="$route.name !== 'Login' && $route.name !== 'Player' && $route.name !== 'PlayerMulti'">
            <header-component @mediaPopUp="updateVariable"></header-component>
        </template>
        
        <router-view @mediaPopUp="updateVariable"></router-view>
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
                <media-content-popup :media="media"></media-content-popup>
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
    },
    mounted() {
        Fancybox.bind('[data-fancybox]', {
            dragToClose: false,
        });
    }
};
</script>