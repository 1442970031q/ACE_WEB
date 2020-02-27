var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isSupport': false,
        'isEnrolled': false,
        'isKeyguard': false,
        'isOpened': false,
        'isPasswordInput': false,
        'form': {
            'password': ''
        },
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'checkPassword': function (action, done) {
            if (action !== 'confirm') {
                done();
                return;
            }

            if (!this.form.password) {
                done(false);
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (this.form.password.length < 6) {
                done(false);
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else {
                var pwd = this.form.password;
                this.form.password = '';
                done();

                this.doCheckPinAjax(pwd);
            }
        },
        'doCheckPinAjax': function (pwd) {
            APP.GLOBAL.toastLoading(this.language.TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'VerifyPinPwd',
                data: {
                    'password': pwd
                },
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.IS_FINGER_PRINT_OPEN, 'false');
                    _vue.isOpened = false;
                }
            });
        },
        'showTips': function () {

        },
        'openFingerPrint': function () {
            APP.GLOBAL.setItem(APP.CONFIG.SYSTEM_KEYS.IS_FINGER_PRINT_OPEN, 'true');
            this.isOpened = true;
        },
        'closeFingerPrint': function () {
            this.isPasswordInput = true;
            setTimeout(function () {
                _vue.$refs['passwordBox'].focus();
            }, 300);
        },
        'changeLanguage': function () {
            LSE.install('finger.print.setting', function (lang) {
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
        var v = APP.GLOBAL.getItem(APP.CONFIG.SYSTEM_KEYS.IS_FINGER_PRINT_OPEN);
        this.isOpened = v === 'true';

        this.isSupport = plus.fingerprint.isSupport();
        this.isKeyguard = plus.fingerprint.isKeyguardSecure();
        this.isEnrolled = plus.fingerprint.isEnrolledFingerprints();
    }
});