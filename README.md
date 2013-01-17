#AddRecentTerms plugin

##Getting Started

To include the source files for AddRecentTerms and its dependencies, first load the jQuery library file if you haven't already loaded it.


    <script type="text/javascript" src="/js/jquery-1.6.2.min.js"></script>

Next, load shared javascript component library.

    <script type="text/javascript" src="/js/jquery.da_plugins.js"></script>

Create a new AddRecentTerms instance for your application

    <script type="text/javascript">
       (function($) {
           $(document).ready(function() {
             $('#terms').daAddRecentTerms({ maxHeightDifference:200; });
        })
    })(jQuery);
    </script>


##Using AddRecentTerms plugin

###Anatomy of a AddRecentTerms

AddRecentTerms periodically makes AJAX request to server, transforms returned data by using jQuery template and if there is enough space adds it to container otherwise skips adding.

It supposes that there is fixed height main container (target jquery object) and mutable height subcontainer (object returned by getContainer function). Data will be added to the subcontainer.

Required target HTML structure is very similar to daScroll plugin:

    <block_with_immutable_height style="overflow:hidden">
      <block_with_mutatable_height>
        .. elements to scroll ..
      </block_with_mutatable_height>
     </block_with_immutable_height>
 
 where block_with_immutable_height is target jquery object and block_with_mutatable_height is subcontainer

    //note: there is enough space means (block_with_mutatable_height.height -   block_with_immutable_height.height) < maxHeightDifference
 

##API
###Initialization

To use plugin call daAddRecentTerms function

    $('block_with_immutable_height').daAddRecentTerms(prop);

###Parameters

By using prop object you can change behaviour of plugin:

<table>
 <tr>
  <th>member of prop object</th><th>description</th><th>default value</th>
 </tr>
 <tr>
  <td>getTemplate</td><td>function - returns jquery template object which will be used to transform returned data to html</td><td>$($this.data('template')).template(); //$this - target jquery object</td>
 </tr>
 <tr>
  <td>url</td><td>target AJAX request url</td><td>data-source property of target jquery object</td>
 </tr>
 <tr>
  <td>getContainer</td><td>function - returns jquery object linked to block_with_mutatable_height element</td><td>first child of target jquery object</td>
 </tr>
 <tr>
  <td>checkUnique</td><td>function - checks is element already presented. If returns false element will not be added</td><td></td>
 </tr>
 <tr>
  <td>getLastElement</td><td>function - after adding all returned data plugin will add element returned by this function</td><td>null</td>
 </tr>
 <tr>
  <td>maxHeightDifference</td><td>max height difference between object returned by getContainer function and target jquery object (block_with_mutatable_height.height() - block_with_immutable_height.height())</td><td>500</td>
 </tr>
 <tr>
  <td>loadDataDelay</td><td>ms - delay before next AJAX request</td><td>5000</td>
 </tr>
 <tr>
  <td>iterateFromEndToBeginning</td><td>if true returned answer will be iterated from end to beginnig</td><td>true</td>
 </tr>
  <tr>
  <td>beforeAdd</td><td>uniqueness and added to container</td><td>//empty</td>
 </tr>
</table>




#Button element with tooltip

##Getting Started
To include the source files for multi-state button and its dependencies, first load the jQuery library file if you haven't already loaded it.

    <script type="text/javascript" src="/js/jquery-1.7.min.js"></script>

Next, load shared javascript component library.

    <script type="text/javascript" src="/js/jquery.da_plugins.js"></script>

Create a new button instance for your application

    <script type="text/javascript">
       $('#da-button-test')
         .daButton({state: 1})
         .click(function() {console.log('click!');})
         <!-- Attach tooltip -->
         .daTooltip({text: 'Test Tooltips!!!'});
    </script>

##Using Pop-up
###Anatomy of a Pop-up

To use the multi-state button element on page select one or more elements. Button has four states:

* normal
* hover, when mouse is over the element.
* click, 0,5 second from click to the element.
* clecked, after 0,5 from click.

On the each state plugin change css class name of button to the current (normal, hover, click, clicked). If you're need use counter put element with class name 'counter' into the button element, set inner text of it to current counter value. After click on the button if you set counter element it will increase by 1.

For set button's state use parameter 'state'. Set it value from 1 to 4 (1 or skip - normal, 2 - hover, 3 - click, 4- clicked).
Also posible set handler for click event by the parameters or as a chainable method (.click);

    <!-- main container -->
    <div id="da-button-test">
        <!-- Counter, remove it if not need-->
        <span class="counter">1456</span>
    </div>

##API
###Initialization

For initialization button element need call method .daButton for jQuery collection with parameters.

This plugin is maintain chainability.

###Parameters

**state**: integer, *default 1*

Set status of button 1 - normal, 2 - hover, 3 - click, 4- clicked.

###Events
**onclick**: function
Handles the click event.


#Horizontal scroll plugin

##Getting Started

To include the source files for Scroll and its dependencies, first load the jQuery library file if you haven't already loaded it.

    <script src="/js/jquery-1.6.2.min.js"></script>

Next, load template javascript component library.

    <script src="/js/jquery.tmpl.min.js"></script>

Next, load shared javascript component library.

    <script src="/js/jquery.da_plugins-1.1.js"></script>

Create a new Scroll instance for your application

    <script type="text/javascript">
    (function ($) {
        $(document).ready(function () {
            $('#scroll').daHorizontalScroll({maxTermsCount:30});
        })
    })(jQuery);
    </script>

##Using Scroll
###Anatomy of a Scroll

1. Plugin uses "ticker" to scroll elements. For more info check jquery.da_plugins-1.1.ticker.js file
2. Plugin periodically makes ajax request to get new content and adds it using jquery template

Scrolling block should have "position: relative" css property and id attribute. For example:

    <block_with_relative_position style="position: relative" id="myScrollContainer">
      .. elements to scroll ..
    </block_with_relative_position>

##API
###Initialization

To scroll elements use daHorizontalScroll function

    $('block_with_relative_position').daHorizontalScroll(prop);

###Parameters

By using prop object you can change behaviour of scroll plugin:

<table>
 <th>member of prop object</th><th>description</th><th>default value</th>
 <tr>
 <td>url</td><td>target AJAX request url to load new content</td><td>data-source property of target jquery object</td>
 </tr>
 <tr>
 <td>terms</td><td>array - default values contained by target jquery object.</td><td>[]</td>
 </tr>
 <tr>
 <td>maxTermsCount</td><td>maximum number of objects contained by target jquery object at the same time.</td><td>20</td>
 </tr>
 <tr>
 <td>loadDataDelay</td><td>ms - delay before next AJAX request</td><td>10000</td>
 </tr>
 <tr>
 <td>template</td><td>jquery selector of jquery template object which will be used to transform returned data to html</td><td>data-template property of target jquery object</td>
 </tr>
 <tr>
 <td>getLastChild</td><td>function - returns last child object of target jquery object.</td><td>$targetJqueryObject.children(':last-child')</td>
 </tr>
 <tr>
 <td>checkUnique</td><td>function - returns true if addable element is not contained by target jquery object. Used to add only unique content</td><td></td>
 </tr>
</table>

#Pop-up element
##Getting Started

To include the source files for Pop-up and its dependencies, first load the jQuery library file if you haven't already loaded it.

    <script type="text/javascript" src="/js/jquery-1.7.min.js"></script>

Next, load shared javascript component library.

    <script type="text/javascript" src="/js/jquery.da_plugins.js"></script>

Create a new Pop-up instance for your application

    <script type="text/javascript">
      (function ($){
        $(document).ready(function() {
            $('#da-popup1, #da-popup2').daPopup({
                timeOut: 1000,
                onpopup: function() {console.log('popup!!!')}
                onhide: function() {console.log('hide!!!')}
                });
 
        });
      })(jQuery)
    </script>

##Using Pop-up
###Anatomy of a Pop-up

To use the pop-up element on page select one or more elements contains DOM elements for button and pop-up. The pop-up container can contain any elements with any styles. It's must not be visible, absolutely positioned and have a z-index value above any other elements on the page. When mouse over the button container or click it then adding class 'active' to the main container. If mouse out from button or pop-up after timeout (default 1 second) class 'active' removing (pop-up element hiding and button image set disabled state). If you set focus to the input or textarea element in the pop-up menu then after move out mouse, pop-up element don't hiding. If click on the area arond pop-up element then it hiding. if you need you can use close button on the pop-up element. Just put in the pop-up contaner link with class name 'popup-close'.

    <!-- main container -->
    <div id="da-popup1">
            <!-- Button -->
        <div class="button"></div>
            <!-- Pop-up -->
        <div class="popup">
            ASG Popup Test
            <div class="da-form">
                <input type="text" value=""/>
                <input type="button" value = "OK"/>
                <a href="#" onclick="return false">link!</a>
            </div>
            <!-- close button (if you don't need it just clear it)-->
            <a href="#" class="popup-close">Close</a>
        </div>
    </div>
    
    
##API
###Initialization

For initialization pop-up element need call method .daPopup for jQuery collection with parameters.

This plugin is maintain chainability.

###Parameters
**timeOut**: integer, *default 1000*

Delay for showing pop-up element if mouse out from it and input elements hasn't focus.

**bodyClickHide**: boolean, *default true*

If parameter bodyClickHide is true then after clicking on the area around pop-up element it hiding.

**exclusive**: boolean, *default true*

If parameter exclusive is true then after pop-uping one element all same are hiding.

###Events
**onpopup**: function
Handles the pop-up event.

**onhide**: function
Handles the hide element event.

#Scroll plugin
##Getting Started

To include the source files for Scroll and its dependencies, first load the jQuery library file if you haven't already loaded it.

    <script type="text/javascript" src="/js/jquery-1.6.2.min.js"></script>

Next, load shared javascript component library.

    <script type="text/javascript" src="/js/jquery.da_plugins.js"></script>

Create a new Scroll instance for your application

    <script type="text/javascript">
       (function($) {
           $(document).ready(function() {
           $('#scroll').daScroll({block:true});})
        })
    })(jQuery);
    </script>

##Using Scroll
###Anatomy of a Scroll

For scrolling inline elements Scroll plugin:

1. Selects elements of first line
2. Transforms it to block element (wrapping it with block tag (div by default) or using css property display=block;)
3. Gradually changes marginTop property by using jQuery animate function.
4. If there is enough content to scroll first line content will be deleted, otherwise it will be moved to bottom.
5. Continues iteration from point 1

Scrolling block should have the following struncture:

    <block_with_immutable_height style="overflow:hidden">
      <block_with_mutatable_height>
        .. elements to scroll ..
      </block_with_mutatable_height>
    </block_with_immutable_height>

##API
###Initialization
To scroll elements use daScroll function

    $('block_with_immutable_height').daScroll(prop);

###Parameters

By using prop object you can change behaviour of scroll plugin:

<table>
 <tr>
  <th>member of prop object</th><th class="confluenceTh">description</th><th>default value</th>
 </tr>
 <tr>
  <td>`getContainer`</td><td>function - returns jquery object linked to `block_with_mutatable_height` element</td><td>first child of `block_with_immutable_height` element</td>
 </tr>
 <tr>
  <td>`wrap`</td><td>if `true` and `block` is `false` wraps first line objects with `wrapTag` tag</td><td>`true`</td></tr>
  <tr><td>`wrapTag`</td><td>tag used to wrap first line objects</td><td>`'div'`</td></tr><tr><td>`block`</td><td>if `true` first line objects will be converted to block by using `display=block property`</td><td>`false`</td>
  </tr>
  <tr>
   <td>`nextLineDelay`</td><td>delay (ms) before scroll next line</td><td>500</td>
   </tr>
   <tr>
    <td>`getFirstLineContent`</td>
    <td>function - returns objects of first line</td>
    <td>Uses `offsetLeft` property to select objects of first line</td>
   </tr>
   <tr>
    <td>`getDuration`</td><td>function - returns duration of scrolling of line</td><td>`height` / 0.05</td>
   </tr>
</table>

#Tooltip Element
##Getting Started

To include the source files for Tooltip and its dependencies, first load the jQuery library file if you haven't already loaded it.

    <script type="text/javascript" src="/js/jquery-1.7.min.js"></script>

Next, load shared javascript component library.

    <script type="text/javascript" src="/js/shared/jquery.da_plugins-1.0.js"></script>

Attach jQuery method .daTooltip to the jQuery collection.

    <script type="text/javascript">
       (function($) {
           $(document).ready(function() {
           $('#zoom > li').daZoom()
           .daTooltip({text: 'Test Tooltips!!!'});
        })
    })(jQuery);
    </script>

##Using Zoom
###Anatomy of a Zoom

For using the zoom element select by jQuery selector more than one elements. When mouse over the element plugin adding the tip to it and fixed it at the mouse cursor when it moving.

##API
###Initialization

For initialization pop-up element apply jQuery method `.daZoom` for jQuery collection with parameters. 

This plugin is maintain chainability.

###Parameters

`text` - default '' 
text of tip 

`tooltipElement` - default 'da-tooltip'
first part of tip DOM element

`offset_x` - default 15 
offset tip element from current cursor position by x coord in pixels

`offset_y` - 17 
offset tip element from current cursor position by y coord in pixels

#Zoom element
##Getting Started

To include the source files for Zoom and its dependencies, first load the jQuery library file if you haven't already loaded it.

    <script type="text/javascript" src="/js/jquery-1.6.2.min.js"></script>

Next, load shared javascript component library.

    <script type="text/javascript" src="/js/jquery.da_plugins.js"></script>

Create a new Zoom instance for your application

    <script type="text/javascript">
       (function($) {
           $(document).ready(function() {
           $('#zoom > li').daZoom()
           .bind('zoomin.devadmin',function(){console.log('zoomin!')})
           .bind('zoomout.devadmin',function(){console.log('zoomout!')})
        })
     })(jQuery);
     </script>

##Using Zoom
###Anatomy of a Zoom

For using the zoom element select by jQuery selector more than one elements. When mouse over the element plugin adding the class 'da-enter' to it. Zoom element must contain two element with classes 'da-normal' (for mouse out state) and 'da-hover' (for mouse over state). For start .da-hover elements must be invisible. Element with class 'hover' absolute positioning and will display by the middle of the 'normal' element.

    <ul id="zoom">
      <li>
        <div class="da-zoom-normal">
          normal1
        </div>
        <div class="da-zoom-hover">
          hover1
        </div>
      </li>
      <li>
        <div class="da-zoom-normal">
          normal2
        </div>
        <div class="da-zoom-hover">
          hover2
        </div>
      </li>
      <li>
        <div class="da-zoom-normal">
          normal3
        </div>
        <div class="da-zoom-hover">
          hover3
        </div>
      </li>
</ul>

##API
###Initialization

For initialization pop-up element apply  jQuery method .daZoom for jQuery collection with parameters. 

This plugin is maintain chainability.

###Parameters
###Events

`onzoomin`: function
Handles the zoom in event.

`onzoomout`: function
Handles the zoom out element event.




	


