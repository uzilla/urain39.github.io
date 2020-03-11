(function() {
	var date = new Date();
	var pathname = self.location.pathname;
	var postYear = parseInt(pathname.slice(1, 5));
	var postMonth = parseInt(pathname.slice(6, 8));
	if ((date.getFullYear() - postYear) * 12 +
		(date.getMonth() + 1 - postMonth) < 6)
		return; // 小于6个月，非过时内容
	var notice = document.createElement('div');
	notice.style['top'] = '0';
	notice.style['left'] = '0';
	notice.style['width'] = '100%';
	notice.style['text-align'] = 'center';
	notice.style['background'] = '#ffee00';
	var language = (navigator.browserLanguage || navigator.language).toLowerCase();
	if (language === 'zh-cn')
		notice.innerHTML = '<h2>注意：页面内容可能过时或不正确，请谨慎参考！</h2>';
	else
		notice.innerHTML = '<h3>Note: The page content may be outdated or incorrect, please use caution!</h3>';
	var firstChild = document.body.firstChild;
	document.body.insertBefore(notice, firstChild);
	setTimeout(function () {
		notice.style['display'] = 'none';
	}, 1000 * 10);
})();


