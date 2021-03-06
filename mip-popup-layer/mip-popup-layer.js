/**
 * @file 弹出层位置由css中指定
 *
 * @author 381890975@qq.com, maketoday
 * @version 1.0
 * @copyright 在mip-sider上修改而成
 */
define(function (require) {
    var customElement = require('customElement').create();
    var util = require('util');
    var naboo = util.naboo;

    /**
     * [toggle 打开或关闭 popuplayer 入口]
     * @param  {Object} event 点击事件
     */
    function toggle(event) {

        isOpen.call(this) ? close.call(this, event) : open.call(this);

    }

    /**
     * [open 打开 popuplayer]
     */
    function open() {

        var self = this;
        if (self.runing) {
            return;
        }
        self.runing = true;

        if (isOpen.call(this)) {
            return;
        }

        util.css(self.element, {display: 'block'});
        openMask.call(self);


        self.bodyOverflow = getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        // 动画效果
        var openTimer = setTimeout(function () {

            self.element.setAttribute('open', '');
            self.element.setAttribute('aria-hidden', 'false');
            clearTimeout(openTimer);

        }, self.ANIMATION_TIMEOUT);

    }

    /**
     * [close 关闭 popuplayer]
     *
     * @param  {Object} event 点击事件
     */
    function close(event) {

        var self = this;
        self.runing = true;
        event.preventDefault();

        self.element.removeAttribute('open');
        self.element.setAttribute('aria-hidden', 'true');

        closeMask.call(self);

        document.body.style.overflow = self.bodyOverflow;

        // 动画效果
        var closeTimer = setTimeout(function () {

            util.css(self.element, {display: 'none'});
            clearTimeout(closeTimer);

        }, self.ANIMATION_TIMEOUT);

    }

    /**
     * [openMask 打开遮盖层]
     */
    function openMask() {

        var self = this;

        // 不存在遮盖层时先创建
        if (!self.maskElement) {

            const mask = document.createElement('div');
            mask.id = 'MIP-' + self.id.toUpperCase() + '-MASK';
            mask.className = 'MIP-POPUP-LAYER-MASK';
            mask.style.display = 'block';

            // 与mip-sidebar 同级dom
            self.element.parentNode.appendChild(mask);
            mask.addEventListener('touchmove', function (evt) {
                evt.preventDefault();
            }, false);

            self.maskElement = mask;

        }

        self.maskElement.setAttribute('on', 'tap:' + self.id + '.close');

        // 样式设置
        self.maskElement.style.display = 'block';

        naboo.animate(self.maskElement, {
            opacity: 0.2
        }, {
            duration: 500
        }).start(function () {
            self.runing = false;
        });
    }

    /**
     * [closeMask 关闭遮盖层]
     */
    function closeMask() {
        var self = this;
        if (self.maskElement) {
            naboo.animate(self.maskElement, {
                opacity: 0
            }, {
                duration: 500
            }).start(function () {
                self.maskElement.style.display = 'none';
                self.runing = false;
            });
        }
    }

    /**
     * [isOpen popuplayer 状态判断]
     *
     * @return {boolean}
     */
    function isOpen() {

        return this.element.hasAttribute('open');

    }

    /**
     * build
     *
     */
    function build() {

        var self = this;
        self.maskElement = false;
        self.id = self.element.id;
        self.side = self.element.getAttribute('side');
        self.ANIMATION_TIMEOUT = 100;

        if (self.side !== 'left' && self.side !== 'right') {
            self.side = 'left';
            self.element.setAttribute('side', self.side);
        }

        if (isOpen.call(self)) {
            open.call(self);
        }
        else {
            self.element.setAttribute('aria-hidden', 'true');
        }



        self.addEventAction('toggle', function (event) {
            toggle.call(self, event);
        });
        self.addEventAction('open', function () {
            open.call(self);
        });
        self.addEventAction('close', function (event) {
            close.call(self, event);
        });

    }

    customElement.prototype.build = build;
    customElement.prototype.prerenderAllowed = function () {
        return true;
    };

    return customElement;
});
