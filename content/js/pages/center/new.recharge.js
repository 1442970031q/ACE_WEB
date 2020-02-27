var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'fileName': '',
        'choiceFilePath': '',
        'form': {
            'amount': '',
            'hash': '',
            'imgBase64': ''
        },
        'language': {},
        'statusbarHeight': 0
    },
    methods: {
        'pasteHex': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                var mainPage = plus.webview.getWebviewById('mainPage');
                mainPage.evalJS('_vue.getClipBoard("new.rechargePage", "_vue.pasteCallback")');
            }
        },
        'pasteCallback': function (result) {
            if (!result) {
                APP.GLOBAL.toastMsg('剪貼板沒有内容');
            } else {
                this.form.hash = result;
            }
        },
        'checkData': function () {
            if (!this.form.amount) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (!this.form.hash && !this.choiceFilePath) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else {
                APP.GLOBAL.toastLoading({ 'message': this.language.TOAST_TEXT });

                if (this.choiceFilePath) {
                    this.compressImage();
                } else {
                    this.doSubmitAjax();
                }
            }
        },
        'compressImage': function () {
            plus.zip.compressImage({
                'src': this.choiceFilePath,
                'dst': '_downloads/recharge.jpg',
                'overwrite': true,
                'format': 'jpg',
                'width': 'auto',
                'height': 'auto',
                'quality': 90
            }, function (event) {
                _vue.compressComplete(event);
            }, function (error) {
                APP.GLOBAL.closeToastLoading();
                APP.GLOBAL.toastMsg(error.message);
            });
        },
        'compressComplete': function (event) {
            var reader = new plus.io.FileReader();

            reader.onloadend = function (e) {
                var base64 = e.target.result.toString().replace('data:image/jpeg;base64,', '');
                _vue.form.imgBase64 = encodeURIComponent(base64);
                _vue.doSubmitAjax();
            };

            reader.onerror = function (fe) {
                APP.GLOBAL.closeToastLoading();
                APP.GLOBAL.toastMsg('Error:' + fe.error);
            };

            var f = event.target.replace('file://', '');
            reader.readAsDataURL(f);
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SubmitRecharge',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                        return;
                    }

                    APP.GLOBAL.gotoNewWindow('submit.recharge.successPage', '../success/submit.recharge.success', {
                        'openCallback': function () {
                            APP.GLOBAL.closeWindow('none');
                        }
                    });
                }
            });
        },
        'choiceImage': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                plus.key.hideSoftKeybord();
                setTimeout(function () {
                    plus.gallery.pick(_vue.resolveFile);
                }, 100);
            }
        },
        'resolveFile': function (captureFile) {
            plus.io.resolveLocalFileSystemURL(captureFile, function (entry) {
                var filePath = entry.toLocalURL();
                entry.file(function (file) {
                    if (file.size > 5 * (1024 * 1024)) {
                        APP.GLOBAL.toastMsg('截图必须在5MB以内');
                        return;
                    }

                    _vue.fileName = file.name;
                    _vue.choiceFilePath = filePath;
                });
            });
        },
        'changeLanguage': function () {
            LSE.install('new.recharge', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.changeLanguage();
    }
});