// ==UserScript==
// @name         frida_coda
// @namespace    http://hfw.no/ns/frida_coda
// @version      0.2
// @description  load coda.hio.no/jspui into frida.html and enable saving relevant metadata and autoloading them into relevant form in coda
// @author       Eirik Hanssen
// @match        https://localhost/~hanson/frida/frida.html
// @match        https://coda.hio.no/jspui/submit
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

// Your code here...
(function coda(){
    var pagetitle=document.title;
    var frida_extraction_iframe_url = "https://localhost/~hanson/coda/coda2.html";
    var frida_extraction_iframe, fridastyles, savebutton, loadbutton, frida_title, frida_ar, frida_authors_all, frida_authors_hioa, frida_id, frida_extract_sec, coda_sec, frida_input, frida_result;
    console.log("coda_enhancer");
    //console.log(pagetitle);
    if(pagetitle === "Frida metadata extraction") {
        // check if the user script is running inside frida.html
        console.log("running in frida.html");
        
        // get the elements to add to frida_extract_sec
        frida_input = document.querySelector("#frida_input");
        frida_result = document.querySelector("#frida_result");
        
        // first add sections , add coda to this page
        frida_extract_sec = document.createElement("section");
        frida_extract_sec.id="frida_extract";
        frida_extract_sec.appendChild(frida_input);
        frida_extract_sec.appendChild(frida_result);
        document.body.appendChild(frida_extract_sec);
       
        coda_sec = document.createElement("section");
        coda_sec.id="coda_section";
        coda_sec.innerHTML="<iframe src='https://coda.hio.no/jspui'></iframe>";
        document.body.appendChild(coda_sec);
        
        savebutton = document.createElement("button");
        savebutton.id="savebutton";
        savebutton.textContent="Save";
        savebutton.disabled="diabled";
        savebutton.addEventListener("click",saveValues,false);
        document.querySelector("#frida_input").appendChild(savebutton);
        document.querySelector("#transformbutton").addEventListener("click",activateSaveButton,false);
        var clearbutton = document.createElement("button");
        clearbutton.innerText="Clear";
        clearbutton.addEventListener("click",clear_GM_values,false);
        clearbutton.id="clearbutton";
        document.querySelector("#frida_input").appendChild(clearbutton);
        
    } else if(pagetitle === "CODA: Describe this Item"){
        // check if the user script is running inside coda.hio.no/jspui/submit on the "CODA: Describe this Item" page
        console.log("running inside coda.hio.no/jspui/submit");
        
        loadbutton = document.createElement("button");
        loadbutton.textContent="Load";
        loadbutton.id="loadbutton";
        loadbutton.addEventListener("click",loadValues,false);
        document.body.appendChild(loadbutton);
        if(GM_getValue("autoloading") === true) {
            console.log("continuing to load and add author fields");
            setTimeout(loadValues,1000);
        }
    }
    // if the script is not running in either frida.html or in the relevant coda page, nothing will happen
    
    // functions used
    
    function saveValues() {
        // saveValues uses the GM_setValue() function that will allow cross-site sharing of data in the user script's namespace
        frida_title = document.querySelector("#frida_title").textContent;
        frida_id = "FRIDAID " + document.querySelector("#frida_id").textContent;
        frida_ar = document.querySelector("#frida_ar").textContent;
        frida_authors_hioa = document.querySelector("#frida_authors_hioa").textContent;
        frida_authors_all = document.querySelectorAll("#frida_authors_all .author");
        
        var all_authors = [];
        for(var i = 0; i < frida_authors_all.length; i++) {
            all_authors[i] = {
                lastname: frida_authors_all[i].querySelector(".lastname").textContent,
                firstname: frida_authors_all[i].querySelector(".firstname").textContent
            }
        }
        var all_authors_json = JSON.stringify(all_authors);
        //console.log("title: " + frida_title);
        //console.log("id: " + frida_id);
        //console.log("ar: " + frida_ar);
        //console.log("hioa-authors: " + frida_authors_hioa);
        //console.log("all-authors: " + frida_authors_all);
        //console.log(all_authors);
        //console.log(all_authors_json);
        GM_setValue("frida_title",frida_title);
        GM_setValue("frida_id",frida_id);
        GM_setValue("frida_ar",frida_ar);
        GM_setValue("frida_authors_hioa",frida_authors_hioa);
        GM_setValue("frida_authors_all_json",all_authors_json);
        GM_setValue("frida_authors_number", frida_authors_all.length);
        GM_setValue("frida_author_fields_added", 0);
        GM_setValue("autoloading",false);
    }
    function loadValues() {
        // loadValues uses GM_getValue() that will allow to retrieve cross site variables in the user script's namespace
        var current_lastname_input, current_firstname_input;
        var add_more_authors_button = document.querySelector("input[name=submit_dc_contributor_author_add]");
        var frida_authors_number, frida_authors_fields_added;
        frida_authors_number = GM_getValue("frida_authors_number");
        var total_num_of_author_fields_to_be_added = frida_authors_number - 1;
        // if there are not enough author fields, keep adding until there are enough
        frida_authors_fields_added = GM_getValue("frida_author_fields_added");

        if(frida_authors_number > 1 && frida_authors_fields_added <= total_num_of_author_fields_to_be_added) {
            // set auto loading true
            GM_setValue("autoloading",true);
            console.log("need to add " + (total_num_of_author_fields_to_be_added - frida_authors_fields_added) + " of " + total_num_of_author_fields_to_be_added + "author fields");
            // first, if frida_author_fields_added == 0, increase this and, Click the add more authors button
            if(frida_authors_fields_added == 0) {
                console.log("only one author");
                GM_setValue("frida_author_fields_added", frida_authors_fields_added+1);
                add_more_authors_button.click();
            } else {
                console.log("more than one author");
            // atleast one author field has been added
            // first insert frida_author_fields_added (number) into the field, then increment this number, then add another field by pressing the button
                var current_input_dc_contributor_author_last = document.querySelector("input[name=dc_contributor_author_last_"+frida_authors_fields_added.toString()+"]");
                current_input_dc_contributor_author_last.value=frida_authors_fields_added;
                GM_setValue("frida_author_fields_added", frida_authors_fields_added+1);
                add_more_authors_button.click();
            }
        } else {
            var all_authors_array = JSON.parse(GM_getValue("frida_authors_all_json"));
            console.log(all_authors_array);
            console.log("enough author fields present!");
            // set auto loading false
            GM_setValue("autoloading",false);
            
            // enough author fields are now present. add all the metadata
            
            // begin with the authors
            if(frida_authors_number == 1) {
                console.log("adding one author");
                // only one author, add this author
                current_lastname_input = document.querySelector("#input[name=dc_contributor_author_last]");
                current_firstname_input = document.querySelector("#input[name=dc_contributor_author_first]");
                current_lastname_input.value = all_authors_array[0].lastname;
                current_firstname_input.value = all_authors_array[0].firstname;
                
            } else if (frida_authors_number > 1) {
                console.log("adding " + frida_authors_number + " authors");
                // more than one author, add these authors
                for(var n = 0; n < all_authors_array.length; n++) {
                    console.log("querySelector input: ");
                    console.log("#input[name=dc_contributor_author_last_"+ (n+1).toString() +"]");
                    console.log("#input[name=dc_contributor_author_first_"+ (n+1).toString() +"]");
                    console.log("dc_contributor_author_last_1")
                    current_lastname_input = document.querySelector("#input[name=dc_contributor_author_last_"+ (n+1).toString() +"]");
                    current_firstname_input = document.querySelector("#input[name=dc_contributor_author_first_"+ (n+1).toString() +"]");
                    current_lastname_input.value = all_authors_array[n].lastname;
                    current_firstname_input.value = all_authors_array[n].firstname;
                }
            }
            
            // set the other metadata

            // set title
            var title_input = document.querySelector("#dc_title");
            title_input.value = GM_getValue("frida_title");
            // set year
            var year_input = document.querySelector("input[name=dc_date_issued_year]");
            year_input.value = GM_getValue("frida_ar");
            // set fridaid
            var dc_identifier_qualifier_select = document.querySelector("select[name=dc_identifier_qualifier]");
            var dc_identifier_value_input = document.querySelector("input[name=dc_identifier_value]");
            // first choose the option "other"
            var options = dc_identifier_qualifier_select.options;
            for(var opt, j = 0; opt = options[j]; j++) {
                if(opt.value == "other") {
                    dc_identifier_qualifier_select.selectedIndex = j;
                    break;
                }
            }
            // then set the fridaid in the input
            dc_identifier_value_input.value = GM_getValue("frida_id");

            // the hard part: adding authors and clicking the add more button as needed
            // first re-make array with author objects using JSON.parse
            // it gets harder because the page reloads!
            //
            // OK; det første som må gjøres er å legge til rett antall forfatter-felt
            // da må man lagre en verdi med GM_save ... forfatterfelt_nr og forfatterfelt_totalt. for hver gang siden lastes (etter å ha trykket på add more)
            // først sjekk på om forfatterfelt_nr er like stor som forfattere_totalt, så telle den opp med en
            // så fylle inn dette tallet i feltet, og trykke på knappen en gang til
            // når alle er lagt til, må disse variablene slettes, eller må de?
            // da legges alle forfatterne til, og etterpå det enkle.
            // gjør en sjekk når siden lastes for om flere skal legges til

            /*
            var author_num=5;
            if(author_num>1) {
                for(var k=1;k<=author_num;k++){
                    fillAuthor({firstname:"ole",lastname:"brum"},k));
                }
            }*/

            // then determine how many authors there are
            // then keep adding more rows as needed, filling in just a number to be able to add more rows.
            // when all the rows have been added, fill them in with the authors from the author object array.

            //console.log("loading values...");
            //console.log(GM_getValue("frida_title") + GM_getValue("frida_id") + GM_getValue("frida_ar") + GM_getValue("frida_authors_hioa") + GM_getValue("frida_authors_all_json"));
            
            // clear the GM_values!
            clear_GM_values();
        }
    }
    function clear_GM_values(){
        console.log("done, clearing out all GM values!");
        GM_deleteValue("frida_title");
        GM_deleteValue("frida_id");
        GM_deleteValue("frida_ar");
        GM_deleteValue("frida_authors_hioa");
        GM_deleteValue("frida_authors_all_json");
        GM_deleteValue("frida_authors_number");
        GM_deleteValue("frida_author_fields_added");
        GM_deleteValue("autoloading");
    }
    function fillAuthor(author,num) {
        console.log("fillAuthor: " + num.toString());
        var input_last = document.querySelector("input[name=dc_contributor_author_last_"+num+"]");
        var input_first = document.querySelector("input[name=dc_contributor_author_first_"+num+"]");
        input_last=author.lastname;
        input_first=author.firstname;
    }
    function activateSaveButton(){
        savebutton.disabled=false;
    }
}());