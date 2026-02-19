// /js/cf-iframe-loader.js
(function(){
  try {
    // set the Cloudflare params exactly as before
    window.__CF$cv$params = { r: '98456d393fdde4cb', t: 'MTc1ODc0OTg4NA==' };

    var s = document.createElement('script');
    s.src = '/cdn-cgi/challenge-platform/scripts/jsd/main.js';
    document.head.appendChild(s);
  } catch (e) {
    console.error('cf-iframe-loader error', e);
  }
})();
