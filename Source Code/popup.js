const display = document.getElementById('shortResult');
const ScanBtn = document.getElementById('scanBtn');
const probability = document.getElementById('probability');

var HTMLDoc = '';

var allClass = 0;
var dorikClass = 0;
const classCountDisplay = document.getElementById('classCount');

var allUrl = 0;
var dorikUrl = 0;
const urlCountDisplay = document.getElementById('cdnCount');

var siteIP = '';
const IPDisplay = document.getElementById('IPCheck');
const DorikIPs = ['18.119.18.18', '18.223.215.29', '174.138.116.26'];

var isDorikSite = false;

document.addEventListener('DOMContentLoaded', function () {
    ScanBtn.addEventListener('click', ScanPage);
});

document.addEventListener('DOMContentLoaded', function () {
    ScanPage();
});


function CountClass() {
    var parser = new DOMParser();
    var doc = parser.parseFromString(HTMLDoc, 'text/html');

    var allElements = doc.getElementsByTagName('*');

    dorikClass = 0;
    allClass = 0;

    for (var i = 0; i < allElements.length; i++) {
        allClass++;
        if (typeof allElements[i].className === 'string' && allElements[i].className.includes('dorik')) {
            dorikClass++;
        }
    }
}

function CountURL() {

    allUrl = 0;
    dorikUrl = 0;

    var parser = new DOMParser();
    var doc = parser.parseFromString(HTMLDoc, 'text/html');

    var allElements = doc.getElementsByTagName('*');

    for (var i = 0; i < allElements.length; i++) {
        var hrefAttr = allElements[i].getAttribute('href');
        var srcAttr = allElements[i].getAttribute('src');

        if (hrefAttr || srcAttr) {
            allUrl++;
        }

        if (hrefAttr && (hrefAttr.startsWith('https://cdn.dorik.com') || hrefAttr.startsWith('https://cdn.cmsfly.com'))) {
            dorikUrl++;
        }
        if (srcAttr && (srcAttr.startsWith('https://cdn.dorik.com') || srcAttr.startsWith('https://cdn.cmsfly.com'))) {
            dorikUrl++;
        }
    }
}

function UpdateDisplay() {
    var classPercentage = (dorikClass / allClass) * 100;
    var urlPercentage = (dorikUrl / allUrl) * 100;

    var averagePercentage = (classPercentage + urlPercentage) / 2;

    chrome.storage.local.get('ip', function (data) {
        IPDisplay.textContent = data.ip || 'No IP found';
        siteIP = data.ip || 'No IP found';
    });

    if (allClass > 0 && dorikClass > 0) {
        isDorikSite = true;
    }
    if (allUrl > 0 && dorikUrl > 0) {
        isDorikSite = true;
    }
    if (DorikIPs.includes(siteIP)) {
        averagePercentage += 33;
        isDorikSite = true;
    }

    if (isDorikSite) {
        display.textContent = `This is Dorik Site`;
        display.style.color = 'green';
    } else {
        display.textContent = `This is NOT Dorik Site`;
        display.style.color = 'red';
    }

    probability.textContent = `${averagePercentage.toFixed(2)}% sure`;
    classCountDisplay.textContent = `${dorikClass} (${classPercentage.toFixed(2)}%)`;
    urlCountDisplay.textContent = `${dorikUrl} (${urlPercentage.toFixed(2)}%)`;
}

function getPageSource() {
    return document.documentElement.outerHTML;
}
function ScanPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (chrome.scripting && chrome.scripting.executeScript) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: getPageSource
            }, (results) => {
                if (results && (results.length === 0 || !results[0])) {
                    display.textContent = 'Please Visit a Valid Site';
                    return;
                }

                if (results) {
                    HTMLDoc = results[0].result;
                    CountClass();
                    CountURL();
                    UpdateDisplay();
                } else {
                    display.textContent = 'Please visit a Valid Site';
                }

            });
        } else {
            chrome.tabs.executeScript(
                tabs[0].id,
                { code: 'document.documentElement.outerHTML;' },
                (results) => {
                    if (results && (results.length === 0 || !results[0])) {
                        display.textContent = 'Please Visit a Valid Site';
                        return;
                    }

                    if (results) {
                        HTMLDoc = results[0];
                        CountClass();
                        CountURL();
                        UpdateDisplay();
                    } else {
                        display.textContent = 'Please visit a Valid Site';
                    }

                }
            );
        }
    });
}
