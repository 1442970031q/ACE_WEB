Vue.use(vant.Lazyload, {
    'loading': '../content/img/default_avatar.jpg',
    'error': '../content/img/default_avatar.jpg',
    'attempt': 1
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isInstallLanuage': false,
        'language': {},
        'form': {
            'pin': ''
        },
        'isPassowrdShow': false,
        'menus': [{
            'index': 0,
            'text': '首頁',
            'default': 'iconhome',
            'active': 'iconhomefill',
            'url': 'home.html'
        }, {
            'index': 1,
            'text': 'ACE交易',
            'default': 'iconpuke',
            'active': 'iconpuke_fill',
            'url': 'ace.list.html'
        }, {
            'index': 2,
            'text': 'EP交易',
            'default': 'iconjiaoyi',
            'active': 'iconjiaoyi_fill',
            'url': 'ep.list.html'
        }, {
            'index': 3,
            'text': '我的',
            'default': 'iconmy',
            'active': 'iconmyfill',
            'url': '#'
        }],
        'currentIndex': 3,
        'statusbarHeight': 0
    },
    methods: {
        'confirmDialog': function (action, done) {
            if (action === 'confirm') {
                if (!this.form.pin) {
                    done(false);
                    APP.GLOBAL.toastMsg(this.language.DIALOG_ERROR_1);
                } else if (this.form.pin.length < 6) {
                    done(false);
                    APP.GLOBAL.toastMsg(this.language.DIALOG_ERROR_2);
                } else {
                    done();
                    this.doCheckPINAjax();
                }
            } else {
                this.form.pin = '';
                done();
            }
        },
        'doCheckPINAjax': function () {
            APP.GLOBAL.toastLoading(this.language.DIALOG_TOAST);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'ValidPin',
                data: this.form,
                success: function (result) {
                    _vue.form.pin = '';
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    window.location = 'center/profile.html';
                }
            });
        },
        'updateUserModel': function () {
            Vue.set(this, 'currentUser', APP.GLOBAL.getUserModel());
        },
        'gotoDarkPage': function (id, page) {
            APP.GLOBAL.gotoNewWindow(id, page, {
                'openCallback': function () {
                    plus.navigator.setStatusBarStyle('dark');
                },
                'closeCallback': function () {
                    plus.navigator.setStatusBarStyle('light');
                }
            });
        },
        'gotoLightPage': function (id, page) {
            APP.GLOBAL.gotoNewWindow(id, page);
        },
        'logoutAccount': function () {
            APP.GLOBAL.confirmMsg({
                'title': this.language.EXIT_TITLE,
                'message': this.language.EXIT_TEXT,
                'confirmCallback': function () {
                    _vue.doLogoutAjax();
                }
            });
        },
        'doLogoutAjax': function () {
            APP.GLOBAL.toastLoading(this.language.EXIT_TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'Logout',
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.removeModel();
                    window.location = '../index.html';
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('center', function (lang) {
                Vue.set(_vue, 'language', lang);
                _vue.isInstallLanuage = true;
            });
        }
    },
    computed: {
        'regTime': function () {
            var date = this.currentUser.CreateTime.replace(/\//g, '/');
            var regDate = new Date(date);

            var lang = LSE.currentLanguage();
            if (lang === 'cn') {
                return regDate.getFullYear() + '年' + (regDate.getMonth() + 1) + '月' + regDate.getDate() + '日';
            } else {
                return regDate.getFullYear() + '/' + (regDate.getMonth() + 1) + '/' + regDate.getDate();
            }
        },
        'screenWidth': function () {
            if (APP.CONFIG.IS_RUNTIME && APP.CONFIG.SYSTEM_NAME !== 'ios') {
                return window.screen.width;
            } else {
                return document.body.clientWidth;
            }
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    }
});