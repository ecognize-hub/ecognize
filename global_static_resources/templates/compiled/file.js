(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['file.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":21},"end":{"line":1,"column":32}}}) : helper)))
    + "\" data-level=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"level") || (depth0 != null ? lookupProperty(depth0,"level") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"level","hash":{},"data":data,"loc":{"start":{"line":1,"column":46},"end":{"line":1,"column":57}}}) : helper)))
    + "\" data-id=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"file") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">\n    <div class=\"col-auto\">"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"justification") || (depth0 != null ? lookupProperty(depth0,"justification") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"justification","hash":{},"data":data,"loc":{"start":{"line":2,"column":26},"end":{"line":2,"column":47}}}) : helper))) != null ? stack1 : "")
    + "</div>\n    <div class=\"col\">\n        <i class=\"invisible far fa-fw fa-plus-square\"></i>&nbsp;<i class=\"far fa-fw fa-file\"></i>&nbsp;<span data-id=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"file") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" id=\"id_nameSpan_file_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"file") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"fileName") || (depth0 != null ? lookupProperty(depth0,"fileName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fileName","hash":{},"data":data,"loc":{"start":{"line":4,"column":169},"end":{"line":4,"column":183}}}) : helper)))
    + "</span>\n    </div>\n    <div class=\"col-4\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"time_last_edited") || (depth0 != null ? lookupProperty(depth0,"time_last_edited") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"time_last_edited","hash":{},"data":data,"loc":{"start":{"line":6,"column":23},"end":{"line":6,"column":45}}}) : helper)))
    + "</div>\n</div>";
},"useData":true});
})();