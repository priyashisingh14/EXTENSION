const statusToggle = document.querySelector("#status-toggle");
const scrollDirectionInput = document.querySelector("#scrollDirectionInput");
const amountOfPlaysInput = document.querySelector("#amountOfPlaysInput");
const additionalScrollDelayInput = document.querySelector("#additionalScrollDelayInput");
const scrollOnCommentsInput = document.querySelector("#scrollOnCommentsInput");

// Load settings
chrome.storage.local.get(
    [
        "applicationIsOn",
        "scrollDirection",
        "amountOfPlaysToSkip",
        "additionalScrollDelay",
        "scrollOnComments"
    ],
    (result) => {
        statusToggle.checked = result.applicationIsOn ?? true;
        scrollDirectionInput.value = result.scrollDirection ?? "down";
        amountOfPlaysInput.value = result.amountOfPlaysToSkip ?? 1;
        additionalScrollDelayInput.value = result.additionalScrollDelay ?? 800;
        scrollOnCommentsInput.checked = result.scrollOnComments ?? false;
    }
);

// Toggle ON/OFF
statusToggle.addEventListener("change", (e) => {
    chrome.storage.local.set({
        applicationIsOn: e.target.checked
    });
});

// Scroll direction
scrollDirectionInput.addEventListener("change", (e) => {
    chrome.storage.local.set({
        scrollDirection: e.target.value
    });
});

// Amount of plays
amountOfPlaysInput.addEventListener("change", (e) => {
    const value = parseInt(e.target.value, 10);
    chrome.storage.local.set({
        amountOfPlaysToSkip: isNaN(value) || value < 1 ? 1 : value
    });
});

// Additional delay
additionalScrollDelayInput.addEventListener("change", (e) => {
    const value = parseInt(e.target.value, 10);
    chrome.storage.local.set({
        additionalScrollDelay: isNaN(value) ? 0 : value
    });
});

// Scroll on comments
scrollOnCommentsInput.addEventListener("change", (e) => {
    chrome.storage.local.set({
        scrollOnComments: e.target.checked
    });
});
