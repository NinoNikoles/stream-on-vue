<template>
    <div class="innerWrap">
        <div class="col12">
            <p><button id="theme-switch" class="btn" @click="themeChange($event)">Change</button></p>
        </div>

        <div class="col6">
            <h1>Lorem ipsum dolor sit amet.</h1>
            <h2>Lorem ipsum dolor sit amet.</h2>
            <h3>Lorem ipsum dolor sit amet.</h3>
            <h4>Lorem ipsum dolor sit amet.</h4>
            <h5>Lorem ipsum dolor sit amet.</h5>
            <h6>Lorem ipsum dolor sit amet.</h6>
        </div>

        <div class="col6">
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste, aut eos. Aperiam quis aliquam nobis deleniti ullam vero mollitia ut libero pariatur dolores veniam quia, beatae dolore quo dignissimos alias aut! Odit in amet recusandae tenetur quidem unde, et velit quo inventore sequi eum nemo repellat cum molestias sit fuga!</p>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem sint magnam vitae officia, quaerat nisi ex quod fugiat fuga modi rerum unde impedit provident neque. Vero ea, numquam ex optio provident, eveniet quae harum ullam sunt magni nihil ipsa eligendi unde veniam error, itaque dolores eaque voluptate et placeat cum.</p>
        </div>

        <div class="col6">
            <div class="col4"><button class="btn btn-primray">Primary</button></div>
            <div class="col4"><button class="btn btn-secondary">Secondary</button></div>
            <div class="col4"><button class="btn btn-tertiary">Tertiary</button></div>
            <div class="col4"><button class="btn btn-quaternary">Quaternary</button></div>
            <div class="col4"><button class="btn btn-quinary">Quinary</button></div>
        </div>

        <div class="col12">
            <form class="row">
                <div class="col2 column field-wrap">
                    <p>
                        <span class="input-wrap input-select">
                            <label for="anrede">Anrede</label>
                            <select id="anrede" name="anrede">
                                <option>Frau</option>
                                <option>Herr</option>
                                <option>Divers</option>
                            </select>
                        </span>
                    </p>
                </div>
                <div class="col5 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="vorname">Vorname</label>
                            <input type="text" id="vorname" name="vorname">
                        </span>
                    </p>
                </div>
                <div class="col5 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="nachname">Nachname</label>
                            <input type="text" id="nachname" name="nachname">
                        </span>
                    </p>
                </div>
                <div class="col4 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="email">E-Mail</label>
                            <input type="email" id="email" name="email">
                        </span>
                    </p>
                </div>
                <div class="col4 column  field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="tel">Telefon</label>
                            <input type="tel" id="tel" name="tel">
                        </span>
                    </p>
                </div>
                <div class="col12 column field-wrap">
                    <p>
                        <span class="input-wrap">
                            <label for="message">Nachricht</label>
                            <textarea id="message" name="message"></textarea>
                        </span>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>
  
<script>
import functions from './mixins/functions.vue';
// import ImageLoader from './includes/ImageLoader.vue';

export default {
    name: 'AppTest',
    mixins: [functions],
};
</script>