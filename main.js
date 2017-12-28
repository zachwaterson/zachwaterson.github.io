$(window).load(function() {

    // Bind window resize to redrawing flow of water
    $(window).resize(resizeWaterFlow);
    resizeWaterFlow();

    // Animate spigot
    new Vivus('spigot', {duration: 100, type: 'async', pathTimingFunction: Vivus.EASE_OUT, animTimingFunction: Vivus.EASE}, null);
    setTimeout(spinSpigot, 750); // spin spigot when it's almost finished drawing
    setTimeout(pulseSun, 750); // Pulse sun when it's finished drawing
    window.setInterval(animateWater, 15); // ~60 fps

});

// ----------------- Sun functions --------------------

function pulseSun() {
    var rays = $(document.getElementById("sun").contentDocument.getElementById("sun-and-rays")).children("path");
    rays.each(function(index, ray) {
        $(ray).attr("class", "pulse"); // add pulse CSS
        var randomOffset = ((1.5 - Math.random())) // each ray pulses at slightly random
        $(ray).attr("style", "animation-duration: " + randomOffset + "s");
    })

}


// ----------------- Water functions ------------------

function spigotClicked() {
    spinSpigot();
    toggleWater();
}

function spinSpigot() {
    var handle_path = document.getElementById("spigot").contentDocument.getElementById("spigot-handle");
    $(handle_path).attr("class", "spin");

    var animationDuration = 1000 // in ms, needs to match CSS in SVG file (which is in seconds)
    // remove class once animation finishes
    window.setTimeout(function() {$(handle_path).removeAttr("class");}, animationDuration);
}

function toggleWater() {
    spigotOpen = !spigotOpen;
    framesSinceHandleFlipped = 0;

}

function resizeWaterFlow() {
    if ($(window).width() < 768) { // small viewport, same as bootstrap
        // water flows down through the sun
        $("#water").height($(document).height() - $("#headline").height() - $("#spigot").height());
    } else {
        // water flows down to the end of the viewport
        $("#water").height($("#viewport").height() - $("#headline").height() - $("#spigot").height());
    }

    // adjust the lateral density of the waterfall based on width of spigot
    numberOfColumns = Math.floor($("#water").width() / waterLineWidth);
}

// constants for animation
var waterLines = [];
var waterLineWidth = 10; // in points
var numberOfColumns = 4; // varies with width of spigot
var numberOfWaterLineSegments = 24; // How varied the length of the water can be (length will be determined in segments)
var longestWaterSegment = numberOfWaterLineSegments / 4; // Longest line will be a quarter of the total waterfall length
var startingVelocity = 20;

var desiredAmountOfWater = 30; // amount for animation to build up to
var waterFlowFullTimeframe = 15; // Lower number means steeper curve to full water flow, tweak as needed
var framesSinceHandleFlipped = -60; // initial delay
var spigotOpen = true;

function waterAtTime(t, maxWater, timeToFull) {
    var flowDirection = spigotOpen ? -1 : 1; // reflect the function along the y-axis
    // Need to translate function so it maps neatly to a frame t
    var translationAmount = 3 * (spigotOpen ? 1 : -1); // negative to translate the other way if needed
    // sigmoid so water flow acceleration is S-shaped
    timeToFull = timeToFull * (spigotOpen ? 1 : 1.5); // Slow down the flow if we've closed it
    var exactValue = maxWater/(1+Math.pow(Math.E, ((t/timeToFull)*flowDirection) + translationAmount));
    return Math.floor(exactValue);
}

function WaterLine(x, y, column, lengthInSegments, width, velocity) {
    this.x = x;
    this.y = y;
    this.column = column;
    this.lengthInSegments = lengthInSegments;
    this.width = width;
    this.endRadius = this.width
    this.velocity = velocity;
    this.color = "#4A90E2";
    this.lengthInPoints = function() {
        var lengthInPoints = (document.getElementById("water-canvas").height / numberOfWaterLineSegments) * this.lengthInSegments; // cut waterfall height into length of one "segment" then multiply by length in segments to get point length
        return lengthInPoints
    }
    return this;
}
function createNewWaterLine() {
    // determine which column at random
    var column = Math.floor(Math.random() * numberOfColumns);
    var lengthInSegments = Math.floor(Math.random() * longestWaterSegment) + 1; // how much of the waterfall should the line take up, as a fraction of the longest a line can be

    waterLines.push(new WaterLine(0, 0, column, lengthInSegments, waterLineWidth, startingVelocity));
}

function animateWater() {

    var canvas = document.getElementById("water-canvas");
    var context = canvas.getContext('2d');

    clearAndSizeCanvasAndContext(canvas, context);

    // add a line if the functions says to do so
    if (waterLines.length < waterAtTime(framesSinceHandleFlipped, desiredAmountOfWater, waterFlowFullTimeframe)) {
        createNewWaterLine();
    }

    advanceWaterLines(canvas, context);
    drawWaterLines(canvas, context);

    framesSinceHandleFlipped += 1;
}

function advanceWaterLines(canvas, context) {
    var waterToKeep = [];
    $.each(waterLines, function(index, line) {
        // keep the line if it's still onscreen
        if (line.y < canvas.height && line.column <= numberOfColumns) {
            waterToKeep.push(line);
        }
        line.y += line.velocity;
    })
    waterLines = waterToKeep;
}

function clearAndSizeCanvasAndContext(canvas, context) {
    // to support Retina displays
    canvas.width = $("#water").width() * backingScale();
    canvas.height = $("#water").height() * backingScale();

    context.clearRect(0, 0, canvas.width, canvas.height);
}


function drawWaterLines(canvas, context) {

    // how far apart in points should the columns be
    var columnSpacing = canvas.width / (numberOfColumns - 1);

    $.each(waterLines, function(index, line) {
        line.x = columnSpacing * line.column;
        if (line.column == numberOfColumns - 1) { // last column, have to push it left to make it inclusive
            line.x -= line.width;
        } else if (line.column == 0) {
            line.x += line.width; // first column, have to push it right to make it inclusive
        }
        context.strokeStyle = line.color;
        context.beginPath();
        context.lineWidth = line.width;
        context.lineCap="round";
        context.moveTo(line.x, line.y);
        context.lineTo(line.x, line.y + line.lengthInPoints());
        context.stroke();
    })
}

function backingScale(context) {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}