var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'form': {
            'count': '',
            'password': '',
            'sonId': '',
            'qId': 0,
            'answer': '',
            'idcard': '',
            'gCode':''
        },
        'request': {
            'is': APP.GLOBAL.queryString('is'),
            'display': APP.GLOBAL.queryString('display'),
            'sId': APP.GLOBAL.queryString('sId'),
            'amount': APP.GLOBAL.queryString('amount')
        },
        'display': {
            'currentACECount': 0,
            'dollarDisplay': '0.00',
            'accountDisplay': '',
            'questionDisplay': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'checkData': function () {
            if (!this.form.count || this.form.count < 100) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (!/^\d+$/.test(this.form.count)) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (this.form.count > this.display.currentACECount) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else if (!this.form.answer) {
                APP.GLOBAL.toastMsg(this.language.ERROR_6);
            } else if (!this.form.idcard) {
                APP.GLOBAL.toastMsg(this.language.ERROR_7);
            } else if (!this.form.password) {
                APP.GLOBAL.toastMsg(this.language.ERROR_4);
            } else if (this.form.password.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_5);
            } else if (!this.form.gCode.length) {
                APP.GLOBAL.toastMsg(this.language.ERROR_8);
            } else if (this.form.gCode.length < 6) {
                APP.GLOBAL.toastMsg(this.language.ERROR_9);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + (!this.form.sonId ? 'SellACE' : 'SellSonACE'),
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('sell.successPage', 'child/sell.success');
                }
            });
        },
        'gotoChoiceSubaccount': function () {
            APP.GLOBAL.gotoNewWindow('choice.subaccountPage', 'child/choice.subaccount', {
                openCallback: function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                closeCallback: function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'confirmSubaccount': function (id, display, amount) {
            this.form.sonId = id;
            this.display.accountDisplay = display;
            this.display.currentACECount = amount;
            this.form.count = '';
        },
        'choiceMain': function () {
            this.form.sonId = '';
            this.display.accountDisplay = this.language.ACCOUNT_TYPE;
            this.display.currentACECount = this.currentUser.ACECount;
            this.form.count = '';
        },
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'GetAnswerTitle',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.display.questionDisplay = result.QTitle;
                    _vue.form.qId = result.Qid;
                    _vue.isLoading = false;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('sell.ace', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    watch: {
        'form.count': function (v) {
            if (!v) v = 0;

            var dollarNumber = this.currentUser.CurrentStockPrice * v;
            this.display.dollarDisplay = numberFormat(dollarNumber, 2);
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
        this.display.currentACECount = this.currentUser.ACECount;

        if (this.request.is) {
            this.display.currentACECount = this.request.amount;
            this.form.sonId = this.request.sId;
            this.display.accountDisplay = this.request.display;
        }
    }
});