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
            'backend_movies': 'Edit Movies',
            'backend_shows': 'Edit TV Shows',
            'cancel': 'Cancel',
            'close': 'Close',
            'continue': 'Continue',
            'create_folder': 'Create folder',
            'delete': 'Delete',
            'delete_folder': 'Delete folder?',
            'edit': 'Edit',
            'edit_user': 'Edit <strong>$content</strong>',
            'episode': 'Episode',
            'episodes': 'Episodes',
            'filter_by': 'Filter by',
            'folder_already_exists': 'Folder already exists',
            'folder_name': 'Folder name',
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
            'media_library': 'Media library',
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
            'new_password': 'New password',
            'next_episode': 'Next episode',
            'order': 'Order',
            'oder_filter': 'Order by',
            'page_title': 'Page title',
            'password': 'Password',
            'password_repeate': 'Repeate password',
            'preview': 'Preview',
            'profile': 'Profile',
            'rating': 'Rating',
            'release_date': 'Release date',
            'remove': 'Remove',
            'rename_folder': 'Rename folder',
            'reset': 'Reset',
            'role': 'Role',
            'runtime': 'Runtime',
            'save': 'Save',
            'search': 'Search',
            'search_results': 'Search results',
            'season': 'Season',
            'seasons': 'Seasons',
            'select': 'Select',
            'send': 'Send',
            'settings': 'Settings',
            'show': 'TV Show',
            'show_name': 'TV Show Title',
            'shows': 'TV Shows',
            'similar': 'Similar',
            'status': 'Status',
            'thumbnail': 'Thumbnail',
            'tmdb_id': 'TMDB ID',
            'trailer': 'Trailer',
            'update': 'Update',
            'upload_file': 'Upload file',
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
            'select_new_backdrop': 'Select a new thumbnail',
            'select_new_poster': 'Select a new poster',
            'select_a_video_file': 'Select a video file',
            'current_selected': 'Currently selected',
            'round_design': 'Rounded design of this site?',

            // Other
            'admin_setup_here': 'Please update the page settings <a href="/backend/settings"><strong>here</strong></a> to be able to add your content.',
            'folder_name_not_empty': 'Folder name can not be empty.',
            'has_joined_the_chat': 'has joined the chat.',
            'loading_content': 'Loading content, please wait.',
            'no_content_existing': 'No content available.',
            'no_content_found': 'No content was found.',
            'pls_wait_for_admin_setup': 'No content has been added yet. Please be patient a little longer.',
            'select_file': 'Select a file',
            'select_image': 'Select a new image',
            'upload_new_img': 'Upload new profile image',
            'please_wait_adding_show': 'Please wait. This could take a while.',
            'no_highlights_available': 'No highlights available.',

            //Add
            'add_movie_to_library': 'Do you want to add the movie "<strong>$content</strong>" to your library?',

            //Delete
            'delete_highlight': 'Do you want to remove "<strong>$content</strong>" from highlights?',
            'delete_user': 'Do you really want to delete the user "<strong>$content</strong>"?',

            // Colors
            'color': 'Color',
            'colors': 'Colors',
            'light': 'light',
            'dark': 'dark',

            'primary': 'Primary',
            'secondary': 'Secondary',
            'tertiary': 'Tertiary',

            'white': 'White',
            'black': 'Black',
            'grey': 'Grey',
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
            'backend_movies': 'Filme bearbeiten',
            'backend_shows': 'TV Serien bearbeiten',
            'cancel': 'Abbrechen',
            'close': 'Schließen',
            'continue': 'Fortsetzen',
            'create_folder': 'Ordner erstellen',
            'delete': 'Löschen',
            'delete_folder': 'Ordner löschen?',
            'edit': 'Bearbeiten',
            'edit_user': '<strong>$content</strong> bearbeiten',
            'episode': 'Folge',
            'episodes': 'Folgen',
            'filter_by': 'Filtern nach',
            'folder_already_exists': 'Ordner existiert bereits',
            'folder_name': 'Ordner Name',
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
            'media_library': 'Medien Bibliothek',
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
            'new_password': 'Neues Passwort',
            'next_episode': 'Nächste Folge',
            'order': 'Reihenfolge',
            'oder_filter': 'Sortieren nach',
            'page_title': 'Seitenname',
            'password': 'Passwort',
            'password_repeate': 'Passwort wiederholen',
            'preview': 'Vorschau',
            'profile': 'Profil',
            'rating': 'Bewertung',
            'release_date': 'Erscheinungsdatum',
            'remove': 'Entfernen',
            'rename_folder': 'Ordner umbenennen',
            'reset': 'Zurücksetzen',
            'role': 'Rolle',
            'runtime': 'Dauer',
            'save': 'Speichern',
            'search': 'Suchen',
            'search_results': 'Suchergebnisse',
            'season': 'Staffel',
            'seasons': 'Staffeln',
            'select': 'Auswählen',
            'send': 'Senden',
            'settings': 'Einstellungen',
            'show': 'TV Serie',
            'show_name': 'Name der TV Serie',
            'shows': 'TV Serien',
            'similar': 'Ähnlich',
            'status': 'Status',
            'thumbnail': 'Thumbnail',
            'tmdb_id': 'TMDB ID',
            'trailer': 'Trailer',
            'update': 'Aktualisieren',
            'upload_file': 'Datei hochladen',
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
            'select_new_backdrop': 'Wähle ein neues Thumbnail',
            'select_new_poster': 'Wähle ein neues Poster',
            'select_a_video_file': 'Wähle eine Videodatei aus',
            'current_selected': 'Aktuell ausgewählt',
            'round_design': 'Abgerundetes Design der Seite?',

            // Other
            'admin_setup_here': 'Bitte aktualisiere <a href="/backend/settings"><strong>hier</strong></a> die Seiteneinstellungen um Inhalte hinzufügen zu können.',
            'folder_name_not_empty': 'Ordnername darf nicht leer sein.',
            'has_joined_the_chat': 'ist dem Chat beigetreten.',
            'loading_content': 'Inhalte werden geladen, bitte warte.',
            'no_content_existing': 'Keine Inhalte vorhanden.',
            'no_content_found': 'Keine Inhalte gefunden.',
            'pls_wait_for_admin_setup': 'Es wurden noch keine Inhalte hinzugfügt. Bitte hab noch etwas Gedult.',
            'select_file': 'Datei auswählen',
            'select_image': 'Wähle ein neues Bild aus',
            'upload_new_img': 'Neues Profilbild hochladen',
            'please_wait_adding_show': 'Bitte warten. Dies könnte einige Zeit in Anpsruch nehmen.',
            'no_highlights_available': 'Keine Highlights vorhanden.',

            //Add
            'add_movie_to_library': 'Möchtest du den Film "<strong>$content</strong>" deiner Bibliothek hinzufügen?',

            //Delete
            'delete_highlight': 'Möchtest du "<strong>$content</strong>" aus den Highlights entfernen?',
            'delete_user': 'Möchtest du den Benutzer "<strong>$content</strong>" wirklich löschen?',

            // Colors
            'color': 'Farbe',
            'colors': 'Farben',
            'light': 'hell',
            'dark': 'dunkel',

            'primary': 'Primär',
            'secondary': 'Sekundär',
            'tertiary': 'Tertiär',

            'white': 'Weiß',
            'black': 'Schwarz',
            'grey': 'Grau',
        }
    }
]

export default {
    name: 'LangSnippet',
    methods: {
        langSnippet(snippet, content = '' ) {
            const browserLanguage = navigator.language || navigator.userLanguage;
            var langObject = langs.find(lang => lang.locale === browserLanguage);
            let langsnippet = snippet;

            if (langObject && langObject.translations[snippet]) {
                langsnippet = langObject.translations[snippet];

                if ( content !== '' && langsnippet.includes("$content") ) {
                    langsnippet = langsnippet.replace("$content", content);
                }
            } else {
                langObject = langs.find(lang => lang.locale === 'en-US');
                if (langObject && langObject.translations[snippet]) {
                    let langsnippet = langObject.translations[snippet];

                    if ( content !== '' && langsnippet.includes("$content") ) {
                        langsnippet = langsnippet.replace("$content", content);
                    }
                }
            }

            return langsnippet;
        },
    },
};
</script>