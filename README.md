![Logo](admin/reanimator.png)
# ioBroker.reanimator

[![NPM version](http://img.shields.io/npm/v/iobroker.reanimator.svg)](https://www.npmjs.com/package/iobroker.reanimator)
[![Downloads](https://img.shields.io/npm/dm/iobroker.reanimator.svg)](https://www.npmjs.com/package/iobroker.reanimator)
[![Dependency Status](https://img.shields.io/david/instalator/iobroker.reanimator.svg)](https://david-dm.org/instalator/iobroker.reanimator)
[![Known Vulnerabilities](https://snyk.io/test/github/instalator/ioBroker.reanimator/badge.svg)](https://snyk.io/test/github/instalator/ioBroker.reanimator)
[![Travis-CI](http://img.shields.io/travis/instalator/ioBroker.reanimator/master.svg)](https://travis-ci.org/instalator/ioBroker.reanimator)

[![NPM](https://nodei.co/npm/iobroker.reanimator.png?downloads=true)](https://nodei.co/npm/iobroker.reanimator/)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PFUALWTR2CTPY)

## reanimator adapter for ioBroker

Removing excess garbage from an objects.json file

![settings](admin/set.png)

All files are saved in a directory ```\ioBroker\iobroker-data\```
* **reanimator_backup_objects.json** - Copy of the original ```objects.json``` file. Created automatically when the adapter starts
* **reanimator_work_objects.json** - Copy of the original ```objects.json``` file the adapter works with. Created automatically when the adapter starts
* **reanimator_objects_formatted.json** - The file is created when you click the ```Save formatted``` button. 
He does the following:

This is what the contents of the original ```objects.json``` file look like:
![objects.json](admin/org.png)

This will look like the contents of the ```reanimator_objects_formatted.json``` file:
![reanimator_objects_formatted.json](admin/frm.png)

## Changelog

### 0.1.0
* (instalator) initial release

## License
MIT License

Copyright (c) 2020 instalator <vvvalt@mail.ru>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.