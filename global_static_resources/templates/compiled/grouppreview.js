(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['grouppreview.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <div class=\"row\">\n                            <div class=\"col\">\n                                <a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"href") : depth0), depth0))
    + "\" data-toggle=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"toggle") : depth0), depth0))
    + "\" data-target=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"target") : depth0), depth0))
    + "\" data-arg-id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"argId") : depth0), depth0))
    + "\"><i class=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"iconClasses") : depth0), depth0))
    + "\"></i></a>\n                            </div>\n                        </div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"col-8 col-xl-5 bg-light shadow-sm px-2 mx-4 my-2 py-2\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":71},"end":{"line":1,"column":82}}}) : helper)))
    + "\">\n    <div class=\"row py-1\">\n        <div class=\"col-auto\">\n            <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"groupPageUrl") || (depth0 != null ? lookupProperty(depth0,"groupPageUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"groupPageUrl","hash":{},"data":data,"loc":{"start":{"line":4,"column":21},"end":{"line":4,"column":39}}}) : helper)))
    + "\"><img alt=\"logo\" class=\"rounded of-contain\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"group") : depth0)) != null ? lookupProperty(stack1,"logo_thumbnail") : stack1), depth0))
    + "\" width=\"120\" height=\"60\" /></a>\n        </div>\n        <div class=\"col\">\n            <div class=\"row\">\n                <div class=\"col\">\n                    <h5><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"groupPageUrl") || (depth0 != null ? lookupProperty(depth0,"groupPageUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"groupPageUrl","hash":{},"data":data,"loc":{"start":{"line":9,"column":33},"end":{"line":9,"column":51}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"group") : depth0)) != null ? lookupProperty(stack1,"display_name") : stack1), depth0))
    + "</a></h5>\n                </div>\n                <div class=\"col-auto\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"actions") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":20},"end":{"line":18,"column":29}}})) != null ? stack1 : "")
    + "                </div>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
})();