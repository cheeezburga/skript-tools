const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const Lexer = require('./lexer');
const Parser = require('./parser');
const Combinator = require('./combinator');
const ResultProcessor = require('./resultProcessor');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/parse', (req, res) => {
	const { pattern } = req.body;

	try {
		const lexer = new Lexer(pattern);
		const tokens = lexer.tokenize();

		const parser = new Parser(tokens);
		const ast = parser.parse();

		const combinator = new Combinator();
		const estimatedCombinations = combinator.estimate(ast);

		const MAX_ALLOWED_COMBINATIONS = 100000; // should probably be lower?

		if (estimatedCombinations > MAX_ALLOWED_COMBINATIONS) {
			return res.json({
				results: [],
				totalPatterns: estimatedCombinations,
				longestPattern: 0,
				shortestPattern: 0,
				averagePattern: 0,
				uniqueParseTags: [],
				message: 'Too many combinations!',
			});
		}

		const combinations = combinator.generate(ast);

		const processor = new ResultProcessor();
		const result = processor.process(combinations);

		res.json(result);
	} catch (error) {
		res.json({ error: 'Invalid syntax pattern!' });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
