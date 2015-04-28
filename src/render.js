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

Parser.prototype.getListsFromContent = function (content) {
    var regexpForCatchListUsedVar = /\$foreach\(([a-zA-Z0-9. ]+)\)\{\s.*\s+\}/g;
    var regexpForCatchInside = /\$foreach\(.*\)\{(\s+.*\s+)\}/g;
    var regexpForCatchCompleteLists = /(\$foreach\(.*\)\{\s.*\s+\})/g;
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
    return this.getListsFromContent(document.getElementById(this.element.getId()).innerHTML);
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

Render.prototype.setFromCodeParts = function (parser, part) {
    var partContent = part.innerHTML;
    var varsFromPart = parser.getVarsFromContent(partContent);
    var lists = parser.getListsFromContent(partContent);

    for (list in lists) {
        partContent = this.getListContent(lists[list]);
    }
    
    part.innerHTML = partContent;

    for (var v in varsFromPart) {
        if (this.globalVars.hasVar(varsFromPart[v])) {
            partContent = partContent.replace('${' + varsFromPart[v] + '}', this.globalVars.getVar(varsFromPart[v]));
        }
    }

    part.innerHTML = partContent;
}

Render.prototype.getListContent = function (parser, list, element, content) {
    var contentVars = parser.getVarsFromContent(list.content);

    for (var y in element.getVars()) {
        if (list.array === y) {
            var listArr = this.getVar(element.getId(), list.array);
            var cContent = list.content;
            var currentVar = list.var;
            var currentContent = [];

            for (var i = 0, length = contentVars.length; i < length; i++) {
                if (contentVars[i].split('.')[0] == currentVar) {
                    for (var n = 0, lLength = listArr.length; n < lLength; n++) {
                        var realObj = contentVars[i].split('.');
                        realObj.splice(0, 1);
                        var toReplace = listArr[n];

                        for (var obj in realObj) {
                            toReplace = toReplace[realObj[obj]];
                        }
                        
                        if (typeof currentContent[n] !== 'undefined') {
                            currentContent[n] = currentContent[n].replace(
                                '${' + contentVars[i] + '}',
                                   toReplace
                            );
                        } else {
                            currentContent[n] = cContent.replace(
                                '${' + contentVars[i] + '}',
                                toReplace
                            );
                        }
                    }
                }
            }
        }
    }

    return content.replace(list.complete, currentContent.join(''));
}

/**
 * Renders the variables, changes their values on browser
 */
Render.prototype.render = function () {
    for (var k in this.elements) {
        var element = this.elements[k];
        var elparser = new ElementParser(element);
        var lists   = elparser.getLists(element.getId());
        var el      = document.getElementById(element.getId());
        var content = el.innerHTML;
        var contentList = [];

        for (var l in lists) {
            content = this.getListContent(elparser, lists[l], element, content);
        }

        var vars = elparser.getVarsFromContent(content);

        for (var y in vars) {
            var varParts = vars[y].split('.');
            var varName = varParts[0];
            varParts.splice(0, 1);
            var toReplace = element.getVar(varName);

            if (element.hasVar(varName)){
                if (varParts.length && typeof element.getVar(varName) == 'object') {
                    for (var v in varParts) {
                        toReplace = toReplace[varParts[v]];
                    }
                }
                
                content = content.replace('${' + vars[y] + '}', toReplace);
            }
        }

        el.innerHTML = content;
    }

    var parser = new Parser();
    this.setFromCodeParts(parser, document.body);
    this.setFromCodeParts(parser, document.head);
}

Render = new Render();