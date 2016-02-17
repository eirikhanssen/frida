// ==UserScript==
// @include     https://coda.hio.no/*
// ==/UserScript==

// Eirik Hanssen, Oslo and Akershus University College of Applied Sciences (2014)
// Automate several things when submitting articles to coda.

(function coda() {

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
            break;
        case "CODA: Error Uploading File":
            document.querySelectorAll("input[name='submit_retry']")[0].style="border: 5px solid red; font-weight: bold; padding: 1em;";
            break;
        case "CODA: Uploaded Files":
            break;
        case "CODA: Verify Submission":
            break;

        default:
            //alert(docTitle);
            break;
    }
};

checkTitle();

}());
