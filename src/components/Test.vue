<template>
    <div class="innerWrap">
        <div class="col12">
            <p><button id="theme-switch" class="btn" @click="themeChange($event)">Change</button></p>
        </div>
        
        <div class="col6">
            <image-loader></image-loader>
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
            <div class="col4"><button class="btn-primray">Primary</button></div>
            <div class="col4"><button class="btn-secondary">Secondary</button></div>
            <div class="col4"><button class="btn-tertiary">Tertiary</button></div>
            <div class="col4"><button class="btn-quaternary">Quaternary</button></div>
            <div class="col4"><button class="btn-quinary">Quinary</button></div>
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