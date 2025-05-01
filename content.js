(function () {
  const SHORTS_URL_PATTERN = "youtube.com/shorts";
  const NAVIGATION_CONTAINER_SELECTOR = ".navigation-container";
  const SHORTS_PLAYER_SELECTOR = "ytd-shorts";
  const SHORTS_CONTAINER_ID = "shorts-container"; // Adjust if this ID changes

  let currentUrl = window.location.href;
  let observer = null;
  let intervalId = null;
  let styleElement = null;

  /**
   * Injects CSS to hide overflow and navigation buttons.
   */
  function injectStyles() {
    if (styleElement && document.head.contains(styleElement)) return;
    styleElement = document.createElement("style");
    styleElement.textContent = `
      #${SHORTS_CONTAINER_ID} { overflow: hidden !important; }
      ${SHORTS_PLAYER_SELECTOR} { overflow: hidden !important; }
      ${NAVIGATION_CONTAINER_SELECTOR} { display: none !important; }
    `;
    document.head.appendChild(styleElement);
    // console.log("Braked-Shorts: Styles injected.");
  }

  /**
   * Removes the injected CSS styles.
   */
  function removeStyles() {
    if (styleElement && document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
      styleElement = null;
      // console.log("Braked-Shorts: Styles removed.");
    }
  }

  /**
   * Removes navigation container elements.
   */
  function removeNavigationContainers() {
    const navContainers = document.querySelectorAll(NAVIGATION_CONTAINER_SELECTOR);
    navContainers.forEach((container) => container.remove());
  }

  /**
   * Prevents scrolling via ArrowUp/ArrowDown keys on Shorts.
   */
  function handleKeyDown(event) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      // console.log("Braked-Shorts: Arrow key blocked.");
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Sets up the MutationObserver to watch for navigation containers.
   */
  function setupObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          let found = false;
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE &&
                (node.matches(NAVIGATION_CONTAINER_SELECTOR) || node.querySelector(NAVIGATION_CONTAINER_SELECTOR))) {
              found = true;
            }
          });
          if (found) {
            removeNavigationContainers();
          }
        }
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    // console.log("Braked-Shorts: MutationObserver started.");
  }

  /**
   * Disconnects the MutationObserver.
   */
  function disconnectObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
      // console.log("Braked-Shorts: MutationObserver stopped.");
    }
  }

  /**
   * Starts the interval timer to periodically remove navigation containers.
   */
  function startInterval() {
    if (intervalId) return;
    removeNavigationContainers(); // Initial removal
    intervalId = setInterval(removeNavigationContainers, 300);
    // console.log("Braked-Shorts: Removal interval started.");
  }

  /**
   * Stops the interval timer.
   */
  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      // console.log("Braked-Shorts: Removal interval stopped.");
    }
  }

  /**
   * Activates all features for the Shorts page.
   */
  function activateShortsFeatures() {
    // console.log("Braked-Shorts: Activating features for Shorts page.");
    injectStyles();
    document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    setupObserver();
    startInterval(); // Use interval as a backup/aggressive removal
  }

  /**
   * Deactivates all features when leaving the Shorts page.
   */
  function deactivateShortsFeatures() {
    // console.log("Braked-Shorts: Deactivating features.");
    document.removeEventListener("keydown", handleKeyDown, true);
    disconnectObserver();
    stopInterval();
    removeStyles();
  }

  /**
   * Checks the current URL and activates/deactivates features accordingly.
   */
  function checkUrlAndApplyFeatures() {
    const newUrl = window.location.href;
    if (newUrl === currentUrl) return; // No change

    currentUrl = newUrl;
    const isOnShortsPage = newUrl.includes(SHORTS_URL_PATTERN);

    if (isOnShortsPage) {
      activateShortsFeatures();
    } else {
      deactivateShortsFeatures();
    }
  }

  // --- Initialization ---

  // Initial check
  if (window.location.href.includes(SHORTS_URL_PATTERN)) {
    activateShortsFeatures();
  }

  // Monitor URL changes via interval
  setInterval(checkUrlAndApplyFeatures, 500);

  // Monitor SPA navigation
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    setTimeout(checkUrlAndApplyFeatures, 100); // Delay to allow DOM updates
  };
  window.addEventListener("popstate", checkUrlAndApplyFeatures);

  console.log("Braked-Shorts: Content script loaded.");

})();
