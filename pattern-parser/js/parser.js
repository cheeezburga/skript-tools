import { SequenceNode, OptionalNode, ChoiceNode, ParseTagNode, TextNode, WhitespaceNode } from "./astNodes.js";

export default class Parser {
	constructor(tokens) {
		this.tokens = tokens;
		this.position = 0;
	}

	parse() {
		return this.parseSequence();
	}

	parseSequence(endToken = null) {
		const nodes = [];
		while (this.position < this.tokens.length && (endToken === null || this.tokens[this.position].type !== endToken)) {
			nodes.push(this.parseElement());
		}
		return new SequenceNode(nodes);
	}

	parseElement() {
		const token = this.tokens[this.position];

		if (token.type === "WHITESPACE") {
			this.position++;
			return new WhitespaceNode(token.value);
		} else if (token.type === "TEXT") {
			const nextToken = this.tokens[this.position + 1];
			if (nextToken?.type === ":") {
				const tagName = token.value;
				this.position += 2;
				const element = this.parseElement();
				return new ParseTagNode(tagName, element);
			} else {
				this.position++;
				return new TextNode(token.value);
			}
		} else if (token.type === ":") {
			this.position++;
			const element = this.parseElement();
			return new ParseTagNode(null, element);
		} else if (token.type === "[" || token.type === "(") {
			this.position++;
			const endTokenType = token.type === "[" ? "]" : ")";
			const isOptional = token.type === "[";
			return this.parseGroup(endTokenType, isOptional);
		} else {
			throw new Error(`Unexpected token: ${token.type}`);
		}
	}

	parseGroup(endTokenType, isOptional) {
		const choices = [];
		let currentSequence = [];

		while (this.position < this.tokens.length && this.tokens[this.position].type !== endTokenType) {
			if (this.tokens[this.position].type === "|") {
				this.position++;
				choices.push(new SequenceNode(currentSequence));
				currentSequence = [];
			} else {
				currentSequence.push(this.parseElement());
			}
		}

		if (currentSequence.length > 0) choices.push(new SequenceNode(currentSequence));

		this.expect(endTokenType);

		let node;
		if (choices.length > 1) {
			node = new ChoiceNode(choices);
		} else if (choices.length === 1) {
			node = choices[0];
		} else {
			node = new SequenceNode([]);
		}

		if (isOptional) node = new OptionalNode(node);

		return node;
	}

	expect(type) {
		const token = this.tokens[this.position];
		if (token && token.type === type) {
			this.position++;
		} else {
			throw new Error(`Expected token "${type}" but found "${token ? token.type : "EOF"}"`);
		}
	}
}
