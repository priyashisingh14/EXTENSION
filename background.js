// Set minimal defaults once on install
chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.local.get("applicationIsOn", (result) => {
        if (result.applicationIsOn === undefined) {
            chrome.storage.local.set({
                applicationIsOn: true
            });
        }
    });

    chrome.storage.local.get("amountOfPlaysToSkip", (result) => {
        if (result.amountOfPlaysToSkip === undefined) {
            chrome.storage.local.set({
                amountOfPlaysToSkip: 1
            });
        }
    });

    chrome.storage.local.get("scrollDirection", (result) => {
        if (result.scrollDirection === undefined) {
            chrome.storage.local.set({
                scrollDirection: "down"
            });
        }
    });

    chrome.storage.local.get("scrollOnComments", (result) => {
        if (result.scrollOnComments === undefined) {
            chrome.storage.local.set({
                scrollOnComments: false
            });
        }
    });

    chrome.storage.local.get("additionalScrollDelay", (result) => {
        if (result.additionalScrollDelay === undefined) {
            chrome.storage.local.set({
                additionalScrollDelay: 800
            });
        }
    });

});

// Auto reload extension after update (safe)
chrome.runtime.onUpdateAvailable.addListener(() => {
    chrome.runtime.reload();
});
