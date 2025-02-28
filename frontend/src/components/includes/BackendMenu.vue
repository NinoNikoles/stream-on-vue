<template>
    <menu id="backend-menu" :class="`${beMenuOpen} desktop-only`">
        <ul class="backend-menu-list">
            <li class="menu-item">
                <a href="#" id="be-button" class="icon-left router-link-active" @click="toggleBEmenu($event)">{{ langSnippet('close') }}</a>
            </li>

            <li v-for="route in backendRoutes" :key="route.name" class="menu-item">
                <router-link :to="`${route.path}`" :class="`icon-left icon-${route.meta.icon}`" :title="`${route.name}`" @click="closeMainMenu()">{{ route.name }}</router-link>
            </li>
        </ul>
    </menu>    
</template>

<script>
import router from '../../router';
import langSnippet from '../mixins/language.vue';
import functions from '../functions.vue';

export default {
    name: 'BackendMenu',
    mixins: [langSnippet, functions],
    data() {
        return {
            backendRoutes: null,
            router: router, // Greife auf die Routen des router-Objekts zu
            routes: router.options.routes,
            beMenuOpen: '',
        };
    },
    methods: {
        async mainRouter() {
            return this.routes.filter(route => {
                return route.meta.main;
            });
        },
        async backendRouter() {
            this.backendRoutes = this.routes.filter(route => {
                if ( this.$globalState.user.role === 'superadmin' || this.$globalState.user.role === 'admin') return route.meta.backend;                
            });
        },
        toggleBEmenu(event) {
            event.preventDefault();
            const beMenu = document.getElementById('backend-menu');
            const beButtton = document.getElementById('be-button');

            if (beMenu.classList.contains('closed')) {
                beMenu.classList.remove('closed');
                beButtton.classList.remove('closed');
                localStorage.setItem('backendMenu', '');
            } else {
                beMenu.classList.add('closed');
                beButtton.classList.add('closed');
                localStorage.setItem('backendMenu', 'closed');
            }
        },
        checkMenuOpen() {
            const beButtton = document.getElementById('be-button');
            let open = localStorage.getItem('backendMenu');

            if (open == null) {
                this.beMenuOpen = '';
            } else {
                this.beMenuOpen = open;

                if(open === 'closed') {
                    beButtton.classList.add(open);
                }
            }            
        }
    },
    mounted() {
        this.checkMenuOpen();
        this.backendRouter();
    }
};
</script>