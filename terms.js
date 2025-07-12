/**
 * terms.js - Handles terms page footer logic for Xdebug Chrome Extension.
 */

/** Set dynamic year in terms page footer. */
document.addEventListener("DOMContentLoaded", () => {
    var year = new Date().getFullYear();
    var copyright = document.getElementById("footer-copyright");
    if (copyright) {
        copyright.textContent = `© ${year} John A. Marsh, ThreeLeaf.com`;
    }
});
