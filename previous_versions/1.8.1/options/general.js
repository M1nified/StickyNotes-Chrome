$(document).ready(function(){
	var currentPage = window.location.href.match(/\w+\.html/i)[0];
	$(".menu1>a[href='"+currentPage+"']").addClass("current");
})