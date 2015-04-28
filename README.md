Render
======
Very simple template engine.
Developed just for fun.<br />
If I don't have what to do, MAYBE I develop more features for it.

## Including
```html
<script src="https://cdn.rawgit.com/GabrielJMJ/Render/master/src/render.min.js"></script>
```

##Example
```js
Render
    .global()
        .setVar('title', 'My page')
    .element('user')
        .setVar('name', 'Gabriel')
        .setVar('age',  16)
    .element('status')
        .setVar('status', {name: 'Online', code: 1})
    .render();
```

And the HTML
```html
<header>
    <h1>${title}</h1>
</header>

<div id="user">
    ${name}, ${age}
</div>

<div id="status">
    ${status.name}
</div>
```

Result:
```
# My Page
Gabriel, 16
Online
```
## - [Live Example](http://jsfiddle.net/GabrielJMJ/ss9b116r/)
### Using foreach
```js
Render
    .element('your-websites')
        .setVar('websites', [
            {name: 'Facebook'},
            {name: 'GitHub'}
        ])
    .render();
```
HTML:
```html
<div id="your-websites">
    $foreach(websites as website){
        <li>${website.name}
    }
</div>
```
Result:
```
• Facebook
• GitHub
```

## License
The MIT License (MIT)

Copyright (c) 2015 Gabriel Jacinto

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.