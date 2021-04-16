(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['eventpreview.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " <span class=\"badge badge-secondary\">"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</span>";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"col-"
    + alias4(((helper = (helper = lookupProperty(helpers,"colWidth") || (depth0 != null ? lookupProperty(depth0,"colWidth") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"colWidth","hash":{},"data":data,"loc":{"start":{"line":1,"column":16},"end":{"line":1,"column":30}}}) : helper)))
    + " bg-light my-3 py-3\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":55},"end":{"line":1,"column":66}}}) : helper)))
    + "\">\n    <div class=\"row py-1\">\n        <div class=\"col\"><h4><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"eventLink") || (depth0 != null ? lookupProperty(depth0,"eventLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventLink","hash":{},"data":data,"loc":{"start":{"line":3,"column":38},"end":{"line":3,"column":53}}}) : helper)))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":3,"column":55},"end":{"line":3,"column":66}}}) : helper)))
    + "</a>"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"badges") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":70},"end":{"line":3,"column":149}}})) != null ? stack1 : "")
    + "</h4></div>\n    </div>\n    <div class=\"row py-1\">\n        <div class=\"col\"><i class=\"fas fa-map-marker-alt\"></i> "
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":6,"column":63},"end":{"line":6,"column":76}}}) : helper)))
    + "</div>\n        <div class=\"col\">\n            <i class=\"fas fa-fw fa-clock\"></i> "
    + alias4(((helper = (helper = lookupProperty(helpers,"datetime_start") || (depth0 != null ? lookupProperty(depth0,"datetime_start") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"datetime_start","hash":{},"data":data,"loc":{"start":{"line":8,"column":47},"end":{"line":8,"column":67}}}) : helper)))
    + " - "
    + alias4(((helper = (helper = lookupProperty(helpers,"datetime_end") || (depth0 != null ? lookupProperty(depth0,"datetime_end") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"datetime_end","hash":{},"data":data,"loc":{"start":{"line":8,"column":70},"end":{"line":8,"column":88}}}) : helper)))
    + "\n        </div>\n    </div>\n</div>";
},"useData":true});
})();