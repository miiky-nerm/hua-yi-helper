// ==UserScript==
// @name         🥇【华医网小助手】全网唯一真实免费|无人值守|自动静音|视频助手|考试助手|不疲劳
// @namespace    http://tampermonkey.net/
// @version      2.0.2
// @author       三创作者：Mriio   二创作者：境界程序员   原创作者：Dr.S
// @license      AGPL License
// @match        *://*.91huayi.com/course_ware/course_ware_polyv.aspx?*
// @match        *://*.91huayi.com/course_ware/course_ware_cc.aspx*
// @match        *://*.91huayi.com/pages/exam.aspx?*
// @match        *://*.91huayi.com/pages/exam_result.aspx?*
// @match        *://*.91huayi.com/*
// @grant        none
// @run-at      document-start
// @downloadURL https://raw.githubusercontent.com/miiky-nerm/hua-yi-helper/main/hua-yi-helper.user.js
// @updateURL https://raw.githubusercontent.com/miiky-nerm/hua-yi-helper/main/hua-yi-helper.user.js
// ==/UserScript==

var newupdate = "2026.6.10 新增暂停刷新跳转功能：视频暂停后等3秒刷新页面，若状态为已完成/待考试则自动搜索下一未学习/学习中课程继续学习。";
//更新历史
//■2026.6.10 新增暂停刷新跳转功能：视频暂停后等3秒刷新页面，若状态为已完成/待考试则自动搜索下一未学习/学习中课程
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
    // 【核心修复】最早时机：在页面任何脚本执行前，立即将 blockAbnormalPlugin 覆盖为空函数
    // 这是最关键的一步，必须在页面定义/调用它之前完成
    try {
        window.blockAbnormalPlugin = function() {};
        console.log('【华医网小助手】已抢先覆盖 blockAbnormalPlugin');
    } catch(e) {}

    // 【核心修复】拦截 Object.defineProperty，防止页面用不可配置方式重新定义 blockAbnormalPlugin
    var _origDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
        if (obj === window && prop === 'blockAbnormalPlugin') {
            console.log('【华医网小助手】已拦截 blockAbnormalPlugin 的 Object.defineProperty 重定义');
            return window;
        }
        return _origDefineProperty.apply(this, arguments);
    };

    // 拦截 addEventListener：扩大拦截范围，所有在 document 上检查 isTrusted 的 click 监听器一律拦截
    var _origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
        // 拦截 contextmenu 事件监听，防止考试页面禁用右键
        if (type === 'contextmenu') {
            console.log('【华医网小助手】已拦截右键屏蔽监听器');
            return;
        }
        if (this === document && type === 'click') {
            var listenerStr = String(listener);
            // 扩大拦截：只要是检查 isTrusted 的 click 监听器都拦截（不限于 blockAbnormalPlugin）
            if (listenerStr.indexOf('isTrusted') !== -1) {
                console.log('【华医网小助手】已拦截反脚本点击检测监听器');
                return;
            }
        }
        return _origAddEventListener.call(this, type, listener, options);
    };

    // 拦截 setInterval：阻止倍速检测定时器
    var _origSetInterval = window.setInterval;
    window.setInterval = function (callback, delay) {
        var cbStr = String(callback);
        if (cbStr.indexOf('blockAbnormalPlugin') !== -1 && cbStr.indexOf('ratePlayLimitNum') !== -1) {
            console.log('【华医网小助手】已拦截倍速检测定时器');
            return 0;
        }
        return _origSetInterval.apply(this, arguments);
    };

    // 【新增】拦截 setTimeout：同样可能有反脚本检测延时器
    var _origSetTimeout = window.setTimeout;
    window.setTimeout = function (callback, delay) {
        var cbStr = String(callback);
        if (cbStr.indexOf('blockAbnormalPlugin') !== -1) {
            console.log('【华医网小助手】已拦截反脚本 setTimeout');
            return 0;
        }
        return _origSetTimeout.apply(this, arguments);
    };

    // Body 出现时立即清除页面限制（比 DOMContentLoaded 更早）
    if (typeof MutationObserver !== 'undefined') {
        var _bodyObserver = new MutationObserver(function(mutations, obs) {
            if (document.body) {
                obs.disconnect();
                try {
                    document.body.removeAttribute('oncontextmenu');
                    document.body.removeAttribute('oncopy');
                    document.body.removeAttribute('onbeforecopy');
                    document.body.removeAttribute('onhelp');
                    document.body.oncontextmenu = null;
                    document.body.oncopy = null;
                    document.body.onbeforecopy = null;
                    document.body.onhelp = null;
                    document.oncontextmenu = null;
                } catch(e) {}
            }
        });
        _bodyObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
})();

// Wait for DOM ready since @run-at document-start
document.addEventListener('DOMContentLoaded', function () {
(function () {
    'use strict';

    // 清除页面内联的右键/复制/帮助限制（考试页面会设置这些属性）
    (function cleanupBodyRestrictions() {
        try {
            var body = document.body;
            if (!body) return;
            body.removeAttribute('oncontextmenu');
            body.removeAttribute('oncopy');
            body.removeAttribute('onbeforecopy');
            body.removeAttribute('onhelp');
            body.oncontextmenu = null;
            body.oncopy = null;
            body.onbeforecopy = null;
            body.onhelp = null;
            // 同时移除 document 级别的右键限制
            document.oncontextmenu = null;
            console.log('【华医网小助手】已清除页面右键/复制限制');
        } catch(e) {}
    })();

    var submitTime = 4900;//交卷时间控制
    var reTryTime = 2100;//重考,视频进入考试延时控制
    var examTime = 5000;//听课完成进入考试延时
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
        // 再次确保清理 body 限制
        (function() {
            try {
                var body = document.body;
                if (body) {
                    body.removeAttribute('oncontextmenu');
                    body.removeAttribute('oncopy');
                    body.removeAttribute('onbeforecopy');
                    body.removeAttribute('onhelp');
                    body.oncontextmenu = null;
                }
                document.oncontextmenu = null;
            } catch(e) {}
        })();
        // 如果 DOMContentLoaded 阶段题目还未加载，轮询等待
        var examRetry = 0;
        function tryDoTest() {
            var questions = document.querySelectorAll("table.tablestyle");
            if (questions.length > 0) {
                console.log("【华医网小助手】考试题目已加载，开始答题");
                huayi.doTest();
            } else if (examRetry < 30) {
                examRetry++;
                setTimeout(tryDoTest, 500);
            } else {
                console.log("【华医网小助手】考试题目加载超时，强制尝试");
                huayi.doTest();
            }
        }
        tryDoTest();
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
        // 清除 body 上的右键/复制/帮助限制（考试页面 via 内联属性）
        try {
            var body = document.body;
            if (body) {
                body.removeAttribute('oncontextmenu');
                body.removeAttribute('oncopy');
                body.removeAttribute('onbeforecopy');
                body.removeAttribute('onhelp');
                body.oncontextmenu = null;
                body.oncopy = null;
                body.onbeforecopy = null;
                body.onhelp = null;
            }
            document.oncontextmenu = null;
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


                // 【新增】刷新后检查：如果由暂停刷新触发，扫描侧边栏状态，已完成/待考试则跳转下一课程
                (function() {
                    var skipDone = sessionStorage.getItem("hua_yi_post_refresh");
                    if (skipDone) {
                        sessionStorage.removeItem("hua_yi_post_refresh");
                        // 立即阻止检测循环再次触发刷新，防止死循环
                        courseFinished = true;
                        navCooldownUntil = Date.now() + 60000;
                        console.log("【华医网小助手】刷新后检测到标记，检查当前课程状态...");
                        setTimeout(function() {
                            try {
                                var state = getCurrentCourseState();
                                if (state) {
                                    console.log("【华医网小助手】刷新后课程状态: " + state);
                                    if (state == "已完成" || state == "待考试") {
                                        console.log("【华医网小助手】确认课程已" + state + "，搜索下一个未学习/学习中课程...");
                                        var lis = document.querySelectorAll("li.lis-inside-content");
                                        var found = false;
                                        for (var i = 0; i < lis.length; i++) {
                                            var status = getCourseStatus(lis[i]);
                                            if (status === "未学习" || status === "学习中") {
                                                console.log("【华医网小助手】找到课程（" + status + "），开始学习");
                                                var targetLi = lis[i];
                                                var navigated = false;
                                                var onclickAttr = targetLi.getAttribute("onclick") || "";
                                                var urlMatch = onclickAttr.match(/location\.href=["\u0027]([^"\u0027]+)["\u0027]/);
                                                if (urlMatch && urlMatch[1]) {
                                                    window.location.href = urlMatch[1];
                                                    navigated = true;
                                                }
                                                if (!navigated) {
                                                    var h2 = targetLi.querySelector("h2");
                                                    if (h2) { h2.click(); navigated = true; }
                                                }
                                                if (!navigated) { targetLi.click(); }
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            console.log("【华医网小助手】未找到未学习或学习中课程，可能全部已完成");
                                        }
                                    } else {
                                        console.log("【华医网小助手】课程状态为" + state + "，继续正常播放");
                                    }
                                }
                            } catch(e) {
                                console.log("【华医网小助手】刷新后状态检查出错: " + e);
                            }
                        }, 2000);
                    }
                })();
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
                            var rightSelection = findAnwser("tbody", index, qRightAnswer[q]); //返回答案选项label
                            if (rightSelection) {
                                rightSelection.click();
                            } else {
                                // 找不到匹配答案（可能题目文本已变化），回退到猜测模式
                                console.log("已知答案匹配失败，回退猜测: " + q);
                                if (questions.hasOwnProperty(q)) {
                                    questions[q] = getNextChoice(questions[q]);
                                } else {
                                    questions[q] = "A";
                                };
                                var answer = getChoiceCode(questions[q]);
                                var element = document.querySelectorAll("tbody")[index].getElementsByTagName("label")[answer];
                                if (!element) {
                                    console.log("找不到选项，选项更改为A index: " + index + " answer: " + answer);
                                    questions[q] = "A";
                                    answer = getChoiceCode("A");
                                    element = document.querySelectorAll("tbody")[index].getElementsByTagName("label")[answer];
                                };
                                try {
                                    var answerText = element.innerText.substring(3);
                                    qTestAnswer[q] = answerText;
                                } catch (error) { console.log("答案文本获取失败A：" + error); };
                                element.click();
                            };

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
                    saveRightAnwser();//记录最后一次答对的题目。
                    SaveAllAnwser(); //存储所有记录的答案
                    cleanKeyStorage();//如果通过清理答案

                    // 考试通过后：在结果页查找下一个待考试课程，通过其标题构造跳转
                    setTimeout(function () {
                        var found = false;
                        // 考试结果页的结构：li.state_cour_lis > p.state_lis_text[title] + input.state_lis_btn[value]
                        var courLis = document.querySelectorAll("li.state_cour_lis");
                        for (var i = 0; i < courLis.length; i++) {
                            var btn = courLis[i].querySelector('input.state_lis_btn');
                            var status = btn ? btn.value : "";
                            if (status === "待考试") {
                                var titleEl = courLis[i].querySelector("p.state_lis_text");
                                var title = titleEl ? (titleEl.getAttribute("title") || titleEl.innerText) : "";
                                console.log("【华医网小助手】考试通过，找到待考试课程：" + title + "，返回课程列表自动进入");
                                found = true;
                                break;
                            }
                        }
                        // 无论是否找到下一个待考试，都回到课程列表页让 auto-scan 处理
                        // 因为结果页的按钮没有导航功能，需要回到课程页/列表页
                        if (found) {
                            console.log("【华医网小助手】返回课程列表页，自动扫描将处理下一课程");
                        } else {
                            console.log("【华医网小助手】未找到待考试课程，返回课程列表页");
                        }
                        // 直接导航到课程列表页（cme.aspx），脚本的 auto-scan 会自动找下一个待学习课程
                        window.location.href = window.location.origin + "/pages/cme.aspx";
                    }, 1000);
                } else { //考试没过
                    console.log("考试未通过")
                    document.querySelector("p[class='tips_text']").innerText = "本次未通过，正在尝试更换答案\r\n（此为正常现象，脚本几秒后刷新，请勿操作）"
                    var qWrong = {};
                    for (var i = 0; i < dds.length; ++i) {
                        var imgEl = dds[i].querySelector("img");
                        var pEl = dds[i].querySelector("p");
                        if (!imgEl || !pEl) continue;
                        if (!imgEl.src.includes("bar_img")) {//这里表示否定
                            // 与 doTest() 保持一致的文本提取：去掉前2字符（如"1、"）再移除空白
                            var wrongQ = pEl.title;
                            // title 可能包含"1、问题文本"格式，统一去掉前缀序号
                            wrongQ = wrongQ.replace(/^\d+[、.，,]\s*/, "").replace(/\s*/g, "");
                            qWrong[wrongQ] = i;
                        };
                    };

                    if (Object.keys(qWrong).length > 0) {
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

    function clickexam() { //延时点击考试按钮（先激活播放器再点，否则按钮不可点击）
        console.log("准备进入考试，先激活播放器...");
        // 华医网进入考试按钮需要播放器处于播放状态才可点击，先触发播放
        try {
            var video = document.querySelector("video");
            if (video) {
                video.muted = true;
                video.volume = 0;
                video.play().catch(function() {});
            }
            // polyv播放器
            if (typeof player !== "undefined" && player && typeof player.j2s_resumeVideo === "function") {
                player.j2s_resumeVideo();
            }
            // cc播放器
            if (typeof cc_js_Player !== "undefined" && cc_js_Player && typeof cc_js_Player.play === "function") {
                cc_js_Player.play().catch(function() {});
            }
        } catch(e) {
            console.log("激活播放器失败: " + e);
        }
        // 等待播放器激活后点击考试按钮
        setTimeout(function () {
            console.log("已点击考试按钮");
            document.querySelector("#jrks").click();
        }, (2000 + Math.ceil(Math.random() * 2000)));
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
            if (!hreftestEl) return; // DOM 未就绪，等待下次检测

            var hreftest = hreftestEl.attributes["href"].value;
            var state = getCurrentCourseState();
            if (!state) return; // 无法获取状态，等待下次检测

            if (state == "已完成" || hreftest != "#" || (typeof getMaxPlayTime == "function" ? getMaxPlayTime() | 0 : 1) == (typeof player.j2s_getDuration == "function" ? player.j2s_getDuration() | 0 : 0) || (typeof getMaxPlayTime == "function" ? getMaxPlayTime() | 0 : 1) == (typeof player.getDuration == "function" ? player.getDuration() | 0 : 0)) {
                // debounce：需要连续两次检测都确认"已完成"才触发（防止瞬时误判）
                if (state == "已完成" && Date.now() - _lastCompletedCheck > 2000) {
                    _lastCompletedCheck = Date.now();
                    console.log("examherftest: 首次检测到已完成，等待二次确认");
                    return;
                }
                _lastCompletedCheck = 0;

                if (localStorage.getItem("华医mode") == "2" && (state == "待考试" || (state == "已完成" && hreftest != "#"))) {
                    // mode=2：检查侧边栏是否还有学习中/未学习课程
                    // 如果有，优先完成学习；只有全部学完才进入考试
                    if (hasRemainingCourses()) {
                        console.log("mode=2,当前课程已完成，但还有未学完课程，跳转下一课程");
                        courseFinished = true;
                        if (clockms) { clearInterval(clockms); clockms = null; }
                        playNext();
                    } else {
                        console.log("mode=2,所有课程已学完，准备进入考试");
                        courseFinished = true;
                        if (clockms) { clearInterval(clockms); clockms = null; }
                        sleep(5000);
                        try {
                            clickexam();
                        } catch (error) {
                            console.log("扫码进入考试");
                            window.open("/pages/exam_tip.aspx?cwrid=" + cwrid, "_self");
                        };
                    };
                } else {
                    if (localStorage.getItem("华医mode") == "2") {
                        console.log("mode=2,本节课已完成且考试已通过");
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
                var state = getCurrentCourseState();
                if (!state) return; // DOM 未就绪，等待下次检测
                if ($('video').prop('paused') == true && state != "已完成" && state != "待考试") {
                    console.log("视频意外暂停，恢复播放");
                    $('video').get(0).play().catch(function() {});
                    $('video').prop('volume', 0);
                    $('video').prop('muted', true);
                } else if (state == "待考试" && !inCooldown) {
                    // 待考试：优先搜索学习中/未学习课程，找不到再进入考试
                    if (courseFinished) return;
                    courseFinished = true;
                    clearInterval(clockms);
                    clockms = null;
                    if (clock) { clearInterval(clock); clock = null; }
                    try { document.querySelector("video").pause(); } catch(e) {}
                    console.log("【华医网小助手】当前课程状态为待考试，搜索学习中/未学习课程...");
                    var lis = document.querySelectorAll("li.lis-inside-content");
                    var foundLi = null;
                    for (var n = 0; n < lis.length; n++) {
                        var st = getCourseStatus(lis[n]);
                        if (st === "未学习" || st === "学习中") {
                            foundLi = lis[n];
                            console.log("【华医网小助手】找到课程（" + st + "），开始学习");
                            break;
                        }
                    }
                    if (foundLi) {
                        // 导航到找到的课程
                        var navigated = false;
                        var onclickAttr = foundLi.getAttribute("onclick") || "";
                        var urlMatch = onclickAttr.match(/location\.href=['"]([^'"]+)['"]/);
                        if (urlMatch && urlMatch[1]) {
                            window.location.href = urlMatch[1];
                            navigated = true;
                        }
                        if (!navigated) {
                            var h2 = foundLi.querySelector("h2");
                            if (h2) { h2.click(); navigated = true; }
                        }
                        if (!navigated) { foundLi.click(); }
                        navCooldownUntil = Date.now() + 15000;
                    } else {
                        // 没有学习中/未学习课程，检查是否进入考试
                        if (localStorage.getItem("华医mode") == "2") {
                            console.log("【华医网小助手】无剩余可学课程，准备进入考试 (clockms)");
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            try { clickexam(); }
                            catch (error) {
                                console.log("扫码进入考试");
                                window.open("/pages/exam_tip.aspx?cwrid=" + (typeof cwrid !== "undefined" ? cwrid : ""), "_self");
                            };
                        } else {
                            console.log("【华医网小助手】单刷模式，全部课程已完成 (clockms)");
                        }
                    }
                } else if (state == "已完成" && !inCooldown) {
                    if (courseFinished) return;
                    courseFinished = true;
                    clearInterval(clockms);
                    clockms = null;
                    if (clock) { clearInterval(clock); clock = null; }
                    try { document.querySelector("video").pause(); } catch(e) {}
                    sessionStorage.setItem("hua_yi_post_refresh", "1");
                    console.log("【华医网小助手】课程已完成，3秒后刷新页面检查状态");
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    location.reload();
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

    // 获取侧边栏课程项的状态文本（待考试/学习中/未学习/已完成等）
    function getCourseStatus(li) {
        try {
            var btn = li.querySelector("button");
            return btn ? btn.innerText.trim() : "";
        } catch(e) { return ""; }
    }

    // 判断侧边栏中是否还有未完成学习的课程（学习中或未学习）
    // 注意：视频页侧边栏可能没有状态按钮，此时保守处理——假设有剩余课程
    function hasRemainingCourses() {
        var lis = document.querySelectorAll("li.lis-inside-content");
        var foundLearning = false;
        var unknownCount = 0;
        var totalCount = lis.length;
        for (var i = 0; i < totalCount; i++) {
            var status = getCourseStatus(lis[i]);
            if (status === "学习中" || status === "未学习") {
                foundLearning = true;
            } else if (status === "" || status === "未知") {
                unknownCount++;
            }
        }
        if (foundLearning) return true;
        // 如果所有课程状态都读取不到（侧边栏无按钮），保守假设有剩余课程需要学习
        if (unknownCount === totalCount && totalCount > 0) {
            console.log("hasRemainingCourses: 无法读取课程状态，假设有剩余课程");
            return true;
        }
        return false;
    }

    // 获取当前正在播放的课程 li 元素（通过 current-playing class）
    function getCurrentCourseLi() {
        var cur = document.querySelector("li.lis-inside-content.current-playing");
        if (!cur) {
            // 回退：通过 top_play 图标定位
            var topPlay = document.querySelector("i[id='top_play']");
            if (topPlay) {
                var li = topPlay.closest("li.lis-inside-content");
                if (li) return li;
            }
        }
        return cur;
    }

    // 获取当前课程的状态文本（优先使用 current-playing class，回退 DOM 遍历）
    function getCurrentCourseState() {
        var li = getCurrentCourseLi();
        if (li) return getCourseStatus(li);
        // 最后的回退：旧的 DOM 遍历方式
        try {
            var topPlay = document.querySelectorAll("i[id='top_play']");
            if (topPlay.length) {
                return topPlay[0].parentNode.nextElementSibling.nextElementSibling.nextElementSibling.innerText;
            }
        } catch(e) {}
        return "";
    }

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
            var currentLi = getCurrentCourseLi();
            if (!currentLi) {
                console.log("未找到当前播放课程，尝试按钮方式跳转");
                fallbackToNextCourse();
                return;
            }
            const lis = document.querySelectorAll("li.lis-inside-content");
            var index = Array.from(lis).findIndex(function(li) { return li === currentLi; });//找出当前页面是第几个课程
            console.log("当前视频索引: " + index + ", 总课程数: " + lis.length);
            // 修复：index 为 -1 时说明找不到当前元素，应走 fallback
            if (index >= 0 && index + 1 < lis.length) {
                // 模式2（视频+考试）：从当前位置向后扫描，跳过"待考试"/"已完成"课程
                // 优先完成所有学习任务，最后统一考试
                var isMode2 = localStorage.getItem("华医mode") == "2";
                var nextIdx = -1;
                for (var k = index + 1; k < lis.length; k++) {
                    var st = getCourseStatus(lis[k]);
                    if (isMode2 && (st === "待考试" || st === "已完成")) {
                        console.log("mode=2: 跳过第" + (k+1) + "个课程（状态:" + st + "）");
                        continue;
                    }
                    nextIdx = k;
                    break;
                }
                if (nextIdx >= 0) {
                    index = nextIdx;
                    console.log("跳转到第 " + (index + 1) + " 个课程");
                    // 优先使用 li 元素的 onclick 跳转（提取 href 直接跳转更可靠）
                    var targetLi = lis[index];
                    var navigated = false;
                    // 方式1: 从 onclick 属性提取 url 直接跳转
                    var onclickAttr = targetLi.getAttribute("onclick") || "";
                    var urlMatch = onclickAttr.match(/location\.href=['"]([^'"]+)['"]/);
                    if (urlMatch && urlMatch[1]) {
                        console.log("通过 onclick 提取 URL 跳转: " + urlMatch[1]);
                        window.location.href = urlMatch[1];
                        navigated = true;
                    }
                    if (!navigated) {
                        // 方式2: 尝试点击 h2（兼容旧版）
                        var h2 = targetLi.querySelector("h2");
                        if (h2) {
                            console.log("通过点击 h2 跳转");
                            h2.click();
                            navigated = true;
                        }
                    }
                    if (!navigated) {
                        // 方式3: 直接点击 li
                        console.log("通过点击 li 跳转");
                        targetLi.click();
                    }
                    setTimeout(function () {
                        try {
                            document.evaluate("//button[contains(., '知道了')]", document, null, XPathResult.ANY_TYPE).iterateNext().click();
                        } catch (err) {
                            console.log("未找到弹窗");
                        };
                    }, 2000);
                } else {
                    console.log("侧边栏剩余课程均为待考试/已完成，尝试进入考试");
                    fallbackToNextCourse();
                }
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
        // 严格按优先级查找，排除"已完成"
        var allBtns = document.querySelectorAll('button, input[type="button"]');
        var found = false;
        // 优先级：未学习 > 学习中 > 待考试(mode2)
        var mode = localStorage.getItem("华医mode");
        var priorities = ['未学习', '学习中'];
        if (mode == '2') priorities.push('待考试');
        for (var p = 0; p < priorities.length && !found; p++) {
            for (var b = 0; b < allBtns.length; b++) {
                var val = allBtns[b].value || allBtns[b].textContent || '';
                if (val.trim() === priorities[p]) {
                    console.log("找到" + priorities[p] + "课程，开始学习");
                    // 点击按钮的兄弟链接
                    var sib = allBtns[b].parentElement.querySelector('a[href]');
                    if (!sib) sib = allBtns[b].previousElementSibling || allBtns[b].nextElementSibling;
                    if (sib && sib.tagName === 'A') { sib.click(); }
                    else { allBtns[b].click(); }
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
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
            // 精确匹配，并且排除"已完成"
            if ((text === '未学习' || text.indexOf('未学习') === 0) && text.indexOf('已完成') === -1) {
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
                // 只在叶子节点且不包含"已完成"的节点查找
                if (elem.children.length === 0 && (elem.textContent || '').indexOf('已完成') === -1) {
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
                if (text2 === '学习中' && text2.indexOf('已完成') === -1) {
                    if (tryClickCourse(el2, '找到【学习中】课程')) {
                        clicked = true;
                        break;
                    }
                }
            }
        }

        // ========== 第4优先级：查找"待考试"的课程 ==========
        if (!clicked) {
            console.log("  → 查找【待考试】课程...");
            for (var l = 0; l < allElements.length; l++) {
                var el3 = allElements[l];
                var text3 = (el3.textContent || el3.value || '').trim();
                if (text3 === '待考试' && text3.indexOf('已完成') === -1) {
                    if (tryClickCourse(el3, '找到【待考试】课程')) {
                        clicked = true;
                        break;
                    }
                }
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
                // 严格排除"已完成"（部分按钮可能包含"已完成"子串）
                if (btnText && btnText !== '已完成' && btnText.indexOf('已完成') === -1 && btnText.indexOf('完成') === -1) {
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
