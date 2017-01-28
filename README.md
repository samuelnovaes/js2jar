# JS2Jar
Compile Nashorn script to Java application

# Install
1. Install dependencies
  - [Node.js](https://nodejs.org/en/download/)
  - [JDK 8](http://www.oracle.com/technetwork/pt/java/javase/downloads/jdk8-downloads-2133151.html)
2. Install JS2Jar
```sh
npm install -g js2jar
```

# Usage
Create an app
```sh
js2jar create myApp
```
Build and run the app
```sh
cd path/to/myApp
js2jar build
```
or
```sh
js2jar build path/to/myApp
```
It will build the application in the build directory

# Project structure
```javascript
myApp
|---build
|   |---lib        //.jar libraries
|   └---media      //Media files like images, sounds, videos
└---src
    └---main.js    //Main script file
```

# Example
```javascript
myApp
|---build
|   |---lib
|   |   └---mylib.jar
|   └---media
|       └---mypic.jpg
└---src
    |---main.js
    └---foo.js
```
foo.js
```javascript
print("Hello! I am foo.js")
```
main.js
```javascript
load("foo.js")
var JFrame = Java.type("javax.swing.JFrame");
var JPanel = Java.type("javax.swing.JPanel");
var JButton = Java.type("javax.swing.JButton");
var JLabel = Java.type("javax.swing.JLabel");
var ImageIcon = Java.type("javax.swing.ImageIcon");
var MigLayout = Java.type("com.mylib.MyClass");

var win = new JFrame("My Window");
win.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
win.setSize(400, 400);

var panel = new JPanel();
win.add(panel);

var picLabel = new JLabel(new ImageIcon("media/mypic.jpg"));
panel.add(picLabel);

win.setVisible(true);
```

# See more about [Nashorn](http://winterbe.com/posts/2014/04/05/java8-nashorn-tutorial/)
