#!/usr/bin/env node
const fs = require("fs-extra");
const cp = require("child_process");
const path = require("path");

let arg = process.argv[2];
let dir = process.argv[3] || ".";
process.chdir(process.cwd());

if(arg == "create"){
	let appName = path.basename(dir);
	if(!fs.existsSync(appName)){
		fs.mkdirSync(appName);
		fs.mkdirSync(`${appName}/build`);
		fs.mkdirSync(`${appName}/build/media`);
		fs.mkdirSync(`${appName}/build/lib`);
		fs.mkdirSync(`${appName}/src`);
		fs.writeFileSync(`${appName}/src/main.js`, "//Write your code here");
	}
	else{
		console.log(`File or directory ${appName} already exists`);
	}
}
else if(arg == "build"){
	if(!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()){
		console.log(`No such directory ${dir}`);
	}
	else if(!fs.existsSync(`${dir}/src/main.js`)){
		console.log("Missing main.js in src directory");
	}
	else{
		process.chdir(dir);
		let appName = path.basename(process.cwd());
		process.chdir("src");
		let jarCode = fs.readFileSync(__dirname+"/jar.js", "utf-8").replace(/\n/g, "");
		let imports = "";
		fs.readdirSync("../build/lib").forEach(lib=>{
			if(path.extname(lib) == ".jar"){
				imports += `_loadJar_('${lib}');`;
			}
		})
		let javaCode = `
		import javax.script.ScriptEngine;
		import javax.script.ScriptEngineManager;
		import javax.script.ScriptException;
		import javax.script.Invocable;
		import java.io.BufferedReader;
		import java.io.InputStream;
		import java.io.InputStreamReader;
		public class Main {
			private static ScriptEngine engine;
			private static String getFileContent(String file) throws Exception{
				StringBuilder bs = new StringBuilder();
				InputStream inputStream = Main.class.getResourceAsStream(file);
				InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
				BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
				while (bufferedReader.ready()){
					bs.append(bufferedReader.readLine()+"\\n");
				}
				return bs.toString();
			}
			public static void load(String file) throws Exception{
				try{
					engine.eval(getFileContent(file));
				}
				catch(Exception err){
					Invocable invocable = (Invocable) engine;
					invocable.invokeFunction("_load_", file);
				}
			}
			public static void main(String[] args) throws Exception {
				engine = new ScriptEngineManager().getEngineByName("nashorn");
				engine.eval("${jarCode}");
				engine.eval("${imports}");
				engine.eval("var _load_ = load; var load = Java.type('Main').load;");
				engine.eval(getFileContent("main.js"));
			}
		}
		`;
		fs.writeFileSync("Main.java", javaCode, "utf-8");
		let compileClass = cp.spawn("javac", ["Main.java"]);
		compileClass.stderr.on("data", data=>console.log(data.toString()));
		compileClass.on("close", code=>{
			if(code == 0){
				let compileJar = cp.spawn("jar", ["cvfe", `${appName}.jar`, "Main", "Main.class"]);
				compileJar.stderr.on("data", data=>console.log(data.toString()));
				compileJar.on("close", code=>{
					if(code == 0){
						fs.removeSync("Main.java");
						fs.removeSync("Main.class");
						fs.readdirSync(".").forEach(file=>{
							if(file != `${appName}.jar`){
								let addFile = cp.spawnSync("jar", ["-uf", `${appName}.jar`, file]);
								if(addFile.error){
									throw addFile.error;
								}
							}
						});
						fs.copySync(`${appName}.jar`, `../build/${appName}.jar`);
						fs.removeSync(`${appName}.jar`);
						process.chdir("../build");
						let runJar = cp.spawn("java", ["-jar", `${appName}.jar`]);
						runJar.stdout.on("data", data=>console.log(data.toString()));
						runJar.stderr.on("data", data=>console.log(data.toString()));
					}
				});
			}
		});
	}
}
else{
	console.log("Usage:");
	console.log("js2jar create <projectname>        to create a project");
	console.log("js2jar build <projectdir>          to build and run a project");
	console.log("js2jar build                       to build and run a project in the current directory");
}
