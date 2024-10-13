import Lexer from './js/lexer.js';
import Parser from './js/parser.js';
import Combinator from './js/combinator.js';
import ResultProcessor from './js/resultProcessor.js';

document.addEventListener('DOMContentLoaded', () => {
	const patternInput = document.getElementById('pattern');
	patternInput.addEventListener('input', debounce(parsePattern, 5));
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
	const pattern = document.getElementById('pattern').value.trim();
	const statsDiv = document.getElementById('statsContent');
	const patternsDiv = document.getElementById('patternsContent');

	// no pattern :(
	if (!pattern) {
		patternsDiv.innerText = 'Please enter a pattern.';
		statsDiv.innerHTML = '';
		return;
	}

	try {
		const lexer = new Lexer(pattern);
		const tokens = lexer.tokenize();

		const parser = new Parser(tokens);
		const ast = parser.parse();

		const combinator = new Combinator();
		const estimatedCombinations = combinator.estimate(ast);

		const MAX_ALLOWED_COMBINATIONS = 100000; // Adjust as needed
		if (estimatedCombinations > MAX_ALLOWED_COMBINATIONS) {
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
		message,
	} = data;
	const statsDiv = document.getElementById('statsContent');
	const patternsDiv = document.getElementById('patternsContent');

	patternsDiv.innerHTML = '';

	// update the stats part

	let statsHtml = `<p>Total Patterns: ${totalPatterns}</p>`;

	if (message) {
		statsHtml += `<p class="error">${message}</p>`;
		if (statsDiv.innerHTML !== statsHtml) {
			statsDiv.innerHTML = statsHtml;
		}
		return;
	}

	statsHtml += `<p>Longest Pattern Length: ${longestPattern} characters</p>`;
	statsHtml += `<p>Shortest Pattern Length: ${shortestPattern} characters</p>`;
	statsHtml += `<p>Average Pattern Length: ${averagePattern} characters</p>`;
	if (uniqueParseTags.length > 0) {
		statsHtml += `<p>Unique Parse Tags: ${uniqueParseTags.join(', ')}</p>`;
	}
	
	if (totalPatterns > results.length) {
		statsHtml += `<p>Displaying first ${results.length} of ${totalPatterns} patterns.</p>`;
	}

	// no need to update the stats if theyre the same
	if (statsDiv.innerHTML !== statsHtml) {
		statsDiv.innerHTML = statsHtml;
	}

	// sort by length, looks nicer imo
	results.sort((a, b) => a.text.length - b.text.length);

	// update the possible patterns part, without clearing it
	let ul = patternsDiv.querySelector('ul');
	if (!ul) {
		ul = document.createElement('ul');
		patternsDiv.appendChild(ul);
	}

	// remove extras
	while (ul.children.length > results.length) {
		ul.removeChild(ul.lastChild);
	}

	// update the list
	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		let li;
		if (ul.children[i]) {
			li = ul.children[i];
		} else {
			li = document.createElement('li');
			li.className = 'result';
			ul.appendChild(li);
		}

		const strong = document.createElement('strong');
		strong.textContent = result.text;
		
		while (li.firstChild) {
			li.removeChild(li.firstChild);
		}
		
		li.appendChild(strong);

		if (result.tags.length > 0) {
			const tagsText = ` [Tags: ${result.tags.join(', ')}]`;
			li.appendChild(document.createTextNode(tagsText));
		}
	}
}

function displayError(message) {
	const patternsDiv = document.getElementById('patternsContent');
	const statsDiv = document.getElementById('statsContent');

	patternsDiv.innerHTML = `<p class="error">${message}</p>`;
	statsDiv.innerHTML = '';
}
