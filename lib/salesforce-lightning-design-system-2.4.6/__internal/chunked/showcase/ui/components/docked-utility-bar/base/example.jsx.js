var SLDS=SLDS||{};SLDS["__internal/chunked/showcase/ui/components/docked-utility-bar/base/example.jsx.js"]=webpackJsonpSLDS___internal_chunked_showcase([73,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137],{0:function(e,l){e.exports=React},79:function(e,l,t){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(l,"__esModule",{value:!0}),l.states=l.Context=l.UtilityBar=l.UtilityBarItem=l.UtilityPanel=void 0;var s=a(t(0)),n=a(t(2)),i=t(3),d=a(t(1)),c=l.UtilityPanel=function(e){return s.default.createElement("section",{className:(0,d.default)("slds-utility-panel slds-grid slds-grid_vertical",e.className),role:"dialog","aria-labelledby":"panel-heading-01"},s.default.createElement("header",{className:"slds-utility-panel__header slds-grid slds-shrink-none"},s.default.createElement("div",{className:"slds-media slds-media_center"},s.default.createElement("div",{className:"slds-media__figure slds-m-right_x-small"},s.default.createElement("span",{className:"slds-icon_container"},s.default.createElement(n.default,{className:"slds-icon slds-icon_small slds-icon-text-default",sprite:"standard",symbol:"call"}))),s.default.createElement("div",{className:"slds-media__body"},s.default.createElement("h2",{id:"panel-heading-01"},e.header||"Header"))),s.default.createElement("div",{className:"slds-col_bump-left slds-shrink-none"},s.default.createElement(i.ButtonIcon,{className:"slds-button_icon",symbol:"minimize_window",assistiveText:"Close Panel",title:"Close Panel"}))),s.default.createElement("div",{className:"slds-utility-panel__body"},e.children))},m=l.UtilityBarItem=function(e){return s.default.createElement("li",{className:(0,d.default)("slds-utility-bar__item",{"slds-has-notification":e.notification},e.className)},s.default.createElement("button",{className:(0,d.default)("slds-button slds-utility-bar__action",{"slds-is-active":e.active}),"aria-pressed":!!e.active},e.notification?s.default.createElement("abbr",{className:"slds-indicator_unread",title:"Unread Item","aria-label":"Unread Item"},s.default.createElement("span",{className:"slds-assistive-text"},"●")):null,s.default.createElement(n.default,{className:"slds-button__icon slds-button__icon_left",sprite:"utility",symbol:e.symbol}),s.default.createElement("span",{className:"slds-utility-bar__text"},e.children)))},r=l.UtilityBar=function(e){return s.default.createElement("footer",{className:"slds-utility-bar_container","aria-label":"Utility Bar"},s.default.createElement("h2",{className:"slds-assistive-text"},"Utility Bar"),s.default.createElement("ul",{className:"slds-utility-bar"},e.children),e.panel)},o=s.default.createElement(c,{className:"slds-is-open",header:"Call"},s.default.createElement("div",{className:"slds-align_absolute-center"},"Utility Panel Body"));l.Context=function(e){return s.default.createElement("div",{style:{height:"540px"}},e.children)};l.default=s.default.createElement(r,{panel:s.default.createElement(c,{header:"Call"},s.default.createElement("div",{className:"slds-align_absolute-center"},"Utility Panel Body"))},s.default.createElement(m,{symbol:"call"},"Call"),s.default.createElement(m,{symbol:"clock"},"History"),s.default.createElement(m,{symbol:"note"},"Notes"),s.default.createElement(m,{symbol:"omni_channel"},s.default.createElement("span",{className:"slds-m-bottom_xxx-small"},"Online"),s.default.createElement("span",null,"Omni-Channel")));l.states=[{id:"open",label:"Panel Open",element:s.default.createElement(r,{panel:o},s.default.createElement(m,{symbol:"call",active:!0},"Call"),s.default.createElement(m,{symbol:"clock"},"History"),s.default.createElement(m,{symbol:"note"},"Notes"),s.default.createElement(m,{symbol:"omni_channel"},s.default.createElement("span",{className:"slds-m-bottom_xxx-small"},"Online"),s.default.createElement("span",null,"Omni-Channel")))},{id:"notification",label:"Item has notification",element:s.default.createElement(r,null,s.default.createElement(m,{symbol:"call"},"Call"),s.default.createElement(m,{symbol:"clock"},"History"),s.default.createElement(m,{symbol:"note"},"Notes"),s.default.createElement(m,{symbol:"omni_channel",notification:!0},s.default.createElement("span",{className:"slds-m-bottom_xxx-small"},"Online"),s.default.createElement("span",null,"Omni-Channel")))}]}},[79]);