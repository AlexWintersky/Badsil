// A simple way to keep track of which tabs we've muted.
const mutedTabs = new Set();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Ensure the message is coming from a Spotify tab
    if (!sender.tab || !sender.tab.url.includes("open.spotify.com")) {
        return;
    }

    const tabId = sender.tab.id;

    if (request.action === "muteTab") {
        if (!mutedTabs.has(tabId)) {
            chrome.tabs.update(tabId, { muted: true });
            mutedTabs.add(tabId);
            console.log(`Muted tab: ${tabId}`);
        }
    } else if (request.action === "unmuteTab") {
        if (mutedTabs.has(tabId)) {
            chrome.tabs.update(tabId, { muted: false });
            mutedTabs.delete(tabId);
            console.log(`Unmuted tab: ${tabId}`);
        }
    }
});

// Also, if a Spotify tab is closed, remove it from our set.
chrome.tabs.onRemoved.addListener((tabId) => {
    if (mutedTabs.has(tabId)) {
        mutedTabs.delete(tabId);
    }
});