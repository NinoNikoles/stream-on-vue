import { createRouter, createWebHistory } from 'vue-router';
import langSnippet from './components/api/language.vue';
import { isAuthenticated } from '@/auth';

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
import BackendHighlights from './components/backend/Highlights.vue';
import MediaLibrary from './components/backend/MediaLibrary.vue';

function name(snippet) {
    return langSnippet.methods.langSnippet(snippet);
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: name('home'),
            component: Index,
            meta: { requiresAuth: true, main: true } // Diese Route erfordert eine Anmeldung
        },
        {
            path: '/movies',
            name: name('movies'),
            component: FrontendMovies,
            meta: { requiresAuth: true, main: true } // Diese Route erfordert eine Anmeldung
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
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'] }
        },
        {
            path: '/backend/genre',
            name: name('genres'),
            component: BackendGenre,
            meta: { requiresAuth: false, backend: true }
        },
        {
            path: '/backend/movies',
            name: name('backend_movies'),
            component: BackendMovies,
            meta: { requiresAuth: false, backend: true }
        },
        {
            path: '/backend/shows',
            name: name('backend_shows'),
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
            path: '/backend/highlights', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: name('highlights'),
            component: BackendHighlights,
            meta: { requiresAuth: false, backend: true }
        },
        {
            path: '/backend/media-library', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: name('media_library'),
            component: MediaLibrary,
            meta: { requiresAuth: false, backend: true }
        },
        {
            path: '/test', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: 'Test',
            component: Test,
            meta: { requiresAuth: false }
        }
    ]
});

router.beforeEach(async(to, from, next) => {
    try {
        const user = await isAuthenticated();
        const isLoggedIn = user && user.isLoggedIn;
    
        if (to.matched.some((record) => record.meta.requiresAuth)) {
            if (!isLoggedIn) {
                next({
                    path: '/login',
                    query: { redirect: to.fullPath },
                });
            } else {
                if (to.meta.roles && !to.meta.roles.includes(user.role)) {
                    // Benutzer hat nicht die erforderliche Rolle, zur Startseite umleiten oder eine andere geeignete Aktion durchführen
                    next('/');
                } else {
                    // Benutzer hat die erforderliche Rolle, fortsetzen
                    next();
                }
            }
        } else {
            // Wenn die Route keine Authentifizierung erfordert, fortsetzen
            next();
        }
    } catch (error) {
        // Fehler beim Abrufen der Benutzerdaten über Axios
        console.error('Error fetching user data:', error);
        next({
            path: '/login',
            query: { redirect: to.fullPath },
        });
    }
});

export default router;
