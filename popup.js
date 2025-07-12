// noinspection JSUnresolvedReference

/**
 * popup.js - Handles popup UI and Xdebug mode toggling for the extension.
 */

/** Initialize popup UI and event handlers. */
document.addEventListener("DOMContentLoaded", () => {
    const statusText = document.getElementById("xdebug-status");
    const toggleBtn = document.getElementById("xdebug-toggle");
    const sessionBtn = document.getElementById("xdebug-session");
    const profileBtn = document.getElementById("xdebug-profile");
    const traceBtn = document.getElementById("xdebug-trace");
    const offBtn = document.getElementById("xdebug-off");

    /**
     * Highlight the active status button.
     * @param {number} status - Xdebug status (0=off, 1=session, 2=profile, 3=trace)
     */
    function highlightActive(status) {
        [sessionBtn, profileBtn, traceBtn, offBtn].forEach(btn => btn.classList.remove("active"));
        if (status === 1) sessionBtn.classList.add("active");
        else if (status === 2) profileBtn.classList.add("active");
        else if (status === 3) traceBtn.classList.add("active");
        else if (status === 0) offBtn.classList.add("active");
    }

    /**
     * Update the popup UI with the current Xdebug state.
     * @param {number|undefined} status - Xdebug status or undefined if unavailable.
     */
    function updateStatusUI(status) {
        if (!statusText) return;
        statusText.classList.remove("unavailable");
        if (status === 1) statusText.textContent = "Debugging (Session)";
        else if (status === 2) statusText.textContent = "Profiling";
        else if (status === 3) statusText.textContent = "Tracing";
        else if (status === 0) statusText.textContent = "Off";
        else {
            statusText.textContent = "Unavailable on this page";
            statusText.classList.add("unavailable");
            [sessionBtn, profileBtn, traceBtn, offBtn].forEach(btn => btn.classList.remove("active"));
            return;
        }
        highlightActive(status);
    }

    /**
     * Request the current Xdebug status from the background.
     */
    function getStatus() {
        chrome.runtime.sendMessage({cmd: "getStatus"}, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Xdebug Extension: Could not connect to content script:", chrome.runtime.lastError.message);
                updateStatusUI(undefined);
                return;
            }
            if (response && typeof response.status === "number") {
                updateStatusUI(response.status);
            } else {
                updateStatusUI(undefined);
            }
        });
    }

    /**
     * Set the Xdebug status via the background.
     * @param {number} status - Xdebug status to set (0=off, 1=session, 2=profile, 3=trace)
     */
    function setStatus(status) {
        chrome.runtime.sendMessage({cmd: "setStatus", status}, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Xdebug Extension: Could not connect to content script:", chrome.runtime.lastError.message);
                updateStatusUI(undefined);
                return;
            }
            if (response && typeof response.status === "number") {
                updateStatusUI(response.status);
            } else {
                updateStatusUI(undefined);
            }
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            chrome.runtime.sendMessage({cmd: "toggleStatus"}, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Xdebug Extension: Could not connect to content script:", chrome.runtime.lastError.message);
                    updateStatusUI(undefined);
                    return;
                }
                if (response && typeof response.status === "number") {
                    updateStatusUI(response.status);
                } else {
                    updateStatusUI(undefined);
                }
            });
        });
    }
    if (sessionBtn) sessionBtn.addEventListener("click", () => setStatus(1));
    if (profileBtn) profileBtn.addEventListener("click", () => setStatus(2));
    if (traceBtn) traceBtn.addEventListener("click", () => setStatus(3));
    if (offBtn) offBtn.addEventListener("click", () => setStatus(0));

    getStatus();
});
