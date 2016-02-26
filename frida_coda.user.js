// ==UserScript==
// @name         frida_coda
// @namespace    http://hfw.no/ns/frida_coda
// @version      0.2
// @description  load coda.hio.no/jspui into frida.html, extract meta from xml and autoload into the relevant forms in coda
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
    // elements
    var frida_extraction_iframe, fridastyles, savebutton, loadbutton, frida_extract_sec, coda_sec, frida_input, frida_result, frida_issn_el;
    // frida metadata values
    var frida_title, frida_ar, frida_authors_all, frida_authors_hioa, frida_id, frida_issn;
    console.log(pagetitle);
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
        
        // Add new styles for coda
        fridastyles = document.createElement("style");
        fridastyles.innerHTML="#loadbutton:hover, #loadbutton:focus {box-shadow: 0 0 1em cyan;} #loadbutton {font-weight:bold; position:fixed; top: 0; left:40%; margin-left: 1em; margin-top: 1em;padding:1em;}";
        document.querySelector("head").appendChild(fridastyles);
        
        loadbutton = document.createElement("button");
        loadbutton.textContent="Load";
        loadbutton.id="loadbutton";
        loadbutton.addEventListener("click",loadValues,false);
        document.body.appendChild(loadbutton);
        if(GM_getValue("autoloading") === true || GM_getValue("setISSN") === true) {
            console.log("autoloading continues...");
            loadValues();
            //setTimeout(loadValues,1000);
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
        frida_issn_el = document.querySelector("#frida_issn");
        
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
        if(frida_issn_el !== null) {
            GM_setValue("frida_issn",frida_issn_el.textContent);
        }
    }
    function loadValues() {
        // loadValues uses GM_getValue() that will allow to retrieve cross site variables in the user script's namespace
        console.log("loadValues()");
        var current_lastname_input, current_firstname_input;
        var add_more_authors_button = document.querySelector("input[name=submit_dc_contributor_author_add]");
        var frida_authors_number, frida_authors_fields_added;
        frida_authors_number = GM_getValue("frida_authors_number");
        var total_num_of_author_fields_to_be_added = frida_authors_number;
        // if there are not enough author fields, keep adding until there are enough
        frida_authors_fields_added = GM_getValue("frida_author_fields_added");
        
        // see if all is done except adding issn
        if(GM_getValue("setISSN") === true) {
            console.log("calling loadISSN on next line...");
            loadISSN();
            GM_deleteValue("setISSN");
        }
        else if(frida_authors_number > 1 && frida_authors_fields_added <= total_num_of_author_fields_to_be_added) {
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
                current_lastname_input = document.querySelector("input[name=dc_contributor_author_last]");
                current_firstname_input = document.querySelector("input[name=dc_contributor_author_first]");
                current_lastname_input.value = all_authors_array[0].lastname;
                current_firstname_input.value = all_authors_array[0].firstname;
                
            } else if (frida_authors_number > 1) {
                console.log("adding " + frida_authors_number + " authors");
                // more than one author, add these authors
                for(var n = 1; n <= all_authors_array.length; n++) {
                    console.log("querySelector input: ");
                    console.log("#input[name=dc_contributor_author_last_"+ n +"]");
                    console.log("#input[name=dc_contributor_author_first_"+ n +"]");
                    //console.log("dc_contributor_author_last_1")
                    
                    console.log("current author:");
                    console.log(all_authors_array[n-1].lastname);
                    console.log(all_authors_array[n-1].firstname);
                    
                    current_lastname_input = document.querySelector("input[name=dc_contributor_author_last_"+ n +"]");
                    current_lastname_input.value = all_authors_array[n-1].lastname;

                    current_firstname_input = document.querySelector("input[name=dc_contributor_author_first_"+ n +"]");
                    current_firstname_input.value = all_authors_array[n-1].firstname;
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

            // now insert issn if present!
            // click the button to add more entries
            // page loads
            //console.log("loading values...");
            //console.log(GM_getValue("frida_title") + GM_getValue("frida_id") + GM_getValue("frida_ar") + GM_getValue("frida_authors_hioa") + GM_getValue("frida_authors_all_json"));
            
            prepareISSN();
            // clear the GM_values!
        }
    }
    
    function prepareISSN(){
        console.log("preparing ISSN insertion");
        // first check if it has to run
        // if input[name=dc_identifier_value_2] exists, it does not have to do any work
        var issn_input = document.querySelector("input[name=dc_identifier_value_2]");
        if (issn_input === null) {
            // add another identifier input (and the page will reload)
            var add_button = document.querySelector("input[name=submit_dc_identifier_add");
            GM_setValue("setISSN", true);
            add_button.click();
        }
    }
    
    function loadISSN(){
        console.log("loading ISSN");
        var issn_input = document.querySelector("input[name=dc_identifier_value_2]");
        issn_input.value=GM_getValue("frida_issn");
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
        GM_deleteValue("setISSN");
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