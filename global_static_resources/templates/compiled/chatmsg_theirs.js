(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['chatmsg_theirs.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row py-4\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":26},"end":{"line":1,"column":37}}}) : helper)))
    + "\">\n    <div class=\"col-auto text-center\">\n        <div class=\"row\">\n            <div class=\"col\">\n                 <img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"msg") : depth0)) != null ? lookupProperty(stack1,"sender") : stack1)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" />\n            </div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col\">\n                 "
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"msg") : depth0)) != null ? lookupProperty(stack1,"sender") : stack1)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "\n            </div>\n        </div>\n    </div>\n    <div class=\"col px-4\">\n        <div class=\"border rounded border-secondary px-2 py-1 bg-light\">\n            <div class=\"row\">\n                <div class=\"col\">\n                    "
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"msg") : depth0)) != null ? lookupProperty(stack1,"content") : stack1), depth0))
    + "\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col\">\n                    <small>"
    + alias4(((helper = (helper = lookupProperty(helpers,"sent_timestamp") || (depth0 != null ? lookupProperty(depth0,"sent_timestamp") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sent_timestamp","hash":{},"data":data,"loc":{"start":{"line":23,"column":27},"end":{"line":23,"column":47}}}) : helper)))
    + "</small>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
})();