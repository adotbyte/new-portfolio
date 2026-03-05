// /js/cf-parent.js
(function(){
  function addIframe() {
    try {
      var iframe = document.createElement('iframe');
      Object.assign(iframe.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        border: 'none',
        visibility: 'hidden',
        width: '1px',
        height: '1px'
      });
      // Point iframe to an external HTML page that will run the CF loader
      iframe.src = '/static/cf-iframe.html';
      document.body.appendChild(iframe);
    } catch (e) {
      // swallow errors — non-critical
      console.error('cf-parent error', e);
    }
  }

  if (document.body) {
    document.readyState !== 'loading' ? addIframe() :
      document.addEventListener('DOMContentLoaded', addIframe);
  }
})();