var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isFirstLoading': true,
        'isPlayerLoading': false,
        'isShowMoney': false,
        'isFirstReport': false,
        'levelList': [],
        'nodaPersonDisplay': '',
        'isNotFound': false,
        'playerNickname': '',
        'display': {
            'levelText': ''
        },
        'form': {
            'investmentAmount': '',
            'nodalPersonId': '',
            'position': 1,
            'mPassword': ''
        },
        'request': {
            'fromTree': APP.GLOBAL.queryString('fromTree'),
            'display': APP.GLOBAL.queryString('display'),
            'parentDisplay': APP.GLOBAL.queryString('parentDisplay'),
            'pos': APP.GLOBAL.queryString('pos'),
            'parentId': APP.GLOBAL.queryString('parentId')
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'checkData': function () {
            if (!this.form.investmentAmount) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (!this.form.nodalPersonId) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (!this.form.mPassword) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else if (this.form.mPassword.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_4);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.SUBMIT_TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'DeclarationSonForm',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('new.user.successPage', 'success/new.user.success', {
                        'param': 'ln=' + encodeURIComponent(_vue.display.levelText) +
                            '&pn=' + encodeURIComponent(_vue.playerNickname) +
                            '&pos=' + _vue.form.position + 
                            '&parentId=' + _vue.nodaPersonDisplay
                    });
                }
            });
        },
        'searchPlayer': function () {
            if (!this.nodaPersonDisplay) return;

            if (this.nodaPersonDisplay.length < 5) {
                APP.GLOBAL.toastMsg(this.language.ERROR_5);
                return;
            }

            this.form.nodalPersonId = '';
            this.isPlayerLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetNodalPersonList',
                data: {
                    'code': this.nodaPersonDisplay
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else if (result.Data.List.length === 0) {
                        _vue.isNotFound = true;
                        _vue.playerNickname = _vue.language.PLAYER_NOTFOUND;
                    } else {
                        _vue.isNotFound = false;
                        _vue.playerNickname = result.Data.List[0].NickName + '(' + _vue.nodaPersonDisplay + ')';
                        _vue.form.nodalPersonId = result.Data.List[0].Id;
                    }

                    _vue.isPlayerLoading = false;
                }
            });
        },
        'confirmMoney': function (item) {
            this.isShowMoney = false;
            this.display.levelText = item.text;
            this.form.investmentAmount = item.value;
        },
        'getStar': function (item) {
            var starHtml = '&nbsp;';
            for (var i = 0; i < item.StarNumber; i++) {
                starHtml += '<i class="iconfont iconxing star"></i>';
            }

            var text = item.Name + '&nbsp;' + item.InvestmentAmount + '$';
            return text + '&nbsp;' + starHtml;
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'InvestmentAmountList',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    for (var i = 0; i < result.Data.List.length; i++) {
                        _vue.levelList.push({
                            'text': _vue.getStar(result.Data.List[i]),
                            'value': result.Data.List[i].InvestmentAmount,
                            'disabled': result.Data.List[i].IsDisable
                        });
                    }

                    _vue.display.levelText = _vue.levelList[0].text;
                    _vue.form.investmentAmount = _vue.levelList[0].value;
                    _vue.isLoading = false;
                }
            });
        },
        'loadFirstReport': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'IsFirstReport',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    if (result.IsFirst) {
                        _vue.playerNickname = result.Data.NickName + '(' + result.Data.FlowNumber + ')';
                        _vue.nodaPersonDisplay = result.Data.FlowNumber;
                        _vue.form.nodalPersonId = result.Data.Id;
                        _vue.form.position = 1;
                    }

                    _vue.isFirstReport = result.IsFirst;
                    _vue.isFirstLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('new.subaccount', function (lang) {
                Vue.set(_vue, 'language', lang);

                if (!_vue.request.fromTree) {
                    _vue.playerNickname = lang.PLAYER_DEFAULT;
                }
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        if (this.request.fromTree) {
            this.nodaPersonDisplay = this.request.display;
            this.form.nodalPersonId = this.request.parentId;
            this.form.position = this.request.pos * 1;
            this.playerNickname = this.request.parentDisplay;
        }
    },
    mounted: function () {
        this.loadPageData();
        this.loadFirstReport();
    }
});