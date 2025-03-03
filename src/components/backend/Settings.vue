<template>
    <div class="col12 display-flex backend-wrap">

        <backend-menu></backend-menu>
        
        <div class="col12 backend-content pad-top-xl pad-bottom-l">
            <div class="innerWrap">
                <div class="col12 marg-bottom-xs">
                    <h1>{{ langSnippet('settings') }}</h1>
                </div>

                <section class="col12">
                    <div class="col6">
                        <h2 class="h4 regular marg-bottom-s">Grundeinstellungen</h2>
                    </div>

                    <form class="row" onsubmit="return false;">

                        <div class="col6 column">
                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap input-select">
                                        <label for="language" data-form="select">{{ langSnippet('language') }} (API)</label>
                                        <select v-model="language" id="language">
                                            <option value="de-DE">Deutsch</option>
                                            <option value="en-US">English</option>
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
                                <button type="submit" @click="saveData($event)" class="btn btn-small btn-success icon-left icon-save loading" :value="langSnippet('save')">{{ langSnippet('save') }}</button>
                            </div>
                        </div>
                        
                    </form>
                </section>

                <hr>

                <section class="col12">

                    <div class="col12">
                        <h2 class="h4 medium marg-bottom-s">{{ langSnippet('colors') }}</h2>
                    </div>

                    <div class="col12 row" v-if="colors">
                        <div class="col3 column">
                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="primary-color">{{ langSnippet('primary') }}</label>
                                        <span class="input" id="primary-color" name="primary-color">
                                            {{ colors.primary }}
                                        </span>
                                        <input type="color" id="primary-color-select" name="primary-color-select" v-model="colors.primary" /> 
                                    </span>
                                </p>
                            </div>

                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="primaryLight-color">{{ langSnippet('primary') }} - {{ langSnippet('light') }}</label>
                                        <span class="input" id="primaryLight-color" name="primaryLight-color">
                                            {{ colors.primaryLight }}
                                        </span>
                                        <input type="color" disabled id="primaryLight-color-select" name="primaryLight-color-select" v-model="colors.primaryLight" /> 
                                    </span>
                                </p>
                            </div>

                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="primaryDark-color">{{ langSnippet('primary') }} - {{ langSnippet('dark') }}</label>
                                        <span class="input" id="primaryDark-color" name="primaryDark-color">
                                            {{ colors.primaryDark }}
                                        </span>
                                        <input type="color" disabled id="primaryDark-color-select" name="primaryDark-color-select" v-model="colors.primaryDark" /> 
                                    </span>
                                </p>
                            </div>
                        </div>
                        

                        <div class="col3 column">
                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="secondary-color">{{ langSnippet('secondary') }}</label>
                                        <span class="input" id="secondary-color" name="secondary-color">
                                            {{ colors.secondary }}
                                        </span>
                                        <input type="color" id="secondary-color-select" name="secondary-color-select" v-model="colors.secondary" /> 
                                    </span>
                                </p>
                            </div>

                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="secondaryLight-color">{{ langSnippet('secondary') }} - {{ langSnippet('light') }}</label>
                                        <span class="input" id="secondaryLight-color" name="secondaryLight-color">
                                            {{ colors.secondaryLight }}
                                        </span>
                                        <input type="color" disabled id="secondaryLight-color-select" name="secondaryLight-color-select" v-model="colors.secondaryLight" /> 
                                    </span>
                                </p>
                            </div>

                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="secondaryDark-color">{{ langSnippet('secondary') }} - {{ langSnippet('dark') }}</label>
                                        <span class="input" id="secondaryDark-color" name="secondaryDark-color">
                                            {{ colors.secondaryDark }}
                                        </span>
                                        <input type="color" disabled id="secondaryDark-color-select" name="secondaryDark-color-select" v-model="colors.secondaryDark" /> 
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div class="col3 column">
                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="tertiary-color">{{ langSnippet('tertiary') }}</label>
                                        <span class="input" id="tertiary-color" name="tertiary-color">
                                            {{ colors.tertiary }}
                                        </span>
                                        <input type="color" id="tertiary-color-select" name="tertiary-color-select" v-model="colors.tertiary" /> 
                                    </span>
                                </p>
                            </div>

                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="tertiaryLight-color">{{ langSnippet('tertiary') }} - {{ langSnippet('light') }}</label>
                                        <span class="input" id="tertiaryLight-color" name="tertiaryLight-color">
                                            {{ colors.tertiaryLight }}
                                        </span>
                                        <input type="color" disabled id="tertiaryLight-color-select" name="tertiaryLight-color-select" v-model="colors.tertiaryLight" /> 
                                    </span>
                                </p>
                            </div>

                            <div class="col12 field-wrap">
                                <p>
                                    <span class="input-wrap color-wrap">
                                        <label for="tertiaryDark-color">{{ langSnippet('tertiary') }} - {{ langSnippet('dark') }}</label>
                                        <span class="input" id="tertiaryDark-color" name="tertiaryDark-color">
                                            {{ colors.tertiaryDark }}
                                        </span>
                                        <input type="color" disabled id="tertiaryDark-color-select" name="tertiaryDark-color-select" v-model="colors.tertiaryDark" /> 
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="col12">
                        <div class="row text-right">
                            <span class="column">
                                <p>
                                    <button @click="resetColors($event)" class="btn btn-small btn-warning icon-left icon-replay loading" :value="langSnippet('reset')">{{ langSnippet('reset') }}</button>
                                </p>
                            </span>
                            <span class="column">
                                <p>
                                    <button @click="updateColors($event)" class="btn btn-small btn-success icon-left icon-save loading" :value="langSnippet('save')">{{ langSnippet('save') }}</button>
                                </p>
                            </span>
                        </div>
                    </div>

                </section>
            </div>
        </div>

    </div>
</template>

<script>
import tmdbAPI from '../mixins/tmdbAPI.vue';
import langSnippet from '../mixins/language.vue';
import functions from '../functions.vue';
import BackendMenu from '../includes/BackendMenu.vue';
import chroma from 'chroma-js';
import axios from 'axios';

export default {
    name: 'BackendMovie',
    mixins: [tmdbAPI,langSnippet, functions],
    components: {
        'backend-menu': BackendMenu,
    },
    data() {
        return {
            settings: null,
            title: this.$globalState.pageSettings[3].setting_option,
            apikey: this.$globalState.pageSettings[1].setting_option,
            language: this.$globalState.pageSettings[2].setting_option,
            edit: this.$globalState.pageSettings[4].setting_option,
            design: this.$globalState.pageSettings[5].setting_option,
            titleError: null,
            keyError: null,
            colors: {
                primary: '',
                primaryLight: '',
                primaryDark: '',
                secondary: '',
                secondaryLight: '',
                secondaryDark: '',
                tertiary: '',
                tertiaryLight: '',
                tertiaryDark: '',
            },
            oldColors: {
                primary: '',
                primaryLight: '',
                primaryDark: '',
                secondary: '',
                secondaryLight: '',
                secondaryDark: '',
                tertiary: '',
                tertiaryLight: '',
                tertiaryDark: '',
            }
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
                    {site_title: `'${title}'`},
                    {api_key: `'${apikey}'`},
                    {api_lang: `'${language}'`},
                    {enable_edit_btn: `'${edit}'`},
                    {design: `'${design}'`},
                ]

                settingsData.map(async (data) => {
                    const [key, value] = Object.entries(data)[0];
                    var response = await this.postDB(`saveSettings?fields=${fields}&whereClause=setting_name="${key}"`, { [key]: value });
                    return new Promise((resolve) => {
                        resolve(response);
                    });
                });

                this.$globalState.pageSettings = this.settings = await this.get_page_settings();

                this.callout('success', this.langSnippet('save'));
            } else {
                this.keyError = "API Key is not valid!";
                this.callout('alert', this.langSnippet(this.keyError));
            }

            this.enableButton(saveButton);

            if ( design && design !== 'false' ) {
                document.getElementById('main').classList.add('is-rounded');
            } else {
                document.getElementById('main').classList.remove('is-rounded');
            }
        },
        getHexColor(color) {
            var rootStyles = getComputedStyle(document.documentElement);

            var colors = {
                "aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
                "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
                "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
                "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
                "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
                "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
                "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
                "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
                "honeydew":"#f0fff0","hotpink":"#ff69b4",
                "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
                "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
                "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
                "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
                "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
                "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
                "navajowhite":"#ffdead","navy":"#000080",
                "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
                "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
                "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
                "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
                "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
                "violet":"#ee82ee",
                "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
                "yellow":"#ffff00","yellowgreen":"#9acd32"
            };

            var colorCode = rootStyles.getPropertyValue(color);

            if (typeof colors[colorCode.toLowerCase()] != 'undefined')
                return colors[colorCode.toLowerCase()];

            return colorCode;
        },
        async cssVariables() {
            try {
                var response = await this.get("SELECT setting_option FROM settings WHERE setting_name = 'colors'");
            } catch(err) {
                console.log(err);
            }

            if (response[0].setting_option != undefined || response[0].setting_option != null) {
                var dbColors = JSON.parse(response[0].setting_option);

                this.colors.primary = dbColors.primary;
                this.colors.primaryLight = dbColors.primaryLight;
                this.colors.primaryDark = dbColors.primaryDark;

                this.colors.secondary = dbColors.secondary;
                this.colors.secondaryLight = dbColors.secondaryLight;
                this.colors.secondaryDark = dbColors.secondaryDark;

                this.colors.tertiary = dbColors.tertiary;
                this.colors.tertiaryLight = dbColors.tertiaryLight;
                this.colors.tertiaryDark = dbColors.tertiaryDark;
            } else {
                var primary = this.getHexColor('--primary');
                var primaryLight = this.getHexColor('--primary-light');
                var primaryDark = this.getHexColor('--primary-dark');

                var secondary = this.getHexColor('--secondary');
                var secondaryLight = this.getHexColor('--secondary-light');
                var secondaryDark = this.getHexColor('--secondary-dark');

                var tertiary = this.getHexColor('--tertiary');
                var tertiaryLight = this.getHexColor('--tertiary-light');
                var tertiaryDark = this.getHexColor('--tertiary-dark');
                
                this.colors.primary = primary;
                this.colors.primaryLight = primaryLight;
                this.colors.primaryDark = primaryDark;

                this.colors.secondary = secondary;
                this.colors.secondaryLight = secondaryLight;
                this.colors.secondaryDark = secondaryDark;

                this.colors.tertiary = tertiary;
                this.colors.tertiaryLight = tertiaryLight;
                this.colors.tertiaryDark = tertiaryDark;
            }

            for (var key in this.colors) {
                this.updateCSS(this.colors, key);
            }

            var obj = {};
            for (const key in this.colors) {
                obj[key] = this.colors[key];
            }

            this.oldColors = obj;
        },
        lighten(color, hslPercent) {
            const chromaColor = chroma(color);
            const newColor = chromaColor.set("hsl.l", chromaColor.get("hsl.l") + hslPercent);
            return newColor.hex();
        },
        darken(color, hslPercent) {
            return this.lighten(color, -hslPercent);
        },
        async updateColors(e) {
            const saveButton = e.target;
            this.disableButton(saveButton);

            var query = `UPDATE settings SET setting_option = ? WHERE setting_name = ?`;
            var data = [
                JSON.stringify(this.colors),
                'colors',
            ];

            try {
                await axios.post(`${this.$mainURL}:3000/api/db/postQuery`, { query, data });

                this.callout('success', this.langSnippet('save'));

                this.enableButton(saveButton);
            } catch(err) {
                console.log(err);
            }
        },
        resetColors() {
            document.documentElement.style = "";

            for (var key in this.colors) {
                if (!key.endsWith('Light') && !key.endsWith('Dark')) {                    
                    this.colors[key] = this.getHexColor(`--${key}`);
                    this.colors[key+'Light'] = this.lighten(this.colors[key], 0.2);
                    this.colors[key+'Dark'] = this.darken(this.colors[key], 0.2);

                    this.oldColors[key] = this.colors[key];
                    this.oldColors[key+'Light'] = this.colors[key+'Light'];
                    this.oldColors[key+'Dark'] = this.colors[key+'Dark'];
                }
            }
        },
        updateCSS(colors, key) {
            if (!key.endsWith('Light') && !key.endsWith('Dark')) {
                if ( colors[key] !== this.oldColors[key]) {
                    this.colors[key+'Light'] = this.lighten(colors[key], 0.2);
                    this.colors[key+'Dark'] = this.darken(colors[key], 0.2);

                    this.oldColors[key] = colors[key];
                    this.oldColors[key+'Light'] = this.colors[key+'Light'];
                    this.oldColors[key+'Dark'] = this.colors[key+'Dark'];

                    document.querySelector('html[data-theme="dark"]').style.setProperty(`--${key}`, colors[key]);
                    document.querySelector('html[data-theme="dark"]').style.setProperty(`--${key}-light`, this.colors[key+'Light']);
                    document.querySelector('html[data-theme="dark"]').style.setProperty(`--${key}-dark`, this.colors[key+'Dark']);
                }
            }
        }
    },
    watch: {
        colors: {
            handler(newColors) {
                for (var key in newColors) {
                    this.updateCSS(newColors, key);
                }
            },
            deep: true
        },
    },
    async mounted() {
        await this.cssVariables();
    }
};
</script>