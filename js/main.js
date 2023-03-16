new Vue({
    el: '#app',
    data: function () {
        return {
            question: '',
            msgList: [],
            lockBtn: false,
            currentParentId: '',
            options: {},
            continueTalk: true,
            captureShow: false,
            captureUrl: '',
        };
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
                id: 'person:' + new Date().getTime(),
                from: 'person',
                content: this.question,
                loading: false,
            });

            this.msgList.push({
                id: 'ai:' + new Date().getTime(),
                from: 'ai',
                content: '',
                loading: true,
            });
            this.$refs.bottomEmpty.scrollIntoView({
                behavior: 'smooth',
            });
            // 关闭连续对话
            if (!this.continueTalk) {
                this.currentParentId = '';
            }
            if (this.currentParentId) {
                this.options = {
                    parentMessageId: this.currentParentId,
                };
            } else {
                this.options = {};
            }

            this.getGptMsg();
        },
        getGptMsg() {
            axios
                .post('http://43.154.144.239:3002/api/chat-process', {
                    options: this.options,
                    prompt: this.question,
                })
                .then(res => {
                    if (res.data) {
                        if (res.data.code == 204) {
                            this.msgList[this.msgList.length - 1] = {
                                id: this.currentParentId,
                                from: 'ai',
                                content: '每日免费50次，免费次数已用完',
                                loading: false,
                            };
                            this.$message({
                                type: 'error',
                                message: '每日免费50次，免费次数已用完',
                                duration: 2000,
                            });
                            return;
                        }
                        let result = '';
                        if (res.data.id) {
                            result = res.data.text;
                            this.currentParentId = res.data.id;
                        } else {
                            let arr = res.data.split('\n');
                            result = JSON.parse(arr[arr.length - 1]).text;
                            this.currentParentId = JSON.parse(arr[arr.length - 1]).id;
                        }
                        this.msgList[this.msgList.length - 1].id = this.currentParentId;
                        this.msgList[this.msgList.length - 1].content = result;
                        this.msgList[this.msgList.length - 1].loading = false;
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.msgList[this.msgList.length - 1] = {
                        id: this.currentParentId,
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
            const that = this;
            domtoimage
                .toPng(that.$refs.msgBox)
                .then(function (dataUrl) {
                    console.log(dataUrl);
                    that.captureUrl = dataUrl;
                    that.captureShow = true;
                })
                .catch(function (error) {
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
    },
});
