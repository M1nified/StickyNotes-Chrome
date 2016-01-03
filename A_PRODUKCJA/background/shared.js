"use strict";

$(document).ready(function () {
	update();
	$("#btn-remove").on("click", function () {
		$.get(info.link_remove, function (result) {
			console.log(result);
			var data = null;
			try {
				data = JSON.parse(result);
			} catch (e) {}
			if (data && data.removed === true) {
				window.close();
			} else {
				$("div#alert").css("margin-top", "0px");
				$("div#alert p").empty().append("An error occurred while removing.<br>Your note might has not been removed.");
			}
		});
	});
	$("div#alert").on("click", function () {
		$("div#alert").css("margin-top", "-100vh");
	});
});
var update = function update() {
	console.log(info);
	$("#linker").attr("href", info.link_note);
	$("#link").attr("value", info.link_note);
	$("#qrcode").empty();
	var box = document.getElementById("qrcode");
	var qrcode = new QRCode(box, {
		text: info.link_note,
		width: 256,
		height: 256,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRCode.CorrectLevel.H
	});
};