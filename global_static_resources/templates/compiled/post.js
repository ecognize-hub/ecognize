(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['post.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"row\">\n            <div class=\"col\">\n                <a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"href") : depth0), depth0))
    + "\" data-toggle=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"toggle") : depth0), depth0))
    + "\" data-target=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"target") : depth0), depth0))
    + "\"><i class=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"iconClasses") : depth0), depth0))
    + "\"></i></a>\n            </div>\n        </div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row mx-3 px-3 my-2 py-3 bg-white border shadow-sm rounded\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":75},"end":{"line":1,"column":86}}}) : helper)))
    + "\">\n    <div class=\"col-3\">\n        <div class=\"row\">\n            <div class=\"col justify-content-center text-center\">\n                <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":5,"column":25},"end":{"line":5,"column":48}}}) : helper)))
    + "\"><img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" /></a>\n            </div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col justify-content-center text-center\">\n                <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":10,"column":25},"end":{"line":10,"column":48}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + "</a>\n            </div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col justify-content-center text-center\">\n                <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":15,"column":25},"end":{"line":15,"column":48}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"real_name") : stack1), depth0))
    + "</a>\n            </div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col justify-content-center text-center\">\n                "
    + alias4(((helper = (helper = lookupProperty(helpers,"sent_timestamp") || (depth0 != null ? lookupProperty(depth0,"sent_timestamp") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sent_timestamp","hash":{},"data":data,"loc":{"start":{"line":20,"column":16},"end":{"line":20,"column":36}}}) : helper)))
    + "\n            </div>\n        </div>\n    </div>\n    <div class=\"col-8\" data-label=\"content\" data-translator=\"newlineToLinebreaks\" data-escape=\"false\">\n        "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"content") || (depth0 != null ? lookupProperty(depth0,"content") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"content","hash":{},"data":data,"loc":{"start":{"line":25,"column":8},"end":{"line":25,"column":23}}}) : helper))) != null ? stack1 : "")
    + "\n    </div>\n    <div class=\"col-1 countAndActions\">\n        <div class=\"row\">\n            <div class=\"col\">\n                <a name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"postCount") || (depth0 != null ? lookupProperty(depth0,"postCount") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"postCount","hash":{},"data":data,"loc":{"start":{"line":30,"column":25},"end":{"line":30,"column":40}}}) : helper)))
    + "\" href=\"#"
    + alias4(((helper = (helper = lookupProperty(helpers,"postCount") || (depth0 != null ? lookupProperty(depth0,"postCount") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"postCount","hash":{},"data":data,"loc":{"start":{"line":30,"column":49},"end":{"line":30,"column":64}}}) : helper)))
    + "\">&#35;&nbsp;"
    + alias4(((helper = (helper = lookupProperty(helpers,"postCount") || (depth0 != null ? lookupProperty(depth0,"postCount") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"postCount","hash":{},"data":data,"loc":{"start":{"line":30,"column":77},"end":{"line":30,"column":92}}}) : helper)))
    + "</a>\n            </div>\n        </div>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"actions") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":8},"end":{"line":39,"column":17}}})) != null ? stack1 : "")
    + "    </div>\n</div>";
},"useData":true});
})();