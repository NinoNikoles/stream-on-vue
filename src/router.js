import { createRouter, createWebHistory } from 'vue-router';
//import axios from 'axios';
import langSnippet from './components/api/language.vue';
import Index from './components/Index.vue';
import FrontendMovies from './components/frontend/Movies.vue';
import FrontendShows from './components/frontend/Shows.vue';
import Login from './components/Login.vue';
import Test from './components/Test.vue';
import BackendSettings from './components/backend/Settings.vue';
import BackendGenre from './components/backend/Genre.vue';
import BackendMovies from './components/backend/Movies.vue';
import BackendMovie from './components/backend/SingleMovie.vue';
import BackendShows from './components/backend/Shows.vue';
import BackendShow from './components/backend/SingleShow.vue';

function name(snippet) {
    return langSnippet.methods.langSnippet(snippet);
}

var routes = [
    {
        path: '/',
        name: name('home'),
        component: Index,
        meta: { requiresAuth: false, main: true } // Diese Route erfordert eine Anmeldung
    },
    {
        path: '/movies',
        name: name('movies'),
        component: FrontendMovies,
        meta: { requiresAuth: false, main: true } // Diese Route erfordert eine Anmeldung
    },
    {
        path: '/shows',
        name: name('shows'),
        component: FrontendShows,
        meta: { requiresAuth: false, main: true } // Diese Route erfordert eine Anmeldung
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false, main: false }
    },
    {
        path: '/backend/settings',
        name: name('settings'),
        component: BackendSettings,
        meta: { requiresAuth: false, backend: true }
    },
    {
        path: '/backend/genre',
        name: name('genres'),
        component: BackendGenre,
        meta: { requiresAuth: false, backend: true }
    },
    {
        path: '/backend/movies',
        name: 'backend movies',
        component: BackendMovies,
        meta: { requiresAuth: false, backend: true }
    },
    {
        path: '/backend/shows',
        name: name('shows'),
        component: BackendShows,
        meta: { requiresAuth: false, backend: true }
    },
    {
        path: '/backend/movie/:id', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
        name: name('movie'),
        component: BackendMovie,
        meta: { requiresAuth: false }
    },
    {
        path: '/backend/show/:id', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
        name: name('show'),
        component: BackendShow,
        meta: { requiresAuth: false }
    },
    {
        path: '/test', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
        name: 'Test',
        component: Test,
        meta: { requiresAuth: false }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
