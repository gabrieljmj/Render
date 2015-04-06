/**
 * GabrielJMJ\Render
 *
 * @license MIT License
 * @author Gabriel Jacinto aka. GabrielJMJ <gamjj74@hotmail.com>
*/

/**
 * Collection for variables
 */
var VarsCollection = function () {
    this.vars = [];
}

/**
 * Sets a variable
 *
 * @param string name
 * @param mixed  value
 */
VarsCollection.prototype.setVar = function (name, value) {
    this.vars[name] = value;
}

/**
 * Check if the collection has a variable
 *
 * @return boolean
 */
VarsCollection.prototype.hasVar = function (name) {
     for (var k in this.vars) {
        if (k == name) {
            return true;
        }
     }

    return false;
}

/**
 * Returns the collection variables
 *
 * @return object
 */
VarsCollection.prototype.getVars = function () {
    return this.vars;
}

/**
 * Returns the value of some variable
 *
 * @param string name
 *
 * @return mixed
 */
VarsCollection.prototype.getVar = function (name) {
    return this.vars[name];
}


/**
 * An element is an HTML element generally
 *  indicated by it ID
 *
 * @param string id
 */
var Element = function (id) {
    this.id = id;
}

/**
 * Extend the vars collection
 */
Element.prototype = new VarsCollection();

/**
 * Returns the element ID
 *
 * @return string
 */
Element.prototype.getId = function () {
    return this.id;
}

/**
 * Pharser tools
 */
var Parser = function () {
}

/**
 * Returns the vars of certain code piece
 *
 * @param string content
 *
 * @return object
 */
Parser.prototype.getVarsFromContent = function (content) {
    var regexp = /\${([a-zA-Z0-9._\.]+)}/g;
    var result = [];

    while ((vars = regexp.exec(content)) != null) {
        result.push(vars[1]);
    }

    return result;
}

/**
 * Parser for element
 *
 * @param Element element
 */
var ElementParser = function (element) {
    this.element = element;
}

/**
 * Extends Parser
 */
ElementParser.prototype = new Parser();

/**
 * Returns the foreaches of certain element
 *
 * @return object
 */
ElementParser.prototype.getLists = function () {
    var regexpForCatchListUsedVar = /\$foreach\(([a-zA-Z0-9. ]+)\)\{\s.*\s+\}/g;
    var regexpForCatchInside = /\$foreach\(.*\)\{(\s+.*\s+)\}/g;
    var regexpForCatchCompleteLists = /(\$foreach\(.*\)\{\s.*\s+\})/g;
    var content = document.getElementById(this.element.getId()).innerHTML;
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

/**
 * Returns all variables of certain element according to it ID
 *
 * @return object
 */
ElementParser.prototype.getVars = function () {
    return this.getVarsFromContent(document.getElementById(this.element.getId()).innerHTML);
}


/**
 * This will render your HTML with the specified changes
 */
var Render = function () {
    this.elements = [];
    this.globalVars = new VarsCollection();
}

/**
 * Indicates an element to work, setting variables
 *
 * @param string id
 *
 * @return Render
 */
Render.prototype.element = function (id) {
    this.elements.push(new Element(id));
    this.currentElement = id;
    this.currentGlobal = false;

    return this;
}

/**
 * Sets something for all file
 *
 * @return Render
 */
Render.prototype.global = function () {
    this.currentGlobal = true;

    return this;
}

/**
 * Sets a variable for the element wich are working on
 *
 * @param string name
 * @param mixed  value
 *
 * @return Render
 */
Render.prototype.setVar = function (name, value) {
    if (this.currentGlobal) {
        this.globalVars.setVar(name, value);
    } else {
        for (var k in this.elements) {
            if (this.elements[k].getId() === this.currentElement) {
                this.elements[k].setVar(name, value);
                this.elements[k] = this.elements[k];
            }
        }
    }

    return this;
}

/**
 * Returns the value of some variable of an element
 *
 * @param string elementId
 * @param string varName
 *
 * @return mixed
 */
Render.prototype.getVar = function (elementId, varName) {
    for (var k in this.elements) {
        if (this.elements[k].getId() === elementId) {
            return this.elements[k].getVar(varName);
        }
    }
}

/**
 * Renders the variables, changes their values on browser
 */
Render.prototype.render = function () {
    var htmls = [];
    for (var k in this.elements) {
        var element = this.elements[k];
        var parser = new ElementParser(element);
        var elementV = element.getVars();
        var lists   = parser.getLists(element.getId());
        var el      = document.getElementById(element.getId());
        var content = el.innerHTML;
        var contentList = [];

        for (var l in lists) {
            content = this.getListContent(lists[l]);
        }

        var vars = parser.getVarsFromContent(content);

        for (var y in vars) {
            if (element.hasVar(vars[y])){
                content = content.replace('${' + vars[y] + '}', element.getVar(vars[y]));
            } else if (this.globalVars.hasVar(vars[y])) {
                content = content.replace('${' + vars[y] + '}', this.globalVars.getVar(vars[y]));
            }
        }

        el.innerHTML = content;

        this.getListContent = function (list) {
            var contentVars = parser.getVarsFromContent(list.content);
            var toReplace = [];
            var toPut = [];
            var i = 0;
            for (var y in elementV) {
                if (list.array === y) {
                    var listArr = this.getVar(element.getId(), list.array);
                    var cContent = list.content;
                    var currentVar = list.var;
                    var currentContent = [];

                    for (var i = 0, length = contentVars.length; i < length; i++) {
                        if (contentVars[i].split('.')[0] == currentVar) {
                            for (var n = 0, lLength = listArr.length; n < lLength; n++) {
                                var realObj = contentVars[i].split('.');
                                realObj[0] = 'listArr[n]';
                                if (typeof currentContent[n] !== 'undefined') {
                                    currentContent[n] = currentContent[n].replace(
                                        '${' + contentVars[i] + '}',
                                        eval(realObj.join('.'))
                                    );
                                } else {
                                    currentContent[n] = cContent.replace(
                                        '${' + contentVars[i] + '}',
                                        eval(realObj.join('.'))
                                    );
                                }
                            }
                        }
                    }
                }
            }

            return content.replace(list.complete, currentContent.join(''));
        }
    }

    var parser = new Parser();
    var body = document.body;
    var bodyContent = body.innerHTML;
    var varsFromBody = parser.getVarsFromContent(bodyContent);

    for (var v in varsFromBody) {
        if (this.globalVars.hasVar(varsFromBody[v])) {
            bodyContent = bodyContent.replace('${' + varsFromBody[v] + '}', this.globalVars.getVar(varsFromBody[v]));
        }
    }

    body.innerHTML = bodyContent;
}

render = new Render();