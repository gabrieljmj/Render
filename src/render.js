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

Element.prototype.getVar = function (varName) {
    for (var k in this.vars) {
        if (this.vars[k].name === varName) {
            return this.vars[k].value;
        }
    }
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
    return this.getVarsFromContent(document.getElementById(id).innerHTML);
}

Render.prototype.getLists = function (id) {
    var regexpForCatchListUsedVar = /\$foreach\(([a-zA-Z0-9. ]+)\)\{\s.*\s+\}/g;
    var regexpForCatchInside = /\$foreach\(.*\)\{(\s+.*\s+)\}/g;
    var regexpForCatchCompleteLists = /(\$foreach\(.*\)\{\s.*\s+\})/g;
    var content = document.getElementById(id).innerHTML;
    var lists = [];

    while((names = regexpForCatchCompleteLists.exec(content)) !== null) {
        var list = names[1];
        var listArray = regexpForCatchListUsedVar.exec(list);
        listArray = listArray[1];
        var usedVar = listArray.split(' as ');
        listArray = usedVar[0];
        usedVar = usedVar[usedVar.length - 1];
        var listContent = regexpForCatchInside.exec(list);
        listContent = listContent[1];
        var data = {array: listArray, var: usedVar, content: listContent, complete: list};

        lists.push(data);
    }

    return lists;
}

Render.prototype.getVar = function (elementId, varName) {
    for (var k in this.elements) {
        if (this.elements[k].getId() === elementId) {
            return this.elements[k].getVar(varName);
        }
    }
}

Render.prototype.getVarsFromContent = function (content) {
    var regexp = /\${([a-zA-Z0-9._\.]+)}/g;
    var result = [];

    while ((vars = regexp.exec(content)) != null) {
        result.push(vars[1]);
    }

    return result;
}

Render.prototype.render = function () {
    for (var k in this.elements) {
        var element = this.elements[k];
        var vars    = this.getVars(element.getId());
        var elementV = element.getVars();
        var lists   = this.getLists(element.getId());
        var el      = document.getElementById(element.getId());
        var content = el.innerHTML;
        var elVars  = element.getVars();
        var contentList = [];

        for (var l in lists) {
            var contentVars = this.getVarsFromContent(lists[l].content);
            for (var y in elementV) {
                if (lists[l].array === elementV[y].name) {
                    for (var v in contentVars) {
                        var objVarSplit = contentVars[v].split('.');
                        objVar = objVarSplit[0];

                        if (objVar === lists[l].var) {
                            var listArr = this.getVar(element.getId(), lists[l].array);
                            originalObj = objVarSplit.join('.');
                            for (var lv in listArr) {
                                var newObjVar = objVarSplit;
                                newObjVar[0] = 'listArr[lv]';
                                var obj = newObjVar.join('.');
                                contentList.push(lists[l].content.replace('${' + originalObj + '}', eval(obj)));
                            }
                        }
                    }
                }
            }

            content = content.replace(lists[l].complete, contentList.join(''));
        }
        
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