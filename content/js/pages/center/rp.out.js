var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'isPlayerLoading': false,
        'isNotFound': false,
        'receiveDisplay': '',
        'questionDisplay': '',
        'playerNickname': '',
        'form': {
            //'answer': '',
            //'qId': 0,
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
        'checkData': function () {
            if (!this.form.recipientId) {
                APP.GLOBAL.toastMsg(this.language.CLICK_SELECTED_PLAYER); //'請選擇玩家'
            } else if (!this.form.amount) {
                APP.GLOBAL.toastMsg(this.language.CLICK_INPUT_TURN_OUT_AMOUNT); //'請輸入要轉出的RP數量'
            } else if (this.form.amount * 1 <= 0) {
                APP.GLOBAL.toastMsg(this.language.RP_AMOUNT_MORE_CHARS); //'RP數量必須大於0'
            } else if (this.form.amount * 1 > this.currentUser.RP * 1) {
                APP.GLOBAL.toastMsg(this.language.RP_AMOUNT_NOT_ENOUGH); //'RP數量不足'
            } else if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.CLICK_INPUT_TRANSFER_PWD); //'請輸入交易密碼'
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.TRANSFER_PWD_MORE_CHARS); //'交易密碼最少6位'
            } else if (!this.form.gCode) {
                APP.GLOBAL.toastMsg(this.language.GOOGLE_CODE_EMPTY); //'交易密碼最少6位'
            }
            //else if (!this.form.answer) {
            //    APP.GLOBAL.toastMsg(this.language.ERROR_1);
            //}
            else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.PROGRESSING); //'正在提交'

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'TransferRP',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.updateUserModel({
                        'RP': _vue.currentUser.RP - _vue.form.amount
                    }, [{
                        'pageName': 'home.htmlPage',
                        'actionName': '_vue.updateUserModel()'
                    }]);

                    APP.GLOBAL.gotoNewWindow('change.successPage', 'security/change.success', {
                        param: 'title=' + encodeURIComponent(_vue.language.TURN_RESULT) +
                            '&text=' + encodeURIComponent(_vue.language.TURN_SUCCESS + _vue.playerNickname),
                        openCallback: function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'searchPlayer': function () {
            if (!this.receiveDisplay) return;

            if (this.receiveDisplay.length < 5) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
                return;
            }

            this.form.recipientId = '';
            this.isPlayerLoading = true;

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetBatchUser',
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
                }
            });
        },
        'loadPageData': function () {
            //APP.GLOBAL.ajax({
            //    url: APP.CONFIG.BASE_URL + 'GetAnswerTitle',
            //    success: function (result) {
            //        if (result.Error) {
            //            APP.GLOBAL.toastMsg(result.Msg);
            //            return;
            //        }
            //
            //        _vue.questionDisplay = result.QTitle;
            //        _vue.form.qId = result.Qid;
            //        
            //    }
            //});
            this.isLoading = false;
        },
        'changeLanguage': function () {
            LSE.install('rp.out', function (lang) {
                Vue.set(_vue, 'language', lang);
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
        this.loadPageData();
    }
});