// ==UserScript==
// @name         coda enhancer
// @namespace    hfw.no/ns/coda_user
// @version      0.1
// @description  try to take over the world! (Make my life easier when inputting data in CODA)
// @author       You
// @match        https://coda.hio.no/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

// Eirik Hanssen, Oslo and Akershus University College of Applied Sciences (2014)
// Automate several things when submitting articles to coda.

(function coda() {
    console.log("coda_enhancer is running...");
    
    // first add some styles to make coda easier to use
    var codastyles = document.createElement("link");
    codastyles.setAttribute("rel", "stylesheet");
    codastyles.setAttribute("type", "text/css");
    codastyles.setAttribute("href","https://localhost/~hanson/frida/coda.css");
    document.querySelector("head").appendChild(codastyles);
    

    var selectItemByValue = function (el, value) {
        for(var i=0; i < el.options.length; i++) {
            if(el.options[i].value == value) {
               el.selectedIndex = i;
            }
        }
    };

    var selectItemByTextContent = function (el, searchstr) {
        for(var i=0; i < el.options.length; i++) {
            if(el.options[i].textContent == searchstr) {
               el.selectedIndex = i;
            }
        }
    };

var checkTitle = function () {

    var docTitle = document.getElementsByTagName("title")[0].textContent;
    switch (docTitle) {
        case "CODA: Internal System Error":
           document.location.reload(true);
           break;
        case "CODA: Select Collection to Submit to":
            var tcollection = document.getElementById('tcollection');
            selectItemByTextContent(tcollection, "Rettighetsklarering");
            document.querySelectorAll("input[name='submit_next']")[0].click();
            break;
        case "CODA: CODA Distribution License":
           document.querySelectorAll("input[name='submit_grant']")[0].click();
           break;
        case "CODA: Describe this Item":
            var firstDiv = document.getElementsByTagName("div")[0].textContent || "";
            var secondDescPageRex = /^\s*Please fill further information about this submission below./;
            var isSecondDescribeItemPage = secondDescPageRex.test(firstDiv);
            if (isSecondDescribeItemPage) {
                document.querySelectorAll("input[name='submit_next']")[0].click();
                break;
            } else {
                // This is the first "Describe this Item page"
                // Select The Identifier to use (other)
               var identifiers = document.querySelectorAll("select[name='dc_identifier_qualifier']")[0];
               selectItemByValue(identifiers, "other");
               break;
            }
        case "CODA: Upload a File":
            checkSubmission();
            break;
        case "CODA: Error Uploading File":
            document.querySelectorAll("input[name='submit_retry']")[0].style="border: 5px solid red; font-weight: bold; padding: 1em;";
            break;
        case "CODA: Uploaded Files":
            break;
        case "CODA: Verify Submission":
            checkSubmission();
            break;

        default:
            //alert(docTitle);
            break;
    }
};
    
    function checkSubmission(){
        var metaEls = document.querySelectorAll(".metadataFieldValue");
        var fridamismatch=false;
        var metaTextContent = [];
        var fridaid ="";
        var current_string="";
        var fridaid_element;
        var frida_regex = /^.*?Other:FRIDAID (\d+).*?$/
        var uploaded_file_links = document.querySelectorAll(".metadataFieldValue a");
        var current_file_link, current_file;
        for (var i=0; i<metaEls.length; i++) {
            current_string = metaEls[i].textContent;
            if(frida_regex.exec(current_string)) {
                fridaid_element=metaEls[i];
                fridaid=current_string.replace(frida_regex, "$1");
            }
        }
        //console.log(fridaid);
        //console.log(fridaid_element);
        
        for (var j=0; j < uploaded_file_links.length; j++) {
            current_file_link = uploaded_file_links[j];
            current_file = current_file_link.textContent;
            console.log(current_file);
            var n = current_file.indexOf(fridaid);
            if(n>=0) {
                console.log("match between FRIDAID and uploaded file!");
                current_file_link.className="match";
            } else {
                fridamismatch=true;
                alert("Mismach between FRIAID"+ fridaid + " and uploaded file: " + current_file + "!");
                current_file_link.className="mismatch";
            }
        }

        if (fridamismatch === true) {
            fridaid_element.className = fridaid_element.className + " mismatch";
        } else {
            fridaid_element.className = fridaid_element.className + " match";
        }
    }

checkTitle();

}());