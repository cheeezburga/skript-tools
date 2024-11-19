document.addEventListener("DOMContentLoaded", () => {
	const themeToggleButton = document.getElementById("theme-toggle");
	initializeTheme();
	themeToggleButton.addEventListener("click", toggleTheme);
});

function initializeTheme() {
	const theme = localStorage.getItem("theme") || "light";
	const body = document.body;
	const themeToggleButton = document.getElementById("theme-toggle");

	if (theme === "dark") {
		body.classList.add("dark-mode");
		themeToggleButton.textContent = "Switch to Light Mode";
	} else {
		body.classList.remove("dark-mode");
		themeToggleButton.textContent = "Switch to Dark Mode";
	}
}

function toggleTheme() {
	const body = document.body;
	const themeToggleButton = document.getElementById("theme-toggle");
	if (body.classList.contains("dark-mode")) {
		body.classList.remove("dark-mode");
		themeToggleButton.textContent = "Switch to Dark Mode";
		localStorage.setItem("theme", "light");
	} else {
		body.classList.add("dark-mode");
		themeToggleButton.textContent = "Switch to Light Mode";
		localStorage.setItem("theme", "dark");
	}
}
