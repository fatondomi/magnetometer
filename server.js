
// modules
let http = require("http");
let fs = require("fs");

// resources
let icon = fs.readFileSync("./resources/Wave.ico");
let socketLib = fs.readFileSync("resources/socket.io.js");

let interface = fs.readFileSync("interface.html","utf8");
let interfaceFun = fs.readFileSync("./resources/interfaceFun.js");
let interfaceStyle = fs.readFileSync("./resources/interfaceStyle.css");

let listeners = fs.readFileSync("./resources/addListeners.js");
let graphClass = fs.readFileSync("./resources/graphClass.js");

// vars     "192.168.0.105" "192.168.0.171"
let ipAdresa = "192.168.0.105";
let method = "";
let url = "";

let server = http.createServer(function (req, resp) {

    method = req.method;
    url = req.url;

	//logging method and url to cmd
    console.log("\n method = " + method + "     url = " + url);

    if(url.indexOf("/favicon.ico") == 0)
    {
        resp.writeHead(200, {"Content-Type":"image/ico"});
        resp.end(icon);
    }
    else if(url.indexOf("/resources/") == 0)
    {
        if(url.indexOf("socket.io.js") == 11) {
            resp.writeHead(200, {"Content-Type" : "text/javascript"} );
            resp.end(socketLib,"binary");
        }
        else if(url.indexOf("graphClass") == 11) {
            resp.writeHead(200, {"Content-Type" : "text/javascript"} );
            resp.end(graphClass,"binary");
        }
        else if(url.indexOf("interfaceFun") == 11) {
            resp.writeHead(200, {"Content-Type" : "text/javascript"} );
            resp.end(interfaceFun,"binary");
        }
        else if(url.indexOf("interfaceStyle") == 11) {
            resp.writeHead(200, {"Content-Type" : "text/css"} );
            resp.end(interfaceStyle,"binary");
        }
        else if(url.indexOf("addListeners") == 11) {
            resp.writeHead(200, {"Content-Type" : "text/javascript"} );
            resp.end(listeners,"binary");
        }
        else{
            resp.writeHead(404, {"Content-Type":"text/plain"} );
            resp.end("404 : Not found");
        }
    }
    else if(url == "/") {
        resp.writeHead(200, {"Content-Type":"text/html"} );
        resp.end(interface);
    }
    else { 
        resp.writeHead(404, {"Content-Type":"text/plain"} );
        resp.end("404 : Not found");
    }  //for irregular urls

    req.on('error', function (err) {
        // This prints the error message and stack trace to `stderr`.
        console.error(err.stack);
    });
});

server.listen(8080, ipAdresa);

console.log("Server running at " + ipAdresa + ":8080");

let io = require('socket.io')(server);

io.on("connection", function (socket) {

    socket.emit("connected","");

    socket.on("sensorData", function (data) {
        io.sockets.emit("dataPoint", data);
    });

    socket.on("uiCmd", function (data) {
        io.sockets.emit("cmd", data);
    })
});


