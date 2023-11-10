<!-- src/components/MovieComponent.vue -->
<script>
const langs = [
    {
        'locale': 'en-US',
        'translations': {
            // Universal
            'add': 'Add',
            'add_highlight': 'Add to highlights',
            'admin': 'Admin',
            'add_user': 'Add User',
            'all': 'All',
            'all_uploads': 'All uploads',
            'api_key': 'API Key',
            'back_to_homepage': 'Back to homepage',
            'cancel': 'Cancel',
            'continue': 'Continue',
            'delete': 'Delete',
            'edit': 'Edit',
            'edit_user': 'Edit user',
            'episode': 'Episode',
            'episodes': 'Episodes',
            'genre': 'Genre',
            'genres': 'Genres',
            'highlight': 'Highlight',
            'highlights': 'Highlights',
            'home': 'Home',
            'hour': 'Hour',
            'hours': 'Hours',
            'id': 'ID',
            'language': 'Language',
            'list': 'List',
            'load_genres': 'Load genres',
            'login': 'Login',
            'logout': 'Logout',
            'menu': 'Menu',
            'message': 'Message',
            'minute': 'Minute',
            'minutes': 'Minutes',
            'more_informations': 'More infromations',
            'movie': 'Film',
            'movie_title': 'Movie title',
            'movies': 'Movies',
            'my_list': 'My list',
            'name': 'Name',
            'next_episode': 'Next episode',
            'order': 'Order',
            'page_title': 'Page title',
            'password': 'Password',
            'profile': 'Profile',
            'remove': 'Remove',
            'role': 'Role',
            'save': 'Save',
            'search': 'Search',
            'search_results': 'Search results',
            'season': 'Season',
            'seasons': 'Seasons',
            'send': 'Send',
            'settings': 'Settings',
            'show': 'TV Show',
            'shows': 'TV Shows',
            'similar': 'Similar',
            'status': 'Status',
            'tmdb_id': 'TMDB ID',
            'trailer': 'Trailer',
            'update': 'Update',
            'user': 'User',
            'user_img': 'User image',
            'username': 'Username',
            'users': 'Users',
            'watch_now': 'Watch now',

            // Backend
            'apikey_info': `You need an apikey to fetch fetch infos from the movie database. Klick <a href="https://www.themoviedb.org/settings/api" class="smaller" target="_blank" title="TMDB">here</a> to get your own key!`,
            'lang_info': 'The language is need to fetch all infos in your desired language. Format: language-COUNTRY (example: en-US)',
			'trailer_info': 'ID of the YouTube video URL. Example: https://www.youtube.com/watch?v=<strong>iUISLveqaII</strong>',
            'enable_edit_btn': 'Do you want to allow media editing from the main pages? (concerns admins only)',

            // Other
            'admin_setup_here': 'Please update the page settings <a href="/backend/settings"><strong>here</strong></a> to be able to add your content.',
            'has_joined_the_chat': 'has joined the chat.',
            'loading_content': 'Loading content, please wait.',
            'no_content_found': 'No content was found.',
            'pls_wait_for_admin_setup': 'No content has been added yet. Please be patient a little longer.',
            'upload_new_img': 'Upload new profile image',
        }
        
    },
    {
        'locale': 'de-DE',
        'translations': {
            // Universal
            'add': 'Hinzufügen',
            'add_highlight': 'Zu Highlights hinzufügen',
            'admin': 'Administrator',
            'add_user': 'Benutzer hinzufügen',
            'all': 'Alle',
            'all_uploads': 'Alle Uploads',
            'api_key': 'API-Schlüssel',
            'back_to_homepage': 'Zurück zur Startseite',
            'cancel': 'Abbrechen',
            'continue': 'Fortsetzen',
            'delete': 'Löschen',
            'edit': 'Bearbeiten',
            'edit_user': 'Benutzer bearbeiten',
            'episode': 'Folge',
            'episodes': 'Folgen',
            'genre': 'Genre',
            'genres': 'Genre',
            'highlight': 'Highlight',
            'highlights': 'Highlights',
            'home': 'Startseite',
            'hour': 'Stunde',
            'hours': 'Stunden',
            'id': 'ID',
            'language': 'Sprache',
            'list': 'Liste',
            'load_genres': 'Genre laden',
            'login': 'Login',
            'logout': 'Logout',
            'menu': 'Menü',
            'message': 'Nachricht',
            'minute': 'Minute',
            'minutes': 'Minuten',
            'more_informations': 'Mehr Informationen',
            'movie': 'Film',
            'movie_title': 'Filmtitel',
            'movies': 'Filme',
            'my_list': 'Meine Liste',
            'name': 'Name',
            'next_episode': 'Nächste Folge',
            'order': 'Reihenfolge',
            'page_title': 'Seitenname',
            'password': 'Passwort',
            'profile': 'Profil',
            'remove': 'Entfernen',
            'role': 'Rolle',
            'save': 'Speichern',
            'search': 'Suchen',
            'search_results': 'Suchergebnisse',
            'season': 'Staffel',
            'seasons': 'Staffeln',
            'send': 'Senden',
            'settings': 'Einstellungen',
            'show': 'TV Serie',
            'shows': 'TV Serien',
            'similar': 'Ähnlich',
            'status': 'Status',
            'tmdb_id': 'TMDB ID',
            'trailer': 'Trailer',
            'update': 'Aktualisieren',
            'user': 'Benutzer',
            'user_img': 'Benutzerfoto',
            'username': 'Benutzername',
            'users': 'Benutzer',
            'watch_now': 'Jetzt anschauen',

            // Backend
            'apikey_info': `Du brauchst einen API-Schlüssel um Inhalte laden zu können. Registriere dich bitte dafür bei <a href="https://www.themoviedb.org/" class="smaller" target="_blank" title="TMDB">The Movie Database (TMDB)</a>. Anschließend erhälst du <a href="https://www.themoviedb.org/settings/api" class="smaller" target="_blank" title="TMDB API Schlüssel">hier</a> deinen <strong>kostenlosen</strong> API-Schlüssel!`,
            'lang_info': 'Wird benötigt um Inhalte in der gewünschten Sprache zu laden. Format: language-COUNTRY (example: en-US)',
			'trailer_info': 'ID der YouTube Video URL. Beispiel: https://www.youtube.com/watch?v=<strong>iUISLveqaII</strong>',
            'enable_edit_btn': 'Erlaube das Bearbeiten von Inhalten direkt von den Hauptseiten? (Betrifft nur Administratoren)',

            // Other
            'admin_setup_here': 'Bitte aktualisiere <a href="/backend/settings"><strong>hier</strong></a> die Seiteneinstellungen um Inhalte hinzufügen zu können.',
            'has_joined_the_chat': 'ist dem Chat beigetreten.',
            'loading_content': 'Inhalte werden geladen, bitte warte.',
            'no_content_found': 'Keine Inhalte gefunden.',
            'pls_wait_for_admin_setup': 'Es wurden noch keine Inhalte hinzugfügt. Bitte hab noch etwas Gedult.',
            'upload_new_img': 'Neues Profilbild hochladen',
        }
    }
]

export default {
    name: 'LangSnippet',
    methods: {
        langSnippet(snippet) {
            const browserLanguage = navigator.language || navigator.userLanguage;
            var langObject = langs.find(lang => lang.locale === browserLanguage);
            if (langObject && langObject.translations[snippet]) {
                return langObject.translations[snippet];
            } else {
                langObject = langs.find(lang => lang.locale === 'en-US');
                if (langObject && langObject.translations[snippet]) {
                    return langObject.translations[snippet];
                }
                return snippet;
            }            
        },
    },
};
</script>