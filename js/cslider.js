(function ($, undefined) {
    $.Slider = function (options, element) {
        this.$el = $(element);
        this._init(options);
    };
    $.Slider.defaults = {
        width: 1170,
        height: 500,
        current: 0,
        bgincrement: 100,
        autoplay: true,
        interval: 6000
    };
    $.Slider.prototype = {
        _init: function (options) {
            var self = this;
            this.options = $.extend(true, {}, $.Slider.defaults, options);
            this.ratio = this.$el.width() / this.$el.height();
            this.$slides = this.$el.children().children('.da-slide');
            this.slidesCount = this.$slides.length;
            this.current = this.options.current;
            if (this.current < 0 || this.current >= this.slidesCount) {
                this.current = 0;
            }
            this.$slides.eq(this.current).addClass('da-slide-current');
            var $navigation = $('<nav class="da-dots"/>');
            for (var i = 0; i < this.slidesCount; ++i) {
                $navigation.append('<span/>');
            }
            $navigation.appendTo(this.$el);
            this.$pages = this.$el.find('nav.da-dots > span');
            this.$navNext = this.$el.find('span.da-arrows-next');
            this.$navPrev = this.$el.find('span.da-arrows-prev');
            this.isAnimating = false;
            this.bgpositer = 0;
            this.cssAnimations = Modernizr.cssanimations;
            this.cssTransitions = Modernizr.csstransitions;
            if (!this.cssAnimations || !this.cssAnimations) {
                this.$el.addClass('da-slider-fb');
            }
            this._updatePage();
            this._loadEvents();
            if (this.options.autoplay) {
                this._startSlideshow();
            }
            $(window).bind('resize', function () {
                setTimeout(function () {
                    self._makeResponsive();
                }, 150);
            });
            this._makeResponsive();
        },
        _navigate: function (page, dir) {
            var $current = this.$slides.eq(this.current),
                $next, _self = this;
            if (this.current === page || this.isAnimating) return false;
            this.isAnimating = true;
            var classTo, classFrom, d;
            if (!dir) {
                (page > this.current) ? d = 'next': d = 'prev';
            } else {
                d = dir;
            }
            if (this.cssAnimations && this.cssAnimations) {
                if (d === 'next') {
                    classTo = 'da-slide-toleft';
                    classFrom = 'da-slide-fromright';
                    ++this.bgpositer;
                } else {
                    classTo = 'da-slide-toright';
                    classFrom = 'da-slide-fromleft';
                    --this.bgpositer;
                }
                this.$el.css('background-position', this.bgpositer * this.options.bgincrement + '% center');
            }
            this.current = page;
            $next = this.$slides.eq(this.current);
            if (this.cssAnimations && this.cssAnimations) {
                var rmClasses = 'da-slide-toleft da-slide-toright da-slide-fromleft da-slide-fromright';
                $current.removeClass(rmClasses);
                $next.removeClass(rmClasses);
                $current.addClass(classTo);
                $next.addClass(classFrom);
                $current.removeClass('da-slide-current');
                $next.addClass('da-slide-current');
            }
            if (!this.cssAnimations || !this.cssAnimations) {
                $next.addClass('da-slide-current');
                $next.css('left', (d === 'next') ? '100%' : '-100%').stop().animate({
                    left: '0%'
                }, 1000, function () {
                    _self.isAnimating = false;
                });
                $current.stop().animate({
                    left: (d === 'next') ? '-100%' : '100%'
                }, 1000, function () {
                    $current.removeClass('da-slide-current');
                });
            }
            this._updatePage();
        },
        _updatePage: function () {
            this.$pages.removeClass('da-dots-current');
            this.$pages.eq(this.current).addClass('da-dots-current');
        },
        _startSlideshow: function () {
            var _self = this;
            this.slideshow = setTimeout(function () {
                var page = (_self.current < _self.slidesCount - 1) ? page = _self.current + 1 :
                    page = 0;
                _self._navigate(page, 'next');
                if (_self.options.autoplay) {
                    _self._startSlideshow();
                }
            }, this.options.interval);
        },
        page: function (idx) {
            if (idx >= this.slidesCount || idx < 0) {
                return false;
            }
            if (this.options.autoplay) {
                clearTimeout(this.slideshow);
                this.options.autoplay = false;
            }
            this._navigate(idx);
        },
        _makeResponsive: function () {
            var _self = this;
            var w = this.$el.width();
            var h = this.$el.height();
            var nH = h;
            if (w < _self.options.width) {
                var xy = this.options.width / this.options.height;
                var nH = w / xy;
                this.$el.height(Math.ceil(nH));
            } else {
                this.$el.height(Math.ceil(this.options.height));
            }
        },
        _loadEvents: function () {
            var _self = this;
            this.$pages.on('click.cslider', function (event) {
                _self.page($(this).index());
                return false;
            });
            this.$navNext.on('click.cslider', function (event) {
                if (_self.options.autoplay) {
                    clearTimeout(_self.slideshow);
                    _self.options.autoplay = false;
                }
                var page = (_self.current < _self.slidesCount - 1) ? page = _self.current + 1 :
                    page = 0;
                _self._navigate(page, 'next');
                return false;
            });
            this.$navPrev.on('click.cslider', function (event) {
                if (_self.options.autoplay) {
                    clearTimeout(_self.slideshow);
                    _self.options.autoplay = false;
                }
                var page = (_self.current > 0) ? page = _self.current - 1 : page = _self
                    .slidesCount - 1;
                _self._navigate(page, 'prev');
                return false;
            });
            if (this.cssTransitions) {
                if (!this.options.bgincrement) {
                    this.$el.on('webkitAnimationEnd.cslider animationend.cslider OAnimationEnd.cslider',
                        function (event) {
                            if (event.originalEvent.animationName === 'toRightAnim4' || event
                                .originalEvent.animationName === 'toLeftAnim4') {
                                _self.isAnimating = false;
                            }
                        });
                } else {
                    this.$el.on('webkitTransitionEnd.cslider transitionend.cslider OTransitionEnd.cslider',
                        function (event) {
                            if (event.target.id === _self.$el.attr('id'))
                                _self.isAnimating = false;
                        });
                }
            }
        }
    };
    var logError = function (message) {
        if (this.console) {
            console.error(message);
        }
    };
    $.fn.cslider = function (options) {
        if (typeof options === 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function () {
                var instance = $.data(this, 'cslider');
                if (!instance) {
                    logError("cannot call methods on cslider prior to initialization; " +
                        "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for cslider instance");
                    return;
                }
                instance[options].apply(instance, args);
            });
        } else {
            this.each(function () {
                var instance = $.data(this, 'cslider');
                if (!instance) {
                    $.data(this, 'cslider', new $.Slider(options, this));
                }
            });
        }
        return this;
    };
})(jQuery);