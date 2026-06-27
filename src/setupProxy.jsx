const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    //app.use(proxy('/auth/google', { target: 'http://localhost:5100' }))
    //app.use(proxy('/api/current_user', { target: 'http://localhost:5100' }))
    //app.use(proxy('/api/logout', { target: 'http://localhost:5100' }))
    app.use(proxy('/db', { target: 'http://localhost:5100' }))
    if (process.env.NODE_ENV === 'production') {
      //app.use(proxy('/api/payments', { target: 'http://localhost:5100' }))
      //app.use(proxy('/api', { target: 'http://localhost:5100' }))
      app.use(proxy('/db', { target: 'http://localhost:5100' }))
    } else {
      //app.use(proxy('/api/payments', { target: 'http://localhost:5100' }))
      //app.use(proxy('/api', { target: 'http://localhost:5100' }))
      app.use(proxy('/db', { target: 'http://localhost:5100' }))
    }
}
