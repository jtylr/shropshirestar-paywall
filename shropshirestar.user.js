// ==UserScript==
// @name         MNA paywalls
// @version      0.8
// @description  Remove stupid MNA paywalls
// @author       jtylr
// @homepageURL  https://github.com/jtylr/shropshirestar-paywall/
// @supportURL   https://github.com/jtylr/shropshirestar-paywall/issues
// @downloadURL  https://raw.githubusercontent.com/jtylr/shropshirestar-paywall/master/shropshirestar.user.js
// @updateURL    https://raw.githubusercontent.com/jtylr/shropshirestar-paywall/master/shropshirestar.user.js
// @match        https://www.shropshirestar.com/*
// @match        https://www.expressandstar.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shropshirestar.com
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Set subscriber cookie early
    document.cookie = 'sub_resource=standard; path=/; domain=shropshirestar.com; max-age=86400; SameSite=Lax';
    document.cookie = 'sub_resource=standard; path=/; max-age=86400; SameSite=Lax';

    // Protect article paragraphs from being removed by Piano
    const origRemove = Element.prototype.remove;
    Element.prototype.remove = function() {
        if (this.matches && this.matches('div[data-testid="article-content article-paragraph"], div.markup[data-testid*="article-paragraph"]')) {
            return;
        }
        return origRemove.call(this);
    };
    const origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
        if (child.matches && child.matches('div[data-testid="article-content article-paragraph"], div.markup[data-testid*="article-paragraph"]')) {
            return child;
        }
        return origRemoveChild.call(this, child);
    };

    const css = document.createElement('style');
    css.textContent = `
        /* --- Show all article content --- */
        div[data-testid="article-content article-paragraph"],
        div.markup[data-testid*="article-paragraph"] {
            display: block !important;
            visibility: visible !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            opacity: 1 !important;
            clip: auto !important;
            position: relative !important;
            transform: none !important;
            filter: none !important;
        }
        figure.article-image,
        div.image-wrapper,
        picture.responsive-img {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-height: none !important;
            overflow: visible !important;
        }
        /* --- Hide paywall elements --- */
        div.piano-article-paywall,
        div.piano-article-paywall-mid,
        div.piano-article-banner,
        div[class*="piano-"],
        div[class*="tp-modal"],
        div[class*="tp-backdrop"],
        iframe[id*="piano"],
        iframe[id*="tinypass"] {
            display: none !important;
        }
        /* --- Hide ads and sponsored content --- */
        div[id="topBanner"],
        div[id="nativeBanner"],
        div[id="adSlotWallpaper"],
        div[id="bottomBanner"],
        div[id="adSlotAsideBM"],
        div[id^="taboola-"],
        div[data-island-render-component="Taboola"],
        div.AdWrapper__AdDiv,
        div.AdWrapper__StickyDiv,
        div[data-testid="topBanner"],
        div[data-testid="nativeBanner"],
        div[data-testid="article-content desktop-ads-container"],
        div.sc-cxalrY.banner,
        div.sc-boKtkb,
        div.sc-jonzHS,
        div.piano-article-banner,
        /* --- Hide newsletter signups --- */
        div[id*="newsletter-signup"],
        div[data-testid="article-newsletter-su"],
        div.newsletter-signup-form,
        /* --- Hide comments --- */
        div.viafoura,
        div.ViafouraConversationStarter,
        div.ViafouraComments__OuterWrapper,
        div.ViafouraCommentButton__Wrapper,
        vf-conversation-starter,
        vf-conversations,
        vf-conversations-count,
        vf-tray-trigger,
        /* --- Hide breaking news ticker --- */
        div.bnews-bar,
        /* --- Hide EXCO video player (sponsored video content) --- */
        div.exco-player,
        div.exco-video-player,
        div[class*="exco-"],
        iframe[src*="ex.co"],
        iframe[src*="player.ex.co"],
        script[src*="exbd.ex.co"],
        /* --- Full-width content when sidebar is removed --- */
        .ss-full-width div[id="content-wrapper"],
        .ss-full-width div[data-testid="article-content-wrapper"] {
            max-width: 100% !important;
            width: 100% !important;
            flex: 1 1 100% !important;
            grid-column: 1 / -1 !important;
        }
        .ss-full-width article[data-testid="article-page"] {
            grid-template-columns: 1fr !important;
        }
        /* --- Hide "Continue Reading" section --- */
        a[href*="subscriptions"],
        a[href*="/subscribe"],
        div[class*="continue-reading"] {
            display: none !important;
        }
    `;
    document.documentElement.appendChild(css);

    function boostImageQuality() {
        const up = (url) => url
            .replace(/(\bwidth=)\d+/g, '$1' + '1200')
            .replace(/(\bquality=)\d+/g, '$1' + '85');
        document.querySelectorAll('img[src*="jpim-static"], source[srcset*="jpim-static"]').forEach(el => {
            if (el.src) el.src = up(el.src);
            if (el.srcset) el.srcset = el.srcset.split(',').map(s => up(s.trim())).join(', ');
        });
    }

    function removeSelectors(selectors) {
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el && el.parentNode) el.remove();
            });
        });
    }

    function cleanPage() {
        removeSelectors([
            'div.piano-article-paywall',
            'div.piano-article-paywall-mid',
            'div.piano-article-banner',
            'div[class*="tp-modal"]',
            'div[class*="tp-backdrop"]',
            'div[id="topBanner"]',
            'div[id="nativeBanner"]',
            'div[id="adSlotWallpaper"]',
            'div[id="bottomBanner"]',
            'div[id="adSlotAsideBM"]',
            'div[data-island-render-component="Taboola"]',
            'div[id^="taboola-"]',
            'div[data-testid="article-content desktop-ads-container"]',
            'div.sc-cxalrY.banner',
            'div.sc-boKtkb',
            'div.sc-jonzHS',
            'div.viafoura',
            'div.ViafouraConversationStarter',
            'div.ViafouraComments__OuterWrapper',
            'div.ViafouraCommentButton__Wrapper',
            'div.bnews-bar',
            'div.exco-player',
            'div.exco-video-player',
            'div[class*="exco-"]',
            'iframe[src*="ex.co"]',
            'div[id*="newsletter-signup"]',
            'div[data-testid="article-newsletter-su"]',
            'div.newsletter-signup-form',
        ]);
    }

    async function fillMissingContent() {
        try {
            const res = await fetch(location.href);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const freshParas = doc.querySelectorAll('div[data-testid="article-content article-paragraph"]');
            const existingParas = document.querySelectorAll('div[data-testid="article-content article-paragraph"]');

            if (freshParas.length > existingParas.length) {
                const container = document.querySelector('div#content-wrapper') ||
                                  document.querySelector('div[data-testid="article-content-wrapper"]');
                if (!container) return;

                const fragment = document.createDocumentFragment();
                for (let i = existingParas.length; i < freshParas.length; i++) {
                    fragment.appendChild(freshParas[i].cloneNode(true));
                }
                container.appendChild(fragment);
            }
        } catch (e) {
            // silent
        }
    }

    function expandContentWidth() {
        const sidebar = document.querySelector('div.sc-jonzHS, aside');
        if (!sidebar || !document.body.contains(sidebar)) {
            document.querySelectorAll('article[data-testid="article-page"], div[data-testid="article-column"]').forEach(el => {
                el.classList.add('ss-full-width');
            });
        }
    }

    function removeEmptyStickyGroup() {
        const group = document.getElementById('first-sticky-group');
        if (!group) return;
        const hasText = Array.from(group.children).some(child =>
            child.textContent && child.textContent.trim().length > 0
        );
        if (!hasText) {
            const aside = group.closest('aside');
            if (aside) aside.remove();
            else group.remove();
        }
    }

    function hideEmptyHero() {
        document.querySelectorAll('figure.article-image').forEach(fig => {
            const imgs = fig.querySelectorAll('img');
            const allPlaceholder = Array.from(imgs).every(img =>
                img.classList.contains('placeholder') || img.src.includes('placeholder')
            );
            const figcaption = fig.querySelector('figcaption');
            const hasCaption = figcaption && figcaption.textContent.trim().length > 0;
            if (allPlaceholder && !hasCaption) {
                fig.style.display = 'none';
            }
        });
    }

    function runCleanup() {
        cleanPage();
        hideEmptyHero();
        removeEmptyStickyGroup();
        expandContentWidth();
        boostImageQuality();
    }

    runCleanup();

    const observer = new MutationObserver(() => runCleanup());
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const imgUp = (url) => url
        .replace(/(\bwidth=)\d+/g, '$1' + '1200')
        .replace(/(\bquality=)\d+/g, '$1' + '85');
    const imgObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.matches?.('img[src*="jpim-static"], source[srcset*="jpim-static"]')) {
                        if (node.src) node.src = imgUp(node.src);
                        if (node.srcset) node.srcset = node.srcset.split(',').map(s => imgUp(s.trim())).join(', ');
                    }
                    node.querySelectorAll?.('img[src*="jpim-static"], source[srcset*="jpim-static"]').forEach(el => {
                        if (el.src) el.src = imgUp(el.src);
                        if (el.srcset) el.srcset = el.srcset.split(',').map(s => imgUp(s.trim())).join(', ');
                    });
                }
            });
        });
    });
    imgObserver.observe(document.documentElement, { childList: true, subtree: true });

    if (document.readyState === 'complete') {
        fillMissingContent();
    } else {
        window.addEventListener('load', () => {
            fillMissingContent();
            runCleanup();
        });
    }
})();
