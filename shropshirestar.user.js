// ==UserScript==
// @name         MNA paywalls
// @version      0.6
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
// ==/UserScript==

(function () {
  'use strict';

  const $ = window.jQuery;

  $(document).ready(() => {
    removePaywall();
    removeAds();
  });

  function removePaywall() {
    const proseArea = $($('.prose')[1]);
    if (!proseArea.length) {
      console.error('Prose area not found');
      return;
    }

    const dataStr = self.__next_f.find(item =>
      typeof item[1] === 'string' && item[1].includes('"story":')
    );

    if (!dataStr) {
      console.error('Could not find story data');
      return;
    }

    const storyMatch = dataStr[1].match(/"story":({.*?}),"basicAuthorDescription"/s);
    if (!storyMatch) {
      console.error('Could not extract story object');
      return;
    }

    try {
      const storyObj = JSON.parse(storyMatch[1]);
      const content = processStoryContent(storyObj);

      setTimeout(() => {
        proseArea.html(content);
        proseArea.next('.bg-gradient-to-b').remove();
      }, 1000);
    } catch (error) {
      console.error('Error processing story content:', error);
    }
  }

  function processStoryContent(storyObj) {
    const contentElements = [];

    const htmlMappings = {};
    let currentKey = null;
    let currentContent = '';

    self.__next_f.forEach(item => {
      if (Array.isArray(item) && item[0] === 1 && typeof item[1] === 'string') {
        const match = item[1].match(/^(\d+):T[a-f0-9]+,(.*)$/s);
        if (match) {
          if (currentKey) {
            htmlMappings[currentKey] = currentContent;
          }
          currentKey = `$${match[1]}`;
          currentContent = match[2];
        } else if (currentKey) {
          currentContent += item[1];
        }
      }
    });
    if (currentKey) {
      htmlMappings[currentKey] = currentContent;
    }

    console.log('htmlMappings:', htmlMappings);

    contentElements.push({
      type: 'headline',
      text: storyObj.headline
    });

    if (storyObj.indexImage) {
      contentElements.push({
        type: 'img',
        src: storyObj.indexImage.srcSet?.original?.srcSet?.[1]?.src ||
          'https://resizer.nationalworld.com/' + storyObj.indexImage.id.split('/').pop() + '?tr=w-600',
        alt: storyObj.indexImage.altText || storyObj.indexImage.caption || ''
      });
    }

    storyObj.content.forEach(item => {
      switch (item.type) {
        case 'p':
          contentElements.push({
            type: 'p',
            content: item.content
          });
          break;

        case 'img':
          if (item.image) {
            contentElements.push({
              type: 'img',
              src: item.image.srcSet?.original?.srcSet?.[1]?.src ||
                'https://resizer.nationalworld.com/' + item.image.id.split('/').pop() + '?tr=w-600',
              alt: item.image.altText || item.image.caption || ''
            });
          }
          break;

        case 'li': {
          const listItems = item.items.map(i => ({
            type: i.type,
            content: i.content
          }));
          contentElements.push({
            type: 'li',
            listType: item.listType,
            items: listItems
          });
          break;
        }

        case 'h':
          contentElements.push({
            type: 'h',
            headingType: 'h' + item.level,
            content: item.content
          });
          break;

        case 'safe-html': {
          const htmlContent = htmlMappings[item.html];
          if (htmlContent) {
            const imgRegex = /<img[^>]+src=["'](.*?)["'][^>]*>/gi;
            let match;
            while ((match = imgRegex.exec(htmlContent)) !== null) {
              const src = match[1].startsWith('//') ? 'https:' + match[1] : match[1];
              const altMatch = match[0].match(/alt=["'](.*?)["']/i);
              const alt = altMatch ? altMatch[1] : '';
              contentElements.push({ type: 'img', src: src, alt: alt });
            }
          }
          break;
        }

        case 'html':
          const htmlContent = htmlMappings[item.html];
          if (htmlContent) {
            contentElements.push({
              type: 'html',
              content: htmlContent
            });
          }
          break;

        default:
          console.log(`%cUnhandled content type: ${item.type}`, 'color: red; font-size: 16px; font-weight: bold;');
          console.log(item);
      }
    });

    return renderContentToHTML(contentElements);
  }

  function renderContentToHTML(contentElements) {
    return contentElements.map(element => {
      switch (element.type) {
        case 'headline':
          return `<h1>${element.text}</h1>`;

        case 'p':
          return `<div><p>${element.content}</p></div>`;

        case 'img':
          return `<figure class="w-full"><img src="${element.src}" alt="${element.alt}"/></figure>`;

        case 'li': {
          const listItems = element.items.map(item =>
            `<li><${item.type}>${item.content}</${item.type}></li>`
          ).join('');
          return `<${element.listType}>${listItems}</${element.listType}>`;
        }

        case 'h':
          return `<${element.headingType}>${element.content}</${element.headingType}>`;

        case 'safe-html':
          return `<div>${element.content}</div>`;

        case 'html':
          return element.content;

        default:
          return '';
      }
    }).join('');
  }

  function removeAds() {
    $('[id^="gam-ad"],[id^="taboola-ad"]').each((idx, ele) => {
      if ($(ele).parent().prop('nodeName') !== 'FOOTER') {
        $(ele).parent().css('display', 'none');
      }
      $(ele).css('display', 'none');
    });
  }
})();
