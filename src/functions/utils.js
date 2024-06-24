export function tmdbIDinArray(element, arr) {
    var equal = false;

    if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            if (element === arr[i].tmdbID) {
                equal = true;
                return equal;
            }
        }
    }
    return false;
}

export function toggleMainMenu(event) {
    event.preventDefault();
    const body = document.body;
    var bodyScrollWidth = this.bodyScrollDiv();
    var menuBtn = document.getElementById('menu-button');
    body.classList.toggle('active-menu');

    if (!body.classList.contains('active-menu')) {
        body.style.paddingRight = '';
    } else {
        body.style.paddingRight = `${bodyScrollWidth}px`;
    }
    menuBtn.classList.toggle('active-button');
}

export function closeMainMenu() {
    var menuBtn = document.getElementById('menu-button');
    document.body.classList.remove('active-menu');
    document.body.style.paddingRight = '';
    menuBtn.classList.remove('active-button');
}

export function bodyScrollDiv() {
    var scrollDiv = 0;
    var bodyPadding = document.body.style.paddingRight;
    if (bodyPadding != '') {
        scrollDiv = parseFloat(bodyPadding);
    } else {
        scrollDiv = window.innerWidth - document.documentElement.clientWidth;
    }
    return scrollDiv;
}

export function scrollDiv(el) {
    var scrollDiv = 0;
    var bodyPadding = document.body.style.paddingRight;

    if (bodyPadding != '' && bodyPadding != '0px') {
        scrollDiv = parseFloat(bodyPadding);
    } else {                
        scrollDiv = document.body.clientWidth - el.clientWidth;
    }
    return scrollDiv;
}

export function disableButton(button) {
    button.disabled = true;
    button.classList.add('is-loading');
}

export function enableButton(button) {
    setTimeout(() => {
        button.classList.remove('is-loading');
        button.classList.add('saved');

        setTimeout(() => {
            button.disabled = false;
            button.classList.remove('saved');
        }, 1000);
    }, 1000);
}

export async function delay(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

export function callout(type, message) {
    const callout = document.getElementById('callout');
    const calloutText = document.getElementById('callout-content');
    const active = 'active';
    const calloutID = parseInt(callout.getAttribute('data-id'));
    var i = 0;
    var intervalID;
    var animationTime;
    var newCalloutID;

    callout.setAttribute('data-time', 0);

    function setCallout() {
        newCalloutID = parseInt(callout.getAttribute('data-id'));

        if ( (newCalloutID-1) !== calloutID ) {
            i = 5000;
            animationTime = 5000;
            callout.classList.remove('active');
            clearInterval(intervalID);
        }

        animationTime = parseInt(callout.getAttribute('data-time'));

        if ( !callout.classList.contains(active) && i === 0 ) {
            callout.setAttribute('data-type', type);
            calloutText.textContent = message;
            callout.classList.add(active);
        }
        if ( animationTime !== i ) {
            i = 0;
            animationTime = 0;
            callout.setAttribute('data-time', i);               
        }
        if ( i >= 5000 ) {
            callout.classList.remove('active');
            clearInterval(intervalID);
        } else {
            i = i+500;
            callout.setAttribute('data-time', i);
        }                
    }

    callout.setAttribute('data-id', calloutID+1);
    intervalID = setInterval(setCallout, 500);
}

export function openPopUp(media) {
    this.$globalState.mediaInfos = media;

                // event.preventDefault();
    var body = document.body;
    var modal = document.getElementById('media-content-modal');
    var modalWrap = document.getElementById('modal-wrap');
    var modalOverlay = document.getElementById('modal-overlay');
    var bodyScrollWidth = this.bodyScrollDiv();

    // Add classes to show modal
    body.classList.add('active-modal');
    modal.classList.add('active');

    // Add scrollbar diff to body and modal
    body.style.paddingRight = `${bodyScrollWidth}px`;
    var scrollDiv = document.body.clientWidth - modalWrap.clientWidth;
    modalOverlay.style.width = `calc(100% + -${scrollDiv}px)`;
}

export function closePopUp(event, id) {
    event.preventDefault();
    var modal = document.getElementById(id);

    document.body.classList.remove('active-modal');
    document.body.style.paddingRight = '';
    modal.classList.remove('active');
    this.$globalState.mediaInfos = null;
}

export function SelectTabs(event) {
    event.preventDefault();
    var selectID = event.target.id;
    var selectValue = event.target.value;
    document.querySelectorAll(`.${selectID}.is-active`)[0].classList.remove('is-active');
    document.querySelectorAll(`.${selectID}[data-select-tab="${selectValue}`)[0].classList.add('is-active');
}