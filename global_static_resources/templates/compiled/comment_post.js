(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['comment_post.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "<i title=\"Unthank\" class=\"fas fa-handshake-slash\"></i>&nbsp;-1";
},"3":function(container,depth0,helpers,partials,data) {
    return "<i title=\"Thank the author for this\" class=\"far fa-handshake\"></i>&nbsp;+1";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row py-3 rounded\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":34},"end":{"line":1,"column":45}}}) : helper)))
    + "\">\n    <div class=\"col-auto ml-4\">\n        <div class=\"row\">\n            <div class=\"col-auto>\n                <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":5,"column":25},"end":{"line":5,"column":48}}}) : helper)))
    + "\" title=\"View user profile\"><img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" /></a>\n            </div>\n            <div class=\"col text-left\">\n                <div class=\"row\">\n                    <div class=\"col\">\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":10,"column":33},"end":{"line":10,"column":56}}}) : helper)))
    + "\" title=\"View user profile\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + "</a>\n                    </div>\n                </div>\n                <div class=\"row\">\n                    <div class=\"col\">\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileLink") || (depth0 != null ? lookupProperty(depth0,"authorProfileLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileLink","hash":{},"data":data,"loc":{"start":{"line":15,"column":33},"end":{"line":15,"column":56}}}) : helper)))
    + "\" title=\"View user profile\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"real_name") : stack1), depth0))
    + "</a>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    <div class=\"col mx-4\">\n        "
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"post") : depth0)) != null ? lookupProperty(stack1,"content") : stack1), depth0))
    + "\n    </div>\n    <div class=\"col-auto mr-4\">\n        <div class=\"row\">\n            <div class=\"col-auto\">\n                "
    + alias4(((helper = (helper = lookupProperty(helpers,"sent_timestamp") || (depth0 != null ? lookupProperty(depth0,"sent_timestamp") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sent_timestamp","hash":{},"data":data,"loc":{"start":{"line":27,"column":16},"end":{"line":27,"column":36}}}) : helper)))
    + "\n            </div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col-auto\">\n                <span data-objid=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"post") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" data-ctid=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"ctid") || (depth0 != null ? lookupProperty(depth0,"ctid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ctid","hash":{},"data":data,"loc":{"start":{"line":32,"column":60},"end":{"line":32,"column":70}}}) : helper)))
    + "\" class=\"thanksStatNumber\" id=\"id_thankstats_"
    + alias4(((helper = (helper = lookupProperty(helpers,"ctid") || (depth0 != null ? lookupProperty(depth0,"ctid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ctid","hash":{},"data":data,"loc":{"start":{"line":32,"column":115},"end":{"line":32,"column":125}}}) : helper)))
    + "_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"post") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"post") : depth0)) != null ? lookupProperty(stack1,"thanks") : stack1), depth0))
    + "</span><span data-objid=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"post") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" data-ctid=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"ctid") || (depth0 != null ? lookupProperty(depth0,"ctid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ctid","hash":{},"data":data,"loc":{"start":{"line":32,"column":209},"end":{"line":32,"column":219}}}) : helper)))
    + "\" id=\"id_thankbtn_"
    + alias4(((helper = (helper = lookupProperty(helpers,"ctid") || (depth0 != null ? lookupProperty(depth0,"ctid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ctid","hash":{},"data":data,"loc":{"start":{"line":32,"column":237},"end":{"line":32,"column":247}}}) : helper)))
    + "_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"post") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"post") : depth0)) != null ? lookupProperty(stack1,"thanked") : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":32,"column":263},"end":{"line":32,"column":434}}})) != null ? stack1 : "")
    + "</span>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
})();