chrome.webRequest.onCompleted.addListener(
    function (details) {
        if (details.type === "main_frame") {
            chrome.storage.local.set({ ip: details.ip }, function () {
                if (chrome.runtime.lastError) {
                    console.log("Error setting IP in storage:", chrome.runtime.lastError);
                }
            });
        }
    },
    { urls: ["<all_urls>"] }
);
