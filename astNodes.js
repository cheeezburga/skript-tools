class SequenceNode {
	constructor(nodes) {
		this.type = 'SequenceNode';
		this.nodes = nodes;
	}
}

class OptionalNode {
	constructor(node) {
		this.type = 'OptionalNode';
		this.node = node;
	}
}

class ChoiceNode {
	constructor(choices) {
		this.type = 'ChoiceNode';
		this.choices = choices;
	}
}

class ParseTagNode {
	constructor(node) {
		this.type = 'ParseTagNode';
		this.node = node;
	}
}

class TextNode {
	constructor(text) {
		this.type = 'TextNode';
		this.text = text;
	}
}

class WhitespaceNode {
	constructor(value) {
		this.type = 'WhitespaceNode';
		this.value = value;
	}
}

module.exports = {
	SequenceNode,
	OptionalNode,
	ChoiceNode,
	ParseTagNode,
	TextNode,
	WhitespaceNode,
};
