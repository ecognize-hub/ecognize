(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['comment_thread.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row bg-light shadow-lg rounded my-5 py-3\" id=\""
    + alias1(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":58},"end":{"line":1,"column":69}}}) : helper)))
    + "\">\n    <div class=\"col\">\n        <div class=\"row\">\n            <div class=\"col\" id=\"id_div_msgCtr_for_thread_"
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">\n            </div>\n        </div>\n        <div class=\"row mt-2\">\n            <div class=\"col-auto ml-4\">\n                <div class=\"row\">\n                    <div class=\"col-auto\">\n                        <img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"me") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" />\n                    </div>\n                    <div class=\"col text-left\">\n                        <div class=\"row\">\n                            <div class=\"col\">\n                                "
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"me") : depth0)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + "\n                            </div>\n                        </div>\n                        <div class=\"row\">\n                            <div class=\"col\">\n                                "
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"me") : depth0)) != null ? lookupProperty(stack1,"real_name") : stack1), depth0))
    + "\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"col d-flex flex-column mx-4\">\n                <textarea class=\"d-flex flex-fill verticalscroll\" id=\"id_msg_textarea_"
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" rows=\"5\" placeholder=\"Write your message here...\"></textarea>\n            </div>\n            <div class=\"col-auto mr-4\">\n                <button class=\"btn btn-primary\" id=\"btn_send_"
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"thread") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">Send</button>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
})();