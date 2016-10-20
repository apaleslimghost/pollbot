const route = require('boulevard');
const parseSlackBody = require('@quarterto/slack-body');

const randomId = () => Math.floor(parseInt('zzzzzzzz', 36) * Math.random()).toString(36);

module.exports = route({
	async '/create'(req, res) {
		const body = await parseSlackBody(req);
		const [question, ...options] = body.text.split(',');
		const id = randomId();

		console.log(body);

		return {
			response_type: 'in_channel',
			attachments: [{
				text: question,
				footer: 'Don\'t get excited yet, I\'m just testing',
				callback_id: id,
				attachment_type: 'default',
				actions: options.map(option => ({
					name: option.toLowerCase(),
					text: option,
					type: 'button',
				}))
			}]
		};
	},
});
