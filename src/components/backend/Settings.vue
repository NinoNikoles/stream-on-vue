<template>
    <div class="innerWrap pad-top-xl pad-bottom-l">
        <div class="col12">
            <div class="col12 marg-bottom-xs">
                <h1>{{ langSnippet('settings') }}</h1>
            </div>

            <div class="col12">
                <form class="row" onsubmit="return false;">

                    <div class="col6 column">
                        <div class="col12 field-wrap">
                            <p>
                                <span class="input-wrap input-select">
                                    <label for="language" data-form="select">{{ langSnippet('language') }}</label>
                                    <select v-model="language" id="language">
                                        <option value="" disabled hidden>- {{ langSnippet('language') }} -</option>
                                        <option value="de-DE">Deutsch</option>
                                        <option value="en-US" selected>English</option>
                                    </select>
                                </span>
                            </p>
                            <hr>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <span class="input-wrap">
                                    <label for="site_title">{{ langSnippet('page_title') }}</label>
                                    <input type="text" v-model="title" id="site_title" required>
                                </span>
                                <span v-if="titleError" class="text-alert italic column marg-top-xxs">{{ titleError }}</span>
                            </p>
                            <hr>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <span class="input-wrap">
                                    <label for="apikey">{{ langSnippet('api_key') }}</label>
                                    <input type="text" v-model="apikey" id="apikey" required>
                                </span>
                                <span v-if="keyError" class="text-alert italic column marg-top-xxs">{{ keyError }}</span>
                            </p>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <span class="column smaller" v-html="langSnippet('apikey_info')"></span>
                            </p>
                            <hr class="mobile-only">
                        </div>
                    </div>

                    <div class="col5 column marg-left-col1">
                        <div class="col12 field-wrap">
                            <p>
                                <label for="enable-edit">{{ langSnippet('enable_edit_btn') }}
                                    <input type="checkbox" id="enable-edit" v-model="edit">
                                </label>
                            </p>
                            <hr>
                        </div>

                        <div class="col12 field-wrap">
                            <p>
                                <label for="design">{{ langSnippet('round_design') }}
                                    <input type="checkbox" id="design" v-model="design">
                                </label>
                            </p>
                        </div>

                        <div class="col12 text-right marg-top-base field-wrap">
                            <input type="submit" @click="saveData($event)" class="btn btn-small btn-success icon-left icon-save loading" :value="langSnippet('save')">
                        </div>
                    </div>
                    
                </form>
            </div>
        </div>
    </div>    
</template>

<script>
import tmdbAPI from './../mixins/tmdbAPI.vue';
import langSnippet from './../mixins/language.vue';
import functions from './../mixins/functions.vue';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI,langSnippet, functions],
    data() {
        return {
            settings: null,
            title: null,
            apikey: null,
            language: "en-US",
            edit: null,
            design: null,
            titleError: null,
            keyError: null,
        };
    },
    methods: {
        async saveData(e) {
            const saveButton = e.target;
            this.disableButton(saveButton);
            this.titleError = null;
            this.keyError = null;
            
            const { title, apikey, language, edit, design } = this;
            var validKey = await this.checkApiKey(apikey);

            if (!title) {
                this.titleError = "Darf nicht leer sein!";
                this.callout('alert', this.langSnippet(this.titleError));
            } else if (validKey) {
                this.keyError = null;

                const fields = [
                    'setting_option'
                ]

                const settingsData = [
                    {site_title: `"${title}"`},
                    {api_key: `"${apikey}"`},
                    {api_lang: `"${language}"`},
                    {enable_edit_btn: `"${edit}"`},
                    {design: `"${design}"`},
                ]

                for ( const data of settingsData ) {
                    try {
                        const [key, value ] = Object.entries(data)[0];
                        await this.postDB(`saveSettings?fields=${fields}&whereClause=setting_name="${key}"`, { [key]: value });
                    } catch (err) {
                        console.log(err);
                    }
                }

                this.callout('success', this.langSnippet('save'));
            } else {
                this.keyError = "API Key is not valid!";
                this.callout('alert', this.langSnippet(this.keyError));
            }
            
            this.enableButton(saveButton);
            if ( design ) {
                document.getElementById('main').classList.add('is-rounded');
            } else {
                document.getElementById('main').classList.remove('is-rounded');
            }
        },
        async getSettings() {
            try {
                const response = await this.fetchDB(`getSettings`);
                return response.data; // Geben Sie die Daten aus der Antwort zurück, nicht die gesamte Antwort
            } catch (error) {
                console.error('Fehler beim Überprüfen des Films in der Datenbank:', error);
                return []; // Geben Sie ein leeres Array zurück, um anzuzeigen, dass keine Daten gefunden wurden
            }
        }
    },
    mounted() {
        this.getSettings().then(settings => {
            // Verwenden Sie outputMovies hier, um die Daten in Ihrer Komponente zu verwenden
            this.apikey = settings[1].setting_option;
            this.language = settings[2].setting_option;
            this.title = settings[3].setting_option;
            this.edit = settings[4].setting_option;
            this.design = settings[5].setting_option;
        });
    }
};
</script>

<style>
#app {

}
</style>
