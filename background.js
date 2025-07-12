// noinspection JSUnresolvedReference

/**
 * background.js - Service worker for Xdebug Chrome Extension.
 * Handles messaging, icon updates, and state management.
 */

/**
 * Relay commands from popup to content script in the active tab.
 * @param {Object} message - Message to send to content script.
 * @param {function} callback - Callback to handle the response.
 */
function sendToActiveTab(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length === 0) return;
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}

/**
 * Update the extension icon and tooltip for a tab.
 * @param {number} status - 0=off, 1=session, 2=profile, 3=trace
 * @param {number} tabId - Tab ID to update
 */
function updateIcon(status, tabId) {
    let title = "Xdebug: Off";
    let icon = {
        0: "images/xce-icon-off.png",
        1: "images/xce-icon-session.png",
        2: "images/xce-icon-profile.png",
        3: "images/xce-icon-trace.png",
    }[status] || "images/xce-icon-off.png";
    if (status === 1) title = "Xdebug: Debugging Enabled";
    else if (status === 2) title = "Xdebug: Profiling Enabled";
    else if (status === 3) title = "Xdebug: Tracing Enabled";
    chrome.action.setTitle({tabId, title});
    chrome.action.setIcon({tabId, path: icon});
}

/**
 * Listen for popup messages and relay to content script.
 * @param {Object} request - Message from popup.
 * @param {Object} sender - Sender info.
 * @param {function} sendResponse - Callback to send response.
 * @returns {boolean} True if async response.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.cmd === "getStatus" || request.cmd === "toggleStatus" || request.cmd === "setStatus") {
        sendToActiveTab(request, (response) => {
            if (sender.tab && sender.tab.id !== undefined) {
                if (chrome.runtime.lastError) {
                    updateIcon(0, sender.tab.id);
                    sendResponse(undefined);
                    return;
                }
                if (response && typeof response.status === "number") {
                    updateIcon(response.status, sender.tab.id);
                } else {
                    updateIcon(0, sender.tab.id);
                }
            } else {
                // Fallback: update icon for active tab
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    if (tabs.length > 0) {
                        if (chrome.runtime.lastError) {
                            updateIcon(0, tabs[0].id);
                            sendResponse(undefined);
                            return;
                        }
                        if (response && typeof response.status === "number") {
                            updateIcon(response.status, tabs[0].id);
                        } else {
                            updateIcon(0, tabs[0].id);
                        }
                    }
                });
            }
            sendResponse(response);
        });
        return true;
    }
});

/**
 * Update icon when tab is activated.
 * @param {Object} activeInfo - Tab activation info.
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        chrome.tabs.sendMessage(tab.id, {cmd: "getStatus"}, (response) => {
            if (chrome.runtime.lastError) {
                updateIcon(0, tab.id);
                return;
            }
            if (response && typeof response.status === "number") {
                updateIcon(response.status, tab.id);
            } else {
                updateIcon(0, tab.id);
            }
        });
    });
});

/**
 * Update icon when tab is updated.
 * @param {number} tabId - Tab ID.
 * @param {Object} changeInfo - Tab change info.
 * @param {Object} tab - Tab object.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
        chrome.tabs.sendMessage(tabId, {cmd: "getStatus"}, (response) => {
            if (chrome.runtime.lastError) {
                updateIcon(0, tabId);
                return;
            }
            if (response && typeof response.status === "number") {
                updateIcon(response.status, tabId);
            } else {
                updateIcon(0, tabId);
            }
        });
    }
});
