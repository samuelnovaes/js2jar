#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const cp = require('child_process');

let file = process.argv[2];
let loadRegex = /load *\( *"(.*)" *\)( *;)?/

if(file){
	let fileName = path.basename(file);
	let className = path.basename(file, path.extname(file));
	process.chdir(process.cwd()+"/"+path.dirname(file));
	let jsCode = fs.readFileSync(fileName, "utf-8");
	while(loadRegex.test(jsCode)){
		jsCode = jsCode.replace(loadRegex, m=>{
			return fs.readFileSync(RegExp.$1, "utf-8");
		});
	}
	jsCode = jsCode.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	let javaCode = `import javax.script.ScriptEngine; import javax.script.ScriptEngineManager; import javax.script.ScriptException; public class ${className} { public static void main(String[] args) throws ScriptException { ScriptEngineManager scriptEngineManager = new ScriptEngineManager(); ScriptEngine nashorn = scriptEngineManager.getEngineByName("nashorn"); String s = new StringBuilder()`;
	jsCode.split("\n").forEach(line=>{
		javaCode += '.append("'+line+'\\n")';
	});	
	javaCode+=".toString();nashorn.eval(s);}}";
	fs.writeFile(`${className}.java`, javaCode, "utf-8", err=>{
		if(err) throw err;
		let compileClass = cp.spawn("javac", [`${className}.java`]);
		compileClass.stdout.on('data', data=>console.log(`stdout: ${data}`));
		compileClass.stderr.on('data', data=>console.log(`stderr: ${data}`));
		compileClass.on('close', (code) => {
			if(code == 0){
				if(err) throw err;
				let compileJar = cp.spawn("jar", ["cvfe", `${className}.jar`, className, `${className}.class`]);
				compileJar.stdout.on('data', data=>console.log(`stdout: ${data}`));
				compileJar.stderr.on('data', data=>console.log(`stderr: ${data}`));
				compileJar.on('close', (code) => {
					if(code == 0){
						fs.unlinkSync(`${className}.java`);
						fs.unlinkSync(`${className}.class`);
						let runJar = cp.spawn("java", ["-jar", `${className}.jar`]);
						runJar.stdout.on('data', data=>console.log(`stdout: ${data}`));
						runJar.stderr.on('data', data=>console.log(`stderr: ${data}`));
					}
				});
			}
		});
	});
}
else{
	console.log("Usage: js2jar path/to/script.js");
}