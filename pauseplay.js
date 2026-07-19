// ==UserScript==
// @name         Spotify Web Player - 2 Minute Song Delay
// @namespace    https://tampermonkey.net/
// @version      1.0
// @description  Automatically pauses each new Spotify Web Player track for 2 minutes before resuming.
// @author       ChatGPT
// @match        https://open.spotify.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    /*
    ============================================================
        CONFIGURATION
    ============================================================
    */

    const CONFIG = {

        // Pause duration after every new song
        pauseDurationSeconds: 120,

        // How often fallback checks run
        fallbackIntervalMs: 1000,

        // Show floating control panel
        showPanel: true,

        // Enable console logging
        logging: true

    };


    /*
    ============================================================
        STATE
    ============================================================
    */

    let enabled = GM_getValue("enabled", true);

    let currentTrack = "";

    let pauseTimer = null;

    let countdownTimer = null;

    let secondsRemaining = 0;

    let isWaiting = false;

    let observerStarted = false;


    /*
    ============================================================
        LOGGING
    ============================================================
    */

    function log(...args) {

        if (!CONFIG.logging) return;

        console.log(
            "%cSpotify Delay:",
            "color:#1DB954;font-weight:bold;",
            ...args
        );
    }


    /*
    ============================================================
        DOM HELPERS
    ============================================================
    */

    function getTrackTitle() {

        const element =
            document.querySelector(
                '[data-testid="context-item-info-title"]'
            );

        return element
            ? element.innerText.trim()
            : "";

    }


    function getPlayButton() {

        return document.querySelector(
            '[data-testid="control-button-playpause"]'
        );

    }


    function isPlaying() {

        const button = getPlayButton();

        if (!button) return false;


        const label =
            button.getAttribute("aria-label")
            || "";


        return label.toLowerCase() === "pause";

    }


    function clickPlayPause() {

        const button = getPlayButton();

        if (!button) {

            log("Play button unavailable");

            return false;

        }


        button.click();

        return true;

    }


    /*
    ============================================================
        TRACK CHANGE HANDLING
    ============================================================
    */

    function handleTrackChange(newTrack) {


        if (!enabled)
            return;


        if (!newTrack)
            return;


        if (newTrack === currentTrack)
            return;


        currentTrack = newTrack;


        log(
            "Detected new track:",
            newTrack
        );


        startPauseCycle();

    }



    /*
    ============================================================
        MAIN PAUSE / RESUME CYCLE
    ============================================================
    */

    function startPauseCycle() {


        clearTimers();


        isWaiting = true;


        // Give Spotify a moment to fully switch tracks

        setTimeout(() => {


            if (!enabled)
                return;


            if (isPlaying()) {

                clickPlayPause();

                log("Playback paused");

            }


            secondsRemaining =
                CONFIG.pauseDurationSeconds;


            updatePanel();


            countdownTimer =
                setInterval(() => {


                    secondsRemaining--;

                    updatePanel();


                    if (secondsRemaining <= 0) {

                        clearInterval(countdownTimer);

                    }


                }, 1000);



            pauseTimer =
                setTimeout(() => {


                    if (!enabled)
                        return;


                    if (!isPlaying()) {

                        clickPlayPause();

                        log(
                            "Playback resumed"
                        );

                    }


                    isWaiting = false;

                    updatePanel();


                }, CONFIG.pauseDurationSeconds * 1000);



        }, 300);


    }



    function clearTimers() {


        if (pauseTimer) {

            clearTimeout(pauseTimer);

            pauseTimer = null;

        }


        if (countdownTimer) {

            clearInterval(countdownTimer);

            countdownTimer = null;

        }


    }


    /*
    ============================================================
        MUTATION OBSERVER
    ============================================================
    */


    function startObserver() {


        if (observerStarted)
            return;


        observerStarted = true;


        const observer =
            new MutationObserver(() => {


                const track =
                    getTrackTitle();


                if (track) {

                    handleTrackChange(track);

                }


            });



        observer.observe(
            document.body,
            {
                childList:true,
                subtree:true
            }
        );


        log(
            "MutationObserver started"
        );

    }



    /*
    ============================================================
        FALLBACK MONITOR
    ============================================================
    */


    setInterval(() => {


        const track =
            getTrackTitle();


        if (track) {

            handleTrackChange(track);

        }


    }, CONFIG.fallbackIntervalMs);



    /*
    ============================================================
        STARTUP
    ============================================================
    */


    function initialize() {


        log(
            "Spotify delay automation loaded"
        );


        currentTrack =
            getTrackTitle();


        startObserver();


    }


    initialize();


    // UI continues in Part 2
    /*
    ============================================================
        FLOATING CONTROL PANEL
    ============================================================
    */


    let panel = null;
    let statusText = null;
    let countdownText = null;
    let toggleButton = null;


    function createPanel() {

        if (!CONFIG.showPanel)
            return;


        panel = document.createElement("div");

        panel.id = "spotify-delay-panel";


        panel.innerHTML = `

            <div id="spotify-delay-header">
                🎵 Spotify Delay
            </div>

            <div>
                Status:
                <span id="spotify-delay-status">
                    Starting...
                </span>
            </div>

            <div style="margin-top:8px">
                Resume:
                <span id="spotify-delay-countdown">
                    --
                </span>
            </div>

            <button id="spotify-delay-toggle">
                Disable
            </button>

        `;


        Object.assign(panel.style, {

            position:"fixed",
            right:"20px",
            bottom:"20px",

            width:"190px",

            padding:"12px",

            background:"#181818",

            color:"#ffffff",

            fontFamily:"Arial, sans-serif",

            fontSize:"13px",

            borderRadius:"10px",

            zIndex:"999999",

            boxShadow:
                "0 4px 20px rgba(0,0,0,.5)"

        });



        const header =
            panel.querySelector(
                "#spotify-delay-header"
            );


        Object.assign(header.style, {

            fontWeight:"bold",

            cursor:"move",

            marginBottom:"10px"

        });



        statusText =
            panel.querySelector(
                "#spotify-delay-status"
            );


        countdownText =
            panel.querySelector(
                "#spotify-delay-countdown"
            );


        toggleButton =
            panel.querySelector(
                "#spotify-delay-toggle"
            );



        toggleButton.onclick =
            toggleAutomation;



        document.body.appendChild(panel);


        enableDragging(
            panel,
            header
        );


        updatePanel();


    }



    /*
    ============================================================
        PANEL UPDATES
    ============================================================
    */


    function updatePanel() {


        if (!panel)
            return;



        if (!enabled) {


            statusText.textContent =
                "Disabled";


            countdownText.textContent =
                "--";


            toggleButton.textContent =
                "Enable";


            return;

        }



        toggleButton.textContent =
            "Disable";



        if (isWaiting) {


            statusText.textContent =
                "Paused";


            countdownText.textContent =
                formatTime(
                    secondsRemaining
                );


        }
        else {


            statusText.textContent =
                "Monitoring";


            countdownText.textContent =
                "--";


        }


    }



    function formatTime(seconds) {


        const minutes =
            Math.floor(seconds / 60);


        const secs =
            seconds % 60;


        return (

            String(minutes)
                .padStart(2,"0")

            +

            ":" +

            String(secs)
                .padStart(2,"0")

        );

    }



    /*
    ============================================================
        ENABLE / DISABLE
    ============================================================
    */


    function toggleAutomation() {


        enabled = !enabled;


        GM_setValue(
            "enabled",
            enabled
        );


        log(
            enabled
            ? "Automation enabled"
            : "Automation disabled"
        );



        if (!enabled) {

            clearTimers();

            isWaiting = false;

        }


        updatePanel();

    }




    /*
    ============================================================
        DRAGGABLE PANEL
    ============================================================
    */


    function enableDragging(
        element,
        handle
    ) {


        let offsetX = 0;
        let offsetY = 0;
        let dragging = false;



        const saved =
            GM_getValue(
                "panelPosition",
                null
            );



        if (saved) {

            element.style.left =
                saved.left;

            element.style.top =
                saved.top;

            element.style.right =
                "auto";

            element.style.bottom =
                "auto";

        }



        handle.addEventListener(
            "mousedown",
            e => {


                dragging = true;


                offsetX =
                    e.clientX -
                    element.offsetLeft;


                offsetY =
                    e.clientY -
                    element.offsetTop;


            }
        );



        document.addEventListener(
            "mousemove",
            e => {


                if (!dragging)
                    return;


                element.style.left =
                    (
                        e.clientX -
                        offsetX
                    )
                    + "px";



                element.style.top =
                    (
                        e.clientY -
                        offsetY
                    )
                    + "px";


                element.style.right =
                    "auto";


                element.style.bottom =
                    "auto";


            }
        );



        document.addEventListener(
            "mouseup",
            () => {


                if (!dragging)
                    return;


                dragging = false;


                GM_setValue(
                    "panelPosition",
                    {
                        left:
                            element.style.left,

                        top:
                            element.style.top

                    }
                );


            }
        );

    }



    /*
    ============================================================
        START PANEL
    ============================================================
    */


    createPanel();



    /*
    ============================================================
        FINAL STARTUP MESSAGE
    ============================================================
    */


    log(
        "Advanced Spotify Delay ready"
    );
})();