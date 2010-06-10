/*
 * jQuery UI Pager @VERSION
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/pager
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, round ) {

$.widget( "ui.pager", {
    version: "@VERSION",
    options: {
        pages: 1,
        active: 1,
        length: 10,
        change: $.noop,
        labels: {
            first: "&laquo;",
            last: "&raquo;",
            next: "&gt;",
            prev: "&lt;"
        },
        titles: {
            first: "Go to first page",
            last: "Go to last page",
            next: "Go to next page",
            prev: "Go to previous page",
            page: "Go to page"
        }
    },
 
    _create: function() {
        this.element
            .addClass( classes.base )
            .attr( "role", "pager" );
         
         this.ul = $( "<ul></ul>" )
            .delegate( "li:not('." + classes.disabled + "') a", "click." + this.widgetName, $.proxy(this, "_clickHandler") )
            .delegate( "a", "mouseover." + this.widgetName + ", mouseout." + this.widgetName, this._hoverHandler )
            .appendTo( this.element );

         this._update();   
         
         if ( this.options.pages <= 1 ) {
            this.disable();    
         }        
    },
    destroy: function() {
        this.element
            .removeClass( classes.base )
            .removeAttr( "role" );
            
        this.ul.remove();
                    
        $.Widget.prototype.destroy.apply( this, arguments );
    },
    
    _setOption: function( key, value ) {
        $.Widget.prototype._setOption.apply( this, arguments );
        switch ( key ) {
            case "active":
                this._update();
                this._trigger( "change", null, this._ui() );
                break;
            case "pages":
                this._update();
                value <= 1 ? this.disable() : this.enable();
                break;
        }

    },    
        
    _clickHandler: function( event ) {
        var o = this.options,
            action = $(event.currentTarget).attr("rel");
            
        if ( isNaN(action) ) {
            if ( action == "first" )
                o.active = 1;
            else if ( action == "last" )
                o.active = o.pages;
            else if ( action == "next" )
                o.active += 1;
            else if ( action == "prev" )
                o.active = o.active - 1;
        } else {
            o.active = parseInt(action);
        }           
        
        this._setOption( "active", o.active );

        return false;    
    },
    
    _hoverHandler: function( event ) {
        $(this).toggleClass( classes.hover, event.type == "mouseover" );    
    },

    _update: function() {
        var o = this.options,
            data = {
                classes: classes,
                titles: o.titles,
                active: o.active,
                firstDisabled: o.active <= 1 ? classes.disabled : "",
                lastDisabled: !o.pages || o.active >= o.pages ? classes.disabled : "",
                labels: o.labels       
            };
            
        var length = o.pages > o.length ? o.length : o.pages,
            middle = round( length / 2 ) - 1,
            first = o.active - middle,
            last = first + length - 1;
        
        
        if ( first <= 0 ) {
            first = 1;
            last = first + length - 1;
        } else if ( first + length - 1 > o.pages ) {
            first = o.pages - length + 1;
            last = o.pages;
        }
        
        data.first = first;
        data.last = last;

        this.ul[0].innerHTML = tmpl( template, data );                
    },
    
    _ui: function() {
        return {
            active: this.options.active,
            pages: this.options.pages
        };
    }    
    

});

var classes = {
    base: "ui-pager ui-widget ui-widget-content ui-corner-all ui-helper-clearfix",
    page: "ui-pager-page",
    active: "ui-state-active",
    disabled: "ui-state-disabled",
    hover: "ui-state-hover"
};

var template = '\
        <li class="<%=classes.page%>-first <%=firstDisabled%>" role="button" title="<%=titles.first%>">\
            <a href="javascript:;" rel="first" class="ui-widget-content ui-corner-all ui-state-default">\
                <span><%=labels.first%></span>\
            </a>\
        </li>\
        <li class="<%=classes.page%>-prev <%=firstDisabled%>" role="button" title="<%=titles.prev%>">\
            <a href="javascript:;" rel="prev" class="ui-widget-content ui-corner-all ui-state-default">\
                <span><%=labels.prev%></span>\
            </a>\
        </li>\
        <% for ( var i = first; i <= last; ++i ) { %>\
            <li class="<%=classes.page%>" role="button" title="<%=titles.page%> <%=i%>">\
                <a href="javascript:;" rel="<%=i%>" class="ui-widget-content ui-corner-all ui-state-default <%=(i == active ? classes.active : \"\") %>">\
                    <span><%=i%></span>\
                </a>\
            </li>\
        <% } %>\
        <li class="<%=classes.page%>-next <%=lastDisabled%>" role="button" title="<%=titles.next%>">\
            <a href="javascript:;" rel="next" class="ui-widget-content ui-corner-all ui-state-default">\
                <span><%=labels.next%></span>\
            </a>\
        </li>\
        <li class="<%=classes.page%>-last <%=lastDisabled%>" role="button" title="<%=titles.last%>">\
            <a href="javascript:;" rel="last" class="ui-widget-content ui-corner-all ui-state-default">\
                <span><%=labels.last%></span>\
            </a>\
        </li>\
';




/*
 * micro templating engine
 * can be replaced by new template engine from the core
 */
var tmpl = (function(){
    var cache = {};
    function tmpl(str, data) {
        var fn = !/\W/.test(str) ?
          cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
           
            "with(obj){p.push('" +
            str
              .replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");
        return data ? fn( data ) : fn;
    }
    return tmpl;    
})();


})( jQuery, Math.round );
