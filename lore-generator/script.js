document.addEventListener('DOMContentLoaded', function () {
	const themeToggle = document.getElementById('theme-toggle');
	const loreTextarea = document.getElementById('lore-textarea');
	const previewContent = document.getElementById('preview-content');
	const codeContainer = document.getElementById('code-container');
	const copyCodeButton = document.getElementById('copy-code');
	const copyNotification = document.getElementById('copy-notification');
	const saveLoreButton = document.getElementById('save-lore');
	const savedLoresContainer = document.getElementById('saved-lores-container');
	const savedLoresBox = document.getElementById('saved-lores');

	themeToggle.addEventListener('click', function () {
		document.body.classList.toggle('dark-mode');
		const isDarkMode = document.body.classList.contains('dark-mode');
		themeToggle.textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
		localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
	});

	if (localStorage.getItem('theme') === 'dark') {
		document.body.classList.add('dark-mode');
		themeToggle.textContent = 'Switch to Light Mode';
	}

	loreTextarea.addEventListener('input', updateOutput);

	function updateOutput() {
		const loreLines = loreTextarea.value.split('\n');
		updateLivePreview(loreLines);
		codeContainer.textContent = generateSkriptCode(loreLines);
	}

	function updateLivePreview(loreLines) {
		previewContent.innerHTML = '';
		loreLines.forEach(line => {
			const lineElement = document.createElement('div');
			lineElement.classList.add('preview-line');
			lineElement.innerHTML = parseSkriptFormatting(line);
			previewContent.appendChild(lineElement);
		});
	}

	function parseSkriptFormatting(text) {
		let result = '';
		let formatting = {
			color: '#AA00AA',
			bold: false,
			italic: true,
			underline: false,
			strikethrough: false,
			obfuscated: false
		};

		const colorCodes = {
			'&0': '#000000',
			'&1': '#0000AA',
			'&2': '#00AA00',
			'&3': '#00AAAA',
			'&4': '#AA0000',
			'&5': '#AA00AA',
			'&6': '#FFAA00',
			'&7': '#AAAAAA',
			'&8': '#555555',
			'&9': '#5555FF',
			'&a': '#55FF55',
			'&b': '#55FFFF',
			'&c': '#FF5555',
			'&d': '#FF55FF',
			'&e': '#FFFF55',
			'&f': '#FFFFFF'
		};

		const formattingCodes = {
			'&l': 'bold',
			'&o': 'italic',
			'&n': 'underline',
			'&m': 'strikethrough',
			'&k': 'obfuscated',
			'&r': 'reset'
		};

		const skriptColors = {
			'black': '#000000',
			'dark_blue': '#0000AA',
			'dark_green': '#00AA00',
			'dark_aqua': '#00AAAA',
			'dark_red': '#AA0000',
			'dark_purple': '#AA00AA',
			'gold': '#FFAA00',
			'gray': '#AAAAAA',
			'dark_gray': '#555555',
			'blue': '#5555FF',
			'green': '#55FF55',
			'aqua': '#55FFFF',
			'red': '#FF5555',
			'light_purple': '#FF55FF',
			'yellow': '#FFFF55',
			'white': '#FFFFFF'
		};

		const skriptFormatting = {
			'bold': 'bold',
			'italic': 'italic',
			'underline': 'underline',
			'strikethrough': 'strikethrough',
			'obfuscated': 'obfuscated',
			'reset': 'reset'
		};

		const parts = text.split(/(&[0-9a-fk-or])|(<#?[0-9a-fA-F]{6}>|<[^>]+>)/gi).filter(Boolean);

		parts.forEach(part => {
			if (part.match(/^&[0-9a-fk-or]$/i)) {
				const code = part.toLowerCase();
				if (code === '&r') {
					formatting = { color: '#AA00AA', bold: false, italic: true, underline: false, strikethrough: false, obfuscated: false };
				} else if (colorCodes[code]) {
					formatting.color = colorCodes[code];
					formatting.italic = false;
				} else if (formattingCodes[code]) {
					if (formattingCodes[code] === 'reset') {
						formatting = { color: '#AA00AA', bold: false, italic: true, underline: false, strikethrough: false, obfuscated: false };
					} else {
						formatting[formattingCodes[code]] = true;
					}
				}
			} else if (part.match(/^<.*>$/)) {
				const tagContent = part.slice(1, -1).toLowerCase();
				if (tagContent === 'reset') {
					formatting = { color: '#AA00AA', bold: false, italic: true, underline: false, strikethrough: false, obfuscated: false };
				} else if (skriptColors[tagContent]) {
					formatting.color = skriptColors[tagContent];
					formatting.italic = false;
				} else if (tagContent.match(/^#[0-9a-fA-F]{6}$/)) {
					formatting.color = tagContent;
					formatting.italic = false;
				} else if (skriptFormatting[tagContent]) {
					formatting[skriptFormatting[tagContent]] = true;
				} else {
					result += formatSpan(part, formatting);
				}
			} else {
				result += formatSpan(part, formatting);
			}
		});

		function formatSpan(content, formatting) {
			let style = `color: ${formatting.color};`;
			if (formatting.bold)
				style += 'font-weight: 900;';
			if (formatting.italic)
				style += 'font-style: italic;';
			let classes = [];
			if (formatting.obfuscated)
				classes.push('obfuscated');
			if (formatting.underline)
				classes.push('underline');
			if (formatting.strikethrough)
				classes.push('strikethrough');
			const classAttr = classes.length ? ` class='${classes.join(' ')}'` : '';
			return `<span style='${style}'${classAttr}>${escapeHtml(content)}</span>`;
		}

		return result;
	}

	function escapeHtml(text) {
		const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
		return text.replace(/[&<>]/g, m => map[m]);
	}

	setInterval(() => {
		document.querySelectorAll('.obfuscated').forEach(element => {
			element.textContent = obfuscateText(element.textContent);
		});
	}, 10);

	function obfuscateText(text) {
		const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789ÄÖÕ';
		return text.replace(/./g, char => (char === ' ' ? ' ' : chars.charAt(Math.floor(Math.random() * chars.length))));
	}

	function generateSkriptCode(loreLines) {
		if (!loreLines.length)
			return '';

		let code = 'set lore of {_item} to ';
		const formattedLines = loreLines.map(line => `"${line.replace(/"/g, '""')}"`);
		if (formattedLines.length === 1) {
			code += formattedLines[0];
		} else if (formattedLines.length === 2) {
			code += formattedLines.join(' and ');
		} else {
			code += formattedLines.slice(0, -1).join(', ') + ' and ' + formattedLines.slice(-1);
		}
		return code;
	}

	copyCodeButton.addEventListener('click', function () {
		const code = codeContainer.textContent.trim();
		if (!code)
			return;
		navigator.clipboard.writeText(code).then(showCopyNotification);
	});

	function showCopyNotification() {
		copyNotification.classList.add('show');
		setTimeout(() => copyNotification.classList.remove('show'), 2000);
	}

	let savedLores = [];

	loadSavedLores();

	saveLoreButton.addEventListener('click', function () {
		const code = codeContainer.textContent.trim();
		const text = loreTextarea.value;
		if (code && !savedLores.some(lore => lore.code === code)) {
			savedLores.push({ code, text });
			saveLoresToLocalStorage();
			updateSavedLores();
		}
	});

	function updateSavedLores() {
		savedLoresContainer.innerHTML = '';
		savedLoresBox.style.display = savedLores.length ? '' : 'none';
		savedLores.forEach(lore => {
			const loreDiv = document.createElement('div');
			loreDiv.classList.add('saved-lore');

			const codePre = document.createElement('pre');
			codePre.textContent = lore.code;
			loreDiv.appendChild(codePre);

			const buttonGroup = document.createElement('div');
			buttonGroup.classList.add('button-group');
			buttonGroup.classList.add('column');

			const restoreButton = document.createElement('button');
			restoreButton.textContent = 'Restore';
			restoreButton.addEventListener('click', function () {
				loreTextarea.value = lore.text;
				updateOutput();
				window.scrollTo(0, 0);
			});

			const copyButton = document.createElement('button');
			copyButton.textContent = 'Copy';
			copyButton.addEventListener('click', function () {
				navigator.clipboard.writeText(lore.code).then(showCopyNotification);
			});

			const deleteButton = document.createElement('button');
			deleteButton.textContent = 'Delete';
			deleteButton.addEventListener('click', function () {
				savedLores = savedLores.filter((l) => l.code !== lore.code);
				saveLoresToLocalStorage();
				updateSavedLores();
			});

			const container = document.createElement('div');
			container.classList.add('lore-container');
			loreDiv.appendChild(container);

			createLorePreview(container, lore.text);

			buttonGroup.appendChild(copyButton);
			buttonGroup.appendChild(restoreButton);
			buttonGroup.appendChild(deleteButton);
			loreDiv.appendChild(buttonGroup);
			savedLoresContainer.appendChild(loreDiv);
		});
	}

	function saveLoresToLocalStorage() {
		localStorage.setItem('savedLores', JSON.stringify(savedLores));
	}

	function loadSavedLores() {
		const saved = localStorage.getItem('savedLores');
		if (saved) {
			savedLores = JSON.parse(saved);
			updateSavedLores();
		}
	}

	function createLorePreview(parent, text) {
		const previewContainer = document.createElement('div');
		previewContainer.classList.add('preview-tooltip');
		const preview = document.createElement('div');
		previewContainer.appendChild(preview);
		const lines = text.split('\n');
		lines.forEach((line) => {
			const lineElement = document.createElement('div');
			lineElement.classList.add('preview-line');
			lineElement.innerHTML = parseSkriptFormatting(line);
			preview.appendChild(lineElement);
		});
		parent.appendChild(previewContainer);
	}

	updateOutput();
});
