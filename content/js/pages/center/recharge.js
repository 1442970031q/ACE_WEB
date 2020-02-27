var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isLoading': true,
        'pageModel': {
            'ImageAddress': '',
            'Address': ''
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'loadPageData': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'USDTAddress',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.ImageAddress = result.ImageAddress;
                    _vue.pageModel.Address = result.Address;
                    _vue.isLoading = false;

                    _vue.$dialog.alert({
                        'title': _vue.language.ALERT_TITLE,
                        'message': _vue.language.ALERT_MESSAGE,
                        'confirmButtonText': _vue.language.ALERT_CONFIRM_BUTTON
                    });

                    _vue.$nextTick(function () {
                        var clipboard = new Clipboard('#btnCopy', {
                            text: function () {
                                return '这里是text参数返回的内容 - Hello yubai8';
                            }
                        });

                        clipboard.on('success', function (e) {
                            alert("文字已复制到剪贴板中");
                            console.log(e);
                        });
                    });
                }
            });
        },
        'gotoMyRecharge': function () {
            APP.GLOBAL.gotoNewWindow('my.rechargePage', 'my.recharge', {
                'openCallback': function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                'closeCallback': function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'gotoNewRecharge': function () {
            APP.GLOBAL.gotoNewWindow('new.rechargePage', 'new.recharge', {
                'openCallback': function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                'closeCallback': function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'gotoCalculator': function () {
            APP.GLOBAL.gotoNewWindow('recharge.calcPage', 'recharge.calc', {
                'openCallback': function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                'closeCallback': function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('recharge', function (lang) {
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