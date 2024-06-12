<template>

    <div id="main">
        <header-component v-if="!noHeader"></header-component>
        
        <router-view></router-view>
    </div>

    <template v-if="$route.path !== '/watch' && $route.name !== 'PlayerMulti'">
        <div id="callout" data-time="0" data-id="0">
            <p id="callout-content">test</p>
        </div>
    </template>

    <div class="modal" id="media-content-modal">
        <div class="modal-overlay" id="modal-overlay"></div>
        
        <div class="modal-wrap large" id="modal-wrap">
            <div class="modal-inner-wrap rounded" id="media-content">
                <a href="#" class="modal-close" @click="closePopUp($event, 'media-content-modal')"></a>
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

export default {
    name: 'AppIndex',
    mixins: [functions, tmdbAPI, langSnippet],
    components: {
        'header-component': Header
    },
    data() {
        return {
            noHeader: true,
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
        },
        async colors() {
            try {
                var response = await this.get("SELECT setting_option FROM settings WHERE setting_name = 'colors'");

                if (response[0].setting_option != undefined || response[0].setting_option != null) {
                    var dbColors = JSON.parse(response[0].setting_option);

                    for (var key in dbColors) {
                        if (!key.endsWith('Light') && !key.endsWith('Dark')) {
                            console.log(key);
                            document.querySelector('html[data-theme="dark"]').style.setProperty(`--${key}`, dbColors[key]);
                            document.querySelector('html[data-theme="dark"]').style.setProperty(`--${key}-light`, dbColors[key+'Light']);
                            document.querySelector('html[data-theme="dark"]').style.setProperty(`--${key}-dark`, dbColors[key+'Dark']);
                        }
                    }
                }
            } catch(err) {
                console.log(err);
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
    watch: {
        '$route'(to) {
            if (to.meta.noHeader) {
                this.noHeader = true;
            } else {
                this.noHeader = false;
            }
        }
    },
    async mounted() {
        await this.getDesign();
        await this.colors();
        Fancybox.bind('[data-fancybox]', {
            dragToClose: false,
        });
    }
};
</script>