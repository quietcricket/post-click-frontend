const liveServer = require('live-server');
const fs = require('fs');
const path = require('path');
const minify = require('minify');
// const showdown = require('showdown');

async function genHTML(variant) {
	let folder = path.join('src', variant);
	let html = fs.readFileSync(path.join(folder, 'index.html')).toString('utf-8');
	let css = fs.readFileSync(path.join(folder, 'main.css')).toString('utf-8');
	let js = fs.readFileSync(path.join(folder, 'main.js')).toString('utf-8');
	html = html.replace('[[JAVASCRIPT]]', js);
	html = html.replace('[[CSS]]', css);
	fs.writeFileSync(path.join('gen', variant + ".html"), html);
	return html;
}


function localDev(variant) {
	let folder = path.join('src', variant);
	let params = {
		port: 8080,
		host: process.env.IP,
		root: folder,
		file: "index.html",
		wait: 1000,
		logLevel: 2,
		middleware: [async function (req, res, next) {
			if (req.originalUrl == '/') {
				let html = await genHTML(variant);
				let data = fs.readFileSync(path.join(folder, 'sample-data.json')).toString('utf-8');
				res.setHeader('Content-Type', 'text/html; charset=UTF-8');
				res.write(html.replace('[[DATA]]', data));
				res.end();
			} else {
				next();
			}
		}],
	};

	liveServer.start(params);
}

// console.log(process.argv[3]);
localDev(process.argv[3]);