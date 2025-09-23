function startSearch() {
	if (document.getElementById("searchword").textLength > 0) {
		document.getElementById("searchfield").style.display = "none";
		document.getElementById("waitingfield").style.display = "inline";
	}
}
