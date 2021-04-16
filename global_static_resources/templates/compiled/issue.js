(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['issue.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"row bg-light rounded shadow-sm mx-5 my-4 px-2 py-3\" id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"domId") || (depth0 != null ? lookupProperty(depth0,"domId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domId","hash":{},"data":data,"loc":{"start":{"line":1,"column":68},"end":{"line":1,"column":79}}}) : helper)))
    + "\">\n    <div class=\"col\">\n        <div class=\"row\">\n            <div class=\"col-auto text-center\">\n                <div class=\"row flex-row justify-content-center\">\n                    <div class=\"col-auto\">\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileUrl") || (depth0 != null ? lookupProperty(depth0,"authorProfileUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileUrl","hash":{},"data":data,"loc":{"start":{"line":7,"column":33},"end":{"line":7,"column":55}}}) : helper)))
    + "\"><img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" /></a>\n                    </div>\n                </div>\n                <div class=\"row flex-row justify-content-center\">\n                    <div class=\"col-auto\">\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileUrl") || (depth0 != null ? lookupProperty(depth0,"authorProfileUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileUrl","hash":{},"data":data,"loc":{"start":{"line":12,"column":33},"end":{"line":12,"column":55}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + "</a>\n                    </div>\n                </div>\n                <div class=\"row flex-row justify-content-center\">\n                    <div class=\"col-auto\">\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"authorProfileUrl") || (depth0 != null ? lookupProperty(depth0,"authorProfileUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"authorProfileUrl","hash":{},"data":data,"loc":{"start":{"line":17,"column":33},"end":{"line":17,"column":55}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"author") : depth0)) != null ? lookupProperty(stack1,"real_name") : stack1), depth0))
    + "</a>\n                    </div>\n                </div>\n            </div>\n            <div class=\"col\">\n                <div class=\"row\">\n                    <div class=\"col\">\n                        <h3>"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "</h3>\n                    </div>\n                </div>\n                <div class=\"row my-2\">\n                    <div class=\"col\">\n                        "
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "\n                    </div>\n                </div>\n                <div class=\"row mt-3 mb-1\">\n                    <div class=\"col\">\n                        <button id=\"button_showhidecomments_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" class=\"btn btn-secondary font-weight-light\">Show comments</button>\n                    </div>\n                </div>\n            </div>\n            <div class=\"col-auto\">\n                <div class=\"row\">\n                    <div class=\"col-auto\">\n                        <h4>\n                            <span class=\"badge badge-secondary\"><i title=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"typeBadge") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "\" class=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"typeBadge") : depth0)) != null ? lookupProperty(stack1,"iconClasses") : stack1), depth0))
    + "\"></i>&nbsp;"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"typeBadge") : depth0)) != null ? lookupProperty(stack1,"text") : stack1), depth0))
    + "</span>\n                        </h4>\n                    </div>\n                    <div class=\"col-auto\">\n                        <h4>\n                            <span class=\"badge badge-secondary\"><i title=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"statusBadge") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "\" class=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"statusBadge") : depth0)) != null ? lookupProperty(stack1,"iconClasses") : stack1), depth0))
    + "\"></i>&nbsp;"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"statusBadge") : depth0)) != null ? lookupProperty(stack1,"text") : stack1), depth0))
    + "</span>\n                        </h4>\n                    </div>\n                </div>\n                <div class=\"row mt-2 d-flex flex-row justify-content-center text-center\">\n                    <div class=\"col-auto\" data-label=\"upvotes\" data-translator=\"getUpvoteButtons\" data-escape=\"false\">\n                        <h4><i class=\"fas fa-chevron-up\"></i></h4>\n                        <h4>"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"thanks") : stack1), depth0))
    + "</h4>\n                        <h4><i class=\"fas fa-chevron-down d-none\"></i></h4>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"row my-1 mx-5\">\n            <div class=\"col d-none\" id=\"comments_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\"></div>\n        </div>\n        <div class=\"row mx-5 d-none\" id=\"id_create_comment_container_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">\n            <div class=\"col-auto\" id=\"my_profile_preview_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">\n                <div class=\"row\">\n                    <div class=\"col-auto ml-4\">\n                        <img alt=\"avatar\" class=\"border rounded-circle\" src=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"me") : depth0)) != null ? lookupProperty(stack1,"thumbnail") : stack1), depth0))
    + "\" width=\"50\" height=\"50\" />\n                    </div>\n                    <div class=\"col text-left\">\n                        <div class=\"row\">\n                            <div class=\"col\">\n                                "
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"me") : depth0)) != null ? lookupProperty(stack1,"user_name") : stack1), depth0))
    + "\n                            </div>\n                        </div>\n                        <div class=\"row\">\n                            <div class=\"col\">\n                                "
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"me") : depth0)) != null ? lookupProperty(stack1,"real_name") : stack1), depth0))
    + "\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"col d-flex flex-column mx-4\">\n                <textarea id=\"id_msg_textarea_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" class=\"d-flex flex-fill verticalscroll\" rows=\"5\" placeholder=\"Write your message here...\"></textarea>\n            </div>\n            <div class=\"col-auto mr-4\">\n                <button id=\"btn_send_"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"issue") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\" class=\"btn btn-primary sendButton\">Send</button>\n            </div>\n        </div>\n\n    </div>\n</div>";
},"useData":true});
})();