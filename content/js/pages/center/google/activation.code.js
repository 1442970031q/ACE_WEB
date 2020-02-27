var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isActive': false,
        'form': {
            'gCode': ''
        },
        'pageModel': {
            'activeCode': ''
        },
        'language': {},
        'statusbarHeight': 20
    },
    methods: {
        'gotoUnbind': function () {
            APP.GLOBAL.gotoNewWindow('unbind.googlePage', 'unbind.google', {
                'openCallback': function () {
                    APP.GLOBAL.closeWindow('none');
                }
            });
        },
        'onInput': function (value) {
            this.form.gCode = (this.form.gCode + value).slice(0, 6);
            if (this.form.gCode.length === 6) {
                setTimeout(this.doCheckGoogleCodeAjax, 250);
            }
        },
        'onDelete': function () {
            this.form.gCode = this.form.gCode.slice(0, this.form.gCode.length - 1);
        },
        'doCheckGoogleCodeAjax': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.TOAST_TEXT });

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'LookActivedCode',
                data: this.form,
                success: function (result) {
                    APP.GLOBAL.closeToastLoading();

                    if (result.Error) {
                        _vue.form.gCode = '';
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.activeCode = result.ActiveCode;
                    _vue.isActive = true;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('activation_code', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.changeLanguage();
    },
    mounted: function () {
        this.$nextTick(function () {
            var clipboardDemos = new ClipboardJS('.confirm_button');
            clipboardDemos.on('success', function (e) {
                e.clearSelection();
                APP.GLOBAL.toastMsg(_vue.language.COPY_TOAST_TEXT);
            });

            clipboardDemos.on('error', function (e) {
                APP.GLOBAL.toastMsg(_vue.language.COPY_TOAST_FAIL);
            });
        });
    }
});