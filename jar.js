function _loadJar_(pathName){
	var sysloader = java.lang.ClassLoader.getSystemClassLoader();
	var sysclass = java.net.URLClassLoader.class;
	var ClassArray = Java.type('java.lang.Class[]');
	var parameters = new ClassArray(1);
	parameters[0]= java.net.URL.class;
	var method = sysclass.getDeclaredMethod('addURL', parameters);
	method.setAccessible(true);
	var ObjectArray = Java.type('java.lang.Object[]');
	var array = new ObjectArray(1);
	var f = new java.io.File('lib/'+pathName);
	if(f.isFile()){
		var u = f.toURL();
		array[0]=u;
		method.invoke(sysloader, array);
	}else{
		var listOfFiles = f.listFiles();
		if(listOfFiles !=null)
		listOfFiles.forEach(function(file){
			if (file.isFile()) {
				var u = file.toURL();
				array[0]=u;
				method.invoke(sysloader, array);
			}
		});
	}
}
