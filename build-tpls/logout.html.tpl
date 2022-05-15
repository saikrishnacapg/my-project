<!doctype html>
<html lang="en">
<head>
    <title>Synergy</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="utf-8" />
    <meta content="width=device-width,minimum-scale=1,maximum-scale=1" name="viewport" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="description" content="" />
    <meta name="author" content="" />

  <!-- discourage caching -->
  <meta http-equiv="cache-control" content="must-revalidate, private" />
  <meta http-equiv="expires" content="-1" />
  <meta http-equiv="last-modified" content="Tue, 01 Jan 1980 1:00:00 GMT" />

    <!-- iPhone SPLASHSCREEN-->
    <link rel="apple-touch-startup-image" href="img/apple-touch/apple-touch-startup-image-320x460.png" media="(device-width: 320px)">
    <!-- iPhone (Retina) SPLASHSCREEN-->
    <link rel="apple-touch-startup-image" href="img/apple-touch/apple-touch-startup-image-640x920.png" media="(device-width: 320px) and (-webkit-device-pixel-ratio: 2)">
    <!-- iPad (portrait) SPLASHSCREEN-->
    <link rel="apple-touch-startup-image" href="img/apple-touch/apple-touch-startup-image-768x1004.png" media="(device-width: 768px) and (orientation: portrait)">
    <!-- iPad (landscape) SPLASHSCREEN-->
    <link rel="apple-touch-startup-image" href="img/apple-touch/apple-touch-startup-image-748x1024.png" media="(device-width: 768px) and (orientation: landscape)">
    <!-- iPad (Retina, portrait) SPLASHSCREEN-->
    <link rel="apple-touch-startup-image" href="img/apple-touch/apple-touch-startup-image-1536x2008.png" media="(device-width: 1536px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)">
    <!-- iPad (Retina, landscape) SPLASHSCREEN-->
    <link rel="apple-touch-startup-image" href="img/apple-touch/apple-touch-startup-image-2048x1496.png" media="(device-width: 1536px)  and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)">

    <link rel="apple-touch-icon" href="img/apple-touch/apple-touch-icon-144-precomposed.png"/>
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="img/apple-touch/apple-touch-icon-144-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="img/apple-touch/apple-touch-icon-114-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="img/apple-touch/apple-touch-icon-72-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" href="img/apple-touch/apple-touch-icon-57-precomposed.png" />
    <link rel="shortcut icon" href="img/favicon.ico" />

    <link rel="stylesheet" href="css/page.css" />
    <link rel="stylesheet" href="css/icons.css" />

    <!--[if gte IE 9]>
    <style>
        .ie9-gradient-fix {
           filter: none;
        }
    </style>
    <![endif]-->


     <!-- modernizr needs to load before body -->

    <!--[if lte IE 9]>
    <![endif]-->

    <!--[if lte IE 8]>
    <![endif]-->

</head>

<body class="logout">
    <div class="container">
        <div class="header">
            <div class="header__logo">
              <a title="Synergy" href=""><img class="logo" alt="Synergy My Account home" src="img/logo/synergy-logo.svg" /></a>
            </div>
            <sy-browser></sy-browser>
            <div id="outageBanner">
               <!--   Outage messages go here -->
            </div>
            <div class="header__login">
                <a href="/#/login"
                   id="my-account-logon">
                    My Account login
                    <span class="sy-icon--log_in"></span>
                </a>
            </div>
        </div>
        <div class="hero">
            <div class="hero__watermark">
                <span class="sy-icon--ok_2"></span>
            </div>
            <div class="hero__message">
                <span class="hero-message__large">Thank you for using <strong>My Account</strong>.</span>
                <span class="hero-message__small" id="manual-logout">You have been logged out successfully.</span>
                <span class="hero-message__small" id="auto-logout" style="display: none;">You have been logged out successfully.</span>
            </div>
            <div class="hero__feedback">
                Please <a href=""> provide feedback</a> to help us improve our service.
            </div>
        </div>
        <div class="content">
            <div class="col-xs-12 col-sm-6">
                <a href="http://selfserve.synergy.net.au/at_home/solar_residential.xhtml?desktop=true">
                    <img src="img/header_res_understanding_solar.png" style="max-width: 100%" />
                </a>
            </div>
            <div class="col-xs-12 col-sm-6">
                <a href="https://selfserve.synergy.net.au/at_home/paperless_billing.xhtml?desktop=true">
                    <img src="img/img-paperless_billing.png" style="max-width: 100%" />
                </a>
            </div>
        </div>
        <div class="contact-info">
            <div class="col-xs-3">
                <span class="sy-icon--home"></span>
                <span>Residential</span><br/>
                 <span>13 13 53 </span>
            </div>
            <div class="col-xs-3">
                <span class="sy-icon--buildings"></span>
                 <span>Business</span><br/>
                 <span>13 13 54</span>
            </div>
            <div class="col-xs-3">
                <span class="sy-icon--settings"></span>
                <span>Electricity supply faults</span><br/>
                 <span>13 13 51</span>
            </div>
            <div class="col-xs-3">
                            <span class="sy-icon--settings"></span>
                  <span>Gas supply faults</span><br/>
                <span>13 13 52</span>
            </div>
        </div>
        <div class="footer">
            <ul>
                <li><a href="http://selfserve.synergy.net.au/privacy.xhtml?desktop=true">Privacy</a></li>
                <li><a href="http://selfserve.synergy.net.au/privacy.xhtml?desktop=true#collections">Collection statement</a></li>
                <li><a href="http://selfserve.synergy.net.au/terms_and_conditions.xhtml?desktop=true">Terms and conditions</a></li>
                <li><a href="http://selfserve.synergy.net.au/index.xhtml?desktop=true">View full site</a></li>
            </ul>
        </div>
    </div>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>

  
    <script>
    $(".hero__feedback a").on('click', function(e){ 
      e.preventDefault();
      usabilla_live('click');
    });
    
        var myAccount = '<%=clienturl%>' + '/index.html';
        $("#my-account-logon").attr("href", myAccount);
        $("#my-account-log-back-on").attr("href", myAccount);

        if (getQueryParameters().sessionExpiry && getQueryParameters().sessionExpiry.toString() === "true") {
            $("#manual-logout").toggle();
            $("#auto-logout").toggle();
        }

        function getQueryParameters () {
            var result = {
            };

            var params = window.location.search.split(/\?|\&/);

            $.each(params, function(it) {
                if (it) {
                    var param = it.split("=");
                    result[param[0]] = param[1];
                }
            });

            return result;
        }

        var host = window.location.host;

        if (host !== "selfserve.synergy.net.au") {
            var els = document.getElementsByTagName("a");

            var synergySite = "selfserve://selfserve.synergy.net.au", synergySSLSite = "selfserve://selfserve.synergy.net.au";

            for (var i = 0, l = els.length; i < l; i++) {
                var el = els[i];

                var httpPrefix = window.location.host.indexOf("172.21") === -1 ? 'http://' : 'https://';


                if (el.href.indexOf(synergySite) != -1) {
                    el.href = el.href.replace(synergySite, httpPrefix + window.location.host);
                } else if (el.href.indexOf(synergySSLSite) != -1) {
                    el.href = el.href.replace(synergySSLSite, "https://" + window.location.host);
                }

            }
        }

    </script>
  
    <!-- Usabilla feedback Live JS code (Different feedback button for desktop and mobile devices) -->
    <script type="text/javascript">
      /*{literal}<![CDATA[*/window.lightningjs||function(c){function g(b,d){d&&(d+=(/\?/.test(d)?"&":"?")+"lv=1");c[b]||function(){var i=window,h=document,j=b,g=h.location.protocol,l="load",k=0;(function(){function b(){a.P(l);a.w=1;c[j]("_load")}c[j]=function(){function m(){m.id=e;return c[j].apply(m,arguments)}var b,e=++k;b=this&&this!=i?this.id||0:0;(a.s=a.s||[]).push([e,b,arguments]);m.then=function(b,c,h){var d=a.fh[e]=a.fh[e]||[],j=a.eh[e]=a.eh[e]||[],f=a.ph[e]=a.ph[e]||[];b&&d.push(b);c&&j.push(c);h&&f.push(h);return m};return m};var a=c[j]._={};a.fh={};a.eh={};a.ph={};a.l=d?d.replace(/^\/\//,(g=="https:"?g:"http:")+"//"):d;a.p={0:+new Date};a.P=function(b){a.p[b]=new Date-a.p[0]};a.w&&b();i.addEventListener?i.addEventListener(l,b,!1):i.attachEvent("on"+l,b);var q=function(){function b(){return["<head></head><",c,' onload="var d=',n,";d.getElementsByTagName('head')[0].",d,"(d.",g,"('script')).",i,"='",a.l,"'\"></",c,">"].join("")}var c="body",e=h[c];if(!e)return setTimeout(q,100);a.P(1);var d="appendChild",g="createElement",i="src",k=h[g]("div"),l=k[d](h[g]("div")),f=h[g]("iframe"),n="document",p;k.style.display="none";e.insertBefore(k,e.firstChild).id=o+"-"+j;f.frameBorder="0";f.id=o+"-frame-"+j;/MSIE[ ]+6/.test(navigator.userAgent)&&(f[i]="javascript:false");f.allowTransparency="true";l[d](f);try{f.contentWindow[n].open()}catch(s){a.domain=h.domain,p="javascript:var d="+n+".open();d.domain='"+h.domain+"';",f[i]=p+"void(0);"}try{var r=f.contentWindow[n];r.write(b());r.close()}catch(t){f[i]=p+'d.write("'+b().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}a.P(2)};a.l&&setTimeout(q,0)})()}();c[b].lv="1";return c[b]}var o="lightningjs",k=window[o]=g(o);k.require=g;k.modules=c}({}); var ua = navigator.userAgent; if( ua.match(/Android/i) ){if(ua.match(/Mobile/i)) {window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/32c2528e693c.js"); } else {window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/be435f1233a2.js"); } } else if ( ua.match(/iPad|iProd|tablet|Kindle/i) ) {window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/be435f1233a2.js"); } else if( ua.match(/BlackBerry|BB10|iPhone|iPod|Opera Mini|IEMobile/i) ) {window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/32c2528e693c.js"); } else {window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/eb4b394375bc.js"); }/*]]>{/literal}*/
    </script>

</body>
</html>
