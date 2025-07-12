// noinspection JSUnresolvedReference

/**
 * options.js - Handles options page logic for Xdebug Chrome Extension.
 */

/** Initialize options page and handle form events. */
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("options-form");
    const ideKeyInput = document.getElementById("ideKey");
    const profileInput = document.getElementById("profileTrigger");
    const traceInput = document.getElementById("traceTrigger");
    const status = document.getElementById("save-status");

    /* Load saved options */
    chrome.storage.sync.get(["xdebugIdeKey", "xdebugProfileTrigger", "xdebugTraceTrigger"], (items) => {
        if (items.xdebugIdeKey) ideKeyInput.value = items.xdebugIdeKey;
        if (items.xdebugProfileTrigger) profileInput.value = items.xdebugProfileTrigger;
        if (items.xdebugTraceTrigger) traceInput.value = items.xdebugTraceTrigger;
    });

    /* Save options */
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const ideKey = ideKeyInput.value.trim() || "XDEBUG_ECLIPSE";
        const profileTrigger = profileInput.value.trim();
        const traceTrigger = traceInput.value.trim();
        chrome.storage.sync.set({
            xdebugIdeKey: ideKey,
            xdebugProfileTrigger: profileTrigger,
            xdebugTraceTrigger: traceTrigger,
        }, () => {
            status.style.display = "block";
            setTimeout(() => {
                status.style.display = "none";
            }, 1500);
        });
    });

    /* Set dynamic year in footer */
    var year = new Date().getFullYear();
    var copyright = document.getElementById("footer-copyright");
    if (copyright) {
        copyright.textContent = `© ${year} John A. Marsh, ThreeLeaf.com`;
    }
});
