/*
SoShare Plugin - Content sharing plugin
Tool for sharing content on social media.
Author: Abraham Arslan (abrahamarslan.com)
Company: Ancap Corp.
MIT License
 */

(function($) {
    "use strict";
    var vm                  =   this;
    var getPageUrl          =   function () {
        if (document.querySelector('meta[property="og:url"]') && document.querySelector('meta[property="og:url"]').getAttribute('content')) {
            return document.querySelector('meta[property="og:url"]').getAttribute('content');
        }
        return window.location.href;
    };
    var windowHeight        =   436;
    var windowWidth         =   626;
    var currentURL          =   getPageUrl();

    //Share placement details - initialization
    var SELECTED_TEXT       =   "";
    var CX                  =   "";
    var CY                  =   "";
    var CRECT               =   0;
    var CLRECT              =   0;

    //Social Media Sharing Settings
    var TWITTER_DOTS        =   3;
    var TWITTER_CHAR_COUNT  =   280;
    var TWITTER_SPACES      =   5;
    var URL_LENGTH          =   currentURL.length;
    var TWITTER_AUTHOR      =   "";
    var TWITTER_LIMIT       =   TWITTER_CHAR_COUNT - TWITTER_DOTS - URL_LENGTH - TWITTER_SPACES;
    var NO_START_WITH       =   /[ .,!?/\\\+\-=*£$€:~§%^µ)(|@"{}&#><_]/g;
    var NO_ENDS_WITH        =   /[ ,/\\\+\-=*£$€:~§%^µ)(|@"{}&#><_]/g;
    var FB_DISPLAY_MODES    =   {
        popup: 'popup',
        page: 'page'
    };

    //Current document dimensions
    var windowTop           =   function () {
        return (screen.height / 2) - (windowHeight / 2);
    };
    var windowLeft          =   function () {
        return (screen.width / 2) - (windowWidth / 2);
    };
    var calculateSize       =   function () {
        return ("width=" + windowWidth + ", height=" + windowHeight + ", top=" + windowTop() + ", left=" + windowLeft());
    };

    //Add soshare function
    $.fn.soShare            =   function(initialConfig) {

        //Initialize with configuration
        var configuration = $.extend({
            "twitter": false,
            "facebook": false,
            "linkedin": false,
            "buffer": false,
            "reddit": false,
            "digg": false,
            "stumbleupon": false,
            "tumblr": false,
            "twitterAccount": "",
            "selectorName": "soshare",
            "sanitize": true,
            "FBMode": 'page',
            "facebookAppID" :""
        }, initialConfig);

        //Execute buiding the soshare plugin
        (function buildSoShare() {
            $("body").append("<span class='soshare'></span>");
            if (configuration.twitter) {
                $(".soshare").append("<i class='icon fa fa-twitter'></i>");
            }
            if (configuration.facebook) {
                $(".soshare").append("<i class='icon fa fa-facebook'></i>");
            }
            if (configuration.linkedin) {
                $(".soshare").append("<i class='icon fa fa-linkedin'></i>");
            }
            if (configuration.reddit) {
                $(".soshare").append("<i class='icon fa fa-reddit'></i>");
            }
            if (configuration.buffer) {
                $(".soshare").append("<i class='icon fa fa-align-center'></i>");
            }
            if (configuration.digg) {
                $(".soshare").append("<i class='icon fa fa-digg'></i>");
            }
            if (configuration.stumbleupon) {
                $(".soshare").append("<i class='icon fa fa-stumbleupon'></i>");
            }
            if (configuration.tumblr) {
                $(".soshare").append("<i class='icon fa fa-tumblr'></i>");
            }
        }());

        //Show SoShare Tooltip
        function placeSoShare() {
            $(".soshare").css({
                "left": CLRECT + (CRECT.width / 2) + "px",
                "top": CRECT.top + $(window).scrollTop() - 60 + "px",
                "opacity": 1
            });
        }

        ///Get position of SoShare Popup
        function getSoSharePosition(event) {
            CRECT = window.getSelection().getRangeAt(0).getBoundingClientRect();
            CLRECT = CRECT.left;
            CY = event.clientY;
        }

        //Get selected text to share
        function getSelectedText(event) {
            if ($(event.target).hasClass(configuration.selectorName)) {
                if (window.getSelection) {
                    if(configuration.sanitize)
                    {
                        SELECTED_TEXT = sanitizeText(window.getSelection().toString());
                    } else {
                        SELECTED_TEXT = window.getSelection().toString();
                    }
                    if (SELECTED_TEXT.length === 0) {
                        $(document).trigger('click');
                        return false;
                    }
                    getSoSharePosition(event);
                    placeSoShare();
                }
            }
        }

        var cleanEscapes = function cleanEscapes(text) {
            while (text.length && text[0].match(NO_START_WITH)) {
                text = text.substring(1, text.length);
            }
            while (text.length && text[text.length - 1].match(NO_ENDS_WITH)) {
                text = text.substring(0, text.length - 1);
            }
            return text;
        };

        //Clean Text before sharing
        var sanitizeText = function sanitizeText(text) {
            var tweetLimit = TWITTER_LIMIT;
            if (!text) {
                return '';
            }
            if (text.length > TWITTER_LIMIT) {
                text = text.substring(0, tweetLimit);
                text = text.substring(0, text.lastIndexOf(' ')) + '...';
            } else {
                text = text.substring(0, tweetLimit + TWITTER_DOTS);
            }
            return cleanEscapes(text);
        };


        //Hide SoShare
        function hideSoShare(event) {
            if (!$(event.target).hasClass(configuration.selectorName)) {
                $(".soshare").css("opacity", 0);
            }
        }

        //Open SoShare Popup
        function OpenSoSharePopUp() {
            var elm;
            if ($(this).hasClass("fa-twitter")) {
                var tweetText = "";
                if (configuration.twitterAccount.length > 3 && configuration.twitter) {
                    TWITTER_AUTHOR = ' via @' + configuration.twitterAccount;
                    tweetText = SELECTED_TEXT + TWITTER_AUTHOR
                    elm = "https://twitter.com/intent/tweet?text=" + tweetText + "&url=" + currentURL;
                } else {
                    elm = "https://twitter.com/intent/tweet?text=" + tweetText + "&url=" + currentURL;
                }
            } else if ($(this).hasClass("fa-linkedin")) {
                elm = "https://www.linkedin.com/shareArticle?mini=true&url=" + currentURL + "&title=" + $(document).title + "&source=MadeInTheMidlands&target=new&text=" + SELECTED_TEXT;
            } else if ($(this).hasClass("fa-facebook")) {
                //Simple mode - uncomment to enable simple mode
                //elm = 'http://www.facebook.com/sharer.php?u='+encodeURIComponent(currentURL)+'&quote='+ SELECTED_TEXT;
                elm = 'https://facebook.com/dialog/share?display=' + configuration.FBMode + '&href=' + currentURL + '&quote=' + SELECTED_TEXT;
                if (document.querySelector('meta[property="fb:app_id"]') && document.querySelector('meta[property="fb:app_id"]').getAttribute('content')) {
                    var content = document.querySelector('meta[property="fb:app_id"]');
                    elm += '&app_id=' + content;
                } else if (configuration.facebookAppID && configuration.facebookAppID.length) {
                    elm += '&app_id=' + parameters.facebookAppID;
                } else {
                    elm += '&app_id=166619644164375'; //Default APP ID for testing
                }
            }
            else if ($(this).hasClass("fa-align-center")) {
                elm = 'https://buffer.com/add?text="' + SELECTED_TEXT + '"&url=' + currentURL;
            }
            else if ($(this).hasClass("fa-reddit")) {
                elm = 'https://reddit.com/submit?url=' + currentURL + '&title=' + SELECTED_TEXT;
            }
            else if ($(this).hasClass("fa-digg")) {
                elm = 'http://digg.com/submit?url=' + currentURL + '&title=' + SELECTED_TEXT;
            }
            else if ($(this).hasClass("fa-tumblr")) {
                elm = 'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' + currentURL + '&caption=' + SELECTED_TEXT;
            }
            else if ($(this).hasClass("fa-stumbleupon")) {
                elm = 'http://www.stumbleupon.com/submit?url=' + currentURL + '&title=' + SELECTED_TEXT;
            }
            window.open(elm, "", calculateSize());
        }

        //Events
        (function events() {
            document.onmouseup = document.onkeyup = document.onselectionchange = getSelectedText;
            $(document).on("click", ".icon", OpenSoSharePopUp);
            $(document).on("click", hideSoShare);
        }());

        return this;
    };
}(jQuery));