const liveServer = require('live-server');
const fs = require('fs');
const path = require('path');
const minify = require('minify');
// const showdown = require('showdown');

async function genHTML(variant) {
	let folder = path.join('src', variant);
	let html = await minify(path.join(folder, 'index.html'));
	let css = await minify(path.join(folder, 'main.css'));
	let js = await minify(path.join(folder, 'main.js'));
	html = html.replace('[[JAVASCRIPT]]', `<script type="text/javascript">${js}</script>`);
	html = html.replace('[[CSS]]', `<style>${css}</style>`);
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
				res.setHeader('Content-Type', 'text/html; charset=UTF-8');
				res.write(html);
				res.end();
			} else {
				next();
			}
		}],
	};
	liveServer.start(params);
}
console.log(process.argv);
localDev(process.argv[4]);