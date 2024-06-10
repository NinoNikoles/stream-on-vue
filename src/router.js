import { createRouter, createWebHistory } from 'vue-router';
import langSnippet from './components/mixins/language.vue';
import { isAuthenticated } from '@/auth';

import Index from './components/Index.vue';
import FrontendMovies from './components/frontend/Movies.vue';
import FrontendShows from './components/frontend/Shows.vue';
import Login from './components/Login.vue';
import Logout from './components/Logout.vue';
import Test from './components/Test.vue';
import ContentManager from './components/backend/ContentManager.vue';
// import MediaBrowser from './components/MediaBrowser.vue';
import MediaPlayer from './components/player/Player.vue';
import MediaPlayerSession from './components/player/PlayerMulti.vue';
import BackendSettings from './components/backend/Settings.vue';
import Users from './components/backend/Users.vue';
import BackendGenre from './components/backend/Genre.vue';
import BackendMovies from './components/backend/Movies.vue';
import BackendMovie from './components/backend/SingleMovie.vue';
import BackendShows from './components/backend/Shows.vue';
import BackendShow from './components/backend/SingleShow.vue';
import BackendHighlights from './components/backend/Highlights.vue';
import User from './components/frontend/User.vue';
import MyList from './components/frontend/MyList.vue';

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
            meta: { requiresAuth: true, main: true, noHeader: false } // Diese Route erfordert eine Anmeldung
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { requiresAuth: false, main: false, noHeader: true }
        },
        {
            path: '/logout',
            name: 'Logout',
            component: Logout,
            meta: { requiresAuth: true, main: false, noHeader: false }
        },
        {
            path: '/test',
            name: name('test'),
            component: Test,
            meta: { requiresAuth: false, main: false, noHeader: false } // Diese Route erfordert eine Anmeldung
        },
        {
            path: '/movies',
            name: name('movies'),
            component: FrontendMovies,
            meta: { requiresAuth: true, main: true, noHeader: false } // Diese Route erfordert eine Anmeldung
        },
        {
            path: '/shows',
            name: name('shows'),
            component: FrontendShows,
            meta: { requiresAuth: true, main: true, noHeader: false } // Diese Route erfordert eine Anmeldung
        },
        {
            path: '/b/settings',
            name: name('settings'),
            component: BackendSettings,
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'], noHeader: false, icon: 'setting' }
        },
        {
            path: '/b/users', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: name('users'),
            component: Users,
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'], noHeader: false, icon: 'users'  }
        },
        {
            path: '/b/genre',
            name: name('genres'),
            component: BackendGenre,
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'], noHeader: false, icon: 'list' }
        },
        {
            path: '/b/movies',
            name: name('backend_movies'),
            component: BackendMovies,
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'], noHeader: false, icon: 'movie' }
        },
        {
            path: '/b/shows',
            name: name('backend_shows'),
            component: BackendShows,
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'], noHeader: false, icon: 'media' }
        },
        {
            path: '/b/movie/:id', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: name('movie'),
            component: BackendMovie,
            meta: { requiresAuth: true, backend: false, roles: ['superadmin', 'admin'], noHeader: false }
        },
        {
            path: '/b/show/:id', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: name('show'),
            component: BackendShow,
            meta: { requiresAuth: true, backend: false, roles: ['superadmin', 'admin'], noHeader: false }
        },
        {
            path: '/b/highlights', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: name('highlights'),
            component: BackendHighlights,
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'], noHeader: false, icon: 'star' }
        },
        {
            path: '/my-list',
            name: name('my_list'),
            component: MyList,
            meta: { requiresAuth: true, main: true, backend: false, noHeader: false }
        },
        {
            path: '/u/:username', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: name('profile'),
            component: User,
            meta: { requiresAuth: true, backend: false, noHeader: false  }
        },
        {
            path: '/b/content-manager', // Doppelpunkt vor "id" gibt an, dass es sich um eine dynamische Route handelt
            name: 'Content Manager',
            component: ContentManager,
            meta: { requiresAuth: true, backend: true, roles: ['superadmin', 'admin'], noHeader: false, icon: 'folder' }
        },
        {
            path: '/w',
            name: 'Player',
            component: MediaPlayer,
            meta: { requiresAuth: true, backend: false, noHeader: true }
        },
        {
            path: '/w',
            name: 'PlayerMulti',
            component: MediaPlayerSession,
            meta: { requiresAuth: true, backend: false }
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
