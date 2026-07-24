const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function configureProxy(app) {
  const target = process.env.REACT_APP_API_URL
    || process.env.BACKEND_URL
    || `http://127.0.0.1:${process.env.BACKEND_PORT || 3001}`;
  app.use('/api', createProxyMiddleware({ target, changeOrigin: true }));
};
