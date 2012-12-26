
(function ($) {

    var in_array = function (array, p_val, checkSame) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (checkSame(array[i],p_val)) {
                return true;
            }
        }
        return false;
    };

    /* Add recent terms plugin
     *
     * Add recent terms to $container if height difference
     * between $container and target jquery object is less than maxHeightDifference
     * Skips adding if it is not enough space.
     * Correctly works with daScroll plugin.
     *
     */
    $.fn.daAddRecentTerms = function (options) {
        var $this = $(this);

        /** returns container which is not limited by height */
        var getContainer = function ($this) {
            return $this.children().first();
        };

        /**
         * check is add element presented in container
         *
         * @param $container container with element
         * @param add element to add
         * @param remove if (true) presented element will be deleted and function return true
         */
        var checkUnique = function ($container, add, remove) {
            var elements = $container.children();
            for (var i = 0; i < elements.length; i++) {
                var element = $(elements[i]);
                if (element.text() === add.text) {
                    if (remove) {
                        element.remove(); //remove existing term
                    } else {
                        return false; //don't add term
                    }
                }
            }

            return true;
        };

        /** tries to find jquery template by data-template param of $this object */
        var getTemplate = function($this, $container) {
            var templateLink = $this.data('template');
            if (templateLink) {
                return $(templateLink).template();
            }

            return null;
        };

        /**
         * returns object that will be added after ajax answer
         * by default nothing to add
         */
        var getLastElement = function($this, $container) {
            return null;
        };

        /** executes before add element */
        var beforeAdd = function($this, $container, element) {
            //nothing to do
        };

        options = $.extend({
            getTemplate:getTemplate,
            url:$this.data('source'),
            getContainer:getContainer,
            maxHeightDifference:500,
            checkUnique:checkUnique,
            getLastElement:getLastElement,
            loadDataDelay:5000,
            iterateFromEndToBeginning:true,
            beforeAdd: beforeAdd
        }, options);

        var url = options.url;
        var $container = options.getContainer($this);
        var template = options.getTemplate($this, $container);

        //if all required properties are correct do action
        if (url && $container && template) {

            /**
             * Append new element
             *
             * @param element object with content
             * @param forced if true element will be added without any checks
             */
            var add = function (element, forced) {
                //append new data only if it is required
                if (forced || ($container.height() - $this.height() < options.maxHeightDifference)) {
                    //executing before add
                    options.beforeAdd(element, $this, $container);
                    //check for unique
                    if (options.checkUnique($container, element, forced)) {
                        $container.append($.tmpl(template, element));
                    }
                }
            };

            /**
             * Add ajax result to container
             *
             * @param data ajax answer
             */
            var refreshRecentTerms = function (data) {
                //if this function is called first time and there is search request add it to the end of recent terms
                var lastElement = options.getLastElement($this, $container);

                //append to the end of visible area.
                var i;
                if (options.iterateFromEndToBeginning) {
                    for (i = data.length - 1; i >= 0; i--) {
                        add(data[i]);
                    }
                } else {
                    for (i = 0; i < data.length; i++) {
                        add(data[i]);
                    }
                }

                if (lastElement) add(lastElement, true);
            };

            /**
             * Makes AJAX request by options.url each options.loadDataDelay ms.
             * Returned data adds to container
             */
            var loadData = function () {
                $.ajax({
                    async:true,
                    url:url,
                    type:'GET',
                    dataType:'json',
                    cache:false,
                    success:function (data) {
                        refreshRecentTerms(data);
                        setTimeout(loadData, options.loadDataDelay);
                    },
                    error:function () {
                        setTimeout(loadData, 60000);
                    }
                });
            };

            loadData();
        }
    };

    /**
     * Scrolls elements horizontally
     * Periodically pulls server for new elements
     *
     */
    $.fn.daHorizontalScroll = function (options) {
        var $this = $(this);

        /**
         * @return last child element
         */
        var getLastChild = function() {
            return $this.children(':last-child')
        };

        var checkSameHtml = function(term, htmlElement) {
            return (term==htmlElement)
        };

        var checkSame = function(a, b) {
            return (a == b);
        };

        var transferValueBeforeTemplate = function(val) {
            return val;
        };

        options = $.extend({
            containerId:$this.attr('id'), //scroll container id
            url:$this.data('source'), //source data url
            terms:[], //scrolled terms array
            maxTermsCount:20,
            loadDataDelay:10000,
            template:$this.data('template'), //jquery template selector
            getLastChild:getLastChild, //function returns last container child element
            checkSame:checkSame, //function used to remove objects
            checkSameHtml:checkSameHtml,
            transferValueBeforeTemplate: transferValueBeforeTemplate
        }, options);

        /**
         * check is add element already displayed
         *
         * @param elements previously added elements
         * @param add element to add
         */
        var checkUnique = function (elements, add) {
            return !in_array(elements, add, options.checkSame);
        };

        /** tries to find jquery template*/
        var getTemplate = function() {
            var templateLink = options.template;
            if (templateLink) {
                return $(templateLink).template();
            }

            return null;
        };

        /** starts scrolling if it's required */
        var userEnter = false; //mouse enter scrolling content
        var checkAndGo = function() {
            if (!userEnter) {
                var lastChild = options.getLastChild();
                if (lastChild.get(0)) {
                    if ((lastChild.offset().left + lastChild.outerWidth()) > ($container.width() + $container.offset().left)) {
                        daTicker.start();
                    }
                }
            }
        };

        var $container = $('#' + options.containerId);
        var terms = options.terms;
        var template = getTemplate();
        daTicker = new Ticker('daTicker', options.containerId, 1, 45, options.checkSame, options.checkSameHtml); //should be global

        var getSearchTerms = function () {
            $.getJSON(options.url, function (data) {

                $.each(data, function (key, val) {
                    if (checkUnique(terms, val) && !daTicker.isMarkedToRemove(val)) {
                        terms.push(val);
                        $container.append($.tmpl(template, options.transferValueBeforeTemplate(val)));
                    }
                });

                if (terms.length > options.maxTermsCount) {
                    for (var k = 0; k < terms.length - options.maxTermsCount; k++) {
                        daTicker.remove(terms[k]);
                    }
                    terms.splice(0, terms.length - options.maxTermsCount);
                }

                checkAndGo();

                setTimeout(getSearchTerms, options.loadDataDelay);
            });
        };

        $container
            .mouseenter(function () {
                userEnter = true;
                daTicker.stop();
            })
            .mouseleave(function () {
                userEnter = false;
                checkAndGo();
            });

        getSearchTerms();
    };

    /* Scroll plugin
     *
     * Scrolling inline elements
     *
     * */
    $.fn.daScroll = function (options) {

        /** returns tags from first line */
        var getFirstLineContent = function ($container) {

            var left = -1;

            return $container.children().filter(function () {
                if (left == -1) {
                    //variable is not set - first element
                    left = $(this).offset().left;
                } else if (left == -2) {
                    //element of next lines
                    return false;
                } else if ($(this).offset().left == left) {
                    //starts new line. break loop
                    left = -2;
                    return false;
                }

                return true;
            });
        };

        /** returns container which is not limited by height */
        var getContainer = function ($this) {
            return $this.children().first();
        };

        /** returns scroll time of single line */
        var getDuration = function (height) {
            return height / 0.05;
        };

        options = $.extend({
            getContainer:getContainer,
            wrap:true,
            wrapTag:'div',
            block:false,
            align:'left',
            nextLineDelay:500,
            getFirstLineContent:getFirstLineContent,
            getDuration: getDuration
        }, options);

        /** prepares first line.
         *  If options.block is set - uses block algorithm
         *  Else if options.wrap is set - uses wrap algorithm
         *  otherwise returns first line
         */
        var getPreparedFirstLine = function ($container) {
            var content = options.getFirstLineContent($container);
            if (options.block) {
                return content.css('display', 'block').css('float', options.align);
            } else if (options.wrap) {
                return content.wrapAll('<' + options.wrapTag + ' />').first().parent();
            } else {
                return options.getFirstLineContent($container);
            }
        };

        /** undo "getPreparedFirstLine" function actions */
        var unprepareContent = function ($firstLine) {
            if (options.block) {
                $firstLine.css('display', '').css('float', '');
            } else if (options.wrap) {
                $firstLine.children().unwrap();
            }
        };

        var getSubDistance = function ($firstLine) {
            if (options.block) {
                return parseInt($firstLine.css("marginTop"))
                    + parseInt($firstLine.css("marginBottom"))
                    + parseInt($firstLine.css("paddingTop"))
                    + parseInt($firstLine.css("paddingBottom"));
            } else {
                return 0;
            }
        };

        /** Result code that scrolls each passed object */
        return this.each(function () {
            var animation = true; //false if animation is stopped (mouse hover)
            var $this = $(this);
            var $container = options.getContainer($this);
            var $firstLine = getPreparedFirstLine($container);
            var averageLineHeight = (options.getAverageLineHeight) ? options.getAverageLineHeight($container) : $firstLine.height();

            var distance; //scroll distance of first line
            var duration; //duration of first line scrolling
            var called; //jQuery will call callback of animate function multiple times for multiple objects. We need to trigger only last one

            /**
             * returns true if first line is empty
             */
            var isFirstLineEmpty = function() {
                return !($firstLine && $firstLine.height());
            };

            /** CALLBACKS - declare all callback functions to overcome memory leaks **/

            /**
             * if animation is stopped (mouse hover) - wait
             * otherwise put first line content to the bottom (if required), animate next line of content
             */
            var animateNextLineCallback = function () {
                if (animation) {
                    if (($container.height() - $this.height()) > ($firstLine.height() + averageLineHeight * 7)) {
                        //remove moved content
                        $firstLine.remove();
                    } else {
                        //move current item to the bottom
                        unprepareContent($firstLine.appendTo($container).css('marginTop', ''));
                    }

                    //animate next line
                    $firstLine = getPreparedFirstLine($container);
                    animator();
                } else {
                    setTimeout(animateNextLineCallback, 50);
                }
            };

            /**
             * Animate next line after options.nextLineDelay ms
             * Triggers for all objects of last line. Executes only for last object (called == 0)
             */
            var animateCallback = function () {
                called--;

                if (called == 0) {
                    setTimeout(animateNextLineCallback, options.nextLineDelay); //wait 500ms after line animation. Then animate next line
                }
            };

            /**
             * If it is not enough content to animate script is delayed for 1sec and this callback is called
             */
            var animateIfNotEnoughContentCallback = function() {
                if (isFirstLineEmpty()) $firstLine = getPreparedFirstLine($container);
                animator();
            };

            /**
             * Executes animation logic of last search
             */
            function animator() {
                //is it enough content to start animation
                var minHeightDifference = (!isFirstLineEmpty()) ? $firstLine.height() * 2 : averageLineHeight * 3;
                if (($container.height() - $this.height()) < minHeightDifference) {
                    setTimeout(animateIfNotEnoughContentCallback, 1000);
                } else {
                    //calculate animation duration and distance
                    distance = $firstLine.height() + getSubDistance($firstLine);
                    duration = options.getDuration(distance);
                    called = $firstLine.size();

                    //animate the first child of the ticker
                    $firstLine.animate({ marginTop:-distance }, duration, "linear", animateCallback);
                }
            }

            /** CALLBACKS END */

            animator();

            //set mouseenter - stop current animation
            $this.mouseenter(function () {
                animation = false;
            });

            //set mouseleave - resume animation
            $this.mouseleave(function () {
                animation = true;
            });
        });
    };

    /* Zoom plugin
     *
     * Showing absolute positioning html element under the selected element
     *
     * */

    $.fn.daZoom = function(params) {

        var defaultParameters = new Object();

        defaultParameters = {
            onzoomin: null,
            onzoomout: null
        };

        $.extend(defaultParameters, params);

        if(typeof defaultParameters.onzoomin !== 'function') {
            defaultParameters.onzoomin = function (){};
        }

        if(typeof defaultParameters.onzoomout !== 'function') {
            defaultParameters.onzoomout = function (){};
        }

        return this.each(function() {
            var $this = $(this);

            /* Create events */
            $this.bind('zoomin.devadmin', function(e) {
                defaultParameters.onzoomin(e);
            });

            $this.bind('zoomout.devadmin', function(e) {
                defaultParameters.onzoomout(e);
            });


            /* mouseover event */
            $this.mouseenter(
                function() {

                    $this.trigger('zoomin.devadmin');

                    /* calculating mouse position */
                    var top = $this.offset().top + parseInt(($this.children('.da-zoom-normal').outerHeight() - $this.children('.da-zoom-hover').outerHeight()) / 2);
                    var left = $this.offset().left + parseInt(($this.children('.da-zoom-normal').innerWidth() - $this.children('.da-zoom-hover').innerWidth()) / 2);

                    var poptop = $(window).scrollTop() + $(window).height() - $this.children('.da-zoom-hover').outerHeight() - top;
                    if (poptop < 0) {
                        top = top + poptop;
                    }
                    if (top < $(window).scrollTop()) {
                        top = $(window).scrollTop();
                    }

                    var popleft = $(window).scrollLeft() + $(window).width() - $this.children('.da-zoom-hover').outerWidth() - left;
                    if (popleft < 0) {
                        left = left + popleft;
                    }
                    if (left < $(window).scrollLeft()) {
                        left = $(window).scrollLeft();
                    }

                    /* positioning tolltip element */
                    $this.addClass('da-zoom-enter').children('.da-zoom-hover').offset({top: top, left: left});
                }
            )
                /* hiding tooltip on mouse out */
                .mouseleave(
                function() {
                    $this.trigger('zoomout.devadmin');
                    $this.removeClass('da-zoom-enter');
                }
            )
        });
    }

    /* Tooltip plugin
     *
     * The Tooltip plugin is a UI control to display tips on the elements with reference to the coordinates of the mouse.
     *
     * */
    $.fn.daTooltip = function(params) {

        var defaultParameters = new Object();

        defaultParameters = {
            text: '',
            tooltipElement: 'da-tooltip',
            offset_x: 15,
            offset_y: 17
        };

        $.extend(defaultParameters, params);

        if(!defaultParameters.text || typeof defaultParameters.text !== 'string') {
            return false;
        }

        return this.each(function() {
            /* if not exist create tolltip DOM element */
            if(!$('body > #'+defaultParameters.tooltipElement).length) {
                var tooltipElementId = defaultParameters.tooltipElement + '-' + $(this).attr('id');
                $('body').append('<span id="'+ tooltipElementId +'" class="da-tooltip">' + defaultParameters.text + '</span>').find('#'+tooltipElementId).hide();
                /* else using existing */
            } else {
                $('#'+tooltipElementId).html(defaultParameters.text).hide();
            }

            var tooltipElement = $('#'+tooltipElementId);

            /* attach mouseover event */
            $(this).mouseenter(function(e) {
                tooltipElement.fadeIn(100);
            })
                /* attach mouseleave event */
                .mouseleave(function (e) {
                    tooltipElement.fadeOut(100);
                })
                /* attach mousemove event */
                .mousemove(function (e) {
                    tooltipElement.offset({top: e.pageY + defaultParameters.offset_y, left: e.pageX + defaultParameters.offset_x});
                });
        });

    };



    /* Multi-state button plugin
     *
     * Make four state html-element (normal, mouse over, clicking, clicked)
     *
     * */


    $.fn.daButton = function(params) {

        var defaultParameters = new Object();

        defaultParameters =
        {
            onClick: null,
            state: 1
        };

        $.extend(defaultParameters, params);

        /* button's states */
        var states = {1: 'normal', 2: 'hover', 3: 'click', 4: 'clicked'};
        if(!$.inArray(defaultParameters.state, states)) {
            defaultParameters.state = 1;
        }

        return this.each(function () {

            var state = defaultParameters.state; /* normal */
            var $this = $(this);
            var counter = $this.find('.counter');

            /* set state class */
            if(!$this.hasClass(states[state])) {
                $this.addClass(states[state]);
            }

            /* set counter */
            function setCounter(val) {
                if(counter && counter.text) {
                    counter.text(val);
                }
            }

            var cnt = isNaN(parseInt(counter.text())) ? 0 : parseInt(counter.text());
            setCounter(cnt);

            /* attach mouse over event */
            $this.mouseenter(
                function() {
                    if(state === 1) {
                        state = 2; /* mouse over */
                        $this.removeClass('normal').addClass('hover');
                    }
                }
            )
                /* attach mouse out event */
                .mouseleave(
                function() {
                    if(state === 2) {
                        state = 1;
                        $this.removeClass('hover').addClass('normal');
                    }
                }
                /* attach click event */
            ).click(
                function(){
                    if(state === 2) {
                        state = 3; /* click */
                        $this.removeClass('hover').addClass('click');
                        /* after 0,5 second set state to 'clicked' from 'click' */
                        setTimeout(
                            function() {
                                state = 4; /* clicked */
                                $this.removeClass('click').addClass('clicked');
                                /* call onclick function if it set */
                                if(defaultParameters.onClick && typeof defaultParameters.onClick === 'function') {
                                    if(defaultParameters.onClick()) {
                                        var cnt = isNaN(parseInt(counter.text())) ? 0 : parseInt(counter.text());
                                        /* increase counter */
                                        setCounter(cnt + 1);
                                    }
                                }
                            }, 500
                        );
                    }
                }
            );

        });
    };

    /* Pop-up element plugin
     *
     * The Popup plugin is a UI control that enables you to make a comfortable and modern pop elements on a Web page.
     *
     * */
    $.fn.daPopup = function(params) {

        var defaultParameters = new Object();

        /* default parameters */
        defaultParameters = {
            timeOut: 1000,
            bodyClickHide: true,
            onpopup: null,
            onhide: null,
            exclusive: true
        };

        $.extend(defaultParameters, params);

        if(typeof defaultParameters.onpopup !== 'function') {
            defaultParameters.onpopup = function () {};
        }

        if(typeof defaultParameters.onhide !== 'function') {
            defaultParameters.onhide = function () {};
        }

        return this.each(function() {

            var timer;
            var $this = $(this);

            /* bind onpopup event */
            $this.bind('popup.devadmin', function(e) {
                defaultParameters.onpopup(e);
            });

            /* bind hide event */
            $this.bind('hide.devadmin', function(e) {
                defaultParameters.onhide(e);
            });

            /* function - hide pop-up and call attached onhide-event */
            function hidePopup() {
                if($this.hasClass('active')) {
                    $this.removeClass('active');
                    $this.trigger('hide.devadmin');
                }
            }

            /* function - show pop-up and call attached onpopup-event */
            function showPopup() {
                if(!$this.hasClass('active')) {
                    /* if parameters 'exclusive' is set then hiding all same elements on the page */
                    if(defaultParameters.exclusive) {
                        $(window).trigger('hidePopup.devadmin');
                    }
                    $this.addClass('active');
                    $this.trigger('popup.devadmin');
                }
            }

            /* set timer for close pop-up after timeout */
            function setTimer() {
                timer = window.setTimeout(hidePopup, defaultParameters.timeOut);
            }

            /* unset timer */
            function clearTimer() {
                if(timer) {
                    window.clearTimeout(timer);
                    timer = null;
                }
            }

            /* stop prpagation for all browsers */
            function stopProp(e) {
                if(!e) e = window.event;
                if(e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true;
                }
            }

            /* attach events listner to the button */
            $this.children('.button')
                .bind('mouseenter click', function(event) {
                    clearTimer();
                    if(!$this.hasClass('active')) {
                        showPopup();
                    }
                    stopProp(event)
                })
                .mouseleave(function() {
                    setTimer();
                });

            /* attach events listner to the  popup */
            $this.children('.popup')
                .mouseenter(function() {
                    clearTimer();
                })
                .mouseleave(function() {
                    if(!$this.find('.popup input[type=text]:focus, .popup textarea:focus').length) {
                        setTimer();
                    }
                })
                .click(function(event) {
                    stopProp(event);
                    event.preventDefault();
                });

            /* if set parameter bodyClickHide then attach event listner to the body */
            if(defaultParameters.bodyClickHide) {
                $(document).click(function() {
                    clearTimer();
                    hidePopup();
                });
            }

            /* if exists close pop-up element then attach event listner to it */
            $this.find('.popup .popup-close').click(function(event){
                hidePopup();
                stopProp(event);
            });

            /* attach event listner to body for hiding all same element on the page */
            $(window).bind('hidePopup.devadmin', function(e) {hidePopup()});


        });


    };

    /**
     * Infinite content scrolling plugin
     *
     */
    $.daInfiniteScroll = $.fn.daInfiniteScroll = function (options) {
        var $document = $(document),
            $window = $(window);

        var defaultParameters = {
            max: -1,
            delay: 200,
            offset: 200,
            getNextLink: function() { return $('a.next')},
            getLoadingContainer: function() { return $('#loading') },
            beforeSend: function() {},
            onSuccess: function() {},
            onError: function() {}
        };

        options = $.extend(defaultParameters, options);

        var loading = false,
            noMoreContent = false,
            count = 1;

        var doScroll = function() {

            //max scrolls limit
            if (options.max >= 0 && count > options.max) return;

            //no more content
            if (noMoreContent) return;

            //check scroll height
            if($document.height() - options.offset < $document.scrollTop() + $window.height() && loading == false) {

                //user scrolled more than bottom of page - offset
                var $that = (options.container) ? $(options.container) : $(this);
                var $link = options.getNextLink();
                var url = $link.attr('href');
                var $loadingContainer = options.getLoadingContainer();

                if(url) {
                    // node was found, pathchange worked... make request
                    $.ajax({
                        type: 'POST',
                        url: url,
                        dataType: 'HTML',
                        beforeSend: function(xhr) {
                            // block potentially concurrent requests
                            loading = true;

                            options.beforeSend();

                            // display loading feedback
                            $loadingContainer.show();

                            // hide 'more' browser
                            $link.hide();

                            //mark as infinity scroll request
                            xhr.setRequestHeader('X-Infinity-Scroll', 'true')
                        },
                        success: function(answer) {
                            // drop data into document
                            var $answer = $(answer);
                            $answer.not('.data').appendTo($that);

                            //hide loading feedback
                            $loadingContainer.hide();

                            //on success trigger
                            options.onSuccess(answer);

                            //updates link if it is returned
                            var url = $answer.filter('.data').data('url');
                            if (url) {
                                //there is more content
                                $link.attr('href', url);
                                $link.show();
                            } else {
                                //there is no more content
                                options.onNoMoreContent();
                                noMoreContent = true;
                            }

                            // unblock more requests (reset loading status)
                            loading = false;

                            count++;
                        },
                        error : function(jqXHR, textStatus, errorThrown) {
                            console.log('error on loading images content - ' + textStatus);

                            options.onError(textStatus);

                            $link.show();
                            $loadingContainer.hide();

                            // unblock more requests (reset loading status)
                            loading = false;
                        }
                    });
                }
            }
        };

        $(window).scroll(function(){
            $.doTimeout('scroll', options.delay, doScroll);
        });

        // may be we should scroll more content right now
        doScroll();
    };


    /*
     SUPPORT CLASS USED BY daHorizontalScroll
     stock-ticker.js Version 0.2

     this script animates a ticker consisting of a div containing a sequence of
     spans.	the div is shifted to the left by shiftBy pixels every interval ms.
     As the second visible span reaches the left of the screen, the first is appended to
     the end of the div's children.

     See http://devedge.netscape.com/toolbox/examples/2001/stock-ticker/

     Change Log: Version 0.1 - Doron Rosenberg, August 1, 2001
     Initial Contribution

     Version 0.2 - Bob Clary, August 1, 2001
     added runId property and removed run property, removed
     animate() method since start() handles functionality,
     fixed problems with calling start() multiple times creating
     multiple threads resulting in an apparent speed up of the Ticker.

     Constructor Ticker(name, id, shiftBy, interval)

     Methods
     =======
     Ticker.start()
     starts the animation of the ticker

     Ticker.stop()
     stops the animation of the ticker

     Ticker.changeInterval(newinterval)
     changes the shifting interval to newinterval

     Properties
     ==========
     Ticker.name
     String : name of global variable containing reference to the ticker object

     Ticker.id
     String : id of the DIV containing the Ticker data

     Ticker.shiftBy
     Number : Number of pixels to shift the Ticker each time it fires.

     Ticker.interval
     Number : Number of millisecond intervals between times Ticker fires

     Ticker.runId
     Number : Value returned from setTimeout or null if the Ticker is not
     running

     Ticker.div
     HTMLElement : Reference to DIV containing the Ticker data.

     */

    function Ticker(name, id, shiftBy, interval, checkSame, checkSameHtml)
    {
        var that = this;
        var j, doRemove;

        this.name     = name;
        this.id       = id;
        this.shiftBy  = shiftBy ? shiftBy : 1;
        this.interval = interval ? interval : 100;
        this.runId	= null;
        this.checkSame = checkSame;
        this.checkSameHtml = checkSameHtml;
        this.toRemove = [];

        this.div = document.getElementById(id);

        // remove extra textnodes that may separate the child nodes
        // of the ticker div

        var node = this.div.firstChild;
        var next;

        while (node)
        {
            next = node.nextSibling;
            if (node.nodeType == 3)
                this.div.removeChild(node);
            node = next;
        }

        //end of extra textnodes removal

        this.left = 0;
        this.shiftLeftAt = $(this.div.firstChild).outerWidth();
        this.div.style.height	= $(this.div.firstChild).outerHeight();
        this.div.style.width = 2 * screen.availWidth;
        this.div.style.visibility = 'visible';

        this.remove = function(e) {
            this.toRemove.push(e);
        };

        this.isMarkedToRemove = function(e) {
            return in_array(this.toRemove, e, this.checkSame);
        };

        this.start = function() {
            that.stop();

            that.left -= that.shiftBy;

            if (that.left <= -that.shiftLeftAt)
            {
                that.left = 0;
                doRemove = false;
                //may be current element should be removed
                for (j = 0; j < this.toRemove.length; j++) {
                    if (this.checkSameHtml(this.toRemove[j], that.div.firstChild)) {
                        doRemove = true;
                        this.toRemove.splice(j, 1);
                        break;
                    }
                }

                if (doRemove) {
                    that.div.removeChild(that.div.firstChild);
                } else {
                    that.div.appendChild(that.div.firstChild);
                }
                that.shiftLeftAt = $(that.div.firstChild).outerWidth();
            }

            that.div.style.left = (that.left + 'px');

            that.runId = setTimeout(that.name + '.start()', that.interval);
        };

        this.stop = function() {
            if (that.runId)
                clearTimeout(that.runId);

            that.runId = null;
        };

        this.changeInterval = function(newinterval) {

            if (typeof(newinterval) == 'string')
                newinterval =  parseInt('0' + newinterval, 10);

            if (typeof(newinterval) == 'number' && newinterval > 0)
                that.interval = newinterval;

            that.stop();
            that.start();
        };
    }
})(jQuery);
