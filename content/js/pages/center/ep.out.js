var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isPlayerLoading': false,
        'isNotFound': false,
        'receiveDisplay': '',
        'playerNickname': '',
        'numberDisplay': '0',
        'form': {
            'amount': '',
            'password': '',
            'des': '',
            'gCode':'',
            'recipientId': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'searchPlayer': function () {
            if (!this.receiveDisplay) return;

            if (this.receiveDisplay.length < 5) {
                APP.GLOBAL.toastMsg(this.language.ERROR_7);
                return;
            }

            this.form.recipientId = '';
            this.isPlayerLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetBatchService',
                data: {
                    'code': this.receiveDisplay
                },
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else if (result.Data.List.length === 0) {
                        _vue.isNotFound = true;
                        _vue.playerNickname = _vue.language.PLAYER_NOTFOUND;
                    } else {
                        _vue.isNotFound = false;
                        _vue.playerNickname = result.Data.List[0].NickName + '(' + _vue.receiveDisplay + ')';
                        _vue.form.recipientId = result.Data.List[0].Id;
                    }

                    _vue.isPlayerLoading = false;
                }
            });
        },
        'checkData': function () {
            if (!this.form.recipientId) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (!this.form.amount) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (this.form.amount * 1 < 100) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else if (this.form.amount * 1 > this.currentUser.EP * 1) {
                APP.GLOBAL.toastMsg(this.language.ERROR_4);
            } else if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.ERROR_5);
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_6);
            } else if (!this.form.gCode) {
                APP.GLOBAL.toastMsg(this.language.ERROR_8);
            }else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TransferEP',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'EP': _vue.currentUser.EP - _vue.form.amount
                    }, [{
                        'pageName': 'home.htmlPage',
                        'actionName': '_vue.updateUserModel()'
                    }]);

                    APP.GLOBAL.gotoNewWindow('change.successPage', 'security/change.success', {
                        param: 'title=' + encodeURIComponent(_vue.language.PARAM_TITLE_TEXT) +
                            '&text=' + encodeURIComponent(_vue.language.PARAM_DES_TEXT + _vue.playerNickname),
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('ep.out', function (lang) {
                Vue.set(_vue, 'language', lang);

                _vue.playerNickname = lang.INPUT_PLACEHOLDER_2;
            });
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        
    }
});