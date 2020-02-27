Vue.use(vant.Lazyload, {
    'loading': '../../../content/img/default_avatar.jpg',
    'error': '../../../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'activeName': '1',
        'pageModel': {
            'sId': APP.GLOBAL.queryString('sId')
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'EPSellDetail',
                data: this.pageModel,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel = Vue.set(_vue, 'pageModel', result.Detail);
                    _vue.activeName = result.Detail.ReceiveType;
                    _vue.isLoading = false;
                }
            });
        },
        'copyUsdt': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                var wb = plus.webview.getWebviewById('mainPage');
                wb.evalJS('_vue.setClipBoard("' + this.pageModel.Seller.Usdt.Address + '")');
            }

            APP.GLOBAL.toastMsg(this.language.COPY_COMPLETE);
        },
        'copyNumber': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                var wb = plus.webview.getWebviewById('mainPage');
                wb.evalJS('_vue.setClipBoard("' + this.pageModel.Seller.OfflinePay.BankCardNumber + '")');
            }
            
            APP.GLOBAL.toastMsg(this.language.COPY_COMPLETE);
        },
        'formatBankCardNumber': function () {
            var len = this.pageModel.Seller.OfflinePay.BankCardNumber.length / 4 + 1;
            var display = '';
            for (var i = 0; i < len; i++) {
                display += this.pageModel.Seller.OfflinePay.BankCardNumber.substring(i * 4, i * 4 + 4) + ' ';
            }

            return display;
        },
        'changeLanguage': function () {
            LSE.install('seller.info', function (lang) {
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