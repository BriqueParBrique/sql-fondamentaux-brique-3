/* Managed by BriqueParBrique/nouvelle-brique — do not edit in brick repos */
(function () {
  var baseurl = document.body.getAttribute("data-baseurl") || "";
  var key = "brique-progress-" + baseurl;

  /* ===== LocalStorage helpers ===== */

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(key));
      if (!raw) return { visited: [], completed: [], lastStep: null };
      if (!raw.completed) raw.completed = [];
      return raw;
    } catch (e) {
      return { visited: [], completed: [], lastStep: null };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  /* ===== Table of Contents (#1) ===== */

  function buildTOC() {
    var tocNav = document.getElementById("step-toc");
    var tocList = document.getElementById("step-toc-list");
    var content = document.querySelector(".step-content");
    if (!tocNav || !tocList || !content) return;

    var headings = content.querySelectorAll("h2, h3");
    if (headings.length === 0) {
      tocNav.style.display = "none";
      return;
    }

    headings.forEach(function (h) {
      if (!h.id) return;
      var li = document.createElement("li");
      if (h.tagName === "H3") li.classList.add("toc-indent");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
    });

    var toggle = tocNav.querySelector(".step-toc-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", !expanded);
        tocList.hidden = expanded;
      });
    }
  }

  /* ===== Copy to Clipboard (#7) ===== */

  function initClipboard() {
    var blocks = document.querySelectorAll(".step-content pre");
    blocks.forEach(function (pre) {
      // Find the outermost wrapper (Rouge generates div.highlight > pre)
      var target = pre.closest(".highlighter-rouge") || pre;
      var wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      target.parentNode.insertBefore(wrapper, target);
      wrapper.appendChild(target);

      var btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", "Copier le code");
      btn.textContent = "Copier";
      wrapper.appendChild(btn);

      btn.addEventListener("click", function () {
        var code = pre.querySelector("code");
        var text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copié !";
          btn.setAttribute("aria-label", "Code copié");
          btn.classList.add("copied");
          setTimeout(function () {
            btn.textContent = "Copier";
            btn.setAttribute("aria-label", "Copier le code");
            btn.classList.remove("copied");
          }, 2000);
        });
      });
    });
  }

  /* ===== Keyboard Navigation (#8) ===== */

  function initKeyboard() {
    var prevLink = document.querySelector(".step-nav-prev[href]");
    var nextLink = document.querySelector(".step-nav-next[href]");
    if (!prevLink && !nextLink) return;

    document.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowLeft" && prevLink) {
        window.location.href = prevLink.href;
      } else if (e.key === "ArrowRight" && nextLink) {
        window.location.href = nextLink.href;
      }
    });
  }

  /* ===== Back to Top (#13) ===== */

  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;

    function toggle() {
      var show = window.scrollY > 400;
      btn.classList.toggle("visible", show);
      btn.setAttribute("aria-hidden", !show);
    }

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ===== Search (#5) ===== */

  function initSearch() {
    var modal = document.getElementById("search-modal");
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var toggleBtn = document.querySelector(".search-toggle");
    if (!modal || !input || !results) return;

    var searchIndex = null;
    var previousFocus = null;

    function openSearch() {
      previousFocus = document.activeElement;
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      input.value = "";
      results.innerHTML = "";
      input.focus();
      if (!searchIndex) loadIndex();
    }

    function closeSearch() {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      if (previousFocus) previousFocus.focus();
    }

    // Focus trap within modal
    modal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = modal.querySelectorAll("input, a[href], button");
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    function loadIndex() {
      fetch(baseurl + "/search.json")
        .then(function (r) { return r.json(); })
        .then(function (data) { searchIndex = data; });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", openSearch);
    }

    modal.querySelector(".search-modal-backdrop").addEventListener("click", closeSearch);

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        modal.classList.contains("active") ? closeSearch() : openSearch();
      }
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeSearch();
      }
    });

    input.addEventListener("input", function () {
      if (!searchIndex) return;
      var query = input.value.toLowerCase().trim();
      results.innerHTML = "";
      if (query.length < 2) return;

      var matches = searchIndex.filter(function (item) {
        return item.title.toLowerCase().indexOf(query) !== -1 ||
               item.content.toLowerCase().indexOf(query) !== -1;
      });

      if (matches.length === 0) {
        results.innerHTML = '<div class="search-no-results">Aucun résultat</div>';
        return;
      }

      matches.forEach(function (item) {
        var a = document.createElement("a");
        a.href = item.url;
        a.className = "search-result-item";

        var title = document.createElement("strong");
        title.textContent = item.title;
        a.appendChild(title);

        var idx = item.content.toLowerCase().indexOf(query);
        if (idx !== -1) {
          var snippet = document.createElement("span");
          var start = Math.max(0, idx - 40);
          var end = Math.min(item.content.length, idx + query.length + 60);
          snippet.textContent = (start > 0 ? "…" : "") +
            item.content.substring(start, end) +
            (end < item.content.length ? "…" : "");
          snippet.className = "search-result-snippet";
          a.appendChild(snippet);
        }

        results.appendChild(a);
      });
    });
  }

  /* ===== Step Completion Checkbox (#2) ===== */

  function initCompletionCheckbox() {
    var checkbox = document.getElementById("step-complete-checkbox");
    var article = document.querySelector("article.step-container[data-step]");
    if (!checkbox || !article) return;

    var step = article.getAttribute("data-step");
    var data = load();

    checkbox.checked = data.completed.indexOf(step) !== -1;

    checkbox.addEventListener("change", function () {
      var data = load();
      var idx = data.completed.indexOf(step);
      if (checkbox.checked && idx === -1) {
        data.completed.push(step);
        dispatchAnalytics("step_completed", { step: step });
      } else if (!checkbox.checked && idx !== -1) {
        data.completed.splice(idx, 1);
      }
      save(data);
    });
  }

  /* ===== Prerequisites Notice (#10) ===== */

  function initPrerequisites() {
    var notice = document.querySelector(".step-prerequisite[data-requires]");
    if (!notice) return;

    var required = notice.getAttribute("data-requires");
    var data = load();

    if (data.completed.indexOf(required) !== -1) {
      notice.remove();
    } else {
      notice.classList.add("unmet");
    }
  }

  /* ===== Analytics Hooks (#14) ===== */

  function dispatchAnalytics(eventName, detail) {
    if (typeof window.goatcounter !== "undefined" && window.goatcounter.count) {
      window.goatcounter.count({ path: eventName, title: detail.step || eventName, event: true });
    }
    window.dispatchEvent(new CustomEvent("brique:" + eventName, { detail: detail }));
  }

  /* ===== Step page logic ===== */

  var article = document.querySelector("article.step-container[data-step]");
  if (article) {
    var step = article.getAttribute("data-step");
    var data = load();
    if (data.visited.indexOf(step) === -1) {
      data.visited.push(step);
    }
    data.lastStep = step;
    save(data);

    dispatchAnalytics("step_viewed", { step: step });

    buildTOC();
    initClipboard();
    initKeyboard();
    initCompletionCheckbox();
    initPrerequisites();
    initBackToTop();
    initSearch();
    return;
  }

  /* ===== Homepage logic ===== */

  var cards = document.querySelectorAll(".step-card[data-step-file]");
  if (cards.length === 0) {
    initSearch();
    initBackToTop();
    return;
  }

  var stateFresh = document.getElementById("state-fresh");
  var stateProgress = document.getElementById("state-progress");
  var stateDone = document.getElementById("state-done");
  var resume = document.getElementById("hero-resume");
  var completionCount = document.getElementById("completion-count");

  function setHeroState(state) {
    var states = { fresh: stateFresh, progress: stateProgress, done: stateDone };
    for (var name in states) {
      if (states[name]) {
        var isActive = name === state;
        states[name].classList.toggle("active", isActive);
        states[name].setAttribute("aria-hidden", !isActive);
      }
    }
  }

  function renderHomepage() {
    var data = load();
    var total = cards.length;
    var done = data.completed.length;
    var allDone = total > 0 && done >= total;

    // Cards
    cards.forEach(function (card) {
      var file = card.getAttribute("data-step-file");
      var title = card.querySelector(".step-card-title");
      var label = title ? title.textContent : file;
      card.classList.remove("visited", "current", "completed");

      if (data.completed.indexOf(file) !== -1) {
        card.classList.add("completed");
        card.setAttribute("aria-label", label + " — terminée");
      } else if (data.visited.indexOf(file) !== -1) {
        if (file === data.lastStep) {
          card.classList.add("current");
          card.setAttribute("aria-label", label + " — en cours");
        } else {
          card.classList.add("visited");
          card.setAttribute("aria-label", label + " — visitée");
        }
      } else if (file === data.lastStep) {
        card.classList.add("current");
        card.setAttribute("aria-label", label + " — en cours");
      } else {
        card.removeAttribute("aria-label");
      }
    });

    // Hero state
    if (allDone) {
      setHeroState("done");
    } else if (data.visited.length > 0) {
      setHeroState("progress");
      if (completionCount) completionCount.textContent = done + "/" + total;
      if (resume && data.lastStep) resume.href = baseurl + "/" + data.lastStep + "/";
    } else {
      setHeroState("fresh");
    }
  }

  renderHomepage();

  // Reset progress
  var resetBtn = document.getElementById("reset-progress");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (confirm("Réinitialiser toute la progression ?")) {
        try { localStorage.removeItem(key); } catch (e) {}
        renderHomepage();
      }
    });
  }

  // Restart (parcours terminé)
  var restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      try { localStorage.removeItem(key); } catch (e) {}
    });
  }

  // Re-render when page is restored from bfcache
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) renderHomepage();
  });

  initSearch();
  initBackToTop();
})();
