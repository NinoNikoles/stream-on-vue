<template>
    <header-component></header-component>

    <router-view></router-view>
</template>
  
<script>
import Header from './components/Header.vue';
import tmdbAPI from './components/mixins/tmdbAPI.vue';
import langSnippet from './components/mixins/language.vue';

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
    }
};
</script>