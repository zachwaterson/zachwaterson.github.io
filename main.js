var circles = []

$(document).ready(function() {	
	createRandomCircle()
	redrawCanvas()
});

$(window).resize(redrawCanvas)

window.setInterval(processCircles, 25)
window.setInterval(createRandomCircle, 2500)

function redrawCanvas() {
	var height = $(window).height()
	var width = $('#landing').width()

	$('#landing').css('height', height)

	var canvas = document.getElementById('landing-canvas')
	canvas.width = width
	canvas.height = height
	var context = canvas.getContext('2d')

    context.clearRect(0, 0, canvas.width, canvas.height);

	// draw circles
	$.each(circles, function(index, circle) {
		context.beginPath()
	    context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
	    context.fillStyle = circle.color()
	    context.fill()
	   	context.closePath()
	})
}

function circle(x, y, radius) {
	this.x = x
	this.y = y
	this.radius = radius
	this.opacity = function () {
		var maxRadius = 300.0
		var opacity = 1 - (this.radius / maxRadius)
		return opacity < 0 ? 0 : opacity
	}
	this.color = function () {
		return "rgba(0, 0, 0, " + this.opacity() + ")"
	}
}

function processCircles() {
	var circlesToKeep = []
	$.each(circles, function(index, circle) {
		circle.radius += 2
		if (circle.opacity() > 0) {
			circlesToKeep.push(circle)
			console.log(circle)
		}
	})
	circles = circlesToKeep
	redrawCanvas()
}

function createRandomCircle() {
	var x = Math.random() * $('#landing').width()
	var y = Math.random() * $(window).height()
	circles.push(new circle(x, y, 0))
}

function drawLine(context) {
	context.moveTo(width * 0.6, height * 0.3)
	var startLineX = width * 0.7
	var startLineY = height * 0.25
	var lineLength = height * 0.5
	var lineAngle = Math.PI/2.8
	var endLineX = lineLength * Math.cos(lineAngle) + startLineX
	var endLineY = lineLength * Math.sin(lineAngle) + startLineY

	context.moveTo(startLineX, startLineY)
	context.lineTo(endLineX, endLineY)
	context.stroke()
}

function backingScale(context) {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}