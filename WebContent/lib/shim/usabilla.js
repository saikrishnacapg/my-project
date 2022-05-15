if (window.currentEnvironment == 'prod') {
    /*{literal}<![CDATA[*/
    window.lightningjs || function (c) {
        function g(b, d) {
            d && (d += (/\?/.test(d) ? "&" : "?") + "lv=1");
            c[b] || function () {
                var i = window, h = document, j = b, g = h.location.protocol, l = "load", k = 0;
                (function () {
                    function b() {
                        a.P(l);
                        a.w = 1;
                        c[j]("_load")
                    }

                    c[j] = function () {
                        function m() {
                            m.id = e;
                            return c[j].apply(m, arguments)
                        }

                        var b, e = ++k;
                        b = this && this != i ? this.id || 0 : 0;
                        (a.s = a.s || []).push([e, b, arguments]);
                        m.then = function (b, c, h) {
                            var d = a.fh[e] = a.fh[e] || [], j = a.eh[e] = a.eh[e] || [], f = a.ph[e] = a.ph[e] || [];
                            b && d.push(b);
                            c && j.push(c);
                            h && f.push(h);
                            return m
                        };
                        return m
                    };
                    var a = c[j]._ = {};
                    a.fh = {};
                    a.eh = {};
                    a.ph = {};
                    a.l = d ? d.replace(/^\/\//, (g == "https:" ? g : "http:") + "//") : d;
                    a.p = {0: +new Date};
                    a.P = function (b) {
                        a.p[b] = new Date - a.p[0]
                    };
                    a.w && b();
                    i.addEventListener ? i.addEventListener(l, b, !1) : i.attachEvent("on" + l, b);
                    var q = function () {
                        function b() {
                            return ["<head></head><", c, ' onload="var d=', n, ";d.getElementsByTagName('head')[0].", d, "(d.", g, "('script')).", i, "='", a.l, "'\"></", c, ">"].join("")
                        }

                        var c = "body", e = h[c];
                        if (!e) return setTimeout(q, 100);
                        a.P(1);
                        var d = "appendChild", g = "createElement", i = "src", k = h[g]("div"), l = k[d](h[g]("div")),
                            f = h[g]("iframe"), n = "document", p;
                        k.style.display = "none";
                        e.insertBefore(k, e.firstChild).id = o + "-" + j;
                        f.frameBorder = "0";
                        f.id = o + "-frame-" + j;
                        /MSIE[ ]+6/.test(navigator.userAgent) && (f[i] = "javascript:false");
                        f.allowTransparency = "true";
                        l[d](f);
                        try {
                            f.contentWindow[n].open()
                        } catch (s) {
                            a.domain = h.domain, p = "javascript:var d=" + n + ".open();d.domain='" + h.domain + "';", f[i] = p + "void(0);"
                        }
                        try {
                            var r = f.contentWindow[n];
                            r.write(b());
                            r.close()
                        } catch (t) {
                            f[i] = p + 'd.write("' + b().replace(/"/g, String.fromCharCode(92) + '"') + '");d.close();'
                        }
                        a.P(2)
                    };
                    a.l && setTimeout(q, 0)
                })()
            }();
            c[b].lv = "1";
            return c[b]
        }

        var o = "lightningjs", k = window[o] = g(o);
        k.require = g;
        k.modules = c
    }({});
    var ua = navigator.userAgent;
    if (ua.match(/Android/i)) {
        if (ua.match(/Mobile/i)) {
            window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/32c2528e693c.js");
        } else {
            window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/be435f1233a2.js");
        }
    } else if (ua.match(/iPad|iProd|tablet|Kindle/i)) {
        window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/be435f1233a2.js");
    } else if (ua.match(/BlackBerry|BB10|iPhone|iPod|Opera Mini|IEMobile/i)) {
        window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/32c2528e693c.js");
    } else {
        window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/eb4b394375bc.js");
    }/*]]>{/literal}*/

} else {
    <!-- Usabilla Combicode for Synergy - non-prod (MyAccount)-->
    <!-- Begin Usabilla for Websites embed code -->
    /*{literal}<![CDATA[*/
    window.lightningjs || function (c) {
        function g(b, d) {
            d && (d += (/\?/.test(d) ? "&" : "?") + "lv=1");
            c[b] || function () {
                var i = window, h = document, j = b, g = h.location.protocol, l = "load", k = 0;
                (function () {
                    function b() {
                        a.P(l);
                        a.w = 1;
                        c[j]("_load")
                    }

                    c[j] = function () {
                        function m() {
                            m.id = e;
                            return c[j].apply(m, arguments)
                        }

                        var b, e = ++k;
                        b = this && this != i ? this.id || 0 : 0;
                        (a.s = a.s || []).push([e, b, arguments]);
                        m.then = function (b, c, h) {
                            var d = a.fh[e] = a.fh[e] || [], j = a.eh[e] = a.eh[e] || [], f = a.ph[e] = a.ph[e] || [];
                            b && d.push(b);
                            c && j.push(c);
                            h && f.push(h);
                            return m
                        };
                        return m
                    };
                    var a = c[j]._ = {};
                    a.fh = {};
                    a.eh = {};
                    a.ph = {};
                    a.l = d ? d.replace(/^\/\//, (g == "https:" ? g : "http:") + "//") : d;
                    a.p = {0: +new Date};
                    a.P = function (b) {
                        a.p[b] = new Date - a.p[0]
                    };
                    a.w && b();
                    i.addEventListener ? i.addEventListener(l, b, !1) : i.attachEvent("on" + l, b);
                    var q = function () {
                        function b() {
                            return ["<head></head><", c, ' onload="var d=', n, ";d.getElementsByTagName('head')[0].", d, "(d.", g, "('script')).", i, "='", a.l, "'\"></", c, ">"].join("")
                        }

                        var c = "body", e = h[c];
                        if (!e) return setTimeout(q, 100);
                        a.P(1);
                        var d = "appendChild", g = "createElement", i = "src", k = h[g]("div"), l = k[d](h[g]("div")),
                            f = h[g]("iframe"), n = "document", p;
                        k.style.display = "none";
                        e.insertBefore(k, e.firstChild).id = o + "-" + j;
                        f.frameBorder = "0";
                        f.id = o + "-frame-" + j;
                        /MSIE[ ]+6/.test(navigator.userAgent) && (f[i] = "javascript:false");
                        f.allowTransparency = "true";
                        l[d](f);
                        try {
                            f.contentWindow[n].open()
                        } catch (s) {
                            a.domain = h.domain, p = "javascript:var d=" + n + ".open();d.domain='" + h.domain + "';", f[i] = p + "void(0);"
                        }
                        try {
                            var r = f.contentWindow[n];
                            r.write(b());
                            r.close()
                        } catch (t) {
                            f[i] = p + 'd.write("' + b().replace(/"/g, String.fromCharCode(92) + '"') + '");d.close();'
                        }
                        a.P(2)
                    };
                    a.l && setTimeout(q, 0)
                })()
            }();
            c[b].lv = "1";
            return c[b]
        }

        var o = "lightningjs", k = window[o] = g(o);
        k.require = g;
        k.modules = c
    }({});
    if (!navigator.userAgent.match(/Android|BlackBerry|BB10|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
        window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/c6638fd89dc8.js");
    } else {
        window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/25e1c88ecdea.js");
    }/*]]>{/literal}*/
}

var jsonipapiurl = 'https://jsonip.com/';
var ipifyapiurl = 'https://api.ipify.org';
window.usabilla_live("setEventCallback", function (category, action, label, value) {
    // This wouldn't work in IE 8 and IE 9, cause we use `XDomainRequest` when supported


    var voc_cookiesexpirydate = new Date();
    voc_cookiesexpirydate.setTime(voc_cookiesexpirydate.getTime() + (1 * 24 * 60 * 60 * 1000));
    var voc_cookiesexpires = ";expires=" + voc_cookiesexpirydate;
    if (action === "Feedback:Open") {
        document.cookie = "Feedback:open=UsabillaFeedback_open" + voc_cookiesexpires + ";path=/";
    }
    if (action === "Feedback:Success") {
        document.cookie = "Feedback:complete=UsabillaFeedback_complete" + voc_cookiesexpires + ";path=/";
    }
    if (action === 'Campaign:Open') {
        document.cookie = "Campaign:open=UsabillaCampaign_open" + voc_cookiesexpires + ";path=/";
    }
    if (action === 'Campaign:Success') {
        document.cookie = "Campaign:complete=UsabillaCampaign_complete" + voc_cookiesexpires + ";path=/";
    }
    if (action === 'Campaign:Close') {
        document.cookie = "Campaign:close=UsabillaCampaign_close" + voc_cookiesexpires + ";path=/";
    }

    function sendReplacement(vData) {
        var data = JSON.parse(vData);
        data.url = data.url.replace(new RegExp("##"), "#");
        var pagevoctiming = data.timing.connectEnd - data.timing.loadEventEnd;
        data.custom.pageloadtime = pagevoctiming > 0 ? pagevoctiming / 1000 + 's' : pagevoctiming < 0 ? (pagevoctiming * -1) / 1000 + 's' : pagevoctiming + 's';
        data.custom.viewpoint = data.viewport.width + 'x' + data.viewport.height;
        vData = JSON.stringify(data);
        realSend.apply(this, arguments);
    }

    var realSend = XMLHttpRequest.prototype.send;
    ub_window = document.getElementById('lightningjs-frame-usabilla_live_feedback').contentWindow;
    ub_window.XMLHttpRequest.prototype.send = sendReplacement;
    if (window.XDomainRequest) {
        realSend = XDomainRequest.prototype.send;
        ub_window.XDomainRequest.prototype.send = sendReplacement;
    }
});

var voc_pageloadstart = Date.now();

function dw_getwindowdims() {
    var doc = document, w = window;
    var docEl = (doc.compatMode && doc.compatMode === 'CSS1Compat') ?
        doc.documentElement : doc.body;

    var width = docEl.clientWidth;
    var height = docEl.clientHeight;

    // mobile zoomed in?
    if (w.innerWidth && width > w.innerWidth) {
        width = w.innerWidth;
        height = w.innerHeight;
    }
    return {width: width, height: height};
}

var voc_viewpointarray = dw_getwindowdims();

function isjson(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}

function getclientip(url) {
    try {
        var ipavoc = "";
        var xhttpvoc = new XMLHttpRequest();
        xhttpvoc.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if (isjson(this.response)) {
                    ipavoc = JSON.parse(this.response).ip.toString();
                } else {
                    ipavoc = this.response;
                }
            } else {
                ipavoc = "IP service not working";
            }

        }
        xhttpvoc.open("GET", url, false);
        xhttpvoc.send();
        return ipavoc;
    } catch (e) {
        return "IP service not working";
    }
}

var voc_pageloadtime = Date.now() - voc_pageloadstart;
var voc_ipaddress = getclientip(jsonipapiurl);

window.usabilla_live('data', {
    'custom': {
        'userip': (voc_ipaddress == undefined || voc_ipaddress == "IP service not working") ? getclientip(ipifyapiurl) : voc_ipaddress,
        'viewpoint': voc_viewpointarray.width + 'x' + voc_viewpointarray.height,
        'pageloadtime': voc_pageloadtime + 's'
    }
});


function vocvirtualurlsurvey(vocvirtualurl) {
    window.usabilla_live('data', {
        'custom': {
            'virtualUrl': vocvirtualurl,
            'userip': (voc_ipaddress == undefined || voc_ipaddress == "IP service not working") ? getclientip(ipifyapiurl) : voc_ipaddress,
            'viewpoint': voc_viewpointarray.width + 'x' + voc_viewpointarray.height,
            'pageloadtime': voc_pageloadtime + 's'
        }
    });
    window.usabilla_live('virtualPageView');
}

// <!-- Add Title attribute in Website feedback & Chat busy -->
setTimeout(function () {
    var myEle = document.getElementById("inside-bridge");
    if (myEle) {
        document.getElementById("inside-bridge").title = "Website chat window";
    }

    var myEleCls = document.getElementsByClassName("usabilla_live_button_container");
    if (myEleCls) {
        var getEle = document.getElementsByClassName("usabilla_live_button_container")[0];
        if (getEle) {
            var iFrame = getEle.getElementsByTagName("iframe")[0];
            if (iFrame) {
                iFrame.setAttribute("title", "Website feedback form");
            }
        }
    }
}, 4000);