(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['chatthread.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " ("
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"initiator") : stack1)) != null ? lookupProperty(stack1,"real_name") : stack1), depth0))
    + ")";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"recipient_users") : stack1),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":159},"end":{"line":14,"column":275}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ", "
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"user_name") : depth0), depth0))
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"real_name") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":213},"end":{"line":14,"column":266}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return " ("
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"real_name") : depth0), depth0))
    + ")";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "; "
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"recipient_orgs") : stack1),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":314},"end":{"line":14,"column":366}}})) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    return container.escapeExpression(container.lambda(depth0, depth0))
    + ", ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"border\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":24},"end":{"line":1,"column":35}}}) : helper)))
    + "\" data-threadId=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">\n    <div class=\"row bg-light\">\n        <div class=\"col\">\n            <div class=\"row\">\n                <div class=\"col\">\n                    Re: "
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"subject") : stack1), depth0))
    + "\n                </div>\n                <div class=\"col-auto\">\n                    "
    + alias4(((helper = (helper = lookupProperty(helpers,"last_message_timestamp") || (depth0 != null ? lookupProperty(depth0,"last_message_timestamp") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"last_message_timestamp","hash":{},"data":data,"loc":{"start":{"line":9,"column":20},"end":{"line":9,"column":48}}}) : helper)))
    + "\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col\">\n                    "
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"initiator") : stack1)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"initiator") : stack1)) != null ? lookupProperty(stack1,"real_name") : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":52},"end":{"line":14,"column":129}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"recipient_users") : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":129},"end":{"line":14,"column":282}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"recipient_orgs") : stack1),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":282},"end":{"line":14,"column":373}}})) != null ? stack1 : "")
    + "\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
})();