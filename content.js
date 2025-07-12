// Function to handle muting/unmuting the tab
const setMuteState = (shouldMute) => {
    if (chrome.runtime?.id) {
        const action = shouldMute ? "muteTab" : "unmuteTab";
        chrome.runtime.sendMessage({ action });
    }
};

// Our main function to check for all known ad indicators
const checkAdState = () => {
    try {
        // Method 1: The most reliable data attribute on the player bar
        const playerBarAd = document.querySelector('[data-testid="now-playing-bar"][data-testadtype="ad"]');
        
        // Method 2: The accessibility announcement for an advertisement
        const liveRegionAd = Array.from(document.querySelectorAll('span[id^="live-region"]'))
                                .some(span => span.textContent.trim().toLowerCase() === 'advertisement');

        if (playerBarAd || liveRegionAd) {
            console.log(`Spotify Ad Silencer: Ad detected! (Method: ${playerBarAd ? 'Player Bar' : 'Live Region'}). Muting.`);
            setMuteState(true);
        } else {
            setMuteState(false);
        }
    } catch (e) {
        if (e.message.includes("Extension context invalidated.")) {
            console.log("Spotify Ad Silencer: Context invalidated. Halting observer.");
            if (observer) observer.disconnect();
        }
    }
};

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
    // We don't need to inspect the mutations themselves,
    // we just need to know that *something* changed.
    // So we re-run our check whenever a change happens.
    checkAdState();
});

// Start observing the entire document for any changes to elements or their children.
// This is the ideal way to catch the "Advertisement" span appearing.
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Also run an initial check when the script first loads
checkAdState();

console.log("Spotify Ad Silencer (Ultimate) content script loaded and observing.");