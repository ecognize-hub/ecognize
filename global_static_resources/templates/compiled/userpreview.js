(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['userpreview.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                  <div class=\"row\">\n                      <div class=\"col\">\n                          <a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"href") : depth0), depth0))
    + "\" data-toggle=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"toggle") : depth0), depth0))
    + "\" data-target=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"target") : depth0), depth0))
    + "\" data-arg-id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"argId") : depth0), depth0))
    + "\"><i class=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"iconClasses") : depth0), depth0))
    + "\"></i></a>\n                      </div>\n                  </div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"col-"
    + alias4(((helper = (helper = lookupProperty(helpers,"colWidth") || (depth0 != null ? lookupProperty(depth0,"colWidth") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"colWidth","hash":{},"data":data,"loc":{"start":{"line":1,"column":16},"end":{"line":1,"column":30}}}) : helper)))
    + " bg-light rounded mx-3 my-3 text-left\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":73},"end":{"line":1,"column":84}}}) : helper)))
    + "\">\n    <div class=\"row py-1\">\n        <div class=\"col-auto\">\n            <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"profileLink") || (depth0 != null ? lookupProperty(depth0,"profileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"profileLink","hash":{},"data":data,"loc":{"start":{"line":4,"column":21},"end":{"line":4,"column":38}}}) : helper)))
    + "\" title=\"View user profile\"><img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"thumbnail") || (depth0 != null ? lookupProperty(depth0,"thumbnail") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"thumbnail","hash":{},"data":data,"loc":{"start":{"line":4,"column":119},"end":{"line":4,"column":134}}}) : helper)))
    + "\" width=\"50\" height=\"50\"/></a>\n        </div>\n        <div class=\"col\">\n            <div class=\"row\">\n                <div class=\"col\">\n                    <h5><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"profileLink") || (depth0 != null ? lookupProperty(depth0,"profileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"profileLink","hash":{},"data":data,"loc":{"start":{"line":9,"column":33},"end":{"line":9,"column":50}}}) : helper)))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"user_name") || (depth0 != null ? lookupProperty(depth0,"user_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"user_name","hash":{},"data":data,"loc":{"start":{"line":9,"column":52},"end":{"line":9,"column":67}}}) : helper)))
    + "</a></h5>\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col\">\n                    <h6><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"profileLink") || (depth0 != null ? lookupProperty(depth0,"profileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"profileLink","hash":{},"data":data,"loc":{"start":{"line":14,"column":33},"end":{"line":14,"column":50}}}) : helper)))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"real_name") || (depth0 != null ? lookupProperty(depth0,"real_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"real_name","hash":{},"data":data,"loc":{"start":{"line":14,"column":52},"end":{"line":14,"column":67}}}) : helper)))
    + "</a></h6>\n                </div>\n            </div>\n        </div>\n        <div class=\"col-auto\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"actions") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":14},"end":{"line":25,"column":23}}})) != null ? stack1 : "")
    + "        </div>\n    </div>\n</div>\n";
},"useData":true});
})();