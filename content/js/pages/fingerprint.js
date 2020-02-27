var _vue = new Vue({
    el: '#app',
    data: {
        'statusbarHeight': 0
    },
    methods: {
        'fignerPrintSuccess': function () {
            plus.webview.currentWebview().hide();
        },
        'fingerPrintError': function (e) {
            if (e.code === e.AUTHENTICATE_OVERLIMIT) {
                APP.GLOBAL.toastMsg('識別次數已超出限制，請聯係客服人員');
            } else if (e.code === e.AUTHENTICATE_MISMATCH) {
                APP.GLOBAL.toastMsg('指紋匹配失敗，請重新識別');
            }
        },
        'begin': function () {
            plus.fingerprint.authenticate(this.fignerPrintSuccess, this.fingerPrintError, {
                'message': '解鎖APP'
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    },
    mounted: function () {
        window.backButton = function () {
            APP.GLOBAL.toastMsg('請使用指紋解鎖');
        };
    }
});