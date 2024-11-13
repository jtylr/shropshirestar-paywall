// ==UserScript==
// @name         MNA paywalls
// @version      0.4
// @description  Remove stupid MNA paywalls
// @author       jtylr

// @homepageURL   https://github.com/jtylr/shropshirestar-paywall/
// @supportURL    https://github.com/jtylr/shropshirestar-paywall/issues
// @downloadURL   https://raw.githubusercontent.com/jtylr/shropshirestar-paywall/master/shropshirestar.user.js
// @updateURL     https://raw.githubusercontent.com/jtylr/shropshirestar-paywall/master/shropshirestar.user.js


// @match        https://www.shropshirestar.com/*
// @match        https://www.expressandstar.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shropshirestar.com
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Excuse the use of jQuery.
    let $ = window.jQuery

    $(document).ready(() => {
        // Load in article content
        var content = Fusion.globalContent.content;

        let proseArea = $($('.prose')[1])

        let articleImage = proseArea.find('.w-full')

        if ($($('.relative time')[0]).closest('.flex.flex-wrap.items-stretch.gap-2').find('.bg-plus-500').length || true) {
            $('.bg-plus-200').addClass('prose')
            $('.absolute.to-white').remove()
            $(proseArea).empty();

            let html = '';
            if (articleImage.length) {
                html += $(articleImage).html()
            }
            let skipFirstP = false;
            for (let c in content) {
                let cd = content[c]
                switch(cd.type) {
                    case 'p': // Paragraph
                        if (skipFirstP) {
                            skipFirstP = false;
                            break;
                        }
                        html += '<div><p>' + cd.content + '</p></div>'
                        break;
                    case 'img': // image
                        html += '<figure class="w-full"><img src="'+cd.image.srcSet.original.srcSet[cd.image.srcSet.original.srcSet.length-1].src+'" /></figure>';
                        break;
                    case 'youtube':
                        html += '<div class="aspect-video">'+cd.html+'</div>';
                        break
                    case 'h':
                        html += '<h'+cd.level+'>'+cd.content+'</h'+cd.level+'>'
                        break;
                    default:
                        console.log('Unhandled type: ' + cd.type)
                }
            }

            setTimeout(() => {
                $(proseArea).html(html)
            });
        }

        // Remove advert containers
        $('[id^="gam-ad"],[id^="taboola-ad"]').each((idx, ele) => {
            if($(ele).parent().prop('nodeName') != 'FOOTER') {
                $(ele).parent().css('display', 'none')
            }
            $(ele).css('display', 'none');
        });
    });
})();
