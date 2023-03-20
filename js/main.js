new Vue({
    el: '#app',
    data: function () {
        return {
            key: '',
            question: '',
            msgList: [],
            lockBtn: false,
            currentParentId: '',
            continueTalk: true,
            captureShow: false,
            captureUrl: '',
            codeMap: {
                204: '每日免费50次，免费次数已用完',
            },
            settingShow: false,
            setting: {
                mode: false,
            },
            themes: {
                false: {
                    '--msgbox-bg': '#ededed',
                    '--common-bg': '#ffffff',
                    '--common-color': '#303133',
                    '--common-border': '1px solid #EBEEF5',
                    '--btn-bg': '#ffffff',
                    '--person-msg-bg': '#dcf8c7',
                },
                true: {
                    '--msgbox-bg': '#1c1c1c',
                    '--common-bg': '#0d0d0d',
                    '--common-color': '#8f9091',
                    '--common-border': '1px solid #797777',
                    '--btn-bg': '#1c1c1c',
                    '--person-msg-bg': '#0d0d0d',
                },
            },
        };
    },
    watch: {
        'setting.mode': {
            handler: function (val) {
                this.changeMode(val);
            },
        },
    },
    created() {
        this.getKey();
        this.initMode();
    },
    methods: {
        sendMsg() {
            if (this.question === '') {
                this.$message({
                    type: 'warning',
                    message: '请输入消息',
                    duration: 2000,
                });
                return;
            }
            // 关闭点击按钮
            this.lockBtn = true;

            this.msgList.push({
                from: 'person',
                content: this.question,
                loading: false,
            });

            this.msgList.push({
                from: 'ai',
                content: '',
                loading: true,
            });
            this.$refs.bottomEmpty.scrollIntoView({
                behavior: 'smooth',
            });

            this.getGptMsg();
        },
        getKey() {
            this.key = new Date().getTime();
        },
        getGptMsg() {
            axios
                .post('https://cbjtestapi.binjie.site:7777/api/generateStream', {
                    network: true,
                    prompt: this.question,
                    userId: `#/chat/${this.key}`,
                })
                .then(res => {
                    this.msgList[this.msgList.length - 1].content = res.data;
                    this.msgList[this.msgList.length - 1].loading = false;
                })
                .catch(err => {
                    console.log(err);
                    this.msgList[this.msgList.length - 1] = {
                        from: 'ai',
                        content: err,
                        loading: false,
                    };
                    this.$message({
                        type: 'error',
                        message: err,
                        duration: 2000,
                    });
                })
                .finally(() => {
                    // 解锁点击按钮
                    this.lockBtn = false;
                    this.$refs.bottomEmpty.scrollIntoView({
                        behavior: 'smooth',
                    });
                    this.question = '';
                });
        },
        // 重置对话
        resetMsg() {
            this.currentParentId = '';
        },
        // 清空消息记录
        clearMsgRecord() {
            this.msgList = [];
        },
        // 截图保存
        captureImg() {
            if (this.msgList.length == 0) {
                this.$message({
                    type: 'warning',
                    message: '消息记录为空',
                    duration: 2000,
                });
                return;
            }
            const loading = ELEMENT.Loading.service({ fullscreen: true });
            const that = this;
            domtoimage
                .toPng(that.$refs.msgBox)
                .then(function (dataUrl) {
                    loading.close();
                    that.captureUrl = dataUrl;
                    that.captureShow = true;
                })
                .catch(function (error) {
                    loading.close();
                    that.$message({
                        type: 'error',
                        message: error,
                        duration: 2000,
                    });
                });
        },
        // 关闭截图保存
        closeCapture() {
            this.captureShow = false;
            this.captureUrl = '';
        },
        // 开启设置面板
        editSetting() {
            this.settingShow = true;
        },
        // 模式初始化
        initMode() {
            const theme = localStorage.getItem('chatgpt-theme');
            if (theme !== null && theme !== undefined) {
                this.setting.mode = JSON.parse(theme);
                this.changeMode(JSON.parse(theme));
            }
        },
        // 模式切换
        changeMode(type) {
            const keys = Object.keys(this.themes[type]);
            const values = Object.values(this.themes[type]);
            for (let i = 0; i < keys.length; i++) {
                document.documentElement.style.setProperty(keys[i], values[i]);
            }
            localStorage.setItem('chatgpt-theme', type);
        },
    },
});
