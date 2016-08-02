$(document).ready(function(){
	console.log("READY")
	navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.webkitGetUserMedia({
		audio: true,
	}, function(stream) {
		console.log("GRANTED")
		stream.stop();
    // Now you know that you have audio permission. Do whatever you want...
}, function() {
	console.log("DENIED")
    // Aw. No permission (or no microphone available).
});
})