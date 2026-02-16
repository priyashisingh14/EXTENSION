// ------------------------------
// CONSTANT SELECTORS VARIABLES
// ------------------------------
const VIDEOS_LIST_SELECTORS = [
    ".reel-video-in-sequence",
    ".reel-video-in-sequence-new",
];

const CURRENT_SHORT_SELECTOR = "ytd-reel-video-renderer";
const COMMENTS_SELECTOR = "#content > ytd-section-list-renderer";
const NEXT_BUTTON_SELECTOR = "#navigation-button-down > ytd-button-renderer > yt-button-shape > button";
const PREVIOUS_BUTTON_SELECTOR = "#navigation-button-up > ytd-button-renderer > yt-button-shape > button";

// ------------------------------
// APP VARIABLES
// ------------------------------
let scrollOnCommentsCheck = false;
let scrollDirection = 1;
let amountOfPlays = 0;
let amountOfPlaysToSkip = 1;
let additionalScrollDelay = 800;

// ------------------------------
// STATE VARIABLES
// ------------------------------
let currentShortId = null;
let currentVideoElement = null;
let applicationIsOn = true;
let scrollTimeout;

const MAX_RETRIES = 15;
const RETRY_DELAY_MS = 500;

// ------------------------------
// MAIN FUNCTIONS
// ------------------------------

function startAutoScrolling() {
    applicationIsOn = true;
    amountOfPlays = 0;
    currentShortId = null;
    currentVideoElement = null;
    checkForNewShort();
}

function stopAutoScrolling() {
    applicationIsOn = false;
    amountOfPlays = 0;
    if (currentVideoElement) {
        currentVideoElement.setAttribute("loop", "true");
        currentVideoElement.removeEventListener("ended", shortEnded);
    }
}

async function checkForNewShort() {
    if (!applicationIsOn || !isShortsPage()) return;

    const currentShort = findShortContainer();
    if (!currentShort) return;

    if (currentShort?.id != currentShortId) {

        if (scrollTimeout) clearTimeout(scrollTimeout);

        if (currentVideoElement) {
            currentVideoElement.removeEventListener("ended", shortEnded);
        }

        currentShortId = parseInt(currentShort.id);
        currentVideoElement = currentShort.querySelector("video");

        let retries = 0;
        while (currentVideoElement == null) {
            currentVideoElement = currentShort.querySelector("video");
            if (retries > MAX_RETRIES) {
                let prevShortId = currentShortId;
                currentShortId = null;
                return scrollToNextShort(prevShortId);
            }
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
            retries++;
        }

        // Skip ads
        if (currentShort.querySelector("ytd-ad-slot-renderer") ||
            currentShort.querySelector("ad-button-view-model")) {
            return scrollToNextShort(currentShortId, false);
        }

        currentVideoElement.addEventListener("ended", shortEnded);
    }

    if (currentVideoElement?.hasAttribute("loop") && applicationIsOn) {
        currentVideoElement.removeAttribute("loop");
    }
}

function shortEnded(e) {
    e.preventDefault();

    if (!applicationIsOn) return stopAutoScrolling();

    amountOfPlays++;

    if (amountOfPlays >= amountOfPlaysToSkip) {
        amountOfPlays = 0;
        scrollToNextShort(currentShortId);
    } else {
        currentVideoElement.play();
    }
}

async function scrollToNextShort(prevShortId = null, useDelayAndCheckComments = true) {

    if (!applicationIsOn) return stopAutoScrolling();

    const comments = document.querySelector(COMMENTS_SELECTOR);

    const isCommentsOpen = () => {
        const attr = comments?.attributes["VISIBILITY"]?.value;
        return attr === "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED";
    };

    if (comments && useDelayAndCheckComments) {
        if (isCommentsOpen() && !scrollOnCommentsCheck) {
            while (isCommentsOpen() && prevShortId == currentShortId) {
                await new Promise(r => setTimeout(r, 100));
            }
        }
    }

    if (scrollTimeout) clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(async () => {

        if (prevShortId != null && currentShortId != prevShortId) return;

        const nextShortContainer = await waitForNextShort();

        if (nextShortContainer == null && isShortsPage())
            return window.location.reload();

        if (currentVideoElement)
            currentVideoElement.removeEventListener("ended", shortEnded);

        nextShortContainer.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        });

        checkForNewShort();

    }, useDelayAndCheckComments ? additionalScrollDelay : 0);
}

function findShortContainer(id = null) {

    let shorts = [];

    for (let i = 0; i < VIDEOS_LIST_SELECTORS.length; i++) {
        const list = [...document.querySelectorAll(VIDEOS_LIST_SELECTORS[i])];
        if (list.length > 0) {
            shorts = list;
            break;
        }
    }

    if (id != null) {
        const short = shorts.find(s => s.id == id.toString());
        if (short) return short;
    }

    return shorts.find(short =>
        short.hasAttribute("is-active") ||
        short.querySelector(CURRENT_SHORT_SELECTOR) ||
        short.querySelector("[is-active]")
    ) || shorts[0];
}

async function waitForNextShort(retries = 5, delay = 500) {

    if (!isShortsPage()) return null;

    for (let i = 0; i < retries; i++) {

        const nextShort = findShortContainer(currentShortId + scrollDirection);
        if (nextShort) return nextShort;

        window.scrollBy(0, 100);
        await new Promise(r => setTimeout(r, delay));
        window.scrollBy(0, -100);
        await new Promise(r => setTimeout(r, delay));
    }

    return null;
}

// ------------------------------
// INIT
// ------------------------------
(function initiate() {
    startAutoScrolling();
    setInterval(checkForNewShort, RETRY_DELAY_MS);
})();

function isShortsPage() {
    return document.querySelector(VIDEOS_LIST_SELECTORS.join(",")) != null;
}
