// ==UserScript==
// @name         🥇【华医网小助手】全网唯一真实免费|无人值守|自动静音|视频助手|考试助手|不疲劳
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  ❌倍速播放✅视频助手✅屏蔽或者跳过课堂签到、提醒、疲劳✅考试助手（试错算法仅面向可多次提交的考试）✅双模选择：单刷视频or视频+考试。
// @author       三创作者：Mriio   二创作者：境界程序员   原创作者：Dr.S
// @license      AGPL License
// @match        *://*.91huayi.com/course_ware/course_ware_polyv.aspx?*
// @match        *://*.91huayi.com/course_ware/course_ware_cc.aspx*
// @match        *://*.91huayi.com/pages/exam.aspx?*
// @match        *://*.91huayi.com/pages/exam_result.aspx?*
// @match        *://*.91huayi.com/*
// @grant        none
// @run-at      document-start
// @downloadURL https://raw.githubusercontent.com/miiky-nerm/hua-yi-helper/main/%E5%8D%8E%E5%8C%BB%E7%BD%91%E5%B0%8F%E5%8A%A9%E6%89%8B2.0.0.user.js
// @updateURL https://raw.githubusercontent.com/miiky-nerm/hua-yi-helper/main/%E5%8D%8E%E5%8C%BB%E7%BD%91%E5%B0%8F%E5%8A%A9%E6%89%8B2.0.0.user.js
// ==/UserScript==

var newupdate = "2026.6.9 新增课程列表页自动扫描未学习/播放至x%/学习中课程功能，进入课程列表页即自动开始学习。";
//更新历史
//■2026.6.9 新增课程列表页自动扫描功能：在课程列表页(course.aspx/cme.aspx)自动识别"未学习"、"播放至：x%"、"学习中"的课程，按优先级依次点击进入学习，实现从课程列表无人值守自动刷课。
//■2025.6.13 原作者跑路啦，无奈只能我接手更新了，对作者代码还不熟，将就着先用吧。修复了视频自动跳转下一个的问题。
//■2024.8.1网页布局和提示窗改版，调整检测逻辑；既然禁用倍速，不再显示变速按钮；得学分更快的双卫网小助手考试功能已开发完毕，正在优化缩短视频时间，完善后发布，欢迎天使投资人
//■2024.7.16因部分地区考试不用二维码，所以将进入考试的方式回滚到旧版本方便更多人使用，因此可能会导致部分全国通用版的用户依旧偶尔自动进入考试失败，以后再另行观察。感谢大家的意见
//■2024.7.14优化静音时间点；优化更新内容展示；优化播放逻辑，已完成的视频不再引起卡顿
//■2024.7.13优化进入考试的逻辑，不再依赖考试按钮
//■2024.7.11根据用户反馈，增加了登录界面关闭悬浮窗的按钮
//■2024.7.8增加了当前页面是否有对应代码的提示，增加了作者脚本的分享链接
//■2024.6.21智能检测剩余任务，以防有人直接看最后一节课导致脚本发呆
//■2024.6.19新增了从考试结果界面自动返回原课程的功能（官方网站改版，主动删除网页中的继续学习按钮）
//■2024.6.18针对华医网答题模块改版，已更新语法
//■2024.6.7根据赞赏和评论区反馈，修复了一种视频意外暂停的情况
//■2024.6.5增加视频过程中对温馨提示（疲劳）的检测
//■2024.6.3尝试修复CC播放器和保利威播放器加载事件bug
//■2024.4.28由于与用户无法取得联系，在页面上增加了反馈机制的说明
//■2024.4.15修复了不自动切换视频的问题（因网站版本限制，目前脚本倍速已失效）
//■2024.1.11在人脸识别页面增加温馨提醒，考试功能仅为答案遍历，而非自动搜索答案
//■2023.12.25添加了网页静音代码，润物细无声
//■2023.12.24优化了倍速调整的逻辑，无需刷新网页
//■2023.12.21将脚本控制台上移到显眼的位置，方便用户操作；增加生效的倍速按钮变色(删除了原先的文字提醒)
//■2023.12.15新增模式切换，可以选择先单刷视频（无人值守），刷完再打开考试开关，就可以连续考试了
//■2023.12.3优化了视频播放逻辑，能够自动切换下一个视频，而不是播完1个就卡在考试认证处（也导致了不修改代码就无法进入考试）
//■2023.12.1调整默认播放速度5倍（仅首次登录起效，后续以用户更改过的倍速保存），免得用户感觉不到脚本在运行

// ═══════════════════════════════════════════
// 反作弊拦截（document-start阶段执行）
// 必须在页面脚本注册click监听器之前拦截
// ═══════════════════════════════════════════
(function () {
    var _origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (this === document && type === 'click') {
            var listenerStr = String(listener);
            if (listenerStr.indexOf('isTrusted') !== -1 && listenerStr.indexOf('blockAbnormalPlugin') !== -1) {
                console.log('【华医网小助手】已拦截反脚本点击检测监听器');
                return;
            }
        }
        return _origAddEventListener.call(this, type, listener, options);
    };
    var _origSetInterval = window.setInterval;
    window.setInterval = function (callback, delay) {
        var cbStr = String(callback);
        if (cbStr.indexOf('blockAbnormalPlugin') !== -1 && cbStr.indexOf('ratePlayLimitNum') !== -1) {
            console.log('【华医网小助手】已拦截倍速检测定时器');
            return 0;
        }
        return _origSetInterval.apply(this, arguments);
    };
})();

// Wait for DOM ready since @run-at document-start
document.addEventListener('DOMContentLoaded', function () {
(function () {
    'use strict';
    var submitTime = 6100;//交卷时间控制
    var reTryTime = 2100;//重考,视频进入考试延时控制
    var examTime = 10000;//听课完成进入考试延时
    var randomX = 5000;//随机延时上限
    var vSpeed = 1; //首次使用脚本的默认播放速度
    var autoSkip = false; //一个可能会封号的功能。
    //记录字段
    var keyPlayRate = "JJ_Playrate";
    var keyTest = "JJ_Test";
    var keyResult = "JJ_Result";
    var keyThisTitle = "JJ_ThisTitle";
    var keyTestAnswer = "JJ_TestAnswer";
    var keyRightAnswer = "JJ_RightAnswer";
    var keyAllAnswer = "JJ_AllAnswer";
    //按钮样式
    var btstyleB = "font-size: 12px;font-weight: 300;text-decoration: none;text-align: center;line-height: 20px;height: 20px;padding: 0 5px;display: inline-block;appearance: none;cursor: pointer;border: none;box-sizing: border-box;transition-property: all;transition-duration: .3s;background-color: #4cb0f9;border-color: #4cb0f9;border-radius: 4px;margin: 5px;color: #FFF;";
    //页面判别
    var urlInfos = window.location.href.split("/");
    var urlTip = urlInfos[urlInfos.length - 1].split("?")[0];
    var huayi = getHuayi();
    var nspeed = 0;
    var clock = null;
    var clockms = null;       // killsendQuestion3 定时器引用（全局共享）
    var courseFinished = false; // 防止两个检测器重复触发跳转
    var navCooldownUntil = 0;  // 跳转冷却期：此时间戳之前禁止再次跳转
    var _lastCompletedCheck = 0; // debounce：连续两次读到"已完成"才真正触发

    advis();
    document.querySelector("[id='tixing']").innerHTML = "当前网址已适配ヾ(๑╹◡╹)ﾉ&quot<br>失效请赞赏联系&nbsp&nbspε(┬┬﹏┬┬)3";
    if (urlTip == "course_ware_polyv.aspx") { //保利威播放器视频页面
        console.log("当前任务: 华医看视频");
        document.querySelector("div[id='Div1']").style.top = "40px";
        huayi.seeVideo(1);
    } else if (urlTip == "course_ware_cc.aspx") { //CC播放器视频页面
        console.log("当前任务: 华医看视频");
        document.querySelector("div[id='Div1']").style.top = "40px";
        huayi.seeVideo(2);
    } else if (urlTip == "exam.aspx") { //考试页面
        console.log("当前任务: 华医考试");
        huayi.doTest();
    } else if (urlTip == "course.aspx" || urlTip == "cme.aspx") { //课程列表页面
        console.log("当前任务: 课程列表");
        huayi.courseList();
    } else if (urlTip == "exam_result.aspx") { //考试结果页面
        console.log("当前任务: 华医考试结果审核");
        huayi.doResult();
    } else {
        console.log("其它情况");
        var urlInf = window.location.href.split("/");
        var urlErr = urlInf[urlInf.length - 3].split("?")[0];
        if (urlErr == "error.html") {
            setTimeout(function() {
                console.log("网络错误，等待后台数据同步后刷新网页");
                location.reload();
            }, 15000); // 15秒后刷新，确保状态已更新
        } else {
            try {
                document.querySelector("[id='tixing']").innerHTML = "此页面非视频、考试或未适配<br>失效请赞赏联系&nbsp&nbspε(┬┬﹏┬┬)3";
            } catch (error) { };
        };
    };

    // 禁用反作弊检测（覆盖 blockAbnormalPlugin 全局函数，静默所有异常插件提示）
    function killAntiCheat() {
        try {
            if (typeof blockAbnormalPlugin === 'function') {
                window.blockAbnormalPlugin = function() {};
                console.log("【华医网小助手】blockAbnormalPlugin 已覆盖为空函数");
            }
        } catch(e) {}
    }

    function getHuayi() {
        return {
            courseList: function () {
                addAnwserCopybtn();
                DelAllAnwser();

                console.log("【华医网小助手】课程列表页，开始扫描待学习课程...");
                // 延时确保页面完全加载后再扫描
                setTimeout(function() {
                    autoEnterCourse();
                }, 1500);
            },
            seeVideo: function (e) {
                var tr = localStorage.getItem(keyPlayRate);
                //console.log("存储读取" + tr);//读取倍速
                //var playRateNow = tr ? tr : vSpeed;
                var playRateNow = tr ? parseFloat(tr) : vSpeed;
                cleanKeyStorage();

                asynckillsendQuestion();//屏蔽课堂问答的函数；
                killsendQuestion2();//屏蔽课堂问答的函数2；

                killsendQuestion3(); //循环检测问答对话框是否弹出。

                // 倍速按钮和脚本信息已整合到 advis() 面板中
                //速度调节部分

                // 立即应用倍速（不等onload，polyv播放器可能已初始化）
                ratechg(playRateNow);
                console.log("【华医网小助手】已触发倍速设置: " + playRateNow + "x");

                window.onload = function () {
                    localStorage.setItem(keyThisTitle, JSON.stringify(window.document.title));//储存章节标题
                    // console.log("准备激活加速");
                    ratechg(playRateNow);
                    if (autoSkip == true) {//秒过功能，签完别尝试
                        setTimeout(function () {
                            skipVideo();
                        }, (submitTime + Math.ceil(Math.random() * randomX)));
                        console.log("秒过了！");

                    };
                    clock = setInterval(examherftest, 3000);
                    switch (e) {
                        case 1:
                            window.s2j_onPlayerInitOver()
                            {
                                // console.log("polyv加载完毕，静音，稍后尝试触发一次播放");
                                player?.j2s_setVolume(0);
                                document.querySelector("video").defaultMuted = true;
                                setTimeout(function () {
                                    try {
                                        //document.querySelector("video").volume = 0;//实际测试，主要靠这一条静音
                                        player.j2s_resumeVideo();
                                        //document.querySelector("video").muted = true;
                                        examherftest();
                                        //document.querySelector("button[onclick='closeBangZhu()']").click();//关闭温馨提醒
                                    } catch (error) {
                                        console.log("上一段代码有误");
                                    };
                                }, 2000); //延时点击播放，之前是5秒
                            };
                            break;
                        case 2:
                            window.on_CCH5player_ready()
                            {
                                //console.log("CCplayer加载完毕，静音，稍后尝试触发一次播放");
                                cc_js_Player?.setVolume(0);
                                document.querySelector("video").defaultMuted = true;
                                setTimeout(function () {
                                    try {
                                        //document.querySelector("video").volume = 0;//实际测试，主要靠这一条静音
                                        cc_js_Player.play().catch(function() {});
                                        //document.querySelector("video").muted = true;
                                        examherftest();
                                        //document.querySelector("button[onclick='closeBangZhu()']").click();//关闭温馨提醒
                                    } catch (error) {
                                        console.log("上一段代码有误");
                                    };
                                }, 2000); //延时点击播放，之前是5秒
                            };
                            break;
                        default:
                            console.log("其他播放器？");
                    };

                };
            },
            doTest: function () {
                var questions = JSON.parse(localStorage.getItem(keyTest)) || {};
                var qRightAnswer = JSON.parse(localStorage.getItem(keyRightAnswer)) || {};
                if (JSON.stringify(qRightAnswer) == "{}") {
                    qRightAnswer = LoadRightAnwser();
                };
                var qTestAnswer = {};
                var index = 0;

                while (true) {
                    var question = document.querySelectorAll("table[class='tablestyle']")[index];

                    if (question == null) break;
                    else {
                        var q = question.querySelector(".q_name").innerText.substring(2).replace(/\s*/g, "");//问题的具体文本
                        //thisQuestions=thisQuestions+q+"@"

                        if (qRightAnswer.hasOwnProperty(q)) { //当查询到记录了正确答案时的操作

                            //console.log("问题:"+ q + ",有答案:"+ qRightAnswer[q]);
                            var rightSelection = findAnwser("tbody", index, qRightAnswer[q]) //返回答案选项label
                            rightSelection.click();

                        } else {
                            if (questions.hasOwnProperty(q)) {
                                questions[q] = getNextChoice(questions[q]);//通过Unicode数字+1切换到下一个选项，返回的是字母选项
                                //console.log("不知道答案:"+ q+"，测试："+questions[q]);
                            } else { //如果系统没有记录
                                questions[q] = "A";
                            };

                            var answer = getChoiceCode(questions[q]);//将字母选项转换为Unicode数字并减去A代表的65，等于选项顺序，0是第一个选项
                            var element = document.querySelectorAll("tbody")[index].getElementsByTagName("label")[answer];//获取到的是4-5个选项的数组answer等于选项顺序，0是第一个选项
                            //document.querySelector("#gvQuestion_rbl_" + index + "_" + answer + "_" + index);

                            if (!element) { //选项除错机制
                                console.log("找不到选项，选项更改为A index: " + index + " answer: " + answer);
                                questions[q] = "A";
                                answer = getChoiceCode("A");
                                element = document.querySelectorAll("tbody")[index].getElementsByTagName("label")[answer];//获取到的是4-5个选项的数组answer等于选项顺序，0是第一个选项
                                //document.querySelector("#gvQuestion_rbl_" + index + "_" + answer + "_" + index);
                                //localStorage.removeItem(keyTest)
                            };
                            try {
                                var answerText = element.innerText.substring(3);//"A、"占用3个字符
                                //console.log("测试语法:" + (answerText == element.innerText.trim().substring(2)));

                                //element.nextSibling.innerText.trim().substring(2); //获得当前答案文本
                                qTestAnswer[q] = answerText;
                                //console.log("qTestAnswer："+error);
                            } catch (error) { console.log("答案文本获取失败A：" + error); };
                            element.click();
                        };
                        index = index + 1;
                    };
                };

                //存储相关记录

                localStorage.setItem(keyTest, JSON.stringify(questions));
                localStorage.setItem(keyTestAnswer, JSON.stringify(qTestAnswer));

                setTimeout(function () {
                    document.querySelector("#btn_submit").click();
                }, (submitTime + Math.ceil(Math.random() * randomX))); //交卷延时
                ///专用函数区
                function findAnwser(qakey, index, rightAnwserText) {
                    var answerslist = document.querySelectorAll(qakey)[index];
                    var arr = answerslist.getElementsByTagName("label");

                    for (var i = 0; i < arr.length; i++) {
                        //console.log(arr[i].innerText);
                        if (arr[i].innerText.substring(3) == rightAnwserText) {
                            //if (arr[i].innerText.trim().substring(2) == rightAnwserText) {
                            return arr[i];
                        };
                    };
                };

                function getChoiceCode(an) { //用于获取选项字符编码
                    var charin = an || "A";
                    return charin.charCodeAt(0) - "A".charCodeAt(0);

                };

                function getNextChoice(an) { //用于获取下一个选项字符
                    var code = an.charCodeAt(0) + 1;
                    return String.fromCharCode(code);
                };
                ///专用函数区结束
            },
            doResult: function () {
                //var res = document.getElementsByTagName("b")[0].innerText;
                //var dds = document.getElementsByTagName("dd");
                var res = $(".tips_text")[0].innerText;
                var dds = $(".state_cour_lis");
                localStorage.removeItem(keyResult);//移除错题表缓存
                if (res == "考试通过" || res == "考试通过！" || res == "完成项目学习可以申请学分了") { //考试通过
                    console.log("考试通过");
                    //localStorage.setItem(keyResult, "");//记录最后一次答对的题目。
                    saveRightAnwser();//记录最后一次答对的题目。
                    SaveAllAnwser(); //存储所有记录的答案
                    cleanKeyStorage();//如果通过清理答案

                    // var next = document.querySelector('input[class="state_lis_btn"][value="待考试"]');
                    //if (next) {
                    setTimeout(function () {
                        var site = window.location.href;
                        site = site.replace("pages/exam_result.aspx?cwid", "course_ware/course_ware_polyv.aspx?cwid");
                        fetch(site)//测试原来的视频页是否存在
                            .then(response => response ? window.location.href = site : window.location.href = site.replace("pages/exam_result.aspx?cwid", "course_ware/course_ware_cc.aspx?cwid"))
                            .catch(error => console.error('考后回不到视频网址:', error));
                        //next.click();
                    }, 1000);//下一节课延时
                    //};
                } else { //考试没过
                    console.log("考试未通过")
                    document.querySelector("p[class='tips_text']").innerText = "本次未通过，正在尝试更换答案\r\n（此为正常现象，脚本几秒后刷新，请勿操作）"
                    var qWrong = {};
                    for (var i = 0; i < dds.length; ++i) {
                        if (!dds[i].querySelector("img").src.includes("bar_img")) {//这里表示否定
                            qWrong[dds[i].querySelector("p").title.replace(/\s*/g, "")] = i
                        };
                    };

                    if (qWrong != {}) {
                        localStorage.setItem(keyResult, JSON.stringify(qWrong));
                        saveRightAnwser();
                        setTimeout(function () {
                            $("input[type=button][value='重新考试']").click();
                        }, (reTryTime + Math.ceil(Math.random() * randomX)) * 1);

                        //重新考试
                    };
                };

            },
        };
    };

    //---------------------------------全局函数区------------------------------//
    //答案记录函数区开始//
    function SaveAllAnwser() {//保存历史题目答案
        var qAllAnswer = JSON.parse(localStorage.getItem(keyAllAnswer)) || {};
        var qRightAnswer = JSON.parse(localStorage.getItem(keyRightAnswer)) || {};
        var qTitle = JSON.parse(localStorage.getItem(keyThisTitle)) || "没有记录到章节名称";
        var qOldAnswer = qAllAnswer[qTitle] || {};
        for (var q in qRightAnswer) {
            qOldAnswer[q] = qRightAnswer[q];
        };
        qAllAnswer[qTitle] = qOldAnswer;

        if (qAllAnswer != null) {//保存正确答案
            localStorage.setItem(keyAllAnswer, JSON.stringify(qAllAnswer));
        };
    };
    function LoadRightAnwser() {//加载历史题目答案
        var qAllAnswer = JSON.parse(localStorage.getItem(keyAllAnswer)) || {};
        //var qRightAnswer = JSON.parse(localStorage.getItem(keyRightAnswer)) ||{};
        var qTitle = JSON.parse(localStorage.getItem(keyThisTitle)) || "没有记录到章节名称";
        if (qTitle == "没有记录到章节名称") {
            console.log("没找到章节名称");
            return {};
        };
        var qOldAnswer = qAllAnswer[qTitle] || {};
        return qOldAnswer
    };
    function saveRightAnwser() { //记录本次测试到的正确答案

        var qRightAnswer = JSON.parse(localStorage.getItem(keyRightAnswer)) || {};
        var qTestAnswer = JSON.parse(localStorage.getItem(keyTestAnswer)) || {};
        var qkeyTest = JSON.parse(localStorage.getItem(keyTest)) || {};

        //错题表
        var qWrongs = JSON.parse(localStorage.getItem(keyResult)) || {};

        for (var q in qTestAnswer) {
            //debugger;
            var iswrong = false;
            if (!qWrongs.hasOwnProperty(q)) { //当查询到记录了正确答案时的操作
                console.log("正确的题目：" + q + "，答案：" + qTestAnswer[q]);
                qRightAnswer[q] = qTestAnswer[q];
            } else { console.log("错误的题目：" + q + "，答案：" + qTestAnswer[q]); };

        };
        localStorage.removeItem(keyTestAnswer);//清理临时记录
        if (qRightAnswer != null) {//保存正确答案
            localStorage.setItem(keyRightAnswer, JSON.stringify(qRightAnswer));
        };
    };
    //答案记录函数区结束//

    //答案复制相关按钮
    function addAnwserCopybtn() {//插入答案复制按钮
        var mainDiv = document.getElementById("main_div");
        if (!mainDiv) {
            console.log("【华医网小助手】当前页面无 main_div，跳过答案按钮插入");
            return;
        }
        let alink = document.createElement("a");
        alink.innerHTML = '显示已记录答案';
        alink.style = btstyleB;

        alink.onclick = function (event) {
            var qAllAnswer = JSON.parse(localStorage.getItem(keyAllAnswer)) || {};
            var Aout = JSON.stringify(qAllAnswer, null, "\t")
            //Aout=encodeURIComponent(Aout);
            //window.prompt("请复制",Aout);
            if (document.getElementById("AnwserOut")) {
                document.getElementById("AnwserOut").innerHTML = Aout;
            } else {
                let textout = document.createElement("textarea");
                textout.id = "AnwserOut";
                textout.innerHTML = Aout;
                textout.rows = 20;
                textout.cols = 30;
                var mDiv = document.getElementById("main_div");
                if (mDiv) {
                    mDiv.parentNode.append(textout);
                } else {
                    document.body.appendChild(textout);
                }
            };

        };
        mainDiv.parentNode.append(alink);

    };
    function DelAllAnwser() {//插入清除答案按钮
        var mainDiv = document.getElementById("main_div");
        if (!mainDiv) {
            console.log("【华医网小助手】当前页面无 main_div，跳过答案按钮插入");
            return;
        }
        let alink = document.createElement("a");
        alink.innerHTML = '清除已记录答案';
        alink.style = btstyleB;

        alink.onclick = function (event) {

            var r = confirm("确定清除历史答案？!");
            if (r) {
                localStorage.removeItem(keyAllAnswer);
            };
        };
        mainDiv.parentNode.append(alink);
    };
    //答案复制相关按钮 end
    function skipVideo() {//这是跳过视频的代码
        var oVideo = document.getElementsByTagName('video')[0];
        if (oVideo) {
            oVideo.currentTime = oVideo.duration - 1
        };
    };

    function clickexam() { //延时点击考试按钮。
        console.log("已点击考试按钮");
        setTimeout(function () {
            document.querySelector("#jrks").click();
        }, (Math.ceil(Math.random() * randomX)));
        //}, (examTime + Math.ceil(Math.random() * randomX)));
    };
    // addSkipbtn / addratebtn 已移除 —— 倍速按钮已整合到 advis() 面板中
    var _speedCurrentRate = 1;
    var _speedSkipTimer = null;

    function ratechg(ra) {//倍率调整（v4：currentTime跳跃方案，不改playbackRate，避免polyv检测）
        _speedCurrentRate = ra;
        localStorage.setItem(keyPlayRate, ra);
        console.log("【华医网小助手】倍率调整为 " + ra + "x（currentTime跳跃模式）");

        // 清除旧定时器
        clearInterval(nspeed);
        clearInterval(_speedSkipTimer);

        // 如果速度<=1，正常设置playbackRate即可
        if (ra <= 1) {
            var videos = document.querySelectorAll("video");
            for (var i = 0; i < videos.length; i++) {
                try { videos[i].playbackRate = ra; } catch(e) {}
            }
            return;
        }

        // 确保playbackRate为1（不触发polyv限速检测）
        var allVids = document.querySelectorAll("video");
        for (var v = 0; v < allVids.length; v++) {
            try { allVids[v].playbackRate = 1; } catch(e) {}
        }

        // 高速跳跃间隔（每250ms跳一次，更平滑）
        var JUMP_INTERVAL = 250;
        // 每次跳跃额外时间 = (倍速-1) * 间隔秒数
        // 2x: 每250ms额外跳250ms → 每250ms实际前进500ms
        // 3x: 每250ms额外跳500ms → 每250ms实际前进750ms
        var extraPerJump = (ra - 1) * (JUMP_INTERVAL / 1000);

        _speedSkipTimer = setInterval(function () {
            var video = document.querySelector("video");
            if (video && !video.paused && !video.ended) {
                try {
                    var newTime = video.currentTime + extraPerJump;
                    // 不超过视频总时长
                    if (video.duration && newTime < video.duration - 0.5) {
                        video.currentTime = newTime;
                    }
                } catch (e) {}
            }
        }, JUMP_INTERVAL);

        // 同时用nspeed保持playbackRate=1（防止polyv意外修改）
        nspeed = setInterval(function () {
            var videos = document.querySelectorAll("video");
            for (var i = 0; i < videos.length; i++) {
                try {
                    if (videos[i].playbackRate !== 1) {
                        videos[i].playbackRate = 1;
                    }
                } catch (e) {}
            }
        }, 1000);
    };
    // addrateinfo 已移除 —— 速度显示已整合到 advis() 面板

    // addinfo 已移除 —— 模式切换和信息展示已整合到 advis() 面板

    // changelayout 已移除 —— 旧版 jj 面板已被 advis() 取代

    function cleanKeyStorage() {//缓存清理
        localStorage.removeItem(keyTest);
        localStorage.removeItem(keyResult);
        localStorage.removeItem(keyTestAnswer);
        localStorage.removeItem(keyRightAnswer);
    };
    async function examherftest() {//考试按钮激活状态检测
        // 跳转冷却期内或已在处理中，直接跳过
        if (courseFinished || Date.now() < navCooldownUntil) return;

        try {
            var hreftestEl = document.getElementById("jrks");
            var topPlayEls = document.querySelectorAll("i[id='top_play']");
            if (!hreftestEl || !topPlayEls.length) return; // DOM 未就绪，等待下次检测

            var hreftest = hreftestEl.attributes["href"].value;
            var state = topPlayEls[0].parentNode.nextElementSibling.nextElementSibling.nextElementSibling.innerText;

            if (state == "已完成" || hreftest != "#" || (typeof getMaxPlayTime == "function" ? getMaxPlayTime() | 0 : 1) == (typeof player.j2s_getDuration == "function" ? player.j2s_getDuration() | 0 : 0) || (typeof getMaxPlayTime == "function" ? getMaxPlayTime() | 0 : 1) == (typeof player.getDuration == "function" ? player.getDuration() | 0 : 0)) {
                // debounce：需要连续两次检测都确认"已完成"才触发（防止瞬时误判）
                if (state == "已完成" && Date.now() - _lastCompletedCheck > 2000) {
                    _lastCompletedCheck = Date.now();
                    console.log("examherftest: 首次检测到已完成，等待二次确认");
                    return;
                }
                _lastCompletedCheck = 0;

                if (localStorage.getItem("华医mode") == "2" && state == "待考试") {
                    console.log("mode=2,准备进入考试");
                    courseFinished = true;
                    sleep(5000);
                    try {
                        clickexam();
                    } catch (error) {
                        console.log("扫码进入考试");
                        window.open("/pages/exam_tip.aspx?cwrid=" + cwrid, "_self");
                    };
                } else {
                    if (localStorage.getItem("华医mode") == "2") {
                        console.log("mode=2,本节课已完成");
                    } else {
                        console.log("mode=1,课程已学完，准备跳转下一课程 (clock)");
                        courseFinished = true;
                        // 同时停掉 killsendQuestion3 的定时器，避免双重触发
                        if (clockms) { clearInterval(clockms); clockms = null; }
                        playNext();
                    };
                };
                // 跳转后冷却：10秒内禁止再次检测到"已完成"就跳转
                navCooldownUntil = Date.now() + 10000;
            } else {
                _lastCompletedCheck = 0; // 状态变了，重置 debounce
            };
        } catch (err) {
            // DOM 变动中（如页面正在跳转），静默忽略
        };
    };    function sleep(timeout) {
        return new Promise((resolve) => { setTimeout(resolve, timeout); });
    };
    function asynckillsendQuestion() {
        (async function () {
            while (!window.player || !window.player.sendQuestion) {
                await sleep(20);
            };
            //console.log("课堂问答跳过插入");
            player.sendQuestion = function () {
                //console.log("播放器尝试弹出课堂问答，已屏蔽。");
            };
        })();
    };
    function killsendQuestion2() {
        if (typeof (isInteraction) == "undefined") {
            //console.log('变量未定义');
        } else {
            console.log('isInteraction设置off');
            isInteraction = "off";
        };
    };
    async function killsendQuestion3() { //点击跳过按钮版的跳过课堂答题
        // 使用全局 clockms（如果已有旧定时器先清理）
        if (clockms) { clearInterval(clockms); clockms = null; }
        clockms = setInterval(async function () {
            // 跳转冷却期内，跳过视频完成检测（但对话框跳过仍正常执行）
            var inCooldown = Date.now() < navCooldownUntil;

            try {
                if ($('.pv-ask-head').length && $('.pv-ask-head').length > 0) {
                    console.log("检测到问题对话框，尝试跳过");
                    $(".pv-ask-skip").click();
                };
            } catch (err) {
                console.log(err);
            };
            try {
                if ($('.signBtn').length && $('.signBtn').length > 0) {
                    console.log("检测到签到对话框，尝试跳过");
                    $(".signBtn").click();
                };
            } catch (err) {
                console.log(err);
            };
            try {
                if ($("button[onclick='closeProcessbarTip()']").length && $("button[onclick='closeProcessbarTip()']").length > 0 && $("div[id='div_processbar_tip']").css("display") == "block") {
                    console.log("检测到温馨提示对话框（不能拖拽），尝试跳过");
                    $("button[onclick='closeProcessbarTip()']").click();
                };
            } catch (err) {
                console.log(err);
            };
            try {
                if ($("button[class='btn_sign']").length && $("button[class='btn_sign']").length > 0) {
                    console.log("检测到温馨提示对话框（疲劳提醒），尝试跳过");
                    $("button[class='btn_sign']").click();
                };
            } catch (err) {
                console.log(err);
            };
            try {
                var topPlay = document.querySelectorAll("i[id='top_play']");
                if (!topPlay.length) return; // DOM 未就绪
                var state = topPlay[0].parentNode.nextElementSibling.nextElementSibling.nextElementSibling.innerText;
                if ($('video').prop('paused') == true && state != "已完成" && state != "待考试") {
                    console.log("视频意外暂停，恢复播放");
                    $('video').get(0).play().catch(function() {});
                    $('video').prop('volume', 0);
                    $('video').prop('muted', true);
                } else if ((state == "已完成" || state == "待考试") && !inCooldown) {
                    if (courseFinished) return; // 已在处理中，跳过重复触发
                    courseFinished = true;
                    clearInterval(clockms);
                    clockms = null;
                    // 同时停掉 clock（examherftest）
                    if (clock) { clearInterval(clock); clock = null; }
                    try { document.querySelector("video").pause(); } catch(e) {}
                    console.log("当前课程已学完，进入下一课程 (clockms)");
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    playNext();
                };
            } catch (err) {
                // DOM 变动中，静默忽略
            };
        }, 2000);
    };    function advis() {
        var div1 = document.createElement("div");
        var currentMode = localStorage.getItem("华医mode");
        var modeIsExam = (currentMode == 2);
        var modeLabel = modeIsExam ? "视频+考试" : "单刷视频";
        var modeColor = modeIsExam ? "#e8f5e9" : "#f0f7ff";
        var modeBorder = modeIsExam ? "#a5d6a7" : "#d0e4f7";
        var modeTextColor = modeIsExam ? "#2e7d32" : "#1976d2";
        div1.innerHTML = `
    <div id='Div1' style="
        width: 240px;
        font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
        font-size: 14px;
        position: fixed;
        top: 180px;
        left: 40px;
        z-index: 99999;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        overflow: hidden;
    ">
        <div style="
            background: linear-gradient(135deg, #4cb0f9, #3a8fd4);
            color: #fff;
            padding: 12px 16px;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <span>华医网小助手 v`+ GM_info['script']['version'] + `</span>
            <span id='clo' style="cursor:pointer;font-size:18px;line-height:1;opacity:0.85;" title="关闭面板">×</span>
        </div>
        <div style="padding: 14px 16px;">
            <div id="tixing" style="
                font-size: 13px;
                color: #666;
                line-height: 1.6;
                padding: 8px 12px;
                background: #f5f7fa;
                border-radius: 4px;
                margin-bottom: 10px;
            ">当前页面无代码！！！</div>
            <div id="modeSection" style="
                font-size: 13px;
                color: #333;
                line-height: 1.6;
                padding: 10px 12px;
                background: `+ modeColor + `;
                border-radius: 4px;
                border: 1px solid `+ modeBorder + `;
                margin-bottom: 10px;
            ">
                <div style="font-weight:bold;margin-bottom:6px;color:#555;">当前模式</div>
                <div id="modeLabel" style="
                    display: inline-block;
                    padding: 5px 16px;
                    border-radius: 14px;
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                    user-select: none;
                    background: `+ modeTextColor + `;
                    color: #fff;
                ">`+ modeLabel + `</div>
                <div style="font-size:11px;color:#999;margin-top:4px;">点击按钮切换模式</div>
                <div style="font-size:11px;color:#999;margin-top:2px;">'默认1x，建议2x以内'</div>
            </div>
            <div id="speedSection" style="
                font-size: 13px;
                color: #333;
                line-height: 1.6;
                padding: 10px 12px;
                background: #fafafa;
                border-radius: 4px;
                border: 1px solid #e8e8e8;
                margin-bottom: 10px;
            ">
                <div style="font-weight:bold;margin-bottom:6px;color:#555;">播放速度</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    <span class="speedBtn" data-rate="1" style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;background:#1976d2;color:#fff;user-select:none;">1x</span>
                    <span class="speedBtn" data-rate="1.5" style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;background:#e0e0e0;color:#555;user-select:none;">1.5x</span>
                    <span class="speedBtn" data-rate="2" style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;background:#e0e0e0;color:#555;user-select:none;">2x</span>
                    <span class="speedBtn" data-rate="3" style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;cursor:pointer;background:#e0e0e0;color:#555;user-select:none;">3x</span>
                </div>
            </div>
            <div id='update' style="
                font-size: 12px;
                color: #999;
                line-height: 1.5;
                border-top: 1px solid #eee;
                padding-top: 10px;
            ">
                <span style="color:#666;font-weight:bold;">更新记录</span><br>
                `+ newupdate + `
            </div>
        </div>
    </div>`;
        if (document.body) { document.body.append(div1); } else { document.addEventListener("DOMContentLoaded", function() { document.body.append(div1); }); }

        // 关闭按钮
        var clo = document.querySelector("span[id='clo']");
        if (clo) {
            clo.onclick = function () {
                var panel = document.querySelector("div[id='Div1']");
                if (panel) panel.style.display = "none";
            };
        }

        // 模式切换按钮
        var modeLabelEl = document.querySelector("#modeLabel");
        if (modeLabelEl) {
            modeLabelEl.onclick = function () {
                var current = localStorage.getItem("华医mode");
                if (current == 2) {
                    localStorage.setItem("华医mode", "1");
                    modeLabelEl.innerText = "单刷视频";
                    modeLabelEl.style.background = "#1976d2";
                    var sec = document.querySelector("#modeSection");
                    if (sec) { sec.style.background = "#f0f7ff"; sec.style.borderColor = "#d0e4f7"; }
                    console.log("【华医网小助手】已切换为单刷视频模式");
                } else {
                    localStorage.setItem("华医mode", "2");
                    modeLabelEl.innerText = "视频+考试";
                    modeLabelEl.style.background = "#2e7d32";
                    var sec = document.querySelector("#modeSection");
                    if (sec) { sec.style.background = "#e8f5e9"; sec.style.borderColor = "#a5d6a7"; }
                    console.log("【华医网小助手】已切换为视频+考试模式");
                }
            };
        }

        // 倍速按钮事件
        var speedBtns = document.querySelectorAll(".speedBtn");
        var savedSpeed = parseFloat(localStorage.getItem(keyPlayRate)) || 1;
        for (var s = 0; s < speedBtns.length; s++) {
            (function (btn) {
                var rate = parseFloat(btn.getAttribute("data-rate"));
                // 高亮已保存的速度
                if (Math.abs(rate - savedSpeed) < 0.01) {
                    btn.style.background = "#1976d2";
                    btn.style.color = "#fff";
                }
                btn.onclick = function () {
                    // 重置所有按钮样式
                    var allBtns = document.querySelectorAll(".speedBtn");
                    for (var a = 0; a < allBtns.length; a++) {
                        allBtns[a].style.background = "#e0e0e0";
                        allBtns[a].style.color = "#555";
                    }
                    // 高亮当前按钮
                    btn.style.background = "#1976d2";
                    btn.style.color = "#fff";
                    // 应用倍速
                    ratechg(rate);
                };
            })(speedBtns[s]);
        }
    };

    var playNextRunning = false; // 防止并发调用
    async function playNext() {
        if (playNextRunning) {
            console.log("playNext 已在执行中，跳过");
            return;
        }
        playNextRunning = true;

        // 跳转前：停掉两个检测定时器，设置冷却期，防止页面切换期间误判
        if (clock) { clearInterval(clock); clock = null; }
        if (clockms) { clearInterval(clockms); clockms = null; }
        navCooldownUntil = Date.now() + 15000; // 15秒冷却，确保新页面完全加载

        try {
            //自动播放下一个视频的逻辑
            const targetElements = document.querySelectorAll("i[id='top_play']");
            if (targetElements.length === 0) {
                console.log("未找到当前播放位置标记，尝试按钮方式跳转");
                fallbackToNextCourse();
                return;
            }
            const parentElement = targetElements[0].parentElement;
            const grandparentElement = parentElement.parentElement;

            const lis = document.querySelectorAll("li[class='lis-inside-content']");
            var index = Array.from(lis).findIndex(li => li === grandparentElement);//找出当前页面是第几个课程
            console.log("当前视频索引: " + index + ", 总课程数: " + lis.length);
            // 修复：index 为 -1 时说明找不到当前元素，应走 fallback
            if (index >= 0 && index + 2 <= lis.length) {
                index += 2;
                console.log("跳转到第 " + index + " 个课程");
                document.querySelector("#top_body > div.video-container > div.page-container > div.page-content > ul > li:nth-child(" + index + ") > h2").click();
                setTimeout(function () {
                    try {
                        document.evaluate("//button[contains(., '知道了')]", document, null, XPathResult.ANY_TYPE).iterateNext().click();
                    } catch (err) {
                        console.log("未找到弹窗");
                    };
                }, 2000);
            } else {
                console.log("侧边栏已无更多视频（index=" + index + "），尝试跳转到下一课程");
                fallbackToNextCourse();
            }
        } finally {
            // 等待页面完成跳转，然后重新启动检测
            await new Promise(resolve => setTimeout(resolve, 5000));
            courseFinished = false;
            playNextRunning = false;
            // 注意：clock 在 seeVideo 初始化中通过 onload 重新设置
            // clockms 在 killsendQuestion3 中重新创建（由 seeVideo 调用）
        }
    };    // 从 playNext 中抽出的 fallback 逻辑：查找并点击未学习/学习中/待考试的课程
    function fallbackToNextCourse() {
        if ($('button:contains("未学习")').length > 0) {
            console.log("找到未学习课程，开始学习");
            $('button:contains("未学习")').siblings().eq(0).click();
        } else if ($('button:contains("学习中")').length > 0) {
            console.log("找到学习中课程，继续学习");
            $('button:contains("学习中")').siblings().eq(0).click();
        } else if ($('button:contains("待考试")').length > 0 && localStorage.getItem("华医mode") == "2") {
            console.log("找到待考试课程，进入考试");
            $('button:contains("待考试")').siblings().eq(0).click();
        } else {
            console.log('没有找到任何待处理按钮，可能全部已完成');
                        if (clock) { clearInterval(clock); clock = null; }
            if (clockms) { clearInterval(clockms); clockms = null; }
        }
    }

    // 课程列表页：自动扫描并进入待学习课程
    function autoEnterCourse() {
        console.log("【华医网小助手】自动扫描课程列表中...");

        // 辅助函数：查找与状态元素关联的课程链接
        function findAssociatedLink(el) {
            // 策略1：检查元素自身是否是链接
            if (el.tagName === 'A' && el.href) return el;

            // 策略2：在兄弟元素中查找链接（匹配 playNext 中的模式）
            var siblings = el.parentElement ? el.parentElement.children : [];
            for (var i = 0; i < siblings.length; i++) {
                if (siblings[i] !== el) {
                    if (siblings[i].tagName === 'A' && siblings[i].href) return siblings[i];
                    var childLink = siblings[i].querySelector ? siblings[i].querySelector('a[href]') : null;
                    if (childLink) return childLink;
                }
            }

            // 策略3：向上查找最近的行/卡片，然后找其中的第一个链接
            var row = el.closest ? el.closest('tr, .course-item, .list-item, li, .card, [class*="course"], [class*="item"]') : null;
            if (row) {
                var rowLink = row.querySelector('a[href]');
                if (rowLink) return rowLink;
            }

            // 策略4：在父元素中查找链接
            if (el.parentElement) {
                var parentLink = el.parentElement.querySelector('a[href]');
                if (parentLink) return parentLink;
                // 再上一级
                if (el.parentElement.parentElement) {
                    var grandLink = el.parentElement.parentElement.querySelector('a[href]');
                    if (grandLink) return grandLink;
                }
            }

            // 策略5：jQuery 兄弟查找（匹配 playNext 模式：直接点击兄弟元素）
            try {
                var $el = $(el);
                // 优先找 <a> 兄弟
                var $sib = $el.siblings('a').eq(0);
                if ($sib.length) return $sib[0];
                // 任意兄弟（playNext 就是直接 click 兄弟）
                $sib = $el.siblings().eq(0);
                if ($sib.length) {
                    // 兄弟本身就是可点元素
                    if ($sib.is('a, button, input[type="button"]')) return $sib[0];
                    // 兄弟内部有链接
                    var $child = $sib.find('a').eq(0);
                    if ($child.length) return $child[0];
                    // 兄弟自身也可返回（可能有 onclick 处理）
                    return $sib[0];
                }
                // 也尝试查找父元素的兄弟
                var $parentSib = $el.parent().siblings().eq(0);
                if ($parentSib.length) {
                    var $link = $parentSib.is('a') ? $parentSib : $parentSib.find('a').eq(0);
                    if ($link.length) return $link[0];
                    return $parentSib[0];
                }
            } catch(e) {}

            return null;
        }

        // 辅助函数：执行点击
        function tryClickCourse(statusEl, description) {
            var link = findAssociatedLink(statusEl);
            if (link) {
                console.log("✅ 【华医网小助手】" + description + "，开始学习：" + (link.textContent || link.innerText || "").trim());
                link.click();
                return true;
            }
            return false;
        }

        var clicked = false;

        // ========== 第1优先级：查找"未学习"的课程 ==========
        console.log("  → 查找【未学习】课程...");
        var allElements = document.querySelectorAll('button, input[type="button"], span, div, a.btn, td, font');
        for (var i = 0; i < allElements.length; i++) {
            var el = allElements[i];
            var text = (el.textContent || el.value || el.innerText || '').trim();
            // 精确匹配 "未学习"（排除包含其他文字的干扰）
            if (text === '未学习' || text.indexOf('未学习') === 0) {
                if (tryClickCourse(el, '找到【未学习】课程')) {
                    clicked = true;
                    break;
                }
            }
        }

        // ========== 第2优先级：查找"播放至：x%"的课程（x < 100） ==========
        if (!clicked) {
            console.log("  → 查找【播放至：x%】未完成课程...");
            var allElems = document.querySelectorAll('*');
            for (var j = 0; j < allElems.length; j++) {
                var elem = allElems[j];
                // 只在叶子节点（无子元素）查找，避免重复匹配
                if (elem.children.length === 0) {
                    var txt = elem.textContent || '';
                    var match = txt.match(/播放至[：:]\s*(\d+)\s*%/);
                    if (match) {
                        var progress = parseInt(match[1]);
                        if (progress < 100) {
                            if (tryClickCourse(elem, '找到未完成课程（播放至' + progress + '%）')) {
                                clicked = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        // ========== 第3优先级：查找"学习中"的课程 ==========
        if (!clicked) {
            console.log("  → 查找【学习中】课程...");
            for (var k = 0; k < allElements.length; k++) {
                var el2 = allElements[k];
                var text2 = (el2.textContent || el2.value || '').trim();
                if (text2 === '学习中' || text2.indexOf('学习中') === 0) {
                    if (tryClickCourse(el2, '找到【学习中】课程')) {
                        clicked = true;
                        break;
                    }
                }
            }
        }

        // ========== 第4优先级：查找"待考试"的课程（仅在视频+考试模式下） ==========
        if (!clicked) {
            var mode = localStorage.getItem("华医mode");
            if (mode == 2) {
                console.log("  → 查找【待考试】课程（视频+考试模式）...");
                for (var l = 0; l < allElements.length; l++) {
                    var el3 = allElements[l];
                    var text3 = (el3.textContent || el3.value || '').trim();
                    if (text3 === '待考试' || text3.indexOf('待考试') === 0) {
                        if (tryClickCourse(el3, '找到【待考试】课程')) {
                            clicked = true;
                            break;
                        }
                    }
                }
            } else {
                console.log("  → 跳过【待考试】（当前为单刷视频模式）");
            }
        }

        // ========== 第5优先级：宽松查找——找含有课程链接的可点击区域 ==========
        if (!clicked) {
            console.log("  → 宽松模式：遍历查找可用的课程链接...");
            // 尝试在"课程学习与考试"区域内查找
            var sections = document.querySelectorAll('*');
            var targetSection = null;
            for (var m = 0; m < sections.length; m++) {
                if (sections[m].children.length > 0 &&
                    (sections[m].textContent || '').indexOf('课程学习与考试') !== -1 &&
                    sections[m].children.length <= 15) {
                    targetSection = sections[m];
                    break;
                }
            }

            var searchScope = targetSection || document.body;
            var statusBtns = searchScope.querySelectorAll('button, input[type="button"]');
            for (var n = 0; n < statusBtns.length; n++) {
                var btnText = (statusBtns[n].textContent || statusBtns[n].value || '').trim();
                // 排除"已完成"
                if (btnText && btnText !== '已完成' && btnText.indexOf('已完成') === -1) {
                    if (tryClickCourse(statusBtns[n], '宽松匹配到课程（状态：' + btnText + '）')) {
                        clicked = true;
                        break;
                    }
                }
            }

            // 如果还没找到，直接找"课程学习与考试"区域内的第一个链接
            if (!clicked && targetSection) {
                var firstLink = targetSection.querySelector('a[href]');
                if (firstLink && firstLink.href && firstLink.href.indexOf('javascript:') === -1) {
                    console.log("✅ 【华医网小助手】在课程学习与考试区域找到课程链接，尝试进入");
                    firstLink.click();
                    clicked = true;
                }
            }
        }

        if (!clicked) {
            console.log("📋 【华医网小助手】未找到需要学习的课程。可能全部已完成，或页面结构已变更。");
            console.log("   提示：如页面有未学习课程但脚本未识别，请在Greasyfork反馈区留言。");
        }
    }

    //---------------------------------全局函数区end------------------------------//

})()
}); // DOMContentLoaded wrapper;
// DOMContentLoaded wrapper end
