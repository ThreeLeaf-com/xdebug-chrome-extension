// noinspection JSUnresolvedReference

/**
 * content.js - Content script for Xdebug Chrome Extension.
 * Manages Xdebug cookies and state on web pages.
 */

/**
 * Set a cookie on the current page.
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {number} days - Days until expiration.
 */
function setCookie(name, value, days) {
    const exp = new Date();
    exp.setTime(exp.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${exp.toUTCString()}; path=/`;
}

/**
 * Get a cookie value by name.
 * @param {string} name - Cookie name.
 * @returns {string|null} Cookie value or null if not found.
 */
function getCookie(name) {
    const prefix = name + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(prefix) === 0) {
            return decodeURIComponent(cookie.substring(prefix.length));
        }
    }
    return null;
}

/**
 * Delete a cookie by name.
 * @param {string} name - Cookie name.
 */
function deleteCookie(name) {
    setCookie(name, "", -1);
}

/**
 * Get the current Xdebug state.
 * @param {string} ideKey - IDE key for debugging.
 * @param {string} traceTrigger - Trigger value for tracing.
 * @param {string} profileTrigger - Trigger value for profiling.
 * @returns {number} 0=off, 1=session, 2=profile, 3=trace
 */
function getXdebugStatus(ideKey, traceTrigger, profileTrigger) {
    if (getCookie("XDEBUG_SESSION") === ideKey) return 1;
    if (getCookie("XDEBUG_PROFILE") === profileTrigger) return 2;
    if (getCookie("XDEBUG_TRACE") === traceTrigger) return 3;
    return 0;
}

/**
 * Set the Xdebug state.
 * @param {number} status - 0=off, 1=session, 2=profile, 3=trace
 * @param {string} ideKey - IDE key.
 * @param {string} traceTrigger - Trace trigger value.
 * @param {string} profileTrigger - Profile trigger value.
 * @returns {number} The new status.
 */
function setXdebugStatus(status, ideKey, traceTrigger, profileTrigger) {
    if (status === 1) {
        setCookie("XDEBUG_SESSION", ideKey, 365);
        deleteCookie("XDEBUG_PROFILE");
        deleteCookie("XDEBUG_TRACE");
    } else if (status === 2) {
        deleteCookie("XDEBUG_SESSION");
        setCookie("XDEBUG_PROFILE", profileTrigger, 365);
        deleteCookie("XDEBUG_TRACE");
    } else if (status === 3) {
        deleteCookie("XDEBUG_SESSION");
        deleteCookie("XDEBUG_PROFILE");
        setCookie("XDEBUG_TRACE", traceTrigger, 365);
    } else {
        deleteCookie("XDEBUG_SESSION");
        deleteCookie("XDEBUG_PROFILE");
        deleteCookie("XDEBUG_TRACE");
    }
    return getXdebugStatus(ideKey, traceTrigger, profileTrigger);
}

/**
 * Toggle to the next Xdebug state.
 * @param {string} ideKey - IDE key.
 * @param {string} traceTrigger - Trace trigger value.
 * @param {string} profileTrigger - Profile trigger value.
 * @returns {number} The new status.
 */
function toggleXdebugStatus(ideKey, traceTrigger, profileTrigger) {
    const nextStatus = (getXdebugStatus(ideKey, traceTrigger, profileTrigger) + 1) % 4;
    return setXdebugStatus(nextStatus, ideKey, traceTrigger, profileTrigger);
}

/**
 * Listen for messages from background or popup scripts and respond with Xdebug state.
 * @param {Object} request - Message from background or popup.
 * @param {Object} sender - Sender info.
 * @param {function} sendResponse - Callback to send response.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let ideKey = request.ideKey || "XDEBUG_ECLIPSE";
    let traceTrigger = request.traceTrigger || ideKey;
    let profileTrigger = request.profileTrigger || ideKey;
    let newStatus;
    if (request.cmd === "getStatus") newStatus = getXdebugStatus(ideKey, traceTrigger, profileTrigger);
    else if (request.cmd === "toggleStatus") newStatus = toggleXdebugStatus(ideKey, traceTrigger, profileTrigger);
    else if (request.cmd === "setStatus") newStatus = setXdebugStatus(request.status, ideKey, traceTrigger, profileTrigger);
    sendResponse({status: newStatus});
});
