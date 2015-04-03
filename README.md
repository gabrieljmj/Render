Render
======
Developed just for fun.<br />
If I don't have what to do, MAYBE I develop more features for it.

##Example
```js
var render = new Render();

render
    .element('user')
        .setVar('name', 'Gabriel')
        .setVar('age',  16)
    .element('status')
        .setVar('status', 'Online')
    .render();
```

And the HTML
```html
<div id="user">
    ${name}, ${age}
</div>

<div id="status">
    ${status}
</div>
```

Result:
```
Gabriel, 16
Online
```

### Using foreach
```js
render
    .element('your-websites')
        .setVar('websites', [
            {name: {company: 'Facebook Inc.'}},
            {name: {company: 'GitHub'}}
        ])
    .render();
```
HTML:
```html
<div id="your-websites">
    $foreach(websites as website){
        <li>${website.company}
    }
</div>
```
Result:
```
• Facebook Inc.
• GitHub
```