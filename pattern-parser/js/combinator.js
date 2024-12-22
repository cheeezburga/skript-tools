export default class Combinator {
	generate(node, inheritedTags = []) {
		switch (node.type) {
			case "SequenceNode":
				return this.combineSequences(node.nodes, inheritedTags);
			case "OptionalNode":
				const withNode = this.generate(node.node, inheritedTags);
				const withoutNode = [{ text: "", tags: [...inheritedTags] }];
				return withNode.concat(withoutNode);
			case "ChoiceNode":
				let results = [];
				for (const choice of node.choices) {
					const choiceResults = this.generate(choice, inheritedTags);
					results = results.concat(choiceResults);
				}
				return results;
			case "ParseTagNode":
				const parseResults = this.generate(node.node, inheritedTags);
				for (const result of parseResults) {
					const tagToAdd = node.tagName !== null ? node.tagName : result.text.trim();
					result.tags.push(tagToAdd);
				}
				return parseResults;
			case "TextNode":
				return [{ text: node.text, tags: [...inheritedTags] }];
			case "WhitespaceNode":
				return [{ text: node.value, tags: [...inheritedTags] }];
			default:
				throw new Error(`Unknown node type: ${node.type}`);
		}
	}

	combineSequences(nodes, inheritedTags) {
		if (nodes.length === 0) return [{ text: "", tags: [...inheritedTags] }];

		let results = this.generate(nodes[0], inheritedTags);

		for (let i = 1; i < nodes.length; i++) {
			const nextResults = this.generate(nodes[i], inheritedTags);
			const combinedResults = [];

			for (const res1 of results) {
				for (const res2 of nextResults) {
					combinedResults.push({
						text: res1.text + res2.text,
						tags: [...new Set([...res1.tags, ...res2.tags])]
					});
				}
			}

			results = combinedResults;
		}

		return results;
	}

	estimate(node) {
		switch (node.type) {
			case "SequenceNode":
				return node.nodes.reduce((acc, child) => acc * this.estimate(child), 1);
			case "OptionalNode":
				return this.estimate(node.node) + 1;
			case "ChoiceNode":
				return node.choices.reduce((acc, choice) => acc + this.estimate(choice), 0);
			case "ParseTagNode":
				return this.estimate(node.node);
			case "TextNode":
			case "WhitespaceNode":
				return 1;
			default:
				throw new Error(`Unknown node type: ${node.type}`);
		}
	}
}
