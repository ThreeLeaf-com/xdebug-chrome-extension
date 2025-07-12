/**
 * privacy-policy.js - Handles privacy policy footer logic for Xdebug Chrome Extension.
 */

/** Set dynamic year in privacy policy footer. */
document.addEventListener("DOMContentLoaded", () => {
    var year = new Date().getFullYear();
    var copyright = document.getElementById("footer-copyright");
    if (copyright) {
        copyright.textContent = `© ${year} John A. Marsh, ThreeLeaf.com`;
    }
});
