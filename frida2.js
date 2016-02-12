window.addEventListener("load",initWrapper,false);

function initWrapper(){
   var selectable_elements;

   function init() {
      console.log("init");
      selectable_elements = document.querySelectorAll(".sel");
      for(var i = 0; i<selectable_elements.length; i++) {
         selectable_elements[i].addEventListener("click", selectText, false);
      }
   }
   function selectText(ev) {
      console.log("selectText");
      var el = ev.target;
      selectElemText(el);
   }

   function selectElemText(elem) {

       //Create a range (a range is a like the selection but invisible)
       var range = document.createRange();

       // Select the entire contents of the element
       range.selectNodeContents(elem);

       // Dont select, just positioning caret:
       // In front 
       // range.collapse();
       // Behind:
       // range.collapse(false);

       // Get the selection object
       var selection = window.getSelection();

       // Remove any current selections
       selection.removeAllRanges();

       // Make the range you have just created the visible selection
       selection.addRange(range);
   }
   init();
}
