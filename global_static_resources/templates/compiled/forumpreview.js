(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['forumpreview.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":21},"end":{"line":1,"column":32}}}) : helper)))
    + "\">\n    <div class=\"col bg-light mx-1 px-1 my-1 py-1\">\n        <ul class=\"mb-1\">\n            <li><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"forumLink") || (depth0 != null ? lookupProperty(depth0,"forumLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"forumLink","hash":{},"data":data,"loc":{"start":{"line":4,"column":25},"end":{"line":4,"column":40}}}) : helper)))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"forumName") || (depth0 != null ? lookupProperty(depth0,"forumName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"forumName","hash":{},"data":data,"loc":{"start":{"line":4,"column":42},"end":{"line":4,"column":57}}}) : helper)))
    + "</a></li>\n        </ul>\n    </div>\n</div>";
},"useData":true});
})();