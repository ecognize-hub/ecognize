(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['orgpreview.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"col-8 col-xl-5 bg-light px-2 mx-2 my-2 py-2\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":61},"end":{"line":1,"column":72}}}) : helper)))
    + "\">\n    <div class=\"row py-1\">\n        <div class=\"col-auto\">\n            <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"orgPageUrl") || (depth0 != null ? lookupProperty(depth0,"orgPageUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orgPageUrl","hash":{},"data":data,"loc":{"start":{"line":4,"column":21},"end":{"line":4,"column":37}}}) : helper)))
    + "\"><img alt=\"logo\" class=\"rounded of-contain\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"org") : depth0)) != null ? lookupProperty(stack1,"logo_thumbnail") : stack1), depth0))
    + "\" width=\"120\" height=\"60\" /></a>\n        </div>\n        <div class=\"col\">\n            <div class=\"row\">\n                <div class=\"col\">\n                    <h5><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"orgPageUrl") || (depth0 != null ? lookupProperty(depth0,"orgPageUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orgPageUrl","hash":{},"data":data,"loc":{"start":{"line":9,"column":33},"end":{"line":9,"column":49}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"org") : depth0)) != null ? lookupProperty(stack1,"display_name") : stack1), depth0))
    + "</a></h5>\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col\">\n                    <h6><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"orgPageUrl") || (depth0 != null ? lookupProperty(depth0,"orgPageUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"orgPageUrl","hash":{},"data":data,"loc":{"start":{"line":14,"column":33},"end":{"line":14,"column":49}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"org") : depth0)) != null ? lookupProperty(stack1,"local_name") : stack1), depth0))
    + "</a></h6>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
})();