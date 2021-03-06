/**
 * @file mip-ychlyxgs-data 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var util = require('util');
    var platform = util.platform;
    var customElement = require('customElement').create();
    var fetchJsonp = require('fetch-jsonp');
    customElement.prototype.build = function () {
        var ele = this.element;
        if ($(ele).find('.f-switch').length <= 0) { // 防止没生成时候没数据，植入默认数据
            $(ele).append('<div class="f-switch f-hide" data-ifSwbOk="true" data-tagSpOk="true"'
			+ 'data-addEjectDataOk="true" data-adaptationOk="true" data-clickEjectOk="true"'
			+ 'data-mgcFilterOk="true" data-zsOk="true"></div>');
        }

        var pageInfo = {
            id: $(ele).find('.f-information').attr('data-id'),
            categroyId: Math.ceil($(ele).find('.f-information').attr('data-categroyId')),
            ismoney: $(ele).find('.f-information').attr('data-ismoney'),
            system: $(ele).find('.f-information').attr('data-system').toUpperCase(),
            phpUrl: $(ele).find('.f-information').attr('data-phpurl'),
            ifSwbOk: $(ele).find('.f-switch').attr('data-ifSwbOk'),
            tagSpOk: $(ele).find('.f-switch').attr('data-tagSpOk'),
            addEjectDataOk: $(ele).find('.f-switch').attr('data-addEjectDataOk'),
            adaptationOk: $(ele).find('.f-switch').attr('data-adaptationOk'),
            zsOk: $(ele).find('.f-switch').attr('data-zsOk'),
            clickEjectOk: $(ele).find('.f-switch').attr('data-clickEjectOk'),
            mgcFilterOk: $(ele).find('.f-switch').attr('data-mgcFilterOk')
        };
        var isAds = false; // 商务包初始值
        var downUrl = $(ele).find('.f-downbtn-url a').first().attr('href'); // 下载链接
        var downBtnLink = $(ele).find('.f-downbtn-url').find('a');
        var androidEjectData = ''; // 安卓弹出层内容初始化
        var province = '';
        var city = '';
        var remotIpInfo = {
            ret: 1,
            start: -1,
            end: -1,
            country: '\u4e2d\u56fd',
            province: '\u6e56\u5317',
            city: '\u6b66\u6c49',
            district: '',
            isp: '',
            type: '',
            desc: ''
        };
        fetchJsonp('https://ca.6071.com/web/index/c/' + pageInfo.phpUrl, {
            jsonpCallback: 'callback'
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            var iossopurl = data['iossp-url'];
            var iosclassid = data['ios-classid'];
            var datawebUrl = data.webUrl;
            var azspurl = data['azsp-url'];
            var androidclassid = data['android-classid'];
            var dataIpok = data.ipok;
            var datahzUrl = data.hzurl;
            if (pageInfo.ifSwbOk === 'true') {
                ifSwb(data['f-noAdf-hide']); // 判断商务包
            }

            if (pageInfo.tagSpOk === 'true') {
                tagSp(data.webUrl); // tags适配
            }

            if (pageInfo.addEjectDataOk === 'true') {
                addEjectData(data['eject-city'], data.tcAndroidData, data.tcOhterCity); // 植入弹层推荐内容
            }

            if (pageInfo.adaptationOk === 'true') {
                adaptation(iossopurl, iosclassid, datawebUrl, azspurl, androidclassid, dataIpok, datahzUrl); // 设备适配
            }

            if (pageInfo.clickEjectOk === 'true') {
                clickEject(data['open-eject']); // 点击触发弹层
            }

            if (pageInfo.mgcFilterOk === 'true') {
                mgcFilter(data['f-mg-gl'], data.replaceHtml, data['eject-city']); // 敏感词过滤
            }

        });
        function ifSwb(noAdf) { // 判断商务包
            var z = 0;
            for (z = 0; z < noAdf.length; z++) {
                if (downUrl.indexOf(noAdf[z]) > -1) {
                    isAds = true;
                }

            }
            if (pageInfo.ismoney === 1) {
                isAds = true;
            }
        }
        function tagSp(datawebUrl) { // tag适配
            if ($(ele).find('.f-tags-box').length > 0) {
                if (platform.isIos()) { // ios
                    if ($(ele).find('.f-tags-box .f-tags-ios li').length > 0) {
                        addTags($(ele).find('.f-tags-box .f-tags-ios').html(),
                            $(ele).find('.f-tags-box .f-tags-ios li').first().attr('data-system'),
                            $(ele).find('.f-tags-box .f-tags-ios li').first().attr('data-id'),
                            $(ele).find('.f-tags-box .f-tags-ios li a p').first().text(), 'IOS', datawebUrl);
                    }
                    else {
                        $(ele).find('.f-tags-box').remove();
                    }
                }
                else { // 安卓
                    if ($(ele).find('.f-tags-box .f-tags-android li').length > 0) {
                        addTags($(ele).find('.f-tags-box .f-tags-android').html(),
                            $(ele).find('.f-tags-box .f-tags-android li').first().attr('data-system'),
                            $(ele).find('.f-tags-box .f-tags-android li').first().attr('data-id'),
                            $(ele).find('.f-tags-box .f-tags-android li a p').first().text(), 'ANDROID', datawebUrl);
                    }
                    else {

                        $(ele).find('.f-tags-box').remove();
                    }
                }
            }
            else {
                $(ele).find('.f-tags-box').remove();
            }
        }
        function addTags(tagsHtml, firstSystem, firstId, firstName, systemName, datawebUrl) {
            tagsHtml = '<div class=\'f-tags-box\'><ul>' + tagsHtml + '</ul></div>';
            $(ele).find('.f-tags-box').remove();
            $(ele).find('.f-tags-position').after(tagsHtml);
            $(ele).find('.f-tags-box').show();
            if (pageInfo.system.indexOf(systemName) === -1) {
                $(ele).find('.f-tags-system').text('系统：' + firstSystem);
                var urlArray = datawebUrl;
                var windowUrl = window.location.href;
                var i = 0;
                for (i = 0; i < urlArray.length; i++) {
                    if (windowUrl.indexOf(urlArray[i]) !== -1) {
                        downBtnLink.attr('href', 'http://m.' + urlArray[i] + '/down.asp?id=' + firstId).attr('data-add', 'add');
                    }

                }
            }

            $(ele).find('.f-tags-box ul li a p').each(function () {
                var liText = $(this).text();
                var re = '(官方最新版|官网最新版|官方正式版|官方安卓版|官方版|修改版|无限金币版';
                re += '|中文版|日服版|九游版|最新版|360版|百度版|uc版|九游版|安峰版|草花版|益玩版|破解版)';
                re = RegExp(re);
                liText = liText.replace(re, '<font color=\'red\'>$1</font>');
                $(ele).find(this).html(liText);
            });
        }
        function addEjectData(ejectcity, datatcAndroidData, datatcOhterCity) { // 植入弹层推荐内容
            province = remotIpInfo.province;
            city = remotIpInfo.city;
            var koCity = ejectcity;
            if ($.inArray(city, koCity) !== -1) { // 不在指定城市
                var i = 0;
                for (i = 0; i < 8; i++) {
                    androidEjectData += '<li><a href="' + datatcAndroidData[i][1] + '"><img src="'
                        + datatcAndroidData[i][2] + '" /><p><strong>'
                        + datatcAndroidData[i][0] + '</strong><b>下载</b></p></a></li>';
                }
            }
            else {
                for (i = 0; i < 8; i++) {
                    androidEjectData += '<li><a href="' + datatcOhterCity[i][1] + '"><img src="'
                        + datatcOhterCity[i][2] + '" /><p><strong>'
                        + datatcOhterCity[i][0] + '</strong><b>下载</b></p></a></li>';
                }
            }
            $(ele).find('.f-android-eject').append(androidEjectData);
        }
        function adaptation(iossopurl, iosclassid, datawebUrl, azspurl, androidclassid, dataIpok, datahzUrl) { // 设备适配
            if (platform.isIos()) { // IOS
                var iosspUrlid = $.inArray(downUrl, iossopurl);
                var ifiosSp = $.inArray(pageInfo.categroyId, iosclassid);
                var tagSize = $(ele).find('.f-tags-box ul li').length; // tags个数
                if (ifiosSp === -1 && tagSize <= 0 && iosspUrlid === -1) { // 没有匹配到
                    downBtnLink.attr({href: 'javascript:;', ispc: true});
                }
                else { // 匹配资源
                    downBtnLink.attr('issw', true);
                }
            }
            else { // 安卓
                $(ele).find('#details').append('<p>安卓欢迎你</p>');
                console.log('<p>安卓欢迎你</p>');
                var idArray = [];
                idArray = downUrl.split('.');
                if (downUrl.indexOf('mo.L5645.net') !== -1 && $(ele).find('.f-tags-box ul li').length <= 0) {
                    var urlArray = datawebUrl;
                    var windowUrl = window.location.href;
                    var i = 0;
                    for (i = 0; i < urlArray.length; i++) {
                        if (windowUrl.indexOf(urlArray[i]) !== -1) {
                            downBtnLink.attr('href', 'http://m.' + urlArray[i] + '/down.asp?id=' + idArray[4]).attr('data-add', 'add');
                        }

                    }
                }
                else {
                    var azspUrlid = $.inArray(downUrl, azspurl); // 0位适配失败，1为适配成功
                    var ifazSp = $.inArray(pageInfo.categroyId, androidclassid);
                    if (ifazSp === -1 && $(ele).find('.f-tags-box ul li').length <= 0 && azspUrlid === -1) {
                        downBtnLink.attr({href: 'javascript:;', ispc: true});
                    }
                    else {
                        downBtnLink.attr('issw', true);
                    }
                }
                if (downBtnLink.attr('ispc')) {
                    $(ele).find('.g-show-title p').html('该软件无安卓版，大家<span>还下载了</span>这些：');
                }
                else {
                    $(ele).find('.g-show-title p').html('大家<span>还下载了</span>这些：');
                }
                if (!isAds) {
                    var clickN = 0;
                    var resTitle = $(ele).find('h1').text() || ''; // 资源的名称
                    resTitle = resTitle.split(/(\s|\()/)[0];
                    $(ele).find('#details').append('<p>IP为：' + dataIpok + '</p><p>开关为：' + pageInfo.zsOk + '</p>');
                    console.log('<p>IP为：' + dataIpok + '</p><p>开关为：' + pageInfo.zsOk + '</p>');
                    if (dataIpok === 'false' && pageInfo.zsOk === 'true') {
                        if ((downBtnLink.attr('issw') || downBtnLink.attr('ispc'))) {
                            downBtnLink.click(function () {
                                if (clickN <= 0) {
                                    var hzUrl = datahzUrl[0].replace(/\&amp;/g, '&');
                                    $(ele).find('#details').append('<p>链接为：' + hzUrl + '</p>');
                                    console.log('<p>链接为：' + hzUrl + '</p>');
                                    window.location.href = hzUrl;
                                    clickN++;
                                    return false;
                                }
                                else {
                                    if (downBtnLink.attr('ispc')) {
                                        downBtnLink.attr('href', 'javascript:;');
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
        function clickEject(openEject) { // 点击触发弹层
            if (openEject === false) {
                return false;
            }

            downBtnLink.click(function () {
                if (platform.isIos()) {
                }
                else {
                    var setTimer = setTimeout(function () {
                        $(ele).find('.m-click-show').show();
                    }, 100);
                }
            });
            $('.m-close-btn,.m-black-bg').click(function () {
                $(ele).find('.m-click-show').hide();
            });
        }
        function mgcFilter(dataMggl, dataReplaceHtml, dataEjectCity) { // 敏感词过滤

            var mgcHtml = dataMggl;
            var titleHtml = $('title').html();
            var forNum = mgcHtml.length;
            var q = 0;
            for (q = 0; q < forNum; q++) {
                if (titleHtml.indexOf(mgcHtml[q]) !== -1) {
                    $('title').html(dataReplaceHtml[0]);
                    $(ele).find('.f-game-h1').html(dataReplaceHtml[1]);
                    $(ele).find('.f-game-img').each(function () {
                        $(ele).find(this).find('img').attr('src', dataReplaceHtml[2]);
                    });
                    $(ele).find('.f-previmg-cont').html(dataReplaceHtml[3]);
                    $(ele).find('.f-maincms-cont').html(dataReplaceHtml[4]);
                    province = remotIpInfo.province;
                    city = remotIpInfo.city;
                    var koCity = dataEjectCity;
                    if ($.inArray(city, koCity) !== -1) { // 在指定城市
                        $(ele).find('.f-downbtn-url').each(function () {
                            $(ele).find(this).find('a').attr('href', dataReplaceHtml[5]);
                        });
                    }

                    var replaceHtmlSize = Math.ceil(dataReplaceHtml.length);
                    if (replaceHtmlSize > 6) {
                        var numb = 6;
                        for (numb = 6; numb < replaceHtmlSize; numb++) {
                            $(ele).find('.f-replace-html' + numb).html(dataReplaceHtml[numb]);
                        }
                    }

                    $(ele).find('.f-hide-box').each(function () {
                        $(this).hide();
                    });
                    $(ele).find('.f-remove-box').each(function () {
                        $(this).remove();
                    });
                }

            }
        }
    };
    return customElement;
});
