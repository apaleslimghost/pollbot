const {send} = require('micro');
const route = require('boulevard');
const parseSlackBody = require('@quarterto/slack-body');
const url = require('url');
const fetch = require('node-fetch');

const randomId = () => Math.floor(parseInt('zzzzzzzz', 36) * Math.random()).toString(36);

const polls = new Map();

const renderPoll = poll => ({
	response_type: 'in_channel',
	attachments: [{
		text: poll.question,
		footer: `Don\'t get excited yet, I\'m just testing ${randomId()}`,
		callback_id: poll.id,
		attachment_type: 'default',
		actions: poll.options.map((option, i) => Object.assign({}, option, {
			text: `${option.label} ${option.count || ''}`,
			type: 'button',
			label: undefined,
			count: undefined,
		})),
	}],
});

const votePoll = poll => action => {
	poll.options.forEach(pollAction => {
		if(action.name === pollAction.name && action.value == pollAction.value) {
			pollAction.count++;
		}
	})
};

module.exports = route({
	async '/create'(req, res) {
		const body = await parseSlackBody(req);
		const [question, ...options] = body.text.split(',');
		const id = randomId();

		const poll = {
			id,
			question,
			options: options.map((option, i) => ({
				name: 'option',
				label: option,
				value: i,
				count: 0,
			})),
		};

		polls.set(id, poll);

		return renderPoll(poll);
	},

	async '/respond'(req, res) {
		const {payload} = await parseSlackBody(req);
		const {actions, callback_id} = JSON.parse(payload);
		const poll = polls.get(callback_id);
		actions.forEach(votePoll(poll));
		return renderPoll(poll);
	},

	async '/oauth'(req, res) {
		const {query} = url.parse(req.url, true);

		const response = await fetch(url.format({
			protocol: 'https',
			hostname: 'slack.com',
			pathname: '/api/oauth.access',
			query: {
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				code: query.code,
				redirect_uri: query.redirect_uri,
			}
		}));

		return response.json();
	}
});
