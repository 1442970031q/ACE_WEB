var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isFeedbackTypeShow': false,
        'typeList': [{
            'text': '界面佈局',
            'value': 1
        }, {
            'text': '功能優化',
            'value': 2
        }, {
            'text': '錯誤報告',
            'value': 3
        }, {
            'text': '密码问题',
            'value': 4
        }, {
            'text': '充值问题',
            'value': 5
        }, {
            'text': '资料修正',
            'value': 6
        }, {
            'text': '其他問題',
            'value': 7
        }],
        'typeDisplay': '',
        'form': {
            'type': '',
            'text': '',
            'imgBase64_1': '',
            'imgBase64_2': '',
            'imgBase64_3': ''
        },
        'imageList': [],
        'compressImageList': [],
        'statusbarHeight': 0,
        'language': {}
    },
    methods: {
        'checkData': function () {
            if (!this.form.type) {
                APP.GLOBAL.toastMsg(this.language.ERROR_1);
            } else if (!this.form.text) {
                APP.GLOBAL.toastMsg(this.language.ERROR_2);
            } else if (this.form.text.length < 5) {
                APP.GLOBAL.toastMsg(this.language.ERROR_3);
            } else {
                if (this.imageList.length === 0) {
                    this.doSubmitAjax();
                    return;
                }

                _vue.compressImageList = [];
                for (var i = 0; i < this.imageList.length; i++) {
                    plus.zip.compressImage({
                        'src': this.imageList[i].file,
                        'dst': '_downloads/img_' + i + '.jpg',
                        'overwrite': true,
                        'format': 'jpg',
                        'width': 'auto',
                        'height': 'auto',
                        'quality': 80
                    }, function (event) {
                        _vue.compressComplete(event);
                    }, function (error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(error.message);
                    });
                }
            }
        },
        'doSubmitAjax': function () {
            APP.GLOBAL.toastLoading(this.language.TOAST_TEXT);

            APP.GLOBAL.ajax({
                url: APP.CONFIG.BASE_URL + 'SubmitCommits',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        APP.GLOBAL.closeToastLoading();
                        APP.GLOBAL.toastMsg(result.Msg);
                    } else {
                        APP.GLOBAL.toastMsg(_vue.language.SUBMIT_SUCCESS);
                        APP.GLOBAL.closeWindow();
                    }
                }
            });
        },
        'compressComplete': function (event) {
            var reader = new plus.io.FileReader();

            reader.onloadend = function (e) {
                var base64 = e.target.result.toString().replace('data:image/jpeg;base64,', '');
                _vue.compressImageList.push({
                    'base64': encodeURIComponent(base64)
                });
            };

            reader.onerror = function (fe) {
                APP.GLOBAL.closeToastLoading();
                APP.GLOBAL.toastMsg('读取错误：' + fe.error);
            };

            var f = event.target.replace('file://', '');
            reader.readAsDataURL(f);
        },
        'remove': function (item) {
            for (var i = 0; i < this.imageList.length; i++) {
                if (this.imageList[i].file === item.file) {
                    this.imageList.splice(i, 1);
                    return;
                }
            }
        },
        'choiceImage': function () {
            if (this.imageList.length === 3) {
                APP.GLOBAL.toastMsg('最多只能上传3张图片');
                return;
            }

            plus.key.hideSoftKeybord();
            setTimeout(function () {
                plus.gallery.pick(_vue.resolveFile);
            }, 100);
        },
        'resolveFile': function (captureFile) {
            plus.io.resolveLocalFileSystemURL(captureFile, function (entry) {
                var fileName = entry.toLocalURL();

                entry.file(function (file) {
                    if (file.size > 5 * (1024 * 1024)) {
                        APP.GLOBAL.toastMsg('截图必须在5MB以内');
                        return;
                    }

                    if (!_vue.any(fileName)) {
                        _vue.imageList.push({ 'file': fileName });
                    }
                });
            });
        },
        'any': function (fileName) {
            if (this.imageList.length === 0) return false;

            for (var i = 0; i < this.imageList.length; i++) {
                if (this.imageList[i].file === fileName) return true;
            }

            return false;
        },
        'confirmType': function (item) {
            this.typeDisplay = item.text;
            this.form.type = item.value;
            this.isFeedbackTypeShow = false;
        },
        'changeLanguage': function () {
            LSE.install('feedback', function (lang) {
                Vue.set(_vue, 'language', lang);

                _vue.typeDisplay = lang.DEFAULT_TEXT;
            });
        }
    },
    watch: {
        'compressImageList': function (value) {
            if (!value || value.length === 0) return;

            if (value.length === this.imageList.length) {
                for (var i = 0; i < value.length; i++) {
                    this.form['imgBase64_' + (i + 1)] = value[i].base64;
                }

                this.doSubmitAjax();
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