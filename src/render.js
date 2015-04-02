function Element (id) {
    this.id = id;
    this.vars = [];
}

Element.prototype.setVar = function (name, value) {
    if (!this.vars.length) {
        this.vars.push({name: name, value: value});
    } else {
        var exists = false;

        for (var k in this.vars) {
            if (this.vars[k].name === name) {
                this.vars[k].value = value;
                exists = true;
            }
        }

        if (!exists) {
            this.vars.push({name: name, value: value});
        }
    }
}

Element.prototype.getId = function () {
    return this.id;
}

Element.prototype.getVars = function () {
    return this.vars;
}

function Render() {
    this.elements = [];
}

Render.prototype.element = function (id) {
    this.elements.push(new Element(id));
    this.currentElement = id;

    return this;
}

Render.prototype.setVar = function (name, value) {
    for (var k in this.elements) {
        if (this.elements[k].getId() === this.currentElement) {
            this.elements[k].setVar(name, value);
            this.elements[k] = this.elements[k];
        }
    }

    return this;
}

Render.prototype.getVars = function (id) {
    var regexp = /\${([a-zA-Z0-9]+)}/g;
    var content = document.getElementById(id).innerHTML;
    var result = [];

    while ((vars = regexp.exec(content)) != null) {
        result.push(vars[1]);
    }

    return result;
}

Render.prototype.render = function () {
    for (var k in this.elements) {
        var element = this.elements[k];
        var vars = this.getVars(element.getId());
        var el = document.getElementById(element.getId());
        var content = el.innerHTML;
        var elVars = element.getVars();

        for (var z in elVars) {
            for (var y in vars) {
                if (vars[y] === elVars[z].name){
                    content = content.replace('${' + vars[y] + '}', elVars[z].value);
                } 
            }
        }

        el.innerHTML = content;
    }
}