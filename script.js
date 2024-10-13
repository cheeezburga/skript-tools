import Lexer from './js/lexer.js';
import Parser from './js/parser.js';
import Combinator from './js/combinator.js';
import ResultProcessor from './js/resultProcessor.js';

let tooltip;

document.addEventListener('DOMContentLoaded', () => {
	const patternInput = document.getElementById('pattern');
	patternInput.addEventListener('input', debounce(parsePattern, 5));

	tooltip = document.getElementById('tooltip');

	initializeTheme();
	const themeToggleButton = document.getElementById('theme-toggle');
	themeToggleButton.addEventListener('click', toggleTheme);
});

// this is basically a limit on how often parsePattern should be called
function debounce(func, delay) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), delay);
	};
}

function parsePattern() {
	const pattern = document.getElementById('pattern').value;
	const statsContent = document.getElementById('statsContent');
	const patternsContent = document.getElementById('patternsContent');

	// no pattern :(
	if (!pattern.trim()) {
		patternsContent.innerText = 'Enter a pattern to get started.';
		statsContent.innerHTML = '';
		return;
	}

	try {
		const lexer = new Lexer(pattern);
		const tokens = lexer.tokenize();

		const parser = new Parser(tokens);
		const ast = parser.parse();

		const combinator = new Combinator();
		const estimatedCombinations = combinator.estimate(ast);

		const MAX_COMBINATIONS = 100000;

		if (estimatedCombinations > MAX_COMBINATIONS) {
			displayError('Too many combinations!');
			return;
		}

		const variants = combinator.generate(ast);

		const processor = new ResultProcessor();
		const data = processor.process(variants);

		displayResults(data);
	} catch (error) {
		displayError('Invalid syntax pattern!');
	}
}

function displayResults(data) {
	const {
		results,
		totalPatterns,
		longestPattern,
		shortestPattern,
		averagePattern,
		uniqueParseTags,
	} = data;

	const statsContent = document.getElementById('statsContent');
	const patternsContent = document.getElementById('patternsContent');
	
	patternsContent.innerHTML = '';

	// update the stats part

	let stats = `<p>Total Patterns: ${totalPatterns}</p>`;
	stats += `<p>Longest Pattern Length: ${longestPattern} characters</p>`;
	stats += `<p>Shortest Pattern Length: ${shortestPattern} characters</p>`;
	stats += `<p>Average Pattern Length: ${averagePattern} characters</p>`;

	if (uniqueParseTags.length > 0)
		stats += `<p>Unique Parse Tags: ${uniqueParseTags.join(', ')}</p>`;

	if (totalPatterns > results.length)
		stats += `<p>Displaying first ${results.length} of ${totalPatterns} patterns.</p>`;

	statsContent.innerHTML = stats;

	// sort by length ascending, looks nicer imo
	results.sort((a, b) => a.text.length - b.text.length);

	const ul = document.createElement('ul');
	patternsContent.appendChild(ul);

	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		const li = document.createElement('li');
		li.className = 'result';

		// replace double spaces with single spaces
		const patternText = result.text.trim().replace(/\s+/g, ' ');

		li.textContent = patternText;

		li.addEventListener('mouseenter', (e) => {
			if (result.tags.length > 0) {
				tooltip.innerHTML = `<strong>Parse Tags:</strong><br>${result.tags.join(', ')}`;
				tooltip.style.display = 'block';
				positionTooltip(e);
			}
		});

		li.addEventListener('mousemove', (e) => {
			positionTooltip(e);
		});

		li.addEventListener('mouseleave', () => {
			tooltip.style.display = 'none';
		});

		ul.appendChild(li);
	}
}

function positionTooltip(e) {
	const tooltipWidth = tooltip.offsetWidth;
	const tooltipHeight = tooltip.offsetHeight;
	const pageWidth = window.innerWidth;
	const pageHeight = window.innerHeight;

	let x = e.clientX + 15;
	let y = e.clientY + 15;

	// account if out of bounds
	if (x + tooltipWidth > pageWidth)
		x = e.clientX - tooltipWidth - 15;
	if (y + tooltipHeight > pageHeight)
		y = e.clientY - tooltipHeight - 15;

	tooltip.style.left = x + 'px';
	tooltip.style.top = y + 'px';
}

function displayError(message) {
	const patternsContent = document.getElementById('patternsContent');
	const statsContent = document.getElementById('statsContent');

	patternsContent.innerHTML = `<p class="error">${message}</p>`;
	statsContent.innerHTML = '';
}

function initializeTheme() {
	const theme = localStorage.getItem('theme') || 'light';
	const body = document.body;
	const themeToggleButton = document.getElementById('theme-toggle');

	if (theme === 'dark') {
		body.classList.add('dark-mode');
		themeToggleButton.textContent = 'Switch to Light Mode';
	} else {
		body.classList.remove('dark-mode');
		themeToggleButton.textContent = 'Switch to Dark Mode';
	}
}

function toggleTheme() {
	const body = document.body;
	const themeToggleButton = document.getElementById('theme-toggle');
	if (body.classList.contains('dark-mode')) {
		body.classList.remove('dark-mode');
		themeToggleButton.textContent = 'Switch to Dark Mode';
		localStorage.setItem('theme', 'light');
	} else {
		body.classList.add('dark-mode');
		themeToggleButton.textContent = 'Switch to Light Mode';
		localStorage.setItem('theme', 'dark');
	}
}
