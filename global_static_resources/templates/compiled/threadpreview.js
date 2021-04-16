(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['threadpreview.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row py-3 px-3 mx-3 bg-light border rounded\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":60},"end":{"line":1,"column":71}}}) : helper)))
    + "\">\n    <div class=\"col-auto\">\n        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":3,"column":17},"end":{"line":3,"column":40}}}) : helper)))
    + "\"><img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" /></a>\n    </div>\n    <div class=\"col\">\n        <div class=\"row\">\n            <div class=\"col\">\n                <h5 data-label=\"subject\"><a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"threadLink") || (depth0 != null ? lookupProperty(depth0,"threadLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"threadLink","hash":{},"data":data,"loc":{"start":{"line":8,"column":50},"end":{"line":8,"column":66}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"subject") : stack1), depth0))
    + "</a></h5>\n            </div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col\">\n                <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":13,"column":25},"end":{"line":13,"column":48}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + "</a>, "
    + alias4(((helper = (helper = lookupProperty(helpers,"started_timestamp") || (depth0 != null ? lookupProperty(depth0,"started_timestamp") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"started_timestamp","hash":{},"data":data,"loc":{"start":{"line":13,"column":78},"end":{"line":13,"column":101}}}) : helper)))
    + "\n            </div>\n        </div>\n    </div>\n    <div class=\"col-2\" data-label=\"number_of_responses\">\n        "
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"number_of_responses") : stack1), depth0))
    + "\n    </div>\n    <div class=\"col-4\">\n        <div class=\"row\">\n            <div class=\"col-auto\">\n                <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"lastPostUserProfileLink") || (depth0 != null ? lookupProperty(depth0,"lastPostUserProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lastPostUserProfileLink","hash":{},"data":data,"loc":{"start":{"line":23,"column":25},"end":{"line":23,"column":54}}}) : helper)))
    + "\"><img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"last_post_user") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" /></a>\n            </div>\n            <div class=\"col\">\n                <div class=\"row\">\n                    <div class=\"col\">\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"lastPostUserProfileLink") || (depth0 != null ? lookupProperty(depth0,"lastPostUserProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lastPostUserProfileLink","hash":{},"data":data,"loc":{"start":{"line":28,"column":33},"end":{"line":28,"column":62}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"last_post_user") : depth0)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + "</a>\n                    </div>\n                </div>\n                <div class=\"row\">\n                    <div class=\"col\">\n                        "
    + alias4(((helper = (helper = lookupProperty(helpers,"last_post_datetime") || (depth0 != null ? lookupProperty(depth0,"last_post_datetime") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"last_post_datetime","hash":{},"data":data,"loc":{"start":{"line":33,"column":24},"end":{"line":33,"column":48}}}) : helper)))
    + "\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
})();