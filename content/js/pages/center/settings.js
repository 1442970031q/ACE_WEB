var _vue = new Vue({
    el: '#app',
    data: {
        'statusbarHeight': 0,
        'language': {},
        'fileTotalSize': 0
    },
    methods: {
        'checkUpgrade': function () {
            APP.GLOBAL.toastLoading({ 'message': this.language.CHECK_TEXT });

            var wb = plus.webview.getWebviewById('mainPage');
            wb.evalJS('_vue.checkUpgrade(true)');
        },
        'cofirmClear': function () {
            APP.GLOBAL.confirmMsg({
                'title': this.language.CONFIRM_TITLE,
                'message': this.language.CONFIRM_MESSAGE,
                'confirmButtonText': this.language.CONFIRM_BUTTON_1,
                'cancelButtonText': this.language.CONFIRM_BUTTON_2,
                'confirmCallback': this.clearCache
            });
        },
        'clearCache': function () {
            if (APP.CONFIG.IS_RUNTIME) {
                APP.GLOBAL.toastLoading({ 'message': this.language.CLEAR_TEXT });
                this.loadLocalFiles(true);
            }
        },
        'loadLocalFiles': function (isRemove) {
            plus.io.resolveLocalFileSystemURL('_downloads/', function (entry) {
                var reader = entry.createReader();
                reader.readEntries(function (entrys) {
                    _vue.entrysList(entrys, isRemove);
                });
            });
        },
        'entrysList': function (entrys, isRemove) {
            for (var i = 0; i < entrys.length; i++) {
                if (entrys[i].isFile) {
                    if (isRemove) {
                        entrys[i].remove();
                    } else {
                        entrys[i].getMetadata(function (meta) {
                            _vue.fileTotalSize += meta.size;
                        });
                    }
                }
            }

            if (isRemove) {
                this.fileTotalSize = 0;
                APP.GLOBAL.closeToastLoading();
            }
        },
        'changeLanguage': function () {
            LSE.install('settings', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    computed: {
        'version': function () {
            return 'v' + numberFormat(APP.CONFIG.VERSION / 10, 1);
        },
        'fileSize': function () {
            if (this.fileTotalSize <= 0) {
                return '0KB';
            } else if (this.fileTotalSize < Math.pow(1024, 2)) {
                return numberFormat(this.fileTotalSize / 1024, 2) + 'KB';
            } else {
                return numberFormat(this.fileTotalSize / Math.pow(1024, 2), 2) + 'MB';
            }
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
            this.loadLocalFiles(false);
        }
    }
});