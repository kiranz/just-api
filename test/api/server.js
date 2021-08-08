const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const multer = require('multer');
const cookieParser = require('cookie-parser');

server.use(middlewares);
server.use(cookieParser());

var tempData = {
    retries: []
};

server.get('/echoQueryParams', (req, res) => {
    res.jsonp(req.query)
});

// returns JSON of cookies found in request
server.get('/echoCookies', (req, res) => {
    res.jsonp(req.cookies);
});

// sets cookies found in request body
server.post('/setCookies', (req, res) => {
    var data = '';

    req.on('data', function (chunk) {
        data += chunk;
    });

    req.on('end', function () {
        req.rawBody = data;
        var cookiesData = JSON.parse(req.rawBody);

        for (const key of Object.keys(cookiesData)) {
            res.cookie(key, cookiesData[key]);
        }

        res.send('');
    });
});

server.get('/retry/:id', (req, res) => {
    var id = req.params.id;
    var item = tempData.retries.find(prev => prev[id]);

    if (!item) {
        if (id.toString().includes('success')) {
            var newItem = {};
            newItem[id] = 1;
            tempData.retries.push(newItem);
        }

        res.sendStatus(404);
    } else {
        if (item[id] >= 2) {
            res.sendStatus(200);
        } else {
            item[id] += 1;
            res.sendStatus(400);
        }
    }

});

server.delete('/echoDeleteQueryParams', (req, res) => {
    res.jsonp(req.query)
});

server.get('/echoPathParams/*', (req, res) => {
    var pathParams = req.params['0'].split('/');
    res.jsonp(pathParams);
});

server.get('/echoHeaders', (req, res) => {
    res.jsonp(req.headers);
});

server.get('/delayResponse/:millis', (req, res) => {
    var delay = req.params.millis;
    setTimeout(function () {
        res.jsonp({'delay': delay})
    }, delay);
});

server.get('/getHTMLResponse', (req, res) => {
    var html = '<HTML><HEAD><TITLE>Title</TITLE></HEAD><BODY>\
                <H1>This is a Header</H1>\
                <H2>This is a Medium Header</H2>\
                <P> This is a new paragraph!</P>\
                </BODY></HTML>';

    res.send(html);
});

server.get('/redirect302', (req, res) => {
    res.redirect('/redirect301');
});

server.post('/redirect302', (req, res) => {
    res.redirect(302, '/redirect301');
});

server.get('/redirect301', (req, res) => {
    res.redirect(301, '/redirected');
});

server.get('/redirected', (req, res) => {
    res.send('response from redirection');
});

server.post('/echoNonFormBodyTextResponse', function (req, res, next) {
    var data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });

    req.on('end', function () {
        req.rawBody = data;
        res.send(req.rawBody);
    });
});

server.post('/echoBinaryBodyResponseStats', function (req, res, next) {
    var data = [];
    req.on('data', function (chunk) {
        data.push(chunk)
    });

    req.on('end', function () {
        var wholeBuffer = Buffer.concat(data);
        res.jsonp({'request_content_size': wholeBuffer.length});
    });
});

server.post('/echoJSONBodyResponse', function (req, res, next) {
    var data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', function () {
        req.rawBody = data;
        res.jsonp(JSON.parse(req.rawBody));
    });
});

server.put('/echoJSONBodyResponsePut', function (req, res, next) {
    var data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', function () {
        req.rawBody = data;
        res.jsonp(JSON.parse(req.rawBody));
    });
});

server.patch('/echoJSONBodyResponsePatch', function (req, res, next) {
    var data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', function () {
        req.rawBody = data;
        res.jsonp(JSON.parse(req.rawBody));
    });
});

var upload = multer({dest: '/tmp'});
server.post('/echoMultipartBodySingleFileStats', upload.single('file_name'), function (req, res, next) {
    // req.file is the `file_name` file
    // req.body will hold the text fields, if there were any
    //returns json {
    //  "file_size": 51938,
    //  "body": {
    //    "key1": "va1"
    //  }
    //}
    res.jsonp({'file': req.file, fields: req.body});
});

server.post('/echoMultipartBodyMultipleFileStats', upload.any(), function (req, res, next) {
    res.jsonp({files: req.files, fields: req.body});
});

server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
    next();
});

server.use(router);
server.listen(3027, () => {
    console.log('JSON Server is running')
});
