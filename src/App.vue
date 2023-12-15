<template>
    <template v-if="$route.name !== 'Player' && $route.name !== 'PlayerMulti'">
        <header-component></header-component>
    </template>    

    <div id="main" class="pad-bottom-xl">
        <router-view></router-view>
    </div>
</template>
  
<script>
import Header from './components/Header.vue';
import tmdbAPI from './components/mixins/tmdbAPI.vue';
import langSnippet from './components/mixins/language.vue';
import { Fancybox } from "@fancyapps/ui";

export default {
    name: 'AppIndex',
    mixins: [tmdbAPI, langSnippet],
    components: {
        'header-component': Header,
    },
    data() {
        return {
            modalActive: false
        };
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