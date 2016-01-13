# Teensy Tools
Some tools to provide helpful functions developing the Audio GUI of the Teensy Audio library.

##About
At first, there is a tool called "scanHeader.js" which will parse a directory of *.h files with the node definitions used in the node-RED based GUI.

##License
This software is under the MIT License. See LICENSE file

##What you need:
* All you find here in the package
* node.js and npm installed - all other modules will be installed automatically

##Ok, let's begin
After cloning the branch into a directory of your choice, you change into the branch's directory and type **npm install**. Now all needed packages will be installed by the package manager from node.js.

The you start the scanHeader.js tool with the following command:

*node scanHeader.js <path with \*.h files to scan> <path and name of outputfile>*


